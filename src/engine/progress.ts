/**
 * ERP CRM Discovery — Progress Engine
 *
 * Görünür ve zorunlu sorular üzerinden ilerleme hesaplar.
 * Cevaplanmış kabul kuralları:
 *   - single/multiple_choice: en az bir seçenek seçilmiş
 *   - other seçilmişse: note boş değil
 *   - short_text/long_text/number: text boş değil
 *   - required=false sorular her zaman "tamamlanmış" sayılır
 */

import type { Question, AnswerData, ProgressResult } from "./types";

/**
 * Bir sorunun cevaplanmış sayılıp sayılmadığını döndürür.
 * 🟡 Sonra Dön veya 🔴 Kritik Takip bayrağı açık olan sorular "cevaplanmış" SAYILMAZ.
 */
export function isQuestionAnswered(
  question: Question,
  answerData: AnswerData | undefined,
  followup?: { flag_type?: string; status?: string } | null
): boolean {
  if (followup && (!followup.status || followup.status === "open")) {
    return false;
  }

  if (!question.required) return true;
  if (!answerData) return false;

  const { answer_type } = question;

  if (answer_type === "single_choice" || answer_type === "multiple_choice" || answer_type === "yes_no") {
    const selected = answerData.selected ?? [];
    if (selected.length === 0) return false;

    // other seçilmişse note zorunlu
    const hasOtherOption = (question.options ?? []).some((o) => o.is_other);
    if (hasOtherOption) {
      const otherSelected = selected.find((s) => {
        const opt = (question.options ?? []).find((o) => o.value === s.value);
        return opt?.is_other === true;
      });
      if (otherSelected && (!otherSelected.note || otherSelected.note.trim() === "")) {
        return false; // other seçildi ama note boş → tamamlanmamış
      }
    }

    return true;
  }

  if (
    answer_type === "short_text" ||
    answer_type === "long_text" ||
    answer_type === "text" ||
    answer_type === "textarea" ||
    answer_type === "number"
  ) {
    return (answerData.text ?? "").trim().length > 0;
  }

  return false;
}

/**
 * Görünür + zorunlu sorular üzerinden ilerleme hesaplar.
 * visibleQuestions: branching engine'den gelen filtrelenmiş soru listesi.
 */
export function calculateProgress(
  visibleQuestions: Question[],
  answers: Map<string, AnswerData>,
  followups?: Map<string, { flag_type?: string; status?: string }>
): ProgressResult {
  const requiredVisible = visibleQuestions.filter((q) => q.required);
  const total = requiredVisible.length;

  if (total === 0) {
    return { answered: 0, total: 0, percentage: 100 };
  }

  const answered = requiredVisible.filter((q) =>
    isQuestionAnswered(q, answers.get(q.id), followups?.get(q.id))
  ).length;

  const percentage = Math.round((answered / total) * 100);
  return { answered, total, percentage };
}

/**
 * Tamamlanan yüzdeye göre FunctionStatus döndürür.
 */
export function progressToStatus(
  answered: number,
  total: number
): "not_started" | "in_progress" | "completed" {
  if (answered === 0) return "not_started";
  if (answered >= total && total > 0) return "completed";
  return "in_progress";
}
