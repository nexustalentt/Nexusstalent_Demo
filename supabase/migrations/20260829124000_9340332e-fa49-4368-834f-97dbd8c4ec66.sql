ALTER TABLE public.exam_attempts ADD COLUMN IF NOT EXISTS exam_started_at timestamptz;

UPDATE public.exam_attempts SET exam_started_at = started_at WHERE exam_started_at IS NULL AND (status <> 'in_progress' OR started_at < now() - interval '1 minute');

CREATE OR REPLACE FUNCTION public.exam_start_attempt(p_session_token text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  a record;
  v_minutes int;
BEGIN
  SELECT t.id, t.exam_id, t.candidate_id, t.status, t.exam_started_at
  INTO a
  FROM public.exam_attempts t WHERE t.session_token = p_session_token;
  IF a IS NULL THEN
    RAISE EXCEPTION 'Session expired. Please sign in again.';
  END IF;
  IF a.status <> 'in_progress' THEN
    RAISE EXCEPTION 'You already took an exam. Thank you!';
  END IF;
  IF a.exam_started_at IS NOT NULL THEN
    RETURN json_build_object('ok', true);
  END IF;

  SELECT coalesce(c.duration_minutes, e.duration_minutes) INTO v_minutes
  FROM public.exam_candidates c
  JOIN public.exams e ON e.id = c.exam_id
  WHERE c.id = a.candidate_id;

  UPDATE public.exam_attempts
  SET exam_started_at = now(),
      started_at = now(),
      expires_at = now() + make_interval(mins => coalesce(v_minutes, 60))
  WHERE id = a.id;

  RETURN json_build_object('ok', true);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.exam_start_attempt(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.exam_attempt_state(p_session_token text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  a record;
  v_candidate_name text;
  v_candidate_username text;
  v_duration int;
  v_result json;
BEGIN
  SELECT id, exam_id, candidate_id, status, expires_at, submitted_at, exam_started_at INTO a
  FROM public.exam_attempts WHERE session_token = p_session_token;
  IF a IS NULL THEN
    RAISE EXCEPTION 'Session expired. Please sign in again.';
  END IF;

  IF a.status = 'in_progress' AND a.exam_started_at IS NOT NULL AND a.expires_at <= now() THEN
    PERFORM public.exam_finalize_attempt(a.id);
    SELECT id, exam_id, candidate_id, status, expires_at, submitted_at, exam_started_at INTO a
    FROM public.exam_attempts WHERE id = a.id;
  END IF;

  SELECT coalesce(c.full_name, c.username), c.username, coalesce(c.duration_minutes, e.duration_minutes)
  INTO v_candidate_name, v_candidate_username, v_duration
  FROM public.exam_candidates c
  JOIN public.exams e ON e.id = c.exam_id
  WHERE c.id = a.candidate_id;

  SELECT json_build_object(
    'exam', (
      SELECT json_build_object(
        'title', e.title, 'description', e.description,
        'instructions', e.instructions, 'duration_minutes', e.duration_minutes)
      FROM public.exams e WHERE e.id = a.exam_id
    ),
    'candidateName', v_candidate_name,
    'candidateUsername', v_candidate_username,
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
    'started', a.exam_started_at IS NOT NULL,
    'secondsRemaining', CASE
      WHEN a.exam_started_at IS NULL THEN coalesce(v_duration, 60) * 60
      ELSE greatest(0, floor(extract(epoch FROM (a.expires_at - now()))))
    END,
    'status', a.status,
    'submittedAt', a.submitted_at
  ) INTO v_result;

  RETURN v_result;
END;
$function$;