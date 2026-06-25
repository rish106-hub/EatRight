"use client";

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
}

/**
 * Single-select segmented control built on a fieldset + native radios for full
 * keyboard and screen-reader support. Selection shown by text + check, not
 * colour alone.
 */
export function SegmentedControl<T extends string | number>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="segmented">
      <legend className="segmented__legend">{legend}</legend>
      <div className="segmented__options">
        {options.map((option) => {
          const id = `${name}-${String(option.value)}`;
          const checked = option.value === value;
          return (
            <label key={id} className="segmented__option" htmlFor={id}>
              <input
                id={id}
                type="radio"
                name={name}
                className="visually-hidden"
                checked={checked}
                onChange={() => onChange(option.value)}
              />
              <span className="segmented__pill">
                <span className="segmented__mark" aria-hidden="true">
                  {checked ? "●" : "○"}
                </span>
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
