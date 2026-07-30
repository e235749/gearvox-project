import { createClient } from "@/lib/supabase/server";

import type { PendingGearListItem } from "@/lib/gears/types";

export async function listPendingGears(): Promise<PendingGearListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gears")
    .select(
      "id, name, brand, submitted_name, status, created_at, submitted_by, gear_categories(id, name), reviews(count)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listPendingGears:", error.message);
    return [];
  }

  const rows = (data ?? []) as Array<{
    id: string;
    name: string;
    brand: string | null;
    submitted_name: string;
    status: string;
    created_at: string;
    submitted_by: string | null;
    gear_categories: { id: string; name: string } | null;
    reviews: Array<{ count: number }> | null;
  }>;

  const submitterIds = [
    ...new Set(rows.map((row) => row.submitted_by).filter(Boolean)),
  ] as string[];

  const submitterMap = new Map<string, string>();
  if (submitterIds.length > 0) {
    const { data: usersData } = await supabase
      .from("users")
      .select("id, display_name")
      .in("id", submitterIds);

    for (const user of (usersData ?? []) as Array<{
      id: string;
      display_name: string;
    }>) {
      submitterMap.set(user.id, user.display_name);
    }
  }

  return rows.map((gear) => ({
    id: gear.id,
    name: gear.name,
    brand: gear.brand,
    submitted_name: gear.submitted_name,
    status: gear.status as PendingGearListItem["status"],
    created_at: gear.created_at,
    category: gear.gear_categories
      ? { id: gear.gear_categories.id, name: gear.gear_categories.name }
      : null,
    submitted_by: gear.submitted_by
      ? {
          id: gear.submitted_by,
          display_name: submitterMap.get(gear.submitted_by) ?? "ユーザー",
        }
      : null,
    review_count: gear.reviews?.[0]?.count ?? 0,
  }));
}

export async function listApprovedGearsForMerge(): Promise<
  Array<{ id: string; name: string; brand: string | null }>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gears")
    .select("id, name, brand")
    .eq("status", "approved")
    .order("name", { ascending: true });

  if (error) {
    console.error("listApprovedGearsForMerge:", error.message);
    return [];
  }

  return (data ?? []) as Array<{ id: string; name: string; brand: string | null }>;
}
