import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { timingSafeEqual } from "crypto";

/**
 * Application intake endpoint.
 *
 * Google Forms responses land in a Google Sheet; an Apps Script trigger posts
 * each new row here. The same endpoint is reused unchanged if the application
 * method later becomes an internal form, because the contract is the payload
 * below, not Google.
 *
 * Auth: shared token in the `x-intake-token` header (APPLICATION_INTAKE_TOKEN).
 */
const payloadSchema = z.object({
  job_slug: z.string().trim().max(120).optional(),
  job_code: z.string().trim().max(60).optional(),
  candidate_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional(),
  location: z.string().trim().max(120).optional(),
  experience: z.string().trim().max(60).optional(),
  skills: z.union([z.string().max(500), z.array(z.string().max(60)).max(30)]).optional(),
  resume_url: z.string().trim().url().max(500).optional(),
  source: z.string().trim().max(40).optional(),
});

function tokenMatches(provided: string, expected: string) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/applications/intake")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["APPLICATION_INTAKE_TOKEN"];
        const provided = request.headers.get("x-intake-token") ?? "";
        if (!expected || !provided || !tokenMatches(provided, expected)) {
          return json({ error: "Unauthorized" }, 401);
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }

        const parsed = payloadSchema.safeParse(raw);
        if (!parsed.success) {
          return json({ error: "Invalid payload", issues: parsed.error.issues }, 400);
        }
        const data = parsed.data;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let jobId: string | null = null;
        let jobTitle = "General application";
        if (data.job_slug || data.job_code) {
          const query = supabaseAdmin.from("jobs").select("id, title").limit(1);
          const { data: job } = data.job_slug
            ? await query.eq("slug", data.job_slug).maybeSingle()
            : await query.eq("job_code", data.job_code!).maybeSingle();
          if (job) {
            jobId = job.id;
            jobTitle = job.title;
          }
        }

        const skills = Array.isArray(data.skills)
          ? data.skills
          : (data.skills ?? "")
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean);

        const { data: application, error } = await supabaseAdmin
          .from("applications")
          .insert({
            job_id: jobId,
            candidate_name: data.candidate_name,
            email: data.email,
            phone: data.phone ?? null,
            location: data.location ?? null,
            experience: data.experience ?? null,
            skills,
            resume_url: data.resume_url ?? null,
            source: data.source ?? "google_form",
          })
          .select("id, submitted_at")
          .single();

        if (error) {
          console.error("[intake] insert failed", error.message);
          return json({ error: "Could not store application" }, 500);
        }

        await supabaseAdmin.from("application_events").insert({
          application_id: application.id,
          new_status: "new",
          note: `Received via ${data.source ?? "google_form"}`,
        });

        const { data: settings } = await supabaseAdmin
          .from("site_settings")
          .select("recruitment_email, company_email, notify_on_new_application")
          .maybeSingle();

        const recipient = settings?.recruitment_email ?? settings?.company_email;
        if (recipient && settings?.notify_on_new_application !== false) {
          const origin = new URL(request.url).origin;
          const { sendNotificationEmail } = await import("@/lib/notifications.server");
          await sendNotificationEmail({
            to: recipient,
            subject: `New Job Application – ${jobTitle}`,
            lines: [
              `Candidate: ${data.candidate_name}`,
              `Email: ${data.email}`,
              `Phone: ${data.phone ?? "—"}`,
              `Job applied for: ${jobTitle}`,
              `Application date: ${new Date(application.submitted_at).toUTCString()}`,
              `Review it here: ${origin}/admin/applications/${application.id}`,
            ],
          });
        }

        return json({ ok: true, application_id: application.id });
      },
    },
  },
});
