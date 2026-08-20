/**
 * ERP CRM Discovery — FAZ-17 Budget Reporting Question Pack Acceptance Test Suite
 *
 * Automated verification for:
 * 1. Pack Loading & Metadata Integrity (tr.budget_reporting.core v0.1.0, canonical code = BUDGET_REPORTING)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (42 questions, sequential order 1..42, BGT-001..BGT-042)
 * 4. Required Question Count Truth (22 required, 20 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 19 Canonical Process Coverage
 * 7. Conditional Branching Resolution (branching engine with Map)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (verifying zero overlap with SALES, PROCUREMENT, WAREHOUSE, INVENTORY, LOGISTICS, ACCOUNTING and TREASURY)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("BUDGET_REPORTING") === "tr.budget_reporting.core")
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
console.log("FAZ-17: BÜTÇE VE RAPORLAMA / BUDGET_REPORTING TEST");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/budget_reporting/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "Budget Reporting pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.budget_reporting.core", "pack_id = tr.budget_reporting.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.schema_version === "1", "schema_version = 1");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "BUDGET_REPORTING", "business_function_code = BUDGET_REPORTING (Kanonik Kod)");
assert(pack.meta.name === "Bütçe ve Raporlama Ön Analizi", "name = Bütçe ve Raporlama Ön Analizi");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 20, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validationResult = validateQuestionPack(pack);
if (!validationResult.valid) {
  console.error("   Doğrulama hataları:", validationResult.errors);
}
assert(validationResult.valid === true, "validateQuestionPack(budgetReportingPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity, Deterministic Order & IDs ────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 42, `Toplam soru sayısı tam 42 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 42, "Tüm 42 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `BGT-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: index ${i}, id: ${pack.questions[i].id}, order: ${pack.questions[i].order}`);
  }
}
assert(orderCorrect, "Tüm sorular BGT-001'den BGT-042'ye sıralı ve deterministiktir");

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
  "Bütçe Organizasyonu",
  "Yıllık Bütçe Süreci",
  "Departman Bütçeleri",
  "Gelir Bütçesi",
  "Gider Bütçesi",
  "Masraf Merkezi Bütçesi",
  "Proje Bütçesi",
  "Yatırım / CAPEX Bütçesi",
  "Nakit Bütçesi Bağlantısı",
  "Bütçe Onay Süreci",
  "Bütçe Versiyonları ve Revizyonlar",
  "Forecast ve Rolling Forecast",
  "Bütçe-Gerçekleşen Analizi",
  "Sapma Analizi",
  "Yönetim Raporları",
  "KPI ve Performans Raporlama",
  "Rapor Veri Kaynakları",
  "Excel Bağımlılığı",
  "Rapor Yetkilendirme ve Dağıtım",
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

// Senaryo 1: Bütçe hazırlanmıyorsa BGT-004 ve BGT-006 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("BGT-001", { selected: [{ value: "butce_hazirlanmamaktadir" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "BGT-004"), "BGT-001=butce_hazirlanmamaktadir iken BGT-004 gizlendi");
assert(!visibleQ1.some((q) => q.id === "BGT-006"), "BGT-001=butce_hazirlanmamaktadir iken BGT-006 gizlendi");

answersScenario1.set("BGT-001", { selected: [{ value: "dagitik_katilimli_merkezi_finans_konsolidasyonlu" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "BGT-004"), "BGT-001=dagitik... iken BGT-004 görünür");
assert(visibleQ2.some((q) => q.id === "BGT-006"), "BGT-001=dagitik... iken BGT-006 görünür");

// Senaryo 2: Proje bütçesi kullanılmıyorsa BGT-016 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("BGT-015", { selected: [{ value: "proje_bazli_butce_kullanilmamaktadir" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "BGT-016"), "BGT-015=proje_bazli_butce_kullanilmamaktadir iken BGT-016 gizlendi");

answersScenario2.set("BGT-015", { selected: [{ value: "her_proje_icin_wbs_kirilimli_bagimsiz_proje_butcesi_acilir" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "BGT-016"), "BGT-015=her_proje_icin... iken BGT-016 görünür");

// Senaryo 3: CAPEX bütçesi yoksa BGT-018 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("BGT-017", { selected: [{ value: "capex_yatirim_butcesi_tutulmamaktadir" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "BGT-018"), "BGT-017=capex_yatirim_butcesi_tutulmamaktadir iken BGT-018 gizlendi");

answersScenario3.set("BGT-017", { selected: [{ value: "ayri_capex_yatirim_butcesi_tanimlidir_proje_bazli_izlenir" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "BGT-018"), "BGT-017=ayri_capex... iken BGT-018 görünür");

// Senaryo 4: Forecast yapılmıyorsa BGT-026 gizlenmeli
const answersScenario4 = new Map<string, AnswerData>();
answersScenario4.set("BGT-025", { selected: [{ value: "forecast_calismasi_yapilmamaktadir" }] });
const visibleQ7 = getVisibleQuestions(pack.questions, answersScenario4);
assert(!visibleQ7.some((q) => q.id === "BGT-026"), "BGT-025=forecast_calismasi_yapilmamaktadir iken BGT-026 gizlendi");

answersScenario4.set("BGT-025", { selected: [{ value: "aylik_veya_ceyrek_bazli_surekli_rolling_forecast_yapilir" }] });
const visibleQ8 = getVisibleQuestions(pack.questions, answersScenario4);
assert(visibleQ8.some((q) => q.id === "BGT-026"), "BGT-025=aylik_veya_ceyrek... iken BGT-026 görünür");

// Senaryo 5: Kurumsal KPI kullanılmıyorsa BGT-036 gizlenmeli
const answersScenario5 = new Map<string, AnswerData>();
answersScenario5.set("BGT-035", { selected: [{ value: "kurumsal_kpi_takibi_yapilmamaktadir" }] });
const visibleQ9 = getVisibleQuestions(pack.questions, answersScenario5);
assert(!visibleQ9.some((q) => q.id === "BGT-036"), "BGT-035=kurumsal_kpi_takibi_yapilmamaktadir iken BGT-036 gizlendi");

answersScenario5.set("BGT-035", { selected: [{ value: "kurumsal_ve_departman_bazli_kpi_sozlugu_tam_tanimlidir" }] });
const visibleQ10 = getVisibleQuestions(pack.questions, answersScenario5);
assert(visibleQ10.some((q) => q.id === "BGT-036"), "BGT-035=kurumsal_ve_departman... iken BGT-036 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `22 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("BGT-001", {
  id: "qf_bgt_01",
  analysis_project_id: "p1",
  business_function_code: "BUDGET_REPORTING",
  question_id: "BGT-001",
  flag_type: "revisit",
  note: "Bütçe sahipliği ve departman giriş yetkileri yönetim kuruluyla teyit edilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("BGT-022", {
  id: "qf_bgt_22",
  analysis_project_id: "p1",
  business_function_code: "BUDGET_REPORTING",
  question_id: "BGT-022",
  flag_type: "critical",
  note: "Satın alma taleplerinde bütçe aşımında sert blokaj (Hard Block) kuralları netleştirilecek",
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

const bgtQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
const salesQuestionTexts = salesPack.questions.map((q) => q.question.toLowerCase().trim());
const procQuestionTexts = procPack.questions.map((q) => q.question.toLowerCase().trim());
const whQuestionTexts = whPack.questions.map((q) => q.question.toLowerCase().trim());
const invQuestionTexts = invPack.questions.map((q) => q.question.toLowerCase().trim());
const logQuestionTexts = logPack.questions.map((q) => q.question.toLowerCase().trim());
const accQuestionTexts = accPack.questions.map((q) => q.question.toLowerCase().trim());
const trsQuestionTexts = trsPack.questions.map((q) => q.question.toLowerCase().trim());

let salesOverlapCount = 0;
for (const bq of bgtQuestionTexts) {
  if (salesQuestionTexts.includes(bq)) {
    salesOverlapCount++;
    console.error(`Sales ile birebir örtüşen soru bulundu: "${bq}"`);
  }
}
assert(salesOverlapCount === 0, "Sales soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let procOverlapCount = 0;
for (const bq of bgtQuestionTexts) {
  if (procQuestionTexts.includes(bq)) {
    procOverlapCount++;
    console.error(`Procurement ile birebir örtüşen soru bulundu: "${bq}"`);
  }
}
assert(procOverlapCount === 0, "Procurement soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let whOverlapCount = 0;
for (const bq of bgtQuestionTexts) {
  if (whQuestionTexts.includes(bq)) {
    whOverlapCount++;
    console.error(`Warehouse ile birebir örtüşen soru bulundu: "${bq}"`);
  }
}
assert(whOverlapCount === 0, "Warehouse soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let invOverlapCount = 0;
for (const bq of bgtQuestionTexts) {
  if (invQuestionTexts.includes(bq)) {
    invOverlapCount++;
    console.error(`Inventory ile birebir örtüşen soru bulundu: "${bq}"`);
  }
}
assert(invOverlapCount === 0, "Inventory soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let logOverlapCount = 0;
for (const bq of bgtQuestionTexts) {
  if (logQuestionTexts.includes(bq)) {
    logOverlapCount++;
    console.error(`Logistics ile birebir örtüşen soru bulundu: "${bq}"`);
  }
}
assert(logOverlapCount === 0, "Logistics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let accOverlapCount = 0;
for (const bq of bgtQuestionTexts) {
  if (accQuestionTexts.includes(bq)) {
    accOverlapCount++;
    console.error(`Accounting ile birebir örtüşen soru bulundu: "${bq}"`);
  }
}
assert(accOverlapCount === 0, "Accounting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let trsOverlapCount = 0;
for (const bq of bgtQuestionTexts) {
  if (trsQuestionTexts.includes(bq)) {
    trsOverlapCount++;
    console.error(`Treasury ile birebir örtüşen soru bulundu: "${bq}"`);
  }
}
assert(trsOverlapCount === 0, "Treasury soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_bgt_001",
  analysis_project_id: "p1",
  business_function_code: "BUDGET_REPORTING",
  process_name: "Rapor Veri Kaynakları",
  question_text: "Power BI / Tableau raporlama katmanı doğrudan ERP HANA / SQL veri ambarına mı bağlıdır?",
  description: "İş zekası veri tabanı bağlantı mimarisi için.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_bgt_001", value: "direkt_canli_baglanti", label: "Evet, doğrudan canlı DirectQuery ile bağlıdır", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_bgt_001", value: "gecelik_aktarim", label: "Gecelik ETL aktarımı ile güncellenir", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_bgt_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 43);
assert(adaptedQuestion.id === "cq_bgt_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Rapor Veri Kaynakları", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "dagitik_katilimli_merkezi_finans_konsolidasyonlu", note: "12 departman kendi bütçesini hazırlar." }],
  general_note: "Bütçe ve Kontroling Müdürlüğü koordinasyonunda yürütülmektedir.",
});
assert(
  formattedQ1.summaryText.includes("Tüm departmanlar kendi bütçelerini hazırlar; Bütçe/Kontroling departmanı konsolide eder ve koordine eder"),
  "Kullanıcı dostu label formatlandı (dagitik_katilimli... enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("12 departman kendi bütçesini hazırlar."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Bütçe ve Kontroling Müdürlüğü koordinasyonunda yürütülmektedir."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with Budget Reporting Data ===");
const mockBgtReportModel: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "Bütçe, Planlama ve Yönetim Raporlama Keşif Analizi",
    companyName: "Avrasya Holding ve Stratejik Danışmanlık A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: {
      BUDGET_REPORTING: "tr.budget_reporting.core v0.1.0",
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
    companyName: "Avrasya Holding ve Stratejik Danışmanlık A.Ş.",
    tradeName: "Avrasya Holding",
    taxNumber: "5554443322",
    city: "İstanbul",
    country: "Türkiye",
    employeeCount: "850",
    notes: "Bütçe versiyonlama, rolling forecast ve yönetim raporlama analizi tamamlandı.",
  },
  profile: {
    analysis_project_id: "p_faz17",
    executive_summary: "ERP entegre bütçe modülü, satır bazlı yetkilendirme ve tek doğruluk kaynağı incelendi.",
    overall_assessment: "Satın alma taleplerinde bütçe kontrolü (BAC) ve Power BI dashboard mimarisi devreye alınacaktır.",
    open_topics: "Departman masraf merkezi dağıtım anahtarları ve rolling forecast toleransları netleştirilecek.",
  },
  scope: [
    {
      code: "BUDGET_REPORTING",
      nameTr: "Bütçe ve Raporlama",
      nameEn: "Budget & Reporting",
      category: "Muhasebe & Finans",
      departmentName: "Bütçe ve Finansal Kontrol Direktörlüğü",
      responsiblePerson: "Canan Demir",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
    },
  ],
  businessFunctions: [
    {
      code: "BUDGET_REPORTING",
      nameTr: "Bütçe ve Raporlama",
      nameEn: "Budget & Reporting",
      category: "Muhasebe & Finans",
      sortOrder: 7,
      departmentName: "Bütçe ve Finansal Kontrol Direktörlüğü",
      responsiblePerson: "Canan Demir",
      status: "completed",
      packId: "tr.budget_reporting.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
      processes: [
        {
          name: "Bütçe Organizasyonu",
          order: 1,
          questions: [
            {
              id: "BGT-001",
              order: 1,
              process: "Bütçe Organizasyonu",
              questionText: "Şirketinizde kurumsal bütçe hazırlama süreci bulunuyor mu ve bütçe yönetimi hangi organizasyonel modelle (Merkezi Finans / Dağıtık Departman Katılımlı / Şirketler Grubu) yürütülmektedir?",
              answerType: "single_choice",
              criticality: "critical",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "dagitik_katilimli_merkezi_finans_konsolidasyonlu",
                    label: "Tüm departmanlar kendi bütçelerini hazırlar; Bütçe/Kontroling departmanı konsolide eder ve koordine eder",
                    isOther: false,
                    note: "12 departman kendi bütçesini hazırlar.",
                  },
                ],
                summaryText: "• Tüm departmanlar kendi bütçelerini hazırlar; Bütçe/Kontroling departmanı konsolide eder ve koordine eder",
              },
              findings: [
                {
                  id: "f_bgt_01",
                  title: "Excel Bütçe Konsolidasyon Gecikmesi",
                  description: "Departman bütçelerinin bağımsız Excel dosyalarından toplanması konsolidasyon süresini uzatmaktadır.",
                  priority: "high",
                  status: "open",
                  questionId: "BGT-001",
                  createdAt: "2026-08-20",
                },
              ],
              requirements: [
                {
                  id: "req_bgt_01",
                  title: "ERP Entegre Bütçe Giriş ve Onay Sistemi",
                  description: "Departmanların bütçe girişlerini doğrudan ERP web arayüzünden yapabilmesi ve onay akışı sağlanmalıdır.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "BGT-001",
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
          id: "f_bgt_01",
          title: "Excel Bütçe Konsolidasyon Gecikmesi",
          description: "Departman bütçelerinin bağımsız Excel dosyalarından toplanması konsolidasyon süresini uzatmaktadır.",
          priority: "high",
          status: "open",
          questionId: "BGT-001",
          createdAt: "2026-08-20",
        },
      ],
      requirements: [
        {
          id: "req_bgt_01",
          title: "ERP Entegre Bütçe Giriş ve Onay Sistemi",
          description: "Departmanların bütçe girişlerini doğrudan ERP web arayüzünden yapabilmesi ve onay akışı sağlanmalıdır.",
          priority: "critical",
          status: "confirmed",
          questionId: "BGT-001",
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
const docxBuffer = await buildDocxBuffer(mockBgtReportModel);
assert(docxBuffer.length > 5000, `DOCX üretimi başarılı (${docxBuffer.length} byte)`);

// PDF Testi
const pdfBuffer = await buildPdfBuffer(mockBgtReportModel);
assert(pdfBuffer.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.length} byte)`);

// PDF Text Extraction & Türkçe Karakter Kontrolü
const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");
assert(pdfText.includes("Bütçe ve Raporlama"), "PDF çıktısında 'Bütçe ve Raporlama' başlığı mevcut");
assert(pdfText.includes("Avrasya Holding ve Stratejik Danışmanlık A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("ERP Entegre Bütçe Giriş ve Onay Sistemi"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockBgtReportModel.metadata.packVersions.BUDGET_REPORTING === "tr.budget_reporting.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("BUDGET_REPORTING");
assert(mappedPackId === "tr.budget_reporting.core", `getPackIdForFunction("BUDGET_REPORTING") -> tr.budget_reporting.core`);

console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-17 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
