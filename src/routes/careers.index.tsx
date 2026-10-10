import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHero, PublicShell } from "@/components/site/public-shell";
import { JobCard } from "@/components/site/job-card";
import { activeJobsQuery } from "@/lib/queries";
import { employmentTypes, experienceBands, workModes } from "@/lib/content";

export const Route = createFileRoute("/careers/")({
  head: () => ({
    meta: [
      { title: "Careers — Current Job Openings | Nexus Talent" },
      {
        name: "description",
        content:
          "Search current job openings across our client engagements. Filter by location, experience, work mode and employment type. No account required to apply.",
      },
      { property: "og:title", content: "Find Your Next Opportunity — Nexus Talent Careers" },
      {
        property: "og:description",
        content:
          "Explore current opportunities and take the next step in your career. Apply in a single step, no registration needed.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(activeJobsQuery),
  errorComponent: () => (
    <PublicShell>
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-light text-[#161616]">Something went wrong</h1>
        <p className="mt-2 text-[#525252]">
          We couldn't load the job list. Please try again.
        </p>
      </div>
    </PublicShell>
  ),
  component: CareersPage,
});

const ALL = "all";

function CareersPage() {
  const { data: jobs } = useSuspenseQuery(activeJobsQuery);

  const [term, setTerm] = useState("");
  const [location, setLocation] = useState(ALL);
  const [experience, setExperience] = useState(ALL);
  const [workMode, setWorkMode] = useState(ALL);
  const [employmentType, setEmploymentType] = useState(ALL);
  const [department, setDepartment] = useState(ALL);

  const locations = useMemo(
    () => [...new Set(jobs.map((job) => job.location).filter(Boolean))] as string[],
    [jobs],
  );
  const departments = useMemo(
    () => [...new Set(jobs.map((job) => job.department).filter(Boolean))] as string[],
    [jobs],
  );

  const filtered = useMemo(() => {
    const query = term.trim().toLowerCase();
    return jobs.filter((job) => {
      const haystack = [job.title, job.short_description, job.department, ...job.skills]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (query && !haystack.includes(query)) return false;
      if (location !== ALL && job.location !== location) return false;
      if (workMode !== ALL && job.work_mode !== workMode) return false;
      if (employmentType !== ALL && job.employment_type !== employmentType) return false;
      if (department !== ALL && job.department !== department) return false;
      if (experience !== ALL) {
        const band = experienceBands.find((b) => b.label === experience);
        if (band) {
          const min = job.experience_min ?? 0;
          const max = job.experience_max ?? min;
          if (max < band.min || min > band.max) return false;
        }
      }
      return true;
    });
  }, [jobs, term, location, workMode, employmentType, department, experience]);

  const hasFilters =
    term !== "" ||
    [location, experience, workMode, employmentType, department].some((value) => value !== ALL);

  function clearFilters() {
    setTerm("");
    setLocation(ALL);
    setExperience(ALL);
    setWorkMode(ALL);
    setEmploymentType(ALL);
    setDepartment(ALL);
  }

  const selectClass =
    "w-full rounded-none border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-3 py-2.5 text-xs text-[#161616] outline-none transition-colors focus:border-b-2 focus:border-b-[#0f62fe]";

  return (
    <PublicShell>
      <PageHero
        eyebrow="Careers"
        title="Find Your Next Opportunity"
        subtitle="Explore current opportunities across our enterprise client engagements."
      />

      <section className="bg-[#ffffff] py-16">
        <div className="container-page">
          <div className="mb-10 rounded-none border border-[#e0e0e0] bg-[#ffffff] p-5">
            <div className="grid gap-4 lg:grid-cols-3">
              <label className="flex items-center gap-3 rounded-none border-0 border-b border-[#e0e0e0] bg-[#f4f4f4] px-4 lg:col-span-3">
                <Search className="size-4 shrink-0 text-[#8c8c8c]" aria-hidden="true" />
                <span className="sr-only">Search jobs</span>
                <input
                  type="search"
                  value={term}
                  maxLength={100}
                  onChange={(event) => setTerm(event.target.value)}
                  placeholder="Search job title, skills or keywords"
                  className="w-full bg-transparent py-3 text-sm text-[#161616] outline-none placeholder:text-[#8c8c8c]"
                />
              </label>

              <select
                aria-label="Filter by location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className={selectClass}
              >
                <option value={ALL}>All Locations</option>
                {locations.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by experience"
                value={experience}
                onChange={(event) => setExperience(event.target.value)}
                className={selectClass}
              >
                <option value={ALL}>All Experience Levels</option>
                {experienceBands.map((band) => (
                  <option key={band.label} value={band.label}>
                    {band.label}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by work mode"
                value={workMode}
                onChange={(event) => setWorkMode(event.target.value)}
                className={selectClass}
              >
                <option value={ALL}>All Work Modes</option>
                {workModes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by employment type"
                value={employmentType}
                onChange={(event) => setEmploymentType(event.target.value)}
                className={selectClass}
              >
                <option value={ALL}>All Employment Types</option>
                {employmentTypes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by department"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className={selectClass}
              >
                <option value={ALL}>All Departments</option>
                {departments.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-normal text-[#161616] tracking-[0.16px]">
              {filtered.length} {filtered.length === 1 ? "opportunity" : "opportunities"} available
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-[#0f62fe] hover:underline cursor-pointer"
              >
                Clear Filters
              </button>
            ) : null}
          </div>

          {filtered.length ? (
            <div className="grid gap-4">
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="rounded-none border border-dashed border-[#e0e0e0] bg-[#f4f4f4] p-14 text-center">
              <p className="font-normal text-[#161616]">
                {jobs.length
                  ? "No opportunities match your search criteria."
                  : "No active jobs available right now."}
              </p>
              <p className="mt-2 text-sm text-[#525252]">
                Try broadening your filters or check back soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
