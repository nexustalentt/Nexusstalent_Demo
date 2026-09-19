import { useState } from "react";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2, CalendarIcon } from "lucide-react";
import type { JobInsert, JobRow, FormRow } from "@/lib/admin-api";
import { jobStatuses, slugify, type JobStatus } from "@/lib/job-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const jobSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(140),
  slug: z.string().trim().min(3).max(90),
  job_code: z.string().trim().max(60).optional(),
  department: z.string().trim().max(80).optional(),
  location: z.string().trim().max(120).optional(),
  employment_type: z.string().trim().max(60).optional(),
  work_mode: z.string().trim().max(60).optional(),
  salary: z.string().trim().max(120).optional(),
  experience_min: z.number().int().min(0).max(60).nullable(),
  experience_max: z.number().int().min(0).max(60).nullable(),
  skills: z.array(z.string().max(60)).max(30),
  short_description: z.string().trim().max(300).optional(),
  description: z.string().trim().max(6000).optional(),
  responsibilities: z.string().trim().max(4000).optional(),
  requirements: z.string().trim().max(4000).optional(),
  preferred_qualifications: z.string().trim().max(4000).optional(),
  benefits: z.string().trim().max(4000).optional(),
  application_method: z.enum(["google_form", "internal_form"]),
  google_form_url: z.string().trim().url("Enter a valid URL").max(500).optional().or(z.literal("")),
  form_id: z.string().uuid().nullable(),

  status: z.enum(["draft", "active", "closed", "archived"]),
  published_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type JobFormValues = z.infer<typeof jobSchema>;

const employmentTypes = ["Full-time", "Part-time", "Contract", "Temporary", "Internship"];
const workModes = ["On-site", "Hybrid", "Remote"];

