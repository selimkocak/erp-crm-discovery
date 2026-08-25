export type ProjectStatus = 'active' | 'passive' | 'draft' | 'completed';
export type FunctionStatus = 'not_started' | 'in_progress' | 'completed';

export type {
  ScheduleStatus,
  ScheduleDates,
  ScheduleStatusResult,
} from "../models/scheduleStatus";

export interface AnalysisProject {
  id: string;
  name: string;
  status: ProjectStatus;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfile {
  id: string;
  analysis_project_id: string;
  company_name: string;
  trade_name?: string | null;
  tax_number?: string | null;
  city?: string | null;
  country: string;
  employee_count?: string | null;
  business_sector?: string | null;
  has_branches?: 'yes' | 'no' | null;
  branch_count?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessFunction {
  id: string;
  code: string;
  name_tr: string;
  name_en: string;
  category: string;
  sort_order: number;
  is_active: number;
}

export interface ProjectBusinessFunction {
  id: string;
  analysis_project_id: string;
  business_function_id: string;
  company_department_name?: string;
  responsible_person?: string;
  status: FunctionStatus;
  is_active?: number;
  removed_at?: string | null;
  removal_reason?: string | null;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectListItem {
  id: string;
  name: string;
  status: ProjectStatus;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  created_at: string;
  updated_at: string;
  company_name: string;
  city?: string;
  selected_function_count: number;
}

export interface EnrichedProjectFunction extends ProjectBusinessFunction {
  code: string;
  name_tr: string;
  name_en: string;
  category: string;
  sort_order: number;
  is_active?: number;
  removed_at?: string | null;
  removal_reason?: string | null;
}

export interface ProjectDetailData {
  project: AnalysisProject;
  company: CompanyProfile;
  functions: EnrichedProjectFunction[];
}

export type ScopeChangeAction = 'added' | 'removed' | 'reactivated';

export interface ProjectScopeChange {
  id: string;
  analysis_project_id: string;
  business_function_code: string;
  action: ScopeChangeAction;
  reason?: string | null;
  performed_by?: string | null;
  created_at: string;
}

export interface FunctionDataCounts {
  businessFunctionCode: string;
  answers: number;
  findings: number;
  requirements: number;
  risks: number;
  notes: number;
  customQuestions: number;
  customAnswers: number;
  followups: number;
  attachments: number;
  governanceObjects: number;
  total: number;
}

export interface CreateProjectPayload {
  projectName: string;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  company: {
    company_name: string;
    trade_name?: string;
    tax_number?: string;
    city?: string;
    country: string;
    employee_count?: string;
    business_sector?: string;
    has_branches?: 'yes' | 'no' | null;
    branch_count?: number | null;
    notes?: string;
  };
  selectedFunctionIds: string[];
}

export interface UpdateCompanyProfilePayload {
  company_name?: string;
  trade_name?: string | null;
  tax_number?: string | null;
  city?: string | null;
  country?: string;
  employee_count?: string | null;
  business_sector?: string | null;
  has_branches?: 'yes' | 'no' | null;
  branch_count?: number | null;
  notes?: string | null;
}

export interface UpdateProjectDetailsPayload {
  projectName?: string;
  status?: ProjectStatus;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  company: UpdateCompanyProfilePayload;
}

// ─────────────────────────────────────────────────────────────
// FAZ-3: Semantic Analysis Types (Findings, Requirements, Risks, Notes)
// ─────────────────────────────────────────────────────────────

export type FindingPriority = 'low' | 'medium' | 'high' | 'critical';
export type FindingStatus = 'open' | 'confirmed' | 'resolved';

export interface Finding {
  id: string;
  analysis_project_id: string;
  business_function_code: string;
  question_id: string | null;
  title: string;
  description: string;
  priority: FindingPriority;
  status: FindingStatus;
  created_at: string;
  updated_at: string;
}

export type RequirementPriority = 'low' | 'medium' | 'high' | 'critical';
export type RequirementStatus = 'draft' | 'confirmed' | 'out_of_scope' | 'implemented';

export interface Requirement {
  id: string;
  analysis_project_id: string;
  business_function_code: string;
  question_id: string | null;
  title: string;
  description: string;
  priority: RequirementPriority;
  status: RequirementStatus;
  created_at: string;
  updated_at: string;
}

export type RiskImpact = 'low' | 'medium' | 'high' | 'critical';
export type RiskProbability = 'low' | 'medium' | 'high';
export type RiskStatus = 'open' | 'mitigated' | 'accepted' | 'closed';

export interface Risk {
  id: string;
  analysis_project_id: string;
  business_function_code: string;
  question_id: string | null;
  title: string;
  description: string;
  impact: RiskImpact;
  probability: RiskProbability;
  mitigation_note: string | null;
  status: RiskStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectNote {
  id: string;
  analysis_project_id: string;
  business_function_code: string | null;
  question_id: string | null;
  note: string;
  created_at: string;
  updated_at: string;
}

export type SemanticRecordType = 'finding' | 'requirement' | 'risk' | 'note';

export interface SemanticSummaryCounts {
  findingCount: number;
  requirementCount: number;
  openRiskCount: number;
  totalRiskCount: number;
  noteCount: number;
}

// ─────────────────────────────────────────────────────────────
// FAZ-8: Project Custom Questions & Options Types
// ─────────────────────────────────────────────────────────────

export type CustomQuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'yes_no'
  | 'text'
  | 'textarea'
  | 'number';

export interface ProjectCustomQuestionOption {
  id: string;
  custom_question_id: string;
  value: string;
  label: string;
  sort_order: number;
  is_other: number; // 0 or 1
  created_at: string;
}

export interface ProjectCustomQuestion {
  id: string;
  analysis_project_id: string;
  business_function_code: string;
  process_name: string;
  question_text: string;
  description: string | null;
  question_type: CustomQuestionType;
  is_required: number; // 0 or 1
  sort_order: number;
  is_active: number; // 0 or 1
  created_at: string;
  updated_at: string;
  options?: ProjectCustomQuestionOption[];
}

export interface ProjectCustomQuestionAnswer {
  id: string;
  analysis_project_id: string;
  business_function_code: string;
  custom_question_id: string;
  answer_data: string; // JSON string
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────
// FAZ-9: Question Follow-up Flags & Open Questions
// ─────────────────────────────────────────────────────────────

export type FollowupFlagType = 'revisit' | 'critical';
export type FollowupStatus = 'open' | 'resolved';

export interface QuestionFollowup {
  id: string;
  analysis_project_id: string;
  business_function_code: string;
  question_id: string;
  flag_type: FollowupFlagType;
  note: string | null;
  status: FollowupStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface FollowupSummaryCounts {
  revisitCount: number;
  criticalCount: number;
  totalFollowupCount: number;
}

// ─────────────────────────────────────────────────────────────
// FAZ-33: Question Evidence & Attachments Types
// ─────────────────────────────────────────────────────────────

export type AllowedAttachmentMimeType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/webp'
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'text/plain'
  | 'text/csv';

export type AllowedAttachmentExtension =
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'webp'
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'csv'
  | 'txt';

export interface QuestionAttachment {
  id: string;
  analysis_project_id: string;
  business_function_code: string;
  question_id: string;
  answer_id?: string | null;
  original_file_name: string;
  stored_file_name: string;
  relative_path: string;
  mime_type: string;
  file_extension: string;
  file_size: number;
  sha256: string;
  description?: string | null;
  source_file_name?: string | null;
  source_absolute_path?: string | null;
  imported_at?: string | null;
  status?: "valid" | "missing" | "legacy_invalid";
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestionAttachmentPayload {
  analysis_project_id: string;
  business_function_code: string;
  question_id: string;
  answer_id?: string | null;
  original_file_name: string;
  stored_file_name: string;
  relative_path: string;
  mime_type: string;
  file_extension: string;
  file_size: number;
  sha256: string;
  description?: string | null;
  source_file_name?: string | null;
  source_absolute_path?: string | null;
  imported_at?: string | null;
  sort_order?: number;
}

export interface AttachmentSummaryStats {
  totalAttachmentCount: number;
  totalAttachmentSizeBytes: number;
}

export type StationStatus = 'active' | 'passive';

export interface OtStation {
  id: string;
  project_id: string;
  area_name?: string | null;
  line_name?: string | null;
  station_code: string;
  station_name: string;
  station_type?: string | null;
  machine_name?: string | null;
  machine_manufacturer?: string | null;
  machine_model?: string | null;
  plc_or_controller?: string | null;
  operator_count?: number | null;
  status: StationStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface OtStationAnswer {
  id: string;
  project_id: string;
  station_id: string;
  business_function_code: string;
  question_pack_id: string;
  question_pack_version: string;
  question_id: string;
  answer_data: string;
  created_at: string;
  updated_at: string;
}

export interface OtStationsSummaryStats {
  totalStations: number;
  activeStations: number;
  passiveStations: number;
  areaCount: number;
  lineCount: number;
}

export type OtMatrixItemStatus = 'active' | 'passive';
export type OtCriticality = 'low' | 'medium' | 'high' | 'critical';
export type OtAlarmSeverity = 'info' | 'warning' | 'critical';
export type OtIntegrationComplexity = 'low' | 'medium' | 'high';
export type OtPriority = 'low' | 'medium' | 'high';

export interface OtDataRequirement {
  id: string;
  project_id: string;
  station_id: string;
  purpose: string;
  decision_supported: string;
  required_action: string;
  data_category?: string | null;
  measurement_name: string;
  source_type?: string | null;
  source_name?: string | null;
  collection_method?: string | null;
  frequency?: string | null;
  criticality: OtCriticality | string;
  target_system?: string | null;
  retention_required: number;
  retention_period?: string | null;
  business_value?: string | null;
  integration_complexity: OtIntegrationComplexity | string;
  priority: OtPriority | string;
  status: OtMatrixItemStatus | string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OtAlarmRequirement {
  id: string;
  project_id: string;
  station_id: string;
  alarm_name: string;
  alarm_code?: string | null;
  source_type?: string | null;
  trigger_condition?: string | null;
  severity: OtAlarmSeverity | string;
  safety_critical: number;
  responsible_role?: string | null;
  response_sla?: string | null;
  required_action?: string | null;
  acknowledgement_required: number;
  escalation_required: number;
  target_system?: string | null;
  status: OtMatrixItemStatus | string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OtQualityDevice {
  id: string;
  project_id: string;
  station_id: string;
  device_name: string;
  device_type?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  output_format?: string | null;
  interface_type?: string | null;
  api_available: number;
  network_share_available: number;
  test_result_available: number;
  pass_fail_available: number;
  measurement_values_available: number;
  product_code_available: number;
  lot_batch_available: number;
  operator_available: number;
  integration_method?: string | null;
  target_system?: string | null;
  status: OtMatrixItemStatus | string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OtMatrixSummaryCounts {
  totalDataRequirements: number;
  criticalDataRequirements: number;
  eventBasedCount: number;
  cycleBasedCount: number;
  timeBasedCount: number;
  totalAlarms: number;
  safetyCriticalAlarms: number;
  unassignedRoleAlarms: number;
  missingActionAlarms: number;
  totalQualityDevices: number;
  automatedTransferDevices: number;
  pdfOnlyDevices: number;
  highComplexityItems: number;
}

export type ProcessNodeType =
  | 'START'
  | 'ACTIVITY'
  | 'DECISION'
  | 'APPROVAL'
  | 'SYSTEM'
  | 'QUALITY_CHECK'
  | 'END';

export type AdoptionRiskLevel = 'low' | 'medium' | 'high';
export type ProcessMapStatus = 'active' | 'passive';

export interface ProcessMap {
  id: string;
  project_id: string;
  name: string;
  process_area?: string | null;
  owner_role?: string | null;
  status: ProcessMapStatus;
  description?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProcessNode {
  id: string;
  process_map_id: string;
  node_type: ProcessNodeType;
  name: string;
  description?: string | null;
  responsible_department?: string | null;
  responsible_role?: string | null;
  business_function_code?: string | null;
  ot_station_id?: string | null;
  step_order: number;
  input_description?: string | null;
  output_description?: string | null;
  approval_count: number;
  handoff_count: number;
  duplicate_data_entry: number;
  bypass_possible: number;
  manual_work: number;
  value_added: number;
  adoption_risk: AdoptionRiskLevel;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProcessEdge {
  id: string;
  process_map_id: string;
  source_node_id: string;
  target_node_id: string;
  label?: string | null;
  condition_text?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProcessMapsSummaryStats {
  totalMaps: number;
  totalNodes: number;
  totalEdges: number;
  totalApprovals: number;
  totalHandoffs: number;
  duplicateDataEntryCount: number;
  bypassPossibleCount: number;
  highAdoptionRiskCount: number;
  mediumAdoptionRiskCount: number;
  lowAdoptionRiskCount: number;
  valueAddedStepCount: number;
  simplificationOpportunityCount: number;
}

export function calculateAdoptionRisk(node: {
  bypass_possible?: number | boolean;
  approval_count?: number;
  handoff_count?: number;
  duplicate_data_entry?: number | boolean;
  manual_work?: number | boolean;
  value_added?: number | boolean;
}): AdoptionRiskLevel {
  const bypass = Boolean(node.bypass_possible);
  const approvals = Number(node.approval_count) || 0;
  const handoffs = Number(node.handoff_count) || 0;
  const dupData = Boolean(node.duplicate_data_entry);
  const manual = Boolean(node.manual_work);
  const valueAdded = node.value_added === undefined ? true : Boolean(node.value_added);

  if (bypass || approvals >= 3 || (handoffs >= 3 && dupData) || (manual && !valueAdded)) {
    return 'high';
  }
  if (approvals >= 2 || handoffs >= 2 || dupData || manual || !valueAdded) {
    return 'medium';
  }
  return 'low';
}

// ── FAZ-64: Data Governance & Ownership Matrix ──
export type DataGovernanceCriticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DataGovernanceAccessLevel = 'FULL' | 'READ_ONLY' | 'NO_ACCESS' | 'CREATE' | 'UPDATE' | 'APPROVE';
export type DataGovernanceScopeType = 'COMPANY' | 'BRANCH' | 'DEPARTMENT' | 'TEAM' | 'PROJECT' | 'PROCESS';
export type DataGovernanceActorType = 'ROLE' | 'GROUP' | 'DEPARTMENT' | 'EXTERNAL_PARTY';

export interface DataGovernanceAsset {
  id: string;
  project_id: string;
  domain?: string | null;
  asset_name: string;
  asset_type: string;
  description?: string | null;
  system_of_record?: string | null;
  criticality: DataGovernanceCriticality;
  master_data: number;
  process_data: number;
  personal_data: number;
  financial_data: number;
  quality_or_safety_data: number;
  owner_role?: string | null;
  steward_role?: string | null;
  technical_custodian_role?: string | null;
  status: 'active' | 'passive';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DataGovernanceAccess {
  id: string;
  project_id: string;
  asset_id: string;
  actor_type: DataGovernanceActorType;
  actor_name: string;
  access_level: DataGovernanceAccessLevel;
  scope_type: DataGovernanceScopeType;
  scope_value?: string | null;
  approval_required: number;
  approval_role?: string | null;
  task_separation_required: number;
  conflict_note?: string | null;
  limit_description?: string | null;
  status: 'active' | 'passive';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DataGovernanceApproval {
  id: string;
  project_id: string;
  asset_id?: string | null;
  process_map_id?: string | null;
  approval_name: string;
  approval_role: string;
  threshold_description?: string | null;
  approval_order: number;
  mandatory: number;
  separation_of_duties: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DataGovernanceSummaryStats {
  totalAssets: number;
  unassignedOwnerCount: number;
  unassignedStewardCount: number;
  unassignedCustodianCount: number;
  criticalAssetCount: number;
  masterDataCount: number;
  personalDataCount: number;
  financialDataCount: number;
  qualitySafetyCount: number;
  totalAccessRules: number;
  totalApprovals: number;
  sodConflictCount: number;
  missingApprovalRulesCount: number;
}

/**
 * Checks whether an asset has a Separation of Duties (SoD) risk:
 * When owner, steward, or technical custodian are assigned to the same role.
 */
export function checkAssetSodRisk(asset: {
  owner_role?: string | null;
  steward_role?: string | null;
  technical_custodian_role?: string | null;
}): { hasRisk: boolean; message?: string } {
  const o = asset.owner_role?.trim().toLowerCase();
  const s = asset.steward_role?.trim().toLowerCase();
  const c = asset.technical_custodian_role?.trim().toLowerCase();

  if (!o && !s && !c) return { hasRisk: false };

  const conflicts: string[] = [];
  if (o && s && o === s) {
    conflicts.push("Veri Sahibi ve Veri Sorumlusu aynı rolde");
  }
  if (o && c && o === c) {
    conflicts.push("Veri Sahibi ve Teknik Emanetçi aynı rolde");
  }
  if (s && c && s === c) {
    conflicts.push("Veri Sorumlusu ve Teknik Emanetçi aynı rolde");
  }

  if (conflicts.length > 0) {
    return {
      hasRisk: true,
      message: `${conflicts.join(", ")}. Görevler ayrılığı (SoD) değerlendirilmelidir.`,
    };
  }
  return { hasRisk: false };
}

export * from './governance';
export * from './evidence';
export * from './readiness';
export * from './backup';

