import { Link } from "@tanstack/react-router";
import type { PublicJob } from "@/lib/public-data.functions";
import { experienceLabel, relativePosted } from "@/lib/job-utils";

export function JobCard({ job }: { job: PublicJob }) {
  return (
    <article className="group relative flex flex-col items-start justify-between rounded-none border border-[#e0e0e0] bg-[#ffffff] p-6 transition-colors hover:border-[#0f62fe] md:flex-row md:items-center md:p-8">
      <div className="flex-1 min-w-0">
        <div className="mb-3 flex flex-wrap gap-2">
          {job.department ? (
            <span className="rounded-none border border-[#e0e0e0] bg-[#f4f4f4] px-2.5 py-1 text-xs text-[#525252]">
              {job.department}
            </span>
          ) : null}
          {job.work_mode ? (
            <span className="rounded-none border border-[#0f62fe]/30 bg-[#edf5ff] px-2.5 py-1 text-xs text-[#0f62fe]">
              {job.work_mode}
            </span>
          ) : null}
          {job.employment_type ? (
            <span className="rounded-none border border-[#e0e0e0] bg-[#f4f4f4] px-2.5 py-1 text-xs text-[#525252]">
              {job.employment_type}
            </span>
          ) : null}
        </div>

        <h3 className="text-xl font-normal text-[#161616] transition-colors group-hover:text-[#0f62fe]">
          <Link to="/careers/$slug" params={{ slug: job.slug }}>
            {job.title}
          </Link>
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-[#525252]">
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
                className="rounded-none border border-[#e0e0e0] bg-[#ffffff] px-2 py-0.5 text-xs text-[#525252]"
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
          className="inline-flex h-11 items-center justify-center rounded-none border border-[#0f62fe] bg-transparent px-6 text-sm font-normal text-[#0f62fe] transition-colors hover:bg-[#0f62fe] hover:text-white"
        >
          View Position →
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
