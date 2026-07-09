import { EmailSignupForm } from "@/components/auth/email-signup-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignupPage() {
  return (
    <AuthShell
      title="会員登録"
      description="キャンプスタイルに合ったレビューを見つけましょう。"
    >
      <EmailSignupForm />
    </AuthShell>
  );
}
