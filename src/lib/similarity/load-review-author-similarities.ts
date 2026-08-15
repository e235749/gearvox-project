import { createClient } from "@/lib/supabase/server";
import { hasCompletedContextQuestionnaire } from "@/lib/context/get-user-context";

export async function loadAuthorContextPublicFlags(
  authorIds: string[],
): Promise<Record<string, boolean>> {
  const uniqueIds = [...new Set(authorIds)];

  if (uniqueIds.length === 0) {
    return {};
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, is_context_public")
    .in("id", uniqueIds);

  if (error) {
    console.error("loadAuthorContextPublicFlags:", error.message);
    return {};
  }

  return Object.fromEntries(
    ((data ?? []) as Array<{ id: string; is_context_public: boolean }>).map(
      (user) => [user.id, user.is_context_public],
    ),
  );
}

export async function loadSimilarityDisplaysForReviewAuthors(
  viewerId: string | null | undefined,
  authorIds: string[],
): Promise<Record<string, import("@/lib/similarity/types").SimilarityDisplay>> {
  if (!viewerId) {
    return {};
  }

  const isViewerContextCompleted = await hasCompletedContextQuestionnaire(viewerId);

  if (!isViewerContextCompleted) {
    return {};
  }

  const publicFlags = await loadAuthorContextPublicFlags(authorIds);
  const { getSimilarityDisplaysForUsers } = await import(
    "@/lib/similarity/get-similarity-display"
  );

  return getSimilarityDisplaysForUsers(
    viewerId,
    authorIds.map((userId) => ({
      userId,
      isContextPublic: publicFlags[userId] !== false,
    })),
  );
}
