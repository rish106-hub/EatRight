import { z } from "zod";
import { plannerOutcomeSchema } from "@finish-my-dinner/planner";

export const MEAL_COMPLETION_API_VERSION = "meal-completion.v1";
export const MEAL_COMPLETION_CAPABILITY_MODE = "demo_read_only";

const correlationIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/);

const fieldIssueSchema = z.strictObject({
  path: z.string().trim().max(120),
  message: z.string().trim().min(1).max(160),
});

export const mealCompletionCapabilityMarkerSchema = z.strictObject({
  mode: z.literal(MEAL_COMPLETION_CAPABILITY_MODE),
  mcpEnv: z.literal("stub"),
  capabilityLevel: z.literal("read_only"),
  realCommerceActionsEnabled: z.literal(false),
});

export const mealCompletionApiErrorCodeSchema = z.enum([
  "UNSUPPORTED_CONTENT_TYPE",
  "MALFORMED_JSON",
  "REQUEST_TOO_LARGE",
  "INVALID_REQUEST",
  "UNKNOWN_DEMO_ADDRESS",
  "UNSAFE_RUNTIME_CONFIGURATION",
  "INTERNAL_PLANNER_INVARIANT",
]);

export const mealCompletionApiErrorSchema = z.strictObject({
  code: mealCompletionApiErrorCodeSchema,
  message: z.string().trim().min(1).max(180),
  fieldIssues: z.array(fieldIssueSchema).max(12).optional(),
});

export const mealCompletionSuccessEnvelopeSchema = z.strictObject({
  ok: z.literal(true),
  apiVersion: z.literal(MEAL_COMPLETION_API_VERSION),
  correlationId: correlationIdSchema,
  capability: mealCompletionCapabilityMarkerSchema,
  outcome: plannerOutcomeSchema,
});

export const mealCompletionErrorEnvelopeSchema = z.strictObject({
  ok: z.literal(false),
  apiVersion: z.literal(MEAL_COMPLETION_API_VERSION),
  correlationId: correlationIdSchema,
  error: mealCompletionApiErrorSchema,
});

export const mealCompletionApiResponseSchema = z.discriminatedUnion("ok", [
  mealCompletionSuccessEnvelopeSchema,
  mealCompletionErrorEnvelopeSchema,
]);

export type MealCompletionApiErrorCode = z.infer<
  typeof mealCompletionApiErrorCodeSchema
>;
export type MealCompletionApiResponse = z.infer<
  typeof mealCompletionApiResponseSchema
>;
