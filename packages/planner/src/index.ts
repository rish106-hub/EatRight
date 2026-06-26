import {
  completionRequestSchema,
  readOnlyRecommendationSchema,
  type AddressServiceabilityContext,
  type CandidateSource,
  type CompletionRequest,
  type ComparisonStatus,
  type ExplanationReason,
  type FoodCandidateSearchPort,
  type InstamartCandidateSearchPort,
  type MissingComponent,
  type NoMatchReason,
  type ProviderFailureReason,
  type ReadOnlyCandidate,
  type ReadOnlyRecommendation,
} from "@finish-my-dinner/contracts";
import { deriveMissingComponent, isNoPurchaseRequired } from "./derive";
import { filterCandidates } from "./filter";
import { queriesForMissingComponent } from "./queries";
import {
  searchProviders,
  type ProviderPorts,
  type SearchConfig,
  type SurfaceSearchResult,
} from "./search";
import {
  plannerInputSchema,
  plannerOutcomeSchema,
  type PlanMealCompletionInput,
  type PlannerOutcome,
  type PlannerSuggestedAction,
  type ProviderSummary,
  type RejectedCandidateSummary,
  type RuleId,
} from "./schema";
import { scoreCandidates } from "./score";

export {
  MISSING_COMPONENT_RULES,
  deriveMissingComponent,
  type MissingComponentDecision,
} from "./derive";
export { queriesForMissingComponent } from "./queries";
export {
  plannerInputSchema,
  plannerOutcomeSchema,
  scoreBreakdownSchema,
  type PlanMealCompletionInput,
  type PlannerOutcome,
  type ProviderSearchSummary,
  type ProviderSummary,
  type RejectedCandidateSummary,
  type RuleId,
  type ScoreBreakdown,
  type ScoredCandidate,
} from "./schema";
export { scoreCandidate, scoreCandidates } from "./score";

export interface PlannerPort {
  plan(input: PlanMealCompletionInput): Promise<PlannerOutcome>;
}

export interface DeterministicPlannerConfig {
  foodPort: FoodCandidateSearchPort;
  instamartPort: InstamartCandidateSearchPort;
  providerTimeoutMs?: number;
  resultLimit?: number;
}

const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  providerTimeoutMs: 2_500,
  resultLimit: 8,
};

export function createDeterministicPlanner(
  config: DeterministicPlannerConfig,
): PlannerPort {
  const ports: ProviderPorts = {
    foodPort: config.foodPort,
    instamartPort: config.instamartPort,
  };
  const searchConfig: SearchConfig = {
    providerTimeoutMs:
      config.providerTimeoutMs ?? DEFAULT_SEARCH_CONFIG.providerTimeoutMs,
    resultLimit: config.resultLimit ?? DEFAULT_SEARCH_CONFIG.resultLimit,
  };

  return {
    plan(input) {
      return planMealCompletion(input, ports, searchConfig);
    },
  };
}

