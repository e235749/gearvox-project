-- ユーザーによるギア新規登録（pending）と管理者承認フロー

BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

ALTER TABLE public.gears
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved'
    CHECK (status IN ('approved', 'pending', 'merged', 'rejected'));

ALTER TABLE public.gears
  ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES public.users (id) ON DELETE SET NULL;

ALTER TABLE public.gears
  ADD COLUMN IF NOT EXISTS canonical_gear_id uuid REFERENCES public.gears (id) ON DELETE SET NULL;

ALTER TABLE public.gears
  ADD COLUMN IF NOT EXISTS submitted_name text;

UPDATE public.gears
SET status = 'approved'
WHERE status IS NULL;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT u.is_admin FROM public.users u WHERE u.id = (SELECT auth.uid())),
    false
  );
$$;

DROP POLICY IF EXISTS "gears_select" ON public.gears;

CREATE POLICY "gears_select"
  ON public.gears FOR SELECT
  TO authenticated
  USING (
    status IN ('approved', 'pending')
    OR public.is_admin()
  );

CREATE POLICY "gears_insert_pending"
  ON public.gears FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'pending'
    AND submitted_by = (SELECT auth.uid())
    AND submitted_name IS NOT NULL
    AND canonical_gear_id IS NULL
  );

CREATE POLICY "gears_insert_admin"
  ON public.gears FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "gears_update_admin"
  ON public.gears FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT INSERT, UPDATE ON public.gears TO authenticated;

COMMIT;
