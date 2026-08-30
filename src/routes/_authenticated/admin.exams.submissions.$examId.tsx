import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, EmptyState, LoadingBlock, StatusPill } from "@/components/admin/admin-shell";
import { attemptStatusLabels } from "@/lib/exam-utils";
import {
  deleteAllExamAttempts,
  deleteExamAttempt,
  examAttemptsQuery,
  examQuery,
} from "@/lib/exams-api";
import { formatDate } from "@/lib/job-utils";

export const Route = createFileRoute("/_authenticated/admin/exams/submissions/$examId")({
  head: () => ({
    meta: [
      { title: "Exam Submissions — Nexus Talent Admin" },
      { name: "description", content: "Review candidate submissions and scores." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ExamSubmissions,
});

function ExamSubmissions() {
  const { examId } = Route.useParams();
  const queryClient = useQueryClient();
  const exam = useQuery(examQuery(examId));
  const attempts = useQuery(examAttemptsQuery(examId));

  const rows = attempts.data ?? [];

  const removeAttempt = useMutation({
    mutationFn: (attempt: { id: string; exam_id: string }) => deleteExamAttempt(attempt),
    onSuccess: () => {
      toast.success("Submission deleted");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeAll = useMutation({
    mutationFn: () => deleteAllExamAttempts(examId),
    onSuccess: (count) => {
      toast.success(`${count} submission${count === 1 ? "" : "s"} deleted`);
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const busy = removeAttempt.isPending || removeAll.isPending;

  return (
    <AdminShell
      title={exam.data ? `${exam.data.title} — Submissions` : "Submissions"}
      description={`${rows.length} attempt${rows.length === 1 ? "" : "s"}`}
      actions={
        <div className="flex flex-wrap items-center gap-3">
          {rows.length > 0 ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (
                  window.confirm(
                    `Delete all ${rows.length} submission${rows.length === 1 ? "" : "s"} for this exam? Attempts, answers and scores are removed permanently. Candidate logins are kept.`,
                  )
                ) {
                  removeAll.mutate();
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-destructive/30 px-5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-60"
            >
              <Trash2 className="size-4" aria-hidden="true" /> Delete all submissions
            </button>
          ) : null}
          <Link
            to="/admin/exams/$examId"
            params={{ examId }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to exam
          </Link>
        </div>
      }
    >
      {attempts.isLoading ? <LoadingBlock /> : null}
      {!attempts.isLoading && rows.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          hint="Share the exam link and credentials with your candidates."
        />
      ) : null}


      {rows.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-primary/5 bg-card">
          <table className="w-full min-w-[44rem] text-sm">
            <thead className="border-b border-primary/5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-4">Candidate</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Score</th>
                <th className="px-5 py-4">Result</th>
                <th className="px-5 py-4">Submitted</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((attempt) => (
                <tr key={attempt.id} className="border-b border-primary/5 last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-primary">
                      {attempt.exam_candidates?.full_name || attempt.exam_candidates?.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {attempt.exam_candidates?.username}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill status={attempt.status} />
                    <span className="sr-only">{attemptStatusLabels[attempt.status]}</span>
                  </td>
                  <td className="px-5 py-4">
                    {attempt.status === "in_progress"
                      ? "--"
                      : `${Number(attempt.total_score)} / ${Number(attempt.total_marks)}`}
                  </td>
                  <td className="px-5 py-4">
                    {attempt.status === "evaluated" && attempt.percentage !== null
                      ? `${Number(attempt.percentage)}% · ${attempt.passed ? "Passed" : "Failed"}`
                      : "--"}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {attempt.submitted_at ? formatDate(attempt.submitted_at) : "--"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <Link
                        to="/admin/exams/attempts/$attemptId"
                        params={{ attemptId: attempt.id }}
                        className="text-sm font-semibold text-accent hover:underline"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        disabled={busy}
                        aria-label={`Delete submission of ${attempt.exam_candidates?.full_name || attempt.exam_candidates?.username || "candidate"}`}
                        onClick={() => {
                          const who =
                            attempt.exam_candidates?.full_name ||
                            attempt.exam_candidates?.username ||
                            "this candidate";
                          if (
                            window.confirm(
                              `Delete the submission of ${who}? The attempt, its answers and scores are removed permanently. Their login is kept, so they can take the exam again.`,
                            )
                          ) {
                            removeAttempt.mutate({ id: attempt.id, exam_id: attempt.exam_id });
                          }
                        }}
                        className="rounded-lg border border-primary/10 p-2 text-muted-foreground hover:border-destructive hover:text-destructive disabled:opacity-60"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </AdminShell>
  );
}
