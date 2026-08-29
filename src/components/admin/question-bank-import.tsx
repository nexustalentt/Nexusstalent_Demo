import { useMemo, useState } from "react";
import { AlertTriangle, ClipboardPaste } from "lucide-react";
import { letterLabel, parseQuestionBank, type ParsedQuestion } from "@/lib/question-bank-parser";
import { examSections, groupBySection } from "@/lib/exam-utils";

const fieldClass =
  "w-full rounded-lg border border-primary/10 bg-card px-4 py-2.5 text-sm outline-none focus:border-accent";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground";

const sample = `Section: English
Question 1. What is 25% of 200?
A. 25
B. 40
C. 50
D. 75
Answer: C

Question 2. A train covers 60 km in 1.5 hours. How far in 30 minutes?
A. 20 km
B. 30 km
C. 40 km
D. 50 km
Answer: A

Section: Logical Reasoning
Question 3. Which number completes the series 2, 4, 8, 16, __?
A. 20
B. 24
C. 32
D. 64
Answer: C`;

export function QuestionBankImport({
  pending,
  existingCount,
  onImport,
}: {
  pending?: boolean;
  existingCount: number;
  onImport: (questions: ParsedQuestion[], mode: "append" | "replace") => void;
}) {
  const [text, setText] = useState("");
  const [marks, setMarks] = useState(1);
  const [defaultSection, setDefaultSection] = useState<string>(examSections[0]);

  const result = useMemo(
    () => parseQuestionBank(text, Number(marks) || 1, defaultSection),
    [text, marks, defaultSection],
  );
  const groups = useMemo(() => groupBySection(result.questions), [result.questions]);
  const hasInput = text.trim().length > 0;
  const canSave = hasInput && result.errors.length === 0 && result.questions.length > 0;

  return (
    <section className="space-y-5 rounded-2xl border border-primary/5 bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
          <ClipboardPaste className="size-4" aria-hidden="true" /> Paste question bank
        </h2>
        <button
          type="button"
          onClick={() => setText(sample)}
          className="text-xs font-bold uppercase tracking-wider text-accent"
        >
          Insert sample format
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        Paste the whole paper at once. Options are lettered A, B, C, D and each question ends with{" "}
        <span className="font-semibold text-primary">Answer: C</span> — or list every answer under an{" "}
        <span className="font-semibold text-primary">Answers</span> heading at the end (1 - C, 2 - A).
      </p>

      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <div>
          <label className={labelClass} htmlFor="question-bank">
            Question bank
          </label>
          <textarea
            id="question-bank"
            rows={12}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={sample}
            className={`${fieldClass} font-mono`}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="bank-marks">
            Marks / question
          </label>
          <input
            id="bank-marks"
            type="number"
            min={0}
            step="0.5"
            value={marks}
            onChange={(event) => setMarks(Number(event.target.value))}
            className={fieldClass}
          />
          <label className={`${labelClass} mt-4`} htmlFor="bank-section">
            Section
          </label>
          <input
            id="bank-section"
            list="bank-section-options"
            value={defaultSection}
            maxLength={80}
            onChange={(event) => setDefaultSection(event.target.value)}
            className={fieldClass}
          />
          <datalist id="bank-section-options">
            {examSections.map((section) => (
              <option key={section} value={section} />
            ))}
          </datalist>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Used until a <span className="font-semibold">Section: name</span> line appears in the
            pasted text.
          </p>
        </div>
      </div>

      {hasInput && result.errors.length > 0 ? (
        <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-destructive">
            <AlertTriangle className="size-4" aria-hidden="true" /> Fix these before saving
          </p>
          <ul className="space-y-1 text-sm text-destructive">
            {result.errors.map((error, index) => (
              <li key={index}>• {error.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.questions.length > 0 ? (
        <div className="space-y-4 rounded-lg bg-surface p-5">
          <p className={labelClass}>Generated paper preview ({result.questions.length} questions)</p>
          {groups.map((group) => (
            <div key={group.name} className="space-y-3">
              <p className="text-sm font-bold text-primary">
                {group.name} · {group.items.length} questions
              </p>
              <ol className="space-y-4">
                {group.items.map((question) => (
                  <li key={`${group.name}-${question.number}`}>
                    <p className="font-semibold text-primary">
                      Question {question.number}. {question.prompt}
                    </p>
                    <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                      {question.options.map((option, index) => (
                        <li key={index}>
                          {letterLabel(index)}. {option}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          ))}
          <div>
            <p className={labelClass}>Answer key (admin only)</p>
            <p className="text-sm font-semibold text-primary">
              {result.questions
                .map(
                  (question) =>
                    `${question.number} → ${question.correct_options.map(letterLabel).join("/")}`,
                )
                .join("   ")}
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!canSave || pending}
          onClick={() => onImport(result.questions, "append")}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Saving…" : `Add ${result.questions.length || ""} questions to exam`.trim()}
        </button>
        <button
          type="button"
          disabled={!canSave || pending}
          onClick={() => {
            if (
              existingCount === 0 ||
              window.confirm(`Replace all ${existingCount} existing questions with this paper?`)
            ) {
              onImport(result.questions, "replace");
            }
          }}
          className="rounded-full border border-primary/10 px-6 py-2.5 text-sm font-semibold text-primary hover:border-destructive hover:text-destructive disabled:opacity-50"
        >
          Replace all questions
        </button>
        {hasInput ? (
          <button
            type="button"
            onClick={() => setText("")}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            Clear
          </button>
        ) : null}
      </div>
    </section>
  );
}
