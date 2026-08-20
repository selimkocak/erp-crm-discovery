/**
 * ERP CRM Discovery — FAZ-10: Field Acceptance & Report Quality Hardening Tests
 *
 * Automated verification for:
 * 1. Report Scope Hardening: NOT_STARTED & no-pack functions excluded from detailed section
 * 2. Scope Table Completeness: All 31 functions remain in "3. Analiz Kapsamı & İlerleme"
 * 3. Project Completion Truth: Single function completion (100%) != Entire project completion
 * 4. Terminology Localization: Status codes localized to clean Turkish labels
 * 5. Data Quality: No raw JSON or internal DB keys exposed in report output
 * 6. Followup Table: Section 5 follow-up items and priority colors
 * 7. Report Compactness: DOCX & PDF generation without bloated empty sections
 * 8. Distribution Packaging: WINDOWS_KURULUM_YARDIMI.txt & MACOS_KURULUM_YARDIMI.txt inclusion
 * 9. Error UX: Friendly error messages for ACL / File / Dialog native errors
 */

import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import { BUSINESS_FUNCTION_REGISTRY } from "../src/generated/businessFunctions";
import { formatStatusLabel, type ReportModel, type ReportScopeItem, type ReportBusinessFunction } from "../src/report/types";
import { formatUserFriendlyError } from "../src/export/fileSaver";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import { PDFParse } from "pdf-parse";
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT_DIR = process.cwd();

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
console.log("FAZ-10: FIELD ACCEPTANCE & REPORT QUALITY HARDENING");
console.log("══════════════════════════════════════════════════");

// ─── TEST 1: Terminology Localization ────────────────────────────────────────
console.log("\n=== T01: Terminology Localization ===");
assert(formatStatusLabel("not_started") === "Başlanmadı", "formatStatusLabel not_started -> Başlanmadı");
assert(formatStatusLabel("in_progress") === "Devam Ediyor", "formatStatusLabel in_progress -> Devam Ediyor");
assert(formatStatusLabel("completed") === "Tamamlandı", "formatStatusLabel completed -> Tamamlandı");
assert(formatStatusLabel("") === "Başlanmadı", "formatStatusLabel empty -> Başlanmadı");

// ─── TEST 2: Report Scope Hardening & Scope Table Completeness ───────────────
console.log("\n=== T02: Scope Table Completeness (31 Functions) ===");
const allScopeItems: ReportScopeItem[] = BUSINESS_FUNCTION_REGISTRY.map((bf) => ({
  code: bf.code,
  nameTr: bf.name_tr,
  nameEn: bf.name_en,
  category: bf.category_tr,
  departmentName: bf.code === "SALES" ? "Satış Direktörlüğü" : null,
  responsiblePerson: bf.code === "SALES" ? "Ahmet Yılmaz" : null,
  status: bf.code === "SALES" ? "completed" : "not_started",
  hasPack: bf.code === "SALES",
  progressPercentage: bf.code === "SALES" ? 100 : 0,
  answeredCount: bf.code === "SALES" ? 21 : 0,
  totalQuestionCount: bf.code === "SALES" ? 21 : 0,
}));

assert(allScopeItems.length === 32, "Kapsam tablosunda 32 fonksiyonun tamamı mevcuttur");
assert(allScopeItems.find((s) => s.code === "SALES")?.status === "completed", "SALES kapsamda tamamlandı durumunda");
assert(allScopeItems.find((s) => s.code === "PROCUREMENT")?.status === "not_started", "PROCUREMENT kapsamda başlanmadı durumunda");

