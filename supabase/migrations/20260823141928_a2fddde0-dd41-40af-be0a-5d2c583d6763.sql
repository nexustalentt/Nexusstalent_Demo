CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  duration_minutes integer NOT NULL DEFAULT 30,
  passing_percentage numeric NOT NULL DEFAULT 60,
  instructions text,
  status text NOT NULL DEFAULT 'draft',
  public_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(9), 'hex'),
  published_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exams_status_check CHECK (status IN ('draft','published','closed')),
  CONSTRAINT exams_duration_check CHECK (duration_minutes > 0 AND duration_minutes <= 600)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exams TO authenticated;
GRANT ALL ON public.exams TO service_role;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage exams" ON public.exams FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

CREATE TABLE public.exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  question_type text NOT NULL,
  prompt text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_options jsonb NOT NULL DEFAULT '[]'::jsonb,
  expected_answer text,
  marks numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exam_questions_type_check CHECK (question_type IN ('multiple_choice','multiple_select','true_false','short_answer','long_answer')),
  CONSTRAINT exam_questions_marks_check CHECK (marks >= 0)
);
CREATE INDEX exam_questions_exam_idx ON public.exam_questions(exam_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_questions TO authenticated;
GRANT ALL ON public.exam_questions TO service_role;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage exam questions" ON public.exam_questions FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

CREATE TABLE public.exam_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  username text NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exam_id, username)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_candidates TO authenticated;
GRANT ALL ON public.exam_candidates TO service_role;
ALTER TABLE public.exam_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage exam candidates" ON public.exam_candidates FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

CREATE TABLE public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.exam_candidates(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'in_progress',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  submitted_at timestamptz,
  auto_score numeric NOT NULL DEFAULT 0,
  manual_score numeric NOT NULL DEFAULT 0,
  total_score numeric NOT NULL DEFAULT 0,
  total_marks numeric NOT NULL DEFAULT 0,
  percentage numeric,
  passed boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exam_attempts_status_check CHECK (status IN ('in_progress','submitted','pending_review','evaluated'))
);
CREATE INDEX exam_attempts_exam_idx ON public.exam_attempts(exam_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_attempts TO authenticated;
GRANT ALL ON public.exam_attempts TO service_role;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage exam attempts" ON public.exam_attempts FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

CREATE TABLE public.exam_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.exam_questions(id) ON DELETE CASCADE,
  answer jsonb,
  awarded_marks numeric,
  feedback text,
  graded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, question_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_answers TO authenticated;
GRANT ALL ON public.exam_answers TO service_role;
ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage exam answers" ON public.exam_answers FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER exam_questions_updated_at BEFORE UPDATE ON public.exam_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER exam_attempts_updated_at BEFORE UPDATE ON public.exam_attempts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER exam_answers_updated_at BEFORE UPDATE ON public.exam_answers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();