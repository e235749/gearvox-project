import { PendingGearAdminCard } from "@/components/admin/pending-gear-admin-card";
import { listGearCategories } from "@/lib/gears/list-gear-categories";
import {
  listApprovedGearsForMerge,
  listPendingGears,
} from "@/lib/gears/list-pending-gears";

interface PendingGearsListProps {
  pendingGears: Awaited<ReturnType<typeof listPendingGears>>;
  categories: Awaited<ReturnType<typeof listGearCategories>>;
  approvedGears: Awaited<ReturnType<typeof listApprovedGearsForMerge>>;
}

export function PendingGearsList({
  pendingGears,
  categories,
  approvedGears,
}: PendingGearsListProps) {
  if (pendingGears.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
        承認待ちのギアはありません。
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {pendingGears.map((gear) => (
        <PendingGearAdminCard
          key={gear.id}
          gear={gear}
          categories={categories}
          approvedGears={approvedGears}
        />
      ))}
    </ul>
  );
}
