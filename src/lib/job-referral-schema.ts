import { z } from "zod";

export const jobReferralStatuses = [
  { value: "new", label: "New" },
  { value: "under_review", label: "Under Review" },
  { value: "contacted", label: "Contacted" },
  { value: "interview", label: "Interview" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "selected", label: "Selected / Hired" },
  { value: "rejected", label: "Rejected" },
] as const;

export type JobReferralStatus = (typeof jobReferralStatuses)[number]["value"];

export const jobReferralSchema = z.object({
  job_id: z.string().uuid("Invalid job ID"),
  first_name: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name must be under 100 characters"),
  last_name: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(100, "Last name must be under 100 characters"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^[+0-9\s().-]{7,25}$/, "Please enter a valid phone number"),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address")
    .max(255, "Email address must be under 255 characters"),
  resume_name: z.string().trim().min(1, "Resume file is required"),
  resume_base64: z.string().min(1, "Resume file is required"),
});

export type JobReferralInput = z.infer<typeof jobReferralSchema>;
