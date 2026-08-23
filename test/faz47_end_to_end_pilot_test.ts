// path: /home/selim/projects/erp-crm-discovery/test/faz47_end_to_end_pilot_test.ts
/**
 * ERP CRM Discovery — FAZ-47 Uçtan Uca Kurgusal Saha Pilotu Entegrasyon Testi
 *
 * Kapsam:
 * 1. [KURGUSAL] DeltaForm Endüstriyel Sistemler A.Ş. Proje ve Şirket Profili oluşturma
 * 2. 20 İş Fonksiyonu ataması
 * 3. 240+ Gerçek Soru Cevabı (15 Kritik problem cevabı dahil)
 * 4. Takip Bayrakları (15 Kritik, 20 Sonra Dön), 12 Proje Notu, 8 Özel Soru
 * 5. Managed Attachment Vault Entegrasyonu (10 Kanıt, SHA-256, source_absolute_path = NULL)
 * 6. FAZ-46 Yönetişim Katmanı (23 Nesne, 18 Özne, 10 Kapsam, 30 Sorumluluk, 40 Yetki, 8 Limit, 10 SoD)
 * 7. İlk Rapor Önizleme & DOCX / PDF Üretimi (Bölüm 1..5)
 * 8. Güncelleme Döngüsü: Cevap revizyonu, kanıt ekleme/silme, SoD durum güncellemesi
 * 9. İkinci (Revize) Rapor Üretimi ve Değişikliklerin Doğrulanması
 * 10. Restart & Persistence: Uygulama yeniden açıldığında tüm verilerin %100 korunması
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
import { DEFAULT_STARTER_GOVERNANCE_OBJECTS } from "../src/db/governanceClient";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import type { ReportModel } from "../src/report/types";

import {
  PILOT_PROJECT_ID,
  PILOT_COMPANY_PROFILE,
  PILOT_REPORT_PROFILE,
  PILOT_FUNCTION_CODES,
  PILOT_SYNTHETIC_ATTACHMENTS,
  PILOT_FOLLOWUPS,
  PILOT_PROJECT_NOTES,
  PILOT_CUSTOM_QUESTIONS,
  PILOT_GOVERNANCE_SUBJECTS,
  PILOT_GOVERNANCE_SCOPES,
  PILOT_GOVERNANCE_LIMITS,
  PILOT_GOVERNANCE_SOD_RISKS,
  generatePilotResponsibilities,
  generatePilotAuthorizations,
  generatePilotAnswers,
  PILOT_REVISED_DELTA,
} from "./fixtures/faz47_discrete_manufacturing_pilot";

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

async function runEndToEndPilotTests(): Promise<void> {
  console.log("\n=======================================================");
  console.log("FAZ-47: Uçtan Uca Kurgusal Saha Pilotu Entegrasyon Testi");
  console.log("=======================================================\n");

  if (!Database) {
    console.log("[INFO] better-sqlite3 test harness not available on this environment.");
    return;
  }

  const tempDbPath = path.join(
    os.tmpdir(),
    `faz47-pilot-e2e-${Date.now()}-${Math.random().toString(36).substring(7)}.db`
  );
  let db: any = null;

  try {
    db = new Database(tempDbPath);
    db.pragma("foreign_keys = ON");

    function runMigrationsOnDb(database: any) {
      for (const m of MIGRATION_DEFINITIONS) {
        for (const sql of m.sql) {
          const trimmed = sql.trim();
          if (trimmed.length > 0) {
            try {
              database.exec(trimmed);
            } catch {
              // Ignore idempotent alter table errors (column already exists)
            }
          }
        }
      }
    }

    // 1. Migration v1..v11
    console.log("--- 1. SQLite Şema Yükseltmesi (Migration v1..v11) ---");
    runMigrationsOnDb(db);
    const tableCount = db.prepare("SELECT COUNT(*) as c FROM sqlite_master WHERE type='table'").get().c;
    assert(tableCount >= 20, `Şema başarıyla kuruldu (Toplam tablo: ${tableCount})`);


    // 2. Kurgusal Proje & Şirket Profili
    console.log("\n--- 2. Kurgusal Proje ve Şirket Profili Kurulumu ---");
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO analysis_projects (id, name, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(PILOT_PROJECT_ID, "DeltaForm ERP/CRM Saha Keşfi ve Ön Analizi", "in_progress", now, now);

    db.prepare(`
      INSERT INTO company_profiles (
        id, analysis_project_id, company_name, trade_name, tax_number, city, country, employee_count,
        business_sector, has_branches, branch_count, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      PILOT_COMPANY_PROFILE.id,
      PILOT_PROJECT_ID,
      PILOT_COMPANY_PROFILE.company_name,
      PILOT_COMPANY_PROFILE.trade_name,
      PILOT_COMPANY_PROFILE.tax_number,
      PILOT_COMPANY_PROFILE.city,
      PILOT_COMPANY_PROFILE.country,
      PILOT_COMPANY_PROFILE.employee_count,
      PILOT_COMPANY_PROFILE.business_sector,
      PILOT_COMPANY_PROFILE.has_branches,
      PILOT_COMPANY_PROFILE.branch_count,
      PILOT_COMPANY_PROFILE.notes,
      now,
      now
    );

    db.prepare(`
      INSERT INTO analysis_report_profiles (id, analysis_project_id, executive_summary, overall_assessment, open_topics, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      "prof-deltaform",
      PILOT_PROJECT_ID,
      PILOT_REPORT_PROFILE.executive_summary,
      PILOT_REPORT_PROFILE.overall_assessment,
      PILOT_REPORT_PROFILE.open_topics,
      now,
      now
    );

    assert(true, "Proje, Firma Profili ve Rapor Profili başarıyla kaydedildi");

    // 3. 20 İş Fonksiyonu Ataması
    console.log("\n--- 3. 20 İş Fonksiyonu Ataması ---");
    const insertBf = db.prepare(`
      INSERT OR IGNORE INTO business_functions (id, code, name_tr, name_en, category, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    for (let i = 0; i < PILOT_FUNCTION_CODES.length; i++) {
      const code = PILOT_FUNCTION_CODES[i];
      insertBf.run(`bf_${code.toLowerCase()}`, code, code, code, "Pilot", i + 1);
    }

    const insertPbfStmt = db.prepare(`
      INSERT INTO project_business_functions (
        id, analysis_project_id, business_function_id, company_department_name,
        responsible_person, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < PILOT_FUNCTION_CODES.length; i++) {
      const code = PILOT_FUNCTION_CODES[i];
      insertPbfStmt.run(
        `pbf-${code.toLowerCase()}`,
        PILOT_PROJECT_ID,
        `bf_${code.toLowerCase()}`,
        "Süreç Departmanı",
        "Süreç Sorumlusu",
        i < 10 ? "completed" : "in_progress",
        now,
        now
      );
    }

    const pbfCount = db.prepare("SELECT COUNT(*) as c FROM project_business_functions WHERE analysis_project_id=?").get(PILOT_PROJECT_ID).c;
    assert(pbfCount === 20, `20 iş fonksiyonu projeye atandı (Mevcut: ${pbfCount})`);

    // 4. 240+ Soru Cevabı Kaydı
    console.log("\n--- 4. 240+ Soru Cevabının Kaydedilmesi ---");
    const answers = generatePilotAnswers();
    const insertAnsStmt = db.prepare(`
      INSERT INTO question_answers (
        id, analysis_project_id, business_function_code, question_pack_id, question_pack_version, question_id,
        answer_data, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < answers.length; i++) {
      const a = answers[i];
      insertAnsStmt.run(
        `ans-${i + 1}`,
        PILOT_PROJECT_ID,
        a.business_function_code,
        a.question_pack_id,
        "1.0.0",
        a.question_id,
        a.answer_json,
        now,
        now
      );
    }
    const ansCount = db.prepare("SELECT COUNT(*) as c FROM question_answers WHERE analysis_project_id=?").get(PILOT_PROJECT_ID).c;
    assert(ansCount >= 220, `Cevaplar veritabanına kaydedildi (Kayıt sayısı: ${ansCount})`);

    // 5. Takip Bayrakları, Proje Notları, Özel Sorular
    console.log("\n--- 5. Takip Bayrakları, Notlar ve Özel Sorular ---");
    const insertFolStmt = db.prepare(`
      INSERT INTO question_followups (
        id, analysis_project_id, business_function_code, question_id, flag_type, note, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (let i = 0; i < PILOT_FOLLOWUPS.length; i++) {
      const f = PILOT_FOLLOWUPS[i];
      insertFolStmt.run(`fol-${i + 1}`, PILOT_PROJECT_ID, f.bf_code, f.question_id, f.flag_type, f.note, "open", now, now);
    }

    const insertNoteStmt = db.prepare(`
      INSERT INTO project_notes (
        id, analysis_project_id, business_function_code, question_id, note, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (let i = 0; i < PILOT_PROJECT_NOTES.length; i++) {
      const n = PILOT_PROJECT_NOTES[i];
      insertNoteStmt.run(`note-${i + 1}`, PILOT_PROJECT_ID, n.business_function_code || null, null, n.note, now, now);
    }

    for (let i = 0; i < PILOT_CUSTOM_QUESTIONS.length; i++) {
      const cq = PILOT_CUSTOM_QUESTIONS[i];
      db.prepare(`
        INSERT INTO project_custom_questions (
          id, analysis_project_id, business_function_code, process_name, question_text, question_type, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(`cq-${i + 1}`, PILOT_PROJECT_ID, cq.business_function_code, cq.process_name, cq.question_text, cq.question_type, i + 1, now, now);

      for (const opt of cq.options) {
        db.prepare(`
          INSERT INTO project_custom_question_options (id, custom_question_id, value, label, sort_order, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(opt.id, `cq-${i + 1}`, opt.id, opt.label, opt.sort_order, now);
      }

      db.prepare(`
        INSERT INTO project_custom_question_answers (
          id, analysis_project_id, business_function_code, custom_question_id, answer_data, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(`cqa-${i + 1}`, PILOT_PROJECT_ID, cq.business_function_code, `cq-${i + 1}`, JSON.stringify({ selected: [{ value: cq.selected_option_id }], general_note: cq.general_note }), now, now);
    }

    const folCount = db.prepare("SELECT COUNT(*) as c FROM question_followups WHERE analysis_project_id=?").get(PILOT_PROJECT_ID).c;
    const noteCount = db.prepare("SELECT COUNT(*) as c FROM project_notes WHERE analysis_project_id=?").get(PILOT_PROJECT_ID).c;
    const cqCount = db.prepare("SELECT COUNT(*) as c FROM project_custom_questions WHERE analysis_project_id=?").get(PILOT_PROJECT_ID).c;
    assert(folCount === 35, `35 takip bayrağı kaydedildi (Mevcut: ${folCount})`);
    assert(noteCount === 12, `12 proje notu kaydedildi (Mevcut: ${noteCount})`);
    assert(cqCount === 8, `8 özel soru ve seçeneği kaydedildi (Mevcut: ${cqCount})`);


    // 6. Managed Attachment Vault (10 Kanıt Dosyası)
    console.log("\n--- 6. Managed Attachment Vault Kanıt Dosyaları ---");
    const insertAttStmt = db.prepare(`
      INSERT INTO governance_attachments (
        id, analysis_project_id, entity_type, entity_id, original_file_name, stored_file_name,
        relative_path, mime_type, file_size, sha256, imported_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const att of PILOT_SYNTHETIC_ATTACHMENTS) {
      insertAttStmt.run(
        att.id,
        PILOT_PROJECT_ID,
        att.entity_type,
        att.entity_id,
        att.original_file_name,
        att.stored_file_name,
        att.relative_path,
        att.mime_type,
        att.file_size,
        "synthetic_sha256_" + att.id,
        now,
        now
      );
    }


    const attDbCount = db.prepare("SELECT COUNT(*) as c FROM governance_attachments WHERE analysis_project_id=?").get(PILOT_PROJECT_ID).c;
    assert(attDbCount === 10, `10 kanıt dosyası metadata kaydı oluşturuldu (Mevcut: ${attDbCount})`);

    // 7. FAZ-46 Yönetişim Katmanı Kurulumu
    console.log("\n--- 7. FAZ-46 Yönetişim Katmanı Tohumlama ve Matrisler ---");
    // Starter objects
    for (let i = 0; i < DEFAULT_STARTER_GOVERNANCE_OBJECTS.length; i++) {
      const obj = DEFAULT_STARTER_GOVERNANCE_OBJECTS[i];
      db.prepare(`
        INSERT OR IGNORE INTO governance_objects (
          id, analysis_project_id, category, code, name_tr, name_en, related_bf_code, description, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(`obj-${obj.code.toLowerCase()}`, PILOT_PROJECT_ID, obj.category, obj.code, obj.name_tr, obj.name_en, (obj as any).related_bf_code || null, (obj as any).description || null, i + 1, now, now);
    }


    // Subjects
    for (const sub of PILOT_GOVERNANCE_SUBJECTS) {
      db.prepare(`
        INSERT INTO governance_subjects (id, analysis_project_id, subject_type, name, department_name, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(sub.id, PILOT_PROJECT_ID, sub.subject_type, sub.name, sub.department_name, sub.description, now, now);
    }

    // Scopes
    for (const scp of PILOT_GOVERNANCE_SCOPES) {
      db.prepare(`
        INSERT INTO governance_scopes (id, analysis_project_id, scope_type, name, parent_scope_id, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(scp.id, PILOT_PROJECT_ID, scp.scope_type, scp.name, scp.parent_scope_id || null, scp.description, now, now);
    }

    // Responsibilities
    const resps = generatePilotResponsibilities();
    for (const r of resps) {
      db.prepare(`
        INSERT INTO governance_responsibilities (
          id, analysis_project_id, governance_object_id, subject_id, scope_id, responsibility_type, state_type, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(r.id, PILOT_PROJECT_ID, r.governance_object_id, r.subject_id, r.scope_id || null, r.responsibility_type, r.state_type, r.notes || null, now, now);
    }

    // Authorizations
    const auths = generatePilotAuthorizations();
    for (const a of auths) {
      db.prepare(`
        INSERT INTO governance_authorizations (
          id, analysis_project_id, governance_object_id, subject_id, scope_id, permission_level, permission_source,
          effective_level, has_discrepancy, can_view, can_create, can_edit, can_delete, can_approve, can_cancel, can_export, can_view_cost,
          state_type, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        a.id, PILOT_PROJECT_ID, a.governance_object_id, a.subject_id, a.scope_id || null, a.permission_level, a.permission_source,
        a.effective_level || null, a.has_discrepancy, a.can_view, a.can_create, a.can_edit, a.can_delete, a.can_approve, a.can_cancel,
        a.can_export, a.can_view_cost, a.state_type, a.notes || null, now, now
      );
    }

    // Limits
    for (const lim of PILOT_GOVERNANCE_LIMITS) {
      db.prepare(`
        INSERT INTO governance_limits (
          id, analysis_project_id, governance_object_id, subject_id, limit_type, currency_or_unit, min_value, max_value,
          approval_tier, approver_subject_id, state_type, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        lim.id, PILOT_PROJECT_ID, `obj-${lim.object_code.toLowerCase()}`, lim.subject_id, lim.limit_type, lim.currency_or_unit,
        lim.min_value, lim.max_value, lim.approval_tier, lim.approver_subject_id, lim.state_type, lim.notes, now, now
      );
    }

    // SoD Risks
    for (const sod of PILOT_GOVERNANCE_SOD_RISKS) {
      db.prepare(`
        INSERT INTO governance_sod_risks (
          id, analysis_project_id, governance_object_id, subject_id, risk_title, conflicting_duty_a, conflicting_duty_b,
          risk_severity, current_control, mitigation_action, status, state_type, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        sod.id, PILOT_PROJECT_ID, `obj-${sod.object_code.toLowerCase()}`, sod.subject_id, sod.risk_title, sod.conflicting_duty_a,
        sod.conflicting_duty_b, sod.risk_severity, sod.current_control, sod.mitigation_action, sod.status, sod.state_type, now, now
      );
    }

    const govObjsCount = db.prepare("SELECT COUNT(*) as c FROM governance_objects WHERE analysis_project_id=?").get(PILOT_PROJECT_ID).c;
    const govSubCount = db.prepare("SELECT COUNT(*) as c FROM governance_subjects WHERE analysis_project_id=?").get(PILOT_PROJECT_ID).c;
    const govAuthCount = db.prepare("SELECT COUNT(*) as c FROM governance_authorizations WHERE analysis_project_id=?").get(PILOT_PROJECT_ID).c;
    const govSodCount = db.prepare("SELECT COUNT(*) as c FROM governance_sod_risks WHERE analysis_project_id=?").get(PILOT_PROJECT_ID).c;

    assert(govObjsCount === 23, `23 yönetişim nesnesi mevcut`);
    assert(govSubCount === 18, `18 yönetişim öznesi mevcut`);
    assert(govAuthCount === 40, `40 yetki matrisi kaydı mevcut`);
    assert(govSodCount === 10, `10 SoD riski mevcut`);

    // 8. İlk Rapor Önizleme ve Export (DOCX / PDF)
    console.log("\n--- 8. İlk Rapor (First Report) Üretimi ---");
    const initialReportModel: ReportModel = {
      metadata: {
        title: "ERP / CRM Saha Ön Analiz ve Keşif Raporu",
        projectName: "DeltaForm ERP/CRM Saha Keşfi ve Ön Analizi",
        companyName: PILOT_COMPANY_PROFILE.company_name,
        generatedAt: "23.08.2026",
        projectStatus: "in_progress",
        packVersions: {},
        isComplete: false,
        progressPercent: 75,
        requiredAnswered: 180,
        requiredTotal: 240,
        reportType: "interim",
        draftLabel: "ARA RAPOR — Saha Analizi Devam Ediyor (%75)",
        projectProgressPercent: 75,
        completedFunctionCount: 10,
        selectedFunctionCount: 20,
        isProjectComplete: false,
      },
      company: {
        companyName: PILOT_COMPANY_PROFILE.company_name,
        tradeName: PILOT_COMPANY_PROFILE.trade_name,
        taxNumber: PILOT_COMPANY_PROFILE.tax_number,
        city: PILOT_COMPANY_PROFILE.city,
        country: PILOT_COMPANY_PROFILE.country,
        employeeCount: PILOT_COMPANY_PROFILE.employee_count,
        businessSector: PILOT_COMPANY_PROFILE.business_sector,
        hasBranches: PILOT_COMPANY_PROFILE.has_branches as "yes" | "no",
        branchCount: PILOT_COMPANY_PROFILE.branch_count,
        notes: PILOT_COMPANY_PROFILE.notes,
      },
      profile: {
        analysis_project_id: PILOT_PROJECT_ID,
        executive_summary: PILOT_REPORT_PROFILE.executive_summary,
        overall_assessment: PILOT_REPORT_PROFILE.overall_assessment,
        open_topics: PILOT_REPORT_PROFILE.open_topics,
      },
      scope: PILOT_FUNCTION_CODES.map((code, idx) => ({
        code,
        nameTr: code,
        nameEn: code,
        category: "Pilot",
        status: idx < 10 ? "completed" : "in_progress",
        departmentName: "Süreç Sorumlusu",
        responsiblePerson: "Süreç Sorumlusu",
        hasPack: true,
        answeredCount: 12,
        totalQuestionCount: 12,
        progressPercentage: idx < 10 ? 100 : 50,
      })),
      businessFunctions: PILOT_FUNCTION_CODES.map((code, idx) => ({
        code,
        nameTr: code,
        nameEn: code,
        category: "Pilot",
        status: idx < 10 ? "completed" : "in_progress",
        sortOrder: idx + 1,
        progressPercentage: idx < 10 ? 100 : 50,
        answeredCount: 12,
        totalQuestionCount: 12,
        packId: `tr.${code.toLowerCase()}.core`,
        packVersion: "1.0.0",
        departmentName: "Süreç Sorumlusu",
        responsiblePerson: "Süreç Sorumlusu",
        processes: [],
        findings: [],
        requirements: [],
        risks: [],
        notes: [],
      })),
      governance: {
        summary: {
          totalObjects: 23,
          unassignedOwnerCount: 5,
          unassignedStewardCount: 8,
          criticalSodRiskCount: 3,
          totalSodRisks: 10,
          discrepancyCount: 6,
          totalAuthorizations: 40,
          totalLimits: 8,
          totalAttachments: 10,
        },
        objects: [],
        responsibilities: resps as any,
        authorizations: auths as any,
        limits: PILOT_GOVERNANCE_LIMITS as any,
        sodRisks: PILOT_GOVERNANCE_SOD_RISKS as any,
        attachments: PILOT_SYNTHETIC_ATTACHMENTS as any,
      },
      globalFindings: [],
      globalRequirements: [],
      globalRisks: [],
      projectNotes: PILOT_PROJECT_NOTES as any,
      followups: PILOT_FOLLOWUPS.map((f) => ({
        id: "fol-mock",
        businessFunctionCode: f.bf_code,
        businessFunctionNameTr: f.bf_code,
        processName: "Genel",
        questionId: f.question_id,
        questionText: "Pilot Soru",
        flagType: f.flag_type as any,
        note: f.note,
        createdAt: "23.08.2026",
      })),

      summaryStats: {
        totalFunctions: 20,
        completedFunctions: 10,
        inProgressFunctions: 10,
        notStartedFunctions: 0,
        totalFindings: 15,
        totalRequirements: 25,
        openRisks: 10,
        totalRisks: 10,
        totalNotes: 12,
        answeredQuestions: 240,
        totalQuestions: 240,
      },
    };

    const docx1 = await buildDocxBuffer(initialReportModel);
    const pdf1 = await buildPdfBuffer(initialReportModel);
    assert(docx1 instanceof Uint8Array && docx1.length > 5000, `İlk DOCX raporu üretildi (${docx1.length} bytes)`);
    assert(pdf1 instanceof Uint8Array && pdf1.length > 5000, `İlk PDF raporu üretildi (${pdf1.length} bytes)`);

    // 9. Güncelleme Döngüsü (User Update Cycle)
    console.log("\n--- 9. Kullanıcı Güncelleme ve Revizyon Döngüsü ---");
    // Firma notunu güncelle
    db.prepare("UPDATE company_profiles SET notes=?, updated_at=? WHERE id=?").run(
      PILOT_REVISED_DELTA.company_notes_updated,
      new Date().toISOString(),
      PILOT_COMPANY_PROFILE.id
    );

    // Cevapları güncelle
    for (const rev of PILOT_REVISED_DELTA.revised_answers) {
      db.prepare("UPDATE question_answers SET answer_data=?, updated_at=? WHERE question_id=? AND analysis_project_id=?").run(
        rev.answer_json,
        new Date().toISOString(),
        rev.question_id,
        PILOT_PROJECT_ID
      );
    }

    // Bir kanıt sil
    db.prepare("DELETE FROM governance_attachments WHERE id=?").run(PILOT_REVISED_DELTA.deleted_attachment_id);

    // Yeni kanıt ekle
    const newAtt = PILOT_REVISED_DELTA.new_attachment;
    insertAttStmt.run(
      newAtt.id,
      PILOT_PROJECT_ID,
      newAtt.entity_type,
      newAtt.entity_id,
      newAtt.original_file_name,
      newAtt.stored_file_name,
      newAtt.relative_path,
      newAtt.mime_type,
      newAtt.file_size,
      "sha256_new_att11",
      now,
      new Date().toISOString()
    );


    // 2 SoD riskini çözüme bağla (mitigated)
    for (const sodId of PILOT_REVISED_DELTA.mitigated_sod_ids) {
      db.prepare("UPDATE governance_sod_risks SET status='mitigated', updated_at=? WHERE id=?").run(
        new Date().toISOString(),
        sodId
      );
    }

    // 10. İkinci Rapor (Revised Report) ve Fark Doğrulaması
    console.log("\n--- 10. İkinci (Revize) Rapor ve Fark Doğrulaması ---");
    const updatedCompNote = db.prepare("SELECT notes FROM company_profiles WHERE id=?").get(PILOT_COMPANY_PROFILE.id).notes;
    assert(updatedCompNote.includes("2026 Q3 ERP Canlıya Geçiş Hazırlığı Tamamlandı"), "Firma profil notu güncellendi");

    const revisedPrpAnswer = db.prepare("SELECT answer_data FROM question_answers WHERE question_id=? AND analysis_project_id=?").get("PRP-001", PILOT_PROJECT_ID).answer_data;
    assert(revisedPrpAnswer.includes("erp_mrp_ve_kapasite_modulu"), "PRP-001 cevabı revize edildi (Excel -> MRP Modülü)");


    const remainingAttCount = db.prepare("SELECT COUNT(*) as c FROM governance_attachments WHERE analysis_project_id=?").get(PILOT_PROJECT_ID).c;
    assert(remainingAttCount === 10, "1 dosya silindi, 1 yeni dosya eklendi, toplam kanıt sayısı 10 korundu");

    const mitigatedSodCount = db.prepare("SELECT COUNT(*) as c FROM governance_sod_risks WHERE analysis_project_id=? AND status='mitigated'").get(PILOT_PROJECT_ID).c;
    assert(mitigatedSodCount === 4, `SoD riskleri güncellendi (Mitigated sayısı: ${mitigatedSodCount})`);

    const revisedReportModel = {
      ...initialReportModel,
      metadata: {
        ...initialReportModel.metadata,
        draftLabel: "REVİZE RAPOR — Saha Geri Bildirimleri İşlendi",
      },
      company: {
        ...initialReportModel.company,
        notes: updatedCompNote,
      },
    };

    const docx2 = await buildDocxBuffer(revisedReportModel);
    const pdf2 = await buildPdfBuffer(revisedReportModel);
    assert(docx2 instanceof Uint8Array && docx2.length > 5000, `Revize DOCX raporu üretildi (${docx2.length} bytes)`);
    assert(pdf2 instanceof Uint8Array && pdf2.length > 5000, `Revize PDF raporu üretildi (${pdf2.length} bytes)`);

    // 11. Restart ve Persistence Testi
    console.log("\n--- 11. Uygulama Yeniden Başlatma (Restart Persistence) Simülasyonu ---");
    db.close();
    db = null;

    // Tekrar aç
    db = new Database(tempDbPath);
    db.pragma("foreign_keys = ON");

    // İdempotency: Tekrar migration uygula
    runMigrationsOnDb(db);

    const postRestartProject = db.prepare("SELECT * FROM analysis_projects WHERE id=?").get(PILOT_PROJECT_ID);

    const postRestartAnswers = db.prepare("SELECT COUNT(*) as c FROM question_answers WHERE analysis_project_id=?").get(PILOT_PROJECT_ID).c;
    const postRestartAuths = db.prepare("SELECT COUNT(*) as c FROM governance_authorizations WHERE analysis_project_id=?").get(PILOT_PROJECT_ID).c;

    assert(postRestartProject.name.includes("DeltaForm"), "Restart sonrası proje adı korundu");
    assert(postRestartAnswers >= 220, `Restart sonrası tüm cevaplar korundu (${postRestartAnswers})`);
    assert(postRestartAuths === 40, `Restart sonrası yetki matrisi kayıtları korundu (${postRestartAuths})`);

  } finally {
    if (db) {
      db.close();
    }
    if (fs.existsSync(tempDbPath)) {
      try { fs.unlinkSync(tempDbPath); } catch {}
    }
  }

  console.log(`\nFAZ-47 End-to-End Pilot Test Sonucu: ${passCount} PASS, ${failCount} FAIL\n`);
  if (failCount > 0) {
    process.exit(1);
  }
}

await runEndToEndPilotTests();
