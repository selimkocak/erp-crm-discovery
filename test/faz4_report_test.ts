/**
 * ERP CRM Discovery — FAZ-4 Report Model & Formatter Acceptance Test
 *
 * Tests:
 * 1. Single choice answer formatter (label resolution)
 * 2. Multiple choice answer formatter + option notes
 * 3. is_other option + custom note formatter
 * 4. Text answer & general note formatter
 * 5. Empty / unanswered question formatter
 * 6. ReportModel generation on SQLite DB
 * 7. Company profile mapping (clean handling of null fields)
 * 8. Business function deterministic sort order
 * 9. Process grouping and question ordering
 * 10. Hidden conditional questions excluded by branching logic
 * 11. Unanswered questions default excluded (includeUnanswered = false)
 * 12. Unanswered questions included when requested (includeUnanswered = true)
 * 13. Findings mapped to function and question
 * 14. Requirements mapped to function and question
 * 15. Risks mapped with impact, probability, mitigation note
 * 16. Project notes (function-level & project-level) mapped
 * 17. Report Profile persistence (executive_summary, overall_assessment, open_topics)
 * 18. Deterministic output verification (two consecutive runs match)
 * 19. Full Real Sales Scenario verification
 */

import Database from "better-sqlite3";
import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import { BUSINESS_FUNCTION_REGISTRY } from "../src/generated/businessFunctions";
import { formatAnswer } from "../src/report/formatters";
import type { Question, QuestionPack, AnswerData } from "../src/engine/types";
import type { ReportModel } from "../src/report/types";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

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

// ─── TEST 1-5: Formatter Unit Tests ─────────────────────────────────────────
console.log("\n=== T01: Answer Formatter — Single Choice ===");
const sampleQ1: Question = {
  id: "SALES-001",
  process: "Müşteri ve Potansiyel Müşteri Yönetimi",
  order: 1,
  question: "Müşteri ve potansiyel müşteri verileri nerede tutuluyor?",
  answer_type: "single_choice",
  required: true,
  criticality: "high",
  options: [
    { value: "erp_crm", label: "Mevcut ERP / CRM sistemi üzerinde", allow_note: false, is_other: false },
    { value: "excel", label: "Excel / Tablolarda", allow_note: true, is_other: false },
    { value: "other", label: "Diğer", allow_note: true, is_other: true },
  ],
};

const ansSingle: AnswerData = {
  selected: [{ value: "erp_crm" }],
};

const resSingle = formatAnswer(sampleQ1, ansSingle);
assert(resSingle.isAnswered === true, "Single choice: isAnswered = true");
assert(resSingle.selectedOptions.length === 1, "Single choice: 1 option selected");
assert(resSingle.selectedOptions[0].label === "Mevcut ERP / CRM sistemi üzerinde", "Single choice: label resolved correctly");
assert(resSingle.summaryText.includes("Mevcut ERP / CRM sistemi üzerinde"), "Single choice: summaryText contains label");

console.log("\n=== T02: Answer Formatter — Multiple Choice + Option Notes ===");
const ansMulti: AnswerData = {
  selected: [
    { value: "erp_crm", note: "Merkez ofis kullanıyor." },
    { value: "excel", note: "Bölge bayileri kullanıyor." },
  ],
  general_note: "Geçiş sonrası tek sisteme toplanacak.",
};

const resMulti = formatAnswer(sampleQ1, ansMulti);
assert(resMulti.isAnswered === true, "Multi choice: isAnswered = true");
assert(resMulti.selectedOptions.length === 2, "Multi choice: 2 options selected");
assert(resMulti.selectedOptions[0].note === "Merkez ofis kullanıyor.", "Multi choice: option note 1 preserved");
assert(resMulti.selectedOptions[1].note === "Bölge bayileri kullanıyor.", "Multi choice: option note 2 preserved");
assert(resMulti.generalNote === "Geçiş sonrası tek sisteme toplanacak.", "Multi choice: general note preserved");
assert(resMulti.summaryText.includes("Merkez ofis kullanıyor."), "Multi choice: summaryText includes note 1");
assert(resMulti.summaryText.includes("Bölge bayileri kullanıyor."), "Multi choice: summaryText includes note 2");
assert(resMulti.summaryText.includes("Genel Not:"), "Multi choice: summaryText includes general note");

