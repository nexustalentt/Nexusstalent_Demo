import { Link } from "@tanstack/react-router";
import { SiteLogo } from "./site-header";

export function SiteFooter() {
  return (
    <footer className="border-t border-primary/5 bg-surface/50 py-14">
      <div className="container-page">
        <div className="grid gap-10 md:grid-cols-12 md:items-start pb-10 border-b border-primary/5">
          <div className="space-y-4 md:col-span-5">
            <SiteLogo className="text-xl" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              We Consult. We Build. We Help Businesses Grow. From enterprise talent solutions and IT consulting to building digital products, websites, and small business digital systems.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-primary/5 px-3 py-1 font-semibold text-primary">
                Nexus Talent: Consulting & Staffing
              </span>
              <span className="rounded-full bg-accent/10 px-3 py-1 font-semibold text-accent">
                Nexus Digital: Websites & Products
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Digital Solutions</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/for-businesses" className="transition-colors hover:text-accent">
                    For Businesses
                  </Link>
                </li>
                <li>
                  <Link to="/for-businesses" hash="websites" className="transition-colors hover:text-accent">
                    Business Websites
                  </Link>
                </li>
                <li>
                  <Link to="/for-businesses" hash="web-apps" className="transition-colors hover:text-accent">
                    Web Applications
                  </Link>
                </li>
                <li>
                  <Link to="/for-businesses" hash="custom-solutions" className="transition-colors hover:text-accent">
                    Custom Software
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Consulting & Talent</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/services" className="transition-colors hover:text-accent">
                    All Services
                  </Link>
                </li>
                <li>
                  <Link to="/industries" className="transition-colors hover:text-accent">
                    Industries
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="transition-colors hover:text-accent">
                    Explore Careers
                  </Link>
                </li>
                <li>
                  <Link to="/zozii" className="transition-colors hover:text-accent">
                    Zozii AI Companion
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Company</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/about" className="transition-colors hover:text-accent">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="transition-colors hover:text-accent">
                    Contact & Inquiries
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="transition-colors hover:text-accent">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="transition-colors hover:text-accent">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Nexus Talent Group. All rights reserved.</p>
          <p className="text-center sm:text-right">
            We Don't Just Consult. We Build.
          </p>
        </div>
      </div>
    </footer>
  );
}
