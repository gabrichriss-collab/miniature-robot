/**
 * Menymerke for mobil og nettbrett.
 *
 * LUKKET:      │          AAPEN:      ╲   ╱
 *          ────┼────                    ╳
 *              │                      ╱   ╲
 *
 * Hviletilstanden er et PLUSS: én vannrett og én loddrett strek som
 * krysser hverandre noeyaktig i midten. Ikke en hamburger, ikke én
 * enkelt strek, ikke et minus.
 *
 * Begge strekene er SAMME element med samme lengde — den loddrette er
 * bare den vannrette rotert 90 grader. Det er derfor de er nøyaktig like
 * lange og møtes presist i sentrum: det finnes bare ett mål, ikke to som
 * kan komme ut av takt.
 *
 * Ved aapning legges 45 grader til BEGGE strekene. Plusset roterer da
 * som én figur over til et kryss, uten at noe bytter plass eller
 * stoerrelse. Det er de samme to elementene hele veien — ingen
 * utskifting av ikoner — og bevegelsen reverseres noeyaktig ved lukking.
 *
 * Merk: dette erstatter den forrige loesningen, der to vannrette streker
 * laa oppaa hverandre og leste som én linje i hvile. Den geometrien
 * finnes ikke lenger.
 */
const DURATION_MS = 800;

/** Synlig strek. 42 px ligger midt i det oppgitte spennet 38–48 px. */
const STROKE_LENGTH_PX = 42;

export default function MenuMark({ open }: { open: boolean }) {
  // Begge strekene tegnes vannrett og sentreres i boksen. Rotasjonen
  // skjer om deres eget midtpunkt, som dermed er boksens midtpunkt —
  // derfor treffer krysningen alltid sentrum.
  const stroke =
    "absolute left-1/2 top-1/2 block bg-current transition-transform ease-menu motion-reduce:transition-none motion-reduce:duration-0";

  const base: React.CSSProperties = {
    width: `${STROKE_LENGTH_PX}px`,
    height: "1.25px",
    marginLeft: `-${STROKE_LENGTH_PX / 2}px`,
    marginTop: "-0.625px",
    transitionDuration: `${DURATION_MS}ms`
  };

  return (
    // 44 x 44 px trykkfelt rundt et 42 px merke. Ingen ramme, ingen
    // flate, ingen sirkel — boksen er usynlig.
    <span className="relative block h-11 w-11">
      {/* Vannrett strek: 0 grader lukket, 45 grader aapen. */}
      <span
        aria-hidden
        className={stroke}
        style={{ ...base, transform: `rotate(${open ? 45 : 0}deg)` }}
      />
      {/* Loddrett strek: samme strek rotert 90 grader, saa 90 lukket og
          135 aapen. Forskjellen paa de to er konstant 90 grader i begge
          tilstander, altsaa alltid vinkelrett. */}
      <span
        aria-hidden
        className={stroke}
        style={{ ...base, transform: `rotate(${open ? 135 : 90}deg)` }}
      />
    </span>
  );
}
