import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
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
      <header>
        <p className="text-sm text-muted">マイページ</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {profile?.display_name ?? "プロフィール"}
        </h1>
      </header>

      <dl className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
        <div>
          <dt className="text-muted">メールアドレス</dt>
          <dd>{profile?.email ?? user?.email ?? "—"}</dd>
        </div>
        {profile?.location ? (
          <div>
            <dt className="text-muted">居住地</dt>
            <dd>{profile.location}</dd>
          </div>
        ) : null}
        {profile?.bio ? (
          <div>
            <dt className="text-muted">自己紹介</dt>
            <dd>{profile.bio}</dd>
          </div>
        ) : null}
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
