"use client";

import Image from "next/image";
import { useEffect } from "react";
import {
  SHORT_VIEWPORT_QUERY,
  getBlackoutMediaQueries,
  matchesBlackoutViewport
} from "../utils/blackout";

const MEME_DELAY_MS = 500;
const RELEASE_HOLD_MS = 500;

export default function MemeGate() {
  useEffect(() => {
    const root = document.documentElement;
    const mediaQueries = getBlackoutMediaQueries();
    let blackoutHoldUntil = 0;
    let blackoutTimer = 0;
    let memeTimer = 0;
    let rotationFrame = 0;
    let wasBlackoutTarget = false;

    const shouldBlackout = () => matchesBlackoutViewport(mediaQueries);

    const clearBlackoutTimer = () => {
      window.clearTimeout(blackoutTimer);
      blackoutTimer = 0;
    };

    const clearMemeTimer = () => {
      window.clearTimeout(memeTimer);
      memeTimer = 0;
    };

    const hideMeme = () => {
      root.classList.remove("viewport-blackout-meme-active");
    };

    const scheduleMeme = () => {
      clearMemeTimer();
      hideMeme();

      memeTimer = window.setTimeout(() => {
        memeTimer = 0;

        if (shouldBlackout()) {
          root.classList.add("viewport-blackout-meme-active");
        }
      }, MEME_DELAY_MS);
    };

    const scheduleBlackoutRelease = (updateBlackout: () => void) => {
      clearBlackoutTimer();

      const remainingHold = blackoutHoldUntil - Date.now();

      if (remainingHold > 0) {
        blackoutTimer = window.setTimeout(updateBlackout, remainingHold);
      }
    };

    const updateBlackout = ({ extendHoldOnClear = false } = {}) => {
      const targetIsActive = shouldBlackout();
      const holdIsActive = Date.now() < blackoutHoldUntil;

      if (targetIsActive) {
        clearBlackoutTimer();
        root.classList.add("viewport-blackout-active");

        if (!wasBlackoutTarget) {
          scheduleMeme();
        }
      } else {
        if (wasBlackoutTarget || holdIsActive || extendHoldOnClear) {
          blackoutHoldUntil = Date.now() + RELEASE_HOLD_MS;
        }

        clearMemeTimer();
        hideMeme();

        const releaseIsActive = Date.now() < blackoutHoldUntil;
        root.classList.toggle("viewport-blackout-active", releaseIsActive);
        scheduleBlackoutRelease(updateBlackout);
      }

      wasBlackoutTarget = targetIsActive;
    };

    const holdBlackout = () => {
      updateBlackout({ extendHoldOnClear: true });
      window.cancelAnimationFrame(rotationFrame);
      rotationFrame = window.requestAnimationFrame(() => updateBlackout());
    };

    const handleViewportChange = () => updateBlackout();

    mediaQueries.forEach((media) =>
      media.addEventListener("change", handleViewportChange)
    );
    window.addEventListener("orientationchange", holdBlackout, { passive: true });
    window.addEventListener("resize", handleViewportChange, { passive: true });
    window.visualViewport?.addEventListener("resize", handleViewportChange, {
      passive: true
    });
    window.screen.orientation?.addEventListener("change", holdBlackout);

    updateBlackout();

    return () => {
      clearBlackoutTimer();
      clearMemeTimer();
      window.cancelAnimationFrame(rotationFrame);
      mediaQueries.forEach((media) =>
        media.removeEventListener("change", handleViewportChange)
      );
      window.removeEventListener("orientationchange", holdBlackout);
      window.removeEventListener("resize", handleViewportChange);
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
      window.screen.orientation?.removeEventListener("change", holdBlackout);
      root.classList.remove(
        "viewport-blackout-active",
        "viewport-blackout-meme-active"
      );
    };
  }, []);

  return (
    <div className="viewport-blackout" aria-hidden="true">
      <div className="viewport-blackout-content">
        <Image
          className="viewport-blackout-meme"
          src="/assets/Draw.jpg"
          alt=""
          width={503}
          height={497}
          sizes={`${SHORT_VIEWPORT_QUERY} min(80vw, 420px), 1px`}
        />
        <p className="viewport-blackout-caption">
          Please increase your screen height
        </p>
      </div>
    </div>
  );
}
