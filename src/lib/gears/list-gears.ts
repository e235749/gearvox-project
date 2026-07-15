import { createClient } from "@/lib/supabase/server";

import type { GearListItem } from "@/lib/gears/types";

export async function listGears(): Promise<GearListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gears")
    .select("id, name, brand, image_url")
    .order("name", { ascending: true });

  if (error) {
    console.error("listGears:", error.message);
    return [];
  }

  return (data ?? []) as GearListItem[];
}
