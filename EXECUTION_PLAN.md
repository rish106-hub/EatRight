---
id: FMD-EXECUTION-PLAN
version: 0.2
status: proposed
last_updated: 2026-06-25
active_milestone: M0_READ_ONLY_VALIDATION
---

# Finish My Dinner — AI-Native Execution Plan

## 0. Outcome

Create one GitHub repository in which Codex and Claude Code work as separate engineers against shared contracts, without editing the same implementation surfaces in parallel.

The first shipped artifact is a **read-only validation PWA**, not an ordering agent.

---

## 1. Resolved implementation decisions

| ID | Decision | Rationale |
|---|---|---|
| EXE-001 | Use one TypeScript monorepo. | Shared types reduce integration drift between AI agents. |
| EXE-002 | Use a mobile-first Next.js PWA as the application shell. | One deployable web product supports responsive UI, server routes, OAuth callback, and previews. |
| EXE-003 | Keep Swiggy MCP calls server-side. | Protect tokens and enforce policy outside the model/browser. |
| EXE-004 | Use pnpm workspaces; add Turborepo only if build graph warrants it. | Fewer moving pieces at bootstrap; easy parallel package ownership. |
| EXE-005 | Use Zod-backed contracts and discriminated unions. | Runtime validation is required for model/tool boundaries. |
| EXE-006 | Use a pure TypeScript domain package. | Ranking, ontology, and state transitions stay deterministic and testable. |
| EXE-007 | Implement a raw controlled MCP adapter, not unrestricted model tool access. | The product needs strict allowlists and future financial containment. |
| EXE-008 | Introduce a `PlannerPort` with deterministic and LLM implementations. | Runtime model choice remains replaceable and P0 survives model outage. |
| EXE-009 | Build a deterministic local Swiggy stub before staging integration. | Swiggy recommends local build first; both agents need stable fixtures. |
| EXE-010 | Use Postgres for server-side session, encrypted connection metadata, and study events. | Supports multi-user OAuth and auditability without browser token storage. |
| EXE-011 | Default deployment: GitHub + preview hosting for the web app + managed Postgres. | Fast PR previews; exact vendor remains replaceable. |
| EXE-012 | `main` stays protected; agents use short-lived branches and worktrees. | Prevents cross-agent file collision and unsafe direct deploys. |
| EXE-013 | No `develop` branch. | Trunk-based integration with preview deployments is simpler for two agents. |
| EXE-014 | Merge contracts before parallel UI/backend work. | Both agents build against one frozen boundary. |
| EXE-015 | Production ordering requires a separate capability milestone and environment approval. | Prevents accidental real-world actions. |
| EXE-016 | GitHub is the source-control/CI control plane, not the application runtime. | GitHub Pages cannot safely host the server-side OAuth, token storage, database, and MCP policy layer. |

### Default stack

Versions are pinned by the bootstrap task after compatibility verification.

```text
Language:        TypeScript
Runtime:         Node.js LTS
Package manager: pnpm
Web/BFF:         Next.js App Router
UI:              React + accessible headless primitives + CSS variables
Validation:      Zod
Database:        PostgreSQL
ORM/migrations:  Drizzle ORM
Tests:           Vitest, Testing Library, Playwright
Observability:   OpenTelemetry-compatible traces + structured logs
Formatting/lint: ESLint + Prettier
CI/CD:           GitHub Actions
Deployment:      Preview/staging first; production environment protected
```

Do not introduce a second backend service in M0 unless serverless/runtime constraints are demonstrated. The domain and MCP packages are already separable if extraction becomes necessary.

---

## 2. Repository layout

