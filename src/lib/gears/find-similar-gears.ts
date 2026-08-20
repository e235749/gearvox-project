import { normalizeGearName } from "@/lib/gears/normalize-gear-name";
import type { GearListItem } from "@/lib/gears/types";

export function findSimilarGears(
  gears: GearListItem[],
  name: string,
  brand: string,
  limit = 5,
): GearListItem[] {
  const normalizedName = normalizeGearName(name);
  const normalizedBrand = normalizeGearName(brand);

  if (!normalizedName) {
    return [];
  }

  const scored = gears
    .map((gear) => {
      const gearName = normalizeGearName(gear.name);
      const gearBrand = normalizeGearName(gear.brand ?? "");
      let score = 0;

      if (gearName === normalizedName) {
        score += 100;
      } else if (
        gearName.includes(normalizedName) ||
        normalizedName.includes(gearName)
      ) {
        score += 60;
      }

      if (normalizedBrand && gearBrand) {
        if (gearBrand === normalizedBrand) {
          score += 40;
        } else if (
          gearBrand.includes(normalizedBrand) ||
          normalizedBrand.includes(gearBrand)
        ) {
          score += 20;
        }
      }

      return { gear, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((entry) => entry.gear);
}
