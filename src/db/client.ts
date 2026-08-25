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
  ProjectStatus,
  ProjectScopeChange,
  ScopeChangeAction,
  FunctionDataCounts,
  UpdateProjectDetailsPayload,
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
  ProjectBusinessFunction,
  ScheduleDates,
  OtStation,
  StationStatus,
  OtStationsSummaryStats,
  OtDataRequirement,
  OtAlarmRequirement,
  OtQualityDevice,
  OtMatrixSummaryCounts,
  ProcessMap,
  ProcessNode,
  ProcessEdge,
  ProcessMapsSummaryStats,
  DataGovernanceAsset,
  DataGovernanceAccess,
  DataGovernanceApproval,
  DataGovernanceSummaryStats,
} from "../types";
import { calculateAdoptionRisk, checkAssetSodRisk } from "../types";
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


export function setDbInstanceForTesting(db: any): void {
  dbInstance = db;
}

export function resetDbInstanceForTesting(): void {
  dbInstance = null;
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
      p.planned_start_date,
      p.planned_end_date,
      p.actual_start_date,
      p.actual_end_date,
      p.created_at,
      p.updated_at,
      COALESCE(c.company_name, 'İsimsiz Firma') as company_name,
      c.city,
      (SELECT COUNT(*) FROM project_business_functions pbf WHERE pbf.analysis_project_id = p.id AND (pbf.is_active IS NULL OR pbf.is_active = 1)) as selected_function_count
    FROM analysis_projects p
    LEFT JOIN company_profiles c ON c.analysis_project_id = p.id
    ORDER BY p.updated_at DESC
  `);
}

// ---------------------------------------------------------------
// 1.1 Proje Durumunu Güncelle (Aktif / Pasif)
// ---------------------------------------------------------------
export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE analysis_projects SET status = $1, updated_at = $2 WHERE id = $3`,
    [status, now, projectId]
  );
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
    `INSERT INTO analysis_projects (id, name, status, planned_start_date, planned_end_date, actual_start_date, actual_end_date, created_at, updated_at)
     VALUES ($1, $2, 'active', $3, $4, $5, $6, $7, $8)`,
    [
      projectId,
      payload.projectName,
      payload.planned_start_date ?? null,
      payload.planned_end_date ?? null,
      payload.actual_start_date ?? null,
      payload.actual_end_date ?? null,
      now,
      now,
    ]
  );

  // 2. Firma profili
  await db.execute(
    `INSERT INTO company_profiles
     (id, analysis_project_id, company_name, trade_name, tax_number, city, country, employee_count, business_sector, has_branches, branch_count, notes, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
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
      now,
    ]
  );

  // 3. Seçilen iş fonksiyonları (Kanonik Atama Servisi)
  if (payload.selectedFunctionIds && payload.selectedFunctionIds.length > 0) {
    await assignBusinessFunctionsToProject(projectId, payload.selectedFunctionIds);
  }

  return projectId;
}

// ---------------------------------------------------------------
// 3.1 Kanonik Proje - İş Fonksiyonu Atama Servisi
// ---------------------------------------------------------------
export interface AssignBusinessFunctionInput {
  id?: string;
  code?: string;
  status?: string;
  dept?: string;
  resp?: string;
  plannedStartDate?: string | null;
  planned_start_date?: string | null;
  plannedEndDate?: string | null;
  planned_end_date?: string | null;
  actualStartDate?: string | null;
  actual_start_date?: string | null;
  actualEndDate?: string | null;
  actual_end_date?: string | null;
}

/**
 * Projeye iş fonksiyonlarını bağlayan TEK KANONİK SERVİS.
 * Hem normal proje oluşturma (createProject) hem de demo projeler (createManufacturingDemoProject)
 * aynı servis üzerinden bağlanır.
 *
 * Doğrulamalar:
 * 1. analysis_projects ebeveyn kaydının varlığı (SELECT id FROM analysis_projects WHERE id = $1)
 * 2. business_functions master kaydının varlığı (SELECT id, code FROM business_functions WHERE is_active = 1)
 * 3. Bulunamayan herhangi bir fonksiyon kodu için INSERT öncesinde açık ve açıklayıcı hata fırlatma.
 */
export async function assignBusinessFunctionsToProject(
  projectId: string,
  functions: (string | AssignBusinessFunctionInput)[]
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  // 1. Ebeveyn Proje Kaydı Kontrolü (Parent Check 1)
  const projRows = await db.select<{ id: string }[]>(
    "SELECT id FROM analysis_projects WHERE id = $1",
    [projectId]
  );
  if (projRows.length === 0) {
    throw new Error(
      `Kanonik Atama Hatası: '${projectId}' kimlikli analiz projesi veritabanında bulunamadı.`
    );
  }

  // 2. Master İş Fonksiyonları Ebeveyn Kaydı Kontrolü (Parent Check 2)
  const masterFunctions = await db.select<
    { id: string; code: string; name_tr: string }[]
  >("SELECT id, code, name_tr FROM business_functions WHERE is_active = 1");

  const masterIdMap = new Map<string, { id: string; code: string }>();
  const masterCodeMap = new Map<string, { id: string; code: string }>();
  for (const mf of masterFunctions) {
    masterIdMap.set(mf.id, mf);
    masterCodeMap.set(mf.code, mf);
  }

  for (const item of functions) {
    let resolvedMaster: { id: string; code: string } | undefined;
    let status = "not_started";
    let dept: string | null = null;
    let resp: string | null = null;
    let plannedStart: string | null = null;
    let plannedEnd: string | null = null;
    let actualStart: string | null = null;
    let actualEnd: string | null = null;
    let requestedIdentifier = "";

    if (typeof item === "string") {
      requestedIdentifier = item;
      resolvedMaster = masterIdMap.get(item) || masterCodeMap.get(item);
    } else {
      requestedIdentifier = item.code || item.id || "unknown";
      if (item.id && masterIdMap.has(item.id)) {
        resolvedMaster = masterIdMap.get(item.id);
      } else if (item.code && masterCodeMap.has(item.code)) {
        resolvedMaster = masterCodeMap.get(item.code);
      }
      if (item.status) status = item.status;
      if (item.dept) dept = item.dept;
      if (item.resp) resp = item.resp;
      if (item.plannedStartDate !== undefined) plannedStart = item.plannedStartDate;
      if (item.planned_start_date !== undefined) plannedStart = item.planned_start_date;
      if (item.plannedEndDate !== undefined) plannedEnd = item.plannedEndDate;
      if (item.planned_end_date !== undefined) plannedEnd = item.planned_end_date;
      if (item.actualStartDate !== undefined) actualStart = item.actualStartDate;
      if (item.actual_start_date !== undefined) actualStart = item.actual_start_date;
      if (item.actualEndDate !== undefined) actualEnd = item.actualEndDate;
      if (item.actual_end_date !== undefined) actualEnd = item.actual_end_date;
    }

    if (!resolvedMaster) {
      console.error("[assignBusinessFunctionsToProject] Ebeveyn master fonksiyon bulunamadı:", {
        projectId,
        requestedIdentifier,
        item,
        availableCodes: Array.from(masterCodeMap.keys()),
      });
      throw new Error(
        `Kanonik Fonksiyon Atama Hatası: '${requestedIdentifier}' iş fonksiyonu master 'business_functions' tablosunda bulunamadı.`
      );
    }

    const pbfId = generateId("pbf");
    await db.execute(
      `INSERT INTO project_business_functions
       (id, analysis_project_id, business_function_id, status, is_active, company_department_name, responsible_person, planned_start_date, planned_end_date, actual_start_date, actual_end_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 1, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [pbfId, projectId, resolvedMaster.id, status, dept, resp, plannedStart, plannedEnd, actualStart, actualEnd, now, now]
    );
  }
}

// ---------------------------------------------------------------
// 4. Proje detayı
// ---------------------------------------------------------------
export async function getProjectDetail(projectId: string): Promise<ProjectDetailData | null> {
  const db = await getDb();

  const projects = await db.select<ProjectDetailData["project"][]>(
    `SELECT id, name, status, planned_start_date, planned_end_date, actual_start_date, actual_end_date, created_at, updated_at FROM analysis_projects WHERE id = $1`,
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
       COALESCE(pbf.is_active, 1) as is_active,
       pbf.removed_at,
       pbf.removal_reason,
       pbf.planned_start_date,
       pbf.planned_end_date,
       pbf.actual_start_date,
       pbf.actual_end_date,
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
// 4.2 Proje ve Firma Bilgilerini Güncelle
// ---------------------------------------------------------------
export async function updateProjectDetails(
  projectId: string,
  payload: UpdateProjectDetailsPayload
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  // 1. Proje adı / durumu / tarihleri güncellenmişse analysis_projects tablosunu güncelle
  const hasSchedule =
    payload.planned_start_date !== undefined ||
    payload.planned_end_date !== undefined ||
    payload.actual_start_date !== undefined ||
    payload.actual_end_date !== undefined;

  if (hasSchedule) {
    await db.execute(
      `UPDATE analysis_projects
       SET name = COALESCE($1, name),
           status = COALESCE($2, status),
           planned_start_date = $3,
           planned_end_date = $4,
           actual_start_date = $5,
           actual_end_date = $6,
           updated_at = $7
       WHERE id = $8`,
      [
        payload.projectName?.trim() || null,
        payload.status || null,
        payload.planned_start_date ?? null,
        payload.planned_end_date ?? null,
        payload.actual_start_date ?? null,
        payload.actual_end_date ?? null,
        now,
        projectId,
      ]
    );
  } else if (payload.projectName && payload.projectName.trim()) {
    if (payload.status) {
      await db.execute(
        `UPDATE analysis_projects SET name = $1, status = $2, updated_at = $3 WHERE id = $4`,
        [payload.projectName.trim(), payload.status, now, projectId]
      );
    } else {
      await db.execute(
        `UPDATE analysis_projects SET name = $1, updated_at = $2 WHERE id = $3`,
        [payload.projectName.trim(), now, projectId]
      );
    }
  } else if (payload.status) {
    await db.execute(
      `UPDATE analysis_projects SET status = $1, updated_at = $2 WHERE id = $3`,
      [payload.status, now, projectId]
    );
  } else {
    await db.execute(
      `UPDATE analysis_projects SET updated_at = $1 WHERE id = $2`,
      [now, projectId]
    );
  }

  // 2. Firma profilini güncelle
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
      payload.company.company_name ?? null,
      payload.company.trade_name ?? null,
      payload.company.tax_number ?? null,
      payload.company.city ?? null,
      payload.company.country ?? null,
      payload.company.employee_count ?? null,
      payload.company.business_sector ?? null,
      payload.company.has_branches ?? null,
      payload.company.branch_count ?? null,
      payload.company.notes ?? null,
      now,
      projectId,
    ]
  );
}

// ---------------------------------------------------------------
// 4.3 Proje Takvimi Servisleri (FAZ-59)
// ---------------------------------------------------------------
export async function updateProjectSchedule(
  projectId: string,
  schedule: ScheduleDates
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  const check = await db.select<{ id: string }[]>(
    "SELECT id FROM analysis_projects WHERE id = $1",
    [projectId]
  );
  if (!check || check.length === 0) {
    throw new Error(`Proje takvimi güncellenemedi: Proje bulunamadı (${projectId})`);
  }

  await db.execute(
    `UPDATE analysis_projects
     SET planned_start_date = $1,
         planned_end_date = $2,
         actual_start_date = $3,
         actual_end_date = $4,
         updated_at = $5
     WHERE id = $6`,
    [
      schedule.plannedStartDate ?? null,
      schedule.plannedEndDate ?? null,
      schedule.actualStartDate ?? null,
      schedule.actualEndDate ?? null,
      now,
      projectId,
    ]
  );
}

export async function getProjectSchedule(
  projectId: string
): Promise<ScheduleDates | null> {
  const db = await getDb();
  const rows = await db.select<
    {
      planned_start_date: string | null;
      planned_end_date: string | null;
      actual_start_date: string | null;
      actual_end_date: string | null;
    }[]
  >(
    `SELECT planned_start_date, planned_end_date, actual_start_date, actual_end_date
     FROM analysis_projects
     WHERE id = $1`,
    [projectId]
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    plannedStartDate: r.planned_start_date,
    plannedEndDate: r.planned_end_date,
    actualStartDate: r.actual_start_date,
    actualEndDate: r.actual_end_date,
  };
}

