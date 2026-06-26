import type { CandidateSource } from "@finish-my-dinner/contracts";
import type { PlannerOutcome } from "@finish-my-dinner/planner";
import type { MealCompletionApiErrorCode } from "./schema";

export interface MealCompletionLogEvent {
  correlationId: string;
  endpoint: "/api/meal-completion";
  httpStatus: number;
  capabilityMode: "demo_read_only";
  durationMs: number;
  outcomeStatus?: PlannerOutcome["status"];
  selectedProvider?: CandidateSource;
  errorCode?: MealCompletionApiErrorCode;
}

export interface MealCompletionLogger {
  info(event: MealCompletionLogEvent): void;
}

export const consoleMealCompletionLogger: MealCompletionLogger = {
  info(event) {
    console.info(JSON.stringify(event));
  },
};
