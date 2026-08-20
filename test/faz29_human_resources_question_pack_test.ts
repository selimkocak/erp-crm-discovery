/**
 * ERP CRM Discovery — FAZ-29: İNSAN KAYNAKLARI / HUMAN_RESOURCES Acceptance Tests
 *
 * 14 Test Alanı:
 * 1. Pack Loading & Metadata Integrity (HUMAN_RESOURCES canonical code, pack_id: tr.human_resources.core, v0.1.0)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & IDs (46 questions, HRS-001..HRS-046 deterministic)
 * 4. Required Question Count (25 required, 21 optional)
 * 5. Choice Options & is_other Validation
 * 6. 25 Canonical Process Coverage (A'dan Y'ye 25 süreç)
 * 7. Branching Engine Resolution (5 Koşullu Dallanma Noktası)
 * 8. Progress Calculation & Follow-up Deduction (25 required, 🟡/🔴 bayrak etkisi)
 * 9. Cross-Pack Duplication Audit (Tüm 19 modülle 0 mükerrerlik)
 * 10. Custom Questions Adapter Compatibility
 * 11. ReportModel & Formatting Truth (Enum sızıntısı yok, dürüst etiket)
 * 12. DOCX Generation & Integrity
 * 13. PDF Generation & TrueType Unicode Text Extraction (Liberation Sans, Türkçe karakterler)
 * 14. Loader Registry Parity (getPackIdForFunction("HUMAN_RESOURCES") -> tr.human_resources.core)
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
console.log("FAZ-29: İNSAN KAYNAKLARI / HUMAN_RESOURCES TEST");
console.log("══════════════════════════════════════════════════\n");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/human_resources/core.json");
const raw = readFileSync(packPath, "utf-8");
const pack = JSON.parse(raw) as QuestionPack;

assert(!!pack, "HUMAN_RESOURCES pack JSON başarıyla okundu");
assert(pack.meta?.pack_id === "tr.human_resources.core", "pack_id = tr.human_resources.core");
assert(pack.meta?.version === "0.1.0", "version = 0.1.0");
assert(pack.meta?.schema_version === "1", "schema_version = 1");
assert(pack.meta?.language === "tr", "language = tr");
assert(pack.meta?.business_function_code === "HUMAN_RESOURCES", "business_function_code = HUMAN_RESOURCES (Kanonik Kod)");
assert(pack.meta?.name === "İnsan Kaynakları Yönetimi Ön Analizi", `name = ${pack.meta?.name}`);
assert((pack.meta?.description?.length ?? 0) > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(humanResourcesPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ─────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 46, `Toplam soru sayısı tam 46 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 46, "Tüm 46 soru ID'si benzersizdir");

let sequential = true;
for (let i = 1; i <= 46; i++) {
  const expectedId = `HRS-${String(i).padStart(3, "0")}`;
  if (ids[i - 1] !== expectedId) {
    sequential = false;
    break;
  }
}
assert(sequential, "Tüm sorular HRS-001'den HRS-046'ya sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ─────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 25, `Zorunlu soru sayısı tam 25 adettir (${requiredQuestions.length})`);
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
  "İnsan Kaynakları Organizasyonu",
  "Çalışan Ana Veri Yapısı",
  "Organizasyon Şeması",
  "Departman / Pozisyon / Unvan",
  "İş Yeri / Şube / Lokasyon",
  "İşe Alım Sonrası Personel Açılışı",
  "İşe Giriş Süreci (Onboarding)",
  "İş Sözleşmeleri",
  "Personel Statüleri",
  "Çalışma Takvimi",
  "Vardiya Yönetimi",
  "Puantaj Veri Kaynakları",
  "İzin Yönetimi",
  "Devamsızlık",
  "Fazla Mesai",
  "Yetkinlik Yönetimi",
  "Eğitim ve Sertifika",
  "Performans Değerlendirme",
  "Kariyer / Terfi / Görev Değişikliği",
  "Ücret ve Yan Hak Master Bilgileri",
  "SGK / Teşvik Veri Hazırlığı",
  "Zimmet Entegrasyonu",
  "Personel Belgeleri ve KVKK",
  "İşten Çıkış Süreci (Offboarding)",
  "HR Raporlama ve KPI",
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

// Senaryo 1: Vardiya yoksa HRS-022 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("HRS-021", { selected: [{ value: "vardiyali_calisma_yapilmamaktadir_tum_sirket_tek_gunduz_mesaisindedir" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "HRS-022"), "HRS-021=vardiyali_calisma_yapilmamaktadir... iken HRS-022 gizlendi");

answersScenario1.set("HRS-021", { selected: [{ value: "evet_2_veya_3_vardiyali_donusumlu_calisma_duzeni_uygulanmaktadir" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "HRS-022"), "HRS-021=evet_2_veya_3_vardiyali... iken HRS-022 görünür");

// Senaryo 2: Elektronik PDKS yoksa HRS-024 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("HRS-023", { selected: [{ value: "elektronik_pdks_kullanilmamaktadir_manuel_takip_edilir" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "HRS-024"), "HRS-023=elektronik_pdks_kullanilmamaktadir... iken HRS-024 gizlendi");

answersScenario2.set("HRS-023", { selected: [{ value: "kartli_turnike_veya_biyometrik_yuz_parmak_izi_pdks_cihazlariyla_elektronik_toplanir" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "HRS-024"), "HRS-023=kartli_turnike_veya_biyometrik... iken HRS-024 görünür");

// Senaryo 3: Fazla mesai yoksa HRS-030 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("HRS-029", { selected: [{ value: "fazla_mesai_uygulanmamaktadir" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "HRS-030"), "HRS-029=fazla_mesai_uygulanmamaktadir iken HRS-030 gizlendi");

answersScenario3.set("HRS-029", { selected: [{ value: "onceden_sistemden_mesai_talebi_acilir_amir_onaylar_ve_pdks_fiili_saatiyle_eslesir" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "HRS-030"), "HRS-029=onceden_sistemden_mesai_talebi... iken HRS-030 görünür");

// Senaryo 4: Yetkinlik takibi yoksa HRS-032 gizlenmeli
const answersScenario4 = new Map<string, AnswerData>();
answersScenario4.set("HRS-031", { selected: [{ value: "yetkinlik_takibi_yapilmamaktadir" }] });
const visibleQ7 = getVisibleQuestions(pack.questions, answersScenario4);
assert(!visibleQ7.some((q) => q.id === "HRS-032"), "HRS-031=yetkinlik_takibi_yapilmamaktadir iken HRS-032 gizlendi");

answersScenario4.set("HRS-031", { selected: [{ value: "sistemde_kapsamli_yetkinlik_matrisi_skill_matrix_tanimlidir_ve_periyodik_seviyeler_guncellenir" }] });
const visibleQ8 = getVisibleQuestions(pack.questions, answersScenario4);
assert(visibleQ8.some((q) => q.id === "HRS-032"), "HRS-031=sistemde_kapsamli_yetkinlik... iken HRS-032 görünür");

// Senaryo 5: Performans değerlendirme yoksa HRS-036 gizlenmeli
const answersScenario5 = new Map<string, AnswerData>();
answersScenario5.set("HRS-035", { selected: [{ value: "sistematik_performans_degerlendirme_yapilmamaktadir" }] });
const visibleQ9 = getVisibleQuestions(pack.questions, answersScenario5);
assert(!visibleQ9.some((q) => q.id === "HRS-036"), "HRS-035=sistematik_performans_degerlendirme_yapilmamaktadir iken HRS-036 gizlendi");

answersScenario5.set("HRS-035", { selected: [{ value: "evet_tum_personel_veya_beyaz_yaka_icin_yillik_donemsel_resmi_performans_degerlendirmesi_yapilir" }] });
const visibleQ10 = getVisibleQuestions(pack.questions, answersScenario5);
assert(visibleQ10.some((q) => q.id === "HRS-036"), "HRS-035=evet_tum_personel_veya_beyaz_yaka... iken HRS-036 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `25 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("HRS-007", {
  id: "qf_hrs_07",
  analysis_project_id: "p1",
  business_function_code: "HUMAN_RESOURCES",
  question_id: "HRS-007",
  flag_type: "critical",
  note: "Departman, pozisyon, kadro ve unvan ayrımı İK Direktörü ile netleştirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("HRS-041", {
  id: "qf_hrs_41",
  analysis_project_id: "p1",
  business_function_code: "HUMAN_RESOURCES",
  question_id: "HRS-041",
  flag_type: "revisit",
  note: "SGK teşvik kodları ve danışmanlık yazılımı veri aktarım formatı incelenecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});

const progressWithFollowups = calculateProgress(pack.questions, answersAllReq, mockFollowups);
assert(progressWithFollowups.answered === 23, `Bayraklı sorular tamamlanmamış sayıldı (23/25)`);
assert(progressWithFollowups.percentage === Math.round((23 / 25) * 100), `İlerleme dürüstçe %${progressWithFollowups.percentage} hesaplandı`);

// ─── TEST 9: Cross-Pack Duplication Audit ─────────────────────────────────────
console.log("\n=== T09: Cross-Pack Duplication Audit ===");
const astPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/asset_management/core.json"), "utf-8")) as QuestionPack;
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

const hrsQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
const astQuestionTexts = astPack.questions.map((q) => q.question.toLowerCase().trim());
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
  for (const hq of hrsQuestionTexts) {
    if (otherTexts.includes(hq)) {
      count++;
      console.error(`${packName} ile birebir örtüşen soru bulundu: "${hq}"`);
    }
  }
  assert(count === 0, `${packName} soru paketi ile sıfır birebir mükerrer soru (0 overlap)`);
}

checkOverlap(astQuestionTexts, "Asset Management");
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
  id: "cq_hrs_001",
  analysis_project_id: "p1",
  business_function_code: "HUMAN_RESOURCES",
  process_name: "Puantaj Veri Kaynakları",
  question_text: "Fabrika kapılarındaki turnikelerde yemekhane geçiş kontrolü ile mesai puantajı aynı kart üzerinden senkron olarak mı yürütülmektedir?",
  description: "Yemekhane geçişi ve puantaj tek kart entegrasyonu.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_hrs_001", value: "tek_kart_senkron", label: "Evet, tek kartla hem yemekhane hem mesai takip edilir", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_hrs_001", value: "ayri_sistemler", label: "Hayır, yemekhane için ayrı kupon veya kart kullanılır", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_hrs_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 47);
assert(adaptedQuestion.id === "cq_hrs_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Puantaj Veri Kaynakları", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "merkezi_ve_uzmanlasmis_ik_direktorlugu_tarafindan_tum_tesisler_yonetilir", note: "Genel Merkezde 8 kişilik İK ekibi tüm fabrikaların özlük, işe alım ve eğitimini yönetmektedir." }],
  general_note: "Şirket genelinde 1.250 çalışan bulunmaktadır.",
});
assert(
  formattedQ1.summaryText.includes("Merkezi İK Direktörlüğü altında İşe Alım, Özlük/Puantaj, Eğitim ve Yetenek Yönetimi ayrı ekiplerle yönetilir"),
  "Kullanıcı dostu label formatlandı (merkezi_ve_uzmanlasmis... enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("Genel Merkezde 8 kişilik İK ekibi tüm fabrikaların özlük, işe alım ve eğitimini yönetmektedir."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Şirket genelinde 1.250 çalışan bulunmaktadır."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with HUMAN_RESOURCES Data ===");
const mockHrsReportModel: ReportModel = {
  metadata: {
    title: "ERP / İnsan Kaynakları Keşif Analiz Raporu",
    projectName: "İnsan Kaynakları, Özlük, Puantaj ve Organizasyonel Hiyerarşi Keşfi",
    companyName: "Anadolu İmalat ve Otomotiv Sanayi A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: {
      HUMAN_RESOURCES: "tr.human_resources.core v0.1.0",
    },
    isComplete: true,
    progressPercent: 100,
    requiredAnswered: 25,
    requiredTotal: 25,
    reportType: "final",
    draftLabel: "TAM RAPOR — %100",
    projectProgressPercent: 100,
    completedFunctionCount: 1,
    selectedFunctionCount: 1,
    isProjectComplete: true,
  },
  company: {
    companyName: "Anadolu İmalat ve Otomotiv Sanayi A.Ş.",
    tradeName: "Anadolu İmalat",
    taxNumber: "9988776655",
    city: "Bursa",
    country: "Türkiye",
    employeeCount: "1250",
    notes: "Bursa ve Manisa tesislerindeki 1.250 çalışanın özlük, vardiya, puantaj ve yetkinlik süreçleri incelendi.",
  },
  profile: {
    analysis_project_id: "p_faz29",
    executive_summary: "Çalışan ana verisi, kadro ve pozisyon hiyerarşisi, 3 vardiyalı çalışma düzeni, PDKS puantaj entegrasyonu, yetkinlik matrisi ve SGK teşvik hazırlık gereksinimleri belirlendi.",
    overall_assessment: "Excel'de yürütülen vardiya çizelgeleri ve kağıt izin formlarının yerini alacak self-service mobil onay ve otomatik PDKS puantaj altyapısı kararlaştırıldı.",
    open_topics: "Makine yetkinlik matrisinin üretim iş emirleri teyitleriyle entegrasyon kuralları onaylanacak.",
  },
  scope: [
    {
      code: "HUMAN_RESOURCES",
      nameTr: "İnsan Kaynakları Yönetimi",
      nameEn: "Human Resources Management",
      category: "İnsan Kaynakları",
      departmentName: "İnsan Kaynakları Direktörlüğü",
      responsiblePerson: "Selin Demir",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 25,
      totalQuestionCount: 25,
    },
  ],
  businessFunctions: [
    {
      code: "HUMAN_RESOURCES",
      nameTr: "İnsan Kaynakları Yönetimi",
      nameEn: "Human Resources Management",
      category: "İnsan Kaynakları",
      sortOrder: 3,
      departmentName: "İnsan Kaynakları Direktörlüğü",
      responsiblePerson: "Selin Demir",
      status: "completed",
      packId: "tr.human_resources.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 25,
      totalQuestionCount: 25,
      processes: [
        {
          name: "Puantaj Veri Kaynakları",
          order: 12,
          questions: [
            {
              id: "HRS-023",
              order: 23,
              process: "Puantaj Veri Kaynakları",
              questionText: "Çalışanların günlük işe geliş-gidiş saatleri ve fiili çalışma süreleri hangi yöntem ve teknolojiyle (PDKS, Kartlı Geçiş, Parmak İzi/Yüz Tanıma, Turnike, Mobil GPS, Excel, Manuel) toplanmaktadır?",
              answerType: "single_choice",
              criticality: "critical",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "kartli_turnike_veya_biyometrik_yuz_parmak_izi_pdks_cihazlariyla_elektronik_toplanir",
                    label: "Kartlı turnike veya biyometrik (yüz tanıma / parmak izi) PDKS cihazlarıyla elektronik toplanır",
                    isOther: false,
                    note: "Turnike ham logları anlık aktarılmaktadır.",
                  },
                ],
                summaryText: "• Kartlı turnike veya biyometrik (yüz tanıma / parmak izi) PDKS cihazlarıyla elektronik toplanır",
              },
              findings: [
                {
                  id: "f_hrs_01",
                  title: "PDKS Loglarının Manuel Excel ile Bordroya Aktarılması Nedeniyle Fazla Mesai Hataları",
                  description: "Ham kart basış logları Excel'de manuel ayıklandığı için vardiya kaymalarında hatalı fazla mesai tahakkuku oluşmaktadır.",
                  priority: "critical",
                  status: "open",
                  questionId: "HRS-023",
                  createdAt: "2026-08-20",
                },
              ],
              requirements: [
                {
                  id: "req_hrs_01",
                  title: "Otomatik PDKS Ham Log Taraması ve Toleranslı Puantaj Motoru",
                  description: "Sistem PDKS turnike loglarını vardiya saatleri ve tolerans dakikalarıyla otomatik eşleştirerek bordro girdi tablosunu hatasız oluşturmalıdır.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "HRS-023",
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
          id: "f_hrs_01",
          title: "PDKS Loglarının Manuel Excel ile Bordroya Aktarılması Nedeniyle Fazla Mesai Hataları",
          description: "Ham kart basış logları Excel'de manuel ayıklandığı için vardiya kaymalarında hatalı fazla mesai tahakkuku oluşmaktadır.",
          priority: "critical",
          status: "open",
          questionId: "HRS-023",
          createdAt: "2026-08-20",
        },
      ],
      requirements: [
        {
          id: "req_hrs_01",
          title: "Otomatik PDKS Ham Log Taraması ve Toleranslı Puantaj Motoru",
          description: "Sistem PDKS turnike loglarını vardiya saatleri ve tolerans dakikalarıyla otomatik eşleştirerek bordro girdi tablosunu hatasız oluşturmalıdır.",
          priority: "critical",
          status: "confirmed",
          questionId: "HRS-023",
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
    answeredQuestions: 25,
    totalQuestions: 25,
    openFollowupCount: 0,
    revisitCount: 0,
    criticalFollowupCount: 0,
  },
};

// DOCX Testi
const docxBuf = await buildDocxBuffer(mockHrsReportModel);
assert(docxBuf.length > 5000, `DOCX üretimi başarılı (${docxBuf.length} byte)`);

// PDF Testi
const pdfBuf = await buildPdfBuffer(mockHrsReportModel);
assert(pdfBuf.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuf.length} byte)`);

const parser = new PDFParse({ data: pdfBuf });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");

assert(pdfText.includes("İnsan Kaynakları"), "PDF çıktısında 'İnsan Kaynakları' başlığı mevcut");
assert(pdfText.includes("Anadolu İmalat ve Otomotiv Sanayi A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Otomatik PDKS Ham Log Taraması ve Toleranslı Puantaj Motoru"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockHrsReportModel.metadata.packVersions.HUMAN_RESOURCES === "tr.human_resources.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("HUMAN_RESOURCES");
assert(mappedPackId === "tr.human_resources.core", 'getPackIdForFunction("HUMAN_RESOURCES") -> tr.human_resources.core');

// ─── SONUÇ ───────────────────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-29 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
