/**
 * ERP CRM Discovery — FAZ-59 Proje Takvimi ve İş Fonksiyonu Zaman Planı Test Paketi
 *
 * Test Doğrulamaları:
 * 1. Migration 13: analysis_projects ve project_business_functions tablolarına 4 tarih kolonunun eklenmesi (TEXT NULL).
 * 2. ISO Tarih & Güvenli Gün Matematiği (src/models/scheduleStatus.ts):
 *    - isValidIsoDate (geçerli/geçersiz formatlar, artık yıl vb.)
 *    - dateToEpochDays & calculateDaysDifference (saat dilimi ve daylight-saving kayması olmadan kesin gün farkı)
 *    - validateScheduleDates (başlangıç <= bitiş kuralı, hata mesajları)
 * 3. Merkezi Takvim Durumu Hesaplama Motoru (calculateScheduleStatus):
 *    - not_planned (tarih yok)
 *    - planned (planlanan başlangıç gelecekte)
 *    - not_started (başlanmadı ve planlanan başlangıç tarihi geldi/geçti)
 *    - in_progress (devam ediyor, bitiş tarihi belirtilmemiş)
 *    - on_track (devam ediyor, bitişe > 7 gün var)
 *    - due_soon (bitişe <= 7 gün var)
 *    - overdue (bitiş tarihi geçti, tamamlanmadı)
 *    - completed_on_time (planlanan tarihte/öncesinde tamamlandı)
 *    - completed_late (planlanan tarihten sonra tamamlandı)
 * 4. Rozet ve UI Yardımcıları: getScheduleStatusBadgeMeta, formatIsoDateTr, formatDateRangeSummary
 * 5. DB Servisleri (src/db/client.ts):
 *    - createProject ve getProjects takvim alanları
 *    - updateProjectSchedule ve getProjectSchedule
 *    - updateProjectFunctionSchedule ve getProjectFunctionSchedule
 *    - getProjectDetail fonksiyon takvim alanları
 * 6. Marmara Endüstriyel Pilot Projesi (src/demo/manufacturingPilot.ts):
 *    - 12 haftalık proje takvimi (2026-09-01 -> 2026-11-24)
 *    - 19 iş fonksiyonunun 5 dalgalı planlanan/gerçekleşen tarih dağılımı
 *    - 94 kanonik cevabın bozulmadan korunması
 * 7. Rapor Modeli & Export (src/report/builder.ts):
 *    - buildReportModel scheduleSummary çıktısı ve istatistikleri
 * 8. Yedekleme & Çoğaltma (src/storage/backupManager.ts):
 *    - Schema version 13 doğrulaması
 *    - Export & Restore'da tarihlerin korunması
 *    - Şablon çoğaltmada gerçekleşenlerin sıfırlanıp planlananların korunması
 *    - Tam çoğaltmada tüm tarihlerin korunması
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import Database from "better-sqlite3";

import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import { INITIAL_BUSINESS_FUNCTIONS } from "../src/db/seedData";
import { BUSINESS_FUNCTION_REGISTRY } from "../src/generated/businessFunctions";
import {
  setDbInstanceForTesting,
  resetDbInstanceForTesting,
  createProject,
  getProjects,
  getProjectDetail,
  updateProjectSchedule,
  getProjectSchedule,
  updateProjectFunctionSchedule,
  getProjectFunctionSchedule,
} from "../src/db/client";
import {
  createManufacturingDemoProject,
} from "../src/demo/manufacturingPilot";
import { buildReportModel } from "../src/report/builder";
import {
  isValidIsoDate,
  dateToEpochDays,
  calculateDaysDifference,
  validateScheduleDates,
  calculateScheduleStatus,
  getScheduleStatusBadgeMeta,
  formatIsoDateTr,
  formatDateRangeSummary,
} from "../src/models/scheduleStatus";
import {
  BACKUP_CURRENT_SCHEMA_VERSION,
  exportProjectBackup,
  restoreProjectBackup,
  duplicateProject,
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

// In-Memory SQLite Adapter
class BetterSqlitePoolAdapter {
  private db: any;

  constructor() {
    this.db = new Database(":memory:");
    this.db.pragma("foreign_keys = ON");
  }

  async select<T>(query: string, bindValues: any[] = []): Promise<T> {
    const { sql: convertedSql, params: orderedParams } = convertSql(query, bindValues);
    try {
      const stmt = this.db.prepare(convertedSql);
      return stmt.all(...orderedParams) as T;
    } catch (err: any) {
      console.error("[TEST DB select ERROR]", { query: convertedSql, bindValues, err: err.message });
      throw err;
    }
  }

  async execute(query: string, bindValues: any[] = []): Promise<{ rowsAffected: number }> {
    const { sql: convertedSql, params: orderedParams } = convertSql(query, bindValues);
    try {
      const stmt = this.db.prepare(convertedSql);
      const info = stmt.run(...orderedParams);
      return { rowsAffected: info.changes };
    } catch (err: any) {
      console.error("[TEST DB execute ERROR]", { query: convertedSql, bindValues, err: err.message });
      throw err;
    }
  }

  close() {
    this.db.close();
  }
}

async function runTests() {
  console.log("================================================================================");
  console.log("ERP CRM Discovery — FAZ-59 Proje Takvimi & Zaman Planı Test Paketi");
  console.log("================================================================================\n");

  // -------------------------------------------------------------------------
  // TEST 1: ISO Tarih & Güvenli Gün Matematiği (scheduleStatus.ts)
  // -------------------------------------------------------------------------
  console.log("--- TEST 1: ISO Tarih Doğrulama ve Matematiksel Gün Farkı ---");
  
  assert(isValidIsoDate("2026-09-01") === true, "2026-09-01 geçerli ISO tarihidir.");
  assert(isValidIsoDate("2024-02-29") === true, "2024-02-29 artık yıl 29 Şubat geçerlidir.");
  assert(isValidIsoDate("2025-02-29") === false, "2025-02-29 artık olmayan yılda geçersizdir.");
  assert(isValidIsoDate("2026-13-01") === false, "13. ay geçersizdir.");
  assert(isValidIsoDate("2026-09-31") === false, "Eylül 31 gün çekmez, geçersizdir.");
  assert(isValidIsoDate("2026/09/01") === false, "Slash formatı ISO formatı sayılmaz.");
  assert(isValidIsoDate("") === false, "Boş dize geçersizdir.");

  const day1 = dateToEpochDays("2026-09-01");
  const day2 = dateToEpochDays("2026-09-15");
  assert(day2 - day1 === 14, "2026-09-01 ile 2026-09-15 arasında tam 14 gün vardır.");
  assert(calculateDaysDifference("2026-09-01", "2026-09-15") === 14, "calculateDaysDifference 14 gün döndürdü.");
  assert(calculateDaysDifference("2026-09-15", "2026-09-01") === -14, "Ters tarih farkı negatif (-14) döndürdü.");
  assert(calculateDaysDifference(null, "2026-09-15") === 0, "Null tarih farkı 0 döndürdü.");

  // Tarih aralığı doğrulama
  const v1 = validateScheduleDates({ plannedStartDate: "2026-09-15", plannedEndDate: "2026-09-01" });
  assert(v1.valid === false && v1.error?.includes("başlangıç tarihinden önce olamaz"), "Planlanan bitiş başlangıçtan önce olamaz.");

  const v2 = validateScheduleDates({ actualStartDate: "2026-10-10", actualEndDate: "2026-10-05" });
  assert(v2.valid === false && v2.error?.includes("başlangıç tarihinden önce olamaz"), "Gerçekleşen bitiş başlangıçtan önce olamaz.");

  const v3 = validateScheduleDates({ plannedStartDate: "2026-09-01", plannedEndDate: "2026-09-15", actualStartDate: "2026-09-02", actualEndDate: "2026-09-14" });
  assert(v3.valid === true, "Geçerli planlanan ve gerçekleşen tarihler doğrulandı.");

  // -------------------------------------------------------------------------
  // TEST 2: Merkezi Takvim Durumu Hesaplama Motoru (9 Durum)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 2: Takvim Durumu Hesaplama (9 Durum) ---");

  // 1. not_planned
  const sNotPlanned = calculateScheduleStatus({});
  assert(sNotPlanned.status === "not_planned" && sNotPlanned.label === "Planlanmadı", "Tarih girilmediğinde durum: not_planned.");

  // 2. planned (gelecekte)
  const sPlanned = calculateScheduleStatus({ plannedStartDate: "2099-01-01", plannedEndDate: "2099-01-15" });
  assert(sPlanned.status === "planned" && sPlanned.label === "Planlandı", "Gelecekteki plan: planned.");

  // 3. not_started (başlanmadı ve planlanan başlangıç tarihi geldi)
  const sNotStarted = calculateScheduleStatus({ plannedStartDate: "2020-01-01", plannedEndDate: "2099-01-15" }, "not_started");
  assert(sNotStarted.status === "not_started" && sNotStarted.badgeClass === "badge-schedule--not-started", "Başlangıcı gelmiş ama başlanmamış: not_started.");

  // 4. completed_on_time
  const sCompOnTime = calculateScheduleStatus({
    plannedStartDate: "2026-09-01",
    plannedEndDate: "2026-09-15",
    actualStartDate: "2026-09-01",
    actualEndDate: "2026-09-14",
  }, "completed");
  assert(sCompOnTime.status === "completed_on_time" && sCompOnTime.label === "Zamanında Tamamlandı", "Zamanında tamamlanan: completed_on_time.");

  // 5. completed_late
  const sCompLate = calculateScheduleStatus({
    plannedStartDate: "2026-09-01",
    plannedEndDate: "2026-09-15",
    actualStartDate: "2026-09-01",
    actualEndDate: "2026-09-18",
  }, "completed");
  assert(sCompLate.status === "completed_late" && sCompLate.delayDays === 3, "Gecikmeli tamamlanan: completed_late (3 gün gecikme).");

  // 6. overdue (geçmiş tarih, bitmemiş)
  const sOverdue = calculateScheduleStatus({
    plannedStartDate: "2020-01-01",
    plannedEndDate: "2020-01-15",
    actualStartDate: "2020-01-01",
    actualEndDate: null,
  }, "in_progress");
  assert(sOverdue.status === "overdue" && sOverdue.delayDays > 0, "Bitişi geçmiş ve tamamlanmamış: overdue.");

  // 7. on_track (gelecekte >7 gün)
  const sOnTrack = calculateScheduleStatus({
    plannedStartDate: "2020-01-01",
    plannedEndDate: "2099-12-31",
    actualStartDate: "2020-01-01",
  }, "in_progress");
  assert(sOnTrack.status === "on_track" && sOnTrack.badgeClass === "badge-schedule--on-track", "Gelecekteki bitişe uzun süre var: on_track.");

  // Format ve rozet yardımcıları
  assert(formatIsoDateTr("2026-09-01") === "01.09.2026", "formatIsoDateTr Türkçe DD.MM.YYYY formatı üretti.");
  assert(formatIsoDateTr(null) === "—", "formatIsoDateTr null için — üretti.");
  assert(formatDateRangeSummary("2026-09-01", "2026-09-15") === "01.09.2026 – 15.09.2026", "formatDateRangeSummary aralık metni üretti.");

  const badgeMeta = getScheduleStatusBadgeMeta("completed_on_time");
  assert(badgeMeta.badgeClass === "badge-schedule--completed-on-time" && badgeMeta.label === "Zamanında Tamamlandı", "Badge meta doğru rozet sınıfı ve etiketi üretti.");

  // -------------------------------------------------------------------------
  // TEST 3: DB Şeması & Migration 13 Doğrulaması
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 3: Migration 13 & SQLite Şema Doğrulaması ---");
  const adapter = new BetterSqlitePoolAdapter();
  setDbInstanceForTesting(adapter as any);

  // 13 Migration'ın tamamını çalıştır
  for (const m of MIGRATION_DEFINITIONS) {
    for (const sql of m.sql) {
      await adapter.execute(sql);
    }
  }

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

  // analysis_projects tablosundaki 4 kolonu kontrol et
  const projCols = await adapter.select<any[]>("PRAGMA table_info(analysis_projects);");
  const projColNames = projCols.map((c) => c.name);
  assert(projColNames.includes("planned_start_date"), "analysis_projects.planned_start_date kolonu mevcut.");
  assert(projColNames.includes("planned_end_date"), "analysis_projects.planned_end_date kolonu mevcut.");
  assert(projColNames.includes("actual_start_date"), "analysis_projects.actual_start_date kolonu mevcut.");
  assert(projColNames.includes("actual_end_date"), "analysis_projects.actual_end_date kolonu mevcut.");

  // project_business_functions tablosundaki 4 kolonu kontrol et
  const pbfCols = await adapter.select<any[]>("PRAGMA table_info(project_business_functions);");
  const pbfColNames = pbfCols.map((c) => c.name);
  assert(pbfColNames.includes("planned_start_date"), "project_business_functions.planned_start_date kolonu mevcut.");
  assert(pbfColNames.includes("planned_end_date"), "project_business_functions.planned_end_date kolonu mevcut.");
  assert(pbfColNames.includes("actual_start_date"), "project_business_functions.actual_start_date kolonu mevcut.");
  assert(pbfColNames.includes("actual_end_date"), "project_business_functions.actual_end_date kolonu mevcut.");

  // -------------------------------------------------------------------------
  // TEST 4: Proje ve Fonksiyon Takvim Servisleri (client.ts)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 4: Proje ve Fonksiyon Takvim CRUD Servisleri ---");

  const pId = await createProject({
    projectName: "Test Takvim Projesi",
    planned_start_date: "2026-10-01",
    planned_end_date: "2026-12-15",
    actual_start_date: "2026-10-01",
    actual_end_date: null,
    company: {
      company_name: "Takvim A.Ş.",
      city: "Ankara",
    },
    selectedFunctionIds: ["bf_sales", "bf_accounting"],
  });

  const projList = await getProjects();
  const createdProj = projList.find((p) => p.id === pId);
  assert(createdProj?.planned_start_date === "2026-10-01", "getProjects planned_start_date getirdi.");
  assert(createdProj?.planned_end_date === "2026-12-15", "getProjects planned_end_date getirdi.");

  // updateProjectSchedule
  await updateProjectSchedule(pId, {
    plannedStartDate: "2026-10-05",
    plannedEndDate: "2026-12-20",
    actualStartDate: "2026-10-06",
    actualEndDate: null,
  });

  const updatedSchedule = await getProjectSchedule(pId);
  assert(updatedSchedule?.plannedStartDate === "2026-10-05", "updateProjectSchedule plannedStartDate güncelledi.");
  assert(updatedSchedule?.plannedEndDate === "2026-12-20", "updateProjectSchedule plannedEndDate güncelledi.");
  assert(updatedSchedule?.actualStartDate === "2026-10-06", "updateProjectSchedule actualStartDate güncelledi.");

  // updateProjectFunctionSchedule
  await updateProjectFunctionSchedule(pId, "SALES", {
    plannedStartDate: "2026-10-05",
    plannedEndDate: "2026-10-25",
    actualStartDate: "2026-10-06",
    actualEndDate: "2026-10-24",
  });

  const salesSchedule = await getProjectFunctionSchedule(pId, "SALES");
  assert(salesSchedule?.plannedStartDate === "2026-10-05", "updateProjectFunctionSchedule plannedStartDate güncelledi.");
  assert(salesSchedule?.actualEndDate === "2026-10-24", "updateProjectFunctionSchedule actualEndDate güncelledi.");

  const pDetail = await getProjectDetail(pId);
  const salesFunc = pDetail?.functions.find((f) => f.code === "SALES");
  assert(salesFunc?.planned_start_date === "2026-10-05", "getProjectDetail fonksiyon takvimini getirdi.");
  assert(salesFunc?.actual_end_date === "2026-10-24", "getProjectDetail fonksiyon gerçekleşen bitişi getirdi.");

  // -------------------------------------------------------------------------
  // TEST 5: Marmara Endüstriyel Sentetik Pilot Takvim Doğrulaması
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 5: Marmara Endüstriyel Sentetik Pilot Takvimi ---");

  const demoResult = await createManufacturingDemoProject();
  assert(demoResult.projectId.startsWith("proj_"), "Sentetik pilot başarıyla oluşturuldu.");

  const demoDetail = await getProjectDetail(demoResult.projectId);
  assert(demoDetail !== null, "Pilot proje detayları okundu.");
  assert(demoDetail?.project.planned_start_date === "2026-09-01", "Pilot proje planlanan başlangıç 2026-09-01.");
  assert(demoDetail?.project.planned_end_date === "2026-11-24", "Pilot proje planlanan bitiş 2026-11-24 (12 hafta).");
  assert(demoDetail?.project.actual_start_date === "2026-09-01", "Pilot proje gerçekleşen başlangıç 2026-09-01.");
  assert(demoDetail?.project.actual_end_date === null, "Pilot proje henüz tamamlanmadı (actual_end_date = null).");

  // 19 fonksiyonun takvim dağılımını kontrol et
  const fnMap = new Map(demoDetail?.functions.map((f) => [f.code, f]));
  assert(fnMap.size === 19, "19 fonksiyon mevcut.");

  // Dalga 1: ACCOUNTING (completed_on_time)
  const acc = fnMap.get("ACCOUNTING");
  assert(acc?.planned_start_date === "2026-09-01" && acc?.actual_end_date === "2026-09-14", "ACCOUNTING zamanında tamamlandı (2026-09-14 <= 2026-09-15).");

  // Dalga 5: INFORMATION_TECHNOLOGY (completed_late: 2026-09-18 > 2026-09-15)
  const it = fnMap.get("INFORMATION_TECHNOLOGY");
  assert(it?.actual_end_date === "2026-09-18" && it?.planned_end_date === "2026-09-15", "INFORMATION_TECHNOLOGY gecikmeli tamamlandı.");

  // Dalga 5: HUMAN_RESOURCES (not_started)
  const hr = fnMap.get("HUMAN_RESOURCES");
  assert(hr?.status === "not_started" && hr?.actual_start_date === null, "HUMAN_RESOURCES not_started durumunda.");

  // 94 cevabın sağlam kaldığını doğrula
  const ansCount = await adapter.select<{ c: number }[]>(
    "SELECT COUNT(*) as c FROM question_answers WHERE analysis_project_id = $1",
    [demoResult.projectId]
  );
  assert(ansCount[0].c === 94, "94 kanonik cevap aynen korunuyor.");

  // -------------------------------------------------------------------------
  // TEST 6: Rapor Modeli Entegrasyonu (builder.ts)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 6: Rapor Modeli Takvim Bölümü (scheduleSummary) ---");

  const reportModel = await buildReportModel(demoResult.projectId);
  assert(reportModel.scheduleSummary !== undefined, "Rapor modelinde scheduleSummary alanı üretildi.");
  assert(reportModel.scheduleSummary?.projectSchedule.plannedRangeSummary === "01.09.2026 – 24.11.2026", "Rapor proje planlanan aralık özeti doğru.");
  assert(reportModel.scheduleSummary?.functionSchedules.length === 19, "19 fonksiyonun rapor takvim kaydı mevcut.");
  assert(reportModel.scheduleSummary?.stats.completedOnTime! >= 6, "Zamanında tamamlanan fonksiyon istatistiği üretildi.");
  assert(reportModel.scheduleSummary?.stats.completedLate! >= 1, "Gecikmeli tamamlanan fonksiyon istatistiği üretildi.");
  assert(reportModel.scheduleSummary?.stats.notStarted! >= 1, "Başlanmamış fonksiyon istatistiği üretildi.");

  // -------------------------------------------------------------------------
  // TEST 7: Yedekleme, Geri Yükleme ve Çoğaltma (.erpcrm)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 7: .erpcrm Yedekleme, Geri Yükleme ve Çoğaltma ---");

  assert(BACKUP_CURRENT_SCHEMA_VERSION === 13, "BACKUP_CURRENT_SCHEMA_VERSION = 13.");

  // Export
  const backupArchive = await exportProjectBackup(demoResult.projectId);
  assert(backupArchive.buffer.byteLength > 0, "Yedek arşivi başarıyla paketlendi.");
  assert(backupArchive.manifest.schemaVersion === 13, "Manifest schemaVersion = 13.");

  // Direct Restore from backup archive buffer
  const directRestore = await restoreProjectBackup(backupArchive.buffer, {
    newProjectName: "Marmara Restore Kopyası",
  });
  assert(directRestore.projectId !== demoResult.projectId, "Yedekten geri yükleme yeni proje ID'si üretti.");
  const restoreDetail = await getProjectDetail(directRestore.projectId);
  assert(restoreDetail?.project.planned_start_date === "2026-09-01", "Geri yüklenen projede planned_start_date korundu.");
  assert(restoreDetail?.project.actual_start_date === "2026-09-01", "Geri yüklenen projede actual_start_date korundu.");

  // Duplicate (Şablon Modu — copyAnswersAndAttachments: false)
  const templateResult = await duplicateProject(demoResult.projectId, {
    newProjectName: "Marmara Şablon Kopyası",
    copyAnswersAndAttachments: false,
  });
  assert(templateResult.success === true, "Şablon kopyası başarıyla oluşturuldu.");

  const templateDetail = await getProjectDetail(templateResult.newProjectId);
  assert(templateDetail?.project.planned_start_date === "2026-09-01", "Şablon kopyasında planlanan başlangıç korundu.");
  assert(templateDetail?.project.planned_end_date === "2026-11-24", "Şablon kopyasında planlanan bitiş korundu.");
  assert(templateDetail?.project.actual_start_date === null, "Şablon kopyasında gerçekleşen başlangıç sıfırlandı (null).");
  assert(templateDetail?.project.actual_end_date === null, "Şablon kopyasında gerçekleşen bitiş sıfırlandı (null).");

  for (const fn of templateDetail?.functions || []) {
    assert(fn.status === "not_started", `Şablon fonksiyonu '${fn.code}' durumu not_started.`);
    assert(fn.actual_start_date === null, `Şablon fonksiyonu '${fn.code}' actual_start_date sıfırlandı.`);
    assert(fn.actual_end_date === null, `Şablon fonksiyonu '${fn.code}' actual_end_date sıfırlandı.`);
    assert(fn.planned_start_date !== null, `Şablon fonksiyonu '${fn.code}' planned_start_date korundu.`);
  }

  // Duplicate (Tam Kopya Modu — copyAnswersAndAttachments: true)
  const fullCloneResult = await duplicateProject(demoResult.projectId, {
    newProjectName: "Marmara Tam Kopyası",
    copyAnswersAndAttachments: true,
  });
  assert(fullCloneResult.success === true, "Tam kopya başarıyla oluşturuldu.");

  const fullDetail = await getProjectDetail(fullCloneResult.newProjectId);
  assert(fullDetail?.project.actual_start_date === "2026-09-01", "Tam kopyada gerçekleşen başlangıç korundu.");
  const fullAcc = fullDetail?.functions.find((f) => f.code === "ACCOUNTING");
  assert(fullAcc?.actual_end_date === "2026-09-14", "Tam kopyada ACCOUNTING gerçekleşen bitişi korundu.");

  adapter.close();
  resetDbInstanceForTesting();

  console.log("\n================================================================================");
  console.log(`FAZ-59 TEST SONUCU: ${passCount} PASS / ${failCount} FAIL`);
  console.log("================================================================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test icra hatası:", err);
  process.exit(1);
});
