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
import { openAttachment, showAttachmentInFolder, attachmentExists } from "../storage/attachmentLinks";
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
  const [attachmentExistsMap, setAttachmentExistsMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    async function verifyFiles() {
      if (!report?.attachments || report.attachments.length === 0) {
        if (isMounted) setAttachmentExistsMap({});
        return;
      }
      const map: Record<string, boolean> = {};
      for (const att of report.attachments) {
        map[att.id] = await attachmentExists(att.relativePath);
      }
      if (isMounted) {
        setAttachmentExistsMap(map);
      }
    }
    verifyFiles();
    return () => {
      isMounted = false;
    };
  }, [report]);

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
            {report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0 && (
              <a href="#sec-process-maps" className="report-toc__link">
                4. Süreç Haritaları & Benimseme Riski
              </a>
            )}
            {report.dataGovernanceSummary && report.dataGovernanceSummary.assets.length > 0 && (
              <a href="#sec-data-governance" className="report-toc__link">
                {report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0
                  ? "5. Veri Sahipliği & Yetki Matrisi"
                  : "4. Veri Sahipliği & Yetki Matrisi"}
              </a>
            )}
            {report.evidenceSummary && report.evidenceSummary.stats.totalEvidence > 0 && (
              <a href="#sec-evidence" className="report-toc__link">
                {(() => {
                  let sectionNum = 4;
                  if (report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0) sectionNum++;
                  if (report.dataGovernanceSummary && report.dataGovernanceSummary.assets.length > 0) sectionNum++;
                  return `${sectionNum}. Kanıt & Saha Doğrulama`;
                })()}
              </a>
            )}
            {report.readinessSummary && report.readinessSummary.checklist.length > 0 && (
              <a href="#sec-readiness" className="report-toc__link">
                {(() => {
                  let sectionNum = 4;
                  if (report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0) sectionNum++;
                  if (report.dataGovernanceSummary && report.dataGovernanceSummary.assets.length > 0) sectionNum++;
                  if (report.evidenceSummary && report.evidenceSummary.stats.totalEvidence > 0) sectionNum++;
                  return `${sectionNum}. Pilot Saha Kabulü & Go-Live Hazırlığı`;
                })()}
              </a>
            )}
            <div className="report-toc__group">
              <span className="report-toc__group-title">
                {(() => {
                  let sectionNum = 4;
                  if (report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0) sectionNum++;
                  if (report.dataGovernanceSummary && report.dataGovernanceSummary.assets.length > 0) sectionNum++;
                  if (report.evidenceSummary && report.evidenceSummary.stats.totalEvidence > 0) sectionNum++;
                  if (report.readinessSummary && report.readinessSummary.checklist.length > 0) sectionNum++;
                  return `${sectionNum}. İş Fonksiyonları`;
                })()}
              </span>
              {businessFunctions.map((fn, idx) => {
                let sectionNum = 4;
                if (report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0) sectionNum++;
                if (report.dataGovernanceSummary && report.dataGovernanceSummary.assets.length > 0) sectionNum++;
                if (report.evidenceSummary && report.evidenceSummary.stats.totalEvidence > 0) sectionNum++;
                return (
                  <a key={fn.code} href={`#sec-fn-${fn.code}`} className="report-toc__sublink">
                    {`${sectionNum}.${idx + 1}`} {fn.nameTr}
                  </a>
                );
              })}
            </div>
            {report.governance && !report.dataGovernanceSummary && (
              <a href="#sec-governance" className="report-toc__link">
                Yönetişim & Yetki Matrisi
              </a>
            )}
            <a href="#sec-notes" className="report-toc__link">
              {(() => {
                let sectionNum = 5;
                if (report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0) sectionNum++;
                if (report.dataGovernanceSummary && report.dataGovernanceSummary.assets.length > 0) sectionNum++;
                if (report.evidenceSummary && report.evidenceSummary.stats.totalEvidence > 0) sectionNum++;
                return `${sectionNum}. Proje Notları & Açık Konular`;
              })()}
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

          {/* ── Bölüm 4: Süreç Haritaları, Süreç Sadelik ve Kullanıcı Benimsemesi (FAZ-63) ── */}
          {report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0 && (
            <section id="sec-process-maps" className="report-section">
              <div className="report-section__header">
                <span className="report-section__num">BÖLÜM 4</span>
                <h2 className="report-section__title">Süreç Haritaları, Süreç Sadelik ve Kullanıcı Benimsemesi</h2>
              </div>

              {/* Process KPI Overview Box */}
              <div className="report-summary-box" style={{ marginBottom: "1.25rem" }}>
                <h3 className="report-summary-box__title">4.1 Süreç Haritaları & Benimseme Riski Özeti</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginTop: "0.75rem" }}>
                  <div>
                    <span className="text-xs text-muted font-bold" style={{ display: "block" }}>MODEL SÜREÇ SAYISI</span>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-primary, #1e3a8a)" }}>
                      {report.processMapsSummary.stats.totalMaps} Süreç
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted font-bold" style={{ display: "block" }}>TOPLAM SÜREÇ ADIMI</span>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                      {report.processMapsSummary.stats.totalNodes} Adım
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted font-bold" style={{ display: "block" }}>YÜKSEK BENİMSEME RİSKİ</span>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700, color: report.processMapsSummary.stats.highAdoptionRiskCount > 0 ? "#b91c1c" : "#15803d" }}>
                      {report.processMapsSummary.stats.highAdoptionRiskCount} Adım
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted font-bold" style={{ display: "block" }}>SADELEŞTİRME FIRSATI</span>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "#b45309" }}>
                      {report.processMapsSummary.stats.simplificationOpportunityCount} Nokta
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "0.75rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                  <span><strong>Onay Sayısı:</strong> {report.processMapsSummary.stats.totalApprovals}</span>
                  <span>•</span>
                  <span><strong>El Değiştirme (Handoff):</strong> {report.processMapsSummary.stats.totalHandoffs}</span>
                  <span>•</span>
                  <span><strong>Mükerrer Veri Girişi:</strong> {report.processMapsSummary.stats.duplicateDataEntryCount}</span>
                  <span>•</span>
                  <span><strong>Bypass / Gayriresmi Yol:</strong> {report.processMapsSummary.stats.bypassPossibleCount}</span>
                </div>
              </div>

              {/* Process Maps & Steps */}
              {report.processMapsSummary.maps.map((pm, mapIdx) => (
                <div key={pm.id} className="report-summary-box" style={{ marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <h3 className="report-summary-box__title" style={{ margin: 0 }}>
                      4.2.{mapIdx + 1} {pm.name}
                      {pm.processArea && <span className="text-muted text-xs font-normal" style={{ marginLeft: "0.5rem" }}>({pm.processArea})</span>}
                    </h3>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      {pm.ownerRole && <span className="badge badge--muted text-xs">Sahip: {pm.ownerRole}</span>}
                      <span className={`badge ${pm.status === "Aktif" ? "badge--on-track" : "badge--neutral"}`}>{pm.status}</span>
                    </div>
                  </div>
                  {pm.description && <p className="text-xs text-muted" style={{ marginBottom: "0.75rem" }}>{pm.description}</p>}

                  {pm.nodes.length > 0 ? (
                    <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                      <table className="report-table report-table--striped" style={{ width: "100%", fontSize: "0.8125rem" }}>
                        <thead>
                          <tr>
                            <th style={{ width: "6%" }}>Sıra</th>
                            <th style={{ width: "22%" }}>Adım & Tip</th>
                            <th style={{ width: "18%" }}>Sorumlu (Dep / Rol)</th>
                            <th style={{ width: "18%" }}>Girdi & Çıktı</th>
                            <th style={{ width: "16%" }}>Süreç Metrikleri</th>
                            <th style={{ width: "10%" }}>Benimseme Riski</th>
                            <th style={{ width: "10%" }}>Katma Değer</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pm.nodes.map((n) => (
                            <tr key={n.id}>
                              <td><strong className="text-mono">{n.stepOrder}</strong></td>
                              <td>
                                <div className="font-bold">{n.name}</div>
                                <span className="badge badge--secondary text-xs">{n.nodeType}</span>
                                {n.otStationCode && (
                                  <span className="badge badge--info text-xs" style={{ marginLeft: "4px" }}>
                                    🏭 {n.otStationCode}
                                  </span>
                                )}
                              </td>
                              <td>
                                <div>{n.responsibleRole || "—"}</div>
                                {n.responsibleDepartment && (
                                  <span className="text-xs text-muted">{n.responsibleDepartment}</span>
                                )}
                              </td>
                              <td>
                                {n.inputDescription && <div className="text-xs"><strong>G:</strong> {n.inputDescription}</div>}
                                {n.outputDescription && <div className="text-xs text-muted"><strong>Ç:</strong> {n.outputDescription}</div>}
                                {!n.inputDescription && !n.outputDescription && "—"}
                              </td>
                              <td>
                                <div className="text-xs">
                                  <span>Onay: {n.approvalCount} | Handoff: {n.handoffCount}</span>
                                  {n.duplicateDataEntry && <div className="text-danger">⚠️ Mükerrer Veri</div>}
                                  {n.bypassPossible && <div className="text-danger font-bold">🚨 Bypass / Excel Riski</div>}
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${n.adoptionRisk === "high" ? "badge--danger" : n.adoptionRisk === "medium" ? "badge--warning" : "badge--success"}`}>
                                  {n.adoptionRisk === "high" ? "Yüksek Risk" : n.adoptionRisk === "medium" ? "Orta Risk" : "Düşük Risk"}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${n.valueAdded ? "badge--outline-success" : "badge--outline-danger"}`}>
                                  {n.valueAdded ? "Katma Değerli" : "İsraf / Bekleme"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted text-xs italic">Bu süreç için henüz adım tanımlanmamış.</p>
                  )}
                </div>
              ))}

              {/* 4.3 Simplification Opportunities & Safety Boundary Note */}
              <div className="report-summary-box" style={{ marginTop: "1.25rem", borderLeft: "4px solid #b45309" }}>
                <h3 className="report-summary-box__title" style={{ color: "#92400e" }}>4.3 Sadeleştirme Fırsatları ve Kontrol Güvenlik İlkesi</h3>
                <p className="text-xs text-muted" style={{ lineHeight: 1.6 }}>
                  Sadeleştirme, kontrollerin kaldırılması anlamına gelmez. <strong>Finansal kontrol, kalite, iş güvenliği, mevzuat ve görevler ayrılığı (SoD) kontrolleri</strong> hiçbir koşulda sadeleştirme adına ortadan kaldırılamaz. İyileştirme odağı; mükerrer manuel girişler, gereksiz onay kuyrukları ve gayriresmi excel/kağıt bypass hatlarının ortadan kaldırılmasıdır.
                </p>
              </div>
            </section>
          )}

          {/* ── Bölüm 5 / 4: İş Fonksiyonları Detay Analizi ─────────────────── */}
          <section id="sec-functions" className="report-section">
            <div className="report-section__header">
              <span className="report-section__num">
                {report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0 ? "BÖLÜM 5" : "BÖLÜM 4"}
              </span>
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

          {/* ── Bölüm 5: Veri Sahipliği, Yetkiler ve Sorumluluk Matrisi (FAZ-64 / dataGovernanceSummary) ── */}
          {report.dataGovernanceSummary && report.dataGovernanceSummary.assets.length > 0 && (
            <section id="sec-data-governance" className="report-section">
              <div className="report-section__header">
                <span className="report-section__num">
                  {report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0 ? "BÖLÜM 5" : "BÖLÜM 4"}
                </span>
                <h2 className="report-section__title">Veri Sahipliği, Yetkiler ve Sorumluluk Matrisi</h2>
              </div>

              {/* Data Governance KPI Band */}
              <div className="report-kpi-band" style={{ marginBottom: "1.25rem" }}>
                <div className="report-kpi-band__item">
                  <span className="report-kpi-band__count" style={{ color: "var(--color-primary, #1e3a8a)" }}>
                    {report.dataGovernanceSummary.stats.totalAssets}
                  </span>
                  <span className="report-kpi-band__label">Veri Varlığı</span>
                </div>
                <div className="report-kpi-band__divider" />
                <div className="report-kpi-band__item">
                  <span className={`report-kpi-band__count ${report.dataGovernanceSummary.stats.unassignedOwnerCount > 0 ? "text-danger" : ""}`}>
                    {report.dataGovernanceSummary.stats.unassignedOwnerCount}
                  </span>
                  <span className="report-kpi-band__label">Sahipsiz / Owner Yok</span>
                </div>
                <div className="report-kpi-band__divider" />
                <div className="report-kpi-band__item">
                  <span className="report-kpi-band__count" style={{ color: "#b45309" }}>
                    {report.dataGovernanceSummary.stats.criticalAssetCount}
                  </span>
                  <span className="report-kpi-band__label">Kritik / Yüksek Veri</span>
                </div>
                <div className="report-kpi-band__divider" />
                <div className="report-kpi-band__item">
                  <span className={`report-kpi-band__count ${report.dataGovernanceSummary.stats.sodConflictCount > 0 ? "text-danger" : "#15803d"}`}>
                    {report.dataGovernanceSummary.stats.sodConflictCount}
                  </span>
                  <span className="report-kpi-band__label">SoD Çatışma Uyarısı</span>
                </div>
                <div className="report-kpi-band__divider" />
                <div className="report-kpi-band__item">
                  <span className="report-kpi-band__count">
                    {report.dataGovernanceSummary.stats.totalAccessRules} Kural / {report.dataGovernanceSummary.stats.totalApprovals} Onay
                  </span>
                  <span className="report-kpi-band__label">Erişim & Onay Kuralı</span>
                </div>
              </div>

              {/* 5.1 Data Assets & Roles Table */}
              <div className="report-summary-box" style={{ marginBottom: "1.25rem" }}>
                <h3 className="report-summary-box__title">
                  {report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0 ? "5.1" : "4.1"} Veri Varlıkları, Sahiplik ve Görevler Ayrılığı Matrisi
                </h3>
                <p className="text-xs text-muted" style={{ marginBottom: "0.75rem" }}>
                  Ana verilerin ve kritik süreç verilerinin sahibi (iş kararı), sorumlusu (veri kalitesi) ve teknik emanetçisi (altyapı/güvenlik).
                </p>
                <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                  <table className="report-table report-table--striped" style={{ width: "100%", fontSize: "0.8125rem" }}>
                    <thead>
                      <tr>
                        <th style={{ width: "20%" }}>Veri Varlığı & Domain</th>
                        <th style={{ width: "12%" }}>Tip & Kayıt Sistemi</th>
                        <th style={{ width: "16%" }}>Veri Sahibi (Owner)</th>
                        <th style={{ width: "16%" }}>Veri Sorumlusu (Steward)</th>
                        <th style={{ width: "16%" }}>Teknik Emanetçi (Custodian)</th>
                        <th style={{ width: "10%" }}>Kritiklik</th>
                        <th style={{ width: "10%" }}>SoD Durumu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.dataGovernanceSummary.assets.map((ast) => (
                        <tr key={ast.id}>
                          <td>
                            <div className="font-bold">{ast.assetName}</div>
                            {ast.domain && <span className="text-xs text-muted">{ast.domain}</span>}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", marginTop: "3px" }}>
                              {ast.masterData && <span className="badge badge--secondary text-xs">Ana Veri</span>}
                              {ast.financialData && <span className="badge badge--warning text-xs">Finansal</span>}
                              {ast.personalData && <span className="badge badge--danger text-xs">KVKK</span>}
                              {ast.qualityOrSafetyData && <span className="badge badge--info text-xs">Kalite/Güvenlik</span>}
                            </div>
                          </td>
                          <td>
                            <span className="badge badge--secondary text-xs">{ast.assetType}</span>
                            <div className="text-xs text-muted" style={{ marginTop: "2px" }}>
                              {ast.systemOfRecord || "ERP"}
                            </div>
                          </td>
                          <td>
                            <strong>{ast.ownerRole || <span className="text-danger italic">Tanımsız</span>}</strong>
                          </td>
                          <td>
                            <div>{ast.stewardRole || <span className="text-danger italic">Tanımsız</span>}</div>
                          </td>
                          <td>
                            <div>{ast.technicalCustodianRole || <span className="text-danger italic">Tanımsız</span>}</div>
                          </td>
                          <td>
                            <span className={`badge ${ast.criticality === "CRITICAL" ? "badge--danger" : ast.criticality === "HIGH" ? "badge--warning" : "badge--info"}`}>
                              {ast.criticality}
                            </span>
                          </td>
                          <td>
                            {ast.hasSodRisk ? (
                              <span className="badge badge--danger" title={ast.sodRiskMessage || "Görevler ayrılığı değerlendirilmelidir"}>
                                ⚠️ SoD Riski
                              </span>
                            ) : (
                              <span className="badge badge--outline-success">Uygun</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5.2 Access & Permission Rules Table */}
              {report.dataGovernanceSummary.accessRules.length > 0 && (
                <div className="report-summary-box" style={{ marginBottom: "1.25rem" }}>
                  <h3 className="report-summary-box__title">
                    {report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0 ? "5.2" : "4.2"} Rol ve Grup Bazlı Erişim / Yetki Kuralları
                  </h3>
                  <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="report-table report-table--striped" style={{ width: "100%", fontSize: "0.8125rem" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "18%" }}>Erişen Rol / Grup</th>
                          <th style={{ width: "20%" }}>İlgili Veri Varlığı</th>
                          <th style={{ width: "14%" }}>Erişim Seviyesi</th>
                          <th style={{ width: "16%" }}>Organizasyon Kapsamı</th>
                          <th style={{ width: "16%" }}>Onay Gereksinimi</th>
                          <th style={{ width: "16%" }}>Limit / Çatışma Notu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.dataGovernanceSummary.accessRules.map((acc) => (
                          <tr key={acc.id}>
                            <td>
                              <div className="font-bold">{acc.actorName}</div>
                              <span className="text-xs text-muted">({acc.actorType})</span>
                            </td>
                            <td>
                              <strong>{acc.assetName}</strong>
                              {acc.domain && <span className="text-xs text-muted" style={{ display: "block" }}>{acc.domain}</span>}
                            </td>
                            <td>
                              <span className={`badge ${acc.accessLevel === "FULL" ? "badge--danger" : acc.accessLevel === "CREATE" || acc.accessLevel === "UPDATE" ? "badge--warning" : "badge--info"}`}>
                                {acc.accessLevel}
                              </span>
                            </td>
                            <td>
                              <div>{acc.scopeType}</div>
                              {acc.scopeValue && <span className="text-xs text-muted">{acc.scopeValue}</span>}
                            </td>
                            <td>
                              {acc.approvalRequired ? (
                                <span className="badge badge--warning">
                                  Onay Şartı ({acc.approvalRole || "Yönetici"})
                                </span>
                              ) : (
                                <span className="text-muted text-xs">Doğrudan Erişim</span>
                              )}
                            </td>
                            <td>
                              {acc.taskSeparationRequired && (
                                <span className="badge badge--danger text-xs" style={{ display: "inline-block", marginBottom: "2px" }}>
                                  ⚠️ Görevler Ayrılığı Zorunlu
                                </span>
                              )}
                              {acc.limitDescription && <div className="text-xs">{acc.limitDescription}</div>}
                              {acc.conflictNote && <div className="text-xs text-danger">{acc.conflictNote}</div>}
                              {!acc.taskSeparationRequired && !acc.limitDescription && !acc.conflictNote && "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5.3 Approval Rules Table */}
              {report.dataGovernanceSummary.approvals.length > 0 && (
                <div className="report-summary-box" style={{ marginBottom: "1.25rem" }}>
                  <h3 className="report-summary-box__title">
                    {report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0 ? "5.3" : "4.3"} Onay Kuralları ve Limit Kademeleri
                  </h3>
                  <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="report-table report-table--striped" style={{ width: "100%", fontSize: "0.8125rem" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "6%" }}>Sıra</th>
                          <th style={{ width: "22%" }}>Onay Adı</th>
                          <th style={{ width: "18%" }}>İlgili Varlık</th>
                          <th style={{ width: "18%" }}>İlgili Süreç Haritası</th>
                          <th style={{ width: "16%" }}>Onaylayan Rol</th>
                          <th style={{ width: "12%" }}>Eşik / Limit</th>
                          <th style={{ width: "8%" }}>SoD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.dataGovernanceSummary.approvals.map((appr) => (
                          <tr key={appr.id}>
                            <td><strong className="text-mono">{appr.approvalOrder}</strong></td>
                            <td>
                              <div className="font-bold">{appr.approvalName}</div>
                              {appr.mandatory && <span className="badge badge--danger text-xs">Zorunlu Onay</span>}
                            </td>
                            <td>{appr.assetName || "—"}</td>
                            <td>{appr.processMapName ? <span>🗺️ {appr.processMapName}</span> : "—"}</td>
                            <td><strong>{appr.approvalRole}</strong></td>
                            <td>{appr.thresholdDescription || "Tüm Tutarlar"}</td>
                            <td>
                              {appr.separationOfDuties ? (
                                <span className="badge badge--warning text-xs">Ayrılık Şart</span>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5.4 Governance & SoD Safety Note */}
              <div className="report-summary-box" style={{ marginTop: "1.25rem", borderLeft: "4px solid #1e3a8a" }}>
                <h3 className="report-summary-box__title" style={{ color: "#1e3a8a" }}>
                  {report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0 ? "5.4" : "4.4"} Yönetişim ve Görevler Ayrılığı (SoD) İlkeleri
                </h3>
                <p className="text-xs text-muted" style={{ lineHeight: 1.6 }}>
                  Veri varlığı sahibi, sorumlusu ve teknik emanetçisinin aynı role verilmesi kurumsal hata, tekil yetki suistimali ve denetim riskini artırır. Sistem bu durumları <strong>"görevler ayrılığı değerlendirilmelidir"</strong> uyarısıyla raporlar. Bu matris yalnızca keşif ve danışmanlık amaçlı yönetişim modelini kaydeder; canlı kullanıcı hesabı veya parola yönetim sistemi içermez.
                </p>
              </div>
            </section>
          )}

          {/* ── Legacy Governance Section Fallback ── */}
          {report.governance && !report.dataGovernanceSummary && (
            <section id="sec-governance" className="report-section">
              <div className="report-section__header">
                <span className="report-section__num">BÖLÜM 5</span>
                <h2 className="report-section__title">Veri Sahipliği, Yetkiler ve Sorumluluk Yönetişimi</h2>
              </div>
              <div className="report-summary-box">
                <p className="text-xs text-muted">Yönetişim nesneleri ve sorumluluk matrisi.</p>
              </div>
            </section>
          )}

          {/* ── Bölüm 6: Kanıt ve Saha Doğrulama Kaydı (FAZ-65) ── */}
          {report.evidenceSummary && (
            <section id="sec-evidence" className="report-section">
              <div className="report-section__header">
                <span className="report-section__num">
                  {(() => {
                    let sectionNum = 4;
                    if (report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0) sectionNum++;
                    if (report.dataGovernanceSummary && report.dataGovernanceSummary.assets.length > 0) sectionNum++;
                    return `BÖLÜM ${sectionNum}`;
                  })()}
                </span>
                <h2 className="report-section__title">Kanıt, Ek Dosya ve Saha Doğrulama Kaydı</h2>
              </div>

              {/* Evidence KPI Band */}
              <div className="report-kpi-band" style={{ marginBottom: "1.25rem" }}>
                <div className="report-kpi-band__item">
                  <span className="report-kpi-band__count" style={{ color: "var(--color-primary, #1e3a8a)" }}>
                    {report.evidenceSummary.stats.totalEvidence}
                  </span>
                  <span className="report-kpi-band__label">Saha Kanıtı</span>
                </div>
                <div className="report-kpi-band__divider" />
                <div className="report-kpi-band__item">
                  <span className="report-kpi-band__count" style={{ color: "#15803d" }}>
                    {report.evidenceSummary.stats.acceptedCount}
                  </span>
                  <span className="report-kpi-band__label">Kabul Edildi</span>
                </div>
                <div className="report-kpi-band__divider" />
                <div className="report-kpi-band__item">
                  <span className="report-kpi-band__count" style={{ color: "#b45309" }}>
                    {report.evidenceSummary.stats.unreviewedCount + report.evidenceSummary.stats.reviewedCount}
                  </span>
                  <span className="report-kpi-band__label">İncelemede</span>
                </div>
                <div className="report-kpi-band__divider" />
                <div className="report-kpi-band__item">
                  <span className={`report-kpi-band__count ${report.evidenceSummary.stats.unsupportedCriticalFindingsCount > 0 ? "text-danger" : "#15803d"}`}>
                    {report.evidenceSummary.stats.unsupportedCriticalFindingsCount}
                  </span>
                  <span className="report-kpi-band__label">Kanıtsız Kritik Konu</span>
                </div>
                <div className="report-kpi-band__divider" />
                <div className="report-kpi-band__item">
                  <span className="report-kpi-band__count">
                    %{report.evidenceSummary.stats.evidenceCoverageRate}
                  </span>
                  <span className="report-kpi-band__label">Kanıt Kapsama Oranı</span>
                </div>
              </div>

              {/* Principle Box */}
              <div className="report-summary-box" style={{ marginBottom: "1.25rem", background: "var(--color-primary-50, #eff6ff)", borderLeft: "4px solid var(--color-primary-600, #2563eb)" }}>
                <div style={{ fontSize: "0.8125rem", color: "var(--color-primary-900, #1e3a8a)", lineHeight: 1.5 }}>
                  <strong>Doğruluk İlkesi:</strong> Rapor artık yalnızca "süreç böyle işliyor" beyanını değil; <em>"bu beyanı hangi saha kanıtıyla biliyoruz ve kanıt kabul edildi mi?"</em> güvencesini sunar. Ayrım: <strong>Beyan var → Kanıt var → Kanıt incelendi → Kanıt kabul edildi</strong> zinciriyle işletilmektedir.
                </div>
              </div>

              {/* 6.1 Evidence Register */}
              {report.evidenceSummary.evidenceRegister.length > 0 && (
                <div className="report-summary-box" style={{ marginBottom: "1.25rem" }}>
                  <h3 className="report-summary-box__title">Kanıt Kayıt Defteri (Evidence Register)</h3>
                  <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="report-table report-table--striped" style={{ width: "100%", fontSize: "0.8125rem" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "12%" }}>Referans</th>
                          <th style={{ width: "22%" }}>Kanıt Başlığı & Tür</th>
                          <th style={{ width: "18%" }}>Kaynak & Toplayan</th>
                          <th style={{ width: "14%" }}>Doğrulama Durumu</th>
                          <th style={{ width: "12%" }}>Güvenilirlik</th>
                          <th style={{ width: "22%" }}>İlişkili Hedefler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.evidenceSummary.evidenceRegister.map((ev) => (
                          <tr key={ev.id}>
                            <td>
                              <span className="font-bold text-mono" style={{ color: "var(--color-primary, #1e3a8a)" }}>
                                {ev.refCode}
                              </span>
                              {ev.fileName && (
                                <div className="text-xs text-muted" style={{ wordBreak: "break-all" }}>
                                  📎 {ev.fileName}
                                </div>
                              )}
                            </td>
                            <td>
                              <div className="font-bold">{ev.title}</div>
                              <span className="badge badge--secondary text-xs">{ev.evidenceType}</span>
                              {ev.notes && <div className="text-xs text-muted" style={{ marginTop: "2px" }}>{ev.notes}</div>}
                            </td>
                            <td>
                              <div>{ev.sourceType}</div>
                              {ev.collectedByRole && (
                                <div className="text-xs text-muted">Rol: {ev.collectedByRole}</div>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${
                                ev.verificationStatus === "ACCEPTED" ? "badge--success" :
                                ev.verificationStatus === "REJECTED" ? "badge--danger" :
                                ev.verificationStatus === "REVIEWED" ? "badge--warning" : "badge--neutral"
                              }`}>
                                {ev.verificationStatus === "ACCEPTED" ? "✓ Kabul Edildi" :
                                 ev.verificationStatus === "REJECTED" ? "✕ Reddedildi" :
                                 ev.verificationStatus === "REVIEWED" ? "İncelendi" : "İncelenmedi"}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                ev.credibilityLevel === "HIGH" ? "badge--success" :
                                ev.credibilityLevel === "LOW" ? "badge--danger" : "badge--warning"
                              }`}>
                                {ev.credibilityLevel === "HIGH" ? "Yüksek" :
                                 ev.credibilityLevel === "LOW" ? "Düşük" : "Orta"}
                              </span>
                            </td>
                            <td>
                              <div className="text-xs" style={{ color: "var(--text-color)" }}>
                                {ev.linkedTargetsSummary}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 6.2 Evidence Coverage */}
              {report.evidenceSummary.evidenceCoverage.length > 0 && (
                <div className="report-summary-box" style={{ marginBottom: "1.25rem" }}>
                  <h3 className="report-summary-box__title">Kanıt Kapsama ve Desteklenme Oranları</h3>
                  <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="report-table report-table--striped" style={{ width: "100%", fontSize: "0.8125rem" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "35%" }}>Keşif Kategorisi</th>
                          <th style={{ width: "20%" }}>Toplam Hedef Sayısı</th>
                          <th style={{ width: "25%" }}>Kanıtla Desteklenen</th>
                          <th style={{ width: "20%" }}>Kapsama Oranı</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.evidenceSummary.evidenceCoverage.map((c) => (
                          <tr key={c.category}>
                            <td><strong>{c.category}</strong></td>
                            <td>{c.totalTargetCount}</td>
                            <td>{c.supportedTargetCount}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span className={`badge ${c.coveragePercentage >= 80 ? "badge--success" : c.coveragePercentage >= 40 ? "badge--warning" : "badge--neutral"}`}>
                                  %{c.coveragePercentage}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 6.3 Unsupported Critical Findings */}
              {report.evidenceSummary.unsupportedCriticalFindings.length > 0 && (
                <div className="report-summary-box" style={{ borderLeft: "4px solid var(--danger, #ef4444)" }}>
                  <h3 className="report-summary-box__title" style={{ color: "#b91c1c", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>⚠️ Kanıtla Desteklenmeyen Kritik Başlıklar ({report.evidenceSummary.unsupportedCriticalFindings.length})</span>
                  </h3>
                  <p className="text-xs text-muted" style={{ marginBottom: "0.75rem" }}>
                    Aşağıdaki kritik başlıklar için henüz saha kanıtı sunulmamış veya sunulan kanıtlar reddedilmiştir. Karar vericilerin bu başlıklara özel ihtiyat göstermesi önerilir.
                  </p>
                  <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="report-table report-table--striped" style={{ width: "100%", fontSize: "0.8125rem" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "15%" }}>Hedef Türü</th>
                          <th style={{ width: "30%" }}>Konu / Başlık</th>
                          <th style={{ width: "35%" }}>Açıklama</th>
                          <th style={{ width: "20%" }}>Kritiklik & Neden</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.evidenceSummary.unsupportedCriticalFindings.map((u, idx) => (
                          <tr key={`${u.targetType}-${u.targetId}-${idx}`}>
                            <td>
                              <span className="badge badge--secondary text-xs">{u.targetType}</span>
                              <div className="text-xs text-mono text-muted">{u.targetId}</div>
                            </td>
                            <td><strong>{u.title}</strong></td>
                            <td className="text-xs text-muted">{u.description}</td>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span className="badge badge--danger text-xs">{u.severity}</span>
                                <span className="text-xs text-danger font-bold">{u.reason}</span>
                              </div>
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

          {/* ── Bölüm 7: Pilot Saha Kabulü ve Go-Live Hazırlığı (FAZ-66) ── */}
          {report.readinessSummary && (
            <section id="sec-readiness" className="report-section">
              <div className="report-section__header">
                <span className="report-section__num">
                  {(() => {
                    let sectionNum = 4;
                    if (report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0) sectionNum++;
                    if (report.dataGovernanceSummary && report.dataGovernanceSummary.assets.length > 0) sectionNum++;
                    if (report.evidenceSummary && report.evidenceSummary.stats.totalEvidence > 0) sectionNum++;
                    return `BÖLÜM ${sectionNum}`;
                  })()}
                </span>
                <h2 className="report-section__title">Pilot Saha Kabulü ve Go-Live Hazırlığı</h2>
              </div>

              {/* Disclaimer Box */}
              <div className="report-summary-box" style={{ marginBottom: "1.25rem", background: "var(--color-primary-50, #eff6ff)", borderLeft: "4px solid var(--color-primary-600, #2563eb)" }}>
                <div style={{ fontSize: "0.8125rem", color: "var(--color-primary-900, #1e3a8a)", lineHeight: 1.5 }}>
                  <strong>Hazırlık Kriteri:</strong> {report.readinessSummary.disclaimer}
                </div>
              </div>

              {/* Readiness KPI Band */}
              <div className="report-kpi-band" style={{ marginBottom: "1.25rem" }}>
                <div className="report-kpi-band__item">
                  <span className="report-kpi-band__count" style={{ color: "var(--color-primary, #1e3a8a)" }}>
                    %{report.readinessSummary.stats.readinessPercentage}
                  </span>
                  <span className="report-kpi-band__label">Genel Hazırlık Skoru</span>
                </div>
                <div className="report-kpi-band__divider" />
                <div className="report-kpi-band__item">
                  <span className="report-kpi-band__count" style={{ color: "#15803d" }}>
                    {report.readinessSummary.stats.readyCount} / {report.readinessSummary.stats.applicableChecks}
                  </span>
                  <span className="report-kpi-band__label">Tamamlanan Kontrol</span>
                </div>
                <div className="report-kpi-band__divider" />
                <div className="report-kpi-band__item">
                  <span className={`report-kpi-band__count ${report.readinessSummary.stats.criticalOpenCount > 0 ? "text-danger" : "#15803d"}`}>
                    {report.readinessSummary.stats.criticalOpenCount}
                  </span>
                  <span className="report-kpi-band__label">Kritik Açık</span>
                </div>
                <div className="report-kpi-band__divider" />
                <div className="report-kpi-band__item">
                  <span className={`report-kpi-band__count ${report.readinessSummary.stats.blockedCount > 0 ? "text-danger" : "text-muted"}`}>
                    {report.readinessSummary.stats.blockedCount}
                  </span>
                  <span className="report-kpi-band__label">Bloke Madde</span>
                </div>
                <div className="report-kpi-band__divider" />
                <div className="report-kpi-band__item">
                  <span className="report-kpi-band__count" style={{ color: "#b45309" }}>
                    {report.readinessSummary.stats.actionRequiredCount}
                  </span>
                  <span className="report-kpi-band__label">Öncelikli Aksiyon</span>
                </div>
              </div>

              {/* 7.1 Category Readiness Matrix */}
              {report.readinessSummary.categories.length > 0 && (
                <div className="report-summary-box" style={{ marginBottom: "1.25rem" }}>
                  <h3 className="report-summary-box__title">Kategori Bazlı Hazırlık Matrisi</h3>
                  <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="report-table report-table--striped" style={{ width: "100%", fontSize: "0.8125rem" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "25%" }}>Kategori</th>
                          <th style={{ width: "15%" }}>Toplam Kontrol</th>
                          <th style={{ width: "15%" }}>Hazır / Tamam</th>
                          <th style={{ width: "15%" }}>Devam Eden / Bloke</th>
                          <th style={{ width: "15%" }}>Kritik Açık</th>
                          <th style={{ width: "15%" }}>Hazırlık Oranı</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.readinessSummary.categories.map((cat) => (
                          <tr key={cat.category}>
                            <td>
                              <strong>{cat.categoryLabel}</strong>
                              <span className="badge badge--secondary text-xs" style={{ marginLeft: "6px" }}>{cat.category}</span>
                            </td>
                            <td>{cat.totalCount}</td>
                            <td><span className="font-bold text-success">{cat.readyCount}</span></td>
                            <td>
                              {cat.inProgressCount > 0 && <span className="badge badge--warning text-xs" style={{ marginRight: "4px" }}>{cat.inProgressCount} Devam</span>}
                              {cat.blockedCount > 0 && <span className="badge badge--danger text-xs">{cat.blockedCount} Bloke</span>}
                              {cat.inProgressCount === 0 && cat.blockedCount === 0 && <span className="text-muted text-xs">—</span>}
                            </td>
                            <td>
                              {cat.criticalOpenCount > 0 ? (
                                <span className="badge badge--danger text-xs">{cat.criticalOpenCount} Kritik</span>
                              ) : (
                                <span className="text-success text-xs">✓ Yok</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${cat.readinessPercentage >= 80 ? "badge--success" : cat.readinessPercentage >= 40 ? "badge--warning" : "badge--neutral"}`}>
                                %{cat.readinessPercentage}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 7.2 Critical Gaps */}
              {report.readinessSummary.criticalGaps.length > 0 && (
                <div className="report-summary-box" style={{ marginBottom: "1.25rem", borderLeft: "4px solid var(--danger, #ef4444)" }}>
                  <h3 className="report-summary-box__title" style={{ color: "#b91c1c", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>⚠️ Kritik Hazırlık Açıkları & Bloke Maddeler ({report.readinessSummary.criticalGaps.length})</span>
                  </h3>
                  <p className="text-xs text-muted" style={{ marginBottom: "0.75rem" }}>
                    Bu maddeler kapatılmadan canlıya geçiş (Go-Live) hazırlığı tamamlanmış kabul edilmez.
                  </p>
                  <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="report-table report-table--striped" style={{ width: "100%", fontSize: "0.8125rem" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "12%" }}>Kod</th>
                          <th style={{ width: "18%" }}>Kategori</th>
                          <th style={{ width: "30%" }}>Kontrol Başlığı & Detay</th>
                          <th style={{ width: "15%" }}>Durum</th>
                          <th style={{ width: "25%" }}>Sorumlu Rol & Aksiyon</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.readinessSummary.criticalGaps.map((gap) => (
                          <tr key={gap.id}>
                            <td><span className="font-bold text-mono text-danger">{gap.checkCode}</span></td>
                            <td><span className="badge badge--secondary text-xs">{gap.categoryLabel}</span></td>
                            <td>
                              <div className="font-bold">{gap.title}</div>
                              {gap.description && <div className="text-xs text-muted">{gap.description}</div>}
                            </td>
                            <td>
                              <span className={`badge ${gap.status === "BLOCKED" ? "badge--danger" : "badge--warning"}`}>
                                {gap.statusLabel}
                              </span>
                            </td>
                            <td>
                              <div className="text-xs font-bold">Rol: {gap.ownerRole || "Belirtilmemiş"}</div>
                              {gap.actionNote && <div className="text-xs text-danger" style={{ marginTop: "2px" }}>Aksiyon: {gap.actionNote}</div>}
                              {gap.dueDate && <div className="text-xs text-muted">Termin: {gap.dueDate}</div>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 7.3 Readiness Action Plan */}
              {report.readinessSummary.actions.length > 0 && (
                <div className="report-summary-box" style={{ marginBottom: "1.25rem" }}>
                  <h3 className="report-summary-box__title">Öncelikli Aksiyon Planı ve Sorumlu Roller</h3>
                  <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="report-table report-table--striped" style={{ width: "100%", fontSize: "0.8125rem" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "12%" }}>Kod</th>
                          <th style={{ width: "28%" }}>Kontrol Başlığı</th>
                          <th style={{ width: "30%" }}>Gerekli Aksiyon</th>
                          <th style={{ width: "18%" }}>Sorumlu Rol</th>
                          <th style={{ width: "12%" }}>Hedef Tarih</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.readinessSummary.actions.map((act) => (
                          <tr key={act.id}>
                            <td><span className="font-bold text-mono">{act.checkCode}</span></td>
                            <td>
                              <div className="font-bold">{act.title}</div>
                              <span className="badge badge--secondary text-xs">{act.categoryLabel}</span>
                            </td>
                            <td><div className="text-xs text-muted">{act.actionNote}</div></td>
                            <td><span className="badge badge--neutral text-xs">{act.ownerRole}</span></td>
                            <td><span className="text-xs font-bold">{act.dueDate || "—"}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── Proje Notları & Açık Konular ── */}
          <section id="sec-notes" className="report-section">
            <div className="report-section__header">
              <span className="report-section__num">
                {(() => {
                  let sectionNum = 5;
                  if (report.processMapsSummary && report.processMapsSummary.stats.totalMaps > 0) sectionNum++;
                  if (report.dataGovernanceSummary && report.dataGovernanceSummary.assets.length > 0) sectionNum++;
                  if (report.evidenceSummary && report.evidenceSummary.stats.totalEvidence > 0) sectionNum++;
                  if (report.readinessSummary && report.readinessSummary.checklist.length > 0) sectionNum++;
                  return `BÖLÜM ${sectionNum}`;
                })()}
              </span>
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
                                  {attachmentExistsMap[att.id] !== false ? (
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
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: "0.625rem",
                                        padding: "0.1rem 0.35rem",
                                        background: "rgba(239, 68, 68, 0.1)",
                                        color: "#dc2626",
                                        borderRadius: "3px",
                                        border: "1px solid rgba(239, 68, 68, 0.3)",
                                        fontWeight: 600,
                                      }}
                                    >
                                      ⚠ Managed Vault içinde dosya bulunamadı
                                    </span>
                                  )}
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
