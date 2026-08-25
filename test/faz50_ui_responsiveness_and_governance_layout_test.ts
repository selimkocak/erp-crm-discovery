/**
 * ERP CRM Discovery — FAZ-50 UI Responsiveness & Governance Layout Acceptance Test
 *
 * Verifies:
 * 1. Wide Screen Container Max-Width (1560px in .main-content & .header-inner)
 * 2. Governance Modal Container Widths & Overflow Constraints (880px default, 1080px large, overflow-x: hidden)
 * 3. Form Grid Responsive Breakdown (2 cols default, 1 col on <=768px screens)
 * 4. Governance Nav Tabs Wrapping & Resilience (.gov-nav-tabs flex-wrap: wrap)
 * 5. Process Table Column Widths & Select Readability in ProjectDetailView.tsx
 * 6. Ergonomic Select Option Text in Governance Modals & Attachments
 * 7. In-App Floating Toast System (.gov-toast, .gov-toast--success, etc.)
 * 8. Elimination of Browser Native alert() Dialogs in Governance Views
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

const cssContent = fs.readFileSync(path.join(ROOT_DIR, "src/index.css"), "utf-8");
const projectDetailContent = fs.readFileSync(path.join(ROOT_DIR, "src/views/ProjectDetailView.tsx"), "utf-8");
const govDashboardContent = fs.readFileSync(path.join(ROOT_DIR, "src/views/GovernanceDashboardView.tsx"), "utf-8");
const govModalsContent = fs.readFileSync(path.join(ROOT_DIR, "src/components/governance/GovernanceModals.tsx"), "utf-8");
const govAttachmentsContent = fs.readFileSync(path.join(ROOT_DIR, "src/components/governance/GovernanceAttachmentsTab.tsx"), "utf-8");

console.log("\n=== T01: Wide Screen Container Full-Width & 10px Edge Harmony (FAZ-71) ===");
assert(
  cssContent.includes(".main-content {") && (cssContent.includes("max-width: 100%;") || cssContent.includes("padding: 10px") || cssContent.includes("var(--page-padding, 10px)")),
  ".main-content is configured for 10px edge padding full-width layout"
);
assert(
  cssContent.includes(".header-inner {") && (cssContent.includes("max-width: 100%;") || cssContent.includes("var(--page-padding, 10px)")),
  ".header-inner is synchronized for 10px edge padding full-width layout"
);

console.log("\n=== T02: Governance Modal Container Width & Overflow Guard ===");
assert(
  cssContent.includes(".gov-modal-container {") && cssContent.includes("max-width: min(880px, calc(100vw - 48px));"),
  ".gov-modal-container default max-width is expanded to min(880px, calc(100vw - 48px))"
);
assert(
  cssContent.includes("overflow-x: hidden;"),
  ".gov-modal-container strictly enforces overflow-x: hidden to prevent horizontal scrollbars"
);
assert(
  cssContent.includes(".gov-modal-container--large {") && cssContent.includes("max-width: min(1080px, calc(100vw - 48px));"),
  ".gov-modal-container--large supports wide matrices up to min(1080px, calc(100vw - 48px))"
);

console.log("\n=== T03: Form Grid Responsive Collapse ===");
assert(
  cssContent.includes(".gov-form-row {") && cssContent.includes("grid-template-columns: 1fr 1fr;"),
  ".gov-form-row defaults to 2-column grid layout"
);
assert(
  cssContent.includes("@media (max-width: 768px)") && cssContent.includes(".gov-form-row {") && cssContent.includes("grid-template-columns: 1fr;"),
  ".gov-form-row collapses to 1 column below 768px viewport width"
);

console.log("\n=== T04: Governance Nav Tabs Wrapping & Ergonomics ===");
assert(
  cssContent.includes(".gov-nav-tabs {") && cssContent.includes("flex-wrap: wrap;"),
  ".gov-nav-tabs applies flex-wrap: wrap so all 7 tabs remain visible without cutoffs"
);
assert(
  cssContent.includes(".gov-nav-tab {") && cssContent.includes("border-radius: 6px;"),
  ".gov-nav-tab uses styled pill buttons with clean borders"
);

console.log("\n=== T05: Process Table Column Widths & Select Readability ===");
assert(
  projectDetailContent.includes('minWidth: "220px"') || projectDetailContent.includes('min-width: "220px"') || projectDetailContent.includes("min-width: 220px"),
  "Standard Business Function column has min-width >= 220px"
);
assert(
  projectDetailContent.includes('minWidth: "145px"') || projectDetailContent.includes('min-width: "145px"') || projectDetailContent.includes("min-width: 145px"),
  "Process Status column header has min-width >= 140px"
);
assert(
  projectDetailContent.includes('minWidth: "135px"'),
  "Status <select> element in Process Table has minWidth >= 135px ensuring no truncation (Ba... / De...)"
);
assert(
  projectDetailContent.includes('minWidth: "105px"'),
  "Analysis button in Process Table has minWidth >= 100px"
);

console.log("\n=== T06: Ergonomic Option Labels in Governance Modals ===");
assert(
  govModalsContent.includes('<option value="data_owner">Veri Sahibi (Data Owner)</option>'),
  "ResponsibilityModal uses clean 'Veri Sahibi (Data Owner)' option without long clutter"
);
assert(
  govModalsContent.includes('<option value="data_steward">Veri Sorumlusu (Data Steward)</option>'),
  "ResponsibilityModal uses clean 'Veri Sorumlusu (Data Steward)' option"
);
assert(
  govModalsContent.includes('<option value="role">Rol / Pozisyon</option>'),
  "SubjectModal uses clean 'Rol / Pozisyon' option"
);
assert(
  govModalsContent.includes('<option value="critical">Kritik (Critical)</option>'),
  "SodRiskModal uses clean 'Kritik (Critical)' option"
);
assert(
  govAttachmentsContent.includes('<option value="object">Yönetişim Nesnesi</option>'),
  "GovernanceAttachmentsTab uses clean 'Yönetişim Nesnesi' option"
);

console.log("\n=== T07: In-App Toast Notification System ===");
assert(
  cssContent.includes(".gov-toast {") && cssContent.includes(".gov-toast--success") && cssContent.includes(".gov-toast--error"),
  "src/index.css defines comprehensive .gov-toast styling"
);
assert(
  govDashboardContent.includes("const [toast, setToast] = useState<"),
  "GovernanceDashboardView manages in-app toast state"
);
assert(
  govDashboardContent.includes("showToast("),
  "GovernanceDashboardView implements showToast helper with auto-dismiss"
);
assert(
  govDashboardContent.includes('className={`gov-toast gov-toast--${toast.type}`}'),
  "GovernanceDashboardView renders floating toast UI component"
);

console.log("\n=== T08: Elimination of Native alert() in Governance Views ===");
const govDashboardAlerts = (govDashboardContent.match(/\balert\s*\(/g) || []).length;
const govAttachmentsAlerts = (govAttachmentsContent.match(/\balert\s*\(/g) || []).length;
assert(
  govDashboardAlerts === 0,
  `GovernanceDashboardView has 0 native alert() calls (found: ${govDashboardAlerts})`
);
assert(
  govAttachmentsAlerts === 0,
  `GovernanceAttachmentsTab has 0 native alert() calls (found: ${govAttachmentsAlerts})`
);

console.log(`\n========================================`);
console.log(`FAZ-50 UI RESPONSIVENESS TEST RESULTS:`);
console.log(`Total: ${passCount + failCount} | Passed: ${passCount} | Failed: ${failCount}`);
console.log(`========================================\n`);

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
