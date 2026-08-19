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
