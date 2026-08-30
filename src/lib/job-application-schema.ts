import { z } from "zod";

export type JobApplicationStatus =
  | "new"
  | "under_review"
  | "shortlisted"
  | "aptitude_test"
  | "interview"
  | "selected"
  | "rejected"
  | "on_hold";

export const jobApplicationStatuses: { value: JobApplicationStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "under_review", label: "Under Review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "aptitude_test", label: "Aptitude Test" },
  { value: "interview", label: "Interview" },
  { value: "selected", label: "Selected" },
  { value: "rejected", label: "Rejected" },
  { value: "on_hold", label: "On Hold" },
];

export const genders = ["Male", "Female", "Other", "Prefer not to say"];
export const qualifications = [
  "10th",
  "12th / Diploma",
  "B.E / B.Tech",
  "B.Sc",
  "B.Com",
  "BCA",
  "BBA",
  "Other Bachelors",
  "M.E / M.Tech",
  "M.Sc",
  "MCA",
  "MBA",
  "Other Masters",
  "PhD",
];
export const noticePeriods = [
  "Immediate",
  "15 days",
  "30 days",
  "45 days",
  "60 days",
  "90 days",
];
export const heardAboutOptions = [
  "Company website",
  "LinkedIn",
  "Naukri",
  "Referral",
  "Job fair",
  "Other",
];

const optional = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const optionalUrl = (max: number) =>
  z.string().trim().url("Enter a valid URL").max(max).optional().or(z.literal(""));

export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const jobApplicationSchema = z
  .object({
    job_id: z.string().uuid(),
    first_name: z.string().trim().min(2, "First name is required").max(60),
    last_name: z.string().trim().min(1, "Last name is required").max(60),
    phone: z
      .string()
      .trim()
      .regex(/^[+]?[0-9\s-]{10,15}$/, "Enter a valid phone number")
      .max(20),
    email: z.string().trim().email("Enter a valid email address").max(255),
    date_of_birth: optional(20),
    gender: optional(30),
    current_location: optional(120),
    preferred_location: optional(120),
    pan_number: z
      .string()
      .trim()
      .min(1, "PAN number is required")
      .toUpperCase()
      .regex(panRegex, "PAN must look like ABCDE1234F"),
    highest_qualification: z.string().trim().min(1, "Highest qualification is required").max(80),
    specialization: optional(120),
    college: optional(160),
    marks: z.string().trim().min(1, "Marks / percentage / CGPA is required").max(30),
    year_of_passing: z
      .number({ message: "Year of passing is required" })
      .int()
      .min(1960, "Enter a valid year")
      .max(new Date().getFullYear() + 6, "Enter a valid year"),
    primary_skills: z.string().trim().min(2, "Primary technical skills are required").max(400),
    secondary_skills: optional(400),
    programming_languages: optional(400),
    tools_technologies: optional(400),
    certifications: optional(600),
    experience_type: z.enum(["fresher", "experienced"]),
    total_experience: optional(40),
    relevant_experience: optional(40),
    current_company: optional(140),
    current_job_title: optional(140),
    current_ctc: optional(40),
    expected_ctc: optional(40),
    notice_period: optional(40),
    resume_name: z.string().trim().min(1, "Resume is required").max(200),
    resume_base64: z.string().min(20, "Resume is required").max(7_000_000),
    linkedin_url: optionalUrl(300),
    github_url: optionalUrl(300),
    portfolio_url: optionalUrl(300),
    willing_to_relocate: z.boolean().optional(),
    availability_to_join: optional(60),
    cover_letter: optional(3000),
    heard_about_us: optional(80),
  })
  .refine(
    (value) => value.experience_type === "fresher" || Boolean(value.total_experience?.trim()),
    { path: ["total_experience"], message: "Total years of experience is required" },
  );

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;

export function maskPan(pan?: string | null) {
  if (!pan) return "—";
  if (pan.length < 6) return "•••••";
  return `${pan.slice(0, 2)}${"•".repeat(pan.length - 5)}${pan.slice(-3)}`;
}
