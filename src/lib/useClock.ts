"use client";

import { useEffect, useState } from "react";

/**
 * Stable, timestamp-backed clock for the active walk.
 *
 * A raw Date.now() getter is not a valid useSyncExternalStore snapshot because
 * its value can change between React's checks without a subscription event.
 * State updates only on a scheduled tick, focus or tab visibility change.
 */
export function useClock(): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };

    // Refresh after hydration, in case rendering took time.
    tick();
    const interval = window.setInterval(tick, 1000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return now;
}
