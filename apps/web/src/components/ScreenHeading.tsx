"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Focusable screen title. On mount it receives focus so keyboard and screen
 * reader users land on the new screen's heading after every step change.
 */
export function ScreenHeading({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <h1 id={id} className="screen-heading" tabIndex={-1} ref={ref}>
      {children}
    </h1>
  );
}
