import React, { useState } from "react";
import { Header } from "./components/Header";
import { HomeView } from "./views/HomeView";
import { NewProjectView } from "./views/NewProjectView";
import { ProjectDetailView } from "./views/ProjectDetailView";

type AppView = "home" | "new-project" | "edit-project" | "project-detail";

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

  const handleEditProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView("edit-project");
  };

  const handleProjectCreated = (newProjectId: string) => {
    setActiveProjectId(newProjectId);
    setCurrentView("project-detail");
  };

  const handleProjectSaved = (savedProjectId: string) => {
    setActiveProjectId(savedProjectId);
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
            onEditProject={handleEditProject}
          />
        )}

        {currentView === "new-project" && (
          <NewProjectView
            onCancel={handleNavigateHome}
            onProjectCreated={handleProjectCreated}
          />
        )}

        {currentView === "edit-project" && activeProjectId && (
          <NewProjectView
            editProjectId={activeProjectId}
            onCancel={() => {
              setCurrentView("project-detail");
            }}
            onProjectCreated={handleProjectCreated}
            onProjectSaved={handleProjectSaved}
          />
        )}

        {currentView === "project-detail" && activeProjectId && (
          <ProjectDetailView
            projectId={activeProjectId}
            onBack={handleNavigateHome}
            onEditProject={handleEditProject}
          />
        )}
      </main>
    </div>
  );
};

export default App;
