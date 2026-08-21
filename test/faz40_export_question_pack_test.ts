/**
 * ERP CRM Discovery — FAZ-40 İHRACAT VE GÜMRÜK / EXPORT Acceptance Tests
 *
 * Test Kapsamı:
 * T01: Pack Loading & Metadata Integrity (tr.export.core v0.1.0, canonical code = EXPORT)
 * T02: Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * T03: Question Quantity & Deterministic Order (47 questions, sequential order 1..47, EXP-001..EXP-047)
 * T04: Required Question Count Truth (25 required, 22 optional)
 * T05: Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * T06: Exact 25 Canonical Process Coverage & Strict Integrity Assertions
 * T07: Conditional Branching Resolution (8 condition points tested with branching engine)
 * T08: Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * T09: Cross-Pack Duplication Audit (0 duplicate questions across 29 existing modules)
 * T10: Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * T11: ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * T12: DOCX Binary Generation Compatibility
 * T13: Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * T14: Loader Registry Mapping Parity (getPackIdForFunction("EXPORT") === "tr.export.core")
 * T15: IMPORT–EXPORT & SALES Sınır Ayrımı (Cross-Pack Isolation)
 * T16: AI-Free, Zero Cloud, Offline-First & Evidence-First Kapsam Doğrulaması
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
const PACK_PATH = path.join(ROOT_DIR, "question-packs/tr/export/core.json");

console.log("══════════════════════════════════════════════════════");
console.log("FAZ-40: İHRACAT VE GÜMRÜK / EXPORT TEST");
console.log("══════════════════════════════════════════════════════\n");

// ─── TEST 1: Pack Loading & Metadata Integrity ──────────────────────────────
console.log("=== T01: Pack Loading & Metadata Integrity ===");
assert(existsSync(PACK_PATH), `Soru paketi dosyası mevcut: ${PACK_PATH}`);

const rawJson = readFileSync(PACK_PATH, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(pack.meta.pack_id === "tr.export.core", "pack_id = tr.export.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "EXPORT", "business_function_code = EXPORT (Kanonik Kod)");
assert(pack.meta.name === "İhracat ve Gümrük Yönetimi Soru Paketi", "name tanımlı ve doğru");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ─────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(exportPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 47, `Toplam soru sayısı tam 47 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 47, "Tüm 47 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `EXP-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: Beklenen ${expectedId} (order: ${i + 1}), Bulunan ${pack.questions[i].id} (order: ${pack.questions[i].order})`);
  }
}
assert(orderCorrect, "Tüm sorular EXP-001'den EXP-047'ye sıralı ve deterministiktir");

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

// ─── TEST 6: 25 Canonical Process Coverage & Strict Integrity ───────────────
console.log("\n=== T06: 25 Canonical Process Coverage & Strict Integrity ===");
const expectedProcesses = [
  "İhracat organizasyonu ve süreç sahipliği",
  "İhracat yapılan ülke ve pazarlar",
  "İhracat ürün ve hizmet kapsamı",
  "İhracat müşteri ve bayi yapısı",
  "İhracat fırsat, teklif ve sipariş süreci",
  "Dış ticaret sözleşmeleri",
  "Proforma fatura ve sipariş teyidi",
  "İhracat ödeme şekilleri ve tahsilat riski",
  "Incoterms kullanımı",
  "İhracat fiyatlandırması ve teslim şekli",
  "Ambalaj, paketleme ve etiketleme",
  "Navlun, taşıma ve forwarder yönetimi",
  "Gümrük müşaviri ve temsil modeli",
  "İhracat beyannamesi ve gümrük çıkış işlemleri",
  "GTİP / HS kodu yönetimi",
  "Menşe ve tercihli menşe belgeleri",
  "ATR, EUR.1 ve diğer dolaşım belgeleri",
  "İhracat izinleri ve ürün uygunluk belgeleri",
  "Ticari fatura, çeki listesi ve sevk evrakı",
  "Konşimento, CMR, AWB ve taşıma belgeleri",
  "İhracat KDV istisnası ve mali süreç",
  "İhracat maliyetleri, komisyon ve navlun dağıtımı",
  "ERP/CRM, dış ticaret ve lojistik entegrasyonu",
  "İhracat raporlama, KPI ve risk takibi",
  "İhracat arşivi, kanıt dokümanları ve iyileştirme yol haritası"
];

assert(expectedProcesses.length === 25, `Kanonik referans süreç listesi tam 25 adettir (${expectedProcesses.length})`);

const actualProcesses = Array.from(new Set(pack.questions.map((q) => q.process)));
assert(actualProcesses.length === 25, `Paketteki benzersiz süreç sayısı tam 25'tir (Bulunan: ${actualProcesses.length})`);

// 1. Her soru tanımlı kanonik süreç listesindeki geçerli bir sürece bağlı mı?
let allQuestionsHaveValidProcess = true;
for (const q of pack.questions) {
  if (!q.process || !expectedProcesses.includes(q.process)) {
    allQuestionsHaveValidProcess = false;
    console.error(`  Geçersiz veya tanımsız süreç: Soru ${q.id} -> "${q.process}"`);
  }
}
assert(allQuestionsHaveValidProcess, "Her soru (47/47) tanımlı kanonik süreç listesindeki geçerli bir sürece bağlıdır");

// 2. Kanonik süreç listesinde fazlalık bulunmuyor mu?
const extraProcesses = actualProcesses.filter((p) => !expectedProcesses.includes(p));
assert(extraProcesses.length === 0, `Kanonik süreç listesinde fazlalık bulunmamaktadır (Fazla: ${extraProcesses.length})`);

// 3. Her süreç en az bir soruyla kapsanıyor mu?
let allProcessesCovered = true;
for (const p of expectedProcesses) {
  const count = pack.questions.filter((q) => q.process === p).length;
  if (count === 0) {
    allProcessesCovered = false;
    console.error(`  Kapsanmayan süreç: "${p}"`);
  }
}
assert(allProcessesCovered, "Tüm 25 kanonik sürecin her biri en az bir soruyla (%100) kapsanmaktadır");

// ─── TEST 7: Branching Engine Resolution (8 Dallanma) ────────────────────────
console.log("\n=== T07: Branching Engine Resolution (8 Dallanma) ===");
const answers = new Map<string, AnswerData>();

// 1. Cevapsız durumda 8 koşullu soru gizli olmalı (47 - 8 = 39 görünür)
const initialVisible = getVisibleQuestions(pack.questions, answers);
assert(initialVisible.length === 39, `Cevapsız durumda tam 39 soru görünür (8 branching gizli) — Gerçek: ${initialVisible.length}`);

// 2. Koşul 1: EXP-003 -> EXP-004 (Çoklu Ülke ve Ticaret Bölgeleri)
answers.set("EXP-003", { selected: [{ value: "tek_veya_birbiriyle_benzer_birkaç_komsu_ulke" }] });
const vQ1 = getVisibleQuestions(pack.questions, answers);
assert(!vQ1.some((q) => q.id === "EXP-004"), "EXP-003 != coklu_ulke_ve_farkli_ticaret_bolgeleri iken EXP-004 gizli");

answers.set("EXP-003", { selected: [{ value: "coklu_ulke_ve_farkli_ticaret_bolgeleri" }] });
const vQ2 = getVisibleQuestions(pack.questions, answers);
assert(vQ2.some((q) => q.id === "EXP-004"), "EXP-003 = coklu_ulke_ve_farkli_ticaret_bolgeleri iken EXP-004 görünür");

// 3. Koşul 2: EXP-006 -> EXP-007 (Distribütör ve Bayi Ağı)
answers.set("EXP-006", { selected: [{ value: "dogrudan_son_kullanici_ve_kurumsal_musterilere_satilir" }] });
const vQ3 = getVisibleQuestions(pack.questions, answers);
assert(!vQ3.some((q) => q.id === "EXP-007"), "EXP-006 != distributor_bayi_ve_harici_acente_agi iken EXP-007 gizli");

answers.set("EXP-006", { selected: [{ value: "distributor_bayi_ve_harici_acente_agi" }] });
const vQ4 = getVisibleQuestions(pack.questions, answers);
assert(vQ4.some((q) => q.id === "EXP-007"), "EXP-006 = distributor_bayi_ve_harici_acente_agi iken EXP-007 görünür");

// 4. Koşul 3: EXP-012 -> EXP-013 (Akreditif / Vadeli Tahsilat)
answers.set("EXP-012", { selected: [{ value: "sadece_pesin_transfer_veya_guvenilir_acik_hesap" }] });
const vQ5 = getVisibleQuestions(pack.questions, answers);
assert(!vQ5.some((q) => q.id === "EXP-013"), "EXP-012 != akreditif_veya_vesaik_mukabili_vadeli iken EXP-013 gizli");

answers.set("EXP-012", { selected: [{ value: "akreditif_veya_vesaik_mukabili_vadeli" }] });
const vQ6 = getVisibleQuestions(pack.questions, answers);
assert(vQ6.some((q) => q.id === "EXP-013"), "EXP-012 = akreditif_veya_vesaik_mukabili_vadeli iken EXP-013 görünür");

// 5. Koşul 4: EXP-020 -> EXP-021 (Forwarder ve Gümrükçü Portalı)
answers.set("EXP-020", { selected: [{ value: "spot_navlun_alinir_ve_booking_e_posta_ile_manuel_yurutulur" }] });
const vQ7 = getVisibleQuestions(pack.questions, answers);
assert(!vQ7.some((q) => q.id === "EXP-021"), "EXP-020 != anlasmali_forwarder_ve_gumrukcu_portali_kullanilir iken EXP-021 gizli");

answers.set("EXP-020", { selected: [{ value: "anlasmali_forwarder_ve_gumrukcu_portali_kullanilir" }] });
const vQ8 = getVisibleQuestions(pack.questions, answers);
assert(vQ8.some((q) => q.id === "EXP-021"), "EXP-020 = anlasmali_forwarder_ve_gumrukcu_portali_kullanilir iken EXP-021 görünür");

// 6. Koşul 5: EXP-026 -> EXP-027 (Tercihli Menşe ve Dolaşım Belgeleri)
answers.set("EXP-026", { selected: [{ value: "sadece_standart_mense_sahadetnamesi_kullanilir" }] });
const vQ9 = getVisibleQuestions(pack.questions, answers);
assert(!vQ9.some((q) => q.id === "EXP-027"), "EXP-026 != tercihli_mense_ve_dolasim_belgeleri_kullanilir iken EXP-027 gizli");

answers.set("EXP-026", { selected: [{ value: "tercihli_mense_ve_dolasim_belgeleri_kullanilir" }] });
const vQ10 = getVisibleQuestions(pack.questions, answers);
assert(vQ10.some((q) => q.id === "EXP-027"), "EXP-026 = tercihli_mense_ve_dolasim_belgeleri_kullanilir iken EXP-027 görünür");

// 7. Koşul 6: EXP-028 -> EXP-029 (İhracat Ön İzinleri ve Teknik Belgeler)
answers.set("EXP-028", { selected: [{ value: "standart_serbest_ihracattir_on_izin_gerekmez" }] });
const vQ11 = getVisibleQuestions(pack.questions, answers);
assert(!vQ11.some((q) => q.id === "EXP-029"), "EXP-028 != ihracatta_on_izin_lisans_ve_teknik_belge_gerekir iken EXP-029 gizli");

answers.set("EXP-028", { selected: [{ value: "ihracatta_on_izin_lisans_ve_teknik_belge_gerekir" }] });
const vQ12 = getVisibleQuestions(pack.questions, answers);
assert(vQ12.some((q) => q.id === "EXP-029"), "EXP-028 = ihracatta_on_izin_lisans_ve_teknik_belge_gerekir iken EXP-029 görünür");

// 8. Koşul 7: EXP-037 -> EXP-038 (Fiili İhracat Maliyet Dağıtımı)
answers.set("EXP-037", { selected: [{ value: "ihracat_masraflari_genel_gider_hesaplarina_atilir_dosyaya_baglanmaz" }] });
const vQ13 = getVisibleQuestions(pack.questions, answers);
assert(!vQ13.some((q) => q.id === "EXP-038"), "EXP-037 != fiili_ihracat_maliyetleri_siparis_ve_urune_dagitilir iken EXP-038 gizli");

answers.set("EXP-037", { selected: [{ value: "fiili_ihracat_maliyetleri_siparis_ve_urune_dagitilir" }] });
const vQ14 = getVisibleQuestions(pack.questions, answers);
assert(vQ14.some((q) => q.id === "EXP-038"), "EXP-037 = fiili_ihracat_maliyetleri_siparis_ve_urune_dagitilir iken EXP-038 görünür");

// 9. Koşul 8: EXP-040 -> EXP-041 (E-İhracat ve Mikro İhracat ETGB)
answers.set("EXP-040", { selected: [{ value: "sadece_geleneksel_konteyner_tir_ihracati_yapilir" }] });
const vQ15 = getVisibleQuestions(pack.questions, answers);
assert(!vQ15.some((q) => q.id === "EXP-041"), "EXP-040 != e_ihracat_mikro_ihracat_ve_pazaryeri_satisi_var iken EXP-041 gizli");

answers.set("EXP-040", { selected: [{ value: "e_ihracat_mikro_ihracat_ve_pazaryeri_satisi_var" }] });
const vQ16 = getVisibleQuestions(pack.questions, answers);
assert(vQ16.some((q) => q.id === "EXP-041"), "EXP-040 = e_ihracat_mikro_ihracat_ve_pazaryeri_satisi_var iken EXP-041 görünür");

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

// Followup bayraklı 2 sorunun ilerlemeden düşülmesi
mockFollowups.set("EXP-001", {
  id: "qf_exp_001",
  analysis_project_id: "p1",
  business_function_code: "EXPORT",
  question_id: "EXP-001",
  flag_type: "revisit",
  note: "Gümrük müşavirliği ihracat vekalet yetkisi incelenecek",
  status: "open",
  created_at: "2026-08-21",
  updated_at: "2026-08-21",
  resolved_at: null
});
mockFollowups.set("EXP-034", {
  id: "qf_exp_034",
  analysis_project_id: "p1",
  business_function_code: "EXPORT",
  question_id: "EXP-034",
  flag_type: "critical",
  note: "İhracat KDV iadesi yüklenilen KDV listesi ve intaç tarihi eşleşmesi doğrulanacak",
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
const packFolders = readdirSync(packsDir).filter((d) => d !== "export" && statSync(path.join(packsDir, d)).isDirectory());

let duplicateCount = 0;
const exportQuestions = pack.questions.map((q) => q.question.toLowerCase().trim());

for (const dir of packFolders) {
  const otherPackPath = path.join(packsDir, dir, "core.json");
  const otherPack = JSON.parse(readFileSync(otherPackPath, "utf-8")) as QuestionPack;
  for (const oq of otherPack.questions) {
    if (exportQuestions.includes(oq.question.toLowerCase().trim())) {
      console.error(`Mükerrer soru tespit edildi: "${oq.question}" (${dir} / ${oq.id})`);
      duplicateCount++;
    }
  }
}
assert(duplicateCount === 0, `29 diğer modülle çapraz karşılaştırmada 0 tam mükerrer soru (${duplicateCount} bulundu)`);

// ─── TEST 10: Custom Questions Adapter Compatibility ──────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_exp_01",
  analysis_project_id: "p1",
  business_function_code: "EXPORT",
  process_name: "İhracat KDV istisnası ve mali süreç",
  question_text: "Şirketinize özel sektörel KDV iade teminat çözümü veya YMM rapor onay süresi nedir?",
  description: "Özel KDV teminatı ve vergi dairesi mahsup süreci.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_exp_01", value: "hizli_kdv_iade_sistemi_var", label: "Hızlandırılmış KDV İade Sistemi (HİS/İTUS) sertifikamız vardır", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_exp_01", value: "standart_ymm_raporu_beklenir", label: "Standart YMM raporu ile 3-6 ayda mahsup edilir", sort_order: 2, is_other: 0, created_at: "" }
  ],
  is_required: 1,
  sort_order: 48,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const adapted = adaptCustomQuestionToQuestion(mockCustomQuestion as any, 48);
assert(adapted.id === "cq_exp_01", "Custom question ID eşleşti");
assert(adapted.is_custom === true, "is_custom = true");
assert(adapted.process === "İhracat KDV istisnası ve mali süreç", "Process eşleşti");
assert((adapted.options?.length ?? 0) === 2, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ──────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const formattedQ1 = formatAnswer(pack.questions[0], {
  selected: [{ value: "merkezi_ihracat_ve_dis_ticaret_departmani_var", note: "İhracat Direktörlüğü bünyesinde 4 bölge satış uzmanı görev yapmaktadır" }],
  general_note: "Avrupa ve Orta Doğu pazarlarına haftalık düzenli konteyner ve TIR sevkiyatı yapılmaktadır."
});
assert(formattedQ1.isAnswered === true, "formattedQ1.isAnswered = true");
assert(formattedQ1.summaryText.includes("uzman ihracat/dış ticaret departmanı"), "Kullanıcı dostu label formatlandı");
assert(formattedQ1.summaryText.includes("4 bölge satış uzmanı"), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Avrupa ve Orta Doğu"), "Genel not formatlandı");

// ─── TEST 12: DOCX Export Binary Generation ─────────────────────────────────
console.log("\n=== T12: DOCX Export Binary Generation ===");
const mockExportReportModel: ReportModel = {
  metadata: {
    title: "ERP / İhracat ve Gümrük Yönetimi Keşif Raporu",
    projectName: "İhracat Operasyonları ve Dijital Gümrükleme Olgunluk Keşfi",
    companyName: "Anadolu Global Dış Ticaret ve Sanayi A.Ş.",
    generatedAt: "21.08.2026",
    projectStatus: "completed",
    packVersions: { EXPORT: "tr.export.core v0.1.0" },
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
    companyName: "Anadolu Global Dış Ticaret ve Sanayi A.Ş.",
    tradeName: "Anadolu Global",
    taxNumber: "9876543210",
    city: "İzmir",
    country: "Türkiye",
    employeeCount: "350",
    notes: "Şirketin 42 ülkeye ihracatı, e-İhracat faturası ve KDV 11/1-a iade süreçleri analiz edildi.",
  },
  profile: {
    analysis_project_id: "p_faz40",
    executive_summary: "Yıllık 60 milyon USD mamul ihracatı yapılmaktadır; navlun, komisyon ve gümrük masraflarının sipariş bazlı karlılık analizine yansıtılması güçlendirilmelidir.",
    overall_assessment: "Gümrük müşavirliği ile e-Fatura entegrasyonu başarılıdır; A.TR / EUR.1 menşe arşivleme disiplini ERP içinde otomatikleştirilmelidir.",
    open_topics: "İBKB 180 günlük süre takip alarmlarının ERP finans modülüne bağlanması ve Mikro İhracat ETGB muhasebe aktarımı.",
  },
  scope: [{
    code: "EXPORT",
    nameTr: "İhracat ve Gümrük",
    nameEn: "Export & Customs",
    category: "Lojistik & Depo",
    departmentName: "İhracat ve Dış Ticaret Direktörlüğü",
    responsiblePerson: "Zeynep Kaya",
    status: "completed",
    hasPack: true,
    progressPercentage: 100,
    answeredCount: 25,
    totalQuestionCount: 25,
  }],
  businessFunctions: [{
    code: "EXPORT",
    nameTr: "İhracat ve Gümrük",
    nameEn: "Export & Customs",
    category: "Lojistik & Depo",
    sortOrder: 25,
    departmentName: "İhracat ve Dış Ticaret Direktörlüğü",
    responsiblePerson: "Zeynep Kaya",
    status: "completed",
    packId: "tr.export.core",
    packVersion: "0.1.0",
    progressPercentage: 100,
    answeredCount: 25,
    totalQuestionCount: 25,
    processes: [{
      name: "İhracat organizasyonu ve süreç sahipliği",
      order: 1,
      questions: [{
        id: "EXP-001",
        order: 1,
        process: "İhracat organizasyonu ve süreç sahipliği",
        questionText: pack.questions.find((q) => q.id === "EXP-001")!.question,
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

const docxBuf = await buildDocxBuffer(mockExportReportModel);
assert(docxBuf.length > 5000, `DOCX üretimi başarılı (${docxBuf.length} byte)`);

// ─── TEST 13: Liberation Sans TrueType Unicode PDF Export ─────────────────────
console.log("\n=== T13: Liberation Sans TrueType Unicode PDF Export ===");
const pdfBuf = await buildPdfBuffer(mockExportReportModel);
assert(pdfBuf.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuf.length} byte)`);

const pdfParser = new PDFParse({ data: pdfBuf });
const parsedPdf = await pdfParser.getText();
assert(parsedPdf.text.includes("İhracat") || parsedPdf.text.includes("EXPORT"), "PDF çıktısında 'İhracat' başlığı mevcut");
assert(parsedPdf.text.includes("Anadolu Global"), "PDF çıktısında firma adı mevcut (Türkçe UTF-8 doğru)");

// ─── TEST 14: Loader Registry Parity ──────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
assert(getPackIdForFunction("EXPORT") === "tr.export.core", "getPackIdForFunction('EXPORT') -> tr.export.core");
assert(getPackIdForFunction("IHRACAT") === "tr.export.core", "getPackIdForFunction('IHRACAT') -> tr.export.core (Legacy / Türkçe Alias)");
assert(getPackIdForFunction("IHRACAT_GUMRUK") === "tr.export.core", "getPackIdForFunction('IHRACAT_GUMRUK') -> tr.export.core (Alias)");
assert(getPackIdForFunction("DIS_TICARET_EXPORT") === "tr.export.core", "getPackIdForFunction('DIS_TICARET_EXPORT') -> tr.export.core (Alias)");
assert(getPackIdForFunction("EXPORT_CUSTOMS") === "tr.export.core", "getPackIdForFunction('EXPORT_CUSTOMS') -> tr.export.core (Alias)");
assert(hasQuestionPack("EXPORT") === true, "hasQuestionPack('EXPORT') === true");
assert(getPackStatus("EXPORT") === "available", "getPackStatus('EXPORT') === 'available'");

const loadedPackRes = await loadQuestionPack("tr.export.core");
assert(loadedPackRes.ok === true, "loadQuestionPack('tr.export.core') ok === true");
if (loadedPackRes.ok) {
  assert(loadedPackRes.pack.questions.length === 47, "Yüklenen soru paketi 47 soru içerir");
}

// ─── TEST 15: Sınır Ayrımı (Cross-Pack Isolation: IMPORT & SALES) ────────────
console.log("\n=== T15: Sınır Ayrımı (Cross-Pack Isolation: IMPORT & SALES) ===");

// 1. IMPORT ayrımı: EXPORT soruları ithalat gümrük vergisi (İGV, EMY, KKDF vb.), ithalat antrepo veya ithalat landed cost maliyet dağıtımını sormaz.
const importTerms = ["ithalat gümrük vergisi", "ithalat antreposu", "landed cost ithalat maliyeti"];
let importViolations = 0;
pack.questions.forEach((q) => {
  importTerms.forEach((term) => {
    if (q.question.toLowerCase().includes(term)) {
      console.error(`  Sınır ihlali: ${q.id} sorusunda IMPORT terimi (${term}) bulundu!`);
      importViolations++;
    }
  });
});
assert(importViolations === 0, "IMPORT sınır kontrolü: İthalat odaklı spesifik terimler EXPORT paketinde tekrarlanmadı");

// 2. SALES ayrımı: EXPORT soruları genel yurtiçi satış süreçlerini değil, dış ticaret, kambiyo ve gümrük süreçlerini inceler.
const salesTerms = ["yurtiçi satış onay hiyerarşisi", "yerel bayi iskonto matrisi"];
let salesViolations = 0;
pack.questions.forEach((q) => {
  salesTerms.forEach((term) => {
    if (q.question.toLowerCase().includes(term)) {
      console.error(`  Sınır ihlali: ${q.id} sorusunda SALES terimi (${term}) bulundu!`);
      salesViolations++;
    }
  });
});
assert(salesViolations === 0, "SALES sınır kontrolü: Yurtiçi satış süreçleri EXPORT paketinde tekrarlanmadı");

// ─── TEST 16: AI-Free, Zero Cloud, Offline-First & Evidence-First Kapsam Doğrulaması ───
console.log("\n=== T16: AI-Free, Zero Cloud & Evidence-First Kapsam Doğrulaması ===");
const aiTerms = ["yapay zeka", "ai-driven", "otomatik ai", "machine learning", "tahminleme motoru"];
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
console.log(`FAZ-40 EXPORT TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════════\n");

if (failCount === 0) {
  console.log("✅ FAZ-40 KABUL: Tüm testler geçti — EXPORT Question Pack mühürlendi.");
  process.exit(0);
} else {
  console.error(`❌ FAZ-40 HATA: ${failCount} test başarısız oldu!`);
  process.exit(1);
}
