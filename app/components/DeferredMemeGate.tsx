"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  getBlackoutMediaQueries,
  matchesBlackoutViewport
} from "../utils/blackout";

const MemeGate = dynamic(() => import("./MemeGate"), { ssr: false });

/** Loads the meme blackout UI only when a short / landscape viewport needs it. */
export default function DeferredMemeGate() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const mediaQueries = getBlackoutMediaQueries();

    const sync = () => {
      if (matchesBlackoutViewport(mediaQueries)) {
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