export async function updateProjectFunctionSchedule(
  projectId: string,
  bfCode: string,
  schedule: ScheduleDates
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  // Find business_function_id
  const masterRows = await db.select<{ id: string }[]>(
    "SELECT id FROM business_functions WHERE code = $1",
    [bfCode]
  );
  if (!masterRows || masterRows.length === 0) {
    throw new Error(`İş fonksiyonu takvimi güncellenemedi: Master fonksiyon bulunamadı (${bfCode})`);
  }
  const bfId = masterRows[0].id;

  const check = await db.select<{ id: string }[]>(
    "SELECT id FROM project_business_functions WHERE analysis_project_id = $1 AND business_function_id = $2",
    [projectId, bfId]
  );
  if (!check || check.length === 0) {
    throw new Error(`İş fonksiyonu projeye atanmamış: ${bfCode}`);
  }

  await db.execute(
    `UPDATE project_business_functions
     SET planned_start_date = $1,
         planned_end_date = $2,
         actual_start_date = $3,
         actual_end_date = $4,
         updated_at = $5
     WHERE analysis_project_id = $6 AND business_function_id = $7`,
    [
      schedule.plannedStartDate ?? null,
      schedule.plannedEndDate ?? null,
      schedule.actualStartDate ?? null,
      schedule.actualEndDate ?? null,
      now,
      projectId,
      bfId,
    ]
  );
}

export async function getProjectFunctionSchedule(
  projectId: string,
  bfCode: string
): Promise<ScheduleDates | null> {
  const db = await getDb();
  const rows = await db.select<
    {
      planned_start_date: string | null;
      planned_end_date: string | null;
      actual_start_date: string | null;
      actual_end_date: string | null;
    }[]
  >(
    `SELECT pbf.planned_start_date, pbf.planned_end_date, pbf.actual_start_date, pbf.actual_end_date
     FROM project_business_functions pbf
     JOIN business_functions bf ON bf.id = pbf.business_function_id
     WHERE pbf.analysis_project_id = $1 AND bf.code = $2`,
    [projectId, bfCode]
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    plannedStartDate: r.planned_start_date,
    plannedEndDate: r.planned_end_date,
    actualStartDate: r.actual_start_date,
    actualEndDate: r.actual_end_date,
  };
}

// ---------------------------------------------------------------
// 4.3 Kapsam Yönetimi: İş Fonksiyonu Ekle / Yeniden Etkinleştir
// ---------------------------------------------------------------
export async function addOrReactivateProjectFunction(
  projectId: string,
  bfCode: string,
  performedBy?: string
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  // 1. business_functions tablosundan ID'yi bul
  const bfs = await db.select<{ id: string; code: string }[]>(
    "SELECT id, code FROM business_functions WHERE code = $1",
    [bfCode]
  );
  if (bfs.length === 0) {
    throw new Error(`İş fonksiyonu bulunamadı: ${bfCode}`);
  }
  const bfId = bfs[0].id;

  // 2. Mevcut project_business_functions kaydı var mı?
  const existing = await db.select<ProjectBusinessFunction[]>(
    "SELECT * FROM project_business_functions WHERE analysis_project_id = $1 AND business_function_id = $2",
    [projectId, bfId]
  );

  let action: ScopeChangeAction = "added";
  if (existing.length > 0) {
    action = "reactivated";
    await db.execute(
      `UPDATE project_business_functions
       SET is_active = 1, removed_at = NULL, removal_reason = NULL, updated_at = $1
       WHERE id = $2`,
      [now, existing[0].id]
    );
  } else {
    const pbfId = generateId("pbf");
    await db.execute(
      `INSERT INTO project_business_functions
         (id, analysis_project_id, business_function_id, status, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, 'not_started', 1, $4, $4)`,
      [pbfId, projectId, bfId, now]
    );
  }

  // 3. Geçmişe kaydet
  const pscId = generateId("psc");
  await db.execute(
    `INSERT INTO project_scope_changes
       (id, analysis_project_id, business_function_code, action, reason, performed_by, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [pscId, projectId, bfCode, action, null, performedBy || null, now]
  );

  // 4. Proje son güncellenme tarihini güncelle
  await db.execute("UPDATE analysis_projects SET updated_at = $1 WHERE id = $2", [now, projectId]);
}

// ---------------------------------------------------------------
// 4.4 Kapsam Yönetimi: İş Fonksiyonunu Kapsam Dışına Al (Soft Remove)
// ---------------------------------------------------------------
export async function deactivateProjectFunction(
  projectId: string,
  bfCode: string,
  reason?: string,
  performedBy?: string
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  const bfs = await db.select<{ id: string; code: string }[]>(
    "SELECT id, code FROM business_functions WHERE code = $1",
    [bfCode]
  );
  if (bfs.length === 0) {
    throw new Error(`İş fonksiyonu bulunamadı: ${bfCode}`);
  }
  const bfId = bfs[0].id;

  await db.execute(
    `UPDATE project_business_functions
     SET is_active = 0, removed_at = $1, removal_reason = $2, updated_at = $3
     WHERE analysis_project_id = $4 AND business_function_id = $5`,
    [now, reason?.trim() || null, now, projectId, bfId]
  );

  const pscId = generateId("psc");
  await db.execute(
    `INSERT INTO project_scope_changes
       (id, analysis_project_id, business_function_code, action, reason, performed_by, created_at)
     VALUES ($1, $2, $3, 'removed', $4, $5, $6)`,
    [pscId, projectId, bfCode, reason?.trim() || null, performedBy || null, now]
  );

  await db.execute("UPDATE analysis_projects SET updated_at = $1 WHERE id = $2", [now, projectId]);
}

// ---------------------------------------------------------------
// 4.5 Kapsam Yönetimi: Fonksiyona Bağlı Çalışma Verisi Sayıları
// ---------------------------------------------------------------
export async function getFunctionDataCounts(
  projectId: string,
  bfCode: string
): Promise<FunctionDataCounts> {
  const db = await getDb();
  const [
    ans,
    fnd,
    req,
    rsk,
    not,
    cqs,
    cqa,
    fol,
    att,
    gov,
  ] = await Promise.all([
    db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM question_answers WHERE analysis_project_id = $1 AND business_function_code = $2",
      [projectId, bfCode]
    ),
    db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM analysis_findings WHERE analysis_project_id = $1 AND business_function_code = $2",
      [projectId, bfCode]
    ),
    db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM analysis_requirements WHERE analysis_project_id = $1 AND business_function_code = $2",
      [projectId, bfCode]
    ),
    db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM analysis_risks WHERE analysis_project_id = $1 AND business_function_code = $2",
      [projectId, bfCode]
    ),
    db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM project_notes WHERE analysis_project_id = $1 AND business_function_code = $2",
      [projectId, bfCode]
    ),
    db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM project_custom_questions WHERE analysis_project_id = $1 AND business_function_code = $2",
      [projectId, bfCode]
    ),
    db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM project_custom_question_answers WHERE analysis_project_id = $1 AND business_function_code = $2",
      [projectId, bfCode]
    ),
    db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM question_followups WHERE analysis_project_id = $1 AND business_function_code = $2",
      [projectId, bfCode]
    ),
    db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM question_attachments WHERE analysis_project_id = $1 AND business_function_code = $2",
      [projectId, bfCode]
    ),
    db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM governance_objects WHERE analysis_project_id = $1 AND related_bf_code = $2",
      [projectId, bfCode]
    ),
  ]);

  const answers = ans[0]?.count ?? 0;
  const findings = fnd[0]?.count ?? 0;
  const requirements = req[0]?.count ?? 0;
  const risks = rsk[0]?.count ?? 0;
  const notes = not[0]?.count ?? 0;
  const customQuestions = cqs[0]?.count ?? 0;
  const customAnswers = cqa[0]?.count ?? 0;
  const followups = fol[0]?.count ?? 0;
  const attachments = att[0]?.count ?? 0;
  const governanceObjects = gov[0]?.count ?? 0;
  const total =
    answers + findings + requirements + risks + notes + customQuestions + customAnswers + followups + attachments + governanceObjects;

  return {
    businessFunctionCode: bfCode,
    answers,
    findings,
    requirements,
    risks,
    notes,
    customQuestions,
    customAnswers,
    followups,
    attachments,
    governanceObjects,
    total,
  };
}

// ---------------------------------------------------------------
// 4.6 Kapsam Yönetimi: Değişiklik Geçmişi
// ---------------------------------------------------------------
export async function getProjectScopeChanges(projectId: string): Promise<ProjectScopeChange[]> {
  const db = await getDb();
  return db.select<ProjectScopeChange[]>(
    "SELECT * FROM project_scope_changes WHERE analysis_project_id = $1 ORDER BY created_at DESC",
    [projectId]
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
         SUM(CASE WHEN LOWER(TRIM(status)) IN ('open', 'acik', 'açık', 'active', 'aktif', 'open_risk', 'pending') OR status IS NULL THEN 1 ELSE 0 END) as open
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

// ---------------------------------------------------------------
// FAZ-62B: OT İstasyon Profili ve Tekrarlayan İstasyon Akışı
// ---------------------------------------------------------------

/**
 * Projeye ait tüm OT istasyonlarını sıralı olarak döndürür.
 */
export async function getOtStations(projectId: string): Promise<OtStation[]> {
  const db = await getDb();
  return db.select<OtStation[]>(
    `SELECT * FROM ot_stations
     WHERE project_id = $1
     ORDER BY sort_order ASC, created_at ASC`,
    [projectId]
  );
}

/**
 * Tek bir OT istasyonunu ID ile getirir.
 */
export async function getOtStationById(stationId: string): Promise<OtStation | null> {
  const db = await getDb();
  const rows = await db.select<OtStation[]>(
    `SELECT * FROM ot_stations WHERE id = $1 LIMIT 1`,
    [stationId]
  );
  return rows[0] || null;
}

/**
 * Yeni bir OT istasyonu oluşturur.
 * Proje içinde station_code benzersizliğini garanti eder.
 */
export async function createOtStation(
  station: Omit<OtStation, "id" | "created_at" | "updated_at">
): Promise<OtStation> {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = generateId("ots");

  // station_code benzersizlik denetimi
  const cleanCode = station.station_code.trim();
  const existing = await db.select<OtStation[]>(
    `SELECT id FROM ot_stations WHERE project_id = $1 AND station_code = $2 LIMIT 1`,
    [station.project_id, cleanCode]
  );

  if (existing.length > 0) {
    throw new Error(`Bu istasyon kodu projede zaten mevcuttur: ${cleanCode}`);
  }

  await db.execute(
    `INSERT INTO ot_stations
       (id, project_id, area_name, line_name, station_code, station_name, station_type, machine_name, machine_manufacturer, machine_model, plc_or_controller, operator_count, status, sort_order, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $15)`,
    [
      id,
      station.project_id,
      station.area_name || null,
      station.line_name || null,
      cleanCode,
      station.station_name.trim(),
      station.station_type || null,
      station.machine_name || null,
      station.machine_manufacturer || null,
      station.machine_model || null,
      station.plc_or_controller || null,
      station.operator_count ?? 1,
      station.status || "active",
      station.sort_order ?? 0,
      now,
    ]
  );

  const created = await getOtStationById(id);
  if (!created) {
    throw new Error("İstasyon oluşturulamadı.");
  }
  return created;
}

/**
 * Mevcut bir OT istasyonunu günceller.
 */
export async function updateOtStation(
  stationId: string,
  updates: Partial<OtStation>
): Promise<void> {
  const db = await getDb();
  const existing = await getOtStationById(stationId);
  if (!existing) {
    throw new Error(`Güncellenecek istasyon bulunamadı: ${stationId}`);
  }

  if (updates.station_code && updates.station_code.trim() !== existing.station_code) {
    const cleanCode = updates.station_code.trim();
    const dup = await db.select<OtStation[]>(
      `SELECT id FROM ot_stations WHERE project_id = $1 AND station_code = $2 AND id != $3 LIMIT 1`,
      [existing.project_id, cleanCode, stationId]
    );
    if (dup.length > 0) {
      throw new Error(`Bu istasyon kodu projede zaten mevcuttur: ${cleanCode}`);
    }
  }

  const now = new Date().toISOString();
  const merged: OtStation = {
    ...existing,
    ...updates,
    updated_at: now,
  };

  await db.execute(
    `UPDATE ot_stations
     SET area_name = $1,
         line_name = $2,
         station_code = $3,
         station_name = $4,
         station_type = $5,
         machine_name = $6,
         machine_manufacturer = $7,
         machine_model = $8,
         plc_or_controller = $9,
         operator_count = $10,
         status = $11,
         sort_order = $12,
         updated_at = $13
     WHERE id = $14`,
    [
      merged.area_name || null,
      merged.line_name || null,
      merged.station_code.trim(),
      merged.station_name.trim(),
      merged.station_type || null,
      merged.machine_name || null,
      merged.machine_manufacturer || null,
      merged.machine_model || null,
      merged.plc_or_controller || null,
      merged.operator_count ?? 1,
      merged.status,
      merged.sort_order ?? 0,
      now,
      stationId,
    ]
  );
}

/**
 * OT istasyonunun durumunu değiştirir (active / passive).
 */
export async function toggleOtStationStatus(
  stationId: string,
  status: StationStatus
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE ot_stations SET status = $1, updated_at = $2 WHERE id = $3`,
    [status, now, stationId]
  );
}

