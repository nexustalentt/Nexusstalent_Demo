import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
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
  Download,
  Users,
  Brain,
  Camera,
} from "lucide-react";
import heroImage from "@/assets/hero-office.jpg";
import { PublicShell } from "@/components/site/public-shell";
import { siteSettingsQuery } from "@/lib/queries";
import { useProducts } from "@/lib/products-api";
import { resolveProductAction, getDefaultProducts } from "@/lib/products-store";
import {
  services,
  industries,
  whyChooseUs,
  hiringProcess,
  clients,
  digitalServices,
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

function parseStatValue(raw: string) {
  const clean = raw.trim();
  const hasPlus = clean.includes("+");
  const numStr = clean.replace(/[^0-9]/g, "");
  const num = parseInt(numStr, 10) || 0;
  return {
    target: num,
    suffix: hasPlus ? "+" : "",
    hasCommas: num >= 1000,
  };
}

function AnimatedStatValue({
  value,
  isTriggered,
}: {
  value: string;
  isTriggered: boolean;
}) {
  const { target, suffix, hasCommas } = parseStatValue(value);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isTriggered) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setCurrent(target);
      return;
    }

    let startTime: number | null = null;
    const duration = 1800;

    let frameId: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const val = Math.floor(easeProgress * target);

      setCurrent(val);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCurrent(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isTriggered, target]);

  const displayNum = hasCommas ? current.toLocaleString() : current.toString();

  return (
    <span>
      {isTriggered ? displayNum : 0}
      {suffix}
    </span>
  );
}

