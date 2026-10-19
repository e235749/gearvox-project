import { EmailLoginForm } from "@/components/auth/email-login-form";
import { AuthShell } from "@/components/auth/auth-shell";

interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
    error?: string;
    deleted?: string;
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
      description="Google またはメールアドレスでログインできます。"
    >
      {params.deleted === "1" ? (
        <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
          アカウントを削除しました。
        </p>
      ) : null}
      <EmailLoginForm next={params.next} initialError={initialError} />
    </AuthShell>
  );
}
