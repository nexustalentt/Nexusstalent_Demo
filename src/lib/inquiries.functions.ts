import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
});

export const submitInquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inquirySchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("inquiries").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      message: data.message,
    });
    if (error) throw new Error("Could not save your inquiry");

    const { data: settings } = await supabaseAdmin
      .from("site_settings")
      .select("company_email, recruitment_email")
      .maybeSingle();

    const recipient = settings?.company_email ?? settings?.recruitment_email;
    if (recipient) {
      const { sendNotificationEmail } = await import("./notifications.server");
      await sendNotificationEmail({
        to: recipient,
        subject: `New website inquiry – ${data.name}`,
        lines: [
          `Name: ${data.name}`,
          `Email: ${data.email}`,
          `Phone: ${data.phone || "—"}`,
          `Company: ${data.company || "—"}`,
          "",
          data.message,
        ],
      });
    }

    return { ok: true };
  });
