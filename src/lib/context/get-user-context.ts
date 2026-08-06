import { createClient } from "@/lib/supabase/server";
import type { ContextAnswerCategory } from "@/types/database";

import {
  EMPTY_CONTEXT_QUESTIONNAIRE,
  parseOtherAnswerValue,
  type ContextQuestionnaireInput,
} from "@/lib/context/validation";
import { OTHER_OPTION } from "@/constants/context-options";

type UserContextRow = {
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
  category: ContextAnswerCategory;
  answer_value: string;
};

export type UserContextSummary = ContextQuestionnaireInput & {
  completedAt: string | null;
  isCompleted: boolean;
};

function splitMultiAnswers(
  values: string[],
): { selections: string[]; otherText: string } {
  const selections: string[] = [];
  let otherText = "";

  values.forEach((value) => {
    const parsed = parseOtherAnswerValue(value);
    if (parsed.isOther) {
      selections.push(OTHER_OPTION);
      otherText = parsed.label;
      return;
    }
    selections.push(value);
  });

  return { selections, otherText };
}

export async function getUserContextSummary(
  userId: string,
): Promise<UserContextSummary> {
  const supabase = await createClient();

  const [{ data: contextData }, { data: answersData }] = await Promise.all([
    supabase
      .from("user_contexts")
      .select(
        "experience_years, annual_frequency, transport, transport_other, primary_season, stay_duration, primary_purpose, primary_purpose_other, completed_at",
      )
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("context_answers")
      .select("category, answer_value")
      .eq("user_id", userId),
  ]);

  if (!contextData) {
    return {
      ...EMPTY_CONTEXT_QUESTIONNAIRE,
      completedAt: null,
      isCompleted: false,
    };
  }

  const context = contextData as UserContextRow;
  const answers = (answersData ?? []) as ContextAnswerRow[];

  const companions = splitMultiAnswers(
    answers
      .filter((answer) => answer.category === "companions")
      .map((answer) => answer.answer_value),
  );
  const gearTags = splitMultiAnswers(
    answers
      .filter((answer) => answer.category === "gear_tags")
      .map((answer) => answer.answer_value),
  );

  return {
    experienceYears: context.experience_years ?? "",
    annualFrequency: context.annual_frequency ?? "",
    companions: companions.selections,
    companionOther: companions.otherText,
    transport: context.transport ?? "",
    transportOther: context.transport_other ?? "",
    primarySeason: context.primary_season ?? "",
    stayDuration: context.stay_duration ?? "",
    primaryPurpose: context.primary_purpose ?? "",
    primaryPurposeOther: context.primary_purpose_other ?? "",
    gearTags: gearTags.selections,
    gearTagOther: gearTags.otherText,
    completedAt: context.completed_at,
    isCompleted: context.completed_at !== null,
  };
}

export async function hasCompletedContextQuestionnaire(
  userId: string,
): Promise<boolean> {
  const summary = await getUserContextSummary(userId);
  return summary.isCompleted;
}
