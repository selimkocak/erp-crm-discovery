/**
 * ERP CRM Discovery — SemanticSummarySection Component
 *
 * ProjectDetailView altında analiz semantik katmanını (Bulgular, Gereksinimler, Riskler, Notlar)
 * özetleyen KPI kartları, filtreler ve detay listesi sunar.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  CheckSquare,
  AlertTriangle,
  StickyNote,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Layers,
  HelpCircle,
} from "lucide-react";
import type {
  Finding,
  Requirement,
  Risk,
  ProjectNote,
  SemanticRecordType,
  SemanticSummaryCounts,
} from "../types";
import {
  getFindings,
  getRequirements,
  getRisks,
  getProjectNotes,
  getSemanticSummaryCounts,
  deleteFinding,
  deleteRequirement,
  deleteRisk,
  deleteProjectNote,
} from "../db/client";
import { SemanticModal } from "./SemanticModal";
import { BUSINESS_FUNCTION_REGISTRY } from "../generated/businessFunctions";
import { getStatusMeta } from "../models/statusDictionary";

interface SemanticSummarySectionProps {
  projectId: string;
}

type TabFilter = "all" | "finding" | "requirement" | "risk" | "note";

export const SemanticSummarySection: React.FC<SemanticSummarySectionProps> = ({
  projectId,
}) => {
  const [counts, setCounts] = useState<SemanticSummaryCounts>({
    findingCount: 0,
    requirementCount: 0,
    openRiskCount: 0,
    totalRiskCount: 0,
    noteCount: 0,
  });

  const [findings, setFindings] = useState<Finding[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [notes, setNotes] = useState<ProjectNote[]>([]);

  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [selectedBfFilter, setSelectedBfFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalDefaultType, setModalDefaultType] = useState<SemanticRecordType>("finding");
  const [editingRecord, setEditingRecord] = useState<{
    type: SemanticRecordType;
    data: Finding | Requirement | Risk | ProjectNote;
  } | null>(null);

  const loadAllSemanticData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [summaryCounts, fList, rList, rskList, nList] = await Promise.all([
        getSemanticSummaryCounts(projectId),
        getFindings(projectId),
        getRequirements(projectId),
        getRisks(projectId),
        getProjectNotes(projectId),
      ]);
      setCounts(summaryCounts);
      setFindings(fList);
      setRequirements(rList);
      setRisks(rskList);
      setNotes(nList);
    } catch (err) {
      console.error("Semantik veriler yüklenemedi:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadAllSemanticData();
  }, [loadAllSemanticData]);

  // Silme işlemi
  const handleDelete = async (type: SemanticRecordType, id: string, titleOrNote: string) => {
    const confirmMsg = `"${titleOrNote.substring(0, 40)}${
      titleOrNote.length > 40 ? "..." : ""
    }" kaydını silmek istediğinizden emin misiniz?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      switch (type) {
        case "finding":
          await deleteFinding(id);
          break;
        case "requirement":
          await deleteRequirement(id);
          break;
        case "risk":
          await deleteRisk(id);
          break;
        case "note":
          await deleteProjectNote(id);
          break;
      }
      loadAllSemanticData();
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  const handleOpenCreateModal = (type: SemanticRecordType = "finding") => {
    setEditingRecord(null);
    setModalDefaultType(type);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (
    type: SemanticRecordType,
    data: Finding | Requirement | Risk | ProjectNote
  ) => {
    setEditingRecord({ type, data });
    setIsModalOpen(true);
  };

  const getBfName = (code: string | null) => {
    if (!code) return "Genel Proje";
    const found = BUSINESS_FUNCTION_REGISTRY.find((bf) => bf.code === code);
    return found ? found.name_tr : code;
  };

  // Filtreleme
  const matchesBf = (bfCode: string | null) => {
    if (selectedBfFilter === "ALL") return true;
    return bfCode === selectedBfFilter;
  };

  const filteredFindings = findings.filter((f) => matchesBf(f.business_function_code));
  const filteredRequirements = requirements.filter((r) => matchesBf(r.business_function_code));
  const filteredRisks = risks.filter((r) => matchesBf(r.business_function_code));
  const filteredNotes = notes.filter((n) => matchesBf(n.business_function_code));

  const totalFilteredCount =
    (activeTab === "all" || activeTab === "finding" ? filteredFindings.length : 0) +
    (activeTab === "all" || activeTab === "requirement" ? filteredRequirements.length : 0) +
    (activeTab === "all" || activeTab === "risk" ? filteredRisks.length : 0) +
    (activeTab === "all" || activeTab === "note" ? filteredNotes.length : 0);

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "critical":
        return <span className="badge badge--danger">Kritik</span>;
      case "high":
        return <span className="badge badge--warning">Yüksek</span>;
      case "medium":
        return <span className="badge badge--info">Orta</span>;
      case "low":
        return <span className="badge badge--secondary">Düşük</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (type: SemanticRecordType, rawStatus: string) => {
    const meta = getStatusMeta(type, rawStatus);
    return <span className={`badge ${meta.badgeClass}`}>{meta.label}</span>;
  };

  return (
    <div className="semantic-summary-section">
      {/* ── Section Title & Top Action ─────────────────────────────── */}
      <div className="semantic-summary-section__header">
        <div className="semantic-summary-section__title-group">
          <Layers size={20} className="text-primary" />
          <div>
            <h3>Analiz Semantik Katmanı</h3>
            <p className="text-muted text-sm">
              Soru cevaplarından çıkarılan bulgular, iş gereksinimleri, riskler ve proje notları.
            </p>
          </div>
        </div>
        <button
          className="btn btn--primary btn--sm"
          onClick={() => handleOpenCreateModal("finding")}
        >
          <Plus size={16} /> Kayıt Ekle
        </button>
      </div>

      {/* ── KPI Summary Cards ─────────────────────────────────────── */}
      <div className="semantic-kpi-grid">
        <div
          className={`semantic-kpi-card ${activeTab === "finding" ? "semantic-kpi-card--active" : ""}`}
          onClick={() => setActiveTab(activeTab === "finding" ? "all" : "finding")}
        >
          <div className="semantic-kpi-card__icon semantic-kpi-card__icon--finding">
            <Search size={20} />
          </div>
          <div className="semantic-kpi-card__body">
            <span className="semantic-kpi-card__label">Bulgular</span>
            <span className="semantic-kpi-card__count">{counts.findingCount}</span>
          </div>
        </div>

        <div
          className={`semantic-kpi-card ${activeTab === "requirement" ? "semantic-kpi-card--active" : ""}`}
          onClick={() => setActiveTab(activeTab === "requirement" ? "all" : "requirement")}
        >
          <div className="semantic-kpi-card__icon semantic-kpi-card__icon--requirement">
            <CheckSquare size={20} />
          </div>
          <div className="semantic-kpi-card__body">
            <span className="semantic-kpi-card__label">Gereksinimler</span>
            <span className="semantic-kpi-card__count">{counts.requirementCount}</span>
          </div>
        </div>

        <div
          className={`semantic-kpi-card ${activeTab === "risk" ? "semantic-kpi-card--active" : ""}`}
          onClick={() => setActiveTab(activeTab === "risk" ? "all" : "risk")}
        >
          <div className="semantic-kpi-card__icon semantic-kpi-card__icon--risk">
            <AlertTriangle size={20} />
          </div>
          <div className="semantic-kpi-card__body">
            <span className="semantic-kpi-card__label">Açık Riskler</span>
            <span className="semantic-kpi-card__count">
              {counts.openRiskCount} <span className="text-muted text-sm">/ {counts.totalRiskCount}</span>
            </span>
          </div>
        </div>

        <div
          className={`semantic-kpi-card ${activeTab === "note" ? "semantic-kpi-card--active" : ""}`}
          onClick={() => setActiveTab(activeTab === "note" ? "all" : "note")}
        >
          <div className="semantic-kpi-card__icon semantic-kpi-card__icon--note">
            <StickyNote size={20} />
          </div>
          <div className="semantic-kpi-card__body">
            <span className="semantic-kpi-card__label">Proje Notları</span>
            <span className="semantic-kpi-card__count">{counts.noteCount}</span>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────── */}
      <div className="semantic-filter-bar">
        <div className="semantic-tabs">
          <button
            className={`semantic-tab ${activeTab === "all" ? "semantic-tab--active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Tümü
          </button>
          <button
            className={`semantic-tab ${activeTab === "finding" ? "semantic-tab--active" : ""}`}
            onClick={() => setActiveTab("finding")}
          >
            Bulgular ({filteredFindings.length})
          </button>
          <button
            className={`semantic-tab ${activeTab === "requirement" ? "semantic-tab--active" : ""}`}
            onClick={() => setActiveTab("requirement")}
          >
            Gereksinimler ({filteredRequirements.length})
          </button>
          <button
            className={`semantic-tab ${activeTab === "risk" ? "semantic-tab--active" : ""}`}
            onClick={() => setActiveTab("risk")}
          >
            Riskler ({filteredRisks.length})
          </button>
          <button
            className={`semantic-tab ${activeTab === "note" ? "semantic-tab--active" : ""}`}
            onClick={() => setActiveTab("note")}
          >
            Notlar ({filteredNotes.length})
          </button>
        </div>

        <div className="semantic-filter-bar__right">
          <div className="form-group form-group--inline">
            <Filter size={14} className="text-muted" />
            <select
              value={selectedBfFilter}
              onChange={(e) => setSelectedBfFilter(e.target.value)}
              className="input-select input-select--sm"
            >
              <option value="ALL">Tüm Fonksiyonlar</option>
              {BUSINESS_FUNCTION_REGISTRY.map((bf) => (
                <option key={bf.code} value={bf.code}>
                  {bf.name_tr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Records List ─────────────────────────────────────────── */}
      {isLoading ? (
        <div className="semantic-loading">Kayıtlar yükleniyor...</div>
      ) : totalFilteredCount === 0 ? (
        <div className="semantic-empty-state">
          <p>Seçili filtrede henüz semantik kayıt bulunmuyor.</p>
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => handleOpenCreateModal(activeTab === "all" ? "finding" : activeTab)}
          >
            <Plus size={14} /> İlk Kaydı Ekle
          </button>
        </div>
      ) : (
        <div className="semantic-record-list">
          {/* Findings */}
          {(activeTab === "all" || activeTab === "finding") &&
            filteredFindings.map((f) => (
              <div key={f.id} className="semantic-record-card semantic-record-card--finding">
                <div className="semantic-record-card__header">
                  <div className="semantic-record-card__badges">
                    <span className="badge badge--outline-primary">
                      <Search size={12} /> Bulgu
                    </span>
                    <span className="badge badge--muted">
                      {getBfName(f.business_function_code)}
                    </span>
                    {f.question_id && (
                      <span className="badge badge--source" title="Kaynak Soru">
                        <HelpCircle size={12} /> {f.question_id}
                      </span>
                    )}
                    {getPriorityBadge(f.priority)}
                    {getStatusBadge("finding", f.status)}
                  </div>
                  <div className="semantic-record-card__actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleOpenEditModal("finding", f)}
                      title="Düzenle"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-icon btn-icon--danger"
                      onClick={() => handleDelete("finding", f.id, f.title)}
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h4 className="semantic-record-card__title">{f.title}</h4>
                {f.description && (
                  <p className="semantic-record-card__desc">{f.description}</p>
                )}
              </div>
            ))}

          {/* Requirements */}
          {(activeTab === "all" || activeTab === "requirement") &&
            filteredRequirements.map((r) => (
              <div key={r.id} className="semantic-record-card semantic-record-card--requirement">
                <div className="semantic-record-card__header">
                  <div className="semantic-record-card__badges">
                    <span className="badge badge--outline-success">
                      <CheckSquare size={12} /> Gereksinim
                    </span>
                    <span className="badge badge--muted">
                      {getBfName(r.business_function_code)}
                    </span>
                    {r.question_id && (
                      <span className="badge badge--source" title="Kaynak Soru">
                        <HelpCircle size={12} /> {r.question_id}
                      </span>
                    )}
                    {getPriorityBadge(r.priority)}
                    {getStatusBadge("requirement", r.status)}
                  </div>
                  <div className="semantic-record-card__actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleOpenEditModal("requirement", r)}
                      title="Düzenle"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-icon btn-icon--danger"
                      onClick={() => handleDelete("requirement", r.id, r.title)}
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h4 className="semantic-record-card__title">{r.title}</h4>
                {r.description && (
                  <p className="semantic-record-card__desc">{r.description}</p>
                )}
              </div>
            ))}

          {/* Risks */}
          {(activeTab === "all" || activeTab === "risk") &&
            filteredRisks.map((rsk) => (
              <div key={rsk.id} className="semantic-record-card semantic-record-card--risk">
                <div className="semantic-record-card__header">
                  <div className="semantic-record-card__badges">
                    <span className="badge badge--outline-danger">
                      <AlertTriangle size={12} /> Risk
                    </span>
                    <span className="badge badge--muted">
                      {getBfName(rsk.business_function_code)}
                    </span>
                    {rsk.question_id && (
                      <span className="badge badge--source" title="Kaynak Soru">
                        <HelpCircle size={12} /> {rsk.question_id}
                      </span>
                    )}
                    <span className="badge badge--muted">
                      Etki: {rsk.impact} | Olasılık: {rsk.probability}
                    </span>
                    {getStatusBadge("risk", rsk.status)}
                  </div>
                  <div className="semantic-record-card__actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleOpenEditModal("risk", rsk)}
                      title="Düzenle"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-icon btn-icon--danger"
                      onClick={() => handleDelete("risk", rsk.id, rsk.title)}
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h4 className="semantic-record-card__title">{rsk.title}</h4>
                {rsk.description && (
                  <p className="semantic-record-card__desc">{rsk.description}</p>
                )}
                {rsk.mitigation_note && (
                  <div className="semantic-record-card__mitigation">
                    <strong>Önlem:</strong> {rsk.mitigation_note}
                  </div>
                )}
              </div>
            ))}

          {/* Notes */}
          {(activeTab === "all" || activeTab === "note") &&
            filteredNotes.map((n) => (
              <div key={n.id} className="semantic-record-card semantic-record-card--note">
                <div className="semantic-record-card__header">
                  <div className="semantic-record-card__badges">
                    <span className="badge badge--outline-secondary">
                      <StickyNote size={12} /> Not
                    </span>
                    <span className="badge badge--muted">
                      {getBfName(n.business_function_code)}
                    </span>
                    {n.question_id && (
                      <span className="badge badge--source" title="Kaynak Soru">
                        <HelpCircle size={12} /> {n.question_id}
                      </span>
                    )}
                  </div>
                  <div className="semantic-record-card__actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleOpenEditModal("note", n)}
                      title="Düzenle"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-icon btn-icon--danger"
                      onClick={() => handleDelete("note", n.id, n.note)}
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="semantic-record-card__note-content">{n.note}</p>
              </div>
            ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <SemanticModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={loadAllSemanticData}
          projectId={projectId}
          defaultType={modalDefaultType}
          defaultBfCode={selectedBfFilter !== "ALL" ? selectedBfFilter : "SALES"}
          initialRecord={editingRecord}
        />
      )}
    </div>
  );
};
