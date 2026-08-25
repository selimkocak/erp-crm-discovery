/**
 * ERP CRM Discovery — AppRepository Interface
 *
 * Tüm veri erişim operasyonlarını soyutlayan merkezi Repository sözleşmesi.
 * Tauri SQLite ve Browser Test Mode implementasyonları bu arayüzü uygular.
 */

import type {
  BusinessFunction,
  CompanyProfile,
  CreateProjectPayload,
  FunctionStatus,
  ProjectDetailData,
  ProjectListItem,
  ProjectStatus,
  ProjectScopeChange,
  FunctionDataCounts,
  UpdateProjectDetailsPayload,
  Finding,
  Requirement,
  Risk,
  ProjectNote,
  SemanticSummaryCounts,
  ProjectCustomQuestion,
  QuestionFollowup,
  FollowupFlagType,
  FollowupSummaryCounts,
  QuestionAttachment,
  CreateQuestionAttachmentPayload,
  AttachmentSummaryStats,
  ProjectBusinessFunction,
  ScheduleDates,
  OtStation,
  StationStatus,
  OtStationsSummaryStats,
  OtDataRequirement,
  OtAlarmRequirement,
  OtQualityDevice,
  OtMatrixSummaryCounts,
  ProcessMap,
  ProcessNode,
  ProcessEdge,
  ProcessMapsSummaryStats,
  DataGovernanceAsset,
  DataGovernanceAccess,
  DataGovernanceApproval,
  DataGovernanceSummaryStats,
  EvidenceItem,
  EvidenceLink,
  EvidenceSummaryStats,
  EvidenceTargetType,
  ReadinessCheckItem,
  CreateReadinessCheckPayload,
  UpdateReadinessCheckPayload,
  ReadinessSummaryResult,
} from "../../types";
import type { AnswerData } from "../../engine/types";
import type { ReportProfileData, CreateCustomQuestionPayload } from "../../db/client";

export interface AssignBusinessFunctionInput {
  id?: string;
  code?: string;
  business_function_id?: string;
  company_department_name?: string;
  responsible_person?: string;
  status?: string;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
}

export interface SetQuestionFollowupPayload {
  analysis_project_id: string;
  business_function_code: string;
  question_id: string;
  flag_type: FollowupFlagType;
  note?: string | null;
}

export interface AppRepository {
  // Proje ve Firma Yönetimi
  getProjects(): Promise<ProjectListItem[]>;
  updateProjectStatus(projectId: string, status: ProjectStatus): Promise<void>;
  getMasterBusinessFunctions(): Promise<BusinessFunction[]>;
  createProject(payload: CreateProjectPayload): Promise<string>;
  assignBusinessFunctionsToProject(
    projectId: string,
    functions: (string | AssignBusinessFunctionInput)[]
  ): Promise<void>;
  getProjectDetail(projectId: string): Promise<ProjectDetailData | null>;
  updateCompanyProfile(projectId: string, profile: Partial<CompanyProfile>): Promise<void>;
  updateProjectDetails(
    projectId: string,
    payload: UpdateProjectDetailsPayload
  ): Promise<void>;
  deleteProject(projectId: string): Promise<void>;

  // Takvim ve Kapsam Yönetimi
  updateProjectSchedule(projectId: string, dates: ScheduleDates): Promise<void>;
  getProjectSchedule(projectId: string): Promise<ScheduleDates | null>;
  updateProjectFunctionSchedule(
    projectId: string,
    businessFunctionCode: string,
    dates: ScheduleDates
  ): Promise<void>;
  getProjectFunctionSchedule(
    projectId: string,
    businessFunctionCode: string
  ): Promise<ScheduleDates | null>;
  addOrReactivateProjectFunction(
    projectId: string,
    businessFunctionCode: string,
    performedBy?: string
  ): Promise<void>;
  deactivateProjectFunction(
    projectId: string,
    businessFunctionCode: string,
    reason: string,
    performedBy?: string
  ): Promise<void>;
  getFunctionDataCounts(
    projectId: string,
    businessFunctionCode: string
  ): Promise<FunctionDataCounts>;
  getProjectScopeChanges(projectId: string): Promise<ProjectScopeChange[]>;
  updateProjectBusinessFunction(
    functionId: string,
    updates: Partial<ProjectBusinessFunction>
  ): Promise<void>;

