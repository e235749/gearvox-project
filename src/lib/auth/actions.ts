"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "@/lib/auth/constants";
import { mapAuthError } from "@/lib/auth/errors";
import type { AuthActionResult } from "@/lib/auth/types";
import {
  parseEmailPasswordForm,
  parseSignupForm,
  validateLoginInput,
  validateSignupInput,
} from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

function getRedirectPath(formData: FormData): string {
  const next = String(formData.get("next") ?? "");
  if (next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return AUTH_ROUTES.home;
}

export async function loginWithEmail(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const input = parseEmailPasswordForm(formData);
  const validationError = validateLoginInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    return { success: false, error: mapAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect(getRedirectPath(formData));
}

export async function signupWithEmail(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const input = parseSignupForm(formData);
  const validationError = validateSignupInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });

  if (error) {
    return { success: false, error: mapAuthError(error.message) };
  }

  if (!data.session) {
    return {
      success: true,
      message:
        "確認メールを送信しました。メール内のリンクから登録を完了してください。",
    };
  }

  revalidatePath("/", "layout");
  redirect(getRedirectPath(formData));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(AUTH_ROUTES.login);
}
