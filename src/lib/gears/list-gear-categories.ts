import { createClient } from "@/lib/supabase/server";

import type { GearCategoryItem } from "@/lib/gears/types";

export async function listGearCategories(): Promise<GearCategoryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gear_categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("listGearCategories:", error.message);
    return [];
  }

  return (data ?? []) as GearCategoryItem[];
}
