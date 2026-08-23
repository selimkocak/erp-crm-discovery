// path: /home/selim/projects/erp-crm-discovery/src/components/governance/GovernanceModals.tsx
import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import type {
  GovernanceObject,
  GovernanceSubject,
  GovernanceScope,
  GovernanceResponsibility,
  GovernanceAuthorization,
  GovernanceLimit,
  GovernanceSodRisk,
  GovernanceSubjectType,
  GovernanceScopeType,
  GovernanceResponsibilityType,
  GovernancePermissionLevel,
  GovernancePermissionSource,
  GovernanceStateType,
  GovernanceRiskSeverity,
  GovernanceRiskStatus,
} from "../../types/governance";

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ModalBase: React.FC<ModalBaseProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="gov-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="gov-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="gov-modal-header">
          <h3 className="gov-modal-title">{title}</h3>
          <button className="gov-modal-close-btn" onClick={onClose} aria-label="Kapat">
            <X size={20} />
          </button>
        </div>
        <div className="gov-modal-body">{children}</div>
      </div>
    </div>
  );
};

// ============================================================================
// 1. Object Modal (Yönetişim Nesnesi)
// ============================================================================

interface ObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: GovernanceObject | null;
  onSave: (data: { category: string; code: string; name_tr: string; name_en?: string; related_bf_code?: string; description?: string }) => Promise<void>;
}

export const ObjectModal: React.FC<ObjectModalProps> = ({ isOpen, onClose, initialData, onSave }) => {
  const [category, setCategory] = useState("master_data");
  const [code, setCode] = useState("");
  const [nameTr, setNameTr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [relatedBf, setRelatedBf] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || "master_data");
      setCode(initialData.code || "");
      setNameTr(initialData.name_tr || "");
      setNameEn(initialData.name_en || "");
      setRelatedBf(initialData.related_bf_code || "");
      setDescription(initialData.description || "");
    } else {
      setCategory("master_data");
      setCode("");
      setNameTr("");
      setNameEn("");
      setRelatedBf("");
      setDescription("");
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !nameTr.trim()) {
      setError("Kod ve Nesne Adı (TR) alanları zorunludur.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await onSave({
        category,
        code: code.trim().toUpperCase(),
        name_tr: nameTr.trim(),
        name_en: nameEn.trim() || nameTr.trim(),
        related_bf_code: relatedBf.trim().toUpperCase() || undefined,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={initialData ? "Yönetişim Nesnesini Düzenle" : "Yeni Yönetişim Nesnesi"}>
      <form onSubmit={handleSubmit} className="gov-form">
        {error && <div className="gov-form-error"><AlertCircle size={16} /><span>{error}</span></div>}
        <div className="gov-form-row">
          <div className="gov-form-group">
            <label>Kategori *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="master_data">Ana Veri (Master Data)</option>
              <option value="transactional">Operasyonel / Hareket (Transactional)</option>
              <option value="financial">Finansal / Muhasebe (Financial)</option>
              <option value="system">Sistem ve Güvenlik (System)</option>
            </select>
          </div>
          <div className="gov-form-group">
            <label>Nesne Kodu *</label>
            <input type="text" placeholder="Örn: GO_ITEM_MASTER" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
        </div>
        <div className="gov-form-row">
          <div className="gov-form-group">
            <label>Nesne Adı (Türkçe) *</label>
            <input type="text" placeholder="Örn: Stok / Malzeme Kartı" value={nameTr} onChange={(e) => setNameTr(e.target.value)} required />
          </div>
          <div className="gov-form-group">
            <label>Nesne Adı (İngilizce)</label>
            <input type="text" placeholder="Örn: Item / Material Master" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </div>
        </div>
        <div className="gov-form-group">
          <label>İlgili İş Fonksiyonu Kodu</label>
          <input type="text" placeholder="Örn: INVENTORY, SALES, FINANCE" value={relatedBf} onChange={(e) => setRelatedBf(e.target.value)} />
        </div>
        <div className="gov-form-group">
          <label>Açıklama ve Yönetişim Notları</label>
          <textarea rows={3} placeholder="Nesnenin kapsamı ve iş tanımı..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="gov-form-actions">
          <button type="button" className="gov-btn-cancel" onClick={onClose}>Vazgeç</button>
          <button type="submit" className="gov-btn-primary" disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
        </div>
      </form>
    </ModalBase>
  );
};

