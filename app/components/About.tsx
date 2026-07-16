"use client";

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TITLE = "Who is Ka-Lo?";
const NEXT_TITLE = "What's Next?";
const VIDEO_SOURCES = [
  "/videos/driving-10s.mp4",
  "/videos/birds-10s.mp4",
  "/videos/driving-10s.mp4"
] as const;

const CD_CLEARANCE = 6;
const CD_MIN_DIAMETER = 28;
const CD_MAX_DIAMETER = 64;
const VIDEO_MAX_WIDTH = 420;
const SHRINK_DURATION = 1.25;
const ROUTE_DURATION = 8;
const CD_SPIN_DEGREES_PER_UNIT = 852 / 5.5;

type Point = {
  x: number;
  y: number;
};

type RouteGeometry = {
  points: Point[];
  cumulativeLengths: number[];
  totalLength: number;
  smallScale: number;
};

type AnimatedWordsProps = {
  text: string;
  registerCharacter: (node: HTMLSpanElement | null, index: number) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(value: number) {
  const progress = clamp(value, 0, 1);
  return progress * progress * (3 - 2 * progress);
}

function getElementOpacity(distance: number, start: number, end: number) {
  if (end <= start) {
    return distance >= end ? 1 : 0;
  }

  return smoothstep((distance - start) / (end - start));
}

function getPointOnRoute(geometry: RouteGeometry, progress: number) {
  const distance = clamp(progress, 0, 1) * geometry.totalLength;
  const { points, cumulativeLengths } = geometry;
  let segmentIndex = points.length - 2;

  for (let index = 0; index < cumulativeLengths.length - 1; index += 1) {
    if (distance <= cumulativeLengths[index + 1]) {
      segmentIndex = index;
      break;
    }
  }

  const segmentStart = cumulativeLengths[segmentIndex];
  const segmentEnd = cumulativeLengths[segmentIndex + 1];
  const segmentProgress = segmentEnd === segmentStart ? 1 : (distance - segmentStart) / (segmentEnd - segmentStart);
  const start = points[segmentIndex];
  const end = points[segmentIndex + 1];

  return {
    distance,
    x: start.x + (end.x - start.x) * segmentProgress,
    y: start.y + (end.y - start.y) * segmentProgress
  };
}

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
  const videoStageRef = useRef<HTMLDivElement>(null);
  const videoFrameRefs = useRef<HTMLDivElement[]>([]);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const charRefs = useRef<HTMLSpanElement[]>([]);
  const nextTitleRef = useRef<HTMLHeadingElement>(null);
  const nextCharRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const title = titleRef.current;
    const cd = cdRef.current;
    const videoStage = videoStageRef.current;
    const nextTitle = nextTitleRef.current;

    if (!section || !title || !cd || !videoStage || !nextTitle) {
      return;
    }

    const videoFrames = videoFrameRefs.current.filter(Boolean);
    const videos = videoRefs.current.filter(Boolean);
    const routeState = { progress: 0 };
    let routeGeometry: RouteGeometry | null = null;
    let timeline: gsap.core.Timeline | null = null;
    let updateNavTargets = () => {};

    const playVideos = () => {
      videos.forEach((video) => {
        video.muted = true;

        if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
          video.currentTime = 0;
        }

        void video.play().catch(() => {
          // Muted inline playback is permitted in modern browsers, but a rejected
          // promise should not interrupt the scroll experience.
        });
      });
    };

    const pauseVideos = () => {
      videos.forEach((video) => video.pause());
    };

    const renderRoute = () => {
      if (!routeGeometry) {
        return;
      }

      const point = getPointOnRoute(routeGeometry, routeState.progress);
      const cumulative = routeGeometry.cumulativeLengths;
      const exitStart = cumulative[cumulative.length - 2];
      const exitProgress = (point.distance - exitStart) / (routeGeometry.totalLength - exitStart);
      const growProgress = smoothstep(exitProgress);
      const scale = routeGeometry.smallScale + (1 - routeGeometry.smallScale) * growProgress;

      gsap.set(cd, { x: point.x, y: point.y, scale });

      const videoOneOpacity = getElementOpacity(point.distance, 0, cumulative[1] * 0.75);
      const videoTwoOpacity = getElementOpacity(
        point.distance,
        cumulative[3],
        cumulative[3] + (cumulative[4] - cumulative[3]) * 0.55
      );
      const videoThreeOpacity = getElementOpacity(
        point.distance,
        cumulative[5],
        cumulative[5] + (cumulative[6] - cumulative[5]) * 0.55
      );
      const exitFade = 1 - smoothstep(exitProgress / 0.6);
      const opacities = [videoOneOpacity, videoTwoOpacity, videoThreeOpacity];

      videoFrames.forEach((frame, index) => {
        gsap.set(frame, { autoAlpha: opacities[index] * exitFade });
      });
    };

    const updateLayout = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const header = document.querySelector<HTMLElement>("[data-site-header]");
      const headerHeight = header?.offsetHeight ?? (viewportWidth >= 768 ? 80 : 64);
      const baseCdDiameter = cd.offsetWidth;
      const smallCdDiameter = clamp(
        Math.min(viewportWidth, viewportHeight) * 0.05,
        CD_MIN_DIAMETER,
        CD_MAX_DIAMETER
      );
      const smallCdRadius = smallCdDiameter / 2;
      const edgeMargin = clamp(viewportWidth * 0.02, 8, 24);
      const gap = smallCdDiameter + CD_CLEARANCE * 2;
      const routeInset = edgeMargin + smallCdRadius + CD_CLEARANCE;
      const maxVideoWidthByViewport = (viewportWidth - routeInset * 2 - gap * 2) / 3;
      const availableRouteHeight = Math.max(
        1,
        viewportHeight - headerHeight - routeInset * 2
      );
      const maxVideoWidthByHeight = availableRouteHeight * (16 / 9);
      const videoWidth = Math.max(
        1,
        Math.min(VIDEO_MAX_WIDTH, maxVideoWidthByViewport, maxVideoWidthByHeight)
      );
      const videoHeight = videoWidth * (9 / 16);
      const rowWidth = videoWidth * 3 + gap * 2;
      const rowLeft = (viewportWidth - rowWidth) / 2;
      const rowTop = headerHeight + (viewportHeight - headerHeight - videoHeight) / 2;
      const origin = {
        x: viewportWidth / 2,
        y: headerHeight + (viewportHeight - headerHeight) / 2
      };
      const videoOne = {
        left: rowLeft,
        right: rowLeft + videoWidth,
        top: rowTop,
        bottom: rowTop + videoHeight
      };
      const videoTwo = {
        left: rowLeft + videoWidth + gap,
        right: rowLeft + videoWidth * 2 + gap,
        top: rowTop,
        bottom: rowTop + videoHeight
      };
      const videoThree = {
        left: rowLeft + videoWidth * 2 + gap * 2,
        right: rowLeft + videoWidth * 3 + gap * 2,
        top: rowTop,
        bottom: rowTop + videoHeight
      };
      const traceOffset = smallCdRadius + CD_CLEARANCE;
      const topY = videoOne.top - traceOffset;
      const bottomY = videoTwo.bottom + traceOffset;
      const firstGapX = videoOne.right + gap / 2;
      const secondGapX = videoTwo.right + gap / 2;
      const points = [
        { x: 0, y: 0 },
        { x: videoOne.left - traceOffset - origin.x, y: videoOne.top + videoHeight / 2 - origin.y },
        { x: videoOne.left - traceOffset - origin.x, y: topY - origin.y },
        { x: firstGapX - origin.x, y: topY - origin.y },
        { x: firstGapX - origin.x, y: bottomY - origin.y },
        { x: secondGapX - origin.x, y: bottomY - origin.y },
        { x: secondGapX - origin.x, y: topY - origin.y },
        { x: videoThree.right + traceOffset - origin.x, y: topY - origin.y },
        {
          x: videoThree.right + traceOffset - origin.x,
          y: videoThree.top + videoHeight / 2 - origin.y
        },
        { x: viewportWidth + baseCdDiameter / 2 + edgeMargin - origin.x, y: 0 }
      ];
      const cumulativeLengths = [0];

      for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const current = points[index];
        cumulativeLengths.push(
          cumulativeLengths[index - 1] + Math.hypot(current.x - previous.x, current.y - previous.y)
        );
      }

      routeGeometry = {
        points,
        cumulativeLengths,
        totalLength: cumulativeLengths[cumulativeLengths.length - 1],
        smallScale: smallCdDiameter / baseCdDiameter
      };

      gsap.set(videoStage, {
        left: rowLeft,
        top: rowTop,
        width: rowWidth,
        height: videoHeight,
        columnGap: gap
      });
      gsap.set(cd, { left: origin.x, top: origin.y });

      if (timeline && timeline.time() >= (timeline.labels.routeStart ?? Number.POSITIVE_INFINITY)) {
        renderRoute();
      }
    };

    const ctx = gsap.context(() => {
      const chars = charRefs.current.filter(Boolean);
      const nextChars = nextCharRefs.current.filter(Boolean);

      updateLayout();
      gsap.set(chars, { autoAlpha: 0, y: 26 });
      gsap.set(title, { autoAlpha: 1, y: 0 });
      gsap.set(cd, {
        autoAlpha: 1,
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: "70vh",
        rotation: 0,
        scale: 1
      });
      gsap.set(videoFrames, { autoAlpha: 0 });
      gsap.set(nextChars, { autoAlpha: 0, y: 26 });
      gsap.set(nextTitle, { y: 0 });

      timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => {
            const routeLength = routeGeometry?.totalLength ?? window.innerWidth * 2;
            return `+=${Math.max(window.innerHeight * 7, window.innerHeight * 2.5 + routeLength * 2.4)}`;
          },
          scrub: 1,
          pin: section,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: updateLayout,
          onEnter: playVideos,
          onEnterBack: playVideos,
          onLeave: pauseVideos,
          onLeaveBack: pauseVideos
        }
      });

      timeline
        .to(chars, { autoAlpha: 1, y: 0, duration: 0.6, stagger: { each: 0.03 } }, 0)
        .addLabel("aboutTitleRevealed")
        .to({}, { duration: 0.05 })
        .to(cd, { y: 0, duration: 0.7, ease: "power2.out" })
        .addLabel("cdIn")
        .to(cd, { rotation: 360, duration: 2.2 }, "cdIn")
        .addLabel("fullTurn")
        .to(title, { y: "-30vh", duration: 0.5 }, "fullTurn")
        .to(
          cd,
          {
            scale: () => routeGeometry?.smallScale ?? 0.15,
            duration: SHRINK_DURATION
          },
          "fullTurn"
        )
        .to(
          cd,
          {
            rotation: 360 + CD_SPIN_DEGREES_PER_UNIT * (SHRINK_DURATION + ROUTE_DURATION),
            duration: SHRINK_DURATION + ROUTE_DURATION
          },
          "fullTurn"
        )
        .addLabel("routeStart", `fullTurn+=${SHRINK_DURATION}`)
        .to(
          routeState,
          {
            progress: 1,
            duration: ROUTE_DURATION,
            onUpdate: renderRoute
          },
          "routeStart"
        )
        .addLabel("cdGone", `routeStart+=${ROUTE_DURATION}`)
        .to(nextChars, { autoAlpha: 1, y: 0, duration: 0.4, stagger: { each: 0.018 } }, "cdGone")
        .addLabel("nextTitleRevealed")
        .to({}, { duration: 0.15 });

      updateNavTargets = () => {
        const currentTimeline = timeline;
        const scrollTrigger = currentTimeline?.scrollTrigger;
        const duration = currentTimeline?.duration() ?? 0;
        const nextSection = document.getElementById("next");

        if (!currentTimeline || !scrollTrigger || duration === 0) {
          return;
        }

        const scrollAtLabel = (label: "aboutTitleRevealed" | "nextTitleRevealed") =>
          scrollTrigger.start +
          (currentTimeline.labels[label] / duration) * (scrollTrigger.end - scrollTrigger.start);

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
      pauseVideos();
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
      <div
        ref={videoStageRef}
        className="pointer-events-none absolute z-10 grid grid-cols-3"
        aria-hidden="true"
      >
        {VIDEO_SOURCES.map((src, index) => (
          <div
            key={`${src}-${index}`}
            ref={(node) => {
              if (node) {
                videoFrameRefs.current[index] = node;
              }
            }}
            className="about-video-frame invisible relative aspect-video overflow-hidden rounded-md opacity-0"
          >
            <video
              ref={(node) => {
                if (node) {
                  videoRefs.current[index] = node;
                }
              }}
              src={src}
              muted
              loop
              playsInline
              preload="metadata"
              className="block h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      <Image
        ref={cdRef}
        src="/assets/silver-cracks.png"
        alt="Silver Cracks CD"
        width={1024}
        height={1024}
        onLoad={() => ScrollTrigger.refresh()}
        className="silver-disc pointer-events-none absolute z-30 aspect-square w-[45vmin] max-w-[620px] min-w-[240px] select-none"
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

      <div className="pointer-events-none absolute inset-x-0 top-16 bottom-0 z-40 flex items-center justify-center px-2 sm:px-5 md:top-20">
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
