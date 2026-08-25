/**
 * ERP CRM Discovery — Attachment Links & Native Opener Service
 *
 * FAZ-33: Soru Bazlı Kanıt ve Dosya Ekleri - Tıklanabilir Hyperlink ve Native Dosya Açıcı
 * HOTFIX: Windows 11 file:/// üçlü-slash ve relative path çözümleme düzeltmeleri
 *
 * Temel Özellikler:
 * 1. Managed Vault Path -> Standardized file:/// URL dönüşümü (Windows, macOS, Linux).
 * 2. UTF-8 RFC-3986 uyumlu Percent Encoding (Türkçe karakterler, boşluklar, parantezler).
 * 3. Tauri Native Opener & In-Memory / Web fallback köprüsü.
 * 4. Güvenlik: Path traversal koruması ve eksik dosya dostça hata yönetimi.
 * 5. Yalnızca Managed Kopyayı Açma: Asla kaynak path veya ham dosya adı kullanılmaz.
 *
 * Windows Kuralları:
 *   - file:///C:/Users/...  (3 slash — RFC 8089 uyumlu)
 *   - Backslash → forward-slash
 *   - Boşluk ve Türkçe karakter → %XX encode
 *   - cmd /C start "" "C:\..." şeklinde native açma (backslash)
 */

import {
  validateRelativePath,
  readAttachmentFile,
  getManagedAttachmentRoot,
  isTauriRuntime,
} from "./attachmentManager";

// ─────────────────────────────────────────────────────────────
// 1. Path Çözümleme — Relative → Absolute
// ─────────────────────────────────────────────────────────────


/**
 * Göreli yoldan platformun mutlak native işletim sistemi yolunu üretir.
 * Windows: C:\Users\selim\AppData\Local\ERP CRM Discovery\attachment\...
 * macOS:   /Users/selim/Library/Application Support/ERP CRM Discovery/attachment/...
 * Linux:   /home/selim/.local/share/ERP CRM Discovery/attachment/...
 */
