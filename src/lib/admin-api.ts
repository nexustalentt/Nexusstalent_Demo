import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { ApplicationStatus, JobStatus } from "./job-utils";

export type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
export type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];
export type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];
export type FormRow = Database["public"]["Tables"]["forms"]["Row"];
export type SettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

export const adminJobsQuery = queryOptions({
  queryKey: ["admin", "jobs"],
  queryFn: async () =>
    unwrap(await supabase.from("jobs").select("*").order("updated_at", { ascending: false })),
});

export const adminJobQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin", "job", id],
    queryFn: async () => unwrap(await supabase.from("jobs").select("*").eq("id", id).maybeSingle()),
  });

export const adminApplicationsQuery = queryOptions({
  queryKey: ["admin", "applications"],
  queryFn: async () =>
    unwrap(
      await supabase
        .from("applications")
        .select("*, jobs(title, slug)")
        .order("submitted_at", { ascending: false }),
    ) as (ApplicationRow & { jobs: { title: string; slug: string } | null })[],
});

export const adminApplicationQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin", "application", id],
    queryFn: async () =>
      unwrap(
        await supabase.from("applications").select("*, jobs(title, slug)").eq("id", id).maybeSingle(),
      ) as (ApplicationRow & { jobs: { title: string; slug: string } | null }) | null,
  });

export const applicationEventsQuery = (applicationId: string) =>
  queryOptions({
    queryKey: ["admin", "application-events", applicationId],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("application_events")
          .select("*")
          .eq("application_id", applicationId)
          .order("created_at", { ascending: false }),
      ),
  });

export const adminFormsQuery = queryOptions({
  queryKey: ["admin", "forms"],
  queryFn: async () =>
    unwrap(await supabase.from("forms").select("*").order("created_at", { ascending: false })),
});

export const adminSettingsQuery = queryOptions({
  queryKey: ["admin", "settings"],
  queryFn: async () => unwrap(await supabase.from("site_settings").select("*").maybeSingle()),
});

export const auditLogsQuery = queryOptions({
  queryKey: ["admin", "audit"],
  queryFn: async () =>
    unwrap(
      await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50),
    ),
});

export async function recordAudit(
  action: string,
  entityType: string,
  entityId: string | null,
  details?: Record<string, unknown>,
) {
  const { data } = await supabase.auth.getUser();
  await supabase.from("audit_logs").insert({
    action,
    entity_type: entityType,
    entity_id: entityId,
    actor_id: data.user?.id ?? null,
    actor_email: data.user?.email ?? null,
    details: (details ?? null) as never,
  });
}

export async function setJobStatus(job: JobRow, status: JobStatus) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("jobs")
    .update({
      status,
      updated_by: userData.user?.id ?? null,
      published_at: status === "active" ? (job.published_at ?? new Date().toISOString()) : job.published_at,
    })
    .eq("id", job.id);
  if (error) throw new Error(error.message);
  await recordAudit(`job_${status}`, "job", job.id, { title: job.title });
}

export async function deleteJob(job: JobRow) {
  const { error } = await supabase.from("jobs").delete().eq("id", job.id);
  if (error) throw new Error(error.message);
  await recordAudit("job_deleted", "job", job.id, { title: job.title });
}

export async function changeApplicationStatus(
  application: ApplicationRow,
  status: ApplicationStatus,
) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("applications").update({ status }).eq("id", application.id);
  if (error) throw new Error(error.message);
  await supabase.from("application_events").insert({
    application_id: application.id,
    old_status: application.status,
    new_status: status,
    changed_by: userData.user?.id ?? null,
    note: userData.user?.email ? `Changed by ${userData.user.email}` : null,
  });
  await recordAudit("application_status_changed", "application", application.id, {
    from: application.status,
    to: status,
  });
}