```text
finish-my-dinner/
├── AGENTS.md
├── CLAUDE.md
├── CONTEXT_INDEX.md
├── AI_PRD.md
├── EXECUTION_PLAN.md
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .env.example
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (product)/
│       │   │   ├── api/
│       │   │   └── auth/
│       │   ├── components/
│       │   └── lib/
│       ├── public/
│       └── tests/
├── packages/
│   ├── contracts/        # shared request/response schemas; serialized ownership
│   ├── domain/           # ontology, state machine, ranking, reason codes
│   ├── mcp/              # transport, auth adapters, Swiggy clients
│   ├── mcp-stub/         # seeded deterministic fake server/adapter
│   ├── planner/          # PlannerPort, deterministic planner, optional LLM adapter
│   ├── persistence/      # DB schema and repositories
│   ├── telemetry/        # events, logs, trace helpers, redaction
│   ├── ui/               # shared visual primitives and product components
│   └── test-fixtures/    # cross-package fixtures that conform to contracts
├── docs/
│   ├── ARCHITECTURE.md
│   ├── MCP_CONTRACTS.md
│   ├── PRODUCT_DECISIONS.md
│   ├── TASK_BOARD.md
│   ├── adr/
│   ├── design/
│   ├── research/
│   └── security/
├── prompts/
│   ├── SHARED_BOOTSTRAP.md
│   ├── CLAUDE_KICKOFF.md
│   └── CODEX_KICKOFF.md
├── scripts/
│   ├── verify-mcp-docs.ts
│   ├── snapshot-mcp-tools.ts
│   └── assert-capabilities.ts
├── tests/
│   ├── contract/
│   ├── e2e/
│   ├── security/
│   └── evaluation/
└── .github/
    ├── CODEOWNERS
    ├── pull_request_template.md
    └── workflows/
        ├── ci.yml
        ├── e2e.yml
        ├── security.yml
        ├── mcp-drift.yml
        ├── deploy-preview.yml
        ├── deploy-staging.yml
        └── deploy-production.yml
```

### Package dependency direction

```text
contracts  <- domain <- planner
    ^           ^         ^
    |           |         |
    +------ mcp adapters -+
    |
persistence / telemetry

apps/web -> contracts, domain, planner, mcp, persistence, telemetry, ui
```

Rules:

- `ui` may depend on `contracts`, never on `mcp`.
- `domain` does not import framework, database, network, or UI code.
- `mcp` does not import React or product screens.
- `planner` cannot invoke cart/order methods.
- `apps/web` composes packages and owns route wiring.

---

## 3. Build-agent configuration

User-selected agents:

| Agent | Configuration | Primary use |
|---|---|---|
| Codex | Codex 5.5, high reasoning | Heavy implementation, architecture, tests, debugging, CI, MCP integration |
| Claude Code | Claude Opus 4.8, medium reasoning | Product design, frontend implementation, content, accessibility, visual QA |

These are **build agents**, not the runtime model used by the product. Runtime inference remains behind `PlannerPort` and is separately selected.

## 3. Collaboration model

### COLLAB-001 — Role split

#### Codex: implementation lead

Primary work:

- Bootstrap monorepo and CI.
- Define shared contracts with product IDs.
- Implement domain ontology/state machine/ranking.
- Implement stub and Swiggy MCP adapters.
- Implement OAuth server flow and token protection.
- Implement API routes, persistence, telemetry, and test infrastructure.
- Debug integration and own contract/e2e reliability.
- Review Claude’s integration for schema and state correctness.

#### Claude: product/design frontend lead

Primary work:

- Convert product flow into interaction specification.
- Define mobile information architecture and design tokens.
- Build accessible screens/components against fixtures.
- Implement all empty/loading/error/uncertainty states.
- Write content and responsive/accessibility tests.
- Maintain Storybook or equivalent isolated component surface if adopted.
- Review Codex’s API surface for product clarity and missing UI states.

### COLLAB-002 — Contract-first sequence

1. Codex opens `FMD-002` with `packages/contracts`.
2. Human reviews product shape.
3. Contract PR merges.
4. Claude and Codex branch from the same new `main`.
5. Claude builds UI using `packages/test-fixtures`.
6. Codex implements server routes returning the same schemas.
7. Integration task replaces fixtures at one seam.
8. No agent independently changes shared schemas while dependent branches are open.

### COLLAB-003 — File ownership

| Path | Default owner |
|---|---|
| `packages/contracts/**` | Codex; human approval; serialized |
| `packages/domain/**` | Codex |
| `packages/mcp/**` | Codex |
| `packages/mcp-stub/**` | Codex |
| `packages/planner/**` | Codex |
| `packages/persistence/**` | Codex |
| `packages/telemetry/**` | Codex |
| `apps/web/src/app/api/**` | Codex |
| `packages/ui/**` | Claude |
| `apps/web/src/app/(product)/**` | Claude |
| `apps/web/src/components/**` | Claude |
| `docs/design/**` | Claude |
| `tests/contract/**` | Codex |
| `tests/e2e/**` | Joint by explicit task |
| Root config and workflows | Codex; serialized |
| Product/architecture docs | Explicit task only |

