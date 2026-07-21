"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const HERO_LOGO_TEXT = "KΛLO";
const LOGO_CHAR_REVEAL_DURATION = 1.2;
const LOGO_CHAR_STAGGER = 0.3;
// Total until the last letter finishes. Must match --hero-reveal-duration in globals.css.
const LOGO_REVEAL_TOTAL_SECONDS =
  LOGO_CHAR_REVEAL_DURATION + LOGO_CHAR_STAGGER * (HERO_LOGO_TEXT.length - 1);

const WAVE_BAR_COUNT = 48;

type HeroProps = {
  onIntroComplete: () => void;
};

const WAVE_BARS = Array.from({ length: WAVE_BAR_COUNT }, (_, index) => {
  const t = index / (WAVE_BAR_COUNT - 1);
  const envelope = Math.sin(t * Math.PI);
  const ripple = Math.sin(t * Math.PI * 6.2) * 0.5 + Math.sin(t * Math.PI * 11.5 + 1.1) * 0.3;
  const heightPct = 20 + envelope * 58 + ripple * envelope * 18;
  return Math.max(10, Math.min(100, Math.round(heightPct)));
});

// Splits the logo text into individually-ref'd spans so it can be revealed
// letter by letter, matching the same technique used for section titles in
// Lyrics.tsx and Music.tsx.
function LogoCharacters({
  text,
  onCharRef
}: {
  text: string;
  onCharRef: (node: HTMLSpanElement | null, index: number) => void;
}) {
  return Array.from(text).map((character, index) => (
    <span
      key={index}
      ref={(node) => onCharRef(node, index)}
      className="invisible inline-block opacity-0"
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

export default function Hero({ onIntroComplete }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const logoCharRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const logoChars = logoCharRefs.current.filter(Boolean);

    if (!logoChars.length) {
      return;
    }

    gsap.set(logoChars, { autoAlpha: 0 });
    const reveal = gsap.to(logoChars, {
      autoAlpha: 1,
      duration: LOGO_CHAR_REVEAL_DURATION,
      ease: "none",
      stagger: { each: LOGO_CHAR_STAGGER }
    });

    return () => {
      reveal.kill();
    };
  }, []);

  // Safari keeps infinite CSS animations compositing even when scrolled
  // off-screen; pause the wave once the hero leaves the viewport so the
  // rest of the page can scroll without that background GPU load.
  useEffect(() => {
    const section = sectionRef.current;

    if (!section || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        section.classList.toggle("hero-waves-paused", !entry.isIntersecting);
      },
      { rootMargin: "10% 0px" }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      section.classList.remove("hero-waves-paused");
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      tabIndex={-1}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-black px-5 text-white focus:outline-none md:min-h-screen"
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
                onCharRef={(node, index) => {
                  if (node) {
                    logoCharRefs.current[index] = node;
                  }
                }}
              />
            </span>
          </h1>

          <div
            className="hero-sound-wave flex h-[var(--hero-wave-height)] w-full items-center justify-center"
            aria-hidden="true"
            onAnimationEnd={(event) => {
              if (
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
                    className="hero-wave-bar relative block w-full rounded-full bg-white"
                    style={{
                      animationDelay: `calc(var(--hero-reveal-duration) + ${getWaveBarDelay(index).toFixed(3)}s)`,
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
