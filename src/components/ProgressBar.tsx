/**
 * ERP CRM Discovery — ProgressBar bileşeni
 * Görünür + zorunlu soru ilerlemesini gösterir.
 */

import React from "react";

interface ProgressBarProps {
  answered: number;
  total: number;
  percentage: number;
  revisitCount?: number;
  criticalCount?: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  answered,
  total,
  percentage,
  revisitCount = 0,
  criticalCount = 0,
  className = "",
}) => {
  if (total === 0) return null;

  return (
    <div className={`progress-bar-container ${className}`}>
      <div className="progress-bar-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="progress-bar-label">İlerleme</span>
          <span className="progress-bar-count">
            {answered}/{total} zorunlu soru cevaplandı
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {revisitCount > 0 && (
            <span
              className="badge badge--warning"
              style={{
                fontSize: "0.75rem",
                padding: "2px 8px",
                borderRadius: "9999px",
                background: "var(--color-warning-100, #fef3c7)",
                color: "var(--color-warning-800, #92400e)",
                fontWeight: 500,
              }}
            >
              🟡 {revisitCount} Açık Takip
            </span>
          )}
          {criticalCount > 0 && (
            <span
              className="badge badge--danger"
              style={{
                fontSize: "0.75rem",
                padding: "2px 8px",
                borderRadius: "9999px",
                background: "var(--color-danger-100, #fee2e2)",
                color: "var(--color-danger-800, #991b1b)",
                fontWeight: 600,
              }}
            >
              🔴 {criticalCount} Kritik Takip
            </span>
          )}
        </div>
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`İlerleme: %${percentage}`}
        />
      </div>
      <div className="progress-bar-pct">{percentage}%</div>
    </div>
  );
};
