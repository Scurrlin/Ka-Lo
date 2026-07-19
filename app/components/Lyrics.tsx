"use client";

import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  LYRIC_RELEASES,
  type LyricRelease,
  type LyricSong
} from "../constants/lyrics";

const LYRICS_TITLE = "Lyrics";

function TitleCharacters({
  text,
  registerCharacter
}: {
  text: string;
  registerCharacter: (node: HTMLSpanElement | null, index: number) => void;
}) {
  const words = text.split(" ");
  let characterIndex = 0;

  return words.map((word, wordIndex) => (
    <Fragment key={`${word}-${wordIndex}`}>
      <span className="inline-block whitespace-nowrap">
        {Array.from(word).map((character) => {
          const index = characterIndex++;

          return (
            <span
              key={index}
              ref={(node) => registerCharacter(node, index)}
              className="invisible inline-block opacity-0"
            >
              {character}
            </span>
          );
        })}
      </span>
      {wordIndex < words.length - 1 ? " " : null}
    </Fragment>
  ));
}

function AnchorTitle({
  href,
  children,
  className
}: {
  href: string;
  children: React.ReactNode;
  className: string;
}) {
  return (
    <a
      href={href}
      className={`group inline-block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${className}`}
    >
      {children}
      <span
        aria-hidden="true"
        className="ml-3 align-middle text-[0.42em] text-white/0 transition-colors group-hover:text-white/40 group-focus-visible:text-white/40"
      >
        #
      </span>
    </a>
  );
}

function LyricsCopy({ song }: { song: LyricSong }) {
  const stanzas = song.lyrics.split(/\n\s*\n/);

  return (
    <div className="max-w-[46rem] space-y-7 break-words text-lg font-medium leading-[1.55] text-white/88 sm:text-xl md:text-2xl">
      {stanzas.map((stanza, index) => (
        <p
          key={`${song.id}-stanza-${index}`}
          className="whitespace-pre-line"
        >
          {stanza}
        </p>
      ))}
    </div>
  );
}

function SingleRelease({ release }: { release: LyricRelease }) {
  const song = release.songs[0];

  return (
    <article
      id={release.id}
      className="grid gap-12 border-t border-white/20 py-20 sm:py-28 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)] lg:gap-16"
    >
      <h2 className="text-center font-display text-5xl leading-[0.92] tracking-[-0.045em] sm:text-7xl lg:sticky lg:top-28 lg:self-start lg:text-left lg:text-8xl">
        <AnchorTitle href={song.href} className="max-w-[8ch]">
          {release.title}
        </AnchorTitle>
      </h2>

      <LyricsCopy song={song} />
    </article>
  );
}

function AlbumRelease({ release }: { release: LyricRelease }) {
  return (
    <article id={release.id} className="border-t border-white/20 py-20 sm:py-28">
      <h2 className="mx-auto max-w-[11ch] text-center font-display text-6xl leading-[0.86] tracking-[-0.055em] sm:text-8xl lg:mx-0 lg:text-left lg:text-9xl">
        <AnchorTitle href={release.href} className="max-w-full">
          {release.title}
        </AnchorTitle>
      </h2>

      <ol className="mt-16 sm:mt-24">
        {release.songs.map((song, index) => (
          <li
            key={song.id}
            id={song.id}
            className="grid gap-10 border-t border-white/15 py-16 sm:py-20 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)] lg:gap-16"
          >
            <div className="flex items-start justify-center gap-5 text-center lg:sticky lg:top-28 lg:self-start lg:justify-start lg:text-left">
              <span
                aria-hidden="true"
                className="pt-1 text-sm font-semibold tabular-nums text-white/45 sm:text-base"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-3xl leading-none tracking-[-0.035em] sm:text-5xl">
                <AnchorTitle href={song.href} className="max-w-[13ch]">
                  {song.title}
                </AnchorTitle>
              </h3>
            </div>

            <LyricsCopy song={song} />
          </li>
        ))}
      </ol>
    </article>
  );
}

export default function Lyrics() {
  const sectionRef = useRef<HTMLElement>(null);
  const introSectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleCharacterRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const introSection = introSectionRef.current;
    const title = titleRef.current;
    const titleCharacters = titleCharacterRefs.current.filter(Boolean);

    if (!section || !introSection || !title || !titleCharacters.length) {
      return;
    }

    let updateNavTarget = () => {};

    const context = gsap.context(() => {
      gsap.set(titleCharacters, { autoAlpha: 0, y: 26 });
      gsap.set(title, { y: 0 });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: introSection,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true
        }
      });

      timeline
        .to(
          titleCharacters,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: { each: 0.03 }
          },
          0
        )
        .addLabel("titleRevealed")
        .to({}, { duration: 0.25 });

      updateNavTarget = () => {
        const scrollTrigger = timeline.scrollTrigger;
        const titleRevealedAt = timeline.labels.titleRevealed;

        if (
          !scrollTrigger ||
          titleRevealedAt === undefined ||
          timeline.duration() === 0
        ) {
          return;
        }

        const targetScroll =
          scrollTrigger.start +
          (titleRevealedAt / timeline.duration()) *
            (scrollTrigger.end - scrollTrigger.start);

        section.dataset.navScrollY = Math.round(targetScroll).toString();
        section.dataset.navSettleMs = "150";
      };

      ScrollTrigger.addEventListener("refresh", updateNavTarget);
      updateNavTarget();
    }, section);

    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
      ScrollTrigger.removeEventListener("refresh", updateNavTarget);
      delete section.dataset.navScrollY;
      delete section.dataset.navSettleMs;
      context.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="lyrics"
      className="relative bg-black text-white"
    >
      <div ref={introSectionRef} className="relative h-[210svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <header className="pointer-events-none absolute inset-0 flex items-center justify-center px-5 text-center">
            <h1
              ref={titleRef}
              aria-label={LYRICS_TITLE}
              className="w-full text-center font-display text-[clamp(4.75rem,15vw,12rem)] leading-[0.8] tracking-[-0.06em]"
            >
              <span aria-hidden="true">
                <TitleCharacters
                  text={LYRICS_TITLE}
                  registerCharacter={(node, index) => {
                    if (node) {
                      titleCharacterRefs.current[index] = node;
                    }
                  }}
                />
              </span>
            </h1>
          </header>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[112rem] px-5 pb-32 sm:px-8 sm:pb-40 lg:px-12 lg:pb-52">
        {LYRIC_RELEASES.map((release) =>
          release.kind === "album" ? (
            <AlbumRelease key={release.id} release={release} />
          ) : (
            <SingleRelease key={release.id} release={release} />
          )
        )}
      </div>
    </section>
  );
}
