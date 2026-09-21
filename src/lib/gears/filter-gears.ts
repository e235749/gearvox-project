import type { GearListItem } from "@/lib/gears/types";
import { outdoorBrandSearchTokens } from "@/lib/gears/outdoor-brands";

export function filterGearsByKeyword(
  gears: GearListItem[],
  keyword: string,
): GearListItem[] {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) {
    return gears;
  }

  const keywordCompact = normalized.replace(/\s+/g, "");

  return gears.filter((gear) => {
    const name = gear.name.toLowerCase();
    const categoryName = gear.category_name?.toLowerCase() ?? "";
    const brandTokens = outdoorBrandSearchTokens(gear.brand ?? "");

    return (
      name.includes(normalized) ||
      categoryName.includes(normalized) ||
      brandTokens.some(
        (token) =>
          token.includes(keywordCompact) || keywordCompact.includes(token),
      )
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
