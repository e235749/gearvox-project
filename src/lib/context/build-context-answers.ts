import type { ContextAnswerCategory } from "@/types/database";

import {
  formatOtherAnswerValue,
  type ContextQuestionnaireInput,
} from "@/lib/context/validation";
import { OTHER_OPTION } from "@/constants/context-options";

export interface ContextAnswerInsert {
  category: ContextAnswerCategory;
  answer_value: string;
}

function buildMultiAnswerValues(
  values: string[],
  otherText: string,
): string[] {
  return values.map((value) =>
    value === OTHER_OPTION ? formatOtherAnswerValue(otherText) : value,
  );
}

export function buildContextAnswerInserts(
  input: ContextQuestionnaireInput,
): ContextAnswerInsert[] {
  const inserts: ContextAnswerInsert[] = [];

  buildMultiAnswerValues(input.companions, input.companionOther).forEach(
    (value) => {
      inserts.push({ category: "companions", answer_value: value });
    },
  );

  buildMultiAnswerValues(input.gearTags, input.gearTagOther).forEach((value) => {
    inserts.push({ category: "gear_tags", answer_value: value });
  });

  return inserts;
}
