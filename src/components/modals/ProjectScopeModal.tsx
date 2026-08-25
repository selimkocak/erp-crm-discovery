/**
 * ERP CRM Discovery — ProjectScopeModal Component
 * FAZ-55: Geri Alınabilir Kapsam Yönetimi, Dinamik Modül Ekleme/Çıkarma ve Değişiklik Geçmişi
 */

import React, { useEffect, useState, useMemo } from "react";
import {
  X,
  Layers,
  Search,
  Plus,
  MinusCircle,
  RotateCcw,
  AlertTriangle,
  History,
  Clock,
  Filter,
} from "lucide-react";
import {
  getMasterBusinessFunctions,
  getProjectDetail,
  addOrReactivateProjectFunction,
  deactivateProjectFunction,
  getFunctionDataCounts,
  getProjectScopeChanges,
} from "../../db/client";
import { BUSINESS_FUNCTION_REGISTRY } from "../../generated/businessFunctions";
import type {
  BusinessFunction,
  EnrichedProjectFunction,
  FunctionDataCounts,
  ProjectScopeChange,
} from "../../types";

interface ProjectScopeModalProps {
  isOpen: boolean;
  projectId: string;
  projectName: string;
  onClose: () => void;
  onScopeUpdated: () => void;
  isProjectPassive?: boolean;
}

