-- コンテキストアンケート v2（研究用アンケート内容に合わせて再設計）

BEGIN;

DELETE FROM public.context_answers;
DELETE FROM public.user_contexts;

ALTER TABLE public.user_contexts
  DROP COLUMN IF EXISTS cat1_companion,
  DROP COLUMN IF EXISTS cat4_transport;

ALTER TABLE public.user_contexts
  ADD COLUMN IF NOT EXISTS experience_years text,
  ADD COLUMN IF NOT EXISTS annual_frequency text,
  ADD COLUMN IF NOT EXISTS transport text,
  ADD COLUMN IF NOT EXISTS transport_other text,
  ADD COLUMN IF NOT EXISTS primary_season text,
  ADD COLUMN IF NOT EXISTS stay_duration text,
  ADD COLUMN IF NOT EXISTS primary_purpose text,
  ADD COLUMN IF NOT EXISTS primary_purpose_other text;

ALTER TABLE public.context_answers
  DROP CONSTRAINT IF EXISTS context_answers_category_check;

ALTER TABLE public.context_answers
  ADD CONSTRAINT context_answers_category_check
  CHECK (category IN ('companions', 'gear_tags'));

COMMIT;
