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
  projectProgressPercent: number;
  completedFunctionCount: number;
  selectedFunctionCount: number;
  isProjectComplete: boolean;
}

/**
 * Localizes business function and project status codes into clean Turkish labels for executive reporting.
 */
export function formatStatusLabel(status: string): string {
  switch (status?.toLowerCase()) {
    case "completed":
      return "Tamamlandı";
    case "in_progress":
      return "Devam Ediyor";
    case "not_started":
    default:
      return "Başlanmadı";
  }
}

export interface ReportCompany {
  companyName: string;
  tradeName: string | null;
  taxNumber: string | null;
  city: string | null;
  country: string;
  employeeCount: string | null;
  businessSector: string | null;
  hasBranches: 'yes' | 'no' | null;
  branchCount: number | null;
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

export interface ReportFollowupItem {
  id: string;
  businessFunctionCode: string;
  businessFunctionNameTr: string;
  processName: string;
  questionId: string;
  questionText: string;
  flagType: "revisit" | "critical";
  note?: string | null;
  createdAt: string;
}

export interface ReportAttachmentItem {
  id: string;
  businessFunctionCode: string;
  businessFunctionNameTr: string;
  processName: string;
  questionId: string;
  questionText: string;
  originalFileName: string;
  storedFileName: string;
  relativePath: string;
  fileUrl?: string;
  absolutePath?: string;
  mimeType: string;
  fileExtension: string;
  fileSize: number;
  sha256: string;
  description?: string | null;
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
  followup?: {
    flagType: "revisit" | "critical";
    note?: string | null;
  } | null;
  attachments?: ReportAttachmentItem[];
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
  activeFunctionCount: number;
  completedFunctions: number;
  completedFunctionCount: number;
  inProgressFunctions: number;
  inProgressFunctionCount: number;
  notStartedFunctions: number;
  notStartedFunctionCount: number;
  totalFindings: number;
  findingCount: number;
  totalRequirements: number;
  requirementCount: number;
  openRisks: number;
  openRiskCount: number;
  totalRisks: number;
  totalRiskCount: number;
  totalNotes: number;
  answeredQuestions: number;
  answeredQuestionCount: number;
  totalQuestions: number;
  totalQuestionCount: number;
  questionProgressPercent: number;
  openFollowupCount?: number;
  revisitCount?: number;
  criticalFollowupCount?: number;
  totalAttachmentCount?: number;
  totalAttachmentSizeBytes?: number;
}

import type {
  GovernanceObject,
  GovernanceResponsibility,
  GovernanceAuthorization,
  GovernanceLimit,
  GovernanceSodRisk,
  GovernanceAttachment,
} from "../types/governance";

export interface ReportGovernanceModel {
  summary: {
    totalObjects: number;
    unassignedOwnerCount: number;
    unassignedStewardCount: number;
    criticalSodRiskCount: number;
    totalSodRisks: number;
    discrepancyCount: number;
    totalAuthorizations: number;
    totalLimits: number;
    totalAttachments: number;
  };
  objects: GovernanceObject[];
  responsibilities: GovernanceResponsibility[];
  authorizations: GovernanceAuthorization[];
  limits: GovernanceLimit[];
  sodRisks: GovernanceSodRisk[];
  attachments: GovernanceAttachment[];
}

import type { ScheduleStatus } from "../models/scheduleStatus";

export interface ReportScheduleItem {
  code: string;
  nameTr: string;
  processStatus: string;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  plannedRangeSummary: string;
  actualRangeSummary: string;
  scheduleStatus: ScheduleStatus;
  scheduleStatusLabel: string;
  scheduleStatusBadgeClass: string;
  delayDays: number;
  remainingDays: number;
  delaySummary: string;
}

export interface ReportScheduleSummary {
  projectSchedule: {
    plannedStartDate: string | null;
    plannedEndDate: string | null;
    actualStartDate: string | null;
    actualEndDate: string | null;
    plannedRangeSummary: string;
    actualRangeSummary: string;
    scheduleStatus: ScheduleStatus;
    scheduleStatusLabel: string;
    scheduleStatusBadgeClass: string;
    delayDays: number;
    remainingDays: number;
    delaySummary: string;
  };
  functionSchedules: ReportScheduleItem[];
  stats: {
    totalPlanned: number;
    completedOnTime: number;
    completedLate: number;
    onTrack: number;
    dueSoon: number;
    overdue: number;
    notStarted: number;
    notPlanned: number;
  };
}

export interface ReportOtStation {
  id: string;
  stationCode: string;
  stationName: string;
  areaName: string | null;
  lineName: string | null;
  stationType: string | null;
  machineName: string | null;
  machineManufacturer: string | null;
  machineModel: string | null;
  plcOrController: string | null;
  operatorCount: number | null;
  status: string;
}

export interface ReportOtStationsSummary {
  totalStations: number;
  activeStations: number;
  areaCount: number;
  lineCount: number;
  stations: ReportOtStation[];
}

export interface ReportOtDataRequirement {
  id: string;
  stationId: string;
  stationCode: string;
  stationName: string;
  purpose: string;
  decisionSupported: string;
  requiredAction: string;
  dataCategory: string | null;
  measurementName: string;
  sourceType: string | null;
  sourceName: string | null;
  collectionMethod: string | null;
  frequency: string | null;
  criticality: string;
  targetSystem: string | null;
  retentionRequired: boolean;
  retentionPeriod: string | null;
  businessValue: string | null;
  integrationComplexity: string;
  priority: string;
  status: string;
  notes: string | null;
}

export interface ReportOtAlarmRequirement {
  id: string;
  stationId: string;
  stationCode: string;
  stationName: string;
  alarmName: string;
  alarmCode: string | null;
  sourceType: string | null;
  triggerCondition: string | null;
  severity: string;
  safetyCritical: boolean;
  responsibleRole: string | null;
  responseSla: string | null;
  requiredAction: string | null;
  acknowledgementRequired: boolean;
  escalationRequired: boolean;
  targetSystem: string | null;
  status: string;
  notes: string | null;
}

export interface ReportOtQualityDevice {
  id: string;
  stationId: string;
  stationCode: string;
  stationName: string;
  deviceName: string;
  deviceType: string | null;
  manufacturer: string | null;
  model: string | null;
  outputFormat: string | null;
  interfaceType: string | null;
  apiAvailable: boolean;
  networkShareAvailable: boolean;
  testResultAvailable: boolean;
  passFailAvailable: boolean;
  measurementValuesAvailable: boolean;
  productCodeAvailable: boolean;
  lotBatchAvailable: boolean;
  operatorAvailable: boolean;
  integrationMethod: string | null;
  targetSystem: string | null;
  status: string;
  notes: string | null;
}

export interface ReportOtMatrixSummary {
  stats: {
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
  };
  dataRequirements: ReportOtDataRequirement[];
  alarmRequirements: ReportOtAlarmRequirement[];
  qualityDevices: ReportOtQualityDevice[];
}

export interface ReportModel {
  metadata: ReportMetadata;
  profile: ReportProfile;
  company: ReportCompany;
  scope: ReportScopeItem[];
  businessFunctions: ReportBusinessFunction[];
  followups?: ReportFollowupItem[];
  attachments?: ReportAttachmentItem[];
  governance?: ReportGovernanceModel;
  scheduleSummary?: ReportScheduleSummary;
  otStationsSummary?: ReportOtStationsSummary;
  otMatrixSummary?: ReportOtMatrixSummary;
  globalFindings: ReportFinding[];
  globalRequirements: ReportRequirement[];
  globalRisks: ReportRisk[];
  projectNotes: ReportProjectNote[];
  summaryStats: ReportSummaryStats;
}


