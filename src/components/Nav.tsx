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

          Kolonnene er [1fr auto 1fr], IKKE [auto 1fr auto]. Med den
          gamle oppskriften fikk ordmerket midtstilling inne i
          midtkolonnen, men midtkolonnen selv ble skjoevet av at
          sidekontrollene har ulik bredde — maalt laa ordmerket 37,9 px
          til venstre for skjermmidten. To like 1fr-kolonner gir en
          auto-kolonne som faktisk staar midt i viewporten, uansett hvor
          brede kontrollene paa sidene er.

          Skjulte barn er display:none og faller helt ut av rutenettet,
          saa desktop-navet tar ingen celle paa mobil.
        */}
        <div className="mx-auto grid h-16 max-w-[var(--page-max)] grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 lg:flex lg:h-24 lg:justify-between lg:gap-0 lg:px-10">
          {/* Prisestimat — VENSTRE kolonne paa mobil og nettbrett.

              Den heldekkende flaten er tatt bort. Maalt var brikken
              113x30 px solid bone mot et ordmerke paa 64x35 px fin
              antikva — den veide tydelig tyngst i komposisjonen, stikk i
              strid med at ordmerket skal vaere ankeret.

              Naa samme tynne streksprak som slideren, menymerket og
              bunnteksten: liten versal-etikett med en hairline under.
              Fargen arves av headeren, saa den snur med bakgrunnen.

              ::after legger et usynlig 44 px trykkfelt oppaa uten aa
              paavirke oppsettet. */}
          <Link
            href="/prisestimat"
            className={`group relative shrink-0 justify-self-start whitespace-nowrap text-[0.58rem] uppercase tracking-[0.12em] transition-colors duration-500 ease-swoop after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-[''] lg:hidden ${textColor}`}
            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
          >
            <span
              className={`border-b pb-0.5 transition-colors duration-500 ease-swoop ${
                overDark
                  ? "border-bone/45 group-hover:border-bone"
                  : "border-ink/35 group-hover:border-ink"
              }`}
            >
              <span className="hidden min-[360px]:inline">Få </span>Prisestimat
            </span>
          </Link>

          {/* Ordmerke — MIDTKOLONNEN. Skriftgraden er tatt ned fra
              1,6rem til 1,15rem paa mobil (1,25rem fra sm) saa merket
              leser som en signatur og ikke som headerens tyngste
              element. Desktop beholder 2,25rem uroert. */}
          <Link
            href="/"
            aria-label="Tømrer Kawiche — Hjem"
            className={`headline flex flex-col justify-self-center text-center leading-[0.86] tracking-tight transition-colors duration-500 ease-swoop lg:justify-self-start lg:text-left ${textColor}`}
          >
            <span className="text-[1.15rem] sm:text-[1.25rem] lg:text-[2.25rem]">
              Tømrer
            </span>
            <span className="text-[1.15rem] sm:text-[1.25rem] lg:text-[2.25rem]">
              Kawiche
            </span>
          </Link>

          {/* Menymerke — HOEYRE kolonne paa mobil og nettbrett.
              Bredden kommer fra selve merket (56 px mobil / 64 px
              nettbrett), hoeyden er 48 px inne i en 64 px header.
              Trykkfeltet er 56x48 og 64x48 — over 44 px i begge akser,
              og hele den lange linja er trykkbar.
              Ingen ramme, ingen flate — knappen ER merket. */}
          <button
            aria-label={open ? "Lukk meny" : "Åpne meny"}
            aria-expanded={open}
            aria-controls="hovedmeny"
            onClick={() => setOpen((v) => !v)}
            className={`relative z-50 flex h-12 shrink-0 items-center justify-self-end transition-colors duration-500 ease-swoop lg:hidden ${textColor}`}
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
