"use client";

import { useId, useMemo, useRef, useState } from "react";

import {
  filterOutdoorBrandLabels,
  resolveOutdoorBrandLabel,
} from "@/lib/gears/outdoor-brands";
import { MAX_GEAR_BRAND_LENGTH } from "@/lib/gears/constants";

interface BrandInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showHint?: boolean;
}

export function BrandInput({
  id,
  value,
  onChange,
  placeholder = "例: スノーピーク / Snow Peak",
  className = "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent",
  showHint = true,
}: BrandInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-suggestions`;
  const [isOpen, setIsOpen] = useState(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(
    () => filterOutdoorBrandLabels(value, 8),
    [value],
  );

  function commit(next: string) {
    onChange(resolveOutdoorBrandLabel(next));
    setIsOpen(false);
  }

  function handleBlur() {
    blurTimerRef.current = setTimeout(() => {
      onChange(resolveOutdoorBrandLabel(value));
      setIsOpen(false);
    }, 120);
  }

  function handleFocus() {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    setIsOpen(true);
  }

  return (
    <div className="relative">
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={isOpen && suggestions.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        value={value}
        maxLength={MAX_GEAR_BRAND_LENGTH}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={className}
      />
      {isOpen && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-background py-1 shadow-lg"
        >
          {suggestions.map((label) => (
            <li key={label} role="option">
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent/10"
                onMouseDown={(event) => {
                  event.preventDefault();
                  commit(label);
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {showHint ? (
        <p className="mt-1 text-xs text-muted">
          候補から選ぶか、自由入力できます。候補に一致すると「日本語 /
          英語」表記に揃えます。
        </p>
      ) : null}
    </div>
  );
}
