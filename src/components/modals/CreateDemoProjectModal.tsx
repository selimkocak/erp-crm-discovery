/**
 * ERP CRM Discovery — CreateDemoProjectModal Component
 * FAZ-57: Kurgusal Kesikli Üretim Pilot Projesi Oluşturma Modalı
 */

import React, { useEffect } from "react";
import { X, Sparkles, Building2, ShieldCheck } from "lucide-react";
import { MANUFACTURING_PILOT_METADATA } from "../../demo/manufacturingPilot";

interface CreateDemoProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isCreating?: boolean;
}

export const CreateDemoProjectModal: React.FC<CreateDemoProjectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isCreating = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isCreating) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isCreating, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      style={{ zIndex: 1100 }}
      onClick={!isCreating ? onClose : undefined}
    >
      <div
        className="modal-content"
        style={{ maxWidth: "560px", width: "92%" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__title" style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <Sparkles size={22} style={{ color: "var(--primary, #2563eb)" }} />
            <h3 id="demo-modal-title" style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
              Örnek Üretim Projesi Oluştur
            </h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isCreating}
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {/* Explanation Text */}
          <p style={{ margin: 0, fontSize: "0.925rem", lineHeight: 1.5, color: "var(--text-primary)" }}>
            Bu işlem tamamen kurgusal veriler içeren bir eğitim ve tanıtım projesi oluşturur. Gerçek şirket veya kişisel veri içermez.
          </p>

          {/* Pilot Project Summary Box */}
          <div
            style={{
              backgroundColor: "var(--bg-surface-subtle, #f8fafc)",
              border: "1px solid var(--border-subtle, #e2e8f0)",
              borderRadius: "8px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Building2 size={18} style={{ color: "var(--primary, #2563eb)", flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>
                  Marmara Endüstriyel Sistemler A.Ş.
                </strong>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Endüstriyel Makine ve Ekipman Üretimi (Kesikli Üretim Modeli) • Bursa
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-subtle, #e2e8f0)", paddingTop: "0.625rem" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.375rem" }}>
                Örnek Proje İçeriği:
              </span>
              <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                <li><strong>{MANUFACTURING_PILOT_METADATA.functionCount} Aktif İş Fonksiyonu</strong> (Satış, Satınalma, Depo, Üretim Planlama, Kalite, Bakım, Muhasebe...)</li>
                <li><strong>{MANUFACTURING_PILOT_METADATA.answerCount} Kanonik Saha Soru Cevabı</strong> (BOM revizyonu, mükerrer stok kartı, plansız bakım senaryoları)</li>
                <li><strong>Semantik Analiz:</strong> {MANUFACTURING_PILOT_METADATA.findingCount} Bulgu, {MANUFACTURING_PILOT_METADATA.requirementCount} Gereksinim, {MANUFACTURING_PILOT_METADATA.totalRiskCount} Risk ({MANUFACTURING_PILOT_METADATA.openRiskCount} Açık), {MANUFACTURING_PILOT_METADATA.noteCount} Proje Notu</li>
                <li><strong>Yönetişim & Yetki Matrisi:</strong> Veri sahiplikleri, 4+ yetki kaydı (sapmalarla), 2 onay limiti, 2 SoD riski</li>
              </ul>
            </div>
          </div>

          {/* Privacy & Guarantee Notice */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.8125rem", color: "#0f766e" }}>
            <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
            <span>
              Oluşturulan demo projesi standart bir proje gibi düzenlenebilir, yedeklenebilir, çoğaltılabilir ve DOCX/PDF raporu üretilebilir.
            </span>
          </div>
        </div>

        {/* Actions Footer */}
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
            disabled={isCreating}
          >
            Vazgeç
          </button>
          <button
            type="button"
            className="btn btn--start"
            onClick={onConfirm}
            disabled={isCreating}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
          >
            <Sparkles size={15} />
            {isCreating ? "Örnek Proje Oluşturuluyor..." : "Örnek Projeyi Oluştur"}
          </button>
        </div>
      </div>
    </div>
  );
};
