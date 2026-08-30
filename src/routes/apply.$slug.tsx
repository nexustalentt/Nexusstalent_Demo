import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Upload } from "lucide-react";
import { PublicShell } from "@/components/site/public-shell";
import { publicJobQuery } from "@/lib/queries";
import { submitJobApplication } from "@/lib/job-applications.functions";
import {
  genders,
  heardAboutOptions,
  jobApplicationSchema,
  noticePeriods,
  qualifications,
} from "@/lib/job-application-schema";

export const Route = createFileRoute("/apply/$slug")({
  loader: async ({ context, params }) => {
    const job = await context.queryClient.ensureQueryData(publicJobQuery(params.slug));
    if (!job || job.application_method !== "internal_form") throw notFound();
    return { title: job.title };
  },
  head: ({ loaderData }) => {
    const title = loaderData
      ? `Apply — ${loaderData.title} | Nexus Talent`
      : "Application unavailable — Nexus Talent";
    const description = loaderData
      ? `Submit your application for the ${loaderData.title} opening at Nexus Talent.`
      : "This application form is no longer available.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicShell>
      <div className="container-page py-28 text-center">
        <h1 className="text-3xl font-bold text-primary">Application form unavailable</h1>
        <p className="mt-3 text-muted-foreground">
          This position is not accepting website applications right now.
        </p>
        <Link to="/careers" className="mt-8 inline-flex text-sm font-bold text-accent">
          View all openings
        </Link>
      </div>
    </PublicShell>
  ),
  errorComponent: () => (
    <PublicShell>
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold text-primary">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">Please try again in a moment.</p>
      </div>
    </PublicShell>
  ),
  component: ApplyPage,
});

const field =
  "mt-2 w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm text-primary outline-none focus:border-accent";
const labelClass = "text-xs font-bold tracking-widest uppercase text-muted-foreground";

type FormState = Record<string, string>;

function Field({
  name,
  label,
  required,
  errors,
  children,
}: {
  name: string;
  label: string;
  required?: boolean;
  errors: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass} htmlFor={name}>
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      {children}
      {errors[name] ? <p className="mt-1 text-xs text-destructive">{errors[name]}</p> : null}
    </div>
  );
}

