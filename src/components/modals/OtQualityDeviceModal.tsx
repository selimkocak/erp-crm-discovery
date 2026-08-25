/**
 * ERP CRM Discovery — OtQualityDeviceModal (FAZ-62C)
 *
 * Kalite Ölçüm Cihazı ve Entegrasyon Profili Ekleme / Düzenleme Modalı.
 * PASS/FAIL, ölçüm değeri, lot/batch, port, arayüz ve format tespiti.
 * %100 Çevrimdışı, Türkçe hata bildirimleri.
 */

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Save } from "lucide-react";
import type {
  OtQualityDevice,
  OtMatrixItemStatus,
} from "../../types";

interface OtQualityDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    device_name: string;
    device_type: string | null;
    manufacturer: string | null;
    model: string | null;
    output_format: string | null;
    interface_type: string | null;
    api_available: number;
    network_share_available: number;
    test_result_available: number;
    pass_fail_available: number;
    measurement_values_available: number;
    product_code_available: number;
    lot_batch_available: number;
    operator_available: number;
    integration_method: string | null;
    target_system: string | null;
    status: OtMatrixItemStatus;
    notes: string | null;
  }) => Promise<void>;
  editingItem?: OtQualityDevice | null;
  stationCode?: string;
  stationName?: string;
}

