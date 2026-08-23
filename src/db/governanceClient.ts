// path: /home/selim/projects/erp-crm-discovery/src/db/governanceClient.ts
/**
 * ERP CRM Discovery — Veri Sahipliği, Yetkiler ve Sorumluluk Yönetişimi DB Client
 *
 * FAZ-46 Single Source of Truth for Governance Database Operations.
 */

import { getDb } from "./client";
import type {
  GovernanceObject,
  CreateGovernanceObjectPayload,
  UpdateGovernanceObjectPayload,
  GovernanceSubject,
  CreateGovernanceSubjectPayload,
  UpdateGovernanceSubjectPayload,
  GovernanceScope,
  CreateGovernanceScopePayload,
  UpdateGovernanceScopePayload,
  GovernanceResponsibility,
  CreateGovernanceResponsibilityPayload,
  UpdateGovernanceResponsibilityPayload,
  GovernanceAuthorization,
  CreateGovernanceAuthorizationPayload,
  UpdateGovernanceAuthorizationPayload,
  GovernanceLimit,
  CreateGovernanceLimitPayload,
  UpdateGovernanceLimitPayload,
  GovernanceSodRisk,
  CreateGovernanceSodRiskPayload,
  UpdateGovernanceSodRiskPayload,
  GovernanceAttachment,
  CreateGovernanceAttachmentPayload,
  GovernanceAttachmentEntityType,
  GovernanceSummary,
  GovernanceStateType,
} from "../types/governance";

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 23 Canonical Starter Governance Objects (Başlangıç Kataloğu)
 */
