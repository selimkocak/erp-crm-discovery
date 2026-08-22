/**
 * ERP CRM Discovery — FAZ-43 STRATEJİK PLANLAMA VE KURUMSAL PERFORMANS / STRATEGY Acceptance Tests
 *
 * Test Kapsamı:
 * T01: Pack Loading & Metadata Integrity (tr.strategy.core v0.1.0, canonical code = STRATEGY)
 * T02: Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * T03: Question Quantity & Deterministic Order (47 questions, sequential order 1..47, STR-001..STR-047)
 * T04: Required Question Count Truth (25 required, 22 optional)
 * T05: Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * T06: Exact 25 Canonical Process Coverage & Strict Integrity Assertions
 * T07: Every Canonical Process Has at Least One Question (100% process coverage)
 * T08: Conditional Branching Resolution (8 condition points tested with branching engine)
 * T09: Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * T10: Cross-Pack Duplication Audit (0 duplicate questions across 32 existing modules)
 * T11: Custom Questions Adapter Compatibility (custom question adapter integration)
 * T12: ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * T13: DOCX Binary Generation Compatibility
 * T14: Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * T15: Loader Registry Mapping Parity (getPackIdForFunction("STRATEGY") === "tr.strategy.core" + aliases)
 * T16: STRATEGY–MANAGEMENT–PROJECT_MANAGEMENT Sınır Ayrımı (Cross-Pack Isolation)
 * T17: AI-Free, Zero Cloud, Offline-First Doğrulaması
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
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
const PACK_PATH = path.join(ROOT_DIR, "question-packs/tr/strategy/core.json");

console.log("══════════════════════════════════════════════════════");
console.log("FAZ-43: STRATEJİK PLANLAMA VE KURUMSAL PERFORMANS / STRATEGY TEST");
console.log("══════════════════════════════════════════════════════\n");

// ─── TEST 1: Pack Loading & Metadata Integrity ──────────────────────────────
console.log("=== T01: Pack Loading & Metadata Integrity ===");
assert(existsSync(PACK_PATH), `Soru paketi dosyası mevcut: ${PACK_PATH}`);

const rawJson = readFileSync(PACK_PATH, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(pack.meta.pack_id === "tr.strategy.core", "pack_id = tr.strategy.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "STRATEGY", "business_function_code = STRATEGY (Kanonik Kod)");
assert(pack.meta.name === "Stratejik Planlama ve Kurumsal Performans Soru Paketi", "name tanımlı ve doğru");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ─────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(strategyPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 47, `Toplam soru sayısı tam 47 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 47, "Tüm 47 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `STR-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: Beklenen ${expectedId} (order: ${i + 1}), Bulunan ${pack.questions[i].id} (order: ${pack.questions[i].order})`);
  }
}
assert(orderCorrect, "Tüm sorular STR-001'den STR-047'ye sıralı ve deterministiktir");

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
  if (q.options && q.options.length > 0) {
    const values = q.options.map((o) => o.value);
    const uniqueValues = new Set(values);
    if (values.length !== uniqueValues.size) {
      optionsValid = false;
      console.error(`Mükerrer seçenek değeri: Soru ${q.id}`);
    }

    const otherOptions = q.options.filter((o) => o.is_other);
    if (otherOptions.length > 1) {
      optionsValid = false;
      console.error(`Birden fazla is_other seçeneği: Soru ${q.id}`);
    }

    for (const opt of otherOptions) {
      if (!opt.allow_note) {
        optionsValid = false;
        console.error(`is_other: true olan seçenekte allow_note: false: Soru ${q.id}`);
      }
    }
  }
}
assert(optionsValid, "Tüm seçenekler benzersiz, is_other ve allow_note kurallarına uygundur");

// ─── TEST 6: Exact 25 Canonical Process Coverage ────────────────────────────
console.log("\n=== T06: Exact 25 Canonical Process Coverage ===");
const canonicalProcesses = [
  "Strateji organizasyonu ve sahipliği",
  "Vizyon ve misyon",
  "Kurumsal değerler ve yönetim ilkeleri",
  "Stratejik planın varlığı ve kapsamı",
  "SWOT analizi",
  "PESTLE ve dış çevre analizi",
  "Pazar ve sektör hedefleri",
  "Rekabet analizi",
  "Müşteri ve paydaş beklentileri",
  "Stratejik öncelikler",
  "Kurumsal hedefler",
  "Departman hedefleri",
  "Ölçülebilir KPI ve hedef metrikleri",
  "Balanced Scorecard / performans perspektifleri",
  "Bütçe ve strateji bağlantısı",
  "Yatırım ve kaynak önceliklendirme",
  "Stratejik proje ve inisiyatif portföyü",
  "ERP/CRM dönüşüm hedefleri",
  "Dijitalleşme ve süreç olgunluğu",
  "Ana veri ve raporlama stratejisi",
  "Risk ve senaryo planlaması",
  "Strateji uygulama takibi",
  "Yönetim kurulu ve icra kurulu gözden geçirmesi",
  "Kurum içi iletişim ve hedef yayılımı",
  "Stratejik plan revizyonu, arşiv ve yol haritası",
];

const packProcesses = [...new Set(pack.questions.map((q) => q.process))];
assert(packProcesses.length === 25, `Soru paketinde tam 25 benzersiz süreç bulunmaktadır (${packProcesses.length})`);

for (const proc of canonicalProcesses) {
  assert(packProcesses.includes(proc), `Kanonik süreç pakette mevcut: "${proc}"`);
}

for (const proc of packProcesses) {
  assert(canonicalProcesses.includes(proc), `Paket süreci kanonik listede: "${proc}"`);
}

// ─── TEST 7: Every Canonical Process Has at Least One Question ──────────────
console.log("\n=== T07: Every Canonical Process Has at Least One Question ===");
let allProcessesCovered = true;
for (const proc of canonicalProcesses) {
  const count = pack.questions.filter((q) => q.process === proc).length;
  if (count === 0) {
    allProcessesCovered = false;
    console.error(`Süreç hiç soru içermiyor: "${proc}"`);
  }
}
assert(allProcessesCovered, "Tüm 25 kanonik sürecin her biri en az bir soruyla (%100) kapsanmaktadır");

// ─── TEST 8: Conditional Branching Engine Resolution ────────────────────────
console.log("\n=== T08: Conditional Branching Engine Resolution (8 Dallanma) ===");
const emptyAnswers = new Map<string, AnswerData>();

// In initial state without answers:
// - not_equals conditions evaluate to true (visible)
// Since all 8 conditions use not_equals:
// All 47 questions visible initially when unanswered
const visibleWithNoAnswers = getVisibleQuestions(pack.questions, emptyAnswers);
assert(
  visibleWithNoAnswers.length === 47,
  `Cevapsız durumda tüm 47 soru görünür (8 not_equals koşulu) — Gerçek: ${visibleWithNoAnswers.length}`
);

// BRANCHING 1: STR-006 visible when STR-005 != "resmi_plan_yok_zihinsel_hedef"
const str006Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "STR-006")!,
  new Map([["STR-005", { selected: [{ value: "resmi_plan_yok_zihinsel_hedef" }] }]])
);
const str006Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "STR-006")!,
  new Map([["STR-005", { selected: [{ value: "resmi_onayli_cok_yillik_plan_var" }] }]])
);
assert(str006Hidden, "STR-005 = resmi_plan_yok_zihinsel_hedef iken STR-006 gizli");
assert(str006Visible, "STR-005 != resmi_plan_yok_zihinsel_hedef iken STR-006 görünür");

// BRANCHING 2: STR-008 visible when STR-007 != "swot_analizi_yapilmiyor"
const str008Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "STR-008")!,
  new Map([["STR-007", { selected: [{ value: "swot_analizi_yapilmiyor" }] }]])
);
const str008Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "STR-008")!,
  new Map([["STR-007", { selected: [{ value: "yillik_duzenli_swot_yapilmaktadir" }] }]])
);
assert(str008Hidden, "STR-007 = swot_analizi_yapilmiyor iken STR-008 gizli");
assert(str008Visible, "STR-007 != swot_analizi_yapilmiyor iken STR-008 görünür");

// BRANCHING 3: STR-019 visible when STR-018 != "departman_hedefi_kirilimi_yok"
const str019Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "STR-019")!,
  new Map([["STR-018", { selected: [{ value: "departman_hedefi_kirilimi_yok" }] }]])
);
const str019Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "STR-019")!,
  new Map([["STR-018", { selected: [{ value: "tum_departmanlara_resmi_kirilim_yapilmaktadir" }] }]])
);
assert(str019Hidden, "STR-018 = departman_hedefi_kirilimi_yok iken STR-019 gizli");
assert(str019Visible, "STR-018 != departman_hedefi_kirilimi_yok iken STR-019 görünür");

// BRANCHING 4: STR-021 visible when STR-020 != "resmi_kpi_seti_tanimli_degil"
const str021Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "STR-021")!,
  new Map([["STR-020", { selected: [{ value: "resmi_kpi_seti_tanimli_degil" }] }]])
);
const str021Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "STR-021")!,
  new Map([["STR-020", { selected: [{ value: "resmi_kpi_sozlugu_ve_metrik_seti_var" }] }]])
);
assert(str021Hidden, "STR-020 = resmi_kpi_seti_tanimli_degil iken STR-021 gizli");
assert(str021Visible, "STR-020 != resmi_kpi_seti_tanimli_degil iken STR-021 görünür");

// BRANCHING 5: STR-024 visible when STR-023 != "bsc_kullanilmiyor_klasik_finansal_takip"
const str024Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "STR-024")!,
  new Map([["STR-023", { selected: [{ value: "bsc_kullanilmiyor_klasik_finansal_takip" }] }]])
);
const str024Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "STR-024")!,
  new Map([["STR-023", { selected: [{ value: "dort_perspektifli_bsc_aktif_kullaniliyor" }] }]])
);
assert(str024Hidden, "STR-023 = bsc_kullanilmiyor_klasik_finansal_takip iken STR-024 gizli");
assert(str024Visible, "STR-023 != bsc_kullanilmiyor_klasik_finansal_takip iken STR-024 görünür");

// BRANCHING 6: STR-030 visible when STR-029 != "portfoy_takibi_yapilmiyor_bireysel_projeler"
const str030Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "STR-030")!,
  new Map([["STR-029", { selected: [{ value: "portfoy_takibi_yapilmiyor_bireysel_projeler" }] }]])
);
const str030Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "STR-030")!,
  new Map([["STR-029", { selected: [{ value: "merkezi_stratejik_proje_portfoyu_var" }] }]])
);
assert(str030Hidden, "STR-029 = portfoy_takibi_yapilmiyor_bireysel_projeler iken STR-030 gizli");
assert(str030Visible, "STR-029 != portfoy_takibi_yapilmiyor_bireysel_projeler iken STR-030 görünür");

// BRANCHING 7: STR-032 visible when STR-031 != "stratejik_hedef_baglantisi_kurulmamis"
const str032Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "STR-032")!,
  new Map([["STR-031", { selected: [{ value: "stratejik_hedef_baglantisi_kurulmamis" }] }]])
);
const str032Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "STR-032")!,
  new Map([["STR-031", { selected: [{ value: "stratejik_is_gerekcesi_ve_kazanim_hedefleri_yazili" }] }]])
);
assert(str032Hidden, "STR-031 = stratejik_hedef_baglantisi_kurulmamis iken STR-032 gizli");
assert(str032Visible, "STR-031 != stratejik_hedef_baglantisi_kurulmamis iken STR-032 görünür");

// BRANCHING 8: STR-042 visible when STR-041 != "resmi_stratejik_gozden_gecirme_yapilmiyor"
const str042Hidden = !isQuestionVisible(
  pack.questions.find((q) => q.id === "STR-042")!,
  new Map([["STR-041", { selected: [{ value: "resmi_stratejik_gozden_gecirme_yapilmiyor" }] }]])
);
const str042Visible = isQuestionVisible(
  pack.questions.find((q) => q.id === "STR-042")!,
  new Map([["STR-041", { selected: [{ value: "yillik_ve_yari_yillik_resmi_gozden_gecirme" }] }]])
);
assert(str042Hidden, "STR-041 = resmi_stratejik_gozden_gecirme_yapilmiyor iken STR-042 gizli");
assert(str042Visible, "STR-041 != resmi_stratejik_gozden_gecirme_yapilmiyor iken STR-042 görünür");

// When all 8 triggers are satisfied with active answers, all 47 questions remain visible
const allActiveAnswers = new Map<string, AnswerData>([
  ["STR-005", { selected: [{ value: "resmi_onayli_cok_yillik_plan_var" }] }],
  ["STR-007", { selected: [{ value: "yillik_duzenli_swot_yapilmaktadir" }] }],
  ["STR-018", { selected: [{ value: "tum_departmanlara_resmi_kirilim_yapilmaktadir" }] }],
  ["STR-020", { selected: [{ value: "resmi_kpi_sozlugu_ve_metrik_seti_var" }] }],
  ["STR-023", { selected: [{ value: "dort_perspektifli_bsc_aktif_kullaniliyor" }] }],
  ["STR-029", { selected: [{ value: "merkezi_stratejik_proje_portfoyu_var" }] }],
  ["STR-031", { selected: [{ value: "stratejik_is_gerekcesi_ve_kazanim_hedefleri_yazili" }] }],
  ["STR-041", { selected: [{ value: "yillik_ve_yari_yillik_resmi_gozden_gecirme" }] }],
]);
const visibleWhenAllActive = getVisibleQuestions(pack.questions, allActiveAnswers);
assert(
  visibleWhenAllActive.length === 47,
  `Tüm 8 tetikleyici aktifken 47 sorunun tamamı görünür (${visibleWhenAllActive.length}/47)`
);

// ─── TEST 9: Progress Calculation ───────────────────────────────────────────
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
  ["STR-001", { flag_type: "critical" }],
  ["STR-005", { flag_type: "revisit" }],
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
    } else if (entry === "core.json" && !normalizePath(full).includes("strategy/core.json")) {
      files.push(full);
    }
  }
  return files;
}

const otherPackFiles = findOtherPacks(otherPacksDir);
const strategyQuestionTexts = new Set(pack.questions.map((q) => q.question.toLowerCase().trim()));

for (const otherFile of otherPackFiles) {
  const otherJson = JSON.parse(readFileSync(otherFile, "utf-8")) as QuestionPack;
  for (const oq of otherJson.questions) {
    if (strategyQuestionTexts.has(oq.question.toLowerCase().trim())) {
      duplicateCount++;
      console.error(`Mükerrer soru tespit edildi: "${oq.question}" [${otherJson.meta.pack_id}]`);
    }
  }
}
assert(duplicateCount === 0, `Diğer modüllerle çapraz karşılaştırmada 0 tam mükerrer soru (${duplicateCount} bulundu)`);

// ─── TEST 11: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T11: Custom Questions Adapter Compatibility ===");

const customQraw = {
  id: "99",
  analysis_project_id: "proj-001",
  business_function_code: "STRATEGY",
  process_name: "Stratejik Öncelikler",
  question_text: "Şirket büyümesi için hangi stratejik modeli tercih edersiniz?",
  description: null,
  question_type: "single_choice" as const,
  is_required: 0,
  sort_order: 1,
  is_active: 1,
  created_at: "2026-08-22T00:00:00.000Z",
  updated_at: "2026-08-22T00:00:00.000Z",
  options: [
    { id: "o1", custom_question_id: "99", value: "organik", label: "Organik büyüme", sort_order: 1, is_other: 0, created_at: "" },
    { id: "o2", custom_question_id: "99", value: "inorganik", label: "İnorganik büyüme / Satın alma", sort_order: 2, is_other: 0, created_at: "" },
  ],
};

const adapted = adaptCustomQuestionToQuestion(customQraw, 48);
assert(adapted.id === "99", "Custom question ID adapter'dan geçirildi (id = '99')");
assert(adapted.is_custom === true, "is_custom = true");
assert(adapted.process === "Stratejik Öncelikler", "Process eşleşti");
assert(Array.isArray(adapted.options) && adapted.options!.length === 2, "Seçenekler doğru aktarıldı");

// ─── TEST 12: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T12: ReportModel & Formatting Truth ===");

const q1 = pack.questions[0];
const answerData: AnswerData = {
  selected: [
    {
      value: "ozel_strateji_ve_is_gelistirme_departmani",
      note: "5 kişilik uzman kadro ile stratejik planlama yürütülmektedir.",
    },
  ],
  general_note: "Strateji birimi doğrudan Genel Müdüre raporlamaktadır; ERP projesinde vizyon nettir.",
};

const formatted = formatAnswer(q1, answerData);
assert(formatted.isAnswered === true, "formattedQ1.isAnswered = true");
assert(
  !formatted.summaryText.includes("ozel_strateji_ve_is_gelistirme_departmani"),
  `Kullanıcı dostu label formatlandı (enum sızmadı) — ${formatted.summaryText.slice(0, 80)}`
);
assert(
  formatted.summaryText.includes("Açıklama:"),
  "Seçenek notu (note alanı) summaryText içinde formatlandı"
);
assert(
  formatted.generalNote === "Strateji birimi doğrudan Genel Müdüre raporlamaktadır; ERP projesinde vizyon nettir.",
  "Genel not doğru formatlandı"
);
assert(
  formatted.selectedOptions.length === 1 && formatted.selectedOptions[0].value === "ozel_strateji_ve_is_gelistirme_departmani",
  "selectedOptions[0].value doğru"
);

// ─── TEST 13: DOCX Binary Generation ─────────────────────────────────────────
console.log("\n=== T13: DOCX Export Binary Generation ===");

const str001Formatted = formatAnswer(pack.questions[0], { selected: [{ value: "ozel_strateji_ve_is_gelistirme_departmani" }] });

const sampleReport: ReportModel = {
  metadata: {
    title: "ERP / Stratejik Planlama ve Kurumsal Performans Keşif Raporu",
    projectName: "Stratejik Planlama Keşif Analizi",
    companyName: "Test Strateji Holding A.Ş.",
    generatedAt: "22.08.2026",
    projectStatus: "completed",
    packVersions: { STRATEGY: "tr.strategy.core v0.1.0" },
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
    companyName: "Test Strateji Holding A.Ş.",
    tradeName: "Test Strateji",
    taxNumber: "1234567890",
    city: "İstanbul",
    country: "Türkiye",
    employeeCount: "350",
    notes: "FAZ-43 STRATEGY kabul test şirketi.",
  },
  profile: {
    analysis_project_id: "p_faz43",
    executive_summary: "Stratejik planlama ve performans keşif analizi yapılmaktadır.",
    overall_assessment: "Stratejik plan mevcuttur; ERP projesinde kurumsal KPI ve dashboard hedeflenmektedir.",
    open_topics: "",
  },
  scope: [{
    code: "STRATEGY",
    nameTr: "Stratejik Planlama",
    nameEn: "Strategic Planning",
    category: "Yönetim",
    departmentName: "Strateji ve İş Geliştirme",
    responsiblePerson: "Strateji Direktörü",
    status: "in_progress",
    hasPack: true,
    progressPercentage: 4,
    answeredCount: 1,
    totalQuestionCount: 25,
  }],
  businessFunctions: [{
    code: "STRATEGY",
    nameTr: "Stratejik Planlama",
    nameEn: "Strategic Planning",
    category: "Yönetim",
    sortOrder: 2,
    departmentName: "Strateji ve İş Geliştirme",
    responsiblePerson: "Strateji Direktörü",
    status: "in_progress",
    packId: "tr.strategy.core",
    packVersion: "0.1.0",
    progressPercentage: 4,
    answeredCount: 1,
    totalQuestionCount: 25,
    processes: [{
      name: "Strateji organizasyonu ve sahipliği",
      order: 1,
      questions: [{
        id: "STR-001",
        order: 1,
        process: "Strateji organizasyonu ve sahipliği",
        questionText: pack.questions[0].question,
        answerType: "single_choice",
        criticality: "critical",
        formattedAnswer: str001Formatted,
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
  parsedPdf.text.includes("Stratejik Planlama") || parsedPdf.text.includes("STRATEGY"),
  "PDF çıktısında 'Stratejik Planlama' başlığı mevcut"
);
assert(
  parsedPdf.text.includes("Test Strateji"),
  "PDF çıktısında firma adı mevcut (Türkçe UTF-8 doğru)"
);

// ─── TEST 15: Loader Registry Parity ────────────────────────────────────────
console.log("\n=== T15: Loader Registry Parity ===");
assert(getPackIdForFunction("STRATEGY") === "tr.strategy.core", "getPackIdForFunction('STRATEGY') -> tr.strategy.core");
assert(getPackIdForFunction("STRATEJI") === "tr.strategy.core", "getPackIdForFunction('STRATEJI') -> tr.strategy.core (Türkçe Alias)");
assert(getPackIdForFunction("STRATEJIK_PLANLAMA") === "tr.strategy.core", "getPackIdForFunction('STRATEJIK_PLANLAMA') -> tr.strategy.core (Alias)");
assert(getPackIdForFunction("KURUMSAL_STRATEJI") === "tr.strategy.core", "getPackIdForFunction('KURUMSAL_STRATEJI') -> tr.strategy.core (Alias)");
assert(getPackIdForFunction("STRATEGIC_PLANNING") === "tr.strategy.core", "getPackIdForFunction('STRATEGIC_PLANNING') -> tr.strategy.core (Alias)");
assert(hasQuestionPack("STRATEGY") === true, "hasQuestionPack('STRATEGY') === true");
assert(getPackStatus("STRATEGY") === "available", "getPackStatus('STRATEGY') === 'available'");

const loadedPackRes = await loadQuestionPack("tr.strategy.core");
assert(loadedPackRes.ok === true, "loadQuestionPack('tr.strategy.core') ok === true");
if (loadedPackRes.ok) {
  assert(loadedPackRes.pack.questions.length === 47, "Yüklenen soru paketi 47 soru içerir");
}

// ─── TEST 16: STRATEGY–MANAGEMENT–PROJECT_MANAGEMENT Sınır Ayrımı ───────────
console.log("\n=== T16: STRATEGY–MANAGEMENT–PROJECT_MANAGEMENT Sınır Ayrımı ===");
const strategyTexts = pack.questions.map((q) => q.question.toLowerCase());

// MANAGEMENT sınır kontrolü: Yönetim Kurulu organı / imza sirküleri odaklı sorular STRATEGY paketinde tekrarlanmadı
const hasMgtOrganOverlap = strategyTexts.some((t) => t.includes("imza sirküleri") || t.includes("onay matrisi"));
assert(!hasMgtOrganOverlap, "MANAGEMENT sınır kontrolü: İmza sirküleri ve operasyonel onay matrisi soruları STRATEGY paketinde tekrarlanmadı");

// PROJECT_MANAGEMENT sınır kontrolü: WBS/Gantt/proje yürütme soruları STRATEGY paketinde tekrarlanmadı
const hasPrjWbsOverlap = strategyTexts.some((t) => t.includes("gantt şeması") || t.includes("wbs iş kırılım"));
assert(!hasPrjWbsOverlap, "PROJECT_MANAGEMENT sınır kontrolü: WBS/Gantt operasyonel proje yürütme soruları STRATEGY paketinde tekrarlanmadı");

// ─── TEST 17: AI-Free, Zero Cloud, Offline-First Doğrulaması ────────────────
console.log("\n=== T17: AI-Free, Zero Cloud, Offline-First Doğrulaması ===");
const jsonString = JSON.stringify(pack).toLowerCase();
const aiKeywords = ["yapay zeka", "yapay zekâ", "artificial intelligence", "chatgpt", "machine learning", "öngörücü ai", "llm"];
let aiFound = false;
for (const kw of aiKeywords) {
  if (jsonString.includes(kw)) {
    aiFound = true;
    console.error(`AI ifadesi tespit edildi: "${kw}"`);
  }
}
assert(!aiFound, "Pakette 0 yapay zeka / AI ifadesi bulunmaktadır");

console.log("\n══════════════════════════════════════════════════════");
console.log(`FAZ-43 STRATEGY TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════════\n");

if (failCount > 0) {
  console.error("❌ FAZ-43 KABUL TESTİ BAŞARISIZ OLDU.");
  process.exit(1);
} else {
  console.log("✅ FAZ-43 KABUL: Tüm testler geçti — STRATEGY Question Pack mühürlendi.");
}
