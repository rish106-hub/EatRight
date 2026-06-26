"use client";

import type { PlannerOutcome } from "@finish-my-dinner/planner";
import type { NoMatchReason } from "@finish-my-dinner/contracts";
import { RecommendationActions } from "./RecommendationActions";
import type { RecommendationActionsProps } from "./RecommendationActions";

type NonReadyOutcome = Exclude<
  PlannerOutcome,
  { status: "RECOMMENDATION_READY" }
>;

interface OutcomeMessageProps extends Omit<
  RecommendationActionsProps,
  "showHandoff"
> {
  outcome: NonReadyOutcome;
}

function noValidCompletionBody(reason: NoMatchReason): string {
  switch (reason) {
    case "OVER_BUDGET":
      return "No options met the current budget. You could try raising the budget or adjusting your constraints.";
    case "NO_VEGETARIAN_MATCH":
      return "No vegetarian-labelled options were found that match. You could try relaxing the diet filter.";
    case "NOT_SERVICEABLE":
      return "No options are available at the selected address in this demo. This doesn't reflect real Swiggy coverage.";
    case "SINGLE_SURFACE_UNAVAILABLE":
      return "One of the sources was unavailable. Options from the other source didn't meet the current constraints.";
    case "PROVIDER_UNAVAILABLE":
      return "One of the sources was temporarily unavailable. You can try again.";
    case "INSUFFICIENT_INFORMATION":
      return "We need more detail about what's at home to find a complement.";
    case "NO_VALID_COMPLETION":
      return "No option met all the current constraints. You could try adjusting your preferences.";
  }
}

function outcomeContent(outcome: NonReadyOutcome): {
  heading: string;
  body: string;
} {
  switch (outcome.status) {
    case "NO_VALID_COMPLETION":
      return {
        heading: "No matching option found",
        body: noValidCompletionBody(outcome.reason),
      };
    case "INSUFFICIENT_INFORMATION":
      return {
        heading: "More information needed",
        body: "We need a bit more detail about what's at home to find a useful complement. Please review and correct your input.",
      };
    case "NO_PURCHASE_REQUIRED":
      return {
        heading: "Looks like you're set",
        body: `You already have ${outcome.homeSummary.join(", ")} at home. This looks like a complete enough dinner for now.`,
      };
    case "UNSERVICEABLE":
      return {
        heading: "Demo address not available",
        body: "The selected demo address isn't covered in this scenario. This does not reflect real Swiggy serviceability.",
      };
    case "BOTH_PROVIDERS_FAILED":
      return {
        heading: "Sources temporarily unavailable",
        body: "The demo couldn't check either source right now. Nothing was ordered and nothing changed. You can try again.",
      };
    case "STANDARD_SWIGGY_HANDOFF_REQUIRED":
      return {
        heading: "You may need a full meal",
        body: "Based on what you described, it looks like you need a full dinner rather than just a complement. Consider a regular Swiggy search.",
      };
  }
}

export function OutcomeMessage({
  outcome,
  onStartOver,
  onCorrectInput,
  onViewWhy,
  onStandardSwiggyHandoff,
}: OutcomeMessageProps) {
  const { heading, body } = outcomeContent(outcome);
  const isHandoff = outcome.status === "STANDARD_SWIGGY_HANDOFF_REQUIRED";
  const isNoPurchase = outcome.status === "NO_PURCHASE_REQUIRED";

  return (
    <section
      className="screen rec-outcome-message"
      aria-labelledby="outcome-message-title"
    >
      <h1 id="outcome-message-title" className="screen-heading" tabIndex={-1}>
        {heading}
      </h1>
      <p className="screen__lead">{body}</p>

      <div className="notice">
        <p className="notice__body">
          This is a read-only demo. Nothing was ordered and no real Swiggy data
          was used.
        </p>
      </div>

      {!isNoPurchase && (
        <RecommendationActions
          onStartOver={onStartOver}
          onCorrectInput={onCorrectInput}
          {...(onViewWhy ? { onViewWhy } : {})}
          {...(onStandardSwiggyHandoff ? { onStandardSwiggyHandoff } : {})}
          showHandoff={isHandoff}
        />
      )}

      {isNoPurchase && (
        <div className="actions">
          <button
            type="button"
            className="button button--quiet"
            onClick={onStartOver}
          >
            Start over
          </button>
        </div>
      )}
    </section>
  );
}
