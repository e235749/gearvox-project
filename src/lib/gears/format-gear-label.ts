export function formatGearLabel(name: string, brand: string | null): string {
  if (brand) {
    return `${brand} / ${name}`;
  }
  return name;
}
