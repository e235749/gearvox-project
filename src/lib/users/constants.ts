export const MAX_DISPLAY_NAME_LENGTH = 50;
export const MAX_BIO_LENGTH = 500;
export const MAX_LOCATION_LENGTH = 100;
export const MAX_INSTAGRAM_USERNAME_LENGTH = 30;

export const AVATARS_BUCKET = "avatars";
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
export const AVATAR_OUTPUT_SIZE = 512;

export const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedAvatarType = (typeof ALLOWED_AVATAR_TYPES)[number];
