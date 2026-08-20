/**
 * ERP CRM Discovery — FAZ-23 Quality Question Pack Acceptance Test Suite
 *
 * Automated verification for:
 * 1. Pack Loading & Metadata Integrity (tr.quality.core v0.1.0, canonical code = QUALITY)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (42 questions, sequential order 1..42, QLT-001..QLT-042)
 * 4. Required Question Count Truth (22 required, 20 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 20 Canonical Process Coverage
 * 7. Conditional Branching Resolution (branching engine with Map)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (verifying zero overlap with SUPPLIER_MANAGEMENT, PROCUREMENT, WAREHOUSE, INVENTORY, LOGISTICS, ACCOUNTING, TREASURY, BUDGET_REPORTING, REPORTING_ANALYTICS, SALES, CRM, PROPOSALS, and MARKETING)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("QUALITY") === "tr.quality.core")
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
console.log("FAZ-23: KALİTE KONTROL / QUALITY TEST");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/quality/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "QUALITY pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.quality.core", "pack_id = tr.quality.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.schema_version === "1", "schema_version = 1");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "QUALITY", "business_function_code = QUALITY (Kanonik Kod)");
assert(pack.meta.name === "Kalite Kontrol Ön Analizi", "name = Kalite Kontrol Ön Analizi");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 20, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validationResult = validateQuestionPack(pack);
if (!validationResult.valid) {
  console.error("   Doğrulama hataları:", validationResult.errors);
}
assert(validationResult.valid === true, "validateQuestionPack(qualityPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity, Deterministic Order & IDs ────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 42, `Toplam soru sayısı tam 42 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 42, "Tüm 42 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `QLT-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: index ${i}, id: ${pack.questions[i].id}, order: ${pack.questions[i].order}`);
  }
}
assert(orderCorrect, "Tüm sorular QLT-001'den QLT-042'ye sıralı ve deterministiktir");

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
  "Kalite Organizasyonu",
  "Kalite Planları ve Kontrol Spesifikasyonları",
  "Giriş Kalite Kontrol",
  "Proses / Ara Kontrol",
  "Final Kalite Kontrol",
  "Numune Alma",
  "Ölçüm ve Kontrol Kriterleri",
  "Tolerans ve Kabul Limitleri",
  "Kalite Sonucu ve Serbest Bırakma",
  "Uygunsuzluk Yönetimi",
  "NCR / Non-Conformance",
  "Karantina ve Disposition",
  "Yeniden İşleme / Rework",
  "Hurda ve Şartlı Kabul",
  "Kök Neden Analizi",
  "CAPA / Düzeltici ve Önleyici Faaliyet",
  "Ölçüm Cihazı / Kalibrasyon Bağlantısı",
  "Lot / Seri İzlenebilirliği",
  "Kalite Dokümanları ve Sertifikalar",
  "Kalite Raporlama ve KPI",
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

// Senaryo 1: Giriş kalite yoksa QLT-006 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("QLT-005", { selected: [{ value: "giris_kalite_kontrol_yapilmamaktadir" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "QLT-006"), "QLT-005=giris_kalite_kontrol_yapilmamaktadir iken QLT-006 gizlendi");

answersScenario1.set("QLT-005", { selected: [{ value: "tum_veya_belirlenmis_kritik_hammaddeler_giris_kalite_kontrolunden_gecer" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "QLT-006"), "QLT-005=tum_veya_belirlenmis... iken QLT-006 görünür");

// Senaryo 2: Proses kalite yoksa QLT-008 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("QLT-007", { selected: [{ value: "proses_kalite_kontrol_yapilmamaktadir" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "QLT-008"), "QLT-007=proses_kalite_kontrol_yapilmamaktadir iken QLT-008 gizlendi");

answersScenario2.set("QLT-007", { selected: [{ value: "is_emri_ve_operasyon_bazinda_sistemik_ara_kalite_onaylari_zorunludur" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "QLT-008"), "QLT-007=is_emri_ve_operasyon... iken QLT-008 görünür");

// Senaryo 3: Final kalite yoksa QLT-010 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("QLT-009", { selected: [{ value: "final_kalite_kontrol_yapilmamaktadir" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "QLT-010"), "QLT-009=final_kalite_kontrol_yapilmamaktadir iken QLT-010 gizlendi");

answersScenario3.set("QLT-009", { selected: [{ value: "bitmis_tum_mamuller_final_kontrol_ve_fonksiyon_testinden_gecerek_onaylanir" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "QLT-010"), "QLT-009=bitmis_tum_mamuller... iken QLT-010 görünür");

// Senaryo 4: Sayısal ölçüm yoksa QLT-016 gizlenmeli
const answersScenario4 = new Map<string, AnswerData>();
answersScenario4.set("QLT-015", { selected: [{ value: "sayisal_olcum_ve_tolerans_takibi_yapilmamaktadir" }] });
const visibleQ7 = getVisibleQuestions(pack.questions, answersScenario4);
assert(!visibleQ7.some((q) => q.id === "QLT-016"), "QLT-015=sayisal_olcum_ve_tolerans... iken QLT-016 gizlendi");

answersScenario4.set("QLT-015", { selected: [{ value: "nominal_ve_tolerans_limitleri_tanimlidir_olcum_girildiginde_sistem_uygunlugu_otomatik_hesaplar" }] });
const visibleQ8 = getVisibleQuestions(pack.questions, answersScenario4);
assert(visibleQ8.some((q) => q.id === "QLT-016"), "QLT-015=nominal_ve_tolerans... iken QLT-016 görünür");

// Senaryo 5: NCR yoksa QLT-022 gizlenmeli
const answersScenario5 = new Map<string, AnswerData>();
answersScenario5.set("QLT-021", { selected: [{ value: "ncr_kaydi_acilmamaktadir" }] });
const visibleQ9 = getVisibleQuestions(pack.questions, answersScenario5);
assert(!visibleQ9.some((q) => q.id === "QLT-022"), "QLT-021=ncr_kaydi_acilmamaktadir iken QLT-022 gizlendi");

answersScenario5.set("QLT-021", { selected: [{ value: "sistemden_otomatik_numarali_ncr_karti_acilir_ve_cozum_sureci_is_akisiyla_yonetilir" }] });
const visibleQ10 = getVisibleQuestions(pack.questions, answersScenario5);
assert(visibleQ10.some((q) => q.id === "QLT-022"), "QLT-021=sistemden_otomatik_numarali... iken QLT-022 görünür");

// Senaryo 6: CAPA yoksa QLT-032 gizlenmeli
const answersScenario6 = new Map<string, AnswerData>();
answersScenario6.set("QLT-031", { selected: [{ value: "capa_sureci_uygulanmamaktadir" }] });
const visibleQ11 = getVisibleQuestions(pack.questions, answersScenario6);
assert(!visibleQ11.some((q) => q.id === "QLT-032"), "QLT-031=capa_sureci_uygulanmamaktadir iken QLT-032 gizlendi");

answersScenario6.set("QLT-031", { selected: [{ value: "sistem_uzerinden_sorumlusu_ve_termin_tarihi_olan_capa_is_akisi_yurutulur" }] });
const visibleQ12 = getVisibleQuestions(pack.questions, answersScenario6);
assert(visibleQ12.some((q) => q.id === "QLT-032"), "QLT-031=sistem_uzerinden_sorumlusu... iken QLT-032 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `22 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("QLT-003", {
  id: "qf_qlt_03",
  analysis_project_id: "p1",
  business_function_code: "QUALITY",
  question_id: "QLT-003",
  flag_type: "critical",
  note: "Ürün bazlı kalite kontrol planı parametreleri Kalite Güvence Müdürü ile netleştirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("QLT-021", {
  id: "qf_qlt_21",
  analysis_project_id: "p1",
  business_function_code: "QUALITY",
  question_id: "QLT-021",
  flag_type: "revisit",
  note: "NCR numara serisi ve hata kodu kataloğu standartlaştırılacak",
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
const supPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/supplier_management/core.json"), "utf-8")) as QuestionPack;
const procPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/procurement/core.json"), "utf-8")) as QuestionPack;
const accPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/accounting/core.json"), "utf-8")) as QuestionPack;
const whPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/warehouse/core.json"), "utf-8")) as QuestionPack;
const invPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/inventory/core.json"), "utf-8")) as QuestionPack;
const logPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/logistics/core.json"), "utf-8")) as QuestionPack;
const trsPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/treasury/core.json"), "utf-8")) as QuestionPack;
const bgtPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/budget_reporting/core.json"), "utf-8")) as QuestionPack;
const rptPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/reporting_analytics/core.json"), "utf-8")) as QuestionPack;
const salesPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/sales/core.json"), "utf-8")) as QuestionPack;
const crmPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/crm/core.json"), "utf-8")) as QuestionPack;
const prpPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/proposals/core.json"), "utf-8")) as QuestionPack;
const mktPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/marketing/core.json"), "utf-8")) as QuestionPack;

const qltQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
const supQuestionTexts = supPack.questions.map((q) => q.question.toLowerCase().trim());
const procQuestionTexts = procPack.questions.map((q) => q.question.toLowerCase().trim());
const accQuestionTexts = accPack.questions.map((q) => q.question.toLowerCase().trim());
const whQuestionTexts = whPack.questions.map((q) => q.question.toLowerCase().trim());
const invQuestionTexts = invPack.questions.map((q) => q.question.toLowerCase().trim());
const logQuestionTexts = logPack.questions.map((q) => q.question.toLowerCase().trim());
const trsQuestionTexts = trsPack.questions.map((q) => q.question.toLowerCase().trim());
const bgtQuestionTexts = bgtPack.questions.map((q) => q.question.toLowerCase().trim());
const rptQuestionTexts = rptPack.questions.map((q) => q.question.toLowerCase().trim());
const salesQuestionTexts = salesPack.questions.map((q) => q.question.toLowerCase().trim());
const crmQuestionTexts = crmPack.questions.map((q) => q.question.toLowerCase().trim());
const prpQuestionTexts = prpPack.questions.map((q) => q.question.toLowerCase().trim());
const mktQuestionTexts = mktPack.questions.map((q) => q.question.toLowerCase().trim());

let supOverlapCount = 0;
for (const qq of qltQuestionTexts) {
  if (supQuestionTexts.includes(qq)) {
    supOverlapCount++;
    console.error(`Supplier Management ile birebir örtüşen soru bulundu: "${qq}"`);
  }
}
assert(supOverlapCount === 0, "Supplier Management soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let procOverlapCount = 0;
for (const qq of qltQuestionTexts) {
  if (procQuestionTexts.includes(qq)) {
    procOverlapCount++;
    console.error(`Procurement ile birebir örtüşen soru bulundu: "${qq}"`);
  }
}
assert(procOverlapCount === 0, "Procurement soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let whOverlapCount = 0;
for (const qq of qltQuestionTexts) {
  if (whQuestionTexts.includes(qq)) {
    whOverlapCount++;
    console.error(`Warehouse ile birebir örtüşen soru bulundu: "${qq}"`);
  }
}
assert(whOverlapCount === 0, "Warehouse soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let invOverlapCount = 0;
for (const qq of qltQuestionTexts) {
  if (invQuestionTexts.includes(qq)) {
    invOverlapCount++;
    console.error(`Inventory ile birebir örtüşen soru bulundu: "${qq}"`);
  }
}
assert(invOverlapCount === 0, "Inventory soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let crmOverlapCount = 0;
for (const qq of qltQuestionTexts) {
  if (crmQuestionTexts.includes(qq)) {
    crmOverlapCount++;
    console.error(`CRM ile birebir örtüşen soru bulundu: "${qq}"`);
  }
}
assert(crmOverlapCount === 0, "CRM soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let accOverlapCount = 0;
for (const qq of qltQuestionTexts) {
  if (accQuestionTexts.includes(qq)) {
    accOverlapCount++;
    console.error(`Accounting ile birebir örtüşen soru bulundu: "${qq}"`);
  }
}
assert(accOverlapCount === 0, "Accounting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let trsOverlapCount = 0;
for (const qq of qltQuestionTexts) {
  if (trsQuestionTexts.includes(qq)) {
    trsOverlapCount++;
    console.error(`Treasury ile birebir örtüşen soru bulundu: "${qq}"`);
  }
}
assert(trsOverlapCount === 0, "Treasury soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let bgtOverlapCount = 0;
for (const qq of qltQuestionTexts) {
  if (bgtQuestionTexts.includes(qq)) {
    bgtOverlapCount++;
    console.error(`Budget Reporting ile birebir örtüşen soru bulundu: "${qq}"`);
  }
}
assert(bgtOverlapCount === 0, "Budget Reporting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let rptOverlapCount = 0;
for (const qq of qltQuestionTexts) {
  if (rptQuestionTexts.includes(qq)) {
    rptOverlapCount++;
    console.error(`Reporting Analytics ile birebir örtüşen soru bulundu: "${qq}"`);
  }
}
assert(rptOverlapCount === 0, "Reporting Analytics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let salesOverlapCount = 0;
for (const qq of qltQuestionTexts) {
  if (salesQuestionTexts.includes(qq)) {
    salesOverlapCount++;
    console.error(`Sales ile birebir örtüşen soru bulundu: "${qq}"`);
  }
}
assert(salesOverlapCount === 0, "Sales soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let prpOverlapCount = 0;
for (const qq of qltQuestionTexts) {
  if (prpQuestionTexts.includes(qq)) {
    prpOverlapCount++;
    console.error(`Proposals ile birebir örtüşen soru bulundu: "${qq}"`);
  }
}
assert(prpOverlapCount === 0, "Proposals soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let mktOverlapCount = 0;
for (const qq of qltQuestionTexts) {
  if (mktQuestionTexts.includes(qq)) {
    mktOverlapCount++;
    console.error(`Marketing ile birebir örtüşen soru bulundu: "${qq}"`);
  }
}
assert(mktOverlapCount === 0, "Marketing soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let logOverlapCount = 0;
for (const qq of qltQuestionTexts) {
  if (logQuestionTexts.includes(qq)) {
    logOverlapCount++;
    console.error(`Logistics ile birebir örtüşen soru bulundu: "${qq}"`);
  }
}
assert(logOverlapCount === 0, "Logistics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_qlt_001",
  analysis_project_id: "p1",
  business_function_code: "QUALITY",
  process_name: "Ölçüm Cihazı / Kalibrasyon Bağlantısı",
  question_text: "Laboratuvar test cihazları için MSA (Measurement System Analysis - Gage R&R) çalışmaları yapılmakta mıdır?",
  description: "Ölçüm sistemi analizi ve operatör/cihaz değişkenlik testleri.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_qlt_001", value: "gage_rr_yapilir", label: "Evet, yıllık Gage R&R çalışmaları yürütülür", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_qlt_001", value: "gage_rr_yapilmaz", label: "MSA veya Gage R&R çalışması yapılmamaktadır", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_qlt_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 43);
assert(adaptedQuestion.id === "cq_qlt_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Ölçüm Cihazı / Kalibrasyon Bağlantısı", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "uretimden_bagimsiz_ayri_bir_kalite_kontrol_ve_guvence_departmani_vardir", note: "Kalite Müdürü doğrudan Genel Müdüre bağlıdır." }],
  general_note: "Giriş, proses ve final kontrol olmak üzere 8 kişilik ekip mevcuttur.",
});
assert(
  formattedQ1.summaryText.includes("Üretimden bağımsız ayrı bir Kalite Departmanı (Giriş, Proses, Final ve QMS uzmanları) tarafından yönetilir"),
  "Kullanıcı dostu label formatlandı (uretimden_bagimsiz... enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("Kalite Müdürü doğrudan Genel Müdüre bağlıdır."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Giriş, proses ve final kontrol olmak üzere 8 kişilik ekip mevcuttur."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with QUALITY Data ===");
const mockQltReportModel: ReportModel = {
  metadata: {
    title: "ERP / QMS Ön Analiz Raporu",
    projectName: "Kalite Güvence, Kontrol Planları ve NCR/CAPA Keşif Analizi",
    companyName: "Anadolu Pres ve Hassas Döküm Sanayi A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: {
      QUALITY: "tr.quality.core v0.1.0",
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
    companyName: "Anadolu Pres ve Hassas Döküm Sanayi A.Ş.",
    tradeName: "Anadolu Pres",
    taxNumber: "8887776655",
    city: "Bursa",
    country: "Türkiye",
    employeeCount: "320",
    notes: "Giriş muayenesi, ilk parça onayı (FAI), CMM tolerans entegrasyonu ve 8D CAPA süreçleri incelendi.",
  },
  profile: {
    analysis_project_id: "p_faz23",
    executive_summary: "Kalite kontrol planları, tolerans denetimli stok serbest bırakma ve sistemik NCR/CAPA mimarisi belirlendi.",
    overall_assessment: "Kağıt formlarda tutulan test kayıtlarının ERP/QMS entegre dijital kalite kapılarına taşınması planlandı.",
    open_topics: "CMM ölçüm cihazı IoT veri aktarım protokolü ve şartlı kabul hiyerarşisi onaylanacak.",
  },
  scope: [
    {
      code: "QUALITY",
      nameTr: "Kalite Kontrol",
      nameEn: "Quality Control",
      category: "Üretim",
      departmentName: "Kalite Güvence ve Kontrol Müdürlüğü",
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
      code: "QUALITY",
      nameTr: "Kalite Kontrol",
      nameEn: "Quality Control",
      category: "Üretim",
      sortOrder: 20,
      departmentName: "Kalite Güvence ve Kontrol Müdürlüğü",
      responsiblePerson: "Zeynep Kaya",
      status: "completed",
      packId: "tr.quality.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
      processes: [
        {
          name: "Kalite Organizasyonu",
          order: 1,
          questions: [
            {
              id: "QLT-001",
              order: 1,
              process: "Kalite Organizasyonu",
              questionText: "Şirketinizde kalite kontrol ve güvence faaliyetleri (Giriş muayenesi, Proses kontrolleri, Laboratuvar testleri, Final kontrol, Belgelendirme) hangi organizasyonel yapıda ve ekip sorumluluğunda yürütülmektedir?",
              answerType: "single_choice",
              criticality: "high",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "uretimden_bagimsiz_ayri_bir_kalite_kontrol_ve_guvence_departmani_vardir",
                    label: "Üretimden bağımsız ayrı bir Kalite Departmanı (Giriş, Proses, Final ve QMS uzmanları) tarafından yönetilir",
                    isOther: false,
                    note: "Kalite Müdürü doğrudan Genel Müdüre bağlıdır.",
                  },
                ],
                summaryText: "• Üretimden bağımsız ayrı bir Kalite Departmanı (Giriş, Proses, Final ve QMS uzmanları) tarafından yönetilir",
              },
              findings: [
                {
                  id: "f_qlt_01",
                  title: "Tolerans Dışı Ölçümlerde Manuel Kabul Riski",
                  description: "Ölçüm değerleri sisteme girilmediği için tolerans aşımı olan parçalar operatör inisiyatifiyle montaja verilebilmektedir.",
                  priority: "high",
                  status: "open",
                  questionId: "QLT-001",
                  createdAt: "2026-08-20",
                },
              ],
              requirements: [
                {
                  id: "req_qlt_01",
                  title: "Sayısal Tolerans Denetimi ve Otomatik Blokaj",
                  description: "Min/Max tolerans limitleri sistemde tanımlanmalı, tolerans dışı ölçümde parti otomatik karantinaya kilitlenmelidir.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "QLT-001",
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
          id: "f_qlt_01",
          title: "Tolerans Dışı Ölçümlerde Manuel Kabul Riski",
          description: "Ölçüm değerleri sisteme girilmediği için tolerans aşımı olan parçalar operatör inisiyatifiyle montaja verilebilmektedir.",
          priority: "high",
          status: "open",
          questionId: "QLT-001",
          createdAt: "2026-08-20",
        },
      ],
      requirements: [
        {
          id: "req_qlt_01",
          title: "Sayısal Tolerans Denetimi ve Otomatik Blokaj",
          description: "Min/Max tolerans limitleri sistemde tanımlanmalı, tolerans dışı ölçümde parti otomatik karantinaya kilitlenmelidir.",
          priority: "critical",
          status: "confirmed",
          questionId: "QLT-001",
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
const docxBuffer = await buildDocxBuffer(mockQltReportModel);
assert(docxBuffer.length > 5000, `DOCX üretimi başarılı (${docxBuffer.length} byte)`);

// PDF Testi
const pdfBuffer = await buildPdfBuffer(mockQltReportModel);
assert(pdfBuffer.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.length} byte)`);

// PDF Text Extraction & Türkçe Karakter Kontrolü
const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");
assert(pdfText.includes("Kalite Kontrol"), "PDF çıktısında 'Kalite Kontrol' başlığı mevcut");
assert(pdfText.includes("Anadolu Pres ve Hassas Döküm Sanayi A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Sayısal Tolerans Denetimi ve Otomatik Blokaj"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockQltReportModel.metadata.packVersions.QUALITY === "tr.quality.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("QUALITY");
assert(mappedPackId === "tr.quality.core", `getPackIdForFunction("QUALITY") -> tr.quality.core`);

console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-23 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
