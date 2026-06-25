import { z } from "zod";
import { candidateSourceSchema } from "./candidate";
import { publicErrorCodeSchema } from "./errors";
import { noMatchReasonSchema } from "./recommendation";
import {
  idSchema,
  nonNegativeIntegerSchema,
  safeShortTextSchema,
} from "./primitives";

export const ANALYTICS_EVENT_NAME_VALUES = [
  "fmd_session_started",
  "swiggy_connect_started",
  "swiggy_connect_succeeded",
  "address_list_loaded",
  "address_selected",
  "home_state_viewed",
  "home_state_submitted",
  "clarification_asked",
  "search_started",
  "provider_search_succeeded",
  "provider_search_failed",
  "recommendation_generated",
  "recommendation_viewed",
  "recommendation_useful",
  "recommendation_rejected",
  "alternative_requested",
  "session_abandoned",
  "privacy_consent_changed",
  "schema_drift_detected",
] as const;

const analyticsBaseSchema = z.strictObject({
  eventId: idSchema,
  sessionId: idSchema,
  occurredAtMs: nonNegativeIntegerSchema,
});

export const analyticsEventNameSchema = z.enum(ANALYTICS_EVENT_NAME_VALUES);

export const analyticsEventSchema = z.discriminatedUnion("name", [
  analyticsBaseSchema.extend({
    name: z.literal("fmd_session_started"),
    payload: z.strictObject({
      source: z.enum(["web", "test_fixture"]),
    }),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("swiggy_connect_started"),
    payload: z.strictObject({}),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("swiggy_connect_succeeded"),
    payload: z.strictObject({}),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("address_list_loaded"),
    payload: z.strictObject({
      count: nonNegativeIntegerSchema,
    }),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("address_selected"),
    payload: z.strictObject({
      addressId: idSchema,
    }),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("home_state_viewed"),
    payload: z.strictObject({}),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("home_state_submitted"),
    payload: z.strictObject({
      componentCount: nonNegativeIntegerSchema,
      hasRawText: z.boolean(),
      budgetMaxInr: nonNegativeIntegerSchema,
    }),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("clarification_asked"),
    payload: z.strictObject({
      reason: safeShortTextSchema,
    }),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("search_started"),
    payload: z.strictObject({
      providers: z.array(candidateSourceSchema).min(1).max(2),
    }),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("provider_search_succeeded"),
    payload: z.strictObject({
      provider: candidateSourceSchema,
      candidateCount: nonNegativeIntegerSchema,
      durationMs: nonNegativeIntegerSchema,
    }),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("provider_search_failed"),
    payload: z.strictObject({
      provider: candidateSourceSchema,
      errorCode: publicErrorCodeSchema,
      durationMs: nonNegativeIntegerSchema,
    }),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("recommendation_generated"),
    payload: z.strictObject({
      recommendationId: idSchema,
      provider: candidateSourceSchema,
      priceStatus: z.literal("ITEM_ESTIMATE"),
    }),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("recommendation_viewed"),
    payload: z.strictObject({
      recommendationId: idSchema,
    }),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("recommendation_useful"),
    payload: z.strictObject({
      recommendationId: idSchema,
      wouldOrder: z.boolean(),
    }),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("recommendation_rejected"),
    payload: z.strictObject({
      recommendationId: idSchema,
      reason: z.enum([
        "TOO_EXPENSIVE",
        "TOO_SLOW",
        "TOO_HEAVY",
        "WRONG_TYPE",
        "NOT_ENOUGH_FOOD",
        "DO_NOT_TRUST",
        "OTHER",
      ]),
    }),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("alternative_requested"),
    payload: z.strictObject({
      recommendationId: idSchema,
    }),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("session_abandoned"),
    payload: z.strictObject({
      stateName: safeShortTextSchema,
    }),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("privacy_consent_changed"),
    payload: z.strictObject({
      analyticsConsent: z.boolean(),
    }),
  }),
  analyticsBaseSchema.extend({
    name: z.literal("schema_drift_detected"),
    payload: z.strictObject({
      provider: candidateSourceSchema,
      toolName: safeShortTextSchema,
      errorCode: z.literal("SCHEMA_MISMATCH"),
    }),
  }),
]);

export const noMatchAnalyticsPayloadSchema = z.strictObject({
  reason: noMatchReasonSchema,
  providerFailures: z.array(candidateSourceSchema).max(2),
});

export type AnalyticsEventName = z.infer<typeof analyticsEventNameSchema>;
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
export type NoMatchAnalyticsPayload = z.infer<
  typeof noMatchAnalyticsPayloadSchema
>;
