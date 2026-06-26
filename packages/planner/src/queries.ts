import type { MissingComponent } from "@finish-my-dinner/contracts";

export function queriesForMissingComponent(
  missingComponent: MissingComponent,
): readonly string[] {
  switch (missingComponent) {
    case "NEED_BASE":
      return ["ready roti", "rice bowl", "paratha"];
    case "NEED_MAIN":
      return ["dal curry", "paneer curry", "sabzi"];
    case "NEED_PROTEIN":
      return ["protein curry", "paneer", "eggs"];
    case "NEED_SIDE":
      return ["curd", "salad", "vegetable side"];
    case "NEED_VOLUME":
      return ["raita side", "salad side", "kebab side"];
    case "NEED_COMPLETE_MEAL":
    case "INSUFFICIENT_INFORMATION":
      return [];
  }
}
