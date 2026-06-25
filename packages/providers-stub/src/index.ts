import {
  addressServiceabilityContextSchema,
  inferMissingComponent,
  normalisationInputSchema,
  providerHealthStateSchema,
  providerSearchRequestSchema,
  providerSearchResultSchema,
  readOnlyCandidateSchema,
  readOnlyRecommendationSchema,
  recommendationSearchResultSchema,
  type AddressServiceabilityContext,
  type CandidateSource,
  type FoodCandidateSearchPort,
  type InstamartCandidateSearchPort,
  type MissingComponent,
  type NormalisationInput,
  type ProviderFailure,
  type ProviderFailureReason,
  type ProviderHealthPort,
  type ProviderHealthState,
  type ProviderSearchRequest,
  type ProviderSearchResult,
  type ReadOnlyCandidate,
  type ReadOnlyRecommendation,
  type RecommendationSearchResult,
  type ServiceabilityStatus,
} from "@finish-my-dinner/contracts";

const observedAt = "2026-06-25T12:00:00.000+05:30";

export const STUB_SCENARIO_IDS = [
  "rice_curd_food_main",
  "rice_curd_instamart_main",
  "dal_base",
  "rotis_main",
  "insufficient_biryani_volume",
  "food_only",
  "instamart_only",
  "both_provider",
  "food_failure_instamart_success",
  "instamart_failure_food_success",
  "both_provider_failure",
  "no_valid_completion",
  "unserviceable",
  "over_budget_filtered",
  "dietary_violation_filtered",
  "deterministic_repeated_output",
] as const;

export type StubScenarioId = (typeof STUB_SCENARIO_IDS)[number];

export interface StubProviderFailureConfig {
  reason: ProviderFailureReason;
  retryable?: boolean;
  message?: string;
}

export interface StubProvidersConfig {
  seed?: string;
  scenario?: StubScenarioId;
  latencyMs?: number | Partial<Record<CandidateSource, number>>;
  failures?: Partial<Record<CandidateSource, StubProviderFailureConfig>>;
  serviceability?: Partial<Record<CandidateSource, ServiceabilityStatus>>;
  health?: Partial<Record<CandidateSource, ProviderHealthState>>;
}

export interface StubProviders {
  food: FoodCandidateSearchPort;
  instamart: InstamartCandidateSearchPort;
  normaliser: StubCandidateNormaliser;
  serviceability: StubServiceabilityAdapter;
  health: ProviderHealthPort;
}

export interface StubScenarioRun {
  scenario: StubScenarioId;
  request: ProviderSearchRequest;
  serviceability: AddressServiceabilityContext;
  health: Record<CandidateSource, ProviderHealthState>;
  providerResults: Record<CandidateSource, ProviderSearchResult>;
  outcome: RecommendationSearchResult;
}

interface ScenarioDefinition {
  request: ProviderSearchRequest;
  food: ReadOnlyCandidate[];
  instamart: ReadOnlyCandidate[];
  failures?: Partial<Record<CandidateSource, StubProviderFailureConfig>>;
  serviceability?: Partial<Record<CandidateSource, ServiceabilityStatus>>;
  noMatchReason?: RecommendationSearchResult extends infer Result
    ? Result extends { status: "NO_MATCH"; reason: infer Reason }
      ? Reason
      : never
    : never;
}

const baseRequest = {
  sessionId: "session-fmd-004",
  addressId: "address-user-selected-stub",
  constraints: {
    servings: 1,
    diet: "VEGETARIAN",
    exclusions: [],
    budgetInr: { max: 250 },
    maxEtaMinutes: 45,
    mealWeight: "REGULAR",
  },
} as const;

