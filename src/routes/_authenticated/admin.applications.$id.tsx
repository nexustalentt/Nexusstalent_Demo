import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, EmptyState, LoadingBlock, StatusPill } from "@/components/admin/admin-shell";
import {
  adminApplicationQuery,
  applicationEventsQuery,
  changeApplicationStatus,
  recordAudit,
} from "@/lib/admin-api";
import { supabase } from "@/integrations/supabase/client";
import { applicationStatuses, formatDate, statusLabel, type ApplicationStatus } from "@/lib/job-utils";

export const Route = createFileRoute("/_authenticated/admin/applications/$id")({
  head: () => ({
    meta: [
      { title: "Application Detail — Nexus Talent Admin" },
      { name: "description", content: "Candidate profile, status workflow and internal notes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ApplicationDetail,
});

function ApplicationDetail() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const application = useQuery(adminApplicationQuery(id));
  const events = useQuery(applicationEventsQuery(id));
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (application.data) setNotes(application.data.notes ?? "");
  }, [application.data]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const statusMutation = useMutation({
    mutationFn: (next: ApplicationStatus) => changeApplicationStatus(application.data!, next),
    onSuccess: () => {
      toast.success("Status updated and logged");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const notesMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("applications")
        .update({ notes: notes.slice(0, 4000) })
        .eq("id", id);
      if (error) throw new Error(error.message);
      await recordAudit("application_note_saved", "application", id);
    },
    onSuccess: () => {
      toast.success("Notes saved");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (application.isPending) {
    return (
      <AdminShell title="Application">
        <LoadingBlock rows={6} />
      </AdminShell>
    );
  }

  if (!application.data) {
    return (
      <AdminShell title="Application">
        <EmptyState title="Application not found" hint="It may have been removed." />
      </AdminShell>
    );
  }

  const candidate = application.data;

  return (
    <AdminShell
      title={candidate.candidate_name}
      description={candidate.jobs?.title ?? "General application"}
      actions={
        <Link
          to="/admin/applications"
          className="inline-flex items-center gap-2 rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-primary/5 bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-primary">Candidate details</h2>
              <StatusPill status={candidate.status} />
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2 text-sm">
              <Detail icon={Mail} label="Email" value={candidate.email} />
              <Detail icon={Phone} label="Phone" value={candidate.phone ?? "—"} />
              <Detail icon={MapPin} label="Location" value={candidate.location ?? "—"} />
              <Detail icon={FileText} label="Experience" value={candidate.experience ?? "—"} />
            </dl>
            {candidate.skills.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {candidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {candidate.resume_url ? (
                <a
                  href={candidate.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary px-5 py-2.5 font-bold text-primary-foreground hover:bg-accent"
                >
                  View résumé
                </a>
              ) : null}
              <a
                href={`mailto:${candidate.email}`}
                className="rounded-full border border-primary/10 px-5 py-2.5 font-semibold text-primary hover:border-accent hover:text-accent"
              >
                Email candidate
              </a>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Received {formatDate(candidate.submitted_at)} via {candidate.source.replace(/_/g, " ")}
            </p>
          </section>

          <section className="rounded-2xl border border-primary/5 bg-card p-6">
            <h2 className="font-bold text-primary">Internal notes</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Visible to administrators only. Never shared with candidates.
            </p>
            <textarea
              rows={6}
              value={notes}
              maxLength={4000}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-4 w-full rounded-lg border border-primary/10 bg-background px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => notesMutation.mutate()}
              disabled={notesMutation.isPending}
              className="mt-3 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent disabled:opacity-60"
            >
              Save notes
            </button>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-primary/5 bg-card p-6">
            <h2 className="font-bold text-primary">Status workflow</h2>
            <div className="mt-4 grid gap-2">
              {applicationStatuses.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={statusMutation.isPending || candidate.status === option.value}
                  onClick={() => statusMutation.mutate(option.value)}
                  className={`rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                    candidate.status === option.value
                      ? "bg-primary text-primary-foreground"
                      : "border border-primary/10 text-primary hover:border-accent hover:text-accent"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-primary/5 bg-card p-6">
            <h2 className="font-bold text-primary">History</h2>
            <ul className="mt-4 space-y-4 text-sm">
              {(events.data ?? []).map((event) => (
                <li key={event.id} className="border-l-2 border-accent/30 pl-4">
                  <p className="font-semibold text-primary">
                    {event.old_status ? `${statusLabel(event.old_status)} → ` : ""}
                    {statusLabel(event.new_status)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(event.created_at)}
                    {event.note ? ` · ${event.note}` : ""}
                  </p>
                </li>
              ))}
              {events.data?.length === 0 ? (
                <li className="text-muted-foreground">No status changes yet.</li>
              ) : null}
            </ul>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" /> {label}
      </dt>
      <dd className="mt-1 break-words text-primary">{value}</dd>
    </div>
  );
}
