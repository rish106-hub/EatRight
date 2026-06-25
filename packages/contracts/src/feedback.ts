import { z } from "zod";
import { idSchema } from "./primitives";

export const RECOMMENDATION_REJECTION_REASON_VALUES = [
  "TOO_EXPENSIVE",
  "TOO_SLOW",
  "TOO_HEAVY",
  "WRONG_TYPE",
  "NOT_ENOUGH_FOOD",
  "DO_NOT_TRUST",
  "OTHER",
] as const;

export const recommendationRejectionReasonSchema = z.enum(
  RECOMMENDATION_REJECTION_REASON_VALUES,
);

export const recommendationFeedbackSchema = z.strictObject({
  recommendationId: idSchema,
  useful: z.boolean(),
  wouldOrder: z.boolean(),
  rejectionReason: recommendationRejectionReasonSchema.optional(),
});

export type RecommendationRejectionReason = z.infer<
  typeof recommendationRejectionReasonSchema
>;
export type RecommendationFeedback = z.infer<
  typeof recommendationFeedbackSchema
>;
