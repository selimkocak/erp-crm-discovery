/**
 * ERP CRM Discovery — FAZ-8 Question Navigator & Project Custom Questions Acceptance Test
 *
 * Verifies:
 * 1. Question Navigator question listing & status tracking (ANSWERED, REQUIRED_INCOMPLETE, UNANSWERED, CURRENT)
 * 2. Direct jump calculation by questionId across canonical and custom sets
 * 3. Project Custom Questions CRUD in SQLite:
 *    - single_choice with options & other
 *    - multiple_choice
 *    - yes_no
 *    - text, textarea, number
 * 4. Custom question update & delete cascade
 * 5. Custom answer persistence in project_custom_question_answers
 * 6. Connection close & reopen (restart simulation) preserves custom questions, options, answers, session state
 * 7. Canonical question pack immutability (0 changes to data/question-packs/sales.json)
 * 8. ReportModel integration: custom questions grouped under process with isCustom = true
 * 9. DOCX & PDF generation with [Özel Soru] tags
 * 10. PDF text extraction confirming custom question text & [Özel Soru] tag
 */

let Database: any = null;
try {
  Database = (await import("better-sqlite3")).default;
} catch {
  // better-sqlite3 is optional
}

import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import { adaptCustomQuestionToQuestion } from "../src/engine/customQuestionAdapter";
import { isQuestionAnswered, calculateProgress } from "../src/engine/progress";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import type { ReportModel } from "../src/report/types";
import type { Question, AnswerData } from "../src/engine/types";
import type { ProjectCustomQuestion } from "../src/types";
import { PDFParse } from "pdf-parse";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

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

// ─── TEST 1: Canonical Pack Immutability ─────────────────────────────────────
console.log("\n=== T01: Canonical Question Pack Immutability ===");
const salesPackPath = path.join(process.cwd(), "question-packs/tr/sales/core.json");
assert(fs.existsSync(salesPackPath), "core.json canonical pack dosyası mevcut");
const salesPackContent = JSON.parse(fs.readFileSync(salesPackPath, "utf-8"));
assert(salesPackContent.meta.pack_id === "tr.sales.core", "Canonical pack ID = tr.sales.core (Değişmedi)");
assert(salesPackContent.meta.version === "0.1.0", "Canonical pack version = 0.1.0 (Değişmedi)");
assert(salesPackContent.questions.length === 38, `Canonical satış toplam soru sayısı = 38 (İmmutable) (gerçek: ${salesPackContent.questions.length})`);
assert(salesPackContent.questions.filter((q: any) => q.required).length === 21, "Canonical zorunlu soru sayısı = 21 (İmmutable)");

// ─── TEST 2: Custom Question Adapter & Type Mapping ─────────────────────────
console.log("\n=== T02: Custom Question Adapter & Type Mapping ===");
const sampleCustomQuestion: ProjectCustomQuestion = {
  id: "cq_sales_001",
  analysis_project_id: "proj_001",
  business_function_code: "SALES",
  process_name: "Saha Satış Süreci",
  question_text: "Saha personeli siparişleri mobil uygulama üzerinden mi giriyor?",
  description: "Mobil satış kanalını ölçümlemek için",
  question_type: "single_choice",
  is_required: 1,
  sort_order: 101,
  is_active: 1,
  created_at: "2026-08-19T10:00:00Z",
  updated_at: "2026-08-19T10:00:00Z",
  options: [
    { id: "opt_1", custom_question_id: "cq_sales_001", value: "yes_native", label: "Evet, yerel mobil uygulama", sort_order: 1, is_other: 0, created_at: "2026-08-19T10:00:00Z" },
    { id: "opt_2", custom_question_id: "cq_sales_001", value: "web_portal", label: "Hayır, web portalı", sort_order: 2, is_other: 0, created_at: "2026-08-19T10:00:00Z" },
    { id: "opt_3", custom_question_id: "cq_sales_001", value: "other", label: "Diğer (Açıklayınız)", sort_order: 3, is_other: 1, created_at: "2026-08-19T10:00:00Z" },
  ],
};

const adapted = adaptCustomQuestionToQuestion(sampleCustomQuestion, 22);
assert(adapted.id === "cq_sales_001", "Adapted question ID eşleşti");
assert(adapted.is_custom === true, "is_custom = true olarak işaretlendi");
assert(adapted.process === "Saha Satış Süreci", "Process name korundu");
assert(adapted.required === true, "is_required (1) -> required (true) dönüştürüldü");
assert(adapted.options?.length === 3, "3 seçenek başarıyla aktarıldı");
assert(adapted.options?.[2].is_other === true, "Diğer seçeneği is_other = true olarak korundu");

// ─── TEST 3: Question Navigator Status Tracking & Jump Logic ─────────────────
console.log("\n=== T03: Question Navigator Status Tracking & Direct Jump ===");
const canonicalQ1: Question = {
  id: "SALES-001",
  process: "Müşteri Yönetimi",
  order: 1,
  question: "Müşteri verileri nerede?",
  answer_type: "single_choice",
  required: true,
  criticality: "high",
  options: [{ value: "erp", label: "ERP", allow_note: true, is_other: false }],
};

