/**
 * ERP CRM Discovery — Database Migration Runner (Tauri plugin-sql)
 *
 * Single Source of Truth for definitions: src/db/migrationDefinitions.ts
 */

import Database from "@tauri-apps/plugin-sql";
import { MIGRATION_DEFINITIONS } from "./migrationDefinitions";
import { INITIAL_BUSINESS_FUNCTIONS } from "./seedData";

export async function runMigrations(db: Database): Promise<void> {
  // Execute table creations and indices from migration definitions
  for (const migration of MIGRATION_DEFINITIONS) {
    for (const sqlStatement of migration.sql) {
      const trimmed = sqlStatement.trim();
      if (trimmed.length > 0) {
        await db.execute(trimmed);
      }
    }
  }

  // Seed business functions if empty (idempotent ON CONFLICT)
  const existing = await db.select<{ count: number }[]>(
    "SELECT count(*) as count FROM business_functions"
  );

  if (existing.length === 0 || existing[0].count === 0) {
    for (const bf of INITIAL_BUSINESS_FUNCTIONS) {
      const id = `bf_${bf.code.toLowerCase()}`;
      await db.execute(
        `INSERT INTO business_functions (id, code, name_tr, name_en, category, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, 1)
         ON CONFLICT(code) DO NOTHING`,
        [id, bf.code, bf.name_tr, bf.name_en, bf.category, bf.sort_order]
      );
    }
  }
}
