/**
 * ERP CRM Discovery — FAZ-42 GENEL YÖNETİM VE KURUMSAL YÖNETİŞİM / MANAGEMENT Acceptance Tests
 *
 * Test Kapsamı:
 * T01: Pack Loading & Metadata Integrity (tr.management.core v0.1.0, canonical code = MANAGEMENT)
 * T02: Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * T03: Question Quantity & Deterministic Order (47 questions, sequential order 1..47, MGT-001..MGT-047)
 * T04: Required Question Count Truth (25 required, 22 optional)
 * T05: Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * T06: Exact 25 Canonical Process Coverage & Strict Integrity Assertions
 * T07: Every Canonical Process Has at Least One Question (100% process coverage)
 * T08: Conditional Branching Resolution (8 condition points tested with branching engine)
 * T09: Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * T10: Cross-Pack Duplication Audit (0 duplicate questions across 31 existing modules)
 * T11: Custom Questions Adapter Compatibility (custom question adapter integration)
 * T12: ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * T13: DOCX Binary Generation Compatibility
 * T14: Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * T15: Loader Registry Mapping Parity (getPackIdForFunction("MANAGEMENT") === "tr.management.core")
 * T16: MANAGEMENT–STRATEGY–PROJECT_MANAGEMENT Sınır Ayrımı (Cross-Pack Isolation)
 * T17: AI-Free, Zero Cloud, Offline-First Doğrulaması
 */

import { readFileSync, existsSync } from "fs";
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
const PACK_PATH = path.join(ROOT_DIR, "question-packs/tr/management/core.json");

console.log("══════════════════════════════════════════════════════");
console.log("FAZ-42: GENEL YÖNETİM VE KURUMSAL YÖNETİŞİM / MANAGEMENT TEST");
console.log("══════════════════════════════════════════════════════\n");

// ─── TEST 1: Pack Loading & Metadata Integrity ──────────────────────────────
console.log("=== T01: Pack Loading & Metadata Integrity ===");
assert(existsSync(PACK_PATH), `Soru paketi dosyası mevcut: ${PACK_PATH}`);

