# Changelog

All notable changes to the **ERP CRM Discovery** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.4] - 2026-08-25

### Added
* **FAZ-62A Endüstriyel Veri Keşfi (OT_INDUSTRIAL_DATA):** 34. kanonik iş fonksiyonu ve 35. soru paketi (`tr.ot_industrial_data.core` v0.1.0, 58 soru, 22 süreç, 9 branching) — PLC, SCADA, sensör, OEE, kestirimci bakım, enerji analizörü ve dark data keşfi.
* **FAZ-62B OT İstasyon Profili ve Saha Hiyerarşisi:** `Plant -> Area -> Line -> Station -> Machine` 5 kademeli endüstriyel hiyerarşi, SQLite Migration 14 (`ot_stations` ve `ot_station_answers`), istasyon bazlı bağımsız cevap motoru ve DOCX/PDF Bölüm 3.2 entegrasyonu.
* **FAZ-62C Endüstriyel Veri ve Alarm Gereksinim Matrisi:** SQLite Migration 15 (`ot_data_requirements`, `ot_alarm_requirements`, `ot_quality_devices`), PLC/SCADA veri protokolleri, kalite ölçüm cihazları ve PDF-only senaryoları.
* **FAZ-63 BPMN Süreç Haritaları & Benimseme Riski (Adoption Risk):** SQLite Migration 16 (`process_maps`, `process_nodes`, `process_edges`), onay döngüleri ve karar düğümlerine göre otomatik süreç karmaşıklığı hesaplama, yüksek benimseme riski uyarısı ve Bölüm 4 raporlama entegrasyonu.
* **FAZ-64 Veri Yönetişimi Varlıkları ve Çok Kademeli Onaylar:** SQLite Migration 17 (`data_governance_assets`, `data_governance_access`, `data_governance_approvals`), veri varlığı yaşam döngüsü, onay kademeleri ve Bölüm 5 veri sahipliği raporu.
* **FAZ-65 Saha Kanıtı ve Doğrulama Kayıt Defteri:** SQLite Migration 18 (`evidence_items`, `evidence_links`), Managed Attachment Vault SHA-256 bütünlüğü, kanıt doğrulama durumları, kanıt kapsama oranı ve kanıtsız kritik konu tespiti.
* **FAZ-66 Pilot Saha Kabulü ve Go-Live Hazırlığı:** SQLite Migration 19 (`readiness_checks`), 8 kategori, 24 standart kontrol maddesi, NOT_APPLICABLE payda hesabı, kritik açık kuralı (blokeyken hazır saymama), öncelikli aksiyon planı ve Bölüm 7 raporlama entegrasyonu.
* **FAZ-67 Uzman Saha İncelemesi & Yayın Hazırlığı:**
  - `docs/review/FAZ67_EXPERT_FIELD_REVIEW_GUIDE.md`: MCS ve bağımsız uzmanlar için 10 başlıklı saha inceleme rehberi.
  - `docs/review/FAZ67_QUESTION_PACK_REVIEW_MATRIX.md`: 35 soru paketinin tamamını içeren detaylı denetim matrisi.
  - `docs/review/FAZ67_MARMARA_PILOT_ACCEPTANCE_GUIDE.md`: Marmara pilotu 14 aşamalı kabul rehberi ve UAT kontrol listesi.
  - `docs/release/FAZ67_RELEASE_READINESS_REPORT.md`: Kapsamlı yayın hazırlık raporu.
  - `docs/USER_GUIDE_TR.md`: 15 bölümlü Türkçe son kullanıcı kılavuzu.

