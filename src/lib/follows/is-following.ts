import { createClient } from "@/lib/supabase/server";

export async function listFollowingIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  if (error) {
    console.error("listFollowingIds:", error.message);
    return [];
  }

  return ((data ?? []) as Array<{ following_id: string }>).map(
    (row) => row.following_id,
  );
}

export async function isFollowing(
  followerId: string,
  followingId: string,
): Promise<boolean> {
  if (followerId === followingId) {
    return false;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();

  if (error) {
    console.error("isFollowing:", error.message);
    return false;
  }

  return data !== null;
}
