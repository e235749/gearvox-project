"use client";

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
}

const ratings = [1, 2, 3, 4, 5] as const;

export function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm text-muted">星評価</span>
      <div className="flex gap-2">
        {ratings.map((rating) => {
          const isActive = rating <= value;
          return (
            <button
              key={rating}
              type="button"
              aria-label={`${rating}つ星`}
              onClick={() => onChange(rating)}
              className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "border-accent bg-accent/20 text-accent"
                  : "border-border bg-surface text-muted hover:border-accent/50"
              }`}
            >
              {rating}
            </button>
          );
        })}
      </div>
    </div>
  );
}
