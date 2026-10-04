import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NexusLogo } from "@/components/brand/nexus-logo";

const navItems = [
  { label: "Home", to: "/" },
  { label: "For Businesses", to: "/for-businesses" },
  { label: "Services", to: "/services" },
  { label: "Industries", to: "/industries" },
  { label: "Careers", to: "/careers" },
  { label: "About Us", to: "/about" },
  { label: "Zozii", to: "/zozii" },
] as const;

export function SiteLogo({ className = "text-xl" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 ${className} font-bold tracking-tight text-primary shrink-0`}
    >
      <NexusLogo size={32} className="rounded-xl shadow-sm" />
      <span>
        NEXUS<span className="text-accent">TALENT</span>
      </span>
    </Link>
  );
}

export function SiteHeader({ onOpenTalk }: { onOpenTalk?: () => void }) {
  const [open, setOpen] = useState(false);

  const handleTalkClick = (e: React.MouseEvent) => {
    if (onOpenTalk) {
      e.preventDefault();
      onOpenTalk();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-primary/5 bg-background/90 backdrop-blur-md">
      <div className="container-page flex h-16 sm:h-20 items-center justify-between gap-4">
        <div className="flex items-center gap-6 lg:gap-10 min-w-0">
          <SiteLogo />
          <nav className="hidden gap-6 xl:gap-8 text-sm font-medium text-muted-foreground lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary font-semibold" }}
                className="transition-colors hover:text-accent whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/contact"
            className="hidden px-3 py-2 text-sm font-semibold text-primary transition-colors hover:text-accent md:block"
          >
            Contact Us
          </Link>

          {/* Talk to Us Button with Responsive Sizing */}
          <button
            type="button"
            onClick={handleTalkClick}
            className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-accent sm:px-5 sm:py-2.5 sm:text-sm shadow-sm"
          >
            <MessageSquare className="size-3.5 hidden xs:inline-block" />
            <span>Talk to Us</span>
          </button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="rounded-full border border-primary/10 p-2 text-primary lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="size-4" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="mt-8 flex flex-col gap-1 px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: item.to === "/" }}
                    activeProps={{ className: "bg-surface text-accent font-bold" }}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-4 border-t border-primary/10 pt-4 flex flex-col gap-2">
                  <Link
                    to="/contact"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-surface"
                  >
                    Contact Us
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      setOpen(false);
                      handleTalkClick(e);
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-xs font-bold text-accent-foreground shadow-accent"
                  >
                    <MessageSquare className="size-4" />
                    <span>Talk to Us / Direct WhatsApp</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