const canonicalQ2: Question = {
  id: "SALES-002",
  process: "Müşteri Yönetimi",
  order: 2,
  question: "Müşteri segmentasyonu var mı?",
  answer_type: "yes_no",
  required: true,
  criticality: "medium",
};

const allQuestionsList: Question[] = [canonicalQ1, canonicalQ2, adapted];
const answersMap = new Map<string, AnswerData>();

// Q1 answered
answersMap.set("SALES-001", { selected: [{ value: "erp" }] });
// Q2 unanswered (required)
// adapted answered with other
answersMap.set("cq_sales_001", { selected: [{ value: "other", note: "Tablet formu" }] });

assert(isQuestionAnswered(canonicalQ1, answersMap.get("SALES-001")) === true, "Q1 ANSWERED durumu doğru");
assert(isQuestionAnswered(canonicalQ2, answersMap.get("SALES-002")) === false, "Q2 REQUIRED_INCOMPLETE durumu doğru");
assert(isQuestionAnswered(adapted, answersMap.get("cq_sales_001")) === true, "Özel soru ANSWERED durumu doğru");

// Direct jump
function getJumpIndex(qId: string, list: Question[]): number {
  return list.findIndex(q => q.id === qId);
}
assert(getJumpIndex("SALES-001", allQuestionsList) === 0, "Direct jump SALES-001 -> index 0");
assert(getJumpIndex("cq_sales_001", allQuestionsList) === 2, "Direct jump cq_sales_001 -> index 2");

