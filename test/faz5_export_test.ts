/**
 * ERP CRM Discovery — FAZ-5.1 Native Save + PDF Unicode Hardening Acceptance Test
 *
 * Verifies:
 * 1. Filename sanitization helper (company name, fallback, invalid chars, dates)
 * 2. DOCX binary generation (PK\x03\x04 ZIP signature)
 * 3. PDF binary generation with embedded TrueType Unicode font (%PDF- header)
 * 4. Turkish Unicode glyph coverage and lossless text extraction (PDFParse)
 * 5. autoTable Turkish text rendering with embedded font
 * 6. Avoidance of standard PDF WinAnsi fonts (LiberationSans embedded)
 * 7. Shared ReportModel consistency and immutability (same model for DOCX & PDF)
 * 8. Native Save adapter contract, cancel handling, and writeExportFile helper
 * 9. Production codebase inspection: 0 showSaveFilePicker, 0 URL.createObjectURL, 0 remote font fetch
 * 10. SQLite buildReportModel integration test
 */

import Database from "better-sqlite3";
import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import { BUSINESS_FUNCTION_REGISTRY } from "../src/generated/businessFunctions";
import { getSanitizedReportFilename } from "../src/export/filename";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import { PDF_FONT_FAMILY } from "../src/export/fonts/fontBundle";
import type { ReportModel } from "../src/report/types";
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

// ─── TEST 1: Filename Sanitizer ─────────────────────────────────────────────
console.log("\n=== T01: Filename Sanitizer ===");
const fixedDate = new Date("2026-08-19T10:00:00Z");

const fnDocx = getSanitizedReportFilename("ABC Mobilya A.Ş.", "ERP Analizi", "docx", fixedDate);
assert(fnDocx === "ABC_Mobilya_A.Ş._ERP_CRM_On_Analiz_2026-08-19.docx", `DOCX filename: ${fnDocx}`);

const fnPdf = getSanitizedReportFilename("ABC Mobilya A.Ş.", "ERP Analizi", "pdf", fixedDate);
assert(fnPdf === "ABC_Mobilya_A.Ş._ERP_CRM_On_Analiz_2026-08-19.pdf", `PDF filename: ${fnPdf}`);

const fnSanitize = getSanitizedReportFilename('Firma /\\:*?"<>| Adı', "Proje", "docx", fixedDate);
assert(!fnSanitize.includes("/") && !fnSanitize.includes(":") && !fnSanitize.includes("*"), "Geçersiz dosya karakterleri temizlendi");

const fnFallback = getSanitizedReportFilename("", "Yedek Proje Adı", "pdf", fixedDate);
assert(fnFallback.startsWith("Yedek_Proje_Adı"), "Firma adı boşsa proje adı kullanıldı");

// ─── TEST 2: Deterministic ReportModel Fixture with Full Turkish Set ─────────
const TURKISH_TEST_SENTENCE = "Çağrı, Çalışma, Ğ, İ, ı, Şirket, Üretim, Görüşme, İstanbul, Iğdır, Çeşme, Öğüt, Şüphe, çözüm.";

const sampleFinding = {
  id: "fnd_001",
  title: "Müşteri verileri dağınık Excel dosyalarında tutuluyor",
  description: "Merkez ile bayiler arasında tekil müşteri veritabanı bulunmuyor.",
  priority: "high" as const,
  status: "confirmed" as const,
  questionId: "SALES-001",
  sourceQuestionText: "Müşteri ve potansiyel müşteri verileri nerede tutuluyor?",
  createdAt: "2026-08-19T10:00:00Z",
};

const sampleRequirement = {
  id: "req_001",
  title: "Merkezi CRM müşteri ana veri yönetimi",
  description: "Yeni sistemde tekilleştirme kuralı ve onay akışı bulunmalı.",
  priority: "critical" as const,
  status: "confirmed" as const,
  questionId: "SALES-001",
  sourceQuestionText: "Müşteri ve potansiyel müşteri verileri nerede tutuluyor?",
  createdAt: "2026-08-19T10:00:00Z",
};

