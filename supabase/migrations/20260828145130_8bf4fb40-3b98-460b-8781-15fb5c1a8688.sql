ALTER TABLE public.exam_candidates
  ADD COLUMN IF NOT EXISTS access_start_at timestamptz,
  ADD COLUMN IF NOT EXISTS access_end_at timestamptz,
  ADD COLUMN IF NOT EXISTS duration_minutes integer,
  ADD COLUMN IF NOT EXISTS access_enabled boolean NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS exam_candidates_username_unique
  ON public.exam_candidates (lower(username));

CREATE UNIQUE INDEX IF NOT EXISTS exam_attempts_exam_candidate_unique
  ON public.exam_attempts (exam_id, candidate_id);