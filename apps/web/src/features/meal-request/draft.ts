import type {
  DietPreference,
  HomeComponent,
  MealWeight,
} from "@finish-my-dinner/contracts";
import type { QuantityCorrection } from "./confidence";

/**
 * UI-only form state. Presentation layer reads/writes this; it is converted to
 * a contract CompletionRequest once, by build-request.ts. Holds no contract
 * assembly logic and no JSX.
 */
export interface MealRequestDraft {
  addressId: string | null;
  components: HomeComponent[];
  rawText: string;
  servings: 1 | 2;
  diet: DietPreference;
  mealWeight: MealWeight;
  budgetMaxInr: number | null;
  maxEtaMinutes: number | null;
  exclusions: string[];
  quantityCorrection: QuantityCorrection;
}

export function initialDraft(): MealRequestDraft {
  return {
    addressId: null,
    components: [],
    rawText: "",
    servings: 1,
    diet: "MIXED",
    mealWeight: "REGULAR",
    budgetMaxInr: 250,
    maxEtaMinutes: null,
    exclusions: [],
    quantityCorrection: null,
  };
}
