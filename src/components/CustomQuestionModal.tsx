/**
 * ERP CRM Discovery — CustomQuestionModal
 *
 * Modal allowing Project Managers to create and edit project-specific custom questions.
 * Supports: single_choice, multiple_choice, yes_no, text, textarea, number.
 * Enforces 2-10 options for choice types, with optional 'Diğer' choice.
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
    <div className="modal-backdrop" style={{ zIndex: 100 }}>
      <div className="modal-dialog" style={{ maxWidth: "560px", width: "95%" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={18} style={{ color: "var(--primary)" }} />
            <div>
              <h3 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 700 }}>
                {existingQuestion ? "Özel Soruyu Düzenle" : "Yeni Proje Özel Sorusu Ekle"}
              </h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {bfNameTr} • Yalnızca bu proje için geçerlidir
              </span>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} title="Kapat">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "70vh", overflowY: "auto" }}>
            {error && (
              <div style={{
                padding: "0.625rem 0.75rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--danger-bg)",
                border: "1px solid var(--danger-border)",
                color: "var(--danger-text)",
                fontSize: "0.8125rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Süreç / Bölüm */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                Süreç / Bölüm Adı
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Müşteri ve Sipariş Yönetimi"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                required
              />
            </div>

            {/* Soru Metni */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                Soru Metni <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Saha satış personeli siparişleri hangi cihaz üzerinden giriyor?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
              />
            </div>

            {/* Açıklama / Amaç */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                Açıklama / Danışmanlık Rehberi (Opsiyonel)
              </label>
              <textarea
                className="form-control"
                placeholder="Bu soru ile neyi tespit etmek istiyorsunuz?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Soru Tipi ve Zorunluluk */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                  Soru Tipi
                </label>
                <select
                  className="form-control"
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as CustomQuestionType)}
                >
                  <option value="single_choice">Tek Seçim (Radio)</option>
                  <option value="multiple_choice">Çoklu Seçim (Checkbox)</option>
                  <option value="yes_no">Evet / Hayır</option>
                  <option value="text">Kısa Metin</option>
                  <option value="textarea">Uzun Metin (Not/Paragraf)</option>
                  <option value="number">Sayısal Değer</option>
                </select>
              </div>

              <div className="form-group" style={{ display: "flex", alignItems: "center", paddingTop: "1.75rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.8125rem" }}>
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                  />
                  <span>Zorunlu Soru</span>
                </label>
              </div>
            </div>

            {/* Seçenekler Listesi (Choice Types) */}
            {isChoiceType && (
              <div style={{
                padding: "0.875rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-app)",
                border: "1px solid var(--border-subtle)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, margin: 0 }}>
                    Seçenekler (2-10 arası)
                  </label>
                  {options.length < 10 && (
                    <button
                      type="button"
                      className="btn btn--outline btn--xs"
                      onClick={handleAddOption}
                    >
                      <Plus size={12} /> Seçenek Ekle
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  {options.map((opt, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", width: "1.25rem" }}>
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Seçenek ${idx + 1}`}
                        value={opt.label}
                        onChange={(e) => handleOptionLabelChange(idx, e.target.value)}
                        style={{ fontSize: "0.8125rem", padding: "0.35rem 0.5rem" }}
                        required
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleRemoveOption(idx)}
                          title="Seçeneği sil"
                          style={{ color: "var(--danger)", padding: "0.25rem" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border-subtle)" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.75rem" }}>
                    <input
                      type="checkbox"
                      checked={hasOtherOption}
                      onChange={(e) => setHasOtherOption(e.target.checked)}
                    />
                    <span>"Diğer (Açıklayınız)" seçeneği ekle</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ padding: "0.875rem 1.25rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button type="button" className="btn btn--secondary btn--sm" onClick={onClose} disabled={isSaving}>
              İptal
            </button>
            <button type="submit" className="btn btn--primary btn--sm" disabled={isSaving}>
              {isSaving ? "Kaydediliyor..." : existingQuestion ? "Güncelle" : "Soruyu Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
