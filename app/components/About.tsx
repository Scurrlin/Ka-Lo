"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isWebKitBrowser } from "../utils/isWebKit";

const TITLE = "Who is Ka-Lo?";
const CONTINUE_HINT = "Scroll To Continue";
const CONTINUE_HINT_LETTER_COUNT = CONTINUE_HINT.replace(/ /g, "").length;
const NEXT_TITLE = "Rapper";
/** Seconds of ScrollTrigger catch-up lag for the About scrubbed timeline.
 * Kept moderate so it doesn't stack into "double mush" with Lenis wheel lerp. */
const SCRUB_LAG = 1.2;
/** Slightly higher on WebKit so sticky scrub masks residual Safari frame drops. */
const SAFARI_SCRUB_LAG = 1.45;
const VIDEO_SOURCES = [
  "/videos/driving-6.5s.mp4",
  "/videos/running-10s.mp4",
  "/videos/birds-13s.mp4"
] as const;
const VIDEO_CAPTIONS = [
  { text: "A Conscious Lyricist", position: "below" as const },
  { text: "And Producer", position: "above" as const },
  { text: "Pushing The Limits Of Hip-Hop", position: "below" as const }
] as const;
const FINAL_MESSAGE = "Not Your Traditional...";

const CD_CLEARANCE = 18;
const CD_VERTICAL_CLEARANCE = 36;
/** Extra space below the fold so the waiting CD never peeks into view. */
const CD_ENTRANCE_CLEARANCE = 24;
const CD_MIN_DIAMETER = 88;
const CD_MAX_DIAMETER = 192;
const VIDEO_MAX_WIDTH = 680;
const RUNNING_SLOT_WIDTH_RATIO = 0.5;
const RUNNING_VIDEO_SCALE = 1.9;
const MIDDLE_ARC_SAMPLES_PER_HALF = 28;
const SHRINK_DURATION = 1.25;
const ROUTE_DURATION = 8;
const GROW_DURATION = 1.35;
const FULL_SIZE_HOLD_DURATION = 0.65;
const EXIT_DURATION = 0.9;
const NEXT_TITLE_HOLD_DURATION = 1.25;
const NEXT_TITLE_EXTRA_SCROLL_SCREENS = 0.75;
const CD_SPIN_DEGREES_PER_UNIT = 852 / 5.5;
const DESKTOP_MIN_WIDTH = 640;
const VIDEO_CENTER_PROGRESS = 0.5;
const DESKTOP_LATE_CAPTION_START_PROGRESS = 0.4;
const MOBILE_LATE_CAPTION_START_PROGRESS = 0.3;
const WIDE_VIEWPORT_SCROLL_STRETCH = 1.2;

type Point = {
  x: number;
  y: number;
  trackX: number;
};

type LocalPoint = {
  x: number;
  y: number;
};

type RouteGeometry = {
  points: Point[];
  cumulativeLengths: number[];
  videoRevealRanges: ReadonlyArray<{ start: number; end: number }>;
  captionRevealDistances: number[];
  captionRevealWindow: number;
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

function interpolate(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function getCubicBezierPoint(
  start: LocalPoint,
  controlOne: LocalPoint,
  controlTwo: LocalPoint,
  end: LocalPoint,
  progress: number
) {
  const inverse = 1 - progress;
  const inverseSquared = inverse * inverse;
  const progressSquared = progress * progress;

  return {
    x:
      inverseSquared * inverse * start.x +
      3 * inverseSquared * progress * controlOne.x +
      3 * inverse * progressSquared * controlTwo.x +
      progressSquared * progress * end.x,
    y:
      inverseSquared * inverse * start.y +
      3 * inverseSquared * progress * controlOne.y +
      3 * inverse * progressSquared * controlTwo.y +
      progressSquared * progress * end.y
  };
}

function smoothstep(value: number) {
  const progress = clamp(value, 0, 1);
  return progress * progress * (3 - 2 * progress);
}

/** GSAP y offset from viewport-center origin that parks the full CD below the fold. */
function getCdEntranceStartY(cdElement: HTMLElement, viewportHeight: number) {
  return viewportHeight / 2 + cdElement.offsetWidth / 2 + CD_ENTRANCE_CLEARANCE;
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
    y: start.y + (end.y - start.y) * segmentProgress,
    trackX: start.trackX + (end.trackX - start.trackX) * segmentProgress
  };
}

function getDistanceAtTrackPosition(
  points: Point[],
  cumulativeLengths: number[],
  targetTrackX: number
) {
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const isBetween =
      targetTrackX <= Math.max(start.trackX, end.trackX) &&
      targetTrackX >= Math.min(start.trackX, end.trackX);

    if (!isBetween) {
      continue;
    }

    const progress =
      start.trackX === end.trackX
        ? 0
        : (targetTrackX - start.trackX) / (end.trackX - start.trackX);

    return (
      cumulativeLengths[index] +
      (cumulativeLengths[index + 1] - cumulativeLengths[index]) * progress
    );
  }

  return cumulativeLengths[cumulativeLengths.length - 1];
}

