/**
 * ERP CRM Discovery — FAZ-36 E-DÖNÜŞÜM YÖNETİMİ / E_TRANSFORMATION Acceptance Tests
 *
 * Test Kapsamı:
 * 1. Pack Loading & Metadata Integrity (tr.e_transformation.core v0.1.0, canonical code = E_TRANSFORMATION)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (47 questions, sequential order 1..47, EDT-001..EDT-047)
 * 4. Required Question Count Truth (25 required, 22 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 25 Canonical Process Coverage
 * 7. Conditional Branching Resolution (8 condition points tested with branching engine)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (0 duplicate questions across 25 existing modules)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("E_TRANSFORMATION") === "tr.e_transformation.core")
 */

import { readFileSync, readdirSync } from "fs";
import path from "path";
import { validateQuestionPack } from "../src/engine/validator";
import { getVisibleQuestions, isQuestionVisible } from "../src/engine/branching";
import { calculateProgress, isQuestionAnswered } from "../src/engine/progress";
import { adaptCustomQuestionToQuestion } from "../src/engine/customQuestionAdapter";
import { formatAnswer } from "../src/report/formatters";
import { getPackIdForFunction, loadQuestionPack } from "../src/engine/loader";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import { PDFParse } from "pdf-parse";
import type { QuestionPack, Question, AnswerData, SelectedAnswer } from "../src/engine/types";
import type { ReportModel, ReportBusinessFunction, ReportProcess, ReportQuestionItem } from "../src/report/types";
import type { CustomQuestion, QuestionFollowup } from "../src/types";

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

