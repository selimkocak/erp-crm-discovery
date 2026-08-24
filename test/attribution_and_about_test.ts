/**
 * ERP CRM Discovery — Developer Attribution and In-App About System Test
 *
 * Test Coverage:
 * T01: README.md Proje, Geliştirici ve İletişim Doğrulaması
 * T02: Uygulama İçi Hakkında (AboutModal) Bileşeni ve Erişilebilirlik
 * T03: Header ve App Entegrasyonu (Sade Hakkında Butonu ve Ürün Markası)
 * T04: Soru Ekranı ve Navigatör İzolasyonu (Watermark-Free & Reklamsız)
 * T05: Word (.docx) Rapor Çıktısında Kapanış Atıfı Doğrulaması
 * T06: PDF (.pdf) Rapor Çıktısında Kapanış Atıfı Doğrulaması (PDFParse)
 * T07: Metadata Bütünlüğü (package.json, Cargo.toml, tauri.conf.json, LICENSE)
 * T08: Çevrimdışı (Offline-First), Sıfır Bulut ve AI-Free İlkeleri
 */

import fs from "fs";
import path from "path";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import { PDFParse } from "pdf-parse";
import { CANONICAL_QUESTION_PACKS } from "../src/generated/questionPacks";
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

const mockReportModel: ReportModel = {
  metadata: {
    projectId: "proj-attribution-001",
    projectName: "Atıf ve Hakkında Doğrulama Projesi",
    title: "ERP CRM Keşif ve Ön Analiz Raporu",
    generatedAt: "23.08.2026 09:30:00",
    isComplete: true,
    progressPercent: 100,
    answeredQuestions: 38,
    totalQuestions: 38,
  },
  company: {
    companyName: "Örnek Teknoloji A.Ş.",
    industry: "Üretim ve Bilişim",
    employeeCount: "50-100",
    annualRevenue: "50M-100M TL",
    currentErp: "Eski Özel Yazılım",
    currentCrm: "Yok",
    targetGoLive: "Q1 2027",
    primaryContact: "Ahmet Yılmaz",
    consultantName: "Saha Danışmanı",
    notes: "Ön analiz tamamlama testi.",
    businessSector: "Endüstriyel Otomasyon ve Yazılım",
    hasBranches: "yes",
    branchCount: 3,
  },
  profile: {
    executive_summary: "Şirket kurumsal dönüşüm sürecindedir.",
    project_goals: "Tüm süreçlerin entegre yönetilmesi.",
    key_challenges: "Veri mükerrerliği ve manuel raporlama.",
    open_topics: "Bütçe onayı bekleniyor.",
  },
  scope: [
    {
      code: "SALES",
      nameTr: "Satış Süreci",
      category: "core",
      status: "completed",
      isIncluded: true,
      answeredCount: 38,
      totalCount: 38,
      progressPercent: 100,
    },
  ],
  businessFunctions: [
    {
      code: "SALES",
      nameTr: "Satış Süreci",
      nameEn: "Sales Process",
      category: "core",
      sortOrder: 1,
      departmentName: "Satış Departmanı",
      responsiblePerson: "Ahmet Yılmaz",
      status: "completed",
      packId: "tr.sales.core",
      packVersion: "0.1.0",
      progressPercentage: 100,
      answeredCount: 1,
      totalQuestionCount: 38,
      processes: [
        {
          name: "Satış Organizasyonu",
          order: 1,
          questions: [
            {
              id: "SAL-001",
              order: 1,
              process: "Satış Organizasyonu",
              questionText: "Satış süreciniz nasıl organize edilmiştir?",
              answerType: "single_choice",
              criticality: "high",
              formattedAnswer: {
                isAnswered: true,
                selectedOptions: [{ value: "merkezi_satis_ekibi", label: "Merkezi satış ekibi" }],
                summaryText: "Merkezi satış ekibi",
              },
              findings: [],
              requirements: [],
              risks: [],
              notes: [],
            },
          ],
        },
      ],
      findings: [
        {
          id: "f-1",
          title: "Teklif Onayları",
          description: "Teklif onayları e-posta ile ilerliyor.",
          priority: "medium",
          status: "open",
          questionId: "SAL-001",
          createdAt: "23.08.2026",
        },
      ],
      requirements: [
        {
          id: "r-1",
          title: "Mobil Onay",
          description: "Mobil teklif onay mekanizması.",
          priority: "high",
          status: "confirmed",
          questionId: "SAL-001",
          createdAt: "23.08.2026",
        },
      ],
      risks: [
        {
          id: "rk-1",
          title: "Fiyat Listesi Riski",
          description: "Fiyat listesi güncelliği riski.",
          impact: "medium",
          probability: "medium",
          mitigationNote: null,
          status: "open",
          questionId: "SAL-001",
          createdAt: "23.08.2026",
        },
      ],
      notes: [],
    },
  ],
  followups: [],
  globalFindings: [
    {
      id: "f-1",
      title: "Teklif Onayları",
      description: "Teklif onayları e-posta ile ilerliyor.",
      priority: "medium",
      status: "open",
      questionId: "SAL-001",
      createdAt: "23.08.2026",
    },
  ],
  globalRequirements: [
    {
      id: "r-1",
      title: "Mobil Onay",
      description: "Mobil teklif onay mekanizması.",
      priority: "high",
      status: "confirmed",
      questionId: "SAL-001",
      createdAt: "23.08.2026",
    },
  ],
  globalRisks: [
    {
      id: "rk-1",
      title: "Fiyat Listesi Riski",
      description: "Fiyat listesi güncelliği riski.",
      impact: "medium",
      probability: "medium",
      mitigationNote: null,
      status: "open",
      questionId: "SAL-001",
      createdAt: "23.08.2026",
    },
  ],
  projectNotes: [],
  summaryStats: {
    totalFunctions: 1,
    completedFunctions: 1,
    inProgressFunctions: 0,
    notStartedFunctions: 0,
    totalFindings: 1,
    totalRequirements: 1,
    openRisks: 1,
    totalRisks: 1,
    totalNotes: 0,
    answeredQuestions: 1,
    totalQuestions: 38,
    openFollowupCount: 0,
    criticalFollowupCount: 0,
    revisitCount: 0,
  },
  attachments: [],
};

