"use client";

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TITLE = "Who is Ka-Lo?";
const NEXT_TITLE = "What's Next?";

const lines = [
  { text: "People see a new website", position: "above" as const },
  { text: "And all of a sudden...", position: "below" as const },
  { text: "Everyone's a web developer lmao", position: "above" as const },
  { text: "It's not even done yet!", position: "below" as const },
  { text: "Lol jk jk 😂 Love you!", position: "above" as const }
];

type AnimatedWordsProps = {
  text: string;
  registerCharacter: (node: HTMLSpanElement | null, index: number) => void;
};

function AnimatedWords({ text, registerCharacter }: AnimatedWordsProps) {
  const words = text.split(" ");
  let characterIndex = 0;

  return words.map((word, wordIndex) => (
    <Fragment key={`${word}-${wordIndex}`}>
      <span className="inline-block whitespace-nowrap">
        {word.split("").map((char) => {
          const index = characterIndex++;

          return (
            <span
              key={index}
              ref={(node) => registerCharacter(node, index)}
              className="inline-block"
            >
              {char}
            </span>
          );
        })}
      </span>
      {wordIndex < words.length - 1 ? " " : null}
    </Fragment>
  ));
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cdRef = useRef<HTMLImageElement>(null);
  const charRefs = useRef<HTMLSpanElement[]>([]);
  const lineRefs = useRef<HTMLDivElement[]>([]);
  const nextTitleRef = useRef<HTMLHeadingElement>(null);
  const nextCharRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const title = titleRef.current;
    const cd = cdRef.current;
    const nextTitle = nextTitleRef.current;

    if (!section || !title || !cd || !nextTitle) {
      return;
    }

    let updateNavTargets = () => {};

    const ctx = gsap.context(() => {
      const chars = charRefs.current.filter(Boolean);
      const lineEls = lineRefs.current.filter(Boolean);
      const nextChars = nextCharRefs.current.filter(Boolean);

      gsap.set(chars, { autoAlpha: 0, y: 26 });
      gsap.set(title, { autoAlpha: 1, y: 0 });
      // Centering is handled entirely through GSAP's xPercent/yPercent (rather than
      // mixing in a Tailwind `translate-y-1/2` class) so the entrance offset composes
      // predictably instead of fighting with a separate CSS `translate` property.
      gsap.set(cd, { autoAlpha: 1, xPercent: -50, yPercent: -50, x: 0, y: "70vh", rotation: 0 });
      // Like the CD, centering is handled entirely through GSAP's xPercent (base -50 to
      // offset the div's own `left-1/2` position) composed with the off-screen entrance/exit
      // offset, rather than mixing in a Tailwind `-translate-x-1/2` class that GSAP's inline
      // transform would otherwise silently override.
      gsap.set(lineEls, { autoAlpha: 0, xPercent: 80 });
      gsap.set(nextChars, { autoAlpha: 0, y: 26 });
      gsap.set(nextTitle, { y: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          // The extra flat 130px on top of the CD-story's own viewport-scaled distance is
          // the fixed budget for the "What's Next?" reveal below - it lives entirely
          // inside this same pin, right after the CD clears the screen, rather than
          // needing a second pinned section of its own.
          end: () => "+=" + (window.innerHeight * 5.2 + 130),
          scrub: 1,
          pin: section,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      // Timing constants for the lines sequence, computed up front (rather than inline in the
      // chain below) so the CD spin duration further down can be derived from them too.
      const LINE_ENTER_DURATION = 0.5;
      const LINE_HOLD_DURATION = 1.7;
      const LINE_CYCLE_OFFSET = 2;
      const LINE_FIRST_START = 0.2;
      const linesDuration =
        LINE_FIRST_START + (lineEls.length - 1) * LINE_CYCLE_OFFSET + LINE_ENTER_DURATION + LINE_HOLD_DURATION + LINE_ENTER_DURATION;

      // Timing (relative to "fullTurn") for the CD's slide-off-screen exit, computed up front
      // so the spin tween below can be sized to last exactly until the CD is fully gone.
      const LINES_DONE_GAP = 0.1;
      const CD_EXIT_GAP = 0.1;
      const CD_EXIT_DURATION = 0.8;
      const cdSpinDuration = linesDuration + LINES_DONE_GAP + CD_EXIT_GAP + CD_EXIT_DURATION;
      // Preserves the original angular speed (852deg over 5.5 timeline-units) so the spin
      // looks the same rate as before, just carried on for as long as the CD stays onscreen.
      const CD_SPIN_DEGREES_PER_UNIT = 852 / 5.5;
      const cdSpinRotation = 360 + CD_SPIN_DEGREES_PER_UNIT * cdSpinDuration;

      // "Who is Ka-Lo?" reveals character by character.
      tl.to(chars, { autoAlpha: 1, y: 0, duration: 0.6, stagger: { each: 0.03 } }, 0)
        .addLabel("aboutTitleRevealed")
        .to({}, { duration: 0.05 })
        // The CD slides up from below the viewport into a centered resting position.
        .to(cd, { y: 0, duration: 0.7, ease: "power2.out" })
        .addLabel("cdIn")
        // First full turn, scroll-linked.
        .to(cd, { rotation: 360, duration: 2.2 }, "cdIn")
        .addLabel("fullTurn")
        // The title slides up and out of view right as the first turn completes,
        // staying fully opaque the whole time (no fade, just a translate).
        .to(title, { y: "-30vh", duration: 0.5 }, "fullTurn")
        // The CD keeps spinning continuously all the way through the lines and its exit
        // off-screen - the duration is derived above so it never stops early no matter how
        // many lines or how long they hold for.
        .to(cd, { rotation: cdSpinRotation, duration: cdSpinDuration }, "fullTurn")
        .addLabel("linesStart", "fullTurn");

      // Four lines alternate above/below the CD, sliding in from the right and out to the left.
      // Each line explicitly holds centered (fully visible, untouched) for LINE_HOLD_DURATION
      // between finishing its entrance and starting its exit, guaranteeing the pause by
      // construction rather than relying on hand-tuned offsets staying in sync.
      lineEls.forEach((el, i) => {
        const enterStart = LINE_FIRST_START + i * LINE_CYCLE_OFFSET;
        const exitStart = enterStart + LINE_ENTER_DURATION + LINE_HOLD_DURATION;
        tl.to(el, { autoAlpha: 1, xPercent: -50, duration: LINE_ENTER_DURATION }, `linesStart+=${enterStart}`).to(
          el,
          { autoAlpha: 0, xPercent: -180, duration: LINE_ENTER_DURATION },
          `linesStart+=${exitStart}`
        );
      });

      tl.addLabel("linesDone", `linesStart+=${linesDuration + LINES_DONE_GAP}`)
        // The CD slides off the right edge as the section ends. A function-based value
        // (rather than a fixed "vw" guess) reads the disc's actual rendered width via
        // getBoundingClientRect() - correct no matter which of min-w/max-w/vmin is
        // currently clamping it - plus a 25vw buffer so it lands clearly off-screen.
        // Being a function, GSAP re-evaluates it whenever the timeline is invalidated,
        // which happens automatically on window resize thanks to invalidateOnRefresh
        // above, so it never goes stale if the viewport changes size.
        .to(
          cd,
          {
            x: () => window.innerWidth / 2 + cd.getBoundingClientRect().width / 2 + window.innerWidth * 0.25,
            duration: CD_EXIT_DURATION,
            ease: "power1.in"
          },
          `linesDone+=${CD_EXIT_GAP}`
        )
        .addLabel("cdGone")
        // "What's Next?" reveals the instant the CD is fully off-screen, in this same
        // pinned space - no separate section, no gap. Once revealed it just stays put
        // (no exit animation): the pin releases right after, and from here on it's a
        // normal heading that scrolls away with the rest of the page like anything else.
        .to(nextChars, { autoAlpha: 1, y: 0, duration: 0.4, stagger: { each: 0.018 } }, "cdGone")
        .addLabel("nextTitleRevealed")
        .to({}, { duration: 0.15 });

      updateNavTargets = () => {
        const scrollTrigger = tl.scrollTrigger;
        const duration = tl.duration();
        const nextSection = document.getElementById("next");

        if (!scrollTrigger || duration === 0) {
          return;
        }

        const scrollAtLabel = (label: "aboutTitleRevealed" | "nextTitleRevealed") =>
          scrollTrigger.start + (tl.labels[label] / duration) * (scrollTrigger.end - scrollTrigger.start);

        section.dataset.navScrollY = Math.round(scrollAtLabel("aboutTitleRevealed")).toString();
        section.dataset.navSettleMs = "1100";

        if (nextSection) {
          nextSection.dataset.navScrollY = Math.round(scrollAtLabel("nextTitleRevealed")).toString();
          nextSection.dataset.navSettleMs = "1100";
        }
      };

      ScrollTrigger.addEventListener("refresh", updateNavTargets);
      updateNavTargets();
    }, section);

    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
      ScrollTrigger.removeEventListener("refresh", updateNavTargets);
      delete section.dataset.navScrollY;
      delete section.dataset.navSettleMs;
      const nextSection = document.getElementById("next");
      delete nextSection?.dataset.navScrollY;
      delete nextSection?.dataset.navSettleMs;
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="about" className="relative h-screen overflow-hidden bg-black text-white">
      <Image
        ref={cdRef}
        src="/assets/silver-cracks.png"
        alt="Silver Cracks CD"
        width={1024}
        height={1024}
        onLoad={() => ScrollTrigger.refresh()}
        className="silver-disc pointer-events-none absolute left-1/2 top-[calc(2rem+50vh)] z-10 aspect-square w-[45vmin] max-w-[620px] min-w-[240px] select-none md:top-[calc(2.5rem+50vh)]"
      />

      <div
        ref={titleRef}
        className="pointer-events-none absolute left-1/2 top-[16%] z-20 w-full max-w-4xl -translate-x-1/2 px-5 text-center"
      >
        <h2 className="font-display text-5xl leading-none text-white sm:text-6xl md:text-7xl lg:text-6xl">
          <AnimatedWords
            text={TITLE}
            registerCharacter={(node, index) => {
              if (node) {
                charRefs.current[index] = node;
              }
            }}
          />
        </h2>
      </div>

      {lines.map((line, index) => (
        <div
          key={line.text}
          ref={(node) => {
            if (node) {
              lineRefs.current[index] = node;
            }
          }}
          className={`pointer-events-none absolute left-1/2 z-20 w-full max-w-4xl px-4 text-center sm:px-5 ${
            line.position === "above" ? "top-[20%]" : "bottom-[8%]"
          }`}
        >
          <h3 className="break-normal font-display text-2xl leading-tight text-white hyphens-none sm:text-3xl md:text-4xl">
            {line.text}
          </h3>
        </div>
      ))}

      {/* Centers within the space below the fixed header, not the full viewport. */}
      <div className="pointer-events-none absolute inset-x-0 top-16 bottom-0 z-20 flex items-center justify-center px-2 sm:px-5 md:top-20">
        <h2
          ref={nextTitleRef}
          className="font-display text-center text-6xl leading-none text-white sm:text-8xl md:text-9xl lg:text-8xl"
        >
          <AnimatedWords
            text={NEXT_TITLE}
            registerCharacter={(node, index) => {
              if (node) {
                nextCharRefs.current[index] = node;
              }
            }}
          />
        </h2>
      </div>
    </section>
  );
}
