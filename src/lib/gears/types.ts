import type { Gear } from "@/types/database";

export type GearListItem = Pick<
  Gear,
  "id" | "name" | "brand" | "image_url"
>;
