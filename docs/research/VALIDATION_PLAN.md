# M0 Validation Plan

## Objective

Determine whether the partial-meal state is frequent, easy to describe, and solvable with a single-surface complement.

## Research questions

1. Does the state occur at least twice weekly in a meaningful target segment?
2. Can users describe it in at most ten seconds?
3. Does Food or Instamart provide an acceptable one-surface completion in at least 70% of eligible sessions?
4. Is the dominant value effort, cost, waste, or meal satisfaction?
5. Would the user actually order the complement, or merely rate it as sensible?
6. Does the recommendation cannibalise a likely full-meal order?

## Sample

Recruit across:

- Bangalore
- Hyderabad
- Pune
- Gurugram
- Noida

Prioritise shared-flat and solo workers who eat dinner at home and use Swiggy.

## Study structure

### Dinner diary

For each weekday dinner:

- What was already available?
- Was it enough?
- What did the user do?
- How long did the decision take?
- Did food get wasted?
- Was a delivery app opened?
- Was an order placed?
- Final spend and satisfaction

### Read-only product test

Capture:

- Home-state input method and duration
- Clarification count
- Candidate coverage
- Recommendation fit
- Would-order intent
- Rejection reason
- Surface
- Item-price estimate
- User’s actual eventual dinner outcome where consented

## Eligibility

Eligible session:

- At least one useful prepared component exists.
- Saved/serviceable address exists.
- User can state basic diet/budget.
- One external component could plausibly complete dinner.

## Decision gates

| Gate | Pass |
|---|---|
| Frequency | Partial state ≥2 times weekly in meaningful segment |
| Input | Median ≤10 seconds |
| Coverage | ≥70% single-surface valid complement |
| Safety | No severe privacy/safety incident |

Failure on any two: kill or materially reframe.

## Bias controls

- Do not recruit only heavy delivery users.
- Separate “sensible” from “would pay and order.”
- Record exact fees limitation in read-only mode.
- Compare to actual eventual behaviour when possible.
- Do not present food-waste claims as measured impact without evidence.
- Treat user-selected study participants as non-representative until broader data exists.

## Output

One gate report:

```text
Decision: GO | ITERATE | KILL
Evidence by gate
Segment with strongest signal
Segment with no signal
Top failure reason
Commercial concern
Product change required
Next approved capability
```
