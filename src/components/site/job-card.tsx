import { Link } from "@tanstack/react-router";
import type { PublicJob } from "@/lib/public-data.functions";
import { experienceLabel, relativePosted } from "@/lib/job-utils";

export function JobCard({ job }: { job: PublicJob }) {
  return (
    <article className="group relative flex flex-col items-start justify-between rounded-2xl border border-primary/5 bg-card p-6 transition-all hover:border-accent/50 hover:shadow-elegant md:flex-row md:items-center md:p-8">
      <div className="flex-1">
        <div className="mb-3 flex flex-wrap gap-2">
          {job.department ? (
            <span className="rounded bg-surface px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
              {job.department}
            </span>
          ) : null}
          {job.work_mode ? (
            <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-accent">
              {job.work_mode}
            </span>
          ) : null}
          {job.employment_type ? (
            <span className="rounded bg-surface px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
              {job.employment_type}
            </span>
          ) : null}
        </div>

        <h3 className="text-xl font-bold text-primary transition-colors group-hover:text-accent">
          <Link to="/careers/$slug" params={{ slug: job.slug }}>
            {job.title}
          </Link>
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>{job.location ?? "Location flexible"}</span>
          <span>{experienceLabel(job.experience_min, job.experience_max)}</span>
          {job.salary ? <span>{job.salary}</span> : null}
          <span>{relativePosted(job.published_at ?? job.created_at)}</span>
        </div>

        {job.skills.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {job.skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="rounded border border-primary/10 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-center gap-4 md:mt-0 md:pl-8">
        <Link
          to="/careers/$slug"
          params={{ slug: job.slug }}
          className="rounded-full border-2 border-primary px-8 py-2.5 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
        >
          View Job
        </Link>
      </div>
    </article>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="rounded-2xl border border-primary/5 bg-card p-8">
      <div className="h-3 w-24 animate-pulse rounded bg-surface" />
      <div className="mt-4 h-6 w-64 animate-pulse rounded bg-surface" />
      <div className="mt-4 h-3 w-80 animate-pulse rounded bg-surface" />
    </div>
  );
}
