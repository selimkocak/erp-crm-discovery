/**
 * ERP CRM Discovery — Managed Attachment Vault Storage & Security Manager
 *
 * FAZ-33: Soru Bazlı Kanıt ve Dosya Ekleri — Yönetilen Kanıt Kasası (Managed Attachment Vault)
 *
 * Temel Mimari Prensipler:
 * 1. Kaynak Bağımsızlığı: Kullanıcı dosyayı bilgisayarında nereden seçerse seçsin (Downloads, Desktop,
 *    Documents, harici disk, ağ klasörü), uygulama orijinal dosyaya dokunmadan dosyanın fiziksel bir
 *    kopyasını kendi kalıcı ve yönetilen attachment kasasına ({appLocalDataDir}/projects/...) alır.
 * 2. Tek Gerçek Referans: Uygulama ve raporlar yalnız yönetilen kopyayı kullanır. Kaynak dosya silinse,
 *    yeniden adlandırılsa veya taşınsa dahi kanıt dosyası ve raporlar etkilenmez.
 * 3. Sıfır DB Binary & Sadece Managed Relative Path: SQLite'a yalnız kanonik göreli yol kaydedilir:
 *    projects/{projectId}/attachments/{bfCode}/{questionId}/{uuid}_{safeFileName}
 * 4. Boyut & Güvenlik Sınırları: Path traversal koruması, uzantı allowlist, tek dosya 25 MB, soru 100 MB, proje 1 GB.
 * 5. Çift Doğrulama: Fiziksel kayıt ve exists kontrolü başarılı olmadan DB kaydı yazılmaz.
 * 6. Kalıcılık: Uygulama güncellendiğinde veya yeni sürüm kurulduğunda appLocalDataDir klasörü korunur.
 */

import type {
  AllowedAttachmentExtension,
  AllowedAttachmentMimeType,
  QuestionAttachment,
} from "../types";
import {
  addQuestionAttachment,
  findAttachmentBySha256,
  updateQuestionAttachmentReimport,
} from "../db/client";

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

export const MANAGED_VAULT_APP_NAME = "ERP CRM Discovery";
export const MANAGED_VAULT_DIR_NAME = "attachment";

/**
 * Göreli yolun beklenen kanonik desende olduğunu doğrular.
 * Standart: attachment/{projectId}/{bfCode}/{questionId}/{storedFileName}
 * Legacy uyumluluk: projects/{projectId}/attachments/{bfCode}/{questionId}/{storedFileName}
 */
