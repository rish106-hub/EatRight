"use client";

import type { ScoreBreakdown } from "@finish-my-dinner/planner";

type ScoreDimension = keyof Omit<ScoreBreakdown, "total">;

const SCORE_DIMENSIONS: ScoreDimension[] = [
  "mealFit",
  "budgetFit",
  "etaFit",
  "providerReliabilityFit",
  "minimumUsefulPurchaseFit",
  "statedPreferenceFit",
];

const SCORE_LABELS: Record<ScoreDimension, string> = {
  mealFit: "Meal fit",
  budgetFit: "Budget fit",
  etaFit: "Delivery fit",
  providerReliabilityFit: "Source reliability",
  minimumUsefulPurchaseFit: "Portion fit",
  statedPreferenceFit: "Preference fit",
};

function qualitativeLabel(score: number): string {
  if (score >= 80) return "Good";
  if (score >= 60) return "Fair";
  return "Limited";
}

export function WhyThisOptionDisclosure({
  score,
  explanation,
}: {
  score: ScoreBreakdown;
  explanation: string;
}) {
  return (
    <div className="rec-section rec-section--why">
      <span className="rec-section__label">Why this option</span>
      <p className="rec-section__value">{explanation}</p>
      <details className="rec-why-details">
        <summary className="rec-why-details__summary">
          See how it was assessed
        </summary>
        <dl className="rec-score-breakdown">
          {SCORE_DIMENSIONS.map((key) => {
            const label = SCORE_LABELS[key];
            const qualLabel = qualitativeLabel(score[key]);
            return (
              <div key={key} className="rec-score-breakdown__row">
                <dt>{label}</dt>
                <dd
                  aria-label={`${label}: ${qualLabel}`}
                  data-level={qualLabel.toLowerCase()}
                >
                  {qualLabel}
                </dd>
              </div>
            );
          })}
        </dl>
      </details>
    </div>
  );
}
