"use client";

import { StatusRegion } from "@/components/StatusRegion";
import { MealRequestProvider, useMealRequest } from "./context";
import { validateHomeState } from "./validation";
import { IntroScreen } from "./screens/IntroScreen";
import { AddressScreen } from "./screens/AddressScreen";
import { HomeStateScreen } from "./screens/HomeStateScreen";
import { ReviewScreen } from "./screens/ReviewScreen";
import { SuccessScreen } from "./screens/SuccessScreen";

const STEP_ANNOUNCEMENT: Record<string, string> = {
  intro: "Welcome. Finish My Dinner is read-only and cannot order.",
  address: "Choose an address.",
  home: "Tell us what's already at home.",
  review: "Review your request before searching.",
  success: "Your request is ready for provider search. Nothing was ordered.",
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
  const { state } = useMealRequest();
  const homeInvalid = Object.keys(validateHomeState(state.draft)).length > 0;

  return (
    <main className="flow" aria-labelledby={`${state.step}-title`}>
      <StatusRegion
        message={statusMessage(state.step, state.showHomeErrors, homeInvalid)}
      />
      <div className="flow__panel">
        {state.step === "intro" ? <IntroScreen /> : null}
        {state.step === "address" ? <AddressScreen /> : null}
        {state.step === "home" ? <HomeStateScreen /> : null}
        {state.step === "review" ? <ReviewScreen /> : null}
        {state.step === "success" ? <SuccessScreen /> : null}
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
