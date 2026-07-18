"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  INSTAGRAM_LINK,
  LYRIC_NAVIGATION,
  SECTION_LINKS,
  SOCIAL_LINKS,
  type SectionId,
  type SocialLink
} from "../constants/links";

const MOBILE_MENU_ID = "mobile-site-navigation";
const DESKTOP_MEDIA_QUERY = "(min-width: 640px)";
const HEADER_DIRECTION_THRESHOLD = 6;
const HEADER_TOP_THRESHOLD = 2;
const FOCUSABLE_SELECTOR =
  "a[href]:not([tabindex='-1']), button:not([disabled]):not([tabindex='-1'])";
const MOBILE_MENU_ITEM_DELAY = 200;
const MOBILE_MENU_ITEM_STAGGER = 60;
// Must stay in sync with the `duration-[600ms]` Tailwind class on each mobile
// menu item below (kept as a literal there so Tailwind's scanner picks it up).
const MOBILE_MENU_ITEM_REVEAL_DURATION = 600;
const MOBILE_MAIN_ITEM_COUNT = SECTION_LINKS.length + SOCIAL_LINKS.length;

type MobileMenuView = "main" | "lyrics" | "silver-cracks" | "exercises";

type SocialLinkProps = {
  social: SocialLink;
  variant: "compact" | "wordmark";
  className?: string;
  imageClassName?: string;
  interaction?: "fade" | "lift" | "none";
  dimWhenUnavailable?: boolean;
  hiddenFromAssistiveTechnology?: boolean;
};

type HeaderProps = {
  isIntroComplete: boolean;
};

function getPageSectionScrollTarget(id: string) {
  const target = document.getElementById(id);

  if (!target) {
    return null;
  }

  const animatedTarget = Number(target.dataset.navScrollY);
  const top = Number.isFinite(animatedTarget)
    ? animatedTarget
    : target.getBoundingClientRect().top + window.scrollY;

  const maxScrollTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  return {
    top: Math.min(Math.max(0, top), maxScrollTop),
    settleMs: Number(target.dataset.navSettleMs) || 0
  };
}

function getMobileMenuItemStyle(index: number, isVisible: boolean): React.CSSProperties {
  // Same top-down order both ways: the topmost item leads on the way in
  // (after the initial delay) and leads on the way out too.
  return {
    transitionDelay: isVisible
      ? `${MOBILE_MENU_ITEM_DELAY + index * MOBILE_MENU_ITEM_STAGGER}ms`
      : `${index * MOBILE_MENU_ITEM_STAGGER}ms`
  };
}

function getMobileMenuTransitionDuration(itemCount: number) {
  return (
    Math.max(0, itemCount - 1) * MOBILE_MENU_ITEM_STAGGER +
    MOBILE_MENU_ITEM_REVEAL_DURATION
  );
}

