# FMD-006 — Deterministic Meal-Completion Planner

You are the staff backend and decision-systems engineer for EatRight.

## Read first

Read these files in order before proposing any changes:

1. `AGENTS.md`
2. `CONTEXT_INDEX.md`
3. `AI_PRD.md`
4. `EXECUTION_PLAN.md`
5. `docs/architecture/CONTRACTS.md`
6. `docs/architecture/STUB_PROVIDERS.md`
7. `docs/design/UI_SPEC.md`
8. `packages/contracts/**`
9. `packages/providers-stub/**`
10. `apps/web/**` only to understand the `CompletionRequest` produced by FMD-005

## Objective

Implement the deterministic M0 meal-completion planner.

The planner receives:

- a validated `CompletionRequest`
- provider-neutral Food and Instamart search ports
- serviceability context

It must:

1. Derive the missing meal component.
2. Search Food and Instamart concurrently.
3. Handle provider failures independently.
4. Validate and filter candidates.
5. Rank candidates deterministically.
6. Return exactly one primary recommendation.
7. Return structured failure or no-match outcomes when no recommendation is valid.

This is a read-only decision engine.

## Owned paths

Primary ownership:

- `packages/planner/**`
- `docs/architecture/PLANNER.md`
- `pnpm-lock.yaml` only if required
- minimal workspace configuration required to register the package

Do not modify:

- `apps/web/**`
- `docs/design/**`
- `packages/contracts/**`
- `packages/providers-stub/**`

If an existing contract makes safe implementation impossible, stop and report the exact blocking contract defect before changing anything.

## Package

Create:

```text
@finish-my-dinner/planner
```

Expose a small stable public API. Do not expose unnecessary implementation internals.

## Required inputs

Use `@finish-my-dinner/contracts` as the source of truth.

The planner must consume the existing equivalents of:

- completion request
- address or serviceability context
- selected home-food components
- quantity confidence
- meal weight
- servings
- dietary preference
- hard exclusions
- budget
- maximum ETA
- Food provider search port
- Instamart provider search port

Do not duplicate enums, schemas, or domain types.

## Planning stages

### 1. Validate the request

Validate the input using existing runtime contracts.

Reject malformed or incomplete requests with structured domain errors.

### 2. Derive the missing component

Implement deterministic rules supporting at least:

- Rice + curd → `NEED_MAIN`
- Dal without rice/roti → `NEED_BASE`
- Rotis without a main → `NEED_MAIN`
- Insufficient leftover biryani → `NEED_VOLUME`
- Carbohydrate base without protein → `NEED_PROTEIN`, where appropriate
- Complete-enough meal → no-purchase-required outcome
- `NOTHING_USEFUL` → `NEED_COMPLETE_MEAL` and standard Swiggy handoff outcome
- `UNKNOWN` or insufficient information → `INSUFFICIENT_INFORMATION`

Do not add an LLM dependency in M0.

### 3. Search providers concurrently

- Search Food and Instamart concurrently.
- Use independent timeouts or structured provider outcomes.
- One provider failure must not suppress valid candidates from the other.
- Both-provider failure must return a structured failure result.
- Network access may occur only through injected provider interfaces.
- In tests, use the deterministic stub providers.

### 4. Validate and filter candidates

Hard-filter candidates that violate:

- serviceability
- availability
- dietary preference
- hard exclusions
- budget
- maximum ETA
- missing-component fit
- runtime contract validity
- M0 read-only price semantics

M0 recommendations may include estimated prices only.

Do not introduce:

- confirmed cart totals
- payment fields
- checkout fields
- order fields
- coupon fields
- merchant endorsement claims
- health claims
- allergen-safety claims

### 5. Rank candidates deterministically

Use this provisional scoring model:

- Meal fit: 35%
- Budget fit: 20%
- ETA fit: 15%
- Provider/reliability fit: 10%
- Minimum-useful-purchase fit: 10%
- Stated-preference fit: 10%

Requirements:

- no random ranking
- no current-time-dependent ranking
- no model-generated scoring
- score components must be inspectable
- use integer scores or another stable comparison approach
- tie-breaking must be deterministic

Tie-break order:

1. Higher total score
2. Higher meal-fit score
3. Lower estimated price
4. Lower ETA
5. Stable provider ordering
6. Candidate ID lexical ordering

### 6. Return one outcome

Return exactly one of:

- one primary recommendation
- no valid completion
- insufficient information
- no purchase required
- unserviceable
- both providers failed
- standard Swiggy handoff required

A successful recommendation must include:

- what the user already has
- what should be added
- missing-component type
- selected provider
- selected candidate
- estimated price
- estimated ETA
- surfaced assumptions
- concise explanation
- provider availability/failure summary
- deterministic score breakdown

Do not return an infinite list or marketplace feed.

## Required test scenarios

Add tests for at least:

1. Rice + curd with Food and Instamart candidates
2. Dal needing a base
3. Rotis needing a main
4. Small leftover biryani needing volume
5. Food-only success
6. Instamart-only success
7. Both-provider success
8. Food failure with Instamart success
9. Instamart failure with Food success
10. Both-provider failure
11. No valid completion
12. Unserviceable context
13. All candidates over budget
14. All candidates over maximum ETA
15. Dietary violation filtered
16. Hard exclusion filtered
17. Complete-enough meal
18. `NOTHING_USEFUL` handoff
19. `UNKNOWN` or insufficient information
20. Deterministic repeated output
21. Deterministic tie-breaking
22. Exactly one primary recommendation
23. Estimated-price semantics preserved
24. Invalid provider payload rejected
25. No network call outside injected ports
26. No cart, checkout, payment, or order fields in results

Use `@finish-my-dinner/providers-stub` where useful.

## Architecture constraints

- Pure domain logic and orchestration
- Dependency injection for provider ports
- No global provider clients
- No environment-specific branching inside ranking logic
- No live MCP SDK
- No direct HTTP transport
- No OAuth
- No database
- No application UI
- No cart
- No coupon
- No checkout
- No payment
- No ordering
- No tracking
- No autonomous actions
- No secrets
- No raw user-address data
- No unsafe `any`

## Documentation

Create `docs/architecture/PLANNER.md` covering:

- public planner API
- planning stages
- missing-component derivation rules
- filtering rules
- scoring model
- deterministic tie-breaking
- provider-failure behavior
- successful and unsuccessful outcomes
- assumptions surfaced to the UI
- M0 limitations
- future boundary for an LLM-assisted planner
- explicit prohibition on commerce actions

## Required checks

Run and pass:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
pnpm assert:capabilities
```

## Execution protocol

First respond with only:

1. Current branch and worktree
2. Files inspected
3. Proposed files
4. Public planner API
5. Missing-component rule design
6. Filtering and ranking design
7. Failure-outcome design
8. Test plan
9. Risks or blockers
10. `Real Swiggy mutation/order planned: NO`

Do not modify files until I reply:

```text
PLAN APPROVED.
```

After approval:

- implement FMD-006 exactly as scoped
- run the complete validation suite
- inspect the complete diff
- confirm no live MCP or commerce capability was introduced
- commit focused changes
- push only the current branch
- open a pull request against `main`
- do not merge the pull request

The final report must include:

- commit hash
- pull-request URL
- files changed
- tests executed
- planner decisions
- known gaps
- security/privacy impact
- `Real Swiggy mutation/order executed: NO`
