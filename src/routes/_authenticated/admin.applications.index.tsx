import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { AdminShell, EmptyState, LoadingBlock, StatusPill } from "@/components/admin/admin-shell";
import { adminApplicationsQuery, adminJobsQuery } from "@/lib/admin-api";
import { applicationStatuses, formatDate, type ApplicationStatus } from "@/lib/job-utils";

export const Route = createFileRoute("/_authenticated/admin/applications/")({
  head: () => ({
    meta: [
      { title: "Applications — Nexus Talent Admin" },
      { name: "description", content: "Review and progress candidate applications." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ApplicationsAdmin,
});

function ApplicationsAdmin() {
  const applications = useQuery(adminApplicationsQuery);
  const jobs = useQuery(adminJobsQuery);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | ApplicationStatus>("all");
  const [jobId, setJobId] = useState("all");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (applications.data ?? []).filter((application) => {
      const matchesStatus = status === "all" || application.status === status;
      const matchesJob = jobId === "all" || application.job_id === jobId;
      const matchesSearch =
        !term ||
        application.candidate_name.toLowerCase().includes(term) ||
        application.email.toLowerCase().includes(term) ||
        (application.location ?? "").toLowerCase().includes(term);
      return matchesStatus && matchesJob && matchesSearch;
    });
  }, [applications.data, search, status, jobId]);

  function exportCsv() {
    const header = ["Name", "Email", "Phone", "Job", "Status", "Submitted"];
    const rows = filtered.map((application) => [
      application.candidate_name,
      application.email,
      application.phone ?? "",
      application.jobs?.title ?? "",
      application.status,
      new Date(application.submitted_at).toISOString(),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminShell
      title="Applications"
      description="Every submission from the careers site"
      actions={
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
        >
          <Download className="size-4" aria-hidden="true" /> Export CSV
        </button>
      }
    >
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          maxLength={100}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search candidate, email or location"
          className="min-w-64 flex-1 rounded-lg border border-primary/10 bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
          aria-label="Filter by status"
          className="rounded-lg border border-primary/10 bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All statuses</option>
          {applicationStatuses.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={jobId}
          onChange={(event) => setJobId(event.target.value)}
          aria-label="Filter by job"
          className="rounded-lg border border-primary/10 bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All jobs</option>
          {(jobs.data ?? []).map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {applications.isPending ? (
          <LoadingBlock rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No applications found"
            hint="Applications arrive automatically once candidates submit the form."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-primary/5 bg-card">
            <table className="w-full min-w-[52rem] text-sm">
              <thead className="border-b border-primary/5 text-left text-xs font-bold tracking-widest uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Candidate</th>
                  <th className="px-5 py-4">Job</th>
                  <th className="px-5 py-4">Experience</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filtered.map((application) => (
                  <tr key={application.id}>
                    <td className="px-5 py-4">
                      <Link
                        to="/admin/applications/$id"
                        params={{ id: application.id }}
                        className="font-semibold text-primary hover:text-accent"
                      >
                        {application.candidate_name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{application.email}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {application.jobs?.title ?? "General application"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {application.experience ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={application.status} />
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {formatDate(application.submitted_at)}
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