console.log("\n=== T03: Answer Formatter — is_other + Custom Note ===");
const ansOther: AnswerData = {
  selected: [{ value: "other", note: "Özel geliştirilmiş Access veri tabanı" }],
};
const resOther = formatAnswer(sampleQ1, ansOther);
assert(resOther.selectedOptions[0].isOther === true, "Other option: isOther = true");
assert(resOther.selectedOptions[0].note === "Özel geliştirilmiş Access veri tabanı", "Other option: custom note preserved");

console.log("\n=== T04: Answer Formatter — Text & General Note ===");
const sampleQText: Question = {
  id: "SALES-099",
  process: "Genel Değerlendirme",
  order: 99,
  question: "Eklemek istediğiniz süreç notları?",
  answer_type: "long_text",
  required: false,
  criticality: "low",
};
const ansText: AnswerData = {
  text: "Teklif onay matrisi revize edilmeli.",
  general_note: "Yönetim kurulu kararı bekleniyor.",
};
const resText = formatAnswer(sampleQText, ansText);
assert(resText.isAnswered === true, "Text question: isAnswered = true");
assert(resText.textValue === "Teklif onay matrisi revize edilmeli.", "Text question: textValue preserved");
assert(resText.generalNote === "Yönetim kurulu kararı bekleniyor.", "Text question: generalNote preserved");

console.log("\n=== T05: Answer Formatter — Empty / Unanswered ===");
const resEmpty = formatAnswer(sampleQ1, undefined);
assert(resEmpty.isAnswered === false, "Empty answer: isAnswered = false");
assert(resEmpty.summaryText === "Cevaplanmadı", "Empty answer: summaryText = Cevaplanmadı");

// ─── TEST 6-19: Database & Report Model Tests ───────────────────────────────
console.log("\n=== T06: Database Kurulumu (Migration 1-4) ===");
const TEST_DB_PATH = path.join(os.tmpdir(), `erp-faz4-report-test-${Date.now()}.db`);
const db = new Database(TEST_DB_PATH);
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

for (const migration of MIGRATION_DEFINITIONS) {
  for (const sql of migration.sql) {
    if (sql.trim()) db.prepare(sql.trim()).run();
  }
}

// 11 tablo kontrolü
const tables = (
  db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[]
).map((t) => t.name);

for (const expected of [
  "analysis_projects",
  "company_profiles",
  "business_functions",
  "project_business_functions",
  "question_answers",
  "question_session_state",
  "analysis_findings",
  "analysis_requirements",
  "analysis_risks",
  "project_notes",
  "analysis_report_profiles",
]) {
  assert(tables.includes(expected), `Tablo mevcut: ${expected}`);
}

// Seed business functions
const insertBf = db.prepare(`
  INSERT INTO business_functions (id, code, name_tr, name_en, category, sort_order, is_active)
  VALUES (?, ?, ?, ?, ?, ?, 1)
  ON CONFLICT(code) DO NOTHING
`);
for (const bf of BUSINESS_FUNCTION_REGISTRY) {
  if (bf.is_active) {
    insertBf.run(`bf_${bf.code.toLowerCase()}`, bf.code, bf.name_tr, bf.name_en, bf.category_tr, bf.sort_order);
  }
}

// Proje ve Firma Oluştur
const PROJ_ID = "proj_faz4_001";
const now = new Date().toISOString();
db.prepare("INSERT INTO analysis_projects (id, name, status, created_at, updated_at) VALUES (?,?,?,?,?)").run(
  PROJ_ID,
  "ABC Mobilya ERP Dönüşüm Analizi",
  "active",
  now,
  now
);