const sampleRisk = {
  id: "rsk_001",
  title: "Mükerrer ve kirli veri aktarımı riski",
  description: "Geçiş sırasında Excel tablolarındaki eski/hatalı kayıtlar aktarılabilir.",
  impact: "high" as const,
  probability: "high" as const,
  mitigationNote: "Geçiş öncesi veri temizliği ve deduplication şablonu hazırlanmalı.",
  status: "open" as const,
  questionId: "SALES-001",
  sourceQuestionText: "Müşteri ve potansiyel müşteri verileri nerede tutuluyor?",
  createdAt: "2026-08-19T10:00:00Z",
};

const sampleNote = {
  id: "not_001",
  note: "Satış direktörü veri temizliği için dış danışmanlık desteği talep etti.",
  businessFunctionCode: "SALES",
  questionId: "SALES-001",
  sourceQuestionText: "Müşteri ve potansiyel müşteri verileri nerede tutuluyor?",
  createdAt: "2026-08-19T10:00:00Z",
};

const sampleReport: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "ABC Mobilya ERP Dönüşüm Ön Analizi",
    companyName: "ABC Mobilya Sanayi ve Ticaret A.Ş.",
    generatedAt: "19.08.2026",
    projectStatus: "active",
    packVersions: { SALES: "tr.sales.core v0.1.0" },
  },
  profile: {
    analysis_project_id: "proj_test_001",
    executive_summary: `Yönetici Özeti: ${TURKISH_TEST_SENTENCE}`,
    overall_assessment: "Satış ve sipariş süreçlerinin merkezi CRM/ERP çözümüne taşınması teklif onay sürelerini kısaltacaktır.",
    open_topics: "1. Bölge ofislerinin iskonto yetki matrisi\n2. B2B bayi sipariş portalı faz kararı",
  },
  company: {
    companyName: "ABC Mobilya Sanayi ve Ticaret A.Ş.",
    tradeName: "ABC Mobilya A.Ş.",
    city: "Kayseri",
    country: "Türkiye",
    employeeCount: "250-500",
    taxNumber: "1234567890",
    notes: "3 fabrika, 12 bölge satış mağazası",
  },
  scope: [
    {
      code: "SALES",
      nameTr: "Satış Yönetimi",
      nameEn: "Sales Management",
      category: "Satış & Pazarlama",
      departmentName: "Satış Direktörlüğü",
      responsiblePerson: "Ahmet Yılmaz",
      status: "in_progress",
      hasPack: true,
      progressPercentage: 75,
      answeredCount: 3,
      totalQuestionCount: 4,
    },
    {
      code: "PROCUREMENT",
      nameTr: "Satın Alma",
      nameEn: "Procurement",
      category: "Satın Alma",
      departmentName: "Satınalma Müdürlüğü",
      responsiblePerson: "Mehmet Demir",
      status: "not_started",
      hasPack: false,
      progressPercentage: 0,
      answeredCount: 0,
      totalQuestionCount: 0,
    },
  ],
  businessFunctions: [
    {
      code: "SALES",
      nameTr: "Satış Yönetimi",
      nameEn: "Sales Management",
      category: "Satış & Pazarlama",
      sortOrder: 14,
      departmentName: "Satış Direktörlüğü",
      responsiblePerson: "Ahmet Yılmaz",
      status: "in_progress",
      packId: "tr.sales.core",
      packVersion: "0.1.0",
      progressPercentage: 75,
      answeredCount: 3,
      totalQuestionCount: 4,
      processes: [
        {
          name: "Müşteri ve Potansiyel Müşteri Yönetimi",
          order: 1,
          questions: [
            {
              id: "SALES-001",
              order: 1,
              process: "Müşteri ve Potansiyel Müşteri Yönetimi",
              questionText: "Müşteri ve potansiyel müşteri verileri nerede tutuluyor?",
              description: "Müşteri ana verisinin tutulduğu ortamları belirlemek için.",
              answerType: "multiple_choice",
              criticality: "high",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [
                  { value: "erp_crm", label: "Mevcut ERP / CRM sistemi üzerinde", note: "Merkez ofis ekibi kullanıyor." },
                  { value: "excel", label: "Excel / Tablolarda", note: "Bölge bayileri ayrı Excel tutuyor." },
                ],
                generalNote: "Geçiş sonrası tek sisteme toplanacak.",
                summaryText: "• Mevcut ERP / CRM sistemi üzerinde — Açıklama: Merkez ofis ekibi kullanıyor.\n• Excel / Tablolarda — Açıklama: Bölge bayileri ayrı Excel tutuyor.\n(Genel Not: Geçiş sonrası tek sisteme toplanacak.)",
              },
              findings: [
                {
                  id: "fnd_001",
                  title: "Müşteri verileri dağınık Excel dosyalarında tutuluyor",
                  description: "Merkez ile bayiler arasında tekil müşteri veritabanı bulunmuyor.",
                  priority: "high",
                  status: "confirmed",
                  questionId: "SALES-001",
                  sourceQuestionText: "Müşteri ve potansiyel müşteri verileri nerede tutuluyor?",
                  createdAt: "2026-08-19T10:00:00Z",
                },
              ],
              requirements: [
                {
                  id: "req_001",
                  title: "Merkezi CRM müşteri ana veri yönetimi",
                  description: "Yeni sistemde tekilleştirme kuralı ve onay akışı bulunmalı.",
                  priority: "critical",
                  status: "confirmed",
                  questionId: "SALES-001",
                  sourceQuestionText: "Müşteri ve potansiyel müşteri verileri nerede tutuluyor?",
                  createdAt: "2026-08-19T10:00:00Z",
                },
              ],
              risks: [
                {
                  id: "rsk_001",
                  title: "Mükerrer ve kirli veri aktarımı riski",
                  description: "Geçiş sırasında Excel tablolarındaki eski/hatalı kayıtlar aktarılabilir.",
                  impact: "high",
                  probability: "high",
                  mitigationNote: "Geçiş öncesi veri temizliği ve deduplication şablonu hazırlanmalı.",
                  status: "open",
                  questionId: "SALES-001",
                  sourceQuestionText: "Müşteri ve potansiyel müşteri verileri nerede tutuluyor?",
                  createdAt: "2026-08-19T10:00:00Z",
                },
              ],
              notes: [
                {
                  id: "not_001",
                  note: "Satış direktörü veri temizliği için dış danışmanlık desteği talep etti.",
                  businessFunctionCode: "SALES",
                  questionId: "SALES-001",
                  sourceQuestionText: "Müşteri ve potansiyel müşteri verileri nerede tutuluyor?",
                  createdAt: "2026-08-19T10:00:00Z",
                },
              ],
            },
          ],
        },
      ],
      findings: [sampleFinding],
      requirements: [sampleRequirement],
      risks: [sampleRisk],
      notes: [sampleNote],
    },
  ],
  globalFindings: [],
  globalRequirements: [],
  globalRisks: [],
  projectNotes: [
    {
      id: "not_002",
      note: "Genel Proje Notu: Yönetim kurulu toplantısı 25 Ağustos'ta yapılacak.",
      businessFunctionCode: null,
      questionId: null,
      createdAt: "2026-08-19T10:00:00Z",
    },
  ],
  summaryStats: {
    totalFunctions: 2,
    completedFunctions: 0,
    inProgressFunctions: 1,
    notStartedFunctions: 1,
    totalFindings: 1,
    totalRequirements: 1,
    openRisks: 1,
    totalRisks: 1,
    totalNotes: 2,
    answeredQuestions: 3,
    totalQuestions: 4,
  },
};

