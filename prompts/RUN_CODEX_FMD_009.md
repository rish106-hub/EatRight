# FMD-009 — End-to-End Read-Only Demo Integration

You are the staff full-stack engineer for EatRight.

## Read first

Read these files in order before proposing changes:

1. `AGENTS.md`
2. `CONTEXT_INDEX.md`
3. `AI_PRD.md`
4. `EXECUTION_PLAN.md`
5. `docs/architecture/CONTRACTS.md`
6. `docs/architecture/STUB_PROVIDERS.md`
7. `docs/architecture/PLANNER.md`
8. `docs/architecture/READ_ONLY_API.md`
9. `docs/design/UI_SPEC.md`
10. `packages/contracts/**`
11. `packages/planner/**`
12. `packages/providers-stub/**`
13. `apps/web/src/features/meal-request/**`
14. `apps/web/src/features/recommendation/**`
15. `apps/web/src/app/api/meal-completion/**`
16. `apps/web/src/server/meal-completion/**`

## Objective

Wire the existing M0 pieces into one end-to-end read-only demo:

Home-food input → validated `CompletionRequest` → POST `/api/meal-completion` → validated `PlannerOutcome` → recommendation/outcome UI.

This task integrates already-built components. It must not introduce live Swiggy MCP, OAuth, carts, checkout, payment, ordering, or tracking.

## Owned paths

Primary ownership:

- `apps/web/src/app/**`
- `apps/web/src/features/meal-request/**`
- `apps/web/src/features/recommendation/**`
- `apps/web/src/features/demo-flow/**` if needed
- `apps/web/tests/**`
- `docs/architecture/M0_DEMO_FLOW.md`
- `apps/web/package.json` only if strictly required
- `pnpm-lock.yaml` only if strictly required

Do not modify:

- `packages/contracts/**`
- `packages/planner/**`
- `packages/providers-stub/**`
- `apps/web/src/server/meal-completion/**`
- `apps/web/src/app/api/meal-completion/**`
- `docs/architecture/CONTRACTS.md`
- `docs/architecture/STUB_PROVIDERS.md`
- `docs/architecture/PLANNER.md`
- `docs/architecture/READ_ONLY_API.md`

If an API or contract blocks integration, stop and report the precise blocker before editing protected packages.

## Required user flow

Implement the complete M0 demo flow:

1. User lands on the app.
2. User sees the read-only/demo boundary.
3. User starts the meal-completion flow.
4. User selects an explicit local demo address.
5. User selects home-food components.
6. User sets serving count, diet preference, exclusions, budget, ETA, and meal weight if already supported.
7. User reviews the structured request.
8. User submits the request.
9. UI calls `POST /api/meal-completion`.
10. UI validates the response safely.
11. UI renders the correct `RecommendationOutcome`.
12. User can start over, correct input, inspect why this option, and view read-only handoff messaging where applicable.

## API call requirements

- Use same-origin `/api/meal-completion`.
- Send JSON only.
- Do not include raw address text.
- Do not send tokens, payment data, cart data, order data, or raw provider payloads.
- Validate or safely narrow the response before rendering.
- Handle all HTTP status families:
  - 200 valid planner outcome
  - 400 malformed request response
  - 415 unsupported media response
  - 422 validation/domain response
  - 500 generic safe failure
- Do not expose stack traces or raw technical errors to the user.

## UI state requirements

Support and test:

- initial state
- valid request ready
- submitting/loading state
- success recommendation state
- every non-success planner outcome
- validation error before submission
- API validation error
- API capability failure
- network failure
- retry after failure
- start over
- correct input
- no JavaScript console errors during happy path

## UX constraints

The integrated flow must remain:

- mobile-first
- not chat-first
- one primary recommendation only
- explicit about read-only/demo mode
- clear that no order is placed and no money is spent
- free of cart, checkout, payment, coupon, order, tracking, or autonomous-action affordances
- accessible under WCAG 2.2 AA intent
- keyboard navigable
- screen-reader friendly
- safe in light/dark/reduced-motion modes where existing styling supports them

## Data and privacy constraints

- Do not persist user input beyond current browser session unless already explicitly implemented.
- Do not add analytics in this task.
- Do not add cookies.
- Do not store raw free text server-side.
- Do not log full request or response bodies.
- Do not send any data to an LLM.
- Do not call external networks except the same-origin API route in app runtime.

## Testing requirements

Add tests for at least:

1. Full happy path from meal request to recommendation rendering.
2. Rice + curd request renders one recommendation.
3. Demo address must be explicitly selected before submission.
4. Loading state appears during API call.
5. API 422 renders safe correction copy.
6. API 500 renders safe generic failure.
7. Network failure renders retry option.
8. Start over resets request and outcome.
9. Correct input returns to editable request state.
10. Every planner outcome can be rendered through the integrated flow.
11. No order/add-to-cart/checkout/payment affordances exist.
12. Request body excludes raw address text and commerce fields.
13. Response parsing rejects unsafe/invalid outcome data.
14. Keyboard submission and focus management behave accessibly.
15. Existing unit tests still pass.

Use mocked same-origin fetch where appropriate. Do not hit live services.

## Manual verification

If practical, run the app locally and verify:

- `/` or `/start` launches the flow
- happy path produces a recommendation
- failure states are reachable via test/mocked scenarios or documented fixtures
- no real Swiggy action occurs

Screenshots are optional but useful.

## Documentation

Create `docs/architecture/M0_DEMO_FLOW.md` covering:

- end-to-end flow
- client state machine
- request/response boundary
- API integration
- outcome rendering
- error handling
- accessibility notes
- privacy posture
- demo limitations
- what remains before any live Swiggy MCP integration
- explicit prohibition on commerce actions

## Forbidden scope

Do not implement:

- live Swiggy MCP
- OAuth
- real address retrieval
- real serviceability
- external provider calls
- LLM planning
- carts
- coupons
- checkout
- payment
- order placement
- order tracking
- cancellation
- user accounts
- database persistence
- deployment
- production analytics
- multi-option recommendation feed
- chat UI

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
4. End-to-end state-machine design
5. API integration design
6. Error/failure-state design
7. Accessibility plan
8. Test plan
9. Risks or blockers
10. `Real Swiggy mutation/order planned: NO`

Do not modify files until I reply:

```text
PLAN APPROVED.
```

After approval:

- implement FMD-009 exactly as scoped
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
- integration decisions
- screenshots or manual verification notes
- known gaps
- security/privacy impact
- `Real Swiggy mutation/order executed: NO`
