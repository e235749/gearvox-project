# Phase 1：本番環境・QA チェックリスト

GearVox を一般公開 v1 に向けて本番環境を整備し、動作確認するための手順書です。

**前提：** ブランチ `cursor/review-posting-flow` に Phase 1 向け修正を含むこと  
**Supabase プロジェクト ref（リンク済み）：** `fcspkpqnouhikjzobuhs`

---

## 0. 事前確認（ローカル）

- [x] `npm run build` が成功する
- [ ] 未コミット変更を整理して push する（下記「未コミット分」参照）
- [ ] `main` への PR を作成・マージする

### 未コミット分（Phase 1 前にコミット推奨）

| ファイル | 内容 |
|---|---|
| `supabase/migrations/20250625000017_grant_service_role_batch.sql` | 類似度バッチ用 GRANT |
| `src/lib/supabase/admin.ts` | Service Role Key 検証 |
| `scripts/recalculate-similarities.ts` | バッチ env 読み込み改善 |
| `package.json` | `tsx` / `report:pdf` / `similarity:batch` |
| `src/lib/auth/constants.ts` 等 | cron API のミドルウェア除外 |

---

## 1. Supabase マイグレーション（本番 DB）

リモートプロジェクトへ未適用のマイグレーションを反映します。

```bash
cd /Users/kanekuren/GearVox
npm run db:push
```

**00010 以降が未適用の場合、以下が追加されます：**

- ギアユーザー申請・管理者承認
- コンテキストアンケート v2
- プロフィールプライバシー修正
- アバター Storage
- レビュー画像 HEIC / 10MB
- 通報 SELECT ポリシー
- ブロック一覧 RPC
- 通知用 `should_notify_user` RPC
- **service_role 向けバッチ GRANT（00017）**

### 適用後の確認（Supabase SQL Editor）

```sql
-- マイグレーション適用済みか（例）
SELECT version FROM supabase_migrations.schema_migrations
ORDER BY version DESC LIMIT 5;
```

---

## 2. 管理者アカウント設定

Supabase SQL Editor で実行（メールアドレスを自分のものに変更）：

```sql
UPDATE public.users
SET is_admin = true
WHERE email = 'your-email@example.com';
```

確認：`/admin/gears` にアクセスできること。

---

## 3. Vercel デプロイ

### 3.1 プロジェクト作成

