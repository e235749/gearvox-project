import { createClient } from "@/lib/supabase/server";
import { VISIBLE_GEAR_STATUSES } from "@/lib/gears/constants";

import type { GearDetail } from "@/lib/gears/types";

type GearRow = {
  id: string;
  name: string;
  brand: string | null;
  description: string | null;
  image_url: string | null;
  status: GearDetail["status"];
  gear_categories: { id: string; name: string } | null;
};

export async function getGearById(gearId: string): Promise<GearDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gears")
    .select(
      "id, name, brand, description, image_url, status, gear_categories(id, name)",
    )
    .eq("id", gearId)
    .in("status", VISIBLE_GEAR_STATUSES)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("getGearById:", error.message);
    }
    return null;
  }

  const gear = data as GearRow;

  return {
    id: gear.id,
    name: gear.name,
    brand: gear.brand,
    description: gear.description,
    image_url: gear.image_url,
    status: gear.status,
    category: gear.gear_categories
      ? { id: gear.gear_categories.id, name: gear.gear_categories.name }
      : null,
  };
}
