/**
 * ERP CRM Discovery — Report Domain Types
 *
 * Single Source of Truth for Report Generation (Preview, DOCX, PDF).
 * UI components must consume ReportModel instead of querying raw DB tables.
 */

import type {
  FindingPriority,
  FindingStatus,
  RequirementPriority,
  RequirementStatus,
  RiskImpact,
  RiskProbability,
  RiskStatus,
} from "../types";

export interface ReportMetadata {
  title: string;
  projectName: string;
  companyName: string;
  generatedAt: string;
  projectStatus: string;
  packVersions: Record<string, string>;
  isComplete: boolean;
  progressPercent: number;
  requiredAnswered: number;
  requiredTotal: number;
  reportType: "interim" | "final";
  draftLabel: string;
}

export interface ReportCompany {
  companyName: string;
  tradeName: string | null;
  taxNumber: string | null;
  city: string | null;
  country: string;
  employeeCount: string | null;
  notes: string | null;
}

export interface ReportScopeItem {
  code: string;
  nameTr: string;
  nameEn: string;
  category: string;
  departmentName: string | null;
  responsiblePerson: string | null;
  status: string;
  hasPack: boolean;
  progressPercentage: number;
  answeredCount: number;
  totalQuestionCount: number;
}

export interface ReportOptionAnswer {
  value: string;
  label: string;
  isOther?: boolean;
  note?: string;
}

export interface ReportFormattedAnswer {
  isAnswered: boolean;
  selectedOptions: ReportOptionAnswer[];
  textValue?: string;
  numberValue?: number;
  generalNote?: string;
  summaryText: string;
}

export interface ReportFinding {
  id: string;
  title: string;
  description: string;
  priority: FindingPriority;
  status: FindingStatus;
  questionId: string | null;
  sourceQuestionText?: string | null;
  createdAt: string;
}

export interface ReportRequirement {
  id: string;
  title: string;
  description: string;
  priority: RequirementPriority;
  status: RequirementStatus;
  questionId: string | null;
  sourceQuestionText?: string | null;
  createdAt: string;
}

export interface ReportRisk {
  id: string;
  title: string;
  description: string;
  impact: RiskImpact;
  probability: RiskProbability;
  mitigationNote: string | null;
  status: RiskStatus;
  questionId: string | null;
  sourceQuestionText?: string | null;
  createdAt: string;
}

export interface ReportProjectNote {
  id: string;
  note: string;
  businessFunctionCode: string | null;
  questionId: string | null;
  sourceQuestionText?: string | null;
  createdAt: string;
}

export interface ReportQuestionItem {
  id: string;
  order: number;
  process: string;
  subProcess?: string;
  questionText: string;
  description?: string;
  answerType: string;
  criticality: string;
  isCustom?: boolean;
  formattedAnswer: ReportFormattedAnswer;
  findings: ReportFinding[];
  requirements: ReportRequirement[];
  risks: ReportRisk[];
  notes: ReportProjectNote[];
}

export interface ReportProcess {
  name: string;
  order: number;
  questions: ReportQuestionItem[];
}

export interface ReportBusinessFunction {
  code: string;
  nameTr: string;
  nameEn: string;
  category: string;
  sortOrder: number;
  departmentName: string | null;
  responsiblePerson: string | null;
  status: string;
  packId: string | null;
  packVersion: string | null;
  progressPercentage: number;
  answeredCount: number;
  totalQuestionCount: number;
  processes: ReportProcess[];
  findings: ReportFinding[];
  requirements: ReportRequirement[];
  risks: ReportRisk[];
  notes: ReportProjectNote[];
}

export interface ReportProfile {
  id?: string;
  analysis_project_id: string;
  executive_summary: string | null;
  overall_assessment: string | null;
  open_topics: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ReportSummaryStats {
  totalFunctions: number;
  completedFunctions: number;
  inProgressFunctions: number;
  notStartedFunctions: number;
  totalFindings: number;
  totalRequirements: number;
  openRisks: number;
  totalRisks: number;
  totalNotes: number;
  answeredQuestions: number;
  totalQuestions: number;
}

export interface ReportModel {
  metadata: ReportMetadata;
  profile: ReportProfile;
  company: ReportCompany;
  scope: ReportScopeItem[];
  businessFunctions: ReportBusinessFunction[];
  globalFindings: ReportFinding[];
  globalRequirements: ReportRequirement[];
  globalRisks: ReportRisk[];
  projectNotes: ReportProjectNote[];
  summaryStats: ReportSummaryStats;
}
