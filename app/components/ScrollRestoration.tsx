"use client";

import { useEffect } from "react";
import { useLenisRef } from "./SmoothScroll";

// Browsers (and the back-forward cache) will otherwise restore whatever scroll
// position - or jump to a URL hash like "#about" - the page had before a
// refresh/reload. This forces every full page load to start at the very top instead.
export default function ScrollRestoration() {
  const lenisRef = useLenisRef();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    window.scrollTo(0, 0);
    // Lenis mounts in a sibling effect; reset again on the next frame so the
    // smoother's internal scroll matches the forced top position.
    const frame = window.requestAnimationFrame(() => {
      lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [lenisRef]);

  return null;
}
