-- プロフィール非公開はプロフィール内容のみに限定し、
-- レビュー・コメントの著者表示は維持する。
-- キャンプスタイルアンケートは別途 is_context_public で制御する。

BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_context_public boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "users_select_public_or_own" ON public.users;

CREATE POLICY "users_select_visible"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    is_banned = false
    AND NOT public.is_blocked((SELECT auth.uid()), id)
  );

DROP POLICY IF EXISTS "user_contexts_select" ON public.user_contexts;

CREATE POLICY "user_contexts_select"
  ON public.user_contexts FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = user_contexts.user_id
        AND u.is_context_public = true
        AND u.is_banned = false
        AND NOT public.is_blocked((SELECT auth.uid()), u.id)
    )
  );

DROP POLICY IF EXISTS "context_answers_select" ON public.context_answers;

CREATE POLICY "context_answers_select"
  ON public.context_answers FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = context_answers.user_id
        AND u.is_context_public = true
        AND u.is_banned = false
        AND NOT public.is_blocked((SELECT auth.uid()), u.id)
    )
  );

COMMIT;
