import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MealRequestFlow } from "../../src/features/meal-request/MealRequestFlow";
import { VALIDATION_MESSAGES } from "../../src/features/meal-request/validation";

async function gotoHomeStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Get started" }));
  await user.click(screen.getByRole("radio", { name: /Home/ }));
  await user.click(screen.getByRole("button", { name: "Use this address" }));
}

describe("home-state step", () => {
  it("blocks the explicit address choice until one is picked", async () => {
    const user = userEvent.setup();
    render(<MealRequestFlow />);
    await user.click(screen.getByRole("button", { name: "Get started" }));
    expect(
      screen.getByRole("button", { name: "Use this address" }),
    ).toBeDisabled();
  });

  it("shows a validation message when no component is selected", async () => {
    const user = userEvent.setup();
    render(<MealRequestFlow />);
    await gotoHomeStep(user);
    await user.click(
      screen.getByRole("button", { name: "Find what's missing" }),
    );
    expect(
      screen.getByText(VALIDATION_MESSAGES.components),
    ).toBeInTheDocument();
  });

  it("toggles a chip on and off via aria-pressed", async () => {
    const user = userEvent.setup();
    render(<MealRequestFlow />);
    await gotoHomeStep(user);
    const rice = screen.getByRole("button", { name: "Rice" });
    expect(rice).toHaveAttribute("aria-pressed", "false");
    await user.click(rice);
    expect(rice).toHaveAttribute("aria-pressed", "true");
    await user.click(rice);
    expect(rice).toHaveAttribute("aria-pressed", "false");
  });

  it("supports keyboard selection of a chip", async () => {
    const user = userEvent.setup();
    render(<MealRequestFlow />);
    await gotoHomeStep(user);
    const rotis = screen.getByRole("button", { name: "Rotis" });
    rotis.focus();
    await user.keyboard("{Enter}");
    expect(rotis).toHaveAttribute("aria-pressed", "true");
  });

  it("exposes accessible labels for servings and diet", async () => {
    const user = userEvent.setup();
    render(<MealRequestFlow />);
    await gotoHomeStep(user);
    expect(screen.getByRole("radio", { name: "For one" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "For two" })).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Vegetarian" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Mixed" })).toBeInTheDocument();
  });

  it("reveals the free-text note only after Other is chosen", async () => {
    const user = userEvent.setup();
    render(<MealRequestFlow />);
    await gotoHomeStep(user);
    expect(screen.queryByLabelText(/Tell us more/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Other" }));
    expect(screen.getByLabelText(/Tell us more/i)).toBeInTheDocument();
  });
});

describe("full read-only request flow", () => {
  it("builds a valid request and reaches the local success state", async () => {
    const user = userEvent.setup();
    render(<MealRequestFlow />);
    await gotoHomeStep(user);

    await user.click(screen.getByRole("button", { name: "Rice" }));
    await user.click(screen.getByRole("radio", { name: "For two" }));
    await user.click(screen.getByRole("radio", { name: "Vegetarian" }));
    await user.click(
      screen.getByRole("button", { name: "Find what's missing" }),
    );

    // Review step.
    expect(
      screen.getByRole("heading", { name: "Check your request" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Looks right" }));

    // Success step.
    expect(
      screen.getByRole("heading", { name: "Your request is ready" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Nothing was\s+ordered and no money was spent/i),
    ).toBeInTheDocument();
  });

  it("lets the user correct a low-confidence assumption on review", async () => {
    const user = userEvent.setup();
    render(<MealRequestFlow />);
    await gotoHomeStep(user);
    await user.click(
      screen.getByRole("button", { name: "Leftovers, not enough" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Find what's missing" }),
    );
    expect(
      screen.getByText(/assuming the leftovers are not enough/i),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Enough" }));
    expect(
      screen.queryByText(/assuming the leftovers are not enough/i),
    ).not.toBeInTheDocument();
  });

  it("exposes no cart, checkout, coupon, or payment affordances", async () => {
    const user = userEvent.setup();
    render(<MealRequestFlow />);
    await gotoHomeStep(user);
    await user.click(screen.getByRole("button", { name: "Rice" }));
    await user.click(
      screen.getByRole("button", { name: "Find what's missing" }),
    );
    await user.click(screen.getByRole("button", { name: "Looks right" }));

    const forbidden =
      /add to cart|checkout|coupon|place order|pay now|payment/i;
    expect(
      screen.queryByRole("button", { name: forbidden }),
    ).not.toBeInTheDocument();
    // No chat textbox as a primary surface.
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

describe("mobile layout smoke", () => {
  it("renders the flow inside a single constrained panel", async () => {
    const user = userEvent.setup();
    render(<MealRequestFlow />);
    await user.click(screen.getByRole("button", { name: "Get started" }));
    const main = screen.getByRole("main");
    expect(within(main).getByText("Where are you eating?")).toBeInTheDocument();
    expect(main.querySelector(".flow__panel")).not.toBeNull();
  });
});
