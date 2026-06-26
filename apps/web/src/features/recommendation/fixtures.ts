import { plannerOutcomeSchema } from "@finish-my-dinner/planner";
import type { PlannerOutcome } from "@finish-my-dinner/planner";
import {
  foodCandidateFixture,
  instamartCandidateFixture,
  bothProviderRecommendationFixture,
  foodOnlyRecommendationFixture,
} from "@finish-my-dinner/contracts";

const FOOD_PROVIDER_SUCCESS = {
  provider: "FOOD" as const,
  status: "SUCCESS" as const,
  serviceability: "SERVICEABLE" as const,
  searchedQueryCount: 2,
  candidateCount: 5,
  validCandidateCount: 1,
};

const INSTAMART_PROVIDER_SUCCESS = {
  provider: "INSTAMART" as const,
  status: "SUCCESS" as const,
  serviceability: "SERVICEABLE" as const,
  searchedQueryCount: 2,
  candidateCount: 3,
  validCandidateCount: 1,
};

const INSTAMART_PROVIDER_SKIPPED = {
  provider: "INSTAMART" as const,
  status: "SKIPPED" as const,
  serviceability: "NOT_SERVICEABLE" as const,
  searchedQueryCount: 0,
  candidateCount: 0,
  validCandidateCount: 0,
};

const FOOD_PROVIDER_FAILED = {
  provider: "FOOD" as const,
  status: "FAILURE" as const,
  failureReason: "TIMEOUT" as const,
  serviceability: "SERVICEABLE" as const,
  searchedQueryCount: 0,
  candidateCount: 0,
  validCandidateCount: 0,
};

const INSTAMART_PROVIDER_FAILED = {
  provider: "INSTAMART" as const,
  status: "FAILURE" as const,
  failureReason: "UPSTREAM_ERROR" as const,
  serviceability: "SERVICEABLE" as const,
  searchedQueryCount: 0,
  candidateCount: 0,
  validCandidateCount: 0,
};

function validated(raw: unknown): PlannerOutcome {
  return plannerOutcomeSchema.parse(raw);
}

export const FIXTURE_RECOMMENDATION_READY: PlannerOutcome = validated({
  status: "RECOMMENDATION_READY",
  requestId: "request-rice-curd",
  missingComponent: "NEED_MAIN",
  ruleId: "RICE_CURD_NEEDS_MAIN",
  suggestedAction: "NONE",
  summary: "One read-only completion candidate selected.",
  recommendation: bothProviderRecommendationFixture,
  selectedProvider: "FOOD",
  selectedCandidate: foodCandidateFixture,
  estimatedPriceInr: 180,
  estimatedEtaMinutes: 25,
  score: {
    mealFit: 90,
    budgetFit: 80,
    etaFit: 75,
    providerReliabilityFit: 85,
    minimumUsefulPurchaseFit: 85,
    statedPreferenceFit: 80,
    total: 83,
  },
  providerSummary: {
    FOOD: FOOD_PROVIDER_SUCCESS,
    INSTAMART: INSTAMART_PROVIDER_SUCCESS,
  },
  rejectedCandidates: [],
});

export const FIXTURE_RECOMMENDATION_READY_ONE_PROVIDER_FAILED: PlannerOutcome =
  validated({
    status: "RECOMMENDATION_READY",
    requestId: "request-food-only",
    missingComponent: "NEED_MAIN",
    ruleId: "RICE_CURD_NEEDS_MAIN",
    suggestedAction: "NONE",
    summary: "One read-only completion candidate selected.",
    recommendation: foodOnlyRecommendationFixture,
    selectedProvider: "FOOD",
    selectedCandidate: foodCandidateFixture,
    estimatedPriceInr: 180,
    estimatedEtaMinutes: 25,
    score: {
      mealFit: 85,
      budgetFit: 80,
      etaFit: 75,
      providerReliabilityFit: 70,
      minimumUsefulPurchaseFit: 80,
      statedPreferenceFit: 80,
      total: 78,
    },
    providerSummary: {
      FOOD: FOOD_PROVIDER_SUCCESS,
      INSTAMART: INSTAMART_PROVIDER_FAILED,
    },
    rejectedCandidates: [],
  });

export const FIXTURE_RECOMMENDATION_READY_INSTAMART: PlannerOutcome = validated(
  {
    status: "RECOMMENDATION_READY",
    requestId: "request-dal",
    missingComponent: "NEED_BASE",
    ruleId: "DAL_WITHOUT_BASE",
    suggestedAction: "NONE",
    summary: "One read-only completion candidate selected.",
    recommendation: {
      recommendationId: "recommendation-im-only",
      requestId: "request-dal",
      intent: "COMPLETE_PARTIAL_DINNER",
      homeSummary: ["Dal"],
      missingComponent: "NEED_BASE",
      primary: instamartCandidateFixture,
      explanation: {
        summary: "Adds a base to the dal already available.",
        reasonCodes: [
          "ADDS_MISSING_BASE",
          "SINGLE_SURFACE_MATCH",
          "READ_ONLY_PRICE_ESTIMATE",
        ],
      },
      assumptions: [
        {
          assumptionId: "assumption-dal-enough",
          kind: "HOME_QUANTITY",
          label: "Dal is enough for one person.",
        },
        {
          assumptionId: "assumption-diet-unknown",
          kind: "DIET_PREFERENCE",
          label: "Candidate diet is unknown in provider data.",
        },
      ],
      comparisonStatus: "INSTAMART_ONLY",
      confidence: "MEDIUM",
      rejectedHardConstraints: [],
    },
    selectedProvider: "INSTAMART",
    selectedCandidate: instamartCandidateFixture,
    estimatedPriceInr: 72,
    estimatedEtaMinutes: 15,
    score: {
      mealFit: 80,
      budgetFit: 90,
      etaFit: 90,
      providerReliabilityFit: 70,
      minimumUsefulPurchaseFit: 80,
      statedPreferenceFit: 75,
      total: 81,
    },
    providerSummary: {
      FOOD: INSTAMART_PROVIDER_SKIPPED,
      INSTAMART: INSTAMART_PROVIDER_SUCCESS,
    },
    rejectedCandidates: [],
  },
);

