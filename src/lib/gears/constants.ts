export const GEAR_STATUSES = [
  "approved",
  "pending",
  "merged",
  "rejected",
] as const;

export type GearStatus = (typeof GEAR_STATUSES)[number];

export const VISIBLE_GEAR_STATUSES: GearStatus[] = ["approved", "pending"];

export const MAX_GEAR_NAME_LENGTH = 200;
export const MAX_GEAR_BRAND_LENGTH = 100;
