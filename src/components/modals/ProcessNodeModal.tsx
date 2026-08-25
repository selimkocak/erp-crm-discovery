/**
 * ERP CRM Discovery — ProcessNodeModal (FAZ-63)
 *
 * Süreç adımı ekleme / düzenleme modalı.
 * Canlı Sadelik & Kullanıcı Benimseme Riski (calculateAdoptionRisk) göstergesi içerir.
 * %100 Çevrimdışı, Türkçe bildirimler.
 */

import React, { useState, useEffect, useMemo } from "react";
import { X, Layers, Save, Info, AlertCircle } from "lucide-react";
import { calculateAdoptionRisk } from "../../types";
import type { ProcessNode, ProcessNodeType, AdoptionRiskLevel, OtStation } from "../../types";

interface ProcessNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeData: {
    node_type: ProcessNodeType;
    name: string;
    description: string | null;
    responsible_department: string | null;
    responsible_role: string | null;
    business_function_code: string | null;
    ot_station_id: string | null;
    step_order: number;
    input_description: string | null;
    output_description: string | null;
    approval_count: number;
    handoff_count: number;
    duplicate_data_entry: boolean;
    bypass_possible: boolean;
    manual_work: boolean;
    value_added: boolean;
    notes: string | null;
  }) => Promise<void>;
  editingNode?: ProcessNode | null;
  availableStations?: OtStation[];
  availableFunctions?: { code: string; name_tr: string }[];
  defaultStepOrder?: number;
}

