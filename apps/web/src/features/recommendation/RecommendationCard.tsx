"use client";

import { useEffect, useRef } from "react";
import type { PlannerOutcome } from "@finish-my-dinner/planner";
import { AtHomeSection } from "./AtHomeSection";
import { AddSection } from "./AddSection";
import { EstimateSummary } from "./EstimateSummary";
import { AssumptionList } from "./AssumptionList";
import { ProviderStatus } from "./ProviderStatus";
import { WhyThisOptionDisclosure } from "./WhyThisOptionDisclosure";
import { RecommendationActions } from "./RecommendationActions";
import type { RecommendationActionsProps } from "./RecommendationActions";

type ReadyOutcome = Extract<PlannerOutcome, { status: "RECOMMENDATION_READY" }>;

interface RecommendationCardProps extends Omit<
  RecommendationActionsProps,
  "showHandoff" | "onStandardSwiggyHandoff"
> {
  outcome: ReadyOutcome;
}

export function RecommendationCard({
  outcome,
  onStartOver,
  onCorrectInput,
  onViewWhy,
}: RecommendationCardProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const {
    recommendation,
    selectedCandidate,
    estimatedPriceInr,
    estimatedEtaMinutes,
    score,
    providerSummary,
  } = outcome;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section
      className="screen rec-card-screen"
      aria-labelledby="rec-card-title"
    >
      <h1
        id="rec-card-title"
        className="screen-heading"
        tabIndex={-1}
        ref={headingRef}
      >
        Here&apos;s what to add
      </h1>

      <article className="rec-card" aria-label="Dinner recommendation">
        <AtHomeSection items={recommendation.homeSummary} />

        <div
          className="rec-card__divider"
          role="separator"
          aria-hidden="true"
        />

        <AddSection candidate={selectedCandidate} />

        <div
          className="rec-card__divider"
          role="separator"
          aria-hidden="true"
        />

        <WhyThisOptionDisclosure
          score={score}
          explanation={recommendation.explanation.summary}
        />

        <AssumptionList
          assumptions={recommendation.assumptions}
          onCorrectInput={onCorrectInput}
        />

        <EstimateSummary
          priceInr={estimatedPriceInr}
          {...(estimatedEtaMinutes !== undefined
            ? { etaMinutes: estimatedEtaMinutes }
            : {})}
        />

        <ProviderStatus
          providerSummary={providerSummary}
          comparisonStatus={recommendation.comparisonStatus}
        />
      </article>

      <div className="notice">
        <p className="notice__body">
          This is a read-only demo. Nothing was ordered. Price and ETA are
          estimates only.
        </p>
      </div>

      <RecommendationActions
        onStartOver={onStartOver}
        onCorrectInput={onCorrectInput}
        {...(onViewWhy ? { onViewWhy } : {})}
      />
    </section>
  );
}
