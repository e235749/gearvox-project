import Link from "next/link";

import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import {
  buildInstagramProfileUrl,
  formatInstagramDisplay,
} from "@/lib/users/format-instagram-username";
import { getUserProfile } from "@/lib/users/get-profile";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await getUserProfile(user.id) : null;

  return (
    <section className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted">マイページ</p>
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-sm text-muted">
                —
              </span>
            )}
            <h1 className="text-2xl font-semibold tracking-tight">
              {profile?.display_name ?? "プロフィール"}
            </h1>
          </div>
        </div>
        <Link
          href="/profile/edit"
          className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          編集
        </Link>
      </header>

      <dl className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
        <div>
          <dt className="text-muted">メールアドレス</dt>
          <dd>{profile?.email ?? user?.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">プロフィール公開</dt>
          <dd>{profile?.is_public === false ? "非公開" : "公開"}</dd>
        </div>
        <div>
          <dt className="text-muted">居住地</dt>
          <dd>{profile?.location ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Instagram</dt>
          <dd>
            {profile?.instagram_username ? (
              <a
                href={buildInstagramProfileUrl(profile.instagram_username)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                {formatInstagramDisplay(profile.instagram_username)}
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-muted">自己紹介</dt>
          <dd className="whitespace-pre-wrap">{profile?.bio ?? "—"}</dd>
        </div>
      </dl>

      <form action={signOut}>
        <button
          type="submit"
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-red-500/50 hover:text-red-400"
        >
          ログアウト
        </button>
      </form>
    </section>
  );
}
