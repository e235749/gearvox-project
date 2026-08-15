import { redirect } from "next/navigation";

import { NotificationsPanel } from "@/components/notifications/notifications-panel";
import {
  listNotifications,
} from "@/lib/notifications/list-notifications";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const notifications = await listNotifications(user.id);

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm text-muted">お知らせ</p>
        <h1 className="text-2xl font-semibold tracking-tight">通知</h1>
      </header>

      <NotificationsPanel notifications={notifications} />
    </section>
  );
}
