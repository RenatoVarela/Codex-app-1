"use client";

import { useState, useEffect } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export function useReducedMotion(): boolean {
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    setIsReduced(mql.matches);

    function handleChange(event: MediaQueryListEvent) {
      setIsReduced(event.matches);
    }

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return isReduced;
}
