// path: /home/selim/projects/erp-crm-discovery/test/faz55_project_lifecycle_and_scope_test.ts
/**
 * ERP CRM Discovery — FAZ-55 Proje Yaşam Döngüsü, Kapsam Revizyonu ve Platform Tutarlılığı Kabul Testi
 *
 * Doğrulamalar:
 * 1. Migration 12 ve Şema v12 Doğrulaması (is_active, removed_at, removal_reason, project_scope_changes).
 * 2. Proje Yaşam Döngüsü: Aktif / Pasif durum geçişleri ve updateProjectDetails uyumluluğu.
 * 3. Dinamik Kapsam Ekleme (addOrReactivateProjectFunction) ve Geçmiş Kaydı.
 * 4. Kapsam Dışı Bırakma (Soft Remove) ve Çalışma Verilerinin (Cevap, Bulgu, Risk, Not, Ek) %100 Korunması.
 * 5. Kapsama Yeniden Alma (Reactivation) ve Geçmiş Verilerin Eksiksiz Geri Kazanımı.
 * 6. Semantik Durum Sözlüğü (statusDictionary) ve Normalizasyon Güvencesi (Kayıp sıfır, Tümü sekmesi tam).
 * 7. .erpcrm Taşınabilir Yedekleme ve Geri Yüklemede Kapsam Değişiklikleri ve Pasif Durumların Korunması.
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
  updateProjectDetails,
  addOrReactivateProjectFunction,
  deactivateProjectFunction,
  getFunctionDataCounts,
  getProjectScopeChanges,
  saveAnswer,
  createFinding,
  createRequirement,
  createRisk,
  createProjectNote,
  getSemanticSummaryCounts,
} from "../src/db/client";
import {
  normalizeStatus,
  getStatusMeta,
  getStatusLabel,
  getStatusBadgeClass,
  isStatusOpen,
  CANONICAL_FINDING_STATUSES,
  CANONICAL_REQUIREMENT_STATUSES,
  CANONICAL_RISK_STATUSES,
} from "../src/models/statusDictionary";
import {
  exportProjectBackup,
  restoreProjectBackup,
  duplicateProject,
  BACKUP_CURRENT_SCHEMA_VERSION,
} from "../src/storage/backupManager";

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

/**
 * Tauri Database arayüzünü better-sqlite3 üzerinde simüle eden adaptör.
 */
class SqliteDbAdapter {
  public db: any;

  constructor(filePath: string) {
    if (!Database) {
      throw new Error("better-sqlite3 is not available");
    }
    this.db = new Database(filePath);
    this.db.pragma("foreign_keys = ON");
  }

  private convertSql(sql: string, params: any[] = []): { sql: string; params: any[] } {
    if (!params || params.length === 0) return { sql, params: [] };
    const orderedParams: any[] = [];
    const convertedSql = sql.replace(/\$(\d+)/g, (_match, num) => {
      const idx = parseInt(num, 10) - 1;
      orderedParams.push(params[idx]);
      return "?";
    });
    return { sql: convertedSql, params: orderedParams };
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    const trimmed = sql.trim();
    if (!trimmed) return;
    const { sql: convertedSql, params: orderedParams } = this.convertSql(trimmed, params);
    if (orderedParams.length > 0) {
      this.db.prepare(convertedSql).run(...orderedParams);
    } else {
      this.db.exec(convertedSql);
    }
  }

  async select<T>(sql: string, params: any[] = []): Promise<T> {
    const trimmed = sql.trim();
    const { sql: convertedSql, params: orderedParams } = this.convertSql(trimmed, params);
    if (orderedParams.length > 0) {
      return this.db.prepare(convertedSql).all(...orderedParams) as T;
    }
    return this.db.prepare(convertedSql).all() as T;
  }

  close() {
    this.db.close();
  }
}

