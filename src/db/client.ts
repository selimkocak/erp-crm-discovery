/**
 * ERP CRM Discovery — Database Client
 *
 * Bu dosya yalnızca Tauri Desktop ortamında çalışmak üzere tasarlanmıştır.
 * Veri zinciri: React → Tauri IPC → @tauri-apps/plugin-sql → SQLite (disk)
 *
 * Tauri IPC başlatılamıyorsa sessizce başka bir storage'a DÜŞMEYİZ.
 * Hata açık ve anlaşılır biçimde fırlatılır (fail-fast).
 *
 * localStorage / memory fallback YOKTUR.
 */

import Database from "@tauri-apps/plugin-sql";
import { runMigrations } from "./migrations";
import { reconcileAndMigrateLegacyAttachments } from "../storage/attachmentMigration";
import type {
  BusinessFunction,
  CompanyProfile,
  CreateProjectPayload,
  EnrichedProjectFunction,
  FunctionStatus,
  ProjectDetailData,
  ProjectListItem,
  Finding,
  Requirement,
  Risk,
  ProjectNote,
  SemanticSummaryCounts,
  ProjectCustomQuestion,
  ProjectCustomQuestionOption,
  CustomQuestionType,
  QuestionFollowup,
  FollowupFlagType,
  FollowupSummaryCounts,
  QuestionAttachment,
  CreateQuestionAttachmentPayload,
  AttachmentSummaryStats,
} from "../types";
import type { AnswerData } from "../engine/types";

// ---------------------------------------------------------------
// Singleton DB instance
// ---------------------------------------------------------------
let dbInstance: Database | null = null;

/**
 * Tauri IPC üzerinden SQLite veritabanını başlatır.
 * Başarısız olursa hata fırlatır — sessiz fallback yoktur.
 */
export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  try {
    const db = await Database.load("sqlite:erp_discovery.db");
    await runMigrations(db);
    try {
      await reconcileAndMigrateLegacyAttachments(db);
    } catch (migErr) {
      console.warn("[ERP Discovery] Attachment reconciliation warning:", migErr);
    }
    dbInstance = db;
    return dbInstance;
  } catch (err) {
    const message =
      `[ERP Discovery] Tauri SQL plugin başlatılamadı.\n` +
      `Uygulama yalnızca Tauri Desktop ortamında çalışır.\n` +
      `Hata: ${String(err)}`;
    console.error(message);
    throw new Error(message);
  }
}

// ---------------------------------------------------------------
// Yardımcı
// ---------------------------------------------------------------
export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ---------------------------------------------------------------
// 1. Proje listesi
// ---------------------------------------------------------------
export async function getProjects(): Promise<ProjectListItem[]> {
  const db = await getDb();
  return db.select<ProjectListItem[]>(`
    SELECT
      p.id,
      p.name,
      p.status,
      p.created_at,
      p.updated_at,
      COALESCE(c.company_name, 'İsimsiz Firma') as company_name,
      c.city,
      (SELECT COUNT(*) FROM project_business_functions pbf WHERE pbf.analysis_project_id = p.id) as selected_function_count
    FROM analysis_projects p
    LEFT JOIN company_profiles c ON c.analysis_project_id = p.id
    ORDER BY p.updated_at DESC
  `);
}

// ---------------------------------------------------------------
// 2. Master iş fonksiyonları listesi
// ---------------------------------------------------------------
export async function getMasterBusinessFunctions(): Promise<BusinessFunction[]> {
  const db = await getDb();
  return db.select<BusinessFunction[]>(`
    SELECT id, code, name_tr, name_en, category, sort_order, is_active
    FROM business_functions
    WHERE is_active = 1
    ORDER BY sort_order ASC
  `);
}

// ---------------------------------------------------------------
// 3. Yeni analiz projesi oluştur
// ---------------------------------------------------------------
export async function createProject(payload: CreateProjectPayload): Promise<string> {
  const db = await getDb();
  const projectId = generateId("proj");
  const companyProfileId = generateId("comp");
  const now = new Date().toISOString();

  // 1. Proje kaydı
  await db.execute(
    `INSERT INTO analysis_projects (id, name, status, created_at, updated_at)
     VALUES ($1, $2, 'active', $3, $3)`,
    [projectId, payload.projectName, now]
  );

  // 2. Firma profili
  await db.execute(
    `INSERT INTO company_profiles
     (id, analysis_project_id, company_name, trade_name, tax_number, city, country, employee_count, business_sector, has_branches, branch_count, notes, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)`,
    [
      companyProfileId,
      projectId,
      payload.company.company_name,
      payload.company.trade_name ?? null,
      payload.company.tax_number ?? null,
      payload.company.city ?? null,
      payload.company.country ?? "Türkiye",
      payload.company.employee_count ?? null,
      payload.company.business_sector ?? null,
      payload.company.has_branches ?? null,
      payload.company.branch_count ?? null,
      payload.company.notes ?? null,
      now,
    ]
  );

  // 3. Seçilen iş fonksiyonları
  for (const bfId of payload.selectedFunctionIds) {
    const pbfId = generateId("pbf");
    await db.execute(
      `INSERT INTO project_business_functions
       (id, analysis_project_id, business_function_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, 'not_started', $4, $4)`,
      [pbfId, projectId, bfId, now]
    );
  }

  return projectId;
}

