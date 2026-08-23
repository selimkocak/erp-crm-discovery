import React, { useState, useRef } from "react";
import {
  Upload,
  Copy,
  FileArchive,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  inspectProjectBackup,
  restoreProjectBackup,
  duplicateProject,
} from "../storage/backupManager";
import type { BackupInspectionResult } from "../types/backup";


/**
 * Tarayıcı ve masaüstünde blob indirme yardımcısı
 */

export function triggerFileDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Yedekten Geri Yükleme Modalı
 */
export const RestoreProjectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string, newProjectId?: string) => void;
  onError: (errorMessage: string) => void;
}> = ({ isOpen, onClose, onSuccess, onError }) => {
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [inspection, setInspection] = useState<BackupInspectionResult | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [customProjectName, setCustomProjectName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);


  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".erpcrm")) {
      onError("Lütfen geçerli bir .erpcrm proje yedek paketi seçin.");
      return;
    }

    setIsInspecting(true);
    setInspection(null);

    try {
      const buffer = await file.arrayBuffer();
      setFileBuffer(buffer);
      const res = await inspectProjectBackup(buffer);
      setInspection(res);
      if (res.valid && res.manifest) {
        setCustomProjectName(`${res.manifest.projectName} — İçe Aktarılan Kopya`);
      } else {
        onError(res.error || "Paket bütünlüğü doğrulanamadı.");
      }
    } catch (err: any) {
      onError(`Dosya incelenirken hata: ${err?.message || err}`);
    } finally {
      setIsInspecting(false);
    }
  };

  const handleRestore = async () => {
    if (!fileBuffer || !inspection?.valid) return;

    setIsRestoring(true);
    try {
      const res = await restoreProjectBackup(fileBuffer, {
        newProjectName: customProjectName.trim() || undefined,
      });

      onSuccess(
        `"${res.projectName}" projesi başarıyla geri yüklendi (${res.attachmentCount || 0} ek dosya aktarıldı).`,
        res.newProjectId
      );
      handleClose();
    } catch (err: any) {
      onError(`Geri yükleme başarısız oldu: ${err?.message || err}`);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClose = () => {
    setFileBuffer(null);
    setInspection(null);
    setCustomProjectName("");
    onClose();
  };


  const manifest = inspection?.manifest;

  return (
    <div className="modal-backdrop" onClick={handleClose} role="presentation">
      <div
        className="modal-container gov-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="restore-modal-title"
      >
        <div className="modal-header">
          <div className="modal-header__title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Upload size={20} style={{ color: "var(--primary)" }} />
            <h3 id="restore-modal-title" style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
              Yedekten Proje Geri Yükle
            </h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "1.25rem" }}>
          {!inspection?.valid ? (
            <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
              <div
                style={{
                  border: "2px dashed var(--border-color)",
                  borderRadius: "var(--radius-lg)",
                  padding: "2.5rem 1.5rem",
                  cursor: "pointer",
                  backgroundColor: "var(--bg-surface)",
                  transition: "all 0.2s",
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileArchive size={48} style={{ color: "var(--primary)", margin: "0 auto 1rem" }} />
                <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem", fontWeight: 600 }}>
                  .erpcrm Proje Paketi Seçin
                </h4>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Daha önce yedeklenmiş taşınabilir proje dosyasını yükleyin
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".erpcrm"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>

              {isInspecting && (
                <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Paket bütünlüğü ve içerik doğrulanıyor...
                </p>
              )}
            </div>
          ) : (
            <div>
              {/* Inspection Summary Card */}
              <div
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
                  <strong style={{ fontSize: "0.95rem" }}>Geçerli Proje Paketi Doğrulandı</strong>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem" }}>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Firma:</span>{" "}
                    <strong>{manifest?.companyName}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Orijinal Proje:</span>{" "}
                    <strong>{manifest?.projectName}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Paket Tarihi:</span>{" "}
                    <span>
                      {manifest?.createdAt ? new Date(manifest.createdAt).toLocaleDateString("tr-TR") : "—"}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Kaynak Sürüm:</span>{" "}
                    <span>v{manifest?.appVersion || "0.1.0"}</span>
                  </div>
                </div>

                {/* Record count summary badges */}
                <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                  <span className="badge badge-completed">
                    {manifest?.recordCounts?.businessFunctions || 0} Fonksiyon
                  </span>
                  <span className="badge badge-completed">
                    {manifest?.recordCounts?.answers || 0} Cevap
                  </span>
                  <span className="badge badge-completed">
                    {manifest?.recordCounts?.findings || 0} Bulgu
                  </span>
                  <span className="badge badge-completed">
                    {manifest?.recordCounts?.risks || 0} Risk
                  </span>
                  <span className="badge badge-completed">
                    {manifest?.recordCounts?.governanceObjects || 0} Yönetişim Nesnesi
                  </span>
                  <span className="badge badge-completed">
                    {manifest?.attachmentCount || 0} Ek Dosya
                  </span>
                </div>
              </div>

              {/* Target Project Name */}
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.875rem", fontWeight: 600 }}>
                  Yeni Proje Adı
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={customProjectName}
                  onChange={(e) => setCustomProjectName(e.target.value)}
                  placeholder="Geri yüklenecek projenin adı"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
                <small style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                  Mevcut projeleriniz korunur; bu paket yeni ve bağımsız bir analiz projesi olarak sisteme eklenir.
                </small>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isRestoring}>
            Vazgeç
          </button>
          {inspection?.valid && (
            <button
              type="button"
              className="btn btn--save"
              onClick={handleRestore}
              disabled={isRestoring || !customProjectName.trim()}
            >
              {isRestoring ? "Geri Yükleniyor..." : "Projeyi Geri Yükle"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Projeyi Çoğalt Modalı
 */
export const DuplicateProjectModal: React.FC<{
  isOpen: boolean;
  projectId: string;
  projectName: string;
  onClose: () => void;
  onSuccess: (message: string, newProjectId?: string) => void;
  onError: (errorMessage: string) => void;
}> = ({ isOpen, projectId, projectName, onClose, onSuccess, onError }) => {
  const [newProjectName, setNewProjectName] = useState(`${projectName} (Kopya)`);
  const [copyAnswersAndAttachments, setCopyAnswersAndAttachments] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  if (!isOpen) return null;

  const handleDuplicate = async () => {
    if (!newProjectName.trim()) return;

    setIsDuplicating(true);
    try {
      const res = await duplicateProject(projectId, {
        newProjectName: newProjectName.trim(),
        copyAnswersAndAttachments,
      });

      onSuccess(
        `"${res.projectName}" başarıyla oluşturuldu${copyAnswersAndAttachments ? " (cevaplar ve ekler dahil)" : " (şablon olarak)"}.`,
        res.newProjectId
      );
      onClose();
    } catch (err: any) {
      onError(`Çoğaltma işlemi başarısız oldu: ${err?.message || err}`);
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-container gov-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="duplicate-modal-title"
      >
        <div className="modal-header">
          <div className="modal-header__title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Copy size={20} style={{ color: "var(--primary)" }} />
            <h3 id="duplicate-modal-title" style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
              Projeyi Çoğalt
            </h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "1.25rem" }}>
          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.875rem", fontWeight: 600 }}>
              Yeni Kopya Proje Adı
            </label>
            <input
              type="text"
              className="form-control"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={copyAnswersAndAttachments}
                onChange={(e) => setCopyAnswersAndAttachments(e.target.checked)}
                style={{ marginTop: "0.25rem" }}
              />
              <div>
                <strong style={{ fontSize: "0.9rem", display: "block" }}>Cevapları ve ekleri de kopyala</strong>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  İşaretlenmezse firma profili, iş fonksiyonları ve yönetişim modeli yeni projeye şablon olarak
                  aktarılır; soru cevapları sıfırlanır.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isDuplicating}>
            Vazgeç
          </button>
          <button
            type="button"
            className="btn btn--save"
            onClick={handleDuplicate}
            disabled={isDuplicating || !newProjectName.trim()}
          >
            {isDuplicating ? "Çoğaltılıyor..." : "Projeyi Çoğalt"}
          </button>
        </div>
      </div>
    </div>
  );
};
