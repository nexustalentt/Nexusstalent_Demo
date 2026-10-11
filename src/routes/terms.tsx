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
      <PageHero eyebrow="Legal Specification" title="Terms of Service" subtitle="Last updated August 2026 · Version 1.2" />
      <section className="bg-slate-50/50 py-16">
        <div className="container-page max-w-3xl">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 md:p-12 space-y-10 text-slate-600 shadow-sm">
            <div className="border-b border-[#e0e0e0] pb-8">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0f62fe]">Section 01</span>
              <h2 className="mt-1 text-xl font-normal text-[#161616]">Use of this website</h2>
              <p className="mt-3 text-sm leading-relaxed">
                This website is provided for information about our services and current openings. You
                agree not to misuse it, attempt unauthorised access, or submit content that is
                unlawful or misleading.
              </p>
            </div>
            <div className="border-b border-[#e0e0e0] pb-8">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0f62fe]">Section 02</span>
              <h2 className="mt-1 text-xl font-normal text-[#161616]">Job listings</h2>
              <p className="mt-3 text-sm leading-relaxed">
                Openings shown here are live at the time of publication and may be closed or amended
                without notice. Listing a role is not an offer of employment.
              </p>
            </div>
            <div className="border-b border-[#e0e0e0] pb-8">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0f62fe]">Section 03</span>
              <h2 className="mt-1 text-xl font-normal text-[#161616]">Applications</h2>
              <p className="mt-3 text-sm leading-relaxed">
                Applications are submitted through the form configured for each role. You confirm that
                the information you provide is accurate and that you have the right to work in the
                stated location.
              </p>
            </div>
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0f62fe]">Section 04</span>
              <h2 className="mt-1 text-xl font-normal text-[#161616]">Liability</h2>
              <p className="mt-3 text-sm leading-relaxed">
                We take care to keep this site accurate but provide it "as is" without warranties. Our
                liability for site content is limited to the extent permitted by applicable law.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
