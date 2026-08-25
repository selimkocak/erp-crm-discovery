// path: src/types/evidence.ts
/**
 * ERP CRM Discovery — FAZ-65 Field Evidence and Validation Registry Types
 */

export type EvidenceType =
  | "SCREENSHOT"
  | "PDF"
  | "SPREADSHEET"
  | "DOCUMENT"
  | "PHOTO"
  | "DEVICE_MANUAL"
  | "PROCEDURE"
  | "SYSTEM_EXPORT"
  | "OBSERVATION"
  | "OTHER";

export type EvidenceSourceType =
  | "USER_STATEMENT"
  | "SYSTEM_RECORD"
  | "DOCUMENT"
  | "FIELD_OBSERVATION"
  | "THIRD_PARTY"
  | "UNKNOWN";

export type EvidenceVerificationStatus =
  | "UNREVIEWED"
  | "REVIEWED"
  | "ACCEPTED"
  | "REJECTED";

export type EvidenceCredibilityLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export type EvidenceSensitivityLevel =
  | "NORMAL"
  | "CONFIDENTIAL"
  | "RESTRICTED";

export type EvidenceTargetType =
  | "QUESTION"
  | "BUSINESS_FUNCTION"
  | "OT_STATION"
  | "PROCESS_MAP"
  | "PROCESS_NODE"
  | "GOVERNANCE_ASSET";

export interface EvidenceItem {
  id: string;
  project_id: string;
  title: string;
  evidence_type: EvidenceType;
  file_name?: string | null;
  stored_path?: string | null;
  mime_type?: string | null;
  file_size?: number;
  file_hash?: string | null;
  source_type: EvidenceSourceType;
  source_description?: string | null;
  collected_at: string;
  collected_by_role?: string | null;
  verification_status: EvidenceVerificationStatus;
  credibility_level: EvidenceCredibilityLevel;
  sensitivity_level: EvidenceSensitivityLevel;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  links?: EvidenceLink[];
  link_count?: number;
}

export interface EvidenceLink {
  id: string;
  project_id: string;
  evidence_id: string;
  target_type: EvidenceTargetType;
  target_id?: string | null;
  question_id?: string | null;
  business_function_code?: string | null;
  ot_station_id?: string | null;
  process_map_id?: string | null;
  process_node_id?: string | null;
  governance_asset_id?: string | null;
  link_note?: string | null;
  created_at: string;
  target_display_name?: string;
  evidence_title?: string;
  evidence_type?: EvidenceType;
  verification_status?: EvidenceVerificationStatus;
}

export interface EvidenceSummaryStats {
  totalEvidence: number;
  unreviewedCount: number;
  reviewedCount: number;
  acceptedCount: number;
  rejectedCount: number;
  unsupportedCriticalFindingsCount: number;
  evidenceCoverageRate: number;
  confidentialOrRestrictedCount: number;
  linkedEvidenceCount: number;
  unlinkedEvidenceCount: number;
}

export interface UnsupportedCriticalFinding {
  targetType: EvidenceTargetType;
  targetId: string;
  title: string;
  description: string;
  businessFunctionCode?: string;
  severity: string;
  reason: "NO_EVIDENCE" | "EVIDENCE_REJECTED" | "EVIDENCE_UNREVIEWED";
}