### COLLAB-004 — Handoff packet

Every PR description includes:

```text
Task:
Requirement IDs:
Owned files:
Public contract changed?:
Database/schema changed?:
Security/privacy impact:
Tests:
Screenshots:
Known gaps:
Next integration action:
Real Swiggy mutation/order executed: NO
```

### COLLAB-005 — Conflict protocol

When agents need the same file:

1. Stop one side.
2. Merge the smaller upstream contract/config change.
3. Rebase the second branch.
4. Resume from the updated interface.
5. Do not resolve semantic conflicts by accepting both versions.

---

## 4. Git and GitHub workflow

### GIT-001 — Branch protection

Protect `main` with:

- Pull request required.
- At least one human approval for security, auth, MCP, capability, or deployment changes.
- Required status checks.
- Branch must be up to date before merge.
- No force pushes.
- No branch deletion protection exemption for agents.
- Signed commits optional; recommended for humans.
- Linear history recommended.

### GIT-002 — Branch naming

```text
codex/FMD-001-repo-bootstrap
claude/FMD-003-ui-spec
human/FMD-000-product-decision
```

### GIT-003 — Worktrees

Example after repository initialization:

```bash
git switch main
git pull --ff-only

git worktree add ../fmd-codex -b codex/FMD-001-repo-bootstrap main
git worktree add ../fmd-claude -b claude/FMD-003-ui-spec main
```

After a task merges:

```bash
git worktree remove ../fmd-codex
git branch -d codex/FMD-001-repo-bootstrap
```

Do not run both agents in the same working directory.

### GIT-004 — Commit policy

- One concern per commit.
- Do not commit generated secrets, `.env`, OAuth tokens, user data, or MCP payload dumps.
- Commit lockfiles.
- Keep generated contract snapshots only when redacted and explicitly designed for source control.
- Use conventional commit prefixes.
- Reference task ID in PR title.

### GIT-005 — Merge policy

- Squash merge product/UI tasks.
- Preserve commits only when migrations or staged refactors materially benefit from history.
- Capability changes require explicit human merge.
- Production deployment never occurs merely because an agent merged a PR.

---

## 5. Environment and capability model

### ENV-001 — Required environment variables

Initial shape:

```text
APP_ENV=local|preview|staging|production
MCP_ENV=stub|staging|production
CAPABILITY_LEVEL=read_only|cart_only|single_order
ALLOW_REAL_SWIGGY_MUTATIONS=false
ALLOW_REAL_SWIGGY_ORDERS=false

DATABASE_URL=
SESSION_SECRET=
TOKEN_ENCRYPTION_KEY=

SWIGGY_FOOD_MCP_URL=
SWIGGY_INSTAMART_MCP_URL=
SWIGGY_OAUTH_BASE_URL=
SWIGGY_REDIRECT_URI=

RUNTIME_MODEL_PROVIDER=deterministic|anthropic|openai
RUNTIME_MODEL_NAME=
RUNTIME_MODEL_REGION=
```

Never commit values.

### ENV-002 — Capability matrix

| Environment | MCP | Maximum capability |
|---|---|---|
| Local | Stub | Read-only by default |
| PR preview | Stub | Read-only |
| Staging | Swiggy staging | Current approved milestone |
| Production | Swiggy production | Explicit protected-environment approval |

### ENV-003 — Double lock

A real mutation requires both:

1. Code-level policy allows the exact tool for the approved milestone.
2. Protected environment variable enables the capability.

Ordering additionally requires an approved GitHub production environment and human reviewer.

### ENV-004 — Startup assertion

The application MUST refuse to boot when:

- `MCP_ENV=production` and `APP_ENV!=production`.
- `ALLOW_REAL_SWIGGY_ORDERS=true` while `CAPABILITY_LEVEL!=single_order`.
- A preview environment points to production MCP.
- Required token encryption or session secret is absent.
- Read-only milestone includes mutation tools in the allowlist.

---

