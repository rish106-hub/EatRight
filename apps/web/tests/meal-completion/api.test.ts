import { describe, expect, it, vi } from "vitest";
import type { CompletionRequest } from "@finish-my-dinner/contracts";
import { plannerOutcomeSchema } from "@finish-my-dinner/planner";
import {
  handleMealCompletionRequest,
  type MealCompletionHandlerOptions,
} from "../../src/server/meal-completion/handler";
import type { MealCompletionLogEvent } from "../../src/server/meal-completion/logger";
import {
  mealCompletionApiResponseSchema,
  type MealCompletionApiResponse,
} from "../../src/server/meal-completion/schema";

const safeEnv = {
  APP_ENV: "local",
  MCP_ENV: "stub",
  CAPABILITY_LEVEL: "read_only",
  ALLOW_REAL_SWIGGY_MUTATIONS: "false",
  ALLOW_REAL_SWIGGY_ORDERS: "false",
};

describe("POST /api/meal-completion", () => {
  it("returns one validated recommendation for rice + curd", async () => {
    const response = await postJson(baseRequest());
    const body = await parsedJson(response);

    expect(response.status).toBe(200);
    expect(mealCompletionApiResponseSchema.parse(body)).toMatchObject({
      ok: true,
      capability: {
        mode: "demo_read_only",
        mcpEnv: "stub",
        capabilityLevel: "read_only",
        realCommerceActionsEnabled: false,
      },
    });
    expect(body.ok).toBe(true);
    if (body.ok && body.outcome.status === "RECOMMENDATION_READY") {
      expect(body.outcome.status).toBe("RECOMMENDATION_READY");
      expect(body.outcome.missingComponent).toBe("NEED_MAIN");
      expect(body.outcome.selectedProvider).toMatch(/FOOD|INSTAMART/);
      expect(body.outcome.recommendation.primary).toEqual(
        body.outcome.selectedCandidate,
      );
    } else {
      throw new Error("Expected a recommendation outcome.");
    }
  });

  it("returns a valid base-completion outcome for dal", async () => {
    const response = await postJson(
      baseRequest({
        requestId: "request-dal-api",
        home: { components: ["MAIN_DAL"], quantityConfidence: "HIGH" },
      }),
    );
    const body = await parsedJson(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    if (body.ok && body.outcome.status === "RECOMMENDATION_READY") {
      expect(body.outcome.status).toBe("RECOMMENDATION_READY");
      expect(body.outcome.missingComponent).toBe("NEED_BASE");
      expect(body.outcome.selectedCandidate.semanticTags).toContain("base");
    } else {
      throw new Error("Expected a recommendation outcome.");
    }
  });

  it("returns HTTP 200 for a valid no-match planner outcome", async () => {
    const response = await postJson(
      baseRequest({
        requestId: "request-no-match-api",
        constraints: {
          ...baseRequest().constraints,
          budgetInr: { max: 1 },
        },
      }),
    );
    const body = await parsedJson(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    if (body.ok) {
      expect(body.outcome.status).toBe("NO_VALID_COMPLETION");
    }
  });

  it("returns HTTP 200 for a valid standard handoff outcome", async () => {
    const response = await postJson(
      baseRequest({
        requestId: "request-handoff-api",
        home: {
          components: ["NOTHING_USEFUL"],
          quantityConfidence: "LOW",
        },
      }),
    );
    const body = await parsedJson(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    if (body.ok) {
      expect(body.outcome.status).toBe("STANDARD_SWIGGY_HANDOFF_REQUIRED");
      expect(body.outcome.suggestedAction).toBe("STANDARD_SWIGGY_SEARCH");
    }
  });

  it("returns HTTP 200 for a valid insufficient-information outcome", async () => {
    const response = await postJson(
      baseRequest({
        requestId: "request-insufficient-api",
        home: {
          components: ["UNKNOWN"],
          quantityConfidence: "LOW",
        },
      }),
    );
    const body = await parsedJson(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    if (body.ok) {
      expect(body.outcome.status).toBe("INSUFFICIENT_INFORMATION");
    }
  });

  it("returns HTTP 200 when one provider fails and the other succeeds", async () => {
    const response = await postJson(
      baseRequest({
        requestId: "request-one-provider-failure-api",
        addressId: "address-sample-work",
        home: { components: ["MAIN_DAL"], quantityConfidence: "HIGH" },
      }),
    );
    const body = await parsedJson(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    if (body.ok && body.outcome.status === "RECOMMENDATION_READY") {
      expect(body.outcome.status).toBe("RECOMMENDATION_READY");
      expect(body.outcome.providerSummary.FOOD.status).toBe("FAILURE");
      expect(body.outcome.selectedProvider).toBe("INSTAMART");
    } else {
      throw new Error("Expected a recommendation outcome.");
    }
  });

  it("returns HTTP 200 with both-provider failure outcome", async () => {
    const response = await postJson(
      baseRequest({
        requestId: "request-both-provider-failure-api",
        addressId: "address-sample-other",
      }),
    );
    const body = await parsedJson(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    if (body.ok && body.outcome.status === "BOTH_PROVIDERS_FAILED") {
      expect(body.outcome.status).toBe("BOTH_PROVIDERS_FAILED");
      expect(body.outcome.providerSummary.FOOD.status).toBe("FAILURE");
      expect(body.outcome.providerSummary.INSTAMART.status).toBe("FAILURE");
    } else {
      throw new Error("Expected a both-provider failure outcome.");
    }
  });

  it("rejects unsupported content type with 415", async () => {
    const response = await handleMealCompletionRequest(
      new Request("https://fmd.test/api/meal-completion", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "hello",
      }),
      handlerOptions(),
    );
    const body = await parsedJson(response);

    expect(response.status).toBe(415);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "UNSUPPORTED_CONTENT_TYPE" },
    });
  });

  it("rejects malformed JSON with 400", async () => {
    const response = await handleMealCompletionRequest(
      new Request("https://fmd.test/api/meal-completion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      }),
      handlerOptions(),
    );
    const body = await parsedJson(response);

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "MALFORMED_JSON" },
    });
  });

  it("rejects invalid CompletionRequest with 422", async () => {
    const invalidRequest = { ...baseRequest(), sessionId: "" };
    const response = await postJson(invalidRequest);
    const body = await parsedJson(response);

    expect(response.status).toBe(422);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "INVALID_REQUEST" },
    });
  });

  it("rejects unknown demo address ID with 422", async () => {
    const response = await postJson(
      baseRequest({ addressId: "address-not-in-demo-map" }),
    );
    const body = await parsedJson(response);

    expect(response.status).toBe(422);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "UNKNOWN_DEMO_ADDRESS" },
    });
  });

  it("rejects extra unsafe request fields according to the contract", async () => {
    const response = await postJson({
      ...baseRequest(),
      checkout: "never allowed",
    });
    const body = await parsedJson(response);

    expect(response.status).toBe(422);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "INVALID_REQUEST" },
    });
  });

  it("returns a response that validates against the route runtime schema", async () => {
    const response = await postJson(baseRequest());
    const body = await parsedJson(response);

    expect(() => mealCompletionApiResponseSchema.parse(body)).not.toThrow();
  });

  it("returns a planner outcome that validates against plannerOutcomeSchema", async () => {
    const response = await postJson(baseRequest());
    const body = await parsedJson(response);

    expect(body.ok).toBe(true);
    if (body.ok) {
      expect(() => plannerOutcomeSchema.parse(body.outcome)).not.toThrow();
    }
  });

  it("sets Cache-Control: no-store", async () => {
    const response = await postJson(baseRequest());

    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("does not return cart, checkout, coupon, payment, order, or tracking fields", async () => {
    const response = await postJson(baseRequest());
    const body = await parsedJson(response);

    expect(findForbiddenCommerceKeys(body)).toEqual([]);
  });

  it("does not make an external network call", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    try {
      const response = await postJson(baseRequest());
      expect(response.status).toBe(200);
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("fails closed under unsafe capability configuration", async () => {
    const response = await postJson(baseRequest(), {
      env: {
        ...safeEnv,
        CAPABILITY_LEVEL: "cart_only",
      },
    });
    const body = await parsedJson(response);

    expect(response.status).toBe(500);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "UNSAFE_RUNTIME_CONFIGURATION" },
    });
  });

  it("logs only allowed metadata", async () => {
    const entries: MealCompletionLogEvent[] = [];
    const response = await postJson(baseRequest(), {
      logger: { info: (event) => entries.push(event) },
    });

    expect(response.status).toBe(200);
    expect(entries).toHaveLength(1);
    expect(Object.keys(entries[0] ?? {}).sort()).toEqual(
      [
        "capabilityMode",
        "correlationId",
        "durationMs",
        "endpoint",
        "httpStatus",
        "outcomeStatus",
        "selectedProvider",
      ].sort(),
    );
  });

  it("produces deterministic outcomes for repeated identical inputs", async () => {
    const request = baseRequest({ requestId: "request-deterministic-api" });
    const first = await parsedJson(await postJson(request));
    const second = await parsedJson(await postJson(request));

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.outcome).toEqual(first.outcome);
    }
  });
});