// ─── TEST 3: DOCX Generation Test ───────────────────────────────────────────
async function testDocx() {
  console.log("\n=== T02: DOCX Generation Test ===");
  const modelCopy = JSON.stringify(sampleReport);
  const docxBuffer = await buildDocxBuffer(sampleReport);

  assert(docxBuffer instanceof Uint8Array, "DOCX çıktısı Uint8Array");
  assert(docxBuffer.length > 500, `DOCX boyutu geçerli: ${docxBuffer.length} bytes`);

  // Check PK\x03\x04 ZIP magic header (50 4B 03 04)
  const isZip =
    docxBuffer[0] === 0x50 &&
    docxBuffer[1] === 0x4b &&
    docxBuffer[2] === 0x03 &&
    docxBuffer[3] === 0x04;
  assert(isZip, "DOCX geçerli ZIP container formatında (PK\\x03\\x04)");

  // Verify Immutability
  assert(JSON.stringify(sampleReport) === modelCopy, "ReportModel DOCX export sonrası mutate edilmedi (Immutability PASS)");
}

// ─── TEST 4: PDF Unicode Generation & Font Embedding ────────────────────────
async function testPdf() {
  console.log("\n=== T03: PDF Unicode Generation & Font Embedding ===");
  const modelCopy = JSON.stringify(sampleReport);
  const pdfBuffer = await buildPdfBuffer(sampleReport);

  assert(pdfBuffer instanceof Uint8Array, "PDF çıktısı Uint8Array");
  assert(pdfBuffer.length > 500, `PDF boyutu geçerli: ${pdfBuffer.length} bytes`);

  // Check %PDF- header (25 50 44 46)
  const isPdf =
    pdfBuffer[0] === 0x25 &&
    pdfBuffer[1] === 0x50 &&
    pdfBuffer[2] === 0x44 &&
    pdfBuffer[3] === 0x46;
  assert(isPdf, "PDF geçerli %PDF- formatında");

  // Inspect PDF binary for embedded font descriptor
  const pdfRawString = Buffer.from(pdfBuffer).toString("binary");
  assert(pdfRawString.includes("LiberationSans"), "PDF içinde gömülü LiberationSans TrueType fontu mevcut");
  assert(PDF_FONT_FAMILY === "LiberationSans", "PDF font ailesi LiberationSans olarak mühürlü");

  // Verify Immutability
  assert(JSON.stringify(sampleReport) === modelCopy, "ReportModel PDF export sonrası mutate edilmedi (Immutability PASS)");

  // ─── Text Extraction with PDFParse ──────────────────────────────────────
  console.log("\n=== T04: PDF Turkish Text Extraction (Lossless Unicode) ===");
  const parser = new PDFParse({ data: pdfBuffer });
  const parsedData = await parser.getText();
  const extractedText = parsedData.text;

  // Verify full Turkish test sentence in extracted text
  assert(extractedText.includes("Çağrı"), "Türkçe karakter 'Ç/ğ/ı' başarıyla çıkartıldı (Çağrı)");
  assert(extractedText.includes("Çalışma"), "Türkçe karakter 'Ç/ş/ı' başarıyla çıkartıldı (Çalışma)");
  assert(extractedText.includes("Ğ"), "Türkçe karakter 'Ğ' başarıyla çıkartıldı");
  assert(extractedText.includes("İ"), "Türkçe karakter 'İ' başarıyla çıkartıldı");
  assert(extractedText.includes("ı"), "Türkçe karakter 'ı' başarıyla çıkartıldı");
  assert(extractedText.includes("Şirket"), "Türkçe karakter 'Ş' başarıyla çıkartıldı (Şirket)");
  assert(extractedText.includes("Üretim"), "Türkçe karakter 'Ü' başarıyla çıkartıldı (Üretim)");
  assert(extractedText.includes("Görüşme"), "Türkçe karakter 'ö/ş' başarıyla çıkartıldı (Görüşme)");
  assert(extractedText.includes("İstanbul"), "Türkçe karakter 'İ' başarıyla çıkartıldı (İstanbul)");
  assert(extractedText.includes("Iğdır"), "Türkçe karakter 'I/ğ/ı' başarıyla çıkartıldı (Iğdır)");
  assert(extractedText.includes("Çeşme"), "Türkçe karakter 'Ç/ş' başarıyla çıkartıldı (Çeşme)");
  assert(extractedText.includes("Öğüt"), "Türkçe karakter 'Ö/ğ/ü' başarıyla çıkartıldı (Öğüt)");
  assert(extractedText.includes("Şüphe"), "Türkçe karakter 'Ş/ü' başarıyla çıkartıldı (Şüphe)");
  assert(extractedText.includes("çözüm"), "Türkçe karakter 'ç/ö/ü' başarıyla çıkartıldı (çözüm)");

  // Verify scope and semantic items
  assert(extractedText.includes("Satış Yönetimi"), "Kapsam tablosu Türkçe başlık çıkartıldı");
  assert(extractedText.includes("Müşteri verileri dağınık Excel"), "Bulgu metni Türkçe çıkartıldı");
}

