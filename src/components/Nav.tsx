"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import HamburgerOverlay from "./HamburgerOverlay";

/**
 * Pages whose top section is a dark hero. On these, the nav starts with
 * light (bone) contents over the hero and flips to dark (ink) once the
 * user scrolls onto the cream page body. Everywhere else, the nav is
 * always dark since the page background is bone from the top.
 */
const DARK_HERO_ROUTES = new Set<string>(["/"]);

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const hasDarkHero = DARK_HERO_ROUTES.has(pathname ?? "/");
  // The header sits over a dark surface whenever:
  //  - we're on a route with a dark hero and haven't scrolled past it, OR
  //  - the fullscreen overlay is open (dark ink background).
  const overDark = (hasDarkHero && !scrolled) || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const barColor = overDark ? "bg-bone" : "bg-ink";
  const textColor = overDark ? "text-bone" : "text-ink";
  const linkColor = overDark
    ? "text-bone/80 hover:text-bone"
    : "text-ink/80 hover:text-ink";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ease-swoop ${
          scrolled && !open ? "bg-bone/85 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-[var(--page-max)] items-center justify-between px-6 md:px-10">
          <Link
            href="/"
            className={`eyebrow tracking-widest2 transition-colors duration-500 ease-swoop ${textColor}`}
            aria-label="TØMRER KAWICHE — Hjem"
          >
            TØMRER&nbsp;KAWICHE
          </Link>

          <nav className="hidden gap-10 md:flex">
            {[
              ["Tjenester", "/tjenester"],
              ["Prosjekter", "/prosjekter"],
              ["Om oss", "/om-oss"],
              ["Bærekraft", "/baerekraft"],
              ["Kontakt", "/kontakt"]
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={`eyebrow uline transition-colors duration-500 ease-swoop ${linkColor}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <button
            aria-label={open ? "Lukk meny" : "Åpne meny"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[6px]"
          >
            <span
              className={`block h-px w-7 transition-[transform,background-color] duration-500 ease-swoop ${barColor} ${
                open ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-7 transition-[transform,background-color] duration-500 ease-swoop ${barColor} ${
                open ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      <HamburgerOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