function MobileMenuItem({
  index,
  isVisible,
  children
}: {
  index: number;
  isVisible: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`transform-gpu transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
      style={getMobileMenuItemStyle(index, isVisible)}
    >
      {children}
    </div>
  );
}

function SocialDestination({
  social,
  variant,
  className = "",
  imageClassName,
  interaction = "fade",
  dimWhenUnavailable = true,
  hiddenFromAssistiveTechnology = false
}: SocialLinkProps) {
  const asset = variant === "compact" ? social.compactIcon : social.wordmarkIcon;
  const resolvedImageClassName =
    imageClassName ??
    (variant === "compact" ? "h-5 w-5 object-contain" : "h-6 w-auto max-w-[8rem] object-contain");
  const sharedClassName = `flex items-center justify-center ${className}`;
  const interactiveClassName =
    interaction === "lift"
      ? "transform-gpu will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1"
      : interaction === "fade"
        ? "transition-opacity hover:opacity-60"
        : "";
  const image = (
    <Image
      src={asset.src}
      alt=""
      width={asset.width}
      height={asset.height}
      className={resolvedImageClassName}
    />
  );

  if (social.href) {
    return (
      <a
        href={social.href}
        target="_blank"
        rel="noreferrer noopener"
        className={`${sharedClassName} ${interactiveClassName} focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white`}
        aria-label={social.label}
        aria-hidden={hiddenFromAssistiveTechnology || undefined}
        tabIndex={hiddenFromAssistiveTechnology ? -1 : undefined}
      >
        {image}
      </a>
    );
  }

  return (
    <span
      className={`${sharedClassName} cursor-not-allowed ${dimWhenUnavailable ? "opacity-40" : "opacity-100"} ${
        interaction === "lift" ? interactiveClassName : ""
      }`}
      aria-label={`${social.label} — coming soon`}
      aria-disabled="true"
      aria-hidden={hiddenFromAssistiveTechnology || undefined}
      title={`${social.label} — coming soon`}
    >
      {image}
    </span>
  );
}

export default function Header({ isIntroComplete }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const navigationRunRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const scrollAnchorYRef = useRef(0);
  const scrollDirectionRef = useRef<"up" | "down" | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const mobileMenuTransitionTimerRef = useRef<number | null>(null);
  const mobileMenuRevealFrameRef = useRef<number | null>(null);
  const mobileMenuFocusFrameRef = useRef<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isHeaderFocused, setIsHeaderFocused] = useState(false);
  const [isLyricsHeaderPinned, setIsLyricsHeaderPinned] = useState(false);
  const [mobileMenuView, setMobileMenuView] = useState<MobileMenuView>("main");
  const [isMobileMenuViewVisible, setIsMobileMenuViewVisible] = useState(true);
  const activeLyricProject =
    mobileMenuView === "silver-cracks" || mobileMenuView === "exercises"
      ? LYRIC_NAVIGATION.find(
          (release) => release.projectId === mobileMenuView
        ) ?? null
      : null;
  const mobileMenuItemCount =
    mobileMenuView === "main"
      ? MOBILE_MAIN_ITEM_COUNT
      : mobileMenuView === "lyrics"
        ? LYRIC_NAVIGATION.length + 2
        : (activeLyricProject?.songs.length ?? 0) + 2;
  const areMobileMenuItemsVisible =
    isMenuOpen && isMobileMenuViewVisible;

  const transitionMobileMenuView = (nextView: MobileMenuView) => {
    if (
      !isMenuOpen ||
      !isMobileMenuViewVisible ||
      nextView === mobileMenuView
    ) {
      return;
    }

    setIsMobileMenuViewVisible(false);
    mobileMenuTransitionTimerRef.current = window.setTimeout(() => {
      mobileMenuTransitionTimerRef.current = null;
      setMobileMenuView(nextView);

      mobileMenuRevealFrameRef.current = window.requestAnimationFrame(() => {
        mobileMenuRevealFrameRef.current = null;
        setIsMobileMenuViewVisible(true);

        mobileMenuFocusFrameRef.current = window.requestAnimationFrame(() => {
          mobileMenuFocusFrameRef.current = null;
          const firstMenuLink =
            menuPanelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
          firstMenuLink?.focus();
        });
      });
    }, getMobileMenuTransitionDuration(mobileMenuItemCount));
  };

  useEffect(() => {
    if (isMenuOpen) {
      return;
    }

    if (mobileMenuTransitionTimerRef.current !== null) {
      window.clearTimeout(mobileMenuTransitionTimerRef.current);
      mobileMenuTransitionTimerRef.current = null;
    }

    if (mobileMenuRevealFrameRef.current !== null) {
      window.cancelAnimationFrame(mobileMenuRevealFrameRef.current);
      mobileMenuRevealFrameRef.current = null;
    }

    if (mobileMenuFocusFrameRef.current !== null) {
      window.cancelAnimationFrame(mobileMenuFocusFrameRef.current);
      mobileMenuFocusFrameRef.current = null;
    }

  }, [isMenuOpen]);

  useEffect(
    () => () => {
      if (mobileMenuTransitionTimerRef.current !== null) {
        window.clearTimeout(mobileMenuTransitionTimerRef.current);
      }

      if (mobileMenuRevealFrameRef.current !== null) {
        window.cancelAnimationFrame(mobileMenuRevealFrameRef.current);
      }

      if (mobileMenuFocusFrameRef.current !== null) {
        window.cancelAnimationFrame(mobileMenuFocusFrameRef.current);
      }
    },
    []
  );

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    scrollAnchorYRef.current = window.scrollY;

    const updateHeaderVisibility = () => {
      scrollFrameRef.current = null;

      const currentScrollY = Math.max(0, window.scrollY);
      const previousScrollY = lastScrollYRef.current;
      const lyricsSection = document.getElementById("lyrics");
      const lyricsBounds = lyricsSection?.getBoundingClientRect();
      const lyricsTop = lyricsBounds ? lyricsBounds.top + currentScrollY : Infinity;
      const lyricsBottom = lyricsBounds ? lyricsTop + lyricsBounds.height : -Infinity;
      const isInsideLyrics =
        currentScrollY >= lyricsTop - HEADER_TOP_THRESHOLD &&
        currentScrollY < lyricsBottom - HEADER_TOP_THRESHOLD;

      setIsLyricsHeaderPinned(isInsideLyrics);

      if (isInsideLyrics) {
        setIsHeaderVisible(true);
        scrollDirectionRef.current = null;
        scrollAnchorYRef.current = currentScrollY;
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (currentScrollY <= HEADER_TOP_THRESHOLD) {
        setIsHeaderVisible(true);
        scrollDirectionRef.current = null;
        scrollAnchorYRef.current = currentScrollY;
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (currentScrollY === previousScrollY) {
        return;
      }

      const direction = currentScrollY > previousScrollY ? "down" : "up";

      if (direction !== scrollDirectionRef.current) {
        scrollDirectionRef.current = direction;
        scrollAnchorYRef.current = previousScrollY;
      }

      if (Math.abs(currentScrollY - scrollAnchorYRef.current) >= HEADER_DIRECTION_THRESHOLD) {
        setIsHeaderVisible(direction === "up");
        scrollAnchorYRef.current = currentScrollY;
      }

      lastScrollYRef.current = currentScrollY;
    };

    const handleScroll = () => {
      if (scrollFrameRef.current === null) {
        scrollFrameRef.current = window.requestAnimationFrame(updateHeaderVisibility);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const desktopMedia = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const closeMobileMenu = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsMenuOpen(false);
      }
    };

    desktopMedia.addEventListener("change", closeMobileMenu);
    return () => desktopMedia.removeEventListener("change", closeMobileMenu);
  }, []);

  const navigateToTarget = (id: string) => {
    const target = getPageSectionScrollTarget(id);

    if (!target) {
      return;
    }

    const run = ++navigationRunRef.current;
    let stableFrames = 0;

    setIsNavigating(true);
    window.history.pushState(null, "", `#${id}`);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: target.top, behavior: "smooth" });

        const watchScroll = () => {
          if (navigationRunRef.current !== run) {
            return;
          }

          const isAtTarget = Math.abs(window.scrollY - target.top) <= 2;
          stableFrames = isAtTarget ? stableFrames + 1 : 0;

          if (stableFrames >= 3) {
            window.setTimeout(() => {
              if (navigationRunRef.current === run) {
                setIsNavigating(false);
              }
            }, target.settleMs);
            return;
          }

          window.requestAnimationFrame(watchScroll);
        };

        window.requestAnimationFrame(watchScroll);
      });
    });
  };

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: SectionId | "top"
  ) => {
    event.preventDefault();

    if (isMenuOpen) {
      setIsMenuOpen(false);
    }

    navigateToTarget(id);
  };

  const handleLyricNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    event.preventDefault();
    setIsMenuOpen(false);
    navigateToTarget(id);
  };

  useEffect(
    () => () => {
      navigationRunRef.current += 1;
    },
    []
  );

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const menuPanel = menuPanelRef.current;
    const header = headerRef.current;
    const body = document.body;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousBodyOverflow = body.style.overflow;
    const siblingStates = Array.from(header?.parentElement?.children ?? [])
      .filter((element): element is HTMLElement =>
        element instanceof HTMLElement && element !== header && element !== menuPanel
      )
      .map((element) => ({
        element,
        inert: element.inert,
        ariaHidden: element.getAttribute("aria-hidden")
      }));

    body.style.setProperty("overflow", "hidden");
    siblingStates.forEach(({ element }) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });

    const focusFrame = window.requestAnimationFrame(() => {
      const firstMenuLink = menuPanel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      firstMenuLink?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMenuOpen(false);
        return;
      }

      if (event.key !== "Tab" || !menuPanel || !menuButtonRef.current) {
        return;
      }

      const menuFocusables = Array.from(menuPanel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      const focusables = [menuButtonRef.current, ...menuFocusables];
      const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);

      if (event.shiftKey && currentIndex <= 0) {
        event.preventDefault();
        focusables[focusables.length - 1]?.focus();
      } else if (!event.shiftKey && currentIndex === focusables.length - 1) {
        event.preventDefault();
        focusables[0]?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      if (previousBodyOverflow) {
        body.style.setProperty("overflow", previousBodyOverflow);
      } else {
        body.style.removeProperty("overflow");
      }
      siblingStates.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;

        if (ariaHidden === null) {
          element.removeAttribute("aria-hidden");
        } else {
          element.setAttribute("aria-hidden", ariaHidden);
        }
      });

      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [isMenuOpen]);

  return (
    <>
      <header
        ref={headerRef}
        data-site-header
        data-lyrics-pinned={isLyricsHeaderPinned || undefined}
        className={`site-header fixed inset-x-0 top-0 z-50 h-16 transform-gpu bg-black text-white shadow-[0_1px_0_rgba(248,248,245,1)] transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] will-change-transform md:h-20 ${
          isIntroComplete
            ? isHeaderVisible ||
              isMenuOpen ||
              isHeaderFocused ||
              isLyricsHeaderPinned
              ? "translate-y-0"
              : "pointer-events-none -translate-y-[115%]"
            : "site-header-intro pointer-events-none"
        }`}
        onFocusCapture={() => setIsHeaderFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsHeaderFocused(false);
          }
        }}
      >
        <div className="mx-auto grid h-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8">
          <div className="flex min-w-0 items-center justify-start">
            <button
              ref={menuButtonRef}
              type="button"
              className="relative -ml-2 flex h-10 w-10 cursor-pointer items-center justify-center text-white focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:hidden"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-controls={MOBILE_MENU_ID}
              aria-expanded={isMenuOpen}
              data-menu-open={isMenuOpen}
              onClick={() => {
                if (isMenuOpen) {
                  setIsMenuOpen(false);
                  return;
                }

                setMobileMenuView("main");
                setIsMobileMenuViewVisible(true);
                setIsMenuOpen(true);
              }}
            >
              <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
              <span
                aria-hidden="true"
                className="mobile-menu-line mobile-menu-line-top pointer-events-none absolute left-1/2 h-0.5 w-6 rounded-full bg-current"
              />
              <span
                aria-hidden="true"
                className="mobile-menu-line mobile-menu-line-cross-a pointer-events-none absolute left-1/2 h-0.5 w-6 rounded-full bg-current"
              />
              <span
                aria-hidden="true"
                className="mobile-menu-line mobile-menu-line-cross-b pointer-events-none absolute left-1/2 h-0.5 w-6 rounded-full bg-current"
              />
              <span
                aria-hidden="true"
                className="mobile-menu-line mobile-menu-line-bottom pointer-events-none absolute left-1/2 h-0.5 w-6 rounded-full bg-current"
              />
            </button>

            <nav
              className="hidden min-w-0 items-center gap-4 text-base font-semibold uppercase sm:flex md:gap-6 md:text-lg"
              aria-label="Section navigation"
            >
              {SECTION_LINKS.map((link) => (
                <a
                  key={link.id}
                  className="relative py-1 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white focus-visible:after:scale-x-100"
                  href={link.href}
                  onClick={(event) => handleNavClick(event, link.id)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <a
            href="#top"
            className="font-display text-3xl leading-none focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:text-4xl"
            aria-label="KH home"
            aria-hidden={isMenuOpen || undefined}
            tabIndex={isMenuOpen ? -1 : undefined}
            onClick={(event) => handleNavClick(event, "top")}
          >
            KH
          </a>

          <div className="flex min-w-0 items-center justify-end">
            <div className="sm:hidden">
              <SocialDestination
                social={INSTAGRAM_LINK}
                variant="compact"
                className="h-11 w-11"
                imageClassName="h-7 w-7 object-contain"
                interaction="none"
                hiddenFromAssistiveTechnology={isMenuOpen}
              />
            </div>

            <nav className="hidden items-center gap-3 sm:flex md:gap-5" aria-label="Social links">
              {SOCIAL_LINKS.map((social) => (
                <SocialDestination
                  key={social.id}
                  social={social}
                  variant="compact"
                  className="h-10 w-10 md:h-11 md:w-11"
                  imageClassName="h-7 w-7 object-contain md:h-8 md:w-8"
                  interaction="lift"
                />
              ))}
            </nav>
          </div>
        </div>
      </header>

      <div
        id={MOBILE_MENU_ID}
        ref={menuPanelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!isMenuOpen}
        className={`fixed inset-0 z-40 flex items-center justify-center px-6 pb-8 pt-20 transition-[opacity,visibility,background-color,backdrop-filter] ease-[cubic-bezier(0.16,1,0.3,1)] sm:hidden ${
          isMenuOpen
            ? "visible pointer-events-auto bg-black/70 opacity-100 backdrop-blur-xl"
            : "invisible pointer-events-none bg-black/0 opacity-0 backdrop-blur-none"
        }`}
        // Opening keeps its own fixed duration; closing is computed above so
        // the un-blur finishes in sync with the last staggered link.
        style={{
          transitionDuration: isMenuOpen
            ? "650ms"
            : `${getMobileMenuTransitionDuration(mobileMenuItemCount)}ms`
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setIsMenuOpen(false);
          }
        }}
      >
        <nav
          className="flex max-h-full w-full max-w-sm flex-col items-center justify-[safe_center] gap-5 overflow-y-auto py-6"
          aria-label={
            mobileMenuView === "main"
              ? "Mobile navigation"
              : activeLyricProject
                ? `${activeLyricProject.label} lyrics navigation`
                : "Lyrics navigation"
          }
          aria-busy={!isMobileMenuViewVisible}
          inert={!areMobileMenuItemsVisible}
        >
          {mobileMenuView === "main" ? (
            <>
              {SECTION_LINKS.map((link, index) => (
                <MobileMenuItem
                  key={link.id}
                  index={index}
                  isVisible={areMobileMenuItemsVisible}
                >
                  <a
                    className="font-display text-2xl uppercase leading-none focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    href={link.href}
                    onClick={(event) => {
                      if (link.id === "lyrics") {
                        event.preventDefault();
                        transitionMobileMenuView("lyrics");
                        return;
                      }

                      handleNavClick(event, link.id);
                    }}
                  >
                    {link.label}
                  </a>
                </MobileMenuItem>
              ))}

              {SOCIAL_LINKS.map((social, index) => (
                <MobileMenuItem
                  key={social.id}
                  index={SECTION_LINKS.length + index}
                  isVisible={areMobileMenuItemsVisible}
                >
                  <SocialDestination
                    social={social}
                    variant="wordmark"
                    className="min-h-9 min-w-36"
                    interaction="none"
                    dimWhenUnavailable={false}
                    imageClassName={
                      social.id === "apple-music"
                        ? "h-6 w-auto max-w-[8rem] object-contain brightness-0 invert"
                        : social.id === "spotify"
                          ? "h-8 w-auto max-w-[10rem] object-contain"
                          : social.id === "instagram"
                            ? "h-7 w-auto max-w-[9rem] object-contain"
                            : "h-6 w-auto max-w-[8rem] object-contain"
                    }
                  />
                </MobileMenuItem>
              ))}
            </>
          ) : mobileMenuView === "lyrics" ? (
            <>
              <MobileMenuItem index={0} isVisible={areMobileMenuItemsVisible}>
                <a
                  className="font-display text-2xl leading-none focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  href="#lyrics"
                  onClick={(event) => handleLyricNavClick(event, "lyrics")}
                >
                  Top
                </a>
              </MobileMenuItem>

              {LYRIC_NAVIGATION.map((release, index) => (
                <MobileMenuItem
                  key={release.projectId}
                  index={index + 1}
                  isVisible={areMobileMenuItemsVisible}
                >
                  <a
                    className="font-display text-2xl leading-none focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    href={release.href}
                    onClick={(event) => {
                      if (
                        release.projectId === "silver-cracks" ||
                        release.projectId === "exercises"
                      ) {
                        event.preventDefault();
                        transitionMobileMenuView(release.projectId);
                        return;
                      }

                      handleLyricNavClick(event, release.id);
                    }}
                  >
                    {release.label}
                  </a>
                </MobileMenuItem>
              ))}

              <MobileMenuItem
                index={LYRIC_NAVIGATION.length + 1}
                isVisible={areMobileMenuItemsVisible}
              >
                <button
                  type="button"
                  className="cursor-pointer font-display text-2xl leading-none focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  onClick={() => transitionMobileMenuView("main")}
                >
                  &lt; Back
                </button>
              </MobileMenuItem>
            </>
          ) : activeLyricProject ? (
            <>
              <MobileMenuItem index={0} isVisible={areMobileMenuItemsVisible}>
                <a
                  className="font-display text-2xl leading-none focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  href="#lyrics"
                  onClick={(event) => handleLyricNavClick(event, "lyrics")}
                >
                  Top
                </a>
              </MobileMenuItem>

              {activeLyricProject.songs.map((song, index) => (
                <MobileMenuItem
                  key={song.id}
                  index={index + 1}
                  isVisible={areMobileMenuItemsVisible}
                >
                  <a
                    className="font-display text-2xl leading-none focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    href={song.href}
                    onClick={(event) => handleLyricNavClick(event, song.id)}
                  >
                    {song.label}
                  </a>
                </MobileMenuItem>
              ))}

              <MobileMenuItem
                index={activeLyricProject.songs.length + 1}
                isVisible={areMobileMenuItemsVisible}
              >
                <button
                  type="button"
                  className="cursor-pointer font-display text-2xl leading-none focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  onClick={() => transitionMobileMenuView("lyrics")}
                >
                  &lt; Back
                </button>
              </MobileMenuItem>
            </>
          ) : null}
        </nav>
      </div>

      <div
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/70 transition-[opacity,visibility,backdrop-filter] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isNavigating
            ? "visible pointer-events-auto opacity-100 backdrop-blur-xl duration-500"
            : "invisible pointer-events-none opacity-0 backdrop-blur-none duration-250"
        }`}
      />
    </>
  );
}
