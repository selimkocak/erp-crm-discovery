/**
 * ERP CRM Discovery — FAZ-62A SAHA VERİ TOPLAMA VE ENDÜSTRİYEL VERİ KEŞFİ (OT_INDUSTRIAL_DATA)
 *
 * Test Kapsamı:
 * T01: Pack Loading & Metadata Integrity (tr.ot_industrial_data.core v0.1.0, canonical code = OT_INDUSTRIAL_DATA)
 * T02: Validator Engine Check (0 schema errors, CANONICAL_BUSINESS_FUNCTION_CODE_SET validation)
 * T03: Question Quantity & Deterministic Order (58 questions, sequential order 1..58, OTD-001..OTD-058)
 * T04: Required & Optional Question Count Truth (39 required, 19 optional)
 * T05: Choice Options Integrity (unique option values, is_other: true -> allow_note: true, max 1 is_other)
 * T06: Exact 18 Mandatory Sections & 100% Process Coverage
 * T07: Purpose-Driven Architecture (Business Goal -> Decision -> Action -> Measurement -> Target System)
 * T08: Specific Branching Points & Conditional Resolution
 * T09: Progress Calculation Compatibility (honest required calculation & follow-up deduction)
 * T10: Cross-Pack Duplication Audit (0 duplicate questions across existing modules)
 * T11: Custom Questions Adapter Compatibility
 * T12: ReportModel & Formatters Truth (human-readable labels, zero raw technical enum leakage)
 * T13: DOCX Binary Generation Compatibility
 * T14: Liberation Sans TrueType Unicode PDF Export & Turkish Character Verification
 * T15: Loader Registry Mapping Parity (getPackIdForFunction("OT_INDUSTRIAL_DATA") === "tr.ot_industrial_data.core" + aliases)
 * T16: OT_INDUSTRIAL_DATA Cross-Pack Boundary Isolation Checks
 * T17: Critical Architectural Rules Check (PLC tags not first, ERP not historian, safety boundary)
 * T18: AI-Free, Zero Cloud, Offline-First Doğrulaması
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import path from "path";
import { validateQuestionPack } from "../src/engine/validator";
import { getVisibleQuestions, isQuestionVisible } from "../src/engine/branching";
import { calculateProgress } from "../src/engine/progress";
import { adaptCustomQuestionToQuestion } from "../src/engine/customQuestionAdapter";
import { formatAnswer } from "../src/report/formatters";
import { getPackIdForFunction, loadQuestionPack, hasQuestionPack, getPackStatus } from "../src/engine/loader";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import { PDFParse } from "pdf-parse";
import type { QuestionPack, Question, AnswerData } from "../src/engine/types";
import type { ReportModel } from "../src/report/types";

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
const PACK_PATH = path.join(ROOT_DIR, "question-packs/tr/ot_industrial_data/core.json");

console.log("══════════════════════════════════════════════════════");
console.log("FAZ-62A: SAHA VERİ TOPLAMA VE ENDÜSTRİYEL VERİ (OT/IT) TEST");
console.log("══════════════════════════════════════════════════════\n");

async function runTests(): Promise<void> {
  // ─── TEST 1: Pack Loading & Metadata Integrity ──────────────────────────────
  console.log("=== T01: Pack Loading & Metadata Integrity ===");
  assert(existsSync(PACK_PATH), `Soru paketi dosyası mevcut: ${PACK_PATH}`);

  const rawJson = readFileSync(PACK_PATH, "utf-8");
  const pack = JSON.parse(rawJson) as QuestionPack;

  assert(pack.meta.pack_id === "tr.ot_industrial_data.core", "pack_id = tr.ot_industrial_data.core");
  assert(pack.meta.version === "0.1.0", "version = 0.1.0");
  assert(pack.meta.language === "tr", "language = tr");
  assert(pack.meta.business_function_code === "OT_INDUSTRIAL_DATA", "business_function_code = OT_INDUSTRIAL_DATA (Kanonik Kod)");
  assert(pack.meta.name === "Saha Veri Toplama ve Endüstriyel Veri Keşfi Ön Analizi", "name tanımlı ve doğru");
  assert(typeof pack.meta.description === "string" && pack.meta.description.length > 50, "description tanımlı ve yeterli uzunlukta");

  // ─── TEST 2: Validator Engine Check ─────────────────────────────────────────
  console.log("\n=== T02: Validator Engine Check ===");
  const validation = validateQuestionPack(pack);
  if (!validation.valid) {
    console.error("Doğrulama hataları:", (validation as any).errors);
  }
  assert(validation.valid, "validateQuestionPack(otPack) 0 hata ile geçerli döndü");

  // ─── TEST 3: Question Quantity & IDs ────────────────────────────────────────
  console.log("\n=== T03: Question Quantity & IDs ===");
  assert(pack.questions.length === 58, `Toplam soru sayısı tam 58 adet (${pack.questions.length})`);

  const ids = pack.questions.map((q) => q.id);
  const uniqueIds = new Set(ids);
  assert(uniqueIds.size === 58, "Tüm 58 soru ID'si benzersizdir");

  let orderCorrect = true;
  for (let i = 0; i < pack.questions.length; i++) {
    const expectedId = `OTD-${String(i + 1).padStart(3, "0")}`;
    if (pack.questions[i].id !== expectedId || pack.questions[i].order !== i + 1) {
      orderCorrect = false;
      console.error(`Sıra hatası: Beklenen ${expectedId} (order: ${i + 1}), Bulunan ${pack.questions[i].id} (order: ${pack.questions[i].order})`);
    }
  }
  assert(orderCorrect, "Tüm sorular OTD-001'den OTD-058'e sıralı ve deterministiktir");

  // ─── TEST 4: Required Question Count ────────────────────────────────────────
  console.log("\n=== T04: Required Question Count ===");
  const requiredQuestions = pack.questions.filter((q) => q.required);
  const optionalQuestions = pack.questions.filter((q) => !q.required);
  assert(requiredQuestions.length === 39, `Tam 39 zorunlu soru mevcut (Bulunan: ${requiredQuestions.length})`);
  assert(optionalQuestions.length === 19, `Tam 19 opsiyonel soru mevcut (Bulunan: ${optionalQuestions.length})`);

  // ─── TEST 5: Choice Options Integrity ───────────────────────────────────────
  console.log("\n=== T05: Choice Options Integrity ===");
  let optionsValid = true;
  for (const q of pack.questions) {
    if (q.answer_type === "single_choice" || q.answer_type === "multiple_choice") {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        optionsValid = false;
        console.error(`Yetersiz seçenek: ${q.id}`);
      }
      const vals = new Set<string>();
      let otherCount = 0;
      for (const opt of q.options || []) {
        if (vals.has(opt.value)) {
          optionsValid = false;
          console.error(`Mükerrer seçenek değeri: ${q.id} -> ${opt.value}`);
        }
        vals.add(opt.value);
        if (opt.is_other) {
          otherCount++;
          if (!opt.allow_note) {
            optionsValid = false;
            console.error(`is_other true fakat allow_note false: ${q.id}`);
          }
        }
      }
      if (otherCount > 1) {
        optionsValid = false;
        console.error(`Birden fazla is_other: ${q.id}`);
      }
    }
  }
  assert(optionsValid, "Tüm seçenekler benzersiz ve is_other kurallarına tam uyumludur");

  // ─── TEST 6: 18 Mandatory Sections Coverage ─────────────────────────────────
  console.log("\n=== T06: 18 Mandatory Sections Coverage ===");
  const MANDATORY_SECTIONS = [
    "OT genel profil",
    "Fabrika, üretim alanı ve hat yapısı",
    "İstasyon profili",
    "Üretim amacı ve karar ihtiyacı",
    "Girdiler ve malzeme tüketimi",
    "Çıktılar, üretim miktarı ve fire",
    "Enerji",
    "Operatör ve manuel veri girişi",
    "Kalite ve laboratuvar cihazları",
    "Makine sağlığı ve bakım",
    "Alarm ve aksiyon",
    "İş güvenliği / safety sınırı",
    "PLC, controller ve sensör altyapısı",
    "Legacy makine ve retrofit seçenekleri",
    "Veri frekansı ve veri hacmi",
    "Edge, gateway ve network",
    "ERP/MES/QMS/CMMS/WMS entegrasyon ihtiyacı",
    "İş değeri ve önceliklendirme",
  ];

  const presentProcesses = new Set(pack.questions.map((q) => q.process));
  assert(presentProcesses.size === 18, `Tam 18 zorunlu bölüm tanımlıdır (Bulunan: ${presentProcesses.size})`);

  let allSectionsCovered = true;
  for (const sec of MANDATORY_SECTIONS) {
    if (!presentProcesses.has(sec)) {
      allSectionsCovered = false;
      console.error(`Eksik zorunlu bölüm: "${sec}"`);
    }
  }
  assert(allSectionsCovered, "18 zorunlu bölümün tamamı soru setinde eksiksiz kapsanmaktadır");

  // ─── TEST 7: Purpose-Driven Architecture ────────────────────────────────────
  console.log("\n=== T07: Purpose-Driven Architecture Flow ===");
  const firstQuestion = pack.questions[0];
  const secondQuestion = pack.questions[1];
  assert(!firstQuestion.question.includes("hangi tag"), "İlk soru 'hangi tag'ler var' DEĞİLDİR (İş hedefinden başlar)");
  assert(secondQuestion.question.includes("iş hedefiniz"), "İkinci soru iş hedefini doğrudan sorgular");

  // ─── TEST 8: Conditional Branching Engine Resolution ───────────────────────
  console.log("\n=== T08: Conditional Branching Engine Resolution ===");
  const branchingQuestions = pack.questions.filter((q) => q.condition);
  assert(branchingQuestions.length === 9, `Tam 9 adet koşullu dallanma sorusu mevcuttur (Bulunan: ${branchingQuestions.length})`);

  // Boş cevaplar ile görünürlük (koşullu sorular gizli olmalı)
  const emptyAnswers = new Map<string, AnswerData>();
  const initialVisible = getVisibleQuestions(pack.questions, emptyAnswers);
  assert(initialVisible.length === 49, `Başlangıçta 49 soru görünür (58 - 9 = 49, bulunan: ${initialVisible.length})`);

  // OTD-013 (Silo/tank) -> OTD-014 görünür olmalı
  const answersSilo = new Map<string, AnswerData>([
    ["OTD-013", { selected: [{ value: "silo_tank_seviye_ve_debi_sensorleri_ile_otomatik" }] }],
  ]);
  const visibleSilo = getVisibleQuestions(pack.questions, answersSilo);
  assert(visibleSilo.some((q) => q.id === "OTD-014"), "OTD-013=silo_tank... tetiklendiğinde OTD-014 görünür hale gelir");

  // OTD-016 (PLC sayaç) -> OTD-017 görünür olmalı
  const answersCounter = new Map<string, AnswerData>([
    ["OTD-016", { selected: [{ value: "plc_ve_sensor_uzerinden_otomatik_cevrim_sayaci" }] }],
  ]);
  const visibleCounter = getVisibleQuestions(pack.questions, answersCounter);
  assert(visibleCounter.some((q) => q.id === "OTD-017"), "OTD-016=plc_ve_sensor... tetiklendiğinde OTD-017 görünür hale gelir");

  // OTD-019 (Alt ölçüm) -> OTD-020 görünür olmalı
  const answersEnergy = new Map<string, AnswerData>([
    ["OTD-019", { selected: [{ value: "makine_ve_istasyon_bazinda_alt_olcum_submetering" }] }],
  ]);
  const visibleEnergy = getVisibleQuestions(pack.questions, answersEnergy);
  assert(visibleEnergy.some((q) => q.id === "OTD-020"), "OTD-019=makine_ve_istasyon... tetiklendiğinde OTD-020 görünür hale gelir");

  // OTD-025 (CMM/Kalite) -> OTD-026 görünür olmalı
  const answersQuality = new Map<string, AnswerData>([
    ["OTD-025", { selected: [{ value: "cmm_spektrometre_ve_dijital_test_cihazlari_aktif_kullanilir" }] }],
  ]);
  const visibleQuality = getVisibleQuestions(pack.questions, answersQuality);
  assert(visibleQuality.some((q) => q.id === "OTD-026"), "OTD-025=cmm_spektrometre... tetiklendiğinde OTD-026 görünür hale gelir");

  // OTD-028 (Bakım/Telemetri) -> OTD-029 görünür olmalı
  const answersMaint = new Map<string, AnswerData>([
    ["OTD-028", { selected: [{ value: "titresim_sicaklik_ve_akım_sensorleri_ile_anlik_telemetri" }] }],
  ]);
  const visibleMaint = getVisibleQuestions(pack.questions, answersMaint);
  assert(visibleMaint.some((q) => q.id === "OTD-029"), "OTD-028=titresim_sicaklik... tetiklendiğinde OTD-029 görünür hale gelir");

  // OTD-031 (ISA 18.2 Alarm) -> OTD-032 görünür olmalı
  const answersAlarm = new Map<string, AnswerData>([
    ["OTD-031", { selected: [{ value: "isa182_uyumlu_onceliklendirilmis_ve_filtrelenmis_alarm_hiyerarsisi" }] }],
  ]);
  const visibleAlarm = getVisibleQuestions(pack.questions, answersAlarm);
  assert(visibleAlarm.some((q) => q.id === "OTD-032"), "OTD-031=isa182... tetiklendiğinde OTD-032 görünür hale gelir");

  // OTD-034 (Safety) -> OTD-035 görünür olmalı
  const answersSafety = new Map<string, AnswerData>([
    ["OTD-034", { selected: [{ value: "safety_tamamen_donanimsal_bagimsizdir_yalnizca_durum_sinyali_okunur" }] }],
  ]);
  const visibleSafety = getVisibleQuestions(pack.questions, answersSafety);
  assert(visibleSafety.some((q) => q.id === "OTD-035"), "OTD-034=safety... tetiklendiğinde OTD-035 görünür hale gelir");

  // OTD-046 (DMZ) -> OTD-047 görünür olmalı
  const answersDmz = new Map<string, AnswerData>([
    ["OTD-046", { selected: [{ value: "guvenlik_duvari_dmz_ve_ayrik_vlan_mimarisi_kullanilmaktadir" }] }],
  ]);
  const visibleDmz = getVisibleQuestions(pack.questions, answersDmz);
  assert(visibleDmz.some((q) => q.id === "OTD-047"), "OTD-046=guvenlik_duvari... tetiklendiğinde OTD-047 görünür hale gelir");

  // OTD-050 (Dosya transferi) -> OTD-051 görünür olmalı
  const answersFile = new Map<string, AnswerData>([
    ["OTD-050", { selected: [{ value: "dosya_transferi_csv_excel_xml_ftp_klasor_izleme" }] }],
  ]);
  const visibleFile = getVisibleQuestions(pack.questions, answersFile);
  assert(visibleFile.some((q) => q.id === "OTD-051"), "OTD-050=dosya_transferi... tetiklendiğinde OTD-051 görünür hale gelir");

  // 9 koşulun tamamı tetiklendiğinde tüm 58 soru görünür olmalı
  const allTriggerAnswers = new Map<string, AnswerData>([
    ["OTD-013", { selected: [{ value: "silo_tank_seviye_ve_debi_sensorleri_ile_otomatik" }] }],
    ["OTD-016", { selected: [{ value: "plc_ve_sensor_uzerinden_otomatik_cevrim_sayaci" }] }],
    ["OTD-019", { selected: [{ value: "makine_ve_istasyon_bazinda_alt_olcum_submetering" }] }],
    ["OTD-025", { selected: [{ value: "cmm_spektrometre_ve_dijital_test_cihazlari_aktif_kullanilir" }] }],
    ["OTD-028", { selected: [{ value: "titresim_sicaklik_ve_akım_sensorleri_ile_anlik_telemetri" }] }],
    ["OTD-031", { selected: [{ value: "isa182_uyumlu_onceliklendirilmis_ve_filtrelenmis_alarm_hiyerarsisi" }] }],
    ["OTD-034", { selected: [{ value: "safety_tamamen_donanimsal_bagimsizdir_yalnizca_durum_sinyali_okunur" }] }],
    ["OTD-046", { selected: [{ value: "guvenlik_duvari_dmz_ve_ayrik_vlan_mimarisi_kullanilmaktadir" }] }],
    ["OTD-050", { selected: [{ value: "dosya_transferi_csv_excel_xml_ftp_klasor_izleme" }] }],
  ]);
  const allVisible = getVisibleQuestions(pack.questions, allTriggerAnswers);
  assert(allVisible.length === 58, `Tüm koşullar sağlandığında 58 sorunun tamamı görünürdür (${allVisible.length})`);

  // ─── TEST 9: Progress Calculation Compatibility ────────────────────────────
  console.log("\n=== T09: Progress Calculation Compatibility ===");
  const progEmpty = calculateProgress(pack.questions, emptyAnswers);
  assert(progEmpty.total === 39, "Boş durumda zorunlu soru sayısı = 39");
  assert(progEmpty.answered === 0, "Boş durumda cevaplanan soru = 0");
  assert(progEmpty.percentage === 0, "Boş durumda ilerleme %0");

  // 39 zorunlu sorunun 13 tanesini cevapla (13 / 39 = %33)
  const partialAnswers = new Map<string, AnswerData>();
  for (let i = 0; i < 13; i++) {
    partialAnswers.set(requiredQuestions[i].id, {
      selected: [{ value: requiredQuestions[i].options?.[0]?.value || "opt_1" }],
    });
  }
  const progPartial = calculateProgress(pack.questions, partialAnswers);
  assert(progPartial.answered === 13, `Cevaplanan zorunlu = 13 (Bulunan: ${progPartial.answered})`);
  assert(progPartial.total === 39, `Toplam zorunlu = 39 (Bulunan: ${progPartial.total})`);
  assert(progPartial.percentage === 33, `Kısmi cevaplamada ilerleme %33 (Bulunan: ${progPartial.percentage}%)`);

  // ─── TEST 10: Cross-Pack Duplication Audit ──────────────────────────────────
  console.log("\n=== T10: Cross-Pack Duplication Audit ===");
  const packsDir = path.join(ROOT_DIR, "question-packs");
  const otherPacks: QuestionPack[] = [];

  function scanPacks(dir: string): void {
    for (const item of readdirSync(dir)) {
      const full = path.join(dir, item);
      if (statSync(full).isDirectory()) {
        scanPacks(full);
      } else if (item === "core.json" && !full.includes("ot_industrial_data")) {
        otherPacks.push(JSON.parse(readFileSync(full, "utf-8")));
      }
    }
  }
  scanPacks(packsDir);
  assert(otherPacks.length >= 33, `Karşılaştırma için en az 33 diğer paket bulundu (${otherPacks.length})`);

  let duplicateFound = false;
  const currentTexts = new Set(pack.questions.map((q) => q.question.trim().toLowerCase()));
  for (const op of otherPacks) {
    for (const q of op.questions) {
      if (currentTexts.has(q.question.trim().toLowerCase())) {
        duplicateFound = true;
        console.error(`Birebir mükerrer soru bulundu! Paket: ${op.meta.pack_id}, Soru: ${q.id} -> "${q.question}"`);
      }
    }
  }
  assert(!duplicateFound, "Diğer tüm soru paketleriyle 0 birebir soru çakışması (Cross-Pack Isolation %100)");

  // ─── TEST 11: Custom Questions Adapter Compatibility ────────────────────────
  console.log("\n=== T11: Custom Questions Adapter Compatibility ===");
  const mockCustom = {
    id: "cust_ot_001",
    analysis_project_id: "prj_001",
    business_function_code: "OT_INDUSTRIAL_DATA",
    process_name: "Özel OT Keşif",
    question_text: "Saha verilerinde AI tabanlı anomali tespiti planlanıyor mu?",
    description: null,
    question_type: "single_choice" as const,
    is_required: 1,
    sort_order: 59,
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: [
      { id: "o1", custom_question_id: "cust_ot_001", value: "evet", label: "Evet", sort_order: 1, is_other: 0, created_at: "" },
      { id: "o2", custom_question_id: "cust_ot_001", value: "hayir", label: "Hayır", sort_order: 2, is_other: 0, created_at: "" },
    ],
  };
  const adapted = adaptCustomQuestionToQuestion(mockCustom as any, 59);
  assert(adapted.id === "cust_ot_001", "Özel soru başarıyla uyarlandı ve id korundu");
  assert(adapted.required === true, "is_required: 1 -> required: true");
  assert(adapted.options?.length === 2, "Seçenekler doğru aktarıldı");

  // ─── TEST 12: ReportModel & Formatters Truth ────────────────────────────────
  console.log("\n=== T12: ReportModel & Formatters Truth ===");
  const sampleQ = pack.questions[0]; // OTD-001
  const sampleAns: AnswerData = {
    selected: [{ value: "merkezi_scada_dcs_ve_izleme_ekranlari_aktif", note: "Tüm hatlar SCADA altında" }],
    text: "",
    general_note: "Saha incelemesinde SCADA ekranları doğrulandı.",
  };
  const formatted = formatAnswer(sampleQ, sampleAns);
  assert(formatted.isAnswered === true, "formatAnswer: isAnswered = true");
  assert(
    formatted.summaryText.includes("Tesis genelinde SCADA"),
    "Teknik enum yerine Türkçe kullanıcı etiketi çözümlendi"
  );
  assert(formatted.generalNote === "Saha incelemesinde SCADA ekranları doğrulandı.", "Kullanıcı notu korundu");

  // ─── TEST 13: DOCX Binary Generation Compatibility ──────────────────────────
  console.log("\n=== T13: DOCX Binary Generation Compatibility ===");
  const mockReport: ReportModel = {
    metadata: {
      title: "ERP / OT Endüstriyel Veri Keşif Raporu",
      projectName: "Saha OT Veri Keşif Pilotu",
      companyName: "Marmara Endüstriyel Sistemler A.Ş.",
      generatedAt: "24.08.2026",
      projectStatus: "in_progress",
      packVersions: { OT_INDUSTRIAL_DATA: "tr.ot_industrial_data.core v0.1.0" },
      isComplete: false,
      progressPercent: 2,
      requiredAnswered: 1,
      requiredTotal: 39,
      reportType: "interim",
      draftLabel: "ARA RAPOR — %2",
      projectProgressPercent: 2,
      completedFunctionCount: 0,
      selectedFunctionCount: 1,
      isProjectComplete: false,
    },
    company: {
      companyName: "Marmara Endüstriyel Sistemler A.Ş.",
      tradeName: "Marmara Endüstriyel",
      taxNumber: "1234567890",
      city: "Kocaeli",
      country: "Türkiye",
      employeeCount: "280",
      businessSector: "Makine ve Metal İmalatı",
      hasBranches: "no",
      branchCount: null,
      notes: "FAZ-62A OT kabul şirketi.",
    },
    profile: {
      analysis_project_id: "p_faz62a_ot",
      executive_summary: "Saha veri toplama ve OT/IT AS-IS analizi.",
      overall_assessment: "SCADA ve PLC altyapısı mevcuttur, ara katman ihtiyacı vardır.",
      open_topics: "",
    },
    scope: [
      {
        code: "OT_INDUSTRIAL_DATA",
        nameTr: "Saha Veri Toplama ve Endüstriyel Veri Keşfi",
        nameEn: "Field Data Collection & Industrial OT/IT",
        category: "Üretim",
        departmentName: "Otomasyon ve Üretim",
        responsiblePerson: "Otomasyon Müdürü",
        status: "in_progress",
        hasPack: true,
        progressPercentage: 2,
        answeredCount: 1,
        totalQuestionCount: 39,
      },
    ],
    businessFunctions: [
      {
        code: "OT_INDUSTRIAL_DATA",
        nameTr: "Saha Veri Toplama ve Endüstriyel Veri Keşfi",
        nameEn: "Field Data Collection & Industrial OT/IT",
        category: "Üretim",
        sortOrder: 34,
        departmentName: "Otomasyon ve Üretim",
        responsiblePerson: "Otomasyon Müdürü",
        status: "in_progress",
        packId: "tr.ot_industrial_data.core",
        packVersion: "0.1.0",
        progressPercentage: 2,
        answeredCount: 1,
        totalQuestionCount: 39,
        processes: [
          {
            name: "OT genel profil",
            order: 1,
            questions: [
              {
                id: "OTD-001",
                order: 1,
                process: "OT genel profil",
                questionText: sampleQ.question,
                answerType: "single_choice",
                criticality: "critical",
                formattedAnswer: formatted,
                findings: [],
                requirements: [],
                risks: [],
                notes: [],
              },
            ],
          },
        ],
        findings: [],
        requirements: [],
        risks: [],
        notes: [],
      },
    ],
    followups: [],
    scheduleSummary: {
      projectSchedule: {
        plannedStartDate: "2026-09-01",
        plannedEndDate: "2026-11-30",
        actualStartDate: "2026-09-01",
        actualEndDate: null,
        plannedRangeSummary: "01.09.2026 – 30.11.2026",
        actualRangeSummary: "01.09.2026 – Devam Ediyor",
        scheduleStatus: "on_track",
        scheduleStatusLabel: "Zamanında İlerliyor",
        scheduleStatusBadgeClass: "badge--on-track",
        delayDays: 0,
        remainingDays: 98,
        delaySummary: "98 gün kaldı",
      },
      functionSchedules: [
        {
          code: "OT_INDUSTRIAL_DATA",
          nameTr: "Saha Veri Toplama ve Endüstriyel Veri Keşfi",
          processStatus: "Devam Ediyor",
          plannedStartDate: "2026-09-01",
          plannedEndDate: "2026-11-30",
          actualStartDate: "2026-09-01",
          actualEndDate: null,
          plannedRangeSummary: "01.09.2026 – 30.11.2026",
          actualRangeSummary: "01.09.2026 – Devam Ediyor",
          scheduleStatus: "on_track",
          scheduleStatusLabel: "Zamanında İlerliyor",
          scheduleStatusBadgeClass: "badge--on-track",
          delayDays: 0,
          remainingDays: 98,
          delaySummary: "98 gün kaldı",
        },
      ],
      stats: {
        totalPlanned: 1,
        completedOnTime: 0,
        completedLate: 0,
        onTrack: 1,
        dueSoon: 0,
        overdue: 0,
        notStarted: 0,
        notPlanned: 0,
      },
    },
    globalFindings: [],
    globalRequirements: [],
    globalRisks: [],
    projectNotes: [],
    summaryStats: {
      totalFunctions: 1,
      activeFunctionCount: 1,
      completedFunctions: 0,
      completedFunctionCount: 0,
      inProgressFunctions: 1,
      inProgressFunctionCount: 1,
      notStartedFunctions: 0,
      notStartedFunctionCount: 0,
      totalFindings: 0,
      findingCount: 0,
      totalRequirements: 0,
      requirementCount: 0,
      openRisks: 0,
      openRiskCount: 0,
      totalRisks: 0,
      totalRiskCount: 0,
      totalNotes: 0,
      answeredQuestions: 1,
      answeredQuestionCount: 1,
      totalQuestions: 39,
      totalQuestionCount: 39,
      questionProgressPercent: 2,
      openFollowupCount: 0,
      criticalFollowupCount: 0,
      revisitCount: 0,
    },
  };

  const docxBuf = await buildDocxBuffer(mockReport);
  assert(docxBuf instanceof Uint8Array && docxBuf.length > 5000, `DOCX buffer başarıyla üretildi (${docxBuf.length} bayt)`);

  // ─── TEST 14: Liberation Sans TrueType Unicode PDF Export ───────────────────
  console.log("\n=== T14: Liberation Sans TrueType Unicode PDF Export ===");
  const pdfBuf = await buildPdfBuffer(mockReport);
  assert(pdfBuf instanceof Uint8Array && pdfBuf.length > 5000, `PDF buffer başarıyla üretildi (${pdfBuf.length} bayt)`);

  const parser = new PDFParse({ data: pdfBuf });
  const parsedPdf = await parser.getText();
  assert(parsedPdf.text.includes("Saha Veri Toplama") || parsedPdf.text.includes("OT_INDUSTRIAL_DATA"), "PDF metninde modül başlığı yer alıyor");
  assert(parsedPdf.text.includes("Marmara Endüstriyel"), "PDF metninde Türkçe şirket adı yer alıyor");

  // ─── TEST 15: Loader Registry Mapping Parity ────────────────────────────────
  console.log("\n=== T15: Loader Registry Mapping Parity ===");
  const packId = getPackIdForFunction("OT_INDUSTRIAL_DATA");
  assert(packId === "tr.ot_industrial_data.core", "getPackIdForFunction('OT_INDUSTRIAL_DATA') === 'tr.ot_industrial_data.core'");
  assert(getPackIdForFunction("OT_DATA") === "tr.ot_industrial_data.core", "OT_DATA alias -> tr.ot_industrial_data.core");
  assert(getPackIdForFunction("OT_DISCOVERY") === "tr.ot_industrial_data.core", "OT_DISCOVERY alias -> tr.ot_industrial_data.core");
  assert(getPackIdForFunction("ENDUSTRIYEL_VERI") === "tr.ot_industrial_data.core", "ENDUSTRIYEL_VERI alias -> tr.ot_industrial_data.core");
  assert(getPackIdForFunction("SAHA_VERI_TOPLAMA") === "tr.ot_industrial_data.core", "SAHA_VERI_TOPLAMA alias -> tr.ot_industrial_data.core");
  assert(hasQuestionPack("OT_INDUSTRIAL_DATA"), "hasQuestionPack('OT_INDUSTRIAL_DATA') === true");
  assert(getPackStatus("OT_INDUSTRIAL_DATA") === "available", "getPackStatus('OT_INDUSTRIAL_DATA') === 'available'");

  const loadedPackRes = await loadQuestionPack("tr.ot_industrial_data.core");
  assert(loadedPackRes.ok === true, "loadQuestionPack('tr.ot_industrial_data.core') ok === true");
  if (loadedPackRes.ok) {
    assert(loadedPackRes.pack.questions.length === 58, "Yüklenen soru paketi 58 soru içerir");
  }

  // ─── TEST 16: Cross-Pack Boundary Isolation Checks ──────────────────────────
  console.log("\n=== T16: Cross-Pack Boundary Isolation Checks ===");
  const boundaryPairs = [
    { target: "MAINTENANCE", targetDesc: "Mekanik bakım, iş emri, arıza kök nedeni ve periyodik bakım" },
    { target: "PRODUCTION_PLANNING", targetDesc: "Kapasite planlama, MPS, MRP ve çizelgeleme" },
    { target: "WORK_ORDERS", targetDesc: "İş emri operasyonları, teyit verme ve rota adımları" },
    { target: "QUALITY", targetDesc: "Giriş/proses/son muayene planları, red/hurda tutanakları" },
    { target: "IT_INFRASTRUCTURE", targetDesc: "Kurumsal sunucular, domain controller ve ofis IT altyapısı" },
  ];
  for (const b of boundaryPairs) {
    assert(hasQuestionPack(b.target), `İlişkili sınır modülü '${b.target}' külliyatta mevcut ve bağımsızdır`);
  }

  // ─── TEST 17: Critical Architectural Rules Check ────────────────────────────
  console.log("\n=== T17: Critical Architectural Rules Check ===");
  const q012 = pack.questions.find((q) => q.id === "OTD-012");
  assert(q012 !== undefined, "OTD-012 mevcut");
  assert(Boolean(q012?.options?.some((o) => o.value.includes("risk"))), "'Bütün verileri toplayalım' yaklaşımı risk olarak işaretli");

  const q034 = pack.questions.find((q) => q.id === "OTD-034");
  assert(q034 !== undefined, "OTD-034 (Safety sınırı) mevcut");
  assert(Boolean(q034?.options?.some((o) => o.value.includes("salt_okunur") || o.value.includes("bagimsizdir"))), "Safety bağımsızlığı ve salt-okunur durumu korunur");

  const q045 = pack.questions.find((q) => q.id === "OTD-045");
  assert(q045 !== undefined, "OTD-045 (Historian vs ERP) mevcut");
  assert(Boolean(q045?.options?.some((o) => o.value.includes("ayrik_historian"))), "ERP'nin historian olmadığı ayrık mimari olarak tanımlı");

  const q057 = pack.questions.find((q) => q.id === "OTD-057");
  assert(q057 !== undefined, "OTD-057 ('Bu veriye gerçekten ihtiyacınız var mı?') mevcut");

  // ─── TEST 18: AI-Free, Zero Cloud, Offline-First Doğrulaması ─────────────────
  console.log("\n=== T18: AI-Free, Zero Cloud, Offline-First Doğrulaması ===");
  const coreJsonText = readFileSync(PACK_PATH, "utf-8");
  assert(!coreJsonText.includes("openai"), "Paket JSON dosyasında 'openai' referansı YOK");
  assert(!coreJsonText.includes("gemini"), "Paket JSON dosyasında 'gemini' referansı YOK");
  assert(!coreJsonText.includes("http://"), "Paket JSON dosyasında güvensiz harici 'http://' bağlantısı YOK");
  assert(!coreJsonText.includes("https://"), "Paket JSON dosyasında harici 'https://' bağlantısı YOK");

  console.log(`\n══════════════════════════════════════════════════════`);
  console.log(`FAZ-62A Kabul Testi Tamamlandı: ${passCount} PASS, ${failCount} FAIL`);
  console.log(`══════════════════════════════════════════════════════\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test icra hatası:", err);
  process.exit(1);
});
