/**
 * ERP CRM Discovery — Schedule & Timeline Status Model (FAZ-59)
 *
 * Central, framework-independent engine for date range validation, day differences,
 * timezone-safe calculations, and schedule status derivation.
 *
 * Single Source of Truth for:
 * 1. Project-level and function-level schedule status
 * 2. Turkish localized labels, badge variants, and summary strings
 * 3. Report generation (Preview, DOCX, PDF)
 */

export type ScheduleStatus =
  | "not_planned"
  | "planned"
  | "not_started"
  | "in_progress"
  | "on_track"
  | "due_soon"
  | "overdue"
  | "completed_on_time"
  | "completed_late";

export interface ScheduleDates {
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
}

export interface ScheduleStatusResult {
  status: ScheduleStatus;
  label: string;
  badgeClass: string;
  color: string;
  delayDays: number;
  remainingDays: number;
  summaryText: string;
}

export interface DateValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates if a string is a valid ISO date (YYYY-MM-DD) representing a real calendar date.
 */
export function isValidIsoDate(str: string | null | undefined): boolean {
  if (!str || typeof str !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str.trim());
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;

  // Days in month validation (including leap years)
  const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= daysInMonth[month - 1];
}

/**
 * Parses YYYY-MM-DD into integer epoch days (timezone-neutral UTC calculation).
 */
export function dateToEpochDays(isoDate?: string | null): number {
  if (!isoDate || typeof isoDate !== "string" || !isValidIsoDate(isoDate)) {
    return 0;
  }
  const parts = isoDate.trim().split("-").map((p) => parseInt(p, 10));
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return 0;
  }
  return Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000);
}

/**
 * Calculates day difference between two ISO dates (end - start).
 */
export function calculateDaysDifference(startIso?: string | null, endIso?: string | null): number {
  if (!startIso || !endIso || !isValidIsoDate(startIso) || !isValidIsoDate(endIso)) {
    return 0;
  }
  return dateToEpochDays(endIso) - dateToEpochDays(startIso);
}

/**
 * Returns today's local date as YYYY-MM-DD without UTC offset skew.
 */
export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Calculates remaining days from today (or given reference date) to target date.
 */
export function calculateDaysRemaining(targetIso: string, todayIso?: string): number {
  const today = todayIso && isValidIsoDate(todayIso) ? todayIso : getTodayIsoDate();
  return calculateDaysDifference(today, targetIso);
}

/**
 * Validates a start and end date range.
 */
export function validateDateRange(start?: string | null, end?: string | null): DateValidationResult {
  const cleanStart = start?.trim() || null;
  const cleanEnd = end?.trim() || null;

  if (cleanStart && !isValidIsoDate(cleanStart)) {
    return { valid: false, error: "Başlangıç tarihi geçersiz (YYYY-MM-DD formatı bekleniyor)." };
  }
  if (cleanEnd && !isValidIsoDate(cleanEnd)) {
    return { valid: false, error: "Bitiş tarihi geçersiz (YYYY-MM-DD formatı bekleniyor)." };
  }
  if (cleanStart && cleanEnd) {
    if (calculateDaysDifference(cleanStart, cleanEnd) < 0) {
      return { valid: false, error: "Bitiş tarihi başlangıç tarihinden önce olamaz." };
    }
  }

  return { valid: true };
}

/**
 * Validates all 4 schedule dates (planned and actual pairs).
 */
export function validateScheduleDates(dates: ScheduleDates): DateValidationResult {
  const plannedVal = validateDateRange(dates.plannedStartDate, dates.plannedEndDate);
  if (!plannedVal.valid) return plannedVal;

  const actualVal = validateDateRange(dates.actualStartDate, dates.actualEndDate);
  if (!actualVal.valid) return actualVal;

  return { valid: true };
}

/**
 * Formats YYYY-MM-DD to DD.MM.YYYY for Turkish display.
 */
export function formatIsoDateTr(isoDate?: string | null): string {
  if (!isoDate || !isValidIsoDate(isoDate)) return "—";
  const [y, m, d] = isoDate.trim().split("-");
  return `${d}.${m}.${y}`;
}

/**
 * Formats a date range summary string (e.g. "01.09.2026 – 30.11.2026").
 */
