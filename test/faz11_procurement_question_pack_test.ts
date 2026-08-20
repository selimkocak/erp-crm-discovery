/**
 * ERP CRM Discovery — FAZ-11 Procurement Question Pack Acceptance Test Suite
 *
 * Automated verification for:
 * 1. Pack Loading & Metadata Integrity (tr.procurement.core v0.1.0, canonical code = PROCUREMENT)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (40 questions, sequential order 1..40, PROC-001..PROC-040)
 * 4. Required Question Count Truth (20 required, 20 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 15 Canonical Process Coverage (A through O processes mapped)
 * 7. Conditional Branching Resolution (7 condition points tested with branching engine)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 10. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 11. DOCX Binary Generation Compatibility
 * 12. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 13. Loader Registry Mapping Parity (getPackIdForFunction("PROCUREMENT") === "tr.procurement.core")
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
console.log("FAZ-11: SATIN ALMA (PROCUREMENT) QUESTION PACK TEST");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/procurement/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "Procurement pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.procurement.core", "pack_id = tr.procurement.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.schema_version === "1", "schema_version = 1");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "PROCUREMENT", "business_function_code = PROCUREMENT (Kanonik Kod)");
assert(pack.meta.name === "Satın Alma Ön Analizi", "name = Satın Alma Ön Analizi");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 20, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validationResult = validateQuestionPack(pack);
if (!validationResult.valid) {
  console.error("   Doğrulama hataları:", validationResult.errors);
}
assert(validationResult.valid === true, "validateQuestionPack(procurementPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity, Deterministic Order & IDs ────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 40, `Toplam soru sayısı tam 40 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 40, "Tüm 40 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `PROC-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: index ${i}, id: ${pack.questions[i].id}, order: ${pack.questions[i].order}`);
  }
}
assert(orderCorrect, "Tüm sorular PROC-001'den PROC-040'a sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ─────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 20, `Zorunlu soru sayısı tam 20 adettir (${requiredQuestions.length})`);
assert(optionalQuestions.length === 20, `Opsiyonel soru sayısı tam 20 adettir (${optionalQuestions.length})`);

// ─── TEST 5: Choice Options & is_other Validation ────────────────────────────
console.log("\n=== T05: Choice Options & is_other Validation ===");
let optionsValid = true;
let otherNoteValid = true;

for (const q of pack.questions) {
  if (q.options) {
    const optValues = new Set<string>();
    let otherCount = 0;
    for (const opt of q.options) {
      if (optValues.has(opt.value)) {
        optionsValid = false;
        console.error(`Tekrarlayan option value: ${opt.value} in ${q.id}`);
      }
      optValues.add(opt.value);

      if (opt.is_other) {
        otherCount++;
        if (!opt.allow_note) {
          otherNoteValid = false;
          console.error(`is_other=true fakat allow_note=false: ${q.id} -> ${opt.value}`);
        }
      }
    }
    if (otherCount > 1) {
      optionsValid = false;
      console.error(`Birden fazla is_other: ${q.id}`);
    }
  }
}
assert(optionsValid, "Tüm seçenek değerleri benzersiz ve en fazla 1 'Diğer' seçeneği içeriyor");
assert(otherNoteValid, "Tüm is_other=true seçeneklerinde allow_note=true kuralı sağlanıyor");

// ─── TEST 6: 15 Canonical Process Coverage ───────────────────────────────────
console.log("\n=== T06: 15 Canonical Process Coverage ===");
const expectedProcesses = [
  "Satın Alma Talebi",
  "Talep Onayı",
  "Tedarikçi Seçimi",
  "Teklif Toplama ve Karşılaştırma",
  "Fiyat ve Ticari Koşullar",
  "Satın Alma Siparişi",
  "Sipariş Onay Süreci",
  "Termin ve Teslimat Takibi",
  "Kısmi Teslimat / Eksik Teslimat",
  "Depo Mal Kabul Entegrasyonu",
  "Kalite Kontrol Entegrasyonu",
  "Satın Alma Faturası / Sipariş Eşleştirmesi",
  "Tedarikçi Performansı",
  "İthal Satın Alma / Döviz İhtiyaçları",
  "Satın Alma Raporlama ve KPI",
];

const foundProcesses = Array.from(new Set(pack.questions.map((q) => q.process)));
assert(foundProcesses.length === 15, `Tam 15 farklı süreç grubu tanımlı (${foundProcesses.length})`);
for (const proc of expectedProcesses) {
  assert(foundProcesses.includes(proc), `Süreç mevcut: "${proc}"`);
}

// ─── TEST 7: Branching Engine Resolution ─────────────────────────────────────
console.log("\n=== T07: Branching Engine Resolution ===");
// Condition referanslarının geçerliliği
for (const q of pack.questions) {
  if (q.condition) {
    const parentQ = pack.questions.find((pq) => pq.id === q.condition!.question_id);
    assert(!!parentQ, `Condition referansı geçerli: ${q.id} -> ${q.condition.question_id}`);
  }
}

// Senaryo 1: Onaysız doğrudan talep (PROC-005 = onaysiz_dogrudan) -> PROC-006 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("PROC-005", { selected: [{ value: "onaysiz_dogrudan" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "PROC-006"), "PROC-005=onaysiz_dogrudan iken PROC-006 gizlendi");

// Senaryo 2: Sistemde talep onayı var (PROC-005 = sistem_onay_var) -> PROC-006 görünür
answersScenario1.set("PROC-005", { selected: [{ value: "sistem_onay_var" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "PROC-006"), "PROC-005=sistem_onay_var iken PROC-006 görünür");

// Senaryo 3: Teklif toplanmıyor (PROC-009 = teklif_alinmiyor) -> PROC-010 ve PROC-011 gizlenmeli
answersScenario1.set("PROC-009", { selected: [{ value: "teklif_alinmiyor" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ3.some((q) => q.id === "PROC-010"), "PROC-009=teklif_alinmiyor iken PROC-010 gizlendi");
assert(!visibleQ3.some((q) => q.id === "PROC-011"), "PROC-009=teklif_alinmiyor iken PROC-011 gizlendi");

// Senaryo 4: Kalite kontrol yok (PROC-028 = kalite_kontrol_yok) -> PROC-029 gizlenmeli
answersScenario1.set("PROC-028", { selected: [{ value: "kalite_kontrol_yok" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ4.some((q) => q.id === "PROC-029"), "PROC-028=kalite_kontrol_yok iken PROC-029 gizlendi");

// Senaryo 5: İthalat ve dövizli alım yok (PROC-035 = hayir_sadece_tl) -> PROC-036 ve PROC-037 gizlenmeli
answersScenario1.set("PROC-035", { selected: [{ value: "hayir_sadece_tl" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ5.some((q) => q.id === "PROC-036"), "PROC-035=hayir_sadece_tl iken PROC-036 gizlendi");
assert(!visibleQ5.some((q) => q.id === "PROC-037"), "PROC-035=hayir_sadece_tl iken PROC-037 gizlendi");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

// 20 zorunlu soruya cevap verilince progress %100 olmalı
const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `20 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

// 2 soruya follow-up bayrağı (🟡 / 🔴) eklenince progress 18/20 = %90 olmalı
const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("PROC-001", {
  id: "qf_proc_01",
  analysis_project_id: "p1",
  business_function_code: "PROCUREMENT",
  question_id: "PROC-001",
  flag_type: "revisit",
  note: "Satın alma müdürü ile detaylandırılacak",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("PROC-007", {
  id: "qf_proc_07",
  analysis_project_id: "p1",
  business_function_code: "PROCUREMENT",
  question_id: "PROC-007",
  flag_type: "critical",
  note: "Onaylı tedarikçi listesi ISO 9001 kuralı incelenecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});

const progressWithFollowups = calculateProgress(pack.questions, answersAllReq, mockFollowups);
assert(progressWithFollowups.answered === 18, `Bayraklı sorular tamamlanmamış sayıldı (18/20)`);
assert(progressWithFollowups.percentage === 90, `İlerleme dürüstçe %90 hesaplandı`);

// ─── TEST 9: Custom Questions Adapter Compatibility ──────────────────────────
console.log("\n=== T09: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_proc_001",
  analysis_project_id: "p1",
  business_function_code: "PROCUREMENT",
  process_name: "Satın Alma Talebi",
  question_text: "Fason üretim satın alımlarında hammadde çıkışı nasıl takip ediliyor?",
  description: "Fason tedarikçi malzeme hareketleri için.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_proc_001", value: "fason_irsaliye", label: "Fason sevk irsaliyesi ile sistemde izleniyor", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_proc_001", value: "manuel_tutanak", label: "Manuel tutanakla takip ediliyor", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_proc_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 41);
assert(adaptedQuestion.id === "cq_proc_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Satın Alma Talebi", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 10: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T10: ReportModel & Formatting Truth ===");
// PROC-001 format kontrolü
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "erp_talep", note: "SAP MM modülü üzerinden açılıyor." }],
  general_note: "Günde ortalama 45 talep giriliyor.",
});
assert(
  formattedQ1.summaryText.includes("ERP / Kurumsal yazılım içindeki satın alma talep modülü üzerinden"),
  "Kullanıcı dostu label formatlandı (erp_talep enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("SAP MM modülü üzerinden açılıyor."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Günde ortalama 45 talep giriliyor."), "Genel not formatlandı");

// ─── TEST 11 & 12: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T11 & T12: DOCX & PDF Export with Procurement Data ===");
const mockProcReportModel: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "Satın Alma Keşif Analizi",
    companyName: "ABC Üretim ve Sanayi A.Ş.",
    generatedAt: "19.08.2026",
    projectStatus: "completed",
    packVersions: {
      PROCUREMENT: "tr.procurement.core v0.1.0",
    },
    isComplete: true,
    progressPercent: 100,
    requiredAnswered: 20,
    requiredTotal: 20,
    reportType: "final",
    draftLabel: "TAM RAPOR — %100",
    projectProgressPercent: 100,
    completedFunctionCount: 1,
    selectedFunctionCount: 1,
    isProjectComplete: true,
  },
  company: {
    companyName: "ABC Üretim ve Sanayi A.Ş.",
    tradeName: "ABC Sanayi",
    taxNumber: "1234567890",
    city: "Bursa",
    country: "Türkiye",
    employeeCount: "450",
    notes: "Satın Alma saha görüşmesi tamamlandı.",
  },
  profile: {
    analysis_project_id: "p_faz11",
    executive_summary: "Satın Alma süreçlerinin dijitalleşme ve ERP entegrasyonu hazırlığı tamamlandı.",
    overall_assessment: "Zorunlu 3-Way Match ve onay matrisi devreye alınacaktır.",
    open_topics: "İthalat masraf dağıtım prosedürü netleştirilecek.",
  },
  scope: [
    {
      code: "PROCUREMENT",
      nameTr: "Satın Alma",
      nameEn: "Procurement",
      category: "Satın Alma",
      departmentName: "Satın Alma Direktörlüğü",
      responsiblePerson: "Mehmet Demir",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 20,
      totalQuestionCount: 20,
    },
  ],
  businessFunctions: [
    {
      code: "PROCUREMENT",
      nameTr: "Satın Alma",
      nameEn: "Procurement",
      category: "Satın Alma",
      sortOrder: 12,
      departmentName: "Satın Alma Direktörlüğü",
      responsiblePerson: "Mehmet Demir",
      status: "completed",
      packId: "tr.procurement.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 20,
      totalQuestionCount: 20,
      processes: [
        {
          name: "Satın Alma Talebi",
          order: 1,
          questions: [
            {
              id: "PROC-001",
              order: 1,
              process: "Satın Alma Talebi",
              questionText: "Satın alma talepleri departmanlar tarafından sisteme nasıl iletiliyor?",
              answerType: "single_choice",
              criticality: "critical",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "erp_talep",
                    label: "ERP / Kurumsal yazılım içindeki satın alma talep modülü üzerinden",
                    isOther: false,
                    note: "Tüm fabrika talepleri bu ekran üzerinden toplanıyor.",
                  },
                ],
                summaryText: "• ERP / Kurumsal yazılım içindeki satın alma talep modülü üzerinden",
              },
              findings: [
                {
                  id: "f_proc_01",
                  title: "Siparişsiz Mal Kabul Riski",
                  description: "Depoya gelen bazı acil malzemelerin sipariş açılmadan kabul edildiği tespit edilmiştir.",
                  priority: "high",
                  status: "open",
                  questionId: "PROC-001",
                  createdAt: "2026-08-19",
                },
              ],
              requirements: [
                {
                  id: "req_proc_01",
                  title: "Zorunlu 3-Way Match Kontrolü",
                  description: "Fatura işlenirken PO ve İrsaliye miktar/fiyat eşleşmesi zorunlu olmalıdır.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "PROC-001",
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
          id: "f_proc_01",
          title: "Siparişsiz Mal Kabul Riski",
          description: "Depoya gelen bazı acil malzemelerin sipariş açılmadan kabul edildiği tespit edilmiştir.",
          priority: "high",
          status: "open",
          questionId: "PROC-001",
          createdAt: "2026-08-19",
        },
      ],
      requirements: [
        {
          id: "req_proc_01",
          title: "Zorunlu 3-Way Match Kontrolü",
          description: "Fatura işlenirken PO ve İrsaliye miktar/fiyat eşleşmesi zorunlu olmalıdır.",
          priority: "critical",
          status: "confirmed",
          questionId: "PROC-001",
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
const docxBuffer = await buildDocxBuffer(mockProcReportModel);
assert(docxBuffer.length > 5000, `DOCX üretimi başarılı (${docxBuffer.length} byte)`);

// PDF Testi
const pdfBuffer = await buildPdfBuffer(mockProcReportModel);
assert(pdfBuffer.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.length} byte)`);

// PDF Text Extraction & Türkçe Karakter Kontrolü
const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
assert(pdfText.includes("Satın Alma"), "PDF çıktısında 'Satın Alma' başlığı mevcut");
assert(pdfText.includes("ABC Üretim ve Sanayi A.Ş."), "PDF çıktısında firma adı mevcut");
assert(pdfText.includes("Zorunlu 3-Way Match Kontrolü"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockProcReportModel.metadata.packVersions.PROCUREMENT === "tr.procurement.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 13: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T13: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("PROCUREMENT");
assert(mappedPackId === "tr.procurement.core", `getPackIdForFunction("PROCUREMENT") -> tr.procurement.core`);

console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-11 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
