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
        className={`fixed inset-x-0 top-8 z-40 transition-colors duration-500 ease-swoop ${
          scrolled && !open ? "bg-bone/85 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-24 max-w-[var(--page-max)] items-center justify-between px-6 md:px-10">
          {/* Stacked serif wordmark (Kononenko-style) */}
          <Link
            href="/"
            aria-label="Tømrer Kawiche — Hjem"
            className={`headline flex flex-col leading-[0.86] tracking-tight transition-colors duration-500 ease-swoop ${textColor}`}
          >
            <span className="text-[1.75rem] md:text-[2.25rem]">Tømrer</span>
            <span className="text-[1.75rem] md:text-[2.25rem]">Kawiche</span>
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

          {/* Mobile + tablet hamburger (hidden on desktop) */}
          <button
            aria-label={open ? "Lukk meny" : "Åpne meny"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[6px] lg:hidden"
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
