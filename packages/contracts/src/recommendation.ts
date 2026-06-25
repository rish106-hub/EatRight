import { z } from "zod";
import { readOnlyCandidateSchema } from "./candidate";
import { mealCompletionIntentSchema, missingComponentSchema } from "./ontology";
import {
  idSchema,
  safeDisplayTextSchema,
  safeReasonTextSchema,
  safeShortTextSchema,
} from "./primitives";

export const COMPARISON_STATUS_VALUES = [
  "BOTH_SURFACES",
  "FOOD_ONLY",
  "INSTAMART_ONLY",
] as const;
export const CONFIDENCE_VALUES = ["LOW", "MEDIUM", "HIGH"] as const;
export const ASSUMPTION_KIND_VALUES = [
  "HOME_QUANTITY",
  "DIET_PREFERENCE",
  "BUDGET",
  "ETA",
  "PROVIDER_DATA",
] as const;
export const EXPLANATION_REASON_VALUES = [
  "ADDS_MISSING_BASE",
  "ADDS_MISSING_MAIN",
  "ADDS_MISSING_PROTEIN",
  "ADDS_MISSING_SIDE",
  "ADDS_VOLUME",
  "SINGLE_SURFACE_MATCH",
  "WITHIN_BUDGET",
  "WITHIN_ETA",
  "READ_ONLY_PRICE_ESTIMATE",
] as const;
export const NO_MATCH_REASON_VALUES = [
  "OVER_BUDGET",
  "NO_VEGETARIAN_MATCH",
  "NOT_SERVICEABLE",
  "SINGLE_SURFACE_UNAVAILABLE",
  "PROVIDER_UNAVAILABLE",
  "INSUFFICIENT_INFORMATION",
  "NO_VALID_COMPLETION",
] as const;

export const comparisonStatusSchema = z.enum(COMPARISON_STATUS_VALUES);
export const confidenceSchema = z.enum(CONFIDENCE_VALUES);
export const assumptionKindSchema = z.enum(ASSUMPTION_KIND_VALUES);
export const explanationReasonSchema = z.enum(EXPLANATION_REASON_VALUES);
export const noMatchReasonSchema = z.enum(NO_MATCH_REASON_VALUES);

export const assumptionSchema = z.strictObject({
  assumptionId: idSchema,
  kind: assumptionKindSchema,
  label: safeReasonTextSchema,
});

export const recommendationExplanationSchema = z.strictObject({
  summary: safeReasonTextSchema,
  reasonCodes: z.array(explanationReasonSchema).min(1).max(8),
});

export const readOnlyRecommendationSchema = z.strictObject({
  recommendationId: idSchema,
  requestId: idSchema,
  intent: mealCompletionIntentSchema,
  homeSummary: z.array(safeDisplayTextSchema).min(1).max(8),
  missingComponent: missingComponentSchema,
  primary: readOnlyCandidateSchema,
  explanation: recommendationExplanationSchema,
  assumptions: z.array(assumptionSchema).max(6),
  comparisonStatus: comparisonStatusSchema,
  confidence: confidenceSchema,
  rejectedHardConstraints: z.array(safeShortTextSchema).max(12),
});

export const searchNoMatchSchema = z.strictObject({
  status: z.literal("NO_MATCH"),
  requestId: idSchema,
  missingComponent: missingComponentSchema,
  reason: noMatchReasonSchema,
  message: safeReasonTextSchema,
  safeNextAction: safeReasonTextSchema,
});

export const recommendationSearchResultSchema = z.discriminatedUnion("status", [
  z.strictObject({
    status: z.literal("RECOMMENDATION_READY"),
    recommendation: readOnlyRecommendationSchema,
  }),
  searchNoMatchSchema,
]);

export type ComparisonStatus = z.infer<typeof comparisonStatusSchema>;
export type Confidence = z.infer<typeof confidenceSchema>;
export type AssumptionKind = z.infer<typeof assumptionKindSchema>;
export type ExplanationReason = z.infer<typeof explanationReasonSchema>;
export type NoMatchReason = z.infer<typeof noMatchReasonSchema>;
export type Assumption = z.infer<typeof assumptionSchema>;
export type RecommendationExplanation = z.infer<
  typeof recommendationExplanationSchema
>;
export type ReadOnlyRecommendation = z.infer<
  typeof readOnlyRecommendationSchema
>;
export type SearchNoMatch = z.infer<typeof searchNoMatchSchema>;
export type RecommendationSearchResult = z.infer<
  typeof recommendationSearchResultSchema
>;