export const ProjectScopeModal: React.FC<ProjectScopeModalProps> = ({
  isOpen,
  projectId,
  projectName,
  onClose,
  onScopeUpdated,
  isProjectPassive = false,
}) => {
  const [allMasterFunctions, setAllMasterFunctions] = useState<BusinessFunction[]>([]);
  const [projectFunctions, setProjectFunctions] = useState<EnrichedProjectFunction[]>([]);
  const [scopeHistory, setScopeHistory] = useState<ProjectScopeChange[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Deactivation confirmation modal state
  const [deactivatingBf, setDeactivatingBf] = useState<{
    code: string;
    name: string;
    counts: FunctionDataCounts | null;
  } | null>(null);
  const [deactivationReason, setDeactivationReason] = useState<string>("");
  const [isCheckingCounts, setIsCheckingCounts] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const [masters, detail, history] = await Promise.all([
        getMasterBusinessFunctions(),
        getProjectDetail(projectId),
        getProjectScopeChanges(projectId),
      ]);

      setAllMasterFunctions(masters.length > 0 ? masters : (BUSINESS_FUNCTION_REGISTRY as any));
      if (detail) {
        setProjectFunctions(detail.functions || []);
      }
      setScopeHistory(history || []);
    } catch (err: any) {
      console.error("Kapsam verileri yüklenirken hata:", err);
      setErrorMessage(err?.message || "Kapsam verileri yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, projectId]);

  // Active (in-scope) and inactive maps
  const activeFunctionCodes = useMemo(() => {
    const set = new Set<string>();
    for (const pf of projectFunctions) {
      if (pf.is_active === 1 || pf.is_active === undefined) {
        set.add(pf.code);
      }
    }
    return set;
  }, [projectFunctions]);

  const existingProjectFunctionMap = useMemo(() => {
    const map = new Map<string, EnrichedProjectFunction>();
    for (const pf of projectFunctions) {
      map.set(pf.code, pf);
    }
    return map;
  }, [projectFunctions]);

  // Filtered master functions
  const filteredFunctions = useMemo(() => {
    return allMasterFunctions.filter((bf) => {
      const matchesCategory = categoryFilter === "all" || bf.category === categoryFilter;
      const matchesSearch =
        searchQuery.trim() === "" ||
        bf.name_tr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bf.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allMasterFunctions, categoryFilter, searchQuery]);

  const activeFunctionsList = useMemo(() => {
    return filteredFunctions.filter((bf) => activeFunctionCodes.has(bf.code));
  }, [filteredFunctions, activeFunctionCodes]);

  const inactiveFunctionsList = useMemo(() => {
    return filteredFunctions.filter((bf) => !activeFunctionCodes.has(bf.code));
  }, [filteredFunctions, activeFunctionCodes]);

  // Handle Add / Reactivate
  const handleAddOrReactivate = async (bfCode: string) => {
    if (isUpdating || isProjectPassive) return;
    try {
      setIsUpdating(true);
      setErrorMessage(null);
      await addOrReactivateProjectFunction(projectId, bfCode);
      await loadData();
      onScopeUpdated();
    } catch (err: any) {
      console.error("Fonksiyon ekleme hatası:", err);
      setErrorMessage(err?.message || "Fonksiyon kapsama eklenemedi.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Initiate Deactivation
  const handleInitiateDeactivate = async (bfCode: string, bfName: string) => {
    if (isUpdating || isProjectPassive) return;
    try {
      setIsCheckingCounts(true);
      const counts = await getFunctionDataCounts(projectId, bfCode);
      setDeactivatingBf({ code: bfCode, name: bfName, counts });
      setDeactivationReason("");
    } catch (err: any) {
      console.error("Veri kontrolü hatası:", err);
      setDeactivatingBf({ code: bfCode, name: bfName, counts: null });
    } finally {
      setIsCheckingCounts(false);
    }
  };

  // Confirm Deactivation
  const handleConfirmDeactivate = async () => {
    if (!deactivatingBf || isUpdating || isProjectPassive) return;
    try {
      setIsUpdating(true);
      setErrorMessage(null);
      await deactivateProjectFunction(
        projectId,
        deactivatingBf.code,
        deactivationReason.trim() || undefined
      );
      setDeactivatingBf(null);
      await loadData();
      onScopeUpdated();
    } catch (err: any) {
      console.error("Kapsam dışına alma hatası:", err);
      setErrorMessage(err?.message || "Fonksiyon kapsam dışına alınamadı.");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "added":
        return <span className="badge badge--success">Eklendi</span>;
      case "reactivated":
        return <span className="badge badge--primary">Yeniden Etkinleştirildi</span>;
      case "removed":
        return <span className="badge badge--outline-danger">Kapsam Dışı</span>;
      default:
        return <span className="badge badge--secondary">{action}</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-container gov-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scope-modal-title"
        style={{ maxWidth: "min(860px, calc(100vw - 20px))", maxHeight: "min(calc(100vh - 20px), calc(100dvh - 20px))", display: "flex", flexDirection: "column" }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header__title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Layers size={20} style={{ color: "var(--primary)" }} />
            <div>
              <h3 id="scope-modal-title" style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
                Proje Kapsamı ve İş Fonksiyonları
              </h3>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {projectName} &bull; {activeFunctionCodes.size} Aktif İş Fonksiyonu
              </span>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Kapat" disabled={isUpdating}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: "1.25rem", overflowY: "auto", flex: 1 }}>
          {errorMessage && (
            <div
              style={{
                backgroundColor: "var(--danger-bg, #fef2f2)",
                border: "1px solid var(--danger-border, #fecaca)",
                color: "var(--danger-text, #991b1b)",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md, 6px)",
                marginBottom: "1rem",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <AlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {isProjectPassive && (
            <div
              style={{
                backgroundColor: "var(--bg-surface-subtle, #f8fafc)",
                border: "1px solid var(--border-color, #cbd5e1)",
                color: "var(--text-muted, #64748b)",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md, 6px)",
                marginBottom: "1rem",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Clock size={16} />
              <span>Proje pasif durumdadır. Kapsamı değiştirmek için projeyi yeniden aktifleştirin.</span>
            </div>
          )}

          {/* Filter and Search Bar */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ flex: "1 1 240px", position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Fonksiyon adı veya koduna göre ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "2.25rem", width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <Filter size={15} style={{ color: "var(--text-muted)" }} />
              <select
                className="input-select input-select--sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="core">Operasyon &amp; Tedarik</option>
                <option value="finance">Finans &amp; Muhasebe</option>
                <option value="crm">Müşteri &amp; Satış</option>
                <option value="production">Üretim &amp; Varlık</option>
                <option value="support">Destek &amp; İK</option>
                <option value="horizontal">Yatay Süreçler</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div style={{ textAlign: "center", padding: "2.5rem 0", color: "var(--text-muted)" }}>
              Kapsam bilgileri yükleniyor...
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {/* Left Column: Active Functions */}
              <div
                style={{
                  border: "1px solid var(--border-subtle, #e2e8f0)",
                  borderRadius: "var(--radius-md, 6px)",
                  padding: "1rem",
                  backgroundColor: "var(--bg-surface, #ffffff)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                    borderBottom: "1px solid var(--border-subtle, #e2e8f0)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  <strong style={{ fontSize: "0.95rem", color: "var(--color-primary-700, #0369a1)" }}>
                    Kapsamdaki Fonksiyonlar ({activeFunctionsList.length})
                  </strong>
                  <span className="badge badge--success">{activeFunctionsList.length} Aktif</span>
                </div>

                <div style={{ maxHeight: "360px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {activeFunctionsList.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", margin: "1rem 0" }}>
                      Seçili filtrede kapsamda fonksiyon bulunamadı.
                    </p>
                  ) : (
                    activeFunctionsList.map((bf) => (
                      <div
                        key={bf.code}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "var(--radius-sm, 4px)",
                          backgroundColor: "var(--bg-surface-subtle, #f8fafc)",
                          border: "1px solid var(--border-subtle, #e2e8f0)",
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: "0.875rem", display: "block" }}>{bf.name_tr}</strong>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{bf.code}</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                          disabled={isUpdating || isProjectPassive || isCheckingCounts}
                          onClick={() => handleInitiateDeactivate(bf.code, bf.name_tr)}
                          title="Kapsam dışına al"
                        >
                          <MinusCircle size={13} />
                          <span>Kapsam Dışı</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Inactive / Available Functions */}
              <div
                style={{
                  border: "1px solid var(--border-subtle, #e2e8f0)",
                  borderRadius: "var(--radius-md, 6px)",
                  padding: "1rem",
                  backgroundColor: "var(--bg-surface, #ffffff)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                    borderBottom: "1px solid var(--border-subtle, #e2e8f0)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  <strong style={{ fontSize: "0.95rem", color: "var(--text-secondary, #475569)" }}>
                    Eklenebilir / Kapsam Dışı ({inactiveFunctionsList.length})
                  </strong>
                  <span className="badge badge--muted">{inactiveFunctionsList.length} Dışarıda</span>
                </div>

                <div style={{ maxHeight: "360px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {inactiveFunctionsList.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", margin: "1rem 0" }}>
                      Tüm fonksiyonlar halihazırda proje kapsamında.
                    </p>
                  ) : (
                    inactiveFunctionsList.map((bf) => {
                      const isReactivation = existingProjectFunctionMap.has(bf.code);
                      return (
                        <div
                          key={bf.code}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "var(--radius-sm, 4px)",
                            backgroundColor: "var(--bg-surface-subtle, #f8fafc)",
                            border: "1px solid var(--border-subtle, #e2e8f0)",
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: "0.875rem", display: "block" }}>{bf.name_tr}</strong>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {bf.code} {isReactivation && <span style={{ color: "var(--primary)" }}>(Daha önce çıkarıldı)</span>}
                            </span>
                          </div>
                          <button
                            type="button"
                            className={isReactivation ? "btn btn--continue btn--sm" : "btn btn--start btn--sm"}
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                            disabled={isUpdating || isProjectPassive}
                            onClick={() => handleAddOrReactivate(bf.code)}
                            title={isReactivation ? "Yeniden Kapsama Al" : "Kapsama Ekle"}
                          >
                            {isReactivation ? <RotateCcw size={13} /> : <Plus size={13} />}
                            <span>{isReactivation ? "Yeniden Ekle" : "Ekle"}</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Scope Change History Section */}
          <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border-subtle, #e2e8f0)", paddingTop: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <History size={16} style={{ color: "var(--text-muted)" }} />
              <strong style={{ fontSize: "0.9rem" }}>Son Kapsam Değişiklikleri ({scopeHistory.length})</strong>
            </div>

            {scopeHistory.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0 }}>
                Bu projede henüz kayıtlı kapsam değişikliği bulunmuyor.
              </p>
            ) : (
              <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                <table className="custom-table" style={{ fontSize: "0.8rem" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "0.35rem 0.5rem" }}>Tarih</th>
                      <th style={{ padding: "0.35rem 0.5rem" }}>İş Fonksiyonu</th>
                      <th style={{ padding: "0.35rem 0.5rem" }}>İşlem</th>
                      <th style={{ padding: "0.35rem 0.5rem" }}>Açıklama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopeHistory.map((sh) => {
                      const bfReg = BUSINESS_FUNCTION_REGISTRY.find((b) => b.code === sh.business_function_code);
                      const bfTitle = bfReg ? bfReg.name_tr : sh.business_function_code;
                      return (
                        <tr key={sh.id}>
                          <td style={{ padding: "0.35rem 0.5rem", whiteSpace: "nowrap" }}>{formatDate(sh.created_at)}</td>
                          <td style={{ padding: "0.35rem 0.5rem" }}>
                            <strong>{bfTitle}</strong> <span style={{ color: "var(--text-muted)" }}>({sh.business_function_code})</span>
                          </td>
                          <td style={{ padding: "0.35rem 0.5rem" }}>{getActionBadge(sh.action)}</td>
                          <td style={{ padding: "0.35rem 0.5rem", color: "var(--text-muted)" }}>{sh.reason || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", padding: "0.75rem 1.25rem" }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isUpdating}>
            Kapat
          </button>
        </div>
      </div>

      {/* Deactivation Confirmation Sub-Modal */}
      {deactivatingBf && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 10001 }}
          onClick={() => setDeactivatingBf(null)}
          role="presentation"
        >
          <div
            className="modal-container gov-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="deactivate-modal-title"
            style={{ maxWidth: "520px" }}
          >
            <div className="modal-header">
              <div className="modal-header__title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertTriangle size={20} style={{ color: "var(--color-danger, #dc2626)" }} />
                <h3 id="deactivate-modal-title" style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
                  Fonksiyonu Kapsam Dışına Al
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeactivatingBf(null)}
                aria-label="Kapat"
                disabled={isUpdating}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: "1.25rem" }}>
              <p style={{ margin: "0 0 1rem", fontSize: "0.95rem" }}>
                <strong>&quot;{deactivatingBf.name}&quot;</strong> iş fonksiyonunu proje kapsamı dışına almak üzeresiniz.
              </p>

              {deactivatingBf.counts && deactivatingBf.counts.total > 0 ? (
                <div
                  style={{
                    backgroundColor: "var(--bg-surface-subtle, #f8fafc)",
                    border: "1px solid var(--border-subtle, #e2e8f0)",
                    borderRadius: "var(--radius-md, 6px)",
                    padding: "0.875rem",
                    marginBottom: "1rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <strong style={{ color: "var(--color-warning-700, #b45309)", display: "block", marginBottom: "0.5rem" }}>
                    Mevcut Çalışma Kayıtları Bulundu:
                  </strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                    {deactivatingBf.counts.answers > 0 && (
                      <span className="badge badge-completed">{deactivatingBf.counts.answers} Soru Cevabı</span>
                    )}
                    {deactivatingBf.counts.findings > 0 && (
                      <span className="badge badge-completed">{deactivatingBf.counts.findings} Bulgu</span>
                    )}
                    {deactivatingBf.counts.requirements > 0 && (
                      <span className="badge badge-completed">{deactivatingBf.counts.requirements} Gereksinim</span>
                    )}
                    {deactivatingBf.counts.risks > 0 && (
                      <span className="badge badge-completed">{deactivatingBf.counts.risks} Risk</span>
                    )}
                    {deactivatingBf.counts.notes > 0 && (
                      <span className="badge badge-completed">{deactivatingBf.counts.notes} Not</span>
                    )}
                    {deactivatingBf.counts.attachments > 0 && (
                      <span className="badge badge-completed">{deactivatingBf.counts.attachments} Ek Dosya</span>
                    )}
                  </div>
                  <p style={{ margin: "0.75rem 0 0", color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.4 }}>
                    Kapsam dışına alındığında bu veriler silinmez, korunur. Fonksiyon daha sonra yeniden eklendiğinde tüm cevap ve kayıtlar eksiksiz geri görünür.
                  </p>
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  Bu fonksiyonda henüz girilmiş veri bulunmuyor.
                </p>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.85rem", fontWeight: 600 }}>
                  Kapsam Dışı Bırakma Nedeni (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: Müşteri bu fazda ERP yerine mevcut üçüncü parti yazılımı kullanacak"
                  value={deactivationReason}
                  onChange={(e) => setDeactivationReason(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", padding: "0.75rem 1.25rem" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeactivatingBf(null)}
                disabled={isUpdating}
              >
                Vazgeç
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={handleConfirmDeactivate}
                disabled={isUpdating}
              >
                {isUpdating ? "İşleniyor..." : "Kapsam Dışı Bırak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
