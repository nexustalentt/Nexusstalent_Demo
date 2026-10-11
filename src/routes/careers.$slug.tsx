import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, UserPlus } from "lucide-react";
import { PublicShell } from "@/components/site/public-shell";
import { ReferralModal } from "@/components/site/referral-modal";
import { publicJobQuery } from "@/lib/queries";
import { experienceLabel, formatDate, isValidHttpUrl, toLines } from "@/lib/job-utils";

export const Route = createFileRoute("/careers/$slug")({
  loader: async ({ context, params }) => {
    const job = await context.queryClient.ensureQueryData(publicJobQuery(params.slug));
    if (!job) throw notFound();
    return { title: job.title, description: job.short_description, location: job.location };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Position unavailable — Nexus Talent" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.title}${loaderData.location ? ` — ${loaderData.location}` : ""} | Nexus Talent Careers`;
    const description =
      loaderData.description ??
      `Apply for the ${loaderData.title} opening with Nexus Talent. No account required.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: JobNotFound,
  errorComponent: () => (
    <PublicShell>
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-light text-[#161616]">Something went wrong</h1>
        <p className="mt-2 text-[#525252]">Please try again in a moment.</p>
      </div>
    </PublicShell>
  ),
  component: JobDetailPage,
});

function JobNotFound() {
  return (
    <PublicShell>
      <div className="container-page py-28 text-center">
        <h1 className="text-3xl font-light text-[#161616]">Position not found</h1>
        <p className="mt-3 text-[#525252]">
          This opening may have been closed or moved. Browse our current openings instead.
        </p>
        <Link
          to="/careers"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-none bg-[#0f62fe] px-6 text-sm font-normal text-white hover:bg-[#0050e6]"
        >
          View all jobs
        </Link>
      </div>
    </PublicShell>
  );
}

function Section({ title, body }: { title: string; body?: string | null }) {
  const lines = toLines(body);
  if (!lines.length) return null;
  return (
    <section>
      <h2 className="text-lg font-normal text-[#161616] border-b border-[#e0e0e0] pb-2">{title}</h2>
      {lines.length === 1 ? (
        <p className="mt-3 leading-relaxed text-[#525252] text-sm tracking-[0.16px]">{lines[0]}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {lines.map((line) => (
            <li key={line} className="flex gap-3 leading-relaxed text-[#525252] text-sm tracking-[0.16px]">
              <span className="mt-2 size-1 shrink-0 bg-[#0f62fe]" aria-hidden="true" />
              {line}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function JobDetailPage() {
  const { slug } = Route.useParams();
  const { data: job } = useSuspenseQuery(publicJobQuery(slug));
  const [referralOpen, setReferralOpen] = useState(false);

  if (!job) return <JobNotFound />;

  const internalApply = job.application_method === "internal_form";
  const canApply =
    internalApply ||
    (job.application_method === "google_form" &&
      !!job.google_form_url &&
      isValidHttpUrl(job.google_form_url));

  const facts = [
    { label: "Location", value: job.location },
    { label: "Experience", value: experienceLabel(job.experience_min, job.experience_max) },
    { label: "Work Mode", value: job.work_mode },
    { label: "Employment Type", value: job.employment_type },
    { label: "Department", value: job.department },
    { label: "Compensation", value: job.salary },
    { label: "Job Code", value: job.job_code },
  ].filter((fact) => Boolean(fact.value));

  const applyPanel = (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">Apply for this role</h2>
      {canApply ? (
        <>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Applications take a few minutes. No account or registration required.
          </p>
          {internalApply ? (
            <Link
              to="/apply/$slug"
              params={{ slug }}
              className="btn-liquid-primary mt-5 inline-flex h-11 w-full items-center justify-center px-6 text-sm font-semibold"
            >
              <span className="btn-content-wrap">
                <span>Apply Now</span>
              </span>
            </Link>
          ) : (
            <a
              href={job.google_form_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-liquid-primary mt-5 inline-flex h-11 w-full items-center justify-center px-6 text-sm font-semibold"
            >
              <span className="btn-content-wrap">
                <span>Apply Now</span>
                <ExternalLink className="size-4" aria-hidden="true" />
              </span>
            </a>
          )}
          <button
            type="button"
            onClick={() => setReferralOpen(true)}
            className="btn-liquid-secondary mt-3 inline-flex h-11 w-full items-center justify-center px-6 text-sm font-semibold cursor-pointer"
          >
            <span className="btn-content-wrap">
              <UserPlus className="size-4" aria-hidden="true" />
              <span>Refer Someone</span>
            </span>
          </button>
        </>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">
            Applications are currently unavailable for this position.
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Write to our recruitment team and we will notify you when it reopens.
          </p>
          <Link to="/contact" className="mt-4 inline-flex text-xs font-semibold text-blue-600 hover:underline">
            Contact our team →
          </Link>
        </div>
      )}
      <p className="mt-5 text-xs text-slate-400">
        Last updated {formatDate(job.updated_at)}
      </p>
    </div>
  );

  return (
    <PublicShell>
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-[#f8fafc] py-14 md:py-16">
        {/* Faint digital dot-grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_85%_70%_at_50%_35%,#000_70%,transparent_100%)]"
          aria-hidden="true"
        />

        {/* Ambient mesh gradient glows */}
        <div
          className="pointer-events-none absolute -top-10 left-[5%] h-[350px] w-[400px] rounded-full bg-gradient-to-r from-purple-500/15 via-blue-600/15 to-cyan-400/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-20 right-[5%] h-[380px] w-[450px] rounded-full bg-gradient-to-br from-blue-600/15 via-cyan-400/12 to-purple-500/12 blur-3xl"
          aria-hidden="true"
        />

        <div className="container-page relative z-10">
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-sm transition-colors hover:text-blue-600"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" /> All Openings
          </Link>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
            {job.title}
          </h1>
          {job.short_description ? (
            <p className="mt-3 max-w-2xl text-base text-slate-600 tracking-[0.16px]">
              {job.short_description}
            </p>
          ) : null}
          {job.skills.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 shadow-xs backdrop-blur-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-10">
            <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 sm:grid-cols-3 shadow-xs">
              {facts.map((fact) => (
                <div key={fact.label} className="border-b border-[#e0e0e0] pb-2 last:border-b-0 sm:border-b-0">
                  <dt className="text-[11px] uppercase tracking-[0.16px] text-[#8c8c8c]">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[#161616]">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <Section title="Job Description" body={job.description} />
            <Section title="Responsibilities" body={job.responsibilities} />
            <Section title="Requirements" body={job.requirements} />
            <Section title="Preferred Qualifications" body={job.preferred_qualifications} />
            <Section title="Benefits" body={job.benefits} />

            <div className="lg:hidden">{applyPanel}</div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28">{applyPanel}</div>
          </aside>
        </div>
      </section>
      <ReferralModal
        open={referralOpen}
        onOpenChange={setReferralOpen}
        job={{ id: job.id, title: job.title, location: job.location }}
      />
    </PublicShell>
  );
}
