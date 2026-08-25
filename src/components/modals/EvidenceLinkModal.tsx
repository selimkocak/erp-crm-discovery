import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type {
  EvidenceItem,
  EvidenceTargetType,
  EvidenceLink,
  OtStation,
  ProcessMap,
  DataGovernanceAsset,
} from "../../types";

interface EvidenceLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Partial<EvidenceLink>) => Promise<void>;
  evidenceItem: EvidenceItem | null;
  otStations?: OtStation[];
  processMaps?: ProcessMap[];
  governanceAssets?: DataGovernanceAsset[];
  businessFunctions?: { code: string; name_tr: string }[];
}

export const EvidenceLinkModal: React.FC<EvidenceLinkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  evidenceItem,
  otStations = [],
  processMaps = [],
  governanceAssets = [],
  businessFunctions = [],
}) => {
  const [targetType, setTargetType] = useState<EvidenceTargetType>("QUESTION");
  const [selectedBfCode, setSelectedBfCode] = useState(businessFunctions[0]?.code || "SALES");
  const [questionId, setQuestionId] = useState("");
  const [selectedStationId, setSelectedStationId] = useState(otStations[0]?.id || "");
  const [selectedMapId, setSelectedMapId] = useState(processMaps[0]?.id || "");
  const [selectedAssetId, setSelectedAssetId] = useState(governanceAssets[0]?.id || "");
  const [linkNote, setLinkNote] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (businessFunctions.length > 0 && !selectedBfCode) {
      setSelectedBfCode(businessFunctions[0].code);
    }
    if (otStations.length > 0 && !selectedStationId) {
      setSelectedStationId(otStations[0].id);
    }
    if (processMaps.length > 0 && !selectedMapId) {
      setSelectedMapId(processMaps[0].id);
    }
    if (governanceAssets.length > 0 && !selectedAssetId) {
      setSelectedAssetId(governanceAssets[0].id);
    }
    setQuestionId("");
    setLinkNote("");
    setErrorMsg(null);
  }, [isOpen, businessFunctions, otStations, processMaps, governanceAssets]);

  if (!isOpen || !evidenceItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let targetId = "";
    let qId: string | undefined;
    let bfCode: string | undefined;
    let stationId: string | undefined;
    let pmapId: string | undefined;
    let dgAssetId: string | undefined;

    if (targetType === "QUESTION") {
      if (!questionId.trim()) {
        setErrorMsg("Lütfen ilgili soru kodunu giriniz (örn: SLS-001, PRJ-003).");
        return;
      }
      qId = questionId.trim().toUpperCase();
      bfCode = selectedBfCode;
      targetId = qId;
    } else if (targetType === "OT_STATION") {
      if (!selectedStationId) {
        setErrorMsg("Lütfen bir OT istasyonu seçiniz.");
        return;
      }
      stationId = selectedStationId;
      targetId = selectedStationId;
    } else if (targetType === "PROCESS_MAP") {
      if (!selectedMapId) {
        setErrorMsg("Lütfen bir süreç haritası seçiniz.");
        return;
      }
      pmapId = selectedMapId;
      targetId = selectedMapId;
    } else if (targetType === "GOVERNANCE_ASSET") {
      if (!selectedAssetId) {
        setErrorMsg("Lütfen bir veri varlığı seçiniz.");
        return;
      }
      dgAssetId = selectedAssetId;
      targetId = selectedAssetId;
    }

    try {
      setIsSaving(true);
      await onSave({
        evidence_id: evidenceItem.id,
        target_type: targetType,
        target_id: targetId,
        question_id: qId,
        business_function_code: bfCode,
        ot_station_id: stationId,
        process_map_id: pmapId,
        governance_asset_id: dgAssetId,
        link_note: linkNote.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Bağlantı oluşturulurken hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "560px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Kanıtı Hedefe Bağla</h3>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ paddingRight: "0.5rem" }}>
            {errorMsg && (
              <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>
                {errorMsg}
              </div>
            )}

            {/* Kanıt Bilgi Kartı */}
            <div style={{ background: "var(--color-primary-50, #eff6ff)", border: "1px solid var(--color-primary-200, #bfdbfe)", padding: "0.75rem", borderRadius: "6px", marginBottom: "1rem" }}>
              <span className="text-xs text-muted font-bold" style={{ display: "block" }}>BAĞLANACAK KANIT</span>
              <div style={{ fontWeight: 700, color: "var(--color-primary-800, #1e40af)" }}>{evidenceItem.title}</div>
              <span className="badge badge--secondary text-xs" style={{ marginTop: "2px" }}>{evidenceItem.evidence_type}</span>
            </div>

            {/* Hedef Tipi */}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Hedef Keşif Türü</label>
              <select
                className="form-control"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as EvidenceTargetType)}
              >
                <option value="QUESTION">Soru / Beyan (Question Answer)</option>
                <option value="OT_STATION">Saha OT İstasyonu (Industrial Station)</option>
                <option value="PROCESS_MAP">Süreç Haritası (Process Map)</option>
                <option value="GOVERNANCE_ASSET">Veri Yönetişimi Varlığı (Data Asset)</option>
              </select>
            </div>

            {/* Hedefe Özel Seçim Alanları */}
            {targetType === "QUESTION" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">İş Fonksiyonu</label>
                  <select
                    className="form-control"
                    value={selectedBfCode}
                    onChange={(e) => setSelectedBfCode(e.target.value)}
                  >
                    {businessFunctions.map((bf) => (
                      <option key={bf.code} value={bf.code}>
                        {bf.name_tr} ({bf.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Soru Kodu *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Örn: SLS-001, PRJ-002"
                    value={questionId}
                    onChange={(e) => setQuestionId(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {targetType === "OT_STATION" && (
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">İstasyon Seçiniz *</label>
                {otStations.length === 0 ? (
                  <div className="alert alert-warning" style={{ fontSize: "0.8125rem", margin: 0 }}>
                    Bu projede tanımlı OT istasyonu bulunmuyor.
                  </div>
                ) : (
                  <select
                    className="form-control"
                    value={selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value)}
                    required
                  >
                    {otStations.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.station_code} — {st.station_name} ({st.area_name || "Genel Alan"})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {targetType === "PROCESS_MAP" && (
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Süreç Haritası Seçiniz *</label>
                {processMaps.length === 0 ? (
                  <div className="alert alert-warning" style={{ fontSize: "0.8125rem", margin: 0 }}>
                    Bu projede tanımlı süreç haritası bulunmuyor.
                  </div>
                ) : (
                  <select
                    className="form-control"
                    value={selectedMapId}
                    onChange={(e) => setSelectedMapId(e.target.value)}
                    required
                  >
                    {processMaps.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.name} ({pm.process_area || "Süreç Alanı"})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {targetType === "GOVERNANCE_ASSET" && (
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Veri Varlığı Seçiniz *</label>
                {governanceAssets.length === 0 ? (
                  <div className="alert alert-warning" style={{ fontSize: "0.8125rem", margin: 0 }}>
                    Bu projede tanımlı veri varlığı bulunmuyor.
                  </div>
                ) : (
                  <select
                    className="form-control"
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    required
                  >
                    {governanceAssets.map((ast) => (
                      <option key={ast.id} value={ast.id}>
                        {ast.asset_name} ({ast.domain || "Genel"}) — {ast.criticality}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Bağlantı Notu */}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Bağlantı & İspat Notu</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Bu kanıtın ilgili hedefi nasıl ve ne derecede doğruladığına dair açıklama..."
                value={linkNote}
                onChange={(e) => setLinkNote(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? "Bağlanıyor..." : "Bağlantıyı Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
