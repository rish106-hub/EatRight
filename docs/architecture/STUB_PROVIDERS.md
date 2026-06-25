# Stub Providers

`@finish-my-dinner/providers-stub` supplies deterministic, read-only Food and
Instamart adapters for `M0_READ_ONLY_VALIDATION`. It implements the provider
ports exported by `@finish-my-dinner/contracts` and returns only normalized
`ReadOnlyCandidate`, provider health, serviceability, provider failure, and
recommendation/no-match shapes that validate against shared contracts.

The package is provider-neutral. It does not encode live Swiggy endpoint names,
parameters, SKU fields, prices, availability contracts, MCP schemas, OAuth, cart
state, checkout, payment, or order data.

## Scenario Catalogue

The exported `STUB_SCENARIO_IDS` cover:

- `rice_curd_food_main`: rice + curd returns a Food main candidate.
- `rice_curd_instamart_main`: rice + curd returns an Instamart ready-to-eat main.
- `dal_base`: dal returns ready rotis or microwave rice.
- `rotis_main`: rotis return curry or sabzi.
- `insufficient_biryani_volume`: small biryani returns a side/volume complement.
- `food_only`: only Food has a valid candidate.
- `instamart_only`: only Instamart has a valid candidate.
- `both_provider`: both providers have valid candidates.
- `food_failure_instamart_success`: Food fails, Instamart still succeeds.
- `instamart_failure_food_success`: Instamart fails, Food still succeeds.
- `both_provider_failure`: both provider searches fail.
- `no_valid_completion`: no candidate completes dinner.
- `unserviceable`: selected stub address is not serviceable.
- `over_budget_filtered`: candidate is filtered by budget.
- `dietary_violation_filtered`: candidate is filtered by vegetarian constraint.
- `deterministic_repeated_output`: fixed seed and scenario produce identical output.

## Determinism

`runStubScenario(scenario, { seed })` and `createStubProviders({ scenario,
seed })` use static fixtures, a fixed observation timestamp, deterministic IDs,
and deterministic ordering. Same seed and scenario produce byte-for-byte equal
results. No current time, randomness, filesystem state, external user data, or
network response affects output.

## Failure And Latency Injection

`createStubProviders` accepts:

- `latencyMs`: number or per-provider latency map.
- `failures`: per-provider structured failure reason, retryability, and message.
- `serviceability`: per-provider `SERVICEABLE`, `NOT_SERVICEABLE`, or `UNKNOWN`.
- `health`: explicit provider health override.

Failures return `ProviderSearchResult` with `status: "FAILURE"`. Latency uses a
local timer only; it never performs IO.

## Planner Consumption

Future planner/domain code can use `FoodCandidateSearchPort`,
`InstamartCandidateSearchPort`, `ProviderHealthPort`, and
`StubServiceabilityAdapter` exactly as it would use a real adapter boundary.
The planner should search both surfaces, apply hard filters and ranking, then
select one primary candidate. `runStubScenario` exists for validation tests and
fixtures; production planner code should depend on the ports, not scenario
internals.

## Future Real Adapter Replacement

Real MCP adapters must replace this package behind the same shared-contract
ports. Before writing or enabling those adapters, the implementation must fetch
current Swiggy reference pages and inspect live `tools/list` in the target
environment. Real adapters must map verified read-only tool output into
`ReadOnlyCandidate` and drop raw MCP payloads before returning to planner, API,
or UI layers.

## Production Commerce Prohibition

This package must never make production commerce calls. It must not authenticate
with Swiggy, connect to MCP, call HTTP, read or mutate carts, apply coupons,
checkout, pay, place orders, track orders, store tokens, store addresses, or
expose raw provider payloads.

Real Swiggy mutation/order executed: NO.
