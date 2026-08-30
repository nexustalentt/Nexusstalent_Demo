import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, LoadingBlock, StatusPill } from "@/components/admin/admin-shell";
import { deleteJobApply, jobApplyQuery, updateJobApply } from "@/lib/admin-api";
import { formatDate } from "@/lib/job-utils";
import {
  jobApplicationStatuses,
  maskPan,
  type JobApplicationStatus,
} from "@/lib/job-application-schema";
import { getResumeDownloadUrl } from "@/lib/job-applications.functions";

export const Route = createFileRoute("/_authenticated/admin/job-applies/$id")({
  head: () => ({
    meta: [
      { title: "Application detail — Nexus Talent Admin" },
      { name: "description", content: "Full candidate application details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: JobApplyDetail,
});

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-primary">{value?.toString().trim() ? value : "—"}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-primary/5 bg-card p-6">
      <h2 className="font-bold text-primary">{title}</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function JobApplyDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const application = useQuery(jobApplyQuery(id));
  const [notes, setNotes] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (application.data) setNotes(application.data.admin_notes ?? "");
  }, [application.data?.id, application.data?.admin_notes]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const statusMutation = useMutation({
    mutationFn: (status: JobApplicationStatus) => updateJobApply(id, { status }),
    onSuccess: () => {
      toast.success("Status updated");
      void invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const notesMutation = useMutation({
    mutationFn: () => updateJobApply(id, { admin_notes: notes.trim() || null }),
    onSuccess: () => {
      toast.success("Notes saved");
      void invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteJobApply(id),
    onSuccess: () => {
      toast.success("Application deleted");
      void invalidate();
      navigate({ to: "/admin/job-applies" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function downloadResume() {
    setDownloading(true);
    try {
      const { url } = await getResumeDownloadUrl({ data: { applicationId: id } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not open the resume");
    } finally {
      setDownloading(false);
    }
  }

  const data = application.data;

  return (
    <AdminShell
      title={data ? `${data.first_name} ${data.last_name}` : "Application"}
      description={data ? `Application ID ${data.application_code}` : undefined}
      actions={
        <Link
          to="/admin/job-applies"
          className="inline-flex items-center gap-2 rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back
        </Link>
      }
    >
      {application.isPending ? (
        <LoadingBlock rows={5} />
      ) : !data ? (
        <p className="text-sm text-muted-foreground">This application no longer exists.</p>
      ) : (
        <div className="space-y-6">
          <section className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-primary/5 bg-card p-6">
            <div className="flex flex-wrap items-center gap-4">
              <StatusPill status={data.status} />
              <select
                aria-label="Change status"
                value={data.status}
                disabled={statusMutation.isPending}
                onChange={(event) =>
                  statusMutation.mutate(event.target.value as JobApplicationStatus)
                }
                className="rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
              >
                {jobApplicationStatuses.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground">
                Applied {formatDate(data.created_at)} for{" "}
                <span className="font-semibold text-primary">
                  {data.jobs?.title ?? data.job_title ?? "—"}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void downloadResume()}
                disabled={downloading}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-accent disabled:opacity-60"
              >
                <Download className="size-4" aria-hidden="true" />
                {downloading ? "Preparing…" : "Resume"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Delete this application permanently?")) {
                    deleteMutation.mutate();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full border border-destructive/20 px-5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/5"
              >
                <Trash2 className="size-4" aria-hidden="true" /> Delete
              </button>
            </div>
          </section>

          <Section title="Personal details">
            <Row label="Full name" value={`${data.first_name} ${data.last_name}`} />
            <Row label="Email" value={data.email} />
            <Row label="Phone" value={data.phone} />
            <Row label="Date of birth" value={formatDate(data.date_of_birth)} />
            <Row label="Gender" value={data.gender} />
            <Row label="Current location" value={data.current_location} />
            <Row label="Preferred location" value={data.preferred_location} />
            <Row label="PAN" value={maskPan(data.pan_number)} />
          </Section>

          <Section title="Education details">
            <Row label="Highest qualification" value={data.highest_qualification} />
            <Row label="Specialization" value={data.specialization} />
            <Row label="College / university" value={data.college} />
            <Row label="Marks / CGPA" value={data.marks} />
            <Row label="Year of passing" value={String(data.year_of_passing ?? "")} />
          </Section>

          <Section title="Technical details">
            <Row label="Primary skills" value={data.primary_skills} />
            <Row label="Secondary skills" value={data.secondary_skills} />
            <Row label="Programming languages" value={data.programming_languages} />
            <Row label="Tools / technologies" value={data.tools_technologies} />
            <Row label="Certifications" value={data.certifications} />
          </Section>

          <Section title="Experience details">
            <Row
              label="Experience type"
              value={data.experience_type === "fresher" ? "Fresher" : "Experienced"}
            />
            <Row label="Total experience" value={data.total_experience} />
            <Row label="Relevant experience" value={data.relevant_experience} />
            <Row label="Current company" value={data.current_company} />
            <Row label="Current job title" value={data.current_job_title} />
            <Row label="Current CTC" value={data.current_ctc} />
            <Row label="Expected CTC" value={data.expected_ctc} />
            <Row label="Notice period" value={data.notice_period} />
          </Section>

          <Section title="Additional details">
            <Row label="Resume" value={data.resume_name} />
            <Row label="LinkedIn" value={data.linkedin_url} />
            <Row label="GitHub" value={data.github_url} />
            <Row label="Portfolio" value={data.portfolio_url} />
            <Row
              label="Willing to relocate"
              value={data.willing_to_relocate == null ? "—" : data.willing_to_relocate ? "Yes" : "No"}
            />
            <Row label="Availability to join" value={data.availability_to_join} />
            <Row label="Heard about us" value={data.heard_about_us} />
          </Section>

          {data.cover_letter ? (
            <section className="rounded-2xl border border-primary/5 bg-card p-6">
              <h2 className="font-bold text-primary">Cover letter</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {data.cover_letter}
              </p>
            </section>
          ) : null}

          <section className="rounded-2xl border border-primary/5 bg-card p-6">
            <h2 className="font-bold text-primary">Internal notes</h2>
            <textarea
              rows={4}
              maxLength={4000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Interview feedback, screening notes…"
              className="mt-4 w-full rounded-lg border border-primary/10 bg-background px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => notesMutation.mutate()}
              disabled={notesMutation.isPending}
              className="mt-4 inline-flex rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground disabled:opacity-60"
            >
              {notesMutation.isPending ? "Saving…" : "Save notes"}
            </button>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
