import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type {
  DataGovernanceApproval,
  DataGovernanceAsset,
  ProcessMap,
} from "../../types";

interface DataGovernanceApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Partial<DataGovernanceApproval>) => Promise<void>;
  assets: DataGovernanceAsset[];
  processMaps: ProcessMap[];
  initialData?: DataGovernanceApproval | null;
  isReadOnly?: boolean;
}

export const DataGovernanceApprovalModal: React.FC<DataGovernanceApprovalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  assets,
  processMaps,
  initialData,
  isReadOnly = false,
}) => {
  const [assetId, setAssetId] = useState("");
  const [processMapId, setProcessMapId] = useState("");
  const [approvalName, setApprovalName] = useState("");
  const [approvalRole, setApprovalRole] = useState("");
  const [thresholdDescription, setThresholdDescription] = useState("");
  const [approvalOrder, setApprovalOrder] = useState<number>(1);
  const [mandatory, setMandatory] = useState(true);
  const [separationOfDuties, setSeparationOfDuties] = useState(false);
  const [notes, setNotes] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setAssetId(initialData.asset_id || "");
      setProcessMapId(initialData.process_map_id || "");
      setApprovalName(initialData.approval_name || "");
      setApprovalRole(initialData.approval_role || "");
      setThresholdDescription(initialData.threshold_description || "");
      setApprovalOrder(Number(initialData.approval_order) || 1);
      setMandatory(Boolean(initialData.mandatory));
      setSeparationOfDuties(Boolean(initialData.separation_of_duties));
      setNotes(initialData.notes || "");
    } else {
      setAssetId("");
      setProcessMapId("");
      setApprovalName("");
      setApprovalRole("");
      setThresholdDescription("");
      setApprovalOrder(1);
      setMandatory(true);
      setSeparationOfDuties(false);
      setNotes("");
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalName.trim()) {
      setErrorMsg("Lütfen onay adını giriniz.");
      return;
    }
    if (!approvalRole.trim()) {
      setErrorMsg("Lütfen onaylayacak rolü giriniz.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg(null);
      await onSave({
        asset_id: assetId || undefined,
        process_map_id: processMapId || undefined,
        approval_name: approvalName.trim(),
        approval_role: approvalRole.trim(),
        threshold_description: thresholdDescription.trim() || undefined,
        approval_order: Number(approvalOrder) || 1,
        mandatory: mandatory ? 1 : 0,
        separation_of_duties: separationOfDuties ? 1 : 0,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Onay kuralı kaydedilirken hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal--md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {initialData ? "Onay Kuralını Düzenle" : "Yeni Onay Kuralı / Kademesi Ekle"}
          </h3>
          <button type="button" className="btn-close modal-close-btn" onClick={onClose} aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMsg && (
              <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>
                {errorMsg}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Onay Kuralı Adı *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: 1. Kademe Satın Alma Onayı, İskonto Onayı (>%10)"
                value={approvalName}
                onChange={(e) => setApprovalName(e.target.value)}
                disabled={isReadOnly}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Onaylayan Rol *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: Satın Alma Müdürü, CFO"
                  value={approvalRole}
                  onChange={(e) => setApprovalRole(e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Onay Sırası (Kademesi)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className="form-control"
                  value={approvalOrder}
                  onChange={(e) => setApprovalOrder(parseInt(e.target.value, 10) || 1)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">İlgili Veri Varlığı (Opsiyonel)</label>
                <select
                  className="form-control"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="">-- Bağımsız / Genel --</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.asset_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">İlgili Süreç Haritası (Opsiyonel)</label>
                <select
                  className="form-control"
                  value={processMapId}
                  onChange={(e) => setProcessMapId(e.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="">-- Bağımsız / Genel --</option>
                  {processMaps.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Eşik / Limit / Tetikleyici Koşul</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: > 100.000 TL siparişler, Riskli müşteri kotasyonları"
                value={thresholdDescription}
                onChange={(e) => setThresholdDescription(e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem", background: "var(--color-neutral-50, #f8fafc)", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color, #e2e8f0)", flexWrap: "wrap" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
                <input
                  type="checkbox"
                  checked={mandatory}
                  onChange={(e) => setMandatory(e.target.checked)}
                  disabled={isReadOnly}
                />
                Zorunlu Onay Kademesi
              </label>

              <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer", color: "#b91c1c", fontWeight: 600, fontSize: "0.875rem" }}>
                <input
                  type="checkbox"
                  checked={separationOfDuties}
                  onChange={(e) => setSeparationOfDuties(e.target.checked)}
                  disabled={isReadOnly}
                />
                Görevler Ayrılığı (SoD) Şart
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Notlar</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Onay mekanizması ve eskalasyon kuralları..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
              İptal
            </button>
            {!isReadOnly && (
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? "Kaydediliyor..." : initialData ? "Güncelle" : "Onay Kuralını Ekle"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
