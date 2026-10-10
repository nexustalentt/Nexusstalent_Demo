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
  ExternalLink,
} from "lucide-react";
import heroImage from "@/assets/hero-office.jpg";
import { PublicShell } from "@/components/site/public-shell";
import { JobCard } from "@/components/site/job-card";
import { DigitalShowcase } from "@/components/site/digital-showcase";
import { activeJobsQuery, siteSettingsQuery } from "@/lib/queries";
import { useProducts } from "@/lib/products-api";
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
        <h1 className="text-2xl font-light text-[#161616]">Something went wrong</h1>
        <p className="mt-2 text-[#525252]">Please refresh the page and try again.</p>
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

const audienceImages: Record<string, string> = {
  "restaurants-cafes": "/images/cat-restaurant.svg",
  "local-businesses": "/images/cat-local.svg",
  startups: "/images/cat-startup.svg",
  professionals: "/images/cat-professional.svg",
};

const clientLogoFallbacks: Record<string, string> = {
  SAP: "/logos/sap.svg",
  LTIMindtree: "/logos/ltimindtree.svg",
  Wipro: "/logos/wipro.svg",
  Accenture: "/logos/accenture.svg",
  Capgemini: "/logos/capgemini.svg",
  "Mercedes-Benz": "/logos/mercedes-benz.svg",
};

