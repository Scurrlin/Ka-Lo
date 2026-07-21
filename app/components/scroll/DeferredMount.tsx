"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode
} from "react";

type DeferredMountProps = {
  children: ReactNode;
  /** Keep section anchors resolvable before the real section mounts. */
  id?: string;
  /** How far before the placeholder enters the viewport to mount children. */
  rootMargin?: string;
  /** Idle fallback so below-fold sections warm before a slow scroll. */
  idleTimeoutMs?: number;
  /** Force children to mount immediately (e.g. after hero intro finishes). */
  forceMount?: boolean;
  className?: string;
  style?: CSSProperties;
  minHeight?: string;
};

/**
 * Delays mounting heavy section trees until near the viewport (or idle),
 * so their JS chunks and DOM work stay off the critical first paint path.
 *
 * Always keeps a minHeight shell so swapping in children does not jump
 * document height mid-scroll (which kills momentum on Safari and Lenis).
 */
export default function DeferredMount({
  children,
  id,
  rootMargin = "120% 0px",
  idleTimeoutMs = 2500,
  forceMount = false,
  className,
  style,
  minHeight
}: DeferredMountProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(forceMount);

  useEffect(() => {
    if (forceMount) {
      setShouldMount(true);
    }
  }, [forceMount]);

  useEffect(() => {
    if (shouldMount) {
      return;
    }

    const shell = shellRef.current;

    if (!shell) {
      return;
    }

    let idleId: number | null = null;
    let timeoutId: number | null = null;
    let mounted = false;

    const mount = () => {
      if (mounted) {
        return;
      }

      mounted = true;
      setShouldMount(true);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          mount();
        }
      },
      { rootMargin }
    );

    observer.observe(shell);

    const requestIdle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback.bind(window)
        : null;
    const cancelIdle =
      typeof window.cancelIdleCallback === "function"
        ? window.cancelIdleCallback.bind(window)
        : null;

    if (requestIdle) {
      idleId = requestIdle(mount, { timeout: idleTimeoutMs });
    } else {
      timeoutId = window.setTimeout(mount, Math.min(idleTimeoutMs, 400));
    }

    return () => {
      observer.disconnect();

      if (idleId !== null && cancelIdle) {
        cancelIdle(idleId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [idleTimeoutMs, rootMargin, shouldMount]);

  return (
    <div
      ref={shellRef}
      // Live section owns the id once mounted; shell keeps it for anchors before then.
      id={shouldMount ? undefined : id}
      className={className}
      // Drop the floor after mount so content defines height (mount is warmed at rest).
      style={{ minHeight: shouldMount ? undefined : minHeight, ...style }}
      {...(!shouldMount ? { "aria-hidden": true } : {})}
    >
      {shouldMount ? children : null}
    </div>
  );
}
