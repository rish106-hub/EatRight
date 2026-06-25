# Swiggy MCP Contracts

Last verified: **25 June 2026**

This file is a compact integration map, not a substitute for current Swiggy documentation.

## 1. Source precedence

When sources disagree:

1. Live `tools/list` in the target environment
2. Current per-tool reference page
3. Current recipe page
4. `llms.txt`
5. This file

Observed reason for this rule: official indexes, recipes, and reference pages can temporarily disagree on tool counts or example argument shapes. Never hardcode tool counts.

## 2. Authoritative documentation

```text
Index:     https://mcp.swiggy.com/builders/llms.txt
Full text: https://mcp.swiggy.com/builders/llms-full.txt
Per page:  append .md to a docs URL
```

Required reading by area:

```text
Auth:
https://mcp.swiggy.com/builders/docs/start/authenticate.md

Multi-user delegated auth:
https://mcp.swiggy.com/builders/docs/start/enterprise/delegated-auth.md

Coding agents:
https://mcp.swiggy.com/builders/docs/start/coding-agents.md

Food recipe:
https://mcp.swiggy.com/builders/docs/build/recipes/order-food.md

Instamart recipe:
https://mcp.swiggy.com/builders/docs/build/recipes/order-groceries.md

Multi-turn state:
https://mcp.swiggy.com/builders/docs/build/agent-patterns/multi-turn-state.md

Production:
https://mcp.swiggy.com/builders/docs/build/ship-to-production.md

Errors:
https://mcp.swiggy.com/builders/docs/reference/errors.md
```

## 3. Server endpoints

### Production

```text
https://mcp.swiggy.com/food
https://mcp.swiggy.com/im
https://mcp.swiggy.com/dineout
```

Finish My Dinner uses Food and Instamart only.

### Staging after onboarding

```text
https://mcp-staging.swiggy.com/food
https://mcp-staging.swiggy.com/im
```

Confirm staging OAuth base and credentials/allowlisting during onboarding rather than assuming production auth settings.

### OAuth

```text
GET  https://mcp.swiggy.com/.well-known/oauth-authorization-server
GET  https://mcp.swiggy.com/.well-known/oauth-protected-resource
POST https://mcp.swiggy.com/auth/register
GET  https://mcp.swiggy.com/auth/authorize
POST https://mcp.swiggy.com/auth/token
POST https://mcp.swiggy.com/auth/logout
```

Do not call `/auth/send-otp` or `/auth/verify-otp`; they are internal.

## 4. Auth facts

- OAuth 2.1 with PKCE S256
- Dynamic Client Registration supported
- Broad v1 scope: `mcp:tools`; fine-grained read/write scopes are not enforced
- Access token: documented as 5 days
- User session: documented as 30-day idle sliding session
- No refresh token in v1; re-run authorization on 401
- Multi-user products require per-user tokens; never share a developer token
- Redirect URIs require exact allowlisting; HTTPS except localhost

## 5. Active M0 tool allowlist

### Food

| Tool | Use | Mutating? |
|---|---|---|
| `get_addresses` | Retrieve saved addresses | No |
| `search_menu` | Search dish/menu items | No |
| `search_restaurants` | Restaurant fallback/discovery | No |
| `get_restaurant_menu` | Validate/browse menu | No |
| `report_error` | Diagnostic handoff | No commerce mutation |

### Instamart

| Tool | Use | Mutating? |
|---|---|---|
| `get_addresses` | Retrieve saved addresses | No |
| `search_products` | Search products/variants | No |
| `your_go_to_items` | Optional future read; requires product/privacy decision | No |
| `report_error` | Diagnostic handoff | No commerce mutation |

M0 policy must deny every cart and order tool even if the server advertises it.

## 6. Current relevant input notes

These are implementation hints only. Validate live.

### `get_addresses`

- No arguments.
- Show list and wait for user selection.
- Returned addresses omit coordinates.

### `search_menu`

Current reference documents:

```text
addressId                string  required
query                    string  required
restaurantIdOfAddedItem  string  optional
vegFilter                number  optional, 1 means veg-only
offset                   number  optional
```

Notes:

- Each item has either legacy variations or `variantsV2`, never both.
- Add-ons can depend on selected variant.
- Do not add automatically after search.

### `search_products`

Current reference documents:

```text
addressId  string  required
query      string  required
offset     number  optional
```

Variants carry `spinId`, the SKU identifier for future cart use.

### Future `update_food_cart`

Current per-tool reference documents:

```text
restaurantId   string    required
cartItems      object[]  required
addressId      string    required
restaurantName string    optional
```

Call `get_food_cart` immediately afterward. Use the live item customization format.

### Future `update_cart`

Current per-tool reference documents:

```text
selectedAddressId string    required
items             object[]  required
```

It replaces the submitted Instamart cart. Read and preserve existing state first.

### Future `place_food_order`

Current per-tool reference documents:

```text
addressId     string  required
paymentMethod string  optional; use current cart methods
```

### Future `get_food_orders`

Current reference documents:

```text
addressId  string  required
orderCount number  optional
```

Use after ambiguous order placement.

## 7. Retry policy

| Class | Policy |
|---|---|
| Reads | Retry transient 5xx/timeouts with exponential backoff and jitter |
| Cart mutations | Future: same-argument retry is documented as safe; reconcile afterward |
| Order placement | Never blind-retry |
| Auth | On 401/`-32001`, reauthorize; never repeat with same token |
| Domain failure | Usually terminal; explain to user |
| Unknown schema | Fail closed |
| 429 | Planned; honor `Retry-After` when present |

User-facing retry budget: maximum 30 seconds.

## 8. Cart and order facts for future phases

- Carts are server-side and session-bound.
- Always read current cart at the start of a cart-affecting turn.
- Food cart is tied to one restaurant; switching can flush it.
- Instamart stock/serviceability is address-sensitive.
- Food and Instamart carts/orders are independent.
- Order placement tools are non-idempotent.
- Cancellation tools are not currently exposed in the documented flow.
- Do not cache cart contents as authority.

## 9. Data and logging

- Treat tool arguments and responses as PII.
- Log correlation/session ID and metadata, not plaintext full payloads.
- Swiggy-originated data is for the immediate task unless separate consent/agreement exists.
- Processing outside India/Singapore requires review and potentially a DPA.
- Browser must never receive the access token.

## 10. Drift verification checklist

For every integration PR:

- [ ] Fetch `llms.txt`.
- [ ] Fetch each affected per-tool `.md`.
- [ ] Record verification date.
- [ ] Inspect target environment `tools/list`.
- [ ] Validate required arguments.
- [ ] Update redacted schema snapshot if approved.
- [ ] Run malformed/missing-field tests.
- [ ] Confirm no production mutation or real order occurred.
