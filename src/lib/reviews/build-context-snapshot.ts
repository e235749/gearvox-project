import { createClient } from "@/lib/supabase/server";
import type { ContextAnswerCategory } from "@/types/database";

type UserContextRow = {
  experience_years: string | null;
  annual_frequency: string | null;
  transport: string | null;
  transport_other: string | null;
  primary_season: string | null;
  stay_duration: string | null;
  primary_purpose: string | null;
  primary_purpose_other: string | null;
};

type ContextAnswerRow = {
  category: ContextAnswerCategory;
  answer_value: string;
};

export async function buildContextSnapshot(
  userId: string,
): Promise<Record<string, unknown> | null> {
  const supabase = await createClient();

  const { data: userContextData } = await supabase
    .from("user_contexts")
    .select(
      "experience_years, annual_frequency, transport, transport_other, primary_season, stay_duration, primary_purpose, primary_purpose_other",
    )
    .eq("user_id", userId)
    .maybeSingle();

  const { data: answersData } = await supabase
    .from("context_answers")
    .select("category, answer_value")
    .eq("user_id", userId);

  const userContext = userContextData as UserContextRow | null;
  const answers = (answersData ?? []) as ContextAnswerRow[];
  const hasContext = userContext !== null || answers.length > 0;

  if (!hasContext) {
    return null;
  }

  const groupedAnswers = {
    companions: [] as string[],
    gear_tags: [] as string[],
  };

  answers.forEach((answer) => {
    if (answer.category in groupedAnswers) {
      groupedAnswers[answer.category as keyof typeof groupedAnswers].push(
        answer.answer_value,
      );
    }
  });

  return {
    experience_years: userContext?.experience_years ?? null,
    annual_frequency: userContext?.annual_frequency ?? null,
    transport: userContext?.transport ?? null,
    transport_other: userContext?.transport_other ?? null,
    primary_season: userContext?.primary_season ?? null,
    stay_duration: userContext?.stay_duration ?? null,
    primary_purpose: userContext?.primary_purpose ?? null,
    primary_purpose_other: userContext?.primary_purpose_other ?? null,
    ...groupedAnswers,
    captured_at: new Date().toISOString(),
  };
}
