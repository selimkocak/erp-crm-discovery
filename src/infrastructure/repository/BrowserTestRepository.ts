/**
 * ERP CRM Discovery — BrowserTestRepository
 *
 * Tarayıcı test ortamında (Tauri olmadan) çalışan in-memory ve localStorage tabanlı Repository implementasyonu.
 * Deterministik fixture ile başlar, kullanıcı değişikliklerini localStorage'da saklar.
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
  EnrichedProjectFunction,
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
  ReadinessActionItem,
  CreateReadinessCheckPayload,
  UpdateReadinessCheckPayload,
  ReadinessSummaryResult,
  ReadinessSummaryStats,
  CategoryReadinessStats,
  ReadinessCategory,
} from "../../types";
import type { ReportProfileData, CreateCustomQuestionPayload } from "../../db/client";
import { READINESS_CATEGORY_LABELS } from "../../types";
import type { AnswerData } from "../../engine/types";
import {
  createInitialBrowserFixture,
  getMasterFunctionsFixture,
  type BrowserStorageState,
} from "../../test-fixtures/browser-demo-project";

const STORAGE_KEY = "erp_discovery_browser_test_db";

function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export class BrowserTestRepository implements AppRepository {
  private state: BrowserStorageState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): BrowserStorageState {
    if (typeof window === "undefined" || !window.localStorage) {
      return createInitialBrowserFixture();
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as BrowserStorageState;
      }
    } catch (e) {
      console.warn("[BrowserTestRepository] localStorage okunamadı, varsayılan fixture yüklendi:", e);
    }
    const initial = createInitialBrowserFixture();
    this.saveStateToStorage(initial);
    return initial;
  }

  private persist(): void {
    this.saveStateToStorage(this.state);
  }

  private saveStateToStorage(state: BrowserStorageState): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn("[BrowserTestRepository] localStorage kaydedilemedi:", e);
      }
    }
  }

  public resetToDefaultFixture(): void {
    this.state = createInitialBrowserFixture();
    this.persist();
  }

  // ---------------------------------------------------------------
  // Proje ve Firma Yönetimi
  // ---------------------------------------------------------------

  async getProjects(): Promise<ProjectListItem[]> {
    const list: ProjectListItem[] = [];
    for (const proj of this.state.projects) {
      const company = this.state.companies.find((c) => c.analysis_project_id === proj.id);
      const activeFunctions = this.state.projectFunctions.filter(
        (pf) => pf.analysis_project_id === proj.id && (pf.is_active === 1 || pf.is_active === undefined)
      );
      list.push({
        id: proj.id,
        name: proj.name,
        status: proj.status,
        planned_start_date: proj.planned_start_date ?? null,
        planned_end_date: proj.planned_end_date ?? null,
        actual_start_date: proj.actual_start_date ?? null,
        actual_end_date: proj.actual_end_date ?? null,
        created_at: proj.created_at,
        updated_at: proj.updated_at,
        company_name: company?.company_name || "İsimsiz Firma",
        city: company?.city || undefined,
        selected_function_count: activeFunctions.length,
      });
    }
    return list;
  }

  async updateProjectStatus(projectId: string, status: ProjectStatus): Promise<void> {
    const proj = this.state.projects.find((p) => p.id === projectId);
    if (proj) {
      proj.status = status;
      proj.updated_at = new Date().toISOString();
      this.persist();
    }
  }

  async getMasterBusinessFunctions(): Promise<BusinessFunction[]> {
    return getMasterFunctionsFixture();
  }

  async createProject(payload: CreateProjectPayload): Promise<string> {
    const projectId = generateId("proj");
    const companyId = generateId("comp");
    const now = new Date().toISOString();

    this.state.projects.push({
      id: projectId,
      name: payload.projectName,
      status: "active",
      planned_start_date: payload.planned_start_date || null,
      planned_end_date: payload.planned_end_date || null,
      actual_start_date: payload.actual_start_date || null,
      actual_end_date: payload.actual_end_date || null,
      created_at: now,
      updated_at: now,
    });

    this.state.companies.push({
      id: companyId,
      analysis_project_id: projectId,
      company_name: payload.company.company_name,
      trade_name: payload.company.trade_name || null,
      tax_number: payload.company.tax_number || null,
      city: payload.company.city || null,
      country: payload.company.country || "Türkiye",
      employee_count: payload.company.employee_count || null,
      business_sector: payload.company.business_sector || null,
      has_branches: payload.company.has_branches || null,
      branch_count: payload.company.branch_count || null,
      notes: payload.company.notes || null,
      created_at: now,
      updated_at: now,
    });

    if (payload.selectedFunctionIds && payload.selectedFunctionIds.length > 0) {
      await this.assignBusinessFunctionsToProject(projectId, payload.selectedFunctionIds);
    }

    this.persist();
    return projectId;
  }

  async assignBusinessFunctionsToProject(
    projectId: string,
    functions: (string | AssignBusinessFunctionInput)[]
  ): Promise<void> {
    const now = new Date().toISOString();
    const masterFunctions = getMasterFunctionsFixture();

    for (const f of functions) {
      let masterId = "";
      let deptName: string | undefined;
      let respPerson: string | undefined;
      let status: FunctionStatus = "not_started";
      let pStart: string | null = null;
      let pEnd: string | null = null;
      let aStart: string | null = null;
      let aEnd: string | null = null;

      if (typeof f === "string") {
        masterId = f;
      } else {
        if (f.business_function_id) {
          masterId = f.business_function_id;
        } else if (f.code) {
          const master = masterFunctions.find((m) => m.code === f.code);
          if (master) masterId = master.id;
        } else if (f.id) {
          masterId = f.id;
        }
        deptName = f.company_department_name;
        respPerson = f.responsible_person;
        status = (f.status as FunctionStatus) || "not_started";
        pStart = f.planned_start_date || null;
        pEnd = f.planned_end_date || null;
        aStart = f.actual_start_date || null;
        aEnd = f.actual_end_date || null;
      }

      if (!masterId) continue;

      this.state.projectFunctions.push({
        id: generateId("pbf"),
        analysis_project_id: projectId,
        business_function_id: masterId,
        company_department_name: deptName,
        responsible_person: respPerson,
        status,
        is_active: 1,
        planned_start_date: pStart,
        planned_end_date: pEnd,
        actual_start_date: aStart,
        actual_end_date: aEnd,
        created_at: now,
        updated_at: now,
      });
    }
    this.persist();
  }

  async getProjectDetail(projectId: string): Promise<ProjectDetailData | null> {
    const project = this.state.projects.find((p) => p.id === projectId);
    if (!project) return null;

    const company = this.state.companies.find((c) => c.analysis_project_id === projectId) || {
      id: "comp-default",
      analysis_project_id: projectId,
      company_name: "İsimsiz Firma",
      country: "Türkiye",
      created_at: project.created_at,
      updated_at: project.updated_at,
    };

    const masterFunctions = getMasterFunctionsFixture();
    const pbfs = this.state.projectFunctions.filter((pf) => pf.analysis_project_id === projectId);

    const functions: EnrichedProjectFunction[] = pbfs.map((pf) => {
      const master = masterFunctions.find((m) => m.id === pf.business_function_id) || {
        code: "UNKNOWN",
        name_tr: "Bilinmeyen Fonksiyon",
        name_en: "Unknown Function",
        category: "Diğer",
        sort_order: 99,
      };
      return {
        ...pf,
        code: master.code,
        name_tr: master.name_tr,
        name_en: master.name_en,
        category: master.category,
        sort_order: master.sort_order,
      };
    });

    functions.sort((a, b) => a.sort_order - b.sort_order);

    return {
      project,
      company,
      functions,
    };
  }

  async updateCompanyProfile(projectId: string, profile: Partial<CompanyProfile>): Promise<void> {
    const comp = this.state.companies.find((c) => c.analysis_project_id === projectId);
    if (comp) {
      Object.assign(comp, profile, { updated_at: new Date().toISOString() });
      this.persist();
    }
  }

  async updateProjectDetails(
    projectId: string,
    payload: UpdateProjectDetailsPayload
  ): Promise<void> {
    const proj = this.state.projects.find((p) => p.id === projectId);
    if (proj) {
      if (payload.projectName) proj.name = payload.projectName;
      if (payload.status) proj.status = payload.status;
      if (payload.planned_start_date !== undefined) proj.planned_start_date = payload.planned_start_date;
      if (payload.planned_end_date !== undefined) proj.planned_end_date = payload.planned_end_date;
      if (payload.actual_start_date !== undefined) proj.actual_start_date = payload.actual_start_date;
      if (payload.actual_end_date !== undefined) proj.actual_end_date = payload.actual_end_date;
      proj.updated_at = new Date().toISOString();
    }
    const comp = this.state.companies.find((c) => c.analysis_project_id === projectId);
    if (comp && payload.company) {
      if (payload.company.company_name) comp.company_name = payload.company.company_name;
      if (payload.company.trade_name !== undefined) comp.trade_name = payload.company.trade_name;
      if (payload.company.tax_number !== undefined) comp.tax_number = payload.company.tax_number;
      if (payload.company.city !== undefined) comp.city = payload.company.city;
      if (payload.company.country !== undefined) comp.country = payload.company.country;
      if (payload.company.business_sector !== undefined) comp.business_sector = payload.company.business_sector;
      if (payload.company.has_branches !== undefined) comp.has_branches = payload.company.has_branches;
      if (payload.company.branch_count !== undefined) comp.branch_count = payload.company.branch_count;
      if (payload.company.employee_count !== undefined) comp.employee_count = payload.company.employee_count;
      if (payload.company.notes !== undefined) comp.notes = payload.company.notes;
      comp.updated_at = new Date().toISOString();
    }
    this.persist();
  }

  async deleteProject(projectId: string): Promise<void> {
    this.state.projects = this.state.projects.filter((p) => p.id !== projectId);
    this.state.companies = this.state.companies.filter((c) => c.analysis_project_id !== projectId);
    this.state.projectFunctions = this.state.projectFunctions.filter((pf) => pf.analysis_project_id !== projectId);
    this.state.answers = this.state.answers.filter((a) => a.analysis_project_id !== projectId);
    this.state.findings = this.state.findings.filter((f) => f.analysis_project_id !== projectId);
    this.state.requirements = this.state.requirements.filter((r) => r.analysis_project_id !== projectId);
    this.state.risks = this.state.risks.filter((r) => r.analysis_project_id !== projectId);
    this.state.notes = this.state.notes.filter((n) => n.analysis_project_id !== projectId);
    this.state.customQuestions = this.state.customQuestions.filter((q) => q.analysis_project_id !== projectId);
    this.state.followups = this.state.followups.filter((f) => f.analysis_project_id !== projectId);
    this.state.attachments = this.state.attachments.filter((a) => a.analysis_project_id !== projectId);
    this.state.otStations = this.state.otStations.filter((s) => s.project_id !== projectId);
    this.state.processMaps = this.state.processMaps.filter((m) => m.project_id !== projectId);
    this.state.dataGovernanceAssets = this.state.dataGovernanceAssets.filter((a) => a.project_id !== projectId);
    this.state.evidenceItems = this.state.evidenceItems.filter((e) => e.project_id !== projectId);
    this.state.readinessChecks = this.state.readinessChecks.filter((r) => r.project_id !== projectId);
    this.persist();
  }

  // ---------------------------------------------------------------
  // Takvim ve Kapsam Yönetimi
  // ---------------------------------------------------------------

  async updateProjectSchedule(projectId: string, dates: ScheduleDates): Promise<void> {
    const proj = this.state.projects.find((p) => p.id === projectId);
    if (proj) {
      if (dates.plannedStartDate !== undefined) proj.planned_start_date = dates.plannedStartDate;
      if (dates.plannedEndDate !== undefined) proj.planned_end_date = dates.plannedEndDate;
      if (dates.actualStartDate !== undefined) proj.actual_start_date = dates.actualStartDate;
      if (dates.actualEndDate !== undefined) proj.actual_end_date = dates.actualEndDate;
      proj.updated_at = new Date().toISOString();
      this.persist();
    }
  }

  async getProjectSchedule(projectId: string): Promise<ScheduleDates | null> {
    const proj = this.state.projects.find((p) => p.id === projectId);
    if (!proj) return null;
    return {
      plannedStartDate: proj.planned_start_date ?? null,
      plannedEndDate: proj.planned_end_date ?? null,
      actualStartDate: proj.actual_start_date ?? null,
      actualEndDate: proj.actual_end_date ?? null,
    };
  }

  async updateProjectFunctionSchedule(
    projectId: string,
    businessFunctionCode: string,
    dates: ScheduleDates
  ): Promise<void> {
    const master = getMasterFunctionsFixture().find((m) => m.code === businessFunctionCode);
    if (!master) return;
    const pf = this.state.projectFunctions.find(
      (p) => p.analysis_project_id === projectId && p.business_function_id === master.id
    );
    if (pf) {
      if (dates.plannedStartDate !== undefined) pf.planned_start_date = dates.plannedStartDate;
      if (dates.plannedEndDate !== undefined) pf.planned_end_date = dates.plannedEndDate;
      if (dates.actualStartDate !== undefined) pf.actual_start_date = dates.actualStartDate;
      if (dates.actualEndDate !== undefined) pf.actual_end_date = dates.actualEndDate;
      pf.updated_at = new Date().toISOString();
      this.persist();
    }
  }

  async getProjectFunctionSchedule(
    projectId: string,
    businessFunctionCode: string
  ): Promise<ScheduleDates | null> {
    const master = getMasterFunctionsFixture().find((m) => m.code === businessFunctionCode);
    if (!master) return null;
    const pf = this.state.projectFunctions.find(
      (p) => p.analysis_project_id === projectId && p.business_function_id === master.id
    );
    if (!pf) return null;
    return {
      plannedStartDate: pf.planned_start_date ?? null,
      plannedEndDate: pf.planned_end_date ?? null,
      actualStartDate: pf.actual_start_date ?? null,
      actualEndDate: pf.actual_end_date ?? null,
    };
  }

  async addOrReactivateProjectFunction(
    projectId: string,
    businessFunctionCode: string,
    performedBy?: string
  ): Promise<void> {
    const master = getMasterFunctionsFixture().find((m) => m.code === businessFunctionCode);
    if (!master) return;
    let pf = this.state.projectFunctions.find(
      (p) => p.analysis_project_id === projectId && p.business_function_id === master.id
    );
    const now = new Date().toISOString();
    if (pf) {
      pf.is_active = 1;
      pf.removed_at = null;
      pf.removal_reason = null;
      pf.updated_at = now;
    } else {
      this.state.projectFunctions.push({
        id: generateId("pbf"),
        analysis_project_id: projectId,
        business_function_id: master.id,
        status: "not_started",
        is_active: 1,
        created_at: now,
        updated_at: now,
      });
    }
    this.state.scopeChanges.push({
      id: generateId("psc"),
      analysis_project_id: projectId,
      business_function_code: businessFunctionCode,
      action: pf ? "reactivated" : "added",
      performed_by: performedBy || "Kullanıcı",
      created_at: now,
    });
    this.persist();
  }

  async deactivateProjectFunction(
    projectId: string,
    businessFunctionCode: string,
    reason: string,
    performedBy?: string
  ): Promise<void> {
    const master = getMasterFunctionsFixture().find((m) => m.code === businessFunctionCode);
    if (!master) return;
    const pf = this.state.projectFunctions.find(
      (p) => p.analysis_project_id === projectId && p.business_function_id === master.id
    );
    const now = new Date().toISOString();
    if (pf) {
      pf.is_active = 0;
      pf.removed_at = now;
      pf.removal_reason = reason;
      pf.updated_at = now;
      this.state.scopeChanges.push({
        id: generateId("psc"),
        analysis_project_id: projectId,
        business_function_code: businessFunctionCode,
        action: "removed",
        reason,
        performed_by: performedBy || "Kullanıcı",
        created_at: now,
      });
      this.persist();
    }
  }

  async getFunctionDataCounts(
    projectId: string,
    businessFunctionCode: string
  ): Promise<FunctionDataCounts> {
    const answers = this.state.answers.filter(
      (a) => a.analysis_project_id === projectId && a.business_function_code === businessFunctionCode
    ).length;
    const findings = this.state.findings.filter(
      (f) => f.analysis_project_id === projectId && f.business_function_code === businessFunctionCode
    ).length;
    const requirements = this.state.requirements.filter(
      (r) => r.analysis_project_id === projectId && r.business_function_code === businessFunctionCode
    ).length;
    const risks = this.state.risks.filter(
      (r) => r.analysis_project_id === projectId && r.business_function_code === businessFunctionCode
    ).length;
    const notes = this.state.notes.filter(
      (n) => n.analysis_project_id === projectId && n.business_function_code === businessFunctionCode
    ).length;
    const customQuestions = this.state.customQuestions.filter(
      (q) => q.analysis_project_id === projectId && q.business_function_code === businessFunctionCode
    ).length;
    const followups = this.state.followups.filter(
      (f) => f.analysis_project_id === projectId && f.business_function_code === businessFunctionCode && f.status === "open"
    ).length;
    const attachments = this.state.attachments.filter(
      (a) => a.analysis_project_id === projectId && a.business_function_code === businessFunctionCode
    ).length;

    const total = answers + findings + requirements + risks + notes + customQuestions + followups + attachments;

    return {
      businessFunctionCode,
      answers,
      findings,
      requirements,
      risks,
      notes,
      customQuestions,
      customAnswers: 0,
      followups,
      attachments,
      governanceObjects: 0,
      total,
    };
  }

  async getProjectScopeChanges(projectId: string): Promise<ProjectScopeChange[]> {
    return (this.state.scopeChanges || []).filter((sc) => sc.analysis_project_id === projectId);
  }

  async updateProjectBusinessFunction(
    functionId: string,
    updates: Partial<ProjectBusinessFunction>
  ): Promise<void> {
    const pf = this.state.projectFunctions.find((p) => p.id === functionId);
    if (pf) {
      Object.assign(pf, updates, { updated_at: new Date().toISOString() });
      this.persist();
    }
  }

  // ---------------------------------------------------------------
  // Soru ve Cevap Motoru
  // ---------------------------------------------------------------

  async saveAnswer(
    projectId: string,
    bfCode: string,
    packId: string,
    packVersion: string,
    questionId: string,
    answerData: AnswerData
  ): Promise<void> {
    const now = new Date().toISOString();
    const existing = this.state.answers.find(
      (a) =>
        a.analysis_project_id === projectId &&
        a.business_function_code === bfCode &&
        a.question_id === questionId
    );
    if (existing) {
      existing.answer_data = answerData;
      existing.question_pack_id = packId || existing.question_pack_id;
      existing.question_pack_version = packVersion || existing.question_pack_version;
      existing.updated_at = now;
    } else {
      this.state.answers.push({
        id: generateId("ans"),
        analysis_project_id: projectId,
        business_function_code: bfCode,
        question_pack_id: packId,
        question_pack_version: packVersion,
        question_id: questionId,
        answer_data: answerData,
        created_at: now,
        updated_at: now,
      });
    }
    this.persist();
  }

  async getAnswer(
    projectId: string,
    bfCode: string,
    questionId: string
  ): Promise<AnswerData | null> {
    const ans = this.state.answers.find(
      (a) =>
        a.analysis_project_id === projectId &&
        a.business_function_code === bfCode &&
        a.question_id === questionId
    );
    return ans ? ans.answer_data : null;
  }

  async getAllAnswers(
    projectId: string,
    bfCode: string
  ): Promise<Map<string, AnswerData>> {
    const map = new Map<string, AnswerData>();
    const list = this.state.answers.filter(
      (a) => a.analysis_project_id === projectId && a.business_function_code === bfCode
    );
    for (const item of list) {
      map.set(item.question_id, item.answer_data);
    }
    return map;
  }

  async saveLastQuestionId(
    projectId: string,
    bfCode: string,
    questionId: string
  ): Promise<void> {
    if (!this.state.lastQuestions) this.state.lastQuestions = {};
    this.state.lastQuestions[`${projectId}_${bfCode}`] = questionId;
    this.persist();
  }

  async getLastQuestionId(
    projectId: string,
    bfCode: string
  ): Promise<string | null> {
    if (!this.state.lastQuestions) return null;
    return this.state.lastQuestions[`${projectId}_${bfCode}`] || null;
  }

  async updateFunctionStatusByCode(
    projectId: string,
    bfCode: string,
    status: FunctionStatus
  ): Promise<void> {
    const master = getMasterFunctionsFixture().find((m) => m.code === bfCode);
    if (!master) return;
    const pf = this.state.projectFunctions.find(
      (p) => p.analysis_project_id === projectId && p.business_function_id === master.id
    );
    if (pf) {
      pf.status = status;
      pf.updated_at = new Date().toISOString();
      this.persist();
    }
  }

  // ---------------------------------------------------------------
  // Semantik Katman
  // ---------------------------------------------------------------

  async createFinding(finding: Omit<Finding, "id" | "created_at" | "updated_at">): Promise<string> {
    const now = new Date().toISOString();
    const id = generateId("fnd");
    const item: Finding = {
      ...finding,
      id,
      created_at: now,
      updated_at: now,
    };
    this.state.findings.push(item);
    this.persist();
    return id;
  }

  async updateFinding(
    id: string,
    updates: Partial<Pick<Finding, "title" | "description" | "priority" | "status" | "business_function_code" | "question_id">>
  ): Promise<void> {
    const f = this.state.findings.find((x) => x.id === id);
    if (f) {
      Object.assign(f, updates, { updated_at: new Date().toISOString() });
      this.persist();
    }
  }

  async deleteFinding(id: string): Promise<void> {
    this.state.findings = this.state.findings.filter((x) => x.id !== id);
    this.persist();
  }

  async getFindings(projectId: string, bfCode?: string, questionId?: string): Promise<Finding[]> {
    return this.state.findings.filter(
      (f) =>
        f.analysis_project_id === projectId &&
        (!bfCode || f.business_function_code === bfCode) &&
        (!questionId || f.question_id === questionId)
    );
  }

  async createRequirement(req: Omit<Requirement, "id" | "created_at" | "updated_at">): Promise<string> {
    const now = new Date().toISOString();
    const id = generateId("req");
    const item: Requirement = {
      ...req,
      id,
      created_at: now,
      updated_at: now,
    };
    this.state.requirements.push(item);
    this.persist();
    return id;
  }

  async updateRequirement(
    id: string,
    updates: Partial<Pick<Requirement, "title" | "description" | "priority" | "status" | "business_function_code" | "question_id">>
  ): Promise<void> {
    const r = this.state.requirements.find((x) => x.id === id);
    if (r) {
      Object.assign(r, updates, { updated_at: new Date().toISOString() });
      this.persist();
    }
  }

  async deleteRequirement(id: string): Promise<void> {
    this.state.requirements = this.state.requirements.filter((x) => x.id !== id);
    this.persist();
  }

  async getRequirements(projectId: string, bfCode?: string, questionId?: string): Promise<Requirement[]> {
    return this.state.requirements.filter(
      (r) =>
        r.analysis_project_id === projectId &&
        (!bfCode || r.business_function_code === bfCode) &&
        (!questionId || r.question_id === questionId)
    );
  }

  async createRisk(risk: Omit<Risk, "id" | "created_at" | "updated_at">): Promise<string> {
    const now = new Date().toISOString();
    const id = generateId("rsk");
    const item: Risk = {
      ...risk,
      id,
      created_at: now,
      updated_at: now,
    };
    this.state.risks.push(item);
    this.persist();
    return id;
  }

  async updateRisk(
    id: string,
    updates: Partial<Pick<Risk, "title" | "description" | "impact" | "probability" | "mitigation_note" | "status" | "business_function_code" | "question_id">>
  ): Promise<void> {
    const r = this.state.risks.find((x) => x.id === id);
    if (r) {
      Object.assign(r, updates, { updated_at: new Date().toISOString() });
      this.persist();
    }
  }

  async deleteRisk(id: string): Promise<void> {
    this.state.risks = this.state.risks.filter((x) => x.id !== id);
    this.persist();
  }

  async getRisks(projectId: string, bfCode?: string, questionId?: string): Promise<Risk[]> {
    return this.state.risks.filter(
      (r) =>
        r.analysis_project_id === projectId &&
        (!bfCode || r.business_function_code === bfCode) &&
        (!questionId || r.question_id === questionId)
    );
  }

  async createProjectNote(note: Omit<ProjectNote, "id" | "created_at" | "updated_at">): Promise<string> {
    const now = new Date().toISOString();
    const id = generateId("not");
    const item: ProjectNote = {
      ...note,
      id,
      created_at: now,
      updated_at: now,
    };
    this.state.notes.push(item);
    this.persist();
    return id;
  }

  async updateProjectNote(
    id: string,
    updates: { note: string; business_function_code?: string | null; question_id?: string | null }
  ): Promise<void> {
    const n = this.state.notes.find((x) => x.id === id);
    if (n) {
      if (updates.note !== undefined) n.note = updates.note;
      if (updates.business_function_code !== undefined) n.business_function_code = updates.business_function_code;
      if (updates.question_id !== undefined) n.question_id = updates.question_id;
      n.updated_at = new Date().toISOString();
      this.persist();
    }
  }

  async deleteProjectNote(id: string): Promise<void> {
    this.state.notes = this.state.notes.filter((x) => x.id !== id);
    this.persist();
  }

  async getProjectNotes(projectId: string, bfCode?: string, questionId?: string): Promise<ProjectNote[]> {
    return this.state.notes.filter(
      (n) =>
        n.analysis_project_id === projectId &&
        (!bfCode || n.business_function_code === bfCode) &&
        (!questionId || n.question_id === questionId)
    );
  }

  async getSemanticSummaryCounts(projectId: string): Promise<SemanticSummaryCounts> {
    const f = await this.getFindings(projectId);
    const r = await this.getRequirements(projectId);
    const rsk = await this.getRisks(projectId);
    const n = await this.getProjectNotes(projectId);
    const openRisks = rsk.filter((x) => x.status === "open").length;
    return {
      findingCount: f.length,
      requirementCount: r.length,
      openRiskCount: openRisks,
      totalRiskCount: rsk.length,
      noteCount: n.length,
    };
  }

  // ---------------------------------------------------------------
  // Rapor Profili
  // ---------------------------------------------------------------

  async getReportProfile(projectId: string): Promise<ReportProfileData | null> {
    if (!this.state.reportProfiles) return null;
    return (this.state.reportProfiles[projectId] as any) || null;
  }

  async saveReportProfile(
    projectId: string,
    profile: {
      executive_summary?: string | null;
      overall_assessment?: string | null;
      open_topics?: string | null;
    }
  ): Promise<void> {
    if (!this.state.reportProfiles) this.state.reportProfiles = {};
    const existing = (this.state.reportProfiles[projectId] as any) || {
      id: generateId("rp"),
      analysis_project_id: projectId,
      executive_summary: null,
      overall_assessment: null,
      open_topics: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    Object.assign(existing, profile, { updated_at: new Date().toISOString() });
    this.state.reportProfiles[projectId] = existing;
    this.persist();
  }

  // ---------------------------------------------------------------
  // Özel Sorular (Custom Questions)
  // ---------------------------------------------------------------

  async createCustomQuestion(payload: CreateCustomQuestionPayload): Promise<string> {
    const now = new Date().toISOString();
    const id = generateId(`cq_${payload.business_function_code.toLowerCase()}`);
    const item: ProjectCustomQuestion = {
      id,
      analysis_project_id: payload.analysis_project_id,
      business_function_code: payload.business_function_code,
      process_name: payload.process_name,
      question_text: payload.question_text,
      description: payload.description ?? null,
      question_type: payload.question_type,
      is_required: payload.is_required ? 1 : 0,
      options: payload.options
        ? payload.options.map((o, idx) => ({
            id: generateId("cqo"),
            custom_question_id: id,
            value: o.value,
            label: o.label,
            sort_order: idx + 1,
            is_other: o.is_other ? 1 : 0,
            created_at: now,
          }))
        : [],
      sort_order: payload.sort_order || 0,
      is_active: 1,
      created_at: now,
      updated_at: now,
    };
    this.state.customQuestions.push(item);
    this.persist();
    return id;
  }

  async getCustomQuestions(projectId: string, bfCode?: string): Promise<ProjectCustomQuestion[]> {
    return this.state.customQuestions.filter(
      (q) => q.analysis_project_id === projectId && (!bfCode || q.business_function_code === bfCode) && q.is_active === 1
    );
  }

  async updateCustomQuestion(id: string, payload: Partial<CreateCustomQuestionPayload>): Promise<void> {
    const q = this.state.customQuestions.find((x) => x.id === id);
    if (q) {
      if (payload.question_text !== undefined) q.question_text = payload.question_text;
      if (payload.description !== undefined) q.description = payload.description ?? null;
      if (payload.process_name !== undefined) q.process_name = payload.process_name;
      if (payload.question_type !== undefined) q.question_type = payload.question_type;
      if (payload.is_required !== undefined) q.is_required = payload.is_required ? 1 : 0;
      if (payload.sort_order !== undefined) q.sort_order = payload.sort_order;
      q.updated_at = new Date().toISOString();
      this.persist();
    }
  }

  async deleteCustomQuestion(id: string): Promise<void> {
    this.state.customQuestions = this.state.customQuestions.filter((x) => x.id !== id);
    if (this.state.customAnswers) {
      delete this.state.customAnswers[id];
    }
    this.persist();
  }

  async saveCustomAnswer(
    projectId: string,
    bfCode: string,
    customQuestionId: string,
    answerData: AnswerData
  ): Promise<void> {
    void projectId;
    void bfCode;
    if (!this.state.customAnswers) this.state.customAnswers = {};
    this.state.customAnswers[customQuestionId] = answerData;
    this.persist();
  }

  async getCustomAnswers(projectId: string, bfCode: string): Promise<Map<string, AnswerData>> {
    const map = new Map<string, AnswerData>();
    const questions = await this.getCustomQuestions(projectId, bfCode);
    for (const q of questions) {
      if (this.state.customAnswers && this.state.customAnswers[q.id]) {
        map.set(q.id, this.state.customAnswers[q.id]);
      }
    }
    return map;
  }

  // ---------------------------------------------------------------
  // Takip Bayrakları (Followups)
  // ---------------------------------------------------------------

  async setQuestionFollowup(payload: SetQuestionFollowupPayload): Promise<string> {
    const now = new Date().toISOString();
    const existing = this.state.followups.find(
      (f) =>
        f.analysis_project_id === payload.analysis_project_id &&
        f.business_function_code === payload.business_function_code &&
        f.question_id === payload.question_id
    );
    if (existing) {
      existing.flag_type = payload.flag_type;
      existing.note = payload.note || null;
      existing.status = "open";
      existing.updated_at = now;
      existing.resolved_at = null;
      this.persist();
      return existing.id;
    } else {
      const id = generateId("qf");
      this.state.followups.push({
        id,
        analysis_project_id: payload.analysis_project_id,
        business_function_code: payload.business_function_code,
        question_id: payload.question_id,
        flag_type: payload.flag_type,
        note: payload.note || null,
        status: "open",
        created_at: now,
        updated_at: now,
        resolved_at: null,
      });
      this.persist();
      return id;
    }
  }

  async removeQuestionFollowup(projectId: string, bfCode: string, questionId: string): Promise<void> {
    this.state.followups = this.state.followups.filter(
      (f) =>
        !(
          f.analysis_project_id === projectId &&
          f.business_function_code === bfCode &&
          f.question_id === questionId
        )
    );
    this.persist();
  }

  async resolveQuestionFollowup(projectId: string, bfCode: string, questionId: string): Promise<void> {
    const f = this.state.followups.find(
      (x) =>
        x.analysis_project_id === projectId &&
        x.business_function_code === bfCode &&
        x.question_id === questionId
    );
    if (f) {
      const now = new Date().toISOString();
      f.status = "resolved";
      f.resolved_at = now;
      f.updated_at = now;
      this.persist();
    }
  }

  async getQuestionFollowups(projectId: string, bfCode?: string): Promise<Map<string, QuestionFollowup>> {
    const map = new Map<string, QuestionFollowup>();
    const list = this.state.followups.filter(
      (f) =>
        f.analysis_project_id === projectId &&
        (!bfCode || f.business_function_code === bfCode) &&
        f.status === "open"
    );
    for (const item of list) {
      map.set(item.question_id, item);
    }
    return map;
  }

  async getAllProjectFollowups(projectId: string): Promise<QuestionFollowup[]> {
    return this.state.followups.filter((f) => f.analysis_project_id === projectId && f.status === "open");
  }

  async getFollowupSummaryCounts(projectId: string, bfCode?: string): Promise<FollowupSummaryCounts> {
    const list = this.state.followups.filter(
      (f) =>
        f.analysis_project_id === projectId &&
        (!bfCode || f.business_function_code === bfCode) &&
        f.status === "open"
    );
    const revisitCount = list.filter((f) => f.flag_type === "revisit").length;
    const criticalCount = list.filter((f) => f.flag_type === "critical").length;
    return {
      revisitCount,
      criticalCount,
      totalFollowupCount: revisitCount + criticalCount,
    };
  }

  // ---------------------------------------------------------------
  // Kanıt ve Ekler
  // ---------------------------------------------------------------

  async addQuestionAttachment(payload: CreateQuestionAttachmentPayload): Promise<QuestionAttachment> {
    const now = new Date().toISOString();
    const item: QuestionAttachment = {
      id: generateId("att"),
      analysis_project_id: payload.analysis_project_id,
      business_function_code: payload.business_function_code,
      question_id: payload.question_id,
      answer_id: payload.answer_id ?? null,
      original_file_name: payload.original_file_name,
      stored_file_name: payload.stored_file_name,
      relative_path: payload.relative_path,
      mime_type: payload.mime_type,
      file_extension: payload.file_extension,
      file_size: payload.file_size,
      sha256: payload.sha256,
      description: payload.description ?? null,
      source_file_name: payload.source_file_name ?? payload.original_file_name,
      source_absolute_path: null,
      imported_at: payload.imported_at || now,
      status: "valid",
      sort_order: payload.sort_order ?? 0,
      created_at: now,
      updated_at: now,
    };
    this.state.attachments.push(item);
    this.persist();
    return item;
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
    const att = this.state.attachments.find((a) => a.id === attachmentId);
    if (att) {
      Object.assign(att, updates, { updated_at: new Date().toISOString() });
      this.persist();
    }
  }

  async getQuestionAttachments(projectId: string, bfCode: string, questionId: string): Promise<QuestionAttachment[]> {
    return this.state.attachments.filter(
      (a) =>
        a.analysis_project_id === projectId &&
        a.business_function_code === bfCode &&
        a.question_id === questionId
    );
  }

  async getProjectAttachments(projectId: string): Promise<QuestionAttachment[]> {
    return this.state.attachments.filter((a) => a.analysis_project_id === projectId);
  }

  async updateAttachmentDescription(attachmentId: string, description: string | null): Promise<void> {
    const att = this.state.attachments.find((a) => a.id === attachmentId);
    if (att) {
      att.description = description;
      att.updated_at = new Date().toISOString();
      this.persist();
    }
  }

  async deleteQuestionAttachment(attachmentId: string): Promise<QuestionAttachment | null> {
    const att = this.state.attachments.find((a) => a.id === attachmentId) || null;
    this.state.attachments = this.state.attachments.filter((a) => a.id !== attachmentId);
    this.persist();
    return att;
  }

  async findAttachmentBySha256(projectId: string, sha256: string): Promise<QuestionAttachment | null> {
    return this.state.attachments.find((a) => a.analysis_project_id === projectId && a.sha256 === sha256) || null;
  }

  async getAttachmentSummaryStats(projectId: string): Promise<AttachmentSummaryStats> {
    const list = this.state.attachments.filter((a) => a.analysis_project_id === projectId);
    const totalBytes = list.reduce((sum, item) => sum + (item.file_size || 0), 0);
    return {
      totalAttachmentCount: list.length,
      totalAttachmentSizeBytes: totalBytes,
    };
  }

  // ---------------------------------------------------------------
  // OT İstasyonları (FAZ-62B)
  // ---------------------------------------------------------------

  async getOtStations(projectId: string): Promise<OtStation[]> {
    return this.state.otStations.filter((s) => s.project_id === projectId);
  }

  async getOtStationById(stationId: string): Promise<OtStation | null> {
    return this.state.otStations.find((s) => s.id === stationId) || null;
  }

  async createOtStation(station: Omit<OtStation, "id" | "created_at" | "updated_at">): Promise<OtStation> {
    const now = new Date().toISOString();
    const item: OtStation = {
      ...station,
      id: generateId("ots"),
      created_at: now,
      updated_at: now,
    };
    this.state.otStations.push(item);
    this.persist();
    return item;
  }

  async updateOtStation(stationId: string, updates: Partial<OtStation>): Promise<void> {
    const s = this.state.otStations.find((x) => x.id === stationId);
    if (s) {
      Object.assign(s, updates, { updated_at: new Date().toISOString() });
      this.persist();
    }
  }

  async toggleOtStationStatus(stationId: string, status: StationStatus): Promise<void> {
    const s = this.state.otStations.find((x) => x.id === stationId);
    if (s) {
      s.status = status;
      s.updated_at = new Date().toISOString();
      this.persist();
    }
  }

  async deleteOtStation(stationId: string): Promise<void> {
    this.state.otStations = this.state.otStations.filter((s) => s.id !== stationId);
    this.state.otStationAnswers = this.state.otStationAnswers.filter((a) => a.station_id !== stationId);
    this.persist();
  }

  async getOtStationAnswers(projectId: string, stationId: string): Promise<Map<string, AnswerData>> {
    const map = new Map<string, AnswerData>();
    const list = this.state.otStationAnswers.filter(
      (a) => a.project_id === projectId && a.station_id === stationId
    );
    for (const a of list) {
      map.set(a.question_id, a.answer_data);
    }
    return map;
  }

  async getOtStationAnswer(
    projectId: string,
    stationId: string,
    questionId: string
  ): Promise<AnswerData | null> {
    const a = this.state.otStationAnswers.find(
      (x) => x.project_id === projectId && x.station_id === stationId && x.question_id === questionId
    );
    return a ? a.answer_data : null;
  }

  async saveOtStationAnswer(
    projectId: string,
    stationId: string,
    questionId: string,
    answerData: AnswerData,
    bfCode = "OT_INDUSTRIAL_DATA",
    packId = "tr.ot_industrial_data.core",
    packVersion = "0.1.0"
  ): Promise<void> {
    const now = new Date().toISOString();
    const existing = this.state.otStationAnswers.find(
      (a) => a.project_id === projectId && a.station_id === stationId && a.question_id === questionId
    );
    if (existing) {
      existing.answer_data = answerData;
      existing.updated_at = now;
    } else {
      this.state.otStationAnswers.push({
        id: generateId("otsa"),
        project_id: projectId,
        station_id: stationId,
        business_function_code: bfCode,
        question_pack_id: packId,
        question_pack_version: packVersion,
        question_id: questionId,
        answer_data: answerData,
        created_at: now,
        updated_at: now,
      });
    }
    this.persist();
  }

  async getOtStationsSummary(projectId: string): Promise<OtStationsSummaryStats> {
    const stations = await this.getOtStations(projectId);
    const active = stations.filter((s) => s.status === "active").length;
    const areas = new Set(stations.map((s) => s.area_name).filter((a): a is string => Boolean(a)));
    const lines = new Set(stations.map((s) => s.line_name).filter((l): l is string => Boolean(l)));
    return {
      totalStations: stations.length,
      activeStations: active,
      passiveStations: stations.length - active,
      areaCount: areas.size,
      lineCount: lines.size,
    };
  }

  // ---------------------------------------------------------------
  // OT Veri ve Alarm Gereksinimleri (FAZ-62C)
  // ---------------------------------------------------------------

  async createOtDataRequirement(payload: Omit<OtDataRequirement, "id" | "created_at" | "updated_at">): Promise<OtDataRequirement> {
    const now = new Date().toISOString();
    const item: OtDataRequirement = { ...payload, id: generateId("otreq"), created_at: now, updated_at: now };
    if (!this.state.otDataRequirements) this.state.otDataRequirements = [];
    this.state.otDataRequirements.push(item);
    this.persist();
    return item;
  }

  async updateOtDataRequirement(id: string, updates: Partial<Omit<OtDataRequirement, "id" | "project_id" | "station_id" | "created_at" | "updated_at">>): Promise<void> {
    const req = (this.state.otDataRequirements || []).find((r) => r.id === id);
    if (req) {
      Object.assign(req, updates, { updated_at: new Date().toISOString() });
      this.persist();
    }
  }

  async deleteOtDataRequirement(id: string): Promise<void> {
    this.state.otDataRequirements = (this.state.otDataRequirements || []).filter((r) => r.id !== id);
    this.persist();
  }

  async getOtDataRequirements(projectId: string, stationId?: string): Promise<OtDataRequirement[]> {
    return (this.state.otDataRequirements || []).filter(
      (r) => r.project_id === projectId && (!stationId || r.station_id === stationId)
    );
  }

  async createOtAlarmRequirement(payload: Omit<OtAlarmRequirement, "id" | "created_at" | "updated_at">): Promise<OtAlarmRequirement> {
    const now = new Date().toISOString();
    const item: OtAlarmRequirement = { ...payload, id: generateId("otalm"), created_at: now, updated_at: now };
    if (!this.state.otAlarmRequirements) this.state.otAlarmRequirements = [];
    this.state.otAlarmRequirements.push(item);
    this.persist();
    return item;
  }

  async updateOtAlarmRequirement(id: string, updates: Partial<Omit<OtAlarmRequirement, "id" | "project_id" | "station_id" | "created_at" | "updated_at">>): Promise<void> {
    const alm = (this.state.otAlarmRequirements || []).find((a) => a.id === id);
    if (alm) {
      Object.assign(alm, updates, { updated_at: new Date().toISOString() });
      this.persist();
    }
  }

  async deleteOtAlarmRequirement(id: string): Promise<void> {
    this.state.otAlarmRequirements = (this.state.otAlarmRequirements || []).filter((a) => a.id !== id);
    this.persist();
  }

  async getOtAlarmRequirements(projectId: string, stationId?: string): Promise<OtAlarmRequirement[]> {
    return (this.state.otAlarmRequirements || []).filter(
      (a) => a.project_id === projectId && (!stationId || a.station_id === stationId)
    );
  }

  async createOtQualityDevice(payload: Omit<OtQualityDevice, "id" | "created_at" | "updated_at">): Promise<OtQualityDevice> {
    const now = new Date().toISOString();
    const item: OtQualityDevice = { ...payload, id: generateId("otqd"), created_at: now, updated_at: now };
    if (!this.state.otQualityDevices) this.state.otQualityDevices = [];
    this.state.otQualityDevices.push(item);
    this.persist();
    return item;
  }

  async updateOtQualityDevice(id: string, updates: Partial<Omit<OtQualityDevice, "id" | "project_id" | "station_id" | "created_at" | "updated_at">>): Promise<void> {
    const dev = (this.state.otQualityDevices || []).find((d) => d.id === id);
    if (dev) {
      Object.assign(dev, updates, { updated_at: new Date().toISOString() });
      this.persist();
    }
  }

  async deleteOtQualityDevice(id: string): Promise<void> {
    this.state.otQualityDevices = (this.state.otQualityDevices || []).filter((d) => d.id !== id);
    this.persist();
  }

  async getOtQualityDevices(projectId: string, stationId?: string): Promise<OtQualityDevice[]> {
    return (this.state.otQualityDevices || []).filter(
      (d) => d.project_id === projectId && (!stationId || d.station_id === stationId)
    );
  }

  async getOtMatrixSummaryCounts(projectId: string): Promise<OtMatrixSummaryCounts> {
    const dataReqs = await this.getOtDataRequirements(projectId);
    const alarmReqs = await this.getOtAlarmRequirements(projectId);
    const devices = await this.getOtQualityDevices(projectId);
    const criticalData = dataReqs.filter((d) => d.priority === "HIGH" || d.priority === "CRITICAL").length;
    const safetyAlarms = alarmReqs.filter((a) => a.severity === "CRITICAL" || a.severity === "HIGH").length;
    return {
      totalDataRequirements: dataReqs.length,
      criticalDataRequirements: criticalData,
      eventBasedCount: 0,
      cycleBasedCount: 0,
      timeBasedCount: 0,
      totalAlarms: alarmReqs.length,
      safetyCriticalAlarms: safetyAlarms,
      unassignedRoleAlarms: 0,
      missingActionAlarms: 0,
      totalQualityDevices: devices.length,
      automatedTransferDevices: 0,
      pdfOnlyDevices: 0,
      highComplexityItems: 0,
    };
  }

  // ---------------------------------------------------------------
  // BPMN Süreç Haritaları (FAZ-63)
  // ---------------------------------------------------------------

  async getProcessMaps(projectId: string): Promise<ProcessMap[]> {
    return this.state.processMaps.filter((m) => m.project_id === projectId);
  }

  async getProcessMapById(mapId: string): Promise<ProcessMap | null> {
    return this.state.processMaps.find((m) => m.id === mapId) || null;
  }

  async createProcessMap(map: Omit<ProcessMap, "id" | "created_at" | "updated_at">): Promise<ProcessMap> {
    const now = new Date().toISOString();
    const item: ProcessMap = { ...map, id: generateId("pmap"), created_at: now, updated_at: now };
    this.state.processMaps.push(item);
    this.persist();
    return item;
  }

  async updateProcessMap(mapId: string, updates: Partial<Omit<ProcessMap, "id" | "project_id" | "created_at" | "updated_at">>): Promise<void> {
    const m = this.state.processMaps.find((x) => x.id === mapId);
    if (m) {
      Object.assign(m, updates, { updated_at: new Date().toISOString() });
      this.persist();
    }
  }

  async deleteProcessMap(mapId: string): Promise<void> {
    this.state.processMaps = this.state.processMaps.filter((m) => m.id !== mapId);
    this.state.processNodes = this.state.processNodes.filter((n) => n.process_map_id !== mapId);
    this.state.processEdges = this.state.processEdges.filter((e) => e.process_map_id !== mapId);
    this.persist();
  }

  async getProcessNodes(mapId: string): Promise<ProcessNode[]> {
    return this.state.processNodes.filter((n) => n.process_map_id === mapId);
  }

  async createProcessNode(node: Omit<ProcessNode, "id" | "created_at" | "updated_at">): Promise<ProcessNode> {
    const now = new Date().toISOString();
    const item: ProcessNode = { ...node, id: generateId("pnode"), created_at: now, updated_at: now };
    this.state.processNodes.push(item);
    this.persist();
    return item;
  }

  async updateProcessNode(nodeId: string, updates: Partial<Omit<ProcessNode, "id" | "process_map_id" | "created_at" | "updated_at">>): Promise<void> {
    const n = this.state.processNodes.find((x) => x.id === nodeId);
    if (n) {
      Object.assign(n, updates, { updated_at: new Date().toISOString() });
      this.persist();
    }
  }

  async deleteProcessNode(nodeId: string): Promise<void> {
    this.state.processNodes = this.state.processNodes.filter((n) => n.id !== nodeId);
    this.persist();
  }

  async getProcessEdges(mapId: string): Promise<ProcessEdge[]> {
    return this.state.processEdges.filter((e) => e.process_map_id === mapId);
  }

  async createProcessEdge(edge: Omit<ProcessEdge, "id" | "created_at">): Promise<ProcessEdge> {
    const now = new Date().toISOString();
    const item: ProcessEdge = { ...edge, id: generateId("pedge"), created_at: now, updated_at: now };
    this.state.processEdges.push(item);
    this.persist();
    return item;
  }

  async deleteProcessEdge(edgeId: string): Promise<void> {
    this.state.processEdges = this.state.processEdges.filter((e) => e.id !== edgeId);
    this.persist();
  }

  async getProcessMapsSummaryStats(projectId: string): Promise<ProcessMapsSummaryStats> {
    const maps = await this.getProcessMaps(projectId);
    let totalNodes = 0;
    let totalEdges = 0;
    let highRiskCount = 0;
    for (const m of maps) {
      const nodes = await this.getProcessNodes(m.id);
      const edges = await this.getProcessEdges(m.id);
      totalNodes += nodes.length;
      totalEdges += edges.length;
      if (nodes.length > 5 || edges.length > 5) highRiskCount++;
    }
    return {
      totalMaps: maps.length,
      totalNodes,
      totalEdges,
      totalApprovals: 0,
      totalHandoffs: 0,
      duplicateDataEntryCount: 0,
      bypassPossibleCount: 0,
      highAdoptionRiskCount: highRiskCount,
      mediumAdoptionRiskCount: 0,
      lowAdoptionRiskCount: 0,
      valueAddedStepCount: 0,
      simplificationOpportunityCount: 0,
    };
  }

  // ---------------------------------------------------------------
  // Veri Yönetişimi Varlıkları (FAZ-64)
  // ---------------------------------------------------------------

  async getDataGovernanceAssets(projectId: string): Promise<DataGovernanceAsset[]> {
    return this.state.dataGovernanceAssets.filter((a) => a.project_id === projectId);
  }

  async getDataGovernanceAssetById(assetId: string): Promise<DataGovernanceAsset | null> {
    return this.state.dataGovernanceAssets.find((a) => a.id === assetId) || null;
  }

  async createDataGovernanceAsset(asset: Omit<DataGovernanceAsset, "id" | "created_at" | "updated_at">): Promise<string> {
    const now = new Date().toISOString();
    const id = generateId("gov");
    const item: DataGovernanceAsset = { ...asset, id, created_at: now, updated_at: now };
    this.state.dataGovernanceAssets.push(item);
    this.persist();
    return id;
  }

  async updateDataGovernanceAsset(assetId: string, updates: Partial<Omit<DataGovernanceAsset, "id" | "project_id" | "created_at" | "updated_at">>): Promise<void> {
    const a = this.state.dataGovernanceAssets.find((x) => x.id === assetId);
    if (a) {
      Object.assign(a, updates, { updated_at: new Date().toISOString() });
      this.persist();
    }
  }

  async deleteDataGovernanceAsset(assetId: string): Promise<void> {
    this.state.dataGovernanceAssets = this.state.dataGovernanceAssets.filter((a) => a.id !== assetId);
    this.state.dataGovernanceAccess = this.state.dataGovernanceAccess.filter((ac) => ac.asset_id !== assetId);
    this.state.dataGovernanceApprovals = this.state.dataGovernanceApprovals.filter((ap) => ap.asset_id !== assetId);
    this.persist();
  }

  async getDataGovernanceAccessRules(projectId: string, assetId?: string): Promise<DataGovernanceAccess[]> {
    return this.state.dataGovernanceAccess.filter((a) => a.project_id === projectId && (!assetId || a.asset_id === assetId));
  }

  async createDataGovernanceAccess(access: Omit<DataGovernanceAccess, "id" | "created_at" | "updated_at">): Promise<string> {
    const now = new Date().toISOString();
    const id = generateId("gacc");
    const item: DataGovernanceAccess = { ...access, id, created_at: now, updated_at: now };
    this.state.dataGovernanceAccess.push(item);
    this.persist();
    return id;
  }

  async updateDataGovernanceAccess(id: string, updates: Partial<DataGovernanceAccess>): Promise<void> {
    const acc = this.state.dataGovernanceAccess.find((a) => a.id === id);
    if (acc) {
      Object.assign(acc, updates, { updated_at: new Date().toISOString() });
      this.persist();
    }
  }

  async deleteDataGovernanceAccess(accessId: string): Promise<void> {
    this.state.dataGovernanceAccess = this.state.dataGovernanceAccess.filter((a) => a.id !== accessId);
    this.persist();
  }

  async getDataGovernanceApprovals(projectId: string, assetId?: string): Promise<DataGovernanceApproval[]> {
    return this.state.dataGovernanceApprovals.filter((a) => a.project_id === projectId && (!assetId || a.asset_id === assetId));
  }

  async createDataGovernanceApproval(approval: Omit<DataGovernanceApproval, "id" | "created_at" | "updated_at">): Promise<string> {
    const now = new Date().toISOString();
    const id = generateId("gapp");
    const item: DataGovernanceApproval = { ...approval, id, created_at: now, updated_at: now };
    this.state.dataGovernanceApprovals.push(item);
    this.persist();
    return id;
  }

  async updateDataGovernanceApproval(id: string, updates: Partial<DataGovernanceApproval>): Promise<void> {
    const app = this.state.dataGovernanceApprovals.find((a) => a.id === id);
    if (app) {
      Object.assign(app, updates, { updated_at: new Date().toISOString() });
      this.persist();
    }
  }

  async deleteDataGovernanceApproval(approvalId: string): Promise<void> {
    this.state.dataGovernanceApprovals = this.state.dataGovernanceApprovals.filter((a) => a.id !== approvalId);
    this.persist();
  }

  async getDataGovernanceSummaryStats(projectId: string): Promise<DataGovernanceSummaryStats> {
    const assets = await this.getDataGovernanceAssets(projectId);
    let totalApprovals = 0;
    let totalAccessRules = 0;
    for (const a of assets) {
      const acc = await this.getDataGovernanceAccessRules(projectId, a.id);
      const app = await this.getDataGovernanceApprovals(projectId, a.id);
      totalAccessRules += acc.length;
      totalApprovals += app.length;
    }
    return {
      totalAssets: assets.length,
      unassignedOwnerCount: 0,
      unassignedStewardCount: 0,
      unassignedCustodianCount: 0,
      criticalAssetCount: assets.filter((a) => a.criticality === "CRITICAL").length,
      masterDataCount: assets.filter((a) => a.master_data === 1).length,
      personalDataCount: assets.filter((a) => a.personal_data === 1).length,
      financialDataCount: assets.filter((a) => a.financial_data === 1).length,
      qualitySafetyCount: assets.filter((a) => a.quality_or_safety_data === 1).length,
      totalAccessRules,
      totalApprovals,
      sodConflictCount: 0,
      missingApprovalRulesCount: 0,
    };
  }

  // ---------------------------------------------------------------
  // Saha Kanıtları Doğrulama Defteri (FAZ-65)
  // ---------------------------------------------------------------

  async getEvidenceItems(projectId: string): Promise<EvidenceItem[]> {
    return this.state.evidenceItems.filter((e) => e.project_id === projectId);
  }

  async getEvidenceItemById(itemId: string): Promise<EvidenceItem | null> {
    return this.state.evidenceItems.find((e) => e.id === itemId) || null;
  }

  async createEvidenceItem(item: Omit<EvidenceItem, "id" | "created_at" | "updated_at">): Promise<EvidenceItem> {
    const now = new Date().toISOString();
    const created: EvidenceItem = { ...item, id: generateId("evi"), created_at: now, updated_at: now };
    this.state.evidenceItems.push(created);
    this.persist();
    return created;
  }

  async updateEvidenceItem(itemId: string, updates: Partial<Omit<EvidenceItem, "id" | "project_id" | "created_at" | "updated_at">>): Promise<void> {
    const e = this.state.evidenceItems.find((x) => x.id === itemId);
    if (e) {
      Object.assign(e, updates, { updated_at: new Date().toISOString() });
      this.persist();
    }
  }

  async deleteEvidenceItem(itemId: string): Promise<void> {
    this.state.evidenceItems = this.state.evidenceItems.filter((e) => e.id !== itemId);
    this.state.evidenceLinks = this.state.evidenceLinks.filter((l) => l.evidence_id !== itemId);
    this.persist();
  }

  async getEvidenceLinks(projectId: string, targetType?: EvidenceTargetType, targetId?: string): Promise<EvidenceLink[]> {
    return this.state.evidenceLinks.filter(
      (l) =>
        l.project_id === projectId &&
        (!targetType || l.target_type === targetType) &&
        (!targetId || l.target_id === targetId)
    );
  }

  async createEvidenceLink(link: Omit<EvidenceLink, "id" | "created_at">): Promise<EvidenceLink> {
    const now = new Date().toISOString();
    const created: EvidenceLink = { ...link, id: generateId("evl"), created_at: now };
    this.state.evidenceLinks.push(created);
    this.persist();
    return created;
  }

  async deleteEvidenceLink(linkId: string): Promise<void> {
    this.state.evidenceLinks = this.state.evidenceLinks.filter((l) => l.id !== linkId);
    this.persist();
  }

  async getEvidenceSummaryStats(projectId: string): Promise<EvidenceSummaryStats> {
    const items = await this.getEvidenceItems(projectId);
    const reviewed = items.filter((i) => i.verification_status === "REVIEWED").length;
    const accepted = items.filter((i) => i.verification_status === "ACCEPTED").length;
    const rejected = items.filter((i) => i.verification_status === "REJECTED").length;
    const unreviewed = items.filter((i) => i.verification_status === "UNREVIEWED").length;
    const links = this.state.evidenceLinks.filter((l) => l.project_id === projectId);
    return {
      totalEvidence: items.length,
      unreviewedCount: unreviewed,
      reviewedCount: reviewed,
      acceptedCount: accepted,
      rejectedCount: rejected,
      unsupportedCriticalFindingsCount: 0,
      evidenceCoverageRate: items.length > 0 ? 100 : 0,
      confidentialOrRestrictedCount: 0,
      linkedEvidenceCount: links.length,
      unlinkedEvidenceCount: 0,
    };
  }

  // ---------------------------------------------------------------
  // Pilot Saha Kabulü & Go-Live Hazırlığı (FAZ-66)
  // ---------------------------------------------------------------

  async getReadinessChecks(projectId: string): Promise<ReadinessCheckItem[]> {
    return this.state.readinessChecks.filter((r) => r.project_id === projectId);
  }

  async getReadinessCheckById(id: string): Promise<ReadinessCheckItem | null> {
    return (this.state.readinessChecks.find((r) => r.id === id) || null) as ReadinessCheckItem | null;
  }

  async createReadinessCheck(payload: CreateReadinessCheckPayload): Promise<ReadinessCheckItem> {
    const now = new Date().toISOString();
    const item: ReadinessCheckItem = {
      id: generateId("chk"),
      project_id: payload.project_id,
      category: payload.category,
      check_code: payload.check_code,
      title: payload.title,
      description: payload.description || null,
      status: payload.status || "NOT_STARTED",
      critical: payload.critical === true || payload.critical === 1 ? 1 : 0,
      owner_role: payload.owner_role || null,
      evidence_required: payload.evidence_required === true || payload.evidence_required === 1 ? 1 : 0,
      action_required: payload.action_required === true || payload.action_required === 1 ? 1 : 0,
      action_note: payload.action_note || null,
      due_date: payload.due_date || null,
      notes: payload.notes || null,
      created_at: now,
      updated_at: now,
    };
    this.state.readinessChecks.push(item);
    this.persist();
    return item;
  }

  async updateReadinessCheck(id: string, payload: UpdateReadinessCheckPayload): Promise<ReadinessCheckItem | null> {
    const existing = this.state.readinessChecks.find((r) => r.id === id);
    if (!existing) return null;
    const now = new Date().toISOString();
    Object.assign(existing, payload, { updated_at: now });
    this.persist();
    return existing;
  }

  async deleteReadinessCheck(id: string): Promise<boolean> {
    const before = this.state.readinessChecks.length;
    this.state.readinessChecks = this.state.readinessChecks.filter((r) => r.id !== id);
    this.persist();
    return this.state.readinessChecks.length < before;
  }

  async seedStarterReadinessChecks(projectId: string): Promise<number> {
    const existing = await this.getReadinessChecks(projectId);
    if (existing.length > 0) return 0;
    const initial = createInitialBrowserFixture().readinessChecks;
    for (const c of initial) {
      this.state.readinessChecks.push({ ...c, id: generateId("chk"), project_id: projectId });
    }
    this.persist();
    return initial.length;
  }

  async getReadinessSummary(projectId: string): Promise<ReadinessSummaryResult> {
    const checks = await this.getReadinessChecks(projectId);
    let readyCount = 0;
    let inProgressCount = 0;
    let blockedCount = 0;
    let notStartedCount = 0;
    let notApplicableCount = 0;
    let criticalTotalCount = 0;
    let criticalOpenCount = 0;
    let criticalBlockedCount = 0;
    let actionRequiredCount = 0;

    const criticalGaps: ReadinessCheckItem[] = [];
    const actions: ReadinessActionItem[] = [];
    const categoryMap: Record<string, { total: number; ready: number; inProgress: number; blocked: number; notStarted: number; notApplicable: number; criticalOpen: number }> = {};

    for (const c of checks) {
      const cat = c.category;
      if (!categoryMap[cat]) {
        categoryMap[cat] = { total: 0, ready: 0, inProgress: 0, blocked: 0, notStarted: 0, notApplicable: 0, criticalOpen: 0 };
      }
      categoryMap[cat].total++;

      if (c.status === "READY") {
        readyCount++;
        categoryMap[cat].ready++;
      } else if (c.status === "IN_PROGRESS") {
        inProgressCount++;
        categoryMap[cat].inProgress++;
      } else if (c.status === "BLOCKED") {
        blockedCount++;
        categoryMap[cat].blocked++;
      } else if (c.status === "NOT_APPLICABLE") {
        notApplicableCount++;
        categoryMap[cat].notApplicable++;
      } else {
        notStartedCount++;
        categoryMap[cat].notStarted++;
      }

      if (c.critical === 1) {
        criticalTotalCount++;
        if (c.status !== "READY" && c.status !== "NOT_APPLICABLE") {
          criticalOpenCount++;
          categoryMap[cat].criticalOpen++;
          criticalGaps.push(c);
        }
        if (c.status === "BLOCKED") criticalBlockedCount++;
      }

      if (c.action_required === 1 && c.status !== "READY" && c.status !== "NOT_APPLICABLE") {
        actionRequiredCount++;
        actions.push({
          id: c.id,
          category: c.category,
          categoryLabel: READINESS_CATEGORY_LABELS[c.category] || c.category,
          checkCode: c.check_code,
          title: c.title,
          actionNote: c.action_note || "",
          ownerRole: c.owner_role || "Atanmamış",
          dueDate: c.due_date || null,
          critical: c.critical === 1,
          status: c.status,
        });
      }
    }

    const totalChecks = checks.length;
    const applicableChecks = totalChecks - notApplicableCount;
    const readinessPercentage = applicableChecks > 0 ? Math.round((readyCount / applicableChecks) * 100) : 0;
    const isDiscoveryReady = totalChecks > 0 && readinessPercentage === 100 && criticalOpenCount === 0;

    const stats: ReadinessSummaryStats = {
      totalChecks,
      applicableChecks,
      readyCount,
      inProgressCount,
      blockedCount,
      notStartedCount,
      notApplicableCount,
      criticalTotalCount,
      criticalOpenCount,
      criticalBlockedCount,
      actionRequiredCount,
      readinessPercentage,
      isDiscoveryReady,
    };

    const categories: CategoryReadinessStats[] = (
      Object.keys(categoryMap) as ReadinessCategory[]
    ).map((cat) => {
      const data = categoryMap[cat];
      const catApplicable = data.total - data.notApplicable;
      const catPercentage = catApplicable > 0 ? Math.round((data.ready / catApplicable) * 100) : 0;
      return {
        category: cat,
        categoryLabel: READINESS_CATEGORY_LABELS[cat] || cat,
        totalCount: data.total,
        applicableCount: catApplicable,
        readyCount: data.ready,
        inProgressCount: data.inProgress,
        blockedCount: data.blocked,
        notStartedCount: data.notStarted,
        notApplicableCount: data.notApplicable,
        criticalOpenCount: data.criticalOpen,
        readinessPercentage: catPercentage,
      };
    });

    return {
      stats,
      categories,
      criticalGaps,
      actions,
    };
  }
}
