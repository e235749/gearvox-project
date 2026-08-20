import { createClient } from "@/lib/supabase/server";

import type { ReviewComment } from "@/lib/comments/types";

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  users: { id: string; display_name: string } | null;
};

export async function listReviewComments(
  reviewId: string,
): Promise<ReviewComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, body, created_at, user_id, users(id, display_name)")
    .eq("review_id", reviewId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("listReviewComments:", error.message);
    return [];
  }

  return ((data ?? []) as CommentRow[])
    .filter((comment) => comment.users !== null)
    .map((comment) => ({
      id: comment.id,
      body: comment.body,
      created_at: comment.created_at,
      author: {
        id: comment.users!.id,
        display_name: comment.users!.display_name,
      },
    }));
}