const requests = {
  riceCurd: providerSearchRequestSchema.parse({
    request: {
      ...baseRequest,
      requestId: "request-rice-curd",
      home: {
        components: ["BASE_RICE", "SIDE_CURD"],
        quantityConfidence: "HIGH",
      },
    },
    query: "main for rice curd",
    limit: 8,
  }),
  dal: providerSearchRequestSchema.parse({
    request: {
      ...baseRequest,
      requestId: "request-dal",
      home: {
        components: ["MAIN_DAL"],
        quantityConfidence: "HIGH",
      },
    },
    query: "base for dal",
    limit: 8,
  }),
  rotis: providerSearchRequestSchema.parse({
    request: {
      ...baseRequest,
      requestId: "request-rotis",
      home: {
        components: ["BASE_ROTI"],
        quantityConfidence: "HIGH",
      },
    },
    query: "main for rotis",
    limit: 8,
  }),
  biryani: providerSearchRequestSchema.parse({
    request: {
      ...baseRequest,
      requestId: "request-small-biryani",
      home: {
        components: ["LEFTOVER_SMALL"],
        rawText: "small biryani",
        quantityConfidence: "LOW",
      },
    },
    query: "side volume for biryani",
    limit: 8,
  }),
  noMatch: providerSearchRequestSchema.parse({
    request: {
      ...baseRequest,
      requestId: "request-no-match",
      home: {
        components: ["UNKNOWN"],
        quantityConfidence: "LOW",
      },
    },
    query: "unknown dinner",
    limit: 8,
  }),
} satisfies Record<string, ProviderSearchRequest>;

function candidate(
  values: Omit<ReadOnlyCandidate, "quantity" | "price" | "availability"> & {
    amountInr: number;
    quantity?: number;
    availability?: ReadOnlyCandidate["availability"];
  },
): ReadOnlyCandidate {
  const { amountInr, ...candidateValues } = values;
  return readOnlyCandidateSchema.parse({
    quantity: 1,
    availability: "AVAILABLE",
    price: {
      amountInr,
      status: "ITEM_ESTIMATE",
    },
    ...candidateValues,
  });
}

