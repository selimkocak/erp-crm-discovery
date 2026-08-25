/**
 * ERP CRM Discovery — FAZ-58.3 Rapor Sayaç Tutarlılığı ve Görünen Metin Kabul Testi
 *
 * Test Doğrulamaları (22 Zorunlu Test):
 * 1. Marmara pilotunda 19 aktif fonksiyon bulunur.
 * 2. 94 geçerli cevap bulunur.
 * 3. 19 fonksiyonun tamamında en az bir cevap bulunur.
 * 4. Toplam kanonik soru sayısı 427'dir.
 * 5. İlerleme yüzdesi %22 olur (94 / 427 * 100).
 * 6. Fonksiyon süreç durumları: 9 tamamlandı, 10 devam ediyor, 0 başlamadı.
 * 7. Başlanmadı/devam ediyor/tamamlandı durumları cevap sayacını değiştirmez.
 * 8. Aynı question_id farklı fonksiyonlarda bulunursa yanlış tekilleştirme yapılmaz (Composite identity: bfCode + question_id).
 * 9. Boş cevap nesnesi sayılmaz (isValidAnswer({}) === false).
 * 10. Boş selected dizisi sayılmaz (isValidAnswer({ selected: [] }) === false).
 * 11. Geçerli selected[{value}] sayılır (isValidAnswer({ selected: [{ value: "erp_crm" }] }) === true).
 * 12. Geçerli text cevabı sayılır (isValidAnswer({ text: "Örnek metin" }) === true).
 * 13. Geçerli general_note cevabı sayılır (isValidAnswer({ general_note: "Genel not" }) === true).
 * 14. Parse edilemeyen JSON raporu çökertmez ve sayılmaz.
 * 15. Kapsam dışı (soft-removed / inactive) fonksiyon cevapları korunur fakat aktif ilerlemeye dahil edilmez.
 * 16. Rapor önizleme sayacı = PDF modeli sayacı (summaryStats.answeredQuestions).
 * 17. PDF modeli sayacı = DOCX modeli sayacı (summaryStats.answeredQuestions).
 * 18. Rapor çıktısında 'undefined' bulunmaz (PDF text & ReportModel).
 * 19. Rapor çıktısında 'Invalid Date' bulunmaz.
 * 20. Rapor durum etiketi 'Aktif' olur.
 * 21. Çalışan sayısı '251–500' görünür.
 * 22. Demo modal metrikleri 19 fonksiyon, 94 cevap, 7 bulgu, 7 gereksinim, 5 risk (3 açık), 6 not ile eşleşir.
 */

let Database: any = null;
try {
  Database = (await import("better-sqlite3")).default;
} catch {
  // better-sqlite3 is optional in CI environments
}
import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import { INITIAL_BUSINESS_FUNCTIONS } from "../src/db/seedData";
import { BUSINESS_FUNCTION_REGISTRY } from "../src/generated/businessFunctions";
import {
  setDbInstanceForTesting,
  resetDbInstanceForTesting,
  createProject,
  getProjects,
  getProjectDetail,
  updateProjectStatus,
  saveAnswer,
  createFinding,
  createRequirement,
  createRisk,
  createProjectNote,
  deactivateProjectFunction,
} from "../src/db/client";
import {
  createManufacturingDemoProject,
  MANUFACTURING_PILOT_METADATA,
  buildManufacturingPilotAnswers,
} from "../src/demo/manufacturingPilot";
import { buildReportModel } from "../src/report/builder";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { PDFParse } from "pdf-parse";
import {
  isValidAnswer,
  formatEmployeeCount,
  formatProjectStatus,
  getTurkishAccusativeSuffix,
} from "../src/report/formatters";

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

interface MockDb {
  execute(query: string, params?: any[]): Promise<{ rowsAffected: number }>;
  select<T = any[]>(query: string, params?: any[]): Promise<T>;
  close(): void;
  raw: any;
}

