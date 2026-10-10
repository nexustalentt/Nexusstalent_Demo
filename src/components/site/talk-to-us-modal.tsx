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
    "Hello Nexus Talent team! I would like to connect.",
  )}`;

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
    toast.success("Copied email address");
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

  const isSearching = searchQuery.trim().length > 0;
  const filteredChannels = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.toLowerCase().trim();
    const items = [];

    if (q.includes("phone") || q.includes("call") || q.includes("number") || q.includes("80")) {
      items.push({
        id: "phone",
        icon: Phone,
        label: "Direct Phone",
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
        detail: "Direct chat",
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
        detail: "Digital solutions",
        action: () => {
          window.location.href = "/for-businesses#start-project";
          onClose();
        },
        btn: "Start",
      });
    }
    return items;
  }, [isSearching, searchQuery, phoneNumber, rawPhoneNumber, companyEmail, whatsappUrl, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="fixed bottom-20 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] max-w-[340px] animate-fade-up rounded-none border border-[#e0e0e0] bg-[#ffffff] shadow-none"
    >
      {/* VIEW 1: COMPACT ACTIONS */}
      {currentView === "menu" ? (
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e0e0e0] bg-[#f4f4f4] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="size-2 bg-[#24a148]" />
              <span className="text-xs font-normal text-[#161616] tracking-[0.16px]">
                Direct Consultation
              </span>
              <span className="border border-[#24a148]/30 bg-[#24a148]/10 px-1.5 py-0.2 text-[9px] text-[#24a148]">
                Available
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#525252] hover:bg-[#e0e0e0] hover:text-[#161616] transition-colors"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-[#8c8c8c]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phone, WhatsApp, email..."
                className="w-full rounded-none border border-[#e0e0e0] bg-[#f4f4f4] pl-8 pr-6 py-2 text-xs text-[#161616] outline-none focus:border-[#0f62fe]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8c8c8c] hover:text-[#161616]"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Filtered Search Results */}
            {isSearching && (
              <div className="space-y-1.5 pt-1">
                {filteredChannels.length === 0 ? (
                  <p className="text-center text-[11px] text-[#8c8c8c] py-2">
                    No direct match. Choose an option below:
                  </p>
                ) : (
                  filteredChannels.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.action}
                      className="w-full flex items-center justify-between rounded-none border border-[#e0e0e0] bg-[#f4f4f4] p-2.5 text-left hover:border-[#0f62fe] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <item.icon className="size-3.5 text-[#0f62fe] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-normal text-[#161616] truncate">{item.label}</p>
                          <p className="text-[10px] text-[#525252] truncate">{item.detail}</p>
                        </div>
                      </div>
                      <span className="rounded-none bg-[#0f62fe] px-2 py-0.5 text-[10px] text-white shrink-0">
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
              className="flex items-center justify-between rounded-none border border-[#e0e0e0] bg-[#f4f4f4] p-3 transition-colors hover:border-[#0f62fe] hover:bg-[#ffffff]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-7 items-center justify-center bg-[#24a148] text-white shrink-0">
                  <MessageCircle className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-[#161616]">WhatsApp Chat</span>
                    <span className="bg-[#24a148]/10 px-1 py-0.2 text-[8px] text-[#24a148]">
                      Instant
                    </span>
                  </div>
                  <p className="text-[10px] text-[#525252] truncate">Direct conversation with team</p>
                </div>
              </div>
              <span className="text-xs text-[#0f62fe] shrink-0">Connect →</span>
            </a>

            {/* Direct Action 2: Phone Call */}
            <a
              href={`tel:${rawPhoneNumber}`}
              className="flex items-center justify-between rounded-none border border-[#e0e0e0] bg-[#f4f4f4] p-3 transition-colors hover:border-[#0f62fe] hover:bg-[#ffffff]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-7 items-center justify-center bg-[#161616] text-white shrink-0">
                  <Phone className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#161616]">Direct Telephone</p>
                  <p className="text-[10px] text-[#525252] font-mono truncate">{phoneNumber}</p>
                </div>
              </div>
              <span className="text-xs text-[#0f62fe] shrink-0">Call →</span>
            </a>

            {/* Direct Action 3: Email */}
            <div className="flex items-center justify-between rounded-none border border-[#e0e0e0] bg-[#f4f4f4] p-3">
              <a
                href={`mailto:${companyEmail}`}
                className="flex items-center gap-3 min-w-0 flex-1 hover:text-[#0f62fe]"
              >
                <div className="flex size-7 items-center justify-center bg-[#0f62fe] text-white shrink-0">
                  <Mail className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#161616] truncate">Email Inquiries</p>
                  <p className="text-[10px] text-[#525252] truncate">{companyEmail}</p>
                </div>
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1 text-[#8c8c8c] hover:text-[#161616] shrink-0"
                title="Copy email"
              >
                {copied ? (
                  <CheckCircle2 className="size-3.5 text-[#24a148]" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>

            {/* Direct Action 4: Form Trigger */}
            <button
              type="button"
              onClick={() => setCurrentView("form")}
              className="w-full flex h-10 items-center justify-center gap-2 rounded-none bg-[#0f62fe] text-xs font-normal text-white hover:bg-[#0050e6] transition-colors"
            >
              <Send className="size-3" />
              <span>Leave a Message (Form)</span>
            </button>

            {/* Timing Note */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8c8c8c] pt-1">
              <Clock className="size-3" />
              <span>{businessHours}</span>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: FORM */
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-[#e0e0e0] bg-[#f4f4f4] px-4 py-3">
            <button
              type="button"
              onClick={() => setCurrentView("menu")}
              className="flex items-center gap-1 text-xs text-[#0f62fe] hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back</span>
            </button>

            <span className="text-xs font-normal text-[#161616]">Leave a Message</span>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#525252] hover:bg-[#e0e0e0] hover:text-[#161616] transition-colors"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          <form
            onSubmit={handleInquirySubmit}
            className="p-4 space-y-3 max-h-[75vh] overflow-y-auto"
          >
            <div>
              <label className="text-[10px] font-normal uppercase text-[#525252] tracking-[0.16px]">
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Doe"
                required
                className="mt-1 w-full rounded-none border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3 py-2 text-xs text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
              />
            </div>

            <div>
              <label className="text-[10px] font-normal uppercase text-[#525252] tracking-[0.16px]">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. jane@business.com"
                required
                className="mt-1 w-full rounded-none border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3 py-2 text-xs text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
              />
            </div>

            <div>
              <label className="text-[10px] font-normal uppercase text-[#525252] tracking-[0.16px]">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 or phone number"
                className="mt-1 w-full rounded-none border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3 py-2 text-xs text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
              />
            </div>

            <div>
              <label className="text-[10px] font-normal uppercase text-[#525252] tracking-[0.16px]">
                Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Describe your inquiry..."
                required
                className="mt-1 w-full rounded-none border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3 py-2 text-xs text-[#161616] outline-none focus:border-b-2 focus:border-b-[#0f62fe]"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full flex h-10 items-center justify-center gap-1.5 rounded-none bg-[#0f62fe] text-xs font-normal text-white hover:bg-[#0050e6] transition-colors disabled:opacity-60"
            >
              <Send className="size-3" />
              <span>{pending ? "Sending…" : "Send Message"}</span>
            </button>

            <div className="pt-1 text-center">
              <Link
                to="/contact"
                onClick={onClose}
                className="text-[10px] text-[#0f62fe] hover:underline"
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
        className={`group flex h-11 items-center gap-2.5 rounded-none px-4 text-xs font-normal tracking-[0.16px] text-white transition-colors cursor-pointer ${
          isOpen
            ? "bg-[#161616] border border-[#0f62fe]"
            : "bg-[#0f62fe] hover:bg-[#0050e6] active:bg-[#002d9c]"
        }`}
      >
        <span className="size-2 bg-[#24a148]" />
        <MessageSquare className="size-3.5" />
        <span>Talk to Us</span>
      </button>
    </div>
  );
}
