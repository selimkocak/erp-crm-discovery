// path: /home/selim/projects/erp-crm-discovery/src/components/governance/GovernanceAttachmentsTab.tsx
import React, { useState } from "react";
import { Plus, Paperclip, Trash2, ExternalLink, FileText, Search } from "lucide-react";
import type {
  GovernanceAttachment,
  GovernanceObject,
  GovernanceResponsibility,
  GovernanceAuthorization,
  GovernanceLimit,
  GovernanceSodRisk,
  GovernanceAttachmentEntityType,
} from "../../types/governance";
import { openAttachment } from "../../storage/attachmentLinks";


interface GovernanceAttachmentsTabProps {
  attachments: GovernanceAttachment[];
  objects: GovernanceObject[];
  responsibilities: GovernanceResponsibility[];
  authorizations: GovernanceAuthorization[];
  limits: GovernanceLimit[];
  sodRisks: GovernanceSodRisk[];
  onUploadAttachment: (entityType: GovernanceAttachmentEntityType, entityId: string, file: File) => Promise<void>;
  onDeleteAttachment: (attachment: GovernanceAttachment) => Promise<void>;
}

export const GovernanceAttachmentsTab: React.FC<GovernanceAttachmentsTabProps> = ({
  attachments,
  objects,
  responsibilities,
  authorizations,
  limits,
  sodRisks,
  onUploadAttachment,
  onDeleteAttachment,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedType, setSelectedType] = useState<GovernanceAttachmentEntityType>("object");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  const filtered = attachments.filter((att) => {
    const matchesSearch =
      att.original_file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.entity_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || att.entity_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getEntityLabel = (type: GovernanceAttachmentEntityType, id: string) => {
    switch (type) {
      case "object": {
        const obj = objects.find((o) => o.id === id);
        return obj ? `Nesne: ${obj.name_tr}` : `Nesne (${id})`;
      }
      case "responsibility": {
        const resp = responsibilities.find((r) => r.id === id);
        return resp ? `Sorumluluk: ${resp.object_name_tr || id} (${resp.responsibility_type})` : `Sorumluluk (${id})`;
      }
      case "authorization": {
        const auth = authorizations.find((a) => a.id === id);
        return auth ? `Yetki: ${auth.subject_name || id} - ${auth.object_name_tr || id}` : `Yetki (${id})`;
      }
      case "limit": {
        const lim = limits.find((l) => l.id === id);
        return lim ? `Limit: ${lim.limit_type} (${lim.subject_name || id})` : `Limit (${id})`;
      }
      case "sod_risk": {
        const sod = sodRisks.find((s) => s.id === id);
        return sod ? `SoD: ${sod.risk_title}` : `SoD (${id})`;
      }
      default:
        return `${type} (${id})`;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleOpenUploadModal = () => {
    setSelectedType("object");
    setSelectedEntityId(objects[0]?.id || "");
    setSelectedFile(null);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedEntityId) {
      setUploadError("Lütfen bir kayıt ve dosya seçiniz.");
      return;
    }
    try {
      setIsUploading(true);
      setUploadError(null);
      await onUploadAttachment(selectedType, selectedEntityId, selectedFile);
      setIsModalOpen(false);
    } catch (err: any) {
      setUploadError(err?.message || "Dosya kasaya aktarılırken hata oluştu.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenFile = async (relativePath: string) => {
    try {
      setOpenError(null);
      const result = await openAttachment({ relativePath });
      if (!result.success && result.error) {
        setOpenError(`Dosya açılamadı: ${result.error}`);
      }
    } catch (err: any) {
      setOpenError(`Dosya açılamadı: ${err?.message || err}`);
    }
  };

  return (
    <div className="gov-tab-pane">
      {openError && (
        <div className="gov-form-error" style={{ marginBottom: "0.5rem" }}>
          <span>{openError}</span>
          <button
            type="button"
            onClick={() => setOpenError(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", marginLeft: "auto", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}
      <div className="gov-tab-toolbar">

        <div className="gov-tab-toolbar__left">
          <div className="gov-search-box">
            <Search size={16} className="gov-search-icon" />
            <input
              type="text"
              placeholder="Dosya adı veya kayıt ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="gov-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tüm Kanıt Türleri</option>
            <option value="object">Nesne Kanıtları</option>
            <option value="responsibility">Sorumluluk Kanıtları</option>
            <option value="authorization">Yetki Matrisi Kanıtları</option>
            <option value="limit">Limit Kanıtları</option>
            <option value="sod_risk">SoD Risk Kanıtları</option>
          </select>
        </div>
        <div className="gov-tab-toolbar__right">
          <button type="button" className="gov-btn-primary" onClick={handleOpenUploadModal}>
            <Plus size={16} />
            <span>Yeni Kanıt Dosyası Ekle</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="gov-empty-state">
          <Paperclip size={40} className="gov-empty-icon" />
          <h4>Yönetişim Kanıt Dosyası Bulunmuyor</h4>
          <p>
            Mevcut ERP yetki ekran görüntüleri, imza sirküleri, onay prosedürleri veya görev tanımları gibi
            fiziksel kanıtları <strong>Managed Attachment Vault</strong>'a güvenle eklemek için yukarıdaki butonu kullanın.
          </p>
        </div>
      ) : (
        <div className="gov-table-container">
          <table className="gov-table" role="table">
            <thead>
              <tr>
                <th>Dosya Adı</th>
                <th>İlişkili Yönetişim Kaydı</th>
                <th>Boyut</th>
                <th>SHA-256 Sağlama Kodu</th>
                <th>İçe Aktarılma Tarihi</th>
                <th style={{ width: "90px", textAlign: "right" }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((att) => (
                <tr key={att.id}>
                  <td>
                    <div className="gov-file-cell">
                      <FileText size={16} className="gov-file-icon" />
                      <span className="gov-file-name" title={att.original_file_name}>
                        {att.original_file_name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="gov-entity-link-badge">
                      {getEntityLabel(att.entity_type, att.entity_id)}
                    </span>
                  </td>
                  <td>
                    <span className="gov-text-muted">{formatFileSize(att.file_size)}</span>
                  </td>
                  <td>
                    <code className="gov-hash-code" title={att.sha256}>
                      {att.sha256.substring(0, 12)}...
                    </code>
                  </td>
                  <td>
                    <span className="gov-text-muted">
                      {new Date(att.imported_at || att.created_at).toLocaleDateString("tr-TR")}
                    </span>
                  </td>
                  <td>
                    <div className="gov-row-actions">
                      <button
                        type="button"
                        className="gov-action-btn"
                        onClick={() => handleOpenFile(att.relative_path)}
                        title="Kasadan Aç / Önizle"
                      >
                        <ExternalLink size={15} />
                      </button>
                      <button
                        type="button"
                        className="gov-action-btn gov-action-btn--delete"
                        onClick={() => onDeleteAttachment(att)}
                        title="Kasadan Sil"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="gov-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="gov-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <h3 className="gov-modal-title">Yönetilen Kasaya Kanıt Dosyası Ekle</h3>
              <button className="gov-modal-close-btn" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="gov-form">
              {uploadError && <div className="gov-form-error">{uploadError}</div>}
              <div className="gov-form-group">
                <label>Kanıtın Bağlanacağı Kayıt Türü *</label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    const t = e.target.value as GovernanceAttachmentEntityType;
                    setSelectedType(t);
                    if (t === "object") setSelectedEntityId(objects[0]?.id || "");
                    if (t === "responsibility") setSelectedEntityId(responsibilities[0]?.id || "");
                    if (t === "authorization") setSelectedEntityId(authorizations[0]?.id || "");
                    if (t === "limit") setSelectedEntityId(limits[0]?.id || "");
                    if (t === "sod_risk") setSelectedEntityId(sodRisks[0]?.id || "");
                  }}
                >
                  <option value="object">Yönetişim Nesnesi</option>
                  <option value="responsibility">Sorumluluk Ataması</option>
                  <option value="authorization">Yetki Tanımı</option>
                  <option value="limit">Onay Limiti</option>
                  <option value="sod_risk">Görevler Ayrılığı (SoD) Riski</option>
                </select>

              </div>

              <div className="gov-form-group">
                <label>Hedef Kayıt Seçimi *</label>
                <select
                  value={selectedEntityId}
                  onChange={(e) => setSelectedEntityId(e.target.value)}
                  required
                >
                  {selectedType === "object" &&
                    objects.map((o) => (
                      <option key={o.id} value={o.id}>{o.name_tr} ({o.code})</option>
                    ))}
                  {selectedType === "responsibility" &&
                    responsibilities.map((r) => (
                      <option key={r.id} value={r.id}>{r.object_name_tr} - {r.subject_name} ({r.responsibility_type})</option>
                    ))}
                  {selectedType === "authorization" &&
                    authorizations.map((a) => (
                      <option key={a.id} value={a.id}>{a.subject_name} ➔ {a.object_name_tr} ({a.permission_level})</option>
                    ))}
                  {selectedType === "limit" &&
                    limits.map((l) => (
                      <option key={l.id} value={l.id}>{l.limit_type} ({l.subject_name})</option>
                    ))}
                  {selectedType === "sod_risk" &&
                    sodRisks.map((s) => (
                      <option key={s.id} value={s.id}>{s.risk_title} ({s.risk_severity})</option>
                    ))}
                </select>
              </div>

              <div className="gov-form-group">
                <label>Dosya Seçiniz (PDF, Resim, Word, Excel) *</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx,.txt,.csv"
                  onChange={handleFileChange}
                  required
                />
                <small className="gov-form-hint">
                  Seçilen dosya orijinal yerine dokunulmadan <strong>Managed Attachment Vault</strong> içerisine kopyalanır ve SHA-256 sağlama kodu ile mühürlenir.
                </small>
              </div>

              <div className="gov-form-actions">
                <button
                  type="button"
                  className="gov-btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="gov-btn-primary"
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? "Kasaya Aktarılıyor..." : "Kasaya Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
