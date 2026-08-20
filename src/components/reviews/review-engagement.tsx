"use client";

import Link from "next/link";
import { useState } from "react";

import { MAX_COMMENT_LENGTH } from "@/lib/comments/constants";
import type { ReviewComment } from "@/lib/comments/types";
import {
  fetchReviewComments,
  postReviewComment,
  toggleReviewLike,
} from "@/lib/reviews/engagement-actions";
import { formatReviewDate } from "@/lib/reviews/format-review-label";
import type { ReviewEngagementSummary } from "@/lib/reviews/engagement-types";
import { ReportDialog } from "@/components/reports/report-dialog";

interface ReviewEngagementProps {
  reviewId: string;
  engagement: ReviewEngagementSummary;
  currentUserId: string | null;
}

export function ReviewEngagement({
  reviewId,
  engagement,
  currentUserId,
}: ReviewEngagementProps) {
  const [isLiked, setIsLiked] = useState(engagement.isLikedByUser);
  const [likeCount, setLikeCount] = useState(engagement.likeCount);
  const [commentCount, setCommentCount] = useState(engagement.commentCount);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<ReviewComment[] | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [isPendingLike, setIsPendingLike] = useState(false);
  const [isPendingComment, setIsPendingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadComments() {
    setIsLoadingComments(true);
    setError(null);

    try {
      const result = await fetchReviewComments(reviewId);

      if (!result.success) {
        setError(result.error ?? "コメントの取得に失敗しました。");
        return;
      }

      setComments(result.comments ?? []);
    } finally {
      setIsLoadingComments(false);
    }
  }

  async function handleToggleComments() {
    const nextOpen = !isCommentsOpen;
    setIsCommentsOpen(nextOpen);
    setError(null);

    if (nextOpen && comments === null) {
      await loadComments();
    }
  }

  async function handleLike() {
    if (!currentUserId) {
      setError("いいねするにはログインが必要です。");
      return;
    }

    setError(null);
    setIsPendingLike(true);

    const previousLiked = isLiked;
    const previousCount = likeCount;
    setIsLiked(!previousLiked);
    setLikeCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1);

    try {
      const result = await toggleReviewLike(reviewId);

      if (!result.success) {
        setIsLiked(previousLiked);
        setLikeCount(previousCount);
        setError(result.error ?? "いいねの更新に失敗しました。");
        return;
      }

      if (typeof result.isLiked === "boolean") {
        setIsLiked(result.isLiked);
      }

      if (typeof result.likeCount === "number") {
        setLikeCount(result.likeCount);
      }
    } finally {
      setIsPendingLike(false);
    }
  }

  async function handleSubmitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUserId) {
      setError("コメントするにはログインが必要です。");
      return;
    }

    setError(null);
    setIsPendingComment(true);

    try {
      const result = await postReviewComment(reviewId, commentBody);

      if (!result.success || !result.comment) {
        setError(result.error ?? "コメントの投稿に失敗しました。");
        return;
      }

      setComments((current) => [...(current ?? []), result.comment!]);
      setCommentBody("");

      if (typeof result.commentCount === "number") {
        setCommentCount(result.commentCount);
      } else {
        setCommentCount((current) => current + 1);
      }
    } finally {
      setIsPendingComment(false);
    }
  }

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleLike}
          disabled={isPendingLike}
          className={`rounded-full border px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isLiked
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted hover:border-accent/50 hover:text-accent"
          }`}
        >
          {isLiked ? "いいね済み" : "いいね"}
          {likeCount > 0 ? ` (${likeCount})` : ""}
        </button>
        <button
          type="button"
          onClick={handleToggleComments}
          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
            isCommentsOpen
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted hover:border-accent/50 hover:text-accent"
          }`}
        >
          コメント
          {commentCount > 0 ? ` (${commentCount})` : ""}
        </button>
      </div>

      {isCommentsOpen ? (
        <div className="space-y-3 rounded-lg border border-border bg-background p-3">
          {isLoadingComments ? (
            <p className="text-xs text-muted">コメントを読み込み中...</p>
          ) : comments && comments.length > 0 ? (
            <ul className="space-y-3">
              {comments.map((comment) => (
                <li key={comment.id} className="space-y-1 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <Link
                        href={`/users/${comment.author.id}`}
                        className="font-medium text-foreground transition-colors hover:text-accent"
                      >
                        {comment.author.display_name}
                      </Link>
                      <span>{formatReviewDate(comment.created_at)}</span>
                    </div>
                    {currentUserId && currentUserId !== comment.author.id ? (
                      <ReportDialog
                        targetType="comment"
                        targetId={comment.id}
                        triggerLabel="通報"
                      />
                    ) : null}
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {comment.body}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted">まだコメントはありません。</p>
          )}

          {currentUserId ? (
            <form onSubmit={handleSubmitComment} className="space-y-2">
              <textarea
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                rows={3}
                maxLength={MAX_COMMENT_LENGTH}
                placeholder="コメントを入力..."
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted">
                  {commentBody.length}/{MAX_COMMENT_LENGTH}
                </p>
                <button
                  type="submit"
                  disabled={isPendingComment || !commentBody.trim()}
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPendingComment ? "投稿中..." : "投稿する"}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-muted">
              コメントするには
              <Link href="/login" className="mx-1 text-accent hover:underline">
                ログイン
              </Link>
              してください。
            </p>
          )}
        </div>
      ) : null}

      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
