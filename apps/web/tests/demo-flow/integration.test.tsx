import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PlannerOutcome } from "@finish-my-dinner/planner";
import { MealRequestFlow } from "../../src/features/meal-request/MealRequestFlow";
import {
  ALL_OUTCOME_FIXTURES,
  FIXTURE_RECOMMENDATION_READY,
} from "../../src/features/recommendation/fixtures";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("M0 integrated demo flow", () => {
  it("runs the happy path from meal request to one recommendation", async () => {
    const user = userEvent.setup();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.stubGlobal("fetch", successFetch(FIXTURE_RECOMMENDATION_READY));

    render(<MealRequestFlow />);
    await submitRiceCurdRequest(user);

    expect(
      await screen.findByRole("heading", { name: /here.s what to add/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByText(/Rajma|Ready Dal/i)).toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("requires an explicit demo address before submission", async () => {
    const user = userEvent.setup();
    const fetchMock = successFetch(FIXTURE_RECOMMENDATION_READY);
    vi.stubGlobal("fetch", fetchMock);

    render(<MealRequestFlow />);
    await user.click(screen.getByRole("button", { name: "Get started" }));

    expect(
      screen.getByRole("button", { name: "Use this address" }),
    ).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows the loading state while the API call is pending", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<Response>();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => deferred.promise),
    );

    render(<MealRequestFlow />);
    await submitRiceCurdRequest(user);

    expect(
      screen.getByRole("heading", { name: "Finding one thing to add" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Checking Food")).toBeInTheDocument();

    deferred.resolve(successResponse(FIXTURE_RECOMMENDATION_READY));
    expect(
      await screen.findByRole("heading", { name: /here.s what to add/i }),
    ).toBeInTheDocument();
  });

  it("renders API 422 as safe correction copy", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      apiErrorFetch(422, "INVALID_REQUEST", "Request failed validation."),
    );

    render(<MealRequestFlow />);
    await submitRiceCurdRequest(user);

    expect(
      await screen.findByRole("heading", { name: "Check your request" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/need correction/i)).toBeInTheDocument();
  });

  it("renders API capability failure as safe generic demo failure", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      apiErrorFetch(
        500,
        "UNSAFE_RUNTIME_CONFIGURATION",
        "The meal-completion API is not available in this runtime.",
      ),
    );

    render(<MealRequestFlow />);
    await submitRiceCurdRequest(user);

    expect(
      await screen.findByRole("heading", {
        name: "Read-only demo unavailable",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/stack|traceback/i)).not.toBeInTheDocument();
  });

  it("renders API 500 as a safe generic failure", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      apiErrorFetch(
        500,
        "INTERNAL_PLANNER_INVARIANT",
        "Planner output failed runtime validation.",
      ),
    );

    render(<MealRequestFlow />);
    await submitRiceCurdRequest(user);

    expect(
      await screen.findByRole("heading", { name: "Something went wrong" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Nothing was added, ordered, or changed/i));
  });

  it.each([
    [400, "MALFORMED_JSON", "Request could not be sent"],
    [415, "UNSUPPORTED_CONTENT_TYPE", "Request could not be sent"],
  ] as const)("handles HTTP %s safely", async (status, code, heading) => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      apiErrorFetch(status, code, "Request not accepted."),
    );

    render(<MealRequestFlow />);
    await submitRiceCurdRequest(user);

    expect(
      await screen.findByRole("heading", { name: heading }),
    ).toBeInTheDocument();
  });

  it("renders network failure with a retry option", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(successResponse(FIXTURE_RECOMMENDATION_READY));
    vi.stubGlobal("fetch", fetchMock);

    render(<MealRequestFlow />);
    await submitRiceCurdRequest(user);

    expect(
      await screen.findByRole("heading", { name: "Connection failed" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("heading", { name: /here.s what to add/i }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("start over resets request and outcome", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", successFetch(FIXTURE_RECOMMENDATION_READY));

    render(<MealRequestFlow />);
    await submitRiceCurdRequest(user);
    await screen.findByRole("heading", { name: /here.s what to add/i });
    await user.click(screen.getByRole("button", { name: "Start over" }));

    expect(
      screen.getByRole("heading", { name: "Finish your dinner" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Rajma|Ready Dal/i)).not.toBeInTheDocument();
  });

  it("correct input returns to the editable request state", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", successFetch(FIXTURE_RECOMMENDATION_READY));

    render(<MealRequestFlow />);
    await submitRiceCurdRequest(user);
    await screen.findByRole("heading", { name: /here.s what to add/i });
    await user.click(screen.getByRole("button", { name: "Correct input" }));

    expect(
      screen.getByRole("heading", { name: "What's already at home?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rice" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it.each(Object.entries(ALL_OUTCOME_FIXTURES))(
    "renders integrated planner outcome %s",
    async (name, outcome) => {
      const user = userEvent.setup();
      vi.stubGlobal("fetch", successFetch(outcome));

      render(<MealRequestFlow />);
      await submitRiceCurdRequest(user);

      expect(
        await screen.findByRole("heading", {
          name: expectedHeadingForOutcome(outcome),
        }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /search on swiggy/i })).toBe(
        null,
      );
      expect(name).toBeTruthy();
    },
  );

  it("does not render commerce affordances in the integrated flow", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", successFetch(FIXTURE_RECOMMENDATION_READY));

    render(<MealRequestFlow />);
    await submitRiceCurdRequest(user);
    await screen.findByRole("heading", { name: /here.s what to add/i });

    const forbidden =
      /(^|\b)(order|add to cart|checkout|coupon|pay|payment|track)(\b|$)/i;
    for (const button of screen.queryAllByRole("button")) {
      expect(button).not.toHaveAccessibleName(forbidden);
    }
  });

  it("sends no raw address text or commerce fields in the request body", async () => {
    const user = userEvent.setup();
    const fetchMock = successFetch(FIXTURE_RECOMMENDATION_READY);
    vi.stubGlobal("fetch", fetchMock);

    render(<MealRequestFlow />);
    await submitRiceCurdRequest(user);
    await screen.findByRole("heading", { name: /here.s what to add/i });

    const calls = (
      fetchMock as unknown as {
        mock: { calls: Array<[unknown, RequestInit?]> };
      }
    ).mock.calls;
    const init = calls[0]?.[1];
    const body = String(init?.body ?? "");
    expect(calls[0]?.[0]).toBe("/api/meal-completion");
    expect(init?.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(body).toContain("address-sample-home");
    expect(body).not.toMatch(/Indiranagar|Koramangala|HSR Layout/i);
    expect(body).not.toMatch(
      /cart|checkout|coupon|payment|pay|order|tracking|token/i,
    );
  });

  it("rejects unsafe or invalid response outcome data", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          ok: true,
          apiVersion: "meal-completion.v1",
          correlationId: "correlation-invalid",
          capability: {
            mode: "demo_read_only",
            mcpEnv: "stub",
            capabilityLevel: "read_only",
            realCommerceActionsEnabled: false,
          },
          outcome: {
            status: "RECOMMENDATION_READY",
            checkoutTotalInr: 999,
          },
        }),
      ),
    );

    render(<MealRequestFlow />);
    await submitRiceCurdRequest(user);

    expect(
      await screen.findByRole("heading", { name: "Result could not be shown" }),
    ).toBeInTheDocument();
  });

  it("supports keyboard submission and moves focus to the result heading", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", successFetch(FIXTURE_RECOMMENDATION_READY));

    render(<MealRequestFlow />);
    await reachReviewWithRiceCurd(user);
    const submit = screen.getByRole("button", { name: "Looks right" });
    submit.focus();
    await user.keyboard("{Enter}");

    const heading = await screen.findByRole("heading", {
      name: /here.s what to add/i,
    });
    await waitFor(() => expect(heading).toHaveFocus());
  });
});

async function submitRiceCurdRequest(user: ReturnType<typeof userEvent.setup>) {
  await reachReviewWithRiceCurd(user);
  await user.click(screen.getByRole("button", { name: "Looks right" }));
}

async function reachReviewWithRiceCurd(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.click(screen.getByRole("button", { name: "Get started" }));
  await user.click(screen.getByRole("radio", { name: /Home/ }));
  await user.click(screen.getByRole("button", { name: "Use this address" }));
  await user.click(screen.getByRole("button", { name: "Rice" }));
  await user.click(screen.getByRole("button", { name: "Curd/raita" }));
  await user.click(screen.getByRole("radio", { name: "Vegetarian" }));
  await user.click(screen.getByRole("button", { name: "Find what's missing" }));
  expect(
    screen.getByRole("heading", { name: "Check your request" }),
  ).toBeInTheDocument();
}

function successFetch(outcome: PlannerOutcome) {
  return vi.fn(async () => successResponse(outcome));
}

function expectedHeadingForOutcome(outcome: PlannerOutcome): RegExp | string {
  switch (outcome.status) {
    case "RECOMMENDATION_READY":
      return /here.s what to add/i;
    case "NO_VALID_COMPLETION":
      return "No matching option found";
    case "INSUFFICIENT_INFORMATION":
      return "More information needed";
    case "NO_PURCHASE_REQUIRED":
      return "Looks like you're set";
    case "UNSERVICEABLE":
      return "Demo address not available";
    case "BOTH_PROVIDERS_FAILED":
      return "Sources temporarily unavailable";
    case "STANDARD_SWIGGY_HANDOFF_REQUIRED":
      return "You may need a full meal";
  }
}

function successResponse(outcome: PlannerOutcome): Response {
  return Response.json({
    ok: true,
    apiVersion: "meal-completion.v1",
    correlationId: "correlation-demo-test",
    capability: {
      mode: "demo_read_only",
      mcpEnv: "stub",
      capabilityLevel: "read_only",
      realCommerceActionsEnabled: false,
    },
    outcome,
  });
}

function apiErrorFetch(
  httpStatus: number,
  code:
    | "UNSUPPORTED_CONTENT_TYPE"
    | "MALFORMED_JSON"
    | "REQUEST_TOO_LARGE"
    | "INVALID_REQUEST"
    | "UNKNOWN_DEMO_ADDRESS"
    | "UNSAFE_RUNTIME_CONFIGURATION"
    | "INTERNAL_PLANNER_INVARIANT",
  message: string,
) {
  return vi.fn(async () =>
    Response.json(
      {
        ok: false,
        apiVersion: "meal-completion.v1",
        correlationId: "correlation-error-test",
        error: { code, message },
      },
      { status: httpStatus },
    ),
  );
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });
  return { promise, resolve, reject };
}
