"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./Header";
import Hero from "./Hero";

const INTRO_SCROLL_LOCK_CLASS = "intro-scroll-locked";
const INTRO_SKIPPED_CLASS = "intro-skip-complete";
const SKIP_REVEAL_DELAY_MS = 500;
const INTRO_NATURAL_COMPLETION_MS = 5250;
const SKIP_EXIT_LEAD_MS = 2000;
const SKIP_EXIT_DELAY_MS = INTRO_NATURAL_COMPLETION_MS - SKIP_EXIT_LEAD_MS;
const NATURAL_COMPLETION_FALLBACK_MS = 6500;
const BLACKOUT_COVER_DURATION_MS = 180;
const BLACKOUT_REVEAL_DURATION_MS = 250;
const TRANSITION_FALLBACK_BUFFER_MS = 100;

type IntroPhase = "running" | "covering" | "revealing" | "complete";

export default function Intro() {
  const [phase, setPhase] = useState<IntroPhase>("running");
  const [isSkipAvailable, setIsSkipAvailable] = useState(false);
  const [isSkipExiting, setIsSkipExiting] = useState(false);
  const phaseRef = useRef<IntroPhase>("running");

  const changePhase = useCallback((nextPhase: IntroPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const completeNaturally = useCallback(() => {
    if (phaseRef.current !== "running") {
      return;
    }

    document.documentElement.classList.remove(INTRO_SKIPPED_CLASS);
    document.documentElement.classList.remove(INTRO_SCROLL_LOCK_CLASS);
    changePhase("complete");
  }, [changePhase]);

  const beginReveal = useCallback(() => {
    if (phaseRef.current !== "covering") {
      return;
    }

    document.documentElement.classList.add(INTRO_SKIPPED_CLASS);
    changePhase("revealing");
  }, [changePhase]);

  const finishSkippedIntro = useCallback(() => {
    if (phaseRef.current !== "revealing") {
      return;
    }

    document.documentElement.classList.remove(INTRO_SCROLL_LOCK_CLASS);
    changePhase("complete");

    window.requestAnimationFrame(() => {
      const hero = document.getElementById("top");

      if (hero instanceof HTMLElement) {
        hero.focus({ preventScroll: true });
      }
    });
  }, [changePhase]);

  useEffect(() => {
    const skipRevealTimer = window.setTimeout(() => {
      if (phaseRef.current === "running") {
        setIsSkipAvailable(true);
      }
    }, SKIP_REVEAL_DELAY_MS);
    const skipExitTimer = window.setTimeout(() => {
      if (phaseRef.current === "running") {
        setIsSkipExiting(true);
      }
    }, SKIP_EXIT_DELAY_MS);
    const naturalCompletionFallback = window.setTimeout(
      completeNaturally,
      NATURAL_COMPLETION_FALLBACK_MS
    );

    return () => {
      window.clearTimeout(skipRevealTimer);
      window.clearTimeout(skipExitTimer);
      window.clearTimeout(naturalCompletionFallback);
    };
  }, [completeNaturally]);

  useEffect(() => {
    if (phase === "covering") {
      const coverFallback = window.setTimeout(
        beginReveal,
        BLACKOUT_COVER_DURATION_MS + TRANSITION_FALLBACK_BUFFER_MS
      );

      return () => window.clearTimeout(coverFallback);
    }

    if (phase === "revealing") {
      const revealFallback = window.setTimeout(
        finishSkippedIntro,
        BLACKOUT_REVEAL_DURATION_MS + TRANSITION_FALLBACK_BUFFER_MS
      );

      return () => window.clearTimeout(revealFallback);
    }

    return;
  }, [beginReveal, finishSkippedIntro, phase]);

  useEffect(
    () => () => {
      document.documentElement.classList.remove(INTRO_SCROLL_LOCK_CLASS);
      document.documentElement.classList.remove(INTRO_SKIPPED_CLASS);
    },
    []
  );

  const handleSkip = () => {
    if (phaseRef.current !== "running" || !isSkipAvailable || isSkipExiting) {
      return;
    }

    changePhase("covering");
  };

  const isIntroComplete = phase === "revealing" || phase === "complete";
  const isBlackoutMounted = phase !== "complete";

  return (
    <>
      <Header isIntroComplete={isIntroComplete} />
      <Hero onIntroComplete={completeNaturally} />

      {isSkipAvailable && (phase === "running" || phase === "covering") ? (
        <div
          className={`intro-skip-control ${
            phase === "running"
              ? isSkipExiting
                ? "intro-skip-control-exiting"
                : "intro-skip-control-visible"
              : ""
          }`}
        >
          <button
            type="button"
            className="intro-skip-button"
            onClick={handleSkip}
            disabled={phase !== "running" || isSkipExiting}
            aria-label="Skip intro animation"
          >
            Skip
          </button>
        </div>
      ) : null}

      {isBlackoutMounted ? (
        <div
          aria-hidden="true"
          className={`intro-skip-blackout ${
            phase === "covering"
              ? "intro-skip-blackout-covering"
              : phase === "revealing"
                ? "intro-skip-blackout-revealing"
                : ""
          }`}
          onTransitionEnd={(event) => {
            if (event.currentTarget !== event.target || event.propertyName !== "opacity") {
              return;
            }

            if (phaseRef.current === "covering") {
              beginReveal();
            } else if (phaseRef.current === "revealing") {
              finishSkippedIntro();
            }
          }}
        />
      ) : null}
    </>
  );
}
