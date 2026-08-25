import React, { useState, useEffect } from "react";
import { X, Calendar, AlertCircle } from "lucide-react";
import {
  validateScheduleDates,
  calculateScheduleStatus,
  getScheduleStatusBadgeMeta,
  type ScheduleDates,
} from "../../models/scheduleStatus";

interface ProjectScheduleModalProps {
  isOpen: boolean;
  projectName: string;
  initialDates: ScheduleDates;
  onClose: () => void;
  onSave: (dates: ScheduleDates) => Promise<void>;
  isReadOnly?: boolean;
}

export const ProjectScheduleModal: React.FC<ProjectScheduleModalProps> = ({
  isOpen,
  projectName,
  initialDates,
  onClose,
  onSave,
  isReadOnly = false,
}) => {
  const [plannedStartDate, setPlannedStartDate] = useState<string>("");
  const [plannedEndDate, setPlannedEndDate] = useState<string>("");
  const [actualStartDate, setActualStartDate] = useState<string>("");
  const [actualEndDate, setActualEndDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setPlannedStartDate(initialDates.plannedStartDate || "");
      setPlannedEndDate(initialDates.plannedEndDate || "");
      setActualStartDate(initialDates.actualStartDate || "");
      setActualEndDate(initialDates.actualEndDate || "");
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen, initialDates]);

  if (!isOpen) return null;

  const currentDates: ScheduleDates = {
    plannedStartDate: plannedStartDate || null,
    plannedEndDate: plannedEndDate || null,
    actualStartDate: actualStartDate || null,
    actualEndDate: actualEndDate || null,
  };

  const computedStatus = calculateScheduleStatus(currentDates);
  const badgeMeta = getScheduleStatusBadgeMeta(
    computedStatus.status,
    computedStatus.delayDays,
    computedStatus.remainingDays
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateScheduleDates(currentDates);
    if (!validation.valid) {
      setError(validation.error || "Geçersiz tarih aralığı.");
      return;
    }

    try {
      setIsSaving(true);
      await onSave(currentDates);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Takvim kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="project-schedule-title">
      <div className="modal modal--md" style={{ maxWidth: "560px" }}>
        <div className="modal__header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={18} style={{ color: "var(--primary)" }} />
            <h3 id="project-schedule-title" className="modal__title">
              Proje Takvimi
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Kapat" disabled={isSaving}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <p className="text-sm text-muted" style={{ marginBottom: "1rem" }}>
              <strong>{projectName}</strong> için genel keşif ve analiz zaman planı.
            </p>

            {/* Status Preview Card */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                background: "var(--bg-secondary, #f8fafc)",
                border: "1px solid var(--border-color, #e2e8f0)",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <span className="text-xs text-muted font-bold" style={{ display: "block" }}>
                  HESAPLANAN TAKVİM DURUMU
                </span>
                <span className="text-sm font-semibold">{computedStatus.summaryText}</span>
              </div>
              <span className={`badge ${badgeMeta.badgeClass}`}>{badgeMeta.label}</span>
            </div>

            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  marginBottom: "1rem",
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Date Inputs Grid */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="proj-plan-start">
                  Planlanan Başlangıç
                </label>
                <input
                  id="proj-plan-start"
                  type="date"
                  className="form-input"
                  value={plannedStartDate}
                  onChange={(e) => setPlannedStartDate(e.target.value)}
                  disabled={isReadOnly || isSaving}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="proj-plan-end">
                  Planlanan Bitiş
                </label>
                <input
                  id="proj-plan-end"
                  type="date"
                  className="form-input"
                  value={plannedEndDate}
                  onChange={(e) => setPlannedEndDate(e.target.value)}
                  disabled={isReadOnly || isSaving}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="proj-act-start">
                  Gerçekleşen Başlangıç
                </label>
                <input
                  id="proj-act-start"
                  type="date"
                  className="form-input"
                  value={actualStartDate}
                  onChange={(e) => setActualStartDate(e.target.value)}
                  disabled={isReadOnly || isSaving}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="proj-act-end">
                  Gerçekleşen Bitiş
                </label>
                <input
                  id="proj-act-end"
                  type="date"
                  className="form-input"
                  value={actualEndDate}
                  onChange={(e) => setActualEndDate(e.target.value)}
                  disabled={isReadOnly || isSaving}
                />
              </div>
            </div>

            {/* Quick Actions / Reset Buttons */}
            {!isReadOnly && (
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn--outline btn--xs"
                  onClick={() => {
                    setActualStartDate("");
                    setActualEndDate("");
                  }}
                  disabled={isSaving}
                >
                  Gerçekleşenleri Temizle
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn--xs"
                  onClick={() => {
                    setPlannedStartDate("");
                    setPlannedEndDate("");
                    setActualStartDate("");
                    setActualEndDate("");
                  }}
                  disabled={isSaving}
                >
                  Tüm Tarihleri Sıfırla
                </button>
              </div>
            )}
          </div>

          <div className="modal__footer" style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
              {isReadOnly ? "Kapat" : "Vazgeç"}
            </button>
            {!isReadOnly && (
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
