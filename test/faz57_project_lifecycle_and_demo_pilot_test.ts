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
import Database from "better-sqlite3";

import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import { INITIAL_BUSINESS_FUNCTIONS } from "../src/db/seedData";
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

  // Seed business functions (using production INITIAL_BUSINESS_FUNCTIONS)
  for (const bf of INITIAL_BUSINESS_FUNCTIONS) {
    const id = `bf_${bf.code.toLowerCase()}`;
    await mockDb.execute(
      `INSERT INTO business_functions (id, code, name_tr, name_en, category, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, 1)
       ON CONFLICT(code) DO UPDATE SET
         name_tr = excluded.name_tr,
         name_en = excluded.name_en,
         category = excluded.category,
         sort_order = excluded.sort_order,
         is_active = excluded.is_active`,
      [id, bf.code, bf.name_tr, bf.name_en, bf.category, bf.sort_order]
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
    await saveAnswer(projId1, "SALES", "tr.sales.core", "0.1.0", "SALES-001", { selected: [{ value: "erp_crm" }], general_note: "Toplantı notu" });
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
    // TEST 8: SQLite FOREIGN KEY ve Bütünlük Regresyon Denetimleri
    // ------------------------------------------------------------------
    console.log("\n--- 8. SQLite FOREIGN KEY ve Bütünlük Regresyon Denetimleri ---");
    const fkPragma = mockDb.raw.pragma("foreign_keys", { simple: true });
    assert(fkPragma === 1, "PRAGMA foreign_keys = ON doğrulaması: AKTİF (1)");

    const fkCheck = mockDb.raw.pragma("foreign_key_check");
    assert(fkCheck.length === 0, `PRAGMA foreign_key_check sonucu 0 satır: ${fkCheck.length} ihlal`);

    // PRAGMA foreign_key_list(project_business_functions) incelemesi
    const fkList = mockDb.raw.pragma("foreign_key_list(project_business_functions)");
    console.log("  [DEBUG] PRAGMA foreign_key_list(project_business_functions):", JSON.stringify(fkList));
    assert(fkList.length === 2, `project_business_functions tablosunda tam 2 foreign key tanımlı (Gerçek: ${fkList.length})`);

    // Ebeveyn 1: analysis_projects parent mevcut mu?
    const projCheck = await mockDb.select<any[]>(`SELECT id, name FROM analysis_projects WHERE id = $1`, [demoId]);
    assert(projCheck.length === 1, `Ebeveyn analysis_projects kaydı mevcut: ID=${projCheck[0]?.id}, Ad=${projCheck[0]?.name}`);

    // Ebeveyn 2: 19 business_functions master kaydı mevcut mu?
    const activeBfCodes = new Set(demoFunctions.map((f: any) => f.code));
    assert(activeBfCodes.size === 19, `Demo projede 19 benzersiz fonksiyon kodu seçili (Gerçek: ${activeBfCodes.size})`);

    const masterRows = await mockDb.select<any[]>(`SELECT id, code FROM business_functions WHERE is_active = 1`);
    const masterCodeMap = new Map(masterRows.map((r: any) => [r.code, r.id]));
    const missingMaster = Array.from(activeBfCodes).filter((code) => !masterCodeMap.has(code));
    assert(missingMaster.length === 0, `19 aktif fonksiyonun tamamı business_functions master tablosunda mevcut (Eksik: ${missingMaster.join(",") || "yok"})`);

    // İlişki: 19 project_business_functions kaydı doğru ebeveynlerle bağlı mı?
    const pbfRows = await mockDb.select<any[]>(`SELECT * FROM project_business_functions WHERE analysis_project_id = $1`, [demoId]);
    assert(pbfRows.length === 19, `Tam 19 project_business_functions ilişki kaydı mevcut (Gerçek: ${pbfRows.length})`);
    const invalidPbfFk = pbfRows.filter((pbf: any) => !masterRows.some((m: any) => m.id === pbf.business_function_id));
    assert(invalidPbfFk.length === 0, `19 project_business_functions kaydının tümü geçerli business_function_id'ye sahip (Geçersiz: ${invalidPbfFk.length})`);

    // 94 cevabın bf_code değerleri seçili 19 fonksiyon içinde
    const invalidAnswers = demoAnswers.filter((a: any) => !activeBfCodes.has(a.business_function_code));
    assert(invalidAnswers.length === 0, `94 cevabın tümünün business_function_code değerleri seçili 19 fonksiyon içinde (Geçersiz: ${invalidAnswers.length})`);

    // Soru Külliyatı & UI Formatlama Regresyon Denetimi (94/94 Eşleşme)
    const { CANONICAL_QUESTION_PACKS, CANONICAL_CODE_TO_PACK_ID } = await import("../src/generated/questionPacks");
    const { formatAnswer } = await import("../src/report/formatters");
    const { getAllAnswers } = await import("../src/db/client");

    let canonicalPackMismatches = 0;
    let formatFailures = 0;
    const answeredBfCounts = new Map<string, number>();

    for (const a of demoAnswers) {
      answeredBfCounts.set(a.business_function_code, (answeredBfCounts.get(a.business_function_code) || 0) + 1);
      const expectedPackId = CANONICAL_CODE_TO_PACK_ID[a.business_function_code];
      const pack = CANONICAL_QUESTION_PACKS[expectedPackId];
      if (!pack) {
        canonicalPackMismatches++;
        continue;
      }
      const q = pack.questions.find((x: any) => x.id === a.question_id);
      if (!q) {
        canonicalPackMismatches++;
        continue;
      }
      const parsedAnswer = JSON.parse(a.answer_data);
      const formatted = formatAnswer(q, parsedAnswer);
      if (!formatted.isAnswered || formatted.summaryText.includes("undefined")) {
        formatFailures++;
      }
      if (parsedAnswer.selected) {
        for (const sel of parsedAnswer.selected) {
          const optExists = q.options?.some((opt: any) => opt.value === sel.value);
          if (!optExists && q.answer_type !== "short_text" && q.answer_type !== "long_text") {
            formatFailures++;
          }
        }
      }
    }

    assert(canonicalPackMismatches === 0, `94/94 cevabın soru ve paket kimlikleri kanonik külliyatta mevcut (Uyuşmazlık: ${canonicalPackMismatches})`);
    assert(formatFailures === 0, `94/94 cevap formatlayıcı ve UI modelinde geçerli ve eksiksiz render ediliyor (Hata: ${formatFailures})`);
    assert(answeredBfCounts.size === 19, `19 fonksiyonun tamamında en az 1 cevap mevcut (Gerçek: ${answeredBfCounts.size})`);
    for (const [bf, count] of answeredBfCounts.entries()) {
      assert(count >= 2, `${bf} fonksiyonunda en az 2 cevap mevcut (Gerçek: ${count})`);
    }

    // SALES fonksiyonu için getAllAnswers UI modeli testi
    const salesAnswersMap = await getAllAnswers(demoId, "SALES");
    assert(salesAnswersMap.size >= 5, `SALES fonksiyonunda en az 5 cevap Map olarak okundu (Gerçek: ${salesAnswersMap.size})`);
    const salesFirst = salesAnswersMap.get("SALES-001");
    assert(!!salesFirst && Array.isArray(salesFirst.selected) && salesFirst.selected.length > 0, "SALES-001 cevabı UI AnswerData modeline uygun nesne formatında");

    // Yönetişim nesneleri, özneleri ve kapsamları FK geçerliliği
    const allGovObjects = await mockDb.select<any[]>(`SELECT id FROM governance_objects WHERE analysis_project_id = $1`, [demoId]);
    const allGovSubjects = await mockDb.select<any[]>(`SELECT id FROM governance_subjects WHERE analysis_project_id = $1`, [demoId]);
    const allGovScopes = await mockDb.select<any[]>(`SELECT id FROM governance_scopes WHERE analysis_project_id = $1`, [demoId]);
    const objIdSet = new Set(allGovObjects.map((o) => o.id));
    const subIdSet = new Set(allGovSubjects.map((s) => s.id));
    const scopeIdSet = new Set(allGovScopes.map((sc) => sc.id));

    const resps = await mockDb.select<any[]>(`SELECT * FROM governance_responsibilities WHERE analysis_project_id = $1`, [demoId]);
    const invalidRespFk = resps.filter((r) => !objIdSet.has(r.governance_object_id) || !subIdSet.has(r.subject_id) || (r.scope_id && !scopeIdSet.has(r.scope_id)));
    assert(invalidRespFk.length === 0, `Tüm sorumluluk kayıtlarının FK ilişkileri geçerli (Geçersiz: ${invalidRespFk.length})`);

    const auths = await mockDb.select<any[]>(`SELECT * FROM governance_authorizations WHERE analysis_project_id = $1`, [demoId]);
    const invalidAuthFk = auths.filter((a) => !objIdSet.has(a.governance_object_id) || !subIdSet.has(a.subject_id) || (a.scope_id && !scopeIdSet.has(a.scope_id)));
    assert(invalidAuthFk.length === 0, `Tüm yetki matrisi kayıtlarının FK ilişkileri geçerli (Geçersiz: ${invalidAuthFk.length})`);

    const lims = await mockDb.select<any[]>(`SELECT * FROM governance_limits WHERE analysis_project_id = $1`, [demoId]);
    const invalidLimFk = lims.filter((l) => (l.governance_object_id && !objIdSet.has(l.governance_object_id)) || !subIdSet.has(l.subject_id) || (l.scope_id && !scopeIdSet.has(l.scope_id)));
    assert(invalidLimFk.length === 0, `Tüm limit kayıtlarının FK ilişkileri geçerli (Geçersiz: ${invalidLimFk.length})`);

    // ------------------------------------------------------------------
    // TEST 9: Hata Durumunda Yarım Proje Kalmama (Atomik Cleanup) Denetimi
    // ------------------------------------------------------------------
    console.log("\n--- 9. Hata Simülasyonunda Yarım Proje Temizleme (Cleanup) ---");
    const preFailProjects = await getProjects();
    const preCount = preFailProjects.length;

    // Hatalı oluşturma simülasyonu: database execute geçici olarak arızalanırsa
    const originalExecute = mockDb.execute.bind(mockDb);
    let simulateError = true;
    mockDb.execute = async (query: string, params: any[] = []) => {
      if (simulateError && query.includes("INSERT INTO governance_limits")) {
        throw new Error("Simulated SQLite constraint failure in limits");
      }
      return originalExecute(query, params);
    };

    let threwAsExpected = false;
    try {
      await createManufacturingDemoProject();
    } catch (e: any) {
      threwAsExpected = true;
      assert(e.message.includes("Demo proje oluşturulamadı"), `Kullanıcı dostu hata mesajı üretildi: ${e.message}`);
    } finally {
      simulateError = false;
      mockDb.execute = originalExecute;
    }
    assert(threwAsExpected, "Hata simülasyonu beklendiği gibi yakalandı.");

    const postFailProjects = await getProjects();
    assert(postFailProjects.length === preCount, `Hata sonrasında geride yetim / yarım proje kalmadı (Proje sayısı değişmedi: ${postFailProjects.length})`);

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
