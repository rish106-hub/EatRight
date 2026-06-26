import { completionRequestSchema } from "@finish-my-dinner/contracts";
import {
  createDeterministicPlanner,
  plannerOutcomeSchema,
} from "@finish-my-dinner/planner";
import { createStubProviders } from "@finish-my-dinner/providers-stub";
import { assertMealCompletionCapabilities } from "./capabilities";
import {
  isDemoAddressId,
  resolveDemoServiceability,
  selectStubScenario,
} from "./demo-addresses";
import {
  MEAL_COMPLETION_API_VERSION,
  MEAL_COMPLETION_CAPABILITY_MODE,
  type MealCompletionApiErrorCode,
  type MealCompletionApiResponse,
} from "./schema";
import {
  consoleMealCompletionLogger,
  type MealCompletionLogEvent,
  type MealCompletionLogger,
} from "./logger";

const endpoint = "/api/meal-completion";
const maxRequestBytes = 8 * 1024;

interface FieldIssue {
  path: string;
  message: string;
}

export interface MealCompletionHandlerOptions {
  env?: Record<string, string | undefined>;
  logger?: MealCompletionLogger;
  createCorrelationId?: () => string;
  nowMs?: () => number;
}

export async function handleMealCompletionRequest(
  request: Request,
  options: MealCompletionHandlerOptions = {},
): Promise<Response> {
  const correlationId = getCorrelationId(
    request,
    options.createCorrelationId ?? defaultCorrelationId,
  );
  const logger = options.logger ?? consoleMealCompletionLogger;
  const startedAt = (options.nowMs ?? Date.now)();

  try {
    assertMealCompletionCapabilities(options.env ?? process.env);
  } catch {
    return errorResponse({
      correlationId,
      code: "UNSAFE_RUNTIME_CONFIGURATION",
      message: "The meal-completion API is not available in this runtime.",
      status: 500,
      logger,
      startedAt,
      nowMs: options.nowMs,
    });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!isJsonContentType(contentType)) {
    return errorResponse({
      correlationId,
      code: "UNSUPPORTED_CONTENT_TYPE",
      message: "Use application/json for this endpoint.",
      status: 415,
      logger,
      startedAt,
      nowMs: options.nowMs,
    });
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > maxRequestBytes) {
    return errorResponse({
      correlationId,
      code: "REQUEST_TOO_LARGE",
      message: "Request body is too large.",
      status: 422,
      logger,
      startedAt,
      nowMs: options.nowMs,
    });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return errorResponse({
      correlationId,
      code: "MALFORMED_JSON",
      message: "Request body must be valid JSON.",
      status: 400,
      logger,
      startedAt,
      nowMs: options.nowMs,
    });
  }

  const parsedRequest = completionRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return errorResponse({
      correlationId,
      code: "INVALID_REQUEST",
      message: "Request does not match the meal-completion contract.",
      status: 422,
      fieldIssues: parsedRequest.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
      logger,
      startedAt,
      nowMs: options.nowMs,
    });
  }

  const completionRequest = parsedRequest.data;
  if (!isDemoAddressId(completionRequest.addressId)) {
    return errorResponse({
      correlationId,
      code: "UNKNOWN_DEMO_ADDRESS",
      message: "Choose one of the available demo addresses.",
      status: 422,
      fieldIssues: [
        {
          path: "addressId",
          message: "Unknown demo address ID.",
        },
      ],
      logger,
      startedAt,
      nowMs: options.nowMs,
    });
  }

  const providers = createStubProviders({
    scenario: selectStubScenario(
      completionRequest,
      completionRequest.addressId,
    ),
    seed: `${completionRequest.addressId}:${completionRequest.requestId}`,
  });
  const planner = createDeterministicPlanner({
    foodPort: providers.food,
    instamartPort: providers.instamart,
  });
  const outcomeResult = plannerOutcomeSchema.safeParse(
    await planner.plan({
      request: completionRequest,
      serviceability: resolveDemoServiceability(completionRequest.addressId),
    }),
  );

  if (!outcomeResult.success) {
    return errorResponse({
      correlationId,
      code: "INTERNAL_PLANNER_INVARIANT",
      message: "Planner output failed runtime validation.",
      status: 500,
      logger,
      startedAt,
      nowMs: options.nowMs,
    });
  }

  const outcome = outcomeResult.data;
  const bodyEnvelope: MealCompletionApiResponse = {
    ok: true,
    apiVersion: MEAL_COMPLETION_API_VERSION,
    correlationId,
    capability: {
      mode: MEAL_COMPLETION_CAPABILITY_MODE,
      mcpEnv: "stub",
      capabilityLevel: "read_only",
      realCommerceActionsEnabled: false,
    },
    outcome,
  };
  const status = 200;
  const logEvent: Omit<MealCompletionLogEvent, "endpoint" | "capabilityMode"> =
    {
      correlationId,
      httpStatus: status,
      durationMs: durationMs(startedAt, options.nowMs),
      outcomeStatus: outcome.status,
    };
  if (outcome.status === "RECOMMENDATION_READY") {
    logEvent.selectedProvider = outcome.selectedProvider;
  }
  log(logger, logEvent);

  return jsonResponse(bodyEnvelope, status);
}

function errorResponse(args: {
  correlationId: string;
  code: MealCompletionApiErrorCode;
  message: string;
  status: number;
  fieldIssues?: FieldIssue[];
  logger: MealCompletionLogger;
  startedAt: number;
  nowMs: (() => number) | undefined;
}): Response {
  const body: MealCompletionApiResponse = {
    ok: false,
    apiVersion: MEAL_COMPLETION_API_VERSION,
    correlationId: args.correlationId,
    error: {
      code: args.code,
      message: args.message,
      ...(args.fieldIssues !== undefined
        ? { fieldIssues: args.fieldIssues.slice(0, 12) }
        : {}),
    },
  };
  log(args.logger, {
    correlationId: args.correlationId,
    httpStatus: args.status,
    durationMs: durationMs(args.startedAt, args.nowMs),
    errorCode: args.code,
  });
  return jsonResponse(body, args.status);
}

function jsonResponse(
  body: MealCompletionApiResponse,
  status: number,
): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function isJsonContentType(contentType: string): boolean {
  return contentType.toLowerCase().split(";")[0]?.trim() === "application/json";
}

function getCorrelationId(
  request: Request,
  createCorrelationId: () => string,
): string {
  const headerValue = request.headers.get("x-request-id")?.trim();
  if (
    headerValue !== undefined &&
    /^[A-Za-z0-9._:-]{1,128}$/.test(headerValue)
  ) {
    return headerValue;
  }

  return createCorrelationId();
}

function defaultCorrelationId(): string {
  return globalThis.crypto?.randomUUID() ?? `request-${Date.now()}`;
}

function durationMs(
  startedAt: number,
  nowMs: (() => number) | undefined,
): number {
  return Math.max(0, Math.round((nowMs ?? Date.now)() - startedAt));
}

function log(
  logger: MealCompletionLogger,
  event: Omit<MealCompletionLogEvent, "endpoint" | "capabilityMode">,
): void {
  logger.info({
    endpoint,
    capabilityMode: MEAL_COMPLETION_CAPABILITY_MODE,
    ...event,
  });
}