  // Soru ve Cevap Motoru
  saveAnswer(
    projectId: string,
    bfCode: string,
    packId: string,
    packVersion: string,
    questionId: string,
    answerData: AnswerData
  ): Promise<void>;
  getAnswer(
    projectId: string,
    bfCode: string,
    questionId: string
  ): Promise<AnswerData | null>;
  getAllAnswers(
    projectId: string,
    bfCode: string
  ): Promise<Map<string, AnswerData>>;
  saveLastQuestionId(
    projectId: string,
    bfCode: string,
    questionId: string
  ): Promise<void>;
  getLastQuestionId(
    projectId: string,
    bfCode: string
  ): Promise<string | null>;
  updateFunctionStatusByCode(
    projectId: string,
    bfCode: string,
    status: FunctionStatus
  ): Promise<void>;

  // Semantik Katman (Bulgular, Gereksinimler, Riskler, Notlar)
  createFinding(finding: Omit<Finding, "id" | "created_at" | "updated_at">): Promise<string>;
  updateFinding(id: string, updates: Partial<Pick<Finding, "title" | "description" | "priority" | "status" | "business_function_code" | "question_id">>): Promise<void>;
  deleteFinding(id: string): Promise<void>;
  getFindings(projectId: string, bfCode?: string, questionId?: string): Promise<Finding[]>;

  createRequirement(req: Omit<Requirement, "id" | "created_at" | "updated_at">): Promise<string>;
  updateRequirement(id: string, updates: Partial<Pick<Requirement, "title" | "description" | "priority" | "status" | "business_function_code" | "question_id">>): Promise<void>;
  deleteRequirement(id: string): Promise<void>;
  getRequirements(projectId: string, bfCode?: string, questionId?: string): Promise<Requirement[]>;

  createRisk(risk: Omit<Risk, "id" | "created_at" | "updated_at">): Promise<string>;
  updateRisk(id: string, updates: Partial<Pick<Risk, "title" | "description" | "impact" | "probability" | "mitigation_note" | "status" | "business_function_code" | "question_id">>): Promise<void>;
  deleteRisk(id: string): Promise<void>;
  getRisks(projectId: string, bfCode?: string, questionId?: string): Promise<Risk[]>;

  createProjectNote(note: Omit<ProjectNote, "id" | "created_at" | "updated_at">): Promise<string>;
  updateProjectNote(id: string, updates: { note: string; business_function_code?: string | null; question_id?: string | null }): Promise<void>;
  deleteProjectNote(id: string): Promise<void>;
  getProjectNotes(projectId: string, bfCode?: string, questionId?: string): Promise<ProjectNote[]>;
  getSemanticSummaryCounts(projectId: string): Promise<SemanticSummaryCounts>;

  // Rapor Profili
  getReportProfile(projectId: string): Promise<ReportProfileData | null>;
  saveReportProfile(
    projectId: string,
    profile: {
      executive_summary?: string | null;
      overall_assessment?: string | null;
      open_topics?: string | null;
    }
  ): Promise<void>;

  // Özel Sorular (Custom Questions)
  createCustomQuestion(payload: CreateCustomQuestionPayload): Promise<string>;
  getCustomQuestions(projectId: string, bfCode?: string): Promise<ProjectCustomQuestion[]>;
  updateCustomQuestion(id: string, payload: Partial<CreateCustomQuestionPayload>): Promise<void>;
  deleteCustomQuestion(id: string): Promise<void>;
  saveCustomAnswer(projectId: string, bfCode: string, customQuestionId: string, answerData: AnswerData): Promise<void>;
  getCustomAnswers(projectId: string, bfCode: string): Promise<Map<string, AnswerData>>;

  // Takip Bayrakları (Followups)
  setQuestionFollowup(payload: SetQuestionFollowupPayload): Promise<string>;
  removeQuestionFollowup(projectId: string, bfCode: string, questionId: string): Promise<void>;
  resolveQuestionFollowup(projectId: string, bfCode: string, questionId: string): Promise<void>;
  getQuestionFollowups(projectId: string, bfCode?: string): Promise<Map<string, QuestionFollowup>>;
  getAllProjectFollowups(projectId: string): Promise<QuestionFollowup[]>;
  getFollowupSummaryCounts(projectId: string, bfCode?: string): Promise<FollowupSummaryCounts>;

