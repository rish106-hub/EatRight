---
id: FMD-AI-PRD
product: Finish My Dinner
version: 0.2-ai
status: draft-pre-validation
last_updated: 2026-06-25
active_milestone: M0_READ_ONLY_VALIDATION
product_surface: mobile-first-pwa
primary_verticals:
  - swiggy-food
  - swiggy-instamart
normative_language: RFC2119
---

# Finish My Dinner — AI Product Requirements Document

This is the canonical machine-readable product contract. `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, and `MAY` are normative.

## 0. Agent loading contract

Before implementing a task:

1. Read `AGENTS.md`.
2. Read `CONTEXT_INDEX.md`.
3. Read the assigned task.
4. Read only the relevant sections of this file.
5. For Swiggy work, read `docs/MCP_CONTRACTS.md` and fetch the current official per-tool `.md` page.
6. Treat live MCP `tools/list` in the target environment as the final tool-schema authority.

Do not load `llms-full.txt` unless the task genuinely spans several unknown Swiggy areas.

---

## 1. Product contract

### PRD-001 — Product statement

Finish My Dinner helps a user who already has part of dinner at home procure the **smallest useful missing component** from Swiggy Food **or** Instamart.

### PRD-002 — User problem

> I have some food at home, but not a complete dinner. Figuring out what to add is almost as tiring as choosing a full order.

### PRD-003 — Job to be done

> When dinner is incomplete after work, help me use what I already have and obtain only what is missing, with minimal effort, cost, and waste.

### PRD-004 — Differentiation

The product MUST start from the user’s home-food state. It MUST NOT begin with restaurants, cuisines, cravings, feeds, or generic recommendations.

### PRD-005 — Primary hypothesis

For users with a useful partial dinner, a single compatible complement will reduce decision effort and improve conversion relative to ordinary marketplace discovery.

### PRD-006 — Current uncertainty

The frequency and commercial value of the partial-meal state are unproven. The current milestone exists to validate or kill the thesis before financial actions are built.

---

## 2. Active milestone and capability gates

### M0_READ_ONLY_VALIDATION — active

Allowed:

- Connect to a local MCP stub.
- Connect to Swiggy staging after access is granted.
- Authenticate a test user.
- Retrieve and ask the user to choose a saved address.
- Search Food and Instamart.
- Normalise results.
- Produce one primary completion.
- Capture fit and intent feedback.
- Handoff to a non-mutating standard Swiggy destination only when a documented handoff exists.

Forbidden:

- `update_food_cart`
- `flush_food_cart`
- `update_cart`
- `clear_cart`
- `apply_food_coupon`
- `place_food_order`
- `checkout`
- Any implicit or explicit payment action
- Any production real-order test

Exit gate:

- `GATE-001`: meaningful target users report a partial-meal state at least twice weekly.
- `GATE-002`: median home-state input time is at most 10 seconds.
- `GATE-003`: at least 70% of eligible sessions produce one acceptable single-surface complement.
- Failure on any two gates kills or materially reframes the product.

### M1_CART_ONLY — future, conditional

Allowed only after M0 approval:

- Read current cart.
- Obtain explicit cart-build permission.
- Mutate one Food or one Instamart cart.
- Re-read and reconcile exact cart.
- Display exact payable total.

Still forbidden:

- Checkout or order placement.

### M2_SINGLE_SURFACE_ORDERING — future, conditional

Allowed only after M1 safety approval and Swiggy production onboarding:

- Place one order on one surface after exact, fresh confirmation.
- Recover ambiguous order responses through check-before-retry.
- Track a successful order.

### M3_DUAL_SURFACE — explicitly out of scope

Two independent orders are non-atomic. Do not implement unless Swiggy and product/legal owners approve a partial-success policy.

---

## 3. Target user

### ICP-001 — Primary cohort

A 22–32-year-old corporate worker in Bangalore, Hyderabad, Pune, Gurugram, or Noida who:

- Eats dinner at home on at least three weekdays.
- Has a usable prepared component or leftover at least twice weekly.
- Does not want to cook a complete meal after work.
- Uses Swiggy at least monthly.
- Is comfortable with recommendation and bounded cart assistance.
- Requires explicit approval before money is spent.

### ICP-002 — Initial personas

| ID | Behaviour |
|---|---|
| P-A | Shared-flat hybrid worker with inconsistent cooking and common staples or leftovers |
| P-B | Solo worker who batch-cooks one component and lacks a base, main, side, protein, or volume |
| P-C | Dual-income couple with one prepared component but insufficient dinner for two |
| P-D | Budget- or protein-conscious user who wants only the missing component |

### ICP-003 — Excluded from beta

- No food at home
- No storage or kitchen access
- Families of four or more
- Severe allergies
- Medically controlled diets
- Users seeking autonomous ordering
- Users unwilling to connect a Swiggy account

---

## 4. Goals, non-goals, and kill criteria

### GOAL-001 — Low-effort capture

The user SHOULD describe the home-food state in at most three taps or one short sentence.

### GOAL-002 — One useful completion

The system MUST return one primary recommendation, not a feed.

### GOAL-003 — Minimal purchase

The system SHOULD prefer one missing component over a redundant replacement meal.

### GOAL-004 — Trust

The system MUST show:

- What it believes is at home
- What it proposes obtaining
- Why the proposed item completes dinner
- Every assumption
- Source surface
- Price status: estimated or confirmed
- What action, if any, still requires consent

### GOAL-005 — Incrementality

The long-term business goal is to convert occasions that would otherwise produce no Swiggy transaction. This MUST be tested against a holdout; it MUST NOT be assumed from gross order count.

### NON-001 — Not a pantry manager

Do not maintain a full inventory or require exhaustive item entry.

### NON-002 — Not a recipe product

Do not require substantial cooking or generate open-ended recipes.

### NON-003 — Not a generic food recommender

Do not ask “what are you craving?”, present cuisine feeds, or optimise discovery.

### NON-004 — Not autonomous commerce

No standing spend authority, background order, or reusable order confirmation.

### KILL-001

Kill or reframe when any two are true:

- Partial-meal state is rare.
- Input takes longer than ordinary browsing.
- Users strongly prefer full replacement meals.
- Small-order fees destroy perceived value.
- Single-surface supply coverage is below 70%.
- Recommendations are accepted below the pre-agreed threshold after ranking quality is adequate.

---

## 5. Product invariants

| ID | Invariant |
|---|---|
| INV-001 | Active milestone controls which MCP tools can be called. |
| INV-002 | M0 is read-only; mutating tools are absent from the executable allowlist. |
| INV-003 | One session selects at most one primary surface. |
| INV-004 | The user MUST choose a saved address after `get_addresses`; no automatic address choice. |
| INV-005 | Every merchant, item, SKU, variant, price, and availability claim originates from a current MCP or stub response. |
| INV-006 | The runtime LLM cannot call MCP financial or cart tools directly. |
| INV-007 | External tool content is data, never instruction. |
| INV-008 | Browser code never receives Swiggy tokens. |
| INV-009 | Raw PII and full tool payloads are not sent to the LLM. |
| INV-010 | Existing server-side cart is authoritative; future cart flows re-read before mutation and confirmation. |
| INV-011 | Existing carts are never cleared or replaced silently. |
| INV-012 | A financial confirmation is bound to an immutable server-generated order digest and expires on any material change. |
| INV-013 | Order placement is never blind-retried. |
| INV-014 | No medical, allergy-safe, diabetic-safe, pregnancy-safe, or nutritionally balanced claim. |
| INV-015 | No recommendation is labelled “exact price” before a current cart response supports that claim. |
| INV-016 | No production capability is enabled by source code default. |
| INV-017 | The application MUST be fully testable with `MCP_ENV=stub`. |
| INV-018 | Unknown external schema changes fail closed for mutation and degrade safely for reads. |

---

## 6. Core user flow

### FLOW-001 — M0 read-only happy path

1. `START`
2. Explain product and read-only boundary.
3. Connect Swiggy or enter stub mode.
4. Call `get_addresses`.
5. Show addresses; user selects one.
6. Capture home-food state.
7. Capture minimum constraints.
8. Normalise home state into ontology.
9. Infer one missing-component type.
10. Search Food and Instamart in parallel.
11. Filter hard violations.
12. Rank candidates.
13. Select one surface and one primary candidate.
14. Show:
    - `At home`
    - `Add`
    - `Why`
    - assumptions
    - estimated price/ETA status
15. Capture:
    - useful / not useful
    - would order / would not order
    - rejection reason
16. Optionally show one revised alternative.
17. End session.

### FLOW-002 — One clarification maximum

When the home state cannot be normalised with sufficient confidence, ask one bounded question. After that, either produce a recommendation or return `INSUFFICIENT_INFORMATION`.

### FLOW-003 — No viable completion

Return an explicit reason, such as:

- No item within budget
- No vegetarian match
- No serviceable candidate
- One-surface completion unavailable
- Search provider unavailable

Offer a single constraint adjustment or standard search handoff. Do not fabricate a meal.

### FLOW-004 — Partial provider failure

If one MCP server fails, continue with the other only when it can satisfy the missing-component job. Label the comparison as incomplete.

---

## 7. Product state machine

Canonical state type:

```ts
type ProductState =
  | { name: "BOOT" }
  | { name: "AUTH_REQUIRED" }
  | { name: "AUTHENTICATING" }
  | { name: "ADDRESS_REQUIRED" }
  | { name: "HOME_STATE_REQUIRED"; addressId: string }
  | { name: "CLARIFICATION_REQUIRED"; draft: HomeStateDraft }
  | { name: "SEARCHING"; request: CompletionRequest }
  | { name: "RECOMMENDATION_READY"; recommendation: Recommendation }
  | { name: "NO_MATCH"; reason: NoMatchReason }
  | { name: "FEEDBACK_REQUIRED"; recommendationId: string }
  | { name: "COMPLETE" }
  | { name: "RECOVERABLE_ERROR"; error: PublicError }
  | { name: "FATAL_ERROR"; error: PublicError };
