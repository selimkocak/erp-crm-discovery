import React, { useState } from "react";
import { Header } from "./components/Header";
import { HomeView } from "./views/HomeView";
import { NewProjectView } from "./views/NewProjectView";
import { ProjectDetailView } from "./views/ProjectDetailView";

type AppView = "home" | "new-project" | "project-detail";

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>("home");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const handleNavigateHome = () => {
    setActiveProjectId(null);
    setCurrentView("home");
  };

  const handleStartNewProject = () => {
    setActiveProjectId(null);
    setCurrentView("new-project");
  };

  const handleOpenProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView("project-detail");
  };

  const handleProjectCreated = (newProjectId: string) => {
    setActiveProjectId(newProjectId);
    setCurrentView("project-detail");
  };

  return (
    <div className="app-container">
      <Header
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
        onNewProject={handleStartNewProject}
      />

      <main className="main-content">
        {currentView === "home" && (
          <HomeView
            onNewProject={handleStartNewProject}
            onOpenProject={handleOpenProject}
          />
        )}

        {currentView === "new-project" && (
          <NewProjectView
            onCancel={handleNavigateHome}
            onProjectCreated={handleProjectCreated}
          />
        )}

        {currentView === "project-detail" && activeProjectId && (
          <ProjectDetailView
            projectId={activeProjectId}
            onBack={handleNavigateHome}
          />
        )}
      </main>
    </div>
  );
};

export default App;
