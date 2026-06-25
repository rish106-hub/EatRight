import { z } from "zod";
import { publicErrorSchema } from "./errors";
import { idSchema } from "./primitives";
import {
  noMatchReasonSchema,
  readOnlyRecommendationSchema,
} from "./recommendation";
import { completionRequestSchema, homeStateSchema } from "./request";

export const productStateSchema = z.discriminatedUnion("name", [
  z.strictObject({ name: z.literal("BOOT") }),
  z.strictObject({ name: z.literal("AUTH_REQUIRED") }),
  z.strictObject({ name: z.literal("AUTHENTICATING") }),
  z.strictObject({ name: z.literal("ADDRESS_REQUIRED") }),
  z.strictObject({
    name: z.literal("HOME_STATE_REQUIRED"),
    addressId: idSchema,
  }),
  z.strictObject({
    name: z.literal("CLARIFICATION_REQUIRED"),
    draft: homeStateSchema,
  }),
  z.strictObject({
    name: z.literal("SEARCHING"),
    request: completionRequestSchema,
  }),
  z.strictObject({
    name: z.literal("RECOMMENDATION_READY"),
    recommendation: readOnlyRecommendationSchema,
  }),
  z.strictObject({
    name: z.literal("NO_MATCH"),
    reason: noMatchReasonSchema,
  }),
  z.strictObject({
    name: z.literal("FEEDBACK_REQUIRED"),
    recommendationId: idSchema,
  }),
  z.strictObject({ name: z.literal("COMPLETE") }),
  z.strictObject({
    name: z.literal("RECOVERABLE_ERROR"),
    error: publicErrorSchema,
  }),
  z.strictObject({
    name: z.literal("FATAL_ERROR"),
    error: publicErrorSchema,
  }),
]);

export type ProductState = z.infer<typeof productStateSchema>;
