# Finish My Dinner

MCP-native product prototype for completing a partial dinner by procuring the smallest useful complement from Swiggy Food **or** Instamart.

## Current status

- Product: pre-validation
- Active milestone: `M0_READ_ONLY_VALIDATION`
- Allowed Swiggy actions: address lookup and discovery/search only
- Forbidden in the active milestone: cart mutation, checkout, order placement, cancellation, and any real financial action
- Primary deliverable: prove or kill the partial-meal thesis before building commerce risk

## Start here

Humans and coding agents should read, in order:

1. `AGENTS.md`
2. `CONTEXT_INDEX.md`
3. `AI_PRD.md`
4. `EXECUTION_PLAN.md`
5. The task-specific file listed in `CONTEXT_INDEX.md`

Claude Code also reads `CLAUDE.md`. Codex reads `AGENTS.md` automatically.

## Canonical product rule

> Start from food already at home. Return one useful completion. Do not turn the experience into restaurant discovery.

## Repository pack

This starter pack contains the product contract, architecture, source-verified Swiggy MCP notes, agent work protocol, role prompts, research plan, threat model, and initial task board. It intentionally contains no application code yet.

## Swiggy documentation

Authoritative index:

- `https://mcp.swiggy.com/builders/llms.txt`
- `https://mcp.swiggy.com/builders/llms-full.txt`
- Per-page Markdown: append `.md` to a Swiggy Builders Club docs URL

Before implementing any Swiggy tool call, fetch the relevant per-tool page and verify the live `tools/list` schema in the target environment. Never implement from memory or from this repository alone.

## Safety

Live MCP servers can cause real-world effects. Keep `MCP_ENV=stub` and `CAPABILITY_LEVEL=read_only` until the corresponding release gate is approved. No agent may enable ordering or production mutations unilaterally.
# EatRight