  // Kanıt ve Ekler (Attachments)
  addQuestionAttachment(payload: CreateQuestionAttachmentPayload): Promise<QuestionAttachment>;
  updateQuestionAttachmentReimport(
    attachmentId: string,
    updates: {
      original_file_name: string;
      stored_file_name: string;
      relative_path: string;
      mime_type: string;
      file_extension: string;
      file_size: number;
      sha256: string;
      source_file_name?: string | null;
      source_absolute_path?: string | null;
    }
  ): Promise<void>;
  getQuestionAttachments(projectId: string, bfCode: string, questionId: string): Promise<QuestionAttachment[]>;
  getProjectAttachments(projectId: string): Promise<QuestionAttachment[]>;
  updateAttachmentDescription(attachmentId: string, description: string | null): Promise<void>;
  deleteQuestionAttachment(attachmentId: string): Promise<QuestionAttachment | null>;
  findAttachmentBySha256(projectId: string, sha256: string): Promise<QuestionAttachment | null>;
  getAttachmentSummaryStats(projectId: string): Promise<AttachmentSummaryStats>;

  // OT İstasyonları (FAZ-62B)
  getOtStations(projectId: string): Promise<OtStation[]>;
  getOtStationById(stationId: string): Promise<OtStation | null>;
  createOtStation(station: Omit<OtStation, "id" | "created_at" | "updated_at">): Promise<OtStation>;
  updateOtStation(stationId: string, updates: Partial<OtStation>): Promise<void>;
  toggleOtStationStatus(stationId: string, status: StationStatus): Promise<void>;
  deleteOtStation(stationId: string): Promise<void>;
  getOtStationAnswers(projectId: string, stationId: string): Promise<Map<string, AnswerData>>;
  getOtStationAnswer(projectId: string, stationId: string, questionId: string): Promise<AnswerData | null>;
  saveOtStationAnswer(
    projectId: string,
    stationId: string,
    questionId: string,
    answerData: AnswerData,
    bfCode?: string,
    packId?: string,
    packVersion?: string
  ): Promise<void>;
  getOtStationsSummary(projectId: string): Promise<OtStationsSummaryStats>;

  // OT Veri ve Alarm Gereksinimleri (FAZ-62C)
  createOtDataRequirement(payload: Omit<OtDataRequirement, "id" | "created_at" | "updated_at">): Promise<OtDataRequirement>;
  updateOtDataRequirement(id: string, updates: Partial<Omit<OtDataRequirement, "id" | "project_id" | "station_id" | "created_at" | "updated_at">>): Promise<void>;
  deleteOtDataRequirement(id: string): Promise<void>;
  getOtDataRequirements(projectId: string, stationId?: string): Promise<OtDataRequirement[]>;

  createOtAlarmRequirement(payload: Omit<OtAlarmRequirement, "id" | "created_at" | "updated_at">): Promise<OtAlarmRequirement>;
  updateOtAlarmRequirement(id: string, updates: Partial<Omit<OtAlarmRequirement, "id" | "project_id" | "station_id" | "created_at" | "updated_at">>): Promise<void>;
  deleteOtAlarmRequirement(id: string): Promise<void>;
  getOtAlarmRequirements(projectId: string, stationId?: string): Promise<OtAlarmRequirement[]>;

  createOtQualityDevice(payload: Omit<OtQualityDevice, "id" | "created_at" | "updated_at">): Promise<OtQualityDevice>;
  updateOtQualityDevice(id: string, updates: Partial<Omit<OtQualityDevice, "id" | "project_id" | "station_id" | "created_at" | "updated_at">>): Promise<void>;
  deleteOtQualityDevice(id: string): Promise<void>;
  getOtQualityDevices(projectId: string, stationId?: string): Promise<OtQualityDevice[]>;
  getOtMatrixSummaryCounts(projectId: string): Promise<OtMatrixSummaryCounts>;

