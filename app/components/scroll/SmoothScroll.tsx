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
import { isWebKitBrowser } from "../../utils/isWebKit";

/** Modest inertia so About's scrub lag does not feel double-mushy. */
const LENIS_LERP = 0.1;
/** Duration-based smoothing blends Safari's discrete wheel notches more continuously. */
const SAFARI_LENIS_DURATION = 1.15;
const SAFARI_WHEEL_MULTIPLIER = 0.9;

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
 */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
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

      const useSafariSmoothing = isWebKitBrowser();
      const instance = new Lenis({
        autoRaf: false,
        smoothWheel: true,
        // Keep touch on native momentum — Safari + sticky video is already heavy.
        syncTouch: false,
        ...(useSafariSmoothing
          ? {
              duration: SAFARI_LENIS_DURATION,
              wheelMultiplier: SAFARI_WHEEL_MULTIPLIER
            }
          : { lerp: LENIS_LERP })
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

      // Do not scrollTo(0) — that fights an in-flight fling if boot lands mid-scroll.
      // Refresh after the current frame; skip layout thrash while the user is moving.
      const refreshTriggers = () => {
        if (cancelled) {
          return;
        }

        if (window.scrollY === 0) {
          ScrollTrigger.refresh();
          return;
        }

        requestAnimationFrame(() => {
          if (!cancelled) {
            ScrollTrigger.refresh();
          }
        });
      };

      refreshTriggers();
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
