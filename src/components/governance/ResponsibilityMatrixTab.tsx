// path: /home/selim/projects/erp-crm-discovery/src/components/governance/ResponsibilityMatrixTab.tsx
import React, { useState } from "react";
import { Plus, Pencil, Trash2, Users, Search } from "lucide-react";
import type {
  GovernanceResponsibility,
  GovernanceObject,
  GovernanceSubject,
  GovernanceScope,
  GovernanceStateType,
} from "../../types/governance";

interface ResponsibilityMatrixTabProps {
  responsibilities: GovernanceResponsibility[];
  objects: GovernanceObject[];
  subjects: GovernanceSubject[];
  scopes: GovernanceScope[];
  onAddResponsibility: () => void;
  onEditResponsibility: (resp: GovernanceResponsibility) => void;
  onDeleteResponsibility: (id: string) => void;
}

export const ResponsibilityMatrixTab: React.FC<ResponsibilityMatrixTabProps> = ({
  responsibilities,
  onAddResponsibility,
  onEditResponsibility,
  onDeleteResponsibility,
}) => {

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState<"all" | GovernanceStateType>("all");

  const filtered = responsibilities.filter((r) => {
    const matchesSearch =
      (r.object_name_tr && r.object_name_tr.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.object_code && r.object_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.subject_name && r.subject_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.scope_name && r.scope_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === "all" || r.responsibility_type === typeFilter;
    const matchesState = stateFilter === "all" || r.state_type === stateFilter;
    return matchesSearch && matchesType && matchesState;
  });

  const getResponsibilityBadge = (type: string) => {
    switch (type) {
      case "data_owner":
        return <span className="gov-pill gov-pill--amber">Veri Sahibi (Owner)</span>;
      case "data_steward":
        return <span className="gov-pill gov-pill--blue">Veri Sorumlusu (Steward)</span>;
      case "technical_custodian":
        return <span className="gov-pill gov-pill--purple">Teknik Emanetçi</span>;
      case "approver":
        return <span className="gov-pill gov-pill--emerald">Onay Sahibi</span>;
      case "process_owner":
        return <span className="gov-pill gov-pill--indigo">Süreç Sahibi</span>;
      case "control_owner":
        return <span className="gov-pill gov-pill--rose">Kontrol Sahibi</span>;
      default:
        return <span className="gov-pill gov-pill--gray">{type}</span>;
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
              placeholder="Nesne, kişi/rol veya kapsam ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="gov-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tüm Sorumluluk Türleri</option>
            <option value="data_owner">Veri Sahibi (Data Owner)</option>
            <option value="data_steward">Veri Sorumlusu (Data Steward)</option>
            <option value="technical_custodian">Teknik Emanetçi</option>
            <option value="approver">Onay Sahibi</option>
            <option value="process_owner">Süreç Sahibi</option>
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
          <button type="button" className="gov-btn-primary" onClick={onAddResponsibility}>
            <Plus size={16} />
            <span>Sorumluluk Ata</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="gov-empty-state">
          <Users size={40} className="gov-empty-icon" />
          <h4>Sorumluluk Matrisi Henüz Oluşturulmadı</h4>
          <p>
            Hangi veri nesnesinin iş kurallarından (Data Owner), operasyonel kalitesinden (Data Steward)
            veya teknik altyapısından (Technical Custodian) kimin sorumlu olduğunu tanımlamak için{" "}
            <strong>"Sorumluluk Ata"</strong> butonunu kullanın.
          </p>
        </div>
      ) : (
        <div className="gov-table-container">
          <table className="gov-table" role="table">
            <thead>
              <tr>
                <th>Yönetişim Nesnesi</th>
                <th>Sorumluluk Türü</th>
                <th>Atanan Özne (Kişi/Rol/Grup)</th>
                <th>Kapsam</th>
                <th>Durum</th>
                <th>Notlar</th>
                <th style={{ width: "90px", textAlign: "right" }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="gov-name-cell">
                      <span className="gov-name-tr">{r.object_name_tr || "—"}</span>
                      {r.object_code && <code className="gov-code-badge">{r.object_code}</code>}
                    </div>
                  </td>
                  <td>{getResponsibilityBadge(r.responsibility_type)}</td>
                  <td>
                    <div className="gov-subject-cell">
                      <span className="gov-subject-name">{r.subject_name || "—"}</span>
                      {r.subject_type && (
                        <span className="gov-subject-type-badge">{r.subject_type}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {r.scope_name ? (
                      <span className="gov-scope-badge">{r.scope_name}</span>
                    ) : (
                      <span className="gov-text-muted">Tüm Organizasyon</span>
                    )}
                  </td>
                  <td>
                    <span className={`gov-state-badge gov-state-badge--${r.state_type}`}>
                      {r.state_type === "to_be" ? "Hedef (To-Be)" : "Mevcut (As-Is)"}
                    </span>
                  </td>
                  <td>
                    <span className="gov-desc-text" title={r.notes || ""}>
                      {r.notes || "—"}
                    </span>
                  </td>
                  <td>
                    <div className="gov-row-actions">
                      <button
                        type="button"
                        className="gov-action-btn"
                        onClick={() => onEditResponsibility(r)}
                        title="Düzenle"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="gov-action-btn gov-action-btn--delete"
                        onClick={() => onDeleteResponsibility(r.id)}
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
