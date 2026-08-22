/**
 * ERP CRM Discovery — QuestionNavigator Component (FAZ-9 Enhanced)
 *
 * Collapsible left sidebar / drawer for instant question navigation.
 * Displays all visible questions grouped by process, with real-time completion statuses:
 * - CURRENT (active question highlighted)
 * - 🟢 ANSWERED (green checkmark)
 * - 🟡 REVISIT / SONRA DÖN (yellow/amber dot indicator)
 * - 🔴 CRITICAL / KRİTİK TAKİP (red circle indicator)
 * - ! REQUIRED_INCOMPLETE (amber warning indicator)
 * - ○ UNANSWERED (neutral empty indicator)
 * - [Özel Soru] (custom question badge)
 *
 * Filter bar:
 * [Tümü] [Cevaplanan] [🟡 Sonra Dön (N)] [🔴 Kritik (N)] [Cevaplanmayan]
 */

import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  PlusCircle,
  Layers,
  Sparkles,
  Paperclip,
} from "lucide-react";
import type { Question, AnswerData } from "../engine/types";
import type { QuestionAttachment, QuestionFollowup } from "../types";
import { isQuestionAnswered } from "../engine/progress";

export type NavigatorFilterType = "all" | "answered" | "attachments" | "revisit" | "critical" | "unanswered";

interface QuestionNavigatorProps {
  isOpen: boolean;
  onToggle: () => void;
  questions: Question[];
  answers: Map<string, AnswerData>;
  followups?: Map<string, QuestionFollowup>;
  attachmentsMap?: Map<string, QuestionAttachment[]>;
  currentQuestionId: string | null;
  onSelectQuestion: (questionId: string) => void;
  onAddCustomQuestion?: () => void;
  bfNameTr: string;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  isOpen,
  onToggle,
  questions,
  answers,
  followups = new Map(),
  attachmentsMap = new Map(),
  currentQuestionId,
  onSelectQuestion,
  onAddCustomQuestion,
  bfNameTr,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<NavigatorFilterType>("all");

  // Calculate follow-up, attachment and completion counts for tabs
  let totalAnsweredCount = 0;
  let revisitCount = 0;
  let criticalCount = 0;
  let unansweredCount = 0;
  let attachmentsTotalQuestionsCount = 0;
  let totalFilesCount = 0;

  for (const q of questions) {
    const fol = followups.get(q.id);
    const atts = attachmentsMap.get(q.id) || [];
    const attCount = atts.length;
    if (attCount > 0) {
      attachmentsTotalQuestionsCount++;
      totalFilesCount += attCount;
    }

    if (fol && fol.status === "open") {
      if (fol.flag_type === "critical") criticalCount++;
      else if (fol.flag_type === "revisit") revisitCount++;
    } else {
      const answered = isQuestionAnswered(q, answers.get(q.id), fol);
      if (answered) {
        totalAnsweredCount++;
      } else {
        unansweredCount++;
      }
    }
  }

  // Filter questions based on filter tab and search term
  const filteredQuestions = questions.filter((q) => {
    const fol = followups.get(q.id);
    const isOpenFollowup = fol && fol.status === "open";
    const isAnswered = isQuestionAnswered(q, answers.get(q.id), fol);
    const qAttachments = attachmentsMap.get(q.id) || [];
    const hasAttachments = qAttachments.length > 0;

    // Tab filter
    if (activeFilter === "answered" && !isAnswered) return false;
    if (activeFilter === "attachments" && !hasAttachments) return false;
    if (activeFilter === "revisit" && (!isOpenFollowup || fol?.flag_type !== "revisit")) return false;
    if (activeFilter === "critical" && (!isOpenFollowup || fol?.flag_type !== "critical")) return false;
    if (activeFilter === "unanswered" && (isAnswered || isOpenFollowup)) return false;

    // Search term filter
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const attMatch = qAttachments.some(
      (a: QuestionAttachment) =>
        a.original_file_name.toLowerCase().includes(term) ||
        (a.description && a.description.toLowerCase().includes(term))
    );
    return (
      q.question.toLowerCase().includes(term) ||
      q.process.toLowerCase().includes(term) ||
      q.id.toLowerCase().includes(term) ||
      (fol?.note && fol.note.toLowerCase().includes(term)) ||
      attMatch
    );
  });