export async function resolveAttachmentAbsolutePath(
  relativePath: string,
  baseDirOverride?: string
): Promise<string> {
  // Path traversal guard — validateRelativePath false döndürürse throw
  const isValid = validateRelativePath(relativePath);
  if (!isValid) {
    throw new Error(
      `Geçersiz veya güvensiz relative path: "${relativePath}". Path traversal reddedildi.`
    );
  }

  const baseDir = baseDirOverride || (await getManagedAttachmentRoot());

  // Normalize path separators to forward-slash for joining
  const cleanBase = baseDir.replace(/\\/g, "/").replace(/\/+$/, "");
  const cleanRel = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");

  let subPath = cleanRel;
  if (cleanRel.startsWith("attachment/")) {
    if (cleanBase.endsWith("/attachment")) {
      subPath = cleanRel.substring("attachment/".length);
    }
  } else if (cleanRel.startsWith("projects/")) {
    if (cleanBase.endsWith("/attachment")) {
      subPath = cleanRel.replace(/^projects\/([^/]+)\/attachments\//, "$1/");
    }
  }

  const joined = `${cleanBase}/${subPath}`;

  // ".." segmentlerini çöz — path traversal'ın startsWith kontrolünü atlatmasını engeller
  const segments = joined.split("/");
  const resolved: string[] = [];
  for (const seg of segments) {
    if (seg === "..") {
      resolved.pop();
    } else if (seg !== ".") {
      resolved.push(seg);
    }
  }
  const fullPath = resolved.join("/");

  // Vault-root kontrolü: çözümlenmiş yol vault kökü altında olmalı
  const normalizedBase = cleanBase.replace(/\/+$/, "");
  if (!fullPath.startsWith(normalizedBase + "/") && fullPath !== normalizedBase) {
    throw new Error("Path traversal engellendi: Yol vault kökü dışına çıkıyor.");
  }

  // Windows: sürücü harfi tespiti
  const isWindows = /^[a-zA-Z]:/.test(cleanBase);
  if (isWindows) {
    // Windows native path: forward-slash → backslash
    return fullPath.replace(/\//g, "\\");
  }
  return fullPath;
}


// ─────────────────────────────────────────────────────────────
// 2. Absolute Path → file:/// URL
// ─────────────────────────────────────────────────────────────

/**
 * Mutlak dosya yolunu RFC-8089 uyumlu `file:///` URL formatına dönüştürür.
 *
 * Örnek macOS:  /Users/selim/Library/Application Support/test.pdf
 *            →  file:///Users/selim/Library/Application%20Support/test.pdf
 *
 * Örnek Windows: C:\Users\Selim\AppData\Local\test.xlsx
 *             →  file:///C:/Users/Selim/AppData/Local/test.xlsx
 *
 * Kurallar:
 *   - file:///C:/...  (3 slash — RFC 8089)
 *   - Boşluk → %20, Türkçe → %XX
 *   - Backslash → forward-slash
 */
export function attachmentPathToFileUrl(filePath: string): string {
  if (!filePath || typeof filePath !== "string") {
    return "file:///";
  }

  let normalized = filePath.trim();

  // Zaten file:// ile başlıyorsa tüm prefix'i soy
  if (normalized.startsWith("file:///")) {
    normalized = normalized.substring(8); // "file:///" sonrası
  } else if (normalized.startsWith("file://")) {
    normalized = normalized.substring(7); // "file://" sonrası
  }

  // Windows backslash → forward-slash
  normalized = normalized.replace(/\\/g, "/");

  // Windows sürücü harfi kontrolü (örn: C:/Users/...)
  const isWindowsDrive = /^[a-zA-Z]:/.test(normalized);

  // Segmentlere böl ve encode et
  const segments = normalized.split("/");
  const encodedSegments = segments.map((seg, idx) => {
    // Windows sürücü harfi "C:" → aynen koru
    if (idx === 0 && isWindowsDrive) return seg;
    if (seg === "") return "";
    return encodeURIComponent(seg)
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29")
      .replace(/!/g, "%21")
      .replace(/\*/g, "%2A");
  });

  let joined = encodedSegments.join("/");

  // RFC-8089: file:/// + path
  // Windows: file:///C:/Users/...  (slash önce sürücü harfi)
  // POSIX:   file:///home/...      (slash önce kök)
  if (!joined.startsWith("/")) {
    joined = "/" + joined;
  }
  // Daima 3 slash: file:// + /path = file:///path
  return `file://${joined}`;
}

// ─────────────────────────────────────────────────────────────
// 3. Relative Path → file:/// URL  (DOCX/PDF export için)
// ─────────────────────────────────────────────────────────────

/**
 * Göreli yoldan yönetilen kopyanın tam `file:///...` hyperlink URL'sini üretir.
 * appLocalDataDir ile mutlak yola çevirip RFC-8089 encode eder.
 */
export async function resolveAttachmentFileUrl(
  relativePath: string,
  baseDirOverride?: string
): Promise<string> {
  const absPath = await resolveAttachmentAbsolutePath(relativePath, baseDirOverride);
  return attachmentPathToFileUrl(absPath);
}

/**
 * DOCX ve PDF export'u için:
 * att.relativePath → appLocalDataDir çözümleme → file:/// URL
 *
 * Hata durumunda boş string döner (export çökmez).
 */
export async function resolveAttachmentFileUrlFromRelative(
  relativePath: string
): Promise<string> {
  if (!relativePath) return "";
  try {
    return await resolveAttachmentFileUrl(relativePath);
  } catch {
    return "";
  }
}

// ─────────────────────────────────────────────────────────────
// 4. Dosya Varlık Kontrolü
// ─────────────────────────────────────────────────────────────

/**
 * Dosyanın Managed Vault diskinde veya sanal depoda var olup olmadığını kontrol eder.
 */
export async function attachmentExists(relativePath: string): Promise<boolean> {
  if (!validateRelativePath(relativePath)) {
    return false;
  }

  if (isTauriRuntime()) {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      return await invoke<boolean>("check_attachment_exists_in_vault", { relativePath });
    } catch {
      return false;
    }
  }

  try {
    const buffer = await readAttachmentFile(relativePath);
    return buffer !== null && buffer.byteLength > 0;
  } catch {
    return false;
  }
}


// ─────────────────────────────────────────────────────────────
// 5. Native OS Dosya Açıcı
// ─────────────────────────────────────────────────────────────

export interface OpenAttachmentResult {
  success: boolean;
  error?: string;
}

/**
 * Ek dosyayı Managed Vault kopyasından işletim sisteminin varsayılan uygulamasıyla açar.
 *
 * Akış:
 *   attachment.relative_path
 *     → resolveAttachmentAbsolutePath   (appLocalDataDir + relative → native absolute)
 *     → validatePathInsideVault         (traversal guard)
 *     → invoke("open_attachment_path")  (Tauri Rust command → OS opener)
 *     → Blob fallback                   (web/test ortamı)
 *
 * Windows:  cmd /C start "" "C:\...\dosya.pdf"
 * macOS:    open /Users/.../dosya.pdf
 * Linux:    xdg-open /home/.../dosya.pdf
 */
// ─────────────────────────────────────────────────────────────
// 6. Dosya Yöneticisinde Göster ("Klasörde Göster")
// ─────────────────────────────────────────────────────────────

/**
 * Managed Vault dosyasını seçili olarak işletim sisteminin dosya
 * yöneticisinde gösterir.
 *
 * Windows: explorer.exe /select,"C:\...\dosya.pdf"
 * macOS:   open -R "/Users/.../dosya.pdf"
 * Linux:   xdg-open "/parent/dir/"
 *
 * Test / web ortamında sessizce { success: true } döner.
 */
export async function showAttachmentInFolder(
  relativePath: string
): Promise<{ success: boolean; error?: string }> {
  if (!validateRelativePath(relativePath)) {
    return {
      success: false,
      error: "Geçersiz dosya yolu formatı — klasör gösterilemedi.",
    };
  }

  try {
    const absPath = await resolveAttachmentAbsolutePath(relativePath);

    if (isTauriRuntime()) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("show_attachment_in_folder", { path: absPath });
        return { success: true };
      } catch (invokeErr: any) {
        // Fallback: @tauri-apps/plugin-opener revealItemInDir
        try {
          const { revealItemInDir } = await import("@tauri-apps/plugin-opener");
          await revealItemInDir(absPath);
          return { success: true };
        } catch (openerErr: any) {
          console.warn("show_attachment_in_folder hatasi:", invokeErr, openerErr);
          return {
            success: false,
            error: `Klasör açılamadı: ${invokeErr?.message || invokeErr}`,
          };
        }
      }
    }

    // Web / test ortamı — sessiz başarı
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: `Klasör açılırken bir sorun oluştu: ${err?.message || err}`,
    };
  }
}

