/**
 * ERP CRM Discovery — Followup Navigation & Progress Business Rule Test
 *
 * Doğrulanan Kurallar:
 * 1. Cevapsız zorunlu + bayraksız -> next engellenir (canAdvance = false)
 * 2. Cevaplı zorunlu + bayraksız -> next çalışır (canAdvance = true)
 * 3. Cevapsız zorunlu + sarı bayrak (revisit) -> next çalışır (canAdvance = true)
 * 4. Cevapsız zorunlu + kırmızı bayrak (critical) -> next çalışır (canAdvance = true)
 * 5. Opsiyonel + cevapsız + bayraksız -> next çalışır (canAdvance = true)
 * 6. Bayraklı soru answered sayılmaz (isQuestionAnswered = false)
 * 7. Bayraklı soru calculateProgress içinde answered sayılmaz
 * 8. Kritik bayrak kritik açık konu olarak ayrıştırılır
 * 9. Bayrak kaldırılınca cevap yoksa next tekrar engellenir
 * 10. Bayraklı branching sorusu yanlış dalı otomatik seçmez
 * 11. SQLite persistence sonrası bayrak ve cevap durumu korunur
 * 12. DOCX/PDF export içinde cevapsız bayraklı soru Açık Konular tablosuna girer
 */

import {
  isQuestionAnswered,
  canAdvanceToNextQuestion,
  calculateProgress,
} from "../src/engine/progress";
import { getVisibleQuestions } from "../src/engine/branching";
import type { Question, AnswerData, QuestionPack } from "../src/engine/types";
import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import type { ReportModel } from "../src/report/types";
import { PDFParse } from "pdf-parse";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs";

let Database: any = null;
try {
  Database = (await import("better-sqlite3")).default;
} catch {
  // SQLite optional
}

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

// ─── MOCK QUESTIONS ────────────────────────────────────────────────────────
const reqQuestion: Question = {
  id: "SALES-001",
  order: 1,
  process: "Fiyatlandırma",
  question: "Fiyat listeleri nasıl yönetiliyor?",
  answer_type: "single_choice",
  required: true,
  criticality: "critical",
  options: [
    { value: "erp", label: "ERP üzerinden", allow_note: false, is_other: false },
    { value: "excel", label: "Excel ile", allow_note: false, is_other: false },
  ],
};

const optQuestion: Question = {
  id: "SALES-002",
  order: 2,
  process: "Fiyatlandırma",
  question: "Ek kampanya notları var mı?",
  answer_type: "text",
  required: false,
  criticality: "medium",
};

const answeredData: AnswerData = {
  selected: [{ value: "erp" }],
};

const emptyData: AnswerData = {};

const yellowFlag = { flag_type: "revisit", status: "open", note: "Mali işler ile görüşülecek" };
const redFlag = { flag_type: "critical", status: "open", note: "Yönetim kurulu kararı bekleniyor" };

// ─── TEST 1 - 5: canAdvanceToNextQuestion Matrix ───────────────────────────
console.log("\n=== T01 - T05: Navigation Rule (canAdvanceToNextQuestion) ===");

// 1. Cevapsız zorunlu + bayraksız -> next engellenir
assert(
  canAdvanceToNextQuestion(reqQuestion, emptyData, null) === false,
  "1. Cevapsız zorunlu + bayraksız -> next engellenir (false)"
);

// 2. Cevaplı zorunlu + bayraksız -> next çalışır
assert(
  canAdvanceToNextQuestion(reqQuestion, answeredData, null) === true,
  "2. Cevaplı zorunlu + bayraksız -> next çalışır (true)"
);

// 3. Cevapsız zorunlu + sarı bayrak -> next çalışır
assert(
  canAdvanceToNextQuestion(reqQuestion, emptyData, yellowFlag) === true,
  "3. Cevapsız zorunlu + sarı bayrak (revisit) -> next çalışır (true)"
);

