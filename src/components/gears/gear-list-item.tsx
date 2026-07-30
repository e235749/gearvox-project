import Link from "next/link";

import { GearStatusBadge } from "@/components/gears/gear-status-badge";
import type { GearListItem } from "@/lib/gears/types";

interface GearListItemCardProps {
  gear: GearListItem;
}

export function GearListItemCard({ gear }: GearListItemCardProps) {
  return (
    <li>
      <Link
        href={`/gears/${gear.id}`}
        className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm transition-colors hover:border-accent/50"
      >
        {gear.image_url ? (
          <img
            src={gear.image_url}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-md object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-background text-xs text-muted">
            Gear
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="block truncate font-medium">{gear.name}</span>
            <GearStatusBadge status={gear.status} />
          </span>
          {gear.brand ? (
            <span className="block truncate text-xs text-muted">{gear.brand}</span>
          ) : null}
          {gear.category_name ? (
            <span className="mt-1 inline-block rounded-full border border-border px-2 py-0.5 text-xs text-muted">
              {gear.category_name}
            </span>
          ) : null}
        </span>
        <span className="text-xs text-muted" aria-hidden>
          →
        </span>
      </Link>
    </li>
  );
}
