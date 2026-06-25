# FMD-004 — Deterministic Read-Only Stub Providers

You are the staff backend/platform engineer for EatRight.

Read first:

1. AGENTS.md
2. CONTEXT_INDEX.md
3. AI_PRD.md
4. EXECUTION_PLAN.md
5. docs/architecture/CONTRACTS.md
6. docs/design/UI_SPEC.md
7. packages/contracts source and tests

## Objective

Implement deterministic, provider-neutral Food and Instamart stub adapters for the M0 read-only validation product.

These adapters must implement the interfaces exposed by `@finish-my-dinner/contracts`. They simulate candidate search, provider health, serviceability, latency, no-match states, and provider failures without making any network or MCP calls.

## Owned paths

Primary ownership:

- packages/providers-stub/**
- docs/architecture/STUB_PROVIDERS.md
- pnpm-lock.yaml only when required
- minimal workspace configuration required to register the package

Do not modify:

- apps/web/**
- docs/design/**
- packages/contracts/** unless you discover a blocking contract defect; stop and report before changing it

## Required implementation

Create `@finish-my-dinner/providers-stub`.

It must provide:

- deterministic Food candidate search adapter
- deterministic Instamart candidate search adapter
- deterministic serviceability context
- provider health states
- configurable latency simulation
- configurable provider failure simulation
- no-match simulation
- candidate normalisation into shared contracts
- reproducible results from a fixed seed/scenario
- zero network access

## Required scenarios

At minimum:

- rice + curd → Food main candidate
- rice + curd → Instamart ready-to-eat main candidate
- dal → ready rotis or microwave rice
- rotis → curry or sabzi
- insufficient biryani → side/protein/volume complement
- Food-only result
- Instamart-only result
- both-provider result
- Food failure with Instamart success
- Instamart failure with Food success
- both-provider failure
- no valid completion
- unserviceable context
- over-budget candidates filtered
- dietary violation filtered
- deterministic repeated output

## Constraints

- No OAuth
- No live Swiggy MCP
- No HTTP requests
- No MCP SDK connection
- No cart mutation
- No checkout
- No payment
- No ordering
- No application UI
- No database
- No external user data
- No real address data

Do not invent live Swiggy endpoint schemas.

## Tests

Add unit tests proving:

- adapters satisfy shared interfaces
- every required scenario validates against contracts
- deterministic scenarios return identical results
- malformed fixtures fail validation
- provider failures are structured
- price remains estimated
- no confirmed cart/payment/order fields can appear
- no network call is attempted

Run:

- pnpm format:check
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build
- pnpm check
- pnpm assert:capabilities

## Documentation

`docs/architecture/STUB_PROVIDERS.md` must explain:

- package purpose
- scenario catalogue
- deterministic seed/scenario mechanism
- failure injection
- how the future planner consumes adapters
- how future real MCP adapters replace stubs
- explicit prohibition on production commerce calls

## Execution protocol

First respond only with:

1. Current branch/worktree
2. Files inspected
3. Proposed files
4. Package design
5. Scenario design
6. Test plan
7. Risks/blockers
8. `Real Swiggy mutation/order planned: NO`

Wait for:

PLAN APPROVED.

After approval:

- implement
- run all checks
- self-review the complete diff
- commit focused changes
- push only this branch
- open a PR against main
- do not merge

Final report must include commit, PR URL, files changed, tests, known gaps, and:

`Real Swiggy mutation/order executed: NO`