  // Calculate separate stats for canonical vs custom
  const canonicalQuestions = questions.filter((q) => !q.is_custom);
  const customQuestions = questions.filter((q) => q.is_custom);

  const canonicalRequired = canonicalQuestions.filter((q) => q.required);
  const canonicalAnswered = canonicalRequired.filter((q) =>
    isQuestionAnswered(q, answers.get(q.id), followups.get(q.id))
  ).length;

  const customRequired = customQuestions.filter((q) => q.required);
  const customAnswered = customRequired.filter((q) =>
    isQuestionAnswered(q, answers.get(q.id), followups.get(q.id))
  ).length;

  // Group filtered questions by process
  const processGroups: { processName: string; items: Question[] }[] = [];
  const groupMap = new Map<string, Question[]>();

  for (const q of filteredQuestions) {
    if (!groupMap.has(q.process)) {
      groupMap.set(q.process, []);
      processGroups.push({ processName: q.process, items: groupMap.get(q.process)! });
    }
    groupMap.get(q.process)!.push(q);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        className="btn btn--secondary question-navigator__toggle-btn"
        onClick={onToggle}
        title="Soru Listesi / Navigatörü Aç"
        style={{
          position: "fixed",
          top: "4.5rem",
          left: "1rem",
          zIndex: 40,
          boxShadow: "var(--shadow-md)",
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          padding: "0.4rem 0.75rem",
          borderRadius: "var(--radius-full)",
        }}
      >
        <Layers size={15} />
        <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Sorular ({questions.length})</span>
        {(revisitCount > 0 || criticalCount > 0 || attachmentsTotalQuestionsCount > 0) && (
          <span style={{ display: "inline-flex", gap: "0.25rem", fontSize: "0.75rem", alignItems: "center" }}>
            {attachmentsTotalQuestionsCount > 0 && <span title={`${attachmentsTotalQuestionsCount} ekli soru`}>📎{attachmentsTotalQuestionsCount}</span>}
            {revisitCount > 0 && <span title={`${revisitCount} sonra dön`}>🟡{revisitCount}</span>}
            {criticalCount > 0 && <span title={`${criticalCount} kritik takip`}>🔴{criticalCount}</span>}
          </span>
        )}
        <ChevronRight size={14} />
      </button>
    );
  }

  return (
    <aside
      className="question-navigator"
      style={{
        width: "330px",
        minWidth: "330px",
        height: "calc(100vh - 4rem)",
        position: "sticky",
        top: "4rem",
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        zIndex: 35,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Layers size={16} style={{ color: "var(--primary)" }} />
          <div>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Soru Navigatörü
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {bfNameTr}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn-icon"
          onClick={onToggle}
          title="Navigatörü Kapat"
          style={{ padding: "0.25rem", borderRadius: "var(--radius-sm)" }}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* ── Filter Tabs ─────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "0.5rem 0.75rem",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          gap: "0.25rem",
          overflowX: "auto",
          backgroundColor: "var(--bg-app)",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className="question-navigator__filter-tab"
          data-filter="all"
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            padding: "0.2rem 0.45rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid",
            borderColor: activeFilter === "all" ? "var(--primary)" : "transparent",
            backgroundColor: activeFilter === "all" ? "var(--primary-subtle)" : "transparent",
            color: activeFilter === "all" ? "var(--primary)" : "var(--text-secondary)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Tümü ({questions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("answered")}
          className="question-navigator__filter-tab"
          data-filter="answered"
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            padding: "0.2rem 0.45rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid",
            borderColor: activeFilter === "answered" ? "var(--success)" : "transparent",
            backgroundColor: activeFilter === "answered" ? "rgba(16, 185, 129, 0.1)" : "transparent",
            color: activeFilter === "answered" ? "var(--success)" : "var(--text-secondary)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          ✓ Cevaplanan ({totalAnsweredCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("attachments")}
          className="question-navigator__filter-tab"
          data-filter="attachments"
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            padding: "0.2rem 0.45rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid",
            borderColor: activeFilter === "attachments" ? "var(--color-secondary-600)" : "transparent",
            backgroundColor: activeFilter === "attachments" ? "rgba(15, 118, 110, 0.12)" : "transparent",
            color: activeFilter === "attachments" ? "var(--color-secondary-600)" : "var(--text-secondary)",
            cursor: "pointer",
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
          title="Ekli sorular — En az bir kanıt dosyası ekli olan soruları göster"
          aria-label={`Ekli sorular (${attachmentsTotalQuestionsCount})`}
        >
          <Paperclip size={11} />
          <span>Ekli ({attachmentsTotalQuestionsCount})</span>
        </button>

        {revisitCount > 0 && (
          <button
            type="button"
            onClick={() => setActiveFilter("revisit")}
            className="question-navigator__filter-tab"
            data-filter="revisit"
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              padding: "0.2rem 0.45rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid",
              borderColor: activeFilter === "revisit" ? "var(--warning)" : "transparent",
              backgroundColor: activeFilter === "revisit" ? "rgba(245, 158, 11, 0.1)" : "transparent",
              color: activeFilter === "revisit" ? "var(--warning)" : "var(--text-secondary)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            🟡 Sonra ({revisitCount})
          </button>
        )}

        {criticalCount > 0 && (
          <button
            type="button"
            onClick={() => setActiveFilter("critical")}
            className="question-navigator__filter-tab"
            data-filter="critical"
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              padding: "0.2rem 0.45rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid",
              borderColor: activeFilter === "critical" ? "var(--danger)" : "transparent",
              backgroundColor: activeFilter === "critical" ? "rgba(239, 68, 68, 0.1)" : "transparent",
              color: activeFilter === "critical" ? "var(--danger)" : "var(--text-secondary)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            🔴 Kritik ({criticalCount})
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveFilter("unanswered")}
          className="question-navigator__filter-tab"
          data-filter="unanswered"
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            padding: "0.2rem 0.45rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid",
            borderColor: activeFilter === "unanswered" ? "var(--text-muted)" : "transparent",
            backgroundColor: activeFilter === "unanswered" ? "rgba(100, 116, 139, 0.1)" : "transparent",
            color: activeFilter === "unanswered" ? "var(--text-primary)" : "var(--text-secondary)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          ○ Boş ({unansweredCount})
        </button>
      </div>

      {/* ── Search & Actions ────────────────────────────────────────────── */}
      <div style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="form-control"
            placeholder="Soru, süreç veya ek ara…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              paddingLeft: "2rem",
              paddingRight: "0.5rem",
              paddingTop: "0.3rem",
              paddingBottom: "0.3rem",
              fontSize: "0.8125rem",
            }}
          />
        </div>

        {onAddCustomQuestion && (
          <button
            type="button"
            className="btn btn--outline btn--xs"
            onClick={onAddCustomQuestion}
            style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: "0.375rem" }}
            title="Bu iş fonksiyonuna özel yeni soru ekle"
          >
            <PlusCircle size={13} />
            <span>+ Özel Soru Ekle</span>
          </button>
        )}
      </div>

      {/* ── Question List (Grouped by Process) ──────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
        {processGroups.length === 0 ? (
          <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            Filtreye uygun soru bulunamadı.
          </div>
        ) : (
          processGroups.map((group) => (
            <div key={group.processName} style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--text-muted)",
                  padding: "0.25rem 0.5rem",
                  marginBottom: "0.25rem",
                }}
              >
                {group.processName}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
                {group.items.map((q) => {
                  const isCurrent = q.id === currentQuestionId;
                  const ans = answers.get(q.id);
                  const fol = followups.get(q.id);
                  const isFollowupActive = fol && fol.status === "open";
                  const isAnswered = isQuestionAnswered(q, ans, fol);
                  const isRequiredIncomplete = q.required && !isAnswered && !isFollowupActive;
                  const attList = attachmentsMap.get(q.id) || [];
                  const attCount = attList.length;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => onSelectQuestion(q.id)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                        padding: "0.4rem 0.5rem",
                        borderRadius: "var(--radius-md)",
                        border: isCurrent ? "1px solid var(--primary-border)" : "1px solid transparent",
                        backgroundColor: isCurrent
                          ? "var(--primary-subtle)"
                          : isFollowupActive
                          ? fol.flag_type === "critical"
                            ? "rgba(239, 68, 68, 0.04)"
                            : "rgba(245, 158, 11, 0.04)"
                          : "transparent",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      title={`${q.order}. ${q.question}`}
                    >
                      {/* Status Icon */}
                      <span style={{ marginTop: "0.15rem", flexShrink: 0 }}>
                        {isFollowupActive ? (
                          fol.flag_type === "critical" ? (
                            <span style={{ fontSize: "0.875rem", lineHeight: 1 }} title="🔴 Kritik Takip">🔴</span>
                          ) : (
                            <span style={{ fontSize: "0.875rem", lineHeight: 1 }} title="🟡 Sonra Dön">🟡</span>
                          )
                        ) : isAnswered ? (
                          <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
                        ) : isRequiredIncomplete ? (
                          <AlertCircle size={14} style={{ color: "var(--warning)" }} />
                        ) : (
                          <Circle size={14} style={{ color: "var(--text-muted)" }} />
                        )}
                      </span>

                      {/* Question Order, Snippet & Attachment Badge */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "0.25rem",
                            lineHeight: 1.3,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              fontSize: "0.75rem",
                              fontWeight: isCurrent ? 700 : 500,
                              color: isCurrent ? "var(--primary)" : "var(--text-primary)",
                              minWidth: 0,
                              flex: 1,
                            }}
                          >
                            <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                              {String(q.order).padStart(2, "0")}.
                            </span>
                            <span
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {q.question}
                            </span>
                          </div>

                          {/* Attachment Indicator Badge */}
                          {attCount > 0 && (
                            <span
                              className="question-navigator__attachment-badge"
                              title={`${attCount} kanıt dosyası ekli`}
                              aria-label={`Bu soruya ${attCount} kanıt dosyası ekli`}
                            >
                              <Paperclip size={11} />
                              {attCount > 1 && <span>{attCount}</span>}
                            </span>
                          )}
                        </div>

                        {/* Follow-up Note Snippet */}
                        {isFollowupActive && (
                          <div
                            style={{
                              fontSize: "0.6875rem",
                              color: fol.flag_type === "critical" ? "var(--danger)" : "var(--warning)",
                              fontWeight: 500,
                              marginTop: "0.15rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fol.flag_type === "critical" ? "Kritik Açık Konu" : "Teyit Bekliyor"}
                            {fol.note ? `: ${fol.note}` : ""}
                          </div>
                        )}

                        {q.is_custom && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.2rem",
                              fontSize: "0.625rem",
                              padding: "0.1rem 0.35rem",
                              borderRadius: "var(--radius-sm)",
                              backgroundColor: "var(--info-subtle)",
                              color: "var(--info)",
                              fontWeight: 600,
                              marginTop: "0.2rem",
                            }}
                          >
                            <Sparkles size={9} /> Özel Soru
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Footer Summary Stats ─────────────────────────────────────────── */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderTop: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-app)",
          fontSize: "0.75rem",
        }}
      >
        {/* Takip Bayrakları Özeti */}
        {(revisitCount > 0 || criticalCount > 0) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.35rem 0.5rem",
              background: "var(--surface-color)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              marginBottom: "0.5rem",
            }}
          >
            {revisitCount > 0 && (
              <span style={{ color: "var(--warning)", fontWeight: 600, fontSize: "0.75rem" }}>
                🟡 {revisitCount} Teyit Bekliyor
              </span>
            )}
            {criticalCount > 0 && (
              <span style={{ color: "var(--danger)", fontWeight: 600, fontSize: "0.75rem" }}>
                🔴 {criticalCount} Kritik Takip
              </span>
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Standart Sorular:</span>
          <strong style={{ color: "var(--text-primary)" }}>
            {canonicalAnswered} / {canonicalRequired.length} ({canonicalQuestions.length} toplam)
          </strong>
        </div>

        {customQuestions.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Özel Sorular:</span>
            <strong style={{ color: "var(--info)" }}>
              {customAnswered} / {customRequired.length} ({customQuestions.length} toplam)
            </strong>
          </div>
        )}

        {totalFilesCount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Ekli Dosyalar:</span>
            <strong style={{ color: "var(--color-secondary-600)", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <Paperclip size={11} /> {totalFilesCount} Dosya ({attachmentsTotalQuestionsCount} Soru)
            </strong>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.375rem", paddingTop: "0.375rem", borderTop: "1px solid var(--border-subtle)" }}>
          <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Genel Toplam:</span>
          <span style={{ fontWeight: 700, color: "var(--primary)" }}>{questions.length} Soru</span>
        </div>
      </div>
    </aside>
  );
};