export const DEFAULT_STARTER_GOVERNANCE_OBJECTS = [
  { code: "GO_ITEM_MASTER", category: "master_data", name_tr: "Stok / Malzeme Kartı", name_en: "Item / Material Master", related_bf_code: "INVENTORY", sort_order: 1 },
  { code: "GO_CUSTOMER_MASTER", category: "master_data", name_tr: "Müşteri / Bayi Kartı", name_en: "Customer / Dealer Master", related_bf_code: "SALES", sort_order: 2 },
  { code: "GO_VENDOR_MASTER", category: "master_data", name_tr: "Tedarikçi / Satıcı Kartı", name_en: "Vendor / Supplier Master", related_bf_code: "PROCUREMENT", sort_order: 3 },
  { code: "GO_PRICE_LIST", category: "master_data", name_tr: "Fiyat Listesi ve İskonto", name_en: "Price List & Discount Matrix", related_bf_code: "SALES", sort_order: 4 },
  { code: "GO_BOM", category: "master_data", name_tr: "Ürün Ağacı ve Reçete", name_en: "Bill of Materials (BOM) & Recipe", related_bf_code: "PRODUCTION", sort_order: 5 },
  { code: "GO_PURCHASE_REQ", category: "transactional", name_tr: "Satın Alma Talebi", name_en: "Purchase Requisition", related_bf_code: "PROCUREMENT", sort_order: 6 },
  { code: "GO_PURCHASE_ORDER", category: "transactional", name_tr: "Satın Alma Siparişi", name_en: "Purchase Order", related_bf_code: "PROCUREMENT", sort_order: 7 },
  { code: "GO_GOODS_RECEIPT", category: "transactional", name_tr: "Mal Kabul / Giriş İrsaliyesi", name_en: "Goods Receipt / Inward Note", related_bf_code: "WAREHOUSE", sort_order: 8 },
  { code: "GO_SALES_QUOTE", category: "transactional", name_tr: "Satış Teklifi", name_en: "Sales Quotation", related_bf_code: "SALES", sort_order: 9 },
  { code: "GO_SALES_ORDER", category: "transactional", name_tr: "Satış Siparişi", name_en: "Sales Order", related_bf_code: "SALES", sort_order: 10 },
  { code: "GO_DELIVERY_NOTE", category: "transactional", name_tr: "Sevk İrsaliyesi", name_en: "Delivery Note / Dispatch", related_bf_code: "LOGISTICS", sort_order: 11 },
  { code: "GO_SALES_INVOICE", category: "financial", name_tr: "Satış Faturası", name_en: "Sales Invoice", related_bf_code: "INVOICING", sort_order: 12 },
  { code: "GO_PURCHASE_INVOICE", category: "financial", name_tr: "Alış Faturası", name_en: "Purchase Invoice", related_bf_code: "INVOICING", sort_order: 13 },
  { code: "GO_COLLECTION", category: "financial", name_tr: "Tahsilat / Kasa-Banka Girişi", name_en: "Collection / Cash & Bank Inward", related_bf_code: "FINANCE", sort_order: 14 },
  { code: "GO_PAYMENT", category: "financial", name_tr: "Ödeme Emri / Banka Çıkışı", name_en: "Payment Order / Bank Outward", related_bf_code: "FINANCE", sort_order: 15 },
  { code: "GO_GL_JOURNAL", category: "financial", name_tr: "Yevmiye / Mahsup Fişi", name_en: "General Ledger Journal Entry", related_bf_code: "ACCOUNTING", sort_order: 16 },
  { code: "GO_FIXED_ASSET", category: "financial", name_tr: "Sabit Kıymet / Demirbaş", name_en: "Fixed Asset Master", related_bf_code: "FIXED_ASSETS", sort_order: 17 },
  { code: "GO_EMPLOYEE_CARD", category: "master_data", name_tr: "Çalışan / Personel Özlük", name_en: "Employee Master / Personnel File", related_bf_code: "HUMAN_RESOURCES", sort_order: 18 },
  { code: "GO_PAYROLL", category: "financial", name_tr: "Maaş / Bordro Tahakkuku", name_en: "Payroll & Salary Accrual", related_bf_code: "HUMAN_RESOURCES", sort_order: 19 },
  { code: "GO_PROJECT_RECORD", category: "master_data", name_tr: "Proje / İş Emri Kartı", name_en: "Project Record & Work Order", related_bf_code: "PROJECT_MANAGEMENT", sort_order: 20 },
  { code: "GO_CONTRACT", category: "master_data", name_tr: "Hukuki Sözleşme", name_en: "Legal Contract Master", related_bf_code: "LEGAL_COMPLIANCE", sort_order: 21 },
  { code: "GO_QUALITY_RECORD", category: "transactional", name_tr: "Kalite Kontrol / Uygunsuzluk", name_en: "Quality Inspection & Non-Conformance", related_bf_code: "QUALITY_MANAGEMENT", sort_order: 22 },
  { code: "GO_USER_AUTH_ADMIN", category: "system", name_tr: "Kullanıcı ve Yetki Yönetimi", name_en: "User & Permission Administration", related_bf_code: "MANAGEMENT", sort_order: 23 },
] as const;

// ============================================================================
// 1. Governance Objects CRUD
// ============================================================================

export async function seedDefaultGovernanceObjects(projectId: string): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  let inserted = 0;

  for (const obj of DEFAULT_STARTER_GOVERNANCE_OBJECTS) {
    const existing = await db.select<GovernanceObject[]>(
      `SELECT id FROM governance_objects WHERE analysis_project_id = $1 AND code = $2`,
      [projectId, obj.code]
    );
    if (existing.length === 0) {
      const id = generateId("gobj");
      await db.execute(
        `INSERT INTO governance_objects (id, analysis_project_id, category, code, name_tr, name_en, related_bf_code, description, is_active, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9, $10, $11)`,
        [id, projectId, obj.category, obj.code, obj.name_tr, obj.name_en, obj.related_bf_code, null, obj.sort_order, now, now]
      );
      inserted++;
    }
  }
  return inserted;
}

export async function getGovernanceObjects(projectId: string): Promise<GovernanceObject[]> {
  const db = await getDb();
  return db.select<GovernanceObject[]>(
    `SELECT * FROM governance_objects WHERE analysis_project_id = $1 ORDER BY sort_order ASC, name_tr ASC`,
    [projectId]
  );
}

