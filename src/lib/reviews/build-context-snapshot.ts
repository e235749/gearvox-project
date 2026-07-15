import { createClient } from "@/lib/supabase/server";
import type { ContextAnswerCategory } from "@/types/database";

type ContextAnswerRow = {
  category: ContextAnswerCategory;
  answer_value: string;
};

type UserContextRow = {
  cat1_companion: string | null;
  cat4_transport: string | null;
};

export async function buildContextSnapshot(
  userId: string,
): Promise<Record<string, unknown> | null> {
  const supabase = await createClient();

  const { data: userContextData } = await supabase
    .from("user_contexts")
    .select("cat1_companion, cat4_transport")
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
    cat2_style: [] as string[],
    cat3_season: [] as string[],
    cat5_activity: [] as string[],
    cat6_space: [] as string[],
  };

  answers.forEach((answer) => {
    if (answer.category in groupedAnswers) {
      groupedAnswers[answer.category as keyof typeof groupedAnswers].push(
        answer.answer_value,
      );
    }
  });

  return {
    cat1_companion: userContext?.cat1_companion ?? null,
    cat4_transport: userContext?.cat4_transport ?? null,
    ...groupedAnswers,
    captured_at: new Date().toISOString(),
  };
}
