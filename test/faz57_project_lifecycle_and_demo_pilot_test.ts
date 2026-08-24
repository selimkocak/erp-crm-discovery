/**
 * ERP CRM Discovery — FAZ-57 Proje Durum Aksiyonu ve Sentetik Kesikli Üretim Pilot Projesi Kabul Testi
 *
 * Test Doğrulamaları:
 * 1. Proje Yaşam Döngüsü: Aktif / Pasif durum geçişleri ve listeleme doğrulaması.
 * 2. Pasife Alırken Verilerin Korunması: Cevaplar, bulgular, gereksinimler, riskler, notlar ve yönetişim kayıtlarının %100 korunması.
 * 3. Yeniden Aktifleştirme ve Veri Bütünlüğü.
 * 4. Kurgusal Kesikli Üretim Pilot Projesi (Marmara Endüstriyel Sistemler A.Ş.):
 *    - >= 16 Aktif İş Fonksiyonu
 *    - >= 80 Gerçekçi Saha Soru Cevabı
 *    - >= 6 Bulgu
 *    - >= 6 Gereksinim
 *    - >= 4 Risk
 *    - >= 6 Proje Notu
 *    - >= 8 Yönetişim Nesnesi
 *    - Veri Sahipliği, Yönetişim Kapsamları ve Özneleri
 *    - >= 4 Yetki Matrisi Kaydı ve >= 2 Efektif Yetki Sapması (Discrepancy)
 *    - >= 2 Onay Limiti
 *    - >= 2 Görevler Ayrılığı (SoD) Çatışma Riski
 * 5. Tekrarlı Demo Oluşturma ve Tekil İsim Türetme: "ERP/CRM Dönüşüm Ön Analiz Pilotu (2)", "(3)"
 * 6. Etik ve Sentetik Veri Güvencesi: Gerçek firma / Tuna Ofis ifadesi içermeme denetimi.
 * 7. Rapor Modeli Entegrasyonu: buildReportModel ile Bölüm 1..6 tam rapor verisi üretimi.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

let Database: any = null;
try {
  Database = (await import("better-sqlite3")).default;
} catch {
  // optional
}

import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import { BUSINESS_FUNCTION_REGISTRY } from "../src/generated/businessFunctions";
import {
  setDbInstanceForTesting,
  resetDbInstanceForTesting,
  createProject,
  getProjects,
  getProjectDetail,
  updateProjectStatus,
  saveAnswer,
  createFinding,
  createRequirement,
  createRisk,
  createProjectNote,
  getSemanticSummaryCounts,
  getGovernanceSummary,
  getGovernanceObjects,
  getGovernanceResponsibilities,
  getGovernanceAuthorizations,
  getGovernanceLimits,
  getGovernanceSodRisks,
} from "../src/db/client";
import {
  createManufacturingDemoProject,
  getUniqueDemoProjectName,
} from "../src/demo/manufacturingPilot";
import { buildReportModel } from "../src/report/builder";

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

function convertSql(sql: string, params: any[] = []): { sql: string; params: any[] } {
  if (!params || params.length === 0) return { sql, params: [] };
  const orderedParams: any[] = [];
  const convertedSql = sql.replace(/\$(\d+)/g, (_match, num) => {
    const idx = parseInt(num, 10) - 1;
    orderedParams.push(params[idx]);
    return "?";
  });
  return { sql: convertedSql, params: orderedParams };
}

interface MockDb {
  execute(query: string, params?: any[]): Promise<{ rowsAffected: number }>;
  select<T = any[]>(query: string, params?: any[]): Promise<T>;
  close(): void;
  raw: any;
}

// In-memory test SQLite DB Wrapper
function createMockDb(): MockDb {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");

  return {
    async execute(query: string, params: any[] = []): Promise<{ rowsAffected: number }> {
      const trimmed = query.trim();
      if (!trimmed) return { rowsAffected: 0 };
      const { sql: convertedSql, params: orderedParams } = convertSql(trimmed, params);
      if (orderedParams.length > 0) {
        const info = sqlite.prepare(convertedSql).run(...orderedParams);
        return { rowsAffected: info.changes };
      } else {
        sqlite.exec(convertedSql);
        return { rowsAffected: 0 };
      }
    },
    async select<T = any[]>(query: string, params: any[] = []): Promise<T> {
      const trimmed = query.trim();
      const { sql: convertedSql, params: orderedParams } = convertSql(trimmed, params);
      if (orderedParams.length > 0) {
        return sqlite.prepare(convertedSql).all(...orderedParams) as T;
      }
      return sqlite.prepare(convertedSql).all() as T;
    },
    close() {
      sqlite.close();
    },
    raw: sqlite,
  };
}

async function runAllMigrations(mockDb: any): Promise<void> {
  await mockDb.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  for (const mig of MIGRATION_DEFINITIONS) {
    const applied = await mockDb.select<any[]>(
      `SELECT version FROM _migrations WHERE version = $1`,
      [mig.version]
    );
    if (applied.length === 0) {
      for (const statement of mig.sql) {
        await mockDb.execute(statement);
      }
      await mockDb.execute(
        `INSERT INTO _migrations (version, name, applied_at) VALUES ($1, $2, $3)`,
        [mig.version, mig.description, new Date().toISOString()]
      );
    }
  }

  // Seed business functions
  for (const bf of BUSINESS_FUNCTION_REGISTRY) {
    const id = `bf_${bf.code.toLowerCase()}`;
    await mockDb.execute(
      `INSERT OR IGNORE INTO business_functions (id, code, name_tr, name_en, category, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        bf.code,
        bf.name_tr,
        bf.name_en,
        bf.category_tr,
        bf.sort_order,
        bf.is_active ? 1 : 0,
      ]
    );
  }
}

async function runTests() {
  console.log("\n======================================================================");
  console.log("FAZ-57 — Proje Durum Aksiyonu ve Sentetik Kesikli Üretim Pilot Testi");
  console.log("======================================================================\n");

  const mockDb = createMockDb();
  setDbInstanceForTesting(mockDb);

  try {
    // ------------------------------------------------------------------
    // TEST 1: Veritabanı ve Şema Başlatma
    // ------------------------------------------------------------------
    console.log("--- 1. Veritabanı ve Migrasyon Başlatma ---");
    await runAllMigrations(mockDb);

    const tables = await mockDb.select<{ name: string }[]>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
    );
    assert(tables.length >= 25, `Tüm tablolar (Migration 12 dahil) oluşturuldu: ${tables.length} tablo`);

    // ------------------------------------------------------------------
    // TEST 2: Proje Yaşam Döngüsü (Aktif / Pasif Geçişleri)
    // ------------------------------------------------------------------
    console.log("\n--- 2. Proje Yaşam Döngüsü ve Aktif/Pasif Geçişleri ---");
    const projId1 = await createProject({
      projectName: "Yaşam Döngüsü Test Projesi",
      company: {
        company_name: "Test A.Ş.",
        city: "İstanbul",
        country: "Türkiye",
      },
      selectedFunctionIds: ["bf_sales", "bf_procurement"],
    });

    let projectsList = await getProjects();
    const p1Initial = projectsList.find((p) => p.id === projId1);
    assert(p1Initial?.status === "active", "Yeni oluşturulan proje varsayılan olarak 'active' durumdadır.");

    // Pasife Al
    await updateProjectStatus(projId1, "passive");
    projectsList = await getProjects();
    const p1Passive = projectsList.find((p) => p.id === projId1);
    assert(p1Passive?.status === "passive", "updateProjectStatus ile proje durumu 'passive' oldu.");

    // Tekrar Aktifleştir
    await updateProjectStatus(projId1, "active");
    projectsList = await getProjects();
    const p1Reactivated = projectsList.find((p) => p.id === projId1);
    assert(p1Reactivated?.status === "active", "Proje başarıyla yeniden 'active' duruma getirildi.");

    // ------------------------------------------------------------------
    // TEST 3: Pasife Alırken Verilerin %100 Korunması
    // ------------------------------------------------------------------
    console.log("\n--- 3. Pasife Alırken Verilerin Korunması ---");
    // Çalışma verileri ekle
    await saveAnswer(projId1, "SALES", "tr.sales.core", "0.1.0", "SALES-001", { selected: ["direct_b2b"] }, undefined, "Toplantı notu");
    await createFinding({ analysis_project_id: projId1, business_function_code: "SALES", question_id: null, title: "Kritik Fiyatlama Bulgusu", description: "Açıklama", priority: "critical", status: "open" });
    await createRequirement({ analysis_project_id: projId1, business_function_code: "SALES", question_id: null, title: "Kapsamlı ERP İhtiyacı", description: "Açıklama", priority: "critical", status: "draft" });
    await createRisk({ analysis_project_id: projId1, business_function_code: "SALES", question_id: null, title: "Tedarik Gecikme Riski", description: "Açıklama", impact: "critical", probability: "high", mitigation_note: null, status: "open" });
    await createProjectNote({ analysis_project_id: projId1, business_function_code: "SALES", question_id: null, note: "Önemli saha notu" });

    // Pasife Al
    await updateProjectStatus(projId1, "passive");

    // Doğrula: Tüm veriler aynen duruyor mu?
    const pDetailPassive = await getProjectDetail(projId1);
    assert(pDetailPassive?.project.status === "passive", "Proje detayı pasif durumunu döndürüyor.");
    assert(pDetailPassive?.functions.length === 2, "Proje kapsamındaki fonksiyonlar korundu.");

    const semanticCounts = await getSemanticSummaryCounts(projId1);
    assert(semanticCounts.findingCount === 1, "Bulgular eksiksiz korundu (1).");
    assert(semanticCounts.requirementCount === 1, "Gereksinimler eksiksiz korundu (1).");
    assert(semanticCounts.totalRiskCount === 1, "Riskler eksiksiz korundu (1).");
    assert(semanticCounts.noteCount === 1, "Proje notları eksiksiz korundu (1).");

    const answers: any[] = await mockDb.select(
      `SELECT * FROM question_answers WHERE analysis_project_id = $1`,
      [projId1]
    );
    assert(answers.length === 1 && answers[0].question_id === "SALES-001", "Soru cevapları %100 korundu.");

    // ------------------------------------------------------------------
    // TEST 4: Kurgusal Kesikli Üretim Pilot Projesi (Marmara Endüstriyel Sistemler A.Ş.)
    // ------------------------------------------------------------------
    console.log("\n--- 4. Kurgusal Kesikli Üretim Pilot Projesi Oluşturma ---");
    const demoResult = await createManufacturingDemoProject();
    const demoId = demoResult.projectId;

    assert(!!demoId, `Demo proje başarıyla oluşturuldu (ID: ${demoId})`);
    assert(demoResult.projectName === "ERP/CRM Dönüşüm Ön Analiz Pilotu", `Demo proje adı doğru: ${demoResult.projectName}`);

    // Firma Profili Kontrolü
    const demoDetail = await getProjectDetail(demoId);
    assert(demoDetail?.company.company_name === "Marmara Endüstriyel Sistemler A.Ş.", "Firma adı: Marmara Endüstriyel Sistemler A.Ş.");
    assert(demoDetail?.company.business_sector === "Endüstriyel Makine ve Ekipman Üretimi", "Sektör: Endüstriyel Makine ve Ekipman Üretimi");
    assert(demoDetail?.company.city === "Bursa", "Lokasyon: Bursa");
    assert(demoDetail?.company.has_branches === "yes" && demoDetail.company.branch_count === 3, "3 Şube / Lokasyon");
    assert(demoDetail?.company.employee_count === "251_500", "Çalışan aralığı: 251-500");

    // İş Fonksiyonları Sayısı (En az 16)
    const demoFunctions = demoDetail?.functions || [];
    assert(demoFunctions.length >= 16, `Aktif iş fonksiyonu sayısı >= 16 (Gerçek: ${demoFunctions.length})`);

    // Soru Cevapları Sayısı (En az 80)
    const demoAnswers = await mockDb.select<any[]>(
      `SELECT * FROM question_answers WHERE analysis_project_id = $1`,
      [demoId]
    );
    assert(demoAnswers.length >= 80, `Gerçekçi soru cevabı sayısı >= 80 (Gerçek: ${demoAnswers.length})`);

    // Semantik Kayıtlar Kontrolü
    const demoSemantic = await getSemanticSummaryCounts(demoId);
    assert(demoSemantic.findingCount >= 6, `Bulgu sayısı >= 6 (Gerçek: ${demoSemantic.findingCount})`);
    assert(demoSemantic.requirementCount >= 6, `Gereksinim sayısı >= 6 (Gerçek: ${demoSemantic.requirementCount})`);
    assert(demoSemantic.totalRiskCount >= 4, `Risk sayısı >= 4 (Gerçek: ${demoSemantic.totalRiskCount})`);
    assert(demoSemantic.noteCount >= 6, `Proje notu sayısı >= 6 (Gerçek: ${demoSemantic.noteCount})`);

    // Takip Bayrakları Kontrolü
    const demoFollowups = await mockDb.select<any[]>(
      `SELECT * FROM question_followups WHERE analysis_project_id = $1`,
      [demoId]
    );
    assert(demoFollowups.length >= 2, `Takip bayrağı sayısı >= 2 (Gerçek: ${demoFollowups.length})`);

    // Yönetişim Katmanı Kontrolü
    const govSummary = await getGovernanceSummary(demoId);
    assert(govSummary.totalObjects >= 8, `Yönetişim nesnesi sayısı >= 8 (Gerçek: ${govSummary.totalObjects})`);
    assert(govSummary.totalSubjects >= 8, `Yönetişim öznesi (departman/rol) sayısı >= 8 (Gerçek: ${govSummary.totalSubjects})`);
    assert(govSummary.totalScopes >= 3, `Yönetişim kapsamı (şubeler) sayısı >= 3 (Gerçek: ${govSummary.totalScopes})`);

    const respRows = await mockDb.select<[{ c: number }]>(
      `SELECT count(*) as c FROM governance_responsibilities WHERE analysis_project_id = $1`,
      [demoId]
    );
    const respCount = respRows[0]?.c || 0;
    assert(respCount >= 8, `Sorumluluk atamaları sayısı >= 8 (Gerçek: ${respCount})`);
    assert(govSummary.totalAuthorizations >= 4, `Yetki matrisi kaydı sayısı >= 4 (Gerçek: ${govSummary.totalAuthorizations})`);
    assert(govSummary.discrepancyCount >= 2, `Yetki sapması (discrepancy) sayısı >= 2 (Gerçek: ${govSummary.discrepancyCount})`);
    assert(govSummary.totalLimits >= 2, `Onay limiti sayısı >= 2 (Gerçek: ${govSummary.totalLimits})`);
    assert(govSummary.totalSodRisks >= 2, `Görevler Ayrılığı (SoD) riski sayısı >= 2 (Gerçek: ${govSummary.totalSodRisks})`);

    // ------------------------------------------------------------------
    // TEST 5: Tekrarlı Demo Oluşturmada Otomatik Tekil İsim
    // ------------------------------------------------------------------
    console.log("\n--- 5. Tekrarlı Demo Oluşturma ve Tekil İsimlendirme ---");
    const demoResult2 = await createManufacturingDemoProject();
    assert(
      demoResult2.projectName === "ERP/CRM Dönüşüm Ön Analiz Pilotu (2)",
      `İkinci oluşturulan demo proje adı '(2)' ile tekilleştirildi: ${demoResult2.projectName}`
    );

    const demoResult3 = await createManufacturingDemoProject();
    assert(
      demoResult3.projectName === "ERP/CRM Dönüşüm Ön Analiz Pilotu (3)",
      `Üçüncü oluşturulan demo proje adı '(3)' ile tekilleştirildi: ${demoResult3.projectName}`
    );

    // ------------------------------------------------------------------
    // TEST 6: Etik ve Sentetik Veri Doğrulaması (Gerçek Veri / Tuna İzolasyonu)
    // ------------------------------------------------------------------
    console.log("\n--- 6. Etik ve Sentetik Veri Güvencesi (Yasaklı Kelime Denetimi) ---");
    const allDbText = await mockDb.select<any[]>(`
      SELECT company_name, trade_name, notes FROM company_profiles
      UNION ALL
      SELECT name, '', '' FROM analysis_projects
      UNION ALL
      SELECT title, description, '' FROM analysis_findings
      UNION ALL
      SELECT title, description, '' FROM analysis_requirements
      UNION ALL
      SELECT title, description, mitigation_note FROM analysis_risks
      UNION ALL
      SELECT note, '', '' FROM project_notes
      UNION ALL
      SELECT answer_data, '', '' FROM question_answers
    `);

    const joinedText = JSON.stringify(allDbText).toLowerCase();
    const containsTuna = joinedText.includes("tuna");
    const containsOfis = joinedText.includes("tuna ofis");

    assert(!containsTuna, "Veritabanında hiçbir 'Tuna' ifadesi bulunmamaktadır.");
    assert(!containsOfis, "Veritabanında hiçbir 'Tuna Ofis' ifadesi bulunmamaktadır.");

    // ------------------------------------------------------------------
    // TEST 7: Rapor Modeli Entegrasyonu (ReportModel)
    // ------------------------------------------------------------------
    console.log("\n--- 7. Rapor Modeli ve Export Entegrasyonu ---");
    const reportModel = await buildReportModel(demoId);
    assert(reportModel.metadata.projectName === "ERP/CRM Dönüşüm Ön Analiz Pilotu", "Rapor modeli proje adını doğru eşleştirdi.");
    assert(reportModel.company.companyName === "Marmara Endüstriyel Sistemler A.Ş.", "Rapor modeli firma adını doğru eşleştirdi.");
    assert(reportModel.businessFunctions.length >= 16, `Rapor modeli fonksiyonları >= 16 (${reportModel.businessFunctions.length})`);
    assert(reportModel.summaryStats.totalQuestions >= 80, `Rapor soru sayısı >= 80 (${reportModel.summaryStats.totalQuestions})`);
    assert(reportModel.summaryStats.totalFindings >= 6, `Rapor toplam bulgular >= 6 (${reportModel.summaryStats.totalFindings})`);
    assert(reportModel.summaryStats.totalRequirements >= 6, `Rapor toplam gereksinimler >= 6 (${reportModel.summaryStats.totalRequirements})`);
    assert(reportModel.summaryStats.totalRisks >= 4, `Rapor toplam riskler >= 4 (${reportModel.summaryStats.totalRisks})`);
    assert(reportModel.projectNotes.length >= 6, `Rapor proje notları >= 6 (${reportModel.projectNotes.length})`);
    assert((reportModel.followups?.length || 0) >= 2, `Rapor Bölüm 5 açık konular >= 2 (${reportModel.followups?.length || 0})`);

    // ------------------------------------------------------------------
    // ÖZET VE SONUÇ
    // ------------------------------------------------------------------
    console.log("\n======================================================================");
    console.log(`FAZ-57 KABUL TESTİ SONUCU: ${passCount} PASS / ${failCount} FAIL`);
    console.log("======================================================================\n");

    if (failCount > 0) {
      process.exit(1);
    }
  } finally {
    resetDbInstanceForTesting();
    mockDb.close();
  }
}

runTests().catch((err) => {
  console.error("Test çalıştırma hatası:", err);
  process.exit(1);
});
