/**
 * Height-stable Music placeholder used while the Music chunk loads.
 * Mirrors Music.tsx paddings, grid, and aspect-square slots so swapping
 * in the real section does not jump document height mid-scroll.
 */
export default function MusicShell() {
  return (
    <section
      id="music"
      className="relative bg-black text-white"
      aria-hidden="true"
    >
      <header className="flex items-center justify-center px-5 py-12 text-center sm:py-16 md:py-20">
        <div
          className="w-full font-display text-[clamp(4.75rem,15vw,12rem)] leading-[0.8] tracking-[-0.06em] text-transparent"
          aria-hidden="true"
        >
          Music
        </div>
      </header>

      <div className="px-5 pb-20 pt-20 sm:px-8 sm:pt-28">
        <div className="mx-auto flex max-w-xs flex-col items-center gap-y-12 sm:max-w-2xl sm:gap-y-14 md:max-w-3xl md:gap-y-16">
          <div className="grid w-full grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14 md:gap-x-16 md:gap-y-16">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="w-full text-center">
                <div className="mb-3 h-5 sm:h-6 md:h-7" />
                <div className="aspect-square w-full rounded-xl bg-black" />
              </div>
            ))}
          </div>
          <div className="w-full sm:w-[calc(50%-1.5rem)] md:w-[calc(50%-2rem)]">
            <div className="w-full text-center">
              <div className="mb-3 h-5 sm:h-6 md:h-7" />
              <div className="aspect-square w-full rounded-xl bg-black" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-20 grid max-w-7xl items-center gap-12 px-5 py-24 sm:px-8 md:grid-cols-[0.9fr_1.1fr] md:py-32">
        <div className="text-center md:text-left">
          <div className="h-[2.75rem] sm:h-[clamp(3.5rem,2.5rem+2.5vw,4.5rem)]" />
          <div className="mt-7 h-6 sm:h-7" />
        </div>
        <div className="flex justify-center md:justify-end">
          <div className="aspect-square w-full max-w-[520px] rounded-md bg-black" />
        </div>
      </div>
    </section>
  );
}
