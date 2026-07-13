const COLUMN_COUNT = 12;
const COLUMN_DROP_DURATION = 1.2;
const COLUMN_STAGGER = 0.56;

const WAVE_BAR_COUNT = 48;
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

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 text-white"
    >
      <div className="absolute inset-0 z-10 bg-white" aria-hidden="true" />

      <div className="absolute inset-0 z-20 flex overflow-hidden" aria-hidden="true">
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

      <div className="relative z-30 flex w-full max-w-5xl -translate-y-[8%] flex-col items-center">
        <h1
          className="font-display select-none text-center text-7xl leading-none text-white sm:text-8xl md:text-9xl lg:text-[11rem] xl:text-[13rem]"
          aria-label="KALO"
        >
          KΛLO
        </h1>
      </div>

      <div
        className="hero-sound-wave absolute bottom-[clamp(2rem,7vh,4.75rem)] left-1/2 z-30 flex h-[clamp(6rem,15vw,11rem)] w-[min(80vw,46rem)] items-center justify-center"
        aria-hidden="true"
      >
        <div className="flex h-full w-full items-center justify-between gap-[clamp(0.1rem,0.4vw,0.4rem)]">
          {WAVE_BARS.map((height, index) => (
            <span
              key={index}
              data-wave-bar
              className="hero-wave-bar block flex-1 rounded-full bg-white shadow-[0_0_26px_rgba(255,255,255,0.4)]"
              style={{
                animationDelay: `calc(var(--hero-reveal-duration) + ${getWaveBarDelay(index).toFixed(3)}s)`,
                animationDuration: `${getWaveBarDuration(index).toFixed(3)}s`,
                height: `${height}%`
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