```

Future states, defined but unreachable in M0:

```ts
type CommerceState =
  | { name: "CART_CONSENT_REQUIRED"; plan: CartPlan }
  | { name: "CART_BUILDING"; grantId: string }
  | { name: "CART_REVIEW_REQUIRED"; digest: CartDigest }
  | { name: "ORDER_CONFIRMATION_REQUIRED"; digest: OrderDigest }
  | { name: "ORDER_PLACING"; digest: OrderDigest }
  | { name: "ORDER_AMBIGUOUS"; digest: OrderDigest }
  | { name: "ORDER_SUCCEEDED"; orderId: string }
  | { name: "ORDER_FAILED"; error: PublicError };
```

### Transition rules

| From | Event | Guard | To |
|---|---|---|---|
| `BOOT` | app loaded | connection absent | `AUTH_REQUIRED` |
| `AUTH_REQUIRED` | connect | valid OAuth state | `AUTHENTICATING` |
| `AUTHENTICATING` | success | token server-side | `ADDRESS_REQUIRED` |
| `ADDRESS_REQUIRED` | select address | ID came from current response | `HOME_STATE_REQUIRED` |
| `HOME_STATE_REQUIRED` | submit | valid minimal input | `SEARCHING` or `CLARIFICATION_REQUIRED` |
| `CLARIFICATION_REQUIRED` | answer | one-question budget not exceeded | `SEARCHING` |
| `SEARCHING` | match | valid candidate | `RECOMMENDATION_READY` |
| `SEARCHING` | none | classified reason | `NO_MATCH` |
| `RECOMMENDATION_READY` | give feedback | valid response | `FEEDBACK_REQUIRED` or `COMPLETE` |
| any | auth expired | 401 or `-32001` | `AUTH_REQUIRED` |
| any | retryable read error | retry budget remains | same state |
| any | unsafe/unknown state | none | `FATAL_ERROR` |

M0 code MUST make all commerce transitions impossible by type and policy.

---

## 8. Domain model

### DOM-001 — Home-food ontology

```ts
type HomeComponent =
  | "BASE_RICE"
  | "BASE_ROTI"
  | "BASE_BREAD"
  | "MAIN_DAL"
  | "MAIN_CURRY"
  | "MAIN_PROTEIN"
  | "SIDE_VEGETABLE"
  | "SIDE_CURD"
  | "LEFTOVER_MAIN"
  | "LEFTOVER_SMALL"
  | "BASIC_STAPLES"
  | "NOTHING_USEFUL"
  | "UNKNOWN";