### Fixed
* **Sentetik Üretim Pilotu Foreign Key Eşleme Onarımı:** `src/demo/manufacturingPilot.ts` içinde iş fonksiyonları eklenirken statik id yerine `business_functions` master tablosundaki gerçek anahtar kimliklerinin dinamik olarak sorgulanıp eşlenmesi sağlandı.
* **Aşama Bazlı Hata İzolasyonu ve Atomik Temizlik:** Demo oluşturma sürecindeki 14 ayrı veri grubu aşamalandırıldı; beklenmeyen bir hata durumunda `deleteProject` mekanizmasıyla yarım projenin ve bağlı kayıtların disk/veritabanından otomatik temizlenmesi güvence altına alındı.
* **SQLite Bütünlük Denetimi (PRAGMA foreign_key_check):** Demo proje kurulumu sonrasında `PRAGMA foreign_key_check` ile 0 ihlal kontrolü eklendi; `PRAGMA foreign_keys = ON` ortamlarında `%100` hatasız sentetik demo başlatma sağlandı.
* **Sayaç ve Font Paritesi:** PDF exportta font stil uyumluluğu sağlandı; HTML, DOCX ve PDF çıktılarında sıfır `undefined` ve sıfır veri sapması güvenceye alındı.

---

## [0.1.3] - 2026-08-24

### Added
* **Açık Proje Durum Aksiyonları:** Ana liste (`HomeView`) ve Proje Detay (`ProjectDetailView`) ekranlarına belirgin `[Pasife Al]` ve `[Aktifleştir]` durum değiştirme butonları ile onay pencereleri (`ProjectDeactivateModal`) eklendi.
* **Pasif Proje Veri Koruması ve Uyarı Bandı:** Pasif duruma alınan projelerde soru düzenleme, modül analizi ve yönetişim değişiklikleri kilitlendi; proje detayında açık durum bildirim bandı entegre edildi.
* **Sentetik İmalat Pilot Veri Seti (Marmara Endüstriyel Sistemler A.Ş.):** Bursa lokasyonlu, 350 çalışanlı, kesikli üretim (makine & endüstriyel otomasyon imalatı) yapan kurumsal aktör için %100 sentetik, gerçekçi ve etik pilot veri seti hazırlandı (`src/demo/manufacturingPilot.ts`).
* **Kapsamlı Pilot Külliyatı:** 19 kanonik iş fonksiyonu, 94 detaylı örnek soru cevabı, semantik kayıtlar (18 bulgu, 18 gereksinim, 8 risk, 6 proje notu, 6 açık takip bayrağı), 5 yönetişim nesnesi, yetki/sorumluluk matrisi ve SoD riskleri.
* **Tek Tıkla Örnek Üretim Projesi Oluşturma:** Ana sayfadan doğrudan sentetik pilot projeyi yükleyen kullanıcı dostu onay modalı (`CreateDemoProjectModal`) ve tekrarlı oluşturmalarda benzersiz adlandırma (`(1)`, `(2)`) desteği sağlandı.

---

## [0.1.2] - 2026-08-24

### Added
* **Project Backup & Restore Engine (.erpcrm Archive):** Zero-dependency pure TypeScript POSIX USTAR + GZIP portable archive engine (`src/storage/tar.ts`, `src/storage/backupManager.ts`), backing up and restoring complete project data (25 SQLite tables, Managed Attachment Vault digital twin evidence files, and JSON manifest) with SHA-256 integrity checksums and strict path traversal protection.
* **Visible Backup Location & Show in Folder:** Explicit native Save Dialog with folder memory, displaying the full physical path of the generated `.erpcrm` backup file, alongside a "Klasörde Göster" (Show in Explorer / Finder) button and single-click "Yedekten Ön İnceleme" (Inspect Backup) preview.
* **Active / Passive Project Lifecycle Management:** Full status lifecycle transitions (`active` / `passive` / `completed` / `archived`) across `HomeView`, `NewProjectView`, and `ProjectDetailView`, including dedicated status filter tabs and non-destructive status updates.
* **Reversible Scope Management (Kapsamı Düzenle):** `ProjectScopeModal` allowing soft-removal of business functions with mandatory removal reasons and data count warnings, preserving all past responses in SQLite while recording changes in the `project_scope_changes` audit trail table (Migration 12).
* **Cross-Platform Semantic Status Normalization:** Built-in `statusDictionary` (`src/models/statusDictionary.ts`) unifying findings, requirements, risks, and notes statuses across Windows and macOS with zero data loss and WCAG AA accessible badges.