## 6. Milestone plan

## PHASE-A — Repository and contracts

### FMD-001 — Repository bootstrap — Codex

Deliver:

- pnpm workspace
- TypeScript base config
- lint/format/typecheck/test/build scripts
- minimal Next.js app
- environment validation
- GitHub CI
- initial README integration

Acceptance:

- Clean install and build.
- `pnpm check` runs format check, lint, typecheck, unit tests, and build.
- Preview configuration uses stub only.
- Capability assertion fails unsafe configurations.

### FMD-002 — Shared contracts — Codex

Deliver:

- Zod schemas for `CompletionRequest`, `Candidate`, `Recommendation`, `PublicError`, feedback, and safe session state
- API route contracts
- fixture factory interfaces
- schema tests

Acceptance:

- UI can consume contracts without MCP knowledge.
- External IDs are server-safe.
- All model/tool outputs require validation.

### FMD-003 — UX and visual specification — Claude

Deliver:

- `docs/design/UI_SPEC.md`
- Screen inventory and transitions
- Design tokens
- Mobile wireframes in structured Markdown/Mermaid or project design format
- Copy matrix
- Accessibility checklist

Acceptance:

- Every M0 state has a designed screen.
- No cart/checkout affordance appears as active.
- Recommendation makes `At home` versus `Add` obvious.

Merge order: FMD-001 → FMD-002. FMD-003 may begin from docs but implementation waits for FMD-002.

---

## PHASE-B — Deterministic product core

### FMD-004 — MCP stub and fixtures — Codex

Deliver:

- Seeded addresses
- Food and Instamart search fixtures
- Failure/latency/schema-drift modes
- Deterministic adapter implementing the same port as live MCP
- No mutation methods in the M0 port

Acceptance:

- All primary meal examples have positive and no-match fixtures.
- Fault injection covers auth, timeout, provider partial failure, malformed output.

### FMD-005 — Home-state and onboarding UI — Claude

Deliver:

- Connection explanation
- Stub-mode/test identity state
- Address picker
- Chip-first home-state form
- Constraints
- Responsive and accessibility tests

Acceptance:

- Common state completes in ≤3 taps.
- User chooses address explicitly.
- No generic chat-first entry.

### FMD-006 — Domain planner and ranking — Codex

Deliver:

- Ontology
- one-clarification state
- query planner
- hard filters
- configurable scoring
- reason codes
- deterministic explanations
- evaluation fixtures

Acceptance:

- Product acceptance tests `AT-001` through `AT-010`.
- Ranking output is reproducible.
- No hidden chain-of-thought storage.

---

## PHASE-C — End-to-end read-only PWA

### FMD-007 — Read-only API orchestration — Codex

Deliver:

- `/api/addresses`
- `/api/completions`
- `/api/recommendations/:id/feedback`
- session and trace handling
- parallel provider search
- partial failure recovery
- redacted logs

Acceptance:

- API returns only contract-validated responses.
- Food and Instamart are independently bounded.
- No M0 route can reach a mutation tool.

### FMD-008 — Recommendation and feedback UI — Claude

Deliver:

- Search progress
- recommendation card
- assumption correction
- no-match state
- one targeted alternative
- feedback capture
- provider-partial and auth-error states

Acceptance:

- All UX tests `AT-201` to `AT-207`.
- Screen reader and keyboard flow work.
- Item price is clearly estimated.

### FMD-009 — Integration — Joint, Codex primary

Deliver:

- Replace fixture seam with real API client.
- Resolve contract gaps via one serialized PR.
- E2E flow against stub.
- Screenshots and trace verification.

Acceptance:

- Entire M0 flow passes Playwright.
- No network request from browser reaches Swiggy.
- No secret appears in browser or logs.

---

## PHASE-D — Research and telemetry readiness

### FMD-010 — Event pipeline and privacy controls — Codex

Deliver:

- event schemas
- consent handling
- retention jobs/config
- redaction tests
- study export with anonymous IDs

### FMD-011 — Validation study surface — Claude

Deliver:

- consent copy
- post-recommendation fit question
- rejection reasons
- study completion state
- researcher usability notes

### FMD-012 — Validation dashboard/report — Joint

Deliver:

- metrics query or notebook
- gate report template
- segment cuts
- no raw PII

