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
        eyebrow="Target Sectors"
        title={
          <>
            Sector knowledge that{" "}
            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              shortens every search
            </span>
          </>
        }
        subtitle="Screening is executed by consultants who know the domain, the tooling and the regulatory context."
      />

      <section className="py-20 bg-white">
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((industry) => (
            <article
              key={industry.name}
              className="group rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:border-blue-400 hover:shadow-md hover:-translate-y-1"
            >
              <div className="mb-4 size-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
              <h2 className="text-lg font-bold text-slate-900">{industry.name}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{industry.note}</p>
            </article>
          ))}
        </div>

        <div className="container-page mt-16 text-center">
          <Link
            to="/careers"
            className="btn-liquid-primary inline-flex h-11 items-center justify-center px-8 text-sm font-semibold"
          >
            <span className="btn-content-wrap">
              <span>Explore Opportunities</span>
              <svg
                className="btn-arrow-icon size-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3.333 8h9.334M8.667 4l4 4-4 4" />
              </svg>
            </span>
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
