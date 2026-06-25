"use client";

/**
 * Selectable chip. Real button with aria-pressed so state reaches AT without
 * relying on colour. 44px min target enforced in CSS.
 */
export function ChipToggle({
  label,
  pressed,
  onToggle,
}: {
  label: string;
  pressed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="chip"
      aria-pressed={pressed}
      onClick={onToggle}
    >
      <span className="chip__mark" aria-hidden="true">
        {pressed ? "✓" : "+"}
      </span>
      {label}
    </button>
  );
}