export async function createGovernanceObject(payload: CreateGovernanceObjectPayload): Promise<GovernanceObject> {
  const db = await getDb();
  const id = generateId("gobj");
  const now = new Date().toISOString();
  const sortOrder = payload.sort_order ?? 100;
  const nameEn = payload.name_en ?? payload.name_tr;

  await db.execute(
    `INSERT INTO governance_objects (id, analysis_project_id, category, code, name_tr, name_en, related_bf_code, description, is_active, sort_order, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9, $10, $11)`,
    [id, payload.analysis_project_id, payload.category, payload.code, payload.name_tr, nameEn, payload.related_bf_code || null, payload.description || null, sortOrder, now, now]
  );

  const rows = await db.select<GovernanceObject[]>(`SELECT * FROM governance_objects WHERE id = $1`, [id]);
  return rows[0];
}

export async function updateGovernanceObject(id: string, projectId: string, payload: UpdateGovernanceObjectPayload): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE governance_objects
     SET category = COALESCE($1, category),
         code = COALESCE($2, code),
         name_tr = COALESCE($3, name_tr),
         name_en = COALESCE($4, name_en),
         related_bf_code = $5,
         description = $6,
         is_active = COALESCE($7, is_active),
         sort_order = COALESCE($8, sort_order),
         updated_at = $9
     WHERE id = $10 AND analysis_project_id = $11`,
    [payload.category, payload.code, payload.name_tr, payload.name_en, payload.related_bf_code, payload.description, payload.is_active, payload.sort_order, now, id, projectId]
  );
}

export async function deleteGovernanceObject(id: string, projectId: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM governance_objects WHERE id = $1 AND analysis_project_id = $2`, [id, projectId]);
}

// ============================================================================
// 2. Governance Subjects CRUD (Users / Groups / Roles)
// ============================================================================

export async function getGovernanceSubjects(projectId: string): Promise<GovernanceSubject[]> {
  const db = await getDb();
  return db.select<GovernanceSubject[]>(
    `SELECT * FROM governance_subjects WHERE analysis_project_id = $1 ORDER BY subject_type ASC, name ASC`,
    [projectId]
  );
}

export async function createGovernanceSubject(payload: CreateGovernanceSubjectPayload): Promise<GovernanceSubject> {
  const db = await getDb();
  const id = generateId("gsub");
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO governance_subjects (id, analysis_project_id, subject_type, name, department_name, description, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, 1, $7, $8)`,
    [id, payload.analysis_project_id, payload.subject_type, payload.name, payload.department_name || null, payload.description || null, now, now]
  );

  const rows = await db.select<GovernanceSubject[]>(`SELECT * FROM governance_subjects WHERE id = $1`, [id]);
  return rows[0];
}

export async function updateGovernanceSubject(id: string, projectId: string, payload: UpdateGovernanceSubjectPayload): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE governance_subjects
     SET subject_type = COALESCE($1, subject_type),
         name = COALESCE($2, name),
         department_name = $3,
         description = $4,
         is_active = COALESCE($5, is_active),
         updated_at = $6
     WHERE id = $7 AND analysis_project_id = $8`,
    [payload.subject_type, payload.name, payload.department_name, payload.description, payload.is_active, now, id, projectId]
  );
}

export async function deleteGovernanceSubject(id: string, projectId: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM governance_subjects WHERE id = $1 AND analysis_project_id = $2`, [id, projectId]);
}

// ============================================================================
// 3. Governance Scopes CRUD (Company, Branch, Department, etc.)
// ============================================================================

export async function getGovernanceScopes(projectId: string): Promise<GovernanceScope[]> {
  const db = await getDb();
  return db.select<GovernanceScope[]>(
    `SELECT * FROM governance_scopes WHERE analysis_project_id = $1 ORDER BY scope_type ASC, name ASC`,
    [projectId]
  );
}

export async function createGovernanceScope(payload: CreateGovernanceScopePayload): Promise<GovernanceScope> {
  const db = await getDb();
  const id = generateId("gscp");
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO governance_scopes (id, analysis_project_id, scope_type, name, parent_scope_id, description, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, 1, $7, $8)`,
    [id, payload.analysis_project_id, payload.scope_type, payload.name, payload.parent_scope_id || null, payload.description || null, now, now]
  );

  const rows = await db.select<GovernanceScope[]>(`SELECT * FROM governance_scopes WHERE id = $1`, [id]);
  return rows[0];
}

