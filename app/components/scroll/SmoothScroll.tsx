"use client";

import { useEffect, type ReactNode } from "react";

type SmoothScrollProps = {
  children: ReactNode;
};

/**
 * Lightweight scroll setup — no smooth-scroll library. Scrolling is native on
 * every browser (wheel/trackpad handled by the OS, nav "scroll to section"
 * handled by GSAP ScrollToPlugin, animation easing by About's ScrollTrigger
 * `scrub`). This component only:
 *  1. Forces every full page load to start at the top (defeats BFCache / hash
 *     restore).
 *  2. Runs a single deduped ScrollTrigger.refresh() after window "load" so
 *     heavy videos/images that change layout are re-measured once.
 */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    // Browsers (and the back-forward cache) will otherwise restore scroll
    // position — or jump to a URL hash like "#about" — on refresh/reload.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }

    window.scrollTo(0, 0);

    let cancelled = false;
    // Every section (Music/About/Lyrics) would otherwise register its own
    // window "load" -> ScrollTrigger.refresh() listener. refresh() is global,
    // so on a heavy page (large videos) those all fired back to back on the
    // same tick, forcing About's expensive layout recompute 3-4x in a row.
    // One deduped call here replaces all of them.
    let scrollTriggerRef: typeof import("gsap/ScrollTrigger").ScrollTrigger | null =
      null;
    let refreshQueued = false;

    const scheduleRefresh = () => {
      if (refreshQueued || !scrollTriggerRef) {
        return;
      }

      refreshQueued = true;
      window.requestAnimationFrame(() => {
        refreshQueued = false;
        scrollTriggerRef?.refresh();
      });
    };

    const handleWindowLoad = async () => {
      if (cancelled) {
        return;
      }

      if (!scrollTriggerRef) {
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");

        if (cancelled) {
          return;
        }

        scrollTriggerRef = ScrollTrigger;
      }

      scheduleRefresh();
    };

    // If the page already finished loading before this effect ran, refresh now;
    // otherwise wait for "load" so final asset dimensions are measured once.
    if (document.readyState === "complete") {
      void handleWindowLoad();
    } else {
      window.addEventListener("load", handleWindowLoad, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", handleWindowLoad);
    };
  }, []);

  return <>{children}</>;
}
