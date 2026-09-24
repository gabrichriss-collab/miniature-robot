/**
 * Utviklingsstripe — ligger rett under hero-en paa forsiden.
 *
 * Tidligere var dette en fast stripe paa 32 px helt oeverst paa ALLE
 * sider, over headeren. Den er flyttet ut av layouten og inn i flyten
 * etter hero-en, og finnes naa ett sted.
 *
 * Flat og grafisk med vilje: hero-en har glass og korn, stripen har
 * ingen av delene. Den er skillet mellom det atmosfaeriske fotoet og det
 * rolige, kremfargede innholdet under.
 *
 * SOEMLOES LOEKKE
 * Sporet inneholder 2 x REPEAT like enheter paa rad. Animasjonen flytter
 * sporet fra 0 til -50 %, altsaa noeyaktig én halvdel. Fordi de to
 * halvdelene er identiske, ser posisjonen ved -50 % ut akkurat som ved 0,
 * og loekka starter paa nytt uten synlig hopp. Hver enhet baerer sin egen
 * avstand paa begge sider av skillemerket, saa overgangen mellom
 * halvdelene har samme luft som alle andre overganger.
 *
 * REPEAT = 10 gir en halvdel paa ca. 4 300 px ved stoerste skriftgrad —
 * bredere enn en 4K-skjerm, saa det aldri oppstaar et tomt felt.
 *
 * FART
 * Skriftgraden foelger viewporten via clamp(), og dermed gjoer ogsaa
 * enhetsbredden det. Med fast varighet blir farten derfor lik maalt i
 * TEGN per sekund paa alle skjermer: teksten er stoerre paa desktop, men
 * beveger seg proporsjonalt. Varigheten staar i globals.css (.ticker).
 *
 * TILGJENGELIGHET
 * - Rulleteksten er aria-hidden; skjermlesere faar meldingen én gang via
 *   et sr-only-avsnitt i stedet for 20 ganger.
 * - WCAG 2.2.2 (Pause, Stop, Hide, nivå A) krever at tekst som beveger
 *   seg automatisk i mer enn 5 sekunder kan stoppes. prefers-reduced-
 *   motion er en systeminnstilling og oppfyller ikke det alene. Hele
 *   stripen er derfor en usynlig avkrysningsboks: trykk eller klikk hvor
 *   som helst stopper den, et nytt trykk starter den igjen, og tastatur
 *   kan tabbe til den. Musepeker over stripen pauser ogsaa, men bare paa
 *   enheter med ekte hover — mobiler beholder :hover etter et trykk, og
 *   da ville stripen aldri startet igjen. Ingenting av dette endrer
 *   utseendet.
 * - Ved prefers-reduced-motion: reduce fjernes sporet helt, og meldingen
 *   vises statisk og sentrert.
 */
const MESSAGE = "Nettsiden er under utvikling";
const REPEAT = 10;
/* Enhetsbredden rundes opp til hele piksler. Tekst (28 tegn x 0,8 em i
   monospace) + skillemerke = ca. 28,05 em; 28,1 em gir litt margin.
   Uten avrunding blir halvdelen f.eks. 3508,59 px, og glyfene i andre
   halvdel rastreres paa en annen subpikselfase enn i foerste — et svakt
   kantflimmer i det loekka starter paa nytt. Med hele piksler er de to
   bildene pikselidentiske. Nettlesere uten round() ignorerer verdien og
   faller tilbake til naturlig bredde (geometrisk fortsatt soemloes). */
const UNIT = "round(up, 28.1em, 1px)";

function Unit() {
  return (
    <span className="flex shrink-0 items-center" style={{ minWidth: UNIT }}>
      <span>{MESSAGE}</span>
      {/* Skillemerke: en liten rombe i strek, samme tynne linjespraak som
          resten av merkene paa nettstedet. Tegnet i CSS, ikke som tegn,
          saa det ser likt ut uavhengig av hvilken font som faller inn.
          Luften rundt ligger i et fleksibelt felt, saa restpikselen fra
          avrundingen fordeles likt paa begge sider av romben. */}
      <span aria-hidden className="flex flex-1 justify-center px-[2.6em]">
        <span className="inline-block h-[0.4em] w-[0.4em] rotate-45 border border-current opacity-60" />
      </span>
    </span>
  );
}

export default function UnderConstructionBanner() {
  return (
    <div
      className="group relative flex h-12 items-center overflow-hidden bg-moss font-mono uppercase tracking-[0.2em] text-bone md:h-14"
      style={{ fontSize: "clamp(0.78rem, 0.7rem + 0.35vw, 1rem)" }}
    >
      {/* Meldingen én gang for skjermlesere. Ved redusert bevegelse blir
          den synlig og sentrert. pl-[0.2em] veier opp for sporingen som
          ellers henger etter siste bokstav og skyver teksten mot venstre. */}
      <p className="sr-only motion-reduce:not-sr-only motion-reduce:w-full motion-reduce:pl-[0.2em] motion-reduce:text-center">
        {MESSAGE}
      </p>

      {/* Pause-mekanisme (WCAG 2.2.2). Hele stripen er etiketten. */}
      <input
        id="utvikling-pause"
        type="checkbox"
        className="peer sr-only motion-reduce:hidden"
      />
      <label
        htmlFor="utvikling-pause"
        className="absolute inset-0 z-10 cursor-pointer motion-reduce:hidden"
      >
        <span className="sr-only">Stopp rulletekst</span>
      </label>
      {/* Fokusmarkering for tastatur, vises kun ved :focus-visible. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 hidden ring-1 ring-inset ring-bone/60 peer-focus-visible:block"
      />

      <div
        aria-hidden
        className="ticker flex w-max shrink-0 [@media(hover:hover)]:group-hover:[animation-play-state:paused] peer-checked:[animation-play-state:paused] motion-reduce:hidden"
      >
        {Array.from({ length: REPEAT * 2 }, (_, i) => (
          <Unit key={i} />
        ))}
      </div>
    </div>
  );
}
