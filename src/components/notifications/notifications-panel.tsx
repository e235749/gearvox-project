"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/actions";
import {
  getNotificationActionText,
  getNotificationHref,
} from "@/lib/notifications/format-notification";
import { formatReviewDate } from "@/lib/reviews/format-review-label";
import type { NotificationListItem } from "@/lib/notifications/types";

interface NotificationsPanelProps {
  notifications: NotificationListItem[];
}

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  const router = useRouter();
  const [items, setItems] = useState(notifications);
  const [error, setError] = useState<string | null>(null);
  const [isPendingAll, setIsPendingAll] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const unreadCount = items.filter((item) => !item.isRead).length;

  async function handleMarkAllRead() {
    setError(null);
    setIsPendingAll(true);

    try {
      const result = await markAllNotificationsRead();

      if (!result.success) {
        setError(result.error ?? "既読の更新に失敗しました。");
        return;
      }

      setItems((current) =>
        current.map((item) => ({ ...item, isRead: true })),
      );
      router.refresh();
    } finally {
      setIsPendingAll(false);
    }
  }

  async function handleOpenNotification(notification: NotificationListItem) {
    setError(null);

    if (!notification.isRead) {
      setPendingId(notification.id);
      const result = await markNotificationRead(notification.id);
      setPendingId(null);

      if (!result.success) {
        setError(result.error ?? "既読の更新に失敗しました。");
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item,
        ),
      );
    }

    router.push(getNotificationHref(notification));
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
        通知はまだありません。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">未読 {unreadCount} 件</p>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isPendingAll}
            className="text-sm text-accent transition-opacity hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPendingAll ? "更新中..." : "すべて既読にする"}
          </button>
        </div>
      ) : null}

      <ul className="space-y-3">
        {items.map((notification) => (
          <li key={notification.id}>
            <button
              type="button"
              onClick={() => handleOpenNotification(notification)}
              disabled={pendingId === notification.id}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                notification.isRead
                  ? "border-border bg-surface text-muted"
                  : "border-accent/30 bg-accent/5 text-foreground"
              }`}
            >
              <p className="leading-relaxed">
                <Link
                  href={`/users/${notification.actor.id}`}
                  onClick={(event) => event.stopPropagation()}
                  className="font-medium transition-colors hover:text-accent"
                >
                  {notification.actor.displayName}
                </Link>
                {getNotificationActionText(notification.type)}
              </p>
              <p className="mt-1 text-xs text-muted">
                {formatReviewDate(notification.createdAt)}
              </p>
            </button>
          </li>
        ))}
      </ul>

      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
