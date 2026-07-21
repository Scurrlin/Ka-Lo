/** Desktop Safari + iOS WebKit (all iOS browsers share WebKit). */
export function isWebKitBrowser() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent;

  if (/iP(ad|hone|od)/i.test(userAgent)) {
    return true;
  }

  return (
    /Safari/i.test(userAgent) &&
    !/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS/i.test(userAgent)
  );
}