async function planMealCompletion(
  input: PlanMealCompletionInput,
  ports: ProviderPorts,
  searchConfig: SearchConfig,
): Promise<PlannerOutcome> {
  const parsedInput = plannerInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return plannerOutcomeSchema.parse({
      status: "INSUFFICIENT_INFORMATION",
      requestId: "invalid-request",
      missingComponent: "INSUFFICIENT_INFORMATION",
      ruleId: "UNKNOWN_OR_EMPTY",
      suggestedAction: "EDIT_HOME_STATE",
      summary: "Planner input failed runtime validation.",
    });
  }

  const { request, serviceability } = parsedInput.data;
  const requestValidation = completionRequestSchema.safeParse(request);
  if (!requestValidation.success) {
    return plannerOutcomeSchema.parse({
      status: "INSUFFICIENT_INFORMATION",
      requestId: request.requestId,
      missingComponent: "INSUFFICIENT_INFORMATION",
      ruleId: "UNKNOWN_OR_EMPTY",
      suggestedAction: "EDIT_HOME_STATE",
      summary: "Completion request failed runtime validation.",
    });
  }

  const decision = deriveMissingComponent(request);

  if (decision.missingComponent === "INSUFFICIENT_INFORMATION") {
    if (isNoPurchaseRequired(decision)) {
      return noPurchaseRequiredOutcome(request, decision.ruleId);
    }
    return plannerOutcomeSchema.parse({
      status: "INSUFFICIENT_INFORMATION",
      requestId: request.requestId,
      missingComponent: "INSUFFICIENT_INFORMATION",
      ruleId: decision.ruleId,
      suggestedAction: "EDIT_HOME_STATE",
      summary: "Structured home-food data is insufficient for planning.",
    });
  }

  if (decision.missingComponent === "NEED_COMPLETE_MEAL") {
    return plannerOutcomeSchema.parse({
      status: "STANDARD_SWIGGY_HANDOFF_REQUIRED",
      requestId: request.requestId,
      missingComponent: "NEED_COMPLETE_MEAL",
      ruleId: decision.ruleId,
      suggestedAction: "STANDARD_SWIGGY_SEARCH",
      summary: "No useful partial dinner component is available.",
    });
  }

  if (!hasServiceableSurface(serviceability)) {
    return unserviceableOutcome(request, serviceability, decision);
  }

  const queries = queriesForMissingComponent(decision.missingComponent);
  const searchResults = await searchProviders(
    request,
    queries,
    ports,
    searchConfig,
  );
  const rawCandidates = [
    ...searchResults.FOOD.candidates,
    ...searchResults.INSTAMART.candidates,
  ];
  const filtered = filterCandidates(
    rawCandidates,
    request,
    decision.missingComponent,
    serviceability,
  );
  const providerSummary = buildProviderSummary(
    searchResults,
    serviceability,
    filtered.valid,
  );

  if (bothProvidersFailed(providerSummary)) {
    return plannerOutcomeSchema.parse({
      status: "BOTH_PROVIDERS_FAILED",
      requestId: request.requestId,
      missingComponent: decision.missingComponent,
      ruleId: decision.ruleId,
      suggestedAction: "TRY_AGAIN",
      summary: "Both read-only provider searches failed.",
      providerSummary,
    });
  }

  if (filtered.valid.length === 0) {
    return noValidCompletionOutcome(
      request,
      decision.missingComponent,
      decision.ruleId,
      providerSummary,
      filtered.rejected,
    );
  }

  const scoredCandidates = scoreCandidates(
    filtered.valid,
    request,
    decision.missingComponent,
  );
  const selected = scoredCandidates[0];
  if (selected === undefined) {
    return noValidCompletionOutcome(
      request,
      decision.missingComponent,
      decision.ruleId,
      providerSummary,
      filtered.rejected,
    );
  }

  const recommendation = buildRecommendation(
    request,
    decision.missingComponent,
    selected.candidate,
    providerSummary,
    selected.score.total,
    filtered.rejected,
  );

  return plannerOutcomeSchema.parse({
    status: "RECOMMENDATION_READY",
    requestId: request.requestId,
    missingComponent: decision.missingComponent,
    ruleId: decision.ruleId,
    suggestedAction: "NONE",
    summary: "One read-only completion candidate selected.",
    recommendation,
    selectedProvider: selected.candidate.surface,
    selectedCandidate: selected.candidate,
    estimatedPriceInr: selected.candidate.price.amountInr,
    ...(selected.candidate.etaMinutes !== undefined
      ? { estimatedEtaMinutes: selected.candidate.etaMinutes }
      : {}),
    score: selected.score,
    providerSummary,
    rejectedCandidates: filtered.rejected,
  });
}

function noPurchaseRequiredOutcome(
  request: CompletionRequest,
  ruleId: RuleId,
): PlannerOutcome {
  return plannerOutcomeSchema.parse({
    status: "NO_PURCHASE_REQUIRED",
    requestId: request.requestId,
    missingComponent: "INSUFFICIENT_INFORMATION",
    ruleId,
    suggestedAction: "NONE",
    summary: "Structured home-food data already looks complete enough.",
    homeSummary: homeSummary(request),
  });
}

function unserviceableOutcome(
  request: CompletionRequest,
  serviceability: AddressServiceabilityContext,
  decision: { missingComponent: MissingComponent; ruleId: RuleId },
): PlannerOutcome {
  const providerSummary = emptyProviderSummary(serviceability, "SKIPPED");
  return plannerOutcomeSchema.parse({
    status: "UNSERVICEABLE",
    requestId: request.requestId,
    missingComponent: decision.missingComponent,
    ruleId: decision.ruleId,
    suggestedAction: "TRY_ANOTHER_ADDRESS",
    summary:
      "No read-only provider surface is serviceable for selected address.",
    providerSummary,
  });
}

function noValidCompletionOutcome(
  request: CompletionRequest,
  missingComponent: MissingComponent,
  ruleId: RuleId,
  providerSummary: ProviderSummary,
  rejectedCandidates: readonly RejectedCandidateSummary[],
): PlannerOutcome {
  return plannerOutcomeSchema.parse({
    status: "NO_VALID_COMPLETION",
    requestId: request.requestId,
    missingComponent,
    ruleId,
    reason: noMatchReason(rejectedCandidates, providerSummary),
    suggestedAction: suggestedAction(rejectedCandidates),
    summary: "No candidate passed read-only planner filters.",
    providerSummary,
    rejectedCandidates,
  });
}

