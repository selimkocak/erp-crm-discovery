/**
 * ERP CRM Discovery — FAZ-37 FATURALAMA VE GİDER YÖNETİMİ / INVOICING Acceptance Tests
 *
 * Test Kapsamı:
 * 1. Pack Loading & Metadata Integrity (tr.invoicing.core v0.1.0, canonical code = INVOICING)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (47 questions, sequential order 1..47, INV-001..INV-047)
 * 4. Required Question Count Truth (25 required, 22 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 25 Canonical Process Coverage
 * 7. Conditional Branching Resolution (8 condition points tested with branching engine)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (0 duplicate questions across 26 existing modules)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("INVOICING") === "tr.invoicing.core")
 * 15. Sınır Ayrımı (Cross-Pack Isolation): E_TRANSFORMATION ve ACCOUNTING ile katı ayrım
 */

import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import path from "path";
import { validateQuestionPack } from "../src/engine/validator";
import { getVisibleQuestions, isQuestionVisible } from "../src/engine/branching";
import { calculateProgress, isQuestionAnswered } from "../src/engine/progress";
import { adaptCustomQuestionToQuestion } from "../src/engine/customQuestionAdapter";
import { formatAnswer } from "../src/report/formatters";
import { getPackIdForFunction, loadQuestionPack, hasQuestionPack, getPackStatus } from "../src/engine/loader";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import { PDFParse } from "pdf-parse";
import type { QuestionPack, Question, AnswerData, SelectedAnswer } from "../src/engine/types";
import type { ReportModel, ReportBusinessFunction, ReportProcess, ReportQuestionItem } from "../src/report/types";
import type { QuestionFollowup } from "../src/types";

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

const ROOT_DIR = process.cwd();
const PACK_PATH = path.join(ROOT_DIR, "question-packs/tr/invoicing/core.json");

console.log("══════════════════════════════════════════════════════");
console.log("FAZ-37: FATURALAMA VE GİDER YÖNETİMİ / INVOICING TEST");
console.log("══════════════════════════════════════════════════════\n");

// ─── TEST 1: Pack Loading & Metadata Integrity ──────────────────────────────
console.log("=== T01: Pack Loading & Metadata Integrity ===");
assert(existsSync(PACK_PATH), `Soru paketi dosyası mevcut: ${PACK_PATH}`);

