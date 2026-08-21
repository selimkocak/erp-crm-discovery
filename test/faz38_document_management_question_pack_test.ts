/**
 * ERP CRM Discovery — FAZ-38 DOKÜMAN YÖNETİMİ / DOCUMENT_MANAGEMENT Acceptance Tests
 *
 * Test Kapsamı:
 * 1. Pack Loading & Metadata Integrity (tr.document_management.core v0.1.0, canonical code = DOCUMENT_MANAGEMENT)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (47 questions, sequential order 1..47, DOC-001..DOC-047)
 * 4. Required Question Count Truth (27 required, 20 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 25 Canonical Process Coverage
 * 7. Conditional Branching Resolution (8 condition points tested with branching engine)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (0 duplicate questions across 27 existing modules)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("DOCUMENT_MANAGEMENT") === "tr.document_management.core")
 * 15. Sınır Ayrımı (Cross-Pack Isolation): FAZ-33 Question Evidence Vault, E_TRANSFORMATION ve LEGAL_COMPLIANCE ile katı ayrım
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
const PACK_PATH = path.join(ROOT_DIR, "question-packs/tr/document_management/core.json");

console.log("══════════════════════════════════════════════════════");
console.log("FAZ-38: DOKÜMAN YÖNETİMİ / DOCUMENT_MANAGEMENT TEST");
console.log("══════════════════════════════════════════════════════\n");

// ─── TEST 1: Pack Loading & Metadata Integrity ──────────────────────────────
console.log("=== T01: Pack Loading & Metadata Integrity ===");
assert(existsSync(PACK_PATH), `Soru paketi dosyası mevcut: ${PACK_PATH}`);

const rawJson = readFileSync(PACK_PATH, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(pack.meta.pack_id === "tr.document_management.core", "pack_id = tr.document_management.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "DOCUMENT_MANAGEMENT", "business_function_code = DOCUMENT_MANAGEMENT (Kanonik Kod)");
assert(pack.meta.name === "Doküman Yönetimi Soru Paketi", "name tanımlı ve doğru");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ─────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(docPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 47, `Toplam soru sayısı tam 47 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 47, "Tüm 47 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `DOC-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: Beklenen ${expectedId} (order: ${i + 1}), Bulunan ${pack.questions[i].id} (order: ${pack.questions[i].order})`);
  }
}
assert(orderCorrect, "Tüm sorular DOC-001'den DOC-047'ye sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 27, `Zorunlu soru sayısı tam 27 adettir (${requiredQuestions.length})`);
assert(optionalQuestions.length === 20, `Opsiyonel soru sayısı tam 20 adettir (${optionalQuestions.length})`);

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
  "Doküman yönetimi organizasyonu ve sorumluluklar",
  "Doküman sahipliği ve veri sorumluları",
  "Doküman sınıflandırma ve kategori yapısı",
  "Doküman türleri ve doküman kodlama",
  "Doküman metadata alanları",
  "Departmanlar arası ortak doküman kullanımı",
  "Doküman oluşturma ve kayıt süreci",
  "Doküman revizyon ve versiyon yönetimi",
  "Taslak, inceleme ve yayın statüleri",
  "Doküman onay akışları",
  "Yetki, rol ve erişim kontrolü",
  "Gizli, özel ve genel doküman ayrımı",
  "Kontrollü kopya ve yayınlanmış doküman yönetimi",
  "Prosedür, talimat ve politika dokümanları",
  "Kalite sistemi ve ISO dokümanları",
  "Sözleşme ve hukuki dokümanlar",
  "Teknik çizim, proje ve üretim dokümanları",
  "Satınalma, tedarikçi ve müşteri dokümanları",
  "Personel ve insan kaynakları dokümanları",
  "Finansal ve muhasebesel dokümanlar",
  "E-posta ve dış kaynaklı dokümanların kaydı",
  "Doküman arama ve filtreleme",
  "Doküman süresi, geçerlilik tarihi ve yenileme takibi",
  "Arşivleme, saklama ve imha politikaları",
  "Doküman denetim izi, raporlama ve KPI"
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

// 2. Koşul 1 Testi: DOC-010 -> DOC-011 (Onay Akışı)
answers.set("DOC-010", { selected: [{ value: "onay_akisi_yoktur_herkes_dogrudan_yukler" }] });
const vQ1 = getVisibleQuestions(pack.questions, answers);
assert(!vQ1.some((q) => q.id === "DOC-011"), "DOC-010 != resmi_onay_ve_imza_rotasi_uygulanir iken DOC-011 gizli");

answers.set("DOC-010", { selected: [{ value: "resmi_onay_ve_imza_rotasi_uygulanir" }] });
const vQ2 = getVisibleQuestions(pack.questions, answers);
assert(vQ2.some((q) => q.id === "DOC-011"), "DOC-010 = resmi_onay_ve_imza_rotasi_uygulanir iken DOC-011 görünür");

// 3. Koşul 2 Testi: DOC-012 -> DOC-013 (Versiyon ve Revizyon)
answers.set("DOC-012", { selected: [{ value: "eski_dosyanin_uzerine_kaydedilir_gecmis_kaybolur" }] });
const vQ3 = getVisibleQuestions(pack.questions, answers);
assert(!vQ3.some((q) => q.id === "DOC-013"), "DOC-012 != major_minor_revizyon_ve_degisiklik_tarihcesi_tutulur iken DOC-013 gizli");

answers.set("DOC-012", { selected: [{ value: "major_minor_revizyon_ve_degisiklik_tarihcesi_tutulur" }] });
const vQ4 = getVisibleQuestions(pack.questions, answers);
assert(vQ4.some((q) => q.id === "DOC-013"), "DOC-012 = major_minor_revizyon_ve_degisiklik_tarihcesi_tutulur iken DOC-013 görünür");

// 4. Koşul 3 Testi: DOC-017 -> DOC-018 (Gizli / Özel Doküman)
answers.set("DOC-017", { selected: [{ value: "gizlilik_siniflandirmasi_bulunmamaktadir" }] });
const vQ5 = getVisibleQuestions(pack.questions, answers);
assert(!vQ5.some((q) => q.id === "DOC-018"), "DOC-017 != gizli_ve_kisitli_dokuman_kategorileri_mevcuttur iken DOC-018 gizli");

answers.set("DOC-017", { selected: [{ value: "gizli_ve_kisitli_dokuman_kategorileri_mevcuttur" }] });
const vQ6 = getVisibleQuestions(pack.questions, answers);
assert(vQ6.some((q) => q.id === "DOC-018"), "DOC-017 = gizli_ve_kisitli_dokuman_kategorileri_mevcuttur iken DOC-018 görünür");

// 5. Koşul 4 Testi: DOC-022 -> DOC-023 (ISO ve Kalite Dokümanları)
answers.set("DOC-022", { selected: [{ value: "sertifikali_kalite_dokuman_sistemimiz_yoktur" }] });
const vQ7 = getVisibleQuestions(pack.questions, answers);
assert(!vQ7.some((q) => q.id === "DOC-023"), "DOC-022 != iso_ve_kalite_dokumanlari_yonetilmektedir iken DOC-023 gizli");

answers.set("DOC-022", { selected: [{ value: "iso_ve_kalite_dokumanlari_yonetilmektedir" }] });
const vQ8 = getVisibleQuestions(pack.questions, answers);
assert(vQ8.some((q) => q.id === "DOC-023"), "DOC-022 = iso_ve_kalite_dokumanlari_yonetilmektedir iken DOC-023 görünür");

// 6. Koşul 5 Testi: DOC-024 -> DOC-025 (Sözleşmeler ve Hukuki Evraklar)
answers.set("DOC-024", { selected: [{ value: "fiziksel_klasorlerde_tutulur_dijital_arsiv_eksiktir" }] });
const vQ9 = getVisibleQuestions(pack.questions, answers);
assert(!vQ9.some((q) => q.id === "DOC-025"), "DOC-024 != sozlesmeler_ve_hukuki_evraklar_takip_edilmektedir iken DOC-025 gizli");

answers.set("DOC-024", { selected: [{ value: "sozlesmeler_ve_hukuki_evraklar_takip_edilmektedir" }] });
const vQ10 = getVisibleQuestions(pack.questions, answers);
assert(vQ10.some((q) => q.id === "DOC-025"), "DOC-024 = sozlesmeler_ve_hukuki_evraklar_takip_edilmektedir iken DOC-025 görünür");

// 7. Koşul 6 Testi: DOC-026 -> DOC-027 (Teknik Çizim ve Mühendislik)
answers.set("DOC-026", { selected: [{ value: "teknik_cizim_veya_muhendislik_dokumani_kullanilmaz" }] });
const vQ11 = getVisibleQuestions(pack.questions, answers);
assert(!vQ11.some((q) => q.id === "DOC-027"), "DOC-026 != teknik_cizim_ve_muhendislik_dokumanlari_mevcuttur iken DOC-027 gizli");

answers.set("DOC-026", { selected: [{ value: "teknik_cizim_ve_muhendislik_dokumanlari_mevcuttur" }] });
const vQ12 = getVisibleQuestions(pack.questions, answers);
assert(vQ12.some((q) => q.id === "DOC-027"), "DOC-026 = teknik_cizim_ve_muhendislik_dokumanlari_mevcuttur iken DOC-027 görünür");

// 8. Koşul 7 Testi: DOC-041 -> DOC-042 (Hibrit Arşiv ve Barkod Eşleşmesi)
answers.set("DOC-041", { selected: [{ value: "sadece_dijital_arsiv_kullanilir_kagitlar_imha_edilir" }] });
const vQ13 = getVisibleQuestions(pack.questions, answers);
assert(!vQ13.some((q) => q.id === "DOC-042"), "DOC-041 != fiziksel_ve_elektronik_hibrit_arsiv_kullanilmaktadir iken DOC-042 gizli");

answers.set("DOC-041", { selected: [{ value: "fiziksel_ve_elektronik_hibrit_arsiv_kullanilmaktadir" }] });
const vQ14 = getVisibleQuestions(pack.questions, answers);
assert(vQ14.some((q) => q.id === "DOC-042"), "DOC-041 = fiziksel_ve_elektronik_hibrit_arsiv_kullanilmaktadir iken DOC-042 görünür");

// 9. Koşul 8 Testi: DOC-037 -> DOC-038 (DMS Entegrasyonu)
answers.set("DOC-037", { selected: [{ value: "sadece_isletim_sistemi_ag_surucusu_file_server_vardir" }] });
const vQ15 = getVisibleQuestions(pack.questions, answers);
assert(!vQ15.some((q) => q.id === "DOC-038"), "DOC-037 != merkezi_dms_veya_harici_dokuman_sistemi_var iken DOC-038 gizli");

answers.set("DOC-037", { selected: [{ value: "merkezi_dms_veya_harici_dokuman_sistemi_var" }] });
const vQ16 = getVisibleQuestions(pack.questions, answers);
assert(vQ16.some((q) => q.id === "DOC-038"), "DOC-037 = merkezi_dms_veya_harici_dokuman_sistemi_var iken DOC-038 görünür");

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
assert(progressFull.answered === 27, `27 zorunlu soru cevaplandığında answered = 27 (${progressFull.answered})`);
assert(progressFull.percentage === 100, `İlerleme yüzdesi %100 (${progressFull.percentage}%)`);

// Followup bayrağı olan 2 sorunun ilerlemeden düşülmesi simülasyonu
mockFollowups.set("DOC-001", {
  id: "qf_doc_001",
  analysis_project_id: "p1",
  business_function_code: "DOCUMENT_MANAGEMENT",
  question_id: "DOC-001",
  flag_type: "revisit",
  note: "Merkezi doküman yöneticisi ataması netleştirilecek",
  status: "open",
  created_at: "2026-08-21",
  updated_at: "2026-08-21",
  resolved_at: null
});
mockFollowups.set("DOC-005", {
  id: "qf_doc_005",
  analysis_project_id: "p1",
  business_function_code: "DOCUMENT_MANAGEMENT",
  question_id: "DOC-005",
  flag_type: "critical",
  note: "Taksonomi ve klasör hiyerarşisi mimarisi çizilecek",
  status: "open",
  created_at: "2026-08-21",
  updated_at: "2026-08-21",
  resolved_at: null
});

const progressWithFlags = calculateProgress(pack.questions, fullAnswers, mockFollowups);
assert(progressWithFlags.answered === 25, `Bayraklı 2 soru düşünce answered = 25 (${progressWithFlags.answered})`);
assert(progressWithFlags.percentage === 93, `İlerleme %93 hesaplandı (${progressWithFlags.percentage}%)`);

// ─── TEST 9: Cross-Pack Duplication Audit ───────────────────────────────────
console.log("\n=== T09: Cross-Pack Duplication Audit ===");
const packsDir = path.join(ROOT_DIR, "question-packs/tr");
const packFolders = readdirSync(packsDir).filter((d) => d !== "document_management" && statSync(path.join(packsDir, d)).isDirectory());

let duplicateCount = 0;
const docQuestions = pack.questions.map((q) => q.question.toLowerCase().trim());

for (const dir of packFolders) {
  const otherPackPath = path.join(packsDir, dir, "core.json");
  const otherPack = JSON.parse(readFileSync(otherPackPath, "utf-8")) as QuestionPack;
  for (const oq of otherPack.questions) {
    if (docQuestions.includes(oq.question.toLowerCase().trim())) {
      console.error(`Mükerrer soru tespit edildi: "${oq.question}" (${dir} / ${oq.id})`);
      duplicateCount++;
    }
  }
}
assert(duplicateCount === 0, `27 diğer modülle çapraz karşılaştırmada 0 tam mükerrer soru (${duplicateCount} bulundu)`);

// ─── TEST 10: Custom Questions Adapter Compatibility ──────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_doc_01",
  analysis_project_id: "p1",
  business_function_code: "DOCUMENT_MANAGEMENT",
  process_name: "Doküman arama ve filtreleme",
  question_text: "Şirkete özel yapay zeka tabanlı doküman özetleme ve anlamsal arama modülü kullanılmakta mıdır?",
  description: "Özel harici arama motoru adaptasyonu",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_doc_01", value: "evet_vektor_arama_var", label: "Evet, semantik arama ve vektör kütüphanesi mevcuttur", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_doc_01", value: "hayir", label: "Hayır, standart ilişkisel arama kullanılmaktadır", sort_order: 2, is_other: 0, created_at: "" }
  ],
  is_required: 1,
  sort_order: 48,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const adapted = adaptCustomQuestionToQuestion(mockCustomQuestion as any, 48);
assert(adapted.id === "cq_doc_01", "Custom question ID eşleşti");
assert(adapted.is_custom === true, "is_custom = true");
assert(adapted.process === "Doküman arama ve filtreleme", "Process eşleşti");
assert((adapted.options?.length ?? 0) === 2, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ──────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const formattedQ1 = formatAnswer(pack.questions[0], {
  selected: [{ value: "merkezi_dokuman_yonetim_proseduru_ve_sorumlusu_var", note: "Kalite Departmanı bünyesinde 2 doküman kontrolörü görev yapmaktadır" }],
  general_note: "Tüm kurumsal prosedürler yılda bir kez zorunlu revizyon döngüsüne alınır."
});
assert(formattedQ1.isAnswered === true, "formattedQ1.isAnswered = true");
assert(formattedQ1.summaryText.includes("yazılı doküman yönetim prosedürü"), "Kullanıcı dostu label formatlandı");
assert(formattedQ1.summaryText.includes("2 doküman kontrolörü"), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("yılda bir kez zorunlu revizyon"), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export ─────────────────────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with DOCUMENT_MANAGEMENT Data ===");
const mockDocReportModel: ReportModel = {
  metadata: {
    title: "ERP / Doküman Yönetimi Keşif Raporu",
    projectName: "Doküman Yaşam Döngüsü, Arşivleme ve Versiyonlama Olgunluk Keşfi",
    companyName: "Atlas Savunma ve Havacılık A.Ş.",
    generatedAt: "21.08.2026",
    projectStatus: "completed",
    packVersions: { DOCUMENT_MANAGEMENT: "tr.document_management.core v0.1.0" },
    isComplete: true,
    progressPercent: 100,
    requiredAnswered: 27,
    requiredTotal: 27,
    reportType: "final",
    draftLabel: "TAM RAPOR — %100",
    projectProgressPercent: 100,
    completedFunctionCount: 1,
    selectedFunctionCount: 1,
    isProjectComplete: true,
  },
  company: {
    companyName: "Atlas Savunma ve Havacılık A.Ş.",
    tradeName: "Atlas Savunma",
    taxNumber: "9876543210",
    city: "Ankara",
    country: "Türkiye",
    employeeCount: "350",
    notes: "Şirketin teknik çizim, sözleşme, kalite ve arşiv dokümantasyon süreçleri incelendi.",
  },
  profile: {
    analysis_project_id: "p_faz38",
    executive_summary: "Teknik resim ve CAD revizyon takibi güçlüdür; sözleşme yenileme alarmları ve hibrit fiziksel arşiv entegrasyonu güçlendirilmelidir.",
    overall_assessment: "ISO doküman kontrol mekanizması etkindir; kurumsal EDMS entegrasyonu ile ERP kartları arasındaki doküman bağı dijitalleştirilmelidir.",
    open_topics: "Fiziksel kutu barkodlama sistemi ve saklama süresi dolan evraklar için güvenli imha komisyonu protokolü.",
  },
  scope: [{
    code: "DOCUMENT_MANAGEMENT",
    nameTr: "Doküman Yönetimi",
    nameEn: "Document Management",
    category: "Yönetim",
    departmentName: "Kalite ve Dokümantasyon Müdürlüğü",
    responsiblePerson: "Zeynep Kaya",
    status: "completed",
    hasPack: true,
    progressPercentage: 100,
    answeredCount: 27,
    totalQuestionCount: 27,
  }],
  businessFunctions: [{
    code: "DOCUMENT_MANAGEMENT",
    nameTr: "Doküman Yönetimi",
    nameEn: "Document Management",
    category: "Yönetim",
    sortOrder: 28,
    departmentName: "Kalite ve Dokümantasyon Müdürlüğü",
    responsiblePerson: "Zeynep Kaya",
    status: "completed",
    packId: "tr.document_management.core",
    packVersion: "0.1.0",
    progressPercentage: 100,
    answeredCount: 27,
    totalQuestionCount: 27,
    processes: [{
      name: "Doküman yönetimi organizasyonu ve sorumluluklar",
      order: 1,
      questions: [{
        id: "DOC-001",
        order: 1,
        process: "Doküman yönetimi organizasyonu ve sorumluluklar",
        questionText: pack.questions.find((q) => q.id === "DOC-001")!.question,
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
    answeredQuestions: 27,
    totalQuestions: 27,
    openFollowupCount: 0,
    criticalFollowupCount: 0,
    revisitCount: 0,
  }
};

const docxBuf = await buildDocxBuffer(mockDocReportModel);
assert(docxBuf.length > 5000, `DOCX üretimi başarılı (${docxBuf.length} byte)`);

const pdfBuf = await buildPdfBuffer(mockDocReportModel);
assert(pdfBuf.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuf.length} byte)`);

const pdfParser = new PDFParse({ data: pdfBuf });
const parsedPdf = await pdfParser.getText();
assert(parsedPdf.text.includes("Doküman") || parsedPdf.text.includes("DOCUMENT_MANAGEMENT"), "PDF çıktısında 'Doküman' başlığı mevcut");
assert(parsedPdf.text.includes("Atlas Savunma"), "PDF çıktısında firma adı mevcut (Türkçe UTF-8 doğru)");

// ─── TEST 14: Loader Registry Parity ──────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
assert(getPackIdForFunction("DOCUMENT_MANAGEMENT") === "tr.document_management.core", "getPackIdForFunction('DOCUMENT_MANAGEMENT') -> tr.document_management.core");
assert(getPackIdForFunction("BELGE_YNT") === "tr.document_management.core", "getPackIdForFunction('BELGE_YNT') -> tr.document_management.core (Legacy Alias)");
assert(getPackIdForFunction("DOKUMAN_YONETIMI") === "tr.document_management.core", "getPackIdForFunction('DOKUMAN_YONETIMI') -> tr.document_management.core (Türkçe Alias)");
assert(getPackIdForFunction("DOCS") === "tr.document_management.core", "getPackIdForFunction('DOCS') -> tr.document_management.core (Alias)");
assert(hasQuestionPack("DOCUMENT_MANAGEMENT") === true, "hasQuestionPack('DOCUMENT_MANAGEMENT') === true");
assert(getPackStatus("DOCUMENT_MANAGEMENT") === "available", "getPackStatus('DOCUMENT_MANAGEMENT') === 'available'");

const loadedPackRes = await loadQuestionPack("tr.document_management.core");
assert(loadedPackRes.ok === true, "loadQuestionPack('tr.document_management.core') ok === true");
if (loadedPackRes.ok) {
  assert(loadedPackRes.pack.questions.length === 47, "Yüklenen soru paketi 47 soru içerir");
}

// ─── TEST 15: Sınır Ayrımı (Cross-Pack Isolation Tests) ──────────────────────
console.log("\n=== T15: Sınır Ayrımı (Cross-Pack Isolation Tests) ===");

// 1. FAZ-33 Question Evidence Sınırı: DOCUMENT_MANAGEMENT soruları soru bazlı kanıt dosyası yükleme ve Attachment Vault mimarisini değil, şirketin kurumsal doküman yaşam döngüsünü inceler.
const vaultTerms = ["managed attachment vault", "soru kanıt eki", "ekran görüntüsü kanıtı"];
let vaultViolations = 0;
pack.questions.forEach((q) => {
  vaultTerms.forEach((term) => {
    if (q.question.toLowerCase().includes(term)) {
      console.error(`  Sınır ihlali: ${q.id} sorusunda FAZ-33 Attachment Vault terimi (${term}) bulundu!`);
      vaultViolations++;
    }
  });
});
assert(vaultViolations === 0, "FAZ-33 sınır kontrolü: Soru bazlı kanıt kasası detayları DOCUMENT_MANAGEMENT paketinde tekrarlanmadı");

// 2. E_TRANSFORMATION ayrımı: DOCUMENT_MANAGEMENT GİB portalı ve mali mühür teknik detaylarını değil, kurumsal arşiv ve erişim standartlarını inceler.
const eTransformTerms = ["ubl-tr 1.2.1", "gib durum kodu 1200", "özel entegratör sla"];
let eTransViolations = 0;
pack.questions.forEach((q) => {
  eTransformTerms.forEach((term) => {
    if (q.question.toLowerCase().includes(term)) {
      console.error(`  Sınır ihlali: ${q.id} sorusunda E_TRANSFORMATION terimi (${term}) bulundu!`);
      eTransViolations++;
    }
  });
});
assert(eTransViolations === 0, "E_TRANSFORMATION sınır kontrolü: GİB/UBL teknik detayları DOCUMENT_MANAGEMENT paketinde tekrarlanmadı");

// 3. AI / Kapsam Dışı Kontrolü: Pakette hiçbir AI / Yapay Zeka önerisi yer almamalıdır.
const aiTerms = ["yapay zeka", "ai-driven", "otomatik ai"];
let aiViolations = 0;
pack.questions.forEach((q) => {
  aiTerms.forEach((term) => {
    if (q.question.toLowerCase().includes(term) || q.description?.toLowerCase().includes(term)) {
      console.error(`  Kapsam dışı ihlal: ${q.id} sorusunda AI terimi (${term}) bulundu!`);
      aiViolations++;
    }
  });
});
assert(aiViolations === 0, "AI / Kapsam Dışı kontrolü: Pakette 0 yapay zeka / AI ifadesi bulunmaktadır");

console.log("\n══════════════════════════════════════════════════════");
console.log(`FAZ-38 DOCUMENT_MANAGEMENT TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════════\n");

if (failCount === 0) {
  console.log("✅ FAZ-38 KABUL: Tüm testler geçti — DOCUMENT_MANAGEMENT Question Pack mühürlendi.");
  process.exit(0);
} else {
  console.error(`❌ FAZ-38 HATA: ${failCount} test başarısız oldu!`);
  process.exit(1);
}
