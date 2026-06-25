import { z } from "zod";

export const APP_ENV_VALUES = [
  "local",
  "preview",
  "staging",
  "production",
] as const;
export const MCP_ENV_VALUES = ["stub", "staging", "production"] as const;
export const CAPABILITY_LEVEL_VALUES = [
  "read_only",
  "cart_only",
  "single_order",
] as const;

export type AppEnvironment = (typeof APP_ENV_VALUES)[number];
export type McpEnvironment = (typeof MCP_ENV_VALUES)[number];
export type CapabilityLevel = (typeof CAPABILITY_LEVEL_VALUES)[number];

export const ACTIVE_MILESTONE = "M0_READ_ONLY_VALIDATION";

const boolFromEnv = z.preprocess((value) => {
  if (value === undefined || value === "") {
    return false;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}, z.boolean());

const nonEmptySecret = z.string().trim().min(1);

const runtimeEnvironmentSchema = z.object({
  APP_ENV: z.enum(APP_ENV_VALUES).default("local"),
  MCP_ENV: z.enum(MCP_ENV_VALUES).default("stub"),
  CAPABILITY_LEVEL: z.enum(CAPABILITY_LEVEL_VALUES).default("read_only"),
  ALLOW_REAL_SWIGGY_MUTATIONS: boolFromEnv.default(false),
  ALLOW_REAL_SWIGGY_ORDERS: boolFromEnv.default(false),
  DATABASE_URL: z.string().optional(),
  SESSION_SECRET: z.string().optional(),
  TOKEN_ENCRYPTION_KEY: z.string().optional(),
  SWIGGY_FOOD_MCP_URL: z.string().optional(),
  SWIGGY_INSTAMART_MCP_URL: z.string().optional(),
  SWIGGY_OAUTH_BASE_URL: z.string().optional(),
  SWIGGY_REDIRECT_URI: z.string().optional(),
  RUNTIME_MODEL_PROVIDER: z
    .enum(["deterministic", "anthropic", "openai"])
    .default("deterministic"),
  RUNTIME_MODEL_NAME: z.string().optional(),
  RUNTIME_MODEL_REGION: z.string().optional(),
});

export type RuntimeEnvironment = z.infer<typeof runtimeEnvironmentSchema>;

export const M0_READ_ONLY_TOOL_ALLOWLIST = {
  food: [
    "get_addresses",
    "search_menu",
    "search_restaurants",
    "get_restaurant_menu",
    "report_error",
  ],
  instamart: ["get_addresses", "search_products", "report_error"],
} as const;

const MUTATION_OR_ORDER_TOOLS = new Set([
  "update_food_cart",
  "flush_food_cart",
  "update_cart",
  "clear_cart",
  "apply_food_coupon",
  "place_food_order",
  "checkout",
]);

export class StartupConfigurationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Unsafe runtime configuration: ${issues.join("; ")}`);
    this.name = "StartupConfigurationError";
  }
}

export function validateRuntimeEnvironment(
  input: Record<string, string | undefined>,
): RuntimeEnvironment {
  const parsed = runtimeEnvironmentSchema.safeParse(input);

  if (!parsed.success) {
    throw new StartupConfigurationError(
      parsed.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      ),
    );
  }

  const env = parsed.data;
  const issues: string[] = [];

  if (env.MCP_ENV === "production" && env.APP_ENV !== "production") {
    issues.push("production MCP is allowed only when APP_ENV=production");
  }

  if (env.APP_ENV === "preview" && env.MCP_ENV !== "stub") {
    issues.push("preview must use MCP_ENV=stub");
  }

  if (env.CAPABILITY_LEVEL !== "read_only") {
    issues.push(`${ACTIVE_MILESTONE} supports only CAPABILITY_LEVEL=read_only`);
  }

  if (env.ALLOW_REAL_SWIGGY_MUTATIONS) {
    issues.push("real Swiggy mutations are disabled in M0");
  }

  if (env.ALLOW_REAL_SWIGGY_ORDERS) {
    issues.push("real Swiggy orders are disabled in M0");
  }

  if (env.ALLOW_REAL_SWIGGY_ORDERS && env.CAPABILITY_LEVEL !== "single_order") {
    issues.push("orders require CAPABILITY_LEVEL=single_order");
  }

  const readOnlyTools = Object.values(M0_READ_ONLY_TOOL_ALLOWLIST).flat();
  const unsafeAllowedTools = readOnlyTools.filter((tool) =>
    MUTATION_OR_ORDER_TOOLS.has(tool),
  );
  if (unsafeAllowedTools.length > 0) {
    issues.push(
      `read-only allowlist contains unsafe tools: ${unsafeAllowedTools.join(", ")}`,
    );
  }

  if (requiresServerSecrets(env)) {
    if (!nonEmptySecret.safeParse(env.DATABASE_URL).success) {
      issues.push("DATABASE_URL is required outside local/preview stub mode");
    }

    if (!nonEmptySecret.safeParse(env.SESSION_SECRET).success) {
      issues.push("SESSION_SECRET is required outside local/preview stub mode");
    }

    if (!nonEmptySecret.safeParse(env.TOKEN_ENCRYPTION_KEY).success) {
      issues.push(
        "TOKEN_ENCRYPTION_KEY is required outside local/preview stub mode",
      );
    }
  }

  if (issues.length > 0) {
    throw new StartupConfigurationError(issues);
  }

  return env;
}

export function getRuntimeEnvironment(): RuntimeEnvironment {
  return validateRuntimeEnvironment(process.env);
}

function requiresServerSecrets(env: RuntimeEnvironment): boolean {
  return (
    env.APP_ENV === "staging" ||
    env.APP_ENV === "production" ||
    env.MCP_ENV !== "stub"
  );
}
