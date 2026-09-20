"use client";

import { IconStar, IconStarFilled } from "@tabler/icons-react";

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
}

const ratings = [1, 2, 3, 4, 5] as const;

export function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted">星評価</span>
        <span className="text-xs text-muted">
          {value >= 1 ? `${value}つ星` : "未選択"}
        </span>
      </div>
      <div className="flex gap-1" role="group" aria-label="星評価">
        {ratings.map((rating) => {
          const isActive = rating <= value;

          return (
            <button
              key={rating}
              type="button"
              aria-label={`${rating}つ星`}
              aria-pressed={isActive && rating === value}
              onClick={() => onChange(rating)}
              className="rounded-md p-1.5 transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {isActive ? (
                <IconStarFilled
                  size={28}
                  stroke={1.5}
                  className="text-accent"
                  aria-hidden
                />
              ) : (
                <IconStar
                  size={28}
                  stroke={1.5}
                  className="text-muted/50"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