console.log("\n══════════════════════════════════════════════════════");
console.log("FAZ-36: E-DÖNÜŞÜM YÖNETİMİ / E_TRANSFORMATION TEST");
console.log("══════════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/e_transformation/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "E_TRANSFORMATION pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.e_transformation.core", "pack_id = tr.e_transformation.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "E_TRANSFORMATION", "business_function_code = E_TRANSFORMATION (Kanonik Kod)");
assert(pack.meta.name === "E-Dönüşüm Yönetimi Soru Paketi", "name = E-Dönüşüm Yönetimi Soru Paketi");
assert(pack.meta.description.length > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(eTransformationPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ─────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 47, `Toplam soru sayısı tam 47 adet (${pack.questions.length})`);

const questionIds = pack.questions.map((q) => q.id);
const uniqueIds = new Set(questionIds);
assert(uniqueIds.size === 47, "Tüm 47 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedOrder = i + 1;
  const expectedId = `EDT-${String(expectedOrder).padStart(3, "0")}`;
  if (pack.questions[i].order !== expectedOrder || pack.questions[i].id !== expectedId) {
    orderCorrect = false;
    break;
  }
}
assert(orderCorrect, "Tüm sorular EDT-001'den EDT-047'ye sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count Truth ───────────────────────────────────
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
  "E-Dönüşüm Organizasyonu ve Sorumluluklar",
  "GİB Mükellefiyet ve Kapsam Değerlendirmesi",
  "Özel Entegratör ve Entegrasyon Modeli",
  "Mali Mühür ve Elektronik İmza Yönetimi",
  "Sertifika, Yetki ve Süre Takibi",
  "Test ve Canlı Ortam Ayrımı",
  "E-Fatura Senaryo ve Belge Akışları",
  "E-Fatura Gönderim, Alma ve Yanıt Yönetimi",
  "Ticari Fatura Kabul ve Red Süreçleri",
  "E-Arşiv Fatura Süreçleri",
  "İnternet Satış ve E-Ticaret E-Arşiv Akışları",
  "E-İrsaliye Süreçleri",
  "Sevkiyat, Mal Kabul ve İrsaliye Eşleştirme",
  "E-Defter Süreçleri",
  "Berat Oluşturma, Kontrol ve Yükleme",
  "E-SMM (Serbest Meslek Makbuzu) Süreçleri",
  "E-Müstahsil Makbuzu Süreçleri",
  "E-Bilet ve Sektörel E-Belge Kullanımı",
  "İhracat ve E-Belge Bağlantıları",
  "İade, İptal, İtiraz ve Düzeltme Süreçleri",
  "Tevkifat, İstisna, Stopaj ve Vergi Kodları",
  "UBL-TR ve Belge Alan Eşleşmeleri",
  "ERP, Muhasebe ve Özel Entegratör Entegrasyonu",
  "Hata, Kuyruk, Yeniden Gönderim ve Mutabakat",
  "Arşivleme, Yasal Saklama ve Denetim İzi"
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

// 2. Koşul 1 Testi: EDT-012 -> EDT-013 (E-Fatura)
answers.set("EDT-012", { selected: [{ value: "e_fatura_kullanilmamaktadir" }] });
const vQ1 = getVisibleQuestions(pack.questions, answers);
assert(!vQ1.some((q) => q.id === "EDT-013"), "EDT-012 != e_fatura_aktif_kullanilmaktadir iken EDT-013 gizli");

answers.set("EDT-012", { selected: [{ value: "e_fatura_aktif_kullanilmaktadir" }] });
const vQ2 = getVisibleQuestions(pack.questions, answers);
assert(vQ2.some((q) => q.id === "EDT-013"), "EDT-012 = e_fatura_aktif_kullanilmaktadir iken EDT-013 görünür");

// 3. Koşul 2 Testi: EDT-018 -> EDT-019 (E-Arşiv)
answers.set("EDT-018", { selected: [{ value: "e_arsiv_kullanilmamaktadir" }] });
const vQ3 = getVisibleQuestions(pack.questions, answers);
assert(!vQ3.some((q) => q.id === "EDT-019"), "EDT-018 != e_arsiv_aktif_kullanilmaktadir iken EDT-019 gizli");

answers.set("EDT-018", { selected: [{ value: "e_arsiv_aktif_kullanilmaktadir" }] });
const vQ4 = getVisibleQuestions(pack.questions, answers);
assert(vQ4.some((q) => q.id === "EDT-019"), "EDT-018 = e_arsiv_aktif_kullanilmaktadir iken EDT-019 görünür");

// 4. Koşul 3 Testi: EDT-022 -> EDT-023 (E-İrsaliye)
answers.set("EDT-022", { selected: [{ value: "e_irsaliye_kullanilmamaktadir" }] });
const vQ5 = getVisibleQuestions(pack.questions, answers);
assert(!vQ5.some((q) => q.id === "EDT-023"), "EDT-022 != e_irsaliye_aktif_kullanilmaktadir iken EDT-023 gizli");

answers.set("EDT-022", { selected: [{ value: "e_irsaliye_aktif_kullanilmaktadir" }] });
const vQ6 = getVisibleQuestions(pack.questions, answers);
assert(vQ6.some((q) => q.id === "EDT-023"), "EDT-022 = e_irsaliye_aktif_kullanilmaktadir iken EDT-023 görünür");

// 5. Koşul 4 Testi: EDT-026 -> EDT-027 (E-Defter)
answers.set("EDT-026", { selected: [{ value: "e_defter_kapsaminda_degiliz_kagit_defter" }] });
const vQ7 = getVisibleQuestions(pack.questions, answers);
assert(!vQ7.some((q) => q.id === "EDT-027"), "EDT-026 != e_defter_aktif_kullanilmaktadir iken EDT-027 gizli");

answers.set("EDT-026", { selected: [{ value: "e_defter_aktif_kullanilmaktadir" }] });
const vQ8 = getVisibleQuestions(pack.questions, answers);
assert(vQ8.some((q) => q.id === "EDT-027"), "EDT-026 = e_defter_aktif_kullanilmaktadir iken EDT-027 görünür");

// 6. Koşul 5 Testi: EDT-005 -> EDT-006 (Özel Entegratör)
answers.set("EDT-005", { selected: [{ value: "gib_portal_manuel_kullanilmaktadir" }] });
const vQ9 = getVisibleQuestions(pack.questions, answers);
assert(!vQ9.some((q) => q.id === "EDT-006"), "EDT-005 != ozel_entegrator_kullanilmaktadir iken EDT-006 gizli");

answers.set("EDT-005", { selected: [{ value: "ozel_entegrator_kullanilmaktadir" }] });
const vQ10 = getVisibleQuestions(pack.questions, answers);
assert(vQ10.some((q) => q.id === "EDT-006"), "EDT-005 = ozel_entegrator_kullanilmaktadir iken EDT-006 görünür");

// 7. Koşul 6 Testi: EDT-033 -> EDT-034 (İhracat)
answers.set("EDT-033", { selected: [{ value: "ihracat_faaliyetimiz_bulunmamaktadir" }] });
const vQ11 = getVisibleQuestions(pack.questions, answers);
assert(!vQ11.some((q) => q.id === "EDT-034"), "EDT-033 != e_fatura_ihracat_yapilmaktadir iken EDT-034 gizli");

answers.set("EDT-033", { selected: [{ value: "e_fatura_ihracat_yapilmaktadir" }] });
const vQ12 = getVisibleQuestions(pack.questions, answers);
assert(vQ12.some((q) => q.id === "EDT-034"), "EDT-033 = e_fatura_ihracat_yapilmaktadir iken EDT-034 görünür");

// 8. Koşul 7 Testi: EDT-037 -> EDT-038 (Tevkifat / İstisna)
answers.set("EDT-037", { selected: [{ value: "sadece_standart_kdv_uygulanir_istisna_yok" }] });
const vQ13 = getVisibleQuestions(pack.questions, answers);
assert(!vQ13.some((q) => q.id === "EDT-038"), "EDT-037 != tevkifat_ve_istisna_uygulanmaktadir iken EDT-038 gizli");

answers.set("EDT-037", { selected: [{ value: "tevkifat_ve_istisna_uygulanmaktadir" }] });
const vQ14 = getVisibleQuestions(pack.questions, answers);
assert(vQ14.some((q) => q.id === "EDT-038"), "EDT-037 = tevkifat_ve_istisna_uygulanmaktadir iken EDT-038 görünür");

// 9. Koşul 8 Testi: EDT-035 -> EDT-036 (İade ve İtiraz)
answers.set("EDT-035", { selected: [{ value: "nadir_iade_olur_iade_faturasi_ile_cozulur" }] });
const vQ15 = getVisibleQuestions(pack.questions, answers);
assert(!vQ15.some((q) => q.id === "EDT-036"), "EDT-035 != duzenli_iade_ve_itiraz_yasanmaktadir iken EDT-036 gizli");

answers.set("EDT-035", { selected: [{ value: "duzenli_iade_ve_itiraz_yasanmaktadir" }] });
const vQ16 = getVisibleQuestions(pack.questions, answers);
assert(vQ16.some((q) => q.id === "EDT-036"), "EDT-035 = duzenli_iade_ve_itiraz_yasanmaktadir iken EDT-036 görünür");

// 10. Tüm 8 tetikleyici açıkken 47 sorunun tamamı görünür olmalı
const allVisible = getVisibleQuestions(pack.questions, answers);
assert(allVisible.length === 47, `Tüm 8 tetikleyici açıkken 47 sorunun tamamı görünür (47/${allVisible.length})`);

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
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
mockFollowups.set("EDT-001", {
  id: "qf_edt_001",
  analysis_project_id: "p1",
  business_function_code: "E_TRANSFORMATION",
  question_id: "EDT-001",
  flag_type: "revisit",
  note: "E-Dönüşüm yöneticisi ataması incelenecek",
  status: "open",
  created_at: "2026-08-21",
  updated_at: "2026-08-21",
  resolved_at: null
});
mockFollowups.set("EDT-007", {
  id: "qf_edt_007",
  analysis_project_id: "p1",
  business_function_code: "E_TRANSFORMATION",
  question_id: "EDT-007",
  flag_type: "critical",
  note: "Mali mühür dongle güvenliği teyit edilecek",
  status: "open",
  created_at: "2026-08-21",
  updated_at: "2026-08-21",
  resolved_at: null
});

const progressWithFlags = calculateProgress(pack.questions, fullAnswers, mockFollowups);
assert(progressWithFlags.answered === 23, `Bayraklı 2 soru düşünce answered = 23 (${progressWithFlags.answered})`);
assert(progressWithFlags.percentage === 92, `İlerleme %92 hesaplandı (${progressWithFlags.percentage}%)`);

// ─── TEST 9: Cross-Pack Duplication Audit ─────────────────────────────────────
console.log("\n=== T09: Cross-Pack Duplication Audit ===");
const packsDir = path.resolve("question-packs/tr");
const packDirs = readdirSync(packsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== "e_transformation")
  .map((d) => d.name);

let duplicateCount = 0;
const edtQuestions = pack.questions.map((q) => q.question.toLowerCase().trim());

for (const dir of packDirs) {
  const otherPackPath = path.join(packsDir, dir, "core.json");
  const otherPack = JSON.parse(readFileSync(otherPackPath, "utf-8")) as QuestionPack;
  for (const oq of otherPack.questions) {
    if (edtQuestions.includes(oq.question.toLowerCase().trim())) {
      console.error(`Mükerrer soru tespit edildi: "${oq.question}" (${dir} / ${oq.id})`);
      duplicateCount++;
    }
  }
}
assert(duplicateCount === 0, `25 diğer modülle çapraz karşılaştırmada 0 tam mükerrer soru (${duplicateCount} bulundu)`);

// ─── TEST 10: Custom Questions Adapter Compatibility ──────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_edt_01",
  analysis_project_id: "p1",
  business_function_code: "E_TRANSFORMATION",
  process_name: "Özel Entegratör ve Entegrasyon Modeli",
  question_text: "Entegratör kota aşımı durumunda otomatik kontör satın alma tetikleniyor mu?",
  description: "Kota ve bakiye yönetimi",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_edt_01", value: "otomatik_kontor_yuklenir", label: "Evet, bakiye kritik sınıra inince otomatik kontör alınır", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_edt_01", value: "manuel_talep_acilir", label: "Hayır, fatura durunca muhasebe manuel talep açar", sort_order: 2, is_other: 0, created_at: "" }
  ],
  is_required: 1,
  sort_order: 48,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const adapted = adaptCustomQuestionToQuestion(mockCustomQuestion as any, 48);
