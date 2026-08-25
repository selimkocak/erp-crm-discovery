import React, { useState, useEffect } from "react";
import { X, Paperclip, Upload } from "lucide-react";
import type {
  EvidenceItem,
  EvidenceType,
  EvidenceSourceType,
  EvidenceVerificationStatus,
  EvidenceCredibilityLevel,
  EvidenceSensitivityLevel,
} from "../../types";

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Partial<EvidenceItem>, fileToImport?: { sourcePath: string; fileName: string } | null) => Promise<void>;
  initialData?: EvidenceItem | null;
  projectId?: string;
  isReadOnly?: boolean;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isReadOnly = false,
}) => {
  const [title, setTitle] = useState("");
  const [evidenceType, setEvidenceType] = useState<EvidenceType>("DOCUMENT");
  const [sourceType, setSourceType] = useState<EvidenceSourceType>("DOCUMENT");
  const [sourceDescription, setSourceDescription] = useState("");
  const [collectedAt, setCollectedAt] = useState(new Date().toISOString().split("T")[0]);
  const [collectedByRole, setCollectedByRole] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<EvidenceVerificationStatus>("UNREVIEWED");
  const [credibilityLevel, setCredibilityLevel] = useState<EvidenceCredibilityLevel>("MEDIUM");
  const [sensitivityLevel, setSensitivityLevel] = useState<EvidenceSensitivityLevel>("NORMAL");
  const [notes, setNotes] = useState("");

  const [selectedFile, setSelectedFile] = useState<{ sourcePath: string; fileName: string } | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);
  const [existingFileSize, setExistingFileSize] = useState<number>(0);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setEvidenceType(initialData.evidence_type || "DOCUMENT");
      setSourceType(initialData.source_type || "DOCUMENT");
      setSourceDescription(initialData.source_description || "");
      setCollectedAt(initialData.collected_at ? initialData.collected_at.split("T")[0] : new Date().toISOString().split("T")[0]);
      setCollectedByRole(initialData.collected_by_role || "");
      setVerificationStatus(initialData.verification_status || "UNREVIEWED");
      setCredibilityLevel(initialData.credibility_level || "MEDIUM");
      setSensitivityLevel(initialData.sensitivity_level || "NORMAL");
      setNotes(initialData.notes || "");
      setExistingFileName(initialData.file_name || null);
      setExistingFileSize(initialData.file_size || 0);
    } else {
      setTitle("");
      setEvidenceType("DOCUMENT");
      setSourceType("DOCUMENT");
      setSourceDescription("");
      setCollectedAt(new Date().toISOString().split("T")[0]);
      setCollectedByRole("");
      setVerificationStatus("UNREVIEWED");
      setCredibilityLevel("MEDIUM");
      setSensitivityLevel("NORMAL");
      setNotes("");
      setExistingFileName(null);
      setExistingFileSize(0);
    }
    setSelectedFile(null);
    setErrorMsg(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSelectFile = async () => {
    try {
      // Dynamic import for Tauri dialog if available
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        multiple: false,
        title: "Saha Kanıtı Dosyası Seç",
      });
      if (selected && typeof selected === "string") {
        const segments = selected.replace(/\\/g, "/").split("/");
        const fileName = segments[segments.length - 1] || "evidence-file";
        setSelectedFile({ sourcePath: selected, fileName });
        if (!title.trim()) {
          setTitle(fileName.replace(/\.[^/.]+$/, ""));
        }
      }
    } catch (err: any) {
      console.warn("Tauri dialog açılamadı, standart dosya seçici fallback'i kullanılabilir:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Lütfen kanıt başlığını giriniz.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg(null);

      await onSave(
        {
          title: title.trim(),
          evidence_type: evidenceType,
          source_type: sourceType,
          source_description: sourceDescription.trim() || undefined,
          collected_at: collectedAt,
          collected_by_role: collectedByRole.trim() || undefined,
          verification_status: verificationStatus,
          credibility_level: credibilityLevel,
          sensitivity_level: sensitivityLevel,
          notes: notes.trim() || undefined,
        },
        selectedFile
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Kanıt kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "680px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {initialData ? "Saha Kanıtını Düzenle" : "Yeni Saha Kanıtı & Doğrulama Kaydı"}
          </h3>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: "75vh", overflowY: "auto", paddingRight: "0.5rem" }}>
            {errorMsg && (
              <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>
                {errorMsg}
              </div>
            )}

            <div className="alert alert-info" style={{ fontSize: "0.8125rem", marginBottom: "1rem", lineHeight: 1.5 }}>
              <strong>Kanıt İlkesi:</strong> Saha kanıtları, soru beyanlarının, OT istasyonlarının ve veri yönetişimi kurallarının gerçekliğini ispatlamak için kullanılır. Dosyalar yerel <em>Managed Vault</em> içine ikiz kopya olarak kopyalanır.
            </div>

            {/* Dosya Seçim Alanı */}
            <div className="form-group" style={{ marginBottom: "1.25rem", background: "var(--color-neutral-50, #f8fafc)", padding: "0.75rem", borderRadius: "6px", border: "1px dashed var(--border-color, #cbd5e1)" }}>
              <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Kanıt Dosyası / Ek Belge</span>
                {existingFileName && !selectedFile && (
                  <span className="text-xs text-muted">Mevcut: {existingFileName} ({(existingFileSize / 1024).toFixed(1)} KB)</span>
                )}
              </label>

              {selectedFile ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.5rem 0.75rem", borderRadius: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Paperclip size={16} style={{ color: "#16a34a" }} />
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#166534" }}>{selectedFile.fileName}</span>
                  </div>
                  <button type="button" className="btn btn--outline btn--xs" onClick={() => setSelectedFile(null)}>Değiştir</button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={handleSelectFile}
                  disabled={isReadOnly}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", justifyContent: "center", padding: "0.75rem" }}
                >
                  <Upload size={16} /> {existingFileName ? "Dosyayı Güncelle / Yeni Dosya Seç" : "Yerel Disktan Dosya Seç (.pdf, .png, .jpg, .xlsx, .docx)"}
                </button>
              )}
            </div>

            {/* Kanıt Başlığı */}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Kanıt Başlığı *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: ERP Stok Sayım Tutanağı (Q4), PLC Bağlantı Şeması, İrsaliye Örneği"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isReadOnly}
                required
              />
            </div>

            {/* Kanıt Türü & Kaynak Türü */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Kanıt Türü</label>
                <select
                  className="form-control"
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
                  disabled={isReadOnly}
                >
                  <option value="DOCUMENT">Resmi Belge / Tutanak</option>
                  <option value="SCREENSHOT">Sistem Ekran Görüntüsü</option>
                  <option value="PHOTO">Saha Fotoğrafı</option>
                  <option value="LOG_EXPORT">Log / Veri Dökümü</option>
                  <option value="INTERVIEW_NOTE">Görüşme / Ses Notu</option>
                  <option value="PHYSICAL_SAMPLE">Fiziksel Numune / Rapor</option>
                  <option value="OTHER">Diğer</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Kanıt Kaynağı</label>
                <select
                  className="form-control"
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as EvidenceSourceType)}
                  disabled={isReadOnly}
                >
                  <option value="DOCUMENT">Yazılı Doküman / Prosedür</option>
                  <option value="SYSTEM_RECORD">Canlı Sistem / DB Kaydı</option>
                  <option value="FIELD_OBSERVATION">Saha Gözlemi (Canlı)</option>
                  <option value="USER_STATEMENT">Kullanıcı Beyanı</option>
                  <option value="THIRD_PARTY">Üçüncü Taraf / Tedarikçi</option>
                  <option value="UNKNOWN">Bilinmiyor</option>
                </select>
              </div>
            </div>

            {/* Toplayan Rol & Tarih */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Toplayan / Denetleyen Rol</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: ERP Çözüm Mimarı, Saha Analisti"
                  value={collectedByRole}
                  onChange={(e) => setCollectedByRole(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Toplama Tarihi</label>
                <input
                  type="date"
                  className="form-control"
                  value={collectedAt}
                  onChange={(e) => setCollectedAt(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Doğrulama Durumu, Güvenilirlik, Hassasiyet */}
            <div style={{ border: "1px solid var(--border-color, #cbd5e1)", borderRadius: "6px", padding: "0.75rem", marginBottom: "1rem" }}>
              <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.875rem", fontWeight: 700, color: "var(--color-primary-700, #1e3a8a)" }}>
                Doğrulama ve Güvenilirlik Değerlendirmesi
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Doğrulama Durumu</label>
                  <select
                    className="form-control"
                    value={verificationStatus}
                    onChange={(e) => setVerificationStatus(e.target.value as EvidenceVerificationStatus)}
                    disabled={isReadOnly}
                  >
                    <option value="UNREVIEWED">İncelenmedi</option>
                    <option value="REVIEWED">İncelendi</option>
                    <option value="ACCEPTED">✓ Kabul Edildi</option>
                    <option value="REJECTED">✕ Reddedildi</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Güvenilirlik Seviyesi</label>
                  <select
                    className="form-control"
                    value={credibilityLevel}
                    onChange={(e) => setCredibilityLevel(e.target.value as EvidenceCredibilityLevel)}
                    disabled={isReadOnly}
                  >
                    <option value="LOW">Düşük</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HIGH">Yüksek</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Hassasiyet Seviyesi</label>
                  <select
                    className="form-control"
                    value={sensitivityLevel}
                    onChange={(e) => setSensitivityLevel(e.target.value as EvidenceSensitivityLevel)}
                    disabled={isReadOnly}
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="CONFIDENTIAL">Gizli (Confidential)</option>
                    <option value="RESTRICTED">Kısıtlı (Restricted)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Kaynak Açıklaması */}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Kaynak Açıklaması / Alındığı Ortam</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Muhasebe departmanı arşiv dolabı, SAP B1 Test Ortamı v10.0"
                value={sourceDescription}
                onChange={(e) => setSourceDescription(e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            {/* Notlar */}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Analiz & Saha Notları</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Kanıtın incelenmesi sırasındaki gözlemler, geçerlilik kapsamı veya çekinceler..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
              İptal
            </button>
            {!isReadOnly && (
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? "Kaydediliyor..." : initialData ? "Güncelle" : "Kanıtı Ekle"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
