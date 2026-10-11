import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  ExternalLink,
  Globe,
  Layers,
  Package,
  Sparkles,
  ShoppingBag,
  Zap,
  Code2,
  Terminal,
  Filter,
} from "lucide-react";
import { PublicShell } from "@/components/site/public-shell";
import { useProducts } from "@/lib/products-api";
import { type ProductItem, type ProductStatus, resolveProductAction } from "@/lib/products-store";
import { TalkToUsModal } from "@/components/site/talk-to-us-modal";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products & Active Builds — Nexus Talent Engineering" },
      {
        name: "description",
        content:
          "Explore the products Nexus Talent is currently working on and shipping — including shopping applications, desktop AI companions, healthcare platforms, and SaaS tools.",
      },
      { property: "og:title", content: "Products & Active Builds — Nexus Talent" },
      {
        property: "og:description",
        content:
          "Live catalog of proprietary products, shopping apps, and web platforms currently in active engineering.",
      },
    ],
  }),
  component: ProductsPage,
});

type FilterCategory = "all" | "in_development" | "live" | "ecommerce" | "ai";

function ProductsPage() {
  const { data: products = [], isLoading } = useProducts();
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("all");
  const [isTalkModalOpen, setIsTalkModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "in_development") return item.status === "in_development";
      if (selectedFilter === "live") return item.status === "live";
      if (selectedFilter === "ecommerce")
        return (
          item.category.toLowerCase().includes("commerce") ||
          item.category.toLowerCase().includes("retail") ||
          item.name.toLowerCase().includes("shop") ||
          item.name.toLowerCase().includes("cart")
        );
      if (selectedFilter === "ai")
        return (
          item.category.toLowerCase().includes("ai") ||
          item.name.toLowerCase().includes("ai") ||
          item.tags.some((t) => t.toLowerCase().includes("llama") || t.toLowerCase().includes("ai"))
        );
      return true;
    });
  }, [products, selectedFilter]);

  const currentlyWorkingOnCount = products.filter((p) => p.status === "in_development").length;
  const liveCount = products.filter((p) => p.status === "live").length;

  return (
    <PublicShell>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-[#f8fafc] pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Faint digital dot-grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_85%_70%_at_50%_35%,#000_70%,transparent_100%)]"
          aria-hidden="true"
        />

        {/* Ambient mesh gradient glows (purple, deep blue, cyan) */}
        <div
          className="pointer-events-none absolute top-4 left-[5%] h-[450px] w-[500px] rounded-full bg-gradient-to-r from-purple-500/15 via-blue-600/15 to-cyan-400/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-20 right-[-5%] h-[500px] w-[520px] rounded-full bg-gradient-to-br from-blue-600/15 via-cyan-400/12 to-purple-500/12 blur-3xl"
          aria-hidden="true"
        />

        {/* Ambient glowing particles */}
        <div
          className="pointer-events-none absolute top-28 right-[30%] size-2 rounded-full bg-cyan-400/60 blur-[0.5px] hidden lg:block"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-44 right-[22%] size-2.5 rounded-full bg-purple-500/40 blur-[0.5px] hidden lg:block"
          aria-hidden="true"
        />

        <div className="container-page relative z-10">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/75 px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur-md">
              <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
              <span>ENGINEERING LABS · ACTIVE PRODUCT BUILDS</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.12]">
              What we are{" "}
              <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                currently working on
              </span>{" "}
              &amp; shipping
            </h1>

            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
              From next-generation e-commerce mobile shopping apps to invisible desktop AI meeting
              co-pilots, explore the platforms Nexus Talent engineers are building, iterating, and
              deploying into production.
            </p>

            {/* Quick Metrics Bar */}
            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/80 px-4 py-1.5 font-medium text-slate-800 shadow-xs backdrop-blur-sm">
                <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="font-bold text-slate-900">{currentlyWorkingOnCount}</span>
                <span>Active Builds In Progress</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-4 py-1.5 font-medium text-slate-800 shadow-xs backdrop-blur-sm">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-900">{liveCount}</span>
                <span>Live in Production</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-1.5 font-medium text-slate-700 shadow-xs backdrop-blur-sm">
                <Globe className="size-3.5 text-blue-600" />
                <span>Web, Mobile &amp; Win32 Runtimes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER TABS & PRODUCT CATALOG */}
      <section className="py-16 bg-white border-b border-slate-200/70">
        <div className="container-page">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs uppercase tracking-wider text-blue-600 font-bold">
                Product Catalog
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                Explore our software builds
              </h2>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/60 p-1.5 shadow-xs">
              <button
                type="button"
                onClick={() => setSelectedFilter("all")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  selectedFilter === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                All ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("in_development")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                  selectedFilter === "in_development"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                Working On ({currentlyWorkingOnCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("live")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                  selectedFilter === "live"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Live ({liveCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("ecommerce")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  selectedFilter === "ecommerce"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                Shopping &amp; Commerce
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("ai")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  selectedFilter === "ai"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                Desktop &amp; AI
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 border border-[#e0e0e0] bg-white animate-pulse p-6" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="border border-[#e0e0e0] bg-white p-12 text-center">
              <Package className="size-8 mx-auto text-[#8d8d8d] mb-3" />
              <p className="text-base font-semibold text-[#161616]">No products in this category</p>
              <p className="text-xs text-[#525252] mt-1">Switch to "All" to view our complete catalog.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredProducts.map((product) => {
                const isWorkingOn = product.status === "in_development";
                const isLive = product.status === "live";

                return (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 flex flex-col justify-between shadow-sm transition-all duration-300 hover:border-blue-400 hover:shadow-md group"
                  >
                    <div>
                      {/* Top Meta Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-5">
                        <span className="text-xs uppercase tracking-wider font-bold text-blue-600">
                          {product.category}
                        </span>

                        <div className="flex items-center gap-2">
                          {isWorkingOn && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                              <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                              {product.status_label || "Currently Working On"}
                            </span>
                          )}

                          {isLive && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              {product.status_label || "Live in Production"}
                            </span>
                          )}

                          {!isWorkingOn && !isLive && (
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] text-slate-600">
                              {product.status_label || product.status.toUpperCase()}
                            </span>
                          )}

                          {product.version && (
                            <span className="text-xs text-slate-400">
                              {product.version}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Tagline */}
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>

                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                        {product.tagline}
                      </p>

                      {product.description && (
                        <p className="mt-3 text-xs text-slate-500 leading-relaxed line-clamp-3">
                          {product.description}
                        </p>
                      )}

                      {/* Highlights */}
                      {product.highlights && product.highlights.length > 0 && (
                        <div className="mt-5 space-y-1.5 border-t border-slate-100 pt-4">
                          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-800 mb-2">
                            Key Architectural Highlights
                          </p>
                          {product.highlights.slice(0, 3).map((highlight) => (
                            <div key={highlight} className="flex items-start gap-2 text-xs text-slate-600">
                              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{highlight}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Area: Tech Stack & Actions */}
                    <div className="mt-6 pt-5 border-t border-slate-100">
                      {/* Tech Pills */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {product.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-slate-200/80 bg-slate-50/70 px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Action Button Links */}
                      <div className="flex flex-wrap items-center gap-3">
                        {product.website_url && (() => {
                          const action = resolveProductAction(product);
                          if (!action) return null;
                          if (action.isDownload) {
                            return (
                              <a
                                href={action.url}
                                download={action.downloadFilename}
                                className="btn-liquid-primary inline-flex h-9 items-center justify-center px-4 text-xs font-semibold"
                                title={`Download ${action.downloadFilename || "executable"}`}
                              >
                                <span className="btn-content-wrap">
                                  <Download className="size-3.5" />
                                  <span>{action.label}</span>
                                </span>
                              </a>
                            );
                          }
                          return (
                            <a
                              href={action.url}
                              target={action.url.startsWith("http") ? "_blank" : undefined}
                              rel={action.url.startsWith("http") ? "noopener noreferrer" : undefined}
                              className="btn-liquid-primary inline-flex h-9 items-center justify-center px-4 text-xs font-semibold"
                            >
                              <span className="btn-content-wrap">
                                <span>{action.label}</span>
                                <ExternalLink className="size-3.5" />
                              </span>
                            </a>
                          );
                        })()}

                        {product.id === "prod-zozii-ai-02" && (
                          <Link
                            to="/zozii"
                            className="btn-liquid-secondary inline-flex h-9 items-center justify-center px-4 text-xs font-semibold"
                          >
                            <span className="btn-content-wrap">
                              <span>View Zozii Specs</span>
                              <svg
                                className="btn-arrow-icon size-3.5"
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
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SPOTLIGHT: SHOPPING APPLICATION ARCHITECTURE */}
      <section className="py-20 bg-white border-b border-[#e0e0e0]">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 border border-[#e0e0e0] bg-[#f4f4f4] px-3 py-1 font-mono text-xs font-semibold text-[#0f62fe]">
                <ShoppingBag className="size-3.5" />
                FEATURED WORK IN PROGRESS · COMMERCE ENGINE
              </div>

              <h2 className="text-3xl font-light text-[#161616] md:text-4xl">
                Engineering high-conversion <span className="font-normal text-[#0f62fe]">shopping applications</span>
              </h2>

              <p className="text-sm leading-relaxed text-[#525252]">
                Our mobile and web shopping platforms are built for microsecond response times.
                Whether you need a multi-vendor retail store, a specialized D2C application, or an
                omnichannel catalog, we architect the full stack from payment tokenization to
                warehouse dispatch.
              </p>

              <div className="space-y-3 font-mono text-xs text-[#161616]">
                <div className="flex items-center gap-3 border border-[#e0e0e0] bg-[#f4f4f4] p-3">
                  <Zap className="size-4 text-[#0f62fe] shrink-0" />
                  <span>Sub-200ms instantaneous search indexing across 50,000+ SKUs</span>
                </div>
                <div className="flex items-center gap-3 border border-[#e0e0e0] bg-[#f4f4f4] p-3">
                  <CheckCircle2 className="size-4 text-[#24a148] shrink-0" />
                  <span>Atomic cart inventory reservation to prevent checkout concurrency conflicts</span>
                </div>
                <div className="flex items-center gap-3 border border-[#e0e0e0] bg-[#f4f4f4] p-3">
                  <Code2 className="size-4 text-[#0f62fe] shrink-0" />
                  <span>Native cross-platform iOS & Android builds using React Native with shared TypeScript core</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsTalkModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-none bg-[#161616] px-6 py-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#393939]"
                >
                  <span>Build a Custom Shopping App With Us</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Visual terminal mockup */}
            <div className="lg:col-span-6 border border-[#e0e0e0] bg-[#f4f4f4] p-6">
              <div className="border border-[#393939] bg-[#161616] p-5 font-mono text-xs text-[#f4f4f4]">
                <div className="flex items-center justify-between border-b border-[#393939] pb-3 mb-4">
                  <span className="text-[#8d8d8d]">// omnicart-architecture.config.ts</span>
                  <span className="text-[#42be65]">STATUS: ACTIVE BUILD</span>
                </div>
                <p className="text-[#78a9ff]">export const shoppingAppConfig = {"{"}</p>
                <p className="pl-4 text-[#c6c6c6]">productName: <span className="text-[#42be65]">"NexusCart E-Commerce"</span>,</p>
                <p className="pl-4 text-[#c6c6c6]">catalogEngine: <span className="text-[#42be65]">"Algolia / MeiliSearch Vector"</span>,</p>
                <p className="pl-4 text-[#c6c6c6]">checkoutGateways: [<span className="text-[#42be65]">"Stripe"</span>, <span className="text-[#42be65]">"ApplePay"</span>, <span className="text-[#42be65]">"UPI"</span>],</p>
                <p className="pl-4 text-[#c6c6c6]">latencyBudgetMs: <span className="text-[#f1c21b]">180</span>,</p>
                <p className="pl-4 text-[#c6c6c6]">cartConcurrency: <span className="text-[#42be65]">"Redis Distributed Mutex"</span>,</p>
                <p className="pl-4 text-[#c6c6c6]">state: <span className="text-[#78a9ff]">"IN_ACTIVE_ENGINEERING"</span>,</p>
                <p className="text-[#78a9ff]">{"}"};</p>
              </div>
              <div className="mt-4 border border-[#e0e0e0] bg-white p-4">
                <p className="font-mono text-xs font-semibold text-[#161616]">
                  Live Shopping App Prototype
                </p>
                <p className="text-xs text-[#525252] mt-1">
                  Ready to test our shopping cart workflows, catalog views, and real-time checkout?
                </p>
                <a
                  href="https://shop.nexustalent.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#0f62fe] hover:underline"
                >
                  <span>Launch NexusCart Demo</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL INTAKE CTA BANNER */}
      <section className="py-20 bg-[#161616] text-white">
        <div className="container-page">
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-wider text-[#78a9ff]">
                Product Partnerships & Custom Engineering
              </span>
              <h2 className="mt-2 text-3xl font-light text-white md:text-4xl">
                Need a shopping app, custom platform, or internal tool built?
              </h2>
              <p className="mt-3 text-sm text-[#c6c6c6]">
                Our dedicated engineering team partners with startups and enterprises to design, build,
                and deploy custom digital products within 4–8 week sprints.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsTalkModalOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-none bg-[#0f62fe] px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#0353e9]"
            >
              <span>Schedule Engineering Consultation</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      <TalkToUsModal isOpen={isTalkModalOpen} onClose={() => setIsTalkModalOpen(false)} />
    </PublicShell>
  );
}
