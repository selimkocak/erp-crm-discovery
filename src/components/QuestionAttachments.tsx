/**
 * ERP CRM Discovery — Question Attachments UI Component
 *
 * FAZ-33: Soru Bazlı Kanıt ve Dosya Ekleri — Managed Attachment Vault Entegrasyonu
 *
 * İşlevler:
 * - Native dosya seçici & Sürükle-bırak desteği
 * - Yönetilen Kasa (Managed Vault) kopyalama ve SHA-256 doğrulama
 * - Dosya allowlist ve 25 MB boyut denetimi
 * - Dosya listesi (İkon, orijinal isim, boyut, uzantı, kasa durumu)
 * - Eksik / Legacy kayıt tespiti ve "Yeniden İçe Aktar" (Re-import) desteği
 * - Açıklama ekleme / düzenleme
 * - Güvenli Önizleme / Managed Kopyayı Açma
 * - Güvenli silme (Onay ile)
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  Edit3,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Table,
  RefreshCw,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import type { QuestionAttachment } from "../types";
import {
  formatFileSize,
  getFileCategory,
  validateAttachment,
  readAttachmentFile,
  EXTENSION_TO_MIME,
} from "../storage/attachmentManager";
import {
  openAttachment,
  attachmentExists,
  showAttachmentInFolder,
} from "../storage/attachmentLinks";

interface QuestionAttachmentsProps {
  projectId: string;
  businessFunctionCode: string;
  questionId: string;
  attachments: QuestionAttachment[];
  onAddAttachment: (
    file: { name: string; size: number; type: string; data: Uint8Array; sourcePath?: string },
    description?: string
  ) => Promise<void>;
  onDeleteAttachment: (attachmentId: string) => Promise<void>;
  onUpdateDescription?: (attachmentId: string, description: string) => Promise<void>;
  onReimportAttachment?: (
    attachmentId: string,
    file: { name: string; size: number; type: string; data: Uint8Array; sourcePath?: string }
  ) => Promise<void>;
  readOnly?: boolean;
}

export const QuestionAttachments: React.FC<QuestionAttachmentsProps> = ({
  attachments = [],
  onAddAttachment,
  onDeleteAttachment,
  onUpdateDescription,
  onReimportAttachment,
  readOnly = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescText, setEditDescText] = useState("");
  const [missingMap, setMissingMap] = useState<Record<string, boolean>>({});
  const [reimportingId, setReimportingId] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<{
    attachment: QuestionAttachment;
    url: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const reimportInputRef = useRef<HTMLInputElement>(null);

  const currentQuestionBytes = attachments.reduce((sum, a) => sum + (a.file_size || 0), 0);

  // Check physical file existence in Managed Vault for each attachment
  useEffect(() => {
    let isMounted = true;
    async function checkFiles() {
      const missing: Record<string, boolean> = {};
      for (const att of attachments) {
        const exists = await attachmentExists(att.relative_path);
        missing[att.id] = !exists;
      }
      if (isMounted) {
        setMissingMap(missing);
      }
    }
    if (attachments.length > 0) {
      checkFiles();
    } else {
      setMissingMap({});
    }
    return () => {
      isMounted = false;
    };
  }, [attachments]);

  const processFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let addedCount = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const validation = validateAttachment(
          { name: f.name, size: f.size, type: f.type },
          currentQuestionBytes
        );

        if (!validation.valid) {
          setErrorMessage(validation.error || "Geçersiz dosya.");
          continue;
        }

        const arrayBuf = await f.arrayBuffer();
        const data = new Uint8Array(arrayBuf);
        const fileExt = (f.name.split(".").pop()?.toLowerCase() || "") as keyof typeof EXTENSION_TO_MIME;
        const resolvedType = f.type || EXTENSION_TO_MIME[fileExt] || "application/octet-stream";

        await onAddAttachment(
          {
            name: f.name,
            size: f.size,
            type: resolvedType,
            data,
          },
          ""
        );
        addedCount++;
      }

      if (addedCount > 0) {
        setSuccessMessage(
          addedCount === 1
            ? "Kanıt dosyası yönetilen kasaya başarıyla kopyalandı."
            : `${addedCount} dosya yönetilen kasaya başarıyla kopyalandı.`
        );
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      console.error("Dosya yükleme hatası:", err);
      setErrorMessage(err?.message || "Dosya eklenirken bir hata oluştu.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!readOnly) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (readOnly) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleStartReimport = (attId: string) => {
    setReimportingId(attId);
    if (reimportInputRef.current) {
      reimportInputRef.current.click();
    }
  };

  const handleReimportInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !reimportingId || !onReimportAttachment) {
      setReimportingId(null);
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const validation = validateAttachment({ name: file.name, size: file.size, type: file.type });
      if (!validation.valid) {
        setErrorMessage(validation.error || "Geçersiz dosya.");
        return;
      }

      const arrayBuf = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuf);
      const fileExt = (file.name.split(".").pop()?.toLowerCase() || "") as keyof typeof EXTENSION_TO_MIME;
      const resolvedType = file.type || EXTENSION_TO_MIME[fileExt] || "application/octet-stream";

      await onReimportAttachment(reimportingId, {
        name: file.name,
        size: file.size,
        type: resolvedType,
        data,
      });

      setSuccessMessage(`"${file.name}" dosyası yönetilen kasaya yeniden içe aktarıldı.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error("Yeniden içe aktarma hatası:", err);
      setErrorMessage(err?.message || "Yeniden içe aktarma başarısız oldu.");
    } finally {
      setIsUploading(false);
      setReimportingId(null);
      if (reimportInputRef.current) reimportInputRef.current.value = "";
    }
  };

  const handleStartEdit = (att: QuestionAttachment) => {
    setEditingId(att.id);
    setEditDescText(att.description || "");
  };

  const handleSaveEdit = async (attId: string) => {
    if (onUpdateDescription) {
      try {
        await onUpdateDescription(attId, editDescText.trim());
      } catch (err: any) {
        console.error("Açıklama güncellenemedi:", err);
      }
    }
    setEditingId(null);
  };

  const handleOpenFile = async (att: QuestionAttachment) => {
    try {
      // Görsel ise uygulama içi lightbox
      if (att.mime_type.startsWith("image/")) {
        const data = await readAttachmentFile(att.relative_path);
        if (data) {
          const blob = new Blob([data as unknown as BlobPart], { type: att.mime_type });
          const url = URL.createObjectURL(blob);
          setPreviewAttachment({ attachment: att, url });
          return;
        }
      }

      // Diğer dosyalar veya native açıcı
      const result = await openAttachment(att);
      if (!result.success) {
        setErrorMessage(result.error || "Dosya açılamadı.");
      }
    } catch (err: any) {
      console.error("Dosya açma hatası:", err);
      setErrorMessage(`Dosya açılamadı: ${err?.message || err}`);
    }
  };

  const handleShowInFolder = async (att: QuestionAttachment) => {
    try {
      const result = await showAttachmentInFolder(att.relative_path);
      if (!result.success) {
        setErrorMessage(result.error || "Klasör açılamadı.");
      }
    } catch (err: any) {
      console.error("Klasörde gösterme hatası:", err);
      setErrorMessage(`Klasör açılamadı: ${err?.message || err}`);
    }
  };

  const handleDelete = async (att: QuestionAttachment) => {
    if (window.confirm(`"${att.original_file_name}" kanıt dosyasını silmek istediğinize emin misiniz?`)) {
      try {
        await onDeleteAttachment(att.id);
      } catch (err: any) {
        console.error("Dosya silme hatası:", err);
        setErrorMessage(`Dosya silinemedi: ${err?.message || err}`);
      }
    }
  };

  const renderFileIcon = (ext: string) => {
    const cat = getFileCategory(ext);
    switch (cat) {
      case "image":
        return <ImageIcon size={15} style={{ color: "var(--color-primary-600)" }} />;
      case "pdf":
        return <FileText size={15} style={{ color: "var(--color-danger-600)" }} />;
      case "excel":
        return <Table size={15} style={{ color: "var(--color-success-600)" }} />;
      case "word":
        return <FileText size={15} style={{ color: "var(--color-primary-700)" }} />;
      default:
        return <Paperclip size={15} style={{ color: "var(--color-secondary-600)" }} />;
    }
  };

  return (
    <div
      className={`question-attachments ${isDragging ? "question-attachments--dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        marginTop: "0.875rem",
        padding: "0.75rem",
        background: "var(--color-neutral-50, #f8fafc)",
        borderRadius: "var(--radius-md, 6px)",
        border: isDragging ? "2px dashed var(--color-primary-500)" : "1px solid var(--border-color, #e2e8f0)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <Paperclip size={14} style={{ color: "var(--color-secondary-600, #0f766e)" }} />
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-color, #0f172a)" }}>
            Kanıt Dosyaları & Ekler (Yönetilen Kasa)
          </span>
          {attachments.length > 0 && (
            <span
              className="badge badge--secondary"
              style={{ fontSize: "0.6875rem", padding: "0.1rem 0.4rem" }}
            >
              {attachments.length} Dosya ({formatFileSize(currentQuestionBytes)})
            </span>
          )}
        </div>

        {!readOnly && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.webp,.pdf,.docx,.xlsx,.csv,.txt"
              style={{ display: "none" }}
              onChange={handleFileInputChange}
            />
            <input
              ref={reimportInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.pdf,.docx,.xlsx,.csv,.txt"
              style={{ display: "none" }}
              onChange={handleReimportInputChange}
            />
            <button
              type="button"
              className="btn btn--outline btn--xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
            >
              <UploadCloud size={13} />
              {isUploading ? "Yükleniyor..." : "+ Kanıt Dosyası Ekle"}
            </button>
          </div>
        )}
      </div>

      {successMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            color: "var(--color-success-700, #15803d)",
            background: "var(--color-success-50, #f0fdf4)",
            border: "1px solid var(--color-success-200, #bbf7d0)",
            padding: "0.375rem 0.5rem",
            borderRadius: "4px",
            fontSize: "0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          <Check size={13} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            color: "var(--color-danger-700, #b91c1c)",
            background: "var(--color-danger-50, #fef2f2)",
            border: "1px solid var(--color-danger-200, #fecaca)",
            padding: "0.375rem 0.5rem",
            borderRadius: "4px",
            fontSize: "0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          <AlertCircle size={13} />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit" }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {attachments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "0.5rem",
            color: "var(--text-muted, #64748b)",
            fontSize: "0.75rem",
            border: "1px dashed var(--border-color, #cbd5e1)",
            borderRadius: "4px",
            background: "white",
          }}
        >
          <span>Bu soruya henüz kanıt dokümanı eklenmedi. Dosya seçebilir veya buraya sürükleyebilirsiniz.</span>
          <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            (Orijinal dosya korunur; güvenli ikiz kopya uygulamanın yerel kasasına alınır • Maks. 25 MB)
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {attachments.map((att) => {
            const isMissing = Boolean(missingMap[att.id]);
            return (
              <div
                key={att.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.375rem 0.5rem",
                  background: isMissing ? "var(--color-danger-50, #fff5f5)" : "white",
                  border: isMissing
                    ? "1px solid var(--color-danger-300, #fca5a5)"
                    : "1px solid var(--border-color, #e2e8f0)",
                  borderRadius: "4px",
                  fontSize: "0.8125rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0, flex: 1 }}>
                  {renderFileIcon(att.file_extension)}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <span
                        style={{
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "240px",
                          cursor: isMissing ? "default" : "pointer",
                          color: isMissing ? "var(--color-danger-700)" : "inherit",
                        }}
                        onClick={() => !isMissing && handleOpenFile(att)}
                        title={isMissing ? "Dosya kasada bulunamadı" : "Görüntülemek için tıklayın"}
                      >
                        {att.original_file_name}
                      </span>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--text-muted)",
                          background: "var(--color-neutral-100)",
                          padding: "0.05rem 0.3rem",
                          borderRadius: "3px",
                        }}
                      >
                        {att.file_extension.toUpperCase()} • {formatFileSize(att.file_size)}
                      </span>
                      {isMissing && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.2rem",
                            fontSize: "0.6875rem",
                            color: "var(--color-danger-700)",
                            background: "var(--color-danger-100)",
                            padding: "0.05rem 0.35rem",
                            borderRadius: "3px",
                            fontWeight: 600,
                          }}
                        >
                          <AlertTriangle size={11} />
                          Kasada Yok
                        </span>
                      )}
                    </div>

                    {editingId === att.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem" }}>
                        <input
                          type="text"
                          className="form-control"
                          value={editDescText}
                          onChange={(e) => setEditDescText(e.target.value)}
                          placeholder="Kanıt açıklaması (örn. 2026 Prosedür Ek-1)..."
                          style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem", height: "auto" }}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(att.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn--primary btn--xs"
                          onClick={() => handleSaveEdit(att.id)}
                          style={{ padding: "0.2rem 0.4rem" }}
                        >
                          <Check size={12} />
                        </button>
                        <button
                          type="button"
                          className="btn btn--outline btn--xs"
                          onClick={() => setEditingId(null)}
                          style={{ padding: "0.2rem 0.4rem" }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      att.description && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", marginTop: "0.1rem" }}>
                          {att.description}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginLeft: "0.5rem" }}>
                  {isMissing ? (
                    !readOnly && onReimportAttachment && (
                      <button
                        type="button"
                        className="btn btn--warning btn--xs"
                        onClick={() => handleStartReimport(att.id)}
                        title="Dosyayı Yeniden İçe Aktar"
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", padding: "0.2rem 0.4rem" }}
                      >
                        <RefreshCw size={11} />
                        Yeniden İçe Aktar
                      </button>
                    )
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn--ghost btn--xs"
                        onClick={() => handleOpenFile(att)}
                        title="Dosyayı Görüntüle / Aç"
                        style={{ padding: "0.2rem 0.35rem" }}
                      >
                        <ExternalLink size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--xs"
                        onClick={() => handleShowInFolder(att)}
                        title="Dosyayı Klasörde Göster"
                        style={{ padding: "0.2rem 0.35rem" }}
                      >
                        <FolderOpen size={13} />
                      </button>
                    </>
                  )}

                  {!readOnly && (
                    <>
                      <button
                        type="button"
                        className="btn btn--ghost btn--xs"
                        onClick={() => handleStartEdit(att)}
                        title="Açıklama Düzenle"
                        style={{ padding: "0.2rem 0.35rem" }}
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--xs"
                        onClick={() => handleDelete(att)}
                        title="Kanıt Dosyasını Sil"
                        style={{ padding: "0.2rem 0.35rem", color: "var(--color-danger-600)" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Görsel Önizleme Modalı */}
      {previewAttachment && (
        <div
          className="modal-backdrop"
          onClick={() => {
            URL.revokeObjectURL(previewAttachment.url);
            setPreviewAttachment(null);
          }}
          style={{ zIndex: 1000 }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "800px", padding: "1rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <strong style={{ fontSize: "0.9375rem" }}>{previewAttachment.attachment.original_file_name}</strong>
              <button
                type="button"
                className="btn btn--ghost btn--xs"
                onClick={() => {
                  URL.revokeObjectURL(previewAttachment.url);
                  setPreviewAttachment(null);
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ textAlign: "center", maxHeight: "70vh", overflow: "auto" }}>
              <img
                src={previewAttachment.url}
                alt={previewAttachment.attachment.original_file_name}
                style={{ maxWidth: "100%", maxHeight: "65vh", objectFit: "contain", borderRadius: "4px" }}
              />
            </div>
            {previewAttachment.attachment.description && (
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.5rem", fontStyle: "italic" }}>
                {previewAttachment.attachment.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
