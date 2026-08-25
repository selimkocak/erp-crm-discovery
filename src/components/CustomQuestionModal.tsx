/**
 * ERP CRM Discovery — CustomQuestionModal
 *
 * Modal allowing Project Managers to create and edit project-specific custom questions.
 * Supports: single_choice, multiple_choice, yes_no, text, textarea, number.
 * Enforces 2-10 options for choice types, with optional 'Diğer' choice.
 *
 * Fully integrated with Universal Modal Framework, clean solid-white card surface,
 * fixed header/footer, scrollable body, and full WCAG AA contrast.
 */

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Sparkles, AlertCircle } from "lucide-react";
import type { CustomQuestionType, ProjectCustomQuestion } from "../types";
import { createCustomQuestion, updateCustomQuestion } from "../db/client";

interface CustomQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  projectId: string;
  bfCode: string;
  bfNameTr: string;
  existingQuestion?: ProjectCustomQuestion | null;
  existingProcesses?: string[];
}

export const CustomQuestionModal: React.FC<CustomQuestionModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  projectId,
  bfCode,
  bfNameTr,
  existingQuestion,
  existingProcesses = [],
}) => {
  const [processName, setProcessName] = useState<string>("");
  const [questionText, setQuestionText] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [questionType, setQuestionType] = useState<CustomQuestionType>("single_choice");
  const [isRequired, setIsRequired] = useState<boolean>(false);
  const [options, setOptions] = useState<{ value: string; label: string; is_other?: boolean }[]>([
    { value: "opt_1", label: "" },
    { value: "opt_2", label: "" },
  ]);
  const [hasOtherOption, setHasOtherOption] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Klavye Escape ile kapatma desteği
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSaving) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  useEffect(() => {
    if (existingQuestion) {
      setProcessName(existingQuestion.process_name || "");
      setQuestionText(existingQuestion.question_text || "");
      setDescription(existingQuestion.description || "");
      setQuestionType(existingQuestion.question_type);
      setIsRequired(existingQuestion.is_required === 1);
      if (existingQuestion.options && existingQuestion.options.length > 0) {
        setOptions(
          existingQuestion.options.map((o) => ({
            value: o.value,
            label: o.label,
            is_other: o.is_other === 1,
          }))
        );
        setHasOtherOption(existingQuestion.options.some((o) => o.is_other === 1));
      }
    } else {
      setProcessName(existingProcesses[0] || "Özel Süreç Değerlendirmeleri");
      setQuestionText("");
      setDescription("");
      setQuestionType("single_choice");
      setIsRequired(false);
      setOptions([
        { value: "opt_1", label: "" },
        { value: "opt_2", label: "" },
      ]);
      setHasOtherOption(false);
    }
    setError(null);
  }, [existingQuestion, existingProcesses, isOpen]);

  if (!isOpen) return null;

  const isChoiceType = questionType === "single_choice" || questionType === "multiple_choice";

  const handleAddOption = () => {
    if (options.length >= 10) return;
    const nextIdx = options.length + 1;
    setOptions([...options, { value: `opt_${nextIdx}`, label: "" }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionLabelChange = (index: number, label: string) => {
    setOptions(
      options.map((opt, i) => (i === index ? { ...opt, label } : opt))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setError("Lütfen soru metnini yazınız.");
      return;
    }

    if (isChoiceType) {
      const validOptions = options.filter((o) => o.label.trim().length > 0);
      if (validOptions.length < 2) {
        setError("Seçenekli sorular için en az 2 geçerli seçenek girmelisiniz.");
        return;
      }
    }

    try {
      setIsSaving(true);
      setError(null);

      let finalOptions: { value: string; label: string; is_other?: boolean }[] | undefined = undefined;

      if (isChoiceType) {
        finalOptions = options
          .filter((o) => o.label.trim().length > 0)
          .map((o, idx) => ({
            value: o.value || `opt_${idx + 1}`,
            label: o.label.trim(),
            is_other: false,
          }));

        if (hasOtherOption) {
          finalOptions.push({
            value: "other",
            label: "Diğer (Açıklayınız)",
            is_other: true,
          });
        }
      }

      if (existingQuestion) {
        await updateCustomQuestion(existingQuestion.id, {
          process_name: processName.trim() || "Özel Süreç Soruları",
          question_text: questionText.trim(),
          description: description.trim() || null,
          question_type: questionType,
          is_required: isRequired,
          options: finalOptions,
        });
      } else {
        await createCustomQuestion({
          analysis_project_id: projectId,
          business_function_code: bfCode,
          process_name: processName.trim() || "Özel Süreç Soruları",
          question_text: questionText.trim(),
          description: description.trim() || null,
          question_type: questionType,
          is_required: isRequired,
          options: finalOptions,
        });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error("Özel soru kaydedilemedi:", err);
      setError(err?.message || "Özel soru kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-question-modal-title"
    >
      <div
        className="modal-content custom-question-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "680px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          maxHeight: "min(calc(100vh - 40px), calc(100dvh - 40px))",
          background: "var(--bg-surface, #ffffff)",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border-subtle, #e2e8f0)",
        }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(37, 99, 235, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary, #2563eb)",
                flexShrink: 0,
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3
                id="custom-question-modal-title"
                style={{
                  margin: 0,
                  fontSize: "1.0625rem",
                  fontWeight: 700,
                  color: "var(--text-primary, #0f172a)",
                  lineHeight: 1.3,
                }}
              >
                {existingQuestion ? "Özel Soruyu Düzenle" : "Yeni Proje Özel Sorusu Ekle"}
              </h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #64748b)", fontWeight: 500 }}>
                {bfNameTr} • Yalnızca bu proje için geçerlidir
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            title="Kapat (Esc)"
            aria-label="Kapat"
            style={{
              color: "var(--text-muted, #64748b)",
              borderRadius: "6px",
              padding: "0.4rem",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: "1 1 auto",
            minHeight: 0,
            overflow: "hidden",
            margin: 0,
          }}
        >
          {/* Modal Body */}
          <div
            className="modal-body"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.125rem",
              padding: "1.25rem 1.5rem",
              overflowY: "auto",
              flex: "1 1 auto",
              background: "var(--bg-surface, #ffffff)",
            }}
          >
            {error && (
              <div
                style={{
                  padding: "0.625rem 0.875rem",
                  borderRadius: "var(--radius-md, 8px)",
                  backgroundColor: "var(--danger-bg, #fef2f2)",
                  border: "1px solid var(--danger-border, #fecaca)",
                  color: "var(--danger-text, #991b1b)",
                  fontSize: "0.8125rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: 500,
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Süreç / Bölüm */}
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <label
                className="form-label"
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--text-primary, #0f172a)",
                  margin: 0,
                }}
              >
                Süreç / Bölüm Adı
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Müşteri ve Sipariş Yönetimi"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.55rem 0.75rem",
                  fontSize: "0.875rem",
                  background: "#ffffff",
                  border: "1px solid var(--border-medium, #cbd5e1)",
                  borderRadius: "6px",
                  color: "var(--text-primary, #0f172a)",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>

            {/* Soru Metni */}
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <label
                className="form-label"
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--text-primary, #0f172a)",
                  margin: 0,
                }}
              >
                Soru Metni <span style={{ color: "var(--danger, #dc2626)" }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Saha satış personeli siparişleri hangi cihaz üzerinden giriyor?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.55rem 0.75rem",
                  fontSize: "0.875rem",
                  background: "#ffffff",
                  border: "1px solid var(--border-medium, #cbd5e1)",
                  borderRadius: "6px",
                  color: "var(--text-primary, #0f172a)",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>

            {/* Açıklama / Amaç */}
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <label
                className="form-label"
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--text-primary, #0f172a)",
                  margin: 0,
                }}
              >
                Açıklama / Danışmanlık Rehberi (Opsiyonel)
              </label>
              <textarea
                className="form-control"
                placeholder="Bu soru ile neyi tespit etmek istiyorsunuz?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                style={{
                  width: "100%",
                  padding: "0.55rem 0.75rem",
                  fontSize: "0.875rem",
                  background: "#ffffff",
                  border: "1px solid var(--border-medium, #cbd5e1)",
                  borderRadius: "6px",
                  color: "var(--text-primary, #0f172a)",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Soru Tipi ve Zorunluluk */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                alignItems: "flex-end",
              }}
            >
              <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label
                  className="form-label"
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--text-primary, #0f172a)",
                    margin: 0,
                  }}
                >
                  Soru Tipi
                </label>
                <select
                  className="form-control"
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as CustomQuestionType)}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    fontSize: "0.875rem",
                    background: "#ffffff",
                    border: "1px solid var(--border-medium, #cbd5e1)",
                    borderRadius: "6px",
                    color: "var(--text-primary, #0f172a)",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="single_choice">Tek Seçim (Radio)</option>
                  <option value="multiple_choice">Çoklu Seçim (Checkbox)</option>
                  <option value="yes_no">Evet / Hayır</option>
                  <option value="text">Kısa Metin</option>
                  <option value="textarea">Uzun Metin (Not/Paragraf)</option>
                  <option value="number">Sayısal Değer</option>
                </select>
              </div>

              <div
                className="form-group"
                style={{
                  display: "flex",
                  alignItems: "center",
                  paddingBottom: "0.55rem",
                }}
              >
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "var(--text-primary, #0f172a)",
                    userSelect: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span>Zorunlu Soru</span>
                </label>
              </div>
            </div>

            {/* Seçenekler Listesi (Choice Types) */}
            {isChoiceType && (
              <div
                style={{
                  padding: "1rem 1.125rem",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-surface-subtle, #f8fafc)",
                  border: "1px solid var(--border-subtle, #e2e8f0)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--text-primary, #0f172a)",
                      margin: 0,
                    }}
                  >
                    Seçenekler (2-10 arası)
                  </label>
                  {options.length < 10 && (
                    <button
                      type="button"
                      className="btn btn--outline btn--xs"
                      onClick={handleAddOption}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.5rem",
                      }}
                    >
                      <Plus size={12} /> Seçenek Ekle
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {options.map((opt, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "var(--text-muted, #64748b)",
                          minWidth: "1.25rem",
                          textAlign: "right",
                        }}
                      >
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Seçenek ${idx + 1}`}
                        value={opt.label}
                        onChange={(e) => handleOptionLabelChange(idx, e.target.value)}
                        style={{
                          flex: 1,
                          fontSize: "0.875rem",
                          padding: "0.45rem 0.65rem",
                          background: "#ffffff",
                          border: "1px solid var(--border-medium, #cbd5e1)",
                          borderRadius: "6px",
                          color: "var(--text-primary, #0f172a)",
                          boxSizing: "border-box",
                        }}
                        required
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleRemoveOption(idx)}
                          title="Seçeneği sil"
                          aria-label="Seçeneği sil"
                          style={{
                            color: "var(--danger, #dc2626)",
                            padding: "0.35rem",
                            borderRadius: "4px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "0.25rem",
                    paddingTop: "0.625rem",
                    borderTop: "1px solid var(--border-subtle, #e2e8f0)",
                  }}
                >
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      fontSize: "0.8125rem",
                      color: "var(--text-secondary, #334155)",
                      userSelect: "none",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={hasOtherOption}
                      onChange={(e) => setHasOtherOption(e.target.checked)}
                      style={{ width: "15px", height: "15px", cursor: "pointer" }}
                    />
                    <span>"Diğer (Açıklayınız)" seçeneği ekle</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div
            className="modal-footer"
            style={{
              padding: "0.875rem 1.5rem",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.625rem",
              background: "var(--bg-surface-subtle, #f8fafc)",
              borderTop: "1px solid var(--border-subtle, #e2e8f0)",
              borderBottomLeftRadius: "12px",
              borderBottomRightRadius: "12px",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={onClose}
              disabled={isSaving}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn--success btn--sm"
              disabled={isSaving}
            >
              {isSaving ? "Kaydediliyor..." : existingQuestion ? "Güncelle" : "Soruyu Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
