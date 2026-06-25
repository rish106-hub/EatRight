# FMD-002 — Shared Contracts, Ontology, and Read-Only Interfaces

You are the staff platform engineer for EatRight.

Read first, in this order:

1. AGENTS.md
2. CONTEXT_INDEX.md
3. AI_PRD.md
4. EXECUTION_PLAN.md
5. docs/design/UI_SPEC.md
6. README.md

## Objective

Create the frozen, provider-neutral TypeScript contracts required for the M0 read-only validation product.

This task defines shared language between frontend, planner, API, and future Swiggy MCP adapters. It must not implement live commerce.

## Deliverables

### 1. Shared contracts package

Implement or complete `packages/contracts` with a stable public API covering:

- Home-food component ontology
- Missing-component ontology
- Meal-completion intent
- User constraints:
  - servings
  - vegetarian/non-vegetarian preference
  - exclusions
  - budget
  - maximum ETA
- Product/session states
- Candidate source: Food or Instamart
- Normalised candidate schema
- Meal-completion recommendation schema
- Assumption schema
- Recommendation explanation schema
- Search-result and no-match states
- Partial-provider-failure states
- Structured domain errors
- Read-only capability declaration
- Analytics event names and safe event payloads

### 2. Required ontology values

At minimum support:

- BASE_RICE
- BASE_ROTI
- BASE_BREAD
- MAIN_DAL
- MAIN_CURRY
- MAIN_PROTEIN
- SIDE_VEGETABLE
- SIDE_CURD
- LEFTOVER_MAIN
- LEFTOVER_SMALL
- BASIC_STAPLES
- NOTHING_USEFUL
- UNKNOWN

Missing-component types:

- NEED_BASE
- NEED_MAIN
- NEED_PROTEIN
- NEED_SIDE
- NEED_VOLUME
- NEED_COMPLETE_MEAL
- INSUFFICIENT_INFORMATION

### 3. Read-only provider interfaces

Define provider-neutral interfaces for:

- address/serviceability context
- Food candidate search
- Instamart candidate search
- candidate normalisation
- provider health/failure state

These are interfaces only. No OAuth, live HTTP transport, cart mutation, checkout, payment, or ordering.

### 4. Runtime validation

Use the repository’s existing validation approach. Prefer strict runtime schemas with inferred TypeScript types.

Requirements:

- Reject unknown enum values
- Reject negative prices and ETA values
- Distinguish estimated price from confirmed price
- Do not permit confirmed checkout totals in M0 recommendation contracts
- Do not expose payment or order fields in read-only contracts
- Analytics payloads must reject full addresses, tokens, payment data, and raw free text

### 5. Fixtures and tests

Add representative fixtures and tests for:

- rice + curd → NEED_MAIN
- dal → NEED_BASE
- insufficient biryani → NEED_VOLUME
- Food-only result
- Instamart-only result
- both-provider result
- one-provider failure
- both-provider failure
- no valid completion
- invalid budget
- unsafe analytics payload
- estimated-price labelling

### 6. Documentation

Create `docs/architecture/CONTRACTS.md` documenting:

- package boundaries
- canonical terminology
- contract ownership
- compatibility/versioning rules
- how Claude-owned UI consumes these contracts
- how future MCP adapters map into them
- fields deliberately excluded from M0

## Swiggy documentation rule

You may inspect:

https://mcp.swiggy.com/builders/llms.txt

Use it only to locate canonical documentation pages.

Do not:

- connect to production Swiggy MCP
- use user credentials
- execute MCP tools
- hard-code undocumented request/response fields
- invent endpoint schemas

When exact Swiggy fields are not verified, keep the shared contract provider-neutral and document the future mapping boundary.

## Forbidden scope

Do not implement:

- application screens
- UX redesign
- OAuth
- live Swiggy clients
- carts
- checkout
- payments
- order placement
- order tracking
- dual-surface transactions
- autonomous agent actions
- database persistence
- deployment

## Acceptance criteria

All must pass:

- pnpm format:check
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build
- pnpm check
- pnpm assert:capabilities

Additional requirements:

- no secrets
- no live MCP calls
- no mutation/order capability
- package exports are documented
- tests cover both valid and invalid schemas
- existing FMD-001 and FMD-003 work remains intact

## Execution protocol

First respond with only:

1. Current branch and worktree
2. Files you intend to inspect
3. Proposed files to create or modify
4. Contract design
5. Test plan
6. Risks or blockers
7. Explicit confirmation that no live Swiggy action will occur

Do not modify files until I reply:

PLAN APPROVED.

After approval:

- implement the task
- run all required checks
- self-review the complete diff
- commit focused changes
- push only the current branch
- open a PR against main
- do not merge it

The final report must include:

- commit hash
- PR URL
- files changed
- tests executed
- contract decisions
- known gaps
- `Real Swiggy mutation/order executed: NO`
