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
} from "../db/client";
import { loadQuestionPack, getPackIdForFunction } from "../engine/loader";
import { getVisibleQuestions } from "../engine/branching";
import { calculateProgress } from "../engine/progress";
import { formatAnswer } from "./formatters";
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
} from "./types";
import type { QuestionPack, Question } from "../engine/types";
import type { Finding, Requirement, Risk, ProjectNote } from "../types";

export interface BuildReportOptions {
  includeUnanswered?: boolean;
}

export async function buildReportModel(
  projectId: string,
  options: BuildReportOptions = {}
): Promise<ReportModel> {
  const includeUnanswered = options.includeUnanswered ?? false;

  // 1. Fetch core data in parallel
  const [detailData, reportProfile, findings, requirements, risks, notes] = await Promise.all([
    getProjectDetail(projectId),
    getReportProfile(projectId),
    getFindings(projectId),
    getRequirements(projectId),
    getRisks(projectId),
    getProjectNotes(projectId),
  ]);

  if (!detailData) {
    throw new Error(`Analiz projesi bulunamadı: ${projectId}`);
  }

  const { project, company, functions } = detailData;

  // 2. Format Metadata
  const now = new Date();
  const generatedAt = now.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const packVersions: Record<string, string> = {};

  // 3. Question lookup map for source question text resolution
  const questionTextMap = new Map<string, string>();

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
          questionTextMap.set(q.id, q.question);
        }
      }
    }

    // Answers
    const answersMap = loadedPack
      ? await getAllAnswers(projectId, fn.code)
      : new Map();

    // Visibility (Branching)
    const visibleQuestions: Question[] = loadedPack
      ? getVisibleQuestions(loadedPack.questions, answersMap)
      : [];

    const progress = loadedPack
      ? calculateProgress(visibleQuestions, answersMap)
      : { answered: 0, total: 0, percentage: 0 };

    totalQuestionsCount += progress.total;
    answeredQuestionsCount += progress.answered;

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
      progressPercentage: progress.percentage,
      answeredCount: progress.answered,
      totalQuestionCount: progress.total,
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
        sourceQuestionText: f.question_id ? questionTextMap.get(f.question_id) ?? null : null,
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
        sourceQuestionText: r.question_id ? questionTextMap.get(r.question_id) ?? null : null,
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
        sourceQuestionText: r.question_id ? questionTextMap.get(r.question_id) ?? null : null,
        createdAt: r.created_at,
      }));

    const fnNotes: ReportProjectNote[] = notes
      .filter((n) => n.business_function_code === fn.code)
      .map((n) => ({
        id: n.id,
        note: n.note,
        businessFunctionCode: n.business_function_code,
        questionId: n.question_id,
        sourceQuestionText: n.question_id ? questionTextMap.get(n.question_id) ?? null : null,
        createdAt: n.created_at,
      }));

    // Group Questions by Process
    const processMap = new Map<string, { order: number; questions: ReportQuestionItem[] }>();

    for (const q of visibleQuestions) {
      const ans = answersMap.get(q.id);
      const formattedAns = formatAnswer(q, ans);

      if (!includeUnanswered && !formattedAns.isAnswered) {
        continue; // Skip unanswered question if option not set
      }

      // Find semantic items linked to this specific question
      const qFindings = fnFindings.filter((f) => f.questionId === q.id);
      const qRequirements = fnRequirements.filter((r) => r.questionId === q.id);
      const qRisks = fnRisks.filter((r) => r.questionId === q.id);
      const qNotes = fnNotes.filter((n) => n.questionId === q.id);

      const qItem: ReportQuestionItem = {
        id: q.id,
        order: q.order,
        process: q.process,
        subProcess: q.sub_process,
        questionText: q.question,
        description: q.description,
        answerType: q.answer_type,
        criticality: q.criticality,
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
      progressPercentage: progress.percentage,
      answeredCount: progress.answered,
      totalQuestionCount: progress.total,
      processes: reportProcesses,
      findings: fnFindings,
      requirements: fnRequirements,
      risks: fnRisks,
      notes: fnNotes,
    });
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
    sourceQuestionText: f.question_id ? questionTextMap.get(f.question_id) ?? null : null,
    createdAt: f.created_at,
  });

  const mapRequirement = (r: Requirement): ReportRequirement => ({
    id: r.id,
    title: r.title,
    description: r.description,
    priority: r.priority,
    status: r.status,
    questionId: r.question_id,
    sourceQuestionText: r.question_id ? questionTextMap.get(r.question_id) ?? null : null,
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
    sourceQuestionText: r.question_id ? questionTextMap.get(r.question_id) ?? null : null,
    createdAt: r.created_at,
  });

  const mapNote = (n: ProjectNote): ReportProjectNote => ({
    id: n.id,
    note: n.note,
    businessFunctionCode: n.business_function_code,
    questionId: n.question_id,
    sourceQuestionText: n.question_id ? questionTextMap.get(n.question_id) ?? null : null,
    createdAt: n.created_at,
  });

  const globalFindings = findings.map(mapFinding);
  const globalRequirements = requirements.map(mapRequirement);
  const globalRisks = risks.map(mapRisk);
  const projectNotes = notes.map(mapNote);

  // Summary stats
  const completedFunctions = functions.filter((f) => f.status === "completed").length;
  const inProgressFunctions = functions.filter((f) => f.status === "in_progress").length;
  const notStartedFunctions = functions.filter((f) => f.status === "not_started").length;
  const openRisks = risks.filter((r) => r.status === "open").length;

  const summaryStats: ReportSummaryStats = {
    totalFunctions: functions.length,
    completedFunctions,
    inProgressFunctions,
    notStartedFunctions,
    totalFindings: findings.length,
    totalRequirements: requirements.length,
    openRisks,
    totalRisks: risks.length,
    totalNotes: notes.length,
    answeredQuestions: answeredQuestionsCount,
    totalQuestions: totalQuestionsCount,
  };

  const metadata: ReportMetadata = {
    title: "ERP / CRM Ön Analiz Raporu",
    projectName: project.name,
    companyName: company.company_name,
    generatedAt,
    projectStatus: project.status,
    packVersions,
  };

  const reportCompany: ReportCompany = {
    companyName: company.company_name,
    tradeName: company.trade_name || null,
    taxNumber: company.tax_number || null,
    city: company.city || null,
    country: company.country || "Türkiye",
    employeeCount: company.employee_count || null,
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

  return {
    metadata,
    profile,
    company: reportCompany,
    scope: reportScope,
    businessFunctions: reportFunctions,
    globalFindings,
    globalRequirements,
    globalRisks,
    projectNotes,
    summaryStats,
  };
}
