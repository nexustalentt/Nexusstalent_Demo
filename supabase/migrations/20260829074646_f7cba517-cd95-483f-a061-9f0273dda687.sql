UPDATE public.exam_candidates
SET access_start_at = access_start_at - interval '5 hours 30 minutes'
WHERE access_start_at IS NOT NULL;

UPDATE public.exam_candidates
SET access_end_at = access_end_at - interval '5 hours 30 minutes'
WHERE access_end_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.exam_candidate_login(p_username text, p_password text, p_token text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_exam_id uuid;
  c record;
  e record;
  existing record;
  v_minutes int;
  v_session text;
BEGIN
  IF p_token IS NOT NULL THEN
    SELECT id INTO v_exam_id FROM public.exams WHERE public_token = p_token;
    IF v_exam_id IS NULL THEN
      RAISE EXCEPTION 'Invalid username or password.';
    END IF;
  END IF;

  SELECT * INTO c
  FROM public.exam_candidates
  WHERE lower(username) = lower(p_username)
    AND (v_exam_id IS NULL OR exam_id = v_exam_id)
  LIMIT 1;

  IF c IS NULL THEN
    RAISE EXCEPTION 'Invalid username or password.';
  END IF;

  IF c.password_crypt IS NULL THEN
    RAISE EXCEPTION 'Your exam password needs to be reset by the recruitment team.';
  END IF;

  IF crypt(p_password, c.password_crypt) <> c.password_crypt THEN
    RAISE EXCEPTION 'Invalid username or password.';
  END IF;

  SELECT id, status, duration_minutes INTO e FROM public.exams WHERE id = c.exam_id;
  IF e IS NULL THEN
    RAISE EXCEPTION 'Invalid username or password.';
  END IF;
  IF e.status <> 'published' THEN
    RAISE EXCEPTION 'This exam is not active right now. Please contact the recruitment team.';
  END IF;
  IF NOT c.access_enabled THEN
    RAISE EXCEPTION 'Your exam access has been disabled. Please contact the recruitment team.';
  END IF;
  IF c.access_start_at IS NOT NULL AND c.access_start_at > now() THEN
    RAISE EXCEPTION 'This exam opens on % IST.',
      to_char(c.access_start_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY, HH24:MI');
  END IF;
  IF c.access_end_at IS NOT NULL AND c.access_end_at < now() THEN
    RAISE EXCEPTION 'The access window for this exam closed on % IST.',
      to_char(c.access_end_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY, HH24:MI');
  END IF;

  SELECT session_token, status INTO existing
  FROM public.exam_attempts
  WHERE exam_id = e.id AND candidate_id = c.id
  LIMIT 1;

  IF existing IS NOT NULL THEN
    IF existing.status <> 'in_progress' THEN
      RAISE EXCEPTION 'You already took an exam. Thank you!';
    END IF;
    RETURN json_build_object('sessionToken', existing.session_token);
  END IF;

  v_minutes := coalesce(c.duration_minutes, e.duration_minutes);
  v_session := encode(gen_random_bytes(24), 'hex');

  BEGIN
    INSERT INTO public.exam_attempts (exam_id, candidate_id, session_token, expires_at)
    VALUES (e.id, c.id, v_session, now() + make_interval(mins => v_minutes));
  EXCEPTION WHEN unique_violation THEN
    SELECT session_token, status INTO existing
    FROM public.exam_attempts
    WHERE exam_id = e.id AND candidate_id = c.id
    LIMIT 1;
    IF existing IS NULL THEN
      RAISE EXCEPTION 'Unable to start the exam. Please try again.';
    END IF;
    IF existing.status <> 'in_progress' THEN
      RAISE EXCEPTION 'You already took an exam. Thank you!';
    END IF;
    RETURN json_build_object('sessionToken', existing.session_token);
  END;

  RETURN json_build_object('sessionToken', v_session);
END;
$$;