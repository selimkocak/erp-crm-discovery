/**
 * ERP CRM Discovery — FAZ-35: PROJE YÖNETİMİ / PROJECT_MANAGEMENT Acceptance Tests
 *
 * 14 Test Alanı:
 * 1. Pack Loading & Metadata Integrity (PROJECT_MANAGEMENT canonical code, pack_id: tr.project_management.core, v0.1.0)
 * 2. Validator Engine Check (0 schema errors)
 * 3. Question Quantity & IDs (47 questions, PRJ-001..PRJ-047 deterministic)
 * 4. Required Question Count (25 required, 22 optional)
 * 5. Choice Options & is_other Validation
 * 6. 25 Canonical Process Coverage (25 süreç)
 * 7. Branching Engine Resolution (7 Koşullu Dallanma Noktası: Kapalı: 40, Açık: 47)
 * 8. Progress Calculation & Follow-up Deduction (25 required, QuestionFollowup bayrak etkisi)
 * 9. Cross-Pack Duplication Audit (Tüm 24 diğer modülle 0 mükerrerlik)
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
console.log("FAZ-35: PROJE YÖNETİMİ / PROJECT_MANAGEMENT TEST");
console.log("══════════════════════════════════════════════════════\n");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/project_management/core.json");
const raw = readFileSync(packPath, "utf-8");
const pack = JSON.parse(raw) as QuestionPack;

assert(!!pack, "PROJECT_MANAGEMENT pack JSON başarıyla okundu");
assert(pack.meta?.pack_id === "tr.project_management.core", "pack_id = tr.project_management.core");
assert(pack.meta?.version === "0.1.0", "version = 0.1.0");
assert(pack.meta?.language === "tr", "language = tr");
assert(pack.meta?.business_function_code === "PROJECT_MANAGEMENT", "business_function_code = PROJECT_MANAGEMENT (Kanonik Kod)");
assert(pack.meta?.name === "Proje Yönetimi Soru Paketi", `name = ${pack.meta?.name}`);
assert((pack.meta?.description?.length ?? 0) > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(projectManagementPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ─────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 47, `Toplam soru sayısı tam 47 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 47, "Tüm 47 soru ID'si benzersizdir");

let sequential = true;
for (let i = 1; i <= 47; i++) {
  const expectedId = `PRJ-${String(i).padStart(3, "0")}`;
  if (ids[i - 1] !== expectedId) { sequential = false; break; }
}
assert(sequential, "Tüm sorular PRJ-001'den PRJ-047'ye sıralı ve deterministiktir");

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
  "Proje Yönetimi Organizasyonu ve Sorumluluklar",
  "Proje Türleri ve Proje Sınıflandırması",
  "Proje Açılış ve Onay Süreci",
  "Proje Yöneticisi ve Ekip Yapısı",
  "Proje Hedefleri ve Başarı Kriterleri",
  "Kapsam Tanımı ve Kapsam Dışı Konular",
  "İş Kırılım Yapısı (WBS)",
  "Aşamalar, Kilometre Taşları ve Teslimatlar",
  "Proje Takvimi ve Bağımlılıklar",
  "Kaynak Planlama ve Kapasite Yönetimi",
  "İnsan Kaynağı Atama ve Görev Dağılımı",
  "Makine, Ekipman ve Teknik Kaynak Planlaması",
  "Proje Bütçesi ve Maliyet Planı",
  "Gerçekleşen Maliyet ve Bütçe Sapması",
  "Zaman ve Efor Takibi",
  "Müşteri, Tedarikçi ve Alt Yüklenici Koordinasyonu",
  "Satın Alma ve Proje Giderleri",
  "Proje Risk Yönetimi",
  "Sorun, Aksiyon ve Karar Yönetimi",
  "Değişiklik Talepleri ve Kapsam Değişikliği",
  "Onay ve Yetki Matrisi",
  "Proje Dokümanları, Versiyonlar ve Kanıt Dosyaları",
  "Durum Raporları, Toplantılar ve İletişim",
  "Test, Kabul ve Canlıya Geçiş Hazırlığı",
  "Proje Kapanışı, Devir ve Lessons Learned",
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

// Senaryo 1: Proje Bütçesi Detayı (PRJ-023 = proje_bazli_ayrintili_butce_var -> PRJ-024)
const answersS1 = new Map<string, AnswerData>();
answersS1.set("PRJ-023", { selected: [{ value: "sadece_toplam_tahmini_butce_belirlenir" }] });
const visibleS1_off = getVisibleQuestions(pack.questions, answersS1);
assert(!visibleS1_off.some((q) => q.id === "PRJ-024"), "PRJ-023 != proje_bazli_ayrintili_butce_var iken PRJ-024 gizli");

answersS1.set("PRJ-023", { selected: [{ value: "proje_bazli_ayrintili_butce_var" }] });
const visibleS1_on = getVisibleQuestions(pack.questions, answersS1);
assert(visibleS1_on.some((q) => q.id === "PRJ-024"), "PRJ-023 = proje_bazli_ayrintili_butce_var iken PRJ-024 görünür");

// Senaryo 2: WBS Alt İş Paketleri (PRJ-012 = detayli_hiyerarsik_wbs_kullanilir -> PRJ-013)
const answersS2 = new Map<string, AnswerData>();
answersS2.set("PRJ-012", { selected: [{ value: "duz_gorev_listesi_kullanilir" }] });
const visibleS2_off = getVisibleQuestions(pack.questions, answersS2);
assert(!visibleS2_off.some((q) => q.id === "PRJ-013"), "PRJ-012 != detayli_hiyerarsik_wbs_kullanilir iken PRJ-013 gizli");

answersS2.set("PRJ-012", { selected: [{ value: "detayli_hiyerarsik_wbs_kullanilir" }] });
const visibleS2_on = getVisibleQuestions(pack.questions, answersS2);
assert(visibleS2_on.some((q) => q.id === "PRJ-013"), "PRJ-012 = detayli_hiyerarsik_wbs_kullanilir iken PRJ-013 görünür");

// Senaryo 3: Müşteri Projeleri Teslimat/Kabul (PRJ-004 = dis_musteri_projeleri_agirliklidir -> PRJ-015)
const answersS3 = new Map<string, AnswerData>();
answersS3.set("PRJ-004", { selected: [{ value: "sirket_ici_yatirim_ve_arge_agirliklidir" }] });
const visibleS3_off = getVisibleQuestions(pack.questions, answersS3);
assert(!visibleS3_off.some((q) => q.id === "PRJ-015"), "PRJ-004 != dis_musteri_projeleri_agirliklidir iken PRJ-015 gizli");

answersS3.set("PRJ-004", { selected: [{ value: "dis_musteri_projeleri_agirliklidir" }] });
const visibleS3_on = getVisibleQuestions(pack.questions, answersS3);
assert(visibleS3_on.some((q) => q.id === "PRJ-015"), "PRJ-004 = dis_musteri_projeleri_agirliklidir iken PRJ-015 görünür");

// Senaryo 4: Alt Yüklenici Koordinasyonu (PRJ-030 = duzenli_alt_yuklenici_ve_dis_kaynak_kullanilir -> PRJ-031)
const answersS4 = new Map<string, AnswerData>();
answersS4.set("PRJ-030", { selected: [{ value: "tamamen_sirket_ici_ozkaynakla_yurutulur" }] });
const visibleS4_off = getVisibleQuestions(pack.questions, answersS4);
assert(!visibleS4_off.some((q) => q.id === "PRJ-031"), "PRJ-030 != duzenli_alt_yuklenici... iken PRJ-031 gizli");

answersS4.set("PRJ-030", { selected: [{ value: "duzenli_alt_yuklenici_ve_dis_kaynak_kullanilir" }] });
const visibleS4_on = getVisibleQuestions(pack.questions, answersS4);
assert(visibleS4_on.some((q) => q.id === "PRJ-031"), "PRJ-030 = duzenli_alt_yuklenici... iken PRJ-031 görünür");

// Senaryo 5: Değişiklik Talepleri (PRJ-037 = resmi_cr_sureci_ve_etki_analizi_var -> PRJ-038)
const answersS5 = new Map<string, AnswerData>();
answersS5.set("PRJ-037", { selected: [{ value: "degisiklik_yonetim_sureci_yoktur" }] });
const visibleS5_off = getVisibleQuestions(pack.questions, answersS5);
assert(!visibleS5_off.some((q) => q.id === "PRJ-038"), "PRJ-037 != resmi_cr_sureci... iken PRJ-038 gizli");

answersS5.set("PRJ-037", { selected: [{ value: "resmi_cr_sureci_ve_etki_analizi_var" }] });
const visibleS5_on = getVisibleQuestions(pack.questions, answersS5);
assert(visibleS5_on.some((q) => q.id === "PRJ-038"), "PRJ-037 = resmi_cr_sureci... iken PRJ-038 görünür");

// Senaryo 6: Timesheet ve Efor (PRJ-027 = detayli_gunluk_saatlik_timesheet_tutulur -> PRJ-028)
const answersS6 = new Map<string, AnswerData>();
answersS6.set("PRJ-027", { selected: [{ value: "zaman_ve_efor_takibi_yapilmamaktadir" }] });
const visibleS6_off = getVisibleQuestions(pack.questions, answersS6);
assert(!visibleS6_off.some((q) => q.id === "PRJ-028"), "PRJ-027 != detayli_gunluk_saatlik... iken PRJ-028 gizli");

answersS6.set("PRJ-027", { selected: [{ value: "detayli_gunluk_saatlik_timesheet_tutulur" }] });
const visibleS6_on = getVisibleQuestions(pack.questions, answersS6);
assert(visibleS6_on.some((q) => q.id === "PRJ-028"), "PRJ-027 = detayli_gunluk_saatlik... iken PRJ-028 görünür");

// Senaryo 7: Canlıya Geçiş / Cut-Over (PRJ-044 = kapsamli_cut_over_ve_canliya_gecis_yapilir -> PRJ-045)
const answersS7 = new Map<string, AnswerData>();
answersS7.set("PRJ-044", { selected: [{ value: "formal_uat_ve_cut_over_plani_yoktur" }] });
const visibleS7_off = getVisibleQuestions(pack.questions, answersS7);
assert(!visibleS7_off.some((q) => q.id === "PRJ-045"), "PRJ-044 != kapsamli_cut_over... iken PRJ-045 gizli");

answersS7.set("PRJ-044", { selected: [{ value: "kapsamli_cut_over_ve_canliya_gecis_yapilir" }] });
const visibleS7_on = getVisibleQuestions(pack.questions, answersS7);
assert(visibleS7_on.some((q) => q.id === "PRJ-045"), "PRJ-044 = kapsamli_cut_over... iken PRJ-045 görünür");

// Tüm 7 dallanma açıkken
const allBranchingAnswers = new Map<string, AnswerData>();
allBranchingAnswers.set("PRJ-023", { selected: [{ value: "proje_bazli_ayrintili_butce_var" }] });
allBranchingAnswers.set("PRJ-012", { selected: [{ value: "detayli_hiyerarsik_wbs_kullanilir" }] });
allBranchingAnswers.set("PRJ-004", { selected: [{ value: "dis_musteri_projeleri_agirliklidir" }] });
allBranchingAnswers.set("PRJ-030", { selected: [{ value: "duzenli_alt_yuklenici_ve_dis_kaynak_kullanilir" }] });
allBranchingAnswers.set("PRJ-037", { selected: [{ value: "resmi_cr_sureci_ve_etki_analizi_var" }] });
allBranchingAnswers.set("PRJ-027", { selected: [{ value: "detayli_gunluk_saatlik_timesheet_tutulur" }] });
allBranchingAnswers.set("PRJ-044", { selected: [{ value: "kapsamli_cut_over_ve_canliya_gecis_yapilir" }] });
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
mockFollowups.set("PRJ-001", {
  id: "qf_prj_1", analysis_project_id: "p1", business_function_code: "PROJECT_MANAGEMENT",
  question_id: "PRJ-001", flag_type: "revisit", note: "PMO ve metodoloji incelenecek",
  status: "open", created_at: "2026-08-21", updated_at: "2026-08-21", resolved_at: null
});
mockFollowups.set("PRJ-011", {
  id: "qf_prj_11", analysis_project_id: "p1", business_function_code: "PROJECT_MANAGEMENT",
  question_id: "PRJ-011", flag_type: "critical", note: "Kapsam bildirimi acil netleştirilmeli",
  status: "open", created_at: "2026-08-21", updated_at: "2026-08-21", resolved_at: null
});

const progressWithFlags = calculateProgress(pack.questions, fullAnswers, mockFollowups);
assert(progressWithFlags.answered === 23, `Bayraklı 2 soru düşünce answered = 23 (${progressWithFlags.answered})`);
assert(progressWithFlags.percentage === 92, `İlerleme %92 hesaplandı (${progressWithFlags.percentage}%)`);

// ─── TEST 9: Cross-Pack Duplication Audit ────────────────────────────────────
console.log("\n=== T09: Cross-Pack Duplication Audit ===");
const packsDir = path.resolve("question-packs/tr");
const packDirs = readdirSync(packsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== "project_management")
  .map((d) => d.name);

let duplicateCount = 0;
const prjQuestions = pack.questions.map((q) => q.question.toLowerCase().trim());

for (const dir of packDirs) {
  const otherPackPath = path.join(packsDir, dir, "core.json");
  const otherPack = JSON.parse(readFileSync(otherPackPath, "utf-8")) as QuestionPack;
  for (const oq of otherPack.questions) {
    if (prjQuestions.includes(oq.question.toLowerCase().trim())) {
      console.error(`Mükerrer soru tespit edildi: "${oq.question}" (${dir} / ${oq.id})`);
      duplicateCount++;
    }
  }
}
assert(duplicateCount === 0, `24 diğer modülle çapraz karşılaştırmada 0 tam mükerrer soru (0 bulundu)`);

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQ = {
  id: "cq_prj_001",
  analysis_project_id: "p1",
  business_function_code: "PROJECT_MANAGEMENT",
  process_name: "Çevik (Agile / Scrum) Dönüşüm",
  question_text: "Yazılım ve BT projelerinde 2 haftalık Sprint ve Günlük Scrum (Daily Standup) uygulanıyor mu?",
  description: "Agile metodoloji uygulama sıklığı",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_prj_001", value: "yes", label: "Evet, Scrum ritüelleri düzenli uygulanmaktadır", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_prj_001", value: "no", label: "Hayır, Waterfall şelale modeli uygulanmaktadır", sort_order: 2, is_other: 0, created_at: "" },
  ],
  is_required: 1,
  sort_order: 48,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
const customQ = adaptCustomQuestionToQuestion(mockCustomQ, 48);

assert(customQ.id === "cq_prj_001", "Custom question ID eşleşti");
assert(customQ.is_custom === true, "is_custom = true");
assert(customQ.process === "Çevik (Agile / Scrum) Dönüşüm", "Process eşleşti");
assert(customQ.options?.length === 2, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions.find((q) => q.id === "PRJ-001")!;
const formattedQ1 = formatAnswer(q1, {
  selected: [{
    value: "merkezi_pmo_ve_standart_metodoloji_var",
    note: "PMO Direktörlüğü altında 6 PMP sertifikalı proje yöneticisi görev yapmaktadır.",
  }],
  general_note: "ERP dönüşümünde hibrit (Agile + Waterfall) model benimsenecek.",
});

assert(formattedQ1.isAnswered === true, "formattedQ1.isAnswered = true");
assert(
  formattedQ1.summaryText.includes("Merkezi Proje Yönetim Ofisi (PMO) ve yazılı"),
  "Kullanıcı dostu label formatlandı"
);
assert(
  formattedQ1.summaryText.includes("PMO Direktörlüğü altında 6 PMP sertifikalı proje yöneticisi"),
  "Seçenek notu formatlandı"
);
assert(
  formattedQ1.summaryText.includes("ERP dönüşümünde hibrit (Agile + Waterfall) model benimsenecek."),
  "Genel not formatlandı"
);

// ─── TEST 12 & 13: DOCX & PDF Export ─────────────────────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with PROJECT_MANAGEMENT Data ===");
const mockPrjReportModel: ReportModel = {
  metadata: {
    title: "ERP / Proje Yönetimi Keşif Raporu",
    projectName: "Proje Yönetimi, WBS, Takvim, Bütçe ve Cut-over Olgunluk Keşfi",
    companyName: "Örnek Mühendislik ve Sanayi A.Ş.",
    generatedAt: "21.08.2026",
    projectStatus: "completed",
    packVersions: { PROJECT_MANAGEMENT: "tr.project_management.core v0.1.0" },
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
    companyName: "Örnek Mühendislik ve Sanayi A.Ş.",
    tradeName: "Örnek Mühendislik",
    taxNumber: "9876543210",
    city: "Ankara",
    country: "Türkiye",
    employeeCount: "320",
    notes: "Şirketin ETO müşteri projeleri ve ERP dönüşüm hazırlığı incelendi.",
  },
  profile: {
    analysis_project_id: "p_faz35",
    executive_summary: "WBS ve proje bütçe entegrasyonu kurulmalı, ERP üzerinde timesheet ve cut-over planlaması yapılmalıdır.",
    overall_assessment: "Merkezi PMO yapısı güçlendirilmeli ve Stage-Gate onay mekanizması dijitalleştirilmelidir.",
    open_topics: "Taşeron hakedişlerinin proje kilometre taşlarına bağlanması.",
  },
  scope: [{
    code: "PROJECT_MANAGEMENT",
    nameTr: "Proje Yönetimi",
    nameEn: "Project Management",
    category: "Yönetim",
    departmentName: "Proje Yönetim Direktörlüğü",
    responsiblePerson: "Selim Koçak",
    status: "completed",
    hasPack: true,
    progressPercentage: 100,
    answeredCount: 25,
    totalQuestionCount: 25,
  }],
  businessFunctions: [{
    code: "PROJECT_MANAGEMENT",
    nameTr: "Proje Yönetimi",
    nameEn: "Project Management",
    category: "Yönetim",
    sortOrder: 23,
    departmentName: "Proje Yönetim Direktörlüğü",
    responsiblePerson: "Selim Koçak",
    status: "completed",
    packId: "tr.project_management.core",
    packVersion: "0.1.0",
    progressPercentage: 100,
    answeredCount: 25,
    totalQuestionCount: 25,
    processes: [{
      name: "Proje Yönetimi Organizasyonu ve Sorumluluklar",
      order: 1,
      questions: [{
        id: "PRJ-001",
        order: 1,
        process: "Proje Yönetimi Organizasyonu ve Sorumluluklar",
        questionText: pack.questions.find((q) => q.id === "PRJ-001")!.question,
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
const docxBuffer = await buildDocxBuffer(mockPrjReportModel);
assert(docxBuffer.byteLength > 5000, `DOCX üretimi başarılı (${docxBuffer.byteLength} byte)`);

// PDF Test
const pdfBuffer = await buildPdfBuffer(mockPrjReportModel);
assert(pdfBuffer.byteLength > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.byteLength} byte)`);

const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;

assert(pdfText.includes("Proje Yönetimi"), "PDF çıktısında 'Proje Yönetimi' başlığı mevcut");
assert(pdfText.includes("Örnek Mühendislik"), "PDF çıktısında firma adı mevcut (Türkçe UTF-8 doğru)");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
assert(
  getPackIdForFunction("PROJECT_MANAGEMENT") === "tr.project_management.core",
  "getPackIdForFunction('PROJECT_MANAGEMENT') -> tr.project_management.core"
);
assert(
  getPackIdForFunction("PROJECTS") === "tr.project_management.core",
  "getPackIdForFunction('PROJECTS') -> tr.project_management.core (Alias)"
);
assert(
  getPackIdForFunction("PROJE_YONETIMI") === "tr.project_management.core",
  "getPackIdForFunction('PROJE_YONETIMI') -> tr.project_management.core (Türkçe Alias)"
);

// ─── SUMMARY ─────────────────────────────────────────────────────────────────
const total = passCount + failCount;
console.log("\n══════════════════════════════════════════════════════");
console.log(`FAZ-35 PROJECT_MANAGEMENT TEST SONUCU: ${passCount}/${total} PASS`);
console.log("══════════════════════════════════════════════════════\n");

if (failCount === 0) {
  console.log("✅ FAZ-35 KABUL: Tüm testler geçti — PROJECT_MANAGEMENT Question Pack mühürlendi.");
  process.exit(0);
} else {
  console.error(`❌ FAZ-35 KABUL BAŞARISIZ: ${failCount} test hatası!`);
  process.exit(1);
}