```

### DOM-002 — Missing-component ontology

```ts
type MissingJob =
  | "NEED_BASE"
  | "NEED_MAIN"
  | "NEED_PROTEIN"
  | "NEED_SIDE"
  | "NEED_VOLUME"
  | "NEED_COMPLETE_MEAL"
  | "INSUFFICIENT_INFORMATION";
```

`NEED_COMPLETE_MEAL` is not differentiated; route to standard discovery rather than pretending FMD adds value.

### DOM-003 — Request contract

```ts
interface CompletionRequest {
  sessionId: string;
  addressId: string;
  home: {
    components: HomeComponent[];
    rawText?: string;
    quantityConfidence: "LOW" | "MEDIUM" | "HIGH";
  };
  constraints: {
    servings: 1 | 2;
    diet: "VEGETARIAN" | "MIXED";
    exclusions: string[];
    budgetInr: { min?: number; max: number };
    maxEtaMinutes?: number;
    mealWeight?: "LIGHT" | "REGULAR";
  };
}
```

### DOM-004 — Normalised candidate

```ts
interface Candidate {
  candidateId: string;
  surface: "FOOD" | "INSTAMART";
  merchantId?: string;
  merchantName: string;
  itemId: string;
  variantId?: string;
  displayName: string;
  quantity: number;
  price: {
    amountInr: number;
    status: "ITEM_ESTIMATE" | "CART_CONFIRMED";
  };
  etaMinutes?: number;
  availability: "AVAILABLE" | "UNKNOWN";
  diet: "VEGETARIAN" | "NON_VEGETARIAN" | "UNKNOWN";
  sourceTrace: {
    tool: string;
    responseRef: string;
    observedAt: string;
  };
  semanticTags: string[];
}
```

The client MUST NOT receive raw MCP payloads or opaque tokens. Server-side IDs may be returned only when needed for a subsequent approved action.

### DOM-005 — Recommendation

```ts
interface Recommendation {
  recommendationId: string;
  requestId: string;
  homeSummary: string[];
  missingJob: MissingJob;
  primary: Candidate;
  why: string;
  assumptions: string[];
  comparisonStatus: "BOTH_SURFACES" | "FOOD_ONLY" | "INSTAMART_ONLY";
  confidence: "LOW" | "MEDIUM" | "HIGH";
  rejectedHardConstraints: string[];
}
```

### DOM-006 — Future permission grant

```ts
interface PermissionGrant {
  grantId: string;
  userId: string;
  sessionId: string;
  action: "BUILD_CART" | "REPLACE_CART" | "PLACE_ORDER";
  resourceDigest: string;
  issuedAt: string;
  expiresAt: string;
  consumedAt?: string;
}
```

Permission grants MUST be single-use and server-side.

### DOM-007 — Future order digest

```ts
interface OrderDigestPayload {
  surface: "FOOD" | "INSTAMART";
  addressId: string;
  merchantId: string;
  lines: Array<{
    itemId: string;
    variantId?: string;
    addonIds?: string[];
    quantity: number;
  }>;
  totalInr: number;
  paymentMethod: string;
  cartObservedAt: string;
}
```

The digest is a server-generated cryptographic hash of the canonical payload.

---

## 9. Decision engine

### DEC-001 — Planning boundary

The runtime model MAY:

- Map colloquial food names to the ontology.
- Generate bounded search queries.
- Classify candidate semantic fit.
- Produce a concise explanation from structured facts.

The runtime model MUST NOT:

- Choose whether permission exists.
- Create item or merchant IDs.
- Set authoritative prices.
- Select an address.
- Call cart or checkout tools.
- Decide whether a confirmation remains valid.
- Retry a financial action.
- infer allergen safety.

### DEC-002 — Deterministic fallback

A rule planner MUST support all P0 chip combinations without an LLM.

Example mappings:

| Home state | Missing job | Search concepts |
|---|---|---|
| Rice + curd | `NEED_MAIN` | dal, rajma, chole, curry, protein |
| Dal/curry | `NEED_BASE` | ready roti, rice, paratha |
| Rotis | `NEED_MAIN` | sabzi, paneer curry, chicken curry |
| Small biryani | `NEED_VOLUME` | kebab, raita, side, salad |
| Bread + eggs | `NEED_SIDE` | salad, curd, prepared side |
| Rice + dal | `NEED_SIDE` | vegetable, salad, curd |
| Nothing useful | `NEED_COMPLETE_MEAL` | handoff |

### DEC-003 — Candidate search

- Food and Instamart calls run concurrently.
- Each missing job maps to at most three search queries per surface in M0.
- Pagination is bounded.
- Duplicate candidates are collapsed.
- Search stops when a sufficient candidate pool exists or the action budget is exhausted.

### DEC-004 — Hard filters

Reject candidates that violate:

- Stated vegetarian constraint
- Explicit exclusion
- Budget maximum
- Unavailable/closed state when known
- Unsupported serving requirement
- Missing required current identifiers
- Surface/serviceability mismatch

Unknown diet or availability MUST reduce confidence and cannot be represented as verified.

### DEC-005 — Provisional ranking

```text
score =
  0.35 * meal_fit +
  0.20 * budget_fit +
  0.15 * eta_fit +
  0.10 * reliability_proxy +
  0.10 * minimal_purchase_fit +
  0.10 * stated_preference_fit
