/**
 * ERP CRM Discovery — QuestionCard bileşeni
 *
 * Tek bir soruyu tüm etkileşim seçenekleriyle render eder:
 * - single_choice / multiple_choice / yes_no
 * - short_text / text / long_text / textarea / number
 * - allow_note (per-option)
 * - is_other (zorunlu note)
 * - Genel ek açıklama / not alanı
 * - [Özel Soru] rozeti ve Proje Yöneticisi Düzenle/Sil aksiyonları
 */

import React, { useState } from "react";
import { Edit2, Trash2, Sparkles } from "lucide-react";
import type { Question, AnswerData } from "../engine/types";
import type { QuestionFollowup, FollowupFlagType, QuestionAttachment } from "../types";
import { ChoiceOption } from "./ChoiceOption";
import { isQuestionAnswered } from "../engine/progress";
import { QuestionAttachments } from "./QuestionAttachments";

interface QuestionCardProps {
  question: Question;
  answerData: AnswerData;
  onChange: (updated: AnswerData) => void;
  showValidation?: boolean;
  followup?: QuestionFollowup | null;
  onOpenFollowup?: (question: Question, flagType?: FollowupFlagType) => void;
  onEditCustom?: (question: Question) => void;
  onDeleteCustom?: (question: Question) => void;
  projectId?: string;
  businessFunctionCode?: string;
  attachments?: QuestionAttachment[];
  onAddAttachment?: (
    file: { name: string; size: number; type: string; data: Uint8Array },
    description?: string
  ) => Promise<void>;
  onDeleteAttachment?: (attachmentId: string) => Promise<void>;
  onUpdateAttachmentDescription?: (attachmentId: string, description: string) => Promise<void>;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  answerData,
  onChange,
  showValidation = false,
  followup,
  onOpenFollowup,
  onEditCustom,
  onDeleteCustom,
  projectId,
  businessFunctionCode,
  attachments = [],
  onAddAttachment,
  onDeleteAttachment,
  onUpdateAttachmentDescription,
}) => {
  const [generalNoteOpen, setGeneralNoteOpen] = useState<boolean>(
    (answerData.general_note ?? "").length > 0
  );

  const selected = answerData.selected ?? [];
  const isAnswered = isQuestionAnswered(question, answerData, followup);
  const showError = showValidation && question.required && !isAnswered && !followup;

  // ── Toggle seçenek ─────────────────────────────────────────────────────
  const handleToggle = (value: string) => {
    if (question.answer_type === "single_choice" || question.answer_type === "yes_no") {
      // Radio / Single: diğer seçeneklerin notlarını temizle
      onChange({
        ...answerData,
        selected: [{ value, note: getExistingNote(value) }],
      });
    } else {
      // Checkbox: mevcut seçimi al veya kaldır
      const exists = selected.find((s) => s.value === value);
      if (exists) {
        onChange({
          ...answerData,
          selected: selected.filter((s) => s.value !== value),
        });
      } else {
        onChange({
          ...answerData,
          selected: [...selected, { value, note: "" }],
        });
      }
    }
  };

  // ── Seçenek notu güncelle ───────────────────────────────────────────────
  const handleNoteChange = (value: string, note: string) => {
    onChange({
      ...answerData,
      selected: selected.map((s) =>
        s.value === value ? { ...s, note } : s
      ),
    });
  };

  // ── Genel not güncelle ─────────────────────────────────────────────────
  const handleGeneralNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...answerData, general_note: e.target.value });
  };

  // ── Text/number güncelle ───────────────────────────────────────────────
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({ ...answerData, text: e.target.value });
  };

  const getExistingNote = (value: string): string => {
    return selected.find((s) => s.value === value)?.note ?? "";
  };

  const isOptionSelected = (value: string): boolean => {
    return selected.some((s) => s.value === value);
  };

  const isChoice =
    question.answer_type === "single_choice" ||
    question.answer_type === "multiple_choice" ||
    question.answer_type === "yes_no";

  const isShortText =
    question.answer_type === "short_text" || question.answer_type === "text";

  const isLongText =
    question.answer_type === "long_text" || question.answer_type === "textarea";

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className={`question-card ${showError ? "question-card--error" : ""}`}>
      {/* Soru başlığı ve Custom Question Yönetimi */}
      <div className="question-card__header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 600 }}>
              {question.process}
            </span>
            {question.is_custom && (
              <span className="badge badge--info" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.6875rem" }}>
                <Sparkles size={10} /> Özel Soru
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            {onOpenFollowup && (
              <>
                <button
                  type="button"
                  className={`btn btn--xs ${followup?.flag_type === "revisit" ? "btn-warning" : "btn--outline"}`}
                  onClick={() => onOpenFollowup(question, "revisit")}
                  title="Sonra Dön (Teyit Bekliyor)"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontSize: "0.6875rem",
                    padding: "0.2rem 0.45rem",
                    borderColor: followup?.flag_type === "revisit" ? "var(--warning)" : "var(--border-color)",
                  }}
                >
                  🟡 Sonra Dön
                </button>
                <button
                  type="button"
                  className={`btn btn--xs ${followup?.flag_type === "critical" ? "btn-danger" : "btn--outline"}`}
                  onClick={() => onOpenFollowup(question, "critical")}
                  title="Kritik Takip (Açık Konu)"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontSize: "0.6875rem",
                    padding: "0.2rem 0.45rem",
                    borderColor: followup?.flag_type === "critical" ? "var(--danger)" : "var(--border-color)",
                  }}
                >
                  🔴 Kritik Takip
                </button>
              </>
            )}

            {question.is_custom && (
              <>
                {onEditCustom && (
                  <button
                    type="button"
                    className="btn btn--outline btn--xs"
                    onClick={() => onEditCustom(question)}
                    title="Özel soruyu düzenle"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                  >
                    <Edit2 size={12} /> Düzenle
                  </button>
                )}
                {onDeleteCustom && (
                  <button
                    type="button"
                    className="btn btn--outline btn--xs"
                    onClick={() => onDeleteCustom(question)}
                    title="Özel soruyu sil"
                    style={{ color: "var(--danger)", borderColor: "var(--danger-border)", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                  >
                    <Trash2 size={12} /> Sil
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Aktif Takip Bayrağı Bilgilendirme Bandı */}
        {followup && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              background:
                followup.flag_type === "critical"
                  ? "rgba(239, 68, 68, 0.08)"
                  : "rgba(245, 158, 11, 0.08)",
              border: `1px solid ${
                followup.flag_type === "critical"
                  ? "rgba(239, 68, 68, 0.3)"
                  : "rgba(245, 158, 11, 0.3)"
              }`,
              borderRadius: "var(--radius-md)",
              padding: "0.5rem 0.75rem",
              marginBottom: "0.875rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.125rem", lineHeight: 1 }}>
                {followup.flag_type === "critical" ? "🔴" : "🟡"}
              </span>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    color:
                      followup.flag_type === "critical"
                        ? "var(--danger)"
                        : "var(--warning)",
                  }}
                >
                  {followup.flag_type === "critical"
                    ? "Kritik Takip — Açık Konu Olarak İzleniyor"
                    : "Sonra Dönülecek — Bilgi / Teyit Bekliyor"}
                </div>
                {followup.note && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-color)",
                      marginTop: "0.15rem",
                    }}
                  >
                    Not: <em>{followup.note}</em>
                  </div>
                )}
              </div>
            </div>

            {onOpenFollowup && (
              <button
                type="button"
                className="btn btn--outline btn--xs"
                onClick={() => onOpenFollowup(question)}
                style={{ fontSize: "0.6875rem", padding: "0.2rem 0.4rem", whiteSpace: "nowrap" }}
              >
                Bayrağı Düzenle
              </button>
            )}
          </div>
        )}

        <h2 className="question-card__question">
          {question.question}
          {question.required && <span className="question-card__required" title="Zorunlu soru">*</span>}
        </h2>
        {question.description && (
          <p className="question-card__description">{question.description}</p>
        )}
        {question.example_answers && question.example_answers.length > 0 && (
          <div className="question-card__examples">
            <span className="question-card__examples-label">Örnek cevaplar:</span>
            <ul>
              {question.example_answers.map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Cevap alanı */}
      <div className="question-card__body">
        {/* Choice (single / multiple / yes_no) */}
        {isChoice && (
          <div className="question-card__options">
            {question.answer_type === "multiple_choice" && (
              <p className="question-card__multi-hint">Birden fazla seçenek seçebilirsiniz.</p>
            )}
            {(question.options ?? []).map((opt) => (
              <ChoiceOption
                key={opt.value}
                option={opt}
                answerType={question.answer_type === "multiple_choice" ? "multiple_choice" : "single_choice"}
                isSelected={isOptionSelected(opt.value)}
                noteValue={getExistingNote(opt.value)}
                onToggle={handleToggle}
                onNoteChange={handleNoteChange}
              />
            ))}
          </div>
        )}

        {/* Short text / text */}
        {isShortText && (
          <input
            type="text"
            className="question-card__text-input"
            value={answerData.text ?? ""}
            onChange={handleTextChange}
            placeholder="Cevabınızı yazın…"
          />
        )}

        {/* Long text / textarea */}
        {isLongText && (
          <textarea
            className="question-card__textarea"
            value={answerData.text ?? ""}
            onChange={handleTextChange}
            placeholder="Cevabınızı yazın…"
            rows={5}
          />
        )}

        {/* Number */}
        {question.answer_type === "number" && (
          <input
            type="number"
            className="question-card__number-input"
            value={answerData.text ?? ""}
            onChange={handleTextChange}
            placeholder="Sayısal değer girin…"
          />
        )}

        {/* Zorunlu ama boş uyarısı */}
        {showError && (
          <p className="question-card__error-msg">
            Bu alan zorunludur. Lütfen bir cevap seçin veya girin.
          </p>
        )}
      </div>

      {/* Genel ek açıklama / not alanı */}
      <div className="question-card__general-note">
        <button
          type="button"
          className={`question-card__note-toggle ${generalNoteOpen ? "question-card__note-toggle--open" : ""}`}
          onClick={() => setGeneralNoteOpen((p) => !p)}
        >
          {generalNoteOpen ? "▾ Ek Açıklama / Not" : "▸ Ek Açıklama / Not"}
        </button>
        {generalNoteOpen && (
          <textarea
            className="question-card__general-note-input"
            value={answerData.general_note ?? ""}
            onChange={handleGeneralNoteChange}
            placeholder="Seçeneklere sığmayan bağlam veya ek bilgi buraya yazılabilir…"
            rows={3}
          />
        )}
      </div>

      {/* Kanıt Dosyaları & Ekler (FAZ-33) */}
      {projectId && businessFunctionCode && onAddAttachment && onDeleteAttachment && (
        <QuestionAttachments
          projectId={projectId}
          businessFunctionCode={businessFunctionCode}
          questionId={question.id}
          attachments={attachments}
          onAddAttachment={onAddAttachment}
          onDeleteAttachment={onDeleteAttachment}
          onUpdateDescription={onUpdateAttachmentDescription}
        />
      )}
    </div>
  );
};
