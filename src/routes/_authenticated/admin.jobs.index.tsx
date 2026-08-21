import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, EmptyState, LoadingBlock, StatusPill } from "@/components/admin/admin-shell";
import { adminJobsQuery, deleteJob, setJobStatus, type JobRow } from "@/lib/admin-api";
import { formatDate, jobStatuses, type JobStatus } from "@/lib/job-utils";

export const Route = createFileRoute("/_authenticated/admin/jobs/")({
  head: () => ({
    meta: [
      { title: "Job Management — Nexus Talent Admin" },
      { name: "description", content: "Create, publish and close job postings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: JobsAdmin,
});

function JobsAdmin() {
  const queryClient = useQueryClient();
  const jobs = useQuery(adminJobsQuery);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | JobStatus>("all");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const statusMutation = useMutation({
    mutationFn: ({ job, next }: { job: JobRow; next: JobStatus }) => setJobStatus(job, next),
    onSuccess: () => {
      toast.success("Job status updated");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (job: JobRow) => deleteJob(job),
    onSuccess: () => {
      toast.success("Job deleted");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const filtered = (jobs.data ?? []).filter((job) => {
    const matchesStatus = status === "all" || job.status === status;
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      job.title.toLowerCase().includes(term) ||
      (job.location ?? "").toLowerCase().includes(term) ||
      (job.job_code ?? "").toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminShell
      title="Job Management"
      description="Publish roles to the public careers page"
      actions={
        <Link
          to="/admin/jobs/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent"
        >
          <Plus className="size-4" aria-hidden="true" /> Add New Job
        </Link>
      }
    >
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, code or location"
          maxLength={100}
          className="min-w-64 flex-1 rounded-lg border border-primary/10 bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
          className="rounded-lg border border-primary/10 bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All statuses</option>
          {jobStatuses.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {jobs.isPending ? (
          <LoadingBlock rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No jobs match your filters" hint="Try clearing the search or status filter." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-primary/5 bg-card">
            <table className="w-full min-w-[52rem] text-sm">
              <thead className="border-b border-primary/5 text-left text-xs font-bold tracking-widest uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Job</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Updated</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filtered.map((job) => (
                  <tr key={job.id}>
                    <td className="px-5 py-4">
                      <Link
                        to="/admin/jobs/$id"
                        params={{ id: job.id }}
                        className="font-semibold text-primary hover:text-accent"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {job.job_code ?? job.slug}
                        {job.is_sample ? " · sample" : ""}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{job.location ?? "—"}</td>
                    <td className="px-5 py-4">
                      <StatusPill status={job.status} />
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(job.updated_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <select
                          value={job.status}
                          onChange={(event) =>
                            statusMutation.mutate({ job, next: event.target.value as JobStatus })
                          }
                          aria-label={`Change status for ${job.title}`}
                          className="rounded-lg border border-primary/10 bg-background px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-accent"
                        >
                          {jobStatuses.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete “${job.title}”? This cannot be undone.`)) {
                              deleteMutation.mutate(job);
                            }
                          }}
                          aria-label={`Delete ${job.title}`}
                          className="rounded-lg border border-primary/10 p-2 text-muted-foreground hover:border-destructive/40 hover:text-destructive"
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
        )}
      </div>
    </AdminShell>
  );
}