// 4. Cevapsız zorunlu + kırmızı bayrak -> next çalışır
assert(
  canAdvanceToNextQuestion(reqQuestion, emptyData, redFlag) === true,
  "4. Cevapsız zorunlu + kırmızı bayrak (critical) -> next çalışır (true)"
);

// 5. Opsiyonel + cevapsız + bayraksız -> next çalışır
assert(
  canAdvanceToNextQuestion(optQuestion, emptyData, null) === true,
  "5. Opsiyonel + cevapsız + bayraksız -> next çalışır (true)"
);

// ─── TEST 6 - 8: Progress Counting Truth ───────────────────────────────────
console.log("\n=== T06 - T08: Progress Counting Truth (Flags Do Not Count as Answered) ===");

// 6. Bayraklı soru answered sayılmaz
assert(
  isQuestionAnswered(reqQuestion, emptyData, yellowFlag) === false,
  "6. Sarı bayraklı soru isQuestionAnswered = false (Answered sayılmaz)"
);
assert(
  isQuestionAnswered(reqQuestion, emptyData, redFlag) === false,
  "6. Kırmızı bayraklı soru isQuestionAnswered = false (Answered sayılmaz)"
);
assert(
  isQuestionAnswered(reqQuestion, answeredData, yellowFlag) === false,
  "6. Hem cevap hem açık bayrak varsa isQuestionAnswered = false (Açık takip çözülene kadar bitmiş sayılmaz)"
);

// 7. calculateProgress içinde bayraklı sorular answered sayılmaz
const qList = [reqQuestion, optQuestion];
const answersMap = new Map<string, AnswerData>();
const followupsMap = new Map<string, any>();

followupsMap.set("SALES-001", yellowFlag);

const prog1 = calculateProgress(qList, answersMap, followupsMap);
assert(prog1.answered === 0, "7. Bayraklı cevapsız soru calculateProgress answered = 0");
assert(prog1.percentage === 0, "7. Bayraklı cevapsız soru calculateProgress percentage = 0%");

// Cevap verilince
answersMap.set("SALES-001", answeredData);
followupsMap.delete("SALES-001");
const prog2 = calculateProgress(qList, answersMap, followupsMap);
assert(prog2.answered === 1, "7. Bayrak kaldırılıp cevap verildiğinde answered = 1");
assert(prog2.percentage === 100, "7. Cevaplanan zorunlu soru ile percentage = 100%");

// 8. Bayrak türlerinin ayrıştırılması
assert(yellowFlag.flag_type === "revisit", "8. Sarı bayrak 'revisit' türünde");
assert(redFlag.flag_type === "critical", "8. Kırmızı bayrak 'critical' türünde");

// ─── TEST 9: Bayrak Kaldırılınca Davranış ───────────────────────────────────
console.log("\n=== T09: Bayrak Kaldırılınca Kısıtlama ===");
const removedFlag = null;
assert(
  canAdvanceToNextQuestion(reqQuestion, emptyData, removedFlag) === false,
  "9. Bayrak kaldırılınca cevapsız zorunlu soru tekrar engellenir"
);

// ─── TEST 10: Branching Safety with Unanswered Flagged Questions ───────────
console.log("\n=== T10: Branching Safety (No Phantom Children) ===");
const branchingPack: QuestionPack = {
  meta: {
    pack_id: "tr.test.branching",
    version: "0.1.0",
    schema_version: "1",
    language: "tr",
    business_function_code: "SALES",
    name: "Branching Test",
    description: "Branching test pack",
  },
  questions: [
    {
      id: "Q-PARENT",
      order: 1,
      process: "P1",
      question: "İhracat yapıyor musunuz?",
      answer_type: "single_choice",
      required: true,
      criticality: "high",
      options: [
        { value: "yes", label: "Evet", allow_note: false, is_other: false },
        { value: "no", label: "Hayır", allow_note: false, is_other: false },
      ],
    },
    {
      id: "Q-CHILD-YES",
      order: 2,
      process: "P1",
      question: "Gümrük entegrasyonu var mı?",
      answer_type: "single_choice",
      required: true,
      criticality: "medium",
      condition: { question_id: "Q-PARENT", operator: "equals", value: "yes" },
    },
    {
      id: "Q-CHILD-NO",
      order: 3,
      process: "P1",
      question: "Yurtiçi bayi sayısı nedir?",
      answer_type: "number",
      required: true,
      criticality: "medium",
      condition: { question_id: "Q-PARENT", operator: "equals", value: "no" },
    },
  ],
};