const candidates = {
  foodRajma: candidate({
    candidateId: "stub-food-rajma",
    surface: "FOOD",
    merchantId: "stub-merchant-home-plate",
    merchantName: "Home Plate Stub",
    itemId: "stub-item-rajma",
    displayName: "Rajma Bowl",
    amountInr: 180,
    etaMinutes: 25,
    diet: "VEGETARIAN",
    sourceTrace: {
      provider: "FOOD",
      tool: "stub_food_search",
      responseRef: "stub-food-rice-curd-main",
      observedAt,
    },
    semanticTags: ["main", "rajma", "curry"],
  }),
  imDal: candidate({
    candidateId: "stub-im-ready-dal",
    surface: "INSTAMART",
    merchantName: "Instamart Stub",
    itemId: "stub-item-ready-dal",
    variantId: "stub-variant-ready-dal",
    displayName: "Ready Dal Bowl",
    amountInr: 119,
    etaMinutes: 14,
    diet: "VEGETARIAN",
    sourceTrace: {
      provider: "INSTAMART",
      tool: "stub_instamart_search",
      responseRef: "stub-im-rice-curd-main",
      observedAt,
    },
    semanticTags: ["main", "dal", "ready-to-eat"],
  }),
  imRotis: candidate({
    candidateId: "stub-im-rotis",
    surface: "INSTAMART",
    merchantName: "Instamart Stub",
    itemId: "stub-item-rotis",
    variantId: "stub-variant-rotis-six",
    displayName: "Ready Rotis Pack of 6",
    amountInr: 72,
    etaMinutes: 12,
    diet: "VEGETARIAN",
    sourceTrace: {
      provider: "INSTAMART",
      tool: "stub_instamart_search",
      responseRef: "stub-im-dal-base",
      observedAt,
    },
    semanticTags: ["base", "roti"],
  }),
  imRice: candidate({
    candidateId: "stub-im-microwave-rice",
    surface: "INSTAMART",
    merchantName: "Instamart Stub",
    itemId: "stub-item-microwave-rice",
    displayName: "Microwave Rice Bowl",
    amountInr: 95,
    etaMinutes: 15,
    diet: "VEGETARIAN",
    sourceTrace: {
      provider: "INSTAMART",
      tool: "stub_instamart_search",
      responseRef: "stub-im-dal-rice",
      observedAt,
    },
    semanticTags: ["base", "rice"],
  }),
  foodPaneer: candidate({
    candidateId: "stub-food-paneer",
    surface: "FOOD",
    merchantId: "stub-merchant-curry-house",
    merchantName: "Curry House Stub",
    itemId: "stub-item-paneer",
    displayName: "Paneer Curry",
    amountInr: 210,
    etaMinutes: 28,
    diet: "VEGETARIAN",
    sourceTrace: {
      provider: "FOOD",
      tool: "stub_food_search",
      responseRef: "stub-food-rotis-main",
      observedAt,
    },
    semanticTags: ["main", "paneer", "curry"],
  }),
  imSabzi: candidate({
    candidateId: "stub-im-sabzi",
    surface: "INSTAMART",
    merchantName: "Instamart Stub",
    itemId: "stub-item-ready-sabzi",
    displayName: "Ready Sabzi Bowl",
    amountInr: 135,
    etaMinutes: 16,
    diet: "VEGETARIAN",
    sourceTrace: {
      provider: "INSTAMART",
      tool: "stub_instamart_search",
      responseRef: "stub-im-rotis-main",
      observedAt,
    },
    semanticTags: ["main", "sabzi", "ready-to-eat"],
  }),
  foodRaita: candidate({
    candidateId: "stub-food-raita",
    surface: "FOOD",
    merchantId: "stub-merchant-biryani-side",
    merchantName: "Biryani Side Stub",
    itemId: "stub-item-raita",
    displayName: "Raita and Salad Side",
    amountInr: 90,
    etaMinutes: 20,
    diet: "VEGETARIAN",
    sourceTrace: {
      provider: "FOOD",
      tool: "stub_food_search",
      responseRef: "stub-food-biryani-volume",
      observedAt,
    },
    semanticTags: ["side", "volume", "raita"],
  }),
  foodChicken: candidate({
    candidateId: "stub-food-chicken",
    surface: "FOOD",
    merchantId: "stub-merchant-protein",
    merchantName: "Protein Stub",
    itemId: "stub-item-chicken",
    displayName: "Chicken Curry",
    amountInr: 220,
    etaMinutes: 25,
    diet: "NON_VEGETARIAN",
    sourceTrace: {
      provider: "FOOD",
      tool: "stub_food_search",
      responseRef: "stub-food-diet-filter",
      observedAt,
    },
    semanticTags: ["main", "protein", "chicken"],
  }),
  expensivePaneer: candidate({
    candidateId: "stub-food-expensive-paneer",
    surface: "FOOD",
    merchantId: "stub-merchant-premium",
    merchantName: "Premium Curry Stub",
    itemId: "stub-item-expensive-paneer",
    displayName: "Premium Paneer Curry",
    amountInr: 420,
    etaMinutes: 30,
    diet: "VEGETARIAN",
    sourceTrace: {
      provider: "FOOD",
      tool: "stub_food_search",
      responseRef: "stub-food-budget-filter",
      observedAt,
    },
    semanticTags: ["main", "paneer", "curry"],
  }),
} satisfies Record<string, ReadOnlyCandidate>;

