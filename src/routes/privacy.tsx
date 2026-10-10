import { createFileRoute } from "@tanstack/react-router";
import { PageHero, PublicShell } from "@/components/site/public-shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Nexus Talent" },
      {
        name: "description",
        content:
          "How Nexus Talent collects, uses and protects candidate and client information submitted through this website.",
      },
      { property: "og:title", content: "Privacy Policy — Nexus Talent" },
      {
        property: "og:description",
        content: "Our approach to candidate and client data protection.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PublicShell>
      <PageHero eyebrow="Legal Specification" title="Privacy Policy" subtitle="Last updated August 2026 · Version 1.4" />
      <section className="border-t border-[#e0e0e0] bg-[#f4f4f4] py-16">
        <div className="container-page max-w-3xl">
          <div className="border border-[#e0e0e0] bg-white p-8 md:p-12 space-y-10 text-[#525252]">
            <div className="border-b border-[#e0e0e0] pb-8">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0f62fe]">Section 01</span>
              <h2 className="mt-1 text-xl font-normal text-[#161616]">Information we collect</h2>
              <p className="mt-3 text-sm leading-relaxed">
                When you apply for a role we collect the information you provide in the application
                form — typically your name, contact details, experience summary and CV. When you send
                an inquiry we collect your name, email, phone, company and message.
              </p>
            </div>
            <div className="border-b border-[#e0e0e0] pb-8">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0f62fe]">Section 02</span>
              <h2 className="mt-1 text-xl font-normal text-[#161616]">How we use it</h2>
              <p className="mt-3 text-sm leading-relaxed">
                Candidate information is used to assess your suitability for the role you applied to
                and, where relevant, similar openings. Client inquiries are used only to respond to
                your request. We do not sell personal data.
              </p>
            </div>
            <div className="border-b border-[#e0e0e0] pb-8">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0f62fe]">Section 03</span>
              <h2 className="mt-1 text-xl font-normal text-[#161616]">Who can see your data</h2>
              <p className="mt-3 text-sm leading-relaxed">
                Access is limited to authorised members of our recruitment team and, for shortlisted
                candidates, the hiring client. Internal recruiter notes are never shared with
                candidates.
              </p>
            </div>
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0f62fe]">Section 04</span>
              <h2 className="mt-1 text-xl font-normal text-[#161616]">Retention and your rights</h2>
              <p className="mt-3 text-sm leading-relaxed">
                We retain application data for as long as it is relevant to your candidacy. You can
                ask us to correct or delete your information at any time by contacting our team.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