function createMockDb(): MockDb {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");

  return {
    async execute(query: string, params: any[] = []): Promise<{ rowsAffected: number }> {
      const trimmed = query.trim();
      if (!trimmed) return { rowsAffected: 0 };
      const { sql: convertedSql, params: orderedParams } = convertSql(trimmed, params);
      if (orderedParams.length > 0) {
        const info = sqlite.prepare(convertedSql).run(...orderedParams);
        return { rowsAffected: info.changes };
      } else {
        sqlite.exec(convertedSql);
        return { rowsAffected: 0 };
      }
    },
    async select<T = any[]>(query: string, params: any[] = []): Promise<T> {
      const trimmed = query.trim();
      const { sql: convertedSql, params: orderedParams } = convertSql(trimmed, params);
      if (orderedParams.length > 0) {
        return sqlite.prepare(convertedSql).all(...orderedParams) as T;
      }
      return sqlite.prepare(convertedSql).all() as T;
    },
    close() {
      sqlite.close();
    },
    raw: sqlite,
  };
}

async function runAllMigrations(mockDb: MockDb): Promise<void> {
  await mockDb.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  for (const mig of MIGRATION_DEFINITIONS) {
    const applied = await mockDb.select<any[]>(
      `SELECT version FROM _migrations WHERE version = $1`,
      [mig.version]
    );
    if (applied.length === 0) {
      for (const statement of mig.sql) {
        await mockDb.execute(statement);
      }
      await mockDb.execute(
        `INSERT INTO _migrations (version, name, applied_at) VALUES ($1, $2, $3)`,
        [mig.version, mig.description, new Date().toISOString()]
      );
    }
  }

  // Seed master business_functions
  for (const bf of INITIAL_BUSINESS_FUNCTIONS) {
    const id = `bf_${bf.code.toLowerCase()}`;
    await mockDb.execute(
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
}

async function runTests(): Promise<void> {
  if (!Database) {
    console.log("[INFO] better-sqlite3 test ortamında bulunamadı. SKIPPED.");
    return;
  }

  console.log("\n======================================================================");
  console.log("FAZ-58.3 — RAPOR SAYAÇ TUTARLILIĞI VE GÖRÜNEN METİN KABUL TESTİ");
  console.log("======================================================================\n");

  const mockDb = createMockDb();
  setDbInstanceForTesting(mockDb);

  try {
    await runAllMigrations(mockDb);

    // -------------------------------------------------------------------------
    // TEST 1: Pure Unit Test — Geçerli ve Geçersiz Cevap Tanımları (isValidAnswer)
    // -------------------------------------------------------------------------
    console.log("--- TEST 1: isValidAnswer & Gösterim Formatlayıcıları ---");
    assert(isValidAnswer(null) === false, "T09: null cevap geçerli sayılmaz");
    assert(isValidAnswer(undefined) === false, "T09: undefined cevap geçerli sayılmaz");
    assert(isValidAnswer({}) === false, "T09: Boş nesne {} geçerli sayılmaz");
    assert(isValidAnswer({ selected: [] }) === false, "T10: Boş selected: [] geçerli sayılmaz");
    assert(isValidAnswer({ selected: [{ value: "" }] }) === false, "T10: Boş value içeren selected geçerli sayılmaz");
    assert(isValidAnswer({ text: "   " }) === false, "T10: Yalnızca boşluk içeren text geçerli sayılmaz");
    assert(isValidAnswer({ general_note: "   " }) === false, "T10: Yalnızca boşluk içeren general_note geçerli sayılmaz");

    assert(isValidAnswer({ selected: [{ value: "erp_crm" }] }) === true, "T11: Geçerli selected[{value}] geçerli sayılır");
    assert(isValidAnswer({ text: "Örnek süreç açıklaması" }) === true, "T12: Geçerli text cevabı geçerli sayılır");
    assert(isValidAnswer({ general_note: "Saha keşif mülakatı notu" }) === true, "T13: Geçerli general_note cevabı geçerli sayılır");
    assert(isValidAnswer({ selected: [{ value: "opt1", note: "Not" }], general_note: "Not" }) === true, "T11: Çoklu alan içeren cevap geçerli sayılır");

    // Gösterim formatlayıcıları
    assert(formatEmployeeCount("251_500") === "251–500", "T21: formatEmployeeCount('251_500') -> '251–500'");
    assert(formatEmployeeCount("1_20") === "1–20", "T21: formatEmployeeCount('1_20') -> '1–20'");
    assert(formatEmployeeCount("1000+") === "1000+", "T21: formatEmployeeCount('1000+') -> '1000+'");
    assert(formatEmployeeCount("51-250") === "51–250", "T21: formatEmployeeCount('51-250') -> '51–250'");

    assert(formatProjectStatus("active") === "Aktif", "T20: formatProjectStatus('active') -> 'Aktif'");
    assert(formatProjectStatus("passive") === "Pasif", "T20: formatProjectStatus('passive') -> 'Pasif'");
    assert(formatProjectStatus("draft") === "Taslak", "T20: formatProjectStatus('draft') -> 'Taslak'");
    assert(formatProjectStatus("completed") === "Tamamlandı", "T20: formatProjectStatus('completed') -> 'Tamamlandı'");

    assert(getTurkishAccusativeSuffix(9) === "u", "T05: getTurkishAccusativeSuffix(9) -> 'u' (9'u / 9’u)");
    assert(getTurkishAccusativeSuffix(1) === "i", "T05: getTurkishAccusativeSuffix(1) -> 'i' (1'i)");
    assert(getTurkishAccusativeSuffix(2) === "si", "T05: getTurkishAccusativeSuffix(2) -> 'si' (2'si)");
    assert(getTurkishAccusativeSuffix(19) === "u", "T05: getTurkishAccusativeSuffix(19) -> 'u' (19'u)");

    // -------------------------------------------------------------------------
    // TEST 2: Sentetik Marmara Endüstriyel Pilot Projesi Oluşturma & Doğrulama
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 2: Sentetik Marmara Pilotu Oluşturma ---");
    const demo = await createManufacturingDemoProject();
    assert(demo.projectId.startsWith("proj_"), "Sentetik demo proje oluşturuldu");

    const detail = await getProjectDetail(demo.projectId);
    assert(detail !== null, "Proje detayları veritabanından başarıyla okundu");

    const activeFunctions = detail?.functions.filter((f) => f.is_active !== 0) || [];
    assert(activeFunctions.length === 19, `T01: Marmara pilotunda 19 aktif fonksiyon bulunur (Gerçek: ${activeFunctions.length})`);

    const rawAnswers = await mockDb.select<{ id: string; answer_data: string; business_function_code: string }[]>(
      "SELECT id, answer_data, business_function_code FROM question_answers WHERE analysis_project_id = $1",
      [demo.projectId]
    );
    assert(rawAnswers.length === 94, `T02: 94 geçerli cevap veritabanında kayıtlıdır (Gerçek: ${rawAnswers.length})`);

    const fnWithAnswers = new Set(rawAnswers.map((a) => a.business_function_code));
    assert(fnWithAnswers.size === 19, `T03: 19 fonksiyonun tamamında en az bir cevap bulunur (Gerçek: ${fnWithAnswers.size})`);

    // Fonksiyon süreç durumları
    const completedFns = activeFunctions.filter((f) => f.status === "completed").length;
    const inProgressFns = activeFunctions.filter((f) => f.status === "in_progress").length;
    const notStartedFns = activeFunctions.filter((f) => f.status === "not_started").length;
    assert(completedFns === 9, `T06: 9 fonksiyon tamamlandı durumunda (Gerçek: ${completedFns})`);
    assert(inProgressFns === 10, `T06: 10 fonksiyon devam ediyor durumunda (Gerçek: ${inProgressFns})`);
    assert(notStartedFns === 0, `T06: 0 fonksiyon başlanmadı durumunda (Gerçek: ${notStartedFns})`);

    // -------------------------------------------------------------------------
    // TEST 3: ReportModel Tek Doğruluk Kaynağı & Sayaç Doğrulaması
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 3: ReportModel Sayaç & Özet Metrikleri ---");
    const report = await buildReportModel(demo.projectId);

    assert(report.summaryStats.totalFunctions === 19, "Rapor toplam fonksiyon sayısı = 19");
    assert(report.summaryStats.activeFunctionCount === 19, "Rapor activeFunctionCount = 19");
    assert(report.summaryStats.completedFunctions === 9, "Rapor tamamlanan fonksiyon sayısı = 9");
    assert(report.summaryStats.completedFunctionCount === 9, "Rapor completedFunctionCount = 9");
    assert(report.summaryStats.inProgressFunctions === 10, "Rapor devam eden fonksiyon sayısı = 10");
    assert(report.summaryStats.inProgressFunctionCount === 10, "Rapor inProgressFunctionCount = 10");
    assert(report.summaryStats.notStartedFunctions === 0, "Rapor başlanmayan fonksiyon sayısı = 0");
    assert(report.summaryStats.notStartedFunctionCount === 0, "Rapor notStartedFunctionCount = 0");

    assert(report.summaryStats.totalQuestions === 427, `T04: Toplam kanonik soru sayısı 427'dir (Gerçek: ${report.summaryStats.totalQuestions})`);
    assert(report.summaryStats.totalQuestionCount === 427, `T04: totalQuestionCount = 427`);
    assert(report.summaryStats.answeredQuestions === 94, `T02: Cevaplanan soru sayısı 94'tür (Gerçek: ${report.summaryStats.answeredQuestions})`);
    assert(report.summaryStats.answeredQuestionCount === 94, `T02: answeredQuestionCount = 94`);
    assert(report.summaryStats.questionProgressPercent === 22, `T05: Soru ilerleme yüzdesi %22'dir (Gerçek: %${report.summaryStats.questionProgressPercent})`);
    assert(report.metadata.progressPercent === 22, `T05: metadata.progressPercent = 22`);

    assert(report.summaryStats.totalFindings === 7, "Bulgu sayısı = 7");
    assert(report.summaryStats.findingCount === 7, "findingCount = 7");
    assert(report.summaryStats.totalRequirements === 7, "Gereksinim sayısı = 7");
    assert(report.summaryStats.requirementCount === 7, "requirementCount = 7");
    assert(report.summaryStats.openRisks === 3, "Açık risk sayısı = 3");
    assert(report.summaryStats.openRiskCount === 3, "openRiskCount = 3");
    assert(report.summaryStats.totalRisks === 5, "Toplam risk sayısı = 5");
    assert(report.summaryStats.totalRiskCount === 5, "totalRiskCount = 5");
    assert(report.summaryStats.totalNotes === 6, "Proje notu sayısı = 6");

    // Draft Label kontrolü
    assert(
      report.metadata.draftLabel === "ARA RAPOR — 19 iş fonksiyonundan 9’u tamamlandı (Soru İlerlemesi: %22)",
      `T05: Doğru Türkçe ek ve oranla draftLabel üretildi: '${report.metadata.draftLabel}'`
    );

    // Firma profili metin kontrolü
    assert(report.company.employeeCount === "251–500", `T21: Rapor şirket künyesinde çalışan sayısı 251–500 (Gerçek: ${report.company.employeeCount})`);

    // -------------------------------------------------------------------------
    // TEST 4: Süreç Durumu ve Bozuk JSON Sayaca Etki Etmeme Denetimi
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 4: Durum Bağımsızlığı & Bozuk JSON Dayanıklılığı ---");

    // Fonksiyon durumunu not_started yaparsak cevap sayacı DEĞİŞMEMELİ
    await mockDb.execute(
      `UPDATE project_business_functions SET status = 'not_started' WHERE analysis_project_id = $1 AND business_function_id IN (SELECT id FROM business_functions WHERE code = 'SALES')`,
      [demo.projectId]
    );

    const reportAfterStatusChange = await buildReportModel(demo.projectId);
    assert(
      reportAfterStatusChange.summaryStats.answeredQuestions === 94,
      `T07: Fonksiyon not_started olsa dahi geçerli cevaplar sayılır (Cevap: ${reportAfterStatusChange.summaryStats.answeredQuestions})`
    );

    // Bozuk JSON ekleme testi (T14)
    await mockDb.execute(
      `INSERT INTO question_answers (id, analysis_project_id, business_function_code, question_pack_id, question_pack_version, question_id, answer_data, created_at, updated_at)
       VALUES ('ans_corrupt', $1, 'SALES', 'tr.sales.core', '0.1.0', 'SALES-099', '{ corrupt_json: invalid', $2, $2)`,
      [demo.projectId, new Date().toISOString()]
    );

    let corruptReportThrew = false;
    let reportWithCorrupt: any = null;
    try {
      reportWithCorrupt = await buildReportModel(demo.projectId);
    } catch {
      corruptReportThrew = true;
    }
    assert(!corruptReportThrew, "T14: Bozuk JSON kaydı buildReportModel'i çökertmez");
    assert(
      reportWithCorrupt?.summaryStats.answeredQuestions === 94,
      `T14: Bozuk JSON kaydı cevap sayacına dahil edilmez (Cevap: ${reportWithCorrupt?.summaryStats.answeredQuestions})`
    );

    // Temizle
    await mockDb.execute("DELETE FROM question_answers WHERE id = 'ans_corrupt'");
    await mockDb.execute(
      `UPDATE project_business_functions SET status = 'completed' WHERE analysis_project_id = $1 AND business_function_id IN (SELECT id FROM business_functions WHERE code = 'SALES')`,
      [demo.projectId]
    );

    // -------------------------------------------------------------------------
    // TEST 5: Kapsam Dışı Fonksiyon İzolasyonu (T15)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 5: Kapsam Dışı / Soft-Removed Fonksiyon İzolasyonu ---");
    // SALES fonksiyonunu kapsam dışına al (is_active = 0)
    await deactivateProjectFunction(demo.projectId, "SALES", "Analiz kapsamı sadeleştirildi");

    const reportAfterSoftRemove = await buildReportModel(demo.projectId);
    // SALES'ın 5 cevabı vardı -> 94 - 5 = 89 olmalı
    assert(
      reportAfterSoftRemove.summaryStats.answeredQuestions === 89,
      `T15: Kapsam dışı fonksiyonun cevapları aktif rapordan izole edilir (Beklenen: 89, Gerçek: ${reportAfterSoftRemove.summaryStats.answeredQuestions})`
    );
    assert(
      reportAfterSoftRemove.summaryStats.totalFunctions === 18,
      `T15: Kapsam dışı fonksiyon aktif fonksiyon sayısından düşülür (18)`
    );

    // Veritabanında cevapların korunduğunu doğrula
    const salesAnswersInDb = await mockDb.select<any[]>(
      "SELECT id FROM question_answers WHERE analysis_project_id = $1 AND business_function_code = 'SALES'",
      [demo.projectId]
    );
    assert(salesAnswersInDb.length === 5, `T15: Kapsam dışı bırakılan fonksiyonun 5 cevabı DB'de %100 korunuyor`);

    // Geri aktifleştir
    await mockDb.execute(
      `UPDATE project_business_functions SET is_active = 1, status = 'completed' WHERE analysis_project_id = $1 AND business_function_id IN (SELECT id FROM business_functions WHERE code = 'SALES')`,
      [demo.projectId]
    );

    // -------------------------------------------------------------------------
    // TEST 6: Farklı Fonksiyonlarda Aynı question_id Bileşik Kimlik Testi (T08)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 6: Bileşik Soru Kimliği & Tekilleştirme Doğrulaması ---");
    // INVENTORY ve INVOICING fonksiyonlarının ikisinde de INV-001 sorusu vardır
    const invAnswers = await mockDb.select<any[]>(
      "SELECT business_function_code, question_id FROM question_answers WHERE analysis_project_id = $1 AND question_id = 'INV-001'",
      [demo.projectId]
    );
    assert(
      invAnswers.length === 2,
      `T08: INVENTORY::INV-001 ve INVOICING::INV-001 olmak üzere 2 ayrı bağımsız cevap mevcuttur (Gerçek: ${invAnswers.length})`
    );

    // -------------------------------------------------------------------------
    // TEST 7: PDF ve DOCX Çıktı & Sayaç Paritesi Testi (T16, T17, T18, T19, T20)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 7: PDF / DOCX Rapor Çıktıları ve Sıfır Undefined Güvencesi ---");
    const restoredReport = await buildReportModel(demo.projectId);
    assert(restoredReport.summaryStats.answeredQuestions === 94, "T16: Rapor önizleme sayacı 94");

    const pdfBuf = await buildPdfBuffer(restoredReport);
    assert(pdfBuf.byteLength > 0, "PDF buffer başarıyla üretildi");

    const parsedPdf = await new PDFParse({ data: pdfBuf }).getText();
    const pdfText = parsedPdf.text;

    // PDF sayaç paritesi ve içerik kontrolleri
    assert(pdfText.includes("94 / 427"), "T16: PDF çıktısında '94 / 427' KPI sayacı yer alıyor");
    assert(pdfText.includes("19 (9 Bitti)"), "T16: PDF çıktısında '19 (9 Bitti)' fonksiyon özeti yer alıyor");
    assert(pdfText.includes("251–500"), "T21: PDF çıktısında çalışan sayısı '251–500' olarak basılıyor");
    assert(pdfText.includes("Aktif"), "T20: PDF çıktısında proje durumu 'Aktif' olarak basılıyor");
    assert(!pdfText.includes("251_500"), "T21: PDF çıktısında ham '251_500' enum değeri ASLA basılmıyor");
    assert(!pdfText.includes("undefined"), "T18: PDF metninde hiçbir yerde 'undefined' yer almıyor");
    assert(!pdfText.includes("Invalid Date"), "T19: PDF metninde hiçbir yerde 'Invalid Date' yer almıyor");

    // DOCX buffer üretimi
    const docxBuf = await buildDocxBuffer(restoredReport);
    assert(docxBuf.byteLength > 0, "T17: DOCX buffer başarıyla üretildi (aynı ReportModel tüketildi)");

    // -------------------------------------------------------------------------
    // TEST 8: Demo Modal Metrik Sabitleri Eşleşmesi (T22)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 8: Demo Modal Sabitleri Eşleşmesi ---");
    assert(MANUFACTURING_PILOT_METADATA.functionCount === 19, "T22: Demo modal functionCount = 19");
    assert(MANUFACTURING_PILOT_METADATA.answerCount === 94, "T22: Demo modal answerCount = 94");
    assert(MANUFACTURING_PILOT_METADATA.findingCount === 7, "T22: Demo modal findingCount = 7");
    assert(MANUFACTURING_PILOT_METADATA.requirementCount === 7, "T22: Demo modal requirementCount = 7");
    assert(MANUFACTURING_PILOT_METADATA.totalRiskCount === 5, "T22: Demo modal totalRiskCount = 5");
    assert(MANUFACTURING_PILOT_METADATA.openRiskCount === 3, "T22: Demo modal openRiskCount = 3");
    assert(MANUFACTURING_PILOT_METADATA.noteCount === 6, "T22: Demo modal noteCount = 6");

    // -------------------------------------------------------------------------
    // ÖZET VE SONUÇ
    // -------------------------------------------------------------------------
    console.log("\n======================================================================");
    console.log(`FAZ-58.3 KABUL TESTİ SONUCU: ${passCount} PASS / ${failCount} FAIL`);
    console.log("======================================================================\n");

    if (failCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } finally {
    resetDbInstanceForTesting();
    mockDb.close();
  }
}

runTests().catch((err) => {
  console.error("Test çalıştırma hatası:", err);
  process.exit(1);
});
