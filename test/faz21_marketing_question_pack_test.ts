/**
 * ERP CRM Discovery — FAZ-21 Marketing Question Pack Acceptance Test Suite
 *
 * Automated verification for:
 * 1. Pack Loading & Metadata Integrity (tr.marketing.core v0.1.0, canonical code = MARKETING)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (42 questions, sequential order 1..42, MKT-001..MKT-042)
 * 4. Required Question Count Truth (22 required, 20 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 19 Canonical Process Coverage
 * 7. Conditional Branching Resolution (branching engine with Map)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (verifying zero overlap with SALES, CRM, PROPOSALS, PROCUREMENT, WAREHOUSE, INVENTORY, LOGISTICS, ACCOUNTING, TREASURY, BUDGET_REPORTING, and REPORTING_ANALYTICS)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("MARKETING") === "tr.marketing.core")
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
console.log("FAZ-21: PAZARLAMA VE KAMPANYA / MARKETING TEST");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/marketing/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "MARKETING pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.marketing.core", "pack_id = tr.marketing.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.schema_version === "1", "schema_version = 1");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "MARKETING", "business_function_code = MARKETING (Kanonik Kod)");
assert(pack.meta.name === "Pazarlama ve Kampanya Ön Analizi", "name = Pazarlama ve Kampanya Ön Analizi");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 20, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validationResult = validateQuestionPack(pack);
if (!validationResult.valid) {
  console.error("   Doğrulama hataları:", validationResult.errors);
}
assert(validationResult.valid === true, "validateQuestionPack(marketingPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity, Deterministic Order & IDs ────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 42, `Toplam soru sayısı tam 42 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 42, "Tüm 42 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `MKT-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: index ${i}, id: ${pack.questions[i].id}, order: ${pack.questions[i].order}`);
  }
}
assert(orderCorrect, "Tüm sorular MKT-001'den MKT-042'ye sıralı ve deterministiktir");

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
  "Pazarlama Organizasyonu",
  "Pazarlama Hedefleri",
  "Kampanya Planlama",
  "Hedef Kitle ve Segmentasyon",
  "Kampanya Listeleri",
  "Lead Generation",
  "Lead Kaynakları",
  "Dijital Kanallar",
  "E-posta Pazarlama",
  "SMS / Mesajlaşma",
  "Etkinlik / Fuar / Webinar",
  "Kampanya İçerik ve Materyal Yönetimi",
  "Kampanya Onay Süreci",
  "Kampanya Bütçesi",
  "Lead Nitelendirme / Scoring Kullanımı",
  "Lead Dağıtımı ve CRM Handoff",
  "Kampanya Dönüşüm Takibi",
  "Attribution / Kaynak Analizi",
  "Pazarlama KPI ve ROI",
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

// Senaryo 1: Dijital reklam yoksa MKT-016 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("MKT-015", { selected: [{ value: "dijital_reklam_ve_pazarlama_kanallari_kullanilmamaktadir" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "MKT-016"), "MKT-015=dijital_reklam...kullanilmamaktadir iken MKT-016 gizlendi");

answersScenario1.set("MKT-015", { selected: [{ value: "coklu_dijital_reklam_ve_sosyal_medya_kanallari_aktif_olarak_kullanilir" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "MKT-016"), "MKT-015=coklu_dijital_reklam... iken MKT-016 görünür");

// Senaryo 2: E-posta pazarlama yoksa MKT-018 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("MKT-017", { selected: [{ value: "toplu_eposta_pazarlamasi_yapilmamaktadir" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "MKT-018"), "MKT-017=toplu_eposta...yapilmamaktadir iken MKT-018 gizlendi");

answersScenario2.set("MKT-017", { selected: [{ value: "crm_ile_entegre_profesyonel_eposta_pazarlama_platformu_kullanilir" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "MKT-018"), "MKT-017=crm_ile_entegre... iken MKT-018 görünür");

// Senaryo 3: SMS/Mesajlaşma yoksa MKT-020 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("MKT-019", { selected: [{ value: "sms_veya_mesajlasma_kampanyasi_yapilmamaktadir" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "MKT-020"), "MKT-019=sms_veya_mesajlasma... iken MKT-020 gizlendi");

answersScenario3.set("MKT-019", { selected: [{ value: "crm_ile_entegre_sms_ve_whatsapp_is_hesabi_aktif_kullanilir" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "MKT-020"), "MKT-019=crm_ile_entegre_sms... iken MKT-020 görünür");

// Senaryo 4: Etkinlik/fuar yoksa MKT-022 gizlenmeli
const answersScenario4 = new Map<string, AnswerData>();
answersScenario4.set("MKT-021", { selected: [{ value: "fiziksel_veya_cevrimici_etkinlik_fuar_yapilmamaktadir" }] });
const visibleQ7 = getVisibleQuestions(pack.questions, answersScenario4);
assert(!visibleQ7.some((q) => q.id === "MKT-022"), "MKT-021=fiziksel_veya_cevrimici... iken MKT-022 gizlendi");

answersScenario4.set("MKT-021", { selected: [{ value: "yillik_etkinlik_takvimi_kapsaminda_butce_ve_hedef_lead_planiyla_yonetilir" }] });
const visibleQ8 = getVisibleQuestions(pack.questions, answersScenario4);
assert(visibleQ8.some((q) => q.id === "MKT-022"), "MKT-021=yillik_etkinlik... iken MKT-022 görünür");

// Senaryo 5: Kampanya bütçesi yoksa MKT-028 gizlenmeli
const answersScenario5 = new Map<string, AnswerData>();
answersScenario5.set("MKT-027", { selected: [{ value: "kampanya_butcesi_tutulmaz_harcamalar_genel_gider_yazilir" }] });
const visibleQ9 = getVisibleQuestions(pack.questions, answersScenario5);
assert(!visibleQ9.some((q) => q.id === "MKT-028"), "MKT-027=kampanya_butcesi_tutulmaz... iken MKT-028 gizlendi");

answersScenario5.set("MKT-027", { selected: [{ value: "her_kampanya_icin_kalem_bazinda_onayli_butce_tanimlanir" }] });
const visibleQ10 = getVisibleQuestions(pack.questions, answersScenario5);
assert(visibleQ10.some((q) => q.id === "MKT-028"), "MKT-027=her_kampanya_icin... iken MKT-028 görünür");

// Senaryo 6: Lead scoring yoksa MKT-030 gizlenmeli
const answersScenario6 = new Map<string, AnswerData>();
answersScenario6.set("MKT-029", { selected: [{ value: "lead_nitelendirme_ve_scoring_kullanilmamaktadir" }] });
const visibleQ11 = getVisibleQuestions(pack.questions, answersScenario6);
assert(!visibleQ11.some((q) => q.id === "MKT-030"), "MKT-029=lead_nitelendirme...kullanilmamaktadir iken MKT-030 gizlendi");

answersScenario6.set("MKT-029", { selected: [{ value: "kural_ve_davranis_bazli_lead_scoring_kullanilarak_mql_sql_ayrimi_yapilir" }] });
const visibleQ12 = getVisibleQuestions(pack.questions, answersScenario6);
assert(visibleQ12.some((q) => q.id === "MKT-030"), "MKT-029=kural_ve_davranis... iken MKT-030 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `22 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("MKT-013", {
  id: "qf_mkt_13",
  analysis_project_id: "p1",
  business_function_code: "MARKETING",
  question_id: "MKT-013",
  flag_type: "critical",
  note: "Lead kaynaklarının zorunlu alan yapılması ve web formu entegrasyonu netleştirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("MKT-029", {
  id: "qf_mkt_29",
  analysis_project_id: "p1",
  business_function_code: "MARKETING",
  question_id: "MKT-029",
  flag_type: "revisit",
  note: "Lead scoring puanlama modeli Satış Direktörü ile birlikte tasarlanacak",
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
const crmPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/crm/core.json"), "utf-8")) as QuestionPack;
const prpPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/proposals/core.json"), "utf-8")) as QuestionPack;
const procPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/procurement/core.json"), "utf-8")) as QuestionPack;
const whPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/warehouse/core.json"), "utf-8")) as QuestionPack;
const invPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/inventory/core.json"), "utf-8")) as QuestionPack;
const logPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/logistics/core.json"), "utf-8")) as QuestionPack;
const accPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/accounting/core.json"), "utf-8")) as QuestionPack;
const trsPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/treasury/core.json"), "utf-8")) as QuestionPack;
const bgtPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/budget_reporting/core.json"), "utf-8")) as QuestionPack;
const rptPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/reporting_analytics/core.json"), "utf-8")) as QuestionPack;

const mktQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
const salesQuestionTexts = salesPack.questions.map((q) => q.question.toLowerCase().trim());
const crmQuestionTexts = crmPack.questions.map((q) => q.question.toLowerCase().trim());
const prpQuestionTexts = prpPack.questions.map((q) => q.question.toLowerCase().trim());
const procQuestionTexts = procPack.questions.map((q) => q.question.toLowerCase().trim());
const whQuestionTexts = whPack.questions.map((q) => q.question.toLowerCase().trim());
const invQuestionTexts = invPack.questions.map((q) => q.question.toLowerCase().trim());
const logQuestionTexts = logPack.questions.map((q) => q.question.toLowerCase().trim());
const accQuestionTexts = accPack.questions.map((q) => q.question.toLowerCase().trim());
const trsQuestionTexts = trsPack.questions.map((q) => q.question.toLowerCase().trim());
const bgtQuestionTexts = bgtPack.questions.map((q) => q.question.toLowerCase().trim());
const rptQuestionTexts = rptPack.questions.map((q) => q.question.toLowerCase().trim());

let salesOverlapCount = 0;
for (const mq of mktQuestionTexts) {
  if (salesQuestionTexts.includes(mq)) {
    salesOverlapCount++;
    console.error(`Sales ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(salesOverlapCount === 0, "Sales soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let crmOverlapCount = 0;
for (const mq of mktQuestionTexts) {
  if (crmQuestionTexts.includes(mq)) {
    crmOverlapCount++;
    console.error(`CRM ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(crmOverlapCount === 0, "CRM soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let prpOverlapCount = 0;
for (const mq of mktQuestionTexts) {
  if (prpQuestionTexts.includes(mq)) {
    prpOverlapCount++;
    console.error(`Proposals ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(prpOverlapCount === 0, "Proposals soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let procOverlapCount = 0;
for (const mq of mktQuestionTexts) {
  if (procQuestionTexts.includes(mq)) {
    procOverlapCount++;
    console.error(`Procurement ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(procOverlapCount === 0, "Procurement soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let whOverlapCount = 0;
for (const mq of mktQuestionTexts) {
  if (whQuestionTexts.includes(mq)) {
    whOverlapCount++;
    console.error(`Warehouse ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(whOverlapCount === 0, "Warehouse soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let invOverlapCount = 0;
for (const mq of mktQuestionTexts) {
  if (invQuestionTexts.includes(mq)) {
    invOverlapCount++;
    console.error(`Inventory ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(invOverlapCount === 0, "Inventory soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let logOverlapCount = 0;
for (const mq of mktQuestionTexts) {
  if (logQuestionTexts.includes(mq)) {
    logOverlapCount++;
    console.error(`Logistics ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(logOverlapCount === 0, "Logistics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let accOverlapCount = 0;
for (const mq of mktQuestionTexts) {
  if (accQuestionTexts.includes(mq)) {
    accOverlapCount++;
    console.error(`Accounting ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(accOverlapCount === 0, "Accounting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let trsOverlapCount = 0;
for (const mq of mktQuestionTexts) {
  if (trsQuestionTexts.includes(mq)) {
    trsOverlapCount++;
    console.error(`Treasury ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(trsOverlapCount === 0, "Treasury soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let bgtOverlapCount = 0;
for (const mq of mktQuestionTexts) {
  if (bgtQuestionTexts.includes(mq)) {
    bgtOverlapCount++;
    console.error(`Budget Reporting ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(bgtOverlapCount === 0, "Budget Reporting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let rptOverlapCount = 0;
for (const mq of mktQuestionTexts) {
  if (rptQuestionTexts.includes(mq)) {
    rptOverlapCount++;
    console.error(`Reporting Analytics ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(rptOverlapCount === 0, "Reporting Analytics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_mkt_001",
  analysis_project_id: "p1",
  business_function_code: "MARKETING",
  process_name: "Lead Generation",
  question_text: "Web sitesinde yapay zekâ destekli canlı sohbet (AI Chatbot) ile lead toplama kullanılmakta mıdır?",
  description: "Ziyaretçi nitelendirme ve 7/24 otomatik form doldurma desteği için.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_mkt_001", value: "ai_chatbot_aktif", label: "Evet, AI Chatbot ziyaretçiyi karşılar ve lead bilgilerini alır", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_mkt_001", value: "chatbot_yoktur", label: "Chatbot kullanılmamaktadır", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_mkt_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 43);
assert(adaptedQuestion.id === "cq_mkt_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Lead Generation", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "ayri_ve_uzmanlasmis_pazarlama_departmani_tarafindan_merkezi_yurutulur", note: "Dijital pazarlama ve kurumsal iletişim birimleri mevcuttur." }],
  general_note: "Pazarlama ve satış koordinasyonu aylık toplantılarla yürütülmektedir.",
});
assert(
  formattedQ1.summaryText.includes("Ayrı bir Pazarlama Departmanı (Dijital, İletişim, Ürün Yöneticileri) tarafından merkezi olarak yönetilir"),
  "Kullanıcı dostu label formatlandı (ayri_ve_uzmanlasmis... enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("Dijital pazarlama ve kurumsal iletişim birimleri mevcuttur."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Pazarlama ve satış koordinasyonu aylık toplantılarla yürütülmektedir."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with MARKETING Data ===");
const mockMktReportModel: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "Pazarlama, Kampanya Yönetimi ve Lead Generation Keşif Analizi",
    companyName: "Atlas Global Kimya ve Endüstriyel Hammadde A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: {
      MARKETING: "tr.marketing.core v0.1.0",
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
    companyName: "Atlas Global Kimya ve Endüstriyel Hammadde A.Ş.",
    tradeName: "Atlas Kimya",
    taxNumber: "8889991122",
    city: "İstanbul",
    country: "Türkiye",
    employeeCount: "210",
    notes: "Omni-channel lead akışı, dijital reklam entegrasyonu, fuar follow-up ve kampanya ROI analizi tamamlandı.",
  },
  profile: {
    analysis_project_id: "p_faz21",
    executive_summary: "Kurumsal e-posta pazarlaması, web form entegrasyonu, MQL/SQL nitelendirme ve satışa lead devri incelendi.",
    overall_assessment: "Excel listeleri yerine CRM entegre dinamik hedef kitle segmentasyonu ve çoklu temas attribution mimarisi planlandı.",
    open_topics: "İYS entegrasyonu ve lead scoring ağırlık parametreleri netleştirilecek.",
  },
  scope: [
    {
      code: "MARKETING",
      nameTr: "Pazarlama ve Kampanya",
      nameEn: "Marketing & Campaigns",
      category: "Satış & Pazarlama",
      departmentName: "Pazarlama ve Kurumsal İletişim Direktörlüğü",
      responsiblePerson: "Elif Karaca",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
    },
  ],
  businessFunctions: [
    {
      code: "MARKETING",
      nameTr: "Pazarlama ve Kampanya",
      nameEn: "Marketing & Campaigns",
      category: "Satış & Pazarlama",
      sortOrder: 17,
      departmentName: "Pazarlama ve Kurumsal İletişim Direktörlüğü",
      responsiblePerson: "Elif Karaca",
      status: "completed",
      packId: "tr.marketing.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
      processes: [
        {
          name: "Pazarlama Organizasyonu",
          order: 1,
          questions: [
            {
              id: "MKT-001",
              order: 1,
              process: "Pazarlama Organizasyonu",
              questionText: "Şirketinizde pazarlama faaliyetleri (Kurumsal pazarlama, Dijital pazarlama, Ürün/Kategori pazarlaması, Etkinlik yönetimi) hangi organizasyonel yapıda ve ekip sorumluluğunda yürütülmektedir?",
              answerType: "single_choice",
              criticality: "high",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "ayri_ve_uzmanlasmis_pazarlama_departmani_tarafindan_merkezi_yurutulur",
                    label: "Ayrı bir Pazarlama Departmanı (Dijital, İletişim, Ürün Yöneticileri) tarafından merkezi olarak yönetilir",
                    isOther: false,
                    note: "Dijital pazarlama ve kurumsal iletişim birimleri mevcuttur.",
                  },
                ],
                summaryText: "• Ayrı bir Pazarlama Departmanı (Dijital, İletişim, Ürün Yöneticileri) tarafından merkezi olarak yönetilir",
              },
              findings: [
                {
                  id: "f_mkt_01",
                  title: "Web Formlarından Gelen Taleplerin Takipsizliği",
                  description: "Web sitesinden gelen formların e-postada beklemesi ve satışa geç aktarılması lead kaybına yol açmaktadır.",
                  priority: "high",
                  status: "open",
                  questionId: "MKT-001",
                  createdAt: "2026-08-20",
                },
              ],
              requirements: [
                {
                  id: "req_mkt_01",
                  title: "Web-to-Lead API ve Otomatik Satış Yönlendirme",
                  description: "Tüm web ve reklam formları anında CRM lead havuzuna akmalı ve ilgili satış temsilcisine SLA ile atanmalıdır.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "MKT-001",
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
          id: "f_mkt_01",
          title: "Web Formlarından Gelen Taleplerin Takipsizliği",
          description: "Web sitesinden gelen formların e-postada beklemesi ve satışa geç aktarılması lead kaybına yol açmaktadır.",
          priority: "high",
          status: "open",
          questionId: "MKT-001",
          createdAt: "2026-08-20",
        },
      ],
      requirements: [
        {
          id: "req_mkt_01",
          title: "Web-to-Lead API ve Otomatik Satış Yönlendirme",
          description: "Tüm web ve reklam formları anında CRM lead havuzuna akmalı ve ilgili satış temsilcisine SLA ile atanmalıdır.",
          priority: "critical",
          status: "confirmed",
          questionId: "MKT-001",
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
const docxBuffer = await buildDocxBuffer(mockMktReportModel);
assert(docxBuffer.length > 5000, `DOCX üretimi başarılı (${docxBuffer.length} byte)`);

// PDF Testi
const pdfBuffer = await buildPdfBuffer(mockMktReportModel);
assert(pdfBuffer.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.length} byte)`);

// PDF Text Extraction & Türkçe Karakter Kontrolü
const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");
assert(pdfText.includes("Pazarlama ve Kampanya"), "PDF çıktısında 'Pazarlama ve Kampanya' başlığı mevcut");
assert(pdfText.includes("Atlas Global Kimya ve Endüstriyel Hammadde A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Web-to-Lead API ve Otomatik Satış Yönlendirme"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockMktReportModel.metadata.packVersions.MARKETING === "tr.marketing.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("MARKETING");
assert(mappedPackId === "tr.marketing.core", `getPackIdForFunction("MARKETING") -> tr.marketing.core`);

console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-21 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
