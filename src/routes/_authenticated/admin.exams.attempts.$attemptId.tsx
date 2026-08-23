import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, EmptyState, LoadingBlock, StatusPill } from "@/components/admin/admin-shell";
import { attemptStatusLabels, questionTypeLabel } from "@/lib/exam-utils";
import { examAttemptQuery, saveEvaluation, type ExamAnswerRow, type ExamQuestionRow } from "@/lib/exams-api";
import { formatDate } from "@/lib/job-utils";

export const Route = createFileRoute("/_authenticated/admin/exams/attempts/$attemptId")({
  head: () => ({
    meta: [
      { title: "Candidate Submission — Nexus Talent Admin" },
      { name: "description", content: "Review answers and grade the submission." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AttemptDetail,
});

function answerText(question: ExamQuestionRow, answer: ExamAnswerRow | undefined) {
  const value = (answer?.answer ?? null) as { selected?: number[]; text?: string } | null;
  if (!value) return "No answer";
  const options = Array.isArray(question.options) ? (question.options as string[]) : [];
  if (value.selected && value.selected.length > 0) {
    return value.selected.map((index) => options[index] ?? `Option ${index + 1}`).join(", ");
  }
  return value.text?.trim() ? value.text : "No answer";
}

function correctText(question: ExamQuestionRow) {
  const options = Array.isArray(question.options) ? (question.options as string[]) : [];
  const correct = Array.isArray(question.correct_options)
    ? (question.correct_options as number[]).map(Number)
    : [];
  if (correct.length > 0) {
    return correct.map((index) => options[index] ?? `Option ${index + 1}`).join(", ");
  }
  return question.expected_answer ?? "Manually evaluated";
}

function AttemptDetail() {
  const { attemptId } = Route.useParams();
  const queryClient = useQueryClient();
  const detail = useQuery(examAttemptQuery(attemptId));
  const [drafts, setDrafts] = useState<Record<string, { marks: string; feedback: string }>>({});

  const gradeMutation = useMutation({
    mutationFn: (input: { questionId: string; marks: number; feedback: string }) =>
      saveEvaluation({ attemptId, ...input }),
    onSuccess: () => {
      toast.success("Evaluation saved");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (detail.isLoading) {
    return (
      <AdminShell title="Submission">
        <LoadingBlock />
      </AdminShell>
    );
  }

  if (!detail.data) {
    return (
      <AdminShell title="Submission">
        <EmptyState title="Submission not found" />
      </AdminShell>
    );
  }

  const { attempt, questions, answers } = detail.data;
  const answerByQuestion = new Map(answers.map((answer) => [answer.question_id, answer]));

  return (
    <AdminShell
      title={attempt.exam_candidates?.full_name || attempt.exam_candidates?.username || "Candidate"}
      description={attempt.exams?.title ?? ""}
      actions={
        <Link
          to="/admin/exams/submissions/$examId"
          params={{ examId: attempt.exam_id }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to submissions
        </Link>
      }
    >
      <div className="space-y-6">
        <section className="grid gap-4 rounded-2xl border border-primary/5 bg-card p-6 sm:grid-cols-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Score</p>
            <p className="mt-1 text-lg font-bold text-primary">
              {Number(attempt.total_score)} / {Number(attempt.total_marks)}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Percentage
            </p>
            <p className="mt-1 text-lg font-bold text-primary">
              {attempt.percentage === null ? "--" : `${Number(attempt.percentage)}%`}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</p>
            <p className="mt-1">
              <StatusPill status={attempt.status} />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {attemptStatusLabels[attempt.status]}
              {attempt.status === "evaluated"
                ? ` · ${attempt.passed ? "Passed" : "Failed"}`
                : ""}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Submitted
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {attempt.submitted_at ? formatDate(attempt.submitted_at) : "In progress"}
            </p>
          </div>
        </section>

        <ol className="space-y-4">
          {questions.map((question, index) => {
            const answer = answerByQuestion.get(question.id);
            const manual = question.question_type === "long_answer";
            const draft = drafts[question.id] ?? {
              marks: answer?.awarded_marks === null || answer?.awarded_marks === undefined
                ? ""
                : String(Number(answer.awarded_marks)),
              feedback: answer?.feedback ?? "",
            };
            return (
              <li key={question.id} className="space-y-3 rounded-2xl border border-primary/5 bg-card p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {index + 1}. {questionTypeLabel(question.question_type)} · {Number(question.marks)}{" "}
                  {Number(question.marks) === 1 ? "mark" : "marks"}
                </p>
                <p className="font-semibold text-primary">{question.prompt}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-surface p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Candidate answer
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-primary">
                      {answerText(question, answer)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {manual ? "Evaluation guide" : "Correct answer"}
                    </p>
                    <p className="mt-1 text-sm text-primary">{correctText(question)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label
                      className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                      htmlFor={`marks-${question.id}`}
                    >
                      Marks awarded
                    </label>
                    <input
                      id={`marks-${question.id}`}
                      type="number"
                      min={0}
                      max={Number(question.marks)}
                      step="0.5"
                      value={draft.marks}
                      onChange={(event) =>
                        setDrafts({
                          ...drafts,
                          [question.id]: { ...draft, marks: event.target.value },
                        })
                      }
                      className="w-28 rounded-lg border border-primary/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <div className="min-w-56 flex-1">
                    <label
                      className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                      htmlFor={`feedback-${question.id}`}
                    >
                      Feedback
                    </label>
                    <input
                      id={`feedback-${question.id}`}
                      value={draft.feedback}
                      maxLength={2000}
                      onChange={(event) =>
                        setDrafts({
                          ...drafts,
                          [question.id]: { ...draft, feedback: event.target.value },
                        })
                      }
                      className="w-full rounded-lg border border-primary/10 bg-card px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={gradeMutation.isPending}
                    onClick={() => {
                      const marks = Number(draft.marks);
                      if (!Number.isFinite(marks) || marks < 0 || marks > Number(question.marks)) {
                        toast.error(`Enter marks between 0 and ${Number(question.marks)}`);
                        return;
                      }
                      gradeMutation.mutate({
                        questionId: question.id,
                        marks,
                        feedback: draft.feedback,
                      });
                    }}
                    className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent disabled:opacity-60"
                  >
                    Save
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </AdminShell>
  );
}
