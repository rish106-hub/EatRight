"use client";

export interface RecommendationActionsProps {
  onStartOver: () => void;
  onCorrectInput: () => void;
  onViewWhy?: () => void;
  onStandardSwiggyHandoff?: () => void;
  showHandoff?: boolean;
}

export function RecommendationActions({
  onStartOver,
  onCorrectInput,
  onViewWhy,
  onStandardSwiggyHandoff,
  showHandoff = false,
}: RecommendationActionsProps) {
  return (
    <div className="actions rec-actions">
      {showHandoff && onStandardSwiggyHandoff && (
        <button
          type="button"
          className="button button--primary"
          onClick={onStandardSwiggyHandoff}
        >
          Search on Swiggy
        </button>
      )}
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
