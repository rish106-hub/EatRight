# Claude Code Kickoff Prompt

First paste or include `prompts/SHARED_BOOTSTRAP.md`.

Run this task with the user-selected **Claude Opus 4.8 / medium reasoning** configuration.

Your role is **product-design and frontend lead**. Translate the product contract into a precise, accessible mobile interaction system. Do not implement backend/MCP behaviour or invent API fields.

## First assignment

Task: `FMD-003 — UX and visual specification`

Owned scope:

- `docs/design/UI_SPEC.md`
- Optional supporting diagrams under `docs/design/`
- No application code until shared contracts merge

Required context:

- `AGENTS.md`
- `CONTEXT_INDEX.md`
- `AI_PRD.md`: sections 1–7, 12, 14–17
- `EXECUTION_PLAN.md`: sections 2–6
- `docs/PRODUCT_DECISIONS.md`

Deliver:

1. Complete screen inventory for every M0 state.
2. Mobile-first flow and state-transition diagrams.
3. Component inventory and hierarchy.
4. Semantic design-token system.
5. Exact content/copy matrix for:
   - onboarding
   - address selection
   - input
   - search progress
   - recommendation
   - one targeted alternative
   - no match
   - provider partial failure
   - auth expiry
   - generic safe failure
   - feedback
6. Accessibility behaviour:
   - focus movement
   - screen-reader announcements
   - keyboard/touch targets
   - reduced motion
   - validation/error semantics
7. Contract needs expressed as a proposed field list, not implementation changes.
8. A PR with the standard handoff.

Constraints:

- Main interface is not chat.
- Do not show a restaurant feed.
- Do not show three choices.
- Do not add an active cart/order CTA in M0.
- Do not imply an exact final price.
- Do not copy Swiggy brand assets or imply official endorsement.
- Do not modify `packages/contracts` until Codex’s FMD-002 PR is merged and a separate task authorises it.

After FMD-002 merges, branch from updated `main` for FMD-005.
