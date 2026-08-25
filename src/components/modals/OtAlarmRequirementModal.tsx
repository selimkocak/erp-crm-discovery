/**
 * ERP CRM Discovery — OtAlarmRequirementModal (FAZ-62C)
 *
 * OT İstasyonu Alarm ve Safety Gereksinimi Ekleme / Düzenleme Modalı.
 * Safety kritik uyarısı, SLA, eskalasyon ve sorumlu rol takibi.
 * %100 Çevrimdışı, Türkçe hata bildirimleri.
 */

import React, { useState, useEffect } from "react";
import { X, Bell, AlertTriangle, AlertCircle, Save } from "lucide-react";
import type {
  OtAlarmRequirement,
  OtAlarmSeverity,
  OtMatrixItemStatus,
} from "../../types";

interface OtAlarmRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    alarm_name: string;
    alarm_code: string | null;
    source_type: string | null;
    trigger_condition: string | null;
    severity: OtAlarmSeverity;
    safety_critical: number;
    responsible_role: string | null;
    response_sla: string | null;
    required_action: string | null;
    acknowledgement_required: number;
    escalation_required: number;
    target_system: string | null;
    status: OtMatrixItemStatus;
    notes: string | null;
  }) => Promise<void>;
  editingItem?: OtAlarmRequirement | null;
  stationCode?: string;
  stationName?: string;
}

