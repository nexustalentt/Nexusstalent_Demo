import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { formatDuration, groupBySection, normalizeSection, questionTypeLabel } from "@/lib/exam-utils";
import { letterLabel } from "@/lib/question-bank-parser";
import { ShieldAlert, X } from "lucide-react";
import {
  getAttemptState,
  saveExamAnswer,
  startExamAttempt,
  submitExamAttempt,
} from "@/lib/exams.functions";

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

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

type Status = "answered" | "not_visited" | "not_answered" | "review" | "answered_review";

const statusClass: Record<Status, string> = {
  answered: "bg-success text-success-foreground border border-success",
  not_visited: "bg-card text-muted-foreground border border-primary/15",
  not_answered: "bg-secondary text-primary border border-primary/40",
  review: "bg-warning text-warning-foreground border border-warning",
  answered_review: "bg-accent text-accent-foreground border border-accent",
};

const legend: { status: Status; label: string }[] = [
  { status: "answered", label: "Answered" },
  { status: "not_answered", label: "Visited, not answered" },
  { status: "not_visited", label: "Not visited" },
  { status: "review", label: "Marked for review" },
  { status: "answered_review", label: "Answered & marked" },
];

/**
 * Deterrent-only protections: blocks copy/cut, the context menu and the common
 * copy/save/print/view-source shortcuts inside the exam area, while leaving
 * typing, option selection, scrolling, navigation and submission untouched.
 */
function useExamGuards(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const node = ref.current;
    if (!node || !active) return;

    const isTypingTarget = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

    const blockClipboard = (event: Event) => {
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
    };
    const blockContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };
    const blockKeys = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (key === "u" || key === "s" || key === "p") {
        event.preventDefault();
        return;
      }
      if ((key === "c" || key === "x" || key === "a") && !isTypingTarget(event.target)) {
        event.preventDefault();
      }
    };

    node.addEventListener("copy", blockClipboard);
    node.addEventListener("cut", blockClipboard);
    node.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockKeys);
    return () => {
      node.removeEventListener("copy", blockClipboard);
      node.removeEventListener("cut", blockClipboard);
      node.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockKeys);
    };
  }, [ref, active]);
}

