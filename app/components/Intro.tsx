"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import Hero from "./Hero";

export default function Intro() {
  const [isIntroComplete, setIsIntroComplete] = useState(false);

  // Warm the Music chunk during the hero so height + images settle before scroll.
  useEffect(() => {
    void import("./Music");
  }, []);

  return (
    <>
      <Header isIntroComplete={isIntroComplete} />
      <Hero onIntroComplete={() => setIsIntroComplete(true)} />
    </>
  );
}