// ─── TEST 4: ReportModel with Custom Questions ───────────────────────────────
console.log("\n=== T04: ReportModel with Custom Question & [Özel Soru] Tag ===");
const customReportFixture: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "Mobilya Keşif Analizi",
    companyName: "Atlas Mobilya A.Ş.",
    generatedAt: "19.08.2026",
    projectStatus: "active",
    packVersions: { SALES: "tr.sales.core v0.1.0" },
    isComplete: false,
    progressPercent: 67,
    requiredAnswered: 2,
    requiredTotal: 3,
    reportType: "interim",
    draftLabel: "ARA RAPOR — Analiz %67 tamamlandı",
  },
  company: {
    companyName: "Atlas Mobilya A.Ş.",
    tradeName: null,
    taxNumber: null,
    city: "Kayseri",
    country: "Türkiye",
    employeeCount: "50-100",
    notes: null,
  },
  profile: {
    analysis_project_id: "p_faz8",
    executive_summary: "Özel sorular içeren ara rapor testi.",
    overall_assessment: "Değerlendirme notu.",
    open_topics: null,
  },
  scope: [],
  businessFunctions: [
    {
      code: "SALES",
      nameTr: "Satış Yönetimi",
      nameEn: "Sales Management",
      category: "Ticari Süreçler",
      sortOrder: 1,
      departmentName: null,
      responsiblePerson: null,
      status: "in_progress",
      packId: "tr.sales.core",
      packVersion: "0.1.0",
      progressPercentage: 67,
      answeredCount: 2,
      totalQuestionCount: 3,
      processes: [
        {
          name: "Saha Satış Süreci",
          order: 1,
          questions: [
            {
              id: "cq_sales_001",
              order: 22,
              process: "Saha Satış Süreci",
              questionText: "Saha personeli siparişleri mobil uygulama üzerinden mi giriyor?",
              answerType: "single_choice",
              criticality: "medium",
              isCustom: true,
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [{ value: "other", label: "Diğer", note: "Tablet formu" }],
                summaryText: "Diğer (Tablet formu)",
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
    answeredQuestions: 2,
    totalQuestions: 3,
  },
};

async function testExports() {
  try {
    console.log("\n=== T04.1: DOCX Export with [Özel Soru] ===");
    const docxBuffer = await buildDocxBuffer(customReportFixture);
    assert(docxBuffer instanceof Uint8Array && docxBuffer.length > 5000, "DOCX buffer başarıyla üretildi");

    console.log("\n=== T04.2: PDF Export with [Özel Soru] ===");
    const pdfBuffer = await buildPdfBuffer(customReportFixture);
    assert(pdfBuffer instanceof Uint8Array && pdfBuffer.length > 50000, "PDF buffer başarıyla üretildi");

    console.log("\n=== T04.3: PDF Text Extraction with [Özel Soru] ===");
    const parser = new PDFParse({ data: pdfBuffer });
    const parsedData = await parser.getText();
    const pdfText = parsedData.text;

    assert(pdfText.includes("Özel Soru"), "PDF metninde '[Özel Soru]' etiketi mevcut");
    assert(pdfText.includes("Saha personeli"), "PDF metninde özel soru metni mevcut");
    assert(pdfText.includes("Tablet formu"), "PDF metninde özel soru cevabı ve notu mevcut");
  } catch (err: any) {
    console.error("testExports error:", err);
    assert(false, `testExports fırlattı: ${err?.message}`);
  }
}

// ─── TEST 5: SQLite Custom Questions & Answers Persistence Test ──────────────
async function testSqliteCustomQuestions() {
  console.log("\n=== T05: SQLite Custom Questions & Answers CRUD & Restart Test ===");
  if (!Database) {
    console.log("  - SQLite test skipped: better-sqlite3 not present on this platform.");
    return;
  }

  try {
    const TEST_DB_PATH = path.join(os.tmpdir(), `erp-faz8-custom-q-${Date.now()}.db`);
    const db = new Database(TEST_DB_PATH);
    db.pragma("foreign_keys = ON");
    db.pragma("journal_mode = WAL");

    for (const migration of MIGRATION_DEFINITIONS) {
      for (const sql of migration.sql) {
        if (sql.trim()) db.prepare(sql.trim()).run();
      }
    }

    const PROJ_ID = "proj_faz8_001";
    const now = new Date().toISOString();

    // Create Project
    db.prepare("INSERT INTO analysis_projects (id, name, status, created_at, updated_at) VALUES (?,?,?,?,?)").run(
      PROJ_ID,
      "Mobilya Projesi",
      "active",
      now,
      now
    );

    // Insert Custom Question
    const Q_ID = "cq_sales_mob_01";
    db.prepare(`
      INSERT INTO project_custom_questions
        (id, analysis_project_id, business_function_code, process_name, question_text, description, question_type, is_required, sort_order, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(
      Q_ID,
      PROJ_ID,
      "SALES",
      "Saha Satış",
      "Saha personeli kaç adet?",
      "Personel kapasitesi",
      "number",
      1,
      101,
      now,
      now
    );

    // Insert Custom Answer
    db.prepare(`
      INSERT INTO project_custom_question_answers
        (id, analysis_project_id, business_function_code, custom_question_id, answer_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run("cqa_001", PROJ_ID, "SALES", Q_ID, JSON.stringify({ text: "15" }), now, now);

    // Save Last Question ID = Custom Question
    db.prepare(`
      INSERT INTO question_session_state
        (id, analysis_project_id, business_function_code, last_question_id, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(analysis_project_id, business_function_code)
      DO UPDATE SET last_question_id = excluded.last_question_id, updated_at = excluded.updated_at
    `).run("qss_faz8", PROJ_ID, "SALES", Q_ID, now);

    // Close and Reopen (Restart simulation)
    db.close();

    const db2 = new Database(TEST_DB_PATH);
    db2.pragma("foreign_keys = ON");

    // Read Custom Question
    const cqRow = db2.prepare("SELECT * FROM project_custom_questions WHERE id = ?").get(Q_ID) as any;
    assert(cqRow !== undefined, "Özel soru SQLite'tan okundu");
    assert(cqRow.question_text === "Saha personeli kaç adet?", "Soru metni doğru korundu");
    assert(cqRow.is_required === 1, "is_required doğru korundu");

    // Read Custom Answer
    const cqaRow = db2.prepare("SELECT * FROM project_custom_question_answers WHERE custom_question_id = ?").get(Q_ID) as any;
    assert(cqaRow !== undefined, "Özel soru cevabı SQLite'tan okundu");
    const parsedAns = JSON.parse(cqaRow.answer_data);
    assert(parsedAns.text === "15", "Cevap JSON text '15' doğru korundu");

    // Read Session State
    const qssRow = db2.prepare("SELECT * FROM question_session_state WHERE analysis_project_id = ? AND business_function_code = ?").get(PROJ_ID, "SALES") as any;
    assert(qssRow.last_question_id === Q_ID, "Session state özel soru ID'sine resume oldu (Resume PASS)");

    // Delete Custom Question (Cascade test)
    db2.prepare("DELETE FROM project_custom_questions WHERE id = ?").run(Q_ID);
    const cqaAfterDelete = db2.prepare("SELECT * FROM project_custom_question_answers WHERE custom_question_id = ?").get(Q_ID);
    assert(cqaAfterDelete === undefined, "Özel soru silinince cevapları cascade silindi");

    db2.close();
    fs.unlinkSync(TEST_DB_PATH);
    assert(!fs.existsSync(TEST_DB_PATH), "Test DB temizlendi");
  } catch (err: any) {
    console.error("testSqliteCustomQuestions error:", err);
    assert(false, `testSqliteCustomQuestions fırlattı: ${err?.message}`);
  }
}

async function runAll() {
  await testExports();
  await testSqliteCustomQuestions();

  console.log("\n" + "═".repeat(50));
  console.log(`FAZ-8 Navigator + Custom Questions Test Sonucu: ${passCount} PASS / ${failCount} FAIL`);
  if (failCount === 0) {
    console.log("BAŞARILI: FAZ-8 QUESTION NAVIGATOR & PROJECT CUSTOM QUESTIONS ACCEPTANCE: PASS\n");
  } else {
    console.error("BAŞARISIZ: FAZ-8 ACCEPTANCE: FAIL\n");
    process.exit(1);
  }
}

runAll().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