function baseRequest(
  patch: Partial<CompletionRequest> & {
    home?: Partial<CompletionRequest["home"]>;
    constraints?: Partial<CompletionRequest["constraints"]>;
  } = {},
): CompletionRequest {
  const base = baseRequestShape();
  return {
    ...base,
    ...patch,
    home: {
      ...base.home,
      ...patch.home,
    },
    constraints: {
      ...base.constraints,
      ...patch.constraints,
    },
  };
}

function baseRequestShape(): CompletionRequest {
  return {
    sessionId: "session-api-test",
    requestId: "request-rice-curd-api",
    addressId: "address-sample-home",
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
}

async function postJson(
  body: unknown,
  options: MealCompletionHandlerOptions = {},
): Promise<Response> {
  return handleMealCompletionRequest(
    new Request("https://fmd.test/api/meal-completion", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
    handlerOptions(options),
  );
}

function handlerOptions(
  options: MealCompletionHandlerOptions = {},
): MealCompletionHandlerOptions {
  return {
    env: safeEnv,
    createCorrelationId: () => "correlation-test",
    nowMs: () => 1_000,
    logger: { info: () => undefined },
    ...options,
  };
}

async function parsedJson(
  response: Response,
): Promise<MealCompletionApiResponse> {
  return mealCompletionApiResponseSchema.parse(await response.json());
}

function findForbiddenCommerceKeys(value: unknown): string[] {
  const forbidden = /cart|checkout|coupon|payment|order|tracking/i;
  const found: string[] = [];
  const visit = (candidate: unknown, path: string): void => {
    if (candidate === null || typeof candidate !== "object") {
      return;
    }

    for (const [key, nested] of Object.entries(candidate)) {
      const nextPath = path === "" ? key : `${path}.${key}`;
      if (forbidden.test(key)) {
        found.push(nextPath);
      }
      visit(nested, nextPath);
    }
  };
  visit(value, "");
  return found;
}
