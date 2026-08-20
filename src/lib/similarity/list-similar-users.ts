import { createClient } from "@/lib/supabase/server";
import {
  toSimilarityDisplay,
} from "@/lib/similarity/calculate-similarity";
import {
  SIMILAR_USERS_LIST_MIN_PERCENT,
  type SimilarUserListItem,
} from "@/lib/similarity/types";

type SimilarityRow = {
  user_a_id: string;
  user_b_id: string;
  similarity_score: number;
};

export async function listSimilarUsersForProfile(
  userId: string,
  minPercent = SIMILAR_USERS_LIST_MIN_PERCENT,
): Promise<SimilarUserListItem[]> {
  const minScore = minPercent / 100;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_similarities")
    .select("user_a_id, user_b_id, similarity_score")
    .gte("similarity_score", minScore)
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order("similarity_score", { ascending: false });

  if (error) {
    console.error("listSimilarUsersForProfile:", error.message);
    return [];
  }

  const rows = (data ?? []) as SimilarityRow[];

  if (rows.length === 0) {
    return [];
  }

  const otherUserIds = rows.map((row) =>
    row.user_a_id === userId ? row.user_b_id : row.user_a_id,
  );

  const { data: usersData, error: usersError } = await supabase
    .from("users")
    .select("id, display_name, avatar_url, is_context_public")
    .in("id", otherUserIds);

  if (usersError) {
    console.error("listSimilarUsersForProfile users:", usersError.message);
    return [];
  }

  const usersById = new Map(
    ((usersData ?? []) as Array<{
      id: string;
      display_name: string;
      avatar_url: string | null;
      is_context_public: boolean;
    }>).map((user) => [user.id, user]),
  );

  const results: SimilarUserListItem[] = [];

  for (const row of rows) {
    const otherUserId =
      row.user_a_id === userId ? row.user_b_id : row.user_a_id;
    const user = usersById.get(otherUserId);

    if (!user || user.is_context_public === false) {
      continue;
    }

    const { data: canShow, error: canShowError } = await supabase.rpc(
      "should_notify_user",
      {
        actor_id: otherUserId,
        recipient_id: userId,
      } as never,
    );

    if (canShowError || !canShow) {
      continue;
    }

    const display = toSimilarityDisplay(row.similarity_score);
    results.push({
      userId: otherUserId,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      percent: display.percent,
      label: display.label,
    });
  }

  return results;
}
