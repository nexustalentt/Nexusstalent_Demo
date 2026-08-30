import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { AdminShell, EmptyState, LoadingBlock, StatusPill } from "@/components/admin/admin-shell";
import { adminJobsQuery, jobAppliesQuery } from "@/lib/admin-api";
import { formatDate } from "@/lib/job-utils";
import {
  jobApplicationStatuses,
  type JobApplicationStatus,
} from "@/lib/job-application-schema";

export const Route = createFileRoute("/_authenticated/admin/job-applies/")({
  head: () => ({
    meta: [
      { title: "Job Applies — Nexus Talent Admin" },
      { name: "description", content: "Website job application submissions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: JobAppliesPage,
});

const control =
  "rounded-lg border border-primary/10 bg-card px-4 py-2.5 text-sm outline-none focus:border-accent";

function JobAppliesPage() {
  const applies = useQuery(jobAppliesQuery);
  const jobs = useQuery(adminJobsQuery);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | JobApplicationStatus>("all");
  const [jobId, setJobId] = useState("all");
  const [experience, setExperience] = useState<"all" | "fresher" | "experienced">("all");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (applies.data ?? []).filter((row) => {
      const matchesStatus = status === "all" || row.status === status;
      const matchesJob = jobId === "all" || row.job_id === jobId;
      const matchesExperience = experience === "all" || row.experience_type === experience;
      const haystack = [
        row.first_name,
        row.last_name,
        row.email,
        row.phone,
        row.application_code,
        row.primary_skills,
        row.current_location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && matchesJob && matchesExperience && (!term || haystack.includes(term));
    });
  }, [applies.data, search, status, jobId, experience]);

  function exportCsv() {
    const header = [
      "Application ID",
      "Name",
      "Email",
      "Phone",
      "Job",
      "Experience",
      "Skills",
      "Status",
      "Applied on",
    ];
    const rows = filtered.map((row) => [
      row.application_code,
      `${row.first_name} ${row.last_name}`,
      row.email,
      row.phone,
      row.jobs?.title ?? row.job_title ?? "",
      row.experience_type === "fresher" ? "Fresher" : (row.total_experience ?? "Experienced"),
      row.primary_skills,
      row.status,
      new Date(row.created_at).toISOString(),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `job-applies-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminShell
      title="Job Applies"
      description="Applications submitted through the website form"
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
          placeholder="Search name, email, phone, skills or application ID"
          className={`min-w-64 flex-1 ${control}`}
        />
        <select
          value={status}
          aria-label="Filter by status"
          onChange={(event) => setStatus(event.target.value as typeof status)}
          className={control}
        >
          <option value="all">All statuses</option>
          {jobApplicationStatuses.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={jobId}
          aria-label="Filter by job"
          onChange={(event) => setJobId(event.target.value)}
          className={control}
        >
          <option value="all">All jobs</option>
          {(jobs.data ?? []).map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
        <select
          value={experience}
          aria-label="Filter by experience"
          onChange={(event) => setExperience(event.target.value as typeof experience)}
          className={control}
        >
          <option value="all">Fresher &amp; experienced</option>
          <option value="fresher">Fresher</option>
          <option value="experienced">Experienced</option>
        </select>
      </div>

      <div className="mt-6">
        {applies.isPending ? (
          <LoadingBlock rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No applications yet"
            hint="Set a job's application method to the website form and submissions will appear here."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-primary/5 bg-card">
            <table className="w-full min-w-[60rem] text-sm">
              <thead className="border-b border-primary/5 text-left text-xs font-bold tracking-widest uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Candidate</th>
                  <th className="px-5 py-4">Application ID</th>
                  <th className="px-5 py-4">Job</th>
                  <th className="px-5 py-4">Experience</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Applied on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="px-5 py-4">
                      <Link
                        to="/admin/job-applies/$id"
                        params={{ id: row.id }}
                        className="font-semibold text-primary hover:text-accent"
                      >
                        {row.first_name} {row.last_name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                      {row.application_code}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {row.jobs?.title ?? row.job_title ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {row.experience_type === "fresher"
                        ? "Fresher"
                        : (row.total_experience ?? "Experienced")}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(row.created_at)}</td>
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
