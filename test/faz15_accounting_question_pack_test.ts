/**
 * ERP CRM Discovery — FAZ-15 Accounting Question Pack Acceptance Test Suite
 *
 * Automated verification for:
 * 1. Pack Loading & Metadata Integrity (tr.accounting.core v0.1.0, canonical code = ACCOUNTING)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (42 questions, sequential order 1..42, ACC-001..ACC-042)
 * 4. Required Question Count Truth (22 required, 20 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 19 Canonical Process Coverage
 * 7. Conditional Branching Resolution (branching engine with Map)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (verifying zero overlap with SALES, PROCUREMENT, WAREHOUSE, INVENTORY and LOGISTICS)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("ACCOUNTING") === "tr.accounting.core")
 */

import { readFileSync } from "fs";
import path from "path";
import { validateQuestionPack } from "../src/engine/validator";
import { getVisibleQuestions, isQuestionVisible } from "../src/engine/branching";
import { calculateProgress, isQuestionAnswered } from "../src/engine/progress";
import { adaptCustomQuestionToQuestion } from "../src/engine/customQuestionAdapter";
import { formatAnswer } from "../src/report/formatters";
import { getPackIdForFunction } from "../src/engine/loader";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import { PDFParse } from "pdf-parse";
import type { QuestionPack, Question, AnswerData, SelectedAnswer } from "../src/engine/types";
import type { ReportModel, ReportBusinessFunction, ReportProcess, ReportQuestionItem } from "../src/report/types";
import type { CustomQuestion, QuestionFollowup } from "../src/types";

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

