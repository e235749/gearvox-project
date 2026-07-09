import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";

export interface EmailPasswordInput {
  email: string;
  password: string;
}

export interface SignupInput extends EmailPasswordInput {
  confirmPassword: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateLoginInput(
  input: EmailPasswordInput,
): string | null {
  if (!input.email.trim()) {
    return "メールアドレスを入力してください。";
  }
  if (!isValidEmail(input.email)) {
    return "メールアドレスの形式が正しくありません。";
  }
  if (!input.password) {
    return "パスワードを入力してください。";
  }
  return null;
}

export function validateSignupInput(input: SignupInput): string | null {
  const loginError = validateLoginInput(input);
  if (loginError) {
    return loginError;
  }
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return `パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください。`;
  }
  if (input.password !== input.confirmPassword) {
    return "パスワードが一致しません。";
  }
  return null;
}

export function parseEmailPasswordForm(
  formData: FormData,
): EmailPasswordInput {
  return {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
}

export function parseSignupForm(formData: FormData): SignupInput {
  const base = parseEmailPasswordForm(formData);
  return {
    ...base,
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
}
