/**
 * ERP CRM Discovery — FAZ-66: Pilot Saha Kabulü, Rapor Kalitesi ve Go-Live Hazırlığı Smoke Testi
 */

let Database: any = null;
try {
  Database = (await import("better-sqlite3")).default;
} catch {
  // better-sqlite3 is optional in CI environments
}
import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import { INITIAL_BUSINESS_FUNCTIONS } from "../src/db/seedData";
import {
  setDbInstanceForTesting,
  resetDbInstanceForTesting,
  createProject,
  deleteProject,
  getReadinessChecks,
  getReadinessCheckById,
  createReadinessCheck,
  updateReadinessCheck,
  deleteReadinessCheck,
  seedStarterReadinessChecks,
  getReadinessSummary,
} from "../src/db/client";
import {
  createManufacturingDemoProject,
} from "../src/demo/manufacturingPilot";
import { buildReportModel } from "../src/report/builder";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { PDFParse } from "pdf-parse";
import { exportProjectBackup, restoreProjectBackup, duplicateProject } from "../src/storage/backupManager";
import { BACKUP_CURRENT_SCHEMA_VERSION } from "../src/types/backup";
import {
  READINESS_CATEGORY_LABELS,
  READINESS_STATUS_LABELS,
  type ReadinessCategory,
  type ReadinessStatus,
} from "../src/types/readiness";
import * as fs from "node:fs";
import * as path from "node:path";

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

async function runAllMigrations(mockDb: MockDb) {
  for (const migration of MIGRATION_DEFINITIONS) {
    for (const sql of migration.sql) {
      await mockDb.execute(sql);
    }
  }

  // Canonical business functions seed
  for (const bf of INITIAL_BUSINESS_FUNCTIONS) {
    await mockDb.execute(
      `INSERT INTO business_functions (id, code, name_tr, name_en, category, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, 1)
       ON CONFLICT(code) DO NOTHING`,
      [`bf_${bf.code.toLowerCase()}`, bf.code, bf.name_tr, bf.name_en, bf.category, bf.sort_order]
    );
  }
}

