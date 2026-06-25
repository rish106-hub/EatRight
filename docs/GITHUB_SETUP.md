# GitHub Setup Checklist

## Repository

- Create a private repository.
- Add this starter pack.
- Make the initial documentation commit.
- Add collaborators with least privilege.
- Replace commented CODEOWNERS placeholders with real users/teams.

## Protect `main`

Require:

- Pull request before merge
- Required checks
- Up-to-date branch
- At least one approval
- No force push
- No deletion
- Human approval for auth, MCP, security, capability, workflow, or production changes

## Environments

Create:

### `preview`

- Stub-only
- No Swiggy production secrets
- No protected approval needed
- Ephemeral database

### `staging`

- Swiggy staging secrets
- Approved redirect URI
- Current milestone capability only
- Restricted maintainers

### `production`

- Swiggy production secrets
- Required human reviewers
- Deployment branch/tag restriction
- Ordering flags false by default
- No agent can approve deployment

## Initial labels

```text
agent:codex
agent:claude
area:contracts
area:ui
area:mcp
area:security
area:research
type:feature
type:bug
type:decision
risk:financial
risk:privacy
blocked
ready
```

## Initial issues

Create from `docs/TASK_BOARD.md`:

- FMD-001 and FMD-003 as Ready
- FMD-002 blocked only by FMD-001
- All others blocked/deferred

## Worktrees

Use one worktree per agent. Do not run both in the repository root.

## Deployment rule

A green PR preview is not production approval. Production deploys must use a protected GitHub environment and a human-approved release.
