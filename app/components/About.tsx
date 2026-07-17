"use client";

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TITLE = "Who is Ka-Lo?";
const NEXT_TITLE = "What's Next?";
const VIDEO_SOURCES = [
  "/videos/driving-6.5s.mp4",
  "/videos/running-10s.mp4",
  "/videos/birds-13s.mp4"
] as const;
const VIDEO_CAPTIONS = [
  { text: "People see one website", position: "below" as const },
  { text: "And all of a sudden...", position: "above" as const },
  { text: "Everyone's a developer lmao", position: "below" as const }
] as const;
const FINAL_MESSAGE = "Lol jk jk 😂 Love you!";

const CD_MIN_DIAMETER = 88;
const CD_MAX_DIAMETER = 192;
const VIDEO_MAX_WIDTH = 680;
const VIDEO_GAP_RATIO = 0.08;
const VIDEO_GAP_MIN = 36;
const VIDEO_GAP_MAX = 88;
const RUNNING_SLOT_WIDTH_RATIO = 0.5;
const RUNNING_VIDEO_SCALE = 1.9;
const ROUTE_SAMPLES_PER_SEGMENT = 18;
const SHRINK_DURATION = 1.25;
const ROUTE_DURATION = 8;
const GROW_DURATION = 1.35;
const FULL_SIZE_HOLD_DURATION = 0.65;
const EXIT_DURATION = 0.9;
const NEXT_TITLE_HOLD_DURATION = 1.25;
const NEXT_TITLE_EXTRA_SCROLL_SCREENS = 0.75;
const CD_SPIN_DEGREES_PER_UNIT = 852 / 5.5;

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
  videoFocusDistances: number[];
  videoRevealWindow: number;
  captionRevealDistances: number[];
  captionRevealWindow: number;
  captionFadeWindow: number;
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