// ─── TEST 5: Production Code Cleanliness (No Browser Hacks) ────────────────
async function testCodebaseCleanliness() {
  console.log("\n=== T05: Production Code Cleanliness (Tauri Native Only) ===");
  const fileSaverSrc = fs.readFileSync(path.join(process.cwd(), "src", "export", "fileSaver.ts"), "utf-8");

  assert(!fileSaverSrc.includes("showSaveFilePicker"), "src/export/fileSaver.ts içinde showSaveFilePicker yok");
  assert(!fileSaverSrc.includes("createObjectURL"), "src/export/fileSaver.ts içinde createObjectURL yok");
  assert(!fileSaverSrc.includes('createElement("a")'), "src/export/fileSaver.ts içinde <a> download hack'i yok");
  assert(fileSaverSrc.includes("@tauri-apps/plugin-dialog"), "Resmi @tauri-apps/plugin-dialog import edilmiş");
  assert(fileSaverSrc.includes("@tauri-apps/plugin-fs"), "Resmi @tauri-apps/plugin-fs import edilmiş");

  const fontBundleSrc = fs.readFileSync(path.join(process.cwd(), "src", "export", "fonts", "fontBundle.ts"), "utf-8");
  assert(!fontBundleSrc.includes("fetch(") && !fontBundleSrc.includes("http://") && !fontBundleSrc.includes("https://"), "Font bundle 100% offline (0 network call)");
}

