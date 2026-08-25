import React, { useState } from "react";
import { X, CheckSquare } from "lucide-react";
import type {
  ReadinessCheckItem,
  CreateReadinessCheckPayload,
  UpdateReadinessCheckPayload,
  ReadinessCategory,
  ReadinessStatus,
} from "../../types/readiness";
import {
  READINESS_CATEGORY_LABELS,
  READINESS_STATUS_LABELS,
} from "../../types/readiness";

interface ReadinessCheckModalProps {
  check: ReadinessCheckItem | null;
  projectId: string;
  onSave: (payload: CreateReadinessCheckPayload | UpdateReadinessCheckPayload) => Promise<void>;
  onClose: () => void;
}

export const ReadinessCheckModal: React.FC<ReadinessCheckModalProps> = ({
  check,
  projectId,
  onSave,
  onClose,
}) => {
  const [category, setCategory] = useState<ReadinessCategory>(check?.category || "DATA");
  const [checkCode, setCheckCode] = useState(check?.check_code || "");
  const [title, setTitle] = useState(check?.title || "");
  const [description, setDescription] = useState(check?.description || "");
  const [status, setStatus] = useState<ReadinessStatus>(check?.status || "NOT_STARTED");
  const [critical, setCritical] = useState(check?.critical === 1);
  const [ownerRole, setOwnerRole] = useState(check?.owner_role || "");
  const [evidenceRequired, setEvidenceRequired] = useState(check?.evidence_required === 1);
  const [actionRequired, setActionRequired] = useState(check?.action_required === 1);
  const [actionNote, setActionNote] = useState(check?.action_note || "");
  const [dueDate, setDueDate] = useState(check?.due_date || "");
  const [notes, setNotes] = useState(check?.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Lütfen kontrol başlığını giriniz.");
      return;
    }
    if (!checkCode.trim()) {
      setError("Lütfen kontrol kodunu giriniz (örn: CHK-DATA-01).");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (check) {
        await onSave({
          category,
          check_code: checkCode.trim(),
          title: title.trim(),
          description: description.trim() || null,
          status,
          critical: critical ? 1 : 0,
          owner_role: ownerRole.trim() || null,
          evidence_required: evidenceRequired ? 1 : 0,
          action_required: actionRequired ? 1 : 0,
          action_note: actionNote.trim() || null,
          due_date: dueDate || null,
          notes: notes.trim() || null,
        } as UpdateReadinessCheckPayload);
      } else {
        await onSave({
          project_id: projectId,
          category,
          check_code: checkCode.trim(),
          title: title.trim(),
          description: description.trim() || null,
          status,
          critical: critical ? 1 : 0,
          owner_role: ownerRole.trim() || null,
          evidence_required: evidenceRequired ? 1 : 0,
          action_required: actionRequired ? 1 : 0,
          action_note: actionNote.trim() || null,
          due_date: dueDate || null,
          notes: notes.trim() || null,
        } as CreateReadinessCheckPayload);
      }
      onClose();
    } catch (err: any) {
      console.error("Readiness check kaydetme hatası:", err);
      setError(err?.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: "640px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckSquare size={20} className="text-primary" />
            <h2 className="modal-title">
              {check ? "Hazırlık Kontrolünü Düzenle" : "Yeni Hazırlık Kontrolü"}
            </h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {error && (
              <div className="alert alert--danger" style={{ fontSize: "0.875rem" }}>
                {error}
              </div>
            )}

            {/* Kategori ve Kod */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="form-label font-bold" style={{ fontSize: "0.8125rem" }}>
                  Kategori *
                </label>
                <select
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReadinessCategory)}
                  required
                >
                  {(Object.keys(READINESS_CATEGORY_LABELS) as ReadinessCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} — {READINESS_CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label font-bold" style={{ fontSize: "0.8125rem" }}>
                  Kontrol Kodu *
                </label>
                <input
                  type="text"
                  className="form-input text-mono"
                  value={checkCode}
                  onChange={(e) => setCheckCode(e.target.value)}
                  placeholder="Örn: CHK-DATA-01"
                  required
                />
              </div>
            </div>

            {/* Başlık */}
            <div>
              <label className="form-label font-bold" style={{ fontSize: "0.8125rem" }}>
                Kontrol Başlığı *
              </label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Zorunlu sorular ve temel süreç cevapları tamamlandı mı?"
                required
              />
            </div>

            {/* Açıklama */}
            <div>
              <label className="form-label" style={{ fontSize: "0.8125rem" }}>
                Açıklama / Değerlendirme Kriteri
              </label>
              <textarea
                className="form-input"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Kontrolün başarı kriteri ve kapsam detayı..."
              />
            </div>

            {/* Durum & Sorumlu Rol */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="form-label font-bold" style={{ fontSize: "0.8125rem" }}>
                  Durum
                </label>
                <select
                  className="form-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReadinessStatus)}
                >
                  {(Object.keys(READINESS_STATUS_LABELS) as ReadinessStatus[]).map((st) => (
                    <option key={st} value={st}>
                      {READINESS_STATUS_LABELS[st]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "0.8125rem" }}>
                  Sorumlu Rol
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={ownerRole}
                  onChange={(e) => setOwnerRole(e.target.value)}
                  placeholder="Örn: ERP Proje Yöneticisi, Kalite Müdürü"
                />
              </div>
            </div>

            {/* Kritiklik ve Kanıt Zorunluluğu Toggles */}
            <div style={{ display: "flex", gap: "1.5rem", padding: "0.75rem", background: "var(--color-bg-subtle, #f8fafc)", borderRadius: "6px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }}>
                <input
                  type="checkbox"
                  checked={critical}
                  onChange={(e) => setCritical(e.target.checked)}
                />
                <span className="font-bold text-danger">⚠️ Kritik Kontrol Maddesi</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }}>
                <input
                  type="checkbox"
                  checked={evidenceRequired}
                  onChange={(e) => setEvidenceRequired(e.target.checked)}
                />
                <span>📎 Saha Kanıtı Zorunlu</span>
              </label>
            </div>

            {/* Aksiyon Gerekli mi? */}
            <div style={{ border: "1px solid var(--border-color, #e2e8f0)", padding: "0.75rem", borderRadius: "6px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", marginBottom: actionRequired ? "0.75rem" : 0 }}>
                <input
                  type="checkbox"
                  checked={actionRequired}
                  onChange={(e) => setActionRequired(e.target.checked)}
                />
                <span className="font-bold">Öncelikli Aksiyon Gerektiriyor</span>
              </label>

              {actionRequired && (
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label className="form-label text-xs">Gerekli Aksiyon / Çözüm Notu</label>
                    <input
                      type="text"
                      className="form-input"
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      placeholder="Örn: Satınalma SoD yetkileri ayrıştırılmalı"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Hedef Tarih</label>
                    <input
                      type="date"
                      className="form-input"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Ek Notlar */}
            <div>
              <label className="form-label" style={{ fontSize: "0.8125rem" }}>
                Değerlendirme Notları
              </label>
              <textarea
                className="form-input"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Denetçi / danışman özel inceleme notları..."
              />
            </div>
          </div>

          <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Kaydediliyor..." : check ? "Güncelle" : "Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