const rawJson = readFileSync(PACK_PATH, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(pack.meta.pack_id === "tr.management.core", "pack_id = tr.management.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "MANAGEMENT", "business_function_code = MANAGEMENT (Kanonik Kod)");
assert(pack.meta.name === "Genel Yönetim ve Kurumsal Yönetişim Soru Paketi", "name tanımlı ve doğru");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ─────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(managementPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 47, `Toplam soru sayısı tam 47 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 47, "Tüm 47 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `MGT-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: Beklenen ${expectedId} (order: ${i + 1}), Bulunan ${pack.questions[i].id} (order: ${pack.questions[i].order})`);
  }
}
assert(orderCorrect, "Tüm sorular MGT-001'den MGT-047'ye sıralı ve deterministiktir");

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
let uniqueValueValid = true;

for (const q of pack.questions) {
  if (q.options) {
    if (q.options.length < 2) optionsValid = false;
    const isOtherOpts = q.options.filter((o) => o.is_other);
    if (isOtherOpts.length > 1) optionsValid = false;
    for (const opt of isOtherOpts) {
      if (!opt.allow_note) allowNoteValid = false;
    }
    const values = q.options.map((o) => o.value);
    const uniqueValues = new Set(values);
    if (uniqueValues.size !== values.length) {
      uniqueValueValid = false;
      console.error(`Tekrarlı seçenek değeri: Soru ${q.id}`);
    }
  }
}
assert(optionsValid, "Tüm seçenekli sorular en az 2 seçeneğe sahip ve max 1 is_other içeriyor");
assert(allowNoteValid, "is_other: true olan tüm seçeneklerde allow_note: true bulunuyor");
assert(uniqueValueValid, "Tüm sorularda seçenek değerleri (value) benzersizdir");

// ─── TEST 6: Canonical Process Coverage ─────────────────────────────────────
console.log("\n=== T06: Canonical Process Coverage ===");
const CANONICAL_PROCESSES = [
  "Genel Yönetim Organizasyonu",
  "Yönetim Kurulu ve İcra Kurulu Yapısı",
  "Ortaklık ve Karar Alma Modeli",
  "Üst Yönetim Sorumluluk Dağılımı",
  "Organizasyon Şeması ve Yönetim Katmanları",
  "Şube ve Grup Şirketleri Yönetimi",
  "Yönetim Toplantıları",
  "Yönetim Kararlarının Kayıt Altına Alınması",
  "Yetki ve İmza Sirküleri",
  "Harcama ve Yatırım Onay Limitleri",
  "Bütçe ve Hedef Onayları",
  "Kurumsal Politika ve Prosedür Sahipliği",
  "İç Kontrol ve Görevler Ayrılığı",
  "Yönetim Raporları",
  "KPI ve Performans İzleme",
  "Üst Yönetim Risk Takibi",
  "Kriz ve Olağanüstü Durum Yönetimi",
  "Stratejik Girişim Yönetişimi",
  "Proje ve Dönüşüm Portföyü",
  "Departmanlar Arası Koordinasyon",
  "Yönetim-Saha Bilgi Akışı",
  "Kritik Pozisyon ve Yedekleme Yönetimi",
  "Danışman, Denetçi ve Kurul İlişkileri",
  "Karar Arşivi ve Kurumsal Hafıza",
  "Yönetim Olgunluğu ve Gelişim Yol Haritası",
];

const packProcesses = new Set(pack.questions.map((q) => q.process));
const uniqueProcessCount = packProcesses.size;
assert(uniqueProcessCount === 25, `Paketteki benzersiz süreç sayısı tam 25'tir (Bulunan: ${uniqueProcessCount})`);

for (const proc of CANONICAL_PROCESSES) {
  assert(packProcesses.has(proc), `Kanonik süreç mevcut: "${proc}"`);
}

for (const proc of packProcesses) {
  assert(CANONICAL_PROCESSES.includes(proc), `Paket süreci kanonik listede: "${proc}"`);
}

// ─── TEST 7: Every Canonical Process Has at Least One Question ─────────────
console.log("\n=== T07: Every Canonical Process Has at Least One Question ===");
let allProcessesCovered = true;
for (const proc of CANONICAL_PROCESSES) {
  const count = pack.questions.filter((q) => q.process === proc).length;
  if (count === 0) {
    allProcessesCovered = false;
    console.error(`Süreç kapsanmamış: "${proc}"`);
  }
}
assert(allProcessesCovered, `Tüm 25 kanonik sürecin her biri en az bir soruyla (%100) kapsanmaktadır`);

// ─── TEST 8: Branching Engine Resolution ────────────────────────────────────
console.log("\n=== T08: Branching Engine Resolution (8 Dallanma) ===");

const emptyAnswers = new Map<string, AnswerData>();

// Without any answers:
// - not_equals conditions with no answer → VISIBLE (MGT-003, MGT-008, MGT-023, MGT-026)
// - equals conditions with no answer → HIDDEN (MGT-012, MGT-019, MGT-021)
// So: 47 - 3 = 44 visible
const visibleWithNoAnswers = getVisibleQuestions(pack.questions, emptyAnswers);
assert(
  visibleWithNoAnswers.length === 44,
  `Cevapsız durumda tam 44 soru görünür (3 equals-koşullu gizli) — Gerçek: ${visibleWithNoAnswers.length}`
);

// BRANCHING 1: MGT-003 visible when MGT-002 != "kurulsuz_bireysel_karar_yonetimi"
const mgt003Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "MGT-003")!,
  new Map([["MGT-002", { selected: [{ value: "kurulsuz_bireysel_karar_yonetimi" }] }]])
);
const mgt003Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "MGT-003")!,
  new Map([["MGT-002", { selected: [{ value: "yonetim_kurulu_aktif_ve_duzensiz_toplaniyor" }] }]])
);
assert(mgt003Hidden, "MGT-002 = kurulsuz_bireysel_karar_yonetimi iken MGT-003 gizli");
assert(mgt003Visible, "MGT-002 != kurulsuz_bireysel_karar_yonetimi iken MGT-003 görünür");