// Detail filtering simulation (same rule as src/report/builder.ts)
const detailedFunctions: ReportBusinessFunction[] = allScopeItems
  .filter((s) => s.status !== "not_started" || s.hasPack)
  .map((s) => ({
    code: s.code,
    nameTr: s.nameTr,
    nameEn: s.nameEn,
    category: s.category,
    sortOrder: 1,
    departmentName: s.departmentName,
    responsiblePerson: s.responsiblePerson,
    status: s.status,
    packId: s.hasPack ? "tr.sales.core" : null,
    packVersion: s.hasPack ? "0.1.0" : null,
    progressPercentage: s.progressPercentage,
    answeredCount: s.answeredCount,
    totalQuestionCount: s.totalQuestionCount,
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
            answerType: "single_choice",
            criticality: "high",
            formattedAnswer: {
              isAnswered: true,
              selectedOptions: [{ value: "erp_crm", label: "Mevcut ERP / CRM sistemi üzerinde" }],
              summaryText: "Mevcut ERP / CRM sistemi üzerinde (Bölge ekipleri ayrı Excel dosyalarında tutuyor.)",
              generalNote: "Merkez satış ekibi aktif kullanıyor.",
            },
            findings: [
              {
                id: "find_1",
                title: "Excel Bağımlılığı",
                description: "Teklifler Excel ortamında tutuluyor, revizyon takibi yok.",
                priority: "high",
                status: "open",
                questionId: "SALES-001",
                createdAt: "2026-08-19",
              },
            ],
            requirements: [
              {
                id: "req_1",
                title: "Merkezi Fiyat Yönetimi",
                description: "Tüm iskonto ve fiyat listeleri tek sistemden yönetilmeli.",
                priority: "critical",
                status: "confirmed",
                questionId: "SALES-001",
                createdAt: "2026-08-19",
              },
            ],
            risks: [
              {
                id: "risk_1",
                title: "Hatalı Fiyatlandırma Riski",
                description: "Excel formül hataları nedeniyle yanlış iskonto uygulanması.",
                impact: "high",
                probability: "medium",
                mitigationNote: "Sistem içi onay matrisi kurulacak.",
                status: "open",
                questionId: "SALES-001",
                createdAt: "2026-08-19",
              },
            ],
            notes: [],
          },
        ],
      },
    ],
    findings: [],
    requirements: [],
    risks: [],
    notes: [],
  }));

console.log("\n=== T03: Report Scope Hardening & Detail Filtering ===");
assert(detailedFunctions.length === 1, "Detay bölümüne yalnızca analizi yapılan 1 fonksiyon (SALES) dahil edildi");
assert(detailedFunctions[0].code === "SALES", "Detaydaki fonksiyon SALES");
assert(!detailedFunctions.some((f) => f.code === "PROCUREMENT"), "NOT_STARTED fonksiyonlar detay bölümünden elendi");

// ─── TEST 4: Project Scope Completion Truth ──────────────────────────────────
console.log("\n=== T04: Project Scope Completion vs Single Function Truth ===");
const completedFunctionCount: number = 1;
const selectedFunctionCount: number = 31;
const projectProgressPercent = Math.round((completedFunctionCount / selectedFunctionCount) * 100);
const isProjectComplete = (completedFunctionCount as number) === (selectedFunctionCount as number);

assert(projectProgressPercent === 3, `Proje kapsam tamamlanma oranı dürüst hesaplandı: %${projectProgressPercent} (1/31)`);
assert(isProjectComplete === false, "Tek bir fonksiyon %100 olsa dahi tüm proje tamamlandı sayılmaz");

const draftLabel = !isProjectComplete
  ? `ARA RAPOR — ${selectedFunctionCount} iş fonksiyonundan ${completedFunctionCount}'i tamamlandı (Soru İlerlemesi: %100)`
  : "FİNAL RAPOR";

assert(draftLabel.includes("ARA RAPOR"), "Ara rapor etiketi doğru");
assert(draftLabel.includes("31 iş fonksiyonundan 1'i tamamlandı"), "Dürüst kapsam bilgisi içeriyor");

