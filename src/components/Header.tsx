import React from "react";
import { Plus, ArrowLeft, Home, Info } from "lucide-react";
import { AppLogo } from "./AppLogo";

interface HeaderProps {
  currentView: "home" | "new-project" | "edit-project" | "project-detail";
  onNavigateHome: () => void;
  onNewProject?: () => void;
  onOpenAbout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateHome,
  onNewProject,
  onOpenAbout,
}) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo-area" onClick={onNavigateHome} style={{ cursor: "pointer" }}>
          <AppLogo size={36} />
          <div className="logo-titles">
            <h1>ERP CRM Discovery</h1>
            <p>ERP / CRM Ön Analiz Yönetimi</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {onOpenAbout && (
            <button
              className="btn btn-secondary btn-about btn--sm"
              onClick={onOpenAbout}
              title="ERP CRM Discovery Hakkında"
              aria-label="Uygulama Hakkında"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
            >
              <Info size={15} />
              <span>Hakkında</span>
            </button>
          )}

          {currentView !== "home" ? (
            <button
              className="btn btn-nav-home"
              onClick={onNavigateHome}
              title="Ana Sayfaya Dön"
            >
              <ArrowLeft size={15} />
              <Home size={15} />
              <span>Ana Sayfaya Dön</span>
            </button>
          ) : (
            onNewProject && (
              <button className="btn btn-primary btn--start" onClick={onNewProject}>
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