// ---------------------------------------------------------------
// 4. Proje detayı
// ---------------------------------------------------------------
export async function getProjectDetail(projectId: string): Promise<ProjectDetailData | null> {
  const db = await getDb();

  const projects = await db.select<ProjectDetailData["project"][]>(
    `SELECT id, name, status, created_at, updated_at FROM analysis_projects WHERE id = $1`,
    [projectId]
  );
  if (projects.length === 0) return null;
  const project = projects[0];

  const companies = await db.select<ProjectDetailData["company"][]>(
    `SELECT id, analysis_project_id, company_name, trade_name, tax_number, city, country, employee_count, business_sector, has_branches, branch_count, notes, created_at, updated_at
     FROM company_profiles WHERE analysis_project_id = $1`,
    [projectId]
  );
  const company = companies[0] ?? {
    id: generateId("comp"),
    analysis_project_id: projectId,
    company_name: "Bilinmeyen Firma",
    country: "Türkiye",
    created_at: project.created_at,
    updated_at: project.updated_at,
  };

  const functions = await db.select<EnrichedProjectFunction[]>(
    `SELECT
       pbf.id,
       pbf.analysis_project_id,
       pbf.business_function_id,
       pbf.company_department_name,
       pbf.responsible_person,
       pbf.status,
       pbf.created_at,
       pbf.updated_at,
       bf.code,
       bf.name_tr,
       bf.name_en,
       bf.category,
       bf.sort_order
     FROM project_business_functions pbf
     JOIN business_functions bf ON bf.id = pbf.business_function_id
     WHERE pbf.analysis_project_id = $1
     ORDER BY bf.sort_order ASC`,
    [projectId]
  );

  return { project, company, functions };
}

// ---------------------------------------------------------------
// 4.1 Firma Profilini Güncelle
// ---------------------------------------------------------------
export async function updateCompanyProfile(
  projectId: string,
  payload: Partial<CompanyProfile>
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE company_profiles
     SET company_name = COALESCE($1, company_name),
         trade_name = $2,
         tax_number = $3,
         city = $4,
         country = COALESCE($5, country),
         employee_count = $6,
         business_sector = $7,
         has_branches = $8,
         branch_count = $9,
         notes = $10,
         updated_at = $11
     WHERE analysis_project_id = $12`,
    [
      payload.company_name ?? null,
      payload.trade_name ?? null,
      payload.tax_number ?? null,
      payload.city ?? null,
      payload.country ?? null,
      payload.employee_count ?? null,
      payload.business_sector ?? null,
      payload.has_branches ?? null,
      payload.branch_count ?? null,
      payload.notes ?? null,
      now,
      projectId,
    ]
  );
}

// ---------------------------------------------------------------
// 5. İş fonksiyonu güncelle
// ---------------------------------------------------------------
export async function updateProjectBusinessFunction(
  id: string,
  updates: {
    company_department_name?: string;
    responsible_person?: string;
    status?: FunctionStatus;
  }
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE project_business_functions
     SET company_department_name = COALESCE($1, company_department_name),
         responsible_person = COALESCE($2, responsible_person),
         status = COALESCE($3, status),
         updated_at = $4
     WHERE id = $5`,
    [
      updates.company_department_name !== undefined ? updates.company_department_name : null,
      updates.responsible_person !== undefined ? updates.responsible_person : null,
      updates.status ?? null,
      now,
      id,
    ]
  );
}

