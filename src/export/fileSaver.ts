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
 * Converts raw native runtime/ACL/filesystem errors into user-friendly localized messages.
 */
export function formatUserFriendlyError(err: any): string {
  const msg = err instanceof Error ? err.message : String(err || "");

  if (
    msg.includes("not allowed by ACL") ||
    msg.includes("plugin:fs|write_file") ||
    msg.includes("fs:allow-write-file")
  ) {
    return "Dosya kaydedilemedi. Lütfen uygulamanın dosya yazma izinlerini veya hedef klasör yetkisini kontrol edin.";
  }

  if (msg.includes("plugin:dialog") || msg.includes("dialog|save")) {
    return "Dosya kaydetme penceresi açılamadı. Lütfen sistem izinlerini kontrol edin.";
  }

  if (
    msg.includes("EBUSY") ||
    msg.includes("locked") ||
    msg.includes("used by another process")
  ) {
    return "Dosya başka bir program (örn. Microsoft Word veya Adobe Acrobat) tarafından açık tutulduğu için üzerine yazılamadı. Lütfen açık dosyayı kapatıp tekrar deneyin.";
  }

  if (
    msg.includes("EACCES") ||
    msg.includes("Permission denied") ||
    msg.includes("Access is denied")
  ) {
    return "Seçilen konuma dosya yazma izni bulunmuyor. Lütfen Masaüstü veya Belgeler klasörünü seçin.";
  }

  return msg || "Dosya kaydedilirken beklenmeyen bir hata oluştu.";
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
      error: formatUserFriendlyError(err),
    };
  }
}
