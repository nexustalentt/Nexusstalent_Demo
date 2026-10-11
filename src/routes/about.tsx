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
        title={
          <>
            A consultancy partner for organizations that{" "}
            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              cannot afford a mis-hire
            </span>
          </>
        }
        subtitle="We provide professional consultancy, staffing, recruitment and digital solutions to enterprises across India and global delivery hubs."
      />

      <section className="py-20 bg-white">
        <div className="container-page grid gap-16 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6 text-slate-600 leading-relaxed tracking-[0.16px]">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Who We Are</h2>
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
            <h2 className="pt-6 text-2xl font-bold text-slate-900 md:text-3xl">How We Work</h2>
            <p>
              Each engagement gets a named consultant, a written requirement brief and a structured
              assessment scorecard. Candidates get straight answers and a single, simple application
              step. Clients get a shortlist they can act on.
            </p>
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200/80 bg-slate-50/70 p-8 shadow-sm backdrop-blur-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              What sets us apart
            </h3>
            <ul className="mt-6 space-y-5">
              {whyChooseUs.map((item) => (
                <li key={item.title} className="border-b border-slate-200/70 pb-4 last:border-b-0">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className="btn-liquid-primary mt-8 inline-flex h-11 items-center justify-center px-6 text-sm font-semibold"
            >
              <span className="btn-content-wrap">Talk to Us</span>
            </Link>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}
