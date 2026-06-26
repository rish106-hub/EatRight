import type {
  CandidateSource,
  CompletionRequest,
  MissingComponent,
  ReadOnlyCandidate,
} from "@finish-my-dinner/contracts";
import { candidateFitsMissingComponent } from "./filter";
import type { ScoreBreakdown, ScoredCandidate } from "./schema";

const PROVIDER_ORDER: Record<CandidateSource, number> = {
  FOOD: 0,
  INSTAMART: 1,
};

export function scoreCandidates(
  candidates: readonly ReadOnlyCandidate[],
  request: CompletionRequest,
  missingComponent: MissingComponent,
): ScoredCandidate[] {
  return candidates
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(candidate, request, missingComponent),
    }))
    .sort(compareScoredCandidates);
}

export function scoreCandidate(
  candidate: ReadOnlyCandidate,
  request: CompletionRequest,
  missingComponent: MissingComponent,
): ScoreBreakdown {
  const mealFit = mealFitScore(candidate, missingComponent);
  const budgetFit = budgetFitScore(
    candidate.price.amountInr,
    request.constraints.budgetInr.max,
  );
  const etaFit = etaFitScore(
    candidate.etaMinutes,
    request.constraints.maxEtaMinutes,
  );
  const providerReliabilityFit = 50;
  const minimumUsefulPurchaseFit = minimumUsefulPurchaseFitScore(
    candidate.quantity,
    request.constraints.servings,
  );
  const statedPreferenceFit = statedPreferenceFitScore(candidate, request);
  const total = Math.round(
    (mealFit * 35 +
      budgetFit * 20 +
      etaFit * 15 +
      providerReliabilityFit * 10 +
      minimumUsefulPurchaseFit * 10 +
      statedPreferenceFit * 10) /
      100,
  );

  return {
    mealFit,
    budgetFit,
    etaFit,
    providerReliabilityFit,
    minimumUsefulPurchaseFit,
    statedPreferenceFit,
    total,
  };
}

export function compareScoredCandidates(
  left: ScoredCandidate,
  right: ScoredCandidate,
): number {
  return (
    right.score.total - left.score.total ||
    right.score.mealFit - left.score.mealFit ||
    left.candidate.price.amountInr - right.candidate.price.amountInr ||
    etaForSort(left.candidate) - etaForSort(right.candidate) ||
    PROVIDER_ORDER[left.candidate.surface] -
      PROVIDER_ORDER[right.candidate.surface] ||
    left.candidate.candidateId.localeCompare(right.candidate.candidateId)
  );
}

function mealFitScore(
  candidate: ReadOnlyCandidate,
  missingComponent: MissingComponent,
): number {
  if (!candidateFitsMissingComponent(candidate, missingComponent)) {
    return 0;
  }

  const tags = candidate.semanticTags.map((tag) => tag.toLowerCase());
  const exactTags = exactFitTags(missingComponent);
  if (tags.some((tag) => exactTags.includes(tag))) {
    return 100;
  }

  return 80;
}

function budgetFitScore(priceInr: number, budgetMaxInr: number): number {
  if (budgetMaxInr <= 0 || priceInr > budgetMaxInr) {
    return 0;
  }
  return clampScore(
    Math.round(((budgetMaxInr - priceInr) / budgetMaxInr) * 100),
  );
}

function etaFitScore(
  etaMinutes: number | undefined,
  maxEtaMinutes: number | undefined,
): number {
  if (maxEtaMinutes === undefined) {
    return 75;
  }
  if (etaMinutes === undefined) {
    return 50;
  }
  if (maxEtaMinutes <= 0 || etaMinutes > maxEtaMinutes) {
    return 0;
  }
  return clampScore(
    Math.round(((maxEtaMinutes - etaMinutes) / maxEtaMinutes) * 100),
  );
}

function minimumUsefulPurchaseFitScore(
  quantity: number,
  servings: 1 | 2,
): number {
  if (quantity === 1) {
    return 100;
  }
  if (quantity === servings) {
    return 90;
  }
  return clampScore(100 - (quantity - 1) * 20);
}

function statedPreferenceFitScore(
  candidate: ReadOnlyCandidate,
  request: CompletionRequest,
): number {
  if (request.constraints.diet === "VEGETARIAN") {
    return candidate.diet === "VEGETARIAN" ? 100 : 60;
  }
  return candidate.diet === "UNKNOWN" ? 80 : 100;
}

function etaForSort(candidate: ReadOnlyCandidate): number {
  return candidate.etaMinutes ?? Number.MAX_SAFE_INTEGER;
}

function exactFitTags(missingComponent: MissingComponent): readonly string[] {
  switch (missingComponent) {
    case "NEED_BASE":
      return ["base", "rice", "roti", "paratha", "bread"];
    case "NEED_MAIN":
      return ["main", "dal", "curry", "sabzi"];
    case "NEED_PROTEIN":
      return ["protein", "paneer", "egg", "chicken"];
    case "NEED_SIDE":
      return ["side", "curd", "raita", "salad"];
    case "NEED_VOLUME":
      return ["volume", "side"];
    case "NEED_COMPLETE_MEAL":
    case "INSUFFICIENT_INFORMATION":
      return [];
  }
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}
