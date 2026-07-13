"use client";

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const INTRO_LINE_1 = "And now...";
const INTRO_LINE_2 = "The Music";

type Album = {
  id: string;
  name: string;
  image: string;
};

// The first four sit in a 2x2 grid, in this order (top-left, top-right, bottom-left,
// bottom-right); the fifth is centered in the gap between them.
const ALBUMS: Album[] = [
  { id: "melody", name: "Melody", image: "/assets/Melody.jpeg" },
  { id: "exercises", name: "Exercises", image: "/assets/Exercises.png" },
  { id: "silver-cracks", name: "Silver Cr\u039Bcks", image: "/assets/silver-cracks.png" },
  { id: "deep-end", name: "Deep End", image: "/assets/Deep End - Single.png" },
  {
    id: "kings-road",
    name: "King's Ro\u039Bd",
    image: "/assets/King\u2019s Road - Single.png"
  }
];

const CORNER_ALBUMS = ALBUMS.slice(0, 4);
const CENTER_ALBUM = ALBUMS[4];

// Splits text into individually-ref'd spans so it can be revealed character by character,
// matching the reveal technique already used in About.tsx. Each word's characters are
// grouped inside their own `whitespace-nowrap` span, with a plain breakable space as a
// sibling between words (not inside either one) - so the only place a line can ever wrap
// is between words, never in the middle of one.
function CharSpans({
  text,
  onCharRef
}: {
  text: string;
  onCharRef: (element: HTMLSpanElement | null, index: number) => void;
}) {
  const words = text.split(" ");
  let charIndex = 0;

  return (
    <>
      {words.map((word, wordIndex) => (
        <Fragment key={wordIndex}>
          {wordIndex > 0 && " "}
          <span className="inline-block whitespace-nowrap">
            {word.split("").map((char) => {
              const index = charIndex++;
              return (
                <span key={index} ref={(node) => onCharRef(node, index)} className="inline-block">
                  {char}
                </span>
              );
            })}
          </span>
        </Fragment>
      ))}
    </>
  );
}

function AlbumCard({ album }: { album: Album }) {
  return (
    <div className="album-card w-full text-center">
      <p className="mb-3 font-display text-lg uppercase leading-none tracking-wide text-white sm:text-xl md:text-2xl">
        {album.name}
      </p>
      <div className="album-cover relative aspect-square w-full overflow-hidden rounded-xl">
        <Image
          src={album.image}
          alt={`${album.name} album cover`}
          fill
          sizes="(max-width: 640px) 45vw, 320px"
          className="object-cover"
        />
      </div>
    </div>
  );
}

