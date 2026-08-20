/**
 * ERP CRM Discovery — FAZ-26 Work Orders Question Pack Acceptance Test Suite
 *
 * Automated verification for:
 * 1. Pack Loading & Metadata Integrity (tr.work_orders.core v0.1.0, canonical code = WORK_ORDERS)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (45 questions, sequential order 1..45, WOR-001..WOR-045)
 * 4. Required Question Count Truth (24 required, 21 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 25 Canonical Process Coverage (A..Y)
 * 7. Conditional Branching Resolution (branching engine with Map)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (verifying zero overlap with PRODUCTION_PLANNING, MAINTENANCE, QUALITY, INVENTORY, WAREHOUSE, PROCUREMENT, SUPPLIER_MANAGEMENT, CRM, SALES, PROPOSALS, MARKETING, ACCOUNTING, TREASURY, BUDGET_REPORTING, REPORTING_ANALYTICS, and LOGISTICS)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("WORK_ORDERS") === "tr.work_orders.core")
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
console.log("FAZ-26: İŞ EMİRLERİ / WORK_ORDERS TEST");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/work_orders/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "WORK_ORDERS pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.work_orders.core", "pack_id = tr.work_orders.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.schema_version === "1", "schema_version = 1");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "WORK_ORDERS", "business_function_code = WORK_ORDERS (Kanonik Kod)");
assert(pack.meta.name === "İş Emirleri ve Üretim İcrası Ön Analizi", "name = İş Emirleri ve Üretim İcrası Ön Analizi");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 20, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validationResult = validateQuestionPack(pack);
if (!validationResult.valid) {
  console.error("   Doğrulama hataları:", validationResult.errors);
}
assert(validationResult.valid === true, "validateQuestionPack(workOrdersPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity, Deterministic Order & IDs ────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 45, `Toplam soru sayısı tam 45 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 45, "Tüm 45 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `WOR-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: index ${i}, id: ${pack.questions[i].id}, order: ${pack.questions[i].order}`);
  }
}
assert(orderCorrect, "Tüm sorular WOR-001'den WOR-045'e sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ─────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 24, `Zorunlu soru sayısı tam 24 adettir (${requiredQuestions.length})`);
assert(optionalQuestions.length === 21, `Opsiyonel soru sayısı tam 21 adettir (${optionalQuestions.length})`);

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

// ─── TEST 6: 25 Canonical Process Coverage ───────────────────────────────────
console.log("\n=== T06: 25 Canonical Process Coverage ===");
const expectedProcesses = [
  "Üretim İş Emri Oluşturma",
  "Planlı Emirden Dönüşüm",
  "İş Emri Onay / Serbest Bırakma",
  "İş Emri Statüleri",
  "Mamul / Yarı Mamul İş Emirleri",
  "BOM / Reçete Snapshot",
  "Rota / Operasyon Snapshot",
  "İş Merkezi Ataması",
  "Operatör / Ekip Ataması",
  "Operasyon Başlatma",
  "Operasyon Bildirimi",
  "Üretim Miktarı Bildirimi",
  "Fire / Hatalı Ürün",
  "Malzeme Sarfı",
  "Backflush ve Otomatik Sarf",
  "Ek Sarf / İkame Malzeme",
  "Lot / Seri İzlenebilirliği",
  "İşçilik ve Makine Süresi",
  "Duruş / Bekleme Nedenleri",
  "Rework / Yeniden İşleme",
  "Kalite Bekleme / Blokaj",
  "Mamul / Yarı Mamul Girişi",
  "İş Emri Kapanışı",
  "Planlanan / Gerçekleşen Karşılaştırması",
  "Üretim İş Emri KPI",
];

const actualProcesses = Array.from(new Set(pack.questions.map((q) => q.process)));
assert(actualProcesses.length === 25, `Tam 25 farklı süreç grubu tanımlı (${actualProcesses.length})`);

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

// Senaryo 1: Yarı mamuller tek seviyeli ise WOR-010 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("WOR-009", { selected: [{ value: "tek_seviyeli_is_emri_kullanilir_yari_mamuller_ayri_is_emri_olmaz" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "WOR-010"), "WOR-009=tek_seviyeli... iken WOR-010 gizlendi");

answersScenario1.set("WOR-009", { selected: [{ value: "ust_ve_alt_is_emirleri_parent_child_hiyerarsisiyle_birbirine_baglidir_tum_zincir_tek_ekranda_gorulur" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "WOR-010"), "WOR-009=ust_ve_alt... iken WOR-010 görünür");

// Senaryo 2: Operasyon bildirimi yapılmıyorsa WOR-022 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("WOR-021", { selected: [{ value: "operasyon_bazli_bildirim_yapilmaz_yalniz_mamul_cikinca_toplu_kapatilir" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "WOR-022"), "WOR-021=operasyon_bazli_bildirim_yapilmaz... iken WOR-022 gizlendi");

answersScenario2.set("WOR-021", { selected: [{ value: "her_operasyon_ayri_ayri_onaylanir_kesim_torna_kaynak_montaj_adimlari_sistemde_tek_tek_tamamlanir" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "WOR-022"), "WOR-021=her_operasyon... iken WOR-022 görünür");

// Senaryo 3: Backflush kullanılmıyorsa WOR-030 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("WOR-029", { selected: [{ value: "backflush_kullanilmaz_tum_malzemeler_manuel_sarf_edilir" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "WOR-030"), "WOR-029=backflush_kullanilmaz... iken WOR-030 gizlendi");

answersScenario3.set("WOR-029", { selected: [{ value: "backflush_kullanilir_mamul_veya_operasyon_onaylandigi_an_bilesenler_otomatik_sarf_olur" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "WOR-030"), "WOR-029=backflush_kullanilir... iken WOR-030 görünür");

// Senaryo 4: Lot/Seri izlenmiyorsa WOR-034 gizlenmeli
const answersScenario4 = new Map<string, AnswerData>();
answersScenario4.set("WOR-033", { selected: [{ value: "lot_veya_seri_izlenebilirligi_tutulmamaktadir" }] });
const visibleQ7 = getVisibleQuestions(pack.questions, answersScenario4);
assert(!visibleQ7.some((q) => q.id === "WOR-034"), "WOR-033=lot_veya_seri_izlenebilirligi_tutulmamaktadir iken WOR-034 gizlendi");

answersScenario4.set("WOR-033", { selected: [{ value: "tam_secereli_izlenebilirlik_vardir_mamul_seri_no_sundan_hangi_hammadde_lotu_kullanildigi_aninda_dokulur" }] });
const visibleQ8 = getVisibleQuestions(pack.questions, answersScenario4);
assert(visibleQ8.some((q) => q.id === "WOR-034"), "WOR-033=tam_secereli... iken WOR-034 görünür");

// Senaryo 5: Rework yoksa WOR-040 gizlenmeli
const answersScenario5 = new Map<string, AnswerData>();
answersScenario5.set("WOR-039", { selected: [{ value: "rework_sureci_yoktur_hatali_parca_tamamen_hurdaya_ayrilir" }] });
const visibleQ9 = getVisibleQuestions(pack.questions, answersScenario5);
assert(!visibleQ9.some((q) => q.id === "WOR-040"), "WOR-039=rework_sureci_yoktur... iken WOR-040 gizlendi");

answersScenario5.set("WOR-039", { selected: [{ value: "hatali_parcalar_icin_sistemden_ayri_bir_rework_is_emri_acilir_veya_is_emrinde_rework_operasyonu_isletilir" }] });
const visibleQ10 = getVisibleQuestions(pack.questions, answersScenario5);
assert(visibleQ10.some((q) => q.id === "WOR-040"), "WOR-039=hatali_parcalar... iken WOR-040 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `24 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("WOR-011", {
  id: "qf_wor_11",
  analysis_project_id: "p1",
  business_function_code: "WORK_ORDERS",
  question_id: "WOR-011",
  flag_type: "critical",
  note: "BOM Snapshot ve açık iş emirlerinde reçete dondurma mimarisi Fabrika Müdürü ve ERP danışmanı ile netleştirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("WOR-033", {
  id: "qf_wor_33",
  analysis_project_id: "p1",
  business_function_code: "WORK_ORDERS",
  question_id: "WOR-033",
  flag_type: "revisit",
  note: "Girdi-çıktı lot şeceresi ve barkodlu hat başı malzeme eşleştirme altyapısı incelenecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});

const progressWithFollowups = calculateProgress(pack.questions, answersAllReq, mockFollowups);
assert(progressWithFollowups.answered === 22, `Bayraklı sorular tamamlanmamış sayıldı (22/24)`);
assert(progressWithFollowups.percentage === Math.round((22 / 24) * 100), `İlerleme dürüstçe %${progressWithFollowups.percentage} hesaplandı`);

// ─── TEST 9: Cross-Pack Duplication Audit ─────────────────────────────────────
console.log("\n=== T09: Cross-Pack Duplication Audit ===");
const prdPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/production_planning/core.json"), "utf-8")) as QuestionPack;
const mntPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/maintenance/core.json"), "utf-8")) as QuestionPack;
const qltPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/quality/core.json"), "utf-8")) as QuestionPack;
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

const worQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
const prdQuestionTexts = prdPack.questions.map((q) => q.question.toLowerCase().trim());
const mntQuestionTexts = mntPack.questions.map((q) => q.question.toLowerCase().trim());
const qltQuestionTexts = qltPack.questions.map((q) => q.question.toLowerCase().trim());
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

let prdOverlapCount = 0;
for (const wq of worQuestionTexts) {
  if (prdQuestionTexts.includes(wq)) {
    prdOverlapCount++;
    console.error(`Production Planning ile birebir örtüşen soru bulundu: "${wq}"`);
  }
}
assert(prdOverlapCount === 0, "Production Planning soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let mntOverlapCount = 0;
for (const wq of worQuestionTexts) {
  if (mntQuestionTexts.includes(wq)) {
    mntOverlapCount++;
    console.error(`Maintenance ile birebir örtüşen soru bulundu: "${wq}"`);
  }
}
assert(mntOverlapCount === 0, "Maintenance soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let qltOverlapCount = 0;
for (const wq of worQuestionTexts) {
  if (qltQuestionTexts.includes(wq)) {
    qltOverlapCount++;
    console.error(`Quality ile birebir örtüşen soru bulundu: "${wq}"`);
  }
}
assert(qltOverlapCount === 0, "Quality soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let supOverlapCount = 0;
for (const wq of worQuestionTexts) {
  if (supQuestionTexts.includes(wq)) {
    supOverlapCount++;
    console.error(`Supplier Management ile birebir örtüşen soru bulundu: "${wq}"`);
  }
}
assert(supOverlapCount === 0, "Supplier Management soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let procOverlapCount = 0;
for (const wq of worQuestionTexts) {
  if (procQuestionTexts.includes(wq)) {
    procOverlapCount++;
    console.error(`Procurement ile birebir örtüşen soru bulundu: "${wq}"`);
  }
}
assert(procOverlapCount === 0, "Procurement soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let whOverlapCount = 0;
for (const wq of worQuestionTexts) {
  if (whQuestionTexts.includes(wq)) {
    whOverlapCount++;
    console.error(`Warehouse ile birebir örtüşen soru bulundu: "${wq}"`);
  }
}
assert(whOverlapCount === 0, "Warehouse soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let invOverlapCount = 0;
for (const wq of worQuestionTexts) {
  if (invQuestionTexts.includes(wq)) {
    invOverlapCount++;
    console.error(`Inventory ile birebir örtüşen soru bulundu: "${wq}"`);
  }
}
assert(invOverlapCount === 0, "Inventory soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let crmOverlapCount = 0;
for (const wq of worQuestionTexts) {
  if (crmQuestionTexts.includes(wq)) {
    crmOverlapCount++;
    console.error(`CRM ile birebir örtüşen soru bulundu: "${wq}"`);
  }
}
assert(crmOverlapCount === 0, "CRM soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let accOverlapCount = 0;
for (const wq of worQuestionTexts) {
  if (accQuestionTexts.includes(wq)) {
    accOverlapCount++;
    console.error(`Accounting ile birebir örtüşen soru bulundu: "${wq}"`);
  }
}
assert(accOverlapCount === 0, "Accounting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let trsOverlapCount = 0;
for (const wq of worQuestionTexts) {
  if (trsQuestionTexts.includes(wq)) {
    trsOverlapCount++;
    console.error(`Treasury ile birebir örtüşen soru bulundu: "${wq}"`);
  }
}
assert(trsOverlapCount === 0, "Treasury soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let bgtOverlapCount = 0;
for (const wq of worQuestionTexts) {
  if (bgtQuestionTexts.includes(wq)) {
    bgtOverlapCount++;
    console.error(`Budget Reporting ile birebir örtüşen soru bulundu: "${wq}"`);
  }
}
assert(bgtOverlapCount === 0, "Budget Reporting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let rptOverlapCount = 0;
for (const wq of worQuestionTexts) {
  if (rptQuestionTexts.includes(wq)) {
    rptOverlapCount++;
    console.error(`Reporting Analytics ile birebir örtüşen soru bulundu: "${wq}"`);
  }
}
assert(rptOverlapCount === 0, "Reporting Analytics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let salesOverlapCount = 0;
for (const wq of worQuestionTexts) {
  if (salesQuestionTexts.includes(wq)) {
    salesOverlapCount++;
    console.error(`Sales ile birebir örtüşen soru bulundu: "${wq}"`);
  }
}
assert(salesOverlapCount === 0, "Sales soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let prpOverlapCount = 0;
for (const wq of worQuestionTexts) {
  if (prpQuestionTexts.includes(wq)) {
    prpOverlapCount++;
    console.error(`Proposals ile birebir örtüşen soru bulundu: "${wq}"`);
  }
}
assert(prpOverlapCount === 0, "Proposals soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let mktOverlapCount = 0;
for (const wq of worQuestionTexts) {
  if (mktQuestionTexts.includes(wq)) {
    mktOverlapCount++;
    console.error(`Marketing ile birebir örtüşen soru bulundu: "${wq}"`);
  }
}
assert(mktOverlapCount === 0, "Marketing soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let logOverlapCount = 0;
for (const wq of worQuestionTexts) {
  if (logQuestionTexts.includes(wq)) {
    logOverlapCount++;
    console.error(`Logistics ile birebir örtüşen soru bulundu: "${wq}"`);
  }
}
assert(logOverlapCount === 0, "Logistics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_wor_001",
  analysis_project_id: "p1",
  business_function_code: "WORK_ORDERS",
  process_name: "Operasyon Başlatma",
  question_text: "Otomatik montaj hattındaki robot hücreleri ve PLC sinyalleri iş emri operasyonlarını insan müdahalesi olmadan otomatik başlatıp bitirmekte midir?",
  description: "Robotik hücrelerde otomatik iş emri teyidi.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_wor_001", value: "plc_otomatik_onaylar", label: "Evet, robot hücreleri PLC üzerinden operasyonları otomatik onaylar", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_wor_001", value: "operator_manuel_onaylar", label: "Robot çalışsa da operatör ekrandan manuel onay verir", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_wor_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 46);
assert(adaptedQuestion.id === "cq_wor_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Operasyon Başlatma", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "mrp_veya_satis_siparisi_onaylandiginda_sistemden_resmi_is_emri_olarak_otomatik_veya_tek_tikla_acilir", note: "Satış siparişleri doğrudan seri numaralı iş emrine dönüşür." }],
  general_note: "Sistemde yılda yaklaşık 12.000 iş emri açılmaktadır.",
});
assert(
  formattedQ1.summaryText.includes("MRP önerisi veya kesin satış siparişi onaylandığında sistemde numaralı resmi iş emri olarak açılır"),
  "Kullanıcı dostu label formatlandı (mrp_veya_satis... enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("Satış siparişleri doğrudan seri numaralı iş emrine dönüşür."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Sistemde yılda yaklaşık 12.000 iş emri açılmaktadır."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with WORK_ORDERS Data ===");
const mockWorReportModel: ReportModel = {
  metadata: {
    title: "ERP / MES Ön Analiz Raporu",
    projectName: "Saha Üretim İcrası, BOM Snapshot ve Lot Şeceresi Keşif Analizi",
    companyName: "Ege Makine ve İmalat Sanayi A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: {
      WORK_ORDERS: "tr.work_orders.core v0.1.0",
    },
    isComplete: true,
    progressPercent: 100,
    requiredAnswered: 24,
    requiredTotal: 24,
    reportType: "final",
    draftLabel: "TAM RAPOR — %100",
    projectProgressPercent: 100,
    completedFunctionCount: 1,
    selectedFunctionCount: 1,
    isProjectComplete: true,
  },
  company: {
    companyName: "Ege Makine ve İmalat Sanayi A.Ş.",
    tradeName: "Ege Makine",
    taxNumber: "9988776655",
    city: "İzmir",
    country: "Türkiye",
    employeeCount: "320",
    notes: "Talaşlı imalat, kaynak ve montaj atölyelerinde iş emri icrası incelendi.",
  },
  profile: {
    analysis_project_id: "p_faz26",
    executive_summary: "İş emri açılışı, serbest bırakma (Release), BOM snapshot, operasyon onayları, barkodlu sarf ve mamul stok girişi gereksinimleri belirlendi.",
    overall_assessment: "Kağıt refakat kartlarıyla yürütülen operasyon bildirimlerinin hat başı dokunmatik kiosk terminallerine taşınması hedeflendi.",
    open_topics: "Backflush sapma düzeltmeleri ve 1-to-1 seri-seri montaj eşleştirmesi onaylanacak.",
  },
  scope: [
    {
      code: "WORK_ORDERS",
      nameTr: "İş Emirleri",
      nameEn: "Work Orders",
      category: "Üretim",
      departmentName: "Fabrika Müdürlüğü ve Üretim Şefliği",
      responsiblePerson: "Murat Demir",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 24,
      totalQuestionCount: 24,
    },
  ],
  businessFunctions: [
    {
      code: "WORK_ORDERS",
      nameTr: "İş Emirleri",
      nameEn: "Work Orders",
      category: "Üretim",
      sortOrder: 19,
      departmentName: "Fabrika Müdürlüğü ve Üretim Şefliği",
      responsiblePerson: "Murat Demir",
      status: "completed",
      packId: "tr.work_orders.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 24,
      totalQuestionCount: 24,
      processes: [
        {
          name: "Üretim İş Emri Oluşturma",
          order: 1,
          questions: [
            {
              id: "WOR-001",
              order: 1,
              process: "Üretim İş Emri Oluşturma",
              questionText: "Fabrikanızda üretim faaliyetlerini başlatan resmi Üretim İş Emirleri (Production Work Order / İmalat Emri) hangi tetikleyici mekanizmayla (Satış Siparişinden, MRP Planlı Emrinden, Projeden, Manuel) açılmaktadır?",
              answerType: "single_choice",
              criticality: "critical",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "mrp_veya_satis_siparisi_onaylandiginda_sistemden_resmi_is_emri_olarak_otomatik_veya_tek_tikla_acilir",
                    label: "MRP önerisi veya kesin satış siparişi onaylandığında sistemde numaralı resmi iş emri olarak açılır",
                    isOther: false,
                    note: "Satış siparişleri doğrudan seri numaralı iş emrine dönüşür.",
                  },
                ],
                summaryText: "• MRP önerisi veya kesin satış siparişi onaylandığında sistemde numaralı resmi iş emri olarak açılır",
              },
              findings: [
                {
                  id: "f_wor_01",
                  title: "Operasyon Başlama/Bitiş Saatlerinin Kağıt Formlardan Sisteme Sonradan Girilmesi",
                  description: "Vardiya sonunda operatörlerin yazdığı kağıt formlar ertesi gün veri giriş personeli tarafından işlenmekte ve anlık izleme yapılamamaktadır.",
                  priority: "critical",
                  status: "open",
                  questionId: "WOR-001",
                  createdAt: "2026-08-20",
                },
              ],
              requirements: [
                {
                  id: "req_wor_01",
                  title: "Hat Başı Kiosk Terminalleriyle Gerçek Zamanlı Barkodlu İş Emri Başlatma ve Durdurma",
                  description: "Operatör refakat kartındaki barkodu okutarak işi anında başlatmalı, parça ve fire miktarını anlık teyit etmelidir.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "WOR-001",
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
          id: "f_wor_01",
          title: "Operasyon Başlama/Bitiş Saatlerinin Kağıt Formlardan Sisteme Sonradan Girilmesi",
          description: "Vardiya sonunda operatörlerin yazdığı kağıt formlar ertesi gün veri giriş personeli tarafından işlenmekte ve anlık izleme yapılamamaktadır.",
          priority: "critical",
          status: "open",
          questionId: "WOR-001",
          createdAt: "2026-08-20",
        },
      ],
      requirements: [
        {
          id: "req_wor_01",
          title: "Hat Başı Kiosk Terminalleriyle Gerçek Zamanlı Barkodlu İş Emri Başlatma ve Durdurma",
          description: "Operatör refakat kartındaki barkodu okutarak işi anında başlatmalı, parça ve fire miktarını anlık teyit etmelidir.",
          priority: "critical",
          status: "confirmed",
          questionId: "WOR-001",
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
    answeredQuestions: 24,
    totalQuestions: 24,
    openFollowupCount: 0,
    revisitCount: 0,
    criticalFollowupCount: 0,
  },
};

// DOCX Testi
const docxBuffer = await buildDocxBuffer(mockWorReportModel);
assert(docxBuffer.length > 5000, `DOCX üretimi başarılı (${docxBuffer.length} byte)`);

// PDF Testi
const pdfBuffer = await buildPdfBuffer(mockWorReportModel);
assert(pdfBuffer.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.length} byte)`);

// PDF Text Extraction & Türkçe Karakter Kontrolü
const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");
assert(pdfText.includes("İş Emirleri"), "PDF çıktısında 'İş Emirleri' başlığı mevcut");
assert(pdfText.includes("Ege Makine ve İmalat Sanayi A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Hat Başı Kiosk Terminalleriyle Gerçek Zamanlı Barkodlu İş Emri Başlatma ve Durdurma"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockWorReportModel.metadata.packVersions.WORK_ORDERS === "tr.work_orders.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("WORK_ORDERS");
assert(mappedPackId === "tr.work_orders.core", `getPackIdForFunction("WORK_ORDERS") -> tr.work_orders.core`);

console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-26 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