export const ProcessNodeModal: React.FC<ProcessNodeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingNode,
  availableStations = [],
  availableFunctions = [],
  defaultStepOrder = 1,
}) => {
  const [nodeType, setNodeType] = useState<ProcessNodeType>("ACTIVITY");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [responsibleDepartment, setResponsibleDepartment] = useState("");
  const [responsibleRole, setResponsibleRole] = useState("");
  const [businessFunctionCode, setBusinessFunctionCode] = useState("");
  const [otStationId, setOtStationId] = useState("");
  const [stepOrder, setStepOrder] = useState<number>(defaultStepOrder);
  const [inputDescription, setInputDescription] = useState("");
  const [outputDescription, setOutputDescription] = useState("");
  const [approvalCount, setApprovalCount] = useState<number>(0);
  const [handoffCount, setHandoffCount] = useState<number>(0);
  const [duplicateDataEntry, setDuplicateDataEntry] = useState<boolean>(false);
  const [bypassPossible, setBypassPossible] = useState<boolean>(false);
  const [manualWork, setManualWork] = useState<boolean>(false);
  const [valueAdded, setValueAdded] = useState<boolean>(true);
  const [notes, setNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingNode) {
      setNodeType(editingNode.node_type || "ACTIVITY");
      setName(editingNode.name || "");
      setDescription(editingNode.description || "");
      setResponsibleDepartment(editingNode.responsible_department || "");
      setResponsibleRole(editingNode.responsible_role || "");
      setBusinessFunctionCode(editingNode.business_function_code || "");
      setOtStationId(editingNode.ot_station_id || "");
      setStepOrder(editingNode.step_order ?? defaultStepOrder);
      setInputDescription(editingNode.input_description || "");
      setOutputDescription(editingNode.output_description || "");
      setApprovalCount(editingNode.approval_count ?? 0);
      setHandoffCount(editingNode.handoff_count ?? 0);
      setDuplicateDataEntry(Boolean(editingNode.duplicate_data_entry));
      setBypassPossible(Boolean(editingNode.bypass_possible));
      setManualWork(Boolean(editingNode.manual_work));
      setValueAdded(editingNode.value_added !== undefined ? Boolean(editingNode.value_added) : true);
      setNotes(editingNode.notes || "");
    } else {
      setNodeType("ACTIVITY");
      setName("");
      setDescription("");
      setResponsibleDepartment("");
      setResponsibleRole("");
      setBusinessFunctionCode("");
      setOtStationId("");
      setStepOrder(defaultStepOrder);
      setInputDescription("");
      setOutputDescription("");
      setApprovalCount(0);
      setHandoffCount(0);
      setDuplicateDataEntry(false);
      setBypassPossible(false);
      setManualWork(false);
      setValueAdded(true);
      setNotes("");
    }
    setErrorMessage(null);
    setIsSubmitting(false);
  }, [editingNode, isOpen, defaultStepOrder]);

  // Live adoption risk calculation
  const calculatedRisk: AdoptionRiskLevel = useMemo(() => {
    return calculateAdoptionRisk({
      approval_count: approvalCount,
      handoff_count: handoffCount,
      duplicate_data_entry: duplicateDataEntry,
      bypass_possible: bypassPossible,
      manual_work: manualWork,
      value_added: valueAdded,
    });
  }, [approvalCount, handoffCount, duplicateDataEntry, bypassPossible, manualWork, valueAdded]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMessage("Adım adı zorunludur (örn: Sipariş Kaydı Açılması, Kalite Kontrol Onayı).");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        node_type: nodeType,
        name: cleanName,
        description: description.trim() || null,
        responsible_department: responsibleDepartment.trim() || null,
        responsible_role: responsibleRole.trim() || null,
        business_function_code: businessFunctionCode.trim() || null,
        ot_station_id: otStationId.trim() || null,
        step_order: Number(stepOrder) || 1,
        input_description: inputDescription.trim() || null,
        output_description: outputDescription.trim() || null,
        approval_count: Math.max(0, Number(approvalCount) || 0),
        handoff_count: Math.max(0, Number(handoffCount) || 0),
        duplicate_data_entry: duplicateDataEntry,
        bypass_possible: bypassPossible,
        manual_work: manualWork,
        value_added: valueAdded,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Süreç adımı kaydedilirken bir hata oluştu.");
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
        zIndex: 1060,
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
          maxWidth: "min(760px, calc(100vw - 20px))",
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
              <Layers size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                {editingNode ? "Süreç Adımını Düzenle" : "Yeni Süreç Adımı Ekle"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b" }}>
                İşlem detayı, el değiştirmeler, onaylar ve kullanıcı benimseme yükü
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

          {/* Row 1: Order, Type & Name */}
          <div style={{ display: "grid", gridTemplateColumns: "80px 140px 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Sıra <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                value={stepOrder}
                onChange={(e) => setStepOrder(parseInt(e.target.value, 10) || 1)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  textAlign: "center",
                  fontWeight: 700,
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Adım Türü
              </label>
              <select
                value={nodeType}
                onChange={(e) => setNodeType(e.target.value as ProcessNodeType)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="START">🏁 Başlangıç</option>
                <option value="ACTIVITY">⚙️ Aktivite / İşlem</option>
                <option value="DECISION">🔀 Karar / Dallanma</option>
                <option value="APPROVAL">✍️ Onay / İmza</option>
                <option value="HANDOFF">🤝 El Değiştirme</option>
                <option value="WAIT">⏳ Bekleme / Kuyruk</option>
                <option value="END">🎯 Bitiş</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Adım Adı <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Örn: Müşteri Sipariş Emrinin Açılması"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                }}
                required
              />
            </div>
          </div>

          {/* Row 2: Department & Role */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Sorumlu Departman
              </label>
              <input
                type="text"
                placeholder="Örn: Satış Operasyon, Üretim Planlama"
                value={responsibleDepartment}
                onChange={(e) => setResponsibleDepartment(e.target.value)}
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
                Sorumlu Rol / Kişi
              </label>
              <input
                type="text"
                placeholder="Örn: Müşteri Temsilcisi, Hat Şefi"
                value={responsibleRole}
                onChange={(e) => setResponsibleRole(e.target.value)}
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

          {/* Row 3: Function & OT Station Links */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                İlişkili İş Fonksiyonu (Opsiyonel)
              </label>
              <select
                value={businessFunctionCode}
                onChange={(e) => setBusinessFunctionCode(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="">— Genel / Seçilmedi —</option>
                {availableFunctions.map((fn) => (
                  <option key={fn.code} value={fn.code}>
                    {fn.name_tr} ({fn.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                İlişkili OT İstasyonu (Opsiyonel)
              </label>
              <select
                value={otStationId}
                onChange={(e) => setOtStationId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="">— Fiziksel İstasyon Yok —</option>
                {availableStations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.station_code} — {st.station_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Inputs & Outputs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Girdi Bilgisi / Belgesi (Input)
              </label>
              <input
                type="text"
                placeholder="Örn: Müşteri Satın Alma Siparişi (PO) e-postası"
                value={inputDescription}
                onChange={(e) => setInputDescription(e.target.value)}
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
                Çıktı Bilgisi / Belgesi (Output)
              </label>
              <input
                type="text"
                placeholder="Örn: Sistemde Açılan Onaylı Satış Siparişi"
                value={outputDescription}
                onChange={(e) => setOutputDescription(e.target.value)}
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

          {/* ── Process Metrics & Complexity Section ── */}
          <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h4 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Info size={16} style={{ color: "#2563eb" }} /> Süreç Karmaşıklığı ve Sadeleştirme Kriterleri
              </h4>
              {/* Calculated Risk Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Hesaplanan Benimseme Riski:</span>
                <span
                  className={`badge ${
                    calculatedRisk === "high"
                      ? "badge--danger"
                      : calculatedRisk === "medium"
                      ? "badge--warning"
                      : "badge--success"
                  }`}
                  style={{ fontWeight: 700, fontSize: "0.75rem" }}
                >
                  {calculatedRisk === "high" ? "🚨 YÜKSEK RİSK" : calculatedRisk === "medium" ? "⚠️ ORTA RİSK" : "✅ DÜŞÜK RİSK"}
                </span>
              </div>
            </div>

            {/* Counters */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.25rem" }}>
                  Gereken Onay Sayısı
                </label>
                <input
                  type="number"
                  min="0"
                  value={approvalCount}
                  onChange={(e) => setApprovalCount(parseInt(e.target.value, 10) || 0)}
                  style={{
                    width: "100%",
                    padding: "0.375rem 0.5rem",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.875rem",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.25rem" }}>
                  El Değiştirme (Handoff) Sayısı
                </label>
                <input
                  type="number"
                  min="0"
                  value={handoffCount}
                  onChange={(e) => setHandoffCount(parseInt(e.target.value, 10) || 0)}
                  style={{
                    width: "100%",
                    padding: "0.375rem 0.5rem",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.875rem",
                  }}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={duplicateDataEntry}
                  onChange={(e) => setDuplicateDataEntry(e.target.checked)}
                />
                <span>Mükerrer veri girişi var (Başka yerde girilen veriyi tekrar yazma)</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "#b91c1c", fontWeight: 600, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={bypassPossible}
                  onChange={(e) => setBypassPossible(e.target.checked)}
                />
                <span>Bypass / Etrafından dolaşma mümkün (Excel/Kağıt ile sistemi atlama)</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={manualWork}
                  onChange={(e) => setManualWork(e.target.checked)}
                />
                <span>Ağır manuel çaba / kopyala-yapıştır gerektirir</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "#15803d", fontWeight: 600, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={valueAdded}
                  onChange={(e) => setValueAdded(e.target.checked)}
                />
                <span>Katma değerli adım (Müşteri veya denetim için gerekli)</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
              Saha İnceleme Notları & Sadeleştirme Önerisi
            </label>
            <textarea
              rows={2}
              placeholder="Adımın darboğaz noktaları, çalışanların şikayetleri veya sadeleştirme potansiyeli..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "0.875rem",
                resize: "vertical",
              }}
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
              <span>{isSubmitting ? "Kaydediliyor..." : editingNode ? "Değişiklikleri Kaydet" : "Adımı Ekle"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