console.log("\n══════════════════════════════════════════════════");
console.log("FAZ-15: MUHASEBE (GENEL) / ACCOUNTING QUESTION PACK TEST");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/accounting/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "Accounting pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.accounting.core", "pack_id = tr.accounting.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.schema_version === "1", "schema_version = 1");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "ACCOUNTING", "business_function_code = ACCOUNTING (Kanonik Kod)");
assert(pack.meta.name === "Muhasebe (Genel) Ön Analizi", "name = Muhasebe (Genel) Ön Analizi");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 20, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validationResult = validateQuestionPack(pack);
if (!validationResult.valid) {
  console.error("   Doğrulama hataları:", validationResult.errors);
}
assert(validationResult.valid === true, "validateQuestionPack(accountingPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity, Deterministic Order & IDs ────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 42, `Toplam soru sayısı tam 42 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 42, "Tüm 42 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `ACC-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: index ${i}, id: ${pack.questions[i].id}, order: ${pack.questions[i].order}`);
  }
}
assert(orderCorrect, "Tüm sorular ACC-001'den ACC-042'ye sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ─────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 22, `Zorunlu soru sayısı tam 22 adettir (${requiredQuestions.length})`);
assert(optionalQuestions.length === 20, `Opsiyonel soru sayısı tam 20 adettir (${optionalQuestions.length})`);

// ─── TEST 5: Choice Options & is_other Validation ────────────────────────────
console.log("\n=== T05: Choice Options & is_other Validation ===");
let optionsValid = true;
let isOtherNoteValid = true;

for (const q of pack.questions) {
  if (q.options) {
    const vals = q.options.map((o) => o.value);
    const uniqueVals = new Set(vals);
    if (vals.length !== uniqueVals.size) {
      optionsValid = false;
      console.error(`Tekrar eden seçenek değeri bulundu: soru ${q.id}`);
    }

    const otherOptions = q.options.filter((o) => o.is_other);
    if (otherOptions.length > 1) {
      optionsValid = false;
      console.error(`Birden fazla is_other seçeneği: soru ${q.id}`);
    }

    for (const opt of q.options) {
      if (opt.is_other && !opt.allow_note) {
        isOtherNoteValid = false;
        console.error(`is_other=true fakat allow_note=false: soru ${q.id}, opt ${opt.value}`);
      }
    }
  }
}
assert(optionsValid, "Tüm seçenek değerleri benzersiz ve en fazla 1 'Diğer' seçeneği içeriyor");
assert(isOtherNoteValid, "Tüm is_other=true seçeneklerinde allow_note=true kuralı sağlanıyor");

// ─── TEST 6: 19 Canonical Process Coverage ───────────────────────────────────
console.log("\n=== T06: 19 Canonical Process Coverage ===");
const expectedProcesses = [
  "Hesap Planı ve Muhasebe Organizasyonu",
  "Yevmiye ve Muhasebe Fişleri Yönetimi",
  "Otomatik Muhasebe Entegrasyonu ve Hesap Tayini",
  "Satıcı ve Müşteri Cari Muhasebesi",
  "Masraf ve Gider Muhasebesi",
  "Vergi ve KDV Süreçleri Yönetimi",
  "Tevkifat ve Stopaj Süreçleri",
  "e-Belge ve e-Defter Muhasebe Süreçleri",
  "Dövizli İşlemler ve Kur Farkları Yönetimi",
  "Dönemsellik, Tahakkuk ve Gelecek Aylara Ait Giderler",
  "Sabit Kıymet ve Amortisman Muhasebesi",
  "Stok Muhasebesi ve Satılan Malın Maliyeti",
  "Satın Alma Muhasebesi ve Fatura Eşleştirme",
  "Satış Muhasebesi ve Gelir Tahakkuku",
  "Banka ve Kasa Muhasebe Entegrasyonu",
  "Mutabakat Süreçleri",
  "Dönem Sonu ve Mali Kapanış",
  "Denetim İzi ve Güvenlik",
  "Finansal Raporlama ve Standartlar",
];

const actualProcesses = Array.from(new Set(pack.questions.map((q) => q.process)));
assert(actualProcesses.length === 19, `Tam 19 farklı süreç grubu tanımlı (${actualProcesses.length})`);

for (const ep of expectedProcesses) {
  const exists = actualProcesses.includes(ep);
  assert(exists, `Süreç mevcut: "${ep}"`);
}

// ─── TEST 7: Branching Engine Resolution ─────────────────────────────────────
console.log("\n=== T07: Branching Engine Resolution ===");
const conditionalQuestions = pack.questions.filter((q) => q.condition);

for (const cq of conditionalQuestions) {
  const targetQ = pack.questions.find((q) => q.id === cq.condition!.question_id);
  assert(!!targetQ, `Condition referansı geçerli: ${cq.id} -> ${cq.condition!.question_id}`);
}

// Senaryo 1: Tevkifat yoksa ACC-015 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("ACC-014", { selected: [{ value: "tevkifatli_islemimiz_bulunmamaktadir" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "ACC-015"), "ACC-014=tevkifatli_islemimiz_bulunmamaktadir iken ACC-015 gizlendi");

answersScenario1.set("ACC-014", { selected: [{ value: "hem_satista_hem_satinalmada_tevkifat_var" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "ACC-015"), "ACC-014=hem_satista_hem_satinalmada_tevkifat_var iken ACC-015 görünür");

// Senaryo 2: Dövizli işlem yoksa ACC-020 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("ACC-019", { selected: [{ value: "dovizli_islemimiz_bulunmamaktadir" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "ACC-020"), "ACC-019=dovizli_islemimiz_bulunmamaktadir iken ACC-020 gizlendi");

answersScenario2.set("ACC-019", { selected: [{ value: "odeme_ve_tahsilat_eslesmesinde_sistem_otomatik_hesaplar" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "ACC-020"), "ACC-019=odeme_ve_tahsilat... iken ACC-020 görünür");

// Senaryo 3: Hizmet şirketi ise GR/IR (ACC-026) gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("ACC-025", { selected: [{ value: "hizmet_sirketiyiz_stok_muhasebemiz_yoktur" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "ACC-026"), "ACC-025=hizmet_sirketiyiz... iken ACC-026 gizlendi");

answersScenario3.set("ACC-025", { selected: [{ value: "surekli_envanter_her_malzeme_hareketinde_otomatik_kayit" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "ACC-026"), "ACC-025=surekli_envanter... iken ACC-026 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `22 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("ACC-001", {
  id: "qf_acc_01",
  analysis_project_id: "p1",
  business_function_code: "ACCOUNTING",
  question_id: "ACC-001",
  flag_type: "revisit",
  note: "Grup şirketleri hesap planı kodlama standardı mali müşavirle teyit edilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("ACC-025", {
  id: "qf_acc_25",
  analysis_project_id: "p1",
  business_function_code: "ACCOUNTING",
  question_id: "ACC-025",
  flag_type: "critical",
  note: "Sürekli envanter STMM yansıtma hesapları netleştirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});

const progressWithFollowups = calculateProgress(pack.questions, answersAllReq, mockFollowups);
assert(progressWithFollowups.answered === 20, `Bayraklı sorular tamamlanmamış sayıldı (20/22)`);
assert(progressWithFollowups.percentage === Math.round((20 / 22) * 100), `İlerleme dürüstçe %${progressWithFollowups.percentage} hesaplandı`);

// ─── TEST 9: Cross-Pack Duplication Audit ─────────────────────────────────────
console.log("\n=== T09: Cross-Pack Duplication Audit ===");
const salesPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/sales/core.json"), "utf-8")) as QuestionPack;
const procPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/procurement/core.json"), "utf-8")) as QuestionPack;
const whPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/warehouse/core.json"), "utf-8")) as QuestionPack;
const invPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/inventory/core.json"), "utf-8")) as QuestionPack;
const logPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/logistics/core.json"), "utf-8")) as QuestionPack;

const accQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
const salesQuestionTexts = salesPack.questions.map((q) => q.question.toLowerCase().trim());
const procQuestionTexts = procPack.questions.map((q) => q.question.toLowerCase().trim());
const whQuestionTexts = whPack.questions.map((q) => q.question.toLowerCase().trim());
const invQuestionTexts = invPack.questions.map((q) => q.question.toLowerCase().trim());
const logQuestionTexts = logPack.questions.map((q) => q.question.toLowerCase().trim());

let salesOverlapCount = 0;
for (const aq of accQuestionTexts) {
  if (salesQuestionTexts.includes(aq)) {
    salesOverlapCount++;
    console.error(`Sales ile birebir örtüşen soru bulundu: "${aq}"`);
  }
}
assert(salesOverlapCount === 0, "Sales soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let procOverlapCount = 0;
for (const aq of accQuestionTexts) {
  if (procQuestionTexts.includes(aq)) {
    procOverlapCount++;
    console.error(`Procurement ile birebir örtüşen soru bulundu: "${aq}"`);
  }
}
assert(procOverlapCount === 0, "Procurement soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let whOverlapCount = 0;
for (const aq of accQuestionTexts) {
  if (whQuestionTexts.includes(aq)) {
    whOverlapCount++;
    console.error(`Warehouse ile birebir örtüşen soru bulundu: "${aq}"`);
  }
}
assert(whOverlapCount === 0, "Warehouse soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let invOverlapCount = 0;
for (const aq of accQuestionTexts) {
  if (invQuestionTexts.includes(aq)) {
    invOverlapCount++;
    console.error(`Inventory ile birebir örtüşen soru bulundu: "${aq}"`);
  }
}
assert(invOverlapCount === 0, "Inventory soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let logOverlapCount = 0;
for (const aq of accQuestionTexts) {
  if (logQuestionTexts.includes(aq)) {
    logOverlapCount++;
    console.error(`Logistics ile birebir örtüşen soru bulundu: "${aq}"`);
  }
}
assert(logOverlapCount === 0, "Logistics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_acc_001",
  analysis_project_id: "p1",
  business_function_code: "ACCOUNTING",
  process_name: "Vergi ve KDV Süreçleri Yönetimi",
  question_text: "Enflasyon Düzeltmesi (VUK Geçici 33. Madde) muhasebe katsayıları ERP'de otomatik mi hesaplanıyor?",
  description: "Mali tabloların enflasyon muhasebesi değerlemesi için.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_acc_001", value: "enflasyon_otomatik", label: "Evet, ÜFE endeksi girildiğinde parasal olmayan kıymetler sistemde otomatik düzeltilir", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_acc_001", value: "excelde_duzeltilir", label: "Excel tablolarında hesaplanıp toplu mahsup fişi olarak girilir", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_acc_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 43);
assert(adaptedQuestion.id === "cq_acc_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Vergi ve KDV Süreçleri Yönetimi", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "merkezi_tek_hesap_plani_tum_sirketler", note: "3 grup şirketinde ortak hesap planı mevcuttur." }],
  general_note: "Grup muhasebe direktörlüğü tarafından yönetilmektedir.",
});
assert(
  formattedQ1.summaryText.includes("Tüm grup şirketleri ve şubelerde merkezi tek ve standart Tekdüzen Hesap Planı (THP) kullanılır"),
  "Kullanıcı dostu label formatlandı (merkezi_tek_hesap_plani_tum_sirketler enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("3 grup şirketinde ortak hesap planı mevcuttur."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Grup muhasebe direktörlüğü tarafından yönetilmektedir."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with Accounting Data ===");
const mockAccReportModel: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "Genel Muhasebe Keşif Analizi",
    companyName: "Anadolu Finansal Danışmanlık ve Sanayi A.Ş.",
    generatedAt: "19.08.2026",
    projectStatus: "completed",
    packVersions: {
      ACCOUNTING: "tr.accounting.core v0.1.0",
    },
    isComplete: true,
    progressPercent: 100,
    requiredAnswered: 22,
    requiredTotal: 22,
    reportType: "final",
    draftLabel: "TAM RAPOR — %100",
    projectProgressPercent: 100,
    completedFunctionCount: 1,
    selectedFunctionCount: 1,
    isProjectComplete: true,
  },
  company: {
    companyName: "Anadolu Finansal Danışmanlık ve Sanayi A.Ş.",
    tradeName: "Anadolu Sanayi",
    taxNumber: "1234567890",
    city: "İstanbul",
    country: "Türkiye",
    employeeCount: "600",
    notes: "Genel muhasebe, e-Defter, KDV tevkifatı ve mali kapanış keşfi tamamlandı.",
  },
  profile: {
    analysis_project_id: "p_faz15",
    executive_summary: "Tekdüzen hesap planı, e-Defter, sürekli envanter ve kur farkı entegrasyonu incelendi.",
    overall_assessment: "Otomatik hesap tayin tabloları ve 3-way match entegrasyonu devreye alınacaktır.",
    open_topics: "Masraf merkezi dağıtım anahtarları ve e-Mutabakat sistemi netleştirilecek.",
  },
  scope: [
    {
      code: "ACCOUNTING",
      nameTr: "Muhasebe (Genel)",
      nameEn: "General Accounting",
      category: "Muhasebe & Finans",
      departmentName: "Mali İşler Direktörlüğü",
      responsiblePerson: "Ahmet Yılmaz",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
    },
  ],
  businessFunctions: [
    {
      code: "ACCOUNTING",
      nameTr: "Muhasebe (Genel)",
      nameEn: "General Accounting",
      category: "Muhasebe & Finans",
      sortOrder: 6,
      departmentName: "Mali İşler Direktörlüğü",
      responsiblePerson: "Ahmet Yılmaz",
      status: "completed",
      packId: "tr.accounting.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
      processes: [
        {
          name: "Hesap Planı ve Muhasebe Organizasyonu",
          order: 1,
          questions: [
            {
              id: "ACC-001",
              order: 1,
              process: "Hesap Planı ve Muhasebe Organizasyonu",
              questionText: "Hesap planı yapınız nasıldır ve grup şirketleri / şubeler arasında nasıl yönetilmektedir?",
              answerType: "single_choice",
              criticality: "critical",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "merkezi_tek_hesap_plani_tum_sirketler",
                    label: "Tüm grup şirketleri ve şubelerde merkezi tek ve standart Tekdüzen Hesap Planı (THP) kullanılır",
                    isOther: false,
                    note: "3 grup şirketinde ortak hesap planı mevcuttur.",
                  },
                ],
                summaryText: "• Tüm grup şirketleri ve şubelerde merkezi tek ve standart Tekdüzen Hesap Planı (THP) kullanılır",
              },
              findings: [
                {
                  id: "f_acc_01",
                  title: "Manuel Hesap Açılış Tutarsızlığı",
                  description: "Şubelerin bağımsız alt hesap açması mizan konsolidasyonunda mükerrerlik yaratmaktadır.",
                  priority: "high",
                  status: "open",
                  questionId: "ACC-001",
                  createdAt: "2026-08-19",
                },
              ],
              requirements: [
                {
                  id: "req_acc_01",
                  title: "Merkezi Hesap Planı Onay Mekanizması",
                  description: "Yeni hesap kodu açılışları için ERP üzerinde merkezi onay akışı kurgulanmalıdır.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "ACC-001",
                  createdAt: "2026-08-19",
                },
              ],
              risks: [],
              notes: [],
            },
          ],
        },
      ],
      findings: [
        {
          id: "f_acc_01",
          title: "Manuel Hesap Açılış Tutarsızlığı",
          description: "Şubelerin bağımsız alt hesap açması mizan konsolidasyonunda mükerrerlik yaratmaktadır.",
          priority: "high",
          status: "open",
          questionId: "ACC-001",
          createdAt: "2026-08-19",
        },
      ],
      requirements: [
        {
          id: "req_acc_01",
          title: "Merkezi Hesap Planı Onay Mekanizması",
          description: "Yeni hesap kodu açılışları için ERP üzerinde merkezi onay akışı kurgulanmalıdır.",
          priority: "critical",
          status: "confirmed",
          questionId: "ACC-001",
          createdAt: "2026-08-19",
        },
      ],
      risks: [],
      notes: [],
    },
  ],
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
    totalFindings: 1,
    totalRequirements: 1,
    openRisks: 0,
    totalRisks: 0,
    totalNotes: 0,
    totalFollowups: 0,
    criticalFollowups: 0,
    revisitFollowups: 0,
  },
};

// DOCX Testi
const docxBuffer = await buildDocxBuffer(mockAccReportModel);
assert(docxBuffer.length > 5000, `DOCX üretimi başarılı (${docxBuffer.length} byte)`);

// PDF Testi
const pdfBuffer = await buildPdfBuffer(mockAccReportModel);
assert(pdfBuffer.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.length} byte)`);

// PDF Text Extraction & Türkçe Karakter Kontrolü
const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");
assert(pdfText.includes("Muhasebe (Genel)"), "PDF çıktısında 'Muhasebe (Genel)' başlığı mevcut");
assert(pdfText.includes("Anadolu Finansal Danışmanlık ve Sanayi A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Merkezi Hesap Planı Onay Mekanizması"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockAccReportModel.metadata.packVersions.ACCOUNTING === "tr.accounting.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("ACCOUNTING");
assert(mappedPackId === "tr.accounting.core", `getPackIdForFunction("ACCOUNTING") -> tr.accounting.core`);

console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-15 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
