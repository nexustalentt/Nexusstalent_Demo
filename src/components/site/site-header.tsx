import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Globe, PhoneCall, Mail, ArrowUpRight } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NexusLogo } from "@/components/brand/nexus-logo";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Services", to: "/services" },
  { label: "Industries", to: "/industries" },
  { label: "Careers", to: "/careers" },
  { label: "About Us", to: "/about" },
] as const;

export function SiteLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center tracking-normal shrink-0 group ${className}`}
      aria-label="Nexus Talent - Home"
    >
      <img
        src="/brand/nexus-talent-logo-light-bg.png"
        alt="Nexus Talent — Connecting Potential, Inspiring Success"
        className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
        loading="eager"
      />
    </Link>
  );
}

export function SiteHeader({ onOpenTalk }: { onOpenTalk?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#ffffff] border-b border-[#e0e0e0] shadow-none">
      {/* Carbon Utility Bar (32px, surface-1, hidden on mobile) */}
      <div className="hidden border-b border-[#e0e0e0] bg-[#f4f4f4] text-[#525252] md:block">
        <div className="container-page flex h-8 items-center justify-between text-xs tracking-[0.16px]">
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 text-[#525252]">
              <Globe className="size-3 text-[#0f62fe]" />
              Enterprise Technology Consulting &amp; Talent Solutions
            </span>
            <span className="hidden text-[#8c8c8c] lg:inline">|</span>
            <span className="hidden text-[#525252] lg:inline">
              Offices: Bangalore · Remote Global Delivery
            </span>
          </div>

          <div className="flex items-center gap-5 text-[#525252]">
            <a
              href="mailto:contact@nexustalent.com"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-[#0f62fe]"
            >
              <Mail className="size-3 text-[#0f62fe]" />
              contact@nexustalent.com
            </a>
            <span className="text-[#8c8c8c]">|</span>
            <button
              type="button"
              onClick={onOpenTalk}
              className="inline-flex items-center gap-1.5 text-[#0f62fe] hover:underline cursor-pointer font-medium"
            >
              <PhoneCall className="size-3 text-[#d4af37]" />
              Direct Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Nav */}
      <div className="bg-[#ffffff]">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8 lg:gap-10 min-w-0">
            <SiteLogo />

            <nav className="hidden h-16 items-center gap-1 text-sm font-normal text-[#161616] lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{
                    className:
                      "text-[#161616] font-medium border-b-2 border-[#0f62fe] bg-[#f4f4f4]/60",
                  }}
                  className="flex h-16 items-center px-3.5 border-b-2 border-transparent text-sm tracking-[0.16px] text-[#525252] transition-colors hover:bg-[#f4f4f4] hover:text-[#0f62fe] whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="group inline-flex h-10 items-center justify-center gap-1.5 bg-[#1764f5] px-3.5 sm:px-5 text-xs sm:text-sm font-medium text-white shadow-[0_4px_14px_rgba(23,100,245,0.28)] transition-all duration-200 hover:bg-[#0f54e6] hover:shadow-[0_6px_20px_rgba(23,100,245,0.40)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1764f5] focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:transform-none cursor-pointer whitespace-nowrap"
              style={{ borderRadius: "11px" }}
              aria-label="Let's Connect - Contact Nexus Talent"
            >
              <span>Let's Connect</span>
              <ArrowUpRight className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" aria-hidden="true" />
            </Link>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                className="rounded-none border border-[#e0e0e0] bg-[#ffffff] p-2 text-[#161616] hover:bg-[#f4f4f4] lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="size-4" aria-hidden="true" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72 rounded-none border-l border-[#e0e0e0] bg-[#ffffff] text-[#161616] p-6">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="mb-4">
                  <SiteLogo />
                </div>
                <div className="mt-4 flex flex-col gap-0 border-t border-[#e0e0e0]">
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      activeOptions={{ exact: item.to === "/" }}
                      activeProps={{ className: "border-l-2 border-[#0f62fe] bg-[#f4f4f4] text-[#161616] font-medium" }}
                      className="border-b border-[#e0e0e0] px-4 py-3 text-sm tracking-[0.16px] text-[#525252] transition-colors hover:bg-[#f4f4f4] hover:text-[#0f62fe]"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="mt-6">
                    <Link
                      to="/contact"
                      onClick={() => setOpen(false)}
                      className="group flex h-11 items-center justify-center gap-1.5 bg-[#1764f5] px-4 text-sm font-medium text-white shadow-[0_4px_14px_rgba(23,100,245,0.28)] transition-all duration-200 hover:bg-[#0f54e6] hover:shadow-[0_6px_20px_rgba(23,100,245,0.40)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1764f5] focus-visible:ring-offset-2 motion-reduce:transition-none cursor-pointer"
                      style={{ borderRadius: "11px" }}
                      aria-label="Let's Connect - Contact Nexus Talent"
                    >
                      <span>Let's Connect</span>
                      <ArrowUpRight className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
