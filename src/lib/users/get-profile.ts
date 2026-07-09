import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/database";

export type UserProfile = Pick<
  User,
  "display_name" | "email" | "avatar_url" | "bio" | "location"
>;

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("display_name, email, avatar_url, bio, location")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as UserProfile;
}