function buildRecommendation(
  request: CompletionRequest,
  missingComponent: MissingComponent,
  primary: ReadOnlyCandidate,
  providerSummary: ProviderSummary,
  totalScore: number,
  rejectedCandidates: readonly RejectedCandidateSummary[],
): ReadOnlyRecommendation {
  return readOnlyRecommendationSchema.parse({
    recommendationId: stableId(
      "recommendation",
      request.requestId,
      primary.candidateId,
    ),
    requestId: request.requestId,
    intent: "COMPLETE_PARTIAL_DINNER",
    homeSummary: homeSummary(request),
    missingComponent,
    primary,
    explanation: {
      summary: explanationSummary(missingComponent),
      reasonCodes: reasonCodes(missingComponent),
    },
    assumptions: assumptions(request, providerSummary, primary),
    comparisonStatus: comparisonStatus(providerSummary),
    confidence: confidence(totalScore, providerSummary, primary),
    rejectedHardConstraints: rejectedCandidates
      .flatMap((candidate) => candidate.reasons)
      .filter(unique)
      .slice(0, 12),
  });
}

function buildProviderSummary(
  searchResults: Record<CandidateSource, SurfaceSearchResult>,
  serviceability: AddressServiceabilityContext,
  validCandidates: readonly ReadOnlyCandidate[],
): ProviderSummary {
  return {
    FOOD: withValidCount(searchResults.FOOD, serviceability, validCandidates),
    INSTAMART: withValidCount(
      searchResults.INSTAMART,
      serviceability,
      validCandidates,
    ),
  };
}

function withValidCount(
  result: SurfaceSearchResult,
  serviceability: AddressServiceabilityContext,
  validCandidates: readonly ReadOnlyCandidate[],
): ProviderSummary[CandidateSource] {
  return {
    ...result.summary,
    serviceability: serviceability.serviceability[result.provider],
    validCandidateCount: validCandidates.filter(
      (candidate) => candidate.surface === result.provider,
    ).length,
  };
}

function emptyProviderSummary(
  serviceability: AddressServiceabilityContext,
  status: "SKIPPED",
): ProviderSummary {
  return {
    FOOD: {
      provider: "FOOD",
      status,
      serviceability: serviceability.serviceability.FOOD,
      searchedQueryCount: 0,
      candidateCount: 0,
      validCandidateCount: 0,
    },
    INSTAMART: {
      provider: "INSTAMART",
      status,
      serviceability: serviceability.serviceability.INSTAMART,
      searchedQueryCount: 0,
      candidateCount: 0,
      validCandidateCount: 0,
    },
  };
}

function hasServiceableSurface(
  serviceability: AddressServiceabilityContext,
): boolean {
  return Object.values(serviceability.serviceability).some(
    (status) => status === "SERVICEABLE",
  );
}

function bothProvidersFailed(providerSummary: ProviderSummary): boolean {
  return (
    providerSummary.FOOD.status === "FAILURE" &&
    providerSummary.INSTAMART.status === "FAILURE"
  );
}

function comparisonStatus(providerSummary: ProviderSummary): ComparisonStatus {
  const foodValid = providerSummary.FOOD.validCandidateCount > 0;
  const instamartValid = providerSummary.INSTAMART.validCandidateCount > 0;
  if (foodValid && instamartValid) {
    return "BOTH_SURFACES";
  }
  return foodValid ? "FOOD_ONLY" : "INSTAMART_ONLY";
}

function confidence(
  totalScore: number,
  providerSummary: ProviderSummary,
  primary: ReadOnlyCandidate,
): ReadOnlyRecommendation["confidence"] {
  if (
    totalScore >= 80 &&
    comparisonStatus(providerSummary) === "BOTH_SURFACES" &&
    primary.diet !== "UNKNOWN"
  ) {
    return "HIGH";
  }
  if (totalScore >= 60) {
    return "MEDIUM";
  }
  return "LOW";
}

function assumptions(
  request: CompletionRequest,
  providerSummary: ProviderSummary,
  primary: ReadOnlyCandidate,
): ReadOnlyRecommendation["assumptions"] {
  const values: ReadOnlyRecommendation["assumptions"] = [
    {
      assumptionId: stableId("assumption", request.requestId, "quantity"),
      kind: "HOME_QUANTITY",
      label: `Home food quantity is enough for ${request.constraints.servings} serving.`,
    },
  ];

  if (primary.diet === "UNKNOWN") {
    values.push({
      assumptionId: stableId("assumption", request.requestId, "diet"),
      kind: "DIET_PREFERENCE",
      label: "Candidate diet is unknown in provider data.",
    });
  }

  if (
    providerSummary.FOOD.status === "FAILURE" ||
    providerSummary.INSTAMART.status === "FAILURE"
  ) {
    values.push({
      assumptionId: stableId("assumption", request.requestId, "provider"),
      kind: "PROVIDER_DATA",
      label: "Provider comparison is incomplete.",
    });
  }

  return values.slice(0, 6);
}

