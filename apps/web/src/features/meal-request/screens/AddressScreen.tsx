"use client";

import { ScreenHeading } from "@/components/ScreenHeading";
import { StepProgress } from "@/components/StepProgress";
import { useMealRequest } from "../context";
import { SAMPLE_ADDRESSES } from "../sample-addresses";

export function AddressScreen() {
  const { state, dispatch } = useMealRequest();
  const selected = state.draft.addressId;

  return (
    <section className="screen" aria-labelledby="address-title">
      <StepProgress current={1} total={3} />
      <ScreenHeading id="address-title">Where are you eating?</ScreenHeading>
      <p className="screen__lead">
        Pick a saved address. We use it to check what can reach you.
      </p>
      <p className="hint hint--inline">Sample addresses for stub mode.</p>

      <fieldset className="address-list">
        <legend className="visually-hidden">Choose an address</legend>
        {SAMPLE_ADDRESSES.map((address) => {
          const id = `address-${address.id}`;
          const checked = selected === address.id;
          return (
            <label key={address.id} className="address-row" htmlFor={id}>
              <input
                id={id}
                type="radio"
                name="address"
                className="address-row__input"
                checked={checked}
                onChange={() =>
                  dispatch({ type: "SET_ADDRESS", addressId: address.id })
                }
              />
              <span className="address-row__body">
                <span className="address-row__label">{address.label}</span>
                <span className="address-row__area">{address.area}</span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="actions actions--split">
        <button
          type="button"
          className="button button--quiet"
          onClick={() => dispatch({ type: "GOTO", step: "intro" })}
        >
          Back
        </button>
        <button
          type="button"
          className="button button--primary"
          disabled={selected === null}
          onClick={() => dispatch({ type: "GOTO", step: "home" })}
        >
          Use this address
        </button>
      </div>
    </section>
  );
}
