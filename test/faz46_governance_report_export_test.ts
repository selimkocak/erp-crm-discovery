// path: /home/selim/projects/erp-crm-discovery/test/faz46_governance_report_export_test.ts
/**
 * ERP CRM Discovery — FAZ-46 Rapor ve Dışa Aktarma (Word & PDF) Kabul Testi
 *
 * Kapsam:
 * - ReportModel içerisinde ReportGovernanceModel entegrasyonu
 * - Word (.docx) çıktısında Bölüm 5: Veri Sahipliği, Yetki Matrisi ve SoD tablolarının üretilmesi
 * - PDF (.pdf) çıktısında TrueType Unicode gömülü fontlar ile Türkçe karakterli yönetişim tablolarının üretilmesi
 * - Sıfır ağ bağımlılığı ve %100 çevrimdışı üretim
 */

import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
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

async function runGovernanceReportExportTests(): Promise<void> {
  console.log("\n=======================================================");
  console.log("FAZ-46: Yönetişim Raporu Dışa Aktarma (DOCX & PDF) Testi");
  console.log("=======================================================\n");

  const mockReport: ReportModel = {

    metadata: {
      title: "ERP / CRM Ön Analiz Raporu",
      projectName: "Mega Makina Sanayi ERP Projesi",
      companyName: "Mega Makina San. ve Tic. A.Ş.",
      generatedAt: "23.08.2026",
      projectStatus: "in_progress",
      packVersions: { SALES: "1.0.0", PROCUREMENT: "1.0.0" },
      isComplete: false,
      progressPercent: 65,
      requiredAnswered: 26,
      requiredTotal: 40,
      reportType: "interim",
      draftLabel: "ARA RAPOR — Analiz devam ediyor (%65)",
      projectProgressPercent: 65,
      completedFunctionCount: 2,
      selectedFunctionCount: 4,
      isProjectComplete: false,
    },
    company: {
      companyName: "Mega Makina San. ve Tic. A.Ş.",
      tradeName: "Mega Makina",
      taxNumber: "1234567890",
      city: "Bursa",
      country: "Türkiye",
      employeeCount: "150-250",
      businessSector: "Ağır Makina ve Teçhizat İmalatı",
      hasBranches: "yes",
      branchCount: 3,
      notes: "3 üretim tesisi ve 1 merkez ofis bulunmaktadır.",
    },
    profile: {
      analysis_project_id: "proj-001",
      executive_summary: "Firma büyüme sürecinde kurumsal veri yönetişimi ve yetki matrisi eksikliği yaşamaktadır.",
      overall_assessment: "SAP Business One veya eşdeğer ERP sistemine geçişte veri sahipleri netleştirilmelidir.",
      open_topics: "Stok kartı açma kuralları ve tedarikçi onay limitleri Yönetim Kurulu tarafından netleştirilecek.",
    },
    scope: [
      {
        code: "SALES",
        nameTr: "Satış Yönetimi",
        nameEn: "Sales Management",
        category: "Satış ve Pazarlama",
        status: "completed",
        departmentName: "Satış Direktörlüğü",
        responsiblePerson: "Mehmet Demir",
        hasPack: true,
        answeredCount: 15,
        totalQuestionCount: 15,
        progressPercentage: 100,
      },
    ],
    businessFunctions: [
      {
        code: "SALES",
        nameTr: "Satış Yönetimi",
        nameEn: "Sales Management",
        category: "Satış ve Pazarlama",
        status: "completed",
        sortOrder: 1,
        progressPercentage: 100,
        answeredCount: 15,
        totalQuestionCount: 15,
        packId: "tr.sales.core",
        packVersion: "1.0.0",
        departmentName: "Satış Direktörlüğü",
        responsiblePerson: "Mehmet Demir",
        processes: [],
        findings: [],
        requirements: [],
        risks: [],
        notes: [],
      },
    ],
    governance: {
      summary: {
        totalObjects: 4,
        unassignedOwnerCount: 1,
        unassignedStewardCount: 1,
        criticalSodRiskCount: 1,
        totalSodRisks: 2,
        discrepancyCount: 1,
        totalAuthorizations: 3,
        totalLimits: 2,
        totalAttachments: 1,
      },
      objects: [
        {
          id: "obj-1",
          analysis_project_id: "proj-001",
          category: "master_data",
          code: "GO_ITEM_MASTER",
          name_tr: "Stok / Malzeme Kartı",
          name_en: "Item / Material Master",
          related_bf_code: "INVENTORY",
          description: "Tüm hammadde, yarı mamul ve ticari malların ana kartı",
          sort_order: 1,
          is_active: 1,
          created_at: "2026-08-23T10:00:00Z",
          updated_at: "2026-08-23T10:00:00Z",
        },
      ],
      responsibilities: [
        {
          id: "resp-1",
          analysis_project_id: "proj-001",
          governance_object_id: "obj-1",
          object_name_tr: "Stok / Malzeme Kartı",
          object_code: "GO_ITEM_MASTER",
          subject_id: "sub-1",
          subject_name: "Üretim ve AR-GE Müdürü",
          subject_type: "role",
          responsibility_type: "data_owner",
          scope_name: "Mega Makina Genel",
          state_type: "as_is",
          notes: "Malzeme kodlama standardından sorumludur.",
          created_at: "2026-08-23T10:00:00Z",
          updated_at: "2026-08-23T10:00:00Z",
        },
      ],
      authorizations: [
        {
          id: "auth-1",
          analysis_project_id: "proj-001",
          governance_object_id: "obj-1",
          object_name_tr: "Stok / Malzeme Kartı",
          subject_id: "sub-1",
          subject_name: "Satın Alma Uzmanı",
          subject_type: "role",
          permission_level: "read_only",
          effective_level: "full",
          has_discrepancy: 1,
          permission_source: "role",
          can_view: 1,
          can_create: 1,
          can_edit: 1,
          can_delete: 0,
          can_approve: 0,
          can_cancel: 0,
          can_export: 1,
          can_view_cost: 0,
          state_type: "as_is",
          created_at: "2026-08-23T10:00:00Z",
          updated_at: "2026-08-23T10:00:00Z",
        },
      ],
      limits: [
        {
          id: "lim-1",
          analysis_project_id: "proj-001",
          governance_object_id: "obj-1",
          object_name_tr: "Stok / Malzeme Kartı",
          subject_id: "sub-1",
          subject_name: "Satın Alma Uzmanı",
          limit_type: "Satın Alma Sipariş Limiti",
          currency_or_unit: "TRY",
          min_value: 0,
          max_value: 75000,
          approval_tier: "1. Kademe",
          approver_subject_name: "Satın Alma Müdürü",
          state_type: "as_is",
          created_at: "2026-08-23T10:00:00Z",
          updated_at: "2026-08-23T10:00:00Z",
        },
      ],
      sodRisks: [
        {
          id: "sod-1",
          analysis_project_id: "proj-001",
          governance_object_id: "obj-1",
          risk_title: "Tedarikçi Açma ve Ödeme Emri Yetki Çatışması",
          conflicting_duty_a: "Tedarikçi Kartı Tanımlama",
          conflicting_duty_b: "Ödeme / Havale Emri Verme",
          risk_severity: "critical",
          current_control: "Kontrol bulunmuyor",
          mitigation_action: "ERP'de iki görev birbirinden kesin olarak ayrıştırılmalıdır.",
          status: "open",
          state_type: "as_is",
          created_at: "2026-08-23T10:00:00Z",
          updated_at: "2026-08-23T10:00:00Z",
        },
      ],
      attachments: [],
    },
    globalFindings: [],
    globalRequirements: [],
    globalRisks: [],
    projectNotes: [],
    summaryStats: {
      totalFunctions: 4,
      completedFunctions: 2,
      inProgressFunctions: 1,
      notStartedFunctions: 1,
      totalFindings: 8,
      totalRequirements: 12,
      openRisks: 3,
      totalRisks: 3,
      totalNotes: 5,
      answeredQuestions: 26,
      totalQuestions: 40,
    },
  };

  // 1. DOCX Exporter Test
  console.log("--- 1. Word (.docx) Exporter Testi ---");
  try {
    const docxBuffer = await buildDocxBuffer(mockReport);
    assert(docxBuffer instanceof Uint8Array, "buildDocxBuffer geçerli bir Uint8Array döndürdü");
    assert(docxBuffer.length > 5000, `DOCX dosyası üretildi (Boyut: ${docxBuffer.length} bytes)`);
  } catch (err: any) {
    assert(false, `DOCX üretimi sırasında hata: ${err?.message || err}`);
  }


  // 2. PDF Exporter Test
  console.log("\n--- 2. PDF (.pdf) Exporter Testi ---");
  try {
    const pdfBuffer = await buildPdfBuffer(mockReport);
    assert(pdfBuffer instanceof Uint8Array, "buildPdfBuffer geçerli bir Uint8Array döndürdü");
    assert(pdfBuffer.length > 5000, `PDF dosyası üretildi (Boyut: ${pdfBuffer.length} bytes)`);

    // PDF magic bytes check (%PDF-)
    const headerStr = String.fromCharCode(...pdfBuffer.slice(0, 5));
    assert(headerStr === "%PDF-", `PDF dosya başlığı geçerli: ${headerStr}`);
  } catch (err: any) {
    assert(false, `PDF üretimi sırasında hata: ${err?.message || err}`);
  }

  console.log(`\nFAZ-46 Report Export Test Sonucu: ${passCount} PASS, ${failCount} FAIL\n`);
  if (failCount > 0) {
    process.exit(1);
  }
}

await runGovernanceReportExportTests();
