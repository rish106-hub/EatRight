import { z } from "zod";
import {
  addressServiceabilityContextSchema,
  candidateSourceSchema,
  completionRequestSchema,
  missingComponentSchema,
  noMatchReasonSchema,
  providerFailureReasonSchema,
  readOnlyCandidateSchema,
  readOnlyRecommendationSchema,
  serviceabilityStatusSchema,
} from "@finish-my-dinner/contracts";

const nonNegativeIntegerSchema = z.number().int().min(0);
const nonNegativeMoneyInrSchema = z.number().min(0).finite();
const safeShortTextSchema = z.string().trim().min(1).max(80);
const safeReasonTextSchema = z.string().trim().min(1).max(240);

export const PLANNER_OUTCOME_STATUS_VALUES = [
  "RECOMMENDATION_READY",
  "NO_VALID_COMPLETION",
  "INSUFFICIENT_INFORMATION",
  "NO_PURCHASE_REQUIRED",
  "UNSERVICEABLE",
  "BOTH_PROVIDERS_FAILED",
  "STANDARD_SWIGGY_HANDOFF_REQUIRED",
] as const;

export const PLANNER_SUGGESTED_ACTION_VALUES = [
  "EDIT_HOME_STATE",
  "ADJUST_BUDGET",
  "ADJUST_MAX_ETA",
  "RELAX_DIET",
  "REMOVE_EXCLUSION",
  "TRY_ANOTHER_ADDRESS",
  "TRY_AGAIN",
  "STANDARD_SWIGGY_SEARCH",
  "NONE",
] as const;

export const REJECTION_CODE_VALUES = [
  "NOT_SERVICEABLE",
  "UNAVAILABLE",
  "DIET",
  "EXCLUSION",
  "OVER_BUDGET",
  "OVER_MAX_ETA",
  "MISSING_COMPONENT_FIT",
  "INVALID_CONTRACT",
  "NON_ESTIMATED_PRICE",
] as const;

export const RULE_ID_VALUES = [
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
] as const;

export const scoreBreakdownSchema = z.strictObject({
  mealFit: nonNegativeIntegerSchema.max(100),
  budgetFit: nonNegativeIntegerSchema.max(100),
  etaFit: nonNegativeIntegerSchema.max(100),
  providerReliabilityFit: nonNegativeIntegerSchema.max(100),
  minimumUsefulPurchaseFit: nonNegativeIntegerSchema.max(100),
  statedPreferenceFit: nonNegativeIntegerSchema.max(100),
  total: nonNegativeIntegerSchema.max(100),
});

export const scoredCandidateSchema = z.strictObject({
  candidate: readOnlyCandidateSchema,
  score: scoreBreakdownSchema,
});

export const providerSearchSummarySchema = z.strictObject({
  provider: candidateSourceSchema,
  status: z.enum(["SUCCESS", "FAILURE", "SKIPPED"]),
  serviceability: serviceabilityStatusSchema,
  searchedQueryCount: nonNegativeIntegerSchema.max(3),
  candidateCount: nonNegativeIntegerSchema,
  validCandidateCount: nonNegativeIntegerSchema,
  failureReason: providerFailureReasonSchema.optional(),
});

export const providerSummarySchema = z.strictObject({
  FOOD: providerSearchSummarySchema,
  INSTAMART: providerSearchSummarySchema,
});

export const rejectedCandidateSummarySchema = z.strictObject({
  candidateId: safeShortTextSchema,
  provider: candidateSourceSchema,
  reasons: z.array(z.enum(REJECTION_CODE_VALUES)).min(1).max(8),
});

const basePlannerOutcomeSchema = z.strictObject({
  requestId: safeShortTextSchema,
  missingComponent: missingComponentSchema,
  ruleId: z.enum(RULE_ID_VALUES),
  suggestedAction: z.enum(PLANNER_SUGGESTED_ACTION_VALUES),
  summary: safeReasonTextSchema,
});

