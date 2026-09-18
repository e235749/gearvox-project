import Link from "next/link";

import type { HomeFeedTab } from "@/lib/reviews/constants";

interface HomeFeedTabsProps {
  activeTab: HomeFeedTab;
  categoryId?: string | null;
  brand?: string | null;
}

export function HomeFeedTabs({
  activeTab,
  categoryId = null,
  brand = null,
}: HomeFeedTabsProps) {
  function buildHref(tab: HomeFeedTab): string {
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (categoryId) {
      params.set("category", categoryId);
    }
    if (brand) {
      params.set("brand", brand);
    }
    return `/?${params.toString()}`;
  }

  const tabs: Array<{ id: HomeFeedTab; label: string }> = [
    { id: "latest", label: "新着" },
    { id: "following", label: "フォロー中" },
  ];

  return (
    <div className="flex gap-2 rounded-lg border border-border bg-surface p-1">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Link
            key={tab.id}
            href={buildHref(tab.id)}
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
