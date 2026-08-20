# GearVox

キャンパー向けSNS型レビューアプリ（卒業研究プロジェクト）

## 技術スタック

- **フロントエンド**: Next.js 16（App Router）/ TypeScript / Tailwind CSS v4
- **認証・DB・Storage**: Supabase
- **状態管理**: Zustand（コンテキストアンケート）
- **アイコン**: Tabler Icons
- **デプロイ**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数

`.env.local.example` をコピーして `.env.local` を作成し、Supabase プロジェクトの値を設定します。

```bash
cp .env.local.example .env.local
```

| 変数 | 説明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | アプリの公開 URL（OAuth リダイレクト用。本番は Vercel の URL） |
| `SUPABASE_SERVICE_ROLE_KEY` | 類似度バッチ用（service_role secret） |
| `CRON_SECRET` | 夜間 cron API 認証用 |

本番デプロイ・QA の詳細は [docs/phase1-production-qa.md](docs/phase1-production-qa.md) を参照。

### 3. Supabase Auth 設定

Supabase ダッシュボードで以下を設定してください。

1. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000`（本番は Vercel の URL）
   - Redirect URLs: `http://localhost:3000/auth/callback`（本番 URL も追加）

2. **Authentication → Providers**
   - Google / Apple を有効化（各プロバイダーの Client ID 等を設定）
   - Email プロバイダーを有効化

3. **Authentication → Settings**
   - 「同一メールアドレスのアカウント自動統合（Automatic linking）」を有効化

### 4. Supabase マイグレーション

Supabase CLI でローカル開発する場合:

```bash
npx supabase start
npx supabase db reset
```

リモートプロジェクトへ適用する場合:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

マイグレーションファイルは `supabase/migrations/` にあります。

### 5. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 で確認できます。

## プロジェクト構成

```
src/
├── app/
│   ├── (auth)/          # ログイン・会員登録（ボトムナビなし）
│   ├── (main)/          # メイン画面（ボトムナビあり）
│   └── layout.tsx
├── components/          # UIコンポーネント（今後追加）
├── constants/           # コンテキストアンケート選択肢など
├── hooks/               # カスタムフック（今後追加）
├── lib/
│   ├── auth/            # 認証ロジック（Server Actions・OAuth）
│   ├── context/         # コンテキスト回答のビジネスロジック
│   └── supabase/        # Supabaseクライアント（UIから分離）
├── stores/              # Zustandストア
└── types/               # TypeScript型定義
```

## 実装状況

| ステップ | 内容 | 状態 |
|---|---|---|
| 1 | Supabase テーブル・RLS・Storage | ✅ マイグレーション作成済み |
| 2 | Next.js プロジェクト構成 | ✅ 完了 |
| 3 | 認証（Google/Apple/メール） | ✅ 完了 |
| 4 | コア画面・SNS・レビュー | ✅ MVP 実装済み |
| 5 | コンテキストアンケート・類似度 | ✅ 実装済み |
| 6 | 本番デプロイ・QA | 🔄 進行中（[Phase 1 手順書](docs/phase1-production-qa.md)） |

## デザイン方針

- 背景: `#1a1a18`
- アクセント: `#c8a96e`
- ボトムタブ: ホーム / 検索 / 投稿（FAB）/ 通知 / マイページ

## 開発ルール

- TypeScript の `any` 禁止
- Supabase ロジックは `src/lib/supabase/` に集約（UIコンポーネントへ直書きしない）
- 関数は単一責任・30行超えたら分割を検討
- 外部入力は必ずバリデーションまたは Null チェック
