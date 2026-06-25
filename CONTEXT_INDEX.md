# Context Index

Purpose: minimise model context while preserving correctness. Do not load the whole repository for every task.

## Universal load set

Every task starts with:

1. `AGENTS.md`
2. This file
3. The assigned GitHub issue or task brief

Then load only the files below.

| Task type | Required context |
|---|---|
| Product behaviour, scope, acceptance criteria | `AI_PRD.md` |
| Architecture or backend | `AI_PRD.md`, `docs/ARCHITECTURE.md`, `docs/PRODUCT_DECISIONS.md` |
| Swiggy MCP integration | `docs/MCP_CONTRACTS.md` plus the relevant live Swiggy `.md` pages |
| UI or interaction design | `AI_PRD.md` sections `UX-*`, `docs/design/UI_SPEC.md` |
| Security, auth, privacy, permissions | `AI_PRD.md` sections `INV-*`, `SEC-*`; `docs/security/THREAT_MODEL.md`; `docs/MCP_CONTRACTS.md` |
| Research or analytics | `AI_PRD.md` sections `MET-*`; `docs/research/VALIDATION_PLAN.md` |
| CI/CD, GitHub, deployment | `EXECUTION_PLAN.md` sections `GIT-*`, `CI-*`, `DEP-*` |
| Agent coordination | `EXECUTION_PLAN.md` sections `COLLAB-*`; role prompt in `prompts/` |
| New architectural decision | `docs/PRODUCT_DECISIONS.md`, then add an ADR under `docs/adr/` |
| Current work allocation | `docs/TASK_BOARD.md` |

## Context precedence

When two sources disagree:

1. Safety invariants in `AGENTS.md`
2. Active milestone and normative requirements in `AI_PRD.md`
3. Accepted ADRs in `docs/adr/`
4. Live Swiggy `tools/list` schema in the target environment
5. Current per-tool Swiggy reference page
6. Swiggy recipe or overview page
7. Repository implementation
8. Comments, old prompts, and model memory

For Swiggy tool names and parameters, items 4 and 5 outrank this repository.

## Token discipline

- Reference requirement IDs instead of restating their prose.
- Do not paste `llms-full.txt` into routine tasks.
- Fetch one per-tool `.md` page when the tool is known.
- Summarise investigation results in the PR, not in a new permanent document unless they change an invariant or architecture.
- Keep `AGENTS.md` and `CLAUDE.md` short. Put long procedures in task-specific docs.
- Do not duplicate API schemas across files. Canonical internal schemas belong in `packages/contracts` once code exists.
