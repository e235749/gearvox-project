import { redirect } from "next/navigation";

import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/users/get-profile";

export const dynamic = "force-dynamic";

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile/edit");
  }

  const profile = await getUserProfile(user.id);

  if (!profile) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          プロフィール編集
        </h1>
        <p className="text-sm text-muted">
          プロフィールの取得に失敗しました。時間をおいて再度お試しください。
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm text-muted">マイページ</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          プロフィール編集
        </h1>
      </header>
      <ProfileEditForm profile={profile} />
    </section>
  );
}
