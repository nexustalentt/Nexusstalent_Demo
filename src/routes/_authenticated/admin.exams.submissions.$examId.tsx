import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { AdminShell, EmptyState, LoadingBlock, StatusPill } from "@/components/admin/admin-shell";
import { attemptStatusLabels } from "@/lib/exam-utils";
import { examAttemptsQuery, examQuery } from "@/lib/exams-api";
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
  const exam = useQuery(examQuery(examId));
  const attempts = useQuery(examAttemptsQuery(examId));

  const rows = attempts.data ?? [];

  return (
    <AdminShell
      title={exam.data ? `${exam.data.title} — Submissions` : "Submissions"}
      description={`${rows.length} attempt${rows.length === 1 ? "" : "s"}`}
      actions={
        <Link
          to="/admin/exams/$examId"
          params={{ examId }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to exam
        </Link>
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
                  <td className="px-5 py-4 text-right">
                    <Link
                      to="/admin/exams/attempts/$attemptId"
                      params={{ attemptId: attempt.id }}
                      className="text-sm font-semibold text-accent hover:underline"
                    >
                      View
                    </Link>
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
