import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Industries", to: "/industries" },
  { label: "Careers", to: "/careers" },
] as const;

export function SiteLogo({ className = "text-xl" }: { className?: string }) {
  return (
    <Link to="/" className={`${className} font-bold tracking-tight text-primary`}>
      NEXUS<span className="text-accent">TALENT</span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/5 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-20 items-center justify-between">
        <div className="flex items-center gap-10">
          <SiteLogo />
          <nav className="hidden gap-8 text-sm font-medium text-muted-foreground lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary" }}
                className="transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/contact"
            className="hidden px-4 text-sm font-semibold text-primary transition-colors hover:text-accent sm:block"
          >
            Contact Us
          </Link>
          <Link
            to="/contact"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent"
          >
            Talk to Us
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="ml-1 rounded-full border border-primary/10 p-2.5 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="size-4" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav className="mt-10 flex flex-col gap-1 px-4">
                {[...navItems, { label: "Contact Us", to: "/contact" as const }].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: item.to === "/" }}
                    activeProps={{ className: "bg-surface text-accent" }}
                    className="rounded-lg px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
