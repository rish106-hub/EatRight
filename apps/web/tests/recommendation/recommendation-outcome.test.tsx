import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { plannerOutcomeSchema } from "@finish-my-dinner/planner";
import { RecommendationOutcome } from "../../src/features/recommendation/RecommendationOutcome";
import {
  FIXTURE_RECOMMENDATION_READY,
  FIXTURE_RECOMMENDATION_READY_ONE_PROVIDER_FAILED,
  FIXTURE_RECOMMENDATION_READY_INSTAMART,
  FIXTURE_NO_VALID_COMPLETION,
  FIXTURE_INSUFFICIENT_INFORMATION,
  FIXTURE_NO_PURCHASE_REQUIRED,
  FIXTURE_UNSERVICEABLE,
  FIXTURE_BOTH_PROVIDERS_FAILED,
  FIXTURE_STANDARD_SWIGGY_HANDOFF,
  ALL_OUTCOME_FIXTURES,
} from "../../src/features/recommendation/fixtures";

function noop() {}

const defaultCallbacks = {
  onStartOver: noop,
  onCorrectInput: noop,
};

// ── 1. Single recommendation ────────────────────────────────────────────────

describe("RECOMMENDATION_READY", () => {
  it("renders one and only one primary recommendation", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_RECOMMENDATION_READY}
        {...defaultCallbacks}
      />,
    );
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(1);
  });

  // ── 2. AT HOME and ADD present and semantically distinct ────────────────

  it("shows At home and Add sections with distinct labels", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_RECOMMENDATION_READY}
        {...defaultCallbacks}
      />,
    );
    expect(
      screen.getByText(/at home/i, { selector: ".rec-section__label" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/^add$/i, { selector: ".rec-section__label" }),
    ).toBeInTheDocument();

    // The Add section has an elevated background class
    const addSection = screen
      .getByText(/^add$/i, { selector: ".rec-section__label" })
      .closest(".rec-section--add");
    expect(addSection).not.toBeNull();

    // At home section does NOT have the elevated class
    const atHomeSection = screen
      .getByText(/at home/i, { selector: ".rec-section__label" })
      .closest(".rec-section--at-home");
    expect(atHomeSection).not.toBeNull();
    expect(atHomeSection).not.toHaveClass("rec-section--add");
  });

  // ── 3. Estimated price is labelled ──────────────────────────────────────

  it("labels price as Estimated", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_RECOMMENDATION_READY}
        {...defaultCallbacks}
      />,
    );
    const estimateTags = screen.getAllByText(/estimated/i);
    const priceTag = estimateTags.find((el) =>
      el.getAttribute("aria-label")?.toLowerCase().includes("price"),
    );
    expect(priceTag).toBeDefined();
  });

  // ── 4. ETA labelled as estimated when present ────────────────────────────

  it("labels ETA as estimated when present", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_RECOMMENDATION_READY}
        {...defaultCallbacks}
      />,
    );
    const etaTag = screen
      .getAllByText(/estimated/i)
      .find((el) =>
        el.getAttribute("aria-label")?.toLowerCase().includes("delivery"),
      );
    expect(etaTag).toBeDefined();
  });

  // ── 5. No confirmed total ────────────────────────────────────────────────

  it("shows no confirmed total", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_RECOMMENDATION_READY}
        {...defaultCallbacks}
      />,
    );
    expect(screen.queryByText(/final total/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/confirmed price/i)).not.toBeInTheDocument();
  });

  // ── 6. Assumptions rendered only when supplied ───────────────────────────

  it("renders assumptions when present", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_RECOMMENDATION_READY}
        {...defaultCallbacks}
      />,
    );
    expect(
      screen.getByText(/rice is enough for one person/i),
    ).toBeInTheDocument();
  });

  it("renders no assumption list when assumptions are empty", () => {
    if (FIXTURE_RECOMMENDATION_READY.status !== "RECOMMENDATION_READY") return;
    const outcomeNoAssumptions = plannerOutcomeSchema.parse({
      ...FIXTURE_RECOMMENDATION_READY,
      recommendation: {
        ...FIXTURE_RECOMMENDATION_READY.recommendation,
        assumptions: [],
      },
    });
    render(
      <RecommendationOutcome
        outcome={outcomeNoAssumptions}
        {...defaultCallbacks}
      />,
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  // ── 7. One-provider failure disclosed safely ─────────────────────────────

  it("discloses one-provider failure without exposing internal details", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_RECOMMENDATION_READY_ONE_PROVIDER_FAILED}
        {...defaultCallbacks}
      />,
    );
    expect(
      screen.getByText(/instamart results were unavailable/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/upstream_error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/timeout/i)).not.toBeInTheDocument();
  });

  // ── 8. Why this option? is keyboard accessible ──────────────────────────

  it("Why this option disclosure is keyboard accessible via details/summary", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_RECOMMENDATION_READY}
        {...defaultCallbacks}
      />,
    );
    const summary = screen.getByText(/see how it was assessed/i);
    expect(summary.tagName.toLowerCase()).toBe("summary");
    const details = summary.closest("details");
    expect(details).not.toBeNull();
  });

  // ── 16. No commerce affordances ─────────────────────────────────────────

  it("contains no cart, checkout, order or payment affordances", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_RECOMMENDATION_READY}
        {...defaultCallbacks}
      />,
    );
    const forbidden =
      /add to cart|checkout|place order|pay now|payment|coupon|order now|tracking|cancel/i;
    const buttons = screen.queryAllByRole("button");
    for (const btn of buttons) {
      expect(btn.textContent).not.toMatch(forbidden);
    }
  });

  // ── 17. Long names wrap ──────────────────────────────────────────────────

  it("renders a very long item name without truncation element", () => {
    if (FIXTURE_RECOMMENDATION_READY.status !== "RECOMMENDATION_READY") return;
    const longName = "A".repeat(80) + " Extra Long Item Name";
    const longOutcome = plannerOutcomeSchema.parse({
      ...FIXTURE_RECOMMENDATION_READY,
      selectedCandidate: {
        ...FIXTURE_RECOMMENDATION_READY.selectedCandidate,
        displayName: longName,
      },
      recommendation: {
        ...FIXTURE_RECOMMENDATION_READY.recommendation,
        primary: {
          ...FIXTURE_RECOMMENDATION_READY.recommendation.primary,
          displayName: longName,
        },
      },
    });
    render(
      <RecommendationOutcome outcome={longOutcome} {...defaultCallbacks} />,
    );
    expect(screen.getByText(longName)).toBeInTheDocument();
  });

  // ── 18. Accessible names and landmarks ──────────────────────────────────

  it("has a heading and landmark for the recommendation", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_RECOMMENDATION_READY}
        {...defaultCallbacks}
      />,
    );
    expect(
      screen.getByRole("heading", { name: /here.s what to add/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: /dinner recommendation/i }),
    ).toBeInTheDocument();
  });

  // ── 19. Components use planner types ─────────────────────────────────────

  it("renders Instamart surface badge when provider is INSTAMART", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_RECOMMENDATION_READY_INSTAMART}
        {...defaultCallbacks}
      />,
    );
    expect(
      screen.getByText(/instamart/i, { selector: ".rec-badge" }),
    ).toBeInTheDocument();
  });

  // Callback tests
  it("calls onStartOver when Start over is clicked", async () => {
    const user = userEvent.setup();
    const onStartOver = vi.fn();
    render(
      <RecommendationOutcome
        outcome={FIXTURE_RECOMMENDATION_READY}
        onStartOver={onStartOver}
        onCorrectInput={noop}
      />,
    );
    await user.click(screen.getByRole("button", { name: /start over/i }));
    expect(onStartOver).toHaveBeenCalledOnce();
  });

  it("calls onCorrectInput when Correct input is clicked", async () => {
    const user = userEvent.setup();
    const onCorrectInput = vi.fn();
    render(
      <RecommendationOutcome
        outcome={FIXTURE_RECOMMENDATION_READY}
        onStartOver={noop}
        onCorrectInput={onCorrectInput}
      />,
    );
    await user.click(screen.getByRole("button", { name: /correct input/i }));
    expect(onCorrectInput).toHaveBeenCalledOnce();
  });
});

