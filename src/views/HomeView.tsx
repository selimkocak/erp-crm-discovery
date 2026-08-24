import React, { useEffect, useState } from "react";
import {
  Plus,
  FolderOpen,
  Pencil,
  Trash2,
  Calendar,
  Building2,
  Layers,
  AlertCircle,
  Download,
  Upload,
  Copy,
  CheckCircle2,
  Info,
  X as XIcon,
  PauseCircle,
  Play,
  Sparkles,
} from "lucide-react";
import { getProjects, deleteProject, updateProjectStatus } from "../db/client";
import { saveProjectBackupToFile, type SaveBackupResult } from "../storage/backupManager";
import {
  RestoreProjectModal,
  DuplicateProjectModal,
  BackupSuccessModal,
} from "../components/ProjectBackupModals";
import { ProjectDeactivateModal } from "../components/modals/ProjectDeactivateModal";
import { CreateDemoProjectModal } from "../components/modals/CreateDemoProjectModal";
import { createManufacturingDemoProject } from "../demo/manufacturingPilot";
import {
  calculateScheduleStatus,
  getScheduleStatusBadgeMeta,
  formatDateRangeSummary,
} from "../models/scheduleStatus";
import type { ProjectListItem } from "../types";

interface HomeViewProps {
  onNewProject: () => void;
  onOpenProject: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNewProject,
  onOpenProject,
  onEditProject,
}) => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "passive">("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Backup & Operations state
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [restoreInitialPath, setRestoreInitialPath] = useState<string | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<{ id: string; name: string } | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isCreateDemoOpen, setIsCreateDemoOpen] = useState(false);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const [exportingProjectId, setExportingProjectId] = useState<string | null>(null);
  const [backupSuccessResult, setBackupSuccessResult] = useState<SaveBackupResult | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "info" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4000);
  };

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (err: any) {
      console.error("Projeler yüklenirken hata:", err);
      setError(err?.message || "Veritabanına erişilirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const activeCount = projects.filter((p) => (p.status || "active") === "active").length;
  const passiveCount = projects.filter((p) => p.status === "passive").length;

  const filteredProjects = projects.filter((p) => {
    if (statusFilter === "active") return (p.status || "active") === "active";
    if (statusFilter === "passive") return p.status === "passive";
    return true;
  });

  const handleExport = async (projId: string) => {
    setExportingProjectId(projId);
    try {
      const res = await saveProjectBackupToFile(projId);
      if (!res.cancelled) {
        setBackupSuccessResult(res);
      }
    } catch (err: any) {
      showToast("error", `Yedekleme başarısız: ${err?.message || err}`);
    } finally {
      setExportingProjectId(null);
    }
  };

  const handleDelete = async (projectId: string, projectName: string) => {
    if (window.confirm(`"${projectName}" analizini ve bağlı tüm verilerini kalıcı olarak silmek istediğinize emin misiniz?`)) {
      try {
        await deleteProject(projectId);
        showToast("info", `"${projectName}" analizi silindi.`);
        await loadProjects();
      } catch (err: any) {
        showToast("error", "Silme işlemi başarısız: " + (err?.message || "Bilinmeyen hata"));
      }
    }
  };

  const handleActivate = async (projectId: string, projectName: string) => {
    try {
      await updateProjectStatus(projectId, "active");
      showToast("success", `"${projectName}" projesi aktifleştirildi.`);
      await loadProjects();
    } catch (err: any) {
      showToast("error", "Proje aktifleştirilemedi: " + (err?.message || err));
    }
  };

  const handleDeactivateConfirm = async (_reason?: string) => {
    if (!deactivateTarget) return;
    try {
      setIsDeactivating(true);
      await updateProjectStatus(deactivateTarget.id, "passive");
      showToast("success", `"${deactivateTarget.name}" projesi pasife alındı.`);
      setDeactivateTarget(null);
      await loadProjects();
    } catch (err: any) {
      showToast("error", "Proje pasife alınamadı: " + (err?.message || err));
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleCreateDemoConfirm = async () => {
    try {
      setIsCreatingDemo(true);
      const res = await createManufacturingDemoProject();
      showToast("success", `Kurgusal demo projesi ("${res.projectName}") başarıyla oluşturuldu.`);
      setIsCreateDemoOpen(false);
      onOpenProject(res.projectId);
    } catch (err: any) {
      console.error("Demo proje oluşturulurken hata:", err);
      showToast("error", "Demo proje oluşturulamadı: " + (err?.message || err));
    } finally {
      setIsCreatingDemo(false);
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

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`gov-toast gov-toast--${toast.type}`}
          role="status"
          style={{
            position: "fixed",
            top: "1.5rem",
            right: "1.5rem",
            zIndex: 9999,
            maxWidth: "440px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          }}
        >
          <div className="gov-toast__content">
            <span className="gov-toast__icon">
              {toast.type === "success" && <CheckCircle2 size={18} />}
              {toast.type === "info" && <Info size={18} />}
              {toast.type === "error" && <AlertCircle size={18} />}
            </span>
            <span className="gov-toast__message">{toast.message}</span>
          </div>
          <button
            type="button"
            className="gov-toast__close"
            onClick={() => setToast(null)}
            aria-label="Kapat"
          >
            <XIcon size={16} />
          </button>
        </div>
      )}

      {/* View Header */}
      <div className="view-header">
        <div className="view-header-title">
          <h2>Mevcut Analiz Projeleri</h2>
          <p>Kayıtlı ERP ve CRM ön analiz çalışmalarını listeleyin ve yönetin.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            className="btn btn-secondary"
            onClick={() => setIsCreateDemoOpen(true)}
            title="Tamamen kurgusal kesikli üretim pilot projesi oluştur"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
          >
            <Sparkles size={16} style={{ color: "var(--primary)" }} />
            Örnek Üretim Projesi Oluştur
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setIsRestoreOpen(true)}
            title="Dışarıdan bir .erpcrm yedek paketi yükle"
          >
            <Upload size={16} />
            Yedekten Geri Yükle
          </button>
          <button className="btn btn--start" onClick={onNewProject}>
            <Plus size={16} />
            Yeni Analiz
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      {projects.length > 0 && (
        <div className="semantic-filter-bar" style={{ marginBottom: "1rem" }}>
          <div className="semantic-tabs">
            <button
              className={`semantic-tab ${statusFilter === "all" ? "semantic-tab--active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              Tümü ({projects.length})
            </button>
            <button
              className={`semantic-tab ${statusFilter === "active" ? "semantic-tab--active" : ""}`}
              onClick={() => setStatusFilter("active")}
            >
              Aktif Projeler ({activeCount})
            </button>
            <button
              className={`semantic-tab ${statusFilter === "passive" ? "semantic-tab--active" : ""}`}
              onClick={() => setStatusFilter("passive")}
            >
              Pasif Projeler ({passiveCount})
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: "var(--danger-bg)",
            border: "1px solid var(--danger-border)",
            color: "var(--danger-text)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          <p>Analiz verileri yükleniyor...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Layers size={48} />
          </div>
          <h3>Henüz analiz oluşturulmadı.</h3>
          <p>
            Yeni bir ERP / CRM ön analiz projesi başlatabilir veya hazır sentetik üretim pilot projesini tek tıkla yükleyerek inceleyebilirsiniz.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setIsCreateDemoOpen(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
            >
              <Sparkles size={16} style={{ color: "var(--primary)" }} />
              Örnek Üretim Projesi Oluştur
            </button>
            <button className="btn btn-secondary" onClick={() => setIsRestoreOpen(true)}>
              <Upload size={16} />
              Yedekten Geri Yükle
            </button>
            <button className="btn btn--start" onClick={onNewProject}>
              <Plus size={16} />
              Yeni Analiz Başlat
            </button>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="empty-state" style={{ padding: "2rem" }}>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            {statusFilter === "active" ? "Aktif durumda proje bulunmuyor." : "Pasif durumda proje bulunmuyor."}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Firma Adı</th>
                <th>Proje / Analiz Adı</th>
                <th>Durum</th>
                <th>Takvim</th>
                <th>Lokasyon</th>
                <th>Kapsam</th>
                <th>Son Güncelleme</th>
                <th style={{ textAlign: "right" }}>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((proj) => {
                const isPassive = proj.status === "passive";
                return (
                  <tr key={proj.id} style={{ opacity: isPassive ? 0.85 : 1 }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Building2 size={16} style={{ color: "var(--primary)" }} />
                        <strong style={{ color: "var(--text-primary)" }}>{proj.company_name}</strong>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{proj.name}</span>
                    </td>
                    <td>
                      {isPassive ? (
                        <span className="badge badge--secondary">Pasif</span>
                      ) : (
                        <span className="badge badge--success">Aktif</span>
                      )}
                    </td>
                    <td>
                      {(() => {
                        const sched = calculateScheduleStatus({
                          plannedStartDate: proj.planned_start_date,
                          plannedEndDate: proj.planned_end_date,
                          actualStartDate: proj.actual_start_date,
                          actualEndDate: proj.actual_end_date,
                        });
                        const badge = getScheduleStatusBadgeMeta(
                          sched.status,
                          sched.delayDays,
                          sched.remainingDays
                        );
                        return (
                          <div>
                            <span className={`badge ${badge.badgeClass}`} style={{ fontSize: "0.75rem" }}>
                              {badge.label}
                            </span>
                            {proj.planned_start_date && (
                              <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                                {formatDateRangeSummary(proj.planned_start_date, proj.planned_end_date)}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      <span style={{ color: "var(--text-muted)" }}>
                        {proj.city ? proj.city : "—"}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-not-started">
                        {proj.selected_function_count} Fonksiyon
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        <Calendar size={14} />
                        {formatDate(proj.updated_at)}
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.375rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {/* Aktif / Pasif Değiştirme Butonu (Görünür Metin) */}
                        {isPassive ? (
                          <button
                            className="btn btn--start btn--sm"
                            title="Projeyi Aktifleştir"
                            onClick={() => handleActivate(proj.id, proj.name)}
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                          >
                            <Play size={13} />
                            Aktifleştir
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn--sm"
                            title="Projeyi Pasife Al"
                            onClick={() => setDeactivateTarget({ id: proj.id, name: proj.name })}
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                          >
                            <PauseCircle size={13} style={{ color: "var(--warning, #d97706)" }} />
                            Pasife Al
                          </button>
                        )}

                        <button
                          className="btn btn-secondary btn--sm"
                          title="Projeyi Yedekle (.erpcrm)"
                          disabled={exportingProjectId === proj.id}
                          onClick={() => handleExport(proj.id)}
                        >
                          <Download size={14} />
                        </button>
                        <button
                          className="btn btn-secondary btn--sm"
                          title="Projeyi Çoğalt"
                          onClick={() => setDuplicateTarget({ id: proj.id, name: proj.name })}
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          className="btn btn-secondary btn--sm"
                          title="Firma Bilgilerini Düzenle"
                          onClick={() => onEditProject(proj.id)}
                        >
                          <Pencil size={14} />
                          Düzenle
                        </button>
                        <button
                          className="btn btn--continue btn--sm"
                          onClick={() => onOpenProject(proj.id)}
                        >
                          <FolderOpen size={14} />
                          Aç
                        </button>
                        <button
                          className="btn btn-danger-ghost btn--danger btn--sm"
                          title="Analizi Sil"
                          onClick={() => handleDelete(proj.id, proj.name)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {deactivateTarget && (
        <ProjectDeactivateModal
          isOpen={true}
          projectId={deactivateTarget.id}
          projectName={deactivateTarget.name}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={handleDeactivateConfirm}
          isSubmitting={isDeactivating}
        />
      )}

      {/* Create Demo Project Modal */}
      <CreateDemoProjectModal
        isOpen={isCreateDemoOpen}
        onClose={() => setIsCreateDemoOpen(false)}
        onConfirm={handleCreateDemoConfirm}
        isCreating={isCreatingDemo}
      />

      {/* Backup Success Modal */}
      <BackupSuccessModal
        isOpen={!!backupSuccessResult}
        onClose={() => setBackupSuccessResult(null)}
        onRestoreBackup={(filePath) => {
          setBackupSuccessResult(null);
          setRestoreInitialPath(filePath);
          setIsRestoreOpen(true);
        }}
        result={backupSuccessResult}
      />

      {/* Restore Modal */}
      <RestoreProjectModal
        isOpen={isRestoreOpen}
        initialFilePath={restoreInitialPath}
        onClose={() => {
          setIsRestoreOpen(false);
          setRestoreInitialPath(null);
        }}
        onOpenProject={onOpenProject}
        onSuccess={(msg, newId) => {
          showToast("success", msg);
          if (newId) {
            onOpenProject(newId);
          } else {
            loadProjects();
          }
        }}
        onError={(err) => showToast("error", err)}
      />

      {/* Duplicate Modal */}
      {duplicateTarget && (
        <DuplicateProjectModal
          isOpen={true}
          projectId={duplicateTarget.id}
          projectName={duplicateTarget.name}
          onClose={() => setDuplicateTarget(null)}
          onSuccess={(msg, newId) => {
            showToast("success", msg);
            if (newId) {
              onOpenProject(newId);
            } else {
              loadProjects();
            }
          }}
          onError={(err) => showToast("error", err)}
        />
      )}
    </div>
  );
};
