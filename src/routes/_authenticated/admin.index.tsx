import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
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
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText("https://zozii-iota.vercel.app/");
      setCopied(true);
      toast.success("Zozii URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <AdminShell title="Dashboard" description="Live overview of hiring activity">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Jobs" value={activeJobs} hint={`${draftJobs} drafts`} icon={Briefcase} />
        <StatCard label="Total Applications" value={total} hint="All time" icon={Users} />
        <StatCard label="Pending Review" value={pending} hint="New + under review" icon={Clock} />
        <StatCard label="Selected" value={selected} hint="Offers extended" icon={CheckCircle2} />
      </div>

      {/* Zozii Control Section */}
      <section className="mt-6 rounded-2xl border border-primary/10 bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-6 text-accent" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-bold text-primary">Zozii Control</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Service
                </span>
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  AI Meeting Assistant
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Invisible AI meeting assistant control center. Monitor real-time meeting answers, live session intelligence, and administrative oversight.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Control URL:
                </span>
                <a
                  href="https://zozii-iota.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-semibold text-accent underline-offset-2 hover:underline inline-flex items-center gap-1"
                >
                  https://zozii-iota.vercel.app/
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="inline-flex items-center gap-1 rounded-md border border-primary/10 bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-card hover:text-primary transition-colors cursor-pointer"
                  title="Copy URL"
                >
                  {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://zozii-iota.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-accent"
            >
              <span>Open Zozii Control</span>
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

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
