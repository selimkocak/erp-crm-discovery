/**
 * ERP CRM Discovery — Report Filename Sanitizer
 *
 * Deterministic helper for generating safe, standard report filenames.
 * Example Final:   ABC_Mobilya_ERP_CRM_On_Analiz_2026-08-19.docx
 * Example Interim: ABC_Mobilya_ERP_CRM_Ara_Analiz_48pct_2026-08-19.docx
 */

import type { ExportFormat } from "./types";

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[/\\:*?"<>|]/g, "")
    .replace(/[\s\t\n]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function getSanitizedReportFilename(
  companyName: string | null | undefined,
  projectName: string | null | undefined,
  format: ExportFormat,
  date: Date = new Date(),
  isComplete: boolean = true,
  progressPercent?: number
): string {
  const baseRaw = (companyName?.trim() || projectName?.trim() || "ERP_CRM").trim();
  const sanitizedBase = sanitizeFilename(baseRaw);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  const typeSuffix = isComplete
    ? "On_Analiz"
    : progressPercent !== undefined
    ? `Ara_Analiz_${progressPercent}pct`
    : "Ara_Analiz";

  const cleanName = sanitizedBase
    ? `${sanitizedBase}_ERP_CRM_${typeSuffix}_${dateStr}`
    : `ERP_CRM_${typeSuffix}_${dateStr}`;

  return `${cleanName}.${format}`;
}
