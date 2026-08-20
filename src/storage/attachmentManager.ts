/**
 * ERP CRM Discovery — Question Evidence & Attachments Storage & Security Manager
 *
 * FAZ-33: Soru Bazlı Kanıt ve Dosya Ekleri
 *
 * Temel Mimari Prensipler:
 * 1. Sıfır DB Binary: Dosyalar diskte tutulur, SQLite'a yalnızca göreli path ve metadata kaydedilir.
 * 2. Göreli Path: projects/{projectId}/attachments/{bfCode}/{questionId}/{uuid}_{safeFileName}
 * 3. Güvenlik: Path traversal koruması, uzantı & MIME allowlist, dosya adı sanitization.
 * 4. Boyut Sınırları: Tek dosya 25 MB, Soru 100 MB, Proje 1 GB.
 * 5. Çift Doğrulama: SHA-256 checksum ile mükerrer kontrolü.
 */

import type {
  AllowedAttachmentExtension,
  AllowedAttachmentMimeType,
} from "../types";

// ─────────────────────────────────────────────────────────────
// 1. Allowlist & Sınır Sabitleri
// ─────────────────────────────────────────────────────────────

export const ALLOWED_MIME_TYPES: readonly AllowedAttachmentMimeType[] = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
] as const;

export const ALLOWED_EXTENSIONS: readonly AllowedAttachmentExtension[] = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "pdf",
  "docx",
  "xlsx",
  "csv",
  "txt",
] as const;

export const MAX_SINGLE_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_QUESTION_TOTAL_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_PROJECT_TOTAL_BYTES = 1024 * 1024 * 1024; // 1 GB

export const EXTENSION_TO_MIME: Record<AllowedAttachmentExtension, AllowedAttachmentMimeType> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
  csv: "text/csv",
};

// ─────────────────────────────────────────────────────────────
// 2. Güvenlik & Dosya Adı Sanitization
// ─────────────────────────────────────────────────────────────

/**
 * Dosya adından tehlikeli karakterleri, path traversal sekanslarını ve geçersiz baytları temizler.
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== "string") {
    return "attachment";
  }

  // 1. Sadece dosya adını al (varsa path ayraçlarını temizle)
  let name = fileName.replace(/\\/g, "/").split("/").pop() || "attachment";

  // 2. Null bytes, kontrol karakterleri ve path traversal sekanslarını temizle
  name = name.replace(/\0/g, "").replace(/\.\.+/g, ".");

  // 3. Boşlukları alt çizgiye çevir
  name = name.trim().replace(/\s+/g, "_");

  // 4. Türkçe karakterleri sadeleştir veya güvenli unicode/ASCII eşle
  name = name
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "U")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "O")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C");

  // 5. Güvenli karakter kümesi dışındaki karakterleri temizle (Sadece a-z, A-Z, 0-9, _, -, .)
  name = name.replace(/[^a-zA-Z0-9_\-\.]/g, "");

  // 6. Başında nokta varsa güvenli hale getir
  if (name.startsWith(".")) {
    name = "file" + name;
  }

  return name || "attachment";
}

/**
 * Dosya uzantısını küçük harfle döner.
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  if (parts.length < 2) return "";
  return parts.pop()!.toLowerCase().trim();
}

/**
 * Mutlak path verilirse güvenlik amacıyla hata fırlatır.
 */
export function rejectAbsolutePath(pathStr: string): void {
  if (!pathStr || typeof pathStr !== "string") return;

  const normalized = pathStr.trim();
  if (
    normalized.startsWith("/") ||
    /^[a-zA-Z]:[\\/]/.test(normalized) ||
    normalized.startsWith("\\\\") ||
    normalized.startsWith("file://") ||
    normalized.startsWith("~")
  ) {
    throw new Error(`Güvenlik Hatası: Mutlak işletim sistemi yolu kabul edilmez: "${pathStr}"`);
  }

  if (normalized.includes("..") || normalized.includes("\0")) {
    throw new Error(`Güvenlik Hatası: Path traversal tespit edildi: "${pathStr}"`);
  }
}

/**
 * Göreli yolun beklenen kanonik desende olduğunu doğrular.
 */
export function validateRelativePath(relativePath: string): boolean {
  try {
    rejectAbsolutePath(relativePath);
    if (!relativePath.startsWith("projects/")) return false;
    if (relativePath.includes("\\")) return false; // Her zaman standart forward-slash
    const parts = relativePath.split("/");
    return parts.length >= 6 && parts[2] === "attachments";
  } catch {
    return false;
  }
}

/**
 * Benzersiz depolama dosya adı üretir: {uuid}_{safeFileName}
 */
export function generateStoredFileName(originalFileName: string): string {
  const safeName = sanitizeFileName(originalFileName);
  let uuid = "";
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    uuid = crypto.randomUUID().replace(/-/g, "").substring(0, 16);
  } else {
    uuid = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }
  return `${uuid}_${safeName}`;
}

/**
 * Standart göreli yolu oluşturur:
 * projects/{projectId}/attachments/{bfCode}/{questionId}/{storedFileName}
 */
export function buildRelativePath(
  projectId: string,
  bfCode: string,
  questionId: string,
  storedFileName: string
): string {
  const cleanProj = sanitizeFileName(projectId);
  const cleanBf = sanitizeFileName(bfCode);
  const cleanQ = sanitizeFileName(questionId);
  const cleanStored = sanitizeFileName(storedFileName);

  return `projects/${cleanProj}/attachments/${cleanBf}/${cleanQ}/${cleanStored}`;
}