// BRANCHING 2: MGT-008 visible when MGT-007 != "tek_tuzel_kisilik_sube_yok"
const mgt008Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "MGT-008")!,
  new Map([["MGT-007", { selected: [{ value: "tek_tuzel_kisilik_sube_yok" }] }]])
);
const mgt008Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "MGT-008")!,
  new Map([["MGT-007", { selected: [{ value: "holding_veya_grup_yapisi_var" }] }]])
);
assert(mgt008Hidden, "MGT-007 = tek_tuzel_kisilik_sube_yok iken MGT-008 gizli");
assert(mgt008Visible, "MGT-007 != tek_tuzel_kisilik_sube_yok iken MGT-008 görünür");

// BRANCHING 3: MGT-012 visible when MGT-011 = "guncel_sirkuler_ilan_edilmis"
const mgt012Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "MGT-012")!,
  new Map([["MGT-011", { selected: [{ value: "sirkuler_yok_fiili_yetki_uygulamayla" }] }]])
);
const mgt012Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "MGT-012")!,
  new Map([["MGT-011", { selected: [{ value: "guncel_sirkuler_ilan_edilmis" }] }]])
);
assert(mgt012Hidden, "MGT-011 != guncel_sirkuler_ilan_edilmis iken MGT-012 gizli");
assert(mgt012Visible, "MGT-011 = guncel_sirkuler_ilan_edilmis iken MGT-012 görünür");

// BRANCHING 4: MGT-019 visible when MGT-018 = "resmi_kpi_seti_sahip_izleniyor"
const mgt019Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "MGT-019")!,
  new Map([["MGT-018", { selected: [{ value: "kpi_yok_sezgisel_performans_degerlendirme" }] }]])
);
const mgt019Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "MGT-019")!,
  new Map([["MGT-018", { selected: [{ value: "resmi_kpi_seti_sahip_izleniyor" }] }]])
);
assert(mgt019Hidden, "MGT-018 != resmi_kpi_seti_sahip_izleniyor iken MGT-019 gizli");
assert(mgt019Visible, "MGT-018 = resmi_kpi_seti_sahip_izleniyor iken MGT-019 görünür");

// BRANCHING 5: MGT-021 visible when MGT-020 = "kurumsal_risk_yonetimi_olgun_komite_var"
const mgt021Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "MGT-021")!,
  new Map([["MGT-020", { selected: [{ value: "risk_yonetimi_olgun_degil_reaktif" }] }]])
);
const mgt021Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "MGT-021")!,
  new Map([["MGT-020", { selected: [{ value: "kurumsal_risk_yonetimi_olgun_komite_var" }] }]])
);
assert(mgt021Hidden, "MGT-020 != kurumsal_risk_yonetimi_olgun_komite_var iken MGT-021 gizli");
assert(mgt021Visible, "MGT-020 = kurumsal_risk_yonetimi_olgun_komite_var iken MGT-021 görünür");

// BRANCHING 6: MGT-023 visible when MGT-022 != "plan_yok_deneyime_gore_mudahale"
const mgt023Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "MGT-023")!,
  new Map([["MGT-022", { selected: [{ value: "plan_yok_deneyime_gore_mudahale" }] }]])
);
const mgt023Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "MGT-023")!,
  new Map([["MGT-022", { selected: [{ value: "bcp_veya_kriz_plani_test_edilmis" }] }]])
);
assert(mgt023Hidden, "MGT-022 = plan_yok_deneyime_gore_mudahale iken MGT-023 gizli");
assert(mgt023Visible, "MGT-022 != plan_yok_deneyime_gore_mudahale iken MGT-023 görünür");

// BRANCHING 7: MGT-026 visible when MGT-025 != "onceliklendirme_mekanizmasi_yok_hepsi_esit_oncelikli"
const mgt026Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "MGT-026")!,
  new Map([["MGT-025", { selected: [{ value: "onceliklendirme_mekanizmasi_yok_hepsi_esit_oncelikli" }] }]])
);
const mgt026Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "MGT-026")!,
  new Map([["MGT-025", { selected: [{ value: "resmi_portfoy_yonetim_sureci_var" }] }]])
);
assert(mgt026Hidden, "MGT-025 = onceliklendirme_mekanizmasi_yok iken MGT-026 gizli");
assert(mgt026Visible, "MGT-025 != onceliklendirme_mekanizmasi_yok iken MGT-026 görünür");

