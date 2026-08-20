/**
 * ERP CRM Discovery — Migration Definitions (Single Source of Truth)
 *
 * Framework-independent database schema definitions and migrations.
 *
 * Single Source of Truth for:
 * 1. Production Tauri plugin-sql migration runner (src/db/migrations.ts)
 * 2. Automated test suite (test/clean_install_test.ts)
 */

export interface MigrationDefinition {
  version: number;
  description: string;
  sql: string[];
}

export const MIGRATION_DEFINITIONS: readonly MigrationDefinition[] = [
  {
    version: 1,
    description: "Initial Schema (FAZ-1)",
    sql: [
      `CREATE TABLE IF NOT EXISTS analysis_projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS company_profiles (
        id TEXT PRIMARY KEY,
        analysis_project_id TEXT NOT NULL,
        company_name TEXT NOT NULL,
        trade_name TEXT,
        tax_number TEXT,
        city TEXT,
        country TEXT NOT NULL DEFAULT 'Türkiye',
        employee_count TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS business_functions (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name_tr TEXT NOT NULL,
        name_en TEXT NOT NULL,
        category TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1
      );`,
      `CREATE TABLE IF NOT EXISTS project_business_functions (
        id TEXT PRIMARY KEY,
        analysis_project_id TEXT NOT NULL,
        business_function_id TEXT NOT NULL,
        company_department_name TEXT,
        responsible_person TEXT,
        status TEXT NOT NULL DEFAULT 'not_started',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE,
        FOREIGN KEY (business_function_id) REFERENCES business_functions(id) ON DELETE RESTRICT,
        UNIQUE (analysis_project_id, business_function_id)
      );`,
      `CREATE INDEX IF NOT EXISTS idx_company_project ON company_profiles(analysis_project_id);`,
      `CREATE INDEX IF NOT EXISTS idx_pbf_project ON project_business_functions(analysis_project_id);`,
      `CREATE INDEX IF NOT EXISTS idx_pbf_func ON project_business_functions(business_function_id);`
    ]
  },
  {
    version: 2,
    description: "Question Answers and Session State (FAZ-2)",
    sql: [
      `CREATE TABLE IF NOT EXISTS question_answers (
        id                     TEXT PRIMARY KEY,
        analysis_project_id    TEXT NOT NULL,
        business_function_code TEXT NOT NULL,
        question_pack_id       TEXT NOT NULL,
        question_pack_version  TEXT NOT NULL,
        question_id            TEXT NOT NULL,
        answer_data            TEXT NOT NULL DEFAULT '{}',
        created_at             TEXT NOT NULL,
        updated_at             TEXT NOT NULL,
        FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE,
        UNIQUE (analysis_project_id, business_function_code, question_id)
      );`,
      `CREATE TABLE IF NOT EXISTS question_session_state (
        id                     TEXT PRIMARY KEY,
        analysis_project_id    TEXT NOT NULL,
        business_function_code TEXT NOT NULL,
        last_question_id       TEXT,
        updated_at             TEXT NOT NULL,
        FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE,
        UNIQUE (analysis_project_id, business_function_code)
      );`,
      `CREATE INDEX IF NOT EXISTS idx_qa_project_bf ON question_answers(analysis_project_id, business_function_code);`,
      `CREATE INDEX IF NOT EXISTS idx_qss_project_bf ON question_session_state(analysis_project_id, business_function_code);`
    ]
  },
  {
    version: 3,
    description: "Semantic Analysis Layer: Findings, Requirements, Risks, Notes (FAZ-3)",
    sql: [
      `CREATE TABLE IF NOT EXISTS analysis_findings (
        id                     TEXT PRIMARY KEY,
        analysis_project_id    TEXT NOT NULL,
        business_function_code TEXT NOT NULL,
        question_id            TEXT,
        title                  TEXT NOT NULL,
        description            TEXT NOT NULL DEFAULT '',
        priority               TEXT NOT NULL DEFAULT 'medium',
        status                 TEXT NOT NULL DEFAULT 'open',
        created_at             TEXT NOT NULL,
        updated_at             TEXT NOT NULL,
        FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS analysis_requirements (
        id                     TEXT PRIMARY KEY,
        analysis_project_id    TEXT NOT NULL,
        business_function_code TEXT NOT NULL,
        question_id            TEXT,
        title                  TEXT NOT NULL,
        description            TEXT NOT NULL DEFAULT '',
        priority               TEXT NOT NULL DEFAULT 'medium',
        status                 TEXT NOT NULL DEFAULT 'draft',
        created_at             TEXT NOT NULL,
        updated_at             TEXT NOT NULL,
        FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS analysis_risks (
        id                     TEXT PRIMARY KEY,
        analysis_project_id    TEXT NOT NULL,
        business_function_code TEXT NOT NULL,
        question_id            TEXT,
        title                  TEXT NOT NULL,
        description            TEXT NOT NULL DEFAULT '',
        impact                 TEXT NOT NULL DEFAULT 'medium',
        probability            TEXT NOT NULL DEFAULT 'medium',
        mitigation_note        TEXT,
        status                 TEXT NOT NULL DEFAULT 'open',
        created_at             TEXT NOT NULL,
        updated_at             TEXT NOT NULL,
        FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS project_notes (
        id                     TEXT PRIMARY KEY,
        analysis_project_id    TEXT NOT NULL,
        business_function_code TEXT,
        question_id            TEXT,
        note                   TEXT NOT NULL,
        created_at             TEXT NOT NULL,
        updated_at             TEXT NOT NULL,
        FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS idx_findings_project ON analysis_findings(analysis_project_id, business_function_code);`,
      `CREATE INDEX IF NOT EXISTS idx_requirements_project ON analysis_requirements(analysis_project_id, business_function_code);`,
      `CREATE INDEX IF NOT EXISTS idx_risks_project ON analysis_risks(analysis_project_id, business_function_code);`,
      `CREATE INDEX IF NOT EXISTS idx_notes_project ON project_notes(analysis_project_id);`
    ]
  },
  {
    version: 4,
    description: "Report Profiles: Executive Summary, Overall Assessment, Open Topics (FAZ-4)",
    sql: [
      `CREATE TABLE IF NOT EXISTS analysis_report_profiles (
        id                     TEXT PRIMARY KEY,
        analysis_project_id    TEXT NOT NULL UNIQUE,
        executive_summary      TEXT,
        overall_assessment     TEXT,
        open_topics            TEXT,
        created_at             TEXT NOT NULL,
        updated_at             TEXT NOT NULL,
        FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS idx_report_profiles_project ON analysis_report_profiles(analysis_project_id);`
    ]
  },
  {
    version: 5,
    description: "Project Custom Questions, Options, and Answers (FAZ-8)",
    sql: [
      `CREATE TABLE IF NOT EXISTS project_custom_questions (
        id                     TEXT PRIMARY KEY,
        analysis_project_id    TEXT NOT NULL,
        business_function_code TEXT NOT NULL,
        process_name           TEXT NOT NULL,
        question_text          TEXT NOT NULL,
        description            TEXT,
        question_type          TEXT NOT NULL,
        is_required            INTEGER NOT NULL DEFAULT 0,
        sort_order             INTEGER NOT NULL DEFAULT 100,
        is_active              INTEGER NOT NULL DEFAULT 1,
        created_at             TEXT NOT NULL,
        updated_at             TEXT NOT NULL,
        FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS project_custom_question_options (
        id                     TEXT PRIMARY KEY,
        custom_question_id     TEXT NOT NULL,
        value                  TEXT NOT NULL,
        label                  TEXT NOT NULL,
        sort_order             INTEGER NOT NULL DEFAULT 0,
        is_other               INTEGER NOT NULL DEFAULT 0,
        created_at             TEXT NOT NULL,
        FOREIGN KEY (custom_question_id) REFERENCES project_custom_questions(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS project_custom_question_answers (
        id                     TEXT PRIMARY KEY,
        analysis_project_id    TEXT NOT NULL,
        business_function_code TEXT NOT NULL,
        custom_question_id     TEXT NOT NULL,
        answer_data            TEXT NOT NULL DEFAULT '{}',
        created_at             TEXT NOT NULL,
        updated_at             TEXT NOT NULL,
        FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE,
        FOREIGN KEY (custom_question_id) REFERENCES project_custom_questions(id) ON DELETE CASCADE,
        UNIQUE (analysis_project_id, custom_question_id)
      );`,
      `CREATE INDEX IF NOT EXISTS idx_pcq_project_bf ON project_custom_questions(analysis_project_id, business_function_code);`,
      `CREATE INDEX IF NOT EXISTS idx_pcqo_question ON project_custom_question_options(custom_question_id);`,
      `CREATE INDEX IF NOT EXISTS idx_pcqa_project ON project_custom_question_answers(analysis_project_id);`
    ]
  },
  {
    version: 6,
    description: "Question Follow-up Flags: Revisit & Critical Tracking (FAZ-9)",
    sql: [
      `CREATE TABLE IF NOT EXISTS question_followups (
        id                     TEXT PRIMARY KEY,
        analysis_project_id    TEXT NOT NULL,
        business_function_code TEXT NOT NULL,
        question_id            TEXT NOT NULL,
        flag_type              TEXT NOT NULL,
        note                   TEXT,
        status                 TEXT NOT NULL DEFAULT 'open',
        created_at             TEXT NOT NULL,
        updated_at             TEXT NOT NULL,
        resolved_at            TEXT,
        FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE,
        UNIQUE (analysis_project_id, business_function_code, question_id)
      );`,
      `CREATE INDEX IF NOT EXISTS idx_qf_project_bf ON question_followups(analysis_project_id, business_function_code);`,
      `CREATE INDEX IF NOT EXISTS idx_qf_flag ON question_followups(flag_type);`
    ]
  },
  {
    version: 7,
    description: "Question Evidence & Attachments Metadata (FAZ-33)",
    sql: [
      `CREATE TABLE IF NOT EXISTS question_attachments (
        id                     TEXT PRIMARY KEY,
        analysis_project_id    TEXT NOT NULL,
        business_function_code TEXT NOT NULL,
        question_id            TEXT NOT NULL,
        answer_id              TEXT,
        original_file_name     TEXT NOT NULL,
        stored_file_name       TEXT NOT NULL,
        relative_path          TEXT NOT NULL,
        mime_type              TEXT NOT NULL,
        file_extension         TEXT NOT NULL,
        file_size              INTEGER NOT NULL,
        sha256                 TEXT NOT NULL,
        description            TEXT,
        sort_order             INTEGER NOT NULL DEFAULT 0,
        created_at             TEXT NOT NULL,
        updated_at             TEXT NOT NULL,
        FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS idx_qa_project_bf_q ON question_attachments(analysis_project_id, business_function_code, question_id);`,
      `CREATE INDEX IF NOT EXISTS idx_qa_project_sha ON question_attachments(analysis_project_id, sha256);`
    ]
  },
  {
    version: 8,
    description: "Managed Attachment Vault Metadata Extensions",
    sql: [
      `ALTER TABLE question_attachments ADD COLUMN source_file_name TEXT;`,
      `ALTER TABLE question_attachments ADD COLUMN source_absolute_path TEXT;`,
      `ALTER TABLE question_attachments ADD COLUMN imported_at TEXT;`
    ]
  }
] as const;