### Fixed
* **Pure Desktop & Zero-Transaction Multi-Connection Hotfix:** Removed raw SQL `BEGIN TRANSACTION`/`COMMIT`/`ROLLBACK` statements sent over `@tauri-apps/plugin-sql` IPC pool to eliminate `cannot rollback - no transaction is active` errors across macOS and Windows, using sequential executions and application-level compensation cleanup (`deleteProject`).
* **External Hyperlink Resolution:** Integrated `@tauri-apps/plugin-opener` with fallback handlers for AboutModal GitHub repository links and developer email triggers on desktop platforms.
* **Database Schema Migration 12 & CI Alignment:** Integrated `project_scope_changes` and soft-removal columns (`is_active`, `removed_at`, `removal_reason`), synchronizing clean install and migration transaction test expectations (25 tables).

---

## [0.1.1] - 2026-08-23

### Fixed
* **Wide Screen Responsiveness:** Expanded `.main-content` and `.header-inner` containers from 1200px to 1560px max-width, allowing process tables and governance matrices to utilize wide desktop displays (1440px, 1600px, 2048px) comfortably without being squeezed into a narrow center column.
* **Governance Modal Overflow & Sizing:**
  * Expanded `.gov-modal-container` default max-width from 580px to `min(880px, calc(100vw - 48px))`.
  * Added `.gov-modal-container--large` (`min(1080px, calc(100vw - 48px))`) for complex matrices.
  * Strictly eliminated modal horizontal scrollbars with `overflow-x: hidden` and clean vertical scrolling.
  * Added responsive `@media (max-width: 768px)` breakdown collapsing two-column forms to a single column on compact screens.
* **Process Table Column Widths & Select Readability:**
  * Adjusted column min-widths in `ProjectDetailView.tsx` (Standard Function: 220px, Category: 130px, Department: 190px, Responsible: 180px, Status: 145px, Analysis: 115px).
  * Status `<select>` width widened to 135px minimum, eliminating dropdown option clipping (`Ba...` / `De...`).
  * Analysis button widened to 105px minimum with consistent bold typography and iconography.
* **Governance Navigation Tabs:** Applied `flex-wrap: wrap` to `.gov-nav-tabs` so all 7 tabs remain fully visible, clean, and accessible on medium and compact desktop resolutions without cutoff.
* **Ergonomic Select Option Labels:** Streamlined verbose multi-hyphen option labels across all governance modals (e.g. `Veri Sahibi (Data Owner)`, `Veri Sorumlusu (Data Steward)`, `Rol / Pozisyon`, `Kritik (Critical)`).
* **In-App Toast Notification System:** Replaced native browser/OS `alert()` popups in governance views with non-blocking, auto-dismissing in-app toast banners (`.gov-toast`) with success, info, and error variants.

---

## [0.1.0] - 2026-08-23


### Added
* **33 Canonical Business Functions & 34 Question Packs:** 1,492 questions (792 required, 700 optional, 213 branching) covering sales, procurement, warehouse, inventory, logistics, accounting, treasury, budget, reporting, crm, proposals, marketing, supplier management, quality, maintenance, production planning, work orders, costing, asset management, human resources, payroll, legal compliance, IT infrastructure, master data management, project management, e-transformation, invoicing, document management, import, export, ecommerce, general management, strategy, and training.
* **Declarative Question Engine:** Schema-driven dynamic question runner with single-choice, multiple-choice, free-text, choice notes, and general meeting notes.
* **Selection Clear / Deselection Support:** Full `Escape` keyboard and UI action support to deselect radio buttons and single-choice answers safely.
* **Semantic Analysis Layer:** Automated structured extraction for Findings, Requirements, Risks, and Project Notes.
* **Question Followup Flags:** 🟡 *Revisit Later (Sonra Dön)* and 🔴 *Critical Followup (Kritik Takip)* flags automatically linked to Section 5 Open Topics.
* **Managed Attachment Vault:** Project-isolated digital twin evidence vault (`{appLocalDataDir}/projects/{projectId}/attachments/`) with SHA-256 verification and `file:///` hyperlinking.
* **Data Ownership, Authorization and Governance Layer (FAZ-46):** 
  * 23 starter canonical governance objects (item master, vendor master, BOM, PO, GL journal, etc.)
  * RACI / Data Owner & Data Steward responsibility assignments (As-Is / To-Be)
  * Authorization matrix with effective discrepancy (sapma) detection
  * Approval limits and threshold tier management
  * Segregation of Duties (SoD) conflict risk matrix and mitigation tracking
