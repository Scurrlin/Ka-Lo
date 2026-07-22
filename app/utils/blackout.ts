/** Keep in sync with the pre-hydration `@media` in `app/globals.css`. */
export const SHORT_VIEWPORT_QUERY = "(max-height: 499px)";
export const MOBILE_LANDSCAPE_QUERY =
  "(hover: none) and (pointer: coarse) and (orientation: landscape)";

export function getBlackoutMediaQueries() {
  return [
    window.matchMedia(SHORT_VIEWPORT_QUERY),
    window.matchMedia(MOBILE_LANDSCAPE_QUERY)
  ] as const;
}

export function matchesBlackoutViewport(
  mediaQueries: readonly MediaQueryList[] = getBlackoutMediaQueries()
) {
  return mediaQueries.some((media) => media.matches);
}