export function JobForm({
  job,
  forms,
  pending,
  onSubmit,
}: {
  job?: JobRow | null;
  forms: FormRow[];
  pending: boolean;
  onSubmit: (values: JobInsert) => void;
}) {
  const [values, setValues] = useState<JobFormValues>({
    title: job?.title ?? "",
    slug: job?.slug ?? "",
    job_code: job?.job_code ?? "",
    department: job?.department ?? "",
    location: job?.location ?? "",
    employment_type: job?.employment_type ?? "Full-time",
    work_mode: job?.work_mode ?? "On-site",
    salary: job?.salary ?? "",
    experience_min: job?.experience_min ?? null,
    experience_max: job?.experience_max ?? null,
    skills: job?.skills ?? [],
    short_description: job?.short_description ?? "",
    description: job?.description ?? "",
    responsibilities: job?.responsibilities ?? "",
    requirements: job?.requirements ?? "",
    preferred_qualifications: job?.preferred_qualifications ?? "",
    benefits: job?.benefits ?? "",
    application_method:
      job?.application_method === "internal_form" ? "internal_form" : "google_form",
    google_form_url: job?.google_form_url ?? "",
    form_id: job?.form_id ?? null,

    status: (job?.status as JobStatus) ?? "draft",
    published_at: job?.published_at ? new Date(job?.published_at) : null,
    updated_at: job?.updated_at ? new Date(job?.updated_at) : null,
  });
  const [skillsText, setSkillsText] = useState((job?.skills ?? []).join(", "));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function set<K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key as string]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key as string];
        return next;
      });
    }
  }

  function handleSkillsChange(text: string) {
    setSkillsText(text);
    if (errors["skills"]) {
      setErrors((current) => {
        const next = { ...current };
        delete next["skills"];
        return next;
      });
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    const candidate: JobFormValues = {
      ...values,
      slug: values.slug.trim() || slugify(values.title),
      skills: skillsText
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
        .slice(0, 30),
    };
    const parsed = jobSchema.safeParse(candidate);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      setFormError("Please fill in all mandatory fields highlighted in red below.");
      const firstKey = Object.keys(nextErrors)[0];
      if (firstKey) {
        const el = document.getElementById(firstKey);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        (el as HTMLElement | null)?.focus?.();
      }
      return;
    }
    setErrors({});
    setFormError(null);
    const data = parsed.data;
    const { published_at, updated_at, ...dataWithoutDates } = data;
    const publishedAtIso = published_at
      ? `${format(published_at, "yyyy-MM-dd")}T00:00:00.000Z`
      : null;
    const updatedAtIso = updated_at
      ? `${format(updated_at, "yyyy-MM-dd")}T00:00:00.000Z`
      : null;
    const payload: JobInsert = {
      ...dataWithoutDates,
      job_code: data.job_code || null,
      department: data.department || null,
      location: data.location || null,
      salary: data.salary || null,
      short_description: data.short_description || null,
      description: data.description || null,
      responsibilities: data.responsibilities || null,
      requirements: data.requirements || null,
      preferred_qualifications: data.preferred_qualifications || null,
      benefits: data.benefits || null,
      google_form_url:
        data.application_method === "internal_form" ? null : data.google_form_url || null,
      form_id: data.application_method === "internal_form" ? null : data.form_id,
      employment_type: data.employment_type || null,
      work_mode: data.work_mode || null,
      application_method: data.application_method,

      published_at: publishedAtIso,
      ...(updatedAtIso ? { updated_at: updatedAtIso } : {}),
    };
    onSubmit(payload);
  }

  const getFieldClass = (hasError: boolean) =>
    cn(
      "mt-2 w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-primary outline-none transition-colors",
      hasError
        ? "border-destructive ring-1 ring-destructive focus:border-destructive text-destructive placeholder:text-destructive/60"
        : "border-primary/10 focus:border-accent",
    );

  const getLabelClass = (hasError: boolean) =>
    cn(
      "text-xs font-bold tracking-widest uppercase transition-colors",
      hasError ? "text-destructive font-bold" : "text-muted-foreground",
    );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {formError ? (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <span className="size-2 rounded-full bg-destructive" />
          {formError}
        </div>
      ) : null}

      <section className="rounded-2xl border border-primary/5 bg-card p-6">
        <h2 className="font-bold text-primary">Role basics</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={getLabelClass(Boolean(errors["title"]))} htmlFor="title">
              Job title <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              value={values.title}
              maxLength={140}
              onChange={(event) => {
                set("title", event.target.value);
                if (!job) set("slug", slugify(event.target.value));
              }}
              className={getFieldClass(Boolean(errors["title"]))}
            />
            {errors["title"] ? <p className="mt-1 text-xs font-semibold text-destructive">{errors["title"]}</p> : null}
          </div>
          <div>
            <label className={getLabelClass(Boolean(errors["slug"]))} htmlFor="slug">
              URL slug <span className="text-destructive">*</span>
            </label>
            <input
              id="slug"
              value={values.slug}
              maxLength={90}
              onChange={(event) => set("slug", slugify(event.target.value))}
              className={getFieldClass(Boolean(errors["slug"]))}
            />
            {errors["slug"] ? <p className="mt-1 text-xs font-semibold text-destructive">{errors["slug"]}</p> : null}
          </div>
          <div>
            <label className={getLabelClass(Boolean(errors["job_code"]))} htmlFor="job_code">
              Job code
            </label>
            <input
              id="job_code"
              value={values.job_code ?? ""}
              maxLength={60}
              onChange={(event) => set("job_code", event.target.value)}
              className={getFieldClass(Boolean(errors["job_code"]))}
            />
            {errors["job_code"] ? <p className="mt-1 text-xs font-semibold text-destructive">{errors["job_code"]}</p> : null}
          </div>
          <div>
            <label className={getLabelClass(Boolean(errors["department"]))} htmlFor="department">
              Department
            </label>
            <input
              id="department"
              value={values.department ?? ""}
              maxLength={80}
              onChange={(event) => set("department", event.target.value)}
              className={getFieldClass(Boolean(errors["department"]))}
            />
            {errors["department"] ? <p className="mt-1 text-xs font-semibold text-destructive">{errors["department"]}</p> : null}
          </div>
          <div>
            <label className={getLabelClass(Boolean(errors["location"]))} htmlFor="location">
              Location
            </label>
            <input
              id="location"
              value={values.location ?? ""}
              maxLength={120}
              onChange={(event) => set("location", event.target.value)}
              className={getFieldClass(Boolean(errors["location"]))}
            />
            {errors["location"] ? <p className="mt-1 text-xs font-semibold text-destructive">{errors["location"]}</p> : null}
          </div>
          <div>
            <label className={getLabelClass(Boolean(errors["employment_type"]))} htmlFor="employment_type">
              Employment type
            </label>
            <select
              id="employment_type"
              value={values.employment_type ?? ""}
              onChange={(event) => set("employment_type", event.target.value)}
              className={getFieldClass(Boolean(errors["employment_type"]))}
            >
              {employmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors["employment_type"] ? <p className="mt-1 text-xs font-semibold text-destructive">{errors["employment_type"]}</p> : null}
          </div>
          <div>
            <label className={getLabelClass(Boolean(errors["work_mode"]))} htmlFor="work_mode">
              Work mode
            </label>
            <select
              id="work_mode"
              value={values.work_mode ?? ""}
              onChange={(event) => set("work_mode", event.target.value)}
              className={getFieldClass(Boolean(errors["work_mode"]))}
            >
              {workModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
            {errors["work_mode"] ? <p className="mt-1 text-xs font-semibold text-destructive">{errors["work_mode"]}</p> : null}
          </div>
          <div>
            <label className={getLabelClass(Boolean(errors["experience_min"]))} htmlFor="experience_min">
              Experience min (years)
            </label>
            <input
              id="experience_min"
              type="number"
              min={0}
              max={60}
              value={values.experience_min ?? ""}
              onChange={(event) =>
                set("experience_min", event.target.value === "" ? null : Number(event.target.value))
              }
              className={getFieldClass(Boolean(errors["experience_min"]))}
            />
            {errors["experience_min"] ? <p className="mt-1 text-xs font-semibold text-destructive">{errors["experience_min"]}</p> : null}
          </div>
          <div>
            <label className={getLabelClass(Boolean(errors["experience_max"]))} htmlFor="experience_max">
              Experience max (years)
            </label>
            <input
              id="experience_max"
              type="number"
              min={0}
              max={60}
              value={values.experience_max ?? ""}
              onChange={(event) =>
                set("experience_max", event.target.value === "" ? null : Number(event.target.value))
              }
              className={getFieldClass(Boolean(errors["experience_max"]))}
            />
            {errors["experience_max"] ? <p className="mt-1 text-xs font-semibold text-destructive">{errors["experience_max"]}</p> : null}
          </div>
          <div>
            <label className={getLabelClass(Boolean(errors["salary"]))} htmlFor="salary">
              Salary range
            </label>
            <input
              id="salary"
              value={values.salary ?? ""}
              maxLength={120}
              onChange={(event) => set("salary", event.target.value)}
              className={getFieldClass(Boolean(errors["salary"]))}
            />
            {errors["salary"] ? <p className="mt-1 text-xs font-semibold text-destructive">{errors["salary"]}</p> : null}
          </div>
          <div className="md:col-span-2">
            <label className={getLabelClass(Boolean(errors["skills"]))} htmlFor="skills">
              Skills (comma separated)
            </label>
            <input
              id="skills"
              value={skillsText}
              maxLength={600}
              onChange={(event) => handleSkillsChange(event.target.value)}
              className={getFieldClass(Boolean(errors["skills"]))}
            />
            {errors["skills"] ? <p className="mt-1 text-xs font-semibold text-destructive">{errors["skills"]}</p> : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-primary/5 bg-card p-6">
        <h2 className="font-bold text-primary">Job content</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Use one item per line for responsibilities, requirements, qualifications and benefits.
        </p>
        <div className="mt-5 space-y-5">
          <div>
            <label className={getLabelClass(Boolean(errors["short_description"]))} htmlFor="short_description">
              Summary (listing card)
            </label>
            <textarea
              id="short_description"
              rows={2}
              maxLength={300}
              value={values.short_description ?? ""}
              onChange={(event) => set("short_description", event.target.value)}
              className={getFieldClass(Boolean(errors["short_description"]))}
            />
            {errors["short_description"] ? <p className="mt-1 text-xs font-semibold text-destructive">{errors["short_description"]}</p> : null}
          </div>
          {(
            [
              ["description", "Full description", 6],
              ["responsibilities", "Key responsibilities", 5],
              ["requirements", "Requirements", 5],
              ["preferred_qualifications", "Preferred qualifications", 4],
              ["benefits", "Benefits", 4],
            ] as const
          ).map(([key, labelText, rows]) => (
            <div key={key}>
              <label className={getLabelClass(Boolean(errors[key]))} htmlFor={key}>
                {labelText}
              </label>
              <textarea
                id={key}
                rows={rows}
                maxLength={6000}
                value={values[key] ?? ""}
                onChange={(event) => set(key, event.target.value)}
                className={getFieldClass(Boolean(errors[key]))}
              />
              {errors[key] ? <p className="mt-1 text-xs font-semibold text-destructive">{errors[key]}</p> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-primary/5 bg-card p-6">
        <h2 className="font-bold text-primary">Application &amp; publishing</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={getLabelClass(Boolean(errors["application_method"]))} htmlFor="application_method">
              Application method
            </label>
            <select
              id="application_method"
              value={values.application_method}
              onChange={(event) =>
                set("application_method", event.target.value as JobFormValues["application_method"])
              }
              className={getFieldClass(Boolean(errors["application_method"]))}
            >
              <option value="google_form">Google Form (external link)</option>
              <option value="internal_form">Job Application Form (on this website)</option>
            </select>
            <p className="mt-2 text-xs text-muted-foreground">
              {values.application_method === "internal_form"
                ? "Candidates apply through the built-in application form and submissions appear under Job Applies."
                : "Candidates are sent to the Google Form link below."}
            </p>
          </div>
          {values.application_method === "google_form" ? (
            <>
              <div>
                <label className={getLabelClass(Boolean(errors["form_id"]))} htmlFor="form_id">
                  Linked application form
                </label>
                <select
                  id="form_id"
                  value={values.form_id ?? ""}
                  onChange={(event) => set("form_id", event.target.value || null)}
                  className={getFieldClass(Boolean(errors["form_id"]))}
                >
                  <option value="">Use custom URL below</option>
                  {forms.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={getLabelClass(Boolean(errors["google_form_url"]))} htmlFor="google_form_url">
                  Application form URL <span className="text-destructive">*</span>
                </label>
                <input
                  id="google_form_url"
                  value={values.google_form_url ?? ""}
                  maxLength={500}
                  placeholder="https://docs.google.com/forms/..."
                  onChange={(event) => set("google_form_url", event.target.value)}
                  className={getFieldClass(Boolean(errors["google_form_url"]))}
                />
                {errors["google_form_url"] ? (
                  <p className="mt-1 text-xs font-semibold text-destructive">{errors["google_form_url"]}</p>
                ) : null}
              </div>
            </>
          ) : null}

          <div>
            <label className={getLabelClass(Boolean(errors["status"]))} htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={values.status}
              onChange={(event) => set("status", event.target.value as JobStatus)}
              className={getFieldClass(Boolean(errors["status"]))}
            >
              {jobStatuses.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors["status"] ? (
              <p className="mt-1 text-xs font-semibold text-destructive">{errors["status"]}</p>
            ) : null}
          </div>
          <div>
            <label className={getLabelClass(false)} htmlFor="published_at">
              Published date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="published_at"
                  variant="outline"
                  className={cn(
                    "mt-2 w-full justify-start rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-left text-sm font-normal text-primary hover:bg-background hover:text-primary",
                    !values.published_at && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {values.published_at ? (
                    format(values.published_at, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={values.published_at ?? undefined}
                  onSelect={(date) => set("published_at", date ?? null)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className={getLabelClass(false)} htmlFor="updated_at">
              Last updated date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="updated_at"
                  variant="outline"
                  className={cn(
                    "mt-2 w-full justify-start rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-left text-sm font-normal text-primary hover:bg-background hover:text-primary",
                    !values.updated_at && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {values.updated_at ? (
                    format(values.updated_at, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={values.updated_at ?? undefined}
                  onSelect={(date) => set("updated_at", date ?? null)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground hover:bg-accent disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {job ? "Save changes" : "Create job"}
        </button>
      </div>
    </form>
  );
}
