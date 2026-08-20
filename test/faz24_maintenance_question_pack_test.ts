/**
 * ERP CRM Discovery — FAZ-24 Maintenance Question Pack Acceptance Test Suite
 *
 * Automated verification for:
 * 1. Pack Loading & Metadata Integrity (tr.maintenance.core v0.1.0, canonical code = MAINTENANCE)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (42 questions, sequential order 1..42, MNT-001..MNT-042)
 * 4. Required Question Count Truth (22 required, 20 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 20 Canonical Process Coverage
 * 7. Conditional Branching Resolution (branching engine with Map)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (verifying zero overlap with QUALITY, INVENTORY, WAREHOUSE, PROCUREMENT, SUPPLIER_MANAGEMENT, CRM, SALES, PROPOSALS, MARKETING, ACCOUNTING, TREASURY, BUDGET_REPORTING, REPORTING_ANALYTICS, and LOGISTICS)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("MAINTENANCE") === "tr.maintenance.core")
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
console.log("FAZ-24: BAKIM VE ONARIM / MAINTENANCE TEST");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/maintenance/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "MAINTENANCE pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.maintenance.core", "pack_id = tr.maintenance.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.schema_version === "1", "schema_version = 1");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "MAINTENANCE", "business_function_code = MAINTENANCE (Kanonik Kod)");
assert(pack.meta.name === "Bakım ve Onarım Ön Analizi", "name = Bakım ve Onarım Ön Analizi");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 20, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validationResult = validateQuestionPack(pack);
if (!validationResult.valid) {
  console.error("   Doğrulama hataları:", validationResult.errors);
}
assert(validationResult.valid === true, "validateQuestionPack(maintenancePack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity, Deterministic Order & IDs ────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 42, `Toplam soru sayısı tam 42 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 42, "Tüm 42 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `MNT-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: index ${i}, id: ${pack.questions[i].id}, order: ${pack.questions[i].order}`);
  }
}
assert(orderCorrect, "Tüm sorular MNT-001'den MNT-042'ye sıralı ve deterministiktir");

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
  "Bakım Organizasyonu",
  "Makine / Ekipman Ana Verisi",
  "Teknik Varlık Hiyerarşisi",
  "Kritik Ekipman Yönetimi",
  "Arıza Bildirimi",
  "Bakım Talebi",
  "Bakım İş Emri",
  "Planlı / Periyodik Bakım",
  "Preventif Bakım",
  "Kestirimci Bakım Kullanımı",
  "Sayaç / Çalışma Saati Bazlı Bakım",
  "Bakım Kontrol Listeleri",
  "Bakım Personeli ve Yetkinlik",
  "Dış Servis Yönetimi",
  "Yedek Parça Kullanımı",
  "Arıza Nedeni ve Duruş Analizi",
  "Bakım Maliyeti",
  "Kalibrasyon Yönetimi",
  "Bakım Dokümanları ve Teknik Kayıtlar",
  "Bakım Raporlama ve KPI",
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

// Senaryo 1: Varlık hiyerarşisi yoksa MNT-006 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("MNT-005", { selected: [{ value: "hiyerarsi_kullanilmamaktadir_sadece_tekil_makine_listesi_vardir" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "MNT-006"), "MNT-005=hiyerarsi_kullanilmamaktadir... iken MNT-006 gizlendi");

answersScenario1.set("MNT-005", { selected: [{ value: "cok_seviyeli_fonksiyonel_lokasyon_ve_alt_ekipman_agac_yapisi_sistemde_kullanilir" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "MNT-006"), "MNT-005=cok_seviyeli... iken MNT-006 görünür");

// Senaryo 2: Planlı bakım yoksa MNT-016 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("MNT-015", { selected: [{ value: "planli_periyodik_bakim_yapilmamaktadir_yalniz_ariza_olunca_bakilir" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "MNT-016"), "MNT-015=planli_periyodik...yapilmamaktadir iken MNT-016 gizlendi");

answersScenario2.set("MNT-015", { selected: [{ value: "tum_makineler_icin_periyotlari_ve_gorevleri_olan_dinamik_planli_bakim_takvimi_vardir" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "MNT-016"), "MNT-015=tum_makineler_icin... iken MNT-016 görünür");

// Senaryo 3: Kestirimci bakım yoksa MNT-020 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("MNT-019", { selected: [{ value: "kestirimci_bakim_veya_durum_izleme_kullanilmamaktadir" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "MNT-020"), "MNT-019=kestirimci_bakim...kullanilmamaktadir iken MNT-020 gizlendi");

answersScenario3.set("MNT-019", { selected: [{ value: "kritik_ekipmanlarda_titresim_isi_veya_yag_analiziyle_durum_izleme_ve_kestirimci_bakim_yapilir" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "MNT-020"), "MNT-019=kritik_ekipmanlarda... iken MNT-020 görünür");

// Senaryo 4: Sayaç takibi yoksa MNT-022 gizlenmeli
const answersScenario4 = new Map<string, AnswerData>();
answersScenario4.set("MNT-021", { selected: [{ value: "sayac_veya_calisma_saati_takibi_yapilmamaktadir" }] });
const visibleQ7 = getVisibleQuestions(pack.questions, answersScenario4);
assert(!visibleQ7.some((q) => q.id === "MNT-022"), "MNT-021=sayac_veya_calisma_saati... iken MNT-022 gizlendi");

answersScenario4.set("MNT-021", { selected: [{ value: "ekipman_calisma_saati_veya_vurus_sayisi_sistemde_tutulur_orn_her_1000_saatte_bir_bakim_acilir" }] });
const visibleQ8 = getVisibleQuestions(pack.questions, answersScenario4);
assert(visibleQ8.some((q) => q.id === "MNT-022"), "MNT-021=ekipman_calisma_saati... iken MNT-022 görünür");

// Senaryo 5: Dış servis yoksa MNT-028 gizlenmeli
const answersScenario5 = new Map<string, AnswerData>();
answersScenario5.set("MNT-027", { selected: [{ value: "dis_servis_kullanilmamaktadir_tum_bakim_ic_ekiple_cozulur" }] });
const visibleQ9 = getVisibleQuestions(pack.questions, answersScenario5);
assert(!visibleQ9.some((q) => q.id === "MNT-028"), "MNT-027=dis_servis_kullanilmamaktadir... iken MNT-028 gizlendi");

answersScenario5.set("MNT-027", { selected: [{ value: "dis_servis_sozlesmeleri_cagri_kayitlari_ve_servis_faturalari_ekipmanla_esleserek_yonetilir" }] });
const visibleQ10 = getVisibleQuestions(pack.questions, answersScenario5);
assert(visibleQ10.some((q) => q.id === "MNT-028"), "MNT-027=dis_servis_sozlesmeleri... iken MNT-028 görünür");

// Senaryo 6: Kalibrasyon takibi yoksa MNT-036 gizlenmeli
const answersScenario6 = new Map<string, AnswerData>();
answersScenario6.set("MNT-035", { selected: [{ value: "cihaz_ve_ekipman_kalibrasyon_takibi_yapilmamaktadir" }] });
const visibleQ11 = getVisibleQuestions(pack.questions, answersScenario6);
assert(!visibleQ11.some((q) => q.id === "MNT-036"), "MNT-035=cihaz_ve_ekipman_kalibrasyon... iken MNT-036 gizlendi");

answersScenario6.set("MNT-035", { selected: [{ value: "tum_olcum_ve_test_cihazlarinin_kalibrasyon_periyotlari_ve_sertifikalari_sistemde_takip_edilir" }] });
const visibleQ12 = getVisibleQuestions(pack.questions, answersScenario6);
assert(visibleQ12.some((q) => q.id === "MNT-036"), "MNT-035=tum_olcum_ve_test... iken MNT-036 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `22 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("MNT-003", {
  id: "qf_mnt_03",
  analysis_project_id: "p1",
  business_function_code: "MAINTENANCE",
  question_id: "MNT-003",
  flag_type: "critical",
  note: "Tüm tezgâhların teknik kodlama ve plaka barkodlama standardı Bakım Müdürü ile netleştirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("MNT-015", {
  id: "qf_mnt_15",
  analysis_project_id: "p1",
  business_function_code: "MAINTENANCE",
  question_id: "MNT-015",
  flag_type: "revisit",
  note: "Periyodik bakım takvimi ile üretim planlama kapasite kilit entegrasyonu Fabrika Müdürü ile kararlaştırılacak",
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

const mntQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
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

let qltOverlapCount = 0;
for (const mq of mntQuestionTexts) {
  if (qltQuestionTexts.includes(mq)) {
    qltOverlapCount++;
    console.error(`Quality ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(qltOverlapCount === 0, "Quality soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let supOverlapCount = 0;
for (const mq of mntQuestionTexts) {
  if (supQuestionTexts.includes(mq)) {
    supOverlapCount++;
    console.error(`Supplier Management ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(supOverlapCount === 0, "Supplier Management soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let procOverlapCount = 0;
for (const mq of mntQuestionTexts) {
  if (procQuestionTexts.includes(mq)) {
    procOverlapCount++;
    console.error(`Procurement ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(procOverlapCount === 0, "Procurement soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let whOverlapCount = 0;
for (const mq of mntQuestionTexts) {
  if (whQuestionTexts.includes(mq)) {
    whOverlapCount++;
    console.error(`Warehouse ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(whOverlapCount === 0, "Warehouse soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let invOverlapCount = 0;
for (const mq of mntQuestionTexts) {
  if (invQuestionTexts.includes(mq)) {
    invOverlapCount++;
    console.error(`Inventory ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(invOverlapCount === 0, "Inventory soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let crmOverlapCount = 0;
for (const mq of mntQuestionTexts) {
  if (crmQuestionTexts.includes(mq)) {
    crmOverlapCount++;
    console.error(`CRM ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(crmOverlapCount === 0, "CRM soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let accOverlapCount = 0;
for (const mq of mntQuestionTexts) {
  if (accQuestionTexts.includes(mq)) {
    accOverlapCount++;
    console.error(`Accounting ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(accOverlapCount === 0, "Accounting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let trsOverlapCount = 0;
for (const mq of mntQuestionTexts) {
  if (trsQuestionTexts.includes(mq)) {
    trsOverlapCount++;
    console.error(`Treasury ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(trsOverlapCount === 0, "Treasury soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let bgtOverlapCount = 0;
for (const mq of mntQuestionTexts) {
  if (bgtQuestionTexts.includes(mq)) {
    bgtOverlapCount++;
    console.error(`Budget Reporting ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(bgtOverlapCount === 0, "Budget Reporting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let rptOverlapCount = 0;
for (const mq of mntQuestionTexts) {
  if (rptQuestionTexts.includes(mq)) {
    rptOverlapCount++;
    console.error(`Reporting Analytics ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(rptOverlapCount === 0, "Reporting Analytics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let salesOverlapCount = 0;
for (const mq of mntQuestionTexts) {
  if (salesQuestionTexts.includes(mq)) {
    salesOverlapCount++;
    console.error(`Sales ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(salesOverlapCount === 0, "Sales soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let prpOverlapCount = 0;
for (const mq of mntQuestionTexts) {
  if (prpQuestionTexts.includes(mq)) {
    prpOverlapCount++;
    console.error(`Proposals ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(prpOverlapCount === 0, "Proposals soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let mktOverlapCount = 0;
for (const mq of mntQuestionTexts) {
  if (mktQuestionTexts.includes(mq)) {
    mktOverlapCount++;
    console.error(`Marketing ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(mktOverlapCount === 0, "Marketing soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let logOverlapCount = 0;
for (const mq of mntQuestionTexts) {
  if (logQuestionTexts.includes(mq)) {
    logOverlapCount++;
    console.error(`Logistics ile birebir örtüşen soru bulundu: "${mq}"`);
  }
}
assert(logOverlapCount === 0, "Logistics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_mnt_001",
  analysis_project_id: "p1",
  business_function_code: "MAINTENANCE",
  process_name: "Kestirimci Bakım Kullanımı",
  question_text: "Basınçlı hava hatlarında akustik ultrasonik kamera ile hava kaçağı taraması yapılmakta mıdır?",
  description: "Enerji verimliliği ve kompresör elektrik tasarrufu denetimleri.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_mnt_001", value: "kacak_taramasi_yapilir", label: "Evet, 6 ayda bir ultrasonik kamera ile hava kaçağı taranır", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_mnt_001", value: "kacak_taramasi_yapilmaz", label: "Hava kaçağı taraması yapılmamaktadır", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_mnt_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 43);
assert(adaptedQuestion.id === "cq_mnt_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Kestirimci Bakım Kullanımı", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "ayri_ve_uzmanlasmis_bakim_onarim_mudurlugu_mekanik_elektrik_otomasyon_tarafindan_yonetilir", note: "Bakım Müdürü doğrudan Fabrika Müdürüne bağlıdır." }],
  general_note: "Mekanik, elektrik ve otomasyon ekipleri toplam 14 teknisyenden oluşur.",
});
assert(
  formattedQ1.summaryText.includes("Üretimden bağımsız ayrı bir Bakım Onarım Departmanı (Mekanik, Elektrik ve Otomasyon ekipleriyle) tarafından yönetilir"),
  "Kullanıcı dostu label formatlandı (ayri_ve_uzmanlasmis... enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("Bakım Müdürü doğrudan Fabrika Müdürüne bağlıdır."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Mekanik, elektrik ve otomasyon ekipleri toplam 14 teknisyenden oluşur."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with MAINTENANCE Data ===");
const mockMntReportModel: ReportModel = {
  metadata: {
    title: "ERP / EAM Ön Analiz Raporu",
    projectName: "Bakım Yönetimi, Varlık Hiyerarşisi ve MTBF/MTTR Keşif Analizi",
    companyName: "Ege Mekatronik ve Talaşlı İmalat Sanayi A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: {
      MAINTENANCE: "tr.maintenance.core v0.1.0",
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
    companyName: "Ege Mekatronik ve Talaşlı İmalat Sanayi A.Ş.",
    tradeName: "Ege Mekatronik",
    taxNumber: "9998887766",
    city: "İzmir",
    country: "Türkiye",
    employeeCount: "280",
    notes: "Teknik varlık hiyerarşisi, sayaç bazlı bakım ve kalibrasyon yaşam döngüsü incelendi.",
  },
  profile: {
    analysis_project_id: "p_faz24",
    executive_summary: "Ekipman ana kartları, bakım iş emirleri, duruş analizi ve MTBF/MTTR metrikleri belirlendi.",
    overall_assessment: "Kağıt bakım formlarının ve plansız arıza çağrılarının ERP/EAM dijital bakım kokpitine taşınması planlandı.",
    open_topics: "Sayaç ve SCADA IoT veri aktarım protokolü ile dış servis SLA onay hiyerarşisi onaylanacak.",
  },
  scope: [
    {
      code: "MAINTENANCE",
      nameTr: "Bakım ve Onarım",
      nameEn: "Maintenance & Repair",
      category: "Üretim",
      departmentName: "Teknik Hizmetler ve Bakım Onarım Müdürlüğü",
      responsiblePerson: "Ali Can",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
    },
  ],
  businessFunctions: [
    {
      code: "MAINTENANCE",
      nameTr: "Bakım ve Onarım",
      nameEn: "Maintenance & Repair",
      category: "Üretim",
      sortOrder: 21,
      departmentName: "Teknik Hizmetler ve Bakım Onarım Müdürlüğü",
      responsiblePerson: "Ali Can",
      status: "completed",
      packId: "tr.maintenance.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
      processes: [
        {
          name: "Bakım Organizasyonu",
          order: 1,
          questions: [
            {
              id: "MNT-001",
              order: 1,
              process: "Bakım Organizasyonu",
              questionText: "Şirketinizde fabrika makineleri, üretim hatları, yardımcı tesisler (Kompresör, Trafo, Chiller vb.) ve bina bakım faaliyetleri hangi organizasyonel yapıda ve ekip sorumluluğunda yürütülmektedir?",
              answerType: "single_choice",
              criticality: "high",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "ayri_ve_uzmanlasmis_bakim_onarim_mudurlugu_mekanik_elektrik_otomasyon_tarafindan_yonetilir",
                    label: "Üretimden bağımsız ayrı bir Bakım Onarım Departmanı (Mekanik, Elektrik ve Otomasyon ekipleriyle) tarafından yönetilir",
                    isOther: false,
                    note: "Bakım Müdürü doğrudan Fabrika Müdürüne bağlıdır.",
                  },
                ],
                summaryText: "• Üretimden bağımsız ayrı bir Bakım Onarım Departmanı (Mekanik, Elektrik ve Otomasyon ekipleriyle) tarafından yönetilir",
              },
              findings: [
                {
                  id: "f_mnt_01",
                  title: "Plansız Duruş Sürelerinin Sistemik Kaydedilememesi",
                  description: "Arıza bildirimleri telefonla yapıldığı için arıza başlangıç saati ve gerçek duruş süresi net ölçülememektedir.",
                  priority: "high",
                  status: "open",
                  questionId: "MNT-001",
                  createdAt: "2026-08-20",
                },
              ],
              requirements: [
                {
                  id: "req_mnt_01",
                  title: "Hat Başı Dijital Arıza Bildirimi ve Otomatik Duruş Sayacı",
                  description: "Operatör terminalden arıza çağrısı açtığı an arıza süresi işlemeli, teknisyen müdahale ve tamamlanma saati kaydedilmelidir.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "MNT-001",
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
          id: "f_mnt_01",
          title: "Plansız Duruş Sürelerinin Sistemik Kaydedilememesi",
          description: "Arıza bildirimleri telefonla yapıldığı için arıza başlangıç saati ve gerçek duruş süresi net ölçülememektedir.",
          priority: "high",
          status: "open",
          questionId: "MNT-001",
          createdAt: "2026-08-20",
        },
      ],
      requirements: [
        {
          id: "req_mnt_01",
          title: "Hat Başı Dijital Arıza Bildirimi ve Otomatik Duruş Sayacı",
          description: "Operatör terminalden arıza çağrısı açtığı an arıza süresi işlemeli, teknisyen müdahale ve tamamlanma saati kaydedilmelidir.",
          priority: "critical",
          status: "confirmed",
          questionId: "MNT-001",
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
const docxBuffer = await buildDocxBuffer(mockMntReportModel);
assert(docxBuffer.length > 5000, `DOCX üretimi başarılı (${docxBuffer.length} byte)`);

// PDF Testi
const pdfBuffer = await buildPdfBuffer(mockMntReportModel);
assert(pdfBuffer.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.length} byte)`);

// PDF Text Extraction & Türkçe Karakter Kontrolü
const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");
assert(pdfText.includes("Bakım ve Onarım"), "PDF çıktısında 'Bakım ve Onarım' başlığı mevcut");
assert(pdfText.includes("Ege Mekatronik ve Talaşlı İmalat Sanayi A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Hat Başı Dijital Arıza Bildirimi ve Otomatik Duruş Sayacı"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockMntReportModel.metadata.packVersions.MAINTENANCE === "tr.maintenance.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("MAINTENANCE");
assert(mappedPackId === "tr.maintenance.core", `getPackIdForFunction("MAINTENANCE") -> tr.maintenance.core`);

console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-24 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