export async function updateGovernanceScope(id: string, projectId: string, payload: UpdateGovernanceScopePayload): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE governance_scopes
     SET scope_type = COALESCE($1, scope_type),
         name = COALESCE($2, name),
         parent_scope_id = $3,
         description = $4,
         is_active = COALESCE($5, is_active),
         updated_at = $6
     WHERE id = $7 AND analysis_project_id = $8`,
    [payload.scope_type, payload.name, payload.parent_scope_id, payload.description, payload.is_active, now, id, projectId]
  );
}

export async function deleteGovernanceScope(id: string, projectId: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM governance_scopes WHERE id = $1 AND analysis_project_id = $2`, [id, projectId]);
}

// ============================================================================
// 4. Governance Responsibilities (Data Owner, Steward, Custodian)
// ============================================================================

export async function getGovernanceResponsibilities(
  projectId: string,
  filter?: { objectId?: string; subjectId?: string; stateType?: GovernanceStateType }
): Promise<GovernanceResponsibility[]> {
  const db = await getDb();
  let sql = `
    SELECT r.*,
           o.code as object_code, o.name_tr as object_name_tr,
           s.name as subject_name, s.subject_type as subject_type,
           sc.name as scope_name, sc.scope_type as scope_type
    FROM governance_responsibilities r
    JOIN governance_objects o ON r.governance_object_id = o.id
    JOIN governance_subjects s ON r.subject_id = s.id
    LEFT JOIN governance_scopes sc ON r.scope_id = sc.id
    WHERE r.analysis_project_id = $1
  `;
  const params: any[] = [projectId];

  if (filter?.objectId) {
    params.push(filter.objectId);
    sql += ` AND r.governance_object_id = $${params.length}`;
  }
  if (filter?.subjectId) {
    params.push(filter.subjectId);
    sql += ` AND r.subject_id = $${params.length}`;
  }
  if (filter?.stateType) {
    params.push(filter.stateType);
    sql += ` AND r.state_type = $${params.length}`;
  }

  sql += ` ORDER BY o.sort_order ASC, r.responsibility_type ASC`;
  return db.select<GovernanceResponsibility[]>(sql, params);
}

export async function createGovernanceResponsibility(payload: CreateGovernanceResponsibilityPayload): Promise<GovernanceResponsibility> {
  const db = await getDb();
  const id = generateId("gresp");
  const now = new Date().toISOString();
  const stateType = payload.state_type || "as_is";

  await db.execute(
    `INSERT INTO governance_responsibilities (id, analysis_project_id, governance_object_id, subject_id, responsibility_type, scope_id, state_type, notes, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [id, payload.analysis_project_id, payload.governance_object_id, payload.subject_id, payload.responsibility_type, payload.scope_id || null, stateType, payload.notes || null, now, now]
  );

  const rows = await getGovernanceResponsibilities(payload.analysis_project_id);
  return rows.find((r) => r.id === id)!;
}

export async function updateGovernanceResponsibility(id: string, projectId: string, payload: UpdateGovernanceResponsibilityPayload): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE governance_responsibilities
     SET governance_object_id = COALESCE($1, governance_object_id),
         subject_id = COALESCE($2, subject_id),
         responsibility_type = COALESCE($3, responsibility_type),
         scope_id = $4,
         state_type = COALESCE($5, state_type),
         notes = $6,
         updated_at = $7
     WHERE id = $8 AND analysis_project_id = $9`,
    [payload.governance_object_id, payload.subject_id, payload.responsibility_type, payload.scope_id, payload.state_type, payload.notes, now, id, projectId]
  );
}

