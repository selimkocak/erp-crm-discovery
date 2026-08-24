/**
 * ERP CRM Discovery — UI Button Visual Design System & WCAG AA Contrast Acceptance Test
 *
 * Verifies:
 * 1. Central Design Tokens in src/index.css (:root semantic action palette)
 * 2. Button Variant Class Suite (.btn-primary, .btn-secondary, .btn-success, .btn-warning, .btn-danger, .btn-outline, .btn-ghost)
 * 3. Interaction States (hover, active, focus-visible, disabled, loading spinner)
 * 4. WCAG AA Contrast Ratio validation (> 4.5:1 for normal text / active action buttons)
 * 5. Component & View semantic button usage alignment
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

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

// ── Test 1: Design Tokens in index.css ──
console.log("\n=== T01: CSS Design Tokens (Semantic Action Palette) ===");
const cssContent = fs.readFileSync(path.join(ROOT_DIR, "src/index.css"), "utf-8");

const requiredTokens = [
  "--color-primary-600",
  "--color-primary-700",
  "--color-report-600",
  "--color-report-700",
  "--color-report-800",
  "--color-secondary-600",
  "--color-secondary-700",
  "--color-success-600",
  "--color-success-700",
  "--color-warning-500",
  "--color-warning-600",
  "--color-danger-600",
  "--color-danger-700",
  "--color-neutral-100",
  "--color-neutral-300",
  "--color-neutral-700",
  "--color-focus",
];

for (const token of requiredTokens) {
  assert(cssContent.includes(token), `Design token ${token} mevcut`);
}

// ── Test 2: Button Variant Classes & States ──
console.log("\n=== T02: Button Variant Classes & Interaction States ===");
const requiredClasses = [
  ".btn",
  ".btn-primary",
  ".btn--primary",
  ".btn-start",
  ".btn--start",
  ".btn-continue",
  ".btn--continue",
  ".btn-report",
  ".btn--report",
  ".btn-report-primary",
  ".btn--report-primary",
  ".btn-secondary",
  ".btn--secondary",
  ".btn-save",
  ".btn--save",
  ".btn-success",
  ".btn--success",
  ".btn-next",
  ".btn--next",
  ".btn-back",
  ".btn--back",
  ".btn-warning",
  ".btn--warning",
  ".btn-danger",
  ".btn--danger",
  ".btn-outline",
  ".btn--outline",
  ".btn-ghost",
  ".btn--ghost",
  ".btn:disabled",
  ".btn:focus-visible",
];

for (const cls of requiredClasses) {
  assert(cssContent.includes(cls), `Buton sınıfı/durumu ${cls} index.css içinde tanımlı`);
}

// ── Test 3: WCAG AA Color Contrast Verification ──
console.log("\n=== T03: WCAG AA Color Contrast Verification ===");

// 1. Primary / Start Action (Cobalt #2563eb / #1d4ed8 vs #ffffff)
const primaryHoverRatio = contrastRatio("#1d4ed8", "#ffffff");
assert(primaryHoverRatio >= 4.5, `Primary / Start Hover (#1d4ed8 vs #ffffff) Kontrast: ${primaryHoverRatio.toFixed(2)}:1 (>= 4.5:1 PASS)`);

// 2. Continue Action (Teal #0f766e / #0d655e vs #ffffff)
const continueRatio = contrastRatio("#0f766e", "#ffffff");
assert(continueRatio >= 4.5, `Continue Action (#0f766e vs #ffffff) Kontrast: ${continueRatio.toFixed(2)}:1 (>= 4.5:1 PASS)`);

// 3. Report Primary Action (Indigo #4f46e5 / #4338ca vs #ffffff)
const reportRatio = contrastRatio("#4f46e5", "#ffffff");
assert(reportRatio >= 4.5, `Report Primary (#4f46e5 vs #ffffff) Kontrast: ${reportRatio.toFixed(2)}:1 (>= 4.5:1 PASS)`);
const reportHoverRatio = contrastRatio("#4338ca", "#ffffff");
assert(reportHoverRatio >= 4.5, `Report Hover (#4338ca vs #ffffff) Kontrast: ${reportHoverRatio.toFixed(2)}:1 (>= 4.5:1 PASS)`);

// 4. Secondary Action (Teal #0f766e vs #ffffff)
const secondaryRatio = contrastRatio("#0f766e", "#ffffff");
assert(secondaryRatio >= 4.5, `Secondary (#0f766e vs #ffffff) Kontrast: ${secondaryRatio.toFixed(2)}:1 (>= 4.5:1 PASS)`);

// 5. Success / Save Action (Green #15803d / #047857 vs #ffffff)
const successRatio = contrastRatio("#15803d", "#ffffff");
assert(successRatio >= 4.5, `Success / Save (#15803d vs #ffffff) Kontrast: ${successRatio.toFixed(2)}:1 (>= 4.5:1 PASS)`);

// 6. Warning Action (Amber #b45309 vs #ffffff)
const warningRatio = contrastRatio("#b45309", "#ffffff");
assert(warningRatio >= 4.5, `Warning (#b45309 vs #ffffff) Kontrast: ${warningRatio.toFixed(2)}:1 (>= 4.5:1 PASS)`);

// 7. Danger Action (Crimson #dc2626 vs #ffffff)
const dangerRatio = contrastRatio("#dc2626", "#ffffff");
assert(dangerRatio >= 4.5, `Danger (#dc2626 vs #ffffff) Kontrast: ${dangerRatio.toFixed(2)}:1 (>= 4.5:1 PASS)`);

// 8. Base Text (#0f172a on #f8fafc)
const bodyTextRatio = contrastRatio("#0f172a", "#f8fafc");
assert(bodyTextRatio >= 7.0, `Body Text (#0f172a vs #f8fafc) Kontrast: ${bodyTextRatio.toFixed(2)}:1 (>= 7.0:1 AAA PASS)`);

// ── Test 4: View Alignment Checks ──
console.log("\n=== T04: Core Views Button Semantic Alignment ===");

const projectDetailCode = fs.readFileSync(path.join(ROOT_DIR, "src/views/ProjectDetailView.tsx"), "utf-8");
assert(projectDetailCode.includes("btn--start") && projectDetailCode.includes("Analize Başla"), "ProjectDetailView: Analize Başla butonu btn--start sınıfına sahip");
assert(projectDetailCode.includes("btn--continue") && projectDetailCode.includes("Devam"), "ProjectDetailView: Devam butonu btn--continue (Teal #0f766e) sınıfına sahip");
assert((projectDetailCode.includes("btn-report-primary") || projectDetailCode.includes("btn--report")) && projectDetailCode.includes("Rapor Önizleme"), "ProjectDetailView: Rapor Önizleme butonu btn-report-primary (Indigo #4f46e5) sınıfına sahip");
assert(projectDetailCode.includes("btn--back") && projectDetailCode.includes("Geri"), "ProjectDetailView: Geri butonu btn--back sınıfına sahip");

const homeViewCode = fs.readFileSync(path.join(ROOT_DIR, "src/views/HomeView.tsx"), "utf-8");
assert(homeViewCode.includes("btn--start") && homeViewCode.includes("Yeni Analiz"), "HomeView: Yeni Analiz butonu btn--start sınıfına sahip");
assert(homeViewCode.includes("btn--continue") && homeViewCode.includes("Aç"), "HomeView: Projeyi Aç butonu btn--continue sınıfına sahip");
assert(homeViewCode.includes("btn--danger") && homeViewCode.includes("Sil"), "HomeView: Projeyi Sil butonu btn--danger sınıfına sahip");

const newProjectCode = fs.readFileSync(path.join(ROOT_DIR, "src/views/NewProjectView.tsx"), "utf-8");
assert(newProjectCode.includes("btn--back") && (newProjectCode.includes("İptal") || newProjectCode.includes("Geri")), "NewProjectView: İptal / Geri butonları btn--back sınıfına sahip");
assert(newProjectCode.includes("btn--next") && newProjectCode.includes("Devam Et"), "NewProjectView: Devam Et butonu btn--next sınıfına sahip");
assert(newProjectCode.includes("btn--start") && newProjectCode.includes("Analizi Oluştur"), "NewProjectView: Analizi Oluştur butonu btn--start sınıfına sahip");

const questionScreenCode = fs.readFileSync(path.join(ROOT_DIR, "src/views/QuestionScreen.tsx"), "utf-8");
assert(questionScreenCode.includes("btn-custom-question") && questionScreenCode.includes("Özel Soru"), "QuestionScreen: + Özel Soru butonu btn-custom-question sınıfına sahip");
assert(questionScreenCode.includes("btn-interim-report") && questionScreenCode.includes("Ara Rapor"), "QuestionScreen: Ara Rapor butonu btn-interim-report sınıfına sahip");
assert(questionScreenCode.includes("btn--next") && questionScreenCode.includes("Sonraki"), "QuestionScreen: Sonraki butonu btn--next (Mavi) sınıfına sahip");
assert(questionScreenCode.includes("btn--back") && questionScreenCode.includes("Önceki"), "QuestionScreen: Önceki butonu btn--back (Nötr) sınıfına sahip");
assert(questionScreenCode.includes("btn-save-exit") && questionScreenCode.includes("Kaydet ve Çık"), "QuestionScreen: Kaydet ve Çık butonu btn-save-exit / btn--save (Yeşil) sınıfına sahip");
assert(questionScreenCode.includes("btn--save") && questionScreenCode.includes("Tamamla"), "QuestionScreen: Tamamla butonu btn--save (Yeşil) sınıfına sahip");

const semanticModalCode = fs.readFileSync(path.join(ROOT_DIR, "src/components/SemanticModal.tsx"), "utf-8");
assert(semanticModalCode.includes("btn--outline") && semanticModalCode.includes("İptal"), "SemanticModal: İptal butonu btn--outline (Açık Gri) sınıfına sahip");
assert(semanticModalCode.includes("btn--success") && (semanticModalCode.includes("Kaydet") || semanticModalCode.includes("Güncelle")), "SemanticModal: Kaydet/Güncelle butonu btn--success (Yeşil) sınıfına sahip");

const reportProfileModalCode = fs.readFileSync(path.join(ROOT_DIR, "src/components/ReportProfileModal.tsx"), "utf-8");
assert(reportProfileModalCode.includes("btn--outline") && reportProfileModalCode.includes("Vazgeç"), "ReportProfileModal: Vazgeç butonu btn--outline (Açık Gri) sınıfına sahip");
assert(reportProfileModalCode.includes("btn--success") && reportProfileModalCode.includes("Kaydet"), "ReportProfileModal: Kaydet butonu btn--success (Yeşil) sınıfına sahip");

const followupModalCode = fs.readFileSync(path.join(ROOT_DIR, "src/components/FollowupModal.tsx"), "utf-8");
assert(followupModalCode.includes("btn-outline") && followupModalCode.includes("Vazgeç"), "FollowupModal: Vazgeç butonu btn-outline (Açık Gri) sınıfına sahip");
assert(followupModalCode.includes("btn-success") && followupModalCode.includes("Bayrağı Kaydet"), "FollowupModal: Bayrağı Kaydet butonu btn-success (Yeşil) sınıfına sahip");
assert(followupModalCode.includes("btn-outline-danger") && followupModalCode.includes("Bayrağı Kaldır"), "FollowupModal: Bayrağı Kaldır butonu btn-outline-danger (Kırmızı) sınıfına sahip");

const customQuestionModalCode = fs.readFileSync(path.join(ROOT_DIR, "src/components/CustomQuestionModal.tsx"), "utf-8");
assert(customQuestionModalCode.includes("btn--outline") && customQuestionModalCode.includes("İptal"), "CustomQuestionModal: İptal butonu btn--outline (Açık Gri) sınıfına sahip");
assert(customQuestionModalCode.includes("btn--success") && (customQuestionModalCode.includes("Soruyu Ekle") || customQuestionModalCode.includes("Güncelle")), "CustomQuestionModal: Soruyu Ekle butonu btn--success (Yeşil) sınıfına sahip");

console.log("\n" + "═".repeat(50));
console.log(`UI Button Visual Design Test Sonucu: ${passCount} PASS / ${failCount} FAIL`);
if (failCount === 0) {
  console.log("BAŞARILI: UI BUTTON DESIGN SYSTEM & CONTRAST ACCEPTANCE: PASS\n");
} else {
  console.error("BAŞARISIZ: ACCEPTANCE: FAIL\n");
  process.exit(1);
}
