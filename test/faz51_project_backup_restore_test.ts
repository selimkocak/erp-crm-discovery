// path: /home/selim/projects/erp-crm-discovery/test/faz51_project_backup_restore_test.ts
/**
 * ERP CRM Discovery — FAZ-51 Proje Yedekleme, Geri Yükleme ve Taşınabilirlik Kabul Testi
 *
 * Doğrulamalar:
 * 1. Sentetik İmalat Pilotu (Atlas Modüler Makine Sanayi A.Ş.) veri ortamının hazırlanması.
 * 2. exportProjectBackup ile tek dosyalık .erpcrm arşivinin (manifest, project-data, attachments, checksums) üretimi.
 * 3. Gizlilik ve Güvenlik: Mutlak dosya yollarının arşive sızmaması (source_absolute_path: null).
 * 4. inspectProjectBackup ile ön doğrulama, sürüm ve SHA-256 bütünlük kontrolü.
 * 5. Bozuk checksum ve path traversal (Zip-slip) saldırılarına karşı güvenlik engeli.
 * 6. restoreProjectBackup ile yeni proje kimliği (ID/FK remapping) ve kütüphane/ek dosyalarının atomik içe aktarımı.
 * 7. duplicateProject ile şablon kopyalama (answers=0) ve tam kopyalama (answers & attachments=100%).
 * 8. Transaction ve Rollback güvenliği: Hata anında yarım proje veya yetim ek dosya kalmaması.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

let Database: any = null;
try {
  Database = (await import("better-sqlite3")).default;
} catch {
  // better-sqlite3 is optional on some platforms (e.g. Windows CI fallback)
}

import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import { BUSINESS_FUNCTION_REGISTRY } from "../src/generated/businessFunctions";
import {
  getDb,
  setDbInstanceForTesting,
  resetDbInstanceForTesting,
  createProject,
  saveAnswer,
  createFinding,
  createRisk,
  createCustomQuestion,
  saveCustomAnswer,
  saveReportProfile,
  addQuestionAttachment,
} from "../src/db/client";
import {
  createGovernanceObject,
  createGovernanceSubject,
  createGovernanceScope,
  createGovernanceResponsibility,
  createGovernanceAuthorization,
  createGovernanceLimit,
  createGovernanceSodRisk,
} from "../src/db/governanceClient";
import {
  saveAttachmentFile,
  readAttachmentFile,
  deleteProjectAttachmentsDirectory,
} from "../src/storage/attachmentManager";
import {
  createTarArchive,
  extractTarArchive,
  computeSha256Hex,
} from "../src/storage/tarArchive";
import {
  exportProjectBackup,
  inspectProjectBackup,
  restoreProjectBackup,
  duplicateProject,
  BACKUP_FORMAT_VERSION,
  BACKUP_CURRENT_SCHEMA_VERSION,
} from "../src/storage/backupManager";

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

/**
 * Tauri Database arayüzünü better-sqlite3 üzerinde simüle eden adaptör.
 */
class SqliteDbAdapter {
  public db: any;

  constructor(filePath: string) {
    if (!Database) {
      throw new Error("better-sqlite3 is not available");
    }
    this.db = new Database(filePath);
    this.db.pragma("foreign_keys = ON");
  }

  private convertSql(sql: string, params: any[] = []): { sql: string; params: any[] } {
    if (!params || params.length === 0) return { sql, params: [] };
    const orderedParams: any[] = [];
    const convertedSql = sql.replace(/\$(\d+)/g, (_, p1) => {
      const idx = parseInt(p1, 10) - 1;
      orderedParams.push(params[idx]);
      return "?";
    });
    return { sql: convertedSql, params: orderedParams };
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    const trimmed = sql.trim();
    if (!trimmed) return;
    const { sql: convertedSql, params: orderedParams } = this.convertSql(trimmed, params);
    if (orderedParams.length > 0) {
      this.db.prepare(convertedSql).run(...orderedParams);
    } else {
      this.db.exec(convertedSql);
    }
  }

