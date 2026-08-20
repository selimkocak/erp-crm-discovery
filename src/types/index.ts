export type ProjectStatus = 'draft' | 'active' | 'completed';
export type FunctionStatus = 'not_started' | 'in_progress' | 'completed';

export interface AnalysisProject {
  id: string;
  name: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfile {
  id: string;
  analysis_project_id: string;
  company_name: string;
  trade_name?: string;
  tax_number?: string;
  city?: string;
  country: string;
  employee_count?: string;
  notes?: string;
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
  created_at: string;
  updated_at: string;
}

export interface ProjectListItem {
  id: string;
  name: string;
  status: ProjectStatus;
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
}

export interface ProjectDetailData {
  project: AnalysisProject;
  company: CompanyProfile;
  functions: EnrichedProjectFunction[];
}

export interface CreateProjectPayload {
  projectName: string;
  company: {
    company_name: string;
    trade_name?: string;
    tax_number?: string;
    city?: string;
    country: string;
    employee_count?: string;
    notes?: string;
  };
  selectedFunctionIds: string[];
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
  sort_order?: number;
}

export interface AttachmentSummaryStats {
  totalAttachmentCount: number;
  totalAttachmentSizeBytes: number;
}

