import { z } from "zod";
import { isoDateTimeSchema } from "./primitives";

export const READ_ONLY_CAPABILITY_ACTION_VALUES = [
  "GET_ADDRESSES",
  "SEARCH_FOOD_CANDIDATES",
  "SEARCH_INSTAMART_CANDIDATES",
  "NORMALISE_CANDIDATES",
  "GENERATE_RECOMMENDATION",
  "CAPTURE_FEEDBACK",
] as const;

export const FORBIDDEN_M0_COMMERCE_ACTION_VALUES = [
  "MUTATE_CART",
  "CLEAR_CART",
  "APPLY_COUPON",
  "CHECKOUT",
  "PAY",
  "PLACE_ORDER",
  "TRACK_ORDER",
] as const;

export const readOnlyCapabilityDeclarationSchema = z.strictObject({
  milestone: z.literal("M0_READ_ONLY_VALIDATION"),
  level: z.literal("read_only"),
  actions: z.array(z.enum(READ_ONLY_CAPABILITY_ACTION_VALUES)).min(1),
  forbiddenActions: z.array(z.enum(FORBIDDEN_M0_COMMERCE_ACTION_VALUES)).min(1),
  liveCommerceEnabled: z.literal(false),
  declaredAt: isoDateTimeSchema,
});

export type ReadOnlyCapabilityAction =
  (typeof READ_ONLY_CAPABILITY_ACTION_VALUES)[number];
export type ForbiddenM0CommerceAction =
  (typeof FORBIDDEN_M0_COMMERCE_ACTION_VALUES)[number];
export type ReadOnlyCapabilityDeclaration = z.infer<
  typeof readOnlyCapabilityDeclarationSchema
>;
