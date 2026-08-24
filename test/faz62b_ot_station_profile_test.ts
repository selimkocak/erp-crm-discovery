/**
 * ERP CRM Discovery — FAZ-62B OT İSTASYON PROFİLİ VE TEKRARLAYAN İSTASYON AKIŞI TEST PAKETİ
 *
 * Test Doğrulamaları:
 * T01: Migration 14: ot_stations ve ot_station_answers tabloları ile indekslerin SQLite şemasında doğrulanması
 * T02: İstasyon Oluşturma (Create) ve Proje İçi İstasyon Kodu Tekilliği (Unique station_code per project)
 * T03: Farklı Projelerde Aynı İstasyon Kodunun Kullanılabilmesi (Multi-project station_code isolation)
 * T04: İstasyon Güncelleme (Update) ve Kod Çakışma Koruması
 * T05: İstasyon Durumu Değiştirme (toggleOtStationStatus: active / passive)
 * T06: Tekrarlayan İstasyon Cevap İzolasyonu (Station A vs Station B answers do not bleed)
 * T07: İstasyon Cevapları ile Proje-Düzeyi question_answers İzolasyonu (Sıfır Karışma)
 * T08: İstasyon Cevabı Güncelleme (UPSERT davranışı)
 * T09: İstasyon Silme ve Bağlı İstasyon Cevaplarının Temizlenmesi (Cascade deletion)
 * T10: İstasyon Özet İstatistikleri (getOtStationsSummary: total, active, passive, areaCount, lineCount)
 * T11: ReportModel ve Rapor Entegrasyonu (buildReportModel.otStationsSummary)
 * T12: DOCX Rapor Üretimi Uyumluluğu (buildDocxBuffer with Section 3.2 OT Stations)
 * T13: Liberation Sans TrueType PDF Rapor Üretimi ve Türkçe Karakter Uyumluluğu
 * T14: Taşınabilir Arşiv (.erpcrm Schema 14) Export ve Restore İstasyon Bütünlüğü
 * T15: Proje Şablon Çoğaltma (copyAnswers: false -> İstasyonlar korunur, cevaplar sıfırlanır)
 * T16: Proje Tam Klon Çoğaltma (copyAnswers: true -> İstasyonlar ve cevaplar yeni ID'lerle klonlanır)
 * T17: %100 Çevrimdışı, Sıfır Dışa Veri Aktarımı (Zero-Egress) ve AI-Free Doğrulaması
 */

import * as fs from "node:fs";
import * as path from "node:path";
import Database from "better-sqlite3";

import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import { INITIAL_BUSINESS_FUNCTIONS } from "../src/db/seedData";
import {
  setDbInstanceForTesting,
  resetDbInstanceForTesting,
  createProject,
  getProjects,
  getProjectDetail,
  createOtStation,
  getOtStations,
  getOtStationById,
  updateOtStation,
  toggleOtStationStatus,
  deleteOtStation,
  saveOtStationAnswer,
  getOtStationAnswers,
  getOtStationAnswer,
  getOtStationsSummary,
  saveAnswer,
  getAllAnswers,
} from "../src/db/client";
import { buildReportModel } from "../src/report/builder";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import { PDFParse } from "pdf-parse";
import {
  BACKUP_CURRENT_SCHEMA_VERSION,
  exportProjectBackup,
  restoreProjectBackup,
  duplicateProject,
} from "../src/storage/backupManager";
import type { OtStation, StationStatus } from "../src/types";

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

