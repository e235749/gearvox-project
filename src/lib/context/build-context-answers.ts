import type { ContextAnswerCategory } from "@/types/database";

import type { ContextQuestionnaireState } from "@/stores/context-questionnaire";

export interface ContextAnswerInsert {
  category: ContextAnswerCategory;
  answer_value: string;
}

export function buildContextAnswerInserts(
  state: Pick<
    ContextQuestionnaireState,
    "cat2_style" | "cat3_season" | "cat5_activity" | "cat6_space"
  >,
): ContextAnswerInsert[] {
  const inserts: ContextAnswerInsert[] = [];

  state.cat2_style.forEach((value) => {
    inserts.push({ category: "cat2_style", answer_value: value });
  });
  state.cat3_season.forEach((value) => {
    inserts.push({ category: "cat3_season", answer_value: value });
  });
  state.cat5_activity.forEach((value) => {
    inserts.push({ category: "cat5_activity", answer_value: value });
  });
  state.cat6_space.forEach((value) => {
    inserts.push({ category: "cat6_space", answer_value: value });
  });

  return inserts;
}