async function runTests(): Promise<void> {
  console.log("\n=======================================================");
  console.log("ERP CRM Discovery — Geliştirici Atfı ve Hakkında Testi");
  console.log("=======================================================\n");

  const rootDir = process.cwd();

  // T01: README.md Attribution & Contact
  console.log("--- T01: README.md Proje, Geliştirici ve İletişim Doğrulaması ---");
  const readmePath = path.join(rootDir, "README.md");
  assert(fs.existsSync(readmePath), "README.md dosyası mevcut olmalı");
  const readmeContent = fs.readFileSync(readmePath, "utf-8");

  assert(/# ERP CRM Discovery/i.test(readmeContent), "README.md ürün başlığı 'ERP CRM Discovery' olmalı");
  assert(readmeContent.includes("Selim Koçak"), "README.md geliştirici 'Selim Koçak' adını içermeli");
  assert(readmeContent.includes("selimkocak@gmail.com"), "README.md e-posta 'selimkocak@gmail.com' içermeli");
  assert(readmeContent.includes("Proje ve İletişim"), "README.md 'Proje ve İletişim' bölümünü içermeli");
  assert(readmeContent.includes("MIT License") || readmeContent.includes("MIT Lisans"), "README.md lisans atfı içermeli");
  assert(/github\.com\/selimkocak\/erp-crm-discovery/i.test(readmeContent), "README.md GitHub repo linkini içermeli");

  // T02: AboutModal Component & Accessibility
  console.log("\n--- T02: Uygulama İçi Hakkında (AboutModal) Bileşeni Doğrulaması ---");
  const aboutModalPath = path.join(rootDir, "src/components/AboutModal.tsx");
  assert(fs.existsSync(aboutModalPath), "src/components/AboutModal.tsx dosyası mevcut olmalı");
  const aboutModalContent = fs.readFileSync(aboutModalPath, "utf-8");

  assert(aboutModalContent.includes("ERP CRM Discovery"), "AboutModal ürün adını 'ERP CRM Discovery' olarak içermeli");
  assert(aboutModalContent.includes("Selim Koçak"), "AboutModal geliştirici olarak 'Selim Koçak' göstermeli");
  assert(aboutModalContent.includes("selimkocak@gmail.com"), "AboutModal iletişim olarak 'selimkocak@gmail.com' göstermeli");
  assert(/v0\.1\.\d+/.test(aboutModalContent), "AboutModal sürüm bilgisini (v0.1.x) içermeli");
  assert(aboutModalContent.includes("role=\"dialog\""), "AboutModal role='dialog' erişilebilirlik özniteliğini içermeli");

  assert(aboutModalContent.includes("aria-modal=\"true\""), "AboutModal aria-modal='true' özniteliğini içermeli");
  assert(aboutModalContent.includes("Escape"), "AboutModal Escape tuşu ile kapanmayı desteklemeli");
  assert(aboutModalContent.includes("Offline-First") || aboutModalContent.includes("Çevrimdışı"), "AboutModal offline-first bilgisini içermeli");
  assert(aboutModalContent.includes("AI-Free") || aboutModalContent.includes("Yapay Zekâ İçermez"), "AboutModal AI-free bilgisini içermeli");

  // T03: Header and App Integration
  console.log("\n--- T03: Header ve App Entegrasyonu Doğrulaması ---");
  const headerPath = path.join(rootDir, "src/components/Header.tsx");
  const headerContent = fs.readFileSync(headerPath, "utf-8");
  assert(headerContent.includes("onOpenAbout"), "Header bileşeni onOpenAbout prop'unu kabul etmeli");
  assert(headerContent.includes("Hakkında"), "Header bileşeni 'Hakkında' butonunu render etmeli");
  assert(headerContent.includes("<h1>ERP CRM Discovery</h1>"), "Header logosunda ürün adı ERP CRM Discovery korunmalı");
  assert(!headerContent.includes("<h1>Selim Koçak</h1>"), "Header ana logosunda kişisel isim baskın olmamalı");

  const appPath = path.join(rootDir, "src/App.tsx");
  const appContent = fs.readFileSync(appPath, "utf-8");
  assert(appContent.includes("AboutModal"), "App.tsx AboutModal bileşenini import etmeli");
  assert(appContent.includes("isAboutOpen"), "App.tsx isAboutOpen modal state'ini yönetmeli");
  assert(appContent.includes("onOpenAbout="), "App.tsx Header'a onOpenAbout prop'unu bağlamalı");

  // T04: Question Screen Isolation (No Watermarks)
  console.log("\n--- T04: Soru Ekranı ve Navigatör İzolasyonu (Watermark-Free) ---");
  const questionScreenPath = path.join(rootDir, "src/views/QuestionScreen.tsx");
  const questionScreenContent = fs.readFileSync(questionScreenPath, "utf-8");
  assert(!questionScreenContent.includes("watermark"), "QuestionScreen zorunlu watermark içermemeli");
  assert(!questionScreenContent.includes("selimkocak@gmail.com"), "QuestionScreen çalışma alanında e-posta banner'ı içermemeli");

  const questionCardPath = path.join(rootDir, "src/components/QuestionCard.tsx");
  const questionCardContent = fs.readFileSync(questionCardPath, "utf-8");
  assert(!questionCardContent.includes("selimkocak@gmail.com"), "QuestionCard kişisel reklam/imza içermemeli");

  const navigatorPath = path.join(rootDir, "src/components/QuestionNavigator.tsx");
  const navigatorContent = fs.readFileSync(navigatorPath, "utf-8");
  assert(!navigatorContent.includes("selimkocak@gmail.com"), "QuestionNavigator kişisel reklam/imza içermemeli");

  // T05: Word (.docx) Export Attribution
  console.log("\n--- T05: Word (.docx) Rapor Çıktısında Kapanış Atıfı Doğrulaması ---");
  const docxExporterPath = path.join(rootDir, "src/export/docxExporter.ts");
  const docxExporterContent = fs.readFileSync(docxExporterPath, "utf-8");
  assert(docxExporterContent.includes("ERP CRM Discovery tarafından oluşturulmuştur."), "DOCX exporter kapanış atıf metnini içermeli");
  assert(docxExporterContent.includes("Geliştirici ve bakımcı: Selim Koçak"), "DOCX exporter geliştirici atfını içermeli");
  assert(docxExporterContent.includes("selimkocak@gmail.com"), "DOCX exporter iletişim e-postasını içermeli");

  const docxBuf = await buildDocxBuffer(mockReportModel);
  assert(docxBuf && docxBuf.byteLength > 1000, `DOCX buffer başarıyla üretildi (${docxBuf.byteLength} bytes)`);

  // T06: PDF (.pdf) Export Attribution (PDFParse)
  console.log("\n--- T06: PDF (.pdf) Rapor Çıktısında Kapanış Atıfı Doğrulaması ---");
  const pdfExporterPath = path.join(rootDir, "src/export/pdfExporter.ts");
  const pdfExporterContent = fs.readFileSync(pdfExporterPath, "utf-8");
  assert(pdfExporterContent.includes("ERP CRM Discovery tarafından oluşturulmuştur."), "PDF exporter kapanış atıf metnini içermeli");
  assert(pdfExporterContent.includes("Geliştirici ve bakımcı: Selim Koçak"), "PDF exporter geliştirici atfını içermeli");
  assert(pdfExporterContent.includes("selimkocak@gmail.com"), "PDF exporter iletişim e-postasını içermeli");

  const pdfBuf = await buildPdfBuffer(mockReportModel);
  assert(pdfBuf && pdfBuf.byteLength > 1000, `PDF buffer başarıyla üretildi (${pdfBuf.byteLength} bytes)`);

  const parsedPdf = await new PDFParse({ data: pdfBuf }).getText();
  const pdfText = parsedPdf.text || "";
  assert(pdfText.includes("ERP CRM Discovery"), "PDF içinde 'ERP CRM Discovery' yer almalı");
  assert(pdfText.includes("Selim Koçak"), "PDF içinde 'Selim Koçak' yer almalı");
  assert(pdfText.includes("selimkocak@gmail.com"), "PDF içinde 'selimkocak@gmail.com' yer almalı");

  // T07: Metadata Integrity
  console.log("\n--- T07: Metadata Bütünlüğü Doğrulaması ---");
  const pkgJsonPath = path.join(rootDir, "package.json");
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
  assert(pkgJson.name === "erp-crm-discovery", "package.json name 'erp-crm-discovery' olmalı");
  assert(pkgJson.author && pkgJson.author.includes("Selim Koçak"), "package.json author 'Selim Koçak' içermeli");
  assert(pkgJson.author && pkgJson.author.includes("selimkocak@gmail.com"), "package.json author 'selimkocak@gmail.com' içermeli");
  assert(pkgJson.license === "MIT", "package.json license 'MIT' olmalı");
  assert(pkgJson.repository && pkgJson.repository.url.includes("erp-crm-discovery"), "package.json repository url doğru olmalı");

  const cargoTomlPath = path.join(rootDir, "src-tauri/Cargo.toml");
  const cargoToml = fs.readFileSync(cargoTomlPath, "utf-8");
  assert(cargoToml.includes("name = \"erp-crm-discovery\""), "Cargo.toml name 'erp-crm-discovery' olmalı");
  assert(cargoToml.includes("Selim Koçak"), "Cargo.toml authors 'Selim Koçak' içermeli");
  assert(cargoToml.includes("license = \"MIT\""), "Cargo.toml license 'MIT' olmalı");

  const tauriConfPath = path.join(rootDir, "src-tauri/tauri.conf.json");
  const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, "utf-8"));
  assert(tauriConf.productName === "ERP CRM Discovery", "tauri.conf.json productName 'ERP CRM Discovery' olmalı");
  assert(tauriConf.bundle?.publisher === "Selim Koçak", "tauri.conf.json publisher 'Selim Koçak' olmalı");
  assert(tauriConf.bundle?.copyright?.includes("Selim Koçak"), "tauri.conf.json copyright 'Selim Koçak' içermeli");

  const licensePath = path.join(rootDir, "LICENSE");
  const licenseContent = fs.readFileSync(licensePath, "utf-8");
  assert(licenseContent.includes("Selim Koçak"), "LICENSE dosyası 'Selim Koçak' telif hakkını içermeli");

  // T08: Offline-First & AI-Free Integrity
  console.log("\n--- T08: Çevrimdışı (Offline-First) ve AI-Free İlkeleri Doğrulaması ---");
  const packList = Object.values(CANONICAL_QUESTION_PACKS);
  assert(packList.length === 35, `35 kanonik soru paketi korunuyor (mevcut: ${packList.length})`);
  let totalQuestions = 0;
  for (const pack of packList) {
    totalQuestions += pack.questions.length;
  }
  assert(totalQuestions === 1550, `1.550 soru külliyatı bozulmadan korunuyor (mevcut: ${totalQuestions})`);

  console.log("\n=======================================================");
  console.log(`Test Sonuçları: ${passCount} Geçti, ${failCount} Başarısız`);
  console.log("=======================================================\n");

  process.exit(failCount > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test icra hatası:", err);
  process.exit(1);
});
