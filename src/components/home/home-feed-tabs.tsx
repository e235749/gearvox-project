import Link from "next/link";

import type { HomeFeedTab } from "@/lib/reviews/constants";

interface HomeFeedTabsProps {
  activeTab: HomeFeedTab;
}

const tabs: Array<{ id: HomeFeedTab; label: string; href: string }> = [
  { id: "latest", label: "新着", href: "/?tab=latest" },
  { id: "following", label: "フォロー中", href: "/?tab=following" },
];

export function HomeFeedTabs({ activeTab }: HomeFeedTabsProps) {
  return (
    <div className="flex gap-2 rounded-lg border border-border bg-surface p-1">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex-1 rounded-md px-3 py-2 text-center text-sm transition-colors ${
              isActive
                ? "bg-accent/20 font-medium text-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
