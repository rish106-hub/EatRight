"use client";

import type { ProviderSummary } from "@finish-my-dinner/planner";

export function ProviderStatus({
  providerSummary,
  comparisonStatus,
}: {
  providerSummary: ProviderSummary;
  comparisonStatus: "BOTH_SURFACES" | "FOOD_ONLY" | "INSTAMART_ONLY";
}) {
  const foodFailed = providerSummary.FOOD.status === "FAILURE";
  const instamartFailed = providerSummary.INSTAMART.status === "FAILURE";
  const oneProviderFailed = foodFailed !== instamartFailed;

  if (!oneProviderFailed && comparisonStatus === "BOTH_SURFACES") return null;

  let message: string;
  if (foodFailed) {
    message =
      "Food delivery results were unavailable during this search. Recommendation is based on Instamart only.";
  } else if (instamartFailed) {
    message =
      "Instamart results were unavailable during this search. Recommendation is based on food delivery only.";
  } else if (comparisonStatus === "FOOD_ONLY") {
    message = "Only food delivery options were available for comparison.";
  } else {
    message = "Only Instamart options were available for comparison.";
  }

  return (
    <div className="rec-section rec-provider-status" role="note">
      <p className="rec-provider-status__message">{message}</p>
    </div>
  );
}
