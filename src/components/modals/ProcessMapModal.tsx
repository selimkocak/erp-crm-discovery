/**
 * ERP CRM Discovery — ProcessMapModal (FAZ-63)
 *
 * Yeni süreç haritası ekleme ve mevcut haritayı düzenleme modalı.
 * %100 Çevrimdışı, Türkçe hata bildirimleri.
 */

import React, { useState, useEffect } from "react";
import { X, GitCommit, AlertCircle, Save } from "lucide-react";
import type { ProcessMap, ProcessMapStatus } from "../../types";

interface ProcessMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mapData: {
    name: string;
    process_area: string | null;
    owner_role: string | null;
    status: ProcessMapStatus;
    description: string | null;
    sort_order: number;
  }) => Promise<void>;
  editingMap?: ProcessMap | null;
}

export const ProcessMapModal: React.FC<ProcessMapModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMap,
}) => {
  const [name, setName] = useState("");
  const [processArea, setProcessArea] = useState("");
  const [ownerRole, setOwnerRole] = useState("");
  const [status, setStatus] = useState<ProcessMapStatus>("active");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingMap) {
      setName(editingMap.name || "");
      setProcessArea(editingMap.process_area || "");
      setOwnerRole(editingMap.owner_role || "");
      setStatus(editingMap.status || "active");
      setDescription(editingMap.description || "");
      setSortOrder(editingMap.sort_order ?? 0);
    } else {
      setName("");
      setProcessArea("");
      setOwnerRole("");
      setStatus("active");
      setDescription("");
      setSortOrder(0);
    }
    setErrorMessage(null);
    setIsSubmitting(false);
  }, [editingMap, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMessage("Süreç adı zorunludur (örn: Siparişten Teslimata, Satın Alma Onay Akışı).");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        name: cleanName,
        process_area: processArea.trim() || null,
        owner_role: ownerRole.trim() || null,
        status,
        description: description.trim() || null,
        sort_order: sortOrder || 0,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Süreç haritası kaydedilirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="gov-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="gov-modal"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "min(600px, calc(100vw - 20px))",
          maxHeight: "min(calc(100vh - 20px), calc(100dvh - 20px))",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GitCommit size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                {editingMap ? "Süreç Haritasını Düzenle" : "Yeni İş Süreci Haritası Ekle"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b" }}>
                Gerçek iş akışı modelleme, süreç sadeliği ve kullanıcı benimseme analizi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0, overflow: "hidden" }}>
          <div className="modal-body">
            {errorMessage && (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "0.75rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#b91c1c",
                  fontSize: "0.875rem",
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Process Name */}
            <div className="form-group">
              <label className="form-label">
                Süreç Adı <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Siparişten Tahsilata (O2C) Akışı"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Process Area & Owner Role */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Süreç Alanı / Kapsamı
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: Satış, Üretim, Satın Alma"
                  value={processArea}
                  onChange={(e) => setProcessArea(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Süreç Sahibi Rol / Departman
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: Satış Operasyon Müdürü"
                  value={ownerRole}
                  onChange={(e) => setOwnerRole(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                Süreç Açıklaması & Kapsam Notları
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Sürecin başlangıç tetikleyicisi, temel amacı ve beklenen ana çıktısı..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Status & Sort Order */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Durum
                </label>
                <select
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProcessMapStatus)}
                >
                  <option value="active">Aktif</option>
                  <option value="draft">Taslak</option>
                  <option value="archived">Arşivlendi</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Sıralama Önceliği
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="btn btn-save"
              disabled={isSubmitting}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Save size={16} />
              <span>{isSubmitting ? "Kaydediliyor..." : editingMap ? "Değişiklikleri Kaydet" : "Süreç Haritasını Ekle"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
