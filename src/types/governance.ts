// path: /home/selim/projects/erp-crm-discovery/src/types/governance.ts
/**
 * ERP CRM Discovery — Veri Sahipliği, Yetkiler ve Sorumluluk Yönetişimi Tipleri
 *
 * FAZ-46 Domain Model Definition
 */

export type GovernanceSubjectType = 'user' | 'group' | 'role';

export type GovernanceScopeType =
  | 'organization_wide'
  | 'company'
  | 'branch'
  | 'department'
  | 'team'
  | 'dataset'
  | 'custom';

export type GovernanceResponsibilityType =
  | 'data_owner'
  | 'data_steward'
  | 'technical_custodian'
  | 'approver'
  | 'process_owner'
  | 'control_owner';

export type GovernancePermissionLevel =
  | 'full'
  | 'read_only'
  | 'none'
  | 'partial'
  | 'unspecified';

export type GovernancePermissionSource =
  | 'direct'
  | 'group'
  | 'role'
  | 'inherited'
  | 'exception'
  | 'observed';

export type GovernanceStateType = 'as_is' | 'to_be';

export type GovernanceRiskSeverity =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'unspecified';

export type GovernanceRiskStatus =
  | 'open'
  | 'in_review'
  | 'mitigated'
  | 'accepted'
  | 'closed';

export type GovernanceAttachmentEntityType =
  | 'object'
  | 'responsibility'
  | 'authorization'
  | 'limit'
  | 'sod_risk';

