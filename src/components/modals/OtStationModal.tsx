/**
 * ERP CRM Discovery — OtStationModal (FAZ-62B)
 *
 * Yeni istasyon ekleme ve mevcut istasyonu düzenleme modalı.
 * %100 Çevrimdışı, Türkçe hata bildirimleri, native alert içermez.
 */

import React, { useState, useEffect } from "react";
import { X, Cpu, AlertCircle, Save } from "lucide-react";
import type { OtStation, StationStatus } from "../../types";

interface OtStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stationData: {
    area_name: string | null;
    line_name: string | null;
    station_code: string;
    station_name: string;
    station_type: string | null;
    machine_name: string | null;
    machine_manufacturer: string | null;
    machine_model: string | null;
    plc_or_controller: string | null;
    operator_count: number;
    status: StationStatus;
    sort_order: number;
  }) => Promise<void>;
  editingStation?: OtStation | null;
  existingCodes?: string[];
}

export const OtStationModal: React.FC<OtStationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStation,
  existingCodes = [],
}) => {
  const [stationCode, setStationCode] = useState("");
  const [stationName, setStationName] = useState("");
  const [areaName, setAreaName] = useState("");
  const [lineName, setLineName] = useState("");
  const [stationType, setStationType] = useState("");
  const [machineName, setMachineName] = useState("");
  const [machineManufacturer, setMachineManufacturer] = useState("");
  const [machineModel, setMachineModel] = useState("");
  const [plcOrController, setPlcOrController] = useState("");
  const [operatorCount, setOperatorCount] = useState<number>(1);
  const [status, setStatus] = useState<StationStatus>("active");
  const [sortOrder, setSortOrder] = useState<number>(0);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingStation) {
      setStationCode(editingStation.station_code || "");
      setStationName(editingStation.station_name || "");
      setAreaName(editingStation.area_name || "");
      setLineName(editingStation.line_name || "");
      setStationType(editingStation.station_type || "");
      setMachineName(editingStation.machine_name || "");
      setMachineManufacturer(editingStation.machine_manufacturer || "");
      setMachineModel(editingStation.machine_model || "");
      setPlcOrController(editingStation.plc_or_controller || "");
      setOperatorCount(editingStation.operator_count ?? 1);
      setStatus(editingStation.status || "active");
      setSortOrder(editingStation.sort_order ?? 0);
    } else {
      setStationCode("");
      setStationName("");
      setAreaName("");
      setLineName("");
      setStationType("");
      setMachineName("");
      setMachineManufacturer("");
      setMachineModel("");
      setPlcOrController("");
      setOperatorCount(1);
      setStatus("active");
      setSortOrder(0);
    }
    setErrorMessage(null);
    setIsSubmitting(false);
  }, [editingStation, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = stationCode.trim();
    const cleanName = stationName.trim();

    if (!cleanCode) {
      setErrorMessage("İstasyon kodu zorunludur (örn: ST-01, CNC-01).");
      return;
    }

    if (!cleanName) {
      setErrorMessage("İstasyon adı zorunludur (örn: 5 Eksen CNC İşleme).");
      return;
    }

    // Kod tekilliği kontrolü (düzenlemede kendi kodunu hariç tut)
    const isDuplicate = existingCodes.some(
      (c) =>
        c.toLowerCase() === cleanCode.toLowerCase() &&
        (!editingStation || editingStation.station_code.toLowerCase() !== cleanCode.toLowerCase())
    );

    if (isDuplicate) {
      setErrorMessage(`"${cleanCode}" istasyon kodu bu projede zaten kullanılıyor.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        station_code: cleanCode,
        station_name: cleanName,
        area_name: areaName.trim() || null,
        line_name: lineName.trim() || null,
        station_type: stationType.trim() || null,
        machine_name: machineName.trim() || null,
        machine_manufacturer: machineManufacturer.trim() || null,
        machine_model: machineModel.trim() || null,
        plc_or_controller: plcOrController.trim() || null,
        operator_count: Math.max(0, operatorCount || 0),
        status,
        sort_order: sortOrder || 0,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "İstasyon kaydedilirken bir hata oluştu.");
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
          maxWidth: "min(680px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 48px)",
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
              <Cpu size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                {editingStation ? "İstasyonu Düzenle" : "Yeni Üretim İstasyonu Ekle"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b" }}>
                Saha veri toplama ve makine parametrelerinin istasyon bazlı keşfi
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

            {/* Row 1: Code & Name */}
            <div className="form-grid" style={{ gridTemplateColumns: "1fr 2fr" }}>
              <div className="form-group">
                <label className="form-label">
                  İstasyon Kodu <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control text-mono"
                  placeholder="Örn: ST-01"
                  value={stationCode}
                  onChange={(e) => setStationCode(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  İstasyon Adı <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: 5 Eksen CNC İşleme İstasyonu"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Row 2: Area & Line */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Üretim Alanı (Area)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: Talaşlı İmalat Alanı"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Üretim Hattı (Line)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: Gövde İmalat Hattı 1"
                  value={lineName}
                  onChange={(e) => setLineName(e.target.value)}
                />
              </div>
            </div>

            {/* Row 3: Station Type & Machine Name */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  İstasyon Türü / Prosesi
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: CNC İşleme, Kaynak, Montaj"
                  value={stationType}
                  onChange={(e) => setStationType(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Makine / Ekipman Adı
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: Dik İşleme Merkezi 1"
                  value={machineName}
                  onChange={(e) => setMachineName(e.target.value)}
                />
              </div>
            </div>

            {/* Row 4: Manufacturer & Model */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Makine Üreticisi (OEM)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: DMG Mori, Mazak, Fanuc"
                  value={machineManufacturer}
                  onChange={(e) => setMachineManufacturer(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Makine Modeli
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: DMU 50, VCN-530C"
                  value={machineModel}
                  onChange={(e) => setMachineModel(e.target.value)}
                />
              </div>
            </div>

            {/* Row 5: PLC / Controller & Status */}
            <div className="form-grid--3">
              <div className="form-group">
                <label className="form-label">
                  PLC / Controller Modeli
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: Siemens S7-1500, Fanuc 31i"
                  value={plcOrController}
                  onChange={(e) => setPlcOrController(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Operatör Sayısı
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={operatorCount}
                  onChange={(e) => setOperatorCount(parseInt(e.target.value, 10) || 0)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Durum
                </label>
                <select
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StationStatus)}
                >
                  <option value="active">Aktif</option>
                  <option value="passive">Pasif</option>
                </select>
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
              <span>{isSubmitting ? "Kaydediliyor..." : editingStation ? "Değişiklikleri Kaydet" : "İstasyonu Ekle"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