export const FIXTURE_NO_VALID_COMPLETION: PlannerOutcome = validated({
  status: "NO_VALID_COMPLETION",
  requestId: "request-over-budget",
  missingComponent: "NEED_MAIN",
  ruleId: "RICE_CURD_NEEDS_MAIN",
  reason: "OVER_BUDGET",
  suggestedAction: "ADJUST_BUDGET",
  summary: "No candidate passed read-only planner filters.",
  providerSummary: {
    FOOD: FOOD_PROVIDER_SUCCESS,
    INSTAMART: INSTAMART_PROVIDER_SUCCESS,
  },
  rejectedCandidates: [
    {
      candidateId: "candidate-food-rajma",
      provider: "FOOD",
      reasons: ["OVER_BUDGET"],
    },
  ],
});

export const FIXTURE_INSUFFICIENT_INFORMATION: PlannerOutcome = validated({
  status: "INSUFFICIENT_INFORMATION",
  requestId: "request-unknown",
  missingComponent: "INSUFFICIENT_INFORMATION",
  ruleId: "INSUFFICIENT_STRUCTURED_INFORMATION",
  suggestedAction: "EDIT_HOME_STATE",
  summary: "Structured home-food data is insufficient for planning.",
});

export const FIXTURE_NO_PURCHASE_REQUIRED: PlannerOutcome = validated({
  status: "NO_PURCHASE_REQUIRED",
  requestId: "request-complete",
  missingComponent: "INSUFFICIENT_INFORMATION",
  ruleId: "COMPLETE_ENOUGH",
  suggestedAction: "NONE",
  summary: "Structured home-food data already looks complete enough.",
  homeSummary: ["Rice", "Dal", "Curd"],
});

export const FIXTURE_UNSERVICEABLE: PlannerOutcome = validated({
  status: "UNSERVICEABLE",
  requestId: "request-unserviceable",
  missingComponent: "NEED_MAIN",
  ruleId: "RICE_CURD_NEEDS_MAIN",
  suggestedAction: "TRY_ANOTHER_ADDRESS",
  summary: "No read-only provider surface is serviceable for selected address.",
  providerSummary: {
    FOOD: {
      provider: "FOOD" as const,
      status: "SKIPPED" as const,
      serviceability: "NOT_SERVICEABLE" as const,
      searchedQueryCount: 0,
      candidateCount: 0,
      validCandidateCount: 0,
    },
    INSTAMART: {
      provider: "INSTAMART" as const,
      status: "SKIPPED" as const,
      serviceability: "NOT_SERVICEABLE" as const,
      searchedQueryCount: 0,
      candidateCount: 0,
      validCandidateCount: 0,
    },
  },
});

export const FIXTURE_BOTH_PROVIDERS_FAILED: PlannerOutcome = validated({
  status: "BOTH_PROVIDERS_FAILED",
  requestId: "request-both-failed",
  missingComponent: "NEED_MAIN",
  ruleId: "RICE_CURD_NEEDS_MAIN",
  suggestedAction: "TRY_AGAIN",
  summary: "Both read-only provider searches failed.",
  providerSummary: {
    FOOD: FOOD_PROVIDER_FAILED,
    INSTAMART: INSTAMART_PROVIDER_FAILED,
  },
});

export const FIXTURE_STANDARD_SWIGGY_HANDOFF: PlannerOutcome = validated({
  status: "STANDARD_SWIGGY_HANDOFF_REQUIRED",
  requestId: "request-handoff",
  missingComponent: "NEED_COMPLETE_MEAL",
  ruleId: "NOTHING_USEFUL",
  suggestedAction: "STANDARD_SWIGGY_SEARCH",
  summary: "No useful partial dinner component is available.",
});

export const ALL_OUTCOME_FIXTURES = {
  RECOMMENDATION_READY: FIXTURE_RECOMMENDATION_READY,
  RECOMMENDATION_READY_ONE_PROVIDER_FAILED:
    FIXTURE_RECOMMENDATION_READY_ONE_PROVIDER_FAILED,
  RECOMMENDATION_READY_INSTAMART: FIXTURE_RECOMMENDATION_READY_INSTAMART,
  NO_VALID_COMPLETION: FIXTURE_NO_VALID_COMPLETION,
  INSUFFICIENT_INFORMATION: FIXTURE_INSUFFICIENT_INFORMATION,
  NO_PURCHASE_REQUIRED: FIXTURE_NO_PURCHASE_REQUIRED,
  UNSERVICEABLE: FIXTURE_UNSERVICEABLE,
  BOTH_PROVIDERS_FAILED: FIXTURE_BOTH_PROVIDERS_FAILED,
  STANDARD_SWIGGY_HANDOFF_REQUIRED: FIXTURE_STANDARD_SWIGGY_HANDOFF,
} as const satisfies Record<string, PlannerOutcome>;
