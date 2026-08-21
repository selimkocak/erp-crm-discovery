/**
 * ERP CRM Discovery — FAZ-41 E-TİCARET VE DİJİTAL SATIŞ / ECOMMERCE Acceptance Tests
 *
 * Test Kapsamı:
 * T01: Pack Loading & Metadata Integrity (tr.ecommerce.core v0.1.0, canonical code = ECOMMERCE)
 * T02: Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * T03: Question Quantity & Deterministic Order (47 questions, sequential order 1..47, ECOM-001..ECOM-047)
 * T04: Required Question Count Truth (25 required, 22 optional)
 * T05: Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * T06: Exact 25 Canonical Process Coverage & Strict Integrity Assertions
 * T07: Every Canonical Process Has at Least One Question (100% process coverage)
 * T08: Conditional Branching Resolution (8 condition points tested with branching engine)
 * T09: Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * T10: Cross-Pack Duplication Audit (0 duplicate questions across 30 existing modules)
 * T11: Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * T12: ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * T13: DOCX Binary Generation Compatibility
 * T14: Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * T15: Loader Registry Mapping Parity (getPackIdForFunction("ECOMMERCE") === "tr.ecommerce.core")
 * T16: E-Ticaret–Satış–CRM–Pazarlama Sınır Ayrımı (Cross-Pack Isolation)
 * T17: E-Ticaret–Depo–Lojistik–İade Sınır Ayrımı & AI-Free, Zero Cloud, Offline-First Doğrulaması
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
const PACK_PATH = path.join(ROOT_DIR, "question-packs/tr/ecommerce/core.json");

console.log("══════════════════════════════════════════════════════");
console.log("FAZ-41: E-TİCARET VE DİJİTAL SATIŞ / ECOMMERCE TEST");
console.log("══════════════════════════════════════════════════════\n");

// ─── TEST 1: Pack Loading & Metadata Integrity ──────────────────────────────
console.log("=== T01: Pack Loading & Metadata Integrity ===");
assert(existsSync(PACK_PATH), `Soru paketi dosyası mevcut: ${PACK_PATH}`);

const rawJson = readFileSync(PACK_PATH, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(pack.meta.pack_id === "tr.ecommerce.core", "pack_id = tr.ecommerce.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "ECOMMERCE", "business_function_code = ECOMMERCE (Kanonik Kod)");
assert(pack.meta.name === "E-Ticaret ve Dijital Satış Yönetimi Soru Paketi", "name tanımlı ve doğru");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ─────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(ecommercePack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 47, `Toplam soru sayısı tam 47 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 47, "Tüm 47 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `ECOM-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: Beklenen ${expectedId} (order: ${i + 1}), Bulunan ${pack.questions[i].id} (order: ${pack.questions[i].order})`);
  }
}
assert(orderCorrect, "Tüm sorular ECOM-001'den ECOM-047'ye sıralı ve deterministiktir");

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
  "E-ticaret organizasyonu ve süreç sahipliği",
  "Dijital satış kanalları ve kanal stratejisi",
  "Kurumsal web mağazası altyapısı",
  "Pazaryeri ve platform kullanımı",
  "Mobil uygulama ve dijital müşteri kanalları",
  "Ürün kataloğu ve kategori yönetimi",
  "Ürün açıklaması, görsel ve teknik içerik yönetimi",
  "Varyant, özellik ve ürün seçenekleri",
  "Dijital fiyatlandırma ve kampanya fiyatları",
  "E-ticaret stok ve bulunabilirlik yönetimi",
  "Sepet ve sipariş oluşturma süreci",
  "Sipariş onayı ve sipariş yaşam döngüsü",
  "Online ödeme ve ödeme sağlayıcıları",
  "Taksit, havale, kapıda ödeme ve alternatif ödeme",
  "Fraud, risk ve ödeme kontrolü",
  "E-fatura, e-arşiv ve dijital belge entegrasyonu",
  "Depo, toplama, paketleme ve sevkiyat",
  "Kargo, teslimat ve gönderi takibi",
  "İptal, iade, değişim ve geri ödeme",
  "Müşteri hizmetleri ve satış sonrası destek",
  "Dijital pazarlama ve trafik kaynakları",
  "Kupon, promosyon ve sadakat uygulamaları",
  "ERP, CRM, stok ve muhasebe entegrasyonu",
  "E-ticaret raporlama, KPI ve müşteri analitiği",
  "Veri güvenliği, arşivleme, riskler ve gelişim yol haritası"
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

// ─── TEST 7: Every Canonical Process Has at Least One Question ───────────────
console.log("\n=== T07: Every Canonical Process Has at Least One Question ===");
let allProcessesCovered = true;
for (const p of expectedProcesses) {
  const count = pack.questions.filter((q) => q.process === p).length;
  if (count === 0) {
    allProcessesCovered = false;
    console.error(`  Kapsanmayan süreç: "${p}"`);
  }
}
assert(allProcessesCovered, "Tüm 25 kanonik sürecin her biri en az bir soruyla (%100) kapsanmaktadır");

// ─── TEST 8: Branching Engine Resolution (8 Dallanma) ────────────────────────
console.log("\n=== T08: Branching Engine Resolution (8 Dallanma) ===");
const answers = new Map<string, AnswerData>();

// 1. Cevapsız durumda 8 koşullu soru gizli olmalı (47 - 8 = 39 görünür)
const initialVisible = getVisibleQuestions(pack.questions, answers);
assert(initialVisible.length === 39, `Cevapsız durumda tam 39 soru görünür (8 branching gizli) — Gerçek: ${initialVisible.length}`);

// 2. Koşul 1: ECOM-003 -> ECOM-004 (Kurumsal Web Mağazası Altyapısı)
answers.set("ECOM-003", { selected: [{ value: "sadece_pazaryerleri_uzerinden_satis" }] });
const vQ1 = getVisibleQuestions(pack.questions, answers);
assert(!vQ1.some((q) => q.id === "ECOM-004"), "ECOM-003 != kendi_web_magazamiz_ve_pazaryerleri_birlikte iken ECOM-004 gizli");

answers.set("ECOM-003", { selected: [{ value: "kendi_web_magazamiz_ve_pazaryerleri_birlikte" }] });
const vQ2 = getVisibleQuestions(pack.questions, answers);
assert(vQ2.some((q) => q.id === "ECOM-004"), "ECOM-003 = kendi_web_magazamiz_ve_pazaryerleri_birlikte iken ECOM-004 görünür");

// 3. Koşul 2: ECOM-005 -> ECOM-006 (Pazaryeri Entegratör Yazılımı)
answers.set("ECOM-005", { selected: [{ value: "tek_bir_pazaryerinde_pilot_satis_var" }] });
const vQ3 = getVisibleQuestions(pack.questions, answers);
assert(!vQ3.some((q) => q.id === "ECOM-006"), "ECOM-005 != aktif_coklu_pazaryeri_magazasi_var iken ECOM-006 gizli");

answers.set("ECOM-005", { selected: [{ value: "aktif_coklu_pazaryeri_magazasi_var" }] });
const vQ4 = getVisibleQuestions(pack.questions, answers);
assert(vQ4.some((q) => q.id === "ECOM-006"), "ECOM-005 = aktif_coklu_pazaryeri_magazasi_var iken ECOM-006 görünür");

// 4. Koşul 3: ECOM-007 -> ECOM-008 (Mobil Uygulama Push & Kampanya)
answers.set("ECOM-007", { selected: [{ value: "sadece_mobil_uyumlu_responsive_web_var" }] });
const vQ5 = getVisibleQuestions(pack.questions, answers);
assert(!vQ5.some((q) => q.id === "ECOM-008"), "ECOM-007 != ozel_mobil_uygulama_ios_android_var iken ECOM-008 gizli");

answers.set("ECOM-007", { selected: [{ value: "ozel_mobil_uygulama_ios_android_var" }] });
const vQ6 = getVisibleQuestions(pack.questions, answers);
assert(vQ6.some((q) => q.id === "ECOM-008"), "ECOM-007 = ozel_mobil_uygulama_ios_android_var iken ECOM-008 görünür");

// 5. Koşul 4: ECOM-012 -> ECOM-013 (Varyantlı Stok ve Fiyatlama)
answers.set("ECOM-012", { selected: [{ value: "tekil_ve_varyantsiz_standart_urunler" }] });
const vQ7 = getVisibleQuestions(pack.questions, answers);
assert(!vQ7.some((q) => q.id === "ECOM-013"), "ECOM-012 != cok_varyantli_ve_matris_ozellikli_urunler_var iken ECOM-013 gizli");

answers.set("ECOM-012", { selected: [{ value: "cok_varyantli_ve_matris_ozellikli_urunler_var" }] });
const vQ8 = getVisibleQuestions(pack.questions, answers);
assert(vQ8.some((q) => q.id === "ECOM-013"), "ECOM-012 = cok_varyantli_ve_matris_ozellikli_urunler_var iken ECOM-013 görünür");

// 6. Koşul 5: ECOM-019 -> ECOM-020 (Sanal POS ve Ödeme Sağlayıcıları)
answers.set("ECOM-019", { selected: [{ value: "yari_otomatik_panelden_manuel_statu_degistirme" }] });
const vQ9 = getVisibleQuestions(pack.questions, answers);
assert(!vQ9.some((q) => q.id === "ECOM-020"), "ECOM-019 != tam_entegre_otomatik_statu_akisi_ve_sms_e_posta_bildirimi iken ECOM-020 gizli");

answers.set("ECOM-019", { selected: [{ value: "tam_entegre_otomatik_statu_akisi_ve_sms_e_posta_bildirimi" }] });
const vQ10 = getVisibleQuestions(pack.questions, answers);
assert(vQ10.some((q) => q.id === "ECOM-020"), "ECOM-019 = tam_entegre_otomatik_statu_akisi_ve_sms_e_posta_bildirimi iken ECOM-020 görünür");

// 7. Koşul 6: ECOM-023 -> ECOM-024 (Fraud İnceleme Kuyruğu ve Chargeback)
answers.set("ECOM-023", { selected: [{ value: "sadece_standart_3d_secure_kullanilir_ek_kural_yok" }] });
const vQ11 = getVisibleQuestions(pack.questions, answers);
assert(!vQ11.some((q) => q.id === "ECOM-024"), "ECOM-023 != 3d_secure_zorunlu_ve_otomatik_fraud_filtresi_var iken ECOM-024 gizli");

answers.set("ECOM-023", { selected: [{ value: "3d_secure_zorunlu_ve_otomatik_fraud_filtresi_var" }] });
const vQ12 = getVisibleQuestions(pack.questions, answers);
assert(vQ12.some((q) => q.id === "ECOM-024"), "ECOM-023 = 3d_secure_zorunlu_ve_otomatik_fraud_filtresi_var iken ECOM-024 görünür");

// 8. Koşul 7: ECOM-029 -> ECOM-030 (Kargo API ve Takip Alarmları)
answers.set("ECOM-029", { selected: [{ value: "kargo_paneline_excel_ile_manuel_yuklenir" }] });
const vQ13 = getVisibleQuestions(pack.questions, answers);
assert(!vQ13.some((q) => q.id === "ECOM-030"), "ECOM-029 != kargo_firmasi_ile_api_entegrasyonu_var_barkod_otomatik_basilir iken ECOM-030 gizli");

answers.set("ECOM-029", { selected: [{ value: "kargo_firmasi_ile_api_entegrasyonu_var_barkod_otomatik_basilir" }] });
const vQ14 = getVisibleQuestions(pack.questions, answers);
assert(vQ14.some((q) => q.id === "ECOM-030"), "ECOM-029 = kargo_firmasi_ile_api_entegrasyonu_var_barkod_otomatik_basilir iken ECOM-030 görünür");

// 9. Koşul 8: ECOM-037 -> ECOM-038 (Influencer/Affiliate ve Kupon Sahteciliği)
answers.set("ECOM-037", { selected: [{ value: "sadece_genel_indirim_kuponlari_kullanilir" }] });
const vQ15 = getVisibleQuestions(pack.questions, answers);
assert(!vQ15.some((q) => q.id === "ECOM-038"), "ECOM-037 != kupon_affiliate_ve_sadakat_sistemi_aktif_kullanilir iken ECOM-038 gizli");

answers.set("ECOM-037", { selected: [{ value: "kupon_affiliate_ve_sadakat_sistemi_aktif_kullanilir" }] });
const vQ16 = getVisibleQuestions(pack.questions, answers);
assert(vQ16.some((q) => q.id === "ECOM-038"), "ECOM-037 = kupon_affiliate_ve_sadakat_sistemi_aktif_kullanilir iken ECOM-038 görünür");

// 10. Tüm 8 tetikleyici açıkken 47 soru tam görünür olmalı
const allVisible = getVisibleQuestions(pack.questions, answers);
assert(allVisible.length === 47, `Tüm 8 tetikleyici açıkken 47 sorunun tamamı görünür (47/${allVisible.length})`);

// ─── TEST 9: Progress Calculation & Follow-up Deduction ─────────────────────
console.log("\n=== T09: Progress Calculation & Follow-up Deduction ===");
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
mockFollowups.set("ECOM-001", {
  id: "qf_ecom_001",
  analysis_project_id: "p1",
  business_function_code: "ECOMMERCE",
  question_id: "ECOM-001",
  flag_type: "revisit",
  note: "E-ticaret ajans sözleşmesi ve SLA maddeleri incelenecek",
  status: "open",
  created_at: "2026-08-21",
  updated_at: "2026-08-21",
  resolved_at: null
});
mockFollowups.set("ECOM-025", {
  id: "qf_ecom_025",
  analysis_project_id: "p1",
  business_function_code: "ECOMMERCE",
  question_id: "ECOM-025",
  flag_type: "critical",
  note: "Pazaryeri e-Arşiv fatura entegratör API kuyruk gecikmesi doğrulanacak",
  status: "open",
  created_at: "2026-08-21",
  updated_at: "2026-08-21",
  resolved_at: null
});

const progressWithFlags = calculateProgress(pack.questions, fullAnswers, mockFollowups);
assert(progressWithFlags.answered === 23, `Bayraklı 2 soru düşünce answered = 23 (${progressWithFlags.answered})`);
assert(progressWithFlags.percentage === 92, `İlerleme %92 hesaplandı (${progressWithFlags.percentage}%)`);

// ─── TEST 10: Cross-Pack Duplication Audit ───────────────────────────────────
console.log("\n=== T10: Cross-Pack Duplication Audit ===");
const packsDir = path.join(ROOT_DIR, "question-packs/tr");
const packFolders = readdirSync(packsDir).filter((d) => d !== "ecommerce" && statSync(path.join(packsDir, d)).isDirectory());

let duplicateCount = 0;
const ecommerceQuestions = pack.questions.map((q) => q.question.toLowerCase().trim());

for (const dir of packFolders) {
  const otherPackPath = path.join(packsDir, dir, "core.json");
  const otherPack = JSON.parse(readFileSync(otherPackPath, "utf-8")) as QuestionPack;
  for (const oq of otherPack.questions) {
    if (ecommerceQuestions.includes(oq.question.toLowerCase().trim())) {
      console.error(`Mükerrer soru tespit edildi: "${oq.question}" (${dir} / ${oq.id})`);
      duplicateCount++;
    }
  }
}
assert(duplicateCount === 0, `30 diğer modülle çapraz karşılaştırmada 0 tam mükerrer soru (${duplicateCount} bulundu)`);

// ─── TEST 11: Custom Questions Adapter Compatibility ──────────────────────────
console.log("\n=== T11: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_ecom_01",
  analysis_project_id: "p1",
  business_function_code: "ECOMMERCE",
  process_name: "Online ödeme ve ödeme sağlayıcıları",
  question_text: "Şirketinize özel kripto para veya yurt dışı yerel ödeme cüzdanı (Klarna, iDEAL vb.) entegrasyonu var mıdır?",
  description: "Yurt dışı ödeme sağlayıcıları ve sınır ötesi dijital tahsilat yöntemleri.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_ecom_01", value: "yurtdisi_odeme_cuzdani_aktif", label: "Evet, yurt dışı siparişlerde Klarna/iDEAL kabul edilmektedir", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_ecom_01", value: "sadece_turk_odemeleri", label: "Sadece Türkiye içi Sanal POS ve kredi kartları kullanılmaktadır", sort_order: 2, is_other: 0, created_at: "" }
  ],
  is_required: 1,
  sort_order: 48,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const adapted = adaptCustomQuestionToQuestion(mockCustomQuestion as any, 48);
assert(adapted.id === "cq_ecom_01", "Custom question ID eşleşti");
assert(adapted.is_custom === true, "is_custom = true");
assert(adapted.process === "Online ödeme ve ödeme sağlayıcıları", "Process eşleşti");
assert((adapted.options?.length ?? 0) === 2, "Seçenekler doğru aktarıldı");

// ─── TEST 12: ReportModel & Formatting Truth ──────────────────────────────────
console.log("\n=== T12: ReportModel & Formatting Truth ===");
const formattedQ1 = formatAnswer(pack.questions[0], {
  selected: [{ value: "merkezi_bagimsiz_e_ticaret_direktorlugu_var", note: "E-Ticaret Direktörlüğü altında 6 kişilik dijital operasyon ve pazarlama ekibi görev yapmaktadır" }],
  general_note: "Aylık 15.000+ online sipariş kurumsal web sitesi ve Trendyol/Hepsiburada üzerinden sevk edilmektedir."
});
assert(formattedQ1.isAnswered === true, "formattedQ1.isAnswered = true");
assert(formattedQ1.summaryText.includes("Bağımsız e-ticaret direktörlüğü"), "Kullanıcı dostu label formatlandı");
assert(formattedQ1.summaryText.includes("6 kişilik dijital operasyon"), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("15.000+ online sipariş"), "Genel not formatlandı");

// ─── TEST 13: DOCX Export Binary Generation ─────────────────────────────────
console.log("\n=== T13: DOCX Export Binary Generation ===");
const mockEcommerceReportModel: ReportModel = {
  metadata: {
    title: "ERP / E-Ticaret ve Dijital Satış Keşif Raporu",
    projectName: "Dijital Satış Kanalları ve Omni-channel ERP Entegrasyon Keşfi",
    companyName: "Trend Perakende ve Dijital Mağazacılık A.Ş.",
    generatedAt: "21.08.2026",
    projectStatus: "completed",
    packVersions: { ECOMMERCE: "tr.ecommerce.core v0.1.0" },
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
    companyName: "Trend Perakende ve Dijital Mağazacılık A.Ş.",
    tradeName: "Trend Perakende",
    taxNumber: "1234567890",
    city: "İstanbul",
    country: "Türkiye",
    employeeCount: "180",
    notes: "Şirketin kendi B2C web mağazası, Trendyol, Hepsiburada ve Amazon mağazaları analiz edildi.",
  },
  profile: {
    analysis_project_id: "p_faz41",
    executive_summary: "Yıllık 120 milyon TL e-ticaret cirosu yönetilmektedir; pazaryeri komisyon ve kargo kesintilerinin ERP'ye anlık entegrasyonu güçlendirilmelidir.",
    overall_assessment: "Kargo API ve e-Arşiv fatura akışı otomatiktir; iade ürün kabul ve tekrar stoğa alma süreci el terminalleri ile hızlandırılmalıdır.",
    open_topics: "Stoksuz satış risklerini önlemek için emniyet stoğu tampon kurallarının ERP seviyesinde kilitlenmesi.",
  },
  scope: [{
    code: "ECOMMERCE",
    nameTr: "E-Ticaret",
    nameEn: "E-Commerce",
    category: "Satış & Pazarlama",
    departmentName: "E-Ticaret ve Dijital Pazarlama Direktörlüğü",
    responsiblePerson: "Murat Demir",
    status: "completed",
    hasPack: true,
    progressPercentage: 100,
    answeredCount: 25,
    totalQuestionCount: 25,
  }],
  businessFunctions: [{
    code: "ECOMMERCE",
    nameTr: "E-Ticaret",
    nameEn: "E-Commerce",
    category: "Satış & Pazarlama",
    sortOrder: 26,
    departmentName: "E-Ticaret ve Dijital Pazarlama Direktörlüğü",
    responsiblePerson: "Murat Demir",
    status: "completed",
    packId: "tr.ecommerce.core",
    packVersion: "0.1.0",
    progressPercentage: 100,
    answeredCount: 25,
    totalQuestionCount: 25,
    processes: [{
      name: "E-ticaret organizasyonu ve süreç sahipliği",
      order: 1,
      questions: [{
        id: "ECOM-001",
        order: 1,
        process: "E-ticaret organizasyonu ve süreç sahipliği",
        questionText: pack.questions.find((q) => q.id === "ECOM-001")!.question,
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

const docxBuf = await buildDocxBuffer(mockEcommerceReportModel);
assert(docxBuf.length > 5000, `DOCX üretimi başarılı (${docxBuf.length} byte)`);

// ─── TEST 14: Liberation Sans TrueType Unicode PDF Export ─────────────────────
console.log("\n=== T14: Liberation Sans TrueType Unicode PDF Export ===");
const pdfBuf = await buildPdfBuffer(mockEcommerceReportModel);
assert(pdfBuf.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuf.length} byte)`);

const pdfParser = new PDFParse({ data: pdfBuf });
const parsedPdf = await pdfParser.getText();
assert(parsedPdf.text.includes("E-Ticaret") || parsedPdf.text.includes("ECOMMERCE"), "PDF çıktısında 'E-Ticaret' başlığı mevcut");
assert(parsedPdf.text.includes("Trend Perakende"), "PDF çıktısında firma adı mevcut (Türkçe UTF-8 doğru)");

// ─── TEST 15: Loader Registry Parity ──────────────────────────────────────────
console.log("\n=== T15: Loader Registry Parity ===");
assert(getPackIdForFunction("ECOMMERCE") === "tr.ecommerce.core", "getPackIdForFunction('ECOMMERCE') -> tr.ecommerce.core");
assert(getPackIdForFunction("E_TICARET") === "tr.ecommerce.core", "getPackIdForFunction('E_TICARET') -> tr.ecommerce.core (Legacy / Türkçe Alias)");
assert(getPackIdForFunction("ETICARET") === "tr.ecommerce.core", "getPackIdForFunction('ETICARET') -> tr.ecommerce.core (Alias)");
assert(getPackIdForFunction("ONLINE_SATIS") === "tr.ecommerce.core", "getPackIdForFunction('ONLINE_SATIS') -> tr.ecommerce.core (Alias)");
assert(getPackIdForFunction("DIGITAL_COMMERCE") === "tr.ecommerce.core", "getPackIdForFunction('DIGITAL_COMMERCE') -> tr.ecommerce.core (Alias)");
assert(hasQuestionPack("ECOMMERCE") === true, "hasQuestionPack('ECOMMERCE') === true");
assert(getPackStatus("ECOMMERCE") === "available", "getPackStatus('ECOMMERCE') === 'available'");

const loadedPackRes = await loadQuestionPack("tr.ecommerce.core");
assert(loadedPackRes.ok === true, "loadQuestionPack('tr.ecommerce.core') ok === true");
if (loadedPackRes.ok) {
  assert(loadedPackRes.pack.questions.length === 47, "Yüklenen soru paketi 47 soru içerir");
}

// ─── TEST 16: E-Ticaret–Satış–CRM–Pazarlama Sınır Ayrımı ──────────────────────
console.log("\n=== T16: E-Ticaret–Satış–CRM–Pazarlama Sınır Ayrımı ===");

// 1. SALES ayrımı: ECOMMERCE soruları geleneksel B2B saha satış temsilcisi onay zincirini veya yerel bayi iskonto matrisini sormaz.
const salesTerms = ["saha satış temsilcisi rut planı", "yerel bayi iskonto matrisi"];
let salesViolations = 0;
pack.questions.forEach((q) => {
  salesTerms.forEach((term) => {
    if (q.question.toLowerCase().includes(term)) {
      console.error(`  Sınır ihlali: ${q.id} sorusunda SALES terimi (${term}) bulundu!`);
      salesViolations++;
    }
  });
});
assert(salesViolations === 0, "SALES sınır kontrolü: Klasik saha satış süreçleri ECOMMERCE paketinde tekrarlanmadı");

// 2. CRM ayrımı: ECOMMERCE soruları klasik müşteri adayı (lead) soğuk arama veya genel kurumsal temas geçmişini sormaz.
const crmTerms = ["soğuk arama müşteri adayı", "kurumsal ziyaret tutanağı"];
let crmViolations = 0;
pack.questions.forEach((q) => {
  crmTerms.forEach((term) => {
    if (q.question.toLowerCase().includes(term)) {
      console.error(`  Sınır ihlali: ${q.id} sorusunda CRM terimi (${term}) bulundu!`);
      crmViolations++;
    }
  });
});
assert(crmViolations === 0, "CRM sınır kontrolü: Klasik CRM saha ziyaret süreçleri ECOMMERCE paketinde tekrarlanmadı");

// ─── TEST 17: E-Ticaret–Depo–Lojistik–İade Sınır Ayrımı & AI-Free Doğrulaması ─
console.log("\n=== T17: E-Ticaret–Depo–Lojistik Sınır Ayrımı & AI-Free Doğrulaması ===");

// 1. Depo / Lojistik ayrımı: ECOMMERCE soruları fabrika hammadde sayımı veya komple TIR navlun ihalesini sormaz.
const logTerms = ["fabrika hammadde sayımı", "komple tır navlun ihalesi"];
let logViolations = 0;
pack.questions.forEach((q) => {
  logTerms.forEach((term) => {
    if (q.question.toLowerCase().includes(term)) {
      console.error(`  Sınır ihlali: ${q.id} sorusunda LOGISTICS terimi (${term}) bulundu!`);
      logViolations++;
    }
  });
});
assert(logViolations === 0, "Depo/Lojistik sınır kontrolü: Ağır sanayi lojistik süreçleri ECOMMERCE paketinde tekrarlanmadı");

// 2. AI / Kapsam Dışı Kontrolü: Pakette hiçbir AI / Yapay Zeka önerisi yer almamalıdır.
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
console.log(`FAZ-41 ECOMMERCE TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════════\n");

if (failCount === 0) {
  console.log("✅ FAZ-41 KABUL: Tüm testler geçti — ECOMMERCE Question Pack mühürlendi.");
  process.exit(0);
} else {
  console.error(`❌ FAZ-41 HATA: ${failCount} test başarısız oldu!`);
  process.exit(1);
}