export async function openAttachment(attachment: {
  relative_path?: string;
  relativePath?: string;
  original_name?: string;
  originalFileName?: string;
  original_file_name?: string;
}): Promise<OpenAttachmentResult> {
  const relPath = attachment.relative_path || attachment.relativePath || "";
  const originalName =
    attachment.original_name ||
    attachment.originalFileName ||
    attachment.original_file_name ||
    "Dosya";

  if (!relPath || !validateRelativePath(relPath)) {
    return {
      success: false,
      error: `Geçersiz dosya yolu formatı: "${relPath || 'boş'}".`,
    };
  }

  const exists = await attachmentExists(relPath);
  if (!exists) {
    return {
      success: false,
      error: `Kanıt dosyası yerel Attachment Vault içinde bulunamadı: "${originalName}" [Vault Yolu: ${relPath}]. Lütfen dosyayı soru kartından yeniden içe aktarınız.`,
    };
  }

  try {
    // Platforma özgü mutlak yolu çöz (Windows: backslash, POSIX: forward-slash)
    const absPath = await resolveAttachmentAbsolutePath(relPath);

    // 1. Tauri Runtime: open_attachment_path Rust command + plugin-opener fallback
    if (isTauriRuntime()) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("open_attachment_path", { path: absPath });
        return { success: true };
      } catch (invokeErr: any) {
        // Fallback: @tauri-apps/plugin-opener openPath
        try {
          const { openPath } = await import("@tauri-apps/plugin-opener");
          await openPath(absPath);
          return { success: true };
        } catch (openerErr: any) {
          console.warn("Tauri open_attachment_path hatası:", invokeErr, openerErr);
          return {
            success: false,
            error: `Dosya açılamadı: ${invokeErr?.message || invokeErr}`,
          };
        }
      }
    }

    // 2. Web / Blob Fallback (geliştirme ortamı / test)
    const buffer = await readAttachmentFile(relPath);
    if (buffer) {
      if (
        typeof window !== "undefined" &&
        typeof document !== "undefined" &&
        typeof URL !== "undefined" &&
        typeof URL.createObjectURL === "function"
      ) {
        const blob = new Blob([buffer as unknown as BlobPart]);
        const blobUrl = URL.createObjectURL(blob);
        const tempLink = document.createElement("a");
        tempLink.href = blobUrl;
        tempLink.download = originalName;
        tempLink.target = "_blank";
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
      }
      return { success: true };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: `Dosya açılırken bir sorun oluştu: "${originalName}". ${err?.message || err}`,
    };
  }
}
