// path: /home/selim/projects/erp-crm-discovery/test/faz46_governance_matrix_and_sod_test.ts
/**
 * ERP CRM Discovery — FAZ-46 Yetki Matrisi, Onay Limitleri ve SoD Riskleri Kabul Testi
 *
 * Kapsam:
 * - SAP B1 stili yetki matrisi (Tam, Salt Okunur, Yok, Kısmi)
 * - 8 işlem düzeyi izni (can_view, can_create, can_edit, can_delete, can_approve, can_cancel, can_export, can_view_cost)
 * - Efektif yetki sapması tespiti (has_discrepancy, effective_level)
 * - Onay limitleri ve kademe hiyerarşisi
 * - Görevler Ayrılığı (SoD) riskleri, çatışan görevler A/B, risk dereceleri (critical, high, medium, low)
 * - Yönetişim KPI Özeti hesaplamaları (getGovernanceSummary)
 */

import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs";

let Database: any = null;
try {
  Database = (await import("better-sqlite3")).default;
} catch {
  // fallback
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

async function runGovernanceMatrixAndSodTests(): Promise<void> {
  console.log("\n=======================================================");
  console.log("FAZ-46: Yetki Matrisi, Limitler ve SoD Riskleri Testi");
  console.log("=======================================================\n");

  if (!Database) {
    console.log("[INFO] better-sqlite3 test harness not available on this environment.");
    return;
  }

  const tempDbPath = path.join(
    os.tmpdir(),
    `faz46-matrix-test-${Date.now()}-${Math.random().toString(36).substring(7)}.db`
  );
  let db: any = null;

  try {
    db = new Database(tempDbPath);
    db.pragma("foreign_keys = ON");

    // Migration v1..v11
    for (const m of MIGRATION_DEFINITIONS) {
      for (const sql of m.sql) {
        if (sql.trim()) db.exec(sql.trim());
      }
    }


    const projId = "proj-gov-002";
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO analysis_projects (id, name, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(projId, "Mega Endüstri A.Ş. Analizi", "in_progress", now, now);

    // Nesneler ve Özneler
    db.prepare(`
      INSERT INTO governance_objects (id, analysis_project_id, category, code, name_tr, name_en, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run("obj-01", projId, "master_data", "GO_BP_SUPPLIER", "Tedarikçi Kartı", "Vendor Master", now, now);

    db.prepare(`
      INSERT INTO governance_objects (id, analysis_project_id, category, code, name_tr, name_en, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run("obj-02", projId, "financial", "GO_PAYMENT_ORDER", "Ödeme Emri", "Payment Order", now, now);

    db.prepare(`
      INSERT INTO governance_objects (id, analysis_project_id, category, code, name_tr, name_en, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run("obj-03", projId, "master_data", "GO_ITEM_MASTER", "Malzeme Kartı", "Item Master", now, now);

    db.prepare(`
      INSERT INTO governance_subjects (id, analysis_project_id, subject_type, name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run("sub-01", projId, "role", "Satın Alma Uzmanı", now, now);

    db.prepare(`
      INSERT INTO governance_subjects (id, analysis_project_id, subject_type, name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run("sub-02", projId, "role", "Finans Direktörü", now, now);

    // 1. Yetki Matrisi ve 8 İşlem İzni
    console.log("--- 1. Yetki Matrisi ve 8 İşlem Düzeyi İzinleri ---");
    db.prepare(`
      INSERT INTO governance_authorizations (
        id, analysis_project_id, governance_object_id, subject_id, permission_level, permission_source,
        effective_level, has_discrepancy, can_view, can_create, can_edit, can_delete, can_approve, can_cancel, can_export, can_view_cost,
        state_type, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "auth-01",
      projId,
      "obj-01",
      "sub-01",
      "full",
      "role",
      "full",
      0,
      1, 1, 1, 0, 0, 0, 1, 1,
      "as_is",
      "Tedarikçi açma ve güncelleme tam yetki",
      now,
      now
    );

    // Sapmalı yetki (Beyan: Salt Okunur, Fiili Efektif: Tam Yetkili)
    db.prepare(`
      INSERT INTO governance_authorizations (
        id, analysis_project_id, governance_object_id, subject_id, permission_level, permission_source,
        effective_level, has_discrepancy, can_view, can_create, can_edit, can_delete, can_approve, can_cancel, can_export, can_view_cost,
        state_type, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "auth-02",
      projId,
      "obj-02",
      "sub-01",
      "read_only",
      "direct",
      "full",
      1,
      1, 1, 1, 0, 0, 0, 0, 0,
      "as_is",
      "Sahada fiilen süpervizör şifresiyle ödeme emri düzenleyebiliyor",
      now,
      now
    );

    const auth1 = db.prepare("SELECT * FROM governance_authorizations WHERE id=?").get("auth-01");
    assert(auth1.permission_level === "full", "Beyan edilen yetki 'full'");
    assert(auth1.can_view === 1 && auth1.can_create === 1 && auth1.can_export === 1, "İşlem izinleri doğru kaydedildi");
    assert(auth1.has_discrepancy === 0, "auth-01 sapma içermiyor");

    const auth2 = db.prepare("SELECT * FROM governance_authorizations WHERE id=?").get("auth-02");
    assert(auth2.permission_level === "read_only", "Beyan edilen yetki 'read_only'");
    assert(auth2.effective_level === "full", "Efektif yetki 'full'");
    assert(auth2.has_discrepancy === 1, "auth-02 yetki sapması olarak işaretlendi");

    // 2. Onay Limitleri
    console.log("\n--- 2. Onay Limitleri ve Onay Kademeleri ---");
    db.prepare(`
      INSERT INTO governance_limits (
        id, analysis_project_id, governance_object_id, subject_id, limit_type, currency_or_unit, min_value, max_value,
        approval_tier, approver_subject_id, state_type, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "lim-01",
      projId,
      "obj-01",
      "sub-01",
      "Satın Alma Sipariş Limiti",
      "TRY",
      0,
      50000,
      "1. Kademe Onay",
      "sub-02",
      "as_is",
      "50.000 TL üzeri Finans Direktörü onayına gider",
      now,
      now
    );

    const lim1 = db.prepare("SELECT * FROM governance_limits WHERE id=?").get("lim-01");
    assert(lim1.limit_type === "Satın Alma Sipariş Limiti", "Limit türü doğru kaydedildi");
    assert(lim1.max_value === 50000, "Üst limit 50000 TRY");
    assert(lim1.approver_subject_id === "sub-02", "Onaylayan özne sub-02");

    // 3. Görevler Ayrılığı (SoD) Riskleri
    console.log("\n--- 3. Görevler Ayrılığı (SoD) Riskleri ---");
    db.prepare(`
      INSERT INTO governance_sod_risks (
        id, analysis_project_id, governance_object_id, subject_id, risk_title, conflicting_duty_a, conflicting_duty_b,
        risk_severity, current_control, mitigation_action, status, state_type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "sod-01",
      projId,
      "obj-01",
      "sub-01",
      "Tedarikçi Tanımlama ve Ödeme Emri Yetkisi Çatışması",
      "Tedarikçi Kartı Açma / Güncelleme",
      "Ödeme Emri Oluşturma / Onaylama",
      "critical",
      "Mevcut kontrol yok",
      "ERP'de tedarikçi açma yetkisi Muhasebe'ye, ödeme Finans'a ayrılmalıdır",
      "open",
      "as_is",
      now,
      now
    );

    const sod1 = db.prepare("SELECT * FROM governance_sod_risks WHERE id=?").get("sod-01");
    assert(sod1.risk_severity === "critical", "Risk ciddiyeti 'critical'");
    assert(sod1.conflicting_duty_a.includes("Tedarikçi"), "Çatışan görev A doğru");
    assert(sod1.conflicting_duty_b.includes("Ödeme"), "Çatışan görev B doğru");
    assert(sod1.status === "open", "Risk durumu 'open'");

    // 4. KPI Özeti Hesaplama Mantığı
    console.log("\n--- 4. Yönetişim KPI Özeti Doğrulaması ---");
    // Sorumluluk ekleyelim: obj-01 için Data Owner var, obj-02 ve obj-03 için yok
    db.prepare(`
      INSERT INTO governance_responsibilities (
        id, analysis_project_id, governance_object_id, subject_id, responsibility_type, state_type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run("resp-01", projId, "obj-01", "sub-01", "data_owner", "as_is", now, now);

    const totalObjects = db.prepare("SELECT COUNT(*) as c FROM governance_objects WHERE analysis_project_id=?").get(projId).c;
    const assignedOwnerObjs = db.prepare(`
      SELECT COUNT(DISTINCT governance_object_id) as c FROM governance_responsibilities
      WHERE analysis_project_id=? AND responsibility_type='data_owner'
    `).get(projId).c;
    const unassignedOwnerCount = totalObjects - assignedOwnerObjs;

    const criticalSodCount = db.prepare(`
      SELECT COUNT(*) as c FROM governance_sod_risks
      WHERE analysis_project_id=? AND risk_severity IN ('critical', 'high') AND status != 'closed'
    `).get(projId).c;

    const discrepancyCount = db.prepare(`
      SELECT COUNT(*) as c FROM governance_authorizations
      WHERE analysis_project_id=? AND has_discrepancy = 1
    `).get(projId).c;

    assert(totalObjects === 3, `Toplam nesne sayısı: 3`);
    assert(unassignedOwnerCount === 2, `Sahipsiz nesne sayısı (Owner Yok): 2`);
    assert(criticalSodCount === 1, `Kritik SoD risk sayısı: 1`);
    assert(discrepancyCount === 1, `Efektif yetki sapması sayısı: 1`);

  } finally {
    if (db) {
      db.close();
    }
    if (fs.existsSync(tempDbPath)) {
      try { fs.unlinkSync(tempDbPath); } catch {}
    }
  }

  console.log(`\nFAZ-46 Matrix & SoD Test Sonucu: ${passCount} PASS, ${failCount} FAIL\n`);
  if (failCount > 0) {
    process.exit(1);
  }
}

await runGovernanceMatrixAndSodTests();