1. [Vercel Dashboard](https://vercel.com) → Import Git Repository
2. リポジトリ `gearvox-project` を選択
3. **Production Branch:** `main`（PR マージ後）
4. Framework Preset: Next.js（自動検出）

### 3.2 環境変数（Production）

| 変数 | 値の取得元 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |
| `NEXT_PUBLIC_SITE_URL` | デプロイ後の Vercel URL（例: `https://gearvox.vercel.app`） |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → **service_role secret** |
| `CRON_SECRET` | 任意の長いランダム文字列（32文字以上推奨） |

> **注意：** `SUPABASE_SERVICE_ROLE_KEY` は **anon key ではない** こと。JWT は `eyJ` で始まる。

### 3.3 デプロイ実行

PR マージ後、Vercel が自動デプロイ。初回デプロイ後：

1. `NEXT_PUBLIC_SITE_URL` を実際の URL に更新
2. **Redeploy**（環境変数変更を反映）

---

## 4. Supabase Auth 設定

Supabase Dashboard → **Authentication → URL Configuration**

| 項目 | 設定値 |
|---|---|
| Site URL | `https://<your-vercel-domain>` |
| Redirect URLs | `https://<your-vercel-domain>/auth/callback` |
| | `http://localhost:3000/auth/callback`（開発用） |

**Providers：** Google / Email を有効化（Apple は iOS 向けに後から可）

**Settings：** Automatic linking（同一メール統合）を有効化

---

## 5. 類似度バッチ（初回実行）

### ローカルから本番 DB へ（`.env.local` が本番を指している場合）

```bash
npm run similarity:batch
```

### 本番 cron API から（デプロイ後）

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" \
  "https://<your-vercel-domain>/api/cron/recalculate-similarities"
```

成功レスポンス例：

```json
{"success":true,"userCount":2,"pairCount":1}
```

**Vercel Cron：** `vercel.json` により毎日 03:00 JST（UTC 18:00）に自動実行。

---

## 6. QA チェックリスト（手動）

各項目を **本番 URL** と **スマホ実機** で確認し、結果を記録してください。

### 6.1 認証

| # | 項目 | OK | メモ |
|---|---|---|---|
| 1 | Google ログイン | ☐ | |
| 2 | メール新規登録 | ☐ | |
| 3 | メールログイン | ☐ | |
| 4 | ログアウト | ☐ | |

### 6.2 プロフィール・アンケート

| # | 項目 | OK | メモ |
|---|---|---|---|
| 5 | プロフィール編集（名前・アバター） | ☐ | |
| 6 | キャンプスタイルアンケート回答 | ☐ | |
| 7 | キャンプスタイル非公開 → バッジ非表示 | ☐ | |
| 8 | 似ているキャンパー（70%+）マイページ表示 | ☐ | バッチ実行後 |

### 6.3 レビュー・ギア

| # | 項目 | OK | メモ |
|---|---|---|---|
| 9 | ギア検索 | ☐ | |
| 10 | レビュー新規投稿（JPEG） | ☐ | |
| 11 | レビュー投稿（HEIC → 変換） | ☐ | iPhone |
| 12 | レビュー編集・削除 | ☐ | |
| 13 | ギア新規申請 → 管理者承認 | ☐ | |

### 6.4 SNS

| # | 項目 | OK | メモ |
|---|---|---|---|
| 14 | フォロー / フォロー解除 | ☐ | |
| 15 | ホーム「新着」タイムライン | ☐ | |
| 16 | ホーム「フォロー中」 | ☐ | |
| 17 | 類似度バッジ（著者名横） | ☐ | |
| 18 | いいね | ☐ | |
| 19 | コメント | ☐ | |
| 20 | 通知一覧・未読バッジ | ☐ | |

### 6.5 セーフティ

| # | 項目 | OK | メモ |
|---|---|---|---|
| 21 | レビュー通報 | ☐ | |
| 22 | コメント通報 | ☐ | |
| 23 | ユーザーブロック → 相互非表示 | ☐ | |
| 24 | ブロック一覧（マイページ） | ☐ | |

### 6.6 運用

| # | 項目 | OK | メモ |
|---|---|---|---|
| 25 | `/admin/gears` 管理者のみアクセス可 | ☐ | |
| 26 | cron API が 401 なしで実行（Bearer 付き） | ☐ | |
| 27 | cron API が未認証で 401 | ☐ | |

---

## 7. トラブルシューティング

| 症状 | 原因 | 対処 |
|---|---|---|
| 類似度バッチ `permission denied` | Service Role Key 誤り / GRANT 未適用 | キー確認 + `db:push`（00017） |
| OAuth リダイレクト失敗 | Redirect URL 未登録 | Supabase Auth URL 設定 |
| cron が 307/302 で失敗 | ミドルウェアがログインへリダイレクト | `INTERNAL_API_PREFIXES` 修正済みか確認 |
| 画像アップロード失敗 | Storage ポリシー / サイズ | 00013 マイグレーション適用確認 |
| RLS エラー | マイグレーション未適用 | `db:push` 再実行 |

---

## 8. Phase 1 完了条件

- [ ] `main` ブランチに全機能がマージされている
- [ ] 本番 Supabase に全マイグレーション適用済み
- [ ] Vercel 本番デプロイ成功
- [ ] 環境変数 5 項目設定済み
- [ ] Supabase Auth URL 設定済み
- [ ] 類似度バッチ初回実行成功
- [ ] QA チェックリスト 主要項目（1〜24）が OK
- [ ] 管理者アカウント設定済み

---

## 次のステップ（Phase 2）

Phase 1 完了後 → UI 磨き込み、利用規約・プライバシーポリシー追加（Phase 2〜3）
