CREATE OR REPLACE FUNCTION public.exam_attempt_state(p_session_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  a record;
  v_candidate_name text;
  v_candidate_username text;
  v_result json;
BEGIN
  SELECT id, exam_id, candidate_id, status, expires_at, submitted_at INTO a
  FROM public.exam_attempts WHERE session_token = p_session_token;
  IF a IS NULL THEN
    RAISE EXCEPTION 'Session expired. Please sign in again.';
  END IF;

  IF a.status = 'in_progress' AND a.expires_at <= now() THEN
    PERFORM public.exam_finalize_attempt(a.id);
    SELECT id, exam_id, candidate_id, status, expires_at, submitted_at INTO a
    FROM public.exam_attempts WHERE id = a.id;
  END IF;

  SELECT coalesce(c.full_name, c.username), c.username
  INTO v_candidate_name, v_candidate_username
  FROM public.exam_candidates c WHERE c.id = a.candidate_id;

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
    'secondsRemaining', greatest(0, floor(extract(epoch FROM (a.expires_at - now())))),
    'status', a.status,
    'submittedAt', a.submitted_at
  ) INTO v_result;

  RETURN v_result;
END;
$$;
REVOKE ALL ON FUNCTION public.exam_attempt_state(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.exam_attempt_state(text) TO anon, authenticated, service_role;