export const OtAlarmRequirementModal: React.FC<OtAlarmRequirementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  stationCode,
  stationName,
}) => {
  const [alarmName, setAlarmName] = useState("");
  const [alarmCode, setAlarmCode] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [triggerCondition, setTriggerCondition] = useState("");
  const [severity, setSeverity] = useState<OtAlarmSeverity>("warning");
  const [safetyCritical, setSafetyCritical] = useState(false);
  const [responsibleRole, setResponsibleRole] = useState("");
  const [responseSla, setResponseSla] = useState("");
  const [requiredAction, setRequiredAction] = useState("");
  const [acknowledgementRequired, setAcknowledgementRequired] = useState(false);
  const [escalationRequired, setEscalationRequired] = useState(false);
  const [targetSystem, setTargetSystem] = useState("");
  const [status, setStatus] = useState<OtMatrixItemStatus>("active");
  const [notes, setNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setAlarmName(editingItem.alarm_name || "");
      setAlarmCode(editingItem.alarm_code || "");
      setSourceType(editingItem.source_type || "");
      setTriggerCondition(editingItem.trigger_condition || "");
      setSeverity((editingItem.severity as OtAlarmSeverity) || "warning");
      setSafetyCritical(Boolean(editingItem.safety_critical));
      setResponsibleRole(editingItem.responsible_role || "");
      setResponseSla(editingItem.response_sla || "");
      setRequiredAction(editingItem.required_action || "");
      setAcknowledgementRequired(Boolean(editingItem.acknowledgement_required));
      setEscalationRequired(Boolean(editingItem.escalation_required));
      setTargetSystem(editingItem.target_system || "");
      setStatus((editingItem.status as OtMatrixItemStatus) || "active");
      setNotes(editingItem.notes || "");
    } else {
      setAlarmName("");
      setAlarmCode("");
      setSourceType("");
      setTriggerCondition("");
      setSeverity("warning");
      setSafetyCritical(false);
      setResponsibleRole("");
      setResponseSla("");
      setRequiredAction("");
      setAcknowledgementRequired(false);
      setEscalationRequired(false);
      setTargetSystem("");
      setStatus("active");
      setNotes("");
    }
    setErrorMessage(null);
    setIsSubmitting(false);
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanAlarmName = alarmName.trim();
    if (!cleanAlarmName) {
      setErrorMessage("Alarm adı zorunludur (örn: Yüksek Sıcaklık, Acil Stop Devrede).");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        alarm_name: cleanAlarmName,
        alarm_code: alarmCode.trim() || null,
        source_type: sourceType.trim() || null,
        trigger_condition: triggerCondition.trim() || null,
        severity,
        safety_critical: safetyCritical ? 1 : 0,
        responsible_role: responsibleRole.trim() || null,
        response_sla: responseSla.trim() || null,
        required_action: requiredAction.trim() || null,
        acknowledgement_required: acknowledgementRequired ? 1 : 0,
        escalation_required: escalationRequired ? 1 : 0,
        target_system: targetSystem.trim() || null,
        status,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Alarm gereksinimi kaydedilirken bir hata oluştu.");
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
        zIndex: 1100,
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
          maxWidth: "680px",
          maxHeight: "92vh",
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
                backgroundColor: "#fef3c7",
                color: "#b45309",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bell size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                {editingItem ? "Alarm Gereksinimini Düzenle" : "Yeni Alarm / Safety Gereksinimi Ekle"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b" }}>
                {stationCode ? `${stationCode} - ${stationName || ""}` : "İstasyon Alarm Matrisi"}
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

        {/* Safety Warning Banner */}
        <div
          style={{
            backgroundColor: "#fffbeb",
            borderBottom: "1px solid #fef3c7",
            padding: "0.75rem 1.5rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.625rem",
            fontSize: "0.8125rem",
            color: "#92400e",
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>
            <strong>Güvenlik Sınırı Uyarısı:</strong> Safety kritik alarmlar analiz ve keşif amaçlıdır. ERP/CRM sistemi safety PLC yerine geçmez ve donanımsal güvenlik zincirini kontrol etmez.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.125rem" }}>
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

          {/* Row 1: Alarm Name & Code */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Alarm Adı <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Örn: Yüksek Mil Sıcaklığı, Basınç Düşüşü, E-Stop"
                value={alarmName}
                onChange={(e) => setAlarmName(e.target.value)}
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
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Alarm Kodu / ID
              </label>
              <input
                type="text"
                placeholder="Örn: ALM-201, E-04"
                value={alarmCode}
                onChange={(e) => setAlarmCode(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  fontFamily: "monospace",
                }}
              />
            </div>
          </div>

          {/* Row 2: Source Type & Trigger Condition */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Alarm Kaynağı
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="">Seçiniz</option>
                <option value="PLC / Kontrolcü">PLC / Kontrolcü</option>
                <option value="Safety Röle / I/O">Safety Röle / I/O</option>
                <option value="SCADA / HMI">SCADA / HMI</option>
                <option value="Sürücü / Servo Hatası">Sürücü / Servo Hatası</option>
                <option value="Sensör / Transmitter">Sensör / Transmitter</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Tetikleme Koşulu (Hangi Durumda Üretilir?)
              </label>
              <input
                type="text"
                placeholder="Örn: Sıcaklık > 85°C veya Basınç < 4 bar (5 sn boyunca)"
                value={triggerCondition}
                onChange={(e) => setTriggerCondition(e.target.value)}
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

          {/* Row 3: Severity & Safety Critical Checkbox */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignItems: "center" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Ciddiyet Seviyesi
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as OtAlarmSeverity)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="critical">Kritik (Üretimi Durdurur)</option>
                <option value="high">Yüksek (Performans/Kalite Kaybı)</option>
                <option value="warning">Uyarı (Müdahale Gerektirir)</option>
                <option value="info">Bilgilendirme (Operasyonel Kayıt)</option>
              </select>
            </div>
            <div style={{ paddingTop: "1.25rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#b91c1c", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={safetyCritical}
                  onChange={(e) => setSafetyCritical(e.target.checked)}
                />
                <span>🚨 Safety Kritik (İSG / Can Güvenliği)</span>
              </label>
            </div>
          </div>

          {/* Row 4: Responsible Role & Response SLA */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Sorumlu Rol / Ekip
              </label>
              <input
                type="text"
                placeholder="Örn: Bakım Teknisyeni, Vardiya Amiri"
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
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Müdahale SLA / Süre Hedefi
              </label>
              <input
                type="text"
                placeholder="Örn: 5 dakika, 15 dakika, Anında"
                value={responseSla}
                onChange={(e) => setResponseSla(e.target.value)}
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

          {/* Row 5: Required Action */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
              Gerekli Aksiyon / Standart Müdahale Prosedürü
            </label>
            <input
              type="text"
              placeholder="Örn: Soğutma sıvısı seviyesini kontrol et, filtre temizliği yap"
              value={requiredAction}
              onChange={(e) => setRequiredAction(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "0.875rem",
              }}
            />
          </div>

          {/* Row 6: Checkboxes (Acknowledgement & Escalation) & Target System */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", alignItems: "center" }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={acknowledgementRequired}
                  onChange={(e) => setAcknowledgementRequired(e.target.checked)}
                />
                <span>Operatör Teyidi (Ack) Zorunlu</span>
              </label>
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={escalationRequired}
                  onChange={(e) => setEscalationRequired(e.target.checked)}
                />
                <span>Zamanında Çözülmezse Eskalasyon</span>
              </label>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Hedef Sistem
              </label>
              <input
                type="text"
                placeholder="Örn: MES, Andon, Bakım Modülü"
                value={targetSystem}
                onChange={(e) => setTargetSystem(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.4rem 0.6rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.8125rem",
                }}
              />
            </div>
          </div>

          {/* Row 7: Notes */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
              Alarm Notları
            </label>
            <textarea
              rows={2}
              placeholder="Ek eskalasyon hiyerarşisi, hata kodları veya saha detayları..."
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
              <span>{isSubmitting ? "Kaydediliyor..." : editingItem ? "Değişiklikleri Kaydet" : "Alarmı Ekle"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