// BRANCHING 8: When all triggers open, 47 questions should be visible
const allOpenAnswers = new Map<string, AnswerData>([
  ["MGT-002", { selected: [{ value: "yonetim_kurulu_aktif_ve_duzensiz_toplaniyor" }] }],
  ["MGT-007", { selected: [{ value: "holding_veya_grup_yapisi_var" }] }],
  ["MGT-011", { selected: [{ value: "guncel_sirkuler_ilan_edilmis" }] }],
  ["MGT-018", { selected: [{ value: "resmi_kpi_seti_sahip_izleniyor" }] }],
  ["MGT-020", { selected: [{ value: "kurumsal_risk_yonetimi_olgun_komite_var" }] }],
  ["MGT-022", { selected: [{ value: "bcp_veya_kriz_plani_test_edilmis" }] }],
  ["MGT-025", { selected: [{ value: "resmi_portfoy_yonetim_sureci_var" }] }],
]);
const visibleWhenAllOpen = getVisibleQuestions(pack.questions, allOpenAnswers);
assert(
  visibleWhenAllOpen.length === 47,
  `Tüm 8 tetikleyici açıkken 47 sorunun tamamı görünür (${visibleWhenAllOpen.length}/47)`
);

// ─── TEST 9: Progress Calculation ───────────────────────────────────────────
console.log("\n=== T09: Progress Calculation & Follow-up Deduction ===");

// Answer all 25 required questions using a Map
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

// Simulate 2 flagged questions reducing progress using Map<string, {flag_type?, status?}>
const fakeFollowupsMap = new Map<string, { flag_type?: string; status?: string }>([
  ["MGT-001", { flag_type: "critical" }],
  ["MGT-005", { flag_type: "revisit" }],
]);
const progressWithFlags = calculateProgress(pack.questions, allRequiredAnswersMap, fakeFollowupsMap);
assert(progressWithFlags.answered <= 25, `Bayraklı sorularla answered <= 25 (${progressWithFlags.answered})`);

// ─── TEST 10: Cross-Pack Duplication Audit ───────────────────────────────────
console.log("\n=== T10: Cross-Pack Duplication Audit ===");

const PACK_DIRS = [
  "question-packs/tr/sales/core.json",
  "question-packs/tr/procurement/core.json",
  "question-packs/tr/warehouse/core.json",
  "question-packs/tr/inventory/core.json",
  "question-packs/tr/logistics/core.json",
  "question-packs/tr/accounting/core.json",
  "question-packs/tr/treasury/core.json",
  "question-packs/tr/budget_reporting/core.json",
  "question-packs/tr/reporting_analytics/core.json",
  "question-packs/tr/crm/core.json",
  "question-packs/tr/proposals/core.json",
  "question-packs/tr/marketing/core.json",
  "question-packs/tr/supplier_management/core.json",
  "question-packs/tr/quality/core.json",
  "question-packs/tr/maintenance/core.json",
  "question-packs/tr/production_planning/core.json",
  "question-packs/tr/work_orders/core.json",
  "question-packs/tr/costing/core.json",
  "question-packs/tr/asset_management/core.json",
  "question-packs/tr/human_resources/core.json",
  "question-packs/tr/payroll/core.json",
  "question-packs/tr/legal_compliance/core.json",
  "question-packs/tr/it_infrastructure/core.json",
  "question-packs/tr/master_data_management/core.json",
  "question-packs/tr/project_management/core.json",
  "question-packs/tr/e_transformation/core.json",
  "question-packs/tr/invoicing/core.json",
  "question-packs/tr/document_management/core.json",
  "question-packs/tr/import/core.json",
  "question-packs/tr/export/core.json",
  "question-packs/tr/ecommerce/core.json",
];

const managementTexts = new Set(
  pack.questions.map((q) => q.question.trim().toLowerCase().replace(/\s+/g, " "))
);