```

Rules:

- Each feature is normalised to `[0,1]`.
- Hard filters run before scoring.
- The formula is provisional and MUST be feature-flagged or configurable.
- Ranking must log feature values, not hidden chain-of-thought.
- User-visible explanation uses factual reason codes.

### DEC-006 — One recommendation

Return one primary candidate. On explicit rejection, MAY return one alternative targeted to a reason:

- Too expensive
- Too slow
- Too heavy
- Wrong type
- Not enough food
- Do not trust merchant/item
- Other

Do not expose an infinite list.

---

## 10. Swiggy MCP contract

### MCP-001 — Verified server endpoints

Production:

```text
Food:      https://mcp.swiggy.com/food
Instamart: https://mcp.swiggy.com/im
Dineout:   https://mcp.swiggy.com/dineout   # not used
```

Staging, after onboarding:

```text
Food:      https://mcp-staging.swiggy.com/food
Instamart: https://mcp-staging.swiggy.com/im
```

Authentication base:

```text
GET  https://mcp.swiggy.com/.well-known/oauth-authorization-server
GET  https://mcp.swiggy.com/.well-known/oauth-protected-resource
POST https://mcp.swiggy.com/auth/register
GET  https://mcp.swiggy.com/auth/authorize
POST https://mcp.swiggy.com/auth/token
POST https://mcp.swiggy.com/auth/logout
```

Do not call Swiggy’s internal OTP endpoints.

### MCP-002 — Transport

- Standard MCP over streamable HTTP.
- JSON-RPC tool invocation.
- `Authorization: Bearer <per-user-token>` supplied server-side.
- OAuth 2.1 with PKCE S256.
- No static API key.
- Access token lifetime is currently documented as five days.
- Refresh tokens are not available in v1; re-run authorization on 401.
- User disconnect MUST call logout and delete local token state.

### MCP-003 — Multi-user product constraint

A real-user PWA requires per-user OAuth sessions and Swiggy production onboarding. Do not share a developer’s token across users. Confirm delegated/on-behalf-of onboarding and redirect URI allowlisting with Swiggy before beta.

### MCP-004 — M0 tool allowlist

Food endpoint:

- `get_addresses`
- `search_menu`
- `search_restaurants`
- `get_restaurant_menu`

Instamart endpoint:

- `get_addresses`
- `search_products`
- Optional: `your_go_to_items` only after product approval; it may introduce historical-order data and consent implications.

Support-only:

- `report_error`

All other tools are denied by policy in M0.

### MCP-005 — Address rule

`get_addresses` takes no tool arguments. The system MUST show returned addresses and wait for the user to choose before searching.

### MCP-006 — Food search rule

Current documented `search_menu` input includes:

- `addressId` required
- `query` required
- `restaurantIdOfAddedItem` optional
- `vegFilter` optional
- `offset` optional

The adapter MUST validate against live `tools/list`, because the schema may change.

### MCP-007 — Instamart search rule

Current documented `search_products` input includes:

- `addressId` required
- `query` required
- `offset` optional

Products have variants; `spinId` is the SKU-level identifier used in future cart calls.

### MCP-008 — Future Food cart rules

Not executable in M0.

- Food cart is tied to one restaurant.
- Switching restaurant can flush the cart.
- `update_food_cart` currently documents `restaurantId`, `cartItems`, and `addressId`.
- Call `get_food_cart` immediately after mutation.
- Re-read the cart at every turn boundary involving cart state.
- Do not report a coupon as applied unless an actual discount is present.

### MCP-009 — Future Instamart cart rules

Not executable in M0.

- `update_cart` replaces the entire submitted cart.
- Current tool reference documents `selectedAddressId` and `items`.
- Read the existing cart first.
- Preserve or explicitly replace existing items.
- Address changes can invalidate stock/serviceability.

### MCP-010 — Future order rules

Not executable in M0.

- `place_food_order` and `checkout` are non-idempotent.
- On ambiguous network/5xx response: wait, query current orders, then retry only if no order exists.
- Never reuse an old confirmation after price, item, address, quantity, or payment change.
- Show only payment methods returned by the current cart.
- Current Food recipe documents a ₹1,000 Builders Club cap and COD-only path; runtime cart/tool schemas remain authoritative.

### MCP-011 — Retry rules

| Tool class | Retry |
|---|---|
| Pure read | Exponential backoff with jitter within a 30-second user-facing budget |
| Cart mutation | Future: same-argument retry is documented as safe; still reconcile afterward |
| Order placement | Never blind-retry |
| Auth failure | Re-run OAuth; do not retry with same token |
| Domain failure | Usually terminal; surface reason |
| Unknown schema | Fail closed |

### MCP-012 — Documentation drift

The official compact index, overview counts, recipes, and per-tool pages can temporarily differ. Do not hardcode server tool counts. At build and staging test time:

1. Fetch `llms.txt`.
2. Fetch exact per-tool `.md`.
3. Call `tools/list`.
4. Snapshot the schema.
5. Fail CI or open a drift issue when required fields or tool availability change.

---

## 11. Internal application API

All endpoints are server-side application routes. These are not Swiggy endpoints.

### M0 routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness and dependency status without secrets |
| `GET` | `/api/auth/swiggy/start` | Create PKCE state and redirect |
| `GET` | `/api/auth/swiggy/callback` | Validate state and exchange code |
| `POST` | `/api/auth/swiggy/logout` | Revoke and delete connection |
| `GET` | `/api/addresses` | Fetch current saved addresses |
| `POST` | `/api/completions` | Normalise, search, rank, return one recommendation |
| `POST` | `/api/recommendations/:id/feedback` | Capture fit, intent, and rejection reason |
| `GET` | `/api/session` | Return safe client session state |

### Future routes

| Method | Route | Earliest milestone |
|---|---|---|
| `POST` | `/api/cart/plan` | M1 |
| `POST` | `/api/cart/build` | M1 |
| `GET` | `/api/cart/current` | M1 |
| `POST` | `/api/orders/confirm` | M2 |
| `POST` | `/api/orders/place` | M2 |
| `GET` | `/api/orders/:id` | M2 |

### API requirements

- Request and response schemas live in `packages/contracts`.
- Every write route uses CSRF protection and authenticated server session.
- Every response uses a discriminated result:

```ts
type ApiResult<T> =
  | { ok: true; data: T; traceId: string }
  | { ok: false; error: PublicError; traceId: string };
