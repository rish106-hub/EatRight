import { z } from "zod";
import {
  dietPreferenceSchema,
  homeComponentSchema,
  mealWeightSchema,
  quantityConfidenceSchema,
} from "./ontology";
import {
  idSchema,
  nonNegativeIntegerSchema,
  nonNegativeMoneyInrSchema,
  safeShortTextSchema,
} from "./primitives";

export const budgetInrSchema = z
  .strictObject({
    min: nonNegativeMoneyInrSchema.optional(),
    max: nonNegativeMoneyInrSchema,
  })
  .refine(
    (budget) => budget.min === undefined || budget.max >= budget.min,
    "budget max must be greater than or equal to min",
  );

export const homeStateSchema = z.strictObject({
  components: z.array(homeComponentSchema).min(1).max(8),
  rawText: safeShortTextSchema.optional(),
  quantityConfidence: quantityConfidenceSchema,
});

export const userConstraintsSchema = z.strictObject({
  servings: z.union([z.literal(1), z.literal(2)]),
  diet: dietPreferenceSchema,
  exclusions: z.array(safeShortTextSchema).max(12),
  budgetInr: budgetInrSchema,
  maxEtaMinutes: nonNegativeIntegerSchema.optional(),
  mealWeight: mealWeightSchema.optional(),
});

export const completionRequestSchema = z.strictObject({
  sessionId: idSchema,
  requestId: idSchema,
  addressId: idSchema,
  home: homeStateSchema,
  constraints: userConstraintsSchema,
});

export type BudgetInr = z.infer<typeof budgetInrSchema>;
export type HomeState = z.infer<typeof homeStateSchema>;
export type UserConstraints = z.infer<typeof userConstraintsSchema>;
export type CompletionRequest = z.infer<typeof completionRequestSchema>;
