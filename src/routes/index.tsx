import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Download,
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
  Check,
  CheckCircle2,
  Utensils,
  Store,
  Rocket,
  Briefcase,
} from "lucide-react";
import heroImage from "@/assets/hero-office.jpg";
import { PublicShell } from "@/components/site/public-shell";
import { JobCard } from "@/components/site/job-card";
import { DigitalShowcase } from "@/components/site/digital-showcase";
import { activeJobsQuery, siteSettingsQuery } from "@/lib/queries";
import {
  services,
  industries,
  whyChooseUs,
  hiringProcess,
  clients,
  digitalServices,
  builtProducts,
  targetAudiences,
  digitalProcessSteps,
} from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexus Talent — We Consult. We Build. We Help Businesses Grow." },
      {
        name: "description",
        content:
          "Technology consulting, talent solutions, product development and digital experiences — helping businesses turn ideas into real-world solutions.",
      },
      {
        property: "og:title",
        content: "Nexus Talent — We Consult. We Build. We Help Businesses Grow.",
      },
      {
        property: "og:description",
        content:
          "From technology consulting and talent solutions to building products, websites, and digital experiences, we help businesses turn ideas into real solutions.",
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

function HomePage() {
  const { data: jobs } = useSuspenseQuery(activeJobsQuery);
  const { data: settings } = useSuspenseQuery(siteSettingsQuery);
  const latestJobs = (jobs ?? []).slice(0, 6);

  const zoziiDownloadUrl = "/api/public/zozii-download";
  const zoziiVersion = settings?.zozii_version?.trim() || "v1.09.01";

  const stats = [
    { value: settings?.years_experience ?? "15", label: "Years of Experience" },
    { value: settings?.professionals_placed ?? "12,000+", label: "Professionals Placed" },
    { value: settings?.enterprise_clients ?? "500+", label: "Enterprise Clients" },
    { value: settings?.successful_projects ?? "1,200+", label: "Successful Projects" },
  ];

  return (
    <PublicShell>
      {/* HERO: IMPROVED TO COMMUNICATE CONSULTING + BUILDING + SMALL BUSINESS DIGITAL GROWTH */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-20 md:pb-28">
        <div className="container-page">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="animate-fade-up">
              <div className="eyebrow mb-6">
                <Sparkles className="mr-1.5 size-3 text-accent" />
                We Consult · We Build · We Help Businesses Grow
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight text-primary sm:text-5xl lg:text-6xl">
                We Don't Just Consult. <span className="text-accent">We Build.</span>
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                From technology consulting and talent solutions to building products, websites, and
                digital experiences, we help businesses turn ideas into real solutions and grow in
                the digital world.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-105 hover:bg-accent"
                >
                  Work With Us
                </Link>
                <Link
                  to="/for-businesses"
                  className="rounded-full bg-accent px-8 py-4 text-sm font-bold text-accent-foreground shadow-accent transition-transform hover:scale-105"
                >
                  Build Your Business Online →
                </Link>
              </div>

              {/* Service Pillars Mini Bar */}
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-primary/10 pt-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-primary">
                  <CheckCircle2 className="size-4 text-accent" /> Talent & IT Consulting
                </span>
                <span className="flex items-center gap-1.5 font-medium text-primary">
                  <CheckCircle2 className="size-4 text-accent" /> Custom Product Development
                </span>
                <span className="flex items-center gap-1.5 font-medium text-primary">
                  <CheckCircle2 className="size-4 text-accent" /> Small Business Websites
                </span>
              </div>
            </div>

            <div className="relative">
              <img
                src={heroImage}
                alt="Nexus Talent consultants and engineers collaborating in a modern office"
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

              {/* Digital Solutions Floating Badge */}
              <div className="absolute -top-4 -right-2 rounded-xl border border-primary/10 bg-card p-4 shadow-elegant md:-right-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Globe className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary">Nexus Digital</div>
                    <div className="text-[10px] text-muted-foreground">
                      Websites & Digital Growth
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS + CREDIBILITY */}
      <section className="border-y border-primary/5 bg-surface py-20">
        <div className="container-page grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="eyebrow mb-6">Who We Are</div>
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              A modern technology and talent partner built around delivery
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                Nexus Talent bridges the gap between advisory and real-world execution. We provide
                enterprise consulting, talent solutions, and hands-on digital engineering to help
                companies build great teams and launch modern technology.
              </p>
              <p>
                Whether you need dedicated IT talent to scale an enterprise roadmap or a rapid
                digital presence to grow your business, we own the outcome with transparency and
                care.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:underline"
              >
                More about us <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link
                to="/for-businesses"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-accent"
              >
                Explore business solutions <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
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

      {/* SECTION 2: HAVE A BUSINESS? WE'LL HELP YOU GO DIGITAL. */}
      <section className="py-24">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-card via-surface to-accent/5 p-8 md:p-14 shadow-elegant">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              <div className="space-y-6 lg:col-span-6">
                <div className="eyebrow bg-background">Go Digital With Nexus</div>
                <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">
                  Have a Business? We'll Help You Go Digital.
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Whether you're starting a new business or already running one, we help you build a
                  professional online presence. From websites and landing pages to digital solutions
                  and ongoing support, we create technology that helps your business reach more
                  customers and grow.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Link
                    to="/for-businesses"
                    hash="start-project"
                    className="rounded-full bg-accent px-8 py-4 text-sm font-bold text-accent-foreground shadow-accent transition-transform hover:scale-105"
                  >
                    Build Your Website
                  </Link>
                  <Link
                    to="/contact"
                    className="rounded-full border border-primary/15 bg-card px-8 py-4 text-sm font-bold text-primary transition-colors hover:bg-surface"
                  >
                    Talk to Us
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/10 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Mobile-first & SEO optimized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Launch in 7–14 business days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Transparent, affordable pricing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Full maintenance & support</span>
                  </div>
                </div>
              </div>

              {/* Interactive Showcase Preview */}
              <div className="lg:col-span-6">
                <DigitalShowcase />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: WE DON'T JUST CONSULT. WE BUILD. (PRODUCT SHOWCASE) */}
      <section className="border-t border-primary/5 bg-surface/40 py-24">
        <div className="container-page">
          <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="eyebrow mb-6">Product & Software Engineering</div>
              <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
                We Don't Just Consult. We Build.
              </h2>
              <p className="mt-4 text-muted-foreground">
                We turn ideas into real digital products. From business websites and web
                applications to custom software solutions, we design, develop and deliver technology
                that solves real business problems.
              </p>
            </div>
            <Link
              to="/for-businesses"
              className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:underline"
            >
              Explore all product capabilities <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {builtProducts.map((product) => {
              const Icon = serviceIcons[product.iconName] ?? Layers;
              return (
                <div
                  key={product.id}
                  className="group flex flex-col justify-between rounded-2xl border border-primary/10 bg-card p-6 shadow-card transition-all hover:border-accent/40 hover:shadow-elegant"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                        <Icon className="size-5" />
                      </div>
                      <span className="rounded-full bg-primary/5 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                        {product.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-primary">{product.title}</h3>
                    <p className="text-xs font-medium text-accent">{product.subtitle}</p>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {product.description}
                    </p>

                    <div className="mt-5 border-t border-primary/5 pt-3">
                      <ul className="space-y-1.5">
                        {product.deliverables.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 text-[11px] text-muted-foreground"
                          >
                            <Check className="size-3 text-accent shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Link
                    to="/for-businesses"
                    hash="start-project"
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-accent group-hover:underline"
                  >
                    Build With Us →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: SMALL BUSINESS WEBSITE & DIGITAL SOLUTIONS */}
      <section className="py-24">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <div className="eyebrow mb-6">Dedicated Service Suite</div>
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Small Business Website & Digital Solutions
            </h2>
            <p className="mt-4 text-muted-foreground">
              We help small businesses build a strong online presence with modern, professional, and
              affordable digital solutions. From designing your website to getting it live, we
              provide simple technology solutions that help your business reach more customers and
              grow online.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {digitalServices.map((service) => {
              const Icon = serviceIcons[service.iconName] ?? Globe;
              return (
                <article
                  key={service.id}
                  className="rounded-2xl border border-primary/10 bg-card p-8 shadow-card transition-all hover:border-accent/40 hover:shadow-elegant"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-primary">{service.title}</h3>
                  <p className="text-xs font-semibold text-accent">{service.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>

                  <div className="mt-6 border-t border-primary/5 pt-4">
                    <ul className="space-y-2">
                      {service.highlights.map((h) => (
                        <li
                          key={h}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/for-businesses"
                    hash="start-project"
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                  >
                    Get Started <ArrowRight className="size-3.5" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: BUILT FOR SMALL BUSINESSES */}
      <section className="border-y border-primary/5 bg-surface/50 py-24">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <div className="eyebrow mb-6">Targeted Solutions</div>
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Built for Small Businesses
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
                  className="rounded-2xl border border-primary/10 bg-card p-6 shadow-card transition-all hover:border-accent/40 hover:shadow-elegant"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {audience.category}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-primary">{audience.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {audience.description}
                  </p>

                  <div className="mt-5 border-t border-primary/5 pt-3">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">
                      Features Included:
                    </p>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {audience.features.map((f) => (
                        <li key={f} className="flex items-center gap-1.5">
                          <span className="size-1 rounded-full bg-accent shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/for-businesses"
                    hash="start-project"
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                  >
                    Build for this <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6: FROM IDEA TO ONLINE PROCESS */}
      <section className="py-24">
        <div className="container-page">
          <div className="mb-16 max-w-2xl">
            <div className="eyebrow mb-6">Our Process</div>
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              From Idea to Online in 5 Simple Steps
            </h2>
            <p className="mt-4 text-muted-foreground">
              How Nexus Talent and Nexus Digital take you from concept to a live, revenue-generating
              digital presence.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {digitalProcessSteps.map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-primary/10 bg-card p-6 shadow-card"
              >
                <div className="flex size-11 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {step.step}
                </div>
                <h3 className="mt-6 text-base font-bold text-primary">{step.name}</h3>
                <p className="text-xs font-semibold text-accent">{step.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENTERPRISE CORE SERVICES (PRESERVED) */}
      <section className="border-t border-primary/5 bg-surface/40 py-24">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <div className="eyebrow mb-6">Enterprise Services</div>
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Talent and consulting capability, delivered end to end
            </h2>
            <p className="mt-4 text-muted-foreground">
              Trusted staffing, talent acquisition, and managed consulting solutions for enterprise
              teams.
            </p>
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

      {/* INDUSTRIES (PRESERVED) */}
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

      {/* WHY CHOOSE US (PRESERVED) */}
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

      {/* CAREERS PREVIEW (PRESERVED) */}
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
            <Link
              to="/careers"
              className="text-sm font-bold text-accent underline-offset-8 hover:underline"
            >
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

      {/* HIRING PROCESS (PRESERVED) */}
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

      {/* TRUSTED BY LEADING ORGANIZATIONS (PRESERVED) */}
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

      {/* ZOZII PRODUCT TEASER (PRESERVED) */}
      <section className="py-24">
        <div className="container-page">
          <div className="rounded-3xl border border-primary/5 bg-surface p-10 md:p-16">
            <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="eyebrow mb-6">Product</div>
                <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
                  Meet Zozii — invisible AI meeting assistant
                </h2>
                <p className="mt-4 text-muted-foreground">
                  A lightweight desktop companion for Nexus Talent workflows. Listen to meetings,
                  ask questions, and receive instant streaming answers invisible to screen shares.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Windows installer (.exe){zoziiVersion ? ` · ${zoziiVersion}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <a
                  href="https://zozii-iota.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-bold text-accent-foreground transition-transform hover:scale-105"
                >
                  Explore Zozii <ArrowRight className="size-4" aria-hidden="true" />
                </a>
                <a
                  href={zoziiDownloadUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/10 px-8 py-4 text-sm font-bold text-primary transition-colors hover:bg-card"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 11: STRONG FINAL CTA */}
      <section className="py-24">
        <div className="container-page">
          <div className="rounded-3xl bg-primary p-10 text-primary-foreground md:p-16 shadow-elegant">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-accent-foreground mb-4">
                  <Sparkles className="size-3.5 text-accent" />
                  Consulting · Products · Small Business Growth
                </div>
                <h2 className="text-3xl font-bold md:text-4xl">
                  Have an Idea or a Business That Needs to Grow?
                </h2>
                <p className="mt-4 text-primary-foreground/80 leading-relaxed text-base sm:text-lg">
                  Let's build something that works for your business. Whether you are scaling an
                  enterprise engineering team or launching a high-converting website, our team is
                  ready to deliver.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row shrink-0">
                <Link
                  to="/for-businesses"
                  hash="start-project"
                  className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-4 text-sm font-bold text-accent-foreground shadow-accent transition-transform hover:scale-105"
                >
                  Start Your Project
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-primary-foreground/20 px-8 py-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-white/10"
                >
                  Talk to Our Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