export const recommendationReadyPlannerOutcomeSchema =
  basePlannerOutcomeSchema.extend({
    status: z.literal("RECOMMENDATION_READY"),
    recommendation: readOnlyRecommendationSchema,
    selectedProvider: candidateSourceSchema,
    selectedCandidate: readOnlyCandidateSchema,
    estimatedPriceInr: nonNegativeMoneyInrSchema,
    estimatedEtaMinutes: nonNegativeIntegerSchema.optional(),
    score: scoreBreakdownSchema,
    providerSummary: providerSummarySchema,
    rejectedCandidates: z.array(rejectedCandidateSummarySchema).max(50),
    suggestedAction: z.literal("NONE"),
  });

export const noValidCompletionPlannerOutcomeSchema =
  basePlannerOutcomeSchema.extend({
    status: z.literal("NO_VALID_COMPLETION"),
    reason: noMatchReasonSchema,
    providerSummary: providerSummarySchema,
    rejectedCandidates: z.array(rejectedCandidateSummarySchema).max(50),
  });

export const insufficientInformationPlannerOutcomeSchema =
  basePlannerOutcomeSchema.extend({
    status: z.literal("INSUFFICIENT_INFORMATION"),
    suggestedAction: z.literal("EDIT_HOME_STATE"),
  });

export const noPurchaseRequiredPlannerOutcomeSchema =
  basePlannerOutcomeSchema.extend({
    status: z.literal("NO_PURCHASE_REQUIRED"),
    suggestedAction: z.literal("NONE"),
    homeSummary: z.array(safeShortTextSchema).min(1).max(8),
  });

export const unserviceablePlannerOutcomeSchema =
  basePlannerOutcomeSchema.extend({
    status: z.literal("UNSERVICEABLE"),
    suggestedAction: z.literal("TRY_ANOTHER_ADDRESS"),
    providerSummary: providerSummarySchema,
  });

export const bothProvidersFailedPlannerOutcomeSchema =
  basePlannerOutcomeSchema.extend({
    status: z.literal("BOTH_PROVIDERS_FAILED"),
    suggestedAction: z.literal("TRY_AGAIN"),
    providerSummary: providerSummarySchema,
  });

export const standardSwiggyHandoffPlannerOutcomeSchema =
  basePlannerOutcomeSchema.extend({
    status: z.literal("STANDARD_SWIGGY_HANDOFF_REQUIRED"),
    missingComponent: z.literal("NEED_COMPLETE_MEAL"),
    suggestedAction: z.literal("STANDARD_SWIGGY_SEARCH"),
  });

export const plannerOutcomeSchema = z.discriminatedUnion("status", [
  recommendationReadyPlannerOutcomeSchema,
  noValidCompletionPlannerOutcomeSchema,
  insufficientInformationPlannerOutcomeSchema,
  noPurchaseRequiredPlannerOutcomeSchema,
  unserviceablePlannerOutcomeSchema,
  bothProvidersFailedPlannerOutcomeSchema,
  standardSwiggyHandoffPlannerOutcomeSchema,
]);

export const plannerInputSchema = z.strictObject({
  request: completionRequestSchema,
  serviceability: addressServiceabilityContextSchema,
});

export type PlannerOutcomeStatus =
  (typeof PLANNER_OUTCOME_STATUS_VALUES)[number];
export type PlannerSuggestedAction =
  (typeof PLANNER_SUGGESTED_ACTION_VALUES)[number];
export type RejectionCode = (typeof REJECTION_CODE_VALUES)[number];
export type RuleId = (typeof RULE_ID_VALUES)[number];
export type ScoreBreakdown = z.infer<typeof scoreBreakdownSchema>;
export type ScoredCandidate = z.infer<typeof scoredCandidateSchema>;
export type ProviderSearchSummary = z.infer<typeof providerSearchSummarySchema>;
export type ProviderSummary = z.infer<typeof providerSummarySchema>;
export type RejectedCandidateSummary = z.infer<
  typeof rejectedCandidateSummarySchema
>;
export type PlanMealCompletionInput = z.infer<typeof plannerInputSchema>;
export type PlannerOutcome = z.infer<typeof plannerOutcomeSchema>;
