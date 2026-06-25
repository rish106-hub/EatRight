import { z } from "zod";
import {
  candidateSourceSchema,
  readOnlyCandidateSchema,
  type CandidateSource,
  type ReadOnlyCandidate,
} from "./candidate";
import { completionRequestSchema } from "./request";
import {
  idSchema,
  isoDateTimeSchema,
  nonNegativeIntegerSchema,
  safeDisplayTextSchema,
  safeReasonTextSchema,
  safeShortTextSchema,
} from "./primitives";

export const SERVICEABILITY_STATUS_VALUES = [
  "SERVICEABLE",
  "NOT_SERVICEABLE",
  "UNKNOWN",
] as const;
export const PROVIDER_HEALTH_VALUES = [
  "AVAILABLE",
  "DEGRADED",
  "UNAVAILABLE",
] as const;
export const PROVIDER_FAILURE_REASON_VALUES = [
  "AUTH_REQUIRED",
  "TIMEOUT",
  "UPSTREAM_ERROR",
  "SCHEMA_MISMATCH",
  "RATE_LIMITED",
  "SERVICE_UNAVAILABLE",
] as const;

export const serviceabilityStatusSchema = z.enum(SERVICEABILITY_STATUS_VALUES);
export const providerHealthSchema = z.enum(PROVIDER_HEALTH_VALUES);
export const providerFailureReasonSchema = z.enum(
  PROVIDER_FAILURE_REASON_VALUES,
);

export const addressServiceabilityContextSchema = z.strictObject({
  addressId: idSchema,
  selectedByUser: z.literal(true),
  serviceability: z.record(candidateSourceSchema, serviceabilityStatusSchema),
  checkedAt: isoDateTimeSchema,
});

export const providerFailureSchema = z.strictObject({
  provider: candidateSourceSchema,
  reason: providerFailureReasonSchema,
  retryable: z.boolean(),
  message: safeReasonTextSchema,
});

export const providerHealthStateSchema = z.discriminatedUnion("status", [
  z.strictObject({
    status: z.literal("AVAILABLE"),
    provider: candidateSourceSchema,
    checkedAt: isoDateTimeSchema,
  }),
  z.strictObject({
    status: z.literal("DEGRADED"),
    provider: candidateSourceSchema,
    checkedAt: isoDateTimeSchema,
    reason: providerFailureReasonSchema,
  }),
  z.strictObject({
    status: z.literal("UNAVAILABLE"),
    provider: candidateSourceSchema,
    checkedAt: isoDateTimeSchema,
    reason: providerFailureReasonSchema,
  }),
]);

export const providerSearchRequestSchema = z.strictObject({
  request: completionRequestSchema,
  query: safeShortTextSchema,
  limit: nonNegativeIntegerSchema.max(20),
});

export const providerSearchSuccessSchema = z.strictObject({
  status: z.literal("SUCCESS"),
  provider: candidateSourceSchema,
  candidates: z.array(readOnlyCandidateSchema),
  searchedAt: isoDateTimeSchema,
});

export const providerSearchFailureSchema = z.strictObject({
  status: z.literal("FAILURE"),
  failure: providerFailureSchema,
  searchedAt: isoDateTimeSchema,
});

export const providerSearchResultSchema = z.discriminatedUnion("status", [
  providerSearchSuccessSchema,
  providerSearchFailureSchema,
]);

export const normalisationInputSchema = z.strictObject({
  provider: candidateSourceSchema,
  responseRef: idSchema,
  observedAt: isoDateTimeSchema,
  sanitizedDisplayName: safeDisplayTextSchema,
  semanticTags: z.array(safeShortTextSchema).min(1).max(12),
});

export interface FoodCandidateSearchPort {
  searchFoodCandidates(
    request: ProviderSearchRequest,
  ): Promise<ProviderSearchResult>;
}

export interface InstamartCandidateSearchPort {
  searchInstamartCandidates(
    request: ProviderSearchRequest,
  ): Promise<ProviderSearchResult>;
}

export interface CandidateNormalisationPort {
  normaliseCandidate(input: NormalisationInput): Promise<ReadOnlyCandidate>;
}

export interface ProviderHealthPort {
  getProviderHealth(provider: CandidateSource): Promise<ProviderHealthState>;
}

export type ServiceabilityStatus = z.infer<typeof serviceabilityStatusSchema>;
export type ProviderHealth = z.infer<typeof providerHealthSchema>;
export type ProviderFailureReason = z.infer<typeof providerFailureReasonSchema>;
export type AddressServiceabilityContext = z.infer<
  typeof addressServiceabilityContextSchema
>;
export type ProviderFailure = z.infer<typeof providerFailureSchema>;
export type ProviderHealthState = z.infer<typeof providerHealthStateSchema>;
export type ProviderSearchRequest = z.infer<typeof providerSearchRequestSchema>;
export type ProviderSearchSuccess = z.infer<typeof providerSearchSuccessSchema>;
export type ProviderSearchFailure = z.infer<typeof providerSearchFailureSchema>;
export type ProviderSearchResult = z.infer<typeof providerSearchResultSchema>;
export type NormalisationInput = z.infer<typeof normalisationInputSchema>;