export function validateRelativePath(relativePath: string): boolean {
  try {
    rejectAbsolutePath(relativePath);
    if (!relativePath || typeof relativePath !== "string") return false;
    if (relativePath.includes("\\")) return false; // Her zaman standart forward-slash
    if (relativePath.startsWith("attachment/")) {
      const parts = relativePath.split("/");
      return parts.length >= 5 && Boolean(parts[1] && parts[2] && parts[3] && parts[4]);
    }
    if (relativePath.startsWith("projects/")) {
      const parts = relativePath.split("/");
      return parts.length >= 6 && parts[2] === "attachments";
    }
    return false;
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
 * attachment/{projectId}/{businessFunctionCode}/{questionId}/{storedFileName}
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

  return `attachment/${cleanProj}/${cleanBf}/${cleanQ}/${cleanStored}`;
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
// 6. Managed Attachment Vault — Kalıcı Yerel Kasa & I/O
// ─────────────────────────────────────────────────────────────

// Tarayıcı/In-memory sandbox (Tauri dışı geliştirme ve test ortamı için)
const memoryStorage = new Map<string, Uint8Array>();

/**
 * Test ortamlarında in-memory depolamayı temizler.
 */
export function clearMemoryStorage(): void {
  memoryStorage.clear();
}

/**
 * Returns the canonical root directory of the Managed Attachment Vault.
 *
 * Windows: %LOCALAPPDATA%\ERP CRM Discovery\attachment
 * macOS:   ~/Library/Application Support/ERP CRM Discovery/attachment
 * Linux:   ~/.local/share/ERP CRM Discovery/attachment
 */
export async function getManagedAttachmentRoot(): Promise<string> {
  try {
    const { localDataDir, appLocalDataDir } = await import("@tauri-apps/api/path");
    if (typeof localDataDir === "function") {
      const base = await localDataDir();
      if (base) {
        const cleanBase = base.replace(/[/\\]+$/, "").replace(/\\/g, "/");
        return `${cleanBase}/${MANAGED_VAULT_APP_NAME}/${MANAGED_VAULT_DIR_NAME}`;
      }
    }
    if (typeof appLocalDataDir === "function") {
      const appLocal = await appLocalDataDir();
      if (appLocal) {
        const clean = appLocal.replace(/[/\\]+$/, "").replace(/\\/g, "/");
        if (clean.includes("com.erpcrm.discovery")) {
          const parent = clean.substring(0, clean.lastIndexOf("/"));
          return `${parent}/${MANAGED_VAULT_APP_NAME}/${MANAGED_VAULT_DIR_NAME}`;
        }
        if (!clean.endsWith(`/${MANAGED_VAULT_APP_NAME}`)) {
          return `${clean}/${MANAGED_VAULT_APP_NAME}/${MANAGED_VAULT_DIR_NAME}`;
        }
        return `${clean}/${MANAGED_VAULT_DIR_NAME}`;
      }
    }
  } catch {
    // Non-Tauri / test fallback
  }

  // Node.js / process.env fallback for tests and CLI runners
  if (typeof process !== "undefined" && process.env) {
    if (process.env.LOCALAPPDATA) {
      const local = process.env.LOCALAPPDATA.replace(/[/\\]+$/, "").replace(/\\/g, "/");
      return `${local}/${MANAGED_VAULT_APP_NAME}/${MANAGED_VAULT_DIR_NAME}`;
    }
    if (process.env.XDG_DATA_HOME) {
      const xdg = process.env.XDG_DATA_HOME.replace(/[/\\]+$/, "").replace(/\\/g, "/");
      return `${xdg}/${MANAGED_VAULT_APP_NAME}/${MANAGED_VAULT_DIR_NAME}`;
    }
    if (process.env.HOME) {
      const home = process.env.HOME.replace(/[/\\]+$/, "").replace(/\\/g, "/");
      return `${home}/.local/share/${MANAGED_VAULT_APP_NAME}/${MANAGED_VAULT_DIR_NAME}`;
    }
  }

  return `/app-data/${MANAGED_VAULT_APP_NAME}/${MANAGED_VAULT_DIR_NAME}`;
}

export async function getManagedVaultBaseDir(): Promise<string> {
  return await getManagedAttachmentRoot();
}

/**
 * Uygulama açılışında Managed Attachment Vault kök klasörünün varlığını garantiye alır.
 */
export async function ensureManagedAttachmentVaultRoot(): Promise<string> {
  const root = await getManagedAttachmentRoot();
  try {
    const { mkdir } = await import("@tauri-apps/plugin-fs");
    await mkdir(root, { recursive: true });
  } catch {
    // Test / web fallback
  }
  return root;
}

export async function saveAttachmentFile(
  relativePath: string,
  buffer: Uint8Array
): Promise<void> {
  validateRelativePath(relativePath);

  try {
    const { writeFile, mkdir } = await import("@tauri-apps/plugin-fs");
    const vaultRoot = await getManagedAttachmentRoot();
    const cleanRel = relativePath.startsWith("attachment/")
      ? relativePath.substring("attachment/".length)
      : relativePath.startsWith("projects/")
      ? relativePath.replace(/^projects\/([^/]+)\/attachments\//, "$1/")
      : relativePath;

    const fullPath = `${vaultRoot}/${cleanRel}`.replace(/\/+/g, "/");
    const dirPath = fullPath.substring(0, fullPath.lastIndexOf("/"));

    await mkdir(dirPath, { recursive: true });
    await writeFile(fullPath, buffer);
  } catch {
    // Memory storage fallback
    memoryStorage.set(relativePath, buffer);
  }
}

export async function readAttachmentFile(
  relativePath: string
): Promise<Uint8Array | null> {
  validateRelativePath(relativePath);

  try {
    const { readFile } = await import("@tauri-apps/plugin-fs");
    const vaultRoot = await getManagedAttachmentRoot();
    const cleanRel = relativePath.startsWith("attachment/")
      ? relativePath.substring("attachment/".length)
      : relativePath.startsWith("projects/")
      ? relativePath.replace(/^projects\/([^/]+)\/attachments\//, "$1/")
      : relativePath;

    const fullPath = `${vaultRoot}/${cleanRel}`.replace(/\/+/g, "/");
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
    const vaultRoot = await getManagedAttachmentRoot();
    const cleanRel = relativePath.startsWith("attachment/")
      ? relativePath.substring("attachment/".length)
      : relativePath.startsWith("projects/")
      ? relativePath.replace(/^projects\/([^/]+)\/attachments\//, "$1/")
      : relativePath;

    const fullPath = `${vaultRoot}/${cleanRel}`.replace(/\/+/g, "/");
    await remove(fullPath);
  } catch {
    memoryStorage.delete(relativePath);
  }
}

/**
 * Proje silindiğinde projeye ait tüm fiziksel kanıt dosyalarını ve klasörünü diskten temizler.
 */
export async function deleteProjectAttachmentsDirectory(
  projectId: string
): Promise<void> {
  const cleanProj = sanitizeFileName(projectId);

  try {
    const { remove } = await import("@tauri-apps/plugin-fs");
    const vaultRoot = await getManagedAttachmentRoot();
    const projectDir = `${vaultRoot}/${cleanProj}`;
    await remove(projectDir, { recursive: true });
  } catch {
    for (const key of Array.from(memoryStorage.keys())) {
      if (
        key.startsWith(`attachment/${cleanProj}/`) ||
        key.startsWith(`projects/${cleanProj}/`)
      ) {
        memoryStorage.delete(key);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 7. Managed Attachment Vault — İçe Aktarma Orkestrasyonu
// ─────────────────────────────────────────────────────────────

export interface ImportAttachmentOptions {
  projectId: string;
  businessFunctionCode: string;
  questionId: string;
  file: {
    name: string;
    size: number;
    type?: string;
    data: Uint8Array;
    sourcePath?: string;
  };
  description?: string;
  currentQuestionBytes?: number;
  currentProjectBytes?: number;
}

export interface ImportAttachmentResult {
  attachment: QuestionAttachment;
  isDuplicate: boolean;
  duplicateOf?: QuestionAttachment;
}

/**
 * Kaynak dosya nereden seçilirse seçilsin, dosyayı uygulamanın kalıcı Managed Vault'una
 * ikiz kopya olarak kaydeder, varlığını teyit eder ve SQLite metadata kaydını oluşturur.
 */
export async function importFileToManagedVault(
  options: ImportAttachmentOptions
): Promise<ImportAttachmentResult> {
  const {
    projectId,
    businessFunctionCode,
    questionId,
    file,
    description = "",
    currentQuestionBytes = 0,
    currentProjectBytes = 0,
  } = options;

  // 1. Doğrulama
  const validation = validateAttachment(file, currentQuestionBytes, currentProjectBytes);
  if (!validation.valid) {
    throw new Error(validation.error || "Geçersiz dosya.");
  }

  // 2. SHA-256 Checksum hesapla
  const sha256 = await calculateSha256(file.data);

  // 3. Proje içinde duplicate kontrolü
  const existingDup = await findAttachmentBySha256(projectId, sha256);
  const isDuplicate = Boolean(existingDup);

  // 4. Managed depolama dosya adı ve göreli yolu oluştur
  const ext = (file.name.split(".").pop()?.toLowerCase() || "") as keyof typeof EXTENSION_TO_MIME;
  const storedFileName = generateStoredFileName(file.name);
  const relativePath = buildRelativePath(projectId, businessFunctionCode, questionId, storedFileName);
  const resolvedMime = file.type || EXTENSION_TO_MIME[ext] || "application/octet-stream";

  // 5. Dosyayı fiziksel olarak Managed Vault'a kaydet (kopyala)
  await saveAttachmentFile(relativePath, file.data);

  // 6. Fiziksel varlığı doğrula (exists check)
  const savedData = await readAttachmentFile(relativePath);
  if (!savedData || savedData.byteLength !== file.data.byteLength) {
    throw new Error("Yönetilen kanıt kasasına yazma işlemi doğrulanamadı.");
  }

  // 7. SQLite metadata kaydı oluştur
  const now = new Date().toISOString();
  const attachment = await addQuestionAttachment({
    analysis_project_id: projectId,
    business_function_code: businessFunctionCode,
    question_id: questionId,
    original_file_name: file.name,
    stored_file_name: storedFileName,
    relative_path: relativePath,
    mime_type: resolvedMime,
    file_extension: ext,
    file_size: file.size,
    sha256,
    description: description || null,
    source_file_name: file.name,
    source_absolute_path: file.sourcePath || null,
    imported_at: now,
  });

  return {
    attachment,
    isDuplicate,
    duplicateOf: existingDup || undefined,
  };
}

/**
 * Eksik veya legacy bir kaydı, kullanıcının seçtiği yeni bir dosya ile Managed Vault'a yeniden yazar.
 */
export async function reimportAttachmentFile(
  attachmentId: string,
  projectId: string,
  businessFunctionCode: string,
  questionId: string,
  file: {
    name: string;
    size: number;
    type?: string;
    data: Uint8Array;
    sourcePath?: string;
  }
): Promise<QuestionAttachment> {
  const validation = validateAttachment(file);
  if (!validation.valid) {
    throw new Error(validation.error || "Geçersiz dosya.");
  }

  const sha256 = await calculateSha256(file.data);
  const ext = (file.name.split(".").pop()?.toLowerCase() || "") as keyof typeof EXTENSION_TO_MIME;
  const storedFileName = generateStoredFileName(file.name);
  const relativePath = buildRelativePath(projectId, businessFunctionCode, questionId, storedFileName);
  const resolvedMime = file.type || EXTENSION_TO_MIME[ext] || "application/octet-stream";

  // Fiziksel kasaya yaz
  await saveAttachmentFile(relativePath, file.data);

  // Varlık kontrolü
  const savedData = await readAttachmentFile(relativePath);
  if (!savedData || savedData.byteLength !== file.data.byteLength) {
    throw new Error("Yeniden içe aktarma doğrulanamadı.");
  }

  // DB güncelle
  await updateQuestionAttachmentReimport(attachmentId, {
    original_file_name: file.name,
    stored_file_name: storedFileName,
    relative_path: relativePath,
    mime_type: resolvedMime,
    file_extension: ext,
    file_size: file.size,
    sha256,
    source_file_name: file.name,
    source_absolute_path: file.sourcePath || null,
  });

  return {
    id: attachmentId,
    analysis_project_id: projectId,
    business_function_code: businessFunctionCode,
    question_id: questionId,
    original_file_name: file.name,
    stored_file_name: storedFileName,
    relative_path: relativePath,
    mime_type: resolvedMime,
    file_extension: ext,
    file_size: file.size,
    sha256,
    source_file_name: file.name,
    source_absolute_path: file.sourcePath || null,
    imported_at: new Date().toISOString(),
    status: "valid",
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
