import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  CircleDot,
  AlertCircle,
  Play,
  BookOpen,
  FileText,
} from "lucide-react";
import { getProjectDetail, updateProjectBusinessFunction } from "../db/client";
import { SaveStatusIndicator } from "../components/SaveStatusIndicator";
import { SemanticSummarySection } from "../components/SemanticSummarySection";
import { QuestionScreen } from "../views/QuestionScreen";
import { ReportPreviewView } from "../views/ReportPreviewView";
import { loadQuestionPack, getPackIdForFunction, hasQuestionPack } from "../engine/loader";
import type { QuestionPack } from "../engine/types";
import type { FunctionStatus, ProjectDetailData } from "../types";

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  projectId,
  onBack,
}) => {
  const [data, setData] = useState<ProjectDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | "idle">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

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

  // Handle inline updates
  const handleFunctionFieldChange = async (
    funcId: string,
    field: "company_department_name" | "responsible_person" | "status",
    value: string
  ) => {
    if (!data) return;

    // Optimistic UI update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        functions: prev.functions.map((fn) =>
          fn.id === funcId ? { ...fn, [field]: value } : fn
        ),
      };
    });

    try {
      setSaveStatus("saving");
      await updateProjectBusinessFunction(funcId, {
        [field]: value,
      });
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    } catch (err: any) {
      console.error("Güncelleme hatası:", err);
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
  const completedCount = functions.filter((f) => f.status === "completed").length;
  const inProgressCount = functions.filter((f) => f.status === "in_progress").length;
  const notStartedCount = functions.filter((f) => f.status === "not_started").length;

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

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            className="btn btn-report-primary btn--report btn--sm"
            onClick={() => setIsViewingReport(true)}
            title="Raporu hazırla ve incele"
          >
            <FileText size={15} /> Rapor Önizleme
          </button>
          <SaveStatusIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
          <span className="badge badge-completed">
            {project.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Company Profile Card */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Building2 size={18} style={{ color: "var(--primary)" }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Firma Profili & Künye</h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            <Calendar size={14} />
            Oluşturulma: {formatDate(project.created_at)}
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

      {/* Scope & Selected Business Functions */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Analiz Kapsamındaki İş Fonksiyonları</h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              Toplam {functions.length} iş fonksiyonu seçilmiştir. Departman eşleştirmelerini ve sorumlu kişileri güncelleyebilirsiniz.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
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
                <th style={{ width: "22%" }}>Standart İş Fonksiyonu</th>
                <th style={{ width: "18%" }}>Kategori</th>
                <th style={{ width: "22%" }}>Firma İçi Departman Adı</th>
                <th style={{ width: "18%" }}>Sorumlu / Görüşülen Kişi</th>
                <th style={{ width: "8%" }}>Durum</th>
                <th style={{ width: "12%" }}>Analiz</th>
              </tr>
            </thead>
            <tbody>
              {functions.map((fn) => (
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
                      style={{ padding: "0.375rem 0.5rem", fontSize: "0.8125rem", width: "auto" }}
                      value={fn.status}
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
                        className={`btn ${fn.status === "not_started" ? "btn--start" : "btn--continue"} btn--sm`}
                        disabled={packLoadingCode === fn.code}
                        onClick={() => handleStartAnalysis(fn.code, fn.name_tr)}
                        title={fn.status === "not_started" ? "Analizi Başlat" : "Analize Devam Et"}
                      >
                        {packLoadingCode === fn.code ? (
                          <span className="btn__spinner" />
                        ) : fn.status === "not_started" ? (
                          <><Play size={13} /> Başlat</>
                        ) : (
                          <><BookOpen size={13} /> Devam</>
                        )}
                      </button>
                    ) : (
                      <span
                        className="badge badge--neutral"
                        title="Bu iş fonksiyonunun soru paketi hazırlanma aşamasındadır"
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          background: "var(--color-neutral-100)",
                          color: "var(--color-neutral-500)",
                          border: "1px solid var(--color-neutral-200)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          cursor: "default",
                        }}
                      >
                        Hazırlanıyor
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAZ-3: Semantic Analysis Layer (Findings, Requirements, Risks, Notes) */}
        <SemanticSummarySection projectId={projectId} />
      </div>
    </div>
  );
};
