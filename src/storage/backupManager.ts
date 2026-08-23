/**
 * ERP CRM Discovery — Project Backup, Restore & Portability Manager
 * FAZ-51: Tek arşivli (.erpcrm) proje dışa aktarma, içe aktarma ve çoğaltma servisi
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

export const BACKUP_FORMAT_VERSION = "1.0.0";
export const BACKUP_CURRENT_SCHEMA_VERSION = 11;

/**
 * Dosya adı için güvenli tarih eki üretir (YYYY-MM-DD).
 */
function getFormattedDateStamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

  // 2. Fonksiyonlar, Cevaplar ve Notlar
  const businessFunctions = await db.select<any[]>(
    "SELECT * FROM project_business_functions WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );
  const answers = await db.select<any[]>(
    "SELECT * FROM question_answers WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );
  const sessionStates = await db.select<any[]>(
    "SELECT * FROM question_session_state WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );
  const findings = await db.select<any[]>(
    "SELECT * FROM analysis_findings WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );
  const requirements = await db.select<any[]>(
    "SELECT * FROM analysis_requirements WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );
  const risks = await db.select<any[]>(
    "SELECT * FROM analysis_risks WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );
  const notes = await db.select<any[]>(
    "SELECT * FROM project_notes WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );
  const reportProfiles = await db.select<any[]>(
    "SELECT * FROM analysis_report_profiles WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );

  // 3. Özel Sorular
  const customQuestions = await db.select<any[]>(
    "SELECT * FROM project_custom_questions WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );
  const cqIds = customQuestions.map((q) => q.id);
  let customQuestionOptions: any[] = [];
  if (cqIds.length > 0) {
    const placeholders = cqIds.map((_, i) => `$${i + 1}`).join(",");
    customQuestionOptions = await db.select<any[]>(
      `SELECT * FROM project_custom_question_options WHERE custom_question_id IN (${placeholders}) ORDER BY id`,
      cqIds
    );
  }
  const customQuestionAnswers = await db.select<any[]>(
    "SELECT * FROM project_custom_question_answers WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );
  const followups = await db.select<any[]>(
    "SELECT * FROM question_followups WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );

  // 4. Ek Dosyalar (Gizlilik: source_absolute_path sıfırlanır)
  const rawQuestionAttachments = await db.select<any[]>(
    "SELECT * FROM question_attachments WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );
  const questionAttachments = rawQuestionAttachments.map((att) => ({
    ...att,
    source_absolute_path: null, // Asla mutlak işletim sistemi yolu dışarı sızdırılmaz
  }));

  // 5. Veri ve Yetki Yönetişimi Kayıtları
  const governanceObjects = await db.select<any[]>(
    "SELECT * FROM governance_objects WHERE analysis_project_id = $1 ORDER BY sort_order, id",
    [projectId]
  );
  const governanceSubjects = await db.select<any[]>(
    "SELECT * FROM governance_subjects WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );
  const governanceScopes = await db.select<any[]>(
    "SELECT * FROM governance_scopes WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );
  const governanceResponsibilities = await db.select<any[]>(
    "SELECT * FROM governance_responsibilities WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );
  const governanceAuthorizations = await db.select<any[]>(
    "SELECT * FROM governance_authorizations WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );
  const governanceLimits = await db.select<any[]>(
    "SELECT * FROM governance_limits WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );

  const governanceSodRisks = await db.select<any[]>(
    "SELECT * FROM governance_sod_risks WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );
  const rawGovernanceAttachments = await db.select<any[]>(
    "SELECT * FROM governance_attachments WHERE analysis_project_id = $1 ORDER BY id",
    [projectId]
  );
  const governanceAttachments = rawGovernanceAttachments.map((att) => ({
    ...att,
    source_absolute_path: null,
  }));

  // 6. Proje Veri Modelini Oluştur
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
  };

  const enc = new TextEncoder();
  const projectDataBytes = enc.encode(JSON.stringify(projectData, null, 2));
  const dataChecksum = await computeSha256Hex(projectDataBytes);

  // 7. Fiziksel Ek Dosyaları Oku ve Checksum'larını Hesapla
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

  // 8. Manifest Dosyasını Oluştur
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
    governanceAttachments: governanceAttachments.length,
    questionAttachments: questionAttachments.length,
  };

  const manifest: BackupManifest = {
    formatVersion: BACKUP_FORMAT_VERSION,
    appVersion: "0.1.1",
    createdAt: new Date().toISOString(),
    sourceProjectId: projectId,
    projectName: project.name,
    companyName: company ? company.company_name : "Firma",
    schemaVersion: BACKUP_CURRENT_SCHEMA_VERSION,
    recordCounts,
    attachmentCount: archiveFiles.length,
    dataChecksum,
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
  const fileName = `${safeCompany}_${safeProject}_${dateStamp}.erpcrm`;

  return {
    buffer: archiveBuffer,
    blob,
    fileName,
    manifest,
  };
}

export interface SaveBackupResult {
  cancelled?: boolean;
  filePath?: string;
  fileName: string;
  fileSize: number;
  projectName: string;
}

/**
 * Kullanıcıya işletim sistemi dosya kaydetme penceresi göstererek .erpcrm yedeğini seçilen konuma yazar.
 */
export async function saveProjectBackupToFile(
  projectId: string,
  options?: { defaultPathOverride?: string }
): Promise<SaveBackupResult> {
  const exportData = await exportProjectBackup(projectId);

  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    try {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const { writeFile } = await import("@tauri-apps/plugin-fs");

      const selectedPath = await save({
        defaultPath: options?.defaultPathOverride || exportData.fileName,
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
        };
      }

      await writeFile(selectedPath, exportData.buffer);

      return {
        filePath: selectedPath,
        fileName: exportData.fileName,
        fileSize: exportData.buffer.byteLength,
        projectName: exportData.manifest.projectName,
      };
    } catch (dialogErr: any) {
      console.warn("Tauri native save dialog fallback:", dialogErr);
    }
  }

  // Web / fallback ortamı
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    try {
      const url = URL.createObjectURL(exportData.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportData.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (dlErr) {
      console.warn("Browser download error:", dlErr);
    }
  }
  return {
    fileName: exportData.fileName,
    fileSize: exportData.buffer.byteLength,
    projectName: exportData.manifest.projectName,
  };
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
          error: `Bütünlük (Checksum) Hatası: "${filePath}" dosyası bozulmuş veya değiştirilmiş.`,
        };
      }
    }

    // 3. Manifest ayrıştırma ve sürüm uyumluluk kontrolü
    let manifest: BackupManifest;
    try {
      manifest = JSON.parse(dec.decode(manifestBytes));
    } catch {
      return { valid: false, error: "Bozuk manifest.json dosyası." };
    }

    if (!manifest.projectName || !manifest.formatVersion) {
      return { valid: false, error: "Geçersiz manifest yapısı: proje bilgisi eksik." };
    }

    // 4. Project Data JSON doğrulaması
    try {
      JSON.parse(dec.decode(projectDataBytes));
    } catch {
      return { valid: false, error: "Bozuk project-data.json veri yapısı." };
    }

    return {
      valid: true,
      manifest,
      warnings: [],
    };
  } catch (err: any) {
    return {
      valid: false,
      error: err?.message || "Arşiv dosyası incelenirken bilinmeyen bir hata oluştu.",
    };
  }
}

/**
 * .erpcrm arşivini atomik olarak SQLite veritabanına ve Managed Vault'a yeni bir proje olarak geri yükler.
 */
export async function restoreProjectBackup(
  archiveBuffer: Uint8Array | ArrayBuffer,
  options?: { newProjectName?: string }
): Promise<RestoreResult> {
  const inspection = await inspectProjectBackup(archiveBuffer);
  if (!inspection.valid || !inspection.manifest) {
    throw new Error(inspection.error || "Proje paketi doğrulanamadı.");
  }

  const rawData = archiveBuffer instanceof Uint8Array ? archiveBuffer : new Uint8Array(archiveBuffer);
  const entries = await extractTarArchive(rawData);
  const filesMap = new Map<string, Uint8Array>();
  for (const e of entries) {
    filesMap.set(e.name, e.data);
  }

  const dec = new TextDecoder();
  const projectData: ProjectBackupData = JSON.parse(
    dec.decode(filesMap.get("project-data.json")!)
  );

  const oldProjectId = projectData.project?.id || inspection.manifest.sourceProjectId;
  const newProjectId = generateId("proj");
  const now = new Date().toISOString();

  const finalProjectName = options?.newProjectName?.trim()
    ? options.newProjectName.trim()
    : `${projectData.project?.name || inspection.manifest.projectName} — İçe Aktarılan Kopya`;

  // ID Remapping Tabloları (Foreign Key bütünlüğünü korumak için)
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

  // 1. Veritabanı Kayıtlarını Sıralı Ekle (Hata durumunda kontrollü telafi temizliği)
  const db = await getDb();

  try {
    // A. analysis_projects
    await db.execute(
      `INSERT INTO analysis_projects (id, name, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        newProjectId,
        finalProjectName,
        projectData.project?.status || "active",
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
           (id, analysis_project_id, business_function_id, company_department_name, responsible_person, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          pbfId,
          newProjectId,
          bf.business_function_id,
          bf.company_department_name || null,
          bf.responsible_person || null,
          bf.status || "not_started",
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
           (id, analysis_project_id, business_function_code, note_text, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [notId, newProjectId, n.business_function_code, n.note_text, now, now]
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
          rp.overall_assessment || null,
          rp.open_topics || null,
          now,
          now,
        ]
      );
    }


    // K. project_custom_questions & options & answers
    for (const cq of projectData.customQuestions || []) {
      const newCqId = cqIdMap.get(cq.id) || generateId("cq");
      await db.execute(
        `INSERT INTO project_custom_questions
           (id, analysis_project_id, business_function_code, process_name, question_text, description, question_type, is_required, sort_order, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          newCqId,
          newProjectId,
          cq.business_function_code,
          cq.process_name || "Genel",
          cq.question_text,
          cq.description || null,
          cq.question_type || "text",
          cq.is_required ? 1 : 0,
          cq.sort_order || 100,
          cq.is_active !== undefined ? (cq.is_active ? 1 : 0) : 1,
          now,
          now,
        ]
      );

      // Options
      const matchingOptions = (projectData.customQuestionOptions || []).filter(
        (opt) => opt.custom_question_id === cq.id
      );
      for (const opt of matchingOptions) {
        const optId = generateId("cqo");
        await db.execute(
          `INSERT INTO project_custom_question_options
             (id, custom_question_id, value, label, sort_order, is_other, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            optId,
            newCqId,
            opt.value || opt.option_value || "opt",
            opt.label || opt.option_label || "Option",
            opt.sort_order || 0,
            opt.is_other ? 1 : 0,
            now,
          ]
        );
      }
    }

    for (const cqa of projectData.customQuestionAnswers || []) {
      const cqaId = generateId("cqa");
      const mappedCqId = cqIdMap.get(cqa.custom_question_id) || cqa.custom_question_id;
      await db.execute(
        `INSERT INTO project_custom_question_answers
           (id, analysis_project_id, business_function_code, custom_question_id, answer_data, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          cqaId,
          newProjectId,
          cqa.business_function_code || "GENERAL",
          mappedCqId,
          typeof cqa.answer_data === "string" ? cqa.answer_data : JSON.stringify(cqa.answer_data),
          now,
          now,
        ]
      );
    }


    // L. question_followups
    for (const qf of projectData.followups || []) {
      const qfId = generateId("qf");
      await db.execute(
        `INSERT INTO question_followups
           (id, analysis_project_id, business_function_code, question_id, flag_type, reason_note, is_resolved, resolved_at, resolution_note, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          qfId,
          newProjectId,
          qf.business_function_code,
          qf.question_id,
          qf.flag_type || "revisit",
          qf.reason_note || null,
          qf.is_resolved ? 1 : 0,
          qf.resolved_at || null,
          qf.resolution_note || null,
          now,
          now,
        ]
      );
    }

    // M. question_attachments
    for (const qa of projectData.questionAttachments || []) {
      const attId = generateId("att");
      const newRel = remapAttachmentPath(qa.relative_path);
      await db.execute(
        `INSERT INTO question_attachments
           (id, analysis_project_id, business_function_code, question_id, answer_id, original_file_name, stored_file_name, relative_path, mime_type, file_extension, file_size, sha256, description, source_file_name, source_absolute_path, imported_at, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          attId,
          newProjectId,
          qa.business_function_code,
          qa.question_id,
          null,
          qa.original_file_name,
          qa.stored_file_name,
          newRel,
          qa.mime_type,
          qa.file_extension,
          qa.file_size,
          qa.sha256,
          qa.description || null,
          qa.source_file_name || null,
          null, // source_absolute_path is null
          now,
          qa.sort_order || 0,
          now,
          now,
        ]
      );
    }

    // N. Governance Tables
    for (const go of projectData.governanceObjects || []) {
      const newGoId = goIdMap.get(go.id) || generateId("go");
      await db.execute(
        `INSERT INTO governance_objects
           (id, analysis_project_id, code, category, name_tr, name_en, description, related_bf_code, sort_order, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          newGoId,
          newProjectId,
          go.code,
          go.category,
          go.name_tr,
          go.name_en || null,
          go.description || null,
          go.related_bf_code || null,
          go.sort_order || 0,
          go.is_active ? 1 : 0,
          now,
          now,
        ]
      );
    }

    for (const sub of projectData.governanceSubjects || []) {
      const newSubId = subIdMap.get(sub.id) || generateId("sub");
      await db.execute(
        `INSERT INTO governance_subjects
           (id, analysis_project_id, subject_type, name, department_name, description, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newSubId,
          newProjectId,
          sub.subject_type,
          sub.name,
          sub.department_name || sub.department || null,
          sub.description || sub.notes || null,
          sub.is_active ? 1 : 0,
          now,
          now,
        ]
      );
    }

    for (const scp of projectData.governanceScopes || []) {
      const newScpId = scpIdMap.get(scp.id) || generateId("scp");
      await db.execute(
        `INSERT INTO governance_scopes
           (id, analysis_project_id, scope_type, name, parent_scope_id, description, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newScpId,
          newProjectId,
          scp.scope_type,
          scp.name,
          scp.parent_scope_id ? scpIdMap.get(scp.parent_scope_id) || scp.parent_scope_id : null,
          scp.description || null,
          scp.is_active ? 1 : 0,
          now,
          now,
        ]
      );
    }

    for (const resp of projectData.governanceResponsibilities || []) {
      const newRespId = generateId("resp");
      const mappedGoId = goIdMap.get(resp.governance_object_id) || resp.governance_object_id;
      const mappedSubId = subIdMap.get(resp.subject_id) || resp.subject_id;
      const mappedScpId = resp.scope_id ? scpIdMap.get(resp.scope_id) || resp.scope_id : null;
      await db.execute(
        `INSERT INTO governance_responsibilities
           (id, analysis_project_id, governance_object_id, subject_id, responsibility_type, scope_id, state_type, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          newRespId,
          newProjectId,
          mappedGoId,
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

    for (const auth of projectData.governanceAuthorizations || []) {
      const newAuthId = generateId("auth");
      const mappedGoId = goIdMap.get(auth.governance_object_id) || auth.governance_object_id;
      const mappedSubId = subIdMap.get(auth.subject_id) || auth.subject_id;
      const mappedScpId = auth.scope_id ? scpIdMap.get(auth.scope_id) || auth.scope_id : null;
      await db.execute(
        `INSERT INTO governance_authorizations
           (id, analysis_project_id, governance_object_id, subject_id, scope_id, permission_level, permission_source, effective_level, has_discrepancy, can_view, can_create, can_edit, can_delete, can_approve, can_cancel, can_export, can_view_cost, state_type, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
        [
          newAuthId,
          newProjectId,
          mappedGoId,
          mappedSubId,
          mappedScpId,
          auth.permission_level || auth.auth_level || "view",
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

    for (const lim of projectData.governanceLimits || []) {
      const newLimId = limIdMap.get(lim.id) || generateId("lim");
      const mappedGoId = lim.governance_object_id ? goIdMap.get(lim.governance_object_id) || lim.governance_object_id : null;
      const mappedSubId = subIdMap.get(lim.subject_id) || lim.subject_id;
      const mappedScpId = lim.scope_id ? scpIdMap.get(lim.scope_id) || lim.scope_id : null;
      await db.execute(
        `INSERT INTO governance_limits
           (id, analysis_project_id, governance_object_id, subject_id, scope_id, limit_type, currency_or_unit, min_value, max_value, approval_tier, approver_subject_id, state_type, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          newLimId,
          newProjectId,
          mappedGoId,
          mappedSubId,
          mappedScpId,
          lim.limit_type || "approval_financial",
          lim.currency_or_unit || lim.currency || "TRY",
          lim.min_value ?? lim.min_amount ?? null,
          lim.max_value ?? lim.max_amount ?? null,
          lim.approval_tier || null,
          lim.approver_subject_id ? subIdMap.get(lim.approver_subject_id) || lim.approver_subject_id : null,
          lim.state_type || "as_is",
          lim.notes || null,
          now,
          now,
        ]
      );
    }

    for (const sod of projectData.governanceSodRisks || []) {
      const newSodId = sodIdMap.get(sod.id) || generateId("sod");
      const mappedGoId = sod.governance_object_id ? goIdMap.get(sod.governance_object_id) || sod.governance_object_id : null;
      const mappedSubId = sod.subject_id ? subIdMap.get(sod.subject_id) || sod.subject_id : null;
      const mappedScpId = sod.scope_id ? scpIdMap.get(sod.scope_id) || sod.scope_id : null;
      await db.execute(
        `INSERT INTO governance_sod_risks
           (id, analysis_project_id, governance_object_id, subject_id, scope_id, risk_title, conflicting_duty_a, conflicting_duty_b, risk_severity, current_control, mitigation_action, risk_owner, status, state_type, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          newSodId,
          newProjectId,
          mappedGoId,
          mappedSubId,
          mappedScpId,
          sod.risk_title || sod.conflict_description || "SoD Riski",
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


  } catch (dbErr: any) {
    console.error("[BackupManager] Veritabanı yazma hatası:", dbErr);
    try {
      await deleteProject(newProjectId);
    } catch (cleanupErr) {
      console.warn("[BackupManager] Telafi temizleme hatası:", cleanupErr);
    }
    throw new Error("Proje çoğaltılamadı. Veritabanı işlemi tamamlanamadı; hiçbir değişiklik kaydedilmedi.");
  }

  // 2. Fiziksel Ek Dosyaları Managed Vault'a Yeni Proje Yoluyla Yaz (Transaction Dışında)
  const writtenRelativePaths: string[] = [];
  try {
    for (const [archivePath, fileData] of Array.from(filesMap.entries())) {
      if (!archivePath.startsWith("attachments/")) continue;
      const originalRelPath = archivePath.substring("attachments/".length);
      const newRelPath = remapAttachmentPath(originalRelPath);

      await saveAttachmentFile(newRelPath, fileData);
      writtenRelativePaths.push(newRelPath);
    }
  } catch (fileErr: any) {
    console.error("[BackupManager] Ek dosya kopyalama hatası:", fileErr);
    try {
      await deleteProject(newProjectId);
    } catch (cleanupErr) {
      console.warn("[BackupManager] Telafi temizleme hatası:", cleanupErr);
    }
    throw new Error("Proje ek dosyaları aktarılamadı; işlem geri alındı.");
  }

  return {
    success: true,
    newProjectId,
    projectName: finalProjectName,
    companyName: projectData.company?.company_name || inspection.manifest.companyName,
    attachmentCount: writtenRelativePaths.length,
  };
}

/**
 * Mevcut bir projeden yeni bir çalışma kopyası (şablon veya tam klon) üretir.
 */
export async function duplicateProject(
  sourceProjectId: string,
  options: DuplicateProjectOptions = {}
): Promise<{ newProjectId: string; projectName: string }> {
  // Projeyi export formatında al
  const exportData = await exportProjectBackup(sourceProjectId);

  // Geri yükleme fonksiyonunu yeni ad ve klonlama seçenekleriyle çalıştır
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

    // Fonksiyon durumlarını "not_started" yap
    projectData.businessFunctions = (projectData.businessFunctions || []).map((bf) => ({
      ...bf,
      status: "not_started",
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
    newProjectId: restoreRes.newProjectId!,
    projectName: newName,
  };
}
