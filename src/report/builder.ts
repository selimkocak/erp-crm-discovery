/**
 * ERP CRM Discovery — Report Builder
 *
 * Assembles a complete, deterministic, UI-independent ReportModel
 * from database records, loaded question packs, and user-defined report profiles.
 */

import {
  getProjectDetail,
  getAllAnswers,
  getFindings,
  getRequirements,
  getRisks,
  getProjectNotes,
  getReportProfile,
  getCustomQuestions,
  getCustomAnswers,
  getAllProjectFollowups,
  getProjectAttachments,
  getGovernanceSummary,
  getGovernanceObjects,
  getGovernanceResponsibilities,
  getGovernanceAuthorizations,
  getGovernanceLimits,
  getGovernanceSodRisks,
  getGovernanceAttachments,
  getOtStations,
  getOtDataRequirements,
  getOtAlarmRequirements,
  getOtQualityDevices,
  getOtMatrixSummaryCounts,
} from "../db/client";
import { loadQuestionPack, getPackIdForFunction } from "../engine/loader";
import { getVisibleQuestions } from "../engine/branching";
import { adaptCustomQuestionToQuestion } from "../engine/customQuestionAdapter";
import {
  formatAnswer,
  isValidAnswer,
  formatEmployeeCount,
  getTurkishAccusativeSuffix,
} from "./formatters";
import { resolveAttachmentFileUrl } from "../storage/attachmentLinks";
import { calculateScheduleStatus, formatDateRangeSummary } from "../models/scheduleStatus";
import type {
  ReportModel,
  ReportMetadata,
  ReportCompany,
  ReportScopeItem,
  ReportBusinessFunction,
  ReportProcess,
  ReportQuestionItem,
  ReportFinding,
  ReportRequirement,
  ReportRisk,
  ReportProjectNote,
  ReportProfile,
  ReportSummaryStats,
  ReportFollowupItem,
  ReportAttachmentItem,
  ReportScheduleItem,
  ReportScheduleSummary,
  ReportOtStationsSummary,
  ReportOtMatrixSummary,
} from "./types";
import type { QuestionPack, Question } from "../engine/types";
import type { Finding, Requirement, Risk, ProjectNote } from "../types";

export interface BuildReportOptions {
  includeUnanswered?: boolean;
  baseDirOverride?: string;
}

