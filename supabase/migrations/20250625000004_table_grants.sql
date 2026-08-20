-- GearVox: テーブル権限（GRANT）
-- RLS と併用するテーブルレベルの SELECT / INSERT 等を付与

BEGIN;

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, UPDATE ON public.users TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.user_contexts TO authenticated;

GRANT SELECT, INSERT, DELETE ON public.context_answers TO authenticated;

GRANT SELECT ON public.gear_categories TO authenticated;
GRANT SELECT ON public.gears TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.reviews TO authenticated;

GRANT SELECT, INSERT, DELETE ON public.review_images TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.comments TO authenticated;

GRANT SELECT, INSERT, DELETE ON public.likes TO authenticated;

GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;

GRANT SELECT, UPDATE, INSERT ON public.notifications TO authenticated;

GRANT INSERT ON public.reports TO authenticated;

GRANT SELECT, INSERT, DELETE ON public.blocks TO authenticated;

GRANT SELECT ON public.user_similarities TO authenticated;

GRANT SELECT ON public.gear_categories TO anon;
GRANT SELECT ON public.gears TO anon;

COMMIT;
