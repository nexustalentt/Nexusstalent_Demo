ALTER TABLE public.exam_candidates ADD COLUMN IF NOT EXISTS password_note text;

CREATE OR REPLACE FUNCTION public.exam_upsert_candidate(
  p_exam_id uuid,
  p_username text,
  p_password text,
  p_full_name text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_access_start_at timestamptz DEFAULT NULL,
  p_access_end_at timestamptz DEFAULT NULL,
  p_duration_minutes int DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_crypt text;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF p_password IS NULL OR length(p_password) < 8 THEN
    RAISE EXCEPTION 'Password must be at least 8 characters';
  END IF;

  v_crypt := crypt(p_password, gen_salt('bf', 10));

  INSERT INTO public.exam_candidates AS ec (
    exam_id, username, password_hash, password_crypt, password_note, full_name, email,
    access_start_at, access_end_at, duration_minutes
  )
  VALUES (
    p_exam_id, p_username, 'crypt', v_crypt, p_password, p_full_name, p_email,
    p_access_start_at, p_access_end_at, p_duration_minutes
  )
  ON CONFLICT (exam_id, username) DO UPDATE
  SET password_hash = 'crypt',
      password_crypt = v_crypt,
      password_note = excluded.password_note,
      full_name = excluded.full_name,
      email = excluded.email,
      access_start_at = excluded.access_start_at,
      access_end_at = excluded.access_end_at,
      duration_minutes = excluded.duration_minutes;

  RETURN json_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.exam_upsert_candidate(uuid, text, text, text, text, timestamptz, timestamptz, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.exam_upsert_candidate(uuid, text, text, text, text, timestamptz, timestamptz, int) TO authenticated, service_role;