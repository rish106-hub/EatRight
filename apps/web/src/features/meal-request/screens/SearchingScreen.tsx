"use client";

import { useEffect, useRef } from "react";

export function SearchingScreen() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className="screen" aria-labelledby="searching-title">
      <h1
        id="searching-title"
        className="screen-heading"
        tabIndex={-1}
        ref={headingRef}
      >
        Finding one thing to add
      </h1>
      <p className="screen__lead">
        Checking the read-only demo sources. Nothing is added to a cart and no
        money is spent.
      </p>

      <ol className="demo-progress" aria-label="Search progress">
        <li>Checking Food</li>
        <li>Checking Instamart</li>
        <li>Comparing valid options</li>
      </ol>
    </section>
  );
}
