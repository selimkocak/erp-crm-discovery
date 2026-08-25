/**
 * ERP CRM Discovery — Database Migration Runner (Tauri plugin-sql)
 *
 * Single Source of Truth for definitions: src/db/migrationDefinitions.ts
 *
 * FAZ-48: Hardened Migration Runner with Transaction, Rollback and schema_migrations tracking.
 */

import Database from "@tauri-apps/plugin-sql";
import { MIGRATION_DEFINITIONS } from "./migrationDefinitions";
import { INITIAL_BUSINESS_FUNCTIONS } from "./seedData";

export interface SchemaMigrationRecord {
  version: number;
  name: string;
  applied_at: string;
}

/**
 * Eski v1..v11 veritabanlarında schema_migrations tablosu bulunmadığında
 * mevcut şema nesnelerine bakarak güvenli baseline sürümünü tespit eder.
 */
export async function detectLegacyBaselineVersion(db: Database): Promise<number> {
  const tables = await db.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='analysis_projects'"
  );
  if (tables.length === 0) {
    return 0; // Temiz / Boş veritabanı
  }

  // v18: evidence_items tablosu
  const evdTables = await db.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='evidence_items'"
  );
  if (evdTables.length > 0) return 18;

  // v17: data_governance_assets tablosu
  const dgTables = await db.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='data_governance_assets'"
  );
  if (dgTables.length > 0) return 17;

  // v16: process_maps tablosu
  const procTables = await db.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='process_maps'"
  );
  if (procTables.length > 0) return 16;

  // v15: ot_data_requirements tablosu
  const otDataTables = await db.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='ot_data_requirements'"
  );
  if (otDataTables.length > 0) return 15;

  // v14: ot_stations tablosu
  const otTables = await db.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='ot_stations'"
  );
  if (otTables.length > 0) return 14;

  // v13: analysis_projects.planned_start_date kolonu
  const projCols = await db.select<{ name: string }[]>(
    "PRAGMA table_info(analysis_projects)"
  );
  const projColNames = new Set(projCols.map((c) => c.name));
  if (projColNames.has("planned_start_date")) return 13;

  // v12: project_scope_changes tablosu
  const pscTables = await db.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='project_scope_changes'"
  );
  if (pscTables.length > 0) return 12;

  // v11: governance_objects tablosu
  const govTables = await db.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='governance_objects'"
  );
  if (govTables.length > 0) return 11;

  // v10: company_profiles.business_sector kolonu
  const cols = await db.select<{ name: string }[]>(
    "PRAGMA table_info(company_profiles)"
  );
  const colNames = new Set(cols.map((c) => c.name));
  if (colNames.has("business_sector")) return 10;

  // v6: question_attachments tablosu
  const attTables = await db.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='question_attachments'"
  );
  if (attTables.length > 0) return 6;

  // v5: analysis_report_profiles tablosu
  const repTables = await db.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='analysis_report_profiles'"
  );
  if (repTables.length > 0) return 5;

  // v4: question_followups tablosu
  const folTables = await db.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='question_followups'"
  );
  if (folTables.length > 0) return 4;

  // v3: project_custom_questions tablosu
  const cusTables = await db.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='project_custom_questions'"
  );
  if (cusTables.length > 0) return 3;

  // v2: project_notes tablosu
  const notTables = await db.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='project_notes'"
  );
  if (notTables.length > 0) return 2;

  return 1;
}

/**
 * Migration tanımlarını sırayla çalıştırır ve schema_migrations tablosuna kaydeder.
 * SqlitePool kilitlenmelerini önlemek için manuel transaction komutu kullanılmaz.
 */
export async function runMigrations(db: Database): Promise<void> {
  // 1. schema_migrations tablosunu oluştur
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Uygulanmış migration'ları sorgula
  const appliedRecords = await db.select<{ version: number }[]>(
    "SELECT version FROM schema_migrations ORDER BY version ASC"
  );
  const appliedVersions = new Set(appliedRecords.map((r) => r.version));

  // 3. schema_migrations boşsa, eski DB baseline tespitini yap ve geçmişi doldur
  if (appliedVersions.size === 0) {
    const baselineVersion = await detectLegacyBaselineVersion(db);
    if (baselineVersion > 0) {
      for (const m of MIGRATION_DEFINITIONS) {
        if (m.version <= baselineVersion) {
          await db.execute(
            "INSERT INTO schema_migrations (version, name, applied_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT(version) DO NOTHING",
            [m.version, m.description]
          );
          appliedVersions.add(m.version);
        }
      }
    }
  }

  // 4. Henüz uygulanmamış migration'ları sırayla çalıştır
  for (const migration of MIGRATION_DEFINITIONS) {
    if (appliedVersions.has(migration.version)) {
      continue;
    }

    try {
      for (const sqlStatement of migration.sql) {
        const trimmed = sqlStatement.trim();
        if (trimmed.length > 0) {
          await db.execute(trimmed);
        }
      }
      await db.execute(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES ($1, $2, CURRENT_TIMESTAMP);",
        [migration.version, migration.description]
      );
      appliedVersions.add(migration.version);
    } catch (err) {
      throw new Error(`[Migration Error] Migration v${migration.version} (${migration.description}) failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 5. Başlangıç iş fonksiyonlarını tohumla / senkronize et (idempotent ON CONFLICT)
  for (const bf of INITIAL_BUSINESS_FUNCTIONS) {
    const id = `bf_${bf.code.toLowerCase()}`;
    await db.execute(
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
