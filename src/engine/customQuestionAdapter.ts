/**
 * ERP CRM Discovery — Custom Question Adapter
 *
 * Converts ProjectCustomQuestion DB records into unified runtime Question objects.
 * Preserves process grouping, options, required constraints, and marks questions with is_custom: true.
 */

import type { Question, QuestionOption, AnswerType } from "./types";
import type { ProjectCustomQuestion } from "../types";

export function adaptCustomQuestionToQuestion(
  cq: ProjectCustomQuestion,
  orderIndex: number
): Question {
  let answerType: AnswerType = "single_choice";
  if (cq.question_type === "multiple_choice") answerType = "multiple_choice";
  else if (cq.question_type === "yes_no") answerType = "yes_no";
  else if (cq.question_type === "text" || (cq.question_type as string) === "short_text") answerType = "short_text";
  else if (cq.question_type === "textarea" || (cq.question_type as string) === "long_text") answerType = "long_text";
  else if (cq.question_type === "number") answerType = "number";

  let options: QuestionOption[] | undefined = undefined;

  if (cq.question_type === "yes_no") {
    options = [
      { value: "yes", label: "Evet", allow_note: true, is_other: false },
      { value: "no", label: "Hayır", allow_note: true, is_other: false },
    ];
  } else if (cq.options && cq.options.length > 0) {
    options = cq.options.map((opt) => ({
      value: opt.value,
      label: opt.label,
      allow_note: true,
      is_other: opt.is_other === 1,
    }));
  }

  return {
    id: cq.id,
    process: cq.process_name || "Özel Süreç Soruları",
    order: orderIndex,
    question: cq.question_text,
    description: cq.description || undefined,
    answer_type: answerType,
    required: cq.is_required === 1,
    criticality: "medium",
    options,
    is_custom: true,
    custom_question_id: cq.id,
  };
}
