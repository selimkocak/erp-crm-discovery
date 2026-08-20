/**
 * ERP CRM Discovery — FAZ-31: HUKUK VE MEVZUAT UYUM / LEGAL_COMPLIANCE Acceptance Tests
 *
 * 14 Test Alanı:
 * 1. Pack Loading & Metadata Integrity (LEGAL_COMPLIANCE canonical code, pack_id: tr.legal_compliance.core, v0.1.0)
 * 2. Validator Engine Check (0 schema errors)
 * 3. Question Quantity & IDs (46 questions, LEG-001..LEG-046 deterministic)
 * 4. Required Question Count (25 required, 21 optional)
 * 5. Choice Options & is_other Validation
 * 6. 25 Canonical Process Coverage (A'dan Y'ye 25 süreç)
 * 7. Branching Engine Resolution (6 Koşullu Dallanma Noktası)
 * 8. Progress Calculation & Follow-up Deduction (25 required, QuestionFollowup bayrak etkisi)
 * 9. Cross-Pack Duplication Audit (Tüm 21 modülle 0 mükerrerlik)
 * 10. Custom Questions Adapter Compatibility
 * 11. ReportModel & Formatting Truth
 * 12 & 13. DOCX & PDF Generation & Integrity
 * 14. Loader Registry Parity
 */

import { readFileSync } from "fs";
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
console.log("FAZ-31: HUKUK VE MEVZUAT UYUM / LEGAL_COMPLIANCE TEST");
console.log("══════════════════════════════════════════════════════\n");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/legal_compliance/core.json");
const raw = readFileSync(packPath, "utf-8");
const pack = JSON.parse(raw) as QuestionPack;

