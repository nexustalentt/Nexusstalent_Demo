import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Download,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Package,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  Globe,
  X,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Cloud,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell, EmptyState, LoadingBlock } from "@/components/admin/admin-shell";
import {
  useProducts,
  useSaveProduct,
  useDeleteProduct,
  checkSupabaseProductsTable,
  pushLocalProductsToSupabase,
} from "@/lib/products-api";
import { type ProductItem, type ProductStatus, resolveProductAction } from "@/lib/products-store";
import { PRODUCTS_SQL_MIGRATION, SUPABASE_SQL_EDITOR_URL } from "@/lib/products-sql";

export const Route = createFileRoute("/_authenticated/admin/products/")({
  head: () => ({
    meta: [
      { title: "Products & Engineering Labs — Nexus Talent Admin" },
      { name: "description", content: "Manage proprietary products and active software builds." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProductsAdminPage,
});

const productFormSchema = z.object({
  name: z.string().trim().min(2, "Product name is required").max(200),
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

function ProductsAdminPage() {
  const { data: products = [], isLoading } = useProducts();
  const saveMutation = useSaveProduct();
  const deleteMutation = useDeleteProduct();

  // Cloud Database Sync Status
  const [cloudStatus, setCloudStatus] = useState<"checking" | "connected" | "missing_table" | "error">("checking");
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [isCheckingCloud, setIsCheckingCloud] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isSyncingToCloud, setIsSyncingToCloud] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  async function verifyCloudConnection() {
    setIsCheckingCloud(true);
    try {
      const res = await checkSupabaseProductsTable();
      if (res.ok) {
        setCloudStatus("connected");
        setCloudError(null);
      } else {
        setCloudStatus("missing_table");
        setCloudError(res.error || "The 'products' table was not found in your Supabase project.");
      }
    } catch (err: any) {
      setCloudStatus("error");
      setCloudError(err?.message || "Failed to query Supabase.");
    } finally {
      setIsCheckingCloud(false);
    }
  }

  useEffect(() => {
    verifyCloudConnection();
  }, []);

  async function handlePushLocalToCloud() {
    setIsSyncingToCloud(true);
    try {
      const res = await pushLocalProductsToSupabase();
      if (res.error) {
        toast.error(`Cloud sync failed: ${res.error}`);
      } else {
        toast.success(
          `Successfully pushed ${res.count} product(s) to Supabase cloud! All mobile & desktop devices will now see these.`
        );
        verifyCloudConnection();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to sync to Supabase");
    } finally {
      setIsSyncingToCloud(false);
    }
  }

  function handleCopySql() {
    navigator.clipboard.writeText(PRODUCTS_SQL_MIGRATION);
    setSqlCopied(true);
    toast.success("SQL setup script copied to clipboard!");
    setTimeout(() => setSqlCopied(false), 2500);
  }

  // Lock background scroll when any modal is open so mouse/touch scrolling stays inside the modal
  useEffect(() => {
    if (isModalOpen || isSqlModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen, isSqlModalOpen]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

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
  const [tags, setTags] = useState("");
  const [highlights, setHighlights] = useState("");
  const [version, setVersion] = useState("v1.0 WIP");
  const [featured, setFeatured] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setTagline("");
    setDescription("");
    setCategory("E-Commerce & Retail");
    setStatus("in_development");
    setStatusLabel("Currently Working On");
    setLinkType("website");
    setWebsiteUrl("");
    setPreviewUrl("");
    setTags("React, Next.js, Stripe, Tailwind CSS");
    setHighlights("Instant search, Real-time checkout, Responsive UX");
    setVersion("v1.0 WIP");
    setFeatured(false);
    setEditingProduct(null);
    setFormError(null);
  }

  function handleOpenCreate() {
    resetForm();
    setIsModalOpen(true);
  }

  function handleOpenEdit(product: ProductItem) {
    setEditingProduct(product);
    setName(product.name);
    setTagline(product.tagline);
    setDescription(product.description || "");
    setCategory(product.category);
    setStatus(product.status);
    setStatusLabel(product.status_label || "");
    const inferredType =
      product.link_type ||
      (product.website_url?.includes("jobconnect-x-e65f4f66") ||
      product.website_url?.includes("Screenshot.Saver") ||
      product.website_url?.endsWith(".exe") ||
      product.website_url === "/downloads/Screenshot.Saver.1.exe"
        ? "exe"
        : "website");
    setLinkType(inferredType);
    setWebsiteUrl(product.website_url || "");
    setPreviewUrl(product.preview_url || "");
    setTags(product.tags.join(", "));
    setHighlights((product.highlights || []).join("\n"));
    setVersion(product.version || "v1.0");
    setFeatured(Boolean(product.featured));
    setFormError(null);
    setIsModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
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
        ...(editingProduct?.id ? { id: editingProduct.id } : {}),
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
          toast.success(editingProduct ? "Product updated successfully" : "New product published");
          setIsModalOpen(false);
          resetForm();
        },
        onError: (err: any) => {
          setFormError(err.message || "Failed to save product.");
        },
      },
    );
  }

  function handleDelete(product: ProductItem) {
    if (!product?.id) {
      toast.error("Unable to identify product ID.");
      return;
    }

    const confirmed =
      typeof window === "undefined" ||
      window.confirm(`Are you sure you want to delete "${product.name}"?`);

    if (!confirmed) return;

    deleteMutation.mutate(product.id, {
      onSuccess: () => {
        toast.success(`"${product.name}" deleted successfully`);
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to delete product");
      },
    });
  }

  // Statistics
  const inDevCount = products.filter((p) => p.status === "in_development").length;
  const liveCount = products.filter((p) => p.status === "live").length;
  const totalCount = products.length;

  return (
    <AdminShell
      title="Products & Active Builds"
      description="Manage the live products, shopping applications, and tools we are currently building."
      actions={
        <div className="flex items-center gap-2">
          {cloudStatus === "missing_table" && (
            <button
              type="button"
              onClick={() => setIsSqlModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#da1e28] px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#ba1b23]"
            >
              <Terminal className="size-4" />
              Setup Cloud Sync (SQL)
            </button>
          )}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-none bg-[#0f62fe] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0353e9]"
          >
            <Plus className="size-4" />
            Add Product
          </button>
        </div>
      }
    >
      {/* Supabase Cloud Connection & Sync Status Banner */}
      {cloudStatus === "missing_table" || cloudStatus === "error" ? (
        <div className="mb-8 border-l-4 border-l-[#da1e28] border border-[#ff8389] bg-[#fff1f1] p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-[#da1e28] shrink-0" />
                <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-[#da1e28]">
                  Database Setup Required: Products Table Missing in Supabase
                </h3>
              </div>
              <p className="text-sm text-[#161616] leading-relaxed">
                The <code className="bg-[#ffd7d9] px-1.5 py-0.5 font-mono text-xs font-semibold text-[#da1e28]">public.products</code> table has not been created yet in your Supabase project. Because the table does not exist in the database, any added, updated, or deleted products are <strong>only saved temporarily in this browser</strong> and <strong>will NOT appear on mobile phones, tablets, or other devices</strong>.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="font-mono text-[11px] text-[#525252]">Database status:</span>
                <span className="font-mono text-[11px] text-[#da1e28] bg-white border border-[#ff8389] px-2 py-0.5">
                  {cloudError || 'relation "public.products" does not exist'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 md:self-center">
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#da1e28] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#ba1b23] transition-colors shadow-sm"
              >
                <Terminal className="size-4" />
                <span>View & Copy SQL Script</span>
              </button>
              <button
                type="button"
                onClick={verifyCloudConnection}
                disabled={isCheckingCloud}
                className="inline-flex items-center gap-1.5 border border-[#161616] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#161616] hover:bg-[#161616] hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`size-3.5 ${isCheckingCloud ? "animate-spin" : ""}`} />
                <span>Re-check</span>
              </button>
            </div>
          </div>
        </div>
      ) : cloudStatus === "connected" ? (
        <div className="mb-8 border-l-4 border-l-[#24a148] border border-[#a7f0ba] bg-[#defbe6] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 text-[#24a148] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#0e6027]">
                Supabase Cloud Sync Active — Live Across Mobile & All Devices
              </p>
              <p className="text-[11px] text-[#525252] mt-0.5">
                Every added, updated, and deleted product syncs in real-time to your Supabase PostgreSQL database.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePushLocalToCloud}
              disabled={isSyncingToCloud}
              className="inline-flex items-center gap-1.5 border border-[#24a148] bg-white px-3 py-1.5 text-xs font-semibold text-[#0e6027] hover:bg-[#24a148] hover:text-white transition-colors disabled:opacity-50"
              title="Push all local items to Supabase"
            >
              <Cloud className="size-3.5" />
              <span>{isSyncingToCloud ? "Syncing…" : "Push Local Cache to Cloud"}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSqlModalOpen(true)}
              className="inline-flex items-center gap-1.5 border border-[#e0e0e0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#525252] hover:text-[#161616] transition-colors"
            >
              <span>View SQL</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Metric Stat Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <div className="border border-[#e0e0e0] bg-white p-5">
          <p className="font-mono text-xs uppercase text-[#525252]">Total Catalog</p>
          <p className="mt-2 text-3xl font-light text-[#161616]">{totalCount}</p>
          <p className="mt-1 text-xs text-[#525252]">Active entries in showcase</p>
        </div>

        <div className="border border-[#e0e0e0] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs uppercase text-[#0f62fe]">Currently Working On</p>
            <span className="size-2 bg-[#0f62fe] animate-pulse" />
          </div>
          <p className="mt-2 text-3xl font-light text-[#0f62fe]">{inDevCount}</p>
          <p className="mt-1 text-xs text-[#525252]">In active sprint development</p>
        </div>

        <div className="border border-[#e0e0e0] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs uppercase text-[#24a148]">Live in Production</p>
            <span className="size-2 bg-[#24a148]" />
          </div>
          <p className="mt-2 text-3xl font-light text-[#24a148]">{liveCount}</p>
          <p className="mt-1 text-xs text-[#525252]">Deployed and accessible</p>
        </div>
      </div>

      {/* Main Products Grid / List */}
      {isLoading ? (
        <LoadingBlock rows={4} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          hint="Click 'Add Product' above to add your first shopping app, platform or tool."
        />
      ) : (
        <div className="space-y-4">
          <div className="border border-[#e0e0e0] bg-white">
            <div className="border-b border-[#e0e0e0] px-6 py-4 flex items-center justify-between">
              <h2 className="font-mono text-xs uppercase tracking-wider font-semibold text-[#161616]">
                Product Inventory ({products.length})
              </h2>
              <span className="text-xs text-[#525252]">Reflected on public /products page</span>
            </div>

            <div className="divide-y divide-[#e0e0e0]">
              {products.map((item) => {
                const isWorkingOn = item.status === "in_development";
                const isLive = item.status === "live";

                return (
                  <div
                    key={item.id}
                    className="p-6 transition-colors hover:bg-[#f4f4f4]/60 flex flex-col md:flex-row md:items-start md:justify-between gap-6"
                  >
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs uppercase text-[#0f62fe] font-semibold">
                          {item.category}
                        </span>
                        <span className="text-[#8d8d8d]">·</span>

                        {isWorkingOn && (
                          <span className="inline-flex items-center gap-1.5 border border-[#0f62fe] bg-[#edf5ff] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#0043ce]">
                            <span className="size-1.5 bg-[#0f62fe] animate-pulse" />
                            {item.status_label || "Currently Working On"}
                          </span>
                        )}

                        {isLive && (
                          <span className="inline-flex items-center gap-1.5 border border-[#24a148] bg-[#defbe6] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#0e6027]">
                            <span className="size-1.5 bg-[#24a148]" />
                            {item.status_label || "Live in Production"}
                          </span>
                        )}

                        {!isWorkingOn && !isLive && (
                          <span className="border border-[#8d8d8d] bg-[#e0e0e0] px-2 py-0.5 font-mono text-[10px] text-[#161616]">
                            {item.status_label || item.status.toUpperCase()}
                          </span>
                        )}

                        {item.version && (
                          <span className="font-mono text-xs text-[#525252]">
                            ({item.version})
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-[#161616]">{item.name}</h3>
                      <p className="text-sm text-[#525252] leading-relaxed">{item.tagline}</p>

                      {item.website_url && (() => {
                        const action = resolveProductAction(item);
                        return (
                          <div className="pt-1 flex items-center gap-2">
                            {action?.isDownload ? (
                              <Download className="size-3.5 text-[#0f62fe]" />
                            ) : (
                              <Globe className="size-3.5 text-[#0f62fe]" />
                            )}
                            <a
                              href={action?.url || item.website_url}
                              download={action?.isDownload ? action.downloadFilename : undefined}
                              target={action?.isDownload ? undefined : "_blank"}
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-[#0f62fe] hover:underline flex items-center gap-1"
                            >
                              <span>{action?.isDownload ? `Download (${action.downloadFilename})` : item.website_url}</span>
                              {action?.isDownload ? <Download className="size-3" /> : <ExternalLink className="size-3" />}
                            </a>
                          </div>
                        );
                      })()}

                      {/* Tech stack pills */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="border border-[#e0e0e0] bg-[#ffffff] px-2 py-0.5 font-mono text-[11px] text-[#525252]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 md:self-center">
                      {item.website_url && (() => {
                        const action = resolveProductAction(item);
                        return action?.isDownload ? (
                          <a
                            href={action.url}
                            download={action.downloadFilename}
                            className="inline-flex items-center gap-1.5 border border-[#0f62fe] bg-[#edf5ff] px-3 py-2 text-xs font-semibold text-[#0043ce] hover:bg-[#0f62fe] hover:text-white transition-colors"
                            title={`Download ${action.downloadFilename}`}
                          >
                            <Download className="size-3.5" />
                            <span>Download</span>
                          </a>
                        ) : (
                          <a
                            href={item.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 border border-[#161616] bg-white px-3 py-2 text-xs font-semibold text-[#161616] hover:bg-[#161616] hover:text-white transition-colors"
                          >
                            <ExternalLink className="size-3.5" />
                            <span>Visit</span>
                          </a>
                        );
                      })()}

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="inline-flex items-center gap-1.5 border border-[#e0e0e0] bg-white px-3 py-2 text-xs font-semibold text-[#525252] hover:border-[#0f62fe] hover:text-[#0f62fe] transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="size-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === item.id}
                        className="inline-flex items-center gap-1.5 border border-[#e0e0e0] bg-white px-3 py-2 text-xs font-semibold text-[#da1e28] hover:bg-[#fff1f1] transition-colors disabled:opacity-50"
                        title="Delete product"
                      >
                        <Trash2 className="size-3.5" />
                        <span>{deleteMutation.isPending && deleteMutation.variables === item.id ? "Deleting…" : "Delete"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL (Carbon Flat Style) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-6 backdrop-blur-[2px] overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#e0e0e0] bg-white shadow-2xl overflow-hidden">
            {/* Fixed Header */}
            <div className="flex items-center justify-between border-b border-[#e0e0e0] bg-[#f4f4f4] px-6 py-4 shrink-0">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#0f62fe] font-semibold">
                  Carbon Product Editor
                </span>
                <h3 className="text-xl font-light text-[#161616] mt-0.5">
                  {editingProduct ? "Edit Product Details" : "Add New Product"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#525252] hover:bg-[#e0e0e0] hover:text-[#161616] transition-colors"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              id="product-modal-form"
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5 overscroll-contain"
            >
              {formError && (
                <div className="border-l-2 border-[#da1e28] bg-[#fff1f1] px-4 py-3 text-sm text-[#da1e28]">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. OmniCart Shopping App"
                    className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. E-Commerce & Retail, Mobile App, AI"
                    className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1">
                  Tagline / Pitch (Summary) *
                </label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Modern shopping application with fast checkout and multi-vendor inventory."
                  className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1">
                    Current Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => {
                      const val = e.target.value as ProductStatus;
                      setStatus(val);
                      if (val === "in_development") setStatusLabel("Currently Working On");
                      if (val === "live") setStatusLabel("Live in Production");
                      if (val === "beta") setStatusLabel("Public Beta");
                      if (val === "planned") setStatusLabel("Planned Stage");
                    }}
                    className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                  >
                    <option value="in_development">Currently Working On (In Dev)</option>
                    <option value="live">Live in Production</option>
                    <option value="beta">Beta Testing</option>
                    <option value="planned">Planned / In Design</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1">
                    Custom Status Badge Text
                  </label>
                  <input
                    type="text"
                    value={statusLabel}
                    onChange={(e) => setStatusLabel(e.target.value)}
                    placeholder="e.g. Currently Working On, Active Sprint"
                    className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1.5">
                  Action Link Option *
                </label>
                <div className="flex flex-wrap items-center gap-6 p-3 bg-[#f4f4f4] border border-[#e0e0e0]">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#161616]">
                    <input
                      type="radio"
                      name="linkTypeOption"
                      checked={linkType === "website"}
                      onChange={() => setLinkType("website")}
                      className="size-4 text-[#0f62fe] focus:ring-[#0f62fe]"
                    />
                    <span>Website Link (Opens External or Internal URL)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#161616]">
                    <input
                      type="radio"
                      name="linkTypeOption"
                      checked={linkType === "exe"}
                      onChange={() => setLinkType("exe")}
                      className="size-4 text-[#0f62fe] focus:ring-[#0f62fe]"
                    />
                    <span>Executable / Download (.exe or release file)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1">
                    {linkType === "exe" ? "exe URL / GitHub Release URL *" : "Website URL / App Link *"}
                  </label>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder={
                      linkType === "exe"
                        ? "e.g. https://github.com/nexustalentt/jobconnect-x-e65f4f66/releases/tag/V01_S"
                        : "e.g. https://shop.nexustalent.io"
                    }
                    className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                  />
                  <p className="mt-1 text-xs text-[#525252]">
                    {linkType === "exe"
                      ? "Displays a 'Download' button on the main page that downloads the application."
                      : "Displays an 'Open Website / App' button on the main page."}
                  </p>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1">
                    Version / Stage Label
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g. v0.9-WIP or v1.0.0"
                    className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1">
                  Technology Stack (Comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="React, Next.js, Node.js, Stripe, Tailwind CSS"
                  className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1">
                  Key Highlights / Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  placeholder="Instant 1-click checkout&#10;Multi-vendor inventory lock&#10;Sub-200ms catalog indexing"
                  className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#525252] mb-1">
                  Detailed Description (Architecture, Architecture Notes)
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed notes on what this product solves, the engineering stack, and how users interact with it."
                  className="w-full border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3.5 py-2.5 text-sm text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
                />
              </div>

            </form>

            {/* Fixed Sticky Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[#e0e0e0] bg-white px-6 py-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="border border-[#161616] px-5 py-2.5 text-xs font-semibold text-[#161616] hover:bg-[#161616] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="product-modal-form"
                disabled={saveMutation.isPending}
                className="bg-[#0f62fe] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#0353e9] transition-colors disabled:opacity-50"
              >
                {saveMutation.isPending
                  ? "Saving…"
                  : editingProduct
                    ? "Update Product"
                    : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPABASE SQL SCRIPT MODAL */}
      {isSqlModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-6 backdrop-blur-[2px] overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsSqlModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col border border-[#e0e0e0] bg-white shadow-2xl overflow-hidden">
            {/* Fixed Header */}
            <div className="flex items-center justify-between border-b border-[#e0e0e0] bg-[#f4f4f4] px-6 py-4 shrink-0">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#da1e28] font-semibold">
                  Database Initialization
                </span>
                <h3 className="text-xl font-light text-[#161616] mt-0.5">
                  Run SQL Script in Supabase to Enable Multi-Device Sync
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="p-1.5 text-[#525252] hover:bg-[#e0e0e0] hover:text-[#161616] transition-colors"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 text-sm text-[#161616] overscroll-contain">
              <div className="border border-[#0f62fe]/20 bg-[#edf5ff] p-4">
                <h4 className="font-semibold text-xs text-[#0043ce] uppercase font-mono tracking-wider mb-2">
                  Follow these 3 quick steps to enable syncing across mobile & all devices:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-[#161616] leading-relaxed">
                  <li>
                    Click the <strong>Open Supabase SQL Editor</strong> button below (or go to your Supabase project dashboard → SQL Editor).
                  </li>
                  <li>
                    Click <strong>Copy SQL Code</strong> below, paste the entire script into the Supabase SQL Editor, and click the green <strong>Run</strong> button.
                  </li>
                  <li>
                    Once executed in Supabase, return here and click <strong>Verify Database Connection</strong>. Your products will instantly sync across all mobile devices, tablets, and browsers!
                  </li>
                </ol>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <span className="font-mono text-xs text-[#525252] font-semibold">
                  SQL Migration Script (supabase/migrations/20261010190000_products_table.sql)
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={SUPABASE_SQL_EDITOR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-[#0f62fe] bg-white px-3 py-1.5 text-xs font-semibold text-[#0f62fe] hover:bg-[#0f62fe] hover:text-white transition-colors"
                  >
                    <span>Open Supabase SQL Editor</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1.5 bg-[#161616] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#393939] transition-colors"
                  >
                    {sqlCopied ? <Check className="size-3.5 text-[#24a148]" /> : <Copy className="size-3.5" />}
                    <span>{sqlCopied ? "Copied to Clipboard!" : "Copy SQL Code"}</span>
                  </button>
                </div>
              </div>

              <div className="relative max-h-80 overflow-y-auto border border-[#e0e0e0] bg-[#161616] p-4 font-mono text-xs text-[#f4f4f4]">
                <pre className="whitespace-pre-wrap">{PRODUCTS_SQL_MIGRATION}</pre>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e0e0e0] bg-white px-6 py-4 shrink-0">
              <span className="text-xs text-[#525252]">
                RLS is enabled with public read access and full admin capabilities.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSqlModalOpen(false)}
                  className="border border-[#161616] px-4 py-2 text-xs font-semibold text-[#161616] hover:bg-[#161616] hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await verifyCloudConnection();
                    setIsSqlModalOpen(false);
                    if (cloudStatus === "connected") {
                      toast.success("Supabase products table confirmed active!");
                    }
                  }}
                  className="bg-[#0f62fe] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0353e9] transition-colors"
                >
                  Verify Database Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

