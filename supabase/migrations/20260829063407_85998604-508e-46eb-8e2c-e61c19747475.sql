-- 1. Database-verifiable password storage for exam candidates
ALTER TABLE public.exam_candidates ADD COLUMN IF NOT EXISTS password_crypt text;

-- 2. Public exam intro (link lookup)
CREATE OR REPLACE FUNCTION public.exam_public_intro(p_token text)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT json_build_object('title', e.title, 'description', e.description)
  FROM public.exams e
  WHERE e.public_token = p_token AND e.status = 'published'
  LIMIT 1;
$$;

-- 3. Candidate login (optionally scoped to an exam link token)
CREATE OR REPLACE FUNCTION public.exam_candidate_login(
  p_username text,
  p_password text,
  p_token text DEFAULT NULL
)
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
    RAISE EXCEPTION 'This exam opens on %.',
      to_char(c.access_start_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM');
  END IF;
  IF c.access_end_at IS NOT NULL AND c.access_end_at < now() THEN
    RAISE EXCEPTION 'The access window for this exam has closed.';
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

-- 4. Grading helpers
CREATE OR REPLACE FUNCTION public.exam_normalize_text(p_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT regexp_replace(
           regexp_replace(lower(btrim(coalesce(p_text, ''))), '\s+', ' ', 'g'),
           '[.,!?;:]+$', ''
         );
$$;

CREATE OR REPLACE FUNCTION public.exam_grade_answer(
  p_question_type text,
  p_correct_options jsonb,
  p_expected_answer text,
  p_marks numeric,
  p_answer jsonb
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_marks numeric := coalesce(p_marks, 0);
  v_selected int[] := '{}';
  v_correct int[] := '{}';
  v_given text := coalesce(p_answer->>'text', '');
  v_expected text := coalesce(p_expected_answer, '');
BEGIN
  IF p_answer IS NOT NULL AND jsonb_typeof(p_answer->'selected') = 'array' THEN
    SELECT coalesce(array_agg(v ORDER BY v), '{}') INTO v_selected
    FROM (
      SELECT (value#>>'{}')::numeric::int AS v
      FROM jsonb_array_elements(p_answer->'selected')
      WHERE jsonb_typeof(value) = 'number'
    ) s;
  END IF;

  IF jsonb_typeof(p_correct_options) = 'array' THEN
    SELECT coalesce(array_agg(v ORDER BY v), '{}') INTO v_correct
    FROM (
      SELECT (value#>>'{}')::numeric::int AS v
      FROM jsonb_array_elements(p_correct_options)
      WHERE jsonb_typeof(value) = 'number'
    ) s;
  END IF;

  IF p_question_type IN ('multiple_choice', 'true_false') THEN
    IF array_length(v_selected, 1) = 1
       AND coalesce(array_length(v_correct, 1), 0) >= 1
       AND v_selected[1] = v_correct[1] THEN
      RETURN v_marks;
    END IF;
    RETURN 0;
  ELSIF p_question_type = 'multiple_select' THEN
    IF coalesce(array_length(v_correct, 1), 0) > 0 AND v_selected = v_correct THEN
      RETURN v_marks;
    END IF;
    RETURN 0;
  ELSIF p_question_type = 'short_answer' THEN
    IF btrim(v_expected) = '' THEN
      RETURN NULL;
    END IF;
    IF EXISTS (
      SELECT 1
      FROM unnest(string_to_array(v_expected, '|')) AS accepted(value)
      WHERE public.exam_normalize_text(accepted.value) <> ''
        AND public.exam_normalize_text(accepted.value) = public.exam_normalize_text(v_given)
    ) THEN
      RETURN v_marks;
    END IF;
    RETURN 0;
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.exam_finalize_attempt(p_attempt_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_exam_id uuid;
  v_passing numeric;
  q record;
  v_awarded numeric;
  v_total_marks numeric := 0;
  v_auto numeric := 0;
  v_manual numeric := 0;
  v_pending boolean := false;
  v_total numeric;
  v_percentage numeric;
BEGIN
  SELECT exam_id INTO v_exam_id FROM public.exam_attempts WHERE id = p_attempt_id;
  IF v_exam_id IS NULL THEN
    RETURN;
  END IF;
  SELECT coalesce(passing_percentage, 0) INTO v_passing FROM public.exams WHERE id = v_exam_id;

  FOR q IN
    SELECT id, question_type, correct_options, expected_answer, coalesce(marks, 0) AS marks
    FROM public.exam_questions
    WHERE exam_id = v_exam_id
  LOOP
    v_total_marks := v_total_marks + q.marks;

    IF q.question_type = 'long_answer' THEN
      v_pending := true;
      CONTINUE;
    END IF;

    SELECT public.exam_grade_answer(
             q.question_type, q.correct_options, q.expected_answer, q.marks,
             (SELECT answer FROM public.exam_answers
              WHERE attempt_id = p_attempt_id AND question_id = q.id)
           )
      INTO v_awarded;

    IF v_awarded IS NOT NULL THEN
      v_auto := v_auto + v_awarded;
      INSERT INTO public.exam_answers (attempt_id, question_id, answer, awarded_marks, graded)
      VALUES (
        p_attempt_id, q.id,
        (SELECT answer FROM public.exam_answers WHERE attempt_id = p_attempt_id AND question_id = q.id),
        v_awarded, true
      )
      ON CONFLICT (attempt_id, question_id)
      DO UPDATE SET awarded_marks = excluded.awarded_marks, graded = true;
    END IF;
  END LOOP;

  v_total := v_auto + v_manual;
  v_percentage := CASE WHEN v_total_marks > 0
    THEN round((v_total / v_total_marks) * 100, 2) ELSE 0 END;

  UPDATE public.exam_attempts
  SET total_marks = v_total_marks,
      auto_score = v_auto,
      manual_score = v_manual,
      total_score = v_total,
      percentage = v_percentage,
      passed = v_percentage >= v_passing,
      status = CASE WHEN v_pending THEN 'pending_review' ELSE 'evaluated' END,
      submitted_at = now()
  WHERE id = p_attempt_id;
END;
$$;

-- 5. Attempt state (no answer key exposed)
CREATE OR REPLACE FUNCTION public.exam_attempt_state(p_session_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  a record;
  v_result json;
BEGIN
  SELECT id, exam_id, status, expires_at, submitted_at INTO a
  FROM public.exam_attempts WHERE session_token = p_session_token;
  IF a IS NULL THEN
    RAISE EXCEPTION 'Session expired. Please sign in again.';
  END IF;

  IF a.status = 'in_progress' AND a.expires_at <= now() THEN
    PERFORM public.exam_finalize_attempt(a.id);
    SELECT id, exam_id, status, expires_at, submitted_at INTO a
    FROM public.exam_attempts WHERE id = a.id;
  END IF;

  SELECT json_build_object(
    'exam', (
      SELECT json_build_object(
        'title', e.title, 'description', e.description,
        'instructions', e.instructions, 'duration_minutes', e.duration_minutes)
      FROM public.exams e WHERE e.id = a.exam_id
    ),
    'questions', coalesce((
      SELECT json_agg(json_build_object(
        'id', q.id, 'position', q.position, 'section', q.section,
        'question_type', q.question_type, 'prompt', q.prompt,
        'options', q.options, 'marks', q.marks) ORDER BY q.position)
      FROM public.exam_questions q WHERE q.exam_id = a.exam_id
    ), '[]'::json),
    'answers', coalesce((
      SELECT json_object_agg(ans.question_id, ans.answer)
      FROM public.exam_answers ans
      WHERE ans.attempt_id = a.id AND ans.answer IS NOT NULL
    ), '{}'::json),
    'reviewFlags', coalesce((
      SELECT json_agg(ans.question_id)
      FROM public.exam_answers ans
      WHERE ans.attempt_id = a.id AND ans.marked_for_review
    ), '[]'::json),
    'secondsRemaining', greatest(0, floor(extract(epoch FROM (a.expires_at - now())))),
    'status', a.status,
    'submittedAt', a.submitted_at
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- 6. Save an answer / review flag
CREATE OR REPLACE FUNCTION public.exam_save_answer(
  p_session_token text,
  p_question_id uuid,
  p_answer jsonb DEFAULT NULL,
  p_set_answer boolean DEFAULT false,
  p_marked boolean DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  a record;
BEGIN
  SELECT id, exam_id, status, expires_at INTO a
  FROM public.exam_attempts WHERE session_token = p_session_token;
  IF a IS NULL THEN
    RAISE EXCEPTION 'Session expired. Please sign in again.';
  END IF;
  IF a.status <> 'in_progress' THEN
    RAISE EXCEPTION 'This exam has already been submitted.';
  END IF;
  IF a.expires_at <= now() THEN
    PERFORM public.exam_finalize_attempt(a.id);
    RAISE EXCEPTION 'Time is up. Your exam has been submitted.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.exam_questions WHERE id = p_question_id AND exam_id = a.exam_id
  ) THEN
    RAISE EXCEPTION 'Unknown question.';
  END IF;

  INSERT INTO public.exam_answers (attempt_id, question_id, answer, marked_for_review)
  VALUES (a.id, p_question_id,
          CASE WHEN p_set_answer THEN p_answer ELSE NULL END,
          coalesce(p_marked, false))
  ON CONFLICT (attempt_id, question_id) DO UPDATE
  SET answer = CASE WHEN p_set_answer THEN p_answer ELSE public.exam_answers.answer END,
      marked_for_review = coalesce(p_marked, public.exam_answers.marked_for_review),
      updated_at = now();

  RETURN json_build_object('ok', true);
END;
$$;

-- 7. Submit
CREATE OR REPLACE FUNCTION public.exam_submit(p_session_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  a record;
BEGIN
  SELECT id, status INTO a FROM public.exam_attempts WHERE session_token = p_session_token;
  IF a IS NULL THEN
    RAISE EXCEPTION 'Session expired. Please sign in again.';
  END IF;
  IF a.status = 'in_progress' THEN
    PERFORM public.exam_finalize_attempt(a.id);
  END IF;
  RETURN json_build_object('ok', true);
END;
$$;

-- 8. Staff-only credential upsert (stores the database-verifiable password)
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
    exam_id, username, password_hash, password_crypt, full_name, email,
    access_start_at, access_end_at, duration_minutes
  )
  VALUES (
    p_exam_id, p_username, 'crypt', v_crypt, p_full_name, p_email,
    p_access_start_at, p_access_end_at, p_duration_minutes
  )
  ON CONFLICT (exam_id, username) DO UPDATE
  SET password_hash = 'crypt',
      password_crypt = v_crypt,
      full_name = excluded.full_name,
      email = excluded.email,
      access_start_at = excluded.access_start_at,
      access_end_at = excluded.access_end_at,
      duration_minutes = excluded.duration_minutes;

  RETURN json_build_object('ok', true);
END;
$$;

-- 9. Execution grants
REVOKE ALL ON FUNCTION public.exam_public_intro(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.exam_candidate_login(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.exam_attempt_state(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.exam_save_answer(text, uuid, jsonb, boolean, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.exam_submit(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.exam_upsert_candidate(uuid, text, text, text, text, timestamptz, timestamptz, int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.exam_finalize_attempt(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.exam_public_intro(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.exam_candidate_login(text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.exam_attempt_state(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.exam_save_answer(text, uuid, jsonb, boolean, boolean) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.exam_submit(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.exam_upsert_candidate(uuid, text, text, text, text, timestamptz, timestamptz, int) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.exam_finalize_attempt(uuid) TO service_role;