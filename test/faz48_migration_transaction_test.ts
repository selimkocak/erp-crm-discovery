// path: /home/selim/projects/erp-crm-discovery/test/faz48_migration_transaction_test.ts
/**
 * ERP CRM Discovery — FAZ-48 Migration Transaction ve Rollback Güvenlik Testi
 *
 * Doğrulamalar:
 * 1. Temiz kurulumda v1..v11 migration'ları tek tek transaction içinde uygulanır ve schema_migrations tablosuna yazılır.
 * 2. İkinci açılışta uygulanmış migration'lar tekrar çalıştırılmaz (İdempotent).
 * 3. Eski (schema_migrations taşımayan) v10 veritabanı otomatik tespit edilir, geçmiş doldurulur ve yalnızca v11 uygulanır.
 * 4. Migration sırasında oluşan sentetik hata durumunda ROLLBACK gerçekleşir, sürüm kaydedilmez ve veri korunur.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

let Database: any = null;
try {
  Database = (await import("better-sqlite3")).default;
} catch {
  // better-sqlite3 is optional on some platforms (e.g. Windows CI fallback)
}

import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";

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
  private db: any;

  constructor(filePath: string) {
    if (!Database) {
      throw new Error("better-sqlite3 is not available");
    }
    this.db = new Database(filePath);
    this.db.pragma("foreign_keys = ON");
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    const trimmed = sql.trim();
    if (!trimmed) return;
    if (params && params.length > 0) {
      // Convert $1, $2 to ? for sqlite3
      let convertedSql = trimmed;
      for (let i = 1; i <= params.length; i++) {
        convertedSql = convertedSql.replace(new RegExp(`\\$${i}`, "g"), "?");
      }
      this.db.prepare(convertedSql).run(...params);
    } else {
      this.db.exec(trimmed);
    }
  }

  async select<T>(sql: string, params: any[] = []): Promise<T> {
    let convertedSql = sql.trim();
    if (params && params.length > 0) {
      for (let i = 1; i <= params.length; i++) {
        convertedSql = convertedSql.replace(new RegExp(`\\$${i}`, "g"), "?");
      }
      return this.db.prepare(convertedSql).all(...params) as T;
    }
    return this.db.prepare(convertedSql).all() as T;
  }

  close(): void {
    if (this.db) {
      this.db.close();
    }
  }

  get raw(): any {
    return this.db;
  }
}

// Adaptör üzerinde detectLegacyBaselineVersion ve runTransactionalMigrations çalıştıralım
async function detectLegacyBaseline(adapter: SqliteDbAdapter): Promise<number> {
  const tables = await adapter.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='analysis_projects'"
  );
  if (tables.length === 0) return 0;

  const govTables = await adapter.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='governance_objects'"
  );
  if (govTables.length > 0) return 11;

  const cols = await adapter.select<{ name: string }[]>(
    "PRAGMA table_info(company_profiles)"
  );
  const colNames = new Set(cols.map((c) => c.name));
  if (colNames.has("business_sector")) return 10;

  const attTables = await adapter.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='question_attachments'"
  );
  if (attTables.length > 0) return 6;

  return 1;
}

async function runTransactionalMigrations(adapter: SqliteDbAdapter, customDefinitions = MIGRATION_DEFINITIONS): Promise<void> {
  await adapter.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const appliedRecords = await adapter.select<{ version: number }[]>(
    "SELECT version FROM schema_migrations ORDER BY version ASC"
  );
  const appliedVersions = new Set(appliedRecords.map((r) => r.version));

  if (appliedVersions.size === 0) {
    const baselineVersion = await detectLegacyBaseline(adapter);
    if (baselineVersion > 0) {
      for (const m of customDefinitions) {
        if (m.version <= baselineVersion) {
          await adapter.execute(
            "INSERT INTO schema_migrations (version, name, applied_at) VALUES ($1, $2, CURRENT_TIMESTAMP);",
            [m.version, m.description]
          );
          appliedVersions.add(m.version);
        }
      }
    }
  }

  for (const migration of customDefinitions) {
    if (appliedVersions.has(migration.version)) {
      continue;
    }

    try {
      await adapter.execute("BEGIN TRANSACTION;");
      for (const sqlStatement of migration.sql) {
        const trimmed = sqlStatement.trim();
        if (trimmed.length > 0) {
          await adapter.execute(trimmed);
        }
      }
      await adapter.execute(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES ($1, $2, CURRENT_TIMESTAMP);",
        [migration.version, migration.description]
      );
      await adapter.execute("COMMIT;");
      appliedVersions.add(migration.version);
    } catch (err) {
      try {
        await adapter.execute("ROLLBACK;");
      } catch {}
      throw new Error(`[Migration Error] Migration v${migration.version} failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

async function testFreshInstallAndIdempotency(): Promise<void> {
  console.log("--- 1. Temiz Kurulum ve İdempotency Testi ---");
  const tempDb = path.join(os.tmpdir(), `test_faz48_fresh_${Date.now()}_${Math.random().toString(36).substring(7)}.db`);
  const adapter = new SqliteDbAdapter(tempDb);

  try {
    await runTransactionalMigrations(adapter);

    const migrations = await adapter.select<{ version: number; name: string }[]>(
      "SELECT version, name FROM schema_migrations ORDER BY version ASC"
    );
    assert(migrations.length === 11, `Temiz kurulumda 11 migration kaydedildi (Mevcut: ${migrations.length})`);
    assert(migrations[0].version === 1 && migrations[10].version === 11, "v1'den v11'e eksiksiz sıralı uygulandı");

    const tableCount = await adapter.select<{ c: number }[]>("SELECT COUNT(*) as c FROM sqlite_master WHERE type='table'");
    assert(tableCount[0].c >= 24, `Tüm tablolar başarıyla oluşturuldu (Mevcut: ${tableCount[0].c})`);

    // İkinci çalıştırma (İdempotency)
    console.log("\n--- 2. İkinci Çalıştırma (Idempotency) Testi ---");
    await runTransactionalMigrations(adapter);
    const postMigrations = await adapter.select<{ version: number }[]>("SELECT version FROM schema_migrations");
    assert(postMigrations.length === 11, "İkinci çalıştırmada migration sayısı değişmedi (11 korundu)");

  } finally {
    adapter.close();
    if (fs.existsSync(tempDb)) fs.unlinkSync(tempDb);
  }
}

async function testLegacyV10BaselineUpgrade(): Promise<void> {
  console.log("\n--- 3. Eski v10 Veritabanı Baseline ve Yükseltme Testi ---");
  const tempDb = path.join(os.tmpdir(), `test_faz48_legacy_v10_${Date.now()}_${Math.random().toString(36).substring(7)}.db`);
  const adapter = new SqliteDbAdapter(tempDb);

  try {
    // 1. Manuel olarak v1..v10 tablolarını schema_migrations olmadan oluştur
    for (let v = 1; v <= 10; v++) {
      const def = MIGRATION_DEFINITIONS.find((m) => m.version === v);
      if (def) {
        for (const sql of def.sql) {
          if (sql.trim()) await adapter.execute(sql.trim());
        }
      }
    }

    // Kullanıcı verisi ekle
    await adapter.execute("INSERT INTO analysis_projects (id, name) VALUES ('proj-legacy', 'Eski Proje');");
    await adapter.execute("INSERT INTO company_profiles (id, analysis_project_id, company_name, business_sector) VALUES ('cp-legacy', 'proj-legacy', 'Eski Firma', 'Mobilya');");

    // 2. Transactional runner'ı çalıştır
    await runTransactionalMigrations(adapter);

    const migrations = await adapter.select<{ version: number }[]>("SELECT version FROM schema_migrations ORDER BY version ASC");
    assert(migrations.length === 11, `Eski v10 DB baseline tespit edilerek v11'e yükseltildi (11 migration mevcut)`);

    const legacyProject = await adapter.select<{ name: string }[]>("SELECT name FROM analysis_projects WHERE id='proj-legacy'");
    assert(legacyProject[0].name === "Eski Proje", "Mevcut kullanıcı projesi veri kaybı olmadan korundu");

    const govTables = await adapter.select<{ name: string }[]>("SELECT name FROM sqlite_master WHERE type='table' AND name='governance_objects'");
    assert(govTables.length === 1, "v11 yönetişim tablosu başarıyla oluşturuldu");

  } finally {
    adapter.close();
    if (fs.existsSync(tempDb)) fs.unlinkSync(tempDb);
  }
}

async function testSyntheticFailureAndRollback(): Promise<void> {
  console.log("\n--- 4. Sentetik Hata ve Rollback Güvenlik Testi ---");
  const tempDb = path.join(os.tmpdir(), `test_faz48_rollback_${Date.now()}_${Math.random().toString(36).substring(7)}.db`);
  const adapter = new SqliteDbAdapter(tempDb);

  try {
    // v1..v11 tanımlarına ek olarak hatalı v12 ekle
    const failingMigrations = [
      ...MIGRATION_DEFINITIONS,
      {
        version: 12,
        description: "Bozuk Sentetik Migration",
        sql: [
          `CREATE TABLE test_table_v12 (id TEXT PRIMARY KEY);`,
          `INSERT INTO test_table_v12 (id) VALUES ('row-1');`,
          `INSERT INTO non_existing_table_will_fail (id) VALUES ('fail');`, // HATA
        ],
      },
    ];

    let threw = false;
    try {
      await runTransactionalMigrations(adapter, failingMigrations as any);
    } catch (err: any) {
      threw = true;
      assert(err.message.includes("Migration v12 failed"), "Bozuk migration fail-fast hatası üretti");
    }

    assert(threw, "Migration hatası sessizce yutulmadı, yukarı fırlatıldı");

    // Doğrulamalar
    const migrations = await adapter.select<{ version: number }[]>("SELECT version FROM schema_migrations ORDER BY version ASC");
    assert(migrations.length === 11, "Başarısız olan v12 schema_migrations tablosuna YAZILMADI (11 kaldı)");

    const tableV12 = await adapter.select<{ name: string }[]>("SELECT name FROM sqlite_master WHERE type='table' AND name='test_table_v12'");
    assert(tableV12.length === 0, "Transaction rollback sayesinde v12 tabloları GERİ ALINDI (0 tablo)");

  } finally {
    adapter.close();
    if (fs.existsSync(tempDb)) fs.unlinkSync(tempDb);
  }
}

async function runAllMigrationTransactionTests(): Promise<void> {
  console.log("\n=======================================================");
  console.log("FAZ-48: Migration Transaction ve Rollback Güvenlik Testi");
  console.log("=======================================================\n");

  if (!Database) {
    console.log("[INFO] better-sqlite3 test harness not available on this environment.");
    console.log("FAZ-48 Migration Transaction Test: SKIPPED — BETTER_SQLITE3 UNAVAILABLE");
    return;
  }

  await testFreshInstallAndIdempotency();
  await testLegacyV10BaselineUpgrade();
  await testSyntheticFailureAndRollback();

  console.log(`\nFAZ-48 Migration Transaction Test Sonucu: ${passCount} PASS, ${failCount} FAIL\n`);
  if (failCount > 0) {
    process.exit(1);
  }
}

runAllMigrationTransactionTests().catch((err) => {
  console.error("Migration Transaction Test Error:", err);
  process.exit(1);
});
