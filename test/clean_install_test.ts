/**
 * ERP CRM Discovery — Clean Install Migration Acceptance Test
 *
 * Single Source of Truth:
 * - Migration Definitions: src/db/migrationDefinitions.ts
 * - Business Function Registry: src/generated/businessFunctions.ts (from data/business-functions.json)
 *
 * Test Scenarios:
 * 1. Clean DB initialization
 * 2. Table and schema verification
 * 3. 31 canonical business functions seeded
 * 4. SALES canonical code verification
 * 5. Second startup / idempotency
 * 6. Sales answer persistence across reopen
 * 7. Cleanup
 */

let Database: any = null;
try {
  Database = (await import("better-sqlite3")).default;
} catch {
  // better-sqlite3 is optional
}
import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import { BUSINESS_FUNCTION_REGISTRY } from "../src/generated/businessFunctions";
import type { BusinessFunctionEntry } from "../src/generated/businessFunctions";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

if (!Database) {
  console.log("\n[INFO] clean_install_test.ts: better-sqlite3 test harness not available on this platform.");
  console.log("Full DB migration validation runs on Linux CI; physical validation runs via Tauri plugin-sql.");
  process.exit(0);
}

// Seed list derived from generated canonical registry (identical logic to seedData.ts)
const INITIAL_BUSINESS_FUNCTIONS = BUSINESS_FUNCTION_REGISTRY
  .filter((bf: BusinessFunctionEntry) => bf.is_active)
  .map((bf: BusinessFunctionEntry) => ({
    code: bf.code,
    name_tr: bf.name_tr,
    name_en: bf.name_en,
    category: bf.category_tr,
    sort_order: bf.sort_order,
  }));

const TEST_DB_PATH = path.join(os.tmpdir(), `erp-clean-install-test-${Date.now()}.db`);

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
 * Runs the single-source migration definitions using better-sqlite3.
 */
function runMigrations(db: any): void {
  for (const migration of MIGRATION_DEFINITIONS) {
    for (const sqlStatement of migration.sql) {
      const trimmed = sqlStatement.trim();
      if (trimmed.length > 0) {
        db.prepare(trimmed).run();
      }
    }
  }
}

/**
 * Seeds business functions idempotently.
 */
function seedBusinessFunctions(db: any): void {
  const insert = db.prepare(`
    INSERT INTO business_functions (id, code, name_tr, name_en, category, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(code) DO NOTHING
  `);

  const insertMany = db.transaction(() => {
    for (const bf of INITIAL_BUSINESS_FUNCTIONS) {
      const id = `bf_${bf.code.toLowerCase()}`;
      insert.run(id, bf.code, bf.name_tr, bf.name_en, bf.category, bf.sort_order);
    }
  });
  insertMany();
}

// ─── TEST 1: İlk Startup (Clean DB) ─────────────────────────────────────────
console.log("\n=== T1: İlk Startup (Clean DB) ===");

assert(!fs.existsSync(TEST_DB_PATH), "Test DB başlangıçta yok");

const db1 = new Database(TEST_DB_PATH);
db1.pragma("foreign_keys = ON");
db1.pragma("journal_mode = WAL");

runMigrations(db1);
seedBusinessFunctions(db1);

console.log("  Migration ve seed uygulandı.");

// ─── TEST 2: Tablo Varlığı ───────────────────────────────────────────────────
console.log("\n=== T2: Tablo Doğrulaması ===");

const tables = db1
  .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .all() as { name: string }[];

const tableNames = tables.map((t) => t.name);

for (const expected of [
  "analysis_projects",
  "business_functions",
  "company_profiles",
  "project_business_functions",
  "question_answers",
  "question_session_state",
  "analysis_findings",
  "analysis_requirements",
  "analysis_risks",
  "project_notes",
  "analysis_report_profiles",
  "project_custom_questions",
  "project_custom_question_options",
  "project_custom_question_answers",
  "question_followups",
  "question_attachments",
]) {
  assert(tableNames.includes(expected), `Tablo mevcut: ${expected}`);
}

// ─── TEST 3: 31 Business Function Seed ──────────────────────────────────────
console.log("\n=== T3: Canonical Business Function Seed ===");

const bfCount = (
  db1.prepare("SELECT COUNT(*) as c FROM business_functions").get() as { c: number }
).c;
assert(bfCount === 32, `Toplam 32 fonksiyon seed edildi (gerçek: ${bfCount})`);

// ─── TEST 4: SALES Canonical Code ───────────────────────────────────────────
console.log("\n=== T4: SALES Canonical Code ===");

const salesRow = db1
  .prepare("SELECT code, name_tr, id FROM business_functions WHERE code='SALES'")
  .get() as { code: string; name_tr: string; id: string } | undefined;

assert(salesRow !== undefined, "SALES kodu kayıtlı");
assert(salesRow?.name_tr === "Satış Yönetimi", `name_tr = Satış Yönetimi (gerçek: ${salesRow?.name_tr})`);
assert(salesRow?.id === "bf_sales", `id = bf_sales (gerçek: ${salesRow?.id})`);

// SATIS_YNT artık olmamalı
const legacySales = db1
  .prepare("SELECT code FROM business_functions WHERE code='SATIS_YNT'")
  .get();
