import { z } from "zod";
import { safeReasonTextSchema, traceIdSchema } from "./primitives";

export const PUBLIC_ERROR_CODE_VALUES = [
  "AUTH_REQUIRED",
  "ADDRESS_REQUIRED",
  "INVALID_INPUT",
  "NO_MATCH",
  "FOOD_UNAVAILABLE",
  "INSTAMART_UNAVAILABLE",
  "ALL_PROVIDERS_UNAVAILABLE",
  "UPSTREAM_TIMEOUT",
  "UPSTREAM_ERROR",
  "SCHEMA_MISMATCH",
  "RATE_LIMITED",
  "SESSION_EXPIRED",
  "UNSAFE_STATE",
  "INTERNAL_ERROR",
] as const;

export const publicErrorCodeSchema = z.enum(PUBLIC_ERROR_CODE_VALUES);

export const publicErrorSchema = z.strictObject({
  code: publicErrorCodeSchema,
  message: safeReasonTextSchema,
  changed: z.literal(false),
  safeNextAction: safeReasonTextSchema,
  traceId: traceIdSchema,
});

export type PublicErrorCode = z.infer<typeof publicErrorCodeSchema>;
export type PublicError = z.infer<typeof publicErrorSchema>;
