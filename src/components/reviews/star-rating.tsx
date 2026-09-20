import { IconStar, IconStarFilled } from "@tabler/icons-react";

const MAX_RATING = 5;

const SIZE_PX = {
  sm: 14,
  md: 18,
} as const;

export type StarRatingSize = keyof typeof SIZE_PX;

interface StarRatingProps {
  value: number;
  size?: StarRatingSize;
  className?: string;
}

/**
 * 整数評価（1〜5）の読み取り専用星表示。
 * 平均など小数の表示には使わない。
 */
export function StarRating({
  value,
  size = "sm",
  className = "",
}: StarRatingProps) {
  const rating = Math.min(
    MAX_RATING,
    Math.max(0, Math.round(Number.isFinite(value) ? value : 0)),
  );
  const iconSize = SIZE_PX[size];

  return (
    <div
      role="img"
      aria-label={`${rating}つ星（5点満点）`}
      className={`inline-flex items-center gap-0.5 ${className}`}
    >
      {Array.from({ length: MAX_RATING }, (_, index) => {
        const filled = index < rating;
        const Icon = filled ? IconStarFilled : IconStar;

        return (
          <Icon
            key={index}
            size={iconSize}
            stroke={1.5}
            className={filled ? "text-accent" : "text-muted/50"}
            aria-hidden
          />
        );
      })}
    </div>
  );
}
