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
        eyebrow="Services"
        title="Talent and consulting capability, delivered end to end"
        subtitle="Six service lines that can operate independently or as one managed programme."
      />

      <section className="py-20">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <article
              key={service.slug}
              id={service.slug}
              className="scroll-mt-28 rounded-2xl border border-primary/5 bg-card p-8 transition-all hover:border-accent/40 hover:shadow-elegant"
            >
              <div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                {service.title
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <h2 className="text-xl font-bold text-primary">{service.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{service.detail}</p>
            </article>
          ))}
        </div>

        <div className="container-page mt-16">
          <div className="rounded-3xl bg-primary p-10 text-primary-foreground md:p-14">
            <h2 className="text-2xl font-bold md:text-3xl">Not sure which model fits?</h2>
            <p className="mt-3 max-w-2xl text-primary-foreground/70">
              Share the requirement and we will recommend the engagement model — recruitment,
              contract staffing or managed services — that gets you there fastest.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex rounded-full bg-accent px-8 py-4 text-sm font-bold text-accent-foreground transition-transform hover:scale-105"
            >
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