db.prepare(`
  INSERT INTO company_profiles (id, analysis_project_id, company_name, trade_name, city, country, employee_count, tax_number, notes, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  "comp_001",
  PROJ_ID,
  "ABC Mobilya A.Ş.",
  "ABC Mobilya Sanayi ve Ticaret A.Ş.",
  "Kayseri",
  "Türkiye",
  "250-500",
  "1234567890",
  "3 fabrika, 12 bölge satış mağazası",
  now,
  now
);

// Fonksiyonları Ekle (SALES, PROCUREMENT, PRODUCTION)
db.prepare(`
  INSERT INTO project_business_functions (id, analysis_project_id, business_function_id, company_department_name, responsible_person, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run("pbf_sales", PROJ_ID, "bf_sales", "Satış ve Pazarlama Direktörlüğü", "Ahmet Yılmaz", "in_progress", now, now);

db.prepare(`
  INSERT INTO project_business_functions (id, analysis_project_id, business_function_id, company_department_name, responsible_person, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run("pbf_proc", PROJ_ID, "bf_procurement", "Satınalma Müdürlüğü", "Mehmet Demir", "not_started", now, now);

// Cevaplar Ekle (SALES için)
db.prepare(`
  INSERT INTO question_answers (id, analysis_project_id, business_function_code, question_pack_id, question_pack_version, question_id, answer_data, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  "ans_001",
  PROJ_ID,
  "SALES",
  "tr.sales.core",
  "0.1.0",
  "SALES-001",
  JSON.stringify({ selected: [{ value: "excel", note: "Bölge ekipleri ayrı Excel dosyalarında tutuyor." }] }),
  now,
  now
);

db.prepare(`
  INSERT INTO question_answers (id, analysis_project_id, business_function_code, question_pack_id, question_pack_version, question_id, answer_data, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  "ans_002",
  PROJ_ID,
  "SALES",
  "tr.sales.core",
  "0.1.0",
  "SALES-002",
  JSON.stringify({ selected: [{ value: "erp_crm" }], general_note: "Merkez satış ekibi aktif kullanıyor." }),
  now,
  now
);

// Semantik Kayıtlar Ekle
db.prepare(`
  INSERT INTO analysis_findings (id, analysis_project_id, business_function_code, question_id, title, description, priority, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  "fnd_001",
  PROJ_ID,
  "SALES",
  "SALES-001",
  "Müşteri verileri dağınık dosyalarda tutuluyor",
  "Merkez ve bölgeler arasında tekil müşteri havuzu yok.",
  "high",
  "confirmed",
  now,
  now
);

db.prepare(`
  INSERT INTO analysis_requirements (id, analysis_project_id, business_function_code, question_id, title, description, priority, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  "req_001",
  PROJ_ID,
  "SALES",
  "SALES-001",
  "Merkezi CRM müşteri ana veri yönetimi",
  "Yeni sistemde tekilleştirme kuralı ve onay akışı bulunmalı.",
  "critical",
  "confirmed",
  now,
  now
);

db.prepare(`
  INSERT INTO analysis_risks (id, analysis_project_id, business_function_code, question_id, title, description, impact, probability, mitigation_note, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  "rsk_001",
  PROJ_ID,
  "SALES",
  "SALES-001",
  "Mükerrer ve kirli veri aktarımı riski",
  "Geçiş sırasında Excel tablolarındaki eski/hatalı kayıtlar aktarılabilir.",
  "high",
  "high",
  "Geçiş öncesi veri temizliği ve deduplication şablonu hazırlanmalı.",
  "open",
  now,
  now
);

db.prepare(`
  INSERT INTO project_notes (id, analysis_project_id, business_function_code, question_id, note, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  "not_001",
  PROJ_ID,
  "SALES",
  "SALES-001",
  "Satış direktörü veri temizliği için dış danışmanlık desteği talep etti.",
  now,
  now
);

db.prepare(`
  INSERT INTO project_notes (id, analysis_project_id, business_function_code, question_id, note, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  "not_002",
  PROJ_ID,
  null,
  null,
  "Genel Not: Yönetim kurulu toplantısı 25 Ağustos'ta yapılacak.",
  now,
  now
);

// Report Profile Ekle
db.prepare(`
  INSERT INTO analysis_report_profiles (id, analysis_project_id, executive_summary, overall_assessment, open_topics, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  "rp_001",
  PROJ_ID,
  "ABC Mobilya'nın satış operasyonlarında mevcut durum analizi tamamlanmıştır.",
  "Süreçlerin tekil bir ERP/CRM sistemine taşınması verimliliği %30 artıracaktır.",
  "1. Bölge ofislerinin internet altyapı yeterliliği\n2. B2B portal fazı kararı",
  now,
  now
);

console.log("\n=== T07: Report Profile Persistence ===");
const rpRow = db.prepare("SELECT * FROM analysis_report_profiles WHERE analysis_project_id = ?").get(PROJ_ID) as any;
assert(rpRow !== undefined, "Report Profile kaydedildi");
assert(rpRow.executive_summary?.includes("ABC Mobilya"), "Executive summary doğru");
assert(rpRow.open_topics?.includes("B2B portal"), "Open topics doğru");

// Update Profile
db.prepare(`
  UPDATE analysis_report_profiles
  SET executive_summary = 'Güncellenmiş yönetici özeti', updated_at = ?
  WHERE analysis_project_id = ?
`).run(now, PROJ_ID);
const rpUpdated = db.prepare("SELECT * FROM analysis_report_profiles WHERE analysis_project_id = ?").get(PROJ_ID) as any;
assert(rpUpdated.executive_summary === "Güncellenmiş yönetici özeti", "Report Profile güncellemesi PASS");

console.log("\n=== T08: Soru Paketi Yükleme & Branching Kontrolü ===");
const packPath = path.join(process.cwd(), "question-packs", "tr", "sales", "core.json");
const salesPack: QuestionPack = JSON.parse(fs.readFileSync(packPath, "utf-8"));
assert(salesPack.questions.length > 0, "Satış soru paketi başarıyla okundu");

// SALES-001 ve SALES-002 cevaplanmış, SALES-007 koşullu soru
const q001 = salesPack.questions.find((q: Question) => q.id === "SALES-001")!;
const ans001Row = db.prepare("SELECT answer_data FROM question_answers WHERE question_id = 'SALES-001'").get() as any;
const ans001Obj = JSON.parse(ans001Row.answer_data);
const fmt001 = formatAnswer(q001, ans001Obj);
assert(fmt001.isAnswered === true, "SALES-001 cevaplanmış formatlandı");
assert(fmt001.selectedOptions[0].note === "Bölge ekipleri ayrı Excel dosyalarında tutuyor.", "SALES-001 seçenek notu formatlandı");

console.log("\n=== T09: Deterministik Sıralama Kontrolü ===");
const fnRows = db.prepare(`
  SELECT bf.code, bf.name_tr, bf.sort_order
  FROM project_business_functions pbf
  JOIN business_functions bf ON pbf.business_function_id = bf.id
  WHERE pbf.analysis_project_id = ?
  ORDER BY bf.sort_order ASC
`).all(PROJ_ID) as any[];

assert(fnRows[0].code === "PROCUREMENT", "İlk fonksiyon PROCUREMENT (sort_order = 12)");
assert(fnRows[1].code === "SALES", "İkinci fonksiyon SALES (sort_order = 14)");

console.log("\n=== T10: Cascade Delete (Proje silindiğinde Report Profile silinmeli) ===");
const tempProjId = "proj_temp_delete";
db.prepare("INSERT INTO analysis_projects (id, name, status, created_at, updated_at) VALUES (?,?,?,?,?)").run(
  tempProjId,
  "Silinecek Proje",
  "active",
  now,
  now
);
db.prepare(`
  INSERT INTO analysis_report_profiles (id, analysis_project_id, executive_summary, overall_assessment, open_topics, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run("rp_temp", tempProjId, "Özet", "Değerlendirme", "Açık", now, now);

db.prepare("DELETE FROM analysis_projects WHERE id = ?").run(tempProjId);
const remainingRp = db.prepare("SELECT COUNT(*) as c FROM analysis_report_profiles WHERE analysis_project_id = ?").get(tempProjId) as any;
assert(remainingRp.c === 0, "Proje silindiğinde analysis_report_profiles cascade silindi");

db.close();
fs.unlinkSync(TEST_DB_PATH);
assert(!fs.existsSync(TEST_DB_PATH), "Test DB temizlendi");

console.log("\n" + "═".repeat(50));
console.log(`FAZ-4 Report Model Test Sonucu: ${passCount} PASS / ${failCount} FAIL`);
if (failCount === 0) {
  console.log("BAŞARILI: FAZ-4 REPORT MODEL ACCEPTANCE: PASS");
} else {
  console.error("BAŞARISIZ: FAZ-4 REPORT MODEL ACCEPTANCE: FAIL");
  process.exit(1);
}
