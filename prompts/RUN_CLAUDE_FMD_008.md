# FMD-008 — Read-Only Recommendation UI

You are the senior product designer and frontend engineer for EatRight.

## Read first

Read these files in order before proposing changes:

1. `CLAUDE.md`
2. `CONTEXT_INDEX.md`
3. `AI_PRD.md`
4. `EXECUTION_PLAN.md`
5. `docs/design/UI_SPEC.md`
6. `docs/architecture/CONTRACTS.md`
7. `docs/architecture/PLANNER.md`
8. `packages/contracts/**`
9. `packages/planner/**`
10. `apps/web/**`

## Objective

Implement the M0 read-only recommendation presentation layer.

The feature receives a runtime-validated `PlannerOutcome` and renders the correct mobile-first, accessible UI for every planner outcome.

This task builds presentation components only. It must not call the API, search providers, modify carts, or place orders. Final wiring to the form and API belongs to FMD-009.

## Owned paths

Primary ownership:

- `apps/web/src/features/recommendation/**`
- recommendation-specific tests under `apps/web/tests/**` or colocated with the feature
- `docs/design/RECOMMENDATION_UI.md` if useful
- `apps/web/package.json` only if strictly required
- `pnpm-lock.yaml` only if strictly required

Do not modify:

- `apps/web/src/app/api/**`
- `apps/web/src/server/**`
- `apps/web/src/features/meal-request/**`
- `packages/contracts/**`
- `packages/providers-stub/**`
- `packages/planner/**`
- `docs/architecture/**`

Do not add a dependency merely for visual convenience. Prefer the current stack and existing design tokens.

## Input boundary

The feature must consume the existing `PlannerOutcome` discriminated union from `@finish-my-dinner/planner`.

Requirements:

- do not duplicate planner outcome enums or domain types
- validate unknown external data with `plannerOutcomeSchema` at the presentation boundary or expose a small parser/helper that does so
- UI components should receive validated typed data
- invalid outcome data must render a safe generic error state rather than throw into the page
- no component may accept raw provider responses

## Required outcome coverage

Render every planner outcome:

1. `RECOMMENDATION_READY`
2. `NO_VALID_COMPLETION`
3. `INSUFFICIENT_INFORMATION`
4. `NO_PURCHASE_REQUIRED`
5. `UNSERVICEABLE`
6. `BOTH_PROVIDERS_FAILED`
7. `STANDARD_SWIGGY_HANDOFF_REQUIRED`

Use the exact actual discriminator names from the package if they differ in spelling.

## Recommendation-ready experience

The successful recommendation must clearly show:

### At home

The components the user said are already available.

### Add

Exactly one recommended missing component.

### Why this completes dinner

A concise explanation based on the planner output.

### Commercial information

- price must always be labelled as an estimate
- ETA must be labelled as an estimate where present
- provider/surface may be shown factually
- do not show a confirmed total
- do not imply checkout, inventory reservation, endorsement, or guaranteed delivery

### Assumptions

Show only assumptions relevant to user trust.

Use natural language. Do not expose technical confidence enum names unless the approved UI specification explicitly requires them.

### Provider status

If one provider failed but the other succeeded, disclose this calmly without making the recommendation look unsafe.

Do not expose stack traces, internal codes, or raw provider messages.

### Score disclosure

Do not show the full numeric scoring model by default.

A secondary expandable “Why this option?” disclosure may show human-readable factors such as meal fit, budget fit, and ETA fit. Avoid algorithm theatre and false precision.

## Required interactions

The component should expose callbacks rather than perform navigation or API work.

At minimum:

- `onStartOver`
- `onCorrectInput`
- optional `onViewWhy`
- optional `onStandardSwiggyHandoff` for the handoff outcome

The FMD-008 components must not:

- fetch
- submit forms
- call route handlers
- open MCP connections
- mutate a cart
- place an order

For recommendation-ready, the primary next action in M0 should be a read-only action such as reviewing/correcting the input or ending the demo. Do not add “Order,” “Add to cart,” “Checkout,” or equivalent commerce CTAs.

## Visual and interaction requirements

- mobile-first and responsive
- consistent with the approved UI specification and existing app shell
- not chat-first
- one primary recommendation only
- “At home” and “Add” must be distinguishable without relying on colour alone
- visible focus states
- minimum 44×44 touch targets
- screen-reader-friendly headings and landmarks
- accessible disclosure controls
- status changes announced appropriately
- reduced-motion support
- light/dark compatibility where existing tokens support it
- no layout shift when optional fields are absent
- long dish and merchant names must wrap safely
- estimated values must remain clearly estimated
- no guilt, health, or waste-shaming language

