import type { AnalyticsEvent } from "./analytics";
import type { ReadOnlyCandidate } from "./candidate";
import type { ProviderSearchResult } from "./provider";
import type { ReadOnlyRecommendation } from "./recommendation";
import type { CompletionRequest } from "./request";

export const fixtureObservedAt = "2026-06-25T12:00:00.000+05:30";

export const riceCurdRequestFixture: CompletionRequest = {
  sessionId: "session-fmd-002",
  requestId: "request-rice-curd",
  addressId: "address-user-selected-1",
  home: {
    components: ["BASE_RICE", "SIDE_CURD"],
    quantityConfidence: "HIGH",
  },
  constraints: {
    servings: 1,
    diet: "VEGETARIAN",
    exclusions: [],
    budgetInr: { max: 250 },
    maxEtaMinutes: 45,
    mealWeight: "REGULAR",
  },
};

export const dalRequestFixture: CompletionRequest = {
  ...riceCurdRequestFixture,
  requestId: "request-dal",
  home: {
    components: ["MAIN_DAL"],
    quantityConfidence: "HIGH",
  },
};

export const insufficientBiryaniRequestFixture: CompletionRequest = {
  ...riceCurdRequestFixture,
  requestId: "request-small-biryani",
  home: {
    components: ["LEFTOVER_SMALL"],
    rawText: "small biryani",
    quantityConfidence: "LOW",
  },
};

export const foodCandidateFixture: ReadOnlyCandidate = {
  candidateId: "candidate-food-rajma",
  surface: "FOOD",
  merchantId: "restaurant-home-plate",
  merchantName: "Home Plate",
  itemId: "item-rajma-450",
  displayName: "Rajma 450 ml",
  quantity: 1,
  price: {
    amountInr: 180,
    status: "ITEM_ESTIMATE",
  },
  etaMinutes: 25,
  availability: "AVAILABLE",
  diet: "VEGETARIAN",
  sourceTrace: {
    provider: "FOOD",
    tool: "search_menu",
    responseRef: "stub-food-response-1",
    observedAt: fixtureObservedAt,
  },
  semanticTags: ["main", "rajma", "curry"],
};

export const instamartCandidateFixture: ReadOnlyCandidate = {
  candidateId: "candidate-im-rotis",
  surface: "INSTAMART",
  merchantName: "Instamart",
  itemId: "item-ready-rotis",
  variantId: "variant-ready-rotis-6",
  displayName: "Ready Rotis Pack of 6",
  quantity: 1,
  price: {
    amountInr: 72,
    status: "ITEM_ESTIMATE",
  },
  etaMinutes: 15,
  availability: "AVAILABLE",
  diet: "VEGETARIAN",
  sourceTrace: {
    provider: "INSTAMART",
    tool: "search_products",
    responseRef: "stub-im-response-1",
    observedAt: fixtureObservedAt,
  },
  semanticTags: ["base", "roti"],
};

export const bothProviderRecommendationFixture: ReadOnlyRecommendation = {
  recommendationId: "recommendation-rice-curd",
  requestId: "request-rice-curd",
  intent: "COMPLETE_PARTIAL_DINNER",
  homeSummary: ["Rice", "Curd"],
  missingComponent: "NEED_MAIN",
  primary: foodCandidateFixture,
  explanation: {
    summary: "Adds a main dish to the rice already available.",
    reasonCodes: [
      "ADDS_MISSING_MAIN",
      "SINGLE_SURFACE_MATCH",
      "READ_ONLY_PRICE_ESTIMATE",
    ],
  },
  assumptions: [
    {
      assumptionId: "assumption-rice-enough",
      kind: "HOME_QUANTITY",
      label: "Rice is enough for one person.",
    },
  ],
  comparisonStatus: "BOTH_SURFACES",
  confidence: "HIGH",
  rejectedHardConstraints: [],
};

export const foodOnlyRecommendationFixture: ReadOnlyRecommendation = {
  ...bothProviderRecommendationFixture,
  recommendationId: "recommendation-food-only",
  comparisonStatus: "FOOD_ONLY",
};

export const instamartOnlyRecommendationFixture: ReadOnlyRecommendation = {
  ...bothProviderRecommendationFixture,
  recommendationId: "recommendation-im-only",
  requestId: "request-dal",
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
  comparisonStatus: "INSTAMART_ONLY",
};

export const oneProviderFailureFixture: ProviderSearchResult = {
  status: "FAILURE",
  failure: {
    provider: "FOOD",
    reason: "TIMEOUT",
    retryable: true,
    message: "Food did not respond within the read-only search budget.",
  },
  searchedAt: fixtureObservedAt,
};

export const bothProviderFailureFixture: ProviderSearchResult[] = [
  oneProviderFailureFixture,
  {
    status: "FAILURE",
    failure: {
      provider: "INSTAMART",
      reason: "UPSTREAM_ERROR",
      retryable: true,
      message: "Instamart search is unavailable right now.",
    },
    searchedAt: fixtureObservedAt,
  },
];

export const noValidCompletionFixture = {
  status: "NO_MATCH",
  requestId: "request-rice-curd",
  missingComponent: "NEED_MAIN",
  reason: "NO_VALID_COMPLETION",
  message: "No single-surface option completed this dinner.",
  safeNextAction: "Adjust one constraint or use standard search.",
} as const;

export const safeAnalyticsEventFixture: AnalyticsEvent = {
  name: "recommendation_generated",
  eventId: "event-recommendation-generated",
  sessionId: "session-fmd-002",
  occurredAtMs: 1782388800000,
  payload: {
    recommendationId: "recommendation-rice-curd",
    provider: "FOOD",
    priceStatus: "ITEM_ESTIMATE",
  },
};
