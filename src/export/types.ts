/**
 * ERP CRM Discovery — Export Types
 *
 * Types for DOCX and PDF exporters and file saving mechanisms.
 */

export type ExportFormat = "docx" | "pdf";

export interface ExportResult {
  success: boolean;
  filePath?: string;
  cancelled?: boolean;
  error?: string;
}

export interface ExportProgressState {
  isExporting: boolean;
  format: ExportFormat | null;
  statusMessage: string | null;
  error: string | null;
}
