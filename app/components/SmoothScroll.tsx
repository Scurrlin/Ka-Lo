"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject
} from "react";

/** Modest inertia so About's scrub lag does not feel double-mushy. */
const LENIS_LERP = 0.1;

const LenisContext = createContext<RefObject<Lenis | null>>({
  current: null
});

export function useLenisRef() {
  return useContext(LenisContext);
}

/** Latest Lenis instance, if mounted. Prefer reading this at event time. */
export function useLenis() {
  return useContext(LenisContext).current;
}

type SmoothScrollProps = {
  children: ReactNode;
};

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const instance = new Lenis({
      autoRaf: false,
      lerp: LENIS_LERP,
      smoothWheel: true,
      // Keep touch on native momentum — Safari + sticky video is already heavy.
      syncTouch: false
    });

    lenisRef.current = instance;

    const removeScrollListener = instance.on("scroll", ScrollTrigger.update);

    const tickerUpdate = (time: number) => {
      instance.raf(time * 1000);
    };

    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);
    instance.scrollTo(0, { immediate: true, force: true });
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tickerUpdate);
      removeScrollListener();
      instance.destroy();
      lenisRef.current = null;
      gsap.ticker.lagSmoothing(500);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
  );
}