function sampleSmoothRoute(waypoints: LocalPoint[]) {
  const samples: LocalPoint[] = [];
  const controlStrength = 0.75 / 6;

  for (let index = 0; index < waypoints.length - 1; index += 1) {
    const previous = waypoints[Math.max(0, index - 1)];
    const start = waypoints[index];
    const end = waypoints[index + 1];
    const next = waypoints[Math.min(waypoints.length - 1, index + 2)];
    const controlOne = {
      x: start.x + (end.x - previous.x) * controlStrength,
      y: start.y + (end.y - previous.y) * controlStrength
    };
    const controlTwo = {
      x: end.x - (next.x - start.x) * controlStrength,
      y: end.y - (next.y - start.y) * controlStrength
    };

    for (let step = 0; step <= ROUTE_SAMPLES_PER_SEGMENT; step += 1) {
      if (index > 0 && step === 0) {
        continue;
      }

      samples.push(
        getCubicBezierPoint(
          start,
          controlOne,
          controlTwo,
          end,
          step / ROUTE_SAMPLES_PER_SEGMENT
        )
      );
    }
  }

  return samples;
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
  const nextTitleRef = useRef<HTMLHeadingElement>(null);
  const nextCharRefs = useRef<HTMLSpanElement[]>([]);

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

      videoFrames.forEach((frame, index) => {
        const focusDistance = geometry.videoFocusDistances[index];
        const revealStart = index === 0 ? 0 : focusDistance - geometry.videoRevealWindow;
        const revealEnd =
          index === 0
            ? Math.max(1, focusDistance * 0.75)
            : focusDistance - geometry.videoRevealWindow * 0.2;

        gsap.set(frame, {
          autoAlpha: getElementOpacity(point.distance, revealStart, revealEnd)
        });
      });
      videoCaptionChars.forEach((characters, captionIndex) => {
        const revealStart = geometry.captionRevealDistances[captionIndex];
        const revealProgress = clamp(
          (point.distance - revealStart) / geometry.captionRevealWindow,
          0,
          1
        );
        const staggerSpan = characters.length + 5;
        const nextRevealDistance = geometry.captionRevealDistances[captionIndex + 1];
        const fadeProgress = Number.isFinite(nextRevealDistance)
          ? smoothstep(
              (point.distance - (nextRevealDistance - geometry.captionFadeWindow)) /
                geometry.captionFadeWindow
            )
          : 0;
        const captionOpacity = 1 - fadeProgress;

        characters.forEach((character, characterIndex) => {
          const characterProgress = smoothstep(
            clamp(revealProgress * staggerSpan - characterIndex, 0, 1)
          );
          gsap.set(character, {
            autoAlpha: characterProgress * captionOpacity,
            y: (1 - characterProgress) * 20
          });
        });
      });
    };

    const updateLayout = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const header = document.querySelector<HTMLElement>("[data-site-header]");
      const headerHeight = header?.offsetHeight ?? (viewportWidth >= 768 ? 80 : 64);
      const baseCdDiameter = cd.offsetWidth;
      const smallCdDiameter = clamp(
        Math.min(viewportWidth, viewportHeight) * 0.15,
        CD_MIN_DIAMETER,
        CD_MAX_DIAMETER
      );
      const smallCdRadius = smallCdDiameter / 2;
      const edgeMargin = clamp(viewportWidth * 0.02, 8, 24);
      const routeClearance =
        smallCdRadius + clamp(viewportWidth * 0.018, 20, 28);
      const availableRouteHeight = Math.max(
        1,
        viewportHeight -
          headerHeight -
          edgeMargin * 2 -
          (routeClearance + smallCdRadius) * 2
      );
      const maxVideoWidthByHeight = availableRouteHeight * (4 / 3);
      const videoWidth = Math.max(
        1,
        Math.min(VIDEO_MAX_WIDTH, viewportWidth * 0.78, maxVideoWidthByHeight)
      );
      const gap = clamp(
        videoWidth * VIDEO_GAP_RATIO,
        VIDEO_GAP_MIN,
        VIDEO_GAP_MAX
      );
      const runningSlotWidth = videoWidth * RUNNING_SLOT_WIDTH_RATIO;
      const videoHeight = videoWidth * (3 / 4);
      const rowWidth = videoWidth * 2 + runningSlotWidth + gap * 2;
      const rowTop = headerHeight + (viewportHeight - headerHeight - videoHeight) / 2;
      const origin = {
        x: viewportWidth / 2,
        y: headerHeight + (viewportHeight - headerHeight) / 2
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
      const centerX = origin.x;
      const videoOneCenteredTrackX = centerX - videoWidth / 2;
      const videoThreeCenteredTrackX = centerX - (videoThree.left + videoWidth / 2);
      const runningCenterX = videoTwo.left + runningSlotWidth / 2;
      const routeWaypoints: LocalPoint[] = [
        {
          x: videoOne.right - routeClearance * 0.15,
          y: -routeClearance
        },
        {
          x: videoOne.right + routeClearance,
          y: videoHeight * 0.48
        },
        {
          x: videoOne.right + routeClearance * 1.1,
          y: videoHeight + routeClearance * 0.15
        },
        {
          x: runningCenterX,
          y: videoHeight + routeClearance
        },
        {
          x: videoThree.left - routeClearance * 1.1,
          y: videoHeight + routeClearance * 0.15
        },
        {
          x: videoThree.left - routeClearance,
          y: videoHeight * 0.48
        },
        {
          x: videoThree.left + routeClearance * 0.15,
          y: -routeClearance
        }
      ];
      const localRoutePoints = sampleSmoothRoute(routeWaypoints);
      const curvedRoutePoints = localRoutePoints.map((localPoint, index) => {
        const routeProgress = index / Math.max(1, localRoutePoints.length - 1);
        const trackX = interpolate(
          videoOneCenteredTrackX,
          videoThreeCenteredTrackX,
          smoothstep(routeProgress)
        );

        return {
          x: localPoint.x + trackX - origin.x,
          y: rowTop + localPoint.y - origin.y,
          trackX
        };
      });
      const points = [
        { x: 0, y: 0, trackX: viewportWidth + edgeMargin },
        ...curvedRoutePoints
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

      const videoCenterTrackPositions = [
        videoOneCenteredTrackX,
        centerX - runningCenterX,
        videoThreeCenteredTrackX
      ];
      const videoFocusDistances = videoCenterTrackPositions.map((trackX) =>
        getDistanceAtTrackPosition(points, cumulativeLengths, trackX)
      );
      const captionRevealWindow = clamp(videoWidth * 0.42, 110, 260);
      const captionRevealDistances = videoFocusDistances.map((distance) =>
        Math.max(0, distance - captionRevealWindow)
      );
      const totalRouteLength = cumulativeLengths[cumulativeLengths.length - 1];

      routeGeometry = {
        points,
        cumulativeLengths,
        videoFocusDistances,
        videoRevealWindow: clamp(videoWidth * 0.72, 160, 460),
        captionRevealDistances,
        captionRevealWindow,
        captionFadeWindow: clamp(videoWidth * 0.35, 100, 220),
        totalLength: totalRouteLength,
        smallScale: smallCdDiameter / baseCdDiameter
      };
      const storyScrollDistance =
        Math.max(
          viewportHeight * 7,
          viewportHeight * 2.5 + totalRouteLength * 2.4
        ) +
        viewportHeight * NEXT_TITLE_EXTRA_SCROLL_SCREENS;

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
          scrub: true,
          invalidateOnRefresh: true,
          onRefreshInit: updateLayout,
          onUpdate: syncVideoPlayback,
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
          { x: () => videoTrackExitX, duration: GROW_DURATION, ease: "none" },
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
      section.style.removeProperty("height");
      stickyStage.style.removeProperty("height");
      const nextSection = document.getElementById("next");
      delete nextSection?.dataset.navScrollY;
      delete nextSection?.dataset.navSettleMs;
      ctx.revert();
    };
  }, []);

  return (
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
                src={src}
                muted
                loop
                playsInline
                preload="metadata"
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

      <div className="pointer-events-none absolute inset-x-0 top-16 bottom-0 z-50 flex items-center justify-center px-2 sm:px-5 md:top-20">
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
  );
}
