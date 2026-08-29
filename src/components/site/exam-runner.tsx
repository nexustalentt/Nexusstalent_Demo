import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { formatDuration, questionTypeLabel } from "@/lib/exam-utils";
import { letterLabel } from "@/lib/question-bank-parser";
import { getAttemptState, saveExamAnswer, submitExamAttempt } from "@/lib/exams.functions";

export type StoredAnswer = { selected?: number[]; text?: string } | null;

export const fieldClass =
  "w-full rounded-lg border border-primary/10 bg-card px-4 py-2.5 text-sm outline-none focus:border-accent";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-xl rounded-2xl border border-primary/5 bg-card p-8">{children}</div>
    </main>
  );
}

export function ExamRunner({
  sessionToken,
  onSessionInvalid,
}: {
  sessionToken: string;
  onSessionInvalid: () => void;
}) {
  const state = useQuery({
    queryKey: ["exam-attempt", sessionToken],
    queryFn: () => getAttemptState({ data: { sessionToken } }),
    refetchOnWindowFocus: false,
  });

  const [answers, setAnswers] = useState<Record<string, StoredAnswer>>({});
  const [current, setCurrent] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const hydrated = useRef(false);
  const autoSubmitted = useRef(false);

  useEffect(() => {
    if (state.data && !hydrated.current) {
      setAnswers(state.data.answers);
      setSeconds(state.data.secondsRemaining);
      hydrated.current = true;
    }
  }, [state.data]);

  const saveMutation = useMutation({
    mutationFn: (input: { questionId: string; answer: StoredAnswer }) =>
      saveExamAnswer({ data: { sessionToken, ...input } }),
  });

  const submitMutation = useMutation({
    mutationFn: () => submitExamAttempt({ data: { sessionToken } }),
    onSuccess: () => state.refetch(),
  });

  const submit = useCallback(() => {
    if (autoSubmitted.current) return;
    autoSubmitted.current = true;
    submitMutation.mutate();
  }, [submitMutation]);

  const submitted = state.data && state.data.status !== "in_progress";

  useEffect(() => {
    if (!state.data || submitted) return;
    const interval = window.setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          submit();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [state.data, submitted, submit]);

  if (state.isLoading) return <Shell>Loading your exam…</Shell>;

  if (state.isError) {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-primary">Session expired</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please sign in again to continue.</p>
        <button
          type="button"
          onClick={onSessionInvalid}
          className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent"
        >
          Back to login
        </button>
      </Shell>
    );
  }

  if (!state.data) return <Shell>Loading…</Shell>;

  if (submitted) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-primary">Exam submitted successfully</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Thank you for completing the exam. Your responses have been recorded and the recruitment
          team will be in touch.
        </p>
      </Shell>
    );
  }

  const questions = state.data.questions;
  const question = questions[current];
  const answered = questions.filter((item) => {
    const value = answers[item.id];
    return Boolean(value && ((value.selected?.length ?? 0) > 0 || (value.text ?? "").trim()));
  }).length;

  function update(questionId: string, answer: StoredAnswer) {
    setAnswers((current2) => ({ ...current2, [questionId]: answer }));
    saveMutation.mutate({ questionId, answer });
  }

  return (
    <main className="min-h-screen bg-surface p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/5 bg-card p-6">
          <div>
            <h1 className="text-xl font-bold text-primary">{state.data.exam.title}</h1>
            <p className="text-sm text-muted-foreground">
              Answered {answered} of {questions.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Time remaining
            </p>
            <p className="text-2xl font-bold text-primary">{formatDuration(seconds)}</p>
          </div>
        </header>

        {state.data.exam.instructions ? (
          <details className="rounded-2xl border border-primary/5 bg-card p-5">
            <summary className="cursor-pointer text-sm font-bold text-primary">Instructions</summary>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
              {state.data.exam.instructions}
            </p>
          </details>
        ) : null}

        <div className="flex flex-wrap gap-2 rounded-2xl border border-primary/5 bg-card p-4">
          {questions.map((item, index) => {
            const value = answers[item.id];
            const done = Boolean(
              value && ((value.selected?.length ?? 0) > 0 || (value.text ?? "").trim()),
            );
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Go to question ${index + 1}`}
                className={`size-9 rounded-lg text-sm font-bold ${
                  index === current
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "bg-success/15 text-success"
                      : "bg-surface text-muted-foreground"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {question ? (
          <section className="space-y-5 rounded-2xl border border-primary/5 bg-card p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Question {current + 1} of {questions.length} ·{" "}
              {questionTypeLabel(question.question_type)} · {question.marks}{" "}
              {question.marks === 1 ? "mark" : "marks"}
            </p>
            <p className="text-lg font-semibold text-primary">
              Question {current + 1}. {question.prompt}
            </p>

            {question.question_type === "multiple_select" ? (
              <div className="space-y-2">
                {question.options.map((option, index) => {
                  const selected = answers[question.id]?.selected ?? [];
                  return (
                    <label key={index} className="flex items-center gap-3 rounded-lg bg-surface p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={selected.includes(index)}
                        onChange={() =>
                          update(question.id, {
                            selected: selected.includes(index)
                              ? selected.filter((value) => value !== index)
                              : [...selected, index].sort((a, b) => a - b),
                          })
                        }
                        className="size-4 accent-accent"
                      />
                      <span>
                        <span className="font-bold text-primary">{letterLabel(index)}.</span> {option}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : null}

            {question.question_type === "multiple_choice" || question.question_type === "true_false" ? (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <label key={index} className="flex items-center gap-3 rounded-lg bg-surface p-3 text-sm">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={(answers[question.id]?.selected ?? []).includes(index)}
                      onChange={() => update(question.id, { selected: [index] })}
                      className="size-4 accent-accent"
                    />
                    <span className="font-bold text-primary">{letterLabel(index)}.</span> {option}
                  </label>
                ))}
              </div>
            ) : null}

            {question.question_type === "short_answer" ? (
              <input
                value={answers[question.id]?.text ?? ""}
                maxLength={2000}
                onChange={(event) => update(question.id, { text: event.target.value })}
                className={fieldClass}
                placeholder="Your answer"
              />
            ) : null}

            {question.question_type === "long_answer" ? (
              <textarea
                rows={10}
                value={answers[question.id]?.text ?? ""}
                maxLength={20000}
                onChange={(event) => update(question.id, { text: event.target.value })}
                className={fieldClass}
                placeholder="Write your answer here"
              />
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={current === 0}
                onClick={() => setCurrent((value) => Math.max(0, value - 1))}
                className="rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground">
                {saveMutation.isPending ? "Saving…" : "Answers save automatically"}
              </span>
              <button
                type="button"
                disabled={current >= questions.length - 1}
                onClick={() => setCurrent((value) => Math.min(questions.length - 1, value + 1))}
                className="rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </section>
        ) : null}

        <section className="space-y-4 rounded-2xl border border-primary/5 bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Answered: {answered} / {questions.length} · Unanswered: {questions.length - answered}
          </p>
          {confirming ? (
            <div className="space-y-3">
              <p className="font-semibold text-primary">Are you sure you want to submit?</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitMutation.isPending}
                  onClick={submit}
                  className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent disabled:opacity-60"
                >
                  {submitMutation.isPending ? "Submitting…" : "Submit"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-accent"
            >
              Submit Exam
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
