/**
 * ERP CRM Discovery — FAZ-19 CRM Question Pack Acceptance Test Suite
 *
 * Automated verification for:
 * 1. Pack Loading & Metadata Integrity (tr.crm.core v0.1.0, canonical code = CRM)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (42 questions, sequential order 1..42, CRM-001..CRM-042)
 * 4. Required Question Count Truth (22 required, 20 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 19 Canonical Process Coverage
 * 7. Conditional Branching Resolution (branching engine with Map)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (verifying zero overlap with SALES, PROCUREMENT, WAREHOUSE, INVENTORY, LOGISTICS, ACCOUNTING, TREASURY, BUDGET_REPORTING, and REPORTING_ANALYTICS)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("CRM") === "tr.crm.core")
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
console.log("FAZ-19: MÜŞTERİ YÖNETİMİ / CRM TEST");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/crm/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "CRM pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.crm.core", "pack_id = tr.crm.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.schema_version === "1", "schema_version = 1");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "CRM", "business_function_code = CRM (Kanonik Kod)");
assert(pack.meta.name === "Müşteri Yönetimi (CRM) Ön Analizi", "name = Müşteri Yönetimi (CRM) Ön Analizi");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 20, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validationResult = validateQuestionPack(pack);
if (!validationResult.valid) {
  console.error("   Doğrulama hataları:", validationResult.errors);
}
assert(validationResult.valid === true, "validateQuestionPack(crmPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity, Deterministic Order & IDs ────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 42, `Toplam soru sayısı tam 42 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 42, "Tüm 42 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `CRM-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: index ${i}, id: ${pack.questions[i].id}, order: ${pack.questions[i].order}`);
  }
}
assert(orderCorrect, "Tüm sorular CRM-001'den CRM-042'ye sıralı ve deterministiktir");

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
  "Müşteri Ana Veri Yapısı",
  "Potansiyel / Aday Müşteri Yönetimi",
  "Müşteri Açılış Süreci",
  "Müşteri Organizasyon ve Hiyerarşi Yapısı",
  "İletişim Kişileri",
  "Müşteri Sınıflandırma ve Segmentasyon",
  "Müşteri Sorumlusu / Temsilci Ataması",
  "Müşteri 360 Görünümü",
  "İletişim ve Etkileşim Geçmişi",
  "Aktivite / Görev / Hatırlatma Yönetimi",
  "Müşteri Ziyaretleri",
  "Müşteri Talep Yönetimi",
  "Şikâyet ve Geri Bildirim Yönetimi",
  "Müşteri Memnuniyeti",
  "Müşteri Devir / Temsilci Değişikliği",
  "İletişim Tercihleri ve İzin Bilgileri",
  "Müşteri Veri Kalitesi",
  "Mükerrer Kayıt Yönetimi",
  "CRM Raporlama ve KPI",
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

// Senaryo 1: Hiyerarşi yoksa CRM-008 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("CRM-007", { selected: [{ value: "hiyerarsi_yapisi_kullanilmaz_her_cari_bagimsizdir" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "CRM-008"), "CRM-007=hiyerarsi...kullanilmaz iken CRM-008 gizlendi");

answersScenario1.set("CRM-007", { selected: [{ value: "cok_kademeli_holding_ana_firma_ve_sube_agaci_desteklenir" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "CRM-008"), "CRM-007=cok_kademeli... iken CRM-008 görünür");

// Senaryo 2: Saha ziyaret planı yoksa CRM-022 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("CRM-021", { selected: [{ value: "saha_ziyaret_plani_ve_raporu_tutulmamaktadir" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "CRM-022"), "CRM-021=saha_ziyaret...tutulmamaktadir iken CRM-022 gizlendi");

answersScenario2.set("CRM-021", { selected: [{ value: "ziyaretler_onceden_planlanir_ve_ziyaret_raporu_ayni_gun_girilir" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "CRM-022"), "CRM-021=ziyaretler_onceden... iken CRM-022 görünür");

// Senaryo 3: Müşteri şikâyetleri kaydedilmiyorsa CRM-026 ve CRM-027 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("CRM-025", { selected: [{ value: "musteri_sikayetleri_sisteme_kaydedilmemektedir" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "CRM-026"), "CRM-025=musteri_sikayetleri...kaydedilmemektedir iken CRM-026 gizlendi");
assert(!visibleQ5.some((q) => q.id === "CRM-027"), "CRM-025=musteri_sikayetleri...kaydedilmemektedir iken CRM-027 gizlendi");

answersScenario3.set("CRM-025", { selected: [{ value: "tum_kanallardan_gelen_sikayetler_merkezi_crm_vaka_havuzuna_kaydedilir" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "CRM-026"), "CRM-025=tum_kanallardan... iken CRM-026 görünür");
assert(visibleQ6.some((q) => q.id === "CRM-027"), "CRM-025=tum_kanallardan... iken CRM-027 görünür");

// Senaryo 4: Memnuniyet ölçülmüyorsa CRM-029 gizlenmeli
const answersScenario4 = new Map<string, AnswerData>();
answersScenario4.set("CRM-028", { selected: [{ value: "musteri_memnuniyeti_olculmemektedir" }] });
const visibleQ7 = getVisibleQuestions(pack.questions, answersScenario4);
assert(!visibleQ7.some((q) => q.id === "CRM-029"), "CRM-028=musteri_memnuniyeti_olculmemektedir iken CRM-029 gizlendi");

answersScenario4.set("CRM-028", { selected: [{ value: "otomatik_anketler_csat_nps_ile_duzenli_olarak_olculur" }] });
const visibleQ8 = getVisibleQuestions(pack.questions, answersScenario4);
assert(visibleQ8.some((q) => q.id === "CRM-029"), "CRM-028=otomatik_anketler... iken CRM-029 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `22 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("CRM-001", {
  id: "qf_crm_01",
  analysis_project_id: "p1",
  business_function_code: "CRM",
  question_id: "CRM-001",
  flag_type: "critical",
  note: "Mevcut CRM ve ERP müşteri kod yapısı entegrasyonu netleştirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("CRM-015", {
  id: "qf_crm_15",
  analysis_project_id: "p1",
  business_function_code: "CRM",
  question_id: "CRM-015",
  flag_type: "revisit",
  note: "Müşteri 360 ekranında gösterilecek açık bakiye ve sevkiyat özet alanları belirlenecek",
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
const rptPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/reporting_analytics/core.json"), "utf-8")) as QuestionPack;

const crmQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
const salesQuestionTexts = salesPack.questions.map((q) => q.question.toLowerCase().trim());
const procQuestionTexts = procPack.questions.map((q) => q.question.toLowerCase().trim());
const whQuestionTexts = whPack.questions.map((q) => q.question.toLowerCase().trim());
const invQuestionTexts = invPack.questions.map((q) => q.question.toLowerCase().trim());
const logQuestionTexts = logPack.questions.map((q) => q.question.toLowerCase().trim());
const accQuestionTexts = accPack.questions.map((q) => q.question.toLowerCase().trim());
const trsQuestionTexts = trsPack.questions.map((q) => q.question.toLowerCase().trim());
const bgtQuestionTexts = bgtPack.questions.map((q) => q.question.toLowerCase().trim());
const rptQuestionTexts = rptPack.questions.map((q) => q.question.toLowerCase().trim());

let salesOverlapCount = 0;
for (const cq of crmQuestionTexts) {
  if (salesQuestionTexts.includes(cq)) {
    salesOverlapCount++;
    console.error(`Sales ile birebir örtüşen soru bulundu: "${cq}"`);
  }
}
assert(salesOverlapCount === 0, "Sales soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let procOverlapCount = 0;
for (const cq of crmQuestionTexts) {
  if (procQuestionTexts.includes(cq)) {
    procOverlapCount++;
    console.error(`Procurement ile birebir örtüşen soru bulundu: "${cq}"`);
  }
}
assert(procOverlapCount === 0, "Procurement soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let whOverlapCount = 0;
for (const cq of crmQuestionTexts) {
  if (whQuestionTexts.includes(cq)) {
    whOverlapCount++;
    console.error(`Warehouse ile birebir örtüşen soru bulundu: "${cq}"`);
  }
}
assert(whOverlapCount === 0, "Warehouse soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let invOverlapCount = 0;
for (const cq of crmQuestionTexts) {
  if (invQuestionTexts.includes(cq)) {
    invOverlapCount++;
    console.error(`Inventory ile birebir örtüşen soru bulundu: "${cq}"`);
  }
}
assert(invOverlapCount === 0, "Inventory soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let logOverlapCount = 0;
for (const cq of crmQuestionTexts) {
  if (logQuestionTexts.includes(cq)) {
    logOverlapCount++;
    console.error(`Logistics ile birebir örtüşen soru bulundu: "${cq}"`);
  }
}
assert(logOverlapCount === 0, "Logistics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let accOverlapCount = 0;
for (const cq of crmQuestionTexts) {
  if (accQuestionTexts.includes(cq)) {
    accOverlapCount++;
    console.error(`Accounting ile birebir örtüşen soru bulundu: "${cq}"`);
  }
}
assert(accOverlapCount === 0, "Accounting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let trsOverlapCount = 0;
for (const cq of crmQuestionTexts) {
  if (trsQuestionTexts.includes(cq)) {
    trsOverlapCount++;
    console.error(`Treasury ile birebir örtüşen soru bulundu: "${cq}"`);
  }
}
assert(trsOverlapCount === 0, "Treasury soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let bgtOverlapCount = 0;
for (const cq of crmQuestionTexts) {
  if (bgtQuestionTexts.includes(cq)) {
    bgtOverlapCount++;
    console.error(`Budget Reporting ile birebir örtüşen soru bulundu: "${cq}"`);
  }
}
assert(bgtOverlapCount === 0, "Budget Reporting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let rptOverlapCount = 0;
for (const cq of crmQuestionTexts) {
  if (rptQuestionTexts.includes(cq)) {
    rptOverlapCount++;
    console.error(`Reporting Analytics ile birebir örtüşen soru bulundu: "${cq}"`);
  }
}
assert(rptOverlapCount === 0, "Reporting Analytics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_crm_001",
  analysis_project_id: "p1",
  business_function_code: "CRM",
  process_name: "Müşteri 360 Görünümü",
  question_text: "Müşteri kartı üzerinde sosyal medya (LinkedIn / Twitter) profilleri otomatik entegre edilmekte midir?",
  description: "B2B dijital müşteri istihbaratı için.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_crm_001", value: "sosyal_medya_entegrasyonu_var", label: "Evet, LinkedIn profil bilgileri ve şirket haberleri kartta görünür", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_crm_001", value: "sosyal_medya_entegrasyonu_yok", label: "Sosyal medya entegrasyonu bulunmamaktadır", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_crm_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 43);
assert(adaptedQuestion.id === "cq_crm_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Müşteri 360 Görünümü", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "merkezi_ve_entegre_erp_crm_tek_sistemde_yonetilir", note: "Tek platform üzerinde uçtan uca müşteri yönetimi hedefleniyor." }],
  general_note: "Kurumsal hafıza kaybının önlenmesi en kritik hedeftir.",
});
assert(
  formattedQ1.summaryText.includes("Tüm müşteri, aday ve cari bilgileri tek bir entegre ERP/CRM platformunda merkezi olarak tutulur"),
  "Kullanıcı dostu label formatlandı (merkezi_ve_entegre... enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("Tek platform üzerinde uçtan uca müşteri yönetimi hedefleniyor."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Kurumsal hafıza kaybının önlenmesi en kritik hedeftir."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with CRM Data ===");
const mockCrmReportModel: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "Müşteri Yönetimi, CRM ve Müşteri 360 Keşif Analizi",
    companyName: "Anadolu İnovatif Dağıtım ve Ticaret A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: {
      CRM: "tr.crm.core v0.1.0",
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
    companyName: "Anadolu İnovatif Dağıtım ve Ticaret A.Ş.",
    tradeName: "Anadolu Dağıtım",
    taxNumber: "9998887766",
    city: "İzmir",
    country: "Türkiye",
    employeeCount: "450",
    notes: "Müşteri 360, görüşme geçmişi ve şikâyet SLA takibi analizi tamamlandı.",
  },
  profile: {
    analysis_project_id: "p_faz19",
    executive_summary: "Kurumsal CRM, mobil saha ziyareti ve müşteri veri kalitesi süreçleri incelendi.",
    overall_assessment: "Kişisel rehber ve WhatsApp bağımlılığının azaltılması, tek merkezde müşteri hafızası oluşturulması planlandı.",
    open_topics: "Aday müşteri onay kuralları ve GİB VKN entegrasyonu netleştirilecek.",
  },
  scope: [
    {
      code: "CRM",
      nameTr: "Müşteri Yönetimi (CRM)",
      nameEn: "Customer Relationship Management (CRM)",
      category: "Satış & Pazarlama",
      departmentName: "Satış ve Müşteri İlişkileri Direktörlüğü",
      responsiblePerson: "Zeynep Kaya",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
    },
  ],
  businessFunctions: [
    {
      code: "CRM",
      nameTr: "Müşteri Yönetimi (CRM)",
      nameEn: "Customer Relationship Management (CRM)",
      category: "Satış & Pazarlama",
      sortOrder: 15,
      departmentName: "Satış ve Müşteri İlişkileri Direktörlüğü",
      responsiblePerson: "Zeynep Kaya",
      status: "completed",
      packId: "tr.crm.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
      processes: [
        {
          name: "Müşteri Ana Veri Yapısı",
          order: 1,
          questions: [
            {
              id: "CRM-001",
              order: 1,
              process: "Müşteri Ana Veri Yapısı",
              questionText: "Şirketinizde müşteri ana verileri ve cari bilgileri hangi teknolojik ortamda (Merkezi CRM, Entegre ERP Cari Kartı, Bağımsız CRM + ERP Senkronizasyonu, Excel Tabloları) yönetilmektedir?",
              answerType: "single_choice",
              criticality: "critical",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "merkezi_ve_entegre_erp_crm_tek_sistemde_yonetilir",
                    label: "Tüm müşteri, aday ve cari bilgileri tek bir entegre ERP/CRM platformunda merkezi olarak tutulur",
                    isOther: false,
                    note: "Tek platform üzerinde uçtan uca müşteri yönetimi hedefleniyor.",
                  },
                ],
                summaryText: "• Tüm müşteri, aday ve cari bilgileri tek bir entegre ERP/CRM platformunda merkezi olarak tutulur",
              },
              findings: [
                {
                  id: "f_crm_01",
                  title: "Müşteri Bilgilerinin Kişisel Cihazlarda Dağınık Olması",
                  description: "Satış temsilcilerinin ayrılması durumunda kurumsal müşteri hafızası kaybolmaktadır.",
                  priority: "high",
                  status: "open",
                  questionId: "CRM-001",
                  createdAt: "2026-08-20",
                },
              ],
              requirements: [
                {
                  id: "req_crm_01",
                  title: "Merkezi Müşteri 360 ve Etkileşim Zaman Çizelgesi",
                  description: "Tüm müşteri görüşmeleri, sözleşmeler ve açık talepler tek bir merkezi Müşteri 360 ekranında toplanmalıdır.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "CRM-001",
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
          id: "f_crm_01",
          title: "Müşteri Bilgilerinin Kişisel Cihazlarda Dağınık Olması",
          description: "Satış temsilcilerinin ayrılması durumunda kurumsal müşteri hafızası kaybolmaktadır.",
          priority: "high",
          status: "open",
          questionId: "CRM-001",
          createdAt: "2026-08-20",
        },
      ],
      requirements: [
        {
          id: "req_crm_01",
          title: "Merkezi Müşteri 360 ve Etkileşim Zaman Çizelgesi",
          description: "Tüm müşteri görüşmeleri, sözleşmeler ve açık talepler tek bir merkezi Müşteri 360 ekranında toplanmalıdır.",
          priority: "critical",
          status: "confirmed",
          questionId: "CRM-001",
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
const docxBuffer = await buildDocxBuffer(mockCrmReportModel);
assert(docxBuffer.length > 5000, `DOCX üretimi başarılı (${docxBuffer.length} byte)`);

// PDF Testi
const pdfBuffer = await buildPdfBuffer(mockCrmReportModel);
assert(pdfBuffer.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.length} byte)`);

// PDF Text Extraction & Türkçe Karakter Kontrolü
const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");
assert(pdfText.includes("Müşteri Yönetimi (CRM)") || pdfText.includes("Müşteri Yönetimi"), "PDF çıktısında 'Müşteri Yönetimi' başlığı mevcut");
assert(pdfText.includes("Anadolu İnovatif Dağıtım ve Ticaret A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Merkezi Müşteri 360 ve Etkileşim Zaman Çizelgesi"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockCrmReportModel.metadata.packVersions.CRM === "tr.crm.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("CRM");
assert(mappedPackId === "tr.crm.core", `getPackIdForFunction("CRM") -> tr.crm.core`);

console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-19 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
