import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  X,
  Phone,
  Mail,
  Send,
  Sparkles,
  Building2,
  Clock,
  MapPin,
  ExternalLink,
  Search,
  CheckCircle2,
  Copy,
  Laptop,
  Users,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { siteSettingsQuery } from "@/lib/queries";
import { submitInquiry } from "@/lib/inquiries.functions";
import { NexusLogo } from "@/components/brand/nexus-logo";

interface TalkToUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TalkToUsModal({ isOpen, onClose }: TalkToUsModalProps) {
  const { data: settings } = useQuery(siteSettingsQuery);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"channels" | "message">("channels");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const phoneNumber = settings?.phone || "+91 80 4123 4567";
  const rawPhoneNumber = phoneNumber.replace(/[^0-9+]/g, "");
  const companyEmail = settings?.company_email || "contact@nexustalent.com";
  const recruitmentEmail = settings?.recruitment_email || "careers@nexustalent.com";
  const officeAddress =
    settings?.address || "Prestige Tech Park, Outer Ring Road, Bengaluru, Karnataka, India";
  const businessHours = settings?.business_hours || "Monday – Friday: 9:00 AM – 6:30 PM IST";

  // WhatsApp formatted link
  const whatsappUrl = `https://wa.me/${rawPhoneNumber.replace("+", "")}?text=${encodeURIComponent(
    "Hello Nexus Talent & Nexus Digital team! I would like to learn more about your services.",
  )}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }

    setPending(true);
    try {
      await submitInquiry({
        data: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || "",
          company: "",
          message: `[DIRECT TALK TO US WIDGET]\nPhone: ${phone || "N/A"}\nMessage:\n${message.trim()}`,
        },
      });
      toast.success("Message sent! Our solutions advisor will reply shortly.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setActiveTab("channels");
      onClose();
    } catch {
      toast.error("Something went wrong. Please try WhatsApp or email directly.");
    } finally {
      setPending(false);
    }
  };

  // Agent Search Matches
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return null;

    const results = [];

    if (
      q.includes("phone") ||
      q.includes("call") ||
      q.includes("number") ||
      q.includes("contact")
    ) {
      results.push({
        id: "phone",
        type: "Direct Call",
        icon: Phone,
        title: "Call Direct Phone Line",
        value: phoneNumber,
        actionLabel: "Call Now",
        action: () => (window.location.href = `tel:${rawPhoneNumber}`),
      });
    }

    if (q.includes("whatsapp") || q.includes("chat") || q.includes("message") || q.includes("wa")) {
      results.push({
        id: "whatsapp",
        type: "WhatsApp",
        icon: MessageCircle,
        title: "Direct WhatsApp Chat",
        value: "Instant support & team chat",
        actionLabel: "Open WhatsApp",
        action: () => window.open(whatsappUrl, "_blank"),
      });
    }

    if (q.includes("email") || q.includes("mail") || q.includes("inquiry")) {
      results.push({
        id: "email",
        type: "Email",
        icon: Mail,
        title: "Official Email Address",
        value: companyEmail,
        actionLabel: "Email Us",
        action: () => (window.location.href = `mailto:${companyEmail}`),
      });
      results.push({
        id: "recruitment_email",
        type: "Careers Email",
        icon: Mail,
        title: "Recruitment & Careers Inbox",
        value: recruitmentEmail,
        actionLabel: "Email Hiring",
        action: () => (window.location.href = `mailto:${recruitmentEmail}`),
      });
    }

    if (
      q.includes("website") ||
      q.includes("build") ||
      q.includes("product") ||
      q.includes("small business") ||
      q.includes("app")
    ) {
      results.push({
        id: "digital",
        type: "Nexus Digital",
        icon: Laptop,
        title: "Build a Website or Product",
        value: "Custom websites, web apps & small business solutions",
        actionLabel: "Start Project",
        action: () => {
          window.location.href = "/for-businesses#start-project";
          onClose();
        },
      });
    }

    if (
      q.includes("hire") ||
      q.includes("talent") ||
      q.includes("consult") ||
      q.includes("staff")
    ) {
      results.push({
        id: "consulting",
        type: "Talent Consulting",
        icon: Users,
        title: "Enterprise Staffing & Consulting",
        value: "Senior recruitment, contract staffing & IT augmentation",
        actionLabel: "Explore Talent",
        action: () => {
          window.location.href = "/services";
          onClose();
        },
      });
    }

    if (
      q.includes("hour") ||
      q.includes("time") ||
      q.includes("open") ||
      q.includes("address") ||
      q.includes("office") ||
      q.includes("location")
    ) {
      results.push({
        id: "office",
        type: "Office & Hours",
        icon: MapPin,
        title: "Bengaluru Office & Hours",
        value: `${businessHours} • ${officeAddress}`,
        actionLabel: "View on Map",
        action: () =>
          window.open(`https://maps.google.com/?q=${encodeURIComponent(officeAddress)}`, "_blank"),
      });
    }

    return results;
  }, [
    searchQuery,
    phoneNumber,
    rawPhoneNumber,
    companyEmail,
    recruitmentEmail,
    businessHours,
    officeAddress,
    whatsappUrl,
    onClose,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end sm:p-6 p-0 pointer-events-none">
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-primary/40 backdrop-blur-xs transition-opacity pointer-events-auto sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Drawer / Floating Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="talk-to-us-title"
        className="pointer-events-auto relative flex flex-col w-full sm:max-w-md max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl border border-primary/10 bg-card shadow-2xl overflow-hidden animate-fade-up"
      >
        {/* Header Bar */}
        <div className="relative bg-gradient-to-r from-primary to-primary/95 text-primary-foreground p-5 sm:p-6 pb-5">
          {/* Subtle Mobile Drag Indicator */}
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/30 sm:hidden" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <NexusLogo size={36} className="rounded-xl shadow-md" />
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-primary" />
              </div>
              <div>
                <h2
                  id="talk-to-us-title"
                  className="text-base font-bold text-white tracking-tight flex items-center gap-2"
                >
                  Talk to Us
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    Online
                  </span>
                </h2>
                <p className="text-xs text-primary-foreground/75">
                  Nexus Talent & Digital Solutions Advisor
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/10 p-2 text-primary-foreground/80 hover:bg-white/20 transition-colors"
              aria-label="Close dialog"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Quick Tab Switcher */}
          <div className="mt-4 flex gap-2 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab("channels");
                setSearchQuery("");
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                activeTab === "channels"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              Direct Contacts & Search
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("message")}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                activeTab === "message"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              Send Fast Message
            </button>
          </div>
        </div>

        {/* Content Body with Independent Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === "channels" ? (
            <>
              {/* Intelligent Contact Agent Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search phone, WhatsApp, email, websites, hiring..."
                  className="w-full rounded-xl border border-primary/10 bg-surface pl-10 pr-8 py-2.5 text-xs text-primary outline-none focus:border-accent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-primary"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Filter Tag Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "💬 WhatsApp", q: "whatsapp" },
                  { label: "📞 Call Phone", q: "phone" },
                  { label: "✉️ Email", q: "email" },
                  { label: "🌐 Build Website", q: "website" },
                  { label: "👥 Hire Talent", q: "talent" },
                  { label: "📍 Office Hours", q: "hours" },
                ].map((chip) => (
                  <button
                    key={chip.q}
                    type="button"
                    onClick={() => setSearchQuery(chip.q)}
                    className="rounded-full border border-primary/10 bg-surface px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Search Results if user searched */}
              {searchResults !== null && (
                <div className="space-y-2 pt-1 border-t border-primary/5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Search Results ({searchResults.length})
                  </p>
                  {searchResults.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-primary/10 p-4 text-center text-xs text-muted-foreground">
                      No direct matches found. Try "WhatsApp", "Phone", or "Email", or send a
                      message directly.
                    </div>
                  ) : (
                    searchResults.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl border border-primary/10 bg-surface p-3 transition-colors hover:border-accent/40"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                              <Icon className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-primary truncate">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {item.value}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={item.action}
                            className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground hover:opacity-90"
                          >
                            {item.actionLabel}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Standard Quick Channels Cards (Visible when not actively searching or as default) */}
              {searchResults === null && (
                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Instant Connect Channels
                  </p>

                  {/* 1. Direct WhatsApp */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 transition-all hover:bg-emerald-500/10 hover:border-emerald-500/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold">
                        <MessageCircle className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-primary">Chat on WhatsApp</span>
                          <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600">
                            Fastest
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Direct conversation with team
                        </p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shrink-0">
                      Open Chat →
                    </span>
                  </a>

                  {/* 2. Direct Phone Call */}
                  <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-surface p-3.5">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Phone className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-primary truncate">
                          Direct Phone Support
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                          {phoneNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(phoneNumber, "phone number")}
                        className="rounded-lg border border-primary/10 bg-card p-1.5 text-muted-foreground hover:text-primary"
                        title="Copy phone number"
                      >
                        {copiedField === "phone number" ? (
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                      <a
                        href={`tel:${rawPhoneNumber}`}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-accent transition-colors"
                      >
                        Call
                      </a>
                    </div>
                  </div>

                  {/* 3. Direct Email */}
                  <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-surface p-3.5">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Mail className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-primary truncate">Email Inquiries</p>
                        <p className="text-[11px] text-muted-foreground truncate">{companyEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(companyEmail, "email")}
                        className="rounded-lg border border-primary/10 bg-card p-1.5 text-muted-foreground hover:text-primary"
                        title="Copy email address"
                      >
                        {copiedField === "email" ? (
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                      <a
                        href={`mailto:${companyEmail}`}
                        className="rounded-lg bg-surface border border-primary/15 px-3 py-1.5 text-xs font-bold text-primary hover:bg-card transition-colors"
                      >
                        Write
                      </a>
                    </div>
                  </div>

                  {/* 4. Hours & Location Card */}
                  <div className="rounded-xl border border-primary/10 bg-surface/60 p-3.5 text-xs text-muted-foreground space-y-2">
                    <div className="flex items-start gap-2">
                      <Clock className="size-3.5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-primary font-semibold">Hours: </strong>
                        <span>{businessHours}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="size-3.5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-primary font-semibold">Location: </strong>
                        <span>{officeAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Fast In-Widget Inquiry Form */
            <form onSubmit={handleInquirySubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Mitchell"
                  required
                  className="mt-1 w-full rounded-xl border border-primary/10 bg-surface px-3 py-2 text-xs text-primary outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sarah@company.com"
                  required
                  className="mt-1 w-full rounded-xl border border-primary/10 bg-surface px-3 py-2 text-xs text-primary outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 or international number"
                  className="mt-1 w-full rounded-xl border border-primary/10 bg-surface px-3 py-2 text-xs text-primary outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  How can we help? *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Briefly tell us what you're looking for (e.g. need a website, hiring talent, software product)..."
                  required
                  className="mt-1 w-full rounded-xl border border-primary/10 bg-surface px-3 py-2 text-xs text-primary outline-none focus:border-accent"
                />
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-xs font-bold text-accent-foreground shadow-accent transition-transform hover:scale-[1.01] disabled:opacity-60"
              >
                <Send className="size-3.5" />
                <span>{pending ? "Sending Inquiry…" : "Send Message Directly"}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer info bar */}
        <div className="border-t border-primary/10 bg-surface/80 px-4 py-2.5 text-center text-[10px] text-muted-foreground">
          Nexus Talent Group • Confidential & Secure • Zero Spam
        </div>
      </div>
    </div>
  );
}

export function FloatingTalkButton({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Talk to Us"
        className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-3 sm:px-5 sm:py-3.5 text-white shadow-xl shadow-accent/25 transition-all hover:scale-105 hover:shadow-2xl active:scale-95"
      >
        {/* Pulsing online status indicator */}
        <span className="relative flex size-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-3 rounded-full bg-emerald-400" />
        </span>

        <MessageSquare className="size-4.5 sm:size-5 transition-transform group-hover:rotate-6" />

        {/* Text is shown neatly on all devices */}
        <span className="text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap">
          Talk to Us
        </span>
      </button>
    </div>
  );
}
