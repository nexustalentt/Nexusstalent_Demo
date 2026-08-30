CREATE TYPE public.job_application_status AS ENUM ('new','under_review','shortlisted','aptitude_test','interview','selected','rejected','on_hold');

CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_code text NOT NULL UNIQUE DEFAULT ('APP-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(encode(extensions.gen_random_bytes(4), 'hex'), 1, 6))),
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  job_title text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  date_of_birth date,
  gender text,
  current_location text,
  preferred_location text,
  pan_number text,
  highest_qualification text NOT NULL,
  specialization text,
  college text,
  marks text NOT NULL,
  year_of_passing integer NOT NULL,
  primary_skills text NOT NULL,
  secondary_skills text,
  programming_languages text,
  tools_technologies text,
  certifications text,
  experience_type text NOT NULL DEFAULT 'fresher',
  total_experience text,
  relevant_experience text,
  current_company text,
  current_job_title text,
  current_ctc text,
  expected_ctc text,
  notice_period text,
  resume_path text,
  resume_name text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  willing_to_relocate boolean,
  availability_to_join text,
  cover_letter text,
  heard_about_us text,
  status public.job_application_status NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX job_applications_unique_job_email
  ON public.job_applications (job_id, lower(email));

CREATE INDEX job_applications_created_at_idx ON public.job_applications (created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_applications TO authenticated;
GRANT ALL ON public.job_applications TO service_role;

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff manage job applications" ON public.job_applications
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();