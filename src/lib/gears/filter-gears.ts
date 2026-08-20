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
    const categoryName = gear.category_name?.toLowerCase() ?? "";
    return (
      name.includes(normalized) ||
      brand.includes(normalized) ||
      categoryName.includes(normalized)
    );
  });
}

export function filterGearsByCategory(
  gears: GearListItem[],
  categoryId: string | null,
): GearListItem[] {
  if (!categoryId) {
    return gears;
  }

  return gears.filter((gear) => gear.category_id === categoryId);
}

export function filterGears(
  gears: GearListItem[],
  keyword: string,
  categoryId: string | null,
): GearListItem[] {
  return filterGearsByKeyword(
    filterGearsByCategory(gears, categoryId),
    keyword,
  );
}