const scenarioDefinitions: Record<StubScenarioId, ScenarioDefinition> = {
  rice_curd_food_main: {
    request: requests.riceCurd,
    food: [candidates.foodRajma],
    instamart: [],
  },
  rice_curd_instamart_main: {
    request: requests.riceCurd,
    food: [],
    instamart: [candidates.imDal],
  },
  dal_base: {
    request: requests.dal,
    food: [],
    instamart: [candidates.imRotis, candidates.imRice],
  },
  rotis_main: {
    request: requests.rotis,
    food: [candidates.foodPaneer],
    instamart: [candidates.imSabzi],
  },
  insufficient_biryani_volume: {
    request: requests.biryani,
    food: [candidates.foodRaita],
    instamart: [],
  },
  food_only: {
    request: requests.rotis,
    food: [candidates.foodPaneer],
    instamart: [],
  },
  instamart_only: {
    request: requests.dal,
    food: [],
    instamart: [candidates.imRotis],
  },
  both_provider: {
    request: requests.riceCurd,
    food: [candidates.foodRajma],
    instamart: [candidates.imDal],
  },
  food_failure_instamart_success: {
    request: requests.dal,
    food: [],
    instamart: [candidates.imRotis],
    failures: {
      FOOD: {
        reason: "TIMEOUT",
        retryable: true,
        message: "Food stub timed out before read-only search completed.",
      },
    },
  },
  instamart_failure_food_success: {
    request: requests.rotis,
    food: [candidates.foodPaneer],
    instamart: [],
    failures: {
      INSTAMART: {
        reason: "UPSTREAM_ERROR",
        retryable: true,
        message: "Instamart stub returned a read-only upstream error.",
      },
    },
  },
  both_provider_failure: {
    request: requests.riceCurd,
    food: [],
    instamart: [],
    failures: {
      FOOD: {
        reason: "TIMEOUT",
        retryable: true,
        message: "Food stub timed out before read-only search completed.",
      },
      INSTAMART: {
        reason: "SERVICE_UNAVAILABLE",
        retryable: true,
        message: "Instamart stub unavailable for read-only search.",
      },
    },
    noMatchReason: "PROVIDER_UNAVAILABLE",
  },
  no_valid_completion: {
    request: requests.noMatch,
    food: [],
    instamart: [],
    noMatchReason: "NO_VALID_COMPLETION",
  },
  unserviceable: {
    request: requests.riceCurd,
    food: [candidates.foodRajma],
    instamart: [candidates.imDal],
    serviceability: {
      FOOD: "NOT_SERVICEABLE",
      INSTAMART: "NOT_SERVICEABLE",
    },
    noMatchReason: "NOT_SERVICEABLE",
  },
  over_budget_filtered: {
    request: requests.riceCurd,
    food: [candidates.expensivePaneer],
    instamart: [],
    noMatchReason: "OVER_BUDGET",
  },
  dietary_violation_filtered: {
    request: requests.rotis,
    food: [candidates.foodChicken],
    instamart: [],
    noMatchReason: "NO_VEGETARIAN_MATCH",
  },
  deterministic_repeated_output: {
    request: requests.riceCurd,
    food: [candidates.foodRajma],
    instamart: [candidates.imDal],
  },
};

export class StubCandidateNormaliser {
  async normaliseCandidate(
    input: NormalisationInput,
  ): Promise<ReadOnlyCandidate> {
    const parsed = normalisationInputSchema.parse(input);
    return readOnlyCandidateSchema.parse({
      candidateId: stableId("candidate", parsed.provider, parsed.responseRef),
      surface: parsed.provider,
      merchantName:
        parsed.provider === "FOOD" ? "Food Stub Provider" : "Instamart Stub",
      itemId: stableId("item", parsed.provider, parsed.responseRef),
      displayName: parsed.sanitizedDisplayName,
      quantity: 1,
      price: {
        amountInr: 0,
        status: "ITEM_ESTIMATE",
      },
      availability: "UNKNOWN",
      diet: "UNKNOWN",
      sourceTrace: {
        provider: parsed.provider,
        tool: "stub_normalised_candidate",
        responseRef: parsed.responseRef,
        observedAt: parsed.observedAt,
      },
      semanticTags: parsed.semanticTags,
    });
  }
}

export class StubServiceabilityAdapter {
  constructor(private readonly config: RequiredStubConfig) {}

  getContext(addressId: string): AddressServiceabilityContext {
    return addressServiceabilityContextSchema.parse({
      addressId,
      selectedByUser: true,
      serviceability: {
        FOOD: this.config.serviceability.FOOD,
        INSTAMART: this.config.serviceability.INSTAMART,
      },
      checkedAt: observedAt,
    });
  }
}

class StubHealthAdapter implements ProviderHealthPort {
  constructor(private readonly config: RequiredStubConfig) {}

  async getProviderHealth(
    provider: CandidateSource,
  ): Promise<ProviderHealthState> {
    return providerHealthStateSchema.parse(this.config.health[provider]);
  }
}

class StubFoodAdapter implements FoodCandidateSearchPort {
  constructor(private readonly config: RequiredStubConfig) {}

  async searchFoodCandidates(
    request: ProviderSearchRequest,
  ): Promise<ProviderSearchResult> {
    return searchProvider("FOOD", request, this.config);
  }
}

