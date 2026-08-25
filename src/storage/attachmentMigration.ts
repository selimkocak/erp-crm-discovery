/**
 * ERP CRM Discovery — Managed Attachment Vault Migration & Reconciliation
 *
 * FAZ-42 HOTFIX: Managed Attachment Vault and Windows Path Standardization
 *
 * Sorumluluklar:
 * 1. DB'deki legacy `projects/{projectId}/attachments/...` formatındaki kayıtları
 *    yeni kanonik `attachment/{projectId}/{businessFunctionCode}/{questionId}/{storedFileName}` formatına dönüştürür.
 * 2. Eski fiziksel kasada dosya varsa, SHA-256 bütünlüğünü doğrulayarak yeni managed attachment köküne taşır/kopyalar.
 * 3. Yeni fiziksel dosya doğrulanmadan DB relative_path değerini güncellemez.
 * 4. Asla kullanıcının kaynak dosyasını silmez.
 * 5. Eksik dosyaları hata fırlatmadan güvenle raporlar.
 */

import Database from "@tauri-apps/plugin-sql";
import {
  readAttachmentFile,
  saveAttachmentFile,
  calculateSha256,
  ensureManagedAttachmentVaultRoot,
} from "./attachmentManager";
import { attachmentExists } from "./attachmentLinks";

export interface MigrationReport {
  totalScanned: number;
  migratedCount: number;
  alreadyCanonicalCount: number;
  missingFilesCount: number;
  errors: string[];
}

export async function reconcileAndMigrateLegacyAttachments(
  db: Database
): Promise<MigrationReport> {
  const report: MigrationReport = {
    totalScanned: 0,
    migratedCount: 0,
    alreadyCanonicalCount: 0,
    missingFilesCount: 0,
    errors: [],
  };

  try {
    // 1. Vault kök dizininin açılışta mevcut olmasını garantiye al
    await ensureManagedAttachmentVaultRoot();

    // 2. DB'deki kayıtları sorgula
    const rows = await db.select<
      Array<{
        id: string;
        analysis_project_id: string;
        business_function_code: string;
        question_id: string;
        stored_file_name: string;
        relative_path: string;
        sha256: string;
      }>
    >(
      "SELECT id, analysis_project_id, business_function_code, question_id, stored_file_name, relative_path, sha256 FROM question_attachments"
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return report;
    }

    report.totalScanned = rows.length;

    for (const row of rows) {
      const oldRelPath = (row.relative_path || "").trim();
      const canonicalRelPath = `attachment/${row.analysis_project_id}/${row.business_function_code}/${row.question_id}/${row.stored_file_name}`;

      // Zaten yeni standartta ise (attachment/ ile başlıyorsa)
      if (oldRelPath.startsWith("attachment/")) {
        report.alreadyCanonicalCount++;
        continue;
      }

      // Legacy projects/ formatında veya absolute path veya boş/bozuk relative_path ise
      try {
        // Yeni kanonik konumda dosya zaten var mı?
        let verified = await attachmentExists(canonicalRelPath);

        if (!verified) {
          let sourceData: Uint8Array | null = null;

          // 1. Eski projects/ yolundan okumayı dene
          if (oldRelPath.startsWith("projects/")) {
            sourceData = await readAttachmentFile(oldRelPath);
          }

          // 2. Absolute path ise Tauri backend üzerinden okumayı dene
          if (!sourceData && (oldRelPath.startsWith("/") || /^[a-zA-Z]:/.test(oldRelPath))) {
            try {
              const { invoke } = await import("@tauri-apps/api/core");
              const bytes = await invoke<number[]>("read_file_binary", { path: oldRelPath });
              if (bytes && bytes.length > 0) {
                sourceData = new Uint8Array(bytes);
              }
            } catch {
              // Devam et
            }
          }

          if (sourceData && sourceData.byteLength > 0) {
            // SHA-256 bütünlüğü kontrol et
            const computedSha = await calculateSha256(sourceData);
            if (!row.sha256 || computedSha.toLowerCase() === row.sha256.toLowerCase()) {
              // Yeni kanonik konuma yaz
              await saveAttachmentFile(canonicalRelPath, sourceData);
              verified = await attachmentExists(canonicalRelPath);
            } else {
              console.warn(
                `[Vault Migration] SHA-256 uyumsuzluğu: ${row.id} (${row.stored_file_name})`
              );
            }
          } else {
            report.missingFilesCount++;
            console.warn(
              `[Vault Migration] Fiziksel dosya bulunamadı: ${oldRelPath || row.stored_file_name}`
            );
          }
        }

        // Yeni konumda dosya varlığı doğrulandıysa DB kaydını güncelle
        if (verified) {
          const now = new Date().toISOString();
          await db.execute(
            "UPDATE question_attachments SET relative_path = $1, source_absolute_path = NULL, updated_at = $2 WHERE id = $3",
            [canonicalRelPath, now, row.id]
          );
          report.migratedCount++;
        }
      } catch (err: any) {
        const errMsg = `Ek ${row.id} (${row.stored_file_name}) taşınamadı: ${err?.message || err}`;
        report.errors.push(errMsg);
        console.error(`[Vault Migration Error] ${errMsg}`);
      }
    }
  } catch (err: any) {
    report.errors.push(`Genel migrasyon hatası: ${err?.message || err}`);
  }

  return report;
}