/**
 * OT istasyonunu ve ona bağlı tüm istasyon cevaplarını siler.
 */
export async function deleteOtStation(stationId: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM ot_stations WHERE id = $1`, [stationId]);
}

/**
 * Belirli bir istasyona ait tüm cevapları Map olarak çeker.
 */
export async function getOtStationAnswers(
  projectId: string,
  stationId: string
): Promise<Map<string, AnswerData>> {
  const db = await getDb();
  const rows = await db.select<{ question_id: string; answer_data: string }[]>(
    `SELECT question_id, answer_data FROM ot_station_answers
     WHERE project_id = $1 AND station_id = $2`,
    [projectId, stationId]
  );
  const map = new Map<string, AnswerData>();
  for (const row of rows) {
    try {
      const parsed = JSON.parse(row.answer_data) as AnswerData;
      map.set(row.question_id, parsed);
    } catch {
      // Hatalı JSON yutulur
    }
  }
  return map;
}

/**
 * Tek bir istasyon cevabını okur.
 */
export async function getOtStationAnswer(
  projectId: string,
  stationId: string,
  questionId: string
): Promise<AnswerData | null> {
  const db = await getDb();
  const rows = await db.select<{ answer_data: string }[]>(
    `SELECT answer_data FROM ot_station_answers
     WHERE project_id = $1 AND station_id = $2 AND question_id = $3
     LIMIT 1`,
    [projectId, stationId, questionId]
  );
  if (rows.length === 0) return null;
  try {
    return JSON.parse(rows[0].answer_data) as AnswerData;
  } catch {
    return null;
  }
}

/**
 * İstasyon bazlı cevap kaydeder (UPSERT).
 */
export async function saveOtStationAnswer(
  projectId: string,
  stationId: string,
  questionId: string,
  answerData: AnswerData,
  bfCode = "OT_INDUSTRIAL_DATA",
  packId = "tr.ot_industrial_data.core",
  packVersion = "0.1.0"
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = generateId("otsa");
  const answerJson = JSON.stringify(answerData);

  await db.execute(
    `INSERT INTO ot_station_answers
       (id, project_id, station_id, business_function_code, question_pack_id, question_pack_version, question_id, answer_data, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
     ON CONFLICT(project_id, station_id, question_id)
     DO UPDATE SET
       answer_data = $8,
       question_pack_version = $6,
       updated_at = $9`,
    [id, projectId, stationId, bfCode, packId, packVersion, questionId, answerJson, now]
  );
}

/**
 * Projenin OT istasyonları istatistiklerini hesaplar.
 */
export async function getOtStationsSummary(
  projectId: string
): Promise<OtStationsSummaryStats> {
  const db = await getDb();
  const stations = await db.select<OtStation[]>(
    `SELECT * FROM ot_stations WHERE project_id = $1`,
    [projectId]
  );

  const totalStations = stations.length;
  const activeStations = stations.filter((s) => s.status === "active").length;
  const passiveStations = totalStations - activeStations;

  const areas = new Set(
    stations.map((s) => s.area_name?.trim()).filter((a): a is string => Boolean(a))
  );
  const lines = new Set(
    stations.map((s) => s.line_name?.trim()).filter((l): l is string => Boolean(l))
  );

  return {
    totalStations,
    activeStations,
    passiveStations,
    areaCount: areas.size,
    lineCount: lines.size,
  };
}

// ─────────────────────────────────────────────────────────────
// FAZ-62C: OT Data Requirements CRUD
// ─────────────────────────────────────────────────────────────

export async function createOtDataRequirement(
  payload: Omit<OtDataRequirement, "id" | "created_at" | "updated_at">
): Promise<OtDataRequirement> {
  const db = await getDb();
  const id = generateId("otreq");
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO ot_data_requirements (
       id, project_id, station_id, purpose, decision_supported, required_action,
       data_category, measurement_name, source_type, source_name, collection_method,
       frequency, criticality, target_system, retention_required, retention_period,
       business_value, integration_complexity, priority, status, notes,
       created_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6,
       $7, $8, $9, $10, $11,
       $12, $13, $14, $15, $16,
       $17, $18, $19, $20, $21,
       $22, $22
     )`,
    [
      id,
      payload.project_id,
      payload.station_id,
      payload.purpose,
      payload.decision_supported,
      payload.required_action,
      payload.data_category ?? null,
      payload.measurement_name,
      payload.source_type ?? null,
      payload.source_name ?? null,
      payload.collection_method ?? null,
      payload.frequency ?? null,
      payload.criticality ?? "medium",
      payload.target_system ?? null,
      payload.retention_required ? 1 : 0,
      payload.retention_period ?? null,
      payload.business_value ?? null,
      payload.integration_complexity ?? "medium",
      payload.priority ?? "medium",
      payload.status ?? "active",
      payload.notes ?? null,
      now,
    ]
  );

  return {
    id,
    project_id: payload.project_id,
    station_id: payload.station_id,
    purpose: payload.purpose,
    decision_supported: payload.decision_supported,
    required_action: payload.required_action,
    data_category: payload.data_category ?? null,
    measurement_name: payload.measurement_name,
    source_type: payload.source_type ?? null,
    source_name: payload.source_name ?? null,
    collection_method: payload.collection_method ?? null,
    frequency: payload.frequency ?? null,
    criticality: payload.criticality ?? "medium",
    target_system: payload.target_system ?? null,
    retention_required: payload.retention_required ? 1 : 0,
    retention_period: payload.retention_period ?? null,
    business_value: payload.business_value ?? null,
    integration_complexity: payload.integration_complexity ?? "medium",
    priority: payload.priority ?? "medium",
    status: payload.status ?? "active",
    notes: payload.notes ?? null,
    created_at: now,
    updated_at: now,
  };
}

export async function updateOtDataRequirement(
  id: string,
  updates: Partial<Omit<OtDataRequirement, "id" | "project_id" | "station_id" | "created_at" | "updated_at">>
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE ot_data_requirements
     SET purpose = COALESCE($1, purpose),
         decision_supported = COALESCE($2, decision_supported),
         required_action = COALESCE($3, required_action),
         data_category = CASE WHEN $4 IS NOT NULL THEN $5 ELSE data_category END,
         measurement_name = COALESCE($6, measurement_name),
         source_type = CASE WHEN $7 IS NOT NULL THEN $8 ELSE source_type END,
         source_name = CASE WHEN $9 IS NOT NULL THEN $10 ELSE source_name END,
         collection_method = CASE WHEN $11 IS NOT NULL THEN $12 ELSE collection_method END,
         frequency = CASE WHEN $13 IS NOT NULL THEN $14 ELSE frequency END,
         criticality = COALESCE($15, criticality),
         target_system = CASE WHEN $16 IS NOT NULL THEN $17 ELSE target_system END,
         retention_required = CASE WHEN $18 IS NOT NULL THEN $19 ELSE retention_required END,
         retention_period = CASE WHEN $20 IS NOT NULL THEN $21 ELSE retention_period END,
         business_value = CASE WHEN $22 IS NOT NULL THEN $23 ELSE business_value END,
         integration_complexity = COALESCE($24, integration_complexity),
         priority = COALESCE($25, priority),
         status = COALESCE($26, status),
         notes = CASE WHEN $27 IS NOT NULL THEN $28 ELSE notes END,
         updated_at = $29
     WHERE id = $30`,
    [
      updates.purpose ?? null,
      updates.decision_supported ?? null,
      updates.required_action ?? null,
      updates.data_category !== undefined ? 1 : null,
      updates.data_category ?? null,
      updates.measurement_name ?? null,
      updates.source_type !== undefined ? 1 : null,
      updates.source_type ?? null,
      updates.source_name !== undefined ? 1 : null,
      updates.source_name ?? null,
      updates.collection_method !== undefined ? 1 : null,
      updates.collection_method ?? null,
      updates.frequency !== undefined ? 1 : null,
      updates.frequency ?? null,
      updates.criticality ?? null,
      updates.target_system !== undefined ? 1 : null,
      updates.target_system ?? null,
      updates.retention_required !== undefined ? 1 : null,
      updates.retention_required ? 1 : 0,
      updates.retention_period !== undefined ? 1 : null,
      updates.retention_period ?? null,
      updates.business_value !== undefined ? 1 : null,
      updates.business_value ?? null,
      updates.integration_complexity ?? null,
      updates.priority ?? null,
      updates.status ?? null,
      updates.notes !== undefined ? 1 : null,
      updates.notes ?? null,
      now,
      id,
    ]
  );
}

export async function deleteOtDataRequirement(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM ot_data_requirements WHERE id = $1`, [id]);
}

export async function getOtDataRequirements(
  projectId: string,
  stationId?: string
): Promise<OtDataRequirement[]> {
  const db = await getDb();
  if (stationId) {
    return db.select<OtDataRequirement[]>(
      `SELECT * FROM ot_data_requirements WHERE project_id = $1 AND station_id = $2 ORDER BY created_at ASC`,
      [projectId, stationId]
    );
  }
  return db.select<OtDataRequirement[]>(
    `SELECT * FROM ot_data_requirements WHERE project_id = $1 ORDER BY created_at ASC`,
    [projectId]
  );
}

export async function getOtDataRequirementById(id: string): Promise<OtDataRequirement | null> {
  const db = await getDb();
  const rows = await db.select<OtDataRequirement[]>(
    `SELECT * FROM ot_data_requirements WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

// ─────────────────────────────────────────────────────────────
// FAZ-62C: OT Alarm Requirements CRUD
// ─────────────────────────────────────────────────────────────

export async function createOtAlarmRequirement(
  payload: Omit<OtAlarmRequirement, "id" | "created_at" | "updated_at">
): Promise<OtAlarmRequirement> {
  const db = await getDb();
  const id = generateId("otalm");
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO ot_alarm_requirements (
       id, project_id, station_id, alarm_name, alarm_code, source_type,
       trigger_condition, severity, safety_critical, responsible_role, response_sla,
       required_action, acknowledgement_required, escalation_required, target_system,
       status, notes, created_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6,
       $7, $8, $9, $10, $11,
       $12, $13, $14, $15,
       $16, $17, $18, $18
     )`,
    [
      id,
      payload.project_id,
      payload.station_id,
      payload.alarm_name,
      payload.alarm_code ?? null,
      payload.source_type ?? null,
      payload.trigger_condition ?? null,
      payload.severity ?? "warning",
      payload.safety_critical ? 1 : 0,
      payload.responsible_role ?? null,
      payload.response_sla ?? null,
      payload.required_action ?? null,
      payload.acknowledgement_required ? 1 : 0,
      payload.escalation_required ? 1 : 0,
      payload.target_system ?? null,
      payload.status ?? "active",
      payload.notes ?? null,
      now,
    ]
  );

  return {
    id,
    project_id: payload.project_id,
    station_id: payload.station_id,
    alarm_name: payload.alarm_name,
    alarm_code: payload.alarm_code ?? null,
    source_type: payload.source_type ?? null,
    trigger_condition: payload.trigger_condition ?? null,
    severity: payload.severity ?? "warning",
    safety_critical: payload.safety_critical ? 1 : 0,
    responsible_role: payload.responsible_role ?? null,
    response_sla: payload.response_sla ?? null,
    required_action: payload.required_action ?? null,
    acknowledgement_required: payload.acknowledgement_required ? 1 : 0,
    escalation_required: payload.escalation_required ? 1 : 0,
    target_system: payload.target_system ?? null,
    status: payload.status ?? "active",
    notes: payload.notes ?? null,
    created_at: now,
    updated_at: now,
  };
}

