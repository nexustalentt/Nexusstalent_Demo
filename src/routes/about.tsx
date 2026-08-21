import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, PublicShell } from "@/components/site/public-shell";
import { whyChooseUs } from "@/lib/content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Nexus Talent — Enterprise Consultancy & Recruitment" },
      {
        name: "description",
        content:
          "Nexus Talent is a consultancy and recruitment firm serving large organizations with staffing, recruitment and managed talent solutions.",
      },
      { property: "og:title", content: "About Nexus Talent" },
      {
        property: "og:description",
        content:
          "Who we are: consultants and recruiters delivering enterprise talent solutions across technology, finance, healthcare and industry.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="About Us"
        title="A consultancy partner for organizations that cannot afford a mis-hire"
        subtitle="We provide professional consultancy, staffing, recruitment and talent solutions to enterprises across India and beyond."
      />

      <section className="py-20">
        <div className="container-page grid gap-16 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6 text-muted-foreground">
            <h2 className="text-2xl font-bold text-primary md:text-3xl">Who We Are</h2>
            <p>
              Nexus Talent was founded by consultants who spent their careers inside large delivery
              organizations. We understood the cost of a slow shortlist, a wrong hire, and a vendor
              who forwards CVs without reading them — so we built the opposite.
            </p>
            <p>
              Today we support enterprise clients across information technology, banking and
              financial services, healthcare, retail, manufacturing, telecommunications and
              insurance. Our teams handle permanent recruitment, contract staffing, staff
              augmentation and fully managed workforce engagements.
            </p>
            <h2 className="pt-6 text-2xl font-bold text-primary md:text-3xl">How We Work</h2>
            <p>
              Each engagement gets a named consultant, a written requirement brief and a structured
              assessment scorecard. Candidates get straight answers and a single, simple application
              step. Clients get a shortlist they can act on.
            </p>
          </div>

          <aside className="h-fit rounded-2xl border border-primary/5 bg-surface p-8">
            <h3 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
              What sets us apart
            </h3>
            <ul className="mt-6 space-y-5">
              {whyChooseUs.map((item) => (
                <li key={item.title}>
                  <p className="text-sm font-bold text-primary">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent"
            >
              Talk to Us
            </Link>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}
