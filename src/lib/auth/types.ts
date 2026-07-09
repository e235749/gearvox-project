export type AuthActionResult = {
  success: boolean;
  error?: string;
  message?: string;
};

export type OAuthProvider = "google" | "apple";
