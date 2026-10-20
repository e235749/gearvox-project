import { OTHER_OPTION } from "@/constants/context-options";
import { parseOtherAnswerValue } from "@/lib/context/validation";

/** 一覧カードに出すタグ数 */
export const REVIEW_CONTEXT_TAG_PREVIEW_LIMIT = 3;

function textOrNull(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed || null;
}

function labelOrNull(value: string | null, other: string | null): string | null {
  if (!value) {
    return null;
  }
  if (value === OTHER_OPTION) {
    return other;
  }
  const label = parseOtherAnswerValue(value).label.trim();
  if (!label || label === OTHER_OPTION) {
    return null;
  }
  return label;
}

/**
 * レビューの context_snapshot から、今回のキャンプ状況タグを取り出す。
 * 同行者、目的、滞在、移動の順。経験・頻度・ギアの好みは含めない。
 */
export function contextTagsFromSnapshot(snapshot: unknown): string[] {
  if (!snapshot || typeof snapshot !== "object") {
    return [];
  }

  const row = snapshot as Record<string, unknown>;
  const tags: string[] = [];

  if (Array.isArray(row.companions)) {
    for (const item of row.companions) {
      const label = labelOrNull(textOrNull(item), null);
      if (label) {
        tags.push(label);
      }
    }
  }

  const purpose = labelOrNull(
    textOrNull(row.primary_purpose),
    textOrNull(row.primary_purpose_other),
  );
  if (purpose) {
    tags.push(purpose);
  }

  const stay = textOrNull(row.stay_duration);
  if (stay) {
    tags.push(stay);
  }

  const transport = labelOrNull(
    textOrNull(row.transport),
    textOrNull(row.transport_other),
  );
  if (transport) {
    tags.push(transport);
  }

  return tags;
}