export default function Music() {
  const sectionRef = useRef<HTMLElement>(null);
  const introSectionRef = useRef<HTMLDivElement>(null);
  const introLine1Ref = useRef<HTMLHeadingElement>(null);
  const introLine2Ref = useRef<HTMLHeadingElement>(null);
  const introLine1CharsRef = useRef<HTMLSpanElement[]>([]);
  const introLine2CharsRef = useRef<HTMLSpanElement[]>([]);
  const albumsGridRef = useRef<HTMLDivElement>(null);

  const solusImageRef = useRef<HTMLDivElement>(null);
  const solusTextRef = useRef<HTMLDivElement>(null);
  const solusHeadingCharsRef = useRef<HTMLSpanElement[]>([]);
  const solusSubCharsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const introSection = introSectionRef.current;

    if (!section || !introSection) {
      return;
    }

    const ctx = gsap.context(() => {
      const introLine1 = introLine1Ref.current;
      const introLine2 = introLine2Ref.current;
      const introLine1Chars = introLine1CharsRef.current.filter(Boolean);
      const introLine2Chars = introLine2CharsRef.current.filter(Boolean);
      const albumsGrid = albumsGridRef.current;
      const solusHeadingChars = solusHeadingCharsRef.current.filter(Boolean);
      const solusSubChars = solusSubCharsRef.current.filter(Boolean);

      gsap.set([...introLine1Chars, ...introLine2Chars], { autoAlpha: 0, y: 26 });
      gsap.set([introLine1, introLine2].filter(Boolean) as HTMLElement[], { y: 0 });
      gsap.set([...solusHeadingChars, ...solusSubChars], { autoAlpha: 0, y: 16 });

      // Intro: pinned and scroll-scrubbed, exactly like "Meet The Team" in the About
      // section above - the whole intro block itself is the pinned element (not a
      // separate `fixed` overlay), so the text inside it is just `absolute` within that
      // pinned block. That keeps it moving in lockstep with GSAP's pin transform, and
      // once the pin releases, this block scrolls away like any other page content,
      // handing off straight to the album grid right below it. "And now..." reveals
      // character by character, holds briefly, then slides up and fades out entirely;
      // only once it's fully gone does "The Music" reveal in its place and just stays,
      // with no exit of its own.
      // Scrub is unsmoothed (`true`, not a lag value) so the animated state can never
      // fall behind raw scroll position. The pin gets a generous scroll distance so
      // "And now..." always has enough room to fully clear before "The Music" appears,
      // rather than feeling rushed.
      const introTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: introSection,
          start: "top top",
          end: () => "+=" + window.innerHeight * 2.1,
          scrub: true,
          pin: introSection,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      // Each line holds fully visible for a beat before starting its exit - a bit under
      // About.tsx's own LINE_HOLD_DURATION, since a full beat felt like too long a pause
      // here for two short lines rather than a whole rotating cast of them.
      const HOLD_DURATION = 1.2;

      introTl
        .to(introLine1Chars, { autoAlpha: 1, y: 0, duration: 0.5, stagger: { each: 0.03 } }, 0)
        .addLabel("line1Done");

      if (introLine1) {
        introTl.to(introLine1, { y: "-30vh", autoAlpha: 0, duration: 0.5 }, `line1Done+=${HOLD_DURATION}`);
      }

      // "The Music" reveals in that same spot and then just stays, exactly like "Meet
      // The Team" - no exit - so it's still present while the album grid appears
      // underneath it.
      introTl
        .addLabel("line1Gone", `line1Done+=${HOLD_DURATION + 0.5}`)
        .to(introLine2Chars, { autoAlpha: 1, y: 0, duration: 0.5, stagger: { each: 0.03 } }, "line1Gone")
        .addLabel("line2Done")
        .to({}, { duration: 0.3 });

      // Albums: a single shared trigger for the whole grid - a simple staggered
      // fade/rise as it scrolls into view, exactly like the "Meet The Team" member
      // cards. No pin, no scrub, no per-cover slide/spin.
      if (albumsGrid) {
        gsap.from(albumsGrid.querySelectorAll(".album-card"), {
          autoAlpha: 0,
          y: 60,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: albumsGrid,
            start: "top 90%"
          }
        });
      }

      // Part 2: the "My Solus" panel slides/fades in on normal scroll, no pinning.
      if (solusImageRef.current) {
        gsap.from(solusImageRef.current, {
          autoAlpha: 0,
          x: 120,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: solusImageRef.current,
            start: "top 85%"
          }
        });
      }

      if (solusTextRef.current && (solusHeadingChars.length || solusSubChars.length)) {
        const solusTl = gsap.timeline({
          scrollTrigger: {
            trigger: solusTextRef.current,
            start: "top 85%"
          }
        });

        solusTl
          .to(solusHeadingChars, { autoAlpha: 1, y: 0, duration: 0.5, stagger: { each: 0.03 } }, 0.1)
          .to(solusSubChars, { autoAlpha: 1, y: 0, duration: 0.4, stagger: { each: 0.02 } }, 0.4);
      }
    }, section);

    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
      ctx.revert();
    };
  }, []);

  return (
    <>
      <section ref={sectionRef} id="solus" className="relative bg-black px-5 pb-20 pt-24 text-white sm:px-8 sm:pt-28 md:pt-32">
        {/* The pin target itself, exactly like the `<section>` in About.tsx - real height
            (one full viewport), and the containing block for the text absolutely
            positioned inside it below. Since that text is `absolute` (not `fixed`), it
            rides along with GSAP's pin transform instead of fighting it, and once the pin
            releases this whole block just scrolls away in normal flow, handing off
            straight to the album grid right after it. */}
        <div ref={introSectionRef} className="relative h-screen overflow-hidden">
          {/* Same font size and centering technique as "Meet The Team" in the About
              section: spans from below the sticky header to the bottom of this block,
              flex-centered within that - so it's dead-centered below the header on every
              width. */}
          <div className="pointer-events-none absolute inset-x-0 top-16 bottom-0 z-20 flex items-center justify-center px-5 text-center md:top-20">
            <div className="relative w-full max-w-4xl">
              <h2
                ref={introLine1Ref}
                className="w-full text-center font-display text-5xl leading-none text-white sm:text-7xl md:text-8xl"
              >
                <CharSpans
                  text={INTRO_LINE_1}
                  onCharRef={(el, index) => {
                    if (el) {
                      introLine1CharsRef.current[index] = el;
                    }
                  }}
                />
              </h2>
              {/* Overlaid on the same spot "And now..." occupies - it reveals in that same
                  spot only once "And now..." has fully cleared out of it. */}
              <h2
                ref={introLine2Ref}
                className="absolute inset-0 w-full text-center font-display text-5xl leading-none text-white sm:text-7xl md:text-8xl"
              >
                <CharSpans
                  text={INTRO_LINE_2}
                  onCharRef={(el, index) => {
                    if (el) {
                      introLine2CharsRef.current[index] = el;
                    }
                  }}
                />
              </h2>
            </div>
          </div>
        </div>

        {/* A single column below the "sm" breakpoint - a 2x2 grid from "sm" up - with
            the fifth album in its own row underneath, centered. Simple layout, no
            absolute pixel math required. */}
        <div ref={albumsGridRef} className="mx-auto flex max-w-xs flex-col items-center gap-y-12 sm:max-w-2xl sm:gap-y-14 md:max-w-3xl md:gap-y-16">
          <div className="grid w-full grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14 md:gap-x-16 md:gap-y-16">
            {CORNER_ALBUMS.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
          {/* Full width to match the single column below "sm"; from "sm" up, sized to
              exactly match a corner cell: half the row's width minus half the gap
              between columns, at each breakpoint's own gap value. */}
          <div className="w-full sm:w-[calc(50%-1.5rem)] md:w-[calc(50%-2rem)]">
            <AlbumCard album={CENTER_ALBUM} />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-black px-5 py-24 text-white sm:px-8 md:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-[0.9fr_1.1fr]">
          <div ref={solusTextRef} className="text-center md:text-left">
            <h2 className="font-display text-[2.75rem] leading-none sm:text-[clamp(3.5rem,2.5rem+2.5vw,4.5rem)]">
              <CharSpans
                text="New Mixtape"
                onCharRef={(el, index) => {
                  if (el) {
                    solusHeadingCharsRef.current[index] = el;
                  }
                }}
              />
            </h2>
            <p className="mt-7 text-lg font-bold uppercase tracking-wide text-[#d7d7d0] sm:text-xl">
              <CharSpans
                text="Coming Soon"
                onCharRef={(el, index) => {
                  if (el) {
                    solusSubCharsRef.current[index] = el;
                  }
                }}
              />
            </p>
          </div>
          <div ref={solusImageRef} className="flex justify-center md:justify-end">
            <Image
              src="/assets/solus-album-cover.png"
              alt="My Solus album cover"
              width={1024}
              height={1024}
              className="album-cover aspect-square w-full max-w-[520px] rounded-md object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}
