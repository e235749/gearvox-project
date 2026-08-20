-- 通報者が自分の通報履歴を参照できる（重複チェック用）

BEGIN;

CREATE POLICY "reports_select_own"
  ON public.reports FOR SELECT
  TO authenticated
  USING (reporter_id = (SELECT auth.uid()));

GRANT SELECT ON public.reports TO authenticated;

COMMIT;
