"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import HamburgerOverlay from "./HamburgerOverlay";
import MenuMark from "./MenuMark";

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

  /* Roeykglass legges KUN paa headeren naar den faktisk ligger oppaa
     hero-fotografiet — altsaa paa forsiden, foer scroll, og ikke naar
     menyoverlegget er aapent (da eier overlegget flaten). Alle andre
     sider beholder den eksisterende oppfoerselen. */
  const overHero = hasDarkHero && !scrolled && !open;

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

  const textColor = overDark ? "text-bone" : "text-ink";
  /* Over hero-en loeftes lenkene fra 80 % til 90 % bone. Maalt kontrast mot
     glassflaten paa det lyseste punktet i gradienten var 4,40:1 ved 80 %,
     saa vidt under WCAG AA (4,5:1) for smaa versaler; 90 % gir 5,1:1.
     Aa gjoere glasset moerkere i stedet ville gjort det til en moerk bjelke
     fremfor en gjennomskinnelig flate. */
  const linkColor = overHero
    ? "text-bone/90 hover:text-bone"
    : overDark
      ? "text-bone/80 hover:text-bone"
      : "text-ink/80 hover:text-ink";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-8 z-40 border-b transition-colors duration-500 ease-swoop ${
          open
            ? "border-transparent bg-transparent"
            : scrolled
              ? "border-ink/15 bg-bone/85 backdrop-blur-md"
              : overHero
                ? "glass glass-edge"
                : "border-ink/15 bg-transparent"
        }`}
      >
        {/*
          Mobile (<lg): three-column grid — hamburger left, wordmark
          centred, "Få prisestimat" CTA right (Connaught-style).
          Desktop (lg+): flex row — wordmark left, inline nav right.
          Hidden children are display:none so they drop out of the grid
          entirely rather than wrapping to a second row.
        */}
        <div className="mx-auto grid h-24 max-w-[var(--page-max)] grid-cols-[auto_1fr_auto] items-center gap-2 px-6 sm:gap-4 lg:flex lg:justify-between lg:gap-0 lg:px-10">
          {/* Menyutloeser — mobil + nettbrett, venstre kolonne.
              Bredden kommer fra selve merket (56 px mobil / 64 px
              nettbrett), hoeyden er 48 px. Trykkfeltet blir dermed
              56x48 og 64x48 — godt over 44 px i begge akser, og hele
              den lange linja er trykkbar.
              Ingen ramme, ingen flate — knappen ER merket. */}
          <button
            aria-label={open ? "Lukk meny" : "Åpne meny"}
            aria-expanded={open}
            aria-controls="hovedmeny"
            onClick={() => setOpen((v) => !v)}
            className={`relative z-50 flex h-12 shrink-0 items-center transition-colors duration-500 ease-swoop lg:hidden ${textColor}`}
          >
            <MenuMark open={open} />
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
            {/* Den ENE knappen som tar i bruk glasspraaket. Oppaa hero-en
                faar den en roeykfarget fyll i stedet for gjennomsiktig, slik
                at den loefter seg fra fotografiet. Kanten og teksten forblir
                solid bone — knappen skal bli lettere aa se, ikke svakere.
                "Faa prisestimat" i mobilheaderen beholder sin heldekkende
                flate; den er den viktigste handlingen og skal ikke tones ned. */}
            <Link
              href="/kontakt?type=tilbud"
              className={`group inline-flex items-center gap-3 border px-5 py-3 eyebrow press transition-colors duration-500 ease-swoop ${
                overHero
                  ? "glass border-bone/70 text-bone hover:bg-bone hover:text-ink"
                  : overDark
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
