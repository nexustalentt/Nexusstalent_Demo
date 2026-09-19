import { createServerFn } from "@tanstack/react-start";
import { jobApplicationSchema } from "@/lib/job-application-schema";
import { requireAuthedUser } from "@/lib/staff-auth.middleware";
import { supabase } from "@/integrations/supabase/client";

export const submitJobApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => jobApplicationSchema.parse(data))
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

    const { data: job } = await supabaseClient
      .from("jobs")
      .select("id, title, application_method, status")
      .eq("id", data.job_id)
      .maybeSingle();

    if (!job || job.status !== "active" || job.application_method !== "internal_form") {
      return { ok: false as const, error: "This position is not accepting applications." };
    }

    // 1. Check if the same PAN number already exists in the database
    if (data.pan_number?.trim()) {
      const cleanPan = data.pan_number.trim().toUpperCase();
      const { data: panMatch } = await supabaseClient
        .from("job_applications")
        .select("id")
        .ilike("pan_number", cleanPan)
        .limit(1)
        .maybeSingle();

      if (panMatch) {
        return { ok: false as const, error: "Your application already exists." };
      }
    }

    // 2. Check if the same PAN number + phone number + email address already exists together
    if (data.pan_number?.trim() && data.phone?.trim() && data.email?.trim()) {
      const cleanPan = data.pan_number.trim().toUpperCase();
      const cleanPhone = data.phone.trim();
      const cleanEmail = data.email.trim();

      const { data: comboMatch } = await supabaseClient
        .from("job_applications")
        .select("id")
        .ilike("pan_number", cleanPan)
        .eq("phone", cleanPhone)
        .ilike("email", cleanEmail)
        .limit(1)
        .maybeSingle();

      if (comboMatch) {
        return { ok: false as const, error: "Your application already exists." };
      }
    }

    // 3. Check if email already applied for this job
    const { data: existing } = await supabaseClient
      .from("job_applications")
      .select("id")
      .eq("job_id", job.id)
      .ilike("email", data.email.trim())
      .maybeSingle();
    if (existing) {
      return { ok: false as const, error: "Your application already exists." };
    }

    let resumePath: string | null = null;
    if (data.resume_base64 && data.resume_name) {
      try {
        const base64 = data.resume_base64.includes(",")
          ? data.resume_base64.slice(data.resume_base64.indexOf(",") + 1)
          : data.resume_base64;
        const bytes = Buffer.from(base64, "base64");
        if (bytes.byteLength <= 5 * 1024 * 1024) {
          const safeName = data.resume_name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
          const path = `${job.id}/${Date.now()}-${safeName}`;
          const { error: uploadError } = await supabaseClient.storage
            .from("resumes")
            .upload(path, bytes, { contentType: "application/octet-stream", upsert: false });
          if (!uploadError) {
            resumePath = path;
          } else {
            console.warn("[job-application] resume storage upload note:", uploadError.message);
          }
        }
      } catch (uploadEx) {
        console.warn("[job-application] resume upload warning:", uploadEx);
      }
    }

    const { data: inserted, error } = await supabaseClient
      .from("job_applications")
      .insert({
        job_id: job.id,
        job_title: job.title,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        email: data.email,
        date_of_birth: data.date_of_birth || null,
        gender: data.gender || null,
        current_location: data.current_location || null,
        preferred_location: data.preferred_location || null,
        pan_number: data.pan_number || null,
        highest_qualification: data.highest_qualification,
        specialization: data.specialization || null,
        college: data.college || null,
        marks: data.marks,
        year_of_passing: data.year_of_passing,
        primary_skills: data.primary_skills,
        secondary_skills: data.secondary_skills || null,
        programming_languages: data.programming_languages || null,
        tools_technologies: data.tools_technologies || null,
        certifications: data.certifications || null,
        experience_type: data.experience_type,
        total_experience: data.experience_type === "fresher" ? null : data.total_experience || null,
        relevant_experience:
          data.experience_type === "fresher" ? null : data.relevant_experience || null,
        current_company: data.experience_type === "fresher" ? null : data.current_company || null,
        current_job_title:
          data.experience_type === "fresher" ? null : data.current_job_title || null,
        current_ctc: data.experience_type === "fresher" ? null : data.current_ctc || null,
        expected_ctc: data.expected_ctc || null,
        notice_period: data.experience_type === "fresher" ? null : data.notice_period || null,
        resume_path: resumePath,
        resume_name: data.resume_name,
        linkedin_url: data.linkedin_url || null,
        github_url: data.github_url || null,
        portfolio_url: data.portfolio_url || null,
        willing_to_relocate: data.willing_to_relocate ?? null,
        availability_to_join: data.availability_to_join || null,
        cover_letter: data.cover_letter || null,
        heard_about_us: data.heard_about_us || null,
      })
      .select("id, application_code")
      .single();

    if (error) {
      if (error.code === "23505" || /duplicate|already exists/i.test(error.message)) {
        return { ok: false as const, error: "Your application already exists." };
      }
      console.error("[job-application] insert failed", error.code, error.message);
      return {
        ok: false as const,
        error: `Could not submit your application: ${error.message}`,
      };
    }

    // Notifications must never fail the submission: the application row is already stored.
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
          subject: `New Job Application – ${job.title}`,
          lines: [
            `Application ID: ${inserted.application_code}`,
            `Candidate: ${data.first_name} ${data.last_name}`,
            `Email: ${data.email}`,
            `Phone: ${data.phone}`,
            `Job applied for: ${job.title}`,
          ],
        });
      }
    } catch (notifyError) {
      console.error("[job-application] notification failed", notifyError);
    }

    return { ok: true as const, applicationCode: inserted.application_code };
  });

export const getResumeDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireAuthedUser])
  .inputValidator((data: { applicationId: string }) => ({
    applicationId: String(data.applicationId),
  }))
  .handler(async ({ data, context }) => {
    const { data: application, error } = await context.supabase
      .from("job_applications")
      .select("resume_path")
      .eq("id", data.applicationId)
      .maybeSingle();
    if (error || !application?.resume_path) {
      throw new Error("Resume not available");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("resumes")
      .createSignedUrl(application.resume_path, 120, { download: true });
    if (signError || !signed) throw new Error("Could not create download link");
    return { url: signed.signedUrl };
  });
