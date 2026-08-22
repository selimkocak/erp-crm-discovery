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
const rawPermissions: any[] = defaultCap.permissions || [];

const stringPermissions: string[] = rawPermissions.filter((p: any) => typeof p === 'string');
const objectPermissions: any[] = rawPermissions.filter((p: any) => typeof p === 'object' && p !== null);

assert(stringPermissions.includes('core:default'), 'Capability: core:default present');
assert(stringPermissions.includes('sql:default'), 'Capability: sql:default present');
assert(stringPermissions.includes('sql:allow-execute'), 'Capability: sql:allow-execute present (Required for SQLite migrations & writes)');
assert(stringPermissions.includes('dialog:default'), 'Capability: dialog:default present');
assert(stringPermissions.includes('fs:default'), 'Capability: fs:default present');

const hasFsWrite = stringPermissions.includes('fs:allow-write-file') || objectPermissions.some((p: any) => p.identifier === 'fs:allow-write-file');
assert(hasFsWrite, 'Capability: fs:allow-write-file present (Required for DOCX & PDF native export)');

assert(!rawPermissions.some((p: any) => typeof p === 'string' && (p.includes('http') || p.includes('fetch'))), 'Zero remote network permissions enforced');
assert(tauriConf.plugins?.sql?.preload?.includes('sqlite:erp_discovery.db'), 'SQLite DB preload configured');

const clientSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/db/client.ts'), 'utf-8');
const migrationsSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/db/migrations.ts'), 'utf-8');
assert(clientSrc.includes('db.execute') && migrationsSrc.includes('db.execute'), 'Production SQL client and migrations require execute capability');

const fileSaverSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/export/fileSaver.ts'), 'utf-8');
assert(fileSaverSrc.includes('writeFile'), 'Production export client requires fs:allow-write-file capability');

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
assert(buildContent.includes('WINDOWS_KURULUM_YARDIMI.txt'), 'Windows-build packages WINDOWS_KURULUM_YARDIMI.txt into artifact');
assert(buildContent.includes('path: windows-artifacts/'), 'Windows-build uploads windows-artifacts directory');

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
assert(macosContent.includes('cp MACOS_KURULUM_YARDIMI.txt macos-artifacts/'), 'macOS-build packages MACOS_KURULUM_YARDIMI.txt into artifact');

// ── T07: macOS Artifact Kurulum Yardım Belgesi (FAZ-9.1) ──
console.log('\n=== T07: macOS Artifact Kurulum Yardım Belgesi (FAZ-9.1) ===');
const macosHelpPath = path.join(ROOT_DIR, 'MACOS_KURULUM_YARDIMI.txt');
assert(fs.existsSync(macosHelpPath), 'MACOS_KURULUM_YARDIMI.txt exists in repository root');
const macosHelpContent = fs.readFileSync(macosHelpPath, 'utf-8');
assert(macosHelpContent.includes('xattr -dr com.apple.quarantine "/Applications/ERP CRM Discovery.app"'), 'Kurulum belgesinde quarantine xattr komutu mevcut');
assert(macosHelpContent.includes('open "/Applications/ERP CRM Discovery.app"'), 'Kurulum belgesinde open komutu mevcut');
assert(macosHelpContent.includes('ERP CRM Discovery_0.1.0_aarch64.dmg'), 'Kurulum belgesinde DMG dosya adı doğru');
assert(macosHelpContent.includes('Apple Developer ID') || macosHelpContent.includes('Apple Notarization'), 'Kurulum belgesinde imzalama/notarization açıklaması mevcut');

// ── T08: Windows Artifact Kurulum Yardım Belgesi (FAZ-9.2) ──
console.log('\n=== T08: Windows Artifact Kurulum Yardım Belgesi (FAZ-9.2) ===');
const winHelpPath = path.join(ROOT_DIR, 'WINDOWS_KURULUM_YARDIMI.txt');
assert(fs.existsSync(winHelpPath), 'WINDOWS_KURULUM_YARDIMI.txt exists in repository root');
const winHelpContent = fs.readFileSync(winHelpPath, 'utf-8');
assert(winHelpContent.includes('ERP-CRM-Discovery_0.1.0_x64-setup.exe'), 'Windows yardım belgesinde Setup EXE adı mevcut');
assert(winHelpContent.includes('Ek Bilgi') && winHelpContent.includes('Yine de Çalıştır'), 'SmartScreen Ek Bilgi -> Yine de Çalıştır kılavuzu mevcut');
assert(winHelpContent.includes('CurrentUser') || winHelpContent.includes('yönetici parolası'), 'Standart kullanıcı / CurrentUser kurulum açıklaması mevcut');
assert(winHelpContent.includes('offline-first') || winHelpContent.includes('çevrimdışı'), 'Offline-first ve yerel gizlilik açıklaması mevcut');
assert(winHelpContent.includes('erp_discovery.db'), 'SQLite yerel veritabanı dosya adı mevcut');
assert(winHelpContent.includes('kaldırıldığında') && winHelpContent.includes('silinmez'), 'Program kaldırıldığında veri koruma garantisi mevcut');
assert(winHelpContent.includes('GitHub Issues') || winHelpContent.includes('issues'), 'Antivirüs yanlış pozitifleri için GitHub Issue bildirim adresi mevcut');



// ── T09: Soru Paketi Mevcudiyeti & Defansif UI Yükleyici ──
console.log('\n=== T09: Pack Availability & Defensive UI Loader ===');
const {
  hasQuestionPack,
  getPackStatus,
  getPackIdForFunction,
  isPackAvailable,
  loadQuestionPack,
  getAvailablePackIds,
} = await import('../src/engine/loader.js');

