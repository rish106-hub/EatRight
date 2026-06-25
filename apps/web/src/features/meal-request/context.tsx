"use client";

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  flowReducer,
  initialFlowState,
  type FlowAction,
  type FlowState,
} from "./reducer";

interface FlowContextValue {
  state: FlowState;
  dispatch: Dispatch<FlowAction>;
}

const FlowContext = createContext<FlowContextValue | null>(null);

export function MealRequestProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    flowReducer,
    undefined,
    initialFlowState,
  );
  return (
    <FlowContext.Provider value={{ state, dispatch }}>
      {children}
    </FlowContext.Provider>
  );
}

export function useMealRequest(): FlowContextValue {
  const value = useContext(FlowContext);
  if (value === null) {
    throw new Error("useMealRequest must be used within MealRequestProvider");
  }
  return value;
}
