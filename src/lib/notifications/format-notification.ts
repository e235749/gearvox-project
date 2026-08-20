import type { NotificationListItem } from "@/lib/notifications/types";
import type { NotificationType } from "@/types/database";

export function getNotificationActionText(type: NotificationType): string {
  switch (type) {
    case "like":
      return "があなたのレビューにいいねしました";
    case "comment":
      return "があなたのレビューにコメントしました";
    case "follow":
      return "があなたをフォローしました";
    default:
      return "から通知があります";
  }
}

export function getNotificationMessage(notification: NotificationListItem): string {
  return `${notification.actor.displayName}${getNotificationActionText(notification.type)}`;
}

export function getNotificationHref(notification: NotificationListItem): string {
  if (notification.type === "follow") {
    return `/users/${notification.actor.id}`;
  }

  if (notification.reviewId) {
    return `/reviews/${notification.reviewId}`;
  }

  return "/notifications";
}
