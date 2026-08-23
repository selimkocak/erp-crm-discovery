// path: /home/selim/projects/erp-crm-discovery/src/components/governance/ObjectsTab.tsx
import React, { useState } from "react";
import { Plus, Sparkles, Pencil, Trash2, Database, Search } from "lucide-react";
import type { GovernanceObject } from "../../types/governance";

interface ObjectsTabProps {
  objects: GovernanceObject[];
  onAddObject: () => void;
  onEditObject: (obj: GovernanceObject) => void;
  onDeleteObject: (id: string) => void;
  onSeedDefaults: () => Promise<void>;
  isSeeding: boolean;
}

export const ObjectsTab: React.FC<ObjectsTabProps> = ({
  objects,
  onAddObject,
  onEditObject,
  onDeleteObject,
  onSeedDefaults,
  isSeeding,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = objects.filter((o) => {
    const matchesSearch =
      o.name_tr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.related_bf_code && o.related_bf_code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === "all" || o.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "master_data":
        return <span className="gov-pill gov-pill--blue">Ana Veri</span>;
      case "transactional":
        return <span className="gov-pill gov-pill--emerald">Hareket / Süreç</span>;
      case "financial":
        return <span className="gov-pill gov-pill--indigo">Finans / Muhasebe</span>;
      case "system":
        return <span className="gov-pill gov-pill--purple">Sistem & Güvenlik</span>;
      default:
        return <span className="gov-pill gov-pill--gray">{cat}</span>;
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
              placeholder="Nesne adı, kod veya modül ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="gov-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tüm Kategoriler ({objects.length})</option>
            <option value="master_data">Ana Veri</option>
            <option value="transactional">Hareket / Süreç</option>
            <option value="financial">Finans / Muhasebe</option>
            <option value="system">Sistem & Güvenlik</option>
          </select>
        </div>
        <div className="gov-tab-toolbar__right">
          <button
            type="button"
            className="gov-btn-seed"
            onClick={onSeedDefaults}
            disabled={isSeeding}
            title="Standart 23 kanonik yönetişim nesnesini projeye ekler"
          >
            <Sparkles size={16} />
            <span>{isSeeding ? "Ekleniyor..." : "Başlangıç Nesnelerini Ekle"}</span>
          </button>
          <button type="button" className="gov-btn-primary" onClick={onAddObject}>
            <Plus size={16} />
            <span>Yeni Nesne</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="gov-empty-state">
          <Database size={40} className="gov-empty-icon" />
          <h4>Henüz Yönetişim Nesnesi Tanımlanmadı</h4>
          <p>
            Projenin veri sahipliğini ve yetki matrisini oluşturmak için yukarıdaki{" "}
            <strong>"Başlangıç Nesnelerini Ekle"</strong> butonuna tıklayarak standart 23 kanonik nesneyi
            yükleyebilir veya özel nesneler ekleyebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="gov-table-container">
          <table className="gov-table" role="table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Sıra</th>
                <th>Nesne Kodu</th>
                <th>Nesne Adı (TR / EN)</th>
                <th>Kategori</th>
                <th>İlgili Fonksiyon</th>
                <th>Açıklama</th>
                <th style={{ width: "100px", textAlign: "right" }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((obj, idx) => (
                <tr key={obj.id}>
                  <td><span className="gov-order-badge">{obj.sort_order || idx + 1}</span></td>
                  <td><code className="gov-code-badge">{obj.code}</code></td>
                  <td>
                    <div className="gov-name-cell">
                      <span className="gov-name-tr">{obj.name_tr}</span>
                      {obj.name_en && obj.name_en !== obj.name_tr && (
                        <span className="gov-name-en">{obj.name_en}</span>
                      )}
                    </div>
                  </td>
                  <td>{getCategoryBadge(obj.category)}</td>
                  <td>
                    {obj.related_bf_code ? (
                      <span className="gov-bf-badge">{obj.related_bf_code}</span>
                    ) : (
                      <span className="gov-text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <span className="gov-desc-text" title={obj.description || ""}>
                      {obj.description || "—"}
                    </span>
                  </td>
                  <td>
                    <div className="gov-row-actions">
                      <button
                        type="button"
                        className="gov-action-btn"
                        onClick={() => onEditObject(obj)}
                        title="Düzenle"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="gov-action-btn gov-action-btn--delete"
                        onClick={() => onDeleteObject(obj.id)}
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