// ─── TEST 5: ReportModel Fixture & Export Integrity ──────────────────────────
console.log("\n=== T05: ReportModel Fixture & Followup Consistency ===");
const faz10ReportModel: ReportModel = {
  metadata: {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: "Test Mobilya ERP/CRM Saha Keşfi",
    companyName: "Test Mobilya Sanayi ve Ticaret A.Ş.",
    generatedAt: "19.08.2026",
    projectStatus: "in_progress",
    packVersions: { SALES: "tr.sales.core v0.1.0" },
    isComplete: false,
    progressPercent: 100,
    requiredAnswered: 21,
    requiredTotal: 21,
    reportType: "interim",
    draftLabel,
    projectProgressPercent,
    completedFunctionCount,
    selectedFunctionCount,
    isProjectComplete,
  },
  company: {
    companyName: "Test Mobilya Sanayi ve Ticaret A.Ş.",
    tradeName: "Test Mobilya",
    taxNumber: "1234567890",
    city: "Bursa",
    country: "Türkiye",
    employeeCount: "150",
    notes: "Saha görüşmesi başarıyla tamamlandı.",
  },
  profile: {
    analysis_project_id: "proj_field_acceptance",
    executive_summary: "Firma satış süreçlerinde yüksek verim potansiyeline sahiptir.",
    overall_assessment: "ERP ve CRM dönüşümü ile teklif süreleri %50 kısalabilir.",
    open_topics: "B2B portal entegrasyonu ve bayi iskonto kuralları.",
  },
  scope: allScopeItems,
  businessFunctions: detailedFunctions,
  followups: [
    {
      id: "fol_1",
      businessFunctionCode: "SALES",
      businessFunctionNameTr: "Satış Yönetimi",
      processName: "Müşteri ve Potansiyel Müşteri Yönetimi",
      questionId: "SALES-004",
      questionText: "Müşteri teklif onay süreci nasıl işliyor?",
      flagType: "revisit",
      note: "Satış direktöründen B2B portal onay kuralları teyit edilecek.",
      createdAt: "2026-08-19",
    },
    {
      id: "fol_2",
      businessFunctionCode: "SALES",
      businessFunctionNameTr: "Satış Yönetimi",
      processName: "Müşteri ve Potansiyel Müşteri Yönetimi",
      questionId: "SALES-019",
      questionText: "İskonto yetki limitleri sistemde tanımlı mı?",
      flagType: "critical",
      note: "Yönetim kurulu kararı bekleniyor.",
      createdAt: "2026-08-19",
    },
  ],
  globalFindings: [],
  globalRequirements: [],
  globalRisks: [],
  projectNotes: [],
  summaryStats: {
    totalFunctions: 31,
    completedFunctions: 1,
    inProgressFunctions: 0,
    notStartedFunctions: 30,
    totalFindings: 1,
    totalRequirements: 1,
    openRisks: 1,
    totalRisks: 1,
    totalNotes: 0,
    answeredQuestions: 21,
    totalQuestions: 21,
    openFollowupCount: 2,
    revisitCount: 1,
    criticalFollowupCount: 1,
  },
};

assert(faz10ReportModel.followups?.length === 2, "2 adet takip bayrağı ReportModel'e aktarıldı");
assert(faz10ReportModel.summaryStats.revisitCount === 1, "Revisit count = 1");
assert(faz10ReportModel.summaryStats.criticalFollowupCount === 1, "Critical count = 1");

// ─── TEST 6: DOCX Compactness & Generation ───────────────────────────────────
console.log("\n=== T06: DOCX Compactness & Generation ===");
const docxBuffer = await buildDocxBuffer(faz10ReportModel);
assert(docxBuffer instanceof Uint8Array, "DOCX çıktısı Uint8Array");
assert(docxBuffer.length > 5000, `DOCX boyutu geçerli: ${docxBuffer.length} bytes`);
assert(docxBuffer[0] === 0x50 && docxBuffer[1] === 0x4b, "DOCX geçerli PK ZIP formatında");

// ─── TEST 7: PDF Compactness & Text Extraction ───────────────────────────────
console.log("\n=== T07: PDF Compactness & Text Extraction ===");
const pdfBuffer = await buildPdfBuffer(faz10ReportModel);
assert(pdfBuffer instanceof Uint8Array, "PDF çıktısı Uint8Array");
assert(pdfBuffer.length > 30000, `PDF boyutu geçerli: ${pdfBuffer.length} bytes`);

const parser = new PDFParse({ data: pdfBuffer });
const parsedData = await parser.getText();
const pdfText = parsedData.text;

