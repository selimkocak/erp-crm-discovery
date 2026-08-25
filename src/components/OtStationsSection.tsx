/**
 * ERP CRM Discovery — OtStationsSection (FAZ-62B)
 *
 * Proje Detay ekranında OT_INDUSTRIAL_DATA modülü aktif olduğunda gösterilen
 * İstasyon Profili ve Makine Envanteri yönetim bileşeni.
 */

import React, { useState } from "react";
import {
  Cpu,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowRight,
  AlertTriangle,
  Database,
} from "lucide-react";
import type { OtStation, StationStatus } from "../types";
import { OtStationModal } from "./modals/OtStationModal";
import { OtStationMatrixModal } from "./modals/OtStationMatrixModal";
import {
  createOtStation,
  updateOtStation,
  toggleOtStationStatus,
  deleteOtStation,
} from "../db/client";

interface OtStationsSectionProps {
  projectId: string;
  stations: OtStation[];
  onReloadStations: () => Promise<void>;
  onOpenStationQuestions: (station: OtStation) => void;
  showToast: (type: "success" | "info" | "error", message: string) => void;
}

export const OtStationsSection: React.FC<OtStationsSectionProps> = ({
  projectId,
  stations,
  onReloadStations,
  onOpenStationQuestions,
  showToast,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<OtStation | null>(null);
  const [deletingStation, setDeletingStation] = useState<OtStation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [matrixStation, setMatrixStation] = useState<OtStation | null>(null);

  const totalStations = stations.length;
  const activeStations = stations.filter((s) => s.status === "active").length;
  const areas = new Set(stations.map((s) => s.area_name?.trim()).filter(Boolean));
  const lines = new Set(stations.map((s) => s.line_name?.trim()).filter(Boolean));

  const handleSaveStation = async (stationData: {
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
  }) => {
    if (editingStation) {
      await updateOtStation(editingStation.id, stationData);
      showToast("success", `"${stationData.station_name}" istasyonu güncellendi.`);
    } else {
      await createOtStation({
        project_id: projectId,
        ...stationData,
      });
      showToast("success", `"${stationData.station_name}" istasyonu oluşturuldu.`);
    }
    await onReloadStations();
  };

  const handleToggleStatus = async (station: OtStation) => {
    const nextStatus: StationStatus = station.status === "active" ? "passive" : "active";
    try {
      await toggleOtStationStatus(station.id, nextStatus);
      showToast(
        "info",
        `"${station.station_name}" durumu ${nextStatus === "active" ? "Aktif" : "Pasif"} yapıldı.`
      );
      await onReloadStations();
    } catch (err: any) {
      showToast("error", err.message || "Durum güncellenirken hata oluştu.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingStation) return;
    try {
      setIsDeleting(true);
      await deleteOtStation(deletingStation.id);
      showToast("success", `"${deletingStation.station_name}" istasyonu ve bağlı cevapları silindi.`);
      setDeletingStation(null);
      await onReloadStations();
    } catch (err: any) {
      showToast("error", err.message || "İstasyon silinirken hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      style={{
        marginTop: "1.75rem",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      {/* Section Header */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
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
              OT İstasyon Profili ve Makine Envanteri
            </h3>
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b" }}>
              Saha veri toplama için tanımlanmış üretim istasyonları ve fiziksel makine parkı
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingStation(null);
            setIsModalOpen(true);
          }}
          className="button button--start"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Plus size={16} />
          <span>Yeni İstasyon Ekle</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          padding: "1rem 1.5rem",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #f1f5f9",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
        }}
      >
        <div style={{ padding: "0.75rem 1rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
            TOPLAM İSTASYON
          </span>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e3a8a", marginTop: "0.25rem" }}>
            {totalStations} Adet
          </div>
        </div>

        <div style={{ padding: "0.75rem 1rem", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#166534", textTransform: "uppercase" }}>
            AKTİF İSTASYON
          </span>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#15803d", marginTop: "0.25rem" }}>
            {activeStations} Adet
          </div>
        </div>

        <div style={{ padding: "0.75rem 1rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
            ÜRETİM ALANLARI
          </span>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#334155", marginTop: "0.25rem" }}>
            {areas.size} Alan
          </div>
        </div>

        <div style={{ padding: "0.75rem 1rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
            ÜRETİM HATLARI
          </span>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#334155", marginTop: "0.25rem" }}>
            {lines.size} Hat
          </div>
        </div>
      </div>

      {/* Stations Table / Empty State */}
      {stations.length === 0 ? (
        <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "#64748b" }}>
          <Cpu size={40} style={{ margin: "0 auto 0.75rem", color: "#94a3b8", opacity: 0.7 }} />
          <h4 style={{ margin: "0 0 0.5rem", fontSize: "1rem", fontWeight: 600, color: "#334155" }}>
            Henüz Tanımlı Üretim İstasyonu Yok
          </h4>
          <p style={{ margin: "0 0 1.25rem", fontSize: "0.875rem", maxWidth: "440px", marginLeft: "auto", marginRight: "auto" }}>
            Fabrikanızdaki CNC, robotik hücre, pres veya montaj istasyonlarını ekleyerek istasyon bazlı veri gereksinim keşfini başlatın.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingStation(null);
              setIsModalOpen(true);
            }}
            className="button button--start"
          >
            İlk İstasyonu Ekle
          </button>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, width: "13%" }}>İstasyon Kodu</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, width: "20%" }}>İstasyon Adı & Türü</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, width: "17%" }}>Alan / Hat</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, width: "20%" }}>Makine & PLC</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, width: "10%" }}>Durum</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, width: "20%", textAlign: "right" }}>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((st) => (
                <tr
                  key={st.id}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    backgroundColor: st.status === "passive" ? "#fcfcfc" : "#ffffff",
                    opacity: st.status === "passive" ? 0.75 : 1,
                  }}
                >
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        backgroundColor: "#eff6ff",
                        color: "#1e40af",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "0.8125rem",
                      }}
                    >
                      {st.station_code}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>{st.station_name}</div>
                    {st.station_type && (
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{st.station_type}</span>
                    )}
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <div style={{ color: "#334155" }}>{st.area_name || "—"}</div>
                    {st.line_name && (
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{st.line_name}</span>
                    )}
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <div style={{ fontWeight: 500, color: "#334155" }}>{st.machine_name || "—"}</div>
                    {(st.machine_manufacturer || st.plc_or_controller) && (
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {[st.machine_manufacturer, st.plc_or_controller].filter(Boolean).join(" | ")}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: st.status === "active" ? "#dcfce7" : "#f1f5f9",
                        color: st.status === "active" ? "#15803d" : "#64748b",
                      }}
                    >
                      {st.status === "active" ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                      <button
                        type="button"
                        onClick={() => setMatrixStation(st)}
                        title="Veri, Alarm & Kalite Matrisi"
                        className="button button--secondary"
                        style={{
                          padding: "4px 8px",
                          fontSize: "0.75rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          color: "#1d4ed8",
                          borderColor: "#bfdbfe",
                          backgroundColor: "#eff6ff",
                        }}
                      >
                        <Database size={12} />
                        <span>Matris</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenStationQuestions(st)}
                        title="İstasyon Sorularını Keşfet"
                        className="button button--continue"
                        style={{
                          padding: "4px 8px",
                          fontSize: "0.75rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span>Keşif</span>
                        <ArrowRight size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingStation(st);
                          setIsModalOpen(true);
                        }}
                        title="İstasyonu Düzenle"
                        style={{
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#ffffff",
                          color: "#475569",
                          borderRadius: "6px",
                          padding: "4px 6px",
                          cursor: "pointer",
                        }}
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(st)}
                        title={st.status === "active" ? "Pasife Al" : "Aktifleştir"}
                        style={{
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#ffffff",
                          color: st.status === "active" ? "#d97706" : "#16a34a",
                          borderRadius: "6px",
                          padding: "4px 6px",
                          cursor: "pointer",
                        }}
                      >
                        {st.status === "active" ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingStation(st)}
                        title="İstasyonu Sil"
                        style={{
                          border: "1px solid #fecaca",
                          backgroundColor: "#fef2f2",
                          color: "#dc2626",
                          borderRadius: "6px",
                          padding: "4px 6px",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* OtStationModal */}
      <OtStationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStation}
        editingStation={editingStation}
        existingCodes={stations.map((s) => s.station_code)}
      />

      {/* OtStationMatrixModal (FAZ-62C) */}
      {matrixStation && (
        <OtStationMatrixModal
          isOpen={Boolean(matrixStation)}
          onClose={() => setMatrixStation(null)}
          station={matrixStation}
          projectId={projectId}
          onRefreshStats={onReloadStations}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingStation && (
        <div
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
          onClick={() => setDeletingStation(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "1.5rem",
              maxWidth: "440px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "#fee2e2",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                  İstasyonu Silmek İstiyor musunuz?
                </h4>
                <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b" }}>
                  [{deletingStation.station_code}] {deletingStation.station_name}
                </p>
              </div>
            </div>

            <p style={{ fontSize: "0.875rem", color: "#475569", marginBottom: "1.25rem", lineHeight: 1.5 }}>
              Bu istasyon ve istasyona özel verilmiş tüm soru cevapları kalıcı olarak silinecektir. Bu işlem geri alınamaz.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setDeletingStation(null)}
                disabled={isDeleting}
              >
                Vazgeç
              </button>
              <button
                type="button"
                className="button"
                style={{ backgroundColor: "#dc2626", color: "#ffffff", border: "none" }}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Siliniyor..." : "Evet, İstasyonu Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