class StubInstamartAdapter implements InstamartCandidateSearchPort {
  constructor(private readonly config: RequiredStubConfig) {}

  async searchInstamartCandidates(
    request: ProviderSearchRequest,
  ): Promise<ProviderSearchResult> {
    return searchProvider("INSTAMART", request, this.config);
  }
}

interface RequiredStubConfig {
  seed: string;
  scenario: StubScenarioId;
  latencyMs: Record<CandidateSource, number>;
  failures: Partial<Record<CandidateSource, StubProviderFailureConfig>>;
  serviceability: Record<CandidateSource, ServiceabilityStatus>;
  health: Record<CandidateSource, ProviderHealthState>;
}

export function createStubProviders(
  config: StubProvidersConfig = {},
): StubProviders {
  const required = resolveConfig(config);
  return {
    food: new StubFoodAdapter(required),
    instamart: new StubInstamartAdapter(required),
    normaliser: new StubCandidateNormaliser(),
    serviceability: new StubServiceabilityAdapter(required),
    health: new StubHealthAdapter(required),
  };
}

export async function runStubScenario(
  scenario: StubScenarioId,
  config: Omit<StubProvidersConfig, "scenario"> = {},
): Promise<StubScenarioRun> {
  const providers = createStubProviders({ ...config, scenario });
  const definition = scenarioDefinitions[scenario];
  const request = definition.request;
  const serviceability = providers.serviceability.getContext(
    request.request.addressId,
  );
  const [foodResult, instamartResult, foodHealth, instamartHealth] =
    await Promise.all([
      providers.food.searchFoodCandidates(request),
      providers.instamart.searchInstamartCandidates(request),
      providers.health.getProviderHealth("FOOD"),
      providers.health.getProviderHealth("INSTAMART"),
    ]);
  const providerResults = {
    FOOD: providerSearchResultSchema.parse(foodResult),
    INSTAMART: providerSearchResultSchema.parse(instamartResult),
  };
  const outcome = buildOutcome(scenario, request, providerResults);

  return {
    scenario,
    request,
    serviceability,
    health: {
      FOOD: foodHealth,
      INSTAMART: instamartHealth,
    },
    providerResults,
    outcome,
  };
}

function resolveConfig(config: StubProvidersConfig): RequiredStubConfig {
  const scenario = config.scenario ?? "both_provider";
  const definition = scenarioDefinitions[scenario];
  const failures = {
    ...definition.failures,
    ...config.failures,
  };
  const serviceability = {
    FOOD: "SERVICEABLE",
    INSTAMART: "SERVICEABLE",
    ...definition.serviceability,
    ...config.serviceability,
  } satisfies Record<CandidateSource, ServiceabilityStatus>;
  const latencyMs =
    typeof config.latencyMs === "number"
      ? {
          FOOD: config.latencyMs,
          INSTAMART: config.latencyMs,
        }
      : {
          FOOD: config.latencyMs?.FOOD ?? 0,
          INSTAMART: config.latencyMs?.INSTAMART ?? 0,
        };
  const health = {
    FOOD: providerHealth("FOOD", failures.FOOD),
    INSTAMART: providerHealth("INSTAMART", failures.INSTAMART),
    ...config.health,
  } satisfies Record<CandidateSource, ProviderHealthState>;

  return {
    seed: config.seed ?? "fmd-004-default-seed",
    scenario,
    latencyMs,
    failures,
    serviceability,
    health,
  };
}

async function searchProvider(
  provider: CandidateSource,
  request: ProviderSearchRequest,
  config: RequiredStubConfig,
): Promise<ProviderSearchResult> {
  const parsedRequest = providerSearchRequestSchema.parse(request);
  await delay(config.latencyMs[provider]);

  const failure = config.failures[provider];
  if (failure !== undefined) {
    return providerSearchResultSchema.parse({
      status: "FAILURE",
      failure: providerFailure(provider, failure),
      searchedAt: observedAt,
    });
  }

  if (config.serviceability[provider] !== "SERVICEABLE") {
    return providerSearchResultSchema.parse({
      status: "SUCCESS",
      provider,
      candidates: [],
      searchedAt: observedAt,
    });
  }

  const definition = scenarioDefinitions[config.scenario];
  const rawCandidates =
    provider === "FOOD" ? definition.food : definition.instamart;
  const filteredCandidates = filterCandidates(
    rawCandidates,
    parsedRequest,
  ).slice(0, parsedRequest.limit);

  return providerSearchResultSchema.parse({
    status: "SUCCESS",
    provider,
    candidates: orderDeterministically(filteredCandidates, config.seed),
    searchedAt: observedAt,
  });
}

