"use client";

import { useEffect } from "react";

/**
 * Register the generated PWA worker without throwing if the browser blocks
 * service workers (private mode, enterprise policy, automated test).
 *
 * The older PWA plugin's auto-register path assumes registration always
 * returns a ServiceWorkerRegistration; our core online experience must not.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }

    const register = () => {
      try {
        const attempt = navigator.serviceWorker.register("/sw.js", { scope: "/" });
        Promise.resolve(attempt).catch(() => {
          // Offline installation is unavailable; the active web app still works.
        });
      } catch {
        // Registration may be blocked by the browser or site policy.
      }
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