export function formatDateRangeSummary(start?: string | null, end?: string | null): string {
  const s = start && isValidIsoDate(start) ? formatIsoDateTr(start) : null;
  const e = end && isValidIsoDate(end) ? formatIsoDateTr(end) : null;

  if (s && e) return `${s} – ${e}`;
  if (s) return `${s}'den itibaren`;
  if (e) return `${e}'ye kadar`;
  return "Planlanmadı";
}

/**
 * Returns Turkish label, CSS class, and color for a ScheduleStatus.
 */
export function getScheduleStatusBadgeMeta(
  status: ScheduleStatus,
  delayDays: number = 0,
  remainingDays: number = 0
): { label: string; badgeClass: string; color: string; description: string } {
  switch (status) {
    case "completed_on_time":
      return {
        label: "Zamanında Tamamlandı",
        badgeClass: "badge-schedule--completed-on-time",
        color: "#16a34a",
        description: "Planlanan sürede veya öncesinde tamamlandı.",
      };
    case "completed_late":
      return {
        label: delayDays > 0 ? `${delayDays} Gün Gecikmeli Tamamlandı` : "Gecikmeli Tamamlandı",
        badgeClass: "badge-schedule--completed-late",
        color: "#ea580c",
        description: "Planlanan tarihten sonra tamamlandı.",
      };
    case "overdue":
      return {
        label: delayDays > 0 ? `${delayDays} Gün Gecikmiş` : "Gecikmiş",
        badgeClass: "badge-schedule--overdue",
        color: "#dc2626",
        description: "Planlanan bitiş tarihi aşıldı ve henüz tamamlanmadı.",
      };
    case "due_soon":
      return {
        label: remainingDays > 0 ? `Bitişe ${remainingDays} Gün` : "Bitiş Yaklaşıyor",
        badgeClass: "badge-schedule--due-soon",
        color: "#d97706",
        description: "Planlanan bitişe 7 gün veya daha az süre kaldı.",
      };
    case "on_track":
      return {
        label: remainingDays > 0 ? `${remainingDays} Gün Kaldı` : "Yolunda",
        badgeClass: "badge-schedule--on-track",
        color: "#0d9488",
        description: "Çalışma takvime uygun biçimde ilerliyor.",
      };
    case "in_progress":
      return {
        label: "Devam Ediyor",
        badgeClass: "badge-schedule--in-progress",
        color: "#2563eb",
        description: "Süreç devam ediyor.",
      };
    case "not_started":
      return {
        label: "Başlamadı",
        badgeClass: "badge-schedule--not-started",
        color: "#ca8a04",
        description: "Planlanan başlama tarihi geldi veya geçti ancak başlanmadı.",
      };
    case "planned":
      return {
        label: "Planlandı",
        badgeClass: "badge-schedule--planned",
        color: "#6366f1",
        description: "Gelecek tarihli çalışma planı mevcut.",
      };
    case "not_planned":
    default:
      return {
        label: "Planlanmadı",
        badgeClass: "badge-schedule--not-planned",
        color: "#64748b",
        description: "Henüz takvim planı girilmedi.",
      };
  }
}

/**
 * Calculates schedule status given dates, optional process status, and reference date.
 */
