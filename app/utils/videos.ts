// Matches the intro's total on-screen duration (3.3s logo reveal +
// 1.05s wave rise, see Hero.tsx / globals.css) so asset warming never
// holds the reveal past the point the intro animation itself would finish.
export const ASSET_TIMEOUT_MS = 4350;

// One retained <video> element per source. The intro warms these during the
// hero, then About mounts these exact elements into its frames — so each clip
// is fetched and decoded once, not once for a throwaway preloader and again
// for a separate on-page element (Safari refetched per element = the jank).
const videoCache = new Map<string, HTMLVideoElement>();

function createPreloadedVideo(src: string) {
  const video = document.createElement("video");

  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("aria-hidden", "true");
  video.preload = "auto";
  video.src = src;
  // Single load() per element, at creation — never re-issued below.
  video.load();

  return video;
}

/**
 * Returns the shared, retained <video> for a source, creating (and starting to
 * load) it on first request. Callers reuse the same element so there is exactly
 * one network fetch + decode per clip.
 */
export function getPreloadedVideo(src: string) {
  let video = videoCache.get(src);

  if (!video) {
    video = createPreloadedVideo(src);
    videoCache.set(src, video);
  }

  return video;
}

/**
 * Resolves once the shared video's first frame is available (or after a
 * timeout/error) so a single stalled asset can never hang a caller waiting on
 * this promise indefinitely.
 */
export function preloadVideo(src: string) {
  return new Promise<void>((resolve) => {
    const video = getPreloadedVideo(src);

    // HAVE_CURRENT_DATA or better — first frame already decoded.
    if (video.readyState >= 2) {
      resolve();
      return;
    }

    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeoutId);
      video.removeEventListener("loadeddata", finish);
      video.removeEventListener("error", finish);
      resolve();
    };

    const timeoutId = window.setTimeout(finish, ASSET_TIMEOUT_MS);

    video.addEventListener("loadeddata", finish);
    video.addEventListener("error", finish);
  });
}

export function preloadVideos(sources: readonly string[]) {
  return Promise.all(sources.map((src) => preloadVideo(src)));
}
