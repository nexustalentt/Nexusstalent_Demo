ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS zozii_download_url text,
  ADD COLUMN IF NOT EXISTS zozii_version text;

GRANT SELECT (zozii_download_url, zozii_version) ON public.site_settings TO anon, authenticated;