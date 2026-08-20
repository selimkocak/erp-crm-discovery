/**
 * ERP CRM Discovery — Attachment Links & Native Opener Service
 *
 * FAZ-33: Soru Bazlı Kanıt ve Dosya Ekleri - Tıklanabilir Hyperlink ve Native Dosya Açıcı
 *
 * Temel Özellikler:
 * 1. Native Path -> Standardized file:/// URL dönüşümü (Windows, macOS, Linux).
 * 2. UTF-8 RFC-3986 uyumlu Percent Encoding (Türkçe karakterler, boşluklar, parantezler).
 * 3. Tauri Native Opener & In-Memory / Web fallback köprüsü.
 * 4. Güvenlik: Path traversal koruması ve eksik dosya dostça hata yönetimi.
 */

import { validateRelativePath, readAttachmentFile } from "./attachmentManager";

/**
 * Göreli yoldan platformun mutlak native işletim sistemi yolunu üretir.
 */
export async function resolveAttachmentAbsolutePath(
  relativePath: string,
  baseDirOverride?: string
): Promise<string> {
  validateRelativePath(relativePath);

  let baseDir = baseDirOverride;
  if (!baseDir) {
    try {
      const { appDataDir } = await import("@tauri-apps/api/path");
      baseDir = await appDataDir();
    } catch {
      baseDir = "/app-data";
    }
  }

  // Normalize path separators
  const isWindows = /^[a-zA-Z]:[\\/]/.test(baseDir) || baseDir.includes("\\");
  const cleanBase = baseDir.replace(/\\/g, "/").replace(/\/+$/, "");
  const fullPath = `${cleanBase}/${relativePath}`.replace(/\/+/g, "/");

  if (isWindows) {
    return fullPath.replace(/\//g, "\\");
  }
  return fullPath;
}

/**
 * Mutlak veya göreli dosya yolunu standart `file:///...` URL formatına dönüştürür.
 *
 * Örnek macOS: /Users/selim/Library/App Data/test.pdf -> file:///Users/selim/Library/App%20Data/test.pdf
 * Örnek Windows: C:\Users\Selim\AppData\Local\test.xlsx -> file:///C:/Users/Selim/AppData/Local/test.xlsx
 * Türkçe karakterler: İskonto_Raporu.xlsx -> %C4%B0skonto_Raporu.xlsx
 */
export function attachmentPathToFileUrl(filePath: string): string {
  if (!filePath || typeof filePath !== "string") {
    return "file:///";
  }

  let normalized = filePath.trim();

  // Eğer zaten file:// ile başlıyorsa temizle
  if (normalized.startsWith("file://")) {
    normalized = normalized.substring(7);
  }

  // Windows backslash ayraçlarını forward-slash'a çevir
  normalized = normalized.replace(/\\/g, "/");

  // Windows sürücü harfi kontrolü (örn: C:/Users/...)
  const isWindowsDrive = /^[a-zA-Z]:/.test(normalized);

  // Parçalara ayır ve her bir segmenti encode et (sürücü harfi iki nokta hariç)
  const segments = normalized.split("/");
  const encodedSegments = segments.map((seg, idx) => {
    if (idx === 0 && isWindowsDrive) {
      // C: kısmını aynen koru
      return seg;
    }
    if (seg === "") return "";
    // encodeURIComponent kullan ancak dosya adı için güvenli karakterleri koru
    return encodeURIComponent(seg)
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29")
      .replace(/!/g, "%21")
      .replace(/\*/g, "%2A");
  });

  let joined = encodedSegments.join("/");

  if (isWindowsDrive) {
    if (!joined.startsWith("/")) {
      joined = "/" + joined;
    }
    return `file://${joined}`;
  }

  if (!joined.startsWith("/")) {
    joined = "/" + joined;
  }
  return `file://${joined}`;
}

/**
 * Dosyanın diskte veya sanal depoda var olup olmadığını kontrol eder.
 */
export async function attachmentExists(relativePath: string): Promise<boolean> {
  if (!validateRelativePath(relativePath)) {
    return false;
  }

  try {
    const buffer = await readAttachmentFile(relativePath);
    return buffer !== null && buffer.byteLength > 0;
  } catch {
    return false;
  }
}

export interface OpenAttachmentResult {
  success: boolean;
  error?: string;
}

/**
 * Ek dosyayı işletim sisteminin varsayılan uygulamasıyla (veya web önizlemesiyle) açar.
 */
export async function openAttachment(attachment: {
  relative_path?: string;
  relativePath?: string;
  original_name?: string;
  originalFileName?: string;
}): Promise<OpenAttachmentResult> {
  const relPath = attachment.relative_path || attachment.relativePath || "";
  const originalName = attachment.original_name || attachment.originalFileName || "Dosya";

  if (!validateRelativePath(relPath)) {
    return {
      success: false,
      error: "Geçersiz dosya yolu formatı.",
    };
  }

  const exists = await attachmentExists(relPath);
  if (!exists) {
    return {
      success: false,
      error: `Dosya bulunamadı: "${originalName}". Dosya yerel depolamadan silinmiş veya taşınmış olabilir.`,
    };
  }

  try {
    const absPath = await resolveAttachmentAbsolutePath(relPath);

    // 1. Tauri Invoke varsa çağır
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("open_attachment_path", { path: absPath });
      return { success: true };
    } catch (invokeErr: any) {
      // Eğer komut bulunamadıysa fallback'e geç
      console.warn("Tauri open_attachment_path invoke fallback:", invokeErr);
    }

    // 2. Web / Blob Fallback
    const buffer = await readAttachmentFile(relPath);
    if (buffer) {
      const blob = new Blob([buffer as unknown as BlobPart]);
      const blobUrl = URL.createObjectURL(blob);
      const tempLink = document.createElement("a");
      tempLink.href = blobUrl;
      tempLink.download = originalName;
      tempLink.target = "_blank";
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      return { success: true };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: `Dosya açılırken bir sorun oluştu: "${originalName}". Lütfen dosya izinlerini kontrol edin.`,
    };
  }
}
