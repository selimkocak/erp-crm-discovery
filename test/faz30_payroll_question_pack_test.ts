/**
 * ERP CRM Discovery — FAZ-30: BORDRO VE ÜCRET YÖNETİMİ / PAYROLL Acceptance Tests
 *
 * 14 Test Alanı:
 * 1. Pack Loading & Metadata Integrity (PAYROLL canonical code, pack_id: tr.payroll.core, v0.1.0)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & IDs (47 questions, PAY-001..PAY-047 deterministic)
 * 4. Required Question Count (26 required, 21 optional)
 * 5. Choice Options & is_other Validation
 * 6. 25 Canonical Process Coverage (A'dan Y'ye 25 süreç)
 * 7. Branching Engine Resolution (5 Koşullu Dallanma Noktası)
 * 8. Progress Calculation & Follow-up Deduction (26 required, 🟡/🔴 bayrak etkisi)
 * 9. Cross-Pack Duplication Audit (Tüm 20 modülle 0 mükerrerlik)
 * 10. Custom Questions Adapter Compatibility
 * 11. ReportModel & Formatting Truth (Enum sızıntısı yok, dürüst etiket)
 * 12. DOCX Generation & Integrity
 * 13. PDF Generation & TrueType Unicode Text Extraction (Liberation Sans, Türkçe karakterler)
 * 14. Loader Registry Parity (getPackIdForFunction("PAYROLL") -> tr.payroll.core)
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
console.log("FAZ-30: BORDRO VE ÜCRET YÖNETİMİ / PAYROLL TEST");
console.log("══════════════════════════════════════════════════\n");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/payroll/core.json");
const raw = readFileSync(packPath, "utf-8");
const pack = JSON.parse(raw) as QuestionPack;

assert(!!pack, "PAYROLL pack JSON başarıyla okundu");
assert(pack.meta?.pack_id === "tr.payroll.core", "pack_id = tr.payroll.core");
assert(pack.meta?.version === "0.1.0", "version = 0.1.0");
assert(pack.meta?.schema_version === "1", "schema_version = 1");
assert(pack.meta?.language === "tr", "language = tr");
assert(pack.meta?.business_function_code === "PAYROLL", "business_function_code = PAYROLL (Kanonik Kod)");
assert(pack.meta?.name === "Bordro ve Ücret Yönetimi Ön Analizi", `name = ${pack.meta?.name}`);
assert((pack.meta?.description?.length ?? 0) > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(payrollPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ─────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 47, `Toplam soru sayısı tam 47 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 47, "Tüm 47 soru ID'si benzersizdir");

let sequential = true;
for (let i = 1; i <= 47; i++) {
  const expectedId = `PAY-${String(i).padStart(3, "0")}`;
  if (ids[i - 1] !== expectedId) {
    sequential = false;
    break;
  }
}
assert(sequential, "Tüm sorular PAY-001'den PAY-047'ye sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ─────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 26, `Zorunlu soru sayısı tam 26 adettir (${requiredQuestions.length})`);
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
  "Bordro Organizasyonu",
  "Bordro Dönemi",
  "Ücret Yapısı",
  "Brüt Ücret Kaynakları",
  "Sabit Kazançlar",
  "Değişken Kazançlar",
  "Prim ve Bonus",
  "Fazla Mesai",
  "İzin ve Devamsızlık Etkisi",
  "Puantajdan Bordroya Veri Akışı",
  "SGK Parametreleri",
  "SGK Teşvikleri",
  "Gelir Vergisi",
  "Damga Vergisi",
  "İstisna / Muafiyetler",
  "Yan Haklar",
  "Kesintiler",
  "İcra / Nafaka / Avans",
  "İşveren Maliyetleri",
  "Bordro Kontrol ve Onay",
  "Bordro Düzeltme / Ek Bordro",
  "Banka Ödeme Dosyaları",
  "Muhasebe Entegrasyonu",
  "Yasal Bildirimler",
  "Bordro Raporlama ve KPI",
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

// Senaryo 1: Prim yoksa PAY-014 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("PAY-013", { selected: [{ value: "prim_veya_bonus_uygulanmamaktadir" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "PAY-014"), "PAY-013=prim_veya_bonus_uygulanmamaktadir iken PAY-014 gizlendi");

answersScenario1.set("PAY-013", { selected: [{ value: "evet_aylik_veya_donemsel_satis_uretim_ve_performans_primleri_duzenli_uygulanir" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "PAY-014"), "PAY-013=evet_aylik_veya_donemsel... iken PAY-014 görünür");

// Senaryo 2: Fazla mesai ücreti yoksa PAY-016 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("PAY-015", { selected: [{ value: "fazla_mesai_ucreti_odenmemektedir" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "PAY-016"), "PAY-015=fazla_mesai_ucreti_odenmemektedir iken PAY-016 gizlendi");

answersScenario2.set("PAY-015", { selected: [{ value: "tum_mesai_turleri_50_hafta_tatili_100_bayram_100_sistemde_ayri_katsayilarla_hesaplanir" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "PAY-016"), "PAY-015=tum_mesai_turleri... iken PAY-016 görünür");

// Senaryo 3: SGK teşviki yoksa PAY-024 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("PAY-023", { selected: [{ value: "sgk_istihdam_tesviki_kullanilmamaktadir" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "PAY-024"), "PAY-023=sgk_istihdam_tesviki_kullanilmamaktadir iken PAY-024 gizlendi");

answersScenario3.set("PAY-023", { selected: [{ value: "evet_5510_bes_puanlik_indirim_ve_birden_fazla_ozel_istihdam_tesviki_aktif_uygulanmaktadir" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "PAY-024"), "PAY-023=evet_5510_bes_puanlik... iken PAY-024 görünür");

// Senaryo 4: Avans veya icra yoksa PAY-036 gizlenmeli
const answersScenario4 = new Map<string, AnswerData>();
answersScenario4.set("PAY-035", { selected: [{ value: "avans_veya_icra_kesintisi_uygulanmamaktadir" }] });
const visibleQ7 = getVisibleQuestions(pack.questions, answersScenario4);
assert(!visibleQ7.some((q) => q.id === "PAY-036"), "PAY-035=avans_veya_icra_kesintisi_uygulanmamaktadir iken PAY-036 gizlendi");

answersScenario4.set("PAY-035", { selected: [{ value: "icra_nafaka_ve_avans_kartlari_tanimlidir_sistem_yasal_oncelik_ve_limit_siralamasina_gore_otomatik_keser" }] });
const visibleQ8 = getVisibleQuestions(pack.questions, answersScenario4);
assert(visibleQ8.some((q) => q.id === "PAY-036"), "PAY-035=icra_nafaka_ve_avans... iken PAY-036 görünür");

// Senaryo 5: Ek/Dönem dışı bordro yoksa PAY-042 gizlenmeli
const answersScenario5 = new Map<string, AnswerData>();
answersScenario5.set("PAY-041", { selected: [{ value: "ek_veya_donem_disi_bordro_calistirilmamaktadir" }] });
const visibleQ9 = getVisibleQuestions(pack.questions, answersScenario5);
assert(!visibleQ9.some((q) => q.id === "PAY-042"), "PAY-041=ek_veya_donem_disi_bordro_calistirilmamaktadir iken PAY-042 gizlendi");

answersScenario5.set("PAY-041", { selected: [{ value: "sistem_gecmise_donuk_fark_hesaplamasini_retro_otomatik_yapar_ve_guncel_aya_fark_olarak_tasir" }] });
const visibleQ10 = getVisibleQuestions(pack.questions, answersScenario5);
assert(visibleQ10.some((q) => q.id === "PAY-042"), "PAY-041=sistem_gecmise_donuk... iken PAY-042 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `26 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("PAY-005", {
  id: "qf_pay_05",
  analysis_project_id: "p1",
  business_function_code: "PAYROLL",
  question_id: "PAY-005",
  flag_type: "critical",
  note: "Netten brüte çalışan sözleşmeli personelin vergi dilimi brütleştirme formülü Mali İşler Direktörü ile netleştirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("PAY-043", {
  id: "qf_pay_43",
  analysis_project_id: "p1",
  business_function_code: "PAYROLL",
  question_id: "PAY-043",
  flag_type: "revisit",
  note: "Anlaşmalı bankanın özel maaş ödeme txt formatı ve şifreleme anahtarı temin edilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});

const progressWithFollowups = calculateProgress(pack.questions, answersAllReq, mockFollowups);
assert(progressWithFollowups.answered === 24, `Bayraklı sorular tamamlanmamış sayıldı (24/26)`);
assert(progressWithFollowups.percentage === Math.round((24 / 26) * 100), `İlerleme dürüstçe %${progressWithFollowups.percentage} hesaplandı`);

// ─── TEST 9: Cross-Pack Duplication Audit ─────────────────────────────────────
console.log("\n=== T09: Cross-Pack Duplication Audit ===");
const hrsPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/human_resources/core.json"), "utf-8")) as QuestionPack;
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

const payQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
const hrsQuestionTexts = hrsPack.questions.map((q) => q.question.toLowerCase().trim());
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
  for (const pq of payQuestionTexts) {
    if (otherTexts.includes(pq)) {
      count++;
      console.error(`${packName} ile birebir örtüşen soru bulundu: "${pq}"`);
    }
  }
  assert(count === 0, `${packName} soru paketi ile sıfır birebir mükerrer soru (0 overlap)`);
}

checkOverlap(hrsQuestionTexts, "Human Resources");
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
  id: "cq_pay_001",
  analysis_project_id: "p1",
  business_function_code: "PAYROLL",
  process_name: "Banka Ödeme Dosyaları",
  question_text: "Yurt dışı bağlı şirketlerde çalışan yabancı uyruklu yöneticilerin döviz cinsinden maaş ödemeleri için SWIFT MT103 veya ISO 20022 XML formatında sınır ötesi ödeme dosyası üretilmekte midir?",
  description: "Dövizli yabancı yönetici sınır ötesi maaş aktarım dosyası.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_pay_001", value: "iso20022_swift_kullanilir", label: "Evet, ISO 20022 / MT103 dosya formatı üretilir", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_pay_001", value: "manuel_doviz_talimati", label: "Hayır, bankaya manuel döviz transfer talimatı gönderilir", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_pay_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 48);
assert(adaptedQuestion.id === "cq_pay_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Banka Ödeme Dosyaları", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "sirket_bunyesindeki_uzmanlasmis_bordro_ve_ozluk_isleri_ekibi_tarafindan_yurutulur", note: "İK bünyesinde 4 bordro uzmanı aylık 1.250 bordronun tahakkuk ve bildirgelerini yürütmektedir." }],
  general_note: "Bordro dönemi takvim ayı esasına göredir.",
});
assert(
  formattedQ1.summaryText.includes("Şirket bünyesindeki uzmanlaşmış Bordro ve Özlük İşleri ekibi tarafından doğrudan yürütülür"),
  "Kullanıcı dostu label formatlandı (sirket_bunyesindeki... enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("İK bünyesinde 4 bordro uzmanı aylık 1.250 bordronun tahakkuk ve bildirgelerini yürütmektedir."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Bordro dönemi takvim ayı esasına göredir."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with PAYROLL Data ===");
const mockPayReportModel: ReportModel = {
  metadata: {
    title: "ERP / Bordro ve Ücret Keşif Analiz Raporu",
    projectName: "Bordro Tahakkuk, Ücret Bileşenleri, SGK/Vergi ve Yasal Bildirimler Keşfi",
    companyName: "Ege Metal ve Döküm Sanayi A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: {
      PAYROLL: "tr.payroll.core v0.1.0",
    },
    isComplete: true,
    progressPercent: 100,
    requiredAnswered: 26,
    requiredTotal: 26,
    reportType: "final",
    draftLabel: "TAM RAPOR — %100",
    projectProgressPercent: 100,
    completedFunctionCount: 1,
    selectedFunctionCount: 1,
    isProjectComplete: true,
  },
  company: {
    companyName: "Ege Metal ve Döküm Sanayi A.Ş.",
    tradeName: "Ege Metal",
    taxNumber: "8877665544",
    city: "İzmir",
    country: "Türkiye",
    employeeCount: "850",
    notes: "Aliağa ve Kemalpaşa tesislerindeki 850 çalışanın bordro, fazla mesai, SGK teşvik ve banka ödeme süreçleri incelendi.",
  },
  profile: {
    analysis_project_id: "p_faz30",
    executive_summary: "Bordro hesaplama motoru, netten brüte ve brütten nete çift yönlü hesaplama, PDKS puantaj aktarımı, SGK teşvik optimizasyonu, kümülatif vergi takibi ve banka ödeme dosyası gereksinimleri belirlendi.",
    overall_assessment: "Harici bağımsız bordro yazılımında tutulan ve Excel ile muhasebeye aktarılan yapının yerine tek veritabanında entegre çalışan ERP bordro modülüne geçiş kararlaştırıldı.",
    open_topics: "Anlaşmalı bankanın özel maaş ödeme formatı ve SGK teşvik danışmanlık yazılımı veri aktarım protokolü onaylanacak.",
  },
  scope: [
    {
      code: "PAYROLL",
      nameTr: "Bordro ve Maaş",
      nameEn: "Payroll & Salary",
      category: "İnsan Kaynakları",
      departmentName: "Bordro ve Mali İşler Direktörlüğü",
      responsiblePerson: "Murat Çelik",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 26,
      totalQuestionCount: 26,
    },
  ],
  businessFunctions: [
    {
      code: "PAYROLL",
      nameTr: "Bordro ve Maaş",
      nameEn: "Payroll & Salary",
      category: "İnsan Kaynakları",
      sortOrder: 4,
      departmentName: "Bordro ve Mali İşler Direktörlüğü",
      responsiblePerson: "Murat Çelik",
      status: "completed",
      packId: "tr.payroll.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 26,
      totalQuestionCount: 26,
      processes: [
        {
          name: "Banka Ödeme Dosyaları",
          order: 22,
          questions: [
            {
              id: "PAY-043",
              order: 43,
              process: "Banka Ödeme Dosyaları",
              questionText: "Bordro onaylandıktan sonra personele net maaş, avans ve prim ödemelerinin yapılması için Banka Maaş Ödeme Dosyası (Excel, TXT, XML, Banka Özel Formatı) nasıl oluşturulmakta ve bankaya iletilmektedir?",
              answerType: "single_choice",
              criticality: "critical",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "anlasmali_bankalarin_ozel_txt_excel_formatinda_sistemden_tek_tikla_sifreli_odeme_dosyasi_uretilir",
                    label: "Anlaşmalı bankaların özel TXT/Excel formatında sistemden tek tıkla şifreli maaş ödeme dosyası üretilir",
                    isOther: false,
                    note: "Garanti ve İş Bankası maaş formatları kullanılmaktadır.",
                  },
                ],
                summaryText: "• Anlaşmalı bankaların özel TXT/Excel formatında sistemden tek tıkla şifreli maaş ödeme dosyası üretilir",
              },
              findings: [
                {
                  id: "f_pay_01",
                  title: "Banka Maaş Dosyasının Excel'den Manuel Kopyalanması Nedeniyle Hatalı IBAN ve Tutar Riski",
                  description: "Bordro kapandıktan sonra net tutarlar banka Excel şablonuna manuel kopyalandığı için tutar uyuşmazlığı ve transfer gecikmeleri yaşanmaktadır.",
                  priority: "critical",
                  status: "open",
                  questionId: "PAY-043",
                  createdAt: "2026-08-20",
                },
              ],
              requirements: [
                {
                  id: "req_pay_01",
                  title: "Otomatik Şifreli Banka Maaş Ödeme Dosyası Üretimi ve IBAN Doğrulama Motoru",
                  description: "Sistem onaylanan bordrodan bankanın resmi TXT/Excel formatında kuruşu kuruşuna doğrulanmış ve IBAN kontrolü yapılmış ödeme dosyasını tek tıkla üretmelidir.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "PAY-043",
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
          id: "f_pay_01",
          title: "Banka Maaş Dosyasının Excel'den Manuel Kopyalanması Nedeniyle Hatalı IBAN ve Tutar Riski",
          description: "Bordro kapandıktan sonra net tutarlar banka Excel şablonuna manuel kopyalandığı için tutar uyuşmazlığı ve transfer gecikmeleri yaşanmaktadır.",
          priority: "critical",
          status: "open",
          questionId: "PAY-043",
          createdAt: "2026-08-20",
        },
      ],
      requirements: [
        {
          id: "req_pay_01",
          title: "Otomatik Şifreli Banka Maaş Ödeme Dosyası Üretimi ve IBAN Doğrulama Motoru",
          description: "Sistem onaylanan bordrodan bankanın resmi TXT/Excel formatında kuruşu kuruşuna doğrulanmış ve IBAN kontrolü yapılmış ödeme dosyasını tek tıkla üretmelidir.",
          priority: "critical",
          status: "confirmed",
          questionId: "PAY-043",
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
    answeredQuestions: 26,
    totalQuestions: 26,
    openFollowupCount: 0,
    revisitCount: 0,
    criticalFollowupCount: 0,
  },
};

// DOCX Testi
const docxBuf = await buildDocxBuffer(mockPayReportModel);
assert(docxBuf.length > 5000, `DOCX üretimi başarılı (${docxBuf.length} byte)`);

// PDF Testi
const pdfBuf = await buildPdfBuffer(mockPayReportModel);
assert(pdfBuf.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuf.length} byte)`);

const parser = new PDFParse({ data: pdfBuf });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");

assert(pdfText.includes("Bordro ve Maaş"), "PDF çıktısında 'Bordro ve Maaş' başlığı mevcut");
assert(pdfText.includes("Ege Metal ve Döküm Sanayi A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Otomatik Şifreli Banka Maaş Ödeme Dosyası Üretimi ve IBAN Doğrulama Motoru"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockPayReportModel.metadata.packVersions.PAYROLL === "tr.payroll.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("PAYROLL");
assert(mappedPackId === "tr.payroll.core", 'getPackIdForFunction("PAYROLL") -> tr.payroll.core');

// ─── SONUÇ ───────────────────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-30 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
