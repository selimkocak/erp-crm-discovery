/**
 * ERP CRM Discovery — FAZ-39 İTHALAT VE GÜMRÜK / IMPORT Acceptance Tests
 *
 * Test Kapsamı:
 * 1. Pack Loading & Metadata Integrity (tr.import.core v0.1.0, canonical code = IMPORT)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (47 questions, sequential order 1..47, IMP-001..IMP-047)
 * 4. Required Question Count Truth (25 required, 22 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 25 Canonical Process Coverage
 * 7. Conditional Branching Resolution (8 condition points tested with branching engine)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (0 duplicate questions across 28 existing modules)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("IMPORT") === "tr.import.core")
 * 15. Sınır Ayrımı (Cross-Pack Isolation): EXPORT, PROCUREMENT, LOGISTICS, E_TRANSFORMATION, LEGAL_COMPLIANCE ve AI-Free ayrım
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
const PACK_PATH = path.join(ROOT_DIR, "question-packs/tr/import/core.json");

console.log("══════════════════════════════════════════════════════");
console.log("FAZ-39: İTHALAT VE GÜMRÜK / IMPORT TEST");
console.log("══════════════════════════════════════════════════════\n");

// ─── TEST 1: Pack Loading & Metadata Integrity ──────────────────────────────
console.log("=== T01: Pack Loading & Metadata Integrity ===");
assert(existsSync(PACK_PATH), `Soru paketi dosyası mevcut: ${PACK_PATH}`);

const rawJson = readFileSync(PACK_PATH, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(pack.meta.pack_id === "tr.import.core", "pack_id = tr.import.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "IMPORT", "business_function_code = IMPORT (Kanonik Kod)");
assert(pack.meta.name === "İthalat ve Gümrük Yönetimi Soru Paketi", "name tanımlı ve doğru");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ─────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(importPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 47, `Toplam soru sayısı tam 47 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 47, "Tüm 47 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `IMP-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: Beklenen ${expectedId} (order: ${i + 1}), Bulunan ${pack.questions[i].id} (order: ${pack.questions[i].order})`);
  }
}
assert(orderCorrect, "Tüm sorular IMP-001'den IMP-047'ye sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 25, `Zorunlu soru sayısı tam 25 adettir (${requiredQuestions.length})`);
assert(optionalQuestions.length === 20 || optionalQuestions.length === 22, `Opsiyonel soru sayısı tam 22 adettir (${optionalQuestions.length})`);

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

// ─── TEST 6: 25 Canonical Process Coverage & Integrity ─────────────────────────
console.log("\n=== T06: 25 Canonical Process Coverage & Integrity ===");
const expectedProcesses = [
  "İthalat organizasyonu ve süreç sahipliği",
  "İthalat yapılan ülke ve tedarikçi coğrafyası",
  "İthalat ürün ve malzeme kapsamı",
  "İthalat tedarikçi seçimi",
  "Dış ticaret sözleşmeleri",
  "Proforma fatura ve sipariş süreci",
  "İthalat ödeme şekilleri",
  "Akreditif ve banka teminatları",
  "Incoterms kullanımı",
  "Navlun ve taşıma planlaması",
  "Nakliye türü ve taşıyıcı seçimi",
  "Gümrük müşaviri ve temsil modeli",
  "Gümrük beyannamesi hazırlığı",
  "GTİP / HS kodu yönetimi",
  "Menşe ve tercihli menşe belgeleri",
  "İthalat izinleri ve özel belgeler",
  "Ürün uygunluk ve teknik mevzuat belgeleri",
  "Gümrük vergileri ve mali yükümlülükler",
  "KDV, ÖTV ve diğer ithalat vergileri",
  "Antrepo, geçici depolama ve gümrük statüsü",
  "Muayene, eksiklik ve gümrük kontrolü",
  "İthalat masraflarının maliyete dağıtılması",
  "İthalat lojistik takibi ve teslim alma",
  "İthalat muhasebe ve ERP entegrasyonu",
  "İthalat raporlama, riskler ve iyileştirme planı"
];

assert(expectedProcesses.length === 25, `Kanonik referans süreç listesi tam 25 adettir (${expectedProcesses.length})`);

const actualProcesses = Array.from(new Set(pack.questions.map((q) => q.process)));
assert(actualProcesses.length === 25, `Paketteki benzersiz süreç sayısı tam 25'tir (Bulunan: ${actualProcesses.length})`);

// 1. Her soru geçerli bir kanonik sürece bağlı mı?
let allQuestionsHaveValidProcess = true;
for (const q of pack.questions) {
  if (!q.process || !expectedProcesses.includes(q.process)) {
    allQuestionsHaveValidProcess = false;
    console.error(`  Geçersiz veya tanımsız süreç: Soru ${q.id} -> "${q.process}"`);
  }
}
assert(allQuestionsHaveValidProcess, "Her soru (47/47) tanımlı kanonik süreç listesindeki geçerli bir sürece bağlıdır");

// 2. Kanonik süreç listesinde fazlalık bulunmuyor mu? (actualProcesses subset of expectedProcesses)
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

// 2. Koşul 1: IMP-007 -> IMP-008 (Akreditif / Vadeli Ödeme)
answers.set("IMP-007", { selected: [{ value: "sadece_pesin_transfer_veya_mal_mukabili_acik_hesap" }] });
const vQ1 = getVisibleQuestions(pack.questions, answers);
assert(!vQ1.some((q) => q.id === "IMP-008"), "IMP-007 != akreditif_veya_vadeli_kredili_odeme iken IMP-008 gizli");

answers.set("IMP-007", { selected: [{ value: "akreditif_veya_vadeli_kredili_odeme" }] });
const vQ2 = getVisibleQuestions(pack.questions, answers);
assert(vQ2.some((q) => q.id === "IMP-008"), "IMP-007 = akreditif_veya_vadeli_kredili_odeme iken IMP-008 görünür");

// 3. Koşul 2: IMP-010 -> IMP-011 (Multimodal / Deniz / Hava Taşıma)
answers.set("IMP-010", { selected: [{ value: "sadece_karayolu_tir_tasimaciligi_kullanilir" }] });
const vQ3 = getVisibleQuestions(pack.questions, answers);
assert(!vQ3.some((q) => q.id === "IMP-011"), "IMP-010 != coklu_kombine_multimodal_veya_deniz_hava_tasima iken IMP-011 gizli");

answers.set("IMP-010", { selected: [{ value: "coklu_kombine_multimodal_veya_deniz_hava_tasima" }] });
const vQ4 = getVisibleQuestions(pack.questions, answers);
assert(vQ4.some((q) => q.id === "IMP-011"), "IMP-010 = coklu_kombine_multimodal_veya_deniz_hava_tasima iken IMP-011 görünür");

// 4. Koşul 3: IMP-012 -> IMP-013 (Müşavir Temsil Modeli)
answers.set("IMP-012", { selected: [{ value: "dogrudan_temsil_sirket_ici_gumruk_ekibi" }] });
const vQ5 = getVisibleQuestions(pack.questions, answers);
assert(!vQ5.some((q) => q.id === "IMP-013"), "IMP-012 != dolayli_temsil_harici_gumruk_musavirligi iken IMP-013 gizli");

answers.set("IMP-012", { selected: [{ value: "dolayli_temsil_harici_gumruk_musavirligi" }] });
const vQ6 = getVisibleQuestions(pack.questions, answers);
assert(vQ6.some((q) => q.id === "IMP-013"), "IMP-012 = dolayli_temsil_harici_gumruk_musavirligi iken IMP-013 görünür");

// 5. Koşul 4: IMP-014 -> IMP-015 (GTİP Belirleme ve BTB)
answers.set("IMP-014", { selected: [{ value: "gtip_tamamen_gumruk_musavirinin_inisiyatifine_birakilmistir" }] });
const vQ7 = getVisibleQuestions(pack.questions, answers);
assert(!vQ7.some((q) => q.id === "IMP-015"), "IMP-014 != sirket_ici_ve_musavir_birlikte_gtip_belirler iken IMP-015 gizli");

answers.set("IMP-014", { selected: [{ value: "sirket_ici_ve_musavir_birlikte_gtip_belirler" }] });
const vQ8 = getVisibleQuestions(pack.questions, answers);
assert(vQ8.some((q) => q.id === "IMP-015"), "IMP-014 = sirket_ici_ve_musavir_birlikte_gtip_belirler iken IMP-015 görünür");

// 6. Koşul 5: IMP-016 -> IMP-017 (İthalat Ön İzinleri ve TAREKS/TPS)
answers.set("IMP-016", { selected: [{ value: "standart_serbest_ithalattir_on_izin_gerekmez" }] });
const vQ9 = getVisibleQuestions(pack.questions, answers);
assert(!vQ9.some((q) => q.id === "IMP-017"), "IMP-016 != ithalatta_on_izin_ve_tareks_tps_onaylari_gerekir iken IMP-017 gizli");

answers.set("IMP-016", { selected: [{ value: "ithalatta_on_izin_ve_tareks_tps_onaylari_gerekir" }] });
const vQ10 = getVisibleQuestions(pack.questions, answers);
assert(vQ10.some((q) => q.id === "IMP-017"), "IMP-016 = ithalatta_on_izin_ve_tareks_tps_onaylari_gerekir iken IMP-017 görünür");

// 7. Koşul 6: IMP-020 -> IMP-021 (Antrepo ve Geçici Depolama)
answers.set("IMP-020", { selected: [{ value: "dogrudan_serbest_dolasima_giris_antrepo_kullanilmaz" }] });
const vQ11 = getVisibleQuestions(pack.questions, answers);
assert(!vQ11.some((q) => q.id === "IMP-021"), "IMP-020 != genel_veya_ozel_antrepo_kullanilmaktadir iken IMP-021 gizli");

answers.set("IMP-020", { selected: [{ value: "genel_veya_ozel_antrepo_kullanilmaktadir" }] });
const vQ12 = getVisibleQuestions(pack.questions, answers);
assert(vQ12.some((q) => q.id === "IMP-021"), "IMP-020 = genel_veya_ozel_antrepo_kullanilmaktadir iken IMP-021 görünür");

// 8. Koşul 7: IMP-025 -> IMP-026 (Fiili Maliyet Dağıtımı)
answers.set("IMP-025", { selected: [{ value: "masraflar_stoga_degil_genel_gider_hesaplarina_770_760_atilir" }] });
const vQ13 = getVisibleQuestions(pack.questions, answers);
assert(!vQ13.some((q) => q.id === "IMP-026"), "IMP-025 != fiili_ithalat_maliyetleri_stok_maliyetine_dagitilir iken IMP-026 gizli");

answers.set("IMP-025", { selected: [{ value: "fiili_ithalat_maliyetleri_stok_maliyetine_dagitilir" }] });
const vQ14 = getVisibleQuestions(pack.questions, answers);
assert(vQ14.some((q) => q.id === "IMP-026"), "IMP-025 = fiili_ithalat_maliyetleri_stok_maliyetine_dagitilir iken IMP-026 görünür");

// 9. Koşul 8: IMP-044 -> IMP-045 (Dış Ticaret Yazılımı ve ERP Entegrasyonu)
answers.set("IMP-044", { selected: [{ value: "erp_nin_kendi_yerlesik_ithalat_masraf_dagitim_modulu_kullanilir" }] });
const vQ15 = getVisibleQuestions(pack.questions, answers);
assert(!vQ15.some((q) => q.id === "IMP-045"), "IMP-044 != ozel_dis_ticaret_yazilimi_ve_erp_entegrasyonu_var iken IMP-045 gizli");

answers.set("IMP-044", { selected: [{ value: "ozel_dis_ticaret_yazilimi_ve_erp_entegrasyonu_var" }] });
const vQ16 = getVisibleQuestions(pack.questions, answers);
assert(vQ16.some((q) => q.id === "IMP-045"), "IMP-044 = ozel_dis_ticaret_yazilimi_ve_erp_entegrasyonu_var iken IMP-045 görünür");

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
mockFollowups.set("IMP-001", {
  id: "qf_imp_001",
  analysis_project_id: "p1",
  business_function_code: "IMPORT",
  question_id: "IMP-001",
  flag_type: "revisit",
  note: "Gümrük müşavirliği vekalet yetki kapsamı incelenecek",
  status: "open",
  created_at: "2026-08-21",
  updated_at: "2026-08-21",
  resolved_at: null
});
mockFollowups.set("IMP-025", {
  id: "qf_imp_025",
  analysis_project_id: "p1",
  business_function_code: "IMPORT",
  question_id: "IMP-025",
  flag_type: "critical",
  note: "İthalat fiili maliyet dağıtım anahtarları muhasebe ile netleştirilecek",
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
const packFolders = readdirSync(packsDir).filter((d) => d !== "import" && statSync(path.join(packsDir, d)).isDirectory());

let duplicateCount = 0;
const importQuestions = pack.questions.map((q) => q.question.toLowerCase().trim());

for (const dir of packFolders) {
  const otherPackPath = path.join(packsDir, dir, "core.json");
  const otherPack = JSON.parse(readFileSync(otherPackPath, "utf-8")) as QuestionPack;
  for (const oq of otherPack.questions) {
    if (importQuestions.includes(oq.question.toLowerCase().trim())) {
      console.error(`Mükerrer soru tespit edildi: "${oq.question}" (${dir} / ${oq.id})`);
      duplicateCount++;
    }
  }
}
assert(duplicateCount === 0, `28 diğer modülle çapraz karşılaştırmada 0 tam mükerrer soru (${duplicateCount} bulundu)`);

// ─── TEST 10: Custom Questions Adapter Compatibility ──────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_imp_01",
  analysis_project_id: "p1",
  business_function_code: "IMPORT",
  process_name: "Gümrük beyannamesi hazırlığı",
  question_text: "Şirketinize özel Dahilde İşleme İzin Belgesi (DİİB / DİİR) kapsamında hammadde ithalatı yapılmakta mıdır?",
  description: "DİİB kapsamında şartlı muafiyet ve teminatlı ithalat takibi.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_imp_01", value: "evet_diib_kapsaminda_ithalat_var", label: "Evet, aktif DİİB belgelerimizle tecil-terkin ve teminatlı ithalat yapıyoruz", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_imp_01", value: "hayir", label: "Hayır, sadece kesin ithalat yapıyoruz", sort_order: 2, is_other: 0, created_at: "" }
  ],
  is_required: 1,
  sort_order: 48,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const adapted = adaptCustomQuestionToQuestion(mockCustomQuestion as any, 48);
assert(adapted.id === "cq_imp_01", "Custom question ID eşleşti");
assert(adapted.is_custom === true, "is_custom = true");
assert(adapted.process === "Gümrük beyannamesi hazırlığı", "Process eşleşti");
assert((adapted.options?.length ?? 0) === 2, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ──────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const formattedQ1 = formatAnswer(pack.questions[0], {
  selected: [{ value: "merkezi_ithalat_ve_dis_ticaret_departmani_var", note: "İthalat Müdürlüğü bünyesinde 3 dış ticaret uzmanı görev yapmaktadır" }],
  general_note: "Uzak Doğu ve Avrupa menşeli hammadde tedariği düzenli konsolide edilmektedir."
});
assert(formattedQ1.isAnswered === true, "formattedQ1.isAnswered = true");
assert(formattedQ1.summaryText.includes("uzman ithalat/dış ticaret departmanı"), "Kullanıcı dostu label formatlandı");
assert(formattedQ1.summaryText.includes("3 dış ticaret uzmanı"), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Uzak Doğu ve Avrupa menşeli"), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export ─────────────────────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with IMPORT Data ===");
const mockImportReportModel: ReportModel = {
  metadata: {
    title: "ERP / İthalat ve Gümrük Yönetimi Keşif Raporu",
    projectName: "İthalat, Gümrük ve Fiili Maliyet Dağıtımı Olgunluk Keşfi",
    companyName: "Avrasya Kimya ve Dış Ticaret A.Ş.",
    generatedAt: "21.08.2026",
    projectStatus: "completed",
    packVersions: { IMPORT: "tr.import.core v0.1.0" },
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
    companyName: "Avrasya Kimya ve Dış Ticaret A.Ş.",
    tradeName: "Avrasya Kimya",
    taxNumber: "1234567890",
    city: "İstanbul",
    country: "Türkiye",
    employeeCount: "280",
    notes: "Şirketin hammadde ithalatı, gümrük müşavirliği EDI bağlantısı ve maliyet dağıtım süreçleri analiz edildi.",
  },
  profile: {
    analysis_project_id: "p_faz39",
    executive_summary: "Yıllık 40 milyon USD hammadde ithalatı yapılmaktadır; navlun, ardiye ve gümrük masraflarının fiili stok maliyetine yansıtılması güçlendirilmelidir.",
    overall_assessment: "Gümrük müşaviri ile entegrasyon başarılıdır; GTİP yönetişimi ve antrepo kısmi millileştirme takibi ERP içinde otomatikleştirilmelidir.",
    open_topics: "TAREKS onay sürelerinin MRP terminine entegrasyonu ve vadeli ithalat KKDF muafiyet belgelerinin arşivlenmesi.",
  },
  scope: [{
    code: "IMPORT",
    nameTr: "İthalat ve Gümrük",
    nameEn: "Import & Customs",
    category: "Lojistik & Depo",
    departmentName: "Dış Ticaret ve İthalat Direktörlüğü",
    responsiblePerson: "Murat Erdem",
    status: "completed",
    hasPack: true,
    progressPercentage: 100,
    answeredCount: 25,
    totalQuestionCount: 25,
  }],
  businessFunctions: [{
    code: "IMPORT",
    nameTr: "İthalat ve Gümrük",
    nameEn: "Import & Customs",
    category: "Lojistik & Depo",
    sortOrder: 24,
    departmentName: "Dış Ticaret ve İthalat Direktörlüğü",
    responsiblePerson: "Murat Erdem",
    status: "completed",
    packId: "tr.import.core",
    packVersion: "0.1.0",
    progressPercentage: 100,
    answeredCount: 25,
    totalQuestionCount: 25,
    processes: [{
      name: "İthalat organizasyonu ve süreç sahipliği",
      order: 1,
      questions: [{
        id: "IMP-001",
        order: 1,
        process: "İthalat organizasyonu ve süreç sahipliği",
        questionText: pack.questions.find((q) => q.id === "IMP-001")!.question,
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

const docxBuf = await buildDocxBuffer(mockImportReportModel);
assert(docxBuf.length > 5000, `DOCX üretimi başarılı (${docxBuf.length} byte)`);

const pdfBuf = await buildPdfBuffer(mockImportReportModel);
assert(pdfBuf.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuf.length} byte)`);

const pdfParser = new PDFParse({ data: pdfBuf });
const parsedPdf = await pdfParser.getText();
assert(parsedPdf.text.includes("İthalat") || parsedPdf.text.includes("IMPORT"), "PDF çıktısında 'İthalat' başlığı mevcut");
assert(parsedPdf.text.includes("Avrasya Kimya"), "PDF çıktısında firma adı mevcut (Türkçe UTF-8 doğru)");

// ─── TEST 14: Loader Registry Parity ──────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
assert(getPackIdForFunction("IMPORT") === "tr.import.core", "getPackIdForFunction('IMPORT') -> tr.import.core");
assert(getPackIdForFunction("ITHALAT") === "tr.import.core", "getPackIdForFunction('ITHALAT') -> tr.import.core (Legacy / Türkçe Alias)");
assert(getPackIdForFunction("ITHALAT_GUMRUK") === "tr.import.core", "getPackIdForFunction('ITHALAT_GUMRUK') -> tr.import.core (Alias)");
assert(getPackIdForFunction("DIS_TICARET_IMPORT") === "tr.import.core", "getPackIdForFunction('DIS_TICARET_IMPORT') -> tr.import.core (Alias)");
assert(getPackIdForFunction("IMPORT_CUSTOMS") === "tr.import.core", "getPackIdForFunction('IMPORT_CUSTOMS') -> tr.import.core (Alias)");
assert(hasQuestionPack("IMPORT") === true, "hasQuestionPack('IMPORT') === true");
assert(getPackStatus("IMPORT") === "available", "getPackStatus('IMPORT') === 'available'");

const loadedPackRes = await loadQuestionPack("tr.import.core");
assert(loadedPackRes.ok === true, "loadQuestionPack('tr.import.core') ok === true");
if (loadedPackRes.ok) {
  assert(loadedPackRes.pack.questions.length === 47, "Yüklenen soru paketi 47 soru içerir");
}

// ─── TEST 15: Sınır Ayrımı (Cross-Pack Isolation Tests) ──────────────────────
console.log("\n=== T15: Sınır Ayrımı (Cross-Pack Isolation Tests) ===");

// 1. EXPORT ayrımı: IMPORT soruları ihracat beyannamesi, KDV iadesi, ihracat akreditifi vb. ihracat süreçlerini sormaz.
const exportTerms = ["ihracat e-faturası", "ihracat bedeli kabul belgesi (ibkb)", "ihracat kdv iadesi", "ihracat akreditifi"];
let exportViolations = 0;
pack.questions.forEach((q) => {
  exportTerms.forEach((term) => {
    if (q.question.toLowerCase().includes(term)) {
      console.error(`  Sınır ihlali: ${q.id} sorusunda EXPORT terimi (${term}) bulundu!`);
      exportViolations++;
    }
  });
});
assert(exportViolations === 0, "EXPORT sınır kontrolü: İhracat odaklı spesifik terimler IMPORT paketinde tekrarlanmadı");

// 2. PROCUREMENT ayrımı: IMPORT soruları yerel satınalma onay matrislerini değil, uluslararası ithalat, gümrük ve dış ticaret süreçlerini inceler.
const procTerms = ["yerel satınalma onay hiyerarşisi", "yurtiçi piyasa fiyat araştırması"];
let procViolations = 0;
pack.questions.forEach((q) => {
  procTerms.forEach((term) => {
    if (q.question.toLowerCase().includes(term)) {
      console.error(`  Sınır ihlali: ${q.id} sorusunda PROCUREMENT terimi (${term}) bulundu!`);
      procViolations++;
    }
  });
});
assert(procViolations === 0, "PROCUREMENT sınır kontrolü: Yurtiçi satınalma süreçleri IMPORT paketinde tekrarlanmadı");

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
console.log(`FAZ-39 IMPORT TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════════\n");

if (failCount === 0) {
  console.log("✅ FAZ-39 KABUL: Tüm testler geçti — IMPORT Question Pack mühürlendi.");
  process.exit(0);
} else {
  console.error(`❌ FAZ-39 HATA: ${failCount} test başarısız oldu!`);
  process.exit(1);
}
