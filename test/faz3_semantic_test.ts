/**
 * ERP CRM Discovery — FAZ-3 Semantic Layer Acceptance Test
 *
 * Amaç:
 * 1. Finding CRUD (Create, Read, Update, Delete)
 * 2. Requirement CRUD
 * 3. Risk CRUD (impact, probability, mitigation_note)
 * 4. Project Note CRUD (question-level & project-level)
 * 5. Kaynak Soru İzlenebilirliği (question_id link & filter)
 * 6. Cascade Delete (Proje silindiğinde tüm bağlı semantik kayıtların silinmesi)
 * 7. Öncelik, etki ve durum değerleri doğrulaması
 * 8. Kanonik iş fonksiyonu kodu doğrulaması (SALES)
 * 9. Özet Sayıları (KPI calculation)
 * 10. Bağlantı kapatma / yeniden açma döngüsünde kalıcılık (Persistence)
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
  console.log("\n[INFO] FAZ-3 Semantic DB test harness skipped: better-sqlite3 is not available on this platform.");
  console.log("Full DB validation is executed on Linux CI; physical validation runs via Tauri plugin-sql.");
  process.exit(0);
}

const TEST_DB_PATH = path.join(os.tmpdir(), `erp-faz3-semantic-test-${Date.now()}.db`);

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

function seedBusinessFunctions(db: any): void {
  const insert = db.prepare(`
    INSERT INTO business_functions (id, code, name_tr, name_en, category, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(code) DO NOTHING
  `);

  const insertMany = db.transaction(() => {
    for (const bf of BUSINESS_FUNCTION_REGISTRY) {
      if (bf.is_active) {
        const id = `bf_${bf.code.toLowerCase()}`;
        insert.run(id, bf.code, bf.name_tr, bf.name_en, bf.category_tr, bf.sort_order);
      }
    }
  });
  insertMany();
}

console.log("\n=== T01: Clean DB Başlatma ve Migration 3 Doğrulaması ===");
assert(!fs.existsSync(TEST_DB_PATH), "Test DB başlangıçta yok");

const db1 = new Database(TEST_DB_PATH);
db1.pragma("foreign_keys = ON");
db1.pragma("journal_mode = WAL");

runMigrations(db1);
seedBusinessFunctions(db1);

// 10 tablo varlığı kontrolü
const tables = (
  db1.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as {
    name: string;
  }[]
).map((t) => t.name);

for (const expected of [
  "analysis_projects",
  "company_profiles",
  "business_functions",
  "project_business_functions",
  "question_answers",
  "question_session_state",
  "analysis_findings",
  "analysis_requirements",
  "analysis_risks",
  "project_notes",
]) {
  assert(tables.includes(expected), `Tablo mevcut: ${expected}`);
}

// Test projesi oluştur
const PROJ_ID = "proj_faz3_test_001";
const now = new Date().toISOString();
db1.prepare(
  "INSERT INTO analysis_projects (id, name, status, created_at, updated_at) VALUES (?,?,?,?,?)"
).run(PROJ_ID, "FAZ-3 Test Projesi", "active", now, now);

// ─── T02: Finding CRUD ──────────────────────────────────────────────────────
console.log("\n=== T02: Finding CRUD ===");
const fndId = "fnd_001";
db1.prepare(`
  INSERT INTO analysis_findings
    (id, analysis_project_id, business_function_code, question_id, title, description, priority, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  fndId,
  PROJ_ID,
  "SALES",
  "SALES-001",
  "Teklif takibi Excel ile yapılıyor",
  "Revizyonlar bölge ekiplerinin Excel dosyalarında tutuluyor.",
  "high",
  "open",
  now,
  now
);

let fnd = db1.prepare("SELECT * FROM analysis_findings WHERE id = ?").get(fndId) as any;
assert(fnd !== undefined, "Finding oluşturuldu");
assert(fnd.title === "Teklif takibi Excel ile yapılıyor", "Finding title doğru");
assert(fnd.priority === "high", "Finding priority = high");
assert(fnd.status === "open", "Finding status = open");
assert(fnd.question_id === "SALES-001", "Finding question_id = SALES-001");

// Update
db1.prepare(`
  UPDATE analysis_findings
  SET status = 'confirmed', priority = 'critical', updated_at = ?
  WHERE id = ?
`).run(now, fndId);

fnd = db1.prepare("SELECT * FROM analysis_findings WHERE id = ?").get(fndId) as any;
assert(fnd.status === "confirmed", "Finding update: status = confirmed");
assert(fnd.priority === "critical", "Finding update: priority = critical");

// ─── T03: Requirement CRUD ──────────────────────────────────────────────────
console.log("\n=== T03: Requirement CRUD ===");
const reqId = "req_001";
db1.prepare(`
  INSERT INTO analysis_requirements
    (id, analysis_project_id, business_function_code, question_id, title, description, priority, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  reqId,
  PROJ_ID,
  "SALES",
  "SALES-001",
  "Teklif versiyonlaması merkezi sistemde olmalı",
  "Tüm revizyonlar onay akışıyla kaydedilmeli.",
  "critical",
  "confirmed",
  now,
  now
);

let req = db1.prepare("SELECT * FROM analysis_requirements WHERE id = ?").get(reqId) as any;
assert(req !== undefined, "Requirement oluşturuldu");
assert(req.title === "Teklif versiyonlaması merkezi sistemde olmalı", "Requirement title doğru");
assert(req.priority === "critical", "Requirement priority = critical");
assert(req.status === "confirmed", "Requirement status = confirmed");

// Update
db1.prepare(`
  UPDATE analysis_requirements
  SET status = 'implemented', updated_at = ?
  WHERE id = ?
`).run(now, reqId);

req = db1.prepare("SELECT * FROM analysis_requirements WHERE id = ?").get(reqId) as any;
assert(req.status === "implemented", "Requirement update: status = implemented");

// ─── T04: Risk CRUD ─────────────────────────────────────────────────────────
console.log("\n=== T04: Risk CRUD ===");
const rskId = "rsk_001";
db1.prepare(`
  INSERT INTO analysis_risks
    (id, analysis_project_id, business_function_code, question_id, title, description, impact, probability, mitigation_note, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  rskId,
  PROJ_ID,
  "SALES",
  "SALES-007",
  "Manuel termin teyitleri gecikmeye yol açabilir",
  "Üretim planlama ile satış arasındaki iletişim kopukluğu teslimatı geciktirebilir.",
  "high",
  "high",
  "ERP üzerinde ATP (Available-to-Promise) motoru devreye alınmalı.",
  "open",
  now,
  now
);

let rsk = db1.prepare("SELECT * FROM analysis_risks WHERE id = ?").get(rskId) as any;
assert(rsk !== undefined, "Risk oluşturuldu");
assert(rsk.title === "Manuel termin teyitleri gecikmeye yol açabilir", "Risk title doğru");
assert(rsk.impact === "high", "Risk impact = high");
assert(rsk.probability === "high", "Risk probability = high");
assert(rsk.mitigation_note?.includes("ATP"), "Risk mitigation_note doğru");
assert(rsk.status === "open", "Risk status = open");

// Update
db1.prepare(`
  UPDATE analysis_risks
  SET status = 'mitigated', mitigation_note = 'Prosedür güncellendi.', updated_at = ?
  WHERE id = ?
`).run(now, rskId);

rsk = db1.prepare("SELECT * FROM analysis_risks WHERE id = ?").get(rskId) as any;
assert(rsk.status === "mitigated", "Risk update: status = mitigated");

// ─── T05: Project Note CRUD ─────────────────────────────────────────────────
console.log("\n=== T05: Project Note CRUD ===");
const noteId1 = "not_001";
const noteId2 = "not_002";

// Soruya bağlı not
db1.prepare(`
  INSERT INTO project_notes
    (id, analysis_project_id, business_function_code, question_id, note, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  noteId1,
  PROJ_ID,
  "SALES",
  "SALES-014",
  "Satış müdürü Ankara ve İzmir ekiplerinin farklı iskonto matrisi kullandığını belirtti.",
  now,
  now
);

// Proje genel notu (business_function_code ve question_id null)
db1.prepare(`
  INSERT INTO project_notes
    (id, analysis_project_id, business_function_code, question_id, note, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  noteId2,
  PROJ_ID,
  null,
  null,
  "Genel proje notu: Gelecek hafta yönetim kurulu ile ara değerlendirme yapılacak.",
  now,
  now
);

const notes = db1.prepare("SELECT * FROM project_notes WHERE analysis_project_id = ? ORDER BY id").all(PROJ_ID) as any[];
assert(notes.length === 2, "2 adet proje notu kaydedildi");
assert(notes[0].question_id === "SALES-014", "İlk not soruya bağlı (SALES-014)");
assert(notes[1].business_function_code === null, "İkinci not proje geneli (bf_code = null)");
assert(notes[1].question_id === null, "İkinci not proje geneli (question_id = null)");

// ─── T06: Kaynak Soru Filtreleme ────────────────────────────────────────────
console.log("\n=== T06: Kaynak Soru Filtreleme ===");
const fndByQ = db1.prepare(
  "SELECT * FROM analysis_findings WHERE analysis_project_id = ? AND question_id = ?"
).all(PROJ_ID, "SALES-001");
assert(fndByQ.length === 1, "SALES-001 sorusuna bağlı 1 bulgu bulundu");

const fndByNonExistentQ = db1.prepare(
  "SELECT * FROM analysis_findings WHERE analysis_project_id = ? AND question_id = ?"
).all(PROJ_ID, "SALES-999");
assert(fndByNonExistentQ.length === 0, "Bağlı olmayan soruda 0 bulgu döndü");

// ─── T07: Özet Sayıları (KPI Calculation) ───────────────────────────────────
console.log("\n=== T07: Özet Sayıları (KPI Calculation) ===");
// İkinci bir risk ekle (açık risk sayısını test etmek için)
db1.prepare(`
  INSERT INTO analysis_risks
    (id, analysis_project_id, business_function_code, question_id, title, description, impact, probability, mitigation_note, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  "rsk_002",
  PROJ_ID,
  "SALES",
  null,
  "Anahtar kullanıcı direnci riski",
  "Eski sisteme alışık satış temsilcileri yeni arayüzü kullanmak istemeyebilir.",
  "medium",
  "high",
  null,
  "open",
  now,
  now
);

const fCount = (db1.prepare("SELECT COUNT(*) as c FROM analysis_findings WHERE analysis_project_id = ?").get(PROJ_ID) as any).c;
const rCount = (db1.prepare("SELECT COUNT(*) as c FROM analysis_requirements WHERE analysis_project_id = ?").get(PROJ_ID) as any).c;
const totalRisks = (db1.prepare("SELECT COUNT(*) as c FROM analysis_risks WHERE analysis_project_id = ?").get(PROJ_ID) as any).c;
const openRisks = (db1.prepare("SELECT COUNT(*) as c FROM analysis_risks WHERE analysis_project_id = ? AND status = 'open'").get(PROJ_ID) as any).c;
const nCount = (db1.prepare("SELECT COUNT(*) as c FROM project_notes WHERE analysis_project_id = ?").get(PROJ_ID) as any).c;

assert(fCount === 1, `Bulgu sayısı = 1 (gerçek: ${fCount})`);
assert(rCount === 1, `Gereksinim sayısı = 1 (gerçek: ${rCount})`);
assert(totalRisks === 2, `Toplam risk sayısı = 2 (gerçek: ${totalRisks})`);
assert(openRisks === 1, `Açık risk sayısı = 1 (gerçek: ${openRisks})`);
assert(nCount === 2, `Proje not sayısı = 2 (gerçek: ${nCount})`);

// ─── T08: Kalıcılık (Close / Reopen Persistence) ────────────────────────────
console.log("\n=== T08: Kalıcılık (Close / Reopen) ===");
db1.close();
console.log("  Bağlantı kapatıldı.");

const db2 = new Database(TEST_DB_PATH);
db2.pragma("foreign_keys = ON");

// Reopen kontrolü
const restoredFnd = db2.prepare("SELECT * FROM analysis_findings WHERE id = ?").get(fndId) as any;
assert(restoredFnd !== undefined, "Reopen sonrası Finding mevcut");
assert(restoredFnd.business_function_code === "SALES", "Finding bf_code = SALES korundu");
assert(restoredFnd.question_id === "SALES-001", "Finding question_id = SALES-001 korundu");

const restoredRsk = db2.prepare("SELECT * FROM analysis_risks WHERE id = ?").get(rskId) as any;
assert(restoredRsk !== undefined, "Reopen sonrası Risk mevcut");
assert(restoredRsk.impact === "high", "Risk impact korundu");

const restoredNotes = db2.prepare("SELECT * FROM project_notes WHERE analysis_project_id = ?").all(PROJ_ID);
assert(restoredNotes.length === 2, "Reopen sonrası 2 not korundu");

// ─── T09: Cascade Delete Doğrulaması ─────────────────────────────────────────
console.log("\n=== T09: Cascade Delete Doğrulaması ===");
// Projeyi sil
db2.prepare("DELETE FROM analysis_projects WHERE id = ?").run(PROJ_ID);

const remainingFnd = db2.prepare("SELECT COUNT(*) as c FROM analysis_findings WHERE analysis_project_id = ?").get(PROJ_ID) as any;
const remainingReq = db2.prepare("SELECT COUNT(*) as c FROM analysis_requirements WHERE analysis_project_id = ?").get(PROJ_ID) as any;
const remainingRsk = db2.prepare("SELECT COUNT(*) as c FROM analysis_risks WHERE analysis_project_id = ?").get(PROJ_ID) as any;
const remainingNotes = db2.prepare("SELECT COUNT(*) as c FROM project_notes WHERE analysis_project_id = ?").get(PROJ_ID) as any;

assert(remainingFnd.c === 0, "Proje silindiğinde bağlı bulgular cascade silindi");
assert(remainingReq.c === 0, "Proje silindiğinde bağlı gereksinimler cascade silindi");
assert(remainingRsk.c === 0, "Proje silindiğinde bağlı riskler cascade silindi");
assert(remainingNotes.c === 0, "Proje silindiğinde bağlı notlar cascade silindi");

db2.close();

// ─── T10: Temizlik ──────────────────────────────────────────────────────────
console.log("\n=== T10: Temizlik ===");
fs.unlinkSync(TEST_DB_PATH);
assert(!fs.existsSync(TEST_DB_PATH), "Test DB dosyası silindi");

// ─── Sonuç ──────────────────────────────────────────────────────────────────
console.log("\n" + "═".repeat(50));
console.log(`FAZ-3 Semantic Layer Test Sonucu: ${passCount} PASS / ${failCount} FAIL`);
if (failCount === 0) {
  console.log("BAŞARILI: FAZ-3 SEMANTIC LAYER ACCEPTANCE: PASS");
} else {
  console.error("BAŞARISIZ: FAZ-3 SEMANTIC LAYER ACCEPTANCE: FAIL");
  process.exit(1);
}
