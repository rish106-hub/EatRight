# M0 Demo Flow

Status: FMD-009 read-only demo integration.

## End-To-End Flow

The M0 demo starts on `/` and `/start` with the guided mobile-first flow:

1. Show the read-only/demo boundary.
2. Require the user to choose one local demo address.
3. Capture structured home-food components and constraints.
4. Review the structured request.
5. Submit a validated `CompletionRequest` to same-origin
   `POST /api/meal-completion`.
6. Validate the public response shape and `PlannerOutcome`.
7. Render one recommendation or the relevant non-success outcome.

The flow uses the existing local deterministic API and provider stub. It does
not call live Swiggy MCP, OAuth, carts, checkout, payment, ordering, tracking,
analytics, cookies, databases, external provider networks, or LLMs.

## Client State Machine

The integrated client state is:

```text
intro
  -> address
  -> home
  -> review
  -> submitting
  -> outcome | api-error
```

`Start over` resets the draft, request, outcome, and failure state. `Correct
input` returns to the editable home-state screen with the current browser-only
draft preserved. `Try again` resubmits the last validated request.

## Request Boundary

The browser assembles `CompletionRequest` only through the shared contract
builder. The submitted body contains:

- `sessionId`
- `requestId`
- selected demo `addressId`
- structured home components and optional safe note
- servings, diet, exclusions, budget, ETA, and meal weight

The body does not include raw address text, tokens, payment data, cart data,
order data, tracking data, raw provider payloads, or scenario IDs.

## Response Boundary

The client accepts only the public demo envelope:

- `apiVersion: "meal-completion.v1"`
- `correlationId`
- `ok`
- read-only capability marker for stub mode
- validated `PlannerOutcome` on success
- stable public error code on failure

The client intentionally does not import the server route-local schema. It uses
a small client parser and validates planner outcomes with `plannerOutcomeSchema`
before rendering.

## API Integration

Runtime integration uses same-origin `fetch("/api/meal-completion")` with JSON
only. No CORS, Swiggy endpoint, OAuth token, external network call, cart,
checkout, payment, order, or tracking surface is introduced by the client.

## Outcome Rendering

`RECOMMENDATION_READY` renders one primary recommendation through the existing
recommendation UI. Non-success planner outcomes render explanatory read-only
states:

- `NO_VALID_COMPLETION`
- `INSUFFICIENT_INFORMATION`
- `NO_PURCHASE_REQUIRED`
- `UNSERVICEABLE`
- `BOTH_PROVIDERS_FAILED`
- `STANDARD_SWIGGY_HANDOFF_REQUIRED`

The standard Swiggy handoff state is explanatory only in FMD-009. No external
handoff button or navigation is wired.

## Error Handling

The client handles:

- `400`: malformed request response as safe request failure
- `415`: unsupported media response as safe request failure
- `422`: validation/domain response with correction copy
- `500`: capability failure or generic safe failure
- network failure with retry
- invalid or unsafe response data with safe fallback

No stack traces, raw validation payloads, raw request bodies, or technical
provider details are shown to the user.

## Accessibility Notes

Each screen has a focusable heading. Focus moves to the loading heading after
submission and to the result or error heading after async completion. A single
polite status region announces state changes. Controls remain native buttons or
radios where possible, with keyboard operation, 44 px targets, visible focus
rings, and text labels that do not rely on colour alone.

## Privacy Posture

User input stays in browser memory for the current session. The task adds no
analytics, cookies, local storage, database persistence, server-side raw text
logging, LLM calls, or external runtime network calls beyond the same-origin
API route.

## Demo Limitations

The demo uses local sample addresses and deterministic stub providers. It does
not represent live Swiggy serviceability, real merchant availability, exact
fees, final totals, discounts, medical suitability, allergy safety, or nutrition
claims. Prices and ETAs are item-level read-only estimates where present.

## Before Live Swiggy MCP

Any future live integration must first verify current Swiggy documentation,
inspect live `tools/list` in the target environment, preserve server-side token
handling, keep raw MCP payloads out of the browser and logs, and pass a separate
capability review. FMD-009 does none of that future work.

## Commerce Prohibition

M0 cannot mutate carts, clear carts, apply coupons, checkout, take payment,
place orders, track orders, cancel orders, or enable real commerce through a
source-code change alone.

Real Swiggy mutation/order executed: NO.
