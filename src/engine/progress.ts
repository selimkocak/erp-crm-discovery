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
 * Bir sorunun gerçek bir kullanıcı cevabına sahip olup olmadığını denetler (bayraklardan bağımsız).
 * Visited ≠ Answered: Bir soru salt görüntülendi diye veya sadece genel not/ek/bayrak içeriyor diye
 * cevaplanmış sayılamaz.
 */
export function hasProvidedAnswer(
  question: Question,
  answerData: AnswerData | undefined
): boolean {
  if (!answerData) return false;
  const { answer_type } = question;

  if (
    answer_type === "single_choice" ||
    answer_type === "multiple_choice" ||
    answer_type === "yes_no"
  ) {
    const selected = answerData.selected ?? [];
    const validSelected = selected.filter(
      (s) => s && typeof s.value === "string" && s.value.trim().length > 0
    );
    if (validSelected.length === 0) return false;

    // "Diğer" (is_other) seçilmişse note alanı zorunludur
    const hasOtherOption = (question.options ?? []).some((o) => o.is_other);
    if (hasOtherOption) {
      const otherSelected = validSelected.find((s) => {
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
 * Bir sorunun cevaplanmış sayılıp sayılmadığını döndürür.
 * Kural: Visited ≠ Answered.
 * Soru ister zorunlu ister opsiyonel olsun:
 * 1. 🟡 Sonra Dön veya 🔴 Kritik Takip bayrağı açık olan sorular "cevaplanmış" SAYILMAZ.
 * 2. Yalnızca veritabanında/state'de geçerli bir cevap varsa "cevaplanmış" sayılır.
 */
export function isQuestionAnswered(
  question: Question,
  answerData: AnswerData | undefined,
  followup?: { flag_type?: string; status?: string } | null
): boolean {
  if (followup && (!followup.status || followup.status === "open")) {
    return false;
  }

  return hasProvidedAnswer(question, answerData);
}

/**
 * Kullanıcının "Sonraki" butonuyla ilerleyip ilerleyemeyeceğini döndürür (Navigasyon kuralı).
 * - Soru cevaplanmışsa -> İzin ver
 * - Soru opsiyonelse -> İzin ver
 * - Soru cevapsız ama aktif 🟡 Sonra Dön veya 🔴 Kritik Takip bayrağı varsa -> İzin ver
 * - Soru zorunlu, cevapsız ve bayraksızsa -> İzin verme
 */
export function canAdvanceToNextQuestion(
  question: Question,
  answerData: AnswerData | undefined,
  followup?: { flag_type?: string; status?: string } | null
): boolean {
  if (!question.required) return true;
  if (hasProvidedAnswer(question, answerData)) return true;
  if (
    followup &&
    (!followup.status || followup.status === "open") &&
    (followup.flag_type === "revisit" || followup.flag_type === "critical")
  ) {
    return true;
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
