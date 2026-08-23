import { Link } from "@tanstack/react-router";
import { SiteLogo } from "./site-header";

export function SiteFooter() {
  return (
    <footer className="border-t border-primary/5 py-12">
      <div className="container-page flex flex-col items-center justify-between gap-8 md:flex-row">
        <SiteLogo className="text-lg" />
        <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
          <Link to="/careers" className="transition-colors hover:text-accent">
            Careers
          </Link>
          <Link to="/privacy" className="transition-colors hover:text-accent">
            Privacy Policy
          </Link>
          <Link to="/terms" className="transition-colors hover:text-accent">
            Terms of Service
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          © 2016 Nexus Talent Group. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
