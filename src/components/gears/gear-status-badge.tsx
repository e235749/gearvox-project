import type { GearStatus } from "@/lib/gears/constants";

interface GearStatusBadgeProps {
  status: GearStatus;
}

export function GearStatusBadge({ status }: GearStatusBadgeProps) {
  if (status !== "pending") {
    return null;
  }

  return (
    <span className="inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
      未承認
    </span>
  );
}
