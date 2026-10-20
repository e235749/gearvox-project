interface ReviewCountSummaryProps {
  total: number;
  addedThisMonth: number;
}

export function ReviewCountSummary({
  total,
  addedThisMonth,
}: ReviewCountSummaryProps) {
  return (
    <div className="space-y-1">
      <p className="text-5xl font-semibold tracking-tight text-accent">
        {total.toLocaleString("ja-JP")}
        <span className="ml-2 align-baseline text-base font-medium text-foreground">
          件のレビュー
        </span>
      </p>
      <p className="text-xs text-muted">
        今月 +{addedThisMonth.toLocaleString("ja-JP")}
      </p>
    </div>
  );
}
