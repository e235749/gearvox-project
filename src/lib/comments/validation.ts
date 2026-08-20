import { MAX_COMMENT_LENGTH } from "@/lib/comments/constants";

export function validateCommentBody(body: string): string | null {
  const trimmed = body.trim();

  if (!trimmed) {
    return "コメントを入力してください。";
  }

  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return `コメントは${MAX_COMMENT_LENGTH}文字以内で入力してください。`;
  }

  return null;
}
