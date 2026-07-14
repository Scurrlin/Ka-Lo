"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TITLE = "Who is Ka-Lo?";
const TEAM_TITLE = "Meet The Team";

const lines = [
  { text: "A conscious hip-hop artist and producer", position: "above" as const },
  { text: "With a killer pen and surgical flows", position: "below" as const },
  { text: "He's fed up with mediocre rappers", position: "above" as const },
  { text: "And thankfully...", position: "below" as const },
  { text: "He's not alone", position: "above" as const }
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cdRef = useRef<HTMLImageElement>(null);
  const charRefs = useRef<HTMLSpanElement[]>([]);
  const lineRefs = useRef<HTMLDivElement[]>([]);
  const teamTitleRef = useRef<HTMLHeadingElement>(null);
  const teamCharRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const title = titleRef.current;
    const cd = cdRef.current;
    const teamTitle = teamTitleRef.current;

    if (!section || !title || !cd || !teamTitle) {
      return;
    }

    const ctx = gsap.context(() => {
      const chars = charRefs.current.filter(Boolean);
      const lineEls = lineRefs.current.filter(Boolean);
      const teamChars = teamCharRefs.current.filter(Boolean);

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
      gsap.set(teamChars, { autoAlpha: 0, y: 26 });
      gsap.set(teamTitle, { y: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          // The extra flat 130px on top of the CD-story's own viewport-scaled distance is
          // the fixed budget for the "Meet The Team" reveal below - it lives entirely
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
        // "Meet The Team" reveals the instant the CD is fully off-screen, in this same
        // pinned space - no separate section, no gap. Once revealed it just stays put
        // (no exit animation): the pin releases right after, and from here on it's a
        // normal heading that scrolls away with the rest of the page like anything else.
        .to(teamChars, { autoAlpha: 1, y: 0, duration: 0.4, stagger: { each: 0.018 } }, "cdGone")
        .to({}, { duration: 0.15 });
    }, section);

    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
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
        <h2 className="font-display text-4xl leading-none text-white sm:text-5xl md:text-6xl">
          {TITLE.split("").map((char, index) => (
            <span
              key={index}
              ref={(node) => {
                if (node) {
                  charRefs.current[index] = node;
                }
              }}
              className="inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
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
          className={`pointer-events-none absolute left-1/2 z-20 w-full max-w-3xl px-5 text-center ${
            line.position === "above" ? "top-[20%]" : "bottom-[8%]"
          }`}
        >
          <h3 className="font-display text-xl leading-tight text-white sm:text-2xl md:text-3xl">{line.text}</h3>
        </div>
      ))}

      {/* Centers within the space below the fixed header, not the full viewport. */}
      <div className="pointer-events-none absolute inset-x-0 top-16 bottom-0 z-20 flex items-center justify-center px-2 sm:px-5 md:top-20">
        <h2
          ref={teamTitleRef}
          className="font-display text-center text-5xl leading-none text-white sm:text-7xl md:text-8xl"
        >
          {TEAM_TITLE.split("").map((char, index) => (
            <span
              key={index}
              ref={(node) => {
                if (node) {
                  teamCharRefs.current[index] = node;
                }
              }}
              className="inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
