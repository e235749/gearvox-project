import { createClient } from "@/lib/supabase/server";

import type { NotificationListItem } from "@/lib/notifications/types";

type NotificationRow = {
  id: string;
  type: NotificationListItem["type"];
  review_id: string | null;
  is_read: boolean;
  created_at: string;
  actor_id: string;
  users: { id: string; display_name: string } | null;
};

export async function listNotifications(
  userId: string,
  limit = 50,
): Promise<NotificationListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(
      "id, type, review_id, is_read, created_at, actor_id, users!notifications_actor_id_fkey(id, display_name)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("listNotifications:", error.message);
    return [];
  }

  return ((data ?? []) as NotificationRow[]).map((row) => ({
    id: row.id,
    type: row.type,
    reviewId: row.review_id,
    isRead: row.is_read,
    createdAt: row.created_at,
    actor: {
      id: row.users?.id ?? row.actor_id,
      displayName: row.users?.display_name ?? "ユーザー",
    },
  }));
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("getUnreadNotificationCount:", error.message);
    return 0;
  }

  return count ?? 0;
}
