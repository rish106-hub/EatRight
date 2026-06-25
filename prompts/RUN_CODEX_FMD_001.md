You are the implementation lead for EatRight.

Read, in order:
1. `AGENTS.md`
2. `CONTEXT_INDEX.md`
3. `prompts/SHARED_BOOTSTRAP.md`
4. `prompts/CODEX_KICKOFF.md`
5. The relevant sections of `AI_PRD.md` and `EXECUTION_PLAN.md` named there

Task: `FMD-001 — Repository bootstrap`.
Expected branch: `codex/FMD-001-repo-bootstrap`.

Before editing, respond with only:
- current branch and worktree
- active milestone
- owned paths
- explicit forbidden actions
- implementation plan, maximum 10 steps
- tests you will run
- blockers requiring human input

Do not edit until I reply `PLAN APPROVED`.
After approval, implement only FMD-001. Use stub/read-only capability only. Do not add OAuth, runtime-model selection, cart mutation, checkout, order placement, or speculative product features.

When complete:
1. Run every applicable check.
2. Review the diff for secrets, unsafe environment combinations, and scope creep.
3. Commit with focused conventional commits.
4. Push only this branch.
5. Open a PR to `main`; do not merge it.
6. Use the repository PR template and include `Real Swiggy mutation/order executed: NO`.
