import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Globe,
  Layout,
  Smartphone,
  Search,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Monitor,
  Cpu,
  Check,
  Building2,
  Utensils,
  Store,
  Rocket,
  Briefcase,
} from "lucide-react";
import { PublicShell } from "@/components/site/public-shell";
import { DigitalShowcase } from "@/components/site/digital-showcase";
import { digitalServices, builtProducts, targetAudiences, digitalProcessSteps } from "@/lib/content";
import { submitInquiry } from "@/lib/inquiries.functions";

export const Route = createFileRoute("/for-businesses")({
  head: () => ({
    meta: [
      { title: "For Businesses — Websites, Products & Digital Growth | Nexus Talent" },
      {
        name: "description",
        content:
          "Helping businesses build, launch and grow online. We develop professional websites, web applications, custom digital products and growth solutions for small businesses and startups.",
      },
      { property: "og:title", content: "Nexus Digital — Helping Businesses Build, Launch & Grow" },
      {
        property: "og:description",
        content:
          "From business websites to custom web applications and small business digital solutions. We don't just consult. We build.",
      },
    ],
  }),
  component: ForBusinessesPage,
});

const serviceIcons: Record<string, React.ElementType> = {
  Globe,
  Layout,
  Smartphone,
  Search,
  TrendingUp,
  ShieldCheck,
  Monitor,
  Layers,
  Sparkles,
  Cpu,
  Utensils,
  Store,
  Rocket,
  Briefcase,
};

const projectSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  projectType: z.string().min(1, "Select a project category"),
  timeline: z.string().optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please describe your project or business requirements (10+ characters)").max(2000),
});

