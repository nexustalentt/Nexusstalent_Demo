export type QuestionType =
  | "multiple_choice"
  | "multiple_select"
  | "true_false"
  | "short_answer"
  | "long_answer";

export const questionTypes: { value: QuestionType; label: string; hint: string }[] = [
  { value: "multiple_choice", label: "Multiple Choice", hint: "One correct option" },
  { value: "multiple_select", label: "Multiple Select", hint: "Several correct options" },
  { value: "true_false", label: "True / False", hint: "Two fixed options" },
  { value: "short_answer", label: "Short Answer", hint: "Auto-matched, admin can override" },
  { value: "long_answer", label: "Long Answer", hint: "Manually evaluated" },
];

export function questionTypeLabel(type: string) {
  return questionTypes.find((item) => item.value === type)?.label ?? type;
}

export const autoGradedTypes: QuestionType[] = [
  "multiple_choice",
  "multiple_select",
  "true_false",
  "short_answer",
];

export function isAutoGraded(type: string) {
  return autoGradedTypes.includes(type as QuestionType);
}

export type ExamStatus = "draft" | "published" | "closed";

export const examStatusLabels: Record<string, string> = {
  draft: "Draft",
  published: "Active",
  closed: "Closed",
};

export const attemptStatusLabels: Record<string, string> = {
  in_progress: "In progress",
  submitted: "Submitted",
  pending_review: "Pending review",
  evaluated: "Completed",
};

export function formatDuration(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function optionLabel(index: number) {
  return `Option ${index + 1}`;
}
