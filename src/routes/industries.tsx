import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, PublicShell } from "@/components/site/public-shell";
import { industries } from "@/lib/content";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries We Serve — Nexus Talent" },
      {
        name: "description",
        content:
          "We serve information technology, banking, healthcare, retail, manufacturing, telecom, insurance and consulting organizations.",
      },
      { property: "og:title", content: "Industries We Serve — Nexus Talent" },
      {
        property: "og:description",
        content:
          "Sector-specialist recruitment and consulting across eight industries, from banking to manufacturing.",
      },
    ],
  }),
  component: IndustriesPage,
});

function IndustriesPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Industries"
        title="Sector knowledge that shortens every search"
        subtitle="Screening is done by consultants who know the domain, the tooling and the regulatory context."
      />

      <section className="py-20">
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((industry) => (
            <article
              key={industry.name}
              className="rounded-2xl border border-primary/5 bg-card p-8 transition-all hover:border-accent/40 hover:shadow-elegant"
            >
              <h2 className="text-lg font-bold text-primary">{industry.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{industry.note}</p>
            </article>
          ))}
        </div>

        <div className="container-page mt-16 text-center">
          <Link
            to="/careers"
            className="inline-flex rounded-full bg-accent px-8 py-4 text-sm font-bold text-accent-foreground shadow-accent transition-transform hover:scale-105"
          >
            Explore Opportunities
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
