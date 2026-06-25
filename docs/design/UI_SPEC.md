# UI Specification — Seed

Owner: Claude  
Status: seed; expand under task FMD-003

## Design thesis

The interface should feel like completing a plate, not shopping a marketplace.

## Required screens

1. Product value and Swiggy connection boundary
2. Saved-address selection
3. Home-food chips and constraints
4. Search progress
5. One recommendation
6. One targeted alternative
7. No-match
8. Partial provider failure
9. Auth/session failure
10. Feedback and study completion
11. Privacy/connection settings

## Recommendation hierarchy

```text
1. What is already at home
2. What to add
3. Why it completes dinner
4. Assumption
5. Surface, estimated item price, ETA status
6. Primary response: useful / would order
7. Secondary response: change one thing
```

## Interaction constraints

- No chat transcript as the primary UI.
- No infinite results.
- No more than one primary recommendation.
- No active cart/order button in M0.
- No fake “final price.”
- No medical or health claims.
- Address choice is explicit.
- Common input is possible with three taps or fewer.

## State matrix

Claude must define copy and visual treatment for:

| State | Required user truth |
|---|---|
| Loading | Which provider/check is in progress |
| Food failed | Comparison is incomplete; nothing changed |
| Instamart failed | Comparison is incomplete; nothing changed |
| Both failed | Nothing changed; retry/handoff |
| No match | Exact constraint causing failure |
| Low confidence | Assumption requiring user correction |
| Auth expired | Reconnect; prior input can be preserved safely |
| Slow response | Progress without fake completion |
| Schema mismatch | Generic safe error + trace ID |
| Offline | Local input preserved; no stale provider claims |

## Design tokens

Define semantic tokens rather than product-specific hex values:

```text
surface.base
surface.elevated
text.primary
text.secondary
text.muted
border.default
action.primary
action.secondary
state.success
state.warning
state.error
focus.ring
space.*
radius.*
type.*
```

Do not copy Swiggy brand assets or imply official endorsement without permission.
