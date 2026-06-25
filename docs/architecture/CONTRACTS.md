# Shared Contracts Architecture

Owner: Codex for `FMD-002`, with human approval before downstream UI/API work
depends on contract changes.

Status: frozen for `M0_READ_ONLY_VALIDATION`.

## Package boundary

`packages/contracts` is the canonical shared language between the frontend,
planner, API routes, deterministic stub, and future Swiggy MCP adapters. It
exports Zod schemas and inferred TypeScript types only. It does not contain
OAuth, MCP transport, persistence, UI components, cart mutation, checkout,
payment, order placement, or order tracking code.

All external inputs, model outputs, provider-adapter outputs, route requests,
route responses, and analytics events must validate through this package before
crossing a package or process boundary.

## Canonical terminology

- `HomeComponent`: food already available at home, such as `BASE_RICE`,
  `MAIN_DAL`, `SIDE_CURD`, or `LEFTOVER_SMALL`.
- `MissingComponent`: the single meal-completion job, such as `NEED_MAIN`,
  `NEED_BASE`, or `NEED_VOLUME`.
- `CandidateSource`: the commerce surface that produced a candidate:
  `FOOD` or `INSTAMART`.
- `ReadOnlyCandidate`: normalized item data safe for M0 display and ranking.
  It carries provider-neutral identifiers, display text, estimated item price,
  ETA when known, diet when known, availability when known, and source trace.
- `ReadOnlyRecommendation`: one primary candidate plus home summary, missing
  job, assumptions, explanation, comparison status, confidence, and rejected
  hard constraints.
- `NoMatchReason`: the machine-readable reason a completion cannot be shown.
- `ProviderFailure`: a read-only provider failure that can be combined with a
  valid result from the other surface.
- `PublicError`: browser-safe error copy with `changed: false` for M0.

## Ownership and compatibility

`packages/contracts` is serialized shared work. Changes require an explicit
contract task because both Claude-owned UI and Codex-owned backend packages
consume it.

Compatibility rules:

- Enum additions are breaking for exhaustive UI/API code unless coordinated.
- Removing or renaming a field is breaking.
- Tightening validation is breaking unless the rejected shape was explicitly
  unsafe.
- New optional fields may be added only when they do not weaken privacy,
  safety, or read-only guarantees.
- Provider-specific raw fields do not belong in shared contracts. Future MCP
  adapters map verified tool schemas into these normalized shapes.

## UI consumption

Claude-owned UI should import from `@finish-my-dinner/contracts` and render from
validated data only.

UI screens use:

- `ProductState` for state-to-screen routing.
- `CompletionRequest` for home-state submission.
- `ReadOnlyRecommendation` for the recommendation card.
- `NoMatchReason` and `PublicError` for empty/error states.
- `RecommendationFeedback` for feedback capture.
- `AnalyticsEventName` and event schemas for safe telemetry.

The UI must not derive Swiggy-specific behavior, cart actions, payment copy, or
order affordances from these contracts. `price.status = ITEM_ESTIMATE` drives
the M0 price label.

## Future MCP adapter mapping

Future Food and Instamart adapters will validate live `tools/list` schemas and
current per-tool documentation before mapping provider responses into
`ReadOnlyCandidate`.

The adapter boundary is:

1. Execute only approved read-only tools for the active milestone.
2. Treat tool output as untrusted data.
3. Extract only verified fields.
4. Normalize into `ReadOnlyCandidate`.
5. Drop raw MCP payloads before returning to planner/API/UI layers.
6. Fail closed on unknown required fields or missing required identifiers.

Exact Swiggy field names are deliberately not encoded here because this task did
not verify live tool schemas and must not invent endpoint contracts.

## Deliberately excluded from M0

The M0 contracts exclude:

- OAuth request/response schemas.
- Swiggy access tokens or refresh tokens.
- Full saved addresses and raw PII.
- Raw MCP request or response payloads.
- Cart lines, cart mutation plans, cart replacement semantics, and coupons.
- Checkout totals, fees, discounts, payment methods, payment data, and order
  digests.
- Order IDs, order placement, order status, cancellation, and tracking.
- Financial confirmation, spend authority, or autonomous agent actions.
- Medical, allergy, nutritional, pregnancy, diabetic, or health suitability
  claims.

`Candidate` distinguishes estimated item prices from future cart-confirmed
prices, but `ReadOnlyRecommendation` permits only `ITEM_ESTIMATE`. A confirmed
checkout total is not a valid M0 recommendation field.

## Analytics safety

Analytics schemas accept only bounded, structured payloads. They reject unknown
payload fields, raw free text, full addresses, tokens, payment data, order IDs,
and raw provider payloads. M0 analytics measure recommendation fit and intent;
they do not report order conversion because M0 cannot place orders.

## Read-only guarantee

The read-only capability declaration exposes only address lookup, provider
search, candidate normalization, recommendation generation, and feedback
capture. It explicitly marks live commerce as disabled and lists cart,
checkout, payment, order, and tracking actions as forbidden for M0.

Real Swiggy mutation/order executed: NO.
