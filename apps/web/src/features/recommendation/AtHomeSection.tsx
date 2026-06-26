"use client";

export function AtHomeSection({ items }: { items: readonly string[] }) {
  return (
    <div className="rec-section rec-section--at-home">
      <span className="rec-section__label">At home</span>
      <p className="rec-section__value">{items.join(", ")}</p>
    </div>
  );
}