function homeSummary(request: CompletionRequest): string[] {
  return request.home.components.map((component) =>
    component
      .toLowerCase()
      .split("_")
      .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
      .join(" "),
  );
}

function explanationSummary(missingComponent: MissingComponent): string {
  switch (missingComponent) {
    case "NEED_BASE":
      return "Adds a base to the food already at home.";
    case "NEED_MAIN":
      return "Adds a main dish to the base already at home.";
    case "NEED_PROTEIN":
      return "Adds a protein component to the base already at home.";
    case "NEED_SIDE":
      return "Adds a side to the food already at home.";
    case "NEED_VOLUME":
      return "Adds volume to make leftovers more useful.";
    case "NEED_COMPLETE_MEAL":
      return "Routes to standard search because no useful partial dinner exists.";
    case "INSUFFICIENT_INFORMATION":
      return "Needs more structured home-food information.";
  }
}

function reasonCodes(
  missingComponent: MissingComponent,
): readonly ExplanationReason[] {
  switch (missingComponent) {
    case "NEED_BASE":
      return [
        "ADDS_MISSING_BASE",
        "SINGLE_SURFACE_MATCH",
        "READ_ONLY_PRICE_ESTIMATE",
      ];
    case "NEED_MAIN":
      return [
        "ADDS_MISSING_MAIN",
        "SINGLE_SURFACE_MATCH",
        "READ_ONLY_PRICE_ESTIMATE",
      ];
    case "NEED_PROTEIN":
      return [
        "ADDS_MISSING_PROTEIN",
        "SINGLE_SURFACE_MATCH",
        "READ_ONLY_PRICE_ESTIMATE",
      ];
    case "NEED_SIDE":
      return [
        "ADDS_MISSING_SIDE",
        "SINGLE_SURFACE_MATCH",
        "READ_ONLY_PRICE_ESTIMATE",
      ];
    case "NEED_VOLUME":
      return [
        "ADDS_VOLUME",
        "SINGLE_SURFACE_MATCH",
        "READ_ONLY_PRICE_ESTIMATE",
      ];
    case "NEED_COMPLETE_MEAL":
    case "INSUFFICIENT_INFORMATION":
      return ["SINGLE_SURFACE_MATCH"];
  }
}

function noMatchReason(
  rejectedCandidates: readonly RejectedCandidateSummary[],
  providerSummary: ProviderSummary,
): NoMatchReason {
  if (
    providerSummary.FOOD.serviceability !== "SERVICEABLE" &&
    providerSummary.INSTAMART.serviceability !== "SERVICEABLE"
  ) {
    return "NOT_SERVICEABLE";
  }
  if (
    rejectedCandidates.some((candidate) =>
      candidate.reasons.includes("OVER_BUDGET"),
    )
  ) {
    return "OVER_BUDGET";
  }
  if (
    rejectedCandidates.some((candidate) => candidate.reasons.includes("DIET"))
  ) {
    return "NO_VEGETARIAN_MATCH";
  }
  if (
    providerSummary.FOOD.status === "FAILURE" ||
    providerSummary.INSTAMART.status === "FAILURE"
  ) {
    return "PROVIDER_UNAVAILABLE";
  }
  return "NO_VALID_COMPLETION";
}

function suggestedAction(
  rejectedCandidates: readonly RejectedCandidateSummary[],
): PlannerSuggestedAction {
  if (
    rejectedCandidates.some((candidate) =>
      candidate.reasons.includes("OVER_BUDGET"),
    )
  ) {
    return "ADJUST_BUDGET";
  }
  if (
    rejectedCandidates.some((candidate) =>
      candidate.reasons.includes("OVER_MAX_ETA"),
    )
  ) {
    return "ADJUST_MAX_ETA";
  }
  if (
    rejectedCandidates.some((candidate) => candidate.reasons.includes("DIET"))
  ) {
    return "RELAX_DIET";
  }
  if (
    rejectedCandidates.some((candidate) =>
      candidate.reasons.includes("EXCLUSION"),
    )
  ) {
    return "REMOVE_EXCLUSION";
  }
  return "STANDARD_SWIGGY_SEARCH";
}

function stableId(...parts: readonly string[]): string {
  let hash = 2166136261;
  for (const char of parts.join(":")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `planner-${Math.abs(hash >>> 0).toString(36)}`;
}

function unique<T>(value: T, index: number, values: readonly T[]): boolean {
  return values.indexOf(value) === index;
}

export type { ProviderFailureReason };
