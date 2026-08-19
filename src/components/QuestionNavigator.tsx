/**
 * ERP CRM Discovery — QuestionNavigator Component
 *
 * Collapsible left sidebar / drawer for instant question navigation.
 * Displays all visible questions grouped by process, with real-time completion statuses:
 * - CURRENT (active question highlighted)
 * - ANSWERED (green checkmark)
 * - REQUIRED_INCOMPLETE (amber warning indicator)
 * - UNANSWERED (neutral empty indicator)
 * - [Özel Soru] (custom question badge)
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
} from "lucide-react";
import type { Question, AnswerData } from "../engine/types";
import { isQuestionAnswered } from "../engine/progress";

interface QuestionNavigatorProps {
  isOpen: boolean;
  onToggle: () => void;
  questions: Question[];
  answers: Map<string, AnswerData>;
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
  currentQuestionId,
  onSelectQuestion,
  onAddCustomQuestion,
  bfNameTr,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filter questions based on search term
  const filteredQuestions = questions.filter((q) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      q.question.toLowerCase().includes(term) ||
      q.process.toLowerCase().includes(term) ||
      q.id.toLowerCase().includes(term)
    );
  });

  // Calculate separate stats
  const canonicalQuestions = questions.filter((q) => !q.is_custom);
  const customQuestions = questions.filter((q) => q.is_custom);

  const canonicalRequired = canonicalQuestions.filter((q) => q.required);
  const canonicalAnswered = canonicalRequired.filter((q) =>
    isQuestionAnswered(q, answers.get(q.id))
  ).length;

  const customRequired = customQuestions.filter((q) => q.required);
  const customAnswered = customRequired.filter((q) =>
    isQuestionAnswered(q, answers.get(q.id))
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
        <ChevronRight size={14} />
      </button>
    );
  }

  return (
    <aside className="question-navigator" style={{
      width: "320px",
      minWidth: "320px",
      height: "calc(100vh - 4rem)",
      position: "sticky",
      top: "4rem",
      backgroundColor: "var(--bg-surface)",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      zIndex: 35,
      boxShadow: "var(--shadow-sm)",
    }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: "0.875rem 1rem",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
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

      {/* ── Search & Actions ────────────────────────────────────────────── */}
      <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="form-control"
            placeholder="Soru veya süreç ara…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              paddingLeft: "2rem",
              paddingRight: "0.5rem",
              paddingTop: "0.375rem",
              paddingBottom: "0.375rem",
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
            Aramaya uygun soru bulunamadı.
          </div>
        ) : (
          processGroups.map((group) => (
            <div key={group.processName} style={{ marginBottom: "1rem" }}>
              <div style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--text-muted)",
                padding: "0.25rem 0.5rem",
                marginBottom: "0.25rem",
              }}>
                {group.processName}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
                {group.items.map((q) => {
                  const isCurrent = q.id === currentQuestionId;
                  const ans = answers.get(q.id);
                  const isAnswered = isQuestionAnswered(q, ans);
                  const isRequiredIncomplete = q.required && !isAnswered;

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
                        backgroundColor: isCurrent ? "var(--primary-subtle)" : "transparent",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      title={`${q.order}. ${q.question}`}
                    >
                      {/* Status Icon */}
                      <span style={{ marginTop: "0.15rem", flexShrink: 0 }}>
                        {isAnswered ? (
                          <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
                        ) : isRequiredIncomplete ? (
                          <AlertCircle size={14} style={{ color: "var(--warning)" }} />
                        ) : (
                          <Circle size={14} style={{ color: "var(--text-muted)" }} />
                        )}
                      </span>

                      {/* Question Order & Snippet */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          fontSize: "0.75rem",
                          fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? "var(--primary)" : "var(--text-primary)",
                          lineHeight: 1.3,
                        }}>
                          <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                            {String(q.order).padStart(2, "0")}.
                          </span>
                          <span style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                            {q.question}
                          </span>
                        </div>

                        {q.is_custom && (
                          <span style={{
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
                          }}>
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
      <div style={{
        padding: "0.75rem 1rem",
        borderTop: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-app)",
        fontSize: "0.75rem",
      }}>
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

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.375rem", paddingTop: "0.375rem", borderTop: "1px solid var(--border-subtle)" }}>
          <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Genel Toplam:</span>
          <span style={{ fontWeight: 700, color: "var(--primary)" }}>{questions.length} Soru</span>
        </div>
      </div>
    </aside>
  );
};
