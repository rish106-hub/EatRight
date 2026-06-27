# Finish My Dinner

**Finish My Dinner** is a mobile-first PWA prototype for a specific dinner problem: the user already has part of a meal at home, but not enough to make dinner feel complete.

Instead of opening a food marketplace and starting from restaurants, cuisines, or cravings, the product starts from the user's home-food state and recommends the smallest useful missing component from **Swiggy Food** or **Swiggy Instamart**.

> Product thesis: complete the plate, do not replace the meal.

## Current Stage

| Area | Status |
| --- | --- |
| Product maturity | Pre-validation |
| Active milestone | `M0_READ_ONLY_VALIDATION` |
| Product surface | Mobile-first PWA |
| Commerce capability | Read-only discovery only |
| Runtime data source | Local deterministic MCP stub |
| Real cart/order actions | Not allowed |

The current milestone exists to validate whether the partial-meal problem is frequent, painful, and commercially meaningful before introducing cart mutation, checkout, payment, or live ordering risk.

## Problem

Weekday dinner decisions often happen when attention is lowest. A target user may already have rice, dal, rotis, eggs, bread, leftovers, curd, snacks, or one cooked component at home, but still lack a satisfactory dinner.

The default alternatives are weak:

- Eat an incomplete meal.
- Order a full replacement meal and waste what is already available.
- Browse Swiggy manually for a complement.
- Overthink whether to cook, order, snack, or defer dinner.

The product problem is not generic food discovery. It is **low-effort routine dinner completion**.

## Target User

Initial ICP:

- 22-32-year-old corporate workers in Bangalore, Hyderabad, Pune, Gurugram, or Noida.
- Single, PG, shared-flat, hybrid, or early-career professionals.
- Eats dinner at home or semi-at-home on weekdays.
- Often has one usable food component but not a complete meal.
- Uses Swiggy and is comfortable with bounded, explicit-assent commerce.

Excluded from the first validation:

- Families of four or more.
- Severe allergies or medically controlled diets.
- Users seeking autonomous ordering.
- Users with no food at home.
- Users unwilling to connect or simulate a Swiggy account.

## Product Hypothesis

Users with a partial dinner state will convert more often when Swiggy recommends one compatible missing component than when they are sent into standard marketplace discovery.

The recommendation must explain:

- What the user already has.
- What is missing.
- What to obtain.
- Why the proposed item completes dinner.
- Which surface is being used: Food or Instamart.
- What assumptions were made.

## Core Experience

1. User opens the PWA after work.
2. User selects or describes what is already available at home.
3. System searches Food and Instamart through read-only provider ports.
4. System returns one primary recommendation.
5. User gives fit feedback.
6. No cart, checkout, payment, or order action occurs in M0.

Example outcomes:

| At home | Recommended complement | Surface |
| --- | --- | --- |
| Rice and curd | Rajma or chole | Swiggy Food |
| Dal | Ready rotis and salad | Instamart |
| Leftover biryani, not enough | Kebab side | Swiggy Food |
| Bread and eggs | Ready soup or protein side | Instamart |

## Validation Gates

The product should continue only if the read-only study shows:

| Gate | Target |
| --- | --- |
| Partial-meal frequency | Meaningful target users report this state at least twice weekly |
| Input effort | Median home-state input time is at most 10 seconds |
| Supply coverage | At least 70% of eligible sessions produce one acceptable single-surface complement |
| Recommendation fit | Users understand and accept the proposed completion |

The thesis should be killed or materially reframed if partial-meal states are rare, input takes longer than browsing, users prefer full replacement meals, or Food/Instamart supply cannot cover enough cases.

## Success Metrics

Primary:

- Eligible meal-completion conversion.
- Recommendation acceptance rate.
- Median time from home-state input to recommendation.
- Browse-to-feedback completion rate.
- Seven-day repeat intent.

Guardrails:

- No real cart mutation in M0.
- No checkout or payment action in M0.
- No medical, allergy, or nutrition suitability claims.
- No raw addresses, tokens, payment data, or full provider payloads in model context.
- No invented Swiggy tools, fields, prices, merchants, or availability states.

## Why Swiggy Could Care

Finish My Dinner targets incremental dinner occasions that may otherwise produce no Swiggy transaction: leftovers, snacks, reluctant cooking, tiffin consideration, or app abandonment.

If validated, the opportunity is not more app engagement for its own sake. It is higher routine dinner conversion, lower decision fatigue, better Food/Instamart orchestration, and stronger retention among frequent weekday users.

## What This Is Not

- Not a pantry manager.
- Not a recipe app.
- Not a generic food recommender.
- Not a restaurant-discovery feed.
- Not an autonomous ordering agent.
- Not a nutrition, allergy, or medical advice product.
- Not a unified Food + Instamart checkout in M0.

## Current Implementation

This repository contains:

- A pnpm TypeScript workspace.
- A Next.js mobile-first PWA shell.
- Shared Zod contracts for UI/API boundaries.
- A deterministic planner package.
- Local provider stubs for Food and Instamart-like discovery.
- Read-only API orchestration for meal-completion recommendations.
- Runtime capability checks that fail closed on unsafe configurations.

Tracked public documents are intentionally limited to the product contract, agent contract, architecture summary, UI specification, and package-level README files.

## Repository Layout

```text
apps/
  web/                 Next.js PWA and read-only API routes
packages/
  contracts/           Shared request, response, state, and feedback schemas
  planner/             Deterministic meal-completion planner
  providers-stub/      Local deterministic provider data and adapters
docs/
  ARCHITECTURE.md      Public architecture summary
  design/UI_SPEC.md    Product UI specification
```

## Local Setup

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Run all checks:

```bash
pnpm check
```

Start the web app:

```bash
pnpm --filter @finish-my-dinner/web dev
```

Default local runtime is intentionally safe:

```text
APP_ENV=local
MCP_ENV=stub
CAPABILITY_LEVEL=read_only
ALLOW_REAL_SWIGGY_MUTATIONS=false
ALLOW_REAL_SWIGGY_ORDERS=false
```

## Safety Model

The active milestone is read-only. The app must run against the local deterministic stub unless a later approved milestone explicitly enables staging integration.

M0 forbids:

- Cart mutation.
- Checkout.
- Order placement.
- Coupon application.
- Payment actions.
- Production Swiggy mutation tests.

Any future live Swiggy integration must validate current official Swiggy MCP references and live `tools/list` schemas before implementation.

## Source Brief

This README is aligned with the product brief and working PRD captured in the accompanying Google Doc:

<https://docs.google.com/document/d/1d8_zIcFOR1q8z7fIcP222Gq_Qpjs8BDlQ7scWIfnmUw/edit?usp=sharing>

The repository contract remains governed by `AI_PRD.md` and the safety invariants in `AGENTS.md`.
