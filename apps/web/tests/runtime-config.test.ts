import { describe, expect, it } from "vitest";
import {
  M0_READ_ONLY_TOOL_ALLOWLIST,
  StartupConfigurationError,
  validateRuntimeEnvironment,
} from "../src/lib/runtime-config";

const baseEnv = {
  APP_ENV: "local",
  MCP_ENV: "stub",
  CAPABILITY_LEVEL: "read_only",
  ALLOW_REAL_SWIGGY_MUTATIONS: "false",
  ALLOW_REAL_SWIGGY_ORDERS: "false",
};

describe("runtime capability assertions", () => {
  it("allows local stub read-only without security secrets", () => {
    expect(validateRuntimeEnvironment(baseEnv)).toMatchObject({
      APP_ENV: "local",
      MCP_ENV: "stub",
      CAPABILITY_LEVEL: "read_only",
      ALLOW_REAL_SWIGGY_MUTATIONS: false,
      ALLOW_REAL_SWIGGY_ORDERS: false,
    });
  });

  it("blocks preview from using production MCP", () => {
    expect(() =>
      validateRuntimeEnvironment({
        ...baseEnv,
        APP_ENV: "preview",
        MCP_ENV: "production",
      }),
    ).toThrow(StartupConfigurationError);
  });

  it("blocks read-only mode from enabling mutations", () => {
    expect(() =>
      validateRuntimeEnvironment({
        ...baseEnv,
        ALLOW_REAL_SWIGGY_MUTATIONS: "true",
      }),
    ).toThrow(/mutations are disabled/);
  });

  it("blocks read-only mode from enabling orders", () => {
    expect(() =>
      validateRuntimeEnvironment({
        ...baseEnv,
        ALLOW_REAL_SWIGGY_ORDERS: "true",
      }),
    ).toThrow(/orders are disabled/);
  });

  it("blocks non-read-only capability during M0", () => {
    expect(() =>
      validateRuntimeEnvironment({
        ...baseEnv,
        CAPABILITY_LEVEL: "cart_only",
      }),
    ).toThrow(/supports only CAPABILITY_LEVEL=read_only/);
  });

  it("requires security secrets in staging", () => {
    expect(() =>
      validateRuntimeEnvironment({
        ...baseEnv,
        APP_ENV: "staging",
        MCP_ENV: "staging",
      }),
    ).toThrow(/SESSION_SECRET/);
  });

  it("allows staging when required secrets are present and capability remains read-only", () => {
    expect(
      validateRuntimeEnvironment({
        ...baseEnv,
        APP_ENV: "staging",
        MCP_ENV: "staging",
        DATABASE_URL: "postgres://example",
        SESSION_SECRET: "test-session-secret",
        TOKEN_ENCRYPTION_KEY: "test-token-key",
      }),
    ).toMatchObject({
      APP_ENV: "staging",
      MCP_ENV: "staging",
      CAPABILITY_LEVEL: "read_only",
    });
  });

  it("keeps the M0 executable allowlist free of mutation and order tools", () => {
    const unsafeTools = new Set([
      "update_food_cart",
      "flush_food_cart",
      "update_cart",
      "clear_cart",
      "apply_food_coupon",
      "place_food_order",
      "checkout",
    ]);

    expect(
      Object.values(M0_READ_ONLY_TOOL_ALLOWLIST).flat(),
    ).not.toContainEqual(
      expect.stringMatching(new RegExp([...unsafeTools].join("|"))),
    );
  });
});
