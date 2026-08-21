/**
 * ERP CRM Discovery — FAZ-34: ANA VERİ VE VERİ KALİTESİ YÖNETİMİ / MASTER_DATA_MANAGEMENT Acceptance Tests
 *
 * 14 Test Alanı:
 * 1. Pack Loading & Metadata Integrity (MASTER_DATA_MANAGEMENT canonical code, pack_id: tr.master_data_management.core, v0.1.0)
 * 2. Validator Engine Check (0 schema errors)
 * 3. Question Quantity & IDs (47 questions, MDM-001..MDM-047 deterministic)
 * 4. Required Question Count (25 required, 22 optional)
 * 5. Choice Options & is_other Validation
 * 6. 25 Canonical Process Coverage (25 süreç)
 * 7. Branching Engine Resolution (7 Koşullu Dallanma Noktası: Kapalı: 40, Açık: 47)
 * 8. Progress Calculation & Follow-up Deduction (25 required, QuestionFollowup bayrak etkisi)
 * 9. Cross-Pack Duplication Audit (Tüm 23 diğer modülle 0 mükerrerlik)
 * 10. Custom Questions Adapter Compatibility
 * 11. ReportModel & Formatting Truth
 * 12 & 13. DOCX & PDF Generation & Integrity
 * 14. Loader Registry Parity
 */

import { readFileSync, readdirSync } from "fs";
import path from "path";
import { validateQuestionPack } from "../src/engine/validator";
import { getVisibleQuestions } from "../src/engine/branching";
import { calculateProgress } from "../src/engine/progress";
import { adaptCustomQuestionToQuestion } from "../src/engine/customQuestionAdapter";
import { formatAnswer } from "../src/report/formatters";
import { getPackIdForFunction } from "../src/engine/loader";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import { PDFParse } from "pdf-parse";
import type { QuestionPack, AnswerData } from "../src/engine/types";
import type { ReportModel } from "../src/report/types";
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

console.log("\n══════════════════════════════════════════════════════");
console.log("FAZ-34: ANA VERİ VE VERİ KALİTESİ / MASTER_DATA_MANAGEMENT TEST");
console.log("══════════════════════════════════════════════════════\n");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/master_data_management/core.json");
const raw = readFileSync(packPath, "utf-8");
const pack = JSON.parse(raw) as QuestionPack;

