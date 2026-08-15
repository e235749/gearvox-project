"use client";

import Link from "next/link";
import { useState } from "react";

import {
  MAX_REPORT_OTHER_LENGTH,
  REPORT_REASON_OTHER_ID,
  REPORT_REASONS,
} from "@/constants/report-reasons";
import { submitReport } from "@/lib/reports/actions";
import type { ReportTargetType } from "@/lib/reports/types";

interface ReportDialogProps {
  targetType: ReportTargetType;
  targetId: string;
  triggerLabel?: string;
  triggerClassName?: string;
}

export function ReportDialog({
  targetType,
  targetId,
  triggerLabel = "通報",
  triggerClassName = "text-xs text-muted transition-colors hover:text-red-400",
}: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reasonId, setReasonId] = useState("");
  const [otherDetail, setOtherDetail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function handleClose() {
    if (isPending) {
      return;
    }

    setIsOpen(false);
    setReasonId("");
    setOtherDetail("");
    setError(null);
    setSuccessMessage(null);
  }

  function handleOpen() {
    setIsOpen(true);
    setError(null);
    setSuccessMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsPending(true);

    try {
      const result = await submitReport({
        targetType,
        targetId,
        reasonId,
        otherDetail,
      });

      if (!result.success) {
        setError(result.error ?? "通報の送信に失敗しました。");
        return;
      }

      setSuccessMessage("通報を受け付けました。ご協力ありがとうございます。");
      setReasonId("");
      setOtherDetail("");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button type="button" onClick={handleOpen} className={triggerClassName}>
        {triggerLabel}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div
            className="w-full max-w-lg space-y-4 rounded-xl border border-border bg-background p-4 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-dialog-title"
          >
            <header className="space-y-1">
              <h2 id="report-dialog-title" className="text-lg font-medium">
                通報する
              </h2>
              <p className="text-sm text-muted">
                問題のある内容を運営に報告します。虚偽の通報は利用規約違反となる場合があります。
              </p>
            </header>

            {successMessage ? (
              <div className="space-y-4">
                <p className="rounded-lg border border-border bg-surface p-4 text-sm">
                  {successMessage}
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background"
                >
                  閉じる
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">通報理由</legend>
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {REPORT_REASONS.map((reason) => (
                      <label
                        key={reason.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                          reasonId === reason.id
                            ? "border-accent bg-accent/10"
                            : "border-border bg-surface hover:border-accent/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="report_reason"
                          value={reason.id}
                          checked={reasonId === reason.id}
                          onChange={() => setReasonId(reason.id)}
                          className="mt-1 h-4 w-4 accent-accent"
                        />
                        <span>{reason.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {reasonId === REPORT_REASON_OTHER_ID ? (
                  <div className="space-y-2">
                    <label htmlFor="report-other-detail" className="text-sm text-muted">
                      詳細（必須）
                    </label>
                    <textarea
                      id="report-other-detail"
                      value={otherDetail}
                      onChange={(event) => setOtherDetail(event.target.value)}
                      rows={4}
                      maxLength={MAX_REPORT_OTHER_LENGTH}
                      placeholder="具体的な内容を入力してください"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
                    />
                    <p className="text-xs text-muted">
                      {otherDetail.length}/{MAX_REPORT_OTHER_LENGTH}
                    </p>
                  </div>
                ) : null}

                {error ? <p className="text-sm text-red-400">{error}</p> : null}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isPending || !reasonId}
                    className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? "送信中..." : "通報する"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isPending}
                    className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent/50"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

interface ReportLoginPromptProps {
  className?: string;
}

export function ReportLoginPrompt({
  className = "text-xs text-muted",
}: ReportLoginPromptProps) {
  return (
    <p className={className}>
      通報するには
      <Link href="/login" className="mx-1 text-accent hover:underline">
        ログイン
      </Link>
      してください。
    </p>
  );
}
