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
      <PageHero eyebrow="Legal" title="Privacy Policy" subtitle="Last updated August 2026." />
      <section className="py-16">
        <div className="container-page max-w-3xl space-y-8 text-muted-foreground">
          <div>
            <h2 className="text-lg font-bold text-primary">Information we collect</h2>
            <p className="mt-2">
              When you apply for a role we collect the information you provide in the application
              form — typically your name, contact details, experience summary and CV. When you send
              an inquiry we collect your name, email, phone, company and message.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">How we use it</h2>
            <p className="mt-2">
              Candidate information is used to assess your suitability for the role you applied to
              and, where relevant, similar openings. Client inquiries are used only to respond to
              your request. We do not sell personal data.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">Who can see your data</h2>
            <p className="mt-2">
              Access is limited to authorised members of our recruitment team and, for shortlisted
              candidates, the hiring client. Internal recruiter notes are never shared with
              candidates.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">Retention and your rights</h2>
            <p className="mt-2">
              We retain application data for as long as it is relevant to your candidacy. You can
              ask us to correct or delete your information at any time by contacting our team.
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