// --- Governance Objects (Yönetişim Nesneleri) ---
export interface GovernanceObject {
  id: string;
  analysis_project_id: string;
  category: string;
  code: string;
  name_tr: string;
  name_en: string;
  related_bf_code?: string | null;
  description?: string | null;
  is_active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGovernanceObjectPayload {
  analysis_project_id: string;
  category: string;
  code: string;
  name_tr: string;
  name_en?: string;
  related_bf_code?: string | null;
  description?: string | null;
  sort_order?: number;
}

export interface UpdateGovernanceObjectPayload {
  category?: string;
  code?: string;
  name_tr?: string;
  name_en?: string;
  related_bf_code?: string | null;
  description?: string | null;
  is_active?: number;
  sort_order?: number;
}

// --- Governance Subjects (Özneler: Kullanıcı, Grup, Rol) ---
export interface GovernanceSubject {
  id: string;
  analysis_project_id: string;
  subject_type: GovernanceSubjectType;
  name: string;
  department_name?: string | null;
  description?: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGovernanceSubjectPayload {
  analysis_project_id: string;
  subject_type: GovernanceSubjectType;
  name: string;
  department_name?: string | null;
  description?: string | null;
}

export interface UpdateGovernanceSubjectPayload {
  subject_type?: GovernanceSubjectType;
  name?: string;
  department_name?: string | null;
  description?: string | null;
  is_active?: number;
}

// --- Governance Scopes (Kapsamlar: Şirket, Şube, Departman vb.) ---
export interface GovernanceScope {
  id: string;
  analysis_project_id: string;
  scope_type: GovernanceScopeType;
  name: string;
  parent_scope_id?: string | null;
  description?: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGovernanceScopePayload {
  analysis_project_id: string;
  scope_type: GovernanceScopeType;
  name: string;
  parent_scope_id?: string | null;
  description?: string | null;
}

export interface UpdateGovernanceScopePayload {
  scope_type?: GovernanceScopeType;
  name?: string;
  parent_scope_id?: string | null;
  description?: string | null;
  is_active?: number;
}

// --- Governance Responsibilities (Sorumluluklar: Data Owner, Steward, Custodian) ---
export interface GovernanceResponsibility {
  id: string;
  analysis_project_id: string;
  governance_object_id: string;
  subject_id: string;
  responsibility_type: GovernanceResponsibilityType;
  scope_id?: string | null;
  state_type: GovernanceStateType;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields for UI convenience
  object_code?: string;
  object_name_tr?: string;
  subject_name?: string;
  subject_type?: GovernanceSubjectType;
  scope_name?: string;
  scope_type?: GovernanceScopeType;
}

export interface CreateGovernanceResponsibilityPayload {
  analysis_project_id: string;
  governance_object_id: string;
  subject_id: string;
  responsibility_type: GovernanceResponsibilityType;
  scope_id?: string | null;
  state_type?: GovernanceStateType;
  notes?: string | null;
}

export interface UpdateGovernanceResponsibilityPayload {
  governance_object_id?: string;
  subject_id?: string;
  responsibility_type?: GovernanceResponsibilityType;
  scope_id?: string | null;
  state_type?: GovernanceStateType;
  notes?: string | null;
}

// --- Governance Authorizations (Yetki Matrisi) ---
export interface GovernanceAuthorization {
  id: string;
  analysis_project_id: string;
  governance_object_id: string;
  subject_id: string;
  scope_id?: string | null;
  permission_level: GovernancePermissionLevel;
  permission_source: GovernancePermissionSource;
  effective_level?: GovernancePermissionLevel | null;
  has_discrepancy: number; // 0 | 1
  can_view: number; // 0 | 1
  can_create: number; // 0 | 1
  can_edit: number; // 0 | 1
  can_delete: number; // 0 | 1
  can_approve: number; // 0 | 1
  can_cancel: number; // 0 | 1
  can_export: number; // 0 | 1
  can_view_cost: number; // 0 | 1
  state_type: GovernanceStateType;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  object_code?: string;
  object_name_tr?: string;
  subject_name?: string;
  subject_type?: GovernanceSubjectType;
  scope_name?: string;
  scope_type?: GovernanceScopeType;
}

export interface CreateGovernanceAuthorizationPayload {
  analysis_project_id: string;
  governance_object_id: string;
  subject_id: string;
  scope_id?: string | null;
  permission_level: GovernancePermissionLevel;
  permission_source?: GovernancePermissionSource;
  effective_level?: GovernancePermissionLevel | null;
  has_discrepancy?: number;
  can_view?: number;
  can_create?: number;
  can_edit?: number;
  can_delete?: number;
  can_approve?: number;
  can_cancel?: number;
  can_export?: number;
  can_view_cost?: number;
  state_type?: GovernanceStateType;
  notes?: string | null;
}

export interface UpdateGovernanceAuthorizationPayload {
  governance_object_id?: string;
  subject_id?: string;
  scope_id?: string | null;
  permission_level?: GovernancePermissionLevel;
  permission_source?: GovernancePermissionSource;
  effective_level?: GovernancePermissionLevel | null;
  has_discrepancy?: number;
  can_view?: number;
  can_create?: number;
  can_edit?: number;
  can_delete?: number;
  can_approve?: number;
  can_cancel?: number;
  can_export?: number;
  can_view_cost?: number;
  state_type?: GovernanceStateType;
  notes?: string | null;
}

// --- Governance Limits (Limit ve Onay Yetkileri) ---
export interface GovernanceLimit {
  id: string;
  analysis_project_id: string;
  governance_object_id?: string | null;
  subject_id: string;
  scope_id?: string | null;
  limit_type: string;
  currency_or_unit: string;
  min_value?: number | null;
  max_value?: number | null;
  approval_tier?: string | null;
  approver_subject_id?: string | null;
  state_type: GovernanceStateType;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  object_code?: string;
  object_name_tr?: string;
  subject_name?: string;
  approver_subject_name?: string;
  scope_name?: string;
}

export interface CreateGovernanceLimitPayload {
  analysis_project_id: string;
  governance_object_id?: string | null;
  subject_id: string;
  scope_id?: string | null;
  limit_type: string;
  currency_or_unit: string;
  min_value?: number | null;
  max_value?: number | null;
  approval_tier?: string | null;
  approver_subject_id?: string | null;
  state_type?: GovernanceStateType;
  notes?: string | null;
}

export interface UpdateGovernanceLimitPayload {
  governance_object_id?: string | null;
  subject_id?: string;
  scope_id?: string | null;
  limit_type?: string;
  currency_or_unit?: string;
  min_value?: number | null;
  max_value?: number | null;
  approval_tier?: string | null;
  approver_subject_id?: string | null;
  state_type?: GovernanceStateType;
  notes?: string | null;
}

// --- Governance SoD Risks (Görevler Ayrılığı Riskleri) ---
export interface GovernanceSodRisk {
  id: string;
  analysis_project_id: string;
  governance_object_id?: string | null;
  subject_id?: string | null;
  scope_id?: string | null;
  risk_title: string;
  conflicting_duty_a: string;
  conflicting_duty_b: string;
  risk_severity: GovernanceRiskSeverity;
  current_control?: string | null;
  mitigation_action?: string | null;
  risk_owner?: string | null;
  status: GovernanceRiskStatus;
  state_type: GovernanceStateType;
  created_at: string;
  updated_at: string;
  // Joined fields
  object_code?: string;
  object_name_tr?: string;
  subject_name?: string;
  scope_name?: string;
}

export interface CreateGovernanceSodRiskPayload {
  analysis_project_id: string;
  governance_object_id?: string | null;
  subject_id?: string | null;
  scope_id?: string | null;
  risk_title: string;
  conflicting_duty_a: string;
  conflicting_duty_b: string;
  risk_severity?: GovernanceRiskSeverity;
  current_control?: string | null;
  mitigation_action?: string | null;
  risk_owner?: string | null;
  status?: GovernanceRiskStatus;
  state_type?: GovernanceStateType;
}

export interface UpdateGovernanceSodRiskPayload {
  governance_object_id?: string | null;
  subject_id?: string | null;
  scope_id?: string | null;
  risk_title?: string;
  conflicting_duty_a?: string;
  conflicting_duty_b?: string;
  risk_severity?: GovernanceRiskSeverity;
  current_control?: string | null;
  mitigation_action?: string | null;
  risk_owner?: string | null;
  status?: GovernanceRiskStatus;
  state_type?: GovernanceStateType;
}

// --- Governance Attachments (Yönetişim Kanıt Dosyaları) ---
export interface GovernanceAttachment {
  id: string;
  analysis_project_id: string;
  entity_type: GovernanceAttachmentEntityType;
  entity_id: string;
  original_file_name: string;
  stored_file_name: string;
  relative_path: string;
  mime_type: string;
  file_size: number;
  sha256: string;
  imported_at: string;
  created_at: string;
}

export interface CreateGovernanceAttachmentPayload {
  analysis_project_id: string;
  entity_type: GovernanceAttachmentEntityType;
  entity_id: string;
  original_file_name: string;
  stored_file_name: string;
  relative_path: string;
  mime_type: string;
  file_size: number;
  sha256: string;
  imported_at?: string;
}

// --- Summary & Dashboard KPI Data ---
export interface GovernanceSummary {
  totalObjects: number;
  unassignedOwnerCount: number;
  unassignedStewardCount: number;
  criticalSodRiskCount: number;
  totalSodRisks: number;
  discrepancyCount: number;
  totalSubjects: number;
  totalScopes: number;
  totalAuthorizations: number;
  totalLimits: number;
  totalAttachments: number;
}
