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
  className?: string;
  style?: CSSProperties;
  minHeight?: string;
};

/**
 * Delays mounting heavy section trees until near the viewport (or idle),
 * so their JS chunks and DOM work stay off the critical first paint path.
 */
export default function DeferredMount({
  children,
  id,
  rootMargin = "120% 0px",
  idleTimeoutMs = 2500,
  className,
  style,
  minHeight
}: DeferredMountProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (shouldMount) {
      return;
    }

    const placeholder = placeholderRef.current;

    if (!placeholder) {
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

    observer.observe(placeholder);

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

  if (shouldMount) {
    return <>{children}</>;
  }

  return (
    <div
      ref={placeholderRef}
      id={id}
      className={className}
      style={{ minHeight, ...style }}
      aria-hidden="true"
    />
  );
}
