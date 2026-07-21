"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SHORT_VIEWPORT_QUERY = "(max-height: 499px)";
const MOBILE_LANDSCAPE_QUERY =
  "(hover: none) and (pointer: coarse) and (orientation: landscape)";

const MemeGate = dynamic(() => import("./MemeGate"), { ssr: false });

/** Loads the meme blackout UI only when a short / landscape viewport needs it. */
export default function DeferredMemeGate() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const shortViewport = window.matchMedia(SHORT_VIEWPORT_QUERY);
    const mobileLandscape = window.matchMedia(MOBILE_LANDSCAPE_QUERY);
    const mediaQueries = [shortViewport, mobileLandscape];

    const sync = () => {
      if (shortViewport.matches || mobileLandscape.matches) {
        setShouldLoad(true);
      }
    };

    sync();
    mediaQueries.forEach((media) => media.addEventListener("change", sync));

    return () => {
      mediaQueries.forEach((media) =>
        media.removeEventListener("change", sync)
      );
    };
  }, []);

  if (!shouldLoad) {
    return null;
  }

  return <MemeGate />;
}
