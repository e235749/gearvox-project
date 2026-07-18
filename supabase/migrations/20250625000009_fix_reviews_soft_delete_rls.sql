-- reviews のソフト削除を許可する RLS 修正
-- UPDATE 後の RETURNING / SELECT でも削除済み行を所有者が読めるようにする

BEGIN;

DROP POLICY IF EXISTS "reviews_select" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;

CREATE POLICY "reviews_select"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (
      is_deleted = false
      AND EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = reviews.user_id
          AND u.is_banned = false
          AND NOT public.is_blocked((SELECT auth.uid()), u.id)
      )
    )
  );

CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    AND is_deleted = false
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
  );

COMMIT;
