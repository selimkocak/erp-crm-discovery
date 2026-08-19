/**
 * ERP CRM Discovery — Follow-up Modal (FAZ-9)
 *
 * Soru üzerinde "🟡 Sonra Dön" veya "🔴 Kritik Takip" bayrağı belirleme,
 * açıklama/neden notu girme veya mevcut bayrağı temizleme modalı.
 */

import React, { useState } from "react";
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
    existingFollowup?.flag_type || initialFlagType
  );
  const [note, setNote] = useState<string>(existingFollowup?.note || initialNote || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        className="modal-content"
        style={{ maxWidth: 540 }}
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
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ padding: "0.75rem", background: "var(--surface-muted)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                {questionId}
              </div>
              <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-color)" }}>
                {questionText}
              </div>
            </div>

            {/* Bayrak Tipi Seçimi */}
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Bayrak Türü <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setFlagType("revisit")}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${flagType === "revisit" ? "var(--warning)" : "var(--border-color)"}`,
                    background: flagType === "revisit" ? "rgba(245, 158, 11, 0.08)" : "var(--surface-color)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>🟡</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: flagType === "revisit" ? "var(--warning)" : "var(--text-color)" }}>
                      Sonra Dön
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      Bilgi eksik, başka departmandan teyit gerekli.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFlagType("critical")}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${flagType === "critical" ? "var(--danger)" : "var(--border-color)"}`,
                    background: flagType === "critical" ? "rgba(239, 68, 68, 0.08)" : "var(--surface-color)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>🔴</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: flagType === "critical" ? "var(--danger)" : "var(--text-color)" }}>
                      Kritik Takip
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      Yönetim onayı / mutlaka netleşmesi gereken konu.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Neden / Açıklama Notu */}
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                Neden / Takip Notu <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400 }}>(Opsiyonel)</span>
              </label>
              <textarea
                className="input input--textarea"
                rows={3}
                placeholder="Örn: Muhasebe müdüründen teyit alınacak, iskonto onay yetkisi sorulacak..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ width: "100%", resize: "vertical", fontSize: "0.875rem" }}
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
              gap: "0.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border-color)",
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
                className="btn btn-secondary btn-sm"
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