```

- No raw model or MCP error is returned to the browser.
- Rate-limit and abuse controls apply per internal user and IP.
- Future mutation routes are not registered in M0 builds.

---

## 12. UX contract

### UX-001 — Interface pattern

The main interaction is a guided form, not an open chat.

### UX-002 — Screen set

1. Value proposition / connection
2. Address selection
3. Home-state input
4. Searching/progress
5. Recommendation
6. No-match or service-error state
7. Feedback
8. Privacy and connection settings

### UX-003 — Home-state input

Primary chips:

- Rice
- Rotis
- Dal/curry
- Sabzi
- Eggs
- Bread
- Curd/raita
- Leftovers, not enough
- Other

Secondary inputs:

- One or two people
- Vegetarian or mixed
- Maximum budget
- Light or regular
- Hard exclusions

The first meaningful submission SHOULD require at most three taps for common states.

### UX-004 — Recommendation card

Required sections:

```text
AT HOME
Rice + curd

ADD
Rajma 450 ml — Home Plate

WHY
Adds a main dish to the rice already available.

ASSUMPTION
Rice is sufficient for one person.

STATUS
₹180 item-price estimate · Food · ETA if currently returned
```

### UX-005 — Price language

Allowed:

- “Item-price estimate”
- “Final fees are not available in read-only mode”
- “Cart-confirmed total” only in M1 after a current cart read

Forbidden:

- “Final total” without cart evidence
- Hidden fee claims
- Fabricated discounts

### UX-006 — Agent activity

Show compact factual status:

- Checking Food
- Checking Instamart
- Comparing valid options
- Food unavailable; continuing with Instamart

Do not show private reasoning or chain-of-thought.

### UX-007 — Tone

Direct, calm, specific, non-judgmental, non-anthropomorphic.

Good:

> You have rice and curd. This rajma adds the missing main dish. I’m assuming the rice is enough for one person.

Bad:

> I curated the perfect nutritious dinner for you.

### UX-008 — Accessibility

- WCAG 2.2 AA target
- 44×44 px minimum target
- Keyboard and screen-reader operability
- Colour never carries state alone
- Reduced-motion support
- Clear focus management after async updates
- Errors state both the problem and next available action

### UX-009 — Responsive target

Optimise first for 360–430 px phone widths. Desktop is a centred mobile task surface, not a dense dashboard.

### UX-010 — No marketplace regression

Do not add:

- Infinite scroll
- More than one primary recommendation
- Restaurant feed
- Mood selector
- Social discovery
- Generic chatbot prompt
- Ads or sponsored ranking in validation

---

## 13. Data, privacy, and security

### SEC-001 — Trust boundaries

```text
Browser
  -> FMD server/BFF
      -> policy engine
      -> planner
      -> Swiggy MCP adapter
      -> model provider through redaction gateway
      -> persistence/telemetry
