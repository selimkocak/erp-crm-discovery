/**
 * ERP CRM Discovery — FAZ-22 Supplier Management Question Pack Acceptance Test Suite
 *
 * Automated verification for:
 * 1. Pack Loading & Metadata Integrity (tr.supplier_management.core v0.1.0, canonical code = SUPPLIER_MANAGEMENT)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (42 questions, sequential order 1..42, SUP-001..SUP-042)
 * 4. Required Question Count Truth (22 required, 20 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 19 Canonical Process Coverage
 * 7. Conditional Branching Resolution (branching engine with Map)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (verifying zero overlap with PROCUREMENT, ACCOUNTING, INVENTORY, WAREHOUSE, LOGISTICS, TREASURY, BUDGET_REPORTING, REPORTING_ANALYTICS, SALES, CRM, PROPOSALS, and MARKETING)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("SUPPLIER_MANAGEMENT") === "tr.supplier_management.core")
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
console.log("FAZ-22: TEDARİKÇİ YÖNETİMİ / SUPPLIER_MANAGEMENT TEST");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/supplier_management/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "SUPPLIER_MANAGEMENT pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.supplier_management.core", "pack_id = tr.supplier_management.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.schema_version === "1", "schema_version = 1");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "SUPPLIER_MANAGEMENT", "business_function_code = SUPPLIER_MANAGEMENT (Kanonik Kod)");
assert(pack.meta.name === "Tedarikçi Yönetimi Ön Analizi", "name = Tedarikçi Yönetimi Ön Analizi");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 20, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validationResult = validateQuestionPack(pack);
if (!validationResult.valid) {
  console.error("   Doğrulama hataları:", validationResult.errors);
}
assert(validationResult.valid === true, "validateQuestionPack(supplierManagementPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity, Deterministic Order & IDs ────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 42, `Toplam soru sayısı tam 42 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 42, "Tüm 42 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `SUP-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: index ${i}, id: ${pack.questions[i].id}, order: ${pack.questions[i].order}`);
  }
}
assert(orderCorrect, "Tüm sorular SUP-001'den SUP-042'ye sıralı ve deterministiktir");

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
  "Tedarikçi Ana Veri Yapısı",
  "Aday Tedarikçi Yönetimi",
  "Tedarikçi Açılış Süreci",
  "Tedarikçi Onay Süreci",
  "Onaylı Tedarikçi Listesi",
  "Tedarikçi Sınıflandırması",
  "Ürün / Hizmet / Kategori Yetkinliği",
  "Alternatif Tedarikçi Yönetimi",
  "Kritik ve Stratejik Tedarikçiler",
  "Tek Kaynak / Bağımlılık Riski",
  "Tedarikçi Belge ve Sertifikaları",
  "Tedarikçi Kalite Performansı",
  "Teslimat Performansı",
  "Ticari Performans",
  "Tedarikçi Değerlendirme / Scorecard",
  "Tedarikçi Risk Yönetimi",
  "Askıya Alma / Blokaj / Kara Liste",
  "Tedarikçi Geliştirme",
  "Tedarikçi Raporlama ve KPI",
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

// Senaryo 1: Onaylı Tedarikçi Listesi yoksa SUP-010 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("SUP-009", { selected: [{ value: "onayli_tedarikci_listesi_kullanilmamaktadir" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "SUP-010"), "SUP-009=onayli_tedarikci_listesi_kullanilmamaktadir iken SUP-010 gizlendi");

answersScenario1.set("SUP-009", { selected: [{ value: "malzeme_ve_kategori_bazinda_dinamik_onayli_tedarikci_listesi_yonetilir" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "SUP-010"), "SUP-009=malzeme_ve_kategori... iken SUP-010 görünür");

// Senaryo 2: Alternatif tedarikçi yoksa SUP-016 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("SUP-015", { selected: [{ value: "alternatif_tedarikci_yonetimi_yoktur_tek_kaynakla_calisilir" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "SUP-016"), "SUP-015=alternatif_tedarikci...yoktur iken SUP-016 gizlendi");

answersScenario2.set("SUP-015", { selected: [{ value: "her_kritik_malzeme_icin_onayli_birincil_ve_ikincil_alternatif_tedarikciler_tanimlidir" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "SUP-016"), "SUP-015=her_kritik_malzeme... iken SUP-016 görünür");

// Senaryo 3: Sertifika takibi yoksa SUP-022 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("SUP-021", { selected: [{ value: "sertifika_ve_belgeler_sistemde_takip_edilmemektedir" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "SUP-022"), "SUP-021=sertifika_ve_belgeler... iken SUP-022 gizlendi");

answersScenario3.set("SUP-021", { selected: [{ value: "tum_sertifikalar_belge_tipi_ve_gecerlilik_bitis_tarihiyle_sistemde_tutulur" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "SUP-022"), "SUP-021=tum_sertifikalar... iken SUP-022 görünür");

// Senaryo 4: Scorecard yoksa SUP-030 gizlenmeli
const answersScenario4 = new Map<string, AnswerData>();
answersScenario4.set("SUP-029", { selected: [{ value: "tedarikci_degerlendirme_karnesi_kullanilmamaktadir" }] });
const visibleQ7 = getVisibleQuestions(pack.questions, answersScenario4);
assert(!visibleQ7.some((q) => q.id === "SUP-030"), "SUP-029=tedarikci_degerlendirme...kullanilmamaktadir iken SUP-030 gizlendi");

answersScenario4.set("SUP-029", { selected: [{ value: "erp_uzerinde_kalite_teslimat_fiyat_ve_hizmet_agirlikli_otomatik_scorecard_calisir" }] });
const visibleQ8 = getVisibleQuestions(pack.questions, answersScenario4);
assert(visibleQ8.some((q) => q.id === "SUP-030"), "SUP-029=erp_uzerinde_kalite... iken SUP-030 görünür");

// Senaryo 5: Sistemik blokaj yoksa SUP-034 gizlenmeli
const answersScenario5 = new Map<string, AnswerData>();
answersScenario5.set("SUP-033", { selected: [{ value: "sistemik_tedarikci_blokaji_bulunmamaktadir" }] });
const visibleQ9 = getVisibleQuestions(pack.questions, answersScenario5);
assert(!visibleQ9.some((q) => q.id === "SUP-034"), "SUP-033=sistemik_tedarikci_blokaji... iken SUP-034 gizlendi");

answersScenario5.set("SUP-033", { selected: [{ value: "tedarikci_satinalma_veya_odeme_duzeyinde_sistemden_bloke_edilebilir" }] });
const visibleQ10 = getVisibleQuestions(pack.questions, answersScenario5);
assert(visibleQ10.some((q) => q.id === "SUP-034"), "SUP-033=tedarikci_satinalma... iken SUP-034 görünür");

// Senaryo 6: Tedarikçi geliştirme yoksa SUP-036 gizlenmeli
const answersScenario6 = new Map<string, AnswerData>();
answersScenario6.set("SUP-035", { selected: [{ value: "tedarikci_duzeltici_faaliyet_ve_gelistirme_yapilmaz" }] });
const visibleQ11 = getVisibleQuestions(pack.questions, answersScenario6);
assert(!visibleQ11.some((q) => q.id === "SUP-036"), "SUP-035=tedarikci_duzeltici...yapilmaz iken SUP-036 gizlendi");

answersScenario6.set("SUP-035", { selected: [{ value: "resmi_scar_ve_gelistirme_aksiyon_plani_sistem_uzerinden_tedarikciye_iletilir_ve_izlenir" }] });
const visibleQ12 = getVisibleQuestions(pack.questions, answersScenario6);
assert(visibleQ12.some((q) => q.id === "SUP-036"), "SUP-035=resmi_scar... iken SUP-036 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `22 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("SUP-009", {
  id: "qf_sup_09",
  analysis_project_id: "p1",
  business_function_code: "SUPPLIER_MANAGEMENT",
  question_id: "SUP-009",
  flag_type: "critical",
  note: "Onaylı tedarikçi listesi (AVL) ve kategori kısıtlamaları Satın Alma Müdürü ile netleştirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("SUP-029", {
  id: "qf_sup_29",
  analysis_project_id: "p1",
  business_function_code: "SUPPLIER_MANAGEMENT",
  question_id: "SUP-029",
  flag_type: "revisit",
  note: "Tedarikçi değerlendirme scorecard ağırlık katsayıları Kalite Güvence ile belirlenecek",
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

const supQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
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

let procOverlapCount = 0;
for (const sq of supQuestionTexts) {
  if (procQuestionTexts.includes(sq)) {
    procOverlapCount++;
    console.error(`Procurement ile birebir örtüşen soru bulundu: "${sq}"`);
  }
}
assert(procOverlapCount === 0, "Procurement soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let accOverlapCount = 0;
for (const sq of supQuestionTexts) {
  if (accQuestionTexts.includes(sq)) {
    accOverlapCount++;
    console.error(`Accounting ile birebir örtüşen soru bulundu: "${sq}"`);
  }
}
assert(accOverlapCount === 0, "Accounting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let whOverlapCount = 0;
for (const sq of supQuestionTexts) {
  if (whQuestionTexts.includes(sq)) {
    whOverlapCount++;
    console.error(`Warehouse ile birebir örtüşen soru bulundu: "${sq}"`);
  }
}
assert(whOverlapCount === 0, "Warehouse soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let invOverlapCount = 0;
for (const sq of supQuestionTexts) {
  if (invQuestionTexts.includes(sq)) {
    invOverlapCount++;
    console.error(`Inventory ile birebir örtüşen soru bulundu: "${sq}"`);
  }
}
assert(invOverlapCount === 0, "Inventory soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let logOverlapCount = 0;
for (const sq of supQuestionTexts) {
  if (logQuestionTexts.includes(sq)) {
    logOverlapCount++;
    console.error(`Logistics ile birebir örtüşen soru bulundu: "${sq}"`);
  }
}
assert(logOverlapCount === 0, "Logistics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let trsOverlapCount = 0;
for (const sq of supQuestionTexts) {
  if (trsQuestionTexts.includes(sq)) {
    trsOverlapCount++;
    console.error(`Treasury ile birebir örtüşen soru bulundu: "${sq}"`);
  }
}
assert(trsOverlapCount === 0, "Treasury soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let bgtOverlapCount = 0;
for (const sq of supQuestionTexts) {
  if (bgtQuestionTexts.includes(sq)) {
    bgtOverlapCount++;
    console.error(`Budget Reporting ile birebir örtüşen soru bulundu: "${sq}"`);
  }
}
assert(bgtOverlapCount === 0, "Budget Reporting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let rptOverlapCount = 0;
for (const sq of supQuestionTexts) {
  if (rptQuestionTexts.includes(sq)) {
    rptOverlapCount++;
    console.error(`Reporting Analytics ile birebir örtüşen soru bulundu: "${sq}"`);
  }
}
assert(rptOverlapCount === 0, "Reporting Analytics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let salesOverlapCount = 0;
for (const sq of supQuestionTexts) {
  if (salesQuestionTexts.includes(sq)) {
    salesOverlapCount++;
    console.error(`Sales ile birebir örtüşen soru bulundu: "${sq}"`);
  }
}
assert(salesOverlapCount === 0, "Sales soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let crmOverlapCount = 0;
for (const sq of supQuestionTexts) {
  if (crmQuestionTexts.includes(sq)) {
    crmOverlapCount++;
    console.error(`CRM ile birebir örtüşen soru bulundu: "${sq}"`);
  }
}
assert(crmOverlapCount === 0, "CRM soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let prpOverlapCount = 0;
for (const sq of supQuestionTexts) {
  if (prpQuestionTexts.includes(sq)) {
    prpOverlapCount++;
    console.error(`Proposals ile birebir örtüşen soru bulundu: "${sq}"`);
  }
}
assert(prpOverlapCount === 0, "Proposals soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let mktOverlapCount = 0;
for (const sq of supQuestionTexts) {
  if (mktQuestionTexts.includes(sq)) {
    mktOverlapCount++;
    console.error(`Marketing ile birebir örtüşen soru bulundu: "${sq}"`);
  }
}
assert(mktOverlapCount === 0, "Marketing soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_sup_001",
  analysis_project_id: "p1",
  business_function_code: "SUPPLIER_MANAGEMENT",
  process_name: "Tedarikçi Belge ve Sertifikaları",
  question_text: "Tedarikçilerin sürdürülebilirlik, karbon ayak izi ve ESG uygunluk raporları takip edilmekte midir?",
  description: "Avrupa Yeşil Mutabakatı ve kurumsal sürdürülebilirlik denetimleri için.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_sup_001", value: "esg_takibi_aktif", label: "Evet, ESG ve karbon ayak izi raporları toplanır", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_sup_001", value: "esg_takip_edilmez", label: "ESG veya karbon takibi yapılmamaktadır", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_sup_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 43);
assert(adaptedQuestion.id === "cq_sup_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Tedarikçi Belge ve Sertifikaları", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "merkezi_erp_sisteminde_tek_ve_standart_tedarikci_karti_olarak_tutulur", note: "Satın alma ve muhasebe aynı kartı kullanır." }],
  general_note: "GİB e-fatura sorgusu ile VKN doğrulaması zorunludur.",
});
assert(
  formattedQ1.summaryText.includes("Tüm tedarikçi verileri merkezi ERP sisteminde tekil kayıt olarak açılır ve standart alanlarla yönetilir"),
  "Kullanıcı dostu label formatlandı (merkezi_erp... enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("Satın alma ve muhasebe aynı kartı kullanır."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("GİB e-fatura sorgusu ile VKN doğrulaması zorunludur."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with SUPPLIER_MANAGEMENT Data ===");
const mockSupReportModel: ReportModel = {
  metadata: {
    title: "ERP / SRM Ön Analiz Raporu",
    projectName: "Tedarikçi Yönetimi, Kalifikasyon ve Performans Keşif Analizi",
    companyName: "Kuzey Çelik ve Ağır Sanayi Döküm A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: {
      SUPPLIER_MANAGEMENT: "tr.supplier_management.core v0.1.0",
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
    companyName: "Kuzey Çelik ve Ağır Sanayi Döküm A.Ş.",
    tradeName: "Kuzey Çelik",
    taxNumber: "7776665544",
    city: "Kocaeli",
    country: "Türkiye",
    employeeCount: "450",
    notes: "Tedarikçi değerlendirme karnesi (Scorecard), AVL listesi ve tek kaynak risk analizi tamamlandı.",
  },
  profile: {
    analysis_project_id: "p_faz22",
    executive_summary: "Tedarikçi ana verisi, onay iş akışları, OTD/OTIF teslimat metrikleri ve SCAR süreçleri incelendi.",
    overall_assessment: "Excel ortamında yürütülen tedarikçi puanlamasının ERP entegre dinamik scorecard mimarisine taşınması planlandı.",
    open_topics: "Dual sourcing kota dağılımı ve tedarikçi blokaj yetki hiyerarşisi onaylanacak.",
  },
  scope: [
    {
      code: "SUPPLIER_MANAGEMENT",
      nameTr: "Tedarikçi Yönetimi",
      nameEn: "Supplier Management",
      category: "Satın Alma",
      departmentName: "Tedarik Zinciri ve Stratejik Satın Alma Direktörlüğü",
      responsiblePerson: "Murat Demir",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
    },
  ],
  businessFunctions: [
    {
      code: "SUPPLIER_MANAGEMENT",
      nameTr: "Tedarikçi Yönetimi",
      nameEn: "Supplier Management",
      category: "Satın Alma",
      sortOrder: 13,
      departmentName: "Tedarik Zinciri ve Stratejik Satın Alma Direktörlüğü",
      responsiblePerson: "Murat Demir",
      status: "completed",
      packId: "tr.supplier_management.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
      processes: [
        {
          name: "Tedarikçi Ana Veri Yapısı",
          order: 1,
          questions: [
            {
              id: "SUP-001",
              order: 1,
              process: "Tedarikçi Ana Veri Yapısı",
              questionText: "Şirketinizde tedarikçi ana veri kayıtları (Unvan, VKN/TCKN, İletişim Kişileri, Banka IBAN, Adres, Para Birimi) hangi sistemde tutulmakta ve nasıl tekilleştirilmektedir?",
              answerType: "single_choice",
              criticality: "critical",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "merkezi_erp_sisteminde_tek_ve_standart_tedarikci_karti_olarak_tutulur",
                    label: "Tüm tedarikçi verileri merkezi ERP sisteminde tekil kayıt olarak açılır ve standart alanlarla yönetilir",
                    isOther: false,
                    note: "Satın alma ve muhasebe aynı kartı kullanır.",
                  },
                ],
                summaryText: "• Tüm tedarikçi verileri merkezi ERP sisteminde tekil kayıt olarak açılır ve standart alanlarla yönetilir",
              },
              findings: [
                {
                  id: "f_sup_01",
                  title: "Sertifika Süresi Dolan Tedarikçilere Sipariş Açılabilmesi",
                  description: "Zorunlu ISO ve kalite sertifikalarının geçerlilik tarihi sistemde bloke kuralına bağlı olmadığı için süresi dolan tedarikçiden alım yapılabilmektedir.",
                  priority: "high",
                  status: "open",
                  questionId: "SUP-001",
                  createdAt: "2026-08-20",
                },
              ],
              requirements: [
                {
                  id: "req_sup_01",
                  title: "Otomatik Sertifika Takibi ve Satın Alma Blokajı",
                  description: "Sertifika bitimine 30 gün kala uyarı üretilmeli, süresi dolduğunda ilgili malzeme grubunda satın alma siparişi sistemce engellenmelidir.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "SUP-001",
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
          id: "f_sup_01",
          title: "Sertifika Süresi Dolan Tedarikçilere Sipariş Açılabilmesi",
          description: "Zorunlu ISO ve kalite sertifikalarının geçerlilik tarihi sistemde bloke kuralına bağlı olmadığı için süresi dolan tedarikçiden alım yapılabilmektedir.",
          priority: "high",
          status: "open",
          questionId: "SUP-001",
          createdAt: "2026-08-20",
        },
      ],
      requirements: [
        {
          id: "req_sup_01",
          title: "Otomatik Sertifika Takibi ve Satın Alma Blokajı",
          description: "Sertifika bitimine 30 gün kala uyarı üretilmeli, süresi dolduğunda ilgili malzeme grubunda satın alma siparişi sistemce engellenmelidir.",
          priority: "critical",
          status: "confirmed",
          questionId: "SUP-001",
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
const docxBuffer = await buildDocxBuffer(mockSupReportModel);
assert(docxBuffer.length > 5000, `DOCX üretimi başarılı (${docxBuffer.length} byte)`);

// PDF Testi
const pdfBuffer = await buildPdfBuffer(mockSupReportModel);
assert(pdfBuffer.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.length} byte)`);

// PDF Text Extraction & Türkçe Karakter Kontrolü
const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");
assert(pdfText.includes("Tedarikçi Yönetimi"), "PDF çıktısında 'Tedarikçi Yönetimi' başlığı mevcut");
assert(pdfText.includes("Kuzey Çelik ve Ağır Sanayi Döküm A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Otomatik Sertifika Takibi ve Satın Alma Blokajı"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockSupReportModel.metadata.packVersions.SUPPLIER_MANAGEMENT === "tr.supplier_management.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("SUPPLIER_MANAGEMENT");
assert(mappedPackId === "tr.supplier_management.core", `getPackIdForFunction("SUPPLIER_MANAGEMENT") -> tr.supplier_management.core`);

console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-22 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