// ============================================================================
// 2. Subject Modal (Kullanıcı / Grup / Rol)
// ============================================================================

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: GovernanceSubject | null;
  onSave: (data: { subject_type: GovernanceSubjectType; name: string; department_name?: string; description?: string }) => Promise<void>;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({ isOpen, onClose, initialData, onSave }) => {
  const [subjectType, setSubjectType] = useState<GovernanceSubjectType>("role");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSubjectType(initialData.subject_type || "role");
      setName(initialData.name || "");
      setDepartment(initialData.department_name || "");
      setDescription(initialData.description || "");
    } else {
      setSubjectType("role");
      setName("");
      setDepartment("");
      setDescription("");
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Özne Adı zorunludur.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await onSave({
        subject_type: subjectType,
        name: name.trim(),
        department_name: department.trim() || undefined,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Kayıt hatası.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={initialData ? "Özneyi Düzenle" : "Yeni Özne (Kullanıcı / Grup / Rol)"}>
      <form onSubmit={handleSubmit} className="gov-form">
        {error && <div className="gov-form-error"><AlertCircle size={16} /><span>{error}</span></div>}
        <div className="gov-form-row">
          <div className="gov-form-group">
            <label>Özne Türü *</label>
            <select value={subjectType} onChange={(e) => setSubjectType(e.target.value as GovernanceSubjectType)}>
              <option value="role">Rol / Pozisyon (Örn: Satın Alma Müdürü)</option>
              <option value="group">Grup (Örn: Muhasebe Kullanıcıları)</option>
              <option value="user">Kullanıcı / Kişi (Örn: Ahmet Yılmaz)</option>
            </select>
          </div>
          <div className="gov-form-group">
            <label>Özne Adı *</label>
            <input type="text" placeholder="Örn: Satış Temsilcisi" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        </div>
        <div className="gov-form-group">
          <label>Departman / Birim</label>
          <input type="text" placeholder="Örn: Tedarik Zinciri" value={department} onChange={(e) => setDepartment(e.target.value)} />
        </div>
        <div className="gov-form-group">
          <label>Açıklama</label>
          <textarea rows={2} placeholder="Özne yetki kapsamı ve açıklaması..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="gov-form-actions">
          <button type="button" className="gov-btn-cancel" onClick={onClose}>Vazgeç</button>
          <button type="submit" className="gov-btn-primary" disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
        </div>
      </form>
    </ModalBase>
  );
};

// ============================================================================
// 3. Scope Modal (Organizasyon Kapsamı)
// ============================================================================

interface ScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: GovernanceScope | null;
  scopes: GovernanceScope[];
  onSave: (data: { scope_type: GovernanceScopeType; name: string; parent_scope_id?: string; description?: string }) => Promise<void>;
}

export const ScopeModal: React.FC<ScopeModalProps> = ({ isOpen, onClose, initialData, scopes, onSave }) => {
  const [scopeType, setScopeType] = useState<GovernanceScopeType>("company");
  const [name, setName] = useState("");
  const [parentScopeId, setParentScopeId] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setScopeType(initialData.scope_type || "company");
      setName(initialData.name || "");
      setParentScopeId(initialData.parent_scope_id || "");
      setDescription(initialData.description || "");
    } else {
      setScopeType("company");
      setName("");
      setParentScopeId("");
      setDescription("");
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Kapsam Adı zorunludur.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await onSave({
        scope_type: scopeType,
        name: name.trim(),
        parent_scope_id: parentScopeId || undefined,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Kayıt hatası.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={initialData ? "Kapsamı Düzenle" : "Yeni Organizasyon Kapsamı"}>
      <form onSubmit={handleSubmit} className="gov-form">
        {error && <div className="gov-form-error"><AlertCircle size={16} /><span>{error}</span></div>}
        <div className="gov-form-row">
          <div className="gov-form-group">
            <label>Kapsam Türü *</label>
            <select value={scopeType} onChange={(e) => setScopeType(e.target.value as GovernanceScopeType)}>
              <option value="organization_wide">Tüm Organizasyon (Genel)</option>
              <option value="company">Şirket / Tüzel Kişilik</option>
              <option value="branch">Şube / Lokasyon / Tesis</option>
              <option value="department">Departman / Birim</option>
              <option value="team">Ekip / Takım</option>
              <option value="dataset">Veri Kümesi / Segment</option>
              <option value="custom">Özel Kapsam</option>
            </select>
          </div>
          <div className="gov-form-group">
            <label>Kapsam Adı *</label>
            <input type="text" placeholder="Örn: Bursa Fabrikası, Merkez Ofis" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        </div>
        <div className="gov-form-group">
          <label>Üst Kapsam (Opsiyonel)</label>
          <select value={parentScopeId} onChange={(e) => setParentScopeId(e.target.value)}>
            <option value="">-- Üst Kapsam Yok (Kök Seviye) --</option>
            {scopes.filter((s) => s.id !== initialData?.id).map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.scope_type})</option>
            ))}
          </select>
        </div>
        <div className="gov-form-group">
          <label>Açıklama</label>
          <textarea rows={2} placeholder="Kapsam detayları..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="gov-form-actions">
          <button type="button" className="gov-btn-cancel" onClick={onClose}>Vazgeç</button>
          <button type="submit" className="gov-btn-primary" disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
        </div>
      </form>
    </ModalBase>
  );
};

