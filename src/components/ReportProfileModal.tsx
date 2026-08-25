/**
 * ERP CRM Discovery — ReportProfileModal
 *
 * Proje yöneticisinin rapor seviyesindeki Yönetici Özeti, Genel Değerlendirme
 * ve Açık Konular alanlarını düzenlemesini sağlayan modal form.
 */

import React, { useState } from "react";
import { X, FileText, Save } from "lucide-react";
import type { ReportProfile } from "../report/types";
import { saveReportProfile } from "../db/client";

interface ReportProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  projectId: string;
  initialProfile: ReportProfile;
}

export const ReportProfileModal: React.FC<ReportProfileModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  projectId,
  initialProfile,
}) => {
  const [executiveSummary, setExecutiveSummary] = useState<string>(
    initialProfile.executive_summary || ""
  );
  const [overallAssessment, setOverallAssessment] = useState<string>(
    initialProfile.overall_assessment || ""
  );
  const [openTopics, setOpenTopics] = useState<string>(
    initialProfile.open_topics || ""
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await saveReportProfile(projectId, {
        executive_summary: executiveSummary.trim() || null,
        overall_assessment: overallAssessment.trim() || null,
        open_topics: openTopics.trim() || null,
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Rapor profili kaydedilemedi:", err);
      setError("Kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content--wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-header__title">
            <FileText size={20} className="text-primary" />
            <h3>Yönetici Değerlendirmeleri & Açık Konular</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="semantic-form">
          <div className="modal-body">
            {error && <div className="form-error-banner">{error}</div>}

            <div className="form-group">
              <label className="form-label">
                Yönetici Özeti (Executive Summary)
                <span className="text-muted text-xs font-normal" style={{ marginLeft: "0.5rem" }}>
                  Raporun başında yer alacak üst düzey süreç ve durum özeti
                </span>
              </label>
              <textarea
                className="input-textarea"
                rows={4}
                placeholder="Örn: Şirketin satış ve teklif süreçleri incelenmiş olup, mevcut ERP yapısı ile saha operasyonu arasındaki entegrasyon eksiklikleri tespit edilmiştir..."
                value={executiveSummary}
                onChange={(e) => setExecutiveSummary(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Genel Değerlendirme & Dönüşüm Önerisi
                <span className="text-muted text-xs font-normal" style={{ marginLeft: "0.5rem" }}>
                  ERP/CRM geçişine yönelik stratejik danışman görüşü
                </span>
              </label>
              <textarea
                className="input-textarea"
                rows={4}
                placeholder="Örn: Satış ve sipariş süreçlerinin merkezi bir CRM/ERP çözümüne taşınması, teklif onay sürelerini kısaltacak ve termin tutarlılığını artıracaktır..."
                value={overallAssessment}
                onChange={(e) => setOverallAssessment(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Açık Konular & Karar Bekleyen Başlıklar (Open Topics)
                <span className="text-muted text-xs font-normal" style={{ marginLeft: "0.5rem" }}>
                  İkinci fazda veya yönetim kurulu ile netleştirilecek maddeler
                </span>
              </label>
              <textarea
                className="input-textarea"
                rows={4}
                placeholder="Örn: 1. Bölge satış ofislerinin iskonto yetki matrisinin finans direktörlüğü ile netleştirilmesi&#10;2. B2B portal ihtiyacının Faz-1 kapsamına alınıp alınmayacağı..."
                value={openTopics}
                onChange={(e) => setOpenTopics(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn--outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="btn btn--success"
              disabled={isSaving}
            >
              <Save size={16} />
              {isSaving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