/** Non-selectable diagonal watermark tiled behind the question content. */
function Watermark({ label }: { label: string }) {
  const text = `CONFIDENTIAL • APTITUDE TEST • DO NOT COPY${label ? ` • ${label}` : ""}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="620" height="220"><text x="0" y="130" transform="rotate(-24 0 130)" font-family="Inter, sans-serif" font-size="19" font-weight="700" fill="rgba(15,23,42,0.055)" letter-spacing="2">${text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")}</text></svg>`;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 select-none"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}

const PROCTORING_WARNINGS = [
  "Warning: Please stay active and remain visible on camera.",
  "Please stay on camera. Don't move away from the screen.",
  "Warning: Your camera presence is being monitored. Please remain visible.",
  "Proctoring Alert: Ensure your face remains clearly visible in the camera frame.",
  "Warning: Do not look away from the screen or leave the camera view.",
];

/**
 * Camera monitoring reminder popup:
 * Periodically displays a real online exam proctoring warning every 2-4 minutes (randomized)
 * regardless of whether the candidate is moving or sitting still.
 * Automatically closes after a few seconds without interfering with exam timer or state.
 */
function CameraMonitorReminder({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(PROCTORING_WARNINGS[0]);
  const timerRef = useRef<number | null>(null);
  const autoCloseRef = useRef<number | null>(null);
  const activeRef = useRef(active);

  activeRef.current = active;

  const showReminder = useCallback(() => {
    if (!activeRef.current) return;

    const nextMsg =
      PROCTORING_WARNINGS[Math.floor(Math.random() * PROCTORING_WARNINGS.length)] ??
      PROCTORING_WARNINGS[0];
    setMessage(nextMsg);
    setVisible(true);

    if (autoCloseRef.current) window.clearTimeout(autoCloseRef.current);
    autoCloseRef.current = window.setTimeout(() => {
      setVisible(false);
      scheduleNext();
    }, 7000);
  }, []);

  const scheduleNext = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (!activeRef.current) return;

    // Randomized interval between 2 and 4 minutes (120,000ms - 240,000ms)
    const minMs = 2 * 60 * 1000;
    const maxMs = 4 * 60 * 1000;
    const interval = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;

    timerRef.current = window.setTimeout(() => {
      showReminder();
    }, interval);
  }, [showReminder]);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (autoCloseRef.current) window.clearTimeout(autoCloseRef.current);
      return;
    }

    scheduleNext();

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (autoCloseRef.current) window.clearTimeout(autoCloseRef.current);
    };
  }, [active, scheduleNext]);

  const handleDismiss = () => {
    setVisible(false);
    if (autoCloseRef.current) window.clearTimeout(autoCloseRef.current);
    scheduleNext();
  };

  if (!visible) return null;

  return (
    <aside
      role="alert"
      aria-live="assertive"
      className="pointer-events-none fixed top-5 left-1/2 -translate-x-1/2 z-[70] w-[94vw] max-w-lg transition-all duration-300 ease-out"
    >
      <div className="pointer-events-auto relative overflow-hidden rounded-2xl border-2 border-amber-500/80 bg-card/95 p-4 shadow-[0_12px_40px_rgba(245,158,11,0.25)] backdrop-blur-md ring-4 ring-amber-500/15 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex items-start gap-3.5">
          <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="size-5" />
            <span className="absolute -top-1 -right-1 flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-red-500" />
            </span>
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                <span className="size-1.5 rounded-full bg-amber-600 animate-pulse" />
                Proctoring Notice
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">Live Monitoring</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-foreground leading-snug">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss proctoring warning"
            className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Visual auto-close countdown bar */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-amber-500/20">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-red-500"
            style={{
              animation: "proctoring-countdown 7s linear forwards",
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes proctoring-countdown {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </aside>
  );
}

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
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [current, setCurrent] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const hydrated = useRef(false);
  const autoSubmitted = useRef(false);
  const examAreaRef = useRef<HTMLDivElement | null>(null);

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

  const startMutation = useMutation({
    mutationFn: () => startExamAttempt({ data: { sessionToken } }),
    onSuccess: async () => {
      hydrated.current = false;
      await state.refetch();
    },
  });

  const submitted = state.data && state.data.status !== "in_progress";
  const started = Boolean(state.data?.started);

  useExamGuards(examAreaRef, Boolean(started && !submitted));

  useEffect(() => {
    if (submitted) onSubmitted?.();
  }, [submitted, onSubmitted]);

  useEffect(() => {
    if (!state.data || submitted || !started) return;
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
  }, [state.data, submitted, started, submit]);

  const questions = state.data?.questions ?? [];
  const sections = useMemo(() => groupBySection(questions), [questions]);
  const currentQuestionId = questions[current]?.id;

  useEffect(() => {
    if (!currentQuestionId) return;
    setVisited((existing) =>
      existing[currentQuestionId] ? existing : { ...existing, [currentQuestionId]: true },
    );
  }, [currentQuestionId]);

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

  if (!started) {
    return (
      <InstructionsGate
        exam={state.data.exam}
        candidateName={state.data.candidateName}
        candidateUsername={state.data.candidateUsername}
        questionCount={questions.length}
        pending={startMutation.isPending}
        error={startMutation.error instanceof Error ? startMutation.error.message : null}
        onStart={() => startMutation.mutate()}
      />
    );
  }

  const question = questions[current];
  const answeredCount = questions.filter((item) => isAnswered(answers[item.id] ?? null)).length;
  const reviewCount = questions.filter((item) => review[item.id]).length;
  const notAnswered = questions.length - answeredCount;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const watermarkLabel = state.data.candidateUsername ?? state.data.candidateName ?? "";

  function statusOf(questionId: string): Status {
    const answered = isAnswered(answers[questionId] ?? null);
    const marked = Boolean(review[questionId]);
    if (answered && marked) return "answered_review";
    if (marked) return "review";
    if (answered) return "answered";
    return visited[questionId] ? "not_answered" : "not_visited";
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

  function goTo(index: number) {
    setCurrent(Math.min(Math.max(index, 0), Math.max(questions.length - 1, 0)));
  }

  function saveAndNext() {
    if (!question) return;
    saveMutation.mutate({ questionId: question.id, answer: answers[question.id] ?? null });
    if (current < questions.length - 1) goTo(current + 1);
  }

  const currentSection = question ? normalizeSection(question.section) : "";
  const sectionOfCurrent = sections.find((group) => group.name === currentSection);
  const indexInSection = sectionOfCurrent
    ? sectionOfCurrent.items.findIndex((item) => item.id === question?.id) + 1
    : 0;

  const timeClass =
    seconds <= 60
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : seconds <= 300
        ? "border-warning/40 bg-warning/15 text-primary"
        : "border-primary/10 bg-surface text-primary";

  const navPanel = (
    <div className="space-y-4 lg:sticky lg:top-24">
      <nav
        aria-label="Question navigation"
        className="rounded-2xl border border-primary/10 bg-card shadow-[var(--shadow-card)]"
      >
        <div className="border-b border-primary/10 px-5 py-3.5">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">Question Paper</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {questions.length} questions · {answeredCount} answered
          </p>
        </div>
        <div className="space-y-5 p-5">
          {sections.map((group) => (
            <div key={group.name}>
              <p className="mb-2.5 flex items-baseline justify-between gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <span className="truncate">{group.name}</span>
                <span className="shrink-0 font-semibold normal-case tracking-normal text-muted-foreground">
                  {pad2(group.startIndex + 1)}–{pad2(group.startIndex + group.items.length)}
                </span>
              </p>
              <div className="grid grid-cols-5 gap-2">
                {group.items.map((item, offset) => {
                  const index = group.startIndex + offset;
                  const active = index === current;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        goTo(index);
                        setPanelOpen(false);
                      }}
                      aria-label={`${group.name} question ${index + 1}`}
                      aria-current={active ? "true" : undefined}
                      className={`grid h-9 place-items-center rounded-md text-xs font-bold transition-colors ${
                        statusClass[statusOf(item.id)]
                      } ${active ? "ring-2 ring-accent ring-offset-2 ring-offset-card" : ""}`}
                    >
                      {pad2(index + 1)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="rounded-2xl border border-primary/10 bg-card p-5 shadow-[var(--shadow-card)]">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Legend</p>
        <ul className="mt-2.5 space-y-1.5 text-sm">
          {legend.map((item) => (
            <li key={item.status} className="flex items-center gap-2">
              <span className={`size-4 shrink-0 rounded ${statusClass[item.status]}`} aria-hidden="true" />
              <span className="text-muted-foreground">{item.label}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-primary/10 pt-3 text-sm">
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
    </div>
  );

  const optionRowClass = (selected: boolean) =>
    `flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm transition-colors ${
      selected
        ? "border-accent bg-accent/8 text-primary"
        : "border-primary/10 bg-surface hover:border-accent/50"
    }`;

  return (
    <div ref={examAreaRef} className="min-h-screen bg-surface">
      <CameraMonitorReminder active={Boolean(started && !submitted)} />
      <header className="sticky top-0 z-30 border-b border-primary/10 bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-primary sm:text-lg">
                {state.data.exam.title}
              </h1>
              <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
                {state.data.candidateName ? (
                  <span className="font-semibold text-accent">
                    {state.data.candidateName}
                    {state.data.candidateUsername &&
                    state.data.candidateUsername !== state.data.candidateName
                      ? ` (${state.data.candidateUsername})`
                      : ""}
                  </span>
                ) : (
                  <span className="font-semibold text-accent">
                    {state.data.candidateUsername ?? "Candidate"}
                  </span>
                )}
                {" · "}
                {state.data.exam.duration_minutes} min
                {currentSection ? ` · ${currentSection}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <span className="hidden rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-success sm:inline">
                In progress
              </span>
              <div className={`rounded-xl border px-3 py-1.5 text-right ${timeClass}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  Time left
                </p>
                <p className="font-mono text-lg font-bold leading-tight tabular-nums">
                  {formatDuration(seconds)}
                </p>
              </div>
            </div>
          </div>
          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Answered progress"
          >
            <div
              className="h-full rounded-full bg-success transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-8">
        {state.data.exam.instructions ? (
          <details className="rounded-2xl border border-primary/10 bg-card p-5">
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
          {panelOpen ? "Hide question paper" : "Show question paper"}
        </button>

        <div className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
          <aside className={panelOpen ? "block" : "hidden lg:block"}>{navPanel}</aside>

          <div className="space-y-5">
            {question ? (
              <section className="relative overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-[var(--shadow-card)]">
                <Watermark label={watermarkLabel} />

                <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 bg-surface/60 px-6 py-3.5">
                  <p className="text-sm font-bold uppercase tracking-wider text-primary">
                    Question {pad2(current + 1)}
                    <span className="ml-2 text-xs font-semibold normal-case tracking-normal text-muted-foreground">
                      of {questions.length}
                      {sectionOfCurrent
                        ? ` · ${currentSection} ${indexInSection}/${sectionOfCurrent.items.length}`
                        : ""}
                    </span>
                  </p>
                  <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <span className="rounded-full border border-primary/10 bg-card px-2.5 py-1">
                      {questionTypeLabel(question.question_type)}
                    </span>
                    <span className="rounded-full border border-primary/10 bg-card px-2.5 py-1">
                      {question.marks} {question.marks === 1 ? "mark" : "marks"}
                    </span>
                    {review[question.id] ? (
                      <span className="rounded-full bg-warning px-2.5 py-1 text-warning-foreground">
                        Marked for review
                      </span>
                    ) : null}
                  </p>
                </div>

                <div className="relative space-y-5 px-6 py-6">
                  <p className="select-none text-lg font-semibold leading-relaxed text-primary sm:text-xl">
                    {question.prompt}
                  </p>

                  {question.options.length > 0 ? (
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Select your answer
                    </p>
                  ) : null}

                  {question.question_type === "multiple_select" ? (
                    <div className="space-y-2.5">
                      {question.options.map((option, index) => {
                        const selected = answers[question.id]?.selected ?? [];
                        const checked = selected.includes(index);
                        return (
                          <label key={index} className={optionRowClass(checked)}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                update(question.id, {
                                  selected: checked
                                    ? selected.filter((value) => value !== index)
                                    : [...selected, index].sort((a, b) => a - b),
                                })
                              }
                              className="mt-0.5 size-4 shrink-0 accent-accent"
                            />
                            <span className="select-none">
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
                    <div className="space-y-2.5">
                      {question.options.map((option, index) => {
                        const checked = (answers[question.id]?.selected ?? []).includes(index);
                        return (
                          <label key={index} className={optionRowClass(checked)}>
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              checked={checked}
                              onChange={() => update(question.id, { selected: [index] })}
                              className="mt-0.5 size-4 shrink-0 accent-accent"
                            />
                            <span className="select-none">
                              <span className="font-bold text-primary">{letterLabel(index)}.</span>{" "}
                              {option}
                            </span>
                          </label>
                        );
                      })}
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
                </div>

                <div className="relative border-t border-primary/10 bg-surface/60 px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      disabled={current === 0}
                      onClick={() => goTo(current - 1)}
                      className="rounded-full border border-primary/15 bg-card px-5 py-2.5 text-sm font-semibold text-primary disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={saveAndNext}
                      className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent"
                    >
                      Save &amp; Next
                    </button>
                    <button
                      type="button"
                      disabled={current >= questions.length - 1}
                      onClick={() => goTo(current + 1)}
                      className="rounded-full border border-primary/15 bg-card px-5 py-2.5 text-sm font-semibold text-primary disabled:opacity-40"
                    >
                      Next
                    </button>
                    <span className="mx-1 hidden h-6 w-px bg-primary/10 sm:block" aria-hidden="true" />
                    <button
                      type="button"
                      onClick={() => toggleReview(question.id)}
                      className={`rounded-full px-5 py-2.5 text-sm font-bold ${
                        review[question.id]
                          ? "bg-warning text-warning-foreground"
                          : "border border-primary/15 bg-card text-primary hover:border-accent hover:text-accent"
                      }`}
                    >
                      {review[question.id] ? "Unmark review" : "Mark for review"}
                    </button>
                    <button
                      type="button"
                      onClick={() => update(question.id, null)}
                      className="rounded-full border border-primary/15 bg-card px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:border-destructive hover:text-destructive"
                    >
                      Clear answer
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {saveMutation.isPending ? "Saving…" : "Answers save automatically"}
                    </span>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="rounded-2xl border border-primary/10 bg-card p-6 shadow-[var(--shadow-card)]">
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
                      className="rounded-full border border-primary/15 px-5 py-2.5 text-sm font-semibold text-primary"
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
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Answered: <span className="font-bold text-success">{answeredCount}</span> · Not
                    answered: <span className="font-bold text-primary">{notAnswered}</span> · Marked
                    for review: <span className="font-bold text-primary">{reviewCount}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-accent"
                  >
                    Submit Exam
                  </button>
                </div>
              )}
            </section>

            <p className="pb-4 text-center text-xs text-muted-foreground">
              Confidential aptitude assessment · Copying or distributing this question paper is
              prohibited.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Instructions pop-up shown after login; the exam and timer only start on click. */
function InstructionsGate({
  exam,
  candidateName,
  candidateUsername,
  questionCount,
  pending,
  error,
  onStart,
}: {
  exam: { title: string; description: string | null; instructions: string | null; duration_minutes: number };
  candidateName: string | null;
  candidateUsername: string | null;
  questionCount: number;
  pending: boolean;
  error: string | null;
  onStart: () => void;
}) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <main className="flex min-h-screen items-start justify-center bg-surface p-4 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-instructions-title"
        className="w-full max-w-2xl rounded-2xl border border-primary/5 bg-card p-6 shadow-xl sm:p-8"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Exam instructions</p>
        <h1 id="exam-instructions-title" className="mt-2 text-2xl font-bold text-primary">
          {exam.title}
        </h1>
        {candidateName ? (
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Candidate: {candidateName}
            {candidateUsername ? ` (${candidateUsername})` : ""}
          </p>
        ) : null}

        <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-primary/5 bg-surface p-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Duration</dt>
            <dd className="font-bold text-primary">{exam.duration_minutes} minutes</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Questions</dt>
            <dd className="font-bold text-primary">{questionCount}</dd>
          </div>
        </dl>

        {exam.description ? (
          <p className="mt-5 text-sm text-muted-foreground">{exam.description}</p>
        ) : null}

        <div className="mt-5 max-h-72 overflow-y-auto rounded-xl border border-primary/5 p-4 text-sm leading-relaxed text-muted-foreground">
          {exam.instructions ? (
            <div className="whitespace-pre-wrap">{exam.instructions}</div>
          ) : (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>The timer starts as soon as you click “Start Exam” and cannot be paused.</li>
              <li>Your answers are saved automatically as you go.</li>
              <li>The exam is submitted automatically when the timer reaches zero.</li>
              <li>Keep your camera on for the entire exam.</li>
              <li>Copying, printing or sharing the question paper is strictly prohibited.</li>
            </ul>
          )}
        </div>

        <label className="mt-5 flex items-start gap-3 text-sm font-semibold text-primary">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
            className="mt-0.5 size-4 rounded border-primary/30"
          />
          I have read and understood the instructions above.
        </label>

        {error ? (
          <p role="alert" className="mt-4 text-sm font-semibold text-destructive">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onStart}
          disabled={!acknowledged || pending}
          className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          {pending ? "Starting exam…" : "Start Exam"}
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Your {exam.duration_minutes}-minute timer begins the moment you click Start Exam.
        </p>
      </div>
    </main>
  );
}
