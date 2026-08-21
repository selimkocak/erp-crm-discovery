/**
 * ERP CRM Discovery — Windows Attachment Hyperlink Test
 *
 * HOTFIX: Windows 11 file:/// üçlü-slash ve relative path çözümleme doğrulama testleri
 *
 * Test Coverage:
 * T01: Windows path → file:/// RFC-8089 dönüşümü (C:\... → file:///C:/...)
 * T02: macOS/Linux path → file:/// dönüşümü
 * T03: Boşluklu dosya adı encoding
 * T04: Türkçe karakterli dosya adı encoding
 * T05: Nested attachment path
 * T06: Path traversal reddi
 * T07: Olmayan dosya için güvenli hata
 * T08: Windows managed vault yolu doğrulama
 * T09: macOS path davranışının bozulmaması
 * T10: Sürücü harfi büyük/küçük harf toleransı
 * T11: file:// ile başlayan input temizleme
 * T12: file:/// ile başlayan input temizleme (idempotans)
 * T13: Boş/null path güvenli fallback
 */

import { attachmentPathToFileUrl, resolveAttachmentAbsolutePath } from "../src/storage/attachmentLinks";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

function assertEqual(actual: string, expected: string, label: string): void {
  if (actual === expected) {
    console.log(`  ✓ ${label}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${label}`);
    console.error(`    Expected: ${expected}`);
    console.error(`    Actual:   ${actual}`);
    failCount++;
  }
}

console.log("══════════════════════════════════════════════════════");
console.log("WINDOWS ATTACHMENT HYPERLINK HOTFIX TEST");
console.log("══════════════════════════════════════════════════════\n");

// ─── T01: Windows Path → file:/// (3 slash) ─────────────────────────────────
console.log("=== T01: Windows C:\\... → file:///C:/... (RFC-8089 üçlü-slash) ===");

const winPath1 = "C:\\Users\\selim\\AppData\\Local\\com.erpcrm.discovery\\projects\\1\\attachments\\SALES\\S-001\\abc_dosya.txt";
const winUrl1 = attachmentPathToFileUrl(winPath1);
assertEqual(
  winUrl1,
  "file:///C:/Users/selim/AppData/Local/com.erpcrm.discovery/projects/1/attachments/SALES/S-001/abc_dosya.txt",
  "Windows backslash path → file:///C:/... (3 slash)"
);
assert(!winUrl1.startsWith("file://C"), "file://C (2 slash) üretilmedi — RFC-8089 ihlali önlendi");
assert(winUrl1.startsWith("file:///C"), "file:///C (3 slash) ile başlıyor");

// ─── T02: macOS/Linux Path → file:/// ────────────────────────────────────────
console.log("\n=== T02: macOS/Linux path → file:/// ===");

const macPath = "/Users/selim/Library/Application Support/com.erpcrm.discovery/projects/1/attachments/SALES/S-001/dosya.pdf";
const macUrl = attachmentPathToFileUrl(macPath);
assertEqual(
  macUrl,
  "file:///Users/selim/Library/Application%20Support/com.erpcrm.discovery/projects/1/attachments/SALES/S-001/dosya.pdf",
  "macOS path → file:/// (boşluk encode edildi)"
);
assert(macUrl.startsWith("file:///"), "macOS URL file:/// ile başlıyor");

// ─── T03: Boşluklu Dosya Adı ─────────────────────────────────────────────────
console.log("\n=== T03: Boşluklu dosya adı encoding ===");

const winWithSpace = "C:\\Users\\selim\\AppData\\Local\\test\\my file with spaces.xlsx";
const urlWithSpace = attachmentPathToFileUrl(winWithSpace);
assert(!urlWithSpace.includes(" "), "URL içinde boşluk karakteri yok");
assert(urlWithSpace.includes("my%20file%20with%20spaces.xlsx"), "Boşluklar %20 encode edildi");

// ─── T04: Türkçe Karakterli Dosya Adı ────────────────────────────────────────
console.log("\n=== T04: Türkçe karakterli dosya adı encoding ===");

const winTurkishPath = "C:\\Users\\selim\\AppData\\Local\\test\\İskonto_Raporu_Şubat.pdf";
const urlTurkish = attachmentPathToFileUrl(winTurkishPath);
assert(!urlTurkish.includes("İ") && !urlTurkish.includes("Ş"), "Türkçe karakterler encode edildi");
assert(urlTurkish.startsWith("file:///C:"), "Sürücü harfi korundu");

// ─── T05: Nested Attachment Path ─────────────────────────────────────────────
console.log("\n=== T05: Nested attachment path ===");

const nestedPath = "C:\\Users\\selim\\AppData\\Local\\erp\\projects\\123\\attachments\\INVOICING\\INV-042\\uuid_rapor.docx";
const nestedUrl = attachmentPathToFileUrl(nestedPath);
assert(nestedUrl.startsWith("file:///C:/"), "Nested path file:///C:/ ile başlıyor");
assert(nestedUrl.includes("projects/123/attachments/INVOICING/INV-042/"), "Nested path segmentleri korundu");
assert(!nestedUrl.includes("\\"), "URL içinde backslash yok");

// ─── T06: Path Traversal Reddi ───────────────────────────────────────────────
console.log("\n=== T06: Path traversal reddi ===");

let traversalThrown = false;
try {
  // "../../../etc/passwd" vault dışına çıkıyor
  await resolveAttachmentAbsolutePath("../../../etc/passwd", "/app/vault");
} catch (e: any) {
  traversalThrown = true;
}
assert(traversalThrown, "Path traversal '../../../etc/passwd' reddedildi (exception fırlatıldı)");

