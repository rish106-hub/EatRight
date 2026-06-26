"use client";

import { useEffect } from "react";
import { StatusRegion } from "@/components/StatusRegion";
import { DemoFlowErrorScreen } from "@/features/demo-flow/DemoFlowErrorScreen";
import { submitMealCompletionRequest } from "@/features/demo-flow/api-client";
import { RecommendationOutcome } from "@/features/recommendation";
import { MealRequestProvider, useMealRequest } from "./context";
import { validateHomeState } from "./validation";
import { IntroScreen } from "./screens/IntroScreen";
import { AddressScreen } from "./screens/AddressScreen";
import { HomeStateScreen } from "./screens/HomeStateScreen";
import { ReviewScreen } from "./screens/ReviewScreen";
import { SearchingScreen } from "./screens/SearchingScreen";

const STEP_ANNOUNCEMENT: Record<string, string> = {
  intro: "Welcome. Finish My Dinner is read-only and cannot order.",
  address: "Choose an address.",
  home: "Tell us what's already at home.",
  review: "Review your request before searching.",
  submitting: "Checking Food, checking Instamart, and comparing valid options.",
  outcome: "Result ready. Nothing was ordered.",
  "api-error": "The read-only demo needs attention. Nothing was ordered.",
};

function statusMessage(
  step: string,
  showHomeErrors: boolean,
  homeInvalid: boolean,
): string {
  if (step === "home" && showHomeErrors && homeInvalid) {
    return "Some details need fixing before you can continue.";
  }
  return STEP_ANNOUNCEMENT[step] ?? "";
}

function FlowScreens() {
  const { state, dispatch } = useMealRequest();
  const homeInvalid = Object.keys(validateHomeState(state.draft)).length > 0;

  useEffect(() => {
    if (state.step !== "submitting" || state.request === null) {
      return;
    }

    let cancelled = false;

    submitMealCompletionRequest(state.request).then((result) => {
      if (cancelled) {
        return;
      }
      if (result.status === "success") {
        dispatch({ type: "SUBMISSION_SUCCEEDED", outcome: result.outcome });
        return;
      }
      dispatch({ type: "SUBMISSION_FAILED", failure: result });
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch, state.request, state.step, state.submitAttempt]);

  return (
    <main className="flow">
      <StatusRegion
        message={statusMessage(state.step, state.showHomeErrors, homeInvalid)}
      />
      <div className="flow__panel">
        {state.step === "intro" ? <IntroScreen /> : null}
        {state.step === "address" ? <AddressScreen /> : null}
        {state.step === "home" ? <HomeStateScreen /> : null}
        {state.step === "review" ? <ReviewScreen /> : null}
        {state.step === "submitting" ? <SearchingScreen /> : null}
        {state.step === "outcome" && state.outcome !== null ? (
          <RecommendationOutcome
            outcome={state.outcome}
            onStartOver={() => dispatch({ type: "RESET" })}
            onCorrectInput={() => dispatch({ type: "CORRECT_INPUT" })}
          />
        ) : null}
        {state.step === "api-error" && state.failure !== null ? (
          <DemoFlowErrorScreen
            failure={state.failure}
            onRetry={() => dispatch({ type: "RETRY_SUBMISSION" })}
            onCorrectInput={() => dispatch({ type: "CORRECT_INPUT" })}
            onStartOver={() => dispatch({ type: "RESET" })}
          />
        ) : null}
      </div>
    </main>
  );
}

export function MealRequestFlow() {
  return (
    <MealRequestProvider>
      <FlowScreens />
    </MealRequestProvider>
  );
}
