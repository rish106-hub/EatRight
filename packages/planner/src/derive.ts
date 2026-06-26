import type {
  CompletionRequest,
  HomeComponent,
  MissingComponent,
} from "@finish-my-dinner/contracts";
import type { RuleId } from "./schema";

export interface MissingComponentDecision {
  missingComponent: MissingComponent;
  ruleId: RuleId;
}

interface Rule {
  id: RuleId;
  when: (request: CompletionRequest) => boolean;
  missingComponent: MissingComponent;
}

const BASE_COMPONENTS: ReadonlySet<HomeComponent> = new Set([
  "BASE_RICE",
  "BASE_ROTI",
  "BASE_BREAD",
]);

const MAIN_COMPONENTS: ReadonlySet<HomeComponent> = new Set([
  "MAIN_DAL",
  "MAIN_CURRY",
  "MAIN_PROTEIN",
  "LEFTOVER_MAIN",
]);

export const MISSING_COMPONENT_RULES: readonly Rule[] = [
  {
    id: "UNKNOWN_OR_EMPTY",
    when: (request) =>
      request.home.components.length === 0 ||
      request.home.components.includes("UNKNOWN"),
    missingComponent: "INSUFFICIENT_INFORMATION",
  },
  {
    id: "NOTHING_USEFUL",
    when: (request) => request.home.components.includes("NOTHING_USEFUL"),
    missingComponent: "NEED_COMPLETE_MEAL",
  },
  {
    id: "LOW_VOLUME_LEFTOVER",
    when: (request) =>
      request.home.components.includes("LEFTOVER_SMALL") ||
      (request.home.components.includes("LEFTOVER_MAIN") &&
        request.home.quantityConfidence === "LOW"),
    missingComponent: "NEED_VOLUME",
  },
  {
    id: "RICE_CURD_NEEDS_MAIN",
    when: (request) =>
      has(request, "BASE_RICE") &&
      has(request, "SIDE_CURD") &&
      !hasAny(request, MAIN_COMPONENTS),
    missingComponent: "NEED_MAIN",
  },
  {
    id: "DAL_WITHOUT_BASE",
    when: (request) =>
      has(request, "MAIN_DAL") && !hasAny(request, BASE_COMPONENTS),
    missingComponent: "NEED_BASE",
  },
  {
    id: "ROTIS_WITHOUT_MAIN",
    when: (request) =>
      has(request, "BASE_ROTI") && !hasAny(request, MAIN_COMPONENTS),
    missingComponent: "NEED_MAIN",
  },
  {
    id: "RICE_WITH_VEGETABLE_SIDE_NEEDS_PROTEIN",
    when: (request) =>
      has(request, "BASE_RICE") &&
      has(request, "SIDE_VEGETABLE") &&
      !has(request, "MAIN_PROTEIN") &&
      !has(request, "MAIN_DAL") &&
      !has(request, "MAIN_CURRY"),
    missingComponent: "NEED_PROTEIN",
  },
  {
    id: "COMPLETE_ENOUGH",
    when: (request) =>
      request.home.quantityConfidence !== "LOW" &&
      hasAny(request, BASE_COMPONENTS) &&
      hasAny(request, MAIN_COMPONENTS) &&
      (has(request, "SIDE_CURD") || has(request, "SIDE_VEGETABLE")),
    missingComponent: "INSUFFICIENT_INFORMATION",
  },
  {
    id: "BASE_WITHOUT_MAIN",
    when: (request) =>
      hasAny(request, BASE_COMPONENTS) && !hasAny(request, MAIN_COMPONENTS),
    missingComponent: "NEED_MAIN",
  },
  {
    id: "MAIN_WITHOUT_BASE",
    when: (request) =>
      hasAny(request, MAIN_COMPONENTS) && !hasAny(request, BASE_COMPONENTS),
    missingComponent: "NEED_BASE",
  },
  {
    id: "BASE_AND_MAIN_NEEDS_SIDE",
    when: (request) =>
      hasAny(request, BASE_COMPONENTS) &&
      hasAny(request, MAIN_COMPONENTS) &&
      !has(request, "SIDE_CURD") &&
      !has(request, "SIDE_VEGETABLE"),
    missingComponent: "NEED_SIDE",
  },
  {
    id: "INSUFFICIENT_STRUCTURED_INFORMATION",
    when: () => true,
    missingComponent: "INSUFFICIENT_INFORMATION",
  },
];

export function deriveMissingComponent(
  request: CompletionRequest,
): MissingComponentDecision {
  const rule = MISSING_COMPONENT_RULES.find((candidateRule) =>
    candidateRule.when(request),
  );
  if (rule === undefined) {
    return {
      ruleId: "INSUFFICIENT_STRUCTURED_INFORMATION",
      missingComponent: "INSUFFICIENT_INFORMATION",
    };
  }
  return {
    ruleId: rule.id,
    missingComponent: rule.missingComponent,
  };
}

export function isNoPurchaseRequired(decision: MissingComponentDecision) {
  return decision.ruleId === "COMPLETE_ENOUGH";
}

function has(request: CompletionRequest, component: HomeComponent): boolean {
  return request.home.components.includes(component);
}

function hasAny(
  request: CompletionRequest,
  components: ReadonlySet<HomeComponent>,
): boolean {
  return request.home.components.some((component) => components.has(component));
}
