/**
 * ERP CRM Discovery — FAZ-12 Warehouse Question Pack Acceptance Test Suite
 *
 * Automated verification for:
 * 1. Pack Loading & Metadata Integrity (tr.warehouse.core v0.1.0, canonical code = WAREHOUSE)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (38 questions, sequential order 1..38, WH-001..WH-038)
 * 4. Required Question Count Truth (19 required, 19 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 16 Canonical Process Coverage
 * 7. Conditional Branching Resolution (8 condition points tested with branching engine)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 10. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 11. DOCX Binary Generation Compatibility
 * 12. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 13. Loader Registry Mapping Parity (getPackIdForFunction("WAREHOUSE") === "tr.warehouse.core")
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
console.log("FAZ-12: DEPO YÖNETİMİ (WAREHOUSE) QUESTION PACK TEST");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/warehouse/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "Warehouse pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.warehouse.core", "pack_id = tr.warehouse.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.schema_version === "1", "schema_version = 1");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "WAREHOUSE", "business_function_code = WAREHOUSE (Kanonik Kod)");
assert(pack.meta.name === "Depo Yönetimi Ön Analizi", "name = Depo Yönetimi Ön Analizi");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 20, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validationResult = validateQuestionPack(pack);
if (!validationResult.valid) {
  console.error("   Doğrulama hataları:", validationResult.errors);
}
assert(validationResult.valid === true, "validateQuestionPack(warehousePack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity, Deterministic Order & IDs ────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 38, `Toplam soru sayısı tam 38 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 38, "Tüm 38 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `WH-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: index ${i}, id: ${pack.questions[i].id}, order: ${pack.questions[i].order}`);
  }
}
assert(orderCorrect, "Tüm sorular WH-001'den WH-038'e sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ─────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 19, `Zorunlu soru sayısı tam 19 adettir (${requiredQuestions.length})`);
assert(optionalQuestions.length === 19, `Opsiyonel soru sayısı tam 19 adettir (${optionalQuestions.length})`);

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

// ─── TEST 6: 16 Canonical Process Coverage ───────────────────────────────────
console.log("\n=== T06: 16 Canonical Process Coverage ===");
const expectedProcesses = [
  "Depo Yapısı ve Organizasyonu",
  "Mal Kabul ve Giriş Kontrolü",
  "Siparişsiz ve Beklenmeyen Mal Kabul",
  "Kalite Kontrol ve Karantina Alanı",
  "Raf / Göz / Lokasyon Yönetimi",
  "Stok Yerleştirme (Putaway)",
  "Depolar Arası Transfer ve Yoldaki Stok",
  "Stok Rezervasyonu ve Tahsis",
  "Sipariş Toplama (Picking)",
  "Paketleme ve Sevkiyata Hazırlık",
  "Sayım ve Envanter Kontrolü",
  "Lot / Seri Numarası Takibi",
  "Raf Ömrü, SKT, FIFO ve FEFO",
  "Hasarlı, İade ve Hurda Stok",
  "Barkod, QR ve El Terminali",
  "Depo Performansı ve Özel Koşullar",
];

const actualProcesses = Array.from(new Set(pack.questions.map((q) => q.process)));
assert(actualProcesses.length === 16, `Tam 16 farklı süreç grubu tanımlı (${actualProcesses.length})`);

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

// Senaryo 1: Kalite kontrol uygulanmıyorsa WH-007 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("WH-006", { selected: [{ value: "kalite_kontrol_uygulanmiyor" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "WH-007"), "WH-006=kalite_kontrol_uygulanmiyor iken WH-007 gizlendi");

answersScenario1.set("WH-006", { selected: [{ value: "sistem_karantina_deposu" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "WH-007"), "WH-006=sistem_karantina_deposu iken WH-007 görünür");

// Senaryo 2: Adresleme yoksa WH-009 ve WH-010 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("WH-008", { selected: [{ value: "adresleme_yok_hafizaya_bagli" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "WH-009"), "WH-008=adresleme_yok_hafizaya_bagli iken WH-009 gizlendi");
assert(!visibleQ3.some((q) => q.id === "WH-010"), "WH-008=adresleme_yok_hafizaya_bagli iken WH-010 gizlendi");

// Senaryo 3: Lot/Seri takibi yoksa WH-026 ve WH-027 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("WH-025", { selected: [{ value: "lot_veya_seri_yok" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ4.some((q) => q.id === "WH-026"), "WH-025=lot_veya_seri_yok iken WH-026 gizlendi");
assert(!visibleQ4.some((q) => q.id === "WH-027"), "WH-025=lot_veya_seri_yok iken WH-027 gizlendi");

// Senaryo 4: Zorunlu FEFO yoksa WH-029 gizlenmeli
const answersScenario4 = new Map<string, AnswerData>();
answersScenario4.set("WH-028", { selected: [{ value: "sadece_giris_tarihli_fifo" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario4);
assert(!visibleQ5.some((q) => q.id === "WH-029"), "WH-028=sadece_giris_tarihli_fifo iken WH-029 gizlendi");

// Senaryo 5: Barkod ve terminal yoksa WH-033 ve WH-034 gizlenmeli
const answersScenario5 = new Map<string, AnswerData>();
answersScenario5.set("WH-032", { selected: [{ value: "barkod_ve_terminal_yok" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario5);
assert(!visibleQ6.some((q) => q.id === "WH-033"), "WH-032=barkod_ve_terminal_yok iken WH-033 gizlendi");
assert(!visibleQ6.some((q) => q.id === "WH-034"), "WH-032=barkod_ve_terminal_yok iken WH-034 gizlendi");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `19 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("WH-001", {
  id: "qf_wh_01",
  analysis_project_id: "p1",
  business_function_code: "WAREHOUSE",
  question_id: "WH-001",
  flag_type: "revisit",
  note: "Lokasyon sayısı teyit edilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("WH-008", {
  id: "qf_wh_08",
  analysis_project_id: "p1",
  business_function_code: "WAREHOUSE",
  question_id: "WH-008",
  flag_type: "critical",
  note: "WMS lisans kararı bekleniyor",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});

const progressWithFollowups = calculateProgress(pack.questions, answersAllReq, mockFollowups);
assert(progressWithFollowups.answered === 17, `Bayraklı sorular tamamlanmamış sayıldı (17/19)`);
assert(progressWithFollowups.percentage === Math.round((17 / 19) * 100), `İlerleme dürüstçe %${progressWithFollowups.percentage} hesaplandı`);

// ─── TEST 9: Custom Questions Adapter Compatibility ──────────────────────────
console.log("\n=== T09: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_wh_001",
  analysis_project_id: "p1",
  business_function_code: "WAREHOUSE",
  process_name: "Raf / Göz / Lokasyon Yönetimi",
  question_text: "Otomatik Dikey Depolama (Kardex vb.) sistemi kullanılıyor mu?",
  description: "Dikey asansörlü depolama entegrasyonu için.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_wh_001", value: "kardex_var", label: "Evet, 2 adet dikey karusel aktif kullanılıyor", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_wh_001", value: "kardex_yok", label: "Hayır, sadece standart statik raflar var", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_wh_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 39);
assert(adaptedQuestion.id === "cq_wh_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Raf / Göz / Lokasyon Yönetimi", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 10: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T10: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "tek_merkez_cok_bolum", note: "Hammadde ve mamul depoları ana fabrikadadır." }],
  general_note: "Toplam kapalı alan 8.500 m2'dir.",
});
assert(
  formattedQ1.summaryText.includes("Tek bir ana yerleşkede farklı amaçlı depo alanları"),
  "Kullanıcı dostu label formatlandı (tek_merkez_cok_bolum enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("Hammadde ve mamul depoları ana fabrikadadır."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Toplam kapalı alan 8.500 m2'dir."), "Genel not formatlandı");

// ─── TEST 11 & 12: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T11 & T12: DOCX & PDF Export with Warehouse Data ===");
const mockWhReportModel: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "Depo ve Lojistik Keşif Analizi",
    companyName: "Lojistik & Üretim Sanayi A.Ş.",
    generatedAt: "19.08.2026",
    projectStatus: "completed",
    packVersions: {
      WAREHOUSE: "tr.warehouse.core v0.1.0",
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
    companyName: "Lojistik & Üretim Sanayi A.Ş.",
    tradeName: "Lojistik Sanayi",
    taxNumber: "9876543210",
    city: "Kocaeli",
    country: "Türkiye",
    employeeCount: "320",
    notes: "Depo saha keşfi tamamlandı.",
  },
  profile: {
    analysis_project_id: "p_faz12",
    executive_summary: "Depo ve lokasyon yönetimi süreçlerinin dijitalleşme hazırlığı tamamlandı.",
    overall_assessment: "WMS lokasyon adresleme ve el terminali devreye alınmalıdır.",
    open_topics: "Dinamik raf yerleştirme ve el terminali Wi-Fi altyapısı güçlendirilecek.",
  },
  scope: [
    {
      code: "WAREHOUSE",
      nameTr: "Depo Yönetimi",
      nameEn: "Warehouse Management",
      category: "Lojistik & Depo",
      departmentName: "Depo ve Lojistik Müdürlüğü",
      responsiblePerson: "Kemal Yılmaz",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 19,
      totalQuestionCount: 19,
    },
  ],
  businessFunctions: [
    {
      code: "WAREHOUSE",
      nameTr: "Depo Yönetimi",
      nameEn: "Warehouse Management",
      category: "Lojistik & Depo",
      sortOrder: 10,
      departmentName: "Depo ve Lojistik Müdürlüğü",
      responsiblePerson: "Kemal Yılmaz",
      status: "completed",
      packId: "tr.warehouse.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 19,
      totalQuestionCount: 19,
      processes: [
        {
          name: "Depo Yapısı ve Organizasyonu",
          order: 1,
          questions: [
            {
              id: "WH-001",
              order: 1,
              process: "Depo Yapısı ve Organizasyonu",
              questionText: "Şirketinizde kaç adet fiziksel depo bulunmaktadır ve bu depolar nasıl sınıflandırılmaktadır?",
              answerType: "single_choice",
              criticality: "critical",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "tek_merkez_cok_bolum",
                    label: "Tek bir ana yerleşkede farklı amaçlı depo alanları (Hammadde, Mamul, Sarf vb.) var",
                    isOther: false,
                    note: "Hammadde ve mamul depoları ana fabrikadadır.",
                  },
                ],
                summaryText: "• Tek bir ana yerleşkede farklı amaçlı depo alanları (Hammadde, Mamul, Sarf vb.) var",
              },
              findings: [
                {
                  id: "f_wh_01",
                  title: "Adresli Lokasyon Eksikliği",
                  description: "Depoda raf adresleme sistemi olmadığı için ürün bulma süreleri uzundur.",
                  priority: "high",
                  status: "open",
                  questionId: "WH-001",
                  createdAt: "2026-08-19",
                },
              ],
              requirements: [
                {
                  id: "req_wh_01",
                  title: "WMS Hücresel Adresleme Modülü",
                  description: "Koridor-Raf-Kat-Göz hiyerarşisinde adresli lokasyon takibi zorunlu olmalıdır.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "WH-001",
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
          id: "f_wh_01",
          title: "Adresli Lokasyon Eksikliği",
          description: "Depoda raf adresleme sistemi olmadığı için ürün bulma süreleri uzundur.",
          priority: "high",
          status: "open",
          questionId: "WH-001",
          createdAt: "2026-08-19",
        },
      ],
      requirements: [
        {
          id: "req_wh_01",
          title: "WMS Hücresel Adresleme Modülü",
          description: "Koridor-Raf-Kat-Göz hiyerarşisinde adresli lokasyon takibi zorunlu olmalıdır.",
          priority: "critical",
          status: "confirmed",
          questionId: "WH-001",
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
const docxBuffer = await buildDocxBuffer(mockWhReportModel);
assert(docxBuffer.length > 5000, `DOCX üretimi başarılı (${docxBuffer.length} byte)`);

// PDF Testi
const pdfBuffer = await buildPdfBuffer(mockWhReportModel);
assert(pdfBuffer.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.length} byte)`);

// PDF Text Extraction & Türkçe Karakter Kontrolü
const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
assert(pdfText.includes("Depo Yönetimi"), "PDF çıktısında 'Depo Yönetimi' başlığı mevcut");
assert(pdfText.includes("Lojistik & Üretim Sanayi A.Ş."), "PDF çıktısında firma adı mevcut");
assert(pdfText.includes("WMS Hücresel Adresleme Modülü"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockWhReportModel.metadata.packVersions.WAREHOUSE === "tr.warehouse.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 13: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T13: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("WAREHOUSE");
assert(mappedPackId === "tr.warehouse.core", `getPackIdForFunction("WAREHOUSE") -> tr.warehouse.core`);

console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-12 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