// ── 9. NO_VALID_COMPLETION ───────────────────────────────────────────────────

describe("NO_VALID_COMPLETION", () => {
  it("renders a recovery action (start over or correct input)", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_NO_VALID_COMPLETION}
        {...defaultCallbacks}
      />,
    );
    const buttons = screen.getAllByRole("button");
    const hasRecovery = buttons.some((b) =>
      /start over|correct input/i.test(b.textContent ?? ""),
    );
    expect(hasRecovery).toBe(true);
  });

  it("renders budget-related messaging for OVER_BUDGET reason", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_NO_VALID_COMPLETION}
        {...defaultCallbacks}
      />,
    );
    expect(screen.getByText(/budget/i)).toBeInTheDocument();
  });
});

// ── 10. INSUFFICIENT_INFORMATION ─────────────────────────────────────────────

describe("INSUFFICIENT_INFORMATION", () => {
  it("renders a correction action", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_INSUFFICIENT_INFORMATION}
        {...defaultCallbacks}
      />,
    );
    const buttons = screen.getAllByRole("button");
    const hasCorrection = buttons.some((b) =>
      /correct input|start over/i.test(b.textContent ?? ""),
    );
    expect(hasCorrection).toBe(true);
  });

  it("does not render a purchase CTA", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_INSUFFICIENT_INFORMATION}
        {...defaultCallbacks}
      />,
    );
    expect(
      screen.queryByText(
        /^order now$|^buy$|add to cart|^place order$|^pay now$/i,
      ),
    ).not.toBeInTheDocument();
  });
});

// ── 11. NO_PURCHASE_REQUIRED ─────────────────────────────────────────────────

