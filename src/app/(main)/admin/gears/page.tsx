import { redirect } from "next/navigation";

import { PendingGearsList } from "@/components/admin/pending-gears-list";
import { listGearCategories } from "@/lib/gears/list-gear-categories";
import {
  listApprovedGearsForMerge,
  listPendingGears,
} from "@/lib/gears/list-pending-gears";
import { isUserAdmin } from "@/lib/users/is-admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminGearsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = await isUserAdmin(user.id);
  if (!isAdmin) {
    redirect("/");
  }

  const [pendingGears, categories, approvedGears] = await Promise.all([
    listPendingGears(),
    listGearCategories(),
    listApprovedGearsForMerge(),
  ]);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted">管理者</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          ギア承認キュー
        </h1>
        <p className="text-sm text-muted">
          ユーザーが登録したギアを正式名称に整えて承認するか、既存ギアへマージしてください。
        </p>
      </header>

      <PendingGearsList
        pendingGears={pendingGears}
        categories={categories}
        approvedGears={approvedGears}
      />
    </section>
  );
}
