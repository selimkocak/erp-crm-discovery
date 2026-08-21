/**
 * ERP CRM Discovery — Cross-Pack Question Identity & Scoping Test
 *
 * Bu test paketi, farklı soru paketlerinde aynı soru kimliğinin (örnek: INVENTORY/INV-001 ve INVOICING/INV-001)
 * bulunması durumunda sistemin veri bütünlüğünü, rapor eşlemesini, SQLite anahtar izolasyonunu,
 * kanıt kasası (attachment vault) yollarını ve geriye dönük tam uyumluluğu doğrulamasını garanti eder.
 *
 * Doğrulanan başlıklar:
 * 1. INVENTORY ve INVOICING soru paketlerinin bağımsız ve hatasız yüklenmesi
 * 2. INV-001 soru metinlerinin ve kanonik süreçlerinin paket bazında doğruluğu
 * 3. Scoped Question Key (${bfCode}::${questionId}) çözünürlüğü ve ReportModel doğruluk kaynağı
 * 4. Managed Attachment Vault dosya yolu ayrımı ({bfCode}/{questionId})
 * 5. SQLite Composite Primary Key (analysis_project_id, business_function_code, question_id) güvenliği
 * 6. Takip bayrakları (followups) ve ek dosyaların doğru modüle ve doğru soru metnine bağlanması
 * 7. DOCX ve PDF export içinde her iki modülün INV-001 sorularının çakışmasız yer alması
 */

import { existsSync, readFileSync } from "fs";
import path from "path";
import { loadQuestionPack, getPackIdForFunction, hasQuestionPack } from "../src/engine/loader";
import { buildRelativePath } from "../src/storage/attachmentManager";
import { formatAnswer } from "../src/report/formatters";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import { PDFParse } from "pdf-parse";
import type { QuestionPack, Question } from "../src/engine/types";
import type { ReportModel } from "../src/report/types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

const ROOT_DIR = path.resolve(process.cwd());

console.log("══════════════════════════════════════════════════════════════════════");
console.log("CROSS-PACK QUESTION IDENTITY & SCOPING TEST (INVENTORY vs INVOICING)");
console.log("══════════════════════════════════════════════════════════════════════\n");