// ---------------------------------------------------------------
// 6. Proje sil (cascade + physical storage cleanup)
// ---------------------------------------------------------------
export async function deleteProject(projectId: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM analysis_projects WHERE id = $1`, [projectId]);
  try {
    const { deleteProjectAttachmentsDirectory } = await import("../storage/attachmentManager");
    await deleteProjectAttachmentsDirectory(projectId);
  } catch (err) {
    console.error("Proje ekler klasörü temizlenirken hata:", err);
  }
}

// ---------------------------------------------------------------
// 7. Cevap kaydet (UPSERT)
// ---------------------------------------------------------------
export async function saveAnswer(
  projectId: string,
  bfCode: string,
  packId: string,
  packVersion: string,
  questionId: string,
  answerData: AnswerData
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = generateId("qa");
  const answerJson = JSON.stringify(answerData);

  await db.execute(
    `INSERT INTO question_answers
       (id, analysis_project_id, business_function_code, question_pack_id, question_pack_version, question_id, answer_data, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
     ON CONFLICT(analysis_project_id, business_function_code, question_id)
     DO UPDATE SET
       answer_data = $7,
       question_pack_version = $5,
       updated_at = $8`,
    [id, projectId, bfCode, packId, packVersion, questionId, answerJson, now]
  );
}

// ---------------------------------------------------------------
// 8. Tek soru cevabını oku
// ---------------------------------------------------------------
export async function getAnswer(
  projectId: string,
  bfCode: string,
  questionId: string
): Promise<AnswerData | null> {
  const db = await getDb();
  const rows = await db.select<{ answer_data: string }[]>(
    `SELECT answer_data FROM question_answers
     WHERE analysis_project_id = $1
       AND business_function_code = $2
       AND question_id = $3
     LIMIT 1`,
    [projectId, bfCode, questionId]
  );
  if (rows.length === 0) return null;
  try {
    return JSON.parse(rows[0].answer_data) as AnswerData;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------
// 9. Tüm cevapları Map olarak oku
// ---------------------------------------------------------------
export async function getAllAnswers(
  projectId: string,
  bfCode: string
): Promise<Map<string, AnswerData>> {
  const db = await getDb();
  const rows = await db.select<{ question_id: string; answer_data: string }[]>(
    `SELECT question_id, answer_data FROM question_answers
     WHERE analysis_project_id = $1
       AND business_function_code = $2`,
    [projectId, bfCode]
  );
  const map = new Map<string, AnswerData>();
  for (const row of rows) {
    try {
      map.set(row.question_id, JSON.parse(row.answer_data) as AnswerData);
    } catch {
      // Bozuk JSON kaydı atla
    }
  }
  return map;
}

// ---------------------------------------------------------------
// 10. Son soru ID'sini kaydet (resume-from-where-you-left-off)
// ---------------------------------------------------------------
export async function saveLastQuestionId(
  projectId: string,
  bfCode: string,
  questionId: string
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = generateId("qss");

  await db.execute(
    `INSERT INTO question_session_state
       (id, analysis_project_id, business_function_code, last_question_id, updated_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT(analysis_project_id, business_function_code)
     DO UPDATE SET last_question_id = $4, updated_at = $5`,
    [id, projectId, bfCode, questionId, now]
  );
}

// ---------------------------------------------------------------
// 11. Son soru ID'sini oku
// ---------------------------------------------------------------
export async function getLastQuestionId(
  projectId: string,
  bfCode: string
): Promise<string | null> {
  const db = await getDb();
  const rows = await db.select<{ last_question_id: string | null }[]>(
    `SELECT last_question_id FROM question_session_state
     WHERE analysis_project_id = $1
       AND business_function_code = $2
     LIMIT 1`,
    [projectId, bfCode]
  );
  return rows[0]?.last_question_id ?? null;
}

// ---------------------------------------------------------------
// 12. İş fonksiyonu status güncelle (progress sonucuna göre)
// ---------------------------------------------------------------
export async function updateFunctionStatusByCode(
  projectId: string,
  bfCode: string,
  newStatus: FunctionStatus
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE project_business_functions
     SET status = $1, updated_at = $2
     WHERE analysis_project_id = $3
       AND business_function_id = (
         SELECT id FROM business_functions WHERE code = $4 LIMIT 1
       )`,
    [newStatus, now, projectId, bfCode]
  );
}

// ─────────────────────────────────────────────────────────────
// FAZ-3: Semantic Layer CRUD (Findings, Requirements, Risks, Notes)
// ─────────────────────────────────────────────────────────────

// ---------------------------------------------------------------
// 13. Findings (Bulgular)
// ---------------------------------------------------------------
export async function createFinding(
  payload: Omit<Finding, "id" | "created_at" | "updated_at">
): Promise<string> {
  const db = await getDb();
  const id = generateId("fnd");
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO analysis_findings
      (id, analysis_project_id, business_function_code, question_id, title, description, priority, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)`,
    [
      id,
      payload.analysis_project_id,
      payload.business_function_code,
      payload.question_id ?? null,
      payload.title,
      payload.description ?? "",
      payload.priority ?? "medium",
      payload.status ?? "open",
      now,
    ]
  );
  return id;
}

export async function updateFinding(
  id: string,
  updates: Partial<Pick<Finding, "title" | "description" | "priority" | "status" | "business_function_code" | "question_id">>
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE analysis_findings
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         priority = COALESCE($3, priority),
         status = COALESCE($4, status),
         business_function_code = COALESCE($5, business_function_code),
         question_id = CASE WHEN $6 IS NOT NULL THEN $7 ELSE question_id END,
         updated_at = $8
     WHERE id = $9`,
    [
      updates.title ?? null,
      updates.description ?? null,
      updates.priority ?? null,
      updates.status ?? null,
      updates.business_function_code ?? null,
      updates.question_id !== undefined ? 1 : null,
      updates.question_id ?? null,
      now,
      id,
    ]
  );
}

export async function deleteFinding(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM analysis_findings WHERE id = $1`, [id]);
}

export async function getFindings(
  projectId: string,
  bfCode?: string,
  questionId?: string
): Promise<Finding[]> {
  const db = await getDb();
  let query = `SELECT * FROM analysis_findings WHERE analysis_project_id = $1`;
  const params: unknown[] = [projectId];

  if (bfCode) {
    params.push(bfCode);
    query += ` AND business_function_code = $${params.length}`;
  }
  if (questionId) {
    params.push(questionId);
    query += ` AND question_id = $${params.length}`;
  }
  query += ` ORDER BY created_at DESC`;
  return db.select<Finding[]>(query, params);
}

// ---------------------------------------------------------------
// 14. Requirements (Gereksinimler)
// ---------------------------------------------------------------
export async function createRequirement(
  payload: Omit<Requirement, "id" | "created_at" | "updated_at">
): Promise<string> {
  const db = await getDb();
  const id = generateId("req");
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO analysis_requirements
      (id, analysis_project_id, business_function_code, question_id, title, description, priority, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)`,
    [
      id,
      payload.analysis_project_id,
      payload.business_function_code,
      payload.question_id ?? null,
      payload.title,
      payload.description ?? "",
      payload.priority ?? "medium",
      payload.status ?? "draft",
      now,
    ]
  );
  return id;
}

