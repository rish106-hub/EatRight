# EatRight — Two-Agent Operating Manual

Assumption: macOS/Linux shell and repository path:

```text
~/Developer/Product Experiments/EatRight
```

If the actual folder uses different spelling or casing (for example `Product Experiements`), use that exact path.

## 1. Operating model

- `EatRight/` is the human-controlled main checkout. Do not run a write agent there.
- Codex owns heavy implementation, backend, contracts, tests, CI, debugging, and MCP adapters.
- Claude owns UX specification, product-facing frontend, content, accessibility, and visual QA.
- Each active task gets a branch, a separate worktree, and one primary owner.
- Maximum two write agents at once: one Codex worktree and one Claude worktree.
- Shared contracts and root configuration are serialized. Never let both agents edit them concurrently.
- Active milestone is `M0_READ_ONLY_VALIDATION`: no cart mutation, checkout, ordering, or real financial action.

## 2. One-time machine setup

Verify tools:

```bash
git --version
gh --version
node --version
corepack --version
claude --version
codex --version
```

Authenticate once:

```bash
gh auth login
claude
codex
```

Exit Claude and Codex after authentication.

## 3. Initialise and publish the repository

```bash
cd "$HOME/Developer/Product Experiments/EatRight"

# Confirm the starter pack is at repository root.
ls AGENTS.md CLAUDE.md CONTEXT_INDEX.md AI_PRD.md EXECUTION_PLAN.md

# Initialise only if this folder is not already a git repository.
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || git init -b main

git add .
git commit -m "docs: bootstrap EatRight product and engineering contract"

gh repo create EatRight \
  --private \
  --source=. \
  --remote=origin \
  --push \
  --description "MCP-powered meal completion using Swiggy Food and Instamart"
```

If `origin` already exists, skip `gh repo create` and run:

```bash
git push -u origin main
```

Keep the repository private until secrets, branding, and research data handling are reviewed.

## 4. GitHub controls

Immediately enable a `main` ruleset or branch protection with:

- Pull request required before merge
- Required status checks once the first CI workflow exists
- Branch must be up to date before merge
- Force pushes disabled
- Branch deletion disabled

If you are the only human collaborator, do **not** require one approving review yet; you cannot approve your own PR. Add that rule after another human reviewer is available.

Do not configure production deployment or production Swiggy secrets in M0.

## 5. First parallel wave

From the human-controlled main checkout:

```bash
cd "$HOME/Developer/Product Experiments/EatRight"
git switch main
git pull --ff-only

./scripts/new-worktree.sh codex FMD-001 repo-bootstrap
./scripts/new-worktree.sh claude FMD-003 ux-spec
```

This creates sibling directories similar to:

```text
~/Developer/Product Experiments/EatRight-codex-FMD-001
~/Developer/Product Experiments/EatRight-claude-FMD-003
```

### Terminal A — Codex

```bash
cd "$HOME/Developer/Product Experiments/EatRight-codex-FMD-001"
./scripts/start-codex.sh prompts/RUN_CODEX_FMD_001.md
```

The launcher uses GPT-5.5, high reasoning, workspace-write sandboxing, and on-request approvals by default. Review its plan. Then paste:

```text
PLAN APPROVED.
```

or paste the contents of `prompts/PLAN_APPROVED.md`.

### Terminal B — Claude

```bash
cd "$HOME/Developer/Product Experiments/EatRight-claude-FMD-003"
./scripts/start-claude.sh prompts/RUN_CLAUDE_FMD_003.md
```

The launcher uses the latest `opus` alias, medium effort, and plan mode by default. Review its plan. Then switch from plan mode to an editing mode in Claude Code and paste:

```text
PLAN APPROVED.
```

To start directly in edit-accepting mode after you trust the workflow:

```bash
CLAUDE_PERMISSION_MODE=acceptEdits \
  ./scripts/start-claude.sh prompts/RUN_CLAUDE_FMD_003.md
```

## 6. What may run in parallel

### Wave 1

- Codex: `FMD-001` repository bootstrap
- Claude: `FMD-003` UX and visual specification, documentation only

Merge `FMD-001` first. `FMD-003` may merge before or after it if there is no conflict.

### Wave 2 — serialized contract gate

