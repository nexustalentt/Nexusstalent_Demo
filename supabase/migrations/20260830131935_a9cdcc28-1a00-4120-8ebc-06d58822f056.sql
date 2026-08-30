-- 1. Profiles: restrict reads to owner or staff
DROP POLICY IF EXISTS "profiles readable by authenticated" ON public.profiles;
CREATE POLICY "own or staff profile read" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_staff(auth.uid()));

-- 2. Site settings: no anonymous access to internal flags; expose only public fields via a view
DROP POLICY IF EXISTS "public read settings" ON public.site_settings;
REVOKE SELECT ON public.site_settings FROM anon;

CREATE OR REPLACE VIEW public.public_site_settings
WITH (security_invoker = off) AS
SELECT company_name, company_email, recruitment_email, phone, address,
       business_hours, linkedin_url, twitter_url, years_experience,
       professionals_placed, enterprise_clients, successful_projects
FROM public.site_settings;

GRANT SELECT ON public.public_site_settings TO anon, authenticated;

-- 3. Internal SECURITY DEFINER helpers must not be callable via the API
REVOKE ALL ON FUNCTION public.exam_finalize_attempt(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.exam_upsert_candidate(uuid, text, text, text, text, timestamptz, timestamptz, integer) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;