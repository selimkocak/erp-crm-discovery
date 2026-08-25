import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Clock,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type {
  ReadinessCheckItem,
  ReadinessCategory,
  ReadinessStatus,
  ReadinessSummaryResult,
  CreateReadinessCheckPayload,
  UpdateReadinessCheckPayload,
} from "../../types/readiness";
import {
  READINESS_CATEGORY_LABELS,
  READINESS_STATUS_LABELS,
} from "../../types/readiness";
import {
  getReadinessChecks,
  getReadinessSummary,
  createReadinessCheck,
  updateReadinessCheck,
  deleteReadinessCheck,
  seedStarterReadinessChecks,
} from "../../db/client";
import { ReadinessCheckModal } from "../modals/ReadinessCheckModal";

interface ReadinessChecklistSectionProps {
  projectId: string;
  readOnly?: boolean;
}

export const ReadinessChecklistSection: React.FC<ReadinessChecklistSectionProps> = ({
  projectId,
  readOnly = false,
}) => {
  const [checks, setChecks] = useState<ReadinessCheckItem[]>([]);
  const [summary, setSummary] = useState<ReadinessSummaryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [actionsOnly, setActionsOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalCheck, setModalCheck] = useState<ReadinessCheckItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"checklist" | "actions" | "categories">("checklist");

  const loadData = async () => {
    setLoading(true);
    try {
      const [chkList, sumRes] = await Promise.all([
        getReadinessChecks(projectId),
        getReadinessSummary(projectId),
      ]);
      setChecks(chkList);
      setSummary(sumRes);
    } catch (err) {
      console.error("Readiness data yükleme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleSeedStarter = async () => {
    if (readOnly) return;
    try {
      setLoading(true);
      await seedStarterReadinessChecks(projectId);
      await loadData();
    } catch (err) {
      console.error("Starter kontroller yüklenirken hata:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: ReadinessStatus) => {
    if (readOnly) return;
    try {
      await updateReadinessCheck(id, { status: newStatus });
      await loadData();
    } catch (err) {
      console.error("Durum güncelleme hatası:", err);
    }
  };

  const handleSaveModal = async (payload: CreateReadinessCheckPayload | UpdateReadinessCheckPayload) => {
    if (modalCheck) {
      await updateReadinessCheck(modalCheck.id, payload as UpdateReadinessCheckPayload);
    } else {
      await createReadinessCheck(payload as CreateReadinessCheckPayload);
    }
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (readOnly) return;
    if (!window.confirm("Bu hazırlık kontrol maddesini silmek istediğinize emin misiniz?")) {
      return;
    }
    try {
      await deleteReadinessCheck(id);
      await loadData();
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  // Filtered Checklist
  const filteredChecks = checks.filter((c) => {
    if (selectedCategory !== "ALL" && c.category !== selectedCategory) return false;
    if (selectedStatus !== "ALL" && c.status !== selectedStatus) return false;
    if (criticalOnly && c.critical !== 1) return false;
    if (actionsOnly && c.action_required !== 1 && !c.action_note && c.status !== "BLOCKED") return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchCode = c.check_code.toLowerCase().includes(term);
      const matchTitle = c.title.toLowerCase().includes(term);
      const matchDesc = (c.description || "").toLowerCase().includes(term);
      const matchRole = (c.owner_role || "").toLowerCase().includes(term);
      if (!matchCode && !matchTitle && !matchDesc && !matchRole) return false;
    }
    return true;
  });

  if (loading && !summary) {
    return (
      <div className="card text-center" style={{ padding: "3rem" }}>
        <p className="text-muted">Hazırlık kontrolleri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="readiness-section" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* ── Top Header & KPI Dashboard ─────────────────────────────────── */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "#ffffff",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <Zap size={22} color="#38bdf8" />
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#f8fafc" }}>
                Pilot Saha Kabulü ve Go-Live Hazırlığı
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "#94a3b8" }}>
              Uygulama öncesi saha verisinin eksiksizliği, süreç sadeliği, veri sahipliği ve kanıt güvencesi.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {summary && (
              <div
                style={{
                  padding: "0.375rem 0.875rem",
                  borderRadius: "20px",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  background: summary.stats.isDiscoveryReady ? "#15803d" : "#0369a1",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                {summary.stats.isDiscoveryReady ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                {summary.stats.isDiscoveryReady ? "Keşif İncelemesi Tamamlandı" : "Keşif Hazırlığı Sürüyor"}
              </div>
            )}

            {!readOnly && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setModalCheck(null);
                  setIsModalOpen(true);
                }}
                style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.375rem" }}
              >
                <Plus size={16} /> Yeni Kontrol
              </button>
            )}
          </div>
        </div>

        {/* KPI Grid */}
        {summary && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "1rem",
              marginTop: "1.5rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Hazırlık Skoru</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#38bdf8", marginTop: "2px" }}>
                %{summary.stats.readinessPercentage}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Tamamlanan</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#4ade80", marginTop: "2px" }}>
                {summary.stats.readyCount} <span style={{ fontSize: "0.875rem", color: "#94a3b8", fontWeight: 400 }}>/ {summary.stats.applicableChecks}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Kritik Açık</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: summary.stats.criticalOpenCount > 0 ? "#f87171" : "#4ade80", marginTop: "2px" }}>
                {summary.stats.criticalOpenCount}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Bloke Madde</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: summary.stats.blockedCount > 0 ? "#fbbf24" : "#94a3b8", marginTop: "2px" }}>
                {summary.stats.blockedCount}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Aksiyon Bekleyen</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fb923c", marginTop: "2px" }}>
                {summary.stats.actionRequiredCount}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sub-Tabs Navigation ────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-color, #e2e8f0)", paddingBottom: "0.5rem" }}>
        <button
          type="button"
          className={`btn ${activeTab === "checklist" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "0.8125rem", padding: "0.4rem 0.875rem" }}
          onClick={() => setActiveTab("checklist")}
        >
          <CheckSquare size={16} /> Hazırlık Kontrol Listesi ({checks.length})
        </button>

        <button
          type="button"
          className={`btn ${activeTab === "categories" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "0.8125rem", padding: "0.4rem 0.875rem" }}
          onClick={() => setActiveTab("categories")}
        >
          <ShieldCheck size={16} /> Kategori Matrisi (8 Alan)
        </button>

        <button
          type="button"
          className={`btn ${activeTab === "actions" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "0.8125rem", padding: "0.4rem 0.875rem" }}
          onClick={() => setActiveTab("actions")}
        >
          <AlertCircle size={16} /> Öncelikli Aksiyonlar ({summary?.actions.length || 0})
        </button>
      </div>

      {/* ── TAB 1: CHECKLIST ──────────────────────────────────────────── */}
      {activeTab === "checklist" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Filters Bar */}
          <div
            className="card"
            style={{
              padding: "1rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", position: "relative" }}>
                <Search size={16} className="text-muted" style={{ position: "absolute", left: "8px" }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "28px", width: "180px", fontSize: "0.8125rem" }}
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="form-input"
                style={{ fontSize: "0.8125rem", width: "auto" }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">Tüm Kategoriler</option>
                {(Object.keys(READINESS_CATEGORY_LABELS) as ReadinessCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} — {READINESS_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>

              <select
                className="form-input"
                style={{ fontSize: "0.8125rem", width: "auto" }}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">Tüm Durumlar</option>
                {(Object.keys(READINESS_STATUS_LABELS) as ReadinessStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {READINESS_STATUS_LABELS[st]}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className={`btn ${criticalOnly ? "btn-danger" : "btn-secondary"}`}
                style={{ fontSize: "0.75rem", padding: "0.375rem 0.625rem" }}
                onClick={() => setCriticalOnly(!criticalOnly)}
              >
                ⚠️ Kritik Olanlar
              </button>

              <button
                type="button"
                className={`btn ${actionsOnly ? "btn-warning" : "btn-secondary"}`}
                style={{ fontSize: "0.75rem", padding: "0.375rem 0.625rem" }}
                onClick={() => setActionsOnly(!actionsOnly)}
              >
                Aksiyon Bekleyenler
              </button>
            </div>

            {checks.length === 0 && !readOnly && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSeedStarter}
                style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "0.375rem" }}
              >
                <RefreshCw size={14} /> Standart 24 Kontrolü Yükle
              </button>
            )}
          </div>

          {/* Checklist Table */}
          {filteredChecks.length === 0 ? (
            <div className="card text-center" style={{ padding: "3rem" }}>
              <CheckSquare size={36} className="text-muted" style={{ margin: "0 auto 0.75rem auto" }} />
              <p style={{ margin: 0, fontWeight: 600, color: "var(--text-color)" }}>
                {checks.length === 0 ? "Henüz hazırlık kontrol maddesi eklenmemiş." : "Filtreye uygun kontrol maddesi bulunamadı."}
              </p>
              {checks.length === 0 && !readOnly && (
                <div style={{ marginTop: "1rem" }}>
                  <button type="button" className="btn btn-primary" onClick={handleSeedStarter}>
                    Standart 24 Kontrol Maddesini Tohumla
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: "0", overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="table" style={{ width: "100%", margin: 0, fontSize: "0.8125rem" }}>
                  <thead>
                    <tr style={{ background: "var(--color-bg-subtle, #f8fafc)" }}>
                      <th style={{ width: "10%" }}>Kod</th>
                      <th style={{ width: "14%" }}>Kategori</th>
                      <th style={{ width: "28%" }}>Kontrol Başlığı & Kapsam</th>
                      <th style={{ width: "18%" }}>Durum</th>
                      <th style={{ width: "16%" }}>Sorumlu Rol</th>
                      <th style={{ width: "14%", textAlign: "right" }}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChecks.map((c) => {
                      const isCrit = c.critical === 1;
                      return (
                        <tr key={c.id} style={{ borderBottom: "1px solid var(--border-color, #e2e8f0)" }}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <span className="font-bold text-mono" style={{ color: isCrit ? "#b91c1c" : "var(--color-primary, #1e3a8a)" }}>
                                {c.check_code}
                              </span>
                              {isCrit && <span title="Kritik Kontrol" style={{ color: "#ef4444", fontSize: "0.75rem" }}>⚠️</span>}
                            </div>
                          </td>

                          <td>
                            <span className="badge badge--secondary text-xs">{c.category}</span>
                            <div className="text-xs text-muted" style={{ marginTop: "2px" }}>
                              {READINESS_CATEGORY_LABELS[c.category]}
                            </div>
                          </td>

                          <td>
                            <div className="font-bold" style={{ color: "var(--text-color)" }}>{c.title}</div>
                            {c.description && (
                              <div className="text-xs text-muted" style={{ marginTop: "2px" }}>{c.description}</div>
                            )}
                            {c.evidence_required === 1 && (
                              <span className="badge badge--neutral text-xs" style={{ marginTop: "4px", display: "inline-block" }}>
                                📎 Saha Kanıtı Gerekli
                              </span>
                            )}
                            {c.action_note && (
                              <div className="text-xs text-danger font-bold" style={{ marginTop: "4px" }}>
                                Aksiyon: {c.action_note} {c.due_date ? `(Termin: ${c.due_date})` : ""}
                              </div>
                            )}
                          </td>

                          <td>
                            <select
                              className={`form-input text-xs font-bold ${
                                c.status === "READY" ? "text-success" :
                                c.status === "BLOCKED" ? "text-danger" :
                                c.status === "IN_PROGRESS" ? "text-warning" : "text-muted"
                              }`}
                              style={{ width: "100%", padding: "0.25rem 0.5rem" }}
                              value={c.status}
                              disabled={readOnly}
                              onChange={(e) => handleQuickStatusChange(c.id, e.target.value as ReadinessStatus)}
                            >
                              {(Object.keys(READINESS_STATUS_LABELS) as ReadinessStatus[]).map((st) => (
                                <option key={st} value={st}>
                                  {READINESS_STATUS_LABELS[st]}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td>
                            <span className="text-xs">{c.owner_role || "—"}</span>
                          </td>

                          <td style={{ textAlign: "right" }}>
                            {!readOnly && (
                              <div style={{ display: "inline-flex", gap: "0.25rem" }}>
                                <button
                                  type="button"
                                  className="btn-icon"
                                  title="Düzenle"
                                  onClick={() => {
                                    setModalCheck(c);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  type="button"
                                  className="btn-icon text-danger"
                                  title="Sil"
                                  onClick={() => handleDelete(c.id)}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: CATEGORY MATRIX ────────────────────────────────────── */}
      {activeTab === "categories" && summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {summary.categories.map((cat) => {
            return (
              <div
                key={cat.category}
                className="card"
                style={{
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderTop: `4px solid ${cat.readinessPercentage === 100 ? "#15803d" : cat.criticalOpenCount > 0 ? "#b91c1c" : "#2563eb"}`,
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span className="badge badge--secondary text-xs">{cat.category}</span>
                      <h4 style={{ margin: "0.25rem 0 0 0", fontSize: "0.9375rem", fontWeight: 700 }}>
                        {cat.categoryLabel}
                      </h4>
                    </div>
                    <span
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: 800,
                        color: cat.readinessPercentage === 100 ? "#15803d" : "#2563eb",
                      }}
                    >
                      %{cat.readinessPercentage}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden", margin: "0.75rem 0" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${cat.readinessPercentage}%`,
                        background: cat.readinessPercentage === 100 ? "#15803d" : "#2563eb",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <div>Toplam: <strong>{cat.totalCount}</strong></div>
                    <div>Hazır: <strong className="text-success">{cat.readyCount}</strong></div>
                    <div>Devam Eden: <strong>{cat.inProgressCount}</strong></div>
                    <div>Bloke: <strong className={cat.blockedCount > 0 ? "text-danger" : ""}>{cat.blockedCount}</strong></div>
                  </div>
                </div>

                <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color, #e2e8f0)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="text-xs">
                    {cat.criticalOpenCount > 0 ? (
                      <span className="text-danger font-bold">⚠️ {cat.criticalOpenCount} Kritik Açık</span>
                    ) : (
                      <span className="text-success font-bold">✓ Kritik Açık Yok</span>
                    )}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                    onClick={() => {
                      setSelectedCategory(cat.category);
                      setActiveTab("checklist");
                    }}
                  >
                    Maddeleri Gör
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 3: ACTIONS ────────────────────────────────────────────── */}
      {activeTab === "actions" && summary && (
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          {summary.actions.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <CheckCircle2 size={36} className="text-success" style={{ margin: "0 auto 0.75rem auto" }} />
              <p style={{ margin: 0, fontWeight: 600 }}>Tebrikler! Açık aksiyon veya bloke kontrol maddesi bulunmuyor.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table" style={{ width: "100%", margin: 0, fontSize: "0.8125rem" }}>
                <thead>
                  <tr style={{ background: "var(--color-bg-subtle, #f8fafc)" }}>
                    <th style={{ width: "12%" }}>Kod</th>
                    <th style={{ width: "24%" }}>Kontrol Başlığı & Kategori</th>
                    <th style={{ width: "32%" }}>Gerekli Aksiyon</th>
                    <th style={{ width: "18%" }}>Sorumlu Rol</th>
                    <th style={{ width: "14%" }}>Hedef Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.actions.map((act) => (
                    <tr key={act.id} style={{ borderBottom: "1px solid var(--border-color, #e2e8f0)" }}>
                      <td>
                        <span className="font-bold text-mono" style={{ color: act.critical ? "#b91c1c" : "inherit" }}>
                          {act.checkCode}
                        </span>
                        {act.critical && <span style={{ marginLeft: "4px", color: "#ef4444" }}>⚠️</span>}
                      </td>
                      <td>
                        <div className="font-bold">{act.title}</div>
                        <span className="badge badge--secondary text-xs">{act.categoryLabel}</span>
                      </td>
                      <td>
                        <div className="text-xs" style={{ color: "var(--text-color)" }}>{act.actionNote}</div>
                        <span className={`badge ${act.status === "BLOCKED" ? "badge--danger" : "badge--warning"} text-xs`} style={{ marginTop: "4px" }}>
                          {READINESS_STATUS_LABELS[act.status]}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge--neutral text-xs">{act.ownerRole}</span>
                      </td>
                      <td>
                        <span className="font-bold text-xs">{act.dueDate || "Belirtilmedi"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Modal ────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <ReadinessCheckModal
          check={modalCheck}
          projectId={projectId}
          onSave={handleSaveModal}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
