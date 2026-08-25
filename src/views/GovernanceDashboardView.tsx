// path: /home/selim/projects/erp-crm-discovery/src/views/GovernanceDashboardView.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Database,
  Users,
  Shield,
  Layers,
  DollarSign,
  ShieldAlert,
  Paperclip,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";


import {
  getGovernanceSummary,
  getGovernanceObjects,
  createGovernanceObject,
  updateGovernanceObject,
  deleteGovernanceObject,
  seedDefaultGovernanceObjects,
  getGovernanceSubjects,
  createGovernanceSubject,
  updateGovernanceSubject,
  deleteGovernanceSubject,
  getGovernanceScopes,
  createGovernanceScope,
  updateGovernanceScope,
  deleteGovernanceScope,
  getGovernanceResponsibilities,
  createGovernanceResponsibility,
  updateGovernanceResponsibility,
  deleteGovernanceResponsibility,
  getGovernanceAuthorizations,
  createGovernanceAuthorization,
  updateGovernanceAuthorization,
  deleteGovernanceAuthorization,
  getGovernanceLimits,
  createGovernanceLimit,
  updateGovernanceLimit,
  deleteGovernanceLimit,
  getGovernanceSodRisks,
  createGovernanceSodRisk,
  updateGovernanceSodRisk,
  deleteGovernanceSodRisk,
  getGovernanceAttachments,
} from "../db/client";
import {
  importGovernanceFileToManagedVault,
  removeGovernanceAttachmentPhysicalAndDb,
} from "../storage/attachmentManager";
import type {
  GovernanceSummary,
  GovernanceObject,
  GovernanceSubject,
  GovernanceScope,
  GovernanceResponsibility,
  GovernanceAuthorization,
  GovernanceLimit,
  GovernanceSodRisk,
  GovernanceAttachment,
  GovernanceAttachmentEntityType,
} from "../types/governance";

import { GovernanceSummaryCards } from "../components/governance/GovernanceSummaryCards";
import { ObjectsTab } from "../components/governance/ObjectsTab";
import { ResponsibilityMatrixTab } from "../components/governance/ResponsibilityMatrixTab";
import { AuthorizationMatrixTab } from "../components/governance/AuthorizationMatrixTab";
import { ScopesAndSubjectsTab } from "../components/governance/ScopesAndSubjectsTab";
import { ApprovalLimitsTab } from "../components/governance/ApprovalLimitsTab";
import { SodRiskTab } from "../components/governance/SodRiskTab";
import { GovernanceAttachmentsTab } from "../components/governance/GovernanceAttachmentsTab";
import {
  ObjectModal,
  SubjectModal,
  ScopeModal,
  ResponsibilityModal,
  AuthorizationModal,
  LimitModal,
  SodRiskModal,
} from "../components/governance/GovernanceModals";

import { DataGovernanceSection } from "../components/governance/DataGovernanceSection";

interface GovernanceDashboardViewProps {
  projectId: string;
  projectName?: string;
  companyName?: string;
  isProjectPassive?: boolean;
}

