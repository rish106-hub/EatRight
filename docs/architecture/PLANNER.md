# Meal-Completion Planner

Owner: Codex for `FMD-006`

Status: M0 read-only deterministic planner.

## Public API

Package: `@finish-my-dinner/planner`

Primary exports:

```ts
createDeterministicPlanner({
  foodPort,
  instamartPort,
  providerTimeoutMs,
  resultLimit,
});
```

The returned `PlannerPort` exposes:

```ts
plan({
  request,
  serviceability,
});
```

Provider dependencies are injected once at planner creation. Per-request input
contains only validated domain data:

- `CompletionRequest`
- `AddressServiceabilityContext`

The package also exports `plannerOutcomeSchema`, a runtime-validated
discriminated union. API and UI layers can validate planner output without
trusting TypeScript-only types.

## Planning Stages

1. Validate `CompletionRequest` and serviceability context through shared
   contracts.
2. Derive one missing component from normalized structured fields.
3. Stop early for insufficient information, no-purchase-required, unserviceable,
   or standard Swiggy handoff cases.
4. Search Food and Instamart concurrently through injected provider ports.
5. Validate provider output against shared contracts.
6. Filter hard violations.
7. Score and rank valid candidates deterministically.
8. Return exactly one outcome.

The planner does not inspect or classify raw user free text.

## Rule Precedence

Rules are ordered and tested. First match wins.

| Order | Rule ID | Result |
|---:|---|---|
| 1 | `UNKNOWN_OR_EMPTY` | `INSUFFICIENT_INFORMATION` |
| 2 | `NOTHING_USEFUL` | `NEED_COMPLETE_MEAL` handoff |
| 3 | `LOW_VOLUME_LEFTOVER` | `NEED_VOLUME` |
| 4 | `RICE_CURD_NEEDS_MAIN` | `NEED_MAIN` |
| 5 | `DAL_WITHOUT_BASE` | `NEED_BASE` |
| 6 | `ROTIS_WITHOUT_MAIN` | `NEED_MAIN` |
| 7 | `RICE_WITH_VEGETABLE_SIDE_NEEDS_PROTEIN` | `NEED_PROTEIN` |
| 8 | `COMPLETE_ENOUGH` | no purchase required |
| 9 | `BASE_WITHOUT_MAIN` | `NEED_MAIN` |
| 10 | `MAIN_WITHOUT_BASE` | `NEED_BASE` |
| 11 | `BASE_AND_MAIN_NEEDS_SIDE` | `NEED_SIDE` |
| 12 | `INSUFFICIENT_STRUCTURED_INFORMATION` | `INSUFFICIENT_INFORMATION` |

This resolves known conflicts:

- Rice + curd resolves to `NEED_MAIN`.
- Rotis without a main resolve to `NEED_MAIN`.
- Rice + structured vegetable side without protein resolves to `NEED_PROTEIN`.
- Low-volume leftovers resolve to `NEED_VOLUME` before completeness rules.
- `UNKNOWN` fails before provider search.

## Search

Each missing component maps to at most three provider-neutral queries. Food and
Instamart are searched concurrently. Each provider search has independent
timeout and schema validation.

One provider failure does not suppress valid candidates from the other provider.
If both providers fail, planner returns `BOTH_PROVIDERS_FAILED`.

Network access can occur only inside injected provider ports. The planner has no
HTTP client, MCP SDK, OAuth, database, or global provider client.

## Filtering

Candidates are rejected when any hard filter fails:

- provider surface is not serviceable
- contract validation fails
- candidate is not `AVAILABLE`
- vegetarian request receives `NON_VEGETARIAN`
- explicit exclusion matches display name, merchant name, or semantic tags
- estimated item price exceeds budget max
- known ETA exceeds max ETA
- candidate semantic tags/name do not fit the missing component
- price status is not `ITEM_ESTIMATE`

Unknown diet is not treated as verified vegetarian. It may pass when not a hard
violation, but lowers confidence.

The planner returns rejection codes such as `OVER_BUDGET`, `OVER_MAX_ETA`,
`DIET`, `EXCLUSION`, `MISSING_COMPONENT_FIT`, and `NON_ESTIMATED_PRICE`.

## Scoring

All scores are integers in `[0, 100]`.

```text
total =
  round((
    mealFit * 35 +
    budgetFit * 20 +
    etaFit * 15 +
    providerReliabilityFit * 10 +
    minimumUsefulPurchaseFit * 10 +
    statedPreferenceFit * 10
  ) / 100)
```

Component definitions:

- `mealFit`: `100` for exact semantic tag match, `80` for accepted adjacent fit,
  `0` otherwise.
- `budgetFit`: `round(((budgetMax - price) / budgetMax) * 100)`, clamped to
  `[0, 100]`; `0` if over budget.
- `etaFit`: with max ETA and known ETA,
  `round(((maxEta - eta) / maxEta) * 100)`, clamped to `[0, 100]`; `50` when ETA
  is unknown but max ETA exists; `75` when user provided no max ETA.
- `providerReliabilityFit`: `50` for every candidate in M0. Existing verified
  contracts contain no reliable provider-quality signal, so planner does not
  invent one.
- `minimumUsefulPurchaseFit`: `100` for quantity `1`, `90` when quantity equals
  servings, otherwise `100 - ((quantity - 1) * 20)` clamped to `[0, 100]`.
- `statedPreferenceFit`: `100` when diet preference is known to fit, `60` for
  unknown diet under vegetarian preference, `80` for unknown diet under mixed
  preference.

No score uses randomness, current time, model output, hidden reasoning, or
provider-specific quality assumptions.

## Tie-Breaking

Sorted order:

1. Higher total score
2. Higher meal-fit score
3. Lower estimated price
4. Lower ETA, with unknown ETA last
5. Stable provider order: `FOOD`, then `INSTAMART`
6. Lexical `candidateId`

## Outcomes

`PlannerOutcome` returns exactly one status:

- `RECOMMENDATION_READY`
- `NO_VALID_COMPLETION`
- `INSUFFICIENT_INFORMATION`
- `NO_PURCHASE_REQUIRED`
- `UNSERVICEABLE`
- `BOTH_PROVIDERS_FAILED`
- `STANDARD_SWIGGY_HANDOFF_REQUIRED`

Successful output includes one primary recommendation, selected provider,
selected candidate, estimated item price, estimated ETA when known, assumptions,
provider summary, rejection summary, and selected score breakdown.

Failure outputs return stable reason codes, suggested-action enums, provider
summary where relevant, and short neutral summaries. Exact screen copy remains
owned by UI.

## Surfaced Assumptions

Planner may surface:

- home quantity assumed enough for selected servings
- candidate diet is unknown in provider data
- provider comparison is incomplete

No assumption claims medical, allergy, nutritional, or health suitability.

## M0 Limits

The planner is read-only. It does not expose or create:

- cart mutation
- checkout
- payment
- coupons
- order placement
- tracking
- exact final totals
- merchant endorsement claims
- health or allergy-safety claims
- raw addresses
- tokens
- raw provider payloads

M0 recommendations use `ITEM_ESTIMATE` only. Final fees are unavailable in
read-only mode.

## Future LLM Boundary

A future LLM-assisted planner may sit behind a separate `PlannerPort`, but it
must preserve deterministic fallback, runtime output validation, redacted input,
and external policy enforcement. It must not choose permissions, invent IDs,
set prices, call commerce tools, or infer safety claims.

## Commerce Prohibition

No real Swiggy mutation or order is planned or executed by this planner.
