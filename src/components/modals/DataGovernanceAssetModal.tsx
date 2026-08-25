import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertTriangle } from "lucide-react";
import type { DataGovernanceAsset, DataGovernanceCriticality } from "../../types";
import { checkAssetSodRisk } from "../../types";

interface DataGovernanceAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Partial<DataGovernanceAsset>) => Promise<void>;
  initialData?: DataGovernanceAsset | null;
  isReadOnly?: boolean;
}

export const DataGovernanceAssetModal: React.FC<DataGovernanceAssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isReadOnly = false,
}) => {
  const [domain, setDomain] = useState("");
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("MASTER_DATA");
  const [description, setDescription] = useState("");
  const [systemOfRecord, setSystemOfRecord] = useState("ERP (SAP B1)");
  const [criticality, setCriticality] = useState<DataGovernanceCriticality>("MEDIUM");

  const [masterData, setMasterData] = useState(true);
  const [processData, setProcessData] = useState(false);
  const [personalData, setPersonalData] = useState(false);
  const [financialData, setFinancialData] = useState(false);
  const [qualityOrSafetyData, setQualityOrSafetyData] = useState(false);

  const [ownerRole, setOwnerRole] = useState("");
  const [stewardRole, setStewardRole] = useState("");
  const [technicalCustodianRole, setTechnicalCustodianRole] = useState("");
  const [status, setStatus] = useState<"active" | "passive">("active");
  const [notes, setNotes] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setDomain(initialData.domain || "");
      setAssetName(initialData.asset_name || "");
      setAssetType(initialData.asset_type || "MASTER_DATA");
      setDescription(initialData.description || "");
      setSystemOfRecord(initialData.system_of_record || "ERP (SAP B1)");
      setCriticality(initialData.criticality || "MEDIUM");
      setMasterData(Boolean(initialData.master_data));
      setProcessData(Boolean(initialData.process_data));
      setPersonalData(Boolean(initialData.personal_data));
      setFinancialData(Boolean(initialData.financial_data));
      setQualityOrSafetyData(Boolean(initialData.quality_or_safety_data));
      setOwnerRole(initialData.owner_role || "");
      setStewardRole(initialData.steward_role || "");
      setTechnicalCustodianRole(initialData.technical_custodian_role || "");
      setStatus(initialData.status || "active");
      setNotes(initialData.notes || "");
    } else {
      setDomain("");
      setAssetName("");
      setAssetType("MASTER_DATA");
      setDescription("");
      setSystemOfRecord("ERP (SAP B1)");
      setCriticality("MEDIUM");
      setMasterData(true);
      setProcessData(false);
      setPersonalData(false);
      setFinancialData(false);
      setQualityOrSafetyData(false);
      setOwnerRole("");
      setStewardRole("");
      setTechnicalCustodianRole("");
      setStatus("active");
      setNotes("");
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Real-time SoD conflict calculation
  const sodCheck = checkAssetSodRisk({
    owner_role: ownerRole,
    steward_role: stewardRole,
    technical_custodian_role: technicalCustodianRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) {
      setErrorMsg("Lütfen veri varlığı adını giriniz.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg(null);
      await onSave({
        domain: domain.trim() || undefined,
        asset_name: assetName.trim(),
        asset_type: assetType.trim() || "MASTER_DATA",
        description: description.trim() || undefined,
        system_of_record: systemOfRecord.trim() || undefined,
        criticality,
        master_data: masterData ? 1 : 0,
        process_data: processData ? 1 : 0,
        personal_data: personalData ? 1 : 0,
        financial_data: financialData ? 1 : 0,
        quality_or_safety_data: qualityOrSafetyData ? 1 : 0,
        owner_role: ownerRole.trim() || undefined,
        steward_role: stewardRole.trim() || undefined,
        technical_custodian_role: technicalCustodianRole.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Veri varlığı kaydedilirken hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {initialData ? "Veri Varlığını Düzenle" : "Yeni Veri Varlığı & Sahiplik Ekle"}
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

            {/* Bilgilendirme Notu */}
            <div className="alert alert-info" style={{ fontSize: "0.8125rem", marginBottom: "1rem", lineHeight: 1.5 }}>
              <strong>Kurumsal İlke:</strong> Şahıs adı yerine kurumsal rol veya pozisyon adı giriniz (örn: <em>"Finans Müdürü"</em>, <em>"Depo Sorumlusu"</em>, <em>"BT Sistem Yöneticisi"</em>).
            </div>

            <div className="form-group">
              <label className="form-label">Veri Varlığı Adı *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Müşteri Ana Verisi, Ürün Reçetesi (BOM), Fatura Kayıtları"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                disabled={isReadOnly}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Alan / Domain</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: Satış, Üretim, Muhasebe, Depo"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Veri Tipi</label>
                <select
                  className="form-control"
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="MASTER_DATA">Ana Veri (Master Data)</option>
                  <option value="TRANSACTIONAL_DATA">Hareket Verisi (Transactional)</option>
                  <option value="CONFIGURATION_DATA">Parametre / Konfigürasyon</option>
                  <option value="REPORT_DATA">Rapor / Analitik Veri</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Kayıt Sistemi (System of Record)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: SAP B1, CRM, WMS, Excel"
                  value={systemOfRecord}
                  onChange={(e) => setSystemOfRecord(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kritiklik Seviyesi</label>
                <select
                  className="form-control"
                  value={criticality}
                  onChange={(e) => setCriticality(e.target.value as DataGovernanceCriticality)}
                  disabled={isReadOnly}
                >
                  <option value="LOW">Düşük (LOW)</option>
                  <option value="MEDIUM">Orta (MEDIUM)</option>
                  <option value="HIGH">Yüksek (HIGH)</option>
                  <option value="CRITICAL">Kritik (CRITICAL)</option>
                </select>
              </div>
            </div>

            {/* Veri Nitelik Bayrakları */}
            <div className="form-group" style={{ marginBottom: "1.25rem", background: "var(--color-neutral-50, #f8fafc)", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color, #e2e8f0)" }}>
              <label className="form-label" style={{ marginBottom: "0.5rem", fontWeight: 600 }}>Veri Varlığı Nitelikleri</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.875rem" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={masterData} onChange={(e) => setMasterData(e.target.checked)} disabled={isReadOnly} />
                  Ana Veri
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={processData} onChange={(e) => setProcessData(e.target.checked)} disabled={isReadOnly} />
                  Süreç Verisi
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={financialData} onChange={(e) => setFinancialData(e.target.checked)} disabled={isReadOnly} />
                  Finansal Veri
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={personalData} onChange={(e) => setPersonalData(e.target.checked)} disabled={isReadOnly} />
                  Kişisel Veri (KVKK)
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={qualityOrSafetyData} onChange={(e) => setQualityOrSafetyData(e.target.checked)} disabled={isReadOnly} />
                  Kalite / Güvenlik
                </label>
              </div>
            </div>

            {/* Sorumluluk Rolleri (Owner, Steward, Custodian) */}
            <div style={{ border: "1px solid var(--border-color, #cbd5e1)", borderRadius: "6px", padding: "0.75rem", marginBottom: "1rem" }}>
              <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.875rem", fontWeight: 700, color: "var(--color-primary-700, #1e3a8a)" }}>
                3'lü Sahiplik ve Sorumluluk Modeli
              </h4>

              <div className="form-grid--3">
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Veri Sahibi (Owner Rolü)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Örn: Satış Direktörü"
                    value={ownerRole}
                    onChange={(e) => setOwnerRole(e.target.value)}
                    disabled={isReadOnly}
                  />
                  <span className="text-xs text-muted">İş kararı & yetkilendirme</span>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Veri Sorumlusu (Steward Rolü)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Örn: Satış Operasyon Uzmanı"
                    value={stewardRole}
                    onChange={(e) => setStewardRole(e.target.value)}
                    disabled={isReadOnly}
                  />
                  <span className="text-xs text-muted">Doğruluk & veri kalitesi</span>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Teknik Emanetçi (Custodian Rolü)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Örn: BT Veritabanı Yöneticisi"
                    value={technicalCustodianRole}
                    onChange={(e) => setTechnicalCustodianRole(e.target.value)}
                    disabled={isReadOnly}
                  />
                  <span className="text-xs text-muted">Altyapı & yedekleme</span>
                </div>
              </div>

              {/* Canlı SoD Kontrol Rozeti */}
              <div style={{ marginTop: "0.75rem" }}>
                {sodCheck.hasRisk ? (
                  <div className="alert alert-warning" style={{ margin: 0, padding: "0.5rem 0.75rem", fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <AlertTriangle size={16} style={{ color: "#b45309", flexShrink: 0 }} />
                    <span><strong>⚠️ SoD Riski:</strong> {sodCheck.message}</span>
                  </div>
                ) : (
                  (ownerRole || stewardRole || technicalCustodianRole) && (
                    <div style={{ fontSize: "0.75rem", color: "#15803d", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <CheckCircle2 size={14} />
                      <span>Roller ayrıştırılmış, görevler ayrılığı ilkesiyle uyumlu.</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Açıklama</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Veri varlığının içeriği, iş süreçlerindeki rolü ve kapsamı..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Denetim / Keşif Notları</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Saha görüşmesinde tespit edilen eksiklikler, mükerrerlik veya entegrasyon riskleri..."
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
                {isSaving ? "Kaydediliyor..." : initialData ? "Güncelle" : "Varlığı Ekle"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
