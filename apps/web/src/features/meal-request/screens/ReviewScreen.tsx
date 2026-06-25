"use client";

import { ScreenHeading } from "@/components/ScreenHeading";
import {
  SegmentedControl,
  type SegmentOption,
} from "@/components/SegmentedControl";
import { useMealRequest } from "../context";
import { quantityAssumptionCopy, type QuantityCorrection } from "../confidence";
import { chipLabel } from "../home-components";
import { generateRequestId, generateSessionId } from "../ids";
import { SAMPLE_ADDRESSES } from "../sample-addresses";

const CORRECTION_OPTIONS: readonly SegmentOption<string>[] = [
  { value: "enough", label: "Enough" },
  { value: "not-enough", label: "Not enough" },
  { value: "not-sure", label: "Not sure" },
];

export function ReviewScreen() {
  const { state, dispatch } = useMealRequest();
  const { draft } = state;
  const address = SAMPLE_ADDRESSES.find((a) => a.id === draft.addressId);
  const assumption = quantityAssumptionCopy(
    draft.components,
    draft.servings,
    draft.quantityCorrection,
  );

  return (
    <section className="screen" aria-labelledby="review-title">
      <ScreenHeading id="review-title">Check your request</ScreenHeading>
      <p className="screen__lead">
        This is what we&apos;ll search with. Nothing is ordered.
      </p>

      <dl className="summary">
        <div className="summary__row">
          <dt>Address</dt>
          <dd>{address ? `${address.label} · ${address.area}` : "—"}</dd>
        </div>
        <div className="summary__row">
          <dt>At home</dt>
          <dd>{draft.components.map(chipLabel).join(", ") || "—"}</dd>
        </div>
        <div className="summary__row">
          <dt>Servings</dt>
          <dd>{draft.servings === 1 ? "For one" : "For two"}</dd>
        </div>
        <div className="summary__row">
          <dt>Diet</dt>
          <dd>{draft.diet === "VEGETARIAN" ? "Vegetarian" : "Mixed"}</dd>
        </div>
        <div className="summary__row">
          <dt>Meal weight</dt>
          <dd>{draft.mealWeight === "LIGHT" ? "Light" : "Regular"}</dd>
        </div>
        <div className="summary__row">
          <dt>Max budget</dt>
          <dd>₹{draft.budgetMaxInr ?? "—"}</dd>
        </div>
        <div className="summary__row">
          <dt>Max delivery time</dt>
          <dd>
            {draft.maxEtaMinutes === null
              ? "No limit"
              : `${draft.maxEtaMinutes} min`}
          </dd>
        </div>
        <div className="summary__row">
          <dt>Skipping</dt>
          <dd>{draft.exclusions.join(", ") || "Nothing"}</dd>
        </div>
      </dl>

      {assumption ? (
        <div className="assumption" role="note">
          <p className="assumption__text">{assumption}</p>
          <SegmentedControl
            legend="Is what's at home enough?"
            name="quantity-correction"
            options={CORRECTION_OPTIONS}
            value={draft.quantityCorrection ?? "not-enough"}
            onChange={(value) =>
              dispatch({
                type: "SET_QUANTITY_CORRECTION",
                value: value as QuantityCorrection,
              })
            }
          />
        </div>
      ) : null}

      <div className="actions actions--split">
        <button
          type="button"
          className="button button--quiet"
          onClick={() => dispatch({ type: "GOTO", step: "home" })}
        >
          Edit
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={() =>
            dispatch({
              type: "CONFIRM_REVIEW",
              ids: {
                sessionId: generateSessionId(),
                requestId: generateRequestId(),
              },
            })
          }
        >
          Looks right
        </button>
      </div>
    </section>
  );
}
