import { createFileRoute } from "@tanstack/react-router";
import { PageHero, PublicShell } from "@/components/site/public-shell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Nexus Talent" },
      {
        name: "description",
        content:
          "The terms that apply to your use of the Nexus Talent website, job listings and application forms.",
      },
      { property: "og:title", content: "Terms of Service — Nexus Talent" },
      {
        property: "og:description",
        content: "Terms governing use of this website and our job application process.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PublicShell>
      <PageHero eyebrow="Legal" title="Terms of Service" subtitle="Last updated August 2026." />
      <section className="py-16">
        <div className="container-page max-w-3xl space-y-8 text-muted-foreground">
          <div>
            <h2 className="text-lg font-bold text-primary">Use of this website</h2>
            <p className="mt-2">
              This website is provided for information about our services and current openings. You
              agree not to misuse it, attempt unauthorised access, or submit content that is
              unlawful or misleading.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">Job listings</h2>
            <p className="mt-2">
              Openings shown here are live at the time of publication and may be closed or amended
              without notice. Listing a role is not an offer of employment.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">Applications</h2>
            <p className="mt-2">
              Applications are submitted through the form configured for each role. You confirm that
              the information you provide is accurate and that you have the right to work in the
              stated location.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">Liability</h2>
            <p className="mt-2">
              We take care to keep this site accurate but provide it "as is" without warranties. Our
              liability for site content is limited to the extent permitted by applicable law.
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
