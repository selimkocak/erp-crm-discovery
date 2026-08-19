/**
 * ERP CRM Discovery — ChoiceOption bileşeni
 *
 * Tek bir seçenek satırını render eder:
 * - Checkbox (multiple_choice) veya Radio (single_choice)
 * - allow_note: seçilince "Açıklama ekle" toggle
 * - is_other: seçilince not alanı otomatik açılır ve zorunlu olur
 */

import React, { useState } from "react";
import type { QuestionOption } from "../engine/types";

interface ChoiceOptionProps {
  option: QuestionOption;
  answerType: "single_choice" | "multiple_choice";
  isSelected: boolean;
  noteValue: string;
  onToggle: (value: string) => void;
  onNoteChange: (value: string, note: string) => void;
  isReadOnly?: boolean;
}

export const ChoiceOption: React.FC<ChoiceOptionProps> = ({
  option,
  answerType,
  isSelected,
  noteValue,
  onToggle,
  onNoteChange,
  isReadOnly = false,
}) => {
  const [noteOpen, setNoteOpen] = useState<boolean>(
    // is_other seçilmişse veya mevcut not varsa baştan aç
    (option.is_other && isSelected) || (isSelected && noteValue.length > 0)
  );

  const handleToggle = () => {
    if (isReadOnly) return;
    onToggle(option.value);
    // is_other seçilince not alanını otomatik aç
    if (option.is_other && !isSelected) {
      setNoteOpen(true);
    }
  };

  const handleNoteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNoteOpen((prev) => !prev);
  };

  const inputType = answerType === "multiple_choice" ? "checkbox" : "radio";
  const needsNote = option.is_other && isSelected && noteValue.trim() === "";

  return (
    <div className={`choice-option ${isSelected ? "choice-option--selected" : ""} ${needsNote ? "choice-option--needs-note" : ""}`}>
      <label className="choice-option__label" onClick={handleToggle}>
        <span className={`choice-option__input choice-option__input--${inputType} ${isSelected ? "choice-option__input--checked" : ""}`}>
          {inputType === "checkbox" && isSelected && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {inputType === "radio" && isSelected && (
            <span className="choice-option__radio-dot" />
          )}
        </span>
        <span className={`choice-option__text ${option.is_other ? "choice-option__text--other" : ""}`}>
          {option.label}
        </span>
      </label>

      {/* allow_note: seçiliyse "Açıklama ekle" toggle */}
      {isSelected && option.allow_note && !option.is_other && (
        <button
          type="button"
          className={`choice-option__note-toggle ${noteOpen ? "choice-option__note-toggle--open" : ""}`}
          onClick={handleNoteToggle}
          tabIndex={0}
        >
          {noteOpen ? "Açıklamayı gizle" : "Açıklama ekle"}
        </button>
      )}

      {/* Not alanı */}
      {isSelected && option.allow_note && (noteOpen || option.is_other) && (
        <div className={`choice-option__note-area ${option.is_other ? "choice-option__note-area--required" : ""}`}>
          <textarea
            className={`choice-option__note-input ${needsNote ? "choice-option__note-input--error" : ""}`}
            value={noteValue}
            onChange={(e) => onNoteChange(option.value, e.target.value)}
            placeholder={
              option.is_other
                ? "Lütfen belirtin (zorunlu)…"
                : "Bu seçenekle ilgili açıklama ekleyin…"
            }
            rows={2}
            autoFocus={option.is_other && noteValue.trim() === ""}
          />
          {needsNote && (
            <p className="choice-option__note-error">
              "Diğer" seçildiğinde açıklama zorunludur.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
