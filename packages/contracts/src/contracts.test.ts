import { describe, expect, it } from "vitest";
import {
  analyticsEventSchema,
  bothProviderFailureFixture,
  bothProviderRecommendationFixture,
  candidateSchema,
  completionRequestSchema,
  dalRequestFixture,
  foodCandidateFixture,
  foodOnlyRecommendationFixture,
  inferMissingComponent,
  insufficientBiryaniRequestFixture,
  instamartOnlyRecommendationFixture,
  noValidCompletionFixture,
  oneProviderFailureFixture,
  providerSearchResultSchema,
  readOnlyCandidateSchema,
  readOnlyRecommendationSchema,
  recommendationSearchResultSchema,
  riceCurdRequestFixture,
  safeAnalyticsEventFixture,
} from ".";

describe("home-food ontology", () => {
  it("maps rice + curd to NEED_MAIN", () => {
    expect(inferMissingComponent(["BASE_RICE", "SIDE_CURD"])).toBe("NEED_MAIN");
  });

  it("maps dal without a base to NEED_BASE", () => {
    expect(inferMissingComponent(["MAIN_DAL"])).toBe("NEED_BASE");
  });

  it("maps insufficient biryani to NEED_VOLUME", () => {
    expect(inferMissingComponent(["LEFTOVER_SMALL"])).toBe("NEED_VOLUME");
  });

  it("rejects unknown ontology values", () => {
    expect(() =>
      completionRequestSchema.parse({
        ...riceCurdRequestFixture,
        home: {
          ...riceCurdRequestFixture.home,
          components: ["BASE_PASTA"],
        },
      }),
    ).toThrow();
  });
});

describe("completion requests", () => {
  it("accepts representative home-state fixtures", () => {
    expect(completionRequestSchema.parse(riceCurdRequestFixture)).toEqual(
      riceCurdRequestFixture,
    );
    expect(completionRequestSchema.parse(dalRequestFixture)).toEqual(
      dalRequestFixture,
    );
    expect(
      completionRequestSchema.parse(insufficientBiryaniRequestFixture),
    ).toEqual(insufficientBiryaniRequestFixture);
  });

  it("rejects invalid budgets", () => {
    expect(() =>
      completionRequestSchema.parse({
        ...riceCurdRequestFixture,
        constraints: {
          ...riceCurdRequestFixture.constraints,
          budgetInr: { max: -1 },
        },
      }),
    ).toThrow();

    expect(() =>
      completionRequestSchema.parse({
        ...riceCurdRequestFixture,
        constraints: {
          ...riceCurdRequestFixture.constraints,
          budgetInr: { min: 250, max: 100 },
        },
      }),
    ).toThrow();
  });

  it("rejects negative ETA values", () => {
    expect(() =>
      completionRequestSchema.parse({
        ...riceCurdRequestFixture,
        constraints: {
          ...riceCurdRequestFixture.constraints,
          maxEtaMinutes: -5,
        },
      }),
    ).toThrow();
  });
});

describe("read-only candidates and recommendations", () => {
  it("accepts Food-only results", () => {
    expect(
      readOnlyRecommendationSchema.parse(foodOnlyRecommendationFixture),
    ).toEqual(foodOnlyRecommendationFixture);
  });

  it("accepts Instamart-only results", () => {
    expect(
      readOnlyRecommendationSchema.parse(instamartOnlyRecommendationFixture),
    ).toEqual(instamartOnlyRecommendationFixture);
  });

  it("accepts both-provider results with one primary candidate", () => {
    const parsed = readOnlyRecommendationSchema.parse(
      bothProviderRecommendationFixture,
    );

    expect(parsed.comparisonStatus).toBe("BOTH_SURFACES");
    expect(parsed.primary.surface).toBe("FOOD");
  });

  it("accepts one-provider failure state", () => {
    expect(providerSearchResultSchema.parse(oneProviderFailureFixture)).toEqual(
      oneProviderFailureFixture,
    );
  });

  it("accepts both-provider failure state", () => {
    expect(
      bothProviderFailureFixture.map((failure) =>
        providerSearchResultSchema.parse(failure),
      ),
    ).toEqual(bothProviderFailureFixture);
  });

  it("accepts no valid completion state", () => {
    expect(
      recommendationSearchResultSchema.parse(noValidCompletionFixture),
    ).toEqual(noValidCompletionFixture);
  });

  it("rejects negative item prices", () => {
    expect(() =>
      readOnlyCandidateSchema.parse({
        ...foodCandidateFixture,
        price: {
          amountInr: -10,
          status: "ITEM_ESTIMATE",
        },
      }),
    ).toThrow();
  });

  it("distinguishes estimated price from future confirmed price", () => {
    expect(candidateSchema.parse(foodCandidateFixture).price.status).toBe(
      "ITEM_ESTIMATE",
    );

    expect(
      candidateSchema.parse({
        ...foodCandidateFixture,
        price: {
          amountInr: 180,
          status: "CART_CONFIRMED",
        },
      }).price.status,
    ).toBe("CART_CONFIRMED");
  });

  it("rejects confirmed checkout totals in M0 recommendation contracts", () => {
    expect(() =>
      readOnlyRecommendationSchema.parse({
        ...bothProviderRecommendationFixture,
        primary: {
          ...bothProviderRecommendationFixture.primary,
          price: {
            amountInr: 180,
            status: "CART_CONFIRMED",
          },
        },
      }),
    ).toThrow();

    expect(() =>
      readOnlyRecommendationSchema.parse({
        ...bothProviderRecommendationFixture,
        checkoutTotalInr: 236,
      }),
    ).toThrow();
  });
});

describe("safe analytics events", () => {
  it("accepts safe estimated-price analytics payloads", () => {
    const parsed = analyticsEventSchema.parse(safeAnalyticsEventFixture);

    expect(parsed.payload).toMatchObject({
      priceStatus: "ITEM_ESTIMATE",
    });
  });

  it("rejects unsafe analytics payloads with raw address, token, or payment data", () => {
    expect(() =>
      analyticsEventSchema.parse({
        name: "home_state_submitted",
        eventId: "event-home-state",
        sessionId: "session-fmd-002",
        occurredAtMs: 1782388800000,
        payload: {
          componentCount: 2,
          hasRawText: true,
          budgetMaxInr: 250,
          rawText: "rice at Flat 2, Tower A",
        },
      }),
    ).toThrow();

    expect(() =>
      analyticsEventSchema.parse({
        name: "provider_search_failed",
        eventId: "event-provider-failed",
        sessionId: "session-fmd-002",
        occurredAtMs: 1782388800000,
        payload: {
          provider: "FOOD",
          errorCode: "UPSTREAM_ERROR",
          durationMs: 1200,
          token: "Bearer secret",
        },
      }),
    ).toThrow();

    expect(() =>
      analyticsEventSchema.parse({
        name: "recommendation_generated",
        eventId: "event-payment-leak",
        sessionId: "session-fmd-002",
        occurredAtMs: 1782388800000,
        payload: {
          recommendationId: "recommendation-rice-curd",
          provider: "FOOD",
          priceStatus: "ITEM_ESTIMATE",
          paymentData: "card ending 1111",
        },
      }),
    ).toThrow();
  });
});
