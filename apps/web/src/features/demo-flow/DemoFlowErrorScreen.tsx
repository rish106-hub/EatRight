"use client";

import { useEffect, useRef } from "react";
import type { MealCompletionClientResult } from "./api-client";

type DemoFlowFailure = Exclude<
  MealCompletionClientResult,
  { status: "success" }
>;

export interface DemoFlowErrorScreenProps {
  failure: DemoFlowFailure;
  onRetry: () => void;
  onCorrectInput: () => void;
  onStartOver: () => void;
}

function contentForFailure(failure: DemoFlowFailure): {
  heading: string;
  body: string;
  primaryAction: "retry" | "correct";
} {
  if (failure.status === "network_error") {
    return {
      heading: "Connection failed",
      body: "The demo API did not respond. Nothing was added, ordered, or changed.",
      primaryAction: "retry",
    };
  }

  if (failure.status === "invalid_response") {
    return {
      heading: "Result could not be shown",
      body: "The response did not match the safe demo shape. Nothing was added, ordered, or changed.",
      primaryAction: "retry",
    };
  }

  if (failure.httpStatus === 422) {
    return {
      heading: "Check your request",
      body: "Some request details need correction before the demo can search. Nothing was added, ordered, or changed.",
      primaryAction: "correct",
    };
  }

  if (
    failure.httpStatus === 500 &&
    failure.error.code === "UNSAFE_RUNTIME_CONFIGURATION"
  ) {
    return {
      heading: "Read-only demo unavailable",
      body: "The demo is not available in this runtime configuration. Nothing was added, ordered, or changed.",
      primaryAction: "retry",
    };
  }

  if (failure.httpStatus === 400 || failure.httpStatus === 415) {
    return {
      heading: "Request could not be sent",
      body: "The demo request was not accepted by the API. Nothing was added, ordered, or changed.",
      primaryAction: "correct",
    };
  }

  return {
    heading: "Something went wrong",
    body: "The read-only demo hit an unexpected problem. Nothing was added, ordered, or changed.",
    primaryAction: "retry",
  };
}

export function DemoFlowErrorScreen({
  failure,
  onRetry,
  onCorrectInput,
  onStartOver,
}: DemoFlowErrorScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const content = contentForFailure(failure);
  const correlationId =
    failure.status === "network_error" ? undefined : failure.correlationId;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className="screen" aria-labelledby="demo-error-title">
      <h1
        id="demo-error-title"
        className="screen-heading"
        tabIndex={-1}
        ref={headingRef}
      >
        {content.heading}
      </h1>
      <p className="screen__lead">{content.body}</p>

      <div className="notice" role="note">
        <p className="notice__title">Read-only boundary</p>
        <p className="notice__body">
          This demo cannot add to cart, checkout, take payment, place orders, or
          track orders.
        </p>
      </div>

      {correlationId ? (
        <p className="hint--inline">Reference: {correlationId}</p>
      ) : null}

      <div className="actions">
        {content.primaryAction === "retry" ? (
          <button
            type="button"
            className="button button--primary"
            onClick={onRetry}
          >
            Try again
          </button>
        ) : (
          <button
            type="button"
            className="button button--primary"
            onClick={onCorrectInput}
          >
            Correct input
          </button>
        )}
        {content.primaryAction === "retry" ? (
          <button
            type="button"
            className="button button--quiet"
            onClick={onCorrectInput}
          >
            Correct input
          </button>
        ) : (
          <button
            type="button"
            className="button button--quiet"
            onClick={onRetry}
          >
            Try again
          </button>
        )}
        <button
          type="button"
          className="button button--quiet"
          onClick={onStartOver}
        >
          Start over
        </button>
      </div>
    </section>
  );
}
