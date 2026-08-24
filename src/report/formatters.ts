/**
 * ERP CRM Discovery — Report Answer Formatters
 *
 * Converts raw JSON AnswerData into clean, human-readable representations.
 * Resolves option codes to localized labels and formats option-specific notes.
 */

import type { Question, AnswerData, QuestionOption } from "../engine/types";
import type { ReportFormattedAnswer, ReportOptionAnswer } from "./types";

export function formatAnswer(
  question: Question,
  rawAnswer: AnswerData | undefined | null
): ReportFormattedAnswer {
  if (!rawAnswer) {
    return {
      isAnswered: false,
      selectedOptions: [],
      summaryText: "Cevaplanmadı",
    };
  }

  const optionMap = new Map<string, QuestionOption>();
  if (question.options) {
    for (const opt of question.options) {
      optionMap.set(opt.value, opt);
    }
  }

  const selectedOptions: ReportOptionAnswer[] = [];
  const lines: string[] = [];

  // Choice answers
  if (Array.isArray(rawAnswer.selected) && rawAnswer.selected.length > 0) {
    for (const sel of rawAnswer.selected) {
      const optDef = optionMap.get(sel.value);
      const label = optDef ? optDef.label : sel.value;
      const isOther = optDef?.is_other || sel.value === "other" || sel.value === "diger";
      const note = sel.note?.trim() || undefined;

      selectedOptions.push({
        value: sel.value,
        label,
        isOther,
        note,
      });

      let line = `• ${label}`;
      if (note) {
        line += ` — Açıklama: ${note}`;
      }
      lines.push(line);
    }
  }

  // Text answer
  let textValue: string | undefined;
  if (typeof rawAnswer.text === "string" && rawAnswer.text.trim().length > 0) {
    textValue = rawAnswer.text.trim();
    lines.push(textValue);
  }

  // General note
  let generalNote: string | undefined;
  if (typeof rawAnswer.general_note === "string" && rawAnswer.general_note.trim().length > 0) {
    generalNote = rawAnswer.general_note.trim();
    lines.push(`(Genel Not: ${generalNote})`);
  }

  const isAnswered =
    selectedOptions.length > 0 ||
    textValue !== undefined ||
    generalNote !== undefined;

  const summaryText = isAnswered ? lines.join("\n") : "Cevaplanmadı";

  return {
    isAnswered,
    selectedOptions,
    textValue,
    generalNote,
    summaryText,
  };
}

/**
 * Bir AnswerData nesnesinin geçerli bir cevaba sahip olup olmadığını denetler.
 * Kurallar (FAZ-58.3):
 * - selected dizisinde en az bir geçerli { value } kaydı
 * - veya boş olmayan text
 * - veya boş olmayan general_note
 * Geçersiz sayılanlar: null/undefined, {}, selected: [], boş text/general_note
 */
export function isValidAnswer(rawAnswer: unknown): boolean {
  if (!rawAnswer || typeof rawAnswer !== "object") return false;
  const ans = rawAnswer as AnswerData;

  if (Array.isArray(ans.selected)) {
    const hasValidSelection = ans.selected.some(
      (s) => s && typeof s === "object" && typeof s.value === "string" && s.value.trim().length > 0
    );
    if (hasValidSelection) return true;
  }

  if (typeof ans.text === "string" && ans.text.trim().length > 0) {
    return true;
  }

  if (typeof ans.general_note === "string" && ans.general_note.trim().length > 0) {
    return true;
  }

  return false;
}

/**
 * Çalışan sayısı enum veya ham string değerini kullanıcı dostu formata dönüştürür.
 * Örn: "251_500" -> "251–500", "251-500" -> "251–500", "1_20" -> "1–20", "1000+" -> "1000+"
 */
export function formatEmployeeCount(val?: string | null): string {
  if (!val) return "";
  const trimmed = val.trim();
  const map: Record<string, string> = {
    "1_20": "1–20",
    "1-20": "1–20",
    "21_50": "21–50",
    "21-50": "21–50",
    "51_250": "51–250",
    "51-250": "51–250",
    "251_500": "251–500",
    "251-500": "251–500",
    "251_1000": "251–1000",
    "251-1000": "251–1000",
    "501_1000": "501–1000",
    "501-1000": "501–1000",
    "1000+": "1000+",
    "1000_plus": "1000+",
  };
  if (map[trimmed]) return map[trimmed];
  return trimmed.replace(/(\d+)_(\d+)/g, "$1–$2");
}

/**
 * Proje durumu enum değerini kullanıcı dostu Türkçe etikete dönüştürür.
 * Örn: "active" -> "Aktif", "passive" -> "Pasif", "draft" -> "Taslak"
 */
export function formatProjectStatus(status?: string | null): string {
  if (!status) return "Aktif";
  const s = status.toLowerCase().trim();
  switch (s) {
    case "active":
      return "Aktif";
    case "passive":
    case "inactive":
      return "Pasif";
    case "draft":
      return "Taslak";
    case "completed":
      return "Tamamlandı";
    case "in_progress":
      return "Devam Ediyor";
    case "not_started":
      return "Başlanmadı";
    default:
      return status;
  }
}

/**
 * Sayılara uygun Türkçe belirtme / ayrılma eki üretir.
 * Örn: 9 -> "u" (9'u / 9’u), 1 -> "i" (1'i), 2 -> "si" (2'si), 3/4 -> "ü" (3'ü, 4'ü)
 */
export function getTurkishAccusativeSuffix(num: number): string {
  const n = Math.abs(num);
  const lastDigit = n % 10;
  const tens = Math.floor(n / 10) % 10;

  if (lastDigit === 0 && n > 0) {
    if (n % 100 === 0) return "ü";
    if (tens === 1 || tens === 3) return "u";
    if (tens === 4 || tens === 6 || tens === 9) return "ı";
    if (tens === 2 || tens === 5 || tens === 7) return "si";
    if (tens === 8) return "i";
  }

  switch (lastDigit) {
    case 1: return "i";
    case 2: return "si";
    case 3: return "ü";
    case 4: return "ü";
    case 5: return "i";
    case 6: return "sı";
    case 7: return "si";
    case 8: return "i";
    case 9: return "u";
    case 0: return "ı";
    default: return "i";
  }
}
