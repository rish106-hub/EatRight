import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MealRequestFlow } from "../../src/features/meal-request/MealRequestFlow";

describe("intro screen", () => {
  it("states the read-only boundary up front", () => {
    render(<MealRequestFlow />);
    expect(screen.getByText("Read-only mode")).toBeInTheDocument();
    expect(
      screen.getByText(/M0 does not order or spend money/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/can't add to a cart or place an order/i),
    ).toBeInTheDocument();
  });

  it("shows the non-affiliation disclaimer", () => {
    render(<MealRequestFlow />);
    expect(
      screen.getByText("Not affiliated with or endorsed by Swiggy."),
    ).toBeInTheDocument();
  });
});