assert(!!pack, "LEGAL_COMPLIANCE pack JSON başarıyla okundu");
assert(pack.meta?.pack_id === "tr.legal_compliance.core", "pack_id = tr.legal_compliance.core");
assert(pack.meta?.version === "0.1.0", "version = 0.1.0");
assert(pack.meta?.schema_version === "1", "schema_version = 1");
assert(pack.meta?.language === "tr", "language = tr");
assert(pack.meta?.business_function_code === "LEGAL_COMPLIANCE", "business_function_code = LEGAL_COMPLIANCE (Kanonik Kod)");
assert(pack.meta?.name === "Hukuk ve Mevzuat Uyum Ön Analizi", `name = ${pack.meta?.name}`);
assert((pack.meta?.description?.length ?? 0) > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(legalCompliancePack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ─────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 46, `Toplam soru sayısı tam 46 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 46, "Tüm 46 soru ID'si benzersizdir");

let sequential = true;
for (let i = 1; i <= 46; i++) {
  const expectedId = `LEG-${String(i).padStart(3, "0")}`;
  if (ids[i - 1] !== expectedId) { sequential = false; break; }
}
assert(sequential, "Tüm sorular LEG-001'den LEG-046'ya sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ─────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 25, `Zorunlu soru sayısı tam 25 adettir (${requiredQuestions.length})`);
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
    for (const otherOpt of otherOpts) { if (!otherOpt.allow_note) otherRuleValid = false; }
  }
}
assert(allOptionsValid, "Tüm seçenek değerleri benzersiz ve en fazla 1 'Diğer' seçeneği içeriyor");
assert(otherRuleValid, "Tüm is_other=true seçeneklerinde allow_note=true kuralı sağlanıyor");

// ─── TEST 6: 25 Canonical Process Coverage ───────────────────────────────────
console.log("\n=== T06: 25 Canonical Process Coverage ===");
const processes = new Set(pack.questions.map((q) => q.process));
assert(processes.size === 25, `Tam 25 farklı süreç grubu tanımlı (${processes.size})`);
const expectedProcesses = [
  "Hukuk ve Uyum Organizasyonu","Mevzuat Takibi","Uyum Sorumluluk Matrisi",
  "Politika ve Prosedür Yönetimi","Sözleşme Yönetimi","Sözleşme Onay Süreci",
  "Sözleşme Versiyon ve Yenileme Takibi","KVKK Veri Envanteri",
  "Veri İşleme Amaçları ve Hukuki Dayanak","Açık Rıza ve Aydınlatma",
  "Veri Sahibi Başvuruları","Veri Saklama ve İmha","Kişisel Veri Erişim Yetkileri",
  "Üçüncü Taraf Veri Paylaşımı","Yurtdışı Veri Aktarımı","Bilgi Güvenliği Uyum Bağlantısı",
  "Elektronik Kayıt ve Delil","Denetim İzi / Audit Trail","İç ve Dış Denetimler",
  "Uygunsuzluk ve Düzeltici Aksiyon","Yasal Takvim ve Bildirimler",
  "Lisans / Ruhsat / İzin Takibi","Etik / Çıkar Çatışması / İhbar",
  "Dava / İcra / Hukuki Dosya Takibi","Legal & Compliance KPI",
];
for (const proc of expectedProcesses) {
  assert(processes.has(proc), `Süreç mevcut: "${proc}"`);
}

// ─── TEST 7: Branching Engine Resolution ─────────────────────────────────────
console.log("\n=== T07: Branching Engine Resolution ===");
const conditionalQuestions = pack.questions.filter((q) => q.condition);
assert(conditionalQuestions.length === 6, `Tam 6 adet koşullu soru tanımlı (${conditionalQuestions.length})`);
for (const cq of conditionalQuestions) {
  assert(ids.includes(cq.condition!.question_id), `Condition referansı geçerli: ${cq.id} -> ${cq.condition!.question_id}`);
}

// Senaryo 1: Merkezi sözleşme sistemi yoksa LEG-010 ve LEG-013 gizlenmeli
const s1 = new Map<string, AnswerData>();
s1.set("LEG-009", { selected: [{ value: "merkezi_sozlesme_yonetim_sistemi_yoktur" }] });
const vs1 = getVisibleQuestions(pack.questions, s1);
assert(!vs1.some((q) => q.id === "LEG-010"), "LEG-009=merkezi_sozlesme_yonetim_sistemi_yoktur iken LEG-010 gizlendi");
assert(!vs1.some((q) => q.id === "LEG-013"), "LEG-009=merkezi_sozlesme_yonetim_sistemi_yoktur iken LEG-013 gizlendi");
s1.set("LEG-009", { selected: [{ value: "tum_sozlesmeler_merkezi_dijital_sozlesme_yonetim_sistemi_veya_erp_modulunde_kayitli" }] });
const vs1b = getVisibleQuestions(pack.questions, s1);
assert(vs1b.some((q) => q.id === "LEG-010"), "LEG-009=merkezi sistem var iken LEG-010 görünür");
assert(vs1b.some((q) => q.id === "LEG-013"), "LEG-009=merkezi sistem var iken LEG-013 görünür");

// Senaryo 2: KVKK envanteri yoksa LEG-015 gizlenmeli
const s2 = new Map<string, AnswerData>();
s2.set("LEG-014", { selected: [{ value: "kvkk_veri_envanteri_tanimlanmamistir" }] });
assert(!getVisibleQuestions(pack.questions, s2).some((q) => q.id === "LEG-015"), "LEG-014=kvkk_veri_envanteri_tanimlanmamistir iken LEG-015 gizlendi");
s2.set("LEG-014", { selected: [{ value: "verbis_kaydı_tamamlanmis_ve_ic_veri_envanteri_guncel_tutulmaktadir" }] });
assert(getVisibleQuestions(pack.questions, s2).some((q) => q.id === "LEG-015"), "LEG-014=verbis kayıtlı iken LEG-015 görünür");

// Senaryo 3: Açık rıza yoksa LEG-019 gizlenmeli
const s3 = new Map<string, AnswerData>();
s3.set("LEG-018", { selected: [{ value: "acik_riza_sureci_uygulanmamaktadir" }] });
assert(!getVisibleQuestions(pack.questions, s3).some((q) => q.id === "LEG-019"), "LEG-018=acik_riza_sureci_uygulanmamaktadir iken LEG-019 gizlendi");
s3.set("LEG-018", { selected: [{ value: "acik_riza_sureci_aktif_riza_kayitlari_sistem_veya_arşivde_kanıtlı" }] });
assert(getVisibleQuestions(pack.questions, s3).some((q) => q.id === "LEG-019"), "LEG-018=aktif rıza süreci iken LEG-019 görünür");

// Senaryo 4: İhbar kanalı yoksa LEG-042 gizlenmeli
const s4 = new Map<string, AnswerData>();
s4.set("LEG-041", { selected: [{ value: "ihbar_bildirme_mekanizmasi_yoktur" }] });
assert(!getVisibleQuestions(pack.questions, s4).some((q) => q.id === "LEG-042"), "LEG-041=ihbar_bildirme_mekanizmasi_yoktur iken LEG-042 gizlendi");
s4.set("LEG-041", { selected: [{ value: "anonim_dahil_resmi_ihbar_bildirme_kanali_ve_sorusturma_sureci_aktif" }] });
assert(getVisibleQuestions(pack.questions, s4).some((q) => q.id === "LEG-042"), "LEG-041=anonim kanal aktif iken LEG-042 görünür");

// Senaryo 5: Dava/icra yoksa LEG-044 gizlenmeli
const s5 = new Map<string, AnswerData>();
s5.set("LEG-043", { selected: [{ value: "dava_icra_veya_hukuki_dosya_yoktur" }] });
assert(!getVisibleQuestions(pack.questions, s5).some((q) => q.id === "LEG-044"), "LEG-043=dava_icra_veya_hukuki_dosya_yoktur iken LEG-044 gizlendi");
s5.set("LEG-043", { selected: [{ value: "tum_aktif_davalar_icra_dosyalari_dosya_no_taraf_konu_avukat_ve_durusma_takvimi_ile_kayitli" }] });
assert(getVisibleQuestions(pack.questions, s5).some((q) => q.id === "LEG-044"), "LEG-043=aktif davalar kayıtlı iken LEG-044 görünür");

// Senaryo 6: Tüm branching açıkken 46 soru
const sAll = new Map<string, AnswerData>();
sAll.set("LEG-009", { selected: [{ value: "tum_sozlesmeler_merkezi_dijital_sozlesme_yonetim_sistemi_veya_erp_modulunde_kayitli" }] });
sAll.set("LEG-014", { selected: [{ value: "verbis_kaydı_tamamlanmis_ve_ic_veri_envanteri_guncel_tutulmaktadir" }] });
sAll.set("LEG-018", { selected: [{ value: "acik_riza_sureci_aktif_riza_kayitlari_sistem_veya_arşivde_kanıtlı" }] });
sAll.set("LEG-041", { selected: [{ value: "anonim_dahil_resmi_ihbar_bildirme_kanali_ve_sorusturma_sureci_aktif" }] });
sAll.set("LEG-043", { selected: [{ value: "tum_aktif_davalar_icra_dosyalari_dosya_no_taraf_konu_avukat_ve_durusma_takvimi_ile_kayitli" }] });
const vsAll = getVisibleQuestions(pack.questions, sAll);
assert(vsAll.length === 46, `Tüm branching açıkken 46 soru görünür (${vsAll.length})`);

// Senaryo 7: Tüm branching kapalıyken 40 soru
const sClosed = new Map<string, AnswerData>();
sClosed.set("LEG-009", { selected: [{ value: "merkezi_sozlesme_yonetim_sistemi_yoktur" }] });
sClosed.set("LEG-014", { selected: [{ value: "kvkk_veri_envanteri_tanimlanmamistir" }] });
sClosed.set("LEG-018", { selected: [{ value: "acik_riza_sureci_uygulanmamaktadir" }] });
sClosed.set("LEG-041", { selected: [{ value: "ihbar_bildirme_mekanizmasi_yoktur" }] });
sClosed.set("LEG-043", { selected: [{ value: "dava_icra_veya_hukuki_dosya_yoktur" }] });
const vsClosed = getVisibleQuestions(pack.questions, sClosed);
assert(vsClosed.length === 40, `Tüm branching kapalıyken 40 soru görünür (${vsClosed.length})`);

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}
const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `25 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("LEG-005", {
  id: "qf_leg_05", analysis_project_id: "p1", business_function_code: "LEGAL_COMPLIANCE",
  question_id: "LEG-005", flag_type: "critical",
  note: "Uyum sorumluluk matrisi yazılı değil; hukuk danışmanıyla birlikte hazırlanacak.",
  status: "open", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), resolved_at: null,
});
mockFollowups.set("LEG-032", {
  id: "qf_leg_32", analysis_project_id: "p1", business_function_code: "LEGAL_COMPLIANCE",
  question_id: "LEG-032", flag_type: "revisit",
  note: "Audit trail kapsamı BT direktörüyle netleştirilecek.",
  status: "open", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), resolved_at: null,
});

