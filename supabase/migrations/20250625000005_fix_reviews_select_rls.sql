-- reviews SELECT ポリシー修正
-- INSERT ... RETURNING / .select() 時に自分の投稿を読めるようにする

BEGIN;

DROP POLICY IF EXISTS "reviews_select" ON public.reviews;

CREATE POLICY "reviews_select"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (
    is_deleted = false
    AND (
      user_id = (SELECT auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = reviews.user_id
          AND u.is_banned = false
          AND NOT public.is_blocked((SELECT auth.uid()), u.id)
      )
    )
  );

COMMIT;
