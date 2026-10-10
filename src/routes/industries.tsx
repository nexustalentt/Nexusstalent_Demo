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
        subtitle="Screening is executed by consultants who know the domain, the tooling and the regulatory context."
      />

      <section className="py-20 bg-[#ffffff]">
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((industry) => (
            <article
              key={industry.name}
              className="rounded-none border border-[#e0e0e0] bg-[#ffffff] p-8 transition-colors hover:border-[#0f62fe]"
            >
              <h2 className="text-lg font-normal text-[#161616]">{industry.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#525252]">{industry.note}</p>
            </article>
          ))}
        </div>

        <div className="container-page mt-16 text-center">
          <Link
            to="/careers"
            className="inline-flex h-11 items-center justify-center rounded-none bg-[#0f62fe] px-8 text-sm font-normal text-white transition-colors hover:bg-[#0050e6]"
          >
            Explore Opportunities →
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
