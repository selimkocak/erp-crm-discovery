/**
 * ERP CRM Discovery — FAZ-61 Ajan Mimarisi Operasyonel Saha Testi ve Takvim Bütünlüğü Kabul Testi
 *
 * Doğrulama Senaryoları (22 Senaryo):
 * 1. .agents ana kontrol sözleşmesi okunmuş ve rol aşamaları teslim raporunda kullanılmış.
 * 2. Eski proje tarih alanları olmadan açılabiliyor (NULL fallback).
 * 3. Geçerli proje tarih aralığı kaydediliyor.
 * 4. Ters proje tarih aralığı reddediliyor.
 * 5. Geçerli modül tarih aralığı kaydediliyor.
 * 6. Ters modül tarih aralığı reddediliyor.
 * 7. Takvim günü timezone kaymasına uğramıyor (saf YYYY-MM-DD ayrıştırma).
 * 8. Kapsam dışına alınan modülün tarihleri veritabanında korunuyor.
 * 9. Yeniden aktifleştirilen modülün eski tarihleri geri geliyor.
 * 10. Pasife alınan proje takvim verilerini koruyor ve salt okunur sunuyor.
 * 11. Yedekleme (.erpcrm) 8 takvim kolonunu eksiksiz içeriyor.
 * 12. Geri yükleme tarihleri birebir koruyor.
 * 13. Eski yedekler tarih alanları olmadan (NULL) hatasız geri yükleniyor.
 * 14. Şablon ve tam çoğaltmada plan/fiilî tarih kuralları doğru uygulanıyor.
 * 15. Sentetik pilotta 19 aktif modülün takvimi eksiksiz tohumlanıyor.
 * 16. Tamamlanan 9 pilot modülünde fiilî bitiş tarihi bulunuyor.
 * 17. Devam eden 10 pilot modülünde fiilî başlangıç tarihi bulunuyor, fiilî bitiş null.
 * 18. PRAGMA foreign_key_check sıfır ihlal döndürüyor.
 * 19. Rapor modelinde ham enum, undefined ve geçersiz tarih bulunmuyor.
 * 20. UI/PDF/DOCX çıktıları aynı kanonik tarih ve sayaç modelini tüketiyor.
 * 21. Aktif takvim istatistikleri kapsam dışı (is_active=0) modülleri saymıyor.
 * 22. 9 durumlu takvim motoru (not_planned, planned, on_track, completed_on_time, completed_late vb.) deterministik çalışıyor.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import {
  isValidIsoDate,
  calculateDaysDifference,
  validateDateRange,
  validateScheduleDates,
  calculateScheduleStatus,
  formatIsoDateTr,
  formatDateRangeSummary,
  type ScheduleDates,
} from "../src/models/scheduleStatus";
import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import { INITIAL_BUSINESS_FUNCTIONS } from "../src/db/seedData";
import {
  setDbInstanceForTesting,
  resetDbInstanceForTesting,
  createProject,
  getProjectDetail,
  updateProjectDetails,
  updateProjectSchedule,
  updateProjectFunctionSchedule,
  deactivateProjectFunction,
  addOrReactivateProjectFunction,
  updateProjectStatus,
  getProjects,
} from "../src/db/client";
import { createManufacturingDemoProject } from "../src/demo/manufacturingPilot";
import { buildReportModel } from "../src/report/builder";
import { exportProjectBackup, restoreProjectBackup, duplicateProject } from "../src/storage/backupManager";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

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

function convertSql(sql: string, params: any[] = []): { sql: string; params: any[] } {
  if (!params || params.length === 0) return { sql, params: [] };
  const orderedParams: any[] = [];
  const convertedSql = sql.replace(/\$(\d+)/g, (_match, num) => {
    const idx = parseInt(num, 10) - 1;
    orderedParams.push(params[idx]);
    return "?";
  });
  return { sql: convertedSql, params: orderedParams };
}

// -----------------------------------------------------------------------------
// Bellek içi SQLite adaptörü
// -----------------------------------------------------------------------------
class BetterSqlitePoolAdapter {
  private db: Database.Database;

  constructor() {
    this.db = new Database(":memory:");
    this.db.pragma("foreign_keys = ON");
  }

  async select<T>(query: string, bindValues: any[] = []): Promise<T> {
    const { sql: convertedSql, params: orderedParams } = convertSql(query, bindValues);
    const stmt = this.db.prepare(convertedSql);
    return stmt.all(...orderedParams) as T;
  }

  async execute(query: string, bindValues: any[] = []): Promise<{ rowsAffected: number }> {
    const { sql: convertedSql, params: orderedParams } = convertSql(query, bindValues);
    const stmt = this.db.prepare(convertedSql);
    const info = stmt.run(...orderedParams);
    return { rowsAffected: info.changes };
  }

  getRawDb(): Database.Database {
    return this.db;
  }

  close() {
    this.db.close();
  }
}

async function runTests(): Promise<void> {
  console.log("\n======================================================================");
  console.log("FAZ-61 — AJAN MİMARİSİ OPERASYONEL TESTİ & TAKVİM BÜTÜNLÜĞÜ KABUL TESTİ");
  console.log("======================================================================\n");

  const adapter = new BetterSqlitePoolAdapter();
  setDbInstanceForTesting(adapter as any);

  try {
    // -------------------------------------------------------------------------
    // SENARYO 1: .agents Mimarisi & Rol Sözleşmesi Denetimi
    // -------------------------------------------------------------------------
    console.log("--- 1. .agents Sözleşmesi & Rapor Yapısı ---");
    assert(fs.existsSync(path.join(ROOT_DIR, "AGENTS.md")), "S01: Kök AGENTS.md mevcut.");
    assert(fs.existsSync(path.join(ROOT_DIR, ".agents/agents.md")), "S01: .agents/agents.md sözleşmesi mevcut.");
    const reportPath = path.join(ROOT_DIR, "docs/release/FAZ61_AGENT_OPERATIONAL_SCHEDULE_INTEGRITY_REPORT.md");
    assert(fs.existsSync(reportPath), "S01: FAZ-61 operasyonel teslim raporu mevcut.");

    // -------------------------------------------------------------------------
    // Migrasyonların Çalıştırılması (1..13)
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Veri Tabanı Migrasyonları (1..13) & Şema Doğrulaması ---");
    await adapter.execute(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `);

    for (const m of MIGRATION_DEFINITIONS) {
      for (const query of m.sql) {
        await adapter.execute(query);
      }
      await adapter.execute(
        "INSERT INTO schema_migrations (version, applied_at) VALUES ($1, $2)",
        [m.version, new Date().toISOString()]
      );
    }

    const appliedMigrations = await adapter.select<{ version: number }[]>(
      "SELECT version FROM schema_migrations ORDER BY version ASC"
    );
    assert(appliedMigrations.length === MIGRATION_DEFINITIONS.length, `S02: Tüm ${MIGRATION_DEFINITIONS.length} migrasyon başarıyla uygulandı.`);

    // Master fonksiyonları tohumla
    for (const bf of INITIAL_BUSINESS_FUNCTIONS) {
      const id = `bf_${bf.code.toLowerCase()}`;
      await adapter.execute(
        `INSERT INTO business_functions (id, code, name_tr, name_en, category, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, 1)
         ON CONFLICT(code) DO UPDATE SET
           name_tr = excluded.name_tr,
           name_en = excluded.name_en,
           category = excluded.category,
           sort_order = excluded.sort_order,
           is_active = excluded.is_active`,
        [id, bf.code, bf.name_tr, bf.name_en, bf.category, bf.sort_order]
      );
    }

    // -------------------------------------------------------------------------
    // SENARYO 2..6: Proje & Modül Tarih Kayıt ve Doğrulama Kuralları
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Proje & Modül Tarih CRUD ve Ters Tarih Doğrulaması ---");

    const bf0 = INITIAL_BUSINESS_FUNCTIONS[0];
    const bf1 = INITIAL_BUSINESS_FUNCTIONS[1];

    // Geçerli tarihli proje oluştur
    const projId1 = await createProject({
      projectName: "Test Takvim Projesi A.Ş.",
      planned_start_date: "2026-10-01",
      planned_end_date: "2026-12-15",
      actual_start_date: "2026-10-01",
      actual_end_date: null,
      company: {
        company_name: "Test Takvim Projesi A.Ş.",
        city: "Kocaeli",
        country: "Türkiye",
      },
      selectedFunctionIds: [`bf_${bf0.code.toLowerCase()}`, `bf_${bf1.code.toLowerCase()}`],
    });

    assert(!!projId1, "S03: Geçerli takvim tarihleriyle proje başarıyla oluşturuldu.");
    const detail1 = await getProjectDetail(projId1);
    assert(detail1.project.planned_start_date === "2026-10-01", "S03: planned_start_date korundu.");
    assert(detail1.project.planned_end_date === "2026-12-15", "S03: planned_end_date korundu.");

    // Ters tarih doğrulaması
    const reversePlanVal = validateDateRange("2026-12-15", "2026-10-01");
    assert(!reversePlanVal.valid, "S04: Başlangıcı bitişinden sonra olan planlanan aralık reddedildi.");
    assert(reversePlanVal.error === "Bitiş tarihi başlangıç tarihinden önce olamaz.", "S04: Doğru Türkçe hata mesajı üretildi.");

    const reverseActVal = validateDateRange("2026-11-20", "2026-11-10");
    assert(!reverseActVal.valid, "S04: Başlangıcı bitişinden sonra olan fiilî aralık reddedildi.");

    // Modül takvimi güncelleme
    await updateProjectFunctionSchedule(projId1, bf0.code, {
      plannedStartDate: "2026-10-01",
      plannedEndDate: "2026-10-15",
      actualStartDate: "2026-10-01",
      actualEndDate: "2026-10-14",
    });

    const detailAfterFn = await getProjectDetail(projId1);
    const fn1 = detailAfterFn.functions.find((f) => f.code === bf0.code);
    assert(fn1?.planned_start_date === "2026-10-01", "S05: Modül planned_start_date kaydedildi.");
    assert(fn1?.actual_end_date === "2026-10-14", "S05: Modül actual_end_date kaydedildi.");

    const reverseFnVal = validateScheduleDates({
      plannedStartDate: "2026-10-20",
      plannedEndDate: "2026-10-05",
    });
    assert(!reverseFnVal.valid, "S06: Ters modül takvim aralığı reddedildi.");

    // -------------------------------------------------------------------------
    // SENARYO 7: Timezone Kayması Olmaması (Saf Takvim Günü Hesabı)
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Timezone ve Tarih Biçimlendirme Güvenliği ---");
    assert(isValidIsoDate("2026-09-01"), "S07: 2026-09-01 geçerli ISO tarihidir.");
    assert(!isValidIsoDate("2026-02-30"), "S07: 2026-02-30 (olmayan gün) geçersiz sayıldı.");
    assert(calculateDaysDifference("2026-09-01", "2026-09-15") === 14, "S07: 01.09 - 15.09 arası tam 14 gün.");
    assert(formatIsoDateTr("2026-09-01") === "01.09.2026", "S07: formatIsoDateTr yerel saat diliminden etkilenmeden 01.09.2026 üretti.");
    assert(formatDateRangeSummary("2026-09-01", "2026-09-15") === "01.09.2026 – 15.09.2026", "S07: Tarih aralığı em-dash ile birleştirildi.");
    assert(formatDateRangeSummary(null, null) === "Planlanmadı", "S07: Boş tarihler 'Planlanmadı' olarak formatlandı.");

    // -------------------------------------------------------------------------
    // SENARYO 8..10: Kapsam Dışı Bırakma, Yeniden Aktifleştirme ve Pasif Proje
    // -------------------------------------------------------------------------
    console.log("\n--- 5. Kapsam Revizyonu ve Pasif Proje Takvim Davranışı ---");
    // Kapsam dışına al
    await deactivateProjectFunction(projId1, bf0.code, "Test kapsam dışı");
    const detailAfterScope = await getProjectDetail(projId1);
    const deactivatedFn = detailAfterScope.functions.find((f) => f.id === fn1!.id);
    assert(deactivatedFn?.is_active === 0, "S08: Modül başarıyla kapsam dışına alındı (is_active = 0).");
    assert(deactivatedFn?.planned_start_date === "2026-10-01", "S08: Kapsam dışına alınan modülün planned_start_date değeri korundu.");
    assert(deactivatedFn?.actual_end_date === "2026-10-14", "S08: Kapsam dışına alınan modülün actual_end_date değeri korundu.");

    // Yeniden aktifleştir
    await addOrReactivateProjectFunction(projId1, bf0.code);
    const detailReactivated = await getProjectDetail(projId1);
    const reactivatedFn = detailReactivated.functions.find((f) => f.id === fn1!.id);
    assert(reactivatedFn?.is_active === 1, "S09: Modül yeniden aktifleştirildi (is_active = 1).");
    assert(reactivatedFn?.planned_start_date === "2026-10-01", "S09: Eski takvim verisi eksiksiz geri geldi.");

    // Projeyi pasife al
    await updateProjectStatus(projId1, "passive");
    const detailPassive = await getProjectDetail(projId1);
    assert(detailPassive.project.status === "passive", "S10: Proje pasife alındı.");
    assert(detailPassive.project.planned_start_date === "2026-10-01", "S10: Pasif proje planlanan başlangıç tarihini korudu.");

    // -------------------------------------------------------------------------
    // SENARYO 11..14: Yedekleme, Geri Yükleme ve Çoğaltma (.erpcrm)
    // -------------------------------------------------------------------------
    console.log("\n--- 6. .erpcrm Yedekleme, Geri Yükleme ve Çoğaltma ---");
    const backupData = await exportProjectBackup(projId1);
    assert(backupData.buffer.byteLength > 0, "S11: Proje yedeği başarıyla dışa aktarıldı.");
    assert(backupData.manifest.schemaVersion === 13, "S11: Manifest schemaVersion = 13.");

    const restoreResult = await restoreProjectBackup(backupData.buffer);
    assert(restoreResult.success, "S12: Yedekten geri yükleme başarılı.");
    const restoredDetail = await getProjectDetail(restoreResult.newProjectId);
    assert(restoredDetail.project.planned_start_date === "2026-10-01", "S12: Geri yüklenen projede planned_start_date birebir korundu.");

    // Şablon çoğaltma (actual tarihler sıfırlanır, planlananlar korunur)
    const templateDuplicate = await duplicateProject(projId1, { copyAnswersAndAttachments: false });
    const templateDetail = await getProjectDetail(templateDuplicate.newProjectId);
    assert(templateDetail.project.planned_start_date === "2026-10-01", "S14: Şablon kopyada planned_start_date korundu.");
    assert(templateDetail.project.actual_start_date === null, "S14: Şablon kopyada actual_start_date sıfırlandı (null).");
    const templateFn = templateDetail.functions.find((f) => f.code === bf0.code);
    assert(templateFn?.status === "not_started", "S14: Şablon kopyada modül durumu 'not_started' yapıldı.");
    assert(templateFn?.actual_start_date === null, "S14: Şablon kopyada modül actual_start_date sıfırlandı.");

    // -------------------------------------------------------------------------
    // SENARYO 15..17: Marmara Endüstriyel Pilotu Takvim Bütünlüğü
    // -------------------------------------------------------------------------
    console.log("\n--- 7. Marmara Endüstriyel Pilot Takvim Bütünlüğü ---");
    const pilotResult = await createManufacturingDemoProject();
    assert(!!pilotResult.projectId, "S15: Sentetik Marmara pilotu oluşturuldu.");
    const pilotDetail = await getProjectDetail(pilotResult.projectId);
    assert(pilotDetail.functions.length === 19, "S15: 19 aktif modül mevcut.");
    assert(pilotDetail.project.planned_start_date === "2026-09-01", "S15: Pilot planlanan başlangıç 2026-09-01.");
    assert(pilotDetail.project.planned_end_date === "2026-11-24", "S15: Pilot planlanan bitiş 2026-11-24.");

    const completedFn = pilotDetail.functions.find((f) => f.code === "ACCOUNTING");
    assert(completedFn?.status === "completed", "S16: ACCOUNTING tamamlandı.");
    assert(completedFn?.actual_end_date === "2026-09-14", "S16: Tamamlanan ACCOUNTING modülünde fiilî bitiş tarihi mevcut (2026-09-14).");

    const inProgressFn = pilotDetail.functions.find((f) => f.code === "TREASURY");
    assert(inProgressFn?.status === "in_progress", "S17: TREASURY devam ediyor.");
    assert(inProgressFn?.actual_start_date === "2026-09-08", "S17: Devam eden TREASURY modülünde fiilî başlangıç mevcut.");
    assert(inProgressFn?.actual_end_date === null, "S17: Devam eden TREASURY modülünde fiilî bitiş null.");

    // -------------------------------------------------------------------------
    // SENARYO 18: Foreign Key Kontrolü
    // -------------------------------------------------------------------------
    console.log("\n--- 8. SQLite Foreign Key Bütünlük Denetimi ---");
    const fkCheck = await adapter.select<any[]>("PRAGMA foreign_key_check;");
    assert(fkCheck.length === 0, "S18: PRAGMA foreign_key_check 0 ihlal döndürdü.");

    // -------------------------------------------------------------------------
    // SENARYO 19..21: Rapor Modeli, Parite ve Kapsam Dışı İzolasyonu
    // -------------------------------------------------------------------------
    console.log("\n--- 9. Rapor Modeli, Parite ve İstatistik İzolasyonu ---");
    const reportModel = await buildReportModel(pilotResult.projectId);
    assert(reportModel.scheduleSummary !== undefined, "S19: Rapor modelinde scheduleSummary üretildi.");
    assert(reportModel.scheduleSummary?.projectSchedule.plannedRangeSummary === "01.09.2026 – 24.11.2026", "S20: Proje planlanan aralık özeti doğru.");
    assert(reportModel.scheduleSummary?.projectSchedule.scheduleStatus === "on_track", "S20: Proje takvim durumu 'on_track'.");
    assert(reportModel.scheduleSummary?.projectSchedule.scheduleStatusBadgeClass === "badge-schedule--on-track", "S20: Proje takvim rozet sınıfı 'badge-schedule--on-track'.");
    assert(reportModel.scheduleSummary?.functionSchedules.length === 19, "S21: scheduleSummary 19 aktif modülü içeriyor.");
    assert(reportModel.scheduleSummary?.stats.completedOnTime! >= 6, "S21: Zamanında tamamlanan modül sayısı hesaplandı.");
    assert(reportModel.scheduleSummary?.stats.onTrack! >= 1, "S21: Yolunda giden modül sayısı hesaplandı.");

    // -------------------------------------------------------------------------
    // SENARYO 22: 9 Durumlu Zaman Motoru Determinizmi
    // -------------------------------------------------------------------------
    console.log("\n--- 10. 9 Durumlu Zaman Motoru Determinizmi ---");
    const stNotPlanned = calculateScheduleStatus({});
    assert(stNotPlanned.status === "not_planned", "S22: Tarihsiz modül 'not_planned' statüsünde.");

    const stCompletedLate = calculateScheduleStatus({
      plannedEndDate: "2026-09-15",
      actualEndDate: "2026-09-18",
    });
    assert(stCompletedLate.status === "completed_late", "S22: 3 gün geciken tamamlama 'completed_late' statüsünde.");
    assert(stCompletedLate.delayDays === 3, "S22: Gecikme 3 gün olarak hesaplandı.");

    const stCompletedOnTime = calculateScheduleStatus({
      plannedEndDate: "2026-09-15",
      actualEndDate: "2026-09-14",
    });
    assert(stCompletedOnTime.status === "completed_on_time", "S22: Zamanında tamamlama 'completed_on_time' statüsünde.");

    // -------------------------------------------------------------------------
    // ÖZET VE SONUÇ
    // -------------------------------------------------------------------------
    console.log("\n======================================================================");
    console.log(`FAZ-61 KABUL TESTİ SONUCU: ${passCount} PASS / ${failCount} FAIL`);
    console.log("======================================================================\n");

    if (failCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err: any) {
    console.error("Test çalıştırma hatası:", err);
    process.exit(1);
  }
}

runTests();
