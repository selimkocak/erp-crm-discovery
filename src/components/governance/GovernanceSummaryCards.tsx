// path: /home/selim/projects/erp-crm-discovery/src/components/governance/GovernanceSummaryCards.tsx
import React from "react";
import { Database, AlertTriangle, Users, ShieldAlert, GitFork } from "lucide-react";
import type { GovernanceSummary } from "../../types/governance";

interface GovernanceSummaryCardsProps {
  summary: GovernanceSummary | null;
  onNavigateTab?: (tab: string) => void;
}

export const GovernanceSummaryCards: React.FC<GovernanceSummaryCardsProps> = ({
  summary,
  onNavigateTab,
}) => {
  if (!summary) return null;

  return (
    <div className="gov-summary-grid">
      {/* 1. Toplam Nesne */}
      <div
        className="gov-summary-card"
        onClick={() => onNavigateTab?.("objects")}
        role="button"
        tabIndex={0}
      >
        <div className="gov-summary-card__icon gov-summary-card__icon--primary">
          <Database size={22} />
        </div>
        <div className="gov-summary-card__content">
          <span className="gov-summary-card__label">Yönetişim Nesneleri</span>
          <span className="gov-summary-card__value">{summary.totalObjects}</span>
          <span className="gov-summary-card__hint">{summary.totalAuthorizations} Yetki Kaydı</span>
        </div>
      </div>

      {/* 2. Sahipsiz Nesneler (Data Owner Yok) */}
      <div
        className={`gov-summary-card ${summary.unassignedOwnerCount > 0 ? "gov-summary-card--warning" : ""}`}
        onClick={() => onNavigateTab?.("responsibilities")}
        role="button"
        tabIndex={0}
      >
        <div className="gov-summary-card__icon gov-summary-card__icon--warning">
          <AlertTriangle size={22} />
        </div>
        <div className="gov-summary-card__content">
          <span className="gov-summary-card__label">Sahipsiz Veriler</span>
          <span className="gov-summary-card__value">{summary.unassignedOwnerCount}</span>
          <span className="gov-summary-card__hint">
            {summary.unassignedOwnerCount > 0 ? "Veri Sahibi (Owner) atanmamış" : "Tüm nesnelerin sahibi var"}
          </span>
        </div>
      </div>

      {/* 3. Veri Sorumlusu (Steward) Boşlukları */}
      <div
        className="gov-summary-card"
        onClick={() => onNavigateTab?.("responsibilities")}
        role="button"
        tabIndex={0}
      >
        <div className="gov-summary-card__icon gov-summary-card__icon--info">
          <Users size={22} />
        </div>
        <div className="gov-summary-card__content">
          <span className="gov-summary-card__label">Sorumlu Boşlukları</span>
          <span className="gov-summary-card__value">{summary.unassignedStewardCount}</span>
          <span className="gov-summary-card__hint">Veri Sorumlusu (Steward) bekleyen</span>
        </div>
      </div>

      {/* 4. Kritik / Yüksek SoD Riskleri */}
      <div
        className={`gov-summary-card ${summary.criticalSodRiskCount > 0 ? "gov-summary-card--danger" : ""}`}
        onClick={() => onNavigateTab?.("sod_risks")}
        role="button"
        tabIndex={0}
      >
        <div className="gov-summary-card__icon gov-summary-card__icon--danger">
          <ShieldAlert size={22} />
        </div>
        <div className="gov-summary-card__content">
          <span className="gov-summary-card__label">Kritik SoD Riski</span>
          <span className="gov-summary-card__value">{summary.criticalSodRiskCount}</span>
          <span className="gov-summary-card__hint">
            {summary.totalSodRisks} Toplam Görevler Ayrılığı Riski
          </span>
        </div>
      </div>

      {/* 5. Efektif Yetki Sapmaları */}
      <div
        className={`gov-summary-card ${summary.discrepancyCount > 0 ? "gov-summary-card--purple" : ""}`}
        onClick={() => onNavigateTab?.("authorizations")}
        role="button"
        tabIndex={0}
      >
        <div className="gov-summary-card__icon gov-summary-card__icon--purple">
          <GitFork size={22} />
        </div>
        <div className="gov-summary-card__content">
          <span className="gov-summary-card__label">Yetki Sapması</span>
          <span className="gov-summary-card__value">{summary.discrepancyCount}</span>
          <span className="gov-summary-card__hint">Beyan vs Fiili Efektif Fark</span>
        </div>
      </div>
    </div>
  );
};
