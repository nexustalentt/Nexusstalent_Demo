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
        subtitle="Six service lines that can operate independently or as one unified managed programme."
      />

      <section className="py-20 bg-[#ffffff]">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <article
              key={service.slug}
              id={service.slug}
              className="scroll-mt-28 rounded-none border border-[#e0e0e0] bg-[#ffffff] p-8 transition-colors hover:border-[#0f62fe]"
            >
              <div className="mb-6 flex size-11 items-center justify-center border border-[#e0e0e0] bg-[#f4f4f4] font-mono text-xs text-[#0f62fe]">
                {service.title
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <h2 className="text-xl font-normal text-[#161616]">{service.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#525252]">
                {service.description}
              </p>
              <p className="mt-4 text-xs leading-relaxed text-[#8c8c8c] border-t border-[#e0e0e0] pt-4">
                {service.detail}
              </p>
            </article>
          ))}
        </div>

        {/* Carbon CTA Banner */}
        <div className="container-page mt-16">
          <div className="rounded-none bg-[#0f62fe] p-10 text-white md:p-14">
            <h2 className="text-2xl font-light md:text-3xl">Not sure which model fits?</h2>
            <p className="mt-3 max-w-2xl text-white/85 text-sm leading-relaxed tracking-[0.16px]">
              Share the requirement and we will recommend the engagement model — recruitment,
              contract staffing or managed services — that gets you there fastest.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-none bg-[#161616] px-8 text-sm font-normal text-white transition-colors hover:bg-[#262626]"
            >
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
