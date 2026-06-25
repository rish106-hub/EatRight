/**
 * Non-decorative step indicator. Text ("Step 2 of 4") carries the meaning so it
 * is not conveyed by the progress bar colour alone.
 */
export function StepProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="step-progress">
      <p className="step-progress__label">
        Step {current} of {total}
      </p>
      <div
        className="step-progress__track"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={`Step ${current} of ${total}`}
      >
        <span
          className="step-progress__fill"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
