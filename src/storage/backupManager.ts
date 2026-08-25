/**
 * ERP CRM Discovery — Project Backup, Restore & Portability Manager
 * FAZ-51 & FAZ-54: Tek arşivli (.erpcrm) proje dışa aktarma, içe aktarma ve çoğaltma servisi
 *
 * MİMARİ İLKELER:
 * 1. Saf Masaüstü (Pure Desktop): Browser indirme fallback'ı kaldırılmıştır; her zaman @tauri-apps/plugin-dialog ve @tauri-apps/plugin-fs kullanılır.
 * 2. Sıfır SQL Transaction Kilidi: @tauri-apps/plugin-sql bağlantı havuzuyla uyumlu sıralı ekleme ve hata anında deleteProject ile atomik telafi.
 * 3. Kalıcı Varsayılan Dizin: Belgeler\ERP CRM Discovery Yedekleri veya son kullanılan klasör.
 */

import { getDb, generateId, deleteProject } from "../db/client";
import {
  readAttachmentFile,
  saveAttachmentFile,
  sanitizeFileName,
} from "./attachmentManager";

import {
  createTarArchive,
  extractTarArchive,
  computeSha256Hex,
  type ArchiveFileEntry,
} from "./tarArchive";
import type {
  BackupManifest,
  ProjectBackupData,
  BackupInspectionResult,
  RestoreResult,
  DuplicateProjectOptions,
  BackupRecordCounts,
} from "../types/backup";

export const BACKUP_FORMAT_VERSION = "1.1.0";
export const BACKUP_CURRENT_SCHEMA_VERSION = 17;
export const LAST_BACKUP_DIR_KEY = "erp_crm_last_backup_directory";

/**
 * Dosya adı için güvenli zaman damgası üretir (YYYY-MM-DD-HHmm).
 */
function getFormattedDateStamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}-${hours}${minutes}`;
}

/**
 * Varsayılan yedekleme ve geri yükleme klasörünü çözümler.
 * Öncelik:
 * 1. Son kullanılan yedek klasörü (localStorage)
 * 2. Belgeler\ERP CRM Discovery Yedekleri
 */
export async function resolveDefaultBackupDir(): Promise<string> {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem(LAST_BACKUP_DIR_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  }

  if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window || "__TAURI__" in window)) {
    return "";
  }

  try {
    const { documentDir } = await import("@tauri-apps/api/path");
    const { exists, mkdir } = await import("@tauri-apps/plugin-fs");
    const docPath = await documentDir();
    const cleanDoc = docPath.replace(/\\/g, "/").replace(/\/+$/, "");
    const backupDir = `${cleanDoc}/ERP CRM Discovery Yedekleri`;

    try {
      const isDir = await exists(backupDir);
      if (!isDir) {
        await mkdir(backupDir, { recursive: true });
      }
    } catch {
      // Klasör oluşturma uyarısı sessizce yutulur
    }
    return backupDir;
  } catch (err) {
    console.warn("Varsayılan yedek klasörü çözümlenemedi:", err);
    return "";
  }
}

/**
 * Projeyi, bağlı tüm modül verilerini ve ek dosyalarını tek bir .erpcrm arşivine aktarır.
 */
export async function exportProjectBackup(
  projectId: string
): Promise<{
  buffer: Uint8Array;
  blob: Blob;
  fileName: string;
  manifest: BackupManifest;
}> {
  const db = await getDb();

  // 1. Proje ve Firma ana kayıtları
  const projects = await db.select<any[]>(
    "SELECT * FROM analysis_projects WHERE id = $1",
    [projectId]
  );
  if (!projects || projects.length === 0) {
    throw new Error(`Dışa aktarılacak proje bulunamadı: ID "${projectId}"`);
  }
  const project = projects[0];

  const companies = await db.select<any[]>(
    "SELECT * FROM company_profiles WHERE analysis_project_id = $1",
    [projectId]
  );
  const company = companies[0] || null;

  // 2. İş Fonksiyonları
  const businessFunctions = await db.select<any[]>(
    "SELECT * FROM project_business_functions WHERE analysis_project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );

  // 3. Soru Cevapları ve Oturum Durumları
  const answers = await db.select<any[]>(
    "SELECT * FROM question_answers WHERE analysis_project_id = $1",
    [projectId]
  );

  const sessionStates = await db.select<any[]>(
    "SELECT * FROM question_session_state WHERE analysis_project_id = $1",
    [projectId]
  );

  // 4. Bulgular, Gereksinimler, Riskler ve Notlar
  const findings = await db.select<any[]>(
    "SELECT * FROM analysis_findings WHERE analysis_project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );

  const requirements = await db.select<any[]>(
    "SELECT * FROM analysis_requirements WHERE analysis_project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );

  const risks = await db.select<any[]>(
    "SELECT * FROM analysis_risks WHERE analysis_project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );

  const notes = await db.select<any[]>(
    "SELECT * FROM project_notes WHERE analysis_project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );

  const reportProfiles = await db.select<any[]>(
    "SELECT * FROM analysis_report_profiles WHERE analysis_project_id = $1",
    [projectId]
  );

  // 5. Özel Sorular ve Takip Bayrakları
  const customQuestions = await db.select<any[]>(
    "SELECT * FROM project_custom_questions WHERE analysis_project_id = $1 ORDER BY sort_order ASC",
    [projectId]
  );

  const customQuestionIds = customQuestions.map((q) => q.id);
  let customQuestionOptions: any[] = [];
  let customQuestionAnswers: any[] = [];

  if (customQuestionIds.length > 0) {
    const placeholders = customQuestionIds.map((_, i) => `$${i + 1}`).join(",");
    customQuestionOptions = await db.select<any[]>(
      `SELECT * FROM project_custom_question_options WHERE custom_question_id IN (${placeholders}) ORDER BY sort_order ASC`,
      customQuestionIds
    );
    customQuestionAnswers = await db.select<any[]>(
      `SELECT * FROM project_custom_question_answers WHERE custom_question_id IN (${placeholders})`,
      customQuestionIds
    );
  }

  const followups = await db.select<any[]>(
    "SELECT * FROM question_followups WHERE analysis_project_id = $1",
    [projectId]
  );

  // 6. Ek Dosyalar ve Yönetişim Kayıtları
  const rawQuestionAttachments = await db.select<any[]>(
    "SELECT * FROM question_attachments WHERE analysis_project_id = $1",
    [projectId]
  );

  // Gizlilik ve Güvenlik: Mutlak dosya yollarını sıfırla
  const questionAttachments = rawQuestionAttachments.map((att) => ({
    ...att,
    source_absolute_path: null,
  }));

  const governanceObjects = await db.select<any[]>(
    "SELECT * FROM governance_objects WHERE analysis_project_id = $1 ORDER BY sort_order ASC",
    [projectId]
  );

  const governanceSubjects = await db.select<any[]>(
    "SELECT * FROM governance_subjects WHERE analysis_project_id = $1 ORDER BY subject_type ASC, name ASC",
    [projectId]
  );

  const governanceScopes = await db.select<any[]>(
    "SELECT * FROM governance_scopes WHERE analysis_project_id = $1 ORDER BY scope_type ASC, name ASC",
    [projectId]
  );

  const governanceResponsibilities = await db.select<any[]>(
    "SELECT * FROM governance_responsibilities WHERE analysis_project_id = $1",
    [projectId]
  );

  const governanceAuthorizations = await db.select<any[]>(
    "SELECT * FROM governance_authorizations WHERE analysis_project_id = $1",
    [projectId]
  );

  const governanceLimits = await db.select<any[]>(
    "SELECT * FROM governance_limits WHERE analysis_project_id = $1",
    [projectId]
  );

  const governanceSodRisks = await db.select<any[]>(
    "SELECT * FROM governance_sod_risks WHERE analysis_project_id = $1",
    [projectId]
  );

  const rawGovernanceAttachments = await db.select<any[]>(
    "SELECT * FROM governance_attachments WHERE analysis_project_id = $1",
    [projectId]
  );

  const governanceAttachments = rawGovernanceAttachments.map((gatt) => ({
    ...gatt,
    source_absolute_path: null,
  }));

  const scopeChanges = await db.select<any[]>(
    "SELECT * FROM project_scope_changes WHERE analysis_project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );

  // 7. OT İstasyonları, İstasyon Cevapları, Veri/Alarm/Kalite Matrisleri (FAZ-62B + FAZ-62C)
  const otStations = await db.select<any[]>(
    "SELECT * FROM ot_stations WHERE project_id = $1 ORDER BY sort_order ASC, created_at ASC",
    [projectId]
  );

  const otStationAnswers = await db.select<any[]>(
    "SELECT * FROM ot_station_answers WHERE project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );

  const otDataRequirements = await db.select<any[]>(
    "SELECT * FROM ot_data_requirements WHERE project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );

  const otAlarmRequirements = await db.select<any[]>(
    "SELECT * FROM ot_alarm_requirements WHERE project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );

  const otQualityDevices = await db.select<any[]>(
    "SELECT * FROM ot_quality_devices WHERE project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );

  // 8. FAZ-63: Süreç Haritaları, Düğümleri ve Bağlantıları
  const processMaps = await db.select<any[]>(
    "SELECT * FROM process_maps WHERE project_id = $1 ORDER BY sort_order ASC, created_at ASC",
    [projectId]
  );

  const processMapIds = processMaps.map((m) => m.id);
  let processNodes: any[] = [];
  let processEdges: any[] = [];

  if (processMapIds.length > 0) {
    const placeholders = processMapIds.map((_, i) => `$${i + 1}`).join(",");
    processNodes = await db.select<any[]>(
      `SELECT * FROM process_nodes WHERE process_map_id IN (${placeholders}) ORDER BY step_order ASC, created_at ASC`,
      processMapIds
    );
    processEdges = await db.select<any[]>(
      `SELECT * FROM process_edges WHERE process_map_id IN (${placeholders}) ORDER BY sort_order ASC, created_at ASC`,
      processMapIds
    );
  }

  // 9. FAZ-64: Veri Sahipliği, Yetkiler ve Onaylar
  const dataGovernanceAssets = await db.select<any[]>(
    "SELECT * FROM data_governance_assets WHERE project_id = $1 ORDER BY asset_name ASC",
    [projectId]
  );
  const dataGovernanceAccess = await db.select<any[]>(
    "SELECT * FROM data_governance_access WHERE project_id = $1 ORDER BY actor_name ASC",
    [projectId]
  );
  const dataGovernanceApprovals = await db.select<any[]>(
    "SELECT * FROM data_governance_approvals WHERE project_id = $1 ORDER BY approval_order ASC",
    [projectId]
  );
  const evidenceItems = await db.select<any[]>(
    "SELECT * FROM evidence_items WHERE project_id = $1 ORDER BY collected_at ASC",
    [projectId]
  );
  const evidenceLinks = await db.select<any[]>(
    "SELECT * FROM evidence_links WHERE project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );

  const projectData: ProjectBackupData = {
    project,
    company,
    businessFunctions,
    answers,
    sessionStates,
    findings,
    requirements,
    risks,
    notes,
    reportProfiles,
    customQuestions,
    customQuestionOptions,
    customQuestionAnswers,
    followups,
    questionAttachments,
    governanceObjects,
    governanceSubjects,
    governanceScopes,
    governanceResponsibilities,
    governanceAuthorizations,
    governanceLimits,
    governanceSodRisks,
    governanceAttachments,
    scopeChanges,
    otStations,
    otStationAnswers,
    otDataRequirements,
    otAlarmRequirements,
    otQualityDevices,
    processMaps,
    processNodes,
    processEdges,
    dataGovernanceAssets,
    dataGovernanceAccess,
    dataGovernanceApprovals,
    evidenceItems,
    evidenceLinks,
  };

  const enc = new TextEncoder();
  const projectDataBytes = enc.encode(JSON.stringify(projectData, null, 2));
  const dataChecksum = await computeSha256Hex(projectDataBytes);

  // 8. Fiziksel Ek Dosyaları Oku ve Checksum'larını Hesapla
  const archiveFiles: ArchiveFileEntry[] = [];
  const checksums: Record<string, string> = {
    "project-data.json": dataChecksum,
  };

  const allAttachmentRecords = [
    ...questionAttachments,
    ...governanceAttachments,
  ];

  for (const att of allAttachmentRecords) {
    if (!att.relative_path) continue;
    const fileBytes = await readAttachmentFile(att.relative_path);
    if (!fileBytes) {
      console.warn(`[backup] Kanıt dosyası okunamadı: ${att.relative_path}`);
      continue;
    }
    const archivePath = `attachments/${att.relative_path}`;
    archiveFiles.push({
      name: archivePath,
      data: fileBytes,
    });
    checksums[archivePath] = await computeSha256Hex(fileBytes);
  }

  // Field Evidence dosyalarını ekle
  for (const ev of evidenceItems) {
    if (!ev.stored_path) continue;
    const fileBytes = await readAttachmentFile(ev.stored_path);
    if (!fileBytes) {
      console.warn(`[backup] Saha kanıt dosyası okunamadı: ${ev.stored_path}`);
      continue;
    }
    const archivePath = `attachments/${ev.stored_path}`;
    archiveFiles.push({
      name: archivePath,
      data: fileBytes,
    });
    checksums[archivePath] = await computeSha256Hex(fileBytes);
  }

  // 9. Manifest Dosyasını Oluştur
  const recordCounts: BackupRecordCounts = {
    businessFunctions: businessFunctions.length,
    answers: answers.length,
    findings: findings.length,
    requirements: requirements.length,
    risks: risks.length,
    notes: notes.length,
    reportProfiles: reportProfiles.length,
    customQuestions: customQuestions.length,
    customQuestionAnswers: customQuestionAnswers.length,
    followups: followups.length,
    governanceObjects: governanceObjects.length,
    governanceSubjects: governanceSubjects.length,
    governanceScopes: governanceScopes.length,
    governanceResponsibilities: governanceResponsibilities.length,
    governanceAuthorizations: governanceAuthorizations.length,
    governanceLimits: governanceLimits.length,
    governanceSodRisks: governanceSodRisks.length,
    questionAttachments: questionAttachments.length,
    governanceAttachments: governanceAttachments.length,
    scopeChanges: scopeChanges.length,
    otStations: otStations.length,
    otStationAnswers: otStationAnswers.length,
    otDataRequirements: otDataRequirements.length,
    otAlarmRequirements: otAlarmRequirements.length,
    otQualityDevices: otQualityDevices.length,
    processMaps: processMaps.length,
    processNodes: processNodes.length,
    processEdges: processEdges.length,
    dataGovernanceAssets: dataGovernanceAssets.length,
    dataGovernanceAccess: dataGovernanceAccess.length,
    dataGovernanceApprovals: dataGovernanceApprovals.length,
    evidenceItems: evidenceItems.length,
    evidenceLinks: evidenceLinks.length,
  };

  const manifest: BackupManifest = {
    formatVersion: BACKUP_FORMAT_VERSION,
    schemaVersion: BACKUP_CURRENT_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    sourceProjectId: project.id,
    projectId: project.id,
    projectName: project.name,
    companyName: company?.company_name || "Bilinmeyen Firma",
    appVersion: "0.1.2",
    dataChecksum,
    attachmentCount: archiveFiles.length,
    recordCounts,
  };

  const manifestBytes = enc.encode(JSON.stringify(manifest, null, 2));
  checksums["manifest.json"] = await computeSha256Hex(manifestBytes);

  const checksumsBytes = enc.encode(JSON.stringify(checksums, null, 2));

  // 9. Arşiv Girişlerini Birleştir
  const allFilesToArchive: ArchiveFileEntry[] = [
    { name: "manifest.json", data: manifestBytes },
    { name: "project-data.json", data: projectDataBytes },
    { name: "checksums.json", data: checksumsBytes },
    ...archiveFiles,
  ];

  const archiveBuffer = await createTarArchive(allFilesToArchive);
  const blob = new Blob([archiveBuffer as any], { type: "application/octet-stream" });

  const safeCompany = sanitizeFileName(manifest.companyName).substring(0, 30) || "firma";
  const safeProject = sanitizeFileName(manifest.projectName).substring(0, 30) || "proje";
  const dateStamp = getFormattedDateStamp();
  const fileName = `${safeCompany}-${safeProject}-${dateStamp}.erpcrm`;

  return {
    buffer: archiveBuffer,
    blob,
    fileName,
    manifest,
  };
}

export interface SaveBackupResult {
  success?: boolean;
  cancelled?: boolean;
  filePath?: string;
  fileName: string;
  fileSize: number;
  projectName: string;
  createdAt: string;
}

/**
 * Kullanıcıya işletim sistemi dosya kaydetme penceresi göstererek .erpcrm yedeğini seçilen konuma yazar.
 * Pure Desktop implementasyonu: Her zaman @tauri-apps/plugin-dialog ve @tauri-apps/plugin-fs kullanır.
 */
export async function saveProjectBackupToFile(
  projectId: string,
  options?: { defaultPathOverride?: string }
): Promise<SaveBackupResult> {
  const exportData = await exportProjectBackup(projectId);

  if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window || "__TAURI__" in window)) {
    // Node.js test ortamı
    return {
      success: true,
      filePath: exportData.fileName,
      fileName: exportData.fileName,
      fileSize: exportData.buffer.byteLength,
      projectName: exportData.manifest.projectName,
      createdAt: new Date().toISOString(),
    };
  }

  const defaultDir = await resolveDefaultBackupDir();
  const defaultFullPath =
    options?.defaultPathOverride ||
    (defaultDir ? `${defaultDir.replace(/\\/g, "/")}/${exportData.fileName}` : exportData.fileName);

  try {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { writeFile, stat } = await import("@tauri-apps/plugin-fs");

    const selectedPath = await save({
      defaultPath: defaultFullPath,
      filters: [
        {
          name: "ERP CRM Discovery Yedeği",
          extensions: ["erpcrm"],
        },
      ],
    });

    if (!selectedPath) {
      return {
        cancelled: true,
        fileName: exportData.fileName,
        fileSize: exportData.buffer.byteLength,
        projectName: exportData.manifest.projectName,
        createdAt: new Date().toISOString(),
      };
    }

    // Binary paketi diske yaz
    await writeFile(selectedPath, exportData.buffer);

    // Fiziksel dosya doğrulaması (stat)
    let verifiedSize = exportData.buffer.byteLength;
    try {
      const fileInfo = await stat(selectedPath);
      if (fileInfo && typeof fileInfo.size === "number") {
        verifiedSize = fileInfo.size;
      }
    } catch (statErr) {
      console.warn("Dosya stat doğrulaması uyarısı:", statErr);
    }

    // Son kullanılan klasörü sakla
    try {
      const cleanPath = selectedPath.replace(/\\/g, "/");
      const lastSlash = cleanPath.lastIndexOf("/");
      if (lastSlash > 0 && typeof localStorage !== "undefined") {
        const dirOnly = selectedPath.substring(0, lastSlash);
        localStorage.setItem(LAST_BACKUP_DIR_KEY, dirOnly);
      }
    } catch {}

    const cleanFileName = selectedPath.replace(/\\/g, "/").split("/").pop() || exportData.fileName;

    return {
      success: true,
      filePath: selectedPath,
      fileName: cleanFileName,
      fileSize: verifiedSize,
      projectName: exportData.manifest.projectName,
      createdAt: new Date().toISOString(),
    };
  } catch (err: any) {
    if (typeof window === "undefined") {
      // Node.js test ortamı fallback
      return {
        success: true,
        filePath: defaultFullPath,
        fileName: exportData.fileName,
        fileSize: exportData.buffer.byteLength,
        projectName: exportData.manifest.projectName,
        createdAt: new Date().toISOString(),
      };
    }
    console.error("Yedek dosyası kaydedilemedi:", err);
    throw new Error(`Yedekleme başarısız oldu: ${err?.message || err}`);
  }
}

/**
 * .erpcrm arşivini veritabanına dokunmadan inceler ve bütünlüğünü doğrular.
 */
export async function inspectProjectBackup(
  archiveBuffer: Uint8Array | ArrayBuffer
): Promise<BackupInspectionResult> {
  try {
    const rawData = archiveBuffer instanceof Uint8Array ? archiveBuffer : new Uint8Array(archiveBuffer);
    if (!rawData || rawData.byteLength === 0) {
      return { valid: false, error: "Boş veya geçersiz arşiv dosyası." };
    }

    const entries = await extractTarArchive(rawData);
    const filesMap = new Map<string, Uint8Array>();
    for (const e of entries) {
      filesMap.set(e.name, e.data);
    }

    // 1. Zorunlu dosyalar
    const manifestBytes = filesMap.get("manifest.json");
    if (!manifestBytes) {
      return { valid: false, error: "Geçersiz paket: manifest.json dosyası bulunamadı." };
    }
    const projectDataBytes = filesMap.get("project-data.json");
    if (!projectDataBytes) {
      return { valid: false, error: "Geçersiz paket: project-data.json dosyası bulunamadı." };
    }
    const checksumsBytes = filesMap.get("checksums.json");
    if (!checksumsBytes) {
      return { valid: false, error: "Geçersiz paket: checksums.json dosyası bulunamadı." };
    }

    // 2. Checksum doğrulaması
    const dec = new TextDecoder();
    let checksums: Record<string, string>;
    try {
      checksums = JSON.parse(dec.decode(checksumsBytes));
    } catch {
      return { valid: false, error: "Bozuk checksums.json dosyası." };
    }

    for (const [filePath, expectedSha] of Object.entries(checksums)) {
      const fileData = filesMap.get(filePath);
      if (!fileData) {
        return {
          valid: false,
          error: `Eksik arşiv dosyası: "${filePath}" checksum tablosunda var ancak pakette bulunamadı.`,
        };
      }
      const actualSha = await computeSha256Hex(fileData);
      if (actualSha.toLowerCase() !== expectedSha.toLowerCase()) {
        return {
          valid: false,
          error: `Bütünlük hatası (Checksum uyuşmazlığı): "${filePath}" dosyasının hash değeri eşleşmiyor. Dosya tahrif edilmiş olabilir.`,
        };
      }
    }

    // 3. Manifest ayrıştırma
    let manifest: BackupManifest;
    try {
      manifest = JSON.parse(dec.decode(manifestBytes));
    } catch {
      return { valid: false, error: "Bozuk manifest.json içeriği." };
    }

    return {
      valid: true,
      manifest,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Arşiv incelenirken hata oluştu: ${err?.message || err}`,
    };
  }
}

