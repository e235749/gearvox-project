export const AUTH_ROUTES = {
  login: "/login",
  signup: "/signup",
  callback: "/auth/callback",
  home: "/",
} as const;

export const PUBLIC_ROUTES = [
  AUTH_ROUTES.login,
  AUTH_ROUTES.signup,
  AUTH_ROUTES.callback,
] as const;

/** ログイン不要で通す内部 API（ルート側で別途認証） */
export const INTERNAL_API_PREFIXES = ["/api/cron"] as const;

export const MIN_PASSWORD_LENGTH = 8;
