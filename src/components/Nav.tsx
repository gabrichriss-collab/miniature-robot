"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HamburgerOverlay from "./HamburgerOverlay";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ease-swoop ${
          scrolled || open
            ? "bg-bone/85 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-[var(--page-max)] items-center justify-between px-6 md:px-10">
          <Link
            href="/"
            className="eyebrow tracking-widest2 text-ink"
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
                className="eyebrow uline text-ink/80 hover:text-ink"
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
              className={`block h-px w-7 bg-ink transition-transform duration-500 ease-swoop ${
                open ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-7 bg-ink transition-transform duration-500 ease-swoop ${
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
