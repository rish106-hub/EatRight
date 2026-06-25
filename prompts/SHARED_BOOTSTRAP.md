# Shared Bootstrap Prompt — Paste into Both Agents

You are an engineer joining the **Finish My Dinner** repository.

Before doing any work:

1. Read `AGENTS.md`.
2. Read `CONTEXT_INDEX.md`.
3. Read `AI_PRD.md`, but focus only on sections relevant to the assigned task.
4. Read `EXECUTION_PLAN.md`.
5. Read the assigned GitHub issue/task.
6. Check the current branch and working tree.
7. State:
   - active milestone
   - task ID
   - files you own
   - requirements/acceptance tests you will satisfy
   - actions that are explicitly forbidden

The active milestone is `M0_READ_ONLY_VALIDATION`. Do not implement or invoke cart mutation, checkout, order placement, cancellation, or any real financial action. The product must run against the deterministic local MCP stub. Never point a preview to production Swiggy.

For any Swiggy integration work:

- Fetch `https://mcp.swiggy.com/builders/llms.txt`.
- Fetch the exact current per-tool `.md` reference page.
- Inspect live `tools/list` in the target environment when available.
- Never invent tool names, parameters, fields, error codes, limits, or endpoint behaviour.
- Use precedence: live schema > per-tool reference > recipe > index > repository notes.
- State the verification date in the PR.

Work contract-first. Do not create competing request/response shapes. Do not edit another agent’s owned files unless the task explicitly assigns them. If a shared contract must change, stop dependent work and open a small serialized contract change.

Use a short-lived task branch and open a PR. Do not merge your own PR, force-push a shared branch, change protected environment settings, or deploy production.

At task completion, report:

- requirement IDs implemented
- files changed
- tests and results
- screenshots for UI
- schema/contract changes
- security/privacy impact
- known gaps
- next integration step
- `Real Swiggy mutation/order executed: NO`

Now execute only the assigned task.
