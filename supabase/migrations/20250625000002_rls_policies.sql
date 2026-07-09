-- GearVox: Row Level Security ポリシー

BEGIN;

-- ---------------------------------------------------------------------------
-- RLS 有効化
-- ---------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gear_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gears ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_similarities ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- ヘルパー: ブロック関係の判定
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_blocked(viewer_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.blocks
    WHERE (blocker_id = viewer_id AND blocked_id = target_user_id)
       OR (blocker_id = target_user_id AND blocked_id = viewer_id)
  );
$$;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------

CREATE POLICY "users_select_public_or_own"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    is_banned = false
    AND (
      is_public = true
      OR id = (SELECT auth.uid())
    )
    AND NOT public.is_blocked((SELECT auth.uid()), id)
  );

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "users_insert_trigger"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (
    id = (SELECT auth.uid())
    OR (SELECT auth.uid()) IS NULL
  );

-- ---------------------------------------------------------------------------
-- user_contexts
-- ---------------------------------------------------------------------------

CREATE POLICY "user_contexts_select"
  ON public.user_contexts FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = user_contexts.user_id
        AND u.is_public = true
        AND u.is_banned = false
        AND NOT public.is_blocked((SELECT auth.uid()), u.id)
    )
  );

CREATE POLICY "user_contexts_insert_own"
  ON public.user_contexts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "user_contexts_update_own"
  ON public.user_contexts FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- context_answers
-- ---------------------------------------------------------------------------

CREATE POLICY "context_answers_select"
  ON public.context_answers FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = context_answers.user_id
        AND u.is_public = true
        AND u.is_banned = false
        AND NOT public.is_blocked((SELECT auth.uid()), u.id)
    )
  );

CREATE POLICY "context_answers_insert_own"
  ON public.context_answers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "context_answers_delete_own"
  ON public.context_answers FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- gear_categories / gears（読み取りのみ。登録は管理画面経由）
-- ---------------------------------------------------------------------------

CREATE POLICY "gear_categories_select"
  ON public.gear_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "gears_select"
  ON public.gears FOR SELECT
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------

CREATE POLICY "reviews_select"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (
    is_deleted = false
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = reviews.user_id
        AND u.is_banned = false
        AND NOT public.is_blocked((SELECT auth.uid()), u.id)
    )
  );

CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- review_images
-- ---------------------------------------------------------------------------

CREATE POLICY "review_images_select"
  ON public.review_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.id = review_images.review_id
        AND r.is_deleted = false
    )
  );

CREATE POLICY "review_images_insert_own"
  ON public.review_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.id = review_images.review_id
        AND r.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "review_images_delete_own"
  ON public.review_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.id = review_images.review_id
        AND r.user_id = (SELECT auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------

CREATE POLICY "comments_select"
  ON public.comments FOR SELECT
  TO authenticated
  USING (
    is_deleted = false
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = comments.user_id
        AND u.is_banned = false
        AND NOT public.is_blocked((SELECT auth.uid()), u.id)
    )
  );

CREATE POLICY "comments_insert_own"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "comments_update_own"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- likes
-- ---------------------------------------------------------------------------

CREATE POLICY "likes_select"
  ON public.likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "likes_insert_own"
  ON public.likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "likes_delete_own"
  ON public.likes FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- follows
-- ---------------------------------------------------------------------------

CREATE POLICY "follows_select"
  ON public.follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "follows_insert_own"
  ON public.follows FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = (SELECT auth.uid()));

CREATE POLICY "follows_delete_own"
  ON public.follows FOR DELETE
  TO authenticated
  USING (follower_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------

CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "notifications_insert_authenticated"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------

CREATE POLICY "reports_insert_own"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- blocks
-- ---------------------------------------------------------------------------

CREATE POLICY "blocks_select_own"
  ON public.blocks FOR SELECT
  TO authenticated
  USING (blocker_id = (SELECT auth.uid()));

CREATE POLICY "blocks_insert_own"
  ON public.blocks FOR INSERT
  TO authenticated
  WITH CHECK (blocker_id = (SELECT auth.uid()));

CREATE POLICY "blocks_delete_own"
  ON public.blocks FOR DELETE
  TO authenticated
  USING (blocker_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- user_similarities
-- ---------------------------------------------------------------------------

CREATE POLICY "user_similarities_select_involved"
  ON public.user_similarities FOR SELECT
  TO authenticated
  USING (
    user_a_id = (SELECT auth.uid())
    OR user_b_id = (SELECT auth.uid())
  );

COMMIT;
