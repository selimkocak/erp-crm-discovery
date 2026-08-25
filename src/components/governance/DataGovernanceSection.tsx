// path: src/components/governance/DataGovernanceSection.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Database,
  Shield,
  CheckSquare,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import type {
  DataGovernanceAsset,
  DataGovernanceAccess,
  DataGovernanceApproval,
  DataGovernanceSummaryStats,
  ProcessMap,
} from "../../types";
import {
  getDataGovernanceAssets,
  createDataGovernanceAsset,
  updateDataGovernanceAsset,
  deleteDataGovernanceAsset,
  seedDefaultDataGovernanceAssets,
  getDataGovernanceAccessRules,
  createDataGovernanceAccess,
  updateDataGovernanceAccess,
  deleteDataGovernanceAccess,
  getDataGovernanceApprovals,
  createDataGovernanceApproval,
  updateDataGovernanceApproval,
  deleteDataGovernanceApproval,
  getDataGovernanceSummaryStats,
  getProcessMaps,
} from "../../db/client";
import { checkAssetSodRisk } from "../../types";
import { DataGovernanceAssetModal } from "../modals/DataGovernanceAssetModal";
import { DataGovernanceAccessModal } from "../modals/DataGovernanceAccessModal";
import { DataGovernanceApprovalModal } from "../modals/DataGovernanceApprovalModal";

interface DataGovernanceSectionProps {
  projectId: string;
  isProjectPassive?: boolean;
}

