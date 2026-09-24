import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download, ExternalLink, FileText, Loader2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, EmptyState, LoadingBlock, StatusPill } from "@/components/admin/admin-shell";
import { NexusLogo } from "@/components/brand/nexus-logo";
import {
  adminJobsQuery,
  adminReferralsQuery,
  deleteReferral,
  updateReferral,
  type JobReferralRow,
} from "@/lib/admin-api";
import { formatDate } from "@/lib/job-utils";
import { jobReferralStatuses, type JobReferralStatus } from "@/lib/job-referral-schema";
import { getReferralResumeDownloadUrl } from "@/lib/job-referrals.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/referrals/")({
  head: () => ({
    meta: [
      { title: "Candidate Referrals — Nexus Talent Admin" },
      { name: "description", content: "Candidate referrals submitted for job openings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminReferralsPage,
});

const control =
  "rounded-lg border border-primary/10 bg-card px-4 py-2.5 text-sm outline-none focus:border-accent";

function AdminReferralsPage() {
  const queryClient = useQueryClient();
  const referrals = useQuery(adminReferralsQuery);
  const jobs = useQuery(adminJobsQuery);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | JobReferralStatus>("all");
  const [jobId, setJobId] = useState("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: string }) =>
      updateReferral(id, { status: nextStatus }),
    onSuccess: () => {
      toast.success("Referral status updated");
      void queryClient.invalidateQueries({ queryKey: ["admin", "referrals"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReferral(id),
    onSuccess: () => {
      toast.success("Referral deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin", "referrals"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (referrals.data ?? []).filter((row) => {
      const matchesStatus = status === "all" || row.status === status;
      const matchesJob = jobId === "all" || row.job_id === jobId;
      const haystack = [
        row.first_name,
        row.last_name,
        row.email,
        row.phone,
        row.referral_code,
        row.job_title,
        row.jobs?.title,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && matchesJob && (!term || haystack.includes(term));
    });
  }, [referrals.data, search, status, jobId]);

  async function handleDownloadResume(referral: JobReferralRow) {
    if (!referral.resume_path) {
      toast.error("No resume file path stored for this candidate");
      return;
    }
    setDownloadingId(referral.id);
    try {
      // 1. Try server function
      const { url } = await getReferralResumeDownloadUrl({ data: { referralId: referral.id } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // 2. Direct client supabase storage fallback
      try {
        const { data: signed, error: signError } = await supabase.storage
          .from("resumes")
          .createSignedUrl(referral.resume_path, 120, { download: true });
        if (signError || !signed?.signedUrl) {
          throw new Error(signError?.message || "Could not generate resume link");
        }
        window.open(signed.signedUrl, "_blank", "noopener,noreferrer");
      } catch (clientErr: unknown) {
        toast.error(
          clientErr instanceof Error
            ? clientErr.message
            : "Could not open resume. Please try again.",
        );
      }
    } finally {
      setDownloadingId(null);
    }
  }

  function exportCsv() {
    const header = [
      "Referral ID",
      "Candidate Name",
      "Email",
      "Phone",
      "Associated Job",
      "Status",
      "Resume File",
      "Referred Date",
    ];
    const rows = filtered.map((row) => [
      row.referral_code,
      `${row.first_name} ${row.last_name}`,
      row.email,
      row.phone,
      row.jobs?.title ?? row.job_title ?? "",
      row.status,
      row.resume_name,
      new Date(row.created_at).toISOString(),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `referrals-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminShell
      title="Referrals"
      description="Candidate referrals submitted for job openings"
      actions={
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent disabled:opacity-50 cursor-pointer"
        >
          <Download className="size-4" aria-hidden="true" /> Export CSV
        </button>
      }
    >
      {/* Sub-menu / Navigation tabs: Job Applies | Referrals */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-primary/10 pb-4">
        <Link
          to="/admin/job-applies"
          className="inline-flex items-center gap-2.5 rounded-xl border border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:border-primary/10 hover:bg-card hover:text-primary transition-all group"
        >
          <NexusLogo
            size={22}
            showText={false}
            className="rounded-md shadow-sm opacity-80 group-hover:opacity-100"
          />
          <span>Job Applies</span>
        </Link>
        <Link
          to="/admin/referrals"
          className="inline-flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-bold text-accent shadow-sm transition-all"
        >
          <UserPlus className="size-4" />
          <span>Referrals</span>
        </Link>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          maxLength={100}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search candidate name, email, phone, referral ID, or job title"
          className={`min-w-64 flex-1 ${control}`}
        />
        <select
          value={status}
          aria-label="Filter by status"
          onChange={(event) => setStatus(event.target.value as typeof status)}
          className={control}
        >
          <option value="all">All statuses</option>
          {jobReferralStatuses.map((option) => (
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
      </div>

      {/* Table view */}
      <div className="mt-6">
        {referrals.isPending ? (
          <LoadingBlock rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No referrals found"
            hint="Referrals submitted through the 'Refer Someone' button on job details pages will appear here."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-primary/5 bg-card">
            <table className="w-full min-w-[65rem] text-sm">
              <thead className="border-b border-primary/5 text-left text-xs font-bold tracking-widest uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Referred Candidate</th>
                  <th className="px-5 py-4">Referral ID</th>
                  <th className="px-5 py-4">Associated Job</th>
                  <th className="px-5 py-4">Referred On</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Resume</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-primary/[0.02] transition-colors">
                    {/* Candidate Details */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-primary">
                        {row.first_name} {row.last_name}
                      </p>
                      <a
                        href={`mailto:${row.email}`}
                        className="text-xs text-muted-foreground hover:text-accent"
                      >
                        {row.email}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        <a href={`tel:${row.phone}`} className="hover:text-primary">
                          {row.phone}
                        </a>
                      </p>
                    </td>

                    {/* Referral ID */}
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground font-semibold">
                      {row.referral_code}
                    </td>

                    {/* Associated Job */}
                    <td className="px-5 py-4 text-muted-foreground">
                      {row.jobs?.slug ? (
                        <Link
                          to="/careers/$slug"
                          params={{ slug: row.jobs.slug }}
                          target="_blank"
                          className="font-medium text-primary hover:text-accent inline-flex items-center gap-1"
                        >
                          {row.jobs?.title ?? row.job_title}
                          <ExternalLink className="size-3 opacity-60" />
                        </Link>
                      ) : (
                        <span className="font-medium text-primary">
                          {row.jobs?.title ?? row.job_title ?? "—"}
                        </span>
                      )}
                    </td>

                    {/* Referred Date */}
                    <td className="px-5 py-4 text-muted-foreground text-xs">
                      {formatDate(row.created_at)}
                    </td>

                    {/* Status with quick update */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <StatusPill status={row.status} />
                        <select
                          aria-label="Change referral status"
                          value={row.status}
                          disabled={statusMutation.isPending}
                          onChange={(e) =>
                            statusMutation.mutate({ id: row.id, nextStatus: e.target.value })
                          }
                          className="rounded-md border border-primary/10 bg-background px-2 py-1 text-xs outline-none focus:border-accent cursor-pointer"
                        >
                          {jobReferralStatuses.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Resume link/button */}
                    <td className="px-5 py-4">
                      {row.resume_path ? (
                        <button
                          type="button"
                          onClick={() => void handleDownloadResume(row)}
                          disabled={downloadingId === row.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 hover:bg-accent hover:text-accent-foreground px-3.5 py-1.5 text-xs font-semibold text-primary transition-all cursor-pointer disabled:opacity-60"
                        >
                          {downloadingId === row.id ? (
                            <>
                              <Loader2 className="size-3.5 animate-spin" />
                              <span>Opening…</span>
                            </>
                          ) : (
                            <>
                              <FileText className="size-3.5 text-accent" />
                              <span className="truncate max-w-[100px]">{row.resume_name}</span>
                              <Download className="size-3 ml-0.5 opacity-70" />
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No file</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete referral for ${row.first_name} ${row.last_name}?`,
                            )
                          ) {
                            deleteMutation.mutate(row.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        title="Delete referral"
                        className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
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