export async function deleteGovernanceResponsibility(id: string, projectId: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM governance_responsibilities WHERE id = $1 AND analysis_project_id = $2`, [id, projectId]);
}

// ============================================================================
// 5. Governance Authorizations (Yetki Matrisi)
// ============================================================================

export async function getGovernanceAuthorizations(
  projectId: string,
  filter?: { objectId?: string; subjectId?: string; stateType?: GovernanceStateType }
): Promise<GovernanceAuthorization[]> {
  const db = await getDb();
  let sql = `
    SELECT a.*,
           o.code as object_code, o.name_tr as object_name_tr,
           s.name as subject_name, s.subject_type as subject_type,
           sc.name as scope_name, sc.scope_type as scope_type
    FROM governance_authorizations a
    JOIN governance_objects o ON a.governance_object_id = o.id
    JOIN governance_subjects s ON a.subject_id = s.id
    LEFT JOIN governance_scopes sc ON a.scope_id = sc.id
    WHERE a.analysis_project_id = $1
  `;
  const params: any[] = [projectId];

  if (filter?.objectId) {
    params.push(filter.objectId);
    sql += ` AND a.governance_object_id = $${params.length}`;
  }
  if (filter?.subjectId) {
    params.push(filter.subjectId);
    sql += ` AND a.subject_id = $${params.length}`;
  }
  if (filter?.stateType) {
    params.push(filter.stateType);
    sql += ` AND a.state_type = $${params.length}`;
  }

  sql += ` ORDER BY s.name ASC, o.sort_order ASC`;
  return db.select<GovernanceAuthorization[]>(sql, params);
}

export async function createGovernanceAuthorization(payload: CreateGovernanceAuthorizationPayload): Promise<GovernanceAuthorization> {
  const db = await getDb();
  const id = generateId("gauth");
  const now = new Date().toISOString();
  const stateType = payload.state_type || "as_is";
  const source = payload.permission_source || "direct";
  const hasDiscrepancy = payload.effective_level && payload.effective_level !== payload.permission_level ? 1 : (payload.has_discrepancy ? 1 : 0);

  await db.execute(
    `INSERT INTO governance_authorizations (
       id, analysis_project_id, governance_object_id, subject_id, scope_id,
       permission_level, permission_source, effective_level, has_discrepancy,
       can_view, can_create, can_edit, can_delete, can_approve, can_cancel, can_export, can_view_cost,
       state_type, notes, created_at, updated_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
    [
      id, payload.analysis_project_id, payload.governance_object_id, payload.subject_id, payload.scope_id || null,
      payload.permission_level, source, payload.effective_level || null, hasDiscrepancy,
      payload.can_view ?? 1, payload.can_create ?? 0, payload.can_edit ?? 0, payload.can_delete ?? 0,
      payload.can_approve ?? 0, payload.can_cancel ?? 0, payload.can_export ?? 0, payload.can_view_cost ?? 0,
      stateType, payload.notes || null, now, now
    ]
  );

  const rows = await getGovernanceAuthorizations(payload.analysis_project_id);
  return rows.find((a) => a.id === id)!;
}

export async function updateGovernanceAuthorization(id: string, projectId: string, payload: UpdateGovernanceAuthorizationPayload): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE governance_authorizations
     SET governance_object_id = COALESCE($1, governance_object_id),
         subject_id = COALESCE($2, subject_id),
         scope_id = $3,
         permission_level = COALESCE($4, permission_level),
         permission_source = COALESCE($5, permission_source),
         effective_level = $6,
         has_discrepancy = COALESCE($7, has_discrepancy),
         can_view = COALESCE($8, can_view),
         can_create = COALESCE($9, can_create),
         can_edit = COALESCE($10, can_edit),
         can_delete = COALESCE($11, can_delete),
         can_approve = COALESCE($12, can_approve),
         can_cancel = COALESCE($13, can_cancel),
         can_export = COALESCE($14, can_export),
         can_view_cost = COALESCE($15, can_view_cost),
         state_type = COALESCE($16, state_type),
         notes = $17,
         updated_at = $18
     WHERE id = $19 AND analysis_project_id = $20`,
    [
      payload.governance_object_id, payload.subject_id, payload.scope_id, payload.permission_level,
      payload.permission_source, payload.effective_level, payload.has_discrepancy,
      payload.can_view, payload.can_create, payload.can_edit, payload.can_delete,
      payload.can_approve, payload.can_cancel, payload.can_export, payload.can_view_cost,
      payload.state_type, payload.notes, now, id, projectId
    ]
  );
}

export async function deleteGovernanceAuthorization(id: string, projectId: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM governance_authorizations WHERE id = $1 AND analysis_project_id = $2`, [id, projectId]);
}