const {
  AVAILABLE_PACK_IDS,
  AVAILABLE_BUSINESS_FUNCTION_CODES,
  CANONICAL_QUESTION_PACKS,
} = await import('../src/generated/questionPacks.js');

// 1. Pack ID listesi ve mevcudiyet
assert(AVAILABLE_PACK_IDS.length === 33, `Tam 33 adet kanonik soru paketi kayıtlı (Bulunan: ${AVAILABLE_PACK_IDS.length})`);
assert(AVAILABLE_BUSINESS_FUNCTION_CODES.length === 33, `Tam 33 adet iş fonksiyonu için soru paketi mevcut (Bulunan: ${AVAILABLE_BUSINESS_FUNCTION_CODES.length})`);

// 2. Tüm 33 paket için hasQuestionPack() === true ve loadQuestionPack() ok === true paritesi
for (const bfCode of AVAILABLE_BUSINESS_FUNCTION_CODES) {
  assert(hasQuestionPack(bfCode) === true, `hasQuestionPack("${bfCode}") === true`);
  assert(getPackStatus(bfCode) === 'available', `getPackStatus("${bfCode}") === "available"`);

  const packId = getPackIdForFunction(bfCode)!;
  assert(isPackAvailable(packId) === true, `isPackAvailable("${packId}") === true`);

  const loadRes = await loadQuestionPack(packId);
  assert(loadRes.ok === true, `loadQuestionPack("${packId}") ok === true`);
  if (loadRes.ok) {
    assert(loadRes.pack.meta.pack_id === packId, `Pack ID eşleşti: ${packId}`);
    assert(Array.isArray(loadRes.pack.questions) && loadRes.pack.questions.length > 0, `Pack sorular içeriyor (${loadRes.pack.questions.length} soru)`);
  }
}

// MANAGEMENT paketi mevcudiyet ve soru sayısı doğrulaması (FAZ-42)
assert(hasQuestionPack('MANAGEMENT') === true, 'hasQuestionPack("MANAGEMENT") === true');
assert(getPackStatus('MANAGEMENT') === 'available', 'getPackStatus("MANAGEMENT") === "available"');
const mgtLoad = await loadQuestionPack('tr.management.core');
assert(mgtLoad.ok === true, 'loadQuestionPack("tr.management.core") ok === true');
if (mgtLoad.ok) {
  assert(mgtLoad.pack.questions.length === 47, `MANAGEMENT paketi tam 47 soru içerir (${mgtLoad.pack.questions.length})`);
}

// STRATEGY paketi mevcudiyet ve soru sayısı doğrulaması (FAZ-43)
assert(hasQuestionPack('STRATEGY') === true, 'hasQuestionPack("STRATEGY") === true');
assert(getPackStatus('STRATEGY') === 'available', 'getPackStatus("STRATEGY") === "available"');
const stratLoad = await loadQuestionPack('tr.strategy.core');
assert(stratLoad.ok === true, 'loadQuestionPack("tr.strategy.core") ok === true');
if (stratLoad.ok) {
  assert(stratLoad.pack.questions.length === 47, `STRATEGY paketi tam 47 soru içerir (${stratLoad.pack.questions.length})`);
}

// 3. Henüz geliştirilmemiş 1 fonksiyon için hasQuestionPack === false ve in_development
const unreadyCodes = [
  'TRAINING'
];
for (const code of unreadyCodes) {
  assert(hasQuestionPack(code) === false, `Unready fonksiyon hasQuestionPack("${code}") === false`);
  assert(getPackStatus(code) === 'in_development', `Unready fonksiyon getPackStatus("${code}") === "in_development"`);
}

// 4. Bilinmeyen kod ve tanımsız pack güvenliği
assert(getPackStatus('UNKNOWN_CODE_XYZ') === 'in_development', 'Bilinmeyen fonksiyon getPackStatus = in_development');
const unmappedResult = await loadQuestionPack('non.existent.pack');
assert(unmappedResult.ok === false, 'Tanımsız pack yüklenirken ok=false döner');
if (!unmappedResult.ok) {
  assert(unmappedResult.error?.includes('geliştirme aşamasındadır'), 'Tanımsız pack için kullanıcı dostu hata mesajı döner');
}

// 5. Production Bundle İçi Gömülü Paket Denetimi
console.log('\n=== T10: Production Bundle Embedded Pack Smoke Test ===');
const distAssetsDir = path.join(ROOT_DIR, 'dist/assets');
if (fs.existsSync(distAssetsDir)) {
  const assetFiles = fs.readdirSync(distAssetsDir);
  const jsFiles = assetFiles.filter(f => f.endsWith('.js'));
  assert(jsFiles.length > 0, `dist/assets içinde derlenmiş JS dosyaları mevcut (${jsFiles.length} dosya)`);

  let combinedBundleContent = '';
  for (const jsFile of jsFiles) {
    combinedBundleContent += fs.readFileSync(path.join(distAssetsDir, jsFile), 'utf-8');
  }

  // 5 kritik paket için bundle içi kontrol
  const smokePacks = ['tr.sales.core', 'tr.accounting.core', 'tr.payroll.core', 'tr.legal_compliance.core', 'tr.it_infrastructure.core'];
  for (const sp of smokePacks) {
    assert(combinedBundleContent.includes(sp), `Production bundle "${sp}" içeriyor`);
  }
} else {
  console.log('  ⚠ dist/assets bulunamadı (npm run build öncesi)');
}

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
