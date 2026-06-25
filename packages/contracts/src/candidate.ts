import { z } from "zod";
import { candidateDietSchema } from "./ontology";
import {
  idSchema,
  isoDateTimeSchema,
  nonNegativeIntegerSchema,
  nonNegativeMoneyInrSchema,
  positiveIntegerSchema,
  safeDisplayTextSchema,
  safeShortTextSchema,
} from "./primitives";

export const CANDIDATE_SOURCE_VALUES = ["FOOD", "INSTAMART"] as const;
export const CANDIDATE_AVAILABILITY_VALUES = ["AVAILABLE", "UNKNOWN"] as const;
export const PRICE_STATUS_VALUES = ["ITEM_ESTIMATE", "CART_CONFIRMED"] as const;
export const READ_ONLY_PRICE_STATUS_VALUES = ["ITEM_ESTIMATE"] as const;

export const candidateSourceSchema = z.enum(CANDIDATE_SOURCE_VALUES);
export const candidateAvailabilitySchema = z.enum(
  CANDIDATE_AVAILABILITY_VALUES,
);
export const priceStatusSchema = z.enum(PRICE_STATUS_VALUES);
export const readOnlyPriceStatusSchema = z.enum(READ_ONLY_PRICE_STATUS_VALUES);

export const itemPriceSchema = z.strictObject({
  amountInr: nonNegativeMoneyInrSchema,
  status: priceStatusSchema,
});

export const readOnlyItemPriceSchema = z.strictObject({
  amountInr: nonNegativeMoneyInrSchema,
  status: readOnlyPriceStatusSchema,
});

export const sourceTraceSchema = z.strictObject({
  provider: candidateSourceSchema,
  tool: safeShortTextSchema,
  responseRef: idSchema,
  observedAt: isoDateTimeSchema,
});

export const candidateSchema = z.strictObject({
  candidateId: idSchema,
  surface: candidateSourceSchema,
  merchantId: idSchema.optional(),
  merchantName: safeDisplayTextSchema,
  itemId: idSchema,
  variantId: idSchema.optional(),
  displayName: safeDisplayTextSchema,
  quantity: positiveIntegerSchema,
  price: itemPriceSchema,
  etaMinutes: nonNegativeIntegerSchema.optional(),
  availability: candidateAvailabilitySchema,
  diet: candidateDietSchema,
  sourceTrace: sourceTraceSchema,
  semanticTags: z.array(safeShortTextSchema).min(1).max(12),
});

export const readOnlyCandidateSchema = candidateSchema.extend({
  price: readOnlyItemPriceSchema,
});

export type CandidateSource = z.infer<typeof candidateSourceSchema>;
export type CandidateAvailability = z.infer<typeof candidateAvailabilitySchema>;
export type PriceStatus = z.infer<typeof priceStatusSchema>;
export type ItemPrice = z.infer<typeof itemPriceSchema>;
export type ReadOnlyItemPrice = z.infer<typeof readOnlyItemPriceSchema>;
export type SourceTrace = z.infer<typeof sourceTraceSchema>;
export type Candidate = z.infer<typeof candidateSchema>;
export type ReadOnlyCandidate = z.infer<typeof readOnlyCandidateSchema>;
