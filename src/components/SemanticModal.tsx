/**
 * ERP CRM Discovery — SemanticModal Component
 *
 * Bulgu, Gereksinim, Risk ve Proje Notu ekleme / düzenleme modalı.
 * Soru ekranından açıldığında question_id ve bf_code otomatik gelir.
 * Proje özet ekranından açıldığında istenen fonksiyona bağlanabilir veya serbest bırakılabilir.
 */

import React, { useState } from "react";
import { X, Search, AlertTriangle, CheckSquare, StickyNote } from "lucide-react";
import type {
  SemanticRecordType,
  Finding,
  Requirement,
  Risk,
  ProjectNote,
  FindingPriority,
  FindingStatus,
  RequirementPriority,
  RequirementStatus,
  RiskImpact,
  RiskProbability,
  RiskStatus,
} from "../types";
import {
  createFinding,
  updateFinding,
  createRequirement,
  updateRequirement,
  createRisk,
  updateRisk,
  createProjectNote,
  updateProjectNote,
} from "../db/client";
import { BUSINESS_FUNCTION_REGISTRY } from "../generated/businessFunctions";

export interface SemanticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  projectId: string;
  defaultType?: SemanticRecordType;
  defaultBfCode?: string;
  defaultQuestionId?: string | null;
  // Düzenleme modu için mevcut kayıt (varsa)
  initialRecord?: {
    type: SemanticRecordType;
    data: Finding | Requirement | Risk | ProjectNote;
  } | null;
}

