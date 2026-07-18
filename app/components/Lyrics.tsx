"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TITLE = "Lyrics";

export default function Lyrics() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealTrackRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const characterRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const revealTrack = revealTrackRef.current;
    const title = titleRef.current;
    const characters = characterRefs.current.filter(Boolean);

    if (!section || !revealTrack || !title) {
      return;
    }

    let updateNavTarget = () => {};

    const ctx = gsap.context(() => {
      gsap.set(characters, { autoAlpha: 0, y: 26 });
      gsap.set(title, { y: 0 });

      const revealTimeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: revealTrack,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true
        }
      });

      revealTimeline
        .to(characters, { autoAlpha: 1, y: 0, duration: 0.5, stagger: { each: 0.03 } }, 0)
        .addLabel("titleRevealed")
        .to({}, { duration: 0.25 });

      updateNavTarget = () => {
        const scrollTrigger = revealTimeline.scrollTrigger;
        const titleRevealedAt = revealTimeline.labels.titleRevealed;

        if (
          !scrollTrigger ||
          titleRevealedAt === undefined ||
          revealTimeline.duration() === 0
        ) {
          return;
        }

        const targetScroll =
          scrollTrigger.start +
          (titleRevealedAt / revealTimeline.duration()) *
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
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="lyrics" className="relative bg-black text-white">
      <div ref={revealTrackRef} className="relative h-[210svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-5 text-center">
            <h2
              ref={titleRef}
              className="w-full max-w-4xl font-display text-6xl leading-none text-white sm:text-8xl md:text-9xl"
            >
              {Array.from(TITLE).map((character, index) => (
                <span
                  key={`${character}-${index}`}
                  ref={(node) => {
                    if (node) {
                      characterRefs.current[index] = node;
                    }
                  }}
                  className="invisible inline-block opacity-0"
                >
                  {character}
                </span>
              ))}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
