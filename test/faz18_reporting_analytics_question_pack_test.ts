/**
 * ERP CRM Discovery — FAZ-18 Reporting Analytics Question Pack Acceptance Test Suite
 *
 * Automated verification for:
 * 1. Pack Loading & Metadata Integrity (tr.reporting_analytics.core v0.1.0, canonical code = REPORTING_ANALYTICS)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (42 questions, sequential order 1..42, RPT-001..RPT-042)
 * 4. Required Question Count Truth (22 required, 20 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 19 Canonical Process Coverage
 * 7. Conditional Branching Resolution (branching engine with Map)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (verifying zero overlap with SALES, PROCUREMENT, WAREHOUSE, INVENTORY, LOGISTICS, ACCOUNTING, TREASURY and BUDGET_REPORTING)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("REPORTING_ANALYTICS") === "tr.reporting_analytics.core")
 */

import { readFileSync } from "fs";
import path from "path";
import { validateQuestionPack } from "../src/engine/validator";
import { getVisibleQuestions, isQuestionVisible } from "../src/engine/branching";
import { calculateProgress, isQuestionAnswered } from "../src/engine/progress";
import { adaptCustomQuestionToQuestion } from "../src/engine/customQuestionAdapter";
import { formatAnswer } from "../src/report/formatters";
import { getPackIdForFunction } from "../src/engine/loader";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import { PDFParse } from "pdf-parse";
import type { QuestionPack, Question, AnswerData, SelectedAnswer } from "../src/engine/types";
import type { ReportModel, ReportBusinessFunction, ReportProcess, ReportQuestionItem } from "../src/report/types";
import type { ProjectCustomQuestion, QuestionFollowup } from "../src/types";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

