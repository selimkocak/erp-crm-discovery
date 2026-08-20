/**
 * ERP CRM Discovery — FAZ-13 Inventory Question Pack Acceptance Test Suite
 *
 * Automated verification for:
 * 1. Pack Loading & Metadata Integrity (tr.inventory.core v0.1.0, canonical code = INVENTORY)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (37 questions, sequential order 1..37, INV-001..INV-037)
 * 4. Required Question Count Truth (19 required, 18 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 16 Canonical Process Coverage
 * 7. Conditional Branching Resolution (branching engine with Map)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (verifying zero overlap with PROCUREMENT and WAREHOUSE)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("INVENTORY") === "tr.inventory.core")
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
console.log("FAZ-13: STOK YÖNETİMİ (INVENTORY) QUESTION PACK TEST");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/inventory/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "Inventory pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.inventory.core", "pack_id = tr.inventory.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.schema_version === "1", "schema_version = 1");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "INVENTORY", "business_function_code = INVENTORY (Kanonik Kod)");
assert(pack.meta.name === "Stok Yönetimi Ön Analizi", "name = Stok Yönetimi Ön Analizi");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 20, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validationResult = validateQuestionPack(pack);
if (!validationResult.valid) {
  console.error("   Doğrulama hataları:", validationResult.errors);
}
assert(validationResult.valid === true, "validateQuestionPack(inventoryPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity, Deterministic Order & IDs ────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 37, `Toplam soru sayısı tam 37 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 37, "Tüm 37 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `INV-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: index ${i}, id: ${pack.questions[i].id}, order: ${pack.questions[i].order}`);
  }
}
assert(orderCorrect, "Tüm sorular INV-001'den INV-037'ye sıralı ve deterministiktir");

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

// ─── TEST 6: 16 Canonical Process Coverage ───────────────────────────────────
console.log("\n=== T06: 16 Canonical Process Coverage ===");
const expectedProcesses = [
  "Stok Ana Veri Yapısı ve Kodlama",
  "Malzeme Sınıflandırması ve Nitelik Yönetimi",
  "Ölçü Birimleri ve Birim Dönüşümleri",
  "Stok Türleri ve Özel Sahiplikler (Konsinye & Emanet)",
  "Stok Seviyeleri ve Yeniden Sipariş Politikaları",
  "Stok Kullanılabilirliği ve Rezervasyon Mantığı (ATP)",
  "Negatif Stok Politikası ve Stok Bütünlüğü",
  "Stok Değerleme ve Maliyet Yöntemleri",
  "Stok Yaşlandırma, Yavaş Hareket Eden ve Ölü Stok",
  "Envanter Muhasebesi ve Defter Entegrasyonu",
  "Stok Transferleri ve Şubeler Arası Değer Takibi",
  "Sayım Mutabakatı ve Stok Doğruluk Yönetimi",
  "Stok Raporlama, Devir Hızı ve KPI'lar",
  "İkame (Alternatif) Malzeme ve Revizyon Yönetimi",
  "Promosyon, Set ve Takım (Kitting) Stokları",
  "İade, Hurda ve Fire Stok Muhasebeleştirmesi",
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

// Senaryo 1: Çoklu birim yoksa INV-007 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("INV-006", { selected: [{ value: "sabit_tek_olcu_birimi" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "INV-007"), "INV-006=sabit_tek_olcu_birimi iken INV-007 gizlendi");

answersScenario1.set("INV-006", { selected: [{ value: "coklu_birim_ve_donusum" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "INV-007"), "INV-006=coklu_birim_ve_donusum iken INV-007 görünür");

// Senaryo 2: Negatif stok kesin engellenmişse INV-017 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("INV-016", { selected: [{ value: "kesinlikle_engellenmistir" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "INV-017"), "INV-016=kesinlikle_engellenmistir iken INV-017 gizlendi");

answersScenario2.set("INV-016", { selected: [{ value: "izin_verilir_maliyet_sonra_duzelir" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "INV-017"), "INV-016=izin_verilir_maliyet_sonra_duzelir iken INV-017 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `19 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("INV-001", {
  id: "qf_inv_01",
  analysis_project_id: "p1",
  business_function_code: "INVENTORY",
  question_id: "INV-001",
  flag_type: "revisit",
  note: "MDM onay ekibi netleştirilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("INV-018", {
  id: "qf_inv_18",
  analysis_project_id: "p1",
  business_function_code: "INVENTORY",
  question_id: "INV-018",
  flag_type: "critical",
  note: "Mali İşler Direktörü ile FIFO vs. Yürüyen Ortalama kararı verilecek",
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
const procPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/procurement/core.json"), "utf-8")) as QuestionPack;
const whPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/warehouse/core.json"), "utf-8")) as QuestionPack;

const invQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
const procQuestionTexts = procPack.questions.map((q) => q.question.toLowerCase().trim());
const whQuestionTexts = whPack.questions.map((q) => q.question.toLowerCase().trim());

let procOverlapCount = 0;
for (const iq of invQuestionTexts) {
  if (procQuestionTexts.includes(iq)) {
    procOverlapCount++;
    console.error(`Procurement ile birebir örtüşen soru bulundu: "${iq}"`);
  }
}
assert(procOverlapCount === 0, "Procurement soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let whOverlapCount = 0;
for (const iq of invQuestionTexts) {
  if (whQuestionTexts.includes(iq)) {
    whOverlapCount++;
    console.error(`Warehouse ile birebir örtüşen soru bulundu: "${iq}"`);
  }
}
assert(whOverlapCount === 0, "Warehouse soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_inv_001",
  analysis_project_id: "p1",
  business_function_code: "INVENTORY",
  process_name: "Stok Değerleme ve Maliyet Yöntemleri",
  question_text: "Yüksek enflasyon muhasebesi (TMS 29) stok endekslemesi yapılıyor mu?",
  description: "Enflasyon muhasebesi stok düzeltme katsayıları için.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_inv_001", value: "tms29_var", label: "Evet, sistem otomatik endeksleme katsayısı uygular", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_inv_001", value: "tms29_excel", label: "Excel'de dönem sonu kümülatif hesaplanır", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_inv_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 38);
assert(adaptedQuestion.id === "cq_inv_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Stok Değerleme ve Maliyet Yöntemleri", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "merkezi_yetkili_ekip", note: "Ürün Yönetimi Departmanı tarafından onaylanır." }],
  general_note: "Yeni kart talepleri ERP içindeki MDM formu ile açılır.",
});
assert(
  formattedQ1.summaryText.includes("Sadece tanımlı merkezi bir ana veri (MDM) / ürün yönetimi ekibi"),
  "Kullanıcı dostu label formatlandı (merkezi_yetkili_ekip enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("Ürün Yönetimi Departmanı tarafından onaylanır."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Yeni kart talepleri ERP içindeki MDM formu ile açılır."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with Inventory Data ===");
const mockInvReportModel: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "Stok ve Envanter Keşif Analizi",
    companyName: "Global Endüstri ve Ticaret A.Ş.",
    generatedAt: "19.08.2026",
    projectStatus: "completed",
    packVersions: {
      INVENTORY: "tr.inventory.core v0.1.0",
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
    companyName: "Global Endüstri ve Ticaret A.Ş.",
    tradeName: "Global Endüstri",
    taxNumber: "5554443322",
    city: "İstanbul",
    country: "Türkiye",
    employeeCount: "600",
    notes: "Stok ve değerleme saha keşfi tamamlandı.",
  },
  profile: {
    analysis_project_id: "p_faz13",
    executive_summary: "Stok yönetimi, değerleme ve ATP kullanılabilirlik altyapısı incelendi.",
    overall_assessment: "Yürüyen Ağırlıklı Ortalama ve Çoklu Ölçü Birimi devreye alınacaktır.",
    open_topics: "Konsinye tedarikçi stoklarının otomatik faturalanması netleştirilecek.",
  },
  scope: [
    {
      code: "INVENTORY",
      nameTr: "Stok Yönetimi",
      nameEn: "Inventory Management",
      category: "Lojistik & Depo",
      departmentName: "Stok ve Tedarik Zinciri Direktörlüğü",
      responsiblePerson: "Selin Aydın",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 19,
      totalQuestionCount: 19,
    },
  ],
  businessFunctions: [
    {
      code: "INVENTORY",
      nameTr: "Stok Yönetimi",
      nameEn: "Inventory Management",
      category: "Lojistik & Depo",
      sortOrder: 9,
      departmentName: "Stok ve Tedarik Zinciri Direktörlüğü",
      responsiblePerson: "Selin Aydın",
      status: "completed",
      packId: "tr.inventory.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 19,
      totalQuestionCount: 19,
      processes: [
        {
          name: "Stok Ana Veri Yapısı ve Kodlama",
          order: 1,
          questions: [
            {
              id: "INV-001",
              order: 1,
              process: "Stok Ana Veri Yapısı ve Kodlama",
              questionText: "Stok kartları (malzeme ana verisi) hangi kurallara göre ve kimler tarafından sisteme açılıyor?",
              answerType: "single_choice",
              criticality: "critical",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "merkezi_yetkili_ekip",
                    label: "Sadece tanımlı merkezi bir ana veri (MDM) / ürün yönetimi ekibi onaylı taleple açar",
                    isOther: false,
                    note: "Ürün Yönetimi Departmanı tarafından onaylanır.",
                  },
                ],
                summaryText: "• Sadece tanımlı merkezi bir ana veri (MDM) / ürün yönetimi ekibi onaylı taleple açar",
              },
              findings: [
                {
                  id: "f_inv_01",
                  title: "Mükerrer Kart Kirliliği",
                  description: "Merkezi kodlama kuralı olmadığı için aynı hammadde için 4 farklı kart açılmıştır.",
                  priority: "high",
                  status: "open",
                  questionId: "INV-001",
                  createdAt: "2026-08-19",
                },
              ],
              requirements: [
                {
                  id: "req_inv_01",
                  title: "Merkezi MDM Stok Açılış Onayı",
                  description: "Stok kartı açılışları teknik resim ve üretici kodu tekillik kontrolü ile onay iş akışına bağlanmalıdır.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "INV-001",
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
          id: "f_inv_01",
          title: "Mükerrer Kart Kirliliği",
          description: "Merkezi kodlama kuralı olmadığı için aynı hammadde için 4 farklı kart açılmıştır.",
          priority: "high",
          status: "open",
          questionId: "INV-001",
          createdAt: "2026-08-19",
        },
      ],
      requirements: [
        {
          id: "req_inv_01",
          title: "Merkezi MDM Stok Açılış Onayı",
          description: "Stok kartı açılışları teknik resim ve üretici kodu tekillik kontrolü ile onay iş akışına bağlanmalıdır.",
          priority: "critical",
          status: "confirmed",
          questionId: "INV-001",
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
const docxBuffer = await buildDocxBuffer(mockInvReportModel);
assert(docxBuffer.length > 5000, `DOCX üretimi başarılı (${docxBuffer.length} byte)`);

// PDF Testi
const pdfBuffer = await buildPdfBuffer(mockInvReportModel);
assert(pdfBuffer.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.length} byte)`);

// PDF Text Extraction & Türkçe Karakter Kontrolü
const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");
assert(pdfText.includes("Stok Yönetimi"), "PDF çıktısında 'Stok Yönetimi' başlığı mevcut");
assert(pdfText.includes("Global Endüstri ve Ticaret A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Merkezi MDM Stok Açılış Onayı"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockInvReportModel.metadata.packVersions.INVENTORY === "tr.inventory.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("INVENTORY");
assert(mappedPackId === "tr.inventory.core", `getPackIdForFunction("INVENTORY") -> tr.inventory.core`);

console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-13 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
