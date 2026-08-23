// path: /home/selim/projects/erp-crm-discovery/src/components/governance/AuthorizationMatrixTab.tsx
import React, { useState } from "react";
import { Plus, Pencil, Trash2, Shield, Search, AlertCircle } from "lucide-react";
import type {
  GovernanceAuthorization,
  GovernanceObject,
  GovernanceSubject,
  GovernanceScope,
  GovernanceStateType,
  GovernancePermissionLevel,
} from "../../types/governance";

interface AuthorizationMatrixTabProps {
  authorizations: GovernanceAuthorization[];
  objects: GovernanceObject[];
  subjects: GovernanceSubject[];
  scopes: GovernanceScope[];
  onAddAuthorization: () => void;
  onEditAuthorization: (auth: GovernanceAuthorization) => void;
  onDeleteAuthorization: (id: string) => void;
}

export const AuthorizationMatrixTab: React.FC<AuthorizationMatrixTabProps> = ({
  authorizations,
  onAddAuthorization,
  onEditAuthorization,
  onDeleteAuthorization,
}) => {

  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState<"all" | GovernanceStateType>("all");
  const [discrepancyOnly, setDiscrepancyOnly] = useState(false);

  const filtered = authorizations.filter((a) => {
    const matchesSearch =
      (a.object_name_tr && a.object_name_tr.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.object_code && a.object_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.subject_name && a.subject_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.scope_name && a.scope_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = levelFilter === "all" || a.permission_level === levelFilter;
    const matchesState = stateFilter === "all" || a.state_type === stateFilter;
    const matchesDiscrepancy = !discrepancyOnly || a.has_discrepancy === 1;
    return matchesSearch && matchesLevel && matchesState && matchesDiscrepancy;
  });

  const getPermissionPill = (level: GovernancePermissionLevel) => {
    switch (level) {
      case "full":
        return <span className="gov-perm-pill gov-perm-pill--full">Tam Yetki</span>;
      case "read_only":
        return <span className="gov-perm-pill gov-perm-pill--read">Salt Okunur</span>;
      case "none":
        return <span className="gov-perm-pill gov-perm-pill--none">Yetki Yok</span>;
      case "partial":
        return <span className="gov-perm-pill gov-perm-pill--partial">Kısmi Yetki</span>;
      case "unspecified":
      default:
        return <span className="gov-perm-pill gov-perm-pill--unspecified">Belirtilmedi</span>;
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
              placeholder="Özne, nesne veya kapsam ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="gov-filter-select"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="all">Tüm Yetki Seviyeleri</option>
            <option value="full">Tam Yetki (Full)</option>
            <option value="read_only">Salt Okunur (Read Only)</option>
            <option value="none">Yetki Yok (No Access)</option>
            <option value="partial">Kısmi (Partial)</option>
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
          <label className="gov-checkbox-filter">
            <input
              type="checkbox"
              checked={discrepancyOnly}
              onChange={(e) => setDiscrepancyOnly(e.target.checked)}
            />
            <span>Yalnız Sapmalar</span>
          </label>
        </div>
        <div className="gov-tab-toolbar__right">
          <button type="button" className="gov-btn-primary" onClick={onAddAuthorization}>
            <Plus size={16} />
            <span>Yeni Yetki Tanımı</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="gov-empty-state">
          <Shield size={40} className="gov-empty-icon" />
          <h4>Yetki Matrisi Henüz Tanımlanmadı</h4>
          <p>
            Kullanıcı, rol ve grupların hangi veri nesnelerine (Stok, Fatura, Ödeme vb.) tam, salt okunur veya
            kısmi erişimi olduğunu haritalandırmak için <strong>"Yeni Yetki Tanımı"</strong> butonuna tıklayın.
          </p>
        </div>
      ) : (
        <div className="gov-table-container">
          <table className="gov-table" role="table">
            <thead>
              <tr>
                <th>Özne (Kişi/Grup/Rol)</th>
                <th>Yönetişim Nesnesi</th>
                <th>Beyan Edilen Yetki</th>
                <th>Efektif Yetki / Sapma</th>
                <th>Kapsam</th>
                <th>İşlem Düzeyi İzinleri</th>
                <th>Durum</th>
                <th style={{ width: "90px", textAlign: "right" }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="gov-subject-cell">
                      <span className="gov-subject-name">{a.subject_name || "—"}</span>
                      {a.subject_type && (
                        <span className="gov-subject-type-badge">{a.subject_type}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="gov-name-cell">
                      <span className="gov-name-tr">{a.object_name_tr || "—"}</span>
                      {a.object_code && <code className="gov-code-badge">{a.object_code}</code>}
                    </div>
                  </td>
                  <td>{getPermissionPill(a.permission_level)}</td>
                  <td>
                    {a.has_discrepancy === 1 && a.effective_level ? (
                      <div className="gov-discrepancy-cell">
                        {getPermissionPill(a.effective_level)}
                        <span className="gov-discrepancy-badge" title="Beyan edilen ile sahada fiilen uygulanan yetki arasında sapma var!">
                          <AlertCircle size={13} />
                          <span>Sapma</span>
                        </span>
                      </div>
                    ) : (
                      <span className="gov-text-muted">Sapma Yok</span>
                    )}
                  </td>
                  <td>
                    {a.scope_name ? (
                      <span className="gov-scope-badge">{a.scope_name}</span>
                    ) : (
                      <span className="gov-text-muted">Tüm Organizasyon</span>
                    )}
                  </td>
                  <td>
                    <div className="gov-actions-pill-grid">
                      <span className={`gov-act-pill ${a.can_view ? "active" : ""}`} title="Görüntüleme">G</span>
                      <span className={`gov-act-pill ${a.can_create ? "active" : ""}`} title="Yeni Ekleme">E</span>
                      <span className={`gov-act-pill ${a.can_edit ? "active" : ""}`} title="Düzenleme">D</span>
                      <span className={`gov-act-pill ${a.can_delete ? "active" : ""}`} title="Silme">S</span>
                      <span className={`gov-act-pill ${a.can_approve ? "active" : ""}`} title="Onaylama">O</span>
                      <span className={`gov-act-pill ${a.can_cancel ? "active" : ""}`} title="İptal">İ</span>
                      <span className={`gov-act-pill ${a.can_export ? "active" : ""}`} title="Dışa Aktarma">X</span>
                      <span className={`gov-act-pill ${a.can_view_cost ? "active" : ""}`} title="Maliyet Görme">M</span>
                    </div>
                  </td>
                  <td>
                    <span className={`gov-state-badge gov-state-badge--${a.state_type}`}>
                      {a.state_type === "to_be" ? "Hedef (To-Be)" : "Mevcut (As-Is)"}
                    </span>
                  </td>
                  <td>
                    <div className="gov-row-actions">
                      <button
                        type="button"
                        className="gov-action-btn"
                        onClick={() => onEditAuthorization(a)}
                        title="Düzenle"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="gov-action-btn gov-action-btn--delete"
                        onClick={() => onDeleteAuthorization(a.id)}
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
