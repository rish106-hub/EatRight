"use client";

import { ScreenHeading } from "@/components/ScreenHeading";
import { useMealRequest } from "../context";

export function SuccessScreen() {
  const { state, dispatch } = useMealRequest();
  const { request } = state;

  return (
    <section className="screen" aria-labelledby="success-title">
      <p className="eyebrow eyebrow--success">
        <span aria-hidden="true">✓</span> Ready
      </p>
      <ScreenHeading id="success-title">Your request is ready</ScreenHeading>
      <p className="screen__lead">
        We&apos;ve built a valid request for provider search. Nothing was
        ordered and no money was spent.
      </p>

      {request ? (
        <dl className="summary">
          <div className="summary__row">
            <dt>Request ID</dt>
            <dd className="summary__mono">{request.requestId}</dd>
          </div>
          <div className="summary__row">
            <dt>At home</dt>
            <dd>{request.home.components.join(", ")}</dd>
          </div>
          <div className="summary__row">
            <dt>Max budget</dt>
            <dd>₹{request.constraints.budgetInr.max}</dd>
          </div>
        </dl>
      ) : null}

      <details className="raw-request">
        <summary>View structured request</summary>
        <pre className="raw-request__body">
          {JSON.stringify(request, null, 2)}
        </pre>
      </details>

      <div className="actions">
        <button
          type="button"
          className="button button--primary"
          onClick={() => dispatch({ type: "RESET" })}
        >
          Start again
        </button>
      </div>
    </section>
  );
}
