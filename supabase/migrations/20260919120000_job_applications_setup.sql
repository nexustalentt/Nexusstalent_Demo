-- Migration: Fix RLS on jobs, setup job_applications and storage
-- 0. Reset any switched role back to postgres owner
RESET ROLE;

-- 1. Ensure table ownership
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs') THEN
    EXECUTE 'ALTER TABLE public.jobs OWNER TO postgres';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_applications') THEN
    EXECUTE 'ALTER TABLE public.job_applications OWNER TO postgres';
  END IF;
END $$;

-- 2. Grant schema permissions (Postgres 15+ compatibility)
GRANT ALL ON SCHEMA public TO postgres;
GRANT USAGE, CREATE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Fix Row-Level Security on public.jobs so authenticated admins can Create, Edit, and Delete jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff manage jobs" ON public.jobs;
DROP POLICY IF EXISTS "authenticated users manage jobs" ON public.jobs;
DROP POLICY IF EXISTS "public can view active jobs" ON public.jobs;

CREATE POLICY "public can view active jobs"
  ON public.jobs
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "authenticated users manage jobs"
  ON public.jobs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Fix Row-Level Security on public.job_applications so public can apply and staff can view
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can submit job applications" ON public.job_applications;
DROP POLICY IF EXISTS "staff manage job applications" ON public.job_applications;

CREATE POLICY "public can submit job applications"
  ON public.job_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "staff manage job applications"
  ON public.job_applications
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Fix audit_logs RLS if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "staff view audit" ON public.audit_logs;
    DROP POLICY IF EXISTS "staff insert audit" ON public.audit_logs;
    DROP POLICY IF EXISTS "authenticated manage audit" ON public.audit_logs;
    CREATE POLICY "authenticated manage audit" ON public.audit_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 5. Setup resumes storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'public can upload resumes'
  ) THEN
    CREATE POLICY "public can upload resumes"
      ON storage.objects
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (bucket_id = 'resumes');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'authenticated can read resumes'
  ) THEN
    CREATE POLICY "authenticated can read resumes"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (bucket_id = 'resumes');
  END IF;
END $$;