// In-Memory SQLite Adapter for Node test environment
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
  console.log("ERP CRM Discovery — FAZ-62B OT İstasyon Profili & Tekrarlayan Akış Test Paketi");
  console.log("================================================================================\n");

  const adapter = new BetterSqlitePoolAdapter();
  setDbInstanceForTesting(adapter as any);

  // -------------------------------------------------------------------------
  // TEST 1: Migration 14 & SQLite Şema Doğrulaması
  // -------------------------------------------------------------------------
  console.log("--- TEST 1: Migration 14 & SQLite Şema Doğrulaması ---");
  
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

  const tables = await adapter.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  const tableNames = new Set(tables.map((t) => t.name));

  assert(tableNames.has("ot_stations"), "ot_stations tablosu SQLite şemasında oluşturuldu.");
  assert(tableNames.has("ot_station_answers"), "ot_station_answers tablosu SQLite şemasında oluşturuldu.");

  const otCols = await adapter.select<{ name: string }[]>("PRAGMA table_info(ot_stations)");
  const otColNames = new Set(otCols.map((c) => c.name));
  assert(otColNames.has("station_code"), "ot_stations tablosunda station_code kolonu var.");
  assert(otColNames.has("station_name"), "ot_stations tablosunda station_name kolonu var.");
  assert(otColNames.has("area_name"), "ot_stations tablosunda area_name kolonu var.");
  assert(otColNames.has("line_name"), "ot_stations tablosunda line_name kolonu var.");
  assert(otColNames.has("machine_name"), "ot_stations tablosunda machine_name kolonu var.");
  assert(otColNames.has("plc_or_controller"), "ot_stations tablosunda plc_or_controller kolonu var.");
  assert(otColNames.has("operator_count"), "ot_stations tablosunda operator_count kolonu var.");
  assert(otColNames.has("status"), "ot_stations tablosunda status kolonu var.");

  // -------------------------------------------------------------------------
  // TEST 2: İstasyon Oluşturma & Kod Tekilliği
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 2: İstasyon Oluşturma & Kod Tekilliği ---");
  
  const p1Id = await createProject({
    projectName: "Akıllı Fabrika OT Pilot Projesi",
    company: {
      company_name: "Marmara Endüstriyel A.Ş.",
      country: "Türkiye",
    },
    selectedFunctionIds: ["bf_ot_industrial_data", "bf_production_planning"],
  });

  const st1 = await createOtStation({
    project_id: p1Id,
    station_code: "ST-01",
    station_name: "5 Eksen CNC Freze İstasyonu",
    area_name: "Talaşlı İmalat",
    line_name: "İşleme Hattı 1",
    station_type: "CNC Freze",
    machine_name: "DMG Mori DMU 50",
    machine_manufacturer: "DMG Mori",
    machine_model: "DMU 50 3rd Gen",
    plc_or_controller: "Siemens Sinumerik 840D sl",
    operator_count: 2,
    status: "active",
    sort_order: 1,
  });

  assert(st1.id.startsWith("ots_"), "İstasyon ID'si ots_ önekiyle üretildi.");
  assert(st1.station_code === "ST-01", "İstasyon kodu ST-01 olarak kaydedildi.");
  assert(st1.station_name === "5 Eksen CNC Freze İstasyonu", "İstasyon adı doğru kaydedildi.");

  const st2 = await createOtStation({
    project_id: p1Id,
    station_code: "ST-02",
    station_name: "Robotik Kaynak Hücresi",
    area_name: "Gövde Kaynak",
    line_name: "Robotik Hat 1",
    station_type: "Robotik Kaynak",
    machine_name: "KUKA KR 16 Hücre",
    machine_manufacturer: "KUKA",
    machine_model: "KR 16 R2010",
    plc_or_controller: "KUKA KRC4",
    operator_count: 1,
    status: "active",
    sort_order: 2,
  });

  assert(st2.station_code === "ST-02", "İkinci istasyon ST-02 başarıyla oluşturuldu.");

  // Aynı proje içinde mükerrer kod denetimi
  let dupErrorThrown = false;
  try {
    await createOtStation({
      project_id: p1Id,
      station_code: "ST-01",
      station_name: "Mükerrer İstasyon",
      status: "active",
      sort_order: 3,
    });
  } catch (err: any) {
    dupErrorThrown = true;
    assert(err.message.includes("zaten mevcuttur"), "Aynı projede mükerrer kod eklendiğinde beklenen hata fırlatıldı.");
  }
  assert(dupErrorThrown, "Mükerrer istasyon kodu engellendi.");

  // -------------------------------------------------------------------------
  // TEST 3: Farklı Projede Aynı İstasyon Kodu İzolasyonu
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 3: Farklı Projede Aynı İstasyon Kodu ---");
  
  const p2Id = await createProject({
    projectName: "İkinci Tesis Keşif Projesi",
    company: {
      company_name: "Ege Metal Ltd.",
      country: "Türkiye",
    },
    selectedFunctionIds: ["bf_ot_industrial_data"],
  });

  const stP2 = await createOtStation({
    project_id: p2Id,
    station_code: "ST-01", // Aynı kod, farklı proje
    station_name: "Ege CNC İstasyonu",
    status: "active",
    sort_order: 1,
  });

  assert(stP2.project_id === p2Id && stP2.station_code === "ST-01", "Farklı projede aynı istasyon kodu başarıyla oluşturulabilir.");

  // -------------------------------------------------------------------------
  // TEST 4: İstasyon Güncelleme & Kod Güncelleme Çakışma Koruması
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 4: İstasyon Güncelleme ---");

  await updateOtStation(st1.id, {
    station_name: "5 Eksen CNC Freze (Güncellendi)",
    operator_count: 3,
  });

  const updatedSt1 = await getOtStationById(st1.id);
  assert(updatedSt1?.station_name === "5 Eksen CNC Freze (Güncellendi)", "İstasyon adı güncellendi.");
  assert(updatedSt1?.operator_count === 3, "Operatör sayısı 3 olarak güncellendi.");

  // ST-02 kodunu ST-01 yapmaya çalışalım (çakışmalı)
  let codeConflictThrown = false;
  try {
    await updateOtStation(st2.id, { station_code: "ST-01" });
  } catch (err: any) {
    codeConflictThrown = true;
    assert(err.message.includes("zaten mevcuttur"), "Güncellemede mükerrer kod engellendi.");
  }
  assert(codeConflictThrown, "Kod çakışma koruması çalıştı.");

  // -------------------------------------------------------------------------
  // TEST 5: İstasyon Durumu Değiştirme (toggleOtStationStatus)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 5: İstasyon Durumu Değiştirme ---");

  await toggleOtStationStatus(st2.id, "passive");
  const passiveSt2 = await getOtStationById(st2.id);
  assert(passiveSt2?.status === "passive", "İstasyon durumu 'passive' yapıldı.");

  await toggleOtStationStatus(st2.id, "active");
  const activeSt2 = await getOtStationById(st2.id);
  assert(activeSt2?.status === "active", "İstasyon durumu tekrar 'active' yapıldı.");

  // -------------------------------------------------------------------------
  // TEST 6: Tekrarlayan İstasyon Cevap İzolasyonu (Station A vs Station B)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 6: Tekrarlayan İstasyon Cevap İzolasyonu ---");

  // İstasyon 1 için cevap kaydet
  await saveOtStationAnswer(
    p1Id,
    st1.id,
    "OTD-001",
    {
      selected: [{ value: "OTD_001_OEE" }],
      general_note: "ST-01 için hedef OEE artışıdır.",
    }
  );

  // İstasyon 2 için AYNI soruya FARKLI cevap kaydet
  await saveOtStationAnswer(
    p1Id,
    st2.id,
    "OTD-001",
    {
      selected: [{ value: "OTD_001_QUALITY" }],
      general_note: "ST-02 için hedef robotik kaynak kalitesidir.",
    }
  );

  const st1Answers = await getOtStationAnswers(p1Id, st1.id);
  const st2Answers = await getOtStationAnswers(p1Id, st2.id);

  assert(st1Answers.size === 1, "İstasyon 1'e ait 1 cevap çekildi.");
  assert(st2Answers.size === 1, "İstasyon 2'ye ait 1 cevap çekildi.");
  assert(st1Answers.get("OTD-001")?.selected?.[0]?.value === "OTD_001_OEE", "İstasyon 1 cevabı OTD_001_OEE olarak izole kaldı.");
  assert(st2Answers.get("OTD-001")?.selected?.[0]?.value === "OTD_001_QUALITY", "İstasyon 2 cevabı OTD_001_QUALITY olarak izole kaldı.");
  assert(st1Answers.get("OTD-001")?.general_note === "ST-01 için hedef OEE artışıdır.", "İstasyon 1 notu doğru döndü.");
  assert(st2Answers.get("OTD-001")?.general_note === "ST-02 için hedef robotik kaynak kalitesidir.", "İstasyon 2 notu doğru döndü.");

  // -------------------------------------------------------------------------
  // TEST 7: Proje Düzeyi question_answers İle Sıfır Karışma
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 7: Proje Düzeyi question_answers İzolasyonu ---");

  // Proje düzeyinde genel bir cevap kaydedelim
  await saveAnswer(
    p1Id,
    "OT_INDUSTRIAL_DATA",
    "tr.ot_industrial_data.core",
    "0.1.0",
    "OTD-001",
    {
      selected: [{ value: "OTD_001_PLANT_WIDE" }],
      general_note: "Tesis geneli keşif cevabı",
    }
  );

  const projectLevelAnswers = await getAllAnswers(p1Id, "OT_INDUSTRIAL_DATA");
  assert(projectLevelAnswers.get("OTD-001")?.selected?.[0]?.value === "OTD_001_PLANT_WIDE", "Proje düzeyi genel cevap question_answers tablosunda korundu.");

  // İstasyon cevaplarını tekrar kontrol et: Proje cevabından etkilenmemiş olmalı
  const st1AnsCheck = await getOtStationAnswer(p1Id, st1.id, "OTD-001");
  assert(st1AnsCheck?.selected?.[0]?.value === "OTD_001_OEE", "İstasyon 1 cevabı proje düzeyi cevaptan tamamen izole kaldı.");

  // -------------------------------------------------------------------------
  // TEST 8: İstasyon Cevabı Güncelleme (UPSERT)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 8: İstasyon Cevabı UPSERT ---");

  await saveOtStationAnswer(
    p1Id,
    st1.id,
    "OTD-001",
    {
      selected: [{ value: "OTD_001_ENERGY" }],
      general_note: "ST-01 hedefi enerji optimizasyonuna güncellendi.",
    }
  );

  const updatedSt1Ans = await getOtStationAnswer(p1Id, st1.id, "OTD-001");
  assert(updatedSt1Ans?.selected?.[0]?.value === "OTD_001_ENERGY", "İstasyon 1 cevabı OTD_001_ENERGY olarak güncellendi.");

  const st2AnsCheck = await getOtStationAnswer(p1Id, st2.id, "OTD-001");
  assert(st2AnsCheck?.selected?.[0]?.value === "OTD_001_QUALITY", "İstasyon 2 cevabı bu güncellemeden etkilenmedi.");

  // -------------------------------------------------------------------------
  // TEST 9: İstasyon Silme ve Cascade Cevap Temizliği
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 9: İstasyon Silme & Cascade Cevap Temizliği ---");

  // ST-03 oluşturalım ve cevap yazalım
  const st3 = await createOtStation({
    project_id: p1Id,
    station_code: "ST-03",
    station_name: "Kalite Ölçüm Cihazı (CMM)",
    area_name: "Kalite Kontrol",
    status: "active",
    sort_order: 3,
  });

  await saveOtStationAnswer(
    p1Id,
    st3.id,
    "OTD-010",
    { selected: [{ value: "OTD_010_CMM" }] }
  );

  const st3AnswersBefore = await getOtStationAnswers(p1Id, st3.id);
  assert(st3AnswersBefore.size === 1, "ST-03 cevabı silinmeden önce mevcut.");

  await deleteOtStation(st3.id);

  const st3Get = await getOtStationById(st3.id);
  assert(st3Get === null, "ST-03 ot_stations tablosundan silindi.");

  const st3AnswersAfter = await getOtStationAnswers(p1Id, st3.id);
  assert(st3AnswersAfter.size === 0, "ST-03 silindiğinde ona bağlı cevaplar cascade ile temizlendi.");

  // ST-01 ve ST-02 sağlam mı?
  const stList = await getOtStations(p1Id);
  assert(stList.length === 2, "Projede 2 istasyon (ST-01 ve ST-02) kaldı.");

  // -------------------------------------------------------------------------
  // TEST 10: İstasyon Özet İstatistikleri (getOtStationsSummary)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 10: İstasyon Özet İstatistikleri ---");

  await toggleOtStationStatus(st2.id, "passive");
  const summaryStats = await getOtStationsSummary(p1Id);

  assert(summaryStats.totalStations === 2, "Toplam 2 istasyon.");
  assert(summaryStats.activeStations === 1, "1 aktif istasyon (ST-01).");
  assert(summaryStats.passiveStations === 1, "1 pasif istasyon (ST-02).");
  assert(summaryStats.areaCount === 2, "2 farklı üretim alanı (Talaşlı İmalat, Gövde Kaynak).");
  assert(summaryStats.lineCount === 2, "2 farklı üretim hattı (İşleme Hattı 1, Robotik Hat 1).");

  await toggleOtStationStatus(st2.id, "active"); // Tekrar aktif yapalım

  // -------------------------------------------------------------------------
  // TEST 11: ReportModel & Rapor Entegrasyonu
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 11: ReportModel & Rapor Entegrasyonu ---");

  const report = await buildReportModel(p1Id);
  assert(report.otStationsSummary !== undefined, "ReportModel otStationsSummary alanını içeriyor.");
  assert(report.otStationsSummary?.totalStations === 2, "Rapor modelinde toplam 2 istasyon yer aldı.");
  assert(report.otStationsSummary?.activeStations === 2, "Rapor modelinde 2 aktif istasyon yer aldı.");
  assert(report.otStationsSummary?.stations.length === 2, "Rapor modelinde 2 istasyon kaydı listelendi.");
  assert(report.otStationsSummary?.stations[0].stationCode === "ST-01", "İlk istasyon kodu ST-01.");
  assert(report.otStationsSummary?.stations[0].status === "Aktif", "İlk istasyon durumu 'Aktif' etiketiyle formatlandı.");

  // -------------------------------------------------------------------------
  // TEST 12: DOCX Rapor Üretimi Uyumluluğu
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 12: DOCX Rapor Üretimi ---");

  const docxBuffer = await buildDocxBuffer(report);
  assert(docxBuffer instanceof Uint8Array || Buffer.isBuffer(docxBuffer), "buildDocxBuffer geçerli veri nesnesi üretti.");
  assert(docxBuffer.length > 5000, `DOCX dosya boyutu geçerli (${docxBuffer.length} bayt).`);

  // -------------------------------------------------------------------------
  // TEST 13: PDF Rapor Üretimi ve Türkçe Karakter Uyumluluğu
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 13: PDF Rapor Üretimi & Türkçe Karakter Denetimi ---");

  const pdfBuffer = await buildPdfBuffer(report);
  assert(pdfBuffer instanceof Uint8Array, "buildPdfBuffer geçerli Uint8Array üretti.");
  assert(pdfBuffer.length > 5000, `PDF dosya boyutu geçerli (${pdfBuffer.length} bayt).`);

  const parser = new PDFParse({ data: pdfBuffer });
  const parsedPdf = await parser.getText();
  assert(parsedPdf.text.includes("3.2 Saha İstasyonları ve Makine Envanteri (OT/IT)"), "PDF çıktısı Bölüm 3.2 başlığını içeriyor.");
  assert(parsedPdf.text.includes("ST-01"), "PDF çıktısı ST-01 istasyon kodunu içeriyor.");
  assert(parsedPdf.text.includes("ST-02"), "PDF çıktısı ST-02 istasyon kodunu içeriyor.");

  // -------------------------------------------------------------------------
  // TEST 14: Taşınabilir Arşiv (.erpcrm Schema 14) Export & Restore
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 14: Taşınabilir Arşiv Export & Restore ---");

  assert(BACKUP_CURRENT_SCHEMA_VERSION === 14, "Yedekleme şema sürümü Schema 14 olarak mühürlendi.");

  const exportResult = await exportProjectBackup(p1Id);
  assert(exportResult.manifest.schemaVersion === 14, "Export manifesti schemaVersion 14 içeriyor.");
  assert(exportResult.manifest.recordCounts.otStations === 2, "Manifest recordCounts.otStations === 2.");
  assert(exportResult.manifest.recordCounts.otStationAnswers === 2, "Manifest recordCounts.otStationAnswers === 2.");

  const restoreResult = await restoreProjectBackup(exportResult.buffer, {
    newProjectName: "Restore Edilen OT Projesi",
  });

  assert(restoreResult.success === true, "Proje geri yükleme başarılı.");
  const restoredProjectId = restoreResult.newProjectId!;

  const restoredStations = await getOtStations(restoredProjectId);
  assert(restoredStations.length === 2, "Geri yüklenen projede 2 istasyon başarıyla oluşturuldu.");
  assert(restoredStations[0].station_code === "ST-01", "Geri yüklenen projede ST-01 istasyonu mevcut.");
  assert(restoredStations[0].id !== st1.id, "Geri yüklenen istasyon yeni bir UUID aldı.");

  // Geri yüklenen istasyon cevaplarını kontrol et
  const restoredSt1Answers = await getOtStationAnswers(restoredProjectId, restoredStations[0].id);
  assert(restoredSt1Answers.size === 1, "Geri yüklenen ST-01 için 1 cevap bulundu.");
  assert(restoredSt1Answers.get("OTD-001")?.selected?.[0]?.value === "OTD_001_ENERGY", "Geri yüklenen cevap doğru aktarıldı.");

  // -------------------------------------------------------------------------
  // TEST 15: Şablon Çoğaltma (copyAnswers: false)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 15: Şablon Çoğaltma ---");

  const templateDup = await duplicateProject(p1Id, {
    newProjectName: "OT Şablon Projesi",
    copyAnswersAndAttachments: false,
  });

  assert(templateDup.success === true, "Şablon çoğaltma başarılı.");
  const templateStations = await getOtStations(templateDup.newProjectId);
  assert(templateStations.length === 2, "Şablon projede istasyon yapılandırması (2 istasyon) korundu.");

  const templateSt1Answers = await getOtStationAnswers(templateDup.newProjectId, templateStations[0].id);
  assert(templateSt1Answers.size === 0, "Şablon projede istasyon cevapları sıfırlandı (0 cevap).");

  // -------------------------------------------------------------------------
  // TEST 16: Tam Klon Çoğaltma (copyAnswers: true)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 16: Tam Klon Çoğaltma ---");

  const fullClone = await duplicateProject(p1Id, {
    newProjectName: "OT Tam Klon Projesi",
    copyAnswersAndAttachments: true,
  });

  assert(fullClone.success === true, "Tam klon çoğaltma başarılı.");
  const cloneStations = await getOtStations(fullClone.newProjectId);
  assert(cloneStations.length === 2, "Klon projede 2 istasyon korundu.");

  const cloneSt1Answers = await getOtStationAnswers(fullClone.newProjectId, cloneStations[0].id);
  assert(cloneSt1Answers.size === 1, "Klon projede istasyon cevapları da kopyalandı.");
  assert(cloneSt1Answers.get("OTD-001")?.selected?.[0]?.value === "OTD_001_ENERGY", "Klonlanan cevap doğru eşleşti.");

  // -------------------------------------------------------------------------
  // TEST 17: AI-Free, Zero Cloud & Offline-First Güvencesi
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 17: AI-Free & Offline-First Doğrulaması ---");

  const stationModalSrc = fs.readFileSync(path.join(process.cwd(), "src/components/modals/OtStationModal.tsx"), "utf8");
  const stationsSectionSrc = fs.readFileSync(path.join(process.cwd(), "src/components/OtStationsSection.tsx"), "utf8");

  assert(!stationModalSrc.includes("openai") && !stationModalSrc.includes("gemini") && !stationModalSrc.includes("anthropic"), "OtStationModal'da harici AI API çağrısı yok.");
  assert(!stationsSectionSrc.includes("fetch(") && !stationsSectionSrc.includes("http://") && !stationsSectionSrc.includes("https://"), "OtStationsSection'da harici bulut/ağ çağrısı yok.");
  assert(!stationModalSrc.includes("alert("), "OtStationModal'da native alert() kullanılmadı.");
  assert(!stationsSectionSrc.includes("alert("), "OtStationsSection'da native alert() kullanılmadı.");

  // -------------------------------------------------------------------------
  // Özet
  // -------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`FAZ-62B Test Sonucu: ${passCount} Geçti, ${failCount} Kaldı`);
  console.log("================================================================================\n");

  adapter.close();
  resetDbInstanceForTesting();

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test paketi çalıştırılırken beklenmeyen hata:", err);
  process.exit(1);
});
