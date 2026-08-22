import { createServerFn } from "@tanstack/react-start";
import { publicClient } from "@/lib/supabase-public.server";

export type PublicJob = {
  id: string;
  title: string;
  slug: string;
  job_code: string | null;
  department: string | null;
  location: string | null;
  work_mode: string | null;
  employment_type: string | null;
  experience_min: number | null;
  experience_max: number | null;
  salary: string | null;
  short_description: string | null;
  skills: string[];
  published_at: string | null;
  created_at: string;
};

export type PublicJobDetail = PublicJob & {
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  preferred_qualifications: string | null;
  benefits: string | null;
  application_method: string;
  google_form_url: string | null;
  updated_at: string;
};

const LIST_COLUMNS =
  "id, title, slug, job_code, department, location, work_mode, employment_type, experience_min, experience_max, salary, short_description, skills, published_at, created_at";

const DETAIL_COLUMNS = `${LIST_COLUMNS}, description, responsibilities, requirements, preferred_qualifications, benefits, application_method, google_form_url, updated_at`;


export const listActiveJobs = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("jobs")
    .select(LIST_COLUMNS)
    .eq("status", "active")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicJob[];
});

export const getPublicJob = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 120) }))
  .handler(async ({ data }) => {
    const { data: job, error } = await publicClient()
      .from("jobs")
      .select(DETAIL_COLUMNS)
      .eq("status", "active")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (job ?? null) as PublicJobDetail | null;
  });

export type SiteSettings = {
  company_name: string;
  company_email: string | null;
  recruitment_email: string | null;
  phone: string | null;
  address: string | null;
  business_hours: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  years_experience: string | null;
  professionals_placed: string | null;
  enterprise_clients: string | null;
  successful_projects: string | null;
};

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("site_settings")
    .select(
      "company_name, company_email, recruitment_email, phone, address, business_hours, linkedin_url, twitter_url, years_experience, professionals_placed, enterprise_clients, successful_projects",
    )
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as SiteSettings | null;
});