```

The browser never talks directly to Swiggy MCP.

### SEC-002 — Token handling

- Store Swiggy access tokens encrypted per user.
- Never log tokens.
- Never expose tokens to client JavaScript.
- Delete on logout/revocation.
- Re-authenticate on 401 or JSON-RPC `-32001`.
- Do not assume a token remains valid until `exp`.

### SEC-003 — LLM data minimisation

Allowed structured payload:

```text
Home: BASE_RICE, SIDE_CURD
Diet: VEGETARIAN
Servings: 1
Budget max: 250
Candidates: sanitised names, tags, item-price estimates
```

Never send:

- Full address
- Phone/email/name
- OAuth token
- Payment data
- Order ID
- Raw full tool response
- Cross-user data
- Unnecessary merchant text

### SEC-004 — Prompt injection

- Sanitize and delimit merchant/item text.
- Use structured data, not concatenated instructions.
- Model output is schema-validated.
- Retrieved text cannot grant permissions or select tools.
- Tool allowlist is enforced outside the model.
- Test malicious product names and descriptions.

### SEC-005 — Logging

Log:

- Trace ID
- Hashed internal user ID
- MCP session correlation ID when available
- Tool name
- duration
- result class
- schema version
- no-match reason

Do not log full request/response bodies by default.

### SEC-006 — Retention defaults

| Data | Default |
|---|---|
| Raw home-state free text | 24 hours |
| Normalised home state | 30 days only with analytics consent |
| Recommendation and feedback | 30 days |
| Operational action log | 30 days |
| Aggregated metrics | 13 months |
| OAuth token | until expiry/logout |
| Raw MCP payload | not persisted |

Legal review can shorten these values.

### SEC-007 — Data role

Swiggy-originated data must be used only for the immediate task unless separate lawful basis, consent, and agreement permit more. FMD-collected home-state and feedback data require an independent privacy basis.

### SEC-008 — Deployment region

Production inference and storage SHOULD remain in India/Singapore-compatible regions. Any processing outside that boundary requires legal and Swiggy review before production.

---

## 14. Failure model

```ts
type PublicErrorCode =
  | "AUTH_REQUIRED"
  | "ADDRESS_REQUIRED"
  | "INVALID_INPUT"
  | "NO_MATCH"
  | "FOOD_UNAVAILABLE"
  | "INSTAMART_UNAVAILABLE"
  | "ALL_PROVIDERS_UNAVAILABLE"
  | "UPSTREAM_TIMEOUT"
  | "UPSTREAM_ERROR"
  | "SCHEMA_MISMATCH"
  | "RATE_LIMITED"
  | "SESSION_EXPIRED"
  | "UNSAFE_STATE"
  | "INTERNAL_ERROR";
