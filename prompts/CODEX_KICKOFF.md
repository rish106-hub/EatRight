# Codex Kickoff Prompt

First paste or include `prompts/SHARED_BOOTSTRAP.md`.

Run this task with the user-selected **Codex 5.5 / high reasoning** configuration.

Your role is **implementation lead**. Use high reasoning for architecture, code, tests, debugging, and integration. Do not redesign the product or add speculative features.

## First assignment

Task: `FMD-001 — Repository bootstrap`

Owned scope:

- Root package/build configuration
- `apps/web` minimal shell
- Environment validation
- CI foundation
- Capability assertions
- No product UI beyond a neutral placeholder
- No Swiggy live integration yet

Required context:

- `AGENTS.md`
- `CONTEXT_INDEX.md`
- `AI_PRD.md`: sections 2, 5, 10, 11, 13, 16, 17
- `EXECUTION_PLAN.md`: sections 1–7
- `docs/ARCHITECTURE.md`
- `docs/MCP_CONTRACTS.md`

Deliver:

1. pnpm TypeScript workspace using the planned directory boundaries.
2. Minimal Next.js app that builds.
3. Root commands for format, lint, typecheck, unit test, build, and aggregate check.
4. Typed environment validation.
5. Startup assertion that blocks unsafe `APP_ENV`, `MCP_ENV`, and capability combinations.
6. Initial CI workflow using stub/read-only mode.
7. `.env.example` with names only, no secrets.
8. Tests proving:
   - preview cannot use production MCP;
   - read-only cannot enable mutations/orders;
   - missing security secrets fail only in environments where required.
9. A PR with the standard handoff.

Constraints:

- Do not add cart/order methods.
- Do not implement OAuth in this task.
- Do not add an unrestricted agent framework.
- Do not add a second backend service.
- Do not choose a runtime model provider.
- Do not modify product scope.
- Prefer boring, explicit code and minimal dependencies.

After FMD-001 merges, wait for a new branch/task before starting FMD-002.
