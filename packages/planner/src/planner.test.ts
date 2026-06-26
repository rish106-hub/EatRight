import { describe, expect, it, vi } from "vitest";
import {
  addressServiceabilityContextSchema,
  readOnlyCandidateSchema,
  type AddressServiceabilityContext,
  type CandidateSource,
  type CompletionRequest,
  type FoodCandidateSearchPort,
  type InstamartCandidateSearchPort,
  type ProviderSearchRequest,
  type ProviderSearchResult,
  type ReadOnlyCandidate,
} from "@finish-my-dinner/contracts";
import {
  createStubProviders,
  stubScenarioDefinitions,
  type StubScenarioId,
} from "@finish-my-dinner/providers-stub";
import {
  MISSING_COMPONENT_RULES,
  createDeterministicPlanner,
  deriveMissingComponent,
  plannerOutcomeSchema,
  scoreCandidate,
} from ".";

const observedAt = "2026-06-25T12:00:00.000+05:30";

describe("deterministic rule precedence", () => {
  it("keeps explicit precedence order stable", () => {
    expect(MISSING_COMPONENT_RULES.map((rule) => rule.id)).toEqual([
      "UNKNOWN_OR_EMPTY",
      "NOTHING_USEFUL",
      "LOW_VOLUME_LEFTOVER",
      "RICE_CURD_NEEDS_MAIN",
      "DAL_WITHOUT_BASE",
      "ROTIS_WITHOUT_MAIN",
      "RICE_WITH_VEGETABLE_SIDE_NEEDS_PROTEIN",
      "COMPLETE_ENOUGH",
      "BASE_WITHOUT_MAIN",
      "MAIN_WITHOUT_BASE",
      "BASE_AND_MAIN_NEEDS_SIDE",
      "INSUFFICIENT_STRUCTURED_INFORMATION",
    ]);
  });

  it("resolves rice + curd to NEED_MAIN", () => {
    const request = stubScenarioDefinitions.both_provider.request.request;

    expect(deriveMissingComponent(request)).toMatchObject({
      ruleId: "RICE_CURD_NEEDS_MAIN",
      missingComponent: "NEED_MAIN",
    });
  });

  it("resolves rotis without a main to NEED_MAIN", () => {
    const request = stubScenarioDefinitions.rotis_main.request.request;

    expect(deriveMissingComponent(request)).toMatchObject({
      ruleId: "ROTIS_WITHOUT_MAIN",
      missingComponent: "NEED_MAIN",
    });
  });

  it("resolves rice + vegetable side without protein to NEED_PROTEIN", () => {
    const request = requestWith({
      components: ["BASE_RICE", "SIDE_VEGETABLE"],
    });

    expect(deriveMissingComponent(request)).toMatchObject({
      ruleId: "RICE_WITH_VEGETABLE_SIDE_NEEDS_PROTEIN",
      missingComponent: "NEED_PROTEIN",
    });
  });

  it("resolves low-volume leftovers before completeness rules", () => {
    const request = requestWith({
      components: ["LEFTOVER_SMALL", "BASE_RICE", "MAIN_DAL", "SIDE_CURD"],
      quantityConfidence: "LOW",
    });

    expect(deriveMissingComponent(request)).toMatchObject({
      ruleId: "LOW_VOLUME_LEFTOVER",
      missingComponent: "NEED_VOLUME",
    });
  });
});

