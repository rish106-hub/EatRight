"use client";

export function EstimateSummary({
  priceInr,
  etaMinutes,
}: {
  priceInr: number;
  etaMinutes?: number;
}) {
  return (
    <div className="rec-section rec-section--estimate">
      <span className="rec-section__label">Details</span>
      <dl className="rec-estimate">
        <div className="rec-estimate__row">
          <dt>Price</dt>
          <dd>
            <span className="rec-estimate__tag" aria-label="Estimated price">
              Estimated
            </span>{" "}
            ₹{priceInr}
          </dd>
        </div>
        {etaMinutes !== undefined && (
          <div className="rec-estimate__row">
            <dt>Delivery</dt>
            <dd>
              <span
                className="rec-estimate__tag"
                aria-label="Estimated delivery time"
              >
                Estimated
              </span>{" "}
              {etaMinutes} min
            </dd>
          </div>
        )}
        <div className="rec-estimate__row rec-estimate__row--notice">
          <dd className="rec-estimate__disclaimer">
            Final fees not available in read-only mode.
          </dd>
        </div>
      </dl>
    </div>
  );
}
