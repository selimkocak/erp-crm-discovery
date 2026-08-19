/**
 * ERP CRM Discovery — QuestionScreen
 *
 * Step-by-step soru ekranı. Tek anda bir soru gösterir.
 * FAZ-7: Resumable Analysis & Autosave Guarantee & Ara Rapor Entegrasyonu.
 *
 * 1. Autosave Guarantee: Her cevap anında hafızaya, kısa debounce ile SQLite'a yazılır.
 * 2. Exit Anytime & Flush: "Kaydet ve Çık" veya navigasyonda bekleyen tüm kayıtlar anında diske yazılır.
 * 3. Session State: Son kalınan soru ID'si kaydedilir; sonraki gelişte aynı sorudan devam edilir.
 * 4. Ara Rapor (Interim Report): İstendiği an mevcut ilerleme ile ara rapor görüntülenebilir/dışa aktarılabilir.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import type { QuestionPack, AnswerData, Question } from "../engine/types";
import type { SemanticRecordType, Finding, Requirement, Risk, ProjectNote } from "../types";
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
} from "../db/client";
import { getVisibleQuestions } from "../engine/branching";
import { calculateProgress, isQuestionAnswered, progressToStatus } from "../engine/progress";
import { QuestionCard } from "../components/QuestionCard";
import { ProgressBar } from "../components/ProgressBar";
import { SaveStatusIndicator } from "../components/SaveStatusIndicator";
import { SemanticModal } from "../components/SemanticModal";

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
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [showValidation, setShowValidation] = useState<boolean>(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<{ qId: string; data: AnswerData } | null>(null);

  // Soruya bağlı semantik kayıtlar
  const [questionFindings, setQuestionFindings] = useState<Finding[]>([]);
  const [questionRequirements, setQuestionRequirements] = useState<Requirement[]>([]);
  const [questionRisks, setQuestionRisks] = useState<Risk[]>([]);
  const [questionNotes, setQuestionNotes] = useState<ProjectNote[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<SemanticRecordType>("finding");

  // ── Başlangıç yüklemesi ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [existingAnswers, lastQId] = await Promise.all([
          getAllAnswers(projectId, bfCode),
          getLastQuestionId(projectId, bfCode),
        ]);
        setAnswers(existingAnswers);

        // Kaldığı yerden devam (Resume)
        if (lastQId) {
          const visible = getVisibleQuestions(pack.questions, existingAnswers);
          const idx = visible.findIndex((q) => q.id === lastQId);
          if (idx >= 0) setCurrentIndex(idx);
        }
      } catch (err) {
        console.error("Cevaplar yüklenemedi:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [projectId, bfCode, pack.questions]);

  // ── Görünür sorular (branching) ────────────────────────────────────────
  const visibleQuestions: Question[] = getVisibleQuestions(pack.questions, answers);
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

  // ── İlerleme ───────────────────────────────────────────────────────────
  const progress = calculateProgress(visibleQuestions, answers);

  // ── Gerçek DB Kayıt İcrası ─────────────────────────────────────────────
  const executeDbSave = useCallback(
    async (qId: string, data: AnswerData) => {
      try {
        setSaveStatus("saving");
        await saveAnswer(
          projectId,
          bfCode,
          pack.meta.pack_id,
          pack.meta.version,
          qId,
          data
        );
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
    (qId: string, data: AnswerData) => {
      pendingSaveRef.current = { qId, data };
      setSaveStatus("saving");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        await executeDbSave(qId, data);
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
      const { qId, data } = pendingSaveRef.current;
      await executeDbSave(qId, data);
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
    scheduleSave(currentQuestion.id, updated);
  };

  // ── Navigasyon ─────────────────────────────────────────────────────────
  const goTo = async (idx: number) => {
    if (!currentQuestion) return;
    setShowValidation(false);
    await flushPendingSave();

    const targetIdx = Math.max(0, Math.min(idx, visibleQuestions.length - 1));
    setCurrentIndex(targetIdx);

    // Session state kaydet
    const targetQ = visibleQuestions[targetIdx];
    if (targetQ) {
      try {
        await saveLastQuestionId(projectId, bfCode, targetQ.id);
      } catch {
        // Hata bastırma
      }
    }
  };

  const handleNext = async () => {
    if (!currentQuestion) return;
    // Zorunlu soru kontrolü
    if (
      currentQuestion.required &&
      !isQuestionAnswered(currentQuestion, answers.get(currentQuestion.id))
    ) {
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
    await flushPendingSave();
    onBack();
  };

  const handleOpenReportClick = async () => {
    await flushPendingSave();
    if (onOpenReport) {
      onOpenReport();
    }
  };

  const handleOpenModal = (t: SemanticRecordType) => {
    setModalType(t);
    setIsModalOpen(true);
  };

  // ── Loading ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="question-screen question-screen--loading">
        <div className="question-screen__spinner" />
        <p>Cevaplar yükleniyor…</p>
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
    <div className="question-screen">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="question-screen__header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            className="question-screen__back-btn"
            onClick={handleSaveAndExit}
            title="Analiz detayına dön (Kayıtlar saklanır)"
          >
            <ChevronLeft size={16} />
            {bfNameTr}
          </button>

          <div className="question-screen__meta">
            <span className="question-screen__process">{currentQuestion?.process}</span>
            <span className="question-screen__position">
              Soru {safeIndex + 1} / {visibleQuestions.length}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <SaveStatusIndicator status={saveStatus} lastSavedAt={lastSavedAt} />

          {onOpenReport && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={handleOpenReportClick}
              title="Mevcut durum ara raporunu incele / dışa aktar"
            >
              <FileText size={14} />
              Ara Rapor
            </button>
          )}

          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={handleSaveAndExit}
            title="Değişiklikleri doğrula ve proje ekranına dön"
          >
            <Save size={14} />
            Kaydet ve Çık
          </button>
        </div>
      </div>

      {/* ── Progress bar ────────────────────────────────────────────────── */}
      <ProgressBar
        answered={progress.answered}
        total={progress.total}
        percentage={progress.percentage}
        className="question-screen__progress"
      />

      {/* ── Tamamlandı banner ────────────────────────────────────────────── */}
      {isCompleted && (
        <div className="question-screen__completed-banner">
          <CheckCircle2 size={18} />
          Tüm zorunlu sorular tamamlandı! (Tamamlandı — %100)
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
          />

          {/* ── FAZ-3: Semantic Analysis Actions Toolbar ───────────────────── */}
          <div className="question-semantic-bar">
            <div className="question-semantic-bar__header">
              <span className="question-semantic-bar__title">Analiz Notları & Çıkarımları:</span>
              <div className="question-semantic-bar__actions">
                <button
                  type="button"
                  className="btn btn--outline btn--xs"
                  onClick={() => handleOpenModal("finding")}
                  title="Bu soruya bir bulgu ekle"
                >
                  <Search size={13} /> + Bulgu
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn--xs"
                  onClick={() => handleOpenModal("requirement")}
                  title="Bu soruya bir gereksinim ekle"
                >
                  <CheckSquare size={13} /> + Gereksinim
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn--xs"
                  onClick={() => handleOpenModal("risk")}
                  title="Bu soruya bir risk ekle"
                >
                  <AlertTriangle size={13} /> + Risk
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn--xs"
                  onClick={() => handleOpenModal("note")}
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
          className="btn btn--secondary question-screen__nav-btn"
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
                isQuestionAnswered(q, answers.get(q.id))
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
            className="btn btn--secondary question-screen__nav-btn"
            onClick={handleSaveAndExit}
            title="Analizden ayrıl (Kaldığınız soru saklanır)"
          >
            <Save size={15} />
            Kaydet ve Çık
          </button>

          {isLast ? (
            <button
              className="btn btn--primary question-screen__nav-btn"
              onClick={handleSaveAndExit}
            >
              Tamamla
              <CheckCircle2 size={16} />
            </button>
          ) : (
            <button
              className="btn btn--primary question-screen__nav-btn"
              onClick={handleNext}
            >
              Sonraki
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {isModalOpen && currentQuestion && (
        <SemanticModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={loadQuestionSemanticItems}
          projectId={projectId}
          defaultType={modalType}
          defaultBfCode={bfCode}
          defaultQuestionId={currentQuestion.id}
        />
      )}
    </div>
  );
};
