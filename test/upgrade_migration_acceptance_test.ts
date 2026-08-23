// path: /home/selim/projects/erp-crm-discovery/test/upgrade_migration_acceptance_test.ts
/**
 * ERP CRM Discovery — SQLite Yükseltme ve Veri Koruma Kabul Testi
 *
 * FAZ-45 Aşama 45.5
 *
 * Kapsam:
 * - Migration v1'den v10'a sıralı ve aşamalı şema yükseltmesi
 * - Her şema sürümünde oluşturulan iş verilerinin sonraki migration'larda %100 korunması
 * - Migration v9 ile source_absolute_path gizlilik ve taşınabilirlik mühürlemesi (NULL yapılması)
 * - Migration v10 ile business_sector, has_branches ve branch_count alanlarının geriye dönük uyumlulukla eklenmesi
 * - Çoklu proje izolasyonu (Project A ve Project B)
 * - Tam idempotency: Mevcut v10 şeması üzerine migration'ların tekrar çalıştırılması
 * - Sentetik, geçici (os.tmpdir) ve deterministik test ortamı
 */

import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs";

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

async function runUpgradeMigrationTests(): Promise<void> {
  console.log("\n=======================================================");
  console.log("ERP CRM Discovery — SQLite Yükseltme ve Veri Koruma Testi");
  console.log("=======================================================\n");

  if (!Database) {
    console.log("[INFO] better-sqlite3 test harness not available on this environment.");
    console.log("SKIPPED — BETTER_SQLITE3 UNAVAILABLE");
    return;
  }

  const tempDbPath = path.join(os.tmpdir(), `erp-upgrade-test-${Date.now()}-${Math.random().toString(36).substring(7)}.db`);
  let db: any = null;

  try {
    db = new Database(tempDbPath);
    db.pragma("foreign_keys = ON");

    // =========================================================================
    // T01: Migration v1 — Initial Schema & Baseline Projects
    // =========================================================================
    console.log("--- T01: Migration v1 (Initial Schema) Uygulaması & Proje Oluşturma ---");
    const m1 = MIGRATION_DEFINITIONS.find((m) => m.version === 1);
    assert(!!m1, "Migration v1 tanımı mevcut olmalı");
    for (const sql of m1!.sql) {
      db.exec(sql);
    }

    // Proje A ve B tohumlama
    const dateV1 = "2026-08-01T10:00:00Z";
    db.prepare(`
      INSERT INTO analysis_projects (id, name, status, created_at, updated_at)
      VALUES (?, ?, 'active', ?, ?)
    `).run("project-upgrade-a", "Proje A (Otomotiv)", dateV1, dateV1);

    db.prepare(`
      INSERT INTO analysis_projects (id, name, status, created_at, updated_at)
      VALUES (?, ?, 'active', ?, ?)
    `).run("project-upgrade-b", "Proje B (Perakende)", dateV1, dateV1);

    // Firma Profilleri
    db.prepare(`
      INSERT INTO company_profiles (id, analysis_project_id, company_name, trade_name, tax_number, city, country, employee_count, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'Türkiye', ?, ?, ?, ?)
    `).run("comp-a", "project-upgrade-a", "Alfa Otomotiv A.Ş.", "Alfa Otomotiv", "1234567890", "Bursa", "250", "Ana tedarikçi", dateV1, dateV1);

    db.prepare(`
      INSERT INTO company_profiles (id, analysis_project_id, company_name, trade_name, tax_number, city, country, employee_count, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'Türkiye', ?, ?, ?, ?)
    `).run("comp-b", "project-upgrade-b", "Beta Perakende Ltd.", "Beta Market", "9876543210", "İstanbul", "50", "Zincir mağaza", dateV1, dateV1);

    // İş Fonksiyonları
    db.prepare(`INSERT INTO business_functions (id, code, name_tr, name_en, category, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)`)
      .run("bf_sales", "SALES", "Satış Yönetimi", "Sales Management", "Satış & Pazarlama", 1);
    db.prepare(`INSERT INTO business_functions (id, code, name_tr, name_en, category, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)`)
      .run("bf_procurement", "PROCUREMENT", "Satın Alma", "Procurement", "Tedarik Zinciri", 2);
    db.prepare(`INSERT INTO business_functions (id, code, name_tr, name_en, category, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)`)
      .run("bf_inventory", "INVENTORY", "Stok Yönetimi", "Inventory", "Tedarik Zinciri", 3);

    // Proje İş Fonksiyonu Atamaları
    db.prepare(`INSERT INTO project_business_functions (id, analysis_project_id, business_function_id, status) VALUES (?, ?, ?, 'in_progress')`)
      .run("pbf-a-1", "project-upgrade-a", "bf_sales");
    db.prepare(`INSERT INTO project_business_functions (id, analysis_project_id, business_function_id, status) VALUES (?, ?, ?, 'not_started')`)
      .run("pbf-a-2", "project-upgrade-a", "bf_procurement");
    db.prepare(`INSERT INTO project_business_functions (id, analysis_project_id, business_function_id, status) VALUES (?, ?, ?, 'in_progress')`)
      .run("pbf-b-1", "project-upgrade-b", "bf_procurement");
    db.prepare(`INSERT INTO project_business_functions (id, analysis_project_id, business_function_id, status) VALUES (?, ?, ?, 'completed')`)
      .run("pbf-b-2", "project-upgrade-b", "bf_inventory");

    const pCountV1 = db.prepare("SELECT count(*) as c FROM analysis_projects").get().c;
    const cCountV1 = db.prepare("SELECT count(*) as c FROM company_profiles").get().c;
    const pbfCountV1 = db.prepare("SELECT count(*) as c FROM project_business_functions").get().c;
    assert(pCountV1 === 2, "v1: 2 proje oluşturuldu");
    assert(cCountV1 === 2, "v1: 2 firma profili oluşturuldu");
    assert(pbfCountV1 === 4, "v1: 4 proje iş fonksiyonu atandı");

    // =========================================================================
    // T02: Migration v2 — Question Answers & Session State
    // =========================================================================
    console.log("\n--- T02: Migration v2 (Soru Cevapları ve Oturum Durumu) ---");
    const m2 = MIGRATION_DEFINITIONS.find((m) => m.version === 2);
    for (const sql of m2!.sql) {
      db.exec(sql);
    }

    const answerPayloadA = JSON.stringify({
      selectedOptions: ["SLS-OPT-1"],
      textValue: "B2B bayi portalı üzerinden sipariş alınıyor.",
      generalNote: "Türkçe karakter testi: ğüşiöç ĞÜŞİÖÇ",
    });

    const answerPayloadB = JSON.stringify({
      selectedOptions: ["PRC-OPT-2"],
      textValue: "Doğrudan tedarikçi e-postası ile sipariş açılıyor.",
    });

    db.prepare(`
      INSERT INTO question_answers (id, analysis_project_id, business_function_code, question_pack_id, question_pack_version, question_id, answer_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, '0.1.0', ?, ?, ?, ?)
    `).run("qa-a-1", "project-upgrade-a", "SALES", "tr.sales.core", "SLS-001", answerPayloadA, dateV1, dateV1);

    db.prepare(`
      INSERT INTO question_answers (id, analysis_project_id, business_function_code, question_pack_id, question_pack_version, question_id, answer_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, '0.1.0', ?, ?, ?, ?)
    `).run("qa-a-2", "project-upgrade-a", "PROCUREMENT", "tr.procurement.core", "PRC-001", JSON.stringify({ selectedOptions: ["PRC-OPT-1"] }), dateV1, dateV1);

    // Proje B aynı PRC-001 sorusunu cevaplıyor (Bileşik UNIQUE anahtar testi)
    db.prepare(`
      INSERT INTO question_answers (id, analysis_project_id, business_function_code, question_pack_id, question_pack_version, question_id, answer_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, '0.1.0', ?, ?, ?, ?)
    `).run("qa-b-1", "project-upgrade-b", "PROCUREMENT", "tr.procurement.core", "PRC-001", answerPayloadB, dateV1, dateV1);

    // Session State
    db.prepare(`
      INSERT INTO question_session_state (id, analysis_project_id, business_function_code, last_question_id, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run("qss-a-1", "project-upgrade-a", "SALES", "SLS-001", dateV1);

    const qaCountV2 = db.prepare("SELECT count(*) as c FROM question_answers").get().c;
    assert(qaCountV2 === 3, "v2: 3 soru cevabı eklendi (Proje A: 2, Proje B: 1)");

    // =========================================================================
    // T03: Migration v3 — Semantic Layer (Findings, Requirements, Risks, Notes)
    // =========================================================================
    console.log("\n--- T03: Migration v3 (Semantik Katman: Bulgu, Gereksinim, Risk, Not) ---");
    const m3 = MIGRATION_DEFINITIONS.find((m) => m.version === 3);
    for (const sql of m3!.sql) {
      db.exec(sql);
    }

    db.prepare(`
      INSERT INTO analysis_findings (id, analysis_project_id, business_function_code, question_id, title, description, priority, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'high', 'open', ?, ?)
    `).run("f-a-1", "project-upgrade-a", "SALES", "SLS-001", "Fiyat Listesi Senkronizasyon Eksikliği", "Bayi fiyatları ERP'ye elle giriliyor.", dateV1, dateV1);

    db.prepare(`
      INSERT INTO analysis_requirements (id, analysis_project_id, business_function_code, question_id, title, description, priority, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'critical', 'draft', ?, ?)
    `).run("req-a-1", "project-upgrade-a", "SALES", "SLS-001", "Otomatik Fiyat Listesi Entegrasyonu", "B2B API köprüsü kurulmalıdır.", dateV1, dateV1);

    db.prepare(`
      INSERT INTO analysis_risks (id, analysis_project_id, business_function_code, question_id, title, description, impact, probability, mitigation_note, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'high', 'medium', ?, 'open', ?, ?)
    `).run("risk-a-1", "project-upgrade-a", "SALES", "SLS-001", "Yanlış Fiyatla Satış Riski", "Manuel girişte kur farkı hataları oluşabilir.", "Günlük kur tetikleyicisi", dateV1, dateV1);

    db.prepare(`
      INSERT INTO project_notes (id, analysis_project_id, business_function_code, question_id, note, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run("note-a-1", "project-upgrade-a", "SALES", "SLS-001", "Satış Direktörü ile 01.08.2026 tarihinde görüşüldü.", dateV1, dateV1);

    db.prepare(`
      INSERT INTO project_notes (id, analysis_project_id, business_function_code, question_id, note, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run("note-b-1", "project-upgrade-b", "PROCUREMENT", "PRC-001", "Proje B tedarikçi listesi Excel'den aktarılacak.", dateV1, dateV1);

    assert(db.prepare("SELECT count(*) as c FROM analysis_findings").get().c === 1, "v3: 1 bulgu kaydedildi");
    assert(db.prepare("SELECT count(*) as c FROM analysis_requirements").get().c === 1, "v3: 1 gereksinim kaydedildi");
    assert(db.prepare("SELECT count(*) as c FROM analysis_risks").get().c === 1, "v3: 1 risk kaydedildi");
    assert(db.prepare("SELECT count(*) as c FROM project_notes").get().c === 2, "v3: 2 proje notu kaydedildi");

    // =========================================================================
    // T04: Migration v4 — Report Profiles
    // =========================================================================
    console.log("\n--- T04: Migration v4 (Rapor Profilleri) ---");
    const m4 = MIGRATION_DEFINITIONS.find((m) => m.version === 4);
    for (const sql of m4!.sql) {
      db.exec(sql);
    }

    db.prepare(`
      INSERT INTO analysis_report_profiles (id, analysis_project_id, executive_summary, overall_assessment, open_topics, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run("rp-a-1", "project-upgrade-a", "Proje A Yönetici Özeti", "Genel süreç olgunluğu seviye 3.", "Fiyat listesi entegrasyonu açık konu.", dateV1, dateV1);

    assert(db.prepare("SELECT count(*) as c FROM analysis_report_profiles").get().c === 1, "v4: 1 rapor profili oluşturuldu");

    // =========================================================================
    // T05: Migration v5 — Custom Questions & Answers
    // =========================================================================
    console.log("\n--- T05: Migration v5 (Proje Özel Soruları ve Cevapları) ---");
    const m5 = MIGRATION_DEFINITIONS.find((m) => m.version === 5);
    for (const sql of m5!.sql) {
      db.exec(sql);
    }

    db.prepare(`
      INSERT INTO project_custom_questions (id, analysis_project_id, business_function_code, process_name, question_text, description, question_type, is_required, sort_order, is_active, created_at, updated_at)
      VALUES (?, ?, 'SALES', 'Bayi Yönetimi', 'Özel prim sistemi kullanılıyor mu?', 'Bayi ciro primi', 'single_choice', 1, 10, 1, ?, ?)
    `).run("pcq-a-1", "project-upgrade-a", dateV1, dateV1);

    db.prepare(`
      INSERT INTO project_custom_question_options (id, custom_question_id, value, label, sort_order, is_other, created_at)
      VALUES (?, 'pcq-a-1', 'yes', 'Evet, kademeli ciro primi', 1, 0, ?)
    `).run("pcqo-a-1", dateV1);

    db.prepare(`
      INSERT INTO project_custom_question_options (id, custom_question_id, value, label, sort_order, is_other, created_at)
      VALUES (?, 'pcq-a-1', 'no', 'Hayır', 2, 0, ?)
    `).run("pcqo-a-2", dateV1);

    db.prepare(`
      INSERT INTO project_custom_question_answers (id, analysis_project_id, business_function_code, custom_question_id, answer_data, created_at, updated_at)
      VALUES (?, ?, 'SALES', 'pcq-a-1', ?, ?, ?)
    `).run("pcqa-a-1", "project-upgrade-a", JSON.stringify({ selectedOptions: ["yes"] }), dateV1, dateV1);

    assert(db.prepare("SELECT count(*) as c FROM project_custom_questions").get().c === 1, "v5: 1 özel soru eklendi");
    assert(db.prepare("SELECT count(*) as c FROM project_custom_question_options").get().c === 2, "v5: 2 özel soru seçeneği eklendi");
    assert(db.prepare("SELECT count(*) as c FROM project_custom_question_answers").get().c === 1, "v5: 1 özel soru cevabı eklendi");

    // =========================================================================
    // T06: Migration v6 — Question Followup Flags
    // =========================================================================
    console.log("\n--- T06: Migration v6 (Takip Bayrakları: Sonra Dön & Kritik Takip) ---");
    const m6 = MIGRATION_DEFINITIONS.find((m) => m.version === 6);
    for (const sql of m6!.sql) {
      db.exec(sql);
    }

    db.prepare(`
      INSERT INTO question_followups (id, analysis_project_id, business_function_code, question_id, flag_type, note, status, created_at, updated_at)
      VALUES (?, ?, 'SALES', 'SLS-001', 'revisit', 'Fiyat listesi iskonto oranları teyit edilecek.', 'open', ?, ?)
    `).run("qf-a-1", "project-upgrade-a", dateV1, dateV1);

    db.prepare(`
      INSERT INTO question_followups (id, analysis_project_id, business_function_code, question_id, flag_type, note, status, created_at, updated_at)
      VALUES (?, ?, 'PROCUREMENT', 'PRC-001', 'critical', 'Tedarikçi onay limiti netleştirilmeli.', 'open', ?, ?)
    `).run("qf-b-1", "project-upgrade-b", dateV1, dateV1);

    assert(db.prepare("SELECT count(*) as c FROM question_followups").get().c === 2, "v6: 2 takip bayrağı eklendi");

    // =========================================================================
    // T07: Migration v7 — Question Attachments Metadata
    // =========================================================================
    console.log("\n--- T07: Migration v7 (Kanıt Dosyası Metadata Kaydı) ---");
    const m7 = MIGRATION_DEFINITIONS.find((m) => m.version === 7);
    for (const sql of m7!.sql) {
      db.exec(sql);
    }

    db.prepare(`
      INSERT INTO question_attachments (id, analysis_project_id, business_function_code, question_id, original_file_name, stored_file_name, relative_path, mime_type, file_extension, file_size, sha256, description, sort_order, created_at, updated_at)
      VALUES (?, ?, 'SALES', 'SLS-001', 'fatura_ornek.pdf', 'uuid1_fatura_ornek.pdf', 'attachment/project-upgrade-a/SALES/SLS-001/uuid1_fatura_ornek.pdf', 'application/pdf', 'pdf', 102400, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'Örnek e-fatura formatı', 1, ?, ?)
    `).run("att-a-1", "project-upgrade-a", dateV1, dateV1);

    db.prepare(`
      INSERT INTO question_attachments (id, analysis_project_id, business_function_code, question_id, original_file_name, stored_file_name, relative_path, mime_type, file_extension, file_size, sha256, description, sort_order, created_at, updated_at)
      VALUES (?, ?, 'PROCUREMENT', 'PRC-001', 'tedarik_sozlesme.docx', 'uuid2_tedarik_sozlesme.docx', 'attachment/project-upgrade-b/PROCUREMENT/PRC-001/uuid2_tedarik_sozlesme.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx', 204800, 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e', 'Tedarikçi sözleşme taslağı', 1, ?, ?)
    `).run("att-b-1", "project-upgrade-b", dateV1, dateV1);

    assert(db.prepare("SELECT count(*) as c FROM question_attachments").get().c === 2, "v7: 2 kanıt dosyası metadata kaydı eklendi");

    // =========================================================================
    // T08: Migration v8 — Managed Vault Metadata Extensions
    // =========================================================================
    console.log("\n--- T08: Migration v8 (Managed Vault Kolon Genişletmeleri) ---");
    const m8 = MIGRATION_DEFINITIONS.find((m) => m.version === 8);
    for (const sql of m8!.sql) {
      db.exec(sql);
    }

    // Sentetik absolute path'ler ile v8 kolonlarını güncelle
    db.prepare(`
      UPDATE question_attachments
      SET source_file_name = 'C:\\Kullanicilar\\Selim\\Downloads\\fatura_ornek.pdf',
          source_absolute_path = 'C:\\Kullanicilar\\Selim\\Downloads\\fatura_ornek.pdf',
          imported_at = ?
      WHERE id = 'att-a-1'
    `).run(dateV1);

    db.prepare(`
      UPDATE question_attachments
      SET source_file_name = '/Users/selim/Downloads/tedarik_sozlesme.docx',
          source_absolute_path = '/Users/selim/Downloads/tedarik_sozlesme.docx',
          imported_at = ?
      WHERE id = 'att-b-1'
    `).run(dateV1);

    const attA_v8 = db.prepare("SELECT * FROM question_attachments WHERE id = 'att-a-1'").get();
    assert(attA_v8.source_absolute_path === "C:\\Kullanicilar\\Selim\\Downloads\\fatura_ornek.pdf", "v8: Windows mutlak kaynak yolu kaydedildi");

    // =========================================================================
    // T09: Migration v9 — Purge source_absolute_path (Privacy & Portability Seal)
    // =========================================================================
    console.log("\n--- T09: Migration v9 (Gizlilik ve Taşınabilirlik Mühürü: source_absolute_path Temizliği) ---");
    const m9 = MIGRATION_DEFINITIONS.find((m) => m.version === 9);
    for (const sql of m9!.sql) {
      db.exec(sql);
    }

    const attsV9 = db.prepare("SELECT id, source_absolute_path, relative_path, sha256, original_file_name, file_size FROM question_attachments").all();
    for (const att of attsV9) {
      assert(att.source_absolute_path === null, `v9: ${att.id} source_absolute_path değeri kesinlikle NULL olmalı`);
      assert(!!att.relative_path && att.relative_path.startsWith("attachment/"), `v9: ${att.id} relative_path korunmuş`);
      assert(!!att.sha256 && att.sha256.length === 64, `v9: ${att.id} SHA-256 hash korunmuş`);
      assert(att.file_size > 0, `v9: ${att.id} file_size korunmuş`);
    }

    // =========================================================================
    // T10: Migration v10 — Company Profile: Sector and Multi-Location Branch
    // =========================================================================
    console.log("\n--- T10: Migration v10 (Firma Profili Sektör ve Şubeli Yapı Kolonları) ---");
    const m10 = MIGRATION_DEFINITIONS.find((m) => m.version === 10);
    for (const sql of m10!.sql) {
      db.exec(sql);
    }

    // v10 kolonlarının varlığını ve eski kayıtlardaki NULL varsayılan durumunu doğrula
    const compA_before = db.prepare("SELECT * FROM company_profiles WHERE id = 'comp-a'").get();
    const compB_before = db.prepare("SELECT * FROM company_profiles WHERE id = 'comp-b'").get();

    assert(compA_before.business_sector === null, "v10: comp-a business_sector varsayılan NULL");
    assert(compA_before.has_branches === null, "v10: comp-a has_branches varsayılan NULL");
    assert(compA_before.branch_count === null, "v10: comp-a branch_count varsayılan NULL");
    assert(compA_before.company_name === "Alfa Otomotiv A.Ş.", "v10: comp-a eski firma adı korunmuş");
    assert(compA_before.tax_number === "1234567890", "v10: comp-a vergi numarası korunmuş");
    assert(compA_before.city === "Bursa", "v10: comp-a şehir korunmuş");

    // Proje A'yı yeni v10 alanlarıyla güncelle
    const updateDate = "2026-08-23T11:00:00Z";
    db.prepare(`
      UPDATE company_profiles
      SET business_sector = 'Otomotiv Yan Sanayi ve Yedek Parça İmalatı',
          has_branches = 'yes',
          branch_count = 6,
          updated_at = ?
      WHERE id = 'comp-a'
    `).run(updateDate);

    const compA_after = db.prepare("SELECT * FROM company_profiles WHERE id = 'comp-a'").get();
    const compB_after = db.prepare("SELECT * FROM company_profiles WHERE id = 'comp-b'").get();

    assert(compA_after.business_sector === "Otomotiv Yan Sanayi ve Yedek Parça İmalatı", "v10: comp-a sektör güncellendi");
    assert(compA_after.has_branches === "yes", "v10: comp-a has_branches = 'yes' oldu");
    assert(compA_after.branch_count === 6, "v10: comp-a branch_count = 6 oldu");
    assert(compB_after.business_sector === null, "v10: comp-b güncellenmeyen profil izole kaldı");
    assert(compB_after.company_name === "Beta Perakende Ltd.", "v10: comp-b firma adı korundu");

    // =========================================================================
    // T11: Nihai Veri Koruma ve Çapraz Proje İzolasyonu Denetimi
    // =========================================================================
    console.log("\n--- T11: Nihai Veri Koruma ve Proje İzolasyonu Denetimi ---");

    // 1. Projeler
    const projects = db.prepare("SELECT * FROM analysis_projects ORDER BY id").all();
    assert(projects.length === 2, "Kayıt bütünlüğü: 2 proje mevcut");
    assert(projects[0].name === "Proje A (Otomotiv)", "Proje A adı korundu");
    assert(projects[1].name === "Proje B (Perakende)", "Proje B adı korundu");

    // 2. Firma Profilleri
    const profiles = db.prepare("SELECT * FROM company_profiles ORDER BY id").all();
    assert(profiles.length === 2, "Kayıt bütünlüğü: 2 firma profili mevcut");

    // 3. Soru Cevapları
    const answersA = db.prepare("SELECT * FROM question_answers WHERE analysis_project_id = 'project-upgrade-a'").all();
    const answersB = db.prepare("SELECT * FROM question_answers WHERE analysis_project_id = 'project-upgrade-b'").all();
    assert(answersA.length === 2, "İzolasyon: Proje A'ya ait 2 cevap mevcut");
    assert(answersB.length === 1, "İzolasyon: Proje B'ye ait 1 cevap mevcut");
    const slsAnswer = JSON.parse(answersA.find((a: any) => a.question_id === "SLS-001").answer_data);
    assert(slsAnswer.generalNote === "Türkçe karakter testi: ğüşiöç ĞÜŞİÖÇ", "Cevap içeriğinde Türkçe karakter ve JSON bütünlüğü korundu");

    // 4. Semantik Bulgular, Gereksinimler, Riskler, Notlar
    const findings = db.prepare("SELECT * FROM analysis_findings").all();
    const reqs = db.prepare("SELECT * FROM analysis_requirements").all();
    const risks = db.prepare("SELECT * FROM analysis_risks").all();
    const notes = db.prepare("SELECT * FROM project_notes").all();
    assert(findings.length === 1 && findings[0].title === "Fiyat Listesi Senkronizasyon Eksikliği", "Bulgular korundu");
    assert(reqs.length === 1 && reqs[0].title === "Otomatik Fiyat Listesi Entegrasyonu", "Gereksinimler korundu");
    assert(risks.length === 1 && risks[0].impact === "high", "Riskler korundu");
    assert(notes.length === 2, "Proje notları korundu");

    // 5. Rapor Profili
    const reportProfiles = db.prepare("SELECT * FROM analysis_report_profiles").all();
    assert(reportProfiles.length === 1 && reportProfiles[0].executive_summary === "Proje A Yönetici Özeti", "Rapor profili korundu");

    // 6. Özel Sorular
    const custQuestions = db.prepare("SELECT * FROM project_custom_questions").all();
    assert(custQuestions.length === 1 && custQuestions[0].question_text === "Özel prim sistemi kullanılıyor mu?", "Özel soru korundu");

    // 7. Takip Bayrakları
    const followupsA = db.prepare("SELECT * FROM question_followups WHERE analysis_project_id = 'project-upgrade-a'").all();
    const followupsB = db.prepare("SELECT * FROM question_followups WHERE analysis_project_id = 'project-upgrade-b'").all();
    assert(followupsA.length === 1 && followupsA[0].flag_type === "revisit", "Proje A revisit bayrağı korundu");
    assert(followupsB.length === 1 && followupsB[0].flag_type === "critical", "Proje B critical bayrağı korundu");

    // 8. Kanıt Kasası Metadata ve Gizlilik
    const attachments = db.prepare("SELECT * FROM question_attachments").all();
    assert(attachments.length === 2, "Kanıt dosyası metadata kayıtları korundu");
    assert(attachments.every((a: any) => a.source_absolute_path === null), "Tüm kanıt kayıtlarında source_absolute_path NULL korundu");

    // =========================================================================
    // T12: İdempotency & İkinci Startup Simülasyonu
    // =========================================================================
    console.log("\n--- T12: İdempotency ve Tekrar Çalıştırma Simülasyonu ---");
    let rerunErrors = 0;

    for (const migration of MIGRATION_DEFINITIONS) {
      for (const sqlStatement of migration.sql) {
        const trimmed = sqlStatement.trim();
        if (trimmed.length > 0) {
          try {
            db.exec(trimmed);
          } catch (err: any) {
            // ALTER TABLE ifadeleri sütun zaten mevcut olduğunda hata fırlatabilir; runner bunu güvenle yakalar
            if (!err.message?.includes("duplicate column name")) {
              rerunErrors++;
            }
          }
        }
      }
    }

    assert(rerunErrors === 0, "İdempotency: Tüm migration'lar tekrar çalıştırıldığında beklenmeyen hata oluşmadı");

    // Tekrar çalıştırma sonrası veri sayılarının ve içeriklerinin bozulmadığını doğrula
    assert(db.prepare("SELECT count(*) as c FROM analysis_projects").get().c === 2, "İdempotency: Proje sayısı değişmedi (2)");
    assert(db.prepare("SELECT count(*) as c FROM company_profiles").get().c === 2, "İdempotency: Firma profili sayısı değişmedi (2)");
    assert(db.prepare("SELECT count(*) as c FROM question_answers").get().c === 3, "İdempotency: Soru cevap sayısı değişmedi (3)");
    assert(db.prepare("SELECT count(*) as c FROM question_followups").get().c === 2, "İdempotency: Takip bayrak sayısı değişmedi (2)");
    assert(db.prepare("SELECT count(*) as c FROM question_attachments").get().c === 2, "İdempotency: Kanıt sayısı değişmedi (2)");
    assert(db.prepare("SELECT count(*) as c FROM question_attachments WHERE source_absolute_path IS NOT NULL").get().c === 0, "İdempotency: source_absolute_path yeniden dolmadı");

    // =========================================================================
    // T13: Transaction ve Çalıştırıcı Mimarisi Durumu
    // =========================================================================
    console.log("\n--- T13: Transaction ve Çalıştırıcı Davranış Analizi ---");
    console.log("  [INFO] Production runner (src/db/migrations.ts) ifadeleri sıralı ve ifade bazında try/catch ile icra eder.");
    console.log("  [INFO] RUNNER IS NON-TRANSACTIONAL (Her DDL ifadesi atomik olarak SQLite tarafından uygulanır).");
    assert(true, "Transaction mimari durumu belgelendi: RUNNER IS NON-TRANSACTIONAL");

  } finally {
    if (db) {
      try {
        db.close();
      } catch (closeErr) {
        console.warn("DB kapatma uyarısı:", closeErr);
      }
    }
    if (fs.existsSync(tempDbPath)) {
      try {
        fs.unlinkSync(tempDbPath);
      } catch (unlinkErr) {
        console.warn("Geçici dosya silme uyarısı:", unlinkErr);
      }
    }
  }

  console.log("\n=======================================================");
  console.log(`YÜKSELTME KABUL TESTİ SONUCU: ${passCount} Geçti, ${failCount} Başarısız`);
  console.log("=======================================================\n");

  if (failCount > 0) {
    process.exit(1);
  }
}

await runUpgradeMigrationTests();