function filterCandidates(
  values: readonly ReadOnlyCandidate[],
  request: ProviderSearchRequest,
): ReadOnlyCandidate[] {
  const exclusions = request.request.constraints.exclusions.map((value) =>
    value.toLowerCase(),
  );
  return values.filter((value) => {
    if (value.price.amountInr > request.request.constraints.budgetInr.max) {
      return false;
    }
    if (
      request.request.constraints.diet === "VEGETARIAN" &&
      value.diet === "NON_VEGETARIAN"
    ) {
      return false;
    }
    if (
      request.request.constraints.maxEtaMinutes !== undefined &&
      value.etaMinutes !== undefined &&
      value.etaMinutes > request.request.constraints.maxEtaMinutes
    ) {
      return false;
    }
    const searchableText = [
      value.displayName,
      value.merchantName,
      ...value.semanticTags,
    ]
      .join(" ")
      .toLowerCase();
    return !exclusions.some((exclusion) => searchableText.includes(exclusion));
  });
}

function buildOutcome(
  scenario: StubScenarioId,
  request: ProviderSearchRequest,
  providerResults: Record<CandidateSource, ProviderSearchResult>,
): RecommendationSearchResult {
  const candidatesByProvider = {
    FOOD:
      providerResults.FOOD.status === "SUCCESS"
        ? providerResults.FOOD.candidates
        : [],
    INSTAMART:
      providerResults.INSTAMART.status === "SUCCESS"
        ? providerResults.INSTAMART.candidates
        : [],
  };
  const allCandidates = [
    ...candidatesByProvider.FOOD,
    ...candidatesByProvider.INSTAMART,
  ];
  const definition = scenarioDefinitions[scenario];
  const missingComponent = inferMissingComponent(
    request.request.home.components,
  );

  if (allCandidates.length === 0) {
    return recommendationSearchResultSchema.parse({
      status: "NO_MATCH",
      requestId: request.request.requestId,
      missingComponent,
      reason: definition.noMatchReason ?? "NO_VALID_COMPLETION",
      message: noMatchMessage(
        definition.noMatchReason ?? "NO_VALID_COMPLETION",
      ),
      safeNextAction: "Adjust one constraint or use standard Swiggy search.",
    });
  }

  const primary = choosePrimary(candidatesByProvider);
  const comparisonStatus =
    candidatesByProvider.FOOD.length > 0 &&
    candidatesByProvider.INSTAMART.length > 0
      ? "BOTH_SURFACES"
      : primary.surface === "FOOD"
        ? "FOOD_ONLY"
        : "INSTAMART_ONLY";
  const recommendation: ReadOnlyRecommendation =
    readOnlyRecommendationSchema.parse({
      recommendationId: stableId(
        "recommendation",
        scenario,
        request.request.requestId,
        primary.candidateId,
      ),
      requestId: request.request.requestId,
      intent: "COMPLETE_PARTIAL_DINNER",
      homeSummary: request.request.home.components.map(formatHomeComponent),
      missingComponent,
      primary,
      explanation: {
        summary: explanationSummary(missingComponent),
        reasonCodes: [
          reasonCode(missingComponent),
          "SINGLE_SURFACE_MATCH",
          "READ_ONLY_PRICE_ESTIMATE",
        ],
      },
      assumptions: [
        {
          assumptionId: stableId("assumption", request.request.requestId),
          kind: "HOME_QUANTITY",
          label: "Home food quantity is enough for selected servings.",
        },
      ],
      comparisonStatus,
      confidence: comparisonStatus === "BOTH_SURFACES" ? "HIGH" : "MEDIUM",
      rejectedHardConstraints: [],
    });

  return recommendationSearchResultSchema.parse({
    status: "RECOMMENDATION_READY",
    recommendation,
  });
}

