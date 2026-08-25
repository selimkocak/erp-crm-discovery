/**
 * ERP CRM Discovery — FAZ-66: Pilot Saha Kabulü ve Go-Live Hazırlığı Tipleri
 */

export type ReadinessCategory =
  | "DATA"
  | "PROCESS"
  | "GOVERNANCE"
  | "OT"
  | "EVIDENCE"
  | "PEOPLE"
  | "REPORTING"
  | "SUPPORT";

export type ReadinessStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "READY"
  | "BLOCKED"
  | "NOT_APPLICABLE";

export interface ReadinessCheckItem {
  id: string;
  project_id: string;
  category: ReadinessCategory;
  check_code: string;
  title: string;
  description: string | null;
  status: ReadinessStatus;
  critical: number; // 0 or 1
  owner_role: string | null;
  evidence_required: number; // 0 or 1
  action_required: number; // 0 or 1
  action_note: string | null;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateReadinessCheckPayload {
  project_id: string;
  category: ReadinessCategory;
  check_code: string;
  title: string;
  description?: string | null;
  status?: ReadinessStatus;
  critical?: boolean | number;
  owner_role?: string | null;
  evidence_required?: boolean | number;
  action_required?: boolean | number;
  action_note?: string | null;
  due_date?: string | null;
  notes?: string | null;
}

export interface UpdateReadinessCheckPayload {
  category?: ReadinessCategory;
  check_code?: string;
  title?: string;
  description?: string | null;
  status?: ReadinessStatus;
  critical?: boolean | number;
  owner_role?: string | null;
  evidence_required?: boolean | number;
  action_required?: boolean | number;
  action_note?: string | null;
  due_date?: string | null;
  notes?: string | null;
}

export interface CategoryReadinessStats {
  category: ReadinessCategory;
  categoryLabel: string;
  totalCount: number;
  applicableCount: number;
  readyCount: number;
  inProgressCount: number;
  blockedCount: number;
  notStartedCount: number;
  notApplicableCount: number;
  criticalOpenCount: number;
  readinessPercentage: number;
}

export interface ReadinessSummaryStats {
  totalChecks: number;
  applicableChecks: number;
  readyCount: number;
  inProgressCount: number;
  blockedCount: number;
  notStartedCount: number;
  notApplicableCount: number;
  criticalTotalCount: number;
  criticalOpenCount: number;
  criticalBlockedCount: number;
  actionRequiredCount: number;
  readinessPercentage: number;
  isDiscoveryReady: boolean;
}

export interface ReadinessActionItem {
  id: string;
  category: ReadinessCategory;
  categoryLabel: string;
  checkCode: string;
  title: string;
  actionNote: string;
  ownerRole: string;
  dueDate: string | null;
  critical: boolean;
  status: ReadinessStatus;
}

export interface ReadinessSummaryResult {
  stats: ReadinessSummaryStats;
  categories: CategoryReadinessStats[];
  criticalGaps: ReadinessCheckItem[];
  actions: ReadinessActionItem[];
}

export const READINESS_CATEGORY_LABELS: Record<ReadinessCategory, string> = {
  DATA: "Veri ve Cevap Bütünlüğü",
  PROCESS: "Süreç Haritası ve Sadeliği",
  GOVERNANCE: "Veri Sahipliği ve Yetkiler",
  OT: "Saha İstasyon ve OT Matrisi",
  EVIDENCE: "Kanıt ve Saha Doğrulama",
  PEOPLE: "Kullanıcı ve Rol Hazırlığı",
  REPORTING: "Rapor ve Çıktı Bütünlüğü",
  SUPPORT: "Destek ve Aksiyon Planı",
};

export const READINESS_STATUS_LABELS: Record<ReadinessStatus, string> = {
  NOT_STARTED: "Başlanmadı",
  IN_PROGRESS: "Devam Ediyor",
  READY: "Hazır / Tamamlandı",
  BLOCKED: "Bloke / Engel Var",
  NOT_APPLICABLE: "Kapsam Dışı",
};
