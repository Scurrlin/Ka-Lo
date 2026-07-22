"use client";

import { useEffect, useRef } from "react";

const HERO_LOGO_TEXT = "KΛLO";
const LOGO_CHAR_REVEAL_DURATION = 1.5;
const LOGO_CHAR_STAGGER = 0.5;
// Total until the last letter finishes: 1.5 + 0.5 × 3 = 3 seconds.

const WAVE_BAR_COUNT = 48;

type HeroProps = {
  isRevealReady: boolean;
  onIntroComplete: () => void;
  onLogoRevealComplete: () => void;
};

const WAVE_BARS = Array.from({ length: WAVE_BAR_COUNT }, (_, index) => {
  const t = index / (WAVE_BAR_COUNT - 1);
  const envelope = Math.sin(t * Math.PI);
  const ripple = Math.sin(t * Math.PI * 6.2) * 0.5 + Math.sin(t * Math.PI * 11.5 + 1.1) * 0.3;
  const heightPct = 20 + envelope * 58 + ripple * envelope * 18;
  return Math.max(10, Math.min(100, Math.round(heightPct)));
});

// CSS letter reveal keeps GSAP off the intro critical path.
function LogoCharacters({
  onRevealComplete,
  text
}: {
  onRevealComplete: () => void;
  text: string;
}) {
  return Array.from(text).map((character, index) => (
    <span
      key={index}
      className="hero-logo-char inline-block"
      onAnimationEnd={
        index === text.length - 1 ? onRevealComplete : undefined
      }
      style={{
        animationDelay: `${(index * LOGO_CHAR_STAGGER).toFixed(3)}s`,
        animationDuration: `${LOGO_CHAR_REVEAL_DURATION}s`
      }}
    >
      {character}
    </span>
  ));
}

// Deterministic pseudo-random unit value (0-1) so the wave's pulse pattern
// looks organically sporadic on every render without relying on client JS.
function hashUnit(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function getWaveBarDuration(index: number) {
  // Short, uneven cycle lengths so neighboring bars drift out of phase
  // quickly instead of pulsing together like a smooth traveling wave.
  return 0.62 + hashUnit(index * 7.13 + 1.7) * 0.68;
}

function getWaveBarDelay(index: number) {
  const jitter = (hashUnit(index * 3.1 + 0.4) - 0.5) * 0.5;
  return 0.56 + index * 0.018 + jitter;
}

export default function Hero({
  isRevealReady,
  onIntroComplete,
  onLogoRevealComplete
}: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Pause the infinite wave pulse while the hero is offscreen so Safari isn't
  // compositing 48 looping animations during the rest of the page scroll.
  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const syncWavePlayback = (isVisible: boolean) => {
      section.classList.toggle("hero-waves-active", isVisible);
    };

    syncWavePlayback(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        syncWavePlayback(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      section.classList.remove("hero-waves-active");
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      tabIndex={-1}
      className={`hero-waves-active relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-black px-5 text-white focus:outline-none md:min-h-screen ${
        isRevealReady ? "hero-reveal-ready" : ""
      }`}
    >
      <div className="hero-lockup pointer-events-none relative z-30 flex w-full max-w-5xl flex-col items-center">
        <div className="flex w-fit max-w-full flex-col items-stretch gap-[var(--hero-logo-wave-gap)]">
          <h1
            className="w-max select-none whitespace-nowrap text-center font-display text-[length:var(--hero-logo-size)] leading-none text-white"
            aria-label="KALO"
          >
            <span aria-hidden="true">
              <LogoCharacters
                text={HERO_LOGO_TEXT}
                onRevealComplete={onLogoRevealComplete}
              />
            </span>
          </h1>

          <div
            className="hero-sound-wave flex h-[var(--hero-wave-height)] w-full items-center justify-center"
            aria-hidden="true"
            onAnimationEnd={(event) => {
              if (
                isRevealReady &&
                event.currentTarget === event.target &&
                event.animationName === "hero-wave-rise"
              ) {
                onIntroComplete();
              }
            }}
          >
            <div className="flex h-full w-full items-center justify-between gap-[clamp(0.1rem,0.4vw,0.4rem)]">
              {WAVE_BARS.map((height, index) => (
                <span key={index} className="hero-wave-reactor flex h-full flex-1 items-center">
                  <span
                    className="hero-wave-bar relative block w-full rounded-full bg-white shadow-[0_0_26px_rgba(255,255,255,0.4)]"
                    style={{
                      animationDelay: `${getWaveBarDelay(index).toFixed(3)}s`,
                      animationDuration: `${getWaveBarDuration(index).toFixed(3)}s`,
                      height: `${height}%`
                    }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
