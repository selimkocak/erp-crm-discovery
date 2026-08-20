/**
 * ERP CRM Discovery — FAZ-14 Logistics Question Pack Acceptance Test Suite
 *
 * Automated verification for:
 * 1. Pack Loading & Metadata Integrity (tr.logistics.core v0.1.0, canonical code = LOGISTICS)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (37 questions, sequential order 1..37, LOG-001..LOG-037)
 * 4. Required Question Count Truth (19 required, 18 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 17 Canonical Process Coverage
 * 7. Conditional Branching Resolution (branching engine with Map)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (verifying zero overlap with SALES, PROCUREMENT, WAREHOUSE and INVENTORY)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("LOGISTICS") === "tr.logistics.core")
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
console.log("FAZ-14: SEVKİYAT VE LOJİSTİK (LOGISTICS) QUESTION PACK TEST");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/logistics/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "Logistics pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.logistics.core", "pack_id = tr.logistics.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.schema_version === "1", "schema_version = 1");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "LOGISTICS", "business_function_code = LOGISTICS (Kanonik Kod)");
assert(pack.meta.name === "Sevkiyat ve Lojistik Ön Analizi", "name = Sevkiyat ve Lojistik Ön Analizi");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 20, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validationResult = validateQuestionPack(pack);
if (!validationResult.valid) {
  console.error("   Doğrulama hataları:", validationResult.errors);
}
assert(validationResult.valid === true, "validateQuestionPack(logisticsPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity, Deterministic Order & IDs ────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 37, `Toplam soru sayısı tam 37 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 37, "Tüm 37 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `LOG-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: index ${i}, id: ${pack.questions[i].id}, order: ${pack.questions[i].order}`);
  }
}
assert(orderCorrect, "Tüm sorular LOG-001'den LOG-037'ye sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ─────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 19, `Zorunlu soru sayısı tam 19 adettir (${requiredQuestions.length})`);
assert(optionalQuestions.length === 18, `Opsiyonel soru sayısı tam 18 adettir (${optionalQuestions.length})`);

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

// ─── TEST 6: 17 Canonical Process Coverage ───────────────────────────────────
console.log("\n=== T06: 17 Canonical Process Coverage ===");
const expectedProcesses = [
  "Sevkiyat Talebi ve Teslimat Emri Başlatma",
  "Sevkiyat Planlama ve Önceliklendirme",
  "Kısmi ve Birleştirilmiş Sevkiyat Yönetimi",
  "Araç, Filo ve Taşıyıcı Yönetimi",
  "Rota, Dağıtım ve Randevu Planlama",
  "Yükleme Organizasyonu ve Kapasite Kontrolü",
  "İrsaliye ve Sevk Belgeleri Yönetimi (e-İrsaliye)",
  "Teslimat Doğrulaması ve Teslim Kanıtı (POD)",
  "Teslim Edilememe, Red ve İade Lojistiği",
  "Kargo ve Kurye Entegrasyonu",
  "Müşteri Özel Sevkiyat ve Teslimat Şartları",
  "Navlun ve Lojistik Maliyetleri Yönetimi",
  "Dış Kaynak Lojistik ve 3PL Yönetimi",
  "İhracat Sevkiyatları ve Gümrük Çıkış Süreçleri",
  "Sevkiyat Güvenliği, Kantar ve Mühür Yönetimi",
  "Sevkiyat Performansı, OTIF ve KPI'lar",
  "İade Alım ve Müşteriden Toplama Lojistiği",
];

const actualProcesses = Array.from(new Set(pack.questions.map((q) => q.process)));
assert(actualProcesses.length === 17, `Tam 17 farklı süreç grubu tanımlı (${actualProcesses.length})`);

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

// Senaryo 1: Müşteri kendi aracıyla alıyorsa LOG-008 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("LOG-007", { selected: [{ value: "musteri_kendi_araciyla_alir" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "LOG-008"), "LOG-007=musteri_kendi_araciyla_alir iken LOG-008 gizlendi");

answersScenario1.set("LOG-007", { selected: [{ value: "sadece_dis_nakliye_ve_kargo" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "LOG-008"), "LOG-007=sadece_dis_nakliye_ve_kargo iken LOG-008 görünür");

// Senaryo 2: Kargo kullanılmıyorsa LOG-022 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("LOG-021", { selected: [{ value: "kargo_kullanmiyoruz" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "LOG-022"), "LOG-021=kargo_kullanmiyoruz iken LOG-022 gizlendi");

answersScenario2.set("LOG-021", { selected: [{ value: "tam_api_entegrasyonu" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "LOG-022"), "LOG-021=tam_api_entegrasyonu iken LOG-022 görünür");

// Senaryo 3: 3PL yoksa LOG-029 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("LOG-028", { selected: [{ value: "3pl_kullanmiyoruz_tum_operasyon_ic_kaynak" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "LOG-029"), "LOG-028=3pl_kullanmiyoruz iken LOG-029 gizlendi");

answersScenario3.set("LOG-028", { selected: [{ value: "evet_3pl_depo_ve_dagitim_kullaniyoruz" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "LOG-029"), "LOG-028=evet_3pl_depo_ve_dagitim_kullaniyoruz iken LOG-029 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `19 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("LOG-001", {
  id: "qf_log_01",
  analysis_project_id: "p1",
  business_function_code: "LOGISTICS",
  question_id: "LOG-001",
  flag_type: "revisit",
  note: "Otomatik teslimat belgesi kurgusu satış ile teyit edilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("LOG-014", {
  id: "qf_log_14",
  analysis_project_id: "p1",
  business_function_code: "LOGISTICS",
  question_id: "LOG-014",
  flag_type: "critical",
  note: "e-İrsaliye entegratör API zamanlaması netleştirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});

const progressWithFollowups = calculateProgress(pack.questions, answersAllReq, mockFollowups);
assert(progressWithFollowups.answered === 17, `Bayraklı sorular tamamlanmamış sayıldı (17/19)`);
assert(progressWithFollowups.percentage === Math.round((17 / 19) * 100), `İlerleme dürüstçe %${progressWithFollowups.percentage} hesaplandı`);

// ─── TEST 9: Cross-Pack Duplication Audit ─────────────────────────────────────
console.log("\n=== T09: Cross-Pack Duplication Audit ===");
const salesPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/sales/core.json"), "utf-8")) as QuestionPack;
const procPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/procurement/core.json"), "utf-8")) as QuestionPack;
const whPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/warehouse/core.json"), "utf-8")) as QuestionPack;
const invPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/inventory/core.json"), "utf-8")) as QuestionPack;

const logQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
const salesQuestionTexts = salesPack.questions.map((q) => q.question.toLowerCase().trim());
const procQuestionTexts = procPack.questions.map((q) => q.question.toLowerCase().trim());
const whQuestionTexts = whPack.questions.map((q) => q.question.toLowerCase().trim());
const invQuestionTexts = invPack.questions.map((q) => q.question.toLowerCase().trim());

let salesOverlapCount = 0;
for (const lq of logQuestionTexts) {
  if (salesQuestionTexts.includes(lq)) {
    salesOverlapCount++;
    console.error(`Sales ile birebir örtüşen soru bulundu: "${lq}"`);
  }
}
assert(salesOverlapCount === 0, "Sales soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let procOverlapCount = 0;
for (const lq of logQuestionTexts) {
  if (procQuestionTexts.includes(lq)) {
    procOverlapCount++;
    console.error(`Procurement ile birebir örtüşen soru bulundu: "${lq}"`);
  }
}
assert(procOverlapCount === 0, "Procurement soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let whOverlapCount = 0;
for (const lq of logQuestionTexts) {
  if (whQuestionTexts.includes(lq)) {
    whOverlapCount++;
    console.error(`Warehouse ile birebir örtüşen soru bulundu: "${lq}"`);
  }
}
assert(whOverlapCount === 0, "Warehouse soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let invOverlapCount = 0;
for (const lq of logQuestionTexts) {
  if (invQuestionTexts.includes(lq)) {
    invOverlapCount++;
    console.error(`Inventory ile birebir örtüşen soru bulundu: "${lq}"`);
  }
}
assert(invOverlapCount === 0, "Inventory soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_log_001",
  analysis_project_id: "p1",
  business_function_code: "LOGISTICS",
  process_name: "Rota, Dağıtım ve Randevu Planlama",
  question_text: "Soğuk zincir araçlarında sıcaklık veri kaydedici (Data Logger) ERP'ye canlı aktarılıyor mu?",
  description: "Frigorifik sevkiyat sıcaklık eşik takibi için.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_log_001", value: "iot_sicaklik_canli", label: "Evet, IoT sensörlerle araç sıcaklığı canlı ERP ekranında izlenir", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_log_001", value: "manuel_termometre", label: "Şoför teslim anında termometre çıktısını kağıt teslim tutanağına iliştirir", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_log_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 38);
assert(adaptedQuestion.id === "cq_log_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Rota, Dağıtım ve Randevu Planlama", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "otomatik_teslimat_emri", note: "Sipariş teyit edildiği anda lojistik kuyruğuna düşer." }],
  general_note: "Günde ortalama 45 sevkiyat emri oluşmaktadır.",
});
assert(
  formattedQ1.summaryText.includes("Onaylanan satış siparişinden sistem otomatik olarak 'Teslimat / Sevk Emri' oluşturur"),
  "Kullanıcı dostu label formatlandı (otomatik_teslimat_emri enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("Sipariş teyit edildiği anda lojistik kuyruğuna düşer."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Günde ortalama 45 sevkiyat emri oluşmaktadır."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with Logistics Data ===");
const mockLogReportModel: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "Sevkiyat ve Lojistik Keşif Analizi",
    companyName: "Uluslararası Dağıtım ve Lojistik A.Ş.",
    generatedAt: "19.08.2026",
    projectStatus: "completed",
    packVersions: {
      LOGISTICS: "tr.logistics.core v0.1.0",
    },
    isComplete: true,
    progressPercent: 100,
    requiredAnswered: 19,
    requiredTotal: 19,
    reportType: "final",
    draftLabel: "TAM RAPOR — %100",
    projectProgressPercent: 100,
    completedFunctionCount: 1,
    selectedFunctionCount: 1,
    isProjectComplete: true,
  },
  company: {
    companyName: "Uluslararası Dağıtım ve Lojistik A.Ş.",
    tradeName: "Uluslararası Dağıtım",
    taxNumber: "9988776655",
    city: "İzmir",
    country: "Türkiye",
    employeeCount: "450",
    notes: "Sevkiyat, e-İrsaliye ve nakliye saha keşfi tamamlandı.",
  },
  profile: {
    analysis_project_id: "p_faz14",
    executive_summary: "Sevkiyat planlama, e-İrsaliye ve nakliye maliyet entegrasyonu incelendi.",
    overall_assessment: "Mobil POD teslim kanıtı ve taşıyıcı tarife eşleştirme devreye alınacaktır.",
    open_topics: "Zincir market randevu entegrasyonu ve kargo API bağlantısı netleştirilecek.",
  },
  scope: [
    {
      code: "LOGISTICS",
      nameTr: "Sevkiyat ve Lojistik",
      nameEn: "Shipping & Logistics",
      category: "Lojistik & Depo",
      departmentName: "Lojistik ve Sevkiyat Direktörlüğü",
      responsiblePerson: "Murat Çelik",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 19,
      totalQuestionCount: 19,
    },
  ],
  businessFunctions: [
    {
      code: "LOGISTICS",
      nameTr: "Sevkiyat ve Lojistik",
      nameEn: "Shipping & Logistics",
      category: "Lojistik & Depo",
      sortOrder: 11,
      departmentName: "Lojistik ve Sevkiyat Direktörlüğü",
      responsiblePerson: "Murat Çelik",
      status: "completed",
      packId: "tr.logistics.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 19,
      totalQuestionCount: 19,
      processes: [
        {
          name: "Sevkiyat Talebi ve Teslimat Emri Başlatma",
          order: 1,
          questions: [
            {
              id: "LOG-001",
              order: 1,
              process: "Sevkiyat Talebi ve Teslimat Emri Başlatma",
              questionText: "Sevkiyat süreci sistemde hangi belge veya tetikleyici ile başlatılmaktadır?",
              answerType: "single_choice",
              criticality: "critical",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "otomatik_teslimat_emri",
                    label: "Onaylanan satış siparişinden sistem otomatik olarak 'Teslimat / Sevk Emri' oluşturur",
                    isOther: false,
                    note: "Sipariş teyit edildiği anda lojistik kuyruğuna düşer.",
                  },
                ],
                summaryText: "• Onaylanan satış siparişinden sistem otomatik olarak 'Teslimat / Sevk Emri' oluşturur",
              },
              findings: [
                {
                  id: "f_log_01",
                  title: "Manuel Sevk Emri Gecikmesi",
                  description: "Satış temsilcilerinin e-posta ile sevk talimatı vermesi 24 saate varan gecikmelere yol açmaktadır.",
                  priority: "high",
                  status: "open",
                  questionId: "LOG-001",
                  createdAt: "2026-08-19",
                },
              ],
              requirements: [
                {
                  id: "req_log_01",
                  title: "Otomatik Çıkış Teslimatı Tetikleyicisi",
                  description: "Onaylanan ve kredisi uygun satış siparişlerinden otomatik Outbound Delivery belgesi türetilmelidir.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "LOG-001",
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
          id: "f_log_01",
          title: "Manuel Sevk Emri Gecikmesi",
          description: "Satış temsilcilerinin e-posta ile sevk talimatı vermesi 24 saate varan gecikmelere yol açmaktadır.",
          priority: "high",
          status: "open",
          questionId: "LOG-001",
          createdAt: "2026-08-19",
        },
      ],
      requirements: [
        {
          id: "req_log_01",
          title: "Otomatik Çıkış Teslimatı Tetikleyicisi",
          description: "Onaylanan ve kredisi uygun satış siparişlerinden otomatik Outbound Delivery belgesi türetilmelidir.",
          priority: "critical",
          status: "confirmed",
          questionId: "LOG-001",
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
const docxBuffer = await buildDocxBuffer(mockLogReportModel);
assert(docxBuffer.length > 5000, `DOCX üretimi başarılı (${docxBuffer.length} byte)`);

// PDF Testi
const pdfBuffer = await buildPdfBuffer(mockLogReportModel);
assert(pdfBuffer.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.length} byte)`);

// PDF Text Extraction & Türkçe Karakter Kontrolü
const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");
assert(pdfText.includes("Sevkiyat ve Lojistik"), "PDF çıktısında 'Sevkiyat ve Lojistik' başlığı mevcut");
assert(pdfText.includes("Uluslararası Dağıtım ve Lojistik A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Otomatik Çıkış Teslimatı Tetikleyicisi"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockLogReportModel.metadata.packVersions.LOGISTICS === "tr.logistics.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("LOGISTICS");
assert(mappedPackId === "tr.logistics.core", `getPackIdForFunction("LOGISTICS") -> tr.logistics.core`);

console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-14 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
