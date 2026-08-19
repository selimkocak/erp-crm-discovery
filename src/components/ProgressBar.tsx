/**
 * ERP CRM Discovery — ProgressBar bileşeni
 * Görünür + zorunlu soru ilerlemesini gösterir.
 */

import React from "react";

interface ProgressBarProps {
  answered: number;
  total: number;
  percentage: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  answered,
  total,
  percentage,
  className = "",
}) => {
  if (total === 0) return null;

  return (
    <div className={`progress-bar-container ${className}`}>
      <div className="progress-bar-header">
        <span className="progress-bar-label">İlerleme</span>
        <span className="progress-bar-count">
          {answered}/{total} zorunlu soru tamamlandı
        </span>
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
