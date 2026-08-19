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
} from "lucide-react";
import { buildReportModel } from "../report/builder";
import type { ReportModel } from "../report/types";
import { ReportProfileModal } from "../components/ReportProfileModal";
import { exportReport } from "../export";

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
        setExportError(`Dosya kaydedilemedi: ${result.error}`);
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
            <div className="report-toc__group">
              <span className="report-toc__group-title">4. İş Fonksiyonları</span>
              {businessFunctions.map((fn, idx) => (
                <a key={fn.code} href={`#sec-fn-${fn.code}`} className="report-toc__sublink">
                  4.{idx + 1} {fn.nameTr}
                </a>
              ))}
            </div>
            <a href="#sec-notes" className="report-toc__link">
              5. Proje Notları & Açık Konular
            </a>
          </nav>
        </aside>

        {/* ── Main Report Document ──────────────────────────────────────── */}
        <main className="report-document">
          {/* ── Document Cover / Header ─────────────────────────────────── */}
          <section className="report-cover">
            <div className={`report-cover__badge ${!metadata.isComplete ? "badge--warning font-bold" : ""}`}>
              {metadata.isComplete ? "ÖN ANALİZ RAPORU (FİNAL)" : `ARA ANALİZ RAPORU — %${metadata.progressPercent} TAMAMLANDI (TASLAK)`}
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

          {/* ── Bölüm 5: Proje Notları & Açık Konular ───────────────────── */}
          <section id="sec-notes" className="report-section">
            <div className="report-section__header">
              <span className="report-section__num">BÖLÜM 5</span>
              <h2 className="report-section__title">Proje Notları & Açık Konular</h2>
            </div>

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
          </footer>
        </main>
      </div>

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