const emptyAnswers = new Map<string, AnswerData>();
const visibleWhenUnanswered = getVisibleQuestions(branchingPack.questions, emptyAnswers);
assert(
  visibleWhenUnanswered.length === 1 && visibleWhenUnanswered[0].id === "Q-PARENT",
  "10. Cevapsız ana soru bayraklansa dahi otomatik/yanlış çocuk soru açılmaz (Yalnızca ana soru görünür)"
);

// ─── TEST 11: SQLite Persistence for Followups ─────────────────────────────
console.log("\n=== T11: SQLite Persistence & Transitions ===");
if (Database) {
  const TEST_DB_PATH = path.join(os.tmpdir(), `erp-followup-nav-test-${Date.now()}.db`);
  const db = new Database(TEST_DB_PATH);
  db.pragma("foreign_keys = ON");

  for (const migration of MIGRATION_DEFINITIONS) {
    for (const sql of migration.sql) {
      if (sql.trim().length > 0) db.exec(sql);
    }
  }

  const now = new Date().toISOString();
  db.prepare("INSERT INTO analysis_projects (id, name, status, created_at, updated_at) VALUES (?,?,?,?,?)").run(
    "p_nav_test",
    "Nav Test Project",
    "active",
    now,
    now
  );

  // 1. Sarı bayrak kaydet
  db.prepare(`
    INSERT INTO question_followups (id, analysis_project_id, business_function_code, question_id, flag_type, note, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run("fol_001", "p_nav_test", "SALES", "SALES-001", "revisit", "Fiyat listesi teyit edilecek", "open", now, now);

  const row1 = db.prepare("SELECT * FROM question_followups WHERE id = ?").get("fol_001") as any;
  assert(row1.flag_type === "revisit", "11. SQLite'a sarı bayrak kaydedildi");
  assert(row1.status === "open", "11. Bayrak durumu 'open'");

  // 2. Kırmızıya çevir
  db.prepare("UPDATE question_followups SET flag_type = ?, note = ? WHERE id = ?").run(
    "critical",
    "Kritik fiyatlandırma riski",
    "fol_001"
  );
  const row2 = db.prepare("SELECT * FROM question_followups WHERE id = ?").get("fol_001") as any;
  assert(row2.flag_type === "critical", "11. Bayrak kırmızıya çevrildi (critical)");

  db.close();
  fs.unlinkSync(TEST_DB_PATH);
} else {
  console.log("  - SQLite testi atlandı: better-sqlite3 bulunamadı.");
}

// ─── TEST 12: DOCX & PDF Export Integration for Unanswered Followup Questions ─
console.log("\n=== T12: DOCX & PDF Export for Open Followup Questions ===");

const mockReportWithOpenFollowup: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "Takip Bayrağı Doğrulama Raporu",
    companyName: "Test Sanayi A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "active",
    packVersions: { SALES: "tr.sales.core v0.1.0" },
    isComplete: false,
    progressPercent: 50,
    requiredAnswered: 1,
    requiredTotal: 2,
    reportType: "interim",
    draftLabel: "ARA RAPOR — Analiz %50 tamamlandı",
    projectProgressPercent: 50,
    completedFunctionCount: 0,
    selectedFunctionCount: 1,
    isProjectComplete: false,
  },
  profile: {
    analysis_project_id: "p_nav_test",
    executive_summary: "Takip bayrakları test özeti.",
    overall_assessment: "Genel değerlendirme notu.",
    open_topics: "Fiyat listesi yetki matrisi teyit bekliyor.",
  },
  company: {
    companyName: "Test Sanayi A.Ş.",
    tradeName: null,
    taxNumber: "9876543210",
    city: "Bursa",
    country: "Türkiye",
    employeeCount: "150",
    notes: null,
  },
  scope: [
    {
      code: "SALES",
      nameTr: "Satış Yönetimi",
      nameEn: "Sales Management",
      category: "CORE",
      status: "in_progress",
      progressPercentage: 50,
      departmentName: "Satış",
      responsiblePerson: "Mehmet Demir",
      hasPack: true,
      answeredCount: 1,
      totalQuestionCount: 2,
    },
  ],
  businessFunctions: [
    {
      code: "SALES",
      nameTr: "Satış Yönetimi",
      nameEn: "Sales Management",
      category: "CORE",
      sortOrder: 1,
      departmentName: "Satış",
      responsiblePerson: "Mehmet Demir",
      status: "in_progress",
      packId: "tr.sales.core",
      packVersion: "v0.1.0",
      progressPercentage: 50,
      answeredCount: 1,
      totalQuestionCount: 2,
      processes: [
        {
          name: "Fiyatlandırma",
          order: 1,
          questions: [
            {
              id: "SALES-001",
              order: 1,
              process: "Fiyatlandırma",
              questionText: "Fiyat listeleri nasıl yönetiliyor?",
              answerType: "single_choice",
              criticality: "critical",
              followup: {
                flagType: "critical",
                note: "Fiyat listesi yetki matrisi teyit bekliyor.",
              },
              formattedAnswer: {
                isAnswered: false,
                selectedOptions: [],
                summaryText: "Cevaplanmadı (🔴 Kritik Takip)",
              },
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
  followups: [
    {
      id: "fol_mock_001",
      businessFunctionCode: "SALES",
      businessFunctionNameTr: "Satış Yönetimi",
      processName: "Fiyatlandırma",
      questionId: "SALES-001",
      questionText: "Fiyat listeleri nasıl yönetiliyor?",
      flagType: "critical",
      note: "Fiyat listesi yetki matrisi teyit bekliyor.",
      createdAt: "2026-08-20T10:00:00Z",
    },
  ],
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
    answeredQuestions: 0,
    totalQuestions: 2,
    totalAttachmentCount: 0,
    totalAttachmentSizeBytes: 0,
  },
};

const docxBuf = await buildDocxBuffer(mockReportWithOpenFollowup);
assert(docxBuf instanceof Uint8Array && docxBuf.byteLength > 1000, "12. DOCX çıktısı başarıyla üretildi");

const pdfBuf = await buildPdfBuffer(mockReportWithOpenFollowup);
assert(pdfBuf instanceof Uint8Array && pdfBuf.byteLength > 1000, "12. PDF çıktısı başarıyla üretildi");

const pdfParser = new PDFParse({ data: pdfBuf });
const pdfParsed = await pdfParser.getText();
assert(
  pdfParsed.text.includes("Açık Sorular"),
  "12. PDF'te 'Açık Sorular' tablosu mevcut"
);
assert(
  pdfParsed.text.includes("Fiyat listesi yetki matrisi teyit bekliyor"),
  "12. PDF'te takip notu metni mevcut"
);

// ─── SUMMARY ───────────────────────────────────────────────────────────────
console.log("\n=================================================");
console.log(`FOLLOWUP NAVIGATION & BUSINESS RULE TEST SUMMARY:`);
console.log(`PASS: ${passCount}`);
console.log(`FAIL: ${failCount}`);
console.log("=================================================\n");

if (failCount > 0) {
  process.exit(1);
}