// ============================================================================
// 6. Governance Limits (Onay Limitleri)
// ============================================================================

export async function getGovernanceLimits(projectId: string, stateType?: GovernanceStateType): Promise<GovernanceLimit[]> {
  const db = await getDb();
  let sql = `
    SELECT l.*,
           o.code as object_code, o.name_tr as object_name_tr,
           s.name as subject_name,
           ap.name as approver_subject_name,
           sc.name as scope_name
    FROM governance_limits l
    JOIN governance_subjects s ON l.subject_id = s.id
    LEFT JOIN governance_objects o ON l.governance_object_id = o.id
    LEFT JOIN governance_subjects ap ON l.approver_subject_id = ap.id
    LEFT JOIN governance_scopes sc ON l.scope_id = sc.id
    WHERE l.analysis_project_id = $1
  `;
  const params: any[] = [projectId];

  if (stateType) {
    params.push(stateType);
    sql += ` AND l.state_type = $${params.length}`;
  }

  sql += ` ORDER BY l.limit_type ASC, l.min_value ASC`;
  return db.select<GovernanceLimit[]>(sql, params);
}

export async function createGovernanceLimit(payload: CreateGovernanceLimitPayload): Promise<GovernanceLimit> {
  const db = await getDb();
  const id = generateId("glim");
  const now = new Date().toISOString();
  const stateType = payload.state_type || "as_is";

  await db.execute(
    `INSERT INTO governance_limits (
       id, analysis_project_id, governance_object_id, subject_id, scope_id,
       limit_type, currency_or_unit, min_value, max_value, approval_tier, approver_subject_id,
       state_type, notes, created_at, updated_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [
      id, payload.analysis_project_id, payload.governance_object_id || null, payload.subject_id, payload.scope_id || null,
      payload.limit_type, payload.currency_or_unit || "TRY", payload.min_value ?? null, payload.max_value ?? null,
      payload.approval_tier || null, payload.approver_subject_id || null, stateType, payload.notes || null, now, now
    ]
  );

  const rows = await getGovernanceLimits(payload.analysis_project_id);
  return rows.find((l) => l.id === id)!;
}

export async function updateGovernanceLimit(id: string, projectId: string, payload: UpdateGovernanceLimitPayload): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE governance_limits
     SET governance_object_id = $1,
         subject_id = COALESCE($2, subject_id),
         scope_id = $3,
         limit_type = COALESCE($4, limit_type),
         currency_or_unit = COALESCE($5, currency_or_unit),
         min_value = $6,
         max_value = $7,
         approval_tier = $8,
         approver_subject_id = $9,
         state_type = COALESCE($10, state_type),
         notes = $11,
         updated_at = $12
     WHERE id = $13 AND analysis_project_id = $14`,
    [
      payload.governance_object_id, payload.subject_id, payload.scope_id, payload.limit_type,
      payload.currency_or_unit, payload.min_value, payload.max_value, payload.approval_tier,
      payload.approver_subject_id, payload.state_type, payload.notes, now, id, projectId
    ]
  );
}

