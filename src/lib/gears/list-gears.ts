import { createClient } from "@/lib/supabase/server";

import type { GearListItem } from "@/lib/gears/types";

type GearRow = {
  id: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  category_id: string | null;
  gear_categories: { name: string } | null;
};

export async function listGears(): Promise<GearListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gears")
    .select("id, name, brand, image_url, category_id, gear_categories(name)")
    .order("name", { ascending: true });

  if (error) {
    console.error("listGears:", error.message);
    return [];
  }

  return ((data ?? []) as GearRow[]).map((gear) => ({
    id: gear.id,
    name: gear.name,
    brand: gear.brand,
    image_url: gear.image_url,
    category_id: gear.category_id,
    category_name: gear.gear_categories?.name ?? null,
  }));
}
