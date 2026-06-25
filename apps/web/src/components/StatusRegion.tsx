"use client";

/**
 * Single polite live region. Announces step changes, validation, and the final
 * success without stealing focus. Visually hidden but available to AT.
 */
export function StatusRegion({ message }: { message: string }) {
  return (
    <div
      className="visually-hidden"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
}
