import {
  completionRequestSchema,
  type CompletionRequest,
  type HomeState,
  type UserConstraints,
} from "@finish-my-dinner/contracts";
import { deriveQuantityConfidence } from "./confidence";
import type { MealRequestDraft } from "./draft";
import { HOME_COMPONENT_CHIPS } from "./home-components";

export interface RequestIds {
  sessionId: string;
  requestId: string;
}

export type BuildResult =
  | { ok: true; request: CompletionRequest }
  | { ok: false; issues: string[] };

const NOTE_TRIGGER_IDS = new Set(
  HOME_COMPONENT_CHIPS.filter((chip) => chip.revealsNote).map(
    (chip) => chip.id,
  ),
);

function shouldIncludeNote(draft: MealRequestDraft): boolean {
  const trimmed = draft.rawText.trim();
  if (trimmed.length === 0) {
    return false;
  }
  return draft.components.some((id) => NOTE_TRIGGER_IDS.has(id));
}

/**
 * Assemble the read-only CompletionRequest from UI draft + locally-generated
 * IDs, then validate against the shared contract. The contract is the single
 * source of truth; nothing here invents Swiggy data.
 */
export function buildCompletionRequest(
  draft: MealRequestDraft,
  ids: RequestIds,
): BuildResult {
  if (draft.addressId === null) {
    return { ok: false, issues: ["No address selected."] };
  }

  const home: HomeState = {
    components: draft.components,
    quantityConfidence: deriveQuantityConfidence(
      draft.components,
      draft.quantityCorrection,
    ),
    ...(shouldIncludeNote(draft) ? { rawText: draft.rawText.trim() } : {}),
  };

  const constraints: UserConstraints = {
    servings: draft.servings,
    diet: draft.diet,
    exclusions: draft.exclusions,
    budgetInr: { max: draft.budgetMaxInr ?? 0 },
    mealWeight: draft.mealWeight,
    ...(draft.maxEtaMinutes !== null
      ? { maxEtaMinutes: draft.maxEtaMinutes }
      : {}),
  };

  const candidate = {
    sessionId: ids.sessionId,
    requestId: ids.requestId,
    addressId: draft.addressId,
    home,
    constraints,
  };

  const parsed = completionRequestSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "request"}: ${issue.message}`,
      ),
    };
  }

  return { ok: true, request: parsed.data };
}
