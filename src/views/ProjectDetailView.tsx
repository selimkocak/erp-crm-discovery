import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Users,
  Briefcase,
  GitBranch,
  CheckCircle2,
  Clock,
  CircleDot,
  AlertCircle,
  Play,
  PauseCircle,
  BookOpen,
  FileText,
  Pencil,
  Shield,
  Download,
  Upload,
  Copy,
  Trash2,
  Info,
  Layers,
  X as XIcon,
} from "lucide-react";
import { getProjectDetail, updateProjectBusinessFunction, deleteProject, updateProjectStatus } from "../db/client";
import { SaveStatusIndicator } from "../components/SaveStatusIndicator";
import { SemanticSummarySection } from "../components/SemanticSummarySection";
import { QuestionScreen } from "../views/QuestionScreen";
import { ReportPreviewView } from "../views/ReportPreviewView";
import { GovernanceDashboardView } from "../views/GovernanceDashboardView";
import { loadQuestionPack, getPackIdForFunction, hasQuestionPack } from "../engine/loader";
import { saveProjectBackupToFile, type SaveBackupResult } from "../storage/backupManager";
import {
  RestoreProjectModal,
  DuplicateProjectModal,
  BackupSuccessModal,
} from "../components/ProjectBackupModals";
import { ProjectScopeModal } from "../components/modals/ProjectScopeModal";
import { ProjectDeactivateModal } from "../components/modals/ProjectDeactivateModal";
import type { QuestionPack } from "../engine/types";
import type { FunctionStatus, ProjectDetailData } from "../types";


interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
  onEditProject?: (projectId: string) => void;
  onOpenProject?: (projectId: string) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  projectId,
  onBack,
  onEditProject,
  onOpenProject,
}) => {
  const [data, setData] = useState<ProjectDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | "idle">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"process" | "governance">("process");

  // Backup & Operations state
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [restoreInitialPath, setRestoreInitialPath] = useState<string | null>(null);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [backupSuccessResult, setBackupSuccessResult] = useState<SaveBackupResult | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "info" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4000);
  };

  // Question Engine state
  const [activeBfCode, setActiveBfCode] = useState<string | null>(null);
  const [activeBfName, setActiveBfName] = useState<string>("");
  const [activePack, setActivePack] = useState<QuestionPack | null>(null);
  const [packLoadingCode, setPackLoadingCode] = useState<string | null>(null);
  const [packError, setPackError] = useState<string | null>(null);
  const [isViewingReport, setIsViewingReport] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const detail = await getProjectDetail(projectId);
      if (!detail) {
        setError("Analiz projesi bulunamadı.");
      } else {
        setData(detail);
      }
    } catch (err: any) {
      console.error("Proje detayı yüklenirken hata:", err);
      setError(err?.message || "Proje verisi yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAnalysis = async (bfCode: string, bfNameTr: string) => {
    if (data?.project?.status === "passive") {
      showToast("info", "Bu proje pasiftir. Analiz yapmak için lütfen önce projeyi aktifleştirin.");
      return;
    }
    if (!hasQuestionPack(bfCode)) {
      setPackError(`"${bfNameTr}" için soru paketi henüz geliştirme aşamasındadır.`);
      return;
    }
    const packId = getPackIdForFunction(bfCode)!;
    setPackLoadingCode(bfCode);
    setPackError(null);
    try {
      const result = await loadQuestionPack(packId);
      if (!result.ok) {
        setPackError(result.error);
        return;
      }
      setActivePack(result.pack);
      setActiveBfCode(bfCode);
      setActiveBfName(bfNameTr);
    } catch (err: any) {
      console.error(`Soru paketi yükleme hatası [${bfCode}]:`, err);
      setPackError(`Soru paketi yüklenirken bir sorun oluştu.`);
    } finally {
      setPackLoadingCode(null);
    }
  };

  const handleCloseQuestionScreen = () => {
    setActiveBfCode(null);
    setActivePack(null);
    loadData(); // status'ları yenile
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleFunctionFieldChange = async (
    pbfId: string,
    field: "company_department_name" | "responsible_person" | "status",
    value: string
  ) => {
    if (data?.project?.status === "passive") {
      showToast("info", "Bu proje pasiftir. Değişiklik yapmak için lütfen önce projeyi aktifleştirin.");
      return;
    }
    setSaveStatus("saving");
    try {
      await updateProjectBusinessFunction(pbfId, { [field]: value });
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      // Local state'i güncelle
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          functions: prev.functions.map((fn) =>
            fn.id === pbfId ? { ...fn, [field]: value } : fn
          ),
        };
      });
    } catch (err) {
      console.error("Fonksiyon güncellenirken hata:", err);
      setSaveStatus("error");
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

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const res = await saveProjectBackupToFile(projectId);
      if (!res.cancelled) {
        setBackupSuccessResult(res);
      }
    } catch (err: any) {
      showToast("error", `Yedekleme başarısız: ${err?.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (
      window.confirm(
        `"${data?.project?.name || "Bu"}" analiz projesini ve bağlı tüm verilerini kalıcı olarak silmek istediğinize emin misiniz?`
      )
    ) {
      try {
        await deleteProject(projectId);
        onBack();
      } catch (err: any) {
        showToast("error", `Silme başarısız: ${err?.message || err}`);
      }
    }
  };

  const handleDeactivateConfirm = async (_reason?: string) => {
    if (!data) return;
    try {
      setIsUpdatingStatus(true);
      await updateProjectStatus(projectId, "passive");
      showToast("success", `"${data.project.name}" projesi pasife alındı.`);
      setIsDeactivateModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error("Proje pasife alınırken hata:", err);
      showToast("error", "Proje pasife alınamadı: " + (err?.message || err));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleActivateProject = async () => {
    if (!data) return;
    try {
      setIsUpdatingStatus(true);
      await updateProjectStatus(projectId, "active");
      showToast("success", `"${data.project.name}" projesi aktifleştirildi.`);
      await loadData();
    } catch (err: any) {
      console.error("Proje aktifleştirilirken hata:", err);
      showToast("error", "Proje aktifleştirilemedi: " + (err?.message || err));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
        <p>Analiz detayları yükleniyor...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
        <AlertCircle size={40} style={{ color: "var(--danger)", margin: "0 auto 1rem" }} />
        <h3>Hata Oluştu</h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>{error || "Kayıt bulunamadı."}</p>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  const { project, company, functions } = data;
  const isPassive = project.status === "passive";
  const activeFunctions = functions.filter((f) => f.is_active === 1 || f.is_active === undefined);
  const completedCount = activeFunctions.filter((f) => f.status === "completed").length;
  const inProgressCount = activeFunctions.filter((f) => f.status === "in_progress").length;
  const notStartedCount = activeFunctions.filter((f) => f.status === "not_started").length;

  // ReportPreviewView modu
  if (isViewingReport) {
    return (
      <ReportPreviewView
        projectId={projectId}
        onBack={() => {
          setIsViewingReport(false);
          loadData();
        }}
      />
    );
  }

  // QuestionScreen modu
  if (activeBfCode && activePack) {
    return (
      <QuestionScreen
        projectId={projectId}
        bfCode={activeBfCode}
        bfNameTr={activeBfName}
        pack={activePack}
        onBack={handleCloseQuestionScreen}
        onOpenReport={() => {
          handleCloseQuestionScreen();
          setIsViewingReport(true);
        }}
      />
    );
  }

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

      {/* Top Header */}
      <div className="view-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button className="btn btn-secondary btn--back" onClick={onBack}>
            <ArrowLeft size={16} />
            Geri
          </button>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{project.name}</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
              {company.company_name} {company.trade_name ? `(${company.trade_name})` : ""}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            className="btn btn-report-primary btn--report btn--sm"
            onClick={() => setIsViewingReport(true)}
            title="Raporu hazırla ve incele"
          >
            <FileText size={15} /> Rapor Önizleme
          </button>

          <button
            className="btn btn-secondary btn--sm"
            onClick={handleExportBackup}
            disabled={isExporting}
            title="Projeyi .erpcrm arşiv paketi olarak dışa aktar"
          >
            <Download size={14} />
            {isExporting ? "Yedekleniyor..." : "Yedekle"}
          </button>

          <button
            className="btn btn-secondary btn--sm"
            onClick={() => setIsDuplicateOpen(true)}
            title="Bu projeden yeni bir çalışma kopyası üret"
          >
            <Copy size={14} />
            Çoğalt
          </button>

          <button
            className="btn btn-secondary btn--sm"
            onClick={() => setIsRestoreOpen(true)}
            title="Dışarıdan bir .erpcrm yedek paketi yükle"
          >
            <Upload size={14} />
            Geri Yükle
          </button>

          {/* Durum Değiştirme Butonu (Rozetin yanına ayrı buton) */}
          {isPassive ? (
            <button
              type="button"
              className="btn btn--start btn--sm"
              onClick={handleActivateProject}
              disabled={isUpdatingStatus}
              title="Projeyi Aktifleştir"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
            >
              <Play size={13} />
              Projeyi Aktifleştir
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn--sm"
              onClick={() => setIsDeactivateModalOpen(true)}
              disabled={isUpdatingStatus}
              title="Projeyi Pasife Al"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
            >
              <PauseCircle size={13} style={{ color: "var(--warning, #d97706)" }} />
              Projeyi Pasife Al
            </button>
          )}

          <button
            className="btn btn-secondary btn--sm"
            style={{ color: "var(--danger)" }}
            onClick={handleDeleteProject}
            title="Projeyi ve tüm verilerini kalıcı olarak sil"
          >
            <Trash2 size={14} />
            Sil
          </button>

          <SaveStatusIndicator status={saveStatus} lastSavedAt={lastSavedAt} />

          {/* Tıklanamaz Durum Rozeti */}
          <span
            className={`badge ${isPassive ? "badge--secondary" : "badge-completed"}`}
            style={{ cursor: "default", userSelect: "none" }}
          >
            {isPassive ? "PASİF" : "AKTİF"}
          </span>
        </div>
      </div>

      {/* Passive Project Warning Banner */}
      {isPassive && (
        <div
          style={{
            backgroundColor: "var(--bg-surface-subtle, #f8fafc)",
            border: "1px solid var(--border-color, #cbd5e1)",
            borderRadius: "var(--radius-md, 6px)",
            padding: "0.875rem 1.25rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Clock size={20} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <div>
              <strong style={{ display: "block", fontSize: "0.95rem" }}>
                Bu proje pasiftir. Verileri korunmaktadır. Çalışmaya devam etmek için projeyi aktifleştirin.
              </strong>
            </div>
          </div>
          <button
            type="button"
            className="btn btn--start btn--sm"
            onClick={handleActivateProject}
            disabled={isUpdatingStatus}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
          >
            <Play size={13} />
            Projeyi Aktifleştir
          </button>
        </div>
      )}

      {/* Modals */}
      <ProjectDeactivateModal
        isOpen={isDeactivateModalOpen}
        projectId={projectId}
        projectName={project.name}
        onClose={() => setIsDeactivateModalOpen(false)}
        onConfirm={handleDeactivateConfirm}
        isSubmitting={isUpdatingStatus}
      />

      <ProjectScopeModal
        isOpen={isScopeModalOpen}
        projectId={projectId}
        projectName={project.name}
        onClose={() => setIsScopeModalOpen(false)}
        onScopeUpdated={() => loadData()}
        isProjectPassive={isPassive}
      />

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
          if (newId && onOpenProject) {
            onOpenProject(newId);
          } else {
            loadData();
          }
        }}
        onError={(err) => showToast("error", err)}
      />

      <DuplicateProjectModal
        isOpen={isDuplicateOpen}
        projectId={projectId}
        projectName={project.name}
        onClose={() => setIsDuplicateOpen(false)}
        onSuccess={(msg, newId) => {
          showToast("success", msg);
          if (newId && onOpenProject) {
            onOpenProject(newId);
          } else {
            loadData();
          }
        }}
        onError={(err) => showToast("error", err)}
      />

      {/* Company Profile Card */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Building2 size={18} style={{ color: "var(--primary)" }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Firma Profili & Künye</h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {onEditProject && (
              <button
                className="btn btn-secondary btn--sm"
                title="Firma Bilgilerini Düzenle"
                onClick={() => onEditProject(projectId)}
              >
                <Pencil size={13} />
                Düzenle
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
              <Calendar size={14} />
              Oluşturulma: {formatDate(project.created_at)}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            fontSize: "0.875rem",
          }}
        >
          <div>
            <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem", fontWeight: 600 }}>
              FİRMA ADI
            </span>
            <strong style={{ color: "var(--text-primary)" }}>{company.company_name}</strong>
          </div>

          {company.trade_name && (
            <div>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem", fontWeight: 600 }}>
                TİCARİ UNVAN
              </span>
              <span>{company.trade_name}</span>
            </div>
          )}

          {company.tax_number && (
            <div>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem", fontWeight: 600 }}>
                VERGİ NO
              </span>
              <span>{company.tax_number}</span>
            </div>
          )}

          <div>
            <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem", fontWeight: 600 }}>
              LOKASYON
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <MapPin size={14} style={{ color: "var(--text-muted)" }} />
              <span>{company.city ? `${company.city}, ` : ""}{company.country}</span>
            </div>
          </div>

          {company.employee_count && (
            <div>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem", fontWeight: 600 }}>
                ÇALIŞAN SAYISI
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Users size={14} style={{ color: "var(--text-muted)" }} />
                <span>{company.employee_count}</span>
              </div>
            </div>
          )}

          {company.business_sector && (
            <div>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem", fontWeight: 600 }}>
                SEKTÖR / FAALİYET
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Briefcase size={14} style={{ color: "var(--text-muted)" }} />
                <span>{company.business_sector}</span>
              </div>
            </div>
          )}

          {company.has_branches && (
            <div>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem", fontWeight: 600 }}>
                ŞUBELİ YAPI
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <GitBranch size={14} style={{ color: "var(--text-muted)" }} />
                <span>
                  {company.has_branches === "yes"
                    ? (company.branch_count ? `Evet (${company.branch_count} Şube / Lokasyon)` : "Evet (Çok Lokasyonlu)")
                    : "Hayır (Tek Lokasyon)"}
                </span>
              </div>
            </div>
          )}
        </div>

        {company.notes && (
          <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)" }}>
            <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              NOTLAR / ÖN BİLGİ
            </span>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
              {company.notes}
            </p>
          </div>
        )}
      </div>

      {/* View Mode Tabs (Süreç Analizi & Veri/Yetki Yönetişimi) */}
      <div className="project-view-mode-tabs" style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button
          type="button"
          className={`btn ${viewMode === "process" ? "btn-primary" : "btn-secondary"}`}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", fontWeight: 600 }}
          onClick={() => setViewMode("process")}
        >
          <FileText size={16} />
          <span>Süreç Analizi ({activeFunctions.length} Fonksiyon)</span>
        </button>
        <button
          type="button"
          className={`btn ${viewMode === "governance" ? "btn-primary" : "btn-secondary"}`}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", fontWeight: 600 }}
          onClick={() => setViewMode("governance")}
        >
          <Shield size={16} />
          <span>Veri ve Yetki Yönetişimi</span>
        </button>
      </div>

      {viewMode === "process" ? (
        /* Scope & Selected Business Functions */
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Analiz Kapsamındaki İş Fonksiyonları</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                Toplam {activeFunctions.length} iş fonksiyonu seçilmiştir. Departman eşleştirmelerini ve sorumlu kişileri güncelleyebilirsiniz.
              </p>
            </div>

            {/* Actions & Quick Stats Badges */}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-secondary btn--sm"
                onClick={() => {
                  if (isPassive) {
                    showToast("info", "Bu proje pasiftir. Kapsamı düzenlemek için lütfen önce projeyi aktifleştirin.");
                    return;
                  }
                  setIsScopeModalOpen(true);
                }}
                disabled={isPassive}
                title={isPassive ? "Pasif projede kapsam düzenlenemez" : "İş fonksiyonlarını ekle veya kapsam dışına al"}
              >
                <Layers size={14} />
                <span>Kapsamı Düzenle</span>
              </button>
              <span className="badge badge-not-started">
                <CircleDot size={12} /> {notStartedCount} Başlanmadı
              </span>
              <span className="badge badge-in-progress">
                <Clock size={12} /> {inProgressCount} Devam Ediyor
              </span>
              <span className="badge badge-completed">
                <CheckCircle2 size={12} /> {completedCount} Tamamlandı
              </span>
            </div>
          </div>

          <div className="table-container">
            {packError && (
              <div className="pack-error-banner">
                <AlertCircle size={16} />
                {packError}
              </div>
            )}
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ minWidth: "220px", width: "24%" }}>Standart İş Fonksiyonu</th>
                  <th style={{ minWidth: "130px", width: "14%" }}>Kategori</th>
                  <th style={{ minWidth: "190px", width: "22%" }}>Firma İçi Departman Adı</th>
                  <th style={{ minWidth: "180px", width: "19%" }}>Sorumlu / Görüşülen Kişi</th>
                  <th style={{ minWidth: "145px", width: "12%" }}>Durum</th>
                  <th style={{ minWidth: "115px", width: "9%" }}>Analiz</th>
                </tr>
              </thead>
              <tbody>
                {activeFunctions.map((fn) => (
                  <tr key={fn.id}>
                    <td>
                      <div>
                        <strong style={{ color: "var(--text-primary)", display: "block" }}>
                          {fn.name_tr}
                        </strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {fn.code} • {fn.name_en}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                        {fn.category}
                      </span>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        style={{ padding: "0.375rem 0.625rem", fontSize: "0.8125rem" }}
                        placeholder="Örn: Fabrika Müdürlüğü"
                        disabled={isPassive}
                        defaultValue={fn.company_department_name || ""}
                        onBlur={(e) =>
                          handleFunctionFieldChange(
                            fn.id,
                            "company_department_name",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        style={{ padding: "0.375rem 0.625rem", fontSize: "0.8125rem" }}
                        placeholder="Örn: Ahmet Yılmaz (Müdür)"
                        disabled={isPassive}
                        defaultValue={fn.responsible_person || ""}
                        onBlur={(e) =>
                          handleFunctionFieldChange(
                            fn.id,
                            "responsible_person",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <select
                        className="form-control"
                        style={{ minWidth: "135px", padding: "0.375rem 0.5rem", fontSize: "0.8125rem", cursor: isPassive ? "not-allowed" : "pointer" }}
                        value={fn.status}
                        disabled={isPassive}
                        onChange={(e) =>
                          handleFunctionFieldChange(
                            fn.id,
                            "status",
                            e.target.value as FunctionStatus
                          )
                        }
                      >
                        <option value="not_started">Başlanmadı</option>
                        <option value="in_progress">Devam Ediyor</option>
                        <option value="completed">Tamamlandı</option>
                      </select>
                    </td>
                    <td>
                      {hasQuestionPack(fn.code) ? (
                        <button
                          className={`btn ${
                            fn.status === "completed"
                              ? "btn--secondary"
                              : fn.status === "in_progress"
                              ? "btn--continue"
                              : "btn--start"
                          } btn--sm`}
                          onClick={() => handleStartAnalysis(fn.code, fn.name_tr)}
                          disabled={packLoadingCode === fn.code || isPassive}
                          title={isPassive ? "Pasif projede analiz başlatılamaz" : undefined}
                          style={{
                            minWidth: "105px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.35rem",
                            fontWeight: 600,
                          }}
                        >
                          {packLoadingCode === fn.code ? (
                            "Yükleniyor..."
                          ) : fn.status === "completed" ? (
                            <>
                              <BookOpen size={13} /> İncele
                            </>
                          ) : fn.status === "in_progress" ? (
                            <>
                              <Clock size={13} /> Devam Et
                            </>
                          ) : (
                            <>
                              <Play size={13} /> Analize Başla
                            </>
                          )}
                        </button>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            fontStyle: "italic",
                          }}
                        >
                          Geliştiriliyor
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Governance Dashboard View Mode */
        <GovernanceDashboardView
          projectId={projectId}
          isProjectPassive={isPassive}
        />
      )}

      {/* Semantic Summary Section (Bulgular, Gereksinimler, Riskler, Notlar) */}
      <SemanticSummarySection projectId={projectId} />
    </div>
  );
};
