-- GearVox: 類似度バッチ（service_role）用テーブル権限
-- service_role は RLS をバイパスするが、PostgreSQL の GRANT が必要

BEGIN;

GRANT SELECT ON public.user_contexts TO service_role;
GRANT SELECT ON public.context_answers TO service_role;
GRANT SELECT, INSERT, DELETE, UPDATE ON public.user_similarities TO service_role;

COMMIT;
