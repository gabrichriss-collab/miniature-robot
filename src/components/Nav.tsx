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
        className={`fixed inset-x-0 top-8 z-40 border-b transition-colors duration-500 ease-swoop ${
          scrolled && !open ? "bg-bone/85 backdrop-blur-md" : "bg-transparent"
        } ${overDark ? "border-transparent" : "border-ink/15"}`}
      >
        {/*
          Mobile (<lg): three-column grid — hamburger left, wordmark
          centred, "Få prisestimat" CTA right (Connaught-style).
          Desktop (lg+): flex row — wordmark left, inline nav right.
          Hidden children are display:none so they drop out of the grid
          entirely rather than wrapping to a second row.
        */}
        <div className="mx-auto grid h-24 max-w-[var(--page-max)] grid-cols-[auto_1fr_auto] items-center gap-2 px-6 sm:gap-4 lg:flex lg:justify-between lg:gap-0 lg:px-10">
          {/* Hamburger — mobile + tablet only, left column */}
          <button
            aria-label={open ? "Lukk meny" : "Åpne meny"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-[6px] lg:hidden"
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

          {/* Stacked serif wordmark (Kononenko-style) — centred on mobile */}
          <Link
            href="/"
            aria-label="Tømrer Kawiche — Hjem"
            className={`headline flex flex-col justify-self-center text-center leading-[0.86] tracking-tight transition-colors duration-500 ease-swoop lg:justify-self-start lg:text-left ${textColor}`}
          >
            <span className="text-[1.6rem] md:text-[2.25rem]">Tømrer</span>
            <span className="text-[1.6rem] md:text-[2.25rem]">Kawiche</span>
          </Link>

          {/* Mobile CTA — solid button, right column. Inverts over the dark hero. */}
          <Link
            href="/prisestimat"
            className={`shrink-0 whitespace-nowrap px-4 py-3 text-[0.6rem] uppercase tracking-[0.14em] press transition-colors duration-500 ease-swoop lg:hidden ${
              overDark ? "bg-bone text-ink" : "bg-ink text-bone"
            }`}
            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
          >
            <span className="hidden min-[360px]:inline">Få </span>Prisestimat
          </Link>

          {/* Desktop inline nav (lg and up) */}
          <nav className="hidden items-center gap-10 lg:flex">
            {[
              ["Tjenester", "/tjenester"],
              ["Prosjekter", "/prosjekter"],
              ["Prisestimat", "/prisestimat"],
              ["Om oss", "/om-oss"],
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
            <Link
              href="/kontakt?type=tilbud"
              className={`group inline-flex items-center gap-3 border px-5 py-3 eyebrow press transition-colors duration-500 ease-swoop ${
                overDark
                  ? "border-bone text-bone hover:bg-bone hover:text-ink"
                  : "border-ink text-ink hover:bg-ink hover:text-bone"
              }`}
            >
              Be om tilbud
              <span
                aria-hidden
                className="transition-transform duration-500 ease-swoop group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </nav>
        </div>
      </header>

      <HamburgerOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
