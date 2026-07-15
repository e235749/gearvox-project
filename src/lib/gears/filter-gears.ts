import type { GearListItem } from "@/lib/gears/types";

export function filterGearsByKeyword(
  gears: GearListItem[],
  keyword: string,
): GearListItem[] {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) {
    return gears;
  }

  return gears.filter((gear) => {
    const name = gear.name.toLowerCase();
    const brand = gear.brand?.toLowerCase() ?? "";
    return name.includes(normalized) || brand.includes(normalized);
  });
}
