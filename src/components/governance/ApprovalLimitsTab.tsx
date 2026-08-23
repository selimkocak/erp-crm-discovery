// path: /home/selim/projects/erp-crm-discovery/src/components/governance/ApprovalLimitsTab.tsx
import React, { useState } from "react";
import { Plus, Pencil, Trash2, DollarSign, Search } from "lucide-react";
import type { GovernanceLimit, GovernanceStateType } from "../../types/governance";

interface ApprovalLimitsTabProps {
  limits: GovernanceLimit[];
  onAddLimit: () => void;
  onEditLimit: (limit: GovernanceLimit) => void;
  onDeleteLimit: (id: string) => void;
}

export const ApprovalLimitsTab: React.FC<ApprovalLimitsTabProps> = ({
  limits,
  onAddLimit,
  onEditLimit,
  onDeleteLimit,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState<"all" | GovernanceStateType>("all");

  const filtered = limits.filter((l) => {
    const matchesSearch =
      l.limit_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.subject_name && l.subject_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.approver_subject_name && l.approver_subject_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.object_name_tr && l.object_name_tr.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesState = stateFilter === "all" || l.state_type === stateFilter;
    return matchesSearch && matchesState;
  });

  const formatLimitRange = (l: GovernanceLimit) => {
    const unit = l.currency_or_unit || "TRY";
    if (l.min_value != null && l.max_value != null) {
      return `${l.min_value.toLocaleString("tr-TR")} — ${l.max_value.toLocaleString("tr-TR")} ${unit}`;
    }
    if (l.max_value != null) {
      return `Maks. ${l.max_value.toLocaleString("tr-TR")} ${unit}`;
    }
    if (l.min_value != null) {
      return `Min. ${l.min_value.toLocaleString("tr-TR")} ${unit}`;
    }
    return `Limitsiz (${unit})`;
  };

  return (
    <div className="gov-tab-pane">
      <div className="gov-tab-toolbar">
        <div className="gov-tab-toolbar__left">
          <div className="gov-search-box">
            <Search size={16} className="gov-search-icon" />
            <input
              type="text"
              placeholder="Limit türü, sahip veya onaylayan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
          <button type="button" className="gov-btn-primary" onClick={onAddLimit}>
            <Plus size={16} />
            <span>Yeni Onay Limiti</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="gov-empty-state">
          <DollarSign size={40} className="gov-empty-icon" />
          <h4>Onay Limiti Tanımlanmadı</h4>
          <p>
            Satın alma siparişi, iskonto oranları, ödeme ve masraf onay limitlerini tanımlamak için{" "}
            <strong>"Yeni Onay Limiti"</strong> butonunu kullanın.
          </p>
        </div>
      ) : (
        <div className="gov-table-container">
          <table className="gov-table" role="table">
            <thead>
              <tr>
                <th>Limit Türü</th>
                <th>Limit Sahibi (Özne)</th>
                <th>Limit / Tutar Aralığı</th>
                <th>Onay Kademesi</th>
                <th>Onaylayan Rol / Kişi</th>
                <th>İlgili Nesne / Kapsam</th>
                <th>Durum</th>
                <th style={{ width: "90px", textAlign: "right" }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id}>
                  <td>
                    <span className="gov-limit-type-title">{l.limit_type}</span>
                  </td>
                  <td>
                    <span className="gov-subject-name">{l.subject_name || "—"}</span>
                  </td>
                  <td>
                    <span className="gov-limit-amount-badge">{formatLimitRange(l)}</span>
                  </td>
                  <td>
                    <span className="gov-tier-badge">{l.approval_tier || "Standart Onay"}</span>
                  </td>
                  <td>
                    {l.approver_subject_name ? (
                      <span className="gov-approver-name">{l.approver_subject_name}</span>
                    ) : (
                      <span className="gov-text-muted">Doğrudan Yetkili</span>
                    )}
                  </td>
                  <td>
                    <div className="gov-meta-stack">
                      {l.object_name_tr && <span className="gov-meta-item">{l.object_name_tr}</span>}
                      {l.scope_name && <span className="gov-scope-badge">{l.scope_name}</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`gov-state-badge gov-state-badge--${l.state_type}`}>
                      {l.state_type === "to_be" ? "Hedef (To-Be)" : "Mevcut (As-Is)"}
                    </span>
                  </td>
                  <td>
                    <div className="gov-row-actions">
                      <button
                        type="button"
                        className="gov-action-btn"
                        onClick={() => onEditLimit(l)}
                        title="Düzenle"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="gov-action-btn gov-action-btn--delete"
                        onClick={() => onDeleteLimit(l.id)}
                        title="Sil"
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
    </div>
  );
};