export async function updateOtAlarmRequirement(
  id: string,
  updates: Partial<Omit<OtAlarmRequirement, "id" | "project_id" | "station_id" | "created_at" | "updated_at">>
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE ot_alarm_requirements
     SET alarm_name = COALESCE($1, alarm_name),
         alarm_code = CASE WHEN $2 IS NOT NULL THEN $3 ELSE alarm_code END,
         source_type = CASE WHEN $4 IS NOT NULL THEN $5 ELSE source_type END,
         trigger_condition = CASE WHEN $6 IS NOT NULL THEN $7 ELSE trigger_condition END,
         severity = COALESCE($8, severity),
         safety_critical = CASE WHEN $9 IS NOT NULL THEN $10 ELSE safety_critical END,
         responsible_role = CASE WHEN $11 IS NOT NULL THEN $12 ELSE responsible_role END,
         response_sla = CASE WHEN $13 IS NOT NULL THEN $14 ELSE response_sla END,
         required_action = CASE WHEN $15 IS NOT NULL THEN $16 ELSE required_action END,
         acknowledgement_required = CASE WHEN $17 IS NOT NULL THEN $18 ELSE acknowledgement_required END,
         escalation_required = CASE WHEN $19 IS NOT NULL THEN $20 ELSE escalation_required END,
         target_system = CASE WHEN $21 IS NOT NULL THEN $22 ELSE target_system END,
         status = COALESCE($23, status),
         notes = CASE WHEN $24 IS NOT NULL THEN $25 ELSE notes END,
         updated_at = $26
     WHERE id = $27`,
    [
      updates.alarm_name ?? null,
      updates.alarm_code !== undefined ? 1 : null,
      updates.alarm_code ?? null,
      updates.source_type !== undefined ? 1 : null,
      updates.source_type ?? null,
      updates.trigger_condition !== undefined ? 1 : null,
      updates.trigger_condition ?? null,
      updates.severity ?? null,
      updates.safety_critical !== undefined ? 1 : null,
      updates.safety_critical ? 1 : 0,
      updates.responsible_role !== undefined ? 1 : null,
      updates.responsible_role ?? null,
      updates.response_sla !== undefined ? 1 : null,
      updates.response_sla ?? null,
      updates.required_action !== undefined ? 1 : null,
      updates.required_action ?? null,
      updates.acknowledgement_required !== undefined ? 1 : null,
      updates.acknowledgement_required ? 1 : 0,
      updates.escalation_required !== undefined ? 1 : null,
      updates.escalation_required ? 1 : 0,
      updates.target_system !== undefined ? 1 : null,
      updates.target_system ?? null,
      updates.status ?? null,
      updates.notes !== undefined ? 1 : null,
      updates.notes ?? null,
      now,
      id,
    ]
  );
}

export async function deleteOtAlarmRequirement(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM ot_alarm_requirements WHERE id = $1`, [id]);
}

export async function getOtAlarmRequirements(
  projectId: string,
  stationId?: string
): Promise<OtAlarmRequirement[]> {
  const db = await getDb();
  if (stationId) {
    return db.select<OtAlarmRequirement[]>(
      `SELECT * FROM ot_alarm_requirements WHERE project_id = $1 AND station_id = $2 ORDER BY created_at ASC`,
      [projectId, stationId]
    );
  }
  return db.select<OtAlarmRequirement[]>(
    `SELECT * FROM ot_alarm_requirements WHERE project_id = $1 ORDER BY created_at ASC`,
    [projectId]
  );
}

export async function getOtAlarmRequirementById(id: string): Promise<OtAlarmRequirement | null> {
  const db = await getDb();
  const rows = await db.select<OtAlarmRequirement[]>(
    `SELECT * FROM ot_alarm_requirements WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

// ─────────────────────────────────────────────────────────────
// FAZ-62C: OT Quality Devices CRUD
// ─────────────────────────────────────────────────────────────

export async function createOtQualityDevice(
  payload: Omit<OtQualityDevice, "id" | "created_at" | "updated_at">
): Promise<OtQualityDevice> {
  const db = await getDb();
  const id = generateId("otqd");
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO ot_quality_devices (
       id, project_id, station_id, device_name, device_type, manufacturer, model,
       output_format, interface_type, api_available, network_share_available,
       test_result_available, pass_fail_available, measurement_values_available,
       product_code_available, lot_batch_available, operator_available,
       integration_method, target_system, status, notes, created_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7,
       $8, $9, $10, $11,
       $12, $13, $14,
       $15, $16, $17,
       $18, $19, $20, $21, $22, $22
     )`,
    [
      id,
      payload.project_id,
      payload.station_id,
      payload.device_name,
      payload.device_type ?? null,
      payload.manufacturer ?? null,
      payload.model ?? null,
      payload.output_format ?? null,
      payload.interface_type ?? null,
      payload.api_available ? 1 : 0,
      payload.network_share_available ? 1 : 0,
      payload.test_result_available !== undefined ? (payload.test_result_available ? 1 : 0) : 1,
      payload.pass_fail_available !== undefined ? (payload.pass_fail_available ? 1 : 0) : 1,
      payload.measurement_values_available !== undefined ? (payload.measurement_values_available ? 1 : 0) : 1,
      payload.product_code_available !== undefined ? (payload.product_code_available ? 1 : 0) : 1,
      payload.lot_batch_available ? 1 : 0,
      payload.operator_available ? 1 : 0,
      payload.integration_method ?? null,
      payload.target_system ?? null,
      payload.status ?? "active",
      payload.notes ?? null,
      now,
    ]
  );

  return {
    id,
    project_id: payload.project_id,
    station_id: payload.station_id,
    device_name: payload.device_name,
    device_type: payload.device_type ?? null,
    manufacturer: payload.manufacturer ?? null,
    model: payload.model ?? null,
    output_format: payload.output_format ?? null,
    interface_type: payload.interface_type ?? null,
    api_available: payload.api_available ? 1 : 0,
    network_share_available: payload.network_share_available ? 1 : 0,
    test_result_available: payload.test_result_available !== undefined ? (payload.test_result_available ? 1 : 0) : 1,
    pass_fail_available: payload.pass_fail_available !== undefined ? (payload.pass_fail_available ? 1 : 0) : 1,
    measurement_values_available: payload.measurement_values_available !== undefined ? (payload.measurement_values_available ? 1 : 0) : 1,
    product_code_available: payload.product_code_available !== undefined ? (payload.product_code_available ? 1 : 0) : 1,
    lot_batch_available: payload.lot_batch_available ? 1 : 0,
    operator_available: payload.operator_available ? 1 : 0,
    integration_method: payload.integration_method ?? null,
    target_system: payload.target_system ?? null,
    status: payload.status ?? "active",
    notes: payload.notes ?? null,
    created_at: now,
    updated_at: now,
  };
}

export async function updateOtQualityDevice(
  id: string,
  updates: Partial<Omit<OtQualityDevice, "id" | "project_id" | "station_id" | "created_at" | "updated_at">>
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE ot_quality_devices
     SET device_name = COALESCE($1, device_name),
         device_type = CASE WHEN $2 IS NOT NULL THEN $3 ELSE device_type END,
         manufacturer = CASE WHEN $4 IS NOT NULL THEN $5 ELSE manufacturer END,
         model = CASE WHEN $6 IS NOT NULL THEN $7 ELSE model END,
         output_format = CASE WHEN $8 IS NOT NULL THEN $9 ELSE output_format END,
         interface_type = CASE WHEN $10 IS NOT NULL THEN $11 ELSE interface_type END,
         api_available = CASE WHEN $12 IS NOT NULL THEN $13 ELSE api_available END,
         network_share_available = CASE WHEN $14 IS NOT NULL THEN $15 ELSE network_share_available END,
         test_result_available = CASE WHEN $16 IS NOT NULL THEN $17 ELSE test_result_available END,
         pass_fail_available = CASE WHEN $18 IS NOT NULL THEN $19 ELSE pass_fail_available END,
         measurement_values_available = CASE WHEN $20 IS NOT NULL THEN $21 ELSE measurement_values_available END,
         product_code_available = CASE WHEN $22 IS NOT NULL THEN $23 ELSE product_code_available END,
         lot_batch_available = CASE WHEN $24 IS NOT NULL THEN $25 ELSE lot_batch_available END,
         operator_available = CASE WHEN $26 IS NOT NULL THEN $27 ELSE operator_available END,
         integration_method = CASE WHEN $28 IS NOT NULL THEN $29 ELSE integration_method END,
         target_system = CASE WHEN $30 IS NOT NULL THEN $31 ELSE target_system END,
         status = COALESCE($32, status),
         notes = CASE WHEN $33 IS NOT NULL THEN $34 ELSE notes END,
         updated_at = $35
     WHERE id = $36`,
    [
      updates.device_name ?? null,
      updates.device_type !== undefined ? 1 : null,
      updates.device_type ?? null,
      updates.manufacturer !== undefined ? 1 : null,
      updates.manufacturer ?? null,
      updates.model !== undefined ? 1 : null,
      updates.model ?? null,
      updates.output_format !== undefined ? 1 : null,
      updates.output_format ?? null,
      updates.interface_type !== undefined ? 1 : null,
      updates.interface_type ?? null,
      updates.api_available !== undefined ? 1 : null,
      updates.api_available ? 1 : 0,
      updates.network_share_available !== undefined ? 1 : null,
      updates.network_share_available ? 1 : 0,
      updates.test_result_available !== undefined ? 1 : null,
      updates.test_result_available ? 1 : 0,
      updates.pass_fail_available !== undefined ? 1 : null,
      updates.pass_fail_available ? 1 : 0,
      updates.measurement_values_available !== undefined ? 1 : null,
      updates.measurement_values_available ? 1 : 0,
      updates.product_code_available !== undefined ? 1 : null,
      updates.product_code_available ? 1 : 0,
      updates.lot_batch_available !== undefined ? 1 : null,
      updates.lot_batch_available ? 1 : 0,
      updates.operator_available !== undefined ? 1 : null,
      updates.operator_available ? 1 : 0,
      updates.integration_method !== undefined ? 1 : null,
      updates.integration_method ?? null,
      updates.target_system !== undefined ? 1 : null,
      updates.target_system ?? null,
      updates.status ?? null,
      updates.notes !== undefined ? 1 : null,
      updates.notes ?? null,
      now,
      id,
    ]
  );
}

export async function deleteOtQualityDevice(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM ot_quality_devices WHERE id = $1`, [id]);
}

export async function getOtQualityDevices(
  projectId: string,
  stationId?: string
): Promise<OtQualityDevice[]> {
  const db = await getDb();
  if (stationId) {
    return db.select<OtQualityDevice[]>(
      `SELECT * FROM ot_quality_devices WHERE project_id = $1 AND station_id = $2 ORDER BY created_at ASC`,
      [projectId, stationId]
    );
  }
  return db.select<OtQualityDevice[]>(
    `SELECT * FROM ot_quality_devices WHERE project_id = $1 ORDER BY created_at ASC`,
    [projectId]
  );
}

export async function getOtQualityDeviceById(id: string): Promise<OtQualityDevice | null> {
  const db = await getDb();
  const rows = await db.select<OtQualityDevice[]>(
    `SELECT * FROM ot_quality_devices WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

// ─────────────────────────────────────────────────────────────
// FAZ-62C: OT Matrix Summary Counts & Statistics
// ─────────────────────────────────────────────────────────────

export async function getOtMatrixSummaryCounts(
  projectId: string
): Promise<OtMatrixSummaryCounts> {
  const db = await getDb();
  const [dataReqs, alarms, qualityDevs] = await Promise.all([
    db.select<OtDataRequirement[]>(
      `SELECT * FROM ot_data_requirements WHERE project_id = $1`,
      [projectId]
    ),
    db.select<OtAlarmRequirement[]>(
      `SELECT * FROM ot_alarm_requirements WHERE project_id = $1`,
      [projectId]
    ),
    db.select<OtQualityDevice[]>(
      `SELECT * FROM ot_quality_devices WHERE project_id = $1`,
      [projectId]
    ),
  ]);

  const totalDataRequirements = dataReqs.length;
  const criticalDataRequirements = dataReqs.filter(
    (d) => d.criticality === "critical" || d.priority === "high"
  ).length;

  let eventBasedCount = 0;
  let cycleBasedCount = 0;
  let timeBasedCount = 0;
  let highComplexityItems = 0;

  for (const d of dataReqs) {
    const f = (d.frequency || "").toLowerCase();
    const c = (d.collection_method || "").toLowerCase();
    if (f.includes("event") || f.includes("olay") || c.includes("event") || c.includes("olay")) {
      eventBasedCount++;
    } else if (f.includes("cycle") || f.includes("çevrim") || f.includes("part") || f.includes("adet") || c.includes("cycle")) {
      cycleBasedCount++;
    } else if (f.includes("sec") || f.includes("sn") || f.includes("dakika") || f.includes("min") || f.includes("saat") || f.includes("zaman") || f.includes("periyodik")) {
      timeBasedCount++;
    }

    if (d.integration_complexity === "high") {
      highComplexityItems++;
    }
  }

  const totalAlarms = alarms.length;
  const safetyCriticalAlarms = alarms.filter((a) => Number(a.safety_critical) === 1).length;
  const unassignedRoleAlarms = alarms.filter((a) => !a.responsible_role || a.responsible_role.trim() === "").length;
  const missingActionAlarms = alarms.filter((a) => !a.required_action || a.required_action.trim() === "").length;

  const totalQualityDevices = qualityDevs.length;
  const automatedTransferDevices = qualityDevs.filter(
    (q) =>
      Number(q.api_available) === 1 ||
      Number(q.network_share_available) === 1 ||
      (q.integration_method && (q.integration_method.toLowerCase().includes("auto") || q.integration_method.toLowerCase().includes("otomatik") || q.integration_method.toLowerCase().includes("api")))
  ).length;

  const pdfOnlyDevices = qualityDevs.filter((q) => {
    const out = (q.output_format || "").toLowerCase();
    const isPdf = out.includes("pdf") && !out.includes("csv") && !out.includes("excel") && !out.includes("json") && !out.includes("api");
    return isPdf && Number(q.api_available) === 0 && Number(q.network_share_available) === 0;
  }).length;

  return {
    totalDataRequirements,
    criticalDataRequirements,
    eventBasedCount,
    cycleBasedCount,
    timeBasedCount,
    totalAlarms,
    safetyCriticalAlarms,
    unassignedRoleAlarms,
    missingActionAlarms,
    totalQualityDevices,
    automatedTransferDevices,
    pdfOnlyDevices,
    highComplexityItems,
  };
}

// ---------------------------------------------------------------
// 23. FAZ-63: Süreç Haritaları, Düğümleri ve Bağlantıları (Process Maps, Nodes, Edges)
// ---------------------------------------------------------------

export async function createProcessMap(
  payload: Omit<ProcessMap, "id" | "created_at" | "updated_at">
): Promise<ProcessMap> {
  const db = await getDb();
  const id = generateId("pmap");
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO process_maps
       (id, project_id, name, process_area, owner_role, status, description, sort_order, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)`,
    [
      id,
      payload.project_id,
      payload.name,
      payload.process_area ?? null,
      payload.owner_role ?? null,
      payload.status || "active",
      payload.description ?? null,
      payload.sort_order ?? 0,
      now,
    ]
  );

  return {
    id,
    project_id: payload.project_id,
    name: payload.name,
    process_area: payload.process_area ?? null,
    owner_role: payload.owner_role ?? null,
    status: payload.status || "active",
    description: payload.description ?? null,
    sort_order: payload.sort_order ?? 0,
    created_at: now,
    updated_at: now,
  };
}

