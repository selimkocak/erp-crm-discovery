/**
 * ERP CRM Discovery — Conditional Branching Engine
 *
 * Soru görünürlüğünü mevcut cevaplara göre hesaplar.
 * Operatörler: equals, not_equals, contains
 */

import type { Question, AnswerData } from "./types";

/**
 * Bir sorunun koşulunun mevcut cevaplara göre sağlanıp sağlanmadığını döndürür.
 * Koşul yoksa soru her zaman görünür.
 */
export function isQuestionVisible(
  question: Question,
  answers: Map<string, AnswerData>
): boolean {
  if (!question.condition) return true;

  const { question_id, operator, value } = question.condition;
  const answer = answers.get(question_id);

  if (!answer) {
    // Referans edilen soru cevaplanmamış → görünmez (equals/contains için false)
    // not_equals için: cevap yok ise değer eşit değil → görünür
    return operator === "not_equals";
  }

  // Seçilmiş değerleri topla
  const selectedValues = (answer.selected ?? []).map((s) => s.value);
  const textValue = answer.text ?? "";

  switch (operator) {
    case "equals":
      return selectedValues.includes(value) || textValue === value;

    case "not_equals":
      return !selectedValues.includes(value) && textValue !== value;

    case "contains":
      // multiple_choice: seçilmiş değerler içinde value var mı?
      return selectedValues.includes(value);

    default:
      return true;
  }
}

/**
 * Tüm soru listesinden görünür olanları filtreler.
 * Sıralı döndürür (order alanına göre).
 */
export function getVisibleQuestions(
  questions: Question[],
  answers: Map<string, AnswerData>
): Question[] {
  return questions
    .filter((q) => isQuestionVisible(q, answers))
    .sort((a, b) => a.order - b.order);
}
