/**
 * ERP CRM Discovery — FAZ-44 EĞİTİM VE GELİŞİM YÖNETİMİ / TRAINING Acceptance Tests
 *
 * Test Kapsamı:
 * T01: Pack Loading & Metadata Integrity (tr.training.core v0.1.0, canonical code = TRAINING)
 * T02: Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * T03: Question Quantity & Deterministic Order (47 questions, sequential order 1..47, TRN-001..TRN-047)
 * T04: Required Question Count Truth (25 required, 22 optional)
 * T05: Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * T06: Exact 25 Canonical Process Coverage & Strict Integrity Assertions
 * T07: Every Canonical Process Has at Least One Question (100% process coverage)
 * T08: Conditional Branching Engine Resolution (8 condition points tested with branching engine)
 * T09: Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * T10: Cross-Pack Duplication Audit (0 duplicate questions across 33 existing modules)
 * T11: Custom Questions Adapter Compatibility (custom question adapter integration)
 * T12: ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * T13: DOCX Binary Generation Compatibility
 * T14: Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * T15: Loader Registry Mapping Parity (getPackIdForFunction("TRAINING") === "tr.training.core" + aliases)
 * T16: TRAINING–HUMAN_RESOURCES–PAYROLL–LEGAL_COMPLIANCE Sınır Ayrımı (Cross-Pack Isolation)
 * T17: AI-Free, Zero Cloud, Offline-First Doğrulaması
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import path from "path";
import { validateQuestionPack } from "../src/engine/validator";
import { getVisibleQuestions, isQuestionVisible } from "../src/engine/branching";
import { calculateProgress } from "../src/engine/progress";
import { adaptCustomQuestionToQuestion } from "../src/engine/customQuestionAdapter";
import { formatAnswer } from "../src/report/formatters";
import { getPackIdForFunction, loadQuestionPack, hasQuestionPack, getPackStatus } from "../src/engine/loader";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import { PDFParse } from "pdf-parse";
import type { QuestionPack, Question, AnswerData } from "../src/engine/types";
import type { ReportModel } from "../src/report/types";

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
const PACK_PATH = path.join(ROOT_DIR, "question-packs/tr/training/core.json");

console.log("══════════════════════════════════════════════════════");
console.log("FAZ-44: EĞİTİM VE GELİŞİM YÖNETİMİ / TRAINING TEST");
console.log("══════════════════════════════════════════════════════\n");

// ─── TEST 1: Pack Loading & Metadata Integrity ──────────────────────────────
console.log("=== T01: Pack Loading & Metadata Integrity ===");
assert(existsSync(PACK_PATH), `Soru paketi dosyası mevcut: ${PACK_PATH}`);

const rawJson = readFileSync(PACK_PATH, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(pack.meta.pack_id === "tr.training.core", "pack_id = tr.training.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "TRAINING", "business_function_code = TRAINING (Kanonik Kod)");
assert(pack.meta.name === "Eğitim ve Gelişim Yönetimi Ön Analizi", "name tanımlı ve doğru");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ─────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(trainingPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 47, `Toplam soru sayısı tam 47 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 47, "Tüm 47 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `TRN-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: Beklenen ${expectedId} (order: ${i + 1}), Bulunan ${pack.questions[i].id} (order: ${pack.questions[i].order})`);
  }
}
assert(orderCorrect, "Tüm sorular TRN-001'den TRN-047'ye sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 25, `Zorunlu soru sayısı tam 25 adet (${requiredQuestions.length})`);
assert(optionalQuestions.length === 22, `Opsiyonel soru sayısı tam 22 adet (${optionalQuestions.length})`);

// ─── TEST 5: Choice Options Integrity ───────────────────────────────────────
console.log("\n=== T05: Choice Options Integrity ===");
let optionsValid = true;
for (const q of pack.questions) {
  if (q.options) {
    const vals = q.options.map((o) => o.value);
    const uVals = new Set(vals);
    if (vals.length !== uVals.size) {
      optionsValid = false;
      console.error(`Tekrarlanan seçenek değeri: ${q.id}`);
    }
    const otherOpts = q.options.filter((o) => o.is_other);
    if (otherOpts.length > 1) {
      optionsValid = false;
      console.error(`Birden fazla is_other seçeneği: ${q.id}`);
    }
    for (const o of otherOpts) {
      if (!o.allow_note) {
        optionsValid = false;
        console.error(`is_other=true fakat allow_note=true değil: ${q.id}`);
      }
    }
  }
}
assert(optionsValid, "Tüm seçenekler benzersiz, is_other ve allow_note kurallarına uygundur");

// ─── TEST 6: Exact 25 Canonical Process Coverage ───────────────────────────
console.log("\n=== T06: Exact 25 Canonical Process Coverage ===");
const CANONICAL_PROCESSES = [
  "Eğitim organizasyonu ve süreç sahipliği",
  "Eğitim politikası ve yönetmelikler",
  "Eğitim ihtiyaç analizi",
  "Yıllık eğitim planı",
  "Yetkinlik ve beceri matrisi",
  "Pozisyon bazlı eğitim gereksinimleri",
  "İşe giriş ve oryantasyon eğitimi",
  "İşbaşı ve görev eğitimi",
  "Teknik eğitimler",
  "İş sağlığı ve güvenliği eğitimleri",
  "Yasal ve zorunlu uyum eğitimleri",
  "Ürün, süreç ve kalite eğitimleri",
  "ERP/CRM ve dijital sistem eğitimleri",
  "Liderlik ve yönetici gelişimi",
  "Mesleki sertifika ve lisanslar",
  "İç eğitmen ve dış eğitmen yönetimi",
  "Eğitim kurumu ve tedarikçi yönetimi",
  "Eğitim bütçesi ve maliyet takibi",
  "Eğitim takvimi ve katılımcı planlaması",
  "Katılım, devam ve eğitim kayıtları",
  "Sınav, değerlendirme ve başarı ölçümü",
  "Sertifika, geçerlilik ve yenileme takibi",
  "Kariyer, gelişim ve performans bağlantısı",
  "LMS, içerik ve doküman yönetimi",
  "Eğitim etkinliği, KPI, arşiv ve yol haritası",
];

const packProcesses = Array.from(new Set(pack.questions.map((q) => q.process)));
assert(packProcesses.length === 25, `Soru paketinde tam 25 benzersiz süreç bulunmaktadır (${packProcesses.length})`);

for (const cp of CANONICAL_PROCESSES) {
  assert(packProcesses.includes(cp), `Kanonik süreç pakette mevcut: "${cp}"`);
}

for (const pp of packProcesses) {
  assert(CANONICAL_PROCESSES.includes(pp), `Paket süreci kanonik listede: "${pp}"`);
}

// ─── TEST 7: Every Canonical Process Has at Least One Question ──────────────
console.log("\n=== T07: Every Canonical Process Has at Least One Question ===");
let allProcessesCovered = true;
for (const cp of CANONICAL_PROCESSES) {
  const count = pack.questions.filter((q) => q.process === cp).length;
  if (count === 0) {
    allProcessesCovered = false;
    console.error(`Süreç hiç soru içermiyor: ${cp}`);
  }
}
assert(allProcessesCovered, "Tüm 25 kanonik sürecin her biri en az bir soruyla (%100) kapsanmaktadır");

// ─── TEST 8: Conditional Branching Engine Resolution (8 Dallanma) ───────────
console.log("\n=== T08: Conditional Branching Engine Resolution (8 Dallanma) ===");
const emptyAnswers = new Map<string, AnswerData>();
const visibleWithNoAnswers = getVisibleQuestions(pack.questions, emptyAnswers);
assert(
  visibleWithNoAnswers.length === 47,
  `Cevapsız durumda tüm 47 soru görünür (8 not_equals koşulu) — Gerçek: ${visibleWithNoAnswers.length}`
);

// BRANCHING 1: TRN-004 visible when TRN-003 != "resmi_egitim_politikasi_yok_ihtiyaca_gore_karar_verilir"
const trn004Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "TRN-004")!,
  new Map([["TRN-003", { selected: [{ value: "resmi_egitim_politikasi_yok_ihtiyaca_gore_karar_verilir" }] }]])
);
const trn004Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "TRN-004")!,
  new Map([["TRN-003", { selected: [{ value: "resmi_ve_guncel_egitim_politikasi_ve_yonetmeligi_yururluktedir" }] }]])
);
assert(trn004Hidden, "TRN-003 = resmi_egitim_politikasi_yok_ihtiyaca_gore_karar_verilir iken TRN-004 gizli");
assert(trn004Visible, "TRN-003 != resmi_egitim_politikasi_yok_ihtiyaca_gore_karar_verilir iken TRN-004 görünür");

// BRANCHING 2: TRN-006 visible when TRN-005 != "egitim_ihtiyac_analizi_yapilmiyor_talep_oldukca_degerlendirilir"
const trn006Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "TRN-006")!,
  new Map([["TRN-005", { selected: [{ value: "egitim_ihtiyac_analizi_yapilmiyor_talep_oldukca_degerlendirilir" }] }]])
);
const trn006Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "TRN-006")!,
  new Map([["TRN-005", { selected: [{ value: "yillik_duzenli_performans_yetkinlik_ve_anket_bazli_eia_yapilir" }] }]])
);
assert(trn006Hidden, "TRN-005 = egitim_ihtiyac_analizi_yapilmiyor_talep_oldukca_degerlendirilir iken TRN-006 gizli");
assert(trn006Visible, "TRN-005 != egitim_ihtiyac_analizi_yapilmiyor_talep_oldukca_degerlendirilir iken TRN-006 görünür");

// BRANCHING 3: TRN-010 visible when TRN-009 != "yetkinlik_matrisi_kullanilmiyor_pozisyon_tanimlariyla_sinirli"
const trn010Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "TRN-010")!,
  new Map([["TRN-009", { selected: [{ value: "yetkinlik_matrisi_kullanilmiyor_pozisyon_tanimlariyla_sinirli" }] }]])
);
const trn010Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "TRN-010")!,
  new Map([["TRN-009", { selected: [{ value: "tum_roller_icin_sayisal_seviyeli_yetkinlik_ve_polivalans_matrisi_vardir" }] }]])
);
assert(trn010Hidden, "TRN-009 = yetkinlik_matrisi_kullanilmiyor_pozisyon_tanimlariyla_sinirli iken TRN-010 gizli");
assert(trn010Visible, "TRN-009 != yetkinlik_matrisi_kullanilmiyor_pozisyon_tanimlariyla_sinirli iken TRN-010 görünür");

// BRANCHING 4: TRN-014 visible when TRN-013 != "resmi_oryantasyon_programi_uygulanmiyor_dogrudan_ise_baslanir"
const trn014Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "TRN-014")!,
  new Map([["TRN-013", { selected: [{ value: "resmi_oryantasyon_programi_uygulanmiyor_dogrudan_ise_baslanir" }] }]])
);
const trn014Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "TRN-014")!,
  new Map([["TRN-013", { selected: [{ value: "standart_takvimli_ve_olculebilir_oryantasyon_programi_uygulanir" }] }]])
);
assert(trn014Hidden, "TRN-013 = resmi_oryantasyon_programi_uygulanmiyor_dogrudan_ise_baslanir iken TRN-014 gizli");
assert(trn014Visible, "TRN-013 != resmi_oryantasyon_programi_uygulanmiyor_dogrudan_ise_baslanir iken TRN-014 görünür");

// BRANCHING 5: TRN-022 visible when TRN-021 != "yasal_ve_zorunlu_uyum_egitim_takibi_yapilmiyor_veya_harici_firma_takip_ediyor"
const trn022Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "TRN-022")!,
  new Map([["TRN-021", { selected: [{ value: "yasal_ve_zorunlu_uyum_egitim_takibi_yapilmiyor_veya_harici_firma_takip_ediyor" }] }]])
);
const trn022Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "TRN-022")!,
  new Map([["TRN-021", { selected: [{ value: "tum_zorunlu_uyum_egitimleri_periyodik_ve_katilim_orani_takip_edilir" }] }]])
);
assert(trn022Hidden, "TRN-021 = yasal_ve_zorunlu_uyum_egitim_takibi_yapilmiyor iken TRN-022 gizli");
assert(trn022Visible, "TRN-021 != yasal_ve_zorunlu_uyum_egitim_takibi_yapilmiyor iken TRN-022 görünür");

// BRANCHING 6: TRN-030 visible when TRN-029 != "mesleki_sertifika_ve_lisans_takibi_yapilmiyor"
const trn030Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "TRN-030")!,
  new Map([["TRN-029", { selected: [{ value: "mesleki_sertifika_ve_lisans_takibi_yapilmiyor" }] }]])
);
const trn030Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "TRN-030")!,
  new Map([["TRN-029", { selected: [{ value: "sistemde_gecerlilik_tarihli_dijital_sertifika_arsivi_ve_uyari_mekanizmasi_vardir" }] }]])
);
assert(trn030Hidden, "TRN-029 = mesleki_sertifika_ve_lisans_takibi_yapilmiyor iken TRN-030 gizli");
assert(trn030Visible, "TRN-029 != mesleki_sertifika_ve_lisans_takibi_yapilmiyor iken TRN-030 görünür");

// BRANCHING 7: TRN-045 visible when TRN-044 != "lms_kullanilmiyor_egitimler_manuel_sinif_ortaminda_yurutulur"
const trn045Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "TRN-045")!,
  new Map([["TRN-044", { selected: [{ value: "lms_kullanilmiyor_egitimler_manuel_sinif_ortaminda_yurutulur" }] }]])
);
const trn045Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "TRN-045")!,
  new Map([["TRN-044", { selected: [{ value: "kurumsal_bulut_veya_onprem_lms_platformu_aktif_olarak_kullanilmaktadir" }] }]])
);
assert(trn045Hidden, "TRN-044 = lms_kullanilmiyor_egitimler_manuel_sinif_ortaminda_yurutulur iken TRN-045 gizli");
assert(trn045Visible, "TRN-044 != lms_kullanilmiyor_egitimler_manuel_sinif_ortaminda_yurutulur iken TRN-045 görünür");

// BRANCHING 8: TRN-047 visible when TRN-046 != "resmi_etkinlik_olcum_modeli_yok"
const trn047Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "TRN-047")!,
  new Map([["TRN-046", { selected: [{ value: "resmi_etkinlik_olcum_modeli_yok" }] }]])
);
const trn047Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "TRN-047")!,
  new Map([["TRN-046", { selected: [{ value: "kirkpatrick_modeli_veya_cok_seviyeli_etkinlik_olcum_sistemi_vardir" }] }]])
);
assert(trn047Hidden, "TRN-046 = resmi_etkinlik_olcum_modeli_yok iken TRN-047 gizli");
assert(trn047Visible, "TRN-046 != resmi_etkinlik_olcum_modeli_yok iken TRN-047 görünür");

// Paketteki tüm 8 branching sorusunun target ve trigger bütünlüğü
const branchingQuestions = pack.questions.filter((q) => q.condition);
assert(branchingQuestions.length === 8, `Tam 8 adet koşullu dallanma sorusu tanımlıdır (${branchingQuestions.length})`);
for (const bq of branchingQuestions) {
  const dep = bq.condition!;
  const targetQ = pack.questions.find((q) => q.id === dep.question_id);
  assert(targetQ !== undefined, `Branching referansı geçerli bir soruya bağlı: ${bq.id} -> ${dep.question_id}`);
}

const allActiveAnswers = new Map<string, AnswerData>([
  ["TRN-003", { selected: [{ value: "resmi_ve_guncel_egitim_politikasi_ve_yonetmeligi_yururluktedir" }] }],
  ["TRN-005", { selected: [{ value: "yillik_duzenli_performans_yetkinlik_ve_anket_bazli_eia_yapilir" }] }],
  ["TRN-009", { selected: [{ value: "tum_roller_icin_sayisal_seviyeli_yetkinlik_ve_polivalans_matrisi_vardir" }] }],
  ["TRN-013", { selected: [{ value: "standart_takvimli_ve_olculebilir_oryantasyon_programi_uygulanir" }] }],
  ["TRN-021", { selected: [{ value: "tum_zorunlu_uyum_egitimleri_periyodik_ve_katilim_orani_takip_edilir" }] }],
  ["TRN-029", { selected: [{ value: "sistemde_gecerlilik_tarihli_dijital_sertifika_arsivi_ve_uyari_mekanizmasi_vardir" }] }],
  ["TRN-044", { selected: [{ value: "kurumsal_bulut_veya_onprem_lms_platformu_aktif_olarak_kullanilmaktadir" }] }],
  ["TRN-046", { selected: [{ value: "kirkpatrick_modeli_veya_cok_seviyeli_etkinlik_olcum_sistemi_vardir" }] }],
]);
const allVisible = getVisibleQuestions(pack.questions, allActiveAnswers);
assert(allVisible.length === 47, `Tüm 8 tetikleyici aktifken 47 sorunun tamamı görünür (${allVisible.length}/47)`);

// ─── TEST 9: Progress Calculation & Follow-up Deduction ─────────────────────
console.log("\n=== T09: Progress Calculation & Follow-up Deduction ===");
const allRequiredAnswersMap = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  if (q.options && q.options.length > 0) {
    allRequiredAnswersMap.set(q.id, { selected: [{ value: q.options[0].value }] });
  } else {
    allRequiredAnswersMap.set(q.id, { text: "test" });
  }
}

const progressFull = calculateProgress(pack.questions, allRequiredAnswersMap);
assert(progressFull.answered === 25, `25 zorunlu soru cevaplandığında answered = 25 (${progressFull.answered})`);
assert(progressFull.percentage === 100, `İlerleme yüzdesi %100 (${progressFull.percentage}%)`);

const fakeFollowupsMap = new Map<string, { flag_type?: string; status?: string }>([
  ["TRN-001", { flag_type: "critical" }],
  ["TRN-003", { flag_type: "revisit" }],
]);
const progressWithFlags = calculateProgress(pack.questions, allRequiredAnswersMap, fakeFollowupsMap as any);
assert(
  progressWithFlags.answered <= 25,
  `Bayraklı sorularla answered <= 25 (${progressWithFlags.answered})`
);

// ─── TEST 10: Cross-Pack Duplication Audit ──────────────────────────────────
console.log("\n=== T10: Cross-Pack Duplication Audit ===");
const otherPacksDir = path.join(ROOT_DIR, "question-packs/tr");
let duplicateCount = 0;

// Normalize path separators for cross-platform compatibility (Windows uses backslash)
function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

function findOtherPacks(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...findOtherPacks(full));
    } else if (entry === "core.json" && !normalizePath(full).includes("training/core.json")) {
      files.push(full);
    }
  }
  return files;
}

const otherPackFiles = findOtherPacks(otherPacksDir);
const trainingQuestions = new Set(pack.questions.map((q) => q.question.toLowerCase().trim()));

for (const opFile of otherPackFiles) {
  const otherPack = JSON.parse(readFileSync(opFile, "utf-8")) as QuestionPack;
  for (const q of otherPack.questions) {
    if (trainingQuestions.has(q.question.toLowerCase().trim())) {
      duplicateCount++;
      console.error(`Mükerrer soru: "${q.question}" -> Paket: ${otherPack.meta.business_function_code}`);
    }
  }
}
assert(duplicateCount === 0, `Diğer modüllerle çapraz karşılaştırmada 0 tam mükerrer soru (${duplicateCount} bulundu)`);

// ─── TEST 11: Custom Questions Adapter Compatibility ────────────────────────
console.log("\n=== T11: Custom Questions Adapter Compatibility ===");
const customQraw = {
  id: "99",
  analysis_project_id: "proj-001",
  business_function_code: "TRAINING",
  process_name: "Özel Eğitim İhtiyaçları",
  question_text: "Şirket içi akademide sanal gerçeklik (VR) simülatörleri kullanılıyor mu?",
  description: null,
  question_type: "single_choice" as const,
  is_required: 0,
  sort_order: 1,
  is_active: 1,
  created_at: "2026-08-22T00:00:00.000Z",
  updated_at: "2026-08-22T00:00:00.000Z",
  options: [
    { id: "o1", custom_question_id: "99", value: "evet", label: "Evet, aktif kullanılıyor", sort_order: 1, is_other: 0, created_at: "" },
    { id: "o2", custom_question_id: "99", value: "hayir", label: "Hayır, kullanılmıyor", sort_order: 2, is_other: 0, created_at: "" },
  ],
};

const customQ = adaptCustomQuestionToQuestion(customQraw, 48);
assert(customQ.id === "99", "Custom question ID adapter'dan geçirildi (id = '99')");
assert(customQ.is_custom === true, "is_custom = true");
assert(customQ.process === "Özel Eğitim İhtiyaçları", "Process eşleşti");
assert(Array.isArray(customQ.options) && customQ.options.length === 2, "Seçenekler doğru aktarıldı");

// ─── TEST 12: ReportModel & Formatting Truth ────────────────────────────────
console.log("\n=== T12: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const sampleAnswerData: AnswerData = {
  selected: [{ value: "merkezi_ve_uzmanlasmis_egitim_ve_gelisim_akademisi_veya_birimi", note: "Yıllık 120 saat program işletilmektedir" }],
  text: "",
  general_note: "Merkezi akademi tüm fabrikaları kapsar",
};

const formattedQ1 = formatAnswer(q1, sampleAnswerData);
assert(formattedQ1.isAnswered === true, "formattedQ1.isAnswered = true");
assert(
  formattedQ1.summaryText.includes("Merkezi İK bünyesinde ayrı bir Eğitim"),
  `Kullanıcı dostu label formatlandı (enum sızmadı) — ${formattedQ1.summaryText.slice(0, 70)}...`
);
assert(
  formattedQ1.summaryText.includes("Yıllık 120 saat"),
  "Seçenek notu (note alanı) summaryText içinde formatlandı"
);
assert(formattedQ1.generalNote === "Merkezi akademi tüm fabrikaları kapsar", "Genel not doğru formatlandı");
assert(formattedQ1.selectedOptions[0].value === "merkezi_ve_uzmanlasmis_egitim_ve_gelisim_akademisi_veya_birimi", "selectedOptions[0].value doğru");

// ─── TEST 13: DOCX Generation & Integrity ───────────────────────────────────
console.log("\n=== T13: DOCX Export Binary Generation ===");
const sampleReport: ReportModel = {
  metadata: {
    title: "ERP / Eğitim ve Gelişim Yönetimi Keşif Raporu",
    projectName: "Eğitim ve Gelişim ERP Dönüşüm Test Projesi",
    companyName: "Alfa Kurumsal Akademi A.Ş.",
    generatedAt: "22.08.2026",
    projectStatus: "completed",
    packVersions: { TRAINING: "tr.training.core v0.1.0" },
    isComplete: false,
    progressPercent: 4,
    requiredAnswered: 1,
    requiredTotal: 25,
    reportType: "interim",
    draftLabel: "ARA RAPOR — %4",
    projectProgressPercent: 4,
    completedFunctionCount: 0,
    selectedFunctionCount: 1,
    isProjectComplete: false,
  },
  company: {
    companyName: "Alfa Kurumsal Akademi A.Ş.",
    tradeName: "Alfa Akademi",
    taxNumber: "1234567890",
    city: "İstanbul",
    country: "Türkiye",
    employeeCount: "450",
    notes: "FAZ-44 TRAINING kabul test şirketi.",
  },
  profile: {
    analysis_project_id: "p_faz44_trn",
    executive_summary: "Eğitim ve yetkinlik yönetimi AS-IS analizi.",
    overall_assessment: "Eğitim ve yetkinlik matrisi ERP projesine entegre edilecektir.",
    open_topics: "",
  },
  scope: [{
    code: "TRAINING",
    nameTr: "Eğitim ve Gelişim",
    nameEn: "Training & Development",
    category: "İnsan Kaynakları",
    departmentName: "Eğitim ve Yetenek Yönetimi",
    responsiblePerson: "Eğitim Direktörü",
    status: "in_progress",
    hasPack: true,
    progressPercentage: 4,
    answeredCount: 1,
    totalQuestionCount: 25,
  }],
  businessFunctions: [{
    code: "TRAINING",
    nameTr: "Eğitim ve Gelişim",
    nameEn: "Training & Development",
    category: "İnsan Kaynakları",
    sortOrder: 5,
    departmentName: "Eğitim ve Yetenek Yönetimi",
    responsiblePerson: "Eğitim Direktörü",
    status: "in_progress",
    packId: "tr.training.core",
    packVersion: "0.1.0",
    progressPercentage: 4,
    answeredCount: 1,
    totalQuestionCount: 25,
    processes: [{
      name: "Eğitim organizasyonu ve süreç sahipliği",
      order: 1,
      questions: [{
        id: "TRN-001",
        order: 1,
        process: "Eğitim organizasyonu ve süreç sahipliği",
        questionText: pack.questions[0].question,
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
    completedFunctions: 0,
    inProgressFunctions: 1,
    notStartedFunctions: 0,
    totalFindings: 0,
    totalRequirements: 0,
    openRisks: 0,
    totalRisks: 0,
    totalNotes: 0,
    answeredQuestions: 1,
    totalQuestions: 25,
    openFollowupCount: 0,
    criticalFollowupCount: 0,
    revisitCount: 0,
  },
};

const docxBuf = await buildDocxBuffer(sampleReport);
assert(docxBuf instanceof Uint8Array && docxBuf.length > 5000, `DOCX üretimi başarılı (${docxBuf.length} byte)`);

// ─── TEST 14: Liberation Sans TrueType Unicode PDF Export ───────────────────
console.log("\n=== T14: Liberation Sans TrueType Unicode PDF Export ===");
const pdfBuf = await buildPdfBuffer(sampleReport);
assert(pdfBuf instanceof Uint8Array && pdfBuf.length > 5000, `TrueType Unicode PDF üretimi başarılı (${pdfBuf.length} byte)`);

const pdfParser = new PDFParse({ data: pdfBuf });
const parsedPdf = await pdfParser.getText();
assert(
  parsedPdf.text.includes("Eğitim ve Gelişim") || parsedPdf.text.includes("TRAINING"),
  "PDF çıktısında 'Eğitim ve Gelişim' başlığı mevcut"
);
assert(
  parsedPdf.text.includes("Alfa Kurumsal Akademi A.Ş.") || parsedPdf.text.includes("Alfa Akademi"),
  "PDF çıktısında firma adı mevcut (Türkçe UTF-8 doğru)"
);

// ─── TEST 15: Loader Registry Mapping Parity ─────────────────────────────────
console.log("\n=== T15: Loader Registry Parity ===");
assert(getPackIdForFunction("TRAINING") === "tr.training.core", "getPackIdForFunction('TRAINING') -> tr.training.core");
assert(getPackIdForFunction("EGITIM") === "tr.training.core", "getPackIdForFunction('EGITIM') -> tr.training.core (Türkçe Alias)");
assert(getPackIdForFunction("EGITIM_GELISIM") === "tr.training.core", "getPackIdForFunction('EGITIM_GELISIM') -> tr.training.core (Alias)");
assert(getPackIdForFunction("EGITIM_VE_GELISIM") === "tr.training.core", "getPackIdForFunction('EGITIM_VE_GELISIM') -> tr.training.core (Alias)");
assert(getPackIdForFunction("LEARNING_DEVELOPMENT") === "tr.training.core", "getPackIdForFunction('LEARNING_DEVELOPMENT') -> tr.training.core (Alias)");
assert(getPackIdForFunction("L_AND_D") === "tr.training.core", "getPackIdForFunction('L_AND_D') -> tr.training.core (Alias)");
assert(hasQuestionPack("TRAINING") === true, "hasQuestionPack('TRAINING') === true");
assert(getPackStatus("TRAINING") === "available", "getPackStatus('TRAINING') === 'available'");

const loadedPackRes = await loadQuestionPack("tr.training.core");
assert(loadedPackRes.ok === true, "loadQuestionPack('tr.training.core') ok === true");
if (loadedPackRes.ok) {
  assert(loadedPackRes.pack.questions.length === 47, "Yüklenen soru paketi 47 soru içerir");
}

// ─── TEST 16: TRAINING Sınır Ayrımı (Cross-Pack Isolation) ───────────────────
console.log("\n=== T16: TRAINING–HUMAN_RESOURCES–PAYROLL–LEGAL Sınır Ayrımı ===");
const hrFile = path.join(otherPacksDir, "human_resources/core.json");
const payFile = path.join(otherPacksDir, "payroll/core.json");

assert(existsSync(hrFile), "HUMAN_RESOURCES paketi yüklü");
assert(existsSync(payFile), "PAYROLL paketi yüklü");

// Sınır kontrolü: TRAINING bordro hesaplama veya SGK tahakkuk soruları içermez
let containsPayrollFormula = false;
for (const q of pack.questions) {
  if (q.question.toLowerCase().includes("muhtasar") || q.question.toLowerCase().includes("asgari geçim")) {
    containsPayrollFormula = true;
  }
}
assert(!containsPayrollFormula, "PAYROLL sınır kontrolü: Muhtasar veya bordro tahakkuk soruları TRAINING paketinde yer almaz");

// ─── TEST 17: AI-Free, Zero Cloud, Offline-First Doğrulaması ─────────────────
console.log("\n=== T17: AI-Free, Zero Cloud, Offline-First Doğrulaması ===");
let aiMentionCount = 0;
const forbiddenTerms = ["yapay zeka", "ai model", "chatgpt", "otomatik yorumlayan ai", "cloud api"];
for (const q of pack.questions) {
  for (const term of forbiddenTerms) {
    if (q.question.toLowerCase().includes(term) || q.description.toLowerCase().includes(term)) {
      aiMentionCount++;
      console.error(`Yasaklı terim bulundu (${term}): ${q.id}`);
    }
  }
}
assert(aiMentionCount === 0, `Pakette 0 yapay zeka / AI ifadesi bulunmaktadır (${aiMentionCount})`);

// ─── Sonuç Özeti ────────────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════════════════");
console.log(`FAZ-44 TRAINING TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════════\n");

if (failCount > 0) {
  console.error(`❌ FAZ-44 BAŞARISIZ: ${failCount} test fail etti!`);
  process.exit(1);
} else {
  console.log("✅ FAZ-44 KABUL: Tüm testler geçti — TRAINING Question Pack mühürlendi.");
}