assert(!!pack, "MASTER_DATA_MANAGEMENT pack JSON başarıyla okundu");
assert(pack.meta?.pack_id === "tr.master_data_management.core", "pack_id = tr.master_data_management.core");
assert(pack.meta?.version === "0.1.0", "version = 0.1.0");
assert(pack.meta?.language === "tr", "language = tr");
assert(pack.meta?.business_function_code === "MASTER_DATA_MANAGEMENT", "business_function_code = MASTER_DATA_MANAGEMENT (Kanonik Kod)");
assert(pack.meta?.name === "Ana Veri ve Veri Kalitesi Yönetimi Soru Paketi", `name = ${pack.meta?.name}`);
assert((pack.meta?.description?.length ?? 0) > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(masterDataPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ─────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 47, `Toplam soru sayısı tam 47 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 47, "Tüm 47 soru ID'si benzersizdir");

let sequential = true;
for (let i = 1; i <= 47; i++) {
  const expectedId = `MDM-${String(i).padStart(3, "0")}`;
  if (ids[i - 1] !== expectedId) { sequential = false; break; }
}
assert(sequential, "Tüm sorular MDM-001'den MDM-047'ye sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ─────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 25, `Zorunlu soru sayısı tam 25 adettir (${requiredQuestions.length})`);
assert(optionalQuestions.length === 22, `Opsiyonel soru sayısı tam 22 adettir (${optionalQuestions.length})`);

// ─── TEST 5: Choice Options & is_other Validation ────────────────────────────
console.log("\n=== T05: Choice Options & is_other Validation ===");
let allOptionsValid = true;
let otherRuleValid = true;

for (const q of pack.questions) {
  if (q.options && q.options.length > 0) {
    if (q.options.length < 2) allOptionsValid = false;
    for (const opt of q.options) {
      if (opt.is_other && !opt.allow_note) otherRuleValid = false;
    }
  }
}
assert(allOptionsValid, "Tüm seçenekli sorularda en az 2 seçenek tanımlıdır");
assert(otherRuleValid, "is_other=true olan tüm seçeneklerde allow_note=true kuralı korunmuştur");

// ─── TEST 6: 25 Canonical Process Coverage ───────────────────────────────────
console.log("\n=== T06: 25 Canonical Process Coverage ===");
const canonicalProcesses = [
  "Ana Veri Yönetişimi ve Strateji",
  "Veri Sahipliği ve Steward Rolleri",
  "Kodlama ve Numaralandırma Standartları",
  "Malzeme ve Stok Kartı Ana Verisi",
  "Kategori Hiyerarşisi ve Sınıflandırma",
  "Marka, Model ve Grup Tanımları",
  "Ölçü Birimleri ve Çevrim Katsayıları",
  "Varyant ve Özellik Yönetimi",
  "Satınalma ve Satış Kartı Entegrasyonu",
  "Tedarikçi Ana Verisi ve Kalitesi",
  "Müşteri ve Cari Kart Ana Verisi",
  "Cari Hesap Grupları ve Segmentasyon",
  "Müşteri/Tedarikçi Çoklu Sistem Senkronizasyonu",
  "Vergi, Fiyat ve Vade Koşulları",
  "Banka, IBAN ve İletişim Veri Doğruluğu",
  "Duran Varlık ve Sabit Kıymet Ana Verisi",
  "Demirbaş Zimmet ve Lokasyon Eşleme",
  "Ürün Ağacı (BOM) ve Reçete Ana Verisi",
  "İş Merkezi, Rota ve Operasyon Ana Verisi",
  "Depo, Raf ve Lokasyon Ana Verisi",
  "Personel ve Organizasyon Veri Uyumu",
  "Mükerrer Kayıt Tespiti ve Konsolidasyon",
  "Zorunlu Alan ve Veri Bütünlüğü Kontrolleri",
  "Veri Giriş, Doğrulama ve Onay Akışları",
  "Eski Sistemden Veri Temizleme ve Migrasyon",
  "Veri Kalitesi KPI ve Sürekli İyileştirme",
];

const packProcesses = new Set(pack.questions.map((q) => q.process));
let allProcessesCovered = true;
for (const p of canonicalProcesses) {
  if (!packProcesses.has(p)) {
    console.error(`Eksik süreç: ${p}`);
    allProcessesCovered = false;
  }
}
assert(allProcessesCovered, "Kapsamdaki tüm 25 kanonik süreç soru paketinde mevcuttur");

// ─── TEST 7: Branching Engine Resolution ─────────────────────────────────────
console.log("\n=== T07: Branching Engine Resolution (7 Dallanma) ===");
const emptyAnswers = new Map<string, AnswerData>();
const visibleDefault = getVisibleQuestions(pack.questions, emptyAnswers);
assert(visibleDefault.length === 40, `Cevapsız durumda tam 40 soru görünür (7 branching gizli) — Gerçek: ${visibleDefault.length}`);

// Senaryo 1: Kategori Hiyerarşisi (MDM-008 = cok_seviyeli_hiyerarsi -> MDM-009)
const answersS1 = new Map<string, AnswerData>();
answersS1.set("MDM-008", { selected: [{ value: "iki_seviyeli_basit_kategori" }] });
const visibleS1_off = getVisibleQuestions(pack.questions, answersS1);
assert(!visibleS1_off.some((q) => q.id === "MDM-009"), "MDM-008 != cok_seviyeli_hiyerarsi iken MDM-009 gizli");

answersS1.set("MDM-008", { selected: [{ value: "cok_seviyeli_hiyerarsi" }] });
const visibleS1_on = getVisibleQuestions(pack.questions, answersS1);
assert(visibleS1_on.some((q) => q.id === "MDM-009"), "MDM-008 = cok_seviyeli_hiyerarsi iken MDM-009 görünür");

// Senaryo 2: Varyant Matrisi (MDM-013 = evet_varyant_matrisi_kullanilmaktadir -> MDM-014)
const answersS2 = new Map<string, AnswerData>();
answersS2.set("MDM-013", { selected: [{ value: "hayir_her_varyant_icin_ayri_kart_acilir" }] });
const visibleS2_off = getVisibleQuestions(pack.questions, answersS2);
assert(!visibleS2_off.some((q) => q.id === "MDM-014"), "MDM-013 != evet_varyant_matrisi... iken MDM-014 gizli");

answersS2.set("MDM-013", { selected: [{ value: "evet_varyant_matrisi_kullanilmaktadir" }] });
const visibleS2_on = getVisibleQuestions(pack.questions, answersS2);
assert(visibleS2_on.some((q) => q.id === "MDM-014"), "MDM-013 = evet_varyant_matrisi... iken MDM-014 görünür");

// Senaryo 3: Çoklu Sistem Senkronizasyonu (MDM-022 = birden_fazla_sistemde_ayri_tutuluyor -> MDM-023)
const answersS3 = new Map<string, AnswerData>();
answersS3.set("MDM-022", { selected: [{ value: "tek_merkezi_ana_sistemde_tutulur" }] });
const visibleS3_off = getVisibleQuestions(pack.questions, answersS3);
assert(!visibleS3_off.some((q) => q.id === "MDM-023"), "MDM-022 != birden_fazla_sistemde... iken MDM-023 gizli");

answersS3.set("MDM-022", { selected: [{ value: "birden_fazla_sistemde_ayri_tutuluyor" }] });
const visibleS3_on = getVisibleQuestions(pack.questions, answersS3);
assert(visibleS3_on.some((q) => q.id === "MDM-023"), "MDM-022 = birden_fazla_sistemde... iken MDM-023 görünür");

// Senaryo 4: Duran Varlık Detayı (MDM-029 = sistemde_detayli_takip_ediliyor -> MDM-030)
const answersS4 = new Map<string, AnswerData>();
answersS4.set("MDM-029", { selected: [{ value: "sadece_mali_amortisman_tutulur_zimmet_yoktur" }] });
const visibleS4_off = getVisibleQuestions(pack.questions, answersS4);
assert(!visibleS4_off.some((q) => q.id === "MDM-030"), "MDM-029 != sistemde_detayli_takip... iken MDM-030 gizli");

answersS4.set("MDM-029", { selected: [{ value: "sistemde_detayli_takip_ediliyor" }] });
const visibleS4_on = getVisibleQuestions(pack.questions, answersS4);
assert(visibleS4_on.some((q) => q.id === "MDM-030"), "MDM-029 = sistemde_detayli_takip... iken MDM-030 görünür");

// Senaryo 5: Reçete / Rota (MDM-033 = recete_ve_bom_kullaniliyor -> MDM-034)
const answersS5 = new Map<string, AnswerData>();
answersS5.set("MDM-033", { selected: [{ value: "rota_ve_is_merkezi_ana_verisi_kullanilmiyor" }] });
const visibleS5_off = getVisibleQuestions(pack.questions, answersS5);
assert(!visibleS5_off.some((q) => q.id === "MDM-034"), "MDM-033 != recete_ve_bom_kullaniliyor iken MDM-034 gizli");

answersS5.set("MDM-033", { selected: [{ value: "recete_ve_bom_kullaniliyor" }] });
const visibleS5_on = getVisibleQuestions(pack.questions, answersS5);
assert(visibleS5_on.some((q) => q.id === "MDM-034"), "MDM-033 = recete_ve_bom_kullaniliyor iken MDM-034 görünür");

// Senaryo 6: Mükerrer Kayıt (MDM-038 = ciddi_veya_orta_seviyede_mukerrerlik_var -> MDM-039)
const answersS6 = new Map<string, AnswerData>();
answersS6.set("MDM-038", { selected: [{ value: "cok_az_ve_izole_durumlar_vardir" }] });
const visibleS6_off = getVisibleQuestions(pack.questions, answersS6);
assert(!visibleS6_off.some((q) => q.id === "MDM-039"), "MDM-038 != ciddi_veya_orta... iken MDM-039 gizli");

answersS6.set("MDM-038", { selected: [{ value: "ciddi_veya_orta_seviyede_mukerrerlik_var" }] });
const visibleS6_on = getVisibleQuestions(pack.questions, answersS6);
assert(visibleS6_on.some((q) => q.id === "MDM-039"), "MDM-038 = ciddi_veya_orta... iken MDM-039 görünür");

// Senaryo 7: Veri Migrasyonu (MDM-043 = eski_sistemden_aktarim_yapilacak -> MDM-044)
const answersS7 = new Map<string, AnswerData>();
answersS7.set("MDM-043", { selected: [{ value: "sifir_temiz_veri_seti_ile_baslanacak" }] });
const visibleS7_off = getVisibleQuestions(pack.questions, answersS7);
assert(!visibleS7_off.some((q) => q.id === "MDM-044"), "MDM-043 != eski_sistemden_aktarim... iken MDM-044 gizli");

answersS7.set("MDM-043", { selected: [{ value: "eski_sistemden_aktarim_yapilacak" }] });
const visibleS7_on = getVisibleQuestions(pack.questions, answersS7);
assert(visibleS7_on.some((q) => q.id === "MDM-044"), "MDM-043 = eski_sistemden_aktarim... iken MDM-044 görünür");

// Tüm 7 dallanma açıkken
const allBranchingAnswers = new Map<string, AnswerData>();
allBranchingAnswers.set("MDM-008", { selected: [{ value: "cok_seviyeli_hiyerarsi" }] });
allBranchingAnswers.set("MDM-013", { selected: [{ value: "evet_varyant_matrisi_kullanilmaktadir" }] });
allBranchingAnswers.set("MDM-022", { selected: [{ value: "birden_fazla_sistemde_ayri_tutuluyor" }] });
allBranchingAnswers.set("MDM-029", { selected: [{ value: "sistemde_detayli_takip_ediliyor" }] });
allBranchingAnswers.set("MDM-033", { selected: [{ value: "recete_ve_bom_kullaniliyor" }] });
allBranchingAnswers.set("MDM-038", { selected: [{ value: "ciddi_veya_orta_seviyede_mukerrerlik_var" }] });
allBranchingAnswers.set("MDM-043", { selected: [{ value: "eski_sistemden_aktarim_yapilacak" }] });
const visibleAll = getVisibleQuestions(pack.questions, allBranchingAnswers);
assert(visibleAll.length === 47, `Tüm 7 tetikleyici açıkken 47 sorunun tamamı görünür (${visibleAll.length}/47)`);

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

// 2 soruya takip bayrağı eklenince
mockFollowups.set("MDM-001", {
  id: "qf_mdm_1", analysis_project_id: "p1", business_function_code: "MASTER_DATA_MANAGEMENT",
  question_id: "MDM-001", flag_type: "revisit", note: "Veri yönetişim politikası incelenecek",
  status: "open", created_at: "2026-08-20", updated_at: "2026-08-20", resolved_at: null
});
mockFollowups.set("MDM-005", {
  id: "qf_mdm_5", analysis_project_id: "p1", business_function_code: "MASTER_DATA_MANAGEMENT",
  question_id: "MDM-005", flag_type: "critical", note: "Kodlama standardı acil çözülmeli",
  status: "open", created_at: "2026-08-20", updated_at: "2026-08-20", resolved_at: null
});

const progressWithFlags = calculateProgress(pack.questions, fullAnswers, mockFollowups);
assert(progressWithFlags.answered === 23, `Bayraklı 2 soru düşünce answered = 23 (${progressWithFlags.answered})`);
assert(progressWithFlags.percentage === 92, `İlerleme %92 hesaplandı (${progressWithFlags.percentage}%)`);

// ─── TEST 9: Cross-Pack Duplication Audit ────────────────────────────────────
console.log("\n=== T09: Cross-Pack Duplication Audit ===");
const packsDir = path.resolve("question-packs/tr");
const packDirs = readdirSync(packsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== "master_data_management")
  .map((d) => d.name);

let duplicateCount = 0;
const mdmQuestions = pack.questions.map((q) => q.question.toLowerCase().trim());

for (const dir of packDirs) {
  const otherPackPath = path.join(packsDir, dir, "core.json");
  const otherPack = JSON.parse(readFileSync(otherPackPath, "utf-8")) as QuestionPack;
  for (const oq of otherPack.questions) {
    if (mdmQuestions.includes(oq.question.toLowerCase().trim())) {
      console.error(`Mükerrer soru tespit edildi: "${oq.question}" (${dir} / ${oq.id})`);
      duplicateCount++;
    }
  }
}
assert(duplicateCount === 0, `23 diğer modülle çapraz karşılaştırmada 0 tam mükerrer soru (0 bulundu)`);

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQ = {
  id: "cq_mdm_001",
  analysis_project_id: "p1",
  business_function_code: "MASTER_DATA_MANAGEMENT",
  process_name: "GS1 ve Barkod Standartları",
  question_text: "ERP öncesi GS1 Türkiye GTIN/barkod üyeliği mevcut mudur?",
  description: "Global barkod standardı kontrolü",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_mdm_001", value: "yes", label: "Evet, kurumsal GS1 üyeliği aktiftir", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_mdm_001", value: "no", label: "Hayır, iç barkod kullanılmaktadır", sort_order: 2, is_other: 0, created_at: "" },
  ],
  is_required: 1,
  sort_order: 48,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
const customQ = adaptCustomQuestionToQuestion(mockCustomQ, 48);

assert(customQ.id === "cq_mdm_001", "Custom question ID eşleşti");
assert(customQ.is_custom === true, "is_custom = true");
assert(customQ.process === "GS1 ve Barkod Standartları", "Process eşleşti");
assert(customQ.options?.length === 2, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions.find((q) => q.id === "MDM-001")!;
const formattedQ1 = formatAnswer(q1, {
  selected: [{
    value: "yazili_politika_ve_merkezi_yonetisim_var",
    note: "Veri yönetişim komitesi Genel Müdür ve IT Direktörü liderliğinde toplanmaktadır.",
  }],
  general_note: "Yeni ERP projesinde veri standartları kurulacak.",
});

assert(formattedQ1.isAnswered === true, "formattedQ1.isAnswered = true");
assert(
  formattedQ1.summaryText.includes("Yazılı ana veri politikası ve kurumsal veri yönetişim"),
  "Kullanıcı dostu label formatlandı"
);
assert(
  formattedQ1.summaryText.includes("Veri yönetişim komitesi Genel Müdür ve IT Direktörü liderliğinde"),
  "Seçenek notu formatlandı"
);
assert(
  formattedQ1.summaryText.includes("Yeni ERP projesinde veri standartları kurulacak."),
  "Genel not formatlandı"
);

// ─── TEST 12 & 13: DOCX & PDF Export ─────────────────────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with MASTER_DATA_MANAGEMENT Data ===");
const mockMdmReportModel: ReportModel = {
  metadata: {
    title: "ERP / Ana Veri ve Veri Kalitesi Yönetimi Keşif Raporu",
    projectName: "Stok, Cari, Varlık, Reçete ve Veri Kalitesi Olgunluk Keşfi",
    companyName: "Örnek Holding A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: { MASTER_DATA_MANAGEMENT: "tr.master_data_management.core v0.1.0" },
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
    companyName: "Örnek Holding A.Ş.",
    tradeName: "Örnek Holding",
    taxNumber: "9876543210",
    city: "Kocaeli",
    country: "Türkiye",
    employeeCount: "450",
    notes: "Şirketin stok, cari, varlık ve migrasyon hazırlığı incelendi.",
  },
  profile: {
    analysis_project_id: "p_faz34",
    executive_summary: "Ana veri standartları kurulmalı, VKN/GİB entegrasyonu sağlanmalı ve mükerrer kartlar elenmelidir.",
    overall_assessment: "Data steward rolleri atanmalı ve Excel migrasyon şablonları hazırlanmalıdır.",
    open_topics: "Stok kategori ağacının sadeleştirilmesi.",
  },
  scope: [{
    code: "MASTER_DATA_MANAGEMENT",
    nameTr: "Ana Veri ve Veri Kalitesi Yönetimi",
    nameEn: "Master Data Management",
    category: "Yönetim",
    departmentName: "Veri Yönetişim Direktörlüğü",
    responsiblePerson: "Selim Koçak",
    status: "completed",
    hasPack: true,
    progressPercentage: 100,
    answeredCount: 25,
    totalQuestionCount: 25,
  }],
  businessFunctions: [{
    code: "MASTER_DATA_MANAGEMENT",
    nameTr: "Ana Veri ve Veri Kalitesi Yönetimi",
    nameEn: "Master Data Management",
    category: "Yönetim",
    sortOrder: 33,
    departmentName: "Veri Yönetişim Direktörlüğü",
    responsiblePerson: "Selim Koçak",
    status: "completed",
    packId: "tr.master_data_management.core",
    packVersion: "0.1.0",
    progressPercentage: 100,
    answeredCount: 25,
    totalQuestionCount: 25,
    processes: [{
      name: "Ana Veri Yönetişimi ve Strateji",
      order: 1,
      questions: [{
        id: "MDM-001",
        order: 1,
        process: "Ana Veri Yönetişimi ve Strateji",
        questionText: pack.questions.find((q) => q.id === "MDM-001")!.question,
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
    revisitCount: 0,
    criticalFollowupCount: 0,
  },
};

// DOCX Test
const docxBuffer = await buildDocxBuffer(mockMdmReportModel);
assert(docxBuffer.byteLength > 5000, `DOCX üretimi başarılı (${docxBuffer.byteLength} byte)`);

// PDF Test
const pdfBuffer = await buildPdfBuffer(mockMdmReportModel);
assert(pdfBuffer.byteLength > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.byteLength} byte)`);

const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;

assert(pdfText.includes("Ana Veri") || pdfText.includes("Veri Kalitesi"), "PDF çıktısında 'Ana Veri' veya 'Veri Kalitesi' başlığı mevcut");
assert(pdfText.includes("Örnek Holding"), "PDF çıktısında firma adı mevcut (Türkçe UTF-8 doğru)");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
assert(
  getPackIdForFunction("MASTER_DATA_MANAGEMENT") === "tr.master_data_management.core",
  "getPackIdForFunction('MASTER_DATA_MANAGEMENT') -> tr.master_data_management.core"
);
assert(
  getPackIdForFunction("MASTER_DATA") === "tr.master_data_management.core",
  "getPackIdForFunction('MASTER_DATA') -> tr.master_data_management.core (Alias)"
);
assert(
  getPackIdForFunction("ANA_VERI") === "tr.master_data_management.core",
  "getPackIdForFunction('ANA_VERI') -> tr.master_data_management.core (Türkçe Alias)"
);

// ─── SUMMARY ─────────────────────────────────────────────────────────────────
const total = passCount + failCount;
console.log("\n══════════════════════════════════════════════════════");
console.log(`FAZ-34 MASTER_DATA_MANAGEMENT TEST SONUCU: ${passCount}/${total} PASS`);
console.log("══════════════════════════════════════════════════════\n");

if (failCount === 0) {
  console.log("✅ FAZ-34 KABUL: Tüm testler geçti — MASTER_DATA_MANAGEMENT Question Pack mühürlendi.");
  process.exit(0);
} else {
  console.error(`❌ FAZ-34 KABUL BAŞARISIZ: ${failCount} test hatası!`);
  process.exit(1);
}