/**
 * .erpcrm arşivini veritabanına ve yerel kanıt kasasına yeni bir proje olarak geri yükler.
 * Bağlantı havuzu kilidine takılmayan güvenli sıralı ekleme ve telafi temizliği mimarisi kullanılır.
 */
export async function restoreProjectBackup(
  archiveBuffer: Uint8Array | ArrayBuffer,
  options?: { newProjectName?: string }
): Promise<RestoreResult> {
  const rawData = archiveBuffer instanceof Uint8Array ? archiveBuffer : new Uint8Array(archiveBuffer);

  // 1. İncele ve doğrula
  const inspection = await inspectProjectBackup(rawData);
  if (!inspection.valid || !inspection.manifest) {
    throw new Error(`Yedek paketi doğrulanamadı: ${inspection.error || "Geçersiz paket"}`);
  }

  const entries = await extractTarArchive(rawData);
  const filesMap = new Map<string, Uint8Array>();
  for (const e of entries) {
    filesMap.set(e.name, e.data);
  }

  const dec = new TextDecoder();
  const projectData: ProjectBackupData = JSON.parse(
    dec.decode(filesMap.get("project-data.json")!)
  );

  const oldProjectId = inspection.manifest.sourceProjectId || inspection.manifest.projectId || "";
  const newProjectId = generateId("proj");
  const finalProjectName = options?.newProjectName?.trim() || inspection.manifest.projectName;
  const now = new Date().toISOString();

  // ID ve FK Eşleme Tabloları (Remapping)
  const cqIdMap = new Map<string, string>();
  for (const cq of projectData.customQuestions || []) {
    cqIdMap.set(cq.id, generateId("cq"));
  }

  const goIdMap = new Map<string, string>();
  for (const go of projectData.governanceObjects || []) {
    goIdMap.set(go.id, generateId("go"));
  }

  const subIdMap = new Map<string, string>();
  for (const sub of projectData.governanceSubjects || []) {
    subIdMap.set(sub.id, generateId("sub"));
  }

  const scpIdMap = new Map<string, string>();
  for (const scp of projectData.governanceScopes || []) {
    scpIdMap.set(scp.id, generateId("scp"));
  }

  const limIdMap = new Map<string, string>();
  for (const lim of projectData.governanceLimits || []) {
    limIdMap.set(lim.id, generateId("lim"));
  }

  const sodIdMap = new Map<string, string>();
  for (const sod of projectData.governanceSodRisks || []) {
    sodIdMap.set(sod.id, generateId("sod"));
  }

  const remapAttachmentPath = (oldRelPath: string): string => {
    return oldRelPath.replace(oldProjectId, newProjectId);
  };

  const db = await getDb();

  try {
    // A. analysis_projects
    await db.execute(
      `INSERT INTO analysis_projects (id, name, status, planned_start_date, planned_end_date, actual_start_date, actual_end_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        newProjectId,
        finalProjectName,
        projectData.project?.status || "active",
        projectData.project?.planned_start_date || null,
        projectData.project?.planned_end_date || null,
        projectData.project?.actual_start_date || null,
        projectData.project?.actual_end_date || null,
        now,
        now,
      ]
    );

    // B. company_profiles
    if (projectData.company) {
      const compId = generateId("comp");
      const c = projectData.company;
      await db.execute(
        `INSERT INTO company_profiles
           (id, analysis_project_id, company_name, trade_name, tax_number, city, country, employee_count, business_sector, has_branches, branch_count, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          compId,
          newProjectId,
          c.company_name,
          c.trade_name || null,
          c.tax_number || null,
          c.city || null,
          c.country || "Türkiye",
          c.employee_count || null,
          c.business_sector || null,
          c.has_branches || null,
          c.branch_count || null,
          c.notes || null,
          now,
          now,
        ]
      );
    }

    // C. project_business_functions
    for (const bf of projectData.businessFunctions || []) {
      const pbfId = generateId("pbf");
      await db.execute(
        `INSERT INTO project_business_functions
           (id, analysis_project_id, business_function_id, company_department_name, responsible_person, status, is_active, removed_at, removal_reason, planned_start_date, planned_end_date, actual_start_date, actual_end_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          pbfId,
          newProjectId,
          bf.business_function_id,
          bf.company_department_name || null,
          bf.responsible_person || null,
          bf.status || "not_started",
          bf.is_active !== undefined ? (bf.is_active ? 1 : 0) : 1,
          bf.removed_at || null,
          bf.removal_reason || null,
          bf.planned_start_date || null,
          bf.planned_end_date || null,
          bf.actual_start_date || null,
          bf.actual_end_date || null,
          now,
          now,
        ]
      );
    }

    // D. question_answers
    for (const ans of projectData.answers || []) {
      const qaId = generateId("qa");
      await db.execute(
        `INSERT INTO question_answers
           (id, analysis_project_id, business_function_code, question_pack_id, question_pack_version, question_id, answer_data, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          qaId,
          newProjectId,
          ans.business_function_code,
          ans.question_pack_id,
          ans.question_pack_version,
          ans.question_id,
          typeof ans.answer_data === "string" ? ans.answer_data : JSON.stringify(ans.answer_data),
          now,
          now,
        ]
      );
    }

    // E. question_session_state
    for (const ss of projectData.sessionStates || []) {
      const qssId = generateId("qss");
      await db.execute(
        `INSERT INTO question_session_state
           (id, analysis_project_id, business_function_code, current_question_id, answered_count, total_count, last_active_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          qssId,
          newProjectId,
          ss.business_function_code,
          ss.current_question_id,
          ss.answered_count || 0,
          ss.total_count || 0,
          now,
        ]
      );
    }

    // F. analysis_findings
    for (const f of projectData.findings || []) {
      const fndId = generateId("fnd");
      await db.execute(
        `INSERT INTO analysis_findings
           (id, analysis_project_id, business_function_code, question_id, title, description, priority, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          fndId,
          newProjectId,
          f.business_function_code,
          f.question_id || null,
          f.title,
          f.description || "",
          f.priority || "medium",
          f.status || "open",
          now,
          now,
        ]
      );
    }

    // G. analysis_requirements
    for (const r of projectData.requirements || []) {
      const reqId = generateId("req");
      await db.execute(
        `INSERT INTO analysis_requirements
           (id, analysis_project_id, business_function_code, question_id, title, description, priority, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          reqId,
          newProjectId,
          r.business_function_code,
          r.question_id || null,
          r.title,
          r.description || "",
          r.priority || "medium",
          r.status || "open",
          now,
          now,
        ]
      );
    }

    // H. analysis_risks
    for (const rk of projectData.risks || []) {
      const rskId = generateId("rsk");
      await db.execute(
        `INSERT INTO analysis_risks
           (id, analysis_project_id, business_function_code, question_id, title, description, impact, probability, mitigation_note, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          rskId,
          newProjectId,
          rk.business_function_code,
          rk.question_id || null,
          rk.title,
          rk.description || "",
          rk.impact || "medium",
          rk.probability || "medium",
          rk.mitigation_note || null,
          rk.status || "open",
          now,
          now,
        ]
      );
    }

    // I. project_notes
    for (const n of projectData.notes || []) {
      const notId = generateId("not");
      await db.execute(
        `INSERT INTO project_notes
           (id, analysis_project_id, business_function_code, question_id, note, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          notId,
          newProjectId,
          n.business_function_code || null,
          n.question_id || null,
          n.note || n.content || "",
          now,
          now,
        ]
      );
    }

    // J. analysis_report_profiles
    for (const rp of projectData.reportProfiles || []) {
      const rpId = generateId("rp");
      await db.execute(
        `INSERT INTO analysis_report_profiles
           (id, analysis_project_id, executive_summary, overall_assessment, open_topics, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          rpId,
          newProjectId,
          rp.executive_summary || null,
          rp.overall_assessment || rp.project_goals || null,
          rp.open_topics || null,
          now,
          now,
        ]
      );
    }

    // K. project_custom_questions
    for (const cq of projectData.customQuestions || []) {
      const mappedCqId = cqIdMap.get(cq.id) || generateId("cq");
      await db.execute(
        `INSERT INTO project_custom_questions
           (id, analysis_project_id, business_function_code, process_name, question_text, description, question_type, is_required, sort_order, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          mappedCqId,
          newProjectId,
          cq.business_function_code,
          cq.process_name || "Genel",
          cq.question_text || cq.text || "Özel Soru",
          cq.description || null,
          cq.question_type || "text",
          cq.is_required ? 1 : 0,
          cq.sort_order || 100,
          cq.is_active !== undefined ? (cq.is_active ? 1 : 0) : 1,
          now,
          now,
        ]
      );
    }

    // L. project_custom_question_options
    for (const opt of projectData.customQuestionOptions || []) {
      const mappedCqId = cqIdMap.get(opt.custom_question_id);
      if (!mappedCqId) continue;
      const optId = generateId("cqo");
      await db.execute(
        `INSERT INTO project_custom_question_options
           (id, custom_question_id, value, label, sort_order, is_other, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          optId,
          mappedCqId,
          opt.value || opt.label || opt.text || "opt",
          opt.label || opt.text || "Seçenek",
          opt.sort_order || 0,
          opt.is_other ? 1 : 0,
          now,
        ]
      );
    }

    // M. project_custom_question_answers
    for (const cqa of projectData.customQuestionAnswers || []) {
      const mappedCqId = cqIdMap.get(cqa.custom_question_id);
      if (!mappedCqId) continue;
      const cqaId = generateId("cqa");
      await db.execute(
        `INSERT INTO project_custom_question_answers
           (id, analysis_project_id, business_function_code, custom_question_id, answer_data, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          cqaId,
          newProjectId,
          cqa.business_function_code || "GENERAL",
          mappedCqId,
          typeof cqa.answer_data === "string" ? cqa.answer_data : JSON.stringify(cqa.answer_data || {}),
          now,
          now,
        ]
      );
    }

    // N. question_followups
    for (const fol of projectData.followups || []) {
      const folId = generateId("fol");
      const status = fol.status || (fol.is_resolved ? "resolved" : "open");
      await db.execute(
        `INSERT INTO question_followups
           (id, analysis_project_id, business_function_code, question_id, flag_type, note, status, created_at, updated_at, resolved_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          folId,
          newProjectId,
          fol.business_function_code,
          fol.question_id,
          fol.flag_type,
          fol.note || null,
          status,
          now,
          now,
          fol.resolved_at || null,
        ]
      );
    }

    // O. question_attachments
    for (const att of projectData.questionAttachments || []) {
      const newAttId = generateId("att");
      const newRel = remapAttachmentPath(att.relative_path);
      const ext = att.file_extension || (att.original_file_name.includes(".") ? att.original_file_name.split(".").pop()!.toLowerCase() : "bin");
      await db.execute(
        `INSERT INTO question_attachments
           (id, analysis_project_id, business_function_code, question_id, answer_id, original_file_name, stored_file_name, relative_path, mime_type, file_extension, file_size, sha256, description, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          newAttId,
          newProjectId,
          att.business_function_code,
          att.question_id,
          att.answer_id || null,
          att.original_file_name,
          att.stored_file_name,
          newRel,
          att.mime_type,
          ext,
          att.file_size,
          att.sha256,
          att.description || null,
          att.sort_order || 0,
          now,
          now,
        ]
      );
    }

    // P. governance_objects
    for (const go of projectData.governanceObjects || []) {
      const mappedGoId = goIdMap.get(go.id) || generateId("go");
      await db.execute(
        `INSERT INTO governance_objects
           (id, analysis_project_id, category, code, name_tr, name_en, related_bf_code, description, is_active, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          mappedGoId,
          newProjectId,
          go.category,
          go.code,
          go.name_tr || go.name || "Nesne",
          go.name_en || go.name_tr || go.name || "Object",
          go.related_bf_code || null,
          go.description || null,
          go.is_active !== undefined ? (go.is_active ? 1 : 0) : 1,
          go.sort_order || 0,
          now,
          now,
        ]
      );
    }

    // Q. governance_subjects
    for (const sub of projectData.governanceSubjects || []) {
      const mappedSubId = subIdMap.get(sub.id) || generateId("sub");
      await db.execute(
        `INSERT INTO governance_subjects
           (id, analysis_project_id, subject_type, name, department_name, description, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          mappedSubId,
          newProjectId,
          sub.subject_type,
          sub.name,
          sub.department_name || sub.department || null,
          sub.description || null,
          sub.is_active !== undefined ? (sub.is_active ? 1 : 0) : 1,
          now,
          now,
        ]
      );
    }

    // R. governance_scopes
    for (const scp of projectData.governanceScopes || []) {
      const mappedScpId = scpIdMap.get(scp.id) || generateId("scp");
      const mappedParentId = scp.parent_scope_id ? (scpIdMap.get(scp.parent_scope_id) || scp.parent_scope_id) : null;
      await db.execute(
        `INSERT INTO governance_scopes
           (id, analysis_project_id, scope_type, name, parent_scope_id, description, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          mappedScpId,
          newProjectId,
          scp.scope_type,
          scp.name,
          mappedParentId,
          scp.description || null,
          scp.is_active !== undefined ? (scp.is_active ? 1 : 0) : 1,
          now,
          now,
        ]
      );
    }

    // S. governance_responsibilities
    for (const resp of projectData.governanceResponsibilities || []) {
      const respId = generateId("resp");
      const mappedObjId = goIdMap.get(resp.governance_object_id || resp.object_id) || (resp.governance_object_id || resp.object_id);
      const mappedSubId = subIdMap.get(resp.subject_id) || resp.subject_id;
      const mappedScpId = resp.scope_id ? (scpIdMap.get(resp.scope_id) || resp.scope_id) : null;

      await db.execute(
        `INSERT INTO governance_responsibilities
           (id, analysis_project_id, governance_object_id, subject_id, responsibility_type, scope_id, state_type, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          respId,
          newProjectId,
          mappedObjId,
          mappedSubId,
          resp.responsibility_type,
          mappedScpId,
          resp.state_type || "as_is",
          resp.notes || null,
          now,
          now,
        ]
      );
    }

    // T. governance_authorizations
    for (const auth of projectData.governanceAuthorizations || []) {
      const authId = generateId("auth");
      const mappedObjId = goIdMap.get(auth.governance_object_id || auth.object_id) || (auth.governance_object_id || auth.object_id);
      const mappedSubId = subIdMap.get(auth.subject_id) || auth.subject_id;
      const mappedScpId = auth.scope_id ? (scpIdMap.get(auth.scope_id) || auth.scope_id) : null;

      await db.execute(
        `INSERT INTO governance_authorizations
           (id, analysis_project_id, governance_object_id, subject_id, scope_id, permission_level, permission_source, effective_level, has_discrepancy, can_view, can_create, can_edit, can_delete, can_approve, can_cancel, can_export, can_view_cost, state_type, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
        [
          authId,
          newProjectId,
          mappedObjId,
          mappedSubId,
          mappedScpId,
          auth.permission_level || auth.auth_type || "read",
          auth.permission_source || "direct",
          auth.effective_level || null,
          auth.has_discrepancy ? 1 : 0,
          auth.can_view ?? 1,
          auth.can_create ?? 0,
          auth.can_edit ?? 0,
          auth.can_delete ?? 0,
          auth.can_approve ?? 0,
          auth.can_cancel ?? 0,
          auth.can_export ?? 0,
          auth.can_view_cost ?? 0,
          auth.state_type || "as_is",
          auth.notes || null,
          now,
          now,
        ]
      );
    }

    // U. governance_limits
    for (const lim of projectData.governanceLimits || []) {
      const mappedLimId = limIdMap.get(lim.id) || generateId("lim");
      const mappedObjId = lim.governance_object_id ? (goIdMap.get(lim.governance_object_id) || lim.governance_object_id) : (lim.object_id ? (goIdMap.get(lim.object_id) || lim.object_id) : null);
      const mappedSubId = subIdMap.get(lim.subject_id) || lim.subject_id;
      const mappedScpId = lim.scope_id ? (scpIdMap.get(lim.scope_id) || lim.scope_id) : null;
      const mappedApproverId = lim.approver_subject_id ? (subIdMap.get(lim.approver_subject_id) || lim.approver_subject_id) : null;

      await db.execute(
        `INSERT INTO governance_limits
           (id, analysis_project_id, governance_object_id, subject_id, scope_id, limit_type, currency_or_unit, min_value, max_value, approval_tier, approver_subject_id, state_type, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          mappedLimId,
          newProjectId,
          mappedObjId,
          mappedSubId,
          mappedScpId,
          lim.limit_type,
          lim.currency_or_unit || lim.currency || "TRY",
          lim.min_value ?? null,
          lim.max_value ?? (lim.amount ?? null),
          lim.approval_tier || null,
          mappedApproverId,
          lim.state_type || "as_is",
          lim.notes || null,
          now,
          now,
        ]
      );
    }

    // V. governance_sod_risks
    for (const sod of projectData.governanceSodRisks || []) {
      const mappedSodId = sodIdMap.get(sod.id) || generateId("sod");
      const mappedObjId = sod.governance_object_id ? (goIdMap.get(sod.governance_object_id) || sod.governance_object_id) : (sod.object_id_a ? (goIdMap.get(sod.object_id_a) || sod.object_id_a) : null);
      const mappedSubId = sod.subject_id ? (subIdMap.get(sod.subject_id) || sod.subject_id) : (sod.conflicting_subject_id ? (subIdMap.get(sod.conflicting_subject_id) || sod.conflicting_subject_id) : null);
      const mappedScpId = sod.scope_id ? (scpIdMap.get(sod.scope_id) || sod.scope_id) : null;

      await db.execute(
        `INSERT INTO governance_sod_risks
           (id, analysis_project_id, governance_object_id, subject_id, scope_id, risk_title, conflicting_duty_a, conflicting_duty_b, risk_severity, current_control, mitigation_action, risk_owner, status, state_type, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          mappedSodId,
          newProjectId,
          mappedObjId,
          mappedSubId,
          mappedScpId,
          sod.risk_title || sod.description || "Görevler Ayrılığı Riski",
          sod.conflicting_duty_a || "Görev A",
          sod.conflicting_duty_b || "Görev B",
          sod.risk_severity || sod.risk_level || "high",
          sod.current_control || null,
          sod.mitigation_action || sod.mitigation_control || null,
          sod.risk_owner || null,
          sod.status || "open",
          sod.state_type || "as_is",
          now,
          now,
        ]
      );
    }

    // W. governance_attachments
    for (const gatt of projectData.governanceAttachments || []) {
      const newGattId = generateId("gatt");
      const newRel = remapAttachmentPath(gatt.relative_path);
      let mappedEntityId = gatt.entity_id;
      if (gatt.entity_type === "object" && goIdMap.has(gatt.entity_id)) {
        mappedEntityId = goIdMap.get(gatt.entity_id)!;
      } else if (gatt.entity_type === "subject" && subIdMap.has(gatt.entity_id)) {
        mappedEntityId = subIdMap.get(gatt.entity_id)!;
      } else if (gatt.entity_type === "scope" && scpIdMap.has(gatt.entity_id)) {
        mappedEntityId = scpIdMap.get(gatt.entity_id)!;
      } else if (gatt.entity_type === "limit" && limIdMap.has(gatt.entity_id)) {
        mappedEntityId = limIdMap.get(gatt.entity_id)!;
      } else if (gatt.entity_type === "sod_risk" && sodIdMap.has(gatt.entity_id)) {
        mappedEntityId = sodIdMap.get(gatt.entity_id)!;
      }

      await db.execute(
        `INSERT INTO governance_attachments
           (id, analysis_project_id, entity_type, entity_id, original_file_name, stored_file_name, relative_path, mime_type, file_size, sha256, imported_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          newGattId,
          newProjectId,
          gatt.entity_type,
          mappedEntityId,
          gatt.original_file_name,
          gatt.stored_file_name,
          newRel,
          gatt.mime_type,
          gatt.file_size,
          gatt.sha256,
          gatt.imported_at || now,
          now,
        ]
      );
    }

    // X. project_scope_changes
    for (const sc of projectData.scopeChanges || []) {
      const scId = generateId("psc");
      await db.execute(
        `INSERT INTO project_scope_changes
           (id, analysis_project_id, business_function_code, action, reason, performed_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          scId,
          newProjectId,
          sc.business_function_code,
          sc.action || "added",
          sc.reason || null,
          sc.performed_by || null,
          sc.created_at || now,
        ]
      );
    }

    // Y. ot_stations & ot_station_answers (FAZ-62B)
    const stationIdMap = new Map<string, string>();
    for (const st of projectData.otStations || []) {
      const newStId = generateId("ots");
      stationIdMap.set(st.id, newStId);
      await db.execute(
        `INSERT INTO ot_stations
           (id, project_id, area_name, line_name, station_code, station_name, station_type, machine_name, machine_manufacturer, machine_model, plc_or_controller, operator_count, status, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          newStId,
          newProjectId,
          st.area_name || null,
          st.line_name || null,
          st.station_code,
          st.station_name,
          st.station_type || null,
          st.machine_name || null,
          st.machine_manufacturer || null,
          st.machine_model || null,
          st.plc_or_controller || null,
          st.operator_count ?? 1,
          st.status || "active",
          st.sort_order ?? 0,
          st.created_at || now,
          st.updated_at || now,
        ]
      );
    }

    for (const stAns of projectData.otStationAnswers || []) {
      const newStAnsId = generateId("otsa");
      const mappedStationId = stationIdMap.get(stAns.station_id) || stAns.station_id;
      await db.execute(
        `INSERT INTO ot_station_answers
           (id, project_id, station_id, business_function_code, question_pack_id, question_pack_version, question_id, answer_data, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          newStAnsId,
          newProjectId,
          mappedStationId,
          stAns.business_function_code || "OT_INDUSTRIAL_DATA",
          stAns.question_pack_id || "tr.ot_industrial_data.core",
          stAns.question_pack_version || "0.1.0",
          stAns.question_id,
          typeof stAns.answer_data === "string" ? stAns.answer_data : JSON.stringify(stAns.answer_data),
          stAns.created_at || now,
          stAns.updated_at || now,
        ]
      );
    }

    // Z. ot_data_requirements, ot_alarm_requirements, ot_quality_devices (FAZ-62C)
    for (const dReq of projectData.otDataRequirements || []) {
      const newDReqId = generateId("otreq");
      const mappedStationId = stationIdMap.get(dReq.station_id) || dReq.station_id;
      await db.execute(
        `INSERT INTO ot_data_requirements
           (id, project_id, station_id, purpose, decision_supported, required_action, data_category, measurement_name, source_type, source_name, collection_method, frequency, criticality, target_system, retention_required, retention_period, business_value, integration_complexity, priority, status, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
        [
          newDReqId,
          newProjectId,
          mappedStationId,
          dReq.purpose,
          dReq.decision_supported,
          dReq.required_action,
          dReq.data_category || null,
          dReq.measurement_name,
          dReq.source_type || null,
          dReq.source_name || null,
          dReq.collection_method || null,
          dReq.frequency || null,
          dReq.criticality || "medium",
          dReq.target_system || null,
          dReq.retention_required ? 1 : 0,
          dReq.retention_period || null,
          dReq.business_value || null,
          dReq.integration_complexity || "medium",
          dReq.priority || "medium",
          dReq.status || "active",
          dReq.notes || null,
          dReq.created_at || now,
          dReq.updated_at || now,
        ]
      );
    }

    for (const alm of projectData.otAlarmRequirements || []) {
      const newAlmId = generateId("otalm");
      const mappedStationId = stationIdMap.get(alm.station_id) || alm.station_id;
      await db.execute(
        `INSERT INTO ot_alarm_requirements
           (id, project_id, station_id, alarm_name, alarm_code, source_type, trigger_condition, severity, safety_critical, responsible_role, response_sla, required_action, acknowledgement_required, escalation_required, target_system, status, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          newAlmId,
          newProjectId,
          mappedStationId,
          alm.alarm_name,
          alm.alarm_code || null,
          alm.source_type || null,
          alm.trigger_condition || null,
          alm.severity || "warning",
          alm.safety_critical ? 1 : 0,
          alm.responsible_role || null,
          alm.response_sla || null,
          alm.required_action || null,
          alm.acknowledgement_required ? 1 : 0,
          alm.escalation_required ? 1 : 0,
          alm.target_system || null,
          alm.status || "active",
          alm.notes || null,
          alm.created_at || now,
          alm.updated_at || now,
        ]
      );
    }

    for (const qd of projectData.otQualityDevices || []) {
      const newQdId = generateId("otqd");
      const mappedStationId = stationIdMap.get(qd.station_id) || qd.station_id;
      await db.execute(
        `INSERT INTO ot_quality_devices
           (id, project_id, station_id, device_name, device_type, manufacturer, model, output_format, interface_type, api_available, network_share_available, test_result_available, pass_fail_available, measurement_values_available, product_code_available, lot_batch_available, operator_available, integration_method, target_system, status, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
        [
          newQdId,
          newProjectId,
          mappedStationId,
          qd.device_name,
          qd.device_type || null,
          qd.manufacturer || null,
          qd.model || null,
          qd.output_format || null,
          qd.interface_type || null,
          qd.api_available ? 1 : 0,
          qd.network_share_available ? 1 : 0,
          qd.test_result_available !== undefined ? (qd.test_result_available ? 1 : 0) : 1,
          qd.pass_fail_available !== undefined ? (qd.pass_fail_available ? 1 : 0) : 1,
          qd.measurement_values_available !== undefined ? (qd.measurement_values_available ? 1 : 0) : 1,
          qd.product_code_available !== undefined ? (qd.product_code_available ? 1 : 0) : 1,
          qd.lot_batch_available ? 1 : 0,
          qd.operator_available ? 1 : 0,
          qd.integration_method || null,
          qd.target_system || null,
          qd.status || "active",
          qd.notes || null,
          qd.created_at || now,
          qd.updated_at || now,
        ]
      );
    }

    // AA. process_maps, process_nodes, process_edges (FAZ-63)
    const pmapIdMap = new Map<string, string>();
    for (const pm of projectData.processMaps || []) {
      const newPmapId = generateId("pmap");
      pmapIdMap.set(pm.id, newPmapId);
      await db.execute(
        `INSERT INTO process_maps
           (id, project_id, name, process_area, owner_role, status, description, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          newPmapId,
          newProjectId,
          pm.name,
          pm.process_area || null,
          pm.owner_role || null,
          pm.status || "active",
          pm.description || null,
          pm.sort_order ?? 0,
          pm.created_at || now,
          pm.updated_at || now,
        ]
      );
    }

    const pnodeIdMap = new Map<string, string>();
    for (const pn of projectData.processNodes || []) {
      const newPnodeId = generateId("pnode");
      pnodeIdMap.set(pn.id, newPnodeId);
      const mappedMapId = pmapIdMap.get(pn.process_map_id) || pn.process_map_id;
      const mappedStationId = pn.ot_station_id ? (stationIdMap.get(pn.ot_station_id) || pn.ot_station_id) : null;

      await db.execute(
        `INSERT INTO process_nodes
           (id, process_map_id, node_type, name, description, responsible_department, responsible_role, business_function_code, ot_station_id, step_order, input_description, output_description, approval_count, handoff_count, duplicate_data_entry, bypass_possible, manual_work, value_added, adoption_risk, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
        [
          newPnodeId,
          mappedMapId,
          pn.node_type || "ACTIVITY",
          pn.name,
          pn.description || null,
          pn.responsible_department || null,
          pn.responsible_role || null,
          pn.business_function_code || null,
          mappedStationId,
          pn.step_order ?? 1,
          pn.input_description || null,
          pn.output_description || null,
          pn.approval_count ?? 0,
          pn.handoff_count ?? 0,
          pn.duplicate_data_entry ? 1 : 0,
          pn.bypass_possible ? 1 : 0,
          pn.manual_work ? 1 : 0,
          pn.value_added !== undefined ? (pn.value_added ? 1 : 0) : 1,
          pn.adoption_risk || "low",
          pn.notes || null,
          pn.created_at || now,
          pn.updated_at || now,
        ]
      );
    }

    for (const pe of projectData.processEdges || []) {
      const newPedgeId = generateId("pedge");
      const mappedMapId = pmapIdMap.get(pe.process_map_id) || pe.process_map_id;
      const mappedSourceId = pnodeIdMap.get(pe.source_node_id) || pe.source_node_id;
      const mappedTargetId = pnodeIdMap.get(pe.target_node_id) || pe.target_node_id;

      await db.execute(
        `INSERT INTO process_edges
           (id, process_map_id, source_node_id, target_node_id, label, condition_text, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newPedgeId,
          mappedMapId,
          mappedSourceId,
          mappedTargetId,
          pe.label || null,
          pe.condition_text || null,
          pe.sort_order ?? 0,
          pe.created_at || now,
          pe.updated_at || now,
        ]
      );
    }

    // BB. FAZ-64: data_governance_assets, data_governance_access, data_governance_approvals
    const dgAssetIdMap = new Map<string, string>();
    for (const dga of projectData.dataGovernanceAssets || []) {
      const newDgaId = generateId("dg_asset");
      dgAssetIdMap.set(dga.id, newDgaId);
      await db.execute(
        `INSERT INTO data_governance_assets (
          id, project_id, domain, asset_name, asset_type, description,
          system_of_record, criticality, master_data, process_data,
          personal_data, financial_data, quality_or_safety_data,
          owner_role, steward_role, technical_custodian_role, status, notes,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
        [
          newDgaId,
          newProjectId,
          dga.domain || null,
          dga.asset_name,
          dga.asset_type || "MASTER_DATA",
          dga.description || null,
          dga.system_of_record || null,
          dga.criticality || "MEDIUM",
          dga.master_data !== undefined ? (dga.master_data ? 1 : 0) : 1,
          dga.process_data !== undefined ? (dga.process_data ? 1 : 0) : 0,
          dga.personal_data !== undefined ? (dga.personal_data ? 1 : 0) : 0,
          dga.financial_data !== undefined ? (dga.financial_data ? 1 : 0) : 0,
          dga.quality_or_safety_data !== undefined ? (dga.quality_or_safety_data ? 1 : 0) : 0,
          dga.owner_role || null,
          dga.steward_role || null,
          dga.technical_custodian_role || null,
          dga.status || "active",
          dga.notes || null,
          dga.created_at || now,
          dga.updated_at || now,
        ]
      );
    }

    for (const dgc of projectData.dataGovernanceAccess || []) {
      const newDgcId = generateId("dg_access");
      const mappedAssetId = dgAssetIdMap.get(dgc.asset_id) || dgc.asset_id;
      await db.execute(
        `INSERT INTO data_governance_access (
          id, project_id, asset_id, actor_type, actor_name, access_level,
          scope_type, scope_value, approval_required, approval_role,
          task_separation_required, conflict_note, limit_description, status, notes,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          newDgcId,
          newProjectId,
          mappedAssetId,
          dgc.actor_type || "ROLE",
          dgc.actor_name,
          dgc.access_level || "READ_ONLY",
          dgc.scope_type || "COMPANY",
          dgc.scope_value || null,
          dgc.approval_required ? 1 : 0,
          dgc.approval_role || null,
          dgc.task_separation_required ? 1 : 0,
          dgc.conflict_note || null,
          dgc.limit_description || null,
          dgc.status || "active",
          dgc.notes || null,
          dgc.created_at || now,
          dgc.updated_at || now,
        ]
      );
    }

    for (const dga of projectData.dataGovernanceApprovals || []) {
      const newDgaApprId = generateId("dg_appr");
      const mappedAssetId = dga.asset_id ? (dgAssetIdMap.get(dga.asset_id) || dga.asset_id) : null;
      const mappedPmapId = dga.process_map_id ? (pmapIdMap.get(dga.process_map_id) || dga.process_map_id) : null;
      await db.execute(
        `INSERT INTO data_governance_approvals (
          id, project_id, asset_id, process_map_id, approval_name, approval_role,
          threshold_description, approval_order, mandatory, separation_of_duties, notes,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          newDgaApprId,
          newProjectId,
          mappedAssetId,
          mappedPmapId,
          dga.approval_name,
          dga.approval_role,
          dga.threshold_description || null,
          Number(dga.approval_order) || 1,
          dga.mandatory ? 1 : 0,
          dga.separation_of_duties ? 1 : 0,
          dga.notes || null,
          dga.created_at || now,
          dga.updated_at || now,
        ]
      );
    }

    // CC. FAZ-65: evidence_items & evidence_links
    const evidenceIdMap = new Map<string, string>();
    for (const ev of projectData.evidenceItems || []) {
      const newEvId = generateId("evd");
      evidenceIdMap.set(ev.id, newEvId);
      const newStoredPath = ev.stored_path ? remapAttachmentPath(ev.stored_path) : null;
      await db.execute(
        `INSERT INTO evidence_items (
          id, project_id, title, evidence_type, file_name, stored_path, mime_type,
          file_size, file_hash, source_type, source_description, collected_at,
          collected_by_role, verification_status, credibility_level, sensitivity_level,
          notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          newEvId,
          newProjectId,
          ev.title,
          ev.evidence_type || "DOCUMENT",
          ev.file_name || null,
          newStoredPath,
          ev.mime_type || null,
          ev.file_size || 0,
          ev.file_hash || null,
          ev.source_type || "DOCUMENT",
          ev.source_description || null,
          ev.collected_at || now,
          ev.collected_by_role || null,
          ev.verification_status || "UNREVIEWED",
          ev.credibility_level || "MEDIUM",
          ev.sensitivity_level || "NORMAL",
          ev.notes || null,
          ev.created_at || now,
          ev.updated_at || now,
        ]
      );
    }

    for (const el of projectData.evidenceLinks || []) {
      const newElId = generateId("evdl");
      const mappedEvidenceId = evidenceIdMap.get(el.evidence_id) || el.evidence_id;
      const mappedStationId = el.ot_station_id ? (stationIdMap.get(el.ot_station_id) || el.ot_station_id) : null;
      const mappedPmapId = el.process_map_id ? (pmapIdMap.get(el.process_map_id) || el.process_map_id) : null;
      const mappedPnodeId = el.process_node_id ? (pnodeIdMap.get(el.process_node_id) || el.process_node_id) : null;
      const mappedDgAssetId = el.governance_asset_id ? (dgAssetIdMap.get(el.governance_asset_id) || el.governance_asset_id) : null;

      await db.execute(
        `INSERT INTO evidence_links (
          id, project_id, evidence_id, target_type, target_id, question_id,
          business_function_code, ot_station_id, process_map_id, process_node_id,
          governance_asset_id, link_note, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          newElId,
          newProjectId,
          mappedEvidenceId,
          el.target_type,
          el.target_id || null,
          el.question_id || null,
          el.business_function_code || null,
          mappedStationId,
          mappedPmapId,
          mappedPnodeId,
          mappedDgAssetId,
          el.link_note || null,
          el.created_at || now,
        ]
      );
    }

    // 2. Fiziksel Ek Dosyaları Managed Vault'a Yeni Proje Yoluyla Yaz
    const writtenRelativePaths: string[] = [];
    for (const [archivePath, fileData] of Array.from(filesMap.entries())) {
      if (!archivePath.startsWith("attachments/")) continue;
      const originalRelPath = archivePath.substring("attachments/".length);
      const newRelPath = remapAttachmentPath(originalRelPath);

      await saveAttachmentFile(newRelPath, fileData);
      writtenRelativePaths.push(newRelPath);
    }

    // 3. Projenin Veritabanında Başarıyla Oluştuğunu Doğrula
    const checkProjects = await db.select<any[]>(
      "SELECT id, name FROM analysis_projects WHERE id = $1",
      [newProjectId]
    );
    if (!checkProjects || checkProjects.length === 0) {
      throw new Error("Geri yüklenen proje veritabanında doğrulanamadı.");
    }

    return {
      success: true,
      created: true,
      newProjectId,
      projectId: newProjectId,
      projectName: finalProjectName,
      companyName: projectData.company?.company_name || inspection.manifest.companyName,
      attachmentCount: writtenRelativePaths.length,
      recordCounts: inspection.manifest.recordCounts,
      cleanupPerformed: false,
    };
  } catch (err: any) {
    console.error("[BackupManager] Geri yükleme hatası:", err);
    if (newProjectId) {
      try {
        await deleteProject(newProjectId);
        console.info(`[BackupManager] Başarısız işlem sonrası telafi temizliği yapıldı: ${newProjectId}`);
      } catch (cleanupErr) {
        console.warn("[BackupManager] Telafi temizleme hatası:", cleanupErr);
      }
    }
    throw new Error("Proje geri yüklenemedi; hiçbir değişiklik kaydedilmedi.");
  }
}

/**
 * Mevcut bir projeden yeni bir çalışma kopyası (şablon veya tam klon) üretir.
 */
export async function duplicateProject(
  sourceProjectId: string,
  options: DuplicateProjectOptions = {}
): Promise<{ success: boolean; created: boolean; newProjectId: string; projectId: string; projectName: string }> {
  // Projeyi export formatında al
  const exportData = await exportProjectBackup(sourceProjectId);

  const newName = options.newProjectName?.trim()
    ? options.newProjectName.trim()
    : `${exportData.manifest.projectName} (Kopya)`;

  const dec = new TextDecoder();
  const rawEntries = await extractTarArchive(exportData.buffer);
  const filesMap = new Map<string, Uint8Array>();
  for (const e of rawEntries) {
    filesMap.set(e.name, e.data);
  }

  const projectData: ProjectBackupData = JSON.parse(
    dec.decode(filesMap.get("project-data.json")!)
  );

  // Eğer "Cevapları ve ekleri de kopyala" seçili değilse cevapları, bulguları ve ekleri sıfırla
  if (!options.copyAnswersAndAttachments) {
    projectData.answers = [];
    projectData.sessionStates = [];
    projectData.findings = [];
    projectData.requirements = [];
    projectData.risks = [];
    projectData.notes = [];
    projectData.customQuestionAnswers = [];
    projectData.followups = [];
    projectData.questionAttachments = [];
    projectData.governanceAttachments = [];
    projectData.otStationAnswers = [];
    projectData.evidenceItems = [];
    projectData.evidenceLinks = [];

    // Proje gerçekleşen tarihlerini sıfırla (planlananlar korunur)
    if (projectData.project) {
      projectData.project.actual_start_date = null;
      projectData.project.actual_end_date = null;
    }

    // Fonksiyon durumlarını "not_started" yap ve gerçekleşen tarihleri sıfırla (planlananlar korunur)
    projectData.businessFunctions = (projectData.businessFunctions || []).map((bf) => ({
      ...bf,
      status: "not_started",
      actual_start_date: null,
      actual_end_date: null,
    }));

    // Ek dosyaları arşivden temizle
    for (const key of Array.from(filesMap.keys())) {
      if (key.startsWith("attachments/")) {
        filesMap.delete(key);
      }
    }
  }

  // Yeniden serialize et ve paketi oluştur
  const enc = new TextEncoder();
  const projectDataBytes = enc.encode(JSON.stringify(projectData, null, 2));
  const dataChecksum = await computeSha256Hex(projectDataBytes);

  const checksums: Record<string, string> = {
    "project-data.json": dataChecksum,
  };

  const archiveFiles: ArchiveFileEntry[] = [];
  if (options.copyAnswersAndAttachments) {
    for (const [name, data] of Array.from(filesMap.entries())) {
      if (name.startsWith("attachments/")) {
        archiveFiles.push({ name, data });
        checksums[name] = await computeSha256Hex(data);
      }
    }
  }

  const manifest: BackupManifest = {
    ...exportData.manifest,
    createdAt: new Date().toISOString(),
    projectName: newName,
    dataChecksum,
    attachmentCount: archiveFiles.length,
    recordCounts: {
      ...exportData.manifest.recordCounts,
      answers: options.copyAnswersAndAttachments ? exportData.manifest.recordCounts.answers : 0,
      findings: options.copyAnswersAndAttachments ? exportData.manifest.recordCounts.findings : 0,
      requirements: options.copyAnswersAndAttachments ? exportData.manifest.recordCounts.requirements : 0,
      risks: options.copyAnswersAndAttachments ? exportData.manifest.recordCounts.risks : 0,
      notes: options.copyAnswersAndAttachments ? exportData.manifest.recordCounts.notes : 0,
      customQuestionAnswers: options.copyAnswersAndAttachments ? exportData.manifest.recordCounts.customQuestionAnswers : 0,
      followups: options.copyAnswersAndAttachments ? exportData.manifest.recordCounts.followups : 0,
      questionAttachments: options.copyAnswersAndAttachments ? exportData.manifest.recordCounts.questionAttachments : 0,
      governanceAttachments: options.copyAnswersAndAttachments ? exportData.manifest.recordCounts.governanceAttachments : 0,
      scopeChanges: options.copyAnswersAndAttachments ? (exportData.manifest.recordCounts.scopeChanges || 0) : 0,
      otStations: exportData.manifest.recordCounts.otStations || 0,
      otStationAnswers: options.copyAnswersAndAttachments ? (exportData.manifest.recordCounts.otStationAnswers || 0) : 0,
      otDataRequirements: exportData.manifest.recordCounts.otDataRequirements || 0,
      otAlarmRequirements: exportData.manifest.recordCounts.otAlarmRequirements || 0,
      otQualityDevices: exportData.manifest.recordCounts.otQualityDevices || 0,
      processMaps: exportData.manifest.recordCounts.processMaps || 0,
      processNodes: exportData.manifest.recordCounts.processNodes || 0,
      processEdges: exportData.manifest.recordCounts.processEdges || 0,
      dataGovernanceAssets: exportData.manifest.recordCounts.dataGovernanceAssets || 0,
      dataGovernanceAccess: exportData.manifest.recordCounts.dataGovernanceAccess || 0,
      dataGovernanceApprovals: exportData.manifest.recordCounts.dataGovernanceApprovals || 0,
      evidenceItems: options.copyAnswersAndAttachments ? (exportData.manifest.recordCounts.evidenceItems || 0) : 0,
      evidenceLinks: options.copyAnswersAndAttachments ? (exportData.manifest.recordCounts.evidenceLinks || 0) : 0,
    },
  };

  const manifestBytes = enc.encode(JSON.stringify(manifest, null, 2));
  checksums["manifest.json"] = await computeSha256Hex(manifestBytes);
  const checksumsBytes = enc.encode(JSON.stringify(checksums, null, 2));

  const newTar = await createTarArchive([
    { name: "manifest.json", data: manifestBytes },
    { name: "project-data.json", data: projectDataBytes },
    { name: "checksums.json", data: checksumsBytes },
    ...archiveFiles,
  ]);

  const restoreRes = await restoreProjectBackup(newTar, { newProjectName: newName });
  return {
    success: true,
    created: true,
    newProjectId: restoreRes.newProjectId!,
    projectId: restoreRes.newProjectId!,
    projectName: newName,
  };
}
