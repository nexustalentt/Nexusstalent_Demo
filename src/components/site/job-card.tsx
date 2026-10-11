import { Link } from "@tanstack/react-router";
import type { PublicJob } from "@/lib/public-data.functions";
import { experienceLabel, relativePosted } from "@/lib/job-utils";

export function JobCard({ job }: { job: PublicJob }) {
  return (
    <article className="group relative flex flex-col items-start justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-400 hover:shadow-md md:flex-row md:items-center md:p-8">
      <div className="flex-1 min-w-0">
        <div className="mb-3 flex flex-wrap gap-2">
          {job.department ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
              {job.department}
            </span>
          ) : null}
          {job.work_mode ? (
            <span className="rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700">
              {job.work_mode}
            </span>
          ) : null}
          {job.employment_type ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
              {job.employment_type}
            </span>
          ) : null}
        </div>

        <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600">
          <Link to="/careers/$slug" params={{ slug: job.slug }}>
            {job.title}
          </Link>
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-600">
          <span>{job.location ?? "Location flexible"}</span>
          <span>{experienceLabel(job.experience_min, job.experience_max)}</span>
          {job.salary ? <span>{job.salary}</span> : null}
          <span>{relativePosted(job.published_at ?? job.created_at)}</span>
        </div>

        {job.skills.length ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-slate-200/80 bg-slate-50/60 px-2.5 py-0.5 text-xs text-slate-600"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-center gap-4 md:mt-0 md:pl-8 shrink-0">
        <Link
          to="/careers/$slug"
          params={{ slug: job.slug }}
          className="btn-liquid-secondary group/btn inline-flex h-10 items-center justify-center px-5 text-xs font-semibold"
        >
          <span className="btn-content-wrap">
            <span>View Position</span>
            <svg
              className="btn-arrow-icon size-3.5"
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
    </article>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="rounded-none border border-[#e0e0e0] bg-[#ffffff] p-8">
      <div className="h-4 w-28 animate-pulse bg-[#f4f4f4]" />
      <div className="mt-4 h-6 w-64 animate-pulse bg-[#f4f4f4]" />
      <div className="mt-4 h-4 w-80 animate-pulse bg-[#f4f4f4]" />
    </div>
  );
}
