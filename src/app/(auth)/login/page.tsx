import { EmailLoginForm } from "@/components/auth/email-login-form";
import { AuthShell } from "@/components/auth/auth-shell";

interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const initialError =
    params.error === "auth_callback_failed"
      ? "認証に失敗しました。再度お試しください。"
      : undefined;

  return (
    <AuthShell
      title="ログイン"
      description="Google / Apple / メールアドレスでログインできます。"
    >
      <EmailLoginForm next={params.next} initialError={initialError} />
    </AuthShell>
  );
}