export async function buildReportModel(
  projectId: string,
  options: BuildReportOptions = {}
): Promise<ReportModel> {
  const includeUnanswered = options.includeUnanswered ?? false;

  // 1. Fetch core data in parallel
  const [
    detailData,
    reportProfile,
    findings,
    requirements,
    risks,
    notes,
    dbFollowups,
    dbAttachments,
    govSummary,
    govObjects,
    govResponsibilities,
    govAuthorizations,
    govLimits,
    govSodRisks,
    govAttachments,
    otStations,
    otDataReqs,
    otAlarmReqs,
    otQualityDevs,
    otMatrixCounts,
  ] = await Promise.all([
    getProjectDetail(projectId),
    getReportProfile(projectId),
    getFindings(projectId),
    getRequirements(projectId),
    getRisks(projectId),
    getProjectNotes(projectId),
    getAllProjectFollowups(projectId),
    getProjectAttachments(projectId),
    getGovernanceSummary(projectId),
    getGovernanceObjects(projectId),
    getGovernanceResponsibilities(projectId),
    getGovernanceAuthorizations(projectId),
    getGovernanceLimits(projectId),
    getGovernanceSodRisks(projectId),
    getGovernanceAttachments(projectId),
    getOtStations(projectId),
    getOtDataRequirements(projectId),
    getOtAlarmRequirements(projectId),
    getOtQualityDevices(projectId),
    getOtMatrixSummaryCounts(projectId),
  ]);


  if (!detailData) {
    throw new Error(`Analiz projesi bulunamadı: ${projectId}`);
  }

  // Pre-resolve managed vault file URLs for all attachments (FAZ-33)
  const attachmentUrlMap = new Map<string, string>();
  await Promise.all(
    dbAttachments.map(async (a) => {
      const url = await resolveAttachmentFileUrl(a.relative_path, options.baseDirOverride);
      attachmentUrlMap.set(a.id, url);
    })
  );

  const { project, company, functions: allFunctions } = detailData;
  const functions = allFunctions.filter((f) => f.is_active !== 0);

  // 2. Format Metadata
  const now = new Date();
  const generatedAt = now.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const packVersions: Record<string, string> = {};
  // 3. Question lookup maps for source question text & process resolution
  // Scoped keys (${bfCode}::${questionId}) prevent collisions between modules (e.g. INVENTORY / INV-001 vs INVOICING / INV-001)
  const questionTextMap = new Map<string, string>();
  const questionProcessMap = new Map<string, string>();

  const getResolvedQuestionText = (questionId: string | null | undefined, bfCode?: string | null): string | null => {
    if (!questionId) return null;
    if (bfCode) {
      const scoped = questionTextMap.get(`${bfCode}::${questionId}`);
      if (scoped) return scoped;
    }
    return questionTextMap.get(questionId) ?? null;
  };

  const getResolvedProcessName = (questionId: string | null | undefined, bfCode?: string | null, fallback = "Genel Süreç"): string => {
    if (!questionId) return fallback;
    if (bfCode) {
      const scoped = questionProcessMap.get(`${bfCode}::${questionId}`);
      if (scoped) return scoped;
    }
    return questionProcessMap.get(questionId) ?? fallback;
  };

  // 4. Build Business Functions and Scope
  const reportScope: ReportScopeItem[] = [];
  const reportFunctions: ReportBusinessFunction[] = [];

  let totalQuestionsCount = 0;
  let answeredQuestionsCount = 0;

  for (const fn of functions) {
    const packId = getPackIdForFunction(fn.code);
    let loadedPack: QuestionPack | null = null;

    if (packId) {
      const loadResult = await loadQuestionPack(packId);
      if (loadResult.ok) {
        loadedPack = loadResult.pack;
        packVersions[fn.code] = `${loadedPack.meta.pack_id} v${loadedPack.meta.version}`;
        for (const q of loadedPack.questions) {
          questionTextMap.set(`${fn.code}::${q.id}`, q.question);
          questionProcessMap.set(`${fn.code}::${q.id}`, q.process);
          if (!questionTextMap.has(q.id)) {
            questionTextMap.set(q.id, q.question);
          }
          if (!questionProcessMap.has(q.id)) {
            questionProcessMap.set(q.id, q.process);
          }
        }
      }
    }

    // Answers (Canonical + Custom)
    const [canonicalAnswersMap, customQuestionsList, customAnswersMap] = await Promise.all([
      loadedPack ? getAllAnswers(projectId, fn.code) : Promise.resolve(new Map()),
      getCustomQuestions(projectId, fn.code),
      getCustomAnswers(projectId, fn.code),
    ]);

    const answersMap = new Map<string, any>(canonicalAnswersMap);
    for (const [qId, aData] of customAnswersMap.entries()) {
      answersMap.set(qId, aData);
    }

    for (const cq of customQuestionsList) {
      questionTextMap.set(`${fn.code}::${cq.id}`, cq.question_text);
      questionProcessMap.set(`${fn.code}::${cq.id}`, cq.process_name);
      if (!questionTextMap.has(cq.id)) {
        questionTextMap.set(cq.id, cq.question_text);
      }
      if (!questionProcessMap.has(cq.id)) {
        questionProcessMap.set(cq.id, cq.process_name);
      }
    }

    // Visibility (Branching) + Adapted Custom Questions
    const canonicalVisible: Question[] = loadedPack
      ? getVisibleQuestions(loadedPack.questions, canonicalAnswersMap)
      : [];

    const baseOrder = (loadedPack?.questions.length ?? 0) + 1;
    const adaptedCustomQuestions: Question[] = customQuestionsList.map((cq, idx) =>
      adaptCustomQuestionToQuestion(cq, baseOrder + idx)
    );

    const visibleQuestions: Question[] = [...canonicalVisible, ...adaptedCustomQuestions];

    // Follow-ups for this business function
    const fnFollowupsMap = new Map<string, any>();
    for (const fol of dbFollowups) {
      if (fol.business_function_code === fn.code) {
        fnFollowupsMap.set(fol.question_id, fol);
      }
    }

    // Central Question & Answer Counter (FAZ-58.3)
    const fnAnsweredCount = visibleQuestions.filter((q) => isValidAnswer(answersMap.get(q.id))).length;
    const fnTotalCount = loadedPack ? visibleQuestions.filter((q) => q.required).length : 0;
    const fnProgressPercentage = fnTotalCount > 0
      ? Math.round((fnAnsweredCount / fnTotalCount) * 100)
      : (fnAnsweredCount > 0 ? 100 : 0);

    totalQuestionsCount += fnTotalCount;
    answeredQuestionsCount += fnAnsweredCount;

    // Scope Item
    reportScope.push({
      code: fn.code,
      nameTr: fn.name_tr,
      nameEn: fn.name_en,
      category: fn.category,
      departmentName: fn.company_department_name || null,
      responsiblePerson: fn.responsible_person || null,
      status: fn.status,
      hasPack: !!loadedPack,
      progressPercentage: fnProgressPercentage,
      answeredCount: fnAnsweredCount,
      totalQuestionCount: fnTotalCount,
    });

    // Semantic items for this function
    const fnFindings: ReportFinding[] = findings
      .filter((f) => f.business_function_code === fn.code)
      .map((f) => ({
        id: f.id,
        title: f.title,
        description: f.description,
        priority: f.priority,
        status: f.status,
        questionId: f.question_id,
        sourceQuestionText: getResolvedQuestionText(f.question_id, fn.code),
        createdAt: f.created_at,
      }));

    const fnRequirements: ReportRequirement[] = requirements
      .filter((r) => r.business_function_code === fn.code)
      .map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        priority: r.priority,
        status: r.status,
        questionId: r.question_id,
        sourceQuestionText: getResolvedQuestionText(r.question_id, fn.code),
        createdAt: r.created_at,
      }));

    const fnRisks: ReportRisk[] = risks
      .filter((r) => r.business_function_code === fn.code)
      .map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        impact: r.impact,
        probability: r.probability,
        mitigationNote: r.mitigation_note,
        status: r.status,
        questionId: r.question_id,
        sourceQuestionText: getResolvedQuestionText(r.question_id, fn.code),
        createdAt: r.created_at,
      }));

    const fnNotes: ReportProjectNote[] = notes
      .filter((n) => n.business_function_code === fn.code)
      .map((n) => ({
        id: n.id,
        note: n.note,
        businessFunctionCode: n.business_function_code,
        questionId: n.question_id,
        sourceQuestionText: getResolvedQuestionText(n.question_id, fn.code),
        createdAt: n.created_at,
      }));

    // Group Questions by Process
    const processMap = new Map<string, { order: number; questions: ReportQuestionItem[] }>();

    for (const q of visibleQuestions) {
      const ans = answersMap.get(q.id);
      const fol = fnFollowupsMap.get(q.id);
      const formattedAns = formatAnswer(q, ans);

      if (!includeUnanswered && !formattedAns.isAnswered && !fol) {
        continue; // Skip unanswered question if option not set and no followup
      }

      // Find semantic items linked to this specific question
      const qFindings = fnFindings.filter((f) => f.questionId === q.id);
      const qRequirements = fnRequirements.filter((r) => r.questionId === q.id);
      const qRisks = fnRisks.filter((r) => r.questionId === q.id);
      const qNotes = fnNotes.filter((n) => n.questionId === q.id);

      // Find attachment items linked to this specific question (FAZ-33)
      const qAttachments: ReportAttachmentItem[] = dbAttachments
        .filter((a) => a.business_function_code === fn.code && a.question_id === q.id)
        .map((a) => ({
          id: a.id,
          businessFunctionCode: a.business_function_code,
          businessFunctionNameTr: fn.name_tr,
          processName: q.process,
          questionId: a.question_id,
          questionText: q.question,
          originalFileName: a.original_file_name,
          storedFileName: a.stored_file_name,
          relativePath: a.relative_path,
          fileUrl: attachmentUrlMap.get(a.id) || "",
          mimeType: a.mime_type,
          fileExtension: a.file_extension,
          fileSize: a.file_size,
          sha256: a.sha256,
          description: a.description || null,
          createdAt: a.created_at,
        }));

      const qItem: ReportQuestionItem = {
        id: q.id,
        order: q.order,
        process: q.process,
        subProcess: q.sub_process,
        questionText: q.question,
        description: q.description,
        answerType: q.answer_type,
        criticality: q.criticality,
        isCustom: q.is_custom,
        followup: fol ? { flagType: fol.flag_type, note: fol.note } : null,
        attachments: qAttachments.length > 0 ? qAttachments : undefined,
        formattedAnswer: formattedAns,
        findings: qFindings,
        requirements: qRequirements,
        risks: qRisks,
        notes: qNotes,
      };

      if (!processMap.has(q.process)) {
        processMap.set(q.process, { order: q.order, questions: [] });
      }
      processMap.get(q.process)!.questions.push(qItem);
    }

    // Sort processes deterministically by their lowest question order
    const reportProcesses: ReportProcess[] = Array.from(processMap.entries())
      .map(([name, data]) => ({
        name,
        order: data.order,
        questions: data.questions.sort((a, b) => a.order - b.order),
      }))
      .sort((a, b) => a.order - b.order);

    const hasDetailContent =
      fn.status !== "not_started" ||
      !!loadedPack ||
      reportProcesses.length > 0 ||
      fnFindings.length > 0 ||
      fnRequirements.length > 0 ||
      fnRisks.length > 0 ||
      fnNotes.length > 0 ||
      fnFollowupsMap.size > 0;

    if (hasDetailContent) {
      reportFunctions.push({
        code: fn.code,
        nameTr: fn.name_tr,
        nameEn: fn.name_en,
        category: fn.category,
        sortOrder: fn.sort_order,
        departmentName: fn.company_department_name || null,
        responsiblePerson: fn.responsible_person || null,
        status: fn.status,
        packId: loadedPack?.meta.pack_id || null,
        packVersion: loadedPack?.meta.version || null,
        progressPercentage: fnProgressPercentage,
        answeredCount: fnAnsweredCount,
        totalQuestionCount: fnTotalCount,
        processes: reportProcesses,
        findings: fnFindings,
        requirements: fnRequirements,
        risks: fnRisks,
        notes: fnNotes,
      });
    };
  }

  // Sort business functions deterministically by sortOrder
  reportFunctions.sort((a, b) => a.sortOrder - b.sortOrder);
  reportScope.sort((a, b) => {
    const fnA = functions.find((f) => f.code === a.code);
    const fnB = functions.find((f) => f.code === b.code);
    return (fnA?.sort_order ?? 0) - (fnB?.sort_order ?? 0);
  });

  // Global / project-level items
  const mapFinding = (f: Finding): ReportFinding => ({
    id: f.id,
    title: f.title,
    description: f.description,
    priority: f.priority,
    status: f.status,
    questionId: f.question_id,
    sourceQuestionText: getResolvedQuestionText(f.question_id, f.business_function_code),
    createdAt: f.created_at,
  });

  const mapRequirement = (r: Requirement): ReportRequirement => ({
    id: r.id,
    title: r.title,
    description: r.description,
    priority: r.priority,
    status: r.status,
    questionId: r.question_id,
    sourceQuestionText: getResolvedQuestionText(r.question_id, r.business_function_code),
    createdAt: r.created_at,
  });

  const mapRisk = (r: Risk): ReportRisk => ({
    id: r.id,
    title: r.title,
    description: r.description,
    impact: r.impact,
    probability: r.probability,
    mitigationNote: r.mitigation_note,
    status: r.status,
    questionId: r.question_id,
    sourceQuestionText: getResolvedQuestionText(r.question_id, r.business_function_code),
    createdAt: r.created_at,
  });

  const mapNote = (n: ProjectNote): ReportProjectNote => ({
    id: n.id,
    note: n.note,
    businessFunctionCode: n.business_function_code,
    questionId: n.question_id,
    sourceQuestionText: getResolvedQuestionText(n.question_id, n.business_function_code),
    createdAt: n.created_at,
  });

  const globalFindings = findings.filter((f) => !f.business_function_code).map(mapFinding);
  const globalRequirements = requirements.filter((r) => !r.business_function_code).map(mapRequirement);
  const globalRisks = risks.filter((r) => !r.business_function_code).map(mapRisk);
  const projectNotes = notes.map(mapNote);

  // Build report followups list (FAZ-9)
  const reportFollowups: ReportFollowupItem[] = dbFollowups.map((f) => {
    const bf = functions.find((fn) => fn.code === f.business_function_code);
    return {
      id: f.id,
      businessFunctionCode: f.business_function_code,
      businessFunctionNameTr: bf ? bf.name_tr : f.business_function_code,
      processName: getResolvedProcessName(f.question_id, f.business_function_code, "Genel Süreç"),
      questionId: f.question_id,
      questionText: getResolvedQuestionText(f.question_id, f.business_function_code) || f.question_id,
      flagType: f.flag_type,
      note: f.note,
      createdAt: f.created_at,
    };
  });

  const revisitCount = dbFollowups.filter((f) => f.flag_type === "revisit").length;
  const criticalFollowupCount = dbFollowups.filter((f) => f.flag_type === "critical").length;

  // Summary stats
  const completedFunctions = functions.filter((f) => f.status === "completed").length;
  const inProgressFunctions = functions.filter((f) => f.status === "in_progress").length;
  const notStartedFunctions = functions.filter((f) => f.status === "not_started").length;
  const openRisks = risks.filter((r) => r.status === "open").length;

  // Build report attachments list (FAZ-33)
  const reportAttachments: ReportAttachmentItem[] = dbAttachments.map((a) => {
    const bf = functions.find((fn) => fn.code === a.business_function_code);
    return {
      id: a.id,
      businessFunctionCode: a.business_function_code,
      businessFunctionNameTr: bf ? bf.name_tr : a.business_function_code,
      processName: getResolvedProcessName(a.question_id, a.business_function_code, "Genel Süreç"),
      questionId: a.question_id,
      questionText: getResolvedQuestionText(a.question_id, a.business_function_code) || `Soru (${a.question_id})`,
      originalFileName: a.original_file_name,
      storedFileName: a.stored_file_name,
      relativePath: a.relative_path,
      fileUrl: attachmentUrlMap.get(a.id) || "",
      mimeType: a.mime_type,
      fileExtension: a.file_extension,
      fileSize: a.file_size,
      sha256: a.sha256,
      description: a.description || null,
      createdAt: a.created_at,
    };
  });

  const progressPercent =
    totalQuestionsCount > 0
      ? Math.round((answeredQuestionsCount / totalQuestionsCount) * 100)
      : 0;

  const summaryStats: ReportSummaryStats = {
    totalFunctions: functions.length,
    activeFunctionCount: functions.length,
    completedFunctions,
    completedFunctionCount: completedFunctions,
    inProgressFunctions,
    inProgressFunctionCount: inProgressFunctions,
    notStartedFunctions,
    notStartedFunctionCount: notStartedFunctions,
    totalFindings: findings.length,
    findingCount: findings.length,
    totalRequirements: requirements.length,
    requirementCount: requirements.length,
    openRisks,
    openRiskCount: openRisks,
    totalRisks: risks.length,
    totalRiskCount: risks.length,
    totalNotes: notes.length,
    answeredQuestions: answeredQuestionsCount,
    answeredQuestionCount: answeredQuestionsCount,
    totalQuestions: totalQuestionsCount,
    totalQuestionCount: totalQuestionsCount,
    questionProgressPercent: progressPercent,
    openFollowupCount: dbFollowups.length,
    revisitCount,
    criticalFollowupCount,
    totalAttachmentCount: dbAttachments.length,
    totalAttachmentSizeBytes: dbAttachments.reduce((sum, a) => sum + (a.file_size || 0), 0),
  };

  // Honest project-wide scope metrics (FAZ-10)
  const selectedFunctionCount = functions.length;
  const completedFunctionCount = completedFunctions;
  const projectProgressPercent =
    selectedFunctionCount > 0
      ? Math.round((completedFunctionCount / selectedFunctionCount) * 100)
      : 0;

  const isProjectComplete =
    selectedFunctionCount > 0
      ? (completedFunctionCount === selectedFunctionCount && notStartedFunctions === 0 && inProgressFunctions === 0 && dbFollowups.length === 0)
      : false;

  const isComplete = isProjectComplete;
  const reportType: "interim" | "final" = isComplete ? "final" : "interim";

  let draftLabel = "FİNAL RAPOR";
  if (!isComplete) {
    if (completedFunctionCount > 0) {
      const suffix = getTurkishAccusativeSuffix(completedFunctionCount);
      draftLabel = `ARA RAPOR — ${selectedFunctionCount} iş fonksiyonundan ${completedFunctionCount}’${suffix} tamamlandı (Soru İlerlemesi: %${progressPercent})`;
    } else {
      draftLabel = `ARA RAPOR — Analiz devam ediyor (%${progressPercent})`;
    }
  }

  const metadata: ReportMetadata = {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: project.name,
    companyName: company.company_name,
    generatedAt,
    projectStatus: project.status,
    packVersions,
    isComplete,
    progressPercent,
    requiredAnswered: answeredQuestionsCount,
    requiredTotal: totalQuestionsCount,
    reportType,
    draftLabel,
    projectProgressPercent,
    completedFunctionCount,
    selectedFunctionCount,
    isProjectComplete,
  };

  const reportCompany: ReportCompany = {
    companyName: company.company_name,
    tradeName: company.trade_name || null,
    taxNumber: company.tax_number || null,
    city: company.city || null,
    country: company.country || "Türkiye",
    employeeCount: formatEmployeeCount(company.employee_count),
    businessSector: company.business_sector || null,
    hasBranches: company.has_branches || null,
    branchCount: company.branch_count ?? null,
    notes: company.notes || null,
  };

  const profile: ReportProfile = {
    analysis_project_id: projectId,
    executive_summary: reportProfile?.executive_summary || null,
    overall_assessment: reportProfile?.overall_assessment || null,
    open_topics: reportProfile?.open_topics || null,
    created_at: reportProfile?.created_at,
    updated_at: reportProfile?.updated_at,
  };

  const reportGovernance =
    govObjects.length > 0 ||
    govResponsibilities.length > 0 ||
    govAuthorizations.length > 0 ||
    govLimits.length > 0 ||
    govSodRisks.length > 0 ||
    govAttachments.length > 0
      ? {
          summary: govSummary,
          objects: govObjects,
          responsibilities: govResponsibilities,
          authorizations: govAuthorizations,
          limits: govLimits,
          sodRisks: govSodRisks,
          attachments: govAttachments,
        }
      : undefined;

  // 12. Schedule Summary Calculation (FAZ-59)
  const projSchedStatus = calculateScheduleStatus({
    plannedStartDate: detailData.project.planned_start_date,
    plannedEndDate: detailData.project.planned_end_date,
    actualStartDate: detailData.project.actual_start_date,
    actualEndDate: detailData.project.actual_end_date,
  });

  const activeFunctions = detailData.functions.filter((f) => f.is_active !== 0);
  const functionSchedules: ReportScheduleItem[] = activeFunctions.map((f) => {
    const fStatus = calculateScheduleStatus(
      {
        plannedStartDate: f.planned_start_date,
        plannedEndDate: f.planned_end_date,
        actualStartDate: f.actual_start_date,
        actualEndDate: f.actual_end_date,
      },
      f.status
    );
    return {
      code: f.code,
      nameTr: f.name_tr,
      processStatus: f.status,
      plannedStartDate: f.planned_start_date || null,
      plannedEndDate: f.planned_end_date || null,
      actualStartDate: f.actual_start_date || null,
      actualEndDate: f.actual_end_date || null,
      plannedRangeSummary: formatDateRangeSummary(f.planned_start_date, f.planned_end_date),
      actualRangeSummary: formatDateRangeSummary(f.actual_start_date, f.actual_end_date),
      scheduleStatus: fStatus.status,
      scheduleStatusLabel: fStatus.label,
      scheduleStatusBadgeClass: fStatus.badgeClass,
      delayDays: fStatus.delayDays,
      remainingDays: fStatus.remainingDays,
      delaySummary: fStatus.summaryText,
    };
  });

  const scheduleStats = {
    totalPlanned: functionSchedules.filter((s) => s.scheduleStatus !== "not_planned").length,
    completedOnTime: functionSchedules.filter((s) => s.scheduleStatus === "completed_on_time").length,
    completedLate: functionSchedules.filter((s) => s.scheduleStatus === "completed_late").length,
    onTrack: functionSchedules.filter((s) => s.scheduleStatus === "on_track").length,
    dueSoon: functionSchedules.filter((s) => s.scheduleStatus === "due_soon").length,
    overdue: functionSchedules.filter((s) => s.scheduleStatus === "overdue").length,
    notStarted: functionSchedules.filter((s) => s.scheduleStatus === "not_started" || s.scheduleStatus === "planned").length,
    notPlanned: functionSchedules.filter((s) => s.scheduleStatus === "not_planned").length,
  };

  const scheduleSummary: ReportScheduleSummary = {
    projectSchedule: {
      plannedStartDate: detailData.project.planned_start_date || null,
      plannedEndDate: detailData.project.planned_end_date || null,
      actualStartDate: detailData.project.actual_start_date || null,
      actualEndDate: detailData.project.actual_end_date || null,
      plannedRangeSummary: formatDateRangeSummary(detailData.project.planned_start_date, detailData.project.planned_end_date),
      actualRangeSummary: formatDateRangeSummary(detailData.project.actual_start_date, detailData.project.actual_end_date),
      scheduleStatus: projSchedStatus.status,
      scheduleStatusLabel: projSchedStatus.label,
      scheduleStatusBadgeClass: projSchedStatus.badgeClass,
      delayDays: projSchedStatus.delayDays,
      remainingDays: projSchedStatus.remainingDays,
      delaySummary: projSchedStatus.summaryText,
    },
    functionSchedules,
    stats: scheduleStats,
  };

  // OT İstasyonları Özeti (FAZ-62B)
  let otStationsSummary: ReportOtStationsSummary | undefined = undefined;
  if (otStations && otStations.length > 0) {
    const activeCount = otStations.filter((s) => s.status === "active").length;
    const areas = new Set(
      otStations.map((s) => s.area_name?.trim()).filter((a): a is string => Boolean(a))
    );
    const lines = new Set(
      otStations.map((s) => s.line_name?.trim()).filter((l): l is string => Boolean(l))
    );
    otStationsSummary = {
      totalStations: otStations.length,
      activeStations: activeCount,
      areaCount: areas.size,
      lineCount: lines.size,
      stations: otStations.map((s) => ({
        id: s.id,
        stationCode: s.station_code,
        stationName: s.station_name,
        areaName: s.area_name || null,
        lineName: s.line_name || null,
        stationType: s.station_type || null,
        machineName: s.machine_name || null,
        machineManufacturer: s.machine_manufacturer || null,
        machineModel: s.machine_model || null,
        plcOrController: s.plc_or_controller || null,
        operatorCount: s.operator_count ?? null,
        status: s.status === "active" ? "Aktif" : "Pasif",
      })),
    };
  }

  // OT Veri Gereksinimleri, Alarm ve Kalite Cihazları Matrisi (FAZ-62C)
  let otMatrixSummary: ReportOtMatrixSummary | undefined = undefined;
  if (
    (otDataReqs && otDataReqs.length > 0) ||
    (otAlarmReqs && otAlarmReqs.length > 0) ||
    (otQualityDevs && otQualityDevs.length > 0)
  ) {
    const stationMap = new Map<string, { code: string; name: string }>();
    for (const st of otStations || []) {
      stationMap.set(st.id, { code: st.station_code, name: st.station_name });
    }

    otMatrixSummary = {
      stats: otMatrixCounts,
      dataRequirements: (otDataReqs || []).map((d) => {
        const st = stationMap.get(d.station_id);
        return {
          id: d.id,
          stationId: d.station_id,
          stationCode: st ? st.code : "OT-ST",
          stationName: st ? st.name : "İstasyon",
          purpose: d.purpose,
          decisionSupported: d.decision_supported,
          requiredAction: d.required_action,
          dataCategory: d.data_category || null,
          measurementName: d.measurement_name,
          sourceType: d.source_type || null,
          sourceName: d.source_name || null,
          collectionMethod: d.collection_method || null,
          frequency: d.frequency || null,
          criticality: d.criticality || "medium",
          targetSystem: d.target_system || null,
          retentionRequired: Boolean(d.retention_required),
          retentionPeriod: d.retention_period || null,
          businessValue: d.business_value || null,
          integrationComplexity: d.integration_complexity || "medium",
          priority: d.priority || "medium",
          status: d.status === "active" ? "Aktif" : "Pasif",
          notes: d.notes || null,
        };
      }),
      alarmRequirements: (otAlarmReqs || []).map((a) => {
        const st = stationMap.get(a.station_id);
        return {
          id: a.id,
          stationId: a.station_id,
          stationCode: st ? st.code : "OT-ST",
          stationName: st ? st.name : "İstasyon",
          alarmName: a.alarm_name,
          alarmCode: a.alarm_code || null,
          sourceType: a.source_type || null,
          triggerCondition: a.trigger_condition || null,
          severity: a.severity || "warning",
          safetyCritical: Boolean(a.safety_critical),
          responsibleRole: a.responsible_role || null,
          responseSla: a.response_sla || null,
          requiredAction: a.required_action || null,
          acknowledgementRequired: Boolean(a.acknowledgement_required),
          escalationRequired: Boolean(a.escalation_required),
          targetSystem: a.target_system || null,
          status: a.status === "active" ? "Aktif" : "Pasif",
          notes: a.notes || null,
        };
      }),
      qualityDevices: (otQualityDevs || []).map((q) => {
        const st = stationMap.get(q.station_id);
        return {
          id: q.id,
          stationId: q.station_id,
          stationCode: st ? st.code : "OT-ST",
          stationName: st ? st.name : "İstasyon",
          deviceName: q.device_name,
          deviceType: q.device_type || null,
          manufacturer: q.manufacturer || null,
          model: q.model || null,
          outputFormat: q.output_format || null,
          interfaceType: q.interface_type || null,
          apiAvailable: Boolean(q.api_available),
          networkShareAvailable: Boolean(q.network_share_available),
          testResultAvailable: Boolean(q.test_result_available),
          passFailAvailable: Boolean(q.pass_fail_available),
          measurementValuesAvailable: Boolean(q.measurement_values_available),
          productCodeAvailable: Boolean(q.product_code_available),
          lotBatchAvailable: Boolean(q.lot_batch_available),
          operatorAvailable: Boolean(q.operator_available),
          integrationMethod: q.integration_method || null,
          targetSystem: q.target_system || null,
          status: q.status === "active" ? "Aktif" : "Pasif",
          notes: q.notes || null,
        };
      }),
    };
  }

  return {
    metadata,
    profile,
    company: reportCompany,
    scope: reportScope,
    businessFunctions: reportFunctions,
    followups: reportFollowups,
    attachments: reportAttachments,
    governance: reportGovernance,
    scheduleSummary,
    otStationsSummary,
    otMatrixSummary,
    globalFindings,
    globalRequirements,
    globalRisks,
    projectNotes,
    summaryStats,
  };
}

