-- users テーブルへの INSERT 権限を付与
-- ensureUserProfile / 新規登録時のプロフィール作成に必要

BEGIN;

GRANT INSERT ON public.users TO authenticated;

COMMIT;