export async function updateRequirement(
  id: string,
  updates: Partial<Pick<Requirement, "title" | "description" | "priority" | "status" | "business_function_code" | "question_id">>
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE analysis_requirements
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         priority = COALESCE($3, priority),
         status = COALESCE($4, status),
         business_function_code = COALESCE($5, business_function_code),
         question_id = CASE WHEN $6 IS NOT NULL THEN $7 ELSE question_id END,
         updated_at = $8
     WHERE id = $9`,
    [
      updates.title ?? null,
      updates.description ?? null,
      updates.priority ?? null,
      updates.status ?? null,
      updates.business_function_code ?? null,
      updates.question_id !== undefined ? 1 : null,
      updates.question_id ?? null,
      now,
      id,
    ]
  );
}

export async function deleteRequirement(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM analysis_requirements WHERE id = $1`, [id]);
}

export async function getRequirements(
  projectId: string,
  bfCode?: string,
  questionId?: string
): Promise<Requirement[]> {
  const db = await getDb();
  let query = `SELECT * FROM analysis_requirements WHERE analysis_project_id = $1`;
  const params: unknown[] = [projectId];

  if (bfCode) {
    params.push(bfCode);
    query += ` AND business_function_code = $${params.length}`;
  }
  if (questionId) {
    params.push(questionId);
    query += ` AND question_id = $${params.length}`;
  }
  query += ` ORDER BY created_at DESC`;
  return db.select<Requirement[]>(query, params);
}

// ---------------------------------------------------------------
// 15. Risks (Riskler)
// ---------------------------------------------------------------
export async function createRisk(
  payload: Omit<Risk, "id" | "created_at" | "updated_at">
): Promise<string> {
  const db = await getDb();
  const id = generateId("rsk");
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO analysis_risks
      (id, analysis_project_id, business_function_code, question_id, title, description, impact, probability, mitigation_note, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)`,
    [
      id,
      payload.analysis_project_id,
      payload.business_function_code,
      payload.question_id ?? null,
      payload.title,
      payload.description ?? "",
      payload.impact ?? "medium",
      payload.probability ?? "medium",
      payload.mitigation_note ?? null,
      payload.status ?? "open",
      now,
    ]
  );
  return id;
}

export async function updateRisk(
  id: string,
  updates: Partial<Pick<Risk, "title" | "description" | "impact" | "probability" | "mitigation_note" | "status" | "business_function_code" | "question_id">>
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE analysis_risks
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         impact = COALESCE($3, impact),
         probability = COALESCE($4, probability),
         mitigation_note = CASE WHEN $5 IS NOT NULL THEN $6 ELSE mitigation_note END,
         status = COALESCE($7, status),
         business_function_code = COALESCE($8, business_function_code),
         question_id = CASE WHEN $9 IS NOT NULL THEN $10 ELSE question_id END,
         updated_at = $11
     WHERE id = $12`,
    [
      updates.title ?? null,
      updates.description ?? null,
      updates.impact ?? null,
      updates.probability ?? null,
      updates.mitigation_note !== undefined ? 1 : null,
      updates.mitigation_note ?? null,
      updates.status ?? null,
      updates.business_function_code ?? null,
      updates.question_id !== undefined ? 1 : null,
      updates.question_id ?? null,
      now,
      id,
    ]
  );
}

export async function deleteRisk(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM analysis_risks WHERE id = $1`, [id]);
}

export async function getRisks(
  projectId: string,
  bfCode?: string,
  questionId?: string
): Promise<Risk[]> {
  const db = await getDb();
  let query = `SELECT * FROM analysis_risks WHERE analysis_project_id = $1`;
  const params: unknown[] = [projectId];

  if (bfCode) {
    params.push(bfCode);
    query += ` AND business_function_code = $${params.length}`;
  }
  if (questionId) {
    params.push(questionId);
    query += ` AND question_id = $${params.length}`;
  }
  query += ` ORDER BY created_at DESC`;
  return db.select<Risk[]>(query, params);
}

// ---------------------------------------------------------------
// 16. Project Notes (Proje Notları)
// ---------------------------------------------------------------
export async function createProjectNote(
  payload: Omit<ProjectNote, "id" | "created_at" | "updated_at">
): Promise<string> {
  const db = await getDb();
  const id = generateId("not");
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO project_notes
      (id, analysis_project_id, business_function_code, question_id, note, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $6)`,
    [
      id,
      payload.analysis_project_id,
      payload.business_function_code ?? null,
      payload.question_id ?? null,
      payload.note,
      now,
    ]
  );
  return id;
}

