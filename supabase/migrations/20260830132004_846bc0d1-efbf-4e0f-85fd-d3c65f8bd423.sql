DROP VIEW IF EXISTS public.public_site_settings;

-- Anonymous visitors may read only the public-facing columns (column-level grants)
GRANT SELECT (company_name, company_email, recruitment_email, phone, address,
              business_hours, linkedin_url, twitter_url, years_experience,
              professionals_placed, enterprise_clients, successful_projects)
  ON public.site_settings TO anon;

CREATE POLICY "public read settings" ON public.site_settings
  FOR SELECT TO anon USING (true);