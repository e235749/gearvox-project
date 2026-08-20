import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/database";

type PublicProfileFields =
  | "id"
  | "display_name"
  | "avatar_url"
  | "bio"
  | "location"
  | "instagram_username"
  | "is_public"
  | "is_context_public";

export type PublicUserProfile = Pick<User, PublicProfileFields>;

export type LimitedPublicUserProfile = Pick<
  User,
  "id" | "display_name" | "is_public"
> & {
  isProfilePrivate: true;
};

export type VisibleUserProfile = PublicUserProfile | LimitedPublicUserProfile;

export function isProfilePrivate(
  profile: VisibleUserProfile,
): profile is LimitedPublicUserProfile {
  return "isProfilePrivate" in profile && profile.isProfilePrivate;
}

export async function getVisibleUserProfile(
  userId: string,
): Promise<VisibleUserProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, display_name, avatar_url, bio, location, instagram_username, is_public, is_context_public",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("getVisibleUserProfile:", error.message);
    }
    return null;
  }

  const profile = data as PublicUserProfile;

  if (profile.is_public === false) {
    return {
      id: profile.id,
      display_name: profile.display_name,
      is_public: false,
      isProfilePrivate: true,
    };
  }

  return profile;
}

/** @deprecated Use getVisibleUserProfile instead */
export async function getPublicProfile(
  userId: string,
): Promise<PublicUserProfile | null> {
  const profile = await getVisibleUserProfile(userId);

  if (!profile || isProfilePrivate(profile)) {
    return profile
      ? {
          id: profile.id,
          display_name: profile.display_name,
          avatar_url: null,
          bio: null,
          location: null,
          instagram_username: null,
          is_public: false,
          is_context_public: false,
        }
      : null;
  }

  return profile;
}
