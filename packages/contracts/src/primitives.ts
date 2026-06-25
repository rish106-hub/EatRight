import { z } from "zod";

export const isoDateTimeSchema = z.iso.datetime({ offset: true });

export const idSchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/);

export const traceIdSchema = idSchema;

export const safeDisplayTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(180)
  .refine((value) => !containsUnsafeSecretLikeText(value), {
    message: "must not contain token, payment, or raw address-like text",
  });

export const safeShortTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .refine((value) => !containsUnsafeSecretLikeText(value), {
    message: "must not contain token, payment, or raw address-like text",
  });

export const safeReasonTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(240)
  .refine((value) => !containsUnsafeSecretLikeText(value), {
    message: "must not contain token, payment, or raw address-like text",
  });

export const nonNegativeIntegerSchema = z.number().int().min(0);
export const positiveIntegerSchema = z.number().int().positive();
export const nonNegativeMoneyInrSchema = z.number().min(0).finite();

export function containsUnsafeSecretLikeText(value: string): boolean {
  const lowered = value.toLowerCase();
  const unsafePatterns = [
    /\bbearer\s+[a-z0-9._-]+/i,
    /\boauth\b/i,
    /\baccess[_ -]?token\b/i,
    /\brefresh[_ -]?token\b/i,
    /\bapi[_ -]?key\b/i,
    /\bpayment\b/i,
    /\bcard\b/i,
    /\bcvv\b/i,
    /\bupi\b/i,
    /\border[_ -]?id\b/i,
    /\bcheckout\b/i,
  ];

  if (unsafePatterns.some((pattern) => pattern.test(value))) {
    return true;
  }

  const addressHints = [
    "flat ",
    "apartment",
    "tower",
    "floor",
    "street",
    "road",
    "sector",
    "pin ",
    "pincode",
    "landmark",
  ];

  return addressHints.some((hint) => lowered.includes(hint));
}