export async function updateProjectNote(
  id: string,
  updates: { note: string; business_function_code?: string | null; question_id?: string | null }
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE project_notes
     SET note = $1,
         business_function_code = CASE WHEN $2 IS NOT NULL THEN $3 ELSE business_function_code END,
         question_id = CASE WHEN $4 IS NOT NULL THEN $5 ELSE question_id END,
         updated_at = $6
     WHERE id = $7`,
    [
      updates.note,
      updates.business_function_code !== undefined ? 1 : null,
      updates.business_function_code ?? null,
      updates.question_id !== undefined ? 1 : null,
      updates.question_id ?? null,
      now,
      id,
    ]
  );
}

export async function deleteProjectNote(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM project_notes WHERE id = $1`, [id]);
}

export async function getProjectNotes(
  projectId: string,
  bfCode?: string,
  questionId?: string
): Promise<ProjectNote[]> {
  const db = await getDb();
  let query = `SELECT * FROM project_notes WHERE analysis_project_id = $1`;
  const params: unknown[] = [projectId];

  if (bfCode) {
    params.push(bfCode);
    query += ` AND business_function_code = $${params.length}`;
  }
  if (questionId) {
    params.push(questionId);
    query += ` AND question_id = $${params.length}`;
  }
  query += ` ORDER BY created_at DESC`;
  return db.select<ProjectNote[]>(query, params);
}

// ---------------------------------------------------------------
// 17. Semantik Özet Sayıları (Project Detail için)
// ---------------------------------------------------------------
export async function getSemanticSummaryCounts(
  projectId: string
): Promise<SemanticSummaryCounts> {
  const db = await getDb();
  const [fCount, rCount, riskStats, nCount] = await Promise.all([
    db.select<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM analysis_findings WHERE analysis_project_id = $1`,
      [projectId]
    ),
    db.select<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM analysis_requirements WHERE analysis_project_id = $1`,
      [projectId]
    ),
    db.select<{ total: number; open: number }[]>(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open
       FROM analysis_risks WHERE analysis_project_id = $1`,
      [projectId]
    ),
    db.select<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM project_notes WHERE analysis_project_id = $1`,
      [projectId]
    ),
  ]);

  return {
    findingCount: fCount[0]?.count ?? 0,
    requirementCount: rCount[0]?.count ?? 0,
    openRiskCount: riskStats[0]?.open ?? 0,
    totalRiskCount: riskStats[0]?.total ?? 0,
    noteCount: nCount[0]?.count ?? 0,
  };
}

// ---------------------------------------------------------------
// 18. Report Profile (Yönetici Özeti, Genel Değerlendirme, Açık Konular)
// ---------------------------------------------------------------
export interface ReportProfileData {
  id?: string;
  analysis_project_id: string;
  executive_summary: string | null;
  overall_assessment: string | null;
  open_topics: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function getReportProfile(projectId: string): Promise<ReportProfileData | null> {
  const db = await getDb();
  const rows = await db.select<ReportProfileData[]>(
    `SELECT id, analysis_project_id, executive_summary, overall_assessment, open_topics, created_at, updated_at
     FROM analysis_report_profiles
     WHERE analysis_project_id = $1
     LIMIT 1`,
    [projectId]
  );
  return rows[0] ?? null;
}

export async function saveReportProfile(
  projectId: string,
  profile: {
    executive_summary?: string | null;
    overall_assessment?: string | null;
    open_topics?: string | null;
  }
): Promise<void> {
  const db = await getDb();
  const id = generateId("rp");
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO analysis_report_profiles
       (id, analysis_project_id, executive_summary, overall_assessment, open_topics, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $6)
     ON CONFLICT(analysis_project_id)
     DO UPDATE SET
       executive_summary = CASE WHEN $3 IS NOT NULL THEN $3 ELSE executive_summary END,
       overall_assessment = CASE WHEN $4 IS NOT NULL THEN $4 ELSE overall_assessment END,
       open_topics = CASE WHEN $5 IS NOT NULL THEN $5 ELSE open_topics END,
       updated_at = $6`,
    [
      id,
      projectId,
      profile.executive_summary !== undefined ? profile.executive_summary : null,
      profile.overall_assessment !== undefined ? profile.overall_assessment : null,
      profile.open_topics !== undefined ? profile.open_topics : null,
      now,
    ]
  );
}

// ─────────────────────────────────────────────────────────────
// FAZ-8: Project Custom Questions & Options & Answers CRUD
// ─────────────────────────────────────────────────────────────

export interface CreateCustomQuestionPayload {
  analysis_project_id: string;
  business_function_code: string;
  process_name: string;
  question_text: string;
  description?: string | null;
  question_type: CustomQuestionType;
  is_required?: boolean;
  sort_order?: number;
  options?: { value: string; label: string; is_other?: boolean }[];
}

export async function createCustomQuestion(
  payload: CreateCustomQuestionPayload
): Promise<string> {
  const db = await getDb();
  const id = generateId(`cq_${payload.business_function_code.toLowerCase()}`);
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO project_custom_questions
      (id, analysis_project_id, business_function_code, process_name, question_text, description, question_type, is_required, sort_order, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, $10, $10)`,
    [
      id,
      payload.analysis_project_id,
      payload.business_function_code,
      payload.process_name,
      payload.question_text,
      payload.description ?? null,
      payload.question_type,
      payload.is_required ? 1 : 0,
      payload.sort_order ?? 100,
      now,
    ]
  );

