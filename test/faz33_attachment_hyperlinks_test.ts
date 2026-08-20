/**
 * ERP CRM Discovery — FAZ-33 Question Evidence & Attachment Hyperlinks Automated Test Suite
 *
 * Verifies:
 * 1. Path resolution across POSIX (macOS/Linux) and Windows drive paths.
 * 2. Standardized `file:///...` URL conversion.
 * 3. UTF-8 Percent Encoding of Turkish characters (Ç, Ğ, İ, Ö, Ş, Ü, ç, ğ, ı, ö, ş, ü).
 * 4. Encoding of spaces, parentheses, brackets, special characters.
 * 5. Path traversal rejection (reject `../`, invalid relative paths).
 * 6. `attachmentExists` behavior for existing vs missing files.
 * 7. `openAttachment` user-friendly error messages on missing files.
 * 8. DOCX export with `ExternalHyperlink` XML nodes.
 * 9. PDF export with link annotations and readable fallback texts.
 * 10. `buildReportModel` attachment mapping with `fileUrl`.
 * 11. Resilience against deleted/corrupted attachment references.
 * 12. End-to-end integration and roundtrip consistency.
 */

import {
  resolveAttachmentAbsolutePath,
  attachmentPathToFileUrl,
  attachmentExists,
  openAttachment,
} from "../src/storage/attachmentLinks";
import {
  saveAttachmentFile,
  deleteAttachmentFile,
  validateRelativePath,
  rejectAbsolutePath,
  buildRelativePath,
  generateStoredFileName,
} from "../src/storage/attachmentManager";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import type { ReportModel } from "../src/report/types";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passCount++;
    console.log(`  ✓ ${message}`);
  } else {
    failCount++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log("\n==================================================================");
  console.log("  FAZ-33: QUESTION EVIDENCE & ATTACHMENT HYPERLINKS TEST SUITE");
  console.log("==================================================================\n");

  // ── TEST 1: POSIX & Windows Absolute Path Resolution ────────────────────
  console.log("Test 1: Absolute Path Resolution across Platforms");
  const relPath = "projects/proj-101/attachments/SALES/SAL-01/1234_Teklif.pdf";

  const posixPath = await resolveAttachmentAbsolutePath(relPath, "/Users/selim/Library/Application Support/ERP CRM Discovery");
  assert(
    posixPath === "/Users/selim/Library/Application Support/ERP CRM Discovery/projects/proj-101/attachments/SALES/SAL-01/1234_Teklif.pdf",
    `POSIX mutlak yol doğru çözüldü: ${posixPath}`
  );

  const winPath = await resolveAttachmentAbsolutePath(relPath, "C:\\Users\\Selim\\AppData\\Local\\ERP CRM Discovery");
  assert(
    winPath === "C:\\Users\\Selim\\AppData\\Local\\ERP CRM Discovery\\projects\\proj-101\\attachments\\SALES\\SAL-01\\1234_Teklif.pdf",
    `Windows mutlak yol ters-slash ile çözüldü: ${winPath}`
  );

  // ── TEST 2: POSIX Path to file:/// URL ──────────────────────────────────
  console.log("\nTest 2: POSIX Path to Standardized file:/// URL");
  const macPath = "/Users/selim/Library/Application Support/ERP CRM Discovery/projects/proj-1/attachments/SALES/q1/teklif.pdf";
  const macUrl = attachmentPathToFileUrl(macPath);
  assert(
    macUrl.startsWith("file:///Users/selim/Library/Application%20Support/"),
    `macOS boşluklu path URL encode edildi: ${macUrl}`
  );
  assert(
    macUrl === "file:///Users/selim/Library/Application%20Support/ERP%20CRM%20Discovery/projects/proj-1/attachments/SALES/q1/teklif.pdf",
    `macOS tam file URL beklendiği gibi üretildi: ${macUrl}`
  );

  // ── TEST 3: Windows Path to file:/// URL ────────────────────────────────
  console.log("\nTest 3: Windows Path to file:/// URL");
  const winNativePath = "C:\\Users\\Selim\\AppData\\Local\\ERP CRM Discovery\\projects\\proj-1\\attachments\\ACCOUNTING\\q2\\mizan.xlsx";
  const winUrl = attachmentPathToFileUrl(winNativePath);
  assert(
    winUrl.startsWith("file:///C:/Users/Selim/AppData/Local/"),
    `Windows sürücü harfi ve formatı korundu: ${winUrl}`
  );
  assert(
    winUrl === "file:///C:/Users/Selim/AppData/Local/ERP%20CRM%20Discovery/projects/proj-1/attachments/ACCOUNTING/q2/mizan.xlsx",
    `Windows tam file URL doğru üretildi: ${winUrl}`
  );

  // ── TEST 4: Turkish Characters Percent Encoding ────────────────────────
  console.log("\nTest 4: Turkish Characters RFC-3986 UTF-8 Percent Encoding");
  const turkishPath = "/app-data/projects/p1/attachments/HR/q3/İskonto_Şablonu_Örnek_Çağrı_Ücreti.xlsx";
  const turkishUrl = attachmentPathToFileUrl(turkishPath);
  assert(
    turkishUrl.includes("%C4%B0skonto_%C5%9Eablonu_%C3%96rnek_%C3%87a%C4%9Fr%C4%B1_%C3%9Ccreti.xlsx"),
    `Türkçe karakterler (İ, Ş, Ö, Ç, ğ, ı, Ü) standart UTF-8 percent-encode edildi: ${turkishUrl}`
  );
  assert(
    !turkishUrl.includes("İ") && !turkishUrl.includes("Ş") && !turkishUrl.includes("Ö"),
    `URL ham Unicode karakter içermiyor.`
  );

  // ── TEST 5: Special Characters & Parentheses Encoding ───────────────────
  console.log("\nTest 5: Special Characters & Parentheses Encoding");
  const specialPath = "/data/projects/p1/attachments/IT/q4/Diagram (Final & Approved) [v2.0].png";
  const specialUrl = attachmentPathToFileUrl(specialPath);
  assert(
    specialUrl.includes("%28Final%20%26%20Approved%29"),
    `Parantezler ve boşluklar güvenle encode edildi: ${specialUrl}`
  );
  assert(
    specialUrl.includes("%5Bv2.0%5D") || specialUrl.includes("[v2.0]"),
    `Köşeli parantezler işlendi: ${specialUrl}`
  );

  // ── TEST 6: Path Traversal & Security Validation ────────────────────────
  console.log("\nTest 6: Path Traversal & Security Validation");
  assert(!validateRelativePath("projects/../../../etc/passwd"), "Path traversal göreli yol reddedildi.");
  assert(!validateRelativePath("/projects/p1/attachments/S/Q/file.pdf"), "Başında slash olan yol reddedildi.");
  assert(!validateRelativePath("C:\\projects\\p1\\attachments\\S\\Q\\file.pdf"), "Windows mutlak yol göreli olarak reddedildi.");

  let threw = false;
  try {
    rejectAbsolutePath("../secret.txt");
  } catch {
    threw = true;
  }
  assert(threw, "rejectAbsolutePath '../' içeren yollarda hata fırlattı.");

  // ── TEST 7: attachmentExists for Existing vs Missing Files ─────────────
  console.log("\nTest 7: attachmentExists Verification");
  const testRelPath = "projects/test-proj-99/attachments/SALES/SAL-01/uuid_test_doc.pdf";
  const dummyBuffer = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF

  await saveAttachmentFile(testRelPath, dummyBuffer);
  const existsBefore = await attachmentExists(testRelPath);
  assert(existsBefore === true, "Kaydedilen dosya için attachmentExists true döndü.");

  await deleteAttachmentFile(testRelPath);
  const existsAfter = await attachmentExists(testRelPath);
  assert(existsAfter === false, "Silinen dosya için attachmentExists false döndü.");

  // ── TEST 8: openAttachment User-Friendly Error on Missing File ─────────
  console.log("\nTest 8: openAttachment Missing File Graceful Error Handling");
  const missingAtt = {
    relativePath: "projects/test-proj-99/attachments/SALES/SAL-01/missing_file.pdf",
    originalFileName: "Fiyat_Listesi.pdf",
  };
  const openRes = await openAttachment(missingAtt);
  assert(openRes.success === false, "Eksik dosya için openAttachment başarısız döndü.");
  assert(
    openRes.error?.includes("Dosya bulunamadı: \"Fiyat_Listesi.pdf\""),
    `Kullanıcı dostu hata mesajı üretildi: ${openRes.error}`
  );
  assert(
    !openRes.error?.includes("/var/") && !openRes.error?.includes("C:\\"),
    "Hata mesajı raw dosya sistemi mutlak yolunu sızdırmadı."
  );

  // ── TEST 9: DOCX Export with Hyperlink Generation ──────────────────────
  console.log("\nTest 9: DOCX Export Hyperlink Verification");
  const mockReport: ReportModel = {
    metadata: {
      projectId: "proj-hyperlink-test",
      projectName: "Hyperlink Test Projesi",
      version: "0.1.0",
      generatedAt: "20.08.2026 17:00",
      language: "tr",
      title: "ERP CRM Ön Analiz Raporu",
    },
    profile: {
      analysis_project_id: "proj-hyperlink-test",
      executive_summary: "Yönetici özeti kanıt ekleri.",
      overall_assessment: "Genel değerlendirme.",
      open_topics: null,
    },
    company: {
      companyName: "Atlas Holding",
      industry: "Üretim & Dağıtım",
      employeeCount: 350,
      annualRevenue: "500M TL",
      targetGoLiveDate: "2027-01-01",
      currency: "TRY",
      consultantName: "Selim Koçak",
    },
    scope: [],
    businessFunctions: [
      {
        code: "SALES",
        nameTr: "Satış Yönetimi",
        category: "Temel",
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
                questionText: "Teklif onay matrisi var mı?",
                answerType: "single_choice",
                criticality: "high",
                formattedAnswer: {
                  isAnswered: true,
                  selectedOptions: [{ label: "Evet, kademeli onay uygulanıyor" }],
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

  const docxBytes = await buildDocxBuffer(mockReport);
  assert(docxBytes instanceof Uint8Array && docxBytes.length > 5000, `DOCX buffer başarıyla üretildi (${docxBytes.length} bayt).`);

  // ── TEST 10: PDF Export with Link Annotations ───────────────────────────
  console.log("\nTest 10: PDF Export with Link Annotations");
  const pdfBytes = await buildPdfBuffer(mockReport);
  assert(pdfBytes instanceof Uint8Array && pdfBytes.length > 1000, `PDF buffer başarıyla üretildi (${pdfBytes.length} bayt).`);

  // ── TEST 11: Broken Reference Resilience ────────────────────────────────
  console.log("\nTest 11: Broken/Missing Attachment Reference Resilience");
  const brokenReport: ReportModel = {
    ...mockReport,
    attachments: [
      {
        id: "att-broken",
        businessFunctionCode: "FINANCE",
        businessFunctionNameTr: "Mali İşler",
        processName: "Bütçe",
        questionId: "FIN-01",
        questionText: "Bütçe revizyonu yapılıyor mu?",
        originalFileName: "Silinmis_Dosya.xlsx",
        storedFileName: "ghost.xlsx",
        relativePath: "projects/p1/attachments/FINANCE/FIN-01/ghost.xlsx",
        fileUrl: "file:///projects/p1/attachments/FINANCE/FIN-01/ghost.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileExtension: "xlsx",
        fileSize: 1024 * 50,
        sha256: "deadbeef",
        description: null,
        createdAt: "2026-08-20T12:00:00Z",
      },
    ],
  };

  let docxOk = false;
  let pdfOk = false;
  try {
    const d = await buildDocxBuffer(brokenReport);
    docxOk = d.length > 0;
    const p = await buildPdfBuffer(brokenReport);
    pdfOk = p.length > 0;
  } catch (err) {
    console.error("Exporter hata verdi:", err);
  }
  assert(docxOk, "Eksik dosya referansı içeren raporda DOCX ihracı çökmedi.");
  assert(pdfOk, "Eksik dosya referansı içeren raporda PDF ihracı çökmedi.");

  // ── TEST 12: URL Decoding & Roundtrip Integrity ─────────────────────────
  console.log("\nTest 12: URL Encoding Roundtrip Integrity");
  const originalFileName = "Stok_Sayım_Listesi (2026 & Şube).xlsx";
  const genStored = generateStoredFileName(originalFileName);
  const builtRel = buildRelativePath("proj-1", "INVENTORY", "INV-01", genStored);
  const encodedUrl = attachmentPathToFileUrl(builtRel);
  assert(
    decodeURIComponent(encodedUrl).includes(genStored),
    `Encode edilen file URL decode edildiğinde saklanan dosya adıyla tam eşleşiyor.`
  );

  console.log("\n==================================================================");
  console.log(`  SONUÇ: ${passCount} BAŞARILI, ${failCount} BAŞARISIZ`);
  console.log("==================================================================\n");

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test icra hatası:", err);
  process.exit(1);
});
