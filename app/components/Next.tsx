"use client";

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

export default function Next() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const headingCharsRef = useRef<HTMLSpanElement[]>([]);
  const subheadingCharsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const ctx = gsap.context(() => {
      const headingChars = headingCharsRef.current.filter(Boolean);
      const subheadingChars = subheadingCharsRef.current.filter(Boolean);

      gsap.set([...headingChars, ...subheadingChars], { autoAlpha: 0, y: 16 });

      if (imageRef.current) {
        gsap.from(imageRef.current, {
          autoAlpha: 0,
          x: 120,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 85%"
          }
        });
      }

      if (textRef.current && (headingChars.length || subheadingChars.length)) {
        const textTl = gsap.timeline({
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 85%"
          }
        });

        textTl
          .to(headingChars, { autoAlpha: 1, y: 0, duration: 0.5, stagger: { each: 0.03 } }, 0.1)
          .to(subheadingChars, { autoAlpha: 1, y: 0, duration: 0.4, stagger: { each: 0.02 } }, 0.4);
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
    <section
      ref={sectionRef}
      id="next"
      className="relative overflow-hidden bg-black px-5 py-24 text-white sm:px-8 md:py-32"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-[0.9fr_1.1fr]">
        <div ref={textRef} className="text-center md:text-left">
          <h2 className="font-display text-[2.75rem] leading-none sm:text-[clamp(3.5rem,2.5rem+2.5vw,4.5rem)]">
            <CharSpans
              text="New Mixtape"
              onCharRef={(el, index) => {
                if (el) {
                  headingCharsRef.current[index] = el;
                }
              }}
            />
          </h2>
          <p className="mt-7 text-lg font-bold uppercase tracking-wide text-[#d7d7d0] sm:text-xl">
            <CharSpans
              text="Coming Soon"
              onCharRef={(el, index) => {
                if (el) {
                  subheadingCharsRef.current[index] = el;
                }
              }}
            />
          </p>
        </div>
        <div ref={imageRef} className="flex justify-center md:justify-end">
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
  );
}
