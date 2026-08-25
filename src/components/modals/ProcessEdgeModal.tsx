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
          maxWidth: "540px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexDirection: "column",
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
            style={{
              border: "none",
              background: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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

          {/* Source Node */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
              Başlangıç Adımı (Çıkış) <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={sourceNodeId}
              onChange={(e) => setSourceNodeId(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "0.875rem",
                backgroundColor: "#ffffff",
              }}
              required
            >
              <option value="">— Başlangıç Adımı Seçiniz —</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.step_order}. {n.name} ({n.node_type})
                </option>
              ))}
            </select>
          </div>

          {/* Target Node */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
              Hedef Adım (Varış) <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={targetNodeId}
              onChange={(e) => setTargetNodeId(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "0.875rem",
                backgroundColor: "#ffffff",
              }}
              required
            >
              <option value="">— Hedef Adım Seçiniz —</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.step_order}. {n.name} ({n.node_type})
                </option>
              ))}
            </select>
          </div>

          {/* Label & Condition */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Bağlantı Etiketi
              </label>
              <input
                type="text"
                placeholder="Örn: Onaylandı, Reddedildi, Stok Var"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Geçiş Koşulu
              </label>
              <input
                type="text"
                placeholder="Örn: Tutar > 50.000 TL"
                value={conditionText}
                onChange={(e) => setConditionText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "0.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="button button--secondary"
              disabled={isSubmitting}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="button button--save"
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