function HomePage() {
  const { data: settings } = useSuspenseQuery(siteSettingsQuery);
  const { data: products = [] } = useProducts();

  const statsSectionRef = useRef<HTMLElement | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const el = statsSectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setStatsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const statProfessionals = {
    value: settings?.professionals_placed ?? "12,000+",
    label: "Professionals Placed",
  };
  const statExperience = {
    value: settings?.years_experience ?? "15",
    label: "Years of Experience",
  };
  const statClients = {
    value: settings?.enterprise_clients ?? "500+",
    label: "Enterprise Clients",
  };
  const statProjects = {
    value: settings?.successful_projects ?? "1,200+",
    label: "Successful Projects",
  };

  const defaultList = getDefaultProducts();
  const zoziiProduct =
    products.find((p) => p.id === "prod-zozii-ai-02" || p.name.toLowerCase().includes("zozii")) ||
    defaultList.find((p) => p.id === "prod-zozii-ai-02") ||
    defaultList[1] ||
    defaultList[0]!;

  const screenshotProduct =
    products.find(
      (p) => p.id === "prod-screenshot-saver-05" || p.name.toLowerCase().includes("screenshot"),
    ) ||
    defaultList.find((p) => p.id === "prod-screenshot-saver-05") ||
    defaultList[4] ||
    defaultList[0]!;

  return (
    <PublicShell>
      {/* SECTION 1: HERO (EXACT REPLICA: PREMIUM GLASSMORPHIC MODERN TECH AESTHETIC) */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 bg-[#f8fafc]">
        {/* Faint digital dot-grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_85%_70%_at_50%_35%,#000_70%,transparent_100%)]"
          aria-hidden="true"
        />

        {/* Ambient mesh gradient glows (purple, deep blue, cyan) */}
        <div
          className="pointer-events-none absolute top-4 left-[5%] h-[500px] w-[550px] rounded-full bg-gradient-to-r from-purple-500/15 via-blue-600/15 to-cyan-400/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-24 right-[-5%] h-[580px] w-[580px] rounded-full bg-gradient-to-br from-blue-600/20 via-cyan-400/15 to-purple-500/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/4 h-[400px] w-[650px] rounded-full bg-gradient-to-t from-cyan-400/10 via-blue-500/10 to-transparent blur-3xl"
          aria-hidden="true"
        />

        {/* Decorative ambient glowing particles */}
        <div
          className="pointer-events-none absolute top-36 left-[48%] size-2.5 rounded-full bg-cyan-400/60 blur-[0.5px] hidden lg:block"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-56 left-[45%] size-3 rounded-full bg-purple-500/50 blur-[0.5px] hidden lg:block"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-44 left-[54%] size-2 rounded-full bg-blue-500/50 blur-[0.5px] hidden lg:block"
          aria-hidden="true"
        />

        <div className="container-page relative z-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Headline, Copy & CTAs */}
            <div className="lg:col-span-7">
              {/* Glowing Pill Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/75 px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur-md">
                <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                <span>Connecting Potential - Inspiring Success</span>
              </div>

              {/* Main Headline */}
              <h1 className="mb-6 text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl text-slate-900">
                <span className="block">We Don't Just Consult.</span>
                <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  We Build Apps, Softwares &amp; Websites.
                </span>
              </h1>

              {/* Sub-headline Paragraph */}
              <p className="mb-8 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600">
                From launching custom mobile &amp; web applications to helping small businesses go online, we don't just advise—we architect and launch the digital solutions that scale your business.
              </p>

              {/* CTA Buttons (Liquid Fill + Magnetic Lift) */}
              <div className="flex flex-wrap gap-3.5 items-center">
                <Link
                  to="/contact"
                  className="btn-liquid-primary inline-flex h-11 items-center justify-center px-7 text-sm font-semibold"
                >
                  <span className="btn-content-wrap">Work With Us</span>
                </Link>
                <Link
                  to="/products"
                  className="btn-liquid-secondary group inline-flex h-11 items-center justify-center px-6 text-sm font-semibold"
                >
                  <span className="btn-content-wrap">
                    <span>Explore Products &amp; Builds</span>
                    <svg
                      className="btn-arrow-icon size-4"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3.333 8h9.334M8.667 4l4 4-4 4" />
                    </svg>
                  </span>
                </Link>
              </div>

              {/* Bottom Tag Badges */}
              <div className="mt-8 flex flex-wrap items-center gap-2.5 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50/80 px-4 py-1.5 font-medium text-slate-800 shadow-xs backdrop-blur-sm transition-colors hover:border-blue-300">
                  <Check className="size-3.5 text-blue-600 stroke-[2.5]" />
                  <span>custom app engineering</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50/80 px-4 py-1.5 font-medium text-slate-800 shadow-xs backdrop-blur-sm transition-colors hover:border-blue-300">
                  <Check className="size-3.5 text-blue-600 stroke-[2.5]" />
                  <span>small business launchpad</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50/80 px-4 py-1.5 font-medium text-slate-800 shadow-xs backdrop-blur-sm transition-colors hover:border-blue-300">
                  <Check className="size-3.5 text-blue-600 stroke-[2.5]" />
                  <span>scale-up digital systems</span>
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual Tile */}
            <div className="relative lg:col-span-5">
              {/* Ambient radial glow behind image */}
              <div
                className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-tr from-blue-500/20 via-indigo-400/15 to-cyan-400/20 blur-2xl opacity-75"
                aria-hidden="true"
              />

              <div className="relative rounded-3xl border border-white/60 bg-white/40 p-2 shadow-2xl backdrop-blur-sm">
                <img
                  src={heroImage || "/images/hero-office.jpg"}
                  onError={(e) => {
                    e.currentTarget.src = "/images/hero-office.jpg";
                  }}
                  alt="Nexus Talent consultants and engineers collaborating in a modern office"
                  width={1200}
                  height={800}
                  className="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm ring-1 ring-slate-900/5"
                />

                {/* Overlaid Glassmorphic Nexus Digital Tile */}
                <div className="absolute -top-3 -right-3 z-20 rounded-2xl border border-white/70 bg-white/80 p-3.5 shadow-xl backdrop-blur-md transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f62fe] to-[#2563eb] text-white shadow-sm shadow-blue-500/25">
                      <Globe className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Nexus Digital</div>
                      <div className="text-[10px] font-medium text-slate-500">Websites &amp; Systems</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Three Feature Cards with 3D Lift + Animated Gradient Border */}
          <div className="mt-12 lg:-mt-8 relative z-20 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Custom Apps & Softwares */}
            <div className="feature-card card-blue">
              <div className="feature-card-icon mb-3.5 flex size-11 items-center justify-center rounded-xl border border-blue-400/50 bg-blue-500/10 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Layout className="size-5 stroke-[2.2]" />
              </div>
              <h3 className="feature-card-title mb-1 text-sm font-bold text-slate-900">Custom Apps &amp; Softwares</h3>
              <p className="feature-card-desc text-xs leading-relaxed text-slate-600">
                High-performance web, mobile, and AI systems tailored to your needs.
              </p>
            </div>

            {/* Card 2: Small Business Launchpad */}
            <div className="feature-card card-green">
              <div className="feature-card-icon mb-3.5 flex size-11 items-center justify-center rounded-xl border border-emerald-400/50 bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Store className="size-5 stroke-[2.2]" />
              </div>
              <h3 className="feature-card-title mb-1 text-sm font-bold text-slate-900">Small Business Launchpad</h3>
              <p className="feature-card-desc text-xs leading-relaxed text-slate-600">
                Getting local brands online with high-converting websites &amp; storefronts.
              </p>
            </div>

            {/* Card 3: Elite Tech Talent */}
            <div className="feature-card card-purple">
              <div className="feature-card-icon mb-3.5 flex size-11 items-center justify-center rounded-xl border border-purple-400/50 bg-purple-500/10 text-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <Users className="size-5 stroke-[2.2]" />
              </div>
              <h3 className="feature-card-title mb-1 text-sm font-bold text-slate-900">Elite Tech Talent</h3>
              <p className="feature-card-desc text-xs leading-relaxed text-slate-600">
                Deploying top-tier engineers and specialists to accelerate your vision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: STATS & CREDIBILITY (BENTO GRID REDESIGN) */}
      <section
        ref={statsSectionRef}
        className={`about-stats-section border-y border-[#e0e0e0] bg-[#f4f4f4] py-20 ${
          statsVisible ? "is-revealed" : ""
        }`}
      >
        <div className="container-page grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="about-reveal-left">
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
                className="about-link inline-flex items-center gap-1.5 text-[#0f62fe] hover:underline"
              >
                More about us <ArrowRight className="about-link-arrow size-4" aria-hidden="true" />
              </Link>
              <span className="text-[#8c8c8c]">·</span>
              <Link
                to="/products"
                className="about-link inline-flex items-center gap-1.5 text-[#161616] hover:text-[#0f62fe]"
              >
                Explore active product builds <ArrowRight className="about-link-arrow size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="relative">
            {/* Subtle soft gradient background blob (blue/purple) behind right stats */}
            <div className="about-stats-blob" aria-hidden="true" />

            <dl className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Card 1: 12,000+ Professionals Placed (Full Width Card) */}
              <div className="about-stat-reveal bento-stat-card card-blue p-6 sm:col-span-3 sm:p-8">
                <dt className="bento-stat-label order-2">{statProfessionals.label}</dt>
                <dd className="bento-stat-value order-1 text-4xl sm:text-5xl">
                  <AnimatedStatValue value={statProfessionals.value} isTriggered={statsVisible} />
                </dd>
                <Users className="bento-watermark-icon size-24 sm:size-28" aria-hidden="true" />
              </div>

              {/* Card 2: Years of Experience */}
              <div className="about-stat-reveal bento-stat-card card-green p-6 sm:col-span-1 sm:p-7">
                <dt className="bento-stat-label order-2">{statExperience.label}</dt>
                <dd className="bento-stat-value order-1 text-3xl sm:text-4xl">
                  <AnimatedStatValue value={statExperience.value} isTriggered={statsVisible} />
                </dd>
                <Briefcase className="bento-watermark-icon size-16 sm:size-20" aria-hidden="true" />
              </div>

              {/* Card 3: Enterprise Clients */}
              <div className="about-stat-reveal bento-stat-card card-purple p-6 sm:col-span-1 sm:p-7">
                <dt className="bento-stat-label order-2">{statClients.label}</dt>
                <dd className="bento-stat-value order-1 text-3xl sm:text-4xl">
                  <AnimatedStatValue value={statClients.value} isTriggered={statsVisible} />
                </dd>
                <Globe className="bento-watermark-icon size-16 sm:size-20" aria-hidden="true" />
              </div>

              {/* Card 4: Successful Projects */}
              <div className="about-stat-reveal bento-stat-card card-orange p-6 sm:col-span-1 sm:p-7">
                <dt className="bento-stat-label order-2">{statProjects.label}</dt>
                <dd className="bento-stat-value order-1 text-3xl sm:text-4xl">
                  <AnimatedStatValue value={statProjects.value} isTriggered={statsVisible} />
                </dd>
                <CheckCircle2 className="bento-watermark-icon size-16 sm:size-20" aria-hidden="true" />
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* SECTION 4: PRODUCT SHOWCASE (ASYMMETRIC REDESIGN) */}
      <section className="product-showcase-section border-t border-[#e0e0e0] bg-[#f4f4f4] py-24">
        <div className="container-page relative z-10">
          <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="eyebrow mb-4">Product engineering</div>
              <h2 className="text-3xl font-light text-[#161616] md:text-4xl tracking-tight leading-snug">
                What We Are Currently Working On &amp; Shipping
              </h2>
              <p className="mt-4 text-sm text-[#525252] tracking-[0.16px] leading-relaxed">
                We turn ideas into real digital platforms. From shopping applications and e-commerce
                storefronts to desktop AI co-pilots and clinical portals, we actively engineer products
                that solve real problems.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm text-[#0f62fe] font-medium hover:underline"
            >
              Explore all product builds ({products.length}) <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Subtle soft gradient background blob (blue/cyan) behind the right side */}
          <div className="product-showcase-blob" aria-hidden="true" />

          {/* Asymmetric Card Grid: Card 1 (60% / col-span-3) & Card 2 (40% / col-span-2) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 relative z-10">
            {/* CARD 1: Zozii Desktop AI Assistant (Spans 60% -> lg:col-span-3) */}
            <div className="product-card group relative flex flex-col justify-between p-7 md:p-8 lg:col-span-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-semibold text-[#0f62fe] tracking-wider">
                    {zoziiProduct.category || "DESKTOP AI & WIN32"}
                  </span>
                  <span className="product-badge-live">
                    <span className="live-pulse-dot" />
                    LIVE
                  </span>
                </div>

                {/* Dynamic Separator Line (blue line slides across on hover) */}
                <div className="product-separator" />

                <h3 className="product-card-title text-xl font-semibold">
                  {zoziiProduct.name}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-[#525252] line-clamp-3">
                  {zoziiProduct.tagline}
                </p>

                {/* Tech Stack Pills */}
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {zoziiProduct.tags.map((tag) => (
                    <span key={tag} className="product-tech-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-[#f1f5f9] pt-4 relative z-10">
                {zoziiProduct.website_url ? (() => {
                  const action = resolveProductAction(zoziiProduct);
                  return (
                    <a
                      href={action?.url || zoziiProduct.website_url}
                      target={(action?.url || zoziiProduct.website_url).startsWith("http") ? "_blank" : undefined}
                      rel={(action?.url || zoziiProduct.website_url).startsWith("http") ? "noopener noreferrer" : undefined}
                      className="product-card-action"
                    >
                      <span>{action?.label || "Open App"}</span>
                      <ExternalLink className="size-3.5" />
                    </a>
                  );
                })() : (
                  <Link to="/products" className="product-card-action">
                    <span>Details</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                )}

                <Link
                  to="/products"
                  className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
                >
                  All products →
                </Link>
              </div>

              {/* Watermark SVG Icon (AI Brain) */}
              <Brain className="product-watermark-icon size-28 md:size-32" aria-hidden="true" />
            </div>

            {/* CARD 2: Screenshot Saver (Spans 40% -> lg:col-span-2) */}
            <div className="product-card group relative flex flex-col justify-between p-7 md:p-8 lg:col-span-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-semibold text-[#0f62fe] tracking-wider">
                    {screenshotProduct.category || "DESKTOP TOOLS & WINDOWS"}
                  </span>
                  <span className="product-badge-live">
                    <span className="live-pulse-dot" />
                    LIVE
                  </span>
                </div>

                {/* Dynamic Separator Line (blue line slides across on hover) */}
                <div className="product-separator" />

                <h3 className="product-card-title text-xl font-semibold">
                  {screenshotProduct.name}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-[#525252] line-clamp-3">
                  {screenshotProduct.tagline}
                </p>

                {/* Tech Stack Pills */}
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {screenshotProduct.tags.map((tag) => (
                    <span key={tag} className="product-tech-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-[#f1f5f9] pt-4 relative z-10">
                {screenshotProduct.website_url ? (() => {
                  const action = resolveProductAction(screenshotProduct);
                  if (action?.isDownload) {
                    return (
                      <a
                        href={action.url}
                        download={action.downloadFilename || "Screenshot.Saver.1.exe"}
                        className="product-card-action"
                        title={`Download ${action.downloadFilename || "file"}`}
                      >
                        <span>Download</span>
                        <Download className="size-3.5" />
                      </a>
                    );
                  }
                  return (
                    <a
                      href={action?.url || screenshotProduct.website_url}
                      target={(action?.url || screenshotProduct.website_url).startsWith("http") ? "_blank" : undefined}
                      rel={(action?.url || screenshotProduct.website_url).startsWith("http") ? "noopener noreferrer" : undefined}
                      className="product-card-action"
                    >
                      <span>{action?.label || "Open App"}</span>
                      <ExternalLink className="size-3.5" />
                    </a>
                  );
                })() : (
                  <Link to="/products" className="product-card-action">
                    <span>Download</span>
                    <Download className="size-3.5" />
                  </Link>
                )}

                <Link
                  to="/products"
                  className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
                >
                  All products →
                </Link>
              </div>

              {/* Watermark SVG Icon (Camera) */}
              <Camera className="product-watermark-icon size-24 md:size-28" aria-hidden="true" />
            </div>
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
                        const fallback = clientLogoFallbacks[client.name];
                        if (fallback) {
                          e.currentTarget.src = fallback;
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
