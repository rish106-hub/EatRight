# Read-Only Meal-Completion API

Owner: Codex for `FMD-007`

Status: M0 read-only implementation.

## Endpoint Contract

`POST /api/meal-completion` is a same-origin Next.js route. It accepts
`application/json` only and returns a route-local JSON envelope. The route does
not introduce CORS, cookies, persistence, OAuth, Swiggy MCP transport, cart
state, checkout, payment, order placement, or tracking.

The request body must validate as the frozen shared `CompletionRequest` from
`@finish-my-dinner/contracts`. Unknown fields are rejected by the existing
strict runtime schema.

## Response Envelope

Successful responses validate against the route-local
`mealCompletionApiResponseSchema` and include:

- `apiVersion: "meal-completion.v1"`
- `correlationId`
- `capability.mode: "demo_read_only"`
- explicit stub/read-only capability flags with commerce actions disabled
- a `PlannerOutcome` validated with `plannerOutcomeSchema`

Error responses include only:

- `apiVersion`
- `correlationId`
- stable error code
- short neutral message
- optional field issue paths and messages

No response exposes stack traces, raw Zod errors, full request bodies, raw
provider payloads, token values, address text, cart data, checkout data,
payment data, order data, or tracking data.

All responses set `Cache-Control: no-store`.

## HTTP Status Semantics

- `200`: valid planner domain outcomes, including recommendation, no valid
  completion, handoff, insufficient information, no purchase required,
  unserviceable, and provider failure outcomes.
- `400`: malformed JSON.
- `415`: unsupported content type.
- `422`: structurally invalid `CompletionRequest`, unknown demo address ID, or
  oversized structured request body.
- `500`: unsafe runtime capability configuration or unexpected internal
  planner validation failure.

## Demo Address Mapping

M0 has no live `get_addresses` call. The route accepts only the existing local
demo IDs used by the frontend fixture:

- `address-sample-home`
- `address-sample-work`
- `address-sample-other`

The server stores no real address data and treats unknown IDs as a `422`
validation/domain failure. The selected ID is used only to build a deterministic
stub serviceability context with `selectedByUser: true`.

Stub provider scenarios are selected server-side from the validated structured
home state plus the explicit demo address ID. Clients cannot pass scenario IDs
or provider internals.

## Provider And Planner Injection

For each request the route creates fresh deterministic stub providers with
`createStubProviders` from `@finish-my-dinner/providers-stub`, then injects the
Food and Instamart read-only provider ports into:

```ts
createDeterministicPlanner({
  foodPort,
  instamartPort,
});
```

The route does not use global mutable provider state, direct network calls, MCP
SDKs, OAuth tokens, databases, LLM planning, or client-supplied provider
implementations. Provider failures remain independent because the planner
searches the injected Food and Instamart ports separately.

## Capability Enforcement

The route fails closed unless the runtime explicitly provides:

```text
MCP_ENV=stub
CAPABILITY_LEVEL=read_only
ALLOW_REAL_SWIGGY_MUTATIONS=false
ALLOW_REAL_SWIGGY_ORDERS=false
```

The assertion composes with the existing runtime environment validation in
`apps/web/src/lib/runtime-config.ts`. Unsafe configuration returns a stable
`UNSAFE_RUNTIME_CONFIGURATION` error without exposing environment details.

## Logging And Privacy

The handler accepts an injectable logger for tests and production wiring. Log
events contain only:

- `correlationId`
- endpoint
- HTTP status
- duration in milliseconds
- outcome status or stable error code
- selected provider when a recommendation exists
- `demo_read_only` capability marker

Logs do not include raw request bodies, raw free text, exclusions, address text,
tokens, payment data, provider payloads, or stack traces.

## Error Handling

Malformed inputs are rejected before planning. Valid domain outcomes stay in
the `200` response path, so the UI can render planner states without treating
no-match or provider-failure cases as transport failures. Unexpected planner
output is validated again with `plannerOutcomeSchema` and fails closed.

## Deterministic Stub Behavior

The API runs fully against local deterministic stubs in M0. The same validated
request and demo address produce the same planner outcome. Provider scenario
selection is deterministic and server-only.

## M0 Limitations

This API is a read-only validation surface. It does not claim real Swiggy
serviceability, exact final prices, fees, discounts, nutrition, medical
suitability, allergy safety, or order availability. Item prices are estimates
only when returned by the normalized stub candidate.

## Future Swiggy MCP Boundary

Future live Swiggy adapters must replace the stub provider ports behind the
same planner boundary. Before writing or enabling those adapters, the
implementation must fetch current Swiggy reference pages and inspect live
`tools/list` in the target environment. Raw MCP payloads must be mapped into
validated normalized contracts and dropped before reaching the planner, API
response, UI, logs, analytics, or LLM.

## Commerce Prohibition

The route cannot mutate carts, clear carts, apply coupons, checkout, pay, place
orders, track orders, or enable real commerce through source changes alone.

Real Swiggy mutation/order executed: NO.
