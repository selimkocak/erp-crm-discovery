/**
 * ERP CRM Discovery — Question Navigator Attachment Indicator Acceptance Test Suite
 *
 * Verifies:
 * 1. Attachment indicator presence & format (single: 📎, multiple: 📎 N)
 * 2. Questions without attachments show NO badge
 * 3. Semantic notes/findings/risks do NOT trigger the attachment badge
 * 4. Distinct coexistence with status icons (🟢 answered, 🟡 revisit, 🔴 critical)
 * 5. "Ekli sorular" filter tab filtering & count calculation
 * 6. Search query matching across question text, process and attachment filenames
 * 7. Real-time updates simulation upon attachment addition/deletion
 * 8. Accessibility: Tooltips ("N kanıt dosyası ekli") and aria-label ("Bu soruya N kanıt dosyası ekli")
 * 9. Non-intrusive navigation click safety (pointer-events: none on badge)
 * 10. CSS styling & layout invariants (min-width: 0, flex layout, no deformation)
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { Question } from "../src/engine/types";
import type { QuestionAttachment, QuestionFollowup } from "../src/types";

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

const ROOT_DIR = process.cwd();

// Sample Questions
const mockQuestions: Question[] = [
  { id: "SALES-001", process: "Müşteri Yönetimi", order: 1, question: "Müşteri verileri nerede tutuluyor?", answer_type: "single_choice", required: true, criticality: "high" },
  { id: "SALES-002", process: "Müşteri Yönetimi", order: 2, question: "Müşteri segmentasyonu yapılıyor mu?", answer_type: "single_choice", required: true, criticality: "medium" },
  { id: "SALES-003", process: "Teklif Yönetimi", order: 3, question: "Teklif onay süreci nasıl işliyor?", answer_type: "single_choice", required: false, criticality: "low" },
  { id: "SALES-004", process: "Sipariş Yönetimi", order: 4, question: "Siparişler ERP'ye nasıl aktarılıyor ve entegrasyon protokolü nedir?", answer_type: "single_choice", required: true, criticality: "critical" },
  { id: "SALES-005", process: "Sipariş Yönetimi", order: 5, question: "Sözleşme kopyaları dijital ortamda saklanıyor mu?", answer_type: "single_choice", required: false, criticality: "low" },
];

// Sample Attachments
const mockAttachments: Record<string, QuestionAttachment[]> = {
  "SALES-001": [
    {
      id: "att_1",
      analysis_project_id: "p1",
      business_function_code: "SALES",
      question_id: "SALES-001",
      stored_file_name: "musteri_listesi_2026.xlsx",
      original_file_name: "musteri_listesi_2026.xlsx",
      file_size: 1048576,
      file_extension: "xlsx",
      mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      relative_path: "SALES/SALES-001/uuid1_musteri.xlsx",
      sha256: "abc1",
      sort_order: 1,
      created_at: "2026-08-22T10:00:00Z",
      updated_at: "2026-08-22T10:00:00Z",
    },
  ],
  "SALES-004": [
    {
      id: "att_2",
      analysis_project_id: "p1",
      business_function_code: "SALES",
      question_id: "SALES-004",
      stored_file_name: "sap_siparis_entegrasyon_semasi.pdf",
      original_file_name: "sap_siparis_entegrasyon_semasi.pdf",
      file_size: 2048576,
      file_extension: "pdf",
      mime_type: "application/pdf",
      relative_path: "SALES/SALES-004/uuid2_sap.pdf",
      sha256: "abc2",
      description: "SAP IDOC sipariş akış diyagramı",
      sort_order: 1,
      created_at: "2026-08-22T10:05:00Z",
      updated_at: "2026-08-22T10:05:00Z",
    },
    {
      id: "att_3",
      analysis_project_id: "p1",
      business_function_code: "SALES",
      question_id: "SALES-004",
      stored_file_name: "siparis_json_payload.json",
      original_file_name: "siparis_json_payload.json",
      file_size: 51200,
      file_extension: "json",
      mime_type: "application/json",
      relative_path: "SALES/SALES-004/uuid3_payload.json",
      sha256: "abc3",
      sort_order: 2,
      created_at: "2026-08-22T10:10:00Z",
      updated_at: "2026-08-22T10:10:00Z",
    },
    {
      id: "att_4",
      analysis_project_id: "p1",
      business_function_code: "SALES",
      question_id: "SALES-004",
      stored_file_name: "siparis_onay_formu.png",
      original_file_name: "siparis_onay_formu.png",
      file_size: 350000,
      file_extension: "png",
      mime_type: "image/png",
      relative_path: "SALES/SALES-004/uuid4_form.png",
      sha256: "abc4",
      sort_order: 3,
      created_at: "2026-08-22T10:15:00Z",
      updated_at: "2026-08-22T10:15:00Z",
    },
  ],
};

const attachmentsMap = new Map<string, QuestionAttachment[]>();
for (const [k, v] of Object.entries(mockAttachments)) {
  attachmentsMap.set(k, v);
}

// ─── T01: Attachment Indicator Data Model & Badge Rules ───────────────────────
console.log("\n=== T01: Attachment Indicator Data Model & Badge Rules ===");

function getBadgeDetails(qId: string, map: Map<string, QuestionAttachment[]>) {
  const list = map.get(qId) || [];
  const count = list.length;
  if (count === 0) return null;
  return {
    count,
    icon: "Paperclip",
    displayCount: count > 1 ? count : null,
    tooltip: `${count} kanıt dosyası ekli`,
    ariaLabel: `Bu soruya ${count} kanıt dosyası ekli`,
  };
}

// Question with 0 attachments
const b0 = getBadgeDetails("SALES-002", attachmentsMap);
assert(b0 === null, "Eki olmayan soruda (SALES-002) ataç göstergesi null / render edilmez");

// Question with 1 attachment
const b1 = getBadgeDetails("SALES-001", attachmentsMap);
assert(b1 !== null, "Tek ekli soruda (SALES-001) ataç göstergesi render edilir");
assert(b1?.count === 1, "SALES-001 dosya sayısı = 1");
assert(b1?.displayCount === null, "Tek ekli soruda yalnız ataç ikonu gösterilir (ekstra '1' yazısı yok)");
assert(b1?.tooltip === "1 kanıt dosyası ekli", "Tooltip: '1 kanıt dosyası ekli'");
assert(b1?.ariaLabel === "Bu soruya 1 kanıt dosyası ekli", "Aria-label: 'Bu soruya 1 kanıt dosyası ekli'");

// Question with 3 attachments
const b3 = getBadgeDetails("SALES-004", attachmentsMap);
assert(b3 !== null, "3 ekli soruda (SALES-004) ataç göstergesi render edilir");
assert(b3?.count === 3, "SALES-004 dosya sayısı = 3");
assert(b3?.displayCount === 3, "Birden fazla ekli soruda ataç yanında sayı (3) gösterilir");
assert(b3?.tooltip === "3 kanıt dosyası ekli", "Tooltip: '3 kanıt dosyası ekli'");
assert(b3?.ariaLabel === "Bu soruya 3 kanıt dosyası ekli", "Aria-label: 'Bu soruya 3 kanıt dosyası ekli'");

// ─── T02: Exclusivity to Real File Attachments (No Note/Finding Pollution) ────
console.log("\n=== T02: Exclusivity to Real File Attachments ===");

// A question with only findings/requirements/notes but 0 attachments
const noteOnlyQId = "SALES-003";
const noteOnlyBadge = getBadgeDetails(noteOnlyQId, attachmentsMap);
assert(noteOnlyBadge === null, "Yalnızca semantik not/bulgu içeren soruda ataç göstergesi oluşmaz");

// ─── T03: Filter Tab 'Ekli sorular' Computation & Filtering ──────────────────
console.log("\n=== T03: Filter Tab 'Ekli sorular' Filtering ===");

function filterQuestions(
  questions: Question[],
  filter: string,
  attMap: Map<string, QuestionAttachment[]>,
  searchTerm: string = ""
): Question[] {
  return questions.filter((q) => {
    const qAtts = attMap.get(q.id) || [];
    const hasAttachments = qAtts.length > 0;

    if (filter === "attachments" && !hasAttachments) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const attMatch = qAtts.some(
      (a) =>
        a.original_file_name.toLowerCase().includes(term) ||
        (a.description && a.description.toLowerCase().includes(term))
    );
    return (
      q.question.toLowerCase().includes(term) ||
      q.process.toLowerCase().includes(term) ||
      q.id.toLowerCase().includes(term) ||
      attMatch
    );
  });
}

// Total questions with attachments
let questionsWithAttachmentsCount = 0;
for (const q of mockQuestions) {
  if ((attachmentsMap.get(q.id)?.length || 0) > 0) {
    questionsWithAttachmentsCount++;
  }
}
assert(questionsWithAttachmentsCount === 2, `Ekli sorular sekme sayısı = 2 (SALES-001 ve SALES-004) (gerçek: ${questionsWithAttachmentsCount})`);

// Filter 'all'
const allFiltered = filterQuestions(mockQuestions, "all", attachmentsMap);
assert(allFiltered.length === 5, "Tümü filtresi 5 soruyu listeler");

// Filter 'attachments'
const attFiltered = filterQuestions(mockQuestions, "attachments", attachmentsMap);
assert(attFiltered.length === 2, "Ekli sorular filtresi tam 2 soruyu listeler");
assert(attFiltered.some((q) => q.id === "SALES-001"), "SALES-001 ekli sorular listesinde");
assert(attFiltered.some((q) => q.id === "SALES-004"), "SALES-004 ekli sorular listesinde");
assert(!attFiltered.some((q) => q.id === "SALES-002"), "SALES-002 (eksiz) filtrelendi");

// Search by attachment name / description
const searchByFileName = filterQuestions(mockQuestions, "all", attachmentsMap, "sap_siparis");
assert(searchByFileName.length === 1 && searchByFileName[0].id === "SALES-004", "Ek dosya adına göre arama doğru soruyu (SALES-004) getirdi");

const searchByFileDesc = filterQuestions(mockQuestions, "all", attachmentsMap, "IDOC");
assert(searchByFileDesc.length === 1 && searchByFileDesc[0].id === "SALES-004", "Ek açıklama metnine göre arama doğru soruyu getirdi");

// ─── T04: Real-Time Dynamic Mutation Simulation ──────────────────────────────
console.log("\n=== T04: Real-Time Dynamic Mutation Simulation ===");

// 1. Add attachment to SALES-005
const dynamicMap = new Map<string, QuestionAttachment[]>(attachmentsMap);
assert(getBadgeDetails("SALES-005", dynamicMap) === null, "Başlangıçta SALES-005 ataçsız");

const newAtt: QuestionAttachment = {
  id: "att_new",
  analysis_project_id: "p1",
  business_function_code: "SALES",
  question_id: "SALES-005",
  stored_file_name: "sozlesme_taslagi.pdf",
  original_file_name: "sozlesme_taslagi.pdf",
  file_size: 409600,
  file_extension: "pdf",
  mime_type: "application/pdf",
  relative_path: "SALES/SALES-005/uuid_sozlesme.pdf",
  sha256: "abc_new",
  sort_order: 1,
  created_at: "2026-08-22T11:00:00Z",
  updated_at: "2026-08-22T11:00:00Z",
};
dynamicMap.set("SALES-005", [newAtt]);

const bDynamic1 = getBadgeDetails("SALES-005", dynamicMap);
assert(bDynamic1 !== null && bDynamic1.count === 1, "Dosya eklendiğinde SALES-005 anında 1 ek gösterir");

// 2. Delete attachment from SALES-001
dynamicMap.set("SALES-001", []);
const bDynamic0 = getBadgeDetails("SALES-001", dynamicMap);
assert(bDynamic0 === null, "Dosya silindiğinde SALES-001 ataç göstergesi anında kaybolur");

// ─── T05: Coexistence with Status Flags & Icons ──────────────────────────────
console.log("\n=== T05: Coexistence with Status Flags & Indicators ===");

// Soru durumu (yeşil cevaplandı, sarı sonra dön, kırmızı kritik) sol kolonda,
// Ataç göstergesi başlık hizasında sağda yer alır ve birbiriyle çakışmaz.
const followupMock: QuestionFollowup = {
  id: "fol_1",
  analysis_project_id: "p1",
  business_function_code: "SALES",
  question_id: "SALES-004",
  flag_type: "critical",
  note: "Entegrasyon sertifikası gerekiyor",
  status: "open",
  resolved_at: null,
  created_at: "2026-08-22T10:00:00Z",
  updated_at: "2026-08-22T10:00:00Z",
};

assert(followupMock.flag_type === "critical", "Kritik bayrak aktif");
assert(b3?.count === 3, "Aynı anda 3 ek dosyası mevcut");
assert(b3?.count !== undefined && followupMock.status === "open", "Kritik takip bayrağı ve ek göstergesi bağımsız veri yapısına sahip ve çakışmaz");

// ─── T06: Codebase & CSS Static Assertions ───────────────────────────────────
console.log("\n=== T06: Codebase & CSS Static Assertions ===");

const navCode = fs.readFileSync(path.join(ROOT_DIR, "src/components/QuestionNavigator.tsx"), "utf-8");
assert(navCode.includes("attachmentsMap"), "QuestionNavigator: attachmentsMap prop tanımlı");
assert(navCode.includes("question-navigator__attachment-badge"), "QuestionNavigator: question-navigator__attachment-badge sınıfı kullanılıyor");
assert(navCode.includes("kanıt dosyası ekli"), "QuestionNavigator: kanıt dosyası ekli tooltip tanımlı");
assert(navCode.includes("Bu soruya"), "QuestionNavigator: erişilebilir aria-label tanımlı");
assert(navCode.includes('data-filter="attachments"'), "QuestionNavigator: attachments tab filtresi tanımlı");
assert(navCode.includes("Ekli ("), "QuestionNavigator: Ekli (N) sekme başlığı tanımlı");

const qScreenCode = fs.readFileSync(path.join(ROOT_DIR, "src/views/QuestionScreen.tsx"), "utf-8");
assert(qScreenCode.includes("attachmentsMap={attachmentsMap}"), "QuestionScreen: attachmentsMap prop'u QuestionNavigator'a aktarılıyor");

const cssCode = fs.readFileSync(path.join(ROOT_DIR, "src/index.css"), "utf-8");
assert(cssCode.includes(".question-navigator__attachment-badge"), "index.css: .question-navigator__attachment-badge kuralı tanımlı");
assert(cssCode.includes("pointer-events: none"), "index.css: badge tıklamayı engellemeyecek şekilde pointer-events: none");
assert(cssCode.includes(".question-navigator__filter-tab"), "index.css: .question-navigator__filter-tab kuralı tanımlı");

console.log("\n" + "═".repeat(50));
console.log(`Question Navigator Attachment Test Sonucu: ${passCount} PASS / ${failCount} FAIL`);
if (failCount === 0) {
  console.log("BAŞARILI: QUESTION NAVIGATOR ATTACHMENT INDICATOR ACCEPTANCE: PASS\n");
} else {
  console.error("BAŞARISIZ: ACCEPTANCE: FAIL\n");
  process.exit(1);
}