  // BPMN Süreç Haritaları (FAZ-63)
  getProcessMaps(projectId: string): Promise<ProcessMap[]>;
  getProcessMapById(mapId: string): Promise<ProcessMap | null>;
  createProcessMap(map: Omit<ProcessMap, "id" | "created_at" | "updated_at">): Promise<ProcessMap>;
  updateProcessMap(mapId: string, updates: Partial<Omit<ProcessMap, "id" | "project_id" | "created_at" | "updated_at">>): Promise<void>;
  deleteProcessMap(mapId: string): Promise<void>;
  getProcessNodes(mapId: string): Promise<ProcessNode[]>;
  createProcessNode(node: Omit<ProcessNode, "id" | "created_at" | "updated_at">): Promise<ProcessNode>;
  updateProcessNode(nodeId: string, updates: Partial<Omit<ProcessNode, "id" | "process_map_id" | "created_at" | "updated_at">>): Promise<void>;
  deleteProcessNode(nodeId: string): Promise<void>;
  getProcessEdges(mapId: string): Promise<ProcessEdge[]>;
  createProcessEdge(edge: Omit<ProcessEdge, "id" | "created_at">): Promise<ProcessEdge>;
  deleteProcessEdge(edgeId: string): Promise<void>;
  getProcessMapsSummaryStats(projectId: string): Promise<ProcessMapsSummaryStats>;

  // Veri Yönetişimi Varlıkları (FAZ-64)
  getDataGovernanceAssets(projectId: string): Promise<DataGovernanceAsset[]>;
  getDataGovernanceAssetById(assetId: string): Promise<DataGovernanceAsset | null>;
  createDataGovernanceAsset(asset: Omit<DataGovernanceAsset, "id" | "created_at" | "updated_at">): Promise<string>;
  updateDataGovernanceAsset(assetId: string, updates: Partial<Omit<DataGovernanceAsset, "id" | "project_id" | "created_at" | "updated_at">>): Promise<void>;
  deleteDataGovernanceAsset(assetId: string): Promise<void>;
  getDataGovernanceAccessRules(projectId: string, assetId?: string): Promise<DataGovernanceAccess[]>;
  createDataGovernanceAccess(access: Omit<DataGovernanceAccess, "id" | "created_at" | "updated_at">): Promise<string>;
  updateDataGovernanceAccess(id: string, updates: Partial<DataGovernanceAccess>): Promise<void>;
  deleteDataGovernanceAccess(accessId: string): Promise<void>;
  getDataGovernanceApprovals(projectId: string, assetId?: string): Promise<DataGovernanceApproval[]>;
  createDataGovernanceApproval(approval: Omit<DataGovernanceApproval, "id" | "created_at" | "updated_at">): Promise<string>;
  updateDataGovernanceApproval(id: string, updates: Partial<DataGovernanceApproval>): Promise<void>;
  deleteDataGovernanceApproval(approvalId: string): Promise<void>;
  getDataGovernanceSummaryStats(projectId: string): Promise<DataGovernanceSummaryStats>;

  // Saha Kanıtları Doğrulama Defteri (FAZ-65)
  getEvidenceItems(projectId: string): Promise<EvidenceItem[]>;
  getEvidenceItemById(itemId: string): Promise<EvidenceItem | null>;
  createEvidenceItem(item: Omit<EvidenceItem, "id" | "created_at" | "updated_at">): Promise<EvidenceItem>;
  updateEvidenceItem(itemId: string, updates: Partial<Omit<EvidenceItem, "id" | "project_id" | "created_at" | "updated_at">>): Promise<void>;
  deleteEvidenceItem(itemId: string): Promise<void>;
  getEvidenceLinks(projectId: string, targetType?: EvidenceTargetType, targetId?: string): Promise<EvidenceLink[]>;
  createEvidenceLink(link: Omit<EvidenceLink, "id" | "created_at">): Promise<EvidenceLink>;
  deleteEvidenceLink(linkId: string): Promise<void>;
  getEvidenceSummaryStats(projectId: string): Promise<EvidenceSummaryStats>;

  // Pilot Saha Kabulü & Go-Live Hazırlığı (FAZ-66)
  getReadinessChecks(projectId: string): Promise<ReadinessCheckItem[]>;
  getReadinessCheckById(id: string): Promise<ReadinessCheckItem | null>;
  createReadinessCheck(payload: CreateReadinessCheckPayload): Promise<ReadinessCheckItem>;
  updateReadinessCheck(id: string, payload: UpdateReadinessCheckPayload): Promise<ReadinessCheckItem | null>;
  deleteReadinessCheck(id: string): Promise<boolean>;
  seedStarterReadinessChecks(projectId: string): Promise<number>;
  getReadinessSummary(projectId: string): Promise<ReadinessSummaryResult>;
}
