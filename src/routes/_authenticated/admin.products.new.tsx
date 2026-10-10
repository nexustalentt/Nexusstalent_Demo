import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell } from "@/components/admin/admin-shell";
import { useSaveProduct } from "@/lib/products-api";
import { type ProductStatus } from "@/lib/products-store";

export const Route = createFileRoute("/_authenticated/admin/products/new")({
  head: () => ({
    meta: [
      { title: "Add New Product — Nexus Talent Admin" },
      { name: "description", content: "Publish a proprietary product or active build to the showcase." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewProductPage,
});

const productFormSchema = z.object({
  name: z.string().trim().min(2, "Product name is required (min 2 characters)").max(200),
  tagline: z.string().trim().min(2, "Tagline / summary is required"),
  description: z.string().trim().optional(),
  category: z.string().trim().min(2, "Category is required").max(100),
  status: z.enum(["in_development", "live", "beta", "planned"]),
  status_label: z.string().trim().max(100).optional(),
  link_type: z.enum(["website", "exe"]).default("website"),
  website_url: z
    .string()
    .trim()
    .refine(
      (val) => !val || val.startsWith("/") || /^https?:\/\//i.test(val),
      "Must be a valid URL (https://...) or download path (/downloads/...)"
    )
    .optional()
    .or(z.literal("")),
  preview_url: z
    .string()
    .trim()
    .refine(
      (val) => !val || val.startsWith("/") || /^https?:\/\//i.test(val),
      "Must be a valid URL (https://...) or path"
    )
    .optional()
    .or(z.literal("")),
  tags: z.string().trim(),
  highlights: z.string().trim(),
  version: z.string().trim().max(60).optional(),
  featured: z.boolean().default(false),
});

const CATEGORY_PRESETS = [
  "E-Commerce & Retail",
  "Artificial Intelligence & ML",
  "Desktop Apps & Native Tools",
  "Enterprise SaaS & Portals",
  "Healthcare & Life Sciences",
  "FinTech & Payments",
  "Developer Tools & APIs",
];

function NewProductPage() {
  const navigate = useNavigate();
  const saveMutation = useSaveProduct();

  // Form states
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("E-Commerce & Retail");
  const [status, setStatus] = useState<ProductStatus>("in_development");
  const [statusLabel, setStatusLabel] = useState("Currently Working On");
  const [linkType, setLinkType] = useState<"website" | "exe">("website");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [tags, setTags] = useState("React, Next.js, Stripe, Tailwind CSS");
  const [highlights, setHighlights] = useState(
    "Instant 1-click checkout\nMulti-vendor inventory lock\nSub-200ms catalog indexing"
  );
  const [version, setVersion] = useState("v1.0 WIP");
  const [featured, setFeatured] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = productFormSchema.safeParse({
      name,
      tagline,
      description,
      category,
      status,
      status_label: statusLabel,
      link_type: linkType,
      website_url: websiteUrl,
      preview_url: previewUrl,
      tags,
      highlights,
      version,
      featured,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Please check form entries.");
      return;
    }

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const highlightList = highlights
      .split("\n")
      .map((h) => h.trim())
      .filter(Boolean);

    saveMutation.mutate(
      {
        name: parsed.data.name,
        tagline: parsed.data.tagline,
        description: parsed.data.description || "",
        category: parsed.data.category,
        status: parsed.data.status,
        status_label: parsed.data.status_label || undefined,
        link_type: parsed.data.link_type,
        website_url: parsed.data.website_url || undefined,
        preview_url: parsed.data.preview_url || undefined,
        tags: tagList,
        highlights: highlightList,
        version: parsed.data.version || "v1.0",
        featured: parsed.data.featured,
      },
      {
        onSuccess: () => {
          toast.success(`"${name}" created successfully!`);
          navigate({ to: "/admin/products" });
        },
        onError: (err: any) => {
          setFormError(err.message || "Failed to create product. Check database connection.");
        },
      }
    );
  }

  return (
    <AdminShell
      title="Add New Product"
      description="Create a new proprietary tool, shopping application, desktop software or platform."
      actions={
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 border border-[#161616] px-4 py-2.5 text-xs font-semibold text-[#161616] transition-colors hover:bg-[#161616] hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to Products
        </Link>
      }
    >
      <div className="max-w-4xl space-y-6">
        <form
          onSubmit={handleSubmit}
          className="border border-[#e0e0e0] bg-white p-6 md:p-8 space-y-6 shadow-sm"
        >
          {formError && (
            <div className="flex items-center gap-2 border-l-4 border-l-[#da1e28] border border-[#ff8389] bg-[#fff1f1] p-4 text-sm text-[#da1e28]">
              <AlertTriangle className="size-5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Product Identification */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0f62fe]">
              Product Overview
            </h3>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1.5 font-medium">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. OmniCart Shopping Platform"
                  className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1.5 font-medium">
                  Category *
                </label>
                <div className="flex gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                  >
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1.5 font-medium">
                Tagline / Pitch (Summary shown on cards) *
              </label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Next-generation mobile-first e-commerce engine with sub-second search and multi-vendor checkout"
                className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
              />
            </div>
          </div>

          <div className="border-t border-[#e0e0e0] pt-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0f62fe]">
              Status & Delivery Configuration
            </h3>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1.5 font-medium">
                  Lifecycle Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    const next = e.target.value as ProductStatus;
                    setStatus(next);
                    if (next === "in_development") setStatusLabel("Currently Working On");
                    else if (next === "live") setStatusLabel("Live & In Production");
                    else if (next === "beta") setStatusLabel("Beta Testing");
                    else if (next === "planned") setStatusLabel("Architecture Phase");
                  }}
                  className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                >
                  <option value="in_development">In Development (Working On)</option>
                  <option value="live">Live in Production</option>
                  <option value="beta">Beta Release</option>
                  <option value="planned">Planned Architecture</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1.5 font-medium">
                  Custom Status Badge
                </label>
                <input
                  type="text"
                  value={statusLabel}
                  onChange={(e) => setStatusLabel(e.target.value)}
                  placeholder="e.g. Currently Working On"
                  className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1.5 font-medium">
                  Version
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. v1.0 WIP"
                  className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1.5 font-medium">
                  Product Link Type
                </label>
                <select
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value as "website" | "exe")}
                  className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                >
                  <option value="website">🌐 Web Application (URL)</option>
                  <option value="exe">💻 Desktop Software / Download (.exe)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1.5 font-medium">
                  {linkType === "exe" ? "Download File URL (.exe)" : "Website / Application URL"}
                </label>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder={
                    linkType === "exe"
                      ? "e.g. /downloads/Screenshot.Saver.1.exe"
                      : "e.g. https://omnicart.nexustalent.com"
                  }
                  className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1.5 font-medium">
                Live Preview / Interactive Demo URL (Optional)
              </label>
              <input
                type="text"
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
                placeholder="e.g. https://demo.omnicart.nexustalent.com"
                className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
              />
            </div>
          </div>

          <div className="border-t border-[#e0e0e0] pt-6 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0f62fe]">
              Tech Stack & Feature Details
            </h3>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1.5 font-medium">
                Technology Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="React, Next.js, Stripe, Tailwind CSS, TypeScript"
                className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1.5 font-medium">
                Key Highlights / Features (One per line)
              </label>
              <textarea
                rows={3}
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder={"Instant 1-click checkout\nMulti-vendor inventory lock\nSub-200ms catalog indexing"}
                className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1.5 font-medium">
                Detailed Engineering & Architecture Notes
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive overview of architecture, data flow, integration with payment gateways, and backend services."
                className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="featured-checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="size-4 accent-[#0f62fe]"
              />
              <label
                htmlFor="featured-checkbox"
                className="cursor-pointer text-xs font-semibold text-[#161616] flex items-center gap-1.5"
              >
                <Sparkles className="size-3.5 text-[#0f62fe]" />
                Feature this product prominently at the top of the showcase
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#e0e0e0] pt-6">
            <Link
              to="/admin/products"
              className="border border-[#161616] px-5 py-2.5 text-xs font-semibold text-[#161616] transition-colors hover:bg-[#161616] hover:text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 bg-[#0f62fe] px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0353e9] disabled:opacity-50"
            >
              <Save className="size-4" />
              {saveMutation.isPending ? "Publishing Product…" : "Publish Product"}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
