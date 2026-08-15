import { createClient } from "@/lib/supabase/server";
import { hasCompletedContextQuestionnaire } from "@/lib/context/get-user-context";
import {
  normalizeUserPair,
  toSimilarityDisplay,
} from "@/lib/similarity/calculate-similarity";
import type { SimilarityDisplay } from "@/lib/similarity/types";

type SimilarityRow = {
  user_a_id: string;
  user_b_id: string;
  similarity_score: number;
};

async function getSimilarityRow(
  viewerId: string,
  targetUserId: string,
): Promise<number | null> {
  const [userAId, userBId] = normalizeUserPair(viewerId, targetUserId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_similarities")
    .select("similarity_score")
    .eq("user_a_id", userAId)
    .eq("user_b_id", userBId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("getSimilarityRow:", error.message);
    }
    return null;
  }

  return (data as { similarity_score: number }).similarity_score;
}

async function shouldShowSimilarityToUser(
  viewerId: string,
  targetUserId: string,
  targetIsContextPublic: boolean,
): Promise<boolean> {
  if (viewerId === targetUserId) {
    return false;
  }

  if (!targetIsContextPublic) {
    return false;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "should_notify_user",
    {
      actor_id: targetUserId,
      recipient_id: viewerId,
    } as never,
  );

  if (error) {
    console.error("shouldShowSimilarityToUser:", error.message);
    return false;
  }

  return Boolean(data);
}

export async function getSimilarityDisplayBetweenUsers(
  viewerId: string,
  targetUserId: string,
  targetIsContextPublic: boolean,
): Promise<SimilarityDisplay | null> {
  const viewerCompleted = await hasCompletedContextQuestionnaire(viewerId);

  if (!viewerCompleted) {
    return null;
  }

  const canShow = await shouldShowSimilarityToUser(
    viewerId,
    targetUserId,
    targetIsContextPublic,
  );

  if (!canShow) {
    return null;
  }

  const score = await getSimilarityRow(viewerId, targetUserId);

  if (score === null) {
    return null;
  }

  return toSimilarityDisplay(score);
}

export async function getSimilarityDisplaysForUsers(
  viewerId: string,
  targets: Array<{ userId: string; isContextPublic: boolean }>,
): Promise<Record<string, SimilarityDisplay>> {
  const uniqueTargets = new Map<string, boolean>();

  targets.forEach((target) => {
    if (target.userId !== viewerId) {
      uniqueTargets.set(target.userId, target.isContextPublic);
    }
  });

  if (uniqueTargets.size === 0) {
    return {};
  }

  const supabase = await createClient();
  const targetIdSet = new Set(uniqueTargets.keys());
  const { data, error } = await supabase
    .from("user_similarities")
    .select("user_a_id, user_b_id, similarity_score")
    .or(`user_a_id.eq.${viewerId},user_b_id.eq.${viewerId}`);

  if (error) {
    console.error("getSimilarityDisplaysForUsers:", error.message);
    return {};
  }

  const scoreByTarget = new Map<string, number>();

  ((data ?? []) as SimilarityRow[]).forEach((row) => {
    const targetId =
      row.user_a_id === viewerId ? row.user_b_id : row.user_a_id;

    if (!targetIdSet.has(targetId)) {
      return;
    }

    scoreByTarget.set(targetId, row.similarity_score);
  });

  const results: Record<string, SimilarityDisplay> = {};

  for (const [targetId, isContextPublic] of uniqueTargets.entries()) {
    const score = scoreByTarget.get(targetId);

    if (score === undefined) {
      continue;
    }

    const canShow = await shouldShowSimilarityToUser(
      viewerId,
      targetId,
      isContextPublic,
    );

    if (!canShow) {
      continue;
    }

    results[targetId] = toSimilarityDisplay(score);
  }

  return results;
}
