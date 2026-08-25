import React, { useState, useEffect, useMemo } from "react";
import {
  FileCheck,
  Plus,
  Search,
  Paperclip,
  AlertTriangle,
  Link2,
  Trash2,
  Edit2,
} from "lucide-react";
import type {
  EvidenceItem,
  EvidenceLink,
  EvidenceSummaryStats,
  UnsupportedCriticalFinding,
  EvidenceVerificationStatus,
  OtStation,
  ProcessMap,
  DataGovernanceAsset,
} from "../../types";
import {
  getEvidenceItems,
  getEvidenceLinks,
  getEvidenceSummaryStats,
  getUnsupportedCriticalFindings,
  createEvidenceItem,
  updateEvidenceItem,
  deleteEvidenceItem,
  createEvidenceLink,
  deleteEvidenceLink,
  getOtStations,
  getProcessMaps,
  getDataGovernanceAssets,
} from "../../db/client";
import { importEvidenceFileToManagedVault } from "../../storage/attachmentManager";
import { EvidenceModal } from "../modals/EvidenceModal";
import { EvidenceLinkModal } from "../modals/EvidenceLinkModal";

interface EvidenceRegistrySectionProps {
  projectId: string;
  isReadOnly?: boolean;
  businessFunctions?: { code: string; name_tr: string }[];
}