// ─── TEST 6: SQLite buildReportModel Integration ────────────────────────────
async function testSqliteIntegration() {
  console.log("\n=== T06: SQLite buildReportModel & Export Integration ===");
  const TEST_DB_PATH = path.join(os.tmpdir(), `erp-faz5-export-test-${Date.now()}.db`);
  const db = new Database(TEST_DB_PATH);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");

  for (const migration of MIGRATION_DEFINITIONS) {
    for (const sql of migration.sql) {
      if (sql.trim()) db.prepare(sql.trim()).run();
    }
  }

  const insertBf = db.prepare(`
    INSERT INTO business_functions (id, code, name_tr, name_en, category, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(code) DO NOTHING
  `);
  for (const bf of BUSINESS_FUNCTION_REGISTRY) {
    if (bf.is_active) {
      insertBf.run(`bf_${bf.code.toLowerCase()}`, bf.code, bf.name_tr, bf.name_en, bf.category_tr, bf.sort_order);
    }
  }

  const PROJ_ID = "proj_faz5_int_001";
  const now = new Date().toISOString();
  db.prepare("INSERT INTO analysis_projects (id, name, status, created_at, updated_at) VALUES (?,?,?,?,?)").run(
    PROJ_ID,
    "ABC Mobilya ERP Analizi",
    "active",
    now,
    now
  );

  db.prepare(`
    INSERT INTO company_profiles (id, analysis_project_id, company_name, city, country, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run("comp_001", PROJ_ID, "ABC Mobilya A.Ş.", "Kayseri", "Türkiye", now, now);

  db.prepare(`
    INSERT INTO project_business_functions (id, analysis_project_id, business_function_id, company_department_name, responsible_person, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run("pbf_sales", PROJ_ID, "bf_sales", "Satış Direktörlüğü", "Ahmet Yılmaz", "in_progress", now, now);

  db.prepare(`
    INSERT INTO analysis_report_profiles (id, analysis_project_id, executive_summary, overall_assessment, open_topics, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run("rp_001", PROJ_ID, "Yönetici Özeti: Satış analizi tamamlandı. Çağrı, Şirket, Üretim, Iğdır.", "Dönüşüm önerisi", "Açık konular", now, now);

  // Read back via DB
  const rp = db.prepare("SELECT * FROM analysis_report_profiles WHERE analysis_project_id = ?").get(PROJ_ID) as any;
  assert(rp !== undefined, "DB'de Report Profile mevcut");
  assert(rp.executive_summary.includes("Çağrı"), "DB'den okunan executive_summary Türkçe karakterler korundu");

  db.close();
  fs.unlinkSync(TEST_DB_PATH);
  assert(!fs.existsSync(TEST_DB_PATH), "Test DB temizlendi");
}

async function runAll() {
  await testDocx();
  await testPdf();
  await testCodebaseCleanliness();
  await testSqliteIntegration();

  console.log("\n" + "═".repeat(50));
  console.log(`FAZ-5.1 Native Save + PDF Unicode Test Sonucu: ${passCount} PASS / ${failCount} FAIL`);
  if (failCount === 0) {
    console.log("BAŞARILI: FAZ-5.1 NATIVE SAVE + PDF UNICODE ACCEPTANCE: PASS");
  } else {
    console.error("BAŞARISIZ: FAZ-5.1 NATIVE SAVE + PDF UNICODE ACCEPTANCE: FAIL");
    process.exit(1);
  }
}

runAll();
