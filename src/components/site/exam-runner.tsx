import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { formatDuration, groupBySection, normalizeSection, questionTypeLabel } from "@/lib/exam-utils";
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

function isAnswered(value: StoredAnswer) {
  return Boolean(value && ((value.selected?.length ?? 0) > 0 || (value.text ?? "").trim()));
}

type Status = "answered" | "not_answered" | "review" | "answered_review";

const statusClass: Record<Status, string> = {
  answered: "bg-success text-success-foreground",
  not_answered: "bg-surface text-muted-foreground border border-primary/10",
  review: "bg-warning text-warning-foreground",
  answered_review: "bg-accent text-accent-foreground",
};

const legend: { status: Status; label: string }[] = [
  { status: "answered", label: "Answered" },
  { status: "not_answered", label: "Not answered" },
  { status: "review", label: "Marked for review" },
  { status: "answered_review", label: "Answered & marked" },
];

export function ExamRunner({
  sessionToken,
  onSessionInvalid,
  onSubmitted,
}: {
  sessionToken: string;
  onSessionInvalid: () => void;
  onSubmitted?: () => void;
}) {
  const state = useQuery({
    queryKey: ["exam-attempt", sessionToken],
    queryFn: () => getAttemptState({ data: { sessionToken } }),
    refetchOnWindowFocus: false,
  });

  const [answers, setAnswers] = useState<Record<string, StoredAnswer>>({});
  const [review, setReview] = useState<Record<string, boolean>>({});
  const [current, setCurrent] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const hydrated = useRef(false);
  const autoSubmitted = useRef(false);

  useEffect(() => {
    if (state.data && !hydrated.current) {
      setAnswers(state.data.answers);
      setReview(
        Object.fromEntries((state.data.reviewFlags ?? []).map((id: string) => [id, true])),
      );
      setSeconds(state.data.secondsRemaining);
      hydrated.current = true;
    }
  }, [state.data]);

  const saveMutation = useMutation({
    mutationFn: (input: {
      questionId: string;
      answer?: StoredAnswer;
      markedForReview?: boolean;
    }) => saveExamAnswer({ data: { sessionToken, ...input } }),
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

  const questions = state.data?.questions ?? [];
  const sections = useMemo(() => groupBySection(questions), [questions]);

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
          team will be in touch. This exam cannot be taken again with the same credentials.
        </p>
        <button
          type="button"
          onClick={onSessionInvalid}
          className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent"
        >
          Exit exam
        </button>
      </Shell>

    );
  }

  const question = questions[current];
  const answeredCount = questions.filter((item) => isAnswered(answers[item.id] ?? null)).length;
  const reviewCount = questions.filter((item) => review[item.id]).length;
  const notAnswered = questions.length - answeredCount;

  function statusOf(questionId: string): Status {
    const answered = isAnswered(answers[questionId] ?? null);
    const marked = Boolean(review[questionId]);
    if (answered && marked) return "answered_review";
    if (marked) return "review";
    return answered ? "answered" : "not_answered";
  }

  function update(questionId: string, answer: StoredAnswer) {
    setAnswers((existing) => ({ ...existing, [questionId]: answer }));
    saveMutation.mutate({ questionId, answer });
  }

  function toggleReview(questionId: string) {
    const next = !review[questionId];
    setReview((existing) => ({ ...existing, [questionId]: next }));
    saveMutation.mutate({ questionId, markedForReview: next });
  }

  const currentSection = question ? normalizeSection(question.section) : "";
  const sectionOfCurrent = sections.find((group) => group.name === currentSection);
  const indexInSection = sectionOfCurrent
    ? sectionOfCurrent.items.findIndex((item) => item.id === question?.id) + 1
    : 0;

  const navPanel = (
    <div className="space-y-5">
      <div className="space-y-2 rounded-2xl border border-primary/5 bg-card p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Question status
        </p>
        <ul className="space-y-1.5 text-sm">
          {legend.map((item) => (
            <li key={item.status} className="flex items-center gap-2">
              <span className={`size-4 rounded ${statusClass[item.status]}`} aria-hidden="true" />
              <span className="text-muted-foreground">{item.label}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-primary/5 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Total questions</dt>
            <dd className="font-bold text-primary">{questions.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Answered</dt>
            <dd className="font-bold text-success">{answeredCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Not answered</dt>
            <dd className="font-bold text-primary">{notAnswered}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Marked for review</dt>
            <dd className="font-bold text-primary">{reviewCount}</dd>
          </div>
        </dl>
      </div>

      <nav aria-label="Question navigation" className="space-y-5 rounded-2xl border border-primary/5 bg-card p-5">
        {sections.map((group) => (
          <div key={group.name}>
            <p className="mb-2 text-sm font-bold text-primary">
              {group.name}
              <span className="ml-2 text-xs font-semibold text-muted-foreground">
                Q{group.startIndex + 1}–{group.startIndex + group.items.length}
              </span>
            </p>
            <div className="grid grid-cols-5 gap-2">
              {group.items.map((item, offset) => {
                const index = group.startIndex + offset;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrent(index);
                      setPanelOpen(false);
                    }}
                    aria-label={`${group.name} question ${index + 1}`}
                    aria-current={index === current ? "true" : undefined}
                    className={`size-9 rounded-lg text-sm font-bold ${statusClass[statusOf(item.id)]} ${
                      index === current ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <main className="min-h-screen bg-surface p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/5 bg-card p-6">
          <div>
            <h1 className="text-xl font-bold text-primary">{state.data.exam.title}</h1>
            <p className="text-sm text-muted-foreground">
              {currentSection ? `${currentSection} – ` : ""}
              Question {indexInSection || current + 1} of{" "}
              {sectionOfCurrent?.items.length ?? questions.length}
              {" · "}Answered {answeredCount} of {questions.length}
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

        <button
          type="button"
          onClick={() => setPanelOpen((value) => !value)}
          className="w-full rounded-full border border-primary/10 bg-card px-5 py-2.5 text-sm font-bold text-primary lg:hidden"
        >
          {panelOpen ? "Hide question panel" : "Show question panel"}
        </button>

        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <aside className={panelOpen ? "block" : "hidden lg:block"}>{navPanel}</aside>

          <div className="space-y-6">
            {question ? (
              <section className="space-y-5 rounded-2xl border border-primary/5 bg-card p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {currentSection} · Question {current + 1} of {questions.length} ·{" "}
                  {questionTypeLabel(question.question_type)} · {question.marks}{" "}
                  {question.marks === 1 ? "mark" : "marks"}
                  {review[question.id] ? " · Marked for review" : ""}
                </p>
                <p className="text-lg font-semibold text-primary">
                  Question {current + 1}. {question.prompt}
                </p>

                {question.question_type === "multiple_select" ? (
                  <div className="space-y-2">
                    {question.options.map((option, index) => {
                      const selected = answers[question.id]?.selected ?? [];
                      return (
                        <label
                          key={index}
                          className="flex items-center gap-3 rounded-lg bg-surface p-3 text-sm"
                        >
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
                            <span className="font-bold text-primary">{letterLabel(index)}.</span>{" "}
                            {option}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : null}

                {question.question_type === "multiple_choice" ||
                question.question_type === "true_false" ? (
                  <div className="space-y-2">
                    {question.options.map((option, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-3 rounded-lg bg-surface p-3 text-sm"
                      >
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

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={current === 0}
                    onClick={() => setCurrent((value) => Math.max(0, value - 1))}
                    className="rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={current >= questions.length - 1}
                    onClick={() => setCurrent((value) => Math.min(questions.length - 1, value + 1))}
                    className="rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary disabled:opacity-40"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleReview(question.id)}
                    className={`rounded-full px-5 py-2.5 text-sm font-bold ${
                      review[question.id]
                        ? "bg-warning text-warning-foreground"
                        : "border border-primary/10 text-primary hover:border-accent hover:text-accent"
                    }`}
                  >
                    {review[question.id] ? "Unmark review" : "Mark for review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => update(question.id, null)}
                    className="rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:border-destructive hover:text-destructive"
                  >
                    Clear answer
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {saveMutation.isPending ? "Saving…" : "Answers save automatically"}
                  </span>
                </div>
              </section>
            ) : null}

            <section className="space-y-4 rounded-2xl border border-primary/5 bg-card p-6">
              {confirming ? (
                <div className="space-y-3">
                  <p className="font-semibold text-primary">Are you sure you want to submit the exam?</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>Answered: {answeredCount}</li>
                    <li>Not answered: {notAnswered}</li>
                    <li>Marked for review: {reviewCount}</li>
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    You cannot retake this exam with the same credentials.
                  </p>
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
                      {submitMutation.isPending ? "Submitting…" : "Submit Exam"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Answered: {answeredCount} · Not answered: {notAnswered} · Marked for review:{" "}
                    {reviewCount}
                  </p>
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-accent"
                  >
                    Submit Exam
                  </button>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
