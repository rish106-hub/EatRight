import {
  readOnlyCandidateSchema,
  type AddressServiceabilityContext,
  type CompletionRequest,
  type MissingComponent,
  type ReadOnlyCandidate,
} from "@finish-my-dinner/contracts";
import type { RejectionCode, RejectedCandidateSummary } from "./schema";

export interface FilteredCandidates {
  valid: ReadOnlyCandidate[];
  rejected: RejectedCandidateSummary[];
}

export function filterCandidates(
  candidates: readonly unknown[],
  request: CompletionRequest,
  missingComponent: MissingComponent,
  serviceability: AddressServiceabilityContext,
): FilteredCandidates {
  const valid: ReadOnlyCandidate[] = [];
  const rejected: RejectedCandidateSummary[] = [];

  for (const unknownCandidate of candidates) {
    const parsed = readOnlyCandidateSchema.safeParse(unknownCandidate);
    if (!parsed.success) {
      rejected.push({
        candidateId: "invalid-candidate",
        provider: "FOOD",
        reasons: ["INVALID_CONTRACT"],
      });
      continue;
    }

    const candidate = parsed.data;
    const reasons = rejectionReasons(
      candidate,
      request,
      missingComponent,
      serviceability,
    );
    if (reasons.length === 0) {
      valid.push(candidate);
    } else {
      rejected.push({
        candidateId: candidate.candidateId,
        provider: candidate.surface,
        reasons,
      });
    }
  }

  return { valid, rejected };
}

function rejectionReasons(
  candidate: ReadOnlyCandidate,
  request: CompletionRequest,
  missingComponent: MissingComponent,
  serviceability: AddressServiceabilityContext,
): RejectionCode[] {
  const reasons: RejectionCode[] = [];

  if (serviceability.serviceability[candidate.surface] !== "SERVICEABLE") {
    reasons.push("NOT_SERVICEABLE");
  }

  if (candidate.availability !== "AVAILABLE") {
    reasons.push("UNAVAILABLE");
  }

  if (
    request.constraints.diet === "VEGETARIAN" &&
    candidate.diet === "NON_VEGETARIAN"
  ) {
    reasons.push("DIET");
  }

  if (matchesExclusion(candidate, request.constraints.exclusions)) {
    reasons.push("EXCLUSION");
  }

  if (candidate.price.amountInr > request.constraints.budgetInr.max) {
    reasons.push("OVER_BUDGET");
  }

  if (
    request.constraints.maxEtaMinutes !== undefined &&
    candidate.etaMinutes !== undefined &&
    candidate.etaMinutes > request.constraints.maxEtaMinutes
  ) {
    reasons.push("OVER_MAX_ETA");
  }

  if (!candidateFitsMissingComponent(candidate, missingComponent)) {
    reasons.push("MISSING_COMPONENT_FIT");
  }

  if (candidate.price.status !== "ITEM_ESTIMATE") {
    reasons.push("NON_ESTIMATED_PRICE");
  }

  return reasons;
}

export function candidateFitsMissingComponent(
  candidate: ReadOnlyCandidate,
  missingComponent: MissingComponent,
): boolean {
  const tags = candidate.semanticTags.map((tag) => tag.toLowerCase());
  const name = candidate.displayName.toLowerCase();
  const haystack = [...tags, name].join(" ");

  switch (missingComponent) {
    case "NEED_BASE":
      return containsAny(haystack, [
        "base",
        "rice",
        "roti",
        "paratha",
        "bread",
      ]);
    case "NEED_MAIN":
      return containsAny(haystack, [
        "main",
        "dal",
        "curry",
        "sabzi",
        "paneer",
        "protein",
        "ready-to-eat",
      ]);
    case "NEED_PROTEIN":
      return containsAny(haystack, [
        "protein",
        "paneer",
        "egg",
        "chicken",
        "dal",
      ]);
    case "NEED_SIDE":
      return containsAny(haystack, [
        "side",
        "curd",
        "raita",
        "salad",
        "vegetable",
      ]);
    case "NEED_VOLUME":
      return containsAny(haystack, [
        "volume",
        "side",
        "raita",
        "salad",
        "kebab",
      ]);
    case "NEED_COMPLETE_MEAL":
    case "INSUFFICIENT_INFORMATION":
      return false;
  }
}

function matchesExclusion(
  candidate: ReadOnlyCandidate,
  exclusions: readonly string[],
): boolean {
  const searchableText = [
    candidate.displayName,
    candidate.merchantName,
    ...candidate.semanticTags,
  ]
    .join(" ")
    .toLowerCase();

  return exclusions.some((exclusion) =>
    searchableText.includes(exclusion.toLowerCase()),
  );
}

function containsAny(value: string, needles: readonly string[]): boolean {
  return needles.some((needle) => value.includes(needle));
}
