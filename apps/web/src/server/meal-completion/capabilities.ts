import {
  StartupConfigurationError,
  validateRuntimeEnvironment,
  type RuntimeEnvironment,
} from "@/lib/runtime-config";

export class MealCompletionCapabilityError extends Error {
  constructor(public readonly issues: readonly string[]) {
    super("Unsafe meal-completion API runtime configuration.");
    this.name = "MealCompletionCapabilityError";
  }
}

export function assertMealCompletionCapabilities(
  input: Record<string, string | undefined>,
): RuntimeEnvironment {
  const explicitIssues = [
    input.MCP_ENV === "stub" ? undefined : "MCP_ENV must be explicitly stub",
    input.CAPABILITY_LEVEL === "read_only"
      ? undefined
      : "CAPABILITY_LEVEL must be explicitly read_only",
    input.ALLOW_REAL_SWIGGY_MUTATIONS === "false"
      ? undefined
      : "ALLOW_REAL_SWIGGY_MUTATIONS must be explicitly false",
    input.ALLOW_REAL_SWIGGY_ORDERS === "false"
      ? undefined
      : "ALLOW_REAL_SWIGGY_ORDERS must be explicitly false",
  ].filter((issue): issue is string => issue !== undefined);

  if (explicitIssues.length > 0) {
    throw new MealCompletionCapabilityError(explicitIssues);
  }

  try {
    const env = validateRuntimeEnvironment(input);

    if (
      env.MCP_ENV !== "stub" ||
      env.CAPABILITY_LEVEL !== "read_only" ||
      env.ALLOW_REAL_SWIGGY_MUTATIONS ||
      env.ALLOW_REAL_SWIGGY_ORDERS
    ) {
      throw new MealCompletionCapabilityError([
        "runtime failed the read-only stub capability assertion",
      ]);
    }

    return env;
  } catch (error) {
    if (error instanceof StartupConfigurationError) {
      throw new MealCompletionCapabilityError(error.issues);
    }

    throw error;
  }
}
