import { describe, expect, it, vi } from "vitest";
import {
  addressServiceabilityContextSchema,
  providerSearchResultSchema,
  readOnlyCandidateSchema,
  readOnlyRecommendationSchema,
  recommendationSearchResultSchema,
  type FoodCandidateSearchPort,
  type InstamartCandidateSearchPort,
} from "@finish-my-dinner/contracts";
import {
  STUB_SCENARIO_IDS,
  StubCandidateNormaliser,
  createStubProviders,
  runStubScenario,
  stubScenarioDefinitions,
  type StubScenarioId,
} from ".";

describe("stub provider adapters", () => {
  it("satisfy shared Food and Instamart search interfaces", async () => {
    const providers = createStubProviders({ scenario: "both_provider" });
    const food: FoodCandidateSearchPort = providers.food;
    const instamart: InstamartCandidateSearchPort = providers.instamart;
    const request = stubScenarioDefinitions.both_provider.request;

    expect(
      providerSearchResultSchema.parse(
        await food.searchFoodCandidates(request),
      ),
    ).toMatchObject({
      status: "SUCCESS",
      provider: "FOOD",
    });
    expect(
      providerSearchResultSchema.parse(
        await instamart.searchInstamartCandidates(request),
      ),
    ).toMatchObject({
      status: "SUCCESS",
      provider: "INSTAMART",
    });
  });

  it.each(STUB_SCENARIO_IDS)(
    "validates required scenario %s against contracts",
    async (scenario) => {
      const result = await runStubScenario(scenario);

      expect(
        addressServiceabilityContextSchema.parse(result.serviceability),
      ).toEqual(result.serviceability);
      expect(
        providerSearchResultSchema.parse(result.providerResults.FOOD),
      ).toEqual(result.providerResults.FOOD);
      expect(
        providerSearchResultSchema.parse(result.providerResults.INSTAMART),
      ).toEqual(result.providerResults.INSTAMART);
      expect(recommendationSearchResultSchema.parse(result.outcome)).toEqual(
        result.outcome,
      );
    },
  );

  it("returns Food main candidate for rice + curd", async () => {
    const result = await runStubScenario("rice_curd_food_main");

    expect(result.outcome.status).toBe("RECOMMENDATION_READY");
    if (result.outcome.status === "RECOMMENDATION_READY") {
      expect(result.outcome.recommendation.missingComponent).toBe("NEED_MAIN");
      expect(result.outcome.recommendation.primary.surface).toBe("FOOD");
      expect(result.outcome.recommendation.primary.semanticTags).toContain(
        "main",
      );
    }
  });

  it("returns Instamart ready-to-eat main candidate for rice + curd", async () => {
    const result = await runStubScenario("rice_curd_instamart_main");

    expect(result.outcome.status).toBe("RECOMMENDATION_READY");
    if (result.outcome.status === "RECOMMENDATION_READY") {
      expect(result.outcome.recommendation.missingComponent).toBe("NEED_MAIN");
      expect(result.outcome.recommendation.primary.surface).toBe("INSTAMART");
      expect(result.outcome.recommendation.primary.semanticTags).toContain(
        "ready-to-eat",
      );
    }
  });

  it("returns ready rotis or microwave rice for dal", async () => {
    const result = await runStubScenario("dal_base");

    expect(result.outcome.status).toBe("RECOMMENDATION_READY");
    if (result.outcome.status === "RECOMMENDATION_READY") {
      expect(result.outcome.recommendation.missingComponent).toBe("NEED_BASE");
      expect(["Ready Rotis Pack of 6", "Microwave Rice Bowl"]).toContain(
        result.outcome.recommendation.primary.displayName,
      );
    }
  });

  it("returns curry or sabzi for rotis", async () => {
    const result = await runStubScenario("rotis_main");

    expect(result.outcome.status).toBe("RECOMMENDATION_READY");
    if (result.outcome.status === "RECOMMENDATION_READY") {
      expect(result.outcome.recommendation.missingComponent).toBe("NEED_MAIN");
      expect(result.outcome.recommendation.primary.semanticTags).toContain(
        "main",
      );
    }
  });

  it("returns side or volume complement for insufficient biryani", async () => {
    const result = await runStubScenario("insufficient_biryani_volume");

    expect(result.outcome.status).toBe("RECOMMENDATION_READY");
    if (result.outcome.status === "RECOMMENDATION_READY") {
      expect(result.outcome.recommendation.missingComponent).toBe(
        "NEED_VOLUME",
      );
      expect(result.outcome.recommendation.primary.semanticTags).toContain(
        "volume",
      );
    }
  });

  it.each([
    ["food_only", "FOOD_ONLY"],
    ["instamart_only", "INSTAMART_ONLY"],
    ["both_provider", "BOTH_SURFACES"],
  ] as const)("reports comparison status for %s", async (scenario, status) => {
    const result = await runStubScenario(scenario);

    expect(result.outcome.status).toBe("RECOMMENDATION_READY");
    if (result.outcome.status === "RECOMMENDATION_READY") {
      expect(result.outcome.recommendation.comparisonStatus).toBe(status);
    }
  });

  it.each([
    ["food_failure_instamart_success", "FOOD", "RECOMMENDATION_READY"],
    ["instamart_failure_food_success", "INSTAMART", "RECOMMENDATION_READY"],
    ["both_provider_failure", "FOOD", "NO_MATCH"],
  ] as const)(
    "returns structured provider failure for %s",
    async (scenario, failedProvider, outcomeStatus) => {
      const result = await runStubScenario(scenario);

      expect(result.providerResults[failedProvider].status).toBe("FAILURE");
      if (result.providerResults[failedProvider].status === "FAILURE") {
        expect(result.providerResults[failedProvider].failure).toMatchObject({
          provider: failedProvider,
          retryable: true,
        });
      }
      expect(result.outcome.status).toBe(outcomeStatus);
    },
  );

  it.each([
    ["no_valid_completion", "NO_VALID_COMPLETION"],
    ["unserviceable", "NOT_SERVICEABLE"],
    ["over_budget_filtered", "OVER_BUDGET"],
    ["dietary_violation_filtered", "NO_VEGETARIAN_MATCH"],
  ] as const)("returns no-match reason for %s", async (scenario, reason) => {
    const result = await runStubScenario(scenario);

    expect(result.outcome.status).toBe("NO_MATCH");
    if (result.outcome.status === "NO_MATCH") {
      expect(result.outcome.reason).toBe(reason);
    }
  });

  it("produces deterministic repeated output for fixed seed and scenario", async () => {
    const first = await runStubScenario("deterministic_repeated_output", {
      seed: "fixed-seed",
    });
    const second = await runStubScenario("deterministic_repeated_output", {
      seed: "fixed-seed",
    });

    expect(first).toEqual(second);
  });

  it("simulates latency without changing deterministic result", async () => {
    vi.useFakeTimers();
    const pending = runStubScenario("both_provider", { latencyMs: 25 });

    await vi.advanceTimersByTimeAsync(25);
    const result = await pending;
    vi.useRealTimers();

    expect(result.outcome.status).toBe("RECOMMENDATION_READY");
  });

  it("normalises sanitized provider-neutral input into a read-only candidate", async () => {
    const normaliser = new StubCandidateNormaliser();
    const candidate = await normaliser.normaliseCandidate({
      provider: "FOOD",
      responseRef: "stub-response-ref",
      observedAt: "2026-06-25T12:00:00.000+05:30",
      sanitizedDisplayName: "Safe Stub Candidate",
      semanticTags: ["main"],
    });

    expect(readOnlyCandidateSchema.parse(candidate)).toEqual(candidate);
    expect(candidate.price.status).toBe("ITEM_ESTIMATE");
    expect(candidate.availability).toBe("UNKNOWN");
  });

  it("rejects malformed fixtures through contract validation", () => {
    const malformed = {
      ...stubScenarioDefinitions.both_provider.food[0],
      price: {
        amountInr: 180,
        status: "CART_CONFIRMED",
      },
    };

    expect(() => readOnlyCandidateSchema.parse(malformed)).toThrow();
  });

  it("keeps every returned price estimated", async () => {
    for (const scenario of STUB_SCENARIO_IDS) {
      const result = await runStubScenario(scenario);
      for (const providerResult of Object.values(result.providerResults)) {
        if (providerResult.status === "SUCCESS") {
          for (const candidate of providerResult.candidates) {
            expect(candidate.price.status).toBe("ITEM_ESTIMATE");
          }
        }
      }
      if (result.outcome.status === "RECOMMENDATION_READY") {
        expect(result.outcome.recommendation.primary.price.status).toBe(
          "ITEM_ESTIMATE",
        );
      }
    }
  });

  it("rejects confirmed cart, payment, checkout, and order fields", async () => {
    const result = await runStubScenario("both_provider");

    expect(result.outcome.status).toBe("RECOMMENDATION_READY");
    if (result.outcome.status !== "RECOMMENDATION_READY") {
      throw new Error("expected recommendation scenario");
    }
    const recommendation = result.outcome.recommendation;

    expect(() =>
      readOnlyRecommendationSchema.parse({
        ...recommendation,
        checkoutTotalInr: 210,
      }),
    ).toThrow();
    expect(() =>
      readOnlyRecommendationSchema.parse({
        ...recommendation,
        paymentMethod: "CARD",
      }),
    ).toThrow();
    expect(() =>
      readOnlyRecommendationSchema.parse({
        ...recommendation,
        orderId: "order-real",
      }),
    ).toThrow();
    expect(() =>
      readOnlyRecommendationSchema.parse({
        ...recommendation,
        primary: {
          ...recommendation.primary,
          cartLineId: "cart-line",
        },
      }),
    ).toThrow();
  });

  it("does not attempt network calls", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("network blocked"));

    await runStubScenario("both_provider");

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("exposes all required scenario IDs", () => {
    const required: StubScenarioId[] = [
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
    ];

    expect(STUB_SCENARIO_IDS).toEqual(required);
  });
});
