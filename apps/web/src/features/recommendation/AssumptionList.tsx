"use client";

import type { Assumption } from "@finish-my-dinner/contracts";

export function AssumptionList({
  assumptions,
  onCorrectInput,
}: {
  assumptions: readonly Assumption[];
  onCorrectInput?: () => void;
}) {
  if (assumptions.length === 0) return null;

  return (
    <div className="rec-section rec-section--assumptions">
      <span className="rec-section__label">Assumptions</span>
      <ul className="rec-assumptions" role="list">
        {assumptions.map((a) => (
          <li key={a.assumptionId} className="rec-assumption">
            <p className="rec-assumption__text">{a.label}</p>
          </li>
        ))}
      </ul>
      {onCorrectInput && (
        <button
          type="button"
          className="button button--quiet rec-assumptions__correct"
          onClick={onCorrectInput}
        >
          Correct an assumption
        </button>
      )}
    </div>
  );
}
