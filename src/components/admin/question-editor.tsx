import { useState } from "react";
import { Plus, X } from "lucide-react";
import { questionSchema } from "@/lib/exam-schemas";
import { questionTypes, type QuestionType } from "@/lib/exam-utils";
import type { ExamQuestionRow } from "@/lib/exams-api";

export type QuestionDraft = {
  question_type: QuestionType;
  prompt: string;
  options: string[];
  correct_options: number[];
  expected_answer: string;
  marks: number;
};

const fieldClass =
  "w-full rounded-lg border border-primary/10 bg-card px-4 py-2.5 text-sm outline-none focus:border-accent";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground";

function draftFromRow(row?: ExamQuestionRow | null): QuestionDraft {
  if (!row) {
    return {
      question_type: "multiple_choice",
      prompt: "",
      options: ["", "", "", ""],
      correct_options: [],
      expected_answer: "",
      marks: 1,
    };
  }
  return {
    question_type: row.question_type as QuestionType,
    prompt: row.prompt,
    options: Array.isArray(row.options) ? (row.options as string[]) : [],
    correct_options: Array.isArray(row.correct_options)
      ? (row.correct_options as number[]).map(Number)
      : [],
    expected_answer: row.expected_answer ?? "",
    marks: Number(row.marks) || 0,
  };
}

export function QuestionEditor({
  question,
  pending,
  onCancel,
  onSave,
}: {
  question?: ExamQuestionRow | null;
  pending?: boolean;
  onCancel: () => void;
  onSave: (draft: QuestionDraft) => void;
}) {
  const [draft, setDraft] = useState<QuestionDraft>(() => draftFromRow(question));
  const [error, setError] = useState<string | null>(null);

  const usesOptions =
    draft.question_type === "multiple_choice" ||
    draft.question_type === "multiple_select" ||
    draft.question_type === "true_false";

  function changeType(type: QuestionType) {
    setDraft((current) => ({
      ...current,
      question_type: type,
      options:
        type === "true_false"
          ? ["True", "False"]
          : type === "multiple_choice" || type === "multiple_select"
            ? current.options.length >= 2
              ? current.options
              : ["", "", "", ""]
            : [],
      correct_options: [],
    }));
  }

  function toggleCorrect(index: number) {
    setDraft((current) => {
      if (current.question_type === "multiple_select") {
        const exists = current.correct_options.includes(index);
        return {
          ...current,
          correct_options: exists
            ? current.correct_options.filter((value) => value !== index)
            : [...current.correct_options, index].sort((a, b) => a - b),
        };
      }
      return { ...current, correct_options: [index] };
    });
  }

  function submit() {
    const cleanedOptions = usesOptions
      ? draft.options.map((option) => option.trim()).filter((option) => option.length > 0)
      : [];
    const payload = {
      ...draft,
      options: cleanedOptions,
      correct_options: draft.correct_options.filter((index) => index < cleanedOptions.length),
    };
    const parsed = questionSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the question details");
      return;
    }
    setError(null);
    onSave(payload);
  }

  return (
    <div className="space-y-5 rounded-2xl border border-accent/30 bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="question-type">
            Question type
          </label>
          <select
            id="question-type"
            value={draft.question_type}
            onChange={(event) => changeType(event.target.value as QuestionType)}
            className={fieldClass}
          >
            {questionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} — {type.hint}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="question-marks">
            Marks
          </label>
          <input
            id="question-marks"
            type="number"
            min={0}
            step="0.5"
            value={draft.marks}
            onChange={(event) => setDraft({ ...draft, marks: Number(event.target.value) })}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="question-prompt">
          Question
        </label>
        <textarea
          id="question-prompt"
          rows={3}
          value={draft.prompt}
          onChange={(event) => setDraft({ ...draft, prompt: event.target.value })}
          className={fieldClass}
          placeholder="What is 15 × 4?"
        />
      </div>

      {usesOptions ? (
        <div className="space-y-3">
          <p className={labelClass}>
            Options —{" "}
            {draft.question_type === "multiple_select"
              ? "tick every correct answer"
              : "tick the correct answer"}
          </p>
          {draft.options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type={draft.question_type === "multiple_select" ? "checkbox" : "radio"}
                name="correct-option"
                checked={draft.correct_options.includes(index)}
                onChange={() => toggleCorrect(index)}
                aria-label={`Mark option ${index + 1} correct`}
                className="size-4 accent-accent"
              />
              <input
                value={option}
                maxLength={500}
                readOnly={draft.question_type === "true_false"}
                onChange={(event) => {
                  const options = [...draft.options];
                  options[index] = event.target.value;
                  setDraft({ ...draft, options });
                }}
                placeholder={`Option ${index + 1}`}
                className={fieldClass}
              />
              {draft.question_type !== "true_false" && draft.options.length > 2 ? (
                <button
                  type="button"
                  aria-label={`Remove option ${index + 1}`}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      options: draft.options.filter((_, i) => i !== index),
                      correct_options: draft.correct_options
                        .filter((value) => value !== index)
                        .map((value) => (value > index ? value - 1 : value)),
                    })
                  }
                  className="rounded-lg border border-primary/10 p-2 text-muted-foreground hover:border-destructive hover:text-destructive"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ))}
          {draft.question_type !== "true_false" ? (
            <button
              type="button"
              onClick={() => setDraft({ ...draft, options: [...draft.options, ""] })}
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent"
            >
              <Plus className="size-4" aria-hidden="true" /> Add option
            </button>
          ) : null}
        </div>
      ) : null}

      {draft.question_type === "short_answer" ? (
        <div>
          <label className={labelClass} htmlFor="expected-answer">
            Expected answer (separate accepted answers with |)
          </label>
          <input
            id="expected-answer"
            value={draft.expected_answer}
            onChange={(event) => setDraft({ ...draft, expected_answer: event.target.value })}
            className={fieldClass}
            placeholder="Paris"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Leave blank to grade this question manually.
          </p>
        </div>
      ) : null}

      {draft.question_type === "long_answer" ? (
        <p className="rounded-lg bg-surface p-4 text-xs text-muted-foreground">
          Long answers are typed into a large text area by the candidate and evaluated manually from
          the submission view.
        </p>
      ) : null}

      {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save question"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-primary/10 px-6 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
