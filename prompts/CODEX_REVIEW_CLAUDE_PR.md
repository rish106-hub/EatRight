Review the specified Claude-owned PR as the implementation lead. Do not modify files unless explicitly asked.

Check only:
- alignment with `AI_PRD.md`, accepted decisions, and M0 invariants
- whether proposed UI states can be represented by existing/planned contracts
- missing error, auth, partial-provider, uncertainty, and accessibility states
- accidental cart/order or marketplace-discovery scope
- implementation ambiguities that would create backend rework

Return:
1. Blocking findings with file and section references
2. Non-blocking findings
3. Contract requests, if any
4. Verdict: APPROVE / REQUEST CHANGES
