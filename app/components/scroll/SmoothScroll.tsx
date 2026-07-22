"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject
} from "react";
import type Lenis from "lenis";
import "lenis/dist/lenis.css";

/** Modest inertia so About's scrub lag does not feel double-mushy. */
const LENIS_LERP = 0.1;

const LenisContext = createContext<RefObject<Lenis | null>>({
  current: null
});

export function useLenisRef() {
  return useContext(LenisContext);
}

type SmoothScrollProps = {
  children: ReactNode;
};

/**
 * Provides Lenis context immediately, but loads Lenis + GSAP ScrollTrigger
 * after idle or first scroll intent so they stay off the critical path.
 * Also forces every full page load to start at the top (defeats BFCache /
 * hash restore).
 */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

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
    let booted = false;
    let idleId: number | null = null;
    let timeoutId: number | null = null;
    let removeScrollListener: (() => void) | null = null;
    let removeTicker: (() => void) | null = null;

    const tearDown = () => {
      removeTicker?.();
      removeScrollListener?.();
      lenisRef.current?.destroy();
      lenisRef.current = null;
      removeScrollListener = null;
      removeTicker = null;
    };

    const boot = async () => {
      if (cancelled || booted) {
        return;
      }

      booted = true;

      const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger")
        ]);

      if (cancelled) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const instance = new Lenis({
        autoRaf: false,
        smoothWheel: true,
        // Keep touch on native momentum — Safari + sticky video is already heavy.
        syncTouch: false,
        lerp: LENIS_LERP
      });

      lenisRef.current = instance;
      removeScrollListener = instance.on("scroll", ScrollTrigger.update);

      const tickerUpdate = (time: number) => {
        instance.raf(time * 1000);
      };

      gsap.ticker.add(tickerUpdate);
      gsap.ticker.lagSmoothing(0);
      removeTicker = () => {
        gsap.ticker.remove(tickerUpdate);
        gsap.ticker.lagSmoothing(500);
      };

      // Never yank scroll if the user already moved — that kills momentum.
      if (window.scrollY < 1) {
        instance.scrollTo(0, { immediate: true, force: true });
      }
      ScrollTrigger.refresh();
    };

    const scheduleBoot = () => {
      void boot();
    };

    const requestIdle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback.bind(window)
        : null;
    const cancelIdle =
      typeof window.cancelIdleCallback === "function"
        ? window.cancelIdleCallback.bind(window)
        : null;

    if (requestIdle) {
      idleId = requestIdle(scheduleBoot, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(scheduleBoot, 50);
    }

    // If the user scrolls before idle fires, boot immediately so Music keeps Lenis.
    window.addEventListener("wheel", scheduleBoot, { once: true, passive: true });
    window.addEventListener("touchstart", scheduleBoot, {
      once: true,
      passive: true
    });
    window.addEventListener("keydown", scheduleBoot, { once: true });

    return () => {
      cancelled = true;

      if (idleId !== null && cancelIdle) {
        cancelIdle(idleId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      window.removeEventListener("wheel", scheduleBoot);
      window.removeEventListener("touchstart", scheduleBoot);
      window.removeEventListener("keydown", scheduleBoot);
      tearDown();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
  );
}
