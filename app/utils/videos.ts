const VIDEO_PRELOAD_TIMEOUT_MS = 8000;

/**
 * Preloads a video via a throwaway <video> element and resolves once the
 * first frame is available (or after a timeout/error) so a single stalled
 * asset can never hang a caller waiting on this promise indefinitely.
 */
export function preloadVideo(src: string) {
  return new Promise<void>((resolve) => {
    const video = document.createElement("video");
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

    const timeoutId = window.setTimeout(finish, VIDEO_PRELOAD_TIMEOUT_MS);

    video.addEventListener("loadeddata", finish);
    video.addEventListener("error", finish);

    video.muted = true;
    video.preload = "auto";
    video.src = src;
    video.load();
  });
}

export function preloadVideos(sources: readonly string[]) {
  return Promise.all(sources.map((src) => preloadVideo(src)));
}