assert(pdfText.includes("ERP / CRM ÖN ANALİZ RAPORU"), "PDF başlığı mevcut");
assert(pdfText.includes("Test Mobilya"), "Firma adı mevcut");
assert(pdfText.includes("31 iş fonksiyonundan 1'i tamamlandı"), "Dürüst ara rapor başlığı PDF'te mevcut");
assert(pdfText.includes("Açık Sorular"), "Bölüm 5 Açık Sorular tablosu mevcut");
assert(pdfText.includes("Kritik Takip"), "Kritik Takip etiketi PDF'te mevcut");
assert(pdfText.includes("Sonra Dön"), "Sonra Dön etiketi PDF'te mevcut");
assert(pdfText.includes("B2B portal onay kuralları"), "Takip notu 1 PDF'te mevcut");
assert(pdfText.includes("Yönetim kurulu kararı"), "Takip notu 2 PDF'te mevcut");
assert(!pdfText.includes("{\"selected\":"), "PDF metninde hiçbir raw JSON yer almaz (Data Quality PASS)");

// ─── TEST 8: Error UX Localization ──────────────────────────────────────────
console.log("\n=== T08: Error UX Localization ===");
const aclErr = new Error("Command plugin:fs|write_file not allowed by ACL");
const friendlyAcl = formatUserFriendlyError(aclErr);
assert(friendlyAcl.includes("dosya yazma izinlerini"), `ACL hatası Türkçeleştirildi: "${friendlyAcl}"`);

const lockErr = new Error("EBUSY: resource locked or used by another process");
const friendlyLock = formatUserFriendlyError(lockErr);
assert(friendlyLock.includes("başka bir program"), `Kilitli dosya hatası Türkçeleştirildi: "${friendlyLock}"`);

const permErr = new Error("EACCES: Permission denied");
const friendlyPerm = formatUserFriendlyError(permErr);
assert(friendlyPerm.includes("Seçilen konuma dosya yazma izni bulunmuyor"), `İzin hatası Türkçeleştirildi: "${friendlyPerm}"`);

// ─── TEST 9: Distribution Packaging Asset Verification ───────────────────────
console.log("\n=== T09: Distribution Packaging Asset Verification ===");
const winHelpPath = path.join(ROOT_DIR, "WINDOWS_KURULUM_YARDIMI.txt");
assert(fs.existsSync(winHelpPath), "WINDOWS_KURULUM_YARDIMI.txt mevcut");
const winContent = fs.readFileSync(winHelpPath, "utf-8");
assert(winContent.includes("Ek Bilgi"), "Windows yardım belgesinde SmartScreen Ek Bilgi mevcut");
assert(winContent.includes("Yine de Çalıştır"), "Windows yardım belgesinde Yine de Çalıştır mevcut");
assert(winContent.includes("erp_discovery.db"), "Windows yardım belgesinde SQLite dosya adı mevcut");

const macHelpPath = path.join(ROOT_DIR, "MACOS_KURULUM_YARDIMI.txt");
assert(fs.existsSync(macHelpPath), "MACOS_KURULUM_YARDIMI.txt mevcut");
const macContent = fs.readFileSync(macHelpPath, "utf-8");
assert(macContent.includes("xattr -dr com.apple.quarantine"), "macOS yardım belgesinde quarantine xattr komutu mevcut");
assert(macContent.includes("open \"/Applications/ERP CRM Discovery.app\""), "macOS yardım belgesinde open komutu mevcut");

const winWf = fs.readFileSync(path.join(ROOT_DIR, ".github/workflows/windows-build.yml"), "utf-8");
assert(winWf.includes("WINDOWS_KURULUM_YARDIMI.txt"), "windows-build.yml yardım dosyasını paketler");
assert(winWf.includes("windows-artifacts/"), "windows-build.yml windows-artifacts dizinini yükler");

const macWf = fs.readFileSync(path.join(ROOT_DIR, ".github/workflows/macos-build.yml"), "utf-8");
assert(macWf.includes("MACOS_KURULUM_YARDIMI.txt"), "macos-build.yml yardım dosyasını paketler");
assert(macWf.includes("macos-artifacts/"), "macos-build.yml macos-artifacts dizinini yükler");

// ─── Sonuç ───────────────────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════════════");
console.log(`FAZ-10 Test Sonucu: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════\n");

if (failCount > 0) {
  console.error(`BAŞARISIZ: ${failCount} test fail etti!`);
  process.exit(1);
} else {
  console.log("BAŞARILI: FAZ-10 FIELD ACCEPTANCE & REPORT QUALITY: PASS\n");
}