export async function getProcessMaps(projectId: string): Promise<ProcessMap[]> {
  const db = await getDb();
  return db.select<ProcessMap[]>(
    `SELECT * FROM process_maps WHERE project_id = $1 ORDER BY sort_order ASC, created_at ASC`,
    [projectId]
  );
}

export async function getProcessMapById(id: string): Promise<ProcessMap | null> {
  const db = await getDb();
  const rows = await db.select<ProcessMap[]>(
    `SELECT * FROM process_maps WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function updateProcessMap(
  id: string,
  updates: Partial<Pick<ProcessMap, "name" | "process_area" | "owner_role" | "status" | "description" | "sort_order">>
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE process_maps
     SET name = COALESCE($1, name),
         process_area = CASE WHEN $2 IS NOT NULL THEN $3 ELSE process_area END,
         owner_role = CASE WHEN $4 IS NOT NULL THEN $5 ELSE owner_role END,
         status = COALESCE($6, status),
         description = CASE WHEN $7 IS NOT NULL THEN $8 ELSE description END,
         sort_order = COALESCE($9, sort_order),
         updated_at = $10
     WHERE id = $11`,
    [
      updates.name ?? null,
      updates.process_area !== undefined ? 1 : null,
      updates.process_area ?? null,
      updates.owner_role !== undefined ? 1 : null,
      updates.owner_role ?? null,
      updates.status ?? null,
      updates.description !== undefined ? 1 : null,
      updates.description ?? null,
      updates.sort_order ?? null,
      now,
      id,
    ]
  );
}

export async function deleteProcessMap(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM process_maps WHERE id = $1`, [id]);
}

export async function createProcessNode(
  payload: Omit<ProcessNode, "id" | "adoption_risk" | "created_at" | "updated_at"> & { adoption_risk?: string }
): Promise<ProcessNode> {
  const db = await getDb();
  const id = generateId("pnode");
  const now = new Date().toISOString();
  const adoptionRisk =
    payload.adoption_risk ||
    calculateAdoptionRisk({
      bypass_possible: payload.bypass_possible,
      approval_count: payload.approval_count,
      handoff_count: payload.handoff_count,
      duplicate_data_entry: payload.duplicate_data_entry,
      manual_work: payload.manual_work,
      value_added: payload.value_added,
    });

  await db.execute(
    `INSERT INTO process_nodes (
       id, process_map_id, node_type, name, description,
       responsible_department, responsible_role, business_function_code, ot_station_id,
       step_order, input_description, output_description, approval_count,
       handoff_count, duplicate_data_entry, bypass_possible, manual_work,
       value_added, adoption_risk, notes, created_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5,
       $6, $7, $8, $9,
       $10, $11, $12, $13,
       $14, $15, $16, $17,
       $18, $19, $20, $21, $21
     )`,
    [
      id,
      payload.process_map_id,
      payload.node_type || "ACTIVITY",
      payload.name,
      payload.description ?? null,
      payload.responsible_department ?? null,
      payload.responsible_role ?? null,
      payload.business_function_code ?? null,
      payload.ot_station_id ?? null,
      payload.step_order ?? 1,
      payload.input_description ?? null,
      payload.output_description ?? null,
      payload.approval_count ?? 0,
      payload.handoff_count ?? 0,
      payload.duplicate_data_entry ? 1 : 0,
      payload.bypass_possible ? 1 : 0,
      payload.manual_work ? 1 : 0,
      payload.value_added !== undefined ? (payload.value_added ? 1 : 0) : 1,
      adoptionRisk,
      payload.notes ?? null,
      now,
    ]
  );

  return {
    id,
    process_map_id: payload.process_map_id,
    node_type: payload.node_type || "ACTIVITY",
    name: payload.name,
    description: payload.description ?? null,
    responsible_department: payload.responsible_department ?? null,
    responsible_role: payload.responsible_role ?? null,
    business_function_code: payload.business_function_code ?? null,
    ot_station_id: payload.ot_station_id ?? null,
    step_order: payload.step_order ?? 1,
    input_description: payload.input_description ?? null,
    output_description: payload.output_description ?? null,
    approval_count: payload.approval_count ?? 0,
    handoff_count: payload.handoff_count ?? 0,
    duplicate_data_entry: payload.duplicate_data_entry ? 1 : 0,
    bypass_possible: payload.bypass_possible ? 1 : 0,
    manual_work: payload.manual_work ? 1 : 0,
    value_added: payload.value_added !== undefined ? (payload.value_added ? 1 : 0) : 1,
    adoption_risk: adoptionRisk as any,
    notes: payload.notes ?? null,
    created_at: now,
    updated_at: now,
  };
}

export async function getProcessNodes(processMapId: string): Promise<ProcessNode[]> {
  const db = await getDb();
  return db.select<ProcessNode[]>(
    `SELECT * FROM process_nodes WHERE process_map_id = $1 ORDER BY step_order ASC, created_at ASC`,
    [processMapId]
  );
}

export async function getProcessNodeById(id: string): Promise<ProcessNode | null> {
  const db = await getDb();
  const rows = await db.select<ProcessNode[]>(
    `SELECT * FROM process_nodes WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function updateProcessNode(
  id: string,
  updates: Partial<Omit<ProcessNode, "id" | "process_map_id" | "created_at" | "updated_at">>
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  // If node metrics changed and adoption_risk not explicitly passed, recalculate
  let calculatedRisk: string | undefined = updates.adoption_risk;
  if (!calculatedRisk && (
    updates.bypass_possible !== undefined ||
    updates.approval_count !== undefined ||
    updates.handoff_count !== undefined ||
    updates.duplicate_data_entry !== undefined ||
    updates.manual_work !== undefined ||
    updates.value_added !== undefined
  )) {
    const existing = await getProcessNodeById(id);
    if (existing) {
      calculatedRisk = calculateAdoptionRisk({
        bypass_possible: updates.bypass_possible !== undefined ? updates.bypass_possible : existing.bypass_possible,
        approval_count: updates.approval_count !== undefined ? updates.approval_count : existing.approval_count,
        handoff_count: updates.handoff_count !== undefined ? updates.handoff_count : existing.handoff_count,
        duplicate_data_entry: updates.duplicate_data_entry !== undefined ? updates.duplicate_data_entry : existing.duplicate_data_entry,
        manual_work: updates.manual_work !== undefined ? updates.manual_work : existing.manual_work,
        value_added: updates.value_added !== undefined ? updates.value_added : existing.value_added,
      });
    }
  }

  await db.execute(
    `UPDATE process_nodes
     SET node_type = COALESCE($1, node_type),
         name = COALESCE($2, name),
         description = CASE WHEN $3 IS NOT NULL THEN $4 ELSE description END,
         responsible_department = CASE WHEN $5 IS NOT NULL THEN $6 ELSE responsible_department END,
         responsible_role = CASE WHEN $7 IS NOT NULL THEN $8 ELSE responsible_role END,
         business_function_code = CASE WHEN $9 IS NOT NULL THEN $10 ELSE business_function_code END,
         ot_station_id = CASE WHEN $11 IS NOT NULL THEN $12 ELSE ot_station_id END,
         step_order = COALESCE($13, step_order),
         input_description = CASE WHEN $14 IS NOT NULL THEN $15 ELSE input_description END,
         output_description = CASE WHEN $16 IS NOT NULL THEN $17 ELSE output_description END,
         approval_count = COALESCE($18, approval_count),
         handoff_count = COALESCE($19, handoff_count),
         duplicate_data_entry = COALESCE($20, duplicate_data_entry),
         bypass_possible = COALESCE($21, bypass_possible),
         manual_work = COALESCE($22, manual_work),
         value_added = COALESCE($23, value_added),
         adoption_risk = COALESCE($24, adoption_risk),
         notes = CASE WHEN $25 IS NOT NULL THEN $26 ELSE notes END,
         updated_at = $27
     WHERE id = $28`,
    [
      updates.node_type ?? null,
      updates.name ?? null,
      updates.description !== undefined ? 1 : null,
      updates.description ?? null,
      updates.responsible_department !== undefined ? 1 : null,
      updates.responsible_department ?? null,
      updates.responsible_role !== undefined ? 1 : null,
      updates.responsible_role ?? null,
      updates.business_function_code !== undefined ? 1 : null,
      updates.business_function_code ?? null,
      updates.ot_station_id !== undefined ? 1 : null,
      updates.ot_station_id ?? null,
      updates.step_order ?? null,
      updates.input_description !== undefined ? 1 : null,
      updates.input_description ?? null,
      updates.output_description !== undefined ? 1 : null,
      updates.output_description ?? null,
      updates.approval_count !== undefined ? updates.approval_count : null,
      updates.handoff_count !== undefined ? updates.handoff_count : null,
      updates.duplicate_data_entry !== undefined ? (updates.duplicate_data_entry ? 1 : 0) : null,
      updates.bypass_possible !== undefined ? (updates.bypass_possible ? 1 : 0) : null,
      updates.manual_work !== undefined ? (updates.manual_work ? 1 : 0) : null,
      updates.value_added !== undefined ? (updates.value_added ? 1 : 0) : null,
      calculatedRisk ?? null,
      updates.notes !== undefined ? 1 : null,
      updates.notes ?? null,
      now,
      id,
    ]
  );
}

export async function deleteProcessNode(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM process_nodes WHERE id = $1`, [id]);
}

export async function createProcessEdge(
  payload: Omit<ProcessEdge, "id" | "created_at" | "updated_at">
): Promise<ProcessEdge> {
  const db = await getDb();
  const id = generateId("pedge");
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO process_edges
       (id, process_map_id, source_node_id, target_node_id, label, condition_text, sort_order, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
    [
      id,
      payload.process_map_id,
      payload.source_node_id,
      payload.target_node_id,
      payload.label ?? null,
      payload.condition_text ?? null,
      payload.sort_order ?? 0,
      now,
    ]
  );

  return {
    id,
    process_map_id: payload.process_map_id,
    source_node_id: payload.source_node_id,
    target_node_id: payload.target_node_id,
    label: payload.label ?? null,
    condition_text: payload.condition_text ?? null,
    sort_order: payload.sort_order ?? 0,
    created_at: now,
    updated_at: now,
  };
}

export async function getProcessEdges(processMapId: string): Promise<ProcessEdge[]> {
  const db = await getDb();
  return db.select<ProcessEdge[]>(
    `SELECT * FROM process_edges WHERE process_map_id = $1 ORDER BY sort_order ASC, created_at ASC`,
    [processMapId]
  );
}

export async function deleteProcessEdge(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM process_edges WHERE id = $1`, [id]);
}