- Codex: `FMD-002` shared contracts
- Claude: review/refine UX documentation only; no frontend implementation

Human reviews and merges `FMD-002`. This is the contract freeze that unlocks parallel code.

### Wave 3

- Codex: `FMD-004` MCP stub and fixtures, then `FMD-006` planner/ranking
- Claude: `FMD-005` onboarding, address, and home-state UI against merged contracts/fixtures

### Wave 4

- Codex: `FMD-007` read-only API orchestration
- Claude: `FMD-008` recommendation and feedback UI

### Wave 5

- Codex primary: `FMD-009` integration branch
- Claude: review, visual QA, and narrowly scoped frontend fixes after integration seams are stable

Do not start FMD-010 onward until FMD-009 is green. Do not start staging/OAuth tasks FMD-013 onward until the M0 research gate says GO.

## 7. Starting every later task

1. Merge all dependencies to `main`.
2. Remove the old worktree after its PR merges.
3. Create a fresh task worktree from current `main`.
4. Create a task prompt from `prompts/TASK_TEMPLATE.md`.
5. Start the correct agent in that worktree.
6. Require a plan before edits.
7. Let only the primary owner write the owned paths.

Example:

```bash
cd "$HOME/Developer/Product Experiments/EatRight"
git switch main
git pull --ff-only
./scripts/new-worktree.sh codex FMD-002 shared-contracts
```

Then create `prompts/RUN_CODEX_FMD_002.md` using `prompts/TASK_TEMPLATE.md`, and run:

```bash
cd "$HOME/Developer/Product Experiments/EatRight-codex-FMD-002"
./scripts/start-codex.sh prompts/RUN_CODEX_FMD_002.md
```

## 8. PR and review loop

Agents may commit, push their own branch, and open a PR. They may not merge it.

Human loop:

```bash
gh pr list
gh pr checks <PR_NUMBER>
gh pr diff <PR_NUMBER>
gh pr view <PR_NUMBER> --web
```

Use cross-review before merge:

- Ask Codex to review Claude PRs with `prompts/CODEX_REVIEW_CLAUDE_PR.md`.
- Ask Claude to review Codex contract/API PRs with `prompts/CLAUDE_REVIEW_CODEX_PR.md`.

Cross-review is advisory. The reviewing agent must not start editing the other agent’s branch.

Merge only when:

- Required checks pass
- The PR is rebased/up to date
- Scope matches the task
- No safety invariant is weakened
- No secret or production endpoint is introduced
- The handoff states `Real Swiggy mutation/order executed: NO`

After merge:

```bash
cd "$HOME/Developer/Product Experiments/EatRight"
git switch main
git pull --ff-only
./scripts/cleanup-worktree.sh "../EatRight-codex-FMD-001"
```

Use the relevant worktree path.

## 9. Swiggy MCP rule

The coding agents need documentation access, not live production tool access, during M0.

Before implementing any Swiggy contract, the responsible agent must fetch:

```text
https://mcp.swiggy.com/builders/llms.txt
```

and the exact per-tool `.md` page. When staging access exists, compare the implementation with live staging `tools/list`.

Do not connect Claude Code or Codex directly to production Swiggy MCP during M0. A production MCP connection exposes real ordering tools and can create real-world effects.

## 10. Daily operator checklist

At the start of the day:

```bash
cd "$HOME/Developer/Product Experiments/EatRight"
git fetch --all --prune
git worktree list
gh pr list
gh issue list
```

For each agent, verify:

- correct task branch
- no uncommitted work in main
- dependency PRs merged
- owned paths do not overlap
- current task prompt names acceptance criteria and exclusions
- no production MCP credentials available

At the end of the day:

- read both summaries
- review pushed commits and PRs
- resolve contract questions before the next wave
- update GitHub issue status
- do not leave a second agent continuing against an obsolete contract

## 11. Commands never to use in this workflow

Do not launch Codex with `--yolo` or `danger-full-access`.
Do not launch Claude with `bypassPermissions`.
Do not run either write agent in the main checkout.
Do not give both agents the same branch or worktree.
Do not ask agents to merge their own PRs.
Do not let agents configure production secrets, environments, or Swiggy ordering in M0.