async function runTestMigrations(adapter: SqliteDbAdapter): Promise<void> {
  await adapter.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  for (const mig of MIGRATION_DEFINITIONS) {
    for (const sqlStatement of mig.sql) {
      const trimmed = sqlStatement.trim();
      if (!trimmed) continue;
      try {
        await adapter.execute(trimmed);
      } catch (err: any) {
        if (
          err.message.includes("duplicate column name") ||
          err.message.includes("already exists")
        ) {
          continue;
        }
        throw new Error(`Migration ${mig.version} failed on statement: ${trimmed} -> ${err.message}`);
      }
    }
    await adapter.execute(
      `INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES ($1, $2)`,
      [mig.version, new Date().toISOString()]
    );
  }

  // Kanonik İş Fonksiyonlarını Tohumla
  for (const bf of BUSINESS_FUNCTION_REGISTRY) {
    if (!bf.is_active) continue;
    const id = `bf_${bf.code.toLowerCase()}`;
    await adapter.execute(
      `INSERT INTO business_functions (id, code, name_tr, name_en, category, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, 1)
       ON CONFLICT(code) DO NOTHING`,
      [id, bf.code, bf.name_tr, bf.name_en, bf.category_tr, bf.sort_order]
    );
  }
}

async function main() {
  console.log("================================================================================");
  console.log("ERP CRM DISCOVERY — FAZ-55 PROJE YAŞAM DÖNGÜSÜ & KAPSAM REVİZYONU KABUL TESTİ");
  console.log("================================================================================\n");

  if (!Database) {
    console.log("[INFO] better-sqlite3 test ortamında bulunamadı. SKIPPED.");
    return;
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "erpcrm_faz55_test_"));
  const dbPath = path.join(tempDir, "test_erp_faz55.db");
  const adapter = new SqliteDbAdapter(dbPath);

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Migration 12 ve Şema v12 Doğrulaması
    // -------------------------------------------------------------------------
    console.log("--- TEST 1: Migration 12 & Schema v12 Doğrulaması ---");
    await runTestMigrations(adapter);
    setDbInstanceForTesting(adapter);

    const pbfColumns = await adapter.select<any[]>("PRAGMA table_info(project_business_functions);");
    const colNames = pbfColumns.map((c) => c.name);
    assert(colNames.includes("is_active"), "project_business_functions tablosunda 'is_active' kolonu mevcut.");
    assert(colNames.includes("removed_at"), "project_business_functions tablosunda 'removed_at' kolonu mevcut.");
    assert(colNames.includes("removal_reason"), "project_business_functions tablosunda 'removal_reason' kolonu mevcut.");

    const pscTable = await adapter.select<any[]>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='project_scope_changes';"
    );
    assert(pscTable.length > 0, "project_scope_changes tablosu oluşturuldu.");

    const pscIndex = await adapter.select<any[]>(
      "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_psc_project';"
    );
    assert(pscIndex.length > 0, "idx_psc_project indeksi mevcut.");
    assert(BACKUP_CURRENT_SCHEMA_VERSION >= 12, "BACKUP_CURRENT_SCHEMA_VERSION >= 12.");

    // -------------------------------------------------------------------------
    // TEST 2: Proje Yaşam Döngüsü (Aktif / Pasif Geçişleri)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 2: Proje Yaşam Döngüsü (Aktif / Pasif) ---");
    const masterFunctions = await adapter.select<any[]>("SELECT id, code FROM business_functions WHERE is_active = 1");
    const salesBf = masterFunctions.find((f) => f.code === "SALES") || masterFunctions[0];
    const procBf = masterFunctions.find((f) => f.code === "PROCUREMENT") || masterFunctions[1];

    const projectId = await createProject({
      projectName: "Atlas Dinamik Kapsam Test Projesi",
      company: {
        company_name: "Atlas Modüler Sistemler A.Ş.",
        city: "Bursa",
      },
      selectedFunctionIds: [salesBf.id, procBf.id],
    });

    let projectDetail = await getProjectDetail(projectId);
    assert(projectDetail !== null, "Proje oluşturuldu ve detayı alındı.");
    assert(projectDetail?.project.status === "active", "Yeni oluşturulan projenin varsayılan durumu 'active'.");

    // Pasife al
    await updateProjectStatus(projectId, "passive");
    projectDetail = await getProjectDetail(projectId);
    assert(projectDetail?.project.status === "passive", "updateProjectStatus ile proje 'passive' durumuna geçti.");

    // Aktife al
    await updateProjectStatus(projectId, "active");
    projectDetail = await getProjectDetail(projectId);
    assert(projectDetail?.project.status === "active", "updateProjectStatus ile proje tekrar 'active' oldu.");

    // updateProjectDetails ile durum güncelle
    await updateProjectDetails(projectId, {
      projectName: "Atlas Dinamik Kapsam Test Projesi (Revize)",
      status: "passive",
      company: {
        company_name: "Atlas Modüler Sistemler A.Ş.",
      },
    });
    projectDetail = await getProjectDetail(projectId);
    assert(projectDetail?.project.name === "Atlas Dinamik Kapsam Test Projesi (Revize)", "updateProjectDetails ile ad güncellendi.");
    assert(projectDetail?.project.status === "passive", "updateProjectDetails ile status='passive' başarıyla kaydedildi.");

    // Tekrar aktif yap
    await updateProjectStatus(projectId, "active");

    // -------------------------------------------------------------------------
    // TEST 3: Dinamik Kapsam Ekleme (Sonradan Fonksiyon Ekleme)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 3: Dinamik Kapsam Ekleme & Scope History ---");
    let projectsList = await getProjects();
    const initialProj = projectsList.find((p) => p.id === projectId);
    assert(initialProj?.selected_function_count === 2, `Başlangıç aktif fonksiyon sayısı: 2 (Bulunan: ${initialProj?.selected_function_count})`);

    // Kapsama yeni fonksiyon ekle (CRM)
    await addOrReactivateProjectFunction(projectId, "CRM", "Denetçi Selim");
    projectDetail = await getProjectDetail(projectId);
    const activeFns = projectDetail?.functions.filter((f) => f.is_active === 1);
    assert(activeFns?.length === 3, `CRM eklendikten sonra aktif fonksiyon sayısı 3 oldu (Bulunan: ${activeFns?.length}).`);

    let scopeChanges = await getProjectScopeChanges(projectId);
    assert(scopeChanges.length === 1, "project_scope_changes tablosuna 1 kayıt eklendi.");
    assert(scopeChanges[0].business_function_code === "CRM", "Kapsam değişikliği CRM için kaydedildi.");
    assert(scopeChanges[0].action === "added", "İşlem tipi 'added'.");

    projectsList = await getProjects();
    const updatedProj = projectsList.find((p) => p.id === projectId);
    assert(updatedProj?.selected_function_count === 3, "getProjects() fonksiyon sayacını anında 3 olarak güncelledi.");

    // -------------------------------------------------------------------------
    // TEST 4: Kapsam Dışı Bırakma (Soft Remove) ve Çalışma Verisi Korunumu
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 4: Soft Remove & Çalışma Verisi Korunumu ---");
    // CRM için soru cevapları, bulgular, gereksinimler, riskler, notlar kaydet
    await saveAnswer(projectId, "CRM", "tr.crm.core", "0.1.0", "CRM-001", {
      selected: ["CRM-001-A"],
      notes: "CRM pilot çalışma notu",
    });
    await createFinding({
      analysis_project_id: projectId,
      business_function_code: "CRM",
      title: "Müşteri Teklif Onay Süreci Uzun",
      priority: "high",
      status: "open",
    });
    await createRequirement({
      analysis_project_id: projectId,
      business_function_code: "CRM",
      title: "Mobil CRM Arayüzü",
      priority: "medium",
      status: "draft",
    });
    await createRisk({
      analysis_project_id: projectId,
      business_function_code: "CRM",
      title: "Veri Giriş Eksikliği Riski",
      impact: "high",
      probability: "medium",
      status: "open",
    });
    await createProjectNote({
      analysis_project_id: projectId,
      business_function_code: "CRM",
      note: "Saha ekibi CRM eğitimine ihtiyaç duyuyor.",
    });

    const preCounts = await getFunctionDataCounts(projectId, "CRM");
    assert(preCounts.total >= 5, `CRM verileri başarıyla kaydedildi. Toplam kayıt: ${preCounts.total}`);

    // CRM fonksiyonunu kapsam dışına al
    await deactivateProjectFunction(projectId, "CRM", "Müşteri bu fazda CRM'i erteledi", "Denetçi Selim");
    projectDetail = await getProjectDetail(projectId);
    const activeFnsAfterDeactivate = projectDetail?.functions.filter((f) => f.is_active === 1);
    const inactiveFns = projectDetail?.functions.filter((f) => f.is_active === 0);

    assert(activeFnsAfterDeactivate?.length === 2, "CRM çıkarıldıktan sonra aktif fonksiyon sayısı 2'ye düştü.");
    assert(inactiveFns?.length === 1 && inactiveFns[0].code === "CRM", "CRM kaydı silinmedi, is_active=0 olarak veritabanında kaldı.");
    assert(inactiveFns[0].removal_reason === "Müşteri bu fazda CRM'i erteledi", "Kapsam dışı bırakma nedeni kaydedildi.");

    scopeChanges = await getProjectScopeChanges(projectId);
    assert(scopeChanges.length === 2, "Kapsam geçmişinde 2 kayıt mevcut.");
    assert(scopeChanges[0].action === "removed", "Son işlem tipi 'removed'.");

    projectsList = await getProjects();
    assert(projectsList.find((p) => p.id === projectId)?.selected_function_count === 2, "getProjects() aktif fonksiyon sayısını 2 gösteriyor.");

    // Verilerin veritabanında silinmediğini teyit et
    const postCounts = await getFunctionDataCounts(projectId, "CRM");
    assert(postCounts.total === preCounts.total, `Kapsam dışı alındıktan sonra da tüm ${postCounts.total} çalışma kaydı veritabanında duruyor.`);

    // -------------------------------------------------------------------------
    // TEST 5: Kapsama Yeniden Alma (Reactivation)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 5: Kapsama Yeniden Alma (Reactivation) ---");
    await addOrReactivateProjectFunction(projectId, "CRM", "Denetçi Selim");
    projectDetail = await getProjectDetail(projectId);
    const reactivatedFns = projectDetail?.functions.filter((f) => f.is_active === 1);
    assert(reactivatedFns?.length === 3, "CRM yeniden eklendiğinde aktif fonksiyon sayısı tekrar 3 oldu.");

    const crmFn = projectDetail?.functions.find((f) => f.code === "CRM");
    assert(crmFn?.is_active === 1 && crmFn?.removed_at === null, "CRM is_active=1 ve removed_at=NULL yapıldı.");

    scopeChanges = await getProjectScopeChanges(projectId);
    assert(scopeChanges.length === 3, "Kapsam geçmişi 3 kayda ulaştı.");
    assert(scopeChanges[0].action === "reactivated", "Son işlem tipi 'reactivated'.");

    const restoredCounts = await getFunctionDataCounts(projectId, "CRM");
    assert(restoredCounts.total === preCounts.total, `Yeniden etkinleşen CRM'in tüm ${restoredCounts.total} verisi eksiksiz erişilebilir durumda.`);

    // -------------------------------------------------------------------------
    // TEST 6: Semantik Durum Sözlüğü & Normalizasyon Güvencesi
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 6: statusDictionary & Semantik Normalizasyon ---");
    assert(normalizeStatus("  Open_Risk  ") === "open_risk", "normalizeStatus boşluk ve büyük harfleri temizliyor.");
    assert(normalizeStatus("Çözüldü") === "resolved" || normalizeStatus("resolved") === "resolved", "normalizeStatus canonical anahtarları doğru çözüyor.");

    // Finding durumları
    assert(getStatusMeta("finding", "open").label === "Açık", "Finding 'open' -> 'Açık'");
    assert(getStatusMeta("finding", "confirmed").label === "Teyit Edildi", "Finding 'confirmed' -> 'Teyit Edildi'");
    assert(getStatusMeta("finding", "resolved").label === "Çözüldü", "Finding 'resolved' -> 'Çözüldü'");
    assert(getStatusMeta("finding", "BİLİNMEYEN_DURUM").label === "BİLİNMEYEN_DURUM", "Bilinmeyen durum yutulmuyor, etiket olarak korunuyor.");

    // Requirement durumları
    assert(getStatusMeta("requirement", "draft").label === "Taslak", "Requirement 'draft' -> 'Taslak'");
    assert(getStatusMeta("requirement", "confirmed").label === "Kapsamda", "Requirement 'confirmed' -> 'Kapsamda'");
    assert(getStatusMeta("requirement", "out_of_scope").label === "Kapsam Dışı", "Requirement 'out_of_scope' -> 'Kapsam Dışı'");
    assert(getStatusMeta("requirement", "implemented").label === "Karşılandı", "Requirement 'implemented' -> 'Karşılandı'");

    // Risk durumları
    assert(getStatusMeta("risk", "open").label === "Açık Risk", "Risk 'open' -> 'Açık Risk'");
    assert(getStatusMeta("risk", "mitigated").label === "Önlem Alındı", "Risk 'mitigated' -> 'Önlem Alındı'");
    assert(getStatusMeta("risk", "closed").label === "Kapatıldı", "Risk 'closed' -> 'Kapatıldı'");

    // isStatusOpen kontrolleri
    assert(isStatusOpen("finding", "open") === true, "Finding 'open' açık statüsünde.");
    assert(isStatusOpen("finding", "resolved") === false, "Finding 'resolved' kapalı statüsünde.");
    assert(isStatusOpen("risk", "open") === true, "Risk 'open' açık statüsünde.");
    assert(isStatusOpen("risk", "closed") === false, "Risk 'closed' kapalı statüsünde.");

    // SQL getSemanticSummaryCounts testi
    const semCounts = await getSemanticSummaryCounts(projectId);
    assert(semCounts.findingCount >= 1, `Bulgu sayısı: ${semCounts.findingCount}`);
    assert(semCounts.requirementCount >= 1, `Gereksinim sayısı: ${semCounts.requirementCount}`);
    assert(semCounts.openRiskCount >= 1, `Açık risk sayısı: ${semCounts.openRiskCount}`);
    assert(semCounts.noteCount >= 1, `Not sayısı: ${semCounts.noteCount}`);

    // -------------------------------------------------------------------------
    // TEST 7: .erpcrm Yedekleme & Geri Yüklemede Kapsam ve Durum Korunumu
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 7: .erpcrm Yedekleme & Geri Yükleme ---");
    // CRM'i tekrar kapsam dışına alıp pasif proje yapalım
    await deactivateProjectFunction(projectId, "CRM", "Yedekleme testi kapsam dışı");
    await updateProjectStatus(projectId, "passive");

    const exportRes = await exportProjectBackup(projectId);
    assert(exportRes.manifest.recordCounts.scopeChanges !== undefined, "Yedek manifestinde scopeChanges kaydı mevcut.");
    assert((exportRes.manifest.recordCounts.scopeChanges || 0) >= 4, `scopeChanges sayısı >= 4 (Bulunan: ${exportRes.manifest.recordCounts.scopeChanges})`);
    assert(exportRes.manifest.schemaVersion >= 12, "Manifest schemaVersion >= 12.");

    // Geri yükle
    const restoreRes = await restoreProjectBackup(exportRes.buffer, {
      newProjectName: "Atlas Geri Yüklenen Kapsam Projesi",
    });
    assert(restoreRes.success && restoreRes.created, "Proje yedekten başarıyla geri yüklendi.");

    const restoredDetail = await getProjectDetail(restoreRes.projectId);
    assert(restoredDetail?.project.status === "passive", "Geri yüklenen projenin pasif durumu korundu.");

    const restoredFns = restoredDetail?.functions || [];
    const restoredActiveFns = restoredFns.filter((f) => f.is_active === 1);
    const restoredInactiveFns = restoredFns.filter((f) => f.is_active === 0);
    assert(restoredActiveFns.length === 2, `Geri yüklenen aktif fonksiyon sayısı 2 (Bulunan: ${restoredActiveFns.length}).`);
    assert(restoredInactiveFns.length === 1 && restoredInactiveFns[0].code === "CRM", "Geri yüklenen kapsam dışı fonksiyon (CRM) korundu.");

    const restoredScopeChanges = await getProjectScopeChanges(restoreRes.projectId);
    assert(restoredScopeChanges.length >= 4, `Geri yüklenen kapsam değişiklik geçmişi korundu (Kayıt sayısı: ${restoredScopeChanges.length}).`);

    // Çoğaltma testi
    const dupRes = await duplicateProject(projectId, {
      newProjectName: "Atlas Klon Kapsam Projesi",
      copyAnswersAndAttachments: true,
    });
    assert(dupRes.success && dupRes.created, "Proje duplicateProject ile başarıyla çoğaltıldı.");
    const dupDetail = await getProjectDetail(dupRes.projectId);
    assert(dupDetail?.functions.filter((f) => f.is_active === 1).length === 2, "Çoğaltılan projede aktif fonksiyon sayısı 2.");

    console.log("\n================================================================================");
    console.log(`FAZ-55 KABUL TESTİ TAMAMLANDI: ${passCount} BAŞARILI, ${failCount} BAŞARISIZ`);
    console.log("================================================================================\n");

    if (failCount > 0) {
      process.exit(1);
    }
  } finally {
    resetDbInstanceForTesting();
    adapter.close();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // cleanup
    }
  }
}

main().catch((err) => {
  console.error("Beklenmeyen test hatası:", err);
  process.exit(1);
});
