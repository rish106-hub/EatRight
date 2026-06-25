# Initial Task Board

After GitHub setup, GitHub Issues/Projects become the live source of truth. This file seeds the backlog.

| ID | Owner | Depends on | Status | Deliverable |
|---|---|---|---|---|
| FMD-001 | Codex | — | Ready | Repo, build tooling, CI, safe env |
| FMD-002 | Codex | FMD-001 | Blocked | Shared contracts |
| FMD-003 | Claude | — | Ready | UX and visual specification |
| FMD-004 | Codex | FMD-002 | Blocked | MCP stub and fixtures |
| FMD-005 | Claude | FMD-002, FMD-003 | Blocked | Onboarding/address/home-state UI |
| FMD-006 | Codex | FMD-002, FMD-004 | Blocked | Ontology, planner, ranking |
| FMD-007 | Codex | FMD-004, FMD-006 | Blocked | Read-only API orchestration |
| FMD-008 | Claude | FMD-002, FMD-003 | Blocked | Recommendation/feedback UI |
| FMD-009 | Joint | FMD-005, FMD-007, FMD-008 | Blocked | End-to-end integration |
| FMD-010 | Codex | FMD-009 | Blocked | Telemetry/privacy pipeline |
| FMD-011 | Claude | FMD-009 | Blocked | Validation study UX |
| FMD-012 | Joint | FMD-010, FMD-011 | Blocked | Gate report |
| FMD-013 | Codex | M0 GO + access | Deferred | Staging schema verification |
| FMD-014 | Codex | FMD-013 | Deferred | OAuth and token storage |
| FMD-015 | Claude | FMD-014 | Deferred | Staging UX |
| FMD-016 | Joint | FMD-013-015 | Deferred | Staging E2E |

## Task rule

Each active issue must specify:

- Canonical requirement IDs
- Owned file paths
- Dependencies
- Acceptance tests
- Explicit exclusions
- Security/privacy impact
- Whether Swiggy staging is required
- Whether real-world mutation is possible; for M0 the answer is always `NO`