export async function getProcessMapsSummaryStats(
  projectId: string
): Promise<ProcessMapsSummaryStats> {
  const db = await getDb();
  const [maps, nodes, edges] = await Promise.all([
    db.select<ProcessMap[]>(
      `SELECT * FROM process_maps WHERE project_id = $1`,
      [projectId]
    ),
    db.select<ProcessNode[]>(
      `SELECT n.* FROM process_nodes n
       JOIN process_maps m ON m.id = n.process_map_id
       WHERE m.project_id = $1`,
      [projectId]
    ),
    db.select<ProcessEdge[]>(
      `SELECT e.* FROM process_edges e
       JOIN process_maps m ON m.id = e.process_map_id
       WHERE m.project_id = $1`,
      [projectId]
    ),
  ]);

  const totalMaps = maps.length;
  const totalNodes = nodes.length;
  const totalEdges = edges.length;

  let totalApprovals = 0;
  let totalHandoffs = 0;
  let duplicateDataEntryCount = 0;
  let bypassPossibleCount = 0;
  let highAdoptionRiskCount = 0;
  let mediumAdoptionRiskCount = 0;
  let lowAdoptionRiskCount = 0;
  let valueAddedStepCount = 0;
  let simplificationOpportunityCount = 0;

  for (const n of nodes) {
    const appr = Number(n.approval_count) || 0;
    const hand = Number(n.handoff_count) || 0;
    const dup = Number(n.duplicate_data_entry) === 1;
    const bypass = Number(n.bypass_possible) === 1;
    const manual = Number(n.manual_work) === 1;
    const valueAdded = Number(n.value_added) === 1;
    const risk = n.adoption_risk || calculateAdoptionRisk(n);

    totalApprovals += appr;
    totalHandoffs += hand;
    if (dup) duplicateDataEntryCount++;
    if (bypass) bypassPossibleCount++;
    if (valueAdded) valueAddedStepCount++;

    if (risk === "high") {
      highAdoptionRiskCount++;
    } else if (risk === "medium") {
      mediumAdoptionRiskCount++;
    } else {
      lowAdoptionRiskCount++;
    }

    if (bypass || dup || appr >= 2 || hand >= 2 || (manual && !valueAdded)) {
      simplificationOpportunityCount++;
    }
  }

  return {
    totalMaps,
    totalNodes,
    totalEdges,
    totalApprovals,
    totalHandoffs,
    duplicateDataEntryCount,
    bypassPossibleCount,
    highAdoptionRiskCount,
    mediumAdoptionRiskCount,
    lowAdoptionRiskCount,
    valueAddedStepCount,
    simplificationOpportunityCount,
  };
}

// ---------------------------------------------------------------
// 30. FAZ-64: Data Governance Assets, Access and Approvals CRUD
// ---------------------------------------------------------------

export async function getDataGovernanceAssets(
  projectId: string
): Promise<DataGovernanceAsset[]> {
  const db = await getDb();
  return db.select<DataGovernanceAsset[]>(
    `SELECT * FROM data_governance_assets WHERE project_id = $1 ORDER BY asset_name ASC`,
    [projectId]
  );
}

export async function getDataGovernanceAssetById(
  id: string
): Promise<DataGovernanceAsset | null> {
  const db = await getDb();
  const rows = await db.select<DataGovernanceAsset[]>(
    `SELECT * FROM data_governance_assets WHERE id = $1`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function createDataGovernanceAsset(
  payload: Omit<DataGovernanceAsset, "id" | "created_at" | "updated_at">
): Promise<string> {
  const db = await getDb();
  const id = generateId("dg_asset");
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO data_governance_assets (
      id, project_id, domain, asset_name, asset_type, description,
      system_of_record, criticality, master_data, process_data,
      personal_data, financial_data, quality_or_safety_data,
      owner_role, steward_role, technical_custodian_role, status, notes,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
    [
      id,
      payload.project_id,
      payload.domain ?? null,
      payload.asset_name.trim(),
      payload.asset_type || "MASTER_DATA",
      payload.description ?? null,
      payload.system_of_record ?? null,
      payload.criticality || "MEDIUM",
      payload.master_data !== undefined ? (payload.master_data ? 1 : 0) : 1,
      payload.process_data !== undefined ? (payload.process_data ? 1 : 0) : 0,
      payload.personal_data !== undefined ? (payload.personal_data ? 1 : 0) : 0,
      payload.financial_data !== undefined ? (payload.financial_data ? 1 : 0) : 0,
      payload.quality_or_safety_data !== undefined ? (payload.quality_or_safety_data ? 1 : 0) : 0,
      payload.owner_role?.trim() || null,
      payload.steward_role?.trim() || null,
      payload.technical_custodian_role?.trim() || null,
      payload.status || "active",
      payload.notes ?? null,
      now,
      now,
    ]
  );
  return id;
}

export async function updateDataGovernanceAsset(
  id: string,
  payload: Partial<DataGovernanceAsset>
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE data_governance_assets
     SET domain = COALESCE($1, domain),
         asset_name = COALESCE($2, asset_name),
         asset_type = COALESCE($3, asset_type),
         description = $4,
         system_of_record = $5,
         criticality = COALESCE($6, criticality),
         master_data = COALESCE($7, master_data),
         process_data = COALESCE($8, process_data),
         personal_data = COALESCE($9, personal_data),
         financial_data = COALESCE($10, financial_data),
         quality_or_safety_data = COALESCE($11, quality_or_safety_data),
         owner_role = $12,
         steward_role = $13,
         technical_custodian_role = $14,
         status = COALESCE($15, status),
         notes = $16,
         updated_at = $17
     WHERE id = $18`,
    [
      payload.domain ?? null,
      payload.asset_name?.trim() || null,
      payload.asset_type || null,
      payload.description ?? null,
      payload.system_of_record ?? null,
      payload.criticality || null,
      payload.master_data !== undefined ? (payload.master_data ? 1 : 0) : null,
      payload.process_data !== undefined ? (payload.process_data ? 1 : 0) : null,
      payload.personal_data !== undefined ? (payload.personal_data ? 1 : 0) : null,
      payload.financial_data !== undefined ? (payload.financial_data ? 1 : 0) : null,
      payload.quality_or_safety_data !== undefined ? (payload.quality_or_safety_data ? 1 : 0) : null,
      payload.owner_role !== undefined ? payload.owner_role?.trim() || null : null,
      payload.steward_role !== undefined ? payload.steward_role?.trim() || null : null,
      payload.technical_custodian_role !== undefined ? payload.technical_custodian_role?.trim() || null : null,
      payload.status || null,
      payload.notes ?? null,
      now,
      id,
    ]
  );
}

export async function deleteDataGovernanceAsset(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM data_governance_assets WHERE id = $1`, [id]);
}

// ---------------------------------------------------------------
// 30.1 Access Rules CRUD
// ---------------------------------------------------------------

export async function getDataGovernanceAccessRules(
  projectId: string,
  assetId?: string
): Promise<DataGovernanceAccess[]> {
  const db = await getDb();
  if (assetId) {
    return db.select<DataGovernanceAccess[]>(
      `SELECT * FROM data_governance_access WHERE project_id = $1 AND asset_id = $2 ORDER BY actor_name ASC`,
      [projectId, assetId]
    );
  }
  return db.select<DataGovernanceAccess[]>(
    `SELECT * FROM data_governance_access WHERE project_id = $1 ORDER BY actor_name ASC`,
    [projectId]
  );
}

export async function createDataGovernanceAccess(
  payload: Omit<DataGovernanceAccess, "id" | "created_at" | "updated_at">
): Promise<string> {
  const db = await getDb();
  const id = generateId("dg_access");
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO data_governance_access (
      id, project_id, asset_id, actor_type, actor_name, access_level,
      scope_type, scope_value, approval_required, approval_role,
      task_separation_required, conflict_note, limit_description, status, notes,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
    [
      id,
      payload.project_id,
      payload.asset_id,
      payload.actor_type || "ROLE",
      payload.actor_name.trim(),
      payload.access_level || "READ_ONLY",
      payload.scope_type || "COMPANY",
      payload.scope_value?.trim() || null,
      payload.approval_required ? 1 : 0,
      payload.approval_role?.trim() || null,
      payload.task_separation_required ? 1 : 0,
      payload.conflict_note ?? null,
      payload.limit_description ?? null,
      payload.status || "active",
      payload.notes ?? null,
      now,
      now,
    ]
  );
  return id;
}

export async function updateDataGovernanceAccess(
  id: string,
  payload: Partial<DataGovernanceAccess>
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE data_governance_access
     SET actor_type = COALESCE($1, actor_type),
         actor_name = COALESCE($2, actor_name),
         access_level = COALESCE($3, access_level),
         scope_type = COALESCE($4, scope_type),
         scope_value = $5,
         approval_required = COALESCE($6, approval_required),
         approval_role = $7,
         task_separation_required = COALESCE($8, task_separation_required),
         conflict_note = $9,
         limit_description = $10,
         status = COALESCE($11, status),
         notes = $12,
         updated_at = $13
     WHERE id = $14`,
    [
      payload.actor_type || null,
      payload.actor_name?.trim() || null,
      payload.access_level || null,
      payload.scope_type || null,
      payload.scope_value !== undefined ? payload.scope_value?.trim() || null : null,
      payload.approval_required !== undefined ? (payload.approval_required ? 1 : 0) : null,
      payload.approval_role !== undefined ? payload.approval_role?.trim() || null : null,
      payload.task_separation_required !== undefined ? (payload.task_separation_required ? 1 : 0) : null,
      payload.conflict_note ?? null,
      payload.limit_description ?? null,
      payload.status || null,
      payload.notes ?? null,
      now,
      id,
    ]
  );
}

export async function deleteDataGovernanceAccess(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM data_governance_access WHERE id = $1`, [id]);
}

// ---------------------------------------------------------------
// 30.2 Approvals CRUD
// ---------------------------------------------------------------

export async function getDataGovernanceApprovals(
  projectId: string,
  assetId?: string
): Promise<DataGovernanceApproval[]> {
  const db = await getDb();
  if (assetId) {
    return db.select<DataGovernanceApproval[]>(
      `SELECT * FROM data_governance_approvals WHERE project_id = $1 AND asset_id = $2 ORDER BY approval_order ASC`,
      [projectId, assetId]
    );
  }
  return db.select<DataGovernanceApproval[]>(
    `SELECT * FROM data_governance_approvals WHERE project_id = $1 ORDER BY approval_order ASC`,
    [projectId]
  );
}

export async function createDataGovernanceApproval(
  payload: Omit<DataGovernanceApproval, "id" | "created_at" | "updated_at">
): Promise<string> {
  const db = await getDb();
  const id = generateId("dg_appr");
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO data_governance_approvals (
      id, project_id, asset_id, process_map_id, approval_name, approval_role,
      threshold_description, approval_order, mandatory, separation_of_duties, notes,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      id,
      payload.project_id,
      payload.asset_id || null,
      payload.process_map_id || null,
      payload.approval_name.trim(),
      payload.approval_role.trim(),
      payload.threshold_description ?? null,
      Number(payload.approval_order) || 1,
      payload.mandatory ? 1 : 0,
      payload.separation_of_duties ? 1 : 0,
      payload.notes ?? null,
      now,
      now,
    ]
  );
  return id;
}

export async function updateDataGovernanceApproval(
  id: string,
  payload: Partial<DataGovernanceApproval>
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE data_governance_approvals
     SET asset_id = $1,
         process_map_id = $2,
         approval_name = COALESCE($3, approval_name),
         approval_role = COALESCE($4, approval_role),
         threshold_description = $5,
         approval_order = COALESCE($6, approval_order),
         mandatory = COALESCE($7, mandatory),
         separation_of_duties = COALESCE($8, separation_of_duties),
         notes = $9,
         updated_at = $10
     WHERE id = $11`,
    [
      payload.asset_id !== undefined ? payload.asset_id : null,
      payload.process_map_id !== undefined ? payload.process_map_id : null,
      payload.approval_name?.trim() || null,
      payload.approval_role?.trim() || null,
      payload.threshold_description ?? null,
      payload.approval_order !== undefined ? Number(payload.approval_order) : null,
      payload.mandatory !== undefined ? (payload.mandatory ? 1 : 0) : null,
      payload.separation_of_duties !== undefined ? (payload.separation_of_duties ? 1 : 0) : null,
      payload.notes ?? null,
      now,
      id,
    ]
  );
}

export async function deleteDataGovernanceApproval(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM data_governance_approvals WHERE id = $1`, [id]);
}

// ---------------------------------------------------------------
// 30.3 Summary Statistics
// ---------------------------------------------------------------

