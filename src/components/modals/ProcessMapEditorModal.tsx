/**
 * ERP CRM Discovery — ProcessMapEditorModal (FAZ-63)
 *
 * Süreç Haritası Akış Editörü & Kullanıcı Benimsemesi Analiz Paneli.
 * Adım listesi, akış bağlantıları, KPI sayaçları ve sadeleştirme teşhisleri.
 * %100 Çevrimdışı, native alert içermez.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  GitCommit,
  Layers,
  ArrowRight,
  ShieldAlert,
  Cpu,
} from "lucide-react";
import {
  getProcessNodes,
  getProcessEdges,
  createProcessNode,
  updateProcessNode,
  deleteProcessNode,
  createProcessEdge,
  deleteProcessEdge,
  getOtStations,
} from "../../db/client";
import { ProcessNodeModal } from "./ProcessNodeModal";
import { ProcessEdgeModal } from "./ProcessEdgeModal";
import type { ProcessMap, ProcessNode, ProcessEdge, OtStation } from "../../types";

interface ProcessMapEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  processMap: ProcessMap | null;
  projectId: string;
  availableFunctions?: { code: string; name_tr: string }[];
  onDataChanged?: () => void;
}

export const ProcessMapEditorModal: React.FC<ProcessMapEditorModalProps> = ({
  isOpen,
  onClose,
  processMap,
  projectId,
  availableFunctions = [],
  onDataChanged,
}) => {
  const [nodes, setNodes] = useState<ProcessNode[]>([]);
  const [edges, setEdges] = useState<ProcessEdge[]>([]);
  const [stations, setStations] = useState<OtStation[]>([]);
  const [activeTab, setActiveTab] = useState<"steps" | "edges">("steps");

  // Submodals
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<ProcessNode | null>(null);

  const [isEdgeModalOpen, setIsEdgeModalOpen] = useState(false);
  const [editingEdge, setEditingEdge] = useState<ProcessEdge | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: "node" | "edge";
    id: string;
    name: string;
  } | null>(null);

  const loadMapData = useCallback(async () => {
    if (!processMap) return;
    try {
      const [fetchedNodes, fetchedEdges, fetchedStations] = await Promise.all([
        getProcessNodes(processMap.id),
        getProcessEdges(processMap.id),
        getOtStations(projectId),
      ]);
      setNodes(fetchedNodes);
      setEdges(fetchedEdges);
      setStations(fetchedStations);
    } catch (err) {
      console.error("Süreç haritası verileri yüklenirken hata:", err);
    }
  }, [processMap, projectId]);

  useEffect(() => {
    if (isOpen && processMap) {
      loadMapData();
    }
  }, [isOpen, processMap, loadMapData]);

  if (!isOpen || !processMap) return null;

  // Station mapping
  const stationMap = new Map<string, OtStation>();
  for (const st of stations) {
    stationMap.set(st.id, st);
  }

  // Node name mapping
  const nodeMap = new Map<string, ProcessNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  // KPI Calculations
  const highRiskCount = nodes.filter((n) => n.adoption_risk === "high").length;
  const totalApprovals = nodes.reduce((sum, n) => sum + (n.approval_count || 0), 0);
  const totalHandoffs = nodes.reduce((sum, n) => sum + (n.handoff_count || 0), 0);
  const duplicateEntryCount = nodes.filter((n) => n.duplicate_data_entry === 1).length;
  const bypassCount = nodes.filter((n) => n.bypass_possible === 1).length;

  // Node CRUD Handlers
  const handleSaveNode = async (nodeData: any) => {
    if (!processMap) return;
    if (editingNode) {
      await updateProcessNode(editingNode.id, nodeData);
    } else {
      await createProcessNode({
        process_map_id: processMap.id,
        ...nodeData,
      });
    }
    await loadMapData();
    onDataChanged?.();
  };

  const handleDeleteNode = async (nodeId: string) => {
    await deleteProcessNode(nodeId);
    setDeleteConfirmation(null);
    await loadMapData();
    onDataChanged?.();
  };

  // Edge CRUD Handlers
  const handleSaveEdge = async (edgeData: any) => {
    if (!processMap) return;
    await createProcessEdge({
      process_map_id: processMap.id,
      ...edgeData,
    });
    await loadMapData();
    onDataChanged?.();
  };

  const handleDeleteEdge = async (edgeId: string) => {
    await deleteProcessEdge(edgeId);
    setDeleteConfirmation(null);
    await loadMapData();
    onDataChanged?.();
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
        zIndex: 1040,
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
          maxWidth: "min(1080px, calc(100vw - 20px))",
          maxHeight: "min(calc(100vh - 20px), calc(100dvh - 20px))",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.75rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to right, #f8fafc, #ffffff)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                backgroundColor: "#eff6ff",
                color: "#1e40af",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GitCommit size={24} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>
                  {processMap.name}
                </h3>
                <span className={`badge ${processMap.status === "active" ? "badge--on-track" : "badge--neutral"}`}>
                  {processMap.status === "active" ? "Aktif" : "Pasif"}
                </span>
                {processMap.process_area && (
                  <span className="badge badge--secondary text-xs">{processMap.process_area}</span>
                )}
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "#64748b" }}>
                {processMap.owner_role ? `Süreç Sahibi: ${processMap.owner_role} • ` : ""}
                Süreç adımları, kullanıcı benimseme yükü ve sadeleştirme fırsatları
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

        {/* KPI & Summary Banner */}
        <div style={{ padding: "1rem 1.75rem", backgroundColor: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem" }}>
            <div style={{ backgroundColor: "#ffffff", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b" }}>TOPLAM ADIM</span>
              <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>{nodes.length}</span>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: highRiskCount > 0 ? "#b91c1c" : "#64748b" }}>
                YÜKSEK BENİMSEME RİSKİ
              </span>
              <span style={{ fontSize: "1.125rem", fontWeight: 700, color: highRiskCount > 0 ? "#b91c1c" : "#15803d" }}>
                {highRiskCount}
              </span>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b" }}>GEREKEN ONAY</span>
              <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>{totalApprovals}</span>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b" }}>EL DEĞİŞTİRME</span>
              <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>{totalHandoffs}</span>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: bypassCount > 0 ? "#b91c1c" : "#64748b" }}>
                BYPASS / ETRAF RİSKİ
              </span>
              <span style={{ fontSize: "1.125rem", fontWeight: 700, color: bypassCount > 0 ? "#b91c1c" : "#15803d" }}>
                {bypassCount}
              </span>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: duplicateEntryCount > 0 ? "#d97706" : "#64748b" }}>
                MÜKERRER VERİ
              </span>
              <span style={{ fontSize: "1.125rem", fontWeight: 700, color: duplicateEntryCount > 0 ? "#d97706" : "#15803d" }}>
                {duplicateEntryCount}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs & Action Bar */}
        <div
          style={{
            padding: "0.875rem 1.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className={`button ${activeTab === "steps" ? "button--primary" : "button--secondary"}`}
              style={{ fontSize: "0.8125rem", padding: "0.375rem 0.875rem" }}
              onClick={() => setActiveTab("steps")}
            >
              <Layers size={15} />
              <span>Süreç Adımları ({nodes.length})</span>
            </button>
            <button
              type="button"
              className={`button ${activeTab === "edges" ? "button--primary" : "button--secondary"}`}
              style={{ fontSize: "0.8125rem", padding: "0.375rem 0.875rem" }}
              onClick={() => setActiveTab("edges")}
            >
              <ArrowRight size={15} />
              <span>Geçiş Bağlantıları ({edges.length})</span>
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {activeTab === "steps" ? (
              <button
                type="button"
                className="button button--save"
                style={{ fontSize: "0.8125rem", padding: "0.375rem 0.875rem", display: "flex", alignItems: "center", gap: "0.375rem" }}
                onClick={() => {
                  setEditingNode(null);
                  setIsNodeModalOpen(true);
                }}
              >
                <Plus size={15} />
                <span>Adım Ekle</span>
              </button>
            ) : (
              <button
                type="button"
                className="button button--save"
                style={{ fontSize: "0.8125rem", padding: "0.375rem 0.875rem", display: "flex", alignItems: "center", gap: "0.375rem" }}
                disabled={nodes.length < 2}
                onClick={() => {
                  setEditingEdge(null);
                  setIsEdgeModalOpen(true);
                }}
              >
                <Plus size={15} />
                <span>Bağlantı Ekle</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: "1.5rem 1.75rem", flex: 1, overflowY: "auto" }}>
          {activeTab === "steps" ? (
            nodes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#64748b" }}>
                <Layers size={40} style={{ opacity: 0.4, marginBottom: "0.75rem" }} />
                <h4 style={{ margin: "0 0 0.5rem", color: "#334155" }}>Henüz Süreç Adımı Eklenmedi</h4>
                <p style={{ fontSize: "0.875rem", maxWidth: "450px", margin: "0 auto 1.25rem" }}>
                  Sürecin başlangıcından bitişine kadar olan aşamaları, sorumluları ve onay noktalarını ekleyerek benimseme riskini keşfedin.
                </p>
                <button
                  type="button"
                  className="button button--save"
                  onClick={() => {
                    setEditingNode(null);
                    setIsNodeModalOpen(true);
                  }}
                >
                  <Plus size={16} /> İlk Adımı Ekle
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {nodes.map((n) => {
                  const st = n.ot_station_id ? stationMap.get(n.ot_station_id) : undefined;
                  const outgoingEdges = edges.filter((e) => e.source_node_id === n.id);

                  return (
                    <div
                      key={n.id}
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "1.125rem",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                        borderLeft: `5px solid ${
                          n.adoption_risk === "high"
                            ? "#ef4444"
                            : n.adoption_risk === "medium"
                            ? "#f59e0b"
                            : "#10b981"
                        }`,
                      }}
                    >
                      {/* Step Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                          <span
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              backgroundColor: "#f1f5f9",
                              color: "#334155",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "0.8125rem",
                            }}
                          >
                            {n.step_order}
                          </span>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                                {n.name}
                              </h4>
                              <span className="badge badge--secondary text-xs">{n.node_type}</span>
                              {st && (
                                <span className="badge badge--info text-xs" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                                  <Cpu size={11} /> {st.station_code} ({st.station_name})
                                </span>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: "0.75rem", marginTop: "2px", fontSize: "0.75rem", color: "#64748b" }}>
                              {n.responsible_role && <span><strong>Rol:</strong> {n.responsible_role}</span>}
                              {n.responsible_department && <span><strong>Departman:</strong> {n.responsible_department}</span>}
                              {n.business_function_code && <span><strong>Fonksiyon:</strong> {n.business_function_code}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Badges & Actions */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span
                            className={`badge ${
                              n.adoption_risk === "high"
                                ? "badge--danger"
                                : n.adoption_risk === "medium"
                                ? "badge--warning"
                                : "badge--success"
                            }`}
                            style={{ fontSize: "0.75rem", fontWeight: 700 }}
                          >
                            {n.adoption_risk === "high" ? "🚨 YÜKSEK RİSK" : n.adoption_risk === "medium" ? "⚠️ ORTA RİSK" : "✅ DÜŞÜK RİSK"}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingNode(n);
                              setIsNodeModalOpen(true);
                            }}
                            style={{
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              borderRadius: "6px",
                              padding: "4px 8px",
                              cursor: "pointer",
                              color: "#334155",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "0.75rem",
                            }}
                          >
                            <Edit2 size={13} /> Düzenle
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirmation({
                                type: "node",
                                id: n.id,
                                name: n.name,
                              })
                            }
                            style={{
                              border: "1px solid #fecaca",
                              background: "#fef2f2",
                              borderRadius: "6px",
                              padding: "4px 8px",
                              cursor: "pointer",
                              color: "#b91c1c",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "0.75rem",
                            }}
                          >
                            <Trash2 size={13} /> Sil
                          </button>
                        </div>
                      </div>

                      {/* Inputs & Outputs */}
                      {(n.input_description || n.output_description) && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", backgroundColor: "#f8fafc", padding: "0.625rem", borderRadius: "6px", fontSize: "0.8125rem" }}>
                          {n.input_description && (
                            <div>
                              <strong style={{ color: "#475569" }}>Girdi:</strong> {n.input_description}
                            </div>
                          )}
                          {n.output_description && (
                            <div>
                              <strong style={{ color: "#475569" }}>Çıktı:</strong> {n.output_description}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Complexity Diagnostic Pills */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.75rem", alignItems: "center" }}>
                        <span style={{ color: "#475569" }}>
                          <strong>Onay:</strong> {n.approval_count || 0}
                        </span>
                        <span>•</span>
                        <span style={{ color: "#475569" }}>
                          <strong>Handoff:</strong> {n.handoff_count || 0}
                        </span>

                        {n.duplicate_data_entry === 1 && (
                          <span className="badge badge--warning text-xs">⚠️ Mükerrer Veri Girişi</span>
                        )}

                        {n.bypass_possible === 1 && (
                          <span className="badge badge--danger text-xs font-bold">🚨 Bypass / Kağıt-Excel Riski</span>
                        )}

                        {n.manual_work === 1 && (
                          <span className="badge badge--secondary text-xs">Manuel Çaba Yüksek</span>
                        )}

                        {n.value_added === 0 && (
                          <span className="badge badge--outline-danger text-xs">İsraf / Bekleme / Katma Değersiz</span>
                        )}
                      </div>

                      {/* Outgoing Transitions */}
                      {outgoingEdges.length > 0 && (
                        <div style={{ marginTop: "4px", paddingTop: "6px", borderTop: "1px dashed #e2e8f0", fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          <ArrowRight size={13} style={{ color: "#2563eb" }} />
                          <span>Sonraki Adım:</span>
                          {outgoingEdges.map((e) => {
                            const target = nodeMap.get(e.target_node_id);
                            return (
                              <span key={e.id} className="badge badge--muted text-xs">
                                {target ? `${target.step_order}. ${target.name}` : "Bilinmeyen Adım"}
                                {e.label ? ` [${e.label}]` : ""}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {n.notes && (
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", fontStyle: "italic" }}>
                          Not: {n.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Edges Tab */
            edges.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#64748b" }}>
                <ArrowRight size={40} style={{ opacity: 0.4, marginBottom: "0.75rem" }} />
                <h4 style={{ margin: "0 0 0.5rem", color: "#334155" }}>Geçiş Bağlantısı Tanımlanmadı</h4>
                <p style={{ fontSize: "0.875rem", maxWidth: "450px", margin: "0 auto 1.25rem" }}>
                  Adımlar arasındaki geçiş sırasını ve dallanma koşullarını belirlemek için bağlantı ekleyin.
                </p>
                <button
                  type="button"
                  className="button button--save"
                  disabled={nodes.length < 2}
                  onClick={() => {
                    setEditingEdge(null);
                    setIsEdgeModalOpen(true);
                  }}
                >
                  <Plus size={16} /> İlk Bağlantıyı Ekle
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="report-table" style={{ width: "100%", fontSize: "0.8125rem" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "35%" }}>Başlangıç Adımı</th>
                      <th style={{ width: "35%" }}>Hedef Adım</th>
                      <th style={{ width: "18%" }}>Etiket / Koşul</th>
                      <th style={{ width: "12%", textAlign: "right" }}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {edges.map((e) => {
                      const source = nodeMap.get(e.source_node_id);
                      const target = nodeMap.get(e.target_node_id);

                      return (
                        <tr key={e.id}>
                          <td>
                            <strong>{source ? `${source.step_order}. ${source.name}` : "—"}</strong>
                            {source && <span className="text-xs text-muted" style={{ display: "block" }}>({source.node_type})</span>}
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                              <ArrowRight size={14} style={{ color: "#2563eb", flexShrink: 0 }} />
                              <strong>{target ? `${target.step_order}. ${target.name}` : "—"}</strong>
                            </div>
                            {target && <span className="text-xs text-muted" style={{ display: "block", marginLeft: "18px" }}>({target.node_type})</span>}
                          </td>
                          <td>
                            {e.label && <div className="badge badge--secondary text-xs">{e.label}</div>}
                            {e.condition_text && <div className="text-xs text-muted" style={{ marginTop: "2px" }}>{e.condition_text}</div>}
                            {!e.label && !e.condition_text && <span className="text-muted">—</span>}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirmation({
                                  type: "edge",
                                  id: e.id,
                                  name: `${source?.name || "Adım"} -> ${target?.name || "Adım"}`,
                                })
                              }
                              style={{
                                border: "1px solid #fecaca",
                                background: "#fef2f2",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                cursor: "pointer",
                                color: "#b91c1c",
                                fontSize: "0.75rem",
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Safety and Simplification Boundary Callout */}
          <div
            style={{
              marginTop: "1.5rem",
              backgroundColor: "#fffbeb",
              border: "1px solid #fef3c7",
              borderRadius: "8px",
              padding: "0.875rem 1rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
            }}
          >
            <ShieldAlert size={20} style={{ color: "#b45309", flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "0.8125rem", color: "#92400e", lineHeight: 1.5 }}>
              <strong>Sadeleştirme & Kontrol Güvenlik Sınırı:</strong> Basit süreç, kontrolsüz süreç değildir. Finansal kontrol, kalite, iş güvenliği, mevzuat ve görevler ayrılığı kontrolleri sadeleştirme adına kaldırılamaz. Yalnızca gereksiz tekrar, bekleme, belirsizlik ve kullanıcı yükü azaltılabilir.
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmation && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1100,
              padding: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                maxWidth: "420px",
                width: "100%",
                padding: "1.5rem",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
              }}
            >
              <h4 style={{ margin: "0 0 0.5rem", color: "#b91c1c", fontSize: "1.125rem" }}>
                {deleteConfirmation.type === "node" ? "Süreç Adımını Sil" : "Bağlantıyı Sil"}
              </h4>
              <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 1.25rem" }}>
                <strong>"{deleteConfirmation.name}"</strong> kaydını silmek istediğinize emin misiniz?
                {deleteConfirmation.type === "node" && " Bu adıma bağlı geçiş bağlantıları da otomatik olarak kaldırılacaktır."}
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setDeleteConfirmation(null)}
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  className="button button--danger"
                  onClick={() => {
                    if (deleteConfirmation.type === "node") {
                      handleDeleteNode(deleteConfirmation.id);
                    } else {
                      handleDeleteEdge(deleteConfirmation.id);
                    }
                  }}
                >
                  Evet, Sil
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Node Modal */}
        <ProcessNodeModal
          isOpen={isNodeModalOpen}
          onClose={() => setIsNodeModalOpen(false)}
          onSave={handleSaveNode}
          editingNode={editingNode}
          availableStations={stations}
          availableFunctions={availableFunctions}
          defaultStepOrder={nodes.length + 1}
        />

        {/* Edge Modal */}
        <ProcessEdgeModal
          isOpen={isEdgeModalOpen}
          onClose={() => setIsEdgeModalOpen(false)}
          onSave={handleSaveEdge}
          nodes={nodes}
          editingEdge={editingEdge}
        />
      </div>
    </div>
  );
};
