import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, PublicShell } from "@/components/site/public-shell";
import { services } from "@/lib/content";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Consulting, Staffing & Recruitment | Nexus Talent" },
      {
        name: "description",
        content:
          "Talent consulting, IT consulting, contract staffing, recruitment, staff augmentation and managed services for large organizations.",
      },
      { property: "og:title", content: "Nexus Talent Services" },
      {
        property: "og:description",
        content:
          "Six enterprise talent services: consulting, IT consulting, contract staffing, recruitment, staff augmentation and managed services.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Enterprise Services"
        title={
          <>
            Talent and consulting capability,{" "}
            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              delivered end to end
            </span>
          </>
        }
        subtitle="Six service lines that can operate independently or as one unified managed programme."
      />

      <section className="py-20 bg-white">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <article
              key={service.slug}
              id={service.slug}
              className="group scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:border-blue-400 hover:shadow-md hover:-translate-y-1"
            >
              <div className="mb-6 flex size-12 items-center justify-center rounded-xl border border-blue-100 bg-blue-50/80 font-mono text-sm font-semibold text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                {service.title
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{service.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {service.description}
              </p>
              <p className="mt-4 text-xs leading-relaxed text-slate-400 border-t border-slate-100 pt-4">
                {service.detail}
              </p>
            </article>
          ))}
        </div>

        {/* Modernized CTA Banner */}
        <div className="container-page mt-16">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-10 text-white shadow-xl md:p-14">
            <div className="pointer-events-none absolute -right-16 -top-16 size-80 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-2xl font-extrabold sm:text-3xl">Not sure which model fits?</h2>
              <p className="mt-3 max-w-2xl text-blue-100/90 text-sm sm:text-base leading-relaxed">
                Share the requirement and we will recommend the engagement model — recruitment,
                contract staffing or managed services — that gets you there fastest.
              </p>
              <Link
                to="/contact"
                className="btn-liquid-secondary mt-8 inline-flex h-11 items-center justify-center px-8 text-sm font-semibold"
              >
                <span className="btn-content-wrap">
                  <span>Talk to Us</span>
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
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
