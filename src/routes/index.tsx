import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-office.jpg";
import { PublicShell } from "@/components/site/public-shell";
import { JobCard } from "@/components/site/job-card";
import { activeJobsQuery, siteSettingsQuery } from "@/lib/queries";
import { services, industries, whyChooseUs, hiringProcess, clients } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexus Talent — Consultancy, Staffing & Recruitment Partners" },
      {
        name: "description",
        content:
          "Nexus Talent helps enterprises build high-performing teams through consulting, staffing, recruitment and managed talent solutions.",
      },
      { property: "og:title", content: "Nexus Talent — Consultancy, Staffing & Recruitment" },
      {
        property: "og:description",
        content:
          "Consulting, staffing, recruitment and talent solutions for large organizations. Explore current opportunities.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(activeJobsQuery),
      context.queryClient.ensureQueryData(siteSettingsQuery),
    ]);
  },
  errorComponent: () => (
    <PublicShell>
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold text-primary">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">Please refresh the page and try again.</p>
      </div>
    </PublicShell>
  ),
  component: HomePage,
});

function HomePage() {
  const { data: jobs } = useSuspenseQuery(activeJobsQuery);
  const { data: settings } = useSuspenseQuery(siteSettingsQuery);
  const latestJobs = jobs.slice(0, 6);

  const stats = [
    { value: settings?.years_experience ?? "15", label: "Years of Experience" },
    { value: settings?.professionals_placed ?? "12,000+", label: "Professionals Placed" },
    { value: settings?.enterprise_clients ?? "500+", label: "Enterprise Clients" },
    { value: settings?.successful_projects ?? "1,200+", label: "Successful Projects" },
  ];

  return (
    <PublicShell>
      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-28 md:pt-20 md:pb-32">
        <div className="container-page">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="animate-fade-up">
              <div className="eyebrow mb-6">Global Recruitment Excellence</div>
              <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight text-primary sm:text-5xl lg:text-6xl">
                Connecting Exceptional <span className="text-accent">Talent</span> With Leading
                Organizations
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                We help organizations build high-performing teams through trusted consulting,
                staffing, recruitment, and talent solutions.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/careers"
                  className="rounded-full bg-accent px-8 py-4 text-sm font-bold text-accent-foreground shadow-accent transition-transform hover:scale-105"
                >
                  Explore Opportunities
                </Link>
                <Link
                  to="/contact"
                  className="rounded-full border border-primary/10 px-8 py-4 text-sm font-bold text-primary transition-colors hover:bg-surface"
                >
                  Partner With Us
                </Link>
              </div>

            </div>

            <div className="relative">
              <img
                src={heroImage}
                alt="Consultants meeting with a client team in a modern office lounge"
                width={1200}
                height={800}
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-elegant outline outline-primary/5"
              />
              <div className="absolute -bottom-6 -left-2 rounded-xl bg-card p-6 shadow-elegant md:-left-6">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-accent">
                    {settings?.enterprise_clients ?? "500+"}
                  </div>
                  <div className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                    Enterprise
                    <br />
                    Clients
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO WE ARE + STATS */}
      <section className="border-y border-primary/5 bg-surface py-24">
        <div className="container-page grid gap-16 lg:grid-cols-2">
          <div>
            <div className="eyebrow mb-6">Who We Are</div>
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              A consultancy built around delivery, not databases
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                Nexus Talent provides professional consultancy, staffing, recruitment and talent
                solutions to organizations that cannot afford a mis-hire. We work as an extension of
                your talent function — with your governance, your tooling and your standards.
              </p>
              <p>
                Every engagement is owned by consultants who have delivered inside large
                enterprises, which is why our shortlists are short and our placements stay.
              </p>
            </div>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-accent"
            >
              More about us <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <dl className="grid grid-cols-2 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-card p-6 shadow-card md:p-8">
                <dt className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="mt-3 text-3xl font-bold text-primary md:text-4xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <div className="eyebrow mb-6">Services</div>
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Talent and consulting capability, delivered end to end
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.slug}
                className="group rounded-2xl border border-primary/5 bg-card p-8 transition-all hover:border-accent/40 hover:shadow-elegant"
              >
                <div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                  {service.title
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <h3 className="text-xl font-bold text-primary">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
                <Link
                  to="/services"
                  hash={service.slug}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent"
                >
                  Learn More <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="border-y border-primary/5 bg-surface py-24">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <div className="eyebrow mb-6">Industries</div>
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Sector knowledge that shortens every search
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((industry) => (
              <div
                key={industry.name}
                className="rounded-2xl bg-card p-6 shadow-card transition-all hover:shadow-elegant"
              >
                <h3 className="text-base font-bold text-primary">{industry.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {industry.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-24">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <div className="eyebrow mb-6">Why Choose Us</div>
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Six reasons enterprise clients stay with us
            </h2>
          </div>
          <div className="grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {whyChooseUs.map((item) => (
              <div key={item.title} className="border-t border-primary/10 pt-6">
                <h3 className="text-base font-bold text-primary">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAREERS PREVIEW */}
      <section className="border-y border-primary/5 bg-surface py-24">
        <div className="container-page">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="eyebrow mb-6">Careers</div>
              <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
                Explore Career Opportunities
              </h2>
              <p className="mt-4 text-muted-foreground">
                Current openings across our client engagements. Apply directly — no account needed.
              </p>
            </div>
            <Link to="/careers" className="text-sm font-bold text-accent underline-offset-8 hover:underline">
              View All Jobs
            </Link>
          </div>

          {latestJobs.length ? (
            <div className="grid gap-6">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-primary/15 bg-card p-12 text-center">
              <p className="font-semibold text-primary">No active jobs available right now.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                New opportunities are published regularly — or write to us and we will keep you in
                mind.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* HIRING PROCESS */}
      <section className="py-24">
        <div className="container-page">
          <div className="mb-16 max-w-2xl">
            <div className="eyebrow mb-6">Hiring Process</div>
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              From first look to first day in five steps
            </h2>
          </div>
          <ol className="grid gap-10 md:grid-cols-3 lg:grid-cols-5">
            {hiringProcess.map((step) => (
              <li key={step.step}>
                <div className="flex size-12 items-center justify-center rounded-full border-2 border-primary text-sm font-bold text-primary">
                  {step.step}
                </div>
                <h3 className="mt-6 text-base font-bold text-primary">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="border-y border-primary/5 bg-surface py-20">
        <div className="container-page">
          <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
            Trusted By Leading Organizations
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {clients.map((client) => (
              <div
                key={client.name}
                className="group flex items-center gap-4 rounded-2xl border border-primary/5 bg-card px-5 py-4 shadow-card transition-all hover:border-accent/40 hover:shadow-elegant"
              >
                <div className="flex h-11 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/5 px-2 text-xs font-bold tracking-tight text-primary transition-colors group-hover:bg-accent/10 group-hover:text-accent">
                  {client.logo ? (
                    <img
                      src={client.logo}
                      alt={`${client.name} logo`}
                      loading="lazy"
                      className="max-h-6 w-full object-contain"
                    />
                  ) : (
                    client.mark
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-primary">{client.name}</p>
                  <p className="truncate text-[11px] tracking-wide uppercase text-muted-foreground">
                    {client.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container-page">
          <div className="rounded-3xl bg-primary p-10 text-primary-foreground md:p-16">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold md:text-4xl">
                  Let's build the team your roadmap needs
                </h2>
                <p className="mt-4 text-primary-foreground/70">
                  Tell us what you are hiring for. A consultant — not a chatbot — will respond within
                  one business day.
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-accent px-8 py-4 text-sm font-bold text-accent-foreground transition-transform hover:scale-105"
              >
                Talk to Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
