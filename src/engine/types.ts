/**
 * ERP CRM Discovery — Question Engine Types
 *
 * Bu dosya yalnızca TypeScript tip tanımları içerir.
 * Çalışma zamanı kodu yoktur.
 */

// ── Pack Metadata ───────────────────────────────────────────────────────────

export interface QuestionPackMeta {
  pack_id: string;           // "tr.sales.core"
  version: string;           // "0.1.0"
  schema_version: string;    // "1"
  language: string;          // "tr"
  business_function_code: string; // "SATIS_YNT"
  name: string;
  description: string;
}

// ── Answer Types ────────────────────────────────────────────────────────────

export type AnswerType =
  | "single_choice"
  | "multiple_choice"
  | "short_text"
  | "long_text"
  | "text"
  | "textarea"
  | "number"
  | "yes_no";

// ── Criticality ─────────────────────────────────────────────────────────────

export type Criticality = "low" | "medium" | "high" | "critical";

// ── Condition ───────────────────────────────────────────────────────────────

export type ConditionOperator = "equals" | "not_equals" | "contains";

export interface QuestionCondition {
  question_id: string;
  operator: ConditionOperator;
  value: string;
}

// ── Option ──────────────────────────────────────────────────────────────────

export interface QuestionOption {
  value: string;
  label: string;
  allow_note: boolean;  // seçildiğinde açıklama alanı göster
  is_other: boolean;    // "Diğer" seçeneği — not zorunlu olur
}

// ── Question ────────────────────────────────────────────────────────────────

export interface Question {
  id: string;                       // "SALES-001" or "CUSTOM-SALES-001"
  process: string;                  // "Müşteri ve Potansiyel Müşteri Yönetimi"
  sub_process?: string;
  order: number;
  question: string;
  description?: string;             // Bu soruyu neden soruyoruz?
  example_answers?: string[];       // Rehber örnekler (seçenek değil)
  answer_type: AnswerType;
  required: boolean;
  criticality: Criticality;
  options?: QuestionOption[];
  condition?: QuestionCondition;    // Bu soru hangi koşulda görünür
  tags?: string[];
  is_custom?: boolean;              // Proje yöneticisi özel sorusu mu?
  custom_question_id?: string;      // project_custom_questions tablosundaki ID
}

// ── Pack ────────────────────────────────────────────────────────────────────

export interface QuestionPack {
  meta: QuestionPackMeta;
  questions: Question[];
}

// ── Answer Data ─────────────────────────────────────────────────────────────

/** Seçilmiş bir seçenek ve opsiyonel açıklaması */
export interface SelectedAnswer {
  value: string;
  note?: string;
}

/**
 * Bir sorunun cevap verisi.
 * SQLite'ta JSON TEXT olarak saklanır.
 */
export interface AnswerData {
  // single_choice / multiple_choice için
  selected?: SelectedAnswer[];
  // short_text / long_text / number için
  text?: string;
  // Her soru tipi için opsiyonel genel not
  general_note?: string;
}

// ── DB Row ──────────────────────────────────────────────────────────────────

export interface QuestionAnswerRow {
  id: string;
  analysis_project_id: string;
  business_function_code: string;
  question_pack_id: string;
  question_pack_version: string;
  question_id: string;
  answer_data: string;  // JSON string
  created_at: string;
  updated_at: string;
}

// ── Progress ────────────────────────────────────────────────────────────────

export interface ProgressResult {
  answered: number;
  total: number;
  percentage: number;
}

// ── Pack Load Result ────────────────────────────────────────────────────────

export type PackLoadResult =
  | { ok: true; pack: QuestionPack }
  | { ok: false; error: string; packId?: string };

// ── Validation ──────────────────────────────────────────────────────────────

export interface ValidationError {
  code: string;
  message: string;
  questionId?: string;
}

export type PackValidationResult =
  | { valid: true }
  | { valid: false; errors: ValidationError[] };
