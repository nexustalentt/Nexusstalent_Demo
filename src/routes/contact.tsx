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
        <h1 className="text-2xl font-light text-[#161616]">Something went wrong</h1>
        <p className="mt-2 text-[#525252]">Please try again in a moment.</p>
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
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500";
  const labelClass = "text-xs font-semibold uppercase tracking-wider text-slate-600";

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
        eyebrow="Get In Touch"
        title={
          <>
            Talk to a consultant,{" "}
            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              not a call centre
            </span>
          </>
        }
        subtitle="Share your hiring requirement or consulting need and we will respond within one business day."
      />

      <section className="py-20 bg-white">
        <div className="container-page grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900">Send an inquiry</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="name">
                  Name *
                </label>
                <input id="name" name="name" maxLength={100} className={fieldClass} />
                {errors["name"] ? (
                  <p className="mt-1 text-xs text-red-600">{errors["name"]}</p>
                ) : null}
              </div>
              <div>
                <label className={labelClass} htmlFor="email">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  maxLength={255}
                  className={fieldClass}
                />
                {errors["email"] ? (
                  <p className="mt-1 text-xs text-red-600">{errors["email"]}</p>
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
                  <p className="mt-1 text-xs text-red-600">{errors["message"]}</p>
                ) : null}
              </div>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="btn-liquid-primary mt-8 inline-flex h-11 items-center justify-center px-8 text-sm font-semibold disabled:opacity-60 cursor-pointer"
            >
              <span className="btn-content-wrap">
                {pending ? "Sending…" : "Send Inquiry"}
              </span>
            </button>
          </form>

          <aside className="h-fit rounded-2xl border border-slate-200/80 bg-slate-50/70 p-8 shadow-sm backdrop-blur-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Reach us directly
            </h2>
            <dl className="mt-6 space-y-5">
              {details.map((detail) => (
                <div key={detail.label} className="border-b border-slate-200/70 pb-4 last:border-b-0">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    {detail.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">{detail.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}
