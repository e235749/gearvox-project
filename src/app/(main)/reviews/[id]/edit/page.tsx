import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { EditReviewForm } from "@/components/reviews/edit-review-form";
import { getReviewById } from "@/lib/reviews/get-review";
import { createClient } from "@/lib/supabase/server";

interface EditReviewPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditReviewPage({ params }: EditReviewPageProps) {
  const { id } = await params;
  const review = await getReviewById(id);

  if (!review) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (review.user_id !== user.id) {
    redirect(`/reviews/${id}`);
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted">レビュー編集</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          レビューを編集
        </h1>
      </header>

      <EditReviewForm review={review} />

      <Link
        href={`/reviews/${id}`}
        className="inline-block text-sm text-accent hover:underline"
      >
        レビュー詳細に戻る
      </Link>
    </section>
  );
}
