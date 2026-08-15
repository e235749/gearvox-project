import type { NotificationType } from "@/types/database";

export type NotificationListItem = {
  id: string;
  type: NotificationType;
  reviewId: string | null;
  isRead: boolean;
  createdAt: string;
  actor: {
    id: string;
    displayName: string;
  };
};

export type NotificationActionResult = {
  success: boolean;
  error?: string;
};