export const GovernanceDashboardView: React.FC<GovernanceDashboardViewProps> = ({
  projectId,
  projectName,
  companyName,
  isProjectPassive = false,
}) => {
  const [activeTab, setActiveTab] = useState<string>("data_governance");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [summary, setSummary] = useState<GovernanceSummary | null>(null);

  // Data states
  const [objects, setObjects] = useState<GovernanceObject[]>([]);
  const [subjects, setSubjects] = useState<GovernanceSubject[]>([]);
  const [scopes, setScopes] = useState<GovernanceScope[]>([]);
  const [responsibilities, setResponsibilities] = useState<GovernanceResponsibility[]>([]);
  const [authorizations, setAuthorizations] = useState<GovernanceAuthorization[]>([]);
  const [limits, setLimits] = useState<GovernanceLimit[]>([]);
  const [sodRisks, setSodRisks] = useState<GovernanceSodRisk[]>([]);
  const [attachments, setAttachments] = useState<GovernanceAttachment[]>([]);

  // Modal states
  const [isObjectModalOpen, setIsObjectModalOpen] = useState(false);
  const [editingObject, setEditingObject] = useState<GovernanceObject | null>(null);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<GovernanceSubject | null>(null);

  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [editingScope, setEditingScope] = useState<GovernanceScope | null>(null);

  const [isRespModalOpen, setIsRespModalOpen] = useState(false);
  const [editingResp, setEditingResp] = useState<GovernanceResponsibility | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingAuth, setEditingAuth] = useState<GovernanceAuthorization | null>(null);

  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [editingLimit, setEditingLimit] = useState<GovernanceLimit | null>(null);

  const [isSodModalOpen, setIsSodModalOpen] = useState(false);
  const [editingSod, setEditingSod] = useState<GovernanceSodRisk | null>(null);

  // In-App Toast Notification state
  const [toast, setToast] = useState<{
    type: "success" | "info" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "info" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [
        sumData,
        objData,
        subData,
        scpData,
        respData,
        authData,
        limData,
        sodData,
        attData,
      ] = await Promise.all([
        getGovernanceSummary(projectId),
        getGovernanceObjects(projectId),
        getGovernanceSubjects(projectId),
        getGovernanceScopes(projectId),
        getGovernanceResponsibilities(projectId),
        getGovernanceAuthorizations(projectId),
        getGovernanceLimits(projectId),
        getGovernanceSodRisks(projectId),
        getGovernanceAttachments(projectId),
      ]);

      setSummary(sumData);
      setObjects(objData);
      setSubjects(subData);
      setScopes(scpData);
      setResponsibilities(respData);
      setAuthorizations(authData);
      setLimits(limData);
      setSodRisks(sodData);
      setAttachments(attData);
    } catch (err) {
      console.error("Yönetişim verileri yüklenirken hata:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Seed default 23 starter objects
  const handleSeedDefaults = async () => {
    if (isProjectPassive) {
      showToast("info", "Bu proje pasiftir. Yönetişim şablonu eklemek için lütfen önce projeyi aktifleştirin.");
      return;
    }
    try {
      setIsSeeding(true);
      const count = await seedDefaultGovernanceObjects(projectId);
      await loadAllData();
      if (count > 0) {
        showToast("success", `${count} adet standart başlangıç yönetişim nesnesi başarıyla eklendi.`);
      } else {
        showToast("info", "Standart başlangıç nesneleri zaten projede mevcut.");
      }
    } catch (err: any) {
      showToast("error", `Nesneler eklenirken hata: ${err?.message || err}`);
    } finally {
      setIsSeeding(false);
    }
  };


  // Object Handlers
  const handleSaveObject = async (payload: any) => {
    if (editingObject) {
      await updateGovernanceObject(editingObject.id, projectId, payload);
    } else {
      await createGovernanceObject({ analysis_project_id: projectId, ...payload });
    }
    await loadAllData();
  };

  const handleDeleteObject = async (id: string) => {
    if (window.confirm("Bu yönetişim nesnesini silmek istediğinize emin misiniz? İlgili yetki ve sorumluluklar da silinecektir.")) {
      await deleteGovernanceObject(id, projectId);
      await loadAllData();
    }
  };

  // Subject Handlers
  const handleSaveSubject = async (payload: any) => {
    if (editingSubject) {
      await updateGovernanceSubject(editingSubject.id, projectId, payload);
    } else {
      await createGovernanceSubject({ analysis_project_id: projectId, ...payload });
    }
    await loadAllData();
  };

  const handleDeleteSubject = async (id: string) => {
    if (window.confirm("Bu özneyi silmek istediğinize emin misiniz? İlgili yetki ve limit atamaları da silinecektir.")) {
      await deleteGovernanceSubject(id, projectId);
      await loadAllData();
    }
  };

  // Scope Handlers
  const handleSaveScope = async (payload: any) => {
    if (editingScope) {
      await updateGovernanceScope(editingScope.id, projectId, payload);
    } else {
      await createGovernanceScope({ analysis_project_id: projectId, ...payload });
    }
    await loadAllData();
  };

  const handleDeleteScope = async (id: string) => {
    if (window.confirm("Bu kapsamı silmek istediğinize emin misiniz?")) {
      await deleteGovernanceScope(id, projectId);
      await loadAllData();
    }
  };

  // Responsibility Handlers
  const handleSaveResp = async (payload: any) => {
    if (editingResp) {
      await updateGovernanceResponsibility(editingResp.id, projectId, payload);
    } else {
      await createGovernanceResponsibility({ analysis_project_id: projectId, ...payload });
    }
    await loadAllData();
  };

  const handleDeleteResp = async (id: string) => {
    if (window.confirm("Bu sorumluluk atamasını silmek istediğinize emin misiniz?")) {
      await deleteGovernanceResponsibility(id, projectId);
      await loadAllData();
    }
  };

  // Authorization Handlers
  const handleSaveAuth = async (payload: any) => {
    if (editingAuth) {
      await updateGovernanceAuthorization(editingAuth.id, projectId, payload);
    } else {
      await createGovernanceAuthorization({ analysis_project_id: projectId, ...payload });
    }
    await loadAllData();
  };

  const handleDeleteAuth = async (id: string) => {
    if (window.confirm("Bu yetki tanımını silmek istediğinize emin misiniz?")) {
      await deleteGovernanceAuthorization(id, projectId);
      await loadAllData();
    }
  };

  // Limit Handlers
  const handleSaveLimit = async (payload: any) => {
    if (editingLimit) {
      await updateGovernanceLimit(editingLimit.id, projectId, payload);
    } else {
      await createGovernanceLimit({ analysis_project_id: projectId, ...payload });
    }
    await loadAllData();
  };

  const handleDeleteLimit = async (id: string) => {
    if (window.confirm("Bu limit tanımını silmek istediğinize emin misiniz?")) {
      await deleteGovernanceLimit(id, projectId);
      await loadAllData();
    }
  };

  // SoD Handlers
  const handleSaveSod = async (payload: any) => {
    if (editingSod) {
      await updateGovernanceSodRisk(editingSod.id, projectId, payload);
    } else {
      await createGovernanceSodRisk({ analysis_project_id: projectId, ...payload });
    }
    await loadAllData();
  };

  const handleDeleteSod = async (id: string) => {
    if (window.confirm("Bu Görevler Ayrılığı (SoD) riskini silmek istediğinize emin misiniz?")) {
      await deleteGovernanceSodRisk(id, projectId);
      await loadAllData();
    }
  };

  // Attachment Handlers
  const handleUploadAttachment = async (
    entityType: GovernanceAttachmentEntityType,
    entityId: string,
    file: File
  ) => {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    await importGovernanceFileToManagedVault({
      projectId,
      entityType,
      entityId,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        data,
      },
    });

    await loadAllData();
  };

  const handleDeleteAttachment = async (att: GovernanceAttachment) => {
    if (window.confirm(`"${att.original_file_name}" dosyasını kasadan silmek istediğinize emin misiniz?`)) {
      await removeGovernanceAttachmentPhysicalAndDb(att.id, projectId, att.relative_path);
      await loadAllData();
    }
  };

  return (
    <div className="gov-dashboard">
      {/* In-App Toast Notification */}
      {toast && (
        <div className={`gov-toast gov-toast--${toast.type}`} role="status">
          {toast.type === "success" && <CheckCircle2 size={18} />}
          {toast.type === "info" && <Info size={18} />}
          {toast.type === "error" && <AlertCircle size={18} />}
          <span>{toast.message}</span>
          <button
            type="button"
            className="gov-toast__close"
            onClick={() => setToast(null)}
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header & Subtitle */}
      <div className="gov-dashboard-header">

        <div>
          <h2 className="gov-dashboard-title">Veri Sahipliği, Yetkiler ve Sorumluluk Yönetişimi</h2>
          <p className="gov-dashboard-subtitle">
            {companyName ? `${companyName} (${projectName || "Proje"}) — ` : ""}
            Şirket genelinde veri sahiplerini (Data Owner), sorumlularını (Steward), kullanıcı yetkilerini,
            onay limitlerini ve Görevler Ayrılığı (SoD) risklerini çevrimdışı olarak haritalandırın.
          </p>
        </div>
        <button
          type="button"
          className="gov-btn-secondary"
          onClick={() => loadAllData()}
          title="Verileri Yenile"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          <span>Yenile</span>
        </button>
      </div>

      {/* KPI Cards */}
      <GovernanceSummaryCards summary={summary} onNavigateTab={(tab) => setActiveTab(tab)} />

      {/* Main Tab Navigation */}
      <div className="gov-nav-tabs">
        <button
          type="button"
          className={`gov-nav-tab ${activeTab === "data_governance" ? "active" : ""}`}
          onClick={() => setActiveTab("data_governance")}
        >
          <Database size={16} />
          <span>Veri Sahipliği & Sorumluluk Matrisi</span>
        </button>
        <button
          type="button"
          className={`gov-nav-tab ${activeTab === "objects" ? "active" : ""}`}
          onClick={() => setActiveTab("objects")}
        >
          <Database size={16} />
          <span>Yönetişim Nesneleri ({objects.length})</span>
        </button>
        <button
          type="button"
          className={`gov-nav-tab ${activeTab === "responsibilities" ? "active" : ""}`}
          onClick={() => setActiveTab("responsibilities")}
        >
          <Users size={16} />
          <span>Sorumluluk Matrisi ({responsibilities.length})</span>
        </button>
        <button
          type="button"
          className={`gov-nav-tab ${activeTab === "authorizations" ? "active" : ""}`}
          onClick={() => setActiveTab("authorizations")}
        >
          <Shield size={16} />
          <span>Yetki Matrisi ({authorizations.length})</span>
        </button>
        <button
          type="button"
          className={`gov-nav-tab ${activeTab === "scopes_subjects" ? "active" : ""}`}
          onClick={() => setActiveTab("scopes_subjects")}
        >
          <Layers size={16} />
          <span>Kapsam ve Özneler ({subjects.length + scopes.length})</span>
        </button>
        <button
          type="button"
          className={`gov-nav-tab ${activeTab === "limits" ? "active" : ""}`}
          onClick={() => setActiveTab("limits")}
        >
          <DollarSign size={16} />
          <span>Onay Limitleri ({limits.length})</span>
        </button>
        <button
          type="button"
          className={`gov-nav-tab ${activeTab === "sod_risks" ? "active" : ""}`}
          onClick={() => setActiveTab("sod_risks")}
        >
          <ShieldAlert size={16} />
          <span>Görevler Ayrılığı ({sodRisks.length})</span>
        </button>
        <button
          type="button"
          className={`gov-nav-tab ${activeTab === "attachments" ? "active" : ""}`}
          onClick={() => setActiveTab("attachments")}
        >
          <Paperclip size={16} />
          <span>Kanıt Kasası ({attachments.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="gov-tab-content-wrapper">
        {activeTab === "data_governance" && (
          <DataGovernanceSection
            projectId={projectId}
            isProjectPassive={isProjectPassive}
          />
        )}

        {activeTab === "objects" && (
          <ObjectsTab
            objects={objects}
            onAddObject={() => {
              setEditingObject(null);
              setIsObjectModalOpen(true);
            }}
            onEditObject={(obj) => {
              setEditingObject(obj);
              setIsObjectModalOpen(true);
            }}
            onDeleteObject={handleDeleteObject}
            onSeedDefaults={handleSeedDefaults}
            isSeeding={isSeeding}
          />
        )}

        {activeTab === "responsibilities" && (
          <ResponsibilityMatrixTab
            responsibilities={responsibilities}
            objects={objects}
            subjects={subjects}
            scopes={scopes}
            onAddResponsibility={() => {
              setEditingResp(null);
              setIsRespModalOpen(true);
            }}
            onEditResponsibility={(resp) => {
              setEditingResp(resp);
              setIsRespModalOpen(true);
            }}
            onDeleteResponsibility={handleDeleteResp}
          />
        )}

        {activeTab === "authorizations" && (
          <AuthorizationMatrixTab
            authorizations={authorizations}
            objects={objects}
            subjects={subjects}
            scopes={scopes}
            onAddAuthorization={() => {
              setEditingAuth(null);
              setIsAuthModalOpen(true);
            }}
            onEditAuthorization={(auth) => {
              setEditingAuth(auth);
              setIsAuthModalOpen(true);
            }}
            onDeleteAuthorization={handleDeleteAuth}
          />
        )}

        {activeTab === "scopes_subjects" && (
          <ScopesAndSubjectsTab
            subjects={subjects}
            scopes={scopes}
            onAddSubject={() => {
              setEditingSubject(null);
              setIsSubjectModalOpen(true);
            }}
            onEditSubject={(subj) => {
              setEditingSubject(subj);
              setIsSubjectModalOpen(true);
            }}
            onDeleteSubject={handleDeleteSubject}
            onAddScope={() => {
              setEditingScope(null);
              setIsScopeModalOpen(true);
            }}
            onEditScope={(scp) => {
              setEditingScope(scp);
              setIsScopeModalOpen(true);
            }}
            onDeleteScope={handleDeleteScope}
          />
        )}

        {activeTab === "limits" && (
          <ApprovalLimitsTab
            limits={limits}
            onAddLimit={() => {
              setEditingLimit(null);
              setIsLimitModalOpen(true);
            }}
            onEditLimit={(lim) => {
              setEditingLimit(lim);
              setIsLimitModalOpen(true);
            }}
            onDeleteLimit={handleDeleteLimit}
          />
        )}

        {activeTab === "sod_risks" && (
          <SodRiskTab
            risks={sodRisks}
            onAddRisk={() => {
              setEditingSod(null);
              setIsSodModalOpen(true);
            }}
            onEditRisk={(risk) => {
              setEditingSod(risk);
              setIsSodModalOpen(true);
            }}
            onDeleteRisk={handleDeleteSod}
          />
        )}

        {activeTab === "attachments" && (
          <GovernanceAttachmentsTab
            attachments={attachments}
            objects={objects}
            responsibilities={responsibilities}
            authorizations={authorizations}
            limits={limits}
            sodRisks={sodRisks}
            onUploadAttachment={handleUploadAttachment}
            onDeleteAttachment={handleDeleteAttachment}
          />
        )}
      </div>

      {/* Modals */}
      <ObjectModal
        isOpen={isObjectModalOpen}
        onClose={() => setIsObjectModalOpen(false)}
        initialData={editingObject}
        onSave={handleSaveObject}
      />

      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        initialData={editingSubject}
        onSave={handleSaveSubject}
      />

      <ScopeModal
        isOpen={isScopeModalOpen}
        onClose={() => setIsScopeModalOpen(false)}
        initialData={editingScope}
        scopes={scopes}
        onSave={handleSaveScope}
      />

      <ResponsibilityModal
        isOpen={isRespModalOpen}
        onClose={() => setIsRespModalOpen(false)}
        initialData={editingResp}
        objects={objects}
        subjects={subjects}
        scopes={scopes}
        onSave={handleSaveResp}
      />

      <AuthorizationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialData={editingAuth}
        objects={objects}
        subjects={subjects}
        scopes={scopes}
        onSave={handleSaveAuth}
      />

      <LimitModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        initialData={editingLimit}
        objects={objects}
        subjects={subjects}
        scopes={scopes}
        onSave={handleSaveLimit}
      />

      <SodRiskModal
        isOpen={isSodModalOpen}
        onClose={() => setIsSodModalOpen(false)}
        initialData={editingSod}
        objects={objects}
        subjects={subjects}
        scopes={scopes}
        onSave={handleSaveSod}
      />
    </div>
  );
};
