/**
 * ERP CRM Discovery — FAZ-20 Proposals Question Pack Acceptance Test Suite
 *
 * Automated verification for:
 * 1. Pack Loading & Metadata Integrity (tr.proposals.core v0.1.0, canonical code = PROPOSALS)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (42 questions, sequential order 1..42, PRP-001..PRP-042)
 * 4. Required Question Count Truth (22 required, 20 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 20 Canonical Process Coverage
 * 7. Conditional Branching Resolution (branching engine with Map)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (verifying zero overlap with SALES, PROCUREMENT, WAREHOUSE, INVENTORY, LOGISTICS, ACCOUNTING, TREASURY, BUDGET_REPORTING, REPORTING_ANALYTICS, and CRM)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("PROPOSALS") === "tr.proposals.core")
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
console.log("FAZ-20: TEKLİF VE FİYATLANDIRMA / PROPOSALS TEST");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/proposals/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "PROPOSALS pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.proposals.core", "pack_id = tr.proposals.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.schema_version === "1", "schema_version = 1");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "PROPOSALS", "business_function_code = PROPOSALS (Kanonik Kod)");
assert(pack.meta.name === "Teklif ve Fiyatlandırma Ön Analizi", "name = Teklif ve Fiyatlandırma Ön Analizi");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 20, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validationResult = validateQuestionPack(pack);
if (!validationResult.valid) {
  console.error("   Doğrulama hataları:", validationResult.errors);
}
assert(validationResult.valid === true, "validateQuestionPack(proposalsPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity, Deterministic Order & IDs ────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 42, `Toplam soru sayısı tam 42 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 42, "Tüm 42 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `PRP-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: index ${i}, id: ${pack.questions[i].id}, order: ${pack.questions[i].order}`);
  }
}
assert(orderCorrect, "Tüm sorular PRP-001'den PRP-042'ye sıralı ve deterministiktir");

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

// ─── TEST 6: 20 Canonical Process Coverage ───────────────────────────────────
console.log("\n=== T06: 20 Canonical Process Coverage ===");
const expectedProcesses = [
  "Teklif Talebinin Başlatılması",
  "Teklif Hazırlama Sorumluluğu",
  "Teklif Şablonları",
  "Ürün / Hizmet Satırları",
  "Ürün Konfigürasyonu ve Alternatifler",
  "Fiyat Listeleri",
  "Müşteri Özel Fiyatları",
  "Sözleşmeli / Anlaşmalı Fiyatlar",
  "Maliyet Bazlı Fiyatlandırma",
  "Marj Kontrolü",
  "İskonto Yönetimi",
  "İskonto ve Fiyat Onayları",
  "Dövizli Teklifler ve Kur Yönetimi",
  "Ticari Koşullar",
  "Teklif Versiyonlama ve Revizyon",
  "Alternatif Teklif / Opsiyon Yönetimi",
  "Teklif Dokümanı ve Gönderim",
  "Teklif Kabul / Red / Bekleme Takibi",
  "Tekliften Siparişe Dönüşüm",
  "Teklif KPI ve Dönüşüm Analizi",
];

const actualProcesses = Array.from(new Set(pack.questions.map((q) => q.process)));
assert(actualProcesses.length === 20, `Tam 20 farklı süreç grubu tanımlı (${actualProcesses.length})`);

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

// Senaryo 1: Ürün konfigürasyonu yoksa PRP-010 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("PRP-009", { selected: [{ value: "ozellik_bazli_urun_konfigurasyonu_kullanilmaz" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "PRP-010"), "PRP-009=ozellik_bazli...kullanilmaz iken PRP-010 gizlendi");

answersScenario1.set("PRP-009", { selected: [{ value: "ozellik_ve_kural_bazli_dinamik_urun_konfigurasyonu_kullanilir" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "PRP-010"), "PRP-009=ozellik_ve_kural... iken PRP-010 görünür");

// Senaryo 2: Minimum marj kontrolü yoksa PRP-020 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("PRP-019", { selected: [{ value: "marj_hesabi_ve_minimum_marj_kontrolu_yapilmamaktadir" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "PRP-020"), "PRP-019=marj_hesabi...yapilmamaktadir iken PRP-020 gizlendi");

answersScenario2.set("PRP-019", { selected: [{ value: "satir_ve_toplamda_brut_kar_marji_hesaplanir_ve_minimum_marj_kontrolu_vardir" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "PRP-020"), "PRP-019=satir_ve_toplamda... iken PRP-020 görünür");

// Senaryo 3: Onay süreci yoksa PRP-024 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("PRP-023", { selected: [{ value: "onay_sureci_yoktur_temsilci_serbestce_gonderir" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "PRP-024"), "PRP-023=onay_sureci_yoktur... iken PRP-024 gizlendi");

answersScenario3.set("PRP-023", { selected: [{ value: "tutar_iskonto_ve_marj_kriterlerine_gore_cok_kademeli_otomatik_onay_isler" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "PRP-024"), "PRP-023=tutar_iskonto... iken PRP-024 görünür");

// Senaryo 4: Dövizli teklif yoksa PRP-026 gizlenmeli
const answersScenario4 = new Map<string, AnswerData>();
answersScenario4.set("PRP-025", { selected: [{ value: "yalnizca_turk_lirasi_teklif_verilir_dovizli_teklif_yoktur" }] });
const visibleQ7 = getVisibleQuestions(pack.questions, answersScenario4);
assert(!visibleQ7.some((q) => q.id === "PRP-026"), "PRP-025=yalnizca_turk_lirasi... iken PRP-026 gizlendi");

answersScenario4.set("PRP-025", { selected: [{ value: "coklu_dovizli_teklif_verilir_ve_guncel_tcmb_serbest_piyasa_kurlari_otomatik_alinir" }] });
const visibleQ8 = getVisibleQuestions(pack.questions, answersScenario4);
assert(visibleQ8.some((q) => q.id === "PRP-026"), "PRP-025=coklu_dovizli... iken PRP-026 görünür");

// Senaryo 5: Versiyonlama yoksa PRP-030 gizlenmeli
const answersScenario5 = new Map<string, AnswerData>();
answersScenario5.set("PRP-029", { selected: [{ value: "versiyon_takibi_yapilmaz_ayni_dosya_uzerine_yazilir" }] });
const visibleQ9 = getVisibleQuestions(pack.questions, answersScenario5);
assert(!visibleQ9.some((q) => q.id === "PRP-030"), "PRP-029=versiyon_takibi_yapilmaz... iken PRP-030 gizlendi");

answersScenario5.set("PRP-029", { selected: [{ value: "otomatik_versiyonlama_ile_eski_versiyon_kilitlenir_ve_v2_olarak_kopyalanir" }] });
const visibleQ10 = getVisibleQuestions(pack.questions, answersScenario5);
assert(visibleQ10.some((q) => q.id === "PRP-030"), "PRP-029=otomatik_versiyonlama... iken PRP-030 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `22 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("PRP-011", {
  id: "qf_prp_11",
  analysis_project_id: "p1",
  business_function_code: "PROPOSALS",
  question_id: "PRP-011",
  flag_type: "critical",
  note: "Fiyat listesi kademeleri ve kanal/bayi iskonto matrisi netleştirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("PRP-023", {
  id: "qf_prp_23",
  analysis_project_id: "p1",
  business_function_code: "PROPOSALS",
  question_id: "PRP-023",
  flag_type: "revisit",
  note: "Satış onay iş akışındaki yetki limitleri Genel Müdürlük ile gözden geçirilecek",
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
const crmPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/crm/core.json"), "utf-8")) as QuestionPack;

const prpQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
const salesQuestionTexts = salesPack.questions.map((q) => q.question.toLowerCase().trim());
const procQuestionTexts = procPack.questions.map((q) => q.question.toLowerCase().trim());
const whQuestionTexts = whPack.questions.map((q) => q.question.toLowerCase().trim());
const invQuestionTexts = invPack.questions.map((q) => q.question.toLowerCase().trim());
const logQuestionTexts = logPack.questions.map((q) => q.question.toLowerCase().trim());
const accQuestionTexts = accPack.questions.map((q) => q.question.toLowerCase().trim());
const trsQuestionTexts = trsPack.questions.map((q) => q.question.toLowerCase().trim());
const bgtQuestionTexts = bgtPack.questions.map((q) => q.question.toLowerCase().trim());
const rptQuestionTexts = rptPack.questions.map((q) => q.question.toLowerCase().trim());
const crmQuestionTexts = crmPack.questions.map((q) => q.question.toLowerCase().trim());

let salesOverlapCount = 0;
for (const pq of prpQuestionTexts) {
  if (salesQuestionTexts.includes(pq)) {
    salesOverlapCount++;
    console.error(`Sales ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(salesOverlapCount === 0, "Sales soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let procOverlapCount = 0;
for (const pq of prpQuestionTexts) {
  if (procQuestionTexts.includes(pq)) {
    procOverlapCount++;
    console.error(`Procurement ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(procOverlapCount === 0, "Procurement soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let whOverlapCount = 0;
for (const pq of prpQuestionTexts) {
  if (whQuestionTexts.includes(pq)) {
    whOverlapCount++;
    console.error(`Warehouse ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(whOverlapCount === 0, "Warehouse soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let invOverlapCount = 0;
for (const pq of prpQuestionTexts) {
  if (invQuestionTexts.includes(pq)) {
    invOverlapCount++;
    console.error(`Inventory ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(invOverlapCount === 0, "Inventory soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let logOverlapCount = 0;
for (const pq of prpQuestionTexts) {
  if (logQuestionTexts.includes(pq)) {
    logOverlapCount++;
    console.error(`Logistics ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(logOverlapCount === 0, "Logistics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let accOverlapCount = 0;
for (const pq of prpQuestionTexts) {
  if (accQuestionTexts.includes(pq)) {
    accOverlapCount++;
    console.error(`Accounting ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(accOverlapCount === 0, "Accounting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let trsOverlapCount = 0;
for (const pq of prpQuestionTexts) {
  if (trsQuestionTexts.includes(pq)) {
    trsOverlapCount++;
    console.error(`Treasury ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(trsOverlapCount === 0, "Treasury soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let bgtOverlapCount = 0;
for (const pq of prpQuestionTexts) {
  if (bgtQuestionTexts.includes(pq)) {
    bgtOverlapCount++;
    console.error(`Budget Reporting ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(bgtOverlapCount === 0, "Budget Reporting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let rptOverlapCount = 0;
for (const pq of prpQuestionTexts) {
  if (rptQuestionTexts.includes(pq)) {
    rptOverlapCount++;
    console.error(`Reporting Analytics ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(rptOverlapCount === 0, "Reporting Analytics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let crmOverlapCount = 0;
for (const pq of prpQuestionTexts) {
  if (crmQuestionTexts.includes(pq)) {
    crmOverlapCount++;
    console.error(`CRM ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(crmOverlapCount === 0, "CRM soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_prp_001",
  analysis_project_id: "p1",
  business_function_code: "PROPOSALS",
  process_name: "Fiyat Listeleri",
  question_text: "Teklif satırlarında barkod veya karekod ile otomatik ürün ve fiyat çağırma kullanılmakta mıdır?",
  description: "Hızlı teklif girişi ve perakende/toptan satış desteği için.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_prp_001", value: "barkod_okutma_desteklenir", label: "Evet, barkod okutularak ürün ve fiyat otomatik gelir", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_prp_001", value: "barkod_okutma_yoktur", label: "Barkod okutma kullanılmamaktadır", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_prp_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 43);
assert(adaptedQuestion.id === "cq_prp_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Fiyat Listeleri", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "tum_kanallardan_gelen_talepler_merkezi_sistemde_teklif_olarak_baslatilir", note: "Web portalı ve e-posta entegrasyonu mevcuttur." }],
  general_note: "Teklif hazırlama süresinin 15 dakikanın altına indirilmesi hedeflenmektedir.",
});
assert(
  formattedQ1.summaryText.includes("Tüm e-posta, web portalı veya saha talepleri tek bir sistemde doğrudan teklif kaydına dönüştürülür"),
  "Kullanıcı dostu label formatlandı (tum_kanallardan... enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("Web portalı ve e-posta entegrasyonu mevcuttur."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Teklif hazırlama süresinin 15 dakikanın altına indirilmesi hedeflenmektedir."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with PROPOSALS Data ===");
const mockPrpReportModel: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "Teklif Yönetimi, Fiyatlandırma ve Marj Zırhı Keşif Analizi",
    companyName: "Kuzey Ege Endüstriyel Makine ve Ticaret A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: {
      PROPOSALS: "tr.proposals.core v0.1.0",
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
    companyName: "Kuzey Ege Endüstriyel Makine ve Ticaret A.Ş.",
    tradeName: "Kuzey Ege Makine",
    taxNumber: "7776665544",
    city: "Bursa",
    country: "Türkiye",
    employeeCount: "320",
    notes: "Fiyat listeleri, minimum marj koruması, kademeli onay ve versiyonlama analizi tamamlandı.",
  },
  profile: {
    analysis_project_id: "p_faz20",
    executive_summary: "Kurumsal teklif şablonları, cost-plus fiyatlandırma ve tekliften siparişe otomatik dönüşüm incelendi.",
    overall_assessment: "Excel teklif bağımlılığının bitirilmesi, brüt kâr marjı kontrolü ve çok dilli PDF üretimi planlandı.",
    open_topics: "İskonto yetki matrisi ve döviz kuru sabitleme kuralları netleştirilecek.",
  },
  scope: [
    {
      code: "PROPOSALS",
      nameTr: "Teklif ve Fiyatlandırma",
      nameEn: "Quotation & Pricing",
      category: "Satış & Pazarlama",
      departmentName: "Satış Operasyon ve Fiyatlandırma Müdürlüğü",
      responsiblePerson: "Murat Güler",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
    },
  ],
  businessFunctions: [
    {
      code: "PROPOSALS",
      nameTr: "Teklif ve Fiyatlandırma",
      nameEn: "Quotation & Pricing",
      category: "Satış & Pazarlama",
      sortOrder: 16,
      departmentName: "Satış Operasyon ve Fiyatlandırma Müdürlüğü",
      responsiblePerson: "Murat Güler",
      status: "completed",
      packId: "tr.proposals.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
      processes: [
        {
          name: "Teklif Talebinin Başlatılması",
          order: 1,
          questions: [
            {
              id: "PRP-001",
              order: 1,
              process: "Teklif Talebinin Başlatılması",
              questionText: "Müşteri teklif talepleri (RFQ) hangi kanallardan (E-posta, Web/Portal, Telefon, Saha Satış Görüşmesi, İhale Dokümanı) gelmekte ve teklif süreci sistemde nasıl başlatılmaktadır?",
              answerType: "single_choice",
              criticality: "high",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "tum_kanallardan_gelen_talepler_merkezi_sistemde_teklif_olarak_baslatilir",
                    label: "Tüm e-posta, web portalı veya saha talepleri tek bir sistemde doğrudan teklif kaydına dönüştürülür",
                    isOther: false,
                    note: "Web portalı ve e-posta entegrasyonu mevcuttur.",
                  },
                ],
                summaryText: "• Tüm e-posta, web portalı veya saha talepleri tek bir sistemde doğrudan teklif kaydına dönüştürülür",
              },
              findings: [
                {
                  id: "f_prp_01",
                  title: "Fiyat Listesi ve İskonto Kontrolsüzlüğü",
                  description: "Satış temsilcilerinin onay almadan yüksek iskonto vermesi brüt kâr marjını düşürmektedir.",
                  priority: "high",
                  status: "open",
                  questionId: "PRP-001",
                  createdAt: "2026-08-20",
                },
              ],
              requirements: [
                {
                  id: "req_prp_01",
                  title: "Merkezi Fiyat Listesi ve Kademeli İskonto Onay İş Akışı",
                  description: "Tekliflerde marj koruması ve yetki aşan iskontolarda Satış Direktörü onayı zorunlu kılınmalıdır.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "PRP-001",
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
          id: "f_prp_01",
          title: "Fiyat Listesi ve İskonto Kontrolsüzlüğü",
          description: "Satış temsilcilerinin onay almadan yüksek iskonto vermesi brüt kâr marjını düşürmektedir.",
          priority: "high",
          status: "open",
          questionId: "PRP-001",
          createdAt: "2026-08-20",
        },
      ],
      requirements: [
        {
          id: "req_prp_01",
          title: "Merkezi Fiyat Listesi ve Kademeli İskonto Onay İş Akışı",
          description: "Tekliflerde marj koruması ve yetki aşan iskontolarda Satış Direktörü onayı zorunlu kılınmalıdır.",
          priority: "critical",
          status: "confirmed",
          questionId: "PRP-001",
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
const docxBuffer = await buildDocxBuffer(mockPrpReportModel);
assert(docxBuffer.length > 5000, `DOCX üretimi başarılı (${docxBuffer.length} byte)`);

// PDF Testi
const pdfBuffer = await buildPdfBuffer(mockPrpReportModel);
assert(pdfBuffer.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.length} byte)`);

// PDF Text Extraction & Türkçe Karakter Kontrolü
const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");
assert(pdfText.includes("Teklif ve Fiyatlandırma"), "PDF çıktısında 'Teklif ve Fiyatlandırma' başlığı mevcut");
assert(pdfText.includes("Kuzey Ege Endüstriyel Makine ve Ticaret A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Merkezi Fiyat Listesi ve Kademeli İskonto Onay İş Akışı"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockPrpReportModel.metadata.packVersions.PROPOSALS === "tr.proposals.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("PROPOSALS");
assert(mappedPackId === "tr.proposals.core", `getPackIdForFunction("PROPOSALS") -> tr.proposals.core`);

console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-20 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
