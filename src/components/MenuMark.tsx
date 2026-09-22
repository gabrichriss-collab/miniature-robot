/**
 * Menymerke — tynt pluss som roterer til kryss naar menyen aapnes.
 *
 * Samme formspraak som SliderArrow: tynne streker, ingen sirkel, ingen
 * flate, ingen ramme. Et arkitektonisk passmerke, ikke et app-ikon.
 *
 * PLUSS og KRYSS er den SAMME tegningen. De to strekene staar fast i
 * forhold til hverandre, og hele merket roteres 45 grader. Det er derfor
 * de aldri kan komme i utakt: det finnes bare én geometri, ikke to
 * tilstander som maa holdes synkronisert.
 *
 * vectorEffect="non-scaling-stroke" laaser streken til 1,25 px uansett
 * hvordan merket skaleres — ellers ville den blitt tynnere enn 1 px og
 * forsvunnet paa mobilskjermer.
 *
 * Fargen arves (stroke="currentColor"), saa merket foelger headeren:
 * bone over hero-en, ink over de kremfargede flatene. Ingen egen farge.
 *
 * Butt-hetter (standard) gir flate, presise endepunkter. SliderArrow
 * bruker runde hetter fordi pilhodet maa skjoetes mykt mot stammen; her
 * er flate ender det riktige for et passmerke.
 */
export default function MenuMark({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 30 30"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      className={`h-[30px] w-[30px] transition-transform duration-300 ease-swoop motion-reduce:transition-none ${
        open ? "rotate-45" : ""
      }`}
    >
      <path d="M0 15H30" vectorEffect="non-scaling-stroke" />
      <path d="M15 0V30" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
