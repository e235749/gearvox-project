-- レビュー画像: 10MB上限と HEIC / HEIF 対応

BEGIN;

UPDATE storage.buckets
SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif'
  ]
WHERE id = 'review-images';

COMMIT;
