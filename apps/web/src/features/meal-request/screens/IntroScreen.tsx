"use client";

import { ScreenHeading } from "@/components/ScreenHeading";
import { useMealRequest } from "../context";

export function IntroScreen() {
  const { dispatch } = useMealRequest();

  return (
    <section className="screen" aria-labelledby="intro-title">
      <p className="eyebrow">Finish My Dinner</p>
      <ScreenHeading id="intro-title">Finish your dinner</ScreenHeading>
      <p className="screen__lead">
        You already have part of dinner. Tell us what&apos;s at home and
        we&apos;ll find the one thing worth adding from Swiggy.
      </p>

      <div className="notice" role="note">
        <p className="notice__title">
          <span className="notice__icon" aria-hidden="true">
            ●
          </span>
          Read-only mode
        </p>
        <p className="notice__body">
          We can search and recommend. We can&apos;t add to a cart or place an
          order. <strong>M0 does not order or spend money.</strong>
        </p>
      </div>

      <div className="actions">
        <button
          type="button"
          className="button button--primary"
          onClick={() => dispatch({ type: "GOTO", step: "address" })}
        >
          Get started
        </button>
      </div>

      <p className="disclaimer">Not affiliated with or endorsed by Swiggy.</p>
    </section>
  );
}
