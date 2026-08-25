/**
 * ERP CRM Discovery — ProcessEdgeModal (FAZ-63)
 *
 * Süreç adımları arasındaki geçiş bağlantısını ekleme modalı.
 * %100 Çevrimdışı, Türkçe bildirimler.
 */

import React, { useState, useEffect } from "react";
import { X, ArrowRight, AlertCircle, Save } from "lucide-react";
import type { ProcessNode, ProcessEdge } from "../../types";

interface ProcessEdgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (edgeData: {
    source_node_id: string;
    target_node_id: string;
    label: string | null;
    condition_text: string | null;
    sort_order: number;
  }) => Promise<void>;
  nodes: ProcessNode[];
  editingEdge?: ProcessEdge | null;
}

export const ProcessEdgeModal: React.FC<ProcessEdgeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  nodes,
  editingEdge,
}) => {
  const [sourceNodeId, setSourceNodeId] = useState("");
  const [targetNodeId, setTargetNodeId] = useState("");
  const [label, setLabel] = useState("");
  const [conditionText, setConditionText] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingEdge) {
      setSourceNodeId(editingEdge.source_node_id || "");
      setTargetNodeId(editingEdge.target_node_id || "");
      setLabel(editingEdge.label || "");
      setConditionText(editingEdge.condition_text || "");
      setSortOrder(editingEdge.sort_order ?? 0);
    } else {
      setSourceNodeId(nodes.length > 0 ? nodes[0].id : "");
      setTargetNodeId(nodes.length > 1 ? nodes[1].id : "");
      setLabel("");
      setConditionText("");
      setSortOrder(0);
    }
    setErrorMessage(null);
    setIsSubmitting(false);
  }, [editingEdge, isOpen, nodes]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!sourceNodeId) {
      setErrorMessage("Lütfen başlangıç adımını seçiniz.");
      return;
    }

    if (!targetNodeId) {
      setErrorMessage("Lütfen hedef adımı seçiniz.");
      return;
    }

    if (sourceNodeId === targetNodeId) {
      setErrorMessage("Başlangıç ve hedef adım aynı olamaz.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        source_node_id: sourceNodeId,
        target_node_id: targetNodeId,
        label: label.trim() || null,
        condition_text: conditionText.trim() || null,
        sort_order: sortOrder || 0,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Bağlantı kaydedilirken bir hata oluştu.");
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
        zIndex: 1070,
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
          maxWidth: "min(540px, calc(100vw - 20px))",
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
              <ArrowRight size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                {editingEdge ? "Adım Bağlantısını Düzenle" : "Yeni Adım Bağlantısı Ekle"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b" }}>
                Adımlar arası geçiş yönü, koşul veya karar dalı
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

            {/* Source & Target Nodes */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Başlangıç Adımı <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  className="form-control"
                  value={sourceNodeId}
                  onChange={(e) => setSourceNodeId(e.target.value)}
                  required
                >
                  <option value="">-- Başlangıç Seçin --</option>
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.step_order}. {n.name} ({n.node_type})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Hedef Adım <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  className="form-control"
                  value={targetNodeId}
                  onChange={(e) => setTargetNodeId(e.target.value)}
                  required
                >
                  <option value="">-- Hedef Seçin --</option>
                  {nodes
                    .filter((n) => n.id !== sourceNodeId)
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.step_order}. {n.name} ({n.node_type})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Label / Branch Name */}
            <div className="form-group">
              <label className="form-label">
                Bağlantı Etiketi / Dal Adı
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Evet, Hayır, Onaylandı, Revizyon Gerekli"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            {/* Condition Text */}
            <div className="form-group">
              <label className="form-label">
                Geçiş Koşulu / İş Kuralı
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Tutar > 50.000 TL"
                value={conditionText}
                onChange={(e) => setConditionText(e.target.value)}
              />
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
              <span>{isSubmitting ? "Kaydediliyor..." : editingEdge ? "Değişiklikleri Kaydet" : "Bağlantıyı Ekle"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
