import type {
  DietPreference,
  HomeComponent,
  MealWeight,
} from "@finish-my-dinner/contracts";
import { buildCompletionRequest, type RequestIds } from "./build-request";
import type { QuantityCorrection } from "./confidence";
import { initialDraft, type MealRequestDraft } from "./draft";
import { hasErrors, validateHomeState } from "./validation";

export type FlowStep = "intro" | "address" | "home" | "review" | "success";

export interface FlowState {
  step: FlowStep;
  draft: MealRequestDraft;
  request: import("@finish-my-dinner/contracts").CompletionRequest | null;
  showHomeErrors: boolean;
}

export type FlowAction =
  | { type: "GOTO"; step: FlowStep }
  | { type: "SET_ADDRESS"; addressId: string }
  | { type: "TOGGLE_COMPONENT"; id: HomeComponent }
  | { type: "SET_RAW_TEXT"; value: string }
  | { type: "SET_SERVINGS"; value: 1 | 2 }
  | { type: "SET_DIET"; value: DietPreference }
  | { type: "SET_MEAL_WEIGHT"; value: MealWeight }
  | { type: "SET_BUDGET"; value: number | null }
  | { type: "SET_ETA"; value: number | null }
  | { type: "ADD_EXCLUSION"; value: string }
  | { type: "REMOVE_EXCLUSION"; value: string }
  | { type: "SET_QUANTITY_CORRECTION"; value: QuantityCorrection }
  | { type: "SUBMIT_HOME" }
  | { type: "CONFIRM_REVIEW"; ids: RequestIds }
  | { type: "RESET" };

export function initialFlowState(): FlowState {
  return {
    step: "intro",
    draft: initialDraft(),
    request: null,
    showHomeErrors: false,
  };
}

function toggleComponent(
  components: HomeComponent[],
  id: HomeComponent,
): HomeComponent[] {
  return components.includes(id)
    ? components.filter((c) => c !== id)
    : [...components, id];
}

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "GOTO":
      return { ...state, step: action.step };
    case "SET_ADDRESS":
      return {
        ...state,
        draft: { ...state.draft, addressId: action.addressId },
      };
    case "TOGGLE_COMPONENT":
      return {
        ...state,
        draft: {
          ...state.draft,
          components: toggleComponent(state.draft.components, action.id),
        },
      };
    case "SET_RAW_TEXT":
      return { ...state, draft: { ...state.draft, rawText: action.value } };
    case "SET_SERVINGS":
      return { ...state, draft: { ...state.draft, servings: action.value } };
    case "SET_DIET":
      return { ...state, draft: { ...state.draft, diet: action.value } };
    case "SET_MEAL_WEIGHT":
      return { ...state, draft: { ...state.draft, mealWeight: action.value } };
    case "SET_BUDGET":
      return {
        ...state,
        draft: { ...state.draft, budgetMaxInr: action.value },
      };
    case "SET_ETA":
      return {
        ...state,
        draft: { ...state.draft, maxEtaMinutes: action.value },
      };
    case "ADD_EXCLUSION":
      return state.draft.exclusions.includes(action.value) ||
        state.draft.exclusions.length >= 12
        ? state
        : {
            ...state,
            draft: {
              ...state.draft,
              exclusions: [...state.draft.exclusions, action.value],
            },
          };
    case "REMOVE_EXCLUSION":
      return {
        ...state,
        draft: {
          ...state.draft,
          exclusions: state.draft.exclusions.filter((e) => e !== action.value),
        },
      };
    case "SET_QUANTITY_CORRECTION":
      return {
        ...state,
        draft: { ...state.draft, quantityCorrection: action.value },
      };
    case "SUBMIT_HOME": {
      const errors = validateHomeState(state.draft);
      if (hasErrors(errors)) {
        return { ...state, showHomeErrors: true };
      }
      return { ...state, showHomeErrors: false, step: "review" };
    }
    case "CONFIRM_REVIEW": {
      const result = buildCompletionRequest(state.draft, action.ids);
      if (!result.ok) {
        // Validation failed at the contract boundary → send user back to fix input.
        return { ...state, step: "home", showHomeErrors: true };
      }
      return { ...state, request: result.request, step: "success" };
    }
    case "RESET":
      return initialFlowState();
    default:
      return state;
  }
}
