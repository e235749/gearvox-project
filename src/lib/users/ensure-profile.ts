import { createClient } from "@/lib/supabase/server";
import type { AuthProvider } from "@/types/database";

interface AuthUserLike {
  id: string;
  email?: string;
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
}

function resolveDisplayName(authUser: AuthUserLike): string {
  const fullName = authUser.user_metadata.full_name;
  const name = authUser.user_metadata.name;

  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim();
  }
  if (typeof name === "string" && name.trim()) {
    return name.trim();
  }
  if (authUser.email) {
    return authUser.email.split("@")[0];
  }
  return "ユーザー";
}

function resolveProvider(authUser: AuthUserLike): AuthProvider {
  const provider = authUser.app_metadata.provider;
  if (provider === "google" || provider === "apple" || provider === "email") {
    return provider;
  }
  return "email";
}

export async function ensureUserProfile(
  authUser: AuthUserLike,
): Promise<string | null> {
  const supabase = await createClient();

  const { data: existing, error: selectError } = await supabase
    .from("users")
    .select("id")
    .eq("id", authUser.id)
    .maybeSingle();

  if (selectError) {
    return `プロフィール確認に失敗しました: ${selectError.message}`;
  }

  if (existing) {
    return null;
  }

  if (!authUser.email) {
    return "メールアドレスが取得できないためプロフィールを作成できません。";
  }

  const avatarUrl = authUser.user_metadata.avatar_url;
  const { error: insertError } = await supabase.from("users").insert({
    id: authUser.id,
    email: authUser.email,
    display_name: resolveDisplayName(authUser),
    avatar_url: typeof avatarUrl === "string" ? avatarUrl : null,
    provider: resolveProvider(authUser),
  } as never);

  if (insertError) {
    return insertError.message;
  }

  return null;
}
