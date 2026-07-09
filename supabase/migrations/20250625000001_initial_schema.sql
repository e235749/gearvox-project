-- GearVox: 初期スキーマ
-- 引き継ぎ資料セクション6に基づくテーブル定義

BEGIN;

-- ---------------------------------------------------------------------------
-- 共通ユーティリティ
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  bio text,
  location text,
  provider text NOT NULL CHECK (provider IN ('google', 'apple', 'email')),
  is_public boolean NOT NULL DEFAULT true,
  is_banned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  provider_name text;
  display_name_value text;
BEGIN
  provider_name := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');

  display_name_value := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.users (id, email, display_name, avatar_url, provider)
  VALUES (
    NEW.id,
    NEW.email,
    display_name_value,
    NEW.raw_user_meta_data->>'avatar_url',
    provider_name
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- user_contexts（単一選択カテゴリ）
-- ---------------------------------------------------------------------------

CREATE TABLE public.user_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users (id) ON DELETE CASCADE,
  cat1_companion text,
  cat4_transport text,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER user_contexts_updated_at
  BEFORE UPDATE ON public.user_contexts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- context_answers（複数選択カテゴリ・1行1レコード）
-- ---------------------------------------------------------------------------

CREATE TABLE public.context_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  category text NOT NULL CHECK (
    category IN ('cat2_style', 'cat3_season', 'cat5_activity', 'cat6_space')
  ),
  answer_value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category, answer_value)
);

CREATE INDEX idx_context_answers_user_id ON public.context_answers (user_id);
CREATE INDEX idx_context_answers_category ON public.context_answers (category);

-- ---------------------------------------------------------------------------
-- gear_categories / gears
-- ---------------------------------------------------------------------------

CREATE TABLE public.gear_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES public.gear_categories (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.gears (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  category_id uuid REFERENCES public.gear_categories (id) ON DELETE SET NULL,
  description text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER gears_updated_at
  BEFORE UPDATE ON public.gears
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_gears_name ON public.gears USING gin (to_tsvector('simple', name));
CREATE INDEX idx_gears_brand ON public.gears (brand);
CREATE INDEX idx_gears_category_id ON public.gears (category_id);

-- ---------------------------------------------------------------------------
-- reviews / review_images
-- ---------------------------------------------------------------------------

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  gear_id uuid NOT NULL REFERENCES public.gears (id) ON DELETE RESTRICT,
  title text,
  body text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  context_snapshot jsonb,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_reviews_user_id ON public.reviews (user_id);
CREATE INDEX idx_reviews_gear_id ON public.reviews (gear_id);
CREATE INDEX idx_reviews_created_at ON public.reviews (created_at DESC);

CREATE TABLE public.review_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews (id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_review_images_review_id ON public.review_images (review_id);

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------

CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  body text NOT NULL,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_review_id ON public.comments (review_id);
CREATE INDEX idx_comments_user_id ON public.comments (user_id);

-- ---------------------------------------------------------------------------
-- likes / follows
-- ---------------------------------------------------------------------------

CREATE TABLE public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (review_id, user_id)
);

CREATE INDEX idx_likes_review_id ON public.likes (review_id);
CREATE INDEX idx_likes_user_id ON public.likes (user_id);

CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX idx_follows_follower_id ON public.follows (follower_id);
CREATE INDEX idx_follows_following_id ON public.follows (following_id);

-- ---------------------------------------------------------------------------
-- notifications / reports / blocks
-- ---------------------------------------------------------------------------

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('like', 'comment', 'follow')),
  actor_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  review_id uuid REFERENCES public.reviews (id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications (created_at DESC);

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('review', 'comment', 'user')),
  target_id uuid NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status ON public.reports (status);

CREATE TABLE public.blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE INDEX idx_blocks_blocker_id ON public.blocks (blocker_id);

-- ---------------------------------------------------------------------------
-- user_similarities（バッチ処理で定期更新）
-- ---------------------------------------------------------------------------

CREATE TABLE public.user_similarities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  user_b_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  similarity_score double precision NOT NULL CHECK (
    similarity_score >= 0.0 AND similarity_score <= 1.0
  ),
  calculated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_a_id, user_b_id),
  CHECK (user_a_id <> user_b_id)
);

CREATE INDEX idx_user_similarities_user_a ON public.user_similarities (user_a_id);
CREATE INDEX idx_user_similarities_user_b ON public.user_similarities (user_b_id);
CREATE INDEX idx_user_similarities_score ON public.user_similarities (similarity_score DESC);

COMMIT;