function ForBusinessesPage() {
  const [selectedProjectType, setSelectedProjectType] = useState("Business Website");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const projectTypes = [
    "Business Website",
    "Web Application",
    "Custom Software",
    "Website Redesign & SEO",
    "Digital Maintenance & Growth",
  ];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const values = {
      name: (formData.get("name") as string) || "",
      email: (formData.get("email") as string) || "",
      phone: (formData.get("phone") as string) || "",
      company: (formData.get("company") as string) || "",
      projectType: selectedProjectType,
      timeline: (formData.get("timeline") as string) || "",
      message: (formData.get("message") as string) || "",
    };

    const parsed = projectSchema.safeParse(values);
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

    const formattedMessage = [
      `[PROJECT INQUIRY: FOR BUSINESSES]`,
      `Project Category: ${parsed.data.projectType}`,
      parsed.data.timeline ? `Desired Timeline: ${parsed.data.timeline}` : null,
      `-----------------------------------------`,
      parsed.data.message,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await submitInquiry({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone || "",
          company: parsed.data.company || "",
          message: formattedMessage,
        },
      });
      toast.success("Project brief received! Our digital team will contact you within 24 hours.");
      form.reset();
    } catch {
      toast.error("Could not submit your project inquiry. Please try again or reach out directly.");
    } finally {
      setPending(false);
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-lg border border-primary/10 bg-background px-4 py-3 text-sm text-primary outline-none focus:border-accent";
  const labelClass = "text-xs font-semibold tracking-widest uppercase text-muted-foreground";

  return (
    <PublicShell>
      {/* PAGE HERO */}
      <section className="relative overflow-hidden border-b border-primary/5 bg-surface/40 py-20 md:py-28">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <div className="eyebrow mb-6">
              <Sparkles className="mr-1.5 size-3.5" /> Nexus Digital · Built For Growth
            </div>
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-primary sm:text-5xl md:text-6xl">
              Helping Businesses Build, Launch & Grow
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
              Whether you need a professional website, a custom digital product, or a complete
              technology solution for your business, Nexus Talent helps you turn your idea into
              something real.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="#start-project"
                className="rounded-full bg-accent px-8 py-4 text-sm font-bold text-accent-foreground shadow-accent transition-transform hover:scale-105"
              >
                Start Your Project
              </a>
              <a
                href="#solutions"
                className="rounded-full border border-primary/15 bg-card px-8 py-4 text-sm font-bold text-primary transition-colors hover:bg-surface"
              >
                Explore Digital Solutions
              </a>
            </div>
          </div>

          {/* Interactive Mockup Preview */}
          <div className="mt-16 md:mt-20">
            <DigitalShowcase />
          </div>
        </div>
      </section>

      {/* DUAL DIVISION ARCHITECTURE */}
      <section className="border-b border-primary/5 bg-background py-16">
        <div className="container-page">
          <div className="mx-auto max-w-4xl rounded-2xl border border-primary/10 bg-surface p-6 sm:p-8 md:p-10 shadow-card">
            <div className="grid gap-8 md:grid-cols-2 md:divide-x md:divide-primary/10">
              <div className="pr-0 md:pr-8">
                <div className="flex items-center gap-2">
                  <Building2 className="size-5 text-primary" />
                  <span className="font-bold text-primary">Nexus Talent</span>
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Consulting · Staffing · Enterprise Recruitment
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  High-level workforce planning, senior recruitment, IT advisory, and augmentation for
                  enterprises and expanding organisations.
                </p>
              </div>

              <div className="pt-6 md:pt-0 md:pl-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-accent" />
                  <span className="font-bold text-accent">Nexus Digital</span>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                    Digital Studio
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Websites · Products · Digital Solutions · Growth
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Purpose-built for small businesses, startups, and founders who need high-performance
                  websites and digital products without large-agency complexity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WE DON'T JUST CONSULT. WE BUILD. */}
      <section id="products" className="py-24">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <div className="eyebrow mb-6">Product & Software Engineering</div>
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              We Don't Just Consult. We Build.
            </h2>
            <p className="mt-4 text-muted-foreground">
              We turn ideas into real digital products. From business websites and web applications
              to custom software solutions, we design, develop and deliver technology that solves
              real business problems.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {builtProducts.map((product) => {
              const Icon = serviceIcons[product.iconName] ?? Layers;
              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-primary/10 bg-card p-6 shadow-card transition-all hover:border-accent/40 hover:shadow-elegant"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                        <Icon className="size-6" />
                      </div>
                      <span className="rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary">
                        {product.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-primary">{product.title}</h3>
                    <p className="text-xs font-medium text-accent">{product.subtitle}</p>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {product.description}
                    </p>

                    <div className="mt-6 border-t border-primary/5 pt-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Deliverables
                      </p>
                      <ul className="mt-2.5 space-y-1.5">
                        {product.deliverables.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <Check className="size-3.5 text-accent shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <a
                    href="#start-project"
                    onClick={() => setSelectedProjectType(product.title)}
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-accent group-hover:underline"
                  >
                    Build With Us <ArrowRight className="size-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SMALL BUSINESS SOLUTIONS GRID */}
      <section id="solutions" className="border-y border-primary/5 bg-surface/50 py-24">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <div className="eyebrow mb-6">Small Business Digital Solutions</div>
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Simple, Powerful Technology For Modern Small Businesses
            </h2>
            <p className="mt-4 text-muted-foreground">
              We help small businesses build a strong online presence with modern, professional, and
              affordable digital solutions. From designing your website to getting it live, we
              provide simple technology solutions that help your business reach more customers and
              grow online.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {digitalServices.map((service) => {
              const Icon = serviceIcons[service.iconName] ?? Globe;
              return (
                <div
                  key={service.id}
                  className="rounded-2xl border border-primary/10 bg-card p-6 shadow-card transition-all hover:border-accent/40 hover:shadow-elegant"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-primary">{service.title}</h3>
                  <p className="text-xs font-medium text-accent">{service.tagline}</p>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {service.description}
                  </p>

                  <div className="mt-5 border-t border-primary/5 pt-4">
                    <ul className="space-y-1.5">
                      {service.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BUILT FOR SMALL BUSINESSES */}
      <section className="py-24">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <div className="eyebrow mb-6">Who We Help</div>
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Built for Small Businesses & Founders
            </h2>
            <p className="mt-4 text-muted-foreground">
              From local businesses and service providers to startups and growing companies, we
              create affordable digital solutions without the complexity of working with a large
              agency.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {targetAudiences.map((audience) => {
              const Icon = serviceIcons[audience.iconName] ?? Store;
              return (
                <div
                  key={audience.id}
                  className="rounded-2xl border border-primary/10 bg-card p-6 shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {audience.category}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-primary">{audience.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {audience.description}
                  </p>
                  <div className="mt-4 border-t border-primary/5 pt-3">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">
                      Key Capabilities:
                    </p>
                    <ul className="space-y-1 text-[11px] text-muted-foreground">
                      {audience.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-1.5">
                          <span className="size-1 rounded-full bg-accent shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5-STEP PROCESS: FROM IDEA TO ONLINE */}
      <section className="border-y border-primary/5 bg-surface/50 py-24">
        <div className="container-page">
          <div className="mb-16 max-w-2xl">
            <div className="eyebrow mb-6">Delivery Framework</div>
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              From Idea to Online in Five Steps
            </h2>
            <p className="mt-4 text-muted-foreground">
              A transparent, predictable process designed to get your business website or digital
              solution launched with zero friction.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {digitalProcessSteps.map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-primary/10 bg-card p-6 shadow-card"
              >
                <div className="flex size-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {step.step}
                </div>
                <h3 className="mt-5 text-base font-bold text-primary">{step.name}</h3>
                <p className="text-xs font-semibold text-accent">{step.title}</p>
                <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* START YOUR PROJECT FORM SECTION */}
      <section id="start-project" className="scroll-mt-24 py-24">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-6">
              <div className="eyebrow">Start Your Project</div>
              <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Let's Build Something That Works for Your Business
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Tell us about your business, the website or digital solution you need, and your
                timeline. We'll review your project and get back with a clear plan, timeframe, and
                quote within one business day.
              </p>

              <div className="space-y-4 rounded-2xl border border-primary/10 bg-surface p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  What you can expect:
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-accent shrink-0" />
                    <span>Direct discussion with developers and digital creators</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-accent shrink-0" />
                    <span>Transparent pricing without hidden retainers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-accent shrink-0" />
                    <span>Rapid development with mobile-first responsiveness</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-accent shrink-0" />
                    <span>Post-launch warranty, hosting support, and training</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-2xl border border-primary/10 bg-card p-8 shadow-card sm:p-10"
              >
                <h3 className="text-xl font-bold text-primary">Project Intake Form</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Fill in your details to start the conversation.
                </p>

                {/* Project Category Pills */}
                <div className="mt-6">
                  <label className={labelClass}>Select Project Category *</label>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {projectTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedProjectType(type)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                          selectedProjectType === type
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "border border-primary/10 bg-surface text-muted-foreground hover:text-primary"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="name">
                      Your Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      placeholder="e.g. David Vance"
                      maxLength={100}
                      className={fieldClass}
                    />
                    {errors["name"] && (
                      <p className="mt-1 text-xs text-destructive">{errors["name"]}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="email">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="e.g. david@business.com"
                      maxLength={255}
                      className={fieldClass}
                    />
                    {errors["email"] && (
                      <p className="mt-1 text-xs text-destructive">{errors["email"]}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="phone">
                      Phone / WhatsApp
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      placeholder="+91 or international"
                      maxLength={30}
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="company">
                      Business or Company Name
                    </label>
                    <input
                      id="company"
                      name="company"
                      placeholder="e.g. Artisan Kitchen"
                      maxLength={120}
                      className={fieldClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="timeline">
                      Expected Timeline
                    </label>
                    <select id="timeline" name="timeline" className={fieldClass}>
                      <option value="Ready to start immediately">Ready to start immediately (1–2 weeks)</option>
                      <option value="Within 1 month">Within this month (2–4 weeks)</option>
                      <option value="Within 2-3 months">In next 2–3 months</option>
                      <option value="Exploring & Planning">Just exploring ideas & estimates</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="message">
                      Project Brief / Goals *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="Describe your business, what you'd like your website/product to achieve, and any specific requirements or links to references..."
                      maxLength={2000}
                      className={fieldClass}
                    />
                    {errors["message"] && (
                      <p className="mt-1 text-xs text-destructive">{errors["message"]}</p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex rounded-full bg-accent px-8 py-4 text-sm font-bold text-accent-foreground shadow-accent transition-transform hover:scale-[1.02] disabled:opacity-60"
                  >
                    {pending ? "Submitting Brief…" : "Start Your Project →"}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Zero spam guarantee · Direct human response
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