export const OtQualityDeviceModal: React.FC<OtQualityDeviceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  stationCode,
  stationName,
}) => {
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [interfaceType, setInterfaceType] = useState("");
  const [apiAvailable, setApiAvailable] = useState(false);
  const [networkShareAvailable, setNetworkShareAvailable] = useState(false);
  const [testResultAvailable, setTestResultAvailable] = useState(true);
  const [passFailAvailable, setPassFailAvailable] = useState(true);
  const [measurementValuesAvailable, setMeasurementValuesAvailable] = useState(false);
  const [productCodeAvailable, setProductCodeAvailable] = useState(false);
  const [lotBatchAvailable, setLotBatchAvailable] = useState(false);
  const [operatorAvailable, setOperatorAvailable] = useState(false);
  const [integrationMethod, setIntegrationMethod] = useState("");
  const [targetSystem, setTargetSystem] = useState("");
  const [status, setStatus] = useState<OtMatrixItemStatus>("active");
  const [notes, setNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setDeviceName(editingItem.device_name || "");
      setDeviceType(editingItem.device_type || "");
      setManufacturer(editingItem.manufacturer || "");
      setModel(editingItem.model || "");
      setOutputFormat(editingItem.output_format || "");
      setInterfaceType(editingItem.interface_type || "");
      setApiAvailable(Boolean(editingItem.api_available));
      setNetworkShareAvailable(Boolean(editingItem.network_share_available));
      setTestResultAvailable(Boolean(editingItem.test_result_available));
      setPassFailAvailable(Boolean(editingItem.pass_fail_available));
      setMeasurementValuesAvailable(Boolean(editingItem.measurement_values_available));
      setProductCodeAvailable(Boolean(editingItem.product_code_available));
      setLotBatchAvailable(Boolean(editingItem.lot_batch_available));
      setOperatorAvailable(Boolean(editingItem.operator_available));
      setIntegrationMethod(editingItem.integration_method || "");
      setTargetSystem(editingItem.target_system || "");
      setStatus((editingItem.status as OtMatrixItemStatus) || "active");
      setNotes(editingItem.notes || "");
    } else {
      setDeviceName("");
      setDeviceType("");
      setManufacturer("");
      setModel("");
      setOutputFormat("");
      setInterfaceType("");
      setApiAvailable(false);
      setNetworkShareAvailable(false);
      setTestResultAvailable(true);
      setPassFailAvailable(true);
      setMeasurementValuesAvailable(false);
      setProductCodeAvailable(false);
      setLotBatchAvailable(false);
      setOperatorAvailable(false);
      setIntegrationMethod("");
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

    const cleanDeviceName = deviceName.trim();
    if (!cleanDeviceName) {
      setErrorMessage("Cihaz adı zorunludur (örn: Mitutoyo Dijital Kumpas, CMM Ölçüm Tezgahı).");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        device_name: cleanDeviceName,
        device_type: deviceType.trim() || null,
        manufacturer: manufacturer.trim() || null,
        model: model.trim() || null,
        output_format: outputFormat.trim() || null,
        interface_type: interfaceType.trim() || null,
        api_available: apiAvailable ? 1 : 0,
        network_share_available: networkShareAvailable ? 1 : 0,
        test_result_available: testResultAvailable ? 1 : 0,
        pass_fail_available: passFailAvailable ? 1 : 0,
        measurement_values_available: measurementValuesAvailable ? 1 : 0,
        product_code_available: productCodeAvailable ? 1 : 0,
        lot_batch_available: lotBatchAvailable ? 1 : 0,
        operator_available: operatorAvailable ? 1 : 0,
        integration_method: integrationMethod.trim() || null,
        target_system: targetSystem.trim() || null,
        status,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Kalite cihazı kaydedilirken bir hata oluştu.");
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
          maxWidth: "700px",
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
                backgroundColor: "#f0fdf4",
                color: "#15803d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                {editingItem ? "Kalite Cihazını Düzenle" : "Yeni Kalite Ölçüm Cihazı Tanımla"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b" }}>
                {stationCode ? `${stationCode} - ${stationName || ""}` : "İstasyon Kalite Cihazları"}
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

          {/* Row 1: Device Name & Device Type */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Cihaz Adı <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Örn: 3D CMM Koordinat Ölçüm Cihazı, Dijital Terazi"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
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
                Cihaz Tipi
              </label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
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
                <option value="CMM / 3D Tarama">CMM / 3D Tarama</option>
                <option value="Dijital Kumpas / Mikrometre">Dijital Kumpas / Mikrometre</option>
                <option value="Endüstriyel Terazi">Endüstriyel Terazi</option>
                <option value="Kamera / Vision Sistemi">Kamera / Vision Sistemi</option>
                <option value="Sertlik / Mukavemet Ölçer">Sertlik / Mukavemet Ölçer</option>
                <option value="Sızdırmazlık / Test Cihazı">Sızdırmazlık / Test Cihazı</option>
                <option value="Spektrometre / Laboratuvar">Spektrometre / Laboratuvar</option>
              </select>
            </div>
          </div>

          {/* Row 2: Manufacturer & Model */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Cihaz Üreticisi (OEM)
              </label>
              <input
                type="text"
                placeholder="Örn: Zeiss, Mitutoyo, Mettler Toledo, Keyence"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
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
                Cihaz Modeli
              </label>
              <input
                type="text"
                placeholder="Örn: Contura G2, Digimatic, CV-X400"
                value={model}
                onChange={(e) => setModel(e.target.value)}
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

          {/* Row 3: Output Format & Interface Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Çıktı / Dosya Formatı
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
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
                <option value="CSV / Excel">CSV / Excel</option>
                <option value="JSON / REST API">JSON / REST API</option>
                <option value="Seri ASCII / Ham Metin">Seri ASCII / Ham Metin</option>
                <option value="Veritabanı (SQL Doğrudan)">Veritabanı (SQL Doğrudan)</option>
                <option value="PDF Rapor">PDF Rapor</option>
                <option value="OPC-UA / MQTT">OPC-UA / MQTT</option>
                <option value="Yalnızca Ekran (Giriş Yok)">Yalnızca Ekran (Giriş Yok)</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Fiziksel / Ağ Arayüzü
              </label>
              <select
                value={interfaceType}
                onChange={(e) => setInterfaceType(e.target.value)}
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
                <option value="Ethernet (TCP/IP)">Ethernet (TCP/IP)</option>
                <option value="RS-232 / RS-485 Seri Port">RS-232 / RS-485 Seri Port</option>
                <option value="USB (Sanal COM / HID)">USB (Sanal COM / HID)</option>
                <option value="Bluetooth / Kablosuz">Bluetooth / Kablosuz</option>
                <option value="Wi-Fi Ağ Paylaşımı">Wi-Fi Ağ Paylaşımı</option>
              </select>
            </div>
          </div>

          {/* Row 4: Data Capabilities Checkboxes */}
          <div style={{ backgroundColor: "#f8fafc", padding: "0.875rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.625rem" }}>
              Cihazın Ürettiği Veri Yetenekleri & Alanlar
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={passFailAvailable}
                  onChange={(e) => setPassFailAvailable(e.target.checked)}
                />
                <span>✓ PASS / FAIL Kararı</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={measurementValuesAvailable}
                  onChange={(e) => setMeasurementValuesAvailable(e.target.checked)}
                />
                <span>✓ Sayısal Ölçüm Değerleri</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={lotBatchAvailable}
                  onChange={(e) => setLotBatchAvailable(e.target.checked)}
                />
                <span>✓ Lot / Parti Numarası</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={productCodeAvailable}
                  onChange={(e) => setProductCodeAvailable(e.target.checked)}
                />
                <span>✓ Ürün / Parça Kodu</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={operatorAvailable}
                  onChange={(e) => setOperatorAvailable(e.target.checked)}
                />
                <span>✓ Operatör / Kullanıcı ID</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={apiAvailable}
                  onChange={(e) => setApiAvailable(e.target.checked)}
                />
                <span>✓ Doğrudan API / SDK Var</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={networkShareAvailable}
                  onChange={(e) => setNetworkShareAvailable(e.target.checked)}
                />
                <span>✓ Ağ Klasör Paylaşımı (SMB)</span>
              </label>
            </div>
          </div>

          {/* Row 5: Integration Method & Target System */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Önerilen Entegrasyon Yöntemi
              </label>
              <select
                value={integrationMethod}
                onChange={(e) => setIntegrationMethod(e.target.value)}
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
                <option value="Otomatik (Ağ Klasörü / Dosya İzleyici)">Otomatik (Ağ Klasörü / Dosya İzleyici)</option>
                <option value="Doğrudan Cihaz API / Webhook">Doğrudan Cihaz API / Webhook</option>
                <option value="Seri Port Dinleyici (Agent)">Seri Port Dinleyici (Agent)</option>
                <option value="Manuel Form ile Giriş">Manuel Form ile Giriş</option>
                <option value="PLC Üzerinden Aktarım">PLC Üzerinden Aktarım</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                Hedef Kalite / ERP Modülü
              </label>
              <input
                type="text"
                placeholder="Örn: ERP Kalite Kontrol (QM), MES Kalite Modülü"
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
          </div>

          {/* Row 6: Notes */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
              Kalite Cihazı Saha Notları
            </label>
            <textarea
              rows={2}
              placeholder="Cihaz kalibrasyon periyotları, operatör alışkanlıkları veya entegrasyon sınırları..."
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
              <span>{isSubmitting ? "Kaydediliyor..." : editingItem ? "Değişiklikleri Kaydet" : "Kalite Cihazını Ekle"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