function HomePage() {
  const { data: jobs } = useSuspenseQuery(activeJobsQuery);
  const { data: settings } = useSuspenseQuery(siteSettingsQuery);
  const { data: products = [] } = useProducts();
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
      {/* SECTION 1: HERO (CARBON WHITE CANVAS WITH LIGHT DISPLAY HEADLINE) */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 bg-[#ffffff]">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="eyebrow mb-6">
                <span className="size-2 bg-[#0f62fe] mr-2 shrink-0" />
                We consult · We build · We help businesses grow
              </div>

              <h1 className="mb-6 text-4xl font-light leading-[1.15] text-[#161616] sm:text-5xl lg:text-6xl">
                We Don't Just Consult. <span className="text-[#0f62fe]">We Build.</span>
              </h1>

              <p className="mb-8 max-w-xl text-lg leading-relaxed text-[#525252] tracking-[0.16px]">
                From technology consulting and talent solutions to building products, websites, and
                digital experiences, we help businesses turn ideas into real solutions and grow in
                the digital world.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="inline-flex h-11 items-center justify-center rounded-none bg-[#0f62fe] px-6 text-sm font-normal text-white transition-colors hover:bg-[#0050e6] active:bg-[#002d9c]"
                >
                  Work With Us
                </Link>
                <Link
                  to="/products"
                  className="inline-flex h-11 items-center justify-center rounded-none bg-[#161616] px-6 text-sm font-normal text-white transition-colors hover:bg-[#262626]"
                >
                  Explore Products & Builds →
                </Link>
              </div>

              {/* Carbon Precision Service Pillars Mini Bar */}
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#e0e0e0] pt-6 text-xs text-[#525252]">
                <span className="flex items-center gap-1.5 text-[#161616]">
                  <Check className="size-3.5 text-[#0f62fe]" /> Talent & IT Consulting
                </span>
                <span className="flex items-center gap-1.5 text-[#161616]">
                  <Check className="size-3.5 text-[#0f62fe]" /> Custom Product Engineering
                </span>
                <span className="flex items-center gap-1.5 text-[#161616]">
                  <Check className="size-3.5 text-[#0f62fe]" /> Small Business Web Systems
                </span>
              </div>
            </div>

            {/* Hero Visual Tile */}
            <div className="relative lg:col-span-5">
              {/* Soft Blue Backdrop Wash per Carbon spec */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#edf5ff] via-transparent to-transparent opacity-80" />

              <div className="relative border border-[#e0e0e0] bg-[#ffffff] p-2">
                <img
                  src={heroImage || "/images/hero-office.jpg"}
                  onError={(e) => {
                    e.currentTarget.src = "/images/hero-office.jpg";
                  }}
                  alt="Nexus Talent consultants and engineers collaborating in a modern office"
                  width={1200}
                  height={800}
                  className="aspect-[4/3] w-full rounded-none object-cover border border-[#e0e0e0]"
                />

                {/* Overlaid Flat Stat Tile */}
                <div className="absolute -bottom-4 -left-4 border border-[#e0e0e0] bg-[#ffffff] p-5 hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-light text-[#0f62fe]">
                      {settings?.enterprise_clients ?? "500+"}
                    </div>
                    <div className="text-xs uppercase tracking-[0.16px] text-[#525252] leading-tight">
                      Enterprise
                      <br />
                      Clients
                    </div>
                  </div>
                </div>

                {/* Overlaid Flat Nexus Digital Tile */}
                <div className="absolute -top-4 -right-4 border border-[#e0e0e0] bg-[#ffffff] p-4 hidden sm:block">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center bg-[#0f62fe] text-white">
                      <Globe className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-normal text-[#161616]">Nexus Digital</div>
                      <div className="text-[10px] text-[#525252]">Websites & Systems</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: STATS & CREDIBILITY (CARBON SURFACE-1 ALTERNATE BAND) */}
      <section className="border-y border-[#e0e0e0] bg-[#f4f4f4] py-20">
        <div className="container-page grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="eyebrow mb-6">Who we are</div>
            <h2 className="text-3xl font-light text-[#161616] md:text-4xl">
              A modern technology and talent partner built around delivery
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#525252] tracking-[0.16px]">
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
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-[#0f62fe] hover:underline"
              >
                More about us <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <span className="text-[#8c8c8c]">·</span>
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-[#161616] hover:text-[#0f62fe]"
              >
                Explore active product builds <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-none border border-[#e0e0e0] bg-[#ffffff] p-6 md:p-8"
              >
                <dt className="text-xs uppercase tracking-[0.16px] text-[#525252]">{stat.label}</dt>
                <dd className="mt-3 text-3xl font-light text-[#161616] md:text-4xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* SECTION 3: HAVE A BUSINESS? WE'LL HELP YOU GO DIGITAL (CANVAS) */}
      <section className="py-24 bg-[#ffffff]">
        <div className="container-page">
          <div className="border border-[#e0e0e0] bg-[#f4f4f4] p-8 md:p-12">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              <div className="space-y-6 lg:col-span-6">
                <div className="eyebrow bg-[#ffffff]">Go digital with Nexus</div>
                <h2 className="text-3xl font-light text-[#161616] sm:text-4xl md:text-5xl">
                  Have a Business? We'll Help You Go Digital.
                </h2>
                <p className="text-base leading-relaxed text-[#525252] tracking-[0.16px]">
                  Whether you're starting a new business or already running one, we help you build a
                  professional online presence. From websites and landing pages to digital solutions
                  and ongoing support, we create technology that helps your business reach more
                  customers and grow.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    to="/products"
                    className="inline-flex h-11 items-center justify-center rounded-none bg-[#0f62fe] px-6 text-sm font-normal text-white transition-colors hover:bg-[#0050e6]"
                  >
                    View Our Products
                  </Link>
                  <Link
                    to="/contact"
                    onClick={(e) => {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent("open-talk-modal"));
                    }}
                    className="inline-flex h-11 items-center justify-center rounded-none border border-[#161616] bg-[#ffffff] px-6 text-sm font-normal text-[#161616] transition-colors hover:bg-[#f4f4f4]"
                  >
                    Talk to Us
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#e0e0e0] text-xs text-[#525252]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-[#24a148] shrink-0" />
                    <span>Mobile-first & SEO optimized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-[#24a148] shrink-0" />
                    <span>Launch in 7–14 business days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-[#24a148] shrink-0" />
                    <span>Transparent, clear milestones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-[#24a148] shrink-0" />
                    <span>Full maintenance & support</span>
                  </div>
                </div>
              </div>

              {/* Digital Showcase Preview */}
              <div className="lg:col-span-6">
                <DigitalShowcase />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: PRODUCT SHOWCASE (SURFACE-1 BAND) */}
      <section className="border-t border-[#e0e0e0] bg-[#f4f4f4] py-24">
        <div className="container-page">
          <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="eyebrow mb-6">Product engineering</div>
              <h2 className="text-3xl font-light text-[#161616] md:text-4xl">
                What We Are Currently Working On &amp; Shipping
              </h2>
              <p className="mt-4 text-sm text-[#525252] tracking-[0.16px]">
                We turn ideas into real digital platforms. From shopping applications and e-commerce
                storefronts to desktop AI co-pilots and clinical portals, we actively engineer products
                that solve real problems.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm text-[#0f62fe] hover:underline"
            >
              Explore all product builds ({products.length}) <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((product) => {
              const isWorkingOn = product.status === "in_development";
              const isLive = product.status === "live";

              return (
                <div
                  key={product.id}
                  className="group flex flex-col justify-between rounded-none border border-[#e0e0e0] bg-[#ffffff] p-6 transition-colors hover:border-[#0f62fe]"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-3 mb-4">
                      <span className="font-mono text-[10px] uppercase font-semibold text-[#0f62fe]">
                        {product.category}
                      </span>
                      {isWorkingOn ? (
                        <span className="inline-flex items-center gap-1 border border-[#0f62fe] bg-[#edf5ff] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#0043ce]">
                          <span className="size-1 bg-[#0f62fe] animate-pulse" />
                          IN SPRINT
                        </span>
                      ) : isLive ? (
                        <span className="inline-flex items-center gap-1 border border-[#24a148] bg-[#defbe6] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#0e6027]">
                          <span className="size-1 bg-[#24a148]" />
                          LIVE
                        </span>
                      ) : (
                        <span className="border border-[#8d8d8d] bg-[#f4f4f4] px-1.5 py-0.5 font-mono text-[9px] text-[#161616]">
                          {product.version || "BETA"}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-medium text-[#161616] group-hover:text-[#0f62fe] transition-colors">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-xs text-[#525252] leading-relaxed line-clamp-3">
                      {product.tagline}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {product.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="border border-[#e0e0e0] bg-[#f4f4f4] px-1.5 py-0.5 font-mono text-[10px] text-[#525252]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-[#e0e0e0] flex items-center justify-between">
                    {product.website_url ? (
                      <a
                        href={product.website_url}
                        target={product.website_url.startsWith("http") ? "_blank" : undefined}
                        rel={product.website_url.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1 text-xs text-[#0f62fe] font-semibold hover:underline"
                      >
                        <span>Open App</span>
                        <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      <Link
                        to="/products"
                        className="inline-flex items-center gap-1 text-xs text-[#0f62fe] font-semibold hover:underline"
                      >
                        <span>Details</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    )}

                    <Link
                      to="/products"
                      className="text-[11px] text-[#8d8d8d] hover:text-[#161616]"
                    >
                      All products →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: SMALL BUSINESS WEBSITE & DIGITAL SOLUTIONS (CANVAS) */}
      <section className="py-24 bg-[#ffffff]">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <div className="eyebrow mb-6">Dedicated solutions</div>
            <h2 className="text-3xl font-light text-[#161616] md:text-4xl">
              Small Business Website & Digital Solutions
            </h2>
            <p className="mt-4 text-sm text-[#525252] tracking-[0.16px]">
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
                  className="rounded-none border border-[#e0e0e0] bg-[#ffffff] p-8 transition-colors hover:border-[#0f62fe]"
                >
                  <div className="flex size-11 items-center justify-center bg-[#f4f4f4] border border-[#e0e0e0] text-[#0f62fe]">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-6 text-xl font-normal text-[#161616]">{service.title}</h3>
                  <p className="text-xs text-[#0f62fe] mt-0.5">{service.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#525252]">
                    {service.description}
                  </p>

                  <div className="mt-6 border-t border-[#e0e0e0] pt-4">
                    <ul className="space-y-2">
                      {service.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2 text-xs text-[#525252]">
                          <CheckCircle2 className="size-3.5 text-[#24a148] shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/products"
                    className="mt-6 inline-flex items-center gap-1.5 text-xs text-[#0f62fe] hover:underline"
                  >
                    View Products <ArrowRight className="size-3.5" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6: BUILT FOR SMALL BUSINESSES (SURFACE-1 BAND) */}
      <section className="border-y border-[#e0e0e0] bg-[#f4f4f4] py-24">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <div className="eyebrow mb-6">Targeted sectors</div>
            <h2 className="text-3xl font-light text-[#161616] md:text-4xl">
              Built for Small Businesses
            </h2>
            <p className="mt-4 text-sm text-[#525252] tracking-[0.16px]">
              From local businesses and service providers to startups and growing companies, we
              create affordable digital solutions without the complexity of working with a large
              agency.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {targetAudiences.map((audience) => {
              return (
                <div
                  key={audience.id}
                  className="rounded-none border border-[#e0e0e0] bg-[#ffffff] p-6 transition-colors hover:border-[#0f62fe]"
                >
                  <div className="flex items-center justify-between">
                    <img
                      src={audienceImages[audience.id] || "/images/cat-local.svg"}
                      alt={audience.title}
                      width={44}
                      height={44}
                      className="size-11 rounded-none object-contain border border-[#e0e0e0]"
                    />
                    <span className="text-[10px] uppercase tracking-[0.16px] text-[#525252]">
                      {audience.category}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-normal text-[#161616]">{audience.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#525252]">
                    {audience.description}
                  </p>

                  <div className="mt-5 border-t border-[#e0e0e0] pt-3">
                    <p className="text-[10px] uppercase text-[#525252] mb-2 tracking-[0.16px]">
                      Features Included:
                    </p>
                    <ul className="space-y-1.5 text-xs text-[#525252]">
                      {audience.features.map((f) => (
                        <li key={f} className="flex items-center gap-1.5">
                          <span className="size-1 bg-[#0f62fe] shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/products"
                    className="mt-6 inline-flex items-center gap-1.5 text-xs text-[#0f62fe] hover:underline"
                  >
                    Explore Solutions <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 7: FROM IDEA TO ONLINE PROCESS (CANVAS) */}
      <section className="py-24 bg-[#ffffff]">
        <div className="container-page">
          <div className="mb-16 max-w-2xl">
            <div className="eyebrow mb-6">Our methodology</div>
            <h2 className="text-3xl font-light text-[#161616] md:text-4xl">
              From Idea to Online in 5 Simple Steps
            </h2>
            <p className="mt-4 text-sm text-[#525252] tracking-[0.16px]">
              How Nexus Talent and Nexus Digital take you from concept to a live, revenue-generating
              digital presence.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {digitalProcessSteps.map((step) => (
              <div
                key={step.step}
                className="rounded-none border border-[#e0e0e0] bg-[#f4f4f4] p-6"
              >
                <div className="flex size-9 items-center justify-center bg-[#161616] text-xs font-mono text-white">
                  {step.step}
                </div>
                <h3 className="mt-5 text-base font-normal text-[#161616]">{step.name}</h3>
                <p className="text-xs text-[#0f62fe]">{step.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#525252]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: ENTERPRISE CORE SERVICES (SURFACE-1 BAND) */}
      <section className="border-t border-[#e0e0e0] bg-[#f4f4f4] py-24">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <div className="eyebrow mb-6">Enterprise capability</div>
            <h2 className="text-3xl font-light text-[#161616] md:text-4xl">
              Talent and consulting capability, delivered end to end
            </h2>
            <p className="mt-4 text-sm text-[#525252] tracking-[0.16px]">
              Trusted staffing, talent acquisition, and managed consulting solutions for enterprise
              teams.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.slug}
                className="group rounded-none border border-[#e0e0e0] bg-[#ffffff] p-8 transition-colors hover:border-[#0f62fe]"
              >
                <div className="mb-6 flex size-10 items-center justify-center bg-[#f4f4f4] border border-[#e0e0e0] font-mono text-xs text-[#0f62fe]">
                  {service.title
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <h3 className="text-xl font-normal text-[#161616]">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#525252]">
                  {service.description}
                </p>
                <Link
                  to="/services"
                  hash={service.slug}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm text-[#0f62fe] hover:underline"
                >
                  Learn More <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: INDUSTRIES (CANVAS) */}
      <section className="border-y border-[#e0e0e0] bg-[#ffffff] py-24">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <div className="eyebrow mb-6">Industries</div>
            <h2 className="text-3xl font-light text-[#161616] md:text-4xl">
              Sector knowledge that shortens every search
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((industry) => (
              <div
                key={industry.name}
                className="rounded-none border border-[#e0e0e0] bg-[#f4f4f4] p-6 transition-colors hover:border-[#0f62fe] hover:bg-[#ffffff]"
              >
                <h3 className="text-base font-normal text-[#161616]">{industry.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#525252]">
                  {industry.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: WHY CHOOSE US (SURFACE-1 BAND) */}
      <section className="border-b border-[#e0e0e0] bg-[#f4f4f4] py-24">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <div className="eyebrow mb-6">Why choose us</div>
            <h2 className="text-3xl font-light text-[#161616] md:text-4xl">
              Six reasons enterprise clients stay with us
            </h2>
          </div>
          <div className="grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {whyChooseUs.map((item) => (
              <div key={item.title} className="border-t border-[#e0e0e0] pt-6">
                <h3 className="text-base font-medium text-[#161616]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#525252]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 11: CAREERS PREVIEW (CANVAS) */}
      <section className="border-b border-[#e0e0e0] bg-[#ffffff] py-24">
        <div className="container-page">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="eyebrow mb-6">Careers</div>
              <h2 className="text-3xl font-light text-[#161616] md:text-4xl">
                Explore Career Opportunities
              </h2>
              <p className="mt-4 text-sm text-[#525252] tracking-[0.16px]">
                Current openings across our client engagements. Apply directly — no account needed.
              </p>
            </div>
            <Link
              to="/careers"
              className="text-sm text-[#0f62fe] underline-offset-8 hover:underline"
            >
              View All Open Positions →
            </Link>
          </div>

          {latestJobs.length ? (
            <div className="grid gap-4">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="rounded-none border border-dashed border-[#e0e0e0] bg-[#f4f4f4] p-12 text-center">
              <p className="font-normal text-[#161616]">No active jobs available right now.</p>
              <p className="mt-2 text-sm text-[#525252]">
                New opportunities are published regularly — or contact us directly.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 12: HIRING PROCESS (SURFACE-1 BAND) */}
      <section className="border-b border-[#e0e0e0] bg-[#f4f4f4] py-24">
        <div className="container-page">
          <div className="mb-16 max-w-2xl">
            <div className="eyebrow mb-6">Hiring process</div>
            <h2 className="text-3xl font-light text-[#161616] md:text-4xl">
              From first look to first day in five steps
            </h2>
          </div>
          <ol className="grid gap-8 md:grid-cols-3 lg:grid-cols-5">
            {hiringProcess.map((step) => (
              <li key={step.step} className="border-t border-[#e0e0e0] pt-6">
                <div className="flex size-9 items-center justify-center bg-[#161616] text-xs font-mono text-white">
                  {step.step}
                </div>
                <h3 className="mt-5 text-base font-normal text-[#161616]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#525252]">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SECTION 13: TRUSTED BY LEADING ORGANIZATIONS (CANVAS MARQUEE TILES) */}
      <section className="py-20 bg-[#ffffff]">
        <div className="container-page">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-[#525252]">
            Trusted By Leading Organizations
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {clients.map((client) => (
              <div
                key={client.name}
                className="group flex items-center gap-4 rounded-none border border-[#e0e0e0] bg-[#ffffff] p-5 transition-colors hover:border-[#0f62fe]"
              >
                <div className="flex h-11 w-16 shrink-0 items-center justify-center border border-[#e0e0e0] bg-[#f4f4f4] p-2 text-xs font-mono text-[#161616]">
                  {client.logo ? (
                    <img
                      src={client.logo}
                      onError={(e) => {
                        if (clientLogoFallbacks[client.name]) {
                          e.currentTarget.src = clientLogoFallbacks[client.name];
                        }
                      }}
                      alt={`${client.name} logo`}
                      loading="lazy"
                      className="max-h-6 w-full object-contain"
                    />
                  ) : (
                    client.mark
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-normal text-[#161616]">{client.name}</p>
                  <p className="truncate text-[11px] uppercase tracking-[0.16px] text-[#525252]">
                    {client.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 14: ZOZII PRODUCT TEASER (SURFACE-1 BAND) */}
      <section className="border-y border-[#e0e0e0] bg-[#f4f4f4] py-24">
        <div className="container-page">
          <div className="rounded-none border border-[#e0e0e0] bg-[#ffffff] p-10 md:p-14">
            <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="eyebrow mb-6">Desktop companion</div>
                <h2 className="text-3xl font-light text-[#161616] md:text-4xl">
                  Meet Zozii — invisible AI meeting assistant
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-[#525252] tracking-[0.16px]">
                  A lightweight desktop companion for Nexus Talent workflows. Listen to meetings,
                  ask questions, and receive instant streaming answers invisible to screen shares.
                </p>
                <p className="mt-2 text-xs font-mono text-[#8c8c8c]">
                  Windows executable (.exe){zoziiVersion ? ` · ${zoziiVersion}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <a
                  href="https://zozii-iota.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-none bg-[#0f62fe] px-6 text-sm font-normal text-white transition-colors hover:bg-[#0050e6]"
                >
                  Explore Zozii <ArrowRight className="size-4" aria-hidden="true" />
                </a>
                <a
                  href={zoziiDownloadUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-none border border-[#161616] bg-[#161616] px-6 text-sm font-normal text-white transition-colors hover:bg-[#262626]"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 15: CARBON CTA BANNER (IBM BLUE RECTANGLE) */}
      <section className="py-24 bg-[#ffffff]">
        <div className="container-page">
          <div className="rounded-none bg-[#0f62fe] p-10 text-white md:p-16">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-3 py-1 text-xs text-white mb-4">
                  Consulting · Products · Small business growth
                </div>
                <h2 className="text-3xl font-light md:text-4xl leading-tight">
                  Have an Idea or a Business That Needs to Grow?
                </h2>
                <p className="mt-4 text-white/85 leading-relaxed text-base tracking-[0.16px]">
                  Let's build something that works for your business. Whether you are scaling an
                  enterprise engineering team or launching a high-converting website, our team is
                  ready to deliver.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row shrink-0">
                <Link
                  to="/products"
                  className="inline-flex h-12 items-center justify-center rounded-none bg-[#161616] px-8 text-sm font-normal text-white transition-colors hover:bg-[#262626]"
                >
                  Explore Our Products
                </Link>
                <Link
                  to="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("open-talk-modal"));
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-none border border-white bg-transparent px-8 text-sm font-normal text-white transition-colors hover:bg-white/10"
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
