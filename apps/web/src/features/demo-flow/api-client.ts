import { z } from "zod";
import {
  completionRequestSchema,
  type CompletionRequest,
} from "@finish-my-dinner/contracts";
import {
  plannerOutcomeSchema,
  type PlannerOutcome,
} from "@finish-my-dinner/planner";

const apiVersionSchema = z.literal("meal-completion.v1");
const correlationIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/);

const fieldIssueSchema = z.strictObject({
  path: z.string().trim().max(120),
  message: z.string().trim().min(1).max(160),
});

const apiErrorSchema = z.strictObject({
  code: z.enum([
    "UNSUPPORTED_CONTENT_TYPE",
    "MALFORMED_JSON",
    "REQUEST_TOO_LARGE",
    "INVALID_REQUEST",
    "UNKNOWN_DEMO_ADDRESS",
    "UNSAFE_RUNTIME_CONFIGURATION",
    "INTERNAL_PLANNER_INVARIANT",
  ]),
  message: z.string().trim().min(1).max(180),
  fieldIssues: z.array(fieldIssueSchema).max(12).optional(),
});

const successEnvelopeSchema = z.strictObject({
  ok: z.literal(true),
  apiVersion: apiVersionSchema,
  correlationId: correlationIdSchema,
  capability: z.strictObject({
    mode: z.literal("demo_read_only"),
    mcpEnv: z.literal("stub"),
    capabilityLevel: z.literal("read_only"),
    realCommerceActionsEnabled: z.literal(false),
  }),
  outcome: plannerOutcomeSchema,
});

const errorEnvelopeSchema = z.strictObject({
  ok: z.literal(false),
  apiVersion: apiVersionSchema,
  correlationId: correlationIdSchema,
  error: apiErrorSchema,
});

const clientEnvelopeSchema = z.discriminatedUnion("ok", [
  successEnvelopeSchema,
  errorEnvelopeSchema,
]);

export type MealCompletionApiError = z.infer<typeof apiErrorSchema>;

export type MealCompletionClientResult =
  | {
      status: "success";
      httpStatus: number;
      correlationId: string;
      outcome: PlannerOutcome;
    }
  | {
      status: "api_error";
      httpStatus: number;
      correlationId: string;
      error: MealCompletionApiError;
    }
  | {
      status: "invalid_response";
      httpStatus: number;
      correlationId?: string;
    }
  | {
      status: "network_error";
    };

export async function submitMealCompletionRequest(
  request: CompletionRequest,
  fetchImpl: typeof fetch = fetch,
): Promise<MealCompletionClientResult> {
  const parsedRequest = completionRequestSchema.safeParse(request);
  if (!parsedRequest.success) {
    return {
      status: "invalid_response",
      httpStatus: 0,
    };
  }

  let response: Response;
  try {
    response = await fetchImpl("/api/meal-completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedRequest.data),
    });
  } catch {
    return { status: "network_error" };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return {
      status: "invalid_response",
      httpStatus: response.status,
    };
  }

  return parseMealCompletionApiResponse(body, response.status);
}

export function parseMealCompletionApiResponse(
  body: unknown,
  httpStatus: number,
): MealCompletionClientResult {
  const parsed = clientEnvelopeSchema.safeParse(body);
  if (!parsed.success) {
    const correlationId = extractCorrelationId(body);
    return {
      status: "invalid_response",
      httpStatus,
      ...(correlationId !== undefined ? { correlationId } : {}),
    };
  }

  if (parsed.data.ok) {
    if (httpStatus !== 200) {
      return {
        status: "invalid_response",
        httpStatus,
        correlationId: parsed.data.correlationId,
      };
    }
    return {
      status: "success",
      httpStatus,
      correlationId: parsed.data.correlationId,
      outcome: parsed.data.outcome,
    };
  }

  return {
    status: "api_error",
    httpStatus,
    correlationId: parsed.data.correlationId,
    error: parsed.data.error,
  };
}

function extractCorrelationId(body: unknown): string | undefined {
  if (body === null || typeof body !== "object") {
    return undefined;
  }
  const value = (body as { correlationId?: unknown }).correlationId;
  return correlationIdSchema.safeParse(value).success
    ? String(value)
    : undefined;
}
