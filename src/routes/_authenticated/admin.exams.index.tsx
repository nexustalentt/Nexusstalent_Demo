import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, EmptyState, LoadingBlock, StatusPill } from "@/components/admin/admin-shell";
import { deleteExam, examsQuery, type ExamRow } from "@/lib/exams-api";
import { examStatusLabels } from "@/lib/exam-utils";
import { formatDate } from "@/lib/job-utils";

export const Route = createFileRoute("/_authenticated/admin/exams/")({
  head: () => ({
    meta: [
      { title: "Exam Creator — Nexus Talent Admin" },
      { name: "description", content: "Create assessments and review candidate submissions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ExamsAdmin,
});

function ExamsAdmin() {
  const queryClient = useQueryClient();
  const exams = useQuery(examsQuery);

  const removeMutation = useMutation({
    mutationFn: (exam: ExamRow) => deleteExam(exam),
    onSuccess: () => {
      toast.success("Exam deleted");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AdminShell
      title="Exam Creator"
      description="Assessments, assigned users and candidate submissions"
      actions={
        <Link
          to="/admin/exams/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent"
        >
          <Plus className="size-4" aria-hidden="true" /> Add Exam
        </Link>
      }
    >
      {exams.isLoading ? <LoadingBlock /> : null}
      {exams.isError ? (
        <EmptyState title="Could not load exams" hint={(exams.error as Error).message} />
      ) : null}

      {exams.data && exams.data.length === 0 ? (
        <EmptyState title="No exams yet" hint="Click Add Exam to build your first assessment." />
      ) : null}

      {exams.data && exams.data.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-primary/5 bg-card">
          <table className="w-full min-w-[52rem] text-sm">
            <thead className="border-b border-primary/5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-4">Exam name</th>
                <th className="px-5 py-4">Questions</th>
                <th className="px-5 py-4">Assigned users</th>
                <th className="px-5 py-4">Submissions</th>
                <th className="px-5 py-4">In progress</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.data.map((exam) => (
                <tr key={exam.id} className="border-b border-primary/5 last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-primary">{exam.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {exam.duration_minutes} min · pass {Number(exam.passing_percentage)}%
                    </p>
                  </td>
                  <td className="px-5 py-4">{exam.question_count}</td>
                  <td className="px-5 py-4">{exam.candidate_count}</td>
                  <td className="px-5 py-4">{exam.submission_count}</td>
                  <td className="px-5 py-4">{exam.pending_count}</td>
                  <td className="px-5 py-4">
                    <StatusPill status={exam.status} />
                    <span className="sr-only">{examStatusLabels[exam.status]}</span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{formatDate(exam.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <Link
                        to="/admin/exams/submissions/$examId"
                        params={{ examId: exam.id }}
                        className="text-sm font-semibold text-accent hover:underline"
                      >
                        View submissions
                      </Link>
                      <Link
                        to="/admin/exams/$examId"
                        params={{ examId: exam.id }}
                        className="text-sm font-semibold text-primary hover:text-accent"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        aria-label={`Delete ${exam.title}`}
                        onClick={() => {
                          if (window.confirm(`Delete "${exam.title}" and all its submissions?`)) {
                            removeMutation.mutate(exam);
                          }
                        }}
                        className="rounded-lg border border-primary/10 p-2 text-muted-foreground hover:border-destructive hover:text-destructive"
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
