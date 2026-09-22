/**
 * Menymerke for mobil og nettbrett.
 *
 * LUKKET:  ────────────    én lang, tynn vannrett strek
 * AAPEN:   ✕ (avlangt)     samme strek krysset av den andre
 *
 * Merket er bygget av TO like lange streker som ligger noeyaktig oppaa
 * hverandre naar menyen er lukket. To identiske 1,25 px streker i samme
 * farge tegner seg som én strek, saa hviletilstanden er den rene linja
 * fra referansen — ingen hamburger, ingen permanent plusstegn.
 *
 * Naar menyen aapnes roterer de fra hverandre, +45 og -45 grader om sitt
 * felles midtpunkt. Krysset som oppstaar beholder hele linjelengden og
 * blir dermed avlangt og arkitektonisk, ikke et lite generisk ikon.
 *
 * Det er ingen utskifting av ikoner. Det er de samme to elementene hele
 * veien, og bevegelsen reverseres noeyaktig ved lukking.
 *
 * Merk: dette er en full omskriving, ikke et lag oppaa den forrige
 * loesningen. Den gamle brukte én vannrett strek pluss en kort loddrett
 * som skalerte i hoeyde; den geometrien og dens klasser finnes ikke
 * lenger. Ingen pseudoelementer, ingen media-query-overstyringer —
 * merket har én stoerrelse paa alle sammenslaatte bredder.
 */
const DURATION_MS = 800;

export default function MenuMark({ open }: { open: boolean }) {
  // Felles for begge strekene. -translate-y-1/2 sentrerer dem loddrett;
  // rotasjonen skjer om deres eget midtpunkt, som dermed ligger i midten
  // av trykkfeltet.
  const stroke =
    "absolute left-0 top-1/2 block w-full -translate-y-1/2 bg-current transition-transform ease-menu motion-reduce:transition-none motion-reduce:duration-0";

  return (
    // 60 x 44 px: synlig strek 60 px, og hele boksen er trykkfelt.
    <span className="relative block h-11 w-[60px]">
      <span
        aria-hidden
        className={`${stroke} ${open ? "rotate-45" : "rotate-0"}`}
        style={{ height: "1.25px", transitionDuration: `${DURATION_MS}ms` }}
      />
      <span
        aria-hidden
        className={`${stroke} ${open ? "-rotate-45" : "rotate-0"}`}
        style={{ height: "1.25px", transitionDuration: `${DURATION_MS}ms` }}
      />
    </span>
  );
}
