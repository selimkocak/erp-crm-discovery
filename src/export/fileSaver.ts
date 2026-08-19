/**
 * ERP CRM Discovery — Tauri Native File Saver & Dialog Service
 *
 * Exclusively uses official Tauri 2 native plugins:
 * - @tauri-apps/plugin-dialog for OS native save dialog
 * - @tauri-apps/plugin-fs for writing binary buffers directly to disk
 *
 * Pure desktop implementation with zero browser fallbacks.
 */

import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import type { ExportFormat, ExportResult } from "./types";

/**
 * Opens the OS native Save File dialog and prompts user for destination path.
 * Returns the selected absolute path, or null if user cancelled.
 */
export async function chooseSavePath(
  defaultFileName: string,
  format: ExportFormat
): Promise<string | null> {
  const filterName =
    format === "docx"
      ? "Microsoft Word Belgesi (*.docx)"
      : "PDF Belgesi (*.pdf)";

  try {
    const selectedPath = await save({
      defaultPath: defaultFileName,
      filters: [
        {
          name: filterName,
          extensions: [format],
        },
      ],
    });

    return selectedPath;
  } catch (err) {
    console.error("Tauri dialog.save hatası:", err);
    throw err;
  }
}

/**
 * Writes binary buffer to the specified absolute file path on disk via Tauri FS plugin.
 */
export async function writeExportFile(
  filePath: string,
  buffer: Uint8Array
): Promise<void> {
  await writeFile(filePath, buffer);
}

/**
 * Main export file save orchestrator.
 * Handles native dialog prompt, write operation, and clean cancellation.
 */
export async function saveReportBuffer(
  buffer: Uint8Array,
  defaultFileName: string,
  format: ExportFormat
): Promise<ExportResult> {
  try {
    // 1. Prompt native OS Save Dialog
    const selectedPath = await chooseSavePath(defaultFileName, format);

    // 2. User cancelled dialog
    if (!selectedPath) {
      return {
        success: false,
        cancelled: true,
      };
    }

    // 3. Write binary buffer via Tauri FS
    await writeExportFile(selectedPath, buffer);

    return {
      success: true,
      filePath: selectedPath,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
