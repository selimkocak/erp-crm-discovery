/**
 * ERP CRM Discovery — QuestionScreen
 *
 * Step-by-step soru ekranı. Tek anda bir soru gösterir.
 * FAZ-7 + FAZ-8: Resumable Analysis, Question Navigator & Project Custom Questions.
 *
 * 1. Autosave Guarantee: Her cevap anında hafızaya, kısa debounce ile SQLite'a yazılır.
 * 2. Question Navigator: Sol tarafta gizlenebilir çekmece/sidebar ile soruları listeler ve doğrudan atlama sağlar.
 * 3. Project Custom Questions: Proje yöneticisinin bu analize özel soru ekleyebilmesini sağlar (Canonical paketler dokunulmazdır).
 * 4. Exit Anytime & Flush: "Kaydet ve Çık" veya navigasyonda bekleyen tüm kayıtlar anında diske yazılır.
 * 5. Session State: Son kalınan soru ID'si kaydedilir; sonraki gelişte aynı sorudan devam edilir.
 * 6. Ara Rapor (Interim Report): İstendiği an mevcut ilerleme ile ara rapor görüntülenebilir/dışa aktarılabilir.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Search,
  CheckSquare,
  AlertTriangle,
  StickyNote,
  Save,
  FileText,
  Layers,
  PlusCircle,
} from "lucide-react";
import type { QuestionPack, AnswerData, Question } from "../engine/types";
import type {
  SemanticRecordType,
  Finding,
  Requirement,
  Risk,
  ProjectNote,
  ProjectCustomQuestion,
  QuestionFollowup,
  FollowupFlagType,
  QuestionAttachment,
} from "../types";
import {
  saveAnswer,
  getAllAnswers,
  saveLastQuestionId,
  getLastQuestionId,
  updateFunctionStatusByCode,
  getFindings,
  getRequirements,
  getRisks,
  getProjectNotes,
  getCustomQuestions,
  getCustomAnswers,
  saveCustomAnswer,
  deleteCustomQuestion,
  getQuestionFollowups,
  setQuestionFollowup,
  removeQuestionFollowup,
  getProjectAttachments,
  deleteQuestionAttachment,
  updateAttachmentDescription,
} from "../db/client";
import {
  importFileToManagedVault,
  reimportAttachmentFile,
  deleteAttachmentFile,
} from "../storage/attachmentManager";
import { getVisibleQuestions } from "../engine/branching";
import { adaptCustomQuestionToQuestion } from "../engine/customQuestionAdapter";
import { calculateProgress, isQuestionAnswered, canAdvanceToNextQuestion, progressToStatus } from "../engine/progress";
import { QuestionCard } from "../components/QuestionCard";
import { ProgressBar } from "../components/ProgressBar";
import { SaveStatusIndicator } from "../components/SaveStatusIndicator";
import { SemanticModal } from "../components/SemanticModal";
import { QuestionNavigator } from "../components/QuestionNavigator";
import { CustomQuestionModal } from "../components/CustomQuestionModal";
import { FollowupModal } from "../components/FollowupModal";

interface QuestionScreenProps {
  projectId: string;
  bfCode: string;
  bfNameTr: string;
  pack: QuestionPack;
  onBack: () => void;
  onOpenReport?: () => void;
}

const AUTOSAVE_DEBOUNCE_MS = 600;

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  projectId,
  bfCode,
  bfNameTr,
  pack,
  onBack,
  onOpenReport,
}) => {
  const [answers, setAnswers] = useState<Map<string, AnswerData>>(new Map());
  const [customQuestions, setCustomQuestions] = useState<ProjectCustomQuestion[]>([]);
  const [followups, setFollowups] = useState<Map<string, QuestionFollowup>>(new Map());
  const [attachmentsMap, setAttachmentsMap] = useState<Map<string, QuestionAttachment[]>>(new Map());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [showValidation, setShowValidation] = useState<boolean>(false);

  // Navigator Sidebar State
  const [isNavigatorOpen, setIsNavigatorOpen] = useState<boolean>(false);

  // Custom Question Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [editingCustomQuestion, setEditingCustomQuestion] = useState<ProjectCustomQuestion | null>(null);

  // Followup Modal State (FAZ-9)
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState<boolean>(false);
  const [followupModalTarget, setFollowupModalTarget] = useState<{
    question: Question;
    initialFlagType?: FollowupFlagType;
  } | null>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<{ qId: string; data: AnswerData; isCustom?: boolean } | null>(null);

  // Soruya bağlı semantik kayıtlar
  const [questionFindings, setQuestionFindings] = useState<Finding[]>([]);
  const [questionRequirements, setQuestionRequirements] = useState<Requirement[]>([]);
  const [questionRisks, setQuestionRisks] = useState<Risk[]>([]);
  const [questionNotes, setQuestionNotes] = useState<ProjectNote[]>([]);

  // Semantic Modal State
  const [isSemanticModalOpen, setIsSemanticModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<SemanticRecordType>("finding");

  // ── Başlangıç yüklemesi ────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [
        existingCanonicalAnswers,
        existingCustomAnswers,
        dbCustomQuestions,
        dbFollowups,
        dbAttachments,
        lastQId,
      ] = await Promise.all([
        getAllAnswers(projectId, bfCode),
        getCustomAnswers(projectId, bfCode),
        getCustomQuestions(projectId, bfCode),
        getQuestionFollowups(projectId, bfCode),
        getProjectAttachments(projectId),
        getLastQuestionId(projectId, bfCode),
      ]);

      // Merge canonical and custom answers into unified map
      const mergedAnswers = new Map<string, AnswerData>(existingCanonicalAnswers);
      for (const [qId, ans] of existingCustomAnswers.entries()) {
        mergedAnswers.set(qId, ans);
      }

      // Group attachments by questionId for this business function
      const attMap = new Map<string, QuestionAttachment[]>();
      for (const a of dbAttachments) {
        if (a.business_function_code === bfCode) {
          const list = attMap.get(a.question_id) || [];
          list.push(a);
          attMap.set(a.question_id, list);
        }
      }

      setAnswers(mergedAnswers);
      setCustomQuestions(dbCustomQuestions);
      setFollowups(dbFollowups);
      setAttachmentsMap(attMap);

      // Build initial question list to resolve lastQId
      const canonicalVisible = getVisibleQuestions(pack.questions, mergedAnswers);
      const adaptedCustom = dbCustomQuestions.map((cq, idx) =>
        adaptCustomQuestionToQuestion(cq, pack.questions.length + idx + 1)
      );
      const allQuestions = [...canonicalVisible, ...adaptedCustom];

      // Kaldığı yerden devam (Resume)
      if (lastQId) {
        const idx = allQuestions.findIndex((q) => q.id === lastQId);
        if (idx >= 0) setCurrentIndex(idx);
      }
    } catch (err) {
      console.error("Sorular ve cevaplar yüklenemedi:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, bfCode, pack.questions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Görünür sorular (Canonical branching + Custom Questions) ───────────
  const visibleQuestions: Question[] = useMemo(() => {
    const canonicalVisible = getVisibleQuestions(pack.questions, answers);
    const adaptedCustom = customQuestions.map((cq, idx) =>
      adaptCustomQuestionToQuestion(cq, pack.questions.length + idx + 1)
    );
    return [...canonicalVisible, ...adaptedCustom];
  }, [pack.questions, answers, customQuestions]);

  const safeIndex = Math.min(currentIndex, Math.max(0, visibleQuestions.length - 1));
  const currentQuestion = visibleQuestions[safeIndex] ?? null;

  // ── Soruya bağlı semantik kayıtları getir ──────────────────────────────
  const loadQuestionSemanticItems = useCallback(async () => {
    if (!currentQuestion) return;
    try {
      const [fList, rList, rskList, nList] = await Promise.all([
        getFindings(projectId, bfCode, currentQuestion.id),
        getRequirements(projectId, bfCode, currentQuestion.id),
        getRisks(projectId, bfCode, currentQuestion.id),
        getProjectNotes(projectId, bfCode, currentQuestion.id),
      ]);
      setQuestionFindings(fList);
      setQuestionRequirements(rList);
      setQuestionRisks(rskList);
      setQuestionNotes(nList);
    } catch (err) {
      console.error("Soru semantik kayıtları yüklenemedi:", err);
    }
  }, [projectId, bfCode, currentQuestion]);

  useEffect(() => {
    loadQuestionSemanticItems();
  }, [loadQuestionSemanticItems]);

  // ── İlerleme (Bayraklı sorular tamamlandı sayılmaz) ──────────────────────
  const progress = calculateProgress(visibleQuestions, answers, followups);

  const revisitCount = useMemo(() => {
    let count = 0;
    for (const fol of followups.values()) {
      if ((!fol.status || fol.status === "open") && fol.flag_type === "revisit") count++;
    }
    return count;
  }, [followups]);

  const criticalCount = useMemo(() => {
    let count = 0;
    for (const fol of followups.values()) {
      if ((!fol.status || fol.status === "open") && fol.flag_type === "critical") count++;
    }
    return count;
  }, [followups]);

  // ── Gerçek DB Kayıt İcrası ─────────────────────────────────────────────
  const executeDbSave = useCallback(
    async (qId: string, data: AnswerData, isCustom?: boolean) => {
      try {
        setSaveStatus("saving");
        if (isCustom) {
          await saveCustomAnswer(projectId, bfCode, qId, data);
        } else {
          await saveAnswer(
            projectId,
            bfCode,
            pack.meta.pack_id,
            pack.meta.version,
            qId,
            data
          );
        }
        // Durumu güncelle
        const newStatus = progressToStatus(progress.answered, progress.total);
        await updateFunctionStatusByCode(projectId, bfCode, newStatus);
        setSaveStatus("saved");
        setLastSavedAt(new Date());
        pendingSaveRef.current = null;
      } catch (err) {
        console.error("Cevap kaydedilemedi:", err);
        setSaveStatus("error");
      }
    },
    [projectId, bfCode, pack.meta, progress.answered, progress.total]
  );

  // ── Autosave Tetikleyici ────────────────────────────────────────────────
  const scheduleSave = useCallback(
    (qId: string, data: AnswerData, isCustom?: boolean) => {
      pendingSaveRef.current = { qId, data, isCustom };
      setSaveStatus("saving");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        await executeDbSave(qId, data, isCustom);
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [executeDbSave]
  );

  // ── Bekleyen Kaydı Anında Diske Yazma (Flush) ──────────────────────────
  const flushPendingSave = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    if (pendingSaveRef.current) {
      const { qId, data, isCustom } = pendingSaveRef.current;
      await executeDbSave(qId, data, isCustom);
    }
    if (currentQuestion) {
      try {
        await saveLastQuestionId(projectId, bfCode, currentQuestion.id);
      } catch {
        // Hata bastırma
      }
    }
  }, [executeDbSave, currentQuestion, projectId, bfCode]);

  // Window unload sırasında bekleyen varsa flush et
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingSaveRef.current) {
        flushPendingSave();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [flushPendingSave]);

  // ── Cevap değişimi ─────────────────────────────────────────────────────
  const handleAnswerChange = (updated: AnswerData) => {
    if (!currentQuestion) return;
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(currentQuestion.id, updated);
      return next;
    });
    scheduleSave(currentQuestion.id, updated, currentQuestion.is_custom);
  };

  // ── Tekil Navigasyon Fonksiyonu (Canonical Jump) ───────────────────────
  const jumpToQuestion = async (questionId: string) => {
    const targetIdx = visibleQuestions.findIndex((q) => q.id === questionId);
    if (targetIdx >= 0) {
      setShowValidation(false);
      await flushPendingSave();
      setCurrentIndex(targetIdx);
      try {
        await saveLastQuestionId(projectId, bfCode, questionId);
      } catch {}
    }
  };

  const goTo = async (idx: number) => {
    if (!currentQuestion) return;
    setShowValidation(false);
    await flushPendingSave();

    const targetIdx = Math.max(0, Math.min(idx, visibleQuestions.length - 1));
    setCurrentIndex(targetIdx);

    const targetQ = visibleQuestions[targetIdx];
    if (targetQ) {
      try {
        await saveLastQuestionId(projectId, bfCode, targetQ.id);
      } catch {}
    }
  };

  const handleNext = async () => {
    if (!currentQuestion) return;
    const canAdvance = canAdvanceToNextQuestion(
      currentQuestion,
      answers.get(currentQuestion.id),
      followups.get(currentQuestion.id)
    );
    if (!canAdvance) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    if (safeIndex < visibleQuestions.length - 1) {
      await goTo(safeIndex + 1);
    }
  };

  const handlePrev = async () => {
    if (safeIndex > 0) await goTo(safeIndex - 1);
  };

  const handleSaveAndExit = async () => {
    try {
      setSaveStatus("saving");
      await flushPendingSave();
      setSaveStatus("saved");
      onBack();
    } catch (err: any) {
      console.error("Kaydetme hatası:", err);
      setSaveStatus("error");
      alert(`Kaydetme sırasında bir hata oluştu: ${err?.message || "Bilinmeyen hata"}`);
    }
  };

  const handleOpenReportClick = async () => {
    await flushPendingSave();
    if (onOpenReport) {
      onOpenReport();
    }
  };

  // ── Özel Soru Yönetim Aksiyonları ──────────────────────────────────────
  const handleAddCustomQuestion = () => {
    setEditingCustomQuestion(null);
    setIsCustomModalOpen(true);
  };

  const handleEditCustomQuestion = (q: Question) => {
    const found = customQuestions.find((cq) => cq.id === q.id);
    if (found) {
      setEditingCustomQuestion(found);
      setIsCustomModalOpen(true);
    }
  };

  const handleDeleteCustomQuestion = async (q: Question) => {
    if (!window.confirm(`"${q.question}" özel sorusunu silmek istediğinizden emin misiniz?`)) {
      return;
    }
    try {
      await deleteCustomQuestion(q.id);
      await loadData();
      if (safeIndex >= visibleQuestions.length - 1) {
        setCurrentIndex(Math.max(0, safeIndex - 1));
      }
    } catch (err) {
      console.error("Özel soru silinemedi:", err);
    }
  };

  const handleOpenSemanticModal = (t: SemanticRecordType) => {
    setModalType(t);
    setIsSemanticModalOpen(true);
  };

  // Followup Handlers (FAZ-9)
  const handleOpenFollowup = (question: Question, flagType?: FollowupFlagType) => {
    setFollowupModalTarget({ question, initialFlagType: flagType ?? "revisit" });
    setIsFollowupModalOpen(true);
  };

  const handleSaveFollowup = async (flagType: FollowupFlagType, note: string) => {
    if (!followupModalTarget) return;
    const q = followupModalTarget.question;
    await setQuestionFollowup({
      analysis_project_id: projectId,
      business_function_code: bfCode,
      question_id: q.id,
      flag_type: flagType,
      note: note || null,
    });
    const updated = await getQuestionFollowups(projectId, bfCode);
    setFollowups(updated);
    const newProgress = calculateProgress(visibleQuestions, answers, updated);
    const newStatus = progressToStatus(newProgress.answered, newProgress.total);
    await updateFunctionStatusByCode(projectId, bfCode, newStatus);
  };

  const handleRemoveFollowup = async () => {
    if (!followupModalTarget) return;
    const q = followupModalTarget.question;
    await removeQuestionFollowup(projectId, bfCode, q.id);
    const updated = await getQuestionFollowups(projectId, bfCode);
    setFollowups(updated);
    const newProgress = calculateProgress(visibleQuestions, answers, updated);
    const newStatus = progressToStatus(newProgress.answered, newProgress.total);
    await updateFunctionStatusByCode(projectId, bfCode, newStatus);
  };

  // ── FAZ-33: Managed Attachment Vault Handlers ─────────────────────────
  const handleAddAttachment = async (
    questionId: string,
    file: { name: string; size: number; type: string; data: Uint8Array; sourcePath?: string },
    description?: string
  ) => {
    try {
      setSaveStatus("saving");
      const currentQAttachments = attachmentsMap.get(questionId) || [];
      const currentQuestionBytes = currentQAttachments.reduce((sum, a) => sum + (a.file_size || 0), 0);

      const result = await importFileToManagedVault({
        projectId,
        businessFunctionCode: bfCode,
        questionId,
        file,
        description,
        currentQuestionBytes,
      });

      if (result.isDuplicate && result.duplicateOf) {
        const confirmUse = window.confirm(
          `Bu dosya ("${result.duplicateOf.original_file_name}") projede daha önce yüklenmiş (SHA-256 eşleşti). Yine de bu soruya kanıt olarak eklemek istiyor musunuz?`
        );
        if (!confirmUse) {
          await deleteQuestionAttachment(result.attachment.id);
          await deleteAttachmentFile(result.attachment.relative_path);
          setSaveStatus("idle");
          return;
        }
      }

      // Update state
      setAttachmentsMap((prev) => {
        const next = new Map(prev);
        const list = [...(next.get(questionId) || []), result.attachment];
        next.set(questionId, list);
        return next;
      });

      setSaveStatus("saved");
      setLastSavedAt(new Date());
    } catch (err: any) {
      console.error("Kanıt eklenemedi:", err);
      setSaveStatus("error");
      throw err;
    }
  };

  const handleReimportAttachment = async (
    attachmentId: string,
    file: { name: string; size: number; type: string; data: Uint8Array; sourcePath?: string }
  ) => {
    if (!currentQuestion) return;
    try {
      setSaveStatus("saving");
      const updated = await reimportAttachmentFile(
        attachmentId,
        projectId,
        bfCode,
        currentQuestion.id,
        file
      );

      setAttachmentsMap((prev) => {
        const next = new Map<string, QuestionAttachment[]>();
        for (const [qId, list] of prev.entries()) {
          next.set(
            qId,
            list.map((a) => (a.id === attachmentId ? updated : a))
          );
        }
        return next;
      });

      setSaveStatus("saved");
      setLastSavedAt(new Date());
    } catch (err: any) {
      console.error("Kanıt yeniden içe aktarılamadı:", err);
      setSaveStatus("error");
      throw err;
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      setSaveStatus("saving");
      const deleted = await deleteQuestionAttachment(attachmentId);
      if (deleted) {
        await deleteAttachmentFile(deleted.relative_path);
        setAttachmentsMap((prev) => {
          const next = new Map(prev);
          const list = (next.get(deleted.question_id) || []).filter((a) => a.id !== attachmentId);
          next.set(deleted.question_id, list);
          return next;
        });
      }
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    } catch (err: any) {
      console.error("Kanıt silinemedi:", err);
      setSaveStatus("error");
      throw err;
    }
  };

  const handleUpdateAttachmentDescription = async (attachmentId: string, description: string) => {
    try {
      setSaveStatus("saving");
      await updateAttachmentDescription(attachmentId, description);
      setAttachmentsMap((prev) => {
        const next = new Map<string, QuestionAttachment[]>();
        for (const [qId, list] of prev.entries()) {
          next.set(
            qId,
            list.map((a) => (a.id === attachmentId ? { ...a, description, updated_at: new Date().toISOString() } : a))
          );
        }
        return next;
      });
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    } catch (err: any) {
      console.error("Kanıt açıklaması güncellenemedi:", err);
      setSaveStatus("error");
      throw err;
    }
  };

  // Extract unique process names for the custom question modal
  const existingProcesses = useMemo(() => {
    const set = new Set<string>();
    for (const q of pack.questions) set.add(q.process);
    for (const cq of customQuestions) set.add(cq.process_name);
    return Array.from(set);
  }, [pack.questions, customQuestions]);

  // ── Loading ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="question-screen question-screen--loading">
        <div className="question-screen__spinner" />
        <p>Sorular ve cevaplar yükleniyor…</p>
      </div>
    );
  }

  if (visibleQuestions.length === 0) {
    return (
      <div className="question-screen question-screen--empty">
        <p>Bu soru paketinde henüz soru bulunmuyor.</p>
        <button className="btn btn--secondary" onClick={handleSaveAndExit}>← Geri Dön</button>
      </div>
    );
  }

  const isFirst = safeIndex === 0;
  const isLast = safeIndex === visibleQuestions.length - 1;
  const isCompleted = progress.answered === progress.total && progress.total > 0;
  const totalSemanticItems =
    questionFindings.length +
    questionRequirements.length +
    questionRisks.length +
    questionNotes.length;

  return (
    <div style={{ display: "flex", width: "100%", position: "relative" }}>
      {/* ── Question Navigator Drawer / Sidebar ─────────────────────────── */}
      <QuestionNavigator
        isOpen={isNavigatorOpen}
        onToggle={() => setIsNavigatorOpen((prev) => !prev)}
        questions={visibleQuestions}
        answers={answers}
        followups={followups}
        attachmentsMap={attachmentsMap}
        currentQuestionId={currentQuestion?.id ?? null}
        onSelectQuestion={jumpToQuestion}
        onAddCustomQuestion={handleAddCustomQuestion}
        bfNameTr={bfNameTr}
      />

      {/* ── Main Question Content ────────────────────────────────────────── */}
      <div className="question-screen" style={{ flex: 1, minWidth: 0 }}>
        {/* ── Fixed Toolbar Header (CSS Grid Architecture) ───────────────── */}
        <header className="question-screen-toolbar question-screen__header">
          {/* Sol: Geri Dön & Soru Sayısı / Navigatör */}
          <div className="question-screen-toolbar__left">
            <button
              className="question-screen__back-btn"
              onClick={handleSaveAndExit}
              title={`${bfNameTr} - Analiz detayına dön (Kayıtlar saklanır)`}
            >
              <ChevronLeft size={16} />
              <span>{bfNameTr}</span>
            </button>

            <button
              type="button"
              className={`btn btn--sm question-screen__nav-toggle-btn ${
                isNavigatorOpen ? "btn--primary" : "btn--secondary"
              }`}
              onClick={() => setIsNavigatorOpen((prev) => !prev)}
              title="Soru Listesi / Navigatörü Aç/Kapat"
            >
              <Layers size={14} />
              <span>Sorular ({visibleQuestions.length})</span>
            </button>
          </div>

          {/* Orta: Süreç Adı & Soru X / Y */}
          <div className="question-screen-toolbar__center question-screen__meta">
            <span className="question-screen__process" title={currentQuestion?.process}>
              {currentQuestion?.process}
            </span>
            <span className="question-screen__position">
              Soru {safeIndex + 1} / {visibleQuestions.length}
            </span>
          </div>

          {/* Sağ: Özel Soru, Ara Rapor, Kaydet ve Çık */}
          <div className="question-screen-toolbar__right">
            <button
              type="button"
              className="btn btn--secondary btn--sm btn-custom-question"
              onClick={handleAddCustomQuestion}
              title="Bu iş fonksiyonuna yeni bir özel soru ekle"
            >
              <PlusCircle size={14} />
              <span>+ Özel Soru</span>
            </button>

            <SaveStatusIndicator status={saveStatus} lastSavedAt={lastSavedAt} />

            {onOpenReport && (
              <button
                type="button"
                className="btn btn--secondary btn--sm btn-interim-report"
                onClick={handleOpenReportClick}
                title="Mevcut durum ara raporunu incele / dışa aktar"
              >
                <FileText size={14} />
                <span>Ara Rapor</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-save-exit btn--save btn--sm"
              onClick={handleSaveAndExit}
              title="Değişiklikleri doğrula ve proje ekranına dön"
            >
              <Save size={14} />
              <span>Kaydet ve Çık</span>
            </button>
          </div>
        </header>

        {/* ── Progress bar ────────────────────────────────────────────────── */}
        <ProgressBar
          answered={progress.answered}
          total={progress.total}
          percentage={progress.percentage}
          revisitCount={revisitCount}
          criticalCount={criticalCount}
          className="question-screen__progress"
        />

        {/* ── Tamamlandı / Açık Konular banner ────────────────────────────── */}
        {isCompleted && revisitCount === 0 && criticalCount === 0 && (
          <div className="question-screen__completed-banner">
            <CheckCircle2 size={18} />
            Tüm zorunlu sorular tamamlandı! (Tamamlandı — %100)
          </div>
        )}
        {progress.answered + revisitCount + criticalCount >= progress.total &&
          progress.total > 0 &&
          (revisitCount > 0 || criticalCount > 0) && (
            <div
              className="question-screen__completed-banner"
              style={{
                background: "var(--color-warning-50, #fffbeb)",
                color: "var(--color-warning-800, #92400e)",
                border: "1px solid var(--color-warning-200, #fde68a)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>
                Tüm sorular incelendi. Ancak <strong>{revisitCount + criticalCount}</strong> açık takip konusu bulunuyor (
                {revisitCount > 0 ? `${revisitCount} Sonra Dön` : ""}
                {revisitCount > 0 && criticalCount > 0 ? ", " : ""}
                {criticalCount > 0 ? `${criticalCount} Kritik Takip` : ""}
                ). Bu konular raporda Açık Konular tablosunda listelenir.
              </span>
            </div>
          )}

        {/* ── Soru kartı ──────────────────────────────────────────────────── */}
        {currentQuestion && (
          <div className="question-screen__card-container">
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              answerData={answers.get(currentQuestion.id) ?? {}}
              onChange={handleAnswerChange}
              showValidation={showValidation}
              followup={followups.get(currentQuestion.id) ?? null}
              onOpenFollowup={handleOpenFollowup}
              onEditCustom={handleEditCustomQuestion}
              onDeleteCustom={handleDeleteCustomQuestion}
              projectId={projectId}
              businessFunctionCode={bfCode}
              attachments={attachmentsMap.get(currentQuestion.id) || []}
              onAddAttachment={(file, desc) => handleAddAttachment(currentQuestion.id, file, desc)}
              onDeleteAttachment={handleDeleteAttachment}
              onUpdateAttachmentDescription={handleUpdateAttachmentDescription}
              onReimportAttachment={handleReimportAttachment}
            />

            {/* ── FAZ-3: Semantic Analysis Actions Toolbar ───────────────────── */}
            <div className="question-semantic-bar">
              <div className="question-semantic-bar__header">
                <span className="question-semantic-bar__title">Analiz Notları & Çıkarımları:</span>
                <div className="question-semantic-bar__actions">
                  <button
                    type="button"
                    className="btn btn--outline btn--xs"
                    onClick={() => handleOpenSemanticModal("finding")}
                    title="Bu soruya bir bulgu ekle"
                  >
                    <Search size={13} /> + Bulgu
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline btn--xs"
                    onClick={() => handleOpenSemanticModal("requirement")}
                    title="Bu soruya bir gereksinim ekle"
                  >
                    <CheckSquare size={13} /> + Gereksinim
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline btn--risk btn--xs"
                    onClick={() => handleOpenSemanticModal("risk")}
                    title="Bu soruya bir risk ekle"
                  >
                    <AlertTriangle size={13} /> + Risk
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline btn--note btn--xs"
                    onClick={() => handleOpenSemanticModal("note")}
                    title="Bu soruya bir proje notu ekle"
                  >
                    <StickyNote size={13} /> + Not
                  </button>
                </div>
              </div>

              {/* Mevcut bağlı kayıt rozetleri */}
              {totalSemanticItems > 0 && (
                <div className="question-semantic-bar__badges">
                  {questionFindings.map((f) => (
                    <span key={f.id} className="badge badge--outline-primary text-xs">
                      <Search size={11} /> {f.title}
                    </span>
                  ))}
                  {questionRequirements.map((r) => (
                    <span key={r.id} className="badge badge--outline-success text-xs">
                      <CheckSquare size={11} /> {r.title}
                    </span>
                  ))}
                  {questionRisks.map((rsk) => (
                    <span key={rsk.id} className="badge badge--outline-danger text-xs">
                      <AlertTriangle size={11} /> {rsk.title}
                    </span>
                  ))}
                  {questionNotes.map((n) => (
                    <span key={n.id} className="badge badge--outline-secondary text-xs">
                      <StickyNote size={11} /> {n.note.substring(0, 25)}...
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Navigasyon ──────────────────────────────────────────────────── */}
        <div className="question-screen__nav">
          <button
            className="btn btn--outline btn--back question-screen__nav-btn"
            onClick={handlePrev}
            disabled={isFirst}
          >
            <ArrowLeft size={16} />
            Önceki
          </button>

          <div className="question-screen__nav-dots">
            {visibleQuestions.slice(0, 10).map((q, i) => (
              <button
                key={q.id}
                className={`question-screen__nav-dot ${
                  i === safeIndex ? "question-screen__nav-dot--current" : ""
                } ${
                  isQuestionAnswered(q, answers.get(q.id), followups.get(q.id))
                    ? "question-screen__nav-dot--answered"
                    : ""
                }`}
                onClick={() => goTo(i)}
                title={`Soru ${i + 1}`}
              />
            ))}
            {visibleQuestions.length > 10 && (
              <span className="question-screen__nav-more">+{visibleQuestions.length - 10}</span>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-save-exit btn--save question-screen__nav-btn"
              onClick={handleSaveAndExit}
              title="Analizden ayrıl (Kaldığınız soru saklanır)"
            >
              <Save size={15} />
              Kaydet ve Çık
            </button>

            {isLast ? (
              <button
                className="btn btn--success btn--save question-screen__nav-btn"
                onClick={handleSaveAndExit}
              >
                Tamamla
                <CheckCircle2 size={16} />
              </button>
            ) : (
              <button
                className="btn btn--primary btn--next question-screen__nav-btn"
                onClick={handleNext}
              >
                Sonraki
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ── Semantic Modal ──────────────────────────────────────────────── */}
        {isSemanticModalOpen && currentQuestion && (
          <SemanticModal
            isOpen={isSemanticModalOpen}
            onClose={() => setIsSemanticModalOpen(false)}
            onSaved={loadQuestionSemanticItems}
            projectId={projectId}
            defaultType={modalType}
            defaultBfCode={bfCode}
            defaultQuestionId={currentQuestion.id}
          />
        )}

        {/* ── Followup Modal (FAZ-9) ────────────────────────────────────────── */}
        {isFollowupModalOpen && followupModalTarget && (
          <FollowupModal
            key={`${followupModalTarget.question.id}-${followupModalTarget.initialFlagType}`}
            questionId={followupModalTarget.question.id}
            questionText={followupModalTarget.question.question}
            initialFlagType={followupModalTarget.initialFlagType}
            existingFollowup={followups.get(followupModalTarget.question.id) ?? null}
            onSave={handleSaveFollowup}
            onRemove={handleRemoveFollowup}
            onClose={() => {
              setIsFollowupModalOpen(false);
              setFollowupModalTarget(null);
            }}
          />
        )}

        {/* ── Custom Question Modal ───────────────────────────────────────── */}
        {isCustomModalOpen && (
          <CustomQuestionModal
            isOpen={isCustomModalOpen}
            onClose={() => {
              setIsCustomModalOpen(false);
              setEditingCustomQuestion(null);
            }}
            onSaved={loadData}
            projectId={projectId}
            bfCode={bfCode}
            bfNameTr={bfNameTr}
            existingQuestion={editingCustomQuestion}
            existingProcesses={existingProcesses}
          />
        )}
      </div>
    </div>
  );
};
