"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const COLUMN_COUNT = 12;
const COLUMN_DROP_DURATION = 1.2;
const COLUMN_STAGGER = 0.56;

const WAVE_BAR_COUNT = 48;
const SMALL_CURSOR_INFLUENCE_RADIUS = 50;
const MEDIUM_CURSOR_INFLUENCE_RADIUS = 100;
const TAILWIND_SMALL_QUERY = "(min-width: 640px)";
const TAILWIND_MEDIUM_QUERY = "(min-width: 768px)";
const GRADIENT_CYCLE_DURATION = 24;
const GRADIENT_COLORS = [
  { hue: 342.8, saturation: 100, lightness: 56.9 },
  { hue: 390.1, saturation: 100, lightness: 50 },
  { hue: 414.1, saturation: 100, lightness: 50 },
  { hue: 480, saturation: 100, lightness: 61.8 },
  { hue: 557.8, saturation: 78.7, lightness: 53.9 },
  { hue: 607.4, saturation: 100, lightness: 56.9 },
  { hue: 660, saturation: 100, lightness: 50 },
  { hue: 702.8, saturation: 100, lightness: 56.9 }
] as const;

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

function getColumnDelay(index: number) {
  return Math.min(index, COLUMN_COUNT - 1 - index) * COLUMN_STAGGER;
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

function getWaveColor(hue: number) {
  let endIndex = 1;

  while (endIndex < GRADIENT_COLORS.length - 1 && hue > GRADIENT_COLORS[endIndex].hue) {
    endIndex += 1;
  }

  const startColor = GRADIENT_COLORS[endIndex - 1];
  const endColor = GRADIENT_COLORS[endIndex];
  const progress = (hue - startColor.hue) / (endColor.hue - startColor.hue);

  return {
    hue,
    saturation: startColor.saturation + (endColor.saturation - startColor.saturation) * progress,
    lightness: startColor.lightness + (endColor.lightness - startColor.lightness) * progress
  };
}

export default function Hero({ onIntroComplete }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const waveBarRefs = useRef<HTMLSpanElement[]>([]);
  const gradientBarRefs = useRef<HTMLSpanElement[]>([]);
  const whiteBarRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const wave = waveRef.current;

    if (!section || !wave) {
      return;
    }

    const waveBars = waveBarRefs.current.filter(Boolean);
    const gradientBars = gradientBarRefs.current.filter(Boolean);
    const whiteBars = whiteBarRefs.current.filter(Boolean);
    const interactiveMedia = window.matchMedia(TAILWIND_SMALL_QUERY);
    const revealGradientTo = gradientBars.map((bar) =>
      gsap.quickTo(bar, "opacity", {
        duration: 0.22,
        ease: "power3.out"
      })
    );
    const revealWhiteTo = whiteBars.map((bar) =>
      gsap.quickTo(bar, "opacity", {
        duration: 0.22,
        ease: "power3.out"
      })
    );

      const gradientPhase = { hue: GRADIENT_COLORS[0].hue };

      gsap.set(gradientBars, { opacity: 0 });
      gsap.set(whiteBars, { opacity: 1 });

      const applyGradientPhase = () => {
        const color = getWaveColor(gradientPhase.hue);

        wave.style.setProperty("--wave-hue", color.hue.toString());
        wave.style.setProperty("--wave-saturation", `${color.saturation}%`);
        wave.style.setProperty("--wave-lightness", `${color.lightness}%`);
      };

      applyGradientPhase();

      const gradientTween = gsap.to(gradientPhase, {
        hue: GRADIENT_COLORS[GRADIENT_COLORS.length - 1].hue,
        duration: GRADIENT_CYCLE_DURATION,
        ease: "none",
        repeat: -1,
        onUpdate: applyGradientPhase
      });

      const resetWave = () => {
        revealGradientTo.forEach((reveal) => reveal(0));
        revealWhiteTo.forEach((reveal) => reveal(1));
      };

      const updateWaveFromPointer = (event: PointerEvent) => {
        if (!interactiveMedia.matches) {
          return;
        }

        const waveBounds = wave.getBoundingClientRect();
        const influenceRadius = window.matchMedia(TAILWIND_MEDIUM_QUERY).matches
          ? MEDIUM_CURSOR_INFLUENCE_RADIUS
          : SMALL_CURSOR_INFLUENCE_RADIUS;
        const verticalDistance =
          event.clientY < waveBounds.top
            ? waveBounds.top - event.clientY
            : event.clientY > waveBounds.bottom
              ? event.clientY - waveBounds.bottom
              : 0;

        waveBars.forEach((bar, index) => {
          const barBounds = bar.getBoundingClientRect();
          const horizontalDistance = Math.abs(event.clientX - (barBounds.left + barBounds.width / 2));
          const distance = Math.hypot(horizontalDistance, verticalDistance);
          const proximity = Math.max(0, 1 - distance / influenceRadius);
          const revealStrength = 1 - Math.pow(1 - proximity, 3);

          revealGradientTo[index](revealStrength);
          revealWhiteTo[index](1 - revealStrength);
        });
      };

      const handleSectionPointerMove = (event: PointerEvent) => {
        if (event.pointerType === "mouse") {
          updateWaveFromPointer(event);
        }
      };

      const handleWavePointerDown = (event: PointerEvent) => {
        if (!interactiveMedia.matches || event.pointerType === "mouse") {
          return;
        }

        wave.setPointerCapture(event.pointerId);
        updateWaveFromPointer(event);
      };

      const handleWavePointerMove = (event: PointerEvent) => {
        if (
          interactiveMedia.matches &&
          event.pointerType !== "mouse" &&
          wave.hasPointerCapture(event.pointerId)
        ) {
          updateWaveFromPointer(event);
        }
      };

      const handleWavePointerEnd = (event: PointerEvent) => {
        if (event.pointerType === "mouse") {
          return;
        }

        if (wave.hasPointerCapture(event.pointerId)) {
          wave.releasePointerCapture(event.pointerId);
        }

        resetWave();
      };

      section.addEventListener("pointerdown", handleSectionPointerMove);
      section.addEventListener("pointermove", handleSectionPointerMove);
      section.addEventListener("pointerleave", resetWave);
      wave.addEventListener("pointerdown", handleWavePointerDown);
      wave.addEventListener("pointermove", handleWavePointerMove);
      wave.addEventListener("pointerup", handleWavePointerEnd);
      wave.addEventListener("pointercancel", handleWavePointerEnd);
      interactiveMedia.addEventListener("change", resetWave);
      window.addEventListener("blur", resetWave);

    return () => {
      section.removeEventListener("pointerdown", handleSectionPointerMove);
      section.removeEventListener("pointermove", handleSectionPointerMove);
      section.removeEventListener("pointerleave", resetWave);
      wave.removeEventListener("pointerdown", handleWavePointerDown);
      wave.removeEventListener("pointermove", handleWavePointerMove);
      wave.removeEventListener("pointerup", handleWavePointerEnd);
      wave.removeEventListener("pointercancel", handleWavePointerEnd);
      interactiveMedia.removeEventListener("change", resetWave);
      window.removeEventListener("blur", resetWave);
      gradientTween.kill();
      gsap.killTweensOf([...gradientBars, ...whiteBars]);
      gsap.set([...gradientBars, ...whiteBars], { clearProps: "opacity" });
      wave.style.removeProperty("--wave-hue");
      wave.style.removeProperty("--wave-saturation");
      wave.style.removeProperty("--wave-lightness");
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      tabIndex={-1}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-black px-5 text-white focus:outline-none md:min-h-screen"
    >
      <div className="pointer-events-none absolute inset-0 z-10 bg-white" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0 z-20 flex overflow-hidden" aria-hidden="true">
        {Array.from({ length: COLUMN_COUNT }).map((_, index) => (
          <div
            key={index}
            className="hero-reveal-bar h-full bg-black"
            style={{
              animationDelay: `${getColumnDelay(index)}s`,
              animationDuration: `${COLUMN_DROP_DURATION}s`,
              width: `calc(${100 / COLUMN_COUNT}% + 2px)`,
              marginLeft: "-1px"
            }}
          />
        ))}
      </div>

      <div className="hero-lockup pointer-events-none relative z-30 flex w-full max-w-5xl flex-col items-center">
        <div className="flex w-fit max-w-full flex-col items-stretch gap-[var(--hero-logo-wave-gap)]">
          <h1
            className="w-max select-none whitespace-nowrap text-center font-display text-[length:var(--hero-logo-size)] leading-none text-white"
            aria-label="KALO"
          >
            KΛLO
          </h1>

          <div
            ref={waveRef}
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
                <span
                  key={index}
                  ref={(node) => {
                    if (node) {
                      waveBarRefs.current[index] = node;
                    }
                  }}
                  className="hero-wave-reactor flex h-full flex-1 items-center"
                >
                  <span
                    data-wave-bar
                    className="hero-wave-bar relative block w-full rounded-full"
                    style={{
                      animationDelay: `calc(var(--hero-reveal-duration) + ${getWaveBarDelay(index).toFixed(3)}s)`,
                      animationDuration: `${getWaveBarDuration(index).toFixed(3)}s`,
                      height: `${height}%`
                    }}
                  >
                    <span
                      ref={(node) => {
                        if (node) {
                          gradientBarRefs.current[index] = node;
                        }
                      }}
                      className="hero-wave-gradient-bar absolute inset-0 rounded-full"
                    />
                    <span
                      ref={(node) => {
                        if (node) {
                          whiteBarRefs.current[index] = node;
                        }
                      }}
                      className="hero-wave-white-bar absolute inset-0 rounded-full bg-white shadow-[0_0_26px_rgba(255,255,255,0.4)]"
                    />
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