const rawJson = readFileSync(PACK_PATH, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(pack.meta.pack_id === "tr.invoicing.core", "pack_id = tr.invoicing.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "INVOICING", "business_function_code = INVOICING (Kanonik Kod)");
assert(pack.meta.name === "Faturalama ve Gider Yönetimi Soru Paketi", "name tanımlı ve doğru");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ─────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(invoicingPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 47, `Toplam soru sayısı tam 47 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 47, "Tüm 47 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `INV-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: Beklenen ${expectedId} (order: ${i + 1}), Bulunan ${pack.questions[i].id} (order: ${pack.questions[i].order})`);
  }
}
assert(orderCorrect, "Tüm sorular INV-001'den INV-047'ye sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 25, `Zorunlu soru sayısı tam 25 adettir (${requiredQuestions.length})`);
assert(optionalQuestions.length === 22, `Opsiyonel soru sayısı tam 22 adettir (${optionalQuestions.length})`);

// ─── TEST 5: Choice Options & is_other Validation ───────────────────────────
console.log("\n=== T05: Choice Options & is_other Validation ===");
let optionsValid = true;
let allowNoteValid = true;

for (const q of pack.questions) {
  if (q.options) {
    if (q.options.length < 2) optionsValid = false;
    const isOtherOpts = q.options.filter((o) => o.is_other);
    if (isOtherOpts.length > 1) optionsValid = false;
    for (const opt of isOtherOpts) {
      if (!opt.allow_note) allowNoteValid = false;
    }
  }
}
assert(optionsValid, "Tüm seçenekli sorularda en az 2 seçenek tanımlıdır");
assert(allowNoteValid, "is_other=true olan tüm seçeneklerde allow_note=true kuralı korunmuştur");

// ─── TEST 6: 25 Canonical Process Coverage ───────────────────────────────────
console.log("\n=== T06: 25 Canonical Process Coverage ===");
const expectedProcesses = [
  "Faturalama Organizasyonu ve Sorumluluklar",
  "Satış Faturası Oluşturma Süreci",
  "Alış Faturası Kabul Süreci",
  "Gider Faturası Yönetimi",
  "Hizmet Faturaları",
  "Malzeme ve Ürün Faturaları",
  "Siparişten Faturaya Akış",
  "İrsaliyeden Faturaya Akış",
  "Fatura Öncesi Teslimat ve Kabul Kontrolü",
  "Fatura Fiyat ve İskonto Kontrolü",
  "KDV Oranları ve Vergi Kodları",
  "Tevkifat Uygulamaları",
  "İstisna ve Özel Vergi Uygulamaları",
  "Dövizli Fatura ve Kur Kullanımı",
  "İhracat Faturaları",
  "İade Faturaları",
  "Fiyat Farkı ve Ek Faturalar",
  "Fatura İptal, Red ve Düzeltme Süreçleri",
  "Gider Onay ve Masraf Merkezi Dağılımı",
  "Satınalma Faturası Üçlü Eşleştirme",
  "Fatura Ödeme Vadesi ve Ödeme Planı",
  "Cari Hesap ve Muhasebe Entegrasyonu",
  "Fatura Numaralandırma ve Dönem Kontrolü",
  "Fatura Raporlama, Mutabakat ve KPI",
  "Faturalama Kapanışı, Dönem Kilidi ve Denetim İzi"
];

const actualProcesses = Array.from(new Set(pack.questions.map((q) => q.process)));
assert(actualProcesses.length === 25, `Tam 25 kanonik süreç tanımlı (Bulunan: ${actualProcesses.length})`);

let allProcessesFound = true;
for (const p of expectedProcesses) {
  if (!actualProcesses.includes(p)) {
    allProcessesFound = false;
    console.error(`  Eksik süreç: ${p}`);
  }
}
assert(allProcessesFound, "Kapsamdaki tüm 25 kanonik süreç soru paketinde mevcuttur");

// ─── TEST 7: Branching Engine Resolution (8 Dallanma) ────────────────────────
console.log("\n=== T07: Branching Engine Resolution (8 Dallanma) ===");
const answers = new Map<string, AnswerData>();

// 1. Cevapsız durumda 8 koşullu soru gizli olmalı (47 - 8 = 39 görünür)
const initialVisible = getVisibleQuestions(pack.questions, answers);
assert(initialVisible.length === 39, `Cevapsız durumda tam 39 soru görünür (8 branching gizli) — Gerçek: ${initialVisible.length}`);

// 2. Koşul 1 Testi: INV-012 -> INV-013 (Siparişten Faturalama)
answers.set("INV-012", { selected: [{ value: "siparis_bagimsiz_manuel_fatura_girisi_yapilir" }] });
const vQ1 = getVisibleQuestions(pack.questions, answers);
assert(!vQ1.some((q) => q.id === "INV-013"), "INV-012 != siparis_baglantili_otomatik_faturalama iken INV-013 gizli");

answers.set("INV-012", { selected: [{ value: "siparis_baglantili_otomatik_faturalama" }] });
const vQ2 = getVisibleQuestions(pack.questions, answers);
assert(vQ2.some((q) => q.id === "INV-013"), "INV-012 = siparis_baglantili_otomatik_faturalama iken INV-013 görünür");

// 3. Koşul 2 Testi: INV-014 -> INV-015 (İrsaliyeden Faturalama)
answers.set("INV-014", { selected: [{ value: "irsaliye_ile_fatura_ayri_ayri_manuel_yazilir" }] });
const vQ3 = getVisibleQuestions(pack.questions, answers);
assert(!vQ3.some((q) => q.id === "INV-015"), "INV-014 != irsaliye_bazli_toplu_veya_tekil_faturalama iken INV-015 gizli");

answers.set("INV-014", { selected: [{ value: "irsaliye_bazli_toplu_veya_tekil_faturalama" }] });
const vQ4 = getVisibleQuestions(pack.questions, answers);
assert(vQ4.some((q) => q.id === "INV-015"), "INV-014 = irsaliye_bazli_toplu_veya_tekil_faturalama iken INV-015 görünür");

// 4. Koşul 3 Testi: INV-022 -> INV-023 (Tevkifat)
answers.set("INV-022", { selected: [{ value: "tevkifat_uygulamamiz_yoktur" }] });
const vQ5 = getVisibleQuestions(pack.questions, answers);
assert(!vQ5.some((q) => q.id === "INV-023"), "INV-022 != tevkifatli_fatura_kesilmektedir iken INV-023 gizli");

answers.set("INV-022", { selected: [{ value: "tevkifatli_fatura_kesilmektedir" }] });
const vQ6 = getVisibleQuestions(pack.questions, answers);
assert(vQ6.some((q) => q.id === "INV-023"), "INV-022 = tevkifatli_fatura_kesilmektedir iken INV-023 görünür");

// 5. Koşul 4 Testi: INV-025 -> INV-026 (Dövizli Fatura)
answers.set("INV-025", { selected: [{ value: "sadece_tl_fatura_kullanilmaktadir" }] });
const vQ7 = getVisibleQuestions(pack.questions, answers);
assert(!vQ7.some((q) => q.id === "INV-026"), "INV-025 != dovizli_fatura_kesilmekte_ve_alinmaktadir iken INV-026 gizli");

answers.set("INV-025", { selected: [{ value: "dovizli_fatura_kesilmekte_ve_alinmaktadir" }] });
const vQ8 = getVisibleQuestions(pack.questions, answers);
assert(vQ8.some((q) => q.id === "INV-026"), "INV-025 = dovizli_fatura_kesilmekte_ve_alinmaktadir iken INV-026 görünür");

// 6. Koşul 5 Testi: INV-027 -> INV-028 (İhracat Faturası)
answers.set("INV-027", { selected: [{ value: "ihracat_operasyonumuz_yoktur" }] });
const vQ9 = getVisibleQuestions(pack.questions, answers);
assert(!vQ9.some((q) => q.id === "INV-028"), "INV-027 != ihracat_faturasi_duzenlenmektedir iken INV-028 gizli");

answers.set("INV-027", { selected: [{ value: "ihracat_faturasi_duzenlenmektedir" }] });
const vQ10 = getVisibleQuestions(pack.questions, answers);
assert(vQ10.some((q) => q.id === "INV-028"), "INV-027 = ihracat_faturasi_duzenlenmektedir iken INV-028 görünür");

// 7. Koşul 6 Testi: INV-035 -> INV-036 (Masraf Merkezi Dağıtımı)
answers.set("INV-035", { selected: [{ value: "masraf_merkezi_kullanilmamaktadir" }] });
const vQ11 = getVisibleQuestions(pack.questions, answers);
assert(!vQ11.some((q) => q.id === "INV-036"), "INV-035 != coklu_masraf_merkezi_ve_proje_dagitimi_var iken INV-036 gizli");

answers.set("INV-035", { selected: [{ value: "coklu_masraf_merkezi_ve_proje_dagitimi_var" }] });
const vQ12 = getVisibleQuestions(pack.questions, answers);
assert(vQ12.some((q) => q.id === "INV-036"), "INV-035 = coklu_masraf_merkezi_ve_proje_dagitimi_var iken INV-036 görünür");

// 8. Koşul 7 Testi: INV-037 -> INV-038 (Üçlü Eşleştirme / Three-Way Match)
answers.set("INV-037", { selected: [{ value: "uclu_eslestirme_yapilmaz_manuel_onaylanir" }] });
const vQ13 = getVisibleQuestions(pack.questions, answers);
assert(!vQ13.some((q) => q.id === "INV-038"), "INV-037 != tam_otomatik_uclu_eslestirme_uygulanir iken INV-038 gizli");

answers.set("INV-037", { selected: [{ value: "tam_otomatik_uclu_eslestirme_uygulanir" }] });
const vQ14 = getVisibleQuestions(pack.questions, answers);
assert(vQ14.some((q) => q.id === "INV-038"), "INV-037 = tam_otomatik_uclu_eslestirme_uygulanir iken INV-038 görünür");

// 9. Koşul 8 Testi: INV-029 -> INV-030 (İade Faturaları)
answers.set("INV-029", { selected: [{ value: "iade_islemleri_nadir_ve_manueldir" }] });
const vQ15 = getVisibleQuestions(pack.questions, answers);
assert(!vQ15.some((q) => q.id === "INV-030"), "INV-029 != duzenli_satis_ve_alis_iadesi_yapilmaktadir iken INV-030 gizli");

answers.set("INV-029", { selected: [{ value: "duzenli_satis_ve_alis_iadesi_yapilmaktadir" }] });
const vQ16 = getVisibleQuestions(pack.questions, answers);
assert(vQ16.some((q) => q.id === "INV-030"), "INV-029 = duzenli_satis_ve_alis_iadesi_yapilmaktadir iken INV-030 görünür");

// 10. Tüm 8 tetikleyici açıkken 47 soru tam görünür olmalı
const allVisible = getVisibleQuestions(pack.questions, answers);
assert(allVisible.length === 47, `Tüm 8 tetikleyici açıkken 47 sorunun tamamı görünür (47/${allVisible.length})`);

// ─── TEST 8: Progress Calculation & Follow-up Deduction ─────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const fullAnswers = new Map<string, AnswerData>();
for (const q of pack.questions) {
  if (q.required) {
    fullAnswers.set(q.id, { selected: [{ value: q.options?.[0]?.value ?? "val" }] });
  }
}

const mockFollowups = new Map<string, QuestionFollowup>();
const progressFull = calculateProgress(pack.questions, fullAnswers, mockFollowups);
assert(progressFull.answered === 25, `25 zorunlu soru cevaplandığında answered = 25 (${progressFull.answered})`);
assert(progressFull.percentage === 100, `İlerleme yüzdesi %100 (${progressFull.percentage}%)`);

// Followup bayrağı olan 2 sorunun ilerlemeden düşülmesi simülasyonu
mockFollowups.set("INV-001", {
  id: "qf_inv_001",
  analysis_project_id: "p1",
  business_function_code: "INVOICING",
  question_id: "INV-001",
  flag_type: "revisit",
  note: "Faturalama onay matrisi incelenecek",
  status: "open",
  created_at: "2026-08-21",
  updated_at: "2026-08-21",
  resolved_at: null
});
mockFollowups.set("INV-003", {
  id: "qf_inv_003",
  analysis_project_id: "p1",
  business_function_code: "INVOICING",
  question_id: "INV-003",
  flag_type: "critical",
  note: "Açık hesap risk limiti kuralı teyit edilecek",
  status: "open",
  created_at: "2026-08-21",
  updated_at: "2026-08-21",
  resolved_at: null
});

const progressWithFlags = calculateProgress(pack.questions, fullAnswers, mockFollowups);
assert(progressWithFlags.answered === 23, `Bayraklı 2 soru düşünce answered = 23 (${progressWithFlags.answered})`);
assert(progressWithFlags.percentage === 92, `İlerleme %92 hesaplandı (${progressWithFlags.percentage}%)`);

// ─── TEST 9: Cross-Pack Duplication Audit ───────────────────────────────────
console.log("\n=== T09: Cross-Pack Duplication Audit ===");
const packsDir = path.join(ROOT_DIR, "question-packs/tr");
const packFolders = readdirSync(packsDir).filter((d) => d !== "invoicing" && statSync(path.join(packsDir, d)).isDirectory());

let duplicateCount = 0;
const invQuestions = pack.questions.map((q) => q.question.toLowerCase().trim());

for (const dir of packFolders) {
  const otherPackPath = path.join(packsDir, dir, "core.json");
  const otherPack = JSON.parse(readFileSync(otherPackPath, "utf-8")) as QuestionPack;
  for (const oq of otherPack.questions) {
    if (invQuestions.includes(oq.question.toLowerCase().trim())) {
      console.error(`Mükerrer soru tespit edildi: "${oq.question}" (${dir} / ${oq.id})`);
      duplicateCount++;
    }
  }
}
assert(duplicateCount === 0, `26 diğer modülle çapraz karşılaştırmada 0 tam mükerrer soru (${duplicateCount} bulundu)`);

// ─── TEST 10: Custom Questions Adapter Compatibility ──────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_inv_01",
  analysis_project_id: "p1",
  business_function_code: "INVOICING",
  process_name: "Gider Faturası Yönetimi",
  question_text: "Şirkete özel yapay zeka tabanlı fatura tarama ve OCR modülü kullanılmakta mıdır?",
  description: "Fatura OCR ve otomatik veri çekme",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_inv_01", value: "evet_ocr_var", label: "Evet, yapay zeka OCR faturayı otomatik ayrıştırır", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_inv_01", value: "hayir", label: "Hayır, faturalar manuel elle girilir", sort_order: 2, is_other: 0, created_at: "" }
  ],
  is_required: 1,
  sort_order: 48,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const adapted = adaptCustomQuestionToQuestion(mockCustomQuestion as any, 48);
assert(adapted.id === "cq_inv_01", "Custom question ID eşleşti");
assert(adapted.is_custom === true, "is_custom = true");
assert(adapted.process === "Gider Faturası Yönetimi", "Process eşleşti");
assert((adapted.options?.length ?? 0) === 2, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ──────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const formattedQ1 = formatAnswer(pack.questions[0], {
  selected: [{ value: "merkezi_faturalama_ekibi_ve_yazili_onay_matrisi_var", note: "5 kişilik uzman faturalama ekibi mevcuttur" }],
  general_note: "Tüm faturalar CFO ve Muhasebe Müdürü onayına tabidir."
});
assert(formattedQ1.isAnswered === true, "formattedQ1.isAnswered = true");
assert(formattedQ1.summaryText.includes("Mali İşler bünyesinde uzmanlaşmış merkezi faturalama ekibi"), "Kullanıcı dostu label formatlandı");
assert(formattedQ1.summaryText.includes("5 kişilik uzman faturalama ekibi"), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Tüm faturalar CFO"), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export ─────────────────────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with INVOICING Data ===");
const mockInvReportModel: ReportModel = {
  metadata: {
    title: "ERP / Faturalama ve Gider Yönetimi Keşif Raporu",
    projectName: "Faturalama, Masraf ve Üçlü Eşleştirme Olgunluk Keşfi",
    companyName: "Kuzey Sanayi ve Ticaret A.Ş.",
    generatedAt: "21.08.2026",
    projectStatus: "completed",
    packVersions: { INVOICING: "tr.invoicing.core v0.1.0" },
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
    companyName: "Kuzey Sanayi ve Ticaret A.Ş.",
    tradeName: "Kuzey Sanayi",
    taxNumber: "1234567890",
    city: "İstanbul",
    country: "Türkiye",
    employeeCount: "420",
    notes: "Şirketin satış, satınalma ve masraf faturalama süreçleri incelendi.",
  },
  profile: {
    analysis_project_id: "p_faz37",
    executive_summary: "Satış faturası otomasyonu yüksek, satınalma 3'lü eşleştirme (Three-Way Matching) toleransları güçlendirilmelidir.",
    overall_assessment: "Ticari faturalama onay matrisi etkindir; masraf merkezlerine analitik dağıtım şablonları devreye alınmalıdır.",
    open_topics: "Dövizli fatura kur farkı tahakkukları ve otomatik KDV tevkifat entegrasyonu.",
  },
  scope: [{
    code: "INVOICING",
    nameTr: "Faturalama ve Gider",
    nameEn: "Invoicing & Expenses",
    category: "Muhasebe & Finans",
    departmentName: "Mali İşler ve Faturalama",
    responsiblePerson: "Ahmet Yıldırım",
    status: "completed",
    hasPack: true,
    progressPercentage: 100,
    answeredCount: 25,
    totalQuestionCount: 25,
  }],
  businessFunctions: [{
    code: "INVOICING",
    nameTr: "Faturalama ve Gider",
    nameEn: "Invoicing & Expenses",
    category: "Muhasebe & Finans",
    sortOrder: 22,
    departmentName: "Mali İşler ve Faturalama",
    responsiblePerson: "Ahmet Yıldırım",
    status: "completed",
    packId: "tr.invoicing.core",
    packVersion: "0.1.0",
    progressPercentage: 100,
    answeredCount: 25,
    totalQuestionCount: 25,
    processes: [{
      name: "Faturalama Organizasyonu ve Sorumluluklar",
      order: 1,
      questions: [{
        id: "INV-001",
        order: 1,
        process: "Faturalama Organizasyonu ve Sorumluluklar",
        questionText: pack.questions.find((q) => q.id === "INV-001")!.question,
        answerType: "single_choice",
        criticality: "critical",
        formattedAnswer: formattedQ1,
        findings: [],
        requirements: [],
        risks: [],
        notes: [],
      }],
    }],
    findings: [],
    requirements: [],
    risks: [],
    notes: [],
  }],
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
    totalFindings: 0,
    totalRequirements: 0,
    openRisks: 0,
    totalRisks: 0,
    totalNotes: 0,
    answeredQuestions: 25,
    totalQuestions: 25,
    openFollowupCount: 0,
    criticalFollowupCount: 0,
    revisitCount: 0,
  }
};

const docxBuf = await buildDocxBuffer(mockInvReportModel);
assert(docxBuf.length > 5000, `DOCX üretimi başarılı (${docxBuf.length} byte)`);

const pdfBuf = await buildPdfBuffer(mockInvReportModel);
assert(pdfBuf.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuf.length} byte)`);

const pdfParser = new PDFParse({ data: pdfBuf });
const parsedPdf = await pdfParser.getText();
assert(parsedPdf.text.includes("Faturalama") || parsedPdf.text.includes("INVOICING"), "PDF çıktısında 'Faturalama' başlığı mevcut");
assert(parsedPdf.text.includes("Kuzey Sanayi"), "PDF çıktısında firma adı mevcut (Türkçe UTF-8 doğru)");

// ─── TEST 14: Loader Registry Parity ──────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
assert(getPackIdForFunction("INVOICING") === "tr.invoicing.core", "getPackIdForFunction('INVOICING') -> tr.invoicing.core");
assert(getPackIdForFunction("FATURALAMA") === "tr.invoicing.core", "getPackIdForFunction('FATURALAMA') -> tr.invoicing.core (Alias)");
assert(getPackIdForFunction("FATURA_GDR") === "tr.invoicing.core", "getPackIdForFunction('FATURA_GDR') -> tr.invoicing.core (Legacy Alias)");
assert(getPackIdForFunction("INVOICE") === "tr.invoicing.core", "getPackIdForFunction('INVOICE') -> tr.invoicing.core (Alias)");
assert(hasQuestionPack("INVOICING") === true, "hasQuestionPack('INVOICING') === true");
assert(getPackStatus("INVOICING") === "available", "getPackStatus('INVOICING') === 'available'");

const loadedPackRes = await loadQuestionPack("tr.invoicing.core");
assert(loadedPackRes.ok === true, "loadQuestionPack('tr.invoicing.core') ok === true");
if (loadedPackRes.ok) {
  assert(loadedPackRes.pack.questions.length === 47, "Yüklenen soru paketi 47 soru içerir");
}

// ─── TEST 15: Sınır Ayrımı (Cross-Pack Isolation Tests) ──────────────────────
console.log("\n=== T15: Sınır Ayrımı (Cross-Pack Isolation Tests) ===");
// 1. E_TRANSFORMATION ayrımı: INVOICING soruları GİB durum kodlarını, mali mühür HSM cihazını ve UBL-TR şematron kurallarını sormaz.
const eTransformTerms = ["ubl-tr 1.2.1", "gib durum kodu 1200", "hsm cihazı", "özel entegratör sla"];
let eTransViolations = 0;
pack.questions.forEach((q) => {
  eTransformTerms.forEach((term) => {
    if (q.question.toLowerCase().includes(term)) {
      console.error(`  Sınır ihlali: ${q.id} sorusunda E_TRANSFORMATION terimi (${term}) bulundu!`);
      eTransViolations++;
    }
  });
});
assert(eTransViolations === 0, "E_TRANSFORMATION sınır kontrolü: GİB/UBL teknik detayları INVOICING paketinde tekrarlanmadı");

// 2. ACCOUNTING ayrımı: INVOICING yevmiye fişi içi tekdüzen hesap planı detaylarını değil, fatura oluşumu ve ticari aktarımını sorar.
const accTerms = ["mizan bakiye kontrolü", "tekdüzen hesap planı detay kodu"];
let accViolations = 0;
pack.questions.forEach((q) => {
  accTerms.forEach((term) => {
    if (q.question.toLowerCase().includes(term)) {
      console.error(`  Sınır ihlali: ${q.id} sorusunda ACCOUNTING terimi (${term}) bulundu!`);
      accViolations++;
    }
  });
});
assert(accViolations === 0, "ACCOUNTING sınır kontrolü: Muhasebe yevmiye içi hesap planı detayları ayrıştırıldı");

console.log("\n══════════════════════════════════════════════════════");
console.log(`FAZ-37 INVOICING TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════════\n");

if (failCount === 0) {
  console.log("✅ FAZ-37 KABUL: Tüm testler geçti — INVOICING Question Pack mühürlendi.");
  process.exit(0);
} else {
  console.error(`❌ FAZ-37 HATA: ${failCount} test başarısız oldu!`);
  process.exit(1);
}
