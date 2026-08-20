import React from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { AppLogo } from "./AppLogo";

interface HeaderProps {
  currentView: "home" | "new-project" | "project-detail";
  onNavigateHome: () => void;
  onNewProject?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateHome,
  onNewProject,
}) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo-area" onClick={onNavigateHome}>
          <AppLogo size={36} />
          <div className="logo-titles">
            <h1>ERP CRM Discovery</h1>
            <p>ERP / CRM Ön Analiz Yönetimi</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {currentView !== "home" ? (
            <button className="btn btn-secondary" onClick={onNavigateHome}>
              <ArrowLeft size={16} />
              Ana Sayfaya Dön
            </button>
          ) : (
            onNewProject && (
              <button className="btn btn-primary" onClick={onNewProject}>
                <Plus size={16} />
                Yeni Analiz
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};
