"use server";

import { revalidatePath } from "next/cache";

import type { NotificationActionResult } from "@/lib/notifications/types";
import { createClient } from "@/lib/supabase/server";

function revalidateNotificationPaths(): void {
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}

export async function markNotificationRead(
  notificationId: string,
): Promise<NotificationActionResult> {
  if (!notificationId) {
    return { success: false, error: "通知が指定されていません。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "ログインが必要です。" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true } as never)
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[markNotificationRead]", error.message);
    return { success: false, error: "既読の更新に失敗しました。" };
  }

  revalidateNotificationPaths();
  return { success: true };
}

export async function markAllNotificationsRead(): Promise<NotificationActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "ログインが必要です。" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true } as never)
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("[markAllNotificationsRead]", error.message);
    return { success: false, error: "既読の更新に失敗しました。" };
  }

  revalidateNotificationPaths();
  return { success: true };
}
