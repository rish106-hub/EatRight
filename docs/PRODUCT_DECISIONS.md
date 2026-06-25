# Product and Architecture Decisions

Status legend: `ACCEPTED`, `PROVISIONAL`, `DEFERRED`, `REJECTED`.

| ID | Status | Decision |
|---|---|---|
| DEC-001 | ACCEPTED | The active build is read-only validation. |
| DEC-002 | ACCEPTED | Start from home food, not marketplace discovery. |
| DEC-003 | ACCEPTED | Return one primary recommendation. |
| DEC-004 | ACCEPTED | Search Food and Instamart, but select one surface. |
| DEC-005 | ACCEPTED | Main interaction is chip-first guided UI, not chat-first. |
| DEC-006 | ACCEPTED | Runtime LLM is advisory and cannot call financial tools. |
| DEC-007 | ACCEPTED | Swiggy MCP calls are server-side. |
| DEC-008 | ACCEPTED | Use deterministic local stub before staging. |
| DEC-009 | ACCEPTED | Contract-first monorepo enables Claude/Codex parallelism. |
| DEC-010 | ACCEPTED | Existing cart and live tool schema are authoritative in future phases. |
| DEC-011 | ACCEPTED | No dual-surface checkout until atomicity/recovery policy exists. |
| DEC-012 | PROVISIONAL | Next.js full-stack TypeScript monorepo is the default implementation. |
| DEC-013 | PROVISIONAL | PostgreSQL + Drizzle for sessions and study data. |
| DEC-014 | PROVISIONAL | One targeted alternative after rejection. |
| DEC-015 | DEFERRED | Runtime model provider and model name. |
| DEC-016 | DEFERRED | Photo input. |
| DEC-017 | DEFERRED | Personalised use of order history / `your_go_to_items`. |
| DEC-018 | DEFERRED | Native mobile app. |
| DEC-019 | REJECTED | Generic AI food recommender. |
| DEC-020 | REJECTED | Top-three recommendation feed. |
| DEC-021 | REJECTED | Autonomous ordering or standing spend permission. |
| DEC-022 | REJECTED | Pantry cataloguing as onboarding. |
| DEC-023 | REJECTED | Implementing checkout before problem validation. |

## Decision change process

A decision changes only through:

1. An ADR under `docs/adr/`.
2. Evidence or constraint.
3. Impact on requirements and tests.
4. Human approval.
5. Updates to the canonical files.

Chat messages and agent memory do not override accepted decisions.
