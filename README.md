# Finish My Dinner

**Finish My Dinner** is a product prototype for one recurring weekday problem: people often have *some* food at home, but not a complete dinner.

The product does not ask, "What are you craving?" It asks, "What do you already have, and what is the smallest useful thing Swiggy can add to complete dinner?"

## One-Line Thesis

Swiggy can win more routine weekday dinners by completing the food users already have at home, instead of always selling a full replacement meal.

## The Problem

For many young working professionals, dinner is not a high-intent discovery moment. It is a low-attention recovery moment after office, commute, gym, chores, or late calls.

The user often has a partial meal:

- Rice but no curry.
- Dal but no rotis.
- Leftover biryani, but not enough.
- Eggs and bread, but no side.
- Curd, snacks, or staples, but no satisfying dinner.

At that point, the user does not want a full marketplace session. They want dinner to become obvious.

Current options create avoidable friction:

| User option | Why it fails |
| --- | --- |
| Eat the incomplete meal | Low satisfaction, low nutrition confidence, feels like compromise |
| Order a full meal | Higher spend, food waste, duplicates what is already at home |
| Browse Swiggy manually | Too many choices when attention is lowest |
| Search recipes | Assumes cooking energy and ingredients |
| Use tiffins or fixed meal plans | Solves planning, but removes flexibility |

The unmet need is **dependable, low-effort dinner completion**.

## Locked Product Bet

Finish My Dinner starts from the user's home-food state and recommends **one** missing complement from either Swiggy Food or Instamart.

It should feel less like browsing restaurants and more like completing a plate.

Examples:

| At home | Missing job | Recommendation |
| --- | --- | --- |
| Rice and curd | Add a warm main | Rajma or chole from Food |
| Dal | Add a base and freshness | Ready rotis plus salad from Instamart |
| Leftover biryani | Increase quantity without replacing meal | Kebab side from Food |
| Bread and eggs | Make it dinner, not breakfast | Soup or protein side from Instamart |
| Nothing useful | Exit partial-meal mode | Recommend standard dinner flow instead |

The product should return a completed dinner assembly, not a feed, recipe list, or generic recommendation carousel.

## Target User

Primary ICP:

- 22-32-year-old corporate workers.
- Lives in Bangalore, Hyderabad, Pune, Gurugram, or Noida.
- Single, PG, shared-flat, hybrid, or early-career professional.
- Uses Swiggy at least monthly.
- Often has staples, leftovers, or one cooked component at home.
- Wants dinner with minimal effort, cost, and waste.

Primary decision window:

- Weekdays after work, roughly 7:30-10:00 p.m.
- User is hungry, tired, and wants an acceptable outcome quickly.

Why this cohort:

- Dinner is frequent.
- Decision fatigue is real.
- Swiggy usage is familiar.
- Partial-meal states are plausible.
- Incremental order upside exists if the product converts "I will manage somehow" into "I need only this one thing."

## Why This Is Not Generic Food Discovery

Generic discovery starts from supply:

1. Restaurants.
2. Dishes.
3. Offers.
4. Ratings.
5. Delivery time.
6. Price.

Finish My Dinner starts from demand context:

1. What is already at home?
2. What is missing from a complete dinner?
3. Can one Food or Instamart item solve that gap?
4. Is the complement worth buying?

That shift matters. The user is not asking for variety. They are trying to avoid another full dinner decision.

## Product Principles

1. **Start with home state**
   The first input must be what the user already has, not cuisine or restaurant preference.

2. **Recommend one primary commerce surface**
   A session should choose Food or Instamart as the primary answer. Dual-surface complexity is out of scope for the current milestone.

3. **Buy the minimum useful addition**
   Prefer one complement over a full replacement meal when the partial meal is viable.

4. **Make assumptions visible**
   The user should see what the system believes is at home, what it thinks is missing, and why the recommendation works.

5. **Stay read-only during validation**
   The current product proves recommendation fit before introducing cart, checkout, payment, or ordering risk.

## MVP Experience

