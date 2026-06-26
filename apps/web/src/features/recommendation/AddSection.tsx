"use client";

import type { ReadOnlyCandidate } from "@finish-my-dinner/contracts";

const SURFACE_LABEL: Record<ReadOnlyCandidate["surface"], string> = {
  FOOD: "Food delivery",
  INSTAMART: "Instamart",
};

export function AddSection({ candidate }: { candidate: ReadOnlyCandidate }) {
  const surfaceLabel = SURFACE_LABEL[candidate.surface];

  return (
    <div className="rec-section rec-section--add">
      <div className="rec-section__header">
        <span className="rec-section__label">Add</span>
        <span className="rec-badge" aria-label={`via ${surfaceLabel}`}>
          {surfaceLabel}
        </span>
      </div>
      <p className="rec-item__name">{candidate.displayName}</p>
      <p className="rec-item__merchant">{candidate.merchantName}</p>
      {candidate.diet === "VEGETARIAN" && (
        <span className="rec-item__diet" aria-label="Vegetarian">
          <span aria-hidden="true">●</span>
          <span className="visually-hidden">Vegetarian</span>
        </span>
      )}
    </div>
  );
}