console.log("\n══════════════════════════════════════════════════");
console.log("FAZ-18: RAPORLAMA VE ANALİTİK / REPORTING_ANALYTICS TEST");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/reporting_analytics/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "Reporting Analytics pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.reporting_analytics.core", "pack_id = tr.reporting_analytics.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.schema_version === "1", "schema_version = 1");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "REPORTING_ANALYTICS", "business_function_code = REPORTING_ANALYTICS (Kanonik Kod)");
assert(pack.meta.name === "Raporlama ve Analitik Ön Analizi", "name = Raporlama ve Analitik Ön Analizi");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 20, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validationResult = validateQuestionPack(pack);
if (!validationResult.valid) {
  console.error("   Doğrulama hataları:", validationResult.errors);
}
assert(validationResult.valid === true, "validateQuestionPack(reportingAnalyticsPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity, Deterministic Order & IDs ────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 42, `Toplam soru sayısı tam 42 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 42, "Tüm 42 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `RPT-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: index ${i}, id: ${pack.questions[i].id}, order: ${pack.questions[i].order}`);
  }
}
assert(orderCorrect, "Tüm sorular RPT-001'den RPT-042'ye sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ─────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 22, `Zorunlu soru sayısı tam 22 adettir (${requiredQuestions.length})`);
assert(optionalQuestions.length === 20, `Opsiyonel soru sayısı tam 20 adettir (${optionalQuestions.length})`);

// ─── TEST 5: Choice Options & is_other Validation ────────────────────────────
console.log("\n=== T05: Choice Options & is_other Validation ===");
let optionsValid = true;
let isOtherNoteValid = true;

for (const q of pack.questions) {
  if (q.options) {
    const vals = q.options.map((o) => o.value);
    const uniqueVals = new Set(vals);
    if (vals.length !== uniqueVals.size) {
      optionsValid = false;
      console.error(`Tekrar eden seçenek değeri bulundu: soru ${q.id}`);
    }

    const otherOptions = q.options.filter((o) => o.is_other);
    if (otherOptions.length > 1) {
      optionsValid = false;
      console.error(`Birden fazla is_other seçeneği: soru ${q.id}`);
    }

    for (const opt of q.options) {
      if (opt.is_other && !opt.allow_note) {
        isOtherNoteValid = false;
        console.error(`is_other=true fakat allow_note=false: soru ${q.id}, opt ${opt.value}`);
      }
    }
  }
}
assert(optionsValid, "Tüm seçenek değerleri benzersiz ve en fazla 1 'Diğer' seçeneği içeriyor");
assert(isOtherNoteValid, "Tüm is_other=true seçeneklerinde allow_note=true kuralı sağlanıyor");

// ─── TEST 6: 19 Canonical Process Coverage ───────────────────────────────────
console.log("\n=== T06: 19 Canonical Process Coverage ===");
const expectedProcesses = [
  "Raporlama Organizasyonu",
  "Rapor Envanteri",
  "Veri Kaynakları",
  "Tek Doğruluk Kaynağı",
  "Veri Güncelliği",
  "Veri Kalitesi",
  "Veri Sahipliği",
  "Veri Modeli",
  "Veri Ambarı / Data Warehouse",
  "ETL / ELT ve Veri Yükleme",
  "BI ve Dashboard Platformları",
  "Self-Service Analytics",
  "Excel Bağımlılığı",
  "KPI Tanımları",
  "Rapor Yetkilendirme",
  "Rapor Dağıtımı",
  "Rapor Performansı",
  "Veri Lineage ve İzlenebilirlik",
  "Yönetim Karar Desteği",
];

const actualProcesses = Array.from(new Set(pack.questions.map((q) => q.process)));
assert(actualProcesses.length === 19, `Tam 19 farklı süreç grubu tanımlı (${actualProcesses.length})`);

for (const ep of expectedProcesses) {
  const exists = actualProcesses.includes(ep);
  assert(exists, `Süreç mevcut: "${ep}"`);
}

// ─── TEST 7: Branching Engine Resolution ─────────────────────────────────────
console.log("\n=== T07: Branching Engine Resolution ===");
const conditionalQuestions = pack.questions.filter((q) => q.condition);

for (const cq of conditionalQuestions) {
  const targetQ = pack.questions.find((q) => q.id === cq.condition!.question_id);
  assert(!!targetQ, `Condition referansı geçerli: ${cq.id} -> ${cq.condition!.question_id}`);
}

// Senaryo 1: Rapor envanteri yoksa RPT-004 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("RPT-003", { selected: [{ value: "rapor_envanteri_bulunmamaktadir" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "RPT-004"), "RPT-003=rapor_envanteri_bulunmamaktadir iken RPT-004 gizlendi");

answersScenario1.set("RPT-003", { selected: [{ value: "guncel_ve_belgelenmis_resmi_rapor_envanteri_mevcuttur" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "RPT-004"), "RPT-003=guncel... iken RPT-004 görünür");

// Senaryo 2: DWH kullanılmıyorsa RPT-018 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("RPT-017", { selected: [{ value: "veri_ambari_veya_data_mart_kullanilmamaktadir" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "RPT-018"), "RPT-017=veri_ambari...kullanilmamaktadir iken RPT-018 gizlendi");

answersScenario2.set("RPT-017", { selected: [{ value: "kurumsal_veri_ambari_dwh_ve_departman_data_martlari_aktif" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "RPT-018"), "RPT-017=kurumsal_veri_ambari... iken RPT-018 görünür");

// Senaryo 3: Otomatik ETL yoksa RPT-020 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("RPT-019", { selected: [{ value: "manuel_veri_aktarimi_veya_etl_yoktur" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "RPT-020"), "RPT-019=manuel_veri_aktarimi... iken RPT-020 gizlendi");

answersScenario3.set("RPT-019", { selected: [{ value: "otomatik_zamanlanmis_veya_cdc_veri_aktarim_araclari_ile_yurutulur" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "RPT-020"), "RPT-019=otomatik_zamanlanmis... iken RPT-020 görünür");

// Senaryo 4: BI platformu yoksa RPT-022 gizlenmeli
const answersScenario4 = new Map<string, AnswerData>();
answersScenario4.set("RPT-021", { selected: [{ value: "kurumsal_bi_platformu_kullanilmamaktadir" }] });
const visibleQ7 = getVisibleQuestions(pack.questions, answersScenario4);
assert(!visibleQ7.some((q) => q.id === "RPT-022"), "RPT-021=kurumsal_bi...kullanilmamaktadir iken RPT-022 gizlendi");

answersScenario4.set("RPT-021", { selected: [{ value: "tum_yonetici_ve_calisanlarin_aktif_kullandigi_kurumsal_bi_vardir" }] });
const visibleQ8 = getVisibleQuestions(pack.questions, answersScenario4);
assert(visibleQ8.some((q) => q.id === "RPT-022"), "RPT-021=tum_yonetici... iken RPT-022 görünür");

// Senaryo 5: Self-service yoksa RPT-024 gizlenmeli
const answersScenario5 = new Map<string, AnswerData>();
answersScenario5.set("RPT-023", { selected: [{ value: "self_service_raporlama_yoktur" }] });
const visibleQ9 = getVisibleQuestions(pack.questions, answersScenario5);
assert(!visibleQ9.some((q) => q.id === "RPT-024"), "RPT-023=self_service_raporlama_yoktur iken RPT-024 gizlendi");

answersScenario5.set("RPT-023", { selected: [{ value: "kullanicilar_dogrulanmis_veri_modelinden_kendi_raporunu_kolayca_tasarlar" }] });
const visibleQ10 = getVisibleQuestions(pack.questions, answersScenario5);
assert(visibleQ10.some((q) => q.id === "RPT-024"), "RPT-023=kullanicilar_dogrulanmis... iken RPT-024 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `22 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("RPT-007", {
  id: "qf_rpt_07",
  analysis_project_id: "p1",
  business_function_code: "REPORTING_ANALYTICS",
  question_id: "RPT-007",
  flag_type: "critical",
  note: "Tek doğruluk kaynağı (SSOT) mimarisi ve ERP-CRM mutabakat kuralları netleştirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("RPT-030", {
  id: "qf_rpt_30",
  analysis_project_id: "p1",
  business_function_code: "REPORTING_ANALYTICS",
  question_id: "RPT-030",
  flag_type: "revisit",
  note: "Satır bazlı yetkilendirme (Row-Level Security) bölge ve bayi hiyerarşisi gözden geçirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});

const progressWithFollowups = calculateProgress(pack.questions, answersAllReq, mockFollowups);
assert(progressWithFollowups.answered === 20, `Bayraklı sorular tamamlanmamış sayıldı (20/22)`);
assert(progressWithFollowups.percentage === Math.round((20 / 22) * 100), `İlerleme dürüstçe %${progressWithFollowups.percentage} hesaplandı`);

// ─── TEST 9: Cross-Pack Duplication Audit ─────────────────────────────────────
console.log("\n=== T09: Cross-Pack Duplication Audit ===");
const salesPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/sales/core.json"), "utf-8")) as QuestionPack;
const procPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/procurement/core.json"), "utf-8")) as QuestionPack;
const whPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/warehouse/core.json"), "utf-8")) as QuestionPack;
const invPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/inventory/core.json"), "utf-8")) as QuestionPack;
const logPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/logistics/core.json"), "utf-8")) as QuestionPack;
const accPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/accounting/core.json"), "utf-8")) as QuestionPack;
const trsPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/treasury/core.json"), "utf-8")) as QuestionPack;
const bgtPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/budget_reporting/core.json"), "utf-8")) as QuestionPack;

const rptQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
const salesQuestionTexts = salesPack.questions.map((q) => q.question.toLowerCase().trim());
const procQuestionTexts = procPack.questions.map((q) => q.question.toLowerCase().trim());
const whQuestionTexts = whPack.questions.map((q) => q.question.toLowerCase().trim());
const invQuestionTexts = invPack.questions.map((q) => q.question.toLowerCase().trim());
const logQuestionTexts = logPack.questions.map((q) => q.question.toLowerCase().trim());
const accQuestionTexts = accPack.questions.map((q) => q.question.toLowerCase().trim());
const trsQuestionTexts = trsPack.questions.map((q) => q.question.toLowerCase().trim());
const bgtQuestionTexts = bgtPack.questions.map((q) => q.question.toLowerCase().trim());

let salesOverlapCount = 0;
for (const rq of rptQuestionTexts) {
  if (salesQuestionTexts.includes(rq)) {
    salesOverlapCount++;
    console.error(`Sales ile birebir örtüşen soru bulundu: "${rq}"`);
  }
}
assert(salesOverlapCount === 0, "Sales soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let procOverlapCount = 0;
for (const rq of rptQuestionTexts) {
  if (procQuestionTexts.includes(rq)) {
    procOverlapCount++;
    console.error(`Procurement ile birebir örtüşen soru bulundu: "${rq}"`);
  }
}
assert(procOverlapCount === 0, "Procurement soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let whOverlapCount = 0;
for (const rq of rptQuestionTexts) {
  if (whQuestionTexts.includes(rq)) {
    whOverlapCount++;
    console.error(`Warehouse ile birebir örtüşen soru bulundu: "${rq}"`);
  }
}
assert(whOverlapCount === 0, "Warehouse soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let invOverlapCount = 0;
for (const rq of rptQuestionTexts) {
  if (invQuestionTexts.includes(rq)) {
    invOverlapCount++;
    console.error(`Inventory ile birebir örtüşen soru bulundu: "${rq}"`);
  }
}
assert(invOverlapCount === 0, "Inventory soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let logOverlapCount = 0;
for (const rq of rptQuestionTexts) {
  if (logQuestionTexts.includes(rq)) {
    logOverlapCount++;
    console.error(`Logistics ile birebir örtüşen soru bulundu: "${rq}"`);
  }
}
assert(logOverlapCount === 0, "Logistics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let accOverlapCount = 0;
for (const rq of rptQuestionTexts) {
  if (accQuestionTexts.includes(rq)) {
    accOverlapCount++;
    console.error(`Accounting ile birebir örtüşen soru bulundu: "${rq}"`);
  }
}
assert(accOverlapCount === 0, "Accounting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let trsOverlapCount = 0;
for (const rq of rptQuestionTexts) {
  if (trsQuestionTexts.includes(rq)) {
    trsOverlapCount++;
    console.error(`Treasury ile birebir örtüşen soru bulundu: "${rq}"`);
  }
}
assert(trsOverlapCount === 0, "Treasury soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let bgtOverlapCount = 0;
for (const rq of rptQuestionTexts) {
  if (bgtQuestionTexts.includes(rq)) {
    bgtOverlapCount++;
    console.error(`Budget Reporting ile birebir örtüşen soru bulundu: "${rq}"`);
  }
}
assert(bgtOverlapCount === 0, "Budget Reporting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_rpt_001",
  analysis_project_id: "p1",
  business_function_code: "REPORTING_ANALYTICS",
  process_name: "BI ve Dashboard Platformları",
  question_text: "Şirket içi veri ambarında column-store / in-memory veritabanı motoru kullanılmakta mıdır?",
  description: "Büyük veri analitik performans mimarisi için.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_rpt_001", value: "in_memory_columnstore_aktif", label: "Evet, in-memory ve column-store motorlar aktiftir", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_rpt_001", value: "standart_satir_bazli_rdbms", label: "Standart ilişkisel satır bazlı motor kullanılmaktadır", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_rpt_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 43);
assert(adaptedQuestion.id === "cq_rpt_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "BI ve Dashboard Platformları", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "merkezi_bi_ve_veri_yonetimi_ekibi_tarafindan_yonetilir", note: "4 kişilik BI ekibi mevcuttur." }],
  general_note: "Kurumsal raporlama mimarisi DWH ve BI üzerine kurulacaktır.",
});
assert(
  formattedQ1.summaryText.includes("Merkezi bir İş Zekası (BI), Veri Ambarı veya Raporlama ekibi tüm şirketin analitik modellerini ve raporlarını yönetir"),
  "Kullanıcı dostu label formatlandı (merkezi_bi... enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("4 kişilik BI ekibi mevcuttur."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Kurumsal raporlama mimarisi DWH ve BI üzerine kurulacaktır."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with Reporting Analytics Data ===");
const mockRptReportModel: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "Raporlama, Veri Ambarı ve Analitik Keşif Analizi",
    companyName: "Atlas Veri Teknolojileri ve Lojistik Hizmetleri A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: {
      REPORTING_ANALYTICS: "tr.reporting_analytics.core v0.1.0",
    },
    isComplete: true,
    progressPercent: 100,
    requiredAnswered: 22,
    requiredTotal: 22,
    reportType: "final",
    draftLabel: "TAM RAPOR — %100",
    projectProgressPercent: 100,
    completedFunctionCount: 1,
    selectedFunctionCount: 1,
    isProjectComplete: true,
  },
  company: {
    companyName: "Atlas Veri Teknolojileri ve Lojistik Hizmetleri A.Ş.",
    tradeName: "Atlas Veri",
    taxNumber: "8887776655",
    city: "İstanbul",
    country: "Türkiye",
    employeeCount: "1200",
    notes: "Tek doğruluk kaynağı, DWH/BI mimarisi ve veri yönetişimi analizi tamamlandı.",
  },
  profile: {
    analysis_project_id: "p_faz18",
    executive_summary: "Kurumsal veri ambarı, self-service analitik ve satır bazlı güvenlik (RLS) modelleri incelendi.",
    overall_assessment: "Excel bağımlılığının azaltılması ve merkezi BI platformuna geçiş planlandı.",
    open_topics: "ETL zamanlamaları ve master data veri sözlüğü tanımları netleştirilecek.",
  },
  scope: [
    {
      code: "REPORTING_ANALYTICS",
      nameTr: "Raporlama ve Analitik",
      nameEn: "Reporting & Analytics",
      category: "Yönetim",
      departmentName: "Bilgi Teknolojileri ve Veri Yönetimi Direktörlüğü",
      responsiblePerson: "Erdem Yılmaz",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
    },
  ],
  businessFunctions: [
    {
      code: "REPORTING_ANALYTICS",
      nameTr: "Raporlama ve Analitik",
      nameEn: "Reporting & Analytics",
      category: "Yönetim",
      sortOrder: 31,
      departmentName: "Bilgi Teknolojileri ve Veri Yönetimi Direktörlüğü",
      responsiblePerson: "Erdem Yılmaz",
      status: "completed",
      packId: "tr.reporting_analytics.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
      processes: [
        {
          name: "Raporlama Organizasyonu",
          order: 1,
          questions: [
            {
              id: "RPT-001",
              order: 1,
              process: "Raporlama Organizasyonu",
              questionText: "Şirketinizde kurumsal raporlama ve analitik süreçlerinin yönetimi ve sahipliği hangi organizasyonel modelle (Merkezi BI/Raporlama Ekibi / Dağıtık Departman Analistleri / IT Destekli / Bağımsız Kullanıcılar) yürütülmektedir?",
              answerType: "single_choice",
              criticality: "critical",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "merkezi_bi_ve_veri_yonetimi_ekibi_tarafindan_yonetilir",
                    label: "Merkezi bir İş Zekası (BI), Veri Ambarı veya Raporlama ekibi tüm şirketin analitik modellerini ve raporlarını yönetir",
                    isOther: false,
                    note: "4 kişilik BI ekibi mevcuttur.",
                  },
                ],
                summaryText: "• Merkezi bir İş Zekası (BI), Veri Ambarı veya Raporlama ekibi tüm şirketin analitik modellerini ve raporlarını yönetir",
              },
              findings: [
                {
                  id: "f_rpt_01",
                  title: "Çoklu Raporlama Kaynağı Uyumsuzluğu",
                  description: "Satış ve muhasebe departmanlarının bağımsız raporları arasında rakam tutarsızlıkları yaşanmaktadır.",
                  priority: "high",
                  status: "open",
                  questionId: "RPT-001",
                  createdAt: "2026-08-20",
                },
              ],
              requirements: [
                {
                  id: "req_rpt_01",
                  title: "Kurumsal Veri Ambarı ve Tek Doğruluk Kaynağı",
                  description: "Tüm yönetim raporlarının tek doğruluk kaynağından beslenmesi için DWH ve merkezi semantik model kurulmalıdır.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "RPT-001",
                  createdAt: "2026-08-20",
                },
              ],
              risks: [],
              notes: [],
            },
          ],
        },
      ],
      findings: [
        {
          id: "f_rpt_01",
          title: "Çoklu Raporlama Kaynağı Uyumsuzluğu",
          description: "Satış ve muhasebe departmanlarının bağımsız raporları arasında rakam tutarsızlıkları yaşanmaktadır.",
          priority: "high",
          status: "open",
          questionId: "RPT-001",
          createdAt: "2026-08-20",
        },
      ],
      requirements: [
        {
          id: "req_rpt_01",
          title: "Kurumsal Veri Ambarı ve Tek Doğruluk Kaynağı",
          description: "Tüm yönetim raporlarının tek doğruluk kaynağından beslenmesi için DWH ve merkezi semantik model kurulmalıdır.",
          priority: "critical",
          status: "confirmed",
          questionId: "RPT-001",
          createdAt: "2026-08-20",
        },
      ],
      risks: [],
      notes: [],
    },
  ],
  followups: [],
  globalFindings: [],
  globalRequirements: [],
  globalRisks: [],
  projectNotes: [],
  summaryStats: {
    totalFunctions: 1,
    completedFunctions: 1,
    inProgressFunctions: 0,
    notStartedFunctions: 0,
    totalFindings: 1,
    totalRequirements: 1,
    openRisks: 0,
    totalRisks: 0,
    totalNotes: 0,
    answeredQuestions: 22,
    totalQuestions: 22,
    openFollowupCount: 0,
    revisitCount: 0,
    criticalFollowupCount: 0,
  },
};

// DOCX Testi
const docxBuffer = await buildDocxBuffer(mockRptReportModel);
assert(docxBuffer.length > 5000, `DOCX üretimi başarılı (${docxBuffer.length} byte)`);

// PDF Testi
const pdfBuffer = await buildPdfBuffer(mockRptReportModel);
assert(pdfBuffer.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.length} byte)`);

// PDF Text Extraction & Türkçe Karakter Kontrolü
const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");
assert(pdfText.includes("Raporlama ve Analitik"), "PDF çıktısında 'Raporlama ve Analitik' başlığı mevcut");
assert(pdfText.includes("Atlas Veri Teknolojileri ve Lojistik Hizmetleri A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Kurumsal Veri Ambarı ve Tek Doğruluk Kaynağı"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockRptReportModel.metadata.packVersions.REPORTING_ANALYTICS === "tr.reporting_analytics.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("REPORTING_ANALYTICS");
assert(mappedPackId === "tr.reporting_analytics.core", `getPackIdForFunction("REPORTING_ANALYTICS") -> tr.reporting_analytics.core`);

console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-18 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
