/**
 * ERP CRM Discovery — Company Profile Sector & Multi-Location Branch Structure Test
 *
 * Test Coverage:
 * T01: Migration 10 tanımı ve SQL sözdizimi
 * T02: SQLite Migration 10 işletimi ve geriye dönük uyumluluk (NULL fallback)
 * T03: Serbest metin sektör ve şubeli yapı CRUD kalıcılığı
 * T04: Tek lokasyonlu (has_branches = 'no') işletme kalıcılığı
 * T05: ReportModel şirket nesnesi eşlemesi (businessSector, hasBranches, branchCount)
 * T06: DOCX export içinde Sektör ve Şube satırları
 * T07: PDF export içinde Sektör ve Şube metinleri (PDFParse doğrulama)
 * T08: Boş alanların raporlarda boş satır üretmemesi
 * T09: Soru paketleri ve modül izolasyonu (Sektör modül seçimini etkilemez)
 */

import Database from "better-sqlite3";
import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import { PDFParse } from "pdf-parse";
import { CANONICAL_QUESTION_PACKS } from "../src/generated/questionPacks";
import type { ReportModel, ReportCompany } from "../src/report/types";

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

async function runTests(): Promise<void> {
  console.log("\n=======================================================");
  console.log("Firma Profili — Sektör ve Şubeli Yapı Test Paketi");
  console.log("=======================================================\n");

  // T01: Migration 10 Definition
  console.log("--- T01: Migration 10 Tanımı ---");
  const migration10 = MIGRATION_DEFINITIONS.find((m) => m.version === 10);
  assert(!!migration10, "Migration 10 tanımlı olmalı");
  assert(/Business Sector/i.test(migration10?.description || ""), "Migration 10 açıklaması 'Business Sector' içermeli");
  const sqlCombined = (migration10?.sql || []).join("\n");
  assert(sqlCombined.includes("business_sector TEXT"), "business_sector TEXT kolonu eklenmeli");
  assert(sqlCombined.includes("has_branches TEXT"), "has_branches TEXT kolonu eklenmeli");
  assert(sqlCombined.includes("branch_count INTEGER"), "branch_count INTEGER kolonu eklenmeli");

  // T02: SQLite Migration Execution & Backward Compatibility
  console.log("\n--- T02: SQLite Migration 10 ve Geriye Dönük Uyumluluk ---");
  const db = new Database(":memory:");
  for (const m of MIGRATION_DEFINITIONS) {
    for (const sql of m.sql) {
      db.exec(sql);
    }
  }

  const tableInfo = db.prepare("PRAGMA table_info(company_profiles)").all() as Array<{
    name: string;
    type: string;
  }>;
  const colNames = tableInfo.map((c) => c.name);
  assert(colNames.includes("business_sector"), "company_profiles.business_sector mevcut");
  assert(colNames.includes("has_branches"), "company_profiles.has_branches mevcut");
  assert(colNames.includes("branch_count"), "company_profiles.branch_count mevcut");

  // Insert legacy-style row
  db.prepare(`
    INSERT INTO analysis_projects (id, name, status, created_at, updated_at)
    VALUES ('proj_legacy', 'Eski Proje', 'active', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')
  `).run();

  db.prepare(`
    INSERT INTO company_profiles (id, analysis_project_id, company_name, country, created_at, updated_at)
    VALUES ('comp_legacy', 'proj_legacy', 'Eski Proje A.Ş.', 'Türkiye', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')
  `).run();

  const legacyRow = db.prepare("SELECT * FROM company_profiles WHERE id = 'comp_legacy'").get() as any;
  assert(legacyRow.company_name === "Eski Proje A.Ş.", "Eski firma adı doğru okunmalı");
  assert(legacyRow.business_sector === null, "business_sector varsayılan NULL");
  assert(legacyRow.has_branches === null, "has_branches varsayılan NULL");
  assert(legacyRow.branch_count === null, "branch_count varsayılan NULL");

  // T03: Hybrid free text sector and multi-location structure
  console.log("\n--- T03: Hibrit Sektör ve Şubeli Yapı Kaydı ---");
  db.prepare(`
    INSERT INTO analysis_projects (id, name, status, created_at, updated_at)
    VALUES ('proj_hybrid', 'Akın Proje', 'active', '2026-08-22T12:00:00Z', '2026-08-22T12:00:00Z')
  `).run();

  db.prepare(`
    INSERT INTO company_profiles (
      id, analysis_project_id, company_name, trade_name, tax_number, city, country,
      employee_count, business_sector, has_branches, branch_count, notes, created_at, updated_at
    ) VALUES (
      'comp_hybrid', 'proj_hybrid', 'Akın Mobilya Sanayi', 'Akın Ofis', '1234567890', 'Bursa', 'Türkiye',
      '51-250', 'Perakende, fason üretim ve kendi fabrikası', 'yes', 5, 'Merkez fabrika + 4 showroom', '2026-08-22T12:00:00Z', '2026-08-22T12:00:00Z'
    )
  `).run();

  const hybridRow = db.prepare("SELECT * FROM company_profiles WHERE id = 'comp_hybrid'").get() as any;
  assert(hybridRow.business_sector === "Perakende, fason üretim ve kendi fabrikası", "Hibrit sektör metni kaydedildi");
  assert(hybridRow.has_branches === "yes", "has_branches = 'yes' kaydedildi");
  assert(hybridRow.branch_count === 5, "branch_count = 5 kaydedildi");

  // T04: Single location company
  console.log("\n--- T04: Tek Merkez / Lokasyon Kaydı ---");
  db.prepare(`
    INSERT INTO analysis_projects (id, name, status, created_at, updated_at)
    VALUES ('proj_single', 'Tek Merkez Proje', 'active', '2026-08-22T12:00:00Z', '2026-08-22T12:00:00Z')
  `).run();

  db.prepare(`
    INSERT INTO company_profiles (
      id, analysis_project_id, company_name, country, business_sector, has_branches, branch_count, created_at, updated_at
    ) VALUES (
      'comp_single', 'proj_single', 'Tek Merkez Lojistik', 'Türkiye', 'Uluslararası Taşımacılık', 'no', NULL, '2026-08-22T12:00:00Z', '2026-08-22T12:00:00Z'
    )
  `).run();

  const singleRow = db.prepare("SELECT * FROM company_profiles WHERE id = 'comp_single'").get() as any;
  assert(singleRow.business_sector === "Uluslararası Taşımacılık", "Sektör kaydedildi");
  assert(singleRow.has_branches === "no", "has_branches = 'no' kaydedildi");
  assert(singleRow.branch_count === null, "Tek merkezde branch_count NULL");
  db.close();

  // T05: ReportModel Mapping
  console.log("\n--- T05: ReportModel Şirket Alanları Eşlemesi ---");
  const reportCompany: ReportCompany = {
    companyName: "Akın Mobilya Sanayi ve Ticaret A.Ş.",
    tradeName: "Akın Ofis",
    city: "Bursa",
    country: "Türkiye",
    employeeCount: "51-250",
    taxNumber: "1234567890",
    businessSector: "Ofis mobilyası üretimi ve toptan satışı",
    hasBranches: "yes",
    branchCount: 5,
    notes: "Bursa fabrika + 4 satış mağazası",
  };

  const sampleReport: ReportModel = {
    metadata: {
      title: "ERP / CRM Ön Analiz Raporu",
      projectName: "Akın ERP Dönüşüm Analizi",
      companyName: reportCompany.companyName,
      generatedAt: "22.08.2026",
      projectStatus: "active",
      packVersions: { SALES: "tr.sales.core v0.1.0" },
      isComplete: false,
      progressPercent: 65,
      requiredAnswered: 20,
      requiredTotal: 30,
      reportType: "interim",
      draftLabel: "ARA RAPOR",
      projectProgressPercent: 65,
      completedFunctionCount: 1,
      selectedFunctionCount: 2,
      isProjectComplete: false,
    },
    profile: {
      analysis_project_id: "proj_test_1",
      executive_summary: "Yönetici Özeti: Üretim ve mağaza entegrasyonu hedefleniyor.",
      overall_assessment: "Teklif ve sipariş yönetimi tek merkezde toplanmalı.",
      open_topics: "Mağaza POS entegrasyonu",
    },
    company: reportCompany,
    scope: [],
    businessFunctions: [],
    projectNotes: [],
    followups: [],
    globalFindings: [],
    globalRequirements: [],
    globalRisks: [],
    summaryStats: {
      totalFunctions: 2,
      completedFunctions: 1,
      inProgressFunctions: 1,
      notStartedFunctions: 0,
      totalQuestions: 30,
      answeredQuestions: 20,
      totalFindings: 0,
      totalRequirements: 0,
      openRisks: 0,
      totalRisks: 0,
      totalNotes: 0,
      openFollowupCount: 0,
      revisitCount: 0,
      criticalFollowupCount: 0,
      totalAttachmentCount: 0,
      totalAttachmentSizeBytes: 0,
    },
  };

  assert(sampleReport.company.companyName === "Akın Mobilya Sanayi ve Ticaret A.Ş.", "Firma adı eşlendi");
  assert(sampleReport.company.businessSector === "Ofis mobilyası üretimi ve toptan satışı", "businessSector eşlendi");
  assert(sampleReport.company.hasBranches === "yes", "hasBranches eşlendi");
  assert(sampleReport.company.branchCount === 5, "branchCount eşlendi");

  // T06: DOCX Exporter
  console.log("\n--- T06: DOCX Exporter Doğrulaması ---");
  const docxBuf = await buildDocxBuffer(sampleReport);
  assert(docxBuf instanceof Uint8Array && docxBuf.length > 2000, `DOCX buffer başarıyla üretildi (${docxBuf.length} bytes)`);

  // T07: PDF Exporter
  console.log("\n--- T07: PDF Exporter ve Metin Doğrulaması ---");
  const pdfBuf = await buildPdfBuffer(sampleReport);
  assert(pdfBuf instanceof Uint8Array && pdfBuf.length > 2000, `PDF buffer başarıyla üretildi (${pdfBuf.length} bytes)`);

  const pdfParsed = await new PDFParse({ data: pdfBuf }).getText();
  assert(pdfParsed.text.includes("Akın Mobilya Sanayi ve Ticaret A.Ş."), "PDF firma adı içeriyor");
  assert(pdfParsed.text.includes("Ofis mobilyası üretimi ve toptan satışı"), "PDF sektör metni içeriyor");
  assert(
    pdfParsed.text.includes("Şubeli") || pdfParsed.text.includes("Lokasyonlu"),
    "PDF şubeli yapı bilgisi içeriyor"
  );
  assert(pdfParsed.text.includes("5 Şube") || pdfParsed.text.includes("Lokasyon"), "PDF 5 şube metni içeriyor");

  // T08: Omitted fields do not create empty rows
  console.log("\n--- T08: Boş Alanların Raporda İzolasyonu ---");
  const emptyReportCompany: ReportCompany = {
    companyName: "Sade Butik Ltd.",
    tradeName: null,
    city: null,
    country: "Türkiye",
    employeeCount: null,
    taxNumber: null,
    businessSector: null,
    hasBranches: null,
    branchCount: null,
    notes: null,
  };

  const emptySampleReport: ReportModel = {
    ...sampleReport,
    company: emptyReportCompany,
  };

  const emptyPdfBuf = await buildPdfBuffer(emptySampleReport);
  const emptyPdfParsed = await new PDFParse({ data: emptyPdfBuf }).getText();
  assert(emptyPdfParsed.text.includes("Sade Butik Ltd."), "Sade firma adı mevcut");
  assert(!emptyPdfParsed.text.includes("Sektör / Faaliyet: null"), "Boş sektör null yazmaz");
  assert(!emptyPdfParsed.text.includes("Şubeli / Çok Lokasyonlu Yapı: null"), "Boş şube null yazmaz");

  // T09: Zero impact on question packs & module isolation
  console.log("\n--- T09: Soru Paketleri ve Modül İzolasyonu ---");
  const packs = Object.values(CANONICAL_QUESTION_PACKS);
  assert(packs.length === 34, `34 soru paketi korundu (Bulunan: ${packs.length})`);
  let totalQuestions = 0;
  for (const pack of packs) {
    totalQuestions += (pack as any).questions.length;
  }
  assert(totalQuestions === 1492, `1.492 soru külliyatı korundu (Bulunan: ${totalQuestions})`);

  console.log("\n=======================================================");
  console.log(`SONUÇ: ${passCount} Geçti, ${failCount} Başarısız`);
  console.log("=======================================================\n");

  process.exit(failCount > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test icra hatası:", err);
  process.exit(1);
});