export const DataGovernanceSection: React.FC<DataGovernanceSectionProps> = ({
  projectId,
  isProjectPassive = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"assets" | "access" | "approvals">("assets");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  const [assets, setAssets] = useState<DataGovernanceAsset[]>([]);
  const [accessRules, setAccessRules] = useState<DataGovernanceAccess[]>([]);
  const [approvals, setApprovals] = useState<DataGovernanceApproval[]>([]);
  const [processMaps, setProcessMaps] = useState<ProcessMap[]>([]);
  const [stats, setStats] = useState<DataGovernanceSummaryStats | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [criticalityFilter, setCriticalityFilter] = useState("all");

  // Modals
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<DataGovernanceAsset | null>(null);

  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [editingAccess, setEditingAccess] = useState<DataGovernanceAccess | null>(null);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [editingApproval, setEditingApproval] = useState<DataGovernanceApproval | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [astList, accList, appList, pmList, statData] = await Promise.all([
        getDataGovernanceAssets(projectId),
        getDataGovernanceAccessRules(projectId),
        getDataGovernanceApprovals(projectId),
        getProcessMaps(projectId),
        getDataGovernanceSummaryStats(projectId),
      ]);
      setAssets(astList);
      setAccessRules(accList);
      setApprovals(appList);
      setProcessMaps(pmList);
      setStats(statData);
    } catch (err) {
      console.error("Data governance yüklenirken hata:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSeedStarter = async () => {
    if (isProjectPassive) return;
    try {
      setIsSeeding(true);
      await seedDefaultDataGovernanceAssets(projectId);
      await loadData();
    } catch (err) {
      console.error("Şablon yüklenirken hata:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Asset Handlers
  const handleSaveAsset = async (payload: Partial<DataGovernanceAsset>) => {
    if (editingAsset) {
      await updateDataGovernanceAsset(editingAsset.id, payload);
    } else {
      await createDataGovernanceAsset({
        project_id: projectId,
        domain: payload.domain,
        asset_name: payload.asset_name || "İsimsiz Varlık",
        asset_type: payload.asset_type || "MASTER_DATA",
        description: payload.description,
        system_of_record: payload.system_of_record,
        criticality: payload.criticality || "MEDIUM",
        master_data: payload.master_data ?? 1,
        process_data: payload.process_data ?? 0,
        personal_data: payload.personal_data ?? 0,
        financial_data: payload.financial_data ?? 0,
        quality_or_safety_data: payload.quality_or_safety_data ?? 0,
        owner_role: payload.owner_role,
        steward_role: payload.steward_role,
        technical_custodian_role: payload.technical_custodian_role,
        status: payload.status || "active",
        notes: payload.notes,
      });
    }
    await loadData();
  };

  const handleDeleteAsset = async (id: string) => {
    if (window.confirm("Bu veri varlığını silmek istediğinize emin misiniz? Bağlı erişim ve onay kuralları da silinecektir.")) {
      await deleteDataGovernanceAsset(id);
      await loadData();
    }
  };

  // Access Handlers
  const handleSaveAccess = async (payload: Partial<DataGovernanceAccess>) => {
    if (editingAccess) {
      await updateDataGovernanceAccess(editingAccess.id, payload);
    } else {
      await createDataGovernanceAccess({
        project_id: projectId,
        asset_id: payload.asset_id || "",
        actor_type: payload.actor_type || "ROLE",
        actor_name: payload.actor_name || "İsimsiz Rol",
        access_level: payload.access_level || "READ_ONLY",
        scope_type: payload.scope_type || "COMPANY",
        scope_value: payload.scope_value,
        approval_required: payload.approval_required ?? 0,
        approval_role: payload.approval_role,
        task_separation_required: payload.task_separation_required ?? 0,
        conflict_note: payload.conflict_note,
        limit_description: payload.limit_description,
        status: payload.status || "active",
        notes: payload.notes,
      });
    }
    await loadData();
  };

  const handleDeleteAccess = async (id: string) => {
    if (window.confirm("Bu erişim kuralını silmek istediğinize emin misiniz?")) {
      await deleteDataGovernanceAccess(id);
      await loadData();
    }
  };

  // Approval Handlers
  const handleSaveApproval = async (payload: Partial<DataGovernanceApproval>) => {
    if (editingApproval) {
      await updateDataGovernanceApproval(editingApproval.id, payload);
    } else {
      await createDataGovernanceApproval({
        project_id: projectId,
        asset_id: payload.asset_id,
        process_map_id: payload.process_map_id,
        approval_name: payload.approval_name || "Onay Kuralı",
        approval_role: payload.approval_role || "Yönetici",
        threshold_description: payload.threshold_description,
        approval_order: payload.approval_order ?? 1,
        mandatory: payload.mandatory ?? 1,
        separation_of_duties: payload.separation_of_duties ?? 0,
        notes: payload.notes,
      });
    }
    await loadData();
  };

  const handleDeleteApproval = async (id: string) => {
    if (window.confirm("Bu onay kuralını silmek istediğinize emin misiniz?")) {
      await deleteDataGovernanceApproval(id);
      await loadData();
    }
  };

  // Filtered Assets
  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      searchQuery === "" ||
      a.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.domain && a.domain.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.owner_role && a.owner_role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.steward_role && a.steward_role.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCrit =
      criticalityFilter === "all" || a.criticality === criticalityFilter;

    return matchesSearch && matchesCrit;
  });

  const assetMap = new Map<string, string>();
  for (const a of assets) {
    assetMap.set(a.id, a.asset_name);
  }

  const pmapMap = new Map<string, string>();
  for (const pm of processMaps) {
    pmapMap.set(pm.id, pm.name);
  }

  return (
    <div className="data-governance-section" style={{ marginTop: "1rem" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Database size={20} style={{ color: "var(--color-primary-600, #2563eb)" }} />
            Veri Sahipliği, Yetkiler ve Sorumluluk Matrisi
          </h2>
          <p className="text-muted text-xs" style={{ margin: "0.25rem 0 0 0" }}>
            Ana veriler, kritik süreç verileri, rol/grup bazlı erişim seviyeleri ve görevler ayrılığı (SoD) kontrolleri.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {assets.length === 0 && !isProjectPassive && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleSeedStarter}
              disabled={isSeeding}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
            >
              <Sparkles size={14} style={{ color: "#d97706" }} />
              {isSeeding ? "Yükleniyor..." : "Başlangıç Şablonunu Yükle (8 Varlık)"}
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadData}
            title="Yenile"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Yenile
          </button>
        </div>
      </div>

      {/* KPI Cards Band */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <div className="card" style={{ padding: "0.875rem", borderLeft: "4px solid var(--color-primary-600, #2563eb)" }}>
            <span className="text-xs text-muted font-bold" style={{ display: "block" }}>TOPLAM VARLIK</span>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-primary-700, #1d4ed8)" }}>
              {stats.totalAssets} Varlık
            </span>
          </div>

          <div className="card" style={{ padding: "0.875rem", borderLeft: stats.unassignedOwnerCount > 0 ? "4px solid #ef4444" : "4px solid #10b981" }}>
            <span className="text-xs text-muted font-bold" style={{ display: "block" }}>SAHİPSİZ VERİ (OWNER YOK)</span>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: stats.unassignedOwnerCount > 0 ? "#b91c1c" : "#15803d" }}>
              {stats.unassignedOwnerCount} Varlık
            </span>
          </div>

          <div className="card" style={{ padding: "0.875rem", borderLeft: "4px solid #f59e0b" }}>
            <span className="text-xs text-muted font-bold" style={{ display: "block" }}>KRİTİK / YÜKSEK VERİ</span>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#b45309" }}>
              {stats.criticalAssetCount} Varlık
            </span>
          </div>

          <div className="card" style={{ padding: "0.875rem", borderLeft: stats.sodConflictCount > 0 ? "4px solid #dc2626" : "4px solid #10b981" }}>
            <span className="text-xs text-muted font-bold" style={{ display: "block" }}>SoD ÇATIŞMA UYARISI</span>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: stats.sodConflictCount > 0 ? "#b91c1c" : "#15803d" }}>
              {stats.sodConflictCount} Varlık
            </span>
          </div>

          <div className="card" style={{ padding: "0.875rem", borderLeft: "4px solid #6366f1" }}>
            <span className="text-xs text-muted font-bold" style={{ display: "block" }}>ERİŞİM & ONAY KURALLARI</span>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#4338ca" }}>
              {stats.totalAccessRules} Kural / {stats.totalApprovals} Onay
            </span>
          </div>
        </div>
      )}

      {/* Subtabs Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color, #e2e8f0)", marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <button
            type="button"
            className={`btn btn-sm ${activeSubTab === "assets" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setActiveSubTab("assets")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", borderRadius: "6px 6px 0 0" }}
          >
            <Database size={15} />
            Veri Varlıkları & Sahiplik ({assets.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeSubTab === "access" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setActiveSubTab("access")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", borderRadius: "6px 6px 0 0" }}
          >
            <Shield size={15} />
            Erişim & Yetki Matrisi ({accessRules.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeSubTab === "approvals" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setActiveSubTab("approvals")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", borderRadius: "6px 6px 0 0" }}
          >
            <CheckSquare size={15} />
            Onay Kuralları & Kademeler ({approvals.length})
          </button>
        </div>

        <div>
          {activeSubTab === "assets" && !isProjectPassive && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingAsset(null);
                setIsAssetModalOpen(true);
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
            >
              <Plus size={14} /> Yeni Veri Varlığı Ekle
            </button>
          )}

          {activeSubTab === "access" && !isProjectPassive && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingAccess(null);
                setIsAccessModalOpen(true);
              }}
              disabled={assets.length === 0}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
            >
              <Plus size={14} /> Yeni Erişim Kuralı Ekle
            </button>
          )}

          {activeSubTab === "approvals" && !isProjectPassive && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingApproval(null);
                setIsApprovalModalOpen(true);
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
            >
              <Plus size={14} /> Yeni Onay Kuralı Ekle
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Veri Varlıkları & Sahiplik */}
      {activeSubTab === "assets" && (
        <div>
          {/* Filter Bar */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Varlık adı, alan veya rol ile filtrele..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "30px" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Filter size={14} style={{ color: "var(--text-muted)" }} />
              <select
                className="form-control form-control-sm"
                value={criticalityFilter}
                onChange={(e) => setCriticalityFilter(e.target.value)}
                style={{ width: "150px" }}
              >
                <option value="all">Tüm Kritiklikler</option>
                <option value="CRITICAL">Kritik (CRITICAL)</option>
                <option value="HIGH">Yüksek (HIGH)</option>
                <option value="MEDIUM">Orta (MEDIUM)</option>
                <option value="LOW">Düşük (LOW)</option>
              </select>
            </div>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
              <p className="text-muted" style={{ margin: 0 }}>
                {assets.length === 0
                  ? "Henüz veri varlığı tanımlanmamış. 'Başlangıç Şablonunu Yükle' butonuna tıklayarak kurumsal standart 8 ERP varlığını ekleyebilirsiniz."
                  : "Arama kriterine uygun veri varlığı bulunamadı."}
              </p>
            </div>
          ) : (
            <div className="table-responsive" style={{ overflowX: "auto" }}>
              <table className="table table-striped" style={{ width: "100%", fontSize: "0.8125rem" }}>
                <thead>
                  <tr>
                    <th style={{ width: "22%" }}>Veri Varlığı & Alan</th>
                    <th style={{ width: "12%" }}>Tip / Sistem</th>
                    <th style={{ width: "16%" }}>Veri Sahibi (Owner)</th>
                    <th style={{ width: "16%" }}>Veri Sorumlusu (Steward)</th>
                    <th style={{ width: "14%" }}>Teknik Emanetçi</th>
                    <th style={{ width: "10%" }}>Kritiklik / SoD</th>
                    <th style={{ width: "10%", textAlign: "right" }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((ast) => {
                    const sod = checkAssetSodRisk(ast);
                    return (
                      <tr key={ast.id}>
                        <td>
                          <div className="font-bold">{ast.asset_name}</div>
                          {ast.domain && <span className="text-xs text-muted">{ast.domain}</span>}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", marginTop: "3px" }}>
                            {Boolean(ast.master_data) && <span className="badge badge--secondary text-xs">Ana Veri</span>}
                            {Boolean(ast.financial_data) && <span className="badge badge--warning text-xs">Finansal</span>}
                            {Boolean(ast.personal_data) && <span className="badge badge--danger text-xs">KVKK</span>}
                            {Boolean(ast.quality_or_safety_data) && <span className="badge badge--info text-xs">Kalite</span>}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge--secondary text-xs">{ast.asset_type}</span>
                          <div className="text-xs text-muted" style={{ marginTop: "2px" }}>
                            {ast.system_of_record || "ERP"}
                          </div>
                        </td>
                        <td>
                          <strong>{ast.owner_role || <span className="text-danger italic">Tanımsız</span>}</strong>
                        </td>
                        <td>
                          <div>{ast.steward_role || <span className="text-danger italic">Tanımsız</span>}</div>
                        </td>
                        <td>
                          <div>{ast.technical_custodian_role || <span className="text-danger italic">Tanımsız</span>}</div>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span className={`badge ${ast.criticality === "CRITICAL" ? "badge--danger" : ast.criticality === "HIGH" ? "badge--warning" : "badge--info"}`}>
                              {ast.criticality}
                            </span>
                            {sod.hasRisk && (
                              <span className="badge badge--danger" title={sod.message}>
                                ⚠️ SoD Riski
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => {
                              setEditingAsset(ast);
                              setIsAssetModalOpen(true);
                            }}
                            title="Düzenle"
                          >
                            <Edit2 size={13} />
                          </button>
                          {!isProjectPassive && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs text-danger"
                              onClick={() => handleDeleteAsset(ast.id)}
                              title="Sil"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Erişim & Yetki Matrisi */}
      {activeSubTab === "access" && (
        <div>
          {accessRules.length === 0 ? (
            <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
              <p className="text-muted" style={{ margin: 0 }}>
                Henüz erişim veya yetki kuralı tanımlanmamış. 'Yeni Erişim Kuralı Ekle' butonuyla rol ve grup bazlı izinleri modelleyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="table-responsive" style={{ overflowX: "auto" }}>
              <table className="table table-striped" style={{ width: "100%", fontSize: "0.8125rem" }}>
                <thead>
                  <tr>
                    <th style={{ width: "18%" }}>Erişen Rol / Grup</th>
                    <th style={{ width: "20%" }}>İlgili Veri Varlığı</th>
                    <th style={{ width: "14%" }}>Erişim Seviyesi</th>
                    <th style={{ width: "16%" }}>Kapsam</th>
                    <th style={{ width: "16%" }}>Onay Şartı</th>
                    <th style={{ width: "16%" }}>Limit / Risk Notu</th>
                    <th style={{ width: "10%", textAlign: "right" }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {accessRules.map((acc) => (
                    <tr key={acc.id}>
                      <td>
                        <div className="font-bold">{acc.actor_name}</div>
                        <span className="text-xs text-muted">({acc.actor_type})</span>
                      </td>
                      <td>
                        <strong>{assetMap.get(acc.asset_id) || "Bilinmeyen Varlık"}</strong>
                      </td>
                      <td>
                        <span className={`badge ${acc.access_level === "FULL" ? "badge--danger" : acc.access_level === "CREATE" || acc.access_level === "UPDATE" ? "badge--warning" : "badge--info"}`}>
                          {acc.access_level}
                        </span>
                      </td>
                      <td>
                        <div>{acc.scope_type}</div>
                        {acc.scope_value && <span className="text-xs text-muted">{acc.scope_value}</span>}
                      </td>
                      <td>
                        {acc.approval_required ? (
                          <span className="badge badge--warning">
                            Onay Şartı ({acc.approval_role || "Yönetici"})
                          </span>
                        ) : (
                          <span className="text-muted text-xs">Doğrudan</span>
                        )}
                      </td>
                      <td>
                        {Boolean(acc.task_separation_required) && (
                          <span className="badge badge--danger text-xs" style={{ display: "inline-block", marginBottom: "2px" }}>
                            ⚠️ SoD Zorunlu
                          </span>
                        )}
                        {acc.limit_description && <div className="text-xs">{acc.limit_description}</div>}
                        {acc.conflict_note && <div className="text-xs text-danger">{acc.conflict_note}</div>}
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => {
                            setEditingAccess(acc);
                            setIsAccessModalOpen(true);
                          }}
                          title="Düzenle"
                        >
                          <Edit2 size={13} />
                        </button>
                        {!isProjectPassive && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs text-danger"
                            onClick={() => handleDeleteAccess(acc.id)}
                            title="Sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Onay Kuralları & Kademeler */}
      {activeSubTab === "approvals" && (
        <div>
          {approvals.length === 0 ? (
            <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
              <p className="text-muted" style={{ margin: 0 }}>
                Henüz onay kuralı veya limiti tanımlanmamış. 'Yeni Onay Kuralı Ekle' butonuyla kademeli onay zincirlerini kaydedebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="table-responsive" style={{ overflowX: "auto" }}>
              <table className="table table-striped" style={{ width: "100%", fontSize: "0.8125rem" }}>
                <thead>
                  <tr>
                    <th style={{ width: "6%" }}>Sıra</th>
                    <th style={{ width: "24%" }}>Onay Kuralı Adı</th>
                    <th style={{ width: "20%" }}>İlgili Varlık / Süreç</th>
                    <th style={{ width: "18%" }}>Onaylayan Rol</th>
                    <th style={{ width: "16%" }}>Eşik / Limit</th>
                    <th style={{ width: "8%" }}>SoD</th>
                    <th style={{ width: "8%", textAlign: "right" }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.map((appr) => (
                    <tr key={appr.id}>
                      <td><strong className="text-mono">{appr.approval_order}</strong></td>
                      <td>
                        <div className="font-bold">{appr.approval_name}</div>
                        {Boolean(appr.mandatory) && <span className="badge badge--danger text-xs">Zorunlu Onay</span>}
                      </td>
                      <td>
                        {appr.asset_id && assetMap.has(appr.asset_id) && (
                          <div>{assetMap.get(appr.asset_id)}</div>
                        )}
                        {appr.process_map_id && pmapMap.has(appr.process_map_id) && (
                          <span className="text-xs text-muted">🗺️ {pmapMap.get(appr.process_map_id)}</span>
                        )}
                        {!appr.asset_id && !appr.process_map_id && "—"}
                      </td>
                      <td><strong>{appr.approval_role}</strong></td>
                      <td>{appr.threshold_description || "Tüm Tutarlar"}</td>
                      <td>
                        {Boolean(appr.separation_of_duties) ? (
                          <span className="badge badge--warning text-xs">Ayrılık Şart</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => {
                            setEditingApproval(appr);
                            setIsApprovalModalOpen(true);
                          }}
                          title="Düzenle"
                        >
                          <Edit2 size={13} />
                        </button>
                        {!isProjectPassive && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs text-danger"
                            onClick={() => handleDeleteApproval(appr.id)}
                            title="Sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <DataGovernanceAssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        initialData={editingAsset}
        onSave={handleSaveAsset}
        isReadOnly={isProjectPassive}
      />

      <DataGovernanceAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        assets={assets}
        initialData={editingAccess}
        onSave={handleSaveAccess}
        isReadOnly={isProjectPassive}
      />

      <DataGovernanceApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        assets={assets}
        processMaps={processMaps}
        initialData={editingApproval}
        onSave={handleSaveApproval}
        isReadOnly={isProjectPassive}
      />
    </div>
  );
};
