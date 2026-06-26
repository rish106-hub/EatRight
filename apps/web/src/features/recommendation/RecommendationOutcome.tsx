"use client";

import { plannerOutcomeSchema } from "@finish-my-dinner/planner";
import type { PlannerOutcome } from "@finish-my-dinner/planner";
import { RecommendationCard } from "./RecommendationCard";
import { OutcomeMessage } from "./OutcomeMessage";
import type { RecommendationActionsProps } from "./RecommendationActions";

export interface RecommendationOutcomeProps extends RecommendationActionsProps {
  outcome: unknown;
}

function InvalidOutcomeFallback({ onStartOver }: { onStartOver: () => void }) {
  return (
    <section
      className="screen rec-outcome-message"
      aria-labelledby="rec-error-title"
    >
      <h1 id="rec-error-title" className="screen-heading" tabIndex={-1}>
        Something went wrong
      </h1>
      <p className="screen__lead">
        The result couldn&apos;t be displayed. Nothing was ordered and nothing
        changed.
      </p>
      <div className="notice">
        <p className="notice__body">
          This is a read-only demo. No data was modified.
        </p>
      </div>
      <div className="actions">
        <button
          type="button"
          className="button button--quiet"
          onClick={onStartOver}
        >
          Start over
        </button>
      </div>
    </section>
  );
}

export function RecommendationOutcome({
  outcome,
  onStartOver,
  onCorrectInput,
  onViewWhy,
}: RecommendationOutcomeProps) {
  const parsed = plannerOutcomeSchema.safeParse(outcome);

  if (!parsed.success) {
    return <InvalidOutcomeFallback onStartOver={onStartOver} />;
  }

  const validOutcome: PlannerOutcome = parsed.data;

  if (validOutcome.status === "RECOMMENDATION_READY") {
    return (
      <RecommendationCard
        outcome={validOutcome}
        onStartOver={onStartOver}
        onCorrectInput={onCorrectInput}
        {...(onViewWhy ? { onViewWhy } : {})}
      />
    );
  }

  return (
    <OutcomeMessage
      outcome={validOutcome}
      onStartOver={onStartOver}
      onCorrectInput={onCorrectInput}
      {...(onViewWhy ? { onViewWhy } : {})}
    />
  );
}
