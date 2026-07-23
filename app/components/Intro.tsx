"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import Hero from "./Hero";
import { ASSET_TIMEOUT_MS, preloadVideos } from "../utils/videos";

const INTRO_SCROLL_LOCK_CLASS = "intro-scroll-locked";
const INTRO_SCROLL_LOCK_KEYS = new Set([
  " ",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp"
]);

// window.load never waits on JS-initiated dynamic imports or <video> network
// activity (both are spec-excluded from load-blocking), so it's only a
// best-effort signal on its own. This caps how long the real asset checks
// below are allowed to hold up the reveal if something stalls entirely.

export default function Intro() {
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isLogoRevealComplete, setIsLogoRevealComplete] = useState(false);
  const [isWaveRevealComplete, setIsWaveRevealComplete] = useState(false);
  const [isWindowLoaded, setIsWindowLoaded] = useState(false);
  const [areAssetsReady, setAreAssetsReady] = useState(false);

  useEffect(() => {
    if (isIntroComplete) {
      document.documentElement.classList.remove(INTRO_SCROLL_LOCK_CLASS);
      return;
    }

    const root = document.documentElement;
    const lockToTop = () => {
      window.scrollTo(0, 0);
    };
    const blockScroll = (event: Event) => {
      event.preventDefault();
      lockToTop();
    };
    const blockScrollKeys = (event: KeyboardEvent) => {
      if (INTRO_SCROLL_LOCK_KEYS.has(event.key)) {
        blockScroll(event);
      }
    };

    root.classList.add(INTRO_SCROLL_LOCK_CLASS);
    lockToTop();

    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });
    window.addEventListener("keydown", blockScrollKeys, true);

    return () => {
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
      window.removeEventListener("keydown", blockScrollKeys, true);
      root.classList.remove(INTRO_SCROLL_LOCK_CLASS);
    };
  }, [isIntroComplete]);

  // Warm every section's chunk during the hero, and actually wait for
  // Music's cover decode + About's video readiness — not just fire-and-forget
  // — so the reveal is a real guarantee rather than a best-effort head start.
  useEffect(() => {
    let cancelled = false;

    const warmSections = async () => {
      const [musicModule, aboutModule] = await Promise.all([
        import("./Music"),
        import("./About"),
        import("./Lyrics")
      ]);

      if (cancelled) {
        return;
      }

      await Promise.all([
        musicModule.preloadMusicCovers(),
        preloadVideos(aboutModule.VIDEO_SOURCES)
      ]);
    };

    const timeout = new Promise<void>((resolve) => {
      window.setTimeout(resolve, ASSET_TIMEOUT_MS);
    });

    void Promise.race([warmSections(), timeout]).then(() => {
      if (!cancelled) {
        setAreAssetsReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleLoad = () => {
      setIsWindowLoaded(true);
    };

    if (document.readyState === "complete") {
      handleLoad();
      return;
    }

    window.addEventListener("load", handleLoad, { once: true });

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  // Hold a black screen until load + assets are ready, then start letters.
  // Safari desktop otherwise starts the CSS reveal on mount while assets
  // are still pending (Chrome / mobile Safari usually paint late enough to hide it).
  const isIntroStartReady = isWindowLoaded && areAssetsReady;
  const isWaveRevealReady = isLogoRevealComplete && isIntroStartReady;
  const isHeaderRevealReady = isWaveRevealComplete && isIntroStartReady;

  return (
    <>
      <Header
        isIntroComplete={isIntroComplete}
        isHeaderRevealReady={isHeaderRevealReady}
        onIntroComplete={() => setIsIntroComplete(true)}
      />
      <Hero
        isIntroStartReady={isIntroStartReady}
        isWaveActive={isHeaderRevealReady}
        isWaveRevealReady={isWaveRevealReady}
        onLogoRevealComplete={() => setIsLogoRevealComplete(true)}
        onWaveRevealComplete={() => setIsWaveRevealComplete(true)}
      />
    </>
  );
}
