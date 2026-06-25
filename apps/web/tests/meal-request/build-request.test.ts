import { completionRequestSchema } from "@finish-my-dinner/contracts";
import { describe, expect, it } from "vitest";
import { buildCompletionRequest } from "../../src/features/meal-request/build-request";
import {
  initialDraft,
  type MealRequestDraft,
} from "../../src/features/meal-request/draft";

const ids = { sessionId: "session-test-1", requestId: "request-test-1" };

function validDraft(): MealRequestDraft {
  return {
    ...initialDraft(),
    addressId: "address-sample-home",
    components: ["BASE_RICE", "SIDE_CURD"],
    budgetMaxInr: 250,
  };
}

describe("buildCompletionRequest", () => {
  it("produces a request that satisfies the shared contract", () => {
    const result = buildCompletionRequest({ ...validDraft() }, ids);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(() => completionRequestSchema.parse(result.request)).not.toThrow();
      expect(result.request.constraints.budgetInr).toEqual({ max: 250 });
      expect(result.request.home.components).toEqual([
        "BASE_RICE",
        "SIDE_CURD",
      ]);
      expect(result.request.home.quantityConfidence).toBe("MEDIUM");
    }
  });

  it("omits maxEtaMinutes when not set and includes it when set", () => {
    const without = buildCompletionRequest({ ...validDraft() }, ids);
    expect(without.ok && "maxEtaMinutes" in without.request.constraints).toBe(
      false,
    );

    const withEta = buildCompletionRequest(
      { ...validDraft(), maxEtaMinutes: 30 },
      ids,
    );
    expect(withEta.ok && withEta.request.constraints.maxEtaMinutes).toBe(30);
  });

  it("includes the free-text note only when Other is selected", () => {
    const note = buildCompletionRequest(
      {
        ...validDraft(),
        components: ["UNKNOWN"],
        rawText: "some khichdi",
      },
      ids,
    );
    expect(note.ok && note.request.home.rawText).toBe("some khichdi");

    const noNote = buildCompletionRequest(
      { ...validDraft(), rawText: "ignored without Other" },
      ids,
    );
    expect(noNote.ok && "rawText" in noNote.request.home).toBe(false);
  });

  it("derives HIGH confidence when the user confirms quantity", () => {
    const result = buildCompletionRequest(
      {
        ...validDraft(),
        components: ["LEFTOVER_SMALL"],
        quantityCorrection: "enough",
      },
      ids,
    );
    expect(result.ok && result.request.home.quantityConfidence).toBe("HIGH");
  });

  it("fails when no address is selected", () => {
    const result = buildCompletionRequest(
      { ...validDraft(), addressId: null },
      ids,
    );
    expect(result.ok).toBe(false);
  });
});
