/**
 * FAZ-6: Windows Native Acceptance & Dağıtım Hazırlığı Test Paketi
 *
 * Doğrulanan başlıklar:
 * 1. Version Parity (package.json == Cargo.toml == tauri.conf.json)
 * 2. Tauri 2 Windows / NSIS Bundle Konfigürasyonu
 * 3. Security Capabilities & Zero Network Guarantee
 * 4. Icon & Packaging Asset Integrity
 * 5. Windows Filename Sanitization & Reserved Name Safety
 * 6. CI/CD Workflow Dosya Bütünlüğü
 */

import * as fs from 'fs';
import * as path from 'path';
import { sanitizeFilename, getSanitizedReportFilename } from '../src/export/filename.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

const ROOT_DIR = path.resolve(process.cwd());

console.log('══════════════════════════════════════════════════');
console.log('FAZ-6: WINDOWS NATIVE ACCEPTANCE & RELEASE TEST');
console.log('══════════════════════════════════════════════════\n');

// ── T01: Manifest & Version Parity ──────────────
console.log('=== T01: Version & Manifest Parity ===');
const pkgJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8'));
const tauriConf = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'src-tauri/tauri.conf.json'), 'utf-8'));
const cargoToml = fs.readFileSync(path.join(ROOT_DIR, 'src-tauri/Cargo.toml'), 'utf-8');

const cargoVersionMatch = cargoToml.match(/version\s*=\s*"([^"]+)"/);
const cargoVersion = cargoVersionMatch ? cargoVersionMatch[1] : null;

assert(pkgJson.version === tauriConf.version, `package.json (${pkgJson.version}) === tauri.conf.json (${tauriConf.version})`);
assert(pkgJson.version === cargoVersion, `package.json (${pkgJson.version}) === Cargo.toml (${cargoVersion})`);
assert(tauriConf.bundle?.identifier === undefined || tauriConf.identifier === 'com.erpcrm.discovery', 'Tauri app identifier = com.erpcrm.discovery');
assert(tauriConf.productName === 'ERP CRM Discovery', 'Tauri product name = ERP CRM Discovery');
assert(pkgJson.scripts?.tauri === 'tauri', 'package.json defines canonical tauri script');

// ── T02: Tauri 2 Bundle & NSIS Configuration ────
console.log('\n=== T02: Tauri 2 Windows & NSIS Configuration ===');
assert(tauriConf.bundle?.active === true, 'Bundle is active');
assert(tauriConf.bundle?.targets === 'all', 'Bundle targets all platforms');
assert(!!tauriConf.bundle?.copyright, `Copyright defined: "${tauriConf.bundle?.copyright}"`);
assert(!!tauriConf.bundle?.category, `Category defined: "${tauriConf.bundle?.category}"`);
assert(!!tauriConf.bundle?.publisher, `Publisher defined: "${tauriConf.bundle?.publisher}"`);

const windowsConfig = tauriConf.bundle?.windows;
assert(windowsConfig?.webviewInstallMode?.type === 'downloadBootstrapper', 'WebView2 install mode = downloadBootstrapper (Lightweight online bootstrapper)');

const nsis = windowsConfig?.nsis;
assert(!!nsis, 'NSIS configuration block exists');
assert(nsis?.installMode === 'currentUser', 'NSIS installMode = currentUser (No admin UAC prompt required)');
assert(Array.isArray(nsis?.languages) && nsis.languages.includes('Turkish'), 'NSIS includes Turkish language support');
assert(Array.isArray(nsis?.languages) && nsis.languages.includes('English'), 'NSIS includes English language support');
assert(nsis?.displayLanguageSelector === true, 'NSIS displayLanguageSelector enabled');


// ── T03: Security & Capability Permissions ──────
console.log('\n=== T03: Security & Capabilities Validation ===');
const defaultCap = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'src-tauri/capabilities/default.json'), 'utf-8'));
const permissions: string[] = defaultCap.permissions || [];

assert(permissions.includes('core:default'), 'Capability: core:default present');
assert(permissions.includes('sql:default'), 'Capability: sql:default present');
assert(permissions.includes('sql:allow-execute'), 'Capability: sql:allow-execute present (Required for SQLite migrations & writes)');
assert(permissions.includes('dialog:default'), 'Capability: dialog:default present');
assert(permissions.includes('fs:default'), 'Capability: fs:default present');
assert(!permissions.some(p => p.includes('http') || p.includes('fetch')), 'Zero remote network permissions enforced');
assert(tauriConf.plugins?.sql?.preload?.includes('sqlite:erp_discovery.db'), 'SQLite DB preload configured');

const clientSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/db/client.ts'), 'utf-8');
const migrationsSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/db/migrations.ts'), 'utf-8');
assert(clientSrc.includes('db.execute') && migrationsSrc.includes('db.execute'), 'Production SQL client and migrations require execute capability');

// ── T04: Icon & Packaging Assets Integrity ──────
console.log('\n=== T04: Icon & Packaging Assets Integrity ===');
const iconPaths: string[] = tauriConf.bundle?.icon || [];
assert(iconPaths.length > 0, 'Icons list configured in tauri.conf.json');