export async function getDataGovernanceSummaryStats(
  projectId: string
): Promise<DataGovernanceSummaryStats> {
  const [assets, accessRules, approvals] = await Promise.all([
    getDataGovernanceAssets(projectId),
    getDataGovernanceAccessRules(projectId),
    getDataGovernanceApprovals(projectId),
  ]);

  let unassignedOwnerCount = 0;
  let unassignedStewardCount = 0;
  let unassignedCustodianCount = 0;
  let criticalAssetCount = 0;
  let masterDataCount = 0;
  let personalDataCount = 0;
  let financialDataCount = 0;
  let qualitySafetyCount = 0;
  let sodConflictCount = 0;

  for (const a of assets) {
    if (!a.owner_role || !a.owner_role.trim()) unassignedOwnerCount++;
    if (!a.steward_role || !a.steward_role.trim()) unassignedStewardCount++;
    if (!a.technical_custodian_role || !a.technical_custodian_role.trim()) unassignedCustodianCount++;
    if (a.criticality === "CRITICAL" || a.criticality === "HIGH") criticalAssetCount++;
    if (Number(a.master_data) === 1) masterDataCount++;
    if (Number(a.personal_data) === 1) personalDataCount++;
    if (Number(a.financial_data) === 1) financialDataCount++;
    if (Number(a.quality_or_safety_data) === 1) qualitySafetyCount++;

    const sod = checkAssetSodRisk(a);
    if (sod.hasRisk) sodConflictCount++;
  }

  // Assets without approval rules
  const assetsWithApprovals = new Set(
    approvals.map((ap) => ap.asset_id).filter(Boolean)
  );
  let missingApprovalRulesCount = 0;
  for (const a of assets) {
    if (
      (a.criticality === "CRITICAL" || a.criticality === "HIGH" || a.financial_data === 1) &&
      !assetsWithApprovals.has(a.id)
    ) {
      missingApprovalRulesCount++;
    }
  }

  return {
    totalAssets: assets.length,
    unassignedOwnerCount,
    unassignedStewardCount,
    unassignedCustodianCount,
    criticalAssetCount,
    masterDataCount,
    personalDataCount,
    financialDataCount,
    qualitySafetyCount,
    totalAccessRules: accessRules.length,
    totalApprovals: approvals.length,
    sodConflictCount,
    missingApprovalRulesCount,
  };
}

// ---------------------------------------------------------------
// 30.4 Seed Starter Data Governance Assets
// ---------------------------------------------------------------

export async function seedDefaultDataGovernanceAssets(
  projectId: string
): Promise<number> {
  const existing = await getDataGovernanceAssets(projectId);
  if (existing.length > 0) return 0;

  const starterAssets: Omit<DataGovernanceAsset, "id" | "created_at" | "updated_at">[] = [
    {
      project_id: projectId,
      domain: "INVENTORY",
      asset_name: "Stok Kartı Ana Verisi",
      asset_type: "MASTER_DATA",
      description: "Ürün, hammadde, yarı mamul ve ticari malların temel tanım, birim, ağırlık ve barkod verileri",
      system_of_record: "ERP",
      criticality: "HIGH",
      master_data: 1,
      process_data: 0,
      personal_data: 0,
      financial_data: 0,
      quality_or_safety_data: 0,
      owner_role: "Ürün Yöneticisi",
      steward_role: "Stok ve Depo Sorumlusu",
      technical_custodian_role: "BT Veritabanı Yöneticisi",
      status: "active",
      notes: "ERP geçişinde mükerrer stok açılmasını engelleyecek kodlama standardı şarttır.",
    },
    {
      project_id: projectId,
      domain: "SALES",
      asset_name: "Müşteri ve Cari Kartı",
      asset_type: "MASTER_DATA",
      description: "Müşteri ticari unvanı, vergi no, fatura ve sevk adresleri, e-Fatura posta kutusu",
      system_of_record: "ERP / CRM",
      criticality: "HIGH",
      master_data: 1,
      process_data: 0,
      personal_data: 1,
      financial_data: 1,
      quality_or_safety_data: 0,
      owner_role: "Satış Direktörü",
      steward_role: "Müşteri İlişkileri Uzmanı",
      technical_custodian_role: "BT Sistem Yöneticisi",
      status: "active",
      notes: "KVKK ve vergi mevzuatı gereği yetkisiz veri silme ve güncelleme engellenmelidir.",
    },
    {
      project_id: projectId,
      domain: "PROCUREMENT",
      asset_name: "Tedarikçi ve Satıcı Kartı",
      asset_type: "MASTER_DATA",
      description: "Hammadde ve hizmet sağlayıcı ticari bilgileri, banka hesap/IBAN verileri, ödeme vadeleri",
      system_of_record: "ERP",
      criticality: "HIGH",
      master_data: 1,
      process_data: 0,
      personal_data: 0,
      financial_data: 1,
      quality_or_safety_data: 0,
      owner_role: "Satınalma Müdürü",
      steward_role: "Satınalma Uzmanı",
      technical_custodian_role: "BT Veritabanı Yöneticisi",
      status: "active",
      notes: "IBAN ve banka hesap değişiklikleri çift onay mekanizmasına bağlanmalıdır.",
    },
    {
      project_id: projectId,
      domain: "SALES",
      asset_name: "Satış Fiyat Listeleri & İskonto Matrisi",
      asset_type: "MASTER_DATA",
      description: "Müşteri grubu ve ürün bazlı taban fiyatlar, iskonto baremleri ve geçerlilik tarihleri",
      system_of_record: "ERP / CRM",
      criticality: "CRITICAL",
      master_data: 1,
      process_data: 0,
      personal_data: 0,
      financial_data: 1,
      quality_or_safety_data: 0,
      owner_role: "Ticari Direktör",
      steward_role: "Fiyatlandırma Uzmanı",
      technical_custodian_role: "BT Veritabanı Yöneticisi",
      status: "active",
      notes: "Kritik ticari sır niteliğinde veridir. Yetkisiz dışa aktarım engellenmelidir.",
    },
    {
      project_id: projectId,
      domain: "MANUFACTURING",
      asset_name: "Ürün Reçetesi (BOM) & Operasyon Rotaları",
      asset_type: "MASTER_DATA",
      description: "Ürün bileşenleri, fire oranları, operasyon adımları, çevrim süreleri ve standart maliyetler",
      system_of_record: "ERP / PLM",
      criticality: "HIGH",
      master_data: 1,
      process_data: 0,
      personal_data: 0,
      financial_data: 0,
      quality_or_safety_data: 1,
      owner_role: "Ar-Ge / Üretim Müdürü",
      steward_role: "Metot ve Proses Mühendisi",
      technical_custodian_role: "BT Sistem Yöneticisi",
      status: "active",
      notes: "Revizyon takibi zorunlu tutulmalıdır. Eski reçeteler arşivlenmelidir.",
    },
    {
      project_id: projectId,
      domain: "ACCOUNTING",
      asset_name: "Muhasebe Hesap Planı & Masraf Merkezleri",
      asset_type: "MASTER_DATA",
      description: "Tekdüzen hesap planı, alt hesaplar, masraf ve kar merkezleri kodlama yapısı",
      system_of_record: "ERP",
      criticality: "CRITICAL",
      master_data: 1,
      process_data: 0,
      personal_data: 0,
      financial_data: 1,
      quality_or_safety_data: 0,
      owner_role: "Mali İşler Direktörü (CFO)",
      steward_role: "Baş Muhasebeci",
      technical_custodian_role: "BT Veritabanı Yöneticisi",
      status: "active",
      notes: "Mevzuat uyumu ve bilanço bütünlüğü için yeni hesap açılışı mali işler onayına tabi olmalıdır.",
    },
    {
      project_id: projectId,
      domain: "PURCHASING",
      asset_name: "Satınalma Sipariş ve Talep Verileri",
      asset_type: "PROCESS_DATA",
      description: "Departman talepleri, tedarikçi teklifleri, onaylı PO'lar ve mal kabul irsaliye eşleşmeleri",
      system_of_record: "ERP",
      criticality: "HIGH",
      master_data: 0,
      process_data: 1,
      personal_data: 0,
      financial_data: 1,
      quality_or_safety_data: 0,
      owner_role: "Satınalma Müdürü",
      steward_role: "Satınalma Operasyon Sorumlusu",
      technical_custodian_role: "BT Sistem Yöneticisi",
      status: "active",
      notes: "Bütçe aşımı durumlarında kademeli genel müdür onay kuralı uygulanmalıdır.",
    },
    {
      project_id: projectId,
      domain: "QUALITY_MANAGEMENT",
      asset_name: "Kalite Kontrol ve Uygunsuzluk Verisi",
      asset_type: "PROCESS_DATA",
      description: "Giriş kalite kontrol, proses ara kontrol ve nihai ürün laboratuvar test sonuçları",
      system_of_record: "ERP / QMS",
      criticality: "HIGH",
      master_data: 0,
      process_data: 1,
      personal_data: 0,
      financial_data: 0,
      quality_or_safety_data: 1,
      owner_role: "Kalite Güvence Müdürü",
      steward_role: "Kalite Kontrol Şefi",
      technical_custodian_role: "BT Sistem Yöneticisi",
      status: "active",
      notes: "Hatalı lotların sevkiyatını otomatik bloklayan kalite kilidi devrede olmalıdır.",
    },
  ];

  for (const a of starterAssets) {
    await createDataGovernanceAsset(a);
  }

  return starterAssets.length;
}

// ─────────────────────────────────────────────────────────────
// FAZ-65: Field Evidence & Validation Registry CRUD
// ─────────────────────────────────────────────────────────────

import type {
  EvidenceItem,
  EvidenceLink,
  EvidenceSummaryStats,
  UnsupportedCriticalFinding,
  EvidenceTargetType,
} from "../types/evidence";
import { deleteEvidencePhysicalFile } from "../storage/attachmentManager";

/**
 * Projeye ait tüm saha kanıtı kayıtlarını (ve bağlı link sayılarını) döndürür.
 */
export async function getEvidenceItems(projectId: string): Promise<EvidenceItem[]> {
  const db = await getDb();
  const items = await db.select<EvidenceItem[]>(
    `SELECT e.*,
            (SELECT COUNT(*) FROM evidence_links el WHERE el.evidence_id = e.id) AS link_count
     FROM evidence_items e
     WHERE e.project_id = $1
     ORDER BY e.collected_at DESC, e.created_at DESC`,
    [projectId]
  );
  return items;
}

/**
 * Tek bir saha kanıtı kaydını linkleriyle birlikte getirir.
 */
export async function getEvidenceItemById(id: string): Promise<EvidenceItem | null> {
  const db = await getDb();
  const rows = await db.select<EvidenceItem[]>(
    `SELECT e.*,
            (SELECT COUNT(*) FROM evidence_links el WHERE el.evidence_id = e.id) AS link_count
     FROM evidence_items e
     WHERE e.id = $1
     LIMIT 1`,
    [id]
  );
  if (rows.length === 0) return null;
  const item = rows[0];
  item.links = await getEvidenceLinksByEvidenceId(id);
  return item;
}

/**
 * Yeni bir saha kanıtı kaydı oluşturur.
 */
export async function createEvidenceItem(
  item: Omit<EvidenceItem, "id" | "created_at" | "updated_at">
): Promise<EvidenceItem> {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = generateId("evd");

  await db.execute(
    `INSERT INTO evidence_items (
       id, project_id, title, evidence_type, file_name, stored_path, mime_type,
       file_size, file_hash, source_type, source_description, collected_at,
       collected_by_role, verification_status, credibility_level, sensitivity_level,
       notes, created_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7,
       $8, $9, $10, $11, $12,
       $13, $14, $15, $16,
       $17, $18, $18
     )`,
    [
      id,
      item.project_id,
      item.title.trim(),
      item.evidence_type || "DOCUMENT",
      item.file_name || null,
      item.stored_path || null,
      item.mime_type || null,
      item.file_size || 0,
      item.file_hash || null,
      item.source_type || "DOCUMENT",
      item.source_description || null,
      item.collected_at || now,
      item.collected_by_role || null,
      item.verification_status || "UNREVIEWED",
      item.credibility_level || "MEDIUM",
      item.sensitivity_level || "NORMAL",
      item.notes || null,
      now,
    ]
  );

  const created = await getEvidenceItemById(id);
  if (!created) throw new Error("Kanıt kaydı oluşturulamadı.");
  return created;
}

/**
 * Mevcut bir saha kanıtı kaydını günceller.
 */