describe("deterministic planner", () => {
  it("returns one recommendation for rice + curd with Food and Instamart candidates", async () => {
    const outcome = await planStub("both_provider");

    expect(outcome.status).toBe("RECOMMENDATION_READY");
    if (outcome.status === "RECOMMENDATION_READY") {
      expect(outcome.recommendation.missingComponent).toBe("NEED_MAIN");
      expect(outcome.recommendation.comparisonStatus).toBe("BOTH_SURFACES");
      expect(outcome.recommendation.primary).toEqual(outcome.selectedCandidate);
      expect("scoredCandidates" in outcome).toBe(false);
    }
  });

  it("recommends a base for dal", async () => {
    const outcome = await planStub("dal_base");

    expect(outcome.status).toBe("RECOMMENDATION_READY");
    if (outcome.status === "RECOMMENDATION_READY") {
      expect(outcome.missingComponent).toBe("NEED_BASE");
      expect(outcome.selectedCandidate.semanticTags).toContain("base");
    }
  });

  it("recommends a main for rotis", async () => {
    const outcome = await planStub("rotis_main");

    expect(outcome.status).toBe("RECOMMENDATION_READY");
    if (outcome.status === "RECOMMENDATION_READY") {
      expect(outcome.missingComponent).toBe("NEED_MAIN");
      expect(outcome.selectedCandidate.semanticTags).toContain("main");
    }
  });

  it("recommends volume for small leftover biryani using structured fields only", async () => {
    const outcome = await planStub("insufficient_biryani_volume");

    expect(outcome.status).toBe("RECOMMENDATION_READY");
    if (outcome.status === "RECOMMENDATION_READY") {
      expect(outcome.missingComponent).toBe("NEED_VOLUME");
      expect(outcome.selectedCandidate.semanticTags).toContain("volume");
    }
  });

  it.each([
    ["food_only", "FOOD_ONLY", "FOOD"],
    ["instamart_only", "INSTAMART_ONLY", "INSTAMART"],
    ["both_provider", "BOTH_SURFACES", "INSTAMART"],
  ] as const)(
    "handles %s provider availability",
    async (scenario, comparisonStatus, provider) => {
      const outcome = await planStub(scenario);

      expect(outcome.status).toBe("RECOMMENDATION_READY");
      if (outcome.status === "RECOMMENDATION_READY") {
        expect(outcome.recommendation.comparisonStatus).toBe(comparisonStatus);
        expect(outcome.selectedProvider).toBe(provider);
      }
    },
  );

  it.each([
    ["food_failure_instamart_success", "FOOD", "INSTAMART"],
    ["instamart_failure_food_success", "INSTAMART", "FOOD"],
  ] as const)(
    "continues when %s has one provider failure",
    async (scenario, failedProvider, selectedProvider) => {
      const outcome = await planStub(scenario);

      expect(outcome.status).toBe("RECOMMENDATION_READY");
      if (outcome.status === "RECOMMENDATION_READY") {
        expect(outcome.providerSummary[failedProvider].status).toBe("FAILURE");
        expect(outcome.selectedProvider).toBe(selectedProvider);
      }
    },
  );

  it("returns both-provider failure when both providers fail", async () => {
    const outcome = await planStub("both_provider_failure");

    expect(outcome.status).toBe("BOTH_PROVIDERS_FAILED");
    if (outcome.status === "BOTH_PROVIDERS_FAILED") {
      expect(outcome.providerSummary.FOOD.status).toBe("FAILURE");
      expect(outcome.providerSummary.INSTAMART.status).toBe("FAILURE");
      expect(outcome.suggestedAction).toBe("TRY_AGAIN");
    }
  });

  it("returns no valid completion when no candidate fits", async () => {
    const outcome = await planWithCandidates({
      request: requestWith({ components: ["BASE_RICE", "SIDE_CURD"] }),
      foodCandidates: [baseCandidate()],
      instamartCandidates: [],
    });

    expect(outcome.status).toBe("NO_VALID_COMPLETION");
    if (outcome.status === "NO_VALID_COMPLETION") {
      expect(outcome.reason).toBe("NO_VALID_COMPLETION");
      expect(outcome.rejectedCandidates[0]?.reasons).toContain(
        "MISSING_COMPONENT_FIT",
      );
    }
  });

  it("returns unserviceable before provider search", async () => {
    const foodPort = countingPort([]);
    const instamartPort = countingPort([]);
    const planner = createDeterministicPlanner({ foodPort, instamartPort });
    const outcome = await planner.plan({
      request: requestWith({ components: ["BASE_RICE", "SIDE_CURD"] }),
      serviceability: serviceability({
        FOOD: "NOT_SERVICEABLE",
        INSTAMART: "NOT_SERVICEABLE",
      }),
    });

    expect(outcome.status).toBe("UNSERVICEABLE");
    expect(foodPort.calls()).toBe(0);
    expect(instamartPort.calls()).toBe(0);
  });

  it.each([
    ["over budget", { amountInr: 999 }, "OVER_BUDGET", "ADJUST_BUDGET"],
    ["over maximum ETA", { etaMinutes: 99 }, "OVER_MAX_ETA", "ADJUST_MAX_ETA"],
    ["dietary violation", { diet: "NON_VEGETARIAN" }, "DIET", "RELAX_DIET"],
    [
      "hard exclusion",
      {
        displayName: "Mushroom Curry",
        semanticTags: ["main", "mushroom"] as string[],
      },
      "EXCLUSION",
      "REMOVE_EXCLUSION",
    ],
  ] as const)(
    "filters %s",
    async (_label, candidatePatch, rejection, action) => {
      const request = requestWith({
        components: ["BASE_RICE", "SIDE_CURD"],
        maxEtaMinutes: 30,
        exclusions: rejection === "EXCLUSION" ? ["mushroom"] : [],
      });
      const outcome = await planWithCandidates({
        request,
        foodCandidates: [mainCandidate(candidatePatch)],
        instamartCandidates: [],
      });

      expect(outcome.status).toBe("NO_VALID_COMPLETION");
      if (outcome.status === "NO_VALID_COMPLETION") {
        expect(outcome.rejectedCandidates[0]?.reasons).toContain(rejection);
        expect(outcome.suggestedAction).toBe(action);
      }
    },
  );

  it("returns no purchase required for complete-enough structured meal", async () => {
    const foodPort = countingPort([]);
    const instamartPort = countingPort([]);
    const planner = createDeterministicPlanner({ foodPort, instamartPort });
    const outcome = await planner.plan({
      request: requestWith({
        components: ["BASE_RICE", "MAIN_DAL", "SIDE_CURD"],
        quantityConfidence: "HIGH",
      }),
      serviceability: serviceability(),
    });

    expect(outcome.status).toBe("NO_PURCHASE_REQUIRED");
    expect(foodPort.calls()).toBe(0);
    expect(instamartPort.calls()).toBe(0);
  });

  it("returns standard handoff for NOTHING_USEFUL before provider search", async () => {
    const foodPort = countingPort([]);
    const instamartPort = countingPort([]);
    const planner = createDeterministicPlanner({ foodPort, instamartPort });
    const outcome = await planner.plan({
      request: requestWith({ components: ["NOTHING_USEFUL"] }),
      serviceability: serviceability(),
    });

    expect(outcome.status).toBe("STANDARD_SWIGGY_HANDOFF_REQUIRED");
    expect(outcome.suggestedAction).toBe("STANDARD_SWIGGY_SEARCH");
    expect(foodPort.calls()).toBe(0);
    expect(instamartPort.calls()).toBe(0);
  });

  it("returns insufficient information for UNKNOWN before provider search", async () => {
    const foodPort = countingPort([]);
    const instamartPort = countingPort([]);
    const planner = createDeterministicPlanner({ foodPort, instamartPort });
    const outcome = await planner.plan({
      request: requestWith({ components: ["UNKNOWN"] }),
      serviceability: serviceability(),
    });

    expect(outcome.status).toBe("INSUFFICIENT_INFORMATION");
    expect(foodPort.calls()).toBe(0);
    expect(instamartPort.calls()).toBe(0);
  });

  it("produces deterministic repeated output", async () => {
    const first = await planStub("both_provider");
    const second = await planStub("both_provider");

    expect(first).toEqual(second);
  });

  it("uses deterministic provider and candidate ID tie-breaking", async () => {
    const outcome = await planWithCandidates({
      request: requestWith({ components: ["BASE_RICE", "SIDE_CURD"] }),
      foodCandidates: [mainCandidate({ candidateId: "candidate-b" })],
      instamartCandidates: [
        mainCandidate({ candidateId: "candidate-a", surface: "INSTAMART" }),
      ],
    });

    expect(outcome.status).toBe("RECOMMENDATION_READY");
    if (outcome.status === "RECOMMENDATION_READY") {
      expect(outcome.selectedProvider).toBe("FOOD");
      expect(outcome.selectedCandidate.candidateId).toBe("candidate-b");
    }
  });

  it("preserves estimated-price semantics", async () => {
    const outcome = await planStub("both_provider");

    expect(outcome.status).toBe("RECOMMENDATION_READY");
    if (outcome.status === "RECOMMENDATION_READY") {
      expect(outcome.selectedCandidate.price.status).toBe("ITEM_ESTIMATE");
      expect(outcome.recommendation.primary.price.status).toBe("ITEM_ESTIMATE");
    }
  });

  it("rejects invalid provider payload independently", async () => {
    const foodPort: FoodCandidateSearchPort = {
      async searchFoodCandidates() {
        return { status: "SUCCESS", provider: "FOOD" } as ProviderSearchResult;
      },
    };
    const instamartPort = portFor("INSTAMART", [
      mainCandidate({ surface: "INSTAMART" }),
    ]);
    const planner = createDeterministicPlanner({ foodPort, instamartPort });
    const outcome = await planner.plan({
      request: requestWith({ components: ["BASE_RICE", "SIDE_CURD"] }),
      serviceability: serviceability(),
    });

    expect(outcome.status).toBe("RECOMMENDATION_READY");
    if (outcome.status === "RECOMMENDATION_READY") {
      expect(outcome.providerSummary.FOOD.failureReason).toBe(
        "SCHEMA_MISMATCH",
      );
      expect(outcome.selectedProvider).toBe("INSTAMART");
    }
  });

  it("does not call network outside injected ports", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("network blocked"));

    await planStub("both_provider");

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("does not expose cart, checkout, payment, coupon, or order fields", async () => {
    const outcome = await planStub("both_provider");
    const serialized = JSON.stringify(outcome).toLowerCase();

    expect(serialized).not.toContain("cart");
    expect(serialized).not.toContain("checkout");
    expect(serialized).not.toContain("payment");
    expect(serialized).not.toContain("coupon");
    expect(serialized).not.toContain("order");
  });

  it("runtime-validates planner outcomes", async () => {
    const outcome = await planStub("both_provider");

    expect(plannerOutcomeSchema.parse(outcome)).toEqual(outcome);
    expect(() =>
      plannerOutcomeSchema.parse({ ...outcome, checkoutTotalInr: 10 }),
    ).toThrow();
  });

  it("uses fake timers for deterministic provider timeouts", async () => {
    vi.useFakeTimers();
    const foodPort: FoodCandidateSearchPort = {
      async searchFoodCandidates() {
        return new Promise<ProviderSearchResult>(() => {});
      },
    };
    const instamartPort = portFor("INSTAMART", [
      mainCandidate({ surface: "INSTAMART" }),
    ]);
    const planner = createDeterministicPlanner({
      foodPort,
      instamartPort,
      providerTimeoutMs: 50,
    });
    const pending = planner.plan({
      request: requestWith({ components: ["BASE_RICE", "SIDE_CURD"] }),
      serviceability: serviceability(),
    });

    await vi.advanceTimersByTimeAsync(50);
    const outcome = await pending;
    vi.useRealTimers();

    expect(outcome.status).toBe("RECOMMENDATION_READY");
    if (outcome.status === "RECOMMENDATION_READY") {
      expect(outcome.providerSummary.FOOD.failureReason).toBe("TIMEOUT");
      expect(outcome.selectedProvider).toBe("INSTAMART");
    }
  });

  it("defines scoring components as stable integer ranges", () => {
    const score = scoreCandidate(
      mainCandidate({ amountInr: 125, etaMinutes: 15 }),
      requestWith({
        components: ["BASE_RICE", "SIDE_CURD"],
        budgetMax: 250,
        maxEtaMinutes: 30,
      }),
      "NEED_MAIN",
    );

    expect(Object.values(score).every(Number.isInteger)).toBe(true);
    expect(
      Object.values(score).every((value) => value >= 0 && value <= 100),
    ).toBe(true);
    expect(score.providerReliabilityFit).toBe(50);
  });
});

