import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, CheckCircle2, Clock, Users } from "lucide-react";
import { AdminShell, LoadingBlock, StatusPill } from "@/components/admin/admin-shell";
import {
  adminApplicationsQuery,
  adminJobsQuery,
  auditLogsQuery,
} from "@/lib/admin-api";
import { formatDate, statusLabel } from "@/lib/job-utils";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Nexus Talent" },
      { name: "description", content: "Recruitment operations overview." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const jobs = useQuery(adminJobsQuery);
  const applications = useQuery(adminApplicationsQuery);
  const audits = useQuery(auditLogsQuery);

  const activeJobs = jobs.data?.filter((job) => job.status === "active").length ?? 0;
  const draftJobs = jobs.data?.filter((job) => job.status === "draft").length ?? 0;
  const total = applications.data?.length ?? 0;
  const pending =
    applications.data?.filter((application) =>
      ["new", "under_review"].includes(application.status),
    ).length ?? 0;
  const selected = applications.data?.filter((a) => a.status === "selected").length ?? 0;

  const byStatus = ["new", "under_review", "shortlisted", "interview", "selected", "rejected"].map(
    (status) => ({
      status,
      count: applications.data?.filter((a) => a.status === status).length ?? 0,
    }),
  );
  const maxCount = Math.max(1, ...byStatus.map((s) => s.count));

  return (
    <AdminShell title="Dashboard" description="Live overview of hiring activity">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Jobs" value={activeJobs} hint={`${draftJobs} drafts`} icon={Briefcase} />
        <StatCard label="Total Applications" value={total} hint="All time" icon={Users} />
        <StatCard label="Pending Review" value={pending} hint="New + under review" icon={Clock} />
        <StatCard label="Selected" value={selected} hint="Offers extended" icon={CheckCircle2} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-primary/5 bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-primary">Recent applications</h2>
            <Link to="/admin/applications" className="text-sm font-semibold text-accent">
              View all
            </Link>
          </div>
          <div className="mt-4">
            {applications.isPending ? (
              <LoadingBlock rows={5} />
            ) : (
              <ul className="divide-y divide-primary/5">
                {(applications.data ?? []).slice(0, 6).map((application) => (
                  <li key={application.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <Link
                        to="/admin/applications/$id"
                        params={{ id: application.id }}
                        className="truncate font-semibold text-primary hover:text-accent"
                      >
                        {application.candidate_name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {application.jobs?.title ?? "General application"} ·{" "}
                        {formatDate(application.submitted_at)}
                      </p>
                    </div>
                    <StatusPill status={application.status} />
                  </li>
                ))}
                {applications.data?.length === 0 ? (
                  <li className="py-6 text-sm text-muted-foreground">No applications yet.</li>
                ) : null}
              </ul>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-primary/5 bg-card p-6">
            <h2 className="font-bold text-primary">Pipeline</h2>
            <ul className="mt-4 space-y-3">
              {byStatus.map((item) => (
                <li key={item.status}>
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span className="uppercase tracking-wider">{statusLabel(item.status)}</span>
                    <span className="text-primary">{item.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-surface">
                    <div
                      className="h-2 rounded-full bg-accent"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-primary/5 bg-card p-6">
            <h2 className="font-bold text-primary">Activity log</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {(audits.data ?? []).slice(0, 6).map((log) => (
                <li key={log.id} className="text-muted-foreground">
                  <span className="font-semibold text-primary">
                    {log.action.replace(/_/g, " ")}
                  </span>{" "}
                  · {log.actor_email ?? "system"} · {formatDate(log.created_at)}
                </li>
              ))}
              {audits.data?.length === 0 ? (
                <li className="text-sm text-muted-foreground">No activity recorded yet.</li>
              ) : null}
            </ul>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: typeof Briefcase;
}) {
  return (
    <div className="rounded-2xl border border-primary/5 bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
          {label}
        </span>
        <Icon className="size-4 text-accent" aria-hidden="true" />
      </div>
      <p className="mt-3 text-3xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