```

### FAIL-001 — Error response rules

Every public error includes:

- Stable code
- Plain-language message
- Whether anything changed
- One safe next action
- Trace ID

Example:

> Instamart did not respond. Nothing was added or ordered. I can show the valid Food option or you can try again.

### FAIL-002 — Retry budget

Read operations may retry with jitter, but the total user-facing retry budget MUST not exceed 30 seconds.

### FAIL-003 — Schema mismatch

- Read path: omit unsupported result and raise telemetry.
- Mutation path: fail closed.
- Never coerce unknown required fields into guessed defaults.

### FAIL-004 — Model unavailable

Use deterministic chip-to-query planning. Free-text input may be temporarily restricted to known synonyms.

---

## 15. Analytics and evaluation

### MET-001 — Active M0 north-star proxy

`Acceptable Completion Rate`:

```text
eligible sessions where user rates primary recommendation useful
-----------------------------------------------------------------
eligible sessions where at least one valid single-surface candidate exists
```

M0 does not measure successful order conversion because it does not place orders.

### MET-002 — M0 metrics

| ID | Metric | Gate/target |
|---|---|---|
| M0-01 | Partial-meal frequency | At least twice weekly for a meaningful target segment |
| M0-02 | Median input time | ≤10 seconds |
| M0-03 | Candidate coverage | ≥70% of eligible sessions |
| M0-04 | Primary recommendation useful | provisional ≥35%; calibrate in research |
| M0-05 | Would-order intent | record, no fabricated revenue projection |
| M0-06 | One-clarification rate | monitor; high rate signals bad ontology |
| M0-07 | p95 recommendation latency | ≤10 seconds |
| M0-08 | Provider/tool failure | <2% after excluding local connectivity |
| M0-09 | Severe safety/privacy incident | 0 |

### MET-003 — Future north star

`Eligible Meal Completion Conversion (EMCC)`:

```text
eligible sessions producing a successful Swiggy order
------------------------------------------------------
eligible sessions where a valid completion exists
```

Future threshold: at least 30% absolute and at least 20% relative uplift versus ordinary discovery, subject to experiment design.

### MET-004 — Event taxonomy

Minimum events:

```text
fmd_session_started
swiggy_connect_started
swiggy_connect_succeeded
address_list_loaded
address_selected
home_state_viewed
home_state_submitted
clarification_asked
search_started
provider_search_succeeded
provider_search_failed
recommendation_generated
recommendation_viewed
recommendation_useful
recommendation_rejected
alternative_requested
session_abandoned
privacy_consent_changed
schema_drift_detected
```

Future commerce events stay undefined in executable analytics until their milestone activates.

### MET-005 — Experiment design

- Treatment: FMD guided completion.
- Control: ordinary discovery handoff using the same stated constraints where feasible.
- Primary analysis unit: eligible dinner session.
- Incrementality requires a holdout; before/after order counts are insufficient.
- Segment by home-state type, city, surface, budget, and prior ordering frequency.
- Never use Swiggy-originated data for optional analytics without the required consent/agreements.

---

## 16. Acceptance test catalogue

### Product tests

| ID | Given | When | Then |
|---|---|---|---|
| AT-001 | Rice + curd, veg, one person | Submit | Missing job is `NEED_MAIN` |
| AT-002 | Dal, no base | Submit | Search includes suitable bases |
| AT-003 | Nothing useful | Submit | Standard discovery handoff; no false differentiation |
| AT-004 | Ambiguous “something light” | Submit | Ask one bounded question |
| AT-005 | Ambiguous after one answer | Continue | Return insufficient information, not another open chat |
| AT-006 | Both surfaces return candidates | Rank | One primary candidate only |
| AT-007 | Food fails, Instamart valid | Search | Show Instamart result and incomplete-comparison label |
| AT-008 | Candidate exceeds budget | Rank | Candidate rejected before display |
| AT-009 | Diet unknown | Display | Do not claim vegetarian suitability |
| AT-010 | Pre-cart result | Display | Price labelled estimate |

### Safety and integration tests

| ID | Test |
|---|---|
| AT-101 | M0 executable allowlist contains no mutation or order tool |
| AT-102 | Browser bundle contains no Swiggy token or client secret |
| AT-103 | Malicious merchant text cannot change tool selection |
| AT-104 | Unknown MCP required field causes contract failure |
| AT-105 | 401 starts re-auth and does not repeat with old token |
| AT-106 | Provider timeout respects total retry budget |
| AT-107 | Logs contain trace metadata but no raw address/token |
| AT-108 | Stub and staging adapters satisfy the same port contract |
| AT-109 | Live tool schema drift creates an actionable failure/issue |
| AT-110 | No real order is possible with default or preview configuration |

### UX tests

| ID | Test |
|---|---|
| AT-201 | Common home state submitted in ≤3 taps |
| AT-202 | Screen-reader announces async recommendation result |
| AT-203 | Keyboard-only flow completes |
| AT-204 | All waiting, empty, no-match, auth, and provider-partial states exist |
| AT-205 | 360 px layout has no horizontal overflow |
| AT-206 | Recommendation card distinguishes home food from ordered component |
| AT-207 | No screen exposes more than one primary recommendation |

---

## 17. Definition of done for M0

M0 is complete only when:

- All `INV-*` tests pass.
- App runs against deterministic local stub.
- Staging adapter contract is implemented or explicitly blocked on access.
- Address selection follows current Swiggy guidance.
- At least the core home-state mappings are covered by tests.
- Food and Instamart search are concurrent and independently fail-safe.
- One recommendation and one feedback flow work on mobile.
- Accessibility checks pass.
- Telemetry and privacy controls are documented and tested.
- A validation study can run without cart or order code.
- GitHub CI is green.
- No real order has been placed.

---

## 18. Open questions

### Product

- How frequent is each partial-meal state?
- Is the dominant value effort reduction, cost reduction, or waste avoidance?
- Is one recommendation sufficient?
- Which home-state categories are commercially viable after delivery fees?
- Does the product create incremental transactions or down-sell full Food orders?

### MCP

- What exact staging auth configuration and redirect URIs will Swiggy issue?
- Does current search output reliably expose ETA, diet, availability, and item price?
- Which response fields are stable enough for ranking?
- Is a documented native handoff/deep-link available?
- What is the current production rate allocation?
- Which payment methods are supported in the target environment at M2?

### Runtime AI

- Is a model needed for P0 beyond free-text normalisation?
- Which inference region and provider satisfy privacy requirements?
- What confidence threshold triggers deterministic fallback?
- What evaluation set best covers Indian food vocabulary and code-switching?

### Legal and operations

- What consent is required for storing normalised home-state history?
- Is a DPA required for the chosen runtime model/provider?
- Who owns agent-error reimbursement in future milestones?
- What support path distinguishes FMD error from merchant fulfilment error?

---

## 19. Source lock

Last manually verified: `2026-06-25`.

Authoritative starting points:

- `https://mcp.swiggy.com/builders/llms.txt`
- `https://mcp.swiggy.com/builders/docs/start/coding-agents.md`
- `https://mcp.swiggy.com/builders/docs/start/authenticate.md`
- `https://mcp.swiggy.com/builders/docs/start/enterprise/delegated-auth.md`
- `https://mcp.swiggy.com/builders/docs/build/recipes/order-food.md`
- `https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries.md`
- `https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-state.md`
- `https://mcp.swiggy.com/builders/docs/build/ship-to-production.md`
- `https://mcp.swiggy.com/builders/docs/reference/errors.md`
- `https://mcp.swiggy.com/builders/docs/operate/access.md`
- `https://mcp.swiggy.com/builders/docs/operate/data-and-compliance.md`
- `https://mcp.swiggy.com/builders/docs/operate/versioning.md`
- `https://mcp.swiggy.com/builders/docs/operate/rate-limits.md`

Never treat the verification date as a substitute for fetching current docs.