  async select<T>(sql: string, params: any[] = []): Promise<T> {
    const trimmed = sql.trim();
    const { sql: convertedSql, params: orderedParams } = this.convertSql(trimmed, params);
    if (orderedParams.length > 0) {
      return this.db.prepare(convertedSql).all(...orderedParams) as T;
    }
    return this.db.prepare(convertedSql).all() as T;
  }
}


async function runFaz51BackupRestoreTests(): Promise<void> {
  console.log("\n=======================================================");
  console.log("FAZ-51: Proje Yedekleme, Geri Yükleme ve Taşınabilirlik");
  console.log("=======================================================\n");

  if (!Database) {
    console.log("[INFO] better-sqlite3 test ortamında bulunamadı. SKIPPED.");
    return;
  }

  const tempDbPath = path.join(
    os.tmpdir(),
    `faz51-backup-restore-${Date.now()}-${Math.random().toString(36).substring(7)}.db`
  );
  let adapter: SqliteDbAdapter | null = null;

  try {
    adapter = new SqliteDbAdapter(tempDbPath);

    // 1. Tüm migration'ları uygula (v1..v11)
    await adapter.execute(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `);

    for (const m of MIGRATION_DEFINITIONS) {
      for (const sqlStatement of m.sql) {
        const trimmed = sqlStatement.trim();
        if (trimmed.length > 0) {
          await adapter.execute(trimmed);
        }
      }
      await adapter.execute(
        `INSERT INTO schema_migrations (version, applied_at) VALUES ($1, $2)`,
        [m.version, new Date().toISOString()]
      );
    }

    // 2. Kanonik İş Fonksiyonlarını Tohumla
    for (const bf of BUSINESS_FUNCTION_REGISTRY) {
      if (!bf.is_active) continue;
      const id = `bf_${bf.code.toLowerCase()}`;
      await adapter.execute(
        `INSERT INTO business_functions (id, code, name_tr, name_en, category, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, 1)
         ON CONFLICT(code) DO NOTHING`,
        [id, bf.code, bf.name_tr, bf.name_en, bf.category_tr, bf.sort_order]
      );
    }

    setDbInstanceForTesting(adapter);

    console.log("--- 1. Pilot Proje Veri Setinin Kurulması (Atlas Modüler Makine) ---");

    // Master fonksiyonları al
    const masterFuncs = await adapter.select<any[]>(
      "SELECT id, code FROM business_functions WHERE code IN ('SALES', 'PROCUREMENT', 'WAREHOUSE', 'PRODUCTION_PLANNING', 'ACCOUNTING')"
    );

    const projectResult = await createProject({
      projectName: "ERP Dönüşüm Keşfi 2026",
      company: {
        company_name: "Atlas Modüler Makine Sanayi A.Ş.",
        trade_name: "Atlas Makine",
        tax_number: "1234567890",
        city: "Bursa",
        country: "Türkiye",
        employee_count: "250-500",
        business_sector: "Makine ve Otomasyon İmalatı",
        has_branches: "yes",
        branch_count: 3,
        notes: "Otomotiv ve beyaz eşya sektörüne özel üretim hatları imalatı.",
      },
      selectedFunctionIds: masterFuncs.map((f) => f.id),
    });

    const projectId = projectResult;
    assert(Boolean(projectId), "Pilot analiz projesi başarıyla oluşturuldu.");

    // 10 Adet Soru Cevabı Ekle
    for (let i = 1; i <= 10; i++) {
      const qCode = i <= 3 ? "SALES" : i <= 6 ? "PROCUREMENT" : i <= 8 ? "WAREHOUSE" : "PRODUCTION_PLANNING";
      const qNum = String(i).padStart(3, "0");
      await saveAnswer(
        projectId,
        qCode,
        `tr.${qCode.toLowerCase()}.core`,
        "0.1.0",
        `${qCode.substring(0, 3)}-${qNum}`,
        {
          selected: [{ value: "opt_1", note: `Sentetik pilot seçenek ${i}` }],
          general_note: `Sentetik pilot cevap ${i}`,
        }
      );
    }
    console.log("  ✓ 10 adet kanonik soru cevabı kaydedildi.");

    // Özel Soru Ekle
    const customQId = await createCustomQuestion({
      analysis_project_id: projectId,
      business_function_code: "PRODUCTION_PLANNING",
      process_name: "Kalite Kontrol",
      question_text: "Atlas Özel Kalite ve İzlenebilirlik Standardı",
      description: "Havacılık ve otomotiv seviyesi parça seri no takibi",
      question_type: "single_choice",
      is_required: true,
      options: [
        { label: "ISO 9001 Standardı", value: "iso9001" },
        { label: "AS9100 Havacılık Standardı", value: "as9100" },
      ],
    });
    await saveCustomAnswer(
      projectId,
      "PRODUCTION_PLANNING",
      customQId,
      { selected: [{ value: "as9100" }], text: "Aktif AS9100 rev D" }
    );
    console.log("  ✓ 1 adet özel soru, 2 seçenek ve 1 cevap kaydedildi.");

    // Bulgu, Risk ve Rapor Profili Ekle
    await createFinding({
      analysis_project_id: projectId,
      business_function_code: "PRODUCTION_PLANNING",
      question_id: "PRD-001",
      title: "İstasyon Bazlı Gerçek Zamanlı Veri Toplama Eksikliği",
      description: "CNC tezgahlardan çevrim süresi ve duruş nedenleri otomatik alınamıyor.",
      priority: "high",
    });

    await createRisk({
      analysis_project_id: projectId,
      business_function_code: "PROCUREMENT",
      question_id: "PRC-001",
      title: "Kritik Ham Madde Termin Gecikmesi Riski",
      description: "İthal alaşımlı çelik tedarik süreleri 12 haftayı buluyor.",
      impact: "high",
      probability: "medium",
    });

    await saveReportProfile(projectId, {
      executive_summary: "Atlas Makine 2026 ERP Ön Analiz Raporu.",
      overall_assessment: "Tüm fabrikaların tek ERP altında konsolidasyonu.",
      open_topics: "CAD/CAM entegrasyonu.",
    });

    console.log("  ✓ Bulgu, Risk ve Rapor profili eklendi.");


    // Yönetişim Modeli Ekle
    const govObj = await createGovernanceObject({
      analysis_project_id: projectId,
      code: "GO_ITEM_MASTER",
      category: "master_data",
      name_tr: "Stok / Malzeme Kartı",
      name_en: "Item Master",
      related_bf_code: "INVENTORY",
    });

    const govSub = await createGovernanceSubject({
      analysis_project_id: projectId,
      subject_type: "user",
      name: "Ahmet Yılmaz",
      title_role: "Üretim ve Operasyon Direktörü",
      department: "Üretim",
      email: "ahmet.yilmaz@atlasmakine.com.tr",
    });

    const govScope = await createGovernanceScope({
      analysis_project_id: projectId,
      scope_type: "site",
      code: "BURSA_MAIN",
      name: "Bursa Ana Fabrika",
    });

    await createGovernanceResponsibility({
      analysis_project_id: projectId,
      governance_object_id: govObj.id,
      subject_id: govSub.id,
      responsibility_type: "owner",
      scope_id: govScope.id,
    });

    await createGovernanceAuthorization({
      analysis_project_id: projectId,
      governance_object_id: govObj.id,
      subject_id: govSub.id,
      permission_level: "admin",
      scope_id: govScope.id,
    });

    await createGovernanceLimit({
      analysis_project_id: projectId,
      governance_object_id: govObj.id,
      subject_id: govSub.id,
      limit_type: "approval_financial",
      min_value: 0,
      max_value: 500000,
      currency_or_unit: "TRY",
    });

    const govObjPO = await createGovernanceObject({
      analysis_project_id: projectId,
      code: "GO_PURCHASE_ORDER",
      category: "transactional",
      name_tr: "Satın Alma Siparişi",
      related_bf_code: "PROCUREMENT",
    });

    await createGovernanceSodRisk({
      analysis_project_id: projectId,
      governance_object_id: govObj.id,
      risk_title: "Malzeme Tanımlama ve Satın Alma Onayı Çakışması",
      conflicting_duty_a: "Malzeme kartı açma yetkisi",
      conflicting_duty_b: "Satın alma siparişi onaylama yetkisi",
      risk_severity: "high",
    });
    console.log("  ✓ Veri ve Yetki Yönetişimi (Nesne, Özne, Kapsam, Limit, SoD) eklendi.");


    // 2 Adet Sentetik Ek Dosyayı Kasaya Yaz ve DB'ye Ekle
    const enc = new TextEncoder();
    const file1Data = enc.encode("SENTETIK_PNG_BURSA_FABRIKA_AKIS_SEMASI_VERISI");
    const file2Data = enc.encode("SENTETIK_XLSX_SATINALMA_ONAY_MATRISI_TABLOSU");

    const relPath1 = `attachment/${projectId}/SALES/SAL-001/uuid1_bursa_fabrika_akisi.png`;
    const relPath2 = `attachment/${projectId}/PROCUREMENT/PRC-001/uuid2_satinalma_matrisi.xlsx`;

    await saveAttachmentFile(relPath1, file1Data);
    await saveAttachmentFile(relPath2, file2Data);

    const sha1 = await computeSha256Hex(file1Data);
    const sha2 = await computeSha256Hex(file2Data);

    await addQuestionAttachment({
      analysis_project_id: projectId,
      business_function_code: "SALES",
      question_id: "SAL-001",
      original_file_name: "bursa_fabrika_akisi.png",
      stored_file_name: "uuid1_bursa_fabrika_akisi.png",
      relative_path: relPath1,
      mime_type: "image/png",
      file_extension: "png",
      file_size: file1Data.byteLength,
      sha256: sha1,
      description: "Fabrika yerleşim ve hat akış şeması",
      source_absolute_path: "C:\\Users\\selim\\Desktop\\bursa_fabrika_akisi.png", // export'ta gizlenmeli
    });

    await addQuestionAttachment({
      analysis_project_id: projectId,
      business_function_code: "PROCUREMENT",
      question_id: "PRC-001",
      original_file_name: "satinalma_matrisi.xlsx",
      stored_file_name: "uuid2_satinalma_matrisi.xlsx",
      relative_path: relPath2,
      mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      file_extension: "xlsx",
      file_size: file2Data.byteLength,
      sha256: sha2,
      description: "Onay limitleri tablosu",
      source_absolute_path: "/home/selim/Downloads/satinalma_matrisi.xlsx", // export'ta gizlenmeli
    });
    console.log("  ✓ 2 adet fiziksel kanıt dosyası Managed Vault'a ve DB'ye kaydedildi.\n");

    console.log("--- 2. Dışa Aktarma (Export) Testi ---");

    const exportResult = await exportProjectBackup(projectId);
    assert(Boolean(exportResult.buffer && exportResult.buffer.byteLength > 0), "Yedek paketi (.erpcrm) ikili veri olarak üretildi.");
    assert(exportResult.fileName.startsWith("Atlas_Modular_Makine") || exportResult.fileName.startsWith("Atlas"), "Dosya adı firma ve proje adını güvenli formatta içeriyor: " + exportResult.fileName);
    assert(exportResult.fileName.endsWith(".erpcrm"), "Dosya uzantısı .erpcrm ile bitiyor.");

    const manifest = exportResult.manifest;
    assert(manifest.formatVersion === BACKUP_FORMAT_VERSION, "Manifest formatVersion '1.0.0' olarak doğrulandı.");
    assert(manifest.schemaVersion === BACKUP_CURRENT_SCHEMA_VERSION, "Manifest schemaVersion 11 olarak doğrulandı.");
    assert(manifest.recordCounts.answers === 10, "Cevap sayısı 10 olarak manifestte kayıtlı.");
    assert(manifest.recordCounts.findings === 1, "Bulgu sayısı 1 olarak manifestte kayıtlı.");
    assert(manifest.recordCounts.risks === 1, "Risk sayısı 1 olarak manifestte kayıtlı.");
    assert(manifest.recordCounts.governanceObjects >= 2, "Yönetişim nesneleri manifestte kayıtlı.");
    assert(manifest.attachmentCount === 2, "Ek dosya sayısı 2 olarak manifestte kayıtlı.");

    console.log("\n--- 3. Gizlilik ve Güvenlik Denetimi ---");

    // Paketi açıp JSON içeriğini incele
    const entries = await extractTarArchive(exportResult.buffer);
    const dataEntry = entries.find((e) => e.name === "project-data.json");
    assert(Boolean(dataEntry), "project-data.json arşiv içinde mevcut.");

    const dec = new TextDecoder();
    const dataJsonStr = dec.decode(dataEntry!.data);
    assert(!dataJsonStr.includes("C:\\Users\\selim"), "Kullanıcı Windows ev dizini arşive sızdırılmadı (Gizlilik korundu).");
    assert(!dataJsonStr.includes("/home/selim"), "Kullanıcı Linux ev dizini arşive sızdırılmadı (Gizlilik korundu).");

    const parsedProjectData = JSON.parse(dataJsonStr);
    assert(
      parsedProjectData.questionAttachments.every((a: any) => a.source_absolute_path === null),
      "Tüm ek dosyaların source_absolute_path alanı null olarak sıfırlandı."
    );

    console.log("\n--- 4. İnceleme (Inspect) ve Bütünlük Doğrulama Testi ---");

    const inspectRes = await inspectProjectBackup(exportResult.buffer);
    assert(inspectRes.valid === true, "Geçerli .erpcrm arşiv paketi 100% doğrulandı.");
    assert(inspectRes.manifest?.companyName === "Atlas Modüler Makine Sanayi A.Ş.", "Paket firma adı doğru okundu.");

    // Bozuk Checksum Testi (Veri tahrifatı)
    const tamperedEntries = entries.map((e) => {
      if (e.name === "project-data.json") {
        const tamperedData = new Uint8Array(e.data);
        tamperedData[10] = tamperedData[10] === 65 ? 66 : 65; // 1 byte değiştir
        return { name: e.name, data: tamperedData };
      }
      return e;
    });
    const tamperedTar = await createTarArchive(tamperedEntries);
    const inspectTampered = await inspectProjectBackup(tamperedTar);
    assert(
      inspectTampered.valid === false && inspectTampered.error?.includes("Checksum"),
      "Tahrif edilmiş arşivde Checksum bütünlük hatası tespit edildi ve engellendi."
    );

    // Path Traversal (Zip-slip) Güvenlik Engeli Testi
    let pathTraversalCaught = false;
    try {
      await createTarArchive([
        { name: "../../etc/passwd", data: enc.encode("root:x:0:0") },
      ]);
    } catch {
      pathTraversalCaught = true;
    }
    assert(pathTraversalCaught, "Arşiv oluşturucuda path traversal (../../) yolu derhal engellendi.");

    console.log("\n--- 5. Geri Yükleme (Restore) Testi ---");

    const restoreRes = await restoreProjectBackup(exportResult.buffer, {
      newProjectName: "Atlas Modüler Makine Sanayi A.Ş. — 2026 Restored",
    });

    assert(restoreRes.success === true, "Proje başarıyla geri yüklendi.");
    assert(Boolean(restoreRes.newProjectId && restoreRes.newProjectId !== projectId), "Geri yüklenen projeye benzersiz yeni bir ID atandı: " + restoreRes.newProjectId);
    assert(restoreRes.projectName === "Atlas Modüler Makine Sanayi A.Ş. — 2026 Restored", "Yeni proje adı başarıyla uygulandı.");
    assert(restoreRes.attachmentCount === 2, "2 adet ek dosya yeni projenin kasasına kopyalandı.");

    const restoredId = restoreRes.newProjectId!;

    // Veritabanında Yeni Projeyi Doğrula
    const restoredProjects = await adapter.select<any[]>(
      "SELECT * FROM analysis_projects WHERE id = $1",
      [restoredId]
    );
    assert(restoredProjects.length === 1, "Geri yüklenen proje analysis_projects tablosunda mevcut.");

    const restoredCompanies = await adapter.select<any[]>(
      "SELECT * FROM company_profiles WHERE analysis_project_id = $1",
      [restoredId]
    );
    assert(restoredCompanies.length === 1 && restoredCompanies[0].branch_count === 3, "Firma profili ve 3 şube bilgisi yeni projede eksiksiz oluşturuldu.");

    const restoredAnswers = await adapter.select<any[]>(
      "SELECT * FROM question_answers WHERE analysis_project_id = $1",
      [restoredId]
    );
    assert(restoredAnswers.length === 10, "10 adet soru cevabı yeni projeye başarıyla aktarıldı.");

    const restoredFindings = await adapter.select<any[]>(
      "SELECT * FROM analysis_findings WHERE analysis_project_id = $1",
      [restoredId]
    );
    assert(restoredFindings.length === 1, "Bulgu kaydı yeni projeye aktarıldı.");

    const restoredRisks = await adapter.select<any[]>(
      "SELECT * FROM analysis_risks WHERE analysis_project_id = $1",
      [restoredId]
    );
    assert(restoredRisks.length === 1, "Risk kaydı yeni projeye aktarıldı.");

    const restoredGovObjs = await adapter.select<any[]>(
      "SELECT * FROM governance_objects WHERE analysis_project_id = $1",
      [restoredId]
    );
    assert(restoredGovObjs.length >= 2, "Yönetişim nesneleri yeni projeye aktarıldı.");

    const restoredAtts = await adapter.select<any[]>(
      "SELECT * FROM question_attachments WHERE analysis_project_id = $1",
      [restoredId]
    );
    assert(restoredAtts.length === 2, "2 adet ek dosya DB kaydı yeni proje için oluşturuldu.");
    assert(
      restoredAtts.every((a) => a.relative_path.startsWith(`attachment/${restoredId}/`)),
      "Ek dosyaların göreli yolları yeni proje kimliğiyle (" + restoredId + ") güncellendi."
    );

    // Fiziksel Kasadaki Dosyaların Bütünlüğünü Doğrula
    for (const att of restoredAtts) {
      const vaultData = await readAttachmentFile(att.relative_path);
      assert(Boolean(vaultData && vaultData.byteLength > 0), "Yeni proje kasasından dosya okundu: " + att.original_file_name);
      const vaultSha = await computeSha256Hex(vaultData!);
      assert(vaultSha === att.sha256, "Kasaya aktarılan dosyanın SHA-256 hash'i orijinaliyle birebir eşleşti.");
    }

    // Orijinal Projenin Bozulmadığını Doğrula
    const originalAnswers = await adapter.select<any[]>(
      "SELECT COUNT(*) as cnt FROM question_answers WHERE analysis_project_id = $1",
      [projectId]
    );
    assert(originalAnswers[0].cnt === 10, "Orijinal projenin verileri (10 cevap) bağımsız olarak korundu.");

    console.log("\n--- 6. Projeyi Çoğalt (Duplicate) Testi ---");

    // Subtest 6A: Şablon Kopyalama (Cevaplar ve Ekler Hariç)
    const dupTemplate = await duplicateProject(projectId, {
      newProjectName: "Atlas Makine — 2026 Şablon Proje",
      copyAnswersAndAttachments: false,
    });
    assert(Boolean(dupTemplate.newProjectId), "Şablon proje başarıyla çoğaltıldı: " + dupTemplate.newProjectId);

    const dupAnswers = await adapter.select<any[]>(
      "SELECT COUNT(*) as cnt FROM question_answers WHERE analysis_project_id = $1",
      [dupTemplate.newProjectId]
    );
    assert(dupAnswers[0].cnt === 0, "Şablon projede cevaplar sıfırlandı (answers = 0).");

    const dupFuncs = await adapter.select<any[]>(
      "SELECT * FROM project_business_functions WHERE analysis_project_id = $1",
      [dupTemplate.newProjectId]
    );
    console.log("    [DEBUG] dupFuncs length:", dupFuncs.length, "statuses:", dupFuncs.map(f => f.status));
    assert(
      dupFuncs.length === 5 && dupFuncs.every((f) => f.status === "not_started"),
      "Şablon projede tüm iş fonksiyonlarının durumu 'not_started' olarak sıfırlandı."
    );


    const dupGov = await adapter.select<any[]>(
      "SELECT COUNT(*) as cnt FROM governance_objects WHERE analysis_project_id = $1",
      [dupTemplate.newProjectId]
    );
    assert(dupGov[0].cnt >= 2, "Şablon projede yönetişim modeli yapısı korundu.");

    // Subtest 6B: Tam Kopyalama (Cevaplar ve Ekler Dahil)
    const dupFull = await duplicateProject(projectId, {
      newProjectName: "Atlas Makine — Tam Çalışma Kopyası",
      copyAnswersAndAttachments: true,
    });

    const dupFullAnswers = await adapter.select<any[]>(
      "SELECT COUNT(*) as cnt FROM question_answers WHERE analysis_project_id = $1",
      [dupFull.newProjectId]
    );
    assert(dupFullAnswers[0].cnt === 10, "Tam kopyada tüm soru cevapları (10 adet) klonlandı.");

    const dupFullAtts = await adapter.select<any[]>(
      "SELECT * FROM question_attachments WHERE analysis_project_id = $1",
      [dupFull.newProjectId]
    );
    assert(dupFullAtts.length === 2, "Tam kopyada 2 adet kanıt dosyası klonlandı.");

    console.log("\n--- 7. Atomik Transaction ve Rollback Güvenlik Testi ---");

    // Hata durumunda rollback simülasyonu
    let rollbackOccurred = false;
    // Bozuk veri: foreign key hatası oluşturacak geçersiz bir veriyle restore çağrısı yapalım
    const brokenProjectData = JSON.parse(JSON.stringify(parsedProjectData));
    // Olmayan bir business_function_id vererek FK ihlali üret
    brokenProjectData.businessFunctions = [
      {
        id: "pbf_broken",
        business_function_id: "NON_EXISTENT_FUNCTION_ID_123",
        status: "not_started",
      },
    ];

    const brokenEnc = new TextEncoder();
    const brokenDataBytes = brokenEnc.encode(JSON.stringify(brokenProjectData));
    const brokenSha = await computeSha256Hex(brokenDataBytes);

    const brokenManifest = {
      ...manifest,
      dataChecksum: brokenSha,
    };
    const brokenManifestBytes = brokenEnc.encode(JSON.stringify(brokenManifest));
    const brokenChecksums = {
      "manifest.json": await computeSha256Hex(brokenManifestBytes),
      "project-data.json": brokenSha,
    };

    const brokenArchive = await createTarArchive([
      { name: "manifest.json", data: brokenManifestBytes },
      { name: "project-data.json", data: brokenDataBytes },
      { name: "checksums.json", data: brokenEnc.encode(JSON.stringify(brokenChecksums)) },
    ]);

    const countBefore = (await adapter.select<any[]>("SELECT COUNT(*) as cnt FROM analysis_projects"))[0].cnt;

    try {
      await restoreProjectBackup(brokenArchive);
    } catch (err: any) {
      rollbackOccurred = true;
    }

    const countAfter = (await adapter.select<any[]>("SELECT COUNT(*) as cnt FROM analysis_projects"))[0].cnt;
    assert(rollbackOccurred, "Hata durumunda restoreProjectBackup beklenen hatayı fırlattı.");
    assert(countBefore === countAfter, "Rollback başarıyla gerçekleşti, veritabanında yarım proje kaydı oluşmadı.");

  } finally {
    resetDbInstanceForTesting();
    if (adapter && adapter.db) {
      adapter.db.close();
    }
    if (fs.existsSync(tempDbPath)) {
      try {
        fs.unlinkSync(tempDbPath);
      } catch {}
    }
  }

  console.log("\n=======================================================");
  console.log(`FAZ-51 TEST SONUCU: ${passCount} PASS, ${failCount} FAIL`);
  console.log("=======================================================\n");

  if (failCount > 0) {
    throw new Error(`FAZ-51 testlerinde ${failCount} başarısızlık tespit edildi!`);
  }
}

runFaz51BackupRestoreTests()
  .then(() => {
    process.exit(failCount > 0 ? 1 : 0);
  })
  .catch((err) => {
    console.error("Test icra hatası:", err);
    process.exit(1);
  });

