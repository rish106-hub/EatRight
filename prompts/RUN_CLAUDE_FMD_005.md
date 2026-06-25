# FMD-005 — M0 Onboarding and Home-State Input UI

You are the senior product designer and frontend engineer for EatRight.

Read first:

1. CLAUDE.md
2. CONTEXT_INDEX.md
3. AI_PRD.md
4. EXECUTION_PLAN.md
5. docs/design/UI_SPEC.md
6. docs/architecture/CONTRACTS.md
7. packages/contracts public API
8. existing apps/web implementation

## Objective

Implement the mobile-first M0 onboarding and home-food input experience defined in the approved UX specification.

This task ends when a valid read-only meal-completion request is constructed locally. It does not search providers, show a recommendation, build a cart, or place an order.

## Owned paths

Primary ownership:

- apps/web/**
- tests colocated within apps/web/**
- apps/web/package.json only if required
- pnpm-lock.yaml only if dependency wiring requires it

Do not modify:

- packages/contracts/**
- packages/providers-stub/**
- backend/provider architecture
- docs/architecture/**

Do not introduce new third-party UI libraries unless strictly necessary. Prefer the existing stack.

## Required experience

Implement:

1. Product introduction
2. Clear read-only agent boundary
3. Home-food component selection
4. Serving count
5. Vegetarian/non-vegetarian preference
6. Hard exclusions
7. Budget control
8. Maximum ETA control
9. Input validation
10. Assumption/ambiguity handling
11. Review of the structured request before submission
12. Local success state confirming the request is ready for provider search

Required home-state options include:

- Rice
- Rotis
- Dal / curry
- Sabzi
- Eggs
- Bread
- Curd / raita
- Leftovers, not enough
- Other

## Product constraints

The interface must:

- be mobile-first and responsive
- not be chat-first
- show one task per screen or clear section
- use exact or semantically equivalent copy from UI_SPEC
- satisfy WCAG 2.2 AA intent
- support keyboard navigation
- use visible focus states
- use 44×44 minimum touch targets
- not rely on colour alone
- announce validation and state changes accessibly
- support reduced motion
- work in light and dark system modes where supported
- use the shared contracts as the source of truth
- emit a valid structured request on completion

## Explicitly forbidden

Do not implement:

- live Swiggy login
- OAuth
- live MCP calls
- Food or Instamart search
- recommendation results
- restaurant feeds
- chat UI
- cart
- coupon
- checkout
- payment
- ordering
- order tracking
- autonomous agent actions
- health or allergy-safety claims

The interface must visibly state that M0 does not order or spend money.

## Testing

Add tests using the existing repository test approach for:

- required-field validation
- chip selection and deselection
- serving selection
- dietary preference
- budget and ETA validation
- keyboard interaction
- accessible labels
- final structured request matching contracts
- no cart/order/payment affordances
- mobile layout smoke test where practical

Run the complete repository validation suite.

## Deliverable quality

- production-quality component structure
- no giant monolithic component
- clear separation of form state and presentation
- no duplicated contract enums
- no unsafe `any`
- no hardcoded mock recommendation
- no unrelated redesign
- no secrets

## Execution protocol

First respond only with:

1. Current branch/worktree
2. Files inspected
3. Proposed component hierarchy
4. Proposed files
5. State-management approach
6. Accessibility plan
7. Test plan
8. Risks/blockers
9. `Real Swiggy mutation/order planned: NO`

Wait for:

PLAN APPROVED.

After approval:

- implement
- run all relevant checks
- self-review the complete diff
- commit focused changes
- push only this branch
- open a PR against main
- do not merge

Final report must include commit, PR URL, screenshots or visual verification, tests, known gaps, and:

`Real Swiggy mutation/order executed: NO`
