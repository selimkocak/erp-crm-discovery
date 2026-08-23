// path: /home/selim/projects/erp-crm-discovery/test/faz46_governance_data_model_test.ts
/**
 * ERP CRM Discovery — FAZ-46 Veri Modeli ve Sorumluluk Matrisi Kabul Testi
 *
 * Kapsam:
 * - Migration v11 ile 8 yönetişim tablosu ve indekslerin oluşturulması
 * - Standart 23 kanonik yönetişim nesnesinin tohumlanması ve idempotency
 * - CRUD operasyonları: Nesneler, Özneler (Kullanıcı/Rol/Grup), Kapsamlar (Org/Şirket/Şube)
 * - Sorumluluk atamaları (Data Owner, Data Steward, Technical Custodian vb.)
 * - Foreign Key CASCADE bütünlüğü (Proje silindiğinde governance verilerinin temizlenmesi)
 */

import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs";

let Database: any = null;
try {
  Database = (await import("better-sqlite3")).default;
} catch {
  // better-sqlite3 optional fallback
}

import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import { DEFAULT_STARTER_GOVERNANCE_OBJECTS } from "../src/db/governanceClient";

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

async function runGovernanceDataModelTests(): Promise<void> {
  console.log("\n=======================================================");
  console.log("FAZ-46: Yönetişim Veri Modeli ve Sorumluluk Matrisi Testi");
  console.log("=======================================================\n");

  if (!Database) {
    console.log("[INFO] better-sqlite3 test harness not available on this environment.");
    return;
  }

  const tempDbPath = path.join(
    os.tmpdir(),
    `faz46-datamodel-test-${Date.now()}-${Math.random().toString(36).substring(7)}.db`
  );
  let db: any = null;

  try {
    db = new Database(tempDbPath);
    db.pragma("foreign_keys = ON");

    // 1. Run all migrations v1 to v11
    console.log("--- 1. Migration v1..v11 Şema Uygulaması ---");
    db.exec(`
      CREATE TABLE IF NOT EXISTS _migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );
    `);

    for (const m of MIGRATION_DEFINITIONS) {
      for (const sql of m.sql) {
        if (sql.trim()) db.exec(sql.trim());
      }
      db.prepare("INSERT INTO _migrations (version, name, applied_at) VALUES (?, ?, ?)").run(
        m.version,
        m.description,
        new Date().toISOString()
      );
    }


    const appliedCount = db.prepare("SELECT COUNT(*) as c FROM _migrations").get().c;
    assert(appliedCount === 11, `11 migration eksiksiz uygulandı (Mevcut: ${appliedCount})`);

    // Verify tables
    const expectedTables = [
      "governance_objects",
      "governance_subjects",
      "governance_scopes",
      "governance_responsibilities",
      "governance_authorizations",
      "governance_limits",
      "governance_sod_risks",
      "governance_attachments",
    ];

    for (const t of expectedTables) {
      const exists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(t);
      assert(!!exists, `Tablo mevcut: ${t}`);
    }

    // 2. Proje Ekleme
    console.log("\n--- 2. Sentetik Proje Oluşturma ---");
    const projId = "proj-gov-001";
    db.prepare(`
      INSERT INTO analysis_projects (id, name, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(projId, "Mega Endüstri ERP Dönüşümü", "in_progress", new Date().toISOString(), new Date().toISOString());

    // 3. 23 Standart Nesne Tohumlama & Idempotency
    console.log("\n--- 3. 23 Standart Yönetişim Nesnesi ve Idempotency ---");
    assert(DEFAULT_STARTER_GOVERNANCE_OBJECTS.length === 23, `Standart tohum listesinde 23 nesne var (Mevcut: ${DEFAULT_STARTER_GOVERNANCE_OBJECTS.length})`);

    const insertObjStmt = db.prepare(`
      INSERT OR IGNORE INTO governance_objects (
        id, analysis_project_id, category, code, name_tr, name_en, related_bf_code, description, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    for (let i = 0; i < DEFAULT_STARTER_GOVERNANCE_OBJECTS.length; i++) {
      const item = DEFAULT_STARTER_GOVERNANCE_OBJECTS[i];
      insertObjStmt.run(
        `obj-${item.code.toLowerCase()}`,
        projId,
        item.category,
        item.code,
        item.name_tr,
        item.name_en,
        item.related_bf_code || null,
        item.description || null,
        item.sort_order || i + 1,
        now,
        now
      );
    }

    const objCount1 = db.prepare("SELECT COUNT(*) as c FROM governance_objects WHERE analysis_project_id=?").get(projId).c;
    assert(objCount1 === 23, `23 adet nesne veritabanına eklendi (Mevcut: ${objCount1})`);

    // Tekrar tohumla (Idempotency testi)
    for (let i = 0; i < DEFAULT_STARTER_GOVERNANCE_OBJECTS.length; i++) {
      const item = DEFAULT_STARTER_GOVERNANCE_OBJECTS[i];
      insertObjStmt.run(
        `obj-${item.code.toLowerCase()}`,
        projId,
        item.category,
        item.code,
        item.name_tr,
        item.name_en,
        item.related_bf_code || null,
        item.description || null,
        item.sort_order || i + 1,
        now,
        now
      );
    }

    const objCount2 = db.prepare("SELECT COUNT(*) as c FROM governance_objects WHERE analysis_project_id=?").get(projId).c;
    assert(objCount2 === 23, `Idempotency korundu: Tekrar tohumlamada sayı 23 olarak kaldı`);

    // 4. Özneler (Subjects) ve Kapsamlar (Scopes)
    console.log("\n--- 4. Özneler ve Kapsamlar Testi ---");
    db.prepare(`
      INSERT INTO governance_subjects (id, analysis_project_id, subject_type, name, department_name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run("subj-001", projId, "role", "Satın Alma Müdürü", "Tedarik Zinciri", "Tüm satın alma onayları", now, now);

    db.prepare(`
      INSERT INTO governance_subjects (id, analysis_project_id, subject_type, name, department_name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run("subj-002", projId, "user", "Ahmet Yılmaz", "Muhasebe", "Kıdemli Muhasebe Uzmanı", now, now);

    db.prepare(`
      INSERT INTO governance_scopes (id, analysis_project_id, scope_type, name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run("scope-001", projId, "company", "Mega Endüstri A.Ş.", now, now);

    db.prepare(`
      INSERT INTO governance_scopes (id, analysis_project_id, scope_type, name, parent_scope_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run("scope-002", projId, "branch", "Bursa Fabrika", "scope-001", now, now);

    const subCount = db.prepare("SELECT COUNT(*) as c FROM governance_subjects WHERE analysis_project_id=?").get(projId).c;
    const scpCount = db.prepare("SELECT COUNT(*) as c FROM governance_scopes WHERE analysis_project_id=?").get(projId).c;
    assert(subCount === 2, `2 özne başarıyla eklendi`);
    assert(scpCount === 2, `2 kapsam başarıyla eklendi`);

    // 5. Sorumluluk Matrisi (Responsibilities)
    console.log("\n--- 5. Sorumluluk Matrisi Testi ---");
    db.prepare(`
      INSERT INTO governance_responsibilities (
        id, analysis_project_id, governance_object_id, subject_id, responsibility_type, scope_id, state_type, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "resp-001",
      projId,
      "obj-go_item_master",
      "subj-001",
      "data_owner",
      "scope-001",
      "as_is",
      "Stok kartlarının kodlama standardından sorumludur",
      now,
      now
    );

    const respRow = db.prepare("SELECT * FROM governance_responsibilities WHERE id=?").get("resp-001");
    assert(respRow.responsibility_type === "data_owner", "Sorumluluk türü data_owner olarak kaydedildi");
    assert(respRow.state_type === "as_is", "Model as_is olarak kaydedildi");

    // 6. Proje CASCADE Silme Güvenliği
    console.log("\n--- 6. Foreign Key CASCADE İzolasyon ve Temizlik Testi ---");
    db.prepare("DELETE FROM analysis_projects WHERE id=?").run(projId);

    const remainingObjs = db.prepare("SELECT COUNT(*) as c FROM governance_objects WHERE analysis_project_id=?").get(projId).c;
    const remainingSubs = db.prepare("SELECT COUNT(*) as c FROM governance_subjects WHERE analysis_project_id=?").get(projId).c;
    const remainingScps = db.prepare("SELECT COUNT(*) as c FROM governance_scopes WHERE analysis_project_id=?").get(projId).c;
    const remainingResps = db.prepare("SELECT COUNT(*) as c FROM governance_responsibilities WHERE analysis_project_id=?").get(projId).c;

    assert(remainingObjs === 0, `Proje silindiğinde governance_objects CASCADE ile temizlendi`);
    assert(remainingSubs === 0, `Proje silindiğinde governance_subjects CASCADE ile temizlendi`);
    assert(remainingScps === 0, `Proje silindiğinde governance_scopes CASCADE ile temizlendi`);
    assert(remainingResps === 0, `Proje silindiğinde governance_responsibilities CASCADE ile temizlendi`);

  } finally {
    if (db) {
      db.close();
    }
    if (fs.existsSync(tempDbPath)) {
      try { fs.unlinkSync(tempDbPath); } catch {}
    }
  }

  console.log(`\nFAZ-46 Data Model Test Sonucu: ${passCount} PASS, ${failCount} FAIL\n`);
  if (failCount > 0) {
    process.exit(1);
  }
}

await runGovernanceDataModelTests();
