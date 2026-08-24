/**
 * ERP CRM Discovery — ProjectDeactivateModal Component
 * FAZ-57: Projeyi Pasife Alma Onay Modalı
 */

import React, { useEffect, useState } from "react";
import { X, PauseCircle, ShieldCheck } from "lucide-react";

interface ProjectDeactivateModalProps {
  isOpen: boolean;
  projectId: string;
  projectName: string;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void> | void;
  isSubmitting?: boolean;
}

export const ProjectDeactivateModal: React.FC<ProjectDeactivateModalProps> = ({
  isOpen,
  projectName,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason.trim() || undefined);
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-modal-title"
      style={{ zIndex: 1100 }}
      onClick={!isSubmitting ? onClose : undefined}
    >
      <div
        className="modal-content"
        style={{ maxWidth: "520px", width: "92%" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__title" style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <PauseCircle size={22} style={{ color: "var(--warning, #d97706)" }} />
            <h3 id="deactivate-modal-title" style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
              Projeyi Pasife Al
            </h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Project Name Target */}
            <div>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", display: "block" }}>
                Hedef Proje:
              </span>
              <strong style={{ fontSize: "1rem", color: "var(--text-primary)" }}>{projectName}</strong>
            </div>

            {/* Explanation & Data Preservation Guarantee */}
            <div
              style={{
                backgroundColor: "var(--bg-surface-subtle, #f8fafc)",
                border: "1px solid var(--border-subtle, #e2e8f0)",
                borderRadius: "8px",
                padding: "0.875rem 1rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.625rem",
              }}
            >
              <ShieldCheck size={18} style={{ color: "#0f766e", flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "0.85rem", lineHeight: 1.45, color: "var(--text-secondary, #334155)" }}>
                <strong>Bu proje silinmeyecektir.</strong>
                <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-muted)" }}>
                  Cevaplar, notlar, riskler, ekler ve yönetişim kayıtları korunacaktır. Projeyi istediğiniz zaman
                  tekrar aktifleştirebilirsiniz.
                </p>
              </div>
            </div>

            {/* Reason Field */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="deactivation-reason" style={{ fontSize: "0.875rem", fontWeight: 600, display: "block", marginBottom: "0.375rem" }}>
                Pasife Alma Gerekçesi <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(opsiyonel)</span>
              </label>
              <textarea
                id="deactivation-reason"
                className="form-input"
                rows={3}
                placeholder="Örn: Saha analiz toplantıları tamamlandı / Yeni ERP tedarikçi seçimi bekleniyor..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
                style={{ width: "100%", resize: "vertical", fontFamily: "inherit" }}
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div
            className="modal-actions"
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid var(--border-subtle, #e2e8f0)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              backgroundColor: "var(--bg-surface-subtle, #fafafa)",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="btn btn-warning"
              disabled={isSubmitting}
              style={{
                backgroundColor: "#d97706",
                borderColor: "#b45309",
                color: "#ffffff",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <PauseCircle size={15} />
              {isSubmitting ? "İşleniyor..." : "Pasife Al"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