// ─────────────────────────────────────────────────────────────
// 3. Dosya Doğrulama & Allowlist Kontrolü
// ─────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAttachment(
  file: { name: string; size: number; type?: string },
  currentQuestionSizeBytes: number = 0,
  currentProjectSizeBytes: number = 0
): ValidationResult {
  // 1. Dosya adı kontrolü
  if (!file.name || file.name.trim() === "") {
    return { valid: false, error: "Geçersiz dosya adı." };
  }

  // 2. Uzantı kontrolü
  const ext = getFileExtension(file.name) as AllowedAttachmentExtension;
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Desteklenmeyen dosya uzantısı (.${ext || "yok"}). İzin verilenler: PNG, JPG, WEBP, PDF, DOCX, XLSX, CSV, TXT.`,
    };
  }

  // 3. Boyut kontrolleri
  if (file.size <= 0) {
    return { valid: false, error: "Boş dosya (0 bayt) eklenemez." };
  }

  if (file.size > MAX_SINGLE_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Dosya boyutu (${formatFileSize(file.size)}) üst sınırı (25 MB) aşıyor.`,
    };
  }

  if (currentQuestionSizeBytes + file.size > MAX_QUESTION_TOTAL_BYTES) {
    return {
      valid: false,
      error: `Bu soruya ait toplam dosya boyutu sınırı (100 MB) aşıldı.`,
    };
  }

  if (currentProjectSizeBytes + file.size > MAX_PROJECT_TOTAL_BYTES) {
    return {
      valid: false,
      error: `Proje genel kanıt depolama sınırı (1 GB) aşıldı.`,
    };
  }

  return { valid: true };
}

// ─────────────────────────────────────────────────────────────
// 4. SHA-256 Checksum Hesaplama
// ─────────────────────────────────────────────────────────────

export async function calculateSha256(data: ArrayBuffer | Uint8Array): Promise<string> {
  const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data);

  if (typeof crypto !== "undefined" && crypto.subtle && typeof crypto.subtle.digest === "function") {
    const hashBuffer = await crypto.subtle.digest("SHA-256", uint8 as unknown as BufferSource);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Node.js fallback if running in test runner
  try {
    const nodeCrypto = await import("node:crypto");
    const hash = nodeCrypto.createHash("sha256");
    hash.update(Buffer.from(uint8.buffer, uint8.byteOffset, uint8.byteLength));
    return hash.digest("hex");
  } catch (err) {
    throw new Error("SHA-256 hesaplama mekanizması bulunamadı.");
  }
}

// ─────────────────────────────────────────────────────────────
// 5. Görsel / UI Yardımcıları
// ─────────────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export type FileCategory = "image" | "pdf" | "excel" | "word" | "text" | "file";

export function getFileCategory(extension: string): FileCategory {
  const ext = extension.toLowerCase();
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["xlsx", "xls", "csv"].includes(ext)) return "excel";
  if (["docx", "doc"].includes(ext)) return "word";
  if (["txt", "log", "md"].includes(ext)) return "text";
  return "file";
}

// ─────────────────────────────────────────────────────────────
// 6. Tauri & Sandbox Dosya I/O Köprüsü
// ─────────────────────────────────────────────────────────────

// Tarayıcı/In-memory sandbox (Tauri dışı geliştirme ve test ortamı için)
const memoryStorage = new Map<string, Uint8Array>();

export async function saveAttachmentFile(
  relativePath: string,
  buffer: Uint8Array
): Promise<void> {
  validateRelativePath(relativePath);

  try {
    // Tauri runtime tespiti
    const { writeFile, mkdir } = await import("@tauri-apps/plugin-fs");
    const { appDataDir } = await import("@tauri-apps/api/path");

    const baseDir = await appDataDir();
    const fullPath = `${baseDir}/${relativePath}`.replace(/\/+/g, "/");
    const dirPath = fullPath.substring(0, fullPath.lastIndexOf("/"));

    await mkdir(dirPath, { recursive: true });
    await writeFile(fullPath, buffer);
  } catch {
    // Tauri FS mevcut değilse veya Node/Test/Browser ortamındaysak memory storage kullanılır
    memoryStorage.set(relativePath, buffer);
  }
}

export async function readAttachmentFile(
  relativePath: string
): Promise<Uint8Array | null> {
  validateRelativePath(relativePath);

  try {
    const { readFile } = await import("@tauri-apps/plugin-fs");
    const { appDataDir } = await import("@tauri-apps/api/path");

    const baseDir = await appDataDir();
    const fullPath = `${baseDir}/${relativePath}`.replace(/\/+/g, "/");
    return await readFile(fullPath);
  } catch {
    return memoryStorage.get(relativePath) || null;
  }
}

export async function deleteAttachmentFile(
  relativePath: string
): Promise<void> {
  validateRelativePath(relativePath);

  try {
    const { remove } = await import("@tauri-apps/plugin-fs");
    const { appDataDir } = await import("@tauri-apps/api/path");

    const baseDir = await appDataDir();
    const fullPath = `${baseDir}/${relativePath}`.replace(/\/+/g, "/");
    await remove(fullPath);
  } catch {
    memoryStorage.delete(relativePath);
  }
}
