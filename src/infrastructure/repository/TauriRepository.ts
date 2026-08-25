/**
 * ERP CRM Discovery — TauriRepository
 *
 * Masaüstü ortamında (Tauri 2 + SQLite) çalışan resmi AppRepository implementasyonu.
 * @tauri-apps/plugin-sql ve yerel SQLite veritabanını kullanır.
 */

import type {
  AppRepository,
  AssignBusinessFunctionInput,
  SetQuestionFollowupPayload,
} from "./AppRepository";
import type {
  BusinessFunction,
  CompanyProfile,
  CreateProjectPayload,
  FunctionDataCounts,
  FunctionStatus,
  ProjectBusinessFunction,
  ProjectDetailData,
  ProjectListItem,
  ProjectScopeChange,
  ProjectStatus,
  UpdateProjectDetailsPayload,
  Finding,
  Requirement,
  Risk,
  ProjectNote,
  SemanticSummaryCounts,
  ProjectCustomQuestion,
  QuestionFollowup,
  FollowupSummaryCounts,
  QuestionAttachment,
  CreateQuestionAttachmentPayload,
  AttachmentSummaryStats,
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
import type { ReportProfileData, CreateCustomQuestionPayload } from "../../db/client";
import type { AnswerData } from "../../engine/types";
import * as dbClient from "../../db/client";

export class TauriRepository implements AppRepository {
  // Proje ve Firma Yönetimi
  async getProjects(): Promise<ProjectListItem[]> {
    return dbClient.getProjectsInternal();
  }

  async updateProjectStatus(projectId: string, status: ProjectStatus): Promise<void> {
    return dbClient.updateProjectStatusInternal(projectId, status);
  }

  async getMasterBusinessFunctions(): Promise<BusinessFunction[]> {
    return dbClient.getMasterBusinessFunctionsInternal();
  }

  async createProject(payload: CreateProjectPayload): Promise<string> {
    return dbClient.createProjectInternal(payload);
  }

  async assignBusinessFunctionsToProject(
    projectId: string,
    functions: (string | AssignBusinessFunctionInput)[]
  ): Promise<void> {
    return dbClient.assignBusinessFunctionsToProjectInternal(projectId, functions);
  }

  async getProjectDetail(projectId: string): Promise<ProjectDetailData | null> {
    return dbClient.getProjectDetailInternal(projectId);
  }

  async updateCompanyProfile(projectId: string, profile: Partial<CompanyProfile>): Promise<void> {
    return dbClient.updateCompanyProfileInternal(projectId, profile);
  }

  async updateProjectDetails(
    projectId: string,
    payload: UpdateProjectDetailsPayload
  ): Promise<void> {
    return dbClient.updateProjectDetailsInternal(projectId, payload);
  }

  async deleteProject(projectId: string): Promise<void> {
    return dbClient.deleteProjectInternal(projectId);
  }

  // Takvim ve Kapsam Yönetimi
  async updateProjectSchedule(projectId: string, dates: ScheduleDates): Promise<void> {
    return dbClient.updateProjectScheduleInternal(projectId, dates);
  }

  async getProjectSchedule(projectId: string): Promise<ScheduleDates | null> {
    return dbClient.getProjectScheduleInternal(projectId);
  }

  async updateProjectFunctionSchedule(
    projectId: string,
    businessFunctionCode: string,
    dates: ScheduleDates
  ): Promise<void> {
    return dbClient.updateProjectFunctionScheduleInternal(projectId, businessFunctionCode, dates);
  }

  async getProjectFunctionSchedule(
    projectId: string,
    businessFunctionCode: string
  ): Promise<ScheduleDates | null> {
    return dbClient.getProjectFunctionScheduleInternal(projectId, businessFunctionCode);
  }

  async addOrReactivateProjectFunction(
    projectId: string,
    businessFunctionCode: string,
    performedBy?: string
  ): Promise<void> {
    return dbClient.addOrReactivateProjectFunctionInternal(projectId, businessFunctionCode, performedBy);
  }

  async deactivateProjectFunction(
    projectId: string,
    businessFunctionCode: string,
    reason: string,
    performedBy?: string
  ): Promise<void> {
    return dbClient.deactivateProjectFunctionInternal(projectId, businessFunctionCode, reason, performedBy);
  }

  async getFunctionDataCounts(
    projectId: string,
    businessFunctionCode: string
  ): Promise<FunctionDataCounts> {
    return dbClient.getFunctionDataCountsInternal(projectId, businessFunctionCode);
  }

  async getProjectScopeChanges(projectId: string): Promise<ProjectScopeChange[]> {
    return dbClient.getProjectScopeChangesInternal(projectId);
  }

  async updateProjectBusinessFunction(
    functionId: string,
    updates: Partial<ProjectBusinessFunction>
  ): Promise<void> {
    return dbClient.updateProjectBusinessFunctionInternal(functionId, updates);
  }

  // Soru ve Cevap Motoru
  async saveAnswer(
    projectId: string,
    bfCode: string,
    packId: string,
    packVersion: string,
    questionId: string,
    answerData: AnswerData
  ): Promise<void> {
    return dbClient.saveAnswerInternal(projectId, bfCode, packId, packVersion, questionId, answerData);
  }

  async getAnswer(
    projectId: string,
    bfCode: string,
    questionId: string
  ): Promise<AnswerData | null> {
    return dbClient.getAnswerInternal(projectId, bfCode, questionId);
  }

  async getAllAnswers(
    projectId: string,
    bfCode: string
  ): Promise<Map<string, AnswerData>> {
    return dbClient.getAllAnswersInternal(projectId, bfCode);
  }

  async saveLastQuestionId(
    projectId: string,
    bfCode: string,
    questionId: string
  ): Promise<void> {
    return dbClient.saveLastQuestionIdInternal(projectId, bfCode, questionId);
  }

  async getLastQuestionId(
    projectId: string,
    bfCode: string
  ): Promise<string | null> {
    return dbClient.getLastQuestionIdInternal(projectId, bfCode);
  }

  async updateFunctionStatusByCode(
    projectId: string,
    bfCode: string,
    status: FunctionStatus
  ): Promise<void> {
    return dbClient.updateFunctionStatusByCodeInternal(projectId, bfCode, status);
  }

  // Semantik Katman
  async createFinding(finding: Omit<Finding, "id" | "created_at" | "updated_at">): Promise<string> {
    return dbClient.createFindingInternal(finding);
  }

  async updateFinding(
    id: string,
    updates: Partial<Pick<Finding, "title" | "description" | "priority" | "status" | "business_function_code" | "question_id">>
  ): Promise<void> {
    return dbClient.updateFindingInternal(id, updates);
  }

  async deleteFinding(id: string): Promise<void> {
    return dbClient.deleteFindingInternal(id);
  }

  async getFindings(projectId: string, bfCode?: string, questionId?: string): Promise<Finding[]> {
    return dbClient.getFindingsInternal(projectId, bfCode, questionId);
  }

  async createRequirement(req: Omit<Requirement, "id" | "created_at" | "updated_at">): Promise<string> {
    return dbClient.createRequirementInternal(req);
  }

  async updateRequirement(
    id: string,
    updates: Partial<Pick<Requirement, "title" | "description" | "priority" | "status" | "business_function_code" | "question_id">>
  ): Promise<void> {
    return dbClient.updateRequirementInternal(id, updates);
  }

  async deleteRequirement(id: string): Promise<void> {
    return dbClient.deleteRequirementInternal(id);
  }

  async getRequirements(projectId: string, bfCode?: string, questionId?: string): Promise<Requirement[]> {
    return dbClient.getRequirementsInternal(projectId, bfCode, questionId);
  }

  async createRisk(risk: Omit<Risk, "id" | "created_at" | "updated_at">): Promise<string> {
    return dbClient.createRiskInternal(risk);
  }

  async updateRisk(
    id: string,
    updates: Partial<Pick<Risk, "title" | "description" | "impact" | "probability" | "mitigation_note" | "status" | "business_function_code" | "question_id">>
  ): Promise<void> {
    return dbClient.updateRiskInternal(id, updates);
  }

  async deleteRisk(id: string): Promise<void> {
    return dbClient.deleteRiskInternal(id);
  }

  async getRisks(projectId: string, bfCode?: string, questionId?: string): Promise<Risk[]> {
    return dbClient.getRisksInternal(projectId, bfCode, questionId);
  }

  async createProjectNote(note: Omit<ProjectNote, "id" | "created_at" | "updated_at">): Promise<string> {
    return dbClient.createProjectNoteInternal(note);
  }

  async updateProjectNote(
    id: string,
    updates: { note: string; business_function_code?: string | null; question_id?: string | null }
  ): Promise<void> {
    return dbClient.updateProjectNoteInternal(id, updates);
  }

  async deleteProjectNote(id: string): Promise<void> {
    return dbClient.deleteProjectNoteInternal(id);
  }

  async getProjectNotes(projectId: string, bfCode?: string, questionId?: string): Promise<ProjectNote[]> {
    return dbClient.getProjectNotesInternal(projectId, bfCode, questionId);
  }

  async getSemanticSummaryCounts(projectId: string): Promise<SemanticSummaryCounts> {
    return dbClient.getSemanticSummaryCountsInternal(projectId);
  }

  // Rapor Profili
  async getReportProfile(projectId: string): Promise<ReportProfileData | null> {
    return dbClient.getReportProfileInternal(projectId);
  }

  async saveReportProfile(
    projectId: string,
    profile: {
      executive_summary?: string | null;
      overall_assessment?: string | null;
      open_topics?: string | null;
    }
  ): Promise<void> {
    return dbClient.saveReportProfileInternal(projectId, profile);
  }

  // Özel Sorular (Custom Questions)
  async createCustomQuestion(payload: CreateCustomQuestionPayload): Promise<string> {
    return dbClient.createCustomQuestionInternal(payload);
  }

  async getCustomQuestions(projectId: string, bfCode?: string): Promise<ProjectCustomQuestion[]> {
    return dbClient.getCustomQuestionsInternal(projectId, bfCode);
  }

  async updateCustomQuestion(
    id: string,
    payload: Partial<CreateCustomQuestionPayload>
  ): Promise<void> {
    return dbClient.updateCustomQuestionInternal(id, payload);
  }

  async deleteCustomQuestion(id: string): Promise<void> {
    return dbClient.deleteCustomQuestionInternal(id);
  }

  async saveCustomAnswer(projectId: string, bfCode: string, customQuestionId: string, answerData: AnswerData): Promise<void> {
    return dbClient.saveCustomAnswerInternal(projectId, bfCode, customQuestionId, answerData);
  }

  async getCustomAnswers(projectId: string, bfCode: string): Promise<Map<string, AnswerData>> {
    return dbClient.getCustomAnswersInternal(projectId, bfCode);
  }

  // Takip Bayrakları (Followups)
  async setQuestionFollowup(payload: SetQuestionFollowupPayload): Promise<string> {
    return dbClient.setQuestionFollowupInternal(payload);
  }

  async removeQuestionFollowup(projectId: string, bfCode: string, questionId: string): Promise<void> {
    return dbClient.removeQuestionFollowupInternal(projectId, bfCode, questionId);
  }

  async resolveQuestionFollowup(projectId: string, bfCode: string, questionId: string): Promise<void> {
    return dbClient.resolveQuestionFollowupInternal(projectId, bfCode, questionId);
  }

  async getQuestionFollowups(projectId: string, bfCode?: string): Promise<Map<string, QuestionFollowup>> {
    return dbClient.getQuestionFollowupsInternal(projectId, bfCode);
  }

  async getAllProjectFollowups(projectId: string): Promise<QuestionFollowup[]> {
    return dbClient.getAllProjectFollowupsInternal(projectId);
  }

  async getFollowupSummaryCounts(projectId: string, bfCode?: string): Promise<FollowupSummaryCounts> {
    return dbClient.getFollowupSummaryCountsInternal(projectId, bfCode);
  }

  // Kanıt ve Ekler (Attachments)
  async addQuestionAttachment(payload: CreateQuestionAttachmentPayload): Promise<QuestionAttachment> {
    return dbClient.addQuestionAttachmentInternal(payload);
  }

  async updateQuestionAttachmentReimport(
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
  ): Promise<void> {
    return dbClient.updateQuestionAttachmentReimportInternal(attachmentId, updates);
  }

  async getQuestionAttachments(projectId: string, bfCode: string, questionId: string): Promise<QuestionAttachment[]> {
    return dbClient.getQuestionAttachmentsInternal(projectId, bfCode, questionId);
  }

  async getProjectAttachments(projectId: string): Promise<QuestionAttachment[]> {
    return dbClient.getProjectAttachmentsInternal(projectId);
  }

  async updateAttachmentDescription(attachmentId: string, description: string | null): Promise<void> {
    return dbClient.updateAttachmentDescriptionInternal(attachmentId, description);
  }

  async deleteQuestionAttachment(attachmentId: string): Promise<QuestionAttachment | null> {
    return dbClient.deleteQuestionAttachmentInternal(attachmentId);
  }

  async findAttachmentBySha256(projectId: string, sha256: string): Promise<QuestionAttachment | null> {
    return dbClient.findAttachmentBySha256Internal(projectId, sha256);
  }

  async getAttachmentSummaryStats(projectId: string): Promise<AttachmentSummaryStats> {
    return dbClient.getAttachmentSummaryStatsInternal(projectId);
  }

  // OT İstasyonları (FAZ-62B)
  async getOtStations(projectId: string): Promise<OtStation[]> {
    return dbClient.getOtStationsInternal(projectId);
  }

  async getOtStationById(stationId: string): Promise<OtStation | null> {
    return dbClient.getOtStationByIdInternal(stationId);
  }

  async createOtStation(station: Omit<OtStation, "id" | "created_at" | "updated_at">): Promise<OtStation> {
    return dbClient.createOtStationInternal(station);
  }

  async updateOtStation(stationId: string, updates: Partial<OtStation>): Promise<void> {
    return dbClient.updateOtStationInternal(stationId, updates);
  }

  async toggleOtStationStatus(stationId: string, status: StationStatus): Promise<void> {
    return dbClient.toggleOtStationStatusInternal(stationId, status);
  }

  async deleteOtStation(stationId: string): Promise<void> {
    return dbClient.deleteOtStationInternal(stationId);
  }

  async getOtStationAnswers(projectId: string, stationId: string): Promise<Map<string, AnswerData>> {
    return dbClient.getOtStationAnswersInternal(projectId, stationId);
  }

  async getOtStationAnswer(projectId: string, stationId: string, questionId: string): Promise<AnswerData | null> {
    return dbClient.getOtStationAnswerInternal(projectId, stationId, questionId);
  }

  async saveOtStationAnswer(
    projectId: string,
    stationId: string,
    questionId: string,
    answerData: AnswerData,
    bfCode?: string,
    packId?: string,
    packVersion?: string
  ): Promise<void> {
    return dbClient.saveOtStationAnswerInternal(projectId, stationId, questionId, answerData, bfCode, packId, packVersion);
  }

  async getOtStationsSummary(projectId: string): Promise<OtStationsSummaryStats> {
    return dbClient.getOtStationsSummaryInternal(projectId);
  }

  // OT Veri ve Alarm Gereksinimleri (FAZ-62C)
  async createOtDataRequirement(payload: Omit<OtDataRequirement, "id" | "created_at" | "updated_at">): Promise<OtDataRequirement> {
    return dbClient.createOtDataRequirementInternal(payload);
  }

  async updateOtDataRequirement(id: string, updates: Partial<Omit<OtDataRequirement, "id" | "project_id" | "station_id" | "created_at" | "updated_at">>): Promise<void> {
    return dbClient.updateOtDataRequirementInternal(id, updates);
  }

  async deleteOtDataRequirement(id: string): Promise<void> {
    return dbClient.deleteOtDataRequirementInternal(id);
  }

  async getOtDataRequirements(projectId: string, stationId?: string): Promise<OtDataRequirement[]> {
    return dbClient.getOtDataRequirementsInternal(projectId, stationId);
  }

  async createOtAlarmRequirement(payload: Omit<OtAlarmRequirement, "id" | "created_at" | "updated_at">): Promise<OtAlarmRequirement> {
    return dbClient.createOtAlarmRequirementInternal(payload);
  }

  async updateOtAlarmRequirement(id: string, updates: Partial<Omit<OtAlarmRequirement, "id" | "project_id" | "station_id" | "created_at" | "updated_at">>): Promise<void> {
    return dbClient.updateOtAlarmRequirementInternal(id, updates);
  }

  async deleteOtAlarmRequirement(id: string): Promise<void> {
    return dbClient.deleteOtAlarmRequirementInternal(id);
  }

  async getOtAlarmRequirements(projectId: string, stationId?: string): Promise<OtAlarmRequirement[]> {
    return dbClient.getOtAlarmRequirementsInternal(projectId, stationId);
  }

  async createOtQualityDevice(payload: Omit<OtQualityDevice, "id" | "created_at" | "updated_at">): Promise<OtQualityDevice> {
    return dbClient.createOtQualityDeviceInternal(payload);
  }

  async updateOtQualityDevice(id: string, updates: Partial<Omit<OtQualityDevice, "id" | "project_id" | "station_id" | "created_at" | "updated_at">>): Promise<void> {
    return dbClient.updateOtQualityDeviceInternal(id, updates);
  }

  async deleteOtQualityDevice(id: string): Promise<void> {
    return dbClient.deleteOtQualityDeviceInternal(id);
  }

  async getOtQualityDevices(projectId: string, stationId?: string): Promise<OtQualityDevice[]> {
    return dbClient.getOtQualityDevicesInternal(projectId, stationId);
  }

  async getOtMatrixSummaryCounts(projectId: string): Promise<OtMatrixSummaryCounts> {
    return dbClient.getOtMatrixSummaryCountsInternal(projectId);
  }

  // BPMN Süreç Haritaları (FAZ-63)
  async getProcessMaps(projectId: string): Promise<ProcessMap[]> {
    return dbClient.getProcessMapsInternal(projectId);
  }

  async getProcessMapById(mapId: string): Promise<ProcessMap | null> {
    return dbClient.getProcessMapByIdInternal(mapId);
  }

  async createProcessMap(map: Omit<ProcessMap, "id" | "created_at" | "updated_at">): Promise<ProcessMap> {
    return dbClient.createProcessMapInternal(map);
  }

  async updateProcessMap(mapId: string, updates: Partial<Omit<ProcessMap, "id" | "project_id" | "created_at" | "updated_at">>): Promise<void> {
    return dbClient.updateProcessMapInternal(mapId, updates);
  }

  async deleteProcessMap(mapId: string): Promise<void> {
    return dbClient.deleteProcessMapInternal(mapId);
  }

  async getProcessNodes(mapId: string): Promise<ProcessNode[]> {
    return dbClient.getProcessNodesInternal(mapId);
  }

  async createProcessNode(node: Omit<ProcessNode, "id" | "created_at" | "updated_at">): Promise<ProcessNode> {
    return dbClient.createProcessNodeInternal(node);
  }

  async updateProcessNode(nodeId: string, updates: Partial<Omit<ProcessNode, "id" | "process_map_id" | "created_at" | "updated_at">>): Promise<void> {
    return dbClient.updateProcessNodeInternal(nodeId, updates);
  }

  async deleteProcessNode(nodeId: string): Promise<void> {
    return dbClient.deleteProcessNodeInternal(nodeId);
  }

  async getProcessEdges(mapId: string): Promise<ProcessEdge[]> {
    return dbClient.getProcessEdgesInternal(mapId);
  }

  async createProcessEdge(edge: Omit<ProcessEdge, "id" | "created_at">): Promise<ProcessEdge> {
    return dbClient.createProcessEdgeInternal(edge);
  }

  async deleteProcessEdge(edgeId: string): Promise<void> {
    return dbClient.deleteProcessEdgeInternal(edgeId);
  }

  async getProcessMapsSummaryStats(projectId: string): Promise<ProcessMapsSummaryStats> {
    return dbClient.getProcessMapsSummaryStats(projectId);
  }

  // Veri Yönetişimi Varlıkları (FAZ-64)
  async getDataGovernanceAssets(projectId: string): Promise<DataGovernanceAsset[]> {
    return dbClient.getDataGovernanceAssetsInternal(projectId);
  }

  async getDataGovernanceAssetById(assetId: string): Promise<DataGovernanceAsset | null> {
    return dbClient.getDataGovernanceAssetByIdInternal(assetId);
  }

  async createDataGovernanceAsset(asset: Omit<DataGovernanceAsset, "id" | "created_at" | "updated_at">): Promise<string> {
    return dbClient.createDataGovernanceAssetInternal(asset);
  }

  async updateDataGovernanceAsset(assetId: string, updates: Partial<Omit<DataGovernanceAsset, "id" | "project_id" | "created_at" | "updated_at">>): Promise<void> {
    return dbClient.updateDataGovernanceAssetInternal(assetId, updates);
  }

  async deleteDataGovernanceAsset(assetId: string): Promise<void> {
    return dbClient.deleteDataGovernanceAssetInternal(assetId);
  }

  async getDataGovernanceAccessRules(projectId: string, assetId?: string): Promise<DataGovernanceAccess[]> {
    return dbClient.getDataGovernanceAccessRulesInternal(projectId, assetId);
  }

  async createDataGovernanceAccess(access: Omit<DataGovernanceAccess, "id" | "created_at" | "updated_at">): Promise<string> {
    return dbClient.createDataGovernanceAccess(access);
  }

  async updateDataGovernanceAccess(id: string, updates: Partial<DataGovernanceAccess>): Promise<void> {
    return dbClient.updateDataGovernanceAccess(id, updates);
  }

  async deleteDataGovernanceAccess(accessId: string): Promise<void> {
    return dbClient.deleteDataGovernanceAccess(accessId);
  }

  async getDataGovernanceApprovals(projectId: string, assetId?: string): Promise<DataGovernanceApproval[]> {
    return dbClient.getDataGovernanceApprovalsInternal(projectId, assetId);
  }

  async createDataGovernanceApproval(approval: Omit<DataGovernanceApproval, "id" | "created_at" | "updated_at">): Promise<string> {
    return dbClient.createDataGovernanceApproval(approval);
  }

  async updateDataGovernanceApproval(id: string, updates: Partial<DataGovernanceApproval>): Promise<void> {
    return dbClient.updateDataGovernanceApproval(id, updates);
  }

  async deleteDataGovernanceApproval(approvalId: string): Promise<void> {
    return dbClient.deleteDataGovernanceApproval(approvalId);
  }

  async getDataGovernanceSummaryStats(projectId: string): Promise<DataGovernanceSummaryStats> {
    return dbClient.getDataGovernanceSummaryStats(projectId);
  }

  // Saha Kanıtları Doğrulama Defteri (FAZ-65)
  async getEvidenceItems(projectId: string): Promise<EvidenceItem[]> {
    return dbClient.getEvidenceItemsInternal(projectId);
  }

  async getEvidenceItemById(itemId: string): Promise<EvidenceItem | null> {
    return dbClient.getEvidenceItemByIdInternal(itemId);
  }

  async createEvidenceItem(item: Omit<EvidenceItem, "id" | "created_at" | "updated_at">): Promise<EvidenceItem> {
    return dbClient.createEvidenceItemInternal(item);
  }

  async updateEvidenceItem(itemId: string, updates: Partial<Omit<EvidenceItem, "id" | "project_id" | "created_at" | "updated_at">>): Promise<void> {
    return dbClient.updateEvidenceItemInternal(itemId, updates);
  }

  async deleteEvidenceItem(itemId: string): Promise<void> {
    return dbClient.deleteEvidenceItemInternal(itemId);
  }

  async getEvidenceLinks(projectId: string, targetType?: EvidenceTargetType, targetId?: string): Promise<EvidenceLink[]> {
    return dbClient.getEvidenceLinksInternal(projectId, targetType, targetId);
  }

  async createEvidenceLink(link: Omit<EvidenceLink, "id" | "created_at">): Promise<EvidenceLink> {
    return dbClient.createEvidenceLinkInternal(link);
  }

  async deleteEvidenceLink(linkId: string): Promise<void> {
    return dbClient.deleteEvidenceLinkInternal(linkId);
  }

  async getEvidenceSummaryStats(projectId: string): Promise<EvidenceSummaryStats> {
    return dbClient.getEvidenceSummaryStats(projectId);
  }

  // Pilot Saha Kabulü & Go-Live Hazırlığı (FAZ-66)
  async getReadinessChecks(projectId: string): Promise<ReadinessCheckItem[]> {
    return dbClient.getReadinessChecksInternal(projectId);
  }

  async getReadinessCheckById(id: string): Promise<ReadinessCheckItem | null> {
    return dbClient.getReadinessCheckById(id);
  }

  async createReadinessCheck(payload: CreateReadinessCheckPayload): Promise<ReadinessCheckItem> {
    return dbClient.createReadinessCheck(payload);
  }

  async updateReadinessCheck(id: string, payload: UpdateReadinessCheckPayload): Promise<ReadinessCheckItem | null> {
    return dbClient.updateReadinessCheck(id, payload);
  }

  async deleteReadinessCheck(id: string): Promise<boolean> {
    return dbClient.deleteReadinessCheck(id);
  }

  async seedStarterReadinessChecks(projectId: string): Promise<number> {
    return dbClient.seedStarterReadinessChecks(projectId);
  }

  async getReadinessSummary(projectId: string): Promise<ReadinessSummaryResult> {
    return dbClient.getReadinessSummary(projectId);
  }
}
