"use client";

import type { DietPreference, MealWeight } from "@finish-my-dinner/contracts";
import { ChipToggle } from "@/components/ChipToggle";
import { ExclusionsInput } from "@/components/ExclusionsInput";
import { FieldError } from "@/components/FieldError";
import { NumberField } from "@/components/NumberField";
import { ScreenHeading } from "@/components/ScreenHeading";
import { SegmentedControl } from "@/components/SegmentedControl";
import { StepProgress } from "@/components/StepProgress";
import { useMealRequest } from "../context";
import { HOME_COMPONENT_CHIPS } from "../home-components";
import { validateHomeState } from "../validation";

const DIET_OPTIONS = [
  { value: "VEGETARIAN" as DietPreference, label: "Vegetarian" },
  { value: "MIXED" as DietPreference, label: "Mixed" },
];

const WEIGHT_OPTIONS = [
  { value: "LIGHT" as MealWeight, label: "Light" },
  { value: "REGULAR" as MealWeight, label: "Regular" },
];

const SERVINGS_OPTIONS = [
  { value: 1 as const, label: "For one" },
  { value: 2 as const, label: "For two" },
];

export function HomeStateScreen() {
  const { state, dispatch } = useMealRequest();
  const { draft, showHomeErrors } = state;
  const errors = showHomeErrors ? validateHomeState(draft) : {};
  const showNote = draft.components.includes("UNKNOWN");

  return (
    <section className="screen" aria-labelledby="home-title">
      <StepProgress current={2} total={3} />
      <ScreenHeading id="home-title">
        What&apos;s already at home?
      </ScreenHeading>
      <p className="screen__lead">Tap what you have. A couple is enough.</p>

      <fieldset
        className="chip-group"
        aria-describedby={errors.components ? "components-error" : undefined}
      >
        <legend className="field-legend">What&apos;s at home</legend>
        <div className="chip-group__chips">
          {HOME_COMPONENT_CHIPS.map((chip) => (
            <ChipToggle
              key={chip.id}
              label={chip.label}
              pressed={draft.components.includes(chip.id)}
              onToggle={() =>
                dispatch({ type: "TOGGLE_COMPONENT", id: chip.id })
              }
            />
          ))}
        </div>
        <FieldError id="components-error" message={errors.components} />
      </fieldset>

      {showNote ? (
        <div className="note-field">
          <label className="number-field__label" htmlFor="raw-text">
            Tell us more (optional)
          </label>
          <input
            id="raw-text"
            type="text"
            className="text-input"
            maxLength={80}
            value={draft.rawText}
            onChange={(event) =>
              dispatch({ type: "SET_RAW_TEXT", value: event.target.value })
            }
          />
        </div>
      ) : null}

      <SegmentedControl
        legend="How many servings?"
        name="servings"
        options={SERVINGS_OPTIONS}
        value={draft.servings}
        onChange={(value) => dispatch({ type: "SET_SERVINGS", value })}
      />

      <SegmentedControl
        legend="Diet"
        name="diet"
        options={DIET_OPTIONS}
        value={draft.diet}
        onChange={(value) => dispatch({ type: "SET_DIET", value })}
      />

      <SegmentedControl
        legend="Meal weight"
        name="weight"
        options={WEIGHT_OPTIONS}
        value={draft.mealWeight}
        onChange={(value) => dispatch({ type: "SET_MEAL_WEIGHT", value })}
      />

      <NumberField
        id="budget"
        label="Max budget"
        prefix="₹"
        min={0}
        value={draft.budgetMaxInr}
        onChange={(value) => dispatch({ type: "SET_BUDGET", value })}
        errorId="budget-error"
        invalid={Boolean(errors.budget)}
      />
      <FieldError id="budget-error" message={errors.budget} />

      <NumberField
        id="eta"
        label="Max delivery time"
        suffix="min"
        min={0}
        hint="Optional. Leave blank for no limit."
        value={draft.maxEtaMinutes}
        onChange={(value) => dispatch({ type: "SET_ETA", value })}
        errorId="eta-error"
        invalid={Boolean(errors.eta)}
      />
      <FieldError id="eta-error" message={errors.eta} />

      <ExclusionsInput
        values={draft.exclusions}
        onAdd={(value) => dispatch({ type: "ADD_EXCLUSION", value })}
        onRemove={(value) => dispatch({ type: "REMOVE_EXCLUSION", value })}
      />

      <div className="actions actions--split">
        <button
          type="button"
          className="button button--quiet"
          onClick={() => dispatch({ type: "GOTO", step: "address" })}
        >
          Back
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={() => dispatch({ type: "SUBMIT_HOME" })}
        >
          Find what&apos;s missing
        </button>
      </div>
    </section>
  );
}
