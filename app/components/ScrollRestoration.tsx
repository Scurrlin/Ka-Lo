"use client";

import { useEffect } from "react";

// Browsers (and the back-forward cache) will otherwise restore whatever scroll
// position - or jump to a URL hash like "#about" - the page had before a
// refresh/reload. This forces every full page load to start at the very top instead.
export default function ScrollRestoration() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    window.scrollTo(0, 0);
  }, []);

  return null;
}