let traversalThrown2 = false;
try {
  await resolveAttachmentAbsolutePath("../../Windows/System32/cmd.exe", "C:/Users/selim/AppData/Local/erp");
} catch (e: any) {
  traversalThrown2 = true;
}
assert(traversalThrown2, "Windows path traversal '../../System32' reddedildi");

// ─── T07: Olmayan Dosya — Güvenli Hata ──────────────────────────────────────
console.log("\n=== T07: Olmayan dosya için güvenli hata ===");
// openAttachment()'daki exists check Tauri olmadan test edilemez ama
// attachmentPathToFileUrl boş path için file:/// döndürmeli
const emptyUrl = attachmentPathToFileUrl("");
assertEqual(emptyUrl, "file:///", "Boş path → file:/// (güvenli fallback)");

// ─── T08: Windows Managed Vault Yolu Doğrulama ───────────────────────────────
console.log("\n=== T08: Windows managed vault yolu formatı ===");

const vaultRoot = "C:\\Users\\selim\\AppData\\Local\\com.erpcrm.discovery";
const relative = "projects/1/attachments/MANAGEMENT/MGT-001/uuid_dosya.txt";

const absPath = await resolveAttachmentAbsolutePath(relative, vaultRoot);
// Windows: backslash döndürür
assert(
  absPath === "C:\\Users\\selim\\AppData\\Local\\com.erpcrm.discovery\\projects\\1\\attachments\\MANAGEMENT\\MGT-001\\uuid_dosya.txt" ||
  absPath === "C:/Users/selim/AppData/Local/com.erpcrm.discovery/projects/1/attachments/MANAGEMENT/MGT-001/uuid_dosya.txt",
  `Windows vault absolute path doğru çözümlendi: ${absPath}`
);

const absUrl = attachmentPathToFileUrl(absPath);
assert(absUrl.startsWith("file:///C:"), "Vault URL file:///C: ile başlıyor");
assert(!absUrl.includes("\\"), "Vault URL içinde backslash yok");

// ─── T09: macOS Path Davranışının Bozulmaması ────────────────────────────────
console.log("\n=== T09: macOS path davranışı bozulmadı ===");

const macVaultRoot = "/Users/selim/Library/Application Support/com.erpcrm.discovery";
const macAbsPath = await resolveAttachmentAbsolutePath(relative, macVaultRoot);
assert(
  macAbsPath.startsWith("/Users/selim/Library/Application Support/com.erpcrm.discovery/"),
  `macOS absolute path doğru: ${macAbsPath}`
);

const macAbsUrl = attachmentPathToFileUrl(macAbsPath);
assert(macAbsUrl.startsWith("file:///"), "macOS URL file:/// ile başlıyor");
assert(macAbsUrl.includes("Application%20Support"), "macOS boşluk encode edildi");

// ─── T10: Sürücü Harfi Büyük/Küçük Harf Toleransı ──────────────────────────
console.log("\n=== T10: Sürücü harfi büyük/küçük harf toleransı ===");

const lowerDrivePath = "c:\\Users\\test\\dosya.txt";
const lowerDriveUrl = attachmentPathToFileUrl(lowerDrivePath);
assert(lowerDriveUrl.startsWith("file:///c:"), "Küçük sürücü harfi korundu (file:///c:)");
assert(!lowerDriveUrl.includes("\\"), "URL içinde backslash yok");

const upperDrivePath = "D:\\Projects\\erp\\rapor.pdf";
const upperDriveUrl = attachmentPathToFileUrl(upperDrivePath);
assert(upperDriveUrl.startsWith("file:///D:"), "D: sürücüsü doğru encode edildi");

// ─── T11: file:// (2 slash) Prefixli Input Temizleme ────────────────────────
console.log("\n=== T11: file:// (2 slash) prefixli input temizleme ===");

const twoSlashInput = "file://C:/Users/selim/test.txt";
const twoSlashUrl = attachmentPathToFileUrl(twoSlashInput);
assert(twoSlashUrl.startsWith("file:///"), "file:// (2 slash) input → file:/// (3 slash) çıktı");
assert(!twoSlashUrl.startsWith("file:////"), "Fazladan slash eklenmedi");

// ─── T12: file:/// (3 slash) Prefixli Input İdempotans ──────────────────────
console.log("\n=== T12: file:/// (3 slash) prefixli input idempotans ===");

const threeSlashInput = "file:///C:/Users/selim/dosya.pdf";
const threeSlashUrl = attachmentPathToFileUrl(threeSlashInput);
assert(threeSlashUrl.startsWith("file:///C:"), "file:/// input → file:///C: (idempotans)");
assert(!threeSlashUrl.startsWith("file:////"), "Çift prefix eklenmedi");

// ─── T13: null/undefined — Güvenli Fallback ──────────────────────────────────
console.log("\n=== T13: null/undefined — güvenli fallback ===");

const nullUrl = attachmentPathToFileUrl(null as any);
assertEqual(nullUrl, "file:///", "null path → file:/// (güvenli fallback)");

const undefinedUrl = attachmentPathToFileUrl(undefined as any);
assertEqual(undefinedUrl, "file:///", "undefined path → file:/// (güvenli fallback)");

// ─── SONUÇ ──────────────────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════════════════");
console.log(`WINDOWS ATTACHMENT HYPERLINK TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
console.log("══════════════════════════════════════════════════════\n");

if (failCount > 0) {
  console.error(`BAŞARISIZ: ${failCount} test başarısız oldu.`);
  process.exit(1);
} else {
  console.log("✅ KABUL: Tüm testler geçti — Windows attachment hyperlink hotfix doğrulandı.");
  process.exit(0);
}