  if (payload.options && payload.options.length > 0) {
    for (let i = 0; i < payload.options.length; i++) {
      const opt = payload.options[i];
      const optId = generateId("cqo");
      await db.execute(
        `INSERT INTO project_custom_question_options
          (id, custom_question_id, value, label, sort_order, is_other, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [optId, id, opt.value, opt.label, i + 1, opt.is_other ? 1 : 0, now]
      );
    }
  }

  return id;
}

export async function getCustomQuestions(
  projectId: string,
  bfCode?: string
): Promise<ProjectCustomQuestion[]> {
  const db = await getDb();
  let questions: ProjectCustomQuestion[];

  if (bfCode) {
    questions = await db.select<ProjectCustomQuestion[]>(
      `SELECT id, analysis_project_id, business_function_code, process_name, question_text, description, question_type, is_required, sort_order, is_active, created_at, updated_at
       FROM project_custom_questions
       WHERE analysis_project_id = $1 AND business_function_code = $2 AND is_active = 1
       ORDER BY sort_order ASC, created_at ASC`,
      [projectId, bfCode]
    );
  } else {
    questions = await db.select<ProjectCustomQuestion[]>(
      `SELECT id, analysis_project_id, business_function_code, process_name, question_text, description, question_type, is_required, sort_order, is_active, created_at, updated_at
       FROM project_custom_questions
       WHERE analysis_project_id = $1 AND is_active = 1
       ORDER BY sort_order ASC, created_at ASC`,
      [projectId]
    );
  }

  if (questions.length === 0) return [];

  const qIds = questions.map((q) => q.id);
  const placeholders = qIds.map((_, i) => `$${i + 1}`).join(", ");
  const options = await db.select<ProjectCustomQuestionOption[]>(
    `SELECT id, custom_question_id, value, label, sort_order, is_other, created_at
     FROM project_custom_question_options
     WHERE custom_question_id IN (${placeholders})
     ORDER BY sort_order ASC`,
    qIds
  );

  const optionsMap = new Map<string, ProjectCustomQuestionOption[]>();
  for (const opt of options) {
    if (!optionsMap.has(opt.custom_question_id)) {
      optionsMap.set(opt.custom_question_id, []);
    }
    optionsMap.get(opt.custom_question_id)!.push(opt);
  }

  for (const q of questions) {
    q.options = optionsMap.get(q.id) || [];
  }

  return questions;
}

export async function updateCustomQuestion(
  id: string,
  payload: Partial<CreateCustomQuestionPayload>
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE project_custom_questions
     SET question_text = COALESCE($2, question_text),
         description = CASE WHEN $3 IS NOT NULL THEN $3 ELSE description END,
         process_name = COALESCE($4, process_name),
         question_type = COALESCE($5, question_type),
         is_required = CASE WHEN $6 IS NOT NULL THEN $6 ELSE is_required END,
         updated_at = $7
     WHERE id = $1`,
    [
      id,
      payload.question_text ?? null,
      payload.description !== undefined ? payload.description : null,
      payload.process_name ?? null,
      payload.question_type ?? null,
      payload.is_required !== undefined ? (payload.is_required ? 1 : 0) : null,
      now,
    ]
  );

  if (payload.options) {
    await db.execute(`DELETE FROM project_custom_question_options WHERE custom_question_id = $1`, [id]);
    for (let i = 0; i < payload.options.length; i++) {
      const opt = payload.options[i];
      const optId = generateId("cqo");
      await db.execute(
        `INSERT INTO project_custom_question_options
          (id, custom_question_id, value, label, sort_order, is_other, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [optId, id, opt.value, opt.label, i + 1, opt.is_other ? 1 : 0, now]
      );
    }
  }
}

export async function deleteCustomQuestion(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM project_custom_questions WHERE id = $1`, [id]);
}

export async function saveCustomAnswer(
  projectId: string,
  bfCode: string,
  customQuestionId: string,
  answerData: AnswerData
): Promise<void> {
  const db = await getDb();
  const id = generateId("cqa");
  const now = new Date().toISOString();
  const rawJson = JSON.stringify(answerData);

  await db.execute(
    `INSERT INTO project_custom_question_answers
       (id, analysis_project_id, business_function_code, custom_question_id, answer_data, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $6)
     ON CONFLICT(analysis_project_id, custom_question_id)
     DO UPDATE SET answer_data = $5, updated_at = $6`,
    [id, projectId, bfCode, customQuestionId, rawJson, now]
  );
}

export async function getCustomAnswers(
  projectId: string,
  bfCode?: string
): Promise<Map<string, AnswerData>> {
  const db = await getDb();
  let rows: { custom_question_id: string; answer_data: string }[];

  if (bfCode) {
    rows = await db.select<{ custom_question_id: string; answer_data: string }[]>(
      `SELECT custom_question_id, answer_data
       FROM project_custom_question_answers
       WHERE analysis_project_id = $1 AND business_function_code = $2`,
      [projectId, bfCode]
    );
  } else {
    rows = await db.select<{ custom_question_id: string; answer_data: string }[]>(
      `SELECT custom_question_id, answer_data
       FROM project_custom_question_answers
       WHERE analysis_project_id = $1`,
      [projectId]
    );
  }

  const map = new Map<string, AnswerData>();
  for (const r of rows) {
    try {
      map.set(r.custom_question_id, JSON.parse(r.answer_data));
    } catch {
      map.set(r.custom_question_id, {});
    }
  }
  return map;
}

// ─────────────────────────────────────────────────────────────
// FAZ-9: Question Follow-up Flags (Sonra Dön & Kritik Takip)
// ─────────────────────────────────────────────────────────────

export interface SetQuestionFollowupPayload {
  analysis_project_id: string;
  business_function_code: string;
  question_id: string;
  flag_type: FollowupFlagType;
  note?: string | null;
}

export async function setQuestionFollowup(
  payload: SetQuestionFollowupPayload
): Promise<string> {
  const db = await getDb();
  const id = generateId("qf");
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO question_followups
       (id, analysis_project_id, business_function_code, question_id, flag_type, note, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'open', $7, $7)
     ON CONFLICT(analysis_project_id, business_function_code, question_id)
     DO UPDATE SET
       flag_type = $5,
       note = $6,
       status = 'open',
       updated_at = $7,
       resolved_at = NULL`,
    [
      id,
      payload.analysis_project_id,
      payload.business_function_code,
      payload.question_id,
      payload.flag_type,
      payload.note ?? null,
      now,
    ]
  );
  return id;
}

export async function removeQuestionFollowup(
  projectId: string,
  bfCode: string,
  questionId: string
): Promise<void> {
  const db = await getDb();
  await db.execute(
    `DELETE FROM question_followups
     WHERE analysis_project_id = $1 AND business_function_code = $2 AND question_id = $3`,
    [projectId, bfCode, questionId]
  );
}

export async function resolveQuestionFollowup(
  projectId: string,
  bfCode: string,
  questionId: string
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE question_followups
     SET status = 'resolved', resolved_at = $4, updated_at = $4
     WHERE analysis_project_id = $1 AND business_function_code = $2 AND question_id = $3`,
    [projectId, bfCode, questionId, now]
  );
}

export async function getQuestionFollowups(
  projectId: string,
  bfCode?: string
): Promise<Map<string, QuestionFollowup>> {
  const db = await getDb();
  let rows: QuestionFollowup[];

  if (bfCode) {
    rows = await db.select<QuestionFollowup[]>(
      `SELECT id, analysis_project_id, business_function_code, question_id, flag_type, note, status, created_at, updated_at, resolved_at
       FROM question_followups
       WHERE analysis_project_id = $1 AND business_function_code = $2 AND status = 'open'`,
      [projectId, bfCode]
    );
  } else {
    rows = await db.select<QuestionFollowup[]>(
      `SELECT id, analysis_project_id, business_function_code, question_id, flag_type, note, status, created_at, updated_at, resolved_at
       FROM question_followups
       WHERE analysis_project_id = $1 AND status = 'open'`,
      [projectId]
    );
  }

  const map = new Map<string, QuestionFollowup>();
  for (const r of rows) {
    map.set(r.question_id, r);
  }
  return map;
}

export async function getAllProjectFollowups(
  projectId: string
): Promise<QuestionFollowup[]> {
  const db = await getDb();
  return db.select<QuestionFollowup[]>(
    `SELECT id, analysis_project_id, business_function_code, question_id, flag_type, note, status, created_at, updated_at, resolved_at
     FROM question_followups
     WHERE analysis_project_id = $1 AND status = 'open'
     ORDER BY created_at ASC`,
    [projectId]
  );
}

export async function getFollowupSummaryCounts(
  projectId: string,
  bfCode?: string
): Promise<FollowupSummaryCounts> {
  const db = await getDb();
  let rows: { flag_type: FollowupFlagType; count: number }[];

  if (bfCode) {
    rows = await db.select<{ flag_type: FollowupFlagType; count: number }[]>(
      `SELECT flag_type, COUNT(*) as count
       FROM question_followups
       WHERE analysis_project_id = $1 AND business_function_code = $2 AND status = 'open'
       GROUP BY flag_type`,
      [projectId, bfCode]
    );
  } else {
    rows = await db.select<{ flag_type: FollowupFlagType; count: number }[]>(
      `SELECT flag_type, COUNT(*) as count
       FROM question_followups
       WHERE analysis_project_id = $1 AND status = 'open'
       GROUP BY flag_type`,
      [projectId]
    );
  }

  let revisitCount = 0;
  let criticalCount = 0;

  for (const r of rows) {
    if (r.flag_type === "revisit") revisitCount = Number(r.count);
    else if (r.flag_type === "critical") criticalCount = Number(r.count);
  }

  return {
    revisitCount,
    criticalCount,
    totalFollowupCount: revisitCount + criticalCount,
  };
}

// ─────────────────────────────────────────────────────────────
// FAZ-33: Question Evidence & Attachments Database Operations
// ─────────────────────────────────────────────────────────────

export async function addQuestionAttachment(
  payload: CreateQuestionAttachmentPayload
): Promise<QuestionAttachment> {
  const db = await getDb();
  const id = generateId("att");
  const now = new Date().toISOString();
  const importedAt = payload.imported_at || now;

  await db.execute(
    `INSERT INTO question_attachments (
       id, analysis_project_id, business_function_code, question_id, answer_id,
       original_file_name, stored_file_name, relative_path, mime_type,
       file_extension, file_size, sha256, description, source_file_name,
       source_absolute_path, imported_at, sort_order, created_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5,
       $6, $7, $8, $9,
       $10, $11, $12, $13, $14,
       $15, $16, $17, $18, $18
     )`,
    [
      id,
      payload.analysis_project_id,
      payload.business_function_code,
      payload.question_id,
      payload.answer_id ?? null,
      payload.original_file_name,
      payload.stored_file_name,
      payload.relative_path,
      payload.mime_type,
      payload.file_extension,
      payload.file_size,
      payload.sha256,
      payload.description ?? null,
      payload.source_file_name ?? payload.original_file_name,
      null, // source_absolute_path daima NULL (gizlilik ve taşınabilirlik garantisi)
      importedAt,
      payload.sort_order ?? 0,
      now,
    ]
  );

  return {
    id,
    analysis_project_id: payload.analysis_project_id,
    business_function_code: payload.business_function_code,
    question_id: payload.question_id,
    answer_id: payload.answer_id ?? null,
    original_file_name: payload.original_file_name,
    stored_file_name: payload.stored_file_name,
    relative_path: payload.relative_path,
    mime_type: payload.mime_type,
    file_extension: payload.file_extension,
    file_size: payload.file_size,
    sha256: payload.sha256,
    description: payload.description ?? null,
    source_file_name: payload.source_file_name ?? payload.original_file_name,
    source_absolute_path: null,
    imported_at: importedAt,
    status: "valid",
    sort_order: payload.sort_order ?? 0,
    created_at: now,
    updated_at: now,
  };
}

export async function updateQuestionAttachmentReimport(
  attachmentId: string,
  updates: {
    original_file_name: string;
    stored_file_name: string;
    relative_path: string;
    mime_type: string;
    file_extension: string;
    file_size: number;
    sha256: string;
    source_file_name?: string | null;
    source_absolute_path?: string | null;
  }
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE question_attachments
     SET original_file_name = $1, stored_file_name = $2, relative_path = $3,
         mime_type = $4, file_extension = $5, file_size = $6, sha256 = $7,
         source_file_name = $8, source_absolute_path = $9, imported_at = $10, updated_at = $10
     WHERE id = $11`,
    [
      updates.original_file_name,
      updates.stored_file_name,
      updates.relative_path,
      updates.mime_type,
      updates.file_extension,
      updates.file_size,
      updates.sha256,
      updates.source_file_name ?? updates.original_file_name,
      null, // source_absolute_path daima NULL
      now,
      attachmentId,
    ]
  );
}

export async function getQuestionAttachments(
  projectId: string,
  bfCode: string,
  questionId: string
): Promise<QuestionAttachment[]> {
  const db = await getDb();
  const rows = await db.select<QuestionAttachment[]>(
    `SELECT *
     FROM question_attachments
     WHERE analysis_project_id = $1 AND business_function_code = $2 AND question_id = $3
     ORDER BY sort_order ASC, created_at ASC`,
    [projectId, bfCode, questionId]
  );
  return rows;
}

export async function getProjectAttachments(
  projectId: string
): Promise<QuestionAttachment[]> {
  const db = await getDb();
  const rows = await db.select<QuestionAttachment[]>(
    `SELECT *
     FROM question_attachments
     WHERE analysis_project_id = $1
     ORDER BY business_function_code ASC, question_id ASC, sort_order ASC, created_at ASC`,
    [projectId]
  );
  return rows;
}

export async function updateAttachmentDescription(
  attachmentId: string,
  description: string | null
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE question_attachments
     SET description = $1, updated_at = $2
     WHERE id = $3`,
    [description, now, attachmentId]
  );
}

export async function deleteQuestionAttachment(
  attachmentId: string
): Promise<QuestionAttachment | null> {
  const db = await getDb();
  const existing = await db.select<QuestionAttachment[]>(
    `SELECT * FROM question_attachments WHERE id = $1`,
    [attachmentId]
  );
  if (existing.length === 0) return null;

  await db.execute(
    `DELETE FROM question_attachments WHERE id = $1`,
    [attachmentId]
  );
  return existing[0];
}

export async function findAttachmentBySha256(
  projectId: string,
  sha256: string
): Promise<QuestionAttachment | null> {
  const db = await getDb();
  const rows = await db.select<QuestionAttachment[]>(
    `SELECT *
     FROM question_attachments
     WHERE analysis_project_id = $1 AND sha256 = $2
     LIMIT 1`,
    [projectId, sha256]
  );
  return rows[0] || null;
}

export async function getAttachmentSummaryStats(
  projectId: string
): Promise<AttachmentSummaryStats> {
  const db = await getDb();
  const rows = await db.select<{ count: number; total_bytes: number }[]>(
    `SELECT COUNT(*) as count, COALESCE(SUM(file_size), 0) as total_bytes
     FROM question_attachments
     WHERE analysis_project_id = $1`,
    [projectId]
  );

  return {
    totalAttachmentCount: Number(rows[0]?.count || 0),
    totalAttachmentSizeBytes: Number(rows[0]?.total_bytes || 0),
  };
}