## Failure and empty-state copy

Map stable planner reason codes to concise user-facing copy.

UI owns the copy. Do not render planner internals verbatim when they are technical.

Required state intent:

- `NO_VALID_COMPLETION`: no suitable complement met the current constraints
- `INSUFFICIENT_INFORMATION`: ask the user to correct or add enough meal information
- `NO_PURCHASE_REQUIRED`: acknowledge that the existing food appears sufficient
- `UNSERVICEABLE`: explain that the selected demo address is unavailable in this scenario
- `BOTH_PROVIDERS_FAILED`: explain that the demo could not check either source right now
- `STANDARD_SWIGGY_HANDOFF_REQUIRED`: explain that the user appears to need a full meal rather than a complement

Copy must not claim real Swiggy availability or real serviceability in M0.

## Components

Use a maintainable component hierarchy. A likely structure is:

- `RecommendationOutcome`
- `RecommendationCard`
- `AtHomeSection`
- `AddSection`
- `EstimateSummary`
- `AssumptionList`
- `ProviderStatus`
- `WhyThisOptionDisclosure`
- `OutcomeMessage`
- `RecommendationActions`

This is guidance, not a mandatory filename list.

Avoid one giant monolithic component.

## Development preview

Provide a safe way for tests or local development to render every outcome.

Options include:

- typed fixture exports under the feature
- a test-only fixture factory
- a development-only preview component

Do not create a publicly exposed production route solely for fixtures unless the existing repository conventions support it and the route is gated from production builds.

Fixtures must validate against `plannerOutcomeSchema`.

## Required tests

Add tests for at least:

1. A valid recommendation renders one and only one primary recommendation.
2. “At home” and “Add” are both present and semantically distinct.
3. Estimated price is labelled “Estimated” or equivalent.
4. ETA is labelled as estimated when present.
5. No confirmed total is shown.
6. Assumptions render only when supplied.
7. One-provider failure is disclosed safely.
8. “Why this option?” disclosure is keyboard accessible.
9. `NO_VALID_COMPLETION` renders the correct recovery action.
10. `INSUFFICIENT_INFORMATION` renders a correction action.
11. `NO_PURCHASE_REQUIRED` contains no purchase CTA.
12. `UNSERVICEABLE` does not imply real serviceability.
13. `BOTH_PROVIDERS_FAILED` exposes no internal error text.
14. `STANDARD_SWIGGY_HANDOFF_REQUIRED` exposes the optional handoff callback without performing navigation.
15. Invalid outcome data renders a safe fallback.
16. No cart, checkout, payment, coupon, order, tracking, or autonomous-action affordance exists.
17. Long content wraps without inaccessible truncation where practical.
18. Accessible names, headings, focus order, and live/status semantics are present.
19. Components use planner types rather than duplicated enums.
20. All typed fixtures validate with `plannerOutcomeSchema`.

## Forbidden scope

Do not implement:

- API calls
- route handlers
- server code
- provider search
- live Swiggy MCP
- OAuth
- address retrieval
- cart
- coupons
- checkout
- payment
- ordering
- tracking
- cancellation
- autonomous actions
- generic marketplace feed
- multi-option recommendation carousel
- chat UI
- health or allergen-safety claims
- final form-to-result integration
- deployment

## Required checks

Run and pass all relevant repository checks, including:

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
3. Proposed files and component hierarchy
4. Outcome-to-UI mapping
5. Interaction/callback design
6. Accessibility plan
7. Fixture/preview approach
8. Test plan
9. Risks or blockers
10. `Real Swiggy mutation/order planned: NO`

Do not modify files until I reply:

```text
PLAN APPROVED.
```

After approval:

- implement FMD-008 exactly as scoped
- run the complete validation suite
- inspect the complete diff
- confirm no API, live MCP, or commerce capability was introduced
- commit focused changes
- push only the current branch
- open a pull request against `main`
- do not merge the pull request

The final report must include:

- commit hash
- pull-request URL
- files changed
- tests executed
- screenshots or visual verification
- UI decisions
- known gaps
- accessibility impact
- `Real Swiggy mutation/order executed: NO`
