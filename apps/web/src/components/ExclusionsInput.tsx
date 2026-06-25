"use client";

import { useState } from "react";
import { isAllowedExclusion } from "@/features/meal-request/validation";

/**
 * Hard-exclusion entry. Adds short safe-text tags (≤12). Rejected entries show
 * an inline message; accepted ones become removable chips.
 */
export function ExclusionsInput({
  values,
  onAdd,
  onRemove,
}: {
  values: readonly string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const atLimit = values.length >= 12;

  function commit() {
    const trimmed = draft.trim();
    if (trimmed === "") {
      return;
    }
    if (!isAllowedExclusion(trimmed)) {
      setError("That can't be added. Use a short food name.");
      return;
    }
    if (values.includes(trimmed)) {
      setDraft("");
      return;
    }
    onAdd(trimmed);
    setDraft("");
    setError(null);
  }

  return (
    <div className="exclusions">
      <label className="exclusions__label" htmlFor="exclusion-input">
        Skip anything? (e.g. mushroom)
      </label>
      <div className="exclusions__row">
        <input
          id="exclusion-input"
          type="text"
          className="exclusions__input"
          value={draft}
          disabled={atLimit}
          aria-invalid={error !== null}
          aria-describedby={error !== null ? "exclusion-error" : undefined}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
          }}
        />
        <button
          type="button"
          className="button button--quiet"
          onClick={commit}
          disabled={atLimit}
        >
          Add
        </button>
      </div>
      {error ? (
        <p id="exclusion-error" className="field-error">
          <span className="field-error__icon" aria-hidden="true">
            !
          </span>
          {error}
        </p>
      ) : null}
      {values.length > 0 ? (
        <ul className="exclusions__list" aria-label="Excluded items">
          {values.map((value) => (
            <li key={value}>
              <button
                type="button"
                className="chip chip--removable"
                onClick={() => onRemove(value)}
              >
                {value}
                <span className="chip__mark" aria-hidden="true">
                  ✕
                </span>
                <span className="visually-hidden">Remove {value}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
