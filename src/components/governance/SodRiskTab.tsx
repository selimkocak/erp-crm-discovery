// path: /home/selim/projects/erp-crm-discovery/src/components/governance/SodRiskTab.tsx
import React, { useState } from "react";
import { Plus, Pencil, Trash2, ShieldAlert, Search, ArrowRight } from "lucide-react";
import type {
  GovernanceSodRisk,
  GovernanceStateType,
  GovernanceRiskSeverity,
  GovernanceRiskStatus,
} from "../../types/governance";

interface SodRiskTabProps {
  risks: GovernanceSodRisk[];
  onAddRisk: () => void;
  onEditRisk: (risk: GovernanceSodRisk) => void;
  onDeleteRisk: (id: string) => void;
}

export const SodRiskTab: React.FC<SodRiskTabProps> = ({
  risks,
  onAddRisk,
  onEditRisk,
  onDeleteRisk,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | GovernanceRiskSeverity>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | GovernanceRiskStatus>("all");
  const [stateFilter, setStateFilter] = useState<"all" | GovernanceStateType>("all");

  const filtered = risks.filter((r) => {
    const matchesSearch =
      r.risk_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.conflicting_duty_a.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.conflicting_duty_b.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.subject_name && r.subject_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSev = severityFilter === "all" || r.risk_severity === severityFilter;
    const matchesStat = statusFilter === "all" || r.status === statusFilter;
    const matchesState = stateFilter === "all" || r.state_type === stateFilter;
    return matchesSearch && matchesSev && matchesStat && matchesState;
  });

  const getSeverityBadge = (sev: GovernanceRiskSeverity) => {
    switch (sev) {
      case "critical":
        return <span className="gov-pill gov-pill--critical">Kritik (Critical)</span>;
      case "high":
        return <span className="gov-pill gov-pill--rose">Yüksek</span>;
      case "medium":
        return <span className="gov-pill gov-pill--amber">Orta</span>;
      case "low":
        return <span className="gov-pill gov-pill--blue">Düşük</span>;
      default:
        return <span className="gov-pill gov-pill--gray">{sev}</span>;
    }
  };

  const getStatusBadge = (st: GovernanceRiskStatus) => {
    switch (st) {
      case "open":
        return <span className="gov-pill gov-pill--danger-outline">Açık Risk</span>;
      case "in_review":
        return <span className="gov-pill gov-pill--blue-outline">İnceleniyor</span>;
      case "mitigated":
        return <span className="gov-pill gov-pill--emerald-outline">Kontrol Altında</span>;
      case "accepted":
        return <span className="gov-pill gov-pill--amber-outline">Kabul Edildi</span>;
      case "closed":
        return <span className="gov-pill gov-pill--gray-outline">Kapatıldı</span>;
      default:
        return <span className="gov-pill gov-pill--gray">{st}</span>;
    }
  };

  return (
    <div className="gov-tab-pane">
      <div className="gov-tab-toolbar">
        <div className="gov-tab-toolbar__left">
          <div className="gov-search-box">
            <Search size={16} className="gov-search-icon" />
            <input
              type="text"
              placeholder="Risk başlığı, görev veya kişi ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="gov-filter-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
          >
            <option value="all">Tüm Ciddiyetler</option>
            <option value="critical">Kritik</option>
            <option value="high">Yüksek</option>
            <option value="medium">Orta</option>
            <option value="low">Düşük</option>
          </select>
          <select
            className="gov-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="open">Açık Riskler</option>
            <option value="in_review">İnceleniyor</option>
            <option value="mitigated">Kontrol Altında</option>
            <option value="accepted">Kabul Edildi</option>
          </select>
          <div className="gov-state-toggle-group">
            <button
              type="button"
              className={`gov-state-toggle-btn ${stateFilter === "all" ? "active" : ""}`}
              onClick={() => setStateFilter("all")}
            >
              Tümü
            </button>
            <button
              type="button"
              className={`gov-state-toggle-btn ${stateFilter === "as_is" ? "active" : ""}`}
              onClick={() => setStateFilter("as_is")}
            >
              Mevcut (As-Is)
            </button>
            <button
              type="button"
              className={`gov-state-toggle-btn ${stateFilter === "to_be" ? "active" : ""}`}
              onClick={() => setStateFilter("to_be")}
            >
              Hedef (To-Be)
            </button>
          </div>
        </div>
        <div className="gov-tab-toolbar__right">
          <button type="button" className="gov-btn-primary" onClick={onAddRisk}>
            <Plus size={16} />
            <span>Yeni SoD Riski</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="gov-empty-state">
          <ShieldAlert size={40} className="gov-empty-icon" />
          <h4>Görevler Ayrılığı (SoD) Riski Tanımlanmadı</h4>
          <p>
            Tedarikçi açma + ödeme yapma veya fiyat belirleme + satış onaylama gibi suistimale ve iç kontrol
            açığına yol açabilecek çatışan görevleri kaydetmek için <strong>"Yeni SoD Riski"</strong> butonunu kullanın.
          </p>
        </div>
      ) : (
        <div className="gov-sod-card-grid">
          {filtered.map((r) => (
            <div key={r.id} className={`gov-sod-card gov-sod-card--${r.risk_severity}`}>
              <div className="gov-sod-card__header">
                <div className="gov-sod-card__title-group">
                  {getSeverityBadge(r.risk_severity)}
                  {getStatusBadge(r.status)}
                  <span className={`gov-state-badge gov-state-badge--${r.state_type}`}>
                    {r.state_type === "to_be" ? "Hedef (To-Be)" : "Mevcut (As-Is)"}
                  </span>
                </div>
                <div className="gov-sod-card__actions">
                  <button
                    type="button"
                    className="gov-action-btn"
                    onClick={() => onEditRisk(r)}
                    title="Düzenle"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className="gov-action-btn gov-action-btn--delete"
                    onClick={() => onDeleteRisk(r.id)}
                    title="Sil"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h4 className="gov-sod-card__title">{r.risk_title}</h4>

              <div className="gov-sod-conflict-box">
                <div className="gov-sod-duty gov-sod-duty--a">
                  <span className="gov-sod-duty__label">Görev A</span>
                  <span className="gov-sod-duty__text">{r.conflicting_duty_a}</span>
                </div>
                <div className="gov-sod-conflict-arrow">
                  <ArrowRight size={18} />
                </div>
                <div className="gov-sod-duty gov-sod-duty--b">
                  <span className="gov-sod-duty__label">Görev B (Çatışan)</span>
                  <span className="gov-sod-duty__text">{r.conflicting_duty_b}</span>
                </div>
              </div>

              <div className="gov-sod-details">
                {r.subject_name && (
                  <div className="gov-sod-detail-row">
                    <span className="gov-sod-detail-label">İlgili Kişi / Rol:</span>
                    <span className="gov-sod-detail-value">{r.subject_name}</span>
                  </div>
                )}
                {r.current_control && (
                  <div className="gov-sod-detail-row">
                    <span className="gov-sod-detail-label">Mevcut Kontrol:</span>
                    <span className="gov-sod-detail-value">{r.current_control}</span>
                  </div>
                )}
                {r.mitigation_action && (
                  <div className="gov-sod-detail-row">
                    <span className="gov-sod-detail-label">Önerilen Hedef Çözüm:</span>
                    <span className="gov-sod-detail-value gov-sod-detail-value--highlight">
                      {r.mitigation_action}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
