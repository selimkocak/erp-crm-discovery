/**
 * ERP CRM Discovery — OtDataRequirementModal (FAZ-62C)
 *
 * OT İstasyonu Veri Gereksinimi Ekleme / Düzenleme Modalı.
 * "Hangi veri, hangi karar için, hangi kaynaktan, hangi sıklıkta ve hangi aksiyona bağlanarak alınmalı?"
 * %100 Çevrimdışı, Türkçe hata bildirimleri.
 */

import React, { useState, useEffect } from "react";
import { X, Database, AlertCircle, Save } from "lucide-react";
import type {
  OtDataRequirement,
  OtCriticality,
  OtIntegrationComplexity,
  OtPriority,
  OtMatrixItemStatus,
} from "../../types";

interface OtDataRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    purpose: string;
    decision_supported: string;
    required_action: string;
    data_category: string | null;
    measurement_name: string;
    source_type: string | null;
    source_name: string | null;
    collection_method: string | null;
    frequency: string | null;
    criticality: OtCriticality;
    target_system: string | null;
    retention_required: number;
    retention_period: string | null;
    business_value: string | null;
    integration_complexity: OtIntegrationComplexity;
    priority: OtPriority;
    status: OtMatrixItemStatus;
    notes: string | null;
  }) => Promise<void>;
  editingItem?: OtDataRequirement | null;
  stationCode?: string;
  stationName?: string;
}