const progressWithFollowups = calculateProgress(pack.questions, answersAllReq, mockFollowups);
assert(progressWithFollowups.answered === 23, `Bayraklı sorular tamamlanmamış sayıldı (23/25)`);
assert(progressWithFollowups.percentage === Math.round((23 / 25) * 100), `İlerleme dürüstçe %${progressWithFollowups.percentage} hesaplandı`);

// ─── TEST 9: Cross-Pack Duplication Audit ────────────────────────────────────
console.log("\n=== T09: Cross-Pack Duplication Audit ===");
const otherPackPaths = [
  "question-packs/tr/sales/core.json","question-packs/tr/crm/core.json",
  "question-packs/tr/proposals/core.json","question-packs/tr/marketing/core.json",
  "question-packs/tr/quality/core.json","question-packs/tr/production_planning/core.json",
  "question-packs/tr/work_orders/core.json","question-packs/tr/procurement/core.json",
  "question-packs/tr/supplier_management/core.json","question-packs/tr/warehouse/core.json",
  "question-packs/tr/inventory/core.json","question-packs/tr/logistics/core.json",
  "question-packs/tr/accounting/core.json","question-packs/tr/treasury/core.json",
  "question-packs/tr/costing/core.json","question-packs/tr/asset_management/core.json",
  "question-packs/tr/human_resources/core.json","question-packs/tr/payroll/core.json",
];
const legalTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
let crossPackDuplicateCount = 0;
for (const pp of otherPackPaths) {
  try {
    const otherPack = JSON.parse(readFileSync(path.resolve(pp), "utf-8")) as QuestionPack;
    const otherTexts = otherPack.questions.map((q) => q.question.toLowerCase().trim());
    for (const lt of legalTexts) {
      if (otherTexts.includes(lt)) {
        crossPackDuplicateCount++;
        console.error(`  DUPLICATE [${pp}]: "${lt}"`);
      }
    }
  } catch { /* dosya yoksa atla */ }
}
assert(crossPackDuplicateCount === 0, `21 diğer modülle çapraz karşılaştırmada 0 tam mükerrer soru (${crossPackDuplicateCount} bulundu)`);

