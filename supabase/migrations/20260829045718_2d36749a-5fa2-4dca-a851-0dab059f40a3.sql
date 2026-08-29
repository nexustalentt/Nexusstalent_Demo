ALTER TABLE public.exam_questions ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE public.exam_answers ADD COLUMN IF NOT EXISTS marked_for_review boolean NOT NULL DEFAULT false;