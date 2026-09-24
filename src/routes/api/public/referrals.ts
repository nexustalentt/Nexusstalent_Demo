import { createFileRoute } from "@tanstack/react-router";
import { jobReferralSchema } from "@/lib/job-referral-schema";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/referrals")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }

        const parsed = jobReferralSchema.safeParse(raw);
        if (!parsed.success) {
          return json({ error: "Validation failed", issues: parsed.error.issues }, 400);
        }

        const data = parsed.data;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Verify job
        const { data: job, error: jobError } = await supabaseAdmin
          .from("jobs")
          .select("id, title, status")
          .eq("id", data.job_id)
          .maybeSingle();

        if (jobError || !job) {
          return json({ error: "The selected job was not found." }, 404);
        }

        // Upload resume
        let resumePath: string | null = null;
        if (data.resume_base64 && data.resume_name) {
          try {
            const base64 = data.resume_base64.includes(",")
              ? data.resume_base64.slice(data.resume_base64.indexOf(",") + 1)
              : data.resume_base64;
            const bytes = Buffer.from(base64, "base64");
            if (bytes.byteLength <= 5 * 1024 * 1024) {
              const safeName = data.resume_name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
              const path = `referrals/${job.id}/${Date.now()}-${safeName}`;
              const { error: uploadError } = await supabaseAdmin.storage
                .from("resumes")
                .upload(path, bytes, { contentType: "application/octet-stream", upsert: false });
              if (!uploadError) {
                resumePath = path;
              } else {
                console.warn("[api/referrals] storage upload note:", uploadError.message);
              }
            }
          } catch (uploadEx) {
            console.warn("[api/referrals] storage upload warning:", uploadEx);
          }
        }

        const { data: inserted, error: insertError } = await supabaseAdmin
          .from("job_referrals")
          .insert({
            job_id: job.id,
            job_title: job.title,
            first_name: data.first_name.trim(),
            last_name: data.last_name.trim(),
            phone: data.phone.trim(),
            email: data.email.trim().toLowerCase(),
            resume_name: data.resume_name,
            resume_path: resumePath,
            status: "new",
          })
          .select("id, referral_code")
          .single();

        if (insertError) {
          console.error("[api/referrals] insert failed:", insertError.message);
          return json({ error: `Could not store referral: ${insertError.message}` }, 500);
        }

        // Notification email
        try {
          const { data: settings } = await supabaseAdmin
            .from("site_settings")
            .select("recruitment_email, company_email, notify_on_new_application")
            .maybeSingle();
          const recipient = settings?.recruitment_email ?? settings?.company_email;
          if (recipient && settings?.notify_on_new_application !== false) {
            const { sendNotificationEmail } = await import("@/lib/notifications.server");
            await sendNotificationEmail({
              to: recipient,
              subject: `New Candidate Referral – ${job.title}`,
              lines: [
                `Referral ID: ${inserted.referral_code}`,
                `Referred Candidate: ${data.first_name} ${data.last_name}`,
                `Candidate Email: ${data.email}`,
                `Candidate Phone: ${data.phone}`,
                `Position: ${job.title}`,
              ],
            });
          }
        } catch (notifyErr) {
          console.error("[api/referrals] notification failed:", notifyErr);
        }

        return json({
          ok: true,
          referral_code: inserted.referral_code,
          id: inserted.id,
        });
      },
    },
  },
});
