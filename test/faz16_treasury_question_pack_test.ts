/**
 * ERP CRM Discovery — FAZ-16 Treasury Question Pack Acceptance Test Suite
 *
 * Automated verification for:
 * 1. Pack Loading & Metadata Integrity (tr.treasury.core v0.1.0, canonical code = TREASURY)
 * 2. Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * 3. Question Quantity & Deterministic Order (42 questions, sequential order 1..42, TRS-001..TRS-042)
 * 4. Required Question Count Truth (22 required, 20 optional)
 * 5. Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * 6. 19 Canonical Process Coverage
 * 7. Conditional Branching Resolution (branching engine with Map)
 * 8. Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * 9. Cross-Pack Duplication Audit (verifying zero overlap with SALES, PROCUREMENT, WAREHOUSE, INVENTORY, LOGISTICS and ACCOUNTING)
 * 10. Question Navigator & Custom Question Compatibility (custom question adapter integration)
 * 11. ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * 12. DOCX Binary Generation Compatibility
 * 13. Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification (PDFParse)
 * 14. Loader Registry Mapping Parity (getPackIdForFunction("TREASURY") === "tr.treasury.core")
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
console.log("FAZ-16: KASA VE BANKA / TREASURY QUESTION PACK TEST");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("\n=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/treasury/core.json");
const rawJson = readFileSync(packPath, "utf-8");
const pack = JSON.parse(rawJson) as QuestionPack;

assert(!!pack, "Treasury pack JSON başarıyla okundu");
assert(pack.meta.pack_id === "tr.treasury.core", "pack_id = tr.treasury.core");
assert(pack.meta.version === "0.1.0", "version = 0.1.0");
assert(pack.meta.schema_version === "1", "schema_version = 1");
assert(pack.meta.language === "tr", "language = tr");
assert(pack.meta.business_function_code === "TREASURY", "business_function_code = TREASURY (Kanonik Kod)");
assert(pack.meta.name === "Kasa ve Banka Ön Analizi", "name = Kasa ve Banka Ön Analizi");
assert(typeof pack.meta.description === "string" && pack.meta.description.length > 20, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validationResult = validateQuestionPack(pack);
if (!validationResult.valid) {
  console.error("   Doğrulama hataları:", validationResult.errors);
}
assert(validationResult.valid === true, "validateQuestionPack(treasuryPack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity, Deterministic Order & IDs ────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 42, `Toplam soru sayısı tam 42 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 42, "Tüm 42 soru ID'si benzersizdir");

let orderCorrect = true;
for (let i = 0; i < pack.questions.length; i++) {
  const expectedId = `TRS-${String(i + 1).padStart(3, "0")}`;
  if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
    orderCorrect = false;
    console.error(`Sıra hatası: index ${i}, id: ${pack.questions[i].id}, order: ${pack.questions[i].order}`);
  }
}
assert(orderCorrect, "Tüm sorular TRS-001'den TRS-042'ye sıralı ve deterministiktir");

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
  "Banka Hesapları ve Organizasyonu",
  "Kasa Yönetimi",
  "Müşteri Tahsilatları",
  "Tedarikçi Ödemeleri",
  "Ödeme Planlama",
  "Ödeme Onay Süreçleri",
  "Banka Hareketleri ve Ekstre Entegrasyonu",
  "Havale / EFT / FAST / Toplu Ödeme",
  "Otomatik Tahsilat ve Sanal POS Bağlantıları",
  "Kredi Kartı / POS Süreçleri",
  "Çek ve Senet Yönetimi",
  "Dövizli Nakit Yönetimi",
  "Nakit Pozisyonu",
  "Nakit Akış Tahmini",
  "Banka Kredileri ve Limitler",
  "Banka Masraf / Komisyon Yönetimi",
  "Likidite ve Finansal Risk",
  "Banka Mutabakatı",
  "Treasury Raporlama ve KPI",
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

// Senaryo 1: Kasa kullanılmıyorsa TRS-004 gizlenmeli
const answersScenario1 = new Map<string, AnswerData>();
answersScenario1.set("TRS-003", { selected: [{ value: "nakit_kasa_kullanilmamaktadir" }] });
const visibleQ1 = getVisibleQuestions(pack.questions, answersScenario1);
assert(!visibleQ1.some((q) => q.id === "TRS-004"), "TRS-003=nakit_kasa_kullanilmamaktadir iken TRS-004 gizlendi");

answersScenario1.set("TRS-003", { selected: [{ value: "coklu_kasa_merkez_sube_doviz_ayri_sorumlular" }] });
const visibleQ2 = getVisibleQuestions(pack.questions, answersScenario1);
assert(visibleQ2.some((q) => q.id === "TRS-004"), "TRS-003=coklu_kasa... iken TRS-004 görünür");

// Senaryo 2: Sanal POS yoksa TRS-018 gizlenmeli
const answersScenario2 = new Map<string, AnswerData>();
answersScenario2.set("TRS-017", { selected: [{ value: "sanal_pos_veya_otomatik_tahsilat_yoktur" }] });
const visibleQ3 = getVisibleQuestions(pack.questions, answersScenario2);
assert(!visibleQ3.some((q) => q.id === "TRS-018"), "TRS-017=sanal_pos_veya_otomatik_tahsilat_yoktur iken TRS-018 gizlendi");

answersScenario2.set("TRS-017", { selected: [{ value: "hem_dbs_hem_sanal_pos_b2b_aktif_kullanilir" }] });
const visibleQ4 = getVisibleQuestions(pack.questions, answersScenario2);
assert(visibleQ4.some((q) => q.id === "TRS-018"), "TRS-017=hem_dbs_hem_sanal_pos... iken TRS-018 görünür");

// Senaryo 3: Fiziki POS yoksa TRS-020 gizlenmeli
const answersScenario3 = new Map<string, AnswerData>();
answersScenario3.set("TRS-019", { selected: [{ value: "fiziki_pos_kullanilmiyor" }] });
const visibleQ5 = getVisibleQuestions(pack.questions, answersScenario3);
assert(!visibleQ5.some((q) => q.id === "TRS-020"), "TRS-019=fiziki_pos_kullanilmiyor iken TRS-020 gizlendi");

answersScenario3.set("TRS-019", { selected: [{ value: "coklu_banka_fiziki_ve_mobil_pos_aktif_kullanilir" }] });
const visibleQ6 = getVisibleQuestions(pack.questions, answersScenario3);
assert(visibleQ6.some((q) => q.id === "TRS-020"), "TRS-019=coklu_banka_fiziki... iken TRS-020 görünür");

// Senaryo 4: Çek/Senet hiç kullanılmıyorsa TRS-022, TRS-023, TRS-024 gizlenmeli
const answersScenario4 = new Map<string, AnswerData>();
answersScenario4.set("TRS-021", { selected: [{ value: "cek_ve_senet_hic_kullanilmaz" }] });
const visibleQ7 = getVisibleQuestions(pack.questions, answersScenario4);
assert(!visibleQ7.some((q) => q.id === "TRS-022"), "TRS-021=cek_ve_senet_hic_kullanilmaz iken TRS-022 gizlendi");
assert(!visibleQ7.some((q) => q.id === "TRS-023"), "TRS-021=cek_ve_senet_hic_kullanilmaz iken TRS-023 gizlendi");
assert(!visibleQ7.some((q) => q.id === "TRS-024"), "TRS-021=cek_ve_senet_hic_kullanilmaz iken TRS-024 gizlendi");

answersScenario4.set("TRS-021", { selected: [{ value: "hem_alinan_cek_hem_keside_cek_yogun_kullanilir" }] });
const visibleQ8 = getVisibleQuestions(pack.questions, answersScenario4);
assert(visibleQ8.some((q) => q.id === "TRS-022"), "TRS-021=hem_alinan_cek... iken TRS-022 görünür");
assert(visibleQ8.some((q) => q.id === "TRS-023"), "TRS-021=hem_alinan_cek... iken TRS-023 görünür");
assert(visibleQ8.some((q) => q.id === "TRS-024"), "TRS-021=hem_alinan_cek... iken TRS-024 görünür");

// Senaryo 5: Dövizli hesap yoksa TRS-026 gizlenmeli
const answersScenario5 = new Map<string, AnswerData>();
answersScenario5.set("TRS-025", { selected: [{ value: "dovizli_banka_hesabimiz_ve_islemimiz_yoktur" }] });
const visibleQ9 = getVisibleQuestions(pack.questions, answersScenario5);
assert(!visibleQ9.some((q) => q.id === "TRS-026"), "TRS-025=dovizli_banka_hesabimiz_ve_islemimiz_yoktur iken TRS-026 gizlendi");

answersScenario5.set("TRS-025", { selected: [{ value: "yogun_dovizli_hesaplar_ihracat_ithalat_ve_doviz_kredileri_var" }] });
const visibleQ10 = getVisibleQuestions(pack.questions, answersScenario5);
assert(visibleQ10.some((q) => q.id === "TRS-026"), "TRS-025=yogun_dovizli... iken TRS-026 görünür");

// Senaryo 6: Banka kredisi kullanılmıyorsa TRS-033 ve TRS-034 gizlenmeli
const answersScenario6 = new Map<string, AnswerData>();
answersScenario6.set("TRS-032", { selected: [{ value: "banka_kredisi_ve_kredi_limiti_kullanilmamaktadir" }] });
const visibleQ11 = getVisibleQuestions(pack.questions, answersScenario6);
assert(!visibleQ11.some((q) => q.id === "TRS-033"), "TRS-032=banka_kredisi...kullanilmamaktadir iken TRS-033 gizlendi");
assert(!visibleQ11.some((q) => q.id === "TRS-034"), "TRS-032=banka_kredisi...kullanilmamaktadir iken TRS-034 gizlendi");

answersScenario6.set("TRS-032", { selected: [{ value: "hem_nakdi_krediler_hem_gayrinakdi_limitler_aktif_kullanilir" }] });
const visibleQ12 = getVisibleQuestions(pack.questions, answersScenario6);
assert(visibleQ12.some((q) => q.id === "TRS-033"), "TRS-032=hem_nakdi_krediler... iken TRS-033 görünür");
assert(visibleQ12.some((q) => q.id === "TRS-034"), "TRS-032=hem_nakdi_krediler... iken TRS-034 görünür");

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}

const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `22 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("TRS-001", {
  id: "qf_trs_01",
  analysis_project_id: "p1",
  business_function_code: "TREASURY",
  question_id: "TRS-001",
  flag_type: "revisit",
  note: "Banka IBAN standartları ve şube listesi hazine müdürüyle teyit edilecek",
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null,
});
mockFollowups.set("TRS-011", {
  id: "qf_trs_11",
  analysis_project_id: "p1",
  business_function_code: "TREASURY",
  question_id: "TRS-011",
  flag_type: "critical",
  note: "Görevler ayrılığı ve banka token onay matrisi yönetim kuruluyla görüşülecek",
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
const accPack = JSON.parse(readFileSync(path.resolve("question-packs/tr/accounting/core.json"), "utf-8")) as QuestionPack;

const trsQuestionTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
const salesQuestionTexts = salesPack.questions.map((q) => q.question.toLowerCase().trim());
const procQuestionTexts = procPack.questions.map((q) => q.question.toLowerCase().trim());
const whQuestionTexts = whPack.questions.map((q) => q.question.toLowerCase().trim());
const invQuestionTexts = invPack.questions.map((q) => q.question.toLowerCase().trim());
const logQuestionTexts = logPack.questions.map((q) => q.question.toLowerCase().trim());
const accQuestionTexts = accPack.questions.map((q) => q.question.toLowerCase().trim());

let salesOverlapCount = 0;
for (const tq of trsQuestionTexts) {
  if (salesQuestionTexts.includes(tq)) {
    salesOverlapCount++;
    console.error(`Sales ile birebir örtüşen soru bulundu: "${tq}"`);
  }
}
assert(salesOverlapCount === 0, "Sales soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let procOverlapCount = 0;
for (const tq of trsQuestionTexts) {
  if (procQuestionTexts.includes(tq)) {
    procOverlapCount++;
    console.error(`Procurement ile birebir örtüşen soru bulundu: "${tq}"`);
  }
}
assert(procOverlapCount === 0, "Procurement soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let whOverlapCount = 0;
for (const tq of trsQuestionTexts) {
  if (whQuestionTexts.includes(tq)) {
    whOverlapCount++;
    console.error(`Warehouse ile birebir örtüşen soru bulundu: "${tq}"`);
  }
}
assert(whOverlapCount === 0, "Warehouse soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let invOverlapCount = 0;
for (const tq of trsQuestionTexts) {
  if (invQuestionTexts.includes(tq)) {
    invOverlapCount++;
    console.error(`Inventory ile birebir örtüşen soru bulundu: "${tq}"`);
  }
}
assert(invOverlapCount === 0, "Inventory soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let logOverlapCount = 0;
for (const tq of trsQuestionTexts) {
  if (logQuestionTexts.includes(tq)) {
    logOverlapCount++;
    console.error(`Logistics ile birebir örtüşen soru bulundu: "${tq}"`);
  }
}
assert(logOverlapCount === 0, "Logistics soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

let accOverlapCount = 0;
for (const tq of trsQuestionTexts) {
  if (accQuestionTexts.includes(tq)) {
    accOverlapCount++;
    console.error(`Accounting ile birebir örtüşen soru bulundu: "${tq}"`);
  }
}
assert(accOverlapCount === 0, "Accounting soru paketi ile sıfır birebir mükerrer soru (0 overlap)");

// ─── TEST 10: Custom Questions Adapter Compatibility ─────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQuestion = {
  id: "cq_trs_001",
  analysis_project_id: "p1",
  business_function_code: "TREASURY",
  process_name: "Banka Hareketleri ve Ekstre Entegrasyonu",
  question_text: "Yurt dışı bankalarımızdan SWIFT MT940 ekstreleri SWIFT Alliance Gateway üzerinden mi alınıyor?",
  description: "Yabancı iştirak banka hesapları entegrasyonu için.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_trs_001", value: "swift_alliance_otomatik", label: "Evet, SWIFT Alliance entegrasyonu ile merkezi SFTP'ye akar", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_trs_001", value: "yerel_portal_manuel", label: "Yurt dışı banka portalından Excel olarak indirilir", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_trs_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQuestion, 43);
assert(adaptedQuestion.id === "cq_trs_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Banka Hareketleri ve Ekstre Entegrasyonu", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ─────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions[0];
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "cok_sayida_banka_standart_kodlama_ve_iban_bazli_tanim", note: "8 farklı bankada toplam 32 aktif hesap mevcuttur." }],
  general_note: "Hazine yöneticisi tarafından merkezi yönetilmektedir.",
});
assert(
  formattedQ1.summaryText.includes("5 ve üzeri banka ile çalışılmaktadır; tüm hesaplar IBAN, şube, döviz cinsi ve hesap türüne göre merkezi standart kodlama ile yönetilir"),
  "Kullanıcı dostu label formatlandı (cok_sayida_banka... enum'u sızmadı)"
);
assert(formattedQ1.summaryText.includes("8 farklı bankada toplam 32 aktif hesap mevcuttur."), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Hazine yöneticisi tarafından merkezi yönetilmektedir."), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with Treasury Data ===");
const mockTrsReportModel: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "Hazine, Kasa ve Banka Keşif Analizi",
    companyName: "Marmara Hazine ve Finansal Hizmetler A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: {
      TREASURY: "tr.treasury.core v0.1.0",
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
    companyName: "Marmara Hazine ve Finansal Hizmetler A.Ş.",
    tradeName: "Marmara Finans",
    taxNumber: "9876543210",
    city: "İstanbul",
    country: "Türkiye",
    employeeCount: "450",
    notes: "Kasa, banka, nakit akış tahmini ve kredi limitleri analizi tamamlandı.",
  },
  profile: {
    analysis_project_id: "p_faz16",
    executive_summary: "Banka API entegrasyonu, nakit pozisyonu kokpiti, toplu ödeme ve çek portföyü incelendi.",
    overall_assessment: "Host-to-host banka bağlantısı ve 4-eyes ödeme onay matrisi ERP'ye entegre edilecektir.",
    open_topics: "DBS bayi limitleri ve Sanal POS komisyon ayrıştırma kuralları netleştirilecek.",
  },
  scope: [
    {
      code: "TREASURY",
      nameTr: "Kasa ve Banka",
      nameEn: "Cash & Bank Management",
      category: "Muhasebe & Finans",
      departmentName: "Hazine ve Finans Direktörlüğü",
      responsiblePerson: "Merve Kaya",
      status: "completed",
      hasPack: true,
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
    },
  ],
  businessFunctions: [
    {
      code: "TREASURY",
      nameTr: "Kasa ve Banka",
      nameEn: "Cash & Bank Management",
      category: "Muhasebe & Finans",
      sortOrder: 8,
      departmentName: "Hazine ve Finans Direktörlüğü",
      responsiblePerson: "Merve Kaya",
      status: "completed",
      packId: "tr.treasury.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 22,
      totalQuestionCount: 22,
      processes: [
        {
          name: "Banka Hesapları ve Organizasyonu",
          order: 1,
          questions: [
            {
              id: "TRS-001",
              order: 1,
              process: "Banka Hesapları ve Organizasyonu",
              questionText: "Kaç farklı banka ile çalışılmaktadır ve banka hesaplarının (Vadesiz TL/Döviz, Vadeli, POS, Kredi) ERP içindeki tanımlama ve kodlama standardı nasıldır?",
              answerType: "single_choice",
              criticality: "critical",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "cok_sayida_banka_standart_kodlama_ve_iban_bazli_tanim",
                    label: "5 ve üzeri banka ile çalışılmaktadır; tüm hesaplar IBAN, şube, döviz cinsi ve hesap türüne göre merkezi standart kodlama ile yönetilir",
                    isOther: false,
                    note: "8 farklı bankada toplam 32 aktif hesap mevcuttur.",
                  },
                ],
                summaryText: "• 5 ve üzeri banka ile çalışılmaktadır; tüm hesaplar IBAN, şube, döviz cinsi ve hesap türüne göre merkezi standart kodlama ile yönetilir",
              },
              findings: [
                {
                  id: "f_trs_01",
                  title: "Manuel Banka Bakiye Takibi Riski",
                  description: "Bankaların internet şubelerinden manuel bakiye kontrolü yapılması anlık nakit pozisyonunun görülmesini geciktirmektedir.",
                  priority: "high",
                  status: "open",
                  questionId: "TRS-001",
                  createdAt: "2026-08-20",
                },
              ],
              requirements: [
                {
                  id: "req_trs_01",
                  title: "Merkezi Hazine Kokpiti ve Açık Bankacılık Entegrasyonu",
                  description: "Tüm banka hesap bakiyelerinin Open Banking API ile ERP üzerinde tek ekrandan anlık konsolide izlenmesi sağlanmalıdır.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "TRS-001",
                  createdAt: "2026-08-20",
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
          id: "f_trs_01",
          title: "Manuel Banka Bakiye Takibi Riski",
          description: "Bankaların internet şubelerinden manuel bakiye kontrolü yapılması anlık nakit pozisyonunun görülmesini geciktirmektedir.",
          priority: "high",
          status: "open",
          questionId: "TRS-001",
          createdAt: "2026-08-20",
        },
      ],
      requirements: [
        {
          id: "req_trs_01",
          title: "Merkezi Hazine Kokpiti ve Açık Bankacılık Entegrasyonu",
          description: "Tüm banka hesap bakiyelerinin Open Banking API ile ERP üzerinde tek ekrandan anlık konsolide izlenmesi sağlanmalıdır.",
          priority: "critical",
          status: "confirmed",
          questionId: "TRS-001",
          createdAt: "2026-08-20",
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
const docxBuffer = await buildDocxBuffer(mockTrsReportModel);
assert(docxBuffer.length > 5000, `DOCX üretimi başarılı (${docxBuffer.length} byte)`);

// PDF Testi
const pdfBuffer = await buildPdfBuffer(mockTrsReportModel);
assert(pdfBuffer.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuffer.length} byte)`);

// PDF Text Extraction & Türkçe Karakter Kontrolü
const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;
const normalizedPdfText = pdfText.replace(/\s+/g, " ");
assert(pdfText.includes("Kasa ve Banka"), "PDF çıktısında 'Kasa ve Banka' başlığı mevcut");
assert(pdfText.includes("Marmara Hazine ve Finansal Hizmetler A.Ş."), "PDF çıktısında firma adı mevcut");
assert(normalizedPdfText.includes("Merkezi Hazine Kokpiti ve Açık Bankacılık Entegrasyonu"), "PDF çıktısında Türkçe gereksinim metni mevcut");
assert(mockTrsReportModel.metadata.packVersions.TREASURY === "tr.treasury.core v0.1.0", "ReportModel metadata'da soru paketi izlenebilirlik bilgisi mevcut");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const mappedPackId = getPackIdForFunction("TREASURY");
assert(mappedPackId === "tr.treasury.core", `getPackIdForFunction("TREASURY") -> tr.treasury.core`);

console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-16 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  process.exit(1);
}
