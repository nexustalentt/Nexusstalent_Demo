import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { PageHero, PublicShell } from "@/components/site/public-shell";
import { siteSettingsQuery } from "@/lib/queries";
import { submitInquiry } from "@/lib/inquiries.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Nexus Talent — Talk to Our Consultants" },
      {
        name: "description",
        content:
          "Contact Nexus Talent about consulting, staffing or recruitment support. Share your requirement and a consultant will respond within one business day.",
      },
      { property: "og:title", content: "Contact Nexus Talent" },
      {
        property: "og:description",
        content: "Send an inquiry to our consulting and recruitment team.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteSettingsQuery),
  errorComponent: () => (
    <PublicShell>
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold text-primary">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">Please try again in a moment.</p>
      </div>
    </PublicShell>
  ),
  component: ContactPage,
});

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(2000),
});

function ContactPage() {
  const { data: settings } = useSuspenseQuery(siteSettingsQuery);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const parsed = inquirySchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setPending(true);
    try {
      await submitInquiry({ data: parsed.data });
      toast.success("Inquiry sent. Our team will be in touch shortly.");
      form.reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-lg border border-primary/10 bg-background px-4 py-3 text-sm text-primary outline-none focus:border-accent";
  const labelClass = "text-xs font-semibold tracking-widest uppercase text-muted-foreground";

  const details = [
    { label: "Email", value: settings?.company_email },
    { label: "Recruitment", value: settings?.recruitment_email },
    { label: "Phone", value: settings?.phone },
    { label: "Office", value: settings?.address },
    { label: "Business Hours", value: settings?.business_hours },
  ].filter((detail) => Boolean(detail.value));

  return (
    <PublicShell>
      <PageHero
        eyebrow="Contact Us"
        title="Talk to a consultant, not a call centre"
        subtitle="Share your hiring requirement or consulting need and we will respond within one business day."
      />

      <section className="py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-primary/5 bg-card p-8 shadow-card">
            <h2 className="text-xl font-bold text-primary">Send an inquiry</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="name">
                  Name *
                </label>
                <input id="name" name="name" maxLength={100} className={fieldClass} />
                {errors["name"] ? (
                  <p className="mt-1 text-xs text-destructive">{errors["name"]}</p>
                ) : null}
              </div>
              <div>
                <label className={labelClass} htmlFor="email">
                  Email *
                </label>
                <input id="email" name="email" type="email" maxLength={255} className={fieldClass} />
                {errors["email"] ? (
                  <p className="mt-1 text-xs text-destructive">{errors["email"]}</p>
                ) : null}
              </div>
              <div>
                <label className={labelClass} htmlFor="phone">
                  Phone
                </label>
                <input id="phone" name="phone" maxLength={30} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="company">
                  Company
                </label>
                <input id="company" name="company" maxLength={120} className={fieldClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="message">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  maxLength={2000}
                  className={fieldClass}
                />
                {errors["message"] ? (
                  <p className="mt-1 text-xs text-destructive">{errors["message"]}</p>
                ) : null}
              </div>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="mt-8 inline-flex rounded-full bg-accent px-8 py-4 text-sm font-bold text-accent-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {pending ? "Sending…" : "Send Inquiry"}
            </button>
          </form>

          <aside className="h-fit rounded-2xl border border-primary/5 bg-surface p-8">
            <h2 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
              Reach us directly
            </h2>
            <dl className="mt-6 space-y-5">
              {details.map((detail) => (
                <div key={detail.label}>
                  <dt className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                    {detail.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-primary">{detail.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}
