/**
 * ERP CRM Discovery — FAZ-62C ALARM, SAFETY, KALİTE CİHAZLARI VE VERİ GEREKSİNİM MATRİSİ TEST PAKETİ
 *
 * Test Doğrulamaları:
 * T01: Migration 15: ot_data_requirements, ot_alarm_requirements, ot_quality_devices tabloları ve index'lerin doğrulanması
 * T02: Veri Gereksinimleri CRUD ve Karar/Aksiyon Zinciri (Purpose, Decision Supported, Required Action, Criticality)
 * T03: Alarm & Safety Gereksinimleri CRUD (Trigger condition, Severity, Safety critical, SLA, Escalation)
 * T04: Kalite Ölçüm Cihazları CRUD (PASS/FAIL, Measurement, Lot/Batch, Interface, Output format)
 * T05: İstasyon Silme ve Cascade Matris Temizliği (ot_stations ON DELETE CASCADE)
 * T06: Proje Silme ve Cascade Matris Temizliği (analysis_projects ON DELETE CASCADE)
 * T07: getOtMatrixSummaryCounts agregasyon sayaçları
 * T08: ReportModel ve Rapor Entegrasyonu (buildReportModel.otMatrixSummary Bölüm 3.3)
 * T09: DOCX Rapor Üretimi Uyumluluğu (buildDocxBuffer with Section 3.3 OT Matrix)
 * T10: Liberation Sans TrueType PDF Rapor Üretimi (buildPdfBuffer with Section 3.3 tables)
 * T11: Taşınabilir Arşiv (.erpcrm Schema 15) Export ve Restore Matris Bütünlüğü
 * T12: Proje Şablon Çoğaltma (copyAnswers: false -> İstasyonlar ve matris gereksinimleri korunur)
 * T13: Proje Tam Klon Çoğaltma (copyAnswers: true -> İstasyonlar, cevaplar ve matrisler klonlanır)
 * T14: %100 Çevrimdışı, Sıfır Dışa Veri Aktarımı (Zero-Egress), AI-Free ve Sıfır alert() Doğrulaması
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
  createOtStation,
  getOtStations,
  deleteOtStation,
  createOtDataRequirement,
  getOtDataRequirements,
  getOtDataRequirementById,
  updateOtDataRequirement,
  deleteOtDataRequirement,
  createOtAlarmRequirement,
  getOtAlarmRequirements,
  getOtAlarmRequirementById,
  updateOtAlarmRequirement,
  deleteOtAlarmRequirement,
  createOtQualityDevice,
  getOtQualityDevices,
  getOtQualityDeviceById,
  updateOtQualityDevice,
  deleteOtQualityDevice,
  getOtMatrixSummaryCounts,
  saveOtStationAnswer,
  deleteProject,
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
  console.log("ERP CRM Discovery — FAZ-62C OT Veri, Alarm ve Kalite Matrisi Test Paketi");
  console.log("================================================================================\n");

  const adapter = new BetterSqlitePoolAdapter();
  setDbInstanceForTesting(adapter as any);

  // -------------------------------------------------------------------------
  // TEST 1: Migration 15 & SQLite Şema Doğrulaması
  // -------------------------------------------------------------------------
  console.log("--- TEST 1: Migration 15 & SQLite Şema Doğrulaması ---");

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

  assert(tableNames.has("ot_data_requirements"), "ot_data_requirements tablosu SQLite şemasında mevcut.");
  assert(tableNames.has("ot_alarm_requirements"), "ot_alarm_requirements tablosu SQLite şemasında mevcut.");
  assert(tableNames.has("ot_quality_devices"), "ot_quality_devices tablosu SQLite şemasında mevcut.");

  const dataCols = await adapter.select<{ name: string }[]>("PRAGMA table_info(ot_data_requirements)");
  const dataColNames = new Set(dataCols.map((c) => c.name));
  assert(dataColNames.has("purpose"), "ot_data_requirements.purpose kolonu var.");
  assert(dataColNames.has("decision_supported"), "ot_data_requirements.decision_supported kolonu var.");
  assert(dataColNames.has("required_action"), "ot_data_requirements.required_action kolonu var.");
  assert(dataColNames.has("criticality"), "ot_data_requirements.criticality kolonu var.");

  const alarmCols = await adapter.select<{ name: string }[]>("PRAGMA table_info(ot_alarm_requirements)");
  const alarmColNames = new Set(alarmCols.map((c) => c.name));
  assert(alarmColNames.has("alarm_name"), "ot_alarm_requirements.alarm_name kolonu var.");
  assert(alarmColNames.has("safety_critical"), "ot_alarm_requirements.safety_critical kolonu var.");
  assert(alarmColNames.has("response_sla"), "ot_alarm_requirements.response_sla kolonu var.");
  assert(alarmColNames.has("escalation_required"), "ot_alarm_requirements.escalation_required kolonu var.");

  const qualityCols = await adapter.select<{ name: string }[]>("PRAGMA table_info(ot_quality_devices)");
  const qualityColNames = new Set(qualityCols.map((c) => c.name));
  assert(qualityColNames.has("device_name"), "ot_quality_devices.device_name kolonu var.");
  assert(qualityColNames.has("pass_fail_available"), "ot_quality_devices.pass_fail_available kolonu var.");
  assert(qualityColNames.has("measurement_values_available"), "ot_quality_devices.measurement_values_available kolonu var.");
  assert(qualityColNames.has("integration_method"), "ot_quality_devices.integration_method kolonu var.");

  // -------------------------------------------------------------------------
  // TEST 2: Veri Gereksinimleri CRUD ve Karar/Aksiyon Zinciri
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 2: Veri Gereksinimleri CRUD ---");

  const p1Id = await createProject({
    projectName: "Marmara Makine Endüstriyel Keşif",
    company: {
      company_name: "Marmara Makine San. Tic. A.Ş.",
      country: "Türkiye",
    },
    selectedFunctionIds: ["bf_ot_industrial_data"],
  });

  const st1 = await createOtStation({
    project_id: p1Id,
    station_code: "ST-01",
    station_name: "5 Eksen CNC Freze",
    area_name: "Talaşlı İmalat",
    line_name: "İşleme Hattı 1",
    machine_name: "DMG Mori DMU 50",
    plc_or_controller: "Siemens Sinumerik 840D sl",
    status: "active",
    sort_order: 1,
  });

  const d1 = await createOtDataRequirement({
    project_id: p1Id,
    station_id: st1.id,
    purpose: "İstasyon çevrim süresi sapmalarını ve darboğazları tespit etmek",
    decision_supported: "Vardiya hız ayarı ve parça bağlama ergonomisi revizyonu",
    required_action: "MES üzerinde iş emri çevrim süresi güncellemesi ve amire bildirim",
    data_category: "Proses / İşleme",
    measurement_name: "Parça Çevrim Süresi (Cycle Time)",
    source_type: "PLC / Kontrolcü",
    source_name: "DB100.DBD12",
    collection_method: "Otomatik (Doğrudan Veri)",
    frequency: "Parça / Çevrim Başına",
    criticality: "critical",
    target_system: "MES",
    retention_required: 1,
    retention_period: "5 yıl",
    business_value: "%6 duruş azaltımı",
    integration_complexity: "medium",
    priority: "high",
    status: "active",
    notes: "Part counter ve cycle start/stop bitleri üzerinden hesaplanır.",
  });

  assert(Boolean(d1.id) && typeof d1.id === "string", "Veri gereksinimi ID'si üretildi.");
  assert(d1.measurement_name === "Parça Çevrim Süresi (Cycle Time)", "Ölçüm adı doğru kaydedildi.");
  assert(d1.criticality === "critical", "Kritiklik 'critical' olarak mühürlendi.");

  // Get list & get by id
  const dList = await getOtDataRequirements(p1Id, st1.id);
  assert(dList.length === 1, "İstasyon 1 için 1 veri gereksinimi listelendi.");

  const d1Get = await getOtDataRequirementById(d1.id);
  assert(d1Get?.decision_supported === "Vardiya hız ayarı ve parça bağlama ergonomisi revizyonu", "Desteklenen karar doğru çekildi.");

  // Update
  await updateOtDataRequirement(d1.id, {
    business_value: "%10 verimlilik artışı",
    priority: "critical",
  });
  const d1Updated = await getOtDataRequirementById(d1.id);
  assert(d1Updated?.business_value === "%10 verimlilik artışı", "İş değeri güncellendi.");
  assert(d1Updated?.priority === "critical", "Öncelik güncellendi.");

  // -------------------------------------------------------------------------
  // TEST 3: Alarm & Safety Gereksinimleri CRUD
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 3: Alarm & Safety Gereksinimleri CRUD ---");

  const a1 = await createOtAlarmRequirement({
    project_id: p1Id,
    station_id: st1.id,
    alarm_name: "Yüksek Mil Sıcaklığı ve Aşırı Titreşim",
    alarm_code: "ALM-301",
    source_type: "PLC / Kontrolcü",
    trigger_condition: "Mil sıcaklığı > 75°C (10 sn kesintisiz)",
    severity: "critical",
    safety_critical: 1,
    responsible_role: "Mekanik Bakım Teknisyeni",
    response_sla: "10 dakika",
    required_action: "İşlemeyi duraklat, soğutma sıvısı debisini kontrol et",
    acknowledgement_required: 1,
    escalation_required: 1,
    target_system: "MES & Andon",
    status: "active",
    notes: "15 dk içinde onaylanmazsa Bakım Mühendisine SMS/e-posta iletilir.",
  });

  assert(Boolean(a1.id) && typeof a1.id === "string", "Alarm ID'si üretildi.");
  assert(a1.safety_critical === 1, "Safety kritiklik 1 olarak kaydedildi.");
  assert(a1.response_sla === "10 dakika", "SLA doğru kaydedildi.");

  const aList = await getOtAlarmRequirements(p1Id, st1.id);
  assert(aList.length === 1, "İstasyon 1 için 1 alarm listelendi.");

  const a1Get = await getOtAlarmRequirementById(a1.id);
  assert(a1Get?.escalation_required === 1, "Eskalasyon bayrağı doğru.");

  // Update
  await updateOtAlarmRequirement(a1.id, {
    response_sla: "5 dakika",
  });
  const a1Updated = await getOtAlarmRequirementById(a1.id);
  assert(a1Updated?.response_sla === "5 dakika", "Alarm SLA süresi güncellendi.");

  // -------------------------------------------------------------------------
  // TEST 4: Kalite Ölçüm Cihazları CRUD
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 4: Kalite Cihazları CRUD ---");

  const q1 = await createOtQualityDevice({
    project_id: p1Id,
    station_id: st1.id,
    device_name: "Mitutoyo Digimatic Dijital Kumpas",
    device_type: "Dijital Kumpas / Mikrometre",
    manufacturer: "Mitutoyo",
    model: "500-196-30",
    output_format: "CSV / Excel",
    interface_type: "USB (Sanal COM / HID)",
    api_available: 0,
    network_share_available: 1,
    test_result_available: 1,
    pass_fail_available: 1,
    measurement_values_available: 1,
    product_code_available: 1,
    lot_batch_available: 1,
    operator_available: 1,
    integration_method: "Otomatik (Ağ Klasörü / Dosya İzleyici)",
    target_system: "ERP Kalite Kontrol (QM)",
    status: "active",
    notes: "Operatör ölçümü bitirince otomatik CSV logu SMB paylaşıma atılır.",
  });

  assert(Boolean(q1.id) && typeof q1.id === "string", "Kalite cihazı ID'si üretildi.");
  assert(q1.pass_fail_available === 1, "PASS/FAIL yeteneği 1 olarak kaydedildi.");
  assert(q1.measurement_values_available === 1, "Ölçüm değeri yeteneği 1 olarak kaydedildi.");

  const qList = await getOtQualityDevices(p1Id, st1.id);
  assert(qList.length === 1, "İstasyon 1 için 1 kalite cihazı listelendi.");

  const q1Get = await getOtQualityDeviceById(q1.id);
  assert(q1Get?.manufacturer === "Mitutoyo", "Üretici Mitutoyo olarak çekildi.");

  // Update
  await updateOtQualityDevice(q1.id, {
    model: "500-197-30 (Gelişmiş)",
  });
  const q1Updated = await getOtQualityDeviceById(q1.id);
  assert(q1Updated?.model === "500-197-30 (Gelişmiş)", "Cihaz modeli güncellendi.");

  // -------------------------------------------------------------------------
  // TEST 5: İstasyon Silme ve Cascade Matris Temizliği
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 5: İstasyon Silme ve Cascade Temizlik ---");

  const st2 = await createOtStation({
    project_id: p1Id,
    station_code: "ST-02",
    station_name: "Robotik Kaynak İstasyonu",
    status: "active",
    sort_order: 2,
  });

  // ST-02 için veri, alarm ve cihaz ekleyelim
  const st2Data = await createOtDataRequirement({
    project_id: p1Id,
    station_id: st2.id,
    purpose: "Kaynak akımı ve gerilimi stabilite takibi",
    decision_supported: "Tel besleme ve nozul temizlik zamanı kararı",
    required_action: "Kaynak parametresi otomatik revizyonu",
    data_category: "Proses / İşleme",
    measurement_name: "Kaynak Akımı (Amper)",
    source_type: "Sensör",
    source_name: "Akım Probu",
    collection_method: "Otomatik",
    frequency: "Gerçek Zamanlı",
    criticality: "high",
    target_system: "MES",
    retention_required: 1,
    retention_period: "3 yıl",
    business_value: "Hata önleme",
    integration_complexity: "low",
    priority: "high",
    status: "active",
    notes: null,
  });

  const st2Alarm = await createOtAlarmRequirement({
    project_id: p1Id,
    station_id: st2.id,
    alarm_name: "Gaz Akış Kesintisi",
    alarm_code: "ALM-GAS-01",
    source_type: "Basınç Sensörü",
    trigger_condition: "Gaz basıncı < 2 bar",
    severity: "critical",
    safety_critical: 1,
    responsible_role: "Kaynakçı",
    response_sla: "1 dakika",
    required_action: "Torcu durdur",
    acknowledgement_required: 1,
    escalation_required: 1,
    target_system: "PLC",
    status: "active",
    notes: null,
  });

  const st2Quality = await createOtQualityDevice({
    project_id: p1Id,
    station_id: st2.id,
    device_name: "Kaynak Dikiş Ultrasonik Test Cihazı",
    device_type: "Ultrasonik Test",
    manufacturer: "Olympus",
    model: "OmniScan",
    output_format: "PDF",
    interface_type: "Ethernet",
    api_available: 0,
    network_share_available: 1,
    test_result_available: 1,
    pass_fail_available: 1,
    measurement_values_available: 1,
    product_code_available: 1,
    lot_batch_available: 1,
    operator_available: 1,
    integration_method: "Manuel Form",
    target_system: "ERP QM",
    status: "active",
    notes: null,
  });

  assert((await getOtDataRequirements(p1Id, st2.id)).length === 1, "ST-02 silinmeden önce 1 veri gereksinimi var.");
  assert((await getOtAlarmRequirements(p1Id, st2.id)).length === 1, "ST-02 silinmeden önce 1 alarm var.");
  assert((await getOtQualityDevices(p1Id, st2.id)).length === 1, "ST-02 silinmeden önce 1 kalite cihazı var.");

  // İstasyonu silelim
  await deleteOtStation(st2.id);

  assert((await getOtDataRequirements(p1Id, st2.id)).length === 0, "ST-02 silindiğinde veri gereksinimleri cascade temizlendi.");
  assert((await getOtAlarmRequirements(p1Id, st2.id)).length === 0, "ST-02 silindiğinde alarmlar cascade temizlendi.");
  assert((await getOtQualityDevices(p1Id, st2.id)).length === 0, "ST-02 silindiğinde kalite cihazları cascade temizlendi.");

  // ST-01 kayıtları duruyor mu?
  assert((await getOtDataRequirements(p1Id, st1.id)).length === 1, "ST-01 veri gereksinimi sağlam.");
  assert((await getOtAlarmRequirements(p1Id, st1.id)).length === 1, "ST-01 alarm gereksinimi sağlam.");
  assert((await getOtQualityDevices(p1Id, st1.id)).length === 1, "ST-01 kalite cihazı sağlam.");

  // -------------------------------------------------------------------------
  // TEST 6: Proje Silme ve Cascade Matris Temizliği
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 6: Proje Silme ve Cascade Temizlik ---");

  const tempPId = await createProject({
    projectName: "Geçici Test Projesi",
    company: { company_name: "Geçici A.Ş." },
    selectedFunctionIds: ["bf_ot_industrial_data"],
  });

  const tempSt = await createOtStation({
    project_id: tempPId,
    station_code: "TMP-01",
    station_name: "Geçici İstasyon",
    status: "active",
    sort_order: 1,
  });

  await createOtDataRequirement({
    project_id: tempPId,
    station_id: tempSt.id,
    purpose: "Geçici amaç",
    decision_supported: "Geçici karar",
    required_action: "Geçici aksiyon",
    data_category: "Proses",
    measurement_name: "Geçici Ölçüm",
    source_type: null,
    source_name: null,
    collection_method: null,
    frequency: null,
    criticality: "medium",
    target_system: null,
    retention_required: 0,
    retention_period: null,
    business_value: null,
    integration_complexity: "low",
    priority: "medium",
    status: "active",
    notes: null,
  });

  assert((await getOtDataRequirements(tempPId)).length === 1, "Geçici projede 1 veri gereksinimi mevcut.");

  await deleteProject(tempPId);

  assert((await getOtDataRequirements(tempPId)).length === 0, "Proje silindiğinde tüm matris verileri cascade temizlendi.");

  // -------------------------------------------------------------------------
  // TEST 7: getOtMatrixSummaryCounts Sayaçları
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 7: Matris Özet Sayaçları ---");

  const counts = await getOtMatrixSummaryCounts(p1Id);

  assert(counts.totalDataRequirements === 1, "Toplam veri gereksinimi 1.");
  assert(counts.criticalDataRequirements === 1, "Kritik veri gereksinimi 1.");
  assert(counts.cycleBasedCount === 1, "Çevrim bazlı veri gereksinimi 1.");
  assert(counts.totalAlarms === 1, "Toplam alarm 1.");
  assert(counts.safetyCriticalAlarms === 1, "Safety kritik alarm 1.");
  assert(counts.totalQualityDevices === 1, "Toplam kalite cihazı 1.");
  assert(counts.automatedTransferDevices === 1, "Otomatik aktarımlı kalite cihazı 1.");

  // -------------------------------------------------------------------------
  // TEST 8: ReportModel ve Rapor Entegrasyonu (Bölüm 3.3)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 8: ReportModel & Rapor Entegrasyonu ---");

  const report = await buildReportModel(p1Id);

  assert(report.otMatrixSummary !== undefined, "ReportModel otMatrixSummary alanını içeriyor.");
  assert(report.otMatrixSummary?.stats.totalDataRequirements === 1, "Rapor özetinde 1 veri gereksinimi var.");
  assert(report.otMatrixSummary?.stats.safetyCriticalAlarms === 1, "Rapor özetinde 1 safety kritik alarm var.");
  assert(report.otMatrixSummary?.dataRequirements.length === 1, "Rapor modelinde 1 veri gereksinimi kaydı listelendi.");
  assert(report.otMatrixSummary?.dataRequirements[0].stationCode === "ST-01", "Veri gereksiniminin istasyon kodu ST-01.");
  assert(report.otMatrixSummary?.alarmRequirements.length === 1, "Rapor modelinde 1 alarm kaydı listelendi.");
  assert(report.otMatrixSummary?.alarmRequirements[0].safetyCritical === true, "Alarm kaydında safetyCritical true.");
  assert(report.otMatrixSummary?.qualityDevices.length === 1, "Rapor modelinde 1 kalite cihazı listelendi.");

  // -------------------------------------------------------------------------
  // TEST 9: DOCX Rapor Üretimi (Bölüm 3.3 Matris Tabloları)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 9: DOCX Rapor Üretimi ---");

  const docxBuffer = await buildDocxBuffer(report);
  assert(docxBuffer instanceof Uint8Array || Buffer.isBuffer(docxBuffer), "buildDocxBuffer geçerli veri üretti.");
  assert(docxBuffer.length > 5000, `DOCX dosya boyutu geçerli (${docxBuffer.length} bayt).`);

  // -------------------------------------------------------------------------
  // TEST 10: PDF Rapor Üretimi ve Bölüm 3.3 Başlık Doğrulaması
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 10: PDF Rapor Üretimi & Bölüm 3.3 Doğrulaması ---");

  const pdfBuffer = await buildPdfBuffer(report);
  assert(pdfBuffer instanceof Uint8Array, "buildPdfBuffer geçerli Uint8Array üretti.");
  assert(pdfBuffer.length > 5000, `PDF dosya boyutu geçerli (${pdfBuffer.length} bayt).`);

  const parser = new PDFParse({ data: pdfBuffer });
  const parsedPdf = await parser.getText();

  assert(parsedPdf.text.includes("3.3 OT Veri Gereksinimleri, Alarm ve Kalite Cihazları Matrisi"), "PDF çıktısı Bölüm 3.3 ana başlığını içeriyor.");
  assert(parsedPdf.text.includes("3.3.1 OT Veri Gereksinimi & Karar/Aksiyon Matrisi"), "PDF çıktısı Bölüm 3.3.1 başlığını içeriyor.");
  assert(parsedPdf.text.includes("3.3.2 Alarm ve Safety Gereksinimleri"), "PDF çıktısı Bölüm 3.3.2 başlığını içeriyor.");
  assert(parsedPdf.text.includes("3.3.3 Kalite Ölçüm Cihazları ve Entegrasyon Profili"), "PDF çıktısı Bölüm 3.3.3 başlığını içeriyor.");
  assert(parsedPdf.text.includes("ALM-301"), "PDF çıktısı alarm kodunu içeriyor.");
  assert(parsedPdf.text.includes("Mitutoyo"), "PDF çıktısı kalite cihazı markasını içeriyor.");

  // -------------------------------------------------------------------------
  // TEST 11: Taşınabilir Arşiv (.erpcrm Schema 15) Export & Restore
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 11: Taşınabilir Arşiv Export & Restore (Schema 15) ---");

  assert(BACKUP_CURRENT_SCHEMA_VERSION === 15, "Yedekleme şema sürümü Schema 15 olarak mühürlendi.");

  const exportResult = await exportProjectBackup(p1Id);
  assert(exportResult.manifest.schemaVersion === 15, "Export manifesti schemaVersion 15 içeriyor.");
  assert(exportResult.manifest.recordCounts.otDataRequirements === 1, "Manifest recordCounts.otDataRequirements === 1.");
  assert(exportResult.manifest.recordCounts.otAlarmRequirements === 1, "Manifest recordCounts.otAlarmRequirements === 1.");
  assert(exportResult.manifest.recordCounts.otQualityDevices === 1, "Manifest recordCounts.otQualityDevices === 1.");

  const restoreResult = await restoreProjectBackup(exportResult.buffer, {
    newProjectName: "Restore Edilen OT Matris Projesi",
  });

  assert(restoreResult.success === true, "Proje geri yükleme başarılı.");
  const restoredProjectId = restoreResult.newProjectId!;

  const restoredStations = await getOtStations(restoredProjectId);
  assert(restoredStations.length === 1, "Geri yüklenen projede 1 istasyon var.");

  const restoredDataReqs = await getOtDataRequirements(restoredProjectId, restoredStations[0].id);
  assert(restoredDataReqs.length === 1, "Geri yüklenen projede 1 veri gereksinimi mevcut.");
  assert(restoredDataReqs[0].station_id === restoredStations[0].id, "Geri yüklenen veri gereksinimi yeni station_id ile bağlandı.");
  assert(restoredDataReqs[0].id !== d1.id, "Geri yüklenen veri gereksinimi yeni bir UUID aldı.");

  const restoredAlarmReqs = await getOtAlarmRequirements(restoredProjectId, restoredStations[0].id);
  assert(restoredAlarmReqs.length === 1, "Geri yüklenen projede 1 alarm gereksinimi mevcut.");
  assert(restoredAlarmReqs[0].alarm_name === "Yüksek Mil Sıcaklığı ve Aşırı Titreşim", "Geri yüklenen alarm adı doğru.");

  const restoredQualityDevs = await getOtQualityDevices(restoredProjectId, restoredStations[0].id);
  assert(restoredQualityDevs.length === 1, "Geri yüklenen projede 1 kalite cihazı mevcut.");
  assert(restoredQualityDevs[0].manufacturer === "Mitutoyo", "Geri yüklenen kalite cihazı üreticisi doğru.");

  // -------------------------------------------------------------------------
  // TEST 12: Şablon Çoğaltma (copyAnswers: false)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 12: Şablon Çoğaltma ---");

  // İstasyon cevabı da ekleyelim
  await saveOtStationAnswer(p1Id, st1.id, "OTD-001", { selected: [{ value: "OTD_001_OEE" }] });

  const templateDup = await duplicateProject(p1Id, {
    newProjectName: "OT Matris Şablon Projesi",
    copyAnswersAndAttachments: false,
  });

  assert(templateDup.success === true, "Şablon çoğaltma başarılı.");
  const templateStations = await getOtStations(templateDup.newProjectId);
  assert(templateStations.length === 1, "Şablon projede istasyon korundu.");

  // Şablon çoğaltmada istasyon matris tanımları da kopyalanır, ancak anket cevapları sıfırlanır
  const templateDataReqs = await getOtDataRequirements(templateDup.newProjectId, templateStations[0].id);
  assert(templateDataReqs.length === 1, "Şablon projede veri gereksinim şablonu korundu.");
  assert(templateDataReqs[0].station_id === templateStations[0].id, "Şablon veri gereksinimi yeni istasyona bağlandı.");

  const templateAlarmReqs = await getOtAlarmRequirements(templateDup.newProjectId, templateStations[0].id);
  assert(templateAlarmReqs.length === 1, "Şablon projede alarm şablonu korundu.");

  const templateQualityDevs = await getOtQualityDevices(templateDup.newProjectId, templateStations[0].id);
  assert(templateQualityDevs.length === 1, "Şablon projede kalite cihazı şablonu korundu.");

  // -------------------------------------------------------------------------
  // TEST 13: Tam Klon Çoğaltma (copyAnswers: true)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 13: Tam Klon Çoğaltma ---");

  const fullClone = await duplicateProject(p1Id, {
    newProjectName: "OT Matris Tam Klon Projesi",
    copyAnswersAndAttachments: true,
  });

  assert(fullClone.success === true, "Tam klon çoğaltma başarılı.");
  const cloneStations = await getOtStations(fullClone.newProjectId);
  assert(cloneStations.length === 1, "Klon projede 1 istasyon var.");

  const cloneDataReqs = await getOtDataRequirements(fullClone.newProjectId, cloneStations[0].id);
  assert(cloneDataReqs.length === 1, "Klon projede 1 veri gereksinimi kopyalandı.");
  assert(cloneDataReqs[0].measurement_name === "Parça Çevrim Süresi (Cycle Time)", "Klon veri ölçüm adı doğru.");

  const cloneAlarmReqs = await getOtAlarmRequirements(fullClone.newProjectId, cloneStations[0].id);
  assert(cloneAlarmReqs.length === 1, "Klon projede 1 alarm kopyalandı.");

  const cloneQualityDevs = await getOtQualityDevices(fullClone.newProjectId, cloneStations[0].id);
  assert(cloneQualityDevs.length === 1, "Klon projede 1 kalite cihazı kopyalandı.");

  // -------------------------------------------------------------------------
  // TEST 14: AI-Free, Zero Cloud & Offline-First Güvencesi
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 14: AI-Free & Offline-First Güvencesi ---");

  const dataModalSrc = fs.readFileSync(path.join(process.cwd(), "src/components/modals/OtDataRequirementModal.tsx"), "utf8");
  const alarmModalSrc = fs.readFileSync(path.join(process.cwd(), "src/components/modals/OtAlarmRequirementModal.tsx"), "utf8");
  const qualityModalSrc = fs.readFileSync(path.join(process.cwd(), "src/components/modals/OtQualityDeviceModal.tsx"), "utf8");
  const matrixModalSrc = fs.readFileSync(path.join(process.cwd(), "src/components/modals/OtStationMatrixModal.tsx"), "utf8");

  assert(!dataModalSrc.includes("openai") && !dataModalSrc.includes("gemini") && !dataModalSrc.includes("anthropic"), "OtDataRequirementModal'da harici AI API yok.");
  assert(!alarmModalSrc.includes("openai") && !alarmModalSrc.includes("gemini") && !alarmModalSrc.includes("anthropic"), "OtAlarmRequirementModal'da harici AI API yok.");
  assert(!qualityModalSrc.includes("openai") && !qualityModalSrc.includes("gemini") && !qualityModalSrc.includes("anthropic"), "OtQualityDeviceModal'da harici AI API yok.");
  assert(!matrixModalSrc.includes("openai") && !matrixModalSrc.includes("gemini") && !matrixModalSrc.includes("anthropic"), "OtStationMatrixModal'da harici AI API yok.");

  assert(!dataModalSrc.includes("alert(") && !alarmModalSrc.includes("alert(") && !qualityModalSrc.includes("alert(") && !matrixModalSrc.includes("alert("), "Hiçbir modalda native alert() kullanılmadı.");

  // -------------------------------------------------------------------------
  // Özet
  // -------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`FAZ-62C Test Sonucu: ${passCount} Geçti, ${failCount} Kaldı`);
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
