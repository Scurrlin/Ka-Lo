"use client";

import { useRef } from "react";

export default function Header() {
  const headerRef = useRef<HTMLHeadElement>(null);

  const handleNavClick = (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const target = document.getElementById(id);
    const headerHeight = headerRef.current?.offsetHeight ?? 0;

    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.history.pushState(null, "", `#${id}`);
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <header
      ref={headerRef}
      data-site-header
      className="site-header fixed inset-x-0 top-0 z-50 h-16 bg-black text-white shadow-[0_1px_0_rgba(248,248,245,1)] md:h-20"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <a
          href="#top"
          className="font-display text-2xl leading-none md:text-3xl"
          aria-label="KALO home"
          onClick={handleNavClick("top")}
        >
          KΛLO
        </a>
        <nav className="hidden items-center gap-6 text-sm font-semibold uppercase sm:flex">
          <a className="transition hover:text-white/60" href="#about" onClick={handleNavClick("about")}>
            ΛBOUT
          </a>
          <a className="transition hover:text-white/60" href="#team" onClick={handleNavClick("team")}>
            TEΛM
          </a>
          <a className="transition hover:text-white/60" href="#solus" onClick={handleNavClick("solus")}>
            MUSIC
          </a>
        </nav>
      </div>
    </header>
  );
}
