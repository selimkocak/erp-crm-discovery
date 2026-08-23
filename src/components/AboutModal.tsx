/**
 * ERP CRM Discovery — About Modal
 *
 * Profesyonel ve sade "Hakkında" penceresi.
 * Proje adı, sürüm, açık kaynak felsefesi, sıfır bulut/AI-free garantileri,
 * geliştirici ve iletişim bilgilerini kullanıcıyı rahatsız etmeden sunar.
 */

import React, { useEffect } from "react";
import { X, ShieldCheck, Cpu, HardDrive, FileText, Github, Mail, User, ExternalLink } from "lucide-react";
import { AppLogo } from "./AppLogo";

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  // ESC tuşu ile kapatma desteği
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      style={{ zIndex: 1100 }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "580px", width: "92%" }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <AppLogo size={28} />
            <div>
              <h3 id="about-modal-title" style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
                ERP CRM Discovery
              </h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Sürüm: v0.1.0 • MIT Lisansı
              </span>

            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Kapat"
            title="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Açıklama */}
          <div>
            <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5, color: "var(--text-primary)" }}>
              <strong>ERP CRM Discovery</strong>; kurumsal dönüşüm öncesinde şirketlerin saha gerçeklerini,
              iş süreçlerini, gereksinimlerini, risklerini ve kanıt dokümanlarını sistematik biçimde toplamak
              için tasarlanmış <strong>açık kaynaklı ve çevrimdışı</strong> bir masaüstü analiz aracıdır.
            </p>
          </div>

          {/* Temel İlkeler ve Güvenlik Garantileri */}
          <div
            style={{
              backgroundColor: "var(--bg-surface-subtle, #f8fafc)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              padding: "0.875rem 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
              <ShieldCheck size={16} style={{ color: "#0f766e", flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "0.8125rem", lineHeight: 1.4 }}>
                <strong>%100 Çevrimdışı & Sıfır Bulut (Offline-First):</strong> Tüm analiz verileri yalnızca yerel bilgisayarınızdaki SQLite veritabanında saklanır. Hiçbir veri harici sunucuya veya buluta gönderilmez.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
              <Cpu size={16} style={{ color: "#2563eb", flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "0.8125rem", lineHeight: 1.4 }}>
                <strong>Yapay Zekâ İçermez (AI-Free & Human-Led):</strong> Tahmin, yapay zekâ modeli veya otomatik yorum üretmez; tarafsız, kanıta dayalı ve insan uzmanlığının liderliğindedir.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
              <HardDrive size={16} style={{ color: "#4f46e5", flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "0.8125rem", lineHeight: 1.4 }}>
                <strong>Yönetilen Kanıt Kasası (Attachment Vault):</strong> Süreç ve soru ekleri yerel dosya kasasında fiziksel ikiz kopya ile güvenceye alınır.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
              <FileText size={16} style={{ color: "#047857", flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "0.8125rem", lineHeight: 1.4 }}>
                <strong>Çoklu Dışa Aktarım:</strong> Microsoft Word (.docx) ve Gömülü Türkçe Unicode PDF (.pdf) raporları yerel olarak oluşturulur.
              </div>
            </div>
          </div>

          {/* Geliştirici ve İletişim */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
              fontSize: "0.8125rem",
            }}
          >
            <div
              style={{
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px",
                padding: "0.625rem 0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <User size={15} style={{ color: "var(--text-muted)" }} />
              <div>
                <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Geliştirici ve Bakımcı</div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Selim Koçak</div>
              </div>
            </div>

            <div
              style={{
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px",
                padding: "0.625rem 0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Mail size={15} style={{ color: "var(--text-muted)" }} />
              <div>
                <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>İletişim / E-posta</div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                  <a
                    href="mailto:selimkocak@gmail.com"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    selimkocak@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Açık Kaynak & GitHub Bağlantısı */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.5rem 0.75rem",
              backgroundColor: "var(--bg-surface-subtle, #f8fafc)",
              borderRadius: "6px",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.8125rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Github size={15} style={{ color: "var(--text-muted)" }} />
              <span style={{ color: "var(--text-secondary)" }}>Açık Kaynak Kod Deposu:</span>
            </div>
            <a
              href="https://github.com/selimkocak/erp-crm-discovery"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "var(--color-primary-600, #0284c7)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              <span>GitHub / erp-crm-discovery</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary btn--sm"
            onClick={onClose}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
