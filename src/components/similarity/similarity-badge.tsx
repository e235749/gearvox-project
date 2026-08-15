import type { SimilarityDisplay } from "@/lib/similarity/types";

interface SimilarityBadgeProps {
  similarity: SimilarityDisplay | null | undefined;
}

export function SimilarityBadge({ similarity }: SimilarityBadgeProps) {
  if (!similarity) {
    return null;
  }

  return (
    <span
      className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent"
      title={`類似度 ${similarity.percent}%`}
    >
      {similarity.label}
    </span>
  );
}