// ============================================================================
// 4. Responsibility Modal (Sorumluluk Matrisi)
// ============================================================================

interface ResponsibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: GovernanceResponsibility | null;
  objects: GovernanceObject[];
  subjects: GovernanceSubject[];
  scopes: GovernanceScope[];
  onSave: (data: {
    governance_object_id: string;
    subject_id: string;
    responsibility_type: GovernanceResponsibilityType;
    scope_id?: string;
    state_type: GovernanceStateType;
    notes?: string;
  }) => Promise<void>;
}

export const ResponsibilityModal: React.FC<ResponsibilityModalProps> = ({
  isOpen,
  onClose,
  initialData,
  objects,
  subjects,
  scopes,
  onSave,
}) => {
  const [objectId, setObjectId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [respType, setRespType] = useState<GovernanceResponsibilityType>("data_owner");
  const [scopeId, setScopeId] = useState("");
  const [stateType, setStateType] = useState<GovernanceStateType>("as_is");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setObjectId(initialData.governance_object_id || "");
      setSubjectId(initialData.subject_id || "");
      setRespType(initialData.responsibility_type || "data_owner");
      setScopeId(initialData.scope_id || "");
      setStateType(initialData.state_type || "as_is");
      setNotes(initialData.notes || "");
    } else {
      setObjectId(objects[0]?.id || "");
      setSubjectId(subjects[0]?.id || "");
      setRespType("data_owner");
      setScopeId("");
      setStateType("as_is");
      setNotes("");
    }
    setError(null);
  }, [initialData, isOpen, objects, subjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectId || !subjectId) {
      setError("Yönetişim Nesnesi ve Atanan Özne alanları zorunludur.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await onSave({
        governance_object_id: objectId,
        subject_id: subjectId,
        responsibility_type: respType,
        scope_id: scopeId || undefined,
        state_type: stateType,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Kayıt hatası.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={initialData ? "Sorumluluğu Düzenle" : "Yeni Sorumluluk Ataması"}>
      <form onSubmit={handleSubmit} className="gov-form">
        {error && <div className="gov-form-error"><AlertCircle size={16} /><span>{error}</span></div>}
        <div className="gov-form-row">
          <div className="gov-form-group">
            <label>Yönetişim Nesnesi *</label>
            <select value={objectId} onChange={(e) => setObjectId(e.target.value)} required>
              {objects.map((o) => (
                <option key={o.id} value={o.id}>{o.name_tr} ({o.code})</option>
              ))}
            </select>
          </div>
          <div className="gov-form-group">
            <label>Sorumluluk Türü *</label>
            <select value={respType} onChange={(e) => setRespType(e.target.value as GovernanceResponsibilityType)}>
              <option value="data_owner">Veri Sahibi (Data Owner — Anlam ve Kural)</option>
              <option value="data_steward">Veri Sorumlusu (Data Steward — Kalite ve Operasyon)</option>
              <option value="technical_custodian">Teknik Emanetçi (Technical Custodian — Sistem/DB)</option>
              <option value="approver">Onay Sahibi (Approver — Süreç Onayı)</option>
              <option value="process_owner">Süreç Sahibi (Process Owner)</option>
              <option value="control_owner">Kontrol Sahibi (Control Owner)</option>
            </select>
          </div>
        </div>
        <div className="gov-form-row">
          <div className="gov-form-group">
            <label>Atanan Özne (Kişi/Grup/Rol) *</label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.subject_type})</option>
              ))}
            </select>
          </div>
          <div className="gov-form-group">
            <label>Kapsam</label>
            <select value={scopeId} onChange={(e) => setScopeId(e.target.value)}>
              <option value="">-- Tüm Organizasyon (Genel) --</option>
              {scopes.map((sc) => (
                <option key={sc.id} value={sc.id}>{sc.name} ({sc.scope_type})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="gov-form-group">
          <label>Durum Modeli</label>
          <div className="gov-radio-group">
            <label><input type="radio" name="resp_state" value="as_is" checked={stateType === "as_is"} onChange={() => setStateType("as_is")} /> Mevcut Durum (As-Is)</label>
            <label><input type="radio" name="resp_state" value="to_be" checked={stateType === "to_be"} onChange={() => setStateType("to_be")} /> Hedeflenen Model (To-Be)</label>
          </div>
        </div>
        <div className="gov-form-group">
          <label>Notlar</label>
          <textarea rows={2} placeholder="Sorumluluk kapsamı ve detayları..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="gov-form-actions">
          <button type="button" className="gov-btn-cancel" onClick={onClose}>Vazgeç</button>
          <button type="submit" className="gov-btn-primary" disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
        </div>
      </form>
    </ModalBase>
  );
};

// ============================================================================
// 5. Authorization Modal (Yetki Matrisi)
// ============================================================================

interface AuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: GovernanceAuthorization | null;
  objects: GovernanceObject[];
  subjects: GovernanceSubject[];
  scopes: GovernanceScope[];
  onSave: (data: {
    governance_object_id: string;
    subject_id: string;
    scope_id?: string;
    permission_level: GovernancePermissionLevel;
    permission_source: GovernancePermissionSource;
    effective_level?: GovernancePermissionLevel;
    has_discrepancy?: number;
    can_view: number;
    can_create: number;
    can_edit: number;
    can_delete: number;
    can_approve: number;
    can_cancel: number;
    can_export: number;
    can_view_cost: number;
    state_type: GovernanceStateType;
    notes?: string;
  }) => Promise<void>;
}

