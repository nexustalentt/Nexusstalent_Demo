-- Migration: Setup job_referrals table, RLS policies, and storage
RESET ROLE;

-- 1. Create job_referrals table
CREATE TABLE IF NOT EXISTS public.job_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code text NOT NULL UNIQUE DEFAULT ('REF-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(encode(extensions.gen_random_bytes(4), 'hex'), 1, 6))),
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  job_title text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  resume_name text NOT NULL,
  resume_path text,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS job_referrals_job_id_idx ON public.job_referrals (job_id);
CREATE INDEX IF NOT EXISTS job_referrals_created_at_idx ON public.job_referrals (created_at DESC);
CREATE INDEX IF NOT EXISTS job_referrals_email_idx ON public.job_referrals (lower(email));

-- 3. Ensure table ownership
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_referrals') THEN
    EXECUTE 'ALTER TABLE public.job_referrals OWNER TO postgres';
  END IF;
END $$;

-- 4. Schema permissions
GRANT ALL ON public.job_referrals TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_referrals TO authenticated;
GRANT INSERT ON public.job_referrals TO anon;

-- 5. Row Level Security
ALTER TABLE public.job_referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can submit job referrals" ON public.job_referrals;
DROP POLICY IF EXISTS "staff manage job referrals" ON public.job_referrals;

CREATE POLICY "public can submit job referrals"
  ON public.job_referrals
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "staff manage job referrals"
  ON public.job_referrals
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Trigger for updated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'job_referrals_updated_at'
  ) THEN
    CREATE TRIGGER job_referrals_updated_at
      BEFORE UPDATE ON public.job_referrals
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 7. Ensure resumes storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;
