import Link from "next/link";
import { redirect } from "next/navigation";

import { ContextQuestionnaireWizard } from "@/components/context/context-questionnaire-wizard";
import { getUserContextSummary } from "@/lib/context/get-user-context";
import { createClient } from "@/lib/supabase/server";

interface ProfileContextPageProps {
  searchParams: Promise<{ welcome?: string }>;
}

export const dynamic = "force-dynamic";

export default async function ProfileContextPage({
  searchParams,
}: ProfileContextPageProps) {
  const { welcome } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const summary = await getUserContextSummary(user.id);
  const showIntro = welcome === "1" || !summary.isCompleted;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted">マイページ</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          キャンプスタイルアンケート
        </h1>
        <p className="text-sm text-muted">
          あなたに合ったギア選び・レビュー検索の参考に使われます。
        </p>
      </header>

      <ContextQuestionnaireWizard
        initialValues={summary}
        showIntro={showIntro}
        cancelHref="/profile"
      />

      <Link href="/profile" className="text-sm text-accent hover:underline">
        プロフィールに戻る
      </Link>
    </section>
  );
}
