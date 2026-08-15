import { OTHER_OPTION } from "@/constants/context-options";
import { parseOtherAnswerValue } from "@/lib/context/validation";
import type { ContextQuestionnaireInput } from "@/lib/context/validation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateSimilarityScore,
  normalizeUserPair,
  toUserContextVector,
} from "@/lib/similarity/calculate-similarity";
import type { UserContextVector } from "@/lib/similarity/types";

type UserContextRow = {
  user_id: string;
  experience_years: string | null;
  annual_frequency: string | null;
  transport: string | null;
  transport_other: string | null;
  primary_season: string | null;
  stay_duration: string | null;
  primary_purpose: string | null;
  primary_purpose_other: string | null;
  completed_at: string | null;
};

type ContextAnswerRow = {
  user_id: string;
  category: "companions" | "gear_tags";
  answer_value: string;
};

function buildContextInput(
  context: UserContextRow,
  answers: ContextAnswerRow[],
): ContextQuestionnaireInput {
  const userAnswers = answers.filter((answer) => answer.user_id === context.user_id);

  const companions = userAnswers
    .filter((answer) => answer.category === "companions")
    .map((answer) => answer.answer_value);
  const gearTags = userAnswers
    .filter((answer) => answer.category === "gear_tags")
    .map((answer) => answer.answer_value);

  const companionSelections: string[] = [];
  let companionOther = "";
  companions.forEach((value) => {
    const parsed = parseOtherAnswerValue(value);
    if (parsed.isOther) {
      companionSelections.push(OTHER_OPTION);
      companionOther = parsed.label;
      return;
    }
    companionSelections.push(value);
  });

  const gearTagSelections: string[] = [];
  let gearTagOther = "";
  gearTags.forEach((value) => {
    const parsed = parseOtherAnswerValue(value);
    if (parsed.isOther) {
      gearTagSelections.push(OTHER_OPTION);
      gearTagOther = parsed.label;
      return;
    }
    gearTagSelections.push(value);
  });

  return {
    experienceYears: context.experience_years ?? "",
    annualFrequency: context.annual_frequency ?? "",
    companions: companionSelections,
    companionOther,
    transport: context.transport ?? "",
    transportOther: context.transport_other ?? "",
    primarySeason: context.primary_season ?? "",
    stayDuration: context.stay_duration ?? "",
    primaryPurpose: context.primary_purpose ?? "",
    primaryPurposeOther: context.primary_purpose_other ?? "",
    gearTags: gearTagSelections,
    gearTagOther,
  };
}

async function loadCompletedContextVectors(): Promise<UserContextVector[]> {
  const supabase = createAdminClient();

  const { data: contexts, error: contextsError } = await supabase
    .from("user_contexts")
    .select(
      "user_id, experience_years, annual_frequency, transport, transport_other, primary_season, stay_duration, primary_purpose, primary_purpose_other, completed_at",
    )
    .not("completed_at", "is", null);

  if (contextsError) {
    throw new Error(`コンテキスト取得に失敗しました: ${contextsError.message}`);
  }

  const rows = (contexts ?? []) as UserContextRow[];

  if (rows.length === 0) {
    return [];
  }

  const userIds = rows.map((row) => row.user_id);
  const { data: answers, error: answersError } = await supabase
    .from("context_answers")
    .select("user_id, category, answer_value")
    .in("user_id", userIds);

  if (answersError) {
    throw new Error(`回答取得に失敗しました: ${answersError.message}`);
  }

  const answerRows = (answers ?? []) as ContextAnswerRow[];

  return rows.map((row) =>
    toUserContextVector(row.user_id, buildContextInput(row, answerRows)),
  );
}

export type RecalculateSimilaritiesResult = {
  pairCount: number;
  userCount: number;
};

export async function recalculateAllSimilarities(): Promise<RecalculateSimilaritiesResult> {
  const supabase = createAdminClient();
  const vectors = await loadCompletedContextVectors();

  const inserts: Array<{
    user_a_id: string;
    user_b_id: string;
    similarity_score: number;
    calculated_at: string;
  }> = [];

  const calculatedAt = new Date().toISOString();

  for (let index = 0; index < vectors.length; index += 1) {
    for (let inner = index + 1; inner < vectors.length; inner += 1) {
      const left = vectors[index];
      const right = vectors[inner];
      const [userAId, userBId] = normalizeUserPair(left.userId, right.userId);
      const score = calculateSimilarityScore(left, right);

      inserts.push({
        user_a_id: userAId,
        user_b_id: userBId,
        similarity_score: score,
        calculated_at: calculatedAt,
      });
    }
  }

  const { error: deleteError } = await supabase
    .from("user_similarities")
    .delete()
    .gte("similarity_score", 0);

  if (deleteError) {
    throw new Error(`既存スコア削除に失敗しました: ${deleteError.message}`);
  }

  if (inserts.length > 0) {
    const chunkSize = 500;

    for (let offset = 0; offset < inserts.length; offset += chunkSize) {
      const chunk = inserts.slice(offset, offset + chunkSize);
      const { error: insertError } = await supabase
        .from("user_similarities")
        .insert(chunk as never);

      if (insertError) {
        throw new Error(`スコア保存に失敗しました: ${insertError.message}`);
      }
    }
  }

  return {
    pairCount: inserts.length,
    userCount: vectors.length,
  };
}
