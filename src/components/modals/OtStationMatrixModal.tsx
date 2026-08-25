/**
 * ERP CRM Discovery — OtStationMatrixModal (FAZ-62C)
 *
 * İstasyon bazlı 3'lü Endüstriyel Keşif Matrisi:
 * 1. Veri Gereksinimleri (Karar & Aksiyon odaklı)
 * 2. Alarm ve Safety Sinyalleri (SLA & Sorumlu takipli)
 * 3. Kalite Ölçüm Cihazları ve Entegrasyon Profili
 *
 * %100 Çevrimdışı, Türkçe bildirimler, Sıfır harici API / runtime AI.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Database,
  Bell,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Activity,
} from "lucide-react";
import type {
  OtStation,
  OtDataRequirement,
  OtAlarmRequirement,
  OtQualityDevice,
} from "../../types";
import {
  getOtDataRequirements,
  createOtDataRequirement,
  updateOtDataRequirement,
  deleteOtDataRequirement,
  getOtAlarmRequirements,
  createOtAlarmRequirement,
  updateOtAlarmRequirement,
  deleteOtAlarmRequirement,
  getOtQualityDevices,
  createOtQualityDevice,
  updateOtQualityDevice,
  deleteOtQualityDevice,
} from "../../db/client";
import { OtDataRequirementModal } from "./OtDataRequirementModal";
import { OtAlarmRequirementModal } from "./OtAlarmRequirementModal";
import { OtQualityDeviceModal } from "./OtQualityDeviceModal";

interface OtStationMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: OtStation;
  projectId: string;
  onRefreshStats?: () => void;
}

type ActiveTab = "data" | "alarm" | "quality";

export const OtStationMatrixModal: React.FC<OtStationMatrixModalProps> = ({
  isOpen,
  onClose,
  station,
  projectId,
  onRefreshStats,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("data");
  const [dataReqs, setDataReqs] = useState<OtDataRequirement[]>([]);
  const [alarmReqs, setAlarmReqs] = useState<OtAlarmRequirement[]>([]);
  const [qualityDevs, setQualityDevs] = useState<OtQualityDevice[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sub-modal states
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [editingDataReq, setEditingDataReq] = useState<OtDataRequirement | null>(null);

  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [editingAlarmReq, setEditingAlarmReq] = useState<OtAlarmRequirement | null>(null);

  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);
  const [editingQualityDev, setEditingQualityDev] = useState<OtQualityDevice | null>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingType, setDeletingType] = useState<ActiveTab | null>(null);

  const loadData = useCallback(async () => {
    if (!station || !station.id) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const [dList, aList, qList] = await Promise.all([
        getOtDataRequirements(projectId, station.id),
        getOtAlarmRequirements(projectId, station.id),
        getOtQualityDevices(projectId, station.id),
      ]);
      setDataReqs(dList);
      setAlarmReqs(aList);
      setQualityDevs(qList);
    } catch (err: any) {
      setErrorMessage(err.message || "İstasyon matris verileri yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, station]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  if (!isOpen) return null;

  // ── Handlers for Data Requirements ──────────────────────────────────────────
  const handleSaveDataRequirement = async (payload: any) => {
    if (editingDataReq) {
      await updateOtDataRequirement(editingDataReq.id, payload);
    } else {
      await createOtDataRequirement({
        project_id: projectId,
        station_id: station.id,
        ...payload,
      });
    }
    await loadData();
    onRefreshStats?.();
  };

  // ── Handlers for Alarm Requirements ─────────────────────────────────────────
  const handleSaveAlarmRequirement = async (payload: any) => {
    if (editingAlarmReq) {
      await updateOtAlarmRequirement(editingAlarmReq.id, payload);
    } else {
      await createOtAlarmRequirement({
        project_id: projectId,
        station_id: station.id,
        ...payload,
      });
    }
    await loadData();
    onRefreshStats?.();
  };

  // ── Handlers for Quality Devices ───────────────────────────────────────────
  const handleSaveQualityDevice = async (payload: any) => {
    if (editingQualityDev) {
      await updateOtQualityDevice(editingQualityDev.id, payload);
    } else {
      await createOtQualityDevice({
        project_id: projectId,
        station_id: station.id,
        ...payload,
      });
    }
    await loadData();
    onRefreshStats?.();
  };

  // ── Deletion execution ──────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deletingId || !deletingType) return;
    try {
      if (deletingType === "data") {
        await deleteOtDataRequirement(deletingId);
      } else if (deletingType === "alarm") {
        await deleteOtAlarmRequirement(deletingId);
      } else if (deletingType === "quality") {
        await deleteOtQualityDevice(deletingId);
      }
      setDeletingId(null);
      setDeletingType(null);
      await loadData();
      onRefreshStats?.();
    } catch (err: any) {
      setErrorMessage(err.message || "Kayıt silinirken bir hata oluştu.");
    }
  };

  return (
    <div
      className="gov-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
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
          borderRadius: "14px",
          width: "100%",
          maxWidth: "min(960px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 48px)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "1.25rem 1.75rem",
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#eff6ff",
                color: "#1d4ed8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Activity size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    fontFamily: "monospace",
                    backgroundColor: "#e0e7ff",
                    color: "#3730a3",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  {station.station_code}
                </span>
                <h3 style={{ margin: 0, fontSize: "1.1875rem", fontWeight: 700, color: "#0f172a" }}>
                  {station.station_name}
                </h3>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "#64748b" }}>
                {[station.area_name, station.line_name, station.station_type, station.machine_name].filter(Boolean).join(" • ") || "İstasyon Keşif Matrisi"}
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
              padding: "6px",
              borderRadius: "6px",
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            padding: "0 1.75rem",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("data")}
            style={{
              padding: "0.875rem 1.25rem",
              border: "none",
              background: "transparent",
              borderBottom: activeTab === "data" ? "2px solid #2563eb" : "2px solid transparent",
              color: activeTab === "data" ? "#1d4ed8" : "#64748b",
              fontWeight: activeTab === "data" ? 700 : 500,
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Database size={16} />
            <span>Veri Gereksinimleri ({dataReqs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("alarm")}
            style={{
              padding: "0.875rem 1.25rem",
              border: "none",
              background: "transparent",
              borderBottom: activeTab === "alarm" ? "2px solid #b45309" : "2px solid transparent",
              color: activeTab === "alarm" ? "#b45309" : "#64748b",
              fontWeight: activeTab === "alarm" ? 700 : 500,
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Bell size={16} />
            <span>Alarm & Safety ({alarmReqs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("quality")}
            style={{
              padding: "0.875rem 1.25rem",
              border: "none",
              background: "transparent",
              borderBottom: activeTab === "quality" ? "2px solid #15803d" : "2px solid transparent",
              color: activeTab === "quality" ? "#15803d" : "#64748b",
              fontWeight: activeTab === "quality" ? 700 : 500,
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <CheckCircle2 size={16} />
            <span>Kalite Cihazları ({qualityDevs.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1.75rem", backgroundColor: "#f8fafc" }}>
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
                marginBottom: "1rem",
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
              <div className="question-screen__spinner" style={{ margin: "0 auto 1rem" }} />
              <p>İstasyon matris verileri yükleniyor...</p>
            </div>
          ) : (
            <>
              {/* ── TAB 1: DATA REQUIREMENTS ──────────────────────────────────────── */}
              {activeTab === "data" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "#1e293b" }}>
                        İstasyon Veri Gereksinimleri
                      </h4>
                      <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                        Hangi veri, hangi karar için, hangi kaynaktan ve hangi aksiyona bağlanarak alınacak?
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDataReq(null);
                        setIsDataModalOpen(true);
                      }}
                      className="button button--start button--sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                    >
                      <Plus size={15} />
                      <span>Yeni Veri Gereksinimi</span>
                    </button>
                  </div>

                  {dataReqs.length === 0 ? (
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        border: "1px dashed #cbd5e1",
                        padding: "3rem 1.5rem",
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      <Database size={32} style={{ color: "#94a3b8", margin: "0 auto 0.75rem" }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>Bu istasyon için henüz veri gereksinimi tanımlanmadı.</p>
                      <p style={{ margin: "4px 0 1rem", fontSize: "0.8125rem", color: "#94a3b8" }}>
                        Çevrim süreleri, sıcaklık, basınç veya sayaç gereksinimlerini ekleyin.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDataReq(null);
                          setIsDataModalOpen(true);
                        }}
                        className="button button--secondary button--sm"
                      >
                        + İlk Veri Gereksinimini Ekle
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {dataReqs.map((d) => (
                        <div
                          key={d.id}
                          style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            padding: "1rem 1.25rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <strong style={{ fontSize: "0.9375rem", color: "#0f172a" }}>{d.measurement_name}</strong>
                                {d.data_category && (
                                  <span style={{ fontSize: "0.6875rem", padding: "0.1rem 0.4rem", backgroundColor: "#f1f5f9", borderRadius: "4px", color: "#475569" }}>
                                    {d.data_category}
                                  </span>
                                )}
                                <span
                                  style={{
                                    fontSize: "0.6875rem",
                                    padding: "0.1rem 0.4rem",
                                    borderRadius: "4px",
                                    fontWeight: 600,
                                    backgroundColor: d.criticality === "critical" ? "#fee2e2" : d.criticality === "high" ? "#fef3c7" : "#e0f2fe",
                                    color: d.criticality === "critical" ? "#991b1b" : d.criticality === "high" ? "#92400e" : "#0369a1",
                                  }}
                                >
                                  {d.criticality === "critical" ? "Kritik" : d.criticality === "high" ? "Yüksek" : d.criticality === "low" ? "Düşük" : "Orta"}
                                </span>
                              </div>
                              <div style={{ fontSize: "0.8125rem", color: "#334155", marginTop: "4px" }}>
                                <strong>Amaç:</strong> {d.purpose}
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingDataReq(d);
                                  setIsDataModalOpen(true);
                                }}
                                className="button button--secondary button--xs"
                                title="Düzenle"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingId(d.id);
                                  setDeletingType("data");
                                }}
                                className="button button--danger button--xs"
                                title="Sil"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                              gap: "0.5rem",
                              fontSize: "0.75rem",
                              backgroundColor: "#f8fafc",
                              padding: "0.5rem 0.75rem",
                              borderRadius: "6px",
                              color: "#475569",
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: 600 }}>Desteklenen Karar:</span> {d.decision_supported}
                            </div>
                            <div>
                              <span style={{ fontWeight: 600 }}>Tetiklenen Aksiyon:</span> {d.required_action}
                            </div>
                            <div>
                              <span style={{ fontWeight: 600 }}>Kaynak / Yöntem:</span> {[d.source_type, d.collection_method].filter(Boolean).join(" • ") || "—"}
                            </div>
                            <div>
                              <span style={{ fontWeight: 600 }}>Sıklık / Hedef:</span> {[d.frequency, d.target_system].filter(Boolean).join(" -> ") || "—"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 2: ALARM REQUIREMENTS ──────────────────────────────────────── */}
              {activeTab === "alarm" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "#1e293b" }}>
                        İstasyon Alarm & Safety Sinyalleri
                      </h4>
                      <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                        Müdahale süreleri, eskalasyon kuralları ve sorumlu roller
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAlarmReq(null);
                        setIsAlarmModalOpen(true);
                      }}
                      className="button button--start button--sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", backgroundColor: "#b45309" }}
                    >
                      <Plus size={15} />
                      <span>Yeni Alarm / Sinyal</span>
                    </button>
                  </div>

                  {/* Safety Boundary Note */}
                  <div
                    style={{
                      backgroundColor: "#fffbeb",
                      border: "1px solid #fef3c7",
                      borderRadius: "6px",
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.75rem",
                      color: "#92400e",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                    <span>Safety kritiklik işareti yalnızca analiz amaçlıdır; ERP/CRM safety PLC'nin yerine geçmez.</span>
                  </div>

                  {alarmReqs.length === 0 ? (
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        border: "1px dashed #cbd5e1",
                        padding: "3rem 1.5rem",
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      <Bell size={32} style={{ color: "#94a3b8", margin: "0 auto 0.75rem" }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>Bu istasyon için henüz alarm tanımlanmadı.</p>
                      <p style={{ margin: "4px 0 1rem", fontSize: "0.8125rem", color: "#94a3b8" }}>
                        Duruş uyarıları, aşırı ısınma, basınç kaybı veya safety alarmlarını ekleyin.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAlarmReq(null);
                          setIsAlarmModalOpen(true);
                        }}
                        className="button button--secondary button--sm"
                      >
                        + İlk Alarm Gereksinimini Ekle
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {alarmReqs.map((a) => (
                        <div
                          key={a.id}
                          style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            padding: "1rem 1.25rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <strong style={{ fontSize: "0.9375rem", color: "#0f172a" }}>{a.alarm_name}</strong>
                                {a.alarm_code && (
                                  <span style={{ fontSize: "0.6875rem", fontFamily: "monospace", padding: "0.1rem 0.4rem", backgroundColor: "#f1f5f9", borderRadius: "4px" }}>
                                    {a.alarm_code}
                                  </span>
                                )}
                                <span
                                  style={{
                                    fontSize: "0.6875rem",
                                    padding: "0.1rem 0.4rem",
                                    borderRadius: "4px",
                                    fontWeight: 600,
                                    backgroundColor: a.severity === "critical" ? "#fee2e2" : a.severity === "high" ? "#fef3c7" : "#e0f2fe",
                                    color: a.severity === "critical" ? "#991b1b" : a.severity === "high" ? "#92400e" : "#0369a1",
                                  }}
                                >
                                  {a.severity === "critical" ? "Kritik" : a.severity === "high" ? "Yüksek" : a.severity === "low" ? "Düşük" : "Uyarı"}
                                </span>
                                {Boolean(a.safety_critical) && (
                                  <span
                                    style={{
                                      fontSize: "0.6875rem",
                                      padding: "0.1rem 0.4rem",
                                      borderRadius: "4px",
                                      fontWeight: 700,
                                      backgroundColor: "#991b1b",
                                      color: "#ffffff",
                                    }}
                                  >
                                    🚨 Safety Kritik
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: "0.8125rem", color: "#334155", marginTop: "4px" }}>
                                <strong>Koşul:</strong> {a.trigger_condition || "—"}
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAlarmReq(a);
                                  setIsAlarmModalOpen(true);
                                }}
                                className="button button--secondary button--xs"
                                title="Düzenle"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingId(a.id);
                                  setDeletingType("alarm");
                                }}
                                className="button button--danger button--xs"
                                title="Sil"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                              gap: "0.5rem",
                              fontSize: "0.75rem",
                              backgroundColor: "#f8fafc",
                              padding: "0.5rem 0.75rem",
                              borderRadius: "6px",
                              color: "#475569",
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: 600 }}>Sorumlu & SLA:</span> {a.responsible_role || "—"} {a.response_sla ? `(SLA: ${a.response_sla})` : ""}
                            </div>
                            <div>
                              <span style={{ fontWeight: 600 }}>Gerekli Aksiyon:</span> {a.required_action || "—"}
                            </div>
                            <div>
                              <span style={{ fontWeight: 600 }}>Onay & Eskalasyon:</span> {[
                                a.acknowledgement_required ? "Ack Zorunlu" : null,
                                a.escalation_required ? "Eskalasyon Var" : null,
                              ].filter(Boolean).join(" • ") || "Standart"}
                            </div>
                            <div>
                              <span style={{ fontWeight: 600 }}>Hedef Sistem:</span> {a.target_system || "—"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 3: QUALITY DEVICES ────────────────────────────────────────── */}
              {activeTab === "quality" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "#1e293b" }}>
                        İstasyon Kalite Ölçüm Cihazları
                      </h4>
                      <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                        PASS/FAIL, ölçüm formatları, port arayüzleri ve ERP/QM entegrasyonu
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQualityDev(null);
                        setIsQualityModalOpen(true);
                      }}
                      className="button button--start button--sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", backgroundColor: "#15803d" }}
                    >
                      <Plus size={15} />
                      <span>Yeni Kalite Cihazı</span>
                    </button>
                  </div>

                  {qualityDevs.length === 0 ? (
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        border: "1px dashed #cbd5e1",
                        padding: "3rem 1.5rem",
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      <CheckCircle2 size={32} style={{ color: "#94a3b8", margin: "0 auto 0.75rem" }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>Bu istasyon için henüz kalite cihazı tanımlanmadı.</p>
                      <p style={{ margin: "4px 0 1rem", fontSize: "0.8125rem", color: "#94a3b8" }}>
                        Dijital kumpas, terazi, CMM, spektrometre veya kamera sistemlerini ekleyin.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingQualityDev(null);
                          setIsQualityModalOpen(true);
                        }}
                        className="button button--secondary button--sm"
                      >
                        + İlk Kalite Cihazını Ekle
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {qualityDevs.map((q) => (
                        <div
                          key={q.id}
                          style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            padding: "1rem 1.25rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <strong style={{ fontSize: "0.9375rem", color: "#0f172a" }}>{q.device_name}</strong>
                                {q.device_type && (
                                  <span style={{ fontSize: "0.6875rem", padding: "0.1rem 0.4rem", backgroundColor: "#f1f5f9", borderRadius: "4px" }}>
                                    {q.device_type}
                                  </span>
                                )}
                                {(q.manufacturer || q.model) && (
                                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                    {[q.manufacturer, q.model].filter(Boolean).join(" ")}
                                  </span>
                                )}
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginTop: "6px" }}>
                                {Boolean(q.pass_fail_available) && (
                                  <span style={{ fontSize: "0.6875rem", padding: "0.1rem 0.35rem", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "3px", fontWeight: 600 }}>
                                    PASS/FAIL
                                  </span>
                                )}
                                {Boolean(q.measurement_values_available) && (
                                  <span style={{ fontSize: "0.6875rem", padding: "0.1rem 0.35rem", backgroundColor: "#e0f2fe", color: "#075985", borderRadius: "3px", fontWeight: 600 }}>
                                    Ölçüm Değeri
                                  </span>
                                )}
                                {Boolean(q.lot_batch_available) && (
                                  <span style={{ fontSize: "0.6875rem", padding: "0.1rem 0.35rem", backgroundColor: "#f1f5f9", color: "#334155", borderRadius: "3px" }}>
                                    Lot/Parti
                                  </span>
                                )}
                                {Boolean(q.product_code_available) && (
                                  <span style={{ fontSize: "0.6875rem", padding: "0.1rem 0.35rem", backgroundColor: "#f1f5f9", color: "#334155", borderRadius: "3px" }}>
                                    Ürün Kodu
                                  </span>
                                )}
                                {Boolean(q.operator_available) && (
                                  <span style={{ fontSize: "0.6875rem", padding: "0.1rem 0.35rem", backgroundColor: "#f1f5f9", color: "#334155", borderRadius: "3px" }}>
                                    Operatör
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingQualityDev(q);
                                  setIsQualityModalOpen(true);
                                }}
                                className="button button--secondary button--xs"
                                title="Düzenle"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingId(q.id);
                                  setDeletingType("quality");
                                }}
                                className="button button--danger button--xs"
                                title="Sil"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                              gap: "0.5rem",
                              fontSize: "0.75rem",
                              backgroundColor: "#f8fafc",
                              padding: "0.5rem 0.75rem",
                              borderRadius: "6px",
                              color: "#475569",
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: 600 }}>Format & Arayüz:</span> {[q.output_format, q.interface_type].filter(Boolean).join(" • ") || "—"}
                            </div>
                            <div>
                              <span style={{ fontWeight: 600 }}>Entegrasyon:</span> {q.integration_method || "Manuel"}
                            </div>
                            <div>
                              <span style={{ fontWeight: 600 }}>Hedef Sistem:</span> {q.target_system || "ERP/QM"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "1rem 1.75rem",
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>
            Toplam: {dataReqs.length} Veri • {alarmReqs.length} Alarm • {qualityDevs.length} Cihaz
          </span>
          <button type="button" onClick={onClose} className="button button--secondary">
            Kapat
          </button>
        </div>
      </div>

      {/* ── Sub-Modals ──────────────────────────────────────────────────────── */}
      {isDataModalOpen && (
        <OtDataRequirementModal
          isOpen={isDataModalOpen}
          onClose={() => {
            setIsDataModalOpen(false);
            setEditingDataReq(null);
          }}
          onSave={handleSaveDataRequirement}
          editingItem={editingDataReq}
          stationCode={station.station_code}
          stationName={station.station_name}
        />
      )}

      {isAlarmModalOpen && (
        <OtAlarmRequirementModal
          isOpen={isAlarmModalOpen}
          onClose={() => {
            setIsAlarmModalOpen(false);
            setEditingAlarmReq(null);
          }}
          onSave={handleSaveAlarmRequirement}
          editingItem={editingAlarmReq}
          stationCode={station.station_code}
          stationName={station.station_name}
        />
      )}

      {isQualityModalOpen && (
        <OtQualityDeviceModal
          isOpen={isQualityModalOpen}
          onClose={() => {
            setIsQualityModalOpen(false);
            setEditingQualityDev(null);
          }}
          onSave={handleSaveQualityDevice}
          editingItem={editingQualityDev}
          stationCode={station.station_code}
          stationName={station.station_name}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div
          className="gov-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
          }}
        >
          <div
            className="gov-modal"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              padding: "1.5rem",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#b91c1c", marginBottom: "0.75rem" }}>
              <AlertTriangle size={24} />
              <h4 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 700 }}>Kaydı Sil</h4>
            </div>
            <p style={{ margin: "0 0 1.25rem", fontSize: "0.875rem", color: "#475569" }}>
              Bu matris kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={() => {
                  setDeletingId(null);
                  setDeletingType(null);
                }}
              >
                Vazgeç
              </button>
              <button
                type="button"
                className="button button--danger button--sm"
                onClick={handleConfirmDelete}
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
