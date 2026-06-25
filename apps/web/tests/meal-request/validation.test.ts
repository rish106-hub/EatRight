import { describe, expect, it } from "vitest";
import { initialDraft } from "../../src/features/meal-request/draft";
import {
  VALIDATION_MESSAGES,
  hasErrors,
  isAllowedExclusion,
  validateHomeState,
} from "../../src/features/meal-request/validation";

describe("home-state validation", () => {
  it("requires at least one home component", () => {
    const errors = validateHomeState({ ...initialDraft(), components: [] });
    expect(errors.components).toBe(VALIDATION_MESSAGES.components);
    expect(hasErrors(errors)).toBe(true);
  });

  it("requires a positive budget", () => {
    expect(
      validateHomeState({
        ...initialDraft(),
        components: ["BASE_RICE"],
        budgetMaxInr: null,
      }).budget,
    ).toBe(VALIDATION_MESSAGES.budgetRequired);

    expect(
      validateHomeState({
        ...initialDraft(),
        components: ["BASE_RICE"],
        budgetMaxInr: 0,
      }).budget,
    ).toBe(VALIDATION_MESSAGES.budgetRequired);
  });

  it("rejects a non-integer ETA but allows blank", () => {
    expect(
      validateHomeState({
        ...initialDraft(),
        components: ["BASE_RICE"],
        maxEtaMinutes: 30.5,
      }).eta,
    ).toBe(VALIDATION_MESSAGES.etaInteger);

    expect(
      validateHomeState({
        ...initialDraft(),
        components: ["BASE_RICE"],
        maxEtaMinutes: null,
      }).eta,
    ).toBeUndefined();
  });

  it("passes a complete valid draft", () => {
    const errors = validateHomeState({
      ...initialDraft(),
      components: ["BASE_RICE"],
      budgetMaxInr: 250,
    });
    expect(hasErrors(errors)).toBe(false);
  });

  it("blocks unsafe exclusion text via the contract schema", () => {
    expect(isAllowedExclusion("mushroom")).toBe(true);
    expect(isAllowedExclusion("my upi pin")).toBe(false);
  });
});
