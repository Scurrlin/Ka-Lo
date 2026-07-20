"use client";

import { useState } from "react";
import Header from "./Header";
import Hero from "./Hero";

export default function Intro() {
  const [isIntroComplete, setIsIntroComplete] = useState(false);

  return (
    <>
      <Header isIntroComplete={isIntroComplete} />
      <Hero onIntroComplete={() => setIsIntroComplete(true)} />
    </>
  );
}
