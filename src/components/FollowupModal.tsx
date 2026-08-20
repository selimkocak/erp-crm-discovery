/**
 * ERP CRM Discovery — Follow-up Modal (FAZ-9)
 *
 * Soru üzerinde "🟡 Sonra Dön" veya "🔴 Kritik Takip" bayrağı belirleme,
 * açıklama/neden notu girme veya mevcut bayrağı temizleme modalı.
 */

import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, Clock, AlertTriangle, X, Trash2, Check } from "lucide-react";
import type { FollowupFlagType, QuestionFollowup } from "../types";

interface FollowupModalProps {
  questionId: string;
  questionText: string;
  initialFlagType?: FollowupFlagType;
  initialNote?: string;
  existingFollowup?: QuestionFollowup | null;
  onSave: (flagType: FollowupFlagType, note: string) => Promise<void>;
  onRemove: () => Promise<void>;
  onClose: () => void;
}

export const FollowupModal: React.FC<FollowupModalProps> = ({
  questionId,
  questionText,
  initialFlagType = "revisit",
  initialNote = "",
  existingFollowup,
  onSave,
  onRemove,
  onClose,
}) => {
  const [flagType, setFlagType] = useState<FollowupFlagType>(
    initialFlagType || existingFollowup?.flag_type || "revisit"
  );
  const [note, setNote] = useState<string>(existingFollowup?.note || initialNote || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state if initialFlagType or existingFollowup changes
  useEffect(() => {
    setFlagType(initialFlagType || existingFollowup?.flag_type || "revisit");
    setNote(existingFollowup?.note || initialNote || "");
  }, [initialFlagType, existingFollowup, initialNote]);

  // Modal açıldığında veya yeniden render olduğunda textarea'ya otomatik focus
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      if (noteTextareaRef.current) {
        noteTextareaRef.current.focus();
        // İmleci mevcut metnin en sonuna konumlandır
        const len = noteTextareaRef.current.value.length;
        noteTextareaRef.current.setSelectionRange(len, len);
      }
    }, 30);

    const rafId = requestAnimationFrame(() => {
      if (noteTextareaRef.current) {
        noteTextareaRef.current.focus();
      }
    });

    return () => {
      clearTimeout(focusTimer);
      cancelAnimationFrame(rafId);
    };
  }, [initialFlagType]);

  const handleFlagTypeChange = (newType: FollowupFlagType) => {
    setFlagType(newType);
    // Bayrak türü değiştirildiğinde klavye odağını textarea'da tut
    requestAnimationFrame(() => {
      noteTextareaRef.current?.focus();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSave(flagType, note.trim());
      onClose();
    } catch (err) {
      console.error("Followup save error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsSubmitting(true);
      await onRemove();
      onClose();
    } catch (err) {
      console.error("Followup remove error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content followup-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {flagType === "critical" ? (
              <AlertTriangle size={20} style={{ color: "var(--danger)" }} />
            ) : (
              <Clock size={20} style={{ color: "var(--warning)" }} />
            )}
            <h3 style={{ margin: 0, fontSize: "1.125rem" }}>
              {existingFollowup ? "Takip Bayrağını Düzenle" : "Soruya Takip Bayrağı Ekle"}
            </h3>
          </div>
          <button
            type="button"
            className="btn btn-icon btn-ghost"
            onClick={onClose}
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.25rem 1.5rem" }}>
            <div style={{ padding: "0.75rem 1rem", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem", fontWeight: 600 }}>
                {questionId}
              </div>
              <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.4 }}>
                {questionText}
              </div>
            </div>

            {/* Bayrak Tipi Seçimi (Symmetrical Grid) */}
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                Bayrak Türü <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <div className="followup-flag-grid">
                <button
                  type="button"
                  onClick={() => handleFlagTypeChange("revisit")}
                  className={`followup-flag-card ${flagType === "revisit" ? "followup-flag-card--revisit-selected" : ""}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>🟡</span>
                    <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: flagType === "revisit" ? "var(--color-warning-700, #b45309)" : "var(--text-primary)" }}>
                      Sonra Dön
                    </span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.35 }}>
                    Bilgi eksik, başka departmandan teyit gerekli.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFlagTypeChange("critical")}
                  className={`followup-flag-card ${flagType === "critical" ? "followup-flag-card--critical-selected" : ""}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>🔴</span>
                    <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: flagType === "critical" ? "var(--color-danger-700, #dc2626)" : "var(--text-primary)" }}>
                      Kritik Takip
                    </span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.35 }}>
                    Yönetim onayı / mutlaka netleşmesi gereken açık konu.
                  </div>
                </button>
              </div>
            </div>

            {/* Neden / Açıklama Notu (Full Width Textarea) */}
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--text-primary)", textAlign: "left" }}>
                Neden / Takip Notu{" "}
                {flagType === "critical" ? (
                  <span style={{ fontSize: "0.75rem", color: "var(--danger)", fontWeight: 500 }}>
                    (Kritik takip için gerekçe yazılması önerilir)
                  </span>
                ) : (
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400 }}>
                    (Opsiyonel)
                  </span>
                )}
              </label>
              <textarea
                ref={noteTextareaRef}
                autoFocus
                className="followup-modal-textarea"
                rows={3}
                placeholder="Örn: Muhasebe müdüründen teyit alınacak, iskonto onay yetkisi sorulacak..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <AlertCircle size={14} style={{ color: "var(--warning)", flexShrink: 0 }} />
              <span>
                Bayrak koyulan sorular <strong>tamamlandı sayılmaz</strong> ve raporda <strong>Açık Konular</strong> bölümünde listelenir.
              </span>
            </div>
          </div>

          <div
            className="modal-footer"
            style={{
              display: "flex",
              justifyContent: existingFollowup ? "space-between" : "flex-end",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1rem 1.5rem",
              borderTop: "1px solid var(--border-subtle)",
              background: "var(--bg-surface-subtle)",
            }}
          >
            {existingFollowup && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={handleRemove}
                disabled={isSubmitting}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              >
                <Trash2 size={14} /> Bayrağı Kaldır
              </button>
            )}

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isSubmitting}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              >
                <Check size={14} /> {isSubmitting ? "Kaydediliyor..." : "Bayrağı Kaydet"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