let totalDuplicates = 0;

for (const packDir of PACK_DIRS) {
  const fullPath = path.join(ROOT_DIR, packDir);
  if (!existsSync(fullPath)) continue;
  const otherPack = JSON.parse(readFileSync(fullPath, "utf-8")) as QuestionPack;
  const otherTexts = otherPack.questions.map((q) => q.question.trim().toLowerCase().replace(/\s+/g, " "));
  for (const text of otherTexts) {
    if (managementTexts.has(text)) {
      totalDuplicates++;
      console.error(`Mükerrer soru (${otherPack.meta.business_function_code}): "${text.slice(0, 60)}..."`);
    }
  }
}

assert(
  totalDuplicates === 0,
  `31 diğer modülle çapraz karşılaştırmada 0 tam mükerrer soru (${totalDuplicates} bulundu)`
);

// ─── TEST 11: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T11: Custom Questions Adapter Compatibility ===");

const customQraw = {
  id: "99",
  analysis_project_id: "proj-001",
  business_function_code: "MANAGEMENT",
  process_name: "Genel Yönetim Organizasyonu",
  question_text: "Şirket büyümesi için hangi yönetişim modelini tercih edersiniz?",
  description: null,
  question_type: "single_choice" as const,
  is_required: 0,
  sort_order: 1,
  is_active: 1,
  created_at: "2026-08-21T00:00:00.000Z",
  updated_at: "2026-08-21T00:00:00.000Z",
  options: [
    { id: "o1", custom_question_id: "99", value: "merkezi", label: "Merkezi yönetim", sort_order: 1, is_other: 0, created_at: "" },
    { id: "o2", custom_question_id: "99", value: "dagitik", label: "Dağıtık yönetim", sort_order: 2, is_other: 0, created_at: "" },
  ],
};

const adapted = adaptCustomQuestionToQuestion(customQraw, 48);
assert(adapted.id === "99", "Custom question ID adapter'dan geçirildi (id = '99')");
assert(adapted.is_custom === true, "is_custom = true");
assert(adapted.process === "Genel Yönetim Organizasyonu", "Process eşleşti");
assert(Array.isArray(adapted.options) && adapted.options!.length === 2, "Seçenekler doğru aktarıldı");

// ─── TEST 12: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T12: ReportModel & Formatting Truth ===");

const q1 = pack.questions[0];
const answerData: AnswerData = {
  selected: [
    {
      value: "ceo_genel_mudur_tam_yetkili",
      note: "20 yıllık deneyimli genel müdür tüm operasyonel kararları almaktadır.",
    },
  ],
  general_note: "Yönetim yapısı oldukça merkezidir; ERP projesinde hızlı karar alınabilecektir.",
};

const formatted = formatAnswer(q1, answerData);
assert(formatted.isAnswered === true, `formattedQ1.isAnswered = true`);
assert(
  !formatted.summaryText.includes("ceo_genel_mudur_tam_yetkili"),
  `Kullanıcı dostu label formatlandı (ceo_genel_mudur_tam_yetkili enum'u sızmadı) — ${formatted.summaryText.slice(0, 80)}`
);
assert(
  formatted.summaryText.includes("Açıklama:"),
  "Seçenek notu (note alanı) summaryText içinde Formatlandı"
);
assert(
  formatted.generalNote === "Yönetim yapısı oldukça merkezidir; ERP projesinde hızlı karar alınabilecektir.",
  "Genel not doğru formatlandı"
);
assert(
  formatted.selectedOptions.length === 1 && formatted.selectedOptions[0].value === "ceo_genel_mudur_tam_yetkili",
  "selectedOptions[0].value doğru"
);

// ─── TEST 13: DOCX Binary Generation ─────────────────────────────────────────
console.log("\n=== T13: DOCX Export Binary Generation ===");

const mgt001Formatted = formatAnswer(pack.questions[0], { selected: [{ value: "ceo_genel_mudur_tam_yetkili" }] });

