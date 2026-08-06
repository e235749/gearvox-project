"use client";

interface OptionChipProps {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function OptionChip({
  label,
  selected,
  disabled = false,
  onClick,
}: OptionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border px-4 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-surface text-foreground hover:border-accent/50"
      }`}
    >
      {label}
    </button>
  );
}
