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

export * from './governance';
export * from './backup';
