-- is_blocked を通知スキップ判定などでアプリから呼び出せるようにする

BEGIN;

CREATE OR REPLACE FUNCTION public.should_notify_user(
  actor_id uuid,
  recipient_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    actor_id IS NOT NULL
    AND recipient_id IS NOT NULL
    AND actor_id <> recipient_id
    AND NOT public.is_blocked(actor_id, recipient_id);
$$;

GRANT EXECUTE ON FUNCTION public.is_blocked(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.should_notify_user(uuid, uuid) TO authenticated;

COMMIT;
