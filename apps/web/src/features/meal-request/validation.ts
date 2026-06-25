import { userConstraintsSchema } from "@finish-my-dinner/contracts";
import type { MealRequestDraft } from "./draft";

/** The contract's own exclusion-element schema — not re-declared here. */
const exclusionItemSchema = userConstraintsSchema.shape.exclusions.element;

export interface HomeStateErrors {
  components?: string;
  budget?: string;
  eta?: string;
}

export const VALIDATION_MESSAGES = {
  components:
    "Pick at least one thing you have, or choose “Leftovers, not enough.”",
  budgetRequired: "Set a max budget above ₹0.",
  etaInteger: "Enter the max delivery time as whole minutes.",
} as const;

function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

/** Field-level validation for the home-state screen. Empty object = valid. */
export function validateHomeState(draft: MealRequestDraft): HomeStateErrors {
  const errors: HomeStateErrors = {};

  if (draft.components.length === 0) {
    errors.components = VALIDATION_MESSAGES.components;
  }

  if (draft.budgetMaxInr === null || !(draft.budgetMaxInr > 0)) {
    errors.budget = VALIDATION_MESSAGES.budgetRequired;
  }

  if (
    draft.maxEtaMinutes !== null &&
    !isNonNegativeInteger(draft.maxEtaMinutes)
  ) {
    errors.eta = VALIDATION_MESSAGES.etaInteger;
  }

  return errors;
}

export function hasErrors(errors: HomeStateErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** True when an exclusion string is accepted by the contract's safe-text schema. */
export function isAllowedExclusion(value: string): boolean {
  return exclusionItemSchema.safeParse(value).success;
}
