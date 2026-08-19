/**
 * ERP CRM Discovery — Report Filename Sanitizer
 *
 * Deterministic helper for generating safe, standard report filenames.
 * Example: ABC_Mobilya_ERP_CRM_On_Analiz_2026-08-19.docx
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
  date: Date = new Date()
): string {
  const baseRaw = (companyName?.trim() || projectName?.trim() || "ERP_CRM").trim();
  const sanitizedBase = sanitizeFilename(baseRaw);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  const cleanName = sanitizedBase ? `${sanitizedBase}_ERP_CRM_On_Analiz_${dateStr}` : `ERP_CRM_On_Analiz_${dateStr}`;

  return `${cleanName}.${format}`;
}