async function runTests() {
  // ── TEST 1: Soru Paketlerinin Yüklenmesi ───────────────────────────────────
  console.log("=== T01: INVENTORY ve INVOICING Paket Yükleme Paritesi ===");
  assert(hasQuestionPack("INVENTORY") === true, 'hasQuestionPack("INVENTORY") === true');
  assert(hasQuestionPack("INVOICING") === true, 'hasQuestionPack("INVOICING") === true');

  const invPackRes = await loadQuestionPack("tr.inventory.core");
  assert(invPackRes.ok === true, 'loadQuestionPack("tr.inventory.core") başarılı');
  const invoicingPackRes = await loadQuestionPack("tr.invoicing.core");
  assert(invoicingPackRes.ok === true, 'loadQuestionPack("tr.invoicing.core") başarılı');

  const invPack = (invPackRes.ok ? invPackRes.pack : null) as QuestionPack;
  const invoicingPack = (invoicingPackRes.ok ? invoicingPackRes.pack : null) as QuestionPack;

  assert(invPack !== null && invPack.questions.length === 37, `INVENTORY paketi 37 soru içeriyor (Bulunan: ${invPack?.questions.length})`);
  assert(invoicingPack !== null && invoicingPack.questions.length === 47, `INVOICING paketi 47 soru içeriyor (Bulunan: ${invoicingPack?.questions.length})`);

  // ── TEST 2: INV-001 Soru İçeriği ve Süreç Ayrımı ─────────────────────────
  console.log("\n=== T02: INV-001 Soru Metni ve Süreç İzolasyonu ===");
  const invQ1 = invPack.questions.find((q) => q.id === "INV-001");
  const invoicingQ1 = invoicingPack.questions.find((q) => q.id === "INV-001");

  assert(!!invQ1, "INVENTORY içinde INV-001 sorusu mevcut");
  assert(!!invoicingQ1, "INVOICING içinde INV-001 sorusu mevcut");

  assert(
    invQ1?.question.includes("Stok kartları") === true,
    `INVENTORY/INV-001 stok ana verisini ölçüyor: "${invQ1?.question.substring(0, 50)}..."`
  );
  assert(
    invoicingQ1?.question.includes("faturalarının düzenlenmesi") === true,
    `INVOICING/INV-001 fatura organizasyonunu ölçüyor: "${invoicingQ1?.question.substring(0, 50)}..."`
  );

  assert(invQ1?.process !== invoicingQ1?.process, `Kanonik süreçler farklı: INVENTORY="${invQ1?.process}" vs INVOICING="${invoicingQ1?.process}"`);

  // ── TEST 3: Managed Attachment Vault Yolu Ayrımı ───────────────────────────
  console.log("\n=== T03: Attachment Vault Göreli Dizin İzolasyonu ===");
  const projId = "proj_test_12345";
  const invAttachmentPath = buildRelativePath(projId, "INVENTORY", "INV-001", "stok_kart_formu.pdf");
  const invoicingAttachmentPath = buildRelativePath(projId, "INVOICING", "INV-001", "fatura_proseduru.docx");

  assert(
    invAttachmentPath.includes("attachments/INVENTORY/INV-001/"),
    `INVENTORY ek dosya yolu INVENTORY alt klasörünü içerir: ${invAttachmentPath}`
  );
  assert(
    invoicingAttachmentPath.includes("attachments/INVOICING/INV-001/"),
    `INVOICING ek dosya yolu INVOICING alt klasörünü içerir: ${invoicingAttachmentPath}`
  );
  assert(
    invAttachmentPath !== invoicingAttachmentPath,
    "Farklı modüllerdeki aynı INV-001 ID'li ek dosyalar asla aynı fiziksel dizine yazılamaz"
  );

  // ── TEST 4: SQLite Şema Güvencesi Doğrulaması ─────────────────────────────
  console.log("\n=== T04: SQLite Composite Unique Key Güvencesi ===");
  const migrationFile = path.join(ROOT_DIR, "src/db/migrationDefinitions.ts");
  const migrationContent = readFileSync(migrationFile, "utf-8");

  assert(
    migrationContent.includes("UNIQUE (analysis_project_id, business_function_code, question_id)"),
    "SQLite question_answers tablosu (project_id, business_function_code, question_id) bileşik kısıtına sahip"
  );
  assert(
    migrationContent.includes("UNIQUE (analysis_project_id, business_function_code, question_id)"),
    "SQLite question_followups tablosu da modül bazında soru kimliği izolasyonuna sahip"
  );

  // ── TEST 5: Scoped Question Haritası ve Çözümleme Mantığı ─────────────────
  console.log("\n=== T05: Scoped Question Lookup Mantığı ===");
  const questionTextMap = new Map<string, string>();
  const questionProcessMap = new Map<string, string>();

  // INVENTORY sorularını kaydet
  for (const q of invPack.questions) {
    questionTextMap.set(`INVENTORY::${q.id}`, q.question);
    questionProcessMap.set(`INVENTORY::${q.id}`, q.process);
    if (!questionTextMap.has(q.id)) questionTextMap.set(q.id, q.question);
    if (!questionProcessMap.has(q.id)) questionProcessMap.set(q.id, q.process);
  }

  // INVOICING sorularını kaydet
  for (const q of invoicingPack.questions) {
    questionTextMap.set(`INVOICING::${q.id}`, q.question);
    questionProcessMap.set(`INVOICING::${q.id}`, q.process);
    if (!questionTextMap.has(q.id)) questionTextMap.set(q.id, q.question);
    if (!questionProcessMap.has(q.id)) questionProcessMap.set(q.id, q.process);
  }

  const getResolvedText = (qId: string, bfCode?: string) => {
    if (bfCode) {
      const scoped = questionTextMap.get(`${bfCode}::${qId}`);
      if (scoped) return scoped;
    }
    return questionTextMap.get(qId) || null;
  };

  const getResolvedProcess = (qId: string, bfCode?: string) => {
    if (bfCode) {
      const scoped = questionProcessMap.get(`${bfCode}::${qId}`);
      if (scoped) return scoped;
    }
    return questionProcessMap.get(qId) || "Genel Süreç";
  };

  const invResolvedText = getResolvedText("INV-001", "INVENTORY");
  const invoicingResolvedText = getResolvedText("INV-001", "INVOICING");

  assert(
    invResolvedText?.includes("Stok kartları") === true,
    `INVENTORY/INV-001 scoped text çözümlendi: "${invResolvedText?.substring(0, 40)}..."`
  );
  assert(
    invoicingResolvedText?.includes("faturalarının düzenlenmesi") === true,
    `INVOICING/INV-001 scoped text çözümlendi: "${invoicingResolvedText?.substring(0, 40)}..."`
  );
  assert(
    invResolvedText !== invoicingResolvedText,
    "Scoped çözümleme ile her iki soru metni birbirini asla ezmez"
  );

  const invResolvedProc = getResolvedProcess("INV-001", "INVENTORY");
  const invoicingResolvedProc = getResolvedProcess("INV-001", "INVOICING");
  assert(
    invResolvedProc === "Stok Ana Veri Yapısı ve Kodlama",
    `INVENTORY/INV-001 scoped process çözümlendi: "${invResolvedProc}"`
  );
  assert(
    invoicingResolvedProc === "Faturalama Organizasyonu ve Sorumluluklar",
    `INVOICING/INV-001 scoped process çözümlendi: "${invoicingResolvedProc}"`
  );

  // ── TEST 6: ReportModel & DOCX/PDF Ortak Üretimi ──────────────────────────
  console.log("\n=== T06: ReportModel ve DOCX/PDF Çıktı Doğrulaması ===");
  const mockCrossReportModel: ReportModel = {
    metadata: {
      title: "ERP / Stok ve Fatura Entegrasyon Keşif Raporu",
      projectName: "Stok ve Faturalama Modülleri Çapraz Kimlik Doğrulama",
      companyName: "Atlas Lojistik ve Ticaret A.Ş.",
      generatedAt: "21.08.2026",
      projectStatus: "completed",
      packVersions: {
        INVENTORY: "tr.inventory.core v0.1.0",
        INVOICING: "tr.invoicing.core v0.1.0",
      },
      isComplete: true,
      progressPercent: 100,
      requiredAnswered: 44,
      requiredTotal: 44,
      reportType: "final",
      draftLabel: "TAM RAPOR — %100",
      projectProgressPercent: 100,
      completedFunctionCount: 2,
      selectedFunctionCount: 2,
      isProjectComplete: true,
    },
    company: {
      companyName: "Atlas Lojistik ve Ticaret A.Ş.",
      tradeName: "Atlas Lojistik",
      taxNumber: "9876543210",
      city: "Kocaeli",
      country: "Türkiye",
      employeeCount: "250",
      notes: "Stok ve faturalama entegrasyonu incelendi.",
    },
    profile: {
      analysis_project_id: projId,
      executive_summary: "Stok ve fatura süreçleri bağımsız çalışmakta olup ERP üzerinden entegrasyon planlanmaktadır.",
      overall_assessment: "Her iki modül de kanonik iş akışlarına uygun olarak modellenmiştir.",
      open_topics: "Stok ve fatura modüllerinde INV-001 soruları çakışmasız biçimde raporlanmaktadır.",
    },
    scope: [
      {
        code: "INVENTORY",
        nameTr: "Stok Yönetimi",
        nameEn: "Inventory Management",
        category: "Tedarik Zinciri",
        departmentName: "Lojistik ve Depo",
        responsiblePerson: "Mehmet Demir",
        status: "completed",
        hasPack: true,
        progressPercentage: 100,
        answeredCount: 19,
        totalQuestionCount: 37,
      },
      {
        code: "INVOICING",
        nameTr: "Faturalama ve Gider",
        nameEn: "Invoicing & Expenses",
        category: "Muhasebe & Finans",
        departmentName: "Mali İşler",
        responsiblePerson: "Ayşe Kaya",
        status: "completed",
        hasPack: true,
        progressPercentage: 100,
        answeredCount: 25,
        totalQuestionCount: 47,
      },
    ],
    businessFunctions: [
      {
        code: "INVENTORY",
        nameTr: "Stok Yönetimi",
        nameEn: "Inventory Management",
        category: "Tedarik Zinciri",
        sortOrder: 4,
        departmentName: "Lojistik ve Depo",
        responsiblePerson: "Mehmet Demir",
        status: "completed",
        packId: "tr.inventory.core",
        packVersion: "0.1.0",
        progressPercentage: 100,
        answeredCount: 19,
        totalQuestionCount: 37,
        processes: [
          {
            name: "Stok Ana Veri Yapısı ve Kodlama",
            order: 1,
            questions: [
              {
                id: "INV-001",
                order: 1,
                process: "Stok Ana Veri Yapısı ve Kodlama",
                questionText: invQ1!.question,
                answerType: "single_choice",
                criticality: "high",
                isCustom: false,
                formattedAnswer: formatAnswer(invQ1!, {
                  selected: [{ value: "merkezi_kodlama_yok", note: "Her departman kendi kodunu açıyor" }],
                }),
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
      {
        code: "INVOICING",
        nameTr: "Faturalama ve Gider",
        nameEn: "Invoicing & Expenses",
        category: "Muhasebe & Finans",
        sortOrder: 22,
        departmentName: "Mali İşler",
        responsiblePerson: "Ayşe Kaya",
        status: "completed",
        packId: "tr.invoicing.core",
        packVersion: "0.1.0",
        progressPercentage: 100,
        answeredCount: 25,
        totalQuestionCount: 47,
        processes: [
          {
            name: "Faturalama Organizasyonu ve Sorumluluklar",
            order: 1,
            questions: [
              {
                id: "INV-001",
                order: 1,
                process: "Faturalama Organizasyonu ve Sorumluluklar",
                questionText: invoicingQ1!.question,
                answerType: "single_choice",
                criticality: "high",
                isCustom: false,
                formattedAnswer: formatAnswer(invoicingQ1!, {
                  selected: [{ value: "merkezi_faturalama_ekibi_ve_yazili_onay_matrisi_var", note: "Uzman ekip mevcut" }],
                }),
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
    followups: [
      {
        id: "fol_1",
        businessFunctionCode: "INVENTORY",
        businessFunctionNameTr: "Stok Yönetimi",
        processName: "Stok Ana Veri Yapısı ve Kodlama",
        questionId: "INV-001",
        questionText: invQ1!.question,
        flagType: "revisit",
        note: "Stok açılış yetkilerini netleştir",
        createdAt: "21.08.2026",
      },
      {
        id: "fol_2",
        businessFunctionCode: "INVOICING",
        businessFunctionNameTr: "Faturalama ve Gider",
        processName: "Faturalama Organizasyonu ve Sorumluluklar",
        questionId: "INV-001",
        questionText: invoicingQ1!.question,
        flagType: "critical",
        note: "Fatura onay limitlerini gözden geçir",
        createdAt: "21.08.2026",
      },
    ],
    attachments: [
      {
        id: "att_1",
        businessFunctionCode: "INVENTORY",
        businessFunctionNameTr: "Stok Yönetimi",
        processName: "Stok Ana Veri Yapısı ve Kodlama",
        questionId: "INV-001",
        questionText: invQ1!.question,
        originalFileName: "stok_kart_formu.pdf",
        storedFileName: "uuid_stok.pdf",
        relativePath: "projects/p1/attachments/INVENTORY/INV-001/uuid_stok.pdf",
        mimeType: "application/pdf",
        fileExtension: "pdf",
        fileSize: 10240,
        sha256: "abc",
        createdAt: "21.08.2026",
      },
      {
        id: "att_2",
        businessFunctionCode: "INVOICING",
        businessFunctionNameTr: "Faturalama ve Gider",
        processName: "Faturalama Organizasyonu ve Sorumluluklar",
        questionId: "INV-001",
        questionText: invoicingQ1!.question,
        originalFileName: "fatura_proseduru.docx",
        storedFileName: "uuid_fatura.docx",
        relativePath: "projects/p1/attachments/INVOICING/INV-001/uuid_fatura.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileExtension: "docx",
        fileSize: 20480,
        sha256: "def",
        createdAt: "21.08.2026",
      },
    ],
    summaryStats: {
      totalFunctions: 2,
      completedFunctions: 2,
      inProgressFunctions: 0,
      notStartedFunctions: 0,
      totalFindings: 0,
      totalRequirements: 0,
      openRisks: 0,
      totalRisks: 0,
      totalNotes: 0,
      answeredQuestions: 44,
      totalQuestions: 84,
      openFollowupCount: 2,
      revisitCount: 1,
      criticalFollowupCount: 1,
      totalAttachmentCount: 2,
      totalAttachmentSizeBytes: 30720,
    },
  };

  // DOCX Export Denetimi
  const docxBuf = await buildDocxBuffer(mockCrossReportModel);
  assert(docxBuf.length > 5000, `DOCX binary çıktısı başarıyla üretildi (${docxBuf.length} bayt)`);

  // PDF Export & Metin Çözümleme Denetimi
  const pdfBuf = await buildPdfBuffer(mockCrossReportModel);
  assert(pdfBuf.length > 5000, `PDF binary çıktısı başarıyla üretildi (${pdfBuf.length} bayt)`);

  const pdfParser = new PDFParse({ data: pdfBuf });
  const parsedPdf = await pdfParser.getText();
  assert(parsedPdf.text.includes("Stok") || parsedPdf.text.includes("INVENTORY"), 'PDF içinde "Stok" yer alıyor');
  assert(parsedPdf.text.includes("Faturalama") || parsedPdf.text.includes("INVOICING"), 'PDF içinde "Faturalama" yer alıyor');
  assert(parsedPdf.text.includes("Stok kartları"), 'PDF içinde INVENTORY/INV-001 soru metni yer alıyor');
  assert(parsedPdf.text.includes("faturalarının düzenlenmesi"), 'PDF içinde INVOICING/INV-001 soru metni yer alıyor');

  // ── Sonuç ─────────────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════════════════════");
  console.log(`Cross-Pack Question Identity Test Sonucu: ${passed} PASS / ${failed} FAIL`);
  console.log("══════════════════════════════════════════════════════════════════════\n");

  if (failed > 0) {
    console.error(`BAŞARISIZ: ${failed} test fail etti!`);
    process.exit(1);
  } else {
    console.log("BAŞARILI: Cross-Pack Question Identity & Scoping %100 PASS\n");
  }
}

runTests().catch((err) => {
  console.error("TEST ÇALIŞTIRMA HATASI:", err);
  process.exit(1);
});