function ApplyPage() {
  const { slug } = Route.useParams();
  const { data: job } = useSuspenseQuery(publicJobQuery(slug));
  const [values, setValues] = useState<FormState>({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    date_of_birth: "",
    gender: "",
    current_location: "",
    preferred_location: "",
    pan_number: "",
    highest_qualification: "",
    specialization: "",
    college: "",
    marks: "",
    year_of_passing: "",
    primary_skills: "",
    secondary_skills: "",
    programming_languages: "",
    tools_technologies: "",
    certifications: "",
    experience_type: "fresher",
    total_experience: "",
    relevant_experience: "",
    current_company: "",
    current_job_title: "",
    current_ctc: "",
    expected_ctc: "",
    notice_period: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    willing_to_relocate: "",
    availability_to_join: "",
    cover_letter: "",
    heard_about_us: "",
  });
  const [resume, setResume] = useState<{ name: string; base64: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const experienced = values["experience_type"] === "experienced";

  function set(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleResume(file: File | undefined) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((e) => ({ ...e, resume_name: "Resume must be smaller than 5 MB" }));
      return;
    }
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(file);
    });
    setErrors((e) => ({ ...e, resume_name: "" }));
    setResume({ name: file.name, base64 });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending || !job) return;
    setFormError(null);

    const candidate = {
      ...values,
      job_id: job.id,
      year_of_passing: values["year_of_passing"] ? Number(values["year_of_passing"]) : Number.NaN,
      willing_to_relocate:
        values["willing_to_relocate"] === ""
          ? undefined
          : values["willing_to_relocate"] === "yes",
      resume_name: resume?.name ?? "",
      resume_base64: resume?.base64 ?? "",
    };

    const parsed = jobApplicationSchema.safeParse(candidate);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setFormError("Please correct the highlighted fields.");
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const result = await submitJobApplication({ data: parsed.data });
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setSuccess(result.applicationCode);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFormError("Could not submit your application. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (!job) return null;

  if (success) {
    return (
      <PublicShell>
        <div className="container-page py-24">
          <div className="mx-auto max-w-xl rounded-2xl border border-primary/5 bg-card p-10 text-center shadow-card">
            <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden="true" />
            <h1 className="mt-5 text-2xl font-bold text-primary">Application submitted</h1>
            <p className="mt-3 text-muted-foreground">
              Your application has been submitted successfully. Our recruitment team will review your
              profile and contact you if shortlisted.
            </p>
            <p className="mt-4 text-sm font-semibold text-primary">
              Application ID: <span className="text-accent">{success}</span>
            </p>
            <Link
              to="/careers"
              className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent"
            >
              Browse more openings
            </Link>
          </div>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <section className="border-b border-primary/5 bg-surface py-12">
        <div className="container-page">
          <Link
            to="/careers/$slug"
            params={{ slug }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-accent"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to job details
          </Link>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Apply — {job.title}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {[job.location, job.employment_type, job.work_mode].filter(Boolean).join(" · ")}
          </p>
        </div>
      </section>

      <section className="py-12">
        <form onSubmit={handleSubmit} noValidate className="container-page max-w-4xl space-y-6">
          <div className="rounded-2xl border border-primary/5 bg-card p-6">
            <h2 className="font-bold text-primary">Personal details</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Field name="first_name" label="First name" required errors={errors}>
                <input
                  id="first_name"
                  className={field}
                  maxLength={60}
                  value={values["first_name"]}
                  onChange={(e) => set("first_name", e.target.value)}
                />
              </Field>
              <Field name="last_name" label="Last name" required errors={errors}>
                <input
                  id="last_name"
                  className={field}
                  maxLength={60}
                  value={values["last_name"]}
                  onChange={(e) => set("last_name", e.target.value)}
                />
              </Field>
              <Field name="phone" label="Phone number" required errors={errors}>
                <input
                  id="phone"
                  className={field}
                  inputMode="tel"
                  maxLength={20}
                  value={values["phone"]}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </Field>
              <Field name="email" label="Email address" required errors={errors}>
                <input
                  id="email"
                  type="email"
                  className={field}
                  maxLength={255}
                  value={values["email"]}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
              <Field name="date_of_birth" label="Date of birth" errors={errors}>
                <input
                  id="date_of_birth"
                  type="date"
                  className={field}
                  value={values["date_of_birth"]}
                  onChange={(e) => set("date_of_birth", e.target.value)}
                />
              </Field>
              <Field name="gender" label="Gender" errors={errors}>
                <select
                  id="gender"
                  className={field}
                  value={values["gender"]}
                  onChange={(e) => set("gender", e.target.value)}
                >
                  <option value="">Select</option>
                  {genders.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
              <Field name="current_location" label="Current location" errors={errors}>
                <input
                  id="current_location"
                  className={field}
                  maxLength={120}
                  value={values["current_location"]}
                  onChange={(e) => set("current_location", e.target.value)}
                />
              </Field>
              <Field name="preferred_location" label="Preferred location" errors={errors}>
                <input
                  id="preferred_location"
                  className={field}
                  maxLength={120}
                  value={values["preferred_location"]}
                  onChange={(e) => set("preferred_location", e.target.value)}
                />
              </Field>
              <Field name="pan_number" label="PAN number" required errors={errors}>
                <input
                  id="pan_number"
                  className={`${field} uppercase`}
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  value={values["pan_number"]}
                  onChange={(e) => set("pan_number", e.target.value.toUpperCase())}
                />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/5 bg-card p-6">
            <h2 className="font-bold text-primary">Education details</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Field
                name="highest_qualification"
                label="Highest qualification"
                required
                errors={errors}
              >
                <select
                  id="highest_qualification"
                  className={field}
                  value={values["highest_qualification"]}
                  onChange={(e) => set("highest_qualification", e.target.value)}
                >
                  <option value="">Select</option>
                  {qualifications.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
              <Field name="specialization" label="Specialization / degree" errors={errors}>
                <input
                  id="specialization"
                  className={field}
                  maxLength={120}
                  value={values["specialization"]}
                  onChange={(e) => set("specialization", e.target.value)}
                />
              </Field>
              <Field name="college" label="College / university" errors={errors}>
                <input
                  id="college"
                  className={field}
                  maxLength={160}
                  value={values["college"]}
                  onChange={(e) => set("college", e.target.value)}
                />
              </Field>
              <Field name="marks" label="Marks / percentage / CGPA" required errors={errors}>
                <input
                  id="marks"
                  className={field}
                  maxLength={30}
                  value={values["marks"]}
                  onChange={(e) => set("marks", e.target.value)}
                />
              </Field>
              <Field name="year_of_passing" label="Year of passing" required errors={errors}>
                <input
                  id="year_of_passing"
                  type="number"
                  min={1960}
                  max={new Date().getFullYear() + 6}
                  className={field}
                  value={values["year_of_passing"]}
                  onChange={(e) => set("year_of_passing", e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/5 bg-card p-6">
            <h2 className="font-bold text-primary">Technical details</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Field name="primary_skills" label="Primary technical skills" required errors={errors}>
                <input
                  id="primary_skills"
                  className={field}
                  maxLength={400}
                  value={values["primary_skills"]}
                  onChange={(e) => set("primary_skills", e.target.value)}
                />
              </Field>
              <Field name="secondary_skills" label="Secondary technical skills" errors={errors}>
                <input
                  id="secondary_skills"
                  className={field}
                  maxLength={400}
                  value={values["secondary_skills"]}
                  onChange={(e) => set("secondary_skills", e.target.value)}
                />
              </Field>
              <Field name="programming_languages" label="Programming languages" errors={errors}>
                <input
                  id="programming_languages"
                  className={field}
                  maxLength={400}
                  value={values["programming_languages"]}
                  onChange={(e) => set("programming_languages", e.target.value)}
                />
              </Field>
              <Field name="tools_technologies" label="Tools / technologies" errors={errors}>
                <input
                  id="tools_technologies"
                  className={field}
                  maxLength={400}
                  value={values["tools_technologies"]}
                  onChange={(e) => set("tools_technologies", e.target.value)}
                />
              </Field>
              <div className="md:col-span-2">
                <Field name="certifications" label="Certifications" errors={errors}>
                  <textarea
                    id="certifications"
                    rows={2}
                    className={field}
                    maxLength={600}
                    value={values["certifications"]}
                    onChange={(e) => set("certifications", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/5 bg-card p-6">
            <h2 className="font-bold text-primary">Experience details</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Field name="experience_type" label="Experience type" required errors={errors}>
                <select
                  id="experience_type"
                  className={field}
                  value={values["experience_type"]}
                  onChange={(e) => set("experience_type", e.target.value)}
                >
                  <option value="fresher">Fresher</option>
                  <option value="experienced">Experienced</option>
                </select>
              </Field>
              <Field name="expected_ctc" label="Expected CTC" errors={errors}>
                <input
                  id="expected_ctc"
                  className={field}
                  maxLength={40}
                  value={values["expected_ctc"]}
                  onChange={(e) => set("expected_ctc", e.target.value)}
                />
              </Field>
              {experienced ? (
                <>
                  <Field
                    name="total_experience"
                    label="Total years of experience"
                    required
                    errors={errors}
                  >
                    <input
                      id="total_experience"
                      className={field}
                      maxLength={40}
                      value={values["total_experience"]}
                      onChange={(e) => set("total_experience", e.target.value)}
                    />
                  </Field>
                  <Field name="relevant_experience" label="Relevant experience" errors={errors}>
                    <input
                      id="relevant_experience"
                      className={field}
                      maxLength={40}
                      value={values["relevant_experience"]}
                      onChange={(e) => set("relevant_experience", e.target.value)}
                    />
                  </Field>
                  <Field name="current_company" label="Current company" errors={errors}>
                    <input
                      id="current_company"
                      className={field}
                      maxLength={140}
                      value={values["current_company"]}
                      onChange={(e) => set("current_company", e.target.value)}
                    />
                  </Field>
                  <Field name="current_job_title" label="Current job title" errors={errors}>
                    <input
                      id="current_job_title"
                      className={field}
                      maxLength={140}
                      value={values["current_job_title"]}
                      onChange={(e) => set("current_job_title", e.target.value)}
                    />
                  </Field>
                  <Field name="current_ctc" label="Current CTC" errors={errors}>
                    <input
                      id="current_ctc"
                      className={field}
                      maxLength={40}
                      value={values["current_ctc"]}
                      onChange={(e) => set("current_ctc", e.target.value)}
                    />
                  </Field>
                  <Field name="notice_period" label="Notice period" errors={errors}>
                    <select
                      id="notice_period"
                      className={field}
                      value={values["notice_period"]}
                      onChange={(e) => set("notice_period", e.target.value)}
                    >
                      <option value="">Select</option>
                      {noticePeriods.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                </>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-primary/5 bg-card p-6">
            <h2 className="font-bold text-primary">Additional details</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field name="resume_name" label="Resume upload (PDF/DOC, max 5 MB)" required errors={errors}>
                  <label
                    htmlFor="resume"
                    className="mt-2 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-primary/20 bg-background px-4 py-3 text-sm text-muted-foreground hover:border-accent"
                  >
                    <Upload className="size-4" aria-hidden="true" />
                    {resume ? resume.name : "Choose a file"}
                  </label>
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf"
                    className="sr-only"
                    onChange={(e) => void handleResume(e.target.files?.[0])}
                  />
                </Field>
              </div>
              <Field name="linkedin_url" label="LinkedIn profile" errors={errors}>
                <input
                  id="linkedin_url"
                  className={field}
                  maxLength={300}
                  placeholder="https://linkedin.com/in/..."
                  value={values["linkedin_url"]}
                  onChange={(e) => set("linkedin_url", e.target.value)}
                />
              </Field>
              <Field name="github_url" label="GitHub profile" errors={errors}>
                <input
                  id="github_url"
                  className={field}
                  maxLength={300}
                  placeholder="https://github.com/..."
                  value={values["github_url"]}
                  onChange={(e) => set("github_url", e.target.value)}
                />
              </Field>
              <Field name="portfolio_url" label="Portfolio / website" errors={errors}>
                <input
                  id="portfolio_url"
                  className={field}
                  maxLength={300}
                  placeholder="https://..."
                  value={values["portfolio_url"]}
                  onChange={(e) => set("portfolio_url", e.target.value)}
                />
              </Field>
              <Field name="willing_to_relocate" label="Willing to relocate" errors={errors}>
                <select
                  id="willing_to_relocate"
                  className={field}
                  value={values["willing_to_relocate"]}
                  onChange={(e) => set("willing_to_relocate", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </Field>
              <Field name="availability_to_join" label="Availability to join" errors={errors}>
                <input
                  id="availability_to_join"
                  className={field}
                  maxLength={60}
                  value={values["availability_to_join"]}
                  onChange={(e) => set("availability_to_join", e.target.value)}
                />
              </Field>
              <Field name="heard_about_us" label="How did you hear about us?" errors={errors}>
                <select
                  id="heard_about_us"
                  className={field}
                  value={values["heard_about_us"]}
                  onChange={(e) => set("heard_about_us", e.target.value)}
                >
                  <option value="">Select</option>
                  {heardAboutOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field name="cover_letter" label="Cover letter / additional information" errors={errors}>
                  <textarea
                    id="cover_letter"
                    rows={4}
                    className={field}
                    maxLength={3000}
                    value={values["cover_letter"]}
                    onChange={(e) => set("cover_letter", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </div>

          {formError ? (
            <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">
              {formError}
            </p>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-accent-foreground shadow-accent disabled:opacity-60"
            >
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              {pending ? "Submitting…" : "Submit application"}
            </button>
          </div>
        </form>
      </section>
    </PublicShell>
  );
}
