const INSTAGRAM_USERNAME_PATTERN = /^[a-zA-Z0-9._]{1,30}$/;

export function normalizeInstagramUsername(value: string): string | null {
  const trimmed = value.trim().replace(/^@+/, "");
  return trimmed.length > 0 ? trimmed : null;
}

export function isValidInstagramUsername(username: string): boolean {
  return INSTAGRAM_USERNAME_PATTERN.test(username);
}

export function buildInstagramProfileUrl(username: string): string {
  return `https://www.instagram.com/${encodeURIComponent(username)}/`;
}

export function formatInstagramDisplay(username: string): string {
  return `@${username}`;
}
