import type {
  HomeComponent,
  QuantityConfidence,
} from "@finish-my-dinner/contracts";
import { HOME_COMPONENT_CHIPS } from "./home-components";

/** User correction of the quantity assumption on the review screen. */
export type QuantityCorrection = "enough" | "not-enough" | "not-sure" | null;

const LOW_CONFIDENCE_IDS: ReadonlySet<HomeComponent> = new Set(
  HOME_COMPONENT_CHIPS.filter((chip) => chip.lowConfidence).map(
    (chip) => chip.id,
  ),
);

function hasLowConfidenceSelection(
  components: readonly HomeComponent[],
): boolean {
  return components.some((id) => LOW_CONFIDENCE_IDS.has(id));
}

/**
 * Derive contract quantityConfidence from the selection plus any explicit
 * user correction. Never surfaced as raw LOW/MED/HIGH in the UI.
 *
 * - HIGH  → user explicitly confirmed quantity is enough
 * - LOW   → user said not-enough/not-sure, OR ambiguous/leftover/"Other" chip
 * - MEDIUM→ normal component selection, no correction
 */
export function deriveQuantityConfidence(
  components: readonly HomeComponent[],
  correction: QuantityCorrection = null,
): QuantityConfidence {
  if (correction === "enough") {
    return "HIGH";
  }
  if (correction === "not-enough" || correction === "not-sure") {
    return "LOW";
  }
  return hasLowConfidenceSelection(components) ? "LOW" : "MEDIUM";
}

/**
 * Plain-language assumption shown on review only when confidence is LOW.
 * Returns null when no assumption needs surfacing.
 */
export function quantityAssumptionCopy(
  components: readonly HomeComponent[],
  servings: 1 | 2,
  correction: QuantityCorrection = null,
): string | null {
  if (deriveQuantityConfidence(components, correction) !== "LOW") {
    return null;
  }
  const who = servings === 1 ? "one person" : "two people";
  if (components.includes("LEFTOVER_SMALL")) {
    return `I'm assuming the leftovers are not enough for ${who}.`;
  }
  return `I'm assuming what's at home is not enough for ${who}.`;
}
