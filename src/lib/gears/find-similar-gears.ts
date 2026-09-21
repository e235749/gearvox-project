import { outdoorBrandSearchTokens } from "@/lib/gears/outdoor-brands";
import { normalizeGearName } from "@/lib/gears/normalize-gear-name";
import type { GearListItem } from "@/lib/gears/types";

function brandsOverlap(left: string, right: string): number {
  const leftTokens = outdoorBrandSearchTokens(left);
  const rightTokens = outdoorBrandSearchTokens(right);

  if (leftTokens.length === 0 || rightTokens.length === 0) {
    return 0;
  }

  for (const token of leftTokens) {
    if (rightTokens.includes(token)) {
      return 40;
    }
  }

  for (const leftToken of leftTokens) {
    for (const rightToken of rightTokens) {
      if (
        leftToken.includes(rightToken) ||
        rightToken.includes(leftToken)
      ) {
        return 20;
      }
    }
  }

  return 0;
}

export function findSimilarGears(
  gears: GearListItem[],
  name: string,
  brand: string,
  limit = 5,
): GearListItem[] {
  const normalizedName = normalizeGearName(name);

  if (!normalizedName) {
    return [];
  }

  const scored = gears
    .map((gear) => {
      const gearName = normalizeGearName(gear.name);
      let score = 0;

      if (gearName === normalizedName) {
        score += 100;
      } else if (
        gearName.includes(normalizedName) ||
        normalizedName.includes(gearName)
      ) {
        score += 60;
      }

      score += brandsOverlap(brand, gear.brand ?? "");

      return { gear, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((entry) => entry.gear);
}
