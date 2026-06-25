import { describe, expect, it } from "vitest";
import {
  deriveQuantityConfidence,
  quantityAssumptionCopy,
} from "../../src/features/meal-request/confidence";

describe("quantity confidence derivation", () => {
  it("is MEDIUM for normal selections", () => {
    expect(deriveQuantityConfidence(["BASE_RICE", "SIDE_CURD"])).toBe("MEDIUM");
  });

  it("is LOW for leftovers / not-enough / other", () => {
    expect(deriveQuantityConfidence(["LEFTOVER_SMALL"])).toBe("LOW");
    expect(deriveQuantityConfidence(["UNKNOWN"])).toBe("LOW");
  });

  it("is HIGH only when the user confirms it is enough", () => {
    expect(deriveQuantityConfidence(["LEFTOVER_SMALL"], "enough")).toBe("HIGH");
    expect(deriveQuantityConfidence(["BASE_RICE"], "enough")).toBe("HIGH");
  });

  it("stays LOW when the user says not-enough or not-sure", () => {
    expect(deriveQuantityConfidence(["BASE_RICE"], "not-enough")).toBe("LOW");
    expect(deriveQuantityConfidence(["BASE_RICE"], "not-sure")).toBe("LOW");
  });
});

describe("assumption copy", () => {
  it("surfaces a plain-language assumption only when confidence is LOW", () => {
    expect(quantityAssumptionCopy(["BASE_RICE", "SIDE_CURD"], 1)).toBeNull();
    expect(quantityAssumptionCopy(["LEFTOVER_SMALL"], 1)).toBe(
      "I'm assuming the leftovers are not enough for one person.",
    );
  });

  it("clears the assumption once the user confirms enough", () => {
    expect(quantityAssumptionCopy(["LEFTOVER_SMALL"], 2, "enough")).toBeNull();
  });

  it("uses no technical confidence terminology", () => {
    const copy = quantityAssumptionCopy(["LEFTOVER_SMALL"], 1) ?? "";
    expect(copy.toLowerCase()).not.toContain("low");
    expect(copy.toLowerCase()).not.toContain("confidence");
  });
});