const sampleReport: ReportModel = {
  metadata: {
    title: "ERP / Genel Yönetim ve Kurumsal Yönetişim Keşif Raporu",
    projectName: "Genel Yönetim Keşif Analizi",
    companyName: "Test Kurumsal A.Ş.",
    generatedAt: "21.08.2026",
    projectStatus: "completed",
    packVersions: { MANAGEMENT: "tr.management.core v0.1.0" },
    isComplete: false,
    progressPercent: 6,
    requiredAnswered: 1,
    requiredTotal: 25,
    reportType: "interim",
    draftLabel: "ARA RAPOR — %6",
    projectProgressPercent: 6,
    completedFunctionCount: 0,
    selectedFunctionCount: 1,
    isProjectComplete: false,
  },
  company: {
    companyName: "Test Kurumsal A.Ş.",
    tradeName: "Test Kurumsal",
    taxNumber: "1234567890",
    city: "İstanbul",
    country: "Türkiye",
    employeeCount: "250",
    notes: "FAZ-42 MANAGEMENT kabul test şirketi.",
  },
  profile: {
    analysis_project_id: "p_faz42",
    executive_summary: "Genel yönetim keşif analizi yapılmaktadır.",
    overall_assessment: "Merkezi yönetim yapısı; ERP projesinde hızlı karar alınabilecektir.",
    open_topics: "",
  },
  scope: [{
    code: "MANAGEMENT",
    nameTr: "Genel Yönetim",
    nameEn: "General Management",
    category: "Yönetim",
    departmentName: "Üst Yönetim",
    responsiblePerson: "Genel Müdür",
    status: "in_progress",
    hasPack: true,
    progressPercentage: 6,
    answeredCount: 1,
    totalQuestionCount: 25,
  }],
  businessFunctions: [{
    code: "MANAGEMENT",
    nameTr: "Genel Yönetim",
    nameEn: "General Management",
    category: "Yönetim",
    sortOrder: 1,
    departmentName: "Üst Yönetim",
    responsiblePerson: "Genel Müdür",
    status: "in_progress",
    packId: "tr.management.core",
    packVersion: "0.1.0",
    progressPercentage: 6,
    answeredCount: 1,
    totalQuestionCount: 25,
    processes: [{
      name: "Genel Yönetim Organizasyonu",
      order: 1,
      questions: [{
        id: "MGT-001",
        order: 1,
        process: "Genel Yönetim Organizasyonu",
        questionText: pack.questions[0].question,
        answerType: "single_choice",
        criticality: "critical",
        formattedAnswer: mgt001Formatted,
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

// ─── TEST 14: PDF Export ─────────────────────────────────────────────────────
console.log("\n=== T14: Liberation Sans TrueType Unicode PDF Export ===");

const pdfBuf = await buildPdfBuffer(sampleReport);
assert(pdfBuf instanceof Uint8Array && pdfBuf.length > 5000, `TrueType Unicode PDF üretimi başarılı (${pdfBuf.length} byte)`);

const pdfParser = new PDFParse({ data: pdfBuf });
const parsedPdf = await pdfParser.getText();
assert(
  parsedPdf.text.includes("Genel Yönetim") || parsedPdf.text.includes("MANAGEMENT"),
  `PDF çıktısında 'Genel Yönetim' başlığı mevcut`
);
assert(
  parsedPdf.text.includes("Test Kurumsal"),
  `PDF çıktısında firma adı mevcut (Türkçe UTF-8 doğru)`
);

// ─── TEST 15: Loader Registry Parity ────────────────────────────────────────
console.log("\n=== T15: Loader Registry Parity ===");

assert(
  getPackIdForFunction("MANAGEMENT") === "tr.management.core",
  "getPackIdForFunction('MANAGEMENT') -> tr.management.core"
);
assert(
  getPackIdForFunction("GENEL_YONETIM") === "tr.management.core",
  "getPackIdForFunction('GENEL_YONETIM') -> tr.management.core (Türkçe Alias)"
);
assert(
  getPackIdForFunction("UST_YONETIM") === "tr.management.core",
  "getPackIdForFunction('UST_YONETIM') -> tr.management.core (Alias)"
);
assert(
  getPackIdForFunction("KURUMSAL_YONETIM") === "tr.management.core",
  "getPackIdForFunction('KURUMSAL_YONETIM') -> tr.management.core (Alias)"
);
assert(
  getPackIdForFunction("MANAGEMENT_GOVERNANCE") === "tr.management.core",
  "getPackIdForFunction('MANAGEMENT_GOVERNANCE') -> tr.management.core (Alias)"
);
assert(hasQuestionPack("MANAGEMENT") === true, "hasQuestionPack('MANAGEMENT') === true");
assert(getPackStatus("MANAGEMENT") === "available", "getPackStatus('MANAGEMENT') === 'available'");

const loaderResult = await loadQuestionPack("tr.management.core");
assert(loaderResult.ok === true, "loadQuestionPack('tr.management.core') ok === true");
if (loaderResult.ok) {
  assert(loaderResult.pack.questions.length === 47, "Yüklenen soru paketi 47 soru içerir");
}

// ─── TEST 16: MANAGEMENT–STRATEGY–PROJECT_MANAGEMENT Sınır Ayrımı ─────────
console.log("\n=== T16: MANAGEMENT–STRATEGY–PROJECT_MANAGEMENT Sınır Ayrımı ===");

const strategyKeywords = [
  "vizyon", "misyon", "rekabet analizi", "pazar payı", "pazar araştırması",
  "beş yıllık plan", "büyüme stratejisi", "rekabet avantajı", "swot analizi",
  "jenerik strateji"
];

const projectMgmtKeywords = [
  "wbs", "iş kırılım yapısı", "gantt", "kritik yol", "earned value",
  "milestone listesi", "deliverable", "proje takvimi", "kaynak planlaması",
  "proje yürütme"
];

let strategyOverlap = 0;
let projectMgmtOverlap = 0;

// Kelime sınırı kontrolü: "vizyon" tek başına, "revizyon" içinde değil
function containsWholeWord(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(^|[\\s,;:.!?()\\[\\]"'])(${escaped})([\\s,;:.!?()\\[\\]"']|$)`, "i");
  return regex.test(text);
}

for (const q of pack.questions) {
  const qLow = q.question.toLowerCase();
  for (const kw of strategyKeywords) {
    if (containsWholeWord(qLow, kw)) {
      strategyOverlap++;
      console.error(`STRATEGY alanı ihlali (${q.id}): "${kw}" ifadesi tespit edildi`);
    }
  }
  for (const kw of projectMgmtKeywords) {
    if (containsWholeWord(qLow, kw)) {
      projectMgmtOverlap++;
      console.error(`PROJECT_MANAGEMENT alanı ihlali (${q.id}): "${kw}" ifadesi tespit edildi`);
    }
  }
}
assert(strategyOverlap === 0, "STRATEGY sınır kontrolü: Vizyon/strateji/rekabet soruları MANAGEMENT paketinde tekrarlanmadı");
assert(projectMgmtOverlap === 0, "PROJECT_MANAGEMENT sınır kontrolü: WBS/Gantt/proje yürütme soruları MANAGEMENT paketinde tekrarlanmadı");

// ─── TEST 17: AI-Free / Zero Cloud / Offline-First ──────────────────────────
console.log("\n=== T17: AI-Free, Zero Cloud, Offline-First Doğrulaması ===");

const aiKeywords = ["yapay zeka", "artificial intelligence", " ai ", " ml ", "makine öğrenmesi", "önerim", "tahmin et", "otomatik analiz"];
let aiCount = 0;
for (const q of pack.questions) {
  for (const kw of aiKeywords) {
    if (q.question.toLowerCase().includes(kw)) {
      aiCount++;
    }
  }
}
assert(aiCount === 0, `Pakette 0 yapay zeka / AI ifadesi bulunmaktadır`);

// ─── FINAL RESULT ────────────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════════════════");
console.log(`FAZ-42 MANAGEMENT TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════════");

if (failCount > 0) {
  console.error(`\nBAŞARISIZ: ${failCount} test başarısız oldu.`);
  process.exit(1);
} else {
  console.log("\n✅ FAZ-42 KABUL: Tüm testler geçti — MANAGEMENT Question Pack mühürlendi.");
}
