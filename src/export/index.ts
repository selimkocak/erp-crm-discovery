/**
 * ERP CRM Discovery — Export Module Entry Point
 *
 * Exposes buildDocxBuffer, buildPdfBuffer, getSanitizedReportFilename,
 * and high-level exportReport service.
 */

import type { ReportModel } from "../report/types";
import type { ExportFormat, ExportResult } from "./types";
import { buildDocxBuffer } from "./docxExporter";
import { buildPdfBuffer } from "./pdfExporter";
import { getSanitizedReportFilename } from "./filename";
import { saveReportBuffer } from "./fileSaver";

export * from "./types";
export * from "./filename";
export * from "./docxExporter";
export * from "./pdfExporter";
export * from "./fileSaver";

export async function exportReport(
  report: ReportModel,
  format: ExportFormat
): Promise<ExportResult> {
  const filename = getSanitizedReportFilename(
    report.company.companyName,
    report.metadata.projectName,
    format
  );

  let buffer: Uint8Array;
  if (format === "docx") {
    buffer = await buildDocxBuffer(report);
  } else {
    buffer = await buildPdfBuffer(report);
  }

  return saveReportBuffer(buffer, filename, format);
}
