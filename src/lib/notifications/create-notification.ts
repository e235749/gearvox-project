import { createClient } from "@/lib/supabase/server";
import type { NotificationType } from "@/types/database";
import type { Database } from "@/types/database";

type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];

interface CreateNotificationInput {
  recipientUserId: string;
  actorId: string;
  type: NotificationType;
  reviewId?: string | null;
}

async function shouldNotifyUser(
  actorId: string,
  recipientId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "should_notify_user",
    {
      actor_id: actorId,
      recipient_id: recipientId,
    } as never,
  );

  if (error) {
    console.error("[shouldNotifyUser]", error.message);
    return false;
  }

  return Boolean(data);
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<void> {
  const shouldNotify = await shouldNotifyUser(
    input.actorId,
    input.recipientUserId,
  );

  if (!shouldNotify) {
    return;
  }

  const supabase = await createClient();
  const payload: NotificationInsert = {
    user_id: input.recipientUserId,
    actor_id: input.actorId,
    type: input.type,
    review_id: input.reviewId ?? null,
  };

  const { error } = await supabase.from("notifications").insert(payload as never);

  if (error) {
    console.error("[createNotification]", error.message);
  }
}