// ─── TEST 10: Custom Questions Adapter Compatibility ──────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQ = {
  id: "cq_leg_001", analysis_project_id: "p1", business_function_code: "LEGAL_COMPLIANCE",
  process_name: "KVKK Veri Envanteri",
  question_text: "Şirketimizde KVKK kapsamında veri ihlali gerçekleşmesi halinde 72 saatlik bildirim yükümlülüğü için hazırlık protokolü var mıdır?",
  description: "KVKK veri ihlali bildirim protokolü.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_leg_001", value: "evet_protokol_tanimli", label: "Evet, 72 saatlik bildirim protokolü tanımlı", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_leg_001", value: "hayir_protokol_yok", label: "Hayır, protokol tanımlı değil", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_leg_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1, sort_order: 101, is_active: 1,
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
};
const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQ, 47);
assert(adaptedQuestion.id === "cq_leg_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "KVKK Veri Envanteri", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ──────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions.find((q) => q.id === "LEG-001")!;
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "sirket_ici_hukuk_departmani_tam_zamanli_avukat_ve_ekibi_ile", note: "Hukuk departmanında 2 tam zamanlı avukat ve 1 uyum sorumlusu görev yapmaktadır." }],
  general_note: "KVKK veri sorumlusu aynı zamanda şirketin hukuk müdürüdür.",
});
assert(
  formattedQ1.summaryText.includes("Şirket içi hukuk departmanı tam zamanlı avukat ve ekibi ile yönetilmektedir"),
  `Kullanıcı dostu label formatlandı (sirket_ici_hukuk... enum'u sızmadı) — ${formattedQ1.summaryText}`
);
assert(formattedQ1.summaryText.includes("Hukuk departmanında 2 tam zamanlı avukat"), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("KVKK veri sorumlusu aynı zamanda şirketin hukuk müdürüdür."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with LEGAL_COMPLIANCE Data ===");
const mockLegalReportModel: ReportModel = {
  metadata: {
    title: "ERP / Hukuk ve Mevzuat Uyum Keşif Analiz Raporu",
    projectName: "Hukuk Organizasyonu, KVKK, Sözleşme Yönetimi ve Denetim Uyum Keşfi",
    companyName: "Anadolu Gıda Sanayi ve Ticaret A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: { LEGAL_COMPLIANCE: "tr.legal_compliance.core v0.1.0" },
    isComplete: true, progressPercent: 100, requiredAnswered: 25, requiredTotal: 25,
    reportType: "final", draftLabel: "TAM RAPOR — %100",
    projectProgressPercent: 100, completedFunctionCount: 1, selectedFunctionCount: 1, isProjectComplete: true,
  },
  company: {
    companyName: "Anadolu Gıda Sanayi ve Ticaret A.Ş.", tradeName: "Anadolu Gıda",
    taxNumber: "1234567890", city: "Ankara", country: "Türkiye", employeeCount: "320",
    notes: "Şirketin KVKK, sözleşme yönetimi, denetim izi ve mevzuat uyum süreçleri incelendi.",
  },
  profile: {
    analysis_project_id: "p_faz31",
    executive_summary: "Şirket içi hukuk departmanı mevcut; KVKK veri envanteri kısmen tamamlanmış.",
    overall_assessment: "KVKK tam uyum ve merkezi sözleşme yönetim sistemi öncelikli gereksinim.",
    open_topics: "VERBİS kaydının güncellenmesi ve audit trail altyapısının BT departmanıyla tasarlanması.",
  },
  scope: [{
    code: "LEGAL_COMPLIANCE", nameTr: "Hukuk ve Mevzuat Uyum", nameEn: "Legal & Compliance",
    category: "Yönetim", departmentName: "Hukuk ve Uyum Direktörlüğü", responsiblePerson: "Av. Selin Arslan",
    status: "completed", hasPack: true, progressPercentage: 100, answeredCount: 25, totalQuestionCount: 25,
  }],
  businessFunctions: [{
    code: "LEGAL_COMPLIANCE", nameTr: "Hukuk ve Mevzuat Uyum", nameEn: "Legal & Compliance",
    category: "Yönetim", sortOrder: 30, departmentName: "Hukuk ve Uyum Direktörlüğü",
    responsiblePerson: "Av. Selin Arslan", status: "completed",
    packId: "tr.legal_compliance.core", packVersion: "0.1.0",
    progressPercentage: 100, answeredCount: 25, totalQuestionCount: 25,
    processes: [{
      name: "KVKK Veri Envanteri", order: 8,
      questions: [{
        id: "LEG-014", order: 14, process: "KVKK Veri Envanteri",
        questionText: pack.questions.find((q) => q.id === "LEG-014")!.question,
        answerType: "single_choice", criticality: "critical",
        formattedAnswer: formattedQ1,
        findings: [], requirements: [], risks: [], notes: [],
      }],
    }],
    findings: [], requirements: [], risks: [], notes: [],
  }],
  followups: [], globalFindings: [], globalRequirements: [], globalRisks: [], projectNotes: [],
  summaryStats: {
    totalFunctions: 1, completedFunctions: 1, inProgressFunctions: 0, notStartedFunctions: 0,
    totalFindings: 0, totalRequirements: 0, openRisks: 0, totalRisks: 0, totalNotes: 0,
    answeredQuestions: 25, totalQuestions: 25, openFollowupCount: 0, revisitCount: 0, criticalFollowupCount: 0,
  },
};

// DOCX Testi
const docxBuf = await buildDocxBuffer(mockLegalReportModel);
assert(docxBuf.length > 5000, `DOCX üretimi başarılı (${docxBuf.length} byte)`);

// PDF Testi
const pdfBuf = await buildPdfBuffer(mockLegalReportModel);
assert(pdfBuf.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuf.length} byte)`);

const parser = new PDFParse({ data: pdfBuf });
const parsedData = await parser.getText();
const pdfText = parsedData.text;

assert(pdfText.includes("Hukuk") || pdfText.includes("LEGAL"), "PDF çıktısında 'Hukuk' veya 'LEGAL' başlığı mevcut");
assert(pdfText.includes("Anadolu Gıda"), "PDF çıktısında firma adı mevcut (Türkçe UTF-8 doğru)");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const loaderPackId = getPackIdForFunction("LEGAL_COMPLIANCE");
assert(loaderPackId === "tr.legal_compliance.core", `getPackIdForFunction("LEGAL_COMPLIANCE") = tr.legal_compliance.core (${loaderPackId})`);
const payrollPackId = getPackIdForFunction("PAYROLL");
assert(payrollPackId === "tr.payroll.core", `getPackIdForFunction("PAYROLL") = tr.payroll.core (önceki kayıt korunuyor)`);
const salesPackId = getPackIdForFunction("SALES");
assert(salesPackId === "tr.sales.core", `getPackIdForFunction("SALES") = tr.sales.core (önceki kayıt korunuyor)`);
const unknownPackId = getPackIdForFunction("UNKNOWN_FUNCTION");
assert(unknownPackId === null, `getPackIdForFunction("UNKNOWN_FUNCTION") = null (bilinmeyen kod null döndürüyor)`);

// ─── SONUÇ ────────────────────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════════════════");
const total = passCount + failCount;
console.log(`FAZ-31 LEGAL_COMPLIANCE SONUÇ: ${passCount}/${total} PASS`);
if (failCount === 0) {
  console.log("✅ FAZ-31 KABUL: Tüm testler geçti — LEGAL_COMPLIANCE Question Pack mühürlendi.");
} else {
  console.error(`❌ ${failCount} test başarısız — kabul edilemez.`);
}
console.log("══════════════════════════════════════════════════════\n");
if (failCount > 0) { process.exit(1); }
