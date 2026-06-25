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

This repository contains the product contract, architecture, source-verified Swiggy MCP notes, agent work protocol, role prompts, research plan, threat model, initial task board, and bootstrap application shell.

## Bootstrap commands

FMD-001 adds a pnpm TypeScript workspace and a minimal Next.js shell under `apps/web`.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm --filter @finish-my-dinner/web dev
```

Default local runtime is safe:

```text
APP_ENV=local
MCP_ENV=stub
CAPABILITY_LEVEL=read_only
ALLOW_REAL_SWIGGY_MUTATIONS=false
ALLOW_REAL_SWIGGY_ORDERS=false
```

`pnpm check` runs formatting, lint, typecheck, unit tests, and build. Preview CI is configured for `MCP_ENV=stub` and read-only capability only.

## Swiggy documentation

Authoritative index:

- `https://mcp.swiggy.com/builders/llms.txt`
- `https://mcp.swiggy.com/builders/llms-full.txt`
- Per-page Markdown: append `.md` to a Swiggy Builders Club docs URL

Before implementing any Swiggy tool call, fetch the relevant per-tool page and verify the live `tools/list` schema in the target environment. Never implement from memory or from this repository alone.

## Safety

Live MCP servers can cause real-world effects. Keep `MCP_ENV=stub` and `CAPABILITY_LEVEL=read_only` until the corresponding release gate is approved. No agent may enable ordering or production mutations unilaterally.
# EatRight
