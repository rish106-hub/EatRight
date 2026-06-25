"use client";

/**
 * Labelled numeric input. Emits null when cleared. Optional prefix (₹) / suffix
 * (min). Error wired via aria-describedby + aria-invalid.
 */
export function NumberField({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  min = 0,
  hint,
  errorId,
  invalid,
}: {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  hint?: string;
  errorId?: string;
  invalid?: boolean;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, invalid ? errorId : undefined]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="number-field">
      <label className="number-field__label" htmlFor={id}>
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="number-field__hint">
          {hint}
        </p>
      ) : null}
      <div className="number-field__control">
        {prefix ? (
          <span className="number-field__affix" aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          className="number-field__input"
          min={min}
          value={value ?? ""}
          aria-invalid={invalid ?? false}
          aria-describedby={describedBy.length > 0 ? describedBy : undefined}
          onChange={(event) => {
            const raw = event.target.value;
            onChange(raw === "" ? null : Number(raw));
          }}
        />
        {suffix ? (
          <span className="number-field__affix" aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}
