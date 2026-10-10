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
      <section className="relative overflow-hidden border-b border-[#e0e0e0] bg-white pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="container-page">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 border border-[#e0e0e0] bg-[#f4f4f4] px-3 py-1 font-mono text-xs font-semibold text-[#525252]">
              <span className="size-1.5 bg-[#0f62fe]" />
              ENGINEERING LABS · ACTIVE PRODUCT BUILDS
            </div>

            <h1 className="text-4xl font-light tracking-tight text-[#161616] sm:text-5xl lg:text-6xl">
              What we are <span className="font-normal text-[#0f62fe]">currently working on</span> & shipping
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#525252]">
              From next-generation e-commerce mobile shopping apps to invisible desktop AI meeting
              co-pilots, explore the platforms Nexus Talent engineers are building, iterating, and
              deploying into production.
            </p>

            {/* Quick Metrics Bar */}
            <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-[#e0e0e0] pt-6 font-mono text-xs text-[#525252]">
              <div className="flex items-center gap-2">
                <span className="size-2 bg-[#0f62fe] animate-pulse" />
                <span className="font-semibold text-[#161616]">{currentlyWorkingOnCount}</span>
                <span>Active Builds In Progress</span>
              </div>
              <span className="text-[#e0e0e0]">|</span>
              <div className="flex items-center gap-2">
                <span className="size-2 bg-[#24a148]" />
                <span className="font-semibold text-[#161616]">{liveCount}</span>
                <span>Live in Production</span>
              </div>
              <span className="text-[#e0e0e0]">|</span>
              <div className="flex items-center gap-2">
                <Globe className="size-3.5 text-[#0f62fe]" />
                <span>Web, Mobile & Win32 Runtimes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER TABS & PRODUCT CATALOG */}
      <section className="py-16 bg-[#f4f4f4] border-b border-[#e0e0e0]">
        <div className="container-page">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-[#0f62fe] font-semibold">
                Product Catalog
              </p>
              <h2 className="text-2xl font-light text-[#161616] mt-1">
                Explore our software builds
              </h2>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1 border border-[#e0e0e0] bg-white p-1">
              <button
                type="button"
                onClick={() => setSelectedFilter("all")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedFilter === "all"
                    ? "bg-[#0f62fe] text-white"
                    : "text-[#525252] hover:bg-[#f4f4f4] hover:text-[#161616]"
                }`}
              >
                All ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("in_development")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
                  selectedFilter === "in_development"
                    ? "bg-[#0f62fe] text-white"
                    : "text-[#525252] hover:bg-[#f4f4f4] hover:text-[#161616]"
                }`}
              >
                <span className="size-1.5 bg-[#0f62fe] animate-pulse" />
                Working On ({currentlyWorkingOnCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("live")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
                  selectedFilter === "live"
                    ? "bg-[#0f62fe] text-white"
                    : "text-[#525252] hover:bg-[#f4f4f4] hover:text-[#161616]"
                }`}
              >
                <span className="size-1.5 bg-[#24a148]" />
                Live ({liveCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("ecommerce")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedFilter === "ecommerce"
                    ? "bg-[#0f62fe] text-white"
                    : "text-[#525252] hover:bg-[#f4f4f4] hover:text-[#161616]"
                }`}
              >
                Shopping & Commerce
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("ai")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedFilter === "ai"
                    ? "bg-[#0f62fe] text-white"
                    : "text-[#525252] hover:bg-[#f4f4f4] hover:text-[#161616]"
                }`}
              >
                Desktop & AI
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
                    className="border border-[#e0e0e0] bg-white p-6 md:p-8 flex flex-col justify-between transition-colors hover:border-[#0f62fe] group"
                  >
                    <div>
                      {/* Top Meta Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e0e0e0] pb-3 mb-5">
                        <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0f62fe]">
                          {product.category}
                        </span>

                        <div className="flex items-center gap-2">
                          {isWorkingOn && (
                            <span className="inline-flex items-center gap-1.5 border border-[#0f62fe] bg-[#edf5ff] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#0043ce]">
                              <span className="size-1.5 bg-[#0f62fe] animate-pulse" />
                              {product.status_label || "Currently Working On"}
                            </span>
                          )}

                          {isLive && (
                            <span className="inline-flex items-center gap-1.5 border border-[#24a148] bg-[#defbe6] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#0e6027]">
                              <span className="size-1.5 bg-[#24a148]" />
                              {product.status_label || "Live in Production"}
                            </span>
                          )}

                          {!isWorkingOn && !isLive && (
                            <span className="border border-[#8d8d8d] bg-[#f4f4f4] px-2 py-0.5 font-mono text-[11px] text-[#161616]">
                              {product.status_label || product.status.toUpperCase()}
                            </span>
                          )}

                          {product.version && (
                            <span className="font-mono text-xs text-[#8d8d8d]">
                              {product.version}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Tagline */}
                      <h3 className="text-xl font-normal text-[#161616] group-hover:text-[#0f62fe] transition-colors">
                        {product.name}
                      </h3>

                      <p className="mt-2 text-sm text-[#525252] leading-relaxed">
                        {product.tagline}
                      </p>

                      {product.description && (
                        <p className="mt-3 text-xs text-[#525252] leading-relaxed line-clamp-3">
                          {product.description}
                        </p>
                      )}

                      {/* Highlights */}
                      {product.highlights && product.highlights.length > 0 && (
                        <div className="mt-5 space-y-1.5 border-t border-[#e0e0e0] pt-4">
                          <p className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[#161616] mb-2">
                            Key Architectural Highlights
                          </p>
                          {product.highlights.slice(0, 3).map((highlight) => (
                            <div key={highlight} className="flex items-start gap-2 text-xs text-[#525252]">
                              <CheckCircle2 className="size-3.5 text-[#24a148] shrink-0 mt-0.5" />
                              <span>{highlight}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Area: Tech Stack & Actions */}
                    <div className="mt-6 pt-5 border-t border-[#e0e0e0]">
                      {/* Tech Pills */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {product.tags.map((tag) => (
                          <span
                            key={tag}
                            className="border border-[#e0e0e0] bg-[#f4f4f4] px-2 py-0.5 font-mono text-[11px] text-[#161616]"
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
                                className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0f62fe] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0353e9]"
                                title={`Download ${action.downloadFilename || "executable"}`}
                              >
                                <Download className="size-3.5" />
                                <span>{action.label}</span>
                              </a>
                            );
                          }
                          return (
                            <a
                              href={action.url}
                              target={action.url.startsWith("http") ? "_blank" : undefined}
                              rel={action.url.startsWith("http") ? "noopener noreferrer" : undefined}
                              className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0f62fe] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0353e9]"
                            >
                              <span>{action.label}</span>
                              <ExternalLink className="size-3.5" />
                            </a>
                          );
                        })()}

                        {product.id === "prod-zozii-ai-02" && (
                          <Link
                            to="/zozii"
                            className="inline-flex items-center justify-center gap-1.5 rounded-none border border-[#0f62fe] px-4 py-2.5 text-xs font-semibold text-[#0f62fe] hover:bg-[#edf5ff] transition-colors"
                          >
                            <span>View Zozii Specs</span>
                            <ArrowRight className="size-3.5" />
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
