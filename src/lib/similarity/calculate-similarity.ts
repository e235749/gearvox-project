import { OTHER_OPTION } from "@/constants/context-options";
import type { ContextQuestionnaireInput } from "@/lib/context/validation";

import type {
  SimilarityDisplay,
  SimilarityLabel,
  UserContextVector,
} from "@/lib/similarity/types";

export function toUserContextVector(
  userId: string,
  input: ContextQuestionnaireInput,
): UserContextVector {
  return {
    userId,
    experienceYears: input.experienceYears.trim(),
    annualFrequency: input.annualFrequency.trim(),
    companions: buildMultiValueSet(input.companions, input.companionOther),
    transport: normalizeSingleValue(input.transport, input.transportOther),
    primarySeason: input.primarySeason.trim(),
    stayDuration: input.stayDuration.trim(),
    primaryPurpose: normalizeSingleValue(
      input.primaryPurpose,
      input.primaryPurposeOther,
    ),
    gearTags: buildMultiValueSet(input.gearTags, input.gearTagOther),
  };
}

function normalizeSingleValue(value: string, otherText: string): string {
  const trimmed = value.trim();

  if (trimmed === OTHER_OPTION) {
    return otherText.trim() ? `other:${otherText.trim()}` : OTHER_OPTION;
  }

  return trimmed;
}

function buildMultiValueSet(values: string[], otherText: string): string[] {
  const items = values
    .filter((value) => value !== OTHER_OPTION)
    .map((value) => value.trim())
    .filter(Boolean);

  if (values.includes(OTHER_OPTION) && otherText.trim()) {
    items.push(`other:${otherText.trim()}`);
  }

  return [...new Set(items)];
}

function singleMatchScore(left: string, right: string): number {
  if (!left || !right) {
    return 0;
  }

  return left === right ? 1 : 0;
}

function jaccardScore(left: string[], right: string[]): number {
  if (left.length === 0 && right.length === 0) {
    return 1;
  }

  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const intersection = [...leftSet].filter((value) => rightSet.has(value)).length;
  const union = new Set([...leftSet, ...rightSet]).size;

  if (union === 0) {
    return 0;
  }

  return intersection / union;
}

export function calculateSimilarityScore(
  left: UserContextVector,
  right: UserContextVector,
): number {
  const dimensionScores = [
    singleMatchScore(left.experienceYears, right.experienceYears),
    singleMatchScore(left.annualFrequency, right.annualFrequency),
    jaccardScore(left.companions, right.companions),
    singleMatchScore(left.transport, right.transport),
    singleMatchScore(left.primarySeason, right.primarySeason),
    singleMatchScore(left.stayDuration, right.stayDuration),
    singleMatchScore(left.primaryPurpose, right.primaryPurpose),
    jaccardScore(left.gearTags, right.gearTags),
  ];

  const total = dimensionScores.reduce((sum, score) => sum + score, 0);
  return total / dimensionScores.length;
}

export function toSimilarityPercent(score: number): number {
  return Math.round(Math.max(0, Math.min(1, score)) * 100);
}

export function getSimilarityLabel(percent: number): SimilarityLabel {
  if (percent >= 70) {
    return "同族かも！";
  }

  if (percent >= 40) {
    return "キャンパーだ！";
  }

  return "新発見！";
}

export function toSimilarityDisplay(score: number): SimilarityDisplay {
  const percent = toSimilarityPercent(score);
  return {
    percent,
    label: getSimilarityLabel(percent),
  };
}

export function normalizeUserPair(
  userIdA: string,
  userIdB: string,
): [string, string] {
  return userIdA < userIdB ? [userIdA, userIdB] : [userIdB, userIdA];
}