async function runSmokeTests() {
  if (!Database) {
    console.log("[INFO] better-sqlite3 test ortamında bulunamadı. SKIPPED.");
    return;
  }

  console.log("======================================================================");
  console.log("FAZ-66 — PİLOT SAHA KABULÜ VE GO-LIVE HAZIRLIĞI KABUL TESTİ");
  console.log("======================================================================");

  const mockDb = createMockDb();
  await runAllMigrations(mockDb);
  setDbInstanceForTesting(mockDb as any);

  let p1Id = "";

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Temel Proje & Readiness CRUD Operasyonları
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 1: Readiness Kontrolü CRUD ---");
    const projId = await createProject({
      projectName: "FAZ-66 Test Projesi",
      company: {
        company_name: "Test Endüstriyel A.Ş.",
        country: "Türkiye",
      },
      selectedFunctionIds: ["bf_sales", "bf_procurement", "bf_warehouse"],
    });
    p1Id = projId;
    assert(Boolean(p1Id), "Proje başarıyla oluşturuldu.");

    const item = await createReadinessCheck({
      project_id: p1Id,
      category: "DATA",
      check_code: "CHK-TEST-01",
      title: "Test Veri Bütünlüğü Kontrolü",
      description: "Açıklama metni",
      status: "NOT_STARTED",
      critical: 1,
      owner_role: "Veri Yöneticisi",
      evidence_required: 1,
      action_required: 1,
      action_note: "Formatlar standardize edilmeli",
      due_date: "2026-10-30",
      notes: "Özel test notu",
    });

    assert(Boolean(item.id), "Kontrol kaydı ID üretti.");
    assert(item.category === "DATA", "Kategori DATA.");
    assert(item.check_code === "CHK-TEST-01", "Kontrol kodu CHK-TEST-01.");
    assert(item.critical === 1, "Kritik kontrol 1.");
    assert(item.action_required === 1, "Aksiyon gerekli 1.");

    const fetched = await getReadinessCheckById(item.id);
    assert(fetched !== null && fetched.title === "Test Veri Bütünlüğü Kontrolü", "getReadinessCheckById doğru kaydı getirdi.");

    const updated = await updateReadinessCheck(item.id, {
      status: "IN_PROGRESS",
      notes: "İnceleme başlatıldı",
    });
    assert(updated?.status === "IN_PROGRESS", "Durum IN_PROGRESS olarak güncellendi.");
    assert(updated?.notes === "İnceleme başlatıldı", "Not güncellendi.");

    const deleted = await deleteReadinessCheck(item.id);
    assert(deleted === true, "deleteReadinessCheck true döndü.");
    const afterDel = await getReadinessCheckById(item.id);
    assert(afterDel === null, "Silinen kayıt getReadinessCheckById ile null döndü.");

    // -------------------------------------------------------------------------
    // TEST 2: Standart 24 Başlangıç Kontrol Maddesi Tohumlama
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 2: Standart 24 Başlangıç Kontrolü Tohumlama ---");
    const seededCount = await seedStarterReadinessChecks(p1Id);
    assert(seededCount === 24, "seedStarterReadinessChecks 24 kontrol tohumladı.");

    const secondSeed = await seedStarterReadinessChecks(p1Id);
    assert(secondSeed === 0, "İkinci tohumlama çağrısı idempotent (0 eklendi).");

    const allChecks = await getReadinessChecks(p1Id);
    assert(allChecks.length === 24, "Toplam 24 kontrol mevcut.");

    const catSet = new Set(allChecks.map((c) => c.category));
    assert(catSet.size === 8, "8 kategorinin tamamı mevcut.");
    assert(catSet.has("DATA") && catSet.has("PROCESS") && catSet.has("GOVERNANCE") && catSet.has("OT"), "DATA, PROCESS, GOVERNANCE, OT mevcut.");
    assert(catSet.has("EVIDENCE") && catSet.has("PEOPLE") && catSet.has("REPORTING") && catSet.has("SUPPORT"), "EVIDENCE, PEOPLE, REPORTING, SUPPORT mevcut.");

    // -------------------------------------------------------------------------
    // TEST 3: Kritik Kontrol Kuralı & Discovery Readiness Kararı
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 3: Kritik Kontrol Kuralı & Discovery Readiness ---");
    let summary = await getReadinessSummary(p1Id);
    assert(summary.stats.isDiscoveryReady === false, "Başlangıçta isDiscoveryReady false.");
    assert(summary.stats.criticalOpenCount > 0, "Başlangıçta kritik açık sayısı > 0.");

    // Tüm kontrolleri READY yapalım, ama 1 kritik kontrolü BLOCKED yapalım
    for (const c of allChecks) {
      if (c.check_code === "CHK-DATA-01") {
        await updateReadinessCheck(c.id, { status: "BLOCKED" });
      } else {
        await updateReadinessCheck(c.id, { status: "READY" });
      }
    }

    summary = await getReadinessSummary(p1Id);
    assert(summary.stats.criticalOpenCount === 1, "1 kritik açık tespit edildi.");
    assert(summary.stats.blockedCount === 1, "1 bloke kontrol tespit edildi.");
    assert(summary.stats.isDiscoveryReady === false, "Kritik kontrol açıkken isDiscoveryReady false.");

    // BLOCKED olanı da READY yapalım
    const blockedCheck = allChecks.find((c) => c.check_code === "CHK-DATA-01")!;
    await updateReadinessCheck(blockedCheck.id, { status: "READY" });

    summary = await getReadinessSummary(p1Id);
    assert(summary.stats.criticalOpenCount === 0, "Kritik açık sayısı 0 oldu.");
    assert(summary.stats.readinessPercentage === 100, "Hazırlık yüzdesi %100 oldu.");
    assert(summary.stats.isDiscoveryReady === true, "Tüm kontroller tamamken isDiscoveryReady true oldu.");

    // -------------------------------------------------------------------------
    // TEST 4: NOT_APPLICABLE Kontrollerin Paydadan Düşülmesi
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 4: NOT_APPLICABLE Payda Hesabı ---");
    // 4 kontrolü NOT_APPLICABLE yapalım (24 - 4 = 20 uygulanabilir)
    // 10 READY, 10 NOT_STARTED -> 10 / 20 = %50
    for (let i = 0; i < allChecks.length; i++) {
      if (i < 4) {
        await updateReadinessCheck(allChecks[i].id, { status: "NOT_APPLICABLE" });
      } else if (i < 14) {
        await updateReadinessCheck(allChecks[i].id, { status: "READY" });
      } else {
        await updateReadinessCheck(allChecks[i].id, { status: "NOT_STARTED" });
      }
    }

    summary = await getReadinessSummary(p1Id);
    assert(summary.stats.totalChecks === 24, "Toplam kontrol 24.");
    assert(summary.stats.notApplicableCount === 4, "NOT_APPLICABLE sayısı 4.");
    assert(summary.stats.applicableChecks === 20, "Uygulanabilir kontrol sayısı 20.");
    assert(summary.stats.readyCount === 10, "Hazır kontrol sayısı 10.");
    assert(summary.stats.readinessPercentage === 50, "Hazırlık yüzdesi %50 (10/20).");

    // -------------------------------------------------------------------------
    // TEST 5: Kategori Bazlı Özet Matrisi
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 5: 8 Kategori Bazlı Özet Matrisi ---");
    assert(summary.categories.length === 8, "8 kategori özeti hesaplandı.");
    for (const cat of summary.categories) {
      assert(Boolean(cat.category), `Kategori kodu mevcut (${cat.category}).`);
      assert(Boolean(cat.categoryLabel), `Kategori etiketi mevcut (${cat.categoryLabel}).`);
      assert(typeof cat.readinessPercentage === "number", `Yüzde sayısal (${cat.category}).`);
    }

    // -------------------------------------------------------------------------
    // TEST 6: Öncelikli Aksiyon Planı ve Sorumlu Roller
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 6: Öncelikli Aksiyon Planı ---");
    const targetCheck = allChecks[0];
    await updateReadinessCheck(targetCheck.id, {
      action_required: 1,
      action_note: "Saha sayım tutanağı doğrulanmalı",
      owner_role: "Lojistik Şefi",
      due_date: "2026-11-15",
    });

    summary = await getReadinessSummary(p1Id);
    assert(summary.actions.length >= 1, "Aksiyon listesinde en az 1 madde mevcut.");
    const act = summary.actions.find((a) => a.id === targetCheck.id);
    assert(act !== undefined, "Hedef kontrol aksiyon listesinde bulundu.");
    assert(act?.actionNote === "Saha sayım tutanağı doğrulanmalı", "Aksiyon notu doğru.");
    assert(act?.ownerRole === "Lojistik Şefi", "Sorumlu rol doğru.");
    assert(act?.dueDate === "2026-11-15", "Termin tarihi doğru.");

    // -------------------------------------------------------------------------
    // TEST 7: Taşınabilir .erpcrm Schema 19 Yedekleme & Geri Yükleme
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 7: Taşınabilir Arşiv (.erpcrm Schema 19) Export & Restore ---");
    assert(BACKUP_CURRENT_SCHEMA_VERSION === 19, "BACKUP_CURRENT_SCHEMA_VERSION === 19.");

    const exportRes = await exportProjectBackup(p1Id);
    assert(exportRes.manifest.schemaVersion === 19, "Manifest schemaVersion 19.");
    assert(exportRes.manifest.recordCounts.readinessChecks === 24, "Manifest recordCounts.readinessChecks === 24.");

    const restoreRes = await restoreProjectBackup(exportRes.buffer, {
      newProjectName: "Restore Edilen Hazırlık Projesi",
    });
    assert(restoreRes.success === true, "Restore işlemi başarılı.");
    const restoredChecks = await getReadinessChecks(restoreRes.newProjectId!);
    assert(restoredChecks.length === 24, "Geri yüklenen projede 24 kontrol mevcut.");
    assert(restoredChecks[0].id !== allChecks[0].id, "Geri yüklenen kayıtlar yeni UUID aldı.");

    // Şablon Çoğaltma Doğrulaması (readiness kayıtları NOT_STARTED olarak sıfırlanmalı)
    const dupRes = await duplicateProject(p1Id, {
      newProjectName: "Şablon Hazırlık Projesi",
      copyAnswersAndAttachments: false,
    });
    assert(dupRes.success === true, "Şablon çoğaltma başarılı.");
    const dupChecks = await getReadinessChecks(dupRes.newProjectId);
    assert(dupChecks.length === 24, "Şablon projede 24 kontrol korundu.");
    assert(dupChecks.every((c) => c.status === "NOT_STARTED"), "Şablon projede tüm kontroller NOT_STARTED olarak sıfırlandı.");

    // -------------------------------------------------------------------------
    // TEST 8: Marmara Sentetik Pilotu Entegrasyonu
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 8: Marmara Sentetik Pilotu Entegrasyonu ---");
    const demoRes = await createManufacturingDemoProject();
    assert(Boolean(demoRes.projectId), "Marmara demo projesi oluşturuldu.");

    const demoChecks = await getReadinessChecks(demoRes.projectId);
    assert(demoChecks.length === 24, "Marmara pilotunda 24 readiness kontrolü mevcut.");

    const chkData01 = demoChecks.find((c) => c.check_code === "CHK-DATA-01");
    assert(chkData01?.status === "READY", "Marmara pilotunda CHK-DATA-01 READY durumunda.");

    const chkGov03 = demoChecks.find((c) => c.check_code === "CHK-GOV-03");
    assert(chkGov03?.status === "BLOCKED", "Marmara pilotunda CHK-GOV-03 BLOCKED durumunda.");
    assert(chkGov03?.action_required === 1, "Marmara pilotunda CHK-GOV-03 action_required === 1.");

    const demoSummary = await getReadinessSummary(demoRes.projectId);
    assert(demoSummary.stats.readinessPercentage > 0, "Marmara pilotunda hazırlık skoru > 0.");
    assert(demoSummary.stats.criticalOpenCount >= 1, "Marmara pilotunda kritik açık >= 1.");
    assert(demoSummary.stats.isDiscoveryReady === false, "Marmara pilotu kritik açık varken hazır sayılmıyor.");

    // -------------------------------------------------------------------------
    // TEST 9: ReportModel, DOCX ve PDF Bölüm 7 Derlemesi
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 9: ReportModel, DOCX & PDF Bölüm 7 Derlemesi ---");
    const report = await buildReportModel(demoRes.projectId);
    assert(report.readinessSummary !== undefined, "ReportModel readinessSummary içeriyor.");
    assert(
      report.readinessSummary?.disclaimer === "Bu bölüm uygulama öncesi keşif hazırlığını gösterir; canlıya geçiş onayı değildir.",
      "Feragatname metni doğru."
    );
    assert(report.readinessSummary?.categories.length === 8, "Rapor modeli 8 kategori içeriyor.");
    assert(report.readinessSummary?.checklist.length === 24, "Rapor modeli 24 kontrol maddesi içeriyor.");

    const docxBuf = await buildDocxBuffer(report);
    assert(docxBuf.length > 5000, `DOCX buffer üretildi (${docxBuf.length} bayt).`);

    const pdfBuf = await buildPdfBuffer(report);
    assert(pdfBuf.length > 5000, `PDF buffer üretildi (${pdfBuf.length} bayt).`);

    const parser = new PDFParse({ data: pdfBuf });
    const parsedPdf = await parser.getText();
    assert(parsedPdf.text.includes("Pilot Saha Kabulü ve Go-Live Hazırlığı"), "PDF çıktısı Bölüm 7 başlığını içeriyor.");
    assert(parsedPdf.text.includes("canlıya geçiş onayı değildir"), "PDF çıktısı feragatname metnini içeriyor.");
    assert(parsedPdf.text.includes("CHK-GOV-03"), "PDF çıktısı SoD kontrol kodunu içeriyor.");

    // -------------------------------------------------------------------------
    // TEST 10: Zero-Egress & AI İzolasyon İlkesi
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 10: Zero-Egress & AI İzolasyon İlkesi ---");
    const typeFile = fs.readFileSync(path.join(process.cwd(), "src/types/readiness.ts"), "utf-8");
    assert(!typeFile.includes("openai") && !typeFile.includes("gemini"), "Readiness tiplerinde harici AI API yok.");

    const sectionFile = fs.readFileSync(path.join(process.cwd(), "src/components/readiness/ReadinessChecklistSection.tsx"), "utf-8");
    assert(!sectionFile.includes("fetch(") && !sectionFile.includes("http://"), "ReadinessChecklistSection içinde harici ağ çağrısı yok.");

  } finally {
    resetDbInstanceForTesting();
    mockDb.close();
  }

  console.log("\n======================================================================");
  console.log(`FAZ-66 KABUL TESTİ SONUCU: ${passCount} PASS / ${failCount} FAIL`);
  console.log("======================================================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

runSmokeTests().catch((err) => {
  console.error("Test çalıştırma hatası:", err);
  process.exit(1);
});