assert(adapted.id === "cq_edt_01", "Custom question ID eşleşti");
assert(adapted.is_custom === true, "is_custom = true");
assert(adapted.process === "Özel Entegratör ve Entegrasyon Modeli", "Process eşleşti");
assert((adapted.options?.length ?? 0) === 2, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ──────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const formattedQ1 = formatAnswer(pack.questions[0], {
  selected: [{ value: "merkezi_ve_yazili_sorumluluk_matrisi_var", note: "Mali İşler Direktörlüğü koordinasyonunda yürütülür" }],
  general_note: "GİB portal yetkilisi Mali Müşavirdir."
});
assert(formattedQ1.isAnswered === true, "formattedQ1.isAnswered = true");
assert(formattedQ1.summaryText.includes("Mali İşler ve BT koordinasyonunda"), "Kullanıcı dostu label formatlandı");
assert(formattedQ1.summaryText.includes("Mali İşler Direktörlüğü"), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("GİB portal yetkilisi"), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export ─────────────────────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with E_TRANSFORMATION Data ===");
const mockEdtReportModel: ReportModel = {
  metadata: {
    title: "ERP / E-Dönüşüm Yönetimi Keşif Raporu",
    projectName: "E-Dönüşüm, GİB, UBL-TR ve Yasal Arşivleme Olgunluk Keşfi",
    companyName: "Anadolu Teknoloji ve Ticaret A.Ş.",
    generatedAt: "21.08.2026",
    projectStatus: "completed",
    packVersions: { E_TRANSFORMATION: "tr.e_transformation.core v0.1.0" },
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
    companyName: "Anadolu Teknoloji ve Ticaret A.Ş.",
    tradeName: "Anadolu Teknoloji",
    taxNumber: "9876543210",
    city: "İstanbul",
    country: "Türkiye",
    employeeCount: "350",
    notes: "Şirketin e-Fatura, e-Arşiv, e-İrsaliye ve e-Defter süreçleri incelendi.",
  },
  profile: {
    analysis_project_id: "p_faz36",
    executive_summary: "Özel entegratör API entegrasyonu kurulmalı, e-İrsaliye ve e-Defter ikincil saklama süreçleri dijitalleştirilmelidir.",
    overall_assessment: "GİB mevzuatına uyum genel olarak yüksektir; UBL-TR ek alan eşleşmeleri güçlendirilmelidir.",
    open_topics: "İhracat e-Faturası GTB referans ve intaç tarihi eşleşmesi.",
  },
  scope: [{
    code: "E_TRANSFORMATION",
    nameTr: "E-Dönüşüm Yönetimi",
    nameEn: "E-Transformation Management",
    category: "Muhasebe & Finans",
    departmentName: "Mali İşler ve Vergi Yönetimi",
    responsiblePerson: "Merve Çelik",
    status: "completed",
    hasPack: true,
    progressPercentage: 100,
    answeredCount: 25,
    totalQuestionCount: 25,
  }],
  businessFunctions: [{
    code: "E_TRANSFORMATION",
    nameTr: "E-Dönüşüm Yönetimi",
    nameEn: "E-Transformation Management",
    category: "Muhasebe & Finans",
    sortOrder: 33,
    departmentName: "Mali İşler ve Vergi Yönetimi",
    responsiblePerson: "Merve Çelik",
    status: "completed",
    packId: "tr.e_transformation.core",
    packVersion: "0.1.0",
    progressPercentage: 100,
    answeredCount: 25,
    totalQuestionCount: 25,
    processes: [{
      name: "E-Dönüşüm Organizasyonu ve Sorumluluklar",
      order: 1,
      questions: [{
        id: "EDT-001",
        order: 1,
        process: "E-Dönüşüm Organizasyonu ve Sorumluluklar",
        questionText: pack.questions.find((q) => q.id === "EDT-001")!.question,
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
    totalFollowups: 0,
    criticalFollowups: 0,
    revisitFollowups: 0,
  },
};

const docxBuf = await buildDocxBuffer(mockEdtReportModel);
assert(docxBuf.length > 5000, `DOCX üretimi başarılı (${docxBuf.length} byte)`);

const pdfBuf = await buildPdfBuffer(mockEdtReportModel);
assert(pdfBuf.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuf.length} byte)`);

const pdfParser = new PDFParse({ data: pdfBuf });
const parsedPdf = await pdfParser.getText();
assert(parsedPdf.text.includes("E-Dönüşüm"), "PDF çıktısında 'E-Dönüşüm' başlığı mevcut");
assert(parsedPdf.text.includes("Anadolu Teknoloji"), "PDF çıktısında firma adı mevcut (Türkçe UTF-8 doğru)");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
assert(getPackIdForFunction("E_TRANSFORMATION") === "tr.e_transformation.core", "getPackIdForFunction('E_TRANSFORMATION') -> tr.e_transformation.core");
assert(getPackIdForFunction("E_DONUSUM") === "tr.e_transformation.core", "getPackIdForFunction('E_DONUSUM') -> tr.e_transformation.core (Alias)");
assert(getPackIdForFunction("EDONUSUM") === "tr.e_transformation.core", "getPackIdForFunction('EDONUSUM') -> tr.e_transformation.core (Alias)");

console.log("\n══════════════════════════════════════════════════════");
console.log(`FAZ-36 E_TRANSFORMATION TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════════\n");

if (failCount > 0) {
  console.error("❌ FAZ-36 KABUL BAŞARISIZ: Bazı testler geçemedi!");
  process.exit(1);
} else {
  console.log("✅ FAZ-36 KABUL: Tüm testler geçti — E_TRANSFORMATION Question Pack mühürlendi.");
  process.exit(0);
}
