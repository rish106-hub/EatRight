import {
  providerSearchResultSchema,
  type CandidateSource,
  type CompletionRequest,
  type FoodCandidateSearchPort,
  type InstamartCandidateSearchPort,
  type ProviderFailureReason,
  type ProviderSearchRequest,
  type ProviderSearchResult,
  type ReadOnlyCandidate,
} from "@finish-my-dinner/contracts";
import type { ProviderSearchSummary } from "./schema";

export interface ProviderPorts {
  foodPort: FoodCandidateSearchPort;
  instamartPort: InstamartCandidateSearchPort;
}

export interface SearchConfig {
  providerTimeoutMs: number;
  resultLimit: number;
}

export interface SurfaceSearchResult {
  provider: CandidateSource;
  candidates: ReadOnlyCandidate[];
  summary: ProviderSearchSummary;
}

type SearchInvoker = (
  request: ProviderSearchRequest,
) => Promise<ProviderSearchResult>;

export async function searchProviders(
  request: CompletionRequest,
  queries: readonly string[],
  ports: ProviderPorts,
  config: SearchConfig,
): Promise<Record<CandidateSource, SurfaceSearchResult>> {
  const [food, instamart] = await Promise.all([
    searchSurface(
      "FOOD",
      request,
      queries,
      ports.foodPort.searchFoodCandidates.bind(ports.foodPort),
      config,
    ),
    searchSurface(
      "INSTAMART",
      request,
      queries,
      ports.instamartPort.searchInstamartCandidates.bind(ports.instamartPort),
      config,
    ),
  ]);

  return { FOOD: food, INSTAMART: instamart };
}

async function searchSurface(
  provider: CandidateSource,
  request: CompletionRequest,
  queries: readonly string[],
  invoke: SearchInvoker,
  config: SearchConfig,
): Promise<SurfaceSearchResult> {
  const boundedQueries = queries.slice(0, 3);
  const results = await Promise.all(
    boundedQueries.map((query) =>
      searchOne(provider, request, query, invoke, config),
    ),
  );
  const successes = results.filter(
    (result): result is ProviderSearchResult & { status: "SUCCESS" } =>
      result.status === "SUCCESS",
  );
  const candidates = dedupeCandidates(
    successes.flatMap((result) => result.candidates),
  );
  const failure = results.find((result) => result.status === "FAILURE");

  return {
    provider,
    candidates,
    summary: {
      provider,
      status: successes.length > 0 ? "SUCCESS" : "FAILURE",
      serviceability: "SERVICEABLE",
      searchedQueryCount: boundedQueries.length,
      candidateCount: candidates.length,
      validCandidateCount: 0,
      ...(successes.length > 0
        ? {}
        : { failureReason: failure?.failure.reason ?? "UPSTREAM_ERROR" }),
    },
  };
}

async function searchOne(
  provider: CandidateSource,
  request: CompletionRequest,
  query: string,
  invoke: SearchInvoker,
  config: SearchConfig,
): Promise<ProviderSearchResult> {
  try {
    const rawResult = await withTimeout(
      invoke({
        request,
        query,
        limit: config.resultLimit,
      }),
      config.providerTimeoutMs,
    );
    const parsed = providerSearchResultSchema.safeParse(rawResult);
    if (!parsed.success) {
      return providerFailure(provider, "SCHEMA_MISMATCH");
    }
    return parsed.data;
  } catch (error) {
    return providerFailure(
      provider,
      error instanceof ProviderTimeoutError ? "TIMEOUT" : "UPSTREAM_ERROR",
    );
  }
}

function providerFailure(
  provider: CandidateSource,
  reason: ProviderFailureReason,
): ProviderSearchResult {
  return {
    status: "FAILURE",
    searchedAt: "2026-06-25T12:00:00.000+05:30",
    failure: {
      provider,
      reason,
      retryable: reason !== "SCHEMA_MISMATCH",
      message: `${provider} read-only candidate search failed.`,
    },
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  if (timeoutMs <= 0) {
    return promise;
  }

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new ProviderTimeoutError());
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

class ProviderTimeoutError extends Error {
  constructor() {
    super("provider search timed out");
  }
}

function dedupeCandidates(
  candidates: readonly ReadOnlyCandidate[],
): ReadOnlyCandidate[] {
  const seen = new Set<string>();
  const deduped: ReadOnlyCandidate[] = [];

  for (const candidate of candidates) {
    if (!seen.has(candidate.candidateId)) {
      seen.add(candidate.candidateId);
      deduped.push(candidate);
    }
  }

  return deduped;
}