export const OtDataRequirementModal: React.FC<OtDataRequirementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  stationCode,
  stationName,
}) => {
  const [purpose, setPurpose] = useState("");
  const [decisionSupported, setDecisionSupported] = useState("");
  const [requiredAction, setRequiredAction] = useState("");
  const [dataCategory, setDataCategory] = useState("");
  const [measurementName, setMeasurementName] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [collectionMethod, setCollectionMethod] = useState("");
  const [frequency, setFrequency] = useState("");
  const [criticality, setCriticality] = useState<OtCriticality>("medium");
  const [targetSystem, setTargetSystem] = useState("");
  const [retentionRequired, setRetentionRequired] = useState(false);
  const [retentionPeriod, setRetentionPeriod] = useState("");
  const [businessValue, setBusinessValue] = useState("");
  const [integrationComplexity, setIntegrationComplexity] = useState<OtIntegrationComplexity>("medium");
  const [priority, setPriority] = useState<OtPriority>("medium");
  const [status, setStatus] = useState<OtMatrixItemStatus>("active");
  const [notes, setNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setPurpose(editingItem.purpose || "");
      setDecisionSupported(editingItem.decision_supported || "");
      setRequiredAction(editingItem.required_action || "");
      setDataCategory(editingItem.data_category || "");
      setMeasurementName(editingItem.measurement_name || "");
      setSourceType(editingItem.source_type || "");
      setSourceName(editingItem.source_name || "");
      setCollectionMethod(editingItem.collection_method || "");
      setFrequency(editingItem.frequency || "");
      setCriticality((editingItem.criticality as OtCriticality) || "medium");
      setTargetSystem(editingItem.target_system || "");
      setRetentionRequired(Boolean(editingItem.retention_required));
      setRetentionPeriod(editingItem.retention_period || "");
      setBusinessValue(editingItem.business_value || "");
      setIntegrationComplexity((editingItem.integration_complexity as OtIntegrationComplexity) || "medium");
      setPriority((editingItem.priority as OtPriority) || "medium");
      setStatus((editingItem.status as OtMatrixItemStatus) || "active");
      setNotes(editingItem.notes || "");
    } else {
      setPurpose("");
      setDecisionSupported("");
      setRequiredAction("");
      setDataCategory("");
      setMeasurementName("");
      setSourceType("");
      setSourceName("");
      setCollectionMethod("");
      setFrequency("");
      setCriticality("medium");
      setTargetSystem("");
      setRetentionRequired(false);
      setRetentionPeriod("");
      setBusinessValue("");
      setIntegrationComplexity("medium");
      setPriority("medium");
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

    const cleanPurpose = purpose.trim();
    const cleanDecision = decisionSupported.trim();
    const cleanAction = requiredAction.trim();
    const cleanMeasurement = measurementName.trim();

    if (!cleanMeasurement) {
      setErrorMessage("Ölçüm / Sinyal adı zorunludur (örn: Çevrim Süresi, Sıcaklık).");
      return;
    }
    if (!cleanPurpose) {
      setErrorMessage("Veri toplama amacı zorunludur (örn: Hat verimliliği ve duruş analizi).");
      return;
    }
    if (!cleanDecision) {
      setErrorMessage("Desteklenen karar zorunludur (örn: Vardiya hız ayarı / bakım planlama).");
      return;
    }
    if (!cleanAction) {
      setErrorMessage("Tetiklenen aksiyon zorunludur (örn: MES iş emri kapatma / uyarı iletme).");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        purpose: cleanPurpose,
        decision_supported: cleanDecision,
        required_action: cleanAction,
        data_category: dataCategory.trim() || null,
        measurement_name: cleanMeasurement,
        source_type: sourceType.trim() || null,
        source_name: sourceName.trim() || null,
        collection_method: collectionMethod.trim() || null,
        frequency: frequency.trim() || null,
        criticality,
        target_system: targetSystem.trim() || null,
        retention_required: retentionRequired ? 1 : 0,
        retention_period: retentionRequired ? (retentionPeriod.trim() || null) : null,
        business_value: businessValue.trim() || null,
        integration_complexity: integrationComplexity,
        priority,
        status,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Veri gereksinimi kaydedilirken bir hata oluştu.");
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
          maxWidth: "720px",
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
                backgroundColor: "#eff6ff",
                color: "#1d4ed8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                {editingItem ? "Veri Gereksinimini Düzenle" : "Yeni OT Veri Gereksinimi Tanımla"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b" }}>
                {stationCode ? `${stationCode} - ${stationName || ""}` : "İstasyon Veri Matrisi"}
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

          {/* Row 1: Measurement & Category */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Ölçüm / Sinyal Adı <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Örn: Çevrim Süresi (Cycle Time), Fırın Sıcaklığı"
                value={measurementName}
                onChange={(e) => setMeasurementName(e.target.value)}
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
                Veri Kategorisi
              </label>
              <select
                value={dataCategory}
                onChange={(e) => setDataCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="">Seçiniz / Genel</option>
                <option value="Proses / İşleme">Proses / İşleme</option>
                <option value="Üretim Adedi & OEE">Üretim Adedi & OEE</option>
                <option value="Kalite & Boyut">Kalite & Boyut</option>
                <option value="Enerji & Tüketim">Enerji & Tüketim</option>
                <option value="Bakım & Titreşim">Bakım & Titreşim</option>
                <option value="İzlenebilirlik / Seri">İzlenebilirlik / Seri</option>
              </select>
            </div>
          </div>

          {/* Row 2: Purpose & Decision Supported */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
              Veri Toplama Amacı (Hangi İhtiyaç İçin?) <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Örn: İstasyon darboğazını ve çevrim sapmalarını anlık tespit etmek"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Desteklenen Karar (Hangi Karar Alınacak?) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Örn: Hat hız revizyonu veya operatör takviyesi kararı"
                value={decisionSupported}
                onChange={(e) => setDecisionSupported(e.target.value)}
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
                Tetiklenen Aksiyon (Hangi Aksiyona Bağlı?) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Örn: MES iş emri duraklatma, Andon panosuna uyarı"
                value={requiredAction}
                onChange={(e) => setRequiredAction(e.target.value)}
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

          {/* Row 3: Source, Method, Frequency */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Kaynak Türü
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
                <option value="Harici Sensör">Harici Sensör</option>
                <option value="Barkod / RFID Okuyucu">Barkod / RFID Okuyucu</option>
                <option value="Ölçüm Cihazı / Terazi">Ölçüm Cihazı / Terazi</option>
                <option value="Operatör Terminali / HMI">Operatör Terminali / HMI</option>
                <option value="Manuel Form">Manuel Form</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Toplama Yöntemi
              </label>
              <select
                value={collectionMethod}
                onChange={(e) => setCollectionMethod(e.target.value)}
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
                <option value="Otomatik (Doğrudan Veri)">Otomatik (Doğrudan Veri)</option>
                <option value="Yarı Otomatik (Teyitli)">Yarı Otomatik (Teyitli)</option>
                <option value="Manuel Giriş">Manuel Giriş</option>
                <option value="Dosya Aktarımı (CSV/Log)">Dosya Aktarımı (CSV/Log)</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Toplama Sıklığı
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
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
                <option value="Gerçek Zamanlı (<1 sn)">Gerçek Zamanlı (&lt;1 sn)</option>
                <option value="Parça / Çevrim Başına">Parça / Çevrim Başına</option>
                <option value="Saatlik / Periyodik">Saatlik / Periyodik</option>
                <option value="Vardiya Başına">Vardiya Başına</option>
                <option value="Günlük Özet">Günlük Özet</option>
              </select>
            </div>
          </div>

          {/* Row 4: Criticality, Priority, Target System */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Kritiklik Seviyesi
              </label>
              <select
                value={criticality}
                onChange={(e) => setCriticality(e.target.value as OtCriticality)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="critical">Kritik (Olmazsa Olmaz)</option>
                <option value="high">Yüksek</option>
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Entegrasyon Hedef Sistemi
              </label>
              <input
                type="text"
                placeholder="Örn: ERP, MES, SCADA, WMS"
                value={targetSystem}
                onChange={(e) => setTargetSystem(e.target.value)}
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
                Entegrasyon Zorluğu
              </label>
              <select
                value={integrationComplexity}
                onChange={(e) => setIntegrationComplexity(e.target.value as OtIntegrationComplexity)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="low">Kolay (Doğrudan Standart)</option>
                <option value="medium">Orta (Protokol/Dönüşüm Gerekli)</option>
                <option value="high">Yüksek (Özel Donanım/PLC Revizyonu)</option>
              </select>
            </div>
          </div>

          {/* Row 5: Retention Checkbox & Business Value */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignItems: "center" }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={retentionRequired}
                  onChange={(e) => setRetentionRequired(e.target.checked)}
                />
                <span>Tarihsel Saklama & Arşivleme Zorunlu</span>
              </label>
              {retentionRequired && (
                <input
                  type="text"
                  placeholder="Saklama süresi (örn: 5 yıl, yasal zorunluluk)"
                  value={retentionPeriod}
                  onChange={(e) => setRetentionPeriod(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: "0.375rem",
                    padding: "0.4rem 0.6rem",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.8125rem",
                  }}
                />
              )}
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                İş Değeri / Beklenen Fayda
              </label>
              <input
                type="text"
                placeholder="Örn: %8 duruş azaltımı, fire takibi"
                value={businessValue}
                onChange={(e) => setBusinessValue(e.target.value)}
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

          {/* Row 6: Notes */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
              Saha Notları / Açıklama
            </label>
            <textarea
              rows={2}
              placeholder="Ek teknik detaylar, veri formatı veya istasyon sınırları..."
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
              <span>{isSubmitting ? "Kaydediliyor..." : editingItem ? "Değişiklikleri Kaydet" : "Veri Gereksinimini Ekle"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
