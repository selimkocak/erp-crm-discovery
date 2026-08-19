/**
 * ERP CRM Discovery — Question Pack Validator
 *
 * Question Pack JSON dosyasını kurallara göre doğrular.
 * Sessiz başarısızlık yoktur: bozuk pack açık hata döndürür.
 */

import type {
  ValidationError,
  PackValidationResult,
} from "./types";
import { CANONICAL_BUSINESS_FUNCTION_CODE_SET } from "../generated/businessFunctions";

const VALID_ANSWER_TYPES = new Set([
  "single_choice",
  "multiple_choice",
  "short_text",
  "long_text",
  "number",
]);

const VALID_OPERATORS = new Set(["equals", "not_equals", "contains"]);

const VALID_CRITICALITIES = new Set(["low", "medium", "high", "critical"]);

export function validateQuestionPack(pack: unknown): PackValidationResult {
  const errors: ValidationError[] = [];

  if (!pack || typeof pack !== "object") {
    return { valid: false, errors: [{ code: "INVALID_ROOT", message: "Pack geçerli bir JSON nesnesi değil." }] };
  }

  const p = pack as Record<string, unknown>;

  // ── Meta doğrulama ──────────────────────────────────────────────────────
  const requiredMeta = [
    "pack_id", "version", "schema_version", "language",
    "business_function_code", "name", "description",
  ];

  if (!p.meta || typeof p.meta !== "object") {
    errors.push({ code: "MISSING_META", message: "Pack 'meta' alanı eksik." });
  } else {
    const meta = p.meta as Record<string, unknown>;
    for (const field of requiredMeta) {
      if (!meta[field] || typeof meta[field] !== "string") {
        errors.push({ code: "MISSING_META_FIELD", message: `meta.${field} eksik veya boş.` });
      }
    }

    if (
      typeof meta.business_function_code === "string" &&
      meta.business_function_code.length > 0 &&
      !CANONICAL_BUSINESS_FUNCTION_CODE_SET.has(meta.business_function_code)
    ) {
      errors.push({
        code: "INVALID_BUSINESS_FUNCTION_CODE",
        message: `meta.business_function_code "${meta.business_function_code}" canonical business function registry'de bulunamadı.`,
      });
    }
  }

  // ── Questions doğrulama ─────────────────────────────────────────────────
  if (!Array.isArray(p.questions) || p.questions.length === 0) {
    errors.push({ code: "MISSING_QUESTIONS", message: "Pack 'questions' dizisi eksik veya boş." });
    if (errors.length > 0) return { valid: false, errors };
  }

  const questions = p.questions as Record<string, unknown>[];
  const questionIds = new Set<string>();
  const questionIdList: string[] = [];

  for (const q of questions) {
    const qId = typeof q.id === "string" ? q.id : "(id yok)";

    // Duplicate ID
    if (typeof q.id === "string") {
      if (questionIds.has(q.id)) {
        errors.push({ code: "DUPLICATE_QUESTION_ID", message: `Tekrarlayan soru id: ${q.id}`, questionId: q.id });
      }
      questionIds.add(q.id);
      questionIdList.push(q.id);
    } else {
      errors.push({ code: "MISSING_QUESTION_ID", message: "Bir soruda 'id' alanı eksik." });
    }

    // answer_type
    if (!VALID_ANSWER_TYPES.has(q.answer_type as string)) {
      errors.push({ code: "INVALID_ANSWER_TYPE", message: `Geçersiz answer_type: "${q.answer_type}"`, questionId: qId });
    }

    // criticality
    if (!VALID_CRITICALITIES.has(q.criticality as string)) {
      errors.push({ code: "INVALID_CRITICALITY", message: `Geçersiz criticality: "${q.criticality}"`, questionId: qId });
    }

    // Options zorunluluğu
    const isChoice = q.answer_type === "single_choice" || q.answer_type === "multiple_choice";
    if (isChoice) {
      if (!Array.isArray(q.options) || (q.options as unknown[]).length === 0) {
        errors.push({ code: "MISSING_OPTIONS", message: "Choice soru options dizisi eksik veya boş.", questionId: qId });
      } else {
        const options = q.options as Record<string, unknown>[];
        const optionValues = new Set<string>();

        let otherCount = 0;
        for (const opt of options) {
          const val = typeof opt.value === "string" ? opt.value : "(value yok)";

          // Duplicate option value
          if (typeof opt.value === "string") {
            if (optionValues.has(opt.value)) {
              errors.push({ code: "DUPLICATE_OPTION_VALUE", message: `Tekrarlayan option value: "${opt.value}"`, questionId: qId });
            }
            optionValues.add(opt.value);
          } else {
            errors.push({ code: "MISSING_OPTION_VALUE", message: `Option value eksik (label: "${opt.label}")`, questionId: qId });
          }

          // is_other → allow_note zorunlu
          if (opt.is_other === true && opt.allow_note !== true) {
            errors.push({ code: "OTHER_WITHOUT_NOTE", message: `is_other=true olan "${val}" seçeneğinde allow_note=true olmalı.`, questionId: qId });
          }

          if (opt.is_other === true) otherCount++;
        }

        // Birden fazla is_other
        if (otherCount > 1) {
          errors.push({ code: "MULTIPLE_OTHER", message: "Bir soruda birden fazla is_other=true seçeneği olamaz.", questionId: qId });
        }
      }
    }

    // Condition doğrulama
    if (q.condition && typeof q.condition === "object") {
      const cond = q.condition as Record<string, unknown>;
      if (!VALID_OPERATORS.has(cond.operator as string)) {
        errors.push({ code: "INVALID_CONDITION_OPERATOR", message: `Geçersiz condition operator: "${cond.operator}"`, questionId: qId });
      }
      // Referans edilen question_id var mı? (İlk pass'ta bilinmiyor, ikinci pass'ta kontrol et)
    }
  }

  // ── Condition referans kontrolü (ikinci pass) ───────────────────────────
  for (const q of questions) {
    if (q.condition && typeof q.condition === "object") {
      const cond = q.condition as Record<string, unknown>;
      if (typeof cond.question_id === "string" && !questionIds.has(cond.question_id)) {
        errors.push({
          code: "DANGLING_CONDITION_REFERENCE",
          message: `Condition'da referans edilen "${cond.question_id}" sorusu bulunamadı.`,
          questionId: typeof q.id === "string" ? q.id : undefined,
        });
      }
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
