import {
  ANNUAL_FREQUENCY_OPTIONS,
  COMPANION_OPTIONS,
  CONTEXT_QUESTIONNAIRE_STEPS,
  EXPERIENCE_YEARS_OPTIONS,
  GEAR_TAG_OPTIONS,
  OTHER_OPTION,
  PRIMARY_PURPOSE_OPTIONS,
  PRIMARY_SEASON_OPTIONS,
  STAY_DURATION_OPTIONS,
  TRANSPORT_OPTIONS,
} from "@/constants/context-options";
import { parseOtherAnswerValue } from "@/lib/context/validation";
import type { UserContextSummary } from "@/lib/context/get-user-context";

function formatTransport(summary: UserContextSummary): string {
  if (summary.transport === OTHER_OPTION) {
    return summary.transportOther || OTHER_OPTION;
  }
  return summary.transport;
}

function formatPurpose(summary: UserContextSummary): string {
  if (summary.primaryPurpose === OTHER_OPTION) {
    return summary.primaryPurposeOther || OTHER_OPTION;
  }
  return summary.primaryPurpose;
}

function formatMulti(values: string[]): string {
  return values
    .map((value) => parseOtherAnswerValue(value).label)
    .join("、");
}

export function formatContextSummaryLines(
  summary: UserContextSummary,
): Array<{ label: string; value: string }> {
  if (!summary.isCompleted) {
    return [];
  }

  return [
    { label: "経験年数", value: summary.experienceYears },
    { label: "年間回数", value: summary.annualFrequency },
    {
      label: "同行者・規模",
      value: formatMulti(
        summary.companions.map((value) =>
          value === OTHER_OPTION
            ? `${OTHER_OPTION}:${summary.companionOther}`
            : value,
        ),
      ),
    },
    { label: "移動手段", value: formatTransport(summary) },
    { label: "よく行く季節", value: summary.primarySeason },
    { label: "滞在スタイル", value: summary.stayDuration },
    { label: "キャンプの目的", value: formatPurpose(summary) },
    {
      label: "ギアの重視点",
      value: formatMulti(
        summary.gearTags.map((value) =>
          value === OTHER_OPTION ? `${OTHER_OPTION}:${summary.gearTagOther}` : value,
        ),
      ),
    },
  ];
}

export function getOptionsForStep(stepKey: string): readonly string[] {
  switch (stepKey) {
    case "experience_years":
      return EXPERIENCE_YEARS_OPTIONS;
    case "annual_frequency":
      return ANNUAL_FREQUENCY_OPTIONS;
    case "companions":
      return [...COMPANION_OPTIONS, OTHER_OPTION];
    case "transport":
      return [...TRANSPORT_OPTIONS, OTHER_OPTION];
    case "primary_season":
      return PRIMARY_SEASON_OPTIONS;
    case "stay_duration":
      return STAY_DURATION_OPTIONS;
    case "primary_purpose":
      return [...PRIMARY_PURPOSE_OPTIONS, OTHER_OPTION];
    case "gear_tags":
      return [...GEAR_TAG_OPTIONS, OTHER_OPTION];
    default:
      return [];
  }
}

export function getStepDefinition(stepKey: string) {
  return CONTEXT_QUESTIONNAIRE_STEPS.find((step) => step.key === stepKey);
}
