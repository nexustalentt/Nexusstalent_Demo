import { Link } from "@tanstack/react-router";
import { ArrowRight, Send } from "lucide-react";
import { NexusLogo } from "@/components/brand/nexus-logo";
import { useState } from "react";
import { toast } from "sonner";

export function SiteFooter() {
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast.success("Thank you for subscribing to Nexus Talent insights.");
    setNewsletterEmail("");
  };

  return (
    <footer className="border-t border-[#262626] bg-[#161616] text-[#c6c6c6] pt-16 pb-12">
      <div className="container-page">
        {/* Top Tier: Brand Statement & Newsletter / Quick Dispatch */}
        <div className="grid gap-10 pb-12 border-b border-[#262626] lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <div className="flex items-center gap-3">
              <NexusLogo size={32} />
              <span className="text-base font-normal tracking-tight text-white">
                NEXUS <span className="text-[#0f62fe]">TALENT</span>
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#c6c6c6] tracking-[0.16px]">
              We Consult. We Build. We Help Businesses Grow. Delivering enterprise IT staffing,
              executive search, and custom digital engineering with engineering rigor.
            </p>
            <div className="flex flex-wrap gap-2 text-xs pt-1">
              <span className="border border-[#393939] bg-[#262626] px-3 py-1 font-normal text-white">
                Nexus Talent: Consulting & Staffing
              </span>
              <span className="border border-[#0f62fe]/40 bg-[#0f62fe]/10 px-3 py-1 font-normal text-[#78a9ff]">
                Nexus Digital: Web Systems & Products
              </span>
            </div>
          </div>

          {/* Carbon Newsletter Module */}
          <div className="space-y-3 lg:col-span-7 lg:pl-12">
            <h4 className="text-sm font-normal text-white tracking-[0.16px]">
              Stay informed with enterprise talent and technology updates
            </h4>
            <p className="text-xs text-[#8c8c8c] max-w-lg">
              Receive quarterly market analyses, technology hiring benchmarks, and system
              architecture case studies directly from our senior consultants.
            </p>
            <form onSubmit={handleNewsletter} className="flex max-w-md gap-0 pt-1">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter corporate email address"
                required
                className="h-11 flex-1 rounded-none border border-[#393939] bg-[#262626] px-4 text-xs text-white placeholder:text-[#8c8c8c] focus:border-[#0f62fe] focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-none bg-[#0f62fe] px-5 text-xs font-normal text-white transition-colors hover:bg-[#0050e6] shrink-0"
              >
                <span>Subscribe</span>
                <ArrowRight className="size-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Middle Tier: 4-Column Navigation Matrix */}
        <div className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-4 border-b border-[#262626]">
          <div>
            <p className="text-xs font-medium text-white mb-4 tracking-[0.16px]">Products & Labs</p>
            <ul className="space-y-2.5 text-xs text-[#c6c6c6]">
              <li>
                <Link to="/products" className="transition-colors hover:text-white">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products" className="transition-colors hover:text-white">
                  Shopping Applications
                </Link>
              </li>
              <li>
                <Link to="/zozii" className="transition-colors hover:text-white">
                  Zozii AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/products" className="transition-colors hover:text-white">
                  Active Engineering Builds
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-white mb-4 tracking-[0.16px]">Enterprise Consulting</p>
            <ul className="space-y-2.5 text-xs text-[#c6c6c6]">
              <li>
                <Link to="/services" className="transition-colors hover:text-white">
                  All Services
                </Link>
              </li>
              <li>
                <Link to="/services" hash="talent-consulting" className="transition-colors hover:text-white">
                  Talent Strategy
                </Link>
              </li>
              <li>
                <Link to="/services" hash="it-consulting" className="transition-colors hover:text-white">
                  IT Engineering Consulting
                </Link>
              </li>
              <li>
                <Link to="/services" hash="contract-staffing" className="transition-colors hover:text-white">
                  Contract & Augmentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-white mb-4 tracking-[0.16px]">Industries & Careers</p>
            <ul className="space-y-2.5 text-xs text-[#c6c6c6]">
              <li>
                <Link to="/industries" className="transition-colors hover:text-white">
                  Sectors We Serve
                </Link>
              </li>
              <li>
                <Link to="/careers" className="transition-colors hover:text-white">
                  Job Opportunities
                </Link>
              </li>
              <li>
                <Link to="/zozii" className="transition-colors hover:text-white">
                  Zozii AI Companion
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-white">
                  Client Consultations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-white mb-4 tracking-[0.16px]">Corporate & Governance</p>
            <ul className="space-y-2.5 text-xs text-[#c6c6c6]">
              <li>
                <Link to="/about" className="transition-colors hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-white">
                  Contact & Inquiries
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="transition-colors hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Tier: Legal & Copyright Bar */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-[#8c8c8c] sm:flex-row">
          <p>© {new Date().getFullYear()} Nexus Talent Group. Built on Carbon Design System principles.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Use
            </Link>
            <span className="text-[#525252]">|</span>
            <span className="text-[#8c8c8c]">We Consult. We Build.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