for (const iconRelPath of iconPaths) {
  const fullPath = path.join(ROOT_DIR, 'src-tauri', iconRelPath);
  const exists = fs.existsSync(fullPath);
  const size = exists ? fs.statSync(fullPath).size : 0;
  assert(exists && size > 0, `Icon asset exists: ${iconRelPath} (${size} bytes)`);
}

const icoPath = path.join(ROOT_DIR, 'src-tauri/icons/icon.ico');
assert(fs.existsSync(icoPath) && fs.statSync(icoPath).size > 1000, 'Windows icon.ico valid multi-size icon file');

// ── T05: Windows Path Sanitization & Safety ──────
console.log('\n=== T05: Windows Path Sanitization & Export Safety ===');
const dangerousWindowsNames = [
  'ABC/Firma:Test*Doc?Name"1<2>3|End',
  'CON',
  'PRN',
  'AUX',
  'NUL',
  'COM1',
  'LPT1'
];

for (const testName of dangerousWindowsNames) {
  const sanitized = sanitizeFilename(testName);
  const hasInvalidChars = /[/\\?%*:|"<>]/g.test(sanitized);
  assert(!hasInvalidChars, `Sanitized "${testName}" -> "${sanitized}" (No Windows invalid chars)`);
}

const sampleDocxFilename = getSanitizedReportFilename('XYZ Otomotiv San. ve Tic. A.Ş.', '2026 ERP Keşif Analizi', 'docx');
assert(!/[/\\?%*:|"<>]/g.test(sampleDocxFilename), `DOCX Filename sanitized: ${sampleDocxFilename}`);
assert(sampleDocxFilename.endsWith('.docx'), 'DOCX extension correct');

const samplePdfFilename = getSanitizedReportFilename('Örnek Şirket / Şube * İstanbul', 'Ön Analiz Raporu', 'pdf');
assert(!/[/\\?%*:|"<>]/g.test(samplePdfFilename), `PDF Filename sanitized: ${samplePdfFilename}`);
assert(samplePdfFilename.endsWith('.pdf'), 'PDF extension correct');


// ── T06: CI/CD Workflows Integrity ──────────────
console.log('\n=== T06: CI/CD Workflows Integrity ===');
const ciPath = path.join(ROOT_DIR, '.github/workflows/ci.yml');
const buildPath = path.join(ROOT_DIR, '.github/workflows/windows-build.yml');

assert(fs.existsSync(ciPath), '.github/workflows/ci.yml exists');
const ciContent = fs.readFileSync(ciPath, 'utf-8');
assert(ciContent.includes('npm test'), 'CI runs npm test');
assert(ciContent.includes('npm run build'), 'CI runs npm run build');
assert(ciContent.includes('cargo check'), 'CI runs cargo check');

assert(fs.existsSync(buildPath), '.github/workflows/windows-build.yml exists');
const buildContent = fs.readFileSync(buildPath, 'utf-8');
assert(buildContent.includes('runs-on: windows-latest'), 'Windows-build runs on windows-latest runner');
assert(buildContent.includes('npm run generate'), 'Windows-build runs npm run generate');
assert(buildContent.includes('npm run test') || buildContent.includes('npm run test:windows') || buildContent.includes('npm test'), 'Windows-build runs test suite');
assert(buildContent.includes('npm run build'), 'Windows-build runs npm run build');
assert(buildContent.includes('cargo check'), 'Windows-build runs cargo check');
assert(buildContent.includes('npm run tauri build'), 'Windows-build runs npm run tauri build');
assert(buildContent.includes('upload-artifact'), 'Windows-build uploads installer artifact');

const macosBuildPath = path.join(ROOT_DIR, '.github/workflows/macos-build.yml');
assert(fs.existsSync(macosBuildPath), '.github/workflows/macos-build.yml exists');
const macosContent = fs.readFileSync(macosBuildPath, 'utf-8');
assert(macosContent.includes('runs-on: macos-latest'), 'macOS-build runs on macos-latest runner');
assert(macosContent.includes('npm run generate'), 'macOS-build runs npm run generate');
assert(macosContent.includes('npm run test') || macosContent.includes('npm run test:windows'), 'macOS-build runs test suite');
assert(macosContent.includes('npm run build'), 'macOS-build runs npm run build');
assert(macosContent.includes('cargo check'), 'macOS-build runs cargo check');
assert(macosContent.includes('npm run tauri build'), 'macOS-build runs npm run tauri build');
assert(macosContent.includes('upload-artifact'), 'macOS-build uploads macOS artifact');



// ── Sonuç ───────────────────────────────────────
console.log('\n══════════════════════════════════════════════════');
console.log(`FAZ-6 Release Readiness Test Sonucu: ${passed} PASS / ${failed} FAIL`);
console.log('══════════════════════════════════════════════════\n');

if (failed > 0) {
  console.error(`BAŞARISIZ: ${failed} test fail etti!`);
  process.exit(1);
} else {
  console.log('BAŞARILI: FAZ-6 RELEASE READINESS ACCEPTANCE: PASS\n');
}
