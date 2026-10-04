import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  X,
  Phone,
  Mail,
  Send,
  MessageCircle,
  Clock,
  ArrowLeft,
  Search,
  ExternalLink,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
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
  const popupRef = useRef<HTMLDivElement>(null);

  const [currentView, setCurrentView] = useState<"menu" | "form">("menu");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const phoneNumber = settings?.phone || "+91 80 4123 4567";
  const rawPhoneNumber = phoneNumber.replace(/[^0-9+]/g, "");
  const companyEmail = settings?.company_email || "contact@nexustalent.com";
  const businessHours = settings?.business_hours || "Mon – Fri: 9:00 AM – 6:30 PM";

  const whatsappUrl = `https://wa.me/${rawPhoneNumber.replace("+", "")}?text=${encodeURIComponent(
    "Hello Nexus Talent & Nexus Digital team! I would like to connect.",
  )}`;

  // Close when clicking outside on mobile or desktop
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(companyEmail);
    setCopied(true);
    toast.success("Copied email address!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in name, email, and message.");
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
          message: `[TALK TO US POPUP]\nPhone: ${phone || "N/A"}\nMessage:\n${message.trim()}`,
        },
      });
      toast.success("Message sent! A team member will reply shortly.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setCurrentView("menu");
      onClose();
    } catch {
      toast.error("Could not send message. Please chat on WhatsApp or email directly.");
    } finally {
      setPending(false);
    }
  };

  // Agent quick search
  const isSearching = searchQuery.trim().length > 0;
  const filteredChannels = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    const items = [];

    if (q.includes("phone") || q.includes("call") || q.includes("number")) {
      items.push({
        id: "call",
        icon: Phone,
        label: "Call Phone",
        detail: phoneNumber,
        action: () => (window.location.href = `tel:${rawPhoneNumber}`),
        btn: "Call Now",
      });
    }
    if (q.includes("whatsapp") || q.includes("chat") || q.includes("wa")) {
      items.push({
        id: "wa",
        icon: MessageCircle,
        label: "WhatsApp",
        detail: "Direct WhatsApp chat",
        action: () => window.open(whatsappUrl, "_blank"),
        btn: "Chat",
      });
    }
    if (q.includes("mail") || q.includes("email")) {
      items.push({
        id: "mail",
        icon: Mail,
        label: "Email",
        detail: companyEmail,
        action: () => (window.location.href = `mailto:${companyEmail}`),
        btn: "Email",
      });
    }
    if (q.includes("website") || q.includes("product") || q.includes("build")) {
      items.push({
        id: "digital",
        icon: ExternalLink,
        label: "Build Website / Product",
        detail: "Nexus Digital solutions",
        action: () => {
          window.location.href = "/for-businesses#start-project";
          onClose();
        },
        btn: "Start",
      });
    }
    return items;
  }, [searchQuery, phoneNumber, rawPhoneNumber, companyEmail, whatsappUrl, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="fixed bottom-20 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] max-w-[325px] sm:max-w-[340px] animate-fade-up rounded-2xl border border-primary/10 bg-card shadow-2xl overflow-hidden"
    >
      {/* VIEW 1: COMPACT ACTIONS & AGENT (DEFAULT) */}
      {currentView === "menu" ? (
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-primary/10 bg-surface/90 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-primary">Talk to Us</span>
              <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-600">
                Online
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-muted-foreground hover:bg-surface hover:text-primary transition-colors"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="p-3.5 space-y-2.5 max-h-[75vh] overflow-y-auto">
            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phone, WhatsApp, email..."
                className="w-full rounded-lg border border-primary/10 bg-surface pl-7 pr-6 py-1.5 text-[11px] text-primary outline-none focus:border-accent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Filtered Search Results */}
            {isSearching && (
              <div className="space-y-1.5 pt-1">
                {filteredChannels.length === 0 ? (
                  <p className="text-center text-[10px] text-muted-foreground py-2">
                    No direct match. Choose an option below:
                  </p>
                ) : (
                  filteredChannels.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.action}
                      className="w-full flex items-center justify-between rounded-xl border border-primary/10 bg-surface p-2 text-left hover:border-accent transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <item.icon className="size-3.5 text-accent shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-primary truncate">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                      <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground shrink-0">
                        {item.btn}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Direct Action 1: WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 transition-all hover:bg-emerald-500/10 hover:border-emerald-500/40"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500 text-white shrink-0">
                  <MessageCircle className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-primary">Chat on WhatsApp</span>
                    <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[8px] font-bold text-emerald-600">
                      Fastest
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    Direct chat with team
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 shrink-0">Chat →</span>
            </a>

            {/* Direct Action 2: Phone Call */}
            <a
              href={`tel:${rawPhoneNumber}`}
              className="flex items-center justify-between rounded-xl border border-primary/10 bg-surface p-2.5 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Phone className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-primary">Call Direct Phone</p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                    {phoneNumber}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-accent shrink-0">Call →</span>
            </a>

            {/* Direct Action 3: Email */}
            <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-surface p-2.5">
              <a
                href={`mailto:${companyEmail}`}
                className="flex items-center gap-2.5 min-w-0 flex-1 hover:text-accent"
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                  <Mail className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-primary truncate">Email Inquiries</p>
                  <p className="text-[10px] text-muted-foreground truncate">{companyEmail}</p>
                </div>
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1 text-muted-foreground hover:text-primary shrink-0"
                title="Copy email"
              >
                {copied ? (
                  <CheckCircle2 className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
            </div>

            {/* Direct Action 4: Separate Message Form Trigger */}
            <button
              type="button"
              onClick={() => setCurrentView("form")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground hover:bg-accent transition-all shadow-sm"
            >
              <Send className="size-3" />
              <span>Leave a Message (Form)</span>
            </button>

            {/* Timing Note */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-1">
              <Clock className="size-3" />
              <span>{businessHours}</span>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: SEPARATE DEDICATED INQUIRY FORM */
        <div className="flex flex-col">
          {/* Header with Back button */}
          <div className="flex items-center justify-between border-b border-primary/10 bg-surface/90 px-4 py-3">
            <button
              type="button"
              onClick={() => setCurrentView("menu")}
              className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back</span>
            </button>

            <span className="text-xs font-bold text-primary">Leave a Message</span>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-muted-foreground hover:bg-surface hover:text-primary transition-colors"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          <form
            onSubmit={handleInquirySubmit}
            className="p-3.5 space-y-2.5 max-h-[75vh] overflow-y-auto"
          >
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                required
                className="mt-1 w-full rounded-lg border border-primary/10 bg-surface px-2.5 py-1.5 text-xs text-primary outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@business.com"
                required
                className="mt-1 w-full rounded-lg border border-primary/10 bg-surface px-2.5 py-1.5 text-xs text-primary outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 or phone"
                className="mt-1 w-full rounded-lg border border-primary/10 bg-surface px-2.5 py-1.5 text-xs text-primary outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Tell us what you're looking for (website, hiring, digital solutions)..."
                required
                className="mt-1 w-full rounded-lg border border-primary/10 bg-surface px-2.5 py-1.5 text-xs text-primary outline-none focus:border-accent"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-accent py-2 text-xs font-bold text-accent-foreground shadow-accent transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              <Send className="size-3" />
              <span>{pending ? "Sending…" : "Send Message"}</span>
            </button>

            <div className="pt-1 text-center">
              <Link
                to="/contact"
                onClick={onClose}
                className="text-[10px] font-semibold text-accent hover:underline"
              >
                Or open full contact page →
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function FloatingTalkButton({ onOpen, isOpen }: { onOpen: () => void; isOpen?: boolean }) {
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Talk to Us"
        className={`group relative flex items-center gap-2 rounded-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-white shadow-xl transition-all hover:scale-105 active:scale-95 ${
          isOpen
            ? "bg-primary ring-2 ring-accent"
            : "bg-gradient-to-r from-primary to-accent shadow-accent/25 hover:shadow-2xl"
        }`}
      >
        {/* Pulsing online status dot */}
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
        </span>

        <MessageSquare className="size-4 transition-transform group-hover:rotate-6" />

        <span className="text-xs font-bold tracking-tight whitespace-nowrap">Talk to Us</span>
      </button>
    </div>
  );
}
