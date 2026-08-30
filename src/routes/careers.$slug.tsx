import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PublicShell } from "@/components/site/public-shell";
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
        meta: [{ title: "Position unavailable — Nexus Talent" }, { name: "robots", content: "noindex" }],
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
        <h1 className="text-2xl font-bold text-primary">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">Please try again in a moment.</p>
      </div>
    </PublicShell>
  ),
  component: JobDetailPage,
});

function JobNotFound() {
  return (
    <PublicShell>
      <div className="container-page py-28 text-center">
        <h1 className="text-3xl font-bold text-primary">Position not found</h1>
        <p className="mt-3 text-muted-foreground">
          This opening may have been closed or moved. Browse our current openings instead.
        </p>
        <Link
          to="/careers"
          className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent"
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
      <h2 className="text-lg font-bold text-primary">{title}</h2>
      {lines.length === 1 ? (
        <p className="mt-3 leading-relaxed text-muted-foreground">{lines[0]}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {lines.map((line) => (
            <li key={line} className="flex gap-3 leading-relaxed text-muted-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
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
    <div className="rounded-2xl border border-primary/5 bg-card p-6 shadow-card">
      <h2 className="text-base font-bold text-primary">Apply for this role</h2>
      {canApply ? (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            Applications take a few minutes. No account or password required.
          </p>
          {internalApply ? (
            <Link
              to="/apply/$slug"
              params={{ slug }}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-bold text-accent-foreground shadow-accent transition-transform hover:scale-[1.02]"
            >
              Apply Now
            </Link>
          ) : (
            <a
              href={job.google_form_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-bold text-accent-foreground shadow-accent transition-transform hover:scale-[1.02]"
            >
              Apply Now <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          )}
        </>
      ) : (

        <div className="mt-3 rounded-xl border border-dashed border-primary/15 bg-surface p-4">
          <p className="text-sm font-semibold text-primary">
            Applications are currently unavailable for this position.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Write to our recruitment team and we will let you know as soon as it reopens.
          </p>
          <Link to="/contact" className="mt-4 inline-flex text-sm font-bold text-accent">
            Contact our team
          </Link>
        </div>
      )}
      <p className="mt-5 text-xs text-muted-foreground">
        Last updated {formatDate(job.updated_at)}
      </p>
    </div>
  );

  return (
    <PublicShell>
      <section className="border-b border-primary/5 bg-surface py-14">
        <div className="container-page">
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> All openings
          </Link>
          <h1 className="mt-6 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-primary md:text-5xl">
            {job.title}
          </h1>
          {job.short_description ? (
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{job.short_description}</p>
          ) : null}
          {job.skills.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-primary/10 bg-card px-3 py-1 text-xs font-semibold text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="py-16">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-10">
            <dl className="grid grid-cols-2 gap-6 rounded-2xl border border-primary/5 bg-surface p-6 sm:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-primary">{fact.value}</dd>
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
    </PublicShell>
  );
}
