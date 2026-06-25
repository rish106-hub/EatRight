import { z } from "zod";
import { publicErrorSchema } from "./errors";
import { traceIdSchema } from "./primitives";
import { recommendationSearchResultSchema } from "./recommendation";
import { completionRequestSchema } from "./request";

export function apiResultSchema<T extends z.ZodType>(dataSchema: T) {
  return z.discriminatedUnion("ok", [
    z.strictObject({
      ok: z.literal(true),
      data: dataSchema,
      traceId: traceIdSchema,
    }),
    z.strictObject({
      ok: z.literal(false),
      error: publicErrorSchema,
      traceId: traceIdSchema,
    }),
  ]);
}

export const completionApiRequestSchema = completionRequestSchema;
export const completionApiResponseSchema = apiResultSchema(
  recommendationSearchResultSchema,
);

export type ApiResult<T> =
  | { ok: true; data: T; traceId: string }
  | { ok: false; error: z.infer<typeof publicErrorSchema>; traceId: string };

export type CompletionApiRequest = z.infer<typeof completionApiRequestSchema>;
export type CompletionApiResponse = z.infer<typeof completionApiResponseSchema>;
