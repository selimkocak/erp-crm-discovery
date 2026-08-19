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
import { ChoiceOption } from "./ChoiceOption";
import { isQuestionAnswered } from "../engine/progress";

interface QuestionCardProps {
  question: Question;
  answerData: AnswerData;
  onChange: (updated: AnswerData) => void;
  showValidation?: boolean;
  onEditCustom?: (question: Question) => void;
  onDeleteCustom?: (question: Question) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  answerData,
  onChange,
  showValidation = false,
  onEditCustom,
  onDeleteCustom,
}) => {
  const [generalNoteOpen, setGeneralNoteOpen] = useState<boolean>(
    (answerData.general_note ?? "").length > 0
  );

  const selected = answerData.selected ?? [];
  const isAnswered = isQuestionAnswered(question, answerData);
  const showError = showValidation && question.required && !isAnswered;

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

          {question.is_custom && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
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
            </div>
          )}
        </div>

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
    </div>
  );
};
