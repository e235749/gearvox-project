export function normalizeGearName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\u3000/g, " ")
    .replace(/\s+/g, "");
}