function AnimatedWords({ text, registerCharacter }: AnimatedWordsProps) {
  const words = text.split(" ");
  let characterIndex = 0;

  return words.map((word, wordIndex) => (
    <Fragment key={`${word}-${wordIndex}`}>
      <span className="inline-block whitespace-nowrap">
        {Array.from(word).map((char) => {
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
  const stickyStageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cdRef = useRef<HTMLImageElement>(null);
  const videoStageRef = useRef<HTMLDivElement>(null);
  const videoFrameRefs = useRef<HTMLDivElement[]>([]);
  const videoCaptionRefs = useRef<HTMLHeadingElement[]>([]);
  const videoCaptionCharRefs = useRef<HTMLSpanElement[][]>([]);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const finalMessageRef = useRef<HTMLHeadingElement>(null);
  const finalMessageCharRefs = useRef<HTMLSpanElement[]>([]);
  const charRefs = useRef<HTMLSpanElement[]>([]);
  const continueHintCharRefs = useRef<HTMLSpanElement[]>([]);
  const nextTitleRef = useRef<HTMLHeadingElement>(null);
  const nextCharRefs = useRef<HTMLSpanElement[]>([]);
  const [shouldLoadVideos, setShouldLoadVideos] = useState(false);

  // Keep video bytes off the network until About is near the viewport.
  useEffect(() => {
    const section = sectionRef.current;

    if (!section || shouldLoadVideos) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoadVideos(true);
          observer.disconnect();
        }
      },
      { rootMargin: "80% 0px" }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [shouldLoadVideos]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const stickyStage = stickyStageRef.current;
    const title = titleRef.current;
    const cd = cdRef.current;
    const videoStage = videoStageRef.current;
    const finalMessage = finalMessageRef.current;
    const nextTitle = nextTitleRef.current;

    if (
      !section ||
      !stickyStage ||
      !title ||
      !cd ||
      !videoStage ||
      !finalMessage ||
      !nextTitle
    ) {
      return;
    }

    const videoFrames = videoFrameRefs.current.filter(Boolean);
    const videoCaptions = videoCaptionRefs.current.filter(Boolean);
    const videoCaptionChars = videoCaptionCharRefs.current.map((characters) =>
      characters.filter(Boolean)
    );
    const finalMessageChars = finalMessageCharRefs.current.filter(Boolean);
    const videos = videoRefs.current.filter(Boolean);
    const routeState = { progress: 0 };
    let routeGeometry: RouteGeometry | null = null;
    let timeline: gsap.core.Timeline | null = null;
    let videoTrackExitX = 0;
    let cdExitX = 0;
    let finalMessageExitX = 0;
    let videosArePlaying = false;
    let updateNavTargets = () => {};

    const playVideos = () => {
      if (videosArePlaying) {
        return;
      }

      videosArePlaying = true;

      videos.forEach((video) => {
        video.muted = true;

        void video.play().catch(() => {
          // Muted inline playback is permitted in modern browsers, but a rejected
          // promise should not interrupt the scroll experience.
        });
      });
    };

    const pauseVideos = () => {
      videosArePlaying = false;
      videos.forEach((video) => video.pause());
    };

    const syncVideoPlayback = () => {
      const currentTimeline = timeline;

      if (!currentTimeline) {
        pauseVideos();
        return;
      }

      const routeStart = currentTimeline.labels.routeStart ?? Number.POSITIVE_INFINITY;
      const routeComplete = currentTimeline.labels.routeComplete ?? Number.NEGATIVE_INFINITY;
      const currentTime = currentTimeline.time();
      const videosShouldPlay =
        currentTime >= routeStart && currentTime <= routeComplete + GROW_DURATION;

      if (videosShouldPlay) {
        playVideos();
      } else if (videosArePlaying) {
        pauseVideos();
      }
    };

    const renderRoute = () => {
      const geometry = routeGeometry;

      if (!geometry) {
        return;
      }

      const point = getPointOnRoute(geometry, routeState.progress);

      gsap.set(cd, { x: point.x, y: point.y, scale: geometry.smallScale });
      gsap.set(videoStage, { x: point.trackX });

      videoCaptionChars.forEach((characters, captionIndex) => {
        const revealStart = geometry.captionRevealDistances[captionIndex];
        const revealProgress = clamp(
          (point.distance - revealStart) / geometry.captionRevealWindow,
          0,
          1
        );
        const staggerSpan = characters.length + 5;

        characters.forEach((character, characterIndex) => {
          const characterProgress = smoothstep(
            clamp(revealProgress * staggerSpan - characterIndex, 0, 1)
          );
          gsap.set(character, {
            autoAlpha: characterProgress,
            y: (1 - characterProgress) * 20
          });
        });
      });
    };

    const updateLayout = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const baseCdDiameter = cd.offsetWidth;
      const smallCdDiameter = clamp(
        Math.min(viewportWidth, viewportHeight) * 0.15,
        CD_MIN_DIAMETER,
        CD_MAX_DIAMETER
      );
      const smallCdRadius = smallCdDiameter / 2;
      const edgeMargin = clamp(viewportWidth * 0.02, 8, 24);
      const verticalClearance =
        viewportHeight <= 700 ? 16 : CD_VERTICAL_CLEARANCE;
      const routeClearance =
        smallCdRadius +
        Math.max(verticalClearance, clamp(viewportWidth * 0.018, 20, 28));
      const availableRouteHeight = Math.max(
        1,
        viewportHeight -
          edgeMargin * 2 -
          (routeClearance + smallCdRadius) * 2
      );
      const maxVideoWidthByHeight = availableRouteHeight * (4 / 3);
      const videoWidth = Math.max(
        1,
        Math.min(VIDEO_MAX_WIDTH, viewportWidth * 0.78, maxVideoWidthByHeight)
      );
      const baseGap =
        clamp(
          viewportWidth * 0.22,
          smallCdRadius + CD_CLEARANCE * 2 + 48,
          300
        ) * 0.85;
      const runningSlotWidth = videoWidth * RUNNING_SLOT_WIDTH_RATIO;
      const runningOverhang =
        (videoWidth * (RUNNING_VIDEO_SCALE - RUNNING_SLOT_WIDTH_RATIO)) / 2;
      const gap = baseGap + runningOverhang;
      const videoHeight = videoWidth * (3 / 4);
      const rowWidth = videoWidth * 2 + runningSlotWidth + gap * 2;
      const rowTop = (viewportHeight - videoHeight) / 2;
      const origin = {
        x: viewportWidth / 2,
        y: viewportHeight / 2
      };
      const videoOne = {
        left: 0,
        right: videoWidth,
        top: rowTop,
        bottom: rowTop + videoHeight
      };
      const videoTwo = {
        left: videoWidth + gap,
        right: videoWidth + gap + runningSlotWidth,
        top: rowTop,
        bottom: rowTop + videoHeight
      };
      const videoThree = {
        left: videoWidth + runningSlotWidth + gap * 2,
        right: rowWidth,
        top: rowTop,
        bottom: rowTop + videoHeight
      };
      const horizontalTraceOffset = smallCdRadius + CD_CLEARANCE;
      const verticalTraceOffset = smallCdRadius + verticalClearance;
      const topY = videoOne.top - verticalTraceOffset;
      const firstGapX = videoOne.right + horizontalTraceOffset;
      const secondGapX = videoThree.left - horizontalTraceOffset;
      const centerX = origin.x;
      const centerBand = clamp(viewportWidth * 0.08, 20, 64);
      const videoOneCenteredTrackX = centerX - videoWidth / 2;
      const firstGapEnterTrackX = centerX + centerBand - firstGapX;
      const secondGapExitTrackX = centerX - centerBand - secondGapX;
      const videoThreeRightEnterTrackX =
        centerX + centerBand - (videoThree.right + horizontalTraceOffset);
      const videoThreeRightCenteredTrackX =
        centerX - (videoThree.right + horizontalTraceOffset);
      const middleArcStart: LocalPoint = {
        x: firstGapX,
        y: -verticalTraceOffset
      };
      const middleArcEnd: LocalPoint = {
        x: secondGapX,
        y: -verticalTraceOffset
      };
      const middleArcSpan = middleArcEnd.x - middleArcStart.x;
      const middleArcDepth = clamp(videoHeight * 0.07, 14, 28);
      const middleArcBottom: LocalPoint = {
        x: middleArcStart.x + middleArcSpan / 2,
        y: videoHeight + verticalTraceOffset + middleArcDepth
      };
      const middleArcLeftControlOne: LocalPoint = {
        x: middleArcStart.x + middleArcSpan * 0.12,
        y: middleArcStart.y
      };
      const middleArcLeftControlTwo: LocalPoint = {
        x: middleArcBottom.x - middleArcSpan * 0.28,
        y: middleArcBottom.y
      };
      const middleArcRightControlOne: LocalPoint = {
        x: middleArcBottom.x + middleArcSpan * 0.28,
        y: middleArcBottom.y
      };
      const middleArcRightControlTwo: LocalPoint = {
        x: middleArcEnd.x - middleArcSpan * 0.12,
        y: middleArcEnd.y
      };
      const getMiddleArcPoint = (
        localPoint: LocalPoint,
        routeProgress: number
      ): Point => {
        const trackX = interpolate(
          firstGapEnterTrackX,
          secondGapExitTrackX,
          smoothstep(routeProgress)
        );

        return {
          x: localPoint.x + trackX - origin.x,
          y: rowTop + localPoint.y - origin.y,
          trackX
        };
      };
      const middleArcLeftPoints = Array.from(
        { length: MIDDLE_ARC_SAMPLES_PER_HALF },
        (_, index): Point => {
          const progress = (index + 1) / MIDDLE_ARC_SAMPLES_PER_HALF;
          const localPoint = getCubicBezierPoint(
            middleArcStart,
            middleArcLeftControlOne,
            middleArcLeftControlTwo,
            middleArcBottom,
            progress
          );

          return getMiddleArcPoint(localPoint, progress / 2);
        }
      );
      const middleArcRightPoints = Array.from(
        { length: MIDDLE_ARC_SAMPLES_PER_HALF },
        (_, index): Point => {
          const progress = (index + 1) / MIDDLE_ARC_SAMPLES_PER_HALF;
          const localPoint = getCubicBezierPoint(
            middleArcBottom,
            middleArcRightControlOne,
            middleArcRightControlTwo,
            middleArcEnd,
            progress
          );

          return getMiddleArcPoint(localPoint, 0.5 + progress / 2);
        }
      );
      const points = [
        { x: 0, y: 0, trackX: viewportWidth + edgeMargin },
        {
          x: -videoWidth / 2 - horizontalTraceOffset,
          y: videoOne.top + videoHeight / 2 - origin.y,
          trackX: videoOneCenteredTrackX
        },
        {
          x: -videoWidth / 2 - horizontalTraceOffset,
          y: topY - origin.y,
          trackX: videoOneCenteredTrackX
        },
        {
          x: centerBand,
          y: topY - origin.y,
          trackX: firstGapEnterTrackX
        },
        ...middleArcLeftPoints,
        ...middleArcRightPoints,
        {
          x: centerBand,
          y: topY - origin.y,
          trackX: videoThreeRightEnterTrackX
        },
        {
          x: 0,
          y: videoThree.top + videoHeight / 2 - origin.y,
          trackX: videoThreeRightCenteredTrackX
        }
      ];
      const cumulativeLengths = [0];

      for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const current = points[index];
        const previousLocalX = origin.x + previous.x - previous.trackX;
        const currentLocalX = origin.x + current.x - current.trackX;
        const segmentLength =
          index === 1
            ? Math.hypot(current.x - previous.x, current.y - previous.y)
            : Math.hypot(currentLocalX - previousLocalX, current.y - previous.y);
        cumulativeLengths.push(
          cumulativeLengths[index - 1] + segmentLength
        );
      }

      const middleArcStartIndex = 3;
      const middleArcBottomIndex =
        middleArcStartIndex + MIDDLE_ARC_SAMPLES_PER_HALF;
      const middleArcEndIndex =
        middleArcBottomIndex + MIDDLE_ARC_SAMPLES_PER_HALF;
      const videoRevealRanges = [
        {
          start: 0,
          end: cumulativeLengths[1] * 0.75
        },
        {
          start: cumulativeLengths[middleArcStartIndex],
          end: interpolate(
            cumulativeLengths[middleArcStartIndex],
            cumulativeLengths[middleArcBottomIndex],
            0.55
          )
        },
        {
          start: cumulativeLengths[middleArcEndIndex],
          end: interpolate(
            cumulativeLengths[middleArcEndIndex],
            cumulativeLengths[middleArcEndIndex + 1],
            0.55
          )
        }
      ];
      const videoCenterTrackPositions = [
        videoOneCenteredTrackX,
        centerX - (videoTwo.left + runningSlotWidth / 2),
        centerX - (videoThree.left + videoWidth / 2)
      ];
      const captionRevealWindow = clamp(videoWidth * 0.42, 110, 260);
      const lateCaptionStartProgress =
        viewportWidth >= DESKTOP_MIN_WIDTH
          ? DESKTOP_LATE_CAPTION_START_PROGRESS
          : MOBILE_LATE_CAPTION_START_PROGRESS;
      const lateCaptionApproachProgress =
        lateCaptionStartProgress / VIDEO_CENTER_PROGRESS;
      const captionRevealDistances = videoCenterTrackPositions.map(
        (trackX, captionIndex) => {
          const centeredDistance = getDistanceAtTrackPosition(
            points,
            cumulativeLengths,
            trackX
          );

          if (captionIndex === 0) {
            return centeredDistance;
          }

          // Treat each video's reveal start as 0% and its centered position as
          // 50%. The later captions therefore begin at 40% on desktop and 30%
          // on mobile without changing the character-cascade duration.
          return interpolate(
            videoRevealRanges[captionIndex].start,
            centeredDistance,
            lateCaptionApproachProgress
          );
        }
      );
      const totalRouteLength = cumulativeLengths[cumulativeLengths.length - 1];

      routeGeometry = {
        points,
        cumulativeLengths,
        videoRevealRanges,
        captionRevealDistances,
        captionRevealWindow,
        totalLength: totalRouteLength,
        smallScale: smallCdDiameter / baseCdDiameter
      };
      const scrollStretch =
        viewportWidth >= DESKTOP_MIN_WIDTH ? WIDE_VIEWPORT_SCROLL_STRETCH : 1;
      const storyScrollDistance =
        (Math.max(
          viewportHeight * 7,
          viewportHeight * 2.5 + totalRouteLength * 2.4
        ) +
          viewportHeight * NEXT_TITLE_EXTRA_SCROLL_SCREENS) *
        scrollStretch;

      section.style.height = `${viewportHeight + storyScrollDistance}px`;
      stickyStage.style.height = `${viewportHeight}px`;
      videoTrackExitX = -rowWidth - edgeMargin;
      cdExitX = viewportWidth + baseCdDiameter / 2 + edgeMargin - origin.x;
      finalMessageExitX = -viewportWidth / 2 - finalMessage.offsetWidth / 2 - edgeMargin;

      gsap.set(videoStage, {
        left: 0,
        top: rowTop,
        width: rowWidth,
        height: videoHeight,
        x: points[0].trackX
      });
      videoStage.style.setProperty("--about-video-width", `${videoWidth}px`);
      videoStage.style.setProperty("--about-video-height", `${videoHeight}px`);
      videoStage.style.setProperty("--about-video-gap", `${gap}px`);
      videoStage.style.setProperty("--about-running-slot-width", `${runningSlotWidth}px`);
      videoStage.style.setProperty("--about-running-scale", RUNNING_VIDEO_SCALE.toString());
      gsap.set(cd, { left: origin.x, top: origin.y });
      gsap.set(finalMessage, {
        left: origin.x,
        top: origin.y - baseCdDiameter / 2 - clamp(viewportHeight * 0.035, 20, 36)
      });

      const routeStart = timeline?.labels.routeStart ?? Number.POSITIVE_INFINITY;
      const routeComplete = timeline?.labels.routeComplete ?? Number.NEGATIVE_INFINITY;

      if (timeline && timeline.time() >= routeStart && timeline.time() <= routeComplete) {
        renderRoute();
      }
    };

    const ctx = gsap.context(() => {
      const chars = charRefs.current.filter(Boolean);
      const continueHintChars = continueHintCharRefs.current.filter(Boolean);
      const nextChars = nextCharRefs.current.filter(Boolean);

      updateLayout();
      gsap.set(chars, { autoAlpha: 0, y: 26 });
      gsap.set(continueHintChars, { autoAlpha: 0, y: 26 });
      gsap.set(title, { autoAlpha: 1, y: 0 });
      gsap.set(cd, {
        autoAlpha: 1,
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: () => getCdEntranceStartY(cd, window.innerHeight),
        rotation: 0,
        scale: 1
      });
      // No fade-in: the videos are already fully opaque, and only become
      // visible as the horizontal track slides them past the sticky
      // stage's clipped edge.
      gsap.set(videoFrames, { autoAlpha: 1 });
      gsap.set(videoCaptions, { autoAlpha: 1, xPercent: -50 });
      gsap.set(videoCaptionChars.flat(), { autoAlpha: 0, y: 20 });
      gsap.set(finalMessage, { autoAlpha: 1, xPercent: -50, yPercent: -100 });
      gsap.set(finalMessageChars, { autoAlpha: 0, y: 20 });
      gsap.set(nextChars, { autoAlpha: 0, y: 26 });
      gsap.set(nextTitle, { y: 0 });

      timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: isWebKitBrowser() ? SAFARI_SCRUB_LAG : SCRUB_LAG,
          invalidateOnRefresh: true,
          onRefreshInit: updateLayout,
          onUpdate: syncVideoPlayback,
          onLeave: pauseVideos,
          onLeaveBack: pauseVideos
        }
      });

      timeline
        .to(chars, { autoAlpha: 1, y: 0, duration: 0.6, stagger: { each: 0.03 } }, 0)
        .to(
          continueHintChars,
          { autoAlpha: 1, y: 0, duration: 0.45, stagger: { each: 0.025 } }
        )
        .addLabel("aboutTitleRevealed")
        .to({}, { duration: 0.05 })
        .fromTo(
          cd,
          { y: () => getCdEntranceStartY(cd, window.innerHeight) },
          { y: 0, duration: 3, ease: "none" }
        )
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
            rotation:
              360 +
              CD_SPIN_DEGREES_PER_UNIT *
                (SHRINK_DURATION +
                  ROUTE_DURATION +
                  GROW_DURATION +
                  FULL_SIZE_HOLD_DURATION +
                  EXIT_DURATION),
            duration:
              SHRINK_DURATION +
              ROUTE_DURATION +
              GROW_DURATION +
              FULL_SIZE_HOLD_DURATION +
              EXIT_DURATION
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
        .addLabel("routeComplete", `routeStart+=${ROUTE_DURATION}`)
        .to(
          cd,
          { x: 0, y: 0, scale: 1, duration: GROW_DURATION, ease: "power2.inOut" },
          "routeComplete"
        )
        .to(
          videoStage,
          {
            x: () => videoTrackExitX,
            duration: GROW_DURATION,
            ease: "none"
          },
          "routeComplete"
        )
        .to(
          [...videoFrames, ...videoCaptions],
          { autoAlpha: 0, duration: GROW_DURATION * 0.65 },
          `routeComplete+=${GROW_DURATION * 0.35}`
        )
        .addLabel("fullSize", `routeComplete+=${GROW_DURATION}`)
        .to(
          finalMessage,
          { y: 0, duration: 0.01 },
          "fullSize"
        )
        .to(
          finalMessageChars,
          { autoAlpha: 1, y: 0, duration: 0.42, stagger: { each: 0.025 }, ease: "power2.out" },
          `fullSize-=${0.2}`
        )
        .addLabel("exitStart", `fullSize+=${FULL_SIZE_HOLD_DURATION}`)
        .to(cd, { x: () => cdExitX, duration: EXIT_DURATION, ease: "power1.in" }, "exitStart")
        .to(
          finalMessage,
          {
            x: () => finalMessageExitX,
            duration: EXIT_DURATION,
            ease: "power1.in"
          },
          "exitStart"
        )
        .addLabel("cdGone", `exitStart+=${EXIT_DURATION}`)
        .to(nextChars, { autoAlpha: 1, y: 0, duration: 0.4, stagger: { each: 0.018 } }, "cdGone")
        .addLabel("nextTitleRevealed")
        .to({}, { duration: NEXT_TITLE_HOLD_DURATION });

      syncVideoPlayback();

      updateNavTargets = () => {
        const currentTimeline = timeline;
        const scrollTrigger = currentTimeline?.scrollTrigger;
        const duration = currentTimeline?.duration() ?? 0;

        if (!currentTimeline || !scrollTrigger || duration === 0) {
          return;
        }

        const scrollAtLabel = (label: "aboutTitleRevealed") =>
          scrollTrigger.start +
          (currentTimeline.labels[label] / duration) * (scrollTrigger.end - scrollTrigger.start);

        section.dataset.navScrollY = Math.round(scrollAtLabel("aboutTitleRevealed")).toString();
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
      section.style.removeProperty("height");
      stickyStage.style.removeProperty("height");
      ctx.revert();
    };
  }, []);

  return (
    <>
      <section ref={sectionRef} id="about" className="relative h-screen bg-black text-white">
        <div
          ref={stickyStageRef}
          className="sticky top-0 h-screen overflow-hidden bg-black"
        >
      <div
        ref={videoStageRef}
        className="about-video-stage pointer-events-none absolute z-10"
      >
        {VIDEO_SOURCES.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className={`about-video-item relative ${
              index === 1 ? "about-video-item-running" : "about-video-item-side"
            }`}
          >
            <div
              ref={(node) => {
                if (node) {
                  videoFrameRefs.current[index] = node;
                }
              }}
              className={`about-video-frame invisible opacity-0 ${
                index === 1
                  ? "about-video-frame-running"
                  : "relative overflow-hidden rounded-md"
              }`}
            >
              <video
                ref={(node) => {
                  if (node) {
                    videoRefs.current[index] = node;
                  }
                }}
                src={shouldLoadVideos ? src : undefined}
                muted
                loop
                playsInline
                preload={shouldLoadVideos ? "metadata" : "none"}
                aria-hidden="true"
                className={`block h-full w-full object-cover ${
                  index === 1 ? "about-running-video" : ""
                }`}
              />
            </div>
            <h3
              ref={(node) => {
                if (node) {
                  videoCaptionRefs.current[index] = node;
                }
              }}
              className={`about-video-caption about-video-caption-${VIDEO_CAPTIONS[index].position} invisible font-display text-xl leading-tight text-white opacity-0 sm:text-2xl md:text-3xl`}
            >
              <AnimatedWords
                text={VIDEO_CAPTIONS[index].text}
                registerCharacter={(node, characterIndex) => {
                  if (!videoCaptionCharRefs.current[index]) {
                    videoCaptionCharRefs.current[index] = [];
                  }

                  if (node) {
                    videoCaptionCharRefs.current[index][characterIndex] = node;
                  }
                }}
              />
            </h3>
          </div>
        ))}
      </div>

      <Image
        ref={cdRef}
        src="/assets/Silver-Cracks.webp"
        alt="Silver Cracks CD"
        width={1024}
        height={1024}
        onLoad={() => ScrollTrigger.refresh()}
        className="silver-disc pointer-events-none absolute z-40 aspect-square w-[45vmin] max-w-[620px] min-w-[240px] select-none"
      />

      <h3
        ref={finalMessageRef}
        className="pointer-events-none invisible absolute z-50 w-[min(90vw,44rem)] text-center font-display text-2xl leading-tight text-white opacity-0 sm:text-3xl md:text-4xl"
      >
        <AnimatedWords
          text={FINAL_MESSAGE}
          registerCharacter={(node, index) => {
            if (node) {
              finalMessageCharRefs.current[index] = node;
            }
          }}
        />
      </h3>

      <div
        ref={titleRef}
        className="pointer-events-none absolute left-1/2 top-[16%] z-50 w-full max-w-4xl -translate-x-1/2 px-5 text-center"
      >
        <p className="absolute bottom-full left-0 right-0 mb-4 flex items-center justify-center gap-3 font-display text-lg leading-none text-white/80 sm:mb-5 sm:gap-4 sm:text-xl md:text-2xl">
          <span
            ref={(node) => {
              if (node) {
                continueHintCharRefs.current[0] = node;
              }
            }}
            className="inline-block"
            aria-hidden="true"
          >
            ↓
          </span>
          <span className="inline-block">
            <AnimatedWords
              text={CONTINUE_HINT}
              registerCharacter={(node, index) => {
                if (node) {
                  continueHintCharRefs.current[index + 1] = node;
                }
              }}
            />
          </span>
          <span
            ref={(node) => {
              if (node) {
                continueHintCharRefs.current[CONTINUE_HINT_LETTER_COUNT + 1] = node;
              }
            }}
            className="inline-block"
            aria-hidden="true"
          >
            ↓
          </span>
        </p>
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

      <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center px-2 sm:px-5">
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
        </div>
      </section>

      <section
        className="bg-black px-5 pb-12 pt-4 text-white sm:px-8 md:pb-16 md:pt-6"
        aria-label="What's next story"
      >
        <div className="mx-auto max-w-3xl text-lg leading-relaxed text-white sm:text-xl sm:leading-relaxed">
          <div className="space-y-8">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante
              venenatis dapibus posuere velit aliquet. Donec ullamcorper nulla non metus auctor
              fringilla, sed posuere consectetur est at lobortis.
            </p>
            <p>
              Curabitur blandit tempus porttitor. Maecenas faucibus mollis interdum. Praesent
              commodo cursus magna, vel scelerisque nisl consectetur et. Aenean lacinia bibendum
              nulla sed consectetur.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