export async function deleteGovernanceLimit(id: string, projectId: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM governance_limits WHERE id = $1 AND analysis_project_id = $2`, [id, projectId]);
}

// ============================================================================
// 7. Governance SoD Risks (Görevler Ayrılığı Riskleri)
// ============================================================================

export async function getGovernanceSodRisks(projectId: string, stateType?: GovernanceStateType): Promise<GovernanceSodRisk[]> {
  const db = await getDb();
  let sql = `
    SELECT r.*,
           o.code as object_code, o.name_tr as object_name_tr,
           s.name as subject_name,
           sc.name as scope_name
    FROM governance_sod_risks r
    LEFT JOIN governance_objects o ON r.governance_object_id = o.id
    LEFT JOIN governance_subjects s ON r.subject_id = s.id
    LEFT JOIN governance_scopes sc ON r.scope_id = sc.id
    WHERE r.analysis_project_id = $1
  `;
  const params: any[] = [projectId];

  if (stateType) {
    params.push(stateType);
    sql += ` AND r.state_type = $${params.length}`;
  }

  sql += ` ORDER BY CASE r.risk_severity
             WHEN 'critical' THEN 1
             WHEN 'high' THEN 2
             WHEN 'medium' THEN 3
             WHEN 'low' THEN 4
             ELSE 5 END ASC, r.created_at DESC`;
  return db.select<GovernanceSodRisk[]>(sql, params);
}

export async function createGovernanceSodRisk(payload: CreateGovernanceSodRiskPayload): Promise<GovernanceSodRisk> {
  const db = await getDb();
  const id = generateId("gsod");
  const now = new Date().toISOString();
  const severity = payload.risk_severity || "high";
  const status = payload.status || "open";
  const stateType = payload.state_type || "as_is";

  await db.execute(
    `INSERT INTO governance_sod_risks (
       id, analysis_project_id, governance_object_id, subject_id, scope_id,
       risk_title, conflicting_duty_a, conflicting_duty_b, risk_severity,
       current_control, mitigation_action, risk_owner, status, state_type,
       created_at, updated_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
    [
      id, payload.analysis_project_id, payload.governance_object_id || null, payload.subject_id || null, payload.scope_id || null,
      payload.risk_title, payload.conflicting_duty_a, payload.conflicting_duty_b, severity,
      payload.current_control || null, payload.mitigation_action || null, payload.risk_owner || null,
      status, stateType, now, now
    ]
  );

  const rows = await getGovernanceSodRisks(payload.analysis_project_id);
  return rows.find((r) => r.id === id)!;
}

export async function updateGovernanceSodRisk(id: string, projectId: string, payload: UpdateGovernanceSodRiskPayload): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE governance_sod_risks
     SET governance_object_id = $1,
         subject_id = $2,
         scope_id = $3,
         risk_title = COALESCE($4, risk_title),
         conflicting_duty_a = COALESCE($5, conflicting_duty_a),
         conflicting_duty_b = COALESCE($6, conflicting_duty_b),
         risk_severity = COALESCE($7, risk_severity),
         current_control = $8,
         mitigation_action = $9,
         risk_owner = $10,
         status = COALESCE($11, status),
         state_type = COALESCE($12, state_type),
         updated_at = $13
     WHERE id = $14 AND analysis_project_id = $15`,
    [
      payload.governance_object_id, payload.subject_id, payload.scope_id, payload.risk_title,
      payload.conflicting_duty_a, payload.conflicting_duty_b, payload.risk_severity,
      payload.current_control, payload.mitigation_action, payload.risk_owner, payload.status,
      payload.state_type, now, id, projectId
    ]
  );
}

export async function deleteGovernanceSodRisk(id: string, projectId: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM governance_sod_risks WHERE id = $1 AND analysis_project_id = $2`, [id, projectId]);
}

// ============================================================================
// 8. Governance Attachments CRUD
// ============================================================================

export async function getGovernanceAttachments(
  projectId: string,
  entityType?: GovernanceAttachmentEntityType,
  entityId?: string
): Promise<GovernanceAttachment[]> {
  const db = await getDb();
  let sql = `SELECT * FROM governance_attachments WHERE analysis_project_id = $1`;
  const params: any[] = [projectId];

  if (entityType) {
    params.push(entityType);
    sql += ` AND entity_type = $${params.length}`;
  }
  if (entityId) {
    params.push(entityId);
    sql += ` AND entity_id = $${params.length}`;
  }

  sql += ` ORDER BY created_at DESC`;
  return db.select<GovernanceAttachment[]>(sql, params);
}

export async function createGovernanceAttachmentRecord(payload: CreateGovernanceAttachmentPayload): Promise<GovernanceAttachment> {
  const db = await getDb();
  const id = generateId("gatt");
  const now = new Date().toISOString();
  const importedAt = payload.imported_at || now;

  await db.execute(
    `INSERT INTO governance_attachments (
       id, analysis_project_id, entity_type, entity_id,
       original_file_name, stored_file_name, relative_path,
       mime_type, file_size, sha256, imported_at, created_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      id, payload.analysis_project_id, payload.entity_type, payload.entity_id,
      payload.original_file_name, payload.stored_file_name, payload.relative_path,
      payload.mime_type, payload.file_size, payload.sha256, importedAt, now
    ]
  );

  const rows = await db.select<GovernanceAttachment[]>(`SELECT * FROM governance_attachments WHERE id = $1`, [id]);
  return rows[0];
}

export async function deleteGovernanceAttachmentRecord(id: string, projectId: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM governance_attachments WHERE id = $1 AND analysis_project_id = $2`, [id, projectId]);
}