* **End-to-End Fictional Discrete Manufacturing Pilot (FAZ-47):** Complete simulated field study on `[KURGUSAL] DeltaForm Endüstriyel Sistemler A.Ş.` (3 locations, 20 departments, 860 question responses, 15 critical operational issues, two-pass DOCX/PDF reporting, conditional go-live readiness evaluation).
* **Question Corpus Audit Engine (FAZ-48):** Automated CI/CLI tool (`npm run audit:corpus`) checking 0 duplicate IDs, 0 composite key collisions, 0 broken branching triggers, 0 empty options, and 0 formatting errors.
* **Multi-Platform Desktop Packaging:** Windows x64 NSIS installer and macOS Apple Silicon (ARM64) DMG.
* **Dual Format Reporting:** Microsoft Word (.docx) with editable corporate typography and Vector PDF (.pdf) with embedded Liberation Sans TrueType Unicode font.

### Changed
* **Deterministic Code Generation:** `scripts/generate_business_functions.mjs` converted to static header format without ISO timestamps, ensuring 0-byte git diff across repetitive builds.
* **Hardened Migration Engine:** `src/db/migrations.ts` upgraded with `schema_migrations` tracking, atomic per-version `BEGIN TRANSACTION`/`COMMIT` blocks, and automatic `ROLLBACK` on failure.
* **Legacy Database Compatibility:** Automatic baseline detection for legacy v1..v10 SQLite databases without data loss.
* **Attribution & About Modal:** Clean vendor-neutral product branding with developer attribution and offline-first / AI-free guarantees.

### Security and Privacy
* **100% Offline-First & Zero Cloud:** All business discoveries, trade secrets, and audit records reside strictly on the user's local disk in SQLite.
* **Zero Telemetry / Zero Analytics:** No tracking, no background network calls, no user registration.
* **Least Privilege Desktop Sandbox:** Tauri 2 network fetch/HTTP permissions disabled in production build.
* **Privacy by Design in Attachments:** `source_absolute_path` is never persisted in SQLite database tables.
* **Synthetic / Fictional Pilot Boundary:** Strict policy ensuring all test fixtures and pilot records use fictional companies (`[KURGUSAL]`) with zero real corporate or personal data.

### Testing
* **71 Automated Test Suites (2,120+ Tests):**
  * 100% PASS across unit, integration, migration, governance, and report generation suites.
  * Cross-platform CI verification on Linux (Ubuntu), Windows (x64), and macOS (Apple Silicon).
  * Automated reproducibility and corpus integrity test harness.

### Known Limitations
* **Code Signing:** Windows installer and macOS DMG binaries are not signed with a paid commercial certificate; OS security dialogs ("SmartScreen" on Windows, "Gatekeeper" on macOS) may require a one-time "Run anyway" / "Open" confirmation.
* **macOS Architecture:** Current pre-built macOS packages target Apple Silicon (M1/M2/M3/M4) arm64; Intel x86_64 Mac users must build from source.
* **Advisory & Decision Boundary:** ERP CRM Discovery is a structured field assessment and diagnostic tool; it does not automatically select vendors, negotiate pricing, or execute transactional ERP operations.
