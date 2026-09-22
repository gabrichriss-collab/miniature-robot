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
          Mobil og nettbrett (<lg): Prisestimat venstre, ordmerke midt,
          menymerke hoeyre. Desktop (lg+): flex-rad — ordmerke venstre,
          nav hoeyre, noeyaktig som foer.

          Ordmerket er ABSOLUTT sentrert paa mobil og nettbrett, ikke
          plassert i en rutenettkolonne. Grunnen: Prisestimat-knappen er
          131,7 px og menymerket 60 px. Med [1fr auto 1fr] kan ikke
          1fr-kolonnene bli like naar den ene sidens innhold er bredere
          enn kolonnens andel — maalt skjoev det ordmerket 12,3 px ut av
          midten paa 375 px. Absolutt sentrering er uavhengig av hvor
          brede kontrollene er, og gir 0 px avvik paa alle bredder.

          Paa lg gaar ordmerket tilbake i flyten, og justify-between gir
          ordmerke venstre / nav hoeyre noeyaktig som foer.
        */}
        <div className="relative mx-auto flex h-16 max-w-[var(--page-max)] items-center justify-between px-6 lg:h-24 lg:px-10">
          {/* Prisestimat — VENSTRE kolonne paa mobil og nettbrett.

              Stylingen er GJENOPPRETTET noeyaktig slik den var i 77fbe8c,
              foer headerarbeidet: heldekkende flate, px-4 py-3, 0,6rem
              versaler, press, og invertering over hero-en. Ingenting av
              utseendet er endret.

              Understreken kom IKKE fra selektorlekkasje. Den var en
              bevisst endring jeg gjorde i #54, der jeg byttet den
              heldekkende flaten mot en hairline fordi briefen da ba om
              at knappen ikke skulle veie tyngre enn ordmerket. Den
              avveiningen er naa omgjort. */}
          <Link
            href="/prisestimat"
            className={`shrink-0 whitespace-nowrap px-4 py-3 text-[0.6rem] uppercase tracking-[0.14em] press transition-colors duration-500 ease-swoop lg:hidden ${
              overDark ? "bg-bone text-ink" : "bg-ink text-bone"
            }`}
            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
          >
            {/* "Faa " vises foerst fra 400 px. Den gjenopprettede knappen er
                131,7 px med det ordet, og et SANT sentrert ordmerke starter
                paa w/2 - 32,15 px. Under ca. 400 px moeter de hverandre:
                maalt -0,3 px paa 375 og -7,8 px paa 360, altsaa faktisk
                overlapp. Terskelen var 360 px fra foer — dette er samme
                mekanisme flyttet, ikke ny styling. */}
              <span className="hidden min-[400px]:inline">Få </span>Prisestimat
          </Link>

          {/* Ordmerke — MIDTKOLONNEN. Skriftgraden er tatt ned fra
              1,6rem til 1,15rem paa mobil (1,25rem fra sm) saa merket
              leser som en signatur og ikke som headerens tyngste
              element. Desktop beholder 2,25rem uroert. */}
          <Link
            href="/"
            aria-label="Tømrer Kawiche — Hjem"
            className={`headline absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col text-center leading-[0.86] tracking-tight transition-colors duration-500 ease-swoop lg:static lg:translate-x-0 lg:translate-y-0 lg:text-left ${textColor}`}
          >
            <span className="text-[1.15rem] sm:text-[1.25rem] lg:text-[2.25rem]">
              Tømrer
            </span>
            <span className="text-[1.15rem] sm:text-[1.25rem] lg:text-[2.25rem]">
              Kawiche
            </span>
          </Link>

          {/* Menymerke — HOEYRE kolonne paa mobil og nettbrett.
              Knappen har ingen egen stoerrelse; den arver 60x44 px fra
              merket, som er hele trykkfeltet. Ingen ramme, ingen flate,
              ingen sirkel — knappen ER streken. */}
          <button
            aria-label={open ? "Lukk meny" : "Åpne meny"}
            aria-expanded={open}
            aria-controls="hovedmeny"
            onClick={() => setOpen((v) => !v)}
            className={`relative z-50 flex shrink-0 items-center transition-colors duration-500 ease-swoop lg:hidden ${textColor}`}
          >
            <MenuMark open={open} />
          </button>

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