async function planStub(scenario: StubScenarioId) {
  const providers = createStubProviders({ scenario });
  const definition = stubScenarioDefinitions[scenario];
  const planner = createDeterministicPlanner({
    foodPort: providers.food,
    instamartPort: providers.instamart,
  });

  return planner.plan({
    request: definition.request.request,
    serviceability: providers.serviceability.getContext(
      definition.request.request.addressId,
    ),
  });
}

async function planWithCandidates(config: {
  request: CompletionRequest;
  foodCandidates: readonly ReadOnlyCandidate[];
  instamartCandidates: readonly ReadOnlyCandidate[];
}) {
  const planner = createDeterministicPlanner({
    foodPort: portFor("FOOD", config.foodCandidates),
    instamartPort: portFor("INSTAMART", config.instamartCandidates),
  });

  return planner.plan({
    request: config.request,
    serviceability: serviceability(),
  });
}

function portFor(
  provider: CandidateSource,
  candidates: readonly ReadOnlyCandidate[],
): FoodCandidateSearchPort & InstamartCandidateSearchPort {
  const search = async (): Promise<ProviderSearchResult> => ({
    status: "SUCCESS",
    provider,
    candidates: [...candidates],
    searchedAt: observedAt,
  });

  return {
    searchFoodCandidates: search,
    searchInstamartCandidates: search,
  };
}

