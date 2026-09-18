-- GearVox: 公式ギアカテゴリのシード
-- 既存「ランプ」→「ランプ・照明」へリネームし、不足分を追加

BEGIN;

UPDATE public.gear_categories
SET name = 'ランプ・照明'
WHERE name = 'ランプ';

INSERT INTO public.gear_categories (name)
SELECT category_name
FROM (
  VALUES
    ('テント'),
    ('ランプ・照明'),
    ('タープ'),
    ('シュラフ'),
    ('マット'),
    ('チェア'),
    ('テーブル'),
    ('調理器具'),
    ('バーナー'),
    ('コンロ'),
    ('焚き火・BBQ'),
    ('クーラー'),
    ('食器・カトラリー'),
    ('バッグ・収納'),
    ('ウェア'),
    ('キャンプ用電源'),
    ('アウトドア家電'),
    ('ナイフ・工具'),
    ('その他')
) AS seed(category_name)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.gear_categories existing
  WHERE existing.name = seed.category_name
);

COMMIT;
