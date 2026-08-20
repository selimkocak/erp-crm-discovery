/**
 * ERP CRM Discovery — FAZ-28: SABİT KIYMET VE VARLIK YÖNETİMİ / ASSET_MANAGEMENT Acceptance Tests
 *
 * 14 Test Alanı:
 * 1. Pack Loading & Metadata Integrity (ASSET_MANAGEMENT canonical code, pack_id: tr.asset_management.core, v0.1.0)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & IDs (45 questions, AST-001..AST-045 deterministic)
 * 4. Required Question Count (24 required, 21 optional)
 * 5. Choice Options & is_other Validation
 * 6. 24 Canonical Process Coverage (A'dan X'e 24 süreç)
 * 7. Branching Engine Resolution (5 Koşullu Dallanma Noktası)
 * 8. Progress Calculation & Follow-up Deduction (24 required, 🟡/🔴 bayrak etkisi)
 * 9. Cross-Pack Duplication Audit (Tüm 18 modülle 0 mükerrerlik)
 * 10. Custom Questions Adapter Compatibility
 * 11. ReportModel & Formatting Truth (Enum sızıntısı yok, dürüst etiket)
 * 12. DOCX Generation & Integrity
 * 13. PDF Generation & TrueType Unicode Text Extraction (Liberation Sans, Türkçe karakterler)
 * 14. Loader Registry Parity (getPackIdForFunction("ASSET_MANAGEMENT") -> tr.asset_management.core)
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
console.log("FAZ-28: SABİT KIYMET VE VARLIK YÖNETİMİ / ASSET_MANAGEMENT TEST");
console.log("══════════════════════════════════════════════════\n");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/asset_management/core.json");
const raw = readFileSync(packPath, "utf-8");
const pack = JSON.parse(raw) as QuestionPack;

assert(!!pack, "ASSET_MANAGEMENT pack JSON başarıyla okundu");
assert(pack.meta?.pack_id === "tr.asset_management.core", "pack_id = tr.asset_management.core");
assert(pack.meta?.version === "0.1.0", "version = 0.1.0");
assert(pack.meta?.schema_version === "1", "schema_version = 1");
assert(pack.meta?.language === "tr", "language = tr");
assert(pack.meta?.business_function_code === "ASSET_MANAGEMENT", "business_function_code = ASSET_MANAGEMENT (Kanonik Kod)");
assert(pack.meta?.name === "Sabit Kıymet ve Varlık Yönetimi Ön Analizi", `name = ${pack.meta?.name}`);
assert((pack.meta?.description?.length ?? 0) > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(assetManagementPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ─────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 45, `Toplam soru sayısı tam 45 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 45, "Tüm 45 soru ID'si benzersizdir");

let sequential = true;
for (let i = 1; i <= 45; i++) {
  const expectedId = `AST-${String(i).padStart(3, "0")}`;
  if (ids[i - 1] !== expectedId) {
    sequential = false;
    break;
  }
}
assert(sequential, "Tüm sorular AST-001'den AST-045'e sıralı ve deterministiktir");

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

// ─── TEST 6: 24 Canonical Process Coverage ───────────────────────────────────
console.log("\n=== T06: 24 Canonical Process Coverage ===");
const processes = new Set(pack.questions.map((q) => q.process));
assert(processes.size === 24, `Tam 24 farklı süreç grubu tanımlı (${processes.size})`);

const expectedProcesses = [
  "Varlık Yönetimi Organizasyonu",
  "Varlık Ana Veri Yapısı",
  "Varlık Sınıflandırması",
  "Varlık Kodlama / Numaralandırma",
  "Edinim ve Aktifleştirme",
  "Varlık Maliyet Bileşenleri",
  "Fiziksel Lokasyon Yönetimi",
  "Zimmet / Kullanıcı Ataması",
  "Organizasyon / Şirket / Şube Sahipliği",
  "Seri Numarası ve Teknik Kimlik",
  "Faydalı Ömür ve Amortisman Bağlantısı",
  "Garanti Yönetimi",
  "Sigorta Yönetimi",
  "Varlık Transferi",
  "Değer Artırıcı Harcamalar / Capitalization",
  "Varlık Bölme / Birleştirme",
  "Fiziksel Sayım",
  "Kayıp / Çalınma / Hasar",
  "Kullanım Dışı / Idle Asset",
  "Hurda / Satış / Elden Çıkarma",
  "Bakım Entegrasyonu",
  "Belge ve Dokümanlar",
  "Varlık Geçmişi / Audit Trail",
  "Varlık Raporlama ve KPI",
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

// Senaryo 1: Zimmet takibi yoksa AST-016 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("AST-015", { selected: [{ value: "zimmet_takibi_yapilmamaktadir" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "AST-016"), "AST-015=zimmet_takibi_yapilmamaktadir iken AST-016 gizlendi");

answersScenario1.set("AST-015", { selected: [{ value: "erp_uzerinden_tc_kimlik_sicil_no_ile_personele_ve_departmana_birebir_zimmet_takibi_yapilir" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "AST-016"), "AST-015=erp_uzerinden_tc_kimlik... iken AST-016 görünür");

// Senaryo 2: Garanti takibi yoksa AST-024 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("AST-023", { selected: [{ value: "garanti_takibi_yapilmamaktadir" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "AST-024"), "AST-023=garanti_takibi_yapilmamaktadir iken AST-024 gizlendi");

answersScenario2.set("AST-023", { selected: [{ value: "garanti_tarihleri_kapsami_ve_yetkili_servis_bilgisi_varlik_kartinda_eksiksiz_izlenir" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "AST-024"), "AST-023=garanti_tarihleri_kapsami... iken AST-024 görünür");

// Senaryo 3: Sigorta takibi yoksa AST-026 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("AST-025", { selected: [{ value: "varlik_bazli_sigorta_takibi_yapilmamaktadir" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "AST-026"), "AST-025=varlik_bazli_sigorta_takibi_yapilmamaktadir iken AST-026 gizlendi");

answersScenario3.set("AST-025", { selected: [{ value: "varlik_bazinda_sigorta_policesi_teminat_bedeli_ve_bitis_tarihi_sistemde_tutulur" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "AST-026"), "AST-025=varlik_bazinda_sigorta... iken AST-026 görünür");

// Senaryo 4: Sayım yapılmıyorsa AST-034 gizlenmeli
const answersScenario4 = new Map<string, AnswerData>();
answersScenario4.set("AST-033", { selected: [{ value: "fiziksel_varlik_sayimi_yapilmamaktadir" }] });
const visibleQ7 = getVisibleQuestions(pack.questions, answersScenario4);
assert(!visibleQ7.some((q) => q.id === "AST-034"), "AST-033=fiziksel_varlik_sayimi_yapilmamaktadir iken AST-034 gizlendi");

answersScenario4.set("AST-033", { selected: [{ value: "yılda_en_az_bir_kez_tum_tesislerde_planli_fiziksel_sayim_yapilir_ve_kayitlarla_karsilastirilir" }] });
const visibleQ8 = getVisibleQuestions(pack.questions, answersScenario4);
assert(visibleQ8.some((q) => q.id === "AST-034"), "AST-033=yılda_en_az_bir_kez... iken AST-034 görünür");

// Senaryo 5: Bakım entegrasyonu yoksa AST-042 gizlenmeli
const answersScenario5 = new Map<string, AnswerData>();
answersScenario5.set("AST-041", { selected: [{ value: "bakim_ekipmani_ile_varlik_arasinda_iliski_kurulmamaktadir" }] });
const visibleQ9 = getVisibleQuestions(pack.questions, answersScenario5);
assert(!visibleQ9.some((q) => q.id === "AST-042"), "AST-041=bakim_ekipmani_ile_varlik_arasinda_iliski_kurulmamaktadir iken AST-042 gizlendi");

answersScenario5.set("AST-041", { selected: [{ value: "varlik_karti_ile_teknik_ekipman_karti_birebir_entegredir_ve_ayni_kimlik_uzerinden_senkron_calisir" }] });
const visibleQ10 = getVisibleQuestions(pack.questions, answersScenario5);
assert(visibleQ10.some((q) => q.id === "AST-042"), "AST-041=varlik_karti_ile_teknik_ekipman... iken AST-042 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `24 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("AST-015", {
  id: "qf_ast_15",
  analysis_project_id: "p1",
  business_function_code: "ASSET_MANAGEMENT",
  question_id: "AST-015",
  flag_type: "critical",
  note: "Personel zimmet formu ve İK çıkış ilişik kesme dijital onay süreci İdari İşler Müdürü ile netleştirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("AST-041", {
  id: "qf_ast_41",
  analysis_project_id: "p1",
  business_function_code: "ASSET_MANAGEMENT",
  question_id: "AST-041",
  flag_type: "revisit",
  note: "Bakım ekipman kartı ile sabit kıymet kartı 1-to-1 eşleşme ve TCO takip altyapısı incelenecek",
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
const cstPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/costing/core.json"), "utf-8")) as QuestionPack;
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

const astQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
const cstQuestionTexts = cstPack.questions.map((q) => q.question.toLowerCase().trim());
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
  for (const aq of astQuestionTexts) {
    if (otherTexts.includes(aq)) {
      count++;
      console.error(`${packName} ile birebir örtüşen soru bulundu: "${aq}"`);
    }
  }
  assert(count === 0, `${packName} soru paketi ile sıfır birebir mükerrer soru (0 overlap)`);
}

checkOverlap(cstQuestionTexts, "Costing");
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
  id: "cq_ast_001",
  analysis_project_id: "p1",
  business_function_code: "ASSET_MANAGEMENT",
  process_name: "Fiziksel Lokasyon Yönetimi",
  question_text: "Fabrika içerisindeki kritik kalıplar ve takım aparatları için Bluetooth Low Energy (BLE) beacon veya ultra geniş bant (UWB) iç mekan konumlandırma sistemi kullanılmakta mıdır?",
  description: "İç mekan gerçek zamanlı varlık konumlandırma (RTLS) teknolojisi.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_ast_001", value: "ble_uwb_kullanilir", label: "Evet, BLE veya UWB sensörlerle anlık harita konumu izlenir", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_ast_001", value: "barkod_okutma_yeterlidir", label: "Hayır, istasyon barkod okutması yeterli görülmektedir", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_ast_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 46);
assert(adaptedQuestion.id === "cq_ast_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Fiziksel Lokasyon Yönetimi", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "idari_isler_ve_muhasebe_ortak_sorumlulugunda_yonetilir", note: "İdari İşler etiketleme ve zimmeti, Muhasebe ise VUK amortisman defterini tutmaktadır." }],
  general_note: "Şirket bünyesinde 4.500 adet aktif kayıtlı duran varlık bulunmaktadır.",
});
assert(
  formattedQ1.summaryText.includes("İdari İşler fiziksel varlık ve zimmeti, Muhasebe ise mali defter ve amortismanı koordine olarak yönetir"),
  "Kullanıcı dostu label formatlandı (idari_isler_ve_muhasebe... enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("İdari İşler etiketleme ve zimmeti, Muhasebe ise VUK amortisman defterini tutmaktadır."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Şirket bünyesinde 4.500 adet aktif kayıtlı duran varlık bulunmaktadır."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with ASSET_MANAGEMENT Data ===");
const mockAstReportModel: ReportModel = {
  metadata: {
    title: "ERP / Varlık Keşif Analiz Raporu",
    projectName: "Sabit Kıymet, Zimmet Takibi ve Varlık Yaşam Döngüsü Keşfi",
    companyName: "Trakya Endüstri ve Otomotiv Yan Sanayi A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: {
      ASSET_MANAGEMENT: "tr.asset_management.core v0.1.0",
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
    companyName: "Trakya Endüstri ve Otomotiv Yan Sanayi A.Ş.",
    tradeName: "Trakya Endüstri",
    taxNumber: "7766554433",
    city: "Tekirdağ",
    country: "Türkiye",
    employeeCount: "520",
    notes: "Çerkezköy ve Çorlu tesislerindeki 4.500 adet duran varlığın fiziksel ve mali yönetimi incelendi.",
  },
  profile: {
    analysis_project_id: "p_faz28",
    executive_summary: "Duran varlık edinim, aktifleştirme, barkodlu fiziksel lokasyon, personel zimmeti, bakım ekipman eşleşmesi ve hurda/satış yaşam döngüsü gereksinimleri belirlendi.",
    overall_assessment: "Excel tablolarında tutulan zimmet ve lokasyon kayıtlarının ERP sabit kıymet ana verisine ve barkodlu mobil sayım sistemine entegrasyonu kararlaştırıldı.",
    open_topics: "VUK ve TFRS çoklu amortisman defterleri ile bakım ekipmanı 1-to-1 eşleşme kuralları onaylanacak.",
  },
  scope: [
    {
      code: "ASSET_MANAGEMENT",
      nameTr: "Varlık Yönetimi",
      nameEn: "Asset Management",
      category: "Yönetim",
      departmentName: "İdari İşler ve Muhasebe Direktörlüğü",
      responsiblePerson: "Ahmet Yılmaz",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 24,
      totalQuestionCount: 24,
    },
  ],
  businessFunctions: [
    {
      code: "ASSET_MANAGEMENT",
      nameTr: "Varlık Yönetimi",
      nameEn: "Asset Management",
      category: "Yönetim",
      sortOrder: 27,
      departmentName: "İdari İşler ve Muhasebe Direktörlüğü",
      responsiblePerson: "Ahmet Yılmaz",
      status: "completed",
      packId: "tr.asset_management.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 24,
      totalQuestionCount: 24,
      processes: [
        {
          name: "Zimmet / Kullanıcı Ataması",
          order: 8,
          questions: [
            {
              id: "AST-015",
              order: 15,
              process: "Zimmet / Kullanıcı Ataması",
              questionText: "Personele veya belirli bir departmana tahsis edilen kişisel ve ortak varlıkların (Laptop, telefon, araç, el aleti, ölçüm cihazı) zimmet takibi nasıl yürütülmektedir?",
              answerType: "single_choice",
              criticality: "critical",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "erp_uzerinden_tc_kimlik_sicil_no_ile_personele_ve_departmana_birebir_zimmet_takibi_yapilir",
                    label: "ERP sistemi üzerinden personelin sicil numarasına ve departmanına birebir zimmetlenerek tam izlenir",
                    isOther: false,
                    note: "600 personelin bilgisayar, telefon ve el terminalleri sicil bazlı zimmetlenmektedir.",
                  },
                ],
                summaryText: "• ERP sistemi üzerinden personelin sicil numarasına ve departmanına birebir zimmetlenerek tam izlenir",
              },
              findings: [
                {
                  id: "f_ast_01",
                  title: "Kağıt Zimmet Formlarının Kaybolması Nedeniyle Personel Çıkışında Ekipman Takipsizliği",
                  description: "İşten ayrılan personelin üzerindeki laptop ve el terminallerinin kontrolü kağıt klasörlerden manuel yapıldığı için ekipman kayıpları yaşanmaktadır.",
                  priority: "critical",
                  status: "open",
                  questionId: "AST-015",
                  createdAt: "2026-08-20",
                },
              ],
              requirements: [
                {
                  id: "req_ast_01",
                  title: "Dijital Zimmet Yönetimi ve İK İlişik Kesme Otomatik Kontrol Sistemi",
                  description: "Sistem personelin sicil no'suna bağlı tüm aktif zimmetleri anlık listelemeli ve İK çıkış onayında zorunlu ilişik kesme kontrolü yapmalıdır.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "AST-015",
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
          id: "f_ast_01",
          title: "Kağıt Zimmet Formlarının Kaybolması Nedeniyle Personel Çıkışında Ekipman Takipsizliği",
          description: "İşten ayrılan personelin üzerindeki laptop ve el terminallerinin kontrolü kağıt klasörlerden manuel yapıldığı için ekipman kayıpları yaşanmaktadır.",
          priority: "critical",
          status: "open",
          questionId: "AST-015",
          createdAt: "2026-08-20",
        },
      ],
      requirements: [
        {
          id: "req_ast_01",
          title: "Dijital Zimmet Yönetimi ve İK İlişik Kesme Otomatik Kontrol Sistemi",
          description: "Sistem personelin sicil no'suna bağlı tüm aktif zimmetleri anlık listelemeli ve İK çıkış onayında zorunlu ilişik kesme kontrolü yapmalıdır.",
          priority: "critical",
          status: "confirmed",
          questionId: "AST-015",
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
const docxBuf = await buildDocxBuffer(mockAstReportModel);
assert(docxBuf.length > 5000, `DOCX üretimi başarılı (${docxBuf.length} byte)`);

// PDF Testi
const pdfBuf = await buildPdfBuffer(mockAstReportModel);
assert(pdfBuf.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuf.length} byte)`);

const parser = new PDFParse({ data: pdfBuf });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");

assert(pdfText.includes("Varlık Yönetimi"), "PDF çıktısında 'Varlık Yönetimi' başlığı mevcut");
assert(pdfText.includes("Trakya Endüstri ve Otomotiv Yan Sanayi A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Dijital Zimmet Yönetimi ve İK İlişik Kesme Otomatik Kontrol Sistemi"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockAstReportModel.metadata.packVersions.ASSET_MANAGEMENT === "tr.asset_management.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("ASSET_MANAGEMENT");
assert(mappedPackId === "tr.asset_management.core", 'getPackIdForFunction("ASSET_MANAGEMENT") -> tr.asset_management.core');

// ─── SONUÇ ───────────────────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-28 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
