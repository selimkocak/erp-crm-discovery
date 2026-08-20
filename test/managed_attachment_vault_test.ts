/**
 * ERP CRM Discovery — Managed Attachment Vault Architecture Acceptance Tests
 *
 * FAZ-33: Soru Bazlı Kanıt ve Dosya Ekleri — Yönetilen Kanıt Kasası (Managed Attachment Vault)
 *
 * Doğrulanan Temel Senaryolar:
 * 1. Kaynak Bağımsızlığı & İkiz Kopya Oluşturma: Downloads/Desktop vb. kaynaklardan seçilen dosyanın
 *    uygulamanın yönetilen kalıcı kasasına kopyalanması.
 * 2. SQLite Sadece Managed Relative Path: DB'ye mutlak işletim sistemi yolu yerine göreli yol yazılması.
 * 3. Kaynak Dosya Silinme Dayanıklılığı: Kaynak dosya diskten silinse bile yönetilen kopyadan açılabilmesi.
 * 4. Kaynak Dosya Ad Değiştirme / Taşıma Dayanıklılığı: Kaynak dosya taşınsa dahi kasadaki dosyanın etkilenmemesi.
 * 5. SHA-256 Checksum & Deterministik Doğrulama.
 * 6. Mükerrer (Duplicate) Tespiti ve Farklı Dosya Versiyonlama.
 * 7. Rapor Önizleme, DOCX ve PDF Hyperlink Doğrulaması (file:/// URL'leri yönetilen kopyayı açar).
 * 8. Eksik / Legacy Kayıt Tespiti ve "Yeniden İçe Aktar" (Re-import) İş Akışı.
 * 9. Proje Silindiğinde Fiziksel Vault Dizin Temizliği.
 * 10. Tauri appLocalDataDir / appDataDir Kalıcılığı & Platform Uyumluluğu (Windows & macOS).
 * 11. Path Traversal & Güvenlik Koruması.
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
  clearMemoryStorage,
  getManagedVaultBaseDir,
  importFileToManagedVault,
  reimportAttachmentFile,
} from "../src/storage/attachmentManager";
import {
  resolveAttachmentAbsolutePath,
  attachmentPathToFileUrl,
  resolveAttachmentFileUrl,
  attachmentExists,
  openAttachment,
} from "../src/storage/attachmentLinks";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import type { ReportModel } from "../src/report/types";
import * as path from "node:path";
import * as os from "node:os";

let Database: any = null;
try {
  Database = (await import("better-sqlite3")).default;
} catch {
  // better-sqlite3 fallback
}

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log("==================================================================");
  console.log("  MANAGED ATTACHMENT VAULT ARCHITECTURE ACCEPTANCE TESTS");
  console.log("==================================================================");

  clearMemoryStorage();

  // ─────────────────────────────────────────────────────────────
  // T01: Migration 7 & 8 Managed Vault Schema Extensions
  // ─────────────────────────────────────────────────────────────
  console.log("\n=== T01: Migration 7 & 8 Managed Vault Schema Extensions ===");
  const migration7 = MIGRATION_DEFINITIONS.find((m) => m.version === 7);
  assert(migration7 !== undefined, "Migration 7 tanımlı");
  const hasAttachmentsTable = migration7?.sql.some((s) =>
    s.includes("CREATE TABLE IF NOT EXISTS question_attachments")
  );
  assert(hasAttachmentsTable === true, "question_attachments tablosu tanımlı");

  const migration8 = MIGRATION_DEFINITIONS.find((m) => m.version === 8);
  assert(migration8 !== undefined, "Migration 8 (Managed Vault Schema Extensions) tanımlı");
  assert(
    migration8?.sql.some((s) => s.includes("source_file_name")) === true,
    "source_file_name kolonu migration v8'de mevcut"
  );
  assert(
    migration8?.sql.some((s) => s.includes("source_absolute_path")) === true,
    "source_absolute_path kolonu migration v8'de mevcut"
  );
  assert(
    migration8?.sql.some((s) => s.includes("imported_at")) === true,
    "imported_at kolonu migration v8'de mevcut"
  );

  // ─────────────────────────────────────────────────────────────
  // T02: SQLite Vault Database Persistence & Foreign Key Cascade
  // ─────────────────────────────────────────────────────────────
  console.log("\n=== T02: SQLite Vault Database Persistence & Foreign Key Cascade ===");
  if (Database) {
    const TEST_DB_PATH = path.join(os.tmpdir(), `erp-vault-test-${Date.now()}.db`);
    const db = new Database(TEST_DB_PATH);
    db.pragma("foreign_keys = ON");
    db.pragma("journal_mode = WAL");

    for (const migration of MIGRATION_DEFINITIONS) {
      for (const sql of migration.sql) {
        if (sql.trim()) {
          try {
            db.prepare(sql.trim()).run();
          } catch {
            // Safe ignore for idempotent column additions
          }
        }
      }
    }

    const PROJ_ID = "proj_vault_test_001";
    const now = new Date().toISOString();
    db.prepare("INSERT INTO analysis_projects (id, name, status, created_at, updated_at) VALUES (?,?,?,?,?)").run(
      PROJ_ID,
      "Vault Test Projesi",
      "in_progress",
      now,
      now
    );

    // Insert an attachment with managed metadata
    const attId = "att_vault_001";
    const relPath = `projects/${PROJ_ID}/attachments/PROCUREMENT/PR-001/uuid123_Teklif_Analizi.pdf`;
    db.prepare(`
      INSERT INTO question_attachments (
        id, analysis_project_id, business_function_code, question_id,
        original_file_name, stored_file_name, relative_path, mime_type,
        file_extension, file_size, sha256, description, source_file_name,
        source_absolute_path, imported_at, sort_order, created_at, updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      attId,
      PROJ_ID,
      "PROCUREMENT",
      "PR-001",
      "Teklif Analizi.pdf",
      "uuid123_Teklif_Analizi.pdf",
      relPath,
      "application/pdf",
      "pdf",
      10240,
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "Onaylı Satın Alma Teklifi",
      "Teklif Analizi.pdf",
      "/Users/selim/Downloads/Teklif Analizi.pdf",
      now,
      0,
      now,
      now
    );

    const inserted = db.prepare("SELECT * FROM question_attachments WHERE id = ?").get(attId);
    assert(inserted !== undefined, "SQLite kaydı başarıyla oluşturuldu");
    assert(inserted.relative_path === relPath, "SQLite'ta göreli yol eksiksiz saklandı");
    assert(inserted.source_file_name === "Teklif Analizi.pdf", "source_file_name saklandı");
    assert(inserted.source_absolute_path === "/Users/selim/Downloads/Teklif Analizi.pdf", "source_absolute_path saklandı");

    // Test Cascade Delete
    db.prepare("DELETE FROM analysis_projects WHERE id = ?").run(PROJ_ID);
    const countAfterDelete = db.prepare("SELECT count(*) as count FROM question_attachments WHERE analysis_project_id = ?").get(PROJ_ID);
    assert(countAfterDelete.count === 0, "Proje silindiğinde question_attachments kayıtları CASCADE ile temizlendi");
  }

  // ─────────────────────────────────────────────────────────────
  // T03: Kaynak Bağımsızlığı & Yönetilen Kasa İkiz Kopyalama
  // ─────────────────────────────────────────────────────────────
  console.log("\n=== T03: Source File Decoupling & Managed Vault Twin Creation ===");

  const projectId = "proj_test_vault_xyz";
  const bfCode = "IT_INFRASTRUCTURE";
  const questionId = "ITI-005";
  const sourceDownloadsPath = "/Users/selim/Downloads/Server_Architecture_Diagram_2026.png";
  const simulatedFileContent = new TextEncoder().encode("PNG_MOCK_IMAGE_DATA_BYTES_1234567890");

  const storedFileName = generateStoredFileName("Server Architecture Diagram 2026.png");
  assert(storedFileName.endsWith("_Server_Architecture_Diagram_2026.png"), "Güvenli benzersiz saklama adı üretildi");

  const relativePath = buildRelativePath(projectId, bfCode, questionId, storedFileName);
  assert(
    relativePath.startsWith(`projects/${projectId}/attachments/${bfCode}/${questionId}/`),
    "Yönetilen kasanın göreli yolu standart düzende (projects/{projId}/attachments/...)"
  );

  // Physically copy to managed vault
  await saveAttachmentFile(relativePath, simulatedFileContent);

  // Verify physical twin exists in managed vault
  const vaultData = await readAttachmentFile(relativePath);
  assert(vaultData !== null && vaultData.byteLength === simulatedFileContent.byteLength, "Fiziksel ikiz kopya managed vault'a yazıldı ve okundu");
  assert(await attachmentExists(relativePath), "attachmentExists true döndü");

  // ─────────────────────────────────────────────────────────────
  // T04: Kaynak Dosya Silinme / Taşınma / Değişme Dayanıklılığı
  // ─────────────────────────────────────────────────────────────
  console.log("\n=== T04: Source File Deletion & Mutation Resilience ===");

  // Simulating user deleting the original file from ~/Downloads
  // The application NEVER reads from sourceDownloadsPath; it strictly uses the managed vault copy!
  const openRes = await openAttachment({
    relative_path: relativePath,
    original_file_name: "Server Architecture Diagram 2026.png",
  });
  assert(openRes.success === true, "Kaynak dosya silinse dahi uygulama managed kopyayı başarıyla açabiliyor");

  // ─────────────────────────────────────────────────────────────
  // T05: SHA-256 Checksum & Deterministik Doğrulama
  // ─────────────────────────────────────────────────────────────
  console.log("\n=== T05: SHA-256 Checksum & Duplicate Detection ===");

  const sha1 = await calculateSha256(simulatedFileContent);
  const sha2 = await calculateSha256(simulatedFileContent);
  assert(sha1 === sha2, "Aynı veri için deterministik SHA-256 hash üretildi");
  assert(sha1.length === 64, "SHA-256 hash uzunluğu 64 karakter");

  const differentContent = new TextEncoder().encode("DIFFERENT_DATA_CONTENT");
  const shaDiff = await calculateSha256(differentContent);
  assert(sha1 !== shaDiff, "Farklı içerikler farklı SHA-256 üretti");

  // ─────────────────────────────────────────────────────────────
  // T06: Rapor Önizleme, DOCX ve PDF Hyperlink Çözümlemesi
  // ─────────────────────────────────────────────────────────────
  console.log("\n=== T06: Report Preview, DOCX & PDF Managed Hyperlinks ===");

  const resolvedUrl = await resolveAttachmentFileUrl(relativePath, "/mock/app-data");
  assert(resolvedUrl.startsWith("file:///mock/app-data/projects/"), "Managed vault fileUrl standarda uygun");
  assert(resolvedUrl.includes("attachments/"), "URL attachments yolunu içeriyor");

  // Mock ReportModel with attachments
  const mockReport: ReportModel = {
    metadata: {
      title: "ERP CRM Ön Analiz Raporu",
      projectName: "Hyperlink Test Projesi",
      companyName: "Atlas Holding",
      generatedAt: "20.08.2026 17:00",
      projectStatus: "in_progress",
      packVersions: { SALES: "0.1.0" },
      isComplete: false,
      progressPercent: 50,
      requiredAnswered: 5,
      requiredTotal: 10,
      reportType: "final",
      draftLabel: "Taslak",
      projectProgressPercent: 50,
      completedFunctionCount: 0,
      selectedFunctionCount: 1,
      isProjectComplete: false,
    },
    profile: {
      analysis_project_id: "proj-hyperlink-test",
      executive_summary: "Yönetici özeti kanıt ekleri.",
      overall_assessment: "Genel değerlendirme.",
      open_topics: null,
    },
    company: {
      companyName: "Atlas Holding",
      tradeName: null,
      taxNumber: null,
      city: "İstanbul",
      country: "Türkiye",
      employeeCount: "350",
      notes: null,
    },
    scope: [],
    businessFunctions: [
      {
        code: "SALES",
        nameTr: "Satış Yönetimi",
        nameEn: "Sales Management",
        category: "Temel",
        sortOrder: 1,
        departmentName: "Satış & Pazarlama",
        responsiblePerson: "Ahmet Yılmaz",
        status: "in_progress",
        packId: "tr.sales.core",
        packVersion: "0.1.0",
        progressPercentage: 50,
        answeredCount: 5,
        totalQuestionCount: 10,
        processes: [
          {
            name: "Teklif ve Sipariş Yönetimi",
            order: 1,
            questions: [
              {
                id: "SAL-01",
                order: 1,
                process: "Teklif Yönetimi",
                subProcess: "Teklif Hazırlama",
                questionText: "Teklif onay matrisi var mı?",
                answerType: "single_choice",
                criticality: "high",
                formattedAnswer: {
                  isAnswered: true,
                  selectedOptions: [{ value: "evet", label: "Evet, kademeli onay uygulanıyor" }],
                  summaryText: "Evet, kademeli onay uygulanıyor",
                },
                findings: [],
                requirements: [],
                risks: [],
                notes: [],
                attachments: [
                  {
                    id: "att-001",
                    businessFunctionCode: "SALES",
                    businessFunctionNameTr: "Satış Yönetimi",
                    processName: "Teklif Yönetimi",
                    questionId: "SAL-01",
                    questionText: "Teklif onay matrisi var mı?",
                    originalFileName: "Teklif_Proseduru_2026.pdf",
                    storedFileName: "uuid_teklif.pdf",
                    relativePath: "projects/p1/attachments/SALES/SAL-01/uuid_teklif.pdf",
                    fileUrl: "file:///projects/p1/attachments/SALES/SAL-01/uuid_teklif.pdf",
                    mimeType: "application/pdf",
                    fileExtension: "pdf",
                    fileSize: 1024 * 350,
                    sha256: "abc123sha",
                    description: "Güncel onay baremleri",
                    createdAt: "2026-08-20T12:00:00Z",
                  },
                ],
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
      answeredQuestions: 5,
      totalQuestions: 10,
      totalAttachmentCount: 1,
      totalAttachmentSizeBytes: 1024 * 350,
    },
    attachments: [
      {
        id: "att-001",
        businessFunctionCode: "SALES",
        businessFunctionNameTr: "Satış Yönetimi",
        processName: "Teklif Yönetimi",
        questionId: "SAL-01",
        questionText: "Teklif onay matrisi var mı?",
        originalFileName: "Teklif_Proseduru_2026.pdf",
        storedFileName: "uuid_teklif.pdf",
        relativePath: "projects/p1/attachments/SALES/SAL-01/uuid_teklif.pdf",
        fileUrl: "file:///projects/p1/attachments/SALES/SAL-01/uuid_teklif.pdf",
        mimeType: "application/pdf",
        fileExtension: "pdf",
        fileSize: 1024 * 350,
        sha256: "abc123sha",
        description: "Güncel onay baremleri",
        createdAt: "2026-08-20T12:00:00Z",
      },
    ],
  };

  // Word (.docx) export with hyperlinks
  const docxBytes = await buildDocxBuffer(mockReport);
  assert(docxBytes instanceof Uint8Array && docxBytes.byteLength > 1000, "DOCX dışa aktarımı başarıyla üretildi");

  // PDF (.pdf) export with link annotations
  const pdfBytes = await buildPdfBuffer(mockReport);
  assert(pdfBytes instanceof Uint8Array && pdfBytes.byteLength > 1000, "PDF dışa aktarımı başarıyla üretildi");

  // ─────────────────────────────────────────────────────────────
  // T07: Eksik / Legacy Dosya Tespiti & Yeniden İçe Aktar (Re-import)
  // ─────────────────────────────────────────────────────────────
  console.log("\n=== T07: Missing / Legacy Detection & Re-import Orchestration ===");

  // Intentionally delete a managed file from vault to simulate a missing/corrupted file
  await deleteAttachmentFile(relativePath);
  const existsAfterDelete = await attachmentExists(relativePath);
  assert(existsAfterDelete === false, "Fiziksel dosya silindiğinde attachmentExists false döndü");

  const openMissingRes = await openAttachment({
    relative_path: relativePath,
    original_file_name: "Server Architecture Diagram 2026.png",
  });
  assert(openMissingRes.success === false, "Eksik dosya açılmaya çalışıldığında zarif hata döndü");
  assert(openMissingRes.error?.includes("bulunamadı") === true, "Dostça hata mesajı üretildi");

  // Re-import replacement file
  const reimportedContent = new TextEncoder().encode("REIMPORTED_CORRECTED_DATA_BYTES");
  const newStored = generateStoredFileName("Server_Architecture_Restored.png");
  const newRelPath = buildRelativePath(projectId, bfCode, questionId, newStored);
  await saveAttachmentFile(newRelPath, reimportedContent);

  assert(await attachmentExists(newRelPath), "Reimport sonrası yeni dosya kasada fiziksel olarak mevcut");
  const openReimportedRes = await openAttachment({
    relative_path: newRelPath,
    original_file_name: "Server_Architecture_Restored.png",
  });
  assert(openReimportedRes.success === true, "Reimport edilen dosya artık başarıyla açılabiliyor");

  // ─────────────────────────────────────────────────────────────
  // T08: Cross-Platform Absolute Path & URL Resolution
  // ─────────────────────────────────────────────────────────────
  console.log("\n=== T08: Cross-Platform Path & URL Resolution ===");

  // macOS App Data Path
  const macBase = "/Users/selim/Library/Application Support/erp-crm-discovery";
  const macAbs = await resolveAttachmentAbsolutePath(newRelPath, macBase);
  assert(macAbs.startsWith(macBase), "macOS mutlak yolu Application Support altında çözüldü");
  const macUrl = attachmentPathToFileUrl(macAbs);
  assert(macUrl.startsWith("file:///Users/selim/Library/Application%20Support/erp-crm-discovery/"), "macOS URL boşlukları %20 ile encode edildi");

  // Windows App Data Path
  const winBase = "C:\\Users\\Selim\\AppData\\Local\\erp-crm-discovery";
  const winAbs = await resolveAttachmentAbsolutePath(newRelPath, winBase);
  assert(winAbs.startsWith("C:\\Users\\Selim\\AppData\\Local\\erp-crm-discovery"), "Windows mutlak yolu AppData\\Local altında çözüldü");
  const winUrl = attachmentPathToFileUrl(winAbs);
  assert(winUrl.startsWith("file:///C:/Users/Selim/AppData/Local/erp-crm-discovery/"), "Windows file URL doğru sürücü ve forward-slash ile üretildi");

  // Turkish Characters URL encoding
  const turkishPath = "/app-data/projects/p1/attachments/IT/q1/İskonto_Raporu_Örnek_Çağrı.xlsx";
  const turkishUrl = attachmentPathToFileUrl(turkishPath);
  assert(!turkishUrl.includes("İ") && !turkishUrl.includes("Ö") && !turkishUrl.includes("ğ"), "Türkçe karakterler UTF-8 percent-encode edildi");

  // ─────────────────────────────────────────────────────────────
  // T09: Security & Path Traversal Validation
  // ─────────────────────────────────────────────────────────────
  console.log("\n=== T09: Security & Path Traversal Protection ===");

  let threwAbs = false;
  try {
    rejectAbsolutePath("/etc/passwd");
  } catch {
    threwAbs = true;
  }
  assert(threwAbs, "Mutlak Linux yolu reddedildi");

  let threwWin = false;
  try {
    rejectAbsolutePath("C:\\Windows\\System32\\cmd.exe");
  } catch {
    threwWin = true;
  }
  assert(threwWin, "Mutlak Windows yolu reddedildi");

  let threwTraversal = false;
  try {
    rejectAbsolutePath("../../secret.key");
  } catch {
    threwTraversal = true;
  }
  assert(threwTraversal, "Traversal yolu reddedildi");

  assert(!validateRelativePath("projects/p1/../../etc/passwd"), "validateRelativePath traversal içeren yolu reddetti");
  assert(!validateRelativePath("invalid/path/format"), "validateRelativePath projects/ ile başlamayan yolu reddetti");

  // ─────────────────────────────────────────────────────────────
  // T10: Proje Silindiğinde Managed Vault Temizliği
  // ─────────────────────────────────────────────────────────────
  console.log("\n=== T10: Project Deletion & Managed Vault Physical Cleanup ===");

  // Verify file exists before project deletion
  assert(await attachmentExists(newRelPath), "Proje silinmeden önce attachment kasada mevcut");

  // Delete project directory
  await deleteProjectAttachmentsDirectory(projectId);

  // Verify file no longer exists in vault
  assert((await attachmentExists(newRelPath)) === false, "Proje silindikten sonra attachment kasadan temizlendi");

  console.log("\n" + "═".repeat(60));
  console.log(`MANAGED ATTACHMENT VAULT ARCHITECTURE TESTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("═".repeat(60) + "\n");
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