export const SemanticModal: React.FC<SemanticModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  projectId,
  defaultType = "finding",
  defaultBfCode = "SALES",
  defaultQuestionId = null,
  initialRecord = null,
}) => {
  const isEditing = !!initialRecord;
  const recordType: SemanticRecordType = initialRecord?.type ?? defaultType;

  // Form states
  const [type, setType] = useState<SemanticRecordType>(recordType);
  const [bfCode, setBfCode] = useState<string>(
    initialRecord?.data.business_function_code ?? defaultBfCode ?? "SALES"
  );
  const [questionId] = useState<string | null>(
    initialRecord?.data.question_id ?? defaultQuestionId ?? null
  );

  // Ortak alanlar
  const [title, setTitle] = useState<string>(
    (initialRecord?.data as Finding | Requirement | Risk)?.title ?? ""
  );
  const [description, setDescription] = useState<string>(
    (initialRecord?.data as Finding | Requirement | Risk)?.description ?? ""
  );

  // Finding / Requirement
  const [priority, setPriority] = useState<FindingPriority | RequirementPriority>(
    (initialRecord?.data as Finding | Requirement)?.priority ?? "medium"
  );
  const [findingStatus, setFindingStatus] = useState<FindingStatus>(
    (initialRecord?.data as Finding)?.status ?? "open"
  );
  const [reqStatus, setReqStatus] = useState<RequirementStatus>(
    (initialRecord?.data as Requirement)?.status ?? "draft"
  );

  // Risk
  const [impact, setImpact] = useState<RiskImpact>(
    (initialRecord?.data as Risk)?.impact ?? "medium"
  );
  const [probability, setProbability] = useState<RiskProbability>(
    (initialRecord?.data as Risk)?.probability ?? "medium"
  );
  const [mitigationNote, setMitigationNote] = useState<string>(
    (initialRecord?.data as Risk)?.mitigation_note ?? ""
  );
  const [riskStatus, setRiskStatus] = useState<RiskStatus>(
    (initialRecord?.data as Risk)?.status ?? "open"
  );

  // Note
  const [noteText, setNoteText] = useState<string>(
    (initialRecord?.data as ProjectNote)?.note ?? ""
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const activeType = isEditing ? recordType : type;

    if (activeType === "note") {
      if (!noteText.trim()) {
        setFormError("Not içeriği boş bırakılamaz.");
        return;
      }
    } else {
      if (!title.trim()) {
        setFormError("Başlık alanı zorunludur.");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      if (isEditing && initialRecord) {
        // UPDATE
        switch (initialRecord.type) {
          case "finding":
            await updateFinding(initialRecord.data.id, {
              title: title.trim(),
              description: description.trim(),
              priority: priority as FindingPriority,
              status: findingStatus,
              business_function_code: bfCode,
              question_id: questionId,
            });
            break;
          case "requirement":
            await updateRequirement(initialRecord.data.id, {
              title: title.trim(),
              description: description.trim(),
              priority: priority as RequirementPriority,
              status: reqStatus,
              business_function_code: bfCode,
              question_id: questionId,
            });
            break;
          case "risk":
            await updateRisk(initialRecord.data.id, {
              title: title.trim(),
              description: description.trim(),
              impact,
              probability,
              mitigation_note: mitigationNote.trim() || null,
              status: riskStatus,
              business_function_code: bfCode,
              question_id: questionId,
            });
            break;
          case "note":
            await updateProjectNote(initialRecord.data.id, {
              note: noteText.trim(),
              business_function_code: bfCode || null,
              question_id: questionId || null,
            });
            break;
        }
      } else {
        // CREATE
        switch (activeType) {
          case "finding":
            await createFinding({
              analysis_project_id: projectId,
              business_function_code: bfCode,
              question_id: questionId,
              title: title.trim(),
              description: description.trim(),
              priority: priority as FindingPriority,
              status: findingStatus,
            });
            break;
          case "requirement":
            await createRequirement({
              analysis_project_id: projectId,
              business_function_code: bfCode,
              question_id: questionId,
              title: title.trim(),
              description: description.trim(),
              priority: priority as RequirementPriority,
              status: reqStatus,
            });
            break;
          case "risk":
            await createRisk({
              analysis_project_id: projectId,
              business_function_code: bfCode,
              question_id: questionId,
              title: title.trim(),
              description: description.trim(),
              impact,
              probability,
              mitigation_note: mitigationNote.trim() || null,
              status: riskStatus,
            });
            break;
          case "note":
            await createProjectNote({
              analysis_project_id: projectId,
              business_function_code: bfCode || null,
              question_id: questionId || null,
              note: noteText.trim(),
            });
            break;
        }
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error("Semantik kayıt kaydedilemedi:", err);
      setFormError(err?.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeType = isEditing ? recordType : type;

  const getTypeIcon = (t: SemanticRecordType) => {
    switch (t) {
      case "finding":
        return <Search size={18} className="semantic-icon--finding" />;
      case "requirement":
        return <CheckSquare size={18} className="semantic-icon--requirement" />;
      case "risk":
        return <AlertTriangle size={18} className="semantic-icon--risk" />;
      case "note":
        return <StickyNote size={18} className="semantic-icon--note" />;
    }
  };

  const getTypeName = (t: SemanticRecordType) => {
    switch (t) {
      case "finding":
        return "Bulgu";
      case "requirement":
        return "Gereksinim";
      case "risk":
        return "Risk";
      case "note":
        return "Proje Notu";
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content semantic-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__title">
            {getTypeIcon(activeType)}
            <h3>
              {isEditing ? `${getTypeName(activeType)} Düzenle` : `Yeni ${getTypeName(activeType)} Ekle`}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Kapat">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="semantic-form">
          {/* Type selector (only when creating) */}
          {!isEditing && (
            <div className="semantic-form__type-selector">
              <button
                type="button"
                className={`type-btn ${type === "finding" ? "type-btn--active" : ""}`}
                onClick={() => setType("finding")}
              >
                <Search size={16} /> Bulgu
              </button>
              <button
                type="button"
                className={`type-btn ${type === "requirement" ? "type-btn--active" : ""}`}
                onClick={() => setType("requirement")}
              >
                <CheckSquare size={16} /> Gereksinim
              </button>
              <button
                type="button"
                className={`type-btn ${type === "risk" ? "type-btn--active" : ""}`}
                onClick={() => setType("risk")}
              >
                <AlertTriangle size={16} /> Risk
              </button>
              <button
                type="button"
                className={`type-btn ${type === "note" ? "type-btn--active" : ""}`}
                onClick={() => setType("note")}
              >
                <StickyNote size={16} /> Not
              </button>
            </div>
          )}

          {/* Context Info (Department & Question Link) */}
          <div className="semantic-form__context-bar">
            <div className="form-group form-group--inline">
              <label htmlFor="modal-bf-select">İş Fonksiyonu:</label>
              <select
                id="modal-bf-select"
                value={bfCode}
                onChange={(e) => setBfCode(e.target.value)}
                className="input-select input-select--sm"
              >
                {BUSINESS_FUNCTION_REGISTRY.map((bf) => (
                  <option key={bf.code} value={bf.code}>
                    {bf.name_tr} ({bf.code})
                  </option>
                ))}
              </select>
            </div>

            {questionId && (
              <div className="semantic-form__badge semantic-form__badge--source">
                Kaynak Soru: <strong>{questionId}</strong>
              </div>
            )}
          </div>

          {/* Note specific field */}
          {activeType === "note" ? (
            <div className="form-group">
              <label htmlFor="modal-note-text">
                Not İçeriği <span className="text-danger">*</span>
              </label>
              <textarea
                id="modal-note-text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Toplantı veya analiz sırasında alınan serbest not..."
                rows={5}
                className="input-textarea"
                required
                autoFocus
              />
            </div>
          ) : (
            <>
              {/* Title & Description */}
              <div className="form-group">
                <label htmlFor="modal-title">
                  {activeType === "finding"
                    ? "Bulgu Başlığı"
                    : activeType === "requirement"
                    ? "Gereksinim Başlığı"
                    : "Risk Başlığı"}{" "}
                  <span className="text-danger">*</span>
                </label>
                <input
                  id="modal-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    activeType === "finding"
                      ? "Örn: Teklif revizyonları Excel ile takip ediliyor"
                      : activeType === "requirement"
                      ? "Örn: Teklif versiyonlaması merkezi sistemde tutulmalı"
                      : "Örn: Manuel termin teyitleri sipariş teslimat gecikmelerine yol açabilir"
                  }
                  className="input-text"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-desc">Detaylı Açıklama</label>
                <textarea
                  id="modal-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mevcut durum tespiti, kapsam veya gerekçe detayları..."
                  rows={3}
                  className="input-textarea"
                />
              </div>

              {/* Finding specific: Priority & Status */}
              {activeType === "finding" && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="modal-fnd-priority">Öncelik / Önem</label>
                    <select
                      id="modal-fnd-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as FindingPriority)}
                      className="input-select"
                    >
                      <option value="low">Düşük</option>
                      <option value="medium">Orta</option>
                      <option value="high">Yüksek</option>
                      <option value="critical">Kritik</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="modal-fnd-status">Durum</label>
                    <select
                      id="modal-fnd-status"
                      value={findingStatus}
                      onChange={(e) => setFindingStatus(e.target.value as FindingStatus)}
                      className="input-select"
                    >
                      <option value="open">Açık</option>
                      <option value="confirmed">Teyit Edildi</option>
                      <option value="resolved">Çözüldü / Kapatıldı</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Requirement specific: Priority & Status */}
              {activeType === "requirement" && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="modal-req-priority">İş Önceliği</label>
                    <select
                      id="modal-req-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as RequirementPriority)}
                      className="input-select"
                    >
                      <option value="low">Düşük (Nice to have)</option>
                      <option value="medium">Orta (Should have)</option>
                      <option value="high">Yüksek (Must have)</option>
                      <option value="critical">Kritik (Deal breaker)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="modal-req-status">Kapsam Durumu</label>
                    <select
                      id="modal-req-status"
                      value={reqStatus}
                      onChange={(e) => setReqStatus(e.target.value as RequirementStatus)}
                      className="input-select"
                    >
                      <option value="draft">Taslak</option>
                      <option value="confirmed">Kapsamda (Onaylı)</option>
                      <option value="out_of_scope">Kapsam Dışı</option>
                      <option value="implemented">Karşılandı</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Risk specific: Impact, Probability, Mitigation, Status */}
              {activeType === "risk" && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="modal-risk-impact">Etki (Impact)</label>
                      <select
                        id="modal-risk-impact"
                        value={impact}
                        onChange={(e) => setImpact(e.target.value as RiskImpact)}
                        className="input-select"
                      >
                        <option value="low">Düşük</option>
                        <option value="medium">Orta</option>
                        <option value="high">Yüksek</option>
                        <option value="critical">Kritik</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="modal-risk-prob">Olasılık (Probability)</label>
                      <select
                        id="modal-risk-prob"
                        value={probability}
                        onChange={(e) => setProbability(e.target.value as RiskProbability)}
                        className="input-select"
                      >
                        <option value="low">Düşük</option>
                        <option value="medium">Orta</option>
                        <option value="high">Yüksek</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="modal-risk-status">Risk Durumu</label>
                      <select
                        id="modal-risk-status"
                        value={riskStatus}
                        onChange={(e) => setRiskStatus(e.target.value as RiskStatus)}
                        className="input-select"
                      >
                        <option value="open">Açık</option>
                        <option value="mitigated">Önlem Alındı</option>
                        <option value="accepted">Kabul Edildi</option>
                        <option value="closed">Kapatıldı</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-risk-mitigation">Önlem / Azaltma Notu (Mitigation)</label>
                    <textarea
                      id="modal-risk-mitigation"
                      value={mitigationNote}
                      onChange={(e) => setMitigationNote(e.target.value)}
                      placeholder="Bu riski bertaraf etmek veya etkisini azaltmak için önerilen aksiyon..."
                      rows={2}
                      className="input-textarea"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {formError && <div className="form-error-banner">{formError}</div>}

          {/* Actions */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Kaydediliyor..." : isEditing ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
