import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type {
  DataGovernanceAccess,
  DataGovernanceAsset,
  DataGovernanceActorType,
  DataGovernanceAccessLevel,
  DataGovernanceScopeType,
} from "../../types";

interface DataGovernanceAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Partial<DataGovernanceAccess>) => Promise<void>;
  assets: DataGovernanceAsset[];
  initialData?: DataGovernanceAccess | null;
  isReadOnly?: boolean;
}

export const DataGovernanceAccessModal: React.FC<DataGovernanceAccessModalProps> = ({
  isOpen,
  onClose,
  onSave,
  assets,
  initialData,
  isReadOnly = false,
}) => {
  const [assetId, setAssetId] = useState("");
  const [actorType, setActorType] = useState<DataGovernanceActorType>("ROLE");
  const [actorName, setActorName] = useState("");
  const [accessLevel, setAccessLevel] = useState<DataGovernanceAccessLevel>("READ_ONLY");
  const [scopeType, setScopeType] = useState<DataGovernanceScopeType>("COMPANY");
  const [scopeValue, setScopeValue] = useState("");

  const [approvalRequired, setApprovalRequired] = useState(false);
  const [approvalRole, setApprovalRole] = useState("");
  const [taskSeparationRequired, setTaskSeparationRequired] = useState(false);
  const [conflictNote, setConflictNote] = useState("");
  const [limitDescription, setLimitDescription] = useState("");
  const [status, setStatus] = useState<"active" | "passive">("active");
  const [notes, setNotes] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setAssetId(initialData.asset_id || "");
      setActorType(initialData.actor_type || "ROLE");
      setActorName(initialData.actor_name || "");
      setAccessLevel(initialData.access_level || "READ_ONLY");
      setScopeType(initialData.scope_type || "COMPANY");
      setScopeValue(initialData.scope_value || "");
      setApprovalRequired(Boolean(initialData.approval_required));
      setApprovalRole(initialData.approval_role || "");
      setTaskSeparationRequired(Boolean(initialData.task_separation_required));
      setConflictNote(initialData.conflict_note || "");
      setLimitDescription(initialData.limit_description || "");
      setStatus(initialData.status || "active");
      setNotes(initialData.notes || "");
    } else {
      setAssetId(assets.length > 0 ? assets[0].id : "");
      setActorType("ROLE");
      setActorName("");
      setAccessLevel("READ_ONLY");
      setScopeType("COMPANY");
      setScopeValue("");
      setApprovalRequired(false);
      setApprovalRole("");
      setTaskSeparationRequired(false);
      setConflictNote("");
      setLimitDescription("");
      setStatus("active");
      setNotes("");
    }
    setErrorMsg(null);
  }, [initialData, isOpen, assets]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId) {
      setErrorMsg("Lütfen bir veri varlığı seçiniz.");
      return;
    }
    if (!actorName.trim()) {
      setErrorMsg("Lütfen erişen rol veya grup adını giriniz.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg(null);
      await onSave({
        asset_id: assetId,
        actor_type: actorType,
        actor_name: actorName.trim(),
        access_level: accessLevel,
        scope_type: scopeType,
        scope_value: scopeValue.trim() || undefined,
        approval_required: approvalRequired ? 1 : 0,
        approval_role: approvalRole.trim() || undefined,
        task_separation_required: taskSeparationRequired ? 1 : 0,
        conflict_note: conflictNote.trim() || undefined,
        limit_description: limitDescription.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Erişim kuralı kaydedilirken hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "640px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {initialData ? "Erişim / Yetki Kuralını Düzenle" : "Yeni Erişim / Yetki Kuralı Ekle"}
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

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">İlgili Veri Varlığı *</label>
              <select
                className="form-control"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                disabled={isReadOnly}
                required
              >
                <option value="">-- Veri Varlığı Seçiniz --</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.asset_name} {a.domain ? `(${a.domain})` : ""} — {a.criticality}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Özne Türü</label>
                <select
                  className="form-control"
                  value={actorType}
                  onChange={(e) => setActorType(e.target.value as DataGovernanceActorType)}
                  disabled={isReadOnly}
                >
                  <option value="ROLE">Rol / Pozisyon</option>
                  <option value="GROUP">Yetki Grubu</option>
                  <option value="DEPARTMENT">Departman</option>
                  <option value="EXTERNAL_PARTY">Dış Paydaş (Müşteri/Tedarikçi)</option>
                  <option value="SYSTEM_SERVICE">Entegrasyon / Servis</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Rol / Grup Adı *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: Satın Alma Uzmanı, Muhasebe Grubu, Bölge Satış Müdürü"
                  value={actorName}
                  onChange={(e) => setActorName(e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Erişim Seviyesi</label>
                <select
                  className="form-control"
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value as DataGovernanceAccessLevel)}
                  disabled={isReadOnly}
                >
                  <option value="FULL">Tam Yetki (FULL - Okuma/Yazma/Silme)</option>
                  <option value="READ_ONLY">Salt Okunur (READ_ONLY)</option>
                  <option value="CREATE">Kayıt Açma (CREATE)</option>
                  <option value="UPDATE">Güncelleme (UPDATE)</option>
                  <option value="APPROVE">Onaylama Yetkisi (APPROVE)</option>
                  <option value="NO_ACCESS">Erişim Yok (NO_ACCESS)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Kapsam Türü</label>
                <select
                  className="form-control"
                  value={scopeType}
                  onChange={(e) => setScopeType(e.target.value as DataGovernanceScopeType)}
                  disabled={isReadOnly}
                >
                  <option value="COMPANY">Tüm Şirket (COMPANY)</option>
                  <option value="BRANCH">Şube / Lokasyon (BRANCH)</option>
                  <option value="DEPARTMENT">Departman (DEPARTMENT)</option>
                  <option value="TEAM">Ekip / Bölge (TEAM)</option>
                  <option value="PROJECT">Proje Bazlı (PROJECT)</option>
                  <option value="PROCESS">Süreç Bazlı (PROCESS)</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Kapsam Detayı / Filtresi</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Yalnızca Marmara Bölgesi, Yalnızca Kendi Müşterileri, 1. Fabrika"
                value={scopeValue}
                onChange={(e) => setScopeValue(e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            {/* Onay ve Görevler Ayrılığı Şartları */}
            <div style={{ border: "1px solid var(--border-color, #cbd5e1)", borderRadius: "6px", padding: "0.75rem", marginBottom: "1rem", background: "var(--color-neutral-50, #f8fafc)" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
                <input
                  type="checkbox"
                  checked={approvalRequired}
                  onChange={(e) => setApprovalRequired(e.target.checked)}
                  disabled={isReadOnly}
                />
                Bu erişim veya işlem için onay şartı var
              </label>

              {approvalRequired && (
                <div style={{ marginTop: "0.5rem" }}>
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Onaylayacak Rol / Makam</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Örn: Bölge Satış Direktörü, Mali İşler Müdürü"
                    value={approvalRole}
                    onChange={(e) => setApprovalRole(e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
              )}

              <div style={{ marginTop: "0.75rem", borderTop: "1px solid var(--border-color, #e2e8f0)", paddingTop: "0.5rem" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer", color: "#b91c1c", fontWeight: 600, fontSize: "0.875rem" }}>
                  <input
                    type="checkbox"
                    checked={taskSeparationRequired}
                    onChange={(e) => setTaskSeparationRequired(e.target.checked)}
                    disabled={isReadOnly}
                  />
                  Görevler Ayrılığı (SoD) Kısıtlaması Var
                </label>
                <p className="text-xs text-muted" style={{ margin: "0.25rem 0 0 1.5rem" }}>
                  Bu role veri oluşturma ile onaylama veya muhasebeleştirme yetkisi aynı anda verilemez.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Tutar / Adet / Kayıt Limiti</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: Max 50.000 TL, Sadece Açık Siparişler"
                  value={limitDescription}
                  onChange={(e) => setLimitDescription(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Olası Çatışma / Risk Notu</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: Sipariş açan kişi kendi siparişini onaylayamaz"
                  value={conflictNote}
                  onChange={(e) => setConflictNote(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Notlar</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Erişim kuralı ile ilgili ek açıklamalar..."
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
                {isSaving ? "Kaydediliyor..." : initialData ? "Güncelle" : "Kuralı Ekle"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
