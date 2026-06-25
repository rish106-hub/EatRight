import { z } from "zod";

export const HOME_COMPONENT_VALUES = [
  "BASE_RICE",
  "BASE_ROTI",
  "BASE_BREAD",
  "MAIN_DAL",
  "MAIN_CURRY",
  "MAIN_PROTEIN",
  "SIDE_VEGETABLE",
  "SIDE_CURD",
  "LEFTOVER_MAIN",
  "LEFTOVER_SMALL",
  "BASIC_STAPLES",
  "NOTHING_USEFUL",
  "UNKNOWN",
] as const;

export const MISSING_COMPONENT_VALUES = [
  "NEED_BASE",
  "NEED_MAIN",
  "NEED_PROTEIN",
  "NEED_SIDE",
  "NEED_VOLUME",
  "NEED_COMPLETE_MEAL",
  "INSUFFICIENT_INFORMATION",
] as const;

export const QUANTITY_CONFIDENCE_VALUES = ["LOW", "MEDIUM", "HIGH"] as const;
export const DIET_PREFERENCE_VALUES = ["VEGETARIAN", "MIXED"] as const;
export const CANDIDATE_DIET_VALUES = [
  "VEGETARIAN",
  "NON_VEGETARIAN",
  "UNKNOWN",
] as const;
export const MEAL_WEIGHT_VALUES = ["LIGHT", "REGULAR"] as const;
export const MEAL_COMPLETION_INTENT_VALUES = [
  "COMPLETE_PARTIAL_DINNER",
  "STANDARD_DISCOVERY_HANDOFF",
] as const;

export const homeComponentSchema = z.enum(HOME_COMPONENT_VALUES);
export const missingComponentSchema = z.enum(MISSING_COMPONENT_VALUES);
export const quantityConfidenceSchema = z.enum(QUANTITY_CONFIDENCE_VALUES);
export const dietPreferenceSchema = z.enum(DIET_PREFERENCE_VALUES);
export const candidateDietSchema = z.enum(CANDIDATE_DIET_VALUES);
export const mealWeightSchema = z.enum(MEAL_WEIGHT_VALUES);
export const mealCompletionIntentSchema = z.enum(MEAL_COMPLETION_INTENT_VALUES);

export type HomeComponent = z.infer<typeof homeComponentSchema>;
export type MissingComponent = z.infer<typeof missingComponentSchema>;
export type QuantityConfidence = z.infer<typeof quantityConfidenceSchema>;
export type DietPreference = z.infer<typeof dietPreferenceSchema>;
export type CandidateDiet = z.infer<typeof candidateDietSchema>;
export type MealWeight = z.infer<typeof mealWeightSchema>;
export type MealCompletionIntent = z.infer<typeof mealCompletionIntentSchema>;

export function inferMissingComponent(
  components: readonly HomeComponent[],
): MissingComponent {
  const has = (component: HomeComponent) => components.includes(component);

  if (has("UNKNOWN")) {
    return "INSUFFICIENT_INFORMATION";
  }

  if (has("NOTHING_USEFUL")) {
    return "NEED_COMPLETE_MEAL";
  }

  if (has("LEFTOVER_SMALL")) {
    return "NEED_VOLUME";
  }

  if (has("MAIN_DAL") || has("MAIN_CURRY") || has("MAIN_PROTEIN")) {
    if (!has("BASE_RICE") && !has("BASE_ROTI") && !has("BASE_BREAD")) {
      return "NEED_BASE";
    }
  }

  if (has("BASE_RICE") || has("BASE_ROTI") || has("BASE_BREAD")) {
    if (!has("MAIN_DAL") && !has("MAIN_CURRY") && !has("MAIN_PROTEIN")) {
      return "NEED_MAIN";
    }
  }

  if (has("BASE_RICE") && has("SIDE_CURD")) {
    return "NEED_MAIN";
  }

  if (
    (has("BASE_RICE") || has("BASE_ROTI") || has("BASE_BREAD")) &&
    (has("MAIN_DAL") || has("MAIN_CURRY") || has("MAIN_PROTEIN"))
  ) {
    return "NEED_SIDE";
  }

  return "INSUFFICIENT_INFORMATION";
}