// ============================================================================
// 9. Governance Summary & KPI Calculation
// ============================================================================

export async function getGovernanceSummary(projectId: string): Promise<GovernanceSummary> {
  const db = await getDb();

  const totalObjectsRow = await db.select<[{ c: number }]>(
    `SELECT count(*) as c FROM governance_objects WHERE analysis_project_id = $1`,
    [projectId]
  );
  const totalSubjectsRow = await db.select<[{ c: number }]>(
    `SELECT count(*) as c FROM governance_subjects WHERE analysis_project_id = $1`,
    [projectId]
  );
  const totalScopesRow = await db.select<[{ c: number }]>(
    `SELECT count(*) as c FROM governance_scopes WHERE analysis_project_id = $1`,
    [projectId]
  );
  const totalAuthsRow = await db.select<[{ c: number }]>(
    `SELECT count(*) as c FROM governance_authorizations WHERE analysis_project_id = $1`,
    [projectId]
  );
  const totalLimitsRow = await db.select<[{ c: number }]>(
    `SELECT count(*) as c FROM governance_limits WHERE analysis_project_id = $1`,
    [projectId]
  );
  const totalAttachmentsRow = await db.select<[{ c: number }]>(
    `SELECT count(*) as c FROM governance_attachments WHERE analysis_project_id = $1`,
    [projectId]
  );

  // Unassigned Owners: Objects having no 'data_owner' responsibility
  const unassignedOwnerRow = await db.select<[{ c: number }]>(
    `SELECT count(*) as c FROM governance_objects o
     WHERE o.analysis_project_id = $1
       AND NOT EXISTS (
         SELECT 1 FROM governance_responsibilities r
         WHERE r.analysis_project_id = o.analysis_project_id
           AND r.governance_object_id = o.id
           AND r.responsibility_type = 'data_owner'
       )`,
    [projectId]
  );

  // Unassigned Stewards: Objects having no 'data_steward' responsibility
  const unassignedStewardRow = await db.select<[{ c: number }]>(
    `SELECT count(*) as c FROM governance_objects o
     WHERE o.analysis_project_id = $1
       AND NOT EXISTS (
         SELECT 1 FROM governance_responsibilities r
         WHERE r.analysis_project_id = o.analysis_project_id
           AND r.governance_object_id = o.id
           AND r.responsibility_type = 'data_steward'
       )`,
    [projectId]
  );

  // SoD Risks
  const sodRows = await db.select<[{ c: number; crit: number }]>(
    `SELECT count(*) as c,
            SUM(CASE WHEN risk_severity = 'critical' AND status != 'closed' THEN 1 ELSE 0 END) as crit
     FROM governance_sod_risks
     WHERE analysis_project_id = $1`,
    [projectId]
  );

  // Discrepancies
  const discrepancyRow = await db.select<[{ c: number }]>(
    `SELECT count(*) as c FROM governance_authorizations
     WHERE analysis_project_id = $1 AND has_discrepancy = 1`,
    [projectId]
  );

  return {
    totalObjects: totalObjectsRow[0]?.c || 0,
    totalSubjects: totalSubjectsRow[0]?.c || 0,
    totalScopes: totalScopesRow[0]?.c || 0,
    totalAuthorizations: totalAuthsRow[0]?.c || 0,
    totalLimits: totalLimitsRow[0]?.c || 0,
    totalAttachments: totalAttachmentsRow[0]?.c || 0,
    unassignedOwnerCount: unassignedOwnerRow[0]?.c || 0,
    unassignedStewardCount: unassignedStewardRow[0]?.c || 0,
    totalSodRisks: sodRows[0]?.c || 0,
    criticalSodRiskCount: sodRows[0]?.crit || 0,
    discrepancyCount: discrepancyRow[0]?.c || 0,
  };
}
