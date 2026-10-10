import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Globe, PhoneCall, Mail } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NexusLogo } from "@/components/brand/nexus-logo";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Services", to: "/services" },
  { label: "Industries", to: "/industries" },
  { label: "Careers", to: "/careers" },
  { label: "About Us", to: "/about" },
  { label: "Zozii", to: "/zozii" },
] as const;

export function SiteLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center tracking-normal shrink-0 group ${className}`}
      aria-label="Nexus Talent - Home"
    >
      <img
        src="/brand/nexus-talent-logo.png"
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
    <header className="sticky top-0 z-40 bg-[#161616] text-[#f4f4f4] border-b border-[#262626] shadow-sm">
      {/* Carbon Utility Bar (32px, dark surface, hidden on mobile) */}
      <div className="hidden border-b border-[#262626] bg-[#0d0d0d] text-[#8d8d8d] md:block">
        <div className="container-page flex h-8 items-center justify-between text-xs tracking-[0.16px]">
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 text-[#c6c6c6]">
              <Globe className="size-3 text-[#0f62fe]" />
              Enterprise Technology Consulting &amp; Talent Solutions
            </span>
            <span className="hidden text-[#393939] lg:inline">|</span>
            <span className="hidden text-[#8d8d8d] lg:inline">
              Offices: Bangalore · Remote Global Delivery
            </span>
          </div>

          <div className="flex items-center gap-5 text-[#8d8d8d]">
            <a
              href="mailto:contact@nexustalent.com"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Mail className="size-3 text-[#78a9ff]" />
              contact@nexustalent.com
            </a>
            <span className="text-[#393939]">|</span>
            <button
              type="button"
              onClick={onOpenTalk}
              className="inline-flex items-center gap-1.5 text-[#78a9ff] hover:text-[#d4af37] hover:underline cursor-pointer transition-colors"
            >
              <PhoneCall className="size-3 text-[#d4af37]" />
              Direct Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Nav */}
      <div className="bg-[#161616]">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8 lg:gap-10 min-w-0">
            <SiteLogo />

            <nav className="hidden h-16 items-center gap-1 text-sm font-normal text-[#f4f4f4] lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{
                    className:
                      "text-white font-medium border-b-2 border-[#0f62fe] bg-[#262626]/70",
                  }}
                  className="flex h-16 items-center px-3.5 border-b-2 border-transparent text-sm tracking-[0.16px] text-[#c6c6c6] transition-colors hover:bg-[#262626] hover:text-white whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="inline-flex h-10 items-center justify-center rounded-none bg-[#0f62fe] px-5 text-xs sm:text-sm font-normal text-white transition-all hover:bg-[#0050e6] active:bg-[#002d9c] shadow-[0_0_15px_rgba(15,98,254,0.3)] hover:shadow-[0_0_20px_rgba(15,98,254,0.5)]"
            >
              Contact Us
            </Link>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                className="rounded-none border border-[#393939] bg-[#262626] p-2 text-white hover:bg-[#333333] lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="size-4" aria-hidden="true" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72 rounded-none border-l border-[#262626] bg-[#161616] text-white p-6">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="mb-4">
                  <SiteLogo />
                </div>
                <div className="mt-4 flex flex-col gap-0 border-t border-[#262626]">
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      activeOptions={{ exact: item.to === "/" }}
                      activeProps={{ className: "border-l-2 border-[#0f62fe] bg-[#262626] text-white font-medium" }}
                      className="border-b border-[#262626] px-4 py-3 text-sm tracking-[0.16px] text-[#c6c6c6] transition-colors hover:bg-[#262626] hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="mt-6">
                    <Link
                      to="/contact"
                      onClick={() => setOpen(false)}
                      className="flex h-11 items-center justify-center rounded-none bg-[#0f62fe] px-4 text-sm font-normal text-white transition-colors hover:bg-[#0050e6]"
                    >
                      Contact Us
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
