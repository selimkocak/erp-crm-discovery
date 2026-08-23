// path: /home/selim/projects/erp-crm-discovery/src/components/governance/ScopesAndSubjectsTab.tsx
import React, { useState } from "react";
import { Plus, Pencil, Trash2, Users, MapPin, User, Shield, Layers } from "lucide-react";
import type { GovernanceSubject, GovernanceScope } from "../../types/governance";

interface ScopesAndSubjectsTabProps {
  subjects: GovernanceSubject[];
  scopes: GovernanceScope[];
  onAddSubject: () => void;
  onEditSubject: (subj: GovernanceSubject) => void;
  onDeleteSubject: (id: string) => void;
  onAddScope: () => void;
  onEditScope: (scope: GovernanceScope) => void;
  onDeleteScope: (id: string) => void;
}

export const ScopesAndSubjectsTab: React.FC<ScopesAndSubjectsTabProps> = ({
  subjects,
  scopes,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  onAddScope,
  onEditScope,
  onDeleteScope,
}) => {
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");

  const filteredSubjects = subjects.filter(
    (s) => subjectFilter === "all" || s.subject_type === subjectFilter
  );

  const filteredScopes = scopes.filter(
    (sc) => scopeFilter === "all" || sc.scope_type === scopeFilter
  );

  const getSubjectTypeIcon = (type: string) => {
    switch (type) {
      case "role":
        return <Shield size={14} className="gov-icon-role" />;
      case "group":
        return <Users size={14} className="gov-icon-group" />;
      case "user":
      default:
        return <User size={14} className="gov-icon-user" />;
    }
  };

  const getScopeTypeBadge = (type: string) => {
    switch (type) {
      case "organization_wide":
        return <span className="gov-pill gov-pill--indigo">Genel (Org-Wide)</span>;
      case "company":
        return <span className="gov-pill gov-pill--blue">Şirket</span>;
      case "branch":
        return <span className="gov-pill gov-pill--emerald">Şube / Lokasyon</span>;
      case "department":
        return <span className="gov-pill gov-pill--purple">Departman</span>;
      case "team":
        return <span className="gov-pill gov-pill--amber">Ekip</span>;
      default:
        return <span className="gov-pill gov-pill--gray">{type}</span>;
    }
  };

  return (
    <div className="gov-tab-pane">
      <div className="gov-split-layout">
        {/* SOL: Özneler (Kullanıcı / Grup / Rol) */}
        <div className="gov-split-panel">
          <div className="gov-split-panel__header">
            <div className="gov-split-panel__title">
              <Users size={18} />
              <h4>Özneler: Kullanıcılar, Roller ve Gruplar ({subjects.length})</h4>
            </div>
            <button type="button" className="gov-btn-primary gov-btn-sm" onClick={onAddSubject}>
              <Plus size={15} />
              <span>Yeni Özne</span>
            </button>
          </div>

          <div className="gov-split-panel__filter">
            <select
              className="gov-filter-select"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              <option value="all">Tüm Özne Türleri</option>
              <option value="role">Roller / Pozisyonlar</option>
              <option value="group">Gruplar</option>
              <option value="user">Kullanıcılar / Kişiler</option>
            </select>
          </div>

          {filteredSubjects.length === 0 ? (
            <div className="gov-empty-panel">
              <p>Henüz özne (rol, grup veya kullanıcı) eklenmedi.</p>
            </div>
          ) : (
            <div className="gov-list-container">
              {filteredSubjects.map((s) => (
                <div key={s.id} className="gov-list-item">
                  <div className="gov-list-item__icon">
                    {getSubjectTypeIcon(s.subject_type)}
                  </div>
                  <div className="gov-list-item__content">
                    <div className="gov-list-item__primary">
                      <span className="gov-list-item__title">{s.name}</span>
                      <span className="gov-subject-type-badge">{s.subject_type}</span>
                    </div>
                    {s.department_name && (
                      <span className="gov-list-item__sub">{s.department_name}</span>
                    )}
                    {s.description && (
                      <span className="gov-list-item__desc">{s.description}</span>
                    )}
                  </div>
                  <div className="gov-list-item__actions">
                    <button
                      type="button"
                      className="gov-action-btn"
                      onClick={() => onEditSubject(s)}
                      title="Düzenle"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="gov-action-btn gov-action-btn--delete"
                      onClick={() => onDeleteSubject(s.id)}
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SAĞ: Kapsamlar (Şirket, Şube, Departman, vb.) */}
        <div className="gov-split-panel">
          <div className="gov-split-panel__header">
            <div className="gov-split-panel__title">
              <MapPin size={18} />
              <h4>Organizasyon Kapsamları ({scopes.length})</h4>
            </div>
            <button type="button" className="gov-btn-primary gov-btn-sm" onClick={onAddScope}>
              <Plus size={15} />
              <span>Yeni Kapsam</span>
            </button>
          </div>

          <div className="gov-split-panel__filter">
            <select
              className="gov-filter-select"
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
            >
              <option value="all">Tüm Kapsam Türleri</option>
              <option value="organization_wide">Genel Organizasyon</option>
              <option value="company">Şirket</option>
              <option value="branch">Şube / Lokasyon</option>
              <option value="department">Departman</option>
              <option value="team">Ekip</option>
            </select>
          </div>

          {filteredScopes.length === 0 ? (
            <div className="gov-empty-panel">
              <p>Henüz organizasyon kapsamı eklenmedi.</p>
            </div>
          ) : (
            <div className="gov-list-container">
              {filteredScopes.map((sc) => (
                <div key={sc.id} className="gov-list-item">
                  <div className="gov-list-item__icon">
                    <Layers size={14} className="gov-icon-scope" />
                  </div>
                  <div className="gov-list-item__content">
                    <div className="gov-list-item__primary">
                      <span className="gov-list-item__title">{sc.name}</span>
                      {getScopeTypeBadge(sc.scope_type)}
                    </div>
                    {sc.description && (
                      <span className="gov-list-item__desc">{sc.description}</span>
                    )}
                  </div>
                  <div className="gov-list-item__actions">
                    <button
                      type="button"
                      className="gov-action-btn"
                      onClick={() => onEditScope(sc)}
                      title="Düzenle"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="gov-action-btn gov-action-btn--delete"
                      onClick={() => onDeleteScope(sc.id)}
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