describe("NO_PURCHASE_REQUIRED", () => {
  it("contains no purchase CTA", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_NO_PURCHASE_REQUIRED}
        {...defaultCallbacks}
      />,
    );
    const forbidden = /order|buy|checkout|add to cart|pay/i;
    const buttons = screen.queryAllByRole("button");
    for (const btn of buttons) {
      expect(btn.textContent).not.toMatch(forbidden);
    }
  });

  it("shows the existing food summary", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_NO_PURCHASE_REQUIRED}
        {...defaultCallbacks}
      />,
    );
    expect(screen.getByText(/rice.*dal.*curd/i)).toBeInTheDocument();
  });
});

// ── 12. UNSERVICEABLE ────────────────────────────────────────────────────────

describe("UNSERVICEABLE", () => {
  it("does not imply real Swiggy serviceability", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_UNSERVICEABLE}
        {...defaultCallbacks}
      />,
    );
    expect(
      screen.getByText(/does not reflect real swiggy serviceability/i),
    ).toBeInTheDocument();
  });

  it("renders a heading and message", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_UNSERVICEABLE}
        {...defaultCallbacks}
      />,
    );
    expect(
      screen.getByRole("heading", { name: /demo address not available/i }),
    ).toBeInTheDocument();
  });
});

// ── 13. BOTH_PROVIDERS_FAILED ─────────────────────────────────────────────────

describe("BOTH_PROVIDERS_FAILED", () => {
  it("exposes no internal error codes", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_BOTH_PROVIDERS_FAILED}
        {...defaultCallbacks}
      />,
    );
    expect(screen.queryByText(/upstream_error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/timeout/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/auth_required/i)).not.toBeInTheDocument();
  });

  it("explains both sources unavailable without alarming the user", () => {
    render(
      <RecommendationOutcome
        outcome={FIXTURE_BOTH_PROVIDERS_FAILED}
        {...defaultCallbacks}
      />,
    );
    expect(
      screen.getByRole("heading", { name: /sources temporarily unavailable/i }),
    ).toBeInTheDocument();
  });
});

// ── 14. STANDARD_SWIGGY_HANDOFF_REQUIRED ──────────────────────────────────────

describe("STANDARD_SWIGGY_HANDOFF_REQUIRED", () => {
  it("renders handoff callback button when provided without performing navigation", async () => {
    const user = userEvent.setup();
    const onHandoff = vi.fn();
    render(
      <RecommendationOutcome
        outcome={FIXTURE_STANDARD_SWIGGY_HANDOFF}
        onStartOver={noop}
        onCorrectInput={noop}
        onStandardSwiggyHandoff={onHandoff}
      />,
    );
    const handoffBtn = screen.getByRole("button", {
      name: /search on swiggy/i,
    });
    await user.click(handoffBtn);
    expect(onHandoff).toHaveBeenCalledOnce();
  });

  it("fires the callback and does not submit a form when handoff is clicked", async () => {
    const user = userEvent.setup();
    const onHandoff = vi.fn();
    render(
      <RecommendationOutcome
        outcome={FIXTURE_STANDARD_SWIGGY_HANDOFF}
        onStartOver={noop}
        onCorrectInput={noop}
        onStandardSwiggyHandoff={onHandoff}
      />,
    );
    await user.click(screen.getByRole("button", { name: /search on swiggy/i }));
    expect(onHandoff).toHaveBeenCalledOnce();
    // The button is type="button" so no form submission occurs
    const btn = screen.getByRole("button", { name: /search on swiggy/i });
    expect(btn).toHaveAttribute("type", "button");
  });
});

// ── 15. Invalid outcome data ──────────────────────────────────────────────────

describe("invalid outcome data", () => {
  it("renders a safe fallback for null input", () => {
    render(<RecommendationOutcome outcome={null} {...defaultCallbacks} />);
    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
  });

  it("renders a safe fallback for malformed input", () => {
    render(
      <RecommendationOutcome
        outcome={{ status: "NOT_A_REAL_STATUS" }}
        {...defaultCallbacks}
      />,
    );
    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
  });

  it("renders a safe fallback for undefined input", () => {
    render(<RecommendationOutcome outcome={undefined} {...defaultCallbacks} />);
    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
  });

  it("exposes a start over action from the fallback", () => {
    const onStartOver = vi.fn();
    render(
      <RecommendationOutcome
        outcome={null}
        onStartOver={onStartOver}
        onCorrectInput={noop}
      />,
    );
    expect(
      screen.getByRole("button", { name: /start over/i }),
    ).toBeInTheDocument();
  });
});

// ── 20. All fixtures validate against plannerOutcomeSchema ───────────────────

describe("fixture validation", () => {
  it("all exported fixtures are valid PlannerOutcome objects", () => {
    for (const [name, fixture] of Object.entries(ALL_OUTCOME_FIXTURES)) {
      const result = plannerOutcomeSchema.safeParse(fixture);
      expect(result.success, `Fixture ${name} failed validation`).toBe(true);
    }
  });
});
