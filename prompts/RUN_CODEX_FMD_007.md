# FMD-007 — Read-Only Meal-Completion API

You are the staff backend and platform engineer for EatRight.

## Read first

Read these files in order before proposing changes:

1. `AGENTS.md`
2. `CONTEXT_INDEX.md`
3. `AI_PRD.md`
4. `EXECUTION_PLAN.md`
5. `docs/architecture/CONTRACTS.md`
6. `docs/architecture/STUB_PROVIDERS.md`
7. `docs/architecture/PLANNER.md`
8. `docs/design/UI_SPEC.md`
9. `packages/contracts/**`
10. `packages/providers-stub/**`
11. `packages/planner/**`
12. `apps/web/**`

## Objective

Implement the M0 server-side, read-only meal-completion API.

The API must accept a validated `CompletionRequest`, resolve a deterministic local stub serviceability context from the explicitly selected demo address, invoke `@finish-my-dinner/planner` with injected deterministic stub Food and Instamart providers, validate the planner output at runtime, and return one safe structured result.

This task wires the existing read-only domain packages together. It does not implement live Swiggy MCP access or any commerce action.

## Owned paths

Primary ownership:

- `apps/web/src/app/api/meal-completion/**`
- `apps/web/src/server/meal-completion/**`
- API-specific tests under `apps/web/tests/**` or colocated with the route
- `docs/architecture/READ_ONLY_API.md`
- `apps/web/package.json` only if required
- `pnpm-lock.yaml` only if required

Do not modify:

- `apps/web/src/features/meal-request/**`
- `apps/web/src/features/recommendation/**`
- `docs/design/**`
- `packages/contracts/**`
- `packages/providers-stub/**`
- `packages/planner/**`

If an existing contract prevents safe implementation, stop and report the exact blocker before editing a protected package.

## Endpoint

Implement a same-origin Next.js route:

```text
POST /api/meal-completion
```

The route accepts JSON only.

Do not add additional public endpoints unless strictly required and approved.

## Request handling

The route must:

1. Reject non-JSON or malformed JSON safely.
2. Enforce a small request-body limit suitable for the structured request.
3. Validate the body with the existing `CompletionRequest` runtime schema.
4. Reject unknown fields according to the existing schema behavior.
5. Resolve only explicitly selected local demo address IDs.
6. Never accept raw address text as serviceability truth.
7. Invoke the planner through injected read-only provider ports.
8. Validate the returned value using `plannerOutcomeSchema`.
9. Return a safe response with no raw provider payloads.
10. Never log tokens, addresses, exclusions as raw free text, or full request bodies.

## Demo address boundary

M0 has no live `get_addresses` call.

Use the existing local/stub address IDs created by FMD-005, or define a server-only mapping that exactly matches those IDs.

Requirements:

- no default address
- unknown address ID returns a safe validation/domain failure
- no real address data
- no serviceability claim outside the deterministic stub scenario
- the response must clearly remain in demo/read-only mode

Do not modify the frontend address fixtures unless a strict mismatch makes the API unusable. If a mismatch exists, report it before proceeding.

## Provider and planner wiring

Construct the planner server-side:

```text
createDeterministicPlanner({
  foodPort,
  instamartPort,
  ...safeConfig
})
```

Requirements:

- use only `@finish-my-dinner/providers-stub`
- no global mutable provider state
- no direct network calls
- deterministic scenario selection
- provider failures remain independent
- use existing planner timeout/failure behavior
- no LLM dependency
- no client-provided provider implementation or scoring configuration

## Response behavior

Use a small, stable JSON response envelope.

Prefer existing API contracts where suitable. If no suitable shared envelope exists, define a route-local runtime schema and document it without modifying `packages/contracts`.

Recommended behavior:

- `200` for every valid planner domain outcome, including recommendation, no match, handoff, insufficient information, unserviceable, or provider failure
- `400` for malformed JSON
- `415` for unsupported content type
- `422` for a structurally invalid request or unknown demo address ID
- `500` only for an unexpected internal invariant failure

The success envelope should include only:

- API version
- safe request/correlation ID
- read-only/demo capability marker
- validated `PlannerOutcome`

The error envelope should include only:

- API version
- safe request/correlation ID
- stable error code
- short neutral message
- optional safe field issues

Do not expose stack traces, provider internals, raw Zod errors, raw request bodies, tokens, or infrastructure details.

## Capability enforcement

The route must fail closed unless the runtime is explicitly:

```text
MCP_ENV=stub
CAPABILITY_LEVEL=read_only
ALLOW_REAL_SWIGGY_MUTATIONS=false
ALLOW_REAL_SWIGGY_ORDERS=false
```

Use the repository’s existing environment validation and capability assertion mechanisms.

Do not silently downgrade an unsafe runtime into a partially working route.

## Logging and observability

Add minimal safe structured logging or an injectable logger.

Allowed fields:

- request/correlation ID
- endpoint
- outcome kind or stable error code
- selected provider when a recommendation exists
- duration bucket or numeric latency
- HTTP status
- stub/read-only capability marker

Forbidden fields:

- full request body
- raw free text
- full exclusions
- address text
- OAuth tokens
- payment data
- provider raw payloads
- stack traces in user responses

Tests must be able to inspect logging without relying on console output.

## Security and privacy

- Same-origin only; do not introduce permissive CORS.
- Do not trust client-supplied capability flags.
- Do not allow client selection of arbitrary scenario internals.
- Do not expose provider ports to the client.
- Do not execute URLs from user input.
- Do not add cookies or persistence.
- Do not store request payloads.
- Do not introduce analytics containing raw free text.
- Set response headers appropriate for sensitive transient API responses, including `Cache-Control: no-store`.

## Required tests

Add tests for at least:

1. Valid rice + curd request returns one validated recommendation.
2. Dal request returns a valid base-completion outcome.
3. Valid no-match outcome returns HTTP 200.
4. Valid handoff outcome returns HTTP 200.
5. Valid insufficient-information outcome returns HTTP 200.
6. One-provider failure with another provider success returns HTTP 200.
7. Both-provider failure returns HTTP 200 with the correct planner outcome.
8. Unsupported content type returns 415.
9. Malformed JSON returns 400.
10. Invalid `CompletionRequest` returns 422.
11. Unknown demo address ID returns 422.
12. Extra/unsafe request fields are rejected according to contracts.
13. Response validates against its runtime schema.
14. Planner outcome validates against `plannerOutcomeSchema`.
15. Response includes `Cache-Control: no-store`.
16. No response contains cart, checkout, coupon, payment, order, or tracking fields.
17. No external network call is made.
18. Unsafe capability configuration fails closed.
19. Logs contain only allowed metadata.
20. Repeated identical inputs produce deterministic outcomes.

Use route-level tests where practical. Extract a request handler/service function when needed for deterministic unit testing, but keep the public API surface small.

## Documentation

Create `docs/architecture/READ_ONLY_API.md` covering:

- endpoint contract
- request validation
- response envelope
- HTTP status semantics
- demo-address mapping
- provider/planner dependency injection
- capability enforcement
- logging and privacy
- error handling
- deterministic stub behavior
- M0 limitations
- future boundary for real Swiggy MCP adapters
- explicit prohibition on commerce actions

## Forbidden scope

Do not implement:

- live Swiggy MCP
- OAuth
- `get_addresses`
- real serviceability
- external HTTP provider clients
- database persistence
- cookies or user sessions
- LLM planning
- cart mutation
- coupons
- checkout
- payment
- ordering
- tracking
- cancellation
- frontend recommendation UI
- deployment

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
4. Endpoint and response-envelope design
5. Demo-address mapping design
6. Planner/provider wiring design
7. Capability and security design
8. Test plan
9. Risks or blockers
10. `Real Swiggy mutation/order planned: NO`

Do not modify files until I reply:

```text
PLAN APPROVED.
```

After approval:

- implement FMD-007 exactly as scoped
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
- endpoint decisions
- known gaps
- security/privacy impact
- `Real Swiggy mutation/order executed: NO`