export const AuthorizationModal: React.FC<AuthorizationModalProps> = ({
  isOpen,
  onClose,
  initialData,
  objects,
  subjects,
  scopes,
  onSave,
}) => {
  const [objectId, setObjectId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [scopeId, setScopeId] = useState("");
  const [permLevel, setPermLevel] = useState<GovernancePermissionLevel>("read_only");
  const [permSource, setPermSource] = useState<GovernancePermissionSource>("direct");
  const [effectiveLevel, setEffectiveLevel] = useState<GovernancePermissionLevel | "">("");
  const [canView, setCanView] = useState(1);
  const [canCreate, setCanCreate] = useState(0);
  const [canEdit, setCanEdit] = useState(0);
  const [canDelete, setCanDelete] = useState(0);
  const [canApprove, setCanApprove] = useState(0);
  const [canCancel, setCanCancel] = useState(0);
  const [canExport, setCanExport] = useState(0);
  const [canViewCost, setCanViewCost] = useState(0);
  const [stateType, setStateType] = useState<GovernanceStateType>("as_is");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setObjectId(initialData.governance_object_id || "");
      setSubjectId(initialData.subject_id || "");
      setScopeId(initialData.scope_id || "");
      setPermLevel(initialData.permission_level || "read_only");
      setPermSource(initialData.permission_source || "direct");
      setEffectiveLevel(initialData.effective_level || "");
      setCanView(initialData.can_view ?? 1);
      setCanCreate(initialData.can_create ?? 0);
      setCanEdit(initialData.can_edit ?? 0);
      setCanDelete(initialData.can_delete ?? 0);
      setCanApprove(initialData.can_approve ?? 0);
      setCanCancel(initialData.can_cancel ?? 0);
      setCanExport(initialData.can_export ?? 0);
      setCanViewCost(initialData.can_view_cost ?? 0);
      setStateType(initialData.state_type || "as_is");
      setNotes(initialData.notes || "");
    } else {
      setObjectId(objects[0]?.id || "");
      setSubjectId(subjects[0]?.id || "");
      setScopeId("");
      setPermLevel("read_only");
      setPermSource("direct");
      setEffectiveLevel("");
      setCanView(1);
      setCanCreate(0);
      setCanEdit(0);
      setCanDelete(0);
      setCanApprove(0);
      setCanCancel(0);
      setCanExport(0);
      setCanViewCost(0);
      setStateType("as_is");
      setNotes("");
    }
    setError(null);
  }, [initialData, isOpen, objects, subjects]);

  const handleLevelChange = (lvl: GovernancePermissionLevel) => {
    setPermLevel(lvl);
    if (lvl === "full") {
      setCanView(1); setCanCreate(1); setCanEdit(1); setCanDelete(1); setCanApprove(1); setCanCancel(1); setCanExport(1);
    } else if (lvl === "read_only") {
      setCanView(1); setCanCreate(0); setCanEdit(0); setCanDelete(0); setCanApprove(0); setCanCancel(0); setCanExport(0);
    } else if (lvl === "none") {
      setCanView(0); setCanCreate(0); setCanEdit(0); setCanDelete(0); setCanApprove(0); setCanCancel(0); setCanExport(0); setCanViewCost(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectId || !subjectId) {
      setError("Yönetişim Nesnesi ve Özne alanları zorunludur.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const hasDiscrepancy = effectiveLevel && effectiveLevel !== permLevel ? 1 : 0;
      await onSave({
        governance_object_id: objectId,
        subject_id: subjectId,
        scope_id: scopeId || undefined,
        permission_level: permLevel,
        permission_source: permSource,
        effective_level: (effectiveLevel as GovernancePermissionLevel) || undefined,
        has_discrepancy: hasDiscrepancy,
        can_view: canView,
        can_create: canCreate,
        can_edit: canEdit,
        can_delete: canDelete,
        can_approve: canApprove,
        can_cancel: canCancel,
        can_export: canExport,
        can_view_cost: canViewCost,
        state_type: stateType,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Kayıt hatası.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={initialData ? "Yetki Kaydını Düzenle" : "Yeni Yetki Tanımı"}>
      <form onSubmit={handleSubmit} className="gov-form">
        {error && <div className="gov-form-error"><AlertCircle size={16} /><span>{error}</span></div>}
        <div className="gov-form-row">
          <div className="gov-form-group">
            <label>Özne (Kullanıcı / Grup / Rol) *</label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.subject_type})</option>
              ))}
            </select>
          </div>
          <div className="gov-form-group">
            <label>Yönetişim Nesnesi *</label>
            <select value={objectId} onChange={(e) => setObjectId(e.target.value)} required>
              {objects.map((o) => (
                <option key={o.id} value={o.id}>{o.name_tr} ({o.code})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="gov-form-row">
          <div className="gov-form-group">
            <label>Beyan Edilen Yetki Seviyesi *</label>
            <select value={permLevel} onChange={(e) => handleLevelChange(e.target.value as GovernancePermissionLevel)}>
              <option value="full">Tam Yetki (Full Access)</option>
              <option value="read_only">Salt Okunur (Read Only)</option>
              <option value="none">Yetki Yok (No Access)</option>
              <option value="partial">Kısmi / Özel (Partial)</option>
              <option value="unspecified">Belirtilmedi</option>
            </select>
          </div>
          <div className="gov-form-group">
            <label>Yetki Kaynağı</label>
            <select value={permSource} onChange={(e) => setPermSource(e.target.value as GovernancePermissionSource)}>
              <option value="direct">Doğrudan Atama (Direct)</option>
              <option value="role">Rol Bazlı (Role Based)</option>
              <option value="group">Grup Üyeliği (Group)</option>
              <option value="inherited">Miras / Üst Pozisyon (Inherited)</option>
              <option value="exception">Özel İstisna (Exception)</option>
            </select>
          </div>
        </div>
        <div className="gov-form-row">
          <div className="gov-form-group">
            <label>Gözlenen / Fiili Efektif Yetki (Sapma Tespiti)</label>
            <select value={effectiveLevel} onChange={(e) => setEffectiveLevel(e.target.value as GovernancePermissionLevel | "")}>
              <option value="">-- Beyan ile Aynı (Sapma Yok) --</option>
              <option value="full">Fiilen Tam Yetkili</option>
              <option value="read_only">Fiilen Salt Okunur</option>
              <option value="none">Fiilen Yetkisiz</option>
              <option value="partial">Fiilen Kısmi Yetkili</option>
            </select>
          </div>
          <div className="gov-form-group">
            <label>Kapsam</label>
            <select value={scopeId} onChange={(e) => setScopeId(e.target.value)}>
              <option value="">-- Tüm Organizasyon (Genel) --</option>
              {scopes.map((sc) => (
                <option key={sc.id} value={sc.id}>{sc.name} ({sc.scope_type})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="gov-form-group">
          <label>İşlem Düzeyi İzinleri</label>
          <div className="gov-checkbox-grid">
            <label><input type="checkbox" checked={canView === 1} onChange={(e) => setCanView(e.target.checked ? 1 : 0)} /> Görüntüleme (View)</label>
            <label><input type="checkbox" checked={canCreate === 1} onChange={(e) => setCanCreate(e.target.checked ? 1 : 0)} /> Yeni Ekleme (Create)</label>
            <label><input type="checkbox" checked={canEdit === 1} onChange={(e) => setCanEdit(e.target.checked ? 1 : 0)} /> Düzenleme (Edit)</label>
            <label><input type="checkbox" checked={canDelete === 1} onChange={(e) => setCanDelete(e.target.checked ? 1 : 0)} /> Silme (Delete)</label>
            <label><input type="checkbox" checked={canApprove === 1} onChange={(e) => setCanApprove(e.target.checked ? 1 : 0)} /> Onaylama (Approve)</label>
            <label><input type="checkbox" checked={canCancel === 1} onChange={(e) => setCanCancel(e.target.checked ? 1 : 0)} /> İptal Etme (Cancel)</label>
            <label><input type="checkbox" checked={canExport === 1} onChange={(e) => setCanExport(e.target.checked ? 1 : 0)} /> Dışa Aktarma (Export)</label>
            <label><input type="checkbox" checked={canViewCost === 1} onChange={(e) => setCanViewCost(e.target.checked ? 1 : 0)} /> Maliyet Görme (Cost View)</label>
          </div>
        </div>
        <div className="gov-form-group">
          <label>Durum Modeli</label>
          <div className="gov-radio-group">
            <label><input type="radio" name="auth_state" value="as_is" checked={stateType === "as_is"} onChange={() => setStateType("as_is")} /> Mevcut Durum (As-Is)</label>
            <label><input type="radio" name="auth_state" value="to_be" checked={stateType === "to_be"} onChange={() => setStateType("to_be")} /> Hedeflenen Model (To-Be)</label>
          </div>
        </div>
        <div className="gov-form-group">
          <label>Notlar</label>
          <textarea rows={2} placeholder="Yetki kısıtları, istisnalar..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="gov-form-actions">
          <button type="button" className="gov-btn-cancel" onClick={onClose}>Vazgeç</button>
          <button type="submit" className="gov-btn-primary" disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
        </div>
      </form>
    </ModalBase>
  );
};

// ============================================================================
// 6. Limit Modal (Limit ve Onay Yetkileri)
// ============================================================================

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: GovernanceLimit | null;
  objects: GovernanceObject[];
  subjects: GovernanceSubject[];
  scopes: GovernanceScope[];
  onSave: (data: {
    governance_object_id?: string;
    subject_id: string;
    scope_id?: string;
    limit_type: string;
    currency_or_unit: string;
    min_value?: number;
    max_value?: number;
    approval_tier?: string;
    approver_subject_id?: string;
    state_type: GovernanceStateType;
    notes?: string;
  }) => Promise<void>;
}

export const LimitModal: React.FC<LimitModalProps> = ({
  isOpen,
  onClose,
  initialData,
  objects,
  subjects,
  scopes,
  onSave,
}) => {
  const [limitType, setLimitType] = useState("Satın Alma Sipariş Limiti");
  const [objectId, setObjectId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [scopeId, setScopeId] = useState("");
  const [currencyUnit, setCurrencyUnit] = useState("TRY");
  const [minValue, setMinValue] = useState<string>("");
  const [maxValue, setMaxValue] = useState<string>("");
  const [approvalTier, setApprovalTier] = useState("1. Kademe Onay");
  const [approverId, setApproverId] = useState("");
  const [stateType, setStateType] = useState<GovernanceStateType>("as_is");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setLimitType(initialData.limit_type || "Satın Alma Sipariş Limiti");
      setObjectId(initialData.governance_object_id || "");
      setSubjectId(initialData.subject_id || "");
      setScopeId(initialData.scope_id || "");
      setCurrencyUnit(initialData.currency_or_unit || "TRY");
      setMinValue(initialData.min_value != null ? String(initialData.min_value) : "");
      setMaxValue(initialData.max_value != null ? String(initialData.max_value) : "");
      setApprovalTier(initialData.approval_tier || "1. Kademe Onay");
      setApproverId(initialData.approver_subject_id || "");
      setStateType(initialData.state_type || "as_is");
      setNotes(initialData.notes || "");
    } else {
      setLimitType("Satın Alma Sipariş Limiti");
      setObjectId("");
      setSubjectId(subjects[0]?.id || "");
      setScopeId("");
      setCurrencyUnit("TRY");
      setMinValue("");
      setMaxValue("");
      setApprovalTier("1. Kademe Onay");
      setApproverId("");
      setStateType("as_is");
      setNotes("");
    }
    setError(null);
  }, [initialData, isOpen, subjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !limitType.trim()) {
      setError("Limit Türü ve Özne alanları zorunludur.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await onSave({
        governance_object_id: objectId || undefined,
        subject_id: subjectId,
        scope_id: scopeId || undefined,
        limit_type: limitType.trim(),
        currency_or_unit: currencyUnit,
        min_value: minValue ? Number(minValue) : undefined,
        max_value: maxValue ? Number(maxValue) : undefined,
        approval_tier: approvalTier.trim() || undefined,
        approver_subject_id: approverId || undefined,
        state_type: stateType,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Kayıt hatası.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={initialData ? "Onay Limitini Düzenle" : "Yeni Limit ve Onay Tanımı"}>
      <form onSubmit={handleSubmit} className="gov-form">
        {error && <div className="gov-form-error"><AlertCircle size={16} /><span>{error}</span></div>}
        <div className="gov-form-row">
          <div className="gov-form-group">
            <label>Limit Türü *</label>
            <input type="text" placeholder="Örn: Satın Alma Limiti, İskonto Onayı" value={limitType} onChange={(e) => setLimitType(e.target.value)} required />
          </div>
          <div className="gov-form-group">
            <label>Limit Sahibi (Özne) *</label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.subject_type})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="gov-form-row">
          <div className="gov-form-group">
            <label>Para Birimi / Birim</label>
            <select value={currencyUnit} onChange={(e) => setCurrencyUnit(e.target.value)}>
              <option value="TRY">TRY (₺)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="%">Yüzde (%)</option>
              <option value="adet">Adet</option>
              <option value="gün">Gün</option>
              <option value="özel">Özel</option>
            </select>
          </div>
          <div className="gov-form-group">
            <label>Min Değer</label>
            <input type="number" step="any" placeholder="0" value={minValue} onChange={(e) => setMinValue(e.target.value)} />
          </div>
          <div className="gov-form-group">
            <label>Max Değer</label>
            <input type="number" step="any" placeholder="50000" value={maxValue} onChange={(e) => setMaxValue(e.target.value)} />
          </div>
        </div>
        <div className="gov-form-row">
          <div className="gov-form-group">
            <label>Onay Kademesi</label>
            <input type="text" placeholder="Örn: 1. Kademe, Yönetim Kurulu" value={approvalTier} onChange={(e) => setApprovalTier(e.target.value)} />
          </div>
          <div className="gov-form-group">
            <label>Onaylayan Üst Rol / Kişi</label>
            <select value={approverId} onChange={(e) => setApproverId(e.target.value)}>
              <option value="">-- Yok / Doğrudan Yetki --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.subject_type})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="gov-form-row">
          <div className="gov-form-group">
            <label>İlgili Nesne (Opsiyonel)</label>
            <select value={objectId} onChange={(e) => setObjectId(e.target.value)}>
              <option value="">-- Genel / Nesne Seçilmedi --</option>
              {objects.map((o) => (
                <option key={o.id} value={o.id}>{o.name_tr}</option>
              ))}
            </select>
          </div>
          <div className="gov-form-group">
            <label>Kapsam</label>
            <select value={scopeId} onChange={(e) => setScopeId(e.target.value)}>
              <option value="">-- Tüm Organizasyon --</option>
              {scopes.map((sc) => (
                <option key={sc.id} value={sc.id}>{sc.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="gov-form-group">
          <label>Durum Modeli</label>
          <div className="gov-radio-group">
            <label><input type="radio" name="limit_state" value="as_is" checked={stateType === "as_is"} onChange={() => setStateType("as_is")} /> Mevcut Durum (As-Is)</label>
            <label><input type="radio" name="limit_state" value="to_be" checked={stateType === "to_be"} onChange={() => setStateType("to_be")} /> Hedeflenen Model (To-Be)</label>
          </div>
        </div>
        <div className="gov-form-group">
          <label>Notlar</label>
          <textarea rows={2} placeholder="Onay mekanizması ve istisnalar..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="gov-form-actions">
          <button type="button" className="gov-btn-cancel" onClick={onClose}>Vazgeç</button>
          <button type="submit" className="gov-btn-primary" disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
        </div>
      </form>
    </ModalBase>
  );
};

// ============================================================================
// 7. SoD Risk Modal (Görevler Ayrılığı Riskleri)
// ============================================================================

interface SodRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: GovernanceSodRisk | null;
  objects: GovernanceObject[];
  subjects: GovernanceSubject[];
  scopes: GovernanceScope[];
  onSave: (data: {
    governance_object_id?: string;
    subject_id?: string;
    scope_id?: string;
    risk_title: string;
    conflicting_duty_a: string;
    conflicting_duty_b: string;
    risk_severity: GovernanceRiskSeverity;
    current_control?: string;
    mitigation_action?: string;
    risk_owner?: string;
    status: GovernanceRiskStatus;
    state_type: GovernanceStateType;
  }) => Promise<void>;
}

export const SodRiskModal: React.FC<SodRiskModalProps> = ({
  isOpen,
  onClose,
  initialData,
  objects,
  subjects,
  scopes,
  onSave,
}) => {
  const [riskTitle, setRiskTitle] = useState("");
  const [dutyA, setDutyA] = useState("");
  const [dutyB, setDutyB] = useState("");
  const [severity, setSeverity] = useState<GovernanceRiskSeverity>("critical");
  const [objectId, setObjectId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [scopeId, setScopeId] = useState("");
  const [currentControl, setCurrentControl] = useState("");
  const [mitigationAction, setMitigationAction] = useState("");
  const [riskOwner, setRiskOwner] = useState("");
  const [status, setStatus] = useState<GovernanceRiskStatus>("open");
  const [stateType, setStateType] = useState<GovernanceStateType>("as_is");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setRiskTitle(initialData.risk_title || "");
      setDutyA(initialData.conflicting_duty_a || "");
      setDutyB(initialData.conflicting_duty_b || "");
      setSeverity(initialData.risk_severity || "critical");
      setObjectId(initialData.governance_object_id || "");
      setSubjectId(initialData.subject_id || "");
      setScopeId(initialData.scope_id || "");
      setCurrentControl(initialData.current_control || "");
      setMitigationAction(initialData.mitigation_action || "");
      setRiskOwner(initialData.risk_owner || "");
      setStatus(initialData.status || "open");
      setStateType(initialData.state_type || "as_is");
    } else {
      setRiskTitle("");
      setDutyA("");
      setDutyB("");
      setSeverity("critical");
      setObjectId("");
      setSubjectId("");
      setScopeId("");
      setCurrentControl("");
      setMitigationAction("");
      setRiskOwner("");
      setStatus("open");
      setStateType("as_is");
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskTitle.trim() || !dutyA.trim() || !dutyB.trim()) {
      setError("Risk Başlığı, Çatışan Görev A ve Görev B alanları zorunludur.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await onSave({
        governance_object_id: objectId || undefined,
        subject_id: subjectId || undefined,
        scope_id: scopeId || undefined,
        risk_title: riskTitle.trim(),
        conflicting_duty_a: dutyA.trim(),
        conflicting_duty_b: dutyB.trim(),
        risk_severity: severity,
        current_control: currentControl.trim() || undefined,
        mitigation_action: mitigationAction.trim() || undefined,
        risk_owner: riskOwner.trim() || undefined,
        status: status,
        state_type: stateType,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Kayıt hatası.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={initialData ? "SoD Riskini Düzenle" : "Yeni Görevler Ayrılığı (SoD) Riski"}>
      <form onSubmit={handleSubmit} className="gov-form">
        {error && <div className="gov-form-error"><AlertCircle size={16} /><span>{error}</span></div>}
        <div className="gov-form-group">
          <label>Risk Başlığı *</label>
          <input type="text" placeholder="Örn: Tedarikçi Tanımlama ve Ödeme Emri Yetkisi Çatışması" value={riskTitle} onChange={(e) => setRiskTitle(e.target.value)} required />
        </div>
        <div className="gov-form-row">
          <div className="gov-form-group">
            <label>Çatışan Görev A *</label>
            <input type="text" placeholder="Örn: Tedarikçi Kartı Açma / Düzenleme" value={dutyA} onChange={(e) => setDutyA(e.target.value)} required />
          </div>
          <div className="gov-form-group">
            <label>Çatışan Görev B *</label>
            <input type="text" placeholder="Örn: Ödeme / Havale Emri Verme" value={dutyB} onChange={(e) => setDutyB(e.target.value)} required />
          </div>
        </div>
        <div className="gov-form-row">
          <div className="gov-form-group">
            <label>Risk Ciddiyeti *</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value as GovernanceRiskSeverity)}>
              <option value="critical">Kritik (Critical — Yüksek Finansal / Yasal Risk)</option>
              <option value="high">Yüksek (High — Ciddi Süreç Riski)</option>
              <option value="medium">Orta (Medium)</option>
              <option value="low">Düşük (Low)</option>
            </select>
          </div>
          <div className="gov-form-group">
            <label>Risk Durumu</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as GovernanceRiskStatus)}>
              <option value="open">Açık (Open)</option>
              <option value="in_review">İnceleniyor (In Review)</option>
              <option value="mitigated">Azaltıldı / Kontrol Eklendi (Mitigated)</option>
              <option value="accepted">Kabul Edildi / Risk Alındı (Accepted)</option>
              <option value="closed">Kapatıldı (Closed)</option>
            </select>
          </div>
        </div>
        <div className="gov-form-row">
          <div className="gov-form-group">
            <label>İlgili Özne (Kişi/Rol)</label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">-- Genel / Belirtilmedi --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.subject_type})</option>
              ))}
            </select>
          </div>
          <div className="gov-form-group">
            <label>İlgili Nesne</label>
            <select value={objectId} onChange={(e) => setObjectId(e.target.value)}>
              <option value="">-- Genel / Nesne Seçilmedi --</option>
              {objects.map((o) => (
                <option key={o.id} value={o.id}>{o.name_tr}</option>
              ))}
            </select>
          </div>
        </div>
        {scopes && scopes.length > 0 && (
          <div className="gov-form-group">
            <label>Organizasyon Kapsamı</label>
            <select value={scopeId} onChange={(e) => setScopeId(e.target.value)}>
              <option value="">-- Tüm Organizasyon / Belirtilmedi --</option>
              {scopes.map((sc) => (
                <option key={sc.id} value={sc.id}>{sc.name} ({sc.scope_type})</option>
              ))}
            </select>
          </div>
        )}
        <div className="gov-form-group">

          <label>Mevcut Sahadaki Kontrol</label>
          <textarea rows={2} placeholder="Örn: Çift imza aranıyor, aylık denetim yapılıyor veya 'Mevcut Kontrol Yok'..." value={currentControl} onChange={(e) => setCurrentControl(e.target.value)} />
        </div>
        <div className="gov-form-group">
          <label>Önerilen Hedef Aksiyon / Çözüm (To-Be)</label>
          <textarea rows={2} placeholder="Örn: ERP üzerinde tedarikçi açma yetkisi Muhasebe'ye, ödeme Finans Direktörüne ayrılmalıdır..." value={mitigationAction} onChange={(e) => setMitigationAction(e.target.value)} />
        </div>
        <div className="gov-form-actions">
          <button type="button" className="gov-btn-cancel" onClick={onClose}>Vazgeç</button>
          <button type="submit" className="gov-btn-primary" disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
        </div>
      </form>
    </ModalBase>
  );
};
