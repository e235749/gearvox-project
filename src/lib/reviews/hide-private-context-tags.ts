import { createClient } from "@/lib/supabase/server";

type ReviewWithContextTags = {
  author: {
    id: string;
    isContextPublic: boolean;
  };
  contextTags: string[];
};

/** 非公開のキャンプスタイルは、投稿者本人以外には渡さない */
export async function hidePrivateContextTags<T extends ReviewWithContextTags>(
  reviews: T[],
): Promise<T[]> {
  if (reviews.length === 0) {
    return reviews;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const viewerId = user?.id ?? null;

  return reviews.map((review) => {
    if (review.author.isContextPublic || review.author.id === viewerId) {
      return review;
    }
    return { ...review, contextTags: [] };
  });
}
