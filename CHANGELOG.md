# Changelog

All notable changes to the **ERP CRM Discovery** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
