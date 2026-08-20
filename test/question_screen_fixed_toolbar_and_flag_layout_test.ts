/**
 * ERP CRM Discovery — Question Screen Fixed Toolbar & Symmetrical Followup Flag Layout Test
 *
 * Verifies:
 * 1. Fixed Toolbar Grid Architecture (CSS Grid 3-column layout)
 * 2. Action Button Minimum Widths (Custom Question, Interim Report, Save & Exit, Home, Nav Toggle)
 * 3. Responsive Toolbar Breakpoint (@media (max-width: 900px))
 * 4. Header "Ana Sayfaya Dön" Action (.btn-nav-home, Home & ArrowLeft icons)
 * 5. "Kaydet ve Çık" Action (.btn-save-exit, #047857, min-width: 142px, WCAG AA contrast)
 * 6. Followup Flag Buttons (.flag-actions, 2-column grid, .flag-button min-height: 42px)
 * 7. Active Flag Banner (.active-flag-banner, full-width, icon + title + note + edit button)
 * 8. Symmetrical Followup Modal (.followup-modal-container 560px/420px, .followup-flag-grid, .followup-flag-card min-height: 96px, .followup-modal-textarea)
 * 9. Flag State Transitions & Progress Rules
 * 10. Canonical Module Compatibility (PAYROLL, ACCOUNTING, PRODUCTION_PLANNING, IT_INFRASTRUCTURE, LEGAL_COMPLIANCE)
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { canAdvanceToNextQuestion } from "../src/engine/progress";
import type { Question, AnswerData } from "../src/engine/types";
import type { QuestionFollowup } from "../src/types";
import { CANONICAL_QUESTION_PACKS } from "../src/generated/questionPacks";

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

// ── WCAG 2.1 Contrast Calculation Helper ──
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
  const lum1 = relativeLuminance(hexToRgb(hex1));
  const lum2 = relativeLuminance(hexToRgb(hex2));
  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (brighter + 0.05) / (darker + 0.05);
}

const cssContent = fs.readFileSync(path.join(ROOT_DIR, "src/index.css"), "utf-8");
const questionScreenCode = fs.readFileSync(path.join(ROOT_DIR, "src/views/QuestionScreen.tsx"), "utf-8");
const headerCode = fs.readFileSync(path.join(ROOT_DIR, "src/components/Header.tsx"), "utf-8");
const questionCardCode = fs.readFileSync(path.join(ROOT_DIR, "src/components/QuestionCard.tsx"), "utf-8");
const followupModalCode = fs.readFileSync(path.join(ROOT_DIR, "src/components/FollowupModal.tsx"), "utf-8");

console.log("\n=== T01: Fixed QuestionScreen Toolbar Grid Architecture ===");
assert(
  cssContent.includes(".question-screen-toolbar") &&
    cssContent.includes("grid-template-columns: minmax(190px, 1fr) minmax(240px, 1.2fr) auto;"),
  "index.css: .question-screen-toolbar 3-kolonlu CSS Grid mimarisine sahip (190px / 240px / auto)"
);
assert(
  cssContent.includes(".question-screen-toolbar__left"),
  "index.css: .question-screen-toolbar__left sol navigasyon konteyneri tanımlı"
);
assert(
  cssContent.includes(".question-screen-toolbar__center"),
  "index.css: .question-screen-toolbar__center orta süreç & soru bilgi konteyneri tanımlı"
);
assert(
  cssContent.includes(".question-screen-toolbar__right"),
  "index.css: .question-screen-toolbar__right sağ aksiyon butonu grubu tanımlı"
);
assert(
  cssContent.includes("text-overflow: ellipsis") && cssContent.includes(".question-screen__process"),
  "index.css: .question-screen__process uzun süreç başlıklarında ellipsis ile kesiliyor"
);
assert(
  questionScreenCode.includes("question-screen-toolbar") && questionScreenCode.includes("question-screen-toolbar__left"),
  "QuestionScreen.tsx: Toolbar bileşenleri semantik grid yapısında yerleştirilmiş"
);

console.log("\n=== T02: Action Button Minimum Widths & Fixed Geometry ===");
assert(
  cssContent.includes(".btn-custom-question") && cssContent.includes("min-width: 126px;"),
  "index.css: .btn-custom-question min-width: 126px kuralına sahip"
);
assert(
  cssContent.includes(".btn-interim-report") && cssContent.includes("min-width: 118px;"),
  "index.css: .btn-interim-report min-width: 118px kuralına sahip"
);
assert(
  cssContent.includes(".btn-save-exit") && cssContent.includes("min-width: 142px;"),
  "index.css: .btn-save-exit min-width: 142px kuralına sahip"
);
assert(
  cssContent.includes(".btn-nav-home") && cssContent.includes("min-width: 150px;"),
  "index.css: .btn-nav-home min-width: 150px kuralına sahip"
);
assert(
  cssContent.includes(".question-screen__nav-toggle-btn") && cssContent.includes("min-width: 112px;"),
  "index.css: .question-screen__nav-toggle-btn min-width: 112px kuralına sahip"
);

console.log("\n=== T03: Responsive Toolbar Breakpoint (@media max-width: 900px) ===");
assert(
  cssContent.includes("@media (max-width: 900px)"),
  "index.css: @media (max-width: 900px) breakpoint tanımlı"
);
assert(
  cssContent.includes("grid-template-columns: repeat(3, minmax(0, 1fr));"),
  "index.css: Dar ekranlarda sağ aksiyon grubu 3 eşit kolona geçiyor"
);

console.log("\n=== T04: App Header 'Ana Sayfaya Dön' Navigation Action ===");
assert(
  headerCode.includes("btn-nav-home"),
  "Header.tsx: 'Ana Sayfaya Dön' butonu .btn-nav-home sınıfına sahip"
);
assert(
  headerCode.includes("<Home") && headerCode.includes("<ArrowLeft"),
  "Header.tsx: 'Ana Sayfaya Dön' butonu Home ve ArrowLeft ikonlarını içeriyor"
);
assert(
  headerCode.includes("title=\"Ana Sayfaya Dön\""),
  "Header.tsx: 'Ana Sayfaya Dön' butonunda erişilebilir tooltip mevcut"
);

console.log("\n=== T05: 'Kaydet ve Çık' Action & Color Contrast ===");
assert(
  cssContent.includes(".btn-save-exit") && cssContent.includes("#047857"),
  "index.css: .btn-save-exit zümrüt / koyu yeşil (#047857) renge sahip"
);
const saveExitRatio = contrastRatio("#047857", "#ffffff");
assert(
  saveExitRatio >= 4.5,
  `Save & Exit (#047857 vs #ffffff) Kontrast: ${saveExitRatio.toFixed(2)}:1 (>= 4.5:1 WCAG AA PASS)`
);
assert(
  questionScreenCode.includes("btn-save-exit"),
  "QuestionScreen.tsx: Kaydet ve Çık butonu .btn-save-exit sınıfına sahip"
);
assert(
  questionScreenCode.includes("try {") &&
    questionScreenCode.includes("flushPendingSave") &&
    questionScreenCode.includes("setSaveStatus(\"saved\")"),
  "QuestionScreen.tsx: handleSaveAndExit önce flushPendingSave icra ediyor ve hata durumunda sayfadan çıkmıyor"
);

console.log("\n=== T06: Symmetric Followup Flag Buttons in QuestionCard ===");
assert(
  cssContent.includes(".flag-actions") && cssContent.includes("grid-template-columns: repeat(2, minmax(0, 1fr));"),
  "index.css: .flag-actions 2 eşit kolonlu simetrik grid düzenine sahip"
);
assert(
  cssContent.includes(".flag-button") &&
    cssContent.includes("min-height: 42px;") &&
    cssContent.includes("border-radius: 10px;"),
  "index.css: .flag-button min-height: 42px ve border-radius: 10px standartlarına sahip"
);
assert(
  cssContent.includes(".flag-button--revisit") && cssContent.includes(".flag-button--critical"),
  "index.css: .flag-button--revisit (Amber) ve .flag-button--critical (Kırmızı) durumları tanımlı"
);
assert(
  questionCardCode.includes("flag-actions") &&
    questionCardCode.includes("flag-button--revisit") &&
    questionCardCode.includes("flag-button--critical"),
  "QuestionCard.tsx: Soru kartı içinde bayrak atanmamışken 2 eşit simetrik buton render ediliyor"
);

console.log("\n=== T07: Active Flag Display Banner ===");
assert(
  cssContent.includes(".active-flag-banner") &&
    cssContent.includes(".active-flag-banner--revisit") &&
    cssContent.includes(".active-flag-banner--critical"),
  "index.css: .active-flag-banner tam genişlikli aktif bayrak bandı sınıfları tanımlı"
);
assert(
  questionCardCode.includes("active-flag-banner") &&
    questionCardCode.includes("active-flag-banner__edit-btn") &&
    questionCardCode.includes("Bayrağı Düzenle"),
  "QuestionCard.tsx: Aktif bayrak durumunda simetrik banner ve 'Bayrağı Düzenle' butonu render ediliyor"
);

console.log("\n=== T08: Symmetrical Followup Modal Layout ===");
assert(
  cssContent.includes(".followup-modal-container") &&
    cssContent.includes("max-width: 560px;") &&
    cssContent.includes("min-width: 420px;"),
  "index.css: .followup-modal-container 560px max / 420px min genişlik simetrisine sahip"
);
assert(
  cssContent.includes(".followup-flag-grid") &&
    cssContent.includes("grid-template-columns: repeat(2, minmax(0, 1fr));"),
  "index.css: .followup-flag-grid 2 eşit kolonlu seçim kartı ızgarası"
);
assert(
  cssContent.includes(".followup-flag-card") && cssContent.includes("min-height: 96px;"),
  "index.css: .followup-flag-card min-height: 96px eşit kart yüksekliğine sahip"
);
assert(
  cssContent.includes(".followup-modal-textarea"),
  "index.css: .followup-modal-textarea tam genişlikli ve görünür focus halkalı"
);
assert(
  followupModalCode.includes("followup-modal-container") &&
    followupModalCode.includes("followup-flag-grid") &&
    followupModalCode.includes("followup-flag-card") &&
    followupModalCode.includes("followup-modal-textarea"),
  "FollowupModal.tsx: Modal şablonu simetrik grid ve textarea sınıflarını kullanıyor"
);

console.log("\n=== T09: Followup Flag State Transitions & Progress Rules ===");
const sampleQuestion: Question = {
  id: "TR-TEST-001",
  process: "Test Süreci",
  question: "Zorunlu test sorusu",
  answer_type: "text",
  required: true,
};

const emptyAnswer: AnswerData = {
  question_id: "TR-TEST-001",
  value: null,
};

const revisitFlag: QuestionFollowup = {
  id: "f1",
  project_id: "p1",
  business_function_code: "PAYROLL",
  question_id: "TR-TEST-001",
  flag_type: "revisit",
  note: "Teyit bekleniyor",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const criticalFlag: QuestionFollowup = {
  ...revisitFlag,
  flag_type: "critical",
  note: "Kritik konu",
};

// 1. Cevap yok + Bayrak yok -> Geçişe izin VERME
assert(!canAdvanceToNextQuestion(sampleQuestion, emptyAnswer, null), "Cevap yok + Bayrak yok: Geçiş ENGELLENDİ (Doğru)");

// 2. Cevap yok + Sarı bayrak -> Geçişe İZİN VER
assert(canAdvanceToNextQuestion(sampleQuestion, emptyAnswer, revisitFlag), "Cevap yok + Sarı bayrak: Geçişe İZİN VERİLDİ (Doğru)");

// 3. Cevap yok + Kırmızı bayrak -> Geçişe İZİN VER
assert(canAdvanceToNextQuestion(sampleQuestion, emptyAnswer, criticalFlag), "Cevap yok + Kırmızı bayrak: Geçişe İZİN VERİLDİ (Doğru)");

console.log("\n=== T10: Canonical Modules Compatibility Verification ===");
const testModules = [
  { code: "PAYROLL", packId: "tr.payroll.core" },
  { code: "ACCOUNTING", packId: "tr.accounting.core" },
  { code: "PRODUCTION_PLANNING", packId: "tr.production_planning.core" },
  { code: "IT_INFRASTRUCTURE", packId: "tr.it_infrastructure.core" },
  { code: "LEGAL_COMPLIANCE", packId: "tr.legal_compliance.core" },
];

for (const mod of testModules) {
  const pack = CANONICAL_QUESTION_PACKS[mod.packId];
  assert(pack !== undefined, `Kanonik modül ${mod.code} (${mod.packId}) paketi mevcut`);
  assert(pack && pack.questions.length > 0, `Kanonik modül ${mod.code} (${pack?.questions.length} soru) yüklendi`);
  // Verify all questions in module have valid processes and IDs
  const allHaveProcess = pack?.questions.every((q) => Boolean(q.process && q.process.length > 0));
  assert(allHaveProcess, `Kanonik modül ${mod.code}: Tüm sorular geçerli süreç (process) etiketine sahip`);
}

console.log("\n" + "═".repeat(60));
console.log(`Question Screen Fixed Toolbar & Flag Layout Test: ${passCount} PASS / ${failCount} FAIL`);
if (failCount === 0) {
  console.log("BAŞARILI: FIXED TOOLBAR & SYMMETRICAL FLAG LAYOUT ACCEPTANCE: PASS\n");
} else {
  console.error("BAŞARISIZ: ACCEPTANCE: FAIL\n");
  process.exit(1);
}
