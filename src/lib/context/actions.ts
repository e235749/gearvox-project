"use server";

import { revalidatePath } from "next/cache";

import { OTHER_OPTION } from "@/constants/context-options";
import { buildContextAnswerInserts } from "@/lib/context/build-context-answers";
import {
  validateContextQuestionnaireInput,
  type ContextQuestionnaireInput,
} from "@/lib/context/validation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type UserContextInsert = Database["public"]["Tables"]["user_contexts"]["Insert"];
type UserContextUpdate = Database["public"]["Tables"]["user_contexts"]["Update"];

export type ContextQuestionnaireResult = {
  success: boolean;
  error?: string;
};

function parseContextQuestionnaireForm(
  formData: FormData,
): ContextQuestionnaireInput {
  const parseList = (key: string) =>
    formData
      .getAll(key)
      .map((value) => String(value).trim())
      .filter(Boolean);

  return {
    experienceYears: String(formData.get("experience_years") ?? "").trim(),
    annualFrequency: String(formData.get("annual_frequency") ?? "").trim(),
    companions: parseList("companions"),
    companionOther: String(formData.get("companion_other") ?? "").trim(),
    transport: String(formData.get("transport") ?? "").trim(),
    transportOther: String(formData.get("transport_other") ?? "").trim(),
    primarySeason: String(formData.get("primary_season") ?? "").trim(),
    stayDuration: String(formData.get("stay_duration") ?? "").trim(),
    primaryPurpose: String(formData.get("primary_purpose") ?? "").trim(),
    primaryPurposeOther: String(
      formData.get("primary_purpose_other") ?? "",
    ).trim(),
    gearTags: parseList("gear_tags"),
    gearTagOther: String(formData.get("gear_tag_other") ?? "").trim(),
  };
}

export async function saveContextQuestionnaire(
  _prevState: ContextQuestionnaireResult | null,
  formData: FormData,
): Promise<ContextQuestionnaireResult> {
  const input = parseContextQuestionnaireForm(formData);
  const validationError = validateContextQuestionnaireInput(input);

  if (validationError) {
    return { success: false, error: validationError };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "ログインが必要です。" };
  }

  const completedAt = new Date().toISOString();
  const contextPayload: UserContextInsert = {
    user_id: user.id,
    experience_years: input.experienceYears,
    annual_frequency: input.annualFrequency,
    transport: input.transport,
    transport_other:
      input.transport === OTHER_OPTION ? input.transportOther || null : null,
    primary_season: input.primarySeason,
    stay_duration: input.stayDuration,
    primary_purpose: input.primaryPurpose,
    primary_purpose_other:
      input.primaryPurpose === OTHER_OPTION
        ? input.primaryPurposeOther || null
        : null,
    completed_at: completedAt,
  };

  const { data: existingContext } = await supabase
    .from("user_contexts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingContext) {
    const updatePayload: UserContextUpdate = {
      experience_years: contextPayload.experience_years,
      annual_frequency: contextPayload.annual_frequency,
      transport: contextPayload.transport,
      transport_other: contextPayload.transport_other,
      primary_season: contextPayload.primary_season,
      stay_duration: contextPayload.stay_duration,
      primary_purpose: contextPayload.primary_purpose,
      primary_purpose_other: contextPayload.primary_purpose_other,
      completed_at: completedAt,
    };

    const { error: updateError } = await supabase
      .from("user_contexts")
      .update(updatePayload as never)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[saveContextQuestionnaire] update error:", updateError.message);
      return { success: false, error: "アンケートの保存に失敗しました。" };
    }
  } else {
    const { error: insertError } = await supabase
      .from("user_contexts")
      .insert(contextPayload as never);

    if (insertError) {
      console.error("[saveContextQuestionnaire] insert error:", insertError.message);
      return { success: false, error: "アンケートの保存に失敗しました。" };
    }
  }

  const { error: deleteAnswersError } = await supabase
    .from("context_answers")
    .delete()
    .eq("user_id", user.id);

  if (deleteAnswersError) {
    console.error(
      "[saveContextQuestionnaire] delete answers error:",
      deleteAnswersError.message,
    );
    return { success: false, error: "回答の更新に失敗しました。" };
  }

  const answerInserts = buildContextAnswerInserts(input).map((answer) => ({
    user_id: user.id,
    category: answer.category,
    answer_value: answer.answer_value,
  }));

  if (answerInserts.length > 0) {
    const { error: insertAnswersError } = await supabase
      .from("context_answers")
      .insert(answerInserts as never);

    if (insertAnswersError) {
      console.error(
        "[saveContextQuestionnaire] insert answers error:",
        insertAnswersError.message,
      );
      return { success: false, error: "回答の保存に失敗しました。" };
    }
  }

  revalidatePath("/profile");
  revalidatePath("/profile/context");
  revalidatePath("/");
  return { success: true };
}
