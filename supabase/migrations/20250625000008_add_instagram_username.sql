-- users に Instagram アカウント名を追加

BEGIN;

ALTER TABLE public.users
  ADD COLUMN instagram_username text;

COMMENT ON COLUMN public.users.instagram_username IS
  'Instagram のアカウント名（@ なし）。任意項目。';

COMMIT;