export async function updateEvidenceItem(
  id: string,
  updates: Partial<Omit<EvidenceItem, "id" | "project_id" | "created_at" | "updated_at">>
): Promise<void> {
  const db = await getDb();
  const existing = await getEvidenceItemById(id);
  if (!existing) throw new Error(`Güncellenecek kanıt bulunamadı: ${id}`);

  const now = new Date().toISOString();

  await db.execute(
    `UPDATE evidence_items
     SET title = COALESCE($1, title),
         evidence_type = COALESCE($2, evidence_type),
         file_name = CASE WHEN $3 IS NOT NULL THEN $4 ELSE file_name END,
         stored_path = CASE WHEN $5 IS NOT NULL THEN $6 ELSE stored_path END,
         mime_type = CASE WHEN $7 IS NOT NULL THEN $8 ELSE mime_type END,
         file_size = CASE WHEN $9 IS NOT NULL THEN $10 ELSE file_size END,
         file_hash = CASE WHEN $11 IS NOT NULL THEN $12 ELSE file_hash END,
         source_type = COALESCE($13, source_type),
         source_description = CASE WHEN $14 IS NOT NULL THEN $15 ELSE source_description END,
         collected_at = COALESCE($16, collected_at),
         collected_by_role = CASE WHEN $17 IS NOT NULL THEN $18 ELSE collected_by_role END,
         verification_status = COALESCE($19, verification_status),
         credibility_level = COALESCE($20, credibility_level),
         sensitivity_level = COALESCE($21, sensitivity_level),
         notes = CASE WHEN $22 IS NOT NULL THEN $23 ELSE notes END,
         updated_at = $24
     WHERE id = $25`,
    [
      updates.title ? updates.title.trim() : null,
      updates.evidence_type ?? null,
      updates.file_name !== undefined ? 1 : null,
      updates.file_name ?? null,
      updates.stored_path !== undefined ? 1 : null,
      updates.stored_path ?? null,
      updates.mime_type !== undefined ? 1 : null,
      updates.mime_type ?? null,
      updates.file_size !== undefined ? 1 : null,
      updates.file_size ?? null,
      updates.file_hash !== undefined ? 1 : null,
      updates.file_hash ?? null,
      updates.source_type ?? null,
      updates.source_description !== undefined ? 1 : null,
      updates.source_description ?? null,
      updates.collected_at ?? null,
      updates.collected_by_role !== undefined ? 1 : null,
      updates.collected_by_role ?? null,
      updates.verification_status ?? null,
      updates.credibility_level ?? null,
      updates.sensitivity_level ?? null,
      updates.notes !== undefined ? 1 : null,
      updates.notes ?? null,
      now,
      id,
    ]
  );
}

/**
 * Saha kanıtını, fiziksel dosyasını ve tüm bağlantılarını siler.
 */
export async function deleteEvidenceItem(id: string): Promise<void> {
  const db = await getDb();
  const existing = await getEvidenceItemById(id);
  if (existing?.stored_path) {
    await deleteEvidencePhysicalFile(existing.stored_path);
  }
  await db.execute(`DELETE FROM evidence_items WHERE id = $1`, [id]);
}

/**
 * Kanıt bağlantılarını (links) çeker.
 */
export async function getEvidenceLinks(
  projectId: string,
  targetType?: EvidenceTargetType,
  targetId?: string
): Promise<EvidenceLink[]> {
  const db = await getDb();
  if (targetType && targetId) {
    return db.select<EvidenceLink[]>(
      `SELECT el.*, e.title as evidence_title, e.evidence_type, e.verification_status
       FROM evidence_links el
       JOIN evidence_items e ON e.id = el.evidence_id
       WHERE el.project_id = $1 AND el.target_type = $2 AND el.target_id = $3
       ORDER BY el.created_at ASC`,
      [projectId, targetType, targetId]
    );
  }
  if (targetType) {
    return db.select<EvidenceLink[]>(
      `SELECT el.*, e.title as evidence_title, e.evidence_type, e.verification_status
       FROM evidence_links el
       JOIN evidence_items e ON e.id = el.evidence_id
       WHERE el.project_id = $1 AND el.target_type = $2
       ORDER BY el.created_at ASC`,
      [projectId, targetType]
    );
  }
  return db.select<EvidenceLink[]>(
    `SELECT el.*, e.title as evidence_title, e.evidence_type, e.verification_status
     FROM evidence_links el
     JOIN evidence_items e ON e.id = el.evidence_id
     WHERE el.project_id = $1
     ORDER BY el.created_at ASC`,
    [projectId]
  );
}

/**
 * Belirli bir kanıta bağlı tüm bağlantıları getirir.
 */
export async function getEvidenceLinksByEvidenceId(evidenceId: string): Promise<EvidenceLink[]> {
  const db = await getDb();
  return db.select<EvidenceLink[]>(
    `SELECT el.*, e.title as evidence_title, e.evidence_type, e.verification_status
     FROM evidence_links el
     JOIN evidence_items e ON e.id = el.evidence_id
     WHERE el.evidence_id = $1
     ORDER BY el.created_at ASC`,
    [evidenceId]
  );
}

/**
 * Kanıt ile hedef arasında yeni bağlantı oluşturur.
 */
export async function createEvidenceLink(
  link: Omit<EvidenceLink, "id" | "created_at">
): Promise<EvidenceLink> {
  const db = await getDb();
  const id = generateId("evdl");
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO evidence_links (
       id, project_id, evidence_id, target_type, target_id, question_id,
       business_function_code, ot_station_id, process_map_id, process_node_id,
       governance_asset_id, link_note, created_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6,
       $7, $8, $9, $10,
       $11, $12, $13
     )`,
    [
      id,
      link.project_id,
      link.evidence_id,
      link.target_type,
      link.target_id || null,
      link.question_id || null,
      link.business_function_code || null,
      link.ot_station_id || null,
      link.process_map_id || null,
      link.process_node_id || null,
      link.governance_asset_id || null,
      link.link_note || null,
      now,
    ]
  );

  return {
    id,
    project_id: link.project_id,
    evidence_id: link.evidence_id,
    target_type: link.target_type,
    target_id: link.target_id || null,
    question_id: link.question_id || null,
    business_function_code: link.business_function_code || null,
    ot_station_id: link.ot_station_id || null,
    process_map_id: link.process_map_id || null,
    process_node_id: link.process_node_id || null,
    governance_asset_id: link.governance_asset_id || null,
    link_note: link.link_note || null,
    created_at: now,
  };
}

/**
 * Yalnızca kanıt bağlantısını kaldırır (Unlink - Kanıt ve dosya silinmez).
 */
export async function deleteEvidenceLink(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM evidence_links WHERE id = $1`, [id]);
}

/**
 * Projenin kanıt ve saha doğrulama özet metriklerini hesaplar.
 */
export async function getEvidenceSummaryStats(projectId: string): Promise<EvidenceSummaryStats> {
  const items = await getEvidenceItems(projectId);
  const links = await getEvidenceLinks(projectId);

  const totalEvidence = items.length;
  const unreviewedCount = items.filter((i) => i.verification_status === "UNREVIEWED").length;
  const reviewedCount = items.filter((i) => i.verification_status === "REVIEWED").length;
  const acceptedCount = items.filter((i) => i.verification_status === "ACCEPTED").length;
  const rejectedCount = items.filter((i) => i.verification_status === "REJECTED").length;
  const confidentialOrRestrictedCount = items.filter(
    (i) => i.sensitivity_level === "CONFIDENTIAL" || i.sensitivity_level === "RESTRICTED"
  ).length;

  const linkedEvidenceIds = new Set(links.map((l) => l.evidence_id));
  const linkedEvidenceCount = linkedEvidenceIds.size;
  const unlinkedEvidenceCount = totalEvidence - linkedEvidenceCount;

  const unsupportedCriticalFindings = await getUnsupportedCriticalFindings(projectId);
  const unsupportedCriticalFindingsCount = unsupportedCriticalFindings.length;

  // Kapsama oranı: Kabul edilmiş kanıtların bağlı olduğu hedeflerin toplam hedeflere oranı veya kanıt kapsama oranı
  const evidenceCoverageRate = totalEvidence > 0
    ? Math.round(((acceptedCount + reviewedCount) / totalEvidence) * 100)
    : 0;

  return {
    totalEvidence,
    unreviewedCount,
    reviewedCount,
    acceptedCount,
    rejectedCount,
    unsupportedCriticalFindingsCount,
    evidenceCoverageRate,
    confidentialOrRestrictedCount,
    linkedEvidenceCount,
    unlinkedEvidenceCount,
  };
}

/**
 * Kanıtsız, kanıtı reddedilmiş veya incelenmemiş kritik bulguları, riskleri ve takip sorularını listeler.
 */
export async function getUnsupportedCriticalFindings(
  projectId: string
): Promise<UnsupportedCriticalFinding[]> {
  const db = await getDb();
  const result: UnsupportedCriticalFinding[] = [];

  // 1. Kritik Takip Soruları (question_followups with flag_type = 'critical')
  const criticalFollowups = await db.select<{
    id: string;
    business_function_code: string;
    question_id: string;
    note: string | null;
  }[]>(
    `SELECT id, business_function_code, question_id, note
     FROM question_followups
     WHERE analysis_project_id = $1 AND flag_type = 'critical'`,
    [projectId]
  );

  for (const fol of criticalFollowups) {
    const links = await db.select<{ verification_status: string }[]>(
      `SELECT e.verification_status
       FROM evidence_links el
       JOIN evidence_items e ON e.id = el.evidence_id
       WHERE el.project_id = $1 AND (el.question_id = $2 OR el.target_id = $2)`,
      [projectId, fol.question_id]
    );

    if (links.length === 0) {
      result.push({
        targetType: "QUESTION",
        targetId: fol.question_id,
        title: `Kritik Takip Sorusu [${fol.question_id}]`,
        description: fol.note || "Kritik takip bayrağı konulmuş fakat henüz kanıt bağlanmamış.",
        businessFunctionCode: fol.business_function_code,
        severity: "CRITICAL",
        reason: "NO_EVIDENCE",
      });
    } else {
      const allRejected = links.every((l) => l.verification_status === "REJECTED");
      const hasAccepted = links.some((l) => l.verification_status === "ACCEPTED");
      if (allRejected) {
        result.push({
          targetType: "QUESTION",
          targetId: fol.question_id,
          title: `Kritik Takip Sorusu [${fol.question_id}]`,
          description: "Bağlanan kanıtlar inceleme sonucunda reddedildi.",
          businessFunctionCode: fol.business_function_code,
          severity: "CRITICAL",
          reason: "EVIDENCE_REJECTED",
        });
      } else if (!hasAccepted) {
        result.push({
          targetType: "QUESTION",
          targetId: fol.question_id,
          title: `Kritik Takip Sorusu [${fol.question_id}]`,
          description: "Bağlı kanıt henüz incelenmemiş veya kabul edilmemiş.",
          businessFunctionCode: fol.business_function_code,
          severity: "HIGH",
          reason: "EVIDENCE_UNREVIEWED",
        });
      }
    }
  }

  // 2. Yüksek/Kritik Riskler (project_risks with impact/probability high/critical)
  const criticalRisks = await db.select<{
    id: string;
    business_function_code: string | null;
    title: string;
    description: string;
    question_id: string | null;
  }[]>(
    `SELECT id, business_function_code, title, description, question_id
     FROM project_risks
     WHERE analysis_project_id = $1 AND (impact IN ('high', 'critical') OR probability IN ('high', 'critical'))`,
    [projectId]
  );

  for (const r of criticalRisks) {
    const qId = r.question_id;
    if (qId) {
      const links = await db.select<{ verification_status: string }[]>(
        `SELECT e.verification_status
         FROM evidence_links el
         JOIN evidence_items e ON e.id = el.evidence_id
         WHERE el.project_id = $1 AND (el.question_id = $2 OR el.target_id = $2)`,
        [projectId, qId]
      );
      if (links.length === 0) {
        result.push({
          targetType: "QUESTION",
          targetId: qId,
          title: `Yüksek Risk: ${r.title}`,
          description: r.description,
          businessFunctionCode: r.business_function_code || undefined,
          severity: "HIGH",
          reason: "NO_EVIDENCE",
        });
      }
    }
  }

  // 3. Kritik Veri Yönetişimi Varlıkları (CRITICAL with no evidence or SoD risk)
  const criticalAssets = await db.select<{
    id: string;
    asset_name: string;
    domain: string | null;
    criticality: string;
  }[]>(
    `SELECT id, asset_name, domain, criticality
     FROM data_governance_assets
     WHERE project_id = $1 AND criticality = 'CRITICAL'`,
    [projectId]
  );

  for (const ast of criticalAssets) {
    const links = await db.select<{ verification_status: string }[]>(
      `SELECT e.verification_status
       FROM evidence_links el
       JOIN evidence_items e ON e.id = el.evidence_id
       WHERE el.project_id = $1 AND (el.governance_asset_id = $2 OR (el.target_type = 'GOVERNANCE_ASSET' AND el.target_id = $2))`,
      [projectId, ast.id]
    );
    if (links.length === 0) {
      result.push({
        targetType: "GOVERNANCE_ASSET",
        targetId: ast.id,
        title: `Kritik Veri Varlığı: ${ast.asset_name}`,
        description: `${ast.domain || "Genel"} alanındaki bu kritik veri varlığı için saha doğrulama kanıtı bulunmuyor.`,
        severity: "CRITICAL",
        reason: "NO_EVIDENCE",
      });
    }
  }

  return result;
}

export * from './governanceClient';
