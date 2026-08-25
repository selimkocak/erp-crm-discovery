/**
 * ERP CRM Discovery — Project Backup, Restore & Portability Types
 * FAZ-51: Tek arşivli taşınabilir proje paketi (.erpcrm) tanımları
 */

export interface BackupRecordCounts {
  businessFunctions: number;
  answers: number;
  findings: number;
  requirements: number;
  risks: number;
  notes: number;
  reportProfiles: number;
  customQuestions: number;
  customQuestionAnswers: number;
  followups: number;
  governanceObjects: number;
  governanceSubjects: number;
  governanceScopes: number;
  governanceResponsibilities: number;
  governanceAuthorizations: number;
  governanceLimits: number;
  governanceSodRisks: number;
  governanceAttachments: number;
  questionAttachments: number;
  scopeChanges?: number;
  otStations?: number;
  otStationAnswers?: number;
  otDataRequirements?: number;
  otAlarmRequirements?: number;
  otQualityDevices?: number;
  processMaps?: number;
  processNodes?: number;
  processEdges?: number;
  dataGovernanceAssets?: number;
  dataGovernanceAccess?: number;
  dataGovernanceApprovals?: number;
}

export interface BackupManifest {
  formatVersion: string; // e.g. "1.0.0" | "1.1.0"
  appVersion: string; // e.g. "0.1.1" | "0.1.2"
  createdAt: string; // ISO 8601
  sourceProjectId: string;
  projectId?: string;
  projectName: string;
  companyName: string;
  schemaVersion: number; // 11 | 12 | 13 | 14 | 15 | 16 | 17
  recordCounts: BackupRecordCounts;
  attachmentCount: number;
  dataChecksum: string; // SHA-256 of project-data.json
}

export interface ProjectBackupData {
  project: Record<string, any>;
  company: Record<string, any>;
  businessFunctions: Record<string, any>[];
  answers: Record<string, any>[];
  sessionStates: Record<string, any>[];
  findings: Record<string, any>[];
  requirements: Record<string, any>[];
  risks: Record<string, any>[];
  notes: Record<string, any>[];
  reportProfiles: Record<string, any>[];
  customQuestions: Record<string, any>[];
  customQuestionOptions: Record<string, any>[];
  customQuestionAnswers: Record<string, any>[];
  followups: Record<string, any>[];
  questionAttachments: Record<string, any>[];
  governanceObjects: Record<string, any>[];
  governanceSubjects: Record<string, any>[];
  governanceScopes: Record<string, any>[];
  governanceResponsibilities: Record<string, any>[];
  governanceAuthorizations: Record<string, any>[];
  governanceLimits: Record<string, any>[];
  governanceSodRisks: Record<string, any>[];
  governanceAttachments: Record<string, any>[];
  scopeChanges?: Record<string, any>[];
  otStations?: Record<string, any>[];
  otStationAnswers?: Record<string, any>[];
  otDataRequirements?: Record<string, any>[];
  otAlarmRequirements?: Record<string, any>[];
  otQualityDevices?: Record<string, any>[];
  processMaps?: Record<string, any>[];
  processNodes?: Record<string, any>[];
  processEdges?: Record<string, any>[];
  dataGovernanceAssets?: Record<string, any>[];
  dataGovernanceAccess?: Record<string, any>[];
  dataGovernanceApprovals?: Record<string, any>[];
}

export interface BackupInspectionResult {
  valid: boolean;
  error?: string;
  manifest?: BackupManifest;
  warnings?: string[];
}

export interface RestoreResult {
  success: boolean;
  created?: boolean;
  newProjectId?: string;
  projectId?: string;
  projectName?: string;
  companyName?: string;
  attachmentCount?: number;
  recordCounts?: BackupRecordCounts;
  cleanupPerformed?: boolean;
  errorCode?: string;
  error?: string;
}

export interface DuplicateProjectOptions {
  newProjectName?: string;
  copyAnswersAndAttachments?: boolean;
}
