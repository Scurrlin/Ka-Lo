"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import Hero from "./Hero";

export default function Intro() {
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isLogoRevealComplete, setIsLogoRevealComplete] = useState(false);
  const [isSiteLoaded, setIsSiteLoaded] = useState(false);

  // Warm the Music chunk during the hero so height + images settle before scroll.
  useEffect(() => {
    void import("./Music");
  }, []);

  useEffect(() => {
    const handleLoad = () => {
      setIsSiteLoaded(true);
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

  const isRevealReady = isLogoRevealComplete && isSiteLoaded;

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
