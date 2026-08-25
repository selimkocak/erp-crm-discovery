/**
 * ERP CRM Discovery — ProcessMapsSection (FAZ-63)
 *
 * Proje Detay Ekranı — Süreç Haritaları, Süreç Sadelik ve Benimseme Riski Yönetim Sekmesi.
 * %100 Çevrimdışı, Türkçe bildirimler.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  GitCommit,
  Plus,
  Edit2,
  Trash2,
  Layers,
  ShieldAlert,
} from "lucide-react";
import {
  getProcessMaps,
  createProcessMap,
  updateProcessMap,
  deleteProcessMap,
  getProcessMapsSummaryStats,
  getProcessNodes,
} from "../db/client";
import { ProcessMapModal } from "./modals/ProcessMapModal";
import { ProcessMapEditorModal } from "./modals/ProcessMapEditorModal";
import type { ProcessMap, ProcessMapsSummaryStats } from "../types";

interface ProcessMapsSectionProps {
  projectId: string;
  availableFunctions?: { code: string; name_tr: string }[];
}

export const ProcessMapsSection: React.FC<ProcessMapsSectionProps> = ({
  projectId,
  availableFunctions = [],
}) => {
  const [maps, setMaps] = useState<ProcessMap[]>([]);
  const [mapNodeCounts, setMapNodeCounts] = useState<Map<string, { total: number; highRisk: number }>>(new Map());
  const [summaryStats, setSummaryStats] = useState<ProcessMapsSummaryStats>({
    totalMaps: 0,
    totalNodes: 0,
    totalEdges: 0,
    highAdoptionRiskCount: 0,
    mediumAdoptionRiskCount: 0,
    lowAdoptionRiskCount: 0,
    totalApprovals: 0,
    totalHandoffs: 0,
    duplicateDataEntryCount: 0,
    bypassPossibleCount: 0,
    simplificationOpportunityCount: 0,
    valueAddedStepCount: 0,
  });

  // Modals state
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [editingMap, setEditingMap] = useState<ProcessMap | null>(null);

  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [selectedMapForEditor, setSelectedMapForEditor] = useState<ProcessMap | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState<ProcessMap | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [fetchedMaps, fetchedStats] = await Promise.all([
        getProcessMaps(projectId),
        getProcessMapsSummaryStats(projectId),
      ]);
      setMaps(fetchedMaps);
      setSummaryStats(fetchedStats);

      // Fetch node counts per map for fast rendering
      const countsMap = new Map<string, { total: number; highRisk: number }>();
      await Promise.all(
        fetchedMaps.map(async (m) => {
          const nodes = await getProcessNodes(m.id);
          const highRisk = nodes.filter((n) => n.adoption_risk === "high").length;
          countsMap.set(m.id, { total: nodes.length, highRisk });
        })
      );
      setMapNodeCounts(countsMap);
    } catch (err) {
      console.error("Süreç haritaları yüklenirken hata:", err);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveMap = async (mapData: any) => {
    if (editingMap) {
      await updateProcessMap(editingMap.id, mapData);
    } else {
      await createProcessMap({
        project_id: projectId,
        ...mapData,
      });
    }
    await loadData();
  };

  const handleDeleteMap = async (mapId: string) => {
    await deleteProcessMap(mapId);
    setDeleteConfirmation(null);
    if (selectedMapForEditor?.id === mapId) {
      setIsEditorModalOpen(false);
      setSelectedMapForEditor(null);
    }
    await loadData();
  };

  return (
    <div className="process-maps-section" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* KPI Overview Banner */}
      <div className="report-summary-box" style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
              Süreç Haritaları, Süreç Sadelik ve Kullanıcı Benimsemesi
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "#64748b" }}>
              İş süreçlerinin görsel akışı, onay kuyrukları, el değiştirmeler ve gayriresmi bypass riskleri
            </p>
          </div>
          <button
            type="button"
            className="button button--save"
            onClick={() => {
              setEditingMap(null);
              setIsMapModalOpen(true);
            }}
            style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
          >
            <Plus size={16} />
            <span>Yeni Süreç Haritası Ekle</span>
          </button>
        </div>

        {/* KPI Counters */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
          <div style={{ backgroundColor: "#ffffff", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>MODEL SÜREÇ</span>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-primary, #1e3a8a)" }}>
              {summaryStats.totalMaps} Süreç
            </span>
          </div>

          <div style={{ backgroundColor: "#ffffff", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>TOPLAM ADIM</span>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>
              {summaryStats.totalNodes} Adım
            </span>
          </div>

          <div style={{ backgroundColor: "#ffffff", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: summaryStats.highAdoptionRiskCount > 0 ? "#b91c1c" : "#64748b" }}>
              YÜKSEK BENİMSEME RİSKİ
            </span>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: summaryStats.highAdoptionRiskCount > 0 ? "#b91c1c" : "#15803d" }}>
              {summaryStats.highAdoptionRiskCount} Adım
            </span>
          </div>

          <div style={{ backgroundColor: "#ffffff", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: summaryStats.simplificationOpportunityCount > 0 ? "#b45309" : "#64748b" }}>
              SADELEŞTİRME FIRSATI
            </span>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#b45309" }}>
              {summaryStats.simplificationOpportunityCount} Nokta
            </span>
          </div>
        </div>

        {/* Diagnostic Meta Bar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "0.75rem", fontSize: "0.8125rem", color: "#64748b" }}>
          <span><strong>Toplam Onay Sayısı:</strong> {summaryStats.totalApprovals}</span>
          <span>•</span>
          <span><strong>El Değiştirme (Handoff):</strong> {summaryStats.totalHandoffs}</span>
          <span>•</span>
          <span><strong>Mükerrer Veri Girişi:</strong> {summaryStats.duplicateDataEntryCount}</span>
          <span>•</span>
          <span><strong>Bypass / Kağıt-Excel Riski:</strong> {summaryStats.bypassPossibleCount}</span>
        </div>
      </div>

      {/* Process Maps Grid */}
      {maps.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3.5rem 1.5rem",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px dashed #cbd5e1",
          }}
        >
          <GitCommit size={48} style={{ color: "#94a3b8", opacity: 0.5, marginBottom: "1rem" }} />
          <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.125rem", color: "#334155" }}>
            Henüz Süreç Haritası Tanımlanmadı
          </h4>
          <p style={{ fontSize: "0.875rem", color: "#64748b", maxWidth: "500px", margin: "0 auto 1.5rem" }}>
            ERP/CRM geçişinde kullanıcıların sistemi benimsemesi ve etrafından dolaşmaması için kritik iş süreçlerini modelleyin.
          </p>
          <button
            type="button"
            className="button button--save"
            onClick={() => {
              setEditingMap(null);
              setIsMapModalOpen(true);
            }}
          >
            <Plus size={16} /> İlk Süreç Haritasını Ekle
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          {maps.map((pm) => {
            const counts = mapNodeCounts.get(pm.id) || { total: 0, highRisk: 0 };

            return (
              <div
                key={pm.id}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "1.25rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <h4 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 700, color: "#0f172a" }}>
                      {pm.name}
                    </h4>
                    <span className={`badge ${pm.status === "active" ? "badge--on-track" : "badge--neutral"}`}>
                      {pm.status === "active" ? "Aktif" : "Pasif"}
                    </span>
                  </div>

                  {pm.process_area && (
                    <div style={{ marginTop: "4px" }}>
                      <span className="badge badge--secondary text-xs">{pm.process_area}</span>
                    </div>
                  )}

                  {pm.owner_role && (
                    <p style={{ margin: "6px 0 0", fontSize: "0.8125rem", color: "#475569" }}>
                      <strong>Süreç Sahibi:</strong> {pm.owner_role}
                    </p>
                  )}

                  {pm.description && (
                    <p style={{ margin: "6px 0 0", fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.4 }}>
                      {pm.description}
                    </p>
                  )}
                </div>

                <div>
                  {/* Step Counts Badge Bar */}
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.875rem", flexWrap: "wrap" }}>
                    <span className="badge badge--muted text-xs">
                      <Layers size={12} /> {counts.total} Adım
                    </span>
                    {counts.highRisk > 0 && (
                      <span className="badge badge--danger text-xs font-bold">
                        🚨 {counts.highRisk} Yüksek Risk
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem" }}>
                    <button
                      type="button"
                      className="button button--primary"
                      style={{ flex: 1, fontSize: "0.8125rem", padding: "0.375rem 0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}
                      onClick={() => {
                        setSelectedMapForEditor(pm);
                        setIsEditorModalOpen(true);
                      }}
                    >
                      <Layers size={14} />
                      <span>Akışı & Adımları İncele</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingMap(pm);
                        setIsMapModalOpen(true);
                      }}
                      style={{
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        color: "#475569",
                      }}
                      title="Harita Bilgisini Düzenle"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmation(pm)}
                      style={{
                        border: "1px solid #fecaca",
                        background: "#fef2f2",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        color: "#b91c1c",
                      }}
                      title="Haritayı Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Safety and Simplification Principle Callout */}
      <div
        style={{
          backgroundColor: "#fffbeb",
          border: "1px solid #fef3c7",
          borderRadius: "8px",
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.875rem",
        }}
      >
        <ShieldAlert size={22} style={{ color: "#b45309", flexShrink: 0, marginTop: "2px" }} />
        <div style={{ fontSize: "0.8125rem", color: "#92400e", lineHeight: 1.5 }}>
          <strong>Süreç Sadeleştirme ve Kontrol İlkesi:</strong> Basit süreç, kontrolsüz süreç değildir. Finansal kontrol, kalite, iş güvenliği, mevzuat ve görevler ayrılığı (SoD) kontrolleri sadeleştirme adına kaldırılamaz. Yalnızca gereksiz tekrar, bekleme, belirsizlik ve kullanıcı yükü azaltılabilir.
        </div>
      </div>

      {/* Process Map Modal */}
      <ProcessMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSave={handleSaveMap}
        editingMap={editingMap}
      />

      {/* Process Map Flow Editor Modal */}
      <ProcessMapEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        processMap={selectedMapForEditor}
        projectId={projectId}
        availableFunctions={availableFunctions}
        onDataChanged={loadData}
      />

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
              Süreç Haritasını Sil
            </h4>
            <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 1.25rem" }}>
              <strong>"{deleteConfirmation.name}"</strong> haritasını ve bu haritaya ait tüm adımları ve geçiş bağlantılarını silmek istediğinize emin misiniz?
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
                onClick={() => handleDeleteMap(deleteConfirmation.id)}
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
