import {
  ANNUAL_FREQUENCY_OPTIONS,
  COMPANION_OPTIONS,
  EXPERIENCE_YEARS_OPTIONS,
  GEAR_TAG_OPTIONS,
  MAX_COMPANION_SELECTIONS,
  MAX_GEAR_TAG_SELECTIONS,
  MAX_OTHER_TEXT_LENGTH,
  OTHER_OPTION,
  PRIMARY_PURPOSE_OPTIONS,
  PRIMARY_SEASON_OPTIONS,
  STAY_DURATION_OPTIONS,
  TRANSPORT_OPTIONS,
} from "@/constants/context-options";

export interface ContextQuestionnaireInput {
  experienceYears: string;
  annualFrequency: string;
  companions: string[];
  companionOther: string;
  transport: string;
  transportOther: string;
  primarySeason: string;
  stayDuration: string;
  primaryPurpose: string;
  primaryPurposeOther: string;
  gearTags: string[];
  gearTagOther: string;
}

export type UserContextFormState = ContextQuestionnaireInput;

export const EMPTY_CONTEXT_QUESTIONNAIRE: ContextQuestionnaireInput = {
  experienceYears: "",
  annualFrequency: "",
  companions: [],
  companionOther: "",
  transport: "",
  transportOther: "",
  primarySeason: "",
  stayDuration: "",
  primaryPurpose: "",
  primaryPurposeOther: "",
  gearTags: [],
  gearTagOther: "",
};

function isAllowedOption(value: string, options: readonly string[]): boolean {
  return options.includes(value);
}

function validateOtherText(value: string, required: boolean): string | null {
  const trimmed = value.trim();
  if (!required) {
    if (trimmed.length > MAX_OTHER_TEXT_LENGTH) {
      return `「その他」は${MAX_OTHER_TEXT_LENGTH}文字以内で入力してください。`;
    }
    return null;
  }
  if (!trimmed) {
    return "「その他」の内容を入力してください。";
  }
  if (trimmed.length > MAX_OTHER_TEXT_LENGTH) {
    return `「その他」は${MAX_OTHER_TEXT_LENGTH}文字以内で入力してください。`;
  }
  return null;
}

function validateMultiSelection(
  values: string[],
  allowed: readonly string[],
  maxSelect: number,
  label: string,
  otherText: string,
): string | null {
  if (values.length === 0) {
    return `${label}を1つ以上選択してください。`;
  }
  if (values.length > maxSelect) {
    return `${label}は最大${maxSelect}つまで選択できます。`;
  }

  const hasOther = values.includes(OTHER_OPTION);
  const nonOtherValues = values.filter((value) => value !== OTHER_OPTION);

  for (const value of nonOtherValues) {
    if (!isAllowedOption(value, allowed)) {
      return `${label}の選択が不正です。`;
    }
  }

  return validateOtherText(otherText, hasOther);
}

export function validateContextQuestionnaireInput(
  input: ContextQuestionnaireInput,
): string | null {
  if (!isAllowedOption(input.experienceYears, EXPERIENCE_YEARS_OPTIONS)) {
    return "キャンプ経験年数を選択してください。";
  }
  if (!isAllowedOption(input.annualFrequency, ANNUAL_FREQUENCY_OPTIONS)) {
    return "年間キャンプ回数を選択してください。";
  }

  const companionError = validateMultiSelection(
    input.companions,
    [...COMPANION_OPTIONS, OTHER_OPTION],
    MAX_COMPANION_SELECTIONS,
    "同行者・規模",
    input.companionOther,
  );
  if (companionError) {
    return companionError;
  }

  const transportValues = [...TRANSPORT_OPTIONS, OTHER_OPTION];
  if (!isAllowedOption(input.transport, transportValues)) {
    return "移動手段を選択してください。";
  }
  const transportOtherError = validateOtherText(
    input.transportOther,
    input.transport === OTHER_OPTION,
  );
  if (transportOtherError) {
    return transportOtherError;
  }

  if (!isAllowedOption(input.primarySeason, PRIMARY_SEASON_OPTIONS)) {
    return "よくキャンプする季節を選択してください。";
  }
  if (!isAllowedOption(input.stayDuration, STAY_DURATION_OPTIONS)) {
    return "滞在スタイルを選択してください。";
  }

  const purposeValues = [...PRIMARY_PURPOSE_OPTIONS, OTHER_OPTION];
  if (!isAllowedOption(input.primaryPurpose, purposeValues)) {
    return "キャンプの目的を選択してください。";
  }
  const purposeOtherError = validateOtherText(
    input.primaryPurposeOther,
    input.primaryPurpose === OTHER_OPTION,
  );
  if (purposeOtherError) {
    return purposeOtherError;
  }

  const gearTagError = validateMultiSelection(
    input.gearTags,
    [...GEAR_TAG_OPTIONS, OTHER_OPTION],
    MAX_GEAR_TAG_SELECTIONS,
    "ギア選定の重視点",
    input.gearTagOther,
  );
  if (gearTagError) {
    return gearTagError;
  }

  return null;
}

export function formatOtherAnswerValue(
  otherText: string,
): string {
  return `${OTHER_OPTION}:${otherText.trim()}`;
}

export function parseOtherAnswerValue(value: string): {
  isOther: boolean;
  label: string;
} {
  if (value.startsWith(`${OTHER_OPTION}:`)) {
    return {
      isOther: true,
      label: value.slice(OTHER_OPTION.length + 1),
    };
  }

  return { isOther: value === OTHER_OPTION, label: value };
}