assert(legacySales === undefined, "SATIS_YNT legacy kodu artık DB'de yok");

// ─── TEST 5: Bağlantıyı Kapat + İkinci Startup ──────────────────────────────
console.log("\n=== T5: Bağlantı Kapat (Restart Simülasyonu) ===");

db1.close();
console.log("  Bağlantı kapatıldı.");

const db2 = new Database(TEST_DB_PATH);
db2.pragma("foreign_keys = ON");

// Migration'ları tekrar çalıştır (idempotency testi)
runMigrations(db2);
seedBusinessFunctions(db2);

console.log("  Migration'lar ikinci kez uygulandı.");

// ─── TEST 6: İdempotency ────────────────────────────────────────────────────
console.log("\n=== T6: Idempotency (İkinci Startup) ===");

const bfCount2 = (
  db2.prepare("SELECT COUNT(*) as c FROM business_functions").get() as { c: number }
).c;
assert(bfCount2 === 32, `İkinci startuptan sonra hâlâ 32 fonksiyon (gerçek: ${bfCount2})`);

const tableCount2 = (
  db2
    .prepare("SELECT COUNT(*) as c FROM sqlite_master WHERE type='table'")
    .get() as { c: number }
).c;
assert(tableCount2 === 16, `Tablo sayısı değişmedi: 16 (gerçek: ${tableCount2})`);

// ─── TEST 7: Sales Answer Persistence ───────────────────────────────────────
console.log("\n=== T7: Sales Answer Persistence ===");

// Test projesi oluştur
const projId = "clean_test_proj_001";
const now = new Date().toISOString();
db2.prepare(
  "INSERT OR IGNORE INTO analysis_projects (id, name, status, created_at, updated_at) VALUES (?,?,?,?,?)"
).run(projId, "Clean Install Acceptance Test", "active", now, now);

// Cevap kaydet
const answerData = JSON.stringify({
  selected: [
    { value: "erp_crm", note: "Ana sistem üzerinden takip ediliyor." },
  ],
  general_note: "Acceptance test",
});

const qaId = "qa_clean_test_001";
db2.prepare(
  `INSERT OR REPLACE INTO question_answers
   (id, analysis_project_id, business_function_code, question_pack_id,
    question_pack_version, question_id, answer_data, created_at, updated_at)
   VALUES (?,?,?,?,?,?,?,?,?)`
).run(qaId, projId, "SALES", "tr.sales.core", "0.1.0", "SALES-001", answerData, now, now);

// Session state kaydet
db2.prepare(
  `INSERT OR REPLACE INTO question_session_state
   (id, analysis_project_id, business_function_code, last_question_id, updated_at)
   VALUES (?,?,?,?,?)`
).run("qss_clean_test_001", projId, "SALES", "SALES-010", now);

// Bağlantıyı kapat
db2.close();
console.log("  Cevap kaydedildi, bağlantı kapatıldı.");

// Yeniden aç ve oku
const db3 = new Database(TEST_DB_PATH);

const restoredRow = db3
  .prepare(
    "SELECT business_function_code, question_pack_id, question_pack_version, question_id, answer_data FROM question_answers WHERE id=?"
  )
  .get(qaId) as {
    business_function_code: string;
    question_pack_id: string;
    question_pack_version: string;
    question_id: string;
    answer_data: string;
  } | undefined;

assert(restoredRow !== undefined, "Cevap satırı okundu");
assert(restoredRow?.business_function_code === "SALES", `business_function_code = SALES (gerçek: ${restoredRow?.business_function_code})`);
assert(restoredRow?.question_pack_id === "tr.sales.core", `question_pack_id = tr.sales.core`);
assert(restoredRow?.question_id === "SALES-001", `question_id = SALES-001`);

const parsed = restoredRow ? JSON.parse(restoredRow.answer_data) : null;
assert(parsed?.selected?.[0]?.value === "erp_crm", "selected[0].value = erp_crm");
assert(
  parsed?.selected?.[0]?.note === "Ana sistem üzerinden takip ediliyor.",
  "selected[0].note korundu"
);
assert(parsed?.general_note === "Acceptance test", "general_note korundu");

const ssRow = db3
  .prepare(
    "SELECT last_question_id FROM question_session_state WHERE analysis_project_id=? AND business_function_code='SALES'"
  )
  .get(projId) as { last_question_id: string } | undefined;

assert(ssRow?.last_question_id === "SALES-010", "last_question_id = SALES-010 korundu");

db3.close();

// ─── TEST 8: Temizlik ────────────────────────────────────────────────────────
console.log("\n=== TEST 8: Temizlik ===");
fs.unlinkSync(TEST_DB_PATH);
assert(!fs.existsSync(TEST_DB_PATH), "Test DB silindi");

// ─── Sonuç ──────────────────────────────────────────────────────────────────
console.log("\n" + "═".repeat(50));
console.log(`Clean Install Test Sonucu: ${passCount} PASS / ${failCount} FAIL`);
if (failCount === 0) {
  console.log("BAŞARILI: FAZ-2.2 CLEAN INSTALL ACCEPTANCE: PASS");
} else {
  console.error("BAŞARISIZ: FAZ-2.2 CLEAN INSTALL ACCEPTANCE: FAIL");
  process.exit(1);
}
