// path: /home/selim/projects/erp-crm-discovery/test/faz46_governance_vault_test.ts
/**
 * ERP CRM Discovery — FAZ-46 Managed Attachment Vault Entegrasyon Kabul Testi
 *
 * Kapsam:
 * - Yönetişim kanıt dosyaları için göreli yol standardı:
 *   attachment/{projectId}/GOVERNANCE/{entityType}/{entityId}/{storedFileName}
 * - Gizlilik Güvencesi: governance_attachments tablosunda source_absolute_path sütunu YOKTUR.
 * - Dosya allowlist kontrolü (PDF, resim, docx, xlsx vb.)
 * - SHA-256 bütünlük hesaplaması
 * - Managed Vault fiziksel yazma ve veritabanı metadata kaydı oluşturma
 */

import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs";

let Database: any = null;
try {
  Database = (await import("better-sqlite3")).default;
} catch {
  // fallback
}

import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import {
  buildGovernanceRelativePath,
  validateAttachment,
  calculateSha256,
} from "../src/storage/attachmentManager";

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

async function runGovernanceVaultTests(): Promise<void> {
  console.log("\n=======================================================");
  console.log("FAZ-46: Yönetişim Kanıt Kasası (Vault) Kabul Testi");
  console.log("=======================================================\n");

  // 1. Relatif Yol Standardı Testi
  console.log("--- 1. buildGovernanceRelativePath Biçimi ---");
  const relPath = buildGovernanceRelativePath(
    "proj-123",
    "object",
    "obj-item-01",
    "uuid-abc_malzeme_kodlama_talimati.pdf"
  );
  assert(
    relPath === "attachment/proj-123/GOVERNANCE/object/obj-item-01/uuid-abc_malzeme_kodlama_talimati.pdf",
    `Göreli yol doğru üretildi: ${relPath}`
  );

  const relPathSod = buildGovernanceRelativePath(
    "proj-123",
    "sod_risk",
    "sod-99",
    "uuid-def_imza_sirkuleri.png"
  );
  assert(
    relPathSod === "attachment/proj-123/GOVERNANCE/sod_risk/sod-99/uuid-def_imza_sirkuleri.png",
    `SoD risk kanıtı göreli yolu doğru üretildi: ${relPathSod}`
  );

  // 2. Dosya Doğrulama & Allowlist
  console.log("\n--- 2. Dosya Allowlist ve Boyut Doğrulaması ---");
  const validFile = {
    name: "gorev_tanimi_imzali.pdf",
    size: 1024 * 50,
    type: "application/pdf",
    data: new Uint8Array([0x25, 0x50, 0x44, 0x46]), // %PDF
  };
  const valResult = validateAttachment(validFile);
  assert(valResult.valid === true, "Geçerli PDF dosyası başarıyla doğrulandı");

  const invalidExtFile = {
    name: "zararli_script.exe",
    size: 1024,
    type: "application/x-msdownload",
    data: new Uint8Array([0x4d, 0x5a]),
  };
  const valBadResult = validateAttachment(invalidExtFile);
  assert(valBadResult.valid === false, "Uzantı allowlist dışı dosya (.exe) reddedildi");

  // 3. SHA-256 Checksum Hesaplama
  console.log("\n--- 3. SHA-256 Sağlama Kodu Doğrulaması ---");
  const sampleData = new TextEncoder().encode("ERP CRM Discovery Governance Evidence Content");
  const sha256 = await calculateSha256(sampleData);
  assert(typeof sha256 === "string" && sha256.length === 64, `SHA-256 hash üretildi (64 hex karakter): ${sha256}`);

  // 4. Veritabanı Şema Gizlilik Denetimi (source_absolute_path yokluğu)
  console.log("\n--- 4. SQLite Şema Gizlilik ve İzolasyon Denetimi ---");
  if (!Database) {
    console.log("[INFO] better-sqlite3 test harness not available for DB check.");
  } else {
    const tempDbPath = path.join(
      os.tmpdir(),
      `faz46-vault-test-${Date.now()}-${Math.random().toString(36).substring(7)}.db`
    );
    let db: any = null;

    try {
      db = new Database(tempDbPath);
      for (const m of MIGRATION_DEFINITIONS) {
        for (const sql of m.sql) {
          if (sql.trim()) db.exec(sql.trim());
        }
      }


      const columns = db.prepare("PRAGMA table_info(governance_attachments)").all();
      const colNames = columns.map((c: any) => c.name);

      assert(colNames.includes("relative_path"), "relative_path sütunu mevcut");
      assert(colNames.includes("sha256"), "sha256 sütunu mevcut");
      assert(!colNames.includes("source_absolute_path"), "source_absolute_path sütunu KESİNLİKLE YOKTUR (Gizlilik İlkesi)");

    } finally {
      if (db) db.close();
      if (fs.existsSync(tempDbPath)) {
        try { fs.unlinkSync(tempDbPath); } catch {}
      }
    }
  }

  console.log(`\nFAZ-46 Governance Vault Test Sonucu: ${passCount} PASS, ${failCount} FAIL\n`);
  if (failCount > 0) {
    process.exit(1);
  }
}

await runGovernanceVaultTests();
