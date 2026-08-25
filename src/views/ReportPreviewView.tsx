/**
 * ERP CRM Discovery — ReportPreviewView
 *
 * Profesyonel ERP / CRM Ön Analiz Raporu Önizleme Ekranı.
 * UI bileşeni yalnız ReportModel tüketir; raw SQL veya JSON ayrıştırması yapmaz.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  Edit3,
  Layers,
  Search,
  CheckSquare,
  StickyNote,
  AlertCircle,
  Eye,
  EyeOff,
  Briefcase,
  FileDown,
  Download,
  CheckCircle2,
  Paperclip,
  ExternalLink,
  X,
  FolderOpen,
} from "lucide-react";


import { buildReportModel } from "../report/builder";
import type { ReportModel, ReportAttachmentItem } from "../report/types";
import { ReportProfileModal } from "../components/ReportProfileModal";
import { exportReport } from "../export";
import { openAttachment, showAttachmentInFolder } from "../storage/attachmentLinks";
import {
  readAttachmentFile,
  getFileCategory,
  MANAGED_VAULT_APP_NAME,
} from "../storage/attachmentManager";

interface ReportPreviewViewProps {
  projectId: string;
  onBack: () => void;
}

export const ReportPreviewView: React.FC<ReportPreviewViewProps> = ({
  projectId,
  onBack,
}) => {
  const [report, setReport] = useState<ReportModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [includeUnanswered, setIncludeUnanswered] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportStatusMsg, setExportStatusMsg] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Attachment Lightbox & Error State
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string; size: string; att: ReportAttachmentItem } | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const handleOpenAttachment = async (att: ReportAttachmentItem) => {
    setAttachmentError(null);
    const category = getFileCategory(att.fileExtension);
    if (category === "image") {
      try {
        const buffer = await readAttachmentFile(att.relativePath);
        if (!buffer || buffer.byteLength === 0) {
          setAttachmentError(`Dosya bulunamadı: "${att.originalFileName}". Dosya yerel depolamadan silinmiş olabilir.`);
          return;
        }
        const blob = new Blob([buffer as unknown as BlobPart], { type: att.mimeType || "image/png" });
        const url = URL.createObjectURL(blob);
        const sizeStr = att.fileSize < 1024 * 1024
          ? `${(att.fileSize / 1024).toFixed(1)} KB`
          : `${(att.fileSize / (1024 * 1024)).toFixed(1)} MB`;
        setPreviewImage({ url, name: att.originalFileName, size: sizeStr, att });
        return;
      } catch (err: any) {
        console.warn("Görsel önizleme açılamadı, doğrudan açıcı deneniyor:", err);
      }
    }

    const res = await openAttachment(att);
    if (!res.success && res.error) {
      setAttachmentError(res.error);
    }
  };

  const handleShowInFolder = async (att: ReportAttachmentItem) => {
    setAttachmentError(null);
    const res = await showAttachmentInFolder(att.relativePath);
    if (!res.success && res.error) {
      setAttachmentError(res.error);
    }
  };

  const loadReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await buildReportModel(projectId, { includeUnanswered });
      setReport(data);
    } catch (err) {
      console.error("Rapor oluşturulamadı:", err);
      setError(err instanceof Error ? err.message : "Rapor oluşturulurken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, includeUnanswered]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "critical":
        return <span className="badge badge--danger">Kritik</span>;
      case "high":
        return <span className="badge badge--warning">Yüksek</span>;
      case "medium":
        return <span className="badge badge--info">Orta</span>;
      case "low":
        return <span className="badge badge--secondary">Düşük</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="badge badge--success">Aktif</span>;
      case "passive":
      case "inactive":
        return <span className="badge badge--secondary">Pasif</span>;
      case "completed":
        return <span className="badge badge-completed">Tamamlandı</span>;
      case "in_progress":
        return <span className="badge badge-in-progress">Devam Ediyor</span>;
      case "not_started":
        return <span className="badge badge-not-started">Başlanmadı</span>;
      case "confirmed":
        return <span className="badge badge--success">Teyit Edildi</span>;
      case "resolved":
      case "closed":
        return <span className="badge badge--success">Kapatıldı</span>;
      case "mitigated":
        return <span className="badge badge--info">Önlem Alındı</span>;
      case "accepted":
        return <span className="badge badge--warning">Kabul Edildi</span>;
      case "draft":
        return <span className="badge badge--outline-secondary">Taslak</span>;
      default:
        return <span className="badge badge--secondary">{status}</span>;
    }
  };

  if (isLoading && !report) {
    return (
      <div className="report-loading">
        <div className="question-screen__spinner" />
        <p>Ön Analiz Raporu derleniyor...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "3rem", margin: "2rem auto", maxWidth: 600 }}>
        <AlertCircle size={40} style={{ color: "var(--danger)", margin: "0 auto 1rem" }} />
        <h3>Rapor Oluşturulamadı</h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>{error || "Kayıt bulunamadı."}</p>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Analize Dön
        </button>
      </div>
    );
  }

  const handleExport = async (format: "docx" | "pdf") => {
    if (!report) return;
    try {
      setIsExporting(true);
      setExportError(null);
      setExportStatusMsg(
        format === "docx"
          ? "Word belgesi (.docx) hazırlanıyor..."
          : "PDF belgesi (.pdf) hazırlanıyor..."
      );

      const result = await exportReport(report, format);

      if (result.success) {
        setExportStatusMsg(
          `✓ Rapor kaydedildi: ${result.filePath || (format === "docx" ? "Word" : "PDF")}`
        );
        setTimeout(() => setExportStatusMsg(null), 4000);
      } else if (result.cancelled) {
        setExportStatusMsg(null);
      } else if (result.error) {
        setExportError(result.error);
      }
    } catch (err: any) {
      console.error("Export hatası:", err);
      setExportError(err?.message || "Rapor dışa aktarılırken bir hata oluştu.");
    } finally {
      setIsExporting(false);
    }
  };

  const { metadata, profile, company, scope, businessFunctions, projectNotes, summaryStats } = report;

  return (
    <div className="report-preview-container">
      {/* ── Top Floating Action Bar ──────────────────────────────────────── */}
      <header className="report-top-bar">
        <div className="report-top-bar__left">
          <button className="btn btn--secondary btn--sm" onClick={onBack} title="Proje detayına dön">
            <ArrowLeft size={16} /> Analize Dön
          </button>
          <div className="report-top-bar__title-group">
            <h2 className="report-top-bar__title">{metadata.title}</h2>
            <span className="report-top-bar__subtitle">
              {company.companyName} • {metadata.projectName}
            </span>
          </div>
        </div>

        <div className="report-top-bar__right">
          <label className="report-toggle-label" title="Cevaplanmamış soruları raporda göster/gizle">
            <input
              type="checkbox"
              checked={includeUnanswered}
              onChange={(e) => setIncludeUnanswered(e.target.checked)}
            />
            {includeUnanswered ? <Eye size={15} /> : <EyeOff size={15} />}
            <span>Cevaplanmamışları Göster</span>
          </label>

          <button
            className="btn btn--secondary btn--sm"
            onClick={() => setIsProfileModalOpen(true)}
            title="Yönetici özeti ve açık konuları düzenle"
          >
            <Edit3 size={15} /> Notları Düzenle
          </button>

          {/* Export Actions */}
          <button
            className="btn btn--outline btn--sm"
            onClick={() => handleExport("docx")}
            disabled={isExporting}
            title="Raporu Microsoft Word (.docx) olarak kaydet"
          >
            <FileDown size={15} /> Word (.docx)
          </button>

          <button
            className="btn btn--primary btn--sm"
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
            title="Raporu PDF (.pdf) olarak kaydet"
          >
            <Download size={15} /> PDF
          </button>
        </div>
      </header>

      {/* ── Status Toast / Banners ────────────────────────────────────────── */}
      {exportStatusMsg && (
        <div className="report-status-toast">
          <CheckCircle2 size={16} />
          <span>{exportStatusMsg}</span>
        </div>
      )}

      {exportError && (
        <div className="report-error-toast">
          <AlertCircle size={16} />
          <span>{exportError}</span>
          <button className="btn-icon text-xs" onClick={() => setExportError(null)}>×</button>
        </div>
      )}

      {attachmentError && (
        <div className="report-error-toast" style={{ background: "#fef2f2", borderColor: "#f87171", color: "#991b1b" }}>
          <AlertCircle size={16} />
          <span>{attachmentError}</span>
          <button className="btn-icon text-xs" onClick={() => setAttachmentError(null)}>×</button>
        </div>
      )}

      {!profile.executive_summary && (
        <div className="report-warning-banner" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.25rem", background: "var(--warning-light, #fef3c7)", color: "#92400e", borderRadius: "8px", margin: "1rem 1.5rem 0", fontSize: "0.875rem" }}>
          <AlertCircle size={16} />
          <span>Final rapor öncesinde <strong>Yönetici Özeti</strong> henüz girilmedi. İsterseniz "Notları Düzenle" butonundan ekleyebilirsiniz.</span>
        </div>
      )}

      <div className="report-layout">
        {/* ── Table of Contents (TOC Navigation) ────────────────────────── */}
        <aside className="report-toc">
          <div className="report-toc__header">
            <Layers size={16} />
            <span>İçindekiler</span>
          </div>
          <nav className="report-toc__nav">
            <a href="#sec-summary" className="report-toc__link">
              1. Yönetici Özeti & Değerlendirme
            </a>
            <a href="#sec-company" className="report-toc__link">
              2. Firma Profili
            </a>
            <a href="#sec-scope" className="report-toc__link">
              3. Analiz Kapsamı & İlerleme
            </a>
            {report.scheduleSummary && (
              <a href="#sec-schedule" className="report-toc__link">
                3.1 Proje Takvimi & Zaman Planı
              </a>
            )}
            {report.otStationsSummary && report.otStationsSummary.totalStations > 0 && (
              <a href="#sec-ot-stations" className="report-toc__link">
                3.2 Saha İstasyonları & Makine Envanteri
              </a>
            )}
            {report.otMatrixSummary && (
              <a href="#sec-ot-matrix" className="report-toc__link">
                3.3 OT Veri, Alarm & Kalite Matrisi
              </a>
            )}
            <div className="report-toc__group">
              <span className="report-toc__group-title">4. İş Fonksiyonları</span>
              {businessFunctions.map((fn, idx) => (
                <a key={fn.code} href={`#sec-fn-${fn.code}`} className="report-toc__sublink">
                  4.{idx + 1} {fn.nameTr}
                </a>
              ))}
            </div>
            {report.governance && (
              <a href="#sec-governance" className="report-toc__link">
                5. Veri Sahipliği ve Yönetişim
              </a>
            )}
            <a href="#sec-notes" className="report-toc__link">
              {report.governance ? "6. Proje Notları & Açık Konular" : "5. Proje Notları & Açık Konular"}
            </a>
          </nav>

        </aside>

        {/* ── Main Report Document ──────────────────────────────────────── */}
        <main className="report-document">
          {/* ── Document Cover / Header ─────────────────────────────────── */}
          <section className="report-cover">
            <div className={`report-cover__badge ${!metadata.isComplete ? "badge--warning font-bold" : ""}`}>
              {metadata.isComplete ? "ÖN ANALİZ RAPORU (FİNAL)" : metadata.draftLabel.toUpperCase()}
            </div>
            <h1 className="report-cover__title">{metadata.title}</h1>
            <div className="report-cover__project-name">{metadata.projectName}</div>

            <div className="report-cover__meta-grid">
              <div className="report-cover__meta-item">
                <span className="report-cover__meta-label">FİRMA</span>
                <span className="report-cover__meta-value">{company.companyName}</span>
              </div>
              <div className="report-cover__meta-item">
                <span className="report-cover__meta-label">TARİH</span>
                <span className="report-cover__meta-value">{metadata.generatedAt}</span>
              </div>
              <div className="report-cover__meta-item">
                <span className="report-cover__meta-label">DURUM</span>
                <span className="report-cover__meta-value">{getStatusBadge(metadata.projectStatus)}</span>
              </div>
            </div>

            {/* Quick KPI summary */}
            <div className="report-kpi-band">
              <div className="report-kpi-band__item">
                <span className="report-kpi-band__count">{summaryStats.totalFunctions}</span>
                <span className="report-kpi-band__label">İş Fonksiyonu</span>
              </div>
              <div className="report-kpi-band__divider" />
              <div className="report-kpi-band__item">
                <span className="report-kpi-band__count">{summaryStats.totalFindings}</span>
                <span className="report-kpi-band__label">Bulgu</span>
              </div>
              <div className="report-kpi-band__divider" />
              <div className="report-kpi-band__item">
                <span className="report-kpi-band__count">{summaryStats.totalRequirements}</span>
                <span className="report-kpi-band__label">Gereksinim</span>
              </div>
              <div className="report-kpi-band__divider" />
              <div className="report-kpi-band__item">
                <span className="report-kpi-band__count text-danger">{summaryStats.openRisks}</span>
                <span className="report-kpi-band__label">Açık Risk</span>
              </div>
              <div className="report-kpi-band__divider" />
              <div className="report-kpi-band__item">
                <span className="report-kpi-band__count">
                  {summaryStats.answeredQuestions} / {summaryStats.totalQuestions}
                </span>
                <span className="report-kpi-band__label">Cevaplanan Soru</span>
              </div>
            </div>
          </section>

          {/* ── Bölüm 1: Yönetici Özeti ─────────────────────────────────── */}
          <section id="sec-summary" className="report-section">
            <div className="report-section__header">
              <span className="report-section__num">BÖLÜM 1</span>
              <h2 className="report-section__title">Yönetici Özeti & Stratejik Değerlendirme</h2>
            </div>

            <div className="report-summary-box">
              <h3 className="report-summary-box__title">Yönetici Özeti</h3>
              {profile.executive_summary ? (
                <p className="report-text-block">{profile.executive_summary}</p>
              ) : (
                <div className="report-empty-prompt">
                  <span>Yönetici özeti henüz girilmedi.</span>
                  <button className="btn btn--outline btn--xs" onClick={() => setIsProfileModalOpen(true)}>
                    <Edit3 size={13} /> Özeti Ekle
                  </button>
                </div>
              )}
            </div>

            {profile.overall_assessment && (
              <div className="report-summary-box" style={{ marginTop: "1rem" }}>
                <h3 className="report-summary-box__title">Genel Değerlendirme & Dönüşüm Önerisi</h3>
                <p className="report-text-block">{profile.overall_assessment}</p>
              </div>
            )}
          </section>

          {/* ── Bölüm 2: Firma Profili ─────────────────────────────────── */}
          <section id="sec-company" className="report-section">
            <div className="report-section__header">
              <span className="report-section__num">BÖLÜM 2</span>
              <h2 className="report-section__title">Firma Profili & Künye</h2>
            </div>

            <div className="report-table-card">
              <table className="report-table">
                <tbody>
                  <tr>
                    <td className="report-table__label">Firma Adı:</td>
                    <td className="report-table__value font-bold">{company.companyName}</td>
                  </tr>
                  {company.tradeName && (
                    <tr>
                      <td className="report-table__label">Ticari Unvan:</td>
                      <td className="report-table__value">{company.tradeName}</td>
                    </tr>
                  )}
                  {company.city && (
                    <tr>
                      <td className="report-table__label">Şehir / Ülke:</td>
                      <td className="report-table__value">
                        {company.city}, {company.country}
                      </td>
                    </tr>
                  )}
                  {company.employeeCount && (
                    <tr>
                      <td className="report-table__label">Çalışan Sayısı:</td>
                      <td className="report-table__value">{company.employeeCount}</td>
                    </tr>
                  )}
                  {company.businessSector && (
                    <tr>
                      <td className="report-table__label">Sektör / Faaliyet:</td>
                      <td className="report-table__value">{company.businessSector}</td>
                    </tr>
                  )}
                  {company.hasBranches && (
                    <tr>
                      <td className="report-table__label">Şubeli / Çok Lokasyonlu Yapı:</td>
                      <td className="report-table__value">
                        {company.hasBranches === "yes"
                          ? (company.branchCount ? `Evet (${company.branchCount} Şube / Lokasyon)` : "Evet (Çok Lokasyonlu)")
                          : "Hayır (Tek Lokasyon)"}
                      </td>
                    </tr>
                  )}
                  {company.taxNumber && (
                    <tr>
                      <td className="report-table__label">Vergi Numarası:</td>
                      <td className="report-table__value">{company.taxNumber}</td>
                    </tr>
                  )}
                  {company.notes && (
                    <tr>
                      <td className="report-table__label">Firma Notları:</td>
                      <td className="report-table__value text-muted">{company.notes}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Bölüm 3: Analiz Kapsamı ─────────────────────────────────── */}
          <section id="sec-scope" className="report-section">
            <div className="report-section__header">
              <span className="report-section__num">BÖLÜM 3</span>
              <h2 className="report-section__title">Analiz Kapsamı & Süreç İlerlemesi</h2>
            </div>

            <div className="report-table-card">
              <table className="report-table report-table--striped">
                <thead>
                  <tr>
                    <th style={{ width: "26%" }}>İş Fonksiyonu</th>
                    <th style={{ width: "16%" }}>Kategori</th>
                    <th style={{ width: "22%" }}>Firma Departmanı</th>
                    <th style={{ width: "18%" }}>Sorumlu</th>
                    <th style={{ width: "18%" }}>Durum & İlerleme</th>
                  </tr>
                </thead>
                <tbody>
                  {scope.map((s) => (
                    <tr key={s.code}>
                      <td>
                        <div className="font-bold">{s.nameTr}</div>
                        <span className="text-muted text-xs">{s.code}</span>
                      </td>
                      <td>{s.category}</td>
                      <td>{s.departmentName || "—"}</td>
                      <td>{s.responsiblePerson || "—"}</td>
                      <td>
                        <div className="report-scope-progress">
                          {getStatusBadge(s.status)}
                          {s.hasPack && (
                            <span className="text-xs text-muted" style={{ marginLeft: "0.5rem" }}>
                              %{s.progressPercentage} ({s.answeredCount}/{s.totalQuestionCount})
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Bölüm 3.1: Proje Takvimi & Zaman Planı (FAZ-59) ───────── */}
          {report.scheduleSummary && (
            <section id="sec-schedule" className="report-section">
              <div className="report-section__header">
                <span className="report-section__num">BÖLÜM 3.1</span>
                <h2 className="report-section__title">Proje Takvimi & İş Fonksiyonu Zaman Planı</h2>
              </div>

              {/* Project Schedule Overview Card */}
              <div className="report-summary-box" style={{ marginBottom: "1.25rem" }}>
                <h3 className="report-summary-box__title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Genel Proje Takvimi</span>
                  <span className={`badge ${report.scheduleSummary.projectSchedule.scheduleStatusBadgeClass || "badge-completed"}`}>
                    {report.scheduleSummary.projectSchedule.scheduleStatusLabel}
                  </span>
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "0.75rem" }}>
                  <div>
                    <span className="text-xs text-muted font-bold" style={{ display: "block" }}>PLANLANAN TARİH ARALIĞI</span>
                    <span style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{report.scheduleSummary.projectSchedule.plannedRangeSummary}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted font-bold" style={{ display: "block" }}>GERÇEKLEŞEN TARİH ARALIĞI</span>
                    <span style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{report.scheduleSummary.projectSchedule.actualRangeSummary}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted font-bold" style={{ display: "block" }}>DURUM & SAPMA</span>
                    <span style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{report.scheduleSummary.projectSchedule.delaySummary}</span>
                  </div>
                </div>
              </div>

              {/* Function Schedule Table */}
              <div className="report-table-card">
                <table className="report-table report-table--striped">
                  <thead>
                    <tr>
                      <th style={{ width: "26%" }}>İş Fonksiyonu</th>
                      <th style={{ width: "16%" }}>Süreç Durumu</th>
                      <th style={{ width: "20%" }}>Planlanan Tarih</th>
                      <th style={{ width: "20%" }}>Gerçekleşen Tarih</th>
                      <th style={{ width: "18%" }}>Takvim Durumu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.scheduleSummary.functionSchedules.map((fs) => (
                      <tr key={fs.code}>
                        <td>
                          <div className="font-bold">{fs.nameTr}</div>
                          <span className="text-muted text-xs">{fs.code}</span>
                        </td>
                        <td>{getStatusBadge(fs.processStatus)}</td>
                        <td>{fs.plannedRangeSummary || "—"}</td>
                        <td>{fs.actualRangeSummary || "—"}</td>
                        <td>
                          <div>
                            <span className={`badge ${fs.scheduleStatusBadgeClass || "badge--neutral"}`}>
                              {fs.scheduleStatusLabel}
                            </span>
                            {fs.delaySummary && fs.delaySummary !== "Planlanmadı" && fs.delaySummary !== "Zamanında tamamlandı" && (
                              <span className="text-xs text-muted" style={{ display: "block", marginTop: "2px" }}>
                                {fs.delaySummary}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── Bölüm 3.2: Saha İstasyonları ve Makine Envanteri (FAZ-62B) ── */}
          {report.otStationsSummary && report.otStationsSummary.totalStations > 0 && (
            <section id="sec-ot-stations" className="report-section">
              <div className="report-section__header">
                <span className="report-section__num">BÖLÜM 3.2</span>
                <h2 className="report-section__title">Saha İstasyonları ve Makine Envanteri (OT/IT)</h2>
              </div>

              {/* OT Stations Overview Box */}
              <div className="report-summary-box" style={{ marginBottom: "1.25rem" }}>
                <h3 className="report-summary-box__title">İstasyon Dağılım Özeti</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginTop: "0.75rem" }}>
                  <div>
                    <span className="text-xs text-muted font-bold" style={{ display: "block" }}>TOPLAM İSTASYON</span>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-primary, #1e3a8a)" }}>
                      {report.otStationsSummary.totalStations} Adet
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted font-bold" style={{ display: "block" }}>AKTİF İSTASYON</span>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "#15803d" }}>
                      {report.otStationsSummary.activeStations} Adet
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted font-bold" style={{ display: "block" }}>ÜRETİM ALANI SAYISI</span>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                      {report.otStationsSummary.areaCount} Alan
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted font-bold" style={{ display: "block" }}>ÜRETİM HATTI SAYISI</span>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                      {report.otStationsSummary.lineCount} Hat
                    </span>
                  </div>
                </div>
              </div>

              {/* Stations Table */}
              <div className="report-table-card">
                <table className="report-table report-table--striped">
                  <thead>
                    <tr>
                      <th style={{ width: "16%" }}>İstasyon Kodu</th>
                      <th style={{ width: "22%" }}>İstasyon Adı</th>
                      <th style={{ width: "18%" }}>Alan / Hat</th>
                      <th style={{ width: "24%" }}>Makine & Model</th>
                      <th style={{ width: "12%" }}>PLC / Kontrolcü</th>
                      <th style={{ width: "8%" }}>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.otStationsSummary.stations.map((st) => (
                      <tr key={st.id}>
                        <td>
                          <span className="font-bold text-mono" style={{ color: "var(--color-primary, #1e3a8a)" }}>
                            {st.stationCode}
                          </span>
                        </td>
                        <td>
                          <div className="font-bold">{st.stationName}</div>
                          {st.stationType && <span className="text-xs text-muted">{st.stationType}</span>}
                        </td>
                        <td>
                          <div style={{ fontSize: "0.875rem" }}>{st.areaName || "—"}</div>
                          {st.lineName && <span className="text-xs text-muted">{st.lineName}</span>}
                        </td>
                        <td>
                          <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{st.machineName || "—"}</div>
                          {(st.machineManufacturer || st.machineModel) && (
                            <span className="text-xs text-muted">
                              {[st.machineManufacturer, st.machineModel].filter(Boolean).join(" ")}
                            </span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: "0.8125rem" }}>{st.plcOrController || "—"}</span>
                        </td>
                        <td>
                          <span className={`badge ${st.status === "Aktif" ? "badge--on-track" : "badge--neutral"}`}>
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── Bölüm 3.3: OT Veri Gereksinimleri, Alarm ve Kalite Cihazları (FAZ-62C) ── */}
          {report.otMatrixSummary && (
            <section id="sec-ot-matrix" className="report-section">
              <div className="report-section__header">
                <span className="report-section__num">BÖLÜM 3.3</span>
                <h2 className="report-section__title">OT Veri Gereksinimleri, Alarm ve Kalite Cihazları Matrisi</h2>
              </div>

              {/* Matrix Overview KPI Box */}
              <div className="report-summary-box" style={{ marginBottom: "1.25rem" }}>
                <h3 className="report-summary-box__title">Endüstriyel Veri ve Cihaz Envanter Özeti</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginTop: "0.75rem" }}>
                  <div>
                    <span className="text-xs text-muted font-bold" style={{ display: "block" }}>VERİ GEREKSİNİMİ</span>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-primary, #1e3a8a)" }}>
                      {report.otMatrixSummary.stats.totalDataRequirements} Kayıt
                    </span>
                    <span className="text-xs text-muted" style={{ display: "block" }}>
                      ({report.otMatrixSummary.stats.criticalDataRequirements} Kritik)
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted font-bold" style={{ display: "block" }}>TANIMLI ALARMLAR</span>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "#b45309" }}>
                      {report.otMatrixSummary.stats.totalAlarms} Alarm
                    </span>
                    <span className="text-xs text-muted" style={{ display: "block" }}>
                      ({report.otMatrixSummary.stats.safetyCriticalAlarms} Safety Kritik)
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted font-bold" style={{ display: "block" }}>KALİTE CİHAZLARI</span>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "#15803d" }}>
                      {report.otMatrixSummary.stats.totalQualityDevices} Cihaz
                    </span>
                    <span className="text-xs text-muted" style={{ display: "block" }}>
                      ({report.otMatrixSummary.stats.automatedTransferDevices} Otomatik Aktarım)
                    </span>
                  </div>
                </div>
              </div>

              {/* 3.3.1 OT Data Requirements */}
              {report.otMatrixSummary.dataRequirements.length > 0 && (
                <div className="report-summary-box" style={{ marginBottom: "1.25rem" }}>
                  <h3 className="report-summary-box__title">3.3.1 OT Veri Gereksinimi & Karar/Aksiyon Matrisi</h3>
                  <p className="text-xs text-muted" style={{ marginBottom: "0.75rem" }}>
                    "Hangi veri, hangi karar için, hangi kaynaktan, hangi sıklıkta ve hangi aksiyona bağlanarak alınmalı?" ilkesiyle toplanan saha veri gereksinimleri.
                  </p>
                  <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="report-table report-table--striped" style={{ width: "100%", fontSize: "0.8125rem" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "12%" }}>İstasyon</th>
                          <th style={{ width: "18%" }}>Ölçüm / Sinyal</th>
                          <th style={{ width: "20%" }}>Amaç & Desteklenen Karar</th>
                          <th style={{ width: "18%" }}>Tetiklenen Aksiyon</th>
                          <th style={{ width: "14%" }}>Kaynak & Sıklık</th>
                          <th style={{ width: "10%" }}>Kritiklik / Öncelik</th>
                          <th style={{ width: "8%" }}>Hedef</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.otMatrixSummary.dataRequirements.map((d) => (
                          <tr key={d.id}>
                            <td>
                              <strong className="text-mono" style={{ color: "var(--color-primary, #1e3a8a)" }}>{d.stationCode}</strong>
                              <span className="text-xs text-muted" style={{ display: "block" }}>{d.stationName}</span>
                            </td>
                            <td>
                              <div className="font-bold">{d.measurementName}</div>
                              {d.dataCategory && <span className="text-xs text-muted">{d.dataCategory}</span>}
                            </td>
                            <td>
                              <div><strong>Amaç:</strong> {d.purpose}</div>
                              <div className="text-xs text-muted" style={{ marginTop: "2px" }}><strong>Karar:</strong> {d.decisionSupported}</div>
                            </td>
                            <td>
                              <div style={{ fontSize: "0.8125rem" }}>{d.requiredAction}</div>
                              {d.businessValue && <span className="text-xs text-muted" style={{ display: "block" }}>Değer: {d.businessValue}</span>}
                            </td>
                            <td>
                              <div style={{ fontSize: "0.8125rem" }}>{d.sourceName || d.sourceType || "—"}</div>
                              <span className="text-xs text-muted">
                                {[d.collectionMethod, d.frequency].filter(Boolean).join(" • ")}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span className={`badge ${d.criticality === "critical" ? "badge--danger" : d.criticality === "high" ? "badge--warning" : "badge--info"}`}>
                                  {d.criticality === "critical" ? "Kritik" : d.criticality === "high" ? "Yüksek" : d.criticality === "low" ? "Düşük" : "Orta"}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="badge badge--secondary">{d.targetSystem || "ERP/MES"}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3.3.2 OT Alarm Requirements */}
              {report.otMatrixSummary.alarmRequirements.length > 0 && (
                <div className="report-summary-box" style={{ marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <h3 className="report-summary-box__title" style={{ margin: 0 }}>3.3.2 Alarm ve Safety Gereksinimleri</h3>
                  </div>
                  <div className="text-xs" style={{ background: "#fffbeb", border: "1px solid #fef3c7", padding: "0.5rem 0.75rem", borderRadius: "4px", color: "#92400e", marginBottom: "0.75rem" }}>
                    <strong>⚠️ Güvenlik ve Yetki Sınırı Notu:</strong> Safety kritiklik işareti yalnızca saha keşif ve operasyonel danışmanlık amaçlıdır. ERP/CRM sistemi safety PLC yerine geçmez ve makinelere doğrudan acil durdurma komutu iletmez.
                  </div>
                  <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="report-table report-table--striped" style={{ width: "100%", fontSize: "0.8125rem" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "12%" }}>İstasyon</th>
                          <th style={{ width: "20%" }}>Alarm Adı & Kodu</th>
                          <th style={{ width: "20%" }}>Tetikleme Koşulu</th>
                          <th style={{ width: "14%" }}>Ciddiyet / Safety</th>
                          <th style={{ width: "16%" }}>Sorumlu & SLA</th>
                          <th style={{ width: "18%" }}>Gerekli Aksiyon</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.otMatrixSummary.alarmRequirements.map((a) => (
                          <tr key={a.id}>
                            <td>
                              <strong className="text-mono" style={{ color: "var(--color-primary, #1e3a8a)" }}>{a.stationCode}</strong>
                              <span className="text-xs text-muted" style={{ display: "block" }}>{a.stationName}</span>
                            </td>
                            <td>
                              <div className="font-bold">{a.alarmName}</div>
                              {a.alarmCode && <span className="text-xs text-mono text-muted">{a.alarmCode}</span>}
                            </td>
                            <td>
                              <div style={{ fontSize: "0.8125rem" }}>{a.triggerCondition || "—"}</div>
                              {a.sourceType && <span className="text-xs text-muted">Kaynak: {a.sourceType}</span>}
                            </td>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span className={`badge ${a.severity === "critical" ? "badge--danger" : a.severity === "high" ? "badge--warning" : "badge--info"}`}>
                                  {a.severity === "critical" ? "Kritik" : a.severity === "high" ? "Yüksek" : a.severity === "low" ? "Düşük" : "Uyarı"}
                                </span>
                                {a.safetyCritical && (
                                  <span className="badge badge--danger" style={{ fontSize: "0.6875rem" }}>
                                    🚨 Safety Kritik
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="font-bold" style={{ fontSize: "0.8125rem" }}>{a.responsibleRole || "—"}</div>
                              {a.responseSla && <span className="text-xs text-muted">SLA: {a.responseSla}</span>}
                            </td>
                            <td>
                              <div style={{ fontSize: "0.8125rem" }}>{a.requiredAction || "—"}</div>
                              <div className="text-xs text-muted" style={{ marginTop: "2px" }}>
                                {[
                                  a.acknowledgementRequired ? "Onay Zorunlu" : null,
                                  a.escalationRequired ? "Eskalasyon Var" : null,
                                ].filter(Boolean).join(" • ")}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3.3.3 OT Quality Devices */}
              {report.otMatrixSummary.qualityDevices.length > 0 && (
                <div className="report-summary-box" style={{ marginBottom: "1.25rem" }}>
                  <h3 className="report-summary-box__title">3.3.3 Kalite Ölçüm Cihazları ve Entegrasyon Profili</h3>
                  <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="report-table report-table--striped" style={{ width: "100%", fontSize: "0.8125rem" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "12%" }}>İstasyon</th>
                          <th style={{ width: "20%" }}>Cihaz & Model</th>
                          <th style={{ width: "16%" }}>Format / Arayüz</th>
                          <th style={{ width: "26%" }}>Veri Yetenekleri</th>
                          <th style={{ width: "14%" }}>Entegrasyon Yolu</th>
                          <th style={{ width: "12%" }}>Hedef Sistem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.otMatrixSummary.qualityDevices.map((q) => (
                          <tr key={q.id}>
                            <td>
                              <strong className="text-mono" style={{ color: "var(--color-primary, #1e3a8a)" }}>{q.stationCode}</strong>
                              <span className="text-xs text-muted" style={{ display: "block" }}>{q.stationName}</span>
                            </td>
                            <td>
                              <div className="font-bold">{q.deviceName}</div>
                              <span className="text-xs text-muted">
                                {[q.deviceType, q.manufacturer, q.model].filter(Boolean).join(" • ")}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontSize: "0.8125rem" }}>{q.outputFormat || "—"}</div>
                              {q.interfaceType && <span className="text-xs text-muted">{q.interfaceType}</span>}
                            </td>
                            <td>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
                                {q.passFailAvailable && <span className="badge badge--success text-xs">PASS/FAIL</span>}
                                {q.measurementValuesAvailable && <span className="badge badge--info text-xs">Ölçüm Değeri</span>}
                                {q.lotBatchAvailable && <span className="badge badge--secondary text-xs">Lot/Parti</span>}
                                {q.productCodeAvailable && <span className="badge badge--secondary text-xs">Ürün Kodu</span>}
                                {q.operatorAvailable && <span className="badge badge--secondary text-xs">Operatör</span>}
                              </div>
                            </td>
                            <td>
                              <span className="badge badge--outline-secondary text-xs">
                                {q.integrationMethod || "Manuel Giriş"}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge--secondary">{q.targetSystem || "ERP/QM"}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── Bölüm 4: İş Fonksiyonları Detay Analizi ─────────────────── */}
          <section id="sec-functions" className="report-section">
            <div className="report-section__header">
              <span className="report-section__num">BÖLÜM 4</span>
              <h2 className="report-section__title">İş Fonksiyonları & Süreç Analizleri</h2>
            </div>

            {businessFunctions.map((fn, fnIdx) => (
              <div key={fn.code} id={`sec-fn-${fn.code}`} className="report-function-card">
                {/* Function Header */}
                <div className="report-function-card__header">
                  <div className="report-function-card__title-group">
                    <span className="report-function-card__code">
                      4.{fnIdx + 1} {fn.code}
                    </span>
                    <h3 className="report-function-card__title">{fn.nameTr}</h3>
                  </div>

                  <div className="report-function-card__meta">
                    {fn.departmentName && (
                      <span className="badge badge--muted">
                        <Briefcase size={12} /> {fn.departmentName}
                      </span>
                    )}
                    {fn.packVersion && (
                      <span className="badge badge--muted text-xs">
                        Soru Paketi: {fn.packVersion}
                      </span>
                    )}
                    {getStatusBadge(fn.status)}
                  </div>
                </div>

                {/* ── Süreçler ve Soru-Cevaplar ────────────────────────────── */}
                <div className="report-function-card__body">
                  <h4 className="report-subheading">Süreç Bazlı Saha Tespitleri & Cevaplar</h4>

                  {fn.processes.length === 0 ? (
                    <p className="text-muted text-sm italic" style={{ padding: "0.5rem 0" }}>
                      {fn.packId
                        ? "Bu iş fonksiyonunda henüz cevaplanmış soru bulunmuyor."
                        : "Bu iş fonksiyonu için henüz soru paketi tanımlanmadı."}
                    </p>
                  ) : (
                    fn.processes.map((proc, pIdx) => (
                      <div key={proc.name} className="report-process-group">
                        <h5 className="report-process-group__title">
                          4.{fnIdx + 1}.{pIdx + 1} {proc.name}
                        </h5>

                        <div className="report-questions-list">
                          {proc.questions.map((q) => (
                            <div key={q.id} className="report-question-item">
                              <div className="report-question-item__header">
                                <span className="report-question-item__id">{q.id}</span>
                                {q.isCustom && (
                                  <span className="badge badge--info" style={{ fontSize: "0.6875rem", display: "inline-flex", alignItems: "center", gap: "0.2rem", marginLeft: "0.25rem" }}>
                                    Özel Soru
                                  </span>
                                )}
                                {q.followup && (
                                  <span
                                    className={`badge ${q.followup.flagType === "critical" ? "badge--danger" : "badge--warning"}`}
                                    style={{ fontSize: "0.6875rem", display: "inline-flex", alignItems: "center", gap: "0.2rem", marginLeft: "0.25rem" }}
                                  >
                                    {q.followup.flagType === "critical" ? "🔴 Kritik Takip" : "🟡 Sonra Dön"}
                                  </span>
                                )}
                                <div className="report-question-item__text">
                                  <strong>{q.questionText}</strong>
                                  {q.description && (
                                    <div className="report-question-item__desc">{q.description}</div>
                                  )}
                                </div>
                              </div>

                              {/* Formatted Answer */}
                              <div className="report-answer-box">
                                <div className="report-answer-box__content">
                                  {q.formattedAnswer.selectedOptions.length > 0 && (
                                    <ul className="report-answer-list">
                                      {q.formattedAnswer.selectedOptions.map((opt, oIdx) => (
                                        <li key={oIdx}>
                                          <strong>{opt.label}</strong>
                                          {opt.note && (
                                            <span className="report-answer-note"> — {opt.note}</span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  )}

                                  {q.formattedAnswer.textValue && (
                                    <p className="report-answer-text">{q.formattedAnswer.textValue}</p>
                                  )}

                                  {q.formattedAnswer.generalNote && (
                                    <div className="report-answer-general-note">
                                      <em>Genel Not:</em> {q.formattedAnswer.generalNote}
                                    </div>
                                  )}

                                  {!q.formattedAnswer.isAnswered && (
                                    <span className="text-muted italic text-sm">Cevaplanmadı</span>
                                  )}
                                </div>
                              </div>

                              {/* Soruya bağlı semantik kayıtlar */}
                              {(q.findings.length > 0 ||
                                q.requirements.length > 0 ||
                                q.risks.length > 0 ||
                                q.notes.length > 0) && (
                                <div className="report-question-semantic-links">
                                  {q.findings.map((f) => (
                                    <span key={f.id} className="badge badge--outline-primary text-xs">
                                      <Search size={11} /> Bulgu: {f.title}
                                    </span>
                                  ))}
                                  {q.requirements.map((r) => (
                                    <span key={r.id} className="badge badge--outline-success text-xs">
                                      <CheckSquare size={11} /> Gereksinim: {r.title}
                                    </span>
                                  ))}
                                  {q.risks.map((rsk) => (
                                    <span key={rsk.id} className="badge badge--outline-danger text-xs">
                                      <AlertTriangle size={11} /> Risk: {rsk.title}
                                    </span>
                                  ))}
                                  {q.notes.map((n) => (
                                    <span key={n.id} className="badge badge--outline-secondary text-xs">
                                      <StickyNote size={11} /> Not: {n.note.substring(0, 30)}...
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Soruya bağlı kanıt ekleri (FAZ-33) */}
                              {q.attachments && q.attachments.length > 0 && (
                                <div className="report-question-attachments" style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                                  {q.attachments.map((att) => {
                                    const sizeStr = att.fileSize < 1024 * 1024
                                      ? `${(att.fileSize / 1024).toFixed(1)} KB`
                                      : `${(att.fileSize / (1024 * 1024)).toFixed(1)} MB`;
                                    return (
                                      <button
                                        key={att.id}
                                        type="button"
                                        onClick={() => handleOpenAttachment(att)}
                                        className="badge badge--outline-secondary text-xs"
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "0.25rem",
                                          background: "var(--color-neutral-50)",
                                          borderColor: "var(--color-secondary-300)",
                                          cursor: "pointer",
                                          textAlign: "left",
                                        }}
                                        title="Dosyayı aç / önizle"
                                      >
                                        <Paperclip size={11} style={{ color: "var(--color-secondary-600)" }} />
                                        <strong style={{ color: "var(--color-primary-700)", textDecoration: "underline" }}>{att.originalFileName}</strong>
                                        <span style={{ color: "var(--text-muted)", fontSize: "0.6875rem" }}>({att.fileExtension.toUpperCase()} • {sizeStr})</span>
                                        {att.description && <span style={{ fontStyle: "italic" }}>— {att.description}</span>}
                                        <ExternalLink size={10} style={{ opacity: 0.6, marginLeft: "0.15rem" }} />
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}

                  {/* ── Departman Bulguları ───────────────────────────────── */}
                  {fn.findings.length > 0 && (
                    <div className="report-semantic-block">
                      <h4 className="report-subheading text-primary">
                        <Search size={15} /> Tespit Edilen Bulgular ({fn.findings.length})
                      </h4>
                      <div className="report-semantic-grid">
                        {fn.findings.map((f) => (
                          <div key={f.id} className="report-semantic-item report-semantic-item--finding">
                            <div className="report-semantic-item__header">
                              <strong>{f.title}</strong>
                              <div className="report-semantic-item__badges">
                                {getPriorityBadge(f.priority)}
                                {getStatusBadge(f.status)}
                              </div>
                            </div>
                            {f.description && <p className="report-semantic-item__desc">{f.description}</p>}
                            {f.questionId && (
                              <div className="report-semantic-item__source">
                                Kaynak: {f.questionId} {f.sourceQuestionText ? `(${f.sourceQuestionText})` : ""}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Departman Gereksinimleri ──────────────────────────── */}
                  {fn.requirements.length > 0 && (
                    <div className="report-semantic-block">
                      <h4 className="report-subheading text-success">
                        <CheckSquare size={15} /> İş Gereksinimleri ({fn.requirements.length})
                      </h4>
                      <div className="report-semantic-grid">
                        {fn.requirements.map((r) => (
                          <div key={r.id} className="report-semantic-item report-semantic-item--requirement">
                            <div className="report-semantic-item__header">
                              <strong>{r.title}</strong>
                              <div className="report-semantic-item__badges">
                                {getPriorityBadge(r.priority)}
                                {getStatusBadge(r.status)}
                              </div>
                            </div>
                            {r.description && <p className="report-semantic-item__desc">{r.description}</p>}
                            {r.questionId && (
                              <div className="report-semantic-item__source">
                                Kaynak: {r.questionId} {r.sourceQuestionText ? `(${r.sourceQuestionText})` : ""}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Departman Riskleri ───────────────────────────────── */}
                  {fn.risks.length > 0 && (
                    <div className="report-semantic-block">
                      <h4 className="report-subheading text-danger">
                        <AlertTriangle size={15} /> Tespit Edilen Riskler ({fn.risks.length})
                      </h4>
                      <div className="report-semantic-grid">
                        {fn.risks.map((rsk) => (
                          <div key={rsk.id} className="report-semantic-item report-semantic-item--risk">
                            <div className="report-semantic-item__header">
                              <strong>{rsk.title}</strong>
                              <div className="report-semantic-item__badges">
                                <span className="badge badge--outline-danger text-xs">
                                  Etki: {rsk.impact} | Olasılık: {rsk.probability}
                                </span>
                                {getStatusBadge(rsk.status)}
                              </div>
                            </div>
                            {rsk.description && (
                              <p className="report-semantic-item__desc">{rsk.description}</p>
                            )}
                            {rsk.mitigationNote && (
                              <div className="report-semantic-item__mitigation">
                                <strong>Önlem / Eylem Planı:</strong> {rsk.mitigationNote}
                              </div>
                            )}
                            {rsk.questionId && (
                              <div className="report-semantic-item__source">
                                Kaynak: {rsk.questionId} {rsk.sourceQuestionText ? `(${rsk.sourceQuestionText})` : ""}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Departman Notları ────────────────────────────────── */}
                  {fn.notes.length > 0 && (
                    <div className="report-semantic-block">
                      <h4 className="report-subheading text-secondary">
                        <StickyNote size={15} /> Görüşme & Saha Notları ({fn.notes.length})
                      </h4>
                      <div className="report-semantic-grid">
                        {fn.notes.map((n) => (
                          <div key={n.id} className="report-semantic-item report-semantic-item--note">
                            <p className="report-semantic-item__desc">{n.note}</p>
                            {n.questionId && (
                              <div className="report-semantic-item__source">
                                Kaynak: {n.questionId} {n.sourceQuestionText ? `(${n.sourceQuestionText})` : ""}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* ── Bölüm 5: Veri Sahipliği, Yetkiler ve Sorumluluk Yönetişimi (FAZ-46) ── */}
          {report.governance && (
            <section id="sec-governance" className="report-section">
              <div className="report-section__header">
                <span className="report-section__num">BÖLÜM 5</span>
                <h2 className="report-section__title">Veri Sahipliği, Yetkiler ve Sorumluluk Yönetişimi</h2>
              </div>

              {/* Yönetişim KPI Özeti */}
              <div className="report-kpi-band" style={{ marginBottom: "1rem" }}>
                <div className="report-kpi-band__item">
                  <span className="report-kpi-band__count">{report.governance.summary.totalObjects}</span>
                  <span className="report-kpi-band__label">Yönetişim Nesnesi</span>
                </div>
                <div className="report-kpi-band__divider" />
                <div className="report-kpi-band__item">
                  <span className={`report-kpi-band__count ${report.governance.summary.unassignedOwnerCount > 0 ? "text-danger" : ""}`}>
                    {report.governance.summary.unassignedOwnerCount}
                  </span>
                  <span className="report-kpi-band__label">Sahipsiz Veri (Owner Yok)</span>
                </div>
                <div className="report-kpi-band__divider" />
                <div className="report-kpi-band__item">
                  <span className={`report-kpi-band__count ${report.governance.summary.criticalSodRiskCount > 0 ? "text-danger" : ""}`}>
                    {report.governance.summary.criticalSodRiskCount}
                  </span>
                  <span className="report-kpi-band__label">Kritik SoD Riski</span>
                </div>
                <div className="report-kpi-band__divider" />
                <div className="report-kpi-band__item">
                  <span className="report-kpi-band__count">{report.governance.summary.discrepancyCount}</span>
                  <span className="report-kpi-band__label">Yetki Sapması</span>
                </div>
              </div>

              {/* Sorumluluk ve Veri Sahipliği Matrisi */}
              {report.governance.responsibilities.length > 0 && (
                <div className="report-summary-box" style={{ marginBottom: "1rem" }}>
                  <h3 className="report-summary-box__title">5.1 Veri Sahipliği ve Rol Matrisi</h3>
                  <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="report-table" style={{ width: "100%", fontSize: "0.8125rem" }}>
                      <thead>
                        <tr>
                          <th>Yönetişim Nesnesi</th>
                          <th>Sorumluluk Türü</th>
                          <th>Atanan Özne (Kişi/Rol)</th>
                          <th>Kapsam</th>
                          <th>Model</th>
                          <th>Notlar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.governance.responsibilities.map((r) => (
                          <tr key={r.id}>
                            <td><strong>{r.object_name_tr}</strong> ({r.object_code})</td>
                            <td><span className="badge badge--info">{r.responsibility_type}</span></td>
                            <td>{r.subject_name} ({r.subject_type})</td>
                            <td>{r.scope_name || "Tüm Organizasyon"}</td>
                            <td>{r.state_type === "to_be" ? "Hedef (To-Be)" : "Mevcut (As-Is)"}</td>
                            <td>{r.notes || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Yetki ve Erişim Matrisi */}
              {report.governance.authorizations.length > 0 && (
                <div className="report-summary-box" style={{ marginBottom: "1rem" }}>
                  <h3 className="report-summary-box__title">5.2 Yetki ve Erişim Matrisi</h3>
                  <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="report-table" style={{ width: "100%", fontSize: "0.8125rem" }}>
                      <thead>
                        <tr>
                          <th>Özne (Rol/Kişi)</th>
                          <th>Yönetişim Nesnesi</th>
                          <th>Beyan Edilen Yetki</th>
                          <th>Efektif Yetki / Sapma</th>
                          <th>Kapsam</th>
                          <th>İzin Detayı (G/E/D/S/O/İ/X/M)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.governance.authorizations.map((a) => (
                          <tr key={a.id}>
                            <td><strong>{a.subject_name}</strong> ({a.subject_type})</td>
                            <td>{a.object_name_tr}</td>
                            <td><span className="badge badge--secondary">{a.permission_level}</span></td>
                            <td>
                              {a.has_discrepancy === 1 && a.effective_level ? (
                                <span className="badge badge--danger">Sapma: {a.effective_level}</span>
                              ) : (
                                "Sapma Yok"
                              )}
                            </td>
                            <td>{a.scope_name || "Genel"}</td>
                            <td>
                              <code>
                                {[
                                  a.can_view ? "G" : "-",
                                  a.can_create ? "E" : "-",
                                  a.can_edit ? "D" : "-",
                                  a.can_delete ? "S" : "-",
                                  a.can_approve ? "O" : "-",
                                  a.can_cancel ? "İ" : "-",
                                  a.can_export ? "X" : "-",
                                  a.can_view_cost ? "M" : "-",
                                ].join("")}
                              </code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Limitler ve Onay Kademeleri */}
              {report.governance.limits.length > 0 && (
                <div className="report-summary-box" style={{ marginBottom: "1rem" }}>
                  <h3 className="report-summary-box__title">5.3 Yetki ve Onay Limitleri</h3>
                  <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="report-table" style={{ width: "100%", fontSize: "0.8125rem" }}>
                      <thead>
                        <tr>
                          <th>Limit Türü</th>
                          <th>Limit Sahibi (Özne)</th>
                          <th>Limit Aralığı</th>
                          <th>Onay Kademesi</th>
                          <th>Onaylayan Rol/Kişi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.governance.limits.map((l) => (
                          <tr key={l.id}>
                            <td><strong>{l.limit_type}</strong></td>
                            <td>{l.subject_name}</td>
                            <td>
                              {l.min_value != null || l.max_value != null
                                ? `${l.min_value ?? 0} — ${l.max_value ?? "∞"} ${l.currency_or_unit}`
                                : `Limitsiz (${l.currency_or_unit})`}
                            </td>
                            <td>{l.approval_tier || "Standart"}</td>
                            <td>{l.approver_subject_name || "Doğrudan Yetkili"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Görevler Ayrılığı (SoD) Riskleri */}
              {report.governance.sodRisks.length > 0 && (
                <div className="report-summary-box" style={{ marginBottom: "1rem" }}>
                  <h3 className="report-summary-box__title">5.4 Görevler Ayrılığı (SoD) Risk Matrisi</h3>
                  <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="report-table" style={{ width: "100%", fontSize: "0.8125rem" }}>
                      <thead>
                        <tr>
                          <th>Risk Başlığı</th>
                          <th>Ciddiyet</th>
                          <th>Çatışan Görevler (A vs B)</th>
                          <th>Mevcut Kontrol</th>
                          <th>Önerilen Çözüm (To-Be)</th>
                          <th>Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.governance.sodRisks.map((s) => (
                          <tr key={s.id}>
                            <td><strong>{s.risk_title}</strong></td>
                            <td>
                              <span className={`badge ${s.risk_severity === "critical" ? "badge--danger" : "badge--warning"}`}>
                                {s.risk_severity.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontSize: "0.75rem" }}>
                                <div><strong>A:</strong> {s.conflicting_duty_a}</div>
                                <div><strong>B:</strong> {s.conflicting_duty_b}</div>
                              </div>
                            </td>
                            <td>{s.current_control || "Kontrol Yok"}</td>
                            <td>{s.mitigation_action || "—"}</td>
                            <td><span className="badge badge--secondary">{s.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── Bölüm {report.governance ? "6" : "5"}: Proje Notları & Açık Konular ── */}
          <section id="sec-notes" className="report-section">
            <div className="report-section__header">
              <span className="report-section__num">BÖLÜM {report.governance ? "6" : "5"}</span>
              <h2 className="report-section__title">Proje Notları & Açık Konular</h2>
            </div>


            {/* Açık Sorular ve Teyit Bekleyen Konular Tablosu (FAZ-9) */}
            {report.followups && report.followups.length > 0 && (
              <div className="report-summary-box" style={{ marginBottom: "1.25rem", borderLeft: "4px solid var(--warning)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <h3 className="report-summary-box__title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>Açık Sorular & Teyit Bekleyen Saha Başlıkları</span>
                    <span className="badge badge--warning text-xs">
                      {report.followups.length} Konu
                    </span>
                  </h3>
                </div>

                <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                  <table className="report-table" style={{ width: "100%", fontSize: "0.8125rem" }}>
                    <thead>
                      <tr>
                        <th style={{ width: "120px" }}>Öncelik / Durum</th>
                        <th style={{ width: "140px" }}>İş Fonksiyonu</th>
                        <th style={{ width: "160px" }}>Süreç</th>
                        <th>Soru</th>
                        <th>Takip Notu / Gerekçe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.followups.map((fol) => (
                        <tr key={fol.id}>
                          <td>
                            <span
                              className={`badge ${fol.flagType === "critical" ? "badge--danger" : "badge--warning"}`}
                              style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                            >
                              {fol.flagType === "critical" ? "🔴 Kritik Takip" : "🟡 Sonra Dön"}
                            </span>
                          </td>
                          <td><strong>{fol.businessFunctionNameTr}</strong></td>
                          <td>{fol.processName}</td>
                          <td>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>{fol.questionId}</span>
                            <strong>{fol.questionText}</strong>
                          </td>
                          <td style={{ color: fol.note ? "var(--text-color)" : "var(--text-muted)", fontStyle: fol.note ? "normal" : "italic" }}>
                            {fol.note || "Açıklama girilmedi."}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Kanıt Dokümanları ve Ekler Dizini (FAZ-33) */}
            {report.attachments && report.attachments.length > 0 && (
              <div className="report-summary-box" style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <h3 className="report-summary-box__title" style={{ color: "var(--color-secondary-700)", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
                    <Paperclip size={16} /> Kanıt Dokümanları ve Ekler Dizini
                  </h3>
                  <span className="badge badge--secondary">
                    {report.attachments.length} Dosya ({(report.summaryStats.totalAttachmentSizeBytes ? (report.summaryStats.totalAttachmentSizeBytes / (1024 * 1024)).toFixed(1) : 0)} MB)
                  </span>
                </div>

                <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                  <table className="report-table" style={{ width: "100%", fontSize: "0.8125rem" }}>
                    <thead>
                      <tr>
                        <th style={{ width: "160px" }}>İş Fonksiyonu / Süreç</th>
                        <th style={{ width: "240px" }}>Soru</th>
                        <th>Dosya Adı & Tür</th>
                        <th>Açıklama</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.attachments.map((att) => {
                        const sizeStr = att.fileSize < 1024 * 1024
                          ? `${(att.fileSize / 1024).toFixed(1)} KB`
                          : `${(att.fileSize / (1024 * 1024)).toFixed(1)} MB`;
                        return (
                          <tr key={att.id}>
                            <td>
                              <strong>{att.businessFunctionNameTr}</strong>
                              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>{att.processName}</span>
                            </td>
                            <td>
                              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>{att.questionId}</span>
                              <strong>{att.questionText}</strong>
                            </td>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                  <Paperclip size={13} style={{ color: "var(--color-secondary-600)", flexShrink: 0 }} />
                                  <strong style={{ color: "var(--color-primary-700)" }}>
                                    {att.originalFileName}
                                  </strong>
                                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                    ({att.fileExtension.toUpperCase()} • {sizeStr})
                                  </span>
                                </div>
                                <div style={{ color: "var(--text-muted)", fontSize: "0.6875rem", fontFamily: "monospace", wordBreak: "break-all" }}>
                                  <span style={{ fontWeight: 600, color: "var(--color-secondary-700)" }}>Vault:</span> {MANAGED_VAULT_APP_NAME}/{att.relativePath}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.15rem", flexWrap: "wrap" }}>
                                  <span
                                    style={{
                                      fontSize: "0.625rem",
                                      padding: "0.1rem 0.35rem",
                                      background: "rgba(16, 185, 129, 0.1)",
                                      color: "#059669",
                                      borderRadius: "3px",
                                      border: "1px solid rgba(16, 185, 129, 0.3)",
                                      fontWeight: 600,
                                    }}
                                  >
                                    ✓ Managed kopya mevcut
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAttachment(att)}
                                    title="Dosyayı varsayılan uygulamada aç"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "0.2rem",
                                      background: "var(--color-primary-50, #eff6ff)",
                                      border: "1px solid var(--color-primary-300, #93c5fd)",
                                      borderRadius: "3px",
                                      padding: "0.1rem 0.4rem",
                                      cursor: "pointer",
                                      fontSize: "0.6875rem",
                                      fontWeight: 600,
                                      color: "var(--color-primary-700, #1d4ed8)",
                                    }}
                                  >
                                    <ExternalLink size={10} />
                                    Aç
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleShowInFolder(att)}
                                    title="Dosyanın yerel Vault klasörünü dosya yöneticisinde aç ve seç"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "0.2rem",
                                      background: "none",
                                      border: "1px solid var(--border-color, #cbd5e1)",
                                      borderRadius: "3px",
                                      padding: "0.1rem 0.4rem",
                                      cursor: "pointer",
                                      fontSize: "0.6875rem",
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    <FolderOpen size={10} />
                                    Klasörde Göster
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td style={{ color: att.description ? "var(--text-color)" : "var(--text-muted)", fontStyle: att.description ? "normal" : "italic" }}>
                              {att.description || "Açıklama girilmedi."}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Açık Konular */}
            <div className="report-summary-box">
              <h3 className="report-summary-box__title">Açık Konular & Karar Bekleyen Başlıklar</h3>
              {profile.open_topics ? (
                <p className="report-text-block" style={{ whiteSpace: "pre-wrap" }}>
                  {profile.open_topics}
                </p>
              ) : (
                <div className="report-empty-prompt">
                  <span>Açık konu veya karar bekleyen başlık bulunmuyor.</span>
                  <button className="btn btn--outline btn--xs" onClick={() => setIsProfileModalOpen(true)}>
                    <Edit3 size={13} /> Konu Ekle
                  </button>
                </div>
              )}
            </div>

            {/* Genel Proje Notları */}
            {projectNotes.filter((n) => !n.businessFunctionCode).length > 0 && (
              <div className="report-summary-box" style={{ marginTop: "1rem" }}>
                <h3 className="report-summary-box__title">Genel Proje Notları</h3>
                <div className="report-semantic-grid" style={{ marginTop: "0.5rem" }}>
                  {projectNotes
                    .filter((n) => !n.businessFunctionCode)
                    .map((n) => (
                      <div key={n.id} className="report-semantic-item report-semantic-item--note">
                        <p className="report-semantic-item__desc">{n.note}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </section>

          {/* ── Footer ─────────────────────────────────────────────────── */}
          <footer className="report-document__footer">
            <p>
              ERP CRM Discovery • Açık Kaynak & Offline-First ERP/CRM Ön Analiz Aracı • {metadata.generatedAt}
            </p>
            <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              ERP CRM Discovery tarafından oluşturulmuştur. | Geliştirici ve bakımcı: Selim Koçak | İletişim: selimkocak@gmail.com
            </p>
          </footer>
        </main>
      </div>

      {/* ── Image Lightbox Modal ────────────────────────────────────────── */}
      {previewImage && (
        <div
          className="modal-overlay"
          onClick={() => {
            URL.revokeObjectURL(previewImage.url);
            setPreviewImage(null);
          }}
          style={{ zIndex: 9999 }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "800px", width: "90%", padding: "1.25rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Paperclip size={16} style={{ color: "var(--color-primary-600)" }} />
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{previewImage.name}</h3>
                <span className="badge badge--secondary text-xs">{previewImage.size}</span>
              </div>
              <button
                type="button"
                className="btn btn--icon"
                onClick={() => {
                  URL.revokeObjectURL(previewImage.url);
                  setPreviewImage(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ textAlign: "center", background: "#0f172a", borderRadius: "8px", padding: "0.75rem", maxHeight: "65vh", overflow: "auto" }}>
              <img
                src={previewImage.url}
                alt={previewImage.name}
                style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain", borderRadius: "4px" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.75rem" }}>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => openAttachment(previewImage.att)}
                title="İşletim sistemi varsayılan görüntüleyicisiyle aç"
              >
                <ExternalLink size={14} /> Sistemde Aç
              </button>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => {
                  URL.revokeObjectURL(previewImage.url);
                  setPreviewImage(null);
                }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Profile Modal ─────────────────────────────────────────── */}
      {isProfileModalOpen && (
        <ReportProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSaved={loadReport}
          projectId={projectId}
          initialProfile={profile}
        />
      )}
    </div>
  );
};
