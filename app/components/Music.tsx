"use client";

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MUSIC_PROJECT_LINKS, type MusicProjectId } from "../constants/links";

const INTRO_TITLE = "The Music";

type Album = {
  id: MusicProjectId;
  name: string;
  image: string;
  href: string | null;
};

// The first four sit in a 2x2 grid, in this order (top-left, top-right, bottom-left,
// bottom-right); the fifth is centered in the gap between them.
const ALBUMS: Album[] = [
  {
    id: "melody",
    name: "Melody",
    image: "/assets/Melody.jpeg",
    href: MUSIC_PROJECT_LINKS.melody
  },
  {
    id: "exercises",
    name: "Exercises",
    image: "/assets/Exercises.png",
    href: MUSIC_PROJECT_LINKS.exercises
  },
  {
    id: "silver-cracks",
    name: "Silver Cracks",
    image: "/assets/Silver-Cracks.png",
    href: MUSIC_PROJECT_LINKS["silver-cracks"]
  },
  {
    id: "deep-end",
    name: "Deep End",
    image: "/assets/Deep-End.png",
    href: MUSIC_PROJECT_LINKS["deep-end"]
  },
  {
    id: "kings-road",
    name: "King's Road",
    image: "/assets/Kings-Road.png",
    href: MUSIC_PROJECT_LINKS["kings-road"]
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
  const projectLabel = (
    <>
      <span>{album.name}</span>
      <Image
        src="/assets/arrow.svg"
        alt=""
        width={13}
        height={14}
        className="h-4 w-4 shrink-0"
      />
    </>
  );

  return (
    <div className="album-card w-full text-center">
      <h3 className="mb-3 font-display text-[26px] uppercase leading-none tracking-wide text-white sm:text-[28px] md:text-[30px]">
        {album.href ? (
          <a
            href={album.href}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center gap-2 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            aria-label={`Listen to ${album.name}`}
          >
            {projectLabel}
          </a>
        ) : (
          <span
            className="inline-flex cursor-not-allowed items-center justify-center gap-2"
            aria-label={`${album.name} — link coming soon`}
            aria-disabled="true"
            title={`${album.name} — link coming soon`}
          >
            {projectLabel}
          </span>
        )}
      </h3>
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
  const introTitleRef = useRef<HTMLHeadingElement>(null);
  const introTitleCharsRef = useRef<HTMLSpanElement[]>([]);
  const albumsGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const introSection = introSectionRef.current;

    if (!section || !introSection) {
      return;
    }

    let updateNavTarget = () => {};

    const ctx = gsap.context(() => {
      const introTitle = introTitleRef.current;
      const introTitleChars = introTitleCharsRef.current.filter(Boolean);
      const albumsGrid = albumsGridRef.current;

      gsap.set(introTitleChars, { autoAlpha: 0, y: 26 });
      gsap.set(introTitle, { y: 0 });

      // Reveal "The Music" directly in a short, scroll-scrubbed pin before handing off
      // to the existing album grid below.
      const introTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: introSection,
          start: "top top",
          end: () => "+=" + window.innerHeight * 1.1,
          scrub: true,
          pin: introSection,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      introTl
        .to(introTitleChars, { autoAlpha: 1, y: 0, duration: 0.5, stagger: { each: 0.03 } }, 0)
        .addLabel("titleRevealed")
        .to({}, { duration: 0.25 });

      updateNavTarget = () => {
        const scrollTrigger = introTl.scrollTrigger;
        const titleRevealedAt = introTl.labels.titleRevealed;

        if (!scrollTrigger || titleRevealedAt === undefined || introTl.duration() === 0) {
          return;
        }

        const targetScroll =
          scrollTrigger.start +
          (titleRevealedAt / introTl.duration()) * (scrollTrigger.end - scrollTrigger.start);

        section.dataset.navScrollY = Math.round(targetScroll).toString();
        section.dataset.navSettleMs = "150";
      };

      ScrollTrigger.addEventListener("refresh", updateNavTarget);
      updateNavTarget();

      // Albums: a single shared trigger for the whole grid with a simple staggered
      // fade/rise as it scrolls into view. No pin, scrub, or per-cover slide/spin.
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
    }, section);

    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
      ScrollTrigger.removeEventListener("refresh", updateNavTarget);
      delete section.dataset.navScrollY;
      delete section.dataset.navSettleMs;
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="music"
      className="relative bg-black px-5 pb-20 pt-12 text-white sm:px-8 sm:pt-16 md:pt-20"
    >
        {/* The pin target itself, exactly like the `<section>` in About.tsx - real height
            (one full viewport), and the containing block for the text absolutely
            positioned inside it below. Since that text is `absolute` (not `fixed`), it
            rides along with GSAP's pin transform instead of fighting it, and once the pin
            releases this whole block just scrolls away in normal flow, handing off
            straight to the album grid right after it. */}
        <div ref={introSectionRef} className="relative h-screen overflow-hidden">
          {/* Centered in the viewport space below the fixed header. */}
          <div className="pointer-events-none absolute inset-x-0 top-16 bottom-0 z-20 flex items-center justify-center px-5 text-center md:top-20">
            <h2
              ref={introTitleRef}
              className="w-full max-w-4xl text-center font-display text-5xl leading-none text-white sm:text-7xl md:text-8xl"
            >
              <CharSpans
                text={INTRO_TITLE}
                onCharRef={(el, index) => {
                  if (el) {
                    introTitleCharsRef.current[index] = el;
                  }
                }}
              />
            </h2>
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
  );
}