function countingPort(
  candidates: readonly ReadOnlyCandidate[],
): (FoodCandidateSearchPort & InstamartCandidateSearchPort) & {
  calls: () => number;
} {
  let callCount = 0;
  const port = portFor("FOOD", candidates);
  return {
    async searchFoodCandidates(request: ProviderSearchRequest) {
      callCount += 1;
      return port.searchFoodCandidates(request);
    },
    async searchInstamartCandidates(request: ProviderSearchRequest) {
      callCount += 1;
      return port.searchInstamartCandidates(request);
    },
    calls() {
      return callCount;
    },
  };
}

function requestWith(values: {
  components: CompletionRequest["home"]["components"];
  quantityConfidence?: CompletionRequest["home"]["quantityConfidence"];
  budgetMax?: number;
  maxEtaMinutes?: number;
  exclusions?: string[];
}): CompletionRequest {
  return {
    sessionId: "session-planner-test",
    requestId: `request-${values.components.join("-").toLowerCase()}`,
    addressId: "address-user-selected-test",
    home: {
      components: values.components,
      quantityConfidence: values.quantityConfidence ?? "HIGH",
    },
    constraints: {
      servings: 1,
      diet: "VEGETARIAN",
      exclusions: values.exclusions ?? [],
      budgetInr: { max: values.budgetMax ?? 250 },
      maxEtaMinutes: values.maxEtaMinutes ?? 45,
      mealWeight: "REGULAR",
    },
  };
}

