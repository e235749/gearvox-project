import { createClient } from "@/lib/supabase/server";

import type { BlockedUserItem } from "@/lib/blocks/types";

export async function isBlockedByViewer(
  viewerId: string,
  targetUserId: string,
): Promise<boolean> {
  if (viewerId === targetUserId) {
    return false;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blocks")
    .select("id")
    .eq("blocker_id", viewerId)
    .eq("blocked_id", targetUserId)
    .maybeSingle();

  if (error) {
    console.error("isBlockedByViewer:", error.message);
    return false;
  }

  return data !== null;
}

export async function listBlockedUsers(): Promise<BlockedUserItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_my_blocked_users");

  if (error) {
    console.error("listBlockedUsers:", error.message);
    return [];
  }

  return ((data ?? []) as Array<{
    blocked_id: string;
    display_name: string;
    avatar_url: string | null;
    blocked_at: string;
  }>).map((row) => ({
    blockedId: row.blocked_id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    blockedAt: row.blocked_at,
  }));
}
