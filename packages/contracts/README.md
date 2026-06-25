# @finish-my-dinner/contracts

Provider-neutral TypeScript and Zod contracts for Finish My Dinner.

The package is the canonical runtime validation layer for M0 read-only
validation. It contains no Swiggy OAuth, live MCP transport, cart, checkout,
payment, or order capability.

## Public exports

- `ontology`: home-food and missing-component enums plus deterministic P0
  inference helpers.
- `request`: completion request, home-state, constraints, and budget schemas.
- `candidate`: normalized provider-neutral candidate schemas.
- `recommendation`: read-only recommendation, explanation, assumption, search
  result, and no-match schemas.
- `provider`: provider-neutral read-only search, normalization, serviceability,
  health, and failure interfaces.
- `state`: M0 product state union.
- `errors`: structured public errors.
- `api`: `ApiResult` helpers and completion route contracts.
- `analytics`: safe M0 event names and payload schemas.
- `capabilities`: read-only capability declaration.
- `feedback`: recommendation feedback schemas.
- `fixtures`: representative deterministic fixtures for consumers and tests.

All exported Zod objects are strict at trust boundaries so unknown values and
future commerce fields fail validation unless this package explicitly supports
them.