export function calculateScheduleStatus(
  dates: ScheduleDates,
  processStatus?: string,
  todayIso?: string
): ScheduleStatusResult {
  const today = todayIso && isValidIsoDate(todayIso) ? todayIso : getTodayIsoDate();

  const planStart = dates.plannedStartDate && isValidIsoDate(dates.plannedStartDate) ? dates.plannedStartDate.trim() : null;
  const planEnd = dates.plannedEndDate && isValidIsoDate(dates.plannedEndDate) ? dates.plannedEndDate.trim() : null;
  const actStart = dates.actualStartDate && isValidIsoDate(dates.actualStartDate) ? dates.actualStartDate.trim() : null;
  const actEnd = dates.actualEndDate && isValidIsoDate(dates.actualEndDate) ? dates.actualEndDate.trim() : null;

  const isProcessCompleted = processStatus === "completed";
  const isProcessInProgress = processStatus === "in_progress";
  const isProcessNotStarted = !processStatus || processStatus === "not_started";

  // 1. Check if completed (either actual end date present or processStatus is completed with an end date)
  if (actEnd || (isProcessCompleted && (planEnd || actStart))) {
    const effectiveEnd = actEnd || today;
    if (planEnd) {
      const delay = calculateDaysDifference(planEnd, effectiveEnd);
      if (delay > 0) {
        const meta = getScheduleStatusBadgeMeta("completed_late", delay, 0);
        return {
          status: "completed_late",
          label: meta.label,
          badgeClass: meta.badgeClass,
          color: meta.color,
          delayDays: delay,
          remainingDays: 0,
          summaryText: `${delay} gün gecikmeli tamamlandı`,
        };
      }
    }
    const meta = getScheduleStatusBadgeMeta("completed_on_time", 0, 0);
    return {
      status: "completed_on_time",
      label: meta.label,
      badgeClass: meta.badgeClass,
      color: meta.color,
      delayDays: 0,
      remainingDays: 0,
      summaryText: "Zamanında tamamlandı",
    };
  }

  // 2. Uncompleted / In-progress / Not started
  if (planEnd) {
    const remaining = calculateDaysDifference(today, planEnd);
    if (remaining < 0) {
      const delay = Math.abs(remaining);
      const meta = getScheduleStatusBadgeMeta("overdue", delay, 0);
      return {
        status: "overdue",
        label: meta.label,
        badgeClass: meta.badgeClass,
        color: meta.color,
        delayDays: delay,
        remainingDays: 0,
        summaryText: `${delay} gün gecikmiş`,
      };
    }

    if (remaining <= 7) {
      const meta = getScheduleStatusBadgeMeta("due_soon", 0, remaining);
      return {
        status: "due_soon",
        label: meta.label,
        badgeClass: meta.badgeClass,
        color: meta.color,
        delayDays: 0,
        remainingDays: remaining,
        summaryText: remaining === 0 ? "Bitiş günü bugün" : `Bitişe ${remaining} gün kaldı`,
      };
    }

    if (actStart || isProcessInProgress) {
      const meta = getScheduleStatusBadgeMeta("on_track", 0, remaining);
      return {
        status: "on_track",
        label: meta.label,
        badgeClass: meta.badgeClass,
        color: meta.color,
        delayDays: 0,
        remainingDays: remaining,
        summaryText: `${remaining} gün kaldı`,
      };
    }

    if (isProcessNotStarted) {
      if (planStart) {
        const startDiff = calculateDaysDifference(today, planStart);
        if (startDiff < 0) {
          const meta = getScheduleStatusBadgeMeta("not_started", 0, remaining);
          return {
            status: "not_started",
            label: meta.label,
            badgeClass: meta.badgeClass,
            color: meta.color,
            delayDays: 0,
            remainingDays: remaining,
            summaryText: `Başlamadı (${remaining} gün kaldı)`,
          };
        }
      }
      const meta = getScheduleStatusBadgeMeta("planned", 0, remaining);
      return {
        status: "planned",
        label: meta.label,
        badgeClass: meta.badgeClass,
        color: meta.color,
        delayDays: 0,
        remainingDays: remaining,
        summaryText: `Planlandı (${remaining} gün kaldı)`,
      };
    }
  }

  // 3. No planEnd
  if (actStart || isProcessInProgress) {
    const meta = getScheduleStatusBadgeMeta("in_progress", 0, 0);
    return {
      status: "in_progress",
      label: meta.label,
      badgeClass: meta.badgeClass,
      color: meta.color,
      delayDays: 0,
      remainingDays: 0,
      summaryText: actStart ? `${formatIsoDateTr(actStart)} tarihinde başladı` : "Devam ediyor",
    };
  }

  if (planStart) {
    const meta = getScheduleStatusBadgeMeta("planned", 0, 0);
    return {
      status: "planned",
      label: meta.label,
      badgeClass: meta.badgeClass,
      color: meta.color,
      delayDays: 0,
      remainingDays: 0,
      summaryText: `${formatIsoDateTr(planStart)} için planlandı`,
    };
  }

  const meta = getScheduleStatusBadgeMeta("not_planned", 0, 0);
  return {
    status: "not_planned",
    label: meta.label,
    badgeClass: meta.badgeClass,
    color: meta.color,
    delayDays: 0,
    remainingDays: 0,
    summaryText: "Planlanmadı",
  };
}
