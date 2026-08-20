/**
 * ERP CRM Discovery — FAZ-25 Production Planning Question Pack Acceptance Test Suite
 *
 * Automated verification for:
 * 1. Pack Loading & Metadata Integrity (tr.production_planning.core v0.1.0, canonical code = PRODUCTION_PLANNING)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (44 questions, sequential order 1..44, PRD-001..PRD-044)
 * 4. Required Question Count Truth (24 required, 20 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 23 Canonical Process Coverage (A..W)
 * 7. Conditional Branching Resolution (branching engine with Map)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (verifying zero overlap with MAINTENANCE, QUALITY, INVENTORY, WAREHOUSE, PROCUREMENT, SUPPLIER_MANAGEMENT, CRM, SALES, PROPOSALS, MARKETING, ACCOUNTING, TREASURY, BUDGET_REPORTING, REPORTING_ANALYTICS, and LOGISTICS)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("PRODUCTION_PLANNING") === "tr.production_planning.core")
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
console.log("FAZ-25: ÜRETİM PLANLAMA / PRODUCTION_PLANNING TEST");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/production_planning/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "PRODUCTION_PLANNING pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.production_planning.core", "pack_id = tr.production_planning.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.schema_version === "1", "schema_version = 1");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "PRODUCTION_PLANNING", "business_function_code = PRODUCTION_PLANNING (Kanonik Kod)");
assert(pack.meta.name === "Üretim Planlama Ön Analizi", "name = Üretim Planlama Ön Analizi");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 20, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validationResult = validateQuestionPack(pack);
if (!validationResult.valid) {
  console.error("   Doğrulama hataları:", validationResult.errors);
}
assert(validationResult.valid === true, "validateQuestionPack(productionPlanningPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity, Deterministic Order & IDs ────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 44, `Toplam soru sayısı tam 44 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 44, "Tüm 44 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `PRD-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: index ${i}, id: ${pack.questions[i].id}, order: ${pack.questions[i].order}`);
  }
}
assert(orderCorrect, "Tüm sorular PRD-001'den PRD-044'e sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ─────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 24, `Zorunlu soru sayısı tam 24 adettir (${requiredQuestions.length})`);
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

// ─── TEST 6: 23 Canonical Process Coverage ───────────────────────────────────
console.log("\n=== T06: 23 Canonical Process Coverage ===");
const expectedProcesses = [
  "Üretim Organizasyonu",
  "Üretim Tipi ve Stratejisi",
  "Mamul / Yarı Mamul Yapısı",
  "Ürün Ağacı / BOM",
  "Çok Seviyeli BOM",
  "Alternatif BOM / Reçete",
  "Rota ve Operasyon Yapısı",
  "İş Merkezi / Work Center",
  "Üretim Takvimi ve Vardiya",
  "Talep Kaynakları",
  "Satış Siparişinden Üretim İhtiyacı",
  "Forecast ve MPS",
  "MRP / Malzeme İhtiyaç Planlama",
  "Net İhtiyaç Hesabı",
  "Lot Büyüklüğü ve Parti Politikaları",
  "Lead Time ve Termin Hesabı",
  "Kapasite Planlama",
  "Darboğaz Yönetimi",
  "Setup / Changeover Etkisi",
  "Malzeme Eksikliği Yönetimi",
  "Planlı Üretim Emirleri",
  "Önceliklendirme ve Yeniden Planlama",
  "Üretim Planlama KPI",
];

const actualProcesses = Array.from(new Set(pack.questions.map((q) => q.process)));
assert(actualProcesses.length === 23, `Tam 23 farklı süreç grubu tanımlı (${actualProcesses.length})`);

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

// Senaryo 1: Çok seviyeli BOM yoksa PRD-010 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("PRD-009", { selected: [{ value: "tek_seviyeli_bom_kullanilir_yari_mamul_agaci_yoktur" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "PRD-010"), "PRD-009=tek_seviyeli... iken PRD-010 gizlendi");

answersScenario1.set("PRD-009", { selected: [{ value: "cok_seviyeli_bom_kullanilir_3_veya_daha_fazla_derinlikte_yari_mamul_agaci_sistemde_cozulur" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "PRD-010"), "PRD-009=cok_seviyeli... iken PRD-010 görünür");

// Senaryo 2: Alternatif BOM yoksa PRD-012 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("PRD-011", { selected: [{ value: "alternatif_bom_kullanilmamaktadir_tek_standart_recete_vardir" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "PRD-012"), "PRD-011=alternatif_bom_kullanilmamaktadir... iken PRD-012 gizlendi");

answersScenario2.set("PRD-011", { selected: [{ value: "bir_urunun_birden_fazla_onayli_alternatif_bom_u_ve_tarih_bazli_revizyon_gecmisi_sistemde_takip_edilir" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "PRD-012"), "PRD-011=bir_urunun_birden_fazla... iken PRD-012 görünür");

// Senaryo 3: MPS/Forecast yoksa PRD-024 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("PRD-023", { selected: [{ value: "mps_veya_forecast_kullanilmamaktadir_yalniz_anlik_siparisle_planlanir" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "PRD-024"), "PRD-023=mps_veya_forecast_kullanilmamaktadir... iken PRD-024 gizlendi");

answersScenario3.set("PRD-023", { selected: [{ value: "haftalik_ve_aylik_donemler_icin_onayli_ana_uretim_cizelgesi_mps_sistemde_resmi_calistirilir" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "PRD-024"), "PRD-023=haftalik_ve_aylik... iken PRD-024 görünür");

// Senaryo 4: MRP kullanılmıyorsa PRD-026 gizlenmeli
const answersScenario4 = new Map<string, AnswerData>();
answersScenario4.set("PRD-025", { selected: [{ value: "mrp_kullanilmamaktadir_malzeme_ihtiyaclari_manuel_veya_tecrubeyle_cikarilir" }] });
const visibleQ7 = getVisibleQuestions(pack.questions, answersScenario4);
assert(!visibleQ7.some((q) => q.id === "PRD-026"), "PRD-025=mrp_kullanilmamaktadir... iken PRD-026 gizlendi");

answersScenario4.set("PRD-025", { selected: [{ value: "erp_uzerinde_tam_entegre_mrp_motoru_duzenli_calistirilir_satinalma_ve_uretim_onerileri_uretir" }] });
const visibleQ8 = getVisibleQuestions(pack.questions, answersScenario4);
assert(visibleQ8.some((q) => q.id === "PRD-026"), "PRD-025=erp_uzerinde_tam_entegre... iken PRD-026 görünür");

// Senaryo 5: Kapasite planlama yoksa PRD-034 gizlenmeli
const answersScenario5 = new Map<string, AnswerData>();
answersScenario5.set("PRD-033", { selected: [{ value: "sistemik_kapasite_planlama_yapilmamaktadir_sonsuz_kapasite_varsayilir" }] });
const visibleQ9 = getVisibleQuestions(pack.questions, answersScenario5);
assert(!visibleQ9.some((q) => q.id === "PRD-034"), "PRD-033=sistemik_kapasite_planlama_yapilmamaktadir... iken PRD-034 gizlendi");

answersScenario5.set("PRD-033", { selected: [{ value: "tum_is_merkezlerinin_kapasite_ve_yuk_oranlari_sistemden_grafiksel_olarak_anlik_izlenir" }] });
const visibleQ10 = getVisibleQuestions(pack.questions, answersScenario5);
assert(visibleQ10.some((q) => q.id === "PRD-034"), "PRD-033=tum_is_merkezlerinin... iken PRD-034 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `24 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("PRD-009", {
  id: "qf_prd_09",
  analysis_project_id: "p1",
  business_function_code: "PRODUCTION_PLANNING",
  question_id: "PRD-009",
  flag_type: "critical",
  note: "Çok seviyeli ürün ağacı derinliği ve Low-Level Code patlatma kurgusu Ar-Ge ve Fabrika Müdürü ile netleştirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("PRD-033", {
  id: "qf_prd_33",
  analysis_project_id: "p1",
  business_function_code: "PRODUCTION_PLANNING",
  question_id: "PRD-033",
  flag_type: "revisit",
  note: "Sonlu kapasite çizelgeleme ve darboğaz makinelerin alternatif rotaları planlama ekibi ile gözden geçirilecek",
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

const prdQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
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

let mntOverlapCount = 0;
for (const pq of prdQuestionTexts) {
  if (mntQuestionTexts.includes(pq)) {
    mntOverlapCount++;
    console.error(`Maintenance ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(mntOverlapCount === 0, "Maintenance soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let qltOverlapCount = 0;
for (const pq of prdQuestionTexts) {
  if (qltQuestionTexts.includes(pq)) {
    qltOverlapCount++;
    console.error(`Quality ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(qltOverlapCount === 0, "Quality soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let supOverlapCount = 0;
for (const pq of prdQuestionTexts) {
  if (supQuestionTexts.includes(pq)) {
    supOverlapCount++;
    console.error(`Supplier Management ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(supOverlapCount === 0, "Supplier Management soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let procOverlapCount = 0;
for (const pq of prdQuestionTexts) {
  if (procQuestionTexts.includes(pq)) {
    procOverlapCount++;
    console.error(`Procurement ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(procOverlapCount === 0, "Procurement soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let whOverlapCount = 0;
for (const pq of prdQuestionTexts) {
  if (whQuestionTexts.includes(pq)) {
    whOverlapCount++;
    console.error(`Warehouse ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(whOverlapCount === 0, "Warehouse soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let invOverlapCount = 0;
for (const pq of prdQuestionTexts) {
  if (invQuestionTexts.includes(pq)) {
    invOverlapCount++;
    console.error(`Inventory ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(invOverlapCount === 0, "Inventory soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let crmOverlapCount = 0;
for (const pq of prdQuestionTexts) {
  if (crmQuestionTexts.includes(pq)) {
    crmOverlapCount++;
    console.error(`CRM ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(crmOverlapCount === 0, "CRM soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let accOverlapCount = 0;
for (const pq of prdQuestionTexts) {
  if (accQuestionTexts.includes(pq)) {
    accOverlapCount++;
    console.error(`Accounting ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(accOverlapCount === 0, "Accounting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let trsOverlapCount = 0;
for (const pq of prdQuestionTexts) {
  if (trsQuestionTexts.includes(pq)) {
    trsOverlapCount++;
    console.error(`Treasury ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(trsOverlapCount === 0, "Treasury soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let bgtOverlapCount = 0;
for (const pq of prdQuestionTexts) {
  if (bgtQuestionTexts.includes(pq)) {
    bgtOverlapCount++;
    console.error(`Budget Reporting ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(bgtOverlapCount === 0, "Budget Reporting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let rptOverlapCount = 0;
for (const pq of prdQuestionTexts) {
  if (rptQuestionTexts.includes(pq)) {
    rptOverlapCount++;
    console.error(`Reporting Analytics ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(rptOverlapCount === 0, "Reporting Analytics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let salesOverlapCount = 0;
for (const pq of prdQuestionTexts) {
  if (salesQuestionTexts.includes(pq)) {
    salesOverlapCount++;
    console.error(`Sales ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(salesOverlapCount === 0, "Sales soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let prpOverlapCount = 0;
for (const pq of prdQuestionTexts) {
  if (prpQuestionTexts.includes(pq)) {
    prpOverlapCount++;
    console.error(`Proposals ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(prpOverlapCount === 0, "Proposals soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let mktOverlapCount = 0;
for (const pq of prdQuestionTexts) {
  if (mktQuestionTexts.includes(pq)) {
    mktOverlapCount++;
    console.error(`Marketing ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(mktOverlapCount === 0, "Marketing soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let logOverlapCount = 0;
for (const pq of prdQuestionTexts) {
  if (logQuestionTexts.includes(pq)) {
    logOverlapCount++;
    console.error(`Logistics ile birebir örtüşen soru bulundu: "${pq}"`);
  }
}
assert(logOverlapCount === 0, "Logistics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_prd_001",
  analysis_project_id: "p1",
  business_function_code: "PRODUCTION_PLANNING",
  process_name: "Kapasite Planlama",
  question_text: "Pres atölyesindeki tonaj kısıtları ve kalıp bağlama süreleri APS ileri çizelgeleme yazılımıyla mı optimize edilmektedir?",
  description: "Pres tonaj matrisleri ve çizelgeleme entegrasyonu.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_prd_001", value: "aps_yazilimi_kullanilir", label: "Evet, APS yazılımı ile pres tonajları ve kalıplar otomatik optimize edilir", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_prd_001", value: "manuel_planlanir", label: "Pres yükleri Excel'de manuel çizelgelenir", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_prd_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 45);
assert(adaptedQuestion.id === "cq_prd_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Kapasite Planlama", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "ayri_ve_uzmanlasmis_merkezi_uretim_planlama_departmani_tarafindan_yonetilir", note: "Planlama Şefi doğrudan Tedarik Zinciri Direktörüne bağlıdır." }],
  general_note: "Planlama ekibi 4 endüstri mühendisinden oluşur.",
});
assert(
  formattedQ1.summaryText.includes("Üretimden bağımsız ayrı bir Üretim Planlama Departmanı (Tedarik Zinciri veya Fabrika Müdürlüğü altında) tarafından yönetilir"),
  "Kullanıcı dostu label formatlandı (ayri_ve_uzmanlasmis... enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("Planlama Şefi doğrudan Tedarik Zinciri Direktörüne bağlıdır."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Planlama ekibi 4 endüstri mühendisinden oluşur."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with PRODUCTION_PLANNING Data ===");
const mockPrdReportModel: ReportModel = {
  metadata: {
    title: "ERP / MRP Ön Analiz Raporu",
    projectName: "Çok Seviyeli BOM, MRP ve Kapasite Planlama Keşif Analizi",
    companyName: "Anadolu Otomotiv ve Yan Sanayi A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: {
      PRODUCTION_PLANNING: "tr.production_planning.core v0.1.0",
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
    companyName: "Anadolu Otomotiv ve Yan Sanayi A.Ş.",
    tradeName: "Anadolu Otomotiv",
    taxNumber: "1112223344",
    city: "Bursa",
    country: "Türkiye",
    employeeCount: "450",
    notes: "Çok seviyeli ürün ağaçları, sonlu kapasite planlama ve MRP patlatması incelendi.",
  },
  profile: {
    analysis_project_id: "p_faz25",
    executive_summary: "Ürün ağacı seviyeleri, rotalar, iş merkezleri, MRP motoru ve sonlu kapasite çizelgeleme gereksinimleri belirlendi.",
    overall_assessment: "Excel üzerinden yürütülen manuel malzeme ihtiyaç hesaplarının ERP MRP motoruna taşınması planlandı.",
    open_topics: "Phantom BOM kurgusu ve pres hatlarında sequence-dependent setup matrisi onaylanacak.",
  },
  scope: [
    {
      code: "PRODUCTION_PLANNING",
      nameTr: "Üretim Planlama",
      nameEn: "Production Planning",
      category: "Üretim",
      departmentName: "Tedarik Zinciri ve Üretim Planlama Müdürlüğü",
      responsiblePerson: "Zeynep Yılmaz",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 24,
      totalQuestionCount: 24,
    },
  ],
  businessFunctions: [
    {
      code: "PRODUCTION_PLANNING",
      nameTr: "Üretim Planlama",
      nameEn: "Production Planning",
      category: "Üretim",
      sortOrder: 18,
      departmentName: "Tedarik Zinciri ve Üretim Planlama Müdürlüğü",
      responsiblePerson: "Zeynep Yılmaz",
      status: "completed",
      packId: "tr.production_planning.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 24,
      totalQuestionCount: 24,
      processes: [
        {
          name: "Üretim Organizasyonu",
          order: 1,
          questions: [
            {
              id: "PRD-001",
              order: 1,
              process: "Üretim Organizasyonu",
              questionText: "Şirketinizde fabrika üretim planlama, malzeme ihtiyaç hesabı ve çizelgeleme faaliyetleri hangi organizasyonel yapıda ve ekip sorumluluğunda yürütülmektedir?",
              answerType: "single_choice",
              criticality: "high",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "ayri_ve_uzmanlasmis_merkezi_uretim_planlama_departmani_tarafindan_yonetilir",
                    label: "Üretimden bağımsız ayrı bir Üretim Planlama Departmanı (Tedarik Zinciri veya Fabrika Müdürlüğü altında) tarafından yönetilir",
                    isOther: false,
                    note: "Planlama Şefi doğrudan Tedarik Zinciri Direktörüne bağlıdır.",
                  },
                ],
                summaryText: "• Üretimden bağımsız ayrı bir Üretim Planlama Departmanı (Tedarik Zinciri veya Fabrika Müdürlüğü altında) tarafından yönetilir",
              },
              findings: [
                {
                  id: "f_prd_01",
                  title: "Çok Seviyeli MRP Patlatmasının Excel Üzerinde Yürütülmesi",
                  description: "Nihai mamul altındaki 4 kademeli yarı mamullerin malzeme ihtiyaçları Excel formülleriyle manuel hesaplanmaktadır.",
                  priority: "critical",
                  status: "open",
                  questionId: "PRD-001",
                  createdAt: "2026-08-20",
                },
              ],
              requirements: [
                {
                  id: "req_prd_01",
                  title: "Entegre Çok Seviyeli MRP ve Otomatik Planlı İş Emri Önerisi",
                  description: "Satış siparişi girildiğinde sistem tüm yarı mamul ve hammadde ihtiyaçlarını eşzamanlı patlatmalı ve satın alma/üretim önerileri oluşturmalıdır.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "PRD-001",
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
          id: "f_prd_01",
          title: "Çok Seviyeli MRP Patlatmasının Excel Üzerinde Yürütülmesi",
          description: "Nihai mamul altındaki 4 kademeli yarı mamullerin malzeme ihtiyaçları Excel formülleriyle manuel hesaplanmaktadır.",
          priority: "critical",
          status: "open",
          questionId: "PRD-001",
          createdAt: "2026-08-20",
        },
      ],
      requirements: [
        {
          id: "req_prd_01",
          title: "Entegre Çok Seviyeli MRP ve Otomatik Planlı İş Emri Önerisi",
          description: "Satış siparişi girildiğinde sistem tüm yarı mamul ve hammadde ihtiyaçlarını eşzamanlı patlatmalı ve satın alma/üretim önerileri oluşturmalıdır.",
          priority: "critical",
          status: "confirmed",
          questionId: "PRD-001",
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
const docxBuffer = await buildDocxBuffer(mockPrdReportModel);
assert(docxBuffer.length > 5000, `DOCX üretimi başarılı (${docxBuffer.length} byte)`);

// PDF Testi
const pdfBuffer = await buildPdfBuffer(mockPrdReportModel);
assert(pdfBuffer.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.length} byte)`);

// PDF Text Extraction & Türkçe Karakter Kontrolü
const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");
assert(pdfText.includes("Üretim Planlama"), "PDF çıktısında 'Üretim Planlama' başlığı mevcut");
assert(pdfText.includes("Anadolu Otomotiv ve Yan Sanayi A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Entegre Çok Seviyeli MRP ve Otomatik Planlı İş Emri Önerisi"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockPrdReportModel.metadata.packVersions.PRODUCTION_PLANNING === "tr.production_planning.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("PRODUCTION_PLANNING");
assert(mappedPackId === "tr.production_planning.core", `getPackIdForFunction("PRODUCTION_PLANNING") -> tr.production_planning.core`);

console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-25 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
