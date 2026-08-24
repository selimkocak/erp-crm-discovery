import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Copy,
  FileArchive,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
  RefreshCw,
  X,
} from "lucide-react";
import {
  inspectProjectBackup,
  restoreProjectBackup,
  duplicateProject,
  resolveDefaultBackupDir,
  type SaveBackupResult,
} from "../storage/backupManager";
import type { BackupInspectionResult } from "../types/backup";

/**
 * Yedekleme Başarı Modalı (Görünür dosya adı, tam yol, boyut ve Klasörde Göster / Yedeği Geri Yükle)
 */
export const BackupSuccessModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onRestoreBackup?: (filePath: string) => void;
  result: SaveBackupResult | null;
}> = ({ isOpen, onClose, onRestoreBackup, result }) => {
  if (!isOpen || !result) return null;

  const handleReveal = async () => {
    if (!result.filePath) return;
    try {
      if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
        const { revealItemInDir } = await import("@tauri-apps/plugin-opener");
        await revealItemInDir(result.filePath);
      } else {
        const { showAttachmentInFolder } = await import("../storage/attachmentLinks");
        await showAttachmentInFolder(result.filePath);
      }
    } catch (err) {
      console.error("Klasörde gösterme hatası:", err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatCreatedTime = (isoString?: string): string => {
    try {
      const d = isoString ? new Date(isoString) : new Date();
      return d.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return isoString || "—";
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-container gov-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-success-title"
        style={{ maxWidth: "580px" }}
      >
        <div className="modal-header">
          <div className="modal-header__title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 size={22} style={{ color: "var(--color-success, #16a34a)" }} />
            <h3 id="backup-success-title" style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
              Yedekleme Başarıyla Tamamlandı
            </h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "1.25rem" }}>
          <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            <strong>&quot;{result.projectName}&quot;</strong> analiz projesinin taşınabilir yedek arşivi (.erpcrm) başarıyla oluşturuldu.
          </p>

          <div
            style={{
              backgroundColor: "var(--bg-surface-subtle, #f8fafc)",
              border: "1px solid var(--border-subtle, #e2e8f0)",
              borderRadius: "8px",
              padding: "1rem",
              fontSize: "0.85rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Dosya Adı:</span>
              <strong style={{ color: "var(--text-primary)", wordBreak: "break-all" }}>{result.fileName}</strong>
            </div>

            {result.filePath && (
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Kaydedilen Tam Konum:</span>
                <code
                  style={{
                    display: "block",
                    padding: "0.5rem 0.75rem",
                    background: "var(--bg-card, #ffffff)",
                    border: "1px solid var(--border-subtle, #e2e8f0)",
                    borderRadius: "4px",
                    color: "var(--text-primary)",
                    wordBreak: "break-all",
                    fontSize: "0.8rem",
                    fontFamily: "monospace",
                    marginTop: "0.25rem",
                  }}
                >
                  {result.filePath}
                </code>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Paket Boyutu:</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formatFileSize(result.fileSize)}</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Oluşturulma Zamanı:</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formatCreatedTime(result.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", flexWrap: "wrap" }}>
          {result.filePath && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReveal}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
              >
                <FolderOpen size={16} />
                Klasörde Göster
              </button>

              {onRestoreBackup && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    const path = result.filePath!;
                    onClose();
                    onRestoreBackup(path);
                  }}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                >
                  <RefreshCw size={16} />
                  Yedeği Geri Yükle
                </button>
              )}
            </>
          )}
          <button type="button" className="btn btn--save" onClick={onClose}>
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Yedekten Geri Yükleme Modalı
 */
export const RestoreProjectModal: React.FC<{
  isOpen: boolean;
  initialFilePath?: string | null;
  onClose: () => void;
  onSuccess: (message: string, newProjectId?: string) => void;
  onError: (errorMessage: string) => void;
  onOpenProject?: (newProjectId: string) => void;
}> = ({ isOpen, initialFilePath, onClose, onSuccess, onError, onOpenProject }) => {
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [inspection, setInspection] = useState<BackupInspectionResult | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [customProjectName, setCustomProjectName] = useState("");
  const [restoredResult, setRestoredResult] = useState<{ newProjectId: string; projectName: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // initialFilePath sağlandıysa otomatik yükle
  useEffect(() => {
    if (isOpen && initialFilePath) {
      loadFileFromPath(initialFilePath);
    }
  }, [isOpen, initialFilePath]);

  const loadFileFromPath = async (filePath: string) => {
    setIsInspecting(true);
    setInspection(null);
    try {
      const { readFile } = await import("@tauri-apps/plugin-fs");
      const bytes = await readFile(filePath);
      const fileName = filePath.replace(/\\/g, "/").split("/").pop() || "yedek.erpcrm";
      setSelectedFileName(fileName);
      setFileBuffer(bytes.buffer);

      const res = await inspectProjectBackup(bytes);
      setInspection(res);
      if (res.valid && res.manifest) {
        setCustomProjectName(`${res.manifest.projectName} (Geri Yüklenen)`);
      } else {
        onError(res.error || "Paket bütünlüğü doğrulanamadı.");
      }
    } catch (err: any) {
      onError(`Dosya okunurken hata: ${err?.message || err}`);
    } finally {
      setIsInspecting(false);
    }
  };

  if (!isOpen) return null;

  const handleSelectFile = async () => {
    try {
      const defaultDir = await resolveDefaultBackupDir();
      const { open } = await import("@tauri-apps/plugin-dialog");
      const { readFile } = await import("@tauri-apps/plugin-fs");

      const selected = await open({
        defaultPath: defaultDir || undefined,
        multiple: false,
        filters: [
          {
            name: "ERP CRM Discovery Yedeği",
            extensions: ["erpcrm"],
          },
        ],
      });

      if (!selected || typeof selected !== "string") return;

      setIsInspecting(true);
      setInspection(null);

      const bytes = await readFile(selected);
      const fileName = selected.replace(/\\/g, "/").split("/").pop() || "yedek.erpcrm";
      setSelectedFileName(fileName);
      setFileBuffer(bytes.buffer);

      const res = await inspectProjectBackup(bytes);
      setInspection(res);
      if (res.valid && res.manifest) {
        setCustomProjectName(`${res.manifest.projectName} (Geri Yüklenen)`);
      } else {
        onError(res.error || "Paket bütünlüğü doğrulanamadı.");
      }
    } catch (nativeErr: any) {
      console.warn("Tauri native open fallback:", nativeErr);
      fileInputRef.current?.click();
    } finally {
      setIsInspecting(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".erpcrm")) {
      onError("Lütfen geçerli bir .erpcrm proje yedek paketi seçin.");
      return;
    }

    setIsInspecting(true);
    setInspection(null);
    setSelectedFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      setFileBuffer(buffer);
      const res = await inspectProjectBackup(buffer);
      setInspection(res);
      if (res.valid && res.manifest) {
        setCustomProjectName(`${res.manifest.projectName} (Geri Yüklenen)`);
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
    if (!fileBuffer || !inspection?.valid || isRestoring) return;

    setIsRestoring(true);
    try {
      const res = await restoreProjectBackup(fileBuffer, {
        newProjectName: customProjectName.trim() || undefined,
      });

      setRestoredResult({
        newProjectId: res.newProjectId!,
        projectName: res.projectName!,
      });

      onSuccess(
        `"${res.projectName}" projesi başarıyla geri yüklendi (${res.attachmentCount || 0} ek dosya aktarıldı).`,
        res.newProjectId
      );
    } catch (err: any) {
      onError(`Geri yükleme başarısız oldu: ${err?.message || err}`);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClose = () => {
    setFileBuffer(null);
    setSelectedFileName("");
    setInspection(null);
    setCustomProjectName("");
    setRestoredResult(null);
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
        style={{ maxWidth: "580px" }}
      >
        <div className="modal-header">
          <div className="modal-header__title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Upload size={20} style={{ color: "var(--primary)" }} />
            <h3 id="restore-modal-title" style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
              Yedekten Proje Geri Yükle
            </h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="Kapat" disabled={isRestoring}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "1.25rem" }}>
          {restoredResult ? (
            /* Başarı Sonuç Ekranı */
            <div style={{ textAlign: "center", padding: "1.5rem 0.5rem" }}>
              <CheckCircle2 size={48} style={{ color: "var(--color-success, #16a34a)", margin: "0 auto 1rem" }} />
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.15rem", fontWeight: 700 }}>
                Geri Yükleme Başarılı
              </h4>
              <p style={{ margin: "0 0 1.5rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                <strong>&quot;{restoredResult.projectName}&quot;</strong> yeni bir analiz projesi olarak sisteme eklendi.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
                {onOpenProject && (
                  <button
                    type="button"
                    className="btn btn--save"
                    onClick={() => {
                      const id = restoredResult.newProjectId;
                      handleClose();
                      onOpenProject(id);
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                  >
                    <span>Projeyi Aç</span>
                    <ArrowRight size={16} />
                  </button>
                )}
                <button type="button" className="btn btn-secondary" onClick={handleClose}>
                  Kapat
                </button>
              </div>
            </div>
          ) : !inspection?.valid ? (
            <div style={{ textAlign: "center", padding: "1.5rem 0.5rem" }}>
              <div
                style={{
                  border: "2px dashed var(--border-color, #cbd5e1)",
                  borderRadius: "var(--radius-lg, 8px)",
                  padding: "2.5rem 1.5rem",
                  cursor: "pointer",
                  backgroundColor: "var(--bg-surface-subtle, #f8fafc)",
                  transition: "all 0.2s",
                }}
                onClick={handleSelectFile}
              >
                <FileArchive size={48} style={{ color: "var(--color-primary-600, #0284c7)", margin: "0 auto 1rem" }} />
                <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem", fontWeight: 600 }}>
                  .erpcrm Proje Paketi Seçin
                </h4>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Daha önce yedeklenmiş taşınabilir proje dosyasını seçin
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".erpcrm"
                  style={{ display: "none" }}
                  onChange={handleFileInputChange}
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
                  backgroundColor: "var(--bg-surface-subtle, #f8fafc)",
                  border: "1px solid var(--border-subtle, #e2e8f0)",
                  borderRadius: "var(--radius-md, 6px)",
                  padding: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--color-success, #16a34a)" }} />
                  <strong style={{ fontSize: "0.95rem" }}>Geçerli Proje Paketi Doğrulandı</strong>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem" }}>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Dosya Adı:</span>{" "}
                    <strong>{selectedFileName}</strong>
                  </div>
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

        {!restoredResult && (
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
        )}
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
    if (!newProjectName.trim() || isDuplicating) return;

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
      console.error("Çoğaltma hatası:", err);
      onError(
        err?.message && !err.message.includes("database is locked")
          ? err.message
          : "Proje çoğaltılamadı. Veritabanı işlemi tamamlanamadı; hiçbir değişiklik kaydedilmedi."
      );
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
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Kapat" disabled={isDuplicating}>
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
              disabled={isDuplicating}
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
            <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: isDuplicating ? "default" : "pointer" }}>
              <input
                type="checkbox"
                checked={copyAnswersAndAttachments}
                onChange={(e) => setCopyAnswersAndAttachments(e.target.checked)}
                disabled={isDuplicating}
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
