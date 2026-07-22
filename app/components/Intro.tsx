"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import Hero from "./Hero";
import { preloadVideos } from "../utils/videos";

// window.load never waits on JS-initiated dynamic imports or <video> network
// activity (both are spec-excluded from load-blocking), so it's only a
// best-effort signal on its own. This caps how long the real asset checks
// below are allowed to hold up the reveal if something stalls entirely.
const ASSETS_READY_TIMEOUT_MS = 9000;

export default function Intro() {
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isLogoRevealComplete, setIsLogoRevealComplete] = useState(false);
  const [isWindowLoaded, setIsWindowLoaded] = useState(false);
  const [areAssetsReady, setAreAssetsReady] = useState(false);

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
      window.setTimeout(resolve, ASSETS_READY_TIMEOUT_MS);
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

  const isRevealReady =
    isLogoRevealComplete && isWindowLoaded && areAssetsReady;

  return (
    <>
      <Header
        isIntroComplete={isIntroComplete}
        isRevealReady={isRevealReady}
      />
      <Hero
        isRevealReady={isRevealReady}
        onIntroComplete={() => setIsIntroComplete(true)}
        onLogoRevealComplete={() => setIsLogoRevealComplete(true)}
      />
    </>
  );
}