function choosePrimary(
  values: Record<CandidateSource, readonly ReadOnlyCandidate[]>,
): ReadOnlyCandidate {
  const primary = values.FOOD[0] ?? values.INSTAMART[0];
  if (primary === undefined) {
    throw new Error("no stub candidate available");
  }
  return primary;
}

function providerFailure(
  provider: CandidateSource,
  config: StubProviderFailureConfig,
): ProviderFailure {
  return {
    provider,
    reason: config.reason,
    retryable: config.retryable ?? true,
    message:
      config.message ??
      `${provider} stub failed before read-only candidate search completed.`,
  };
}

function providerHealth(
  provider: CandidateSource,
  failure: StubProviderFailureConfig | undefined,
): ProviderHealthState {
  if (failure === undefined) {
    return providerHealthStateSchema.parse({
      status: "AVAILABLE",
      provider,
      checkedAt: observedAt,
    });
  }
  return providerHealthStateSchema.parse({
    status: failure.retryable === false ? "UNAVAILABLE" : "DEGRADED",
    provider,
    checkedAt: observedAt,
    reason: failure.reason,
  });
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function orderDeterministically(
  values: readonly ReadOnlyCandidate[],
  seed: string,
): ReadOnlyCandidate[] {
  return [...values].sort((left, right) =>
    stableId(seed, left.candidateId).localeCompare(
      stableId(seed, right.candidateId),
    ),
  );
}

function stableId(...parts: readonly string[]): string {
  let hash = 2166136261;
  for (const char of parts.join(":")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `stub-${Math.abs(hash >>> 0).toString(36)}`;
}

function formatHomeComponent(component: string): string {
  return component
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function explanationSummary(missingComponent: MissingComponent): string {
  switch (missingComponent) {
    case "NEED_BASE":
      return "Adds a base to the food already at home.";
    case "NEED_MAIN":
      return "Adds a main dish to the base already at home.";
    case "NEED_PROTEIN":
      return "Adds a protein component to complete dinner.";
    case "NEED_SIDE":
      return "Adds a side to round out dinner.";
    case "NEED_VOLUME":
      return "Adds a small side to make the leftover enough.";
    case "NEED_COMPLETE_MEAL":
      return "Routes to standard discovery because no useful dinner base exists.";
    case "INSUFFICIENT_INFORMATION":
      return "Needs one more bounded detail before search.";
  }
}

function reasonCode(
  missingComponent: MissingComponent,
): ReadOnlyRecommendation["explanation"]["reasonCodes"][number] {
  switch (missingComponent) {
    case "NEED_BASE":
      return "ADDS_MISSING_BASE";
    case "NEED_MAIN":
      return "ADDS_MISSING_MAIN";
    case "NEED_PROTEIN":
      return "ADDS_MISSING_PROTEIN";
    case "NEED_SIDE":
      return "ADDS_MISSING_SIDE";
    case "NEED_VOLUME":
      return "ADDS_VOLUME";
    case "NEED_COMPLETE_MEAL":
    case "INSUFFICIENT_INFORMATION":
      return "SINGLE_SURFACE_MATCH";
  }
}

function noMatchMessage(
  reason: Exclude<
    RecommendationSearchResult,
    { status: "RECOMMENDATION_READY" }
  >["reason"],
): string {
  switch (reason) {
    case "OVER_BUDGET":
      return "No read-only stub candidate fit the selected budget.";
    case "NO_VEGETARIAN_MATCH":
      return "No read-only stub candidate fit the vegetarian constraint.";
    case "NOT_SERVICEABLE":
      return "Selected stub address is not serviceable by either surface.";
    case "SINGLE_SURFACE_UNAVAILABLE":
      return "Required single surface is unavailable in stub mode.";
    case "PROVIDER_UNAVAILABLE":
      return "Both read-only stub providers are unavailable.";
    case "INSUFFICIENT_INFORMATION":
      return "Home food state needs one more bounded detail.";
    case "NO_VALID_COMPLETION":
      return "No single-surface read-only completion is valid.";
  }
}

export const stubScenarioDefinitions = scenarioDefinitions;