Gate outcome:

- `GO`: proceed to staging/cart planning.
- `ITERATE`: change ontology/input/ranking and rerun.
- `KILL`: archive commerce roadmap and publish findings.

---

## PHASE-E — Swiggy staging integration

Do not start before access and a stable stub flow.

### FMD-013 — MCP source verification — Codex

Deliver:

- current per-tool doc fetch
- live staging `tools/list` snapshot
- schema adapter
- documented differences from stub
- drift tests

### FMD-014 — OAuth PKCE and token storage — Codex

Deliver:

- DCR/authorization flow as agreed with Swiggy
- callback/state validation
- encrypted per-user tokens
- logout/revocation
- 401 reauthorization
- no browser token exposure

### FMD-015 — Staging UX hardening — Claude

Deliver:

- auth transitions
- real latency states
- provider-specific error copy
- expired-session recovery
- staging usability pass

### FMD-016 — Staging contract/e2e — Joint

Acceptance:

- 48-hour green staging period if required by Swiggy onboarding.
- Schema and read-only safety tests green.
- No production endpoint configured.
- No cart mutation or order.

---

## PHASE-F — Conditional cart/order work

These issues must not be created as active coding tasks until the prior gate is signed off.

M1:

- Cart policy and permission ledger
- Existing-cart preservation
- exact cart reconciliation
- cart-only UX
- cart mismatch red-team tests

M2:

- immutable order digest
- exact confirmation
- non-idempotent recovery
- support and reimbursement runbook
- production environment approval
- restricted beta

---

## 7. CI/CD plan

### CI-001 — Pull request checks

Required:

1. Dependency install with frozen lockfile
2. Formatting check
3. Lint
4. Typecheck
5. Unit tests
6. Contract tests
7. Build
8. Stub E2E smoke
9. Capability assertion
10. Secret scan

### CI-002 — Extended checks

Run on relevant paths or nightly:

- Playwright full suite
- Accessibility test
- Prompt-injection evaluation
- Dependency audit
- CodeQL/static analysis
- Database migration validation
- MCP schema drift check
- Bundle scan for secrets and server-only modules

### CI-003 — MCP drift workflow

Scheduled and manual workflow:

1. Fetch current `llms.txt`.
2. Fetch only relevant per-tool `.md` pages.
3. Against staging, call `tools/list`.
4. Compare with last approved redacted schema snapshot.
5. On additive optional change: open informational issue.
6. On removal/new required field/type change: fail and open high-priority issue.
7. Never auto-update adapter code.

### DEP-000 — Hosting constraint

Deploy the runtime to a platform that supports:

- Server-side Node execution
- HTTPS OAuth callbacks
- Protected environment secrets
- Persistent managed PostgreSQL
- India/Singapore-compatible processing after legal review
- Preview deployments that cannot reach production MCP

GitHub Actions triggers deployments. Do not use GitHub Pages for the product runtime.

### DEP-001 — PR preview

- Uses `MCP_ENV=stub`.
- Uses disposable/isolated database.
- Contains no production Swiggy token.
- Expires automatically.
- URL posted to PR.

### DEP-002 — Staging

- Deploy on merge to `main`.
- Uses GitHub `staging` environment.
- Uses Swiggy staging only.
- Capability set to active approved milestone.
- Database migrations run through a reviewed job.

### DEP-003 — Production

- Deploy from signed/reviewed release tag.
- GitHub `production` environment requires human approval.
- Branch/tag restrictions apply.
- Ordering flags remain false until M2 approval.
- Rollback and kill switch tested before enabling traffic.

---

## 8. Testing strategy

### TEST-001 — Unit

- Ontology mapping
- missing-job inference
- hard filters
- scoring
- explanation reason codes
- state transitions
- permission/capability policy
- redaction

### TEST-002 — Contract

- Internal Zod schemas
- Stub adapter conformance
- Staging `tools/list` compatibility
- external response normalisation
- unknown field and missing required field handling

### TEST-003 — Property/invariant

Generate arbitrary inputs to assert:

- M0 never emits a mutating action.
- One primary surface maximum.
- Budget hard limit is never violated knowingly.
- Every recommendation has source trace.
- Unknown diet never becomes verified vegetarian.
- One clarification maximum.
- Unsafe environment combinations fail startup.