export const EvidenceRegistrySection: React.FC<EvidenceRegistrySectionProps> = ({
  projectId,
  isReadOnly = false,
  businessFunctions = [],
}) => {
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [evidenceLinks, setEvidenceLinks] = useState<EvidenceLink[]>([]);
  const [stats, setStats] = useState<EvidenceSummaryStats | null>(null);
  const [unsupportedFindings, setUnsupportedFindings] = useState<UnsupportedCriticalFinding[]>([]);
  const [otStations, setOtStations] = useState<OtStation[]>([]);
  const [processMaps, setProcessMaps] = useState<ProcessMap[]>([]);
  const [governanceAssets, setGovernanceAssets] = useState<DataGovernanceAsset[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [credibilityFilter, setCredibilityFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Modals state
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<EvidenceItem | null>(null);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkingEvidence, setLinkingEvidence] = useState<EvidenceItem | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      const [items, links, summaryStats, unsupported, stations, maps, assets] = await Promise.all([
        getEvidenceItems(projectId),
        getEvidenceLinks(projectId),
        getEvidenceSummaryStats(projectId),
        getUnsupportedCriticalFindings(projectId),
        getOtStations(projectId),
        getProcessMaps(projectId),
        getDataGovernanceAssets(projectId),
      ]);

      setEvidenceItems(items);
      setEvidenceLinks(links);
      setStats(summaryStats);
      setUnsupportedFindings(unsupported);
      setOtStations(stations);
      setProcessMaps(maps);
      setGovernanceAssets(assets);
    } catch (err: any) {
      console.error("Saha kanıt verileri yüklenirken hata:", err);
      setErrorMsg("Kanıt kayıtları yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  // Links mapped by evidence_id
  const linksByEvidenceId = useMemo(() => {
    const map = new Map<string, EvidenceLink[]>();
    for (const link of evidenceLinks) {
      const list = map.get(link.evidence_id) || [];
      list.push(link);
      map.set(link.evidence_id, list);
    }
    return map;
  }, [evidenceLinks]);

  // Filtered evidence items
  const filteredEvidence = useMemo(() => {
    return evidenceItems.filter((ev) => {
      if (statusFilter !== "ALL" && ev.verification_status !== statusFilter) return false;
      if (credibilityFilter !== "ALL" && ev.credibility_level !== credibilityFilter) return false;
      if (typeFilter !== "ALL" && ev.evidence_type !== typeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = ev.title.toLowerCase().includes(q);
        const notesMatch = ev.notes?.toLowerCase().includes(q);
        const fileMatch = ev.file_name?.toLowerCase().includes(q);
        const sourceMatch = ev.source_description?.toLowerCase().includes(q);
        const roleMatch = ev.collected_by_role?.toLowerCase().includes(q);
        if (!titleMatch && !notesMatch && !fileMatch && !sourceMatch && !roleMatch) return false;
      }
      return true;
    });
  }, [evidenceItems, statusFilter, credibilityFilter, typeFilter, searchQuery]);

  // Save evidence handler
  const handleSaveEvidence = async (
    payload: Partial<EvidenceItem>,
    fileToImport?: { sourcePath: string; fileName: string } | null
  ) => {
    if (editingEvidence) {
      let updatedPayload = { ...payload };
      if (fileToImport) {
        const importRes = await importEvidenceFileToManagedVault({
          projectId,
          evidenceId: editingEvidence.id,
          file: {
            name: fileToImport.fileName,
            sourcePath: fileToImport.sourcePath,
          },
        });
        updatedPayload.file_name = importRes.fileName;
        updatedPayload.stored_path = importRes.storedPath;
        updatedPayload.file_size = importRes.fileSize;
        updatedPayload.file_hash = importRes.fileHash;
        updatedPayload.mime_type = importRes.mimeType;
      }
      await updateEvidenceItem(editingEvidence.id, updatedPayload);
    } else {
      const newEv = await createEvidenceItem({
        project_id: projectId,
        title: payload.title!,
        evidence_type: payload.evidence_type || "DOCUMENT",
        source_type: payload.source_type || "DOCUMENT",
        source_description: payload.source_description,
        collected_at: payload.collected_at || new Date().toISOString(),
        collected_by_role: payload.collected_by_role,
        verification_status: payload.verification_status || "UNREVIEWED",
        credibility_level: payload.credibility_level || "MEDIUM",
        sensitivity_level: payload.sensitivity_level || "NORMAL",
        notes: payload.notes,
      });

      if (fileToImport) {
        const importRes = await importEvidenceFileToManagedVault({
          projectId,
          evidenceId: newEv.id,
          file: {
            name: fileToImport.fileName,
            sourcePath: fileToImport.sourcePath,
          },
        });
        await updateEvidenceItem(newEv.id, {
          file_name: importRes.fileName,
          stored_path: importRes.storedPath,
          file_size: importRes.fileSize,
          file_hash: importRes.fileHash,
          mime_type: importRes.mimeType,
        });
      }
    }
    await loadData();
  };

  // Quick verification status update
  const handleQuickStatusChange = async (evidenceId: string, newStatus: EvidenceVerificationStatus) => {
    try {
      await updateEvidenceItem(evidenceId, { verification_status: newStatus });
      await loadData();
    } catch (err: any) {
      console.error("Durum güncellenirken hata:", err);
    }
  };

  // Delete evidence
  const handleDeleteEvidence = async (evidenceId: string) => {
    if (!window.confirm("Bu saha kanıtını ve ilişkili tüm bağlantıları silmek istediğinize emin misiniz?")) {
      return;
    }
    try {
      await deleteEvidenceItem(evidenceId);
      await loadData();
    } catch (err: any) {
      console.error("Kanıt silinirken hata:", err);
    }
  };

  // Save link handler
  const handleSaveLink = async (payload: Partial<EvidenceLink>) => {
    await createEvidenceLink({
      project_id: projectId,
      evidence_id: payload.evidence_id!,
      target_type: payload.target_type!,
      target_id: payload.target_id,
      question_id: payload.question_id,
      business_function_code: payload.business_function_code,
      ot_station_id: payload.ot_station_id,
      process_map_id: payload.process_map_id,
      process_node_id: payload.process_node_id,
      governance_asset_id: payload.governance_asset_id,
      link_note: payload.link_note,
    });
    await loadData();
  };

  // Delete link handler (unlink)
  const handleUnlink = async (linkId: string) => {
    if (!window.confirm("Bu bağlantıyı kaldırmak istediğinize emin misiniz? Kanıt dosyası silinmeyecektir.")) {
      return;
    }
    try {
      await deleteEvidenceLink(linkId);
      await loadData();
    } catch (err: any) {
      console.error("Bağlantı kaldırılırken hata:", err);
    }
  };

  return (
    <div className="evidence-registry-section" style={{ padding: "1.5rem 0" }}>
      {/* ── Header & Action Bar ────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--color-primary-900, #0f172a)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileCheck size={22} style={{ color: "var(--color-primary-600, #2563eb)" }} />
            Saha Kanıtı ve Doğrulama Kayıt Defteri
          </h2>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Soru cevaplarını, OT istasyonlarını ve veri yönetişimi beyanlarını saha kanıtlarıyla ilişkilendirin ve doğrulayın.
          </p>
        </div>

        {!isReadOnly && (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => {
              setEditingEvidence(null);
              setIsEvidenceModalOpen(true);
            }}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Yeni Saha Kanıtı Ekle
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>
          {errorMsg}
        </div>
      )}

      {/* ── KPI Summary Cards ────────────────────────────────────────── */}
      {stats && (
        <div className="report-kpi-band" style={{ marginBottom: "1.5rem" }}>
          <div className="report-kpi-band__item">
            <span className="report-kpi-band__count" style={{ color: "var(--color-primary, #1e3a8a)" }}>
              {stats.totalEvidence}
            </span>
            <span className="report-kpi-band__label">Toplam Saha Kanıtı</span>
          </div>
          <div className="report-kpi-band__divider" />
          <div className="report-kpi-band__item">
            <span className="report-kpi-band__count" style={{ color: "#15803d" }}>
              {stats.acceptedCount}
            </span>
            <span className="report-kpi-band__label">✓ Kabul Edildi</span>
          </div>
          <div className="report-kpi-band__divider" />
          <div className="report-kpi-band__item">
            <span className="report-kpi-band__count" style={{ color: "#b45309" }}>
              {stats.unreviewedCount + stats.reviewedCount}
            </span>
            <span className="report-kpi-band__label">İncelemede</span>
          </div>
          <div className="report-kpi-band__divider" />
          <div className="report-kpi-band__item">
            <span className={`report-kpi-band__count ${stats.unsupportedCriticalFindingsCount > 0 ? "text-danger" : "#15803d"}`}>
              {stats.unsupportedCriticalFindingsCount}
            </span>
            <span className="report-kpi-band__label">Kanıtsız Kritik Konu</span>
          </div>
          <div className="report-kpi-band__divider" />
          <div className="report-kpi-band__item">
            <span className="report-kpi-band__count">
              %{stats.evidenceCoverageRate}
            </span>
            <span className="report-kpi-band__label">Kanıt Kapsama Oranı</span>
          </div>
        </div>
      )}

      {/* ── Unsupported Critical Findings Alert ────────────────────────── */}
      {unsupportedFindings.length > 0 && (
        <div className="report-summary-box" style={{ marginBottom: "1.5rem", borderLeft: "4px solid var(--danger, #ef4444)", background: "#fff5f5" }}>
          <h3 className="report-summary-box__title" style={{ color: "#b91c1c", display: "flex", alignItems: "center", gap: "0.5rem", margin: "0 0 0.5rem 0" }}>
            <AlertTriangle size={18} />
            <span>Kanıtla Desteklenmeyen Kritik Başlıklar ({unsupportedFindings.length})</span>
          </h3>
          <p className="text-xs text-muted" style={{ margin: "0 0 0.75rem 0" }}>
            Bu kritik konular için henüz geçerli veya kabul edilmiş bir saha kanıtı sunulmamıştır.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
            {unsupportedFindings.map((u, idx) => (
              <div key={`${u.targetType}-${u.targetId}-${idx}`} style={{ background: "#ffffff", padding: "0.6rem 0.75rem", borderRadius: "4px", border: "1px solid #fecaca" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="badge badge--danger text-xs">{u.targetType}</span>
                  <span className="text-xs font-bold text-danger">{u.reason === "NO_EVIDENCE" ? "Kanıt Yok" : "Reddedildi"}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.8125rem", marginTop: "0.25rem" }}>{u.title}</div>
                <div className="text-xs text-muted" style={{ marginTop: "2px" }}>{u.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Filters & Search ─────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 240px", position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="form-control"
            placeholder="Kanıt adı, dosya, rol veya not ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "2.2rem" }}
          />
        </div>

        <select
          className="form-control"
          style={{ width: "auto" }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Tüm Doğrulama Durumları</option>
          <option value="ACCEPTED">✓ Kabul Edildi</option>
          <option value="REVIEWED">İncelendi</option>
          <option value="UNREVIEWED">İncelenmedi</option>
          <option value="REJECTED">✕ Reddedildi</option>
        </select>

        <select
          className="form-control"
          style={{ width: "auto" }}
          value={credibilityFilter}
          onChange={(e) => setCredibilityFilter(e.target.value)}
        >
          <option value="ALL">Tüm Güven Seviyeleri</option>
          <option value="HIGH">Yüksek Güven</option>
          <option value="MEDIUM">Orta Güven</option>
          <option value="LOW">Düşük Güven</option>
        </select>

        <select
          className="form-control"
          style={{ width: "auto" }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">Tüm Kanıt Türleri</option>
          <option value="DOCUMENT">Belge / Tutanak</option>
          <option value="SCREENSHOT">Ekran Görüntüsü</option>
          <option value="PHOTO">Saha Fotoğrafı</option>
          <option value="LOG_EXPORT">Log Dökümü</option>
          <option value="INTERVIEW_NOTE">Görüşme Notu</option>
          <option value="PHYSICAL_SAMPLE">Fiziksel Numune</option>
          <option value="OTHER">Diğer</option>
        </select>
      </div>

      {/* ── Evidence List / Table ─────────────────────────────────────── */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          Kanıt kayıtları yükleniyor...
        </div>
      ) : filteredEvidence.length === 0 ? (
        <div className="report-empty-prompt" style={{ padding: "3rem 1.5rem", textAlign: "center", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
          <FileCheck size={36} style={{ color: "var(--color-primary-400, #93c5fd)", margin: "0 auto 0.75rem" }} />
          <h4 style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>Henüz Saha Kanıtı Kaydedilmedi</h4>
          <p className="text-xs text-muted" style={{ margin: "0 0 1rem" }}>
            Analiz sürecinde toplanan belgeleri, ekran görüntülerini ve saha tutanaklarını ekleyerek güvenilirliği yükseltebilirsiniz.
          </p>
          {!isReadOnly && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => {
                setEditingEvidence(null);
                setIsEvidenceModalOpen(true);
              }}
            >
              <Plus size={15} /> İlk Kanıtı Ekle
            </button>
          )}
        </div>
      ) : (
        <div className="report-table-wrapper" style={{ overflowX: "auto", border: "1px solid var(--border-color, #e2e8f0)", borderRadius: "8px" }}>
          <table className="report-table report-table--striped" style={{ width: "100%", fontSize: "0.8125rem", margin: 0 }}>
            <thead>
              <tr>
                <th style={{ width: "24%" }}>Kanıt Başlığı & Belge</th>
                <th style={{ width: "16%" }}>Tür & Kaynak</th>
                <th style={{ width: "16%" }}>Doğrulama & Güven</th>
                <th style={{ width: "30%" }}>İlişkili Keşif Hedefleri</th>
                <th style={{ width: "14%", textAlign: "right" }}>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvidence.map((ev) => {
                const links = linksByEvidenceId.get(ev.id) || [];
                return (
                  <tr key={ev.id}>
                    <td>
                      <div className="font-bold" style={{ color: "var(--color-primary-900, #0f172a)" }}>
                        {ev.title}
                      </div>
                      {ev.file_name && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "2px", color: "var(--color-primary-700, #1d4ed8)", fontSize: "0.75rem" }}>
                          <Paperclip size={12} />
                          <span>{ev.file_name}</span>
                          <span className="text-muted">({((ev.file_size || 0) / 1024).toFixed(1)} KB)</span>
                        </div>
                      )}
                      {ev.notes && (
                        <div className="text-xs text-muted" style={{ marginTop: "3px", fontStyle: "italic" }}>
                          {ev.notes}
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="badge badge--secondary text-xs">{ev.evidence_type}</span>
                      <div className="text-xs text-muted" style={{ marginTop: "3px" }}>
                        Kaynak: {ev.source_type}
                      </div>
                      {ev.collected_by_role && (
                        <div className="text-xs text-muted">
                          Toplayan: {ev.collected_by_role}
                        </div>
                      )}
                    </td>

                    <td>
                      {/* Doğrulama Durumu Dropdown */}
                      <select
                        className="form-control"
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.2rem 0.4rem",
                          height: "auto",
                          fontWeight: 600,
                          color: ev.verification_status === "ACCEPTED" ? "#166534" : ev.verification_status === "REJECTED" ? "#991b1b" : "#854d0e",
                          background: ev.verification_status === "ACCEPTED" ? "#f0fdf4" : ev.verification_status === "REJECTED" ? "#fef2f2" : "#fefce8",
                          borderColor: ev.verification_status === "ACCEPTED" ? "#bbf7d0" : ev.verification_status === "REJECTED" ? "#fecaca" : "#fef08a",
                        }}
                        value={ev.verification_status}
                        onChange={(e) => handleQuickStatusChange(ev.id, e.target.value as EvidenceVerificationStatus)}
                        disabled={isReadOnly}
                      >
                        <option value="UNREVIEWED">İncelenmedi</option>
                        <option value="REVIEWED">İncelendi</option>
                        <option value="ACCEPTED">✓ Kabul Edildi</option>
                        <option value="REJECTED">✕ Reddedildi</option>
                      </select>

                      <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                        <span className={`badge ${ev.credibility_level === "HIGH" ? "badge--success" : ev.credibility_level === "LOW" ? "badge--danger" : "badge--warning"}`} style={{ fontSize: "0.6875rem" }}>
                          Güven: {ev.credibility_level === "HIGH" ? "Yüksek" : ev.credibility_level === "LOW" ? "Düşük" : "Orta"}
                        </span>
                        {ev.sensitivity_level !== "NORMAL" && (
                          <span className="badge badge--danger" style={{ fontSize: "0.6875rem" }}>
                            {ev.sensitivity_level}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" }}>
                        {links.length === 0 ? (
                          <span className="text-xs text-muted">Bağlı hedef yok</span>
                        ) : (
                          links.map((link) => (
                            <span
                              key={link.id}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                background: "#f1f5f9",
                                border: "1px solid #cbd5e1",
                                borderRadius: "4px",
                                padding: "0.15rem 0.4rem",
                                fontSize: "0.6875rem",
                              }}
                            >
                              <strong>
                                {link.target_type === "QUESTION" ? `Soru: ${link.question_id || link.target_id}` :
                                 link.target_type === "OT_STATION" ? "İstasyon" :
                                 link.target_type === "PROCESS_MAP" ? "Süreç Haritası" :
                                 link.target_type === "GOVERNANCE_ASSET" ? "Veri Varlığı" : link.target_type}
                              </strong>
                              {!isReadOnly && (
                                <button
                                  type="button"
                                  onClick={() => handleUnlink(link.id)}
                                  title="Bağlantıyı kaldır"
                                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#94a3b8" }}
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          ))
                        )}

                        {!isReadOnly && (
                          <button
                            type="button"
                            className="btn btn--outline btn--xs"
                            onClick={() => {
                              setLinkingEvidence(ev);
                              setIsLinkModalOpen(true);
                            }}
                            title="Yeni hedefe bağla"
                            style={{ padding: "0.1rem 0.35rem", fontSize: "0.6875rem", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}
                          >
                            <Link2 size={11} /> + Hedefe Bağla
                          </button>
                        )}
                      </div>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                        {!isReadOnly && (
                          <>
                            <button
                              type="button"
                              className="btn btn--secondary btn--xs"
                              onClick={() => {
                                setEditingEvidence(ev);
                                setIsEvidenceModalOpen(true);
                              }}
                              title="Düzenle"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              type="button"
                              className="btn btn--outline btn--xs text-danger"
                              onClick={() => handleDeleteEvidence(ev.id)}
                              title="Sil"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────── */}
      {isEvidenceModalOpen && (
        <EvidenceModal
          isOpen={isEvidenceModalOpen}
          onClose={() => setIsEvidenceModalOpen(false)}
          onSave={handleSaveEvidence}
          initialData={editingEvidence}
          projectId={projectId}
          isReadOnly={isReadOnly}
        />
      )}

      {isLinkModalOpen && linkingEvidence && (
        <EvidenceLinkModal
          isOpen={isLinkModalOpen}
          onClose={() => {
            setIsLinkModalOpen(false);
            setLinkingEvidence(null);
          }}
          onSave={handleSaveLink}
          evidenceItem={linkingEvidence}
          otStations={otStations}
          processMaps={processMaps}
          governanceAssets={governanceAssets}
          businessFunctions={businessFunctions}
        />
      )}
    </div>
  );
};
