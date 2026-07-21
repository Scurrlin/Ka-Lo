"use client";

import Header from "./Header";
import Hero from "./Hero";

type IntroProps = {
  isIntroComplete: boolean;
  onIntroComplete: () => void;
};

export default function Intro({ isIntroComplete, onIntroComplete }: IntroProps) {
  return (
    <>
      <Header isIntroComplete={isIntroComplete} />
      <Hero onIntroComplete={onIntroComplete} />
    </>
  );
}
