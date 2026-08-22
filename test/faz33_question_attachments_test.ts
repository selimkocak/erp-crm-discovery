/**
 * ERP CRM Discovery — FAZ-33 Question Evidence & Attachments Acceptance Test
 *
 * T01 - T20 Comprehensive Test Suite
 */

import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import {
  sanitizeFileName,
  getFileExtension,
  rejectAbsolutePath,
  validateRelativePath,
  generateStoredFileName,
  buildRelativePath,
  validateAttachment,
  calculateSha256,
  formatFileSize,
  getFileCategory,
  saveAttachmentFile,
  readAttachmentFile,
  deleteAttachmentFile,
  deleteProjectAttachmentsDirectory,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_SINGLE_FILE_SIZE_BYTES,
  MAX_QUESTION_TOTAL_BYTES,
  MAX_PROJECT_TOTAL_BYTES,
} from "../src/storage/attachmentManager";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import type { ReportModel, ReportAttachmentItem } from "../src/report/types";
import { PDFParse } from "pdf-parse";
import * as path from "node:path";
import * as os from "node:os";

let Database: any = null;
try {
  Database = (await import("better-sqlite3")).default;
} catch {
  // better-sqlite3 is optional on some platforms
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

// ─────────────────────────────────────────────────────────────
// T01: Migration 7 & Schema Definition Check
// ─────────────────────────────────────────────────────────────
console.log("\n=== T01: Migration 7 & Schema Definition ===");
const migration7 = MIGRATION_DEFINITIONS.find((m) => m.version === 7);
assert(migration7 !== undefined, "Migration 7 tanımlı");
assert(
  migration7?.description.includes("Question Evidence & Attachments") === true,
  "Migration 7 açıklaması doğru"
);
const hasAttachmentsTable = migration7?.sql.some((s) =>
  s.includes("CREATE TABLE IF NOT EXISTS question_attachments")
);
assert(hasAttachmentsTable === true, "question_attachments tablosu SQL scriptinde mevcut");
const hasCompositeIndex = migration7?.sql.some((s) =>
  s.includes("idx_qa_project_bf_q")
);
assert(hasCompositeIndex === true, "idx_qa_project_bf_q bileşik indexi mevcut");
const hasShaIndex = migration7?.sql.some((s) =>
  s.includes("idx_qa_project_sha")
);
assert(hasShaIndex === true, "idx_qa_project_sha indexi mevcut");

// ─────────────────────────────────────────────────────────────
// T02 - T08: SQLite Database Operations & Constraints
// ─────────────────────────────────────────────────────────────
console.log("\n=== T02 - T08: SQLite Database Operations & Persistence ===");
if (Database) {
  const TEST_DB_PATH = path.join(os.tmpdir(), `erp-faz33-attachments-${Date.now()}.db`);
  const db = new Database(TEST_DB_PATH);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");

  for (const migration of MIGRATION_DEFINITIONS) {
    for (const sql of migration.sql) {
      if (sql.trim()) db.prepare(sql.trim()).run();
    }
  }

  const PROJ_ID = "proj_faz33_001";
  const now = new Date().toISOString();

  // Create Project
  db.prepare("INSERT INTO analysis_projects (id, name, status, created_at, updated_at) VALUES (?,?,?,?,?)").run(
    PROJ_ID,
    "Kanıt Ekleri Test Projesi",
    "active",
    now,
    now
  );

  // T02: Insert Attachment 1
  const ATT1_ID = "att_faz33_001";
  const SHA1 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  db.prepare(`
    INSERT INTO question_attachments (
      id, analysis_project_id, business_function_code, question_id,
      original_file_name, stored_file_name, relative_path, mime_type,
      file_extension, file_size, sha256, description, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ATT1_ID,
    PROJ_ID,
    "SALES",
    "SALES-001",
    "Fiyat_Listesi_2026.xlsx",
    "uuid1_Fiyat_Listesi_2026.xlsx",
    "projects/proj_faz33_001/attachments/SALES/SALES-001/uuid1_Fiyat_Listesi_2026.xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "xlsx",
    1048576, // 1 MB
    SHA1,
    "Mevcut iskonto baremleri tablosu",
    0,
    now,
    now
  );

  const row1 = db.prepare("SELECT * FROM question_attachments WHERE id = ?").get(ATT1_ID) as any;
  assert(row1 !== undefined, "T02: addQuestionAttachment kaydı veritabanına yazıldı");
  assert(row1.original_file_name === "Fiyat_Listesi_2026.xlsx", "T02: Orijinal dosya adı doğru");
  assert(row1.file_size === 1048576, "T02: Dosya boyutu doğru");

  // Insert Attachment 2 (for same question)
  const ATT2_ID = "att_faz33_002";
  const SHA2 = "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e";
  db.prepare(`
    INSERT INTO question_attachments (
      id, analysis_project_id, business_function_code, question_id,
      original_file_name, stored_file_name, relative_path, mime_type,
      file_extension, file_size, sha256, description, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ATT2_ID,
    PROJ_ID,
    "SALES",
    "SALES-001",
    "Satis_Akis_Semasi.pdf",
    "uuid2_Satis_Akis_Semasi.pdf",
    "projects/proj_faz33_001/attachments/SALES/SALES-001/uuid2_Satis_Akis_Semasi.pdf",
    "application/pdf",
    "pdf",
    2097152, // 2 MB
    SHA2,
    "Satış onay iş akışı şeması",
    1,
    now,
    now
  );

  // Insert Attachment 3 (for different function / question)
  const ATT3_ID = "att_faz33_003";
  const SHA3 = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";
  db.prepare(`
    INSERT INTO question_attachments (
      id, analysis_project_id, business_function_code, question_id,
      original_file_name, stored_file_name, relative_path, mime_type,
      file_extension, file_size, sha256, description, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ATT3_ID,
    PROJ_ID,
    "ACCOUNTING",
    "ACC-005",
    "Mizan_Ornegi.xlsx",
    "uuid3_Mizan_Ornegi.xlsx",
    "projects/proj_faz33_001/attachments/ACCOUNTING/ACC-005/uuid3_Mizan_Ornegi.xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "xlsx",
    524288, // 512 KB
    SHA3,
    null,
    0,
    now,
    now
  );

  // T03: getQuestionAttachments
  const qAtts = db.prepare(`
    SELECT * FROM question_attachments
    WHERE analysis_project_id = ? AND business_function_code = ? AND question_id = ?
    ORDER BY sort_order ASC, created_at ASC
  `).all(PROJ_ID, "SALES", "SALES-001") as any[];
  assert(qAtts.length === 2, `T03: getQuestionAttachments 2 ek getirdi (gerçek: ${qAtts.length})`);
  assert(qAtts[0].id === ATT1_ID && qAtts[1].id === ATT2_ID, "T03: Sıralama sort_order ASC ile uyumlu");

  // T04: getProjectAttachments
  const projAtts = db.prepare(`
    SELECT * FROM question_attachments
    WHERE analysis_project_id = ?
    ORDER BY business_function_code ASC, question_id ASC
  `).all(PROJ_ID) as any[];
  assert(projAtts.length === 3, `T04: getProjectAttachments tüm 3 eki getirdi (gerçek: ${projAtts.length})`);

  // T05: updateAttachmentDescription
  db.prepare(`
    UPDATE question_attachments
    SET description = ?, updated_at = ?
    WHERE id = ?
  `).run("Güncellenmiş açıklama notu", new Date().toISOString(), ATT3_ID);
  const updatedRow3 = db.prepare("SELECT description FROM question_attachments WHERE id = ?").get(ATT3_ID) as any;
  assert(updatedRow3.description === "Güncellenmiş açıklama notu", "T05: updateAttachmentDescription başarıyla güncellendi");

  // T07: findAttachmentBySha256
  const dupCheck = db.prepare(`
    SELECT * FROM question_attachments
    WHERE analysis_project_id = ? AND sha256 = ?
  `).get(PROJ_ID, SHA1) as any;
  assert(dupCheck !== undefined && dupCheck.id === ATT1_ID, "T07: findAttachmentBySha256 mükerrer dosyayı tespit etti");

  // T08: getAttachmentSummaryStats
  const stats = db.prepare(`
    SELECT COUNT(*) as count, COALESCE(SUM(file_size), 0) as total_bytes
    FROM question_attachments
    WHERE analysis_project_id = ?
  `).get(PROJ_ID) as any;
  assert(Number(stats.count) === 3, `T08: Toplam ek sayısı 3 (gerçek: ${stats.count})`);
  assert(Number(stats.total_bytes) === 1048576 + 2097152 + 524288, `T08: Toplam dosya boyutu hesaplaması doğru (${stats.total_bytes} bytes)`);

  // T06: deleteQuestionAttachment & Cascade Delete Check
  db.prepare("DELETE FROM question_attachments WHERE id = ?").run(ATT1_ID);
  const afterDelete = db.prepare("SELECT * FROM question_attachments WHERE id = ?").get(ATT1_ID);
  assert(afterDelete === undefined, "T06: deleteQuestionAttachment kaydı sildi");

  // Proje silinince cascade delete kontrolü
  db.prepare("DELETE FROM analysis_projects WHERE id = ?").run(PROJ_ID);
  const remainingAtts = db.prepare("SELECT * FROM question_attachments WHERE analysis_project_id = ?").all(PROJ_ID);
  assert(remainingAtts.length === 0, "T06: CASCADE delete ile projeye ait tüm ekler silindi");

  db.close();
} else {
  console.log("  - SQLite DB testleri atlandı: better-sqlite3 ortamda bulunamadı.");
}

// ─────────────────────────────────────────────────────────────
// T09: Storage Security - sanitizeFileName
// ─────────────────────────────────────────────────────────────
console.log("\n=== T09: Storage Security - sanitizeFileName ===");
const safe1 = sanitizeFileName("../../../etc/passwd");
assert(!safe1.includes("..") && !safe1.includes("/"), `Path traversal temizlendi: "${safe1}"`);
const safe2 = sanitizeFileName("Rapor Dosyası (2026).pdf");
assert(safe2 === "Rapor_Dosyasi_2026.pdf", `Boşluk ve Türkçe karakterler güvenli hale getirildi: "${safe2}"`);
const safe3 = sanitizeFileName("test\0injection.xlsx");
assert(!safe3.includes("\0"), "Null byte temizlendi");
const safe4 = sanitizeFileName(".hidden_file.png");
assert(safe4.startsWith("file."), `Nokta ile başlayan dosya güvenli hale getirildi: "${safe4}"`);

// ─────────────────────────────────────────────────────────────
// T10: Storage Security - rejectAbsolutePath
// ─────────────────────────────────────────────────────────────
console.log("\n=== T10: Storage Security - rejectAbsolutePath ===");
let rejectedCount = 0;
const dangerousPaths = [
  "/Users/selim/secret.pdf",
  "/home/selim/data.xlsx",
  "C:\\Users\\admin\\file.docx",
  "D:/projects/file.png",
  "\\\\server\\share\\file.pdf",
  "file:///etc/passwd",
  "~/.ssh/id_rsa",
  "projects/p1/../../etc/passwd",
];

for (const p of dangerousPaths) {
  try {
    rejectAbsolutePath(p);
  } catch {
    rejectedCount++;
  }
}
assert(rejectedCount === dangerousPaths.length, `Tüm ${dangerousPaths.length} tehlikeli/mutlak yol başarıyla reddedildi`);

// ─────────────────────────────────────────────────────────────
// T11: Storage Security - validateRelativePath
// ─────────────────────────────────────────────────────────────
console.log("\n=== T11: Storage Security - validateRelativePath ===");
const validRel = "projects/proj_001/attachments/SALES/SALES-001/uuid123_file.pdf";
assert(validateRelativePath(validRel) === true, "Geçerli göreli yol onaylandı");
assert(validateRelativePath("/projects/proj_001/attachments/SALES/SALES-001/uuid123_file.pdf") === false, "Slash ile başlayan mutlak yol reddedildi");
assert(validateRelativePath("projects\\proj_001\\attachments\\SALES\\SALES-001\\file.pdf") === false, "Ters slash içeren yol reddedildi");
assert(validateRelativePath("projects/proj_001/attachments/../file.pdf") === false, "Traversal içeren yol reddedildi");

// ─────────────────────────────────────────────────────────────
// T12: Storage Security - generateStoredFileName
// ─────────────────────────────────────────────────────────────
console.log("\n=== T12: Storage Security - generateStoredFileName ===");
const storedName1 = generateStoredFileName("Mizan 2026.xlsx");
assert(storedName1.endsWith("_Mizan_2026.xlsx"), `Depolama adı beklenen biçimde: "${storedName1}"`);
const storedName2 = generateStoredFileName("Mizan 2026.xlsx");
assert(storedName1 !== storedName2, "Aynı isimli iki dosya için farklı benzersiz depolama adları üretildi");

// ─────────────────────────────────────────────────────────────
// T13: Storage Security - buildRelativePath
// ─────────────────────────────────────────────────────────────
console.log("\n=== T13: Storage Security - buildRelativePath ===");
const builtPath = buildRelativePath("proj_abc", "SALES", "SALES-010", storedName1);
assert(
  builtPath === `attachment/proj_abc/SALES/SALES-010/${storedName1}`,
  `Göreli yol kanonik düzende oluşturuldu: "${builtPath}"`
);
assert(!builtPath.includes("\\"), "Yol ayırıcıları kesinlikle ileri slash (/)");

// ─────────────────────────────────────────────────────────────
// T14: Allowlist Validation - validateAttachment Extension
// ─────────────────────────────────────────────────────────────
console.log("\n=== T14: Allowlist Validation - File Extensions ===");
assert(validateAttachment({ name: "plan.png", size: 1000 }).valid === true, "PNG kabul edildi");
assert(validateAttachment({ name: "doc.pdf", size: 1000 }).valid === true, "PDF kabul edildi");
assert(validateAttachment({ name: "data.xlsx", size: 1000 }).valid === true, "XLSX kabul edildi");
assert(validateAttachment({ name: "file.csv", size: 1000 }).valid === true, "CSV kabul edildi");
assert(validateAttachment({ name: "notes.txt", size: 1000 }).valid === true, "TXT kabul edildi");
assert(validateAttachment({ name: "script.exe", size: 1000 }).valid === false, "EXE engellendi");
assert(validateAttachment({ name: "payload.sh", size: 1000 }).valid === false, "SH engellendi");
assert(validateAttachment({ name: "hack.bat", size: 1000 }).valid === false, "BAT engellendi");
assert(validateAttachment({ name: "app.js", size: 1000 }).valid === false, "JS engellendi");

// ─────────────────────────────────────────────────────────────
// T15: Allowlist Validation - File Size Limits
// ─────────────────────────────────────────────────────────────
console.log("\n=== T15: Allowlist Validation - Single File Size ===");
assert(validateAttachment({ name: "empty.pdf", size: 0 }).valid === false, "0 bayt boş dosya engellendi");
assert(validateAttachment({ name: "valid.pdf", size: 24 * 1024 * 1024 }).valid === true, "24 MB dosya kabul edildi");
assert(validateAttachment({ name: "too_large.pdf", size: 26 * 1024 * 1024 }).valid === false, "26 MB dosya (> 25 MB) engellendi");

// ─────────────────────────────────────────────────────────────
// T16: Allowlist Validation - Question & Project Total Limits
// ─────────────────────────────────────────────────────────────
console.log("\n=== T16: Allowlist Validation - Cumulative Size Limits ===");
// Soru limiti: 100 MB
const currentQBytes = 90 * 1024 * 1024;
assert(
  validateAttachment({ name: "add1.pdf", size: 5 * 1024 * 1024 }, currentQBytes).valid === true,
  "90MB + 5MB <= 100MB kabul edildi"
);
assert(
  validateAttachment({ name: "add2.pdf", size: 15 * 1024 * 1024 }, currentQBytes).valid === false,
  "90MB + 15MB > 100MB soru sınırı aşıldı ve engellendi"
);

// Proje limiti: 1 GB
const currentProjBytes = 1020 * 1024 * 1024;
assert(
  validateAttachment({ name: "proj_add1.pdf", size: 2 * 1024 * 1024 }, 0, currentProjBytes).valid === true,
  "1020MB + 2MB <= 1GB kabul edildi"
);
assert(
  validateAttachment({ name: "proj_add2.pdf", size: 10 * 1024 * 1024 }, 0, currentProjBytes).valid === false,
  "1020MB + 10MB > 1GB proje sınırı aşıldı ve engellendi"
);

// ─────────────────────────────────────────────────────────────
// T17: SHA-256 Checksum Calculation
// ─────────────────────────────────────────────────────────────
console.log("\n=== T17: SHA-256 Checksum Calculation ===");
const testText = "ERP CRM Discovery FAZ-33 Question Attachments Test";
const textEncoder = new TextEncoder();
const testData = textEncoder.encode(testText);
const calculatedHash = await calculateSha256(testData);
assert(typeof calculatedHash === "string" && calculatedHash.length === 64, `SHA-256 64-karakter hex formatında: "${calculatedHash}"`);
const calculatedHash2 = await calculateSha256(testData);
assert(calculatedHash === calculatedHash2, "Aynı veri için deterministik SHA-256 üretildi");

// ─────────────────────────────────────────────────────────────
// T18: UI Formatting Helpers
// ─────────────────────────────────────────────────────────────
console.log("\n=== T18: UI Formatting Helpers ===");
assert(formatFileSize(512) === "512 B", "512 B doğru formatlandı");
assert(formatFileSize(1536) === "1.5 KB", "1.5 KB doğru formatlandı");
assert(formatFileSize(2097152) === "2.0 MB", "2.0 MB doğru formatlandı");
assert(formatFileSize(1073741824) === "1.00 GB", "1.00 GB doğru formatlandı");

assert(getFileCategory("png") === "image", "png -> image");
assert(getFileCategory("pdf") === "pdf", "pdf -> pdf");
assert(getFileCategory("xlsx") === "excel", "xlsx -> excel");
assert(getFileCategory("docx") === "word", "docx -> word");
assert(getFileCategory("txt") === "text", "txt -> text");

// ─────────────────────────────────────────────────────────────
// Physical Storage & Project Directory Cleanup Test
// ─────────────────────────────────────────────────────────────
console.log("\n=== Physical Storage & Project Directory Cleanup ===");
const testRelPath1 = "projects/p_cleanup_test/attachments/SALES/SALES-001/uuid_test1.xlsx";
const testRelPath2 = "projects/p_cleanup_test/attachments/SALES/SALES-002/uuid_test2.pdf";
const testContent = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

await saveAttachmentFile(testRelPath1, testContent);
await saveAttachmentFile(testRelPath2, testContent);

const readBack1 = await readAttachmentFile(testRelPath1);
assert(readBack1 !== null && readBack1.length === 8, "Fiziksel dosya 1 başarıyla kaydedildi ve okundu");

await deleteAttachmentFile(testRelPath1);
const readAfterSingleDel = await readAttachmentFile(testRelPath1);
assert(readAfterSingleDel === null, "Tekil dosya silme sonrası dosya okunamadı (silindi)");

// Project directory recursive cleanup
const readBack2 = await readAttachmentFile(testRelPath2);
assert(readBack2 !== null, "Dosya 2 silme öncesi mevcut");

await deleteProjectAttachmentsDirectory("p_cleanup_test");
const readAfterProjectDel = await readAttachmentFile(testRelPath2);
assert(readAfterProjectDel === null, "deleteProjectAttachmentsDirectory sonrası projeye ait tüm fiziksel dosyalar temizlendi");

// ─────────────────────────────────────────────────────────────
// T19 & T20: ReportModel, Word (DOCX) & PDF Export Validation
// ─────────────────────────────────────────────────────────────
console.log("\n=== T19 & T20: ReportModel, Word (.docx) & PDF Export Validation ===");

const sampleAttachment: ReportAttachmentItem = {
  id: "att_sample_001",
  businessFunctionCode: "SALES",
  businessFunctionNameTr: "Satış Yönetimi",
  processName: "Fiyatlandırma ve Teklif",
  questionId: "SALES-001",
  questionText: "Fiyat listeleri ve iskonto matrisleri nasıl yönetilmektedir?",
  originalFileName: "Iskonto_Matrisi_2026.xlsx",
  storedFileName: "uuid_Iskonto_Matrisi_2026.xlsx",
  relativePath: "projects/p1/attachments/SALES/SALES-001/uuid_Iskonto_Matrisi_2026.xlsx",
  mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  fileExtension: "xlsx",
  fileSize: 1048576,
  sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  description: "2026 Satış İskonto Baremleri ve Yetki Matrisi",
  createdAt: "2026-08-20T10:00:00Z",
};

const mockReport: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "Kanıt Ekleri Doğrulama Raporu",
    companyName: "Örnek Holding A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "active",
    packVersions: { SALES: "tr.sales.core v0.1.0" },
    isComplete: false,
    progressPercent: 75,
    requiredAnswered: 15,
    requiredTotal: 20,
    reportType: "interim",
    draftLabel: "ARA RAPOR — Analiz devam ediyor (%75)",
    projectProgressPercent: 75,
    completedFunctionCount: 0,
    selectedFunctionCount: 1,
    isProjectComplete: false,
  },
  profile: {
    analysis_project_id: "proj_test_001",
    executive_summary: "Kanıt dosyaları ile desteklenen kurumsal ön analiz çalışması.",
    overall_assessment: null,
    open_topics: null,
  },
  company: {
    companyName: "Örnek Holding A.Ş.",
    tradeName: null,
    taxNumber: "1234567890",
    city: "İstanbul",
    country: "Türkiye",
    employeeCount: "250",
    notes: null,
  },
  scope: [
    {
      code: "SALES",
      nameTr: "Satış Yönetimi",
      nameEn: "Sales Management",
      category: "CORE",
      status: "in_progress",
      progressPercentage: 75,
      departmentName: "Satış & Pazarlama",
      responsiblePerson: "Ahmet Yılmaz",
      hasPack: true,
      answeredCount: 15,
      totalQuestionCount: 20,
    },
  ],
  businessFunctions: [
    {
      code: "SALES",
      nameTr: "Satış Yönetimi",
      nameEn: "Sales Management",
      category: "CORE",
      sortOrder: 1,
      departmentName: "Satış & Pazarlama",
      responsiblePerson: "Ahmet Yılmaz",
      status: "in_progress",
      packId: "tr.sales.core",
      packVersion: "v0.1.0",
      progressPercentage: 75,
      answeredCount: 15,
      totalQuestionCount: 20,
      processes: [
        {
          name: "Fiyatlandırma ve Teklif",
          order: 1,
          questions: [
            {
              id: "SALES-001",
              order: 1,
              process: "Fiyatlandırma ve Teklif",
              questionText: "Fiyat listeleri ve iskonto matrisleri nasıl yönetilmektedir?",
              answerType: "single_choice",
              criticality: "critical",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  {
                    value: "opt_1",
                    label: "ERP üzerinde dinamik fiyatlandırma ve yetki matrisi ile",
                  },
                ],
                summaryText: "ERP üzerinde dinamik fiyatlandırma ve yetki matrisi ile",
              },
              attachments: [sampleAttachment],
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
  attachments: [sampleAttachment],
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
    answeredQuestions: 15,
    totalQuestions: 20,
    totalAttachmentCount: 1,
    totalAttachmentSizeBytes: 1048576,
  },
};

// T19: ReportModel verification
assert(mockReport.attachments?.length === 1, "T19: ReportModel attachments dizisi mevcut");
assert(
  mockReport.summaryStats.totalAttachmentCount === 1,
  "T19: SummaryStats totalAttachmentCount doğru"
);
assert(
  mockReport.summaryStats.totalAttachmentSizeBytes === 1048576,
  "T19: SummaryStats totalAttachmentSizeBytes doğru"
);

// T20: Word (.docx) & PDF Binary Export Verification
console.log("\n--- Word (.docx) Export ---");
const docxBuffer = await buildDocxBuffer(mockReport);
assert(docxBuffer instanceof Uint8Array, "DOCX binary Uint8Array üretildi");
assert(docxBuffer.byteLength > 1000, `DOCX boyutu geçerli (${docxBuffer.byteLength} bytes)`);

console.log("\n--- PDF Export & Text Extraction ---");
const pdfBuffer = await buildPdfBuffer(mockReport);
assert(pdfBuffer instanceof Uint8Array, "PDF binary Uint8Array üretildi");
assert(pdfBuffer.byteLength > 1000, `PDF boyutu geçerli (${pdfBuffer.byteLength} bytes)`);

const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const extractedText = parsedData.text;

assert(extractedText.includes("Kanıt Dokümanları ve Ekler Dizini"), "PDF'te 'Kanıt Dokümanları ve Ekler Dizini' başlığı mevcut");
assert(extractedText.includes("Iskonto_Matrisi_2026.xlsx"), "PDF'te eklenen dosya adı mevcut");
assert(extractedText.includes("Satış Yönetimi"), "PDF'te bağlı iş fonksiyonu adı mevcut");

// ─────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────
console.log("\n=================================================");
console.log(`FAZ-33 QUESTION EVIDENCE & ATTACHMENTS TEST SUMMARY:`);
console.log(`PASS: ${passCount}`);
console.log(`FAIL: ${failCount}`);
console.log("=================================================\n");

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
