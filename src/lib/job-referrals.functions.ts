import { createServerFn } from "@tanstack/react-start";
import { jobReferralSchema } from "@/lib/job-referral-schema";
import { requireAuthedUser } from "@/lib/staff-auth.middleware";
import { supabase } from "@/integrations/supabase/client";

export const submitJobReferral = createServerFn({ method: "POST" })
  .validator((data: unknown) => jobReferralSchema.parse(data))
  .handler(async ({ data }) => {
    // Prefer supabaseAdmin if service role / secret key is configured, else use client
    let supabaseClient = supabase;
    if (process.env["SUPABASE_SERVICE_ROLE_KEY"] || process.env["SUPABASE_SECRET_KEY"]) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        supabaseClient = supabaseAdmin;
      } catch {
        supabaseClient = supabase;
      }
    }

    // Verify job exists
    const { data: job, error: jobError } = await supabaseClient
      .from("jobs")
      .select("id, title, status")
      .eq("id", data.job_id)
      .maybeSingle();

    if (jobError || !job) {
      return { ok: false as const, error: "The selected job was not found." };
    }

    // Store resume in Supabase Storage using the same storage logic as applications
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
          const { error: uploadError } = await supabaseClient.storage
            .from("resumes")
            .upload(path, bytes, { contentType: "application/octet-stream", upsert: false });
          if (!uploadError) {
            resumePath = path;
          } else {
            console.warn("[job-referral] resume storage upload note:", uploadError.message);
          }
        }
      } catch (uploadEx) {
        console.warn("[job-referral] resume upload warning:", uploadEx);
      }
    }

    // Insert referral into job_referrals
    const { data: inserted, error: insertError } = await supabaseClient
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
      console.error("[job-referral] insert failed:", insertError.code, insertError.message);
      return {
        ok: false as const,
        error: `Could not submit referral: ${insertError.message}`,
      };
    }

    // Non-blocking notification email
    try {
      const { data: settings } = await supabaseClient
        .from("site_settings")
        .select("recruitment_email, company_email, notify_on_new_application")
        .maybeSingle();
      const recipient = settings?.recruitment_email ?? settings?.company_email;
      if (recipient && settings?.notify_on_new_application !== false) {
        const { sendNotificationEmail } = await import("./notifications.server");
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
    } catch (notifyError) {
      console.error("[job-referral] notification note:", notifyError);
    }

    return { ok: true as const, referralCode: inserted.referral_code };
  });

export const getReferralResumeDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireAuthedUser])
  .validator((data: { referralId: string }) => ({
    referralId: String(data.referralId),
  }))
  .handler(async ({ data, context }) => {
    const { data: referral, error } = await context.supabase
      .from("job_referrals")
      .select("resume_path")
      .eq("id", data.referralId)
      .maybeSingle();

    if (error || !referral?.resume_path) {
      throw new Error("Resume not available");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("resumes")
      .createSignedUrl(referral.resume_path, 120, { download: true });

    if (signError || !signed) throw new Error("Could not create download link");
    return { url: signed.signedUrl };
  });