function serviceability(
  values: AddressServiceabilityContext["serviceability"] = {
    FOOD: "SERVICEABLE",
    INSTAMART: "SERVICEABLE",
  },
): AddressServiceabilityContext {
  return addressServiceabilityContextSchema.parse({
    addressId: "address-user-selected-test",
    selectedByUser: true,
    serviceability: values,
    checkedAt: observedAt,
  });
}

function baseCandidate(): ReadOnlyCandidate {
  return readOnlyCandidateSchema.parse({
    candidateId: "candidate-base",
    surface: "FOOD",
    merchantId: "merchant-test",
    merchantName: "Test Merchant",
    itemId: "item-base",
    displayName: "Ready Rotis",
    quantity: 1,
    price: { amountInr: 90, status: "ITEM_ESTIMATE" },
    etaMinutes: 20,
    availability: "AVAILABLE",
    diet: "VEGETARIAN",
    sourceTrace: {
      provider: "FOOD",
      tool: "test_search",
      responseRef: "response-base",
      observedAt,
    },
    semanticTags: ["base", "roti"],
  });
}

function mainCandidate(
  patch: Partial<ReadOnlyCandidate> & {
    amountInr?: number;
    semanticTags?: string[];
  } = {},
): ReadOnlyCandidate {
  const surface = patch.surface ?? "FOOD";
  return readOnlyCandidateSchema.parse({
    candidateId: patch.candidateId ?? `candidate-${surface.toLowerCase()}-main`,
    surface,
    merchantId: surface === "FOOD" ? "merchant-main" : undefined,
    merchantName: patch.merchantName ?? "Main Merchant",
    itemId: patch.itemId ?? `item-${surface.toLowerCase()}-main`,
    displayName: patch.displayName ?? "Paneer Curry",
    quantity: patch.quantity ?? 1,
    price: {
      amountInr: patch.amountInr ?? patch.price?.amountInr ?? 150,
      status: "ITEM_ESTIMATE",
    },
    etaMinutes: patch.etaMinutes ?? 20,
    availability: patch.availability ?? "AVAILABLE",
    diet: patch.diet ?? "VEGETARIAN",
    sourceTrace: {
      provider: surface,
      tool: "test_search",
      responseRef: `response-${surface.toLowerCase()}-main`,
      observedAt,
    },
    semanticTags: patch.semanticTags ?? ["main", "paneer", "curry"],
  });
}
