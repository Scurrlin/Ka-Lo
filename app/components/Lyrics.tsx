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
      className={`inline-block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${className}`}
    >
      {children}
    </a>
  );
}

function LyricsCopy({ song }: { song: LyricSong }) {
  const stanzas = song.lyrics.split(/\n\s*\n/);

  return (
    <div className="max-w-[46rem] space-y-7 break-words text-lg font-medium leading-[1.55] text-white sm:text-xl md:text-2xl">
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

function SongCredits({ credits }: { credits: string | readonly string[] }) {
  const lines = typeof credits === "string" ? [credits] : credits;

  return (
    <div className="mt-1 flex flex-col items-center gap-0.5 text-center sm:mt-2 sm:gap-1 lg:items-start lg:text-left">
      {lines.map((line, index) => (
        <p
          key={`${line}-${index}`}
          className="font-sans text-base font-normal leading-none tracking-normal text-white"
        >
          {line}
        </p>
      ))}
    </div>
  );
}

function NumberedSongTitle({ song, index }: { song: LyricSong; index: number }) {
  const [firstWord, ...remainingWords] = song.title.split(" ");
  const number = String(index + 1).padStart(2, "0");

  return (
    <span className="flex flex-col items-center gap-1 sm:contents">
      <AnchorTitle href={song.href} className="max-w-[13ch]">
        <span className="relative inline-block whitespace-nowrap">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-full top-2 mr-4 hidden select-none font-sans text-base font-semibold leading-none tracking-normal tabular-nums text-white md:inline-block"
          >
            {number}
          </span>
          {firstWord}
        </span>
        {remainingWords.length ? ` ${remainingWords.join(" ")}` : null}
      </AnchorTitle>
      <span
        aria-hidden="true"
        className="select-none font-sans text-base font-semibold leading-none tracking-normal tabular-nums text-white sm:hidden"
      >
        {number}
      </span>
    </span>
  );
}

function SingleRelease({ release }: { release: LyricRelease }) {
  const song = release.songs[0];

  return (
    <article
      id={release.id}
      className="grid gap-8 border-t border-white/20 py-20 sm:py-28 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)] lg:gap-16"
    >
      <div className="text-center lg:sticky lg:top-28 lg:self-start lg:text-left">
        <h2 className="font-display text-5xl leading-[0.92] tracking-[-0.045em] sm:text-7xl lg:text-8xl">
          <AnchorTitle href={song.href} className="max-w-[8ch]">
            {release.title}
          </AnchorTitle>
        </h2>
        {song.credits ? <SongCredits credits={song.credits} /> : null}
      </div>

      <LyricsCopy song={song} />
    </article>
  );
}

function AlbumRelease({ release }: { release: LyricRelease }) {
  return (
    <article id={release.id} className="border-t border-white/20 py-20 sm:py-28">
      <h2 className="mx-auto max-w-[11ch] text-center font-display text-6xl leading-[0.88] tracking-[-0.05em] sm:text-8xl lg:text-9xl">
        <AnchorTitle href={release.href} className="max-w-full">
          {release.title}
        </AnchorTitle>
      </h2>

      <ol className="mt-10 sm:mt-14">
        {release.songs.map((song, index) => (
          <li
            key={song.id}
            id={song.id}
            className="grid gap-8 border-t border-white/15 py-16 sm:py-20 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)] lg:gap-16"
          >
            <div className="flex flex-col items-center text-center lg:sticky lg:top-28 lg:items-start lg:text-left">
              <h3 className="font-display text-5xl leading-[0.92] tracking-[-0.045em] sm:text-7xl lg:text-8xl">
                <NumberedSongTitle song={song} index={index} />
              </h3>
              {song.credits ? <SongCredits credits={song.credits} /> : null}
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
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleCharacterRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const title = titleRef.current;
    const titleCharacters = titleCharacterRefs.current.filter(Boolean);

    if (!section || !title || !titleCharacters.length) {
      return;
    }

    const context = gsap.context(() => {
      gsap.set(titleCharacters, { autoAlpha: 0, y: 26 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: title,
            start: "top 85%"
          }
        })
        .to(titleCharacters, {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: { each: 0.03 }
        });
    }, section);

    // A single deduped window "load" -> ScrollTrigger.refresh() lives in
    // SmoothScroll (refresh() is global, so it covers every section).
    return () => {
      context.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="lyrics"
      className="relative bg-black text-white"
    >
      <header className="flex items-center justify-center px-5 py-12 text-center sm:py-16 md:py-20">
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
