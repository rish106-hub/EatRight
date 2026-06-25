# Threat Model

## 1. Assets

- Swiggy OAuth access token
- Internal session
- Saved-address identifiers/display text
- User home-food input
- Dietary exclusions
- Recommendation history/feedback
- MCP tool capability
- Future cart/order permission grants
- Application and deployment secrets

## 2. Adversaries and failures

- Malicious user attempting privilege escalation
- Cross-user session mix-up
- Prompt injection through merchant/item content
- Compromised dependency or CI token
- Coding agent enabling production capability accidentally
- Stale or malformed MCP schema
- Token leakage through browser/log/model
- Replay of future cart/order confirmation
- Network ambiguity causing duplicate order
- Insider access to plaintext tokens
- Preview deployment pointing to production

## 3. Threat controls

| Threat | Control |
|---|---|
| Token in browser | Server-side OAuth/token storage; HttpOnly session |
| Cross-user token access | Per-user encryption context and repository queries scoped by internal user ID |
| Prompt injection | Structured untrusted-data boundary; no tool grants from text |
| Agent bypasses policy | Deterministic allowlist outside model |
| Accidental production access | Environment assertion + protected secrets + capability double lock |
| Schema drift | `tools/list` contract checks; fail closed |
| PII in logs | Redaction and structured metadata-only logs |
| PII to model | Redaction gateway and allowlisted fields |
| CSRF | State validation for OAuth; CSRF protection for writes |
| Session fixation | Rotate session after OAuth |
| Replay | Future single-use permission grants and expiring digests |
| Duplicate order | Future check-before-retry, never blind retry |
| Supply-chain compromise | Lockfile, dependency scanning, CodeQL, restricted GitHub permissions |
| Agent-generated unsafe code | Mandatory PR, CI, human checkpoint for capability/auth/deployment |

## 4. M0 security acceptance

- No mutation tool exists in executable allowlist.
- No production URL in previews.
- No Swiggy token in client bundle, network response, analytics, or logs.
- Malicious product names do not alter search/policy behaviour.
- Auth failures clear or reauthorize safely.
- Staging fixtures contain no real user data.
- Every external response is runtime-validated.

## 5. Future mandatory review

Before M1/M2:

- Formal permission ledger review
- Replay and race testing
- Liability/reimbursement runbook
- Incident response and on-call ownership
- Cancellation/support handoff
- Payment-method handling
- Production penetration test
