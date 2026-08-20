/**
 * ERP CRM Discovery — FAZ-27: MALİYETLENDİRME / COSTING Acceptance Tests
 *
 * 14 Test Alanı:
 * 1. Pack Loading & Metadata Integrity (COSTING canonical code, pack_id: tr.costing.core, v0.1.0)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & IDs (45 questions, CST-001..CST-045 deterministic)
 * 4. Required Question Count (24 required, 21 optional)
 * 5. Choice Options & is_other Validation
 * 6. 25 Canonical Process Coverage (A'dan Y'ye 25 süreç)
 * 7. Branching Engine Resolution (5 Koşullu Dallanma Noktası)
 * 8. Progress Calculation & Follow-up Deduction (24 required, 🟡/🔴 bayrak etkisi)
 * 9. Cross-Pack Duplication Audit (Tüm modüllerle 0 mükerrerlik)
 * 10. Custom Questions Adapter Compatibility
 * 11. ReportModel & Formatting Truth (Enum sızıntısı yok, dürüst etiket)
 * 12. DOCX Generation & Integrity
 * 13. PDF Generation & TrueType Unicode Text Extraction (Liberation Sans, Türkçe karakterler)
 * 14. Loader Registry Parity (getPackIdForFunction("COSTING") -> tr.costing.core)
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
console.log("FAZ-27: MALİYETLENDİRME / COSTING TEST");
console.log("══════════════════════════════════════════════════\n");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/costing/core.json");
const raw = readFileSync(packPath, "utf-8");
const pack = JSON.parse(raw) as QuestionPack;

assert(!!pack, "COSTING pack JSON başarıyla okundu");
assert(pack.meta?.pack_id === "tr.costing.core", "pack_id = tr.costing.core");
assert(pack.meta?.version === "0.1.0", "version = 0.1.0");
assert(pack.meta?.schema_version === "1", "schema_version = 1");
assert(pack.meta?.language === "tr", "language = tr");
assert(pack.meta?.business_function_code === "COSTING", "business_function_code = COSTING (Kanonik Kod)");
assert(pack.meta?.name === "Ürün Maliyetlendirme ve Sapma Analizi Ön Analizi", `name = ${pack.meta?.name}`);
assert((pack.meta?.description?.length ?? 0) > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(costingPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ─────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 45, `Toplam soru sayısı tam 45 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 45, "Tüm 45 soru ID'si benzersizdir");

let sequential = true;
for (let i = 1; i <= 45; i++) {
  const expectedId = `CST-${String(i).padStart(3, "0")}`;
  if (ids[i - 1] !== expectedId) {
    sequential = false;
    break;
  }
}
assert(sequential, "Tüm sorular CST-001'den CST-045'e sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ─────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 24, `Zorunlu soru sayısı tam 24 adettir (${requiredQuestions.length})`);
assert(optionalQuestions.length === 21, `Opsiyonel soru sayısı tam 21 adettir (${optionalQuestions.length})`);

// ─── TEST 5: Choice Options & is_other Validation ────────────────────────────
console.log("\n=== T05: Choice Options & is_other Validation ===");
let allOptionsValid = true;
let otherRuleValid = true;

for (const q of pack.questions) {
  if (q.options) {
    const optValues = q.options.map((o) => o.value);
    const uniqueValues = new Set(optValues);
    if (optValues.length !== uniqueValues.size) allOptionsValid = false;

    const otherOpts = q.options.filter((o) => o.is_other);
    if (otherOpts.length > 1) otherRuleValid = false;
    for (const otherOpt of otherOpts) {
      if (!otherOpt.allow_note) otherRuleValid = false;
    }
  }
}
assert(allOptionsValid, "Tüm seçenek değerleri benzersiz ve en fazla 1 'Diğer' seçeneği içeriyor");
assert(otherRuleValid, "Tüm is_other=true seçeneklerinde allow_note=true kuralı sağlanıyor");

// ─── TEST 6: 25 Canonical Process Coverage ───────────────────────────────────
console.log("\n=== T06: 25 Canonical Process Coverage ===");
const processes = new Set(pack.questions.map((q) => q.process));
assert(processes.size === 25, `Tam 25 farklı süreç grubu tanımlı (${processes.size})`);

const expectedProcesses = [
  "Maliyet Organizasyonu",
  "Maliyet Nesneleri",
  "Maliyet Yöntemleri",
  "Standart Maliyet",
  "Fiili Maliyet",
  "Tahmini / Simülasyon Maliyeti",
  "Malzeme Maliyeti Kaynağı",
  "Çok Seviyeli BOM Maliyet Roll-Up",
  "Yarı Mamul Maliyeti",
  "İşçilik Maliyeti",
  "Makine / Work Center Maliyeti",
  "Setup Maliyeti",
  "Genel Üretim Giderleri",
  "Dış Operasyon Maliyeti",
  "Fire ve Rework Maliyeti",
  "Landed Cost / Ek Maliyetler",
  "Kur ve Döviz Etkisi",
  "Maliyet Versiyonları",
  "Maliyet Güncelleme ve Freeze",
  "Standart / Fiili Sapmalar",
  "Üretim Sapma Analizi",
  "Stok Değerleme Entegrasyonu",
  "Teklif / Fiyatlandırma Entegrasyonu",
  "Maliyet Kapanışı",
  "Maliyet Raporlama ve KPI",
];

for (const proc of expectedProcesses) {
  assert(processes.has(proc), `Süreç mevcut: "${proc}"`);
}

// ─── TEST 7: Branching Engine Resolution ─────────────────────────────────────
console.log("\n=== T07: Branching Engine Resolution ===");
const conditionalQuestions = pack.questions.filter((q) => q.condition);
assert(conditionalQuestions.length === 5, `Tam 5 adet koşullu soru tanımlı (${conditionalQuestions.length})`);

for (const cq of conditionalQuestions) {
  assert(ids.includes(cq.condition!.question_id), `Condition referansı geçerli: ${cq.id} -> ${cq.condition!.question_id}`);
}

// Senaryo 1: Simülasyon yoksa CST-012 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("CST-011", { selected: [{ value: "maliyet_simulasyonu_yapilmamaktadir" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "CST-012"), "CST-011=maliyet_simulasyonu_yapilmamaktadir iken CST-012 gizlendi");

answersScenario1.set("CST-011", { selected: [{ value: "sistemde_farkli_hammadde_ve_kur_varsayimlariyla_maliyet_simulasyonlari_calistirilip_senaryolar_karsilastirilir" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "CST-012"), "CST-011=sistemde_farkli_hammadde... iken CST-012 görünür");

// Senaryo 2: Tek seviyeli ise CST-016 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("CST-015", { selected: [{ value: "tek_seviyeli_hesaplanir_yari_mamul_roll_up_yapilmaz" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "CST-016"), "CST-015=tek_seviyeli... iken CST-016 gizlendi");

answersScenario2.set("CST-015", { selected: [{ value: "sistem_en_alt_seviyeden_baslayarak_tum_yari_mamulleri_maliyetlendirir_ve_nihai_mamule_otomatik_roll_up_eder" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "CST-016"), "CST-015=sistem_en_alt_seviyeden... iken CST-016 görünür");

// Senaryo 3: Makine saati yoksa CST-022 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("CST-021", { selected: [{ value: "makine_saati_maliyeti_hesaplanmamaktadir" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "CST-022"), "CST-021=makine_saati_maliyeti_hesaplanmamaktadir iken CST-022 gizlendi");

answersScenario3.set("CST-021", { selected: [{ value: "her_makine_grubu_icin_ayri_saatlik_makine_tarifesi_tl_saat_hesaplanir_ve_rotadaki_makine_suresiyle_yuklenir" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "CST-022"), "CST-021=her_makine_grubu... iken CST-022 görünür");

// Senaryo 4: Fason yoksa CST-028 gizlenmeli
const answersScenario4 = new Map<string, AnswerData>();
answersScenario4.set("CST-027", { selected: [{ value: "dis_operasyon_fason_kullanilmamaktadir" }] });
const visibleQ7 = getVisibleQuestions(pack.questions, answersScenario4);
assert(!visibleQ7.some((q) => q.id === "CST-028"), "CST-027=dis_operasyon_fason_kullanilmamaktadir iken CST-028 gizlendi");

answersScenario4.set("CST-027", { selected: [{ value: "fason_hizmet_faturasi_ilgili_is_emri_ve_operasyona_baglanarak_birim_urun_maliyetine_net_yansitilir" }] });
const visibleQ8 = getVisibleQuestions(pack.questions, answersScenario4);
assert(visibleQ8.some((q) => q.id === "CST-028"), "CST-027=fason_hizmet_faturasi... iken CST-028 görünür");

// Senaryo 5: Versiyon yoksa CST-036 gizlenmeli
const answersScenario5 = new Map<string, AnswerData>();
answersScenario5.set("CST-035", { selected: [{ value: "maliyet_versiyonu_tutulmaz_tek_bir_guncel_rakam_vardir" }] });
const visibleQ9 = getVisibleQuestions(pack.questions, answersScenario5);
assert(!visibleQ9.some((q) => q.id === "CST-036"), "CST-035=maliyet_versiyonu_tutulmaz... iken CST-036 gizlendi");

answersScenario5.set("CST-035", { selected: [{ value: "farkli_maliyet_versiyonlari_v1_butce_v2_q2_revizyonu_sistemde_tanimlanir_ve_yan_yana_kiyaslanir" }] });
const visibleQ10 = getVisibleQuestions(pack.questions, answersScenario5);
assert(visibleQ10.some((q) => q.id === "CST-036"), "CST-035=farkli_maliyet_versiyonlari... iken CST-036 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `24 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("CST-013", {
  id: "qf_cst_13",
  analysis_project_id: "p1",
  business_function_code: "COSTING",
  question_id: "CST-013",
  flag_type: "critical",
  note: "Malzeme fiyat kaynağı otoritesi (Son Alış vs Standart vs FIFO) CFO ve Tedarik Direktörü ile netleştirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("CST-015", {
  id: "qf_cst_15",
  analysis_project_id: "p1",
  business_function_code: "COSTING",
  question_id: "CST-015",
  flag_type: "revisit",
  note: "Çok seviyeli recursive BOM roll-up algoritması ve döngüsel ağaç kontrolü incelenecek",
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
const worPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/work_orders/core.json"), "utf-8")) as QuestionPack;
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

const cstQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
const worQuestionTexts = worPack.questions.map((q) => q.question.toLowerCase().trim());
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

function checkOverlap(otherTexts: string[], packName: string): void {
  let count = 0;
  for (const cq of cstQuestionTexts) {
    if (otherTexts.includes(cq)) {
      count++;
      console.error(`${packName} ile birebir örtüşen soru bulundu: "${cq}"`);
    }
  }
  assert(count === 0, `${packName} soru paketi ile sıfır birebir mükerrer soru (0 overlap)`);
}

checkOverlap(worQuestionTexts, "Work Orders");
checkOverlap(prdQuestionTexts, "Production Planning");
checkOverlap(mntQuestionTexts, "Maintenance");
checkOverlap(qltQuestionTexts, "Quality");
checkOverlap(supQuestionTexts, "Supplier Management");
checkOverlap(procQuestionTexts, "Procurement");
checkOverlap(accQuestionTexts, "Accounting");
checkOverlap(whQuestionTexts, "Warehouse");
checkOverlap(invQuestionTexts, "Inventory");
checkOverlap(logQuestionTexts, "Logistics");
checkOverlap(trsQuestionTexts, "Treasury");
checkOverlap(bgtQuestionTexts, "Budget Reporting");
checkOverlap(rptQuestionTexts, "Reporting Analytics");
checkOverlap(salesQuestionTexts, "Sales");
checkOverlap(crmQuestionTexts, "CRM");
checkOverlap(prpQuestionTexts, "Proposals");
checkOverlap(mktQuestionTexts, "Marketing");

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_cst_001",
  analysis_project_id: "p1",
  business_function_code: "COSTING",
  process_name: "Maliyet Yöntemleri",
  question_text: "Fabrikanızda yan ürünlerin (By-Product / Hurda Talaş) satış gelirleri ana ürünün üretim maliyetinden düşülmekte midir?",
  description: "Yan ürün gelirlerinin ana ürün maliyetini hafifletmesi.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_cst_001", value: "yan_urun_geliri_ana_urun_maliyetinden_dusulur", label: "Evet, hurda talaş geliri ana ürün maliyetini düşürür", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_cst_001", value: "diger_gelirlere_yazilir", label: "Hayır, diğer olağandışı gelirlere yazılır", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_cst_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 46);
assert(adaptedQuestion.id === "cq_cst_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Maliyet Yöntemleri", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "ayri_ve_uzmanlasmis_maliyet_muhasebesi_veya_finansal_kontrol_ekibi_tarafindan_yonetilir", note: "Maliyet kontrol ekibinde 4 uzman görev yapmaktadır." }],
  general_note: "Aylık maliyet kapanışları her ayın 3. iş gününde tamamlanır.",
});
assert(
  formattedQ1.summaryText.includes("Muhasebe/Finans Direktörlüğü altında ayrı bir Maliyet Muhasebesi / Kontrolörlük ekibi yönetir"),
  "Kullanıcı dostu label formatlandı (ayri_ve_uzmanlasmis... enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("Maliyet kontrol ekibinde 4 uzman görev yapmaktadır."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Aylık maliyet kapanışları her ayın 3. iş gününde tamamlanır."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with COSTING Data ===");
const mockCstReportModel: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "Ürün Maliyetlendirme, Çok Seviyeli Roll-Up ve Sapma Analizi Keşfi",
    companyName: "Anadolu İmalat ve Metal Sanayi A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: {
      COSTING: "tr.costing.core v0.1.0",
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
    companyName: "Anadolu İmalat ve Metal Sanayi A.Ş.",
    tradeName: "Anadolu Metal",
    taxNumber: "8877665544",
    city: "Kocaeli",
    country: "Türkiye",
    employeeCount: "450",
    notes: "Metal işleme, pres, kaynak ve elektrostatik toz boya tesislerinde maliyet akışı incelendi.",
  },
  profile: {
    analysis_project_id: "p_faz27",
    executive_summary: "Standart maliyet, fiili maliyet, çok seviyeli BOM roll-up, tezgâh saat ücretleri ve üretim sapma analizi gereksinimleri belirlendi.",
    overall_assessment: "Excel üzerinden yürütülen ürün maliyetleme süreçlerinin ERP entegre canlı maliyet motoruna aktarılması kararlaştırıldı.",
    open_topics: "Genel üretim gideri dağıtım anahtarları ve landed cost navlun katsayıları onaylanacak.",
  },
  scope: [
    {
      code: "COSTING",
      nameTr: "Maliyetlendirme",
      nameEn: "Costing",
      category: "Muhasebe & Finans",
      departmentName: "Maliyet Muhasebesi ve Kontrolörlük",
      responsiblePerson: "Selin Yılmaz",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 24,
      totalQuestionCount: 24,
    },
  ],
  businessFunctions: [
    {
      code: "COSTING",
      nameTr: "Maliyetlendirme",
      nameEn: "Costing",
      category: "Muhasebe & Finans",
      sortOrder: 32,
      departmentName: "Maliyet Muhasebesi ve Kontrolörlük",
      responsiblePerson: "Selin Yılmaz",
      status: "completed",
      packId: "tr.costing.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 24,
      totalQuestionCount: 24,
      processes: [
        {
          name: "Çok Seviyeli BOM Maliyet Roll-Up",
          order: 8,
          questions: [
            {
              id: "CST-015",
              order: 15,
              process: "Çok Seviyeli BOM Maliyet Roll-Up",
              questionText: "Çok seviyeli ürün ağaçlarında (Multi-Level BOM) en alt hammadde ve yarı mamullerden başlayarak yukarıya doğru kademe kademe maliyet toplayan Çok Seviyeli Maliyet Patlatması (Recursive Multi-Level Cost Roll-Up) sistem tarafından otomatik yapılmakta mıdır?",
              answerType: "single_choice",
              criticality: "critical",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "sistem_en_alt_seviyeden_baslayarak_tum_yari_mamulleri_maliyetlendirir_ve_nihai_mamule_otomatik_roll_up_eder",
                    label: "En alt kademedeki parçadan başlayarak yarı mamul maliyetini hesaplayıp ana ürüne otomatik toplar",
                    isOther: false,
                    note: "5 seviyeli montaj ağaçlarında recursive roll-up gereklidir.",
                  },
                ],
                summaryText: "• En alt kademedeki parçadan başlayarak yarı mamul maliyetini hesaplayıp ana ürüne otomatik toplar",
              },
              findings: [
                {
                  id: "f_cst_01",
                  title: "Yarı Mamul Maliyetlerinin Güncellenmemesi Nedeniyle Hatalı Mamul Maliyeti",
                  description: "Alt kademedeki saç büküm parçalarının maliyet artışları ana montaj maliyetine manuel aktarılamamakta ve kâr marjı erimektedir.",
                  priority: "critical",
                  status: "open",
                  questionId: "CST-015",
                  createdAt: "2026-08-20",
                },
              ],
              requirements: [
                {
                  id: "req_cst_01",
                  title: "Otomatik Çok Seviyeli Recursive BOM Maliyet Roll-Up Motoru",
                  description: "Sistem en alt hammadde ve operasyondan başlayarak tüm yarı mamul maliyetlerini otomatik hesaplamalı ve döngüsel reçete kilitlerini çalıştırmalıdır.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "CST-015",
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
          id: "f_cst_01",
          title: "Yarı Mamul Maliyetlerinin Güncellenmemesi Nedeniyle Hatalı Mamul Maliyeti",
          description: "Alt kademedeki saç büküm parçalarının maliyet artışları ana montaj maliyetine manuel aktarılamamakta ve kâr marjı erimektedir.",
          priority: "critical",
          status: "open",
          questionId: "CST-015",
          createdAt: "2026-08-20",
        },
      ],
      requirements: [
        {
          id: "req_cst_01",
          title: "Otomatik Çok Seviyeli Recursive BOM Maliyet Roll-Up Motoru",
          description: "Sistem en alt hammadde ve operasyondan başlayarak tüm yarı mamul maliyetlerini otomatik hesaplamalı ve döngüsel reçete kilitlerini çalıştırmalıdır.",
          priority: "critical",
          status: "confirmed",
          questionId: "CST-015",
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

const docxBuf = await buildDocxBuffer(mockCstReportModel);
assert(docxBuf.length > 5000, `DOCX üretimi başarılı (${docxBuf.length} byte)`);

const pdfBuf = await buildPdfBuffer(mockCstReportModel);
assert(pdfBuf.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuf.length} byte)`);

const parser = new PDFParse({ data: pdfBuf });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");

assert(pdfText.includes("Maliyetlendirme"), "PDF çıktısında 'Maliyetlendirme' başlığı mevcut");
assert(pdfText.includes("Anadolu İmalat ve Metal Sanayi A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Otomatik Çok Seviyeli Recursive BOM Maliyet Roll-Up Motoru"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockCstReportModel.metadata.packVersions.COSTING === "tr.costing.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("COSTING");
assert(mappedPackId === "tr.costing.core", 'getPackIdForFunction("COSTING") -> tr.costing.core');

// ─── SONUÇ ───────────────────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-27 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