1. User opens Finish My Dinner.
2. User selects a quick home-state chip or enters one short sentence.
3. Product identifies the likely dinner gap.
4. Product searches Food and Instamart through local deterministic provider stubs.
5. Product recommends one complement.
6. User gives feedback: useful, not useful, wrong assumption, too expensive, too slow, or already have it.

Current milestone does **not** place orders.

## What We Need To Prove

This product is worth building only if the partial-meal state is frequent and solvable.

Validation gates:

| Question | Pass signal |
| --- | --- |
| Does this state happen often enough? | Meaningful target users report partial dinner at least twice weekly |
| Can users describe home food quickly? | Median input time at most 10 seconds |
| Can Swiggy supply solve it? | At least 70% of eligible sessions produce one acceptable single-surface complement |
| Does recommendation reduce effort? | Users prefer the recommendation over manual browsing for eligible cases |

Kill or reframe if:

- Most users rarely have partial meals.
- Input feels like pantry management.
- Users still prefer full replacement meals.
- Good complements are unavailable or uneconomical.
- Price, ETA, or supply issues explain most abandonment.

## Business Case For Swiggy

This is a conversion and frequency bet, not an engagement gimmick.

If validated, Finish My Dinner can:

- Convert low-intent leftover/snack occasions into Swiggy transactions.
- Increase weekday dinner frequency without requiring full-meal replacement.
- Create a natural Food and Instamart bridge around a user outcome.
- Reduce browse-exit-reopen loops by narrowing the decision.
- Improve trust in agentic commerce through bounded, explicit recommendations.

North-star direction:

> Eligible partial-meal sessions converted into a completed dinner decision within 60 seconds.

Supporting metrics:

- Recommendation acceptance rate.
- Median input-to-recommendation time.
- Search success rate.
- Seven-day repeat intent.
- Incremental order intent versus manual discovery.
- Reasons for rejection: price, ETA, assumption, taste fit, unavailable supply.

## Competitive Boundary

Finish My Dinner is intentionally not:

- A recipe generator like pantry-to-recipe apps.
- A standard restaurant recommender.
- A meal subscription.
- A calorie, allergy, or medical suitability product.
- A pantry inventory manager.
- A fully autonomous shopping agent.

The wedge is narrower: **complete tonight's partial dinner with one useful purchase**.

## Current Build Scope

Active milestone: `M0_READ_ONLY_VALIDATION`

Allowed:

- Local deterministic MCP stub.
- Home-state capture.
- Food and Instamart-like search through provider ports.
- One primary recommendation.
- Fit and intent feedback.

Forbidden:

- Cart mutation.
- Checkout.
- Order placement.
- Coupon application.
- Payment actions.
- Production Swiggy mutation tests.

This protects the product from building commerce risk before proving the user problem.

## Implementation Snapshot

The repository currently contains:

- Next.js mobile-first PWA shell.
- TypeScript monorepo with pnpm.
- Shared Zod contracts for UI/API boundaries.
- Deterministic planner package.
- Local provider stubs.
- Read-only API route for meal-completion recommendations.
- Capability checks that fail closed outside read-only mode.

```text
apps/
  web/                 PWA and read-only API routes
packages/
  contracts/           Shared schemas and state contracts
  planner/             Deterministic meal-completion planner
  providers-stub/      Local deterministic provider data
docs/
  ARCHITECTURE.md      Public architecture summary
  design/UI_SPEC.md    Product UI specification
```

## Run Locally

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm --filter @finish-my-dinner/web dev
```

Safe local defaults:

```text
APP_ENV=local
MCP_ENV=stub
CAPABILITY_LEVEL=read_only
ALLOW_REAL_SWIGGY_MUTATIONS=false
ALLOW_REAL_SWIGGY_ORDERS=false
```

## Source Brief

This README reflects the product direction captured in the working Google Doc:

<https://docs.google.com/document/d/1d8_zIcFOR1q8z7fIcP222Gq_Qpjs8BDlQ7scWIfnmUw/edit?usp=sharing>

Repository behavior remains governed by `AI_PRD.md` and the safety invariants in `AGENTS.md`.
