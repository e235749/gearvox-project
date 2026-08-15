-- ブロック一覧表示用（ブロック済みユーザーの users RLS 回避）

BEGIN;

CREATE OR REPLACE FUNCTION public.list_my_blocked_users()
RETURNS TABLE (
  blocked_id uuid,
  display_name text,
  avatar_url text,
  blocked_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id,
    u.display_name,
    u.avatar_url,
    b.created_at
  FROM public.blocks b
  INNER JOIN public.users u ON u.id = b.blocked_id
  WHERE b.blocker_id = (SELECT auth.uid())
    AND u.is_banned = false
  ORDER BY b.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.list_my_blocked_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_my_blocked_users() TO authenticated;

COMMIT;