### TEST-004 — End to end

- Onboarding → address → input → recommendation → feedback
- Food only
- Instamart only
- both surfaces
- one provider timeout
- both providers unavailable
- auth expiry
- no match
- mobile viewport
- keyboard/screen reader smoke

### TEST-005 — Red team

- Prompt injection in merchant and item names
- fabricated prices in model output
- malicious free text asking model to bypass permissions
- stale response replay
- cross-user session access
- token/log leakage
- schema drift
- production endpoint in preview
- accidental mutation tool registration

---

## 9. Runtime model plan

The coding agents are not the runtime product model.

### Runtime interface

```ts
interface PlannerPort {
  normaliseHomeState(input: HomeStateInput): Promise<NormalisedHomeState>;
  createSearchPlan(input: CompletionRequest): Promise<SearchPlan>;
  explain(input: ExplanationFacts): Promise<string>;
}
```

Implementations:

- `DeterministicPlanner`: mandatory and default for chips.
- `LlmPlanner`: optional for free text and explanation; schema constrained.
- `FallbackPlanner`: tries LLM only where allowed, then deterministic.

The model never receives MCP credentials and never owns a tool client.

Model provider choice is deferred until inference region, cost, latency, and privacy are confirmed.

---

## 10. Swiggy integration preparation

Before writing each integration:

1. Fetch `https://mcp.swiggy.com/builders/llms.txt`.
2. Fetch the exact tool reference `.md`.
3. Record verification date in the PR.
4. Inspect staging `tools/list`.
5. Update adapter schema or fixture only through a reviewed contract task.
6. Run failure cases.
7. Confirm target endpoint from environment config.
8. State that no real order was placed.

Known current facts that affect architecture:

- Food, Instamart, and Dineout are independent servers.
- Production endpoints are `/food`, `/im`, `/dineout`.
- OAuth is 2.1 with PKCE and no static API key.
- Access tokens are documented as five days; no refresh token in v1.
- A multi-user PWA needs per-user tokens and onboarding.
- Swiggy provides staging with seeded data after review.
- Server-side cart is authoritative.
- Order placement tools are non-idempotent.
- MCP-layer 429 limits are planned; upstream shedding exists now.
- Public widget iframe hosting is not live in v1.0, so build native UI from semantic data.

---

## 11. Initial task board dependency graph

```text
FMD-001 Repo bootstrap
   └── FMD-002 Contracts
         ├── FMD-004 Stub
         │     └── FMD-006 Domain planner
         │             └── FMD-007 API
         │
         └── FMD-005 Input UI
                └── FMD-008 Result UI

FMD-003 UX spec ───────────────┘

FMD-007 + FMD-008
   └── FMD-009 Integration
         ├── FMD-010 Telemetry
         ├── FMD-011 Study UX
         └── FMD-012 Gate report
                └── decision
                     └── FMD-013+ staging only if GO
```

Parallelism starts only after `FMD-002` merges.

---

## 12. Human checkpoints

A human must approve:

- Contract freeze
- Any active milestone change
- Any new MCP tool allowlist entry
- OAuth/token storage design
- Privacy/retention policy
- Staging access configuration
- Production endpoint configuration
- Cart mutation enablement
- Order enablement
- Deployment to production
- Agent-error reimbursement policy

AI agents can propose, implement, test, and open PRs. They do not self-authorise these changes.

---

## 13. First run instructions

### Repository owner

1. Create a private GitHub repository.
2. Copy this starter pack to repository root.
3. Commit as `docs: add AI product and execution contract`.
4. Configure branch protection before inviting agents.
5. Create issues FMD-001 through FMD-003.
6. Create separate worktrees.
7. Paste `prompts/CODEX_KICKOFF.md` into Codex for FMD-001.
8. Paste `prompts/CLAUDE_KICKOFF.md` into Claude for FMD-003.
9. Do not ask Claude to implement UI code until FMD-002 contracts merge.
10. Apply for or confirm Swiggy staging access while local work proceeds.

### Stop condition

If an agent proposes enabling production MCP or checkout during M0, reject the change and point it to `INV-001`, `INV-002`, and the active milestone section of `AI_PRD.md`.
