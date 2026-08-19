import React, { useEffect, useState } from "react";
import { Plus, FolderOpen, Trash2, Calendar, Building2, Layers, AlertCircle } from "lucide-react";
import { getProjects, deleteProject } from "../db/client";
import type { ProjectListItem } from "../types";

interface HomeViewProps {
  onNewProject: () => void;
  onOpenProject: (projectId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNewProject,
  onOpenProject,
}) => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (err: any) {
      console.error("Projeler yüklenirken hata:", err);
      setError(err?.message || "Veritabanına erişilirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (projectId: string, projectName: string) => {
    if (window.confirm(`"${projectName}" analizini ve bağlı tüm verilerini silmek istediğinize emin misiniz?`)) {
      try {
        await deleteProject(projectId);
        await loadProjects();
      } catch (err: any) {
        alert("Silme işlemi başarısız: " + (err?.message || "Bilinmeyen hata"));
      }
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-header-title">
          <h2>Mevcut Analiz Projeleri</h2>
          <p>Kayıtlı ERP ve CRM ön analiz çalışmalarını listeleyin ve yönetin.</p>
        </div>
        <button className="btn btn-primary" onClick={onNewProject}>
          <Plus size={16} />
          Yeni Analiz
        </button>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "var(--danger-bg)",
            border: "1px solid var(--danger-border)",
            color: "var(--danger-text)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          <p>Analiz verileri yükleniyor...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Layers size={48} />
          </div>
          <h3>Henüz analiz oluşturulmadı.</h3>
          <p>
            Yeni bir ERP / CRM ön analiz projesi başlatmak için aşağıdaki butonu kullanarak firma profili ve kapsam fonksiyonlarını belirleyin.
          </p>
          <button className="btn btn-primary" onClick={onNewProject}>
            <Plus size={16} />
            Yeni Analiz Başlat
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Firma Adı</th>
                <th>Proje / Analiz Adı</th>
                <th>Lokasyon</th>
                <th>Kapsam</th>
                <th>Son Güncelleme</th>
                <th style={{ textAlign: "right" }}>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj) => (
                <tr key={proj.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Building2 size={16} style={{ color: "var(--primary)" }} />
                      <strong style={{ color: "var(--text-primary)" }}>{proj.company_name}</strong>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{proj.name}</span>
                  </td>
                  <td>
                    <span style={{ color: "var(--text-muted)" }}>
                      {proj.city ? proj.city : "—"}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-not-started">
                      {proj.selected_function_count} Fonksiyon
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      <Calendar size={14} />
                      {formatDate(proj.updated_at)}
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.375rem" }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }}
                        onClick={() => onOpenProject(proj.id)}
                      >
                        <FolderOpen size={14} />
                        Aç
                      </button>
                      <button
                        className="btn btn-danger-ghost"
                        style={{ padding: "0.375rem 0.5rem" }}
                        title="Analizi Sil"
                        onClick={() => handleDelete(proj.id, proj.name)}
                      >
                        <Trash2 size={14} />
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
