"use client";

export interface RecommendationActionsProps {
  onStartOver: () => void;
  onCorrectInput: () => void;
  onViewWhy?: () => void;
}

export function RecommendationActions({
  onStartOver,
  onCorrectInput,
  onViewWhy,
}: RecommendationActionsProps) {
  return (
    <div className="actions rec-actions">
      <button
        type="button"
        className="button button--quiet"
        onClick={onCorrectInput}
      >
        Correct input
      </button>
      {onViewWhy && (
        <button
          type="button"
          className="button button--quiet"
          onClick={onViewWhy}
        >
          Why this option?
        </button>
      )}
      <button
        type="button"
        className="button button--quiet"
        onClick={onStartOver}
      >
        Start over
      </button>
    </div>
  );
}